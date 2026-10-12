import { prisma } from '../../config/prisma';
import { emitTripEvent, emitTripCompleted } from '../../sockets/tracking.socket';

export interface MarkAttendanceDTO {
  childId: string;
  tripType: 'MORNING_PICKUP' | 'AFTERNOON_DROP';
  date: string; // YYYY-MM-DD
  status: 'COMING' | 'NOT_COMING';
  parentNotes?: string;
}

export interface StartTripDTO {
  vehicleId: string;
  tripType: 'MORNING_PICKUP' | 'AFTERNOON_DROP';
}

export interface UpdateBoardingDTO {
  attendanceId: string;
  boardingStatus: 'PENDING' | 'PICKED_UP' | 'DROPPED' | 'SKIPPED';
  isAutoGeofence?: boolean;
}

export interface TripBroadcastDTO {
  vehicleId: string;
  title: string;
  message: string;
}

export class TripService {
  /**
   * Driver starts a daily trip.
   * Pulls all accepted enrollments and creates TripAttendance records.
   */
  static async startTrip(driverUserId: string, data: StartTripDTO) {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: data.vehicleId,
        driverProfile: { userId: driverUserId },
      },
      include: {
        enrollments: {
          where: { status: 'ACCEPTED' },
          include: { child: true },
          orderBy: { pickupSequenceIndex: 'asc' },
        },
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found or unauthorized.');
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const tripId = await prisma.$transaction(async (transaction: any) => {
      const currentTrip = await transaction.dailyTrip.findFirst({
        where: {
          vehicleId: vehicle.id,
          tripType: data.tripType,
          tripDate: todayDate,
          status: 'IN_PROGRESS',
        },
      });
      if (currentTrip) return currentTrip.id;

      const scheduledTrip = await transaction.dailyTrip.findFirst({
        where: {
          vehicleId: vehicle.id,
          tripType: data.tripType,
          tripDate: todayDate,
          status: 'SCHEDULED',
        },
      });
      const trip = scheduledTrip
        ? await transaction.dailyTrip.update({
            where: { id: scheduledTrip.id },
            data: { status: 'IN_PROGRESS', startedAt: new Date() },
          })
        : await transaction.dailyTrip.create({
            data: {
              vehicleId: vehicle.id,
              tripType: data.tripType,
              tripDate: todayDate,
              status: 'IN_PROGRESS',
              startedAt: new Date(),
            },
          });

      await Promise.all(vehicle.enrollments.map((enrollment: any) =>
        transaction.tripAttendance.upsert({
          where: {
            tripId_childId: { tripId: trip.id, childId: enrollment.childId },
          },
          create: {
            tripId: trip.id,
            childId: enrollment.childId,
            status: 'COMING',
            boardingStatus: 'PENDING',
          },
          update: {},
        })
      ));

      return trip.id;
    });

    return this.getTripDetails(tripId);
  }

  /**
   * Fetch complete trip information with student checklist
   */
  static async getTripDetails(tripId: string) {
    const trip = await prisma.dailyTrip.findUnique({
      where: { id: tripId },
      include: {
        vehicle: {
          include: {
            driverProfile: {
              include: {
                user: { select: { fullName: true, phoneNumber: true } },
              },
            },
          },
        },
        attendances: {
          include: {
            child: {
              include: {
                parent: { select: { fullName: true, phoneNumber: true, pushToken: true } },
              },
            },
          },
          orderBy: {
            child: {
              fullName: 'asc',
            },
          },
        },
      },
    });

    if (!trip) {
      throw new Error('Trip not found.');
    }

    return trip;
  }

  static async getTripDetailsForUser(userId: string, role: string, tripId: string) {
    const trip = await prisma.dailyTrip.findFirst({
      where: {
        id: tripId,
        OR: [
          { vehicle: { driverProfile: { userId } } },
          { attendances: { some: { child: { parentId: userId } } } },
          ...(role === 'ADMIN' ? [{}] : []),
        ],
      },
      select: { id: true },
    });

    if (!trip) throw new Error('Trip not found or unauthorized.');
    return this.getTripDetails(trip.id);
  }

