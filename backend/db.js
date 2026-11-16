import { db, runMigrations, seedDatabase } from './db/database.js';
import { userRepository } from './db/repositories/userRepository.js';
import { stationRepository } from './db/repositories/stationRepository.js';
import { telemetryRepository } from './db/repositories/telemetryRepository.js';
import { anomalyRepository } from './db/repositories/anomalyRepository.js';
import { alertRepository } from './db/repositories/alertRepository.js';
import { modelRepository } from './db/repositories/modelRepository.js';
import { systemEventRepository } from './db/repositories/systemEventRepository.js';

export { db, runMigrations, seedDatabase };

export const dbQueries = {
  // Stations
  getStations: stationRepository.getAll,
  getStationById: stationRepository.getById,
  createStation: stationRepository.create,
  updateStationReadings: stationRepository.updateReadings,
  incrementStationAnomalyCount: stationRepository.incrementAnomalyCount,

  // Telemetry
  getTelemetryTimeSeries: telemetryRepository.getTimeSeries,
  insertTelemetryPoint: telemetryRepository.insert,

  // Anomalies
  getAnomalies: anomalyRepository.getAll,
  getAnomalyById: anomalyRepository.getById,
  insertAnomaly: anomalyRepository.insert,
  updateAnomalyStatus: anomalyRepository.updateStatus,

  // Alerts
  getAlerts: alertRepository.getAll,
  insertAlert: alertRepository.insert,
  updateAlertStatus: alertRepository.updateStatus,
  markAllAlertsAsRead: alertRepository.markAllAsRead,

  // Models
  getModels: modelRepository.getAll,
  setActiveModel: modelRepository.setActive,
  recordTrainingRun: modelRepository.recordTrainingRun,
  getTrainingRuns: modelRepository.getTrainingRuns,

  // Users
  getUserByEmail: userRepository.findByEmail,
  getUserById: userRepository.findById,
  createUser: userRepository.create,

  // System Events
  logSystemEvent: systemEventRepository.logEvent,
  getSystemEvents: systemEventRepository.getRecent
};
