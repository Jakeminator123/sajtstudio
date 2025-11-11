# Development Notes

## Inline Styles och Framer Motion

### Varför vi använder inline styles

I vissa komponenter (särskilt `HeroSection.tsx`) använder vi inline styles för Framer Motion-animationer:

```tsx
<motion.div style={{ y }} />
<motion.div style={{ opacity }} />
```

Detta är **avsiktligt och nödvändigt** eftersom:

1. **Dynamiska värden**: Värdena beräknas i realtid baserat på scroll-position
2. **Performance**: Framer Motion optimerar dessa inline styles för 60fps animationer
3. **Best practice**: Detta är Framer Motions rekommenderade sätt att hantera dynamiska animationer

### Hantera linting-varningar

Om du får varningar om inline styles från verktyg som webhint eller ESLint:

1. **Ignorera dem** - De är false positives för animationsbibliotek
2. **Konfigurera verktygen** - Se `.hintrc` och `.vscode/settings.json`
3. **Förstå kontexten** - Inline styles är bara "dåliga" för statisk styling, inte för dynamiska animationer

### Alternativ (om absolut nödvändigt)

Om du måste undvika inline styles av någon anledning, kan du:

1. Använda CSS-variabler och uppdatera dem med JavaScript
2. Skapa separata CSS-klasser för varje animationstillstånd (opraktiskt)
3. Byta till ett annat animationsbibliotek (rekommenderas ej)

## Andra utvecklingsnoteringar

### Performance

- Lazy loading används för icke-kritiska sektioner
- Bilder optimeras automatiskt av Next.js
- Videos har poster frames för snabbare visuell laddning

### Accessibility

- Alla interaktiva element har fokusstilar
- Skip links finns för tangentbordsnavigering
- ARIA labels används där det behövs

### SEO

- Strukturerad data finns i `src/lib/structuredData.ts`
- Metadata hanteras i `src/app/layout.tsx`
- Robots.txt och sitemap genereras automatiskt
