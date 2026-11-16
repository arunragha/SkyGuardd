import { WeatherStation, AnomalyRecord, AlertItem, MLModel, ReportItem, WeatherMetricPoint } from '../types';

export const DEMO_STATIONS: WeatherStation[] = [
  {
    id: 'st-01',
    name: 'Ridge Peak Observatory',
    code: 'SKY-RP-01',
    location: 'Mount Rainier Foothills, WA',
    region: 'Northwest Region',
    lat: 46.8523,
    lng: -121.7603,
    status: 'online',
    lastCommunication: 'Just now',
    sensorCount: 16,
    anomalyCount: 2,
    elevation: 1420,
    firmwareVersion: 'v4.1.8-edge',
    batteryLevel: 98,
    signalStrength: 94,
    currentReadings: {
      temperature: 28.4,
      humidity: 64,
      pressure: 1013.2,
      windSpeed: 18.2,
      windDirection: 'WNW',
      solarRadiation: 740,
      precipitation: 0.0,
    }
  },
  {
    id: 'st-02',
    name: 'Coastal Bay Sentinel',
    code: 'SKY-CB-02',
    location: 'Cape Disappointment, WA',
    region: 'Pacific Marine',
    lat: 46.2798,
    lng: -124.0531,
    status: 'online',
    lastCommunication: '1 min ago',
    sensorCount: 14,
    anomalyCount: 1,
    elevation: 32,
    firmwareVersion: 'v4.1.8-edge',
    batteryLevel: 91,
    signalStrength: 88,
    currentReadings: {
      temperature: 21.6,
      humidity: 82,
      pressure: 1011.4,
      windSpeed: 29.4,
      windDirection: 'SW',
      solarRadiation: 580,
      precipitation: 1.2,
    }
  },
  {
    id: 'st-03',
    name: 'Sonoran Solar Basin',
    code: 'SKY-SB-03',
    location: 'Maricopa Solar Field, AZ',
    region: 'Southwest Arid',
    lat: 33.0581,
    lng: -112.0476,
    status: 'online',
    lastCommunication: '2 mins ago',
    sensorCount: 18,
    anomalyCount: 3,
    elevation: 360,
    firmwareVersion: 'v4.2.0-rc',
    batteryLevel: 100,
    signalStrength: 96,
    currentReadings: {
      temperature: 39.2,
      humidity: 19,
      pressure: 1008.5,
      windSpeed: 12.0,
      windDirection: 'SSE',
      solarRadiation: 1020,
      precipitation: 0.0,
    }
  },
  {
    id: 'st-04',
    name: 'Great Plains Aerodrome',
    code: 'SKY-GP-04',
    location: 'Wichita Runway West, KS',
    region: 'Midwest Plains',
    lat: 37.6499,
    lng: -97.4331,
    status: 'online',
    lastCommunication: '30 sec ago',
    sensorCount: 20,
    anomalyCount: 0,
    elevation: 405,
    firmwareVersion: 'v4.1.8-edge',
    batteryLevel: 95,
    signalStrength: 92,
    currentReadings: {
      temperature: 25.1,
      humidity: 58,
      pressure: 1014.8,
      windSpeed: 22.8,
      windDirection: 'NNE',
      solarRadiation: 680,
      precipitation: 0.0,
    }
  },
  {
    id: 'st-05',
    name: 'Highland Alpine Post',
    code: 'SKY-HA-05',
    location: 'Vail Pass Summit, CO',
    region: 'Rocky Mountains',
    lat: 39.5297,
    lng: -106.2197,
    status: 'online',
    lastCommunication: 'Just now',
    sensorCount: 16,
    anomalyCount: 1,
    elevation: 3250,
    firmwareVersion: 'v4.1.7',
    batteryLevel: 84,
    signalStrength: 82,
    currentReadings: {
      temperature: 9.8,
      humidity: 48,
      pressure: 712.4,
      windSpeed: 36.5,
      windDirection: 'W',
      solarRadiation: 890,
      precipitation: 0.0,
    }
  },
  {
    id: 'st-06',
    name: 'Urban Core Metroplex',
    code: 'SKY-UC-06',
    location: 'Chicago Loop Tower Roof, IL',
    region: 'Great Lakes Urban',
    lat: 41.8781,
    lng: -87.6298,
    status: 'online',
    lastCommunication: '4 mins ago',
    sensorCount: 22,
    anomalyCount: 1,
    elevation: 210,
    firmwareVersion: 'v4.1.8-edge',
    batteryLevel: 99,
    signalStrength: 98,
    currentReadings: {
      temperature: 24.3,
      humidity: 61,
      pressure: 1016.2,
      windSpeed: 14.5,
      windDirection: 'E',
      solarRadiation: 610,
      precipitation: 0.0,
    }
  },
  {
    id: 'st-07',
    name: 'Everglades Wetland Station',
    code: 'SKY-EW-07',
    location: 'Shark Valley Basin, FL',
    region: 'Southeast Subtropical',
    lat: 25.7599,
    lng: -80.7656,
    status: 'degraded',
    lastCommunication: '14 mins ago',
    sensorCount: 12,
    anomalyCount: 0,
    elevation: 4,
    firmwareVersion: 'v4.0.9',
    batteryLevel: 62,
    signalStrength: 58,
    currentReadings: {
      temperature: 31.7,
      humidity: 92,
      pressure: 1012.9,
      windSpeed: 8.4,
      windDirection: 'SE',
      solarRadiation: 710,
      precipitation: 4.8,
    }
  },
  {
    id: 'st-08',
    name: 'Cascade Glacier Monitor',
    code: 'SKY-CG-08',
    location: 'Mount Baker North Ridge, WA',
    region: 'Northwest Alpine',
    lat: 48.7767,
    lng: -121.8144,
    status: 'online',
    lastCommunication: 'Just now',
    sensorCount: 14,
    anomalyCount: 0,
    elevation: 2180,
    firmwareVersion: 'v4.1.8-edge',
    batteryLevel: 89,
    signalStrength: 87,
    currentReadings: {
      temperature: 4.2,
      humidity: 78,
      pressure: 798.1,
      windSpeed: 28.0,
      windDirection: 'NW',
      solarRadiation: 420,
      precipitation: 0.0,
    }
  },
  {
    id: 'st-09',
    name: 'Mojave Dry Lakebed',
    code: 'SKY-MD-09',
    location: 'El Mirage Dry Lake, CA',
    region: 'California Desert',
    lat: 34.6289,
    lng: -117.6012,
    status: 'online',
    lastCommunication: '3 mins ago',
    sensorCount: 15,
    anomalyCount: 0,
    elevation: 870,
    firmwareVersion: 'v4.1.8-edge',
    batteryLevel: 94,
    signalStrength: 91,
    currentReadings: {
      temperature: 36.8,
      humidity: 14,
      pressure: 1010.3,
      windSpeed: 16.4,
      windDirection: 'SW',
      solarRadiation: 990,
      precipitation: 0.0,
    }
  },
  {
    id: 'st-10',
    name: 'Atlantic Harbour Terminal',
    code: 'SKY-AH-10',
    location: 'Boston Harbor Pier 7, MA',
    region: 'Northeast Maritime',
    lat: 42.3601,
    lng: -71.0589,
    status: 'online',
    lastCommunication: '1 min ago',
    sensorCount: 16,
    anomalyCount: 0,
    elevation: 8,
    firmwareVersion: 'v4.1.8-edge',
    batteryLevel: 97,
    signalStrength: 95,
    currentReadings: {
      temperature: 20.4,
      humidity: 74,
      pressure: 1017.5,
      windSpeed: 21.0,
      windDirection: 'ENE',
      solarRadiation: 540,
      precipitation: 0.0,
    }
  },
  {
    id: 'st-11',
    name: 'Ozark Plateau Remote',
    code: 'SKY-OP-11',
    location: 'Buffalo River Ridge, AR',
    region: 'Central Highlands',
    lat: 36.0381,
    lng: -92.9821,
    status: 'online',
    lastCommunication: '5 mins ago',
    sensorCount: 14,
    anomalyCount: 0,
    elevation: 640,
    firmwareVersion: 'v4.1.6',
    batteryLevel: 90,
    signalStrength: 86,
    currentReadings: {
      temperature: 26.8,
      humidity: 67,
      pressure: 1014.2,
      windSpeed: 11.2,
      windDirection: 'S',
      solarRadiation: 650,
      precipitation: 0.0,
    }
  },
  {
    id: 'st-12',
    name: 'Northern Tundra Sentinel',
    code: 'SKY-NT-12',
    location: 'Fairbanks Perimeter, AK',
    region: 'Subarctic Interior',
    lat: 64.8378,
    lng: -147.7164,
    status: 'offline',
    lastCommunication: '48 mins ago',
    sensorCount: 16,
    anomalyCount: 1,
    elevation: 136,
    firmwareVersion: 'v4.0.2',
    batteryLevel: 14,
    signalStrength: 18,
    currentReadings: {
      temperature: -2.4,
      humidity: 86,
      pressure: 1022.1,
      windSpeed: 7.0,
      windDirection: 'N',
      solarRadiation: 120,
      precipitation: 0.2,
    }
  }
];

