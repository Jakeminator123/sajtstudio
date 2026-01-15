'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import {
  REFERENCE_VIEWPORT_HEIGHT,
  getTextAnimationThreshold,
  getExplosionThreshold,
} from '@/lib/animations'

/**
 * Hook that provides viewport-relative scroll thresholds
 * Ensures animations trigger at visually consistent points regardless of screen size
 *
 * Problem it solves:
 * - On 4K screens, you see more content at once
 * - Text animations should trigger EARLIER (lower threshold)
 * - Explosion animations should trigger LATER (higher threshold, waits for visual overlap)
 */
export function useViewportRelativeScroll() {
  const [viewportHeight, setViewportHeight] = useState(REFERENCE_VIEWPORT_HEIGHT)
  const mountedRef = useRef(false)
  const [mounted, setMounted] = useState(false)

  // Initialize on mount - use ref to track initialization
  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    // Batch updates in a microtask to avoid cascading renders
    queueMicrotask(() => {
      setMounted(true)
      setViewportHeight(window.innerHeight)
    })

    const handleResize = () => {
      setViewportHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /**
   * Get adjusted threshold for text animations (earlier on larger screens)
   * @param baseThreshold - Threshold designed for 1080p
   */
  const getTextThreshold = useMemo(
    () => (baseThreshold: number) => getTextAnimationThreshold(baseThreshold, viewportHeight),
    [viewportHeight]
  )

  /**
   * Get adjusted threshold for explosion animations (later on larger screens)
   * @param baseThreshold - Threshold designed for 1080p
   */
  const getExplosionThresholdFn = useMemo(
    () => (baseThreshold: number) => getExplosionThreshold(baseThreshold, viewportHeight),
    [viewportHeight]
  )

  /**
   * Scale factor: how much larger the viewport is compared to reference
   * 1.0 for 1080p, 2.0 for 4K, etc.
   */
  const viewportScale = useMemo(() => viewportHeight / REFERENCE_VIEWPORT_HEIGHT, [viewportHeight])

  /**
   * Inverse scale: used to make thresholds smaller on larger screens
   * 1.0 for 1080p, 0.5 for 4K, etc.
   */
  const inverseScale = useMemo(() => REFERENCE_VIEWPORT_HEIGHT / viewportHeight, [viewportHeight])

  return {
    viewportHeight,
    viewportScale,
    inverseScale,
    getTextThreshold,
    getExplosionThresholdFn,
    mounted,
  }
}

/**
 * Hook specifically for explosion-type animations
 * Returns the optimal trigger point based on viewport
 * On larger screens, explosion triggers LATER (higher threshold)
 */
export function useExplosionTrigger() {
  const { getExplosionThresholdFn, viewportHeight, mounted } = useViewportRelativeScroll()

  // Base explosion threshold is 0.48 (48% scroll on 1080p)
  // This allows the video to grow more before exploding
  // On 4K, this becomes ~0.55 so explosion waits until video visually touches images
  const explosionThreshold = useMemo(() => {
    const calculated = getExplosionThresholdFn(0.48)
    // Clamp between 0.35 and 0.65
    return Math.max(0.35, Math.min(0.65, calculated))
  }, [getExplosionThresholdFn])

  return {
    explosionThreshold,
    viewportHeight,
    mounted,
  }
}

/**
 * Hook for hero text animations
 * Returns optimized thresholds for text that should animate quickly
 * On larger screens, text animations trigger EARLIER (lower threshold)
 */
export function useHeroTextTrigger() {
  const { getTextThreshold, viewportHeight, mounted } = useViewportRelativeScroll()

  // Text should start animating earlier on larger screens
  // Base is 0.15 (15% scroll on 1080p), becomes ~0.075 on 4K
  const textAnimationStart = useMemo(() => {
    const calculated = getTextThreshold(0.15)
    // Ensure we don't go below 0.05 or above 0.2
    return Math.max(0.05, Math.min(0.2, calculated))
  }, [getTextThreshold])

  // Text should be fully animated by this point
  // Base is 0.35, becomes ~0.175 on 4K
  const textAnimationEnd = useMemo(() => {
    const calculated = getTextThreshold(0.35)
    // Ensure we don't go below 0.15 or above 0.5
    return Math.max(0.15, Math.min(0.5, calculated))
  }, [getTextThreshold])

  return {
    textAnimationStart,
    textAnimationEnd,
    viewportHeight,
    mounted,
  }
}
