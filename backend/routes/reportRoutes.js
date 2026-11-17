import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Reports contain operational fleet and telemetry data, requiring authenticated access
router.get('/summary', authenticateToken, reportController.getSummary);
router.get('/anomalies/csv', authenticateToken, reportController.exportAnomaliesCSV);
router.get('/models/csv', authenticateToken, reportController.exportModelsCSV);

export default router;