// 24-hour time-series data for primary interactive charts
export const generateTimeSeriesData = (): WeatherMetricPoint[] => {
  const points: WeatherMetricPoint[] = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = d.getHours();
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    
    // diurnal temp curve baseline: coldest at 5 AM, warmest at 3 PM
    const diurnalFactor = Math.sin(((hour - 8) / 24) * 2 * Math.PI);
    let baseTemp = 24.5 + diurnalFactor * 6.5;
    let baseHum = 65 - diurnalFactor * 22;
    let basePress = 1013.2 + Math.cos((hour / 12) * Math.PI) * 2.8;
    let baseWind = 15.0 + Math.sin((hour / 8) * Math.PI) * 7.0;

    let isAnomalyTemp = false;
    let isAnomalyHum = false;
    let isAnomalyPress = false;
    let isAnomalyWind = false;

    // Inject realistic anomalous spikes at specific known intervals for demonstration
    if (i === 14) {
      // Pressure drop anomaly (rapid gradient collapse)
      basePress = 988.4;
      isAnomalyPress = true;
    }
    if (i === 9) {
      // Temperature sudden irrational spike + humidity inversion
      baseTemp = 42.1;
      baseHum = 91;
      isAnomalyTemp = true;
      isAnomalyHum = true;
    }
    if (i === 4) {
      // Extreme wind gust anomaly
      baseWind = 64.8;
      isAnomalyWind = true;
    }
    if (i === 1) {
      // Moderate micro-spike
      baseTemp = 34.6;
      isAnomalyTemp = true;
    }

    points.push({
      time: timeStr,
      timestamp: d.getTime(),
      temperature: parseFloat(baseTemp.toFixed(1)),
      tempExpectedMin: 20.0,
      tempExpectedMax: 30.5,
      isAnomalyTemp,
      humidity: Math.round(baseHum),
      humExpectedMin: 40,
      humExpectedMax: 78,
      isAnomalyHum,
      pressure: parseFloat(basePress.toFixed(1)),
      pressExpectedMin: 1006.0,
      pressExpectedMax: 1020.0,
      isAnomalyPress,
      windSpeed: parseFloat(baseWind.toFixed(1)),
      windExpectedMin: 5.0,
      windExpectedMax: 28.0,
      isAnomalyWind,
    });
  }
  return points;
};

