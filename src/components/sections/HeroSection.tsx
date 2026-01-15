'use client'

import HemsidorWords from '@/components/animations/HemsidorWords'
import NattenWords from '@/components/animations/NattenWords'
import { useContentSection } from '@/hooks/useContent'
import { useTheme } from '@/hooks/useTheme'
import { useOfferModal } from '@/hooks/useOfferModal'
import { prefersReducedMotion } from '@/lib/performance'
import { MotionValue, motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

// Content structure from CMS
export interface HeroContent {
  title: string
  subtitle: string
  ctaText: string
  ctaSecondary: string
  bgImage: string
  bgVideo: string
}

// Default content for backwards compatibility
const defaultContent: HeroContent = {
  title: 'Hemsidor som betyder någonting',
  subtitle: 'Vi bygger digitala upplevelser som driver resultat',
  ctaText: 'Starta projekt',
  ctaSecondary: 'BYGG DIN SAJT NU!',
  bgImage: '/images/hero/hero-background.webp',
  bgVideo: '/videos/background.mp4',
}

// Magnetic button component that follows mouse
function MagneticButton({
  href,
  onClick,
  children,
  className,
  shouldReduceMotion,
  mousePosition,
  onHoverChange,
  external = false,
}: {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  shouldReduceMotion: boolean
  mousePosition: { x: number; y: number }
  onHoverChange?: (hovering: boolean) => void
  external?: boolean
}) {
  const buttonRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion || !isHovered) {
      // Use requestAnimationFrame to avoid setState in effect warning
      requestAnimationFrame(() => {
        setButtonPosition({ x: 0, y: 0 })
      })
      return
    }

    let rafId: number
    let lastUpdateTime = 0
    const throttleMs = 16 // ~60fps

    const updatePosition = (currentTime: number) => {
      // Throttle updates to ~60fps
      if (currentTime - lastUpdateTime < throttleMs) {
        rafId = requestAnimationFrame(updatePosition)
        return
      }
      lastUpdateTime = currentTime

      if (!buttonRef.current || typeof window === 'undefined') {
        rafId = requestAnimationFrame(updatePosition)
        return
      }

      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const mouseX = mousePosition.x * (window.innerWidth / 2) + window.innerWidth / 2
      const mouseY = mousePosition.y * (window.innerHeight / 2) + window.innerHeight / 2

      const distanceX = mouseX - centerX
      const distanceY = mouseY - centerY
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      // Magnetic effect only works within certain distance
      if (distance < 150) {
        const strength = (150 - distance) / 150
        setButtonPosition({
          x: distanceX * strength * 0.3,
          y: distanceY * strength * 0.3,
        })
      } else {
        setButtonPosition({ x: 0, y: 0 })
      }

      rafId = requestAnimationFrame(updatePosition)
    }

    rafId = requestAnimationFrame(updatePosition)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [mousePosition, isHovered, shouldReduceMotion])

  const commonProps = {
    onMouseEnter: () => {
      setIsHovered(true)
      onHoverChange?.(true)
    },
    onMouseLeave: () => {
      setIsHovered(false)
      onHoverChange?.(false)
      setButtonPosition({ x: 0, y: 0 })
    },
    whileHover: {
      scale: 1.05,
      boxShadow: '0 0 40px rgba(0, 102, 255, 0.6)',
    },
    whileTap: { scale: 0.95 },
    className,
    style: {
      x: shouldReduceMotion ? 0 : buttonPosition.x,
      y: shouldReduceMotion ? 0 : buttonPosition.y,
    },
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  }

  // If onClick is provided, render as button instead of link
  if (onClick) {
    return (
      <motion.button
        ref={buttonRef as React.RefObject<HTMLButtonElement>}
        onClick={onClick}
        {...commonProps}
      >
        {children}
      </motion.button>
    )
  }

  return (
    <motion.a
      ref={buttonRef as React.RefObject<HTMLAnchorElement>}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...commonProps}
    >
      {children}
    </motion.a>
  )
}

