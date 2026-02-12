'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const parseEnvBool = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined
  const v = value.trim().toLowerCase()
  if (['true', '1', 'yes', 'y', 'on'].includes(v)) return true
  if (['false', '0', 'no', 'n', 'off'].includes(v)) return false
  return undefined
}

function cleanupDid() {
  try {
    const existingScript = document.querySelector('script[data-name="did-agent"]')
    existingScript?.remove()

    // D-ID sometimes injects a custom element / nodes. Remove the most common ones.
    document.querySelector('did-agent')?.remove()
    document.querySelectorAll('[id*="did"]').forEach((el) => {
      // avoid nuking our own elements by being conservative
      if (el.tagName.toLowerCase().includes('did')) el.remove()
    })

    window.__didStatus = 'disabled'
  } catch {
    // ignore
  }
}

/**
 * Known app routes where the D-ID chatbot SHOULD load.
 * Any path not matching these (or /) is treated as a slug/preview page where D-ID is disabled,
 * since preview iframes conflict with the chatbot overlay.
 */
const APP_ROUTES = [
  '/admin',
  '/kontakt',
  '/contact',
  '/portfolio',
  '/sajtgranskning',
  '/utvardera',
  '/sajtmaskin',
  '/engine',
  '/generated',
]

function isSlugPreviewPage(pathname: string): boolean {
  // Homepage is not a preview page
  if (pathname === '/') return false
  // Known app routes are not preview pages
  if (APP_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return false
  }
  // Next.js internals and API routes are not preview pages
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) return false
  // Everything else is a slug/preview/embed page
  return true
}

/**
 * D-ID chatbot loader (route-aware).
 *
 * Why: preview/embed pages (e.g. /demo-*, /manssakrad, /skv) show iframes that
 * conflict with the D-ID chatbot overlay (z-index fights, bandwidth, CPU).
 * The chatbot is disabled on all slug/preview/embed pages.
 */
export default function DidChatbotLoader() {
  const pathname = usePathname() || ''
  const isPreviewPage = isSlugPreviewPage(pathname)

  const isProd = process.env.NODE_ENV === 'production'
  const didChatbotFlag = parseEnvBool(process.env.NEXT_PUBLIC_ENABLE_DID_CHATBOT)
  const didClientKey = process.env.NEXT_PUBLIC_DID_CLIENT_KEY?.trim()
  const didAgentId = process.env.NEXT_PUBLIC_DID_AGENT_ID?.trim()
  const didMode = process.env.NEXT_PUBLIC_DID_MODE?.trim() || 'fabio'
  const didOrientation = process.env.NEXT_PUBLIC_DID_ORIENTATION?.trim() || 'horizontal'
  const didPosition = process.env.NEXT_PUBLIC_DID_POSITION?.trim() || 'right'
  const didDebug = parseEnvBool(process.env.NEXT_PUBLIC_DID_DEBUG) ?? (isProd ? false : true)
  const didMonitor = parseEnvBool(process.env.NEXT_PUBLIC_DID_MONITOR) ?? isProd

  const shouldLoad =
    !isPreviewPage && (didChatbotFlag ?? (isProd ? false : true)) && !!didClientKey && !!didAgentId

  useEffect(() => {
    if (!shouldLoad) {
      cleanupDid()
      return
    }

    // Avoid duplicate injection
    if (document.querySelector('script[data-name="did-agent"]')) {
      return
    }

    let cancelled = false

    const inject = () => {
      if (cancelled) return
      try {
        window.__didStatus = window.__didStatus || 'pending'
      } catch {
        // ignore
      }

      // Retry configuration (kept simple)
      let retryCount = 0
      const maxRetries = 2
      const retryDelay = 8000

      const loadChatbot = () => {
        if (cancelled) return

        // Remove a previous failed script
        const existing = document.querySelector('script[data-name="did-agent"]')
        if (existing && window.__didStatus === 'error') {
          existing.remove()
        }

        const script = document.createElement('script')
        script.type = 'module'
        script.src = 'https://agent.d-id.com/v2/index.js'
        script.setAttribute('data-mode', didMode)
        script.setAttribute('data-client-key', didClientKey!)
        script.setAttribute('data-agent-id', didAgentId!)
        script.setAttribute('data-name', 'did-agent')
        script.setAttribute('data-monitor', didMonitor ? 'true' : 'false')
        script.setAttribute('data-orientation', didOrientation)
        script.setAttribute('data-position', didPosition)

        const retry = () => {
          if (cancelled) return
          if (retryCount >= maxRetries) return
          retryCount += 1
          setTimeout(loadChatbot, retryDelay)
        }

        script.onload = () => {
          try {
            window.__didStatus = 'loaded'
            window.dispatchEvent(new Event('did-status-change'))
            if (didDebug) {
              console.log('[D-ID] Chatbot loaded successfully!')
            }
          } catch {
            // ignore
          }
        }

        script.onerror = () => {
          try {
            window.__didStatus = 'error'
            window.dispatchEvent(new Event('did-status-change'))
            if (didDebug) {
              console.warn('[D-ID] Failed to load chatbot script')
            }
          } catch {
            // ignore
          }
          retry()
        }

        document.body.appendChild(script)
      }

      // Delay injection slightly to avoid interfering with first paint
      setTimeout(loadChatbot, 1500)

      if (didDebug) {
        window.addEventListener('did-status-change', () => {
          try {
            console.log('[D-ID] status:', window.__didStatus)
          } catch {
            // ignore
          }
        })

        setTimeout(() => {
          try {
            const s = document.querySelector('script[data-name="did-agent"]')
            console.log('[D-ID] script present:', !!s, 'status:', window.__didStatus)
          } catch {
            // ignore
          }
        }, 6000)
      }
    }

    // Only inject when the page is interactive
    if (document.readyState === 'complete') {
      inject()
    } else {
      window.addEventListener('load', inject, { once: true })
    }

    return () => {
      cancelled = true
      window.removeEventListener('load', inject)
    }
  }, [
    shouldLoad,
    didAgentId,
    didClientKey,
    didDebug,
    didMode,
    didMonitor,
    didOrientation,
    didPosition,
    pathname,
  ])

  return null
}
