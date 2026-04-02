/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // GigShield design system tokens
        brand: {
          primary: '#6366f1',   // indigo-500
          'primary-hover': '#4f46e5',
          'primary-glow': 'rgba(99, 102, 241, 0.2)',
        },
        surface: {
          DEFAULT: '#0f172a',   // slate-900
          card: '#1e293b',      // slate-800
          'card-hover': '#293548',
          border: '#334155',    // slate-700
          'border-active': 'rgba(99, 102, 241, 0.4)',
        },
        text: {
          primary: '#f8fafc',   // slate-50
          secondary: '#94a3b8', // slate-400
          muted: '#64748b',     // slate-500
        },
        status: {
          success: '#10b981',   // emerald-500
          warning: '#f59e0b',   // amber-500
          danger: '#f43f5e',    // rose-500
          'success-bg': 'rgba(16, 185, 129, 0.1)',
          'warning-bg': 'rgba(245, 158, 11, 0.1)',
          'danger-bg': 'rgba(244, 63, 94, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        input: '6px',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-indigo-strong': '0 0 30px rgba(99, 102, 241, 0.25)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-rose': '0 0 20px rgba(244, 63, 94, 0.15)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'bar-fill': 'barFill 0.8s ease-out forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        barFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
      },
    },
  },
  plugins: [],
}
