'use client'

import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const progressScale = useMotionValue(0)
  const progressOpacity = useMotionValue(0)

  useEffect(() => {
    // Use requestAnimationFrame to avoid setState in effect warning
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  useEffect(() => {
    if (!mounted) return
    // Use requestAnimationFrame to avoid setState in effect warning
    requestAnimationFrame(() => {
      setIsLoading(true)
    })
    // Scroll to top on route change - use requestAnimationFrame to avoid blocking
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        // If the URL includes a hash, let hash-based navigation (anchor scroll) win.
        // This prevents "wrong section" behavior when landing on /#something.
        const hasHash = Boolean(window.location.hash && window.location.hash !== '#')
        if (hasHash) return
        window.scrollTo({ top: 0, behavior: 'instant' })
      })
    }
    const timer = setTimeout(() => setIsLoading(false), 50)
    return () => clearTimeout(timer)
  }, [pathname, mounted])

  // Update progress bar animation after mount to avoid hydration mismatch
  useEffect(() => {
    if (!mounted) return
    if (isLoading) {
      progressScale.set(0.7)
      progressOpacity.set(1)
    } else {
      progressScale.set(1)
      progressOpacity.set(0)
    }
  }, [mounted, isLoading, progressScale, progressOpacity])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-screen w-full" style={{ position: 'relative' }}>
      {/* Progress bar - only render after mount to avoid hydration mismatch */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent-light to-accent z-[200] origin-left pointer-events-none"
        style={{
          scaleX: progressScale,
          opacity: progressOpacity,
        }}
        transition={{
          duration: isLoading ? 0.3 : 0.2,
          ease: isLoading ? [0, 0.58, 1, 1] : [0.42, 0, 1, 1], // Use arrays instead of strings
        }}
      />

      {children}
    </div>
  )
}

// Alternative fancy page transition with overlay
export function FancyPageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

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
            },
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.2,
            },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
