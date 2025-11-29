"use client";

import { useEffect, useRef } from "react";

/**
 * Generic hook to preload resources while any video is playing
 * Use this to optimize loading times by utilizing "dead time" when users watch videos
 * 
 * @param isVideoPlaying - Whether the video is currently playing
 * @param priority - Priority level for resource loading ('high' | 'medium' | 'low')
 * @param resources - Optional specific resources to preload
 */
export function usePreloadDuringVideo(
  isVideoPlaying: boolean,
  priority: 'high' | 'medium' | 'low' = 'medium',
  resources?: {
    images?: string[];
    videos?: string[];
    components?: Array<() => Promise<unknown>>;
  }
) {
  const hasPreloadedRef = useRef(false);

  useEffect(() => {
    if (!isVideoPlaying || typeof window === "undefined" || hasPreloadedRef.current) return;

    hasPreloadedRef.current = true;

    // Default resources based on priority
    const getDefaultResources = () => {
      if (priority === 'high') {
        return {
          images: [
            "/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp",
            "/images/hero/hero-background.webp",
            "/images/backgrounds/8-bit.webp",
          ],
          videos: [
            "/videos/telephone_ringin.mp4",
            "/videos/matrix_code.mp4",
          ],
        };
      } else if (priority === 'medium') {
        return {
          images: [
            "/images/portfolio/portfolio_1.webp",
            "/images/backgrounds/section-background.webp",
          ],
          videos: [
            "/videos/background_vid.mp4",
          ],
        };
      } else {
        return {
          images: [
            "/images/animations/sites-animation.gif",
          ],
          videos: [],
        };
      }
    };

    const defaults = getDefaultResources();
    const imagesToLoad = resources?.images || defaults.images || [];
    const videosToLoad = resources?.videos || defaults.videos || [];
    const componentsToLoad = resources?.components || [];

    // Preload images
    imagesToLoad.forEach((src, index) => {
      setTimeout(() => {
        const link = document.createElement("link");
        link.rel = "prefetch"; // Use prefetch for non-critical resources
        link.as = "image";
        link.href = src;
        document.head.appendChild(link);
      }, index * 50);
    });

    // Preload videos
    videosToLoad.forEach((src, index) => {
      setTimeout(() => {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "video";
        link.href = src;
        document.head.appendChild(link);
      }, index * 100);
    });

    // Preload components
    componentsToLoad.forEach((importFunc, index) => {
      setTimeout(() => {
        importFunc().catch(() => {
          // Silently fail - will load when needed
        });
      }, 200 + index * 150);
    });

    // Reset flag when video stops playing
    return () => {
      if (!isVideoPlaying) {
        hasPreloadedRef.current = false;
      }
    };
  }, [isVideoPlaying, priority, resources]);
}
