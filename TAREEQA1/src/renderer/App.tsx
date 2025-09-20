import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import layout components
import POSLayout from './components/layout/POSLayout';
import POSInterface from './components/business/POSInterface';
import HardwareManager from './components/business/HardwareManager';
import AnalyticsDashboard from './components/business/AnalyticsDashboard';
import SecurityManager from './components/business/SecurityManager';
import SystemConfiguration from './components/business/SystemConfiguration';

// Import screens
import ProductsScreen from './screens/ProductsScreen';

const App = () => {
  
  return (
    <POSLayout>
      <Routes>
        {/* Default route - Main POS Interface */}
        <Route path="/" element={<POSInterface />} />
        
        {/* POS Interface */}
        <Route path="/pos" element={<POSInterface />} />
        
        {/* Product Management */}
        <Route path="/products" element={<ProductsScreen />} />
        
        {/* Hardware Management */}
        <Route path="/hardware" element={<HardwareManager />} />
        
        {/* Analytics Dashboard */}
        <Route path="/reports" element={<AnalyticsDashboard />} />
        
        {/* Security & License Management */}
        <Route path="/security" element={<SecurityManager />} />
        
        {/* System Configuration */}
        <Route path="/settings" element={<SystemConfiguration />} />
        
        {/* Catch all - redirect to POS */}
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>

      {/* Toast notifications */}
      <Toaster
        position="top-left"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(30, 58, 138, 0.15)',
            fontFamily: 'Cairo, Inter, sans-serif',
            direction: 'rtl',
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
        }}
      />
    </POSLayout>
  );
};

export default App;
