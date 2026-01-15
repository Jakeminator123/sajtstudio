# Sajtstudio.se - Struktur och Dokumentation

## Översikt

Sajtstudio.se är en modern företagswebbplats byggd med Next.js 16, React 19, TypeScript, Tailwind CSS och Framer Motion. Sajten följer en monokrom minimalistisk design med accentfärger och stora typografiska element.

## Projektstruktur

```
sajtstudio/
├── src/
│   ├── app/                    # Next.js App Router sidor
│   │   ├── page.tsx           # Startsida (Home)
│   │   ├── contact/           # Kontaktsida
│   │   ├── portfolio/         # Portfoliosida
│   │   ├── layout.tsx         # Root layout med metadata
│   │   └── api/               # API routes
│   ├── components/            # React-komponenter
│   │   ├── layout/            # Layout-komponenter (HeaderNav, Footer, PageTransition, SkipLink)
│   │   ├── sections/          # Sektion-komponenter (HeroSection, AboutSection, etc.)
│   │   ├── ui/                # UI-komponenter (Button, Modal, ContactForm, etc.)
│   │   ├── animations/        # Animation-komponenter (WordReveal, ScrollIndicator, etc.)
│   │   └── shared/            # Delade utilities (ImageOptimizer, OptimizedVideo, etc.)
│   ├── config/                # Konfiguration
│   │   ├── designTokens.ts    # Design tokens (färger, typsnitt, spacing)
│   │   ├── siteConfig.ts      # Site metadata och konfiguration
│   │   └── content/           # Textinnehåll (separerat från komponenter)
│   ├── data/                  # Data-filer (services, projects, caseStudies)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility-funktioner
│   └── templates/             # Mallar för sidor och sektioner
├── public/                    # Statiska filer
│   ├── images/               # Bilder organiserade i kategorier
│   ├── videos/               # Videofiler
│   └── logos/                # Logotyper
└── INPUT_DOC_FOR_CURSOR/     # Temporär mapp för filer som ska processas
```

## Komponent-hierarki

### Layout-komponenter

#### HeaderNav (`src/components/layout/HeaderNav.tsx`)

- **Ansvar**: Navigation, logo, CTA-knapp, mobilmeny
- **Funktionalitet**:
  - Fast positionerad header som ändrar stil vid scroll
  - Desktop navigation med hover-effekter och shimmer-animationer
  - Mobilmeny med slide-in animation
  - CTA-knapp "Starta projekt" (använder Button-komponenten med `variant="cta"`)
  - Hash-baserad navigation för ankarlänkar på startsidan
