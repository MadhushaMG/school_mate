import { Router } from 'express';
import { ChildController } from './child.controller';
import { authenticateToken, requireRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRoles(['PARENT', 'ADMIN']));

router.post('/', ChildController.createChild);
router.get('/', ChildController.getMyChildren);
router.get('/:id', ChildController.getChildById);

export default router;
