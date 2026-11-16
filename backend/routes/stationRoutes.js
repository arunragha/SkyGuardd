import { Router } from 'express';
import { stationController } from '../controllers/stationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', stationController.getAll);
router.get('/:id', stationController.getById);
router.post('/', authenticateToken, stationController.create);

export default router;
