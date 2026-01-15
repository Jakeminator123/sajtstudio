'use client'

import { useState, useEffect } from 'react'

/**
 * TEMPORARY COMPONENT - Under Construction Banner
 *
 * Shows a diagonal red banner after 8 seconds.
 * Easy to remove: just delete this file and remove the import from layout.tsx or page.tsx
 *
 * To remove:
 * 1. Delete this file
 * 2. Remove <UnderConstructionBanner /> from wherever it's imported
 */
export default function UnderConstructionBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 8000) // 8 seconds delay

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`
        fixed inset-0 pointer-events-none z-[9999]
        transition-opacity duration-1000 ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Diagonal banner */}
      <div
        className="
          absolute top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-[200vw]
          rotate-[-15deg]
          flex items-center justify-center
          py-4
          bg-gradient-to-r from-red-600/90 via-red-500/95 to-red-600/90
          shadow-2xl
          backdrop-blur-sm
        "
      >
        <p
          className="
          text-white text-xl md:text-2xl lg:text-3xl font-bold
          tracking-wide
          text-center
          whitespace-nowrap
          drop-shadow-lg
          animate-pulse
        "
        >
          🚧 Vi är nystartade – sajt under konstruktion. Håll till godo! 😊 🚧
        </p>
      </div>
    </div>
  )
}
