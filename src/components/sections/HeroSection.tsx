"use client";

import HemsidorWords from "@/components/animations/HemsidorWords";
import NattenWords from "@/components/animations/NattenWords";
import { prefersReducedMotion } from "@/lib/performance";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

// Magnetic button component that follows mouse
function MagneticButton({
  href,
  children,
  className,
  shouldReduceMotion,
  mousePosition,
  onHoverChange,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  shouldReduceMotion: boolean;
  mousePosition: { x: number; y: number };
  onHoverChange?: (hovering: boolean) => void;
}) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion || !isHovered) {
      setButtonPosition({ x: 0, y: 0 });
      return;
    }

    let rafId: number;
    let lastUpdateTime = 0;
    const throttleMs = 16; // ~60fps

    const updatePosition = (currentTime: number) => {
      // Throttle updates to ~60fps
      if (currentTime - lastUpdateTime < throttleMs) {
        rafId = requestAnimationFrame(updatePosition);
        return;
      }
      lastUpdateTime = currentTime;

      if (!buttonRef.current || typeof window === 'undefined') {
        rafId = requestAnimationFrame(updatePosition);
        return;
      }

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = mousePosition.x * (window.innerWidth / 2) + (window.innerWidth / 2);
      const mouseY = mousePosition.y * (window.innerHeight / 2) + (window.innerHeight / 2);

      const distanceX = mouseX - centerX;
      const distanceY = mouseY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Magnetic effect only works within certain distance
      if (distance < 150) {
        const strength = (150 - distance) / 150;
        setButtonPosition({
          x: distanceX * strength * 0.3,
          y: distanceY * strength * 0.3,
        });
      } else {
        setButtonPosition({ x: 0, y: 0 });
      }

      rafId = requestAnimationFrame(updatePosition);
    };

    rafId = requestAnimationFrame(updatePosition);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mousePosition, isHovered, shouldReduceMotion]);

  return (
    <motion.a
      ref={buttonRef}
      href={href}
      onMouseEnter={() => {
        setIsHovered(true);
        onHoverChange?.(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHoverChange?.(false);
        setButtonPosition({ x: 0, y: 0 });
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 0 40px rgba(0, 102, 255, 0.6)",
      }}
      whileTap={{ scale: 0.95 }}
      className={className}
      style={{
        x: shouldReduceMotion ? 0 : buttonPosition.x,
        y: shouldReduceMotion ? 0 : buttonPosition.y,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.a>
  );
}

// Lightning flash component - flashes with deterministic timing to avoid hydration mismatch
function LightningFlash() {
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let flashTimeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;
    let flashCounter = 0;

    // Deterministic seed function using golden ratio for better distribution
    const getDeterministicValue = (counter: number, range: number, offset: number = 0) => {
      const seed = (counter * 0.618033988749895) % 1; // Golden ratio
      return offset + seed * range;
    };

    const flashInterval = () => {
      if (!isMounted) return;

      // Deterministic delay between 4-10 seconds based on counter
      const delay = 4000 + getDeterministicValue(flashCounter, 6000);
      timeoutId = setTimeout(() => {
        if (!isMounted) return;

        // Deterministic flash count based on counter
        const seed = (flashCounter * 0.618033988749895) % 1;
        const flashes = seed > 0.3 ? 2 : 1; // ~70% single, ~30% double
        let flashCount = 0;

        const doFlash = () => {
          if (!isMounted) return;

          setFlash(1);
          flashTimeoutId = setTimeout(() => {
            if (!isMounted) return;

            setFlash(0);
            flashCount++;
            if (flashCount < flashes) {
              const nextDelay = 50 + getDeterministicValue(flashCounter + flashCount, 100);
              flashTimeoutId = setTimeout(() => doFlash(), nextDelay);
            } else {
              flashCounter++;
              flashInterval();
            }
          }, 80 + getDeterministicValue(flashCounter + flashCount, 120));
        };

        doFlash();
      }, delay);
    };

    flashInterval();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (flashTimeoutId) clearTimeout(flashTimeoutId);
    };
  }, []);

  return (
    <>
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none z-10"
        animate={{
          opacity: flash === 1 ? [0, 0.5, 0.2, 0] : 0,
        }}
        transition={{
          duration: 0.15,
          ease: "easeOut",
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
          ease: "easeOut",
        }}
      />
    </>
  );
}

