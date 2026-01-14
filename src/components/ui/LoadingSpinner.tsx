'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className = '', size = 'md' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <motion.div
            className={`${sizeClasses[size]} ${className}`}
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
            }}
            role="status"
            aria-label="Laddar"
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="60"
                    strokeDashoffset="20"
                />
            </svg>
        </motion.div>
    );
}

export default LoadingSpinner;
