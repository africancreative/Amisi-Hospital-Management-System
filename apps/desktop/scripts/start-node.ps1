# AmisiMedOS Local Node — Windows Startup Script
# This script is bundled with the installer and can be run standalone
# to start the web server without the full Tauri GUI (e.g., on a headless server).

param(
    [int]$WebPort = 3000,
    [int]$ApiPort = 8080,
    [string]$EnvFile = ".env"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  AmisiMedOS Local Node — Starting..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
    Write-Host "✅ Environment loaded from $EnvFile" -ForegroundColor Green
} else {
    Write-Host "⚠️  No .env file found. Copy .env.local.template to .env first." -ForegroundColor Yellow
    exit 1
}

# Detect LAN IP
$LanIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } | Select-Object -First 1).IPAddress
Write-Host "🌐 LAN IP: $LanIp" -ForegroundColor Cyan

# Start API sidecar (Express)
Write-Host "🚀 Starting API server on port $ApiPort..." -ForegroundColor Green
$ApiProcess = Start-Process -FilePath "node" -ArgumentList "dist/index.js" `
    -Environment @{ PORT = $ApiPort } `
    -NoNewWindow -PassThru

# Start Next.js standalone web server
Write-Host "🚀 Starting Web UI on port $WebPort (accessible at http://${LanIp}:${WebPort})..." -ForegroundColor Green
$WebProcess = Start-Process -FilePath "node" -ArgumentList ".next/standalone/server.js" `
    -Environment @{ PORT = $WebPort; HOSTNAME = "0.0.0.0" } `
    -NoNewWindow -PassThru

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  ✅ AmisiMedOS Local Node is running!" -ForegroundColor Green
Write-Host "  📡 Web UI    → http://$LanIp`:$WebPort" -ForegroundColor White
Write-Host "  🔌 Local API → http://$LanIp`:$ApiPort/api/health" -ForegroundColor White
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

# Wait until user interrupts
try {
    Wait-Process -Id $WebProcess.Id
} finally {
    Write-Host "Shutting down..." -ForegroundColor Yellow
    Stop-Process -Id $ApiProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $WebProcess.Id -Force -ErrorAction SilentlyContinue
}
