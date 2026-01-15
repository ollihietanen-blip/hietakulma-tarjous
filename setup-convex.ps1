# Convex Setup Script
# Tämä skripti auttaa Convex-tietokannan alustamisessa

Write-Host "=== Convex-tietokannan alustus ===" -ForegroundColor Cyan
Write-Host ""

# Tarkista onko Convex CLI asennettuna
Write-Host "1. Tarkistetaan Convex CLI..." -ForegroundColor Yellow
$convexVersion = npx convex --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Convex CLI loytyi: $convexVersion" -ForegroundColor Green
} else {
    Write-Host "   X Convex CLI ei loytynyt. Asennetaan..." -ForegroundColor Red
    npm install convex
}

Write-Host ""
Write-Host "2. Tarkistetaan Convex-konfiguraatio..." -ForegroundColor Yellow

# Tarkista onko .convex kansio
if (Test-Path .convex) {
    Write-Host "   OK .convex kansio loytyi" -ForegroundColor Green
    $config = Get-Content .convex/config.json -ErrorAction SilentlyContinue | ConvertFrom-Json
    if ($config) {
        Write-Host "   OK Konfiguraatio loytyi" -ForegroundColor Green
        Write-Host "   Projektin nimi: $($config.projectName)" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ! .convex kansiota ei loydy" -ForegroundColor Yellow
}

# Tarkista .env.local
Write-Host ""
Write-Host "3. Tarkistetaan .env.local..." -ForegroundColor Yellow
if (Test-Path .env.local) {
    $envContent = Get-Content .env.local
    $hasConvexUrl = $envContent | Select-String "VITE_CONVEX_URL"
    if ($hasConvexUrl) {
        Write-Host "   OK VITE_CONVEX_URL loytyi" -ForegroundColor Green
        $hasConvexUrl | ForEach-Object { Write-Host "   $_" -ForegroundColor Cyan }
    } else {
        Write-Host "   ! VITE_CONVEX_URL puuttuu" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ! .env.local tiedostoa ei loydy" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Seuraavat vaiheet ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Convex vaatii interaktiivisen kirjautumisen. Suorita seuraavat komennot:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Kirjaudu Convex-tiliisi:" -ForegroundColor White
Write-Host "   npx convex login" -ForegroundColor Green
Write-Host ""
Write-Host "2. Alusta Convex-projekti:" -ForegroundColor White
Write-Host "   npx convex dev" -ForegroundColor Green
Write-Host ""
Write-Host "Tämä avaa selaimen, jossa:" -ForegroundColor Yellow
Write-Host "  - Kirjaudut Convex-tilillesi (tai luot uuden)" -ForegroundColor White
Write-Host "  - Valitset tai luot projektin" -ForegroundColor White
Write-Host "  - Convex synkronoi tietokantakaavion automaattisesti" -ForegroundColor White
Write-Host ""
Write-Host "Kun 'npx convex dev' on kaynnissa, se:" -ForegroundColor Yellow
Write-Host "  - Luo tietokantataulut (quotations, messages, jne.)" -ForegroundColor Green
Write-Host "  - Synkronoi funktiot Convexiin" -ForegroundColor Green
Write-Host "  - Lisaa VITE_CONVEX_URL .env.local tiedostoon" -ForegroundColor Green
Write-Host "  - Paivittaa muutokset automaattisesti" -ForegroundColor Green
Write-Host ""
