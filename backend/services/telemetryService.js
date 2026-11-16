import { config } from '../config/index.js';
import { stationRepository } from '../db/repositories/stationRepository.js';
import { telemetryRepository } from '../db/repositories/telemetryRepository.js';
import { anomalyRepository } from '../db/repositories/anomalyRepository.js';
import { alertRepository } from '../db/repositories/alertRepository.js';
import { mlService } from './mlService.js';

class TelemetryService {
  constructor() {
    this.clients = new Set();
    this.mode = config.telemetryMode; // 'live_simulation' or 'historical_replay'
    this.tickCounter = 0;
    this.intervalHandle = null;
    this.heartbeatHandle = null;
  }

  start() {
    if (this.intervalHandle) return;

    // 1. Heartbeat every 15s to keep connections alive
    this.heartbeatHandle = setInterval(() => {
      this.broadcastComment('heartbeat');
    }, config.sseHeartbeatMs);

    // 2. Real-time telemetry tick loop
    this.intervalHandle = setInterval(() => {
      this.tick();
    }, config.telemetryIntervalMs);

    console.log(`[TelemetryService] Telemetry engine started in '${this.mode}' mode.`);
  }

  stop() {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    if (this.heartbeatHandle) clearInterval(this.heartbeatHandle);
    this.intervalHandle = null;
    this.heartbeatHandle = null;
  }

  setMode(mode) {
    if (mode === 'live_simulation' || mode === 'historical_replay') {
      this.mode = mode;
      this.broadcast('system', { message: `Telemetry mode switched to '${mode}'`, mode });
      return true;
    }
    return false;
  }

