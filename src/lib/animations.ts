import { Variants } from 'framer-motion'

// Reference viewport height for threshold calculations (1080p)
export const REFERENCE_VIEWPORT_HEIGHT = 1080

/**
 * Calculate text animation threshold adjusted for viewport size
 * On larger screens, text animations trigger EARLIER (lower threshold)
 */
export function getTextAnimationThreshold(baseThreshold: number, viewportHeight: number): number {
  const scale = REFERENCE_VIEWPORT_HEIGHT / viewportHeight
  return baseThreshold * scale
}

/**
 * Calculate explosion animation threshold adjusted for viewport size
 * On larger screens, explosion triggers LATER (higher threshold)
 */
export function getExplosionThreshold(baseThreshold: number, viewportHeight: number): number {
  const scale = viewportHeight / REFERENCE_VIEWPORT_HEIGHT
  // Apply a dampened scale so it doesn't go too high
  return baseThreshold * (1 + (scale - 1) * 0.3)
}

// Animation variants for consistent, performant animations
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// Stagger children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// Optimized scroll trigger settings
export const scrollTrigger = {
  once: true,
  amount: 0.3,
  margin: '-100px',
}

// Reduced motion preferences
export const reducedMotion = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
}

// Hook for respecting reduced motion preferences
import { useReducedMotion } from 'framer-motion'

export function useAnimationVariants(variants: Variants) {
  const shouldReduceMotion = useReducedMotion()
  return shouldReduceMotion ? reducedMotion : variants
}

// Performance-optimized hover animation
export const hoverScale = {
  scale: 1.05,
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
}

// Tap animation
export const tapScale = {
  scale: 0.95,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  },
}
