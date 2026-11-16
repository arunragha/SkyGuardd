import { db } from '../database.js';

export const telemetryRepository = {
  getTimeSeries: (stationId = 'st-01', limit = 48) => {
    const rows = db.prepare(`
      SELECT * FROM telemetry 
      WHERE station_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(stationId, limit);

    return rows.reverse().map(r => ({
      time: r.time_str,
      timestamp: r.timestamp,
      temperature: r.temperature,
      tempExpectedMin: r.temp_expected_min,
      tempExpectedMax: r.temp_expected_max,
      isAnomalyTemp: Boolean(r.is_anomaly_temp),
      humidity: r.humidity,
      humExpectedMin: r.hum_expected_min,
      humExpectedMax: r.hum_expected_max,
      isAnomalyHum: Boolean(r.is_anomaly_hum),
      pressure: r.pressure,
      pressExpectedMin: r.press_expected_min,
      pressExpectedMax: r.press_expected_max,
      isAnomalyPress: Boolean(r.is_anomaly_press),
      windSpeed: r.wind_speed,
      windExpectedMin: r.wind_expected_min,
      windExpectedMax: r.wind_expected_max,
      isAnomalyWind: Boolean(r.is_anomaly_wind),
      solarRadiation: r.solar_radiation,
      precipitation: r.precipitation,
      anomalyScore: r.anomaly_score,
      sourceMode: r.source_mode || 'simulated'
    }));
  },

  insert: (pt) => {
    const result = db.prepare(`
      INSERT INTO telemetry (
        station_id, timestamp, time_str, temperature, temp_expected_min, temp_expected_max, is_anomaly_temp,
        humidity, hum_expected_min, hum_expected_max, is_anomaly_hum,
        pressure, press_expected_min, press_expected_max, is_anomaly_press,
        wind_speed, wind_expected_min, wind_expected_max, is_anomaly_wind,
        solar_radiation, precipitation, anomaly_score, source_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      pt.stationId, pt.timestamp || Date.now(), pt.timeStr, pt.temperature,
      pt.tempExpectedMin || 18.0, pt.tempExpectedMax || 32.0, pt.isAnomalyTemp ? 1 : 0,
      pt.humidity, pt.humExpectedMin || 35.0, pt.humExpectedMax || 75.0, pt.isAnomalyHum ? 1 : 0,
      pt.pressure, pt.pressExpectedMin || 1005.0, pt.pressExpectedMax || 1022.0, pt.isAnomalyPress ? 1 : 0,
      pt.windSpeed, pt.windExpectedMin || 2.0, pt.windExpectedMax || 30.0, pt.isAnomalyWind ? 1 : 0,
      pt.solarRadiation || 0, pt.precipitation || 0, pt.anomalyScore || 0.0,
      pt.sourceMode || 'simulated'
    );

    return {
      id: Number(result.lastInsertRowid),
      stationId: pt.stationId,
      timestamp: pt.timestamp || Date.now(),
      time: pt.timeStr,
      temperature: pt.temperature,
      humidity: pt.humidity,
      pressure: pt.pressure,
      windSpeed: pt.windSpeed,
      solarRadiation: pt.solarRadiation || 0,
      precipitation: pt.precipitation || 0,
      anomalyScore: pt.anomalyScore || 0.0,
      sourceMode: pt.sourceMode || 'simulated'
    };
  },

  count: () => {
    return db.prepare('SELECT COUNT(*) as count FROM telemetry').get().count;
  }
};
