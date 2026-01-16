# Test Thing-service API
Write-Host "=== Thing-service API Test ===" -ForegroundColor Cyan
Write-Host ""

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnQiOiJiNmJmZGEyYi1jZDcwLTRlZWEtOTk4NC03ODBiMWExYjZjMmIiLCJpZCI6MTAwMDEsImlhdCI6MTY4MzY1MTk3N30.gLWZsv1qna0g_T0KUv5N8Q9PbkDubXCWjtsPqmj6u9o"
$tenantId = "b6bfda2b-cd70-4eea-9984-780b1a1b6c2b"
$baseUrl = "https://api.ggjb.fi"

Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
Write-Host "Tenant ID: $tenantId" -ForegroundColor Gray
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

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

Write-Host "Sending request..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v3/customers" -Method POST -Headers $headers -Body $body
    Write-Host "[OK] API kutsu onnistui!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Asiakkaiden määrä: $($response.items.Count)" -ForegroundColor Cyan
    if ($response.items.Count -gt 0) {
        Write-Host ""
        Write-Host "Ensimmäinen asiakas:" -ForegroundColor Cyan
        $response.items[0] | ConvertTo-Json -Depth 5
    }
} catch {
    Write-Host "[ERROR] API kutsu epäonnistui!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Gray
    }
}
