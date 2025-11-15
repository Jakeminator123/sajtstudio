# PowerShell script to kill Node.js processes
# Kills all Node processes running on port 3000 and other Next.js processes

Write-Host "🔍 Letar efter Node-processer...`n" -ForegroundColor Cyan

try {
    # Find processes on port 3000
    $port3000Processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
        Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($port3000Processes) {
        Write-Host "Hittade processer på port 3000..." -ForegroundColor Yellow
        foreach ($pid in $port3000Processes) {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "✅ Dödade process $pid ($($process.ProcessName))" -ForegroundColor Green
                }
            } catch {
                # Process might already be dead
            }
        }
    } else {
        Write-Host "Inga processer hittades på port 3000" -ForegroundColor Gray
    }

    # Kill all node.exe processes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "`nHittade $($nodeProcesses.Count) node-process(er)..." -ForegroundColor Yellow
        foreach ($process in $nodeProcesses) {
            try {
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                Write-Host "✅ Dödade node-process $($process.Id)" -ForegroundColor Green
            } catch {
                # Process might already be dead
            }
        }
    } else {
        Write-Host "Inga node-processer att döda" -ForegroundColor Gray
    }

    Write-Host "`n✅ Klar! Alla Node-processer är dödade." -ForegroundColor Green
    
} catch {
    Write-Host "Fel: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

