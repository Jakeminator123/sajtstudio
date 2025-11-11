"use client";

import Link from "next/link";
import { useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { designTokens } from "@/config/designTokens";

export default function HeaderNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // More nuanced scroll detection
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  // Smooth background opacity based on scroll - black with blur
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.95)"]
  );

  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ["0 0 0 rgba(0,0,0,0)", "0 4px 20px rgba(0,0,0,0.5)"]
  );

  // Red glow that increases with scroll
  const headerRedGlow = useTransform(scrollY, [0, 200], [0, 0.3]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          backgroundColor: headerBg,
          boxShadow: headerShadow,
        }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-colors duration-500 border-b border-white/10"
        role="banner"
      >
        {/* Red glow accent that increases with scroll */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-tertiary/20 to-transparent pointer-events-none z-0"
          style={{ opacity: headerRedGlow }}
        />

        <nav
          className="container mx-auto px-6 py-5 relative z-20"
          role="navigation"
          aria-label="Huvudnavigation"
        >
          <div className="flex items-center justify-between">
            {/* Logo with enhanced animations */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="Sajtstudio - Startsida"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3, type: "spring" }}
                className="relative"
              >
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-accent blur-xl opacity-0 group-hover:opacity-50"
                  transition={{ duration: 0.3 }}
                />
                <Image
                  src="/logo.svg"
                  alt="Sajtstudio logotyp"
                  width={36}
                  height={36}
                  className="relative z-10 transition-transform duration-300"
                />
              </motion.div>
              <motion.span
                className="text-xl font-black tracking-tight text-white group-hover:text-accent transition-colors duration-300 relative"
                whileHover={{ scale: 1.05 }}
                aria-hidden="true"
              >
                Sajtstudio
                {/* Underline effect */}
                <motion.span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-10">
              {[
                { href: "/", label: "Hem" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/contact", label: "Kontakt" },
              ].map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                  whileHover={{ y: -2 }}
                  className="relative z-20"
                >
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-white hover:text-tertiary transition-colors duration-300 relative group block"
                  >
                    {link.label}
                    {/* Animated underline */}
                    <motion.span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-tertiary group-hover:w-full transition-all duration-300" />
                    {/* Glow effect */}
                    <motion.span
                      className="absolute inset-0 blur-sm opacity-0 group-hover:opacity-50 bg-tertiary"
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}

              {/* CTA Button - Enhanced with red accent */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                {/* Glow background */}
                <motion.div
                  className="absolute inset-0 bg-tertiary blur-xl opacity-0 group-hover:opacity-50"
                  transition={{ duration: 0.3 }}
                />
                <Link
                  href="/contact"
                  className="relative px-6 py-2.5 bg-gradient-to-r from-accent to-tertiary text-white text-sm font-bold hover:from-tertiary hover:to-accent transition-all duration-300 shadow-lg shadow-accent/50 overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">Starta projekt</span>
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative w-8 h-8 flex items-center justify-center group"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">
                {isMenuOpen ? "Stäng meny" : "Öppna meny"}
              </span>
              <motion.span
                animate={{
                  rotate: isMenuOpen ? 45 : 0,
                  y: isMenuOpen ? 0 : -8,
                }}
                className="absolute w-6 h-0.5 bg-white group-hover:bg-tertiary transition-colors"
              />
              <motion.span
                animate={{
                  opacity: isMenuOpen ? 0 : 1,
                }}
                className="absolute w-6 h-0.5 bg-white group-hover:bg-tertiary transition-colors"
              />
              <motion.span
                animate={{
                  rotate: isMenuOpen ? -45 : 0,
                  y: isMenuOpen ? 0 : 8,
                }}
                className="absolute w-6 h-0.5 bg-white group-hover:bg-tertiary transition-colors"
              />
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay - Enhanced with black background */}
      <motion.div
        id="mobile-menu"
        initial={false}
        animate={{
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black z-40 md:hidden"
        aria-hidden={!isMenuOpen}
      >
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-accent/10 via-tertiary/10 to-transparent"
          animate={{
            opacity: isMenuOpen ? 1 : 0,
          }}
        />

        <nav
          className="container mx-auto px-6 pt-24 relative z-10"
          role="navigation"
        >
          <div className="flex flex-col gap-8">
            {[
              { href: "/", label: "Hem" },
              { href: "/portfolio", label: "Portfolio" },
              { href: "/contact", label: "Kontakt" },
            ].map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isMenuOpen ? 1 : 0,
                  x: isMenuOpen ? 0 : -20,
                }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl font-black text-white hover:text-tertiary transition-colors relative group"
                >
                  {link.label}
                  <motion.span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-accent to-tertiary group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isMenuOpen ? 1 : 0,
                y: isMenuOpen ? 0 : 20,
              }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="inline-block px-8 py-4 bg-gradient-to-r from-accent to-tertiary text-white font-bold hover:from-tertiary hover:to-accent transition-all duration-300 shadow-lg shadow-accent/50 relative overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10">Starta projekt</span>
              </Link>
            </motion.div>
          </div>
        </nav>
      </motion.div>
    </>
  );
}
