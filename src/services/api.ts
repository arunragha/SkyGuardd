import { WeatherStation, AnomalyRecord, AlertItem, MLModel, WeatherMetricPoint, AnomalyStatus, AlertStatus } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Stations
  getStations: async (): Promise<WeatherStation[] | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/stations`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.stations || null;
    } catch {
      return null;
    }
  },

  createStation: async (stationData: Partial<WeatherStation>): Promise<WeatherStation | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/stations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stationData)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.station || null;
    } catch {
      return null;
    }
  },

  // Telemetry time-series
  getTimeSeries: async (): Promise<WeatherMetricPoint[] | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/telemetry/timeseries`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.points || null;
    } catch {
      return null;
    }
  },

  // Anomalies & Inference
  getAnomalies: async (): Promise<AnomalyRecord[] | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/anomalies`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.anomalies || null;
    } catch {
      return null;
    }
  },

  updateAnomalyStatus: async (id: string, status: AnomalyStatus): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/anomalies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  runAnomalyDetection: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/anomalies/detect`, {
        method: 'POST'
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Alerts
  getAlerts: async (): Promise<AlertItem[] | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.alerts || null;
    } catch {
      return null;
    }
  },

  updateAlertStatus: async (id: string, status: AlertStatus): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ML Models & Training
  getModels: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/models`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  selectModel: async (modelName: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/models/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_name: modelName })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  trainModel: async (modelName: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/models/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_name: modelName })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  injectAnomaly: async (data: { station_id?: string; parameter?: string; value?: number; anomaly_type?: string }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/telemetry/inject-anomaly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Telemetry Mode Switching
  setTelemetryMode: async (mode: 'live_simulation' | 'historical_replay'): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/telemetry/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Reports & Analytics Export
  getReportSummary: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/summary`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  getAnomaliesCSVUrl: () => `${API_BASE_URL}/reports/anomalies/csv`,
  getModelsCSVUrl: () => `${API_BASE_URL}/reports/models/csv`
};