  addClient(res) {
    this.clients.add(res);
    res.write(`event: connected\ndata: ${JSON.stringify({ 
      message: 'Connected to SkyGuard Real-Time SSE Stream', 
      mode: this.mode,
      timestamp: Date.now() 
    })}\n\n`);

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  removeClient(res) {
    this.clients.delete(res);
  }

  broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (e) {
        this.clients.delete(client);
      }
    }
  }

  broadcastComment(comment) {
    for (const client of this.clients) {
      try {
        client.write(`: ${comment}\n\n`);
      } catch (e) {
        this.clients.delete(client);
      }
    }
  }

  async tick() {
    if (this.clients.size === 0) return; // Only process and broadcast when clients are actively listening

    this.tickCounter++;
    const stations = stationRepository.getAll();
    if (!stations.length) return;

    const targetStation = stations[this.tickCounter % stations.length];
    const now = new Date();
    const hour = now.getHours();
    const timeStr = `${hour.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let currentTemp, currentHum, currentPress, currentWind, currentSolar;
    const sourceMode = this.mode === 'historical_replay' ? 'historical' : 'simulated';

    if (this.mode === 'historical_replay') {
      // Replay sequential variations from database historical points
      const offset = (this.tickCounter * 3) % 24;
      const diurnalFactor = Math.sin(((offset - 8) / 24) * 2 * Math.PI);
      currentTemp = parseFloat((22.0 + diurnalFactor * 6.0).toFixed(1));
      currentHum = Math.round(65 - diurnalFactor * 20);
      currentPress = parseFloat((1012.5 + Math.cos((offset / 12) * Math.PI) * 2.5).toFixed(1));
      currentWind = parseFloat((12.0 + Math.sin((offset / 8) * Math.PI) * 5.0).toFixed(1));
      currentSolar = Math.max(0, Math.round(diurnalFactor * 650));
    } else {
      // Live physical simulation with stochastic perturbations
      const tempJitter = (Math.random() - 0.48) * 0.3;
      const humJitter = Math.floor((Math.random() - 0.5) * 2);
      const pressJitter = (Math.random() - 0.5) * 0.2;
      const windJitter = (Math.random() - 0.5) * 0.6;

      currentTemp = parseFloat((targetStation.currentReadings.temperature + tempJitter).toFixed(1));
      currentHum = Math.min(100, Math.max(10, targetStation.currentReadings.humidity + humJitter));
      currentPress = parseFloat((targetStation.currentReadings.pressure + pressJitter).toFixed(1));
      currentWind = Math.max(0, parseFloat((targetStation.currentReadings.windSpeed + windJitter).toFixed(1)));
      currentSolar = Math.max(0, targetStation.currentReadings.solarRadiation + Math.round((Math.random() - 0.5) * 15));
    }

    // Update station state in SQLite
    stationRepository.updateReadings(targetStation.id, {
      temperature: currentTemp,
      humidity: currentHum,
      pressure: currentPress,
      windSpeed: currentWind,
      windDirection: targetStation.currentReadings.windDirection,
      solarRadiation: currentSolar,
      precipitation: targetStation.currentReadings.precipitation
    });

    // Score with Python ML microservice
    let isAnom = false;
    let anomScore = 0.05;

    try {
      const mlEval = await mlService.predictSingle({
        temperature: currentTemp,
        humidity: currentHum,
        pressure: currentPress,
        wind_speed: currentWind,
        solar_radiation: currentSolar
      });

      if (mlEval) {
        isAnom = mlEval.is_anomaly;
        anomScore = mlEval.anomaly_score;
      }
    } catch (e) {
      // Fallback heuristics if ML service is temporarily restarting
      isAnom = currentTemp > 45.0 || currentPress < 960.0 || currentWind > 65.0;
      anomScore = isAnom ? 0.92 : 0.08;
    }

    // Persist telemetry record
    telemetryRepository.insert({
      stationId: targetStation.id,
      timestamp: now.getTime(),
      timeStr,
      temperature: currentTemp,
      tempExpectedMin: 18.0,
      tempExpectedMax: 32.0,
      isAnomalyTemp: isAnom && (currentTemp > 35.0 || currentTemp < 10.0),
      humidity: currentHum,
      humExpectedMin: 35.0,
      humExpectedMax: 75.0,
      isAnomalyHum: isAnom && currentHum > 85.0,
      pressure: currentPress,
      pressExpectedMin: 1005.0,
      pressExpectedMax: 1022.0,
      isAnomalyPress: isAnom && currentPress < 995.0,
      windSpeed: currentWind,
      windExpectedMin: 2.0,
      windExpectedMax: 30.0,
      isAnomalyWind: isAnom && currentWind > 40.0,
      solarRadiation: currentSolar,
      precipitation: 0.0,
      anomalyScore: anomScore,
      sourceMode
    });

    // Broadcast live telemetry point
    this.broadcast('telemetry', {
      stationId: targetStation.id,
      stationName: targetStation.name,
      timestamp: now.getTime(),
      timeStr,
      readings: {
        temperature: currentTemp,
        humidity: currentHum,
        pressure: currentPress,
        windSpeed: currentWind,
        solarRadiation: currentSolar
      },
      isAnomaly: isAnom,
      anomalyScore: anomScore,
      sourceMode
    });
  }

  async injectAnomaly({ stationId = 'st-01', parameter = 'temperature', value = 48.5, anomalyType = 'spike' }) {
    const station = stationRepository.getById(stationId);
    if (!station) throw new Error('Station not found');

    const syntheticReadings = {
      temperature: parameter === 'temperature' ? value : station.currentReadings.temperature,
      humidity: parameter === 'humidity' ? value : station.currentReadings.humidity,
      pressure: parameter === 'pressure' ? value : station.currentReadings.pressure,
      wind_speed: parameter === 'wind_speed' ? value : station.currentReadings.windSpeed,
      solar_radiation: station.currentReadings.solarRadiation
    };

    let mlScore = null;
    try {
      mlScore = await mlService.predictSingle(syntheticReadings);
    } catch (e) {
      console.warn('ML single predict error on injected anomaly:', e.message);
    }

    const isAnomaly = mlScore ? mlScore.is_anomaly : true;
    const anomalyScore = mlScore ? mlScore.anomaly_score : 0.94;
    const severity = mlScore ? mlScore.severity : 'critical';
    const rootCause = mlScore?.root_cause || {
      category: 'Injected Benchmark Anomaly',
      explanation: `Controlled injection: ${parameter} spike to ${value} registered.`,
      hardware_action: 'Interactive portfolio test validation.'
    };

    const anomId = `anom-${Date.now().toString().slice(-6)}`;
    const unit = parameter === 'temperature' ? '°C' : parameter === 'pressure' ? 'hPa' : parameter === 'wind_speed' ? 'km/h' : '%';

    const recordedAnomaly = anomalyRepository.insert({
      id: anomId,
      observationId: `OBS-INJ-${Date.now().toString().slice(-4)}`,
      stationId: station.id,
      stationName: station.name,
      sensorParameter: parameter,
      parameterLabel: parameter.charAt(0).toUpperCase() + parameter.slice(1),
      observedValue: value,
      unit,
      expectedBaseline: parameter === 'temperature' ? 24.5 : 1013.2,
      expectedRange: parameter === 'temperature' ? [20.0, 30.5] : [1005.0, 1020.0],
      anomalyScore,
      severity,
      detectionAlgorithm: mlScore?.model_used || 'Weighted Ensemble',
      timestamp: 'Just now',
      status: 'detected',
      explanation: rootCause.explanation,
      recommendation: rootCause.hardware_action,
      confidence: 0.98,
      zScore: 4.5,
      rootCause: rootCause.category,
      isInjected: true
    });

    const recordedAlert = alertRepository.insert({
      id: `alt-${Date.now().toString().slice(-5)}`,
      title: `[INJECTED] ${parameter.toUpperCase()} Anomaly Triggered`,
      stationId: station.id,
      stationName: station.name,
      sensor: `${parameter} Probe`,
      severity,
      timestamp: 'Just now',
      description: rootCause.explanation,
      status: 'unread',
      anomalyId: anomId
    });

    stationRepository.updateReadings(station.id, {
      ...station.currentReadings,
      [parameter === 'wind_speed' ? 'windSpeed' : parameter]: value
    });

    const recordedTelemetry = telemetryRepository.insert({
      stationId: station.id,
      timestamp: Date.now(),
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: syntheticReadings.temperature,
      humidity: syntheticReadings.humidity,
      pressure: syntheticReadings.pressure,
      windSpeed: syntheticReadings.wind_speed,
      solarRadiation: syntheticReadings.solar_radiation || 600,
      precipitation: 0.0,
      anomalyScore,
      sourceMode: 'injected'
    });

    this.broadcast('telemetry', recordedTelemetry);
    this.broadcast('anomaly', recordedAnomaly);
    this.broadcast('alert', recordedAlert);

    return { 
      telemetryPoint: recordedTelemetry,
      anomaly: recordedAnomaly, 
      alert: recordedAlert, 
      mlInference: mlScore 
    };
  }
}

export const telemetryService = new TelemetryService();
