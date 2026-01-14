"use client";

import { motion } from "framer-motion";

interface FloatingIconsProps {
  icons?: string[];
  count?: number;
}

// Deterministic seed function using golden ratio for consistent values
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return Math.abs(x - Math.floor(x));
}

export default function FloatingIcons({
  icons = ["🚀", "⚡", "✨", "💡", "🎯", "🔥", "💎", "🌟", "⭐", "🎨"],
  count = 10,
}: FloatingIconsProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => {
        const seed = i * 0.618033988749895; // Golden ratio
        const randomIcon = icons[Math.floor(seededRandom(seed) * icons.length)];
        const randomX = seededRandom(seed + 1) * 100;
        const randomDelay = seededRandom(seed + 2) * 5;
        const randomDuration = 15 + seededRandom(seed + 3) * 10;
        const randomSize = 20 + seededRandom(seed + 4) * 40;

        return (
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{
              left: `${randomX}%`,
              fontSize: `${randomSize}px`,
            }}
            initial={{
              y: "120vh",
              rotate: 0,
              opacity: 0,
            }}
            animate={{
              y: "-20vh",
              rotate: 360,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              repeat: Infinity,
              ease: "linear",
              opacity: {
                times: [0, 0.1, 0.9, 1],
              },
            }}
          >
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="block"
            >
              {randomIcon}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}
