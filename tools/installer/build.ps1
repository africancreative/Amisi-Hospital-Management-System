param(
    [string]$RepoRoot = "C:\Users\Dan\Documents\GitHub\Amisi-Hospital-Management-System",
    [string]$TempRoot = "C:\Users\Dan\AppData\Local\Temp\opencode",
    [string]$StageDir = "",
    [switch]$SkipWebBuild,
    [switch]$SkipProvBuild
)

$ErrorActionPreference = "Stop"

if (-not $StageDir) { $StageDir = Join-Path $TempRoot "stage" }
$WebDir = Join-Path $RepoRoot "apps\web"
$AppStage = Join-Path $StageDir "app"
$RuntimeStage = Join-Path $StageDir "runtime"
$NssmStage = Join-Path $StageDir "nssm"
$ProvStage = Join-Path $StageDir "provision"

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

function Remove-Trim($path) {
    if (Test-Path -LiteralPath $path) {
        Remove-Item -LiteralPath $path -Recurse -Force -ErrorAction SilentlyContinue
        if (Test-Path -LiteralPath $path) {
            cmd /c "rmdir /s /q `"$path`"" | Out-Null
        }
    }
}

# 1. Fresh production web build (chained package builds + next build --webpack)
if (-not $SkipWebBuild) {
    Write-Step "1/7 Production web build"
    Push-Location $RepoRoot
    try {
        & pnpm --filter @amisimedos/web build
        if ($LASTEXITCODE -ne 0) { throw "web build failed ($LASTEXITCODE)" }
    } finally { Pop-Location }
}

# 2. pnpm deploy -> self-contained node_modules (production deps only)
Write-Step "2/7 pnpm deploy (self-contained node_modules)"
Remove-Trim $AppStage
New-Item -ItemType Directory -Path $AppStage -Force | Out-Null
Push-Location $RepoRoot
try {
    & pnpm --filter @amisimedos/web deploy --ignore-scripts $AppStage
    if ($LASTEXITCODE -ne 0) { throw "pnpm deploy failed ($LASTEXITCODE)" }
} finally { Pop-Location }

# 3. Copy built .next (gitignored, so pnpm deploy skips it). Exclude the dev/cache
#    folders - they are leftover from dev servers / repeated builds, not needed to serve.
Write-Step "3/7 Copy .next production build"
$NextSrc = Join-Path $WebDir ".next"
if (-not (Test-Path (Join-Path $NextSrc "BUILD_ID"))) { throw ".next BUILD_ID not found - run web build first" }
New-Item -ItemType Directory -Path (Join-Path $AppStage ".next") -Force | Out-Null
robocopy $NextSrc (Join-Path $AppStage ".next") /E /XD cache dev /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy .next failed" }

# Refresh runtime entry files from source (they are not part of the compiled app)
Copy-Item -Path (Join-Path $WebDir "server.mjs") -Destination (Join-Path $AppStage "server.mjs") -Force
Copy-Item -Path (Join-Path $WebDir "websocket-server.mjs") -Destination (Join-Path $AppStage "websocket-server.mjs") -Force

# 4. Trim packages that are never imported at runtime by .next/server or the
#    custom server: the mobile/expo/react-native subtree plus build/dev tooling.
Write-Step "4/7 Trim mobile packages"
$PnpmStore = Join-Path $AppStage "node_modules\.pnpm"
$mobilePrefixes = @(
    "^@expo\+", "^expo@", "^expo-", "^expo-router@", "^expo-server@", "^expo-sqlite@",
    "^@react-native\+", "^@react-navigation\+", "^react-native",
    "^metro@", "^metro-", "^hermes-", "^babel-preset-expo@",
    "^turbo-", "^react-devtools-", "^prisma@"
)
$removed = 0
Get-ChildItem $PnpmStore -Directory | Where-Object {
    foreach ($p in $mobilePrefixes) { if ($_.Name -match $p) { return $true } }
    return $false
} | ForEach-Object {
    cmd /c "rmdir /s /q `"$($_.FullName)`" >nul 2>&1"
    $removed++
}
Write-Host "Removed $removed mobile packages"

# 5. Make socket.io resolvable from the app dir (it is only a transitive dep of @amisimedos/chat)
Write-Step "5/7 socket.io junction"
$SocketIo = Get-ChildItem $PnpmStore -Directory -Filter "socket.io@*" | Select-Object -First 1
if (-not $SocketIo) { throw "socket.io not found in .pnpm store" }
$SocketLink = Join-Path (Join-Path $AppStage "node_modules") "socket.io"
if (Test-Path $SocketLink) { Remove-Item $SocketLink -Force -ErrorAction SilentlyContinue }
if (Test-Path $SocketLink) { cmd /c "rmdir /q `"$SocketLink`"" | Out-Null }
cmd /c "mklink /J `"$SocketLink`" `"$($SocketIo.FullName)\node_modules\socket.io`"" | Out-Null
if (-not (Test-Path (Join-Path $SocketLink "package.json"))) { throw "socket.io junction failed" }
Write-Host "socket.io junction created -> $($SocketIo.Name)"

# 6. Runtime assets: portable node, nssm, provisioning CLI + SQL
Write-Step "6/7 Runtime assets"
Remove-Trim $RuntimeStage
New-Item -ItemType Directory -Path $RuntimeStage -Force | Out-Null
$NodeZip = Join-Path $TempRoot "node-v24.18.1-win-x64.zip"
if (Test-Path $NodeZip) {
    if (-not (Test-Path (Join-Path $RuntimeStage "node.exe"))) {
        if (-not (Test-Path (Join-Path $TempRoot "node-runtime"))) {
            Expand-Archive -Path $NodeZip -DestinationPath (Join-Path $TempRoot "node-runtime") -Force
        }
        Copy-Item -Path (Join-Path $TempRoot "node-runtime\node-v24.18.1-win-x64\*") -Destination $RuntimeStage -Recurse -Force
    }
} else {
    throw "portable node zip not found at $NodeZip"
}

Remove-Trim $NssmStage
New-Item -ItemType Directory -Path $NssmStage -Force | Out-Null
Copy-Item -Path (Join-Path $TempRoot "nssm\nssm-2.24\win64\nssm.exe") -Destination (Join-Path $NssmStage "nssm.exe") -Force

if (-not $SkipProvBuild) {
    Remove-Trim $ProvStage
    New-Item -ItemType Directory -Path $ProvStage -Force | Out-Null
    $ProvDist = Join-Path $RepoRoot "tools\local-tenant\dist"
    if (-not (Test-Path (Join-Path $ProvDist "index.js"))) { throw "provisioning dist missing - run tsc in tools/local-tenant" }
    Copy-Item -Path $ProvDist -Destination $ProvStage -Recurse -Force
}

# 7. Summary
Write-Step "7/7 Stage summary"
$files = Get-ChildItem $StageDir -Recurse -File -ErrorAction SilentlyContinue
$totalMB = [math]::Round(($files | Measure-Object Length -Sum).Sum / 1MB, 0)
$appMB = [math]::Round(((Get-ChildItem $AppStage -Recurse -File -ErrorAction SilentlyContinue) | Measure-Object Length -Sum).Sum / 1MB, 0)
Write-Host "Stage: $StageDir"
Write-Host "  app       : $appMB MB (web runtime + node_modules)"
Write-Host "  runtime   : node.exe v24.18.1"
Write-Host "  nssm      : nssm.exe"
Write-Host "  provision : provisioning CLI + SQL"
Write-Host "  TOTAL     : $totalMB MB"
Write-Host "`nDone."
