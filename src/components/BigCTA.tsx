"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import WordReveal from "./WordReveal";
import { useEffect, useState } from "react";

export default function BigCTA() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Animated background particles */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => {
            const seed = i * 0.618033988749895;
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-accent rounded-full"
                style={{
                  left: `${(seed * 100) % 100}%`,
                  top: `${((seed * 1.618) * 100) % 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3 + (seed % 2),
                  repeat: Infinity,
                  delay: seed % 2,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-80" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12"
        >
          {/* Main heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-display-mega font-black leading-none px-4">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="block"
            >
              Låt oss prata.
            </motion.span>
          </h2>

          {/* Subtext */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-light leading-relaxed px-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className="text-accent font-normal">
              <WordReveal text="Vi vill höra från dig." delay={0.5} staggerDelay={0.08} />
            </span>
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Har du ett projekt i tankarna? Eller vill du bara veta mer om vad vi gör?
            Kontakta oss idag så tar vi ett samtal.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.6 }}
            className="pt-8"
          >
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0, 102, 255, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-2 sm:gap-4 px-6 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-accent text-white font-bold text-base sm:text-lg md:text-xl overflow-hidden transition-all duration-300 min-h-[44px] touch-manipulation active:bg-accent-hover"
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent-hover to-accent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4 }}
                />

                {/* Text */}
                <span className="relative z-10">Kontakta Oss</span>

                {/* Arrow icon */}
                <motion.svg
                  className="relative z-10 w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ x: [0, 5, 0] }}
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
          </motion.div>

          {/* Alternative contact methods */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 text-gray-400 px-4"
          >
            <a
              href="mailto:info@sajtstudio.se"
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
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
              <span>info@sajtstudio.se</span>
            </a>

            <a
              href="tel:+46701234567"
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
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
              <span>+46 70 123 45 67</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

