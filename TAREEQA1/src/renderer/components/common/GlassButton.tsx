import React, { forwardRef, useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ripple?: boolean;
  glow?: boolean;
  className?: string;
}

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white border-primary-500 hover:border-primary-600 shadow-lg hover:shadow-primary-500/25',
  secondary: 'glass bg-white/20 hover:bg-white/30 text-primary-900 border-white/30 hover:border-white/40',
  success: 'bg-green-600 hover:bg-green-700 text-white border-green-500 hover:border-green-600 shadow-lg hover:shadow-green-500/25',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500 hover:border-yellow-600 shadow-lg hover:shadow-yellow-500/25',
  error: 'bg-red-600 hover:bg-red-700 text-white border-red-500 hover:border-red-600 shadow-lg hover:shadow-red-500/25',
  ghost: 'bg-transparent hover:bg-white/10 text-primary-700 border-transparent hover:border-white/20',
  outline: 'bg-transparent hover:bg-primary-50 text-primary-700 border-primary-300 hover:border-primary-400 hover:text-primary-800',
};

const sizes = {
  sm: 'px-3 py-2 text-sm rounded-lg min-h-[36px]',
  md: 'px-4 py-2.5 text-sm rounded-xl min-h-[40px]',
  lg: 'px-6 py-3 text-base rounded-xl min-h-[44px]',
  xl: 'px-8 py-4 text-lg rounded-2xl min-h-[52px]',
};

const glowVariants = {
  primary: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
  secondary: 'shadow-[0_0_20px_rgba(255,255,255,0.3)]',
  success: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
  warning: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
  error: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
  ghost: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
  outline: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
};

const LoadingSpinner: React.FC<{ size: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size }) => {
  const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <motion.div
      className={cn('border-2 border-current border-t-transparent rounded-full', spinnerSizes[size])}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

const RippleEffect: React.FC<{ x: number; y: number; onComplete: () => void }> = ({ 
  x, 
  y, 
  onComplete 
}) => {
  return (
    <motion.div
      className="absolute bg-white/30 rounded-full pointer-events-none"
      style={{
        left: x - 25,
        top: y - 25,
        width: 50,
        height: 50,
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    />
  );
};

/**
 * GlassButton - Professional glass morphism button component
 * 
 * Features:
 * - Multiple variants with consistent styling
 * - Loading states with spinner animation
 * - Ripple effect on click
 * - Glow effects for enhanced visual appeal
 * - Touch-friendly sizing (minimum 44px height)
 * - RTL support with proper icon positioning
 * - Accessibility features (ARIA attributes, keyboard navigation)
 * - Smooth animations and micro-interactions
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'lg',
    fullWidth = false,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    ripple = true,
    glow = false,
    className,
    onClick,
    ...props
  }, ref) => {
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const [rippleId, setRippleId] = useState(0);

    const isDisabled = disabled || loading;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;

      // Create ripple effect
      if (ripple) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const newRipple = { id: rippleId, x, y };
        setRipples(prev => [...prev, newRipple]);
        setRippleId(prev => prev + 1);
      }

      // Call original onClick handler
      if (onClick) {
        onClick(event);
      }
    };

    const removeRipple = (id: number) => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    };

    const baseClasses = cn(
      // Base button styles
      'relative inline-flex items-center justify-center font-medium transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-transparent',
      'transform-gpu overflow-hidden',
      
      // Variant styles
      variants[variant],
      
      // Size styles
      sizes[size],
      
      // State styles
      fullWidth && 'w-full',
      isDisabled && 'opacity-50 cursor-not-allowed',
      !isDisabled && 'hover:scale-105 active:scale-95',
      
      // Glow effect
      glow && !isDisabled && glowVariants[variant],
      
      // Custom classes
      className
    );

    const motionProps = {
      whileHover: !isDisabled ? { 
        scale: 1.05,
        transition: { duration: 0.2, ease: 'easeOut' }
      } : {},
      whileTap: !isDisabled ? { 
        scale: 0.95,
        transition: { duration: 0.1 }
      } : {},
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: 'easeOut' },
      ...props
    };

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={isDisabled}
        onClick={handleClick}
        {...motionProps}
        // Accessibility attributes
        aria-disabled={isDisabled}
        aria-busy={loading}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <RippleEffect
            key={ripple.id}
            x={ripple.x}
            y={ripple.y}
            onComplete={() => removeRipple(ripple.id)}
          />
        ))}

        {/* Button content */}
        <span className="relative flex items-center justify-center space-x-2 rtl:space-x-reverse">
          {/* Left icon or loading spinner */}
          {loading ? (
            <LoadingSpinner size={size} />
          ) : leftIcon ? (
            <span className="flex-shrink-0">
              {leftIcon}
            </span>
          ) : null}

          {/* Button text */}
          {!loading && (
            <span className="flex-1 truncate">
              {children}
            </span>
          )}

          {/* Right icon */}
          {!loading && rightIcon && (
            <span className="flex-shrink-0">
              {rightIcon}
            </span>
          )}
        </span>
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

// Icon button variant
export const IconButton: React.FC<Omit<GlassButtonProps, 'children' | 'leftIcon' | 'rightIcon'> & {
  icon: React.ReactNode;
  'aria-label': string;
}> = ({ icon, size = 'md', ...props }) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };

  return (
    <GlassButton
      size={size}
      className={cn(iconSizes[size], 'p-0')}
      {...props}
    >
      {icon}
    </GlassButton>
  );
};

