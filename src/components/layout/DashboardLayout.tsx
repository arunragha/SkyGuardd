import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AnomalyDetailDrawer } from '../anomalies/AnomalyDetailDrawer';
import { ToastNotification } from '../ui/ToastNotification';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, X } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { demoMode, toggleDemoMode } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080D18] text-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />

        {/* Prominent Demo Mode Indicator Banner */}
        {demoMode && (
          <div className="bg-amber-950/90 border-b border-amber-500/40 px-4 py-2 flex items-center justify-between text-xs font-mono text-amber-200 z-10 shrink-0 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-amber-400 font-bold uppercase tracking-wider">DEMONSTRATION MODE ACTIVE:</strong> Showing isolated synthetic offline telemetry. Data is isolated from live production stations.
              </span>
            </div>
            <button
              onClick={toggleDemoMode}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white transition-colors"
            >
              <span>Exit Demo Mode</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        
        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Global Anomaly Diagnostic Drawer */}
      <AnomalyDetailDrawer />

      {/* Floating System Toasts */}
      <ToastNotification />
    </div>
  );
};
