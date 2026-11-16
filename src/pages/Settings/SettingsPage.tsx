import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { 
  User, 
  Sliders, 
  Palette, 
  Bell, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Lock, 
  Key, 
  Mail, 
  Building, 
  Globe, 
  Clock, 
  SlidersHorizontal 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { 
    refreshInterval, 
    setRefreshInterval, 
    models, 
    activeModelId, 
    setActiveModelId, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'general' | 'appearance' | 'notifications' | 'monitoring' | 'ml' | 'security'>('profile');

  // Form states
  const [profileName, setProfileName] = useState(user?.name || 'Dr. Sarah Lin');
  const [profileEmail, setProfileEmail] = useState(user?.email || 's.lin@skyguard.ai');
  const [profileRole, setProfileRole] = useState(user?.role || 'Lead Weather Intelligence Scientist');
  const [profileOrg, setProfileOrg] = useState(user?.organization || 'National Meteorological & Environmental Agency');
  const [profileTimezone, setProfileTimezone] = useState(user?.timezone || 'UTC -8 (Pacific Time)');

  // General & Monitoring
  const [anomalyThreshold, setAnomalyThreshold] = useState(0.65);
  const [contaminationRate, setContaminationRate] = useState(0.035);
  const [autoPurgeDays, setAutoPurgeDays] = useState(90);

  // Appearance
  const [colorMode, setColorMode] = useState<'deep_void' | 'cyber_slate'>('deep_void');
  const [compactDensity, setCompactDensity] = useState(false);

  // Notifications
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyDegraded, setNotifyDegraded] = useState(true);
  const [notifySummaryEmail, setNotifySummaryEmail] = useState(true);

  // Security
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      email: profileEmail,
      role: profileRole,
      organization: profileOrg,
      timezone: profileTimezone,
    });
    showToast('User profile metadata successfully updated.', 'success', 'Profile Saved');
  };

  const handleSaveGeneral = () => {
    showToast('General telemetry preferences and archiving policies saved.', 'success', 'Settings Saved');
  };

  const handleSaveAppearance = () => {
    showToast('UI theme & display density updated.', 'success', 'Theme Updated');
  };

  const handleSaveNotifications = () => {
    showToast('Alert notification dispatch rules updated.', 'success', 'Notifications Saved');
  };

  const handleSaveML = () => {
    showToast(`ML configuration saved with ${activeModelId} at threshold ${anomalyThreshold}.`, 'success', 'ML Config Saved');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass !== confirmPass) {
      showToast('New passwords do not match or are empty.', 'error', 'Validation Error');
      return;
    }
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    showToast('Authentication credentials updated securely.', 'success', 'Password Changed');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'general', name: 'General', icon: Sliders },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'monitoring', name: 'Monitoring', icon: Activity },
    { id: 'ml', name: 'ML Configuration', icon: Cpu },
    { id: 'security', name: 'Security', icon: ShieldCheck },
  ] as const;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="p-6 rounded-2xl bg-[#101827] border border-white/10 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
            System Preferences
          </span>
          <span className="text-xs text-[#64748B] font-mono">Platform Configuration</span>
        </div>
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F8FAFC]">
          System Settings & Fleet Config
        </h1>
        <p className="text-xs lg:text-sm text-[#94A3B8]">
          Manage user identity, telemetry ingestion cadence, machine learning anomaly thresholds, and security credentials.
        </p>
      </div>

      {/* 2. Main Tabbed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Tabs (3 cols on lg) */}
        <div className="lg:col-span-3 bg-[#121D2E] p-3 rounded-2xl border border-white/10 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-[#64748B]'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content Panels (9 cols on lg) */}
        <div className="lg:col-span-9 bg-[#121D2E] p-6 rounded-2xl border border-white/10 shadow-xl">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs font-mono">
              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl border-2 border-cyan-400/40 object-cover shadow-lg"
                />
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC] font-sans">{profileName}</h3>
                  <p className="text-xs text-[#94A3B8]">{profileRole}</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{profileOrg}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#94A3B8] block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[#94A3B8] block mb-1">Work Email</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#94A3B8] block mb-1">Professional Role</label>
                  <input
                    type="text"
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[#94A3B8] block mb-1">Organization / Agency</label>
                  <input
                    type="text"
                    value={profileOrg}
                    onChange={(e) => setProfileOrg(e.target.value)}
                    className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1">Primary Observatory Timezone</label>
                <select
                  value={profileTimezone}
                  onChange={(e) => setProfileTimezone(e.target.value)}
                  className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
                >
                  <option value="UTC -8 (Pacific Time)">UTC -8 (Pacific Time)</option>
                  <option value="UTC -7 (Mountain Time)">UTC -7 (Mountain Time)</option>
                  <option value="UTC -6 (Central Time)">UTC -6 (Central Time)</option>
                  <option value="UTC -5 (Eastern Time)">UTC -5 (Eastern Time)</option>
                  <option value="UTC 0 (Greenwich Mean Time)">UTC 0 (Greenwich Mean Time)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end">
                <Button variant="cyan" size="sm" icon={<Save className="w-4 h-4" />}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: General */}
          {activeTab === 'general' && (
            <div className="space-y-5 text-xs font-mono">
              <h3 className="text-sm font-semibold text-[#F8FAFC] font-sans pb-2 border-b border-white/5">
                General Telemetry Buffer & Retention Policy
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[#94A3B8] block mb-1">Raw Telemetry Buffer Retention (Days)</label>
                  <input
                    type="number"
                    value={autoPurgeDays}
                    onChange={(e) => setAutoPurgeDays(Number(e.target.value))}
                    className="w-full sm:w-48 bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[11px] text-[#64748B] mt-1 font-sans">
                    Raw 1-second edge samples are rolled up into hourly statistical summaries after this window.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0B1220] border border-white/5 space-y-2">
                  <span className="text-cyan-400 font-bold block">Autonomous Telemetry Self-Healing</span>
                  <p className="text-[#94A3B8] font-sans text-xs leading-relaxed">
                    Automatically poll degraded nodes with higher RF power burst when frame drop exceeds 2.5%.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end">
                <Button variant="cyan" size="sm" onClick={handleSaveGeneral} icon={<Save className="w-4 h-4" />}>
                  Save General Policies
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-5 text-xs font-mono">
              <h3 className="text-sm font-semibold text-[#F8FAFC] font-sans pb-2 border-b border-white/5">
                Display Theme & Layout Density
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setColorMode('deep_void')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    colorMode === 'deep_void'
                      ? 'bg-[#152338] border-cyan-400 text-cyan-400'
                      : 'bg-[#0B1220] border-white/10 text-[#94A3B8]'
                  }`}
                >
                  <span className="font-bold block mb-1">Deep Void (Default)</span>
                  <p className="text-[11px] text-[#64748B] font-sans">Pure #080D18 mission-control dark contrast</p>
                </div>

                <div
                  onClick={() => setColorMode('cyber_slate')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    colorMode === 'cyber_slate'
                      ? 'bg-[#152338] border-cyan-400 text-cyan-400'
                      : 'bg-[#0B1220] border-white/10 text-[#94A3B8]'
                  }`}
                >
                  <span className="font-bold block mb-1">Cyber Slate</span>
                  <p className="text-[11px] text-[#64748B] font-sans">Slightly elevated gray-slate glass tones</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1220] border border-white/5">
                <div>
                  <span className="text-[#F8FAFC] font-bold block">Compact Data Density</span>
                  <span className="text-[11px] text-[#64748B] font-sans">Reduce table row heights and card paddings for high information density</span>
                </div>
                <input
                  type="checkbox"
                  checked={compactDensity}
                  onChange={(e) => setCompactDensity(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end">
                <Button variant="cyan" size="sm" onClick={handleSaveAppearance} icon={<Save className="w-4 h-4" />}>
                  Apply Theme Preferences
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-5 text-xs font-mono">
              <h3 className="text-sm font-semibold text-[#F8FAFC] font-sans pb-2 border-b border-white/5">
                Mission Alert Dispatch Rules
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1220] border border-white/5">
                  <div>
                    <span className="text-[#F8FAFC] font-bold block">Critical Sensor Divergence Alerts</span>
                    <span className="text-[11px] text-[#64748B] font-sans">Dispatch immediate notification when anomaly score &gt; 0.85</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyCritical}
                    onChange={(e) => setNotifyCritical(e.target.checked)}
                    className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1220] border border-white/5">
                  <div>
                    <span className="text-[#F8FAFC] font-bold block">Telemetry Node Degraded Warnings</span>
                    <span className="text-[11px] text-[#64748B] font-sans">Notify if a station fails 3 consecutive heartbeats or battery &lt; 20%</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyDegraded}
                    onChange={(e) => setNotifyDegraded(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1220] border border-white/5">
                  <div>
                    <span className="text-[#F8FAFC] font-bold block">Daily Fleetwide Digest Email</span>
                    <span className="text-[11px] text-[#64748B] font-sans">Receive automated morning PDF digest at 06:00 UTC</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifySummaryEmail}
                    onChange={(e) => setNotifySummaryEmail(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end">
                <Button variant="cyan" size="sm" onClick={handleSaveNotifications} icon={<Save className="w-4 h-4" />}>
                  Save Alert Rules
                </Button>
              </div>
            </div>
          )}

          {/* TAB 5: Monitoring */}
          {activeTab === 'monitoring' && (
            <div className="space-y-5 text-xs font-mono">
              <h3 className="text-sm font-semibold text-[#F8FAFC] font-sans pb-2 border-b border-white/5">
                Real-Time Telemetry Polling Intervals
              </h3>

              <div>
                <label className="text-[#94A3B8] block mb-2">Live Stream Auto-Refresh Interval</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[5, 10, 30, 60].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setRefreshInterval(sec)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        refreshInterval === sec
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 font-bold'
                          : 'bg-[#0B1220] text-[#94A3B8] border-white/10 hover:text-[#F8FAFC]'
                      }`}
                    >
                      <span className="text-lg block font-mono">{sec}s</span>
                      <span className="text-[10px] text-[#64748B]">
                        {sec === 5 ? 'High Freq' : sec === 10 ? 'Standard' : 'Power Saver'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end">
                <Button variant="cyan" size="sm" onClick={() => showToast('Refresh interval updated.', 'success')} icon={<Save className="w-4 h-4" />}>
                  Update Monitoring Cadence
                </Button>
              </div>
            </div>
          )}

          {/* TAB 6: ML Configuration */}
          {activeTab === 'ml' && (
            <div className="space-y-5 text-xs font-mono">
              <h3 className="text-sm font-semibold text-[#F8FAFC] font-sans pb-2 border-b border-white/5">
                Machine Learning Detection Thresholds
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[#94A3B8] block mb-1">Production Model Engine</label>
                  <select
                    value={activeModelId}
                    onChange={(e) => setActiveModelId(e.target.value)}
                    className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-cyan-400 font-bold focus:outline-none focus:border-cyan-400"
                  >
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.version})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#94A3B8]">Anomaly Flag Score Sensitivity Threshold</span>
                    <span className="text-cyan-400 font-bold">{anomalyThreshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.40"
                    max="0.95"
                    step="0.01"
                    value={anomalyThreshold}
                    onChange={(e) => setAnomalyThreshold(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
                    <span>0.40 (High sensitivity - more flags)</span>
                    <span>0.95 (Conservative - critical only)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#94A3B8]">Assumed Dataset Contamination Factor (ν)</span>
                    <span className="text-cyan-400 font-bold">{(contaminationRate * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.10"
                    step="0.005"
                    value={contaminationRate}
                    onChange={(e) => setContaminationRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end">
                <Button variant="cyan" size="sm" onClick={handleSaveML} icon={<Save className="w-4 h-4" />}>
                  Save ML Thresholds
                </Button>
              </div>
            </div>
          )}

          {/* TAB 7: Security */}
          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="space-y-5 text-xs font-mono">
              <h3 className="text-sm font-semibold text-[#F8FAFC] font-sans pb-2 border-b border-white/5">
                Authentication & Cryptographic Credentials
              </h3>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-[#94A3B8] block mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[#94A3B8] block mb-1">New Master Password</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[#94A3B8] block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                <span className="font-bold flex items-center gap-1.5 mb-0.5">
                  <Key className="w-3.5 h-3.5" />
                  Fleet Session Encryption
                </span>
                <p className="text-[11px] text-cyan-200/80 font-sans">
                  Passwords require minimum 12 characters, including alphanumeric and cryptographic symbols. MFA is enabled via TOTP hardware token.
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end">
                <Button variant="cyan" size="sm" icon={<Lock className="w-4 h-4" />}>
                  Update Security Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
