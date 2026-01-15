import { useSyncExternalStore } from 'react'
import { isMobileDevice } from '@/lib/performance'

/**
 * Hook to detect mobile devices safely for SSR using useSyncExternalStore
 *
 * This is the React 19 recommended pattern for subscribing to external state
 * (like window size) without triggering the "setState in useEffect" warning.
 *
 * Returns false on server, and the actual mobile state on client.
 */

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

function getSnapshot() {
  return isMobileDevice() || window.innerWidth < 768
}

function getServerSnapshot() {
  return false
}

export function useMobileDetection(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
