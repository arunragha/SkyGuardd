import { stationRepository } from '../db/repositories/stationRepository.js';
import { anomalyRepository } from '../db/repositories/anomalyRepository.js';
import { alertRepository } from '../db/repositories/alertRepository.js';
import { telemetryRepository } from '../db/repositories/telemetryRepository.js';
import { modelRepository } from '../db/repositories/modelRepository.js';

export const reportService = {
  getExecutiveSummary: () => {
    const stations = stationRepository.getAll();
    const anomalies = anomalyRepository.getAll(500);
    const alerts = alertRepository.getAll(500);
    const models = modelRepository.getAll();
    const telemetryTotal = telemetryRepository.count();

    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    const highCount = anomalies.filter(a => a.severity === 'high').length;
    const mediumCount = anomalies.filter(a => a.severity === 'medium').length;
    const lowCount = anomalies.filter(a => a.severity === 'low').length;

    // Sensor-wise distribution
    const sensorBreakdown = {};
    for (const a of anomalies) {
      sensorBreakdown[a.sensorParameter] = (sensorBreakdown[a.sensorParameter] || 0) + 1;
    }

    // Station-wise distribution
    const stationBreakdown = {};
    for (const a of anomalies) {
      stationBreakdown[a.stationName] = (stationBreakdown[a.stationName] || 0) + 1;
    }

    return {
      generatedAt: new Date().toISOString(),
      fleetHealth: {
        totalStations: stations.length,
        onlineStations: stations.filter(s => s.status === 'online').length,
        degradedStations: stations.filter(s => s.status === 'degraded').length,
        offlineStations: stations.filter(s => s.status === 'offline').length,
        totalSensorsMonitored: stations.reduce((acc, s) => acc + s.sensorCount, 0),
        totalObservationsProcessed: telemetryTotal
      },
      anomalies: {
        totalFlagged: anomalies.length,
        severityBreakdown: {
          critical: criticalCount,
          high: highCount,
          medium: mediumCount,
          low: lowCount
        },
        sensorBreakdown,
        stationBreakdown
      },
      models: {
        activeModel: models.find(m => m.is_active)?.name || 'Weighted Ensemble',
        fleetModelsCount: models.length,
        bestAucModel: models.reduce((best, m) => m.roc_auc > (best?.roc_auc || 0) ? m : best, null)
      }
    };
  },

  exportAnomaliesCSV: () => {
    const anomalies = anomalyRepository.getAll(1000);
    const headers = [
      'ID', 'Observation_ID', 'Station_ID', 'Station_Name', 'Sensor_Parameter',
      'Parameter_Label', 'Observed_Value', 'Unit', 'Expected_Baseline',
      'Expected_Min', 'Expected_Max', 'Anomaly_Score', 'Severity',
      'Detection_Algorithm', 'Confidence', 'Z_Score', 'Status', 'Root_Cause', 'Timestamp'
    ];

    const rows = anomalies.map(a => [
      `"${a.id}"`,
      `"${a.observationId}"`,
      `"${a.stationId}"`,
      `"${a.stationName}"`,
      `"${a.sensorParameter}"`,
      `"${a.parameterLabel}"`,
      a.observedValue,
      `"${a.unit}"`,
      a.expectedBaseline,
      a.expectedRange[0],
      a.expectedRange[1],
      a.anomalyScore,
      `"${a.severity}"`,
      `"${a.detectionAlgorithm}"`,
      a.confidence,
      a.zScore,
      `"${a.status}"`,
      `"${(a.rootCause || '').replace(/"/g, '""')}"`,
      `"${a.timestamp}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  exportModelsCSV: () => {
    const models = modelRepository.getAll();
    const headers = [
      'Algorithm_Name', 'Code', 'Version', 'Is_Active', 'ROC_AUC',
      'Recall', 'Precision', 'F1_Score', 'Accuracy', 'Detection_Rate',
      'False_Positive_Rate', 'Latency_MS', 'Throughput_SPS', 'Training_Time_Sec', 'Last_Trained'
    ];

    const rows = models.map(m => [
      `"${m.name}"`,
      `"${m.code}"`,
      `"${m.version}"`,
      m.is_active ? 1 : 0,
      m.roc_auc,
      m.recall,
      m.precision,
      m.f1_score,
      m.accuracy,
      m.detection_rate,
      m.false_positive_rate,
      m.latency_ms,
      m.throughput_samples_sec,
      m.training_time_sec,
      `"${m.last_trained}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
