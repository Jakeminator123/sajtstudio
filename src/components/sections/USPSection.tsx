"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useMounted } from "@/hooks/useMounted";
import { uspContent } from "@/config/content/usps";

interface USPFeatureProps {
  number: string;
  title: string;
  description: string;
  delay?: number;
}

function USPFeature({
  number,
  title,
  description,
  delay = 0,
}: USPFeatureProps) {
  const ref = useRef(null);
  const mounted = useMounted();
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Scroll-based color animation for title
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "center center", "end center"],
  });

  // Use rgba format consistently to avoid hydration mismatch (Framer Motion converts rgb to rgba)
  const titleColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgba(255, 255, 255, 1)", "rgba(255, 0, 51, 1)", "rgba(255, 0, 51, 1)"]
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative overflow-hidden"
      whileHover={{ x: 4 }}
    >
      {/* Animated border line with gradient */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{
          duration: 1.2,
          delay: delay + 0.2,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="absolute top-0 left-0 right-0 h-px origin-left"
        style={{
          backgroundImage:
            "linear-gradient(to right, transparent, rgba(0, 102, 255, 0.3), rgba(156, 163, 175, 1), transparent)",
        }}
      />

      {/* Enhanced hover background effect with blue/gray */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500
          ${
            parseInt(number) % 2 === 0
              ? "from-accent/8 via-accent/4 to-transparent"
              : "from-gray-900/8 via-gray-800/4 to-transparent"
          }`}
        initial={{ x: "-100%" }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.5 }}
      />

      <div className="pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 md:gap-8 relative">
          {/* Number with enhanced animation and glow */}
          <motion.span
            initial={{ opacity: 0, x: -30, scale: 0.8 }}
            animate={
              isInView
                ? { opacity: 1, x: 0, scale: 1 }
                : { opacity: 0, x: -30, scale: 0.8 }
            }
            transition={{
              duration: 0.8,
              delay: delay + 0.3,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            whileHover={{ scale: 1.1 }}
            className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black transition-all duration-500 leading-none sm:min-w-[120px] relative
              ${
                parseInt(number) % 2 === 0
                  ? "text-gray-200 group-hover:text-accent"
                  : "text-gray-200 group-hover:text-tertiary"
              }`}
          >
            {number}
            {/* Glow effect on hover */}
            <motion.span
              className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-50
                ${
                  parseInt(number) % 2 === 0 ? "text-accent" : "text-tertiary"
                }`}
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.2 }}
            >
              {number}
            </motion.span>
          </motion.span>

          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.8,
              delay: delay + 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <motion.h3
              style={mounted ? { color: titleColor } : { color: "rgba(255, 255, 255, 1)" }}
              className="text-h2 font-bold mb-6 leading-tight"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
              suppressHydrationWarning
            >
              {title}
            </motion.h3>
            <motion.p
              className="text-lg text-gray-600 leading-relaxed max-w-2xl"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
            >
              {description}
            </motion.p>
          </motion.div>

          {/* Enhanced hover effect line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileHover={{ scaleY: 1 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className={`absolute left-0 top-0 bottom-0 w-1 origin-top shadow-lg
              ${parseInt(number) % 2 === 0 ? "bg-accent" : "bg-tertiary"}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function USPSection() {
  const sectionRef = useRef(null);
  const mounted = useMounted();
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Scroll-based animations for title
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center", "end start"],
  });

  // Interpolate color from white to red (tertiary) as it comes into center
  // Use rgba format consistently to avoid hydration mismatch (Framer Motion converts rgb to rgba)
  const titleColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgba(255, 255, 255, 1)", "rgba(255, 0, 51, 1)", "rgba(255, 0, 51, 1)"]
  );

  // Slide out to sides when scrolling past
  const titleX = useTransform(scrollYProgress, [0.7, 1], [0, -200]);
  const titleOpacity = useTransform(scrollYProgress, [0.7, 1], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="py-32 md:py-48 bg-black overflow-hidden relative"
    >
      {/* Dynamic background with multiple gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black pointer-events-none z-0" />

      {/* Animated large blue glow */}
      <motion.div
        className="absolute -top-1/2 -left-1/4 w-full h-full bg-accent/8 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated red glow accent */}
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary/8 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          scale: [1, 0.9, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-4xl mx-auto mb-24"
        >
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={mounted ? {
                color: titleColor,
                x: titleX,
                opacity: typeof titleOpacity === 'number' ? titleOpacity : (titleOpacity?.get?.() ?? 1),
              } : {
                color: "rgba(255, 255, 255, 1)",
                x: 0,
                opacity: 1,
              }}
              className="text-hero md:text-display font-black mb-8 leading-[0.9] text-center"
              suppressHydrationWarning
            >
              {uspContent.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="text-h3 text-gray-700 mb-6 font-medium"
            >
              {uspContent.subtitle}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
            >
              {uspContent.description}
            </motion.p>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto mb-16">
          <div className="space-y-0">
            {uspContent.features.map((feature, index) => (
              <USPFeature
                key={feature.number}
                number={feature.number}
                title={feature.title}
                description={feature.description}
                delay={index * 0.15}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          <motion.p
            className="text-h4 font-semibold mb-8 text-gray-800"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {uspContent.tagline}
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href={uspContent.cta.href}
              className="inline-block px-10 py-5 bg-black text-white text-lg font-semibold hover:bg-accent transition-all duration-300 transform relative overflow-hidden group"
            >
              {/* Shimmer effect */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10">{uspContent.cta.buttonText}</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
