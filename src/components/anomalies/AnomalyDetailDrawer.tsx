import React from 'react';
import { useApp } from '../../context/AppContext';
import { Drawer } from '../ui/Drawer';
import { SeverityBadge } from '../ui/SeverityBadge';
import { Button } from '../ui/Button';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Radio, 
  TrendingUp, 
  Cpu, 
  HelpCircle, 
  ArrowRight,
  Sliders,
  AlertOctagon
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from 'recharts';

export const AnomalyDetailDrawer: React.FC = () => {
  const { selectedAnomaly, closeAnomalyDrawer, updateAnomalyStatus } = useApp();

  if (!selectedAnomaly) return null;

  const handleAcknowledge = () => {
    updateAnomalyStatus(selectedAnomaly.id, 'acknowledged');
  };

  const handleResolve = () => {
    updateAnomalyStatus(selectedAnomaly.id, 'resolved');
    closeAnomalyDrawer();
  };

  const comparisonData = [
    { name: 'Baseline', value: selectedAnomaly.expectedBaseline, fill: '#3B82F6' },
    { name: 'Min Safe', value: selectedAnomaly.expectedRange[0], fill: '#22D3EE' },
    { name: 'Max Safe', value: selectedAnomaly.expectedRange[1], fill: '#22D3EE' },
    { name: 'Observed', value: selectedAnomaly.observedValue, fill: selectedAnomaly.severity === 'critical' ? '#EF4444' : '#F59E0B' },
  ];

  return (
    <Drawer
      isOpen={!!selectedAnomaly}
      onClose={closeAnomalyDrawer}
      title={`Anomaly Diagnostic — ${selectedAnomaly.observationId}`}
      subtitle={`Flagged by ${selectedAnomaly.detectionAlgorithm} · ${selectedAnomaly.timestamp}`}
      width="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8]">Status:</span>
            <span className="text-xs font-mono font-semibold uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {selectedAnomaly.status}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {selectedAnomaly.status !== 'acknowledged' && selectedAnomaly.status !== 'resolved' && (
              <Button variant="secondary" size="sm" onClick={handleAcknowledge}>
                Acknowledge
              </Button>
            )}
            {selectedAnomaly.status !== 'resolved' ? (
              <Button variant="primary" size="sm" icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleResolve}>
                Resolve Anomaly
              </Button>
            ) : (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Anomaly Resolved
              </span>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-xl bg-[#0B1220] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              selectedAnomaly.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
              selectedAnomaly.severity === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
              'bg-blue-500/10 text-blue-400 border border-blue-500/30'
            }`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-[#F8FAFC]">
                  {selectedAnomaly.parameterLabel} Deviation
                </h4>
                <SeverityBadge severity={selectedAnomaly.severity} size="xs" pulse={selectedAnomaly.severity === 'critical'} />
              </div>
              <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                Observed: <span className="text-[#F8FAFC] font-bold">{selectedAnomaly.observedValue} {selectedAnomaly.unit}</span> (Expected {selectedAnomaly.expectedRange[0]}-{selectedAnomaly.expectedRange[1]} {selectedAnomaly.unit})
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#64748B] font-mono uppercase block">Anomaly Score</span>
            <span className="text-xl font-bold font-mono text-cyan-400">
              {(selectedAnomaly.anomalyScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Anomaly Score Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-[#94A3B8]">ML Outlier Score</span>
            <span className="text-[#F8FAFC] font-semibold">{selectedAnomaly.anomalyScore.toFixed(3)} / 1.000</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                selectedAnomaly.severity === 'critical' ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-glow-critical' :
                selectedAnomaly.severity === 'high' ? 'bg-gradient-to-r from-blue-500 to-amber-500' :
                'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${selectedAnomaly.anomalyScore * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#64748B] mt-1">
            <span>0.0 Normal</span>
            <span>0.5 Threshold</span>
            <span>1.0 Extreme Divergence</span>
          </div>
        </div>

        {/* Expected vs Observed Value Bar Chart */}
        <div className="p-4 rounded-xl bg-[#0B1220]/70 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Observed vs. Baseline Normal Range
            </span>
            <span className="text-[10px] font-mono text-[#64748B] uppercase">Unit: {selectedAnomaly.unit}</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121D2E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  formatter={(val: any) => [`${val} ${selectedAnomaly.unit}`, 'Value']}
                />
                <ReferenceLine y={selectedAnomaly.expectedBaseline} stroke="#3B82F6" strokeDasharray="3 3" />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Station Information */}
        <div className="p-4 rounded-xl bg-[#0B1220]/70 border border-white/10 space-y-2.5">
          <h5 className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-2 uppercase tracking-wider font-mono">
            <Radio className="w-4 h-4 text-[#22D3EE]" />
            Weather Station Telemetry Context
          </h5>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#64748B] block">Station Name</span>
              <span className="text-[#F8FAFC] font-medium">{selectedAnomaly.stationName}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Station ID</span>
              <span className="text-[#22D3EE] font-mono">{selectedAnomaly.stationId}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Confidence Level</span>
              <span className="text-emerald-400 font-mono font-semibold">{(selectedAnomaly.confidence * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Statistical Z-Score</span>
              <span className="text-[#F8FAFC] font-mono font-semibold">{selectedAnomaly.zScore > 0 ? `+${selectedAnomaly.zScore}` : selectedAnomaly.zScore}σ</span>
            </div>
          </div>
        </div>

        {/* AI Model Diagnostic Explanation */}
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#22D3EE] uppercase font-mono">
            <Cpu className="w-4 h-4" />
            AI Root-Cause Diagnostics ({selectedAnomaly.detectionAlgorithm})
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {selectedAnomaly.explanation}
          </p>
        </div>

        {/* Historical Context Metrics */}
        <div className="p-4 rounded-xl bg-[#0B1220]/70 border border-white/10 space-y-2.5">
          <h5 className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-2 uppercase tracking-wider font-mono">
            <Clock className="w-4 h-4 text-cyan-400" />
            30-Day Historical Baseline Reference
          </h5>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-[#64748B] block">7d Rolling Avg</span>
              <span className="text-xs font-bold font-mono text-[#F8FAFC]">{selectedAnomaly.historicalContext.rollingAvg7d} {selectedAnomaly.unit}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-[#64748B] block">Std Deviation</span>
              <span className="text-xs font-bold font-mono text-[#F8FAFC]">±{selectedAnomaly.historicalContext.standardDev}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-[#64748B] block">30d Min</span>
              <span className="text-xs font-bold font-mono text-[#F8FAFC]">{selectedAnomaly.historicalContext.minPastMonth} {selectedAnomaly.unit}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-[#64748B] block">30d Max</span>
              <span className="text-xs font-bold font-mono text-[#F8FAFC]">{selectedAnomaly.historicalContext.maxPastMonth} {selectedAnomaly.unit}</span>
            </div>
          </div>
        </div>

        {/* Recommended Action / Protocol */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase font-mono">
            <AlertOctagon className="w-4 h-4" />
            Recommended Investigation Action
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {selectedAnomaly.recommendation}
          </p>
        </div>
      </div>
    </Drawer>
  );
};

