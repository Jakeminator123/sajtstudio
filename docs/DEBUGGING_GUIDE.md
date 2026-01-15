# Debugging Guide - Sajtstudio.se

**Guide för att koppla Cursor/AI-agenten till dev-server för automatisk debugging.**

## Problem som behöver fixas först

### 1. TypeScript Language Server

Om TypeScript inte hittar moduler:

```bash
# Installera dependencies om de saknas
npm install

# Starta om TypeScript Language Server i Cursor:
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### 2. Node Modules

Kontrollera att node_modules finns:

```bash
# Om node_modules saknas
npm install

# Om det fortfarande inte fungerar
npm run clean:full
npm install
```

## Koppla Cursor till Dev-Server för Debugging

### Metod 1: Browser DevTools Protocol (BDP) - Rekommenderat

Detta låter dig ansluta till Chrome/Edge och debugga direkt från Cursor.

#### Steg 1: Starta Dev-Server med Debugging

```bash
npm run dev:safe
```

#### Steg 2: Konfigurera Launch Configuration

Skapa `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev:safe"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:1337",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev:safe",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

#### Steg 3: Använd Debugging i Cursor

1. Sätt breakpoints i din kod
2. Tryck `F5` eller gå till Run & Debug
3. Välj konfiguration
4. Dev-server startar och Chrome öppnas med debugging aktiverat

### Metod 2: Next.js Debugging (Node.js)

För server-side debugging:

#### Steg 1: Uppdatera package.json

```json
{
  "scripts": {
    "dev:debug": "NODE_OPTIONS='--inspect' next dev"
  }
}
```

#### Steg 2: Starta med debugging

```bash
npm run dev:debug
```

#### Steg 3: Anslut Chrome DevTools

1. Öppna Chrome och gå till `chrome://inspect`
2. Klicka på "Open dedicated DevTools for Node"
3. Du kan nu debugga server-side kod

### Metod 3: React DevTools

För React-komponent debugging:

1. Installera React DevTools extension i Chrome/Edge
2. Starta dev-server: `npm run dev:safe`
3. Öppna Chrome DevTools (`F12`)
4. Gå till "Components" tab
5. Du kan nu inspektera React-komponenter live

### Metod 4: Source Maps (Automatiskt)

Next.js genererar automatiskt source maps i dev-mode. Detta gör att:

- Du kan se original-kod i DevTools (inte compiled code)
- Stack traces visar rätt filer och rader
- Breakpoints fungerar i original-kod

**Ingen extra konfiguration behövs** - det fungerar automatiskt!

## AI-Agent Integration (Framtida)

För att låta AI-agenten automatiskt debugga:

### Teoretisk Implementation:

1. **Browser Automation API**
   - Använd Puppeteer eller Playwright
   - AI-agenten kan öppna sidan och testa
   - Kan läsa console logs och errors

2. **Error Monitoring**
   - Integrera Sentry eller liknande
   - AI-agenten kan läsa errors automatiskt
   - Kan föreslå fixes baserat på errors

3. **E2E Testing Integration**
   - Använd Playwright eller Cypress
   - AI-agenten kan köra tests automatiskt
   - Kan fixa problem som tests hittar

### Praktisk Implementation (Nu):

**För att AI-agenten ska kunna hjälpa med debugging:**

1. **Dela error messages** - Kopiera errors från console/terminal
2. **Beskriv problemet** - Vad händer vs vad som förväntas
3. **Visa relevant kod** - Öppna filen med problemet
4. **Använd browser snapshots** - Ta screenshot av problemet

AI-agenten kan då:

- Analysera errors
- Föreslå fixes
- Uppdatera kod
- Testa lösningar

## Debugging Best Practices

### 1. Använd Console Logs Strategiskt

```typescript
// I komponenter
console.log('Component rendered', { props, state })

// I server-side kod
console.log('API called', { params, result })
```

### 2. Använd React DevTools

- Inspektera props och state
- Se component hierarchy
- Profilera performance

### 3. Använd Network Tab

- Se API calls
- Kolla response times
- Identifiera failed requests

### 4. Använd Performance Tab

- Se rendering times
- Identifiera bottlenecks
- Optimera animations

## Vanliga Debugging-Scenarion

### Problem: Komponent renderas inte

1. Kolla console för errors
2. Använd React DevTools för att se om komponenten finns
3. Kolla props och state

### Problem: API call fungerar inte

1. Kolla Network tab
2. Se request/response
3. Kolla server logs

### Problem: Styling ser konstig ut

1. Använd Elements tab i DevTools
2. Inspektera computed styles
3. Kolla Tailwind classes

### Problem: Animation fungerar inte

1. Kolla Framer Motion console logs
2. Använd React DevTools för att se animation state
3. Testa med `prefers-reduced-motion` disabled

## Snabbreferens

```bash
# Starta med debugging
npm run dev:safe

# I Cursor:
# F5 → Start debugging
# F9 → Toggle breakpoint
# F10 → Step over
# F11 → Step into
# Shift+F11 → Step out
```

## Ytterligare Resurser

- [Next.js Debugging](https://nextjs.org/docs/advanced-features/debugging)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