export const DEMO_TIME_SERIES = generateTimeSeriesData();

// Detailed Anomaly Records
export const DEMO_ANOMALIES: AnomalyRecord[] = [
  {
    id: 'anom-801',
    observationId: 'OBS-2026-94812',
    stationId: 'st-01',
    stationName: 'Ridge Peak Observatory',
    sensorParameter: 'temperature',
    parameterLabel: 'Ambient Temperature',
    observedValue: 42.1,
    unit: '°C',
    expectedBaseline: 26.4,
    expectedRange: [21.0, 30.5],
    anomalyScore: 0.94,
    severity: 'critical',
    detectionAlgorithm: 'Isolation Forest',
    timestamp: '14 mins ago',
    status: 'detected',
    explanation: 'Sudden +15.7°C gradient elevation within 8 minutes while adjacent stations (Cascade Glacier) report 4.2°C. Correlated sensor physics violate environmental lapse rate.',
    recommendation: 'Immediate thermal shield inspection; cross-validate thermistor resistance calibration and inspect solar flare reflection artifact.',
    confidence: 0.96,
    zScore: 4.82,
    historicalContext: {
      rollingAvg7d: 25.1,
      standardDev: 3.2,
      minPastMonth: 12.0,
      maxPastMonth: 31.8,
    }
  },
  {
    id: 'anom-802',
    observationId: 'OBS-2026-94808',
    stationId: 'st-03',
    stationName: 'Sonoran Solar Basin',
    sensorParameter: 'pressure',
    parameterLabel: 'Atmospheric Pressure',
    observedValue: 988.4,
    unit: 'hPa',
    expectedBaseline: 1009.2,
    expectedRange: [1005.0, 1018.0],
    anomalyScore: 0.89,
    severity: 'critical',
    detectionAlgorithm: 'Local Outlier Factor',
    timestamp: '32 mins ago',
    status: 'investigating',
    explanation: 'Rapid barometric depression of -20.8 hPa without matching cyclonic cloud signatures or wind acceleration. Indicates sensor diaphragm drift or vacuum seal breach.',
    recommendation: 'Check piezoresistive barometric port for insect occlusion or membrane seal degradation.',
    confidence: 0.93,
    zScore: -4.15,
    historicalContext: {
      rollingAvg7d: 1008.9,
      standardDev: 2.1,
      minPastMonth: 998.0,
      maxPastMonth: 1019.5,
    }
  },
  {
    id: 'anom-803',
    observationId: 'OBS-2026-94791',
    stationId: 'st-05',
    stationName: 'Highland Alpine Post',
    sensorParameter: 'windSpeed',
    parameterLabel: 'Peak Wind Gust',
    observedValue: 64.8,
    unit: 'km/h',
    expectedBaseline: 24.0,
    expectedRange: [10.0, 38.0],
    anomalyScore: 0.82,
    severity: 'high',
    detectionAlgorithm: 'One-Class SVM',
    timestamp: '1 hour ago',
    status: 'acknowledged',
    explanation: 'Sonic anemometer registered an isolated high-frequency spike (+40.8 km/h deviation) lasting under 3 seconds with zero mechanical cup anemometer confirmation.',
    recommendation: 'Clean ultrasonic transducer transducers; check for ice bridging or high-frequency acoustic interference.',
    confidence: 0.88,
    zScore: 3.74,
    historicalContext: {
      rollingAvg7d: 22.4,
      standardDev: 5.6,
      minPastMonth: 6.2,
      maxPastMonth: 45.1,
    }
  },
  {
    id: 'anom-804',
    observationId: 'OBS-2026-94765',
    stationId: 'st-01',
    stationName: 'Ridge Peak Observatory',
    sensorParameter: 'humidity',
    parameterLabel: 'Relative Humidity',
    observedValue: 91,
    unit: '%',
    expectedBaseline: 52,
    expectedRange: [38, 68],
    anomalyScore: 0.76,
    severity: 'high',
    detectionAlgorithm: 'Isolation Forest',
    timestamp: '2 hours ago',
    status: 'acknowledged',
    explanation: 'Capacitive relative humidity sensor pinned near saturation despite zero precipitation sensors detecting moisture and ambient dew point calculating at 12°C below current dry bulb.',
    recommendation: 'Inspect hygrometer sintered filter cap for condensation entrapment or mineral particulate accumulation.',
    confidence: 0.85,
    zScore: 3.22,
    historicalContext: {
      rollingAvg7d: 54.0,
      standardDev: 8.2,
      minPastMonth: 22.0,
      maxPastMonth: 79.0,
    }
  },
  {
    id: 'anom-805',
    observationId: 'OBS-2026-94734',
    stationId: 'st-06',
    stationName: 'Urban Core Metroplex',
    sensorParameter: 'airQualityIndex',
    parameterLabel: 'Particulate Matter PM2.5',
    observedValue: 184,
    unit: 'AQI',
    expectedBaseline: 48,
    expectedRange: [20, 75],
    anomalyScore: 0.69,
    severity: 'medium',
    detectionAlgorithm: 'DBSCAN',
    timestamp: '3 hours ago',
    status: 'investigating',
    explanation: 'Localized optical particle counter detected dense spike. Spatial density clustering isolates this station as a 3.4σ outlier compared to adjacent urban nodes.',
    recommendation: 'Correlate with local municipal rooftop exhaust or diesel generator test cycles near tower vent.',
    confidence: 0.81,
    zScore: 2.89,
    historicalContext: {
      rollingAvg7d: 46.2,
      standardDev: 14.5,
      minPastMonth: 18.0,
      maxPastMonth: 95.0,
    }
  },
  {
    id: 'anom-806',
    observationId: 'OBS-2026-94711',
    stationId: 'st-02',
    stationName: 'Coastal Bay Sentinel',
    sensorParameter: 'solarRadiation',
    parameterLabel: 'Solar Irradiance',
    observedValue: 80,
    unit: 'W/m²',
    expectedBaseline: 620,
    expectedRange: [450, 780],
    anomalyScore: 0.61,
    severity: 'medium',
    detectionAlgorithm: 'Local Outlier Factor',
    timestamp: '4 hours ago',
    status: 'detected',
    explanation: 'Pyranometer output collapsed to twilight levels at 13:40 local solar noon while ceiling cameras observe clear skies and mild marine haze.',
    recommendation: 'Pyranometer dome obstruction suspected (avian resting, sea salt spray residue, or debris deposit). Clean glass dome.',
    confidence: 0.84,
    zScore: -3.12,
    historicalContext: {
      rollingAvg7d: 590,
      standardDev: 65,
      minPastMonth: 110,
      maxPastMonth: 890,
    }
  },
  {
    id: 'anom-807',
    observationId: 'OBS-2026-94689',
    stationId: 'st-03',
    stationName: 'Sonoran Solar Basin',
    sensorParameter: 'temperature',
    parameterLabel: 'Ambient Temperature',
    observedValue: 34.6,
    unit: '°C',
    expectedBaseline: 39.8,
    expectedRange: [36.0, 44.0],
    anomalyScore: 0.47,
    severity: 'low',
    detectionAlgorithm: 'Isolation Forest',
    timestamp: '5 hours ago',
    status: 'resolved',
    explanation: 'Subtle thermal drop during peak solar azimuth. Fast recovery indicates micro-shadowing from passing localized cirrus formation.',
    recommendation: 'System auto-classified as benign meteorological transient. No physical maintenance required.',
    confidence: 0.78,
    zScore: -1.82,
    historicalContext: {
      rollingAvg7d: 38.9,
      standardDev: 2.4,
      minPastMonth: 32.1,
      maxPastMonth: 44.8,
    }
  },
  {
    id: 'anom-808',
    observationId: 'OBS-2026-94640',
    stationId: 'st-12',
    stationName: 'Northern Tundra Sentinel',
    sensorParameter: 'temperature',
    parameterLabel: 'Ambient Temperature',
    observedValue: -19.4,
    unit: '°C',
    expectedBaseline: -2.1,
    expectedRange: [-8.0, 4.0],
    anomalyScore: 0.52,
    severity: 'low',
    detectionAlgorithm: 'One-Class SVM',
    timestamp: '6 hours ago',
    status: 'resolved',
    explanation: 'Cold air drainage pool phenomenon in subarctic basin. Station battery is concurrently low (14%), which could induce reference voltage jitter.',
    recommendation: 'Replaced backup lithium pack and cross-checked voltage reference diode. Sensor verified operational.',
    confidence: 0.82,
    zScore: -2.31,
    historicalContext: {
      rollingAvg7d: -3.4,
      standardDev: 4.8,
      minPastMonth: -24.0,
      maxPastMonth: 8.0,
    }
  }
];

