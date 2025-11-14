# Template Guide - Sajtstudio.se

## Översikt

Denna guide beskriver den tematiska mall-strukturen för Sajtstudio.se. Målet är att skapa en skalbar, konsekvent struktur som gör det enkelt att lägga till nytt innehåll och underhålla sajten över tid.

## Mallens Filosofi

### Designprinciper

1. **Monokrom Minimalism**: Svart/vit bas med en accentfärg
2. **Stor Typografi**: Kraftfulla, stora rubriker som fångar uppmärksamhet
3. **Segmenterad Layout**: Tydliga sektioner med visuella avdelare
4. **Interaktivitet**: Subtila animationer och hover-effekter
5. **Exklusiv Upplevelse**: Premium-känsla för kunder som vill bygga hemsidor

### Tekniska Principer

- **Komponentbaserad**: Varje sektion är en återanvändbar komponent
- **TypeScript**: Strikt typing för alla komponenter och funktioner
- **Design Tokens**: Alla designval centraliserade i `src/config/designTokens.ts`
- **Content Separation**: Innehåll separerat från komponenter i `src/config/content/`
- **Asset Management**: Strukturerad hantering av bilder och loggor

## Mallstruktur

### 1. Sidmallar (`src/templates/`)

#### PageTemplate.tsx
Grundmall för alla sidor. Inkluderar:
- HeaderNav
- Main content area
- Footer
- Metadata och SEO

#### SectionTemplate.tsx
Mall för sektioner på sidor. Inkluderar:
- Container med max-width
- Responsiv padding
- Scroll-triggered animationer
- Konsistent spacing

#### ComponentTemplate.tsx
Mall för återanvändbara komponenter. Inkluderar:
- TypeScript interfaces för props
- Framer Motion animationer
- Responsiv design
- Design token användning

### 2. Content Management (`src/config/content/`)

Allt textinnehåll separeras från komponenter:

- `usps.ts` - Unikt värdeerbjudande och USP-texter
- `services.ts` - Tjänstebeskrivningar
- `testimonials.ts` - Kundcitat och testimonials
- `hero.ts` - Hero-sektion texter

**Fördelar:**
- Enkelt att uppdatera innehåll utan att ändra komponenter
- Möjlighet att byta språk i framtiden
- Centraliserad innehållshantering

### 3. Asset Management (`public/`)

Strukturerad mappstruktur för assets:

```
public/
├── images/
│   ├── hero/          # Hero-bilder
│   ├── portfolio/     # Portfolio-bilder
│   └── features/      # Feature-illustrationer
├── logos/
│   ├── clients/       # Kundloggor
│   └── sajtstudio/   # Sajtstudio loggor
└── icons/            # Ikoner och SVG-filer
```

## Hur man Lägger till Nytt Innehåll

### Lägga till en Ny Sida

1. Skapa fil: `src/app/[sida]/page.tsx`
2. Använd `PageTemplate` som grund
3. Lägg till länk i `src/config/siteConfig.ts` → `nav.links`
4. Uppdatera metadata i `layout.tsx` om nödvändigt

**Exempel:**
```tsx
import PageTemplate from '@/templates/PageTemplate';
import HeaderNav from '@/components/HeaderNav';
import Footer from '@/components/Footer';

export default function NewPage() {
  return (
    <PageTemplate>
      <HeaderNav />
      <main>
        {/* Ditt innehåll här */}
      </main>
      <Footer />
    </PageTemplate>
  );
}
```

### Lägga till en Ny Sektion

1. Skapa komponent: `src/components/[SectionName].tsx`
2. Använd `SectionTemplate` som grund
3. Importera innehåll från `src/config/content/`
4. Lägg till i önskad sida

**Exempel:**
```tsx
'use client';

import { motion } from 'framer-motion';
import { SectionTemplate } from '@/templates/SectionTemplate';
import { uspContent } from '@/config/content/usps';

export default function NewSection() {
  return (
    <SectionTemplate>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2>{uspContent.title}</h2>
        <p>{uspContent.description}</p>
      </motion.div>
    </SectionTemplate>
  );
}
```

### Lägga till Bilder/Loggor

**Metod 1: Via INPUT_DOC_FOR_CURSOR**
1. Lägg filen i `INPUT_DOC_FOR_CURSOR/`
2. Kör `npm run process-input-docs` (eller låt AI hantera det)
3. Filen flyttas automatiskt till rätt plats