// Optimized text animation - animates whole block instead of individual letters
// Uses transform/opacity for GPU-accelerated animations without layout thrashing
function AnimatedText({
  text,
  className,
  scrollProgress,
  shouldReduceMotion,
  mounted
}: {
  text: string;
  className?: string;
  scrollProgress: MotionValue<number>;
  shouldReduceMotion: boolean;
  mounted: boolean;
}) {
  // Use transform and opacity only - GPU-composited, no layout work
  const y = useTransform(
    scrollProgress,
    [0, 0.5, 1],
    [0, -50, -100]
  );
  const opacity = useTransform(
    scrollProgress,
    [0, 0.5, 0.9],
    [1, 1, 0]
  );
  const scale = useTransform(
    scrollProgress,
    [0, 0.5, 0.95],
    [1, 1, 0.8]
  );

  // Only apply animations when mounted to prevent hydration mismatch
  if (!mounted || shouldReduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      className={className}
      style={{
        y: y ?? 0,
        opacity: opacity ?? 1,
        scale: scale ?? 1,
        display: 'inline-block',
        // Only use will-change when animating to avoid unnecessary repaints
        willChange: shouldReduceMotion ? 'auto' : 'transform, opacity',
      }}
    >
      {text}
    </motion.span>
  );
}

// Optimized cursor trail component
function CursorTrail({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener('resize', updateSize, { passive: true });
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const particles = useMemo(() => Array.from({ length: 15 }), []);
  const baseX = useMemo(() => {
    if (windowSize.width === 0) return 0;
    return mousePosition.x * (windowSize.width / 2) + (windowSize.width / 2);
  }, [mousePosition.x, windowSize.width]);
  const baseY = useMemo(() => {
    if (windowSize.height === 0) return 0;
    return mousePosition.y * (windowSize.height / 2) + (windowSize.height / 2);
  }, [mousePosition.y, windowSize.height]);

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
            ease: "easeOut",
            delay: i * 0.02,
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  // Check for reduced motion preference
  const shouldReduceMotion = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track mouse position for 3D tilt and cursor effects with throttling
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);
  const isUpdatingRef = useRef(false);
  const pendingUpdateRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Prevent multiple simultaneous updates
      if (isUpdatingRef.current) {
        // Store pending update instead of blocking
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        pendingUpdateRef.current = { x, y };
        return;
      }

      const now = performance.now();
      // Throttle to max 60fps (16.67ms between updates)
      if (now - lastUpdateRef.current < 16.67) return;
      lastUpdateRef.current = now;

      // Cancel previous animation frame if exists
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // Calculate normalized mouse position
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      // Only update if values have changed significantly (reduces unnecessary re-renders)
      const currentPos = mousePositionRef.current;
      const threshold = 0.01;
      if (Math.abs(x - currentPos.x) > threshold || Math.abs(y - currentPos.y) > threshold) {
        mousePositionRef.current = { x, y };
        isUpdatingRef.current = true;

        // Update state only when needed, wrapped in requestAnimationFrame for smooth updates
        rafIdRef.current = requestAnimationFrame(() => {
          // Check if there's a pending update that's more recent
          if (pendingUpdateRef.current) {
            const pending = pendingUpdateRef.current;
            pendingUpdateRef.current = null;

            // Use pending update if it's significantly different
            if (Math.abs(pending.x - mousePositionRef.current.x) > threshold ||
              Math.abs(pending.y - mousePositionRef.current.y) > threshold) {
              mousePositionRef.current = pending;
              setMousePosition(pending);
            } else {
              // Use current update
              setMousePosition(mousePositionRef.current);
            }
          } else {
            // Use functional update to avoid creating new objects unnecessarily
            setMousePosition((prev) => {
              // Only update if values actually changed
              if (Math.abs(prev.x - mousePositionRef.current.x) > threshold ||
                Math.abs(prev.y - mousePositionRef.current.y) > threshold) {
                return mousePositionRef.current;
              }
              return prev;
            });
          }

          rafIdRef.current = null;
          isUpdatingRef.current = false;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      isUpdatingRef.current = false;
      pendingUpdateRef.current = null;
    };
  }, [shouldReduceMotion]);

  // Scroll-based parallax - using window scroll for better compatibility
  const { scrollYProgress } = useScroll({
    layoutEffect: false,
  });

  // Scroll progress for hero section specifically - triggers when scrolling down past hero
  // When hero is in view: progress = 0, when scrolled past: progress = 1
  // Adjusted offset to trigger earlier when header approaches text
  const { scrollYProgress: sectionScrollProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end start"], // Trigger when section center passes viewport top
    layoutEffect: false,
  });

  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const imageY1 = useTransform(scrollYProgress, [0, 0.5], [0, -30]);

  // Trigger text animations sooner so visitors don’t have to scroll as far
  const headingX = useTransform(scrollYProgress, [0, 0.25], [0, -200]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const subtitleX = useTransform(scrollYProgress, [0, 0.25], [0, 200]);
  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Generate stable particle positions (only on client) - memoized for performance
  const particles = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 20 }, (_, i) => {
      // Use index as seed for consistent positioning
      const seed = i * 0.618033988749895; // Golden ratio for better distribution
      return {
        left: (seed * 100) % 100,
        top: (seed * 1.618 * 100) % 100,
        duration: 3 + (seed % 2),
        delay: seed % 2,
      };
    });
  }, [mounted]);

  // Generate stable rain drops positions (deterministic for hydration)
  const rainDrops = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      // Use index as seed for consistent positioning
      const seed = i * 0.618033988749895; // Golden ratio for better distribution
      return {
        left: (seed * 100) % 100,
        delay: (seed * 0.1) % 2,
        duration: 1.5 + ((seed * 100) % 3) * 0.5,
      };
    });
  }, []);

  // 3D tilt transform based on mouse position - minimal effect
  const rotateX = useMemo(() => mousePosition.y * 0.5, [mousePosition.y]);
  const rotateY = useMemo(() => mousePosition.x * 0.5, [mousePosition.x]);

  // Setup background video playback rate
  useEffect(() => {
    if (!videoRef.current || shouldReduceMotion) return;

    const video = videoRef.current;

    const handleLoadedMetadata = () => {
      try {
        video.playbackRate = 0.2; // 20% of normal speed
      } catch (error) {
        // Silently handle playback rate errors
      }
    };

    if (video.readyState >= 1) {
      // Video metadata already loaded
      handleLoadedMetadata();
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    }

    // Try to play video
    video.play().catch(() => {
      // Silently handle autoplay errors
    });

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [shouldReduceMotion]);

  return (
    <motion.section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black z-10"
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
            const size = 100 + (i % 3) * 50;
            const left = (i * 137.5) % 100;
            const top = ((i * 1.618) * 100) % 100;
            const delay = i * 0.5;
            const duration = 8 + (i % 3) * 2;

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
                  ease: "easeInOut",
                }}
              />
            );
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
          {/* Background video - subtle faded layer at 50% opacity, 20% speed - LOWEST LAYER */}
          {!shouldReduceMotion && (
            <div className="absolute inset-0 opacity-50 z-0">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/images/hero/hero-background.webp"
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.8) contrast(0.9)' }}
              >
                <source src="/videos/background.mp4" type="video/mp4" />
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
                  opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                  initial: { duration: 2, ease: "easeOut" },
                }
            }
            style={{ y: imageY1 }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={
                shouldReduceMotion
                  ? {}
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
                ease: "easeInOut",
              }}
            >
              <Image
                src="/images/hero/hero-background.webp"
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                loading="eager" // ensures LCP image is loaded immediately
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
                ease: "easeInOut",
              }}
            />
            {/* Lightning flash effect - random intervals */}
            {!shouldReduceMotion && (
              <LightningFlash />
            )}
          </motion.div>

          {/* Elegant dark overlay with gradient - lighter so image is visible but still dimmed */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" />

          {/* Rain effect - only render when mounted to avoid hydration mismatch */}
          {mounted && !shouldReduceMotion && (
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
                  ease: "easeInOut",
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
        <motion.div style={mounted ? {
          opacity: typeof opacity === 'number' ? opacity : (opacity?.get?.() ?? 1)
        } : { opacity: 1 }} className="overflow-visible" suppressHydrationWarning>
          {/* Main heading with massive impact */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            style={mounted ? {
              opacity: typeof headingOpacity === 'number' ? headingOpacity : (headingOpacity?.get?.() ?? 1),
              x: typeof headingX === 'number' ? headingX : (headingX?.get?.() ?? 0),
            } : {
              opacity: 1,
              x: 0,
            }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-display font-black leading-[0.9] tracking-tight mb-6 sm:mb-8 text-white text-center relative overflow-visible"
            suppressHydrationWarning
          >
            {/* Shimmer effect overlay - only render on client to avoid hydration mismatch */}
            {mounted && !shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-30"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "50% 100%",
                }}
              />
            )}
            <motion.span
              className="block relative group"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
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
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 0.6 }}
              />
            </motion.span>
            <motion.span
              className="block relative group whitespace-nowrap"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
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
              transition={{ delay: 0.6, duration: 0.8 }}
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
              transition={{ delay: 0.8, duration: 0.8 }}
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
                  color: ["#ffffff", "#ffffff", "#ff0033", "#ff0033", "#ffffff"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
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
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            style={mounted ? {
              opacity: typeof subtitleOpacity === 'number' ? subtitleOpacity : (subtitleOpacity?.get?.() ?? 1),
              x: typeof subtitleX === 'number' ? subtitleX : (subtitleX?.get?.() ?? 0),
            } : {
              opacity: 1,
              x: 0,
            }}
            className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-12 text-center leading-relaxed relative group"
            suppressHydrationWarning
          >
            <motion.span
              className="inline-block"
              whileHover={{ scale: 1.05, color: "#FFFFFF" }}
              transition={{ duration: 0.2 }}
            >
              <AnimatedText
                text="Vi skapar skräddarsydda, toppmoderna webbplatser"
                scrollProgress={sectionScrollProgress}
                shouldReduceMotion={shouldReduceMotion}
                mounted={mounted}
              />
            </motion.span>
            {" "}
            <motion.span
              className="inline-block text-accent font-semibold"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatedText
                text="för företag som vill sticka ut"
                scrollProgress={sectionScrollProgress}
                shouldReduceMotion={shouldReduceMotion}
                mounted={mounted}
              />
            </motion.span>
            {" "}
            <motion.span
              className="inline-block"
              whileHover={{ scale: 1.05, color: "#FFFFFF" }}
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1.2,
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <MagneticButton
              href="/utvardera"
              className="px-10 py-5 bg-accent text-white font-bold text-lg rounded-none hover:bg-accent-hover transition-all duration-300 shadow-lg shadow-accent/50 relative overflow-hidden group"
              shouldReduceMotion={shouldReduceMotion}
              mousePosition={mousePosition}
              onHoverChange={setIsHoveringButton}
            >
              {!shouldReduceMotion && (
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
              <motion.span
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                Utvärdera sin sajt idag
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  →
                </motion.span>
              </span>
            </MagneticButton>
            <MagneticButton
              href="/portfolio"
              className="px-10 py-5 border-2 border-white text-white font-bold text-lg rounded-none hover:bg-white hover:text-black transition-all duration-300 relative overflow-hidden group"
              shouldReduceMotion={shouldReduceMotion}
              mousePosition={mousePosition}
              onHoverChange={setIsHoveringButton}
            >
              <motion.span
                className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-10"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                Se våra arbeten
                <motion.span
                  animate={{ rotate: [0, 15, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  ↗
                </motion.span>
              </span>
            </MagneticButton>
          </motion.div>

          {/* Animated accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: 1.5,
              duration: 1.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="mt-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent origin-center"
          />
        </motion.div>
      </div>

      {/* Modern scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-xs font-medium tracking-wider uppercase">
            Scrolla
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-current"
          >
            <path
              d="M10 4v10m0 0l-3-3m3 3l3-3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
