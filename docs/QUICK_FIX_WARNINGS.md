# Snabbguide: Fixa Varningar i Cursor

## Problem: Du ser varningar i Cursor

**Jag kan inte se varningarna automatiskt**, men här är hur du fixar dem:

## Metod 1: Automatisk fix (Snabbast)

```bash
npm run fix:warnings
```

Detta fixar de vanligaste varningarna automatiskt.

## Metod 2: Kopiera varningar till mig

1. **I Cursor:** Högerklicka på varningen → "Copy" eller markera och kopiera
2. **Klistra in här:** Ge mig varningarna så fixar jag dem
3. **Jag fixar:** Jag analyserar och fixar automatiskt

## Metod 3: Kör check scriptet

```bash
npm run check:warnings
```

Detta visar TypeScript-varningar i terminalen som du kan kopiera.

## Vanliga varningar och snabbfixar

### Microsoft Edge Tools varningar (no-inline-styles)

**Fix:** Stäng av extensionen eller ignorera dem

- De är ofta falska positiva
- Många inline styles är nödvändiga för Framer Motion
- Jag har stängt av dem i `.vscode/settings.json`
- Om de fortfarande syns: Stäng av "Microsoft Edge Tools" extensionen

### Markdownlint varningar (MD012, MD026)

**Fix:** Redan fixat och ignorerat för `.cursorrules`

- `.cursorrules` ignoreras nu av markdownlint
- Andra markdown-filer följer regler

### TypeScript "Cannot find module"

**Fix:**

```bash
npm install
# Sedan: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### TypeScript "Property missing"

**Fix:** Kopiera varningen till mig, så fixar jag den

## Snabbreferens

| Varning            | Snabbfix                              |
| ------------------ | ------------------------------------- |
| no-inline-styles   | Ignorera eller `npm run fix:warnings` |
| Cannot find module | `npm install` + restart TS server     |
| Property missing   | Kopiera till mig                      |
| Type error         | Kopiera till mig                      |

## Workflow

1. **Se varningar i Cursor**
2. **Kör:** `npm run fix:warnings`
3. **Om det fortfarande finns varningar:** Kopiera och ge till mig
4. **Jag fixar:** Automatiskt!

## Tips

- Kör `npm run fix:warnings` regelbundet
- För komplexa varningar: Kopiera och ge till mig
- Microsoft Edge Tools varningar kan ignoreras
