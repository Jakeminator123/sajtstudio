'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { designTokens } from '@/config/designTokens';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={{
          initial: {
            opacity: 0,
            y: 20,
          },
          animate: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1],
            },
          },
          exit: {
            opacity: 0,
            y: -20,
            transition: {
              duration: 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            },
          },
        }}
      >
        {/* Page loading indicator */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-accent z-50 origin-left pointer-events-none"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 0 }}
          exit={{ scaleX: 1 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
        
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Alternative fancy page transition with overlay
export function FancyPageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname}>
        {/* Overlay animation */}
        <motion.div
          className="fixed inset-0 bg-black z-50 origin-bottom"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />
        
        {/* Content animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: {
              delay: 0.2,
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }
          }}
          exit={{ 
            opacity: 0,
            transition: {
              duration: 0.2,
            }
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
