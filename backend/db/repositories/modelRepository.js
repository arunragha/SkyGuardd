import { db } from '../database.js';

export const modelRepository = {
  getAll: () => {
    const rows = db.prepare('SELECT * FROM models ORDER BY roc_auc DESC').all();
    return rows.map(r => ({
      name: r.name,
      code: r.code,
      version: r.version,
      is_active: Boolean(r.is_active),
      is_default: Boolean(r.is_default),
      precision: r.precision,
      recall: r.recall,
      f1_score: r.f1_score,
      accuracy: r.accuracy,
      roc_auc: r.roc_auc,
      detection_rate: r.detection_rate,
      false_positive_rate: r.false_positive_rate,
      latency_ms: r.latency_ms,
      throughput_samples_sec: r.throughput_samples_sec,
      training_time_sec: r.training_time_sec,
      calibrated_threshold: r.calibrated_threshold,
      confusion_matrix: JSON.parse(r.confusion_matrix_json || '{}'),
      observations_trained: r.observations_trained,
      last_trained: r.last_trained,
      hyperparameters: JSON.parse(r.hyperparameters_json || '{}'),
      description: r.description
    }));
  },

  getByName: (name) => {
    const r = db.prepare('SELECT * FROM models WHERE name = ?').get(name);
    if (!r) return null;
    return {
      name: r.name,
      code: r.code,
      version: r.version,
      is_active: Boolean(r.is_active),
      is_default: Boolean(r.is_default),
      precision: r.precision,
      recall: r.recall,
      f1_score: r.f1_score,
      accuracy: r.accuracy,
      roc_auc: r.roc_auc,
      detection_rate: r.detection_rate,
      false_positive_rate: r.false_positive_rate,
      latency_ms: r.latency_ms,
      throughput_samples_sec: r.throughput_samples_sec,
      training_time_sec: r.training_time_sec,
      calibrated_threshold: r.calibrated_threshold,
      confusion_matrix: JSON.parse(r.confusion_matrix_json || '{}'),
      observations_trained: r.observations_trained,
      last_trained: r.last_trained,
      hyperparameters: JSON.parse(r.hyperparameters_json || '{}'),
      description: r.description
    };
  },

  setActive: (modelName) => {
    db.prepare('UPDATE models SET is_active = 0').run();
    db.prepare('UPDATE models SET is_active = 1 WHERE name = ?').run(modelName);
  },

  updateMetrics: (name, metrics) => {
    db.prepare(`
      UPDATE models SET
        precision = ?, recall = ?, f1_score = ?, accuracy = ?, roc_auc = ?,
        detection_rate = ?, false_positive_rate = ?, latency_ms = ?,
        training_time_sec = ?, confusion_matrix_json = ?, last_trained = CURRENT_TIMESTAMP
      WHERE name = ?
    `).run(
      metrics.precision, metrics.recall, metrics.f1_score, metrics.accuracy, metrics.roc_auc,
      metrics.detection_rate, metrics.false_positive_rate, metrics.latency_ms,
      metrics.training_time_sec, JSON.stringify(metrics.confusion_matrix || {}), name
    );
  },

  recordTrainingRun: (run) => {
    db.prepare(`
      INSERT INTO training_runs (model_name, timestamp, samples_trained, duration_sec, metrics_json, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      run.modelName, run.timestamp || new Date().toISOString(), run.samplesTrained || 11200,
      run.durationSec || 1.0, JSON.stringify(run.metrics || {}), run.status || 'completed'
    );
  },

  getTrainingRuns: (limit = 20) => {
    const rows = db.prepare('SELECT * FROM training_runs ORDER BY id DESC LIMIT ?').all(limit);
    return rows.map(r => ({
      id: r.id,
      modelName: r.model_name,
      timestamp: r.timestamp,
      samplesTrained: r.samples_trained,
      durationSec: r.duration_sec,
      metrics: JSON.parse(r.metrics_json || '{}'),
      status: r.status
    }));
  }
};
