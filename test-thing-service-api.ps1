# Thing-service API Testaus
# Testaa API-kutsun suoraan

Write-Host "=== Testataan Thing-service API:ta ===" -ForegroundColor Cyan
Write-Host ""

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnQiOiJiNmJmZGEyYi1jZDcwLTRlZWEtOTk4NC03ODBiMWExYjZjMmIiLCJpZCI6MTAwMDEsImlhdCI6MTY4MzY1MTk3N30.gLWZsv1qna0g_T0KUv5N8Q9PbkDubXCWjtsPqmj6u9o"
$tenantId = "b6bfda2b-cd70-4eea-9984-780b1a1b6c2b"
$url = "https://api.ggjb.fi/v3/customers"

Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
Write-Host "Tenant ID: $tenantId" -ForegroundColor Gray
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "token-id-type" = "tenant"
        "token-id" = $tenantId
        "Content-Type" = "application/json"
    }
    
    $body = @{
        action = "get-customers"
        filter = @{
            active = $true
        }
    } | ConvertTo-Json
    
    Write-Host "Lahetetaan pyynto..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
    
    Write-Host "Onnistui!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vastaus:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "Virhe!" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Vastaus: $responseBody" -ForegroundColor Red
        
        if ($statusCode -eq 401) {
            Write-Host ""
            Write-Host "401 Unauthorized tarkoittaa:" -ForegroundColor Yellow
            Write-Host "- Token on vaara tai vanhentunut" -ForegroundColor Yellow
            Write-Host "- Tenant-ID ei vastaa tokenia" -ForegroundColor Yellow
            Write-Host "- Tokenilla ei ole oikeuksia taman tenant-ID:hen" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Ratkaisu: Hanki uusi token Thing-service API:sta" -ForegroundColor Cyan
        }
    } else {
        Write-Host "Virheilmoitus: $($_.Exception.Message)" -ForegroundColor Red
    }
}
