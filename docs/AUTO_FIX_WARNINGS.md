# Auto-Fix Warnings Guide

**Guide för att automatiskt fixa varningar i projektet.**

## Snabbstart

### Metod 1: Kör scriptet manuellt

```bash
npm run fix:warnings
```

Detta kommer att:

- Scanna alla `.tsx` och `.ts` filer i `src/`
- Hitta vanliga inline styles som kan ersättas med Tailwind
- Fixa dem automatiskt

### Metod 2: Använd Cursor Tasks

1. Tryck `Ctrl+Shift+P` (Windows) / `Cmd+Shift+P` (Mac)
2. Skriv: `Tasks: Run Task`
3. Välj: `Auto-fix warnings`

## Vad fixas automatiskt?

Scriptet fixar följande vanliga varningar:

1. **`style={{ position: 'relative' }}`** → `className="relative"`
2. **`style={{ overflowX: 'hidden' }}`** → `className="overflow-x-hidden"`
3. **`style={{ width: '100%' }}`** → `className="w-full"`
4. **`style={{ aspectRatio: '16/9' }}`** → `className="aspect-video"`

## Vad fixas INTE automatiskt?

Följande behålls eftersom de är nödvändiga:

- Framer Motion-animationer (`style={{ y: ... }}`, `style={{ opacity: ... }}`)
- Dynamiska värden baserade på scroll/state
- Komplexa CSS-värden som inte kan göras med Tailwind

## Workflow för att fixa varningar

### När du ser varningar

1. **Kör auto-fix scriptet:**

   ```bash
   npm run fix:warnings
   ```

2. **Om det fortfarande finns varningar:**

   - Kopiera varningarna och ge till mig (AI-agenten)
   - Jag kan analysera och fixa dem manuellt

3. **För Microsoft Edge Tools varningar:**
   - Dessa är ofta falska positiva
   - Du kan ignorera dem eller stänga av extensionen

## Automatisk fix vid save

Jag har lagt till inställningar i `.vscode/settings.json` som:

- Fixar automatiska problem vid save (`source.fixAll`)
- Organiserar imports automatiskt
- Uppdaterar imports när filer flyttas

## Lägga till fler auto-fixes

Om du vill lägga till fler automatiska fixes, redigera `scripts/auto-fix-warnings.js`:

```javascript
const fixes = [
  {
    pattern: /din-regex-här/g,
    replacement: "din-ersättning",
    description: "Beskrivning",
  },
  // Lägg till fler här...
];
```

## Tips

- Kör `npm run fix:warnings` regelbundet
- Commita ändringar innan du kör scriptet (för säkerhets skull)
- Om något går fel, använd `git checkout` för att återställa

## Sammanfattning

- **Automatisk fix:** `npm run fix:warnings`
- **Manual fix:** Kopiera varningar till mig
- **Auto-fix vid save:** Redan aktiverat i settings.json
