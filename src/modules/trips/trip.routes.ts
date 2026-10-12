import { Router } from 'express';
import { TripController } from './trip.controller';
import { authenticateToken, requireRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Parent routes
router.post('/attendance', requireRoles(['PARENT', 'ADMIN']), TripController.setParentAttendance);
router.get('/active/child/:childId', requireRoles(['PARENT', 'ADMIN']), TripController.getActiveTripForChild);

// Driver routes
router.post('/start', requireRoles(['DRIVER', 'ADMIN']), TripController.startTrip);
router.get('/active/vehicle/:vehicleId', requireRoles(['DRIVER', 'ADMIN']), TripController.getActiveTripForVehicle);
router.post('/boarding', requireRoles(['DRIVER', 'ADMIN']), TripController.updateBoarding);
router.post('/broadcast', requireRoles(['DRIVER', 'ADMIN']), TripController.broadcast);
router.post('/:id/complete', requireRoles(['DRIVER', 'ADMIN']), TripController.completeTrip);

// Shared route (Both Driver & Parent can view trip details)
router.get('/:id', TripController.getTripDetails);

export default router;
