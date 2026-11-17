import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { requestLogger, centralizedErrorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { telemetryService } from './services/telemetryService.js';
import { mlService } from './services/mlService.js';
import { stationRepository } from './db/repositories/stationRepository.js';
import { anomalyRepository } from './db/repositories/anomalyRepository.js';
import { alertRepository } from './db/repositories/alertRepository.js';
import { modelRepository } from './db/repositories/modelRepository.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import anomalyRoutes from './routes/anomalyRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

// Security & Base middleware
app.use(securityHeaders);
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile, curl, server-to-server) or listed origins
    if (!origin || config.corsOrigins.includes(origin) || config.corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy violation: origin ${origin} is not authorized`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '2mb' }));
app.use(requestLogger);
app.use(rateLimiter({ windowMs: 60000, max: 500 }));

// -------------------------------------------------------------
// 1. SYSTEM HEALTH
// -------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  const mlHealth = await mlService.checkHealth();
  const stations = stationRepository.getAll();
  const anomalies = anomalyRepository.getAll(10);
  const alerts = alertRepository.getAll(10);
  const models = modelRepository.getAll();
  const activeModel = models.find(m => m.is_active)?.name || 'Weighted Ensemble';

  res.json({
    status: 'online',
    service: 'SKYGUARD Node.js API Gateway',
    version: '2.0.0-enterprise',
    timestamp: new Date().toISOString(),
    database: {
      engine: 'SQLite (node:sqlite WAL mode)',
      status: 'healthy',
      totalStations: stations.length,
      totalAnomalies: anomalies.length,
      totalAlerts: alerts.length,
      activeModel
    },
    ml_microservice: mlHealth,
    telemetry: {
      mode: telemetryService.mode,
      activeClients: telemetryService.clients.size,
      intervalMs: config.telemetryIntervalMs
    }
  });
});

// -------------------------------------------------------------
// 2. MODULAR API ROUTES
// -------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/reports', reportRoutes);

// -------------------------------------------------------------
// 3. 404 & CENTRALIZED ERROR HANDLING
// -------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}`,
    message: 'Endpoint not found on SkyGuard API Gateway'
  });
});

app.use(centralizedErrorHandler);

// -------------------------------------------------------------
// 4. SERVER INITIALIZATION & GRACEFUL SHUTDOWN
// -------------------------------------------------------------
let server = null;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🛡️  SKYGUARD Backend Gateway listening on port ${config.port}`);
    console.log(`📊 Mode: ${config.nodeEnv.toUpperCase()} | Telemetry: ${config.telemetryMode}`);
    console.log(`🤖 ML Service target: ${config.mlServiceUrl}`);
    console.log(`📁 Database: ${config.dbPath}`);
    console.log(`=======================================================`);

    // Start background telemetry tick loop and SSE broadcaster
    telemetryService.start();
  });

  const handleShutdown = (signal) => {
    console.log(`\n[Server] Received ${signal}. Gracefully stopping SkyGuard services...`);
    telemetryService.stop();
    if (server) {
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

export default app;
