"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
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
  const ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse move handler for magnetic effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      setMousePos({ x, y });
    }
  };

  // Scroll-based color animation for service titles
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
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered
          ? `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) rotateX(${
              -mousePos.y * 0.5
            }deg) rotateY(${mousePos.x * 0.5}deg)`
          : undefined,
      }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Animated border line with gradient - enhanced with blue/gray */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{
          duration: 1.2,
          delay: delay + 0.2,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent origin-left"
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
            whileHover={{
              scale: 1.15,
              rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
              y: isHovered ? [0, -10, 0] : 0,
              transition: { duration: 0.5 },
            }}
            className={`text-8xl md:text-9xl font-black transition-all duration-500 leading-none relative
              ${
                parseInt(number) % 2 === 0
                  ? "text-gray-100 group-hover:text-accent"
                  : "text-gray-100 group-hover:text-tertiary"
              }`}
            style={{
              transform: isHovered
                ? `perspective(1000px) rotateY(${
                    mousePos.x * 0.5
                  }deg) rotateX(${-mousePos.y * 0.5}deg)`
                : undefined,
            }}
          >
            {number}
            {/* Glow effect */}
            <motion.span
              className={`absolute inset-0 blur-2xl opacity-0 group-hover:opacity-60 scale-[0.8]
                ${
                  parseInt(number) % 2 === 0 ? "text-accent" : "text-tertiary"
                }`}
              animate={{ scale: isHovered ? 1.5 : 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {number}
            </motion.span>
            {/* Fantasy-style floating particles */}
            {isHovered && (
              <>
                <motion.span
                  className="absolute -top-4 -right-4 w-3 h-3 bg-tertiary rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [-10, -30, -50],
                    x: [0, 20, 40],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.span
                  className="absolute -bottom-4 -left-4 w-3 h-3 bg-accent rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [10, 30, 50],
                    x: [0, -20, -40],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
                />
                <motion.span
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.7, 0],
                    scale: [0.5, 1.5, 0.5],
                    x: [-10, 10, -10],
                    y: [-10, 10, -10],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}
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
              ref={titleRef}
              style={{ color: titleColor }}
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
  const sectionRef = useRef<HTMLElement>(null);
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
      className="py-16 sm:py-24 md:py-32 lg:py-48 bg-black relative overflow-hidden"
    >
      {/* Dynamic background with multiple gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black pointer-events-none z-0" />

      {/* Animated large blue glow */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-accent/7 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated red glow accent */}
      <motion.div
        className="absolute -bottom-1/2 right-1/4 w-full h-full bg-tertiary/8 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          scale: [1, 0.95, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      <motion.div className="max-w-4xl mx-auto">
        {/* Animated heading with scroll-based color */}
        <motion.h2
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ color: headingColor }}
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

        {/* Bottom accent line - enhanced with blue/gray gradient */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="h-px mt-20 origin-center"
          style={{
            backgroundImage:
              "linear-gradient(to right, transparent, rgba(0, 102, 255, 0.6), rgba(75, 85, 99, 1), rgba(0, 102, 255, 0.6), transparent)",
          }}
        />
      </motion.div>
    </section>
  );
}
