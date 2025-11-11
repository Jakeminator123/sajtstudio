/**
 * PROJECT_DOCUMENTATION.md
 * 
 * Detta dokument beskriver projektstrukturen, designsystemet och best practices
 * för Sajtstudio.se. Använd detta som referens när du utvecklar eller underhåller projektet.
 */

# Sajtstudio.se - Projektdokumentation

## Översikt

Sajtstudio.se är en modern företagswebbplats inspirerad av Fantasy's design (ca 70% likhet), byggd med Next.js 16, React 19, TypeScript, Tailwind CSS och Framer Motion.

## Projektstruktur

```
sajtstudio/
├── src/
│   ├── app/                    # Next.js App Router sidor
│   │   ├── page.tsx           # Startsida
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Globala stilar
│   │   ├── portfolio/         # Portfolio-sida
│   │   ├── contact/           # Kontakt-sida
│   │   └── api/               # API routes
│   │       └── health/        # Health check för Render
│   ├── components/            # Återanvändbara React-komponenter
│   │   ├── HeaderNav.tsx
│   │   ├── HeroSection.tsx
│   │   ├── USPSection.tsx    # USP-sektion (AI-driven)
│   │   ├── ServicesSection.tsx
│   │   ├── PortfolioSection.tsx
│   │   └── Footer.tsx
│   ├── templates/             # Mallar för sidor och sektioner
│   │   ├── PageTemplate.tsx
│   │   ├── SectionTemplate.tsx
│   │   └── ComponentTemplate.tsx
│   ├── config/                # Konfiguration och design tokens
│   │   ├── designTokens.ts    # Färger, typsnitt, spacing etc
│   │   ├── siteConfig.ts      # Site metadata och konfiguration
│   │   └── content/           # Innehåll separerat från komponenter
│   │       └── usps.ts        # USP-texter
│   ├── lib/                   # Utility functions
│   │   ├── inputDocProcessor.ts  # INPUT_DOC filhantering
│   │   └── assetManager.ts    # Asset-hantering
│   └── data/                  # JSON-data filer
├── scripts/                   # Build scripts
│   └── processInputDocs.ts    # Process INPUT_DOC filer
├── INPUT_DOC_FOR_CURSOR/      # Drop zone för nya filer
├── public/                    # Statiska filer
│   ├── images/                # Bilder (hero, portfolio, features)
│   └── logos/                 # Loggor (clients, sajtstudio)
├── tailwind.config.ts         # Tailwind konfiguration
├── tsconfig.json             # TypeScript konfiguration
├── next.config.ts            # Next.js konfiguration
├── render.yaml               # Render deployment config
├── TEMPLATE_GUIDE.md         # Mall-guide
├── INPUT_DOC_README.md       # INPUT_DOC användarguide
└── sajtstudio_roadmap.txt    # Detaljerad projektplan
```

## Designsystem

### Färgpalett

Projektet använder en monokrom bas med en accentfärg:

