"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import { useMounted } from "@/hooks/useMounted";
import WordReveal from "@/components/animations/WordReveal";
import SmokeEffect from "@/components/animations/SmokeEffect";
import { designTokens } from "@/config/designTokens";
import { useViewportVisibility } from "@/hooks/useViewportVisibility";

const processSteps = [
  {
    number: "01",
    title: "Upptäckt",
    description:
      "Vi börjar med att förstå ditt företag, dina mål och din målgrupp. Genom research och workshops identifierar vi möjligheter och utmaningar.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "Vi skapar wireframes och prototyper som visualiserar din framtida hemsida. Varje pixel är genomtänkt för att maximera användarupplevelsen.",
  },
  {
    number: "03",
    title: "Utveckling",
    description:
      "Vi bygger din hemsida med modern teknologi som Next.js och React. Resultatet är snabbt, säkert och skalbart.",
  },
  {
    number: "04",
    title: "Lansering",
    description:
      "Vi testar noggrant, optimerar för SEO och prestanda, och lanserar din nya hemsida. Men det slutar inte där - vi fortsätter att stötta dig.",
  },
];

export default function ProcessSection() {
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

  // Only calculate transforms when section is visible and mounted
  // Use conditional logic in transform function instead of ternary in array
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], (value) => {
    return mounted && isSectionVisible ? (value < 0.2 ? 0.3 + (value / 0.2) * 0.7 : value > 0.8 ? 1 - ((value - 0.8) / 0.2) * 0.7 : 1) : 1;
  });
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], (value) => {
    return mounted && isSectionVisible ? (value < 0.2 ? 0.95 + (value / 0.2) * 0.05 : value > 0.8 ? 1 - ((value - 0.8) / 0.2) * 0.05 : 1) : 1;
  });
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], (value) => {
    return mounted && isSectionVisible ? (value < 0.5 ? -5 + (value / 0.5) * 5 : 5 - ((value - 0.5) / 0.5) * 5) : 0;
  });

  // Set visibility ref to section ref
  useEffect(() => {
    if (sectionRef.current && visibilityRef.current !== sectionRef.current) {
      (visibilityRef as any).current = sectionRef.current;
    }
  }, [mounted]);

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
        scale,
        perspective: 1000,
        rotateY
      } : {
        opacity: 1,
        scale: 1,
        perspective: 1000,
        rotateY: 0
      }}
      suppressHydrationWarning
    >
      {/* Background layers - much darker */}
      <div className="absolute inset-0 z-0">
        {/* Main background image */}
        <Image
          src="/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp"
          alt=""
          fill
          className="object-cover"
          style={{ opacity: 0.15 }}
          sizes="100vw"
          priority={false}
        />

        {/* GIF overlay for subtle animation */}
        <img
          src="/images/animations/hero-animation.gif"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.1, mixBlendMode: 'screen' }}
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
              text="Vår Process"
              className="bg-gradient-to-r from-white to-tertiary bg-clip-text text-transparent"
            />
          </h2>
          <p className="text-2xl md:text-3xl text-white/80 max-w-3xl mx-auto font-medium">
            <WordReveal
              text="Från idé till lansering - så jobbar vi"
              delay={0.3}
              staggerDelay={0.05}
              className="text-white/80"
            />
          </p>
        </motion.div>

        {/* Process steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                delay: index * 0.15,
                duration: Number(designTokens.animation.duration.slow.replace('s', '')),
                ease: designTokens.animation.framerEasing.smooth,
              }}
              className="group relative bg-white/5 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-lg hover:bg-white/10 transition-all duration-500 border border-white/10 hover:border-accent/50"
            >
              {/* Number indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-accent via-tertiary to-accent-dark text-white font-mono text-xl sm:text-2xl md:text-3xl font-black mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-300 rounded-lg shadow-[0_0_30px_rgba(0,102,255,0.5)]"
              >
                {step.number}
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.3 }}
                className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-accent to-tertiary bg-clip-text text-transparent group-hover:from-accent group-hover:via-tertiary group-hover:to-accent transition-all duration-300"
              >
                {step.title}
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.4 }}
                className="text-white/70 text-lg md:text-xl leading-relaxed"
              >
                {step.description}
              </motion.p>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.5, duration: 0.8 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-accent via-tertiary to-transparent origin-left w-4/5"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
