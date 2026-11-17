import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  CloudLightning,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/overview';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      showToast(`Authenticated as ${email}`, 'success', 'Session Established');
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      showToast(result.error || 'Authentication failed', 'error');
    }
  };

  const handleAdminCredentialsFill = () => {
    setEmail('admin@skyguard.io');
    setPassword('SkyGuard@2026!');
    setErrorMessage(null);
    showToast('Administrator clearance credentials loaded.', 'info');
  };

  return (
    <div className="min-h-screen w-full flex bg-[#080D18] text-[#F8FAFC]">
      {/* Left: Atmospheric Weather & AI Visualization Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1220] border-r border-white/10 flex-col justify-between p-12 overflow-hidden">
        {/* Ambient radial glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3B82F6]/30 to-[#22D3EE]/30 border border-cyan-400/50 shadow-glow-cyan">
            <Shield className="w-6 h-6 text-[#22D3EE]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-widest text-[#F8FAFC] font-mono">
              SKY<span className="text-[#22D3EE]">GUARD</span>
            </span>
            <p className="text-[10px] text-[#64748B] font-mono uppercase tracking-wider">
              Weather Intelligence & Anomaly Platform
            </p>
          </div>
        </div>

        {/* Center Graphic */}
        <div className="relative z-10 my-auto py-12 flex flex-col items-center text-center">
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping-slow" />
            <div className="absolute inset-4 rounded-full border border-blue-500/30" />
            <div className="absolute inset-12 rounded-full border border-cyan-400/20" />
            <div className="absolute inset-20 rounded-full border border-white/10" />

            <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-radar" style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(34, 211, 238, 0.25) 360deg)'
            }} />

            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#121D2E] border border-cyan-400/60 shadow-2xl">
              <CloudLightning className="w-10 h-10 text-[#22D3EE]" />
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC] max-w-md">
            "See Beyond the Weather."
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-sm mt-2 leading-relaxed">
            Multi-sensor environmental surveillance powered by research-grade machine learning and physics attribution.
          </p>
        </div>

        {/* Bottom Metrics Pill */}
        <div className="relative z-10 flex items-center justify-between p-4 rounded-2xl bg-[#121D2E]/80 border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>12 Stations Online · WAL Persistence Active</span>
          </div>
          <span className="text-[#64748B]">v7.0 Enterprise</span>
        </div>
      </div>

      {/* Right: Authentication Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo View */}
          <div className="flex lg:hidden items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6]/30 to-[#22D3EE]/30 border border-cyan-400/50">
              <Shield className="w-5 h-5 text-[#22D3EE]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-widest text-[#F8FAFC] font-mono">
                SKY<span className="text-[#22D3EE]">GUARD</span>
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              Mission Console Sign In
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Enter your authorized credentials to access station telemetry and anomaly streams.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-red-400 text-xs font-mono animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-[#94A3B8] block mb-1">Station Analyst Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@skyguard.io"
                  className="w-full bg-[#121D2E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FAFC] focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#94A3B8]">Security Key / Password</label>
                <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:underline">
                  Forgot key?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#121D2E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FAFC] focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-[#94A3B8]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
                <span>Maintain session token</span>
              </label>
              
              <button
                type="button"
                onClick={handleAdminCredentialsFill}
                className="text-[11px] text-[#22D3EE] hover:underline"
              >
                Auto-fill Admin
              </button>
            </div>

            <Button
              type="submit"
              variant="cyan"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Authenticate & Launch Console
            </Button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-[#94A3B8] font-mono">
            <span>Need station deployment clearance? </span>
            <Link to="/register" className="text-cyan-400 font-bold hover:underline">
              Request Operator Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