// Floating Action Button
export const FAB: React.FC<Omit<GlassButtonProps, 'size' | 'variant'> & {
  icon: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}> = ({ icon, position = 'bottom-right', className, ...props }) => {
  const positions = {
    'bottom-right': 'fixed bottom-6 right-6 rtl:right-auto rtl:left-6',
    'bottom-left': 'fixed bottom-6 left-6 rtl:left-auto rtl:right-6',
    'top-right': 'fixed top-6 right-6 rtl:right-auto rtl:left-6',
    'top-left': 'fixed top-6 left-6 rtl:left-auto rtl:right-6',
  };

  return (
    <GlassButton
      variant="primary"
      size="xl"
      className={cn(
        'w-14 h-14 rounded-full p-0 shadow-2xl z-50',
        positions[position],
        className
      )}
      glow
      {...props}
    >
      {icon}
    </GlassButton>
  );
};

// Button group component
export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}> = ({ children, orientation = 'horizontal', className }) => {
  return (
    <div 
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        '[&>button]:rounded-none',
        '[&>button:first-child]:rounded-l-xl [&>button:first-child]:rtl:rounded-l-none [&>button:first-child]:rtl:rounded-r-xl',
        '[&>button:last-child]:rounded-r-xl [&>button:last-child]:rtl:rounded-r-none [&>button:last-child]:rtl:rounded-l-xl',
        orientation === 'vertical' && '[&>button:first-child]:rounded-t-xl [&>button:first-child]:rounded-l-none [&>button:first-child]:rtl:rounded-r-none',
        orientation === 'vertical' && '[&>button:last-child]:rounded-b-xl [&>button:last-child]:rounded-r-none [&>button:last-child]:rtl:rounded-l-none',
        '[&>button:not(:first-child)]:border-l-0 [&>button:not(:first-child)]:rtl:border-l [&>button:not(:first-child)]:rtl:border-r-0',
        orientation === 'vertical' && '[&>button:not(:first-child)]:border-l [&>button:not(:first-child)]:border-t-0 [&>button:not(:first-child)]:rtl:border-r',
        className
      )}
      role="group"
    >
      {children}
    </div>
  );
};

// Split button component
export const SplitButton: React.FC<{
  children: React.ReactNode;
  onMainClick: () => void;
  onDropdownClick: () => void;
  variant?: GlassButtonProps['variant'];
  size?: GlassButtonProps['size'];
  disabled?: boolean;
  loading?: boolean;
}> = ({ 
  children, 
  onMainClick, 
  onDropdownClick, 
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false 
}) => {
  return (
    <ButtonGroup>
      <GlassButton
        variant={variant}
        size={size}
        disabled={disabled}
        loading={loading}
        onClick={onMainClick}
      >
        {children}
      </GlassButton>
      <GlassButton
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={onDropdownClick}
        className="px-3"
        aria-label="More options"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </GlassButton>
    </ButtonGroup>
  );
};

export default GlassButton;
