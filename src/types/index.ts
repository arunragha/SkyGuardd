export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type StationStatus = 'online' | 'offline' | 'degraded';

export type AnomalyStatus = 'detected' | 'investigating' | 'acknowledged' | 'resolved';

export type AlertType = 'critical' | 'high' | 'medium' | 'low' | 'malfunction' | 'missing_data';

export type AlertStatus = 'unread' | 'read' | 'acknowledged' | 'resolved';

export type AlgorithmType = 
  | 'Isolation Forest' 
  | 'Local Outlier Factor' 
  | 'One-Class SVM' 
  | 'DBSCAN' 
  | 'Conv1D Autoencoder' 
  | 'Statistical Detector' 
  | 'Weighted Ensemble'
  | string;

export type SensorType = 'temperature' | 'humidity' | 'pressure' | 'windSpeed' | 'windDirection' | 'solarRadiation' | 'precipitation' | 'airQualityIndex';

export interface WeatherStation {
  id: string;
  name: string;
  code: string;
  location: string;
  region: string;
  lat: number;
  lng: number;
  status: StationStatus;
  lastCommunication: string;
  sensorCount: number;
  anomalyCount: number;
  elevation: number;
  firmwareVersion: string;
  batteryLevel: number;
  signalStrength: number;
  currentReadings: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: string;
    solarRadiation: number;
    precipitation: number;
  };
}

export interface WeatherMetricPoint {
  time: string;
  timestamp: number;
  temperature: number;
  tempExpectedMin: number;
  tempExpectedMax: number;
  isAnomalyTemp?: boolean;
  humidity: number;
  humExpectedMin: number;
  humExpectedMax: number;
  isAnomalyHum?: boolean;
  pressure: number;
  pressExpectedMin: number;
  pressExpectedMax: number;
  isAnomalyPress?: boolean;
  windSpeed: number;
  windExpectedMin: number;
  windExpectedMax: number;
  isAnomalyWind?: boolean;
}

export interface AnomalyRecord {
  id: string;
  observationId: string;
  stationId: string;
  stationName: string;
  sensorParameter: SensorType;
  parameterLabel: string;
  observedValue: number;
  unit: string;
  expectedBaseline: number;
  expectedRange: [number, number];
  anomalyScore: number; // 0.00 to 1.00
  severity: SeverityLevel;
  detectionAlgorithm: AlgorithmType;
  timestamp: string;
  status: AnomalyStatus;
  explanation: string;
  recommendation: string;
  confidence: number;
  zScore: number;
  historicalContext: {
    rollingAvg7d: number;
    standardDev: number;
    minPastMonth: number;
    maxPastMonth: number;
  };
}

export interface AlertItem {
  id: string;
  title: string;
  stationId: string;
  stationName: string;
  sensor: string;
  severity: AlertType;
  timestamp: string;
  description: string;
  status: AlertStatus;
  anomalyId?: string;
}

export interface MLModel {
  id: string;
  name: AlgorithmType;
  code: string;
  version: string;
  status: 'active' | 'standby' | 'training';
  isDefault: boolean;
  lastTrainingDate: string;
  observationsTrained: number;
  trainingDuration: string;
  precision: number;
  recall: number;
  f1Score: number;
  detectionRate: number;
  trainingTimeSec: number;
  latencyMs: number;
  accuracy: number;
  contaminationRate: number;
  description: string;
  hyperparameters: Record<string, string | number>;
  strengths: string[];
  limitations: string[];
  rocAuc?: number;
  falsePositiveRate?: number;
  confusionMatrix?: {
    tp: number;
    fp: number;
    fn: number;
    tn: number;
  };
}

export interface ReportItem {
  id: string;
  title: string;
  type: 'anomaly_summary' | 'station_wise' | 'weather_trend' | 'model_evaluation' | 'historical_anomaly';
  typeLabel: string;
  generationDate: string;
  dateRange: string;
  stationTarget: string;
  recordCount: number;
  fileSize: string;
  status: 'ready' | 'generating';
  summary: string;
}

export interface SystemHealth {
  overallHealth: number; // 0-100%
  activeSensors: number;
  totalSensors: number;
  dataSyncRate: number; // e.g. 99.8%
  apiLatencyMs: number;
  modelInferenceTimeMs: number;
  lastSyncTime: string;
}

