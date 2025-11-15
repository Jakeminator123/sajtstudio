"use client";

import { useInView } from "framer-motion";
import { useRef, useEffect } from "react";

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  freezeOnceVisible?: boolean;
}

export function useScrollAnimation({
  threshold = 0.1,
  rootMargin = "-50px",
  once = true,
  freezeOnceVisible = true,
}: ScrollAnimationOptions = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    margin: rootMargin as any,
    amount: threshold,
  });

  // Freeze the animation state once visible to prevent re-renders
  const wasInView = useRef(false);

  useEffect(() => {
    if (isInView && !wasInView.current) {
      wasInView.current = true;
    }
  }, [isInView]);

  const shouldAnimate = freezeOnceVisible
    ? isInView || wasInView.current
    : isInView;

  return { ref, isInView: shouldAnimate };
}

// Performance monitoring hook
export function useAnimationPerformance() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    }

    // Monitor animation performance
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;

      // If FPS drops below 30, reduce animations
      if (frameCount > 60 && deltaTime > 33.33) {
        document.documentElement.classList.add("reduce-animations");
      }

      if (frameCount > 120) {
        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(checkPerformance);
    };

    animationFrameId = requestAnimationFrame(checkPerformance);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
}
