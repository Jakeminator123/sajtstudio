"use client";

import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { isMobileDevice } from "@/lib/performance";

interface BrandRevealProps {
  text?: string;
  className?: string;
}

/**
 * BrandReveal - Beautiful animated text reveal for "Vi är Sajtstudio"
 *
 * Features:
 * - Smooth letter-by-letter reveal (not scroll-dependent)
 * - Beautiful gradient animation
 * - Subtle glow effect
 * - Mobile-optimized (reduced animations on mobile)
 */
export default function BrandReveal({
  text = "Vi är Sajtstudio",
  className = ""
}: BrandRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "150px" });
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice() || window.innerWidth < 768);
  }, []);

  const words = text.split(" ");

  // Simple reveal for reduced motion or mobile
  if (prefersReducedMotion || isMobile) {
    return (
      <span
        className={`inline-block ${className}`}
        style={{
          // Prevent text blurriness on mobile
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "optimizeLegibility",
        }}
      >
        <motion.span
          className="bg-gradient-to-r from-white via-blue-400 to-rose-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {text}
        </motion.span>
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={`inline-block relative ${className}`}
      style={{
        // Prevent text blurriness
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
      }}
    >
      {/* Background glow - subtle, not scroll-dependent */}
      <motion.span
        className="absolute inset-0 blur-2xl opacity-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-rose-500/30 -z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 0.6, scale: 1.2 } : {}}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Animated words */}
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em]">
          {word.split("").map((letter, letterIndex) => {
            const totalIndex = wordIndex * 3 + letterIndex; // Stagger calculation

            return (
              <motion.span
                key={letterIndex}
                className="inline-block relative"
                initial={{
                  opacity: 0,
                  y: 30,
                  rotateX: -90,
                }}
                animate={isInView ? {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                } : {}}
                transition={{
                  duration: 0.6,
                  delay: totalIndex * 0.04,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                style={{
                  perspective: "500px",
                  // Prevent text blurriness during transforms
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {/* Main letter with animated gradient */}
                <motion.span
                  className="relative inline-block"
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #60a5fa 40%, #f472b6 70%, #ffffff 100%)",
                    backgroundSize: "300% 300%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {letter}
                </motion.span>

                {/* Subtle shimmer on each letter */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={isInView ? { x: "100%", opacity: [0, 0.5, 0] } : {}}
                  transition={{
                    duration: 0.8,
                    delay: totalIndex * 0.04 + 0.3,
                    ease: "easeInOut",
                  }}
                />
              </motion.span>
            );
          })}
        </span>
      ))}

      {/* Underline animation */}
      <motion.span
        className="absolute -bottom-2 left-0 h-1 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500"
        initial={{ width: 0, opacity: 0 }}
        animate={isInView ? { width: "100%", opacity: 1 } : {}}
        transition={{
          duration: 0.8,
          delay: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />
    </span>
  );
}

