<#
.SYNOPSIS
    HTTP-only smoke test script for deployed Rope Pro Academy environments.
    Performs non-credentialed HTTP checks to verify route availability, NextAuth session baseline,
    and lack of server-side crashes.

.PARAMETER BaseUrl
    Base URL of the deployment to test (e.g., https://rope-pro-academy.vercel.app or https://ropeproacademy.com).

.EXAMPLE
    .\scripts\smoke-test-deployed.ps1 -BaseUrl "https://rope-pro-academy.vercel.app"
    .\scripts\smoke-test-deployed.ps1 -BaseUrl "https://ropeproacademy.com"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false, Position = 0)]
    [string]$BaseUrl = "https://rope-pro-academy.vercel.app"
)

# Normalize BaseUrl (remove trailing slash)
$BaseUrl = $BaseUrl.TrimEnd("/")
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ROPE PRO ACADEMY - DEPLOYMENT HTTP SMOKE TEST" -ForegroundColor Cyan
Write-Host "   Target: $BaseUrl" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$passes = 0
$fails = 0

function Test-Endpoint {
    param(
        [string]$Path,
        [string]$Description,
        [int[]]$ExpectedStatus = @(200),
        [bool]$ExpectEmptySessionJson = $false,
        [bool]$ExpectRedirect = $false
    )

    $url = "$BaseUrl$Path"
    $checkLabel = "[$Description] $Path"

    try {
        # Use Invoke-WebRequest with MaximumRedirection 0 when testing redirect behavior
        $maxRedir = if ($ExpectRedirect) { 0 } else { 5 }
        $response = Invoke-WebRequest -Uri $url -Method Get -MaximumRedirection $maxRedir -ErrorAction Stop -TimeoutSec 15

        $statusCode = [int]$response.StatusCode
        $content = $response.Content

        # Check status code
        if ($ExpectedStatus -notcontains $statusCode) {
            Write-Host "  [FAIL] $checkLabel - Unexpected HTTP status: $statusCode (Expected: $($ExpectedStatus -join ','))" -ForegroundColor Red
            $script:fails++
            return
        }

        # Check for server error indicators
        if ($content -match "This page couldn't load" -or 
            $content -match "ENVIRONMENT CONFIGURATION ERROR" -or 
            $content -match "A server error occurred") {
            Write-Host "  [FAIL] $checkLabel - Page returned 200 but contains server error banner!" -ForegroundColor Red
            $script:fails++
            return
        }

        # Check empty session baseline
        if ($ExpectEmptySessionJson) {
            $trimmed = $content.Trim()
            if ($trimmed -ne "{}" -and $trimmed -ne "null") {
                Write-Host "  [FAIL] $checkLabel - Expected empty session json '{}' but received non-empty payload" -ForegroundColor Red
                $script:fails++
                return
            }
        }

        Write-Host "  [PASS] $checkLabel (HTTP $statusCode)" -ForegroundColor Green
        $script:passes++

    } catch {
        $ex = $_.Exception
        if ($ExpectRedirect -and $ex.Response -ne $null) {
            $statusCode = [int]$ex.Response.StatusCode
            if (@(301, 302, 307, 308) -contains $statusCode) {
                Write-Host "  [PASS] $checkLabel (Redirected HTTP $statusCode as expected)" -ForegroundColor Green
                $script:passes++
                return
            }
        }

        Write-Host "  [FAIL] $checkLabel - Request failed: $($ex.Message)" -ForegroundColor Red
        $script:fails++
    }
}

Write-Host "1. Authentication API Baseline:" -ForegroundColor Yellow
Test-Endpoint -Path "/api/auth/session" -Description "NextAuth Session Baseline" -ExpectedStatus @(200) -ExpectEmptySessionJson $true

Write-Host "`n2. Public Informational Pages:" -ForegroundColor Yellow
Test-Endpoint -Path "/" -Description "Homepage"
Test-Endpoint -Path "/programs" -Description "Programs & Pricing"
Test-Endpoint -Path "/contact" -Description "Contact Us"
Test-Endpoint -Path "/coaches" -Description "Coaches Roster"
Test-Endpoint -Path "/achievements" -Description "Hall of Fame & Gallery"

Write-Host "`n3. Authentication & Registration Pages (Dynamic Server Components):" -ForegroundColor Yellow
Test-Endpoint -Path "/login" -Description "Login Page"
Test-Endpoint -Path "/register" -Description "Student Registration Selection"
Test-Endpoint -Path "/register/player" -Description "Player Registration Form"
Test-Endpoint -Path "/register/coach" -Description "Coach Registration Form"

Write-Host "`n4. Protected Dashboard Routes (Unauthenticated Redirects):" -ForegroundColor Yellow
Test-Endpoint -Path "/dashboard/admin" -Description "Admin Dashboard Guard" -ExpectRedirect $true -ExpectedStatus @(302, 307)
Test-Endpoint -Path "/dashboard/coach" -Description "Coach Dashboard Guard" -ExpectRedirect $true -ExpectedStatus @(302, 307)
Test-Endpoint -Path "/dashboard/player" -Description "Player Dashboard Guard" -ExpectRedirect $true -ExpectedStatus @(302, 307)

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY: $passes PASSED, $fails FAILED" -ForegroundColor $(if ($fails -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================================" -ForegroundColor Cyan

if ($fails -gt 0) {
    exit 1
}
exit 0
