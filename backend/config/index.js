import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:5001',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'skyguard_super_secret_jwt_key_2026_scientific_meteorology',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'skyguard.db'),
  telemetryMode: process.env.TELEMETRY_MODE || 'live_simulation', // 'live_simulation' or 'historical_replay'
  telemetryIntervalMs: parseInt(process.env.TELEMETRY_INTERVAL_MS, 10) || 3500,
  sseHeartbeatMs: 15000,
  corsOrigins: process.env.CORS_ORIGIN || '*'
};