// Lightning flash component - flashes with deterministic timing to avoid hydration mismatch
function LightningFlash() {
  const [flash, setFlash] = useState(0)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let flashTimeoutId: NodeJS.Timeout | null = null
    let isMounted = true
    let flashCounter = 0

    // Deterministic seed function using golden ratio for better distribution
    const getDeterministicValue = (counter: number, range: number, offset: number = 0) => {
      const seed = (counter * 0.618033988749895) % 1 // Golden ratio
      return offset + seed * range
    }

    const flashInterval = () => {
      if (!isMounted) return

      // Deterministic delay between 4-10 seconds based on counter
      const delay = 4000 + getDeterministicValue(flashCounter, 6000)
      timeoutId = setTimeout(() => {
        if (!isMounted) return

        // Deterministic flash count based on counter
        const seed = (flashCounter * 0.618033988749895) % 1
        const flashes = seed > 0.3 ? 2 : 1 // ~70% single, ~30% double
        let flashCount = 0

        const doFlash = () => {
          if (!isMounted) return

          setFlash(1)
          flashTimeoutId = setTimeout(
            () => {
              if (!isMounted) return

              setFlash(0)
              flashCount++
              if (flashCount < flashes) {
                const nextDelay = 50 + getDeterministicValue(flashCounter + flashCount, 100)
                flashTimeoutId = setTimeout(() => doFlash(), nextDelay)
              } else {
                flashCounter++
                flashInterval()
              }
            },
            80 + getDeterministicValue(flashCounter + flashCount, 120)
          )
        }

        doFlash()
      }, delay)
    }

    flashInterval()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      if (flashTimeoutId) clearTimeout(flashTimeoutId)
    }
  }, [])

  return (
    <>
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none z-10"
        animate={{
          opacity: flash === 1 ? [0, 0.5, 0.2, 0] : 0,
        }}
        transition={{
          duration: 0.15,
          ease: 'easeOut',
        }}
      />
      {/* Subtle blue tint during lightning */}
      <motion.div
        className="absolute inset-0 bg-blue-400/20 pointer-events-none z-10"
        animate={{
          opacity: flash === 1 ? [0, 0.3, 0] : 0,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeOut',
        }}
      />
    </>
  )
}

// Window flash/reflection component for light mode (sun reflecting off windows)
function WindowFlash() {
  const [flashes, setFlashes] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([])

  useEffect(() => {
    let isMounted = true
    let flashCounter = 0
    let timeoutId: NodeJS.Timeout

    const createFlash = () => {
      if (!isMounted) return

      // Random position on the screen (simulating different windows)
      const seed = flashCounter * 0.618033988749895
      const x = 10 + ((seed * 80) % 80) // 10-90% of width
      const y = 20 + ((seed * 1.618 * 60) % 60) // 20-80% of height

      const newFlash = {
        id: Date.now() + flashCounter,
        x,
        y,
        delay: 0,
      }

      setFlashes((prev) => [...prev.slice(-4), newFlash]) // Keep max 5 flashes
      flashCounter++

      // Schedule next flash (2-6 seconds)
      const delay = 2000 + ((seed * 4000) % 4000)
      timeoutId = setTimeout(createFlash, delay)
    }

    // Start after a short delay
    timeoutId = setTimeout(createFlash, 1000)

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <>
      {flashes.map((flash) => (
        <motion.div
          key={flash.id}
          className="absolute pointer-events-none z-10"
          style={{
            left: `${flash.x}%`,
            top: `${flash.y}%`,
            width: '60px',
            height: '80px',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.9, 0.4, 0.8, 0],
            scale: [0.5, 1, 0.9, 1.1, 0.8],
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          onAnimationComplete={() => {
            setFlashes((prev) => prev.filter((f) => f.id !== flash.id))
          }}
        >
          {/* Window reflection glint */}
          <div
            className="w-full h-full rounded-sm"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,245,200,0.6) 30%, transparent 60%)',
              boxShadow: '0 0 30px rgba(255,255,200,0.8), 0 0 60px rgba(255,200,100,0.4)',
            }}
          />
        </motion.div>
      ))}
    </>
  )
}

