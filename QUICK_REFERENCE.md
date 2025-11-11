# QUICK_REFERENCE.md

Snabbreferens för Sajtstudio.se projektet.

## 🎨 Ändra Färger

**Accentfärg ändras på två ställen:**

1. `src/config/designTokens.ts` → `colors.accent.DEFAULT`
2. `tailwind.config.ts` → `colors.accent.DEFAULT`

Exempel: Ändra från blå till röd:
```typescript
// I båda filerna:
DEFAULT: '#FF0000', // Röd istället för blå
hover: '#CC0000',
light: '#FF3333',
```

## 📝 Ändra Texter

**Kontaktinfo:**
- `src/config/siteConfig.ts` → `contact`

**Navigation:**
- `src/config/siteConfig.ts` → `nav.links`

**SEO:**
- `src/config/siteConfig.ts` → `seo`
- `src/app/layout.tsx` → `metadata`

## 🎯 Lägga till Ny Sida

1. Skapa `src/app/[sida]/page.tsx`
2. Lägg till länk i `src/config/siteConfig.ts` → `nav.links`
3. Uppdatera `HeaderNav.tsx` om nödvändigt

## 🧩 Lägga till Ny Komponent

1. Skapa `src/components/[ComponentName].tsx`
2. Följ struktur från befintliga komponenter
3. Använd `'use client'` om hooks/animationer behövs
4. Importera design tokens från `@/config/designTokens.ts`

## 📦 Viktiga Filer

| Fil | Syfte |
|-----|-------|
| `src/config/designTokens.ts` | 🎨 Alla designval (färger, typsnitt, spacing) |
| `src/config/siteConfig.ts` | ⚙️ Site metadata och konfiguration |
| `tailwind.config.ts` | 🎨 Tailwind konfiguration (synkad med designTokens) |
| `PROJECT_DOCUMENTATION.md` | 📚 Fullständig projektdokumentation |
| `DESIGN_SYSTEM.md` | 🎨 Designsystem guide |
| `.cursorrules` | 🤖 AI-assistent kontext |

## 🔧 Vanliga Uppgifter

### Ändra typsnitt
1. Importera från Google Fonts i `src/app/layout.tsx`
2. Uppdatera `src/config/designTokens.ts` → `typography.fonts.sans`
3. Uppdatera `tailwind.config.ts` → `fontFamily.sans`

### Lägga till ny färg
1. Lägg till i `src/config/designTokens.ts` → `colors`
2. Lägg till i `tailwind.config.ts` → `colors`
3. Använd i komponenter: `className="bg-[din-färg]"`

### Ändra spacing
1. Ändra i `src/config/designTokens.ts` → `spacing`
2. Ändra i `tailwind.config.ts` → `spacing`
3. Använd: `className="p-lg m-xl"`

## 📚 Mer Information

- Se `PROJECT_DOCUMENTATION.md` för detaljerad dokumentation
- Se `DESIGN_SYSTEM.md` för designsystem guide
- Se `sajtstudio_roadmap.txt` för projektplan

---

**Tips**: Alla designval är centraliserade i `src/config/designTokens.ts` för enkel underhåll!

