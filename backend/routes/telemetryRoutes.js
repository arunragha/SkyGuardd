import { Router } from 'express';
import { telemetryController } from '../controllers/telemetryController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/timeseries', telemetryController.getTimeSeries);
router.get('/stream', telemetryController.stream);

// Protected actions: Telemetry mode control and fault injection require auth
router.post('/mode', authenticateToken, telemetryController.setMode);
router.post('/inject-anomaly', authenticateToken, telemetryController.injectAnomaly);

export default router;
