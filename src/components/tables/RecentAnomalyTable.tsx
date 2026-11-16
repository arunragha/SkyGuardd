import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AnomalyRecord } from '../../types';
import { SeverityBadge } from '../ui/SeverityBadge';
import { Eye, ArrowUpDown, ChevronRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RecentAnomalyTableProps {
  limit?: number;
  showFilters?: boolean;
}

export const RecentAnomalyTable: React.FC<RecentAnomalyTableProps> = ({ 
  limit = 5,
  showFilters = false 
}) => {
  const { anomalies, openAnomalyDrawer, updateAnomalyStatus } = useApp();
  const [sortField, setSortField] = useState<keyof AnomalyRecord>('anomalyScore');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filteredAnomalies = anomalies.filter(a => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
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

  const displayList = limit ? sortedAnomalies.slice(0, limit) : sortedAnomalies;

  const handleSort = (field: keyof AnomalyRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-[#121D2E] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      {/* Table Header / Action Row */}
      <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              Recent Sensor Outlier Events
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Automated multi-algorithm telemetry flags awaiting validation
            </p>
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] font-mono">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#0B1220] text-xs font-mono text-[#F8FAFC] border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        )}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-[#0B1220]/60 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
              <th className="py-3.5 px-4 font-semibold">Station</th>
              <th className="py-3.5 px-4 font-semibold">Sensor Parameter</th>
              <th className="py-3.5 px-4 font-semibold">Observed Value</th>
              <th className="py-3.5 px-4 font-semibold">Expected Normal</th>
              <th 
                className="py-3.5 px-4 font-semibold cursor-pointer hover:text-[#22D3EE] transition-colors"
                onClick={() => handleSort('anomalyScore')}
              >
                <div className="flex items-center gap-1">
                  <span>Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 font-semibold">Severity</th>
              <th className="py-3.5 px-4 font-semibold">Timestamp</th>
              <th className="py-3.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs font-sans">
            {displayList.map((anomaly) => (
              <tr
                key={anomaly.id}
                onClick={() => openAnomalyDrawer(anomaly)}
                className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
              >
                {/* Station */}
                <td className="py-3.5 px-4">
                  <div className="font-medium text-[#F8FAFC] group-hover:text-[#22D3EE] transition-colors">
                    {anomaly.stationName}
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono">
                    {anomaly.stationId}
                  </div>
                </td>

                {/* Parameter */}
                <td className="py-3.5 px-4">
                  <span className="font-mono text-[#F8FAFC]">
                    {anomaly.parameterLabel}
                  </span>
                  <span className="text-[10px] text-[#64748B] block">
                    {anomaly.detectionAlgorithm}
                  </span>
                </td>

                {/* Observed Value */}
                <td className="py-3.5 px-4">
                  <span className={`font-mono font-bold ${
                    anomaly.severity === 'critical' ? 'text-red-400' :
                    anomaly.severity === 'high' ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    {anomaly.observedValue} {anomaly.unit}
                  </span>
                </td>

                {/* Expected Range */}
                <td className="py-3.5 px-4 font-mono text-[#94A3B8]">
                  {anomaly.expectedRange[0]} – {anomaly.expectedRange[1]} {anomaly.unit}
                </td>

                {/* Score */}
                <td className="py-3.5 px-4 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#F8FAFC]">
                      {(anomaly.anomalyScore * 100).toFixed(0)}%
                    </span>
                    <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden hidden md:block">
                      <div
                        className={`h-full ${
                          anomaly.anomalyScore > 0.8 ? 'bg-red-500' :
                          anomaly.anomalyScore > 0.6 ? 'bg-amber-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${anomaly.anomalyScore * 100}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Severity Badge */}
                <td className="py-3.5 px-4">
                  <SeverityBadge severity={anomaly.severity} size="xs" pulse={anomaly.severity === 'critical'} />
                </td>

                {/* Timestamp */}
                <td className="py-3.5 px-4 text-[#94A3B8] font-mono text-[11px] whitespace-nowrap">
                  {anomaly.timestamp}
                </td>

                {/* Action button */}
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAnomalyDrawer(anomaly);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-[#94A3B8] hover:text-[#22D3EE] border border-white/5 hover:border-cyan-500/30 transition-all font-mono text-[11px]"
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
  );
};

