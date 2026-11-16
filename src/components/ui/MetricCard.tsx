import React, { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  subtitle?: string;
  statusBadge?: ReactNode;
  accentColor?: 'blue' | 'cyan' | 'red' | 'amber' | 'emerald';
  isDemo?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  subtitle,
  statusBadge,
  accentColor = 'blue',
  isDemo = true,
  className = '',
}) => {
  const accentGlow = {
    blue: 'border-blue-500/20 hover:border-blue-500/40 hover:shadow-blue-500/10',
    cyan: 'border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-cyan-500/10',
    red: 'border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/10',
    amber: 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/10',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/10',
  }[accentColor];

  const iconBg = {
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    red: 'bg-red-500/10 text-red-400 border border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  }[accentColor];

  return (
    <div
      className={`relative bg-[#121D2E] rounded-xl p-5 border transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-black/40 ${accentGlow} ${className}`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#94A3B8] font-mono">
            {title}
          </span>
          {isDemo && (
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/5 text-[#64748B] border border-white/5">
              DEMO
            </span>
          )}
        </div>
        <div className={`p-2 rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>

      {/* Main value */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-[#F8FAFC] font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-[#94A3B8]">
            {unit}
          </span>
        )}
      </div>

      {/* Bottom meta row: trend or subtitle */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        {trend && (
          <div className="flex items-center gap-1.5 text-xs">
            {trend.direction === 'up' && (
              <span className="flex items-center font-medium text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {trend.value}
              </span>
            )}
            {trend.direction === 'down' && (
              <span className="flex items-center font-medium text-amber-400">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {trend.value}
              </span>
            )}
            {trend.direction === 'neutral' && (
              <span className="flex items-center font-medium text-[#94A3B8]">
                <Minus className="w-3.5 h-3.5 mr-0.5" />
                {trend.value}
              </span>
            )}
            {trend.label && (
              <span className="text-[#64748B] text-[11px] truncate">{trend.label}</span>
            )}
          </div>
        )}

        {subtitle && !trend && (
          <span className="text-xs text-[#94A3B8] truncate">{subtitle}</span>
        )}

        {statusBadge && <div>{statusBadge}</div>}
      </div>
    </div>
  );
};

