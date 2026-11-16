import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Shield, Lock, Mail, User, Building, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (!agreeTerms) {
      showToast('Please accept the telemetry security policy.', 'warning');
      return;
    }

    setIsLoading(true);
    await register(name, email, password);
    setIsLoading(false);
    showToast(`Operator account provisioned for ${name}.`, 'success', 'Registration Complete');
    navigate('/overview');
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
            Gain immediate access to automated anomaly detection, physical cross-correlation matrix analytics, and edge weather telemetry.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121D2E] border border-white/10 text-xs font-mono text-[#64748B]">
          Encrypted with TLS 1.3 · SOC2 Compliant Telemetry Gateway
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
              Register operator credentials for fleet station management.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-[#94A3B8] block mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Cooper"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121D2E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
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
                  placeholder="jane.cooper@agency.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121D2E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
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
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#121D2E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
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
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#121D2E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer text-[#94A3B8] text-[11px]">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer mt-0.5 shrink-0"
              />
              <span>
                I agree to the National Meteorological Telemetry Protocols and SkyGuard Data Integrity Terms.
              </span>
            </label>

            <Button
              type="submit"
              variant="cyan"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Provision Account & Continue
            </Button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-[#94A3B8] font-mono">
            <span>Already have an account? </span>
            <Link to="/login" className="text-cyan-400 font-bold hover:underline">
              Sign In to Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