// Flying bird component for light mode
function FlyingBird({ delay = 0, startY = 30 }: { delay?: number; startY?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[15]"
      style={{ top: `${startY}%`, left: '-30px' }}
      initial={{ x: -30, y: 0, opacity: 0 }}
      animate={{
        x: ['0vw', '25vw', '50vw', '75vw', '110vw'],
        y: [0, -20, 15, -10, 5],
        opacity: [0, 1, 1, 1, 0],
      }}
      transition={{
        duration: 12 + delay * 2,
        delay: delay,
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: 8 + delay * 3,
      }}
    >
      {/* Simple bird silhouette using CSS */}
      <div className="relative">
        {/* Bird body */}
        <motion.div
          className="relative"
          animate={{ scaleY: [1, 0.7, 1] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          <svg width="24" height="12" viewBox="0 0 24 12" className="fill-gray-700/70">
            {/* Left wing */}
            <motion.path
              d="M12 6 Q8 2 2 4 Q6 6 12 6"
              animate={{
                d: [
                  'M12 6 Q8 2 2 4 Q6 6 12 6',
                  'M12 6 Q8 8 2 6 Q6 6 12 6',
                  'M12 6 Q8 2 2 4 Q6 6 12 6',
                ],
              }}
              transition={{ duration: 0.25, repeat: Infinity }}
            />
            {/* Right wing */}
            <motion.path
              d="M12 6 Q16 2 22 4 Q18 6 12 6"
              animate={{
                d: [
                  'M12 6 Q16 2 22 4 Q18 6 12 6',
                  'M12 6 Q16 8 22 6 Q18 6 12 6',
                  'M12 6 Q16 2 22 4 Q18 6 12 6',
                ],
              }}
              transition={{ duration: 0.25, repeat: Infinity }}
            />
            {/* Body */}
            <ellipse cx="12" cy="6" rx="3" ry="2" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Optimized text animation - animates whole block instead of individual letters
// Uses transform/opacity for GPU-accelerated animations without layout thrashing
function AnimatedText({
  text,
  className,
  scrollProgress,
  shouldReduceMotion,
  mounted,
}: {
  text: string
  className?: string
  scrollProgress: MotionValue<number>
  shouldReduceMotion: boolean
  mounted: boolean
}) {
  // Use transform and opacity only - GPU-composited, no layout work
  const y = useTransform(scrollProgress, [0, 0.5, 1], [0, -50, -100])
  const opacity = useTransform(scrollProgress, [0, 0.5, 0.9], [1, 1, 0])
  const scale = useTransform(scrollProgress, [0, 0.5, 0.95], [1, 1, 0.8])

  // Only apply animations when mounted to prevent hydration mismatch
  if (!mounted || shouldReduceMotion) {
    return <span className={className}>{text}</span>
  }

  return (
    <motion.span
      className={className}
      style={{
        y: y ?? 0,
        opacity: opacity ?? 1,
        scale: scale ?? 1,
        display: 'inline-block',
      }}
    >
      {text}
    </motion.span>
  )
}

// Optimized cursor trail component
function CursorTrail({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    updateSize()
    window.addEventListener('resize', updateSize, { passive: true })
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const particles = useMemo(() => Array.from({ length: 15 }), [])
  const baseX = useMemo(() => {
    if (windowSize.width === 0) return 0
    return mousePosition.x * (windowSize.width / 2) + windowSize.width / 2
  }, [mousePosition.x, windowSize.width])
  const baseY = useMemo(() => {
    if (windowSize.height === 0) return 0
    return mousePosition.y * (windowSize.height / 2) + windowSize.height / 2
  }, [mousePosition.y, windowSize.height])

  return (
    <div className="fixed inset-0 pointer-events-none z-[30]">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent rounded-full blur-sm"
          style={{
            left: baseX,
            top: baseY,
          }}
          animate={{
            x: mousePosition.x * (i * 8),
            y: mousePosition.y * (i * 8),
            opacity: [0, 0.6 - i * 0.03, 0],
            scale: [0, 1.5 - i * 0.05, 0],
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
            delay: i * 0.02,
          }}
        />
      ))}
    </div>
  )
}

export default function HeroSection({ content: propContent }: { content?: HeroContent }) {
  // Fetch content from CMS - this enables live updates from /admin
  const { getValue } = useContentSection('hero')
  const { openModal } = useOfferModal()

  // Build content object from CMS with fallbacks to props then defaults
  const content: HeroContent = useMemo(
    () => ({
      title: getValue('T1', propContent?.title || defaultContent.title),
      subtitle: getValue('T2', propContent?.subtitle || defaultContent.subtitle),
      ctaText: getValue('T3', propContent?.ctaText || defaultContent.ctaText),
      ctaSecondary: getValue('T4', propContent?.ctaSecondary || defaultContent.ctaSecondary),
      bgImage: getValue('B1', propContent?.bgImage || defaultContent.bgImage),
      bgVideo: getValue('V1', propContent?.bgVideo || defaultContent.bgVideo),
    }),
    [getValue, propContent]
  )

  // Use actual mounted state to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [enableBackgroundVideo, setEnableBackgroundVideo] = useState(false)

  // Set mounted on client to avoid hydration mismatch - use RAF to satisfy linter
  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHoveringButton, setIsHoveringButton] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(min-width: 1024px)').matches
  })

  // Theme hook for light/dark mode
  const { isLight } = useTheme()

  // Check for reduced motion preference and mobile device
  const shouldReduceMotion = useMemo(() => prefersReducedMotion(), [])

  // Delay background video to avoid stealing bandwidth/CPU from LCP.
  // Keeps the design (poster + animated overlays) while improving Lighthouse.
  useEffect(() => {
    if (shouldReduceMotion) return
    if (typeof window === 'undefined') return

    type NetworkInformation = { saveData?: boolean; effectiveType?: string }
    const conn = (navigator as unknown as { connection?: NetworkInformation }).connection
    const isSaveData = Boolean(conn?.saveData)
    const effectiveType = conn?.effectiveType ?? ''
    const isSlowConnection = ['slow-2g', '2g'].includes(effectiveType)

    if (isSaveData || isSlowConnection) return

    const t = window.setTimeout(() => setEnableBackgroundVideo(true), 2500)
    return () => window.clearTimeout(t)
  }, [shouldReduceMotion])

  // Desktop hero timing: start the hero text sequence a bit earlier on larger screens.
  // This is mount-based (not scroll-triggered), so we scale delays deterministically.
  const delayScale = useMemo(() => (isDesktop ? 0.6 : 1), [isDesktop])
  const d = useMemo(() => (value: number) => value * delayScale, [delayScale])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setIsDesktop(mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  // Removed useEffect - mounted is now true immediately for LCP optimization
  // Hero section renders immediately so LCP image can load right away

  // Track mouse position for 3D tilt and cursor effects with throttling
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const rafIdRef = useRef<number | null>(null)
  const lastUpdateRef = useRef(0)
  const isUpdatingRef = useRef(false)
  const pendingUpdateRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (shouldReduceMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      // Prevent multiple simultaneous updates
      if (isUpdatingRef.current) {
        // Store pending update instead of blocking
        const x = (e.clientX / window.innerWidth - 0.5) * 2
        const y = (e.clientY / window.innerHeight - 0.5) * 2
        pendingUpdateRef.current = { x, y }
        return
      }

      const now = performance.now()
      // Throttle to max 60fps (16.67ms between updates)
      if (now - lastUpdateRef.current < 16.67) return
      lastUpdateRef.current = now

      // Cancel previous animation frame if exists
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }

      // Calculate normalized mouse position
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2

      // Only update if values have changed significantly (reduces unnecessary re-renders)
      const currentPos = mousePositionRef.current
      const threshold = 0.01
      if (Math.abs(x - currentPos.x) > threshold || Math.abs(y - currentPos.y) > threshold) {
        mousePositionRef.current = { x, y }
        isUpdatingRef.current = true

        // Update state only when needed, wrapped in requestAnimationFrame for smooth updates
        rafIdRef.current = requestAnimationFrame(() => {
          // Check if there's a pending update that's more recent
          if (pendingUpdateRef.current) {
            const pending = pendingUpdateRef.current
            pendingUpdateRef.current = null

            // Use pending update if it's significantly different
            if (
              Math.abs(pending.x - mousePositionRef.current.x) > threshold ||
              Math.abs(pending.y - mousePositionRef.current.y) > threshold
            ) {
              mousePositionRef.current = pending
              setMousePosition(pending)
            } else {
              // Use current update
              setMousePosition(mousePositionRef.current)
            }
          } else {
            // Use functional update to avoid creating new objects unnecessarily
            setMousePosition((prev) => {
              // Only update if values actually changed
              if (
                Math.abs(prev.x - mousePositionRef.current.x) > threshold ||
                Math.abs(prev.y - mousePositionRef.current.y) > threshold
              ) {
                return mousePositionRef.current
              }
              return prev
            })
          }

          rafIdRef.current = null
          isUpdatingRef.current = false
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      isUpdatingRef.current = false
      pendingUpdateRef.current = null
    }
  }, [shouldReduceMotion])

  // Scroll-based parallax - using window scroll for better compatibility
  const { scrollYProgress } = useScroll({
    layoutEffect: false,
  })

  // Scroll progress for hero section specifically - triggers when scrolling down past hero
  // When hero is in view: progress = 0, when scrolled past: progress = 1
  // Adjusted offset to trigger earlier when header approaches text
  const { scrollYProgress: sectionScrollProgress } = useScroll({
    target: sectionRef,
    // Start animating as soon as the hero begins to move (earlier than before)
    offset: ['start start', 'end start'],
    layoutEffect: false,
  })

  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const imageY1 = useTransform(scrollYProgress, [0, 0.5], [0, -30])

  // Trigger text animations sooner so visitors don’t have to scroll as far
  // Use hero section progress (not global page scroll) so the effect starts earlier.
  const headingX = useTransform(sectionScrollProgress, [0, 0.35], [0, -200])
  const headingOpacity = useTransform(sectionScrollProgress, [0, 0.22], [1, 0])
  const subtitleX = useTransform(sectionScrollProgress, [0, 0.35], [0, 200])
  const subtitleOpacity = useTransform(sectionScrollProgress, [0, 0.22], [1, 0])

  // Generate stable particle positions (only on client) - memoized for performance
  const particles = useMemo(() => {
    if (!mounted) return []
    return Array.from({ length: 20 }, (_, i) => {
      // Use index as seed for consistent positioning
      const seed = i * 0.618033988749895 // Golden ratio for better distribution
      return {
        left: (seed * 100) % 100,
        top: (seed * 1.618 * 100) % 100,
        duration: 3 + (seed % 2),
        delay: seed % 2,
      }
    })
  }, [mounted])

  // Generate stable rain drops positions (deterministic for hydration)
  const rainDrops = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      // Use index as seed for consistent positioning
      const seed = i * 0.618033988749895 // Golden ratio for better distribution
      return {
        left: (seed * 100) % 100,
        delay: (seed * 0.1) % 2,
        duration: 1.5 + ((seed * 100) % 3) * 0.5,
      }
    })
  }, [])

  // 3D tilt transform based on mouse position - minimal effect
  const rotateX = useMemo(() => mousePosition.y * 0.5, [mousePosition.y])
  const rotateY = useMemo(() => mousePosition.x * 0.5, [mousePosition.x])

  // Setup background video playback rate
  useEffect(() => {
    if (!videoRef.current || shouldReduceMotion) return

    const video = videoRef.current

    const handleLoadedMetadata = () => {
      try {
        video.playbackRate = 0.2 // 20% of normal speed
      } catch {
        // Silently handle playback rate errors
      }
    }

    if (video.readyState >= 1) {
      // Video metadata already loaded
      handleLoadedMetadata()
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata, {
        once: true,
      })
    }

    // Try to play video
    video.play().catch(() => {
      // Silently handle autoplay errors
    })

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [shouldReduceMotion])

  return (
    <motion.section
      ref={sectionRef}
      className={`min-h-[100svh] flex items-center justify-center relative overflow-hidden z-10 transition-colors duration-500 pt-[calc(var(--header-offset)+3rem)] sm:pt-[calc(var(--header-offset)+2.5rem)] lg:pt-[calc(var(--header-offset)+2rem)] ${
        isLight ? 'bg-amber-50' : 'bg-black'
      }`}
      style={{
        position: 'relative',
        transform: shouldReduceMotion
          ? undefined
          : `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Floating geometric shapes */}
      {mounted && !shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none z-[2]">
          {Array.from({ length: 6 }).map((_, i) => {
            const size = 100 + (i % 3) * 50
            const left = (i * 137.5) % 100
            const top = (i * 1.618 * 100) % 100
            const delay = i * 0.5
            const duration = 8 + (i % 3) * 2

            return (
              <motion.div
                key={i}
                className="absolute border border-white/10"
                style={{
                  width: size,
                  height: size,
                  left: `${left}%`,
                  top: `${top}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, 20, 0],
                  rotate: [0, 90, 0],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />
            )
          })}
        </div>
      )}

      {/* Animated mesh gradient background */}
      {mounted && !shouldReduceMotion && (
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-30">
          <div
            className="w-full h-full"
            style={{
              background: `
                radial-gradient(at 20% 30%, rgba(0, 102, 255, 0.1) 0px, transparent 50%),
                radial-gradient(at 80% 70%, rgba(255, 0, 51, 0.1) 0px, transparent 50%),
                radial-gradient(at 50% 50%, rgba(0, 102, 255, 0.05) 0px, transparent 50%)
              `,
            }}
          />
        </div>
      )}

      {/* Cursor trail particles - optimized version */}
      {mounted && !shouldReduceMotion && !isHoveringButton && (
        <CursorTrail mousePosition={mousePosition} />
      )}
      {/* Dynamic background with image overlays - only render on client */}
      {/* Fixed positioning with z-[1] - video at bottom, image on top */}
      {mounted && (
        <motion.div className="absolute inset-0 z-[1] pointer-events-none" style={{ y }}>
          {/* Background video - delayed to prioritize LCP - LOWEST LAYER */}
          {!shouldReduceMotion && enableBackgroundVideo && (
            <div className="absolute inset-0 opacity-50 z-0">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                poster="/images/hero/hero-background.webp"
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.8) contrast(0.9)' }}
              >
                <source src={content.bgVideo} type="video/mp4" />
              </video>
              {/* Fade overlay for smoother blend */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />
            </div>
          )}

          {/* Main background pattern - hero-background.webp - ABOVE VIDEO */}
          <motion.div
            className="absolute inset-0 z-[1]"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1, scale: 1 }
                : {
                    opacity: [0.9, 1, 0.9],
                    scale: [1, 1.01, 1],
                  }
            }
            transition={
              shouldReduceMotion
                ? {}
                : {
                    opacity: {
                      duration: 8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                    scale: {
                      duration: 10,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                    initial: { duration: 2, ease: 'easeOut' },
                  }
            }
            style={{ y: imageY1, height: '100vh', width: '100%' }}
          >
            <motion.div
              className="relative w-full h-full"
              style={{ height: '100vh', width: '100%' }}
              animate={
                shouldReduceMotion
                  ? {}
                  : isLight
                    ? {
                        filter: [
                          'brightness(1.1) contrast(1) saturate(1.1)',
                          'brightness(1.15) contrast(1.05) saturate(1.15)',
                          'brightness(1.1) contrast(1) saturate(1.1)',
                        ],
                      }
                    : {
                        filter: [
                          'brightness(0.9) contrast(1)',
                          'brightness(1) contrast(1.05)',
                          'brightness(0.9) contrast(1)',
                        ],
                      }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Image
                src={
                  isLight
                    ? '/images/backgrounds/city-background-sunny.webp'
                    : '/images/hero/hero-background.webp'
                }
                alt="Stadsbild i skymning - Sajtstudio hero bakgrund"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
                className="object-cover"
                loading="eager"
                priority
                fetchPriority="high"
              />
            </motion.div>
            {/* Subtle glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-tertiary/8"
              animate={{
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Lightning flash effect - random intervals (dark mode only) */}
            {!shouldReduceMotion && !isLight && <LightningFlash />}
          </motion.div>

          {/* Elegant overlay with gradient - adapts to theme */}
          <div
            className={`absolute inset-0 ${
              isLight
                ? 'bg-gradient-to-b from-[#fef9e7]/30 via-transparent to-[#fff5e6]/40'
                : 'bg-gradient-to-b from-black/40 via-black/30 to-black/40'
            }`}
          />

          {/* Rain effect - only in dark mode */}
          {mounted && !shouldReduceMotion && !isLight && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
              {rainDrops.map((drop, i) => (
                <div
                  key={i}
                  className="absolute w-[1px] h-[20px] bg-white/40"
                  style={{
                    left: `${drop.left}%`,
                    top: '-20px',
                    animation: `rain ${drop.duration}s linear infinite`,
                    animationDelay: `${drop.delay}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Window flash effect - only in light mode */}
          {mounted && !shouldReduceMotion && isLight && <WindowFlash />}

          {/* Flying birds - only in light mode */}
          {mounted && !shouldReduceMotion && isLight && (
            <>
              <FlyingBird delay={0} startY={15} />
              <FlyingBird delay={5} startY={25} />
              <FlyingBird delay={10} startY={20} />
            </>
          )}
        </motion.div>
      )}

      {/* Static fallback for SSR */}
      {!mounted && (
        <div className="absolute inset-0 z-[1] bg-black">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-tertiary/15" />
        </div>
      )}

      {/* Animated background patterns - Subtle and elegant - only on client */}
      {mounted && (
        <motion.div
          className="absolute inset-0 z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          {/* Single subtle radial gradient */}
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,255,0.15),transparent_70%)]"
            animate={
              shouldReduceMotion
                ? { scale: 1, opacity: 0.125 }
                : {
                    scale: [1, 1.05, 1],
                    opacity: [0.1, 0.15, 0.1],
                  }
            }
            transition={
              shouldReduceMotion
                ? {}
                : {
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          />
        </motion.div>
      )}

      {/* Floating particles effect */}
      {mounted && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={
                shouldReduceMotion
                  ? { y: 0, opacity: 0.35 }
                  : {
                      y: [0, -30, 0],
                      opacity: [0.2, 0.5, 0.2],
                    }
              }
              transition={
                shouldReduceMotion
                  ? {}
                  : {
                      duration: particle.duration,
                      repeat: Infinity,
                      delay: particle.delay,
                    }
              }
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 max-w-6xl overflow-visible">
        <motion.div
          style={
            mounted
              ? {
                  opacity: typeof opacity === 'number' ? opacity : (opacity?.get?.() ?? 1),
                }
              : { opacity: 1 }
          }
          className="overflow-visible"
          suppressHydrationWarning
        >
          {/* Main heading with massive impact */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            aria-label="Bygger hemsidor som betyder någonting."
            style={
              mounted
                ? {
                    opacity:
                      typeof headingOpacity === 'number'
                        ? headingOpacity
                        : (headingOpacity?.get?.() ?? 1),
                    x: typeof headingX === 'number' ? headingX : (headingX?.get?.() ?? 0),
                  }
                : {
                    opacity: 1,
                    x: 0,
                  }
            }
            className="text-5xl sm:text-6xl md:text-7xl lg:text-display font-black leading-[0.9] tracking-tight mb-6 sm:mb-8 text-white text-center relative overflow-visible"
            suppressHydrationWarning
          >
            {/* Accessibility/SEO: ensure a single readable heading string (avoid letter-by-letter animation output) */}
            <span className="sr-only">Bygger hemsidor som betyder någonting.</span>
            <span aria-hidden="true">
              {/* Shimmer effect overlay - only render on client to avoid hydration mismatch */}
              {mounted && !shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-30"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'linear',
                  }}
                  style={{
                    backgroundSize: '50% 100%',
                  }}
                />
              )}
              <motion.span
                className="block relative group"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: d(0.2), duration: 0.8 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <AnimatedText
                  text="Bygger"
                  scrollProgress={sectionScrollProgress}
                  shouldReduceMotion={shouldReduceMotion}
                  mounted={mounted}
                />
                <motion.span
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-accent via-tertiary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: d(1), duration: 0.6 }}
                />
              </motion.span>
              <motion.span
                className="block relative group whitespace-nowrap"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: d(0.4), duration: 0.8, type: 'spring' }}
              >
                <HemsidorWords
                  scrollProgress={sectionScrollProgress}
                  shouldReduceMotion={shouldReduceMotion}
                  mounted={mounted}
                  className="text-hero md:text-display font-black"
                />
              </motion.span>
              <motion.span
                className="block relative group"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: d(0.6), duration: 0.8 }}
                whileHover={{ scale: 1.02, x: -5 }}
              >
                <AnimatedText
                  text="som betyder"
                  scrollProgress={sectionScrollProgress}
                  shouldReduceMotion={shouldReduceMotion}
                  mounted={mounted}
                />
              </motion.span>
              <motion.span
                className="block relative group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d(0.8), duration: 0.8 }}
                whileHover={{ scale: 1.02 }}
              >
                <NattenWords
                  scrollProgress={sectionScrollProgress}
                  shouldReduceMotion={shouldReduceMotion}
                  mounted={mounted}
                />
                <motion.span
                  className="inline-block ml-0"
                  animate={{
                    color: ['#ffffff', '#ffffff', '#ff0033', '#ff0033', '#ffffff'],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    times: [0, 0.4, 0.5, 0.9, 1],
                  }}
                >
                  .
                </motion.span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                />
              </motion.span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: d(1),
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={
              mounted
                ? {
                    opacity:
                      typeof subtitleOpacity === 'number'
                        ? subtitleOpacity
                        : (subtitleOpacity?.get?.() ?? 1),
                    x: typeof subtitleX === 'number' ? subtitleX : (subtitleX?.get?.() ?? 0),
                  }
                : {
                    opacity: 1,
                    x: 0,
                  }
            }
            className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-12 text-center leading-relaxed relative group"
            suppressHydrationWarning
          >
            <motion.span
              className="inline-block"
              whileHover={{ scale: 1.05, color: '#FFFFFF' }}
              transition={{ duration: 0.2 }}
            >
              <AnimatedText
                text="Vi skapar skräddarsydda webbplatser och AI-genererade sajter"
                scrollProgress={sectionScrollProgress}
                shouldReduceMotion={shouldReduceMotion}
                mounted={mounted}
              />
            </motion.span>{' '}
            <motion.span
              className="inline-block text-accent font-semibold"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatedText
                text="för företag som vill sticka ut eller snabbt komma igång"
                scrollProgress={sectionScrollProgress}
                shouldReduceMotion={shouldReduceMotion}
                mounted={mounted}
              />
            </motion.span>{' '}
            <motion.span
              className="inline-block"
              whileHover={{ scale: 1.05, color: '#FFFFFF' }}
              transition={{ duration: 0.2 }}
            >
              <AnimatedText
                text="och leda inom sin bransch."
                scrollProgress={sectionScrollProgress}
                shouldReduceMotion={shouldReduceMotion}
                mounted={mounted}
              />
            </motion.span>
          </motion.p>

          {/* CTA buttons with magnetic effect */}
          {/* Primary hero CTAs:
              - Left button: Links to /utvardera (internal evaluation flow)
              - Right button: Links to Sajtmaskin (external app) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: d(1.2),
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* Primary CTA: Website evaluation - Blue with cool animations */}
            <MagneticButton
              href="/utvardera"
              external={false}
              className="px-10 py-5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-bold text-lg rounded-lg hover:from-blue-500 hover:via-cyan-500 hover:to-blue-600 transition-all duration-500 shadow-[0_0_30px_rgba(0,102,255,0.5)] hover:shadow-[0_0_50px_rgba(0,102,255,0.8)] relative overflow-hidden group border border-white/20"
              shouldReduceMotion={shouldReduceMotion}
              mousePosition={mousePosition}
              onHoverChange={setIsHoveringButton}
            >
              {/* Animated gradient overlay */}
              {!shouldReduceMotion && (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}
              {/* Pulsing glow ring */}
              {!shouldReduceMotion && (
                <motion.span
                  className="absolute inset-0 rounded-lg border-2 border-cyan-400/50"
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
              {/* Electric spark effect */}
              {!shouldReduceMotion && (
                <motion.span
                  className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-60"
                  animate={{
                    x: ['-100px', '100px'],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3 font-black tracking-wide">
                Utvärdera din sajt
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </motion.svg>
              </span>
            </MagneticButton>

            {/* Secondary CTA: Build website - Opens modal for under construction site */}
            <MagneticButton
              onClick={openModal}
              className="px-10 py-5 bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 text-white font-black text-lg uppercase tracking-wider rounded-lg hover:from-orange-500 hover:via-red-500 hover:to-rose-600 transition-all duration-500 shadow-[0_0_30px_rgba(255,0,51,0.5)] hover:shadow-[0_0_50px_rgba(255,0,51,0.8)] relative overflow-hidden group border border-white/20"
              shouldReduceMotion={shouldReduceMotion}
              mousePosition={mousePosition}
              onHoverChange={setIsHoveringButton}
            >
              {/* Fire/heat wave effect */}
              {!shouldReduceMotion && (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-t from-orange-600/40 via-transparent to-transparent"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                  }}
                />
              )}
              {/* Shimmer effect */}
              {!shouldReduceMotion && (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                {content.ctaSecondary}
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{
                    x: [0, 3, 0],
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </motion.svg>
              </span>
            </MagneticButton>
          </motion.div>

          {/* Animated accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: d(1.5),
              duration: 1.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="mt-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent origin-center"
          />
        </motion.div>
      </div>
    </motion.section>
  )
}
