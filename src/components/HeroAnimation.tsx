"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import { useRef, useMemo } from "react";
import { useVideoLoader } from "@/hooks/useVideoLoader";
import { prefersReducedMotion } from "@/lib/performance";

export default function HeroAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const { videoRef, videoError, mounted } = useVideoLoader();
  
  // Check for reduced motion preference
  const shouldReduceMotion = useMemo(() => prefersReducedMotion(), []);

  // Scroll-based color animation for heading
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress: headingScrollProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "center center", "end center"],
  });

  // Interpolate color from white to red (tertiary) as it comes into center
  const headingColor = useTransform(
    headingScrollProgress,
    [0, 0.5, 1],
    ["rgb(255, 255, 255)", "rgb(255, 0, 51)", "rgb(255, 0, 51)"]
  );

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });

  // Special section: When images disappear and video is prominent (scroll 0.7-1.0)
  // This creates a "Design? vs Functionality?" moment
  const questionSectionProgress = useTransform(
    scrollYProgress,
    [0.7, 0.85, 1.0],
    [0, 1, 1]
  );

  // Video animation - starts above and slides into center as images separate
  // Combine centering (-50%) with scroll-based movement
  const videoYOffset = useTransform(scrollYProgress, [0, 0.5, 1], [-150, 0, 0]);
  const videoY = useTransform(videoYOffset, (val) => `calc(-50% + ${val}px)`);
  const videoOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.6, 1],
    [0, 0.3, 0.9, 1]
  );
  
  // Video scale - normal growth, then extra zoom during question section
  // Base scale up to 0.7 scroll progress
  const baseVideoScale = useTransform(
    scrollYProgress,
    [0, 0.5, 0.7],
    [0.7, 1.5, 2.5]
  );
  // Extra zoom during question section (0.7-1.0)
  const questionVideoScale = useTransform(
    scrollYProgress,
    [0.7, 0.85, 1.0],
    [2.5, 3.0, 3.5]
  );
  // Use question scale when in that range, otherwise base scale
  const videoScale = useTransform(
    scrollYProgress,
    (latest) => {
      if (latest >= 0.7) {
        // During question section, use question scale
        const questionProgress = (latest - 0.7) / 0.3; // Normalize 0.7-1.0 to 0-1
        return 2.5 + (questionProgress * 1.0); // 2.5 to 3.5
      }
      // Before question section, use base scale
      if (latest <= 0.5) {
        return 0.7 + (latest / 0.5) * 0.8; // 0.7 to 1.5
      }
      return 1.5 + ((latest - 0.5) / 0.2) * 1.0; // 1.5 to 2.5
    }
  );
  
  const videoGlowOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 0.3, 0.5]
  );

  // Red tint that increases with scroll - more intense
  const videoRedTint = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 0.3, 0.5]
  );

  // Question text animations - slide in from sides with dramatic effect
  // Design? comes from left
  const designTextX = useTransform(
    questionSectionProgress,
    [0, 0.2, 0.5, 1],
    [-400, -100, 0, 0]
  );
  const designTextOpacity = useTransform(
    questionSectionProgress,
    [0, 0.1, 0.25, 0.9, 1],
    [0, 0, 0.7, 1, 1]
  );
  const designTextScale = useTransform(
    questionSectionProgress,
    [0, 0.25, 0.5, 1],
    [0.3, 0.8, 1, 1]
  );
  const designTextRotate = useTransform(
    questionSectionProgress,
    [0, 0.3, 1],
    [-15, -5, 0]
  );

  // Functionality? comes from right
  const functionalityTextX = useTransform(
    questionSectionProgress,
    [0, 0.2, 0.5, 1],
    [400, 100, 0, 0]
  );
  const functionalityTextOpacity = useTransform(
    questionSectionProgress,
    [0, 0.1, 0.25, 0.9, 1],
    [0, 0, 0.7, 1, 1]
  );
  const functionalityTextScale = useTransform(
    questionSectionProgress,
    [0, 0.25, 0.5, 1],
    [0.3, 0.8, 1, 1]
  );
  const functionalityTextRotate = useTransform(
    questionSectionProgress,
    [0, 0.3, 1],
    [15, 5, 0]
  );

  // Check if images are in view for initial animation
  const imagesInView = useInView(imagesContainerRef, {
    once: false,
    margin: "-100px",
    amount: 0.2,
  });

  const portfolioImages = [
    "/images/hero/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp",
    "/images/hero/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp",
    "/images/hero/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp",
    "/images/hero/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp",
  ];

  // Create unique transforms for each image - asymmetrical, natural movements
  // Image 0 (top-left): "Svävar iväg" - lätt uppåt, diagonalt vänster-uppåt, lite rotation, lätt scale up
  const image0X = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [0, -40, -100, -180]);
  const image0Y = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [0, -30, -70, -120]);
  const image0Rotate = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [0, -8, -18, -30]);
  const image0Opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.6, 1],
    [1, 1, 0.5, 0.2]
  );
  const image0Scale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.8, 1],
    [1, 1.05, 1.1, 1.15]
  );

  // Image 1 (top-right): "Dras åt sidan" - kraftigt åt höger, lite nedåt, minimal rotation
  const image1X = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 100, 200, 300]);
  const image1Y = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 15, 35, 60]);
  const image1Rotate = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 1, 2, 3]);
  const image1Opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.5, 1],
    [1, 1, 0.4, 0.1]
  );
  const image1Scale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    [1, 0.95, 0.85, 0.7]
  );

  // Image 2 (bottom-left): "Rullar iväg" - kraftig rotation som en boll, åt vänster-nedåt
  const image2X = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [0, -80, -180, -300]);
  const image2Y = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [0, 50, 110, 180]);
  const image2Rotate = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [0, 45, 120, 240]);
  const image2Opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.65, 1],
    [1, 1, 0.5, 0.2]
  );
  const image2Scale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.7, 1],
    [1, 0.95, 0.85, 0.75]
  );

  // Image 3 (bottom-right): "Åker upp ur bild" - kraftigt uppåt, lite åt höger, lite rotation
  const image3X = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 50, 100, 150]);
  const image3Y = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, -60, -140, -250]);
  const image3Rotate = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 5, 12, 20]);
  const image3Opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.55, 1],
    [1, 1, 0.4, 0.1]
  );
  const image3Scale = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [1, 0.95, 0.85, 0.75]
  );

  const imageTransforms = [
    { x: image0X, y: image0Y, rotate: image0Rotate, opacity: image0Opacity, scale: image0Scale },
    { x: image1X, y: image1Y, rotate: image1Rotate, opacity: image1Opacity, scale: image1Scale },
    { x: image2X, y: image2Y, rotate: image2Rotate, opacity: image2Opacity, scale: image2Scale },
    { x: image3X, y: image3Y, rotate: image3Rotate, opacity: image3Opacity, scale: image3Scale },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-32 md:py-48 bg-gradient-to-b from-black via-gray-900 to-black text-white relative overflow-hidden"
    >
      {/* Background pattern - alt_background.webp */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,102,255,0.4),transparent_60%)]" />
        <Image
          src="/images/hero/alt_background.webp"
          alt=""
          fill
          className="object-cover opacity-15 mix-blend-overlay"
          loading="lazy"
          sizes="100vw"
        />
      </div>

      {/* Blue gradient accent */}
      <motion.div
        className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-accent/10 via-accent/5 to-transparent opacity-60 z-0"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Gray gradient accent */}
      <motion.div
        className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-900/8 via-gray-800/4 to-transparent opacity-50 z-0"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <motion.h2
            ref={headingRef}
            style={{ color: headingColor }}
            className="text-hero md:text-display font-black mb-8 leading-[0.9] text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Våra hemsidor i aktion
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Se exempel på vad vi kan skapa
          </motion.p>
        </motion.div>

        {/* Container for video and images that can overlap */}
        <div className="relative max-w-6xl mx-auto min-h-[600px] md:min-h-[700px] z-30 overflow-hidden px-4">
          {/* Images grid - splits apart as you scroll */}
          <motion.div
            ref={imagesContainerRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10"
          >
            {portfolioImages.map((src, index) => {
              const transforms = imageTransforms[index];

              return (
                <motion.div
                  key={src}
                  style={{
                    x: transforms.x,
                    y: transforms.y,
                    rotate: transforms.rotate,
                    opacity: transforms.opacity,
                    scale: transforms.scale,
                    willChange: "transform, opacity",
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={
                    imagesInView
                      ? {
                          opacity: 1,
                          scale: 1,
                          y: 0,
                        }
                      : { opacity: 0, scale: 0.8, y: 50 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.6,
                    delay: shouldReduceMotion ? 0 : index * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    zIndex: 30,
                  }}
                  className="relative aspect-square overflow-hidden rounded-lg border border-accent/20 group cursor-pointer"
                >
                  <Image
                    src={src}
                    alt={`Portfolio exempel ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Gradient overlay that intensifies on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Accent border glow on hover */}
                  <motion.div
                    className="absolute inset-0 border-2 border-accent opacity-0 group-hover:opacity-50"
                    initial={{ scale: 0.9 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Video container - slides into center as images separate */}
          <motion.div
            ref={videoContainerRef}
            style={{
              x: "-50%",
              y: videoY,
              scale: videoScale,
              opacity: videoOpacity,
              left: "50%",
              top: "50%",
              zIndex: 50,
            }}
            className="absolute w-full max-w-5xl"
          >
            {/* Question texts - Design? and Functionality? */}
            {/* Positioned relative to video container but clamped to viewport */}
            <motion.div
              className="absolute pointer-events-none"
              style={{
                x: designTextX,
                opacity: designTextOpacity,
                scale: designTextScale,
                rotate: designTextRotate,
                left: "max(0px, calc(-50% - 6rem))",
                top: "50%",
                zIndex: 60,
                maxWidth: "calc(50vw - 2rem)",
              }}
            >
              <motion.h3
                className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white whitespace-nowrap px-2 sm:px-4"
                style={{
                  textShadow: "0 0 40px rgba(0, 102, 255, 0.7), 0 0 80px rgba(0, 102, 255, 0.5), 0 0 120px rgba(0, 102, 255, 0.3)",
                  WebkitTextStroke: "2px rgba(0, 102, 255, 0.4)",
                }}
              >
                Design?
              </motion.h3>
            </motion.div>

            <motion.div
              className="absolute pointer-events-none"
              style={{
                x: functionalityTextX,
                opacity: functionalityTextOpacity,
                scale: functionalityTextScale,
                rotate: functionalityTextRotate,
                right: "max(0px, calc(-50% - 6rem))",
                top: "50%",
                zIndex: 60,
                maxWidth: "calc(50vw - 2rem)",
              }}
            >
              <motion.h3
                className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white whitespace-nowrap px-2 sm:px-4"
                style={{
                  textShadow: "0 0 40px rgba(255, 0, 51, 0.7), 0 0 80px rgba(255, 0, 51, 0.5), 0 0 120px rgba(255, 0, 51, 0.3)",
                  WebkitTextStroke: "2px rgba(255, 0, 51, 0.4)",
                }}
              >
                Functionality?
              </motion.h3>
            </motion.div>
            <div className="rounded-lg overflow-hidden shadow-2xl border-2 border-accent/20 relative z-50">
              {/* Red tint overlay that increases with scroll */}
              <motion.div
                className="absolute inset-0 bg-tertiary pointer-events-none z-10 mix-blend-overlay"
                style={{
                  opacity: videoRedTint,
                }}
              />

              {mounted && !videoError && (
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-auto relative z-0"
                  poster="/images/hero/alt_background.webp"
                  onError={() => {
                    // Error handled by hook, this is just a fallback
                  }}
                >
                  <source src="/videos/telephone_ringin.mp4" type="video/mp4" />
                  <source src="/videos/noir_hero.mp4" type="video/mp4" />
                  <source src="/videos/background_vid.mp4" type="video/mp4" />
                </video>
              )}
              {(!mounted || videoError) && (
                <div className="relative w-full aspect-video bg-black">
                  <Image
                    src="/images/hero/alt_background.webp"
                    alt="Portfolio preview"
                    fill
                    className="object-cover"
                    loading="lazy"
                    unoptimized
                  />
                </div>
              )}

              {/* Glow effect that intensifies on scroll */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-accent/20 via-transparent to-transparent pointer-events-none z-20"
                style={{
                  opacity: videoGlowOpacity,
                }}
              />

              {/* Red glow that intensifies with scroll */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-tertiary/30 via-tertiary/10 to-transparent pointer-events-none z-20"
                style={{
                  opacity: videoRedTint,
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
