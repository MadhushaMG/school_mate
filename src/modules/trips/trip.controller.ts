import { Request, Response } from 'express';
import { TripService } from './trip.service';
import { z } from 'zod';

const markAttendanceSchema = z.object({
  childId: z.string().min(1, 'Child ID is required'),
  tripType: z.enum(['MORNING_PICKUP', 'AFTERNOON_DROP']),
  date: z.string().min(10, 'Date is required (YYYY-MM-DD)'),
  status: z.enum(['COMING', 'NOT_COMING']),
  parentNotes: z.string().optional(),
});

const startTripSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  tripType: z.enum(['MORNING_PICKUP', 'AFTERNOON_DROP']),
});

const updateBoardingSchema = z.object({
  attendanceId: z.string().min(1, 'Attendance ID is required'),
  boardingStatus: z.enum(['PENDING', 'PICKED_UP', 'DROPPED', 'SKIPPED']),
});

const broadcastSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  title: z.string().min(2).max(80),
  message: z.string().min(2).max(500),
});

export class TripController {
  static async startTrip(req: Request, res: Response) {
    try {
      const validated = startTripSchema.parse(req.body);
      const trip = await TripService.startTrip(req.user!.userId, validated);
      res.status(200).json({ success: true, message: 'Trip started successfully', data: trip });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.issues?.[0]?.message || error.message });
    }
  }

  static async getTripDetails(req: Request, res: Response) {
    try {
      const trip = await TripService.getTripDetailsForUser(
        req.user!.userId,
        req.user!.role,
        req.params.id as string
      );
      res.status(200).json({ success: true, data: trip });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async setParentAttendance(req: Request, res: Response) {
    try {
      const validated = markAttendanceSchema.parse(req.body);
      const attendance = await TripService.setParentAttendance(req.user!.userId, validated);
      res.status(200).json({
        success: true,
        message: `Attendance marked as ${validated.status}`,
        data: attendance,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.issues?.[0]?.message || error.message });
    }
  }

  static async updateBoarding(req: Request, res: Response) {
    try {
      const validated = updateBoardingSchema.parse(req.body);
      const result = await TripService.updateBoardingStatus(req.user!.userId, validated);
      res.status(200).json({ success: true, message: 'Boarding status updated', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.issues?.[0]?.message || error.message });
    }
  }

  static async completeTrip(req: Request, res: Response) {
    try {
      const result = await TripService.completeTrip(req.user!.userId, req.params.id as string);
      res.status(200).json({ success: true, message: 'Trip completed successfully', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async broadcast(req: Request, res: Response) {
    try {
      const validated = broadcastSchema.parse(req.body);
      const result = await TripService.broadcastToParents(req.user!.userId, validated);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
    }
  }

  static async getActiveTripForChild(req: Request, res: Response) {
    try {
      const trip = await TripService.getActiveTripForChild(req.user!.userId, req.params.childId as string);
      res.status(200).json({ success: true, data: trip });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getActiveTripForVehicle(req: Request, res: Response) {
    try {
      const trip = await TripService.getActiveTripForVehicle(
        req.user!.userId,
        req.params.vehicleId as string
      );
      res.status(200).json({ success: true, data: trip });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