- **Primär**: Svart (#000000) och Vit (#FFFFFF)
- **Accent**: Blå (#0000FF) - kan ändras i `src/config/designTokens.ts`
- **Neutrala**: Gråskala från 50-900

**Viktigt**: Ändra färger i `src/config/designTokens.ts` för att uppdatera hela sajten.

### Typografi

- **Sans-serif**: Inter (från Google Fonts)
- **Display**: `clamp(3rem, 8vw, 8rem)` - för hero-rubriker
- **Hero**: `clamp(2rem, 5vw, 4rem)` - för stora rubriker
- **Body**: `clamp(1rem, 1.5vw, 1.125rem)` - för brödtext

Alla fontstorlekar är responsiva med `clamp()` för optimal läsbarhet på alla skärmar.

### Spacing System

Baserat på 8px grid:
- xs: 8px
- sm: 16px
- md: 24px
- lg: 32px
- xl: 48px
- 2xl: 64px
- 3xl: 96px
- 4xl: 128px

### Animationer

Använd Framer Motion för alla animationer:
- Fade-in vid scroll
- Hover-effekter
- Page transitions
- Scroll-triggered animations

## Komponentstruktur

### Naming Conventions

- Komponenter: PascalCase (`HeaderNav.tsx`)
- Filer: matchar komponentnamn
- Hooks: börjar med `use` (`useScroll.ts`)
- Utilities: camelCase (`formatDate.ts`)

### Komponentbeståndsdelar

Varje komponent bör:
1. Vara i egen fil i `src/components/`
2. Använda TypeScript för props
3. Vara 'use client' om den använder hooks/animationer
4. Använda design tokens från `src/config/designTokens.ts`
5. Vara responsiv (mobil-först)

### Exempel på komponentstruktur:

```tsx
'use client';

import { motion } from 'framer-motion';
import { designTokens } from '@/config/designTokens';

interface ComponentProps {
  title: string;
}

export default function Component({ title }: ComponentProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-24"
    >
      {/* Innehåll */}
    </motion.section>
  );
}
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

### 2. Responsiv Design

Alltid bygg mobil-först:
```tsx
<div className="text-base md:text-lg lg:text-xl">
```

### 3. Animationer

Använd Framer Motion för interaktiva animationer:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>
```

### 4. TypeScript

Använd strikt typing för alla props:
```tsx
interface Props {
  title: string;
  description?: string;
}
```

### 5. Path Aliases

Använd `@/` för imports från `src/`:
```tsx
import { designTokens } from '@/config/designTokens';
import HeaderNav from '@/components/HeaderNav';
```

## Deployment

### Render

Projektet är konfigurerat för Render via `render.yaml`:
- Build: `npm install && npm run build`
- Start: `npm start`
- Health check: `/api/health`

### Miljövariabler

Skapa `.env` baserat på `.env.example`:
```env
PORT=3000
NODE_ENV=production
```

## Utveckling

### Kommandon

```bash
# Installera beroenden
npm install

# Utvecklingsserver
npm run dev

# Bygg för produktion
npm run build

# Starta produktionsserver
npm start

# Lint
npm run lint
```

### Lägga till nya sidor

1. Skapa fil i `src/app/[sida]/page.tsx`
2. Lägg till länk i `src/config/siteConfig.ts`
3. Uppdatera navigation om nödvändigt

### Lägga till nya komponenter

1. Skapa fil i `src/components/[ComponentName].tsx`
2. Följ komponentstruktur ovan
3. Exportera och importera där den behövs

## Designprinciper

### Inspiration från Fantasy.co

- ✅ Monokrom minimalism med accentfärg
- ✅ Stora typografiska element
- ✅ Segmenterad layout
- ✅ Interaktiva inslag (hover, scroll)
- ✅ Lekfull detalj (t.ex. klocka på kontaktsidan)

### Vår egen identitet

- Blå accentfärg (istället för Fantasy's röd)
- Fokus på "Bygger hemsidor som betyder något"
- Tydlig struktur med numrerade sektioner (01, 02, 03)

## Framtida utveckling

### Potentiella förbättringar

1. **CMS Integration**: Koppla Sanity eller Prismic för innehållshantering
2. **Blogg**: Lägg till bloggsektion för SEO och thought leadership
3. **Case Studies**: Detaljsidor för varje projekt
4. **Språkstöd**: i18n för svenska/engelska
5. **Analytics**: Lägg till Google Analytics eller Plausible
6. **Formulär**: Koppla kontaktformulär till backend/tjänst

### Skalbarhet

Projektstrukturen är designad för att växa:
- Komponenter är modulära och återanvändbara
- Design tokens gör det enkelt att ändra design systematiskt
- Config-filer centraliserar all konfiguration
- TypeScript säkerställer typ-säkerhet vid utökningar

## Template System

Projektet använder ett template-system för konsistent struktur och enkel utveckling.

### Mallar

- **PageTemplate**: Grundmall för alla sidor (inkluderar HeaderNav och Footer)
- **SectionTemplate**: Mall för sektioner med konsistent padding och animationer
- **ComponentTemplate**: Mall för återanvändbara komponenter

Se `TEMPLATE_GUIDE.md` för detaljerad guide om hur man använder mallarna.

### Content Management

Allt textinnehåll separeras från komponenter i `src/config/content/`:
- `usps.ts` - USP-texter och beskrivningar
- Ytterligare content-filer kan läggas till efter behov

**Fördelar:**
- Enkelt att uppdatera innehåll utan att ändra komponenter
- Möjlighet att byta språk i framtiden
- Centraliserad innehållshantering

## INPUT_DOC_FOR_CURSOR Workflow

Projektet har ett system för att automatiskt hantera filer från `INPUT_DOC_FOR_CURSOR/` mappen.

### Hur det fungerar

1. **Lägg filer i `INPUT_DOC_FOR_CURSOR/`**
2. **Kör scriptet**: `npm run process-input-docs`
3. **Filer flyttas automatiskt** till rätt plats:
   - Bilder → `public/images/[kategori]/`
   - Loggor → `public/logos/[kategori]/`
   - Texter → `src/config/content/`
   - JSON → `src/data/`

### Filtyper som stöds

- **Bilder**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, `.gif`
- **Loggor**: Filer med "logo" i namnet
- **Texter**: `.txt`, `.md`
- **JSON**: `.json`

### Namngivningskonventioner

- `hero-*.jpg` → `public/images/hero/`
- `portfolio-*.png` → `public/images/portfolio/`
- `logo-client-*.svg` → `public/logos/clients/`
- `logo-*.svg` → `public/logos/sajtstudio/`

Se `INPUT_DOC_README.md` för detaljerad guide.

### AI-assistent Integration

När du använder AI-assistenten (t.ex. Cursor):
1. Lägg filen i `INPUT_DOC_FOR_CURSOR/`
2. Säg till AI-assistenten att integrera filen
3. AI-assistenten läser filen, identifierar typ, flyttar till rätt plats och uppdaterar referenser

### Utility Functions

- `src/lib/inputDocProcessor.ts` - Funktioner för att identifiera och hantera filer
- `src/lib/assetManager.ts` - Helper-funktioner för att generera korrekta sökvägar

## USP-sektion

Projektet inkluderar en USP-sektion (`USPSection.tsx`) som beskriver Sajtstudios unika värdeerbjudande:

- **AI-Analys & Audit**: Analys av företag och mål med AI
- **SEO-Optimering**: Byggt för att ranka högt på Google
- **Skräddarsydd Design**: Baserat på företagets profil och mål
- **Redigeringsmöjligheter**: Enkelt att uppdatera innehåll

Se `src/config/content/usps.ts` för texter och `src/components/USPSection.tsx` för komponenten.

## Support och dokumentation

- **Roadmap**: Se `sajtstudio_roadmap.txt` för detaljerad plan
- **Template Guide**: Se `TEMPLATE_GUIDE.md` för mall-struktur
- **INPUT_DOC Guide**: Se `INPUT_DOC_README.md` för asset-hantering
- **Design Tokens**: Se `src/config/designTokens.ts`
- **Site Config**: Se `src/config/siteConfig.ts`
- **Cursor Rules**: Se `.cursorrules` för AI-assistent kontext

---

**Senast uppdaterad**: 2025-11-11
**Version**: 1.0.0

