"use client";

import {
  motion,
  MotionValue,
  useTransform,
  useMotionValue,
} from "framer-motion";
import { useMemo } from "react";

interface NattenWordsProps {
  scrollProgress?: MotionValue<number>;
  shouldReduceMotion?: boolean;
  mounted?: boolean;
  className?: string;
}

export default function NattenWords({
  scrollProgress,
  shouldReduceMotion = false,
  mounted = true,
  className = "",
}: NattenWordsProps) {
  const text = "någonting";
  const letters = useMemo(() => text.split(""), [text]);

  // Create fallback MotionValue for SSR safety - hooks must be called directly
  const fallbackProgress = useMotionValue(0);
  const progress = scrollProgress || fallbackProgress;

  // Scroll-based animations - tuned to start earlier while the hero is still in view
  const yTransform = useTransform(progress, [0, 0.2, 0.6, 1], [0, -8, -60, -95]);
  const opacityTransform = useTransform(progress, [0, 0.25, 0.55], [1, 1, 0]);

  const y = scrollProgress ? yTransform : undefined;
  const opacity = scrollProgress ? opacityTransform : undefined;

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

  return (
    <motion.span
      className={className}
      aria-label={text}
      style={{
        y: y ?? 0,
        opacity: typeof opacity === "number" ? opacity : opacity?.get?.() ?? 1,
        display: "inline-block",
      }}
      suppressHydrationWarning
    >
      <span aria-hidden="true">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            className="inline-block"
            aria-hidden="true"
            initial={{ opacity: 0, y: 50, rotateX: -90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            whileHover={{
              scale: 1.2,
              y: -10,
              color: "#0066FF",
              transition: { duration: 0.2 },
            }}
            style={{
              display: "inline-block",
              transformStyle: "preserve-3d",
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
}
