"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { processSteps } from "@/config/content/process";

interface ProcessStepProps {
  step: (typeof processSteps)[0];
  index: number;
}

function ProcessStep({ step, index }: ProcessStepProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Scroll-based color animation for title
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "center center", "end center"],
  });

  const titleColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgb(255, 255, 255)", "rgb(255, 0, 51)", "rgb(255, 0, 51)"]
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="group relative"
      onMouseEnter={() => {
        setIsHovered(true);
        setRotation(Math.random() * 10 - 5); // Random rotation between -5 and 5 degrees
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotation(0);
      }}
      whileHover={{ x: 10, scale: 1.02 }}
      style={{
        transform: isHovered ? `rotate(${rotation}deg)` : undefined,
        transition: "transform 0.3s ease-out",
      }}
    >
      <div className="border-t border-gray-800 pt-8 pb-12 relative">
        {/* Enhanced hover background effect with blue/gray */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500
            ${
              parseInt(step.number) % 2 === 0
                ? "from-accent/8 via-accent/4 to-transparent"
                : "from-gray-900/8 via-gray-800/4 to-transparent"
            }`}
          initial={{ x: "-100%" }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.5 }}
        />

        <div className="flex items-start gap-6 relative z-10">
          <motion.span
            className={`text-6xl md:text-8xl font-black transition-all duration-500 relative
              ${
                parseInt(step.number) % 2 === 0
                  ? "text-gray-200 group-hover:text-accent"
                  : "text-gray-200 group-hover:text-tertiary"
              }`}
            animate={{
              rotate: isHovered ? [0, -15, 15, -15, 0] : 0,
              y: isHovered ? [0, -20, 0] : 0,
            }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.2 }}
          >
            {step.number}
            {/* Glow effect */}
            <motion.span
              className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 scale-[0.8]
                ${
                  parseInt(step.number) % 2 === 0
                    ? "text-accent"
                    : "text-tertiary"
                }`}
              animate={{ scale: isHovered ? 1.4 : 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {step.number}
            </motion.span>
            {/* Orbiting dots */}
            {isHovered && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <span className="absolute -top-2 left-1/2 w-2 h-2 bg-accent rounded-full -translate-x-1/2" />
                <span className="absolute -right-2 top-1/2 w-2 h-2 bg-tertiary rounded-full -translate-y-1/2" />
                <span className="absolute -bottom-2 left-1/2 w-2 h-2 bg-accent rounded-full -translate-x-1/2" />
                <span className="absolute -left-2 top-1/2 w-2 h-2 bg-tertiary rounded-full -translate-y-1/2" />
              </motion.div>
            )}
          </motion.span>
          <motion.div
            className="flex-1"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.h3
              ref={titleRef}
              style={{ color: titleColor }}
              className="text-3xl md:text-4xl font-bold mb-4"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {step.title}
            </motion.h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProcessSection() {
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

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-black relative overflow-hidden"
    >
      {/* Dynamic background with multiple gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black pointer-events-none z-0" />

      {/* Animated blue glow */}
      <motion.div
        className="absolute top-1/4 -right-1/4 w-full h-full bg-accent/8 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated red glow accent */}
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-tertiary/7 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          scale: [1, 0.85, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-4xl mx-auto mb-16"
        >
          <motion.h2
            ref={headingRef}
            style={{ color: headingColor }}
            className="text-hero md:text-display font-black mb-6 text-center leading-[0.9]"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            Så här arbetar vi
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            En strukturerad process som säkerställer resultat
          </motion.p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="space-y-0">
            {processSteps.map((step, index) => (
              <ProcessStep key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
