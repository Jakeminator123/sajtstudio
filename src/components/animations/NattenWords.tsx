"use client";

import { motion, MotionValue, useTransform } from "framer-motion";
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
  const text = "NATTEN";
  const letters = useMemo(() => text.split(""), [text]);

  // Scroll-based animations if scrollProgress is provided
  const y = scrollProgress
    ? useTransform(scrollProgress, [0, 0.5, 1], [0, -50, -100])
    : undefined;
  const opacity = scrollProgress
    ? useTransform(scrollProgress, [0, 0.5, 0.9], [1, 1, 0])
    : undefined;

  // Only apply animations when mounted to prevent hydration mismatch
  if (!mounted || shouldReduceMotion) {
    return (
      <span className={className}>
        {letters.map((letter, index) => (
          <span key={index} className="inline-block">
            {letter}
          </span>
        ))}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      style={{
        y: y ?? 0,
        opacity: typeof opacity === 'number' ? opacity : (opacity?.get?.() ?? 1),
        display: "inline-block",
        willChange: "transform, opacity",
      }}
      suppressHydrationWarning
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="inline-block"
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
            willChange: "transform, opacity",
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
  );
}
