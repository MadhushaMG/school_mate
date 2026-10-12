import { Request, Response } from 'express';
import { NotificationService } from './notification.service';

export class NotificationController {
  static async list(req: Request, res: Response) {
    try {
      const notifications = await NotificationService.listForUser(req.user!.userId);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load notifications.';
      res.status(500).json({ success: false, message });
    }
  }

  static async markRead(req: Request, res: Response) {
    try {
      const notification = await NotificationService.markRead(
        req.user!.userId,
        req.params.id as string
      );
      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update notification.';
      res.status(message === 'Notification not found.' ? 404 : 500).json({ success: false, message });
    }
  }

  static async markAllRead(req: Request, res: Response) {
    try {
      const result = await NotificationService.markAllRead(req.user!.userId);
      res.status(200).json({ success: true, data: { updatedCount: result.count } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update notifications.';
      res.status(500).json({ success: false, message });
    }
  }
}