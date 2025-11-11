# Sajtstudio.se

Modern företagswebbplats inspirerad av Fantasy's design, byggd med Next.js 16, React 19, TypeScript, Tailwind CSS och Framer Motion.

## 🚀 Snabbstart

```bash
# Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev

# Bygg för produktion
npm run build

# Starta produktionsserver
npm start
```

## 📁 Projektstruktur

```
sajtstudio/
├── src/
│   ├── app/                    # Next.js App Router sidor
│   ├── components/             # React-komponenter
│   ├── config/                 # Konfiguration och design tokens
│   │   ├── designTokens.ts    # 🎨 Ändra färger/typsnitt här
│   │   └── siteConfig.ts       # Site metadata
│   └── lib/                    # Utility functions
├── public/                     # Statiska filer
├── PROJECT_DOCUMENTATION.md   # 📚 Fullständig dokumentation
├── DESIGN_SYSTEM.md            # 🎨 Designsystem guide
└── sajtstudio_roadmap.txt     # Detaljerad projektplan
```

## 🎨 Ändra Design

### Färger
Redigera `src/config/designTokens.ts`:
```typescript
accent: {
  DEFAULT: '#0000FF', // Ändra till önskad färg
  hover: '#0000CC',
  light: '#3333FF',
}
```

**Viktigt**: Uppdatera också `tailwind.config.ts` med samma värden för konsistens.

### Typsnitt
Ändra i `src/config/designTokens.ts` → `typography.fonts.sans`

Och uppdatera `src/app/layout.tsx` för att importera nytt typsnitt från Google Fonts.

### Spacing
Ändra i `src/config/designTokens.ts` → `spacing`

## 📚 Dokumentation

- **PROJECT_DOCUMENTATION.md** - Fullständig projektdokumentation
- **DESIGN_SYSTEM.md** - Detaljerad designsystem guide
- **.cursorrules** - AI-assistent kontext
- **sajtstudio_roadmap.txt** - Projektplan och designvision

## 🛠 Teknisk Stack

- **Next.js 16** - React-ramverk med App Router
- **React 19** - UI-bibliotek
- **TypeScript** - Typad JavaScript
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animationer

## 🚢 Deployment

Projektet är konfigurerat för Render via `render.yaml`.

### Steg:
1. Pusha till GitHub/GitLab
2. Koppla repo i Render Dashboard
3. Render hittar automatiskt `render.yaml`
4. Konfigurera custom domain `sajtstudio.se`

## 🎯 Designprinciper

- ✅ Monokrom minimalism med accentfärg
- ✅ Stora typografiska element
- ✅ Segmenterad layout
- ✅ Interaktiva inslag (hover, scroll)
- ✅ Lekfull detalj (t.ex. klocka på kontaktsidan)

## 📝 Best Practices

1. **Använd Design Tokens**: Importera från `@/config/designTokens.ts`
2. **Path Aliases**: Använd `@/` för imports från `src/`
3. **Responsiv Design**: Bygg mobil-först
4. **TypeScript**: Använd strikt typing
5. **Komponenter**: Varje komponent i egen fil

## 🔗 Viktiga länkar

- Health check: `/api/health`
- Startsida: `/`
- Portfolio: `/portfolio`
- Kontakt: `/contact`

---

**Version**: 1.0.0  
**Senast uppdaterad**: 2025-11-11
