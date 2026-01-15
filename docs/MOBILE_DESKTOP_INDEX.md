# Mobile vs Desktop Index - Sajtstudio.se

**Detta dokument är skapat för att hjälpa AI-agenter och utvecklare att snabbt hitta vad som är mobil vs desktop-anpassat.**

> **För AI-agenter i Cursor:** Detta dokument refereras i `.cursorrules` och bör läsas automatiskt när mobil/desktop-relaterade frågor uppstår. Cursor läser `.cursorrules` vid varje session, så dessa referenser gör dokumentationen tillgänglig.

## Hur detta dokument används

- **Automatiskt**: Cursor läser `.cursorrules` som refererar till detta dokument
- **Manuellt**: Sök efter "MOBILE_DESKTOP_INDEX" eller "mobil desktop" när du behöver hitta kod
- **Via länkar**: Andra dokument länkar hit när mobil/desktop-kod behövs

## Snabböversikt

### Mobil-specifika Komponenter

- `src/components/layout/MobileMenu.tsx` - Mobilmeny (slide-in från höger)

### Desktop-specifika Komponenter

- Inga helt separerade desktop-komponenter - desktop-kod finns i samma komponenter med `hidden lg:flex` etc.

### Hybrid-komponenter (Både Mobil och Desktop)

- `src/components/layout/HeaderNav.tsx` - Innehåller både desktop navigation och mobile menu button
- Alla sektion-komponenter (`src/components/sections/`) - Använder responsive breakpoints

## Detaljerad Lista

### Layout-komponenter (`src/components/layout/`)

#### HeaderNav.tsx

**Mobil:**

- Mobile menu button (hamburger) - `lg:hidden`
- MobileMenu-komponenten anropas när meny öppnas

**Desktop:**

- Desktop navigation links - `hidden lg:flex`
- Desktop CTA button - synlig på desktop

**Båda:**

- Logo - synlig på båda
- Header container - fungerar på båda

**Markering i kod:**

```tsx
{/* ============================================
   DESKTOP NAVIGATION
   ============================================ */}
<nav className="hidden lg:flex">

{/* ============================================
   MOBILE MENU BUTTON
   ============================================ */}
<button className="lg:hidden">
```

#### MobileMenu.tsx

**100% Mobil:**

- Slide-in meny från höger
- Används endast på mobil-enheter
- Innehåller navigation links och CTA button

**Markering:** Filnamnet och kommentarer markerar tydligt att detta är mobil-specifik

### Sektion-komponenter (`src/components/sections/`)

Alla sektion-komponenter använder responsive breakpoints för att anpassa sig:

**Vanliga patterns:**

- `flex-col sm:flex-row` - Stack vertikalt på mobil, horisontellt på desktop
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Grid som anpassar sig
- `text-center md:text-left` - Centrerad på mobil, vänsterjusterad på desktop
- `px-4 sm:px-6 lg:px-8` - Responsive padding

**Inga separerade mobil/desktop komponenter** - allt hanteras med Tailwind breakpoints.

### UI-komponenter (`src/components/ui/`)

#### Button.tsx

**Responsive sizes:**

- `sm`: `px-6 py-2.5 text-sm`
- `md`: `px-8 py-3.5 sm:px-10 sm:py-4 text-base sm:text-lg`
- `lg`: `px-10 py-4 sm:px-12 sm:py-5 text-lg sm:text-xl`

**CTA variant:** Fungerar på både mobil och desktop med gradient och shimmer-effekter.

## Responsive Patterns i Projektet

### Breakpoints

- `sm: 640px` - Stor mobil
- `md: 768px` - Tablet
- `lg: 1024px` - **Desktop (huvudbreakpoint för mobil/desktop separation)**
- `xl: 1280px` - Stor desktop
- `2xl: 1536px` - Extra stor desktop

### Vanliga Responsive Patterns

#### Visa/Dölj

```tsx
// Desktop only
className = 'hidden lg:flex'
className = 'hidden lg:block'

// Mobile only
className = 'lg:hidden'
className = 'block lg:hidden'
```

#### Layout

```tsx
// Column to row
className = 'flex-col sm:flex-row'

// Grid adaptation
className = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
```

#### Spacing

```tsx
// Responsive padding
className = 'px-4 sm:px-6 lg:px-8'

// Responsive gap
className = 'gap-4 sm:gap-6 lg:gap-8'
```

#### Typography

```tsx
// Responsive text size
className = 'text-2xl sm:text-3xl md:text-4xl'

// Or use clamp-based sizes
className = 'text-h1' // Automatically responsive
```

## Sökstrategier för AI-agenter

### För att hitta mobil-specifik kod:

1. Sök efter `lg:hidden` - element som visas endast på mobil
2. Sök efter `MobileMenu` - mobilmeny-komponenten
3. Sök efter kommentarer med "MOBILE" i stora bokstäver
4. Kolla filnamn som innehåller "Mobile"

### För att hitta desktop-specifik kod:

1. Sök efter `hidden lg:` - element som visas endast på desktop
2. Sök efter kommentarer med "DESKTOP" i stora bokstäver
3. Sök efter hover-effekter (desktop-specifikt)

### För att hitta responsive patterns:

1. Sök efter Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
2. Sök efter `responsive` från `responsiveUtils.ts`
3. Kolla `RESPONSIVE_DESIGN_GUIDE.md` för patterns

## Filstruktur Guide

```
src/components/
├── layout/
│   ├── HeaderNav.tsx      # Hybrid: Desktop nav + Mobile button
│   ├── MobileMenu.tsx     # 100% Mobile
│   └── Footer.tsx         # Responsive (anpassar sig automatiskt)
├── sections/              # Alla använder responsive breakpoints
├── ui/                    # Alla använder responsive breakpoints
├── animations/            # Responsive animations
└── shared/                # Utilities (inte direkt responsive)
```

## Best Practices för AI-agenter

1. **Läs kommentarer först** - Komponenter har tydliga kommentarer som markerar mobil/desktop
2. **Kolla filnamn** - `MobileMenu.tsx` är tydligt mobil-specifik
3. **Sök efter breakpoints** - `lg:` är huvudbreakpoint för desktop
4. **Använd responsiveUtils** - För vanliga patterns, kolla `src/lib/responsiveUtils.ts`
5. **Läs dokumentation** - `RESPONSIVE_DESIGN_GUIDE.md` och `SITE_STRUCTURE.md` har detaljer

## Vanliga Frågor

**Q: Var finns desktop navigation?**
A: I `HeaderNav.tsx`, markerad med kommentar "DESKTOP NAVIGATION" och `hidden lg:flex`

**Q: Var finns mobilmeny?**
A: `src/components/layout/MobileMenu.tsx` - separat komponent

**Q: Hur vet jag om en komponent är responsiv?**
A: Kolla efter Tailwind breakpoints (`sm:`, `md:`, `lg:`) eller användning av `responsiveUtils`

**Q: Vilka komponenter är endast för mobil?**
A: Endast `MobileMenu.tsx` - alla andra är responsiva eller hybrid

**Q: Vilka komponenter är endast för desktop?**
A: Inga - desktop-kod finns i samma komponenter med `hidden lg:` patterns
