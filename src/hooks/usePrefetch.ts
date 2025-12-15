import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook to prefetch links on hover for faster navigation
 */
export function usePrefetch(enabled: boolean = true) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    const getLinkFromEventTarget = (eventTarget: EventTarget | null): HTMLAnchorElement | null => {
      if (!eventTarget) return null;

      let node: Node | null = eventTarget as Node | null;

      while (node) {
        if (node instanceof HTMLAnchorElement && node.href) {
          return node;
        }

        // Handle shadow DOM hosts
        if (typeof ShadowRoot !== 'undefined' && node instanceof ShadowRoot) {
          node = node.host;
          continue;
        }

        if (node instanceof HTMLElement) {
          node = node.parentElement;
          continue;
        }

        node = node.parentNode;
      }

      return null;
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const link = getLinkFromEventTarget(e.target);

      if (link && link.href && link.href.startsWith(window.location.origin)) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#')) {
          const existingPrefetch = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
          if (!existingPrefetch) {
            const linkElement = document.createElement('link');
            linkElement.rel = 'prefetch';
            linkElement.href = href;
            document.head.appendChild(linkElement);
          }
        }
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter as EventListener, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter as EventListener, true);
    };
  }, [pathname, enabled]);
}
