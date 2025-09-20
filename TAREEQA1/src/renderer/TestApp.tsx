import React from 'react';

// Ensure JSX is properly recognized
/// <reference types="react" />
/// <reference types="react-dom" />

const TestApp = () => {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl'
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🎉 طريقة POS</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>نظام نقاط البيع المتقدم</p>
        <div style={{
          background: 'rgba(34, 197, 94, 0.2)',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          <h2>✅ React App Working!</h2>
          <p>التطبيق يعمل بنجاح</p>
          <p>Frontend is loading correctly</p>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            style={{
              background: 'rgba(59, 130, 246, 0.8)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              margin: '0 10px'
            }}
            onClick={() => alert('Button clicked! الزر يعمل!')}
          >
            اختبار الزر
          </button>
          
          <button 
            style={{
              background: 'rgba(34, 197, 94, 0.8)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              margin: '0 10px'
            }}
            onClick={() => console.log('Console test - اختبار وحدة التحكم')}
          >
            اختبار وحدة التحكم
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestApp;
