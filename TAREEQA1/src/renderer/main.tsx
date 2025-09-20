import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { RTLProvider } from './components/common/RTLProvider';
import { ThemeProvider } from './components/common/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { HardwareProvider } from './contexts/HardwareContext';
import i18n from './i18n/config';
import './styles/globals.css';

// Create React Query client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error caught by boundary:', error, errorInfo);
    
    // Send error to main process for logging
    if (window.electronAPI) {
      window.electronAPI.logError({
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 text-center shadow-2xl">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                حدث خطأ غير متوقع
              </h1>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                عذراً، حدث خطأ في التطبيق. يرجى إعادة تشغيل البرنامج أو الاتصال بالدعم الفني.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  إعادة تحميل التطبيق
                </button>
                
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 border border-white/20"
                >
                  المحاولة مرة أخرى
                </button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-white/60 cursor-pointer mb-2">تفاصيل الخطأ</summary>
                  <pre className="text-xs text-red-300 bg-black/20 p-3 rounded overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      console.log('Navigation timing:', entry);
    } else if (entry.entryType === 'paint') {
      console.log(`${entry.name}: ${entry.startTime}ms`);
    }
  }
});

// Start performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceObserver.observe({ entryTypes: ['navigation', 'paint'] });
}

// Toast configuration for RTL support
const toastOptions = {
  duration: 4000,
  position: 'top-center' as const,
  style: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: '#1e293b',
    fontSize: '14px',
    fontWeight: '500',
    padding: '12px 16px',
    boxShadow: '0 8px 32px rgba(30, 58, 138, 0.15)',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#ffffff',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#ffffff',
    },
  },
};

// Main application root
const AppRoot: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <BrowserRouter>
            <RTLProvider>
              <ThemeProvider>
                <AuthProvider>
                  <HardwareProvider>
                    <App />
                    <Toaster 
                      toastOptions={toastOptions}
                      containerStyle={{
                        top: 20,
                        left: 20,
                        right: 20,
                      }}
                    />
                  </HardwareProvider>
                </AuthProvider>
              </ThemeProvider>
            </RTLProvider>
          </BrowserRouter>
        </I18nextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// Initialize React application
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render application with concurrent features
root.render(<AppRoot />);

// Hot module replacement for development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    root.render(<AppRoot />);
  });
}

// Service worker registration for PWA features
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Performance metrics reporting
if (process.env.NODE_ENV === 'production') {
  // Report web vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}

// Memory usage monitoring
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('Memory usage:', {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
      });
    }
  }, 30000); // Log every 30 seconds
}
