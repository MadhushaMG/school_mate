import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';
import { z } from 'zod';

const routeDetailsSchema = z.object({
  title: z.string().min(2, 'Route title is required'),
  startTown: z.string().min(2, 'Start town is required'),
  endTown: z.string().min(2, 'End town is required'),
  schoolsCovered: z.array(z.string()).min(1, 'At least one school must be covered'),
  morningStartTime: z.string().min(1, 'Morning start time is required'),
  afternoonReturnTime: z.string().min(1, 'Afternoon return time is required'),
  minMonthlyFee: z.number().positive(),
  maxMonthlyFee: z.number().positive(),
  waypointsJson: z.string().optional(),
});

const createVehicleSchema = z.object({
  vehicleNumber: z.string().min(3, 'Vehicle number is required'),
  model: z.string().min(2, 'Model is required'),
  vehicleType: z.enum(['VAN', 'MINI_BUS', 'BUS']),
  totalSeats: z.number().int().positive('Total seats must be a positive number'),
  hasAC: z.boolean(),
  photoUrls: z.array(z.string()).optional(),
  route: routeDetailsSchema.optional(),
});

const createRouteSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  ...routeDetailsSchema.shape,
});

export class VehicleController {
  static async createVehicle(req: Request, res: Response) {
    try {
      const validated = createVehicleSchema.parse(req.body);
      const vehicle = await VehicleService.createVehicle(req.user!.userId, validated);
      res.status(201).json({ success: true, message: 'Vehicle added successfully', data: vehicle });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.issues?.[0]?.message || error.message });
    }
  }

  static async getMyVehicles(req: Request, res: Response) {
    try {
      const vehicles = await VehicleService.getDriverVehicles(req.user!.userId);
      res.status(200).json({ success: true, data: vehicles });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addRoute(req: Request, res: Response) {
    try {
      const validated = createRouteSchema.parse(req.body);
      const route = await VehicleService.addRoute(req.user!.userId, validated);
      res.status(201).json({ success: true, message: 'Route added successfully', data: route });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.issues?.[0]?.message || error.message });
    }
  }
}
