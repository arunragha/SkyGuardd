import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const db = new DatabaseSync(config.dbPath);

// Enable WAL mode, synchronous normal, foreign key enforcement, and busy timeout
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
`);

// Run Migrations / Schema Creation
export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'operator',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      location TEXT NOT NULL,
      region TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'online',
      last_communication TEXT NOT NULL,
      sensor_count INTEGER NOT NULL DEFAULT 16,
      anomaly_count INTEGER NOT NULL DEFAULT 0,
      elevation REAL NOT NULL DEFAULT 0,
      firmware_version TEXT NOT NULL DEFAULT 'v4.1.8-edge',
      battery_level INTEGER NOT NULL DEFAULT 100,
      signal_strength INTEGER NOT NULL DEFAULT 95,
      temperature REAL NOT NULL,
      humidity REAL NOT NULL,
      pressure REAL NOT NULL,
      wind_speed REAL NOT NULL,
      wind_direction TEXT NOT NULL DEFAULT 'W',
      solar_radiation REAL NOT NULL DEFAULT 0,
      precipitation REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS telemetry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      time_str TEXT NOT NULL,
      temperature REAL NOT NULL,
      temp_expected_min REAL DEFAULT 18.0,
      temp_expected_max REAL DEFAULT 32.0,
      is_anomaly_temp INTEGER DEFAULT 0,
      humidity REAL NOT NULL,
      hum_expected_min REAL DEFAULT 35.0,
      hum_expected_max REAL DEFAULT 75.0,
      is_anomaly_hum INTEGER DEFAULT 0,
      pressure REAL NOT NULL,
      press_expected_min REAL DEFAULT 1005.0,
      press_expected_max REAL DEFAULT 1022.0,
      is_anomaly_press INTEGER DEFAULT 0,
      wind_speed REAL NOT NULL,
      wind_expected_min REAL DEFAULT 2.0,
      wind_expected_max REAL DEFAULT 30.0,
      is_anomaly_wind INTEGER DEFAULT 0,
      solar_radiation REAL DEFAULT 0,
      precipitation REAL DEFAULT 0,
      anomaly_score REAL DEFAULT 0.0,
      source_mode TEXT NOT NULL DEFAULT 'simulated',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(station_id) REFERENCES stations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS anomalies (
      id TEXT PRIMARY KEY,
      observation_id TEXT NOT NULL,
      station_id TEXT NOT NULL,
      station_name TEXT NOT NULL,
      sensor_parameter TEXT NOT NULL,
      parameter_label TEXT NOT NULL,
      observed_value REAL NOT NULL,
      unit TEXT NOT NULL,
      expected_baseline REAL NOT NULL,
      expected_range_min REAL NOT NULL,
      expected_range_max REAL NOT NULL,
      anomaly_score REAL NOT NULL,
      severity TEXT NOT NULL,
      detection_algorithm TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'detected',
      explanation TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0.9,
      z_score REAL NOT NULL DEFAULT 3.0,
      root_cause TEXT,
      is_injected INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(station_id) REFERENCES stations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      station_id TEXT NOT NULL,
      station_name TEXT NOT NULL,
      sensor TEXT NOT NULL,
      severity TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      anomaly_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(station_id) REFERENCES stations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS models (
      name TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      version TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      is_default INTEGER DEFAULT 0,
      precision REAL NOT NULL,
      recall REAL NOT NULL,
      f1_score REAL NOT NULL,
      accuracy REAL NOT NULL,
      roc_auc REAL NOT NULL,
      detection_rate REAL NOT NULL,
      false_positive_rate REAL NOT NULL,
      latency_ms REAL NOT NULL,
      throughput_samples_sec REAL NOT NULL,
      training_time_sec REAL NOT NULL,
      calibrated_threshold REAL NOT NULL,
      confusion_matrix_json TEXT NOT NULL,
      observations_trained INTEGER NOT NULL,
      last_trained TEXT NOT NULL,
      hyperparameters_json TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS training_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_name TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      samples_trained INTEGER NOT NULL,
      duration_sec REAL NOT NULL,
      metrics_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed'
    );

    CREATE TABLE IF NOT EXISTS system_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'info',
      description TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      metadata_json TEXT
    );

    -- Create Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_telemetry_station_time ON telemetry(station_id, timestamp);
    CREATE INDEX IF NOT EXISTS idx_anomalies_station_time ON anomalies(station_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies(severity);
    CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_system_events_type ON system_events(event_type);
  `);

  // Schema evolution alters for backward compatibility
  try { db.exec("ALTER TABLE telemetry ADD COLUMN source_mode TEXT NOT NULL DEFAULT 'simulated';"); } catch (_) {}
  try { db.exec('ALTER TABLE anomalies ADD COLUMN is_injected INTEGER NOT NULL DEFAULT 0;'); } catch (_) {}
  try { db.exec('ALTER TABLE anomalies ADD COLUMN root_cause TEXT;'); } catch (_) {}
  try { db.exec('ALTER TABLE anomalies ADD COLUMN confidence REAL NOT NULL DEFAULT 0.9;'); } catch (_) {}
  try { db.exec('ALTER TABLE anomalies ADD COLUMN z_score REAL NOT NULL DEFAULT 3.0;'); } catch (_) {}
}

