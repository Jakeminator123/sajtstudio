# Snabb cleanup (behåller node_modules)
# Kör: .\scripts\quick-clean.ps1

Write-Host "🧹 Snabb cleanup..." -ForegroundColor Cyan

# Stoppa Node-processer
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Ta bort .next och lock-filer
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".next\dev\lock" -Force -ErrorAction SilentlyContinue

Write-Host "✅ Klar! Kör nu: npm run dev" -ForegroundColor Green
