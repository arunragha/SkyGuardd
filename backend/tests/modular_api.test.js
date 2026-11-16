import test from 'node:test';
import assert from 'node:assert/strict';
import { userRepository } from '../db/repositories/userRepository.js';
import { stationRepository } from '../db/repositories/stationRepository.js';
import { anomalyRepository } from '../db/repositories/anomalyRepository.js';
import { alertRepository } from '../db/repositories/alertRepository.js';
import { modelRepository } from '../db/repositories/modelRepository.js';
import { authService } from '../services/authService.js';
import { reportService } from '../services/reportService.js';
import { telemetryService } from '../services/telemetryService.js';

test('SkyGuard Modular Backend Architecture Test Suite', async (t) => {
  await t.test('Auth: Register, hash password, authenticate, and verify JWT', async () => {
    const testEmail = `researcher_${Date.now()}@skyguard.io`;
    const regResult = await authService.register('Dr. Clara Green', testEmail, 'AtmosphericPhysics#2026', 'analyst');
    assert.ok(regResult.token, 'Registration must issue a JWT');
    assert.equal(regResult.user.email, testEmail);
    assert.equal(regResult.user.role, 'analyst');

    // Duplicate registration rejection
    await assert.rejects(
      async () => {
        await authService.register('Clone User', testEmail, 'Password123');
      },
      /already exists/i
    );

    // Login with correct credentials
    const loginResult = await authService.login(testEmail, 'AtmosphericPhysics#2026');
    assert.ok(loginResult.token, 'Login must issue a valid JWT');
    assert.equal(loginResult.user.name, 'Dr. Clara Green');

    // Login with bad password rejection
    await assert.rejects(
      async () => {
        await authService.login(testEmail, 'WrongPassword');
      },
      /Invalid email or password/
    );
  });

  await t.test('Stations Repository: Query and structure check', () => {
    const stations = stationRepository.getAll();
    assert.ok(Array.isArray(stations), 'Stations must be an array');
    assert.ok(stations.length >= 12, 'Expected at least 12 meteorological stations');

    const st01 = stationRepository.getById('st-01');
    assert.ok(st01, 'st-01 should exist');
    assert.equal(st01.name, 'Ridge Peak Observatory');
    assert.ok(st01.currentReadings.temperature !== undefined);
  });

  await t.test('Models Repository: All 7 anomaly detection techniques registered', () => {
    const models = modelRepository.getAll();
    assert.ok(models.length >= 7, `Expected at least 7 models in registry, found ${models.length}`);

    const modelNames = models.map(m => m.name);
    const requiredModels = [
      'Weighted Ensemble',
      'Isolation Forest',
      'Local Outlier Factor',
      'One-Class SVM',
      'DBSCAN',
      'Conv1D Autoencoder',
      'Statistical Detector'
    ];

    for (const reqName of requiredModels) {
      assert.ok(modelNames.includes(reqName), `Registry must contain '${reqName}'`);
    }

    // Active model switching
    modelRepository.setActive('Conv1D Autoencoder');
    const active = modelRepository.getByName('Conv1D Autoencoder');
    assert.equal(active.is_active, true, 'Conv1D Autoencoder should now be marked active');

    // Switch back to Weighted Ensemble
    modelRepository.setActive('Weighted Ensemble');
    const ensemble = modelRepository.getByName('Weighted Ensemble');
    assert.equal(ensemble.is_active, true, 'Weighted Ensemble should be active');
  });

  await t.test('Report Service: Executive summary and CSV export generation', () => {
    const summary = reportService.getExecutiveSummary();
    assert.ok(summary.generatedAt, 'Summary should have a timestamp');
    assert.ok(summary.fleetHealth.totalStations >= 12, 'Fleet health must report station counts');
    assert.ok(summary.anomalies.totalFlagged >= 0, 'Must report anomaly metrics');
    assert.ok(summary.models.activeModel, 'Must report active model');

    const anomalyCsv = reportService.exportAnomaliesCSV();
    assert.ok(typeof anomalyCsv === 'string', 'CSV output must be string');
    assert.ok(anomalyCsv.startsWith('ID,Observation_ID'), 'CSV must contain standard headers');

    const modelsCsv = reportService.exportModelsCSV();
    assert.ok(modelsCsv.includes('Weighted Ensemble'), 'Models CSV must include ensemble metrics');
  });

  await t.test('Telemetry Service: Dual mode switching and anomaly injection', async () => {
    // Mode switching
    const switchedToReplay = telemetryService.setMode('historical_replay');
    assert.equal(switchedToReplay, true, 'Should switch to historical_replay');
    assert.equal(telemetryService.mode, 'historical_replay');

    const switchedToSim = telemetryService.setMode('live_simulation');
    assert.equal(switchedToSim, true, 'Should switch back to live_simulation');
    assert.equal(telemetryService.mode, 'live_simulation');

    const invalidMode = telemetryService.setMode('invalid_mode');
    assert.equal(invalidMode, false, 'Should reject invalid mode');

    // Injection
    const injectResult = await telemetryService.injectAnomaly({
      stationId: 'st-01',
      parameter: 'temperature',
      value: 48.5,
      anomalyType: 'spike'
    });
    assert.ok(injectResult.telemetryPoint, 'Injected telemetry point must be generated');
    assert.equal(injectResult.telemetryPoint.temperature, 48.5);
  });
});
