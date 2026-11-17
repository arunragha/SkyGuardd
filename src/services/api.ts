import { 
  WeatherStation, 
  AnomalyRecord, 
  AlertItem, 
  MLModel, 
  WeatherMetricPoint, 
  AnomalyStatus, 
  AlertStatus 
} from '../types';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'skyguard_jwt_token';
const DEMO_MODE_KEY = 'skyguard_demo_mode_active';

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    fullName: string;
    role: string;
    organization?: string;
    department?: string;
    timezone?: string;
    avatar?: string;
  };
  error?: string;
}

export const api = {
  // Token management
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Explicit Demonstration Mode toggle
  isDemoMode: (): boolean => {
    return localStorage.getItem(DEMO_MODE_KEY) === 'true';
  },

  setDemoMode: (active: boolean): void => {
    localStorage.setItem(DEMO_MODE_KEY, active ? 'true' : 'false');
  },

  // Headers helper with Authorization
  getHeaders: (extraHeaders: Record<string, string> = {}): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    const token = api.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // HTTP Fetch wrapper with timeout and error handling
  request: async <T>(endpoint: string, options: RequestInit = {}, timeoutMs = 12000): Promise<{ data: T | null; error: string | null; status: number }> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: api.getHeaders((options.headers as Record<string, string>) || {}),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.status === 401) {
        // Token expired or invalid
        api.clearToken();
      }

      if (!res.ok) {
        let errMessage = `HTTP error ${res.status}`;
        try {
          const errBody = await res.json();
          errMessage = errBody.error || errBody.message || errMessage;
        } catch {
          // ignore parsing error
        }
        return { data: null, error: errMessage, status: res.status };
      }

      const data = await res.json();
      return { data, error: null, status: res.status };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return { data: null, error: `Request timed out after ${timeoutMs}ms`, status: 408 };
      }
      return { data: null, error: err.message || 'Network error', status: 0 };
    }
  },

  // -------------------------------------------------------------
  // 1. AUTHENTICATION ENDPOINTS
  // -------------------------------------------------------------
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res.error || !res.data) {
      return { success: false, error: res.error || 'Authentication failed' };
    }

    if (res.data.token) {
      api.setToken(res.data.token);
    }

    return {
      success: true,
      token: res.data.token,
      user: res.data.user
    };
  },

  register: async (name: string, email: string, password: string, role = 'operator'): Promise<AuthResponse> => {
    const res = await api.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });

    if (res.error || !res.data) {
      return { success: false, error: res.error || 'Registration failed' };
    }

    if (res.data.token) {
      api.setToken(res.data.token);
    }

    return {
      success: true,
      token: res.data.token,
      user: res.data.user
    };
  },

  getCurrentUser: async (): Promise<any | null> => {
    const res = await api.request<any>('/auth/me', { method: 'GET' });
    return res.data?.user || null;
  },

  // -------------------------------------------------------------
  // 2. SYSTEM HEALTH
  // -------------------------------------------------------------
  checkHealth: async () => {
    const res = await api.request<any>('/health', { method: 'GET' }, 4000);
    return res.data;
  },

  // -------------------------------------------------------------
  // 3. WEATHER STATIONS
  // -------------------------------------------------------------
  getStations: async (): Promise<WeatherStation[] | null> => {
    const res = await api.request<{ success: boolean; stations: WeatherStation[] }>('/stations');
    return res.data?.stations || null;
  },

  createStation: async (stationData: Partial<WeatherStation>): Promise<WeatherStation | null> => {
    const res = await api.request<{ success: boolean; station: WeatherStation }>('/stations', {
      method: 'POST',
      body: JSON.stringify(stationData)
    });
    return res.data?.station || null;
  },

  // -------------------------------------------------------------
  // 4. TELEMETRY & STREAMING
  // -------------------------------------------------------------
  getTimeSeries: async (stationId = 'st-01', limit = 48): Promise<WeatherMetricPoint[] | null> => {
    const res = await api.request<{ success: boolean; points: WeatherMetricPoint[] }>(`/telemetry/timeseries?station_id=${stationId}&limit=${limit}`);
    return res.data?.points || null;
  },

  setTelemetryMode: async (mode: 'live_simulation' | 'historical_replay'): Promise<boolean> => {
    const res = await api.request<any>('/telemetry/mode', {
      method: 'POST',
      body: JSON.stringify({ mode })
    });
    return !res.error;
  },

  injectAnomaly: async (data: { station_id?: string; parameter?: string; value?: number; anomaly_type?: string }) => {
    const res = await api.request<any>('/telemetry/inject-anomaly', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // -------------------------------------------------------------
  // 5. ANOMALY DETECTION & INFERENCE
  // -------------------------------------------------------------
  getAnomalies: async (limit = 100): Promise<AnomalyRecord[] | null> => {
    const res = await api.request<{ success: boolean; anomalies: AnomalyRecord[] }>(`/anomalies?limit=${limit}`);
    return res.data?.anomalies || null;
  },

  updateAnomalyStatus: async (id: string, status: AnomalyStatus): Promise<boolean> => {
    const res = await api.request<any>(`/anomalies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return !res.error;
  },

  runAnomalyDetection: async () => {
    const res = await api.request<any>('/anomalies/detect', { method: 'POST' });
    return res.data;
  },

  // -------------------------------------------------------------
  // 6. OPERATIONAL ALERTS
  // -------------------------------------------------------------
  getAlerts: async (limit = 100): Promise<AlertItem[] | null> => {
    const res = await api.request<{ success: boolean; alerts: AlertItem[] }>(`/alerts?limit=${limit}`);
    return res.data?.alerts || null;
  },

  updateAlertStatus: async (id: string, status: AlertStatus): Promise<boolean> => {
    const res = await api.request<any>(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return !res.error;
  },

  markAllAlertsAsRead: async (): Promise<boolean> => {
    const res = await api.request<any>('/alerts/read-all', { method: 'POST' });
    return !res.error;
  },

  // -------------------------------------------------------------
  // 7. ML MODELS & REGISTRY
  // -------------------------------------------------------------
  getModels: async () => {
    const res = await api.request<any>('/models');
    return res.data;
  },

  selectModel: async (modelName: string): Promise<boolean> => {
    const res = await api.request<any>('/models/select', {
      method: 'POST',
      body: JSON.stringify({ model_name: modelName })
    });
    return !res.error;
  },

  trainModel: async (modelName: string) => {
    const res = await api.request<any>('/models/train', {
      method: 'POST',
      body: JSON.stringify({ model_name: modelName })
    }, 45000); // 45s timeout for deep learning retraining
    return res.data;
  },

  // -------------------------------------------------------------
  // 8. REPORTS & ANALYTICS EXPORT
  // -------------------------------------------------------------
  getReportSummary: async () => {
    const res = await api.request<any>('/reports/summary');
    return res.data;
  },

  getAnomaliesCSVUrl: () => {
    const token = api.getToken();
    return `${API_BASE_URL}/reports/anomalies/csv${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  getModelsCSVUrl: () => {
    const token = api.getToken();
    return `${API_BASE_URL}/reports/models/csv${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  }
};
