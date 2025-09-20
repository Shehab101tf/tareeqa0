import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Import components
import Layout from './components/layout/Layout';
import LoginScreen from './components/auth/LoginScreen';
import POSInterface from './components/pos/POSInterface';
import ProductManagement from './components/products/ProductManagement';
import HardwareManager from './components/hardware/HardwareManager';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import SecurityManager from './components/security/SecurityManager';
import SystemConfiguration from './components/settings/SystemConfiguration';

// Import stores
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';

/**
 * Main Application Component
 * Handles routing, authentication, and global state
 */
const App: React.FC = () => {
  const { isAuthenticated, user, initialize: initAuth } = useAuthStore();
  const { isInitialized, initialize: initApp, setLanguage, setTheme } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize application
  useEffect(() => {
    const initializeApplication = async () => {
      try {
        console.log('🚀 Initializing Tareeqa POS Application...');

        // Initialize app store
        await initApp();

        // Initialize authentication
        await initAuth();

        // Set default language and theme
        setLanguage('ar');
        setTheme('light');

        console.log('✅ Application initialized successfully');
      } catch (error) {
        console.error('❌ Application initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApplication();
  }, [initApp, initAuth, setLanguage, setTheme]);

  // Show loading screen while initializing
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-600 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">جاري التحميل...</h2>
          <p className="opacity-80">تهيئة نظام طريقة</p>
        </motion.div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoginScreen />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Main application with routing
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 rtl" dir="rtl">
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Default route - redirect to POS */}
            <Route path="/" element={<Navigate to="/pos" replace />} />
            
            {/* POS Interface */}
            <Route
              path="/pos"
              element={
                <motion.div
                  key="pos"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <POSInterface />
                </motion.div>
              }
            />
            
            {/* Product Management */}
            <Route
              path="/products"
              element={
                <motion.div
                  key="products"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductManagement />
                </motion.div>
              }
            />
            
            {/* Hardware Management */}
            <Route
              path="/hardware"
              element={
                <motion.div
                  key="hardware"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <HardwareManager />
                </motion.div>
              }
            />
            
            {/* Analytics Dashboard */}
            <Route
              path="/analytics"
              element={
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnalyticsDashboard />
                </motion.div>
              }
            />
            
            {/* Security Management */}
            <Route
              path="/security"
              element={
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SecurityManager />
                </motion.div>
              }
            />
            
            {/* System Configuration */}
            <Route
              path="/settings"
              element={
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SystemConfiguration />
                </motion.div>
              }
            />
            
            {/* Catch all - redirect to POS */}
            <Route path="*" element={<Navigate to="/pos" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-left"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            color: '#1e3a8a',
            fontFamily: 'Cairo, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'right',
            direction: 'rtl'
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff'
            }
          }
        }}
      />
    </div>
  );
};

export default App;
