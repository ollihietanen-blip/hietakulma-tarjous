# Convex MCP Auto-Setup Script
# Tämä skripti lisää MCP-konfiguraation automaattisesti Cursorin asetuksiin

Write-Host "=== Convex MCP Auto-Setup ===" -ForegroundColor Cyan
Write-Host ""

# Lue Convex-konfiguraatio
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

# Etsi Cursorin asetustiedosto
$cursorSettingsPath = "$env:APPDATA\Cursor\User\settings.json"
$cursorLocalSettingsPath = "$env:LOCALAPPDATA\Cursor\User\settings.json"

$settingsPath = $null
if (Test-Path $cursorSettingsPath) {
    $settingsPath = $cursorSettingsPath
} elseif (Test-Path $cursorLocalSettingsPath) {
    $settingsPath = $cursorLocalSettingsPath
}

if (-not $settingsPath) {
    Write-Host "[WARN] Cursorin asetustiedostoa ei löytynyt" -ForegroundColor Yellow
    Write-Host "Lisää MCP-konfiguraatio manuaalisesti Cursor Settings -> MCP" -ForegroundColor Yellow
    exit 1
}

Write-Host "Löytyi asetustiedosto: $settingsPath" -ForegroundColor Green

# Lue nykyiset asetukset
$settingsJson = Get-Content $settingsPath -Raw
try {
    $settings = $settingsJson | ConvertFrom-Json
} catch {
    Write-Host "[WARN] Asetustiedoston lukeminen epäonnistui, luodaan uusi" -ForegroundColor Yellow
    $settings = @{}
    $settingsJson = "{}"
}

# Muodosta uusi JSON-konfiguraatio
$mcpConfigJson = @"
{
  "command": "npx",
  "args": ["-y", "convex@latest", "mcp", "start"],
  "env": {
    "CONVEX_PROJECT": "$projectName",
    "CONVEX_URL": "$convexUrl"
  }
}
"@

# Lisää MCP-konfiguraatio JSON-merkkijonona
$settingsObj = $settingsJson | ConvertFrom-Json
if (-not $settingsObj.mcpServers) {
    $settingsObj | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value (@{} | ConvertTo-Json | ConvertFrom-Json)
}

# Lisää convex-konfiguraatio
$mcpConfigObj = $mcpConfigJson | ConvertFrom-Json
$settingsObj.mcpServers | Add-Member -MemberType NoteProperty -Name "convex" -Value $mcpConfigObj -Force

# Tallenna asetukset
try {
    $settingsObj | ConvertTo-Json -Depth 10 | Set-Content $settingsPath
    Write-Host "[OK] MCP-konfiguraatio lisätty/päivitetty" -ForegroundColor Green
    Write-Host "[OK] Asetukset tallennettu" -ForegroundColor Green
    Write-Host ""
    Write-Host "MCP-konfiguraatio on nyt lisätty Cursorin asetuksiin!" -ForegroundColor Green
    Write-Host "Uudelleenkäynnistä Cursor, jotta muutokset tulevat voimaan." -ForegroundColor Yellow
} catch {
    Write-Host "[ERROR] Asetusten tallennus epäonnistui: $_" -ForegroundColor Red
    Write-Host "Lisää MCP-konfiguraatio manuaalisesti Cursor Settings -> MCP" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