  /**
   * Parent marks attendance (Coming or Not Coming)
   */
  static async setParentAttendance(parentId: string, data: MarkAttendanceDTO) {
    const child = await prisma.child.findFirst({
      where: { id: data.childId, parentId },
      include: {
        enrollments: {
          where: { status: 'ACCEPTED' },
          include: {
            vehicle: {
              select: { driverProfile: { select: { userId: true } } },
            },
          },
        },
      },
    });

    if (!child || child.enrollments.length === 0) {
      throw new Error('Child is not currently enrolled in any active vehicle.');
    }

    const vehicleId = child.enrollments[0].vehicleId;
    const tripDate = new Date(data.date);
    tripDate.setHours(0, 0, 0, 0);

    // Find or create daily trip for that date
    let trip = await prisma.dailyTrip.findFirst({
      where: {
        vehicleId,
        tripType: data.tripType,
        tripDate,
      },
    });

    if (!trip) {
      trip = await prisma.dailyTrip.create({
        data: {
          vehicleId,
          tripType: data.tripType,
          tripDate,
          status: 'SCHEDULED',
        },
      });
    }

    // Upsert TripAttendance record
    const attendance = await prisma.tripAttendance.upsert({
      where: {
        tripId_childId: {
          tripId: trip.id,
          childId: child.id,
        },
      },
      create: {
        tripId: trip.id,
        childId: child.id,
        status: data.status,
        boardingStatus: data.status === 'NOT_COMING' ? 'SKIPPED' : 'PENDING',
        parentNotes: data.parentNotes || null,
      },
      update: {
        status: data.status,
        boardingStatus: data.status === 'NOT_COMING' ? 'SKIPPED' : 'PENDING',
        parentNotes: data.parentNotes || null,
      },
    });

    if (data.parentNotes?.trim()) {
      await prisma.notification.create({
        data: {
          userId: child.enrollments[0].vehicle.driverProfile.userId,
          title: 'Parent pickup note',
          message: `${child.fullName}: ${data.parentNotes.trim()}`,
          type: 'PARENT_PICKUP_NOTE',
          dataJson: JSON.stringify({ childId: child.id, tripId: trip.id }),
        },
      });
    }

    return attendance;
  }

  /**
   * Driver marks a child as picked up, dropped, or skipped (or called by auto-geofence)
   */
  static async updateBoardingStatus(driverUserId: string, data: UpdateBoardingDTO) {
    const attendance = await prisma.tripAttendance.findUnique({
      where: { id: data.attendanceId },
      include: {
        trip: {
          include: {
            vehicle: {
              include: { driverProfile: true },
            },
          },
        },
        child: {
          include: { parent: true },
        },
      },
    });

    if (!attendance || attendance.trip.vehicle.driverProfile.userId !== driverUserId) {
      throw new Error('Attendance record not found or unauthorized.');
    }

    const now = new Date();
    const isPickedUp = data.boardingStatus === 'PICKED_UP';
    const isDropped = data.boardingStatus === 'DROPPED';

    const updated = await prisma.tripAttendance.update({
      where: { id: data.attendanceId },
      data: {
        boardingStatus: data.boardingStatus,
        isAutoGeofence: data.isAutoGeofence || false,
        boardedAt: isPickedUp ? now : attendance.boardedAt,
        droppedAt: isDropped ? now : attendance.droppedAt,
      },
    });

    // Notify Parent
    if (isPickedUp || isDropped) {
      const title = isPickedUp ? 'Child Picked Up' : 'Child Dropped Off';
      const msg = isPickedUp
        ? `${attendance.child.fullName} was picked up ${data.isAutoGeofence ? '(Auto-detected)' : ''}.`
        : `${attendance.child.fullName} has arrived safely and was dropped off.`;

      await prisma.notification.create({
        data: {
          userId: attendance.child.parentId,
          title,
          message: msg,
          type: isPickedUp ? 'STUDENT_PICKED_UP' : 'STUDENT_DROPPED',
          dataJson: JSON.stringify({ childId: attendance.childId, tripId: attendance.tripId }),
        },
      });

      emitTripEvent(attendance.tripId, isPickedUp ? 'student_picked_up' : 'student_dropped', {
        tripId: attendance.tripId,
        attendanceId: attendance.id,
        childId: attendance.childId,
        childName: attendance.child.fullName,
        isAutoGeofence: data.isAutoGeofence || false,
        [isPickedUp ? 'boardedAt' : 'droppedAt']: now.toISOString(),
      });
    }

    emitTripEvent(attendance.tripId, 'boarding_status_updated', {
      tripId: attendance.tripId,
      attendanceId: attendance.id,
      childId: attendance.childId,
      boardingStatus: data.boardingStatus,
    });

    return updated;
  }

