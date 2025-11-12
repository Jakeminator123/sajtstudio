# Cleanup och Rebuild Script för Sajtstudio
# Kör dessa kommandon i PowerShell i projektets root-mapp

Write-Host "🧹 Rensar projektet..." -ForegroundColor Cyan

# 1. Stoppa alla Node-processer
Write-Host "`n1. Stoppar alla Node-processer..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Ta bort .next mapp (build cache)
Write-Host "2. Tar bort .next mapp..." -ForegroundColor Yellow
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Ta bort node_modules (valfritt - kan ta tid)
Write-Host "3. Tar bort node_modules..." -ForegroundColor Yellow
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Ta bort package-lock.json (för fresh install)
Write-Host "4. Tar bort package-lock.json..." -ForegroundColor Yellow
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# 5. Rensa npm cache
Write-Host "5. Rensar npm cache..." -ForegroundColor Yellow
npm cache clean --force

# 6. Installera dependencies från scratch
Write-Host "`n📦 Installerar dependencies..." -ForegroundColor Cyan
npm install

# 7. Bygg projektet
Write-Host "`n🔨 Bygger projektet..." -ForegroundColor Cyan
npm run build

# 8. Starta dev-servern
Write-Host "`n🚀 Startar dev-servern..." -ForegroundColor Green
Write-Host "Servern kommer starta på http://localhost:3000" -ForegroundColor Green
npm run dev
