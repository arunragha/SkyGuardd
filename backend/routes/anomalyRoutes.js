import { Router } from 'express';
import { anomalyController } from '../controllers/anomalyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', anomalyController.getAll);
router.get('/:id', anomalyController.getById);
router.patch('/:id', anomalyController.updateStatus);
router.post('/detect', anomalyController.detectBatch);

export default router;
