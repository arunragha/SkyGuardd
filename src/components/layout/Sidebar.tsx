import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  BarChart3, 
  Radio, 
  Bell, 
  Cpu, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { unreadAlertCount, anomalies } = useApp();
  const { user } = useAuth();

  const activeAnomaliesCount = anomalies.filter(a => a.status === 'detected' || a.status === 'investigating').length;

  const navItems = [
    { name: 'Overview', path: '/overview', icon: LayoutDashboard },
    { name: 'Live Monitoring', path: '/monitoring', icon: Activity, live: true },
    { name: 'Anomaly Detection', path: '/anomalies', icon: ShieldAlert, badge: activeAnomaliesCount, badgeColor: 'bg-red-500' },
    { name: 'Weather Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Weather Stations', path: '/stations', icon: Radio },
    { name: 'Alerts & Notifications', path: '/alerts', icon: Bell, badge: unreadAlertCount, badgeColor: 'bg-amber-500' },
    { name: 'Model Intelligence', path: '/models', icon: Cpu },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#0B1220] border-r border-white/10 transition-all duration-300 z-30 shrink-0 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/10 bg-[#080D18]/50 justify-between">
        <NavLink to="/overview" className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#22D3EE]/20 border border-cyan-400/40 shadow-glow-cyan shrink-0">
            <Shield className="w-5 h-5 text-[#22D3EE]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-widest text-[#F8FAFC] font-mono">
                  SKY<span className="text-[#22D3EE]">GUARD</span>
                </span>
                <span className="text-[9px] font-semibold tracking-wider uppercase px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-[#64748B] tracking-wider font-medium truncate">
                See Beyond the Weather
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2">
          {!collapsed ? (
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Core Intelligence
            </span>
          ) : (
            <div className="w-full border-t border-white/10 my-2" />
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-[#3B82F6]/15 text-[#22D3EE] shadow-sm border border-cyan-500/20'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator Bar on Left */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-[#22D3EE] shadow-glow-cyan" />
                  )}

                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-[#22D3EE]' : 'text-[#94A3B8] group-hover:text-[#F8FAFC]'
                    }`} />
                    {item.live && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>

                  {!collapsed && (
                    <span className="flex-1 truncate tracking-tight">{item.name}</span>
                  )}

                  {!collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full text-white ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}

                  {collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${item.badgeColor}`} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer: System Status & User Profile */}
      <div className="p-3 border-t border-white/10 bg-[#080D18]/40 space-y-3">
        {/* System Status Pill */}
        {!collapsed ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121D2E]/60 border border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[#94A3B8] font-mono text-[11px]">Telemetry Engine</span>
            </div>
            <span className="text-emerald-400 font-mono font-semibold text-[11px]">99.8% Online</span>
          </div>
        ) : (
          <div className="flex justify-center" title="Telemetry Engine Online 99.8%">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        )}

        {/* User Card */}
        <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors ${collapsed ? 'justify-center p-1' : ''}`}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt="User avatar"
            className="w-8 h-8 rounded-full border border-cyan-400/30 object-cover shrink-0"
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#F8FAFC] truncate">
                {user?.name || 'Dr. Sarah Lin'}
              </span>
              <span className="text-[10px] text-[#64748B] truncate font-mono">
                {user?.role || 'Lead Analyst'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

