"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import WordReveal from "@/components/animations/WordReveal";
import SmokeEffect from "@/components/animations/SmokeEffect";
import { designTokens } from "@/config/designTokens";

const testimonials = [
  {
    quote:
      "De har lyft vår verksamhet med 50-100% på bara sex månader. Helt otrolig investering.",
    author: "Joakim Hallsten",
    company: "Raymond Media",
    role: "VD",
    highlight: "50-100% tillväxt",
  },
  {
    quote:
      "My sister site just runs flawless. Zero downtime, zero headaches.",
    author: "PYNN AI",
    company: "pynn.ai",
    role: "AI Startup",
    highlight: "Felfri drift",
  },
  {
    quote:
      "Cutting edge data knowledge. They understand what modern tech can do.",
    author: "Prometheus Team",
    company: "promethius.com",
    role: "Tech Company",
    highlight: "Framkant",
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

  return (
    <motion.section
      ref={sectionRef}
      className="section-spacing-md bg-black text-white relative overflow-hidden"
      style={{
        opacity,
        scale
      }}
    >
      {/* Background layers - much darker */}
      <div className="absolute inset-0 min-h-full">
        {/* GIF background only */}
        <Image
          src="/images/animations/hero-animation.gif"
          alt=""
          fill
          className="object-cover"
          style={{ opacity: 0.15 }}
          sizes="100vw"
          loading="lazy"
          unoptimized
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Smoke effect */}
      <SmokeEffect count={3} speed={30} opacity={0.08} />


      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section header */}
        <motion.div
          className="mb-16 md:mb-24 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: Number(designTokens.animation.duration.slow.replace('s', '')),
            ease: designTokens.animation.framerEasing.smooth
          }}
        >
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none tracking-tight">
            <WordReveal
              text="Vad Våra Kunder Säger"
              className="bg-gradient-to-r from-white to-tertiary bg-clip-text text-transparent"
            />
          </h2>
          <motion.p
            className="text-2xl md:text-3xl text-white/80 max-w-3xl mx-auto font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Läs vad våra kunder säger om att arbeta med oss
          </motion.p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                delay: index * 0.15,
                duration: Number(designTokens.animation.duration.slow.replace('s', '')),
                ease: designTokens.animation.framerEasing.smooth,
              }}
              className="group relative bg-white/5 backdrop-blur-md p-8 hover:bg-white/10 transition-all duration-500 border border-white/10 hover:border-accent/50"
            >
              {/* Highlight badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.2 }}
                className="inline-block px-4 py-2 mb-6 text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-accent to-tertiary text-white rounded-full shadow-[0_0_30px_rgba(0,102,255,0.4)]"
              >
                {testimonial.highlight}
              </motion.div>

              {/* Quote */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.3 }}
                className="text-white/80 text-lg md:text-xl leading-relaxed mb-6 italic"
              >
                &ldquo;{testimonial.quote}&rdquo;
              </motion.p>

              {/* Author */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.4 }}
                className="border-t border-white/20 pt-6"
              >
                <div className="font-bold text-white text-lg">{testimonial.author}</div>
                <div className="text-sm text-white/60">
                  {testimonial.role}, {testimonial.company}
                </div>
              </motion.div>

              {/* Accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-tertiary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
