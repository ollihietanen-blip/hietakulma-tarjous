# Convex MCP Setup Script
# Tämä skripti konfiguroi Convex MCP:n automaattisesti

Write-Host "=== Convex MCP Setup ===" -ForegroundColor Cyan
Write-Host ""

# Vaihe 1: Tarkista Convex CLI
Write-Host "1. Tarkistetaan Convex CLI..." -ForegroundColor Yellow
$convexVersion = npx convex --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Convex CLI löytyi: $convexVersion" -ForegroundColor Green
    
    # Tarkista että versio tukee MCP:tä (1.19.5+)
    $versionParts = $convexVersion -split '\.'
    $major = [int]$versionParts[0]
    $minor = [int]$versionParts[1]
    $patch = [int]$versionParts[2]
    
    if ($major -gt 1 -or ($major -eq 1 -and $minor -gt 19) -or ($major -eq 1 -and $minor -eq 19 -and $patch -ge 5)) {
        Write-Host "   [OK] Versio tukee MCP:tä" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] Versio ei tue MCP:tä (vaatii 1.19.5+)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [ERROR] Convex CLI ei löytynyt" -ForegroundColor Red
    exit 1
}

# Vaihe 2: Tarkista MCP-komento
Write-Host ""
Write-Host "2. Tarkistetaan MCP-komento..." -ForegroundColor Yellow
$mcpHelp = npx convex mcp --help 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] MCP-komento on saatavilla" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] MCP-komento ei ole saatavilla" -ForegroundColor Red
    exit 1
}

# Vaihe 3: Tarkista Convex-konfiguraatio
Write-Host ""
Write-Host "3. Tarkistetaan Convex-konfiguraatio..." -ForegroundColor Yellow
if (Test-Path .convex\config.json) {
    $config = Get-Content .convex\config.json | ConvertFrom-Json
    $projectName = $config.project
    $convexUrl = $config.prodUrl
    
    Write-Host "   [OK] Convex-konfiguraatio löytyi" -ForegroundColor Green
    Write-Host "   Projekti: $projectName" -ForegroundColor Cyan
    Write-Host "   URL: $convexUrl" -ForegroundColor Cyan
} else {
    Write-Host "   [ERROR] Convex-konfiguraatio puuttuu" -ForegroundColor Red
    Write-Host "   Suorita ensin: npx convex dev" -ForegroundColor Yellow
    exit 1
}

# Vaihe 4: Tarkista MCP-konfiguraatiotiedosto
Write-Host ""
Write-Host "4. Tarkistetaan MCP-konfiguraatiotiedosto..." -ForegroundColor Yellow
if (Test-Path cursor-mcp-config.json) {
    Write-Host "   [OK] cursor-mcp-config.json löytyi" -ForegroundColor Green
    
    # Päivitä konfiguraatio jos tarvitsee
    $mcpConfig = Get-Content cursor-mcp-config.json | ConvertFrom-Json
    $needsUpdate = $false
    
    if ($mcpConfig.mcpServers.convex.env.CONVEX_PROJECT -ne $projectName) {
        $mcpConfig.mcpServers.convex.env.CONVEX_PROJECT = $projectName
        $needsUpdate = $true
    }
    
    if ($mcpConfig.mcpServers.convex.env.CONVEX_URL -ne $convexUrl) {
        $mcpConfig.mcpServers.convex.env.CONVEX_URL = $convexUrl
        $needsUpdate = $true
    }
    
    if ($needsUpdate) {
        Write-Host "   [UPDATE] Päivitetään konfiguraatio..." -ForegroundColor Yellow
        $mcpConfig | ConvertTo-Json -Depth 10 | Set-Content cursor-mcp-config.json
        Write-Host "   [OK] Konfiguraatio päivitetty" -ForegroundColor Green
    } else {
        Write-Host "   [OK] Konfiguraatio on ajan tasalla" -ForegroundColor Green
    }
} else {
    Write-Host "   [WARN] cursor-mcp-config.json puuttuu, luodaan..." -ForegroundColor Yellow
    $mcpConfig = @{
        mcpServers = @{
            convex = @{
                command = "npx"
                args = @("-y", "convex@latest", "mcp", "start")
                env = @{
                    CONVEX_PROJECT = $projectName
                    CONVEX_URL = $convexUrl
                }
            }
        }
    }
    $mcpConfig | ConvertTo-Json -Depth 10 | Set-Content cursor-mcp-config.json
    Write-Host "   [OK] Konfiguraatiotiedosto luotu" -ForegroundColor Green
}

