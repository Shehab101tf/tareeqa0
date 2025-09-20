import React from 'react';

const SimpleTest = () => {
  return React.createElement('div', {
    style: {
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl'
    }
  }, 
    React.createElement('div', {
      style: {
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }
    },
      React.createElement('h1', { 
        style: { fontSize: '3rem', marginBottom: '20px' } 
      }, '🎉 طريقة POS'),
      
      React.createElement('p', { 
        style: { fontSize: '1.2rem', marginBottom: '20px' } 
      }, 'نظام نقاط البيع المتقدم'),
      
      React.createElement('div', {
        style: {
          background: 'rgba(34, 197, 94, 0.2)',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }
      },
        React.createElement('h2', null, '✅ React Working!'),
        React.createElement('p', null, 'التطبيق يعمل بنجاح'),
        React.createElement('p', null, 'Frontend is loading correctly')
      ),
      
      React.createElement('div', { style: { marginTop: '20px' } },
        React.createElement('button', {
          style: {
            background: 'rgba(59, 130, 246, 0.8)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            margin: '0 10px'
          },
          onClick: () => alert('Button clicked! الزر يعمل!')
        }, 'اختبار الزر'),
        
        React.createElement('button', {
          style: {
            background: 'rgba(34, 197, 94, 0.8)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            margin: '0 10px'
          },
          onClick: () => console.log('Console test - اختبار وحدة التحكم')
        }, 'اختبار وحدة التحكم')
      )
    )
  );
};

export default SimpleTest;
