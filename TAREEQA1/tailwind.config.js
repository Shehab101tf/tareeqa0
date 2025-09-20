/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          900: '#7f1d1d',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.95)',
          blue: 'rgba(59, 130, 246, 0.15)',
          dark: 'rgba(15, 23, 42, 0.05)',
          light: 'rgba(255, 255, 255, 0.98)',
        },
        sunlight: {
          bg: '#f8fafc',
          card: 'rgba(255, 255, 255, 0.96)',
          border: 'rgba(255, 255, 255, 0.7)',
        },
        text: {
          primary: '#0f172a',      // Very dark slate for primary text
          secondary: '#1e293b',    // Dark slate for secondary text
          muted: '#475569',        // Medium slate for muted text
          light: '#64748b',        // Light slate for subtle text
          contrast: '#000000',     // Pure black for maximum contrast
        }
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '20px',
        xl: '24px',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glass-morph': 'glassMorph 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glassMorph: {
          '0%': { backdropFilter: 'blur(0px)', background: 'rgba(255, 255, 255, 0)' },
          '100%': { backdropFilter: 'blur(12px)', background: 'rgba(255, 255, 255, 0.9)' },
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'Noto Sans Arabic', 'Arial', 'sans-serif'],
        amiri: ['Amiri', 'Noto Sans Arabic', 'Arial', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Noto Sans Arabic', 'Arial', 'sans-serif'],
        english: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 16px 48px 0 rgba(30, 58, 138, 0.15)',
        'glass-xl': '0 24px 64px 0 rgba(30, 58, 138, 0.20)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'win7-fallback': '0 4px 8px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Windows 7 compatibility plugin
    function({ addUtilities, addComponents, theme }) {
      // Windows 7 glass effect fallbacks
      addUtilities({
        '.glass-win7-fallback': {
          'background': 'rgba(255, 255, 255, 0.8)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'box-shadow': '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
        '.backdrop-blur-fallback': {
          'background': 'rgba(255, 255, 255, 0.85)',
        },
        // Egyptian currency formatting
        '.currency-egp::after': {
          'content': '" ج.م"',
        },
        // RTL utilities
        '.rtl-flip': {
          'transform': 'scaleX(-1)',
        },
        // Touch-friendly sizing (44px minimum)
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        // High contrast mode support
        '@media (prefers-contrast: high)': {
          '.glass-card': {
            'background': '#ffffff',
            'border': '2px solid #000000',
          }
        }
      });
      
      // Professional input styles
      addComponents({
        '.input-glass': {
          'background': 'rgba(255, 255, 255, 0.9)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'border-radius': '12px',
          'padding': '12px 16px',
          'transition': 'all 0.2s ease',
          '&:focus': {
            'outline': 'none',
            'border-color': theme('colors.primary.500'),
            'box-shadow': `0 0 0 3px ${theme('colors.primary.500')}33`,
          },
          // Windows 7 fallback
          '@supports not (backdrop-filter: blur(12px))': {
            'background': 'rgba(255, 255, 255, 0.95)',
            'backdrop-filter': 'none',
          }
        }
      });
    }
  ],
}
