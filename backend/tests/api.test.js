import test from 'node:test';
import assert from 'node:assert/strict';
import { dbQueries } from '../db.js';

test('SkyGuard SQLite Database Test Suite', async (t) => {
  await t.test('Stations: Should load seeded stations from SQLite', () => {
    const stations = dbQueries.getStations();
    assert.ok(Array.isArray(stations), 'Stations should be an array');
    assert.ok(stations.length >= 12, 'Should have at least 12 stations');
    
    const st01 = dbQueries.getStationById('st-01');
    assert.ok(st01, 'Station st-01 must exist');
    assert.equal(st01.name, 'Ridge Peak Observatory');
    assert.ok(st01.currentReadings.temperature !== undefined, 'Must have temperature reading');
    assert.ok(st01.currentReadings.humidity !== undefined, 'Must have humidity reading');
    assert.ok(st01.currentReadings.pressure !== undefined, 'Must have pressure reading');
  });

  await t.test('Stations: Should create a new station with proper schema', () => {
    const newStation = dbQueries.createStation({
      name: 'Cascades Test Ridge',
      code: `SKY-TEST-${Date.now().toString().slice(-4)}`,
      location: 'Mount Adams North, WA',
      region: 'Cascade Range',
      lat: 46.2024,
      lng: -121.4905,
      elevation: 1850,
      sensorCount: 18
    });

    assert.ok(newStation, 'New station should be created');
    assert.equal(newStation.name, 'Cascades Test Ridge');
    assert.equal(newStation.status, 'online');
    
    const retrieved = dbQueries.getStationById(newStation.id);
    assert.equal(retrieved.id, newStation.id);
  });

  await t.test('Telemetry: Should query and insert time series points', () => {
    const initialSeries = dbQueries.getTelemetryTimeSeries('st-01', 24);
    assert.ok(Array.isArray(initialSeries), 'Time series should be an array');
    assert.ok(initialSeries.length > 0, 'Should have historical time series data');

    const testTime = Date.now();
    dbQueries.insertTelemetryPoint({
      stationId: 'st-01',
      timestamp: testTime,
      timeStr: '12:00',
      temperature: 26.5,
      humidity: 55,
      pressure: 1012.8,
      windSpeed: 14.2,
      solarRadiation: 750,
      precipitation: 0.0,
      anomalyScore: 0.08
    });

    const updatedSeries = dbQueries.getTelemetryTimeSeries('st-01', 5);
    const newest = updatedSeries[updatedSeries.length - 1];
    assert.equal(newest.temperature, 26.5);
    assert.equal(newest.pressure, 1012.8);
  });

  await t.test('Anomalies: Should query, insert, and update anomaly status', () => {
    const initialAnoms = dbQueries.getAnomalies();
    assert.ok(Array.isArray(initialAnoms), 'Anomalies should be an array');
    assert.ok(initialAnoms.length >= 5, 'Should have seeded anomalies');

    const anomId = `anom-test-${Date.now().toString().slice(-4)}`;
    const inserted = dbQueries.insertAnomaly({
      id: anomId,
      observationId: 'OBS-TEST-999',
      stationId: 'st-01',
      stationName: 'Ridge Peak Observatory',
      sensorParameter: 'temperature',
      parameterLabel: 'Ambient Temperature',
      observedValue: 45.2,
      unit: '°C',
      expectedBaseline: 26.0,
      expectedRange: [20.0, 31.0],
      anomalyScore: 0.95,
      severity: 'critical',
      detectionAlgorithm: 'Weighted Ensemble',
      timestamp: 'Just now',
      status: 'detected',
      explanation: 'Thermistor reading exceeded physical lapse rate limit.',
      recommendation: 'Inspect thermal shield.',
      confidence: 0.96,
      zScore: 4.8,
      rootCause: 'Thermal Shield Displacement'
    });

    assert.ok(inserted, 'Anomaly should be inserted');
    assert.equal(inserted.id, anomId);
    assert.equal(inserted.status, 'detected');

    // Update status to investigating
    const updated = dbQueries.updateAnomalyStatus(anomId, 'investigating');
    assert.equal(updated.status, 'investigating');
  });

  await t.test('Alerts: Should query, insert, and update alerts', () => {
    const alerts = dbQueries.getAlerts();
    assert.ok(Array.isArray(alerts), 'Alerts should be an array');
    assert.ok(alerts.length >= 4, 'Should have seeded alerts');

    const alertId = `alt-test-${Date.now().toString().slice(-4)}`;
    dbQueries.insertAlert({
      id: alertId,
      title: 'Test Anomaly Alert',
      stationId: 'st-01',
      stationName: 'Ridge Peak Observatory',
      sensor: 'Thermistor Array A',
      severity: 'high',
      description: 'Sensor reading high deviation',
      status: 'unread'
    });

    dbQueries.updateAlertStatus(alertId, 'read');
    const allAlerts = dbQueries.getAlerts();
    const found = allAlerts.find(a => a.id === alertId);
    assert.ok(found, 'Inserted alert must exist');
    assert.equal(found.status, 'read');
  });

  await t.test('Models: Should load genuine evaluated models and record training run', () => {
    const models = dbQueries.getModels();
    assert.ok(Array.isArray(models), 'Models should be an array');
    assert.ok(models.length >= 6, 'Should have at least 6 models in SQLite');

    // Verify all metrics are real and non-zero
    for (const m of models) {
      assert.ok(m.name, 'Model must have a name');
      assert.ok(m.roc_auc >= 0.5, `ROC-AUC for ${m.name} should be >= 0.5, got ${m.roc_auc}`);
      assert.ok(m.recall >= 0.5, `Recall for ${m.name} should be >= 0.5, got ${m.recall}`);
      assert.ok(m.confusion_matrix, `Model ${m.name} must have a confusion matrix`);
    }

    // Record training run
    dbQueries.recordTrainingRun({
      modelName: 'Isolation Forest',
      samplesTrained: 11200,
      durationSec: 1.25,
      metrics: { precision: 0.95, recall: 0.92 }
    });
  });
});

