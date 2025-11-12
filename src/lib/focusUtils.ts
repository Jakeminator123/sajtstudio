// Focus management utilities for better accessibility

// Trap focus within a container (useful for modals)
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) {
    return () => {}; // Return empty cleanup function if no focusable elements
  }
  
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    const isTabPressed = e.key === 'Tab';

    if (!isTabPressed) return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement?.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement?.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  firstFocusableElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

// Focus visible class for better keyboard navigation
export function setupFocusVisible() {
  if (typeof window === 'undefined') return;

  const handleFirstTab = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  };

  window.addEventListener('keydown', handleFirstTab);
}

// Skip to content
export function skipToContent(contentId: string) {
  if (typeof document === 'undefined') return;
  
  const content = document.getElementById(contentId);
  if (content) {
    content.focus();
    content.scrollIntoView();
  }
}

// Announce to screen readers
export function announceToScreenReader(message: string) {
  if (typeof document === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    if (announcement.parentNode) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}
