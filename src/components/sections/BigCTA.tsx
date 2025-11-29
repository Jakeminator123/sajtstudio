"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef } from "react";

// Dynamic imports to avoid SSR issues
const Keyboard3DBackground = dynamic(
  () => import("@/components/effects/Keyboard3DBackground"),
  { ssr: false }
);

const MatrixContactForm = dynamic(
  () => import("@/components/ui/MatrixContactForm"),
  { ssr: false }
);

/**
 * BigCTA Component - Interactive Keyboard Contact Section
 *
 * Features:
 * - Interactive 3D keyboard - click keys to type
 * - Matrix-style message display
 * - Send message via email
 * - Option to use real keyboard (animates 3D keyboard)
 * - Clickable retro phone to call
 */
export default function BigCTA() {
  const sectionRef = useRef(null);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col bg-black text-white relative overflow-hidden"
    >
      {/* Top content area - Title and description */}
      <div className="relative z-20 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "120px" }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-8"
          />

          {/* Main heading */}
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Låt oss
            </span>
            <br />
            <span className="bg-gradient-to-r from-accent via-blue-400 to-tertiary bg-clip-text text-transparent">
              prata
            </span>
          </motion.h2>

          {/* Subheading */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <span className="w-8 h-[1px] bg-accent/50" />
            <p className="text-lg sm:text-xl text-white/70 font-light tracking-wide uppercase">
              Vi vill höra från dig
            </p>
            <span className="w-8 h-[1px] bg-accent/50" />
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto"
          >
            Klicka på tangenterna nedan för att skriva ditt meddelande, eller
            aktivera ditt eget tangentbord.
          </motion.p>
        </motion.div>
      </div>

      {/* Main interactive area - Keyboard and Form */}
      <div className="flex-1 relative">
        {/* 3D Keyboard Background */}
        <div className="absolute inset-0">
          <Keyboard3DBackground />
        </div>

        {/* Dark gradient overlays for better readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none z-10" />

        {/* Clickable Phone - positioned to the left (desktop only) */}
        <a
          href="tel:+34654161231"
          className="absolute z-20 left-4 sm:left-8 lg:left-16 top-1/2 -translate-y-1/2 hidden md:block group"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            whileHover={{ scale: 1.05, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Image
              src="/images/contact_phone.webp"
              alt="Ring oss"
              width={180}
              height={220}
              className="drop-shadow-2xl transition-all duration-300 group-hover:drop-shadow-[0_0_30px_rgba(0,102,255,0.5)]"
            />
            {/* Hover tooltip */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-accent/90 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-sm font-mono whitespace-nowrap">
                📞 Ring oss!
              </span>
            </div>
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-accent/50 rounded-full animate-ping" />
            </div>
          </motion.div>
        </a>

        {/* Matrix Contact Form - positioned to the right (desktop) */}
        <div className="absolute z-20 right-4 sm:right-8 lg:right-16 top-1/2 -translate-y-1/2 hidden md:block">
          <MatrixContactForm email="hej@dg97.se" />
        </div>

        {/* Mobile: Form and Phone button */}
        <div className="absolute z-20 bottom-4 left-4 right-4 md:hidden space-y-4">
          <MatrixContactForm email="hej@dg97.se" />

          {/* Mobile phone call button */}
          <motion.a
            href="tel:+34654161231"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-accent to-blue-600 rounded-lg font-bold text-white shadow-lg shadow-accent/30"
          >
            <Image
              src="/images/contact_phone.webp"
              alt="Ring"
              width={40}
              height={50}
              className="object-contain"
            />
            <span className="text-lg">Ring oss direkt!</span>
          </motion.a>
        </div>
      </div>

      {/* Bottom contact info */}
      <div className="relative z-20 py-8 px-4 bg-gradient-to-t from-black to-transparent">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
        >
          {/* Email */}
          <motion.a
            href="mailto:hej@dg97.se"
            className="group flex items-center gap-3 text-white/60 hover:text-accent transition-colors"
            whileHover={{ scale: 1.05 }}
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
            <span className="font-mono text-sm">hej@dg97.se</span>
          </motion.a>

          {/* Divider */}
          <span className="hidden sm:block w-px h-6 bg-white/20" />

          {/* Phone */}
          <motion.a
            href="tel:+34654161231"
            className="group flex items-center gap-3 text-white/60 hover:text-accent transition-colors"
            whileHover={{ scale: 1.05 }}
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
            <span className="font-mono text-sm">+34 654 161 231</span>
          </motion.a>

          {/* Divider */}
          <span className="hidden sm:block w-px h-6 bg-white/20" />

          {/* Fun note */}
          <span className="text-white/30 text-xs italic">
            😎 På semester i Spanien
          </span>
        </motion.div>
      </div>
    </section>
  );
}
