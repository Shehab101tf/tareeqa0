# Tareeqa POS - PowerShell Launcher with Diagnostics
Write-Host "🚀 Tareeqa POS - PowerShell Launcher" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    pause
    exit 1
}

# Check if we're in the right directory
Write-Host "Checking directory..." -ForegroundColor Yellow
if (Test-Path "main.js") {
    Write-Host "✅ Found main.js" -ForegroundColor Green
} else {
    Write-Host "❌ main.js not found. Are you in the right directory?" -ForegroundColor Red
    pause
    exit 1
}

# Check if node_modules exists
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules found" -ForegroundColor Green
} else {
    Write-Host "⚠️ node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install --no-optional --legacy-peer-deps
}

# Check for Electron
Write-Host "Checking Electron..." -ForegroundColor Yellow
if (Test-Path "node_modules\.bin\electron.cmd") {
    Write-Host "✅ Electron found" -ForegroundColor Green
} else {
    Write-Host "⚠️ Electron not found. Installing..." -ForegroundColor Yellow
    npm install electron@21.4.4 --save-dev
}

Write-Host ""
Write-Host "🎯 Starting Tareeqa POS..." -ForegroundColor Cyan
Write-Host ""

# Try multiple methods to start the application
$methods = @(
    @{ Name = "Direct Electron"; Command = "node_modules\.bin\electron.cmd ." },
    @{ Name = "NPM Start"; Command = "npm start" },
    @{ Name = "Node + Electron"; Command = "node node_modules\electron\cli.js ." }
)

foreach ($method in $methods) {
    Write-Host "Trying method: $($method.Name)" -ForegroundColor Yellow
    try {
        # Start the process and wait a bit to see if it stays running
        $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $method.Command -PassThru -WindowStyle Hidden
        Start-Sleep -Seconds 3
        
        if (!$process.HasExited) {
            Write-Host "✅ Application started successfully with $($method.Name)!" -ForegroundColor Green
            Write-Host "Check your taskbar for the Tareeqa POS window." -ForegroundColor Green
            Write-Host "Press any key to exit this launcher..." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            exit 0
        } else {
            Write-Host "❌ Method $($method.Name) failed (process exited)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Method $($method.Name) failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔧 Troubleshooting Information:" -ForegroundColor Yellow
Write-Host "- Current Directory: $(Get-Location)" -ForegroundColor White
Write-Host "- Node.js Version: $nodeVersion" -ForegroundColor White
Write-Host "- PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor White

if (Test-Path "node_modules\electron\package.json") {
    $electronPkg = Get-Content "node_modules\electron\package.json" | ConvertFrom-Json
    Write-Host "- Electron Version: $($electronPkg.version)" -ForegroundColor White
}

Write-Host ""
Write-Host "💡 Manual alternatives:" -ForegroundColor Cyan
Write-Host "1. Try: npm run dev" -ForegroundColor White
Write-Host "2. Try: npm install --force" -ForegroundColor White
Write-Host "3. Try: node main.js (if you have Electron globally)" -ForegroundColor White
Write-Host ""

pause
