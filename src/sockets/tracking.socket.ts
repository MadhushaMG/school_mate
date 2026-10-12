import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { ENV } from '../config/env';
import { isWithinGeofence, isWithinProximityAlert } from '../utils/geofence';

interface LocationUpdatePayload {
  tripId: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number; // km/h
}

interface TrackingUser {
  userId: string;
  role: 'PARENT' | 'DRIVER' | 'ADMIN';
}

let ioInstance: Server | null = null;

// In-memory set to prevent spamming proximity alerts multiple times per trip
const notifiedProximity = new Set<string>(); // key: `${tripId}_${childId}`

export function clearProximityCache(tripId: string) {
  for (const key of notifiedProximity) {
    if (key.startsWith(`${tripId}_`)) {
      notifiedProximity.delete(key);
    }
  }
}

export function emitTripEvent(tripId: string, event: string, data: any) {
  if (ioInstance) {
    ioInstance.to(`trip_${tripId}`).emit(event, data);
  }
}

export function emitTripCompleted(tripId: string) {
  if (ioInstance) {
    ioInstance.to(`trip_${tripId}`).emit('trip_completed', {
      tripId,
      timestamp: new Date().toISOString(),
    });
    clearProximityCache(tripId);
  }
}

export function setupTrackingSocket(io: Server) {
  ioInstance = io;
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== 'string' || !token) {
      next(new Error('Authentication required.'));
      return;
    }

    try {
      socket.data.user = jwt.verify(token, ENV.JWT_SECRET) as TrackingUser;
      next();
    } catch {
      next(new Error('Invalid or expired token.'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as TrackingUser;
    console.log(`[Socket] Authenticated client connected: ${socket.id}`);

    socket.on('join_trip', async (tripId: string) => {
      if (typeof tripId !== 'string' || !tripId) return;

      try {
        const trip = await prisma.dailyTrip.findFirst({
          where: {
            id: tripId,
            status: 'IN_PROGRESS',
            OR: [
              { vehicle: { driverProfile: { userId: user.userId } } },
              { attendances: { some: { child: { parentId: user.userId } } } },
              ...(user.role === 'ADMIN' ? [{}] : []),
            ],
          },
          select: { id: true },
        });

        if (!trip) return;
        await socket.join(`trip_${trip.id}`);
      } catch (error) {
        console.error('[Socket join error]', error);
      }
    });

    // Leave trip room
    socket.on('leave_trip', (tripId: string) => {
      socket.leave(`trip_${tripId}`);
      console.log(`[Socket] ${socket.id} left trip_${tripId}`);
    });

    // Driver location streaming
    socket.on('driver_location_update', async (data: LocationUpdatePayload) => {
      try {
        const { tripId, vehicleId, latitude, longitude, heading = 0, speed = 0 } = data;
        if (
          user.role !== 'DRIVER' ||
          !tripId ||
          !vehicleId ||
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          !Number.isFinite(heading) ||
          !Number.isFinite(speed)
        ) return;

        const trip = await prisma.dailyTrip.findFirst({
          where: {
            id: tripId,
            vehicleId,
            status: 'IN_PROGRESS',
            vehicle: { driverProfile: { userId: user.userId } },
          },
          select: { id: true },
        });
        if (!trip) return;

        await prisma.dailyTrip.update({
          where: { id: trip.id },
          data: {
            currentLat: latitude,
            currentLng: longitude,
            currentHeading: heading,
            currentSpeed: speed,
          },
        });

        io.to(`trip_${tripId}`).emit('location_updated', {
          tripId,
          vehicleId,
          latitude,
          longitude,
          heading,
          speed,
          timestamp: new Date().toISOString(),
        });

        // 3. AUTO-PICKUP GEOFENCE & PROXIMITY ENGINE
        const pendingAttendances = await prisma.tripAttendance.findMany({
          where: {
            tripId,
            status: 'COMING',
            boardingStatus: 'PENDING',
          },
          include: {
            child: true,
          },
        });

        const vehicleCoord = { latitude, longitude };

        for (const attendance of pendingAttendances) {
          const childCoord = {
            latitude: attendance.child.pickupLat,
            longitude: attendance.child.pickupLng,
          };

          // A. 1KM Proximity Notification
          const proximityKey = `${tripId}_${attendance.childId}`;
          if (!notifiedProximity.has(proximityKey) && isWithinProximityAlert(vehicleCoord, childCoord, 1000)) {
            notifiedProximity.add(proximityKey);

            await prisma.notification.create({
              data: {
                userId: attendance.child.parentId,
                title: 'School vehicle nearby',
                message: `The vehicle is within 1 km of ${attendance.child.fullName}'s pickup point.`,
                type: 'NEARBY_1KM',
                dataJson: JSON.stringify({ tripId, childId: attendance.childId }),
              },
            });

            io.to(`trip_${tripId}`).emit('proximity_alert', {
              tripId,
              childId: attendance.childId,
              childName: attendance.child.fullName,
              message: `Van is within 1km of ${attendance.child.fullName}'s pickup point!`,
            });
          }

          // B. Auto-Pickup Detection (Within 40m and slowed down < 15km/h)
          if (isWithinGeofence(vehicleCoord, childCoord, 40) && speed <= 15) {
            const now = new Date();

            const pickup = await prisma.tripAttendance.updateMany({
              where: {
                id: attendance.id,
                status: 'COMING',
                boardingStatus: 'PENDING',
              },
              data: {
                boardingStatus: 'PICKED_UP',
                isAutoGeofence: true,
                boardedAt: now,
              },
            });
            if (pickup.count !== 1) continue;

            await prisma.notification.create({
              data: {
                userId: attendance.child.parentId,
                title: 'Child picked up',
                message: `${attendance.child.fullName} was picked up.`,
                type: 'STUDENT_PICKED_UP',
                dataJson: JSON.stringify({ tripId, childId: attendance.childId }),
              },
            });

            // Emit live event to room for parent UI & driver UI update
            io.to(`trip_${tripId}`).emit('student_picked_up', {
              tripId,
              attendanceId: attendance.id,
              childId: attendance.childId,
              childName: attendance.child.fullName,
              isAutoGeofence: true,
              boardedAt: now.toISOString(),
            });

            console.log(`[Auto-Pickup] Auto-detected pickup for ${attendance.child.fullName} at trip ${tripId}`);
          }
        }

        // 4. AUTO-DROP GEOFENCE (for students who are currently PICKED_UP)
        const inTransitAttendances = await prisma.tripAttendance.findMany({
          where: {
            tripId,
            status: 'COMING',
            boardingStatus: 'PICKED_UP',
          },
          include: {
            child: true,
          },
        });

        for (const attendance of inTransitAttendances) {
          const dropCoord = {
            latitude: attendance.child.dropLat ?? attendance.child.pickupLat,
            longitude: attendance.child.dropLng ?? attendance.child.pickupLng,
          };

          if (isWithinGeofence(vehicleCoord, dropCoord, 40) && speed <= 15) {
            const now = new Date();
            const dropped = await prisma.tripAttendance.updateMany({
              where: {
                id: attendance.id,
                status: 'COMING',
                boardingStatus: 'PICKED_UP',
              },
              data: {
                boardingStatus: 'DROPPED',
                isAutoGeofence: true,
                droppedAt: now,
              },
            });
            if (dropped.count !== 1) continue;

            await prisma.notification.create({
              data: {
                userId: attendance.child.parentId,
                title: 'Child dropped off safely',
                message: `${attendance.child.fullName} arrived safely and was dropped off.`,
                type: 'STUDENT_DROPPED',
                dataJson: JSON.stringify({ tripId, childId: attendance.childId }),
              },
            });

            io.to(`trip_${tripId}`).emit('student_dropped', {
              tripId,
              attendanceId: attendance.id,
              childId: attendance.childId,
              childName: attendance.child.fullName,
              isAutoGeofence: true,
              droppedAt: now.toISOString(),
            });

            console.log(`[Auto-Drop] Auto-detected drop-off for ${attendance.child.fullName} at trip ${tripId}`);
          }
        }
      } catch (err: any) {
        console.error('[Socket update error]', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}
