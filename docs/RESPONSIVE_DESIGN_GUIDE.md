# Responsiv Design Guide - Sajtstudio.se

> **För AI-agenter:** Se `MOBILE_DESKTOP_INDEX.md` för en snabb index över mobil vs desktop komponenter och patterns.

## Grundläggande Filosofi: Mobile-First

**Tänk mobil först, desktop sedan.** Detta betyder att du:
1. Börjar med mobil-layouten (minsta skärmen)
2. Lägger till desktop-styling med breakpoints (`sm:`, `md:`, `lg:`, etc.)
3. Använder `clamp()` för responsiva fontstorlekar (redan implementerat)

## Komponentstruktur

Komponenterna är organiserade i kategorier för bättre överskådlighet:

- **`src/components/layout/`**: Layout-komponenter (HeaderNav, Footer, MobileMenu)
- **`src/components/sections/`**: Sektion-komponenter (HeroSection, ServicesSection, etc.)
- **`src/components/ui/`**: UI-komponenter (Button, Modal, ContactForm, etc.)
- **`src/components/animations/`**: Animation-komponenter (WordReveal, ScrollIndicator, etc.)
- **`src/components/shared/`**: Delade utilities (ImageOptimizer, OptimizedVideo, etc.)

Detta gör det lättare att hitta vad som är mobil vs desktop - t.ex. `MobileMenu.tsx` är tydligt en mobil-komponent.

## Breakpoints (från designTokens.ts)

```typescript
sm: '640px'   // Liten mobil → Stor mobil
md: '768px'   // Tablet
lg: '1024px'  // Laptop → Desktop
xl: '1280px'  // Stor desktop
2xl: '1536px' // Extra stor desktop
```

**Tailwind använder dessa automatiskt** - du behöver inte definiera dem själv.

## Strategier för Mobil vs Desktop

### 1. Visa/Dölj Element

**När**: När samma element inte passar på båda skärmar.

**Exempel från HeaderNav:**
```tsx
{/* Desktop navigation - döljs på mobil */}
<nav className="hidden lg:flex items-center gap-8">
  {/* Navigation links */}
</nav>

{/* Mobile menu button - visas endast på mobil */}
<motion.button className="lg:hidden">
  {/* Hamburger menu */}
</motion.button>
```

**Regel**: 
- `hidden lg:flex` = Dölj på mobil, visa på desktop
- `lg:hidden` = Visa på mobil, dölj på desktop

### 2. Ändra Layout (Kolumn → Rad)

**När**: När innehåll behöver omorganiseras för bättre läsbarhet.

**Exempel från HeroSection:**
```tsx
{/* Stack vertikalt på mobil, horisontellt på desktop */}
<div className="flex flex-col sm:flex-row gap-4">
  <Button>Knapp 1</Button>
  <Button>Knapp 2</Button>
</div>
```

**Vanliga mönster:**
- `flex-col sm:flex-row` = Kolumn på mobil, rad på desktop
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` = 1 kolumn → 2 → 3

### 3. Ändra Storlek och Spacing

**När**: När samma layout fungerar men behöver olika storlekar.

**Exempel från Button-komponenten:**
```tsx
const sizeClasses = {
  sm: 'px-6 py-2.5 text-sm',
  md: 'px-8 py-3.5 sm:px-10 sm:py-4 text-base sm:text-lg',
  lg: 'px-10 py-4 sm:px-12 sm:py-5 text-lg sm:text-xl',
};
```

**Vanliga mönster:**
- `text-base sm:text-lg` = Mindre text på mobil
- `px-4 sm:px-6 md:px-8` = Mindre padding på mobil
- `py-8 sm:py-16 md:py-24` = Mindre vertikal spacing på mobil

### 4. Responsiva Fontstorlekar (clamp)

**Redan implementerat i designTokens.ts:**
```typescript
fontSize: {
  display: 'clamp(4rem, 10vw, 10rem)',     // Skalar automatiskt
  hero: 'clamp(2.5rem, 6vw, 5rem)',
  h1: 'clamp(2.5rem, 5vw, 4.5rem)',
  // etc...
}
```

**Användning:**
```tsx
<h1 className="text-h1">Rubrik</h1>
// Automatiskt responsiv utan breakpoints!
```

### 5. Olika Komponenter för Mobil/Desktop

**När**: När layouten är så olika att samma komponent inte fungerar.

**Exempel från HeaderNav:**
- Desktop: Navigation links i header
- Mobile: Hamburger menu som öppnar sidebar

**Implementering:**
```tsx
{/* Desktop version */}
<div className="hidden lg:block">
  <DesktopNavigation />
