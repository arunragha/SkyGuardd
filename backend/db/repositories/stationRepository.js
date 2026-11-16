import { db } from '../database.js';

export const stationRepository = {
  getAll: () => {
    const rows = db.prepare('SELECT * FROM stations ORDER BY id ASC').all();
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      code: r.code,
      location: r.location,
      region: r.region,
      lat: r.lat,
      lng: r.lng,
      status: r.status,
      lastCommunication: r.last_communication,
      sensorCount: r.sensor_count,
      anomalyCount: r.anomaly_count,
      elevation: r.elevation,
      firmwareVersion: r.firmware_version,
      batteryLevel: r.battery_level,
      signalStrength: r.signal_strength,
      currentReadings: {
        temperature: r.temperature,
        humidity: r.humidity,
        pressure: r.pressure,
        windSpeed: r.wind_speed,
        windDirection: r.wind_direction,
        solarRadiation: r.solar_radiation,
        precipitation: r.precipitation
      }
    }));
  },

  getById: (id) => {
    const r = db.prepare('SELECT * FROM stations WHERE id = ?').get(id);
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      code: r.code,
      location: r.location,
      region: r.region,
      lat: r.lat,
      lng: r.lng,
      status: r.status,
      lastCommunication: r.last_communication,
      sensorCount: r.sensor_count,
      anomalyCount: r.anomaly_count,
      elevation: r.elevation,
      firmwareVersion: r.firmware_version,
      batteryLevel: r.battery_level,
      signalStrength: r.signal_strength,
      currentReadings: {
        temperature: r.temperature,
        humidity: r.humidity,
        pressure: r.pressure,
        windSpeed: r.wind_speed,
        windDirection: r.wind_direction,
        solarRadiation: r.solar_radiation,
        precipitation: r.precipitation
      }
    };
  },

  create: (data) => {
    const id = data.id || `st-${Date.now().toString().slice(-4)}`;
    db.prepare(`
      INSERT INTO stations (
        id, name, code, location, region, lat, lng, status, last_communication,
        sensor_count, anomaly_count, elevation, firmware_version, battery_level, signal_strength,
        temperature, humidity, pressure, wind_speed, wind_direction, solar_radiation, precipitation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.name || 'New Outpost', data.code || `SKY-${id}`, data.location || 'Cascade Foothills, WA',
      data.region || 'Northwest Region', data.lat || 45.0, data.lng || -120.0, data.status || 'online',
      'Just now', data.sensorCount || 16, 0, data.elevation || 200, data.firmwareVersion || 'v4.1.8-edge',
      100, 95, data.temperature || 22.0, data.humidity || 55.0, data.pressure || 1013.2,
      data.windSpeed || 15.0, data.windDirection || 'W', data.solarRadiation || 600, data.precipitation || 0.0
    );
    return stationRepository.getById(id);
  },

  updateReadings: (id, readings) => {
    db.prepare(`
      UPDATE stations SET
        temperature = ?, humidity = ?, pressure = ?, wind_speed = ?,
        wind_direction = COALESCE(?, wind_direction), solar_radiation = ?, precipitation = ?,
        last_communication = 'Just now', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      readings.temperature, readings.humidity, readings.pressure, readings.windSpeed,
      readings.windDirection || null, readings.solarRadiation || 0, readings.precipitation || 0, id
    );
  },

  incrementAnomalyCount: (id) => {
    db.prepare('UPDATE stations SET anomaly_count = anomaly_count + 1 WHERE id = ?').run(id);
  }
};
