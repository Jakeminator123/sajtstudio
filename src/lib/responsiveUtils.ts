/**
 * Responsive Utilities
 * 
 * Helper utilities for common responsive patterns to improve code readability
 * and maintainability. Use these instead of writing Tailwind classes directly
 * when you want to make it clear what the responsive behavior is.
 */

/**
 * Visibility utilities - Show/hide elements based on screen size
 */
export const responsive = {
  /**
   * Mobile-specific visibility
   * Use when you want to show something only on mobile devices
   */
  mobile: {
    show: 'block lg:hidden',
    hide: 'hidden lg:block',
    flex: 'flex lg:hidden',
    grid: 'grid lg:hidden',
    inline: 'inline lg:hidden',
    inlineBlock: 'inline-block lg:hidden',
  },

  /**
   * Desktop-specific visibility
   * Use when you want to show something only on desktop (lg breakpoint and above)
   */
  desktop: {
    show: 'hidden lg:block',
    hide: 'lg:hidden',
    flex: 'hidden lg:flex',
    grid: 'hidden lg:grid',
    inline: 'hidden lg:inline',
    inlineBlock: 'hidden lg:inline-block',
  },

  /**
   * Layout utilities - Common responsive layout patterns
   */
  layout: {
    /**
     * Stack vertically on mobile, horizontally on desktop
     * Use for button groups, navigation items, etc.
     */
    columnToRow: 'flex-col sm:flex-row',
    
    /**
     * Grid that adapts: 1 column → 2 columns → 3 columns
     * Use for card grids, service listings, etc.
     */
    grid1to3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    
    /**
     * Grid that adapts: 1 column → 2 columns
     * Use for two-column layouts
     */
    grid1to2: 'grid-cols-1 md:grid-cols-2',
    
    /**
     * Grid that adapts: 1 column → 2 columns → 4 columns
     * Use for feature grids, icon grids, etc.
     */
    grid1to4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    
    /**
     * Always column layout
     */
    column: 'flex-col',
    
    /**
     * Always row layout
     */
    row: 'flex-row',
  },

  /**
   * Spacing utilities - Responsive spacing patterns
   */
  spacing: {
    /**
     * Padding that increases with screen size
     * Mobile: 16px, Tablet: 24px, Desktop: 32px
     */
    padding: 'px-4 sm:px-6 lg:px-8',
    
    /**
     * Vertical padding that increases with screen size
     * Mobile: 32px, Tablet: 48px, Desktop: 96px
     */
    sectionPadding: 'py-8 sm:py-12 md:py-16 lg:py-24',
    
    /**
     * Gap that increases with screen size
     * Mobile: 16px, Tablet: 24px, Desktop: 32px
     */
    gap: 'gap-4 sm:gap-6 lg:gap-8',
  },

  /**
   * Typography utilities - Responsive text sizing
   */
  typography: {
    /**
     * Heading that scales: Mobile small → Desktop large
     */
    heading: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    
    /**
     * Subheading that scales
     */
    subheading: 'text-xl sm:text-2xl md:text-3xl',
    
    /**
     * Body text that scales slightly
     */
    body: 'text-base sm:text-lg',
    
    /**
     * Small text
     */
    small: 'text-sm sm:text-base',
  },

  /**
   * Container utilities - Responsive container patterns
   */
  container: {
    /**
     * Standard container with responsive padding
     */
    standard: 'container mx-auto px-4 sm:px-6 lg:px-8',
    
    /**
     * Narrow container for content-focused sections
     */
    narrow: 'container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl',
    
    /**
     * Wide container for full-width sections
     */
    wide: 'container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
    
    /**
     * Full width container
     */
    full: 'w-full px-4 sm:px-6 lg:px-8',
  },
} as const;

/**
 * Breakpoint values from designTokens
 * Use these when you need breakpoint values in JavaScript/TypeScript
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Helper function to check if current viewport is mobile
 * Note: This requires client-side rendering
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024; // lg breakpoint
}

/**
 * Helper function to check if current viewport is desktop
 * Note: This requires client-side rendering
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024; // lg breakpoint
}

/**
 * Get responsive class names as a string
 * Useful when you need to combine multiple responsive utilities
 * 
 * @example
 * getResponsiveClasses([responsive.mobile.flex, responsive.layout.columnToRow])
 * // Returns: "flex lg:hidden flex-col sm:flex-row"
 */
export function getResponsiveClasses(classes: string[]): string {
  return classes.join(' ');
}

