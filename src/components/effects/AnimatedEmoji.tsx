"use client";

import { motion, Variants } from "framer-motion";

type EmojiAnimation = "pulse" | "bounce" | "spin" | "shake" | "float" | "glow" | "rocket" | "brain";

interface AnimatedEmojiProps {
  emoji: string;
  animation?: EmojiAnimation;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

const animations: Record<EmojiAnimation, Variants> = {
  pulse: {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  bounce: {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  spin: {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },
  shake: {
    animate: {
      rotate: [-5, 5, -5],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  float: {
    animate: {
      y: [0, -5, 0],
      x: [0, 2, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  glow: {
    animate: {
      filter: [
        "drop-shadow(0 0 0px rgba(255,255,255,0))",
        "drop-shadow(0 0 8px rgba(255,255,255,0.8))",
        "drop-shadow(0 0 0px rgba(255,255,255,0))",
      ],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  rocket: {
    animate: {
      y: [0, -6, 0],
      rotate: [0, -5, 5, 0],
      scale: [1, 1.1, 1],
      filter: [
        "drop-shadow(0 0 0px rgba(251,146,60,0))",
        "drop-shadow(0 4px 12px rgba(251,146,60,0.6))",
        "drop-shadow(0 0 0px rgba(251,146,60,0))",
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  brain: {
    animate: {
      scale: [1, 1.08, 1],
      filter: [
        "drop-shadow(0 0 0px rgba(168,85,247,0)) hue-rotate(0deg)",
        "drop-shadow(0 0 12px rgba(168,85,247,0.7)) hue-rotate(10deg)",
        "drop-shadow(0 0 0px rgba(168,85,247,0)) hue-rotate(0deg)",
      ],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

export default function AnimatedEmoji({
  emoji,
  animation = "pulse",
  size = "md",
  className = "",
}: AnimatedEmojiProps) {
  const variants = animations[animation];

  return (
    <motion.span
      className={`inline-block ${sizeClasses[size]} ${className}`}
      variants={variants}
      animate="animate"
      style={{ willChange: "transform, filter" }}
    >
      {emoji}
    </motion.span>
  );
}

