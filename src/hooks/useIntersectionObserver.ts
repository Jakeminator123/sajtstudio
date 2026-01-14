"use client";

import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  enabled?: boolean;
}

/**
 * Optimized IntersectionObserver hook for starting animations
 * only when elements are visible
 */
export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = "-50px",
  triggerOnce = true,
  enabled = true,
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Use requestAnimationFrame to avoid setState in effect warning
      requestAnimationFrame(() => {
        setIsIntersecting(true);
      });
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          setIsIntersecting(isIntersecting);

          if (isIntersecting && !hasIntersected) {
            setHasIntersected(true);
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
  }, [threshold, rootMargin, enabled, hasIntersected]);

  // Return true if should trigger (either currently intersecting or already intersected if triggerOnce)
  const shouldTrigger = triggerOnce ? hasIntersected || isIntersecting : isIntersecting;

  return {
    ref: elementRef,
    isIntersecting: shouldTrigger,
    hasIntersected,
  };
}
