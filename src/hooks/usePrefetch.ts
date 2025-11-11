import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook to prefetch links on hover for faster navigation
 */
export function usePrefetch() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#')) {
          // Prefetch the page
          const linkElement = document.createElement('link');
          linkElement.rel = 'prefetch';
          linkElement.href = href;
          document.head.appendChild(linkElement);
        }
      }
    };

    // Add event listeners to all links
    const links = document.querySelectorAll('a[href]');
    links.forEach((link) => {
      link.addEventListener('mouseenter', handleMouseEnter as EventListener);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener('mouseenter', handleMouseEnter as EventListener);
      });
    };
  }, [pathname]);
}
