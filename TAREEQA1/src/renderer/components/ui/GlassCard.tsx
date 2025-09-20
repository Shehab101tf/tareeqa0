import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'flat' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  loading?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  hover = true,
  loading = false,
  className,
  ...props
}) => {
  const baseClasses = `
    backdrop-blur-md bg-glass-white dark:bg-glass-dark
    border border-white/20 dark:border-white/10
    rounded-2xl
    transition-all duration-300 ease-out
    relative overflow-hidden
    supports-[backdrop-filter]:backdrop-blur-md
    supports-[not_backdrop-filter]:bg-white/95
    supports-[not_backdrop-filter]:shadow-win7-fallback
  `;

  const variantClasses = {
    default: 'shadow-glass hover:shadow-glass-lg supports-[not_backdrop-filter]:shadow-win7-fallback',
    elevated: 'shadow-glass-lg hover:shadow-glass-xl transform-gpu supports-[not_backdrop-filter]:shadow-lg',
    flat: 'shadow-sm hover:shadow-md',
    success: 'bg-green-50/90 border-green-200/50 shadow-green-500/10 shadow-lg supports-[not_backdrop-filter]:bg-green-50',
    warning: 'bg-yellow-50/90 border-yellow-200/50 shadow-yellow-500/10 shadow-lg supports-[not_backdrop-filter]:bg-yellow-50',
    error: 'bg-red-50/90 border-red-200/50 shadow-red-500/10 shadow-lg supports-[not_backdrop-filter]:bg-red-50',
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const hoverClasses = hover ? 'hover:scale-[1.02] hover:-translate-y-1' : '';

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        hoverClasses,
        loading && 'animate-pulse',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: typeof window !== 'undefined' && window.navigator.userAgent.includes('Windows NT 6.1') ? 0.15 : 0.3, 
        ease: 'easeOut' 
      }}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}
      {children}
    </motion.div>
  );
};

// Specialized Glass Card Components
export const MetricCard: React.FC<{
  title: string;
  value: string;
  change?: { value: number; type: 'increase' | 'decrease' };
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, value, change, icon, className }) => {
  return (
    <GlassCard variant="elevated" className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change && (
            <div className={cn(
              'flex items-center mt-2 text-sm font-medium',
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            )}>
              <span className="mr-1">
                {change.type === 'increase' ? '↗' : '↘'}
              </span>
              {change.value}%
            </div>
          )}
        </div>
        {icon && (
          <div className="text-primary-500 opacity-80">
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export const IslandWidget: React.FC<{
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, children, actions, className }) => {
  return (
    <GlassCard variant="elevated" className={cn('overflow-visible', className)}>
      {title && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {actions && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </GlassCard>
  );
};

export default GlassCard;
