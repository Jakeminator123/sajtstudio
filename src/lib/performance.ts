/**
 * Performance utilities and optimizations
 */

/**
 * Preload critical resources
 */
export function preloadResource(
  href: string,
  as: 'script' | 'style' | 'image' | 'font' | 'video' | 'audio'
) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as

  if (as === 'font') {
    link.crossOrigin = 'anonymous'
  }

  document.head.appendChild(link)
}

/**
 * Prefetch resources for faster navigation
 */
export function prefetchResource(href: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImage(img: HTMLImageElement) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: load immediately if IntersectionObserver not supported
    if (img.dataset.src) {
      img.src = img.dataset.src
    }
    return
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement
          if (image.dataset.src) {
            image.src = image.dataset.src
            image.removeAttribute('data-src')
          }
          observer.unobserve(image)
        }
      })
    },
    {
      rootMargin: '50px',
    }
  )

  observer.observe(img)
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if device is mobile (touch-based or small screen)
 * Used to reduce heavy animations on mobile for performance
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  // Check screen width
  const isSmallScreen = window.innerWidth < 768

  // Check for touch capability (more reliable than user agent)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Check for slow connection on mobile
  const connection = (navigator as { connection?: { effectiveType?: string } }).connection
  const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g'

  return isSmallScreen || (isTouchDevice && isSlowConnection)
}

/**
 * Get connection speed (if available)
 */
export function getConnectionSpeed(): 'slow' | 'fast' | 'unknown' {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return 'unknown'
  }

  const connection = (navigator as { connection?: { effectiveType?: string } })
    .connection
  if (!connection) return 'unknown'

  const effectiveType = connection.effectiveType
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow'
  }
  return 'fast'
}
