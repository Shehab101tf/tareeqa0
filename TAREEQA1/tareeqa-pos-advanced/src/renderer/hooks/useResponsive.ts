import { useState, useEffect } from 'react';

/**
 * Responsive Design Hook for Tareeqa POS
 * Optimized for Egyptian retail environments with various screen sizes
 */

export interface BreakpointConfig {
  xs: number;    // Mobile phones (portrait)
  sm: number;    // Mobile phones (landscape) / Small tablets
  md: number;    // Tablets / Small laptops
  lg: number;    // Laptops / Desktop monitors
  xl: number;    // Large desktop monitors
  '2xl': number; // Ultra-wide monitors
}

export interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: keyof BreakpointConfig;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  isTouch: boolean;
  pixelRatio: number;
  isHighDPI: boolean;
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 480,    // 480px and below
  sm: 640,    // 640px and below
  md: 768,    // 768px and below
  lg: 1024,   // 1024px and below
  xl: 1280,   // 1280px and below
  '2xl': 1536 // 1536px and above
};

/**
 * Custom hook for responsive design
 */
export function useResponsive(customBreakpoints?: Partial<BreakpointConfig>): ResponsiveState {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        breakpoint: 'lg',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLandscape: true,
        isPortrait: false,
        isTouch: false,
        pixelRatio: 1,
        isHighDPI: false
      };
    }

    return calculateResponsiveState(window.innerWidth, window.innerHeight, breakpoints);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const newState = calculateResponsiveState(
        window.innerWidth,
        window.innerHeight,
        breakpoints
      );
      setState(newState);
    };

    // Initial calculation
    handleResize();

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
}

/**
 * Calculate responsive state based on dimensions
 */
function calculateResponsiveState(
  width: number,
  height: number,
  breakpoints: BreakpointConfig
): ResponsiveState {
  // Determine breakpoint
  let breakpoint: keyof BreakpointConfig = 'xs';
  if (width >= breakpoints['2xl']) breakpoint = '2xl';
  else if (width >= breakpoints.xl) breakpoint = 'xl';
  else if (width >= breakpoints.lg) breakpoint = 'lg';
  else if (width >= breakpoints.md) breakpoint = 'md';
  else if (width >= breakpoints.sm) breakpoint = 'sm';

  // Device type detection
  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;

  // Orientation
  const isLandscape = width > height;
  const isPortrait = height > width;

  // Touch detection
  const isTouch = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // Pixel ratio
  const pixelRatio = typeof window !== 'undefined' ? 
    window.devicePixelRatio || 1 : 1;
  const isHighDPI = pixelRatio > 1.5;

  return {
    width,
    height,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    isTouch,
    pixelRatio,
    isHighDPI
  };
}

/**
 * Hook for media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * Hook for screen orientation
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<{
    angle: number;
    type: string;
  }>(() => {
    if (typeof window === 'undefined' || !window.screen?.orientation) {
      return { angle: 0, type: 'landscape-primary' };
    }
    
    return {
      angle: window.screen.orientation.angle,
      type: window.screen.orientation.type
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.screen?.orientation) return;

    const handleOrientationChange = () => {
      setOrientation({
        angle: window.screen.orientation.angle,
        type: window.screen.orientation.type
      });
    };

    window.screen.orientation.addEventListener('change', handleOrientationChange);
    
    return () => {
      window.screen.orientation.removeEventListener('change', handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * Hook for viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }
    
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return viewport;
}

/**
 * Responsive utilities
 */
export class ResponsiveUtils {
  /**
   * Get optimal grid columns based on screen size
   */
  static getGridColumns(breakpoint: keyof BreakpointConfig, maxColumns: number = 6): number {
    const columnMap: Record<keyof BreakpointConfig, number> = {
      xs: Math.min(1, maxColumns),
      sm: Math.min(2, maxColumns),
      md: Math.min(3, maxColumns),
      lg: Math.min(4, maxColumns),
      xl: Math.min(5, maxColumns),
      '2xl': Math.min(6, maxColumns)
    };
    
    return columnMap[breakpoint];
  }

  /**
   * Get optimal font size based on screen size
   */
  static getFontSize(breakpoint: keyof BreakpointConfig, baseSize: number = 16): number {
    const scaleMap: Record<keyof BreakpointConfig, number> = {
      xs: 0.875,  // 14px
      sm: 0.9375, // 15px
      md: 1,      // 16px
      lg: 1.0625, // 17px
      xl: 1.125,  // 18px
      '2xl': 1.25 // 20px
    };
    
    return Math.round(baseSize * scaleMap[breakpoint]);
  }

  /**
   * Get optimal spacing based on screen size
   */
  static getSpacing(breakpoint: keyof BreakpointConfig, baseSpacing: number = 16): number {
    const scaleMap: Record<keyof BreakpointConfig, number> = {
      xs: 0.75,   // 12px
      sm: 0.875,  // 14px
      md: 1,      // 16px
      lg: 1.125,  // 18px
      xl: 1.25,   // 20px
      '2xl': 1.5  // 24px
    };
    
    return Math.round(baseSpacing * scaleMap[breakpoint]);
  }

  /**
   * Check if device supports hover
   */
  static supportsHover(): boolean {
    if (typeof window === 'undefined') return true;
    
    return window.matchMedia('(hover: hover)').matches;
  }

  /**
   * Check if device has fine pointer (mouse)
   */
  static hasFinePointer(): boolean {
    if (typeof window === 'undefined') return true;
    
    return window.matchMedia('(pointer: fine)').matches;
  }

  /**
   * Get safe area insets for mobile devices
   */
  static getSafeAreaInsets(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    if (typeof window === 'undefined' || !CSS.supports('padding: env(safe-area-inset-top)')) {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const computedStyle = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
      right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0,
      bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
      left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0
    };
  }

  /**
   * Optimize animations based on device capabilities
   */
  static shouldReduceMotion(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Get optimal image size based on screen
   */
  static getOptimalImageSize(
    breakpoint: keyof BreakpointConfig,
    pixelRatio: number
  ): { width: number; quality: number } {
    const baseSizes: Record<keyof BreakpointConfig, number> = {
      xs: 320,
      sm: 480,
      md: 640,
      lg: 768,
      xl: 1024,
      '2xl': 1280
    };

    const width = Math.round(baseSizes[breakpoint] * Math.min(pixelRatio, 2));
    const quality = pixelRatio > 1.5 ? 85 : 90; // Lower quality for high DPI to save bandwidth

    return { width, quality };
  }
}

/**
 * Responsive CSS class generator
 */
export function generateResponsiveClasses(
  baseClasses: string,
  responsiveClasses: Partial<Record<keyof BreakpointConfig, string>>,
  currentBreakpoint: keyof BreakpointConfig
): string {
  const classes = [baseClasses];
  
  // Add classes for current breakpoint and smaller
  const breakpointOrder: (keyof BreakpointConfig)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  for (let i = 0; i <= currentIndex; i++) {
    const bp = breakpointOrder[i];
    if (responsiveClasses[bp]) {
      classes.push(responsiveClasses[bp]!);
    }
  }
  
  return classes.join(' ');
}