export const DEMO_ALERTS: AlertItem[] = [
  {
    id: 'alt-101',
    title: 'Critical Temperature Discontinuity Detected',
    stationId: 'st-01',
    stationName: 'Ridge Peak Observatory',
    sensor: 'Thermistor Array A',
    severity: 'critical',
    timestamp: '14m ago',
    description: 'Measured +42.1°C against expected max baseline 30.5°C. Rate of rise (+2.1°C/min) exceeds physical limits.',
    status: 'unread',
    anomalyId: 'anom-801'
  },
  {
    id: 'alt-102',
    title: 'Severe Barometric Pressure Drop Anomaly',
    stationId: 'st-03',
    stationName: 'Sonoran Solar Basin',
    sensor: 'Barometric Sensor HP-02',
    severity: 'critical',
    timestamp: '32m ago',
    description: 'Barometric pressure collapsed to 988.4 hPa without baric wind coupling. Suspected diaphragm chamber failure.',
    status: 'unread',
    anomalyId: 'anom-802'
  },
  {
    id: 'alt-103',
    title: 'Sonic Anemometer Transient High-Gust Anomaly',
    stationId: 'st-05',
    stationName: 'Highland Alpine Post',
    sensor: 'Ultrasonic Wind Head',
    severity: 'high',
    timestamp: '1h ago',
    description: 'Isolated burst of 64.8 km/h recorded with zero mechanical confirmation. Spatial correlation score 0.22.',
    status: 'read',
    anomalyId: 'anom-803'
  },
  {
    id: 'alt-104',
    title: 'Relative Humidity Inversion Saturation',
    stationId: 'st-01',
    stationName: 'Ridge Peak Observatory',
    sensor: 'Capacitive Hygrometer H-1',
    severity: 'high',
    timestamp: '2h ago',
    description: 'Sensor reporting 91% saturation during clear sky conditions with dewpoint delta of 14.8°C.',
    status: 'acknowledged',
    anomalyId: 'anom-804'
  },
  {
    id: 'alt-105',
    title: 'Station Telemetry Dropped Below Threshold',
    stationId: 'st-12',
    stationName: 'Northern Tundra Sentinel',
    sensor: 'Main Controller MCU',
    severity: 'missing_data',
    timestamp: '48m ago',
    description: 'Telemetry heartbeat missed for 48 consecutive minutes. Last battery state reported at 14%.',
    status: 'unread',
  },
  {
    id: 'alt-106',
    title: 'Pyranometer Radiation Decay Anomaly',
    stationId: 'st-02',
    stationName: 'Coastal Bay Sentinel',
    sensor: 'Kipp&Zonen Solar Sensor',
    severity: 'medium',
    timestamp: '4h ago',
    description: 'Midday solar output 80 W/m² (expected 620 W/m²). Hardware self-check indicates potential optical obstruction.',
    status: 'resolved',
    anomalyId: 'anom-806'
  },
  {
    id: 'alt-107',
    title: 'Micro-fluctuation in Solar Basin Ambient Temp',
    stationId: 'st-03',
    stationName: 'Sonoran Solar Basin',
    sensor: 'Secondary Temp Probe',
    severity: 'low',
    timestamp: '5h ago',
    description: 'Thermal trace dipped briefly to 34.6°C before returning to normal band. Classified as cloud shadow.',
    status: 'resolved',
    anomalyId: 'anom-807'
  },
  {
    id: 'alt-108',
    title: 'Particulate Sensor Outlier Cluster',
    stationId: 'st-06',
    stationName: 'Urban Core Metroplex',
    sensor: 'Optical Particle Counter',
    severity: 'medium',
    timestamp: '3h ago',
    description: 'AQI spiked to 184 against metropolitan baseline of 48. Correlating with urban wind plume vectors.',
    status: 'read',
    anomalyId: 'anom-805'
  }
];

