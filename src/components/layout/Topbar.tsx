import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Calendar, 
  Clock, 
  Radio, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  ChevronDown, 
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Topbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    stations, 
    selectedStationId, 
    setSelectedStationId, 
    selectedStation,
    alerts, 
    unreadAlertCount, 
    markAllAlertsAsRead,
    searchQuery,
    setSearchQuery,
    refreshData,
    backendConnected,
    telemetryMode,
    switchTelemetryMode
  } = useApp();
  const { user, logout } = useAuth();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0] + ' UTC');
      setCurrentDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Breadcrumbs helper
  const pathnames = location.pathname.split('/').filter(x => x);
  const getPageTitle = () => {
    const current = pathnames[0] || 'overview';
    switch (current) {
      case 'overview': return 'Weather Intelligence Overview';
      case 'monitoring': return 'Live Weather Monitoring';
      case 'anomalies': return 'Intelligent Anomaly Detection';
      case 'analytics': return 'Research-Grade Weather Analytics';
      case 'stations': return 'Fleet Weather Station Management';
      case 'alerts': return 'Mission Alerts & System Events';
      case 'models': return 'AI / ML Model Intelligence Center';
      case 'reports': return 'Intelligence Reports & Exports';
      case 'settings': return 'System Settings & Fleet Config';
      default: return 'SkyGuard Console';
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="h-16 bg-[#101827] border-b border-white/10 px-4 lg:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left: Breadcrumbs & Page title */}
      <div className="flex items-center gap-4 min-w-0">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Link to="/overview" className="hover:text-[#22D3EE] transition-colors">SkyGuard</Link>
            <span>/</span>
            <span className="text-[#94A3B8] capitalize font-medium">
              {pathnames[0] || 'Overview'}
            </span>
          </div>
          <h1 className="text-sm lg:text-base font-semibold text-[#F8FAFC] tracking-tight truncate hidden sm:block">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center: Global Search & Station Quick Selector */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-52 lg:w-72">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search telemetry, sensors, stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121D2E] text-xs text-[#F8FAFC] placeholder-[#64748B] pl-9 pr-8 py-2 rounded-xl border border-white/10 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono"
          />
          <kbd className="hidden lg:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#64748B] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Station Selector Dropdown */}
        <div className="relative hidden sm:block">
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-[#121D2E] text-xs font-mono text-[#22D3EE] border border-cyan-500/30 rounded-xl px-3 py-2 pr-7 appearance-none focus:outline-none focus:border-cyan-400 cursor-pointer shadow-sm shadow-cyan-950"
          >
            {stations.map(st => (
              <option key={st.id} value={st.id} className="bg-[#0B1220] text-[#F8FAFC]">
                {st.name} ({st.code})
              </option>
            ))}
          </select>
          <Radio className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Telemetry Mode Toggle (Live Simulation vs Jena Climate Replay) */}
        <button
          onClick={() => switchTelemetryMode(telemetryMode === 'live_simulation' ? 'historical_replay' : 'live_simulation')}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono border transition-all ${
            telemetryMode === 'historical_replay'
              ? 'bg-purple-950/40 text-purple-300 border-purple-500/30 hover:border-purple-400'
              : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30 hover:border-cyan-400'
          }`}
          title="Toggle between Live Edge Simulation and MPI-BGC Jena Climate Historical Replay"
        >
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            telemetryMode === 'historical_replay' ? 'bg-purple-400' : 'bg-cyan-400'
          }`} />
          {telemetryMode === 'historical_replay' ? 'JENA REPLAY' : 'LIVE SIM'}
        </button>

        {/* Backend Connectivity Status Pill */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono border ${
            backendConnected 
              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-950/30 text-amber-400 border-amber-500/20'
          }`}
          title={backendConnected ? 'Connected to SQLite WAL Gateway & Python ML Service' : 'Operating in Standalone Cache Mode'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
          <span>{backendConnected ? 'ONLINE' : 'CACHED'}</span>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={handleManualRefresh}
          className={`p-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5 border border-white/5 transition-all ${
            isRefreshing ? 'text-cyan-400' : ''
          }`}
          title="Synchronize sensor data"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Right: Date/Time, Notifications, User */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Date and Time Badge */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#121D2E]/80 border border-white/5 text-[11px] font-mono text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            {currentDate}
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            {currentTime}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5 border border-white/5 transition-colors"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white font-mono shadow-sm">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#121D2E] border border-white/15 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-[#F8FAFC]">Fleet Alerts</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {unreadAlertCount} Unread
                  </span>
                </div>
                <button
                  onClick={markAllAlertsAsRead}
                  className="text-xs text-[#22D3EE] hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-white/5 max-h-72 overflow-y-auto py-1">
                {alerts.slice(0, 4).map(alert => (
                  <div key={alert.id} className="py-2.5 flex items-start gap-2.5 hover:bg-white/5 px-2 rounded-lg transition-colors">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#F8FAFC] truncate">
                        {alert.title}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] truncate">
                        {alert.stationName} · {alert.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/alerts');
                  }}
                  className="text-xs text-[#22D3EE] hover:underline font-medium"
                >
                  View all alerts center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 border border-white/5 transition-all"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'}
              alt="User"
              className="w-7 h-7 rounded-full border border-cyan-400/40 object-cover"
            />
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121D2E] border border-white/15 shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-xs font-semibold text-[#F8FAFC]">{user?.name}</p>
                <p className="text-[10px] text-[#94A3B8] font-mono truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  Account Profile
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

