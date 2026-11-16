import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { WeatherStation } from '../../types';
import { SeverityBadge } from '../ui/SeverityBadge';
import { 
  Radio, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  Activity, 
  Cpu, 
  Battery, 
  Wifi, 
  Layers,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface StationDetailModalProps {
  station: WeatherStation | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMonitoring: (stationId: string) => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  isOpen,
  onClose,
  onNavigateToMonitoring,
}) => {
  if (!station) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${station.name} (${station.code})`}
      subtitle={`${station.location} · Region: ${station.region}`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] font-mono">Firmware:</span>
            <span className="text-xs font-mono text-cyan-400">{station.firmwareVersion}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="cyan"
              size="sm"
              icon={<Activity className="w-4 h-4" />}
              onClick={() => {
                onClose();
                onNavigateToMonitoring(station.id);
              }}
            >
              Open Live Stream
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Status & Signal Banner */}
        <div className="p-4 rounded-xl bg-[#0B1220] border border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SeverityBadge severity={station.status} size="sm" pulse={station.status === 'online'} />
            <span className="text-[#94A3B8] font-mono">
              Last Ping: <span className="text-[#F8FAFC]">{station.lastCommunication}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <Battery className="w-4 h-4 text-emerald-400" />
              {station.batteryLevel}% Battery
            </span>
            <span className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-cyan-400" />
              {station.signalStrength}% RSSI
            </span>
          </div>
        </div>

        {/* Geographic & Structural Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-[#64748B] block uppercase">Latitude</span>
            <span className="text-sm font-bold text-[#F8FAFC]">{station.lat.toFixed(4)}° N</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-[#64748B] block uppercase">Longitude</span>
            <span className="text-sm font-bold text-[#F8FAFC]">{station.lng.toFixed(4)}° W</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-[#64748B] block uppercase">Elevation ASL</span>
            <span className="text-sm font-bold text-cyan-400">{station.elevation} m</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-[#64748B] block uppercase">Active Sensors</span>
            <span className="text-sm font-bold text-emerald-400">{station.sensorCount} Channels</span>
          </div>
        </div>

        {/* Current Live Readings Matrix */}
        <div className="p-4 rounded-xl bg-[#0B1220]/70 border border-white/10 space-y-3">
          <h4 className="text-xs font-semibold text-[#F8FAFC] uppercase font-mono tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Instantaneous Telemetry Snapshot
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-lg bg-black/30 border border-white/5">
              <span className="text-[10px] text-[#64748B] block">Temperature</span>
              <span className="text-lg font-bold text-[#F8FAFC]">{station.currentReadings.temperature}°C</span>
            </div>
            <div className="p-3 rounded-lg bg-black/30 border border-white/5">
              <span className="text-[10px] text-[#64748B] block">Relative Humidity</span>
              <span className="text-lg font-bold text-cyan-400">{station.currentReadings.humidity}%</span>
            </div>
            <div className="p-3 rounded-lg bg-black/30 border border-white/5">
              <span className="text-[10px] text-[#64748B] block">Pressure</span>
              <span className="text-lg font-bold text-emerald-400">{station.currentReadings.pressure} hPa</span>
            </div>
            <div className="p-3 rounded-lg bg-black/30 border border-white/5">
              <span className="text-[10px] text-[#64748B] block">Wind Velocity</span>
              <span className="text-lg font-bold text-purple-400">{station.currentReadings.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Anomaly Health Assessment */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          station.anomalyCount > 0 ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-3">
            {station.anomalyCount > 0 ? (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <p className="font-semibold text-xs text-[#F8FAFC]">
                {station.anomalyCount > 0 ? `${station.anomalyCount} Active Anomaly Flagged` : 'All Sensor Envelopes Within Normal Bounds'}
              </p>
              <p className="text-[11px] text-[#94A3B8]">
                {station.anomalyCount > 0 ? 'Diagnostic investigation required in Anomaly Center.' : 'No sensor drift or telemetry discontinuity detected.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

