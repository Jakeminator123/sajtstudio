# Organize Images Script
# Flyttar och organiserar bilder enligt logisk struktur

Write-Host "Organiserar bilder..." -ForegroundColor Cyan

$imagesPath = "public/images"

# Skapa mappar om de inte finns
$folders = @("portfolio", "backgrounds", "patterns", "animations")
foreach ($folder in $folders) {
    $path = Join-Path $imagesPath $folder
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Skapade mapp: $folder" -ForegroundColor Green
    }
}

# Flytta portfolio-bilder (task_* och assets_*)
$heroPath = Join-Path $imagesPath "hero"
$portfolioPath = Join-Path $imagesPath "portfolio"

if (Test-Path $heroPath) {
    Get-ChildItem $heroPath -Filter "task_*.webp" | ForEach-Object {
        Move-Item $_.FullName -Destination $portfolioPath -Force
        Write-Host "Flyttade: $($_.Name) -> portfolio/" -ForegroundColor Yellow
    }
    
    Get-ChildItem $heroPath -Filter "assets_*.webp" | ForEach-Object {
        Move-Item $_.FullName -Destination $portfolioPath -Force
        Write-Host "Flyttade: $($_.Name) -> portfolio/" -ForegroundColor Yellow
    }
}

# Kopiera hero-background till backgrounds som section-background
$backgroundsPath = Join-Path $imagesPath "backgrounds"
if (Test-Path (Join-Path $heroPath "hero-background.webp")) {
    Copy-Item (Join-Path $heroPath "hero-background.webp") (Join-Path $backgroundsPath "section-background.webp") -Force
    Write-Host "Kopierade hero-background.webp -> backgrounds/section-background.webp" -ForegroundColor Yellow
} elseif (Test-Path (Join-Path $heroPath "alt_background.webp")) {
    Copy-Item (Join-Path $heroPath "alt_background.webp") (Join-Path $backgroundsPath "section-background.webp") -Force
    Write-Host "Kopierade alt_background.webp -> backgrounds/section-background.webp" -ForegroundColor Yellow
}

# Flytta patterns
$patternsPath = Join-Path $imagesPath "patterns"
if (Test-Path (Join-Path $heroPath "bg-content-pattern.png")) {
    Move-Item (Join-Path $heroPath "bg-content-pattern.png") (Join-Path $patternsPath "content-pattern.png") -Force
    Write-Host "Flyttade bg-content-pattern.png -> patterns/" -ForegroundColor Yellow
}
if (Test-Path (Join-Path $heroPath "bg-hero-gradient.png")) {
    Move-Item (Join-Path $heroPath "bg-hero-gradient.png") (Join-Path $patternsPath "hero-gradient.png") -Force
    Write-Host "Flyttade bg-hero-gradient.png -> patterns/" -ForegroundColor Yellow
}

# Flytta animations
$animationsPath = Join-Path $imagesPath "animations"
if (Test-Path (Join-Path $heroPath "hero-animation.gif")) {
    Move-Item (Join-Path $heroPath "hero-animation.gif") (Join-Path $animationsPath "hero-animation.gif") -Force
    Write-Host "Flyttade hero-animation.gif -> animations/" -ForegroundColor Yellow
}
if (Test-Path (Join-Path $heroPath "gif_of_sites_maybee_hero_pic.gif")) {
    Move-Item (Join-Path $heroPath "gif_of_sites_maybee_hero_pic.gif") (Join-Path $animationsPath "sites-animation.gif") -Force
    Write-Host "Flyttade gif_of_sites_maybee_hero_pic.gif -> animations/" -ForegroundColor Yellow
}

# Flytta backgrounds
if (Test-Path (Join-Path $heroPath "city-background.webp")) {
    Move-Item (Join-Path $heroPath "city-background.webp") (Join-Path $backgroundsPath "city-background.webp") -Force
    Write-Host "Flyttade city-background.webp -> backgrounds/" -ForegroundColor Yellow
}
if (Test-Path (Join-Path $heroPath "future_whoman.webp")) {
    Move-Item (Join-Path $heroPath "future_whoman.webp") (Join-Path $backgroundsPath "future-background.webp") -Force
    Write-Host "Flyttade future_whoman.webp -> backgrounds/" -ForegroundColor Yellow
}

Write-Host "`nKlart! Bilderna är nu organiserade." -ForegroundColor Green
Write-Host "`nStruktur:" -ForegroundColor Cyan
Write-Host "  /images/hero/ - Hero-sektionens bilder (hero-background.webp)" -ForegroundColor White
Write-Host "  /images/portfolio/ - Portfolio-exempel bilder" -ForegroundColor White
Write-Host "  /images/backgrounds/ - Bakgrundsbilder för olika sektioner" -ForegroundColor White
Write-Host "  /images/patterns/ - Bakgrundsmönster" -ForegroundColor White
Write-Host "  /images/animations/ - Animation GIFs" -ForegroundColor White

