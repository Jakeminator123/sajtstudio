import { useState, useEffect } from 'react'

/**
 * useMounted Hook
 *
 * Prevents hydration mismatches by ensuring component is mounted on client before rendering.
 *
 * Usage:
 * ```tsx
 * const mounted = useMounted();
 *
 * if (!mounted) {
 *   return <Placeholder />; // Same on server and client
 * }
 *
 * return <DynamicContent />; // Only rendered on client
 * ```
 *
 * @returns {boolean} True when component is mounted on client, false during SSR
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Use requestAnimationFrame to avoid setState in effect warning
    // This is a standard pattern for preventing hydration mismatches
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  return mounted
}
