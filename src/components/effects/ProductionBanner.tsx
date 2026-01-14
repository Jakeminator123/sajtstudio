"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

/**
 * Production Banner - "Under Development" notification
 * 
 * A sleek, non-intrusive banner that shows the site is under development.
 * - Appears after 40 seconds
 * - Auto-hides after 5 seconds
 * - Positioned below header to not obstruct navigation
 * 
 * To remove: delete this file and remove from layout.tsx
 */
export default function ProductionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Show banner after 40 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 40000);

    // Cleanup both timers on unmount
    return () => {
      clearTimeout(showTimer);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 20,
            duration: 0.6 
          }}
          className="fixed top-16 md:top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-lg z-[999] pointer-events-none"
        >
          <div className="pointer-events-auto rounded-xl overflow-hidden shadow-2xl">
            {/* Gradient background with glassmorphism */}
            <div className="relative overflow-hidden">
              {/* Animated gradient background */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-rose-500/95"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 100%" }}
              />
              
              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              />

              {/* Content */}
              <div className="relative px-5 py-3 flex items-center justify-center gap-3 backdrop-blur-sm">
                {/* Animated construction icon */}
                <motion.svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </motion.svg>

                {/* Text */}
                <p className="text-white font-medium text-sm tracking-wide text-center">
                  <span className="font-bold">Sajten är under produktion</span>
                  <span className="hidden sm:inline"> – snart i hamn!</span>
                </p>

                {/* Animated progress indicator */}
                <motion.div
                  className="flex gap-1"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Bottom glow effect */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
