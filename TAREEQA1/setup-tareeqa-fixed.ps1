# Tareeqa POS Setup Script - Windows 7+ Compatible
# This script sets up the complete development environment for Tareeqa POS

Write-Host "🚀 Setting up Tareeqa POS Development Environment..." -ForegroundColor Green
Write-Host "📋 Electron 21.4.4 + React 18+ + TypeScript 5+ + Windows 7+ Compatible" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "`n🔍 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check if Node.js version is compatible (16.x recommended for Windows 7)
    if ($nodeVersion -match "v1[6-9]\." -or $nodeVersion -match "v[2-9][0-9]\.") {
        Write-Host "✅ Node.js version is compatible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Warning: Node.js 16.x LTS is recommended for Windows 7 compatibility" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 16.x LTS first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/en/download/" -ForegroundColor Cyan
    exit 1
}

# Check if npm is available
Write-Host "`n🔍 Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Check Windows version for compatibility
Write-Host "`n🔍 Checking Windows compatibility..." -ForegroundColor Yellow
$windowsVersion = [System.Environment]::OSVersion.Version
Write-Host "Windows version: $($windowsVersion.Major).$($windowsVersion.Minor)" -ForegroundColor Cyan

if ($windowsVersion.Major -eq 6 -and $windowsVersion.Minor -eq 1) {
    Write-Host "✅ Windows 7 detected - Using optimized settings" -ForegroundColor Green
    $isWindows7 = $true
} elseif ($windowsVersion.Major -ge 10) {
    Write-Host "✅ Modern Windows detected - Full features available" -ForegroundColor Green
    $isWindows7 = $false
} else {
    Write-Host "✅ Windows 8/8.1 detected - Compatible" -ForegroundColor Green
    $isWindows7 = $false
}

# Clean previous installations
Write-Host "`n🧹 Cleaning previous installations..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "Removing old node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "✅ Removed old node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "✅ Removed old package-lock.json" -ForegroundColor Green
}

# Clear npm cache
Write-Host "`n🗑️ Clearing npm cache..." -ForegroundColor Yellow
try {
    npm cache clean --force
    Write-Host "✅ npm cache cleared" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not clear npm cache, continuing..." -ForegroundColor Yellow
}

# Install dependencies
Write-Host "`n📦 Installing dependencies (this may take 5-10 minutes)..." -ForegroundColor Yellow
Write-Host "Please be patient while we install all required packages..." -ForegroundColor Gray

try {
    Write-Host "Installing with legacy peer deps..." -ForegroundColor Cyan
    npm install --no-optional --legacy-peer-deps
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Standard install failed, trying with --force..." -ForegroundColor Yellow
    try {
        npm install --force
        Write-Host "✅ Dependencies installed with force!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Installation failed. Please check your internet connection and try again." -ForegroundColor Red
        exit 1
    }
}

# Verify critical dependencies
Write-Host "`n🔍 Verifying critical dependencies..." -ForegroundColor Yellow
$criticalPackages = @("electron", "react", "react-dom", "typescript", "vite")
$allGood = $true

foreach ($package in $criticalPackages) {
    try {
        $version = npm list $package --depth=0 2>$null | Select-String $package
        if ($version) {
            Write-Host "✅ $package is installed" -ForegroundColor Green
        } else {
            Write-Host "❌ $package is missing" -ForegroundColor Red
            $allGood = $false
        }
    } catch {
        Write-Host "❌ $package verification failed" -ForegroundColor Red
        $allGood = $false
    }
}

# Setup Windows 7 specific optimizations
if ($isWindows7) {
    Write-Host "`n🔧 Applying Windows 7 optimizations..." -ForegroundColor Yellow
    
    # Create Windows 7 specific configuration
    $win7Config = @"
// Windows 7 Optimization Settings
module.exports = {
  target: 'es2020',
  legacy: true,
  optimizations: {
    animations: 'reduced',
    effects: 'fallback',
    performance: 'optimized'
  }
};
"@
    
    $win7Config | Out-File -FilePath "win7.config.js" -Encoding UTF8
    Write-Host "✅ Windows 7 optimizations applied" -ForegroundColor Green
}

# Create desktop shortcuts
Write-Host "`n🖥️ Creating desktop shortcuts..." -ForegroundColor Yellow
try {
    $WshShell = New-Object -comObject WScript.Shell
    $desktopPath = [System.Environment]::GetFolderPath('Desktop')
    
    # Development shortcut
    $devShortcut = $WshShell.CreateShortcut("$desktopPath\Tareeqa POS (Dev).lnk")
    $devShortcut.TargetPath = "cmd.exe"
    $devShortcut.Arguments = "/c cd /d `"$PWD`" && npm run dev"
    $devShortcut.WorkingDirectory = $PWD
    $devShortcut.Description = "Start Tareeqa POS in Development Mode"
    $devShortcut.Save()
    
    # Production shortcut
    $prodShortcut = $WshShell.CreateShortcut("$desktopPath\Tareeqa POS.lnk")
    $prodShortcut.TargetPath = "cmd.exe"
    $prodShortcut.Arguments = "/c cd /d `"$PWD`" && npm start"
    $prodShortcut.WorkingDirectory = $PWD
    $prodShortcut.Description = "Start Tareeqa POS"
    $prodShortcut.Save()
    
    Write-Host "✅ Desktop shortcuts created" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not create desktop shortcuts" -ForegroundColor Yellow
}

# Final status report
Write-Host "`n📊 Installation Summary" -ForegroundColor White
Write-Host "======================" -ForegroundColor White

if ($allGood) {
    Write-Host "✅ All critical dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some dependencies may have issues, but installation completed" -ForegroundColor Yellow
}

Write-Host "`n🎯 Available Commands:" -ForegroundColor Cyan
Write-Host "  npm run dev          - Start development mode" -ForegroundColor White
Write-Host "  npm run build        - Build for production" -ForegroundColor White
Write-Host "  npm start            - Start built application" -ForegroundColor White
Write-Host "  npm run make:win7    - Build Windows 7+ installer" -ForegroundColor White
Write-Host "  npm test             - Run tests" -ForegroundColor White

Write-Host "`n🚀 Quick Launch Options:" -ForegroundColor Cyan
Write-Host "  run-app.bat          - Interactive launcher" -ForegroundColor White
Write-Host "  start-tareeqa.ps1    - PowerShell launcher" -ForegroundColor White
Write-Host "  Desktop shortcuts    - Created on your desktop" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "  README.md            - Full project overview" -ForegroundColor White
Write-Host "  LAUNCH-GUIDE.md      - All launch methods" -ForegroundColor White

if ($isWindows7) {
    Write-Host "`n🔧 Windows 7 Optimizations Applied:" -ForegroundColor Yellow
    Write-Host "  - Reduced animations for better performance" -ForegroundColor White
    Write-Host "  - Glass effect fallbacks enabled" -ForegroundColor White
    Write-Host "  - Optimized for older hardware" -ForegroundColor White
}

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "Tareeqa POS is ready to run. Choose any launch method above." -ForegroundColor White
Write-Host "`nFor first-time users, we recommend:" -ForegroundColor Cyan
Write-Host "  1. Run npm run dev to start in development mode" -ForegroundColor White
Write-Host "  2. Test the application thoroughly" -ForegroundColor White
Write-Host "  3. Run npm run make:win7 to create installer" -ForegroundColor White

Write-Host "`n🏪 Tareeqa POS - Professional Egyptian Point of Sale System" -ForegroundColor Green
Write-Host "Ready for Egyptian retail businesses!" -ForegroundColor Cyan

# Pause to show results
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
