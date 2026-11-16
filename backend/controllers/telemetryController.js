import { telemetryRepository } from '../db/repositories/telemetryRepository.js';
import { telemetryService } from '../services/telemetryService.js';

export const telemetryController = {
  getTimeSeries: (req, res, next) => {
    try {
      const stationId = req.query.station_id || 'st-01';
      const limit = parseInt(req.query.limit, 10) || 48;
      const points = telemetryRepository.getTimeSeries(stationId, limit);
      res.json({ success: true, count: points.length, points });
    } catch (err) {
      next(err);
    }
  },

  stream: (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    telemetryService.addClient(res);
  },

  setMode: (req, res, next) => {
    try {
      const { mode } = req.body;
      const ok = telemetryService.setMode(mode);
      if (!ok) {
        return res.status(400).json({ success: false, message: "Invalid mode. Use 'live_simulation' or 'historical_replay'." });
      }
      res.json({ success: true, message: `Telemetry mode switched to '${mode}'.` });
    } catch (err) {
      next(err);
    }
  },

  injectAnomaly: async (req, res, next) => {
    try {
      const { station_id, parameter, value, anomaly_type } = req.body;
      const result = await telemetryService.injectAnomaly({
        stationId: station_id,
        parameter,
        value: parseFloat(value),
        anomalyType: anomaly_type
      });
      res.json({
        success: true,
        message: 'Controlled anomaly injected and broadcasted via SSE.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }
};
