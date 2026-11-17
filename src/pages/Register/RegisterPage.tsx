import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/overview', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the telemetry security policy.');
      return;
    }

    setIsLoading(true);
    const result = await register(name, email, password, 'analyst');
    setIsLoading(false);

    if (result.success) {
      showToast(`Analyst account provisioned for ${name}.`, 'success', 'Registration Complete');
      navigate('/overview', { replace: true });
    } else {
      setErrorMessage(result.error || 'Registration failed. Please try a different email.');
      showToast(result.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#080D18] text-[#F8FAFC]">
      {/* Left branding hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1220] border-r border-white/10 flex-col justify-between p-12 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3B82F6]/30 to-[#22D3EE]/30 border border-cyan-400/50 shadow-glow-cyan">
            <Shield className="w-6 h-6 text-[#22D3EE]" />
          </div>
          <span className="font-extrabold text-xl tracking-widest text-[#F8FAFC] font-mono">
            SKY<span className="text-[#22D3EE]">GUARD</span>
          </span>
        </div>

        <div className="space-y-4 my-auto max-w-md">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
            Onboarding Protocol
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[#F8FAFC]">
            Join the Next-Generation Weather Intelligence Grid
          </h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Gain immediate access to automated multi-sensor anomaly detection, physical cross-correlation analytics, and research-grade edge telemetry.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121D2E] border border-white/10 text-xs font-mono text-[#64748B]">
          Encrypted with Bcrypt + JWT · SQLite WAL Telemetry Persistence
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              Create Analyst Account
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Register operator credentials for fleet station management and anomaly surveillance.
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
              <label className="text-[#94A3B8] block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Cooper"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121D2E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FAFC] focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[#94A3B8] block mb-1">Official Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="analyst@agency.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121D2E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FAFC] focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#94A3B8] block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#121D2E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FAFC] focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#121D2E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FAFC] focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-[#94A3B8]">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded mt-0.5 cursor-pointer"
                />
                <span className="text-[11px] leading-relaxed">
                  I agree to adhere to telemetry confidentiality protocols and environmental data governance policies.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="cyan"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Provision Account & Launch
            </Button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-[#94A3B8] font-mono">
            <span>Already have authorized clearance? </span>
            <Link to="/login" className="text-cyan-400 font-bold hover:underline">
              Sign In to Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
