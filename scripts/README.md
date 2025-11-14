# Cleanup och Rebuild Scripts

Detta är kommandon för att rensa och bygga om projektet från scratch.

## Snabb cleanup (rekommenderas först)

Kör detta för att snabbt rensa cache och starta om:

```powershell
npm run clean
npm run dev
```

Eller direkt i PowerShell:
```powershell
.\scripts\quick-clean.ps1
npm run dev
```

## Fullständig cleanup och rebuild

Om snabb cleanup inte hjälper, kör en fullständig rebuild:

```powershell
npm run rebuild
```

Detta kommer:
1. Stoppa alla Node-processer
2. Ta bort `.next` mapp (build cache)
3. Ta bort `node_modules` (kommer installeras om)
4. Ta bort `package-lock.json`
5. Rensa npm cache
6. Installera alla dependencies från scratch
7. Bygga projektet
8. Starta dev-servern

## Manuella kommandon

Om du vill köra steg för steg:

```powershell
# 1. Stoppa Node-processer
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# 2. Ta bort .next
Remove-Item -Path ".next" -Recurse -Force

# 3. Ta bort node_modules (valfritt)
Remove-Item -Path "node_modules" -Recurse -Force

# 4. Rensa npm cache
npm cache clean --force

# 5. Installera dependencies
npm install

# 6. Bygg projektet
npm run build

# 7. Starta dev-servern
npm run dev
```

## För Git Bash/WSL

```bash
bash scripts/clean-rebuild.sh
```
