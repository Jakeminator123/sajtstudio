# Stänga av Microsoft Edge Tools Varningar

## Problem

Du får många varningar om "CSS inline styles should not be used" från Microsoft Edge Tools.

## Lösning

### Metod 1: Stäng av extensionen (Rekommenderat)

1. Tryck `Ctrl+Shift+X` (Extensions)
2. Sök efter "Microsoft Edge Tools"
3. Klicka på "Disable" eller "Uninstall"

### Metod 2: Inställningar (Redan gjort)

Jag har redan lagt till inställningar i `.vscode/settings.json` som stänger av dessa varningar:

```json
{
  "webhint.enable": false,
  "edgeTools.webhint.enable": false,
  "edgeTools.webhint.diagnostics": false,
  "edgeTools.webhint.problems": false
}
```

### Metod 3: Starta om Cursor

Om varningarna fortfarande syns efter att du stängt av extensionen:

1. Stäng Cursor helt
2. Öppna Cursor igen
3. Varningarna borde vara borta

## Varför dessa varningar är okej att ignorera

- **Framer Motion kräver inline styles** - Dynamiska animationer baserade på scroll kan inte göras med Tailwind
- **Komplex CSS** - Vissa CSS-värden (som `textShadow`, `mixBlendMode`) kan inte göras med Tailwind
- **Falska positiva** - Microsoft Edge Tools är för strikt för React/Next.js projekt

## Exempel på inline styles som är okej

```tsx
// ✅ OKEJ - Dynamiskt värde från scroll
style={{ opacity: useTransform(scrollYProgress, [0, 1], [0, 1]) }}

// ✅ OKEJ - Komplex CSS som inte kan göras med Tailwind
style={{ textShadow: "0 0 60px rgba(0, 102, 255, 0.9)" }}

// ✅ OKEJ - Framer Motion animation
style={{ x: wordsX, y: wordsY, scale: wordsScale }}
```

## Sammanfattning

- **Stäng av extensionen** för bästa resultat
- **Eller ignorera varningarna** - de påverkar inte funktionaliteten
- **Inline styles är okej** när de är nödvändiga för animationer