  /**
   * Driver ends the trip
   */
  static async completeTrip(driverUserId: string, tripId: string) {
    const trip = await prisma.dailyTrip.findUnique({
      where: { id: tripId },
      include: { vehicle: { include: { driverProfile: true } } },
    });

    if (!trip || trip.vehicle.driverProfile.userId !== driverUserId) {
      throw new Error('Trip not found or unauthorized.');
    }

    const now = new Date();

    // In morning pickup trips (or any trip with students on board), safely transition
    // picked up students to DROPPED at arrival and notify parents.
    const inTransitStudents = await prisma.tripAttendance.findMany({
      where: {
        tripId,
        boardingStatus: 'PICKED_UP',
      },
      include: {
        child: { select: { id: true, fullName: true, parentId: true } },
      },
    });

    if (inTransitStudents.length > 0) {
      await prisma.tripAttendance.updateMany({
        where: {
          tripId,
          boardingStatus: 'PICKED_UP',
        },
        data: {
          boardingStatus: 'DROPPED',
          droppedAt: now,
        },
      });

      for (const att of inTransitStudents) {
        await prisma.notification.create({
          data: {
            userId: att.child.parentId,
            title: trip.tripType === 'MORNING_PICKUP' ? 'Arrived at School' : 'Arrived at Drop-off',
            message: `${att.child.fullName} arrived safely and was dropped off.`,
            type: 'STUDENT_DROPPED',
            dataJson: JSON.stringify({ childId: att.child.id, tripId }),
          },
        });
      }
    }

    const completed = await prisma.dailyTrip.update({
      where: { id: tripId },
      data: {
        status: 'COMPLETED',
        completedAt: now,
      },
    });

    emitTripCompleted(tripId);

    return completed;
  }

  static async broadcastToParents(driverUserId: string, data: TripBroadcastDTO) {
    const trip = await prisma.dailyTrip.findFirst({
      where: {
        vehicleId: data.vehicleId,
        status: 'IN_PROGRESS',
        vehicle: { driverProfile: { userId: driverUserId } },
      },
      include: {
        vehicle: {
          include: {
            enrollments: {
              where: { status: 'ACCEPTED' },
              include: { child: { select: { parentId: true } } },
            },
          },
        },
      },
    });

    if (!trip) throw new Error('Active trip not found for this vehicle.');

    const parentIds = [...new Set(trip.vehicle.enrollments.map((item: any) => item.child.parentId))];
    if (parentIds.length === 0) return { notifiedCount: 0 };

    const result = await prisma.notification.createMany({
      data: parentIds.map((userId) => ({
        userId,
        title: data.title,
        message: data.message,
        type: 'DRIVER_BROADCAST',
        dataJson: JSON.stringify({ tripId: trip.id, vehicleId: data.vehicleId }),
      })),
    });

    return { notifiedCount: result.count };
  }

  /**
   * Get today's active trip for a child (Parent view)
   */
  static async getActiveTripForChild(parentId: string, childId: string) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId },
      include: {
        enrollments: {
          where: { status: 'ACCEPTED' },
        },
      },
    });

    if (!child || child.enrollments.length === 0) {
      return null;
    }

    const vehicleId = child.enrollments[0].vehicleId;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    return prisma.dailyTrip.findFirst({
      where: {
        vehicleId,
        tripDate: todayDate,
        status: 'IN_PROGRESS',
      },
      include: {
        vehicle: {
          include: {
            driverProfile: {
              include: {
                user: { select: { fullName: true, phoneNumber: true } },
              },
            },
          },
        },
        attendances: {
          where: { childId },
        },
      },
    });
  }

  static async getActiveTripForVehicle(driverUserId: string, vehicleId: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, driverProfile: { userId: driverUserId } },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found or unauthorized.');
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const trip = await prisma.dailyTrip.findFirst({
      where: {
        vehicleId,
        tripDate: todayDate,
        status: 'IN_PROGRESS',
      },
      select: { id: true },
    });

    return trip ? this.getTripDetails(trip.id) : null;
  }
}
