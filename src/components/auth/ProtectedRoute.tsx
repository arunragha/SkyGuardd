import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#080D18] text-[#F8FAFC]">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 shadow-glow-cyan mb-4 animate-pulse">
          <Shield className="w-8 h-8 text-[#22D3EE]" />
        </div>
        <p className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase">
          Verifying SkyGuard Cryptographic Clearance...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
};
