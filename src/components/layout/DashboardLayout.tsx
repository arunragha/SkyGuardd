import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AnomalyDetailDrawer } from '../anomalies/AnomalyDetailDrawer';
import { ToastNotification } from '../ui/ToastNotification';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080D18] text-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        
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

