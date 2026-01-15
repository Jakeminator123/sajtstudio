'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'

interface WordRevealProps {
  text: string
  delay?: number
  className?: string
  staggerDelay?: number
  direction?: 'left' | 'right' | 'up' | 'down'
}

export default function WordReveal({
  text,
  delay = 0,
  className = '',
  staggerDelay = 0.05,
  direction = 'up',
}: WordRevealProps) {
  const words = useMemo(() => text.split(' '), [text])
  const prefersReducedMotion = useReducedMotion()

  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -20, y: 0 }
      case 'right':
        return { x: 20, y: 0 }
      case 'up':
        return { x: 0, y: 20 }
      case 'down':
        return { x: 0, y: -20 }
      default:
        return { x: 0, y: 20 }
    }
  }

  const initialPos = getInitialPosition()

  // If user prefers reduced motion, show text immediately without animation
  if (prefersReducedMotion) {
    return (
      <span className={className} suppressHydrationWarning>
        {text}
      </span>
    )
  }

  return (
    <span className={className} suppressHydrationWarning>
      {words.map((word, index) => (
        <span key={index} className="inline-block overflow-hidden" suppressHydrationWarning>
          <motion.span
            initial={{ opacity: 0, ...initialPos }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            // Larger positive margin triggers animation earlier (before element enters viewport)
            // amount: 0 means any part visible triggers it - more reliable on mobile
            viewport={{ once: true, margin: '200px 0px', amount: 0 }}
            transition={{
              delay: delay + index * staggerDelay,
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="inline-block mr-[0.25em]"
            suppressHydrationWarning
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
