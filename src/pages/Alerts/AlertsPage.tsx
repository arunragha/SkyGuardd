import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertItem, AlertType, AlertStatus } from '../../types';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { Button } from '../../components/ui/Button';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  Radio, 
  ExternalLink,
  CheckCheck,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { 
    alerts, 
    updateAlertStatus, 
    markAllAlertsAsRead, 
    anomalies, 
    openAnomalyDrawer 
  } = useApp();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Summary Metrics
  const totalAlerts = alerts.length;
  const unreadAlerts = alerts.filter(a => a.status === 'unread').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) ||
        a.stationName.toLowerCase().includes(q) ||
        a.sensor.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleViewAlertDetails = (alert: AlertItem) => {
    if (alert.anomalyId) {
      const match = anomalies.find(a => a.id === alert.anomalyId);
      if (match) {
        openAnomalyDrawer(match);
        return;
      }
    }
    // Fallback: open first anomaly
    if (anomalies.length > 0) openAnomalyDrawer(anomalies[0]);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Mark All as Read */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101827] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
              Mission Alerts Center
            </span>
            <span className="text-xs text-[#64748B] font-mono">Automated Incident Triage</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Alerts & Anomaly Incident Stream
          </h1>
          <p className="text-xs lg:text-sm text-[#94A3B8]">
            Real-time event logging, sensor malfunction warnings, and critical physical deviations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<CheckCheck className="w-4 h-4" />}
            onClick={markAllAlertsAsRead}
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* 2. Four Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <div className="bg-[#121D2E] rounded-xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-mono mb-2 uppercase">
            <span>Total Alerts</span>
            <Bell className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#F8FAFC]">
            {totalAlerts.toString().padStart(2, '0')}
          </div>
          <p className="text-[11px] text-[#64748B] mt-2">Active in rolling 48-hour buffer</p>
        </div>

        {/* Unread Alerts */}
        <div className="bg-[#121D2E] rounded-xl p-5 border border-amber-500/20 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-mono mb-2 uppercase">
            <span>Unread Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400">
            {unreadAlerts.toString().padStart(2, '0')}
          </div>
          <p className="text-[11px] text-[#64748B] mt-2">Awaiting operator triage</p>
        </div>

        {/* Critical Alerts */}
        <div className="bg-[#121D2E] rounded-xl p-5 border border-red-500/20 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-mono mb-2 uppercase">
            <span>Critical Severity</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-red-400">
            {criticalAlerts.toString().padStart(2, '0')}
          </div>
          <p className="text-[11px] text-[#64748B] mt-2">Immediate telemetry divergence</p>
        </div>

        {/* Resolved Alerts */}
        <div className="bg-[#121D2E] rounded-xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-mono mb-2 uppercase">
            <span>Resolved Incidents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {resolvedAlerts.toString().padStart(2, '0')}
          </div>
          <p className="text-[11px] text-[#64748B] mt-2">Diagnosed and verified</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-[#121D2E] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alert title, sensor, station, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] placeholder-[#64748B] pl-9 pr-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#64748B]">Category:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#0B1220] text-[#F8FAFC] border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Categories</option>
              <option value="critical">Critical Anomaly</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
              <option value="malfunction">Sensor Malfunction</option>
              <option value="missing_data">Telemetry Gap</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#64748B]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0B1220] text-[#F8FAFC] border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Statuses</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Alert List Cards */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-[#121D2E] rounded-2xl border border-white/10 text-[#94A3B8]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-sm">No active alerts match current query</p>
            <p className="text-xs text-[#64748B] mt-1">All telemetry sensors operating within baseline bounds</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all duration-200 shadow-lg ${
                alert.status === 'unread'
                  ? 'bg-[#152338] border-cyan-500/30 shadow-cyan-950/20'
                  : 'bg-[#121D2E] border-white/10'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <SeverityBadge severity={alert.severity} size="xs" pulse={alert.severity === 'critical'} />
                    <h3 className="text-sm font-semibold text-[#F8FAFC]">
                      {alert.title}
                    </h3>
                    {alert.status === 'unread' && (
                      <span className="text-[9px] font-mono font-bold bg-cyan-500 text-[#080D18] px-1.5 py-0.2 rounded uppercase">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed max-w-3xl">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#64748B] pt-1">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Radio className="w-3.5 h-3.5" />
                      {alert.stationName}
                    </span>
                    <span>Sensor: <span className="text-[#F8FAFC]">{alert.sensor}</span></span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {alert.timestamp}
                    </span>
                    <span>
                      State: <span className="text-[#F8FAFC] uppercase font-semibold">{alert.status}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Functional Controls */}
                <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                  {alert.status === 'unread' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateAlertStatus(alert.id, 'read')}
                    >
                      Mark Read
                    </Button>
                  )}

                  {alert.status !== 'acknowledged' && alert.status !== 'resolved' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                    >
                      Acknowledge
                    </Button>
                  )}

                  {alert.status !== 'resolved' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateAlertStatus(alert.id, 'resolved')}
                    >
                      Resolve
                    </Button>
                  )}

                  <Button
                    variant="cyan"
                    size="sm"
                    icon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => handleViewAlertDetails(alert)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

