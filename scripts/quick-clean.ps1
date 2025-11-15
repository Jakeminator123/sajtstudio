# Snabb cleanup (behåller node_modules)
# Kör: .\scripts\quick-clean.ps1

Write-Host "🧹 Snabb cleanup..." -ForegroundColor Cyan

# Stoppa Node-processer (försiktigt, utan force)
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -ErrorAction SilentlyContinue

# Ta bort .next och lock-filer
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path ".next\dev\lock") {
    Remove-Item -Path ".next\dev\lock" -Force -ErrorAction SilentlyContinue
}

Write-Host "✅ Klar! Kör nu: npm run dev" -ForegroundColor Green
