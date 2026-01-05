"use client";

import { motion, MotionValue, useTransform, useMotionValue } from "framer-motion";
import { useMemo, useEffect, useState } from "react";
import { isMobileDevice } from "@/lib/performance";

interface HemsidorWordsProps {
  scrollProgress?: MotionValue<number>;
  shouldReduceMotion?: boolean;
  mounted?: boolean;
  className?: string;
}

export default function HemsidorWords({
  scrollProgress,
  shouldReduceMotion = false,
  mounted = true,
  className = "",
}: HemsidorWordsProps) {
  const text = "hemsidor";
  const letters = useMemo(() => text.split(""), [text]);

  // Detect mobile for performance optimization
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(isMobileDevice() || window.innerWidth < 768);
  }, []);

  // Create fallback MotionValue for SSR safety - hooks must be called directly
  const fallbackProgress = useMotionValue(0);
  const progress = scrollProgress || fallbackProgress;

  // Scroll-based animations - tuned to start earlier while the hero is still in view
  const yTransform = useTransform(progress, [0, 0.2, 0.6, 1], [0, -10, -70, -110]);
  const opacityTransform = useTransform(progress, [0, 0.25, 0.55], [1, 1, 0]);

  const y = scrollProgress ? yTransform : undefined;
  const opacity = scrollProgress ? opacityTransform : undefined;

  // Use reduced animations on mobile or when user prefers reduced motion
  const useSimpleAnimations = shouldReduceMotion || isMobile;

  // Only apply animations when mounted to prevent hydration mismatch
  if (!mounted || shouldReduceMotion) {
    return (
      <span className={className} aria-label={text}>
        <span aria-hidden="true">
          {letters.map((letter, index) => (
            <span key={index} className="inline-block" aria-hidden="true">
              {letter}
            </span>
          ))}
        </span>
      </span>
    );
  }

  // MOBILE: Simple optimized version without heavy effects
  if (isMobile) {
    return (
      <motion.span
        className={`${className} relative inline-block`}
        aria-label={text}
        style={{
          y: y ?? 0,
          opacity: typeof opacity === 'number' ? opacity : (opacity?.get?.() ?? 1),
        }}
        suppressHydrationWarning
      >
        <span aria-hidden="true">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              className="inline-block relative text-accent font-black"
              aria-hidden="true"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.04,
                duration: 0.4,
                ease: "easeOut",
              }}
              style={{
                textShadow: "0 0 20px rgba(0, 102, 255, 0.5)",
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </span>
      </motion.span>
    );
  }

  // DESKTOP: Full animations with effects
  return (
    <motion.span
      className={`${className} relative inline-block`}
      aria-label={text}
      style={{
        y: y ?? 0,
        opacity: typeof opacity === 'number' ? opacity : (opacity?.get?.() ?? 1),
      }}
      suppressHydrationWarning
    >
      <span aria-hidden="true">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            className="inline-block relative mx-0.5 md:mx-1"
            aria-hidden="true"
            initial={{ opacity: 0, y: 60, rotateX: -90, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            transition={{
              delay: index * 0.08,
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            whileHover={{
              scale: 1.4,
              y: -20,
              rotateY: 15,
              transition: { duration: 0.3, type: "spring", stiffness: 300 },
            }}
            style={{
              display: "inline-block",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Main letter with animated gradient */}
            <motion.span
              className="relative z-20 bg-clip-text text-transparent font-black"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #0066FF, #3385FF, #66B3FF, #0066FF, #3385FF)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              animate={
                useSimpleAnimations
                  ? undefined
                  : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
              }
              transition={
                useSimpleAnimations
                  ? undefined
                  : { duration: 4, repeat: Infinity, ease: "linear" }
              }
              suppressHydrationWarning
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>

            {/* Strong glowing shadow effect behind each letter - DESKTOP ONLY */}
            {!useSimpleAnimations && (
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-accent via-accent-light to-accent blur-lg opacity-70 -z-10"
                animate={{
                  opacity: [0.5, 0.9, 0.5],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 2.5 + index * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.12,
                }}
              />
            )}

            {/* Outer glow ring that pulses - DESKTOP ONLY */}
            {!useSimpleAnimations && (
              <motion.span
                className="absolute inset-0 rounded-lg border-2 border-accent/60"
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [1, 1.6, 1.6],
                  boxShadow: [
                    "0 0 0px rgba(0, 102, 255, 0)",
                    "0 0 20px rgba(0, 102, 255, 0.6)",
                    "0 0 0px rgba(0, 102, 255, 0)",
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: index * 0.18,
                }}
              />
            )}

            {/* Subtle shimmer effect - DESKTOP ONLY */}
            {!useSimpleAnimations && (
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -z-5"
                style={{
                  transform: "skewX(-20deg)",
                }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 0.2,
                  repeatDelay: 1,
                }}
              />
            )}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
}

