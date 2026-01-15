# Sync Convex Schema Script
# Tämä skripti synkronoi Convex-skeeman Convexiin

Write-Host "=== Convex Schema Sync ===" -ForegroundColor Cyan
Write-Host ""

# Tarkista Convex-konfiguraatio
if (-not (Test-Path .convex\config.json)) {
    Write-Host "[ERROR] Convex-konfiguraatio puuttuu" -ForegroundColor Red
    Write-Host "Suorita ensin: npx convex dev" -ForegroundColor Yellow
    exit 1
}

$config = Get-Content .convex\config.json | ConvertFrom-Json
$projectName = $config.project
$convexUrl = $config.prodUrl

Write-Host "Projekti: $projectName" -ForegroundColor Cyan
Write-Host "URL: $convexUrl" -ForegroundColor Cyan
Write-Host ""

# Tarkista skeema
if (-not (Test-Path convex\schema.ts)) {
    Write-Host "[ERROR] Skeema-tiedosto puuttuu: convex\schema.ts" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Skeema-tiedosto löytyi" -ForegroundColor Green
Write-Host ""

# Listaa taulut
Write-Host "Tarkistetaan skeemassa määritellyt taulut..." -ForegroundColor Yellow
$schemaContent = Get-Content convex\schema.ts -Raw

$tables = @()
if ($schemaContent -match 'quotations:') { $tables += "quotations" }
if ($schemaContent -match 'messages:') { $tables += "messages" }
if ($schemaContent -match 'communicationTasks:') { $tables += "communicationTasks" }
if ($schemaContent -match 'costEntries:') { $tables += "costEntries" }
if ($schemaContent -match 'files:') { $tables += "files" }
if ($schemaContent -match 'pricingTemplates:') { $tables += "pricingTemplates" }

Write-Host ""
Write-Host "Löydetyt taulut:" -ForegroundColor Green
foreach ($table in $tables) {
    Write-Host "  - $table" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Seuraavat vaiheet ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Skeema on valmis synkronoinnille. Synkronoi se jollakin seuraavista tavoista:" -ForegroundColor White
Write-Host ""
Write-Host "1. Käynnistä Convex dev-moodi (suositus):" -ForegroundColor Cyan
Write-Host "   npx convex dev" -ForegroundColor White
Write-Host "   (Pidä tämä terminaali auki - se synkronoi automaattisesti)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Tai synkronoi kerran:" -ForegroundColor Cyan
Write-Host "   npx convex deploy" -ForegroundColor White
Write-Host "   (Vaatii deployment keyn .env.local tiedostossa)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Tarkista Convex Dashboard:" -ForegroundColor Cyan
Write-Host "   https://dashboard.convex.dev" -ForegroundColor White
Write-Host "   Valitse projekti: $projectName" -ForegroundColor Gray
Write-Host "   Tarkista Data-välilehti -> näet kaikki taulut" -ForegroundColor Gray
Write-Host ""
