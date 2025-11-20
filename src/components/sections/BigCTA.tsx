"use client";

import { motion, useInView, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { prefersReducedMotion } from "@/lib/performance";

// Letter-by-letter animation component with 3D hover effect
function AnimatedLetters({
  text,
  delay = 0,
  className = "",
  mousePosition = { x: 0, y: 0 }
}: {
  text: string;
  delay?: number;
  className?: string;
  mousePosition?: { x: number; y: number };
}) {
  const letters = useMemo(() => text.split(""), [text]);
  const shouldReduceMotion = prefersReducedMotion();

  // 3D rotation based on mouse position - use global mouse position for consistency
  const mouseX = useMotionValue(mousePosition.x);
  const mouseY = useMotionValue(mousePosition.y);

  useEffect(() => {
    mouseX.set(mousePosition.x);
    mouseY.set(mousePosition.y);
  }, [mousePosition.x, mousePosition.y, mouseX, mouseY]);

  const rotateX = useTransform(
    mouseY,
    [-1, 1],
    shouldReduceMotion ? [0, 0] : [10, -10]
  );
  const rotateY = useTransform(
    mouseX,
    [-1, 1],
    shouldReduceMotion ? [0, 0] : [-10, 10]
  );

  return (
    <motion.span
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="inline-block"
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            delay: delay + index * 0.05,
            duration: shouldReduceMotion ? 0.3 : 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{
            transformStyle: "preserve-3d",
          }}
          whileHover={shouldReduceMotion ? {} : {
            scale: 1.2,
            z: 50,
            transition: { type: "spring", stiffness: 400 },
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Particle burst component for button hover
function ParticleBurst({ isHovered }: { isHovered: boolean }) {
  const shouldReduceMotion = prefersReducedMotion();

  // Use deterministic values instead of Math.random() to avoid hydration mismatch
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * Math.PI * 2;
      // Use deterministic seed based on index instead of random
      const seed = i * 0.618033988749895; // Golden ratio for even distribution
      const distance = 100 + (seed % 1) * 50;
      return {
        angle,
        distance,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      };
    });
  }, []);

  if (shouldReduceMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((particle, i) => {

        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-accent"
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0
            }}
            animate={isHovered ? {
              x: particle.x,
              y: particle.y,
              opacity: [1, 0.8, 0],
              scale: [0, 1.5, 0],
            } : {
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.02,
              ease: "easeOut",
            }}
            style={{
              left: "50%",
              top: "50%",
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Magnetic button component with hover effects
 *
 * CTA Button destinations across the site:
 * - BigCTA: Links to /contact (main contact CTA at bottom of homepage)
 * - HeaderNav: Links to /contact (start project CTA in header)
 * - HeroSection: Links to /utvardera and /portfolio (primary hero CTAs)
 * - ServiceModal: Links to /contact (service-specific CTA)
 */
function MagneticButton({
  href
}: {
  href: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const shouldReduceMotion = prefersReducedMotion();

  // Cleanup ripple timeouts on unmount
  useEffect(() => {
    const timeoutsRef = rippleTimeoutsRef.current;
    return () => {
      timeoutsRef.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.clear();
    };
  }, []);

  useEffect(() => {
    if (shouldReduceMotion || !isHovered) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setButtonPosition({ x: 0, y: 0 });
      });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const distanceX = mouseX - centerX;
      const distanceY = mouseY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < 150) {
        const strength = (150 - distance) / 150;
        setButtonPosition({
          x: distanceX * strength * 0.3,
          y: distanceY * strength * 0.3,
        });
      } else {
        setButtonPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      setButtonPosition({ x: 0, y: 0 });
    };
  }, [isHovered, shouldReduceMotion]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    // Store timeout for cleanup
    const timeoutId = setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      rippleTimeoutsRef.current.delete(newRipple.id);
    }, 600);

    rippleTimeoutsRef.current.set(newRipple.id, timeoutId);
  }, []);

  return (
    <Link href={href}>
      <motion.button
        ref={buttonRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setButtonPosition({ x: 0, y: 0 });
        }}
        onClick={handleClick}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 80px rgba(0, 102, 255, 1)",
        }}
        whileTap={{ scale: 0.95 }}
        className="group relative inline-flex items-center gap-4 px-12 py-6 bg-accent text-white font-bold text-lg sm:text-xl overflow-visible transition-all duration-300 rounded-sm"
        style={{
          x: shouldReduceMotion ? 0 : buttonPosition.x,
          y: shouldReduceMotion ? 0 : buttonPosition.y,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Animated rotating border */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-sm"
            style={{
              background: "linear-gradient(45deg, transparent 30%, rgba(0, 102, 255, 0.5) 50%, transparent 70%)",
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent via-accent-light to-accent rounded-sm"
          initial={{ x: "-100%" }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            backgroundSize: "200% 100%",
          }}
        />

        {/* Pulsing glow effect */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 bg-accent opacity-50 blur-xl rounded-sm"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Particle burst */}
        <ParticleBurst isHovered={isHovered} />

        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border-2 border-white/50"
            style={{
              left: ripple.x,
              top: ripple.y,
              x: "-50%",
              y: "-50%",
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 200, height: 200, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}

        {/* Text */}
        <span className="relative z-10">Kontakta Oss</span>

        {/* Animated arrow icon */}
        <motion.svg
          className="relative z-10 w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ x: [0, 6, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path d="M9 5l7 7-7 7" />
        </motion.svg>
      </motion.button>
    </Link>
  );
}

/**
 * BigCTA Component
 *
 * Final call-to-action section at the bottom of the homepage.
 * Features:
 * - Animated 3D text effects with mouse parallax
 * - Magnetic button with particle effects
 * - Contact information display
 *
 * CTA Destination: /contact (main contact page)
 *
 * This is the primary conversion point after users have scrolled through
 * all content on the homepage.
 */
export default function BigCTA() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const shouldReduceMotion = prefersReducedMotion();

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  // Track mouse position for 3D text effect and parallax
  useEffect(() => {
    if (shouldReduceMotion || typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [shouldReduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden"
    >
      {/* Enhanced animated background particles */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 50 }).map((_, i) => {
            const seed = i * 0.618033988749895;
            const size = 1 + (seed % 3);
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${(seed * 100) % 100}%`,
                  top: `${((seed * 1.618) * 100) % 100}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  background: `radial-gradient(circle, rgba(0, 102, 255, ${0.3 + (seed % 0.4)}), transparent)`,
                }}
                animate={{
                  y: [0, -50, 0],
                  opacity: [0.1, 0.6, 0.1],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 4 + (seed % 3),
                  repeat: Infinity,
                  delay: seed % 2,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Gradient overlay with animated gradients */}
      <motion.div
        className="absolute inset-0 opacity-60"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% 200%",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center space-y-16 md:space-y-20"
        >
          {/* Main heading with letter-by-letter animation and parallax */}
          <motion.h2
            className="text-5xl sm:text-6xl md:text-7xl lg:text-display font-black leading-[0.9] tracking-tight relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{
              x: shouldReduceMotion ? 0 : mousePosition.x * 20,
              y: shouldReduceMotion ? 0 : mousePosition.y * 20,
            }}
          >
            {/* Shimmer effect overlay */}
            {mounted && !shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "50% 100%",
                }}
              />
            )}

            {/* Main text with gradient and 3D effect */}
            <motion.span
              className="relative inline-block bg-clip-text text-transparent cursor-default"
              style={{
                backgroundImage: "linear-gradient(135deg, #FFFFFF, #0066FF, #FFFFFF)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              animate={mounted && !shouldReduceMotion ? {
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              } : {}}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <AnimatedLetters text="Låt oss prata." delay={0.3} mousePosition={mousePosition} />
            </motion.span>

            {/* Glow effect behind text */}
            {mounted && !shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 blur-3xl opacity-30 pointer-events-none -z-10"
                style={{
                  background: "radial-gradient(circle, rgba(0, 102, 255, 0.5), transparent 70%)",
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.h2>

          {/* Subtext with enhanced animation */}
          <motion.div
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.span
              className="relative inline-block text-accent font-normal"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <AnimatedLetters text="Vi vill höra från dig." delay={0.8} />
              {/* Underline animation */}
              {mounted && (
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent via-accent-light to-accent"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                />
              )}
            </motion.span>
          </motion.div>

          {/* Description with word reveal */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed space-y-2"
          >
            <motion.span
              className="block"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.1 }}
            >
              Har du ett projekt i tankarna? Eller vill du bara veta mer om vad vi gör?
            </motion.span>
            <motion.span
              className="block text-accent-light font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.3 }}
            >
              Kontakta oss idag så tar vi ett samtal.
            </motion.span>
          </motion.p>

          {/* Enhanced Magnetic CTA Button with Particles */}
          {/* Main contact CTA - links to /contact page */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="pt-4"
          >
            <MagneticButton href="/contact" />
          </motion.div>

          {/* Enhanced contact methods */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="pt-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
          >
            <motion.a
              href="mailto:info@sajtstudio.se"
              className="group flex items-center gap-3 text-gray-400 hover:text-accent transition-colors text-lg sm:text-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="p-2 rounded-full bg-gray-900/50 group-hover:bg-accent/20 transition-colors"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <span className="font-medium">info@sajtstudio.se</span>
            </motion.a>

            <motion.a
              href="tel:+46701234567"
              className="group flex items-center gap-3 text-gray-400 hover:text-accent transition-colors text-lg sm:text-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="p-2 rounded-full bg-gray-900/50 group-hover:bg-accent/20 transition-colors"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </motion.div>
              <span className="font-medium">+46 70 123 45 67</span>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

