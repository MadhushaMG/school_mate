import { prisma } from '../../config/prisma';

export interface SearchVehiclesQuery {
  school?: string;
  town?: string;
  onlyWithSeats?: boolean;
}

export interface RequestEnrollmentDTO {
  childId: string;
  vehicleId: string;
  parentNotes?: string;
}

export interface RespondEnrollmentDTO {
  enrollmentId: string;
  status: 'ACCEPTED' | 'REJECTED';
  monthlyFee?: number;
  pickupSequenceIndex?: number;
}

export class MarketplaceService {
  /**
   * Search for vans and buses in the marketplace
   */
  static async searchVehicles(query: SearchVehiclesQuery) {
    const where: any = {};

    if (query.onlyWithSeats) {
      where.availableSeats = { gt: 0 };
    }

    if (query.school || query.town) {
      where.routes = {
        some: {
          ...(query.school
            ? {
                schoolsCovered: {
                  hasSome: [query.school],
                },
              }
            : {}),
          ...(query.town
            ? {
                OR: [
                  { startTown: { contains: query.town, mode: 'insensitive' } },
                  { endTown: { contains: query.town, mode: 'insensitive' } },
                  { title: { contains: query.town, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
      };
    }

    return prisma.vehicle.findMany({
      where,
      include: {
        driverProfile: {
          include: {
            user: {
              select: {
                fullName: true,
                phoneNumber: true,
                avatarUrl: true,
              },
            },
          },
        },
        routes: true,
      },
      orderBy: {
        availableSeats: 'desc',
      },
    });
  }

  /**
   * Get single vehicle listing details
   */
  static async getVehicleDetails(vehicleId: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
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
    });

    if (!vehicle) {
      throw new Error('Vehicle not found.');
    }

    return vehicle;
  }

  /**
   * Parent requests to join a vehicle with a child
   */
  static async requestEnrollment(parentId: string, data: RequestEnrollmentDTO) {
    // Validate child belongs to this parent
    const child = await prisma.child.findFirst({
      where: { id: data.childId, parentId },
    });

    if (!child) {
      throw new Error('Child not found or unauthorized.');
    }

    // Validate vehicle exists and has free seats
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      include: { driverProfile: { include: { user: true } } },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found.');
    }

    if (!vehicle.driverProfile.isVerified) {
      throw new Error('This driver is awaiting account verification and cannot accept enrollment requests yet.');
    }

    if (vehicle.availableSeats <= 0) {
      throw new Error('This vehicle has no available seats remaining.');
    }

    const activeEnrollment = await prisma.enrollment.findFirst({
      where: {
        childId: data.childId,
        status: { in: ['PENDING', 'ACCEPTED'] },
        vehicleId: { not: data.vehicleId },
      },
    });
    if (activeEnrollment) {
      throw new Error('This child already has a pending request or accepted seat on another vehicle.');
    }

    // Check if an enrollment already exists
    const existing = await prisma.enrollment.findUnique({
      where: {
        childId_vehicleId: {
          childId: data.childId,
          vehicleId: data.vehicleId,
        },
      },
    });

    if (existing) {
      if (existing.status === 'PENDING') {
        throw new Error('You already have a pending request for this vehicle.');
      }
      if (existing.status === 'ACCEPTED') {
        throw new Error('This child is already enrolled in this vehicle.');
      }
    }

    const enrollment = await prisma.enrollment.upsert({
      where: {
        childId_vehicleId: {
          childId: data.childId,
          vehicleId: data.vehicleId,
        },
      },
      create: {
        childId: data.childId,
        vehicleId: data.vehicleId,
        status: 'PENDING',
        parentNotes: data.parentNotes || null,
      },
      update: {
        status: 'PENDING',
        parentNotes: data.parentNotes || null,
      },
    });

    // Create notification for driver
    await prisma.notification.create({
      data: {
        userId: vehicle.driverProfile.userId,
        title: 'New Enrollment Request',
        message: `${child.fullName} applied to join ${vehicle.vehicleNumber}.`,
        type: 'ENROLLMENT_REQUEST',
        dataJson: JSON.stringify({ enrollmentId: enrollment.id, childId: child.id }),
      },
    });

    return enrollment;
  }

  /**
   * Driver gets all pending & active enrollment requests for their vehicles
   */
  static async getDriverRequests(driverUserId: string) {
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: driverUserId },
    });

    if (!driverProfile) {
      throw new Error('Driver profile not found.');
    }

    return prisma.enrollment.findMany({
      where: {
        vehicle: {
          driverProfileId: driverProfile.id,
        },
      },
      include: {
        child: {
          include: {
            parent: {
              select: { fullName: true, phoneNumber: true, email: true },
            },
          },
        },
        vehicle: {
          select: { id: true, vehicleNumber: true, model: true, availableSeats: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Driver responds to enrollment (Accept / Reject)
   */
  static async respondEnrollment(driverUserId: string, data: RespondEnrollmentDTO) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: data.enrollmentId },
      include: {
        vehicle: {
          include: {
            driverProfile: true,
          },
        },
        child: {
          include: {
            parent: true,
          },
        },
      },
    });

    if (!enrollment || enrollment.vehicle.driverProfile.userId !== driverUserId) {
      throw new Error('Enrollment request not found or unauthorized.');
    }

    if (enrollment.status !== 'PENDING') {
      throw new Error('This enrollment request has already been resolved.');
    }

    if (data.status === 'ACCEPTED') {
      const updatedEnrollment = await prisma.$transaction(async (transaction: any) => {
        const claimedEnrollment = await transaction.enrollment.updateMany({
          where: { id: data.enrollmentId, status: 'PENDING' },
          data: {
            status: 'ACCEPTED',
            monthlyFee: data.monthlyFee ?? null,
            pickupSequenceIndex: data.pickupSequenceIndex ?? 0,
          },
        });

        if (claimedEnrollment.count !== 1) {
          throw new Error('This enrollment request has already been resolved.');
        }

        const reservedSeat = await transaction.vehicle.updateMany({
          where: { id: enrollment.vehicleId, availableSeats: { gt: 0 } },
          data: { availableSeats: { decrement: 1 } },
        });

        if (reservedSeat.count !== 1) {
          throw new Error('No available seats left in this vehicle to accept this student.');
        }

        return transaction.enrollment.findUniqueOrThrow({
          where: { id: data.enrollmentId },
        });
      });

      // Notify parent
      await prisma.notification.create({
        data: {
          userId: enrollment.child.parentId,
          title: 'Enrollment Accepted! 🎉',
          message: `Your request for ${enrollment.child.fullName} on ${enrollment.vehicle.vehicleNumber} was accepted! Monthly fee: Rs. ${data.monthlyFee || 'Agreed'}.`,
          type: 'ENROLLMENT_ACCEPTED',
          dataJson: JSON.stringify({ enrollmentId: enrollment.id }),
        },
      });

      return updatedEnrollment;
    } else {
      const updated = await prisma.enrollment.updateMany({
        where: { id: data.enrollmentId, status: 'PENDING' },
        data: { status: 'REJECTED' },
      });

      if (updated.count !== 1) {
        throw new Error('This enrollment request has already been resolved.');
      }

      await prisma.notification.create({
        data: {
          userId: enrollment.child.parentId,
          title: 'Enrollment Status Update',
          message: `Your request for ${enrollment.child.fullName} on ${enrollment.vehicle.vehicleNumber} could not be accepted at this time.`,
          type: 'ENROLLMENT_REJECTED',
          dataJson: JSON.stringify({ enrollmentId: enrollment.id }),
        },
      });

      return prisma.enrollment.findUniqueOrThrow({ where: { id: data.enrollmentId } });
    }
  }
}
