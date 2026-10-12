import { Router } from 'express';
import { VehicleController } from './vehicle.controller';
import { authenticateToken, requireRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRoles(['DRIVER', 'ADMIN']));

router.post('/', VehicleController.createVehicle);
router.get('/my-vehicles', VehicleController.getMyVehicles);
router.post('/routes', VehicleController.addRoute);

export default router;
