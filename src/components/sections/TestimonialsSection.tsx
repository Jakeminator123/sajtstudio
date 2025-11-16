"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import { useRef, useEffect } from "react";
import { useMounted } from "@/hooks/useMounted";
import WordReveal from "@/components/animations/WordReveal";
import SmokeEffect from "@/components/animations/SmokeEffect";
import { designTokens } from "@/config/designTokens";
import { useViewportVisibility } from "@/hooks/useViewportVisibility";

const testimonials = [
  {
    quote:
      "Sajtstudio levererade en hemsida som överträffade alla våra förväntningar. Deras kreativa approach och tekniska expertis är oslagbar.",
    author: "Anna Svensson",
    company: "Tech Innovations AB",
    role: "VD",
  },
  {
    quote:
      "Professionellt, snabbt och resultatorienterat. Vår nya hemsida har ökat våra konverteringar med 150%.",
    author: "Erik Johansson",
    company: "Nordic Design Studio",
    role: "Grundare",
  },
  {
    quote:
      "Det bästa beslutet vi gjorde för vår digitala närvaro. Sajtstudio förstod vår vision och gjorde den verklig.",
    author: "Maria Andersson",
    company: "Creative Agency",
    role: "Creative Director",
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useMounted();

  // Only enable scroll animations when section is visible
  const { ref: visibilityRef, isVisible: isSectionVisible } = useViewportVisibility({
    threshold: 0.1,
    rootMargin: "-200px",
  });

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
    layoutEffect: false, // Don't trigger layout recalculations
  });

  // Create reactive value for visibility check
  const isVisibleValue = useMotionValue(mounted && isSectionVisible ? 1 : 0);
  
  useEffect(() => {
    isVisibleValue.set(mounted && isSectionVisible ? 1 : 0);
  }, [mounted, isSectionVisible, isVisibleValue]);

  // Only calculate transforms when section is visible and mounted
  const opacity = useTransform([scrollYProgress, isVisibleValue], ([value, visible]: number[]) => {
    return visible > 0 ? (value < 0.2 ? 0.3 + (value / 0.2) * 0.7 : value > 0.8 ? 1 - ((value - 0.8) / 0.2) * 0.7 : 1) : 1;
  });
  const scale = useTransform([scrollYProgress, isVisibleValue], ([value, visible]: number[]) => {
    return visible > 0 ? (value < 0.2 ? 0.95 + (value / 0.2) * 0.05 : value > 0.8 ? 1 - ((value - 0.8) / 0.2) * 0.05 : 1) : 1;
  });

  // Set visibility ref to section ref
  useEffect(() => {
    if (sectionRef.current && visibilityRef.current !== sectionRef.current) {
      (visibilityRef as any).current = sectionRef.current;
    }
  }, []);

  return (
    <motion.section
      ref={(node) => {
        sectionRef.current = node;
        if (visibilityRef && typeof visibilityRef === 'object' && 'current' in visibilityRef) {
          (visibilityRef as any).current = node;
        }
      }}
      className="section-spacing-md bg-black text-white relative overflow-hidden"
      style={mounted ? {
        opacity, 
        scale 
      } : {
        opacity: 1,
        scale: 1
      }}
      suppressHydrationWarning
    >
      {/* Background layers - much darker */}
      <div className="absolute inset-0">
        {/* GIF background only */}
        <img
          src="/images/animations/hero-animation.gif"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.15 }}
          loading="lazy"
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Smoke effect */}
      <SmokeEffect count={3} speed={30} opacity={0.08} />


      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section header */}
        <motion.div
          className="mb-12 sm:mb-16 md:mb-24 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: Number(designTokens.animation.duration.slow.replace('s', '')),
            ease: designTokens.animation.framerEasing.smooth
          }}
        >
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 sm:mb-8 leading-none tracking-tight">
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
              className="group relative bg-white/5 backdrop-blur-md p-6 sm:p-8 md:p-10 hover:bg-white/10 transition-all duration-500 border border-white/10 hover:border-accent/50"
            >
              {/* Quote icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.2 }}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent/30 via-tertiary/20 to-accent/10 flex items-center justify-center mb-4 sm:mb-6 rounded-lg shadow-[0_0_20px_rgba(0,102,255,0.3)]"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-accent"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </motion.div>

              {/* Quote */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.3 }}
                className="text-white/80 text-lg md:text-xl leading-relaxed mb-4 sm:mb-6 italic"
              >
                "{testimonial.quote}"
              </motion.p>

              {/* Author */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.4 }}
                className="border-t border-white/20 pt-4 sm:pt-6"
              >
                <div className="font-bold text-white text-base sm:text-lg">{testimonial.author}</div>
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
