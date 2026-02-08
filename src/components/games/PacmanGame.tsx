'use client'

import { useMemo } from 'react'
import { prefersReducedMotion } from '@/lib/performance'
import { useMobileDetection } from '@/hooks/useMobileDetection'

type PacmanGameProps = {
  className?: string
  isLight?: boolean
}

export default function PacmanGame({ className = '', isLight = false }: PacmanGameProps) {
  const shouldReduceMotion = useMemo(() => prefersReducedMotion(), [])
  const isMobile = useMobileDetection()
  const showInteractive = !shouldReduceMotion && !isMobile

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl border ${
          isLight
            ? 'bg-white/80 border-gray-200 shadow-xl shadow-blue-100/40'
            : 'bg-white/5 border-white/10 shadow-2xl shadow-black/40'
        }`}
      >
        {showInteractive ? (
          <iframe
            src="/bla-pacman.html"
            title="Pacman-demo"
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            sandbox="allow-scripts"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div
              className={`rounded-xl border px-6 py-5 text-sm leading-relaxed ${
                isLight
                  ? 'border-gray-200 bg-white/80 text-gray-600'
                  : 'border-white/10 bg-white/5 text-gray-300'
              }`}
            >
              Pacman-demot laddas pa desktop for basta prestanda.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
