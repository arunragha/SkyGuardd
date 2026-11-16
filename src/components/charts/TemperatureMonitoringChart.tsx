import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ReferenceArea,
  Scatter
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { Thermometer, ShieldAlert, Sliders } from 'lucide-react';

export const TemperatureMonitoringChart: React.FC = () => {
  const { timeSeriesData, openAnomalyDrawer, anomalies } = useApp();
  const [timeRange, setTimeRange] = useState<'6H' | '12H' | '24H'>('24H');

  // Filter based on timeRange
  const displayData = React.useMemo(() => {
    if (timeRange === '6H') return timeSeriesData.slice(-7);
    if (timeRange === '12H') return timeSeriesData.slice(-13);
    return timeSeriesData;
  }, [timeSeriesData, timeRange]);

  // Anomalous points for overlay
  const anomalyPoints = displayData
    .filter(d => d.isAnomalyTemp)
    .map(d => ({
      time: d.time,
      temperature: d.temperature,
      label: 'Anomaly'
    }));

  return (
    <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden flex flex-col">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[#F8FAFC] tracking-tight">
                Temperature Envelope & Anomaly Tracking
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#94A3B8] border border-white/10">
                LIVE BUFFER
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Continuous thermal stream vs. statistical baseline envelope (20.0°C – 30.5°C)
            </p>
          </div>
        </div>

        {/* Time Filter Controls */}
        <div className="flex items-center gap-1.5 bg-[#0B1220] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          {(['6H', '12H', '24H'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                timeRange === r
                  ? 'bg-[#3B82F6] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-72 lg:h-80 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            
            <XAxis 
              dataKey="time" 
              stroke="#64748B" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            
            <YAxis 
              stroke="#64748B" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              domain={[10, 48]}
              unit="°C"
            />

            {/* Normal Range Reference Area */}
            <ReferenceArea 
              y1={20.0} 
              y2={30.5} 
              fill="#22D3EE" 
              fillOpacity={0.05} 
              stroke="#22D3EE"
              strokeDasharray="3 3"
              strokeOpacity={0.25}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#121D2E] border border-cyan-500/30 p-3 rounded-xl shadow-2xl text-xs space-y-1 font-mono">
                      <p className="text-[#94A3B8] font-semibold">{label} UTC</p>
                      <p className="text-cyan-400 font-bold text-sm">
                        Measured: {data.temperature}°C
                      </p>
                      <p className="text-[#64748B]">
                        Baseline Normal: {data.tempExpectedMin}°C – {data.tempExpectedMax}°C
                      </p>
                      {data.isAnomalyTemp && (
                        <div className="mt-2 pt-2 border-t border-red-500/30 flex items-center gap-1.5 text-red-400 font-bold">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>ANOMALOUS SPIKE DETECTED</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend 
              verticalAlign="top" 
              align="right" 
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', color: '#94A3B8' }} 
            />

            {/* Shaded Area */}
            <Area
              type="monotone"
              dataKey="temperature"
              name="Ambient Temperature (°C)"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#tempGradient)"
              activeDot={{ r: 6, fill: '#22D3EE', stroke: '#080D18', strokeWidth: 2 }}
            />

            {/* Normal Max Envelope */}
            <Line
              type="monotone"
              dataKey="tempExpectedMax"
              name="Normal Upper Bound"
              stroke="#22C55E"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />

            {/* Normal Min Envelope */}
            <Line
              type="monotone"
              dataKey="tempExpectedMin"
              name="Normal Lower Bound"
              stroke="#22C55E"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />

            {/* Anomalous Outlier Points Highlighted in Red */}
            <Scatter
              data={anomalyPoints}
              name="Flagged Anomalies"
              fill="#EF4444"
              shape="circle"
              r={7}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-2 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-[#94A3B8] gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Observed Trajectory
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-500" />
            Normal Bound (20°C - 30.5°C)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping-slow" />
            Outlier Anomaly (&gt;3σ)
          </span>
        </div>

        <button
          onClick={() => {
            const firstAnomaly = anomalies[0];
            if (firstAnomaly) openAnomalyDrawer(firstAnomaly);
          }}
          className="text-xs text-[#22D3EE] hover:underline font-mono"
        >
          Inspect Outlier Details →
        </button>
      </div>
    </div>
  );
};
