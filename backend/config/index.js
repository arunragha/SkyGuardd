import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = process.env.NODE_ENV || 'development';

// Security check: require explicit JWT secret in production
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (nodeEnv === 'production') {
    throw new Error('[FATAL SECURITY ERROR] JWT_SECRET environment variable must be explicitly defined in production mode.');
  }
  // In development/test mode, use deterministic dev key
  jwtSecret = 'skyguard_dev_only_jwt_signing_secret_do_not_use_in_prod';
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:5001',
  nodeEnv,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'skyguard.db'),
  telemetryMode: process.env.TELEMETRY_MODE || 'live_simulation', // 'live_simulation' or 'historical_replay'
  telemetryIntervalMs: parseInt(process.env.TELEMETRY_INTERVAL_MS, 10) || 3500,
  sseHeartbeatMs: 15000,
  corsOrigins: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) 
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173']
};
