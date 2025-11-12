"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import WordReveal from "./WordReveal";
import SmokeEffect from "./SmokeEffect";
import { designTokens } from "@/config/designTokens";

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

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5]);

  return (
    <motion.section
      ref={sectionRef}
      className="section-spacing-md bg-white text-gray-900 relative overflow-hidden"
      style={{
        opacity,
        scale,
        perspective: 1000,
        rotateY
      }}
    >
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        {/* Main background image */}
        <Image
          src="/images/hero/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp"
          alt=""
          fill
          className="object-cover"
          style={{ opacity: 0.5 }}
          sizes="100vw"
          priority={false}
        />

        {/* GIF overlay for subtle animation */}
        <img
          src="/images/hero/hero-animation.gif"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.3, mixBlendMode: 'screen' }}
          loading="lazy"
        />

        {/* White overlay for readability */}
        <div className="absolute inset-0 bg-white/70" />
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
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-none">
            <WordReveal
              text="Vår Process"
              className="bg-gradient-to-r from-gray-900 via-accent to-gray-900 bg-clip-text text-transparent"
            />
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            <WordReveal
              text="Från idé till lansering - så jobbar vi"
              delay={0.3}
              staggerDelay={0.05}
              className="text-gray-600"
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
              className="group relative bg-white/50 backdrop-blur-sm p-6 rounded-sm hover:bg-white/90 transition-all duration-500 border border-gray-100"
            >
              {/* Number indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-accent-dark text-white font-mono text-2xl font-bold mb-6 group-hover:scale-110 transition-all duration-300 rounded-sm shadow-lg"
              >
                {step.number}
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.3 }}
                className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-accent group-hover:to-accent-dark transition-all duration-300"
              >
                {step.title}
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.4 }}
                className="text-gray-700 text-lg leading-relaxed"
              >
                {step.description}
              </motion.p>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.5, duration: 0.8 }}
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-transparent origin-left"
                style={{ width: "80%" }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
