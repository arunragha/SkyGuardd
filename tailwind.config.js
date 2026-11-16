/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sky: {
          bg: '#080D18',
          surface: '#101827',
          sidebar: '#0B1220',
          card: '#121D2E',
          cardHover: '#18263D',
          border: 'rgba(255, 255, 255, 0.08)',
          borderSubtle: 'rgba(255, 255, 255, 0.04)',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        brand: {
          blue: '#3B82F6',
          blueHover: '#2563EB',
          cyan: '#22D3EE',
          cyanHover: '#06B6D4',
          accent: '#22D3EE',
          glow: 'rgba(34, 211, 238, 0.15)',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-cyan': '0 0 20px -3px rgba(34, 211, 238, 0.3)',
        'glow-blue': '0 0 20px -3px rgba(59, 130, 246, 0.3)',
        'glow-critical': '0 0 20px -3px rgba(239, 68, 68, 0.3)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}

