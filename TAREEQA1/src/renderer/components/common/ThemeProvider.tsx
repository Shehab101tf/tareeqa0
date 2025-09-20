import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

/**
 * ThemeProvider - Professional theme management for the POS system
 * 
 * Features:
 * - Light/Dark theme support
 * - Auto theme based on system preference
 * - Smooth theme transitions
 * - Persistent theme storage
 * - Glass morphism adaptation for both themes
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'auto' 
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('tareeqa-pos-theme') as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'auto') {
        setActualTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // Set initial theme
    if (theme === 'auto') {
      setActualTheme(mediaQuery.matches ? 'dark' : 'light');
    } else {
      setActualTheme(theme);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light-theme', 'dark-theme');

    // Add new theme classes
    root.classList.add(actualTheme);
    body.classList.add(`${actualTheme}-theme`);

    // Update CSS custom properties for theme-aware styling
    if (actualTheme === 'dark') {
      root.style.setProperty('--glass-white', 'rgba(15, 23, 42, 0.9)');
      root.style.setProperty('--glass-blue', 'rgba(59, 130, 246, 0.1)');
      root.style.setProperty('--glass-dark', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      
      // Update background gradient for dark theme
      body.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
    } else {
      root.style.setProperty('--glass-white', 'rgba(255, 255, 255, 0.9)');
      root.style.setProperty('--glass-blue', 'rgba(30, 58, 138, 0.1)');
      root.style.setProperty('--glass-dark', 'rgba(15, 23, 42, 0.1)');
      root.style.setProperty('--text-primary', '#1e293b');
      root.style.setProperty('--text-secondary', '#64748b');
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      
      // Update background gradient for light theme
      body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    // Add smooth transition for theme changes
    root.style.transition = 'color 0.3s ease, background-color 0.3s ease';
    body.style.transition = 'background 0.3s ease';

    // Remove transition after animation completes
    const removeTransition = () => {
      root.style.transition = '';
      body.style.transition = '';
    };
    
    setTimeout(removeTransition, 300);

  }, [actualTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('tareeqa-pos-theme', newTheme);
    
    // Update actual theme immediately if not auto
    if (newTheme !== 'auto') {
      setActualTheme(newTheme);
    } else {
      // Check system preference for auto theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setActualTheme(mediaQuery.matches ? 'dark' : 'light');
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme toggle button component
export const ThemeToggle: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className = '', size = 'md' }) => {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const sizes = {
    sm: 'w-8 h-8 p-1',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const getIcon = () => {
    if (theme === 'auto') {
      return (
        <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (actualTheme === 'dark') {
      return (
        <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    }
    
    return (
      <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  };

  const getLabel = () => {
    if (theme === 'auto') return 'تبديل إلى الوضع الفاتح';
    if (actualTheme === 'dark') return 'تبديل إلى الوضع التلقائي';
    return 'تبديل إلى الوضع الداكن';
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        glass rounded-xl transition-all duration-300 
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${sizes[size]} ${className}
      `}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  );
};

// Hook for theme-aware colors
export const useThemeColors = () => {
  const { actualTheme } = useTheme();
  
  return {
    // Glass morphism colors
    glass: {
      white: actualTheme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      blue: 'rgba(59, 130, 246, 0.1)',
      dark: actualTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
    },
    
    // Text colors
    text: {
      primary: actualTheme === 'dark' ? '#f1f5f9' : '#1e293b',
      secondary: actualTheme === 'dark' ? '#cbd5e1' : '#64748b',
      muted: actualTheme === 'dark' ? '#94a3b8' : '#94a3b8',
    },
    
    // Background colors
    background: {
      primary: actualTheme === 'dark' ? '#0f172a' : '#ffffff',
      secondary: actualTheme === 'dark' ? '#1e293b' : '#f8fafc',
      tertiary: actualTheme === 'dark' ? '#334155' : '#e2e8f0',
    },
    
    // Border colors
    border: {
      primary: actualTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      secondary: actualTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
  };
};

// Component for theme-aware glass containers
export const ThemeGlass: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'white' | 'blue' | 'dark';
}> = ({ children, className = '', variant = 'white' }) => {
  const { actualTheme } = useTheme();
  
  const getGlassClass = () => {
    if (variant === 'blue') return 'glass-blue';
    if (variant === 'dark') return actualTheme === 'dark' ? 'glass' : 'glass-dark';
    return 'glass';
  };
  
  return (
    <div className={`${getGlassClass()} ${className}`}>
      {children}
    </div>
  );
};

export default ThemeProvider;
