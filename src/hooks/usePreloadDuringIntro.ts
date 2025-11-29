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
      "/videos/matrix_code.mp4", // Used in TechShowcaseSection transition - CRITICAL
      "/videos/background.mp4", // Used in HeroSection
      "/videos/background_vid.mp4", // Used in ServicesSection
      "/videos/noir_hero.mp4", // Used in PortfolioHero
    ];

    // Preload critical images - prioritized by usage order
    const criticalImages = [
      // Portfolio images used in explosion - CRITICAL (appear early)
      "/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp",
      "/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp",
      "/images/portfolio/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp",
      "/images/portfolio/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp",
      // Background images (used in hero and sections)
      "/images/hero/hero-background.webp",
      "/images/backgrounds/section-background.webp",
      "/images/backgrounds/8-bit.webp",
      "/images/backgrounds/contact-gradient.webp",
      // Portfolio gallery images (appear in PortfolioGallery section)
      "/images/portfolio/portfolio_1.webp",
      "/images/portfolio/portfolio_2.webp",
      "/images/portfolio/portfolio_3.webp",
      "/images/portfolio/portfolio_5.webp",
      "/images/portfolio/portfolio_6.webp",
      // Portfolio showcase images
      "/images/portfolio/showcase_1.webp",
      "/images/portfolio/showcase_2.webp",
      // OpticScrollShowcase images (used in parallax section)
      "/images/portfolio/assets_task_01k05sqa0wedsbvfk5c0773fz5_1752541456_img_0.webp",
      "/images/portfolio/assets_task_01k1c880wqft0s0bcr3p77v2me_1753831780_img_0.webp",
      "/images/portfolio/assets_task_01k80qdg0ze1rskjzfpj7r1za3_1760961264_img_0.webp",
      // Animations
      "/images/animations/hero-animation.gif",
      "/images/animations/sites-animation.gif",
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

    // Preload images with priority based on usage order
    criticalImages.forEach((src, index) => {
      setTimeout(() => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        // High priority for first 4 portfolio images (used in explosion - appear immediately)
        // High priority for next 6 images (backgrounds and hero images used early)
        if (index < 4) {
          link.setAttribute("fetchpriority", "high");
        } else if (index < 10) {
          link.setAttribute("fetchpriority", "high");
        }
        document.head.appendChild(link);
      }, index * 30); // Stagger image preloads (reduced delay for faster loading)
    });

    // Preload logo and favicon (used in header immediately)
    setTimeout(() => {
      const logoLink = document.createElement("link");
      logoLink.rel = "preload";
      logoLink.as = "image";
      logoLink.href = "/logo.svg";
      logoLink.setAttribute("fetchpriority", "high");
      document.head.appendChild(logoLink);

      const faviconLink = document.createElement("link");
      faviconLink.rel = "preload";
      faviconLink.as = "image";
      faviconLink.href = "/favicon.svg";
      document.head.appendChild(faviconLink);
    }, 50);

    // Prefetch dynamic components that will be needed
    // These are loaded in the background without blocking
    const componentPrefetches = [
      // Preload PacmanGame component early since it's critical (used in TechShowcaseSection)
      () => import("@/components/games/PacmanGame"),
      // Sections that appear early but are lazy loaded
      () => import("@/components/sections/OpticScrollShowcase"), // Appears mid-page
      () => import("@/components/sections/ProcessSection"),
      () => import("@/components/sections/TestimonialsSection"),
      () => import("@/components/sections/BigCTA"),
    ];

    // Prefetch components with a delay to not overwhelm the network
    // Start earlier for critical components, stagger others
    componentPrefetches.forEach((importFunc, index) => {
      setTimeout(() => {
        importFunc().catch(() => {
          // Silently fail - component will load when needed
        });
      }, 300 + index * 200); // Start earlier, reduced stagger for faster loading
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

