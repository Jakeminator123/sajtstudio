"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

interface MagneticCTAProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "accent";
}

/**
 * MagneticCTA - A premium 3D magnetic button with tilt effect
 * 
 * Features:
 * - Magnetic pull towards cursor
 * - 3D perspective tilt
 * - Animated gradient border
 * - Shine/glare effect on hover
 * - No generic emojis - pure elegance
 */
export default function MagneticCTA({ 
  href, 
  children, 
  className = "",
  variant = "primary" 
}: MagneticCTAProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position relative to button center
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for magnetic effect
  const springConfig = { damping: 25, stiffness: 400 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // 3D rotation based on mouse position
  const rotateX = useTransform(y, [-50, 50], [8, -8]);
  const rotateY = useTransform(x, [-50, 50], [-8, 8]);

  // Glare position
  const glareX = useTransform(x, [-50, 50], [0, 100]);
  const glareY = useTransform(y, [-50, 50], [0, 100]);
  
  // Glare background gradient (must be created at top level, not inside style prop)
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) => 
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.3) 0%, transparent 50%)`
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Distance from center (clamped)
    const deltaX = Math.max(-50, Math.min(50, e.clientX - centerX));
    const deltaY = Math.max(-50, Math.min(50, e.clientY - centerY));
    
    mouseX.set(deltaX);
    mouseY.set(deltaY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const variantStyles = {
    primary: "from-blue-600 via-blue-500 to-cyan-400",
    secondary: "from-purple-600 via-pink-500 to-rose-400",
    accent: "from-emerald-500 via-teal-400 to-cyan-400",
  };

  return (
    <motion.div
      className="relative inline-block"
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        style={{
          x,
          y,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <Link
          ref={ref}
          href={href}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className={`
            relative inline-flex items-center gap-3 px-8 py-4
            font-semibold text-white
            rounded-xl overflow-hidden
            transition-shadow duration-300
            ${isHovered ? "shadow-2xl shadow-blue-500/30" : "shadow-lg"}
            ${className}
          `}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Animated gradient background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${variantStyles[variant]}`}
            animate={{
              backgroundPosition: isHovered ? ["0% 50%", "100% 50%"] : "0% 50%",
            }}
            transition={{
              duration: 2,
              repeat: isHovered ? Infinity : 0,
              ease: "linear",
            }}
            style={{ backgroundSize: "200% 100%" }}
          />

          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: isHovered ? ["200% 0", "-200% 0"] : "200% 0",
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              ease: "linear",
            }}
          />

          {/* Glare/shine effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: glareBackground,
              opacity: isHovered ? 1 : 0,
            }}
          />

          {/* Inner shadow for depth */}
          <div 
            className="absolute inset-0 rounded-xl"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)",
            }}
          />

          {/* Content with 3D lift */}
          <motion.span
            className="relative z-10 flex items-center gap-2"
            style={{
              transform: "translateZ(20px)",
            }}
          >
            {children}
          </motion.span>

          {/* Animated arrow */}
          <motion.span
            className="relative z-10"
            animate={{
              x: isHovered ? [0, 5, 0] : 0,
            }}
            transition={{
              duration: 0.8,
              repeat: isHovered ? Infinity : 0,
              ease: "easeInOut",
            }}
            style={{
              transform: "translateZ(25px)",
            }}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 8l4 4m0 0l-4 4m4-4H3" 
              />
            </svg>
          </motion.span>
        </Link>
      </motion.div>

      {/* Reflection/glow underneath */}
      <motion.div
        className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 rounded-full blur-xl bg-gradient-to-r ${variantStyles[variant]}`}
        animate={{
          opacity: isHovered ? 0.6 : 0.2,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