</div>

{/* Mobile version */}
<div className="lg:hidden">
  <MobileMenu />
</div>
```

## Praktiska Exempel

### Exempel 1: Grid som blir Kolumner på Mobil

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

**Resultat:**
- Mobil: 1 kolumn (stack vertikalt)
- Tablet: 2 kolumner
- Desktop: 3 kolumner

### Exempel 2: Text som Centreras på Mobil

```tsx
<div className="text-center md:text-left">
  <h2 className="text-2xl sm:text-3xl md:text-4xl">Rubrik</h2>
  <p className="text-sm sm:text-base md:text-lg">Beskrivning</p>
</div>
```

### Exempel 3: Container som Ändrar Maxbredd

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
  {/* Innehåll */}
</div>
```

**Förklaring:**
- `px-4` = 16px padding på mobil
- `sm:px-6` = 24px padding på tablet+
- `lg:px-8` = 32px padding på desktop
- `max-w-7xl` = Begränsar bredd på stora skärmar

### Exempel 4: Bild som Ändrar Storlek

```tsx
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  className="w-full h-auto object-cover"
  // Bilden skalar automatiskt med w-full
/>
```

## Touch vs Mouse Interaktioner

### Detektera Touch-enheter

**Redan implementerat i `useTouchDevice` hook:**
```tsx
import { useTouchDevice } from '@/hooks/useTouchInteraction';

function MyComponent() {
  const isTouchDevice = useTouchDevice();
  
  return (
    <div className={isTouchDevice ? 'touch-optimized' : 'hover-effects'}>
      {/* Anpassad baserat på enhet */}
    </div>
  );
}
```

### CSS Media Queries för Touch

**Redan implementerat i globals.css:**
```css
@media (hover: none) and (pointer: coarse) {
  /* Touch-enheter */
  button, a {
    min-height: 44px; /* Större tap targets */
  }
  
  *:hover {
    transform: none !important; /* Ta bort hover-effekter */
  }
}
```

## Best Practices

### 1. Testa på Riktiga Enheter
- Använd Chrome DevTools för mobil-emulering
- Testa på faktiska mobiler när möjligt
- Kontrollera touch-targets (minst 44x44px)

### 2. Använd Container och Max-width
```tsx
<div className="container mx-auto px-4 max-w-6xl">
  {/* Förhindrar att innehåll blir för brett på stora skärmar */}
</div>
```

### 3. Tänk på Performance
- Lazy load bilder och komponenter som inte syns direkt
- Använd `content-visibility-auto` för bättre scroll-prestanda
- Reducera animationer på mobil (redan implementerat med `prefers-reduced-motion`)

### 4. Konsistent Spacing
```tsx
{/* Använd spacing-systemet från designTokens */}
<div className="py-8 sm:py-16 md:py-24">
  {/* xs: 8px, sm: 16px, md: 24px, lg: 32px, etc. */}
</div>
```

### 5. Typografi
```tsx
{/* Använd clamp-baserade fontstorlekar */}
<h1 className="text-h1">Rubrik</h1>
<p className="text-body">Brödtext</p>

{/* ELLER använd Tailwind breakpoints */}
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
```

