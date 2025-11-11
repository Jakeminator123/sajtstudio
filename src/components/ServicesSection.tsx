"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { designTokens } from "@/config/designTokens";

interface ServiceItemProps {
  number: string;
  title: string;
  description: string;
  delay?: number;
}

function ServiceItem({
  number,
  title,
  description,
  delay = 0,
}: ServiceItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative"
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
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent origin-left"
      />

      {/* Hover background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100"
        initial={{ x: "-100%" }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.5 }}
      />

      <div className="pt-16 pb-20 relative z-10">
        <div className="flex items-start gap-8">
          {/* Animated number with glow */}
          <motion.span
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={
              isInView
                ? { opacity: 1, scale: 1, rotate: 0 }
                : { opacity: 0, scale: 0.8, rotate: -10 }
            }
            transition={{
              duration: 0.8,
              delay: delay + 0.3,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            whileHover={{ scale: 1.15, rotate: 5 }}
            className={`text-8xl md:text-9xl font-black transition-all duration-500 leading-none relative
              ${
                parseInt(number) % 2 === 0
                  ? "text-gray-100 group-hover:text-accent"
                  : "text-gray-100 group-hover:text-tertiary"
              }`}
          >
            {number}
            {/* Glow effect */}
            <motion.span
              className={`absolute inset-0 blur-2xl opacity-0 group-hover:opacity-60
                ${
                  parseInt(number) % 2 === 0 ? "text-accent" : "text-tertiary"
                }`}
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.3 }}
            >
              {number}
            </motion.span>
          </motion.span>

          {/* Content with staggered animation */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{
              duration: 0.8,
              delay: delay + 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <motion.h3
              className="text-h2 font-bold mb-6 leading-tight"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
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

          {/* Enhanced interactive hover element */}
          <motion.div
            className={`absolute -left-4 top-16 w-1 h-24 opacity-0 group-hover:opacity-100 shadow-lg
              ${parseInt(number) % 2 === 0 ? "bg-accent" : "bg-tertiary"}`}
            initial={{ scaleY: 0 }}
            whileHover={{ scaleY: 1 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [videoError, setVideoError] = useState(false);

  const services = [
    {
      number: "01",
      title: "Modern Design",
      description:
        "Vi skapar visuellt imponerande hemsidor som fångar besökarens uppmärksamhet och kommunicerar ditt varumärkes värde på ett kraftfullt sätt.",
    },
    {
      number: "02",
      title: "Teknisk Excellens",
      description:
        "Varje hemsida är byggd med senaste tekniker för optimal prestanda, säkerhet och sökmotoroptimering. Snabb, säker och skalbär.",
    },
    {
      number: "03",
      title: "Skräddarsydda Lösningar",
      description:
        "Inga mallar eller generiska lösningar. Varje projekt är unikt designat och utvecklat specifikt för ditt företags behov och mål.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 md:py-32 lg:py-48 bg-white relative overflow-hidden"
    >
      {/* Subtle background video pattern - only load when in view */}
      {isInView && !videoError && (
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover scale-150 video-filter"
            onError={() => {
              setVideoError(true);
            }}
          >
            <source src="/videos/noir_hero.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {/* Subtle image texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/hero/future_whoman.webp')] bg-cover bg-center bg-no-repeat" />
      </div>

      {/* Background accent */}
      <motion.div
        className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-50/80 to-transparent opacity-50 z-0"
        initial={{ x: "100%" }}
        animate={isInView ? { x: 0 } : { x: "100%" }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-tertiary/5 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2 }}
      />

      <div className="container mx-auto px-6 relative">
        <motion.div className="max-w-4xl mx-auto">
          {/* Animated heading */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-hero md:text-display font-black mb-24 text-center leading-[0.9]"
          >
            Vad vi erbjuder
          </motion.h2>

          {/* Services list */}
          <div className="space-y-0">
            {services.map((service, index) => (
              <ServiceItem
                key={service.number}
                number={service.number}
                title={service.title}
                description={service.description}
                delay={index * 0.15}
              />
            ))}
          </div>

          {/* Bottom accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{
              duration: 1.2,
              delay: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="h-px bg-gradient-to-r from-transparent via-accent to-transparent mt-20 origin-center"
          />
        </motion.div>
      </div>
    </section>
  );
}