# Vaihe 5: Yritä löytää Cursorin asetustiedosto
Write-Host ""
Write-Host "5. Etsitään Cursorin asetustiedostoja..." -ForegroundColor Yellow
$cursorAppData = "$env:APPDATA\Cursor"
$cursorLocalAppData = "$env:LOCALAPPDATA\Cursor"

$foundConfig = $false
$configPaths = @(
    "$cursorAppData\User\settings.json",
    "$cursorLocalAppData\User\settings.json",
    "$env:USERPROFILE\.cursor\settings.json"
)

foreach ($path in $configPaths) {
    if (Test-Path $path) {
        Write-Host "   [OK] Löytyi: $path" -ForegroundColor Green
        $foundConfig = $true
        break
    }
}

if (-not $foundConfig) {
    Write-Host "   [WARN] Cursorin asetustiedostoa ei löytynyt automaattisesti" -ForegroundColor Yellow
    Write-Host "   Sinun täytyy lisätä MCP-konfiguraatio manuaalisesti" -ForegroundColor Yellow
}

# Vaihe 6: Testaa MCP-serverin käynnistyminen (lyhyt testi)
Write-Host ""
Write-Host "6. Testataan MCP-serverin käynnistyminen..." -ForegroundColor Yellow
Write-Host "   (Tämä voi kestää hetken)" -ForegroundColor Gray

# Yritä käynnistää MCP lyhyeksi ajaksi
$env:CONVEX_PROJECT = $projectName
$env:CONVEX_URL = $convexUrl

# Tarkista että MCP-komento on saatavilla (ei käynnistetä koko serveria)
$mcpTest = npx convex mcp start --help 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] MCP-serveri on valmis käyttöön" -ForegroundColor Green
} else {
    Write-Host "   [WARN] MCP-serverin testaus epäonnistui" -ForegroundColor Yellow
}

# Yhteenveto
Write-Host ""
Write-Host "=== Yhteenveto ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Convex CLI: OK" -ForegroundColor Green
Write-Host "[OK] MCP-komento: OK" -ForegroundColor Green
Write-Host "[OK] Convex-konfiguraatio: OK" -ForegroundColor Green
Write-Host "[OK] MCP-konfiguraatiotiedosto: OK" -ForegroundColor Green
Write-Host ""
Write-Host "Seuraavat vaiheet:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Avaa Cursor Settings (Ctrl+,)" -ForegroundColor White
Write-Host "2. Mene MCP-asetuksiin" -ForegroundColor White
Write-Host "3. Lisää uusi MCP Server käyttäen seuraavia asetuksia:" -ForegroundColor White
Write-Host ""
Write-Host "   Name: convex" -ForegroundColor Cyan
Write-Host "   Command: npx" -ForegroundColor Cyan
Write-Host "   Args: [""-y"", ""convex@latest"", ""mcp"", ""start""]" -ForegroundColor Cyan
Write-Host "   Environment Variables:" -ForegroundColor Cyan
Write-Host "     CONVEX_PROJECT = $projectName" -ForegroundColor Cyan
Write-Host "     CONVEX_URL = $convexUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Uudelleenkäynnistä Cursor" -ForegroundColor White
Write-Host ""
Write-Host "Konfiguraatiotiedosto: cursor-mcp-config.json" -ForegroundColor Gray
Write-Host "Tarkemmat ohjeet: MCP_SETUP.md" -ForegroundColor Gray
Write-Host ""
