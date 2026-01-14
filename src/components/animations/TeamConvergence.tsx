"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { useMounted } from "@/hooks/useMounted";

interface TeamMember {
  name: string;
  image: string;
  color: string;
  glowColor: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Joakim Hallsten",
    image: "/images/team/joakim-hallsten.webp",
    color: "blue",
    glowColor: "rgba(59, 130, 246, 0.8)",
  },
  {
    name: "Jakob Eberg",
    image: "/images/team/jakob-eberg.webp",
    color: "red",
    glowColor: "rgba(239, 68, 68, 0.8)",
  },
  {
    name: "Oscar Guditz",
    image: "/images/team/oscar-guditz.webp",
    color: "green",
    glowColor: "rgba(34, 197, 94, 0.8)",
  },
];

interface TeamConvergenceProps {
  onConverged?: () => void;
}

/**
 * TeamConvergence - Epic scroll-driven animation
 * 
 * Three cyberpunk portraits (RGB theme) that:
 * 1. Start separated - visible ~90%
 * 2. Glide toward each other on scroll (parallax)
 * 3. Merge into one image
 * 4. Smoke/fog sweeps in with RGB glow pulse
 * 5. IRREVERSIBLE: Once merged, callback fires to reveal team cards
 */
export default function TeamConvergence({ onConverged }: TeamConvergenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  
  // IRREVERSIBLE state - once true, stays true forever
  const [hasConverged, setHasConverged] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth spring for scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Track when images converge - IRREVERSIBLE, fires callback
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (latest >= 0.5 && !hasConverged) {
      setHasConverged(true);
      onConverged?.();
    }
  });

  // Image translations - converge toward center
  // Left image (Joakim) - starts far left, moves to center
  const x1 = useTransform(smoothProgress, [0, 0.3, 0.5, 1], ["-80%", "-40%", "0%", "0%"]);
  // Center image (Jakob) - stays in center, slight scale
  const x2 = useTransform(smoothProgress, [0, 0.5, 1], ["0%", "0%", "0%"]);
  // Right image (Oscar) - starts far right, moves to center
  const x3 = useTransform(smoothProgress, [0, 0.3, 0.5, 1], ["80%", "40%", "0%", "0%"]);

  // Scale effects - images grow slightly as they merge
  const scale1 = useTransform(smoothProgress, [0, 0.3, 0.5, 0.7], [0.85, 0.9, 1, 1.02]);
  const scale2 = useTransform(smoothProgress, [0, 0.3, 0.5, 0.7], [0.9, 0.95, 1, 1.05]);
  const scale3 = useTransform(smoothProgress, [0, 0.3, 0.5, 0.7], [0.85, 0.9, 1, 1.02]);

  // Z-index simulation via scale - center image on top when merged
  const z1 = useTransform(smoothProgress, [0, 0.4, 0.5], [1, 1, 0]);
  const z2 = useTransform(smoothProgress, [0, 0.4, 0.5], [2, 2, 3]);
  const z3 = useTransform(smoothProgress, [0, 0.4, 0.5], [1, 1, 0]);

  // Opacity for side images fading slightly when merged
  const opacity1 = useTransform(smoothProgress, [0, 0.4, 0.6, 0.8], [1, 1, 0.7, 0.4]);
  const opacity3 = useTransform(smoothProgress, [0, 0.4, 0.6, 0.8], [1, 1, 0.7, 0.4]);

  // Smoke/fog effect - REDUCED by ~65%
  const smokeOpacity = useTransform(smoothProgress, [0.4, 0.5, 0.6, 1], [0, 0.15, 0.3, 0.35]);
  const smokeBlur = useTransform(smoothProgress, [0.4, 0.6, 1], [0, 10, 18]);
  const smokeBlurString = useTransform(smokeBlur, (v) => `blur(${v}px)`);
  
  // Lighter blur for images after convergence
  const imageBlur = useTransform(smoothProgress, [0.4, 0.55, 0.7], [0, 3, 7]);
  const imageBlurString = useTransform(imageBlur, (v) => `blur(${v}px)`);

  // RGB glow intensity
  const glowIntensity = useTransform(smoothProgress, [0.5, 0.7, 0.85, 1], [0, 0.5, 1, 0.8]);

  // Vignette darkening
  const vignetteOpacity = useTransform(smoothProgress, [0.6, 0.8, 1], [0, 0.4, 0.7]);

  // Overall container scale for dramatic effect
  const containerScale = useTransform(smoothProgress, [0.7, 0.9, 1], [1, 1.02, 1.05]);

  // Rotation for slight 3D effect
  const rotateY1 = useTransform(smoothProgress, [0, 0.5], ["15deg", "0deg"]);
  const rotateY3 = useTransform(smoothProgress, [0, 0.5], ["-15deg", "0deg"]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden py-12 md:py-20"
      style={{ perspective: "1500px" }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent" />

      {/* Main convergence container */}
      <motion.div
        className="relative w-full max-w-6xl mx-auto px-4"
        style={{
          scale: mounted ? containerScale : 1,
        }}
        suppressHydrationWarning
      >
        {/* Image container with 3D perspective */}
        <div 
          className="relative flex items-center justify-center"
          style={{ 
            height: "clamp(400px, 70vh, 800px)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Left image - Joakim (Blue) */}
          <motion.div
            className="absolute w-[30%] md:w-[28%] h-full"
            style={{
              x: mounted ? x1 : "-80%",
              scale: mounted ? scale1 : 0.85,
              opacity: mounted ? opacity1 : 1,
              rotateY: mounted ? rotateY1 : "15deg",
              zIndex: mounted ? z1 : 1,
              transformStyle: "preserve-3d",
            }}
            suppressHydrationWarning
          >
            <motion.div 
              className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
              style={{
                filter: hasConverged ? "blur(7px)" : (mounted ? imageBlurString : "blur(0px)"),
              }}
              suppressHydrationWarning
            >
              <Image
                src={teamMembers[0].image}
                alt={teamMembers[0].name}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 30vw, 28vw"
                priority
              />
              {/* Blue glow overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, ${teamMembers[0].glowColor}, transparent 70%)`,
                  opacity: mounted ? glowIntensity : 0,
                  mixBlendMode: "screen",
                }}
                suppressHydrationWarning
              />
              {/* Border glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: `0 0 40px ${teamMembers[0].glowColor}, inset 0 0 30px ${teamMembers[0].glowColor}`,
                  opacity: mounted ? glowIntensity : 0,
                }}
                suppressHydrationWarning
              />
            </motion.div>
          </motion.div>

          {/* Center image - Jakob (Red) - Main focus */}
          <motion.div
            className="absolute w-[35%] md:w-[32%] h-full"
            style={{
              x: mounted ? x2 : "0%",
              scale: mounted ? scale2 : 0.9,
              zIndex: mounted ? z2 : 2,
            }}
            suppressHydrationWarning
          >
            <motion.div 
              className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
              style={{
                filter: hasConverged ? "blur(7px)" : (mounted ? imageBlurString : "blur(0px)"),
              }}
              suppressHydrationWarning
            >
              <Image
                src={teamMembers[1].image}
                alt={teamMembers[1].name}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 35vw, 32vw"
                priority
              />
              {/* Red glow overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, ${teamMembers[1].glowColor}, transparent 70%)`,
                  opacity: mounted ? glowIntensity : 0,
                  mixBlendMode: "screen",
                }}
                suppressHydrationWarning
              />
              {/* Border glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: `0 0 50px ${teamMembers[1].glowColor}, inset 0 0 40px ${teamMembers[1].glowColor}`,
                  opacity: mounted ? glowIntensity : 0,
                }}
                suppressHydrationWarning
              />
            </motion.div>
          </motion.div>

          {/* Right image - Oscar (Green) */}
          <motion.div
            className="absolute w-[30%] md:w-[28%] h-full"
            style={{
              x: mounted ? x3 : "80%",
              scale: mounted ? scale3 : 0.85,
              opacity: mounted ? opacity3 : 1,
              rotateY: mounted ? rotateY3 : "-15deg",
              zIndex: mounted ? z3 : 1,
              transformStyle: "preserve-3d",
            }}
            suppressHydrationWarning
          >
            <motion.div 
              className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
              style={{
                filter: hasConverged ? "blur(7px)" : (mounted ? imageBlurString : "blur(0px)"),
              }}
              suppressHydrationWarning
            >
              <Image
                src={teamMembers[2].image}
                alt={teamMembers[2].name}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 30vw, 28vw"
                priority
              />
              {/* Green glow overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, ${teamMembers[2].glowColor}, transparent 70%)`,
                  opacity: mounted ? glowIntensity : 0,
                  mixBlendMode: "screen",
                }}
                suppressHydrationWarning
              />
              {/* Border glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: `0 0 40px ${teamMembers[2].glowColor}, inset 0 0 30px ${teamMembers[2].glowColor}`,
                  opacity: mounted ? glowIntensity : 0,
                }}
                suppressHydrationWarning
              />
            </motion.div>
          </motion.div>

          {/* Smoke/Fog overlay - sweeps in from edges - REDUCED */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              opacity: hasConverged ? 0.35 : (mounted ? smokeOpacity : 0),
            }}
            suppressHydrationWarning
          >
            {/* Left smoke tendril - SUBTLE */}
            <motion.div
              className="absolute left-0 top-0 w-1/3 h-full"
              style={{
                background: hasConverged 
                  ? "linear-gradient(to right, rgba(59, 130, 246, 0.25), transparent)"
                  : "linear-gradient(to right, rgba(59, 130, 246, 0.15), transparent)",
                filter: hasConverged ? "blur(15px)" : (mounted ? smokeBlurString : "blur(0px)"),
              }}
              animate={{
                x: ["-20%", "10%", "-10%"],
                opacity: hasConverged ? [0.3, 0.4, 0.3] : [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              suppressHydrationWarning
            />
            
            {/* Center smoke - LIGHT FOG */}
            <motion.div
              className="absolute left-0 top-0 w-full h-full"
              style={{
                background: hasConverged 
                  ? "radial-gradient(ellipse at center, rgba(239, 68, 68, 0.2), transparent 70%)"
                  : "radial-gradient(ellipse at center, rgba(239, 68, 68, 0.1), transparent 70%)",
                filter: hasConverged ? "blur(20px)" : (mounted ? smokeBlurString : "blur(0px)"),
              }}
              animate={{
                scale: hasConverged ? [1, 1.1, 1] : [1, 1.05, 1],
                opacity: hasConverged ? [0.3, 0.4, 0.3] : [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              suppressHydrationWarning
            />
            
            {/* Right smoke tendril - SUBTLE */}
            <motion.div
              className="absolute right-0 top-0 w-1/3 h-full"
              style={{
                background: hasConverged 
                  ? "linear-gradient(to left, rgba(34, 197, 94, 0.25), transparent)"
                  : "linear-gradient(to left, rgba(34, 197, 94, 0.15), transparent)",
                filter: hasConverged ? "blur(15px)" : (mounted ? smokeBlurString : "blur(0px)"),
              }}
              animate={{
                x: ["20%", "-10%", "10%"],
                opacity: hasConverged ? [0.3, 0.4, 0.3] : [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              suppressHydrationWarning
            />

            {/* Floating smoke particles - SUBTLE */}
            {mounted && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${hasConverged ? 25 + i * 8 : 15 + i * 6}px`,
                      height: `${hasConverged ? 25 + i * 8 : 15 + i * 6}px`,
                      left: `${10 + i * 15}%`,
                      top: `${20 + (i % 3) * 25}%`,
                      background: i % 3 === 0 
                        ? `rgba(59, 130, 246, ${hasConverged ? 0.2 : 0.15})`
                        : i % 3 === 1 
                        ? `rgba(239, 68, 68, ${hasConverged ? 0.2 : 0.15})`
                        : `rgba(34, 197, 94, ${hasConverged ? 0.2 : 0.15})`,
                      filter: hasConverged ? "blur(12px)" : "blur(10px)",
                    }}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, i % 2 === 0 ? 15 : -15, 0],
                      opacity: hasConverged ? [0.15, 0.25, 0.15] : [0.1, 0.2, 0.1],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>

          {/* Vignette overlay - subtle darkening at edges */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background: hasConverged 
                ? "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.6) 100%)"
                : "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
              opacity: hasConverged ? 0.5 : (mounted ? vignetteOpacity : 0),
            }}
            suppressHydrationWarning
          />

          {/* RGB Glow ring around merged image */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
            style={{
              opacity: mounted ? glowIntensity : 0,
            }}
            suppressHydrationWarning
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: `
                  conic-gradient(
                    from 0deg,
                    rgba(59, 130, 246, 0.6),
                    rgba(239, 68, 68, 0.6),
                    rgba(34, 197, 94, 0.6),
                    rgba(59, 130, 246, 0.6)
                  )
                `,
                filter: "blur(40px)",
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        </div>

        {/* Team name reveal - appears when converged */}
        <motion.div
          className="absolute bottom-4 md:bottom-8 left-0 right-0 text-center z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: hasConverged ? 1 : 0,
            y: hasConverged ? 0 : 20,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.p
            className="text-3xl md:text-5xl font-black text-transparent bg-clip-text drop-shadow-2xl"
            style={{
              backgroundImage: "linear-gradient(90deg, #3B82F6, #EF4444, #22C55E, #3B82F6)",
              backgroundSize: "200% 100%",
              textShadow: "0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(239, 68, 68, 0.3)",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "200% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            SAJTSTUDIO TEAM
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

