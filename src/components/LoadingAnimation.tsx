'use client';

import { motion } from 'framer-motion';

export default function LoadingAnimation() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        {/* Animated icon transformation */}
        <svg 
          width="80" 
          height="80" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative"
        >
          {/* Background circle with pulse */}
          <motion.circle
            cx="20"
            cy="20"
            r="18"
            stroke="#000000"
            strokeWidth="2"
            fill="none"
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ 
              scale: [0.9, 1.1, 0.9],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Morphing phone to computer */}
          <motion.g
            initial={{ x: 5, y: 10 }}
            animate={{ x: [5, 15, 25, 15, 5] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Phone base morphing */}
            <motion.g
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              <path
                d="M0 16 Q0 14 2 14 L10 14 Q12 14 12 16 L12 18 Q12 20 10 20 L2 20 Q0 20 0 18 Z"
                fill="#000000"
              />
            </motion.g>
          </motion.g>
          
          {/* Transformation arrow */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.3, 0.7, 1],
            }}
          >
            <path
              d="M18 20 L22 20 M22 20 L20 18 M22 20 L20 22"
              stroke="#0066FF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
          
          {/* LED lights blinking */}
          <motion.circle
            cx="30"
            cy="28"
            r="1"
            fill="#FF0033"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: 0.5,
            }}
          />
        </svg>
        
        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 text-sm text-gray-600 font-medium tracking-wider"
        >
          Laddar...
        </motion.p>
      </motion.div>
    </div>
  );
}

// Simple loading spinner
export function SimpleLoadingSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-3 border-gray-200 border-t-accent rounded-full"
    />
  );
}