// Initial Seeding
export function seedDatabase() {
  runMigrations();

  // 1. Seed Default Admin User if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('[SKYGUARD-DB] Seeding default administrator account...');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('SkyGuard@2026!', salt);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('usr-admin-01', 'admin@skyguard.io', hash, 'Chief Meteorologist (Admin)', 'admin');
  }

  // 2. Seed Stations if empty
  const stationCount = db.prepare('SELECT COUNT(*) as count FROM stations').get().count;
  if (stationCount === 0) {
    console.log('[SKYGUARD-DB] Seeding weather stations fleet...');
    const seedStations = [
      {
        id: 'st-01', name: 'Ridge Peak Observatory', code: 'SKY-RP-01',
        location: 'Mount Rainier Foothills, WA', region: 'Northwest Region',
        lat: 46.8523, lng: -121.7603, status: 'online', last_communication: 'Just now',
        sensor_count: 16, anomaly_count: 2, elevation: 1420, firmware_version: 'v4.1.8-edge',
        battery_level: 98, signal_strength: 94, temperature: 28.4, humidity: 64,
        pressure: 1013.2, wind_speed: 18.2, wind_direction: 'WNW', solar_radiation: 740, precipitation: 0.0
      },
      {
        id: 'st-02', name: 'Coastal Bay Sentinel', code: 'SKY-CB-02',
        location: 'Cape Disappointment, WA', region: 'Pacific Marine',
        lat: 46.2798, lng: -124.0531, status: 'online', last_communication: '1 min ago',
        sensor_count: 14, anomaly_count: 1, elevation: 32, firmware_version: 'v4.1.8-edge',
        battery_level: 91, signal_strength: 88, temperature: 21.6, humidity: 82,
        pressure: 1011.4, wind_speed: 29.4, wind_direction: 'SW', solar_radiation: 580, precipitation: 1.2
      },
      {
        id: 'st-03', name: 'Sonoran Solar Basin', code: 'SKY-SB-03',
        location: 'Maricopa Solar Field, AZ', region: 'Southwest Arid',
        lat: 33.0581, lng: -112.0476, status: 'online', last_communication: '2 mins ago',
        sensor_count: 18, anomaly_count: 3, elevation: 360, firmware_version: 'v4.2.0-rc',
        battery_level: 100, signal_strength: 96, temperature: 39.2, humidity: 19,
        pressure: 1008.5, wind_speed: 12.0, wind_direction: 'SSE', solar_radiation: 1020, precipitation: 0.0
      },
      {
        id: 'st-04', name: 'Great Plains Aerodrome', code: 'SKY-GP-04',
        location: 'Wichita Runway West, KS', region: 'Midwest Plains',
        lat: 37.6499, lng: -97.4331, status: 'online', last_communication: '30 sec ago',
        sensor_count: 20, anomaly_count: 0, elevation: 405, firmware_version: 'v4.1.8-edge',
        battery_level: 95, signal_strength: 92, temperature: 25.1, humidity: 58,
        pressure: 1014.8, wind_speed: 22.8, wind_direction: 'NNE', solar_radiation: 680, precipitation: 0.0
      },
      {
        id: 'st-05', name: 'Highland Alpine Post', code: 'SKY-HA-05',
        location: 'Vail Pass Summit, CO', region: 'Rocky Mountains',
        lat: 39.5297, lng: -106.2197, status: 'online', last_communication: 'Just now',
        sensor_count: 16, anomaly_count: 1, elevation: 3250, firmware_version: 'v4.1.7',
        battery_level: 84, signal_strength: 82, temperature: 9.8, humidity: 48,
        pressure: 712.4, wind_speed: 36.5, wind_direction: 'W', solar_radiation: 890, precipitation: 0.0
      },
      {
        id: 'st-06', name: 'Urban Core Metroplex', code: 'SKY-UC-06',
        location: 'Chicago Loop Tower Roof, IL', region: 'Great Lakes Urban',
        lat: 41.8781, lng: -87.6298, status: 'online', last_communication: '4 mins ago',
        sensor_count: 22, anomaly_count: 1, elevation: 210, firmware_version: 'v4.1.8-edge',
        battery_level: 99, signal_strength: 98, temperature: 24.3, humidity: 61,
        pressure: 1016.2, wind_speed: 14.5, wind_direction: 'E', solar_radiation: 610, precipitation: 0.0
      },
      {
        id: 'st-07', name: 'Everglades Wetland Station', code: 'SKY-EW-07',
        location: 'Shark Valley Basin, FL', region: 'Southeast Subtropical',
        lat: 25.7599, lng: -80.7656, status: 'degraded', last_communication: '14 mins ago',
        sensor_count: 12, anomaly_count: 0, elevation: 4, firmware_version: 'v4.0.9',
        battery_level: 62, signal_strength: 58, temperature: 31.7, humidity: 92,
        pressure: 1012.9, wind_speed: 8.4, wind_direction: 'SE', solar_radiation: 710, precipitation: 4.8
      },
      {
        id: 'st-08', name: 'Cascade Glacier Monitor', code: 'SKY-CG-08',
        location: 'Mount Baker North Ridge, WA', region: 'Northwest Alpine',
        lat: 48.7767, lng: -121.8144, status: 'online', last_communication: 'Just now',
        sensor_count: 14, anomaly_count: 0, elevation: 2180, firmware_version: 'v4.1.8-edge',
        battery_level: 89, signal_strength: 87, temperature: 4.2, humidity: 78,
        pressure: 798.1, wind_speed: 28.0, wind_direction: 'NW', solar_radiation: 420, precipitation: 0.0
      },
      {
        id: 'st-09', name: 'Mojave Dry Lakebed', code: 'SKY-MD-09',
        location: 'El Mirage Dry Lake, CA', region: 'California Desert',
        lat: 34.6289, lng: -117.6012, status: 'online', last_communication: '3 mins ago',
        sensor_count: 15, anomaly_count: 0, elevation: 870, firmware_version: 'v4.1.8-edge',
        battery_level: 94, signal_strength: 91, temperature: 36.8, humidity: 14,
        pressure: 1010.3, wind_speed: 16.4, wind_direction: 'SW', solar_radiation: 990, precipitation: 0.0
      },
      {
        id: 'st-10', name: 'Atlantic Harbour Terminal', code: 'SKY-AH-10',
        location: 'Boston Harbor Pier 7, MA', region: 'Northeast Maritime',
        lat: 42.3601, lng: -71.0589, status: 'online', last_communication: '1 min ago',
        sensor_count: 16, anomaly_count: 0, elevation: 8, firmware_version: 'v4.1.8-edge',
        battery_level: 97, signal_strength: 95, temperature: 20.4, humidity: 74,
        pressure: 1017.5, wind_speed: 21.0, wind_direction: 'ENE', solar_radiation: 540, precipitation: 0.0
      },
      {
        id: 'st-11', name: 'Ozark Plateau Remote', code: 'SKY-OP-11',
        location: 'Buffalo River Ridge, AR', region: 'Central Highlands',
        lat: 36.0381, lng: -92.9821, status: 'online', last_communication: '5 mins ago',
        sensor_count: 14, anomaly_count: 0, elevation: 640, firmware_version: 'v4.1.6',
        battery_level: 90, signal_strength: 86, temperature: 26.8, humidity: 67,
        pressure: 1014.2, wind_speed: 11.2, wind_direction: 'S', solar_radiation: 650, precipitation: 0.0
      },
      {
        id: 'st-12', name: 'Northern Tundra Sentinel', code: 'SKY-NT-12',
        location: 'Fairbanks Perimeter, AK', region: 'Subarctic Interior',
        lat: 64.8378, lng: -147.7164, status: 'offline', last_communication: '48 mins ago',
        sensor_count: 16, anomaly_count: 1, elevation: 136, firmware_version: 'v4.0.2',
        battery_level: 14, signal_strength: 18, temperature: -2.4, humidity: 86,
        pressure: 1022.1, wind_speed: 7.0, wind_direction: 'N', solar_radiation: 120, precipitation: 0.2
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO stations (
        id, name, code, location, region, lat, lng, status, last_communication,
        sensor_count, anomaly_count, elevation, firmware_version, battery_level, signal_strength,
        temperature, humidity, pressure, wind_speed, wind_direction, solar_radiation, precipitation
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    for (const s of seedStations) {
      insertStmt.run(
        s.id, s.name, s.code, s.location, s.region, s.lat, s.lng, s.status, s.last_communication,
        s.sensor_count, s.anomaly_count, s.elevation, s.firmware_version, s.battery_level, s.signal_strength,
        s.temperature, s.humidity, s.pressure, s.wind_speed, s.wind_direction, s.solar_radiation, s.precipitation
      );
    }
  }

  // 3. Seed Models if empty
  const modelCount = db.prepare('SELECT COUNT(*) as count FROM models').get().count;
  if (modelCount === 0) {
    console.log('[SKYGUARD-DB] Seeding evaluated models...');
    const evalResultsPath = path.resolve(__dirname, '../../ml-service/data/evaluation_results.json');
    if (fs.existsSync(evalResultsPath)) {
      try {
        const evalData = JSON.parse(fs.readFileSync(evalResultsPath, 'utf8'));
        const insModel = db.prepare(`
          INSERT INTO models (
            name, code, version, is_active, is_default, precision, recall, f1_score,
            accuracy, roc_auc, detection_rate, false_positive_rate, latency_ms,
            throughput_samples_sec, training_time_sec, calibrated_threshold,
            confusion_matrix_json, observations_trained, last_trained, hyperparameters_json, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const [name, m] of Object.entries(evalData.models)) {
          const isActive = name === 'Weighted Ensemble' ? 1 : 0;
          const isDefault = name === 'Weighted Ensemble' ? 1 : 0;
          insModel.run(
            m.name,
            m.code || 'SKY-ML',
            m.version || 'v1.0.0',
            isActive,
            isDefault,
            m.precision,
            m.recall,
            m.f1_score,
            m.accuracy,
            m.roc_auc,
            m.detection_rate,
            m.false_positive_rate,
            m.latency_ms,
            m.throughput_samples_sec || 20000,
            m.training_time_sec,
            m.calibrated_threshold || 0.8,
            JSON.stringify(m.confusion_matrix || {}),
            m.observations_trained || 11200,
            m.last_trained || new Date().toISOString(),
            JSON.stringify({ dataset: 'Jena Climate', train_samples: evalData.train_samples, features: evalData.metadata.features }),
            `Production ${m.name} detector evaluated on Jena Climate time-series benchmark.`
          );
        }
      } catch (err) {
        console.warn('[SKYGUARD-DB] Evaluation results parsing error:', err.message);
      }
    }
  }
}

seedDatabase();
