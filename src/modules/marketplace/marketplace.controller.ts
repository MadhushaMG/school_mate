import { Request, Response } from 'express';
import { MarketplaceService } from './marketplace.service';
import { z } from 'zod';

const requestEnrollmentSchema = z.object({
  childId: z.string().min(1, 'Child ID is required'),
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  parentNotes: z.string().optional(),
});

const respondEnrollmentSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  status: z.enum(['ACCEPTED', 'REJECTED']),
  monthlyFee: z.number().positive().optional(),
  pickupSequenceIndex: z.number().int().optional(),
});

export class MarketplaceController {
  static async search(req: Request, res: Response) {
    try {
      const { school, town, onlyWithSeats } = req.query;
      const results = await MarketplaceService.searchVehicles({
        school: school as string,
        town: town as string,
        onlyWithSeats: onlyWithSeats === 'true',
      });
      res.status(200).json({ success: true, data: results });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDetails(req: Request, res: Response) {
    try {
      const vehicle = await MarketplaceService.getVehicleDetails(req.params.id as string);
      res.status(200).json({ success: true, data: vehicle });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async requestJoin(req: Request, res: Response) {
    try {
      const validated = requestEnrollmentSchema.parse(req.body);
      const enrollment = await MarketplaceService.requestEnrollment(req.user!.userId, validated);
      res.status(201).json({ success: true, message: 'Request submitted to driver', data: enrollment });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.issues?.[0]?.message || error.message });
    }
  }

  static async getDriverRequests(req: Request, res: Response) {
    try {
      const requests = await MarketplaceService.getDriverRequests(req.user!.userId);
      res.status(200).json({ success: true, data: requests });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async respondRequest(req: Request, res: Response) {
    try {
      const validated = respondEnrollmentSchema.parse(req.body);
      const updated = await MarketplaceService.respondEnrollment(req.user!.userId, validated);
      res.status(200).json({ success: true, message: `Request ${validated.status.toLowerCase()} successfully`, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.issues?.[0]?.message || error.message });
    }
  }
}
