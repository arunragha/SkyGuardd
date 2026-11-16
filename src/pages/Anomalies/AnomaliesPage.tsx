import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AnomalyRecord, SeverityLevel, AlgorithmType, SensorType, AnomalyStatus } from '../../types';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { Button } from '../../components/ui/Button';
import { 
  ShieldAlert, 
  Cpu, 
  Play, 
  Search, 
  Filter, 
  RotateCw, 
  Eye, 
  CheckCircle2, 
  Layers, 
  BarChart2, 
  Activity, 
  ArrowUpDown,
  SlidersHorizontal,
  Sliders,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ScatterChart, 
  Scatter, 
  ZAxis, 
  Cell 
} from 'recharts';

export const AnomaliesPage: React.FC = () => {
  const { 
    anomalies, 
    stations, 
    openAnomalyDrawer, 
    runAnomalyDetection, 
    isDetecting,
    models,
    activeModelId
  } = useApp();

  // Filters state
  const [search, setSearch] = useState('');
  const [stationFilter, setStationFilter] = useState('all');
  const [sensorFilter, setSensorFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [algorithmFilter, setAlgorithmFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof AnomalyRecord>('anomalyScore');
  const [sortAsc, setSortAsc] = useState(false);

  const activeModel = models.find(m => m.id === activeModelId) || models[0];

  // Summary Metrics
  const totalAnalyzed = 19362;
  const detectedCount = anomalies.length;
  const normalCount = totalAnalyzed - detectedCount;
  const anomalyPercentage = ((detectedCount / totalAnalyzed) * 100).toFixed(2);

  // Filter anomalies
  const filteredAnomalies = anomalies.filter(a => {
    if (stationFilter !== 'all' && a.stationId !== stationFilter) return false;
    if (sensorFilter !== 'all' && a.sensorParameter !== sensorFilter) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (algorithmFilter !== 'all' && a.detectionAlgorithm !== algorithmFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match = a.observationId.toLowerCase().includes(q) ||
        a.stationName.toLowerCase().includes(q) ||
        a.parameterLabel.toLowerCase().includes(q) ||
        a.explanation.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const sortedAnomalies = [...filteredAnomalies].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') {
      return sortAsc 
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }
    return sortAsc ? (Number(aVal) - Number(bVal)) : (Number(bVal) - Number(aVal));
  });

  // Timeline visualization data
  const timelineData = [
    { hour: '00:00', normal: 780, anomalies: 0 },
    { hour: '03:00', normal: 810, anomalies: 0 },
    { hour: '06:00', normal: 795, anomalies: 1 }, // low
    { hour: '09:00', normal: 820, anomalies: 1 }, // high
    { hour: '12:00', normal: 840, anomalies: 2 }, // critical + med
    { hour: '15:00', normal: 860, anomalies: 1 }, // med
    { hour: '18:00', normal: 830, anomalies: 2 }, // critical + high
    { hour: '21:00', normal: 800, anomalies: 1 }, // low
  ];

  // Score distribution histogram data
  const scoreDistributionData = [
    { range: '0.40 - 0.50', count: 1, severity: 'Low', fill: '#22D3EE' },
    { range: '0.50 - 0.60', count: 1, severity: 'Low', fill: '#22D3EE' },
    { range: '0.60 - 0.70', count: 2, severity: 'Medium', fill: '#3B82F6' },
    { range: '0.70 - 0.80', count: 1, severity: 'High', fill: '#F59E0B' },
    { range: '0.80 - 0.90', count: 2, severity: 'Critical', fill: '#EF4444' },
    { range: '0.90 - 1.00', count: 1, severity: 'Critical', fill: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header with Model Status Indicator & Run Detection Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101827] border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] font-semibold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              Model Active: {activeModel.name} {activeModel.version}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Inference Ready (4.8ms)
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Intelligent Anomaly Detection
          </h1>
          <p className="text-xs lg:text-sm text-[#94A3B8]">
            Identify abnormal weather observations using unsupervised machine learning and statistical density estimation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="cyan"
            size="md"
            onClick={runAnomalyDetection}
            isLoading={isDetecting}
            icon={<Play className="w-4 h-4 fill-current" />}
          >
            {isDetecting ? 'Running Multi-Model Inference...' : 'Run Detection Batch'}
          </Button>
        </div>
      </div>

      {/* 2. Four Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Observations */}
        <div className="bg-[#121D2E] rounded-xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-mono mb-2 uppercase">
            <span>Total Observations Analyzed</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#F8FAFC]">
            {totalAnalyzed.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#64748B] mt-2">
            Buffered over past 24 hours across 12 stations
          </p>
        </div>

        {/* Normal Observations */}
        <div className="bg-[#121D2E] rounded-xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-mono mb-2 uppercase">
            <span>Normal Observations</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {normalCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#64748B] mt-2">
            Within 3σ operating confidence envelopes
          </p>
        </div>

        {/* Detected Anomalies */}
        <div className="bg-[#121D2E] rounded-xl p-5 border border-red-500/20 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-mono mb-2 uppercase">
            <span>Detected Anomalies</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-red-400">
            {detectedCount.toString().padStart(2, '0')}
          </div>
          <p className="text-[11px] text-[#64748B] mt-2">
            {anomalies.filter(a => a.severity === 'critical').length} Critical · {anomalies.filter(a => a.severity === 'high').length} High
          </p>
        </div>

        {/* Anomaly Percentage */}
        <div className="bg-[#121D2E] rounded-xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-mono mb-2 uppercase">
            <span>Anomaly Percentage</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-400">
            {anomalyPercentage}%
          </div>
          <p className="text-[11px] text-[#64748B] mt-2">
            Contamination threshold target: 0.05%
          </p>
        </div>
      </div>

      {/* 3. Anomaly Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Anomaly Timeline Frequency</h3>
              <p className="text-[11px] text-[#94A3B8]">Temporal distribution of flagged sensor events</p>
            </div>
            <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-[#94A3B8]">
              24H WINDOW
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="anomalies" name="Flagged Outliers" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution Chart */}
        <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Anomaly Score Distribution</h3>
              <p className="text-[11px] text-[#94A3B8]">Severity classification based on statistical divergence</p>
            </div>
            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
              HISTOGRAM
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="range" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="count" name="Observations" radius={[4, 4, 0, 0]}>
                  {scoreDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Advanced Filter Bar */}
      <div className="bg-[#121D2E] p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            Advanced Outlier Query Filters
          </span>
          <button
            onClick={() => {
              setSearch('');
              setStationFilter('all');
              setSensorFilter('all');
              setSeverityFilter('all');
              setAlgorithmFilter('all');
              setStatusFilter('all');
            }}
            className="text-xs text-[#22D3EE] hover:underline font-mono"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-1">
            <input
              type="text"
              placeholder="Search ID, explanation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] placeholder-[#64748B] px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Station Filter */}
          <div>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Stations</option>
              {stations.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Sensor Parameter Filter */}
          <div>
            <select
              value={sensorFilter}
              onChange={(e) => setSensorFilter(e.target.value)}
              className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Sensor Types</option>
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
              <option value="pressure">Pressure</option>
              <option value="windSpeed">Wind Speed</option>
              <option value="solarRadiation">Solar Radiation</option>
              <option value="airQualityIndex">Air Quality</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Detection Algorithm Filter */}
          <div>
            <select
              value={algorithmFilter}
              onChange={(e) => setAlgorithmFilter(e.target.value)}
              className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Algorithms</option>
              <option value="Isolation Forest">Isolation Forest</option>
              <option value="Local Outlier Factor">Local Outlier Factor</option>
              <option value="One-Class SVM">One-Class SVM</option>
              <option value="DBSCAN">DBSCAN</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="investigating">Investigating</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Comprehensive Anomaly Records Table */}
      <div className="bg-[#121D2E] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">
              Anomaly Telemetry Records ({sortedAnomalies.length})
            </h3>
            <span className="text-[10px] font-mono text-[#64748B]">Click any row for diagnostic drawer</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#0B1220]/70 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                <th className="py-3 px-4">Obs. ID</th>
                <th className="py-3 px-4">Weather Station</th>
                <th className="py-3 px-4">Sensor Parameter</th>
                <th className="py-3 px-4">Observed Value</th>
                <th className="py-3 px-4">Expected Baseline</th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-[#22D3EE] transition-colors"
                  onClick={() => {
                    if (sortField === 'anomalyScore') setSortAsc(!sortAsc);
                    else { setSortField('anomalyScore'); setSortAsc(false); }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Anomaly Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-sans">
              {sortedAnomalies.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => openAnomalyDrawer(item)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  {/* Observation ID */}
                  <td className="py-3 px-4 font-mono font-medium text-cyan-400">
                    {item.observationId}
                  </td>

                  {/* Weather Station */}
                  <td className="py-3 px-4">
                    <span className="font-medium text-[#F8FAFC] group-hover:text-cyan-400 transition-colors block">
                      {item.stationName}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">{item.stationId}</span>
                  </td>

                  {/* Sensor Parameter */}
                  <td className="py-3 px-4 font-mono text-[#F8FAFC]">
                    {item.parameterLabel}
                  </td>

                  {/* Observed Value */}
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={
                      item.severity === 'critical' ? 'text-red-400' :
                      item.severity === 'high' ? 'text-amber-400' : 'text-cyan-400'
                    }>
                      {item.observedValue} {item.unit}
                    </span>
                  </td>

                  {/* Expected Baseline */}
                  <td className="py-3 px-4 font-mono text-[#94A3B8]">
                    {item.expectedBaseline} {item.unit} ({item.expectedRange[0]}-{item.expectedRange[1]})
                  </td>

                  {/* Anomaly Score */}
                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#F8FAFC]">
                        {(item.anomalyScore * 100).toFixed(0)}%
                      </span>
                      <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden hidden md:block">
                        <div
                          className={`h-full ${
                            item.anomalyScore > 0.8 ? 'bg-red-500' :
                            item.anomalyScore > 0.6 ? 'bg-amber-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${item.anomalyScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="py-3 px-4">
                    <SeverityBadge severity={item.severity} size="xs" pulse={item.severity === 'critical'} />
                  </td>

                  {/* Detection Algorithm */}
                  <td className="py-3 px-4 font-mono text-[#94A3B8] text-[11px]">
                    {item.detectionAlgorithm}
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-4 text-[#94A3B8] font-mono text-[11px] whitespace-nowrap">
                    {item.timestamp}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAnomalyDrawer(item);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-[#94A3B8] hover:text-cyan-400 border border-white/5 hover:border-cyan-500/30 transition-all font-mono text-[11px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

