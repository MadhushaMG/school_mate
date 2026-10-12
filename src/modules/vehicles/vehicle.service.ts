import { prisma } from '../../config/prisma';

export interface CreateVehicleDTO {
  vehicleNumber: string;
  model: string;
  vehicleType: 'VAN' | 'MINI_BUS' | 'BUS';
  totalSeats: number;
  hasAC: boolean;
  photoUrls?: string[];
  route?: Omit<CreateRouteDTO, 'vehicleId'>;
}

export interface CreateRouteDTO {
  vehicleId: string;
  title: string;
  startTown: string;
  endTown: string;
  schoolsCovered: string[];
  morningStartTime: string;
  afternoonReturnTime: string;
  minMonthlyFee: number;
  maxMonthlyFee: number;
  waypointsJson?: string;
}

export class VehicleService {
  static async createVehicle(driverUserId: string, data: CreateVehicleDTO) {
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: driverUserId },
    });

    if (!driverProfile) {
      throw new Error('Driver profile not found. Please register as a driver.');
    }

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vehicleNumber: data.vehicleNumber },
    });

    if (existingVehicle) {
      throw new Error('A vehicle with this plate number is already registered.');
    }

    return prisma.vehicle.create({
      data: {
        driverProfileId: driverProfile.id,
        vehicleNumber: data.vehicleNumber,
        model: data.model,
        vehicleType: data.vehicleType,
        totalSeats: data.totalSeats,
        availableSeats: data.totalSeats, // Initially all seats are available
        hasAC: data.hasAC,
        photoUrls: data.photoUrls || [],
        ...(data.route ? { routes: { create: data.route } } : {}),
      },
      include: { routes: true },
    });
  }

  static async getDriverVehicles(driverUserId: string) {
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: driverUserId },
    });

    if (!driverProfile) {
      throw new Error('Driver profile not found.');
    }

    return prisma.vehicle.findMany({
      where: { driverProfileId: driverProfile.id },
      include: {
        routes: true,
        enrollments: {
          include: {
            child: {
              include: {
                parent: {
                  select: { fullName: true, phoneNumber: true },
                },
              },
            },
          },
        },
      },
    });
  }

  static async addRoute(driverUserId: string, data: CreateRouteDTO) {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: data.vehicleId,
        driverProfile: {
          userId: driverUserId,
        },
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found or you do not have permission to manage this vehicle.');
    }

    return prisma.route.create({
      data: {
        vehicleId: data.vehicleId,
        title: data.title,
        startTown: data.startTown,
        endTown: data.endTown,
        schoolsCovered: data.schoolsCovered,
        morningStartTime: data.morningStartTime,
        afternoonReturnTime: data.afternoonReturnTime,
        minMonthlyFee: data.minMonthlyFee,
        maxMonthlyFee: data.maxMonthlyFee,
        waypointsJson: data.waypointsJson || null,
      },
    });
  }
}