- **Animationer**: Scroll-baserad bakgrundsförändring, shimmer-effekter på länkar, glow-effekt på CTA-knapp
- **Struktur**:
  - **Desktop**: Logo (vänster) → Navigation links (mitten) → CTA Button (höger) → Mobile menu button (höger, endast på mobil)
  - **Mobile**: Logo (vänster) → Mobile menu button (höger). CTA-knapp finns i mobilmenyn
  - **CTA-knapp**: Använder Button-komponenten med `variant="cta"` och `size="sm"` för desktop, `size="md"` och `fullWidth` för mobilmeny
  - **Navigation-logik**: På startsidan (`/`) visas ankarlänkar (#tjanster, #process, #omdomen), på andra sidor visas standard navigation links från `siteConfig.nav.links`

#### Footer (`src/components/layout/Footer.tsx`)

- **Ansvar**: Footer med länkar och kontaktinformation
- **Placering**: Längst ner på alla sidor

#### MobileMenu (`src/components/layout/MobileMenu.tsx`)

- **Ansvar**: Mobilmeny som visas på mobil-enheter
- **Funktionalitet**: Slide-in meny med navigation links och CTA-knapp
- **Användning**: Används av HeaderNav för mobil navigation
- **Styling**: Full-width slide-in från höger, backdrop blur, animerade länkar

### Sektion-komponenter

#### HeroSection (`src/components/sections/HeroSection.tsx`)

- **Ansvar**: Hero-sektion på startsidan med tagline och CTA-knappar
- **Funktionalitet**: Textanimationer, regn/åsk-effekter, magnetisk knapp-effekt
- **CTA-knappar**: Använder MagneticButton-komponent med custom styling

#### AboutSection (`src/components/sections/AboutSection.tsx`)

- **Ansvar**: "Om oss"-sektion med word reveal-animationer

#### USPSection (`src/components/sections/USPSection.tsx`)

- **Ansvar**: Unique Selling Points med numrerade features
- **CTA-knapp**: Custom styling med shimmer-effekt på hover

#### ServicesSection (`src/components/ServicesSection.tsx`)

- **Ansvar**: Visar tjänster med modaler för detaljer
- **Funktionalitet**: ServiceCard-komponenter som öppnar ServiceModal

#### HeroAnimation (`src/components/HeroAnimation.tsx`)

- **Ansvar**: Portfolio-animation med video-explosion
- **Funktionalitet**: Video-baserad animation när användaren scrollar

#### TechShowcaseSection (`src/components/TechShowcaseSection.tsx`)

- **Ansvar**: Interaktiv Pacman-demo som visar tech vs design
- **Funktionalitet**: Spelbar Pacman-implementation

#### OpticScrollShowcase (`src/components/OpticScrollShowcase.tsx`)

- **Ansvar**: Scroll-illusioner inspirerade av Fantasy
- **Funktionalitet**: Client-only komponent med scroll-baserade effekter

#### ProcessSection (`src/components/ProcessSection.tsx`)

- **Ansvar**: Visar process-steg för hur projekt går till
- **Data**: Hämtar från `src/config/content/process.ts`

#### TestimonialsSection (`src/components/TestimonialsSection.tsx`)

- **Ansvar**: Visar kundomdömen
- **Data**: Hämtar från `src/config/content/testimonials.ts`

#### BigCTA (`src/components/BigCTA.tsx`)

- **Ansvar**: Stor CTA-sektion före footer
- **Funktionalitet**: Animerad bakgrund med partiklar, custom knapp med arrow-icon

#### PortfolioHero (`src/components/sections/portfolio/PortfolioHero.tsx`)

- **Ansvar**: Hero-sektion på Portfoliosidan
- **Funktionalitet**: Framer Motion-animationer, WordReveal-rubrik och optimerad video
- **Användning**: Renderas i `src/app/portfolio/page.tsx`

### UI-komponenter

#### Button (`src/components/Button.tsx`)

- **Ansvar**: Återanvändbar knapp-komponent med standardiserade varianter
- **Variants**:
  - `primary`: Svart bakgrund, vit text, hover till accent
  - `secondary`: Accent bakgrund, vit text
  - `outline`: Border, hover fyller bakgrund
  - `cta`: Gradient (accent till tertiary), shimmer-effekt, glow-effekt, rounded-full
- **Sizes**: `sm`, `md`, `lg`
- **Funktionalitet**: Stödjer både länkar (`href`) och knappar (`onClick`), loading state, disabled state

#### Modal (`src/components/Modal.tsx`)

- **Ansvar**: Modal-dialog för olika innehållstyper
- **Användning**: ServiceModal, CaseStudyModal använder denna

#### ContactForm (`src/components/ContactForm.tsx`)

- **Ansvar**: Kontaktformulär på kontaktsidan
- **API**: Skickar till `/api/contact`

### Animation-komponenter

#### WordReveal (`src/components/WordReveal.tsx`)

- **Ansvar**: Reveal-animation för ord/texter

#### AnimatedHeading (`src/components/AnimatedHeading.tsx`)

- **Ansvar**: Animerade rubriker med olika effekter

#### ScrollIndicator (`src/components/ScrollIndicator.tsx`)

- **Ansvar**: Scroll-indikator som försvinner vid scroll

## Routing-struktur

### Sidor

#### `/` (Startsida)

- **Fil**: `src/app/page.tsx`
- **Komponenter**: HeaderNav, HeroSection, AboutSection, USPSection, ServicesSection, HeroAnimation, TechShowcaseSection, OpticScrollShowcase, ProcessSection, TestimonialsSection, BigCTA, Footer
- **Lazy loading**: ProcessSection, TestimonialsSection, BigCTA, OpticScrollShowcase laddas dynamiskt
- **Prefetching**: Använder `usePrefetch` och `usePrefetchOnScroll` för optimerad prestanda

#### `/contact` (Kontakt)

- **Fil**: `src/app/contact/page.tsx`
- **Komponenter**: ContactForm

#### `/portfolio` (Portfolio)

- **Fil**: `src/app/portfolio/page.tsx`
- **Komponenter**: PortfolioHero, HeaderNav, Footer

### API Routes

#### `/api/health`

- **Ansvar**: Health check för deployment

#### `/api/contact`

- **Ansvar**: Hanterar kontaktformulär-submissions

#### `/api/analyze-website`

- **Ansvar**: Website analyzer funktionalitet

## Design System

### Design Tokens (`src/config/designTokens.ts`)

#### Färger

- **Primary**: Svart (`#000000`) och Vit (`#FFFFFF`)
- **Accent**: Blå (`#0066FF`) - primär accentfärg
- **Tertiary**: Röd (`#FF0033`) - sekundär accentfärg
- **Gray scale**: 50-900 för neutrala färger

#### Typografi

- **Font**: Inter från Google Fonts
- **Font sizes**: Responsiva med `clamp()` (display, hero, h1-h4, body, small, lead)
- **Font weights**: 300-900
- **Line heights**: tight (0.9) till relaxed (1.75)

#### Spacing

- **Bas**: 8px
- **Skalor**: xs (8px), sm (16px), md (24px), lg (32px), xl (48px), 2xl (64px), 3xl (96px), 4xl (128px)

#### Animationer

- **Duration**: instant (0.1s) till slowest (2s)
- **Easing**: Default, easeIn, easeOut, easeInOut, spring, smooth
- **Framer Motion presets**: fadeIn, slideUp, slideIn, scale

### Site Config (`src/config/siteConfig.ts`)

- **Metadata**: Site name, tagline, description
- **Kontakt**: Email, telefon, location
- **SEO**: Default title, description, siteUrl, ogImage
- **Navigation**: Links för olika sidor, homeAnchors för startsidan

## Template-system

### PageTemplate (`src/templates/PageTemplate.tsx`)

- **Användning**: Grundmall för alla sidor
- **Funktionalitet**: Wrapper med HeaderNav och Footer, konsistent padding

### SectionTemplate (`src/templates/SectionTemplate.tsx`)

- **Användning**: Mall för sektioner med konsistent padding och animationer

### ComponentTemplate (`src/templates/ComponentTemplate.tsx`)

- **Användning**: Mall för komponenter med konsistent struktur

## CTA-knappar (Call-to-Action)

### När och var CTA-knappar används

CTA-knappar används strategiskt placerade för att konvertera besökare till kunder:

1. **HeaderNav** - "Starta projekt" knapp
   - **Variant**: `cta` (Button-komponenten)
   - **Placering**: Höger i headern, synlig på alla sidor
   - **Styling**: Gradient (accent till tertiary), shimmer-effekt, glow-effekt, rounded-full

2. **HeroSection** - "Starta ditt projekt" knapp
   - **Komponent**: MagneticButton (custom implementation)
   - **Placering**: I hero-sektionen på startsidan
   - **Styling**: Accent bakgrund med magnetisk hover-effekt

3. **USPSection** - CTA efter USP-features
   - **Styling**: Custom implementation med shimmer på hover
   - **Placering**: Efter numrerade features

4. **BigCTA** - Stor CTA-sektion före footer
   - **Styling**: Custom implementation med arrow-icon och animerad bakgrund
   - **Placering**: Sista sektionen på startsidan

### Button-komponenten Variants

#### `primary`

- **Användning**: Standard knappar, sekundära actions
- **Styling**: Svart bakgrund, vit text, hover till accent
- **Exempel**: Formulär-knappar, sekundära actions

#### `secondary`

- **Användning**: Alternativa actions
- **Styling**: Accent bakgrund, vit text
- **Exempel**: Alternativa CTA:er

#### `outline`

- **Användning**: Mindre viktiga actions, alternativ styling
- **Styling**: Border, hover fyller bakgrund
- **Exempel**: Sekundära navigation-knappar

#### `cta` (Call-to-Action)

- **Användning**: Primära konverteringsknappar, viktiga actions
- **Styling**:
  - Gradient bakgrund (`from-accent to-tertiary`)
  - Shimmer-effekt (automatisk animation)
  - Glow-effekt (tertiary/50 blur-xl)
  - Rounded-full styling
  - Scale animation på hover/tap
- **Exempel**: HeaderNav CTA-knapp, primära konverteringspunkter
- **När att använda**: När du vill att användaren ska ta en specifik action (kontakta, starta projekt, etc.)

### Best Practices för CTA-knappar

1. **Tydlig text**: Använd aktiv, beskrivande text ("Starta projekt" istället för "Klicka här")
2. **Visuell framhävd**: CTA-varianten med gradient och glow gör knappen synlig
3. **Strategisk placering**: Placera CTA:er där användaren har fått tillräckligt med information
4. **Konsistens**: Använd Button-komponenten med `variant="cta"` för alla primära CTA:er
5. **Tillgänglighet**: Tydlig kontrast, beskrivande aria-labels, keyboard navigation

## Performance Optimering

### Lazy Loading

- Sektioner som visas senare laddas dynamiskt med `dynamic()` från Next.js
- OpticScrollShowcase är client-only (`ssr: false`)

### Prefetching

- `usePrefetch`: Prefetchar länkar vid hover
- `usePrefetchOnScroll`: Prefetchar komponenter när användaren scrollar nära dem

### Content Visibility

- `content-visibility-auto` på sektioner för bättre scroll-prestanda

## Data och Innehåll

### Separerat Innehåll

- **Textinnehåll**: `src/config/content/` (process.ts, testimonials.ts, usps.ts)
- **Data**: `src/data/` (services.ts, projects.ts, caseStudies.ts)

### Asset Management

- **Bilder**: `public/images/[kategori]/` (hero, portfolio, backgrounds, patterns, animations)
- **Videor**: `public/videos/`
- **Logos**: `public/logos/[kategori]/`

## Hooks

### Custom Hooks (`src/hooks/`)

- `useIntersectionObserver`: Observerar när element kommer i viewport
- `useModalManager`: Hanterar modal-state
- `usePrefetch`: Prefetchar länkar vid hover
- `usePrefetchOnScroll`: Prefetchar komponenter vid scroll
- `useScrollAnimation`: Scroll-baserade animationer
- `useTouchInteraction`: Touch-interaktioner
- `useVideoLoader`: Optimerad videoladdning

## Utility Functions (`src/lib/`)

- `animations.ts`: Animation helpers och presets
- `designUtils.ts`: Design-relaterade utilities
- `focusUtils.ts`: Focus management för tillgänglighet
- `performance.ts`: Performance optimeringar
- `responsiveUtils.ts`: Responsive design utilities och vanliga patterns
- `structuredData.ts`: Schema.org structured data
- `taskScheduler.ts`: Task scheduling utilities

## Mobil och Desktop Uppdelning

> **För AI-agenter:** Se `MOBILE_DESKTOP_INDEX.md` för en snabb guide över vad som är mobil vs desktop.

### Struktur och Organisering

Komponenterna är organiserade i kategorier för bättre överskådlighet:

- **`layout/`**: Layout-komponenter (HeaderNav, Footer, MobileMenu)
- **`sections/`**: Sektion-komponenter (HeroSection, ServicesSection, etc.)
- **`ui/`**: UI-komponenter (Button, Modal, ContactForm, etc.)
- **`animations/`**: Animation-komponenter (WordReveal, ScrollIndicator, etc.)
- **`shared/`**: Delade utilities (ImageOptimizer, OptimizedVideo, etc.)

### Strategier för Mobil vs Desktop

#### 1. Tailwind Breakpoints (Standard Approach)

För enkla layout-ändringar används Tailwind breakpoints direkt:

```tsx
{
  /* Desktop navigation - döljs på mobil */
}
;<nav className="hidden lg:flex items-center gap-8">{/* Navigation links */}</nav>

{
  /* Mobile menu button - visas endast på mobil */
}
;<button className="lg:hidden">{/* Hamburger menu */}</button>
```

**Breakpoints:**

- `sm: 640px` - Stor mobil
- `md: 768px` - Tablet
- `lg: 1024px` - Desktop (huvudbreakpoint för mobil/desktop separation)
- `xl: 1280px` - Stor desktop
- `2xl: 1536px` - Extra stor desktop

#### 2. Separerade Komponenter (När Logiken Blir Komplex)

När mobil och desktop har för olika logik separeras de i olika komponenter:

**Exempel: HeaderNav**

- `HeaderNav.tsx` - Huvudkomponent med desktop navigation och mobile menu button
- `MobileMenu.tsx` - Separerad komponent för mobilmeny

**När att separera:**

- När logiken är för olika mellan mobil/desktop
- När komponenten blir för stor (>200 rader)
- När det finns mycket conditional rendering

#### 3. Responsive Utilities (`src/lib/responsiveUtils.ts`)

För bättre läsbarhet kan du använda responsive utilities:

```tsx
import { responsive } from '@/lib/responsiveUtils'

{
  /* Tydligare än hidden lg:flex */
}
;<nav className={responsive.desktop.flex}>{/* Desktop navigation */}</nav>

{
  /* Tydligare än flex-col sm:flex-row */
}
;<div className={responsive.layout.columnToRow}>{/* Content */}</div>
```

### Dokumentation i Komponenter

Komponenter har tydliga kommentarer som markerar mobil vs desktop kod:

```tsx
{
  /* ============================================
   DESKTOP NAVIGATION
   ============================================
   Visible only on desktop (lg breakpoint and above)
   Contains navigation links with hover effects
*/
}
;<nav className="hidden lg:flex">{/* Desktop navigation */}</nav>

{
  /* ============================================
   MOBILE MENU BUTTON
   ============================================
   Visible only on mobile (hidden on lg and above)
   Opens/closes the mobile menu
*/
}
;<button className="lg:hidden">{/* Hamburger menu */}</button>
```

### Best Practices

1. **Mobile-First**: Börja med mobil-layout, lägg sedan till desktop-styling
2. **Använd Breakpoints**: För enkla ändringar, använd Tailwind breakpoints direkt
3. **Separera vid Komplexitet**: När logiken blir för olika, separera i olika komponenter
4. **Dokumentera**: Lägg alltid till kommentarer som markerar mobil vs desktop kod
5. **Använd Responsive Utils**: För vanliga patterns, använd `responsiveUtils.ts`
6. **Testa på Riktiga Enheter**: Testa alltid på faktiska mobiler och desktop-skärmar

## Deployment

### Render.com

- **Konfiguration**: `render.yaml`
- **Health check**: `/api/health`
- **Start command**: `npm start`

## Utvecklingsworkflow

### När du lägger till ny funktionalitet

1. **Använd Design Tokens**: Importera från `@/config/designTokens.ts`
2. **Använd Templates**: Använd PageTemplate, SectionTemplate eller ComponentTemplate
3. **Separera Innehåll**: Lägg textinnehåll i `src/config/content/`
4. **Path Aliases**: Använd `@/` för imports från `src/`
5. **Responsiv Design**: Bygg mobil-först med Tailwind breakpoints
6. **TypeScript**: Använd strikt typing för alla props och funktioner
7. **Komponenter**: Varje komponent i egen fil, 'use client' om hooks/animationer behövs

### INPUT_DOC_FOR_CURSOR Workflow

När filer läggs i `INPUT_DOC_FOR_CURSOR/`:

1. Läsa filen från `INPUT_DOC_FOR_CURSOR/`
2. Identifiera typ med `src/lib/inputDocProcessor.ts`
3. Flytta filen till rätt plats (se projektstruktur ovan)
4. Uppdatera referenser i relevanta komponenter
5. Använd `src/lib/assetManager.ts` för korrekta sökvägar
