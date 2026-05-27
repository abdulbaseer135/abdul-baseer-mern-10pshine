# SonarQube Scanner Script for MERN Project
# Usage: .\sonar-scan.ps1 -Token "your_token_here"
# Or: $env:SONAR_TOKEN = "your_token"; .\sonar-scan.ps1

param(
    [string]$Token,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║          SonarQube Scanner for MERN Project                    ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  Method 1 - With Token Parameter:
    .\sonar-scan.ps1 -Token "your_token_here"

  Method 2 - With Environment Variable:
    `$env:SONAR_TOKEN = "your_token_here"
    .\sonar-scan.ps1

  Method 3 - With Coverage Only:
    .\sonar-scan.ps1 -Token "your_token_here" -CoverageOnly

OPTIONS:
  -Token <string>       : Your SonarQube authentication token
  -CoverageOnly         : Generate coverage reports only (skip analysis)
  -Help                 : Show this help message

STEPS TO GET TOKEN:
  1. Go to http://localhost:9000
  2. Click your avatar → My Account → Security
  3. Click "Generate Tokens"
  4. Name: "sonar-scanner-token" (or any name)
  5. Copy the token

EXAMPLE:
  .\sonar-scan.ps1 -Token "sqp_abcd1234efgh5678ijkl"

"@
    exit 0
}

# Get token from parameter or environment variable
if (-not $Token) {
    $Token = $env:SONAR_TOKEN
}

if (-not $Token) {
    Write-Host "❌ ERROR: No SonarQube token provided!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please provide token using one of these methods:" -ForegroundColor Yellow
    Write-Host "  1. .\sonar-scan.ps1 -Token `"your_token_here`"" 
    Write-Host "  2. `$env:SONAR_TOKEN = `"your_token_here`"; .\sonar-scan.ps1"
    Write-Host ""
    Write-Host "Get your token from: http://localhost:9000"
    Write-Host "Avatar → My Account → Security → Generate Tokens"
    Write-Host ""
    Write-Host "Run with -Help for more options"
    exit 1
}

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          SonarQube Analysis Started                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Set token as environment variable
$env:SONAR_TOKEN = $Token

# Step 1: Generate Backend Coverage
Write-Host "📊 Step 1: Generating Backend Coverage..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Push-Location backend
npm test -- --coverage 2>&1 | ForEach-Object {
    if ($_ -match "PASS|FAIL|Tests|coverage") {
        Write-Host $_
    }
}
$backendStatus = $LASTEXITCODE
Pop-Location
Write-Host ""

if ($backendStatus -ne 0) {
    Write-Host "⚠️  Backend tests completed (exit code: $backendStatus)" -ForegroundColor Yellow
}

# Step 2: Generate Frontend Coverage
Write-Host "📊 Step 2: Generating Frontend Coverage..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Push-Location frontend
npm test -- --watchAll=false --coverage 2>&1 | ForEach-Object {
    if ($_ -match "PASS|FAIL|Tests|coverage") {
        Write-Host $_
    }
}
$frontendStatus = $LASTEXITCODE
Pop-Location
Write-Host ""

if ($frontendStatus -ne 0) {
    Write-Host "⚠️  Frontend tests completed (exit code: $frontendStatus)" -ForegroundColor Yellow
}

# Step 3: Run SonarQube Scanner
Write-Host "🔍 Step 3: Running SonarQube Scanner..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
npx sonarqube-scanner 2>&1

$scanStatus = $LASTEXITCODE

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          Analysis Summary                                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

if ($scanStatus -eq 0) {
    Write-Host "✅ SonarQube analysis completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 View results at: http://localhost:9000/projects" -ForegroundColor Cyan
    Write-Host "📍 Project: Notes App - Abdul Baseer" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "❌ SonarQube analysis failed (exit code: $scanStatus)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  • Check SonarQube is running: http://localhost:9000"
    Write-Host "  • Verify token is valid (check in My Account → Security)"
    Write-Host "  • Check coverage files exist: backend/coverage/ and frontend/coverage/"
    exit $scanStatus
}
