import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  Pause, 
  Play, 
  Radio, 
  Sliders, 
  Clock, 
  Wifi, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area,
  ReferenceArea
} from 'recharts';

export const MonitoringPage: React.FC = () => {
  const { 
    stations, 
    selectedStationId, 
    setSelectedStationId, 
    selectedStation,
    timeSeriesData,
    isLiveMonitoringPaused,
    togglePauseMonitoring,
    refreshInterval,
    setRefreshInterval,
    lastSyncTime
  } = useApp();

  const [activeFilterRange, setActiveFilterRange] = useState<'1H' | '6H' | '12H' | '24H'>('24H');
  const [selectedSensorFilter, setSelectedSensorFilter] = useState<string>('all');

  const filteredData = React.useMemo(() => {
    if (activeFilterRange === '1H') return timeSeriesData.slice(-4);
    if (activeFilterRange === '6H') return timeSeriesData.slice(-7);
    if (activeFilterRange === '12H') return timeSeriesData.slice(-13);
    return timeSeriesData;
  }, [timeSeriesData, activeFilterRange]);

  const sensorReadingsList = [
    {
      id: 'temp',
      name: 'Ambient Thermistor array',
      current: `${selectedStation.currentReadings.temperature}°C`,
      previous: `${(selectedStation.currentReadings.temperature - 0.4).toFixed(1)}°C`,
      unit: 'Celsius (°C)',
      status: selectedStation.currentReadings.temperature > 38 ? 'anomaly' : 'nominal',
      icon: <Thermometer className="w-4 h-4 text-cyan-400" />,
      delta: '+0.4°C'
    },
    {
      id: 'hum',
      name: 'Capacitive Hygrometer',
      current: `${selectedStation.currentReadings.humidity}%`,
      previous: `${selectedStation.currentReadings.humidity + 2}%`,
      unit: 'Relative Humidity (%RH)',
      status: selectedStation.currentReadings.humidity > 88 ? 'warning' : 'nominal',
      icon: <Droplets className="w-4 h-4 text-blue-400" />,
      delta: '-2.0%'
    },
    {
      id: 'press',
      name: 'Piezoresistive Barometer',
      current: `${selectedStation.currentReadings.pressure} hPa`,
      previous: `${(selectedStation.currentReadings.pressure + 0.3).toFixed(1)} hPa`,
      unit: 'Hectopascals (hPa)',
      status: selectedStation.currentReadings.pressure < 995 ? 'anomaly' : 'nominal',
      icon: <Gauge className="w-4 h-4 text-emerald-400" />,
      delta: '-0.3 hPa'
    },
    {
      id: 'wind',
      name: 'Ultrasonic 3D Anemometer',
      current: `${selectedStation.currentReadings.windSpeed} km/h`,
      previous: `${(selectedStation.currentReadings.windSpeed - 1.2).toFixed(1)} km/h`,
      unit: 'Kilometers per Hour (km/h)',
      status: selectedStation.currentReadings.windSpeed > 50 ? 'warning' : 'nominal',
      icon: <Wind className="w-4 h-4 text-purple-400" />,
      delta: `+1.2 km/h (${selectedStation.currentReadings.windDirection})`
    },
    {
      id: 'solar',
      name: 'Pyranometer Radiometer',
      current: `${selectedStation.currentReadings.solarRadiation} W/m²`,
      previous: `${selectedStation.currentReadings.solarRadiation - 15} W/m²`,
      unit: 'Watts per sq. meter',
      status: 'nominal',
      icon: <Activity className="w-4 h-4 text-amber-400" />,
      delta: '+15 W/m²'
    },
    {
      id: 'precip',
      name: 'Optical Rain Gauge',
      current: `${selectedStation.currentReadings.precipitation} mm/h`,
      previous: '0.0 mm/h',
      unit: 'Precipitation (mm/h)',
      status: 'nominal',
      icon: <Droplets className="w-4 h-4 text-cyan-300" />,
      delta: '0.0 mm'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Live Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101827] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold uppercase tracking-wider">
              <span className={`w-2 h-2 rounded-full ${isLiveMonitoringPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping-slow'}`} />
              {isLiveMonitoringPaused ? 'Stream Suspended' : 'Live Stream Active'}
            </span>
            <span className="text-xs text-[#64748B] font-mono">
              Last Buffer Sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Live Weather Monitoring
          </h1>
          <p className="text-xs lg:text-sm text-[#94A3B8]">
            Real-time environmental telemetry across connected weather stations with sub-second stream capture.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant={isLiveMonitoringPaused ? 'cyan' : 'secondary'}
            size="sm"
            onClick={togglePauseMonitoring}
            icon={isLiveMonitoringPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          >
            {isLiveMonitoringPaused ? 'Resume Monitoring' : 'Pause Stream'}
          </Button>
        </div>
      </div>

      {/* 2. Monitoring Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#121D2E] p-4 rounded-2xl border border-white/10">
        {/* Station Dropdown */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1">
            Target Station
          </label>
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            {stations.map(st => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.code})
              </option>
            ))}
          </select>
        </div>

        {/* Sensor Parameter Filter */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1">
            Sensor Channel
          </label>
          <select
            value={selectedSensorFilter}
            onChange={(e) => setSelectedSensorFilter(e.target.value)}
            className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Synchronized Channels (4)</option>
            <option value="temperature">Temperature Only</option>
            <option value="humidity">Humidity Only</option>
            <option value="pressure">Atmospheric Pressure Only</option>
            <option value="windSpeed">Wind Speed Only</option>
          </select>
        </div>

        {/* Time Window Range */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1">
            Time Window
          </label>
          <div className="flex bg-[#0B1220] p-1 rounded-xl border border-white/10">
            {(['1H', '6H', '12H', '24H'] as const).map(range => (
              <button
                key={range}
                onClick={() => setActiveFilterRange(range)}
                className={`flex-1 py-1 text-xs font-mono rounded-lg transition-colors ${
                  activeFilterRange === range
                    ? 'bg-[#3B82F6] text-white font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Refresh Interval Selector */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1">
            Telemetry Cadence
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="w-full bg-[#0B1220] text-xs font-mono text-cyan-400 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 font-semibold"
          >
            <option value={5}>Every 5 Seconds (Ultra High-Freq)</option>
            <option value={10}>Every 10 Seconds (Standard Live)</option>
            <option value={30}>Every 30 Seconds (Bandwidth Saver)</option>
            <option value={60}>Every 60 Seconds (Low Power)</option>
          </select>
        </div>
      </div>

      {/* 3. Four Real-Time Synchronized Parameter Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Real-time Temperature */}
        <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Temperature Live Stream</h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">
              {selectedStation.currentReadings.temperature}°C
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="monTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} unit="°C" domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  formatter={(val: any) => [`${val}°C`, 'Temperature']}
                />
                <Area type="monotone" dataKey="temperature" stroke="#3B82F6" strokeWidth={2} fill="url(#monTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Real-time Humidity */}
        <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Relative Humidity Stream</h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {selectedStation.currentReadings.humidity}%
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="monHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  formatter={(val: any) => [`${val}%`, 'Humidity']}
                />
                <Area type="monotone" dataKey="humidity" stroke="#22D3EE" strokeWidth={2} fill="url(#monHum)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Atmospheric Pressure */}
        <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Atmospheric Pressure Stream</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {selectedStation.currentReadings.pressure} hPa
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="monPress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} unit="hPa" domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  formatter={(val: any) => [`${val} hPa`, 'Barometer']}
                />
                <Area type="monotone" dataKey="pressure" stroke="#22C55E" strokeWidth={2} fill="url(#monPress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Wind Speed */}
        <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Wind Velocity Vector</h3>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400">
              {selectedStation.currentReadings.windSpeed} km/h ({selectedStation.currentReadings.windDirection})
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="monWind" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} unit="km/h" domain={[0, 80]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  formatter={(val: any) => [`${val} km/h`, 'Wind Velocity']}
                />
                <Area type="monotone" dataKey="windSpeed" stroke="#A855F7" strokeWidth={2} fill="url(#monWind)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Detailed Sensor Readings Panel */}
      <div className="bg-[#121D2E] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              Physical Sensor Channels & Telemetry State
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Instantaneous edge readings with drift comparison against prior sample cycle
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Station: {selectedStation.code}
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {sensorReadingsList.map((sensor) => (
            <div key={sensor.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0B1220] border border-white/10">
                  {sensor.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#F8FAFC]">{sensor.name}</h4>
                  <span className="text-xs text-[#64748B] font-mono">{sensor.unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono">
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase">Prior Cycle</span>
                  <span className="text-[#94A3B8]">{sensor.previous}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase">Live Current</span>
                  <span className="text-sm font-bold text-[#F8FAFC]">{sensor.current}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase">Delta Trend</span>
                  <span className="text-cyan-400 font-semibold">{sensor.delta}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase">Sensor State</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    sensor.status === 'nominal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    sensor.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {sensor.status === 'nominal' && <CheckCircle2 className="w-3 h-3" />}
                    {sensor.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

