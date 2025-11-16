# Scripts Guide - Sajtstudio.se

## Säker Start av Dev-Server

### Problem
Node-processer kan hänga kvar efter att du stängt terminalen eller tryckt Ctrl+C, vilket orsakar konflikter och cache-problem.

### Lösning
Använd de säkra start-scripts som automatiskt dödar gamla processer innan start.

## Kommandon

### Vanlig Desktop-utveckling
```bash
npm run dev:safe
```
- Dödar alla Node-processer på port 3000
- Rensar .next cache
- Startar dev-server på http://localhost:3000

### Mobil-testning (nätverksåtkomst)
```bash
npm run dev:mobile
```
- Dödar alla Node-processer på port 3000
- Rensar .next cache
- Startar dev-server med nätverksåtkomst
- Visar din lokala IP-adress för mobil-testning
- Desktop: http://localhost:3000
- Mobil: http://[din-ip]:3000

### Döda processer manuellt
```bash
npm run kill
```
eller PowerShell:
```bash
npm run kill:ps1
```

## Vanliga Problem och Lösningar

### Problem: Port 3000 är upptagen
**Lösning:** Kör `npm run kill` innan du startar dev-server

### Problem: Gamla cache-filer orsakar problem
**Lösning:** Använd `npm run dev:safe` som automatiskt rensar cache

### Problem: Processer hänger kvar efter Ctrl+C
**Lösning:** Scripts hanterar detta automatiskt. Om problem kvarstår, kör `npm run kill`

### Problem: Konflikter mellan flera dev-servers
**Lösning:** Scripts dödar alla Node-processer innan start, så detta borde inte hända

## Tekniska Detaljer

### kill-node-processes.js
- Cross-platform (Windows/Linux/Mac)
- Hittar och dödar processer på port 3000
- Dödar alla node.exe/node processer
- Kan köras standalone eller importeras som modul

### safe-dev-start.js
- Dödar gamla processer
- Rensar .next cache
- Startar dev-server
- Hanterar Ctrl+C korrekt

### safe-dev-start-mobile.js
- Samma som safe-dev-start.js
- Plus: Startar med `--hostname 0.0.0.0` för nätverksåtkomst
- Visar lokal IP-adress för mobil-testning

## Best Practices

1. **Använd alltid `dev:safe` eller `dev:mobile`** istället för vanlig `dev`
2. **Om du får port-konflikter**, kör `npm run kill` först
3. **För mobil-testning**, använd `dev:mobile` och öppna på mobilen med IP-adressen som visas
4. **Om processer hänger kvar**, kör `npm run kill` manuellt

## Windows PowerShell

Om du får problem med execution policy på Windows:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Eller använd `npm run kill:ps1` som kör med Bypass-flaggan.
