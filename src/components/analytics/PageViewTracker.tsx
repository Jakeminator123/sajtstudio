'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Tracks page views to the stats database.
 * Uses localStorage to persist visitor ID across sessions.
 */
export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const visitorKey = 'sajtstudio_visitor_id'
    let visitorId = localStorage.getItem(visitorKey)

    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      localStorage.setItem(visitorKey, visitorId)
    }

    // Record page view to database
    fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, page: pathname }),
    }).catch(() => {
      // Silent fail - analytics should never block the user
    })
  }, [pathname])

  return null
}
