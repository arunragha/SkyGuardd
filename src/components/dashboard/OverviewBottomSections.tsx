import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Radio, 
  Activity, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Wifi, 
  Battery, 
  Clock, 
  Server,
  Zap
} from 'lucide-react';
import { DEMO_SYSTEM_HEALTH } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

export const OverviewBottomSections: React.FC = () => {
  const { stations, anomalies } = useApp();
  const navigate = useNavigate();

  const onlineStations = stations.filter(s => s.status === 'online').length;
  const degradedStations = stations.filter(s => s.status === 'degraded').length;
  const offlineStations = stations.filter(s => s.status === 'offline').length;

  const activities = [
    { id: 1, type: 'anomaly', title: 'Severe thermal deviation flagged', target: 'Ridge Peak Observatory', time: '14 mins ago', severity: 'critical' },
    { id: 2, type: 'model', title: 'Isolation Forest inference cycle complete', target: 'Fleet Telemetry Buffer', time: '22 mins ago', severity: 'info' },
    { id: 3, type: 'sync', title: 'Firmware heartbeat received from 11 nodes', target: 'Global Array', time: '35 mins ago', severity: 'success' },
    { id: 4, type: 'station', title: 'Telemetry lag detected on Northern Tundra', target: 'Fairbanks Sector', time: '48 mins ago', severity: 'warning' },
  ];

  const aiInsights = [
    {
      id: 1,
      tag: 'THERMAL INVERSION',
      title: 'Highland Lapse Rate Anomaly',
      confidence: '96.2%',
      content: 'Ridge Peak shows +15.7°C spike while Cascade Glacier reports 4.2°C at 2180m. Statistical cross-correlation suggests isolated thermistor radiation shield failure rather than meteorological front.'
    },
    {
      id: 2,
      tag: 'BAROMETRIC STABILITY',
      title: 'Cyclonic Front Divergence',
      confidence: '92.8%',
      content: 'Sonoran Basin barometric dip (-20.8 hPa) lack expected anemometer acceleration vectors (V < 14 km/h). 94% probability of localized piezoresistive sensor drift.'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* 1. Weather Station Status */}
      <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Radio className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-[#F8FAFC]">Station Fleet Health</h4>
            </div>
            <button
              onClick={() => navigate('/stations')}
              className="text-xs text-[#22D3EE] hover:underline font-mono"
            >
              Manage →
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1220] border border-white/5">
              <span className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Online & Synchronized
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {onlineStations} / {stations.length}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1220] border border-white/5">
              <span className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Degraded Telemetry
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {degradedStations} station
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1220] border border-white/5">
              <span className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Offline (Battery Low)
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">
                {offlineStations} station
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#64748B] flex justify-between items-center">
          <span>Fleet Coverage: Continental US & Arctic</span>
          <span className="text-cyan-400 font-mono">194 Active Sensors</span>
        </div>
      </div>

      {/* 2. Recent Activity Log */}
      <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-[#F8FAFC]">Recent Activity</h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="space-y-3">
            {activities.map(act => (
              <div key={act.id} className="flex items-start gap-2.5 text-xs">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  act.severity === 'critical' ? 'bg-red-400' :
                  act.severity === 'warning' ? 'bg-amber-400' :
                  act.severity === 'success' ? 'bg-emerald-400' : 'bg-cyan-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[#F8FAFC] font-medium truncate">{act.title}</p>
                  <p className="text-[11px] text-[#64748B] font-mono truncate">
                    {act.target} · {act.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#64748B] flex justify-between">
          <span>Logged by Sentinel Controller</span>
          <span className="text-cyan-400 font-mono">Sync 100%</span>
        </div>
      </div>

      {/* 3. AI-Generated Weather Insights */}
      <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-[#F8FAFC]">AI Weather Insights</h4>
            </div>
            <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
              GPT-4 / IF
            </span>
          </div>

          <div className="space-y-3">
            {aiInsights.map(ins => (
              <div key={ins.id} className="p-3 rounded-xl bg-[#0B1220] border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded">
                    {ins.tag}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {ins.confidence} Conf.
                  </span>
                </div>
                <h5 className="text-xs font-semibold text-[#F8FAFC]">{ins.title}</h5>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-3">
                  {ins.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-[#22D3EE] hover:underline cursor-pointer flex items-center justify-between"
          onClick={() => navigate('/anomalies')}
        >
          <span>Deep anomaly reasoning →</span>
        </div>
      </div>

      {/* 4. Overall System Health */}
      <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-[#F8FAFC]">System Health</h4>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {DEMO_SYSTEM_HEALTH.overallHealth}%
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#94A3B8]">Fleet Telemetry Sync Rate</span>
                <span className="text-[#F8FAFC] font-semibold">{DEMO_SYSTEM_HEALTH.dataSyncRate}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${DEMO_SYSTEM_HEALTH.dataSyncRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#94A3B8]">Inference Latency</span>
                <span className="text-cyan-400 font-semibold">{DEMO_SYSTEM_HEALTH.modelInferenceTimeMs} ms</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#94A3B8]">Edge API Response</span>
                <span className="text-[#F8FAFC] font-semibold">{DEMO_SYSTEM_HEALTH.apiLatencyMs} ms</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-blue-400" style={{ width: '24%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#64748B] flex justify-between">
          <span>Heartbeat: {DEMO_SYSTEM_HEALTH.lastSyncTime}</span>
          <span className="text-emerald-400 font-mono">Nominal</span>
        </div>
      </div>
    </div>
  );
};

