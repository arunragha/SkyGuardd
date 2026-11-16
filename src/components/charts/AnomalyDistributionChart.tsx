import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, ShieldCheck } from 'lucide-react';

export const AnomalyDistributionChart: React.FC = () => {
  const distributionData = [
    { name: 'Normal Readings', value: 94.2, count: 18240, color: '#22C55E' },
    { name: 'Low Severity', value: 2.8, count: 540, color: '#22D3EE' },
    { name: 'Medium Severity', value: 1.8, count: 350, color: '#3B82F6' },
    { name: 'High Severity', value: 0.8, count: 155, color: '#F59E0B' },
    { name: 'Critical Severity', value: 0.4, count: 77, color: '#EF4444' },
  ];

  const totalAnalyzed = 19362;

  return (
    <div className="bg-[#121D2E] rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Telemetry Classification</h3>
            <p className="text-[11px] text-[#94A3B8]">Fleetwide 24-Hour Severity Breakdown</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#64748B] bg-white/5 px-2 py-0.5 rounded border border-white/5">
          19.3K SAMPLES
        </span>
      </div>

      {/* Donut Chart with Center Metric */}
      <div className="relative h-56 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distributionData}
              innerRadius={65}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
              stroke="#121D2E"
              strokeWidth={2}
            >
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#0B1220] border border-white/10 p-2.5 rounded-xl text-xs font-mono shadow-2xl">
                      <p className="text-[#F8FAFC] font-semibold">{item.name}</p>
                      <p className="text-cyan-400">{item.value}% ({item.count.toLocaleString()} observations)</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold font-mono text-[#F8FAFC]">94.2%</span>
          <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">
            Nominal
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        {distributionData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#94A3B8] truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#F8FAFC] font-semibold">{item.value}%</span>
              <span className="text-[#64748B] text-[10px]">({item.count})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

