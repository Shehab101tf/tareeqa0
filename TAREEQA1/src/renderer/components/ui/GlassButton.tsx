import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, "size"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center
    font-medium rounded-xl
    backdrop-blur-md
    border
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    overflow-hidden
    group
  `;

  const variantClasses = {
    primary: `
      bg-primary-500/90 hover:bg-primary-600/90
      border-primary-400/50 hover:border-primary-500/50
      text-white
      shadow-lg shadow-primary-500/25
      hover:shadow-xl hover:shadow-primary-500/30
      focus:ring-primary-500/50
    `,
    secondary: `
      bg-gray-500/90 hover:bg-gray-600/90
      border-gray-400/50 hover:border-gray-500/50
      text-white
      shadow-lg shadow-gray-500/25
      hover:shadow-xl hover:shadow-gray-500/30
      focus:ring-gray-500/50
    `,
    success: `
      bg-green-500/90 hover:bg-green-600/90
      border-green-400/50 hover:border-green-500/50
      text-white
      shadow-lg shadow-green-500/25
      hover:shadow-xl hover:shadow-green-500/30
      focus:ring-green-500/50
    `,
    warning: `
      bg-yellow-500/90 hover:bg-yellow-600/90
      border-yellow-400/50 hover:border-yellow-500/50
      text-white
      shadow-lg shadow-yellow-500/25
      hover:shadow-xl hover:shadow-yellow-500/30
      focus:ring-yellow-500/50
    `,
    error: `
      bg-red-500/90 hover:bg-red-600/90
      border-red-400/50 hover:border-red-500/50
      text-white
      shadow-lg shadow-red-500/25
      hover:shadow-xl hover:shadow-red-500/30
      focus:ring-red-500/50
    `,
    ghost: `
      bg-white/10 hover:bg-white/20
      border-white/20 hover:border-white/30
      text-gray-700 dark:text-gray-200
      hover:text-gray-900 dark:hover:text-white
      focus:ring-gray-500/50
    `,
    outline: `
      bg-transparent hover:bg-white/10
      border-gray-300 dark:border-gray-600
      text-gray-700 dark:text-gray-200
      hover:text-gray-900 dark:hover:text-white
      focus:ring-gray-500/50
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[44px]',
    xl: 'px-8 py-4 text-lg min-h-[48px]',
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        className
      )}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {/* Ripple Effect */}
      <div className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-200">
        <div className="absolute inset-0 bg-white/20 rounded-xl animate-ping" />
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      <div className={cn(
        'flex items-center justify-center space-x-2 rtl:space-x-reverse',
        loading && 'opacity-0'
      )}>
        {leftIcon && (
          <span className="flex-shrink-0">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {rightIcon && (
          <span className="flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </div>
    </motion.button>
  );
};

// Specialized Button Components
export const FloatingActionButton: React.FC<{
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ icon, onClick, className }) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 rtl:right-auto rtl:left-6',
        'w-14 h-14 rounded-full',
        'bg-primary-500/90 hover:bg-primary-600/90',
        'backdrop-blur-md border border-primary-400/50',
        'text-white shadow-lg shadow-primary-500/25',
        'flex items-center justify-center',
        'transition-all duration-200',
        'hover:scale-110 hover:shadow-xl hover:shadow-primary-500/30',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
        'z-50',
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {icon}
    </motion.button>
  );
};

export const IconButton: React.FC<{
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ icon, variant = 'ghost', size = 'md', onClick, className, disabled }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-lg flex items-center justify-center',
        'backdrop-blur-md border transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-primary-500/90 border-primary-400/50 text-white hover:bg-primary-600/90',
        variant === 'secondary' && 'bg-gray-500/90 border-gray-400/50 text-white hover:bg-gray-600/90',
        variant === 'ghost' && 'bg-white/10 border-white/20 text-gray-700 dark:text-gray-200 hover:bg-white/20',
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {icon}
    </motion.button>
  );
};

export default GlassButton;
