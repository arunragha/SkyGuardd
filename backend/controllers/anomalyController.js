import { anomalyRepository } from '../db/repositories/anomalyRepository.js';
import { stationRepository } from '../db/repositories/stationRepository.js';
import { alertRepository } from '../db/repositories/alertRepository.js';
import { mlService } from '../services/mlService.js';

export const anomalyController = {
  getAll: (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 100;
      const anomalies = anomalyRepository.getAll(limit);
      res.json({ success: true, count: anomalies.length, anomalies });
    } catch (err) {
      next(err);
    }
  },

  getById: (req, res, next) => {
    try {
      const anomaly = anomalyRepository.getById(req.params.id);
      if (!anomaly) {
        return res.status(404).json({ success: false, message: 'Anomaly not found.' });
      }
      res.json({ success: true, anomaly });
    } catch (err) {
      next(err);
    }
  },

  updateStatus: (req, res, next) => {
    try {
      const { status } = req.body;
      const validStatuses = ['detected', 'investigating', 'acknowledged', 'resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid status. Must be one of [${validStatuses.join(', ')}]` 
        });
      }

      const updated = anomalyRepository.updateStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Anomaly not found.' });
      }
      res.json({ success: true, anomaly: updated });
    } catch (err) {
      next(err);
    }
  },

  detectBatch: async (req, res, next) => {
    try {
      const stations = stationRepository.getAll();
      const readings = stations.map(s => ({
        station_id: s.id,
        station_name: s.name,
        temperature: s.currentReadings.temperature,
        humidity: s.currentReadings.humidity,
        pressure: s.currentReadings.pressure,
        wind_speed: s.currentReadings.windSpeed,
        solar_radiation: s.currentReadings.solarRadiation
      }));

      const mlResponse = await mlService.predictBatch(readings);
      let newlyDetected = 0;

      if (mlResponse && mlResponse.results) {
        for (const pred of mlResponse.results) {
          if (pred.is_anomaly) {
            const anomId = `anom-${Date.now().toString().slice(-6)}`;
            const rootCause = pred.root_cause || {};
            const dominantParam = rootCause.dominant_feature || 'temperature';
            const parameterLabel = dominantParam.charAt(0).toUpperCase() + dominantParam.slice(1);

            anomalyRepository.insert({
              id: anomId,
              observationId: `OBS-${Date.now().toString().slice(-5)}`,
              stationId: pred.station_id || 'st-01',
              stationName: pred.station_name || 'Ridge Peak Observatory',
              sensorParameter: dominantParam,
              parameterLabel,
              observedValue: pred.readings ? pred.readings[dominantParam] : 40.0,
              unit: dominantParam === 'temperature' ? '°C' : dominantParam === 'pressure' ? 'hPa' : 'km/h',
              expectedBaseline: dominantParam === 'temperature' ? 24.5 : dominantParam === 'pressure' ? 1013.2 : 15.0,
              expectedRange: [20.0, 30.5],
              anomalyScore: pred.anomaly_score,
              severity: pred.severity || 'high',
              detectionAlgorithm: pred.model_used || 'Weighted Ensemble',
              timestamp: 'Just now',
              status: 'detected',
              explanation: rootCause.explanation || `Multi-sensor anomaly detected with score ${pred.anomaly_score.toFixed(3)}.`,
              recommendation: rootCause.hardware_action || 'Inspect physical sensor module and cross-validate with adjacent stations.',
              confidence: 0.94,
              zScore: 3.8,
              rootCause: rootCause.category,
              isInjected: false
            });

            alertRepository.insert({
              id: `alt-${Date.now().toString().slice(-5)}`,
              title: `${pred.severity?.toUpperCase() || 'HIGH'}: ${parameterLabel} Sensor Anomaly Flagged`,
              stationId: pred.station_id || 'st-01',
              stationName: pred.station_name || 'Ridge Peak Observatory',
              sensor: `${parameterLabel} Transducer`,
              severity: pred.severity || 'high',
              timestamp: 'Just now',
              description: rootCause.explanation || `Anomaly score: ${pred.anomaly_score.toFixed(3)}`,
              status: 'unread',
              anomalyId: anomId
            });

            newlyDetected++;
          }
        }
      }

      res.json({
        success: true,
        message: `Evaluated ${readings.length} stations. ${newlyDetected} anomalies flagged.`,
        mlInference: mlResponse
      });
    } catch (err) {
      next(err);
    }
  }
};
