# AmisiMedOS Local Node (ALN) Setup Script
# Cross-platform installer for Windows/Linux (PowerShell version)

$MIN_RAM_GB = 4
$REC_RAM_GB = 8

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   AmisiMedOS Local Node (ALN) Installer   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Hardware Audit
Write-Host "[1/4] Performing Hardware Audit..." -ForegroundColor Yellow
$ComputerInfo = Get-CimInstance Win32_ComputerSystem
$TotalRamGB = [Math]::Round($ComputerInfo.TotalPhysicalMemory / 1GB)

Write-Host " -> Detected RAM: $TotalRamGB GB"

if ($TotalRamGB -lt $MIN_RAM_GB) {
    Write-Error "CRITICAL: Insufficient RAM. At least $MIN_RAM_GB GB is required to run the AmisiMedOS stack (DB + Vault + App)."
    exit 1
} elseif ($TotalRamGB -lt $REC_RAM_GB) {
    Write-Host " -> WARNING: You have $TotalRamGB GB RAM. 8GB is recommended for stable hospital operations." -ForegroundColor Gray
} else {
    Write-Host " -> Hardware Audit PASSED." -ForegroundColor Green
}

# 2. Dependency Check
Write-Host "[2/4] Checking Dependencies..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
} catch {
    Write-Error "ERR: Docker or Docker Compose not found. Please install Docker Desktop to continue."
    exit 1
}
Write-Host " -> Docker status: OK" -ForegroundColor Green

# 3. Environment Preparation
Write-Host "[3/4] Preparing Environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host " -> Creating .env from template..."
    if (Test-Path ".env.template") {
        Copy-Item ".env.template" ".env"
    } else {
        # Create a default if template missing
        "NODE_ENV=production`nDATABASE_URL=postgresql://postgres:amisi2026@db:5432/amisimedos`nVAULT_ADDR=http://vault:8200" | Out-File -FilePath ".env"
    }
}

# 4. Orchestration Launch
Write-Host "[4/4] Launching AmisiMedOS Stack..." -ForegroundColor Yellow
Write-Host " -> Pulling and building services (this may take a few minutes)..."
docker-compose up -d

# Final Hook for migrations
Write-Host " -> Waiting for Database to be ready..."
Start-Sleep -Seconds 10
docker-compose exec app npx prisma db push --accept-data-loss

Write-Host "==========================================" -ForegroundColor Green
Write-Host "   AmisiMedOS Local Node is now ONLINE!   " -ForegroundColor Green
Write-Host "   Access URL: http://localhost:3000      " -ForegroundColor Green
Write-Host "   Sovereign KMS: http://localhost:8200   " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
