import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WeatherStation } from '../../types';
import { StationMap } from '../../components/stations/StationMap';
import { AddStationModal } from '../../components/stations/AddStationModal';
import { StationDetailModal } from '../../components/stations/StationDetailModal';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { Button } from '../../components/ui/Button';
import { 
  Radio, 
  Plus, 
  Search, 
  MapPin, 
  Sliders, 
  Compass, 
  Activity, 
  ShieldAlert, 
  Eye, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StationsPage: React.FC = () => {
  const { stations, selectedStationId, setSelectedStationId, addStation } = useApp();
  const navigate = useNavigate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailStation, setDetailStation] = useState<WeatherStation | null>(null);
  const [stationSearch, setStationSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredStations = stations.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (stationSearch) {
      const q = stationSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelectStation = (st: WeatherStation) => {
    setSelectedStationId(st.id);
    setDetailStation(st);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Add Station Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101827] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
              IoT Sensor Fleet
            </span>
            <span className="text-xs text-[#64748B] font-mono">12 Connected Telemetry Nodes</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Weather Stations Management
          </h1>
          <p className="text-xs lg:text-sm text-[#94A3B8]">
            Manage geographic deployment, telemetry link integrity, and edge sensor status across the national array.
          </p>
        </div>

        <Button
          variant="cyan"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Station
        </Button>
      </div>

      {/* 2. Main Two-Column Layout (Left: Map, Right: Station Cards List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col h-[650px] lg:h-[760px] sticky top-6">
          <div className="flex-1 w-full h-full">
            <StationMap
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={handleSelectStation}
            />
          </div>
        </div>

        {/* Right Column: Search, Filter & Station List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Station Filter Controls */}
          <div className="bg-[#121D2E] p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search station name, code, region..."
                value={stationSearch}
                onChange={(e) => setStationSearch(e.target.value)}
                className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] placeholder-[#64748B] pl-9 pr-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#64748B]">Status Filter:</span>
              <div className="flex gap-1">
                {(['all', 'online', 'degraded', 'offline'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                      statusFilter === s
                        ? 'bg-[#3B82F6] text-white font-semibold'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable Station Cards List */}
          <div className="space-y-3 max-h-[660px] overflow-y-auto pr-1">
            {filteredStations.map((station) => {
              const isSelected = station.id === selectedStationId;
              return (
                <div
                  key={station.id}
                  onClick={() => handleSelectStation(station)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-lg group ${
                    isSelected
                      ? 'bg-[#18263D] border-cyan-400/60 shadow-cyan-500/10 -translate-x-1'
                      : 'bg-[#121D2E] border-white/10 hover:border-white/20 hover:bg-[#152236]'
                  }`}
                >
                  {/* Top card row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[#F8FAFC] group-hover:text-cyan-400 transition-colors">
                          {station.name}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-cyan-400 border border-white/10">
                          {station.code}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                        <span className="truncate">{station.location}</span>
                      </p>
                    </div>

                    <SeverityBadge severity={station.status} size="xs" pulse={station.status === 'online'} />
                  </div>

                  {/* Lat/Long & Elevation */}
                  <div className="grid grid-cols-3 gap-2 py-2 my-2 border-y border-white/5 text-[11px] font-mono text-[#94A3B8]">
                    <div>
                      <span className="text-[#64748B] block text-[9px]">COORDINATES</span>
                      <span>{station.lat.toFixed(2)}°, {station.lng.toFixed(2)}°</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[9px]">ELEVATION</span>
                      <span className="text-cyan-400">{station.elevation}m</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[9px]">CHANNELS</span>
                      <span className="text-emerald-400">{station.sensorCount} sensors</span>
                    </div>
                  </div>

                  {/* Bottom Meta & Action */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-[#64748B] font-mono text-[11px]">
                      <span>Ping: {station.lastCommunication}</span>
                      {station.anomalyCount > 0 ? (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          {station.anomalyCount} Flagged
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">Nominal</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailStation(station);
                        }}
                        className="p-1 rounded-lg text-[#94A3B8] hover:text-cyan-400 hover:bg-white/5"
                        title="View Station Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStationId(station.id);
                          navigate('/monitoring');
                        }}
                        className="p-1 rounded-lg text-[#94A3B8] hover:text-cyan-400 hover:bg-white/5"
                        title="Open in Live Monitoring"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Station Modal */}
      <AddStationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStation={addStation}
      />

      {/* Detailed Station Modal */}
      <StationDetailModal
        station={detailStation}
        isOpen={!!detailStation}
        onClose={() => setDetailStation(null)}
        onNavigateToMonitoring={(id) => {
          setSelectedStationId(id);
          navigate('/monitoring');
        }}
      />
    </div>
  );
};

