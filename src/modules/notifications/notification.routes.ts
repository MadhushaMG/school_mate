import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { NotificationController } from './notification.controller';

const router = Router();

router.use(authenticateToken);
router.get('/', NotificationController.list);
router.patch('/read-all', NotificationController.markAllRead);
router.patch('/:id/read', NotificationController.markRead);

export default router;