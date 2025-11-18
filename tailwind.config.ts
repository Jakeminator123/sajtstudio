import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primära färger
        primary: {
          black: '#000000',
          white: '#FFFFFF',
        },
        // Accentfärg (blå) - Mer mättad
        accent: {
          DEFAULT: '#0066FF', // Blå - primär accentfärg (mer mättad)
          hover: '#0052CC',
          light: '#3385FF',
          dark: '#0047B3',
        },
        // Alias för accent-hover för att stödja hover:bg-accent-hover syntax
        'accent-hover': '#0052CC',
        // Tredjefärg (röd) - Används sparsamt
        tertiary: {
          DEFAULT: '#FF0033', // Röd - sekundär accentfärg
          hover: '#CC0029',
          light: '#FF3366',
          dark: '#CC0029',
        },
        // Neutrala färger
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        // Bakgrundsfärger
        background: {
          light: '#FFFFFF',
          dark: '#000000',
          section: '#FAFAFA',
        },
        // Textfärger
        text: {
          primary: '#000000',
          secondary: '#616161',
          light: '#9E9E9E',
          inverse: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        handwriting: ['var(--font-handwriting)', 'cursive'],
        pixel: ['var(--font-pixel)', 'monospace'],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      fontSize: {
        display: [
          'clamp(4rem, 10vw, 10rem)',
          { lineHeight: '0.9', fontWeight: '900' },
        ],
        hero: [
          'clamp(2.5rem, 6vw, 5rem)',
          { lineHeight: '0.9', fontWeight: '900' },
        ],
        h1: ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.1' }],
        h2: ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.1' }],
        h3: ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.1' }],
        h4: ['clamp(1.5rem, 2.5vw, 2rem)', { lineHeight: '1.5' }],
        body: ['clamp(1.125rem, 1.5vw, 1.25rem)', { lineHeight: '1.5' }],
        small: ['clamp(0.875rem, 1vw, 1rem)', { lineHeight: '1.5' }],
        lead: ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.5' }],
      },
      spacing: {
        xs: '0.5rem', // 8px
        sm: '1rem', // 16px
        md: '1.5rem', // 24px
        lg: '2rem', // 32px
        xl: '3rem', // 48px
        '2xl': '4rem', // 64px
        '3xl': '6rem', // 96px
        '4xl': '8rem', // 128px
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        md: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        lg: '0 12px 24px -4px rgba(0, 0, 0, 0.12)',
        xl: '0 24px 48px -8px rgba(0, 0, 0, 0.16)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        glow: '0 0 20px rgba(0, 102, 255, 0.3)',
      },
      transitionDuration: {
        fast: '0.2s',
        normal: '0.3s',
        slow: '0.6s',
        slower: '0.8s',
      },
      transitionTimingFunction: {
        default: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
        easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
