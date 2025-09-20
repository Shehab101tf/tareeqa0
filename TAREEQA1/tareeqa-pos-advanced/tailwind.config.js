/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
    "./src/renderer/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Blues - Egyptian Professional Palette
        primary: {
          50: '#eff6ff',   // Very light blue
          100: '#dbeafe',  // Light blue background
          200: '#bfdbfe',  // Soft blue
          300: '#93c5fd',  // Medium light blue
          400: '#60a5fa',  // Medium blue
          500: '#3b82f6',  // Secondary blue (main)
          600: '#2563eb',  // Bright blue
          700: '#1d4ed8',  // Strong blue
          800: '#1e40af',  // Dark blue
          900: '#1e3a8a',  // Deep navy blue (primary)
          950: '#172554'   // Very dark blue
        },
        // Glass morphism colors
        glass: {
          white: 'rgba(255, 255, 255, 0.9)',
          blue: 'rgba(30, 58, 138, 0.1)',
          border: 'rgba(255, 255, 255, 0.3)',
          shadow: 'rgba(30, 58, 138, 0.15)'
        },
        // Egyptian market colors
        egyptian: {
          gold: '#d4af37',
          sand: '#f4e4bc',
          desert: '#c19a6b',
          nile: '#006994'
        }
      },
      fontFamily: {
        // Arabic fonts
        arabic: ['Cairo', 'Amiri', 'Segoe UI Arabic', 'Tahoma', 'sans-serif'],
        // English fonts
        english: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Monospace for codes
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace']
      },
      fontSize: {
        // Arabic-optimized sizes
        'xs-ar': ['0.75rem', { lineHeight: '1.5' }],
        'sm-ar': ['0.875rem', { lineHeight: '1.6' }],
        'base-ar': ['1rem', { lineHeight: '1.7' }],
        'lg-ar': ['1.125rem', { lineHeight: '1.8' }],
        'xl-ar': ['1.25rem', { lineHeight: '1.8' }],
        '2xl-ar': ['1.5rem', { lineHeight: '1.8' }],
        '3xl-ar': ['1.875rem', { lineHeight: '1.8' }],
        '4xl-ar': ['2.25rem', { lineHeight: '1.7' }]
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px'
      },
      animation: {
        'glass-shimmer': 'glass-shimmer 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out'
      },
      keyframes: {
        'glass-shimmer': {
          '0%, 100%': { 
            backgroundPosition: '-200% 0' 
          },
          '50%': { 
            backgroundPosition: '200% 0' 
          }
        },
        'float': {
          '0%, 100%': { 
            transform: 'translateY(0px)' 
          },
          '50%': { 
            transform: 'translateY(-10px)' 
          }
        },
        'glow': {
          '0%': { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' 
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)' 
          }
        },
        'slide-up': {
          '0%': { 
            transform: 'translateY(100%)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateY(0)', 
            opacity: '1' 
          }
        },
        'slide-down': {
          '0%': { 
            transform: 'translateY(-100%)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateY(0)', 
            opacity: '1' 
          }
        },
        'fade-in': {
          '0%': { 
            opacity: '0' 
          },
          '100%': { 
            opacity: '1' 
          }
        },
        'scale-in': {
          '0%': { 
            transform: 'scale(0.95)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'scale(1)', 
            opacity: '1' 
          }
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 15px 35px 0 rgba(31, 38, 135, 0.2)',
        'glass-xl': '0 25px 50px -12px rgba(31, 38, 135, 0.25)',
        'island': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'island-lg': '0 20px 40px -4px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-primary': '0 0 20px rgba(30, 58, 138, 0.4)'
      },
      borderRadius: {
        'glass': '16px',
        'island': '20px',
        '4xl': '2rem'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class'
    }),
    require('@tailwindcss/typography'),
    // Custom plugin for RTL support
    function({ addUtilities, addComponents, theme }) {
      // RTL utilities
      addUtilities({
        '.rtl': {
          direction: 'rtl'
        },
        '.ltr': {
          direction: 'ltr'
        },
        '.text-start': {
          'text-align': 'start'
        },
        '.text-end': {
          'text-align': 'end'
        }
      });

      // Glass morphism components
      addComponents({
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: theme('borderRadius.glass'),
          boxShadow: theme('boxShadow.glass')
        },
        '.glass-button': {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: theme('borderRadius.lg'),
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.glass-lg')
          }
        },
        '.island-card': {
          background: theme('colors.white'),
          borderRadius: theme('borderRadius.island'),
          boxShadow: theme('boxShadow.island'),
          border: '1px solid rgba(0, 0, 0, 0.05)'
        },
        '.floating-panel': {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: theme('borderRadius.glass'),
          boxShadow: theme('boxShadow.island-lg'),
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }
      });
    }
  ],
  // RTL support
  corePlugins: {
    // Disable some plugins that conflict with RTL
  }
};
