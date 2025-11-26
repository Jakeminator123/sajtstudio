"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { prefersReducedMotion } from "@/lib/performance";

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
  const sectionRef = useRef(null);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden"
    >
      {/* Clean subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-black to-gray-950" />

      {/* Subtle accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          {/* Clean main heading */}
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Låt oss prata
          </motion.h2>

          {/* Subheading */}
          <motion.p
            className="text-xl sm:text-2xl md:text-3xl text-accent font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Vi vill höra från dig
          </motion.p>

          {/* Main description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-6 text-lg sm:text-xl text-gray-300 leading-relaxed"
          >
            <p>
              Har du ett projekt på gång, en idé som behöver formas – eller undrar du bara hur vi kan hjälpa ditt företag digitalt?
            </p>
            <p className="text-gray-400">
              Oavsett om du är i idéstadiet eller redo att trycka på startknappen tar vi gärna ett förutsättningslöst samtal.
            </p>
          </motion.div>

          {/* Services list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="max-w-2xl mx-auto text-left"
          >
            <p className="text-white font-semibold text-lg mb-4 text-center">Vi kan hjälpa dig att:</p>
            <ul className="space-y-3 text-gray-300">
              {[
                "ta fram en första version av din nya sajt",
                "uppgradera en befintlig hemsida",
                "utforska hur AI och smart design kan göra din digitala närvaro vassare"
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-accent mt-1">✦</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* CTA text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="text-lg text-accent-light font-medium"
          >
            Hör av dig så återkommer vi snabbt med nästa steg.
          </motion.p>

          {/* Main contact CTA - links to /contact page */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="pt-4"
          >
            <MagneticButton href="/contact" />
          </motion.div>

          {/* Contact methods - clean and simple */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
          >
            <motion.a
              href="mailto:hej@dg97.se"
              className="group flex items-center gap-3 text-gray-400 hover:text-accent transition-colors duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-accent/20 transition-colors duration-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-medium text-lg">hej@dg97.se</span>
            </motion.a>

            <motion.a
              href="tel:+34654161231"
              className="group flex items-center gap-3 text-gray-400 hover:text-accent transition-colors duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-accent/20 transition-colors duration-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="font-medium text-lg">+34 654 161 231</span>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

