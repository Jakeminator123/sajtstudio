"use client";

import { useVideoLoader } from "@/hooks/useVideoLoader";
import { prefersReducedMotion } from "@/lib/performance";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function HeroAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolledRef = useRef(false);
  const { videoRef, videoError, mounted } = useVideoLoader();

  // Scroll progress for the section (removed unused variable)
  // const { scrollYProgress } = useScroll({
  //   target: sectionRef,
  //   offset: ["start start", "end start"]
  // });

  const scrollToTechSection = useCallback(() => {
    if (hasAutoScrolledRef.current) return;
    hasAutoScrolledRef.current = true;

    const currentSection = sectionRef.current;
    if (!currentSection) return;

    let target: HTMLElement | null = null;
    const parentWrapper = currentSection.parentElement;
    if (
      parentWrapper &&
      parentWrapper.nextElementSibling instanceof HTMLElement
    ) {
      target = parentWrapper.nextElementSibling;
    }

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({
        top: window.scrollY + window.innerHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // Modal state
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isFunctionalityModalOpen, setIsFunctionalityModalOpen] =
    useState(false);
  const [textsShouldStick, setTextsShouldStick] = useState(false);
  const [textsDisappearing, setTextsDisappearing] = useState(false);
  const [modalShake, setModalShake] = useState(false);
  const [designTextFlyingToModal, setDesignTextFlyingToModal] = useState(false);
  const [functionalityTextFlyingToModal, setFunctionalityTextFlyingToModal] =
    useState(false);
  const timeoutRefs = useRef<{
    design1?: NodeJS.Timeout;
    design2?: NodeJS.Timeout;
    func1?: NodeJS.Timeout;
    func2?: NodeJS.Timeout;
  }>({});
  const [explosionAutoPlay, setExplosionAutoPlay] = useState(false);
  // const [isAnimationComplete, setIsAnimationComplete] = useState(false); // Disabled for burnt debris feature

  // Check for reduced motion preference
  const shouldReduceMotion = useMemo(() => prefersReducedMotion(), []);

  // Clean up timeout on unmount
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    // Copy ref values at effect start to avoid stale closure in cleanup
    const timeouts = timeoutRefs.current;

    if (textsShouldStick && !textsDisappearing) {
      timeoutId = setTimeout(() => {
        setTextsDisappearing(true);
      }, 3000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      // Cleanup modal timeouts on unmount
      if (timeouts.design1) clearTimeout(timeouts.design1);
      if (timeouts.design2) clearTimeout(timeouts.design2);
      if (timeouts.func1) clearTimeout(timeouts.func1);
      if (timeouts.func2) clearTimeout(timeouts.func2);
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
      } catch {
        // Autoplay blocked - that's okay, user can interact
      }
    };

    // If video is already loaded, try to play
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("loadeddata", tryPlay, { once: true });
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
    video.addEventListener("ended", handleEnded);

    return () => {
      observer.disconnect();
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("ended", handleEnded);
    };
  }, [mounted, videoError, videoRef]);

  // Scroll-based color animation for heading
  const { scrollYProgress: headingScrollProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "center center", "end center"],
  });

  // Interpolate color from white to red (tertiary) as it comes into center
  // Use rgba format consistently to avoid hydration mismatch (Framer Motion converts rgb to rgba)
  const headingColor = useTransform(
    headingScrollProgress,
    [0, 0.5, 1],
    ["rgba(255, 255, 255, 1)", "rgba(255, 0, 51, 1)", "rgba(255, 0, 51, 1)"]
  );

  // Scroll-based animations - adjusted for better trigger on large screens
  const { scrollYProgress: mediaScrollProgress } = useScroll({
    target: mediaContainerRef,
    offset: ["start end", "end start"], // Full range for better detection
    layoutEffect: false,
  });

  // Create a motion value for auto-progress that can be animated
  const autoProgressMotion = useMotionValue(0);
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use auto-progress when explosion started, otherwise use scroll
  const smoothMediaProgress = useSpring(
    explosionAutoPlay ? autoProgressMotion : mediaScrollProgress,
    {
      stiffness: 120, // Lower stiffness for smoother animation
      damping: 20, // Lower damping for more responsive animation
      restDelta: 0.001,
    }
  );

  // Check if images are in view for initial animation
  const imagesInView = useInView(imagesContainerRef, {
    once: false,
    margin: "-100px",
    amount: 0.2,
  });

  const previousProgressRef = useRef(smoothMediaProgress.get());

  // Auto-play explosion when video touches images
  useEffect(() => {
    if (explosionAutoPlay) return;

    const explosionDuration = 2500; // 2.5 seconds - faster expansion
    const whiteoutScrollDelay = 600; // wait for white screen before scrolling
    let whiteoutCheckRaf: number | null = null;
    const explosionStartProgress = 0.25; // Trigger even earlier for large screens

    const unsubscribe = mediaScrollProgress.on("change", (latest) => {
      if (latest >= explosionStartProgress && !explosionAutoPlay) {
        setExplosionAutoPlay(true);
        autoProgressMotion.set(latest);

        let startTime: number | null = null;
        const startValue = latest;

        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / explosionDuration, 1);

          const eased = 1 - Math.pow(1 - progress, 3);
          const newValue = startValue + (1 - startValue) * eased;

          autoProgressMotion.set(newValue);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);

        const waitForWhiteout = () => {
          const progress = autoProgressMotion.get();
          if (progress >= 0.995) {
            if (autoScrollTimeoutRef.current) {
              clearTimeout(autoScrollTimeoutRef.current);
            }
            autoScrollTimeoutRef.current = setTimeout(() => {
              scrollToTechSection();
            }, whiteoutScrollDelay);
          } else {
            whiteoutCheckRaf = requestAnimationFrame(waitForWhiteout);
          }
        };

        waitForWhiteout();
      }
    });

    return () => {
      unsubscribe();
      if (whiteoutCheckRaf !== null) {
        cancelAnimationFrame(whiteoutCheckRaf);
      }
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
        autoScrollTimeoutRef.current = null;
      }
    };
  }, [
    explosionAutoPlay,
    mediaScrollProgress,
    autoProgressMotion,
    scrollToTechSection,
  ]);

  // Monitor scroll progress for text stickiness and modal shake - optimized with throttling
  useEffect(() => {
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
  }, [smoothMediaProgress, textsShouldStick]);

  // Auto-scroll is now handled in the explosion auto-play effect above
  // This ensures scroll happens exactly when explosion completes

  // Special section: When images disappear and video is prominent (scroll 0.5-1.0)
  // This creates a "Design? vs Functionality?" moment - starts earlier for better visibility
  const questionSectionProgress = useTransform(
    smoothMediaProgress,
    [0.5, 0.65, 0.85, 1.0],
    [0, 0.3, 1, 1]
  );

  // Video animation - starts lower (beneath the cards) and slides into center, then stays centered during zoom
  // Positive offsets push the video further down the viewport before the zoom phase
  // Modified to center quickly and stay centered
  const videoYOffset = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.85, 1],
    [200, 50, 0, 0, 0, 0, 0, 0] // Centers at 0.35 and stays centered
  );
  const videoY = useTransform(videoYOffset, (val) => `calc(-50% + ${val}px)`);

  // Video opacity - visible at start, then fades out completely after explosion
  // Video disappears to leave only image debris
  const videoOpacity = useTransform(
    smoothMediaProgress,
    [0, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1],
    [0.3, 0.6, 0.85, 0.95, 1, 0.8, 0.5, 0.2, 0, 0, 0] // Fades out after explosion
  );

  // Video scale - grows gradually, then auto-expands when touching images
  // Aggressive expansion starts at 0.25 when auto-explosion triggers
  const videoScale = useTransform(
    smoothMediaProgress,
    [0, 0.15, 0.2, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1],
    [0.6, 0.75, 0.9, 1.1, 2.0, 3.5, 5.0, 7.0, 9.0, 10.5, 11.5, 12.0] // Touches images at 0.25, then explodes
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

  // New side images that appear beside the video - reuse existing portfolio images
  const sideImages = [
    portfolioImages[0], // Left top - reuse first image
    portfolioImages[1], // Left bottom - reuse second image
    portfolioImages[2], // Right top - reuse third image
    portfolioImages[3], // Right bottom - reuse fourth image
  ];

  // Enhanced image transforms - dramatic explosion that leaves debris
  // Images explode and stay as scattered pieces after video disappears
  // Two images fly towards screen (3D effect), two images spin/slide sideways

  // Image 0 (top-left): "Snurrar åt vänster" - spins and stays as debris
  const image0X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -300, -600, -800, -850, -850]
  );
  const image0Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -150, -300, -400, -420, -420]
  );
  const image0Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -90, -180, -360, -380, -380]
  );
  const image0Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.5, 0.45, 0.5, 0.5]
  ); // More visible as debris
  const image0Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.5, 0.3, 0.25, 0.25]
  );

  // Image 1 (top-right): "Flyger mot skärmen" - flies forward and stays as debris
  const image1X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 200, 400, 600, 650, 650]
  );
  const image1Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -100, -200, -300, -320, -320]
  );
  const image1Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 7, 15, 30, 35, 35]
  );
  const image1Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.4, 0.35, 0.4, 0.4]
  ); // More visible as debris
  const image1Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 1.5, 2.2, 1.0, 0.4, 0.4]
  ); // Shrinks back to debris

  // Image 2 (bottom-left): "Rullar åt vänster" - rolls and stays as debris
  const image2X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -400, -800, -1000, -1050, -1050]
  );
  const image2Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 200, 400, 500, 520, 520]
  );
  const image2Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 360, 720, 1440, 1480, 1480]
  );
  const image2Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.3, 0.4, 0.45, 0.45]
  ); // More visible as debris
  const image2Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.5, 0.3, 0.2, 0.2]
  );

  // Image 3 (bottom-right): "Flyger mot skärmen" - flies and stays as debris
  const image3X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 250, 500, 700, 750, 750]
  );
  const image3Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -150, -300, -450, -480, -480]
  );
  const image3Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -7, -15, -30, -35, -35]
  );
  const image3Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.4, 0.5, 0.6, 0.6]
  ); // Most visible as debris
  const image3Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 1.5, 2.2, 0.8, 0.35, 0.35]
  ); // Shrinks to debris size

  const imageTransforms = [
    {
      x: image0X,
      y: image0Y,
      rotate: image0Rotate,
      opacity: image0Opacity,
      scale: image0Scale,
    },
    {
      x: image1X,
      y: image1Y,
      rotate: image1Rotate,
      opacity: image1Opacity,
      scale: image1Scale,
    },
    {
      x: image2X,
      y: image2Y,
      rotate: image2Rotate,
      opacity: image2Opacity,
      scale: image2Scale,
    },
    {
      x: image3X,
      y: image3Y,
      rotate: image3Rotate,
      opacity: image3Opacity,
      scale: image3Scale,
    },
  ];

  // Side images transforms - explode outward from video
  // Side image 0 (left top): flies left-up
  const sideImage0X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -200, -400, -500, -550, -550]
  );
  const sideImage0Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -100, -200, -250, -270, -270]
  );
  const sideImage0Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -45, -90, -180, -200, -200]
  );
  const sideImage0Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.5, 0.45, 0.5, 0.5]
  );
  const sideImage0Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.9, 0.6, 0.4, 0.35, 0.35]
  );

  // Side image 1 (left bottom): flies left-down
  const sideImage1X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -250, -450, -550, -600, -600]
  );
  const sideImage1Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 150, 300, 350, 380, 380]
  );
  const sideImage1Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 90, 180, 270, 300, 300]
  );
  const sideImage1Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.4, 0.4, 0.45, 0.45]
  );
  const sideImage1Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.85, 0.5, 0.35, 0.3, 0.3]
  );

  // Side image 2 (right top): flies right-up
  const sideImage2X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 200, 400, 500, 550, 550]
  );
  const sideImage2Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -120, -240, -300, -330, -330]
  );
  const sideImage2Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 60, 120, 240, 260, 260]
  );
  const sideImage2Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.5, 0.5, 0.55, 0.55]
  );
  const sideImage2Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.95, 0.7, 0.45, 0.4, 0.4]
  );

  // Side image 3 (right bottom): flies right-down
  const sideImage3X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 300, 500, 650, 700, 700]
  );
  const sideImage3Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 180, 360, 450, 480, 480]
  );
  const sideImage3Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -120, -240, -480, -520, -520]
  );
  const sideImage3Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.4, 0.45, 0.5, 0.5]
  );
  const sideImage3Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.9, 0.55, 0.35, 0.3, 0.3]
  );

  const sideImageTransforms = [
    {
      x: sideImage0X,
      y: sideImage0Y,
      rotate: sideImage0Rotate,
      opacity: sideImage0Opacity,
      scale: sideImage0Scale,
    },
    {
      x: sideImage1X,
      y: sideImage1Y,
      rotate: sideImage1Rotate,
      opacity: sideImage1Opacity,
      scale: sideImage1Scale,
    },
    {
      x: sideImage2X,
      y: sideImage2Y,
      rotate: sideImage2Rotate,
      opacity: sideImage2Opacity,
      scale: sideImage2Scale,
    },
    {
      x: sideImage3X,
      y: sideImage3Y,
      rotate: sideImage3Rotate,
      opacity: sideImage3Opacity,
      scale: sideImage3Scale,
    },
  ];

  // Additional transforms for explosion effects - must be at top level
  const explosionGlowOpacity = useTransform(
    smoothMediaProgress,
    [0.45, 0.55, 0.65, 0.75],
    [0, 0.6, 0.4, 0.1]
  );
  const explosionParticlesOpacity = useTransform(
    smoothMediaProgress,
    [0.5, 0.55, 0.6],
    [0, 0.3, 0]
  );
  const imagesContainerZIndex = useTransform(
    smoothMediaProgress,
    [0, 0.5, 0.65],
    [20, 60, 20]
  );

  // 3D transforms for images - only for images 1 and 3 that fly towards screen
  const image3DRotateX = useTransform(
    smoothMediaProgress,
    [0, 0.5, 0.55, 0.65],
    [0, 0, 10, 20]
  );
  const image3DRotateY = useTransform(
    smoothMediaProgress,
    [0, 0.5, 0.55, 0.65],
    [0, 0, 5, 10]
  );
  const image3DZ = useTransform(
    smoothMediaProgress,
    [0, 0.5, 0.55, 0.65],
    [0, 0, 500, 800]
  );

  // Static MotionValues for images 0 and 2 (no 3D effect) - must be hooks to maintain hook order
  const imageNo3DRotateX = useMotionValue(0);
  const imageNo3DRotateY = useMotionValue(0);
  const imageNo3DZ = useMotionValue(0);

  // Z-index and pointer events for images during explosion
  const imageZIndexExplosion = useTransform(
    smoothMediaProgress,
    [0, 0.5, 0.65],
    [20, 70, 20]
  );
  const imagePointerEventsValue = useTransform(
    smoothMediaProgress,
    [0, 0.5, 0.65],
    [1, 0, 0]
  );
  const imagePointerEventsExplosion = useTransform(
    imagePointerEventsValue,
    (val) => (val === 1 ? "auto" : "none")
  );

  // Transform for burnt effects after explosion - use transforms instead of .get() to avoid hydration mismatch
  const burntFilter = useTransform(smoothMediaProgress, (progress) =>
    progress > 0.7
      ? "contrast(1.5) brightness(0.7) sepia(0.3) hue-rotate(10deg) saturate(0.8)"
      : "none"
  );

  // Clip paths for each image when burnt
  const burntClipPath0 = useTransform(smoothMediaProgress, (progress) =>
    progress > 0.7
      ? "polygon(5% 0%, 95% 3%, 98% 15%, 96% 35%, 100% 50%, 94% 70%, 97% 85%, 92% 100%, 8% 96%, 3% 80%, 0% 60%, 4% 40%, 1% 20%)"
      : "none"
  );
  const burntClipPath1 = useTransform(smoothMediaProgress, (progress) =>
    progress > 0.7
      ? "polygon(3% 5%, 97% 0%, 95% 20%, 100% 40%, 96% 60%, 98% 80%, 93% 97%, 10% 100%, 5% 85%, 0% 65%, 3% 45%, 2% 25%)"
      : "none"
  );
  const burntClipPath2 = useTransform(smoothMediaProgress, (progress) =>
    progress > 0.7
      ? "polygon(0% 8%, 92% 0%, 97% 18%, 94% 38%, 100% 55%, 95% 75%, 98% 92%, 5% 100%, 2% 83%, 5% 63%, 0% 43%, 3% 23%)"
      : "none"
  );
  const burntClipPath3 = useTransform(smoothMediaProgress, (progress) =>
    progress > 0.7
      ? "polygon(7% 0%, 100% 7%, 96% 25%, 99% 45%, 95% 65%, 97% 82%, 91% 100%, 0% 93%, 4% 75%, 1% 55%, 5% 35%, 2% 15%)"
      : "none"
  );

  // Side image clip paths
  const sideBurntClipPath0 = useTransform(smoothMediaProgress, (progress) =>
    progress > 0.7
      ? "polygon(2% 3%, 98% 0%, 95% 25%, 99% 50%, 95% 75%, 98% 95%, 5% 100%, 0% 80%, 3% 60%, 0% 40%, 4% 20%)"
      : "none"
  );
  const sideBurntClipPath1 = useTransform(smoothMediaProgress, (progress) =>
    progress > 0.7
      ? "polygon(0% 5%, 95% 2%, 100% 30%, 96% 55%, 99% 80%, 92% 100%, 8% 97%, 3% 70%, 0% 45%, 5% 20%)"
      : "none"
  );
  const sideBurntClipPath2 = useTransform(smoothMediaProgress, (progress) =>
    progress > 0.7
      ? "polygon(5% 0%, 100% 8%, 97% 35%, 100% 60%, 94% 85%, 99% 98%, 3% 95%, 0% 75%, 4% 50%, 0% 25%)"
      : "none"
  );
  const sideBurntClipPath3 = useTransform(smoothMediaProgress, (progress) =>
    progress > 0.7
      ? "polygon(0% 2%, 96% 5%, 100% 28%, 95% 53%, 99% 78%, 93% 100%, 5% 98%, 2% 73%, 0% 48%, 3% 23%)"
      : "none"
  );

  const burntClipPaths = [
    burntClipPath0,
    burntClipPath1,
    burntClipPath2,
    burntClipPath3,
  ];
  const sideBurntClipPaths = [
    sideBurntClipPath0,
    sideBurntClipPath1,
    sideBurntClipPath2,
    sideBurntClipPath3,
  ];

  // Additional transforms for video effects
  const smokeLayerOpacity = useTransform(videoRedTint, [0, 1], [0, 0.5]);
  // White fade that fades to white during explosion then back to transparent
  // Changed to respond to explosion progress for better sync
  const whiteFadeOverlayOpacity = useTransform(
    smoothMediaProgress,
    [0.6, 0.7, 0.8, 0.9, 0.95, 1],
    [0, 0.2, 0.5, 0.9, 0.7, 0] // Reaches near-white then fades back
  );
  // Remove second white overlay - not needed (removed unused variable)

  // Hide section when animation is complete (after white fade is done)
  // DISABLED: Keep section visible to show burnt debris
  /*
  useEffect(() => {
    if (isAnimationComplete) return;

    const unsubscribe = smoothMediaProgress.on("change", (latest) => {
      const whiteFadeOpacity = whiteFadeOverlayOpacity.get();
      // When progress reaches 1 and white fade is back to 0, animation is complete
      if (latest >= 0.99 && whiteFadeOpacity <= 0.1) {
        setIsAnimationComplete(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [smoothMediaProgress, whiteFadeOverlayOpacity, isAnimationComplete]);

  // Hide section completely when animation is done
  if (isAnimationComplete) {
    return null;
  }
  */

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-48 bg-black text-white overflow-hidden"
      style={{
        position: "relative" /* Explicit position for scroll tracking */,
        scrollSnapAlign: "start" as const,
        minHeight: "350vh", // Extended section for immersive zoom effect - allows smooth zoom experience
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
            style={
              mounted
                ? { color: headingColor }
                : { color: "rgba(255, 255, 255, 1)" }
            }
            className="text-hero md:text-display font-black mb-8 leading-[0.9] text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            suppressHydrationWarning
          >
            Video & Bild Explosion
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Scrolla för att se hur videon expanderar, bilderna exploderar och
            allt förvandlas till spillror
          </motion.p>
        </motion.div>

        {/* ============================================ */}
        {/* MEDIA CONTAINER - Video and images */}
        {/* ============================================ */}
        <div
          ref={mediaContainerRef}
          className="relative max-w-6xl mx-auto min-h-[600px] md:min-h-[700px] px-4 overflow-visible w-full"
          style={{
            position: "relative",
          }} /* Explicit position for scroll tracking */
        >
          {/* Enhanced red background glow behind images when they explode */}
          {/* More intense and dramatic glow synchronized with explosion */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-15"
            style={
              mounted
                ? {
                    opacity: explosionGlowOpacity,
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(255, 0, 51, 0.8) 0%, rgba(255, 0, 51, 0.5) 30%, rgba(255, 0, 51, 0.2) 60%, transparent 80%)",
                    filter: "blur(100px)",
                    transform: "scale(1.2)",
                  }
                : {
                    opacity: 0,
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(255, 0, 51, 0.8) 0%, rgba(255, 0, 51, 0.5) 30%, rgba(255, 0, 51, 0.2) 60%, transparent 80%)",
                    filter: "blur(100px)",
                    transform: "scale(1.2)",
                  }
            }
            suppressHydrationWarning
          />

          {/* Additional explosion particles effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-15"
            style={
              mounted
                ? {
                    opacity: explosionParticlesOpacity,
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(255, 0, 51, 1) 0%, transparent 50%)",
                    filter: "blur(60px)",
                    transform: "scale(0.8)",
                  }
                : {
                    opacity: 0,
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(255, 0, 51, 1) 0%, transparent 50%)",
                    filter: "blur(60px)",
                    transform: "scale(0.8)",
                  }
            }
            suppressHydrationWarning
          />

          {/* Portfolio images grid - splits apart as you scroll */}
          <motion.div
            ref={imagesContainerRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative max-w-full"
            style={
              mounted
                ? {
                    zIndex: imagesContainerZIndex,
                  }
                : { zIndex: 20 }
            }
            suppressHydrationWarning
          >
            {portfolioImages.map((src, index) => {
              const transforms = imageTransforms[index];

              return (
                <motion.div
                  key={src}
                  style={
                    mounted
                      ? {
                          // Use scroll-based transforms for smoother, more natural explosion
                          x: transforms.x,
                          y: transforms.y,
                          rotate: transforms.rotate,
                          rotateX:
                            index === 1 || index === 3
                              ? image3DRotateX
                              : imageNo3DRotateX,
                          rotateY:
                            index === 1 || index === 3
                              ? image3DRotateY
                              : imageNo3DRotateY,
                          z: index === 1 || index === 3 ? image3DZ : imageNo3DZ,
                          opacity: transforms.opacity,
                          scale: transforms.scale,
                          willChange: "transform, opacity, filter",
                          transformStyle: "preserve-3d",
                          perspective: 2000, // Increased for better 3D effect when images fly towards screen
                          maxWidth: "100%",
                          zIndex: imageZIndexExplosion,
                          pointerEvents: imagePointerEventsExplosion,
                          // Apply burnt effect after explosion (when progress > 0.7)
                          filter: burntFilter,
                          // Add damaged edges with unique clip-path for each image
                          clipPath: burntClipPaths[index],
                          minHeight: "200px",
                        }
                      : {
                          x: 0,
                          y: 0,
                          rotate: 0,
                          rotateX: 0,
                          rotateY: 0,
                          z: 0,
                          opacity: 1,
                          scale: 1,
                          willChange: "transform, opacity",
                          transformStyle: "preserve-3d",
                          perspective: 2000,
                          maxWidth: "100%",
                          zIndex: "auto",
                          pointerEvents: "auto",
                          minHeight: "200px",
                        }
                  }
                  suppressHydrationWarning
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
                    duration: shouldReduceMotion ? 0 : 0.7,
                    delay: shouldReduceMotion ? 0 : index * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    zIndex: 40,
                  }}
                  className="relative aspect-square overflow-hidden rounded-lg border border-accent/20 group cursor-pointer max-w-full w-full"
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
            className={`${
              textsShouldStick ? "fixed" : "absolute"
            } z-50 cursor-pointer`}
            style={{
              left: "50%",
              top: "50%",
              x: designTextFlyingToModal
                ? 0 // Fly to center (modal position)
                : textsDisappearing
                ? -800
                : textsShouldStick
                ? -300
                : designTextX,
              y: designTextFlyingToModal
                ? 0 // Fly to center (modal position)
                : textsDisappearing
                ? -400
                : textsShouldStick
                ? -400
                : designTextY,
              opacity: designTextFlyingToModal
                ? 0 // Fade out as it flies into modal
                : textsDisappearing
                ? 0
                : textsShouldStick
                ? 1
                : designTextOpacity,
              scale: designTextFlyingToModal
                ? 0.3 // Shrink as it flies into modal
                : textsDisappearing
                ? 0
                : textsShouldStick
                ? 1
                : designTextScale,
              rotate: designTextFlyingToModal
                ? 0 // Straighten out
                : textsDisappearing
                ? -90
                : textsShouldStick
                ? -20
                : designTextRotate,
            }}
            onClick={() => {
              // Clear any existing timeouts
              if (timeoutRefs.current.design1)
                clearTimeout(timeoutRefs.current.design1);
              if (timeoutRefs.current.design2)
                clearTimeout(timeoutRefs.current.design2);

              setDesignTextFlyingToModal(true);
              timeoutRefs.current.design1 = setTimeout(() => {
                setIsDesignModalOpen(true);
                setModalShake(true);
                timeoutRefs.current.design2 = setTimeout(
                  () => setModalShake(false),
                  1000
                );
              }, 600); // Delay to allow text to fly into modal
            }}
            whileHover={{
              scale:
                designTextFlyingToModal || textsDisappearing
                  ? 1
                  : textsShouldStick
                  ? 1.1
                  : 1.1,
            }}
            transition={{
              duration: designTextFlyingToModal
                ? 0.6
                : textsDisappearing
                ? 1
                : 0.2,
              ease: designTextFlyingToModal ? [0.34, 1.56, 0.64, 1] : "easeOut",
            }}
          >
            <h3
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white whitespace-nowrap px-4 sm:px-8"
              style={{
                textShadow:
                  "0 0 60px rgba(0, 102, 255, 0.9), 0 0 100px rgba(0, 102, 255, 0.7), 0 0 150px rgba(0, 102, 255, 0.5), 0 0 200px rgba(0, 102, 255, 0.3)",
                WebkitTextStroke: "3px rgba(0, 102, 255, 0.6)",
                filter: "drop-shadow(0 0 20px rgba(0, 102, 255, 0.8))",
              }}
            >
              Design?
            </h3>
          </motion.div>

          <motion.div
            className={`${
              textsShouldStick ? "fixed" : "absolute"
            } z-50 cursor-pointer`}
            style={{
              left: "50%",
              top: "50%",
              x: functionalityTextFlyingToModal
                ? 0 // Fly to center (modal position)
                : textsDisappearing
                ? 800
                : textsShouldStick
                ? 300
                : functionalityTextX,
              y: functionalityTextFlyingToModal
                ? 0 // Fly to center (modal position)
                : textsDisappearing
                ? -400
                : textsShouldStick
                ? -400
                : functionalityTextY,
              opacity: functionalityTextFlyingToModal
                ? 0 // Fade out as it flies into modal
                : textsDisappearing
                ? 0
                : textsShouldStick
                ? 1
                : functionalityTextOpacity,
              scale: functionalityTextFlyingToModal
                ? 0.3 // Shrink as it flies into modal
                : textsDisappearing
                ? 0
                : textsShouldStick
                ? 1
                : functionalityTextScale,
              rotate: functionalityTextFlyingToModal
                ? 0 // Straighten out
                : textsDisappearing
                ? 90
                : textsShouldStick
                ? 20
                : functionalityTextRotate,
            }}
            onClick={() => {
              // Clear any existing timeouts
              if (timeoutRefs.current.func1)
                clearTimeout(timeoutRefs.current.func1);
              if (timeoutRefs.current.func2)
                clearTimeout(timeoutRefs.current.func2);

              setFunctionalityTextFlyingToModal(true);
              timeoutRefs.current.func1 = setTimeout(() => {
                setIsFunctionalityModalOpen(true);
                setModalShake(true);
                timeoutRefs.current.func2 = setTimeout(
                  () => setModalShake(false),
                  1000
                );
              }, 600); // Delay to allow text to fly into modal
            }}
            whileHover={{
              scale:
                functionalityTextFlyingToModal || textsDisappearing
                  ? 1
                  : textsShouldStick
                  ? 1.1
                  : 1.1,
            }}
            transition={{
              duration: functionalityTextFlyingToModal
                ? 0.6
                : textsDisappearing
                ? 1
                : 0.2,
              ease: functionalityTextFlyingToModal
                ? [0.34, 1.56, 0.64, 1]
                : "easeOut",
            }}
          >
            <h3
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white whitespace-nowrap px-4 sm:px-8"
              style={{
                textShadow:
                  "0 0 60px rgba(255, 0, 51, 0.9), 0 0 100px rgba(255, 0, 51, 0.7), 0 0 150px rgba(255, 0, 51, 0.5), 0 0 200px rgba(255, 0, 51, 0.3)",
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
              maxWidth: "min(100%, 80rem)",
            }}
            className="absolute w-full overflow-visible"
          >
            {/* Container for video with side images */}
            {mounted && (
              <div className="flex items-center gap-4">
                {/* Left side images */}
                <div className="flex flex-col gap-4">
                  {sideImages.slice(0, 2).map((src, index) => {
                    const transforms = sideImageTransforms[index];
                    return (
                      <motion.div
                        key={src}
                        style={
                          mounted
                            ? {
                                x: transforms.x,
                                y: transforms.y,
                                rotate: transforms.rotate,
                                opacity: transforms.opacity,
                                scale: transforms.scale,
                                willChange: "transform, opacity, filter",
                                maxWidth: "150px",
                                width: "100%",
                                // Apply burnt effect after explosion
                                filter: burntFilter,
                                // Damaged edges with unique clip-path
                                clipPath: sideBurntClipPaths[index],
                              }
                            : {
                                x: 0,
                                y: 0,
                                rotate: 0,
                                opacity: 1,
                                scale: 1,
                                filter: "none",
                                clipPath: "none",
                              }
                        }
                        suppressHydrationWarning
                        className="relative aspect-square overflow-hidden rounded-lg border border-accent/20"
                      >
                        <Image
                          src={src}
                          alt={`Side portfolio ${index + 1}`}
                          fill
                          sizes="150px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Center video */}
                <div className="flex-1 rounded-lg overflow-hidden shadow-2xl border-2 border-accent/20 relative">
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
                      preload="auto"
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
                      <source
                        src="/videos/telephone_ringin.mp4"
                        type="video/mp4"
                      />
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
                      opacity: smokeLayerOpacity,
                      zIndex: 3,
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(255, 0, 51, 0.3) 0%, transparent 70%)",
                    }}
                  />
                </div>

                {/* Right side images */}
                {mounted && (
                  <div className="flex flex-col gap-4">
                    {sideImages.slice(2, 4).map((src, globalIndex) => {
                      const index = globalIndex - 2 + 2; // Adjust index for transforms array
                      const transforms = sideImageTransforms[index];
                      return (
                        <motion.div
                          key={src}
                          style={
                            mounted
                              ? {
                                  x: transforms.x,
                                  y: transforms.y,
                                  rotate: transforms.rotate,
                                  opacity: transforms.opacity,
                                  scale: transforms.scale,
                                  willChange: "transform, opacity, filter",
                                  maxWidth: "150px",
                                  width: "100%",
                                  // Apply burnt effect after explosion
                                  filter: burntFilter,
                                  // Damaged edges with unique clip-path
                                  clipPath: sideBurntClipPaths[index],
                                }
                              : {
                                  x: 0,
                                  y: 0,
                                  rotate: 0,
                                  opacity: 1,
                                  scale: 1,
                                  filter: "none",
                                  clipPath: "none",
                                }
                          }
                          suppressHydrationWarning
                          className="relative aspect-square overflow-hidden rounded-lg border border-accent/20"
                        >
                          <Image
                            src={src}
                            alt={`Side portfolio ${index + 1}`}
                            fill
                            sizes="150px"
                            className="object-cover"
                            loading="lazy"
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* White fade overlay - fades in then OUT to reveal Matrix text */}
      {/* Shows white briefly then fades back to transparent */}
      <motion.div
        className="fixed inset-0 bg-white pointer-events-none z-[100]"
        style={{
          opacity: whiteFadeOverlayOpacity,
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
                    ease: "easeOut",
                  },
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
                      Design är mer än bara hur något ser ut – det är hur det
                      känns, hur det fungerar och hur det berättar din historia.
                    </p>
                    <p className="text-lg text-gray-600 mb-4">
                      Vi skapar visuella upplevelser som inte bara är vackra,
                      utan också meningsfulla. Varje pixel är genomtänkt, varje
                      färg har ett syfte, och varje animation berättar en del av
                      din berättelse.
                    </p>
                    <p className="text-lg text-gray-600">
                      Vårt designfilosofi bygger på balans mellan estetik och
                      funktionalitet. Vi skapar hemsidor som inte bara ser bra
                      ut – de känns rätt.
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
                    ease: "easeOut",
                  },
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
                      Funktion är grunden för allt vi bygger. Varje knapp, varje
                      animation, varje interaktion är designad för att fungera
                      perfekt.
                    </p>
                    <p className="text-lg text-gray-600 mb-4">
                      Vi bygger hemsidor som är snabba, responsiva och
                      användarvänliga. Tekniken är osynlig – det som syns är en
                      smidig upplevelse som bara fungerar.
                    </p>
                    <p className="text-lg text-gray-600">
                      Vår kod är ren, välstrukturerad och optimerad. Vi använder
                      senaste tekniker för att säkerställa att din hemsida inte
                      bara ser bra ut, utan också presterar utmärkt.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Remove second white overlay - not needed anymore */}
    </section>
  );
}
