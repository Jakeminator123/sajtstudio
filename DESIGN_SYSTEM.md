/**
 * DESIGN_SYSTEM.md
 * 
 * Detta dokument beskriver designsystemet för Sajtstudio.se.
 * Alla designval är centraliserade i `src/config/designTokens.ts`.
 */

# Design System - Sajtstudio.se

## Färgpalett

### Primära färger
- **Svart**: `#000000` - Används för text och accent
- **Vit**: `#FFFFFF` - Används för bakgrunder

### Accentfärg
- **Blå**: `#0000FF` - Primär accentfärg
- **Blå (hover)**: `#0000CC` - Mörkare variant för hover-states
- **Blå (light)**: `#3333FF` - Ljusare variant

**Ändra accentfärg**: Redigera `accent.DEFAULT` i `src/config/designTokens.ts`

### Neutrala färger
Gråskala från 50 (ljusast) till 900 (mörkast):
- `gray-50` till `gray-900`

### Användning i Tailwind
```tsx
// Primärfärger
<div className="bg-primary-black text-primary-white">

// Accentfärg
<button className="bg-accent hover:bg-accent-hover">

// Neutrala färger
<p className="text-gray-600">
```

## Typografi

### Typsnitt
- **Sans-serif**: Inter (Google Fonts)
- **Monospace**: System monospace (för kod/klockor)

### Fontstorlekar (responsiva)

Alla storlekar använder `clamp()` för responsivitet:

- **display**: `clamp(3rem, 8vw, 8rem)` - Hero-rubriker
- **hero**: `clamp(2rem, 5vw, 4rem)` - Stora rubriker
- **h1**: `clamp(2rem, 4vw, 3.5rem)` - H1
- **h2**: `clamp(1.75rem, 3vw, 2.5rem)` - H2
- **h3**: `clamp(1.5rem, 2.5vw, 2rem)` - H3
- **h4**: `clamp(1.25rem, 2vw, 1.5rem)` - H4
- **body**: `clamp(1rem, 1.5vw, 1.125rem)` - Brödtext
- **small**: `clamp(0.875rem, 1vw, 1rem)` - Liten text

### Användning
```tsx
<h1 className="text-display">Stor rubrik</h1>
<h2 className="text-hero">Hero text</h2>
<p className="text-body">Brödtext</p>
```

### Fontvikter
- `font-light`: 300
- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700

## Spacing System

8px baserat system:

- `xs`: 8px (0.5rem)
- `sm`: 16px (1rem)
- `md`: 24px (1.5rem)
- `lg`: 32px (2rem)
- `xl`: 48px (3rem)
- `2xl`: 64px (4rem)
- `3xl`: 96px (6rem)
- `4xl`: 128px (8rem)

### Användning
```tsx
<div className="p-lg m-xl">  // padding: 32px, margin: 48px
```

## Breakpoints (Responsiv Design)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Användning
```tsx
<div className="text-base md:text-lg lg:text-xl">
```

## Animationer

### Duration
- `fast`: 0.2s
- `normal`: 0.3s
- `slow`: 0.6s
- `slower`: 0.8s

### Easing
- `default`: cubic-bezier(0.4, 0, 0.2, 1)
- `easeIn`: cubic-bezier(0.4, 0, 1, 1)
- `easeOut`: cubic-bezier(0, 0, 0.2, 1)
- `easeInOut`: cubic-bezier(0.4, 0, 0.2, 1)

### Användning med Framer Motion
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
```

## Shadows

- `sm`: Subtle shadow
- `md`: Medium shadow
- `lg`: Large shadow
- `xl`: Extra large shadow

### Användning
```tsx
<div className="shadow-lg">
```

## Border Radius

- `none`: 0
- `sm`: 4px
- `md`: 8px
- `lg`: 12px
- `xl`: 16px
- `full`: 9999px

### Användning
```tsx
<div className="rounded-lg">
```

## Designprinciper

### 1. Monokrom Bas
Använd svart och vit som grund, med accentfärg för viktiga element.

### 2. Stor Typografi
Hero-rubriker ska vara stora och kraftfulla för maximal impact.

### 3. Generous Spacing
Använd generös spacing för luftig känsla.

### 4. Subtle Animationer
Animationer ska vara subtila och professionella, inte distraherande.

### 5. Responsiv Först
Alla komponenter ska fungera perfekt på mobil, tablet och desktop.

## Ändra Design System

För att ändra designsystemet:

1. **Färger**: Redigera `src/config/designTokens.ts` → `colors`
2. **Typsnitt**: Redigera `src/config/designTokens.ts` → `typography`
3. **Spacing**: Redigera `src/config/designTokens.ts` → `spacing`
4. **Animationer**: Redigera `src/config/designTokens.ts` → `animation`

Efter ändringar, Tailwind kommer automatiskt uppdatera via `tailwind.config.ts`.

---

**Viktigt**: Ändra ALDRIG design direkt i komponenter. Använd alltid design tokens för konsistens.