**Metod 2: Manuellt**
1. Lägg filen i rätt mapp under `public/`
2. Använd `assetManager` för att generera korrekt sökväg:
```tsx
import { getImagePath } from '@/lib/assetManager';

const imagePath = getImagePath('hero', 'my-image.jpg');
```

## Best Practices

### 1. Använd Design Tokens

❌ **Dåligt:**
```tsx
<div className="text-blue-500 p-8">
```

✅ **Bra:**
```tsx
import { designTokens } from '@/config/designTokens';

<div className="text-accent p-xl">
```

### 2. Separera Innehåll från Komponenter

❌ **Dåligt:**
```tsx
export default function Section() {
  return <h1>Min rubrik</h1>;
}
```

✅ **Bra:**
```tsx
import { heroContent } from '@/config/content/hero';

export default function Section() {
  return <h1>{heroContent.title}</h1>;
}
```

### 3. Använd Template-komponenter

❌ **Dåligt:**
```tsx
<div className="container mx-auto px-6 py-24">
  {/* Innehåll */}
</div>
```

✅ **Bra:**
```tsx
import { SectionTemplate } from '@/templates/SectionTemplate';

<SectionTemplate>
  {/* Innehåll */}
</SectionTemplate>
```

### 4. Följ Namngivningskonventioner

- **Komponenter**: PascalCase (`USPSection.tsx`)
- **Filer**: matchar komponentnamn
- **Mappar**: lowercase med bindestreck (`content-management/`)
- **Assets**: lowercase med bindestreck (`hero-image.jpg`)

### 5. TypeScript för Allt

Alla komponenter ska ha:
- Typade props med interfaces
- Return types
- Strikt typing

```tsx
interface SectionProps {
  title: string;
  description?: string;
}

export default function Section({ title, description }: SectionProps): JSX.Element {
  // ...
}
```

## INPUT_DOC_FOR_CURSOR Workflow

När du lägger filer i `INPUT_DOC_FOR_CURSOR/`:

1. **Bilder** (`*.jpg`, `*.png`, `*.svg`):
   - Flyttas till `public/images/[kategori]/`
   - Kategori bestäms av filnamn eller mappstruktur

2. **Loggor** (`logo-*.svg`, `logo-*.png`):
   - Flyttas till `public/logos/[kategori]/`
   - Uppdaterar automatiskt referenser i komponenter

3. **Texter** (`*.txt`, `*.md`):
   - Parsas och integreras i `src/config/content/`
   - Uppdaterar relevanta komponenter

4. **JSON-data** (`*.json`):
   - Flyttas till `src/data/`
   - Importeras automatiskt där de behövs

Se `INPUT_DOC_README.md` för detaljerad guide.

## Skalbarhet

Mallen är designad för att växa:

- **Nya sidor**: Lägg till i `src/app/` och uppdatera navigation
- **Nya sektioner**: Skapa komponent och lägg till i önskad sida
- **Nytt innehåll**: Lägg till i `src/config/content/`
- **Nya assets**: Lägg i `INPUT_DOC_FOR_CURSOR/` eller `public/`

## Exempel: Komplett Sektion

```tsx
'use client';

import { motion } from 'framer-motion';
import { SectionTemplate } from '@/templates/SectionTemplate';
import { uspContent } from '@/config/content/usps';
import { designTokens } from '@/config/designTokens';

interface USPSectionProps {
  className?: string;
}

export default function USPSection({ className }: USPSectionProps): JSX.Element {
  return (
    <SectionTemplate className={className}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-display mb-6" style={{ color: designTokens.colors.text.primary }}>
          {uspContent.title}
        </h2>
        <p className="text-body text-gray-600">
          {uspContent.description}
        </p>
      </motion.div>
    </SectionTemplate>
  );
}
```

## Nästa Steg

1. Läs `PROJECT_DOCUMENTATION.md` för teknisk dokumentation
2. Läs `DESIGN_SYSTEM.md` för designsystem-detaljer
3. Läs `INPUT_DOC_README.md` för asset-hantering
4. Använd template-komponenter när du skapar nya sektioner

---

**Viktigt**: Följ alltid mallen för konsistens och underhållbarhet. Om du är osäker, kolla befintliga komponenter för inspiration.

