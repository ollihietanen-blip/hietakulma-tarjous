# Thing-service API Setup Script
# Tämä skripti ohjeistaa Thing-service API:n ympäristömuuttujien asettamiseen

Write-Host "=== Thing-service API - Ympäristömuuttujat ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Lisää seuraavat ympäristömuuttujat Convex Dashboardissa:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Avaa: https://dashboard.convex.dev" -ForegroundColor White
Write-Host "2. Valitse projekti: original-aardvark-584" -ForegroundColor White
Write-Host "3. Mene: Settings → Environment Variables" -ForegroundColor White
Write-Host "4. Lisää seuraavat muuttujat:" -ForegroundColor White
Write-Host ""

Write-Host "   Muuttuja 1:" -ForegroundColor Cyan
Write-Host "   Name: THING_SERVICE_TOKEN" -ForegroundColor White
Write-Host "   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnQiOiJiNmJmZGEyYi1jZDcwLTRlZWEtOTk4NC03ODBiMWExYjZjMmIiLCJpZCI6MTAwMDEsImlhdCI6MTY4MzY1MTk3N30.gLWZsv1qna0g_T0KUv5N8Q9PbkDubXCWjtsPqmj6u9o" -ForegroundColor Gray
Write-Host ""

Write-Host "   Muuttuja 2:" -ForegroundColor Cyan
Write-Host "   Name: THING_SERVICE_TENANT_ID" -ForegroundColor White
Write-Host "   Value: b6bfda2b-cd70-4eea-9984-780b1a1b6c2b" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Tallenna muutokset" -ForegroundColor White
Write-Host "6. Varmista että Convex dev on käynnissä: npm run convex:dev" -ForegroundColor White
Write-Host "7. Päivitä sovellus selaimessa" -ForegroundColor White
Write-Host ""

Write-Host "=== Vaiheet valmiit! ===" -ForegroundColor Green
Write-Host "Katso tarkemmat ohjeet: THING_SERVICE_SETUP.md" -ForegroundColor Gray
