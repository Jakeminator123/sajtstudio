"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import WordReveal from "./WordReveal";
import SmokeEffect from "./SmokeEffect";
import { designTokens } from "@/config/designTokens";

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
      className="section-spacing-md bg-white text-gray-900 relative overflow-hidden"
      style={{ 
        opacity, 
        scale 
      }}
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* GIF background only */}
        <img
          src="/images/hero/hero-animation.gif"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.6 }}
          loading="eager"
        />

        {/* White overlay for readability */}
        <div className="absolute inset-0 bg-white/40" />
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
              text="Vad Våra Kunder Säger"
              className="bg-gradient-to-r from-gray-900 via-accent to-gray-900 bg-clip-text text-transparent"
            />
          </h2>
          <motion.p
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
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
              className="group relative bg-white/90 backdrop-blur-sm p-8 hover:shadow-2xl hover:bg-white transition-all duration-500 border border-gray-100"
            >
              {/* Quote icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.2 }}
                className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 rounded-sm"
              >
                <svg
                  className="w-6 h-6 text-accent"
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
                className="text-gray-700 text-lg leading-relaxed mb-6 italic"
              >
                "{testimonial.quote}"
              </motion.p>

              {/* Author */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.4 }}
                className="border-t border-gray-200 pt-6"
              >
                <div className="font-bold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-600">
                  {testimonial.role}, {testimonial.company}
                </div>
              </motion.div>

              {/* Accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-accent-light to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
