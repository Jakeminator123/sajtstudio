"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  variant?: "aurora" | "nebula" | "matrix" | "waves";
}

export default function AnimatedBackground({
  variant = "aurora",
}: AnimatedBackgroundProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (variant === "aurora") {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Aurora Borealis Effect */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 20% 80%, #ff00ff40 0%, transparent 50%), radial-gradient(circle at 80% 20%, #00ffff40 0%, transparent 50%), radial-gradient(circle at 40% 40%, #ffff0040 0%, transparent 50%)",
                "radial-gradient(circle at 60% 60%, #ff00ff40 0%, transparent 50%), radial-gradient(circle at 20% 40%, #00ffff40 0%, transparent 50%), radial-gradient(circle at 80% 80%, #ffff0040 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, #ff00ff40 0%, transparent 50%), radial-gradient(circle at 30% 70%, #00ffff40 0%, transparent 50%), radial-gradient(circle at 70% 30%, #ffff0040 0%, transparent 50%)",
                "radial-gradient(circle at 20% 80%, #ff00ff40 0%, transparent 50%), radial-gradient(circle at 80% 20%, #00ffff40 0%, transparent 50%), radial-gradient(circle at 40% 40%, #ffff0040 0%, transparent 50%)",
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, #ffffff10 0%, transparent 30%)`,
            }}
          />
        </div>

        {/* Floating Orbs */}
        {[...Array(6)].map((_, i) => {
          const width =
            typeof window !== "undefined" ? window.innerWidth : 1920;
          const height =
            typeof window !== "undefined" ? window.innerHeight : 1080;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{
                width: Math.random() * 400 + 200,
                height: Math.random() * 400 + 200,
                background: `radial-gradient(circle, ${
                  [
                    "#ff00ff60",
                    "#00ffff60",
                    "#ffff0060",
                    "#ff00aa60",
                    "#00ff9960",
                    "#9900ff60",
                  ][i]
                }, transparent)`,
              }}
              animate={{
                x: [
                  Math.random() * width,
                  Math.random() * width,
                  Math.random() * width,
                ],
                y: [
                  Math.random() * height,
                  Math.random() * height,
                  Math.random() * height,
                ],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Animated Lines */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
            style={{
              width: "100%",
              top: `${20 + i * 20}%`,
            }}
            animate={{
              x: [-1000, 1000],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "nebula") {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Nebula Clouds */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at top left, #ff006620, transparent 40%), radial-gradient(ellipse at bottom right, #4a00ff20, transparent 40%), radial-gradient(ellipse at center, #00ffff10, transparent 60%)",
              "radial-gradient(ellipse at top right, #ff006620, transparent 40%), radial-gradient(ellipse at bottom left, #4a00ff20, transparent 40%), radial-gradient(ellipse at center, #ff00ff10, transparent 60%)",
              "radial-gradient(ellipse at top left, #ff006620, transparent 40%), radial-gradient(ellipse at bottom right, #4a00ff20, transparent 40%), radial-gradient(ellipse at center, #00ffff10, transparent 60%)",
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Stars */}
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3,
              height: Math.random() * 3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "matrix") {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
        {/* Matrix Rain */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`matrix-${i}`}
            className="absolute text-green-500 font-mono text-xs opacity-70"
            style={{
              left: `${i * 3.33}%`,
            }}
            animate={{
              y: [
                -100,
                typeof window !== "undefined" ? window.innerHeight + 100 : 1180,
              ],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          >
            {[...Array(20)].map((_, j) => (
              <div key={j}>{Math.random() > 0.5 ? "1" : "0"}</div>
            ))}
          </motion.div>
        ))}

        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, #00ff0020 0%, transparent 30%)`,
          }}
        />
      </div>
    );
  }

  // Waves variant
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 560"
      >
        {[...Array(4)].map((_, i) => (
          <motion.path
            key={`wave-${i}`}
            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,560L1392,560C1344,560,1248,560,1152,560C1056,560,960,560,864,560C768,560,672,560,576,560C480,560,384,560,288,560C192,560,96,560,48,560L0,560Z"
            fill={`rgba(${100 + i * 30}, ${50 + i * 50}, 255, ${
              0.05 + i * 0.02
            })`}
            animate={{
              d: [
                "M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,560L1392,560C1344,560,1248,560,1152,560C1056,560,960,560,864,560C768,560,672,560,576,560C480,560,384,560,288,560C192,560,96,560,48,560L0,560Z",
                "M0,320L48,304C96,288,192,256,288,224C384,192,480,160,576,176C672,192,768,256,864,272C960,288,1056,256,1152,234.7C1248,213,1344,203,1392,197.3L1440,192L1440,560L1392,560C1344,560,1248,560,1152,560C1056,560,960,560,864,560C768,560,672,560,576,560C480,560,384,560,288,560C192,560,96,560,48,560L0,560Z",
                "M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,560L1392,560C1344,560,1248,560,1152,560C1056,560,960,560,864,560C768,560,672,560,576,560C480,560,384,560,288,560C192,560,96,560,48,560L0,560Z",
              ],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* Particles on top */}
      {[...Array(20)].map((_, i) => {
        const width = typeof window !== "undefined" ? window.innerWidth : 1920;
        const height =
          typeof window !== "undefined" ? window.innerHeight : 1080;
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            animate={{
              x: [Math.random() * width, Math.random() * width],
              y: [Math.random() * height, Math.random() * height],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
