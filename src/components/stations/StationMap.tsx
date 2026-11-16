import React, { useEffect, useRef } from 'react';
import { WeatherStation } from '../../types';
import L from 'leaflet';

interface StationMapProps {
  stations: WeatherStation[];
  selectedStationId: string;
  onSelectStation: (station: WeatherStation) => void;
}

export const StationMap: React.FC<StationMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map centered over Continental US
      const map = L.map(mapContainerRef.current, {
        center: [39.8283, -98.5795],
        zoom: 4,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark style tile layer (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Render station markers
    stations.forEach((station) => {
      const isSelected = station.id === selectedStationId;
      const markerColor = 
        station.status === 'online' ? '#22C55E' :
        station.status === 'degraded' ? '#F59E0B' : '#EF4444';

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-station-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '32px' : '24px'};
            height: ${isSelected ? '32px' : '24px'};
            background: #121D2E;
            border: 2px solid ${markerColor};
            border-radius: 50%;
            box-shadow: 0 0 14px ${markerColor};
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            <div style="
              width: ${isSelected ? '12px' : '8px'};
              height: ${isSelected ? '12px' : '8px'};
              background: ${markerColor};
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
        iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="padding: 4px; font-family: Inter, sans-serif;">
          <div style="font-size: 13px; font-weight: 700; color: #F8FAFC; margin-bottom: 2px;">
            ${station.name}
          </div>
          <div style="font-size: 11px; font-family: monospace; color: #22D3EE; margin-bottom: 6px;">
            ${station.code} · ${station.region}
          </div>
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 4px;">
            Coords: ${station.lat.toFixed(4)}, ${station.lng.toFixed(4)}
          </div>
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">
            Temp: <b style="color: #F8FAFC;">${station.currentReadings.temperature}°C</b> · Humidity: <b style="color: #F8FAFC;">${station.currentReadings.humidity}%</b>
          </div>
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${markerColor};">
            Status: ${station.status.toUpperCase()} (${station.anomalyCount} Anomalies)
          </div>
        </div>
      `);

      marker.on('click', () => {
        onSelectStation(station);
      });

      markersRef.current[station.id] = marker;
    });

    // If selected station changes, fly to it
    const active = stations.find(s => s.id === selectedStationId);
    if (active && map) {
      map.flyTo([active.lat, active.lng], 7, { duration: 1.2 });
    }

  }, [stations, selectedStationId]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Map Overlay Badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#0B1220]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[#F8FAFC] font-semibold">Continental Telemetry Grid</span>
        <span className="text-[#64748B]">({stations.length} Active Nodes)</span>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#0B1220]/90 backdrop-blur-md p-2 rounded-xl border border-white/10 text-[11px] font-mono flex items-center gap-3">
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Online
        </span>
        <span className="flex items-center gap-1 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Degraded
        </span>
        <span className="flex items-center gap-1 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-400" /> Offline
        </span>
      </div>
    </div>
  );
};

