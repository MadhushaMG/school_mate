import { Request, Response } from 'express';
import { ChildService } from './child.service';
import { z } from 'zod';

const createChildSchema = z.object({
  fullName: z.string().min(2, 'Child name is required'),
  schoolName: z.string().min(2, 'School name is required'),
  grade: z.string().min(1, 'Grade is required'),
  pickupAddress: z.string().min(3, 'Pickup address is required'),
  pickupLat: z.number(),
  pickupLng: z.number(),
  dropAddress: z.string().optional(),
  dropLat: z.number().optional(),
  dropLng: z.number().optional(),
});

export class ChildController {
  static async createChild(req: Request, res: Response) {
    try {
      const validated = createChildSchema.parse(req.body);
      const child = await ChildService.createChild(req.user!.userId, validated);
      res.status(201).json({ success: true, message: 'Child registered successfully', data: child });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.issues?.[0]?.message || error.message });
    }
  }

  static async getMyChildren(req: Request, res: Response) {
    try {
      const children = await ChildService.getParentChildren(req.user!.userId);
      res.status(200).json({ success: true, data: children });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getChildById(req: Request, res: Response) {
    try {
      const child = await ChildService.getChildById(req.user!.userId, req.params.id as string);
      res.status(200).json({ success: true, data: child });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
