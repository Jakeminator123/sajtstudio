/**
 * Design Tokens för Sajtstudio.se
 * 
 * Detta är den centrala konfigurationen för alla designval i projektet.
 * Ändra här för att uppdatera färger, typsnitt, spacing etc genom hela sajten.
 */

export const designTokens = {
  // Färgpalett - Monokrom minimalism med accentfärg
  colors: {
    // Primära färger
    primary: {
      black: '#000000',
      white: '#FFFFFF',
    },
    
    // Accentfärger - Mer mättad blå
    accent: {
      DEFAULT: '#0066FF', // Blå - primär accentfärg (mer mättad)
      hover: '#0052CC',
      light: '#3385FF',
      dark: '#0047B3',
    },
    
    // Tredjefärg - Röd (används sparsamt)
    tertiary: {
      DEFAULT: '#FF0033', // Röd - sekundär accentfärg
      hover: '#CC0029',
      light: '#FF3366',
      dark: '#CC0029',
    },
    
    // Neutrala färger - Mjukare gråskala
    gray: {
      50: '#FAFAFA',
      100: '#F7F7F7',
      200: '#F0F0F0',
      300: '#E8E8E8',
      400: '#D0D0D0',
      500: '#A0A0A0',
      600: '#707070',
      700: '#505050',
      800: '#303030',
      900: '#181818',
    },
    
    // Bakgrundsfärger
    background: {
      light: '#FFFFFF',
      dark: '#000000',
      section: '#FAFAFA',
      overlay: 'rgba(0, 0, 0, 0.6)',
    },
    
    // Textfärger
    text: {
      primary: '#000000',
      secondary: '#505050',
      light: '#707070',
      inverse: '#FFFFFF',
      muted: '#A0A0A0',
    },
  },

  // Typografi
  typography: {
    // Typsnitt
    fonts: {
      sans: 'var(--font-sans)', // Inter från Google Fonts (set in layout.tsx)
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },
    
    // Fontstorlekar (responsiva med clamp) - Större och mer kraftfulla
    fontSize: {
      display: 'clamp(4rem, 10vw, 10rem)',     // Hero rubriker - större
      hero: 'clamp(2.5rem, 6vw, 5rem)',        // Stora rubriker - större
      h1: 'clamp(2.5rem, 5vw, 4.5rem)',        // H1
      h2: 'clamp(2rem, 4vw, 3.5rem)',          // H2
      h3: 'clamp(1.75rem, 3vw, 2.5rem)',       // H3
      h4: 'clamp(1.5rem, 2.5vw, 2rem)',        // H4
      body: 'clamp(1.125rem, 1.5vw, 1.25rem)', // Body text - något större
      small: 'clamp(0.875rem, 1vw, 1rem)',     // Small text
      lead: 'clamp(1.25rem, 2vw, 1.5rem)',     // Lead text
    },
    
    // Fontvikter
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
    
    // Line heights - Tightare för mer impact
    lineHeight: {
      tight: 0.9,      // Mycket tight för rubriker
      snug: 1.1,       // Tight
      normal: 1.5,
      relaxed: 1.75,
    },
    
    // Letter spacing
    letterSpacing: {
      tight: '-0.03em',
      normal: '0',
      wide: '0.02em',
    },
  },

  // Spacing system (8px bas)
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    '2xl': '4rem',  // 64px
    '3xl': '6rem',  // 96px
    '4xl': '8rem',  // 128px
  },

  // Breakpoints (mobil-först)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animationer - Smoothare och mer premium
  animation: {
    duration: {
      instant: '0.1s',
      fast: '0.25s',
      normal: '0.4s',
      slow: '0.8s',
      slower: '1.2s',
      slowest: '2s',
    },
    easing: {
      default: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Smoothare default
      easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
      easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bounce effect
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)', // Extra smooth
    },
    // Framer Motion easing (arrays for Framer Motion, strings above for CSS)
    framerEasing: {
      default: [0.25, 0.1, 0.25, 1] as const,
      easeIn: [0.42, 0, 1, 1] as const,
      easeOut: [0, 0, 0.58, 1] as const,
      easeInOut: [0.42, 0, 0.58, 1] as const,
      spring: [0.34, 1.56, 0.64, 1] as const,
      smooth: [0.4, 0, 0.2, 1] as const,
    },
    // Framer Motion presets
    framerPresets: {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
      },
      slideUp: {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
      },
      slideIn: {
        initial: { opacity: 0, x: -30 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
      },
      scale: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
      },
    },
  },

  // Shadows - Subtila och eleganta
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    md: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
    lg: '0 12px 24px -4px rgba(0, 0, 0, 0.12)',
    xl: '0 24px 48px -8px rgba(0, 0, 0, 0.16)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(0, 102, 255, 0.3)', // Blå glow för accent
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
} as const;

// Export för användning i komponenter
export type DesignTokens = typeof designTokens;

