/**
 * Utility functions för att komma åt design tokens i komponenter
 */

import { designTokens } from '@/config/designTokens'

/**
 * Hämta färg från design tokens
 */
export function getColor(path: string): string {
  const parts = path.split('.')
  let value: unknown = designTokens.colors

  for (const part of parts) {
    value = (value as Record<string, unknown>)?.[part]
    if (value === undefined) {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn(`Color path "${path}" not found in design tokens`)
      }
      return '#000000'
    }
  }

  return typeof value === 'string' ? value : '#000000'
}

/**
 * Hämta spacing från design tokens
 */
export function getSpacing(size: keyof typeof designTokens.spacing): string {
  return designTokens.spacing[size]
}

/**
 * Hämta fontstorlek från design tokens
 */
export function getFontSize(size: keyof typeof designTokens.typography.fontSize): string {
  return designTokens.typography.fontSize[size]
}

/**
 * Hämta animation duration
 */
export function getAnimationDuration(speed: keyof typeof designTokens.animation.duration): string {
  return designTokens.animation.duration[speed]
}

/**
 * Hämta breakpoint värde
 */
export function getBreakpoint(size: keyof typeof designTokens.breakpoints): string {
  return designTokens.breakpoints[size]
}

// Export design tokens direkt för användning i komponenter
export { designTokens }
