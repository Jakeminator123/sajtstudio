"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

// Content for each face of the cube
const cubeContent = [
  {
    id: 1,
    title: "Blixtsnabb Utveckling",
    icon: "⚡",
    description: "Vi levererar din sajt på rekordtid utan att kompromissa på kvalitet",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: 2,
    title: "SEO-Optimerat",
    icon: "🎯",
    description: "Syns på Google från dag 1 med inbyggd SEO och performance",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: 3,
    title: "AI-Drivet",
    icon: "🤖",
    description: "Smart innehåll och design genererat med senaste AI-tekniken",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: 4,
    title: "Alltid Uppdaterad",
    icon: "🔄",
    description: "Kontinuerliga uppdateringar och support ingår alltid",
    color: "from-orange-500/20 to-red-500/20",
  },
];

export default function RotatingCubeSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLight } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll progress for this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Map scroll to rotation with bounds checking
  // Use a more gradual rotation range for better control
  const rotateYRaw = useTransform(
    scrollYProgress, 
    [0.15, 0.85], 
    [0, 360],
    { clamp: true }
  );
  
  // Add spring physics for smoother rotation
  const rotateY = useSpring(rotateYRaw, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Create progress transforms for each indicator with better distribution
  const progress0 = useTransform(scrollYProgress, [0.15, 0.325], [0, 1], { clamp: true });
  const progress1 = useTransform(scrollYProgress, [0.325, 0.5], [0, 1], { clamp: true });
  const progress2 = useTransform(scrollYProgress, [0.5, 0.675], [0, 1], { clamp: true });
  const progress3 = useTransform(scrollYProgress, [0.675, 0.85], [0, 1], { clamp: true });
  const progressIndicators = [progress0, progress1, progress2, progress3];

  return (
    <section
      ref={containerRef}
      className={`relative min-h-[200vh] flex items-center justify-center overflow-hidden transition-colors duration-500 ${
        isLight
          ? "bg-gradient-to-b from-amber-50 via-orange-50/30 to-sky-50"
          : "bg-black"
      }`}
    >
      {/* Sticky container that holds the cube */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center">
        {/* Instructional text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`absolute ${isMobile ? 'top-8' : 'top-20'} left-1/2 -translate-x-1/2 text-center z-10 px-4 ${
            isLight ? "text-gray-800" : "text-white"
          }`}
        >
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-5xl'} font-black mb-2 md:mb-4`}>
            Våra Superkrafter
          </h2>
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} ${isLight ? "text-gray-600" : "text-gray-400"}`}>
            {isMobile ? 'Scrolla neråt' : 'Scrolla för att se allt vi erbjuder'}
          </p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`mt-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
          >
            ↓
          </motion.div>
        </motion.div>

        {/* 3D Perspective Container */}
        <div
          className={`relative w-full ${isMobile ? 'max-w-sm' : 'max-w-2xl'} mx-auto px-4`}
          style={{ perspective: isMobile ? "800px" : "1500px" }}
        >
          {/* Rotating Cube */}
          <motion.div
            className="relative w-full aspect-square"
            style={{
              transformStyle: "preserve-3d",
              rotateY,
            }}
          >
            {/* Front Face (0deg) */}
            <CubeFace
              content={cubeContent[0]}
              transform={`rotateY(0deg) translateZ(${isMobile ? '150px' : '250px'})`}
              isLight={isLight}
              isMobile={isMobile}
            />

            {/* Right Face (90deg) */}
            <CubeFace
              content={cubeContent[1]}
              transform={`rotateY(90deg) translateZ(${isMobile ? '150px' : '250px'})`}
              isLight={isLight}
              isMobile={isMobile}
            />

            {/* Back Face (180deg) */}
            <CubeFace
              content={cubeContent[2]}
              transform={`rotateY(180deg) translateZ(${isMobile ? '150px' : '250px'})`}
              isLight={isLight}
              isMobile={isMobile}
            />

            {/* Left Face (270deg) */}
            <CubeFace
              content={cubeContent[3]}
              transform={`rotateY(270deg) translateZ(${isMobile ? '150px' : '250px'})`}
              isLight={isLight}
              isMobile={isMobile}
            />

            {/* Top Face */}
            <div
              className={`absolute inset-0 flex items-center justify-center backface-hidden ${
                isLight
                  ? "bg-gradient-to-br from-amber-100/50 to-orange-100/50 border-amber-300"
                  : "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-white/10"
              } border backdrop-blur-sm`}
              style={{
                transform: `rotateX(90deg) translateZ(${isMobile ? '150px' : '250px'})`,
                backfaceVisibility: "hidden",
              }}
            >
              <span className={isMobile ? 'text-4xl' : 'text-6xl'}>🚀</span>
            </div>

            {/* Bottom Face */}
            <div
              className={`absolute inset-0 flex items-center justify-center backface-hidden ${
                isLight
                  ? "bg-gradient-to-br from-sky-100/50 to-blue-100/50 border-sky-300"
                  : "bg-gradient-to-br from-gray-900/50 to-black/50 border-white/10"
              } border backdrop-blur-sm`}
              style={{
                transform: `rotateX(-90deg) translateZ(${isMobile ? '150px' : '250px'})`,
                backfaceVisibility: "hidden",
              }}
            >
              <span className={isMobile ? 'text-4xl' : 'text-6xl'}>✨</span>
            </div>
          </motion.div>
        </div>

        {/* Progress indicator */}
        <div className={`absolute ${isMobile ? 'bottom-8' : 'bottom-20'} left-1/2 -translate-x-1/2 flex gap-2`}>
          {cubeContent.map((_, index) => (
            <motion.div
              key={index}
              className={`${isMobile ? 'w-8 h-1.5' : 'w-12 h-2'} rounded-full ${
                isLight ? "bg-gray-300" : "bg-white/20"
              } origin-left`}
              style={{
                scaleX: progressIndicators[index],
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Individual cube face component
function CubeFace({
  content,
  transform,
  isLight,
  isMobile = false,
}: {
  content: typeof cubeContent[0];
  transform: string;
  isLight: boolean;
  isMobile?: boolean;
}) {
  return (
    <motion.div
      className={`absolute inset-0 flex flex-col items-center justify-center ${isMobile ? 'p-4' : 'p-8 md:p-12'} backface-hidden ${
        isLight
          ? "bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200"
          : "bg-gradient-to-br from-gray-900/90 to-black/90 border-white/10"
      } border-2 backdrop-blur-md ${isMobile ? 'rounded-lg' : 'rounded-2xl'} shadow-2xl`}
      style={{
        transform,
        backfaceVisibility: "hidden",
      }}
      whileHover={{ scale: isMobile ? 1 : 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={isMobile ? 'text-4xl mb-3' : 'text-8xl mb-6'}
      >
        {content.icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className={`${isMobile ? 'text-lg' : 'text-2xl md:text-4xl'} font-black mb-2 md:mb-4 text-center ${
          isLight ? "text-gray-900" : "text-white"
        }`}
      >
        {content.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className={`${isMobile ? 'text-xs' : 'text-lg md:text-xl'} text-center max-w-md ${
          isLight ? "text-gray-700" : "text-gray-300"
        }`}
      >
        {content.description}
      </motion.p>

      {/* Decorative gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${content.color} opacity-20 ${isMobile ? 'rounded-lg' : 'rounded-2xl'} pointer-events-none`}
      />
    </motion.div>
  );
}