export const DEMO_MODELS: MLModel[] = [
  {
    id: 'mdl-ensemble',
    name: 'Weighted Ensemble',
    code: 'ENS-CONSENSUS',
    version: 'v1.0.0-prod',
    status: 'active',
    isDefault: true,
    lastTrainingDate: '2026-11-16 09:24 UTC',
    observationsTrained: 11200,
    trainingDuration: '30.9s',
    precision: 0.149,
    recall: 0.952,
    f1Score: 0.257,
    detectionRate: 0.952,
    trainingTimeSec: 31.0,
    latencyMs: 0.15,
    accuracy: 0.808,
    contaminationRate: 0.035,
    rocAuc: 0.924,
    falsePositiveRate: 0.198,
    confusionMatrix: { tp: 80, fp: 458, fn: 4, tn: 1858 },
    description: 'Scientifically weighted consensus ensemble combining Deep Conv1D Autoencoder, Statistical Hampel/Z-Score, and Out-of-Sample spatial/density estimators.',
    hyperparameters: {
      'conv1d_weight': 0.25,
      'statistical_weight': 0.25,
      'isolation_forest_weight': 0.15,
      'lof_weight': 0.15,
      'dbscan_weight': 0.10,
      'ocsvm_weight': 0.10,
      'calibrated_threshold': 0.8715
    },
    strengths: [
      'Highest overall resilience against single-sensor false triggers',
      '95.2% recall on ground-truth benchmark anomalies',
      'Dynamic threshold calibration prevents false positives in diurnal cycles'
    ],
    limitations: [
      'Slightly higher memory profile due to running ensemble members',
      'Requires periodic re-weighting on seasonal regime changes'
    ]
  },
  {
    id: 'mdl-conv1d',
    name: 'Conv1D Autoencoder',
    code: 'CNN-AE-1D',
    version: 'v1.5.0-prod',
    status: 'standby',
    isDefault: false,
    lastTrainingDate: '2026-11-16 09:24 UTC',
    observationsTrained: 11200,
    trainingDuration: '26.6s',
    precision: 0.150,
    recall: 0.952,
    f1Score: 0.260,
    detectionRate: 0.952,
    trainingTimeSec: 26.6,
    latencyMs: 0.08,
    accuracy: 0.810,
    contaminationRate: 0.035,
    rocAuc: 0.930,
    falsePositiveRate: 0.195,
    confusionMatrix: { tp: 80, fp: 452, fn: 4, tn: 1864 },
    description: 'PyTorch 1D Convolutional Neural Network autoencoder learning latent multi-sensor physical thermodynamic relationships and reconstruction loss envelopes.',
    hyperparameters: {
      'latent_dim': 4,
      'epochs': 15,
      'batch_size': 64,
      'lr': 0.005,
      'calibrated_threshold': 0.8349
    },
    strengths: [
      'State-of-the-art ROC-AUC (0.930) on real meteorological data',
      'Feature-level reconstruction error enables granular root-cause diagnostics',
      'Learns complex non-linear inter-sensor thermodynamic couplings'
    ],
    limitations: [
      'Requires GPU or PyTorch CPU runtime',
      'Slower training phase than shallow decision trees'
    ]
  },
  {
    id: 'mdl-stat',
    name: 'Statistical Detector',
    code: 'STAT-HAMPEL-Z',
    version: 'v3.0.0-prod',
    status: 'standby',
    isDefault: false,
    lastTrainingDate: '2026-11-16 09:24 UTC',
    observationsTrained: 11200,
    trainingDuration: '0.01s',
    precision: 0.206,
    recall: 0.905,
    f1Score: 0.336,
    detectionRate: 0.905,
    trainingTimeSec: 0.01,
    latencyMs: 0.01,
    accuracy: 0.875,
    contaminationRate: 0.035,
    rocAuc: 0.910,
    falsePositiveRate: 0.126,
    confusionMatrix: { tp: 76, fp: 293, fn: 8, tn: 2023 },
    description: 'Robust statistical outlier detection synthesizing rolling Median Absolute Deviation (MAD Hampel Filter) and dynamic multi-sensor Z-score gradients.',
    hyperparameters: {
      'window_size': 12,
      'z_threshold': 3.0,
      'hampel_n_sigmas': 3.0
    },
    strengths: [
      'Fastest evaluation latency (0.01 ms, 1,000,000 samples/sec)',
      'Lowest false positive rate (12.6%) among individual detectors',
      'Direct mathematical interpretability with zero training latency'
    ],
    limitations: [
      'Cannot capture subtle multi-variable cross-sensor non-linear correlations',
      'Sensitive to prolonged steady baseline drift'
    ]
  },
  {
    id: 'mdl-lof',
    name: 'Local Outlier Factor',
    code: 'LOF-2026.2',
    version: 'v3.2.0-prod',
    status: 'standby',
    isDefault: false,
    lastTrainingDate: '2026-11-16 09:23 UTC',
    observationsTrained: 11200,
    trainingDuration: '1.56s',
    precision: 0.134,
    recall: 0.905,
    f1Score: 0.233,
    detectionRate: 0.905,
    trainingTimeSec: 1.56,
    latencyMs: 0.09,
    accuracy: 0.792,
    contaminationRate: 0.040,
    rocAuc: 0.918,
    falsePositiveRate: 0.212,
    confusionMatrix: { tp: 76, fp: 492, fn: 8, tn: 1824 },
    description: 'Density-based algorithm measuring the local deviation of a sensor reading relative to its geographic and temporal k-nearest neighbors with novelty inference.',
    hyperparameters: {
      'n_neighbors': 35,
      'metric': 'minkowski (p=2)',
      'algorithm': 'auto',
      'novelty': 'true'
    },
    strengths: [
      'Superior detection of subtle localized micro-climate deviations',
      'High ROC-AUC (0.918) without assuming Gaussian distributions'
    ],
    limitations: [
      'Higher memory consumption in large streaming windows',
      'Sensitive to k-neighbor parameter hyper-tuning'
    ]
  },
  {
    id: 'mdl-dbscan',
    name: 'DBSCAN',
    code: 'DBSCAN-SPATIAL',
    version: 'v2.2.0-prod',
    status: 'standby',
    isDefault: false,
    lastTrainingDate: '2026-11-16 09:23 UTC',
    observationsTrained: 11200,
    trainingDuration: '0.87s',
    precision: 0.164,
    recall: 0.905,
    f1Score: 0.277,
    detectionRate: 0.905,
    trainingTimeSec: 0.87,
    latencyMs: 0.01,
    accuracy: 0.835,
    contaminationRate: 0.050,
    rocAuc: 0.875,
    falsePositiveRate: 0.168,
    confusionMatrix: { tp: 76, fp: 388, fn: 8, tn: 1928 },
    description: 'Density-Based Spatial Clustering augmented with NearestNeighbors core-sample projection to enable genuine out-of-sample streaming sensor inference.',
    hyperparameters: {
      'eps': 1.20,
      'min_samples': 10,
      'metric': 'euclidean',
      'algorithm': 'ball_tree'
    },
    strengths: [
      'Zero prior assumption of normal operating cluster shapes',
      'Fast core-points projection enables real-time stream scoring'
    ],
    limitations: [
      'Fixed eps threshold across differing geographic weather regions'
    ]
  },
  {
    id: 'mdl-ocsvm',
    name: 'One-Class SVM',
    code: 'OC-SVM-2026',
    version: 'v2.5.0-prod',
    status: 'standby',
    isDefault: false,
    lastTrainingDate: '2026-11-16 09:23 UTC',
    observationsTrained: 11200,
    trainingDuration: '0.71s',
    precision: 0.066,
    recall: 0.964,
    f1Score: 0.124,
    detectionRate: 0.964,
    trainingTimeSec: 0.71,
    latencyMs: 0.05,
    accuracy: 0.523,
    contaminationRate: 0.040,
    rocAuc: 0.737,
    falsePositiveRate: 0.494,
    confusionMatrix: { tp: 81, fp: 1143, fn: 3, tn: 1173 },
    description: 'Support Vector boundary estimation using Radial Basis Function (RBF) kernel to construct complex non-linear normal operating envelopes.',
    hyperparameters: {
      'kernel': 'rbf',
      'gamma': 'scale',
      'nu': 0.04
    },
    strengths: [
      'Very high recall (96.4%) catching almost all severe sensor failures',
      'Effective when trained on purely normal weather regimes'
    ],
    limitations: [
      'Higher false positive rate on severe natural weather transitions',
      'O(N²) scaling during training on large datasets'
    ]
  },
  {
    id: 'mdl-iforest',
    name: 'Isolation Forest',
    code: 'IF-2026.4',
    version: 'v4.1.0-prod',
    status: 'standby',
    isDefault: false,
    lastTrainingDate: '2026-11-16 09:23 UTC',
    observationsTrained: 11200,
    trainingDuration: '1.23s',
    precision: 0.051,
    recall: 0.976,
    f1Score: 0.096,
    detectionRate: 0.976,
    trainingTimeSec: 1.23,
    latencyMs: 0.03,
    accuracy: 0.360,
    contaminationRate: 0.035,
    rocAuc: 0.657,
    falsePositiveRate: 0.663,
    confusionMatrix: { tp: 82, fp: 1535, fn: 2, tn: 781 },
    description: 'Tree ensemble partitioning algorithm isolating sensor anomalies via shallow recursive decision path lengths.',
    hyperparameters: {
      'n_estimators': 250,
      'max_samples': 'auto',
      'contamination': 0.035,
      'bootstrap': 'false',
    },
    strengths: [
      'Sub-millisecond inference time (0.03 ms)',
      'Near-perfect recall (97.6%) detecting sharp spikes and disconnects',
      'Scale-invariant and linear computational complexity'
    ],
    limitations: [
      'High false alarm rate on raw non-ensembled time-series data',
      'Requires consensus pairing with statistical or deep models'
    ]
  }
];

