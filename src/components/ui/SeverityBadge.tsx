import React from 'react';
import { SeverityLevel, AlertType } from '../../types';

interface SeverityBadgeProps {
  severity: SeverityLevel | AlertType | 'normal' | 'online' | 'offline' | 'degraded';
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ 
  severity, 
  size = 'sm',
  pulse = false
}) => {
  const getStyles = () => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/30',
          dot: 'bg-red-400',
          label: 'Critical',
        };
      case 'high':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          label: 'High',
        };
      case 'medium':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-400',
          label: 'Medium',
        };
      case 'low':
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          dot: 'bg-cyan-400',
          label: 'Low',
        };
      case 'malfunction':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          dot: 'bg-purple-400',
          label: 'Malfunction',
        };
      case 'missing_data':
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          dot: 'bg-slate-400',
          label: 'Telemetry Gap',
        };
      case 'online':
      case 'normal':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: severity === 'online' ? 'Online' : 'Normal',
        };
      case 'degraded':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          label: 'Degraded',
        };
      case 'offline':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          label: 'Offline',
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
          dot: 'bg-slate-400',
          label: String(severity),
        };
    }
  };

  const style = getStyles();
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 font-medium',
    sm: 'text-xs px-2.5 py-1 font-medium',
    md: 'text-sm px-3 py-1.5 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase font-mono ${style.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${pulse ? 'animate-ping' : ''}`} />
      {style.label}
    </span>
  );
};

