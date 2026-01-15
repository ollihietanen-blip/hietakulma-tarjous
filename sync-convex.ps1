# Convex Schema Sync Script
# Tämä skripti yrittää synkronoida Convex-skeeman Convexiin

Write-Host "=== Convex Schema Sync ===" -ForegroundColor Cyan
Write-Host ""

# Tarkista Convex-konfiguraatio
if (-not (Test-Path .convex\config.json)) {
    Write-Host "[ERROR] Convex-konfiguraatio puuttuu" -ForegroundColor Red
    exit 1
}

$config = Get-Content .convex\config.json | ConvertFrom-Json
$projectName = $config.project
$convexUrl = $config.prodUrl

Write-Host "Projekti: $projectName" -ForegroundColor Cyan
Write-Host "URL: $convexUrl" -ForegroundColor Cyan
Write-Host ""

# Tarkista deployment key
$deploymentKey = $null
if (Test-Path .env.local) {
    $envContent = Get-Content .env.local
    $deploymentKeyLine = $envContent | Select-String "CONVEX_DEPLOYMENT_KEY"
    if ($deploymentKeyLine) {
        $deploymentKey = ($deploymentKeyLine -split "=")[1].Trim()
        Write-Host "[OK] Deployment key löytyi" -ForegroundColor Green
    }
}

# Yritä synkronoida käyttäen deployment keyta
if ($deploymentKey) {
    Write-Host ""
    Write-Host "Yritetään synkronoida käyttäen deployment keyta..." -ForegroundColor Yellow
    
    $env:CONVEX_DEPLOYMENT_KEY = $deploymentKey
    $env:CONVEX_URL = $convexUrl
    
    # Yritä deploy
    $deployResult = npx convex deploy --yes 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Skeema synkronoitu onnistuneesti!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tarkista Convex Dashboard:" -ForegroundColor Cyan
        Write-Host "https://dashboard.convex.dev" -ForegroundColor White
        Write-Host "Projekti: $projectName" -ForegroundColor Gray
        exit 0
    } else {
        Write-Host "[WARN] Deployment key ei riitä, tarvitaan kirjautuminen" -ForegroundColor Yellow
    }
}

# Jos deployment key ei toiminut, ohjeista käyttäjää
Write-Host ""
Write-Host "=== Synkronointi vaatii kirjautumisen ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Convex-skeema synkronoidaan jollakin seuraavista tavoista:" -ForegroundColor White
Write-Host ""
Write-Host "Vaihtoehto 1: Convex Dev (Suositus)" -ForegroundColor Cyan
Write-Host "  npx convex dev" -ForegroundColor White
Write-Host "  -> Synkronoi automaattisesti ja pidetään terminaali auki" -ForegroundColor Gray
Write-Host ""
Write-Host "Vaihtoehto 2: Kirjaudu ensin" -ForegroundColor Cyan
Write-Host "  npx convex login" -ForegroundColor White
Write-Host "  -> Avaa selaimen kirjautumiseen" -ForegroundColor Gray
Write-Host "  -> Sitten: npx convex deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "Vaihtoehto 3: Tarkista Convex Dashboard" -ForegroundColor Cyan
Write-Host "  https://dashboard.convex.dev" -ForegroundColor White
Write-Host "  -> Valitse projekti: $projectName" -ForegroundColor Gray
Write-Host "  -> Data-välilehti -> Taulut luodaan automaattisesti" -ForegroundColor Gray
Write-Host ""
Write-Host "Skeema on valmis synkronoinnille!" -ForegroundColor Green
Write-Host "Kaikki 6 taulua on määritelty: quotations, messages, communicationTasks, costEntries, files, pricingTemplates" -ForegroundColor Gray
Write-Host ""
