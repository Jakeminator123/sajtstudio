"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { featuredProjects } from "@/data/projects";
import { useTheme } from "@/hooks/useTheme";

export default function PortfolioSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { isLight } = useTheme();

  // Scroll-based animations for heading
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center", "end start"],
  });

  // Interpolate color from white to red (tertiary) as it comes into center
  const headingColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgb(255, 255, 255)", "rgb(255, 0, 51)", "rgb(255, 0, 51)"]
  );

  // Slide out to right when scrolling past
  const headingX = useTransform(scrollYProgress, [0.7, 1], [0, 200]);
  const headingOpacity = useTransform(scrollYProgress, [0.7, 1], [1, 0]);

  // Parallax effect for background glows
  const glowY1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const glowY2 = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const glowOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.3, 0.5, 0.3]
  );

  return (
    <section
      ref={sectionRef}
      className={`py-16 sm:py-24 md:py-32 lg:py-48 relative overflow-hidden transition-colors duration-500 ${
        isLight
          ? "bg-gradient-to-br from-amber-50 via-orange-50/50 to-sky-50"
          : "bg-black"
      }`}
      style={{ position: "relative" }}
    >
      {/* Dynamic background with multiple gradients */}
      <div className={`absolute inset-0 pointer-events-none z-0 ${
        isLight
          ? "bg-gradient-to-b from-sky-100/30 via-transparent to-rose-100/30"
          : "bg-gradient-to-b from-black via-gray-950 to-black"
      }`} />

      {/* Light mode decorative elements */}
      {isLight && (
        <>
          <div className="absolute top-20 right-10 w-80 h-80 bg-gradient-to-bl from-blue-200/40 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-tr from-amber-200/30 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
        </>
      )}

      {/* Animated blue glow */}
      <motion.div
        className="absolute top-0 -left-1/3 w-full h-full bg-accent/8 rounded-full blur-3xl pointer-events-none z-0"
        style={{ y: glowY1, opacity: glowOpacity }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated red glow accent */}
      <motion.div
        className="absolute top-1/2 right-0 w-96 h-96 bg-tertiary/7 rounded-full blur-3xl pointer-events-none z-0 transform -translate-y-1/2"
        style={{ y: glowY2 }}
        animate={{
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-20"
        >
          <motion.h2
            ref={headingRef}
            style={{
              color: headingColor,
              x: headingX,
              opacity: headingOpacity,
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="text-hero md:text-display font-black mb-8 leading-[0.9] text-center"
          >
            Utvalda projekt
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="text-h4 text-gray-300 max-w-2xl mx-auto"
          >
            Hemsidor som gör skillnad för våra kunder
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={
                isInView
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 0, scale: 0.9, y: 30 }
              }
              transition={{
                duration: 0.8,
                delay: index * 0.15 + 0.3,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="group cursor-pointer relative"
            >
              <Link href="/portfolio">
                <motion.div
                  className={`${project.color} aspect-[4/3] flex items-center justify-center relative overflow-hidden group`}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Background image if available */}
                  {project.image && (
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{ minHeight: "200px" }}
                    >
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </motion.div>
                  )}

                  {/* Animated gradient overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"
                    initial={{ opacity: 0.5 }}
                    whileHover={{ opacity: 0.7 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Shimmer effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />

                  {/* Content container with enhanced animations */}
                  <motion.div
                    className="relative z-10 text-center p-8"
                    initial={{ y: 0, opacity: 1 }}
                    whileHover={{ y: -8, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <motion.h3
                      className="text-h3 font-black text-white mb-3"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {project.title}
                    </motion.h3>
                    <motion.p
                      className="text-white/90 mb-3 text-lg font-semibold"
                      whileHover={{ scale: 1.02 }}
                    >
                      {project.category}
                    </motion.p>
                    <motion.p
                      className="text-white/80 text-base leading-relaxed"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {project.description}
                    </motion.p>
                  </motion.div>

                  {/* Animated corner accents */}
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent/30 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0, rotate: -45 }}
                    whileHover={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-tertiary/30 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0, rotate: 45 }}
                    whileHover={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.1,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                  />

                  {/* Border glow effect */}
                  <motion.div
                    className="absolute inset-0 border-2 border-accent opacity-0 group-hover:opacity-50"
                    initial={{ scale: 0.95 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/portfolio"
              className="inline-block px-10 py-5 border-2 border-white text-white text-lg font-semibold hover:bg-white hover:text-black transition-all duration-300"
            >
              Se alla projekt
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
