import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { WeatherStation } from '../../types';
import { Radio, MapPin, Cpu, Compass } from 'lucide-react';

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStation: (stationData: Partial<WeatherStation>) => void;
}

export const AddStationModal: React.FC<AddStationModalProps> = ({
  isOpen,
  onClose,
  onAddStation,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('Pacific Northwest');
  const [lat, setLat] = useState('45.5152');
  const [lng, setLng] = useState('-122.6784');
  const [elevation, setElevation] = useState('150');
  const [sensorCount, setSensorCount] = useState('16');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    onAddStation({
      name,
      code,
      location,
      region,
      lat: parseFloat(lat) || 45.0,
      lng: parseFloat(lng) || -120.0,
      elevation: parseFloat(elevation) || 100,
      sensorCount: parseInt(sensorCount, 10) || 16,
    });

    onClose();
    setName('');
    setCode('');
    setLocation('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision New Fleet Weather Station"
      subtitle="Register an IoT edge station node and sync telemetry streams"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="cyan" size="sm" onClick={handleSubmit}>
            Onboard Station Node
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[#94A3B8] block mb-1">Station Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sierra Crest Post"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-[#94A3B8] block mb-1">Station ID / Code</label>
            <input
              type="text"
              required
              placeholder="e.g. SKY-SC-13"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-cyan-400 font-bold focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[#94A3B8] block mb-1">Geographic Location</label>
            <input
              type="text"
              placeholder="e.g. Tahoe National Forest, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-[#94A3B8] block mb-1">Climate Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
            >
              <option value="Pacific Northwest">Pacific Northwest</option>
              <option value="Sierra Nevada">Sierra Nevada</option>
              <option value="Rocky Mountains">Rocky Mountains</option>
              <option value="Southwest Arid">Southwest Arid</option>
              <option value="Midwest Plains">Midwest Plains</option>
              <option value="Southeast Subtropical">Southeast Subtropical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[#94A3B8] block mb-1">Latitude (°N)</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-[#94A3B8] block mb-1">Longitude (°W)</label>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-[#94A3B8] block mb-1">Elevation (m)</label>
            <input
              type="text"
              value={elevation}
              onChange={(e) => setElevation(e.target.value)}
              className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
          <p className="flex items-center gap-1.5 font-bold mb-1">
            <Radio className="w-3.5 h-3.5" />
            Automated Handshake Protocol
          </p>
          <p className="text-[11px] text-cyan-200/80">
            Node will be provisioned with standard sensor suite (Thermistor array, capacitive hygrometer, piezoresistive barometer, ultrasonic 3D wind sensor).
          </p>
        </div>
      </form>
    </Modal>
  );
};

