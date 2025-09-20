// GlassCard Component Test - Electron 21.x Compatible
import { render, screen, fireEvent } from '@testing-library/react';
import { GlassCard } from '@/renderer/components/ui/GlassCard';
import '@testing-library/jest-dom';

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
    
    expect(card).toHaveClass('shadow-glass-lg');
    // Test Windows 7 fallback (no backdrop-filter support)
    expect(card).toHaveClass('supports-[not_backdrop-filter]:shadow-lg');
  });

  test('handles hover effects with Electron 21.x performance', () => {
    render(<GlassCard hover>Hover Test</GlassCard>);
    const card = screen.getByText('Hover Test').parentElement;
    
    fireEvent.mouseEnter(card!);
    expect(card).toHaveClass('hover:scale-[1.02]');
    
    // Test animation performance
    const computedStyle = window.getComputedStyle(card!);
    expect(computedStyle.transition).toContain('transform');
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
    
    // Should have high contrast fallback classes
    expect(card).toHaveClass('supports-[not_backdrop-filter]:bg-white/95');
  });

  test('handles different sizes correctly', () => {
    const { rerender } = render(<GlassCard size="sm">Small</GlassCard>);
    expect(screen.getByText('Small').parentElement).toHaveClass('p-3');

    rerender(<GlassCard size="lg">Large</GlassCard>);
    expect(screen.getByText('Large').parentElement).toHaveClass('p-6');
  });

  test('applies loading state correctly', () => {
    render(<GlassCard loading>Loading Content</GlassCard>);
    const card = screen.getByText('Loading Content').parentElement;
    
    expect(card).toHaveClass('animate-pulse');
    expect(card?.querySelector('.absolute')).toBeInTheDocument(); // Loading overlay
  });
});
