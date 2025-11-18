"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WaveVisualizerProps {
  variant?: "sound" | "ocean" | "pulse";
  color?: string;
  height?: number;
}

export default function WaveVisualizer({
  variant = "sound",
  color = "#3b82f6",
  height = 200,
}: WaveVisualizerProps) {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    if (variant === "sound") {
      // Generate random bar heights for sound wave effect
      const generateBars = () => {
        const newBars = Array.from({ length: 50 }, () => Math.random() * 100);
        setBars(newBars);
      };

      generateBars();
      const interval = setInterval(generateBars, 200);
      return () => clearInterval(interval);
    }
  }, [variant]);

  if (variant === "sound") {
    return (
      <div
        className="flex items-center justify-center gap-1"
        style={{ height }}
      >
        {bars.map((barHeight, i) => (
          <motion.div
            key={i}
            className="w-1 bg-gradient-to-t from-transparent rounded-full"
            style={{
              background: `linear-gradient(to top, ${color}00, ${color})`,
            }}
            animate={{
              height: `${barHeight}%`,
              opacity: barHeight / 100,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "ocean") {
    return (
      <div className="relative w-full" style={{ height }}>
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
        >
          {[0, 1, 2].map((index) => (
            <motion.path
              key={index}
              fill={color}
              fillOpacity={0.3 - index * 0.1}
              d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              animate={{
                d: [
                  "M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,160L48,149.3C96,139,192,117,288,133.3C384,149,480,203,576,213.3C672,224,768,192,864,165.3C960,139,1056,117,1152,122.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,197.3C672,192,768,160,864,149.3C960,139,1056,149,1152,176C1248,203,1344,245,1392,266.7L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                ],
              }}
              transition={{
                duration: 8 + index * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5,
              }}
            />
          ))}
        </svg>
      </div>
    );
  }

  // Pulse variant
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height }}
    >
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="absolute rounded-full border-2"
          style={{
            borderColor: color,
            width: 100 + index * 50,
            height: 100 + index * 50,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6 - index * 0.15, 0.2, 0.6 - index * 0.15],
          }}
          transition={{
            duration: 2 + index * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2,
          }}
        />
      ))}

      {/* Center pulse */}
      <motion.div
        className="relative w-20 h-20 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}, ${color}00)`,
        }}
        animate={{
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
