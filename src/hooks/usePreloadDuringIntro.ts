"use client";

import { useEffect, useRef } from "react";

/**
 * Preloads critical resources while intro video is playing
 * This hook should be called when intro video is visible
 * Optimizes loading by preloading videos, images, and components during the 8-second intro
 */
export function usePreloadDuringIntro(isIntroVisible: boolean) {
  const hasPreloadedRef = useRef(false);

  useEffect(() => {
    if (!isIntroVisible || typeof window === "undefined" || hasPreloadedRef.current) return;

    hasPreloadedRef.current = true;

    // Preload critical videos that will be needed soon
    const criticalVideos = [
      "/videos/telephone_ringin.mp4", // Used in HeroAnimation - CRITICAL
      "/videos/background.mp4",
      "/videos/background_vid.mp4",
    ];

    // Preload critical images
    const criticalImages = [
      // Portfolio images used in explosion - CRITICAL
      "/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp",
      "/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp",
      "/images/portfolio/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp",
      "/images/portfolio/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp",
      // Background images
      "/images/hero/hero-background.webp",
      "/images/backgrounds/section-background.webp",
      "/images/animations/hero-animation.gif",
    ];

    // Preload videos with higher priority
    criticalVideos.forEach((src, index) => {
      setTimeout(() => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "video";
        link.href = src;
        link.crossOrigin = "anonymous";
        // Add fetchpriority for critical videos
        if (index === 0) {
          link.setAttribute("fetchpriority", "high");
        }
        document.head.appendChild(link);
      }, index * 100); // Stagger video preloads
    });

    // Preload images
    criticalImages.forEach((src, index) => {
      setTimeout(() => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        // High priority for first 4 portfolio images (used in explosion)
        if (index < 4) {
          link.setAttribute("fetchpriority", "high");
        }
        document.head.appendChild(link);
      }, index * 50); // Stagger image preloads
    });

    // Prefetch dynamic components that will be needed
    // These are loaded in the background without blocking
    const componentPrefetches = [
      () => import("@/components/sections/ProcessSection"),
      () => import("@/components/sections/TestimonialsSection"),
      () => import("@/components/sections/BigCTA"),
      // Preload PacmanGame component early since it's critical
      () => import("@/components/games/PacmanGame"),
    ];

    // Prefetch components with a delay to not overwhelm the network
    componentPrefetches.forEach((importFunc, index) => {
      setTimeout(() => {
        importFunc().catch(() => {
          // Silently fail - component will load when needed
        });
      }, 500 + index * 300); // Start after initial resources, stagger prefetches
    });

    // Warm up video elements by creating hidden video elements
    // This helps the browser prepare for video playback
    if (typeof HTMLVideoElement !== "undefined") {
      setTimeout(() => {
        const warmupVideo = document.createElement("video");
        warmupVideo.preload = "auto";
        warmupVideo.muted = true;
        warmupVideo.style.display = "none";
        warmupVideo.src = "/videos/telephone_ringin.mp4";
        document.body.appendChild(warmupVideo);

        // Remove after a short time to free memory
        setTimeout(() => {
          if (warmupVideo.parentNode) {
            warmupVideo.parentNode.removeChild(warmupVideo);
          }
        }, 3000);
      }, 1000);
    }

    // Ensure fonts are loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        // Fonts are ready - trigger any font-dependent optimizations
      });
    }

    // Preconnect to external domains that will be needed
    const externalDomains = [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ];

    externalDomains.forEach((domain) => {
      // Check if preconnect already exists
      const existing = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
      if (!existing) {
        const link = document.createElement("link");
        link.rel = "preconnect";
        link.href = domain;
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      }
    });

    // Preload critical CSS chunks that will be needed
    // Next.js generates CSS chunks, we can't predict exact names, but we can ensure
    // that the browser is ready to load them when needed

    // Trigger a small amount of work to warm up the browser's rendering engine
    // This helps with initial paint performance
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => {
        // Warm up: create and immediately remove a small element
        // This helps the browser prepare for DOM operations
        const warmup = document.createElement("div");
        warmup.style.display = "none";
        document.body.appendChild(warmup);
        setTimeout(() => {
          if (warmup.parentNode) {
            warmup.parentNode.removeChild(warmup);
          }
        }, 100);
      }, { timeout: 2000 });
    }
  }, [isIntroVisible]);
}

