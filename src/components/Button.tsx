'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
}

const variantClasses = {
  primary: 'bg-black text-white hover:bg-accent',
  secondary: 'bg-accent text-white hover:bg-accent-hover',
  outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
};

const sizeClasses = {
  sm: 'px-6 py-2.5 text-sm min-h-[40px]',
  md: 'px-8 py-3.5 sm:px-10 sm:py-4 text-base sm:text-lg min-h-[48px]',
  lg: 'px-10 py-4 sm:px-12 sm:py-5 text-lg sm:text-xl min-h-[56px]',
};

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  className = '',
  external = false,
  ariaLabel,
}: ButtonProps) {
  const classes = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : 'inline-block'}
    font-semibold
    transition-all duration-300
    text-center
    relative
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  const motionProps: HTMLMotionProps<any> = {
    whileHover: disabled || loading ? {} : { scale: 1.05 },
    whileTap: disabled || loading ? {} : { scale: 0.95 },
    transition: { duration: 0.2 },
  };

  const content = (
    <>
      {loading && (
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <LoadingSpinner />
        </motion.span>
      )}
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
    </>
  );

  if (href) {
    const linkProps = external 
      ? { target: '_blank', rel: 'noopener noreferrer' } 
      : {};

    return (
      <motion.div {...motionProps} className="inline-block">
        <Link 
          href={href} 
          className={classes}
          aria-label={ariaLabel}
          {...linkProps}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      aria-label={ariaLabel}
    >
      {content}
    </motion.button>
  );
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Button group component
interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  vertical?: boolean;
}

export function ButtonGroup({ 
  children, 
  className = '', 
  vertical = false 
}: ButtonGroupProps) {
  return (
    <div className={`
      flex ${vertical ? 'flex-col' : 'flex-col sm:flex-row'} 
      gap-4 
      ${className}
    `}>
      {children}
    </div>
  );
}
