'use client'

import { ReactNode } from 'react'
import { motion, MotionProps } from 'framer-motion'

interface ComponentTemplateProps {
  children: ReactNode
  className?: string
  animate?: boolean
  animationProps?: MotionProps
}

/**
 * ComponentTemplate - Mall för återanvändbara komponenter
 *
 * Använd denna mall när du skapar nya komponenter för att säkerställa
 * konsistent struktur, animationer och styling.
 *
 * @example
 * ```tsx
 * export default function MyComponent({ title }: { title: string }) {
 *   return (
 *     <ComponentTemplate>
 *       <h2>{title}</h2>
 *     </ComponentTemplate>
 *   );
 * }
 * ```
 */
export default function ComponentTemplate({
  children,
  className = '',
  animate = true,
  animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
}: ComponentTemplateProps) {
  if (animate) {
    return (
      <motion.div className={className} {...animationProps}>
        {children}
      </motion.div>
    )
  }

  return <div className={className}>{children}</div>
}
