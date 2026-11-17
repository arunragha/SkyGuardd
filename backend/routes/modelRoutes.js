import { Router } from 'express';
import { modelController } from '../controllers/modelController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', modelController.getAll);
router.get('/training-runs', modelController.getTrainingRuns);
router.get('/benchmarks', modelController.getBenchmarks);
router.get('/:name', modelController.getByName);

// Protected actions: Retraining requires admin or analyst clearance
router.post('/train', authenticateToken, requireRole('admin', 'analyst'), modelController.train);

// Changing active model requires authenticated operator
router.post('/select', authenticateToken, modelController.setActive);

export default router;
