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
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ImageTransformConfig = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  rotate: MotionValue<number>;
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
  skewX?: MotionValue<number>;
  skewY?: MotionValue<number>;
  rotateXMotion?: MotionValue<number>;
  rotateYMotion?: MotionValue<number>;
  zMotion?: MotionValue<number>;
};

type DebrisSnapshot = {
  x: number;
  y: number;
  rotate: number;
  opacity: number;
  scale: number;
  skewX: number;
  skewY: number;
  rotateX: number;
  rotateY: number;
  z: number;
};

export default function HeroAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const secondaryImagesContainerRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolledRef = useRef(false);
  const imageTransformsRef = useRef<{
    primary: ImageTransformConfig[];
    secondary: ImageTransformConfig[];
  } | null>(null);
  const sideImageTransformsRef = useRef<ImageTransformConfig[] | null>(null);
  const [primaryDebrisPositions, setPrimaryDebrisPositions] = useState<DebrisSnapshot[] | null>(null);
  const [secondaryDebrisPositions, setSecondaryDebrisPositions] = useState<DebrisSnapshot[] | null>(null);
  const [sideDebrisPositions, setSideDebrisPositions] = useState<Array<{
    x: number;
    y: number;
    rotate: number;
    opacity: number;
    scale: number;
    skewX: number;
    skewY: number;
  }> | null>(null);
  const { videoRef, videoError, mounted } = useVideoLoader();

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
  const [hasExploded, setHasExploded] = useState(false);
  const hasExplodedRef = useRef(false);

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

  // State to control white overlay visibility (can be forced closed for Pacman)
  const [whiteOverlayForcedClosed, setWhiteOverlayForcedClosed] = useState(false);
  // Use ref to avoid stale closure issues in onClick handlers
  const pacmanOverlayActiveRef = useRef(false);

  // Close modals when Pacman game is about to show (mobile fix)
  useEffect(() => {
    const handleCloseModals = () => {
      setIsDesignModalOpen(false);
      setIsFunctionalityModalOpen(false);
      setDesignTextFlyingToModal(false);
      setFunctionalityTextFlyingToModal(false);
      pacmanOverlayActiveRef.current = true;
      // Clear any pending modal timeouts
      if (timeoutRefs.current.design1) clearTimeout(timeoutRefs.current.design1);
      if (timeoutRefs.current.design2) clearTimeout(timeoutRefs.current.design2);
      if (timeoutRefs.current.func1) clearTimeout(timeoutRefs.current.func1);
      if (timeoutRefs.current.func2) clearTimeout(timeoutRefs.current.func2);
    };

    const handleCloseWhiteOverlay = () => {
      setWhiteOverlayForcedClosed(true);
    };

    // Listen for when Pacman overlay is dismissed
    const handlePacmanDismissed = () => {
      pacmanOverlayActiveRef.current = false;
    };

    window.addEventListener('closeHeroModals', handleCloseModals);
    window.addEventListener('closeHeroWhiteOverlay', handleCloseWhiteOverlay);
    window.addEventListener('pacmanOverlayDismissed', handlePacmanDismissed);
    return () => {
      window.removeEventListener('closeHeroModals', handleCloseModals);
      window.removeEventListener('closeHeroWhiteOverlay', handleCloseWhiteOverlay);
      window.removeEventListener('pacmanOverlayDismissed', handlePacmanDismissed);
    };
  }, []);

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
    layoutEffect: false,
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
  const secondaryImagesInView = useInView(secondaryImagesContainerRef, {
    once: false,
    margin: "-100px",
    amount: 0.2,
  });

  const previousProgressRef = useRef(smoothMediaProgress.get());

  // Auto-play explosion when video touches images
  useEffect(() => {
    if (explosionAutoPlay) return;

    const explosionDuration = 2500;
    const whiteoutScrollDelay = 600;
    let whiteoutCheckRaf: number | null = null;
    const explosionStartProgress = 0.35;

    const unsubscribe = mediaScrollProgress.on("change", (latest) => {
      if (latest >= explosionStartProgress && !explosionAutoPlay) {
        setExplosionAutoPlay(true);
        setHasExploded(true);
        hasExplodedRef.current = true;
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

          // Save debris positions when explosion is complete
          if (progress >= 1) {
            const transformsSnapshot = imageTransformsRef.current;
            const sideTransformsSnapshot = sideImageTransformsRef.current;

            // Get viewport dimensions for viewport-relative positioning
            const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
            const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

            // Calculate viewport-relative bounds (keep images mostly visible)
            const maxX = viewportWidth * 0.35;
            const maxY = viewportHeight * 0.4;

            if (!primaryDebrisPositions && transformsSnapshot?.primary) {
              const primarySnapshot = transformsSnapshot.primary.map((transform, index) => {
                let x = transform.x.get();
                let y = transform.y.get();

                // Clamp to viewport bounds with asymmetric distribution
                const xRatio = index % 2 === 0 ? -0.3 : 0.3;
                const yRatio = index < 2 ? -0.25 : 0.25;

                x = Math.max(-maxX, Math.min(maxX, x * 0.6 + viewportWidth * xRatio));
                y = Math.max(-maxY, Math.min(maxY, y * 0.6 + viewportHeight * yRatio));

                return {
                  x,
                  y,
                  rotate: transform.rotate.get(),
                  opacity: transform.opacity.get(),
                  scale: transform.scale.get(),
                  skewX: transform.skewX?.get() || 0,
                  skewY: transform.skewY?.get() || 0,
                  rotateX: transform.rotateXMotion?.get() || 0,
                  rotateY: transform.rotateYMotion?.get() || 0,
                  z: transform.zMotion?.get() || 0,
                };
              });

              setPrimaryDebrisPositions(primarySnapshot);
            }

            if (!secondaryDebrisPositions && transformsSnapshot?.secondary) {
              const secondarySnapshot = transformsSnapshot.secondary.map((transform, index) => {
                let x = transform.x.get();
                let y = transform.y.get();

                // Clamp to viewport bounds with asymmetric distribution
                const xRatio = index % 2 === 0 ? -0.2 : 0.2;
                const yRatio = index < 2 ? -0.15 : 0.15;

                x = Math.max(-maxX * 0.8, Math.min(maxX * 0.8, x * 0.5 + viewportWidth * xRatio));
                y = Math.max(-maxY * 0.7, Math.min(maxY * 0.7, y * 0.5 + viewportHeight * yRatio));

                return {
                  x,
                  y,
                  rotate: transform.rotate.get(),
                  opacity: transform.opacity.get(),
                  scale: transform.scale.get(),
                  skewX: transform.skewX?.get() || 0,
                  skewY: transform.skewY?.get() || 0,
                  rotateX: transform.rotateXMotion?.get() || 0,
                  rotateY: transform.rotateYMotion?.get() || 0,
                  z: transform.zMotion?.get() || 0,
                };
              });

              setSecondaryDebrisPositions(secondarySnapshot);
            }

            if (!sideDebrisPositions && sideTransformsSnapshot) {
              const sideSnapshot = sideTransformsSnapshot.map((transform, index) => {
                let x = transform.x.get();
                let y = transform.y.get();

                // Side images: keep them more to the edges but still visible
                const xRatio = index < 2 ? -0.4 : 0.4;
                const yRatio = index % 2 === 0 ? -0.2 : 0.2;

                x = Math.max(-maxX * 1.2, Math.min(maxX * 1.2, x * 0.7 + viewportWidth * xRatio));
                y = Math.max(-maxY * 0.6, Math.min(maxY * 0.6, y * 0.6 + viewportHeight * yRatio));

                return {
                  x,
                  y,
                  rotate: transform.rotate.get(),
                  opacity: transform.opacity.get(),
                  scale: transform.scale.get(),
                  skewX: transform.skewX?.get() || 0,
                  skewY: transform.skewY?.get() || 0,
                };
              });

              setSideDebrisPositions(sideSnapshot);
            }
          }

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
    primaryDebrisPositions,
    secondaryDebrisPositions,
    sideDebrisPositions,
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
  const baseVideoOpacity = useTransform(
    smoothMediaProgress,
    [0, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1],
    [0.3, 0.6, 0.85, 0.95, 1, 0.8, 0.5, 0.2, 0, 0, 0] // Fades out after explosion
  );

  // Video should remain hidden permanently after explosion - never show again when scrolling back
  const videoOpacity = useTransform(baseVideoOpacity, (opacity) =>
    (mounted && hasExploded) ? 0 : opacity
  );

  // Video scale - grows gradually, then auto-expands when touching images
  // More controlled expansion for better viewing
  const videoScale = useTransform(
    smoothMediaProgress,
    [0, 0.15, 0.2, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1],
    [0.4, 0.5, 0.6, 0.7, 0.9, 1.2, 1.8, 2.5, 3.5, 4.5, 5.0, 5.5] // Much smaller scale for better viewing
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
  const secondaryPortfolioImages = [
    "/images/portfolio/assets_task_01k05sqa0wedsbvfk5c0773fz5_1752541456_img_0.webp",
    "/images/portfolio/assets_task_01k1c880wqft0s0bcr3p77v2me_1753831780_img_0.webp",
    "/images/portfolio/assets_task_01k80qdg0ze1rskjzfpj7r1za3_1760961264_img_0.webp",
    "/images/portfolio/task_01k9et3f60e4782n74d3pkapg7_1762507579_img_0.webp",
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

  // Image 0 (top-left): "Snurrar åt vänster-upp" - spins diagonally and stays as debris
  const image0X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -180, -320, -420, -480, -480] // More centered, asymmetric
  );
  const image0Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 20, -80, -140, -180, -180] // More centered, slightly down
  );
  const image0Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -120, -240, -450, -480, -480]
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

  // Image 1 (top-right): "Flyger diagonalt upp-höger" - flies diagonally and stays as debris
  const image1X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 200, 380, 520, 600, 600] // More centered, asymmetric
  );
  const image1Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -40, -150, -220, -260, -260] // More centered
  );
  const image1Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 25, 45, 75, 85, 85]
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

  // Image 2 (bottom-left): "Rullar diagonalt ned-vänster" - rolls diagonally and stays as debris
  const image2X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -200, -380, -500, -580, -580] // More centered, asymmetric
  );
  const image2Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 80, 180, 250, 280, 280] // More centered
  );
  const image2Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 450, 900, 1800, 1900, 1900]
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

  // Image 3 (bottom-right): "Flyger diagonalt ned-höger" - flies diagonally and stays as debris
  const image3X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 220, 420, 580, 680, 680] // More centered, asymmetric
  );
  const image3Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 60, 140, 200, 230, 230] // More centered
  );
  const image3Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -25, -50, -90, -100, -100]
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

  // Skew transforms for folded/torn effect
  const image0SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 3, 8, 12, 15, 15]
  );
  const image0SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -4, -9, -12, -14, -14]
  );

  const image1SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -4, -10, -15, -17, -17]
  );
  const image1SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 5, 11, 15, 16, 16]
  );

  const image2SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 6, 12, 17, 20, 20]
  );
  const image2SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -7, -15, -20, -22, -22]
  );

  const image3SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -5, -11, -16, -19, -19]
  );
  const image3SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 6, 14, 19, 21, 21]
  );

  // 3D transforms for selected images
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

  // Static MotionValues for flat images
  const imageNo3DRotateX = useMotionValue(0);
  const imageNo3DRotateY = useMotionValue(0);
  const imageNo3DZ = useMotionValue(0);

  const primaryImageTransforms = useMemo<ImageTransformConfig[]>(
    () => [
      {
        x: image0X,
        y: image0Y,
        rotate: image0Rotate,
        opacity: image0Opacity,
        scale: image0Scale,
        skewX: image0SkewX,
        skewY: image0SkewY,
        rotateXMotion: imageNo3DRotateX,
        rotateYMotion: imageNo3DRotateY,
        zMotion: imageNo3DZ,
      },
      {
        x: image1X,
        y: image1Y,
        rotate: image1Rotate,
        opacity: image1Opacity,
        scale: image1Scale,
        skewX: image1SkewX,
        skewY: image1SkewY,
        rotateXMotion: image3DRotateX,
        rotateYMotion: image3DRotateY,
        zMotion: image3DZ,
      },
      {
        x: image2X,
        y: image2Y,
        rotate: image2Rotate,
        opacity: image2Opacity,
        scale: image2Scale,
        skewX: image2SkewX,
        skewY: image2SkewY,
        rotateXMotion: imageNo3DRotateX,
        rotateYMotion: imageNo3DRotateY,
        zMotion: imageNo3DZ,
      },
      {
        x: image3X,
        y: image3Y,
        rotate: image3Rotate,
        opacity: image3Opacity,
        scale: image3Scale,
        skewX: image3SkewX,
        skewY: image3SkewY,
        rotateXMotion: image3DRotateX,
        rotateYMotion: image3DRotateY,
        zMotion: image3DZ,
      },
    ],
    [
      image0X,
      image0Y,
      image0Rotate,
      image0Opacity,
      image0Scale,
      image0SkewX,
      image0SkewY,
      image1X,
      image1Y,
      image1Rotate,
      image1Opacity,
      image1Scale,
      image1SkewX,
      image1SkewY,
      image2X,
      image2Y,
      image2Rotate,
      image2Opacity,
      image2Scale,
      image2SkewX,
      image2SkewY,
      image3X,
      image3Y,
      image3Rotate,
      image3Opacity,
      image3Scale,
      image3SkewX,
      image3SkewY,
      image3DRotateX,
      image3DRotateY,
      image3DZ,
      imageNo3DRotateX,
      imageNo3DRotateY,
      imageNo3DZ,
    ]
  );

  // Secondary grid images (additional debris)
  const secondaryImage0X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, -60, -140, -200, -240, -240] // More centered, asymmetric
  );
  const secondaryImage0Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 30, -40, -90, -120, -120] // More centered
  );
  const secondaryImage0Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, -40, -110, -170, -190, -190]
  );
  const secondaryImage0Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.85, 0.6, 0.55, 0.55]
  );
  const secondaryImage0Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.9, 0.65, 0.5, 0.5]
  );
  const secondaryImage0SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, -2, -6, -10, -12, -12]
  );
  const secondaryImage0SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 3, 7, 11, 13, 13]
  );

  const secondaryImage1X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 120, 250, 360, 450, 450] // More centered, asymmetric
  );
  const secondaryImage1Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 20, -60, -110, -135, -135] // More centered
  );
  const secondaryImage1Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 30, 90, 150, 180, 180]
  );
  const secondaryImage1Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.55, 0.5, 0.5]
  );
  const secondaryImage1Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [1, 1, 1.1, 0.75, 0.55, 0.55]
  );
  const secondaryImage1SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 2, 6, 10, 12, 12]
  );
  const secondaryImage1SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, -3, -7, -11, -12, -12]
  );

  const secondaryImage2X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, -80, -160, -240, -300, -300] // More centered, asymmetric
  );
  const secondaryImage2Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 40, 120, 180, 210, 210] // More centered
  );
  const secondaryImage2Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 200, 360, 520, 540, 540]
  );
  const secondaryImage2Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.8, 0.45, 0.45, 0.45]
  );
  const secondaryImage2Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.85, 0.55, 0.4, 0.4]
  );
  const secondaryImage2SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, -4, -9, -13, -15, -15]
  );
  const secondaryImage2SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 5, 11, 15, 17, 17]
  );

  const secondaryImage3X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 160, 320, 460, 560, 560] // More centered, asymmetric
  );
  const secondaryImage3Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 10, 80, 140, 170, 170] // More centered
  );
  const secondaryImage3Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, -220, -380, -520, -560, -560]
  );
  const secondaryImage3Opacity = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [1, 1, 0.78, 0.5, 0.5, 0.5]
  );
  const secondaryImage3Scale = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [1, 1, 1.05, 0.7, 0.48, 0.48]
  );
  const secondaryImage3SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, 5, 10, 15, 17, 17]
  );
  const secondaryImage3SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.35, 0.45, 0.7, 1],
    [0, -6, -12, -16, -18, -18]
  );

  const secondaryImageTransforms = useMemo<ImageTransformConfig[]>(
    () => [
      {
        x: secondaryImage0X,
        y: secondaryImage0Y,
        rotate: secondaryImage0Rotate,
        opacity: secondaryImage0Opacity,
        scale: secondaryImage0Scale,
        skewX: secondaryImage0SkewX,
        skewY: secondaryImage0SkewY,
        rotateXMotion: imageNo3DRotateX,
        rotateYMotion: imageNo3DRotateY,
        zMotion: imageNo3DZ,
      },
      {
        x: secondaryImage1X,
        y: secondaryImage1Y,
        rotate: secondaryImage1Rotate,
        opacity: secondaryImage1Opacity,
        scale: secondaryImage1Scale,
        skewX: secondaryImage1SkewX,
        skewY: secondaryImage1SkewY,
        rotateXMotion: imageNo3DRotateX,
        rotateYMotion: imageNo3DRotateY,
        zMotion: imageNo3DZ,
      },
      {
        x: secondaryImage2X,
        y: secondaryImage2Y,
        rotate: secondaryImage2Rotate,
        opacity: secondaryImage2Opacity,
        scale: secondaryImage2Scale,
        skewX: secondaryImage2SkewX,
        skewY: secondaryImage2SkewY,
        rotateXMotion: imageNo3DRotateX,
        rotateYMotion: imageNo3DRotateY,
        zMotion: imageNo3DZ,
      },
      {
        x: secondaryImage3X,
        y: secondaryImage3Y,
        rotate: secondaryImage3Rotate,
        opacity: secondaryImage3Opacity,
        scale: secondaryImage3Scale,
        skewX: secondaryImage3SkewX,
        skewY: secondaryImage3SkewY,
        rotateXMotion: imageNo3DRotateX,
        rotateYMotion: imageNo3DRotateY,
        zMotion: imageNo3DZ,
      },
    ],
    [
      secondaryImage0X,
      secondaryImage0Y,
      secondaryImage0Rotate,
      secondaryImage0Opacity,
      secondaryImage0Scale,
      secondaryImage0SkewX,
      secondaryImage0SkewY,
      secondaryImage1X,
      secondaryImage1Y,
      secondaryImage1Rotate,
      secondaryImage1Opacity,
      secondaryImage1Scale,
      secondaryImage1SkewX,
      secondaryImage1SkewY,
      secondaryImage2X,
      secondaryImage2Y,
      secondaryImage2Rotate,
      secondaryImage2Opacity,
      secondaryImage2Scale,
      secondaryImage2SkewX,
      secondaryImage2SkewY,
      secondaryImage3X,
      secondaryImage3Y,
      secondaryImage3Rotate,
      secondaryImage3Opacity,
      secondaryImage3Scale,
      secondaryImage3SkewX,
      secondaryImage3SkewY,
      imageNo3DRotateX,
      imageNo3DRotateY,
      imageNo3DZ,
    ]
  );

  // Side images transforms - explode outward from video
  // Side image 0 (left top): flies diagonally left-up
  const sideImage0X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -150, -300, -375, -400, -400]
  );
  const sideImage0Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -90, -175, -225, -250, -250]
  );
  const sideImage0Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -60, -120, -240, -270, -270]
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

  // Side image 1 (left bottom): flies diagonally left-down
  const sideImage1X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -200, -375, -475, -525, -525]
  );
  const sideImage1Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 110, 225, 300, 325, 325]
  );
  const sideImage1Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 120, 240, 450, 500, 500]
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

  // Side image 2 (right top): flies diagonally right-up
  const sideImage2X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 175, 325, 425, 475, 475]
  );
  const sideImage2Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -100, -200, -275, -300, -300]
  );
  const sideImage2Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 80, 160, 300, 340, 340]
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

  // Side image 3 (right bottom): flies diagonally right-down
  const sideImage3X = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 225, 400, 500, 550, 550]
  );
  const sideImage3Y = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 125, 250, 325, 360, 360]
  );
  const sideImage3Rotate = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -140, -280, -550, -600, -600]
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

  // Skew transforms for side images
  const sideImage0SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 8, 18, 25, 28, 28]
  );
  const sideImage0SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -10, -20, -28, -30, -30]
  );

  const sideImage1SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -10, -22, -30, -35, -35]
  );
  const sideImage1SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 15, 30, 40, 45, 45]
  );

  const sideImage2SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -12, -25, -35, -40, -40]
  );
  const sideImage2SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 8, 18, 25, 28, 28]
  );

  const sideImage3SkewX = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, 10, 22, 32, 38, 38]
  );
  const sideImage3SkewY = useTransform(
    smoothMediaProgress,
    [0, 0.25, 0.3, 0.35, 0.45, 0.7, 1],
    [0, 0, -12, -25, -35, -40, -40]
  );

  const sideImageTransforms = useMemo(
    () => [
      {
        x: sideImage0X,
        y: sideImage0Y,
        rotate: sideImage0Rotate,
        opacity: sideImage0Opacity,
        scale: sideImage0Scale,
        skewX: sideImage0SkewX,
        skewY: sideImage0SkewY,
      },
      {
        x: sideImage1X,
        y: sideImage1Y,
        rotate: sideImage1Rotate,
        opacity: sideImage1Opacity,
        scale: sideImage1Scale,
        skewX: sideImage1SkewX,
        skewY: sideImage1SkewY,
      },
      {
        x: sideImage2X,
        y: sideImage2Y,
        rotate: sideImage2Rotate,
        opacity: sideImage2Opacity,
        scale: sideImage2Scale,
        skewX: sideImage2SkewX,
        skewY: sideImage2SkewY,
      },
      {
        x: sideImage3X,
        y: sideImage3Y,
        rotate: sideImage3Rotate,
        opacity: sideImage3Opacity,
        scale: sideImage3Scale,
        skewX: sideImage3SkewX,
        skewY: sideImage3SkewY,
      },
    ],
    [
      sideImage0X,
      sideImage0Y,
      sideImage0Rotate,
      sideImage0Opacity,
      sideImage0Scale,
      sideImage0SkewX,
      sideImage0SkewY,
      sideImage1X,
      sideImage1Y,
      sideImage1Rotate,
      sideImage1Opacity,
      sideImage1Scale,
      sideImage1SkewX,
      sideImage1SkewY,
      sideImage2X,
      sideImage2Y,
      sideImage2Rotate,
      sideImage2Opacity,
      sideImage2Scale,
      sideImage2SkewX,
      sideImage2SkewY,
      sideImage3X,
      sideImage3Y,
      sideImage3Rotate,
      sideImage3Opacity,
      sideImage3Scale,
      sideImage3SkewX,
      sideImage3SkewY,
    ]
  );

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

  // Varied burnt filters - some more burned than others
  const burntFilter0 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(1.3) brightness(0.8) sepia(0.2) hue-rotate(5deg) saturate(0.9)" // Less burned
      : "none"
  );
  const burntFilter1 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(1.8) brightness(0.5) sepia(0.5) hue-rotate(15deg) saturate(0.6)" // More burned
      : "none"
  );
  const burntFilter2 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(1.6) brightness(0.6) sepia(0.4) hue-rotate(12deg) saturate(0.7)" // Medium burned
      : "none"
  );
  const burntFilter3 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(2.0) brightness(0.4) sepia(0.6) hue-rotate(20deg) saturate(0.5)" // Very burned
      : "none"
  );

  // Clip paths for each image when burnt/torn - varied torn edges (some more torn)
  // Remain active permanently after explosion
  const burntClipPath0 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(0% 0%, 45% 0%, 50% 5%, 55% 0%, 100% 2%, 98% 20%, 100% 40%, 95% 60%, 98% 80%, 92% 95%, 85% 100%, 60% 98%, 40% 100%, 20% 95%, 5% 90%, 0% 70%, 2% 50%, 0% 30%, 3% 15%)" // Medium torn
      : "none"
  );
  const burntClipPath1 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(0% 2%, 25% 0%, 45% 3%, 65% 0%, 85% 2%, 100% 8%, 95% 18%, 98% 30%, 100% 50%, 92% 70%, 85% 88%, 65% 95%, 45% 100%, 25% 98%, 8% 92%, 0% 75%, 3% 55%, 0% 35%, 2% 15%)" // More torn
      : "none"
  );
  const burntClipPath2 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(2% 0%, 15% 3%, 35% 0%, 55% 2%, 75% 0%, 95% 5%, 100% 20%, 92% 40%, 95% 60%, 88% 80%, 75% 92%, 55% 98%, 35% 100%, 15% 95%, 0% 85%, 5% 65%, 0% 45%, 3% 25%, 0% 10%)" // Very torn
      : "none"
  );
  const burntClipPath3 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(5% 0%, 30% 2%, 50% 0%, 70% 3%, 95% 0%, 100% 15%, 98% 35%, 100% 55%, 95% 75%, 90% 90%, 70% 100%, 50% 98%, 30% 100%, 10% 95%, 0% 80%, 2% 60%, 0% 40%, 3% 20%)" // Medium torn
      : "none"
  );

  // Side image clip paths - more dramatic torn edges
  // Remain active permanently after explosion
  const sideBurntClipPath0 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(0% 0%, 40% 2%, 60% 0%, 100% 3%, 98% 20%, 100% 45%, 95% 70%, 98% 90%, 85% 100%, 55% 98%, 35% 100%, 10% 95%, 0% 75%, 2% 50%, 0% 25%, 3% 10%)"
      : "none"
  );
  const sideBurntClipPath1 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(5% 0%, 30% 3%, 55% 0%, 80% 2%, 100% 8%, 95% 30%, 98% 55%, 100% 75%, 88% 95%, 60% 100%, 40% 98%, 15% 95%, 0% 70%, 3% 45%, 0% 20%, 4% 5%)"
      : "none"
  );
  const sideBurntClipPath2 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(8% 0%, 35% 2%, 60% 0%, 85% 3%, 100% 10%, 96% 35%, 99% 60%, 94% 85%, 82% 100%, 55% 98%, 30% 100%, 5% 92%, 0% 65%, 4% 40%, 0% 15%, 3% 5%)"
      : "none"
  );
  const sideBurntClipPath3 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(0% 3%, 25% 0%, 50% 2%, 75% 0%, 100% 5%, 97% 30%, 100% 55%, 96% 80%, 90% 100%, 65% 98%, 40% 100%, 20% 95%, 0% 75%, 3% 50%, 0% 25%, 4% 10%)"
      : "none"
  );

  // Varied burnt filters for secondary images
  const secondaryBurntFilter0 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(1.4) brightness(0.75) sepia(0.25) hue-rotate(8deg) saturate(0.85)" // Less burned
      : "none"
  );
  const secondaryBurntFilter1 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(1.9) brightness(0.45) sepia(0.55) hue-rotate(18deg) saturate(0.55)" // More burned
      : "none"
  );
  const secondaryBurntFilter2 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(1.7) brightness(0.55) sepia(0.45) hue-rotate(14deg) saturate(0.65)" // Medium burned
      : "none"
  );
  const secondaryBurntFilter3 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(2.1) brightness(0.35) sepia(0.65) hue-rotate(22deg) saturate(0.45)" // Very burned
      : "none"
  );

  // Varied clip paths for secondary images (more torn)
  const secondaryBurntClipPath0 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(0% 3%, 20% 0%, 40% 2%, 60% 0%, 80% 3%, 100% 8%, 95% 25%, 98% 45%, 100% 65%, 92% 85%, 80% 95%, 60% 100%, 40% 98%, 20% 100%, 0% 90%, 3% 70%, 0% 50%, 2% 30%, 0% 15%)" // Medium torn
      : "none"
  );
  const secondaryBurntClipPath1 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(0% 5%, 15% 2%, 35% 0%, 55% 3%, 75% 0%, 95% 6%, 100% 25%, 90% 45%, 93% 65%, 85% 85%, 70% 95%, 50% 100%, 30% 98%, 12% 92%, 0% 80%, 4% 60%, 0% 40%, 3% 20%, 0% 8%)" // More torn
      : "none"
  );
  const secondaryBurntClipPath2 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(3% 0%, 12% 4%, 30% 0%, 50% 3%, 70% 0%, 88% 4%, 100% 15%, 88% 35%, 90% 55%, 82% 75%, 65% 88%, 45% 95%, 25% 98%, 8% 90%, 0% 75%, 5% 55%, 0% 35%, 4% 18%, 0% 6%)" // Very torn
      : "none"
  );
  const secondaryBurntClipPath3 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "polygon(2% 2%, 25% 0%, 45% 2%, 65% 0%, 85% 3%, 100% 10%, 96% 30%, 99% 50%, 94% 70%, 85% 88%, 65% 96%, 45% 100%, 25% 97%, 8% 88%, 0% 72%, 3% 52%, 0% 32%, 4% 15%, 0% 5%)" // Medium torn
      : "none"
  );

  const burntClipPaths: MotionValue<string>[] = [
    burntClipPath0 as MotionValue<string>,
    burntClipPath1 as MotionValue<string>,
    burntClipPath2 as MotionValue<string>,
    burntClipPath3 as MotionValue<string>,
  ];
  const secondaryBurntClipPaths: MotionValue<string>[] = [
    secondaryBurntClipPath0 as MotionValue<string>,
    secondaryBurntClipPath1 as MotionValue<string>,
    secondaryBurntClipPath2 as MotionValue<string>,
    secondaryBurntClipPath3 as MotionValue<string>,
  ];
  const burntFilters: MotionValue<string>[] = [
    burntFilter0 as MotionValue<string>,
    burntFilter1 as MotionValue<string>,
    burntFilter2 as MotionValue<string>,
    burntFilter3 as MotionValue<string>,
  ];
  const secondaryBurntFilters: MotionValue<string>[] = [
    secondaryBurntFilter0 as MotionValue<string>,
    secondaryBurntFilter1 as MotionValue<string>,
    secondaryBurntFilter2 as MotionValue<string>,
    secondaryBurntFilter3 as MotionValue<string>,
  ];
  // Varied burnt filters for side images
  const sideBurntFilter0 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(1.5) brightness(0.7) sepia(0.3) hue-rotate(10deg) saturate(0.8)"
      : "none"
  );
  const sideBurntFilter1 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(1.8) brightness(0.5) sepia(0.5) hue-rotate(15deg) saturate(0.6)"
      : "none"
  );
  const sideBurntFilter2 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(1.6) brightness(0.6) sepia(0.4) hue-rotate(12deg) saturate(0.7)"
      : "none"
  );
  const sideBurntFilter3 = useTransform(smoothMediaProgress, (progress) =>
    (progress > 0.7 || hasExplodedRef.current)
      ? "contrast(2.0) brightness(0.4) sepia(0.6) hue-rotate(20deg) saturate(0.5)"
      : "none"
  );
  const sideBurntFilters: MotionValue<string>[] = [
    sideBurntFilter0 as MotionValue<string>,
    sideBurntFilter1 as MotionValue<string>,
    sideBurntFilter2 as MotionValue<string>,
    sideBurntFilter3 as MotionValue<string>,
  ];
  const sideBurntClipPaths: MotionValue<string>[] = [
    sideBurntClipPath0 as MotionValue<string>,
    sideBurntClipPath1 as MotionValue<string>,
    sideBurntClipPath2 as MotionValue<string>,
    sideBurntClipPath3 as MotionValue<string>,
  ];

  useEffect(() => {
    imageTransformsRef.current = {
      primary: primaryImageTransforms,
      secondary: secondaryImageTransforms,
    };
  }, [primaryImageTransforms, secondaryImageTransforms]);

  useEffect(() => {
    sideImageTransformsRef.current = sideImageTransforms;
  }, [sideImageTransforms]);

  const renderPortfolioCard = (
    src: string,
    index: number,
    inView: boolean,
    keyPrefix: string,
    transformsArray: ImageTransformConfig[],
    debrisSnapshot: DebrisSnapshot[] | null,
    burntFilter: MotionValue<string>,
    clipPath: MotionValue<string>
  ) => {
    const transforms = transformsArray[index];

    if (!transforms) {
      return null;
    }

    return (
      <motion.div
        key={`${keyPrefix}-${src}`}
        style={
          mounted
            ? {
                x: (mounted && hasExploded && debrisSnapshot)
                  ? debrisSnapshot[index]?.x ?? transforms.x
                  : transforms.x,
                y: (mounted && hasExploded && debrisSnapshot)
                  ? debrisSnapshot[index]?.y ?? transforms.y
                  : transforms.y,
                rotate: (mounted && hasExploded && debrisSnapshot)
                  ? debrisSnapshot[index]?.rotate ?? transforms.rotate
                  : transforms.rotate,
                rotateX: (mounted && hasExploded && debrisSnapshot)
                  ? debrisSnapshot[index]?.rotateX ?? 0
                  : transforms.rotateXMotion ?? imageNo3DRotateX,
                rotateY: (mounted && hasExploded && debrisSnapshot)
                  ? debrisSnapshot[index]?.rotateY ?? 0
                  : transforms.rotateYMotion ?? imageNo3DRotateY,
                z: (mounted && hasExploded && debrisSnapshot)
                  ? debrisSnapshot[index]?.z ?? 0
                  : transforms.zMotion ?? imageNo3DZ,
                opacity: (mounted && hasExploded && debrisSnapshot)
                  ? debrisSnapshot[index]?.opacity ?? transforms.opacity
                  : transforms.opacity,
                scale: (mounted && hasExploded && debrisSnapshot)
                  ? debrisSnapshot[index]?.scale ?? transforms.scale
                  : transforms.scale,
                skewX: (mounted && hasExploded && debrisSnapshot)
                  ? debrisSnapshot[index]?.skewX ?? (transforms.skewX || 0)
                  : transforms.skewX || 0,
                skewY: (mounted && hasExploded && debrisSnapshot)
                  ? debrisSnapshot[index]?.skewY ?? (transforms.skewY || 0)
                  : transforms.skewY || 0,
                willChange: "transform, opacity, filter",
                transformStyle: "preserve-3d",
                perspective: 2000,
                transformOrigin: "center center",
                maxWidth: "100%",
                zIndex: imageZIndexExplosion,
                pointerEvents: imagePointerEventsExplosion,
                filter: burntFilter,
                clipPath: clipPath,
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
          inView
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

        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute inset-0 border-2 border-accent opacity-0 group-hover:opacity-50"
          initial={{ scale: 0.9 }}
          whileHover={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </motion.div>
    );
  };

  // Additional transforms for video effects
  const smokeLayerOpacity = useTransform(videoRedTint, [0, 1], [0, 0.5]);
  // White fade that fades to white during explosion then back to transparent
  const whiteFadeOverlayOpacity = useTransform(
    smoothMediaProgress,
    [0.6, 0.7, 0.8, 0.9, 0.95, 1],
    [0, 0.2, 0.5, 0.9, 0.7, 0] // Reaches near-white then fades back
  );

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-48 bg-black text-white overflow-hidden"
      style={{
        position: "relative",
        scrollSnapAlign: "start" as const,
        minHeight: "350vh",
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
          suppressHydrationWarning
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
            {portfolioImages.map((src, index) =>
              renderPortfolioCard(
                src,
                index,
                imagesInView,
                "primary",
                primaryImageTransforms,
                primaryDebrisPositions,
                burntFilters[index],
                burntClipPaths[index]
              )
            )}
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
              // CRITICAL FIX: Don't open modal if Pacman overlay is active (mobile fix)
              if (pacmanOverlayActiveRef.current) return;
              
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
              // CRITICAL FIX: Don't open modal if Pacman overlay is active (mobile fix)
              if (pacmanOverlayActiveRef.current) return;
              
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

          {!hasExploded && (
            <>
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
            </>
          )}

          {/* ============================================ */}
          {/* VIDEO CONTAINER - Main video element */}
          {/* ============================================ */}
          {mounted ? (
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
              <div className="flex items-center gap-4">
                {/* Left side images */}
                <div className="flex flex-col gap-4">
                  {sideImages.slice(0, 2).map((src, index) => {
                    const transforms = sideImageTransforms[index];
                    const sideSnapshot = sideDebrisPositions;
                    return (
                      <motion.div
                        key={src}
                        style={
                          mounted
                            ? {
                                x: (mounted && hasExploded && sideSnapshot)
                                  ? sideSnapshot[index]?.x ?? transforms.x
                                  : transforms.x,
                                y: (mounted && hasExploded && sideSnapshot)
                                  ? sideSnapshot[index]?.y ?? transforms.y
                                  : transforms.y,
                                rotate: (mounted && hasExploded && sideSnapshot)
                                  ? sideSnapshot[index]?.rotate ?? transforms.rotate
                                  : transforms.rotate,
                                opacity: (mounted && hasExploded && sideSnapshot)
                                  ? sideSnapshot[index]?.opacity ?? transforms.opacity
                                  : transforms.opacity,
                                scale: (mounted && hasExploded && sideSnapshot)
                                  ? sideSnapshot[index]?.scale ?? transforms.scale
                                  : transforms.scale,
                                skewX: (mounted && hasExploded && sideSnapshot)
                                  ? sideSnapshot[index]?.skewX ?? (transforms.skewX || 0)
                                  : (transforms.skewX || 0),
                                skewY: (mounted && hasExploded && sideSnapshot)
                                  ? sideSnapshot[index]?.skewY ?? (transforms.skewY || 0)
                                  : (transforms.skewY || 0),
                                willChange: "transform, opacity, filter",
                                transformOrigin: "center center",
                                maxWidth: "150px",
                                width: "100%",
                                // Apply burnt effect after explosion
                                filter: sideBurntFilters[index],
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
                <div className="flex flex-col gap-4">
                    {sideImages.slice(2, 4).map((src, localIndex) => {
                      const index = localIndex + 2; // Map to transforms array index (2 or 3)
                      const transforms = sideImageTransforms[index];
                      const sideSnapshot = sideDebrisPositions;
                      return (
                        <motion.div
                          key={src}
                          style={
                            mounted
                              ? {
                                  x: (mounted && hasExploded && sideSnapshot)
                                    ? sideSnapshot[index]?.x ?? transforms.x
                                    : transforms.x,
                                  y: (mounted && hasExploded && sideSnapshot)
                                    ? sideSnapshot[index]?.y ?? transforms.y
                                    : transforms.y,
                                  rotate: (mounted && hasExploded && sideSnapshot)
                                    ? sideSnapshot[index]?.rotate ?? transforms.rotate
                                    : transforms.rotate,
                                  opacity: (mounted && hasExploded && sideSnapshot)
                                    ? sideSnapshot[index]?.opacity ?? transforms.opacity
                                    : transforms.opacity,
                                  scale: (mounted && hasExploded && sideSnapshot)
                                    ? sideSnapshot[index]?.scale ?? transforms.scale
                                    : transforms.scale,
                                  skewX: (mounted && hasExploded && sideSnapshot)
                                    ? sideSnapshot[index]?.skewX ?? (transforms.skewX || 0)
                                    : (transforms.skewX || 0),
                                  skewY: (mounted && hasExploded && sideSnapshot)
                                    ? sideSnapshot[index]?.skewY ?? (transforms.skewY || 0)
                                    : (transforms.skewY || 0),
                                  willChange: "transform, opacity, filter",
                                  transformOrigin: "center center",
                                  maxWidth: "150px",
                                  width: "100%",
                                  // Apply burnt effect after explosion
                                  filter: sideBurntFilters[index],
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
                </div>
              </motion.div>
          ) : (
            <div
              style={{
                left: "50%",
                top: "50%",
                zIndex: 30,
                maxWidth: "min(100%, 80rem)",
                opacity: 0.3,
                transform: "translateX(-50%) translateY(calc(-50% + 200px)) scale(0.4)",
              }}
              className="absolute w-full overflow-visible"
            >
              {/* Empty placeholder on server */}
            </div>
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none w-full h-[260px] sm:h-[300px] md:h-[380px] lg:h-[440px]"
          />
          <motion.div
            ref={secondaryImagesContainerRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative max-w-full mt-8"
            style={
              mounted
                ? {
                    zIndex: imagesContainerZIndex,
                  }
                : { zIndex: 20 }
            }
            suppressHydrationWarning
          >
            {secondaryPortfolioImages.map((src, index) =>
              renderPortfolioCard(
                src,
                index,
                secondaryImagesInView,
                "secondary",
                secondaryImageTransforms,
                secondaryDebrisPositions,
                secondaryBurntFilters[index],
                secondaryBurntClipPaths[index]
              )
            )}
          </motion.div>
        </div>
      </div>

      {/* White fade overlay - fades in then OUT to reveal Matrix text */}
      {/* Shows white briefly then fades back to transparent */}
      {/* CRITICAL FIX: Force close when Pacman is about to show to prevent overlay conflicts on mobile */}
      {!hasExploded && !whiteOverlayForcedClosed && (
        <motion.div
          className="fixed inset-0 bg-white pointer-events-none z-[100]"
          style={{
            opacity: whiteFadeOverlayOpacity,
          }}
        />
      )}

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
    </section>
  );
}
