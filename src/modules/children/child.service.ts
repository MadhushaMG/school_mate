import { prisma } from '../../config/prisma';

export interface CreateChildDTO {
  fullName: string;
  schoolName: string;
  grade: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropAddress?: string;
  dropLat?: number;
  dropLng?: number;
}

export class ChildService {
  static async createChild(parentId: string, data: CreateChildDTO) {
    return prisma.child.create({
      data: {
        parentId,
        fullName: data.fullName,
        schoolName: data.schoolName,
        grade: data.grade,
        pickupAddress: data.pickupAddress,
        pickupLat: data.pickupLat,
        pickupLng: data.pickupLng,
        dropAddress: data.dropAddress || null,
        dropLat: data.dropLat || null,
        dropLng: data.dropLng || null,
      },
    });
  }

  static async getParentChildren(parentId: string) {
    return prisma.child.findMany({
      where: { parentId },
      include: {
        enrollments: {
          include: {
            vehicle: {
              include: {
                driverProfile: {
                  include: {
                    user: {
                      select: { fullName: true, phoneNumber: true, avatarUrl: true },
                    },
                  },
                },
                routes: true,
              },
            },
          },
        },
      },
    });
  }

  static async getChildById(parentId: string, childId: string) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId },
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
                routes: true,
              },
            },
          },
        },
      },
    });

    if (!child) {
      throw new Error('Child not found or access denied.');
    }

    return child;
  }
}
