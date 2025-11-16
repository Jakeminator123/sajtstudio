# Sajtstudio.se

Modern företagswebbplats byggd med Next.js 16, React 19, TypeScript, Tailwind CSS och Framer Motion.

## Snabbstart

```bash
# Installera dependencies
npm install

# Starta dev-server (säker start)
npm run dev:safe

# Starta dev-server för mobil-testning
npm run dev:mobile

# Fixa varningar automatiskt
npm run fix:warnings
```

## Dokumentation

All dokumentation finns i [`docs/`](./docs/) mappen.

**Börja här:**

- [`docs/SITE_STRUCTURE.md`](./docs/SITE_STRUCTURE.md) - Komplett översikt över projektet
- [`docs/MOBILE_DESKTOP_INDEX.md`](./docs/MOBILE_DESKTOP_INDEX.md) - Mobil vs desktop guide
- [`docs/RESPONSIVE_DESIGN_GUIDE.md`](./docs/RESPONSIVE_DESIGN_GUIDE.md) - Responsiv design

**Utveckling:**

- [`docs/DEBUGGING_GUIDE.md`](./docs/DEBUGGING_GUIDE.md) - Debugging guide
- [`docs/TYPESCRIPT_GUIDE.md`](./docs/TYPESCRIPT_GUIDE.md) - TypeScript guide
- [`docs/QUICK_FIX_WARNINGS.md`](./docs/QUICK_FIX_WARNINGS.md) - Fixa varningar

## Projektstruktur

```
sajtstudio/
├── docs/              # All dokumentation
├── src/
│   ├── app/          # Next.js App Router sidor
│   ├── components/   # React-komponenter
│   ├── config/       # Konfiguration och design tokens
│   └── lib/          # Utility-funktioner
├── public/           # Statiska filer
└── scripts/          # Build och dev scripts
```

## Teknologier

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Typning
- **Tailwind CSS** - Styling
- **Framer Motion** - Animationer

## Scripts

- `npm run dev:safe` - Säker start av dev-server
- `npm run dev:mobile` - Dev-server för mobil-testning
- `npm run fix:warnings` - Auto-fixa varningar
- `npm run kill` - Döda alla Node-processer
- `npm run build` - Bygg för produktion

## Deployment

Deployas på Render.com via `render.yaml`.

Se [`docs/`](./docs/) för mer information.
