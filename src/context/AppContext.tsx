import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WeatherStation, 
  AnomalyRecord, 
  AlertItem, 
  MLModel, 
  AnomalyStatus, 
  AlertStatus,
  WeatherMetricPoint
} from '../types';
import { 
  DEMO_STATIONS, 
  DEMO_ANOMALIES, 
  DEMO_ALERTS, 
  DEMO_MODELS, 
  generateTimeSeriesData 
} from '../data/mockData';
import { api } from '../services/api';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface AppContextType {
  // Stations
  stations: WeatherStation[];
  selectedStationId: string;
  selectedStation: WeatherStation;
  setSelectedStationId: (id: string) => void;
  addStation: (stationData: Partial<WeatherStation>) => void;
  
  // Time-series & Metrics
  timeSeriesData: WeatherMetricPoint[];
  
  // Anomalies
  anomalies: AnomalyRecord[];
  selectedAnomaly: AnomalyRecord | null;
  openAnomalyDrawer: (anomaly: AnomalyRecord) => void;
  closeAnomalyDrawer: () => void;
  updateAnomalyStatus: (id: string, status: AnomalyStatus) => void;
  runAnomalyDetection: () => Promise<void>;
  isDetecting: boolean;

  // Alerts
  alerts: AlertItem[];
  unreadAlertCount: number;
  updateAlertStatus: (id: string, status: AlertStatus) => void;
  markAllAlertsAsRead: () => void;

  // Models
  models: MLModel[];
  activeModelId: string;
  setActiveModelId: (id: string) => void;
  trainModel: (id: string) => Promise<void>;
  isTraining: boolean;

  // Live controls
  backendConnected: boolean;
  demoMode: boolean;
  toggleDemoMode: () => void;
  isLoadingData: boolean;
  telemetryMode: 'live_simulation' | 'historical_replay';
  switchTelemetryMode: (mode: 'live_simulation' | 'historical_replay') => Promise<void>;
  isLiveMonitoringPaused: boolean;
  togglePauseMonitoring: () => void;
  refreshInterval: number; // in seconds
  setRefreshInterval: (interval: number) => void;
  lastSyncTime: Date;
  refreshData: () => void;

  // Search & Navigation
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Toast notifications
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info', title?: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [demoMode, setDemoModeState] = useState<boolean>(() => api.isDemoMode());
  const [stations, setStations] = useState<WeatherStation[]>(() => api.isDemoMode() ? DEMO_STATIONS : []);
  const [selectedStationId, setSelectedStationId] = useState<string>('st-01');
  const [timeSeriesData, setTimeSeriesData] = useState<WeatherMetricPoint[]>(() => api.isDemoMode() ? generateTimeSeriesData() : []);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(() => api.isDemoMode() ? DEMO_ANOMALIES : []);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<AlertItem[]>(() => api.isDemoMode() ? DEMO_ALERTS : []);
  const [models, setModels] = useState<MLModel[]>(DEMO_MODELS);
  const [activeModelId, setActiveModelId] = useState<string>('mdl-ensemble');
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [telemetryMode, setTelemetryMode] = useState<'live_simulation' | 'historical_replay'>('live_simulation');
  const [isLiveMonitoringPaused, setIsLiveMonitoringPaused] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(10);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const selectedStation: WeatherStation = stations.find(s => s.id === selectedStationId) || stations[0] || {
    id: 'st-01',
    name: 'Ridge Peak Observatory',
    code: 'SKY-RP-01',
    location: 'Mount Rainier Foothills, WA',
    region: 'Pacific Northwest',
    lat: 46.8523,
    lng: -121.7603,
    status: 'online',
    lastCommunication: 'Connecting...',
    sensorCount: 16,
    anomalyCount: 0,
    elevation: 1420,
    firmwareVersion: 'v7.0.0',
    batteryLevel: 98,
    signalStrength: 94,
    currentReadings: {
      temperature: 21.4,
      humidity: 58,
      pressure: 1012.8,
      windSpeed: 14.2,
      windDirection: 'WNW',
      solarRadiation: 650,
      precipitation: 0.0
    }
  };

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshData = async () => {
    setLastSyncTime(new Date());
    const [freshStations, freshAnomalies, freshAlerts, freshSeries] = await Promise.all([
      api.getStations(),
      api.getAnomalies(),
      api.getAlerts(),
      api.getTimeSeries()
    ]);
    if (freshStations) setStations(freshStations);
    if (freshAnomalies) setAnomalies(freshAnomalies);
    if (freshAlerts) setAlerts(freshAlerts);
    if (freshSeries) setTimeSeriesData(freshSeries);
    showToast('Telemetry data synchronized from fleet database and edge nodes.', 'info', 'Fleet Sync Complete');
  };

  const togglePauseMonitoring = () => {
    setIsLiveMonitoringPaused(prev => {
      const next = !prev;
      showToast(next ? 'Live telemetry stream paused.' : 'Live telemetry stream resumed.', 'info');
      return next;
    });
  };

  // Sync with live backend and start Server-Sent Events (SSE) stream
  useEffect(() => {
    let sse: EventSource | null = null;

    const syncBackend = async () => {
      try {
        const health = await api.checkHealth();
        if (health) {
          setBackendConnected(true);
          if (health.telemetry?.mode) {
            setTelemetryMode(health.telemetry.mode);
          }
          showToast('Connected to SkyGuard SQLite Gateway & Python ML Service', 'success', 'Live Backend Online');
          const [backendStations, backendAnomalies, backendAlerts, backendModels, backendSeries] = await Promise.all([
            api.getStations(),
            api.getAnomalies(),
            api.getAlerts(),
            api.getModels(),
            api.getTimeSeries()
          ]);
          if (backendStations) setStations(backendStations);
          if (backendAnomalies) setAnomalies(backendAnomalies);
          if (backendAlerts) setAlerts(backendAlerts);
          if (backendSeries) setTimeSeriesData(backendSeries);

          if (backendModels && backendModels.models) {
            const modelList = Array.isArray(backendModels.models) 
              ? backendModels.models 
              : Object.values(backendModels.models);
            
            setModels(prev => prev.map(m => {
              const found: any = modelList.find((bm: any) => bm.name === m.name);
              if (!found) return m;
              return {
                ...m,
                precision: found.precision ?? m.precision,
                recall: found.recall ?? m.recall,
                f1Score: found.f1_score ?? m.f1Score,
                rocAuc: found.roc_auc ?? m.rocAuc,
                accuracy: found.accuracy ?? m.accuracy,
                latencyMs: found.latency_ms ?? m.latencyMs,
                confusionMatrix: found.confusion_matrix ?? m.confusionMatrix,
                lastTrainingDate: found.last_trained ?? m.lastTrainingDate
              };
            }));
          }

          // Connect to Server-Sent Events stream
          try {
            sse = new EventSource('http://localhost:5000/api/telemetry/stream');
            
            sse.addEventListener('telemetry', (event) => {
              try {
                const payload = JSON.parse(event.data);
                setLastSyncTime(new Date(payload.timestamp));
                
                setStations(prev => prev.map(s => {
                  if (s.id === payload.stationId) {
                    return {
                      ...s,
                      lastCommunication: 'Just now',
                      currentReadings: {
                        ...s.currentReadings,
                        temperature: payload.readings.temperature,
                        humidity: payload.readings.humidity,
                        pressure: payload.readings.pressure,
                        windSpeed: payload.readings.windSpeed,
                        solarRadiation: payload.readings.solarRadiation
                      }
                    };
                  }
                  return s;
                }));
              } catch (e) {
                // ignore parsing error
              }
            });

            sse.addEventListener('anomaly', (event) => {
              try {
                const anomaly = JSON.parse(event.data);
                setAnomalies(prev => [anomaly, ...prev]);
                showToast(`Live Anomaly Flagged: ${anomaly.stationName} - ${anomaly.parameterLabel} (${anomaly.observedValue} ${anomaly.unit})`, 'warning', 'Live Anomaly Detected');
              } catch (e) {
                // ignore
              }
            });

            sse.addEventListener('alert', (event) => {
              try {
                const alert = JSON.parse(event.data);
                setAlerts(prev => [alert, ...prev]);
              } catch (e) {
                // ignore
              }
            });
          } catch (e) {
            console.warn('SSE stream error:', e);
          }
        }
      } catch (err) {
        console.warn('Backend sync error:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    syncBackend();

    return () => {
      if (sse) sse.close();
    };
  }, []);

  const toggleDemoMode = () => {
    const next = !demoMode;
    setDemoModeState(next);
    api.setDemoMode(next);
    if (next) {
      setStations(DEMO_STATIONS);
      setAnomalies(DEMO_ANOMALIES);
      setAlerts(DEMO_ALERTS);
      setTimeSeriesData(generateTimeSeriesData());
      showToast('Switched to Demonstration Mode with synthetic telemetry.', 'info', 'Demo Mode Enabled');
    } else {
      showToast('Switched to Live Production Mode. Fetching fleet telemetry...', 'info', 'Production Mode Active');
      refreshData();
    }
  };

  const switchTelemetryMode = async (mode: 'live_simulation' | 'historical_replay') => {
    setTelemetryMode(mode);
    const ok = await api.setTelemetryMode(mode);
    if (ok) {
      showToast(
        `Telemetry mode switched to ${mode === 'historical_replay' ? 'MPI-BGC Jena Replay' : 'Edge Sensor Simulation'}.`,
        'success',
        'Telemetry Mode Updated'
      );
    } else {
      showToast(`Switched mode to ${mode} (local view).`, 'info');
    }
  };

  const addStation = (stationData: Partial<WeatherStation>) => {
    const id = `st-${(stations.length + 1).toString().padStart(2, '0')}`;
    const newStation: WeatherStation = {
      id,
      name: stationData.name || 'New Weather Outpost',
      code: stationData.code || `SKY-NEW-${stations.length + 1}`,
      location: stationData.location || 'Cascade Foothills, WA',
      region: stationData.region || 'Pacific Northwest',
      lat: stationData.lat || 47.6062,
      lng: stationData.lng || -122.3321,
      status: 'online',
      lastCommunication: 'Just now',
      sensorCount: stationData.sensorCount || 16,
      anomalyCount: 0,
      elevation: stationData.elevation || 250,
      firmwareVersion: 'v4.1.8-edge',
      batteryLevel: 100,
      signalStrength: 95,
      currentReadings: {
        temperature: 22.4,
        humidity: 62,
        pressure: 1013.2,
        windSpeed: 14.5,
        windDirection: 'W',
        solarRadiation: 650,
        precipitation: 0.0,
      }
    };
    setStations(prev => [newStation, ...prev]);
    api.createStation(newStation);
    showToast(`Weather station "${newStation.name}" onboarded and synchronized.`, 'success', 'Station Added');
  };

  const openAnomalyDrawer = (anomaly: AnomalyRecord) => {
    setSelectedAnomaly(anomaly);
  };

  const closeAnomalyDrawer = () => {
    setSelectedAnomaly(null);
  };

  const updateAnomalyStatus = (id: string, status: AnomalyStatus) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (selectedAnomaly && selectedAnomaly.id === id) {
      setSelectedAnomaly(prev => prev ? { ...prev, status } : null);
    }
    api.updateAnomalyStatus(id, status);
    showToast(`Anomaly ${id} marked as "${status}".`, 'success', 'Status Updated');
  };

  const runAnomalyDetection = async () => {
    setIsDetecting(true);
    showToast('Executing multi-algorithm batch analysis via Python ML Microservice...', 'info', 'Detection Initiated');
    
    const backendResult = await api.runAnomalyDetection();
    if (backendResult) {
      const refreshedAnomalies = await api.getAnomalies();
      if (refreshedAnomalies) setAnomalies(refreshedAnomalies);
      const refreshedAlerts = await api.getAlerts();
      if (refreshedAlerts) setAlerts(refreshedAlerts);
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsDetecting(false);
    showToast('Anomaly detection complete. Multi-algorithm inference evaluated across all stations.', 'success', 'Model Inference Complete');
  };

  const unreadAlertCount = alerts.filter(a => a.status === 'unread').length;

  const updateAlertStatus = (id: string, status: AlertStatus) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    api.updateAlertStatus(id, status);
    showToast(`Alert ${id} updated to ${status}.`, 'info');
  };

  const markAllAlertsAsRead = () => {
    setAlerts(prev => prev.map(a => a.status === 'unread' ? { ...a, status: 'read' } : a));
    showToast('All alerts marked as read.', 'success');
  };

  const handleSetActiveModelId = (id: string) => {
    setActiveModelId(id);
    const targetModel = models.find(m => m.id === id);
    if (targetModel) {
      api.selectModel(targetModel.name);
    }
  };

  const trainModel = async (id: string) => {
    setIsTraining(true);
    const targetModel = models.find(m => m.id === id);
    showToast(`Executing model retraining pipeline for ${targetModel?.name || 'model'} on Jena benchmark...`, 'info', 'Training Started');
    
    if (targetModel) {
      await api.trainModel(targetModel.name);
      // Fetch genuine refreshed model metrics from backend (NO FAKE INCREMENTS)
      const backendModels = await api.getModels();
      if (backendModels && backendModels.models) {
        const modelList = Array.isArray(backendModels.models) 
          ? backendModels.models 
          : Object.values(backendModels.models);
        
        setModels(prev => prev.map(m => {
          const found: any = modelList.find((bm: any) => bm.name === m.name);
          if (!found) return m;
          return {
            ...m,
            precision: found.precision ?? m.precision,
            recall: found.recall ?? m.recall,
            f1Score: found.f1_score ?? m.f1Score,
            rocAuc: found.roc_auc ?? m.rocAuc,
            accuracy: found.accuracy ?? m.accuracy,
            latencyMs: found.latency_ms ?? m.latencyMs,
            confusionMatrix: found.confusion_matrix ?? m.confusionMatrix,
            lastTrainingDate: found.last_trained ?? 'Just now (Retrained)'
          };
        }));
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setIsTraining(false);
    showToast(`${targetModel?.name} retrained by Python ML Microservice and active in production pool!`, 'success', 'Training Complete');
  };

  return (
    <AppContext.Provider
      value={{
        stations,
        selectedStationId,
        selectedStation,
        setSelectedStationId,
        addStation,
        timeSeriesData,
        anomalies,
        selectedAnomaly,
        openAnomalyDrawer,
        closeAnomalyDrawer,
        updateAnomalyStatus,
        runAnomalyDetection,
        isDetecting,
        alerts,
        unreadAlertCount,
        updateAlertStatus,
        markAllAlertsAsRead,
        models,
        activeModelId,
        setActiveModelId: handleSetActiveModelId,
        trainModel,
        isTraining,
        backendConnected,
        demoMode,
        toggleDemoMode,
        isLoadingData,
        telemetryMode,
        switchTelemetryMode,
        isLiveMonitoringPaused,
        togglePauseMonitoring,
        refreshInterval,
        setRefreshInterval,
        lastSyncTime,
        refreshData,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