## Vanliga Misstag att Undvika

### ❌ Fel: Fixa Bredder
```tsx
<div className="w-400"> {/* Använd aldrig fixa pixlar */}
```

### ✅ Rätt: Responsiva Bredder
```tsx
<div className="w-full max-w-md mx-auto"> {/* Använd max-width */}
```

### ❌ Fel: Olika Komponenter för Samma Sak
```tsx
{/* Undvik att skapa helt separata komponenter om det bara är layout */}
<MobileCard /> {/* ❌ */}
<DesktopCard /> {/* ❌ */}
```

### ✅ Rätt: Samma Komponent med Responsiv Styling
```tsx
<Card className="flex-col sm:flex-row"> {/* ✅ */}
```

### ❌ Fel: Glömmer Touch-targets
```tsx
<button className="w-8 h-8"> {/* För liten för touch */}
```

### ✅ Rätt: Stora Touch-targets
```tsx
<button className="min-w-[44px] min-h-[44px]"> {/* ✅ */}
```

## Checklista för Ny Komponent

När du skapar en ny komponent, fråga dig:

1. ✅ Fungerar layouten på mobil? (testa med `flex-col`)
2. ✅ Är texten läsbar på mobil? (använd `clamp()` eller breakpoints)
3. ✅ Är knappar/länkar stora nog för touch? (minst 44x44px)
4. ✅ Behöver element visas/döljas på olika skärmar? (använd `hidden lg:flex`)
5. ✅ Är spacing konsistent? (använd spacing-systemet)
6. ✅ Testar du på olika skärmstorlekar? (mobil, tablet, desktop)

## Exempel: Komplett Responsiv Komponent

```tsx
'use client';

import { motion } from 'framer-motion';

export default function ResponsiveSection() {
  return (
    <section className="py-8 sm:py-16 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Rubrik - centrerad på mobil, vänsterjusterad på desktop */}
        <h2 className="text-h2 text-center md:text-left mb-8">
          Rubrik
        </h2>
        
        {/* Grid - 1 kolumn på mobil, 2 på tablet, 3 på desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {items.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
        
        {/* CTA - full bredd på mobil, inline på desktop */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="cta" fullWidth className="sm:w-auto">
            Call to Action
          </Button>
        </div>
      </div>
    </section>
  );
}
```

## Responsive Utilities

För bättre läsbarhet kan du använda `responsiveUtils.ts`:

```tsx
import { responsive } from '@/lib/responsiveUtils';

{/* Tydligare än hidden lg:flex */}
<nav className={responsive.desktop.flex}>
  {/* Desktop navigation */}
</nav>

{/* Tydligare än flex-col sm:flex-row */}
<div className={responsive.layout.columnToRow}>
  {/* Content */}
</div>
```

Se `src/lib/responsiveUtils.ts` för alla tillgängliga patterns.

## Dokumentation i Komponenter

Komponenter har tydliga kommentarer som markerar mobil vs desktop kod:

```tsx
{/* ============================================
   DESKTOP NAVIGATION
   ============================================
   Visible only on desktop (lg breakpoint and above)
*/}
<nav className="hidden lg:flex">
  {/* Desktop navigation */}
</nav>
```

Detta gör det lätt att se vad som är mobil vs desktop när du läser koden.

## Ytterligare Resurser

- **Tailwind Responsive Design**: https://tailwindcss.com/docs/responsive-design
- **Design Tokens**: `src/config/designTokens.ts`
- **Responsive Utils**: `src/lib/responsiveUtils.ts`
- **Exempel**: 
  - `src/components/layout/HeaderNav.tsx` - Desktop navigation + mobile menu
  - `src/components/layout/MobileMenu.tsx` - Separerad mobilmeny
  - `src/components/sections/HeroSection.tsx` - Responsive hero section
  - `src/components/ui/Button.tsx` - Responsive button sizes

