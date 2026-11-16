import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Shield, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      showToast('Password recovery dispatch sent if account exists.', 'info');
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#080D18] text-[#F8FAFC] p-6">
      <div className="w-full max-w-md bg-[#121D2E] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6]/30 to-[#22D3EE]/30 border border-cyan-400/50 shadow-glow-cyan">
            <Shield className="w-5 h-5 text-[#22D3EE]" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-widest text-[#F8FAFC] font-mono">
              SKY<span className="text-[#22D3EE]">GUARD</span>
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Account Recovery
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Enter your registered observatory email address to receive cryptographic recovery credentials.
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-[#94A3B8] block mb-1">Analyst Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="analyst@skyguard.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B1220] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FAFC] focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="cyan"
              size="md"
              className="w-full"
              isLoading={isLoading}
            >
              Send Reset Instructions
            </Button>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-[#F8FAFC]">Instructions Dispatched</h4>
            <p className="text-xs text-[#94A3B8] font-mono">
              If an account with <b className="text-cyan-400">{email}</b> exists, an emergency key reset token has been routed.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 text-center text-xs font-mono">
          <Link to="/login" className="text-cyan-400 inline-flex items-center gap-1.5 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

