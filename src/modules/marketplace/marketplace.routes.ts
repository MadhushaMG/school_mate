import { Router } from 'express';
import { MarketplaceController } from './marketplace.controller';
import { authenticateToken, requireRoles } from '../../middlewares/auth.middleware';

const router = Router();

// Public / Semi-public search
router.get('/search', MarketplaceController.search);
router.get('/vehicles/:id', MarketplaceController.getDetails);

// Parent actions
router.post('/request', authenticateToken, requireRoles(['PARENT', 'ADMIN']), MarketplaceController.requestJoin);

// Driver actions
router.get('/driver/requests', authenticateToken, requireRoles(['DRIVER', 'ADMIN']), MarketplaceController.getDriverRequests);
router.post('/driver/respond', authenticateToken, requireRoles(['DRIVER', 'ADMIN']), MarketplaceController.respondRequest);

export default router;