export const DEMO_REPORTS: ReportItem[] = [
  {
    id: 'rep-001',
    title: 'Weekly Sensor Anomaly & Health Digest',
    type: 'anomaly_summary',
    typeLabel: 'Anomaly Summary',
    generationDate: 'Nov 12, 2026 · 06:00 UTC',
    dateRange: 'Nov 05, 2026 - Nov 12, 2026',
    stationTarget: 'All 12 Stations',
    recordCount: 84200,
    fileSize: '4.2 MB',
    status: 'ready',
    summary: 'Comprehensive audit of 8 detected sensor anomalies across Pacific and Mountain stations. Flagged sensor drift in thermistors and pressure diaphragms.'
  },
  {
    id: 'rep-002',
    title: 'Ridge Peak Observatory Full Telemetry Analysis',
    type: 'station_wise',
    typeLabel: 'Station-Wise Report',
    generationDate: 'Nov 11, 2026 · 18:30 UTC',
    dateRange: 'Oct 28, 2026 - Nov 11, 2026',
    stationTarget: 'Ridge Peak Observatory (SKY-RP-01)',
    recordCount: 40320,
    fileSize: '6.8 MB',
    status: 'ready',
    summary: 'In-depth multi-sensor profile documenting thermal inversion event, diurnal cycle stability, and ultrasonic anemometer correlation ratios.'
  },
  {
    id: 'rep-003',
    title: 'Q4 ML Detection Engine Performance Benchmark',
    type: 'model_evaluation',
    typeLabel: 'Model Evaluation',
    generationDate: 'Nov 10, 2026 · 09:15 UTC',
    dateRange: 'Aug 01, 2026 - Oct 31, 2026',
    stationTarget: 'Fleetwide Benchmark',
    recordCount: 1250000,
    fileSize: '12.4 MB',
    status: 'ready',
    summary: 'Validation of Isolation Forest vs LOF, One-Class SVM, and DBSCAN on 1.25M ground-truth synthetic and real sensor anomalies. Includes ROC-AUC analysis.'
  },
  {
    id: 'rep-004',
    title: 'Pacific Marine Microclimate Weather Trends',
    type: 'weather_trend',
    typeLabel: 'Weather Trends',
    generationDate: 'Nov 08, 2026 · 12:00 UTC',
    dateRange: 'Oct 01, 2026 - Oct 31, 2026',
    stationTarget: 'Coastal Bay Sentinel (SKY-CB-02)',
    recordCount: 44640,
    fileSize: '5.1 MB',
    status: 'ready',
    summary: 'Statistical distribution of maritime gale force winds, coastal fog relative humidity percentiles, and barometric tidal variations.'
  },
  {
    id: 'rep-005',
    title: 'Historic Barometric Rapid-Gradient Event Archive',
    type: 'historical_anomaly',
    typeLabel: 'Historical Anomaly',
    generationDate: 'Nov 02, 2026 · 14:45 UTC',
    dateRange: 'Jan 01, 2026 - Nov 01, 2026',
    stationTarget: 'All Active Stations',
    recordCount: 312000,
    fileSize: '18.7 MB',
    status: 'ready',
    summary: 'Chronological catalog of sudden barometric drops >15 hPa/hr, correlating severe storm front passages against spurious sensor electrical resets.'
  }
];

export const DEMO_SYSTEM_HEALTH = {
  overallHealth: 98.4,
  activeSensors: 194,
  totalSensors: 198,
  dataSyncRate: 99.85,
  apiLatencyMs: 24,
  modelInferenceTimeMs: 4.8,
  lastSyncTime: '12 seconds ago',
};

