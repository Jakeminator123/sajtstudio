"use client";

import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { useRef, useMemo, useEffect, useState } from "react";
import { useVideoLoader } from "@/hooks/useVideoLoader";
import { prefersReducedMotion } from "@/lib/performance";
import Modal from "@/components/Modal";
import dynamic from "next/dynamic";

const TechShowcaseSection = dynamic(() => import("@/components/TechShowcaseSection"), {
  ssr: false,
});

export default function HeroAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const { videoRef, videoError, mounted } = useVideoLoader();
  
  // Scroll progress for the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Modal state
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isFunctionalityModalOpen, setIsFunctionalityModalOpen] = useState(false);
  const [explosionTriggered, setExplosionTriggered] = useState(false);
  const [textsShouldStick, setTextsShouldStick] = useState(false);
  const [textsDisappearing, setTextsDisappearing] = useState(false);
  const [modalShake, setModalShake] = useState(false);
  const [designTextFlyingToModal, setDesignTextFlyingToModal] = useState(false);
  const [functionalityTextFlyingToModal, setFunctionalityTextFlyingToModal] = useState(false);
  const timeoutRefs = useRef<{ design1?: NodeJS.Timeout; design2?: NodeJS.Timeout; func1?: NodeJS.Timeout; func2?: NodeJS.Timeout }>({});

  // Check for reduced motion preference
  const shouldReduceMotion = useMemo(() => prefersReducedMotion(), []);

  // Clean up timeout on unmount
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (textsShouldStick && !textsDisappearing) {
      timeoutId = setTimeout(() => {
        setTextsDisappearing(true);
      }, 3000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      // Cleanup modal timeouts on unmount
      if (timeoutRefs.current.design1) clearTimeout(timeoutRefs.current.design1);
      if (timeoutRefs.current.design2) clearTimeout(timeoutRefs.current.design2);
      if (timeoutRefs.current.func1) clearTimeout(timeoutRefs.current.func1);
      if (timeoutRefs.current.func2) clearTimeout(timeoutRefs.current.func2);
    };
  }, [textsShouldStick, textsDisappearing]);

  // Ensure video plays when it becomes visible
  useEffect(() => {
    if (!mounted || videoError || !videoRef.current) return;

    const video = videoRef.current;

    // Ensure loop is set programmatically
    video.loop = true;

    // Try to play video when it's loaded
    const tryPlay = async () => {
      try {
        await video.play();
      } catch (error) {
        // Autoplay blocked - that's okay, user can interact
      }
    };

    // If video is already loaded, try to play
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
    }

    // Also try when video enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tryPlay();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(video);

    // Ensure video loops even if loop attribute fails
    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {
        // Play failed, but loop should handle it
      });
    };
    video.addEventListener('ended', handleEnded);

    return () => {
      observer.disconnect();
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [mounted, videoError, videoRef]);

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

  // Scroll-based animations - optimized with layoutEffect: false for better performance
  const { scrollYProgress: mediaScrollProgress } = useScroll({
    target: mediaContainerRef,
    offset: ["center end", "center start"],
    layoutEffect: false,
  });

  const smoothMediaProgress = useSpring(mediaScrollProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  // Check if images are in view for initial animation
  const imagesInView = useInView(imagesContainerRef, {
    once: false,
    margin: "-100px",
    amount: 0.2,
  });

  const explosionThreshold = 0.5; // Trigger explosion earlier, synchronized with video zoom
  const previousProgressRef = useRef(smoothMediaProgress.get());

  // Monitor scroll progress and trigger explosion - optimized with throttling
  useEffect(() => {
    if (!imagesInView) {
      return;
    }

    previousProgressRef.current = smoothMediaProgress.get();
    let rafId: number | null = null;
    let lastCheck = 0;

    const checkProgress = () => {
      const latest = smoothMediaProgress.get();
      const now = performance.now();
      
      // Throttle checks to ~60fps max
      if (now - lastCheck < 16) {
        rafId = requestAnimationFrame(checkProgress);
        return;
      }
      lastCheck = now;

      const previous = previousProgressRef.current ?? 0;
      const crossedThreshold =
        previous < explosionThreshold && latest >= explosionThreshold;

      if (crossedThreshold && !explosionTriggered) {
        setExplosionTriggered(true);
      }

      // Make texts stick when scrolling past 0.8 and trigger modal shake
      if (latest > 0.8 && !textsShouldStick) {
        setTextsShouldStick(true);
        // Trigger modal shake animation
        setModalShake(true);
        setTimeout(() => setModalShake(false), 1000);
      }

      previousProgressRef.current = latest;
      rafId = requestAnimationFrame(checkProgress);
    };

    rafId = requestAnimationFrame(checkProgress);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [smoothMediaProgress, explosionTriggered, imagesInView, textsShouldStick]);

  // Special section: When images disappear and video is prominent (scroll 0.5-1.0)
  // This creates a "Design? vs Functionality?" moment - starts earlier for better visibility
  const questionSectionProgress = useTransform(
    smoothMediaProgress,
    [0.5, 0.65, 0.85, 1.0],
    [0, 0.3, 1, 1]
  );

  // Video animation - starts lower (beneath the cards) and slides into center, then stays centered during zoom
  // Positive offsets push the video further down the viewport before the zoom phase
  const videoYOffset = useTransform(
    smoothMediaProgress,
    [0, 0.45, 0.55, 0.65, 0.85, 1],
    [200, 160, 80, 0, 0, 0] // Starts well below center, then aligns before zoom
  );
  const videoY = useTransform(videoYOffset, (val) => `calc(-50% + ${val}px)`);

  // Video opacity - smooth fade-in, fully visible during zoom for immersive effect
  // Made visible much earlier so users can see the video immediately
  const videoOpacity = useTransform(
    smoothMediaProgress,
    [0, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1],
    [0.3, 0.6, 0.85, 0.95, 1, 1, 1, 1, 1, 1, 1] // Visible from the start, fully visible during zoom phase
  );

  // Video scale - very aggressive and fast scaling when centered, fills viewport
  // Expands much faster when centered (0.5-0.6) - synchronized with image explosion
  const videoScale = useTransform(
    smoothMediaProgress,
    [0, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    [0.6, 0.7, 1.0, 3.0, 5.0, 7.0, 9.0, 12.0] // Much faster expansion - jumps from 1.0 to 3.0 at 0.5-0.6
  );

  // Video glow - increases with zoom, creating immersive atmosphere
  const videoGlowOpacity = useTransform(
    smoothMediaProgress,
    [0, 0.45, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 1],
    [0, 0.05, 0.2, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85] // Stronger glow as video zooms
  );

  // Red tint/smoke that increases with scroll - follows video scale
  // Creates atmospheric effect that grows with the zoom
  // Smoke appears gradually and intensifies during zoom phase
  // Made visible earlier so users can see the red overlay effect
  const videoRedTint = useTransform(
    smoothMediaProgress,
    [0, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
    [0, 0, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9] // Starts earlier and more visible
  );
  
  // Red "landing pad" - transforms from flying square into a glowing floor
  const redPadKeyframes = [0, 0.35, 0.55, 0.75, 1];
  const redPadX = useTransform(
    smoothMediaProgress,
    redPadKeyframes,
    [-420, -240, -140, -80, -60]
  );
  const redPadY = useTransform(
    smoothMediaProgress,
    redPadKeyframes,
    [-320, -140, 20, 190, 250]
  );
  const redPadScaleX = useTransform(
    smoothMediaProgress,
    redPadKeyframes,
    [0.75, 0.9, 1.25, 1.65, 1.85]
  );
  const redPadScaleY = useTransform(
    smoothMediaProgress,
    redPadKeyframes,
    [1.1, 1.0, 0.75, 0.38, 0.28]
  );
  const redPadRotate = useTransform(
    smoothMediaProgress,
    redPadKeyframes,
    [32, 24, 16, 9, 4]
  );
  const redPadSkewX = useTransform(
    smoothMediaProgress,
    redPadKeyframes,
    [10, 8, 6, 4, 3]
  );
  const redPadOpacity = useTransform(
    smoothMediaProgress,
    [0.18, 0.3, 0.65, 1],
    [0, 0.55, 0.85, 0.75]
  );
  const redPadShadow = useTransform(smoothMediaProgress, (latest) => {
    const clamped = Math.max(0, Math.min(1, latest));
    const spread = 220 + clamped * 140;
    const blur = 420 + clamped * 180;
    const alpha = 0.18 + clamped * 0.22;
    return `0 ${spread}px ${blur}px rgba(255, 0, 51, ${alpha})`;
  });


  // Question text animations - start at video, go down, then up to modal
  // Design? - starts at video center, goes down, then up to left side of screen
  // Combine videoY offset with text movement
  const textKeyframes = [0, 0.18, 0.35, 0.52, 0.7, 0.88, 1];

  const designTextYOffset = useTransform(
    questionSectionProgress,
    textKeyframes,
    [0, 160, 280, 160, -120, -320, -520]
  );
  const designTextY = useTransform(
    [videoYOffset, designTextYOffset],
    ([videoY, offset]) => (videoY as number) + (offset as number)
  );
  const designTextX = useTransform(
    questionSectionProgress,
    textKeyframes,
    [0, -20, -40, -120, -220, -320, -360]
  );
  const designTextOpacity = useTransform(
    questionSectionProgress,
    [0, 0.08, 0.2, 0.4, 0.6, 0.75, 0.9, 1],
    [0, 0.4, 0.9, 1, 1, 0.95, 0.5, 0] // More visible earlier and stays visible longer
  );
  const designTextScale = useTransform(
    questionSectionProgress,
    textKeyframes,
    [0.7, 0.85, 1, 1.08, 1.15, 1.05, 0.85]
  );
  const designTextRotate = useTransform(
    questionSectionProgress,
    textKeyframes,
    [-4, -2, 0, -6, -12, -16, -18]
  );

  // Functionality? - starts at video center, goes down, then up to right side of screen
  const functionalityTextYOffset = useTransform(
    questionSectionProgress,
    textKeyframes,
    [0, 180, 320, 180, -140, -340, -540]
  );
  // Combine video Y position with text offset
  const functionalityTextY = useTransform(
    [videoYOffset, functionalityTextYOffset],
    ([videoY, offset]) => (videoY as number) + (offset as number)
  );
  const functionalityTextX = useTransform(
    questionSectionProgress,
    textKeyframes,
    [0, 10, 0, 140, 260, 360, 420]
  );
  const functionalityTextOpacity = useTransform(
    questionSectionProgress,
    [0, 0.1, 0.25, 0.45, 0.65, 0.8, 0.95, 1],
    [0, 0.4, 0.9, 1, 1, 0.9, 0.5, 0] // More visible earlier and stays visible longer
  );
  const functionalityTextScale = useTransform(
    questionSectionProgress,
    textKeyframes,
    [0.75, 0.88, 1, 1.12, 1.2, 1.05, 0.9]
  );
  const functionalityTextRotate = useTransform(
    questionSectionProgress,
    textKeyframes,
    [6, 3, 0, 8, 16, 18, 20]
  );

  const portfolioImages = [
    "/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp",
    "/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp",
    "/images/portfolio/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp",
    "/images/portfolio/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp",
  ];

  // Enhanced image transforms - dramatic and simultaneous explosion synchronized with video zoom
  // Images explode at the same time as video starts zooming aggressively (0.5-0.6)
  // Image 0 (top-left): "Svävar iväg" - dramatic floating movement
  const image0X = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, -600, -1000]);
  const image0Y = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, -500, -800]);
  const image0Rotate = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, -90, -150]);
  const image0Opacity = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [1, 1, 0.2, 0]);
  const image0Scale = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [1, 1, 1.6, 2.0]);

  // Image 1 (top-right): "Dras åt sidan" - dramatic slide to the right
  const image1X = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, 900, 1500]);
  const image1Y = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, 300, 600]);
  const image1Rotate = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, 45, 90]);
  const image1Opacity = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [1, 1, 0.2, 0]);
  const image1Scale = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [1, 1, 0.3, 0.2]);

  // Image 2 (bottom-left): "Rullar iväg" - dramatic rolling rotation
  const image2X = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, -800, -1300]);
  const image2Y = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, 600, 1000]);
  const image2Rotate = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, 630, 900]);
  const image2Opacity = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [1, 1, 0.2, 0]);
  const image2Scale = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [1, 1, 0.3, 0.2]);

  // Image 3 (bottom-right): "Åker upp ur bild" - dramatic upward movement
  const image3X = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, 600, 1000]);
  const image3Y = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, -700, -1100]);
  const image3Rotate = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [0, 0, 90, 150]);
  const image3Opacity = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [1, 1, 0.2, 0]);
  const image3Scale = useTransform(smoothMediaProgress, [0, 0.5, 0.6, 0.7], [1, 1, 0.3, 0.2]);

  const imageTransforms = [
    { x: image0X, y: image0Y, rotate: image0Rotate, opacity: image0Opacity, scale: image0Scale },
    { x: image1X, y: image1Y, rotate: image1Rotate, opacity: image1Opacity, scale: image1Scale },
    { x: image2X, y: image2Y, rotate: image2Rotate, opacity: image2Opacity, scale: image2Scale },
    { x: image3X, y: image3Y, rotate: image3Rotate, opacity: image3Opacity, scale: image3Scale },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-32 md:py-48 bg-black text-white relative overflow-hidden"
      style={{
        position: 'relative',
        scrollSnapAlign: 'start' as any,
        minHeight: '350vh', // Extended section for immersive zoom effect - allows smooth zoom experience
      }}
    >
      {/* ============================================ */}
      {/* BACKGROUND LAYER - All decorative elements */}
      {/* ============================================ */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Base solid black background - ensures consistent background */}
        <div className="absolute inset-0 bg-black" />
        
        {/* Base background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,102,255,0.3),transparent_60%)]" />
          <Image
            src="/images/backgrounds/section-background.webp"
            alt=""
            fill
            className="object-cover opacity-20"
            loading="lazy"
            sizes="100vw"
          />
        </div>

        {/* Left side blue gradient accent */}
        <motion.div
          className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-accent/10 via-accent/5 to-transparent opacity-60"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        />

        {/* Right side gray gradient accent */}
        <motion.div
          className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-900/8 via-gray-800/4 to-transparent opacity-50"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>

      {/* ============================================ */}
      {/* CONTENT LAYER - All interactive content */}
      {/* ============================================ */}
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

        {/* ============================================ */}
        {/* MEDIA CONTAINER - Video and images */}
        {/* ============================================ */}
        <div
          ref={mediaContainerRef}
          className="relative max-w-6xl mx-auto min-h-[600px] md:min-h-[700px] px-4 overflow-visible w-full"
        >
          {/* Red background glow behind images when they explode */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-15"
            style={{
              opacity: useTransform(smoothMediaProgress, [0.4, 0.55, 0.7], [0, 0.4, 0.2]),
              background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 51, 0.6) 0%, rgba(255, 0, 51, 0.3) 40%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          
          {/* Portfolio images grid - splits apart as you scroll */}
          <motion.div
            ref={imagesContainerRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative max-w-full"
            style={{ zIndex: explosionTriggered ? 60 : 20 }}
          >
            {portfolioImages.map((src, index) => {
              const transforms = imageTransforms[index];

              return (
                <motion.div
                  key={src}
                  style={{
                    x: explosionTriggered
                      ? (index === 0 ? -1200 : index === 1 ? 1200 : index === 2 ? -1200 : 1200)
                      : transforms.x,
                    y: explosionTriggered
                      ? (index === 0 ? -600 : index === 1 ? -700 : index < 2 ? -800 : 800)
                      : transforms.y,
                    rotate: explosionTriggered
                      ? (index === 0 ? -180 : index === 1 ? 270 : (index % 2 === 0 ? 1 : -1) * 360)
                      : transforms.rotate,
                    rotateX: explosionTriggered
                      ? (index === 1 || index === 2 ? 180 : 0)
                      : 0,
                    rotateY: explosionTriggered
                      ? (index === 0 || index === 3 ? 90 : 0)
                      : 0,
                    z: explosionTriggered
                      ? (index === 1 || index === 3 ? 300 : 0)
                      : 0,
                    opacity: explosionTriggered
                      ? 0
                      : transforms.opacity,
                    scale: explosionTriggered
                      ? (index === 1 || index === 3 ? 2.5 : 1.5)
                      : transforms.scale,
                    willChange: "transform, opacity",
                    transformStyle: "preserve-3d",
                    perspective: 1000,
                    maxWidth: '100%',
                    zIndex: explosionTriggered ? 70 : 'auto',
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={
                    explosionTriggered
                      ? {
                        opacity: 0,
                        scale: index === 1 || index === 3 ? 2.5 : 1.5,
                        x: index === 0 ? -1200 : index === 1 ? 1200 : index === 2 ? -1200 : 1200,
                        y: index === 0 ? -600 : index === 1 ? -700 : index < 2 ? -800 : 800,
                        z: index === 1 || index === 3 ? 300 : 0,
                        rotate: index === 0 ? -180 : index === 1 ? 270 : (index % 2 === 0 ? 1 : -1) * 360,
                        rotateX: index === 1 || index === 2 ? 180 : 0,
                        rotateY: index === 0 || index === 3 ? 90 : 0,
                      }
                      : imagesInView
                        ? {
                          opacity: 1,
                          scale: 1,
                          y: 0,
                        }
                        : { opacity: 0, scale: 0.8, y: 50 }
                  }
                  transition={{
                    duration: explosionTriggered ? 2.5 : (shouldReduceMotion ? 0 : 0.7),
                    delay: explosionTriggered ? index * 0.1 : (shouldReduceMotion ? 0 : index * 0.12),
                    ease: explosionTriggered ? "easeOut" : [0.16, 1, 0.3, 1],
                  }}
                  whileHover={explosionTriggered ? {} : {
                    scale: 1.05,
                    y: -8,
                    zIndex: 40,
                  }}
                  className="relative aspect-square overflow-hidden rounded-lg border border-accent/20 group cursor-pointer max-w-full"
                >
                  <Image
                    src={src}
                    alt={`Portfolio exempel ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
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

          {/* ============================================ */}
          {/* TEXT OVERLAY - Design? and Functionality? */}
          {/* Start at video, go down, then up to modals */}
          {/* Positioned relative to video container */}
          {/* ============================================ */}
          <motion.div
            className={`${textsShouldStick ? 'fixed' : 'absolute'} z-50 cursor-pointer`}
            style={{
              left: "50%",
              top: "50%",
              x: designTextFlyingToModal
                ? 0 // Fly to center (modal position)
                : textsDisappearing
                ? -800
                : (textsShouldStick ? -300 : designTextX),
              y: designTextFlyingToModal
                ? 0 // Fly to center (modal position)
                : textsDisappearing
                ? -400
                : (textsShouldStick ? -400 : designTextY),
              opacity: designTextFlyingToModal
                ? 0 // Fade out as it flies into modal
                : textsDisappearing
                ? 0
                : (textsShouldStick ? 1 : designTextOpacity),
              scale: designTextFlyingToModal
                ? 0.3 // Shrink as it flies into modal
                : textsDisappearing
                ? 0
                : (textsShouldStick ? 1 : designTextScale),
              rotate: designTextFlyingToModal
                ? 0 // Straighten out
                : textsDisappearing
                ? -90
                : (textsShouldStick ? -20 : designTextRotate),
            }}
            onClick={() => {
              // Clear any existing timeouts
              if (timeoutRefs.current.design1) clearTimeout(timeoutRefs.current.design1);
              if (timeoutRefs.current.design2) clearTimeout(timeoutRefs.current.design2);
              
              setDesignTextFlyingToModal(true);
              timeoutRefs.current.design1 = setTimeout(() => {
                setIsDesignModalOpen(true);
                setModalShake(true);
                timeoutRefs.current.design2 = setTimeout(() => setModalShake(false), 1000);
              }, 600); // Delay to allow text to fly into modal
            }}
            whileHover={{ scale: (designTextFlyingToModal || textsDisappearing) ? 1 : (textsShouldStick ? 1.1 : 1.1) }}
            transition={{ 
              duration: designTextFlyingToModal ? 0.6 : (textsDisappearing ? 1 : 0.2),
              ease: designTextFlyingToModal ? [0.34, 1.56, 0.64, 1] : "easeOut"
            }}
          >
            <h3
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white whitespace-nowrap px-4 sm:px-8"
              style={{
                textShadow: "0 0 60px rgba(0, 102, 255, 0.9), 0 0 100px rgba(0, 102, 255, 0.7), 0 0 150px rgba(0, 102, 255, 0.5), 0 0 200px rgba(0, 102, 255, 0.3)",
                WebkitTextStroke: "3px rgba(0, 102, 255, 0.6)",
                filter: "drop-shadow(0 0 20px rgba(0, 102, 255, 0.8))",
              }}
            >
              Design?
            </h3>
          </motion.div>

          <motion.div
            className={`${textsShouldStick ? 'fixed' : 'absolute'} z-50 cursor-pointer`}
            style={{
              left: "50%",
              top: "50%",
              x: functionalityTextFlyingToModal
                ? 0 // Fly to center (modal position)
                : textsDisappearing
                ? 800
                : (textsShouldStick ? 300 : functionalityTextX),
              y: functionalityTextFlyingToModal
                ? 0 // Fly to center (modal position)
                : textsDisappearing
                ? -400
                : (textsShouldStick ? -400 : functionalityTextY),
              opacity: functionalityTextFlyingToModal
                ? 0 // Fade out as it flies into modal
                : textsDisappearing
                ? 0
                : (textsShouldStick ? 1 : functionalityTextOpacity),
              scale: functionalityTextFlyingToModal
                ? 0.3 // Shrink as it flies into modal
                : textsDisappearing
                ? 0
                : (textsShouldStick ? 1 : functionalityTextScale),
              rotate: functionalityTextFlyingToModal
                ? 0 // Straighten out
                : textsDisappearing
                ? 90
                : (textsShouldStick ? 20 : functionalityTextRotate),
            }}
            onClick={() => {
              // Clear any existing timeouts
              if (timeoutRefs.current.func1) clearTimeout(timeoutRefs.current.func1);
              if (timeoutRefs.current.func2) clearTimeout(timeoutRefs.current.func2);
              
              setFunctionalityTextFlyingToModal(true);
              timeoutRefs.current.func1 = setTimeout(() => {
                setIsFunctionalityModalOpen(true);
                setModalShake(true);
                timeoutRefs.current.func2 = setTimeout(() => setModalShake(false), 1000);
              }, 600); // Delay to allow text to fly into modal
            }}
            whileHover={{ scale: (functionalityTextFlyingToModal || textsDisappearing) ? 1 : (textsShouldStick ? 1.1 : 1.1) }}
            transition={{ 
              duration: functionalityTextFlyingToModal ? 0.6 : (textsDisappearing ? 1 : 0.2),
              ease: functionalityTextFlyingToModal ? [0.34, 1.56, 0.64, 1] : "easeOut"
            }}
          >
            <h3
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white whitespace-nowrap px-4 sm:px-8"
              style={{
                textShadow: "0 0 60px rgba(255, 0, 51, 0.9), 0 0 100px rgba(255, 0, 51, 0.7), 0 0 150px rgba(255, 0, 51, 0.5), 0 0 200px rgba(255, 0, 51, 0.3)",
                WebkitTextStroke: "3px rgba(255, 0, 51, 0.6)",
                filter: "drop-shadow(0 0 20px rgba(255, 0, 51, 0.8))",
              }}
            >
              Functionality?
            </h3>
          </motion.div>

          {/* ============================================ */}
          {/* RED LANDING PAD - Transforms into glowing floor */}
          {/* ============================================ */}
          <motion.div
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{
              x: redPadX,
              y: redPadY,
              scaleX: redPadScaleX,
              scaleY: redPadScaleY,
              rotate: redPadRotate,
              skewX: redPadSkewX,
              opacity: redPadOpacity,
              zIndex: 20,
              boxShadow: redPadShadow,
            }}
          >
            <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px]">
              <div className="absolute inset-0 rounded-[38%] bg-gradient-to-br from-tertiary via-tertiary/70 to-tertiary/40 opacity-90" />
              <div className="absolute inset-0 rounded-[40%] blur-3xl bg-tertiary/35" />
              <div className="absolute -inset-x-[25%] bottom-[-45%] h-[60%] bg-gradient-to-b from-tertiary/28 via-tertiary/12 to-transparent blur-3xl opacity-80" />
              <div className="absolute inset-x-[-30%] bottom-[-15%] h-[40%] rounded-full bg-tertiary/20 blur-[50px]" />
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* VIDEO CONTAINER - Main video element */}
          {/* ============================================ */}
          <motion.div
            style={{
              x: "-50%",
              y: videoY,
              scale: videoScale,
              opacity: videoOpacity,
              left: "50%",
              top: "50%",
              zIndex: 30,
              maxWidth: 'min(100%, 80rem)',
            }}
            className="absolute w-full overflow-visible"
          >
            <div className="rounded-lg overflow-hidden shadow-2xl border-2 border-accent/20 relative">
              {/* Video red tint overlay - increases with scroll */}
              <motion.div
                className="absolute inset-0 bg-tertiary pointer-events-none mix-blend-overlay"
                style={{
                  opacity: videoRedTint,
                  zIndex: 1,
                }}
              />

              {/* Video element */}
              {mounted && !videoError && (
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-auto relative"
                  style={{ zIndex: 0 }}
                  onError={() => {
                    // Error handled by hook, this is just a fallback
                  }}
                  onLoadedData={(e) => {
                    // Force play when video is loaded
                    const video = e.currentTarget;
                    video.play().catch(() => {
                      // Autoplay blocked, but that's okay
                    });
                  }}
                  onEnded={(e) => {
                    // Ensure video loops even if loop attribute fails
                    const video = e.currentTarget;
                    video.currentTime = 0;
                    video.play().catch(() => {
                      // Play failed, but loop should handle it
                    });
                  }}
                >
                  <source src="/videos/telephone_ringin.mp4" type="video/mp4" />
                </video>
              )}
              {(!mounted || videoError) && (
                <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,0,51,0.25),transparent_55%)] opacity-80" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(0,102,255,0.3),transparent_60%)] opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                  <div className="absolute inset-x-[-20%] bottom-[-30%] h-[60%] bg-gradient-to-b from-tertiary/20 via-tertiary/10 to-transparent blur-3xl opacity-60" />
                  <div className="absolute inset-x-1/4 bottom-[-10%] h-[35%] rounded-full bg-tertiary/15 blur-[60px]" />
                </div>
              )}

              {/* Video glow effects - overlay on top */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-accent/20 via-transparent to-transparent pointer-events-none"
                style={{
                  opacity: videoGlowOpacity,
                  zIndex: 2,
                }}
              />

              {/* Red glow/smoke effect - grows with video zoom, automatically follows video scale */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-tertiary/30 via-tertiary/10 to-transparent pointer-events-none"
                style={{
                  opacity: videoRedTint,
                  zIndex: 2,
                }}
              />
              
              {/* Simplified smoke layer - removed heavy blur effects for better performance */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: useTransform(videoRedTint, [0, 1], [0, 0.5]),
                  zIndex: 3,
                  background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 51, 0.3) 0%, transparent 70%)',
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* White fade overlay - fades in when video is large enough */}
      {/* Only shows at the very end to transition to next section */}
      <motion.div
        className="fixed inset-0 bg-white pointer-events-none z-[100]"
        style={{
          opacity: useTransform(smoothMediaProgress, [0.85, 0.95, 1], [0, 0.5, 1]),
        }}
      />

      {/* Design Modal */}
      <AnimatePresence>
        {isDesignModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() => {
                setIsDesignModalOpen(false);
                setDesignTextFlyingToModal(false);
              }}
              className="fixed inset-0 z-[60] bg-gradient-to-br from-black/90 via-black/85 to-gray-900/90"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, x: -500, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  rotate: modalShake ? [0, -5, 5, -5, 5, 0] : 0,
                }}
                exit={{ opacity: 0, x: -500, scale: 0.8 }}
                transition={{
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1],
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  rotate: {
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }}
                className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsDesignModalOpen(false);
                    setDesignTextFlyingToModal(false);
                  }}
                  className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                  aria-label="Stäng modal"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                <div className="overflow-y-auto max-h-[90vh] p-8 md:p-12">
                  <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-5xl md:text-7xl font-bold mb-8 text-center"
                    style={{ fontFamily: "var(--font-handwriting)" }}
                  >
                    Design
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="prose prose-lg max-w-none"
                  >
                    <p className="text-xl text-gray-700 mb-6">
                      Design är mer än bara hur något ser ut – det är hur det känns, hur det fungerar och hur det berättar din historia.
                    </p>
                    <p className="text-lg text-gray-600 mb-4">
                      Vi skapar visuella upplevelser som inte bara är vackra, utan också meningsfulla. Varje pixel är genomtänkt, varje färg har ett syfte, och varje animation berättar en del av din berättelse.
                    </p>
                    <p className="text-lg text-gray-600">
                      Vårt designfilosofi bygger på balans mellan estetik och funktionalitet. Vi skapar hemsidor som inte bara ser bra ut – de känns rätt.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Functionality Modal */}
      <AnimatePresence>
        {isFunctionalityModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() => {
                setIsFunctionalityModalOpen(false);
                setFunctionalityTextFlyingToModal(false);
              }}
              className="fixed inset-0 z-[60] bg-gradient-to-br from-black/90 via-black/85 to-gray-900/90"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, x: 500, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  rotate: modalShake ? [0, 5, -5, 5, -5, 0] : 0,
                }}
                exit={{ opacity: 0, x: 500, scale: 0.8 }}
                transition={{
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1],
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  rotate: {
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }}
                className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsFunctionalityModalOpen(false);
                    setFunctionalityTextFlyingToModal(false);
                  }}
                  className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                  aria-label="Stäng modal"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                <div className="overflow-y-auto max-h-[90vh] p-8 md:p-12">
                  <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-4xl md:text-6xl font-bold mb-8 text-center"
                    style={{
                      fontFamily: "var(--font-pixel)",
                      imageRendering: "pixelated",
                      textShadow: "4px 4px 0px rgba(0,0,0,0.2)",
                    }}
                  >
                    FUNCTIONALITY
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="prose prose-lg max-w-none"
                  >
                    <p className="text-xl text-gray-700 mb-6">
                      Funktion är grunden för allt vi bygger. Varje knapp, varje animation, varje interaktion är designad för att fungera perfekt.
                    </p>
                    <p className="text-lg text-gray-600 mb-4">
                      Vi bygger hemsidor som är snabba, responsiva och användarvänliga. Tekniken är osynlig – det som syns är en smidig upplevelse som bara fungerar.
                    </p>
                    <p className="text-lg text-gray-600">
                      Vår kod är ren, välstrukturerad och optimerad. Vi använder senaste tekniker för att säkerställa att din hemsida inte bara ser bra ut, utan också presterar utmärkt.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* White fade transition to next section */}
      <motion.div
        className="fixed inset-0 bg-white pointer-events-none"
        style={{
          opacity: useTransform(scrollYProgress, [0.85, 0.95, 1], [0, 0.8, 1]),
          zIndex: 100,
        }}
      />
    </section>
  );
}
