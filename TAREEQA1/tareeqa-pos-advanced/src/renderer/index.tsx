import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

/**
 * Tareeqa POS Renderer Entry Point
 * Initializes React application with proper error handling
 */

// Global error boundary component
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
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // Show error screen
    if (window.TareeqaUtils?.showErrorScreen) {
      window.TareeqaUtils.showErrorScreen(
        `خطأ في React: ${error.message}`
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center text-white">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold mb-4">خطأ في التطبيق</h1>
            <p className="text-lg mb-6 opacity-90">
              {this.state.error?.message || 'حدث خطأ غير متوقع'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg border border-white/30 transition-all"
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the application
function initializeApp() {
  console.log('🎯 Initializing Tareeqa POS React App...');

  try {
    // Check if Tareeqa API is available
    if (!window.tareeqa) {
      throw new Error('Tareeqa API is not available');
    }

    // Get root element
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found');
    }

    // Create React root
    const root = createRoot(container);

    // Render the application
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>
    );

    console.log('✅ React app initialized successfully');

    // Hide loading screen after a short delay
    setTimeout(() => {
      if (window.TareeqaUtils?.hideLoadingScreen) {
        window.TareeqaUtils.hideLoadingScreen();
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Failed to initialize React app:', error);
    
    if (window.TareeqaUtils?.showErrorScreen) {
      window.TareeqaUtils.showErrorScreen(
        `فشل في تهيئة التطبيق: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      );
    }
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Development hot reload support
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', () => {
    console.log('🔄 Hot reloading App component...');
    initializeApp();
  });
}
