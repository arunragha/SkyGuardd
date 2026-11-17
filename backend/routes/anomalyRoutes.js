import { Router } from 'express';
import { anomalyController } from '../controllers/anomalyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', anomalyController.getAll);
router.get('/:id', anomalyController.getById);

// Protected actions: Modifying anomaly status and running batch ML inference require auth
router.patch('/:id', authenticateToken, anomalyController.updateStatus);
router.post('/detect', authenticateToken, anomalyController.detectBatch);

export default router;
