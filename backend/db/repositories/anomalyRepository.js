import { db } from '../database.js';
import { stationRepository } from './stationRepository.js';

export const anomalyRepository = {
  getAll: (limit = 100) => {
    const rows = db.prepare('SELECT * FROM anomalies ORDER BY created_at DESC LIMIT ?').all(limit);
    return rows.map(r => ({
      id: r.id,
      observationId: r.observation_id,
      stationId: r.station_id,
      stationName: r.station_name,
      sensorParameter: r.sensor_parameter,
      parameterLabel: r.parameter_label,
      observedValue: r.observed_value,
      unit: r.unit,
      expectedBaseline: r.expected_baseline,
      expectedRange: [r.expected_range_min, r.expected_range_max],
      anomalyScore: r.anomaly_score,
      severity: r.severity,
      detectionAlgorithm: r.detection_algorithm,
      timestamp: r.timestamp,
      status: r.status,
      explanation: r.explanation,
      recommendation: r.recommendation,
      confidence: r.confidence,
      zScore: r.z_score,
      rootCause: r.root_cause,
      isInjected: Boolean(r.is_injected),
      historicalContext: {
        rollingAvg7d: r.expected_baseline,
        standardDev: Math.abs(r.observed_value - r.expected_baseline) / (Math.abs(r.z_score) || 3.0),
        minPastMonth: r.expected_range_min * 0.9,
        maxPastMonth: r.expected_range_max * 1.1
      }
    }));
  },

  getById: (id) => {
    const r = db.prepare('SELECT * FROM anomalies WHERE id = ?').get(id);
    if (!r) return null;
    return {
      id: r.id,
      observationId: r.observation_id,
      stationId: r.station_id,
      stationName: r.station_name,
      sensorParameter: r.sensor_parameter,
      parameterLabel: r.parameter_label,
      observedValue: r.observed_value,
      unit: r.unit,
      expectedBaseline: r.expected_baseline,
      expectedRange: [r.expected_range_min, r.expected_range_max],
      anomalyScore: r.anomaly_score,
      severity: r.severity,
      detectionAlgorithm: r.detection_algorithm,
      timestamp: r.timestamp,
      status: r.status,
      explanation: r.explanation,
      recommendation: r.recommendation,
      confidence: r.confidence,
      zScore: r.z_score,
      rootCause: r.root_cause,
      isInjected: Boolean(r.is_injected)
    };
  },

  insert: (a) => {
    db.prepare(`
      INSERT INTO anomalies (
        id, observation_id, station_id, station_name, sensor_parameter, parameter_label,
        observed_value, unit, expected_baseline, expected_range_min, expected_range_max,
        anomaly_score, severity, detection_algorithm, timestamp, status, explanation,
        recommendation, confidence, z_score, root_cause, is_injected
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      a.id, a.observationId, a.stationId, a.stationName, a.sensorParameter, a.parameterLabel,
      a.observedValue, a.unit, a.expectedBaseline, a.expectedRange[0], a.expectedRange[1],
      a.anomalyScore, a.severity, a.detectionAlgorithm, a.timestamp || 'Just now', a.status || 'detected',
      a.explanation, a.recommendation, a.confidence || 0.95, a.zScore || 3.5, a.rootCause || null,
      a.isInjected ? 1 : 0
    );
    stationRepository.incrementAnomalyCount(a.stationId);
    return anomalyRepository.getById(a.id);
  },

  updateStatus: (id, status) => {
    db.prepare('UPDATE anomalies SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    return anomalyRepository.getById(id);
  },

  count: () => {
    return db.prepare('SELECT COUNT(*) as count FROM anomalies').get().count;
  }
};
