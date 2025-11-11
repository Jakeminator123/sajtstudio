"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { testimonials } from "@/config/content/testimonials";

interface TestimonialCardProps {
  testimonial: (typeof testimonials)[0];
  index: number;
}

function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 30, scale: 0.95 }
      }
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="bg-gray-900 p-8 rounded-lg border border-gray-700 hover:border-accent transition-all duration-300 group relative overflow-hidden"
      whileHover={{ y: -4, scale: 1.02 }}
    >
      {/* Hover background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />

      <div className="relative z-10">
        <motion.div
          className="flex gap-1 mb-4"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          {[...Array(testimonial.rating)].map((_, i) => (
            <motion.span
              key={i}
              className="text-tertiary text-xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={
                isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }
              }
              transition={{
                delay: index * 0.1 + i * 0.05,
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              ★
            </motion.span>
          ))}
        </motion.div>
        <motion.p
          className="text-lg text-gray-200 mb-6 italic"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          "{testimonial.quote}"
        </motion.p>
        <div className="border-t border-gray-700 pt-4">
          <motion.p
            className="font-semibold text-white"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            {testimonial.name}
          </motion.p>
          <p className="text-sm text-gray-400">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Scroll-based color animation for heading
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "center center", "end center"],
  });

  // Interpolate color from white to red (tertiary) as it comes into center
  const headingColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgb(255, 255, 255)", "rgb(255, 0, 51)", "rgb(255, 0, 51)"]
  );

  // Parallax effect for background glows
  const glowY1 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const glowY2 = useTransform(scrollYProgress, [0, 1], [0, 25]);

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-black relative overflow-hidden"
    >
      {/* Dynamic background with multiple gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black pointer-events-none z-0" />

      {/* Animated blue glow */}
      <motion.div
        className="absolute -top-1/3 right-1/4 w-full h-full bg-accent/8 rounded-full blur-3xl pointer-events-none z-0"
        style={{ y: glowY1 }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated red glow accent */}
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary/7 rounded-full blur-3xl pointer-events-none z-0"
        style={{ y: glowY2 }}
        animate={{
          scale: [1, 0.85, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <motion.h2
            ref={headingRef}
            style={{ color: headingColor }}
            className="text-hero md:text-display font-black mb-6 leading-[0.9] text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            Vad våra kunder säger
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            Resultat som talar för sig själva
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
