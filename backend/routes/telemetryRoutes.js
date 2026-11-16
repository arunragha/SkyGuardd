import { Router } from 'express';
import { telemetryController } from '../controllers/telemetryController.js';

const router = Router();

router.get('/timeseries', telemetryController.getTimeSeries);
router.get('/stream', telemetryController.stream);
router.post('/mode', telemetryController.setMode);
router.post('/inject-anomaly', telemetryController.injectAnomaly);

export default router;
