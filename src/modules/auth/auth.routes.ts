import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/password-reset/request', AuthController.requestPasswordReset);
router.post('/password-reset/confirm', AuthController.confirmPasswordReset);
router.get('/me', authenticateToken, AuthController.me);
router.patch('/me', authenticateToken, AuthController.updateProfile);
router.post('/push-token', authenticateToken, AuthController.updatePushToken);

export default router;
