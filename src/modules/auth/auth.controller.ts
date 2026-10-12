import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(9, 'Valid phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['PARENT', 'DRIVER']),
  licenseNumber: z.string().optional(),
});

const loginSchema = z.object({
  identifier: z.string().min(1, 'Phone number or email is required'),
  password: z.string().min(1, 'Password is required'),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetConfirmSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, 'Reset code must contain 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phoneNumber: z.string().min(9).optional(),
  email: z.string().email().nullable().optional(),
  homeAddress: z.string().max(300).nullable().optional(),
  emergencyContact: z.string().max(100).nullable().optional(),
  licenseNumber: z.string().max(100).nullable().optional(),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await AuthService.register({
        ...validated,
        email: validated.email || undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || error.message,
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const profile = await AuthService.getProfile(req.user.userId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updatePushToken(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { pushToken } = req.body;
      if (!pushToken) {
        return res.status(400).json({ success: false, message: 'pushToken is required' });
      }

      await AuthService.updatePushToken(req.user.userId, pushToken);
      res.status(200).json({ success: true, message: 'Push token updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const profile = await AuthService.updateProfile(req.user!.userId, validated);
      res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      const message = error.issues?.[0]?.message || error.message;
      res.status(400).json({ success: false, message });
    }
  }

  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = passwordResetRequestSchema.parse(req.body);
      await AuthService.requestPasswordReset(email);
      res.status(200).json({
        success: true,
        message: 'If an account exists for that email, a reset code has been sent.',
      });
    } catch (error: any) {
      const message = error.issues?.[0]?.message || error.message;
      res.status(message?.includes('not configured') || message?.includes('could not be delivered') ? 503 : 400)
        .json({ success: false, message });
    }
  }

  static async confirmPasswordReset(req: Request, res: Response) {
    try {
      const validated = passwordResetConfirmSchema.parse(req.body);
      await AuthService.confirmPasswordReset(validated);
      res.status(200).json({ success: true, message: 'Password reset successfully.' });
    } catch (error: any) {
      const message = error.issues?.[0]?.message || error.message;
      res.status(message === 'Invalid or expired reset code.' ? 400 : 400)
        .json({ success: false, message });
    }
  }
}
