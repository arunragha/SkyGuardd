import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';

const router = Router();

router.get('/summary', reportController.getSummary);
router.get('/anomalies/csv', reportController.exportAnomaliesCSV);
router.get('/models/csv', reportController.exportModelsCSV);

export default router;
