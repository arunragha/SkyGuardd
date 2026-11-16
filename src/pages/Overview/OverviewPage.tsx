import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../../components/ui/MetricCard';
import { TemperatureMonitoringChart } from '../../components/charts/TemperatureMonitoringChart';
import { AnomalyDistributionChart } from '../../components/charts/AnomalyDistributionChart';
import { RecentAnomalyTable } from '../../components/tables/RecentAnomalyTable';
import { OverviewBottomSections } from '../../components/dashboard/OverviewBottomSections';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  Radio, 
  ShieldAlert, 
  RotateCw, 
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const OverviewPage: React.FC = () => {
  const { 
    selectedStation, 
    stations, 
    anomalies, 
    lastSyncTime, 
    refreshData 
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeAnomaliesCount = anomalies.filter(
    a => a.status === 'detected' || a.status === 'investigating'
  ).length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedSyncTime = lastSyncTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101827] border border-white/10 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
              Mission Control
            </span>
            <span className="text-xs text-[#64748B] font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Weather Intelligence Overview
          </h1>
          <p className="text-xs lg:text-sm text-[#94A3B8]">
            Monitor environmental conditions and detect unusual sensor behaviour across connected telemetry arrays.
          </p>
        </div>

        {/* Status / Station / Refresh Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 bg-[#0B1220]/80 p-2 rounded-xl border border-white/5">
          <div className="px-3 py-1.5 border-r border-white/10 text-xs">
            <span className="text-[#64748B] block text-[10px] font-mono uppercase">Selected Station</span>
            <span className="text-[#22D3EE] font-semibold truncate max-w-[140px] block">
              {selectedStation.name}
            </span>
          </div>

          <div className="px-3 py-1.5 border-r border-white/10 text-xs">
            <span className="text-[#64748B] block text-[10px] font-mono uppercase">Last Sync</span>
            <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedSyncTime} UTC
            </span>
          </div>

          <Button
            variant="cyan"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            icon={<RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Sync Telemetry
          </Button>
        </div>
      </div>

      {/* 2. Weather Metric Cards (6 Premium Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Temperature */}
        <MetricCard
          title="Temperature"
          value={selectedStation.currentReadings.temperature}
          unit="°C"
          icon={<Thermometer className="w-5 h-5" />}
          trend={{ value: '+1.4°C', direction: 'up', label: 'vs 1h ago' }}
          accentColor="blue"
        />

        {/* 2. Humidity */}
        <MetricCard
          title="Humidity"
          value={selectedStation.currentReadings.humidity}
          unit="%"
          icon={<Droplets className="w-5 h-5" />}
          trend={{ value: '-3.2%', direction: 'down', label: 'vs 1h ago' }}
          accentColor="cyan"
        />

        {/* 3. Atmospheric Pressure */}
        <MetricCard
          title="Atm. Pressure"
          value={selectedStation.currentReadings.pressure}
          unit="hPa"
          icon={<Gauge className="w-5 h-5" />}
          trend={{ value: '-0.8 hPa', direction: 'down', label: 'steady' }}
          accentColor="emerald"
        />

        {/* 4. Wind Speed */}
        <MetricCard
          title="Wind Speed"
          value={selectedStation.currentReadings.windSpeed}
          unit="km/h"
          icon={<Wind className="w-5 h-5" />}
          trend={{ value: `${selectedStation.currentReadings.windDirection} 18 km/h`, direction: 'neutral' }}
          accentColor="cyan"
        />

        {/* 5. Active Stations */}
        <MetricCard
          title="Active Stations"
          value={stations.length}
          unit="fleet"
          icon={<Radio className="w-5 h-5" />}
          subtitle="11 Online · 1 Offline"
          accentColor="emerald"
        />

        {/* 6. Detected Anomalies */}
        <MetricCard
          title="Detected Anomalies"
          value={activeAnomaliesCount.toString().padStart(2, '0')}
          unit="active"
          icon={<ShieldAlert className="w-5 h-5" />}
          subtitle="2 Critical · 2 High"
          accentColor="red"
        />
      </div>

      {/* 3. Main Visualization Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TemperatureMonitoringChart />
        </div>
        <div className="xl:col-span-1">
          <AnomalyDistributionChart />
        </div>
      </div>

      {/* 4. Recent Anomaly Section */}
      <div>
        <RecentAnomalyTable limit={5} showFilters={true} />
      </div>

      {/* 5. Bottom Sections */}
      <OverviewBottomSections />
    </div>
  );
};

