import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Sliders, 
  Calendar, 
  Maximize2, 
  Download, 
  HelpCircle,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ScatterChart, 
  Scatter, 
  ZAxis, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { Button } from '../../components/ui/Button';

export const AnalyticsPage: React.FC = () => {
  const { stations, selectedStationId, setSelectedStationId, selectedStation, showToast } = useApp();

  const [selectedParam, setSelectedParam] = useState<'temperature' | 'humidity' | 'pressure' | 'windSpeed'>('temperature');
  const [dateRange, setDateRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [viewCadence, setViewCadence] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Statistical calculations for active station
  const stats = {
    mean: selectedParam === 'temperature' ? 24.8 : selectedParam === 'humidity' ? 62.4 : selectedParam === 'pressure' ? 1013.4 : 17.8,
    median: selectedParam === 'temperature' ? 24.5 : selectedParam === 'humidity' ? 61.0 : selectedParam === 'pressure' ? 1013.1 : 16.5,
    stdDev: selectedParam === 'temperature' ? 4.2 : selectedParam === 'humidity' ? 12.8 : selectedParam === 'pressure' ? 6.4 : 5.8,
    min: selectedParam === 'temperature' ? 14.2 : selectedParam === 'humidity' ? 28.0 : selectedParam === 'pressure' ? 988.4 : 2.1,
    max: selectedParam === 'temperature' ? 42.1 : selectedParam === 'humidity' ? 94.0 : selectedParam === 'pressure' ? 1024.8 : 64.8,
    unit: selectedParam === 'temperature' ? '°C' : selectedParam === 'humidity' ? '%' : selectedParam === 'pressure' ? 'hPa' : 'km/h',
  };

  // Mock historical trend data for 30 days
  const historicalTrendData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const base = selectedParam === 'temperature' ? 22 + Math.sin(day / 3) * 6 :
                 selectedParam === 'humidity' ? 55 + Math.cos(day / 4) * 20 :
                 selectedParam === 'pressure' ? 1012 + Math.sin(day / 5) * 4 :
                 15 + Math.cos(day / 2) * 8;
    return {
      date: `Day ${day}`,
      value: parseFloat(base.toFixed(1)),
      historicalMean: parseFloat((base - 1.2).toFixed(1)),
      upperStd: parseFloat((base + stats.stdDev).toFixed(1)),
      lowerStd: parseFloat((base - stats.stdDev).toFixed(1)),
    };
  });

  // Scatter Plot: Temperature vs. Relative Humidity
  const scatterData = [
    { temp: 15.2, hum: 85, z: 10 },
    { temp: 18.4, hum: 78, z: 12 },
    { temp: 21.0, hum: 68, z: 15 },
    { temp: 24.5, hum: 62, z: 14 },
    { temp: 26.8, hum: 55, z: 18 },
    { temp: 29.2, hum: 48, z: 20 },
    { temp: 32.5, hum: 38, z: 22 },
    { temp: 36.1, hum: 26, z: 25 },
    { temp: 39.4, hum: 18, z: 28 },
    // Outliers
    { temp: 42.1, hum: 91, z: 35, isAnomaly: true },
    { temp: 34.6, hum: 14, z: 30, isAnomaly: true },
  ];

  // Correlation Matrix Variables
  const correlationVariables = ['Temp', 'Humidity', 'Pressure', 'Wind', 'Solar', 'AQI'];
  const correlationMatrix = [
    [1.00, -0.68, -0.42, 0.34, 0.82, 0.45],
    [-0.68, 1.00, 0.28, -0.22, -0.74, -0.38],
    [-0.42, 0.28, 1.00, -0.58, -0.31, -0.19],
    [0.34, -0.22, -0.58, 1.00, 0.29, -0.12],
    [0.82, -0.74, -0.31, 0.29, 1.00, 0.52],
    [0.45, -0.38, -0.19, -0.12, 0.52, 1.00],
  ];

  const getHeatmapColor = (val: number) => {
    if (val === 1.0) return 'bg-cyan-500 text-black font-bold';
    if (val > 0.6) return 'bg-cyan-500/80 text-black font-semibold';
    if (val > 0.3) return 'bg-cyan-500/40 text-cyan-200';
    if (val > 0.0) return 'bg-cyan-500/10 text-cyan-300';
    if (val > -0.3) return 'bg-rose-500/10 text-rose-300';
    if (val > -0.6) return 'bg-rose-500/40 text-rose-200';
    return 'bg-rose-500/80 text-white font-semibold';
  };

  // Histogram distribution
  const distributionBins = [
    { bin: '10-15', count: 12 },
    { bin: '15-20', count: 48 },
    { bin: '20-25', count: 120 },
    { bin: '25-30', count: 95 },
    { bin: '30-35', count: 42 },
    { bin: '35-40', count: 18 },
    { bin: '40+', count: 4 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101827] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              Research & Statistical Suite
            </span>
            <span className="text-xs text-[#64748B] font-mono">Multi-Variate Analysis</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Weather Analytics & Cross-Correlation
          </h1>
          <p className="text-xs lg:text-sm text-[#94A3B8]">
            Investigate deep parametric trends, probability density distributions, and inter-sensor physical correlations.
          </p>
        </div>

        {/* Global Export */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => showToast('Analytics CSV exported with 30-day raw statistical records.', 'success', 'Export Complete')}
          >
            Export Raw CSV
          </Button>
        </div>
      </div>

      {/* 2. Interactive Analysis Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#121D2E] p-4 rounded-2xl border border-white/10">
        {/* Select Station */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1">
            Observation Station
          </label>
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>

        {/* Weather Parameter */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1">
            Weather Parameter
          </label>
          <select
            value={selectedParam}
            onChange={(e) => setSelectedParam(e.target.value as any)}
            className="w-full bg-[#0B1220] text-xs font-mono text-cyan-400 font-semibold border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            <option value="temperature">Temperature (°C)</option>
            <option value="humidity">Relative Humidity (%)</option>
            <option value="pressure">Atmospheric Pressure (hPa)</option>
            <option value="windSpeed">Wind Velocity (km/h)</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1">
            Historical Window
          </label>
          <div className="flex bg-[#0B1220] p-1 rounded-xl border border-white/10">
            {(['7D', '30D', '90D', '1Y'] as const).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`flex-1 py-1 text-xs font-mono rounded-lg transition-colors ${
                  dateRange === r ? 'bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30' : 'text-[#94A3B8]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* View Cadence */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1">
            Aggregated Cadence
          </label>
          <div className="flex bg-[#0B1220] p-1 rounded-xl border border-white/10">
            {(['daily', 'weekly', 'monthly'] as const).map(c => (
              <button
                key={c}
                onClick={() => setViewCadence(c)}
                className={`flex-1 py-1 text-xs font-mono rounded-lg capitalize transition-colors ${
                  viewCadence === c ? 'bg-blue-600 text-white font-semibold' : 'text-[#94A3B8]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Statistical Analysis Cards (Mean, Median, Std Dev, Min, Max) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-[#121D2E] p-4 rounded-xl border border-white/10 shadow-lg text-center">
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Mean (Arithmetic)</span>
          <span className="text-2xl font-bold font-mono text-[#F8FAFC] mt-1 block">
            {stats.mean} {stats.unit}
          </span>
          <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">Central Tendency</span>
        </div>

        <div className="bg-[#121D2E] p-4 rounded-xl border border-white/10 shadow-lg text-center">
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Median (50th %ile)</span>
          <span className="text-2xl font-bold font-mono text-[#F8FAFC] mt-1 block">
            {stats.median} {stats.unit}
          </span>
          <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">Robust Non-Parametric</span>
        </div>

        <div className="bg-[#121D2E] p-4 rounded-xl border border-white/10 shadow-lg text-center">
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Standard Deviation</span>
          <span className="text-2xl font-bold font-mono text-purple-400 mt-1 block">
            ±{stats.stdDev}
          </span>
          <span className="text-[10px] text-[#64748B] font-mono mt-0.5 block">1σ Variance Spread</span>
        </div>

        <div className="bg-[#121D2E] p-4 rounded-xl border border-white/10 shadow-lg text-center">
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Minimum Observed</span>
          <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
            {stats.min} {stats.unit}
          </span>
          <span className="text-[10px] text-[#64748B] font-mono mt-0.5 block">0th Percentile</span>
        </div>

        <div className="bg-[#121D2E] p-4 rounded-xl border border-white/10 shadow-lg text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Maximum Observed</span>
          <span className="text-2xl font-bold font-mono text-red-400 mt-1 block">
            {stats.max} {stats.unit}
          </span>
          <span className="text-[10px] text-red-400 font-mono mt-0.5 block">100th Percentile</span>
        </div>
      </div>

      {/* 4. Large Interactive Historical Trend Chart */}
      <div className="bg-[#121D2E] p-5 rounded-2xl border border-white/10 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              Historical 30-Day Trend & Confidence Interval
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Parameter trajectory plotted against rolling seasonal baseline
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
            {selectedStation.name}
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={['auto', 'auto']} unit={stats.unit} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Line type="monotone" dataKey="value" name="Observed Value" stroke="#22D3EE" strokeWidth={2.5} dot={{ r: 3, fill: '#22D3EE' }} />
              <Line type="monotone" dataKey="historicalMean" name="30-Day Seasonal Mean" stroke="#3B82F6" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Advanced Visualizations Grid (Correlation Heatmap & Scatter Plot) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlation Heatmap */}
        <div className="bg-[#121D2E] p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Pearson Correlation Heatmap</h3>
              <p className="text-[11px] text-[#94A3B8]">Inter-sensor linear dependence coefficients (-1.0 to +1.0)</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              PHYSICS MATRIX
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-[#64748B] text-left">Param</th>
                  {correlationVariables.map(v => (
                    <th key={v} className="p-2 text-[#94A3B8] font-medium">{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationVariables.map((rowVar, rIdx) => (
                  <tr key={rowVar}>
                    <td className="p-2 text-left font-semibold text-[#F8FAFC]">{rowVar}</td>
                    {correlationMatrix[rIdx].map((val, cIdx) => (
                      <td key={cIdx} className="p-1">
                        <div
                          className={`py-1.5 px-1 rounded-md text-[11px] font-mono transition-transform hover:scale-105 ${getHeatmapColor(val)}`}
                          title={`${rowVar} vs ${correlationVariables[cIdx]}: ${val.toFixed(2)}`}
                        >
                          {val.toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-[#64748B] pt-2 border-t border-white/5">
            <span>Red: Inverse Correlation (-1.0)</span>
            <span>Cyan: Direct Positive Correlation (+1.0)</span>
          </div>
        </div>

        {/* Scatter Plot: Temp vs Humidity with Outlier Highlight */}
        <div className="bg-[#121D2E] p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Multi-Sensor Scatter: Temp vs. Humidity</h3>
              <p className="text-[11px] text-[#94A3B8]">Clustered physical relationship with isolated anomaly flags</p>
            </div>
            <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
              OUTLIERS FLAGGED
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" dataKey="temp" name="Temperature" unit="°C" stroke="#64748B" fontSize={10} domain={[10, 46]} />
                <YAxis type="number" dataKey="hum" name="Humidity" unit="%" stroke="#64748B" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0B1220] border border-white/10 p-2.5 rounded-xl text-xs font-mono shadow-2xl">
                          <p className="text-cyan-400">Temp: {d.temp}°C</p>
                          <p className="text-blue-400">Humidity: {d.hum}%</p>
                          {d.isAnomaly && (
                            <p className="text-red-400 font-bold mt-1">! Physical Inversion Outlier</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Observations" data={scatterData} fill="#22D3EE">
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isAnomaly ? '#EF4444' : '#22D3EE'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-[#64748B] pt-2 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Normal Inverse Psychrometric Cluster
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping-slow" /> Physics Violation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

