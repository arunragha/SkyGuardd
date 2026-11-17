import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { OverviewPage } from './pages/Overview/OverviewPage';
import { MonitoringPage } from './pages/Monitoring/MonitoringPage';
import { AnomaliesPage } from './pages/Anomalies/AnomaliesPage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import { StationsPage } from './pages/Stations/StationsPage';
import { AlertsPage } from './pages/Alerts/AlertsPage';
import { ModelsPage } from './pages/Models/ModelsPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPassword/ForgotPasswordPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Core Application Authenticated Shell */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="monitoring" element={<MonitoringPage />} />
              <Route path="anomalies" element={<AnomaliesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="stations" element={<StationsPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="models" element={<ModelsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
