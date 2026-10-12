import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';

export interface RegisterDTO {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  role: 'PARENT' | 'DRIVER';
  licenseNumber?: string;
}

export interface LoginDTO {
  identifier: string; // phoneNumber or email
  password: string;
}

export interface ConfirmPasswordResetDTO {
  email: string;
  code: string;
  password: string;
}

export interface UpdateProfileDTO {
  fullName?: string;
  phoneNumber?: string;
  email?: string | null;
  homeAddress?: string | null;
  emergencyContact?: string | null;
  licenseNumber?: string | null;
}

function getPhoneVariants(input: string): string[] {
  const cleaned = input.replace(/[\s\-\(\)\.]/g, '');
  const variants = new Set<string>([input.trim(), cleaned]);
  const noPlus = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
  variants.add(noPlus);

  if (noPlus.startsWith('94') && noPlus.length >= 11) {
    const raw = noPlus.slice(2);
    variants.add('0' + raw);
    variants.add(raw);
    variants.add('+' + noPlus);
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    const raw = cleaned.slice(1);
    variants.add(raw);
    variants.add('94' + raw);
    variants.add('+94' + raw);
  } else if (/^\d{9}$/.test(cleaned)) {
    variants.add('0' + cleaned);
    variants.add('94' + cleaned);
    variants.add('+94' + cleaned);
  }

  return Array.from(variants).filter(Boolean);
}

function canonicalizePhone(input: string): string {
  let cleaned = input.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+94')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('94') && cleaned.length === 11) {
    cleaned = '0' + cleaned.slice(2);
  } else if (/^\d{9}$/.test(cleaned)) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

export class AuthService {
  static async register(data: RegisterDTO) {
    const normalizedEmail = data.email?.trim().toLowerCase();
    const phoneVariants = getPhoneVariants(data.phoneNumber);
    const canonicalPhone = canonicalizePhone(data.phoneNumber);

    // Check if phone or email already registered
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: { in: phoneVariants } },
          { phoneNumber: data.phoneNumber },
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new Error('User with this phone number or email already exists.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        phoneNumber: canonicalPhone,
        email: normalizedEmail || null,
        password: hashedPassword,
        role: data.role,
        ...(data.role === 'DRIVER'
          ? {
              driverProfile: {
                create: {
                  licenseNumber: data.licenseNumber || null,
                },
              },
            }
          : {}),
      },
      include: {
        driverProfile: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, phoneNumber: user.phoneNumber },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        driverProfileId: user.driverProfile?.id || null,
      },
      token,
    };
  }

  static async login(data: LoginDTO) {
    const isEmail = data.identifier.includes('@');
    const identifier = isEmail
      ? data.identifier.trim().toLowerCase()
      : data.identifier.trim();
    const phoneVariants = isEmail ? [] : getPhoneVariants(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(isEmail ? [{ email: identifier }] : []),
          ...(!isEmail
            ? [
                { phoneNumber: { in: phoneVariants } },
                { phoneNumber: identifier },
              ]
            : []),
        ],
      },
      include: {
        driverProfile: true,
      },
    });

    if (!user) {
      throw new Error('Invalid phone number/email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid phone number/email or password.');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, phoneNumber: user.phoneNumber },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        driverProfileId: user.driverProfile?.id || null,
      },
      token,
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        driverProfile: {
          include: {
            vehicles: {
              include: {
                routes: true,
              },
            },
          },
        },
        children: {
          include: {
            enrollments: {
              include: {
                vehicle: {
                  include: {
                    driverProfile: {
                      include: {
                        user: {
                          select: { fullName: true, phoneNumber: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }

  static async updatePushToken(userId: string, pushToken: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });
  }

  static async updateProfile(userId: string, data: UpdateProfileDTO) {
    const { licenseNumber, ...userData } = data;
    return prisma.$transaction(async (transaction: any) => {
      const user = await transaction.user.update({
        where: { id: userId },
        data: {
          ...userData,
          ...(userData.email !== undefined
            ? { email: userData.email?.trim().toLowerCase() || null }
            : {}),
        },
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          email: true,
          role: true,
          homeAddress: true,
          emergencyContact: true,
        },
      });

      if (licenseNumber !== undefined && user.role === 'DRIVER') {
        await transaction.driverProfile.updateMany({
          where: { userId },
          data: { licenseNumber },
        });
      }

      return user;
    });
  }

  static async requestPasswordReset(email: string) {
    if (!ENV.MAIL_HOST || !ENV.MAIL_USER || !ENV.MAIL_PASS || !ENV.MAIL_FROM) {
      throw new Error('Password recovery email is not configured on this server.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return;

    const code = randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.$transaction(async (transaction: any) => {
      await transaction.passwordResetCode.deleteMany({ where: { userId: user.id } });
      await transaction.passwordResetCode.create({
        data: { userId: user.id, codeHash, expiresAt },
      });
    });

    try {
      const transporter = nodemailer.createTransport({
        host: ENV.MAIL_HOST,
        port: ENV.MAIL_PORT,
        secure: ENV.MAIL_PORT === 465,
        auth: { user: ENV.MAIL_USER, pass: ENV.MAIL_PASS },
      });
      await transporter.sendMail({
        from: ENV.MAIL_FROM,
        to: normalizedEmail,
        subject: 'SchoolMate password reset code',
        text: `Your SchoolMate password reset code is ${code}. It expires in 15 minutes. If you did not request this, ignore this email.`,
      });
    } catch {
      await prisma.passwordResetCode.deleteMany({ where: { userId: user.id } });
      throw new Error('Password reset email could not be delivered. Check the server email configuration.');
    }
  }

  static async confirmPasswordReset(data: ConfirmPasswordResetDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.trim().toLowerCase() },
      select: { id: true },
    });
    if (!user) throw new Error('Invalid or expired reset code.');

    const resetCodes = await prisma.passwordResetCode.findMany({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    let matchingCodeId: string | undefined;
    for (const resetCode of resetCodes) {
      if (await bcrypt.compare(data.code, resetCode.codeHash)) {
        matchingCodeId = resetCode.id;
        break;
      }
    }
    if (!matchingCodeId) throw new Error('Invalid or expired reset code.');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    await prisma.$transaction(async (transaction: any) => {
      const consumed = await transaction.passwordResetCode.deleteMany({
        where: { id: matchingCodeId, userId: user.id, expiresAt: { gt: new Date() } },
      });
      if (consumed.count !== 1) throw new Error('Invalid or expired reset code.');
      await transaction.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      await transaction.passwordResetCode.deleteMany({ where: { userId: user.id } });
    });
  }
}
