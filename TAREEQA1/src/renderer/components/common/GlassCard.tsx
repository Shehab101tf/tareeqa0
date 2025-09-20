import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'flat' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

const variants = {
  default: 'glass',
  elevated: 'glass shadow-2xl shadow-primary-900/20 transform-gpu',
  flat: 'glass shadow-soft',
  success: 'glass-success',
  warning: 'glass-warning',
  error: 'glass-error',
};

const sizes = {
  sm: 'p-3 rounded-lg',
  md: 'p-4 rounded-xl',
  lg: 'p-6 rounded-2xl',
  xl: 'p-8 rounded-3xl',
};

const glowVariants = {
  default: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  success: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  warning: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  error: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
};

const hoverAnimations = {
  scale: {
    whileHover: { 
      scale: 1.02, 
      y: -2,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  },
  lift: {
    whileHover: { 
      y: -4,
      boxShadow: '0 16px 48px 0 rgba(31, 38, 135, 0.5)',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  },
  glow: {
    whileHover: { 
      boxShadow: [
        '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        '0 16px 48px 0 rgba(59, 130, 246, 0.4)',
        '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      ],
      transition: { 
        duration: 1.5, 
        repeat: Infinity, 
        repeatType: 'reverse' as const,
        ease: 'easeInOut'
      }
    }
  }
};

/**
 * GlassCard - A professional glass morphism card component
 * 
 * Features:
 * - Multiple variants (default, elevated, flat, status colors)
 * - Responsive sizing options
 * - Hover animations and effects
 * - Accessibility support
 * - RTL layout support
 * - Touch-friendly interactions
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    children, 
    variant = 'default', 
    size = 'lg', 
    hover = true, 
    glow = false,
    className,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      // Base glass morphism styles
      variants[variant],
      sizes[size],
      
      // Transition and transform setup
      'transition-all duration-300 transform-gpu',
      
      // Accessibility
      'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 focus-within:ring-offset-transparent',
      
      // Glow effect
      glow && glowVariants[variant === 'success' || variant === 'warning' || variant === 'error' ? variant : 'default'],
      
      // Custom classes
      className
    );

    const motionProps = hover ? {
      ...hoverAnimations.scale,
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3, ease: 'easeOut' },
      ...props
    } : {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3, ease: 'easeOut' },
      ...props
    };

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        {...motionProps}
        // Accessibility attributes
        role="region"
        tabIndex={0}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Specialized card variants for common use cases
export const StatusCard: React.FC<Omit<GlassCardProps, 'variant'> & { 
  status: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}> = ({ status, title, description, icon, children, ...props }) => {
  const statusVariant = status === 'info' ? 'default' : status;
  
  return (
    <GlassCard variant={statusVariant} {...props}>
      <div className="flex items-start space-x-3 rtl:space-x-reverse">
        {icon && (
          <div className="flex-shrink-0 mt-1">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 mb-3">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </GlassCard>
  );
};

// Interactive card with click handling
export const InteractiveCard: React.FC<GlassCardProps & {
  onClick?: () => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false, children, className, ...props }) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled && onClick) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <GlassCard
      className={cn(
        'cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:shadow-lg active:scale-95',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </GlassCard>
  );
};

// Loading card with skeleton animation
export const LoadingCard: React.FC<Omit<GlassCardProps, 'children'> & {
  lines?: number;
  showAvatar?: boolean;
}> = ({ lines = 3, showAvatar = false, ...props }) => {
  return (
    <GlassCard hover={false} {...props}>
      <div className="animate-pulse">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          {showAvatar && (
            <div className="skeleton-avatar"></div>
          )}
          <div className="flex-1">
            <div className="skeleton-title w-3/4"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div 
              key={index}
              className={cn(
                'skeleton-text',
                index === lines - 1 ? 'w-2/3' : 'w-full'
              )}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

// Metric card for displaying KPIs
export const MetricCard: React.FC<Omit<GlassCardProps, 'children'> & {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  suffix?: string;
  prefix?: string;
}> = ({ title, value, change, icon, suffix, prefix, ...props }) => {
  return (
    <GlassCard {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-1 rtl:space-x-reverse">
            {prefix && (
              <span className="text-lg text-gray-500">
                {prefix}
              </span>
            )}
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {suffix && (
              <span className="text-lg text-gray-500">
                {suffix}
              </span>
            )}
          </div>
          
          {change && (
            <div className={cn(
              'flex items-center mt-2 text-sm',
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            )}>
              <svg 
                className={cn(
                  'w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1',
                  change.type === 'increase' ? 'rotate-0' : 'rotate-180'
                )}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {Math.abs(change.value)}%
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 ml-4 rtl:ml-0 rtl:mr-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
              {icon}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default GlassCard;
