"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook to detect if an element is in viewport
 * Optimized for performance - only checks when needed
 */
export function useViewportVisibility(options: {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
} = {}) {
  const { threshold = 0, rootMargin = "0px", enabled = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          setIsVisible(visible);
          if (visible && !hasBeenVisible) {
            setHasBeenVisible(true);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, enabled, hasBeenVisible]);

  return {
    ref: elementRef,
    isVisible,
    hasBeenVisible,
  };
}
