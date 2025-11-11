"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Scroll-based parallax - using window scroll for better compatibility
  const { scrollYProgress } = useScroll({
    layoutEffect: false,
  });

  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const imageY1 = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  const imageY2 = useTransform(scrollYProgress, [0, 0.5], [0, 30]);
  const imageY3 = useTransform(scrollYProgress, [0, 0.5], [0, -20]);

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set video playback rate for cinematic effect
  useEffect(() => {
    const video = videoRef.current;
    if (video && !videoError) {
      // Handle video errors gracefully
      const handleError = () => {
        console.warn("Video failed to load, using fallback background");
        setVideoError(true);
      };

      // Wait for video to be loaded before setting playback rate
      const handleLoadedMetadata = () => {
        try {
          video.playbackRate = 0.3;
        } catch (error) {
          console.warn("Failed to set video playback rate:", error);
        }
      };

      video.addEventListener("error", handleError);

      if (video.readyState >= 1) {
        // Video metadata already loaded
        handleLoadedMetadata();
      } else {
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
      }

      return () => {
        video.removeEventListener("error", handleError);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [videoError]);

  // Generate stable particle positions (only on client)
  const particles = mounted
    ? Array.from({ length: 20 }, (_, i) => {
        // Use index as seed for consistent positioning
        const seed = i * 0.618033988749895; // Golden ratio for better distribution
        return {
          left: (seed * 100) % 100,
          top: (seed * 1.618 * 100) % 100,
          duration: 3 + (seed % 2),
          delay: seed % 2,
        };
      })
    : [];

  return (
    <motion.section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black"
    >
      {/* Dynamic video background with image overlays - only render on client */}
      {mounted && (
        <motion.div className="absolute inset-0 z-0" style={{ y }}>
          {/* Primary video - telephone_ringin.mp4 (telefon som blir superdator) */}
          {!videoError && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/images/hero/alt_background.webp"
              className="w-full h-full object-cover hero-video-opacity"
              onError={() => {
                // Silently handle video errors - fallback to poster image
                setVideoError(true);
              }}
            >
              <source src="/videos/telephone_ringin.mp4" type="video/mp4" />
              <source src="/videos/noir_hero.mp4" type="video/mp4" />
              <source src="/videos/background_vid.mp4" type="video/mp4" />
            </video>
          )}

          {/* Main background image - alt_background.webp with beautiful animation */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.02, 1],
            }}
            transition={{
              opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
              initial: { duration: 3, ease: "easeOut" },
            }}
            style={{ y: imageY1 }}
          >
            <Image
              src="/images/hero/alt_background.webp"
              alt=""
              fill
              className="object-cover mix-blend-overlay"
              priority
              unoptimized
            />
            {/* Subtle glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-tertiary/10"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Secondary background images with parallax effect */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 2, delay: 0.5 }}
            style={{ y: imageY2 }}
          >
            <Image
              src="/images/hero/future_whoman.webp"
              alt=""
              fill
              className="object-cover opacity-20 mix-blend-overlay"
              unoptimized
            />
          </motion.div>

          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 2, delay: 1 }}
            style={{ y: imageY3 }}
          >
            <Image
              src="/images/hero/city-background.webp"
              alt=""
              fill
              className="object-cover opacity-15 mix-blend-overlay"
              unoptimized
            />
          </motion.div>

          {/* Elegant dark overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black/80" />

          {/* Subtle color accents */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-tertiary/20" />
        </motion.div>
      )}

      {/* Static fallback for SSR */}
      {!mounted && (
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/85" />
          <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-tertiary/15" />
        </div>
      )}

      {/* Animated background patterns - Subtle and elegant - only on client */}
      {mounted && (
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          {/* Single subtle radial gradient */}
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,255,0.15),transparent_70%)]"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}

      {/* Floating particles effect */}
      {mounted && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 max-w-6xl">
        <motion.div style={{ opacity }}>
          {/* Main heading with massive impact */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-display font-black leading-[0.9] tracking-tight mb-6 sm:mb-8 text-white text-center"
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Bygger
            </motion.span>
            <motion.span
              className="block text-accent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
            >
              hemsidor
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              som betyder
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              något.
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-12 text-center leading-relaxed"
          >
            Vi skapar skräddarsydda, toppmoderna webbplatser för företag som
            vill sticka ut och leda inom sin bransch.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1.2,
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.a
              href="/contact"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(0, 102, 255, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-accent text-white font-bold text-lg rounded-none hover:bg-accent-hover transition-all duration-300 shadow-lg shadow-accent/50 relative overflow-hidden group"
            >
              <motion.span
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10">Starta ditt projekt</span>
            </motion.a>
            <motion.a
              href="/portfolio"
              whileHover={{
                scale: 1.05,
                backgroundColor: "white",
                color: "black",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 border-2 border-white text-white font-bold text-lg rounded-none hover:bg-white hover:text-black transition-all duration-300 relative overflow-hidden group"
            >
              <motion.span
                className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-10"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10">Se våra arbeten</span>
            </motion.a>
          </motion.div>

          {/* Animated accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: 1.5,
              duration: 1.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="mt-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent origin-center"
          />
        </motion.div>
      </div>

      {/* Modern scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-xs font-medium tracking-wider uppercase">
            Scrolla
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-current"
          >
            <path
              d="M10 4v10m0 0l-3-3m3 3l3-3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
