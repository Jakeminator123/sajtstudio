'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Conditionally preload resources based on current route
 * Only preloads resources that are actually used on the current page
 */
export default function ConditionalPreloads() {
  const pathname = usePathname();

  useEffect(() => {
    // Only preload on client side
    if (typeof window === 'undefined') return;

    // Resources for homepage only
    const homepageResources = [
      { href: '/videos/background.mp4', as: 'video', type: 'video/mp4' },
      { href: '/images/hero/hero-background.webp', as: 'image', type: 'image/webp' },
      { href: '/videos/background_vid.mp4', as: 'video', type: 'video/mp4' },
      { href: '/videos/telephone_ringin.mp4', as: 'video', type: 'video/mp4' },
      { href: '/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp', as: 'image', type: 'image/webp' },
      { href: '/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp', as: 'image', type: 'image/webp' },
      { href: '/images/portfolio/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp', as: 'image', type: 'image/webp' },
      { href: '/images/portfolio/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp', as: 'image', type: 'image/webp' },
      { href: '/images/backgrounds/section-background.webp', as: 'image', type: 'image/webp' },
      { href: '/images/animations/hero-animation.gif', as: 'image', type: 'image/gif' },
    ];

    // Resources for starta-projekt page only
    const startaProjektResources = [
      { href: '/videos/noir_hero.mp4', as: 'video', type: 'video/mp4' },
    ];

    // Determine which resources to preload
    let resourcesToPreload: typeof homepageResources = [];
    
    if (pathname === '/') {
      resourcesToPreload = homepageResources;
    } else if (pathname === '/starta-projekt') {
      resourcesToPreload = startaProjektResources;
    }

    // Remove existing preload links for these resources to avoid duplicates
    resourcesToPreload.forEach(({ href }) => {
      const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
      if (existing) {
        existing.remove();
      }
    });

    // Add new preload links
    resourcesToPreload.forEach(({ href, as, type }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.setAttribute('as', as);
      if (type) {
        link.type = type;
      }
      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      resourcesToPreload.forEach(({ href }) => {
        const link = document.querySelector(`link[rel="preload"][href="${href}"]`);
        if (link) {
          link.remove();
        }
      });
    };
  }, [pathname]);

  return null;
}
