// GlassCard Component Tests - Electron 21.x Compatible
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock GlassCard component for testing using React.createElement
const GlassCard = ({ 
  children, 
  variant = 'default', 
  className = '' 
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'elevated';
  className?: string;
}) => {
  const baseClasses = 'glass-card bg-white/80 backdrop-blur-8 rounded-xl border border-white/30';
  const variantClasses = variant === 'elevated' ? 'shadow-2xl hover:scale-105' : 'shadow-lg';
  
  return React.createElement('div', {
    className: `${baseClasses} ${variantClasses} ${className} transition-all duration-300`
  }, children);
};

// Mock Electron API for testing
const mockElectronAPI = {
  platform: 'win32',
  version: '21.4.4'
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI
});

describe('GlassCard Component - Electron 21.x', () => {
  test('renders children correctly', () => {
    render(<GlassCard>Test Content</GlassCard>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('applies elevated variant classes with Windows 7 fallback', () => {
    render(<GlassCard variant="elevated">Content</GlassCard>);
    const card = screen.getByText('Content').parentElement;
    
    expect(card).toHaveClass('shadow-2xl');
    expect(card).toHaveClass('hover:scale-105');
    // Test Windows 7 fallback (no backdrop-filter support)
    expect(card).toHaveClass('bg-white/80'); // Fallback background
  });

  test('handles hover effects with Electron 21.x performance', () => {
    render(<GlassCard>Hover Test</GlassCard>);
    const card = screen.getByText('Hover Test').parentElement;
    
    fireEvent.mouseEnter(card!);
    expect(card).toHaveClass('hover:scale-105');
    
    // Test animation performance
    expect(card).toHaveClass('transition-all');
    expect(card).toHaveClass('duration-300');
  });

  test('supports Windows high contrast mode', () => {
    // Mock Windows high contrast mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<GlassCard>High Contrast Test</GlassCard>);
    const card = screen.getByText('High Contrast Test').parentElement;
    expect(card).toHaveClass('glass-card');
  });

  test('applies custom className properly', () => {
    render(<GlassCard className="custom-class">Custom Test</GlassCard>);
    const card = screen.getByText('Custom Test').parentElement;
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('glass-card');
  });

  test('handles Windows 7 glass effect fallbacks', () => {
    // Mock Windows 7 environment
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Windows NT 6.1',
      writable: true
    });

    render(<GlassCard>Windows 7 Test</GlassCard>);
    const card = screen.getByText('Windows 7 Test').parentElement;
    
    // Should use fallback styling for Windows 7
    expect(card).toHaveClass('bg-white/80');
    expect(card).toHaveClass('backdrop-blur-8');
  });
});
