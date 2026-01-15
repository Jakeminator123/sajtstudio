'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SectionTemplateProps {
  children: ReactNode
  className?: string
  background?: 'white' | 'gray' | 'black'
  padding?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  animate?: boolean
}

/**
 * SectionTemplate - Mall för sektioner på sidor
 *
 * Ger konsistent container, padding och animationer för alla sektioner.
 */
export default function SectionTemplate({
  children,
  className = '',
  background = 'white',
  padding = 'xl',
  animate = true,
}: SectionTemplateProps) {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    black: 'bg-black text-white',
  }

  const paddingClasses = {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-20',
    xl: 'py-24 md:py-32',
    '2xl': 'py-32 md:py-40',
    '3xl': 'py-40 md:py-48',
  }

  const content = (
    <div className={`container mx-auto px-6 ${paddingClasses[padding]}`}>{children}</div>
  )

  if (animate) {
    return (
      <section className={`${backgroundClasses[background]} ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {content}
        </motion.div>
      </section>
    )
  }

  return <section className={`${backgroundClasses[background]} ${className}`}>{content}</section>
}
