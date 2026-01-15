'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ReactNode } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface ButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'cta'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  className?: string
  external?: boolean
  ariaLabel?: string
}

const variantClasses = {
  primary: 'bg-black text-white hover:bg-accent',
  secondary: 'bg-accent text-white hover:bg-accent-hover',
  outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
  cta: 'bg-gradient-to-r from-accent to-tertiary text-white font-bold rounded-full overflow-hidden',
}

const sizeClasses = {
  sm: 'px-6 py-2.5 text-sm min-h-[40px]',
  md: 'px-8 py-3.5 sm:px-10 sm:py-4 text-base sm:text-lg min-h-[48px]',
  lg: 'px-10 py-4 sm:px-12 sm:py-5 text-lg sm:text-xl min-h-[56px]',
}

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
  `.trim()

  const motionProps = {
    whileHover: disabled || loading ? {} : { scale: 1.05 },
    whileTap: disabled || loading ? {} : { scale: 0.95 },
    transition: { duration: 0.2 },
  } as const

  const content = (
    <>
      {variant === 'cta' && (
        <>
          {/* Shimmer effect */}
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        </>
      )}
      {loading && (
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          aria-hidden="true"
        >
          <LoadingSpinner size="sm" />
        </motion.span>
      )}
      <span className={`relative ${loading ? 'opacity-0' : ''}`}>{children}</span>
    </>
  )

  // Glow effect wrapper for CTA variant
  const glowEffect =
    variant === 'cta' ? (
      <motion.div
        className="absolute inset-0 bg-tertiary/50 blur-xl rounded-full pointer-events-none"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    ) : null

  if (href) {
    const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

    const wrapperClasses = variant === 'cta' ? 'relative group inline-block' : 'inline-block'

    return (
      <motion.div {...motionProps} className={wrapperClasses}>
        {glowEffect}
        <Link href={href} className={classes} aria-label={ariaLabel} {...linkProps}>
          {content}
        </Link>
      </motion.div>
    )
  }

  const buttonWrapperClasses = variant === 'cta' ? 'relative group inline-block' : 'inline-block'

  return (
    <motion.div {...motionProps} className={buttonWrapperClasses}>
      {glowEffect}
      <motion.button
        whileHover={disabled || loading ? {} : { scale: 1.05 }}
        whileTap={disabled || loading ? {} : { scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        disabled={disabled || loading}
        className={classes}
        aria-label={ariaLabel}
      >
        {content}
      </motion.button>
    </motion.div>
  )
}

// Button group component
interface ButtonGroupProps {
  children: ReactNode
  className?: string
  vertical?: boolean
}

export function ButtonGroup({ children, className = '', vertical = false }: ButtonGroupProps) {
  return (
    <div
      className={`
      flex ${vertical ? 'flex-col' : 'flex-col sm:flex-row'}
      gap-4
      ${className}
    `}
    >
      {children}
    </div>
  )
}
