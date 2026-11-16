import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080D18] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-lg shadow-blue-500/20 focus:ring-blue-500 border border-blue-400/30',
    cyan: 'bg-[#22D3EE] hover:bg-[#06B6D4] text-[#080D18] font-semibold shadow-lg shadow-cyan-500/20 focus:ring-cyan-400 border border-cyan-300/40',
    secondary: 'bg-[#121D2E] hover:bg-[#18263D] text-[#F8FAFC] border border-white/10 hover:border-white/20 focus:ring-slate-500',
    outline: 'bg-transparent hover:bg-white/5 text-[#94A3B8] hover:text-[#F8FAFC] border border-white/10 hover:border-white/20 focus:ring-blue-500',
    danger: 'bg-[#EF4444] hover:bg-red-600 text-white shadow-lg shadow-red-500/20 focus:ring-red-500 border border-red-400/30',
    ghost: 'bg-transparent hover:bg-white/5 text-[#94A3B8] hover:text-[#F8FAFC] focus:ring-blue-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};

