"use client";

import { motion } from "framer-motion";

interface FloatingIconsProps {
  icons?: string[];
  count?: number;
}

export default function FloatingIcons({
  icons = ["🚀", "⚡", "✨", "💡", "🎯", "🔥", "💎", "🌟", "⭐", "🎨"],
  count = 10,
}: FloatingIconsProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => {
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 5;
        const randomDuration = 15 + Math.random() * 10;
        const randomSize = 20 + Math.random() * 40;

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
