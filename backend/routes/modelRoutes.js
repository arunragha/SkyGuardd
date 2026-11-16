import { Router } from 'express';
import { modelController } from '../controllers/modelController.js';

const router = Router();

router.get('/', modelController.getAll);
router.get('/training-runs', modelController.getTrainingRuns);
router.get('/benchmarks', modelController.getBenchmarks);
router.get('/:name', modelController.getByName);
router.post('/train', modelController.train);
router.post('/select', modelController.setActive);

export default router;
