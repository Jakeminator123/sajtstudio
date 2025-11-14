import { useEffect } from 'react';

/**
 * Hook to prefetch components and resources as user scrolls near them
 * This improves scroll responsiveness without blocking initial load
 */
export function usePrefetchOnScroll() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    // Sections to prefetch resources for when user gets close
    // Note: ServicesSection (#tjanster) is now loaded directly, so we prefetch resources earlier
    const prefetchTargets: Array<{
      selector: string;
      threshold?: number;
    }> = [
      {
        selector: '#process',
        threshold: 0.2, // Prefetch when 20% visible
      },
      {
        selector: '#omdomen',
        threshold: 0.2,
      },
      // Prefetch HeroAnimation resources when user scrolls past ServicesSection
      {
        selector: '#tjanster',
        threshold: 0.8, // When ServicesSection is mostly scrolled past, prefetch next section
      },
    ];

    const prefetched = new Set<string>();

    const prefetchComponent = (selector: string) => {
      if (prefetched.has(selector)) return;
      prefetched.add(selector);
      
      // Prefetch by triggering Next.js link prefetching
      // We'll prefetch resources instead of component chunks directly
      // The dynamic import will handle chunk loading when needed
    };

    const prefetchResources = (selector: string) => {
      // Prefetch images and videos that will be needed soon
      const element = document.querySelector(selector);
      if (!element) return;

      // Prefetch HeroAnimation resources when ServicesSection is scrolled past
      if (selector === '#tjanster') {
        // Prefetch telephone video for HeroAnimation (comes after ServicesSection)
        const videoLink = document.createElement('link');
        videoLink.rel = 'preload';
        videoLink.href = '/videos/telephone_ringin.mp4';
        videoLink.as = 'video';
        videoLink.setAttribute('type', 'video/mp4');
        if (!document.querySelector(`link[rel="preload"][href="/videos/telephone_ringin.mp4"]`)) {
          document.head.appendChild(videoLink);
        }
        
        // Prefetch portfolio images that will be needed soon
        const portfolioImages = [
          '/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp',
          '/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp',
        ];
        portfolioImages.forEach((src) => {
          if (!document.querySelector(`link[rel="preload"][href="${src}"]`)) {
            const imageLink = document.createElement('link');
            imageLink.rel = 'preload';
            imageLink.href = src;
            imageLink.as = 'image';
            imageLink.setAttribute('type', 'image/webp');
            document.head.appendChild(imageLink);
          }
        });
      }

      // Prefetch images for ProcessSection
      if (selector === '#process') {
        const images = [
          '/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp',
          '/images/animations/hero-animation.gif',
        ];
        images.forEach((src) => {
          if (!document.querySelector(`link[rel="preload"][href="${src}"]`)) {
            const imageLink = document.createElement('link');
            imageLink.rel = 'preload';
            imageLink.href = src;
            imageLink.as = 'image';
            if (src.endsWith('.webp')) {
              imageLink.setAttribute('type', 'image/webp');
            } else if (src.endsWith('.gif')) {
              imageLink.setAttribute('type', 'image/gif');
            }
            document.head.appendChild(imageLink);
          }
        });
      }

    };

    const observers: IntersectionObserver[] = [];

    prefetchTargets.forEach(({ selector, threshold = 0.1 }) => {
      const element = document.querySelector(selector);
      if (!element) return;

        const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
              // Prefetch resources when user gets close
              prefetchComponent(selector);
              prefetchResources(selector);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '300px', // Start prefetching 300px before element is visible
          threshold: threshold,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);
}
