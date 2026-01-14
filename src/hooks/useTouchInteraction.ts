'use client'

import { useEffect, useRef, useState } from 'react'

interface TouchInteractionOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onLongPress?: () => void
  threshold?: number
  longPressDelay?: number
}

export function useTouchInteraction(
  elementRef: React.RefObject<HTMLElement>,
  {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500,
  }: TouchInteractionOptions
) {
  const [isTouching, setIsTouching] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  )
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      setIsTouching(true)
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      // Start long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          onLongPress()
          touchStartRef.current = null // Prevent tap after long press
        }, longPressDelay)
      }
    }

    const handleTouchMove = (_e: TouchEvent) => {
      // Cancel long press if moving
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      setIsTouching(false)

      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      // Check for tap (minimal movement and quick)
      if (
        Math.abs(deltaX) < 10 &&
        Math.abs(deltaY) < 10 &&
        deltaTime < 200 &&
        onTap
      ) {
        onTap()
        return
      }

      // Check for swipes
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absX > threshold || absY > threshold) {
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > threshold && onSwipeRight) {
            onSwipeRight()
          } else if (deltaX < -threshold && onSwipeLeft) {
            onSwipeLeft()
          }
        } else {
          // Vertical swipe
          if (deltaY > threshold && onSwipeDown) {
            onSwipeDown()
          } else if (deltaY < -threshold && onSwipeUp) {
            onSwipeUp()
          }
        }
      }

      touchStartRef.current = null
    }

    const handleTouchCancel = () => {
      setIsTouching(false)
      touchStartRef.current = null
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchCancel, {
      passive: true,
    })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [
    elementRef,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    threshold,
    longPressDelay,
  ])

  return { isTouching }
}

// Hook for detecting touch device
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          // @ts-expect-error - msMaxTouchPoints is IE-specific and not in standard types
          navigator.msMaxTouchPoints > 0
      )
    }

    checkTouchDevice()
    window.addEventListener('resize', checkTouchDevice)

    return () => window.removeEventListener('resize', checkTouchDevice)
  }, [])

  return isTouchDevice
}
