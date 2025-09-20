# Tareeqa POS Launcher - PowerShell Version
# Multiple ways to run the application

param(
    [string]$Mode = "menu"
)

Write-Host "🚀 Tareeqa POS - Professional Egyptian POS System" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Electron 21.4.4 + React 18+ + TypeScript 5+ + Windows 7+ Compatible" -ForegroundColor Yellow

function Show-Menu {
    Write-Host "`nAvailable launch options:" -ForegroundColor White
    Write-Host "1. 🔥 Development Mode (npm run dev)" -ForegroundColor Green
    Write-Host "2. 🏗️ Build & Run Production (npm run build && npm start)" -ForegroundColor Blue
    Write-Host "3. ⚡ Electron Direct (npx electron .)" -ForegroundColor Magenta
    Write-Host "4. 📦 Install Dependencies (npm install)" -ForegroundColor Yellow
    Write-Host "5. 🧪 Run Tests (npm test)" -ForegroundColor Cyan
    Write-Host "6. 🔧 Build for Windows 7+ (npm run make:win7)" -ForegroundColor Red
    Write-Host "7. 📱 Web Preview (npm run dev:renderer)" -ForegroundColor DarkGreen
    Write-Host "8. 🚪 Exit" -ForegroundColor Gray
    
    $choice = Read-Host "`nEnter your choice (1-8)"
    return $choice
}

function Start-Development {
    Write-Host "`n🔥 Starting Development Mode..." -ForegroundColor Green
    Write-Host "This will start both Vite dev server (port 3000) and Electron" -ForegroundColor Yellow
    
    try {
        npm run dev
    } catch {
        Write-Host "❌ Development mode failed. Trying alternative..." -ForegroundColor Red
        Start-Process "npm" -ArgumentList "run", "dev:renderer" -NoNewWindow
        Start-Sleep 3
        Start-Process "npm" -ArgumentList "run", "dev:electron" -NoNewWindow
    }
}

function Start-Production {
    Write-Host "`n🏗️ Building for Production..." -ForegroundColor Blue
    
    try {
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build successful! Starting application..." -ForegroundColor Green
            npm start
        } else {
            Write-Host "❌ Build failed! Check the errors above." -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Production build failed: $_" -ForegroundColor Red
    }
}

function Start-ElectronDirect {
    Write-Host "`n⚡ Starting Electron directly..." -ForegroundColor Magenta
    
    try {
        npx electron .
    } catch {
        Write-Host "❌ Direct Electron start failed. Trying with main.js..." -ForegroundColor Red
        electron main.js
    }
}

function Install-Dependencies {
    Write-Host "`n📦 Installing Dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Gray
    
    # Clean install
    if (Test-Path "node_modules") {
        Write-Host "🧹 Cleaning old node_modules..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    }
    
    try {
        npm install --no-optional --legacy-peer-deps
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️ Standard install failed, trying with --force..." -ForegroundColor Yellow
            npm install --force
        }
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Installation failed: $_" -ForegroundColor Red
    }
}

function Start-Tests {
    Write-Host "`n🧪 Running Tests..." -ForegroundColor Cyan
    
    try {
        npm test
    } catch {
        Write-Host "❌ Tests failed or Jest not found. Installing test dependencies..." -ForegroundColor Red
        npm install --save-dev jest @testing-library/react @testing-library/jest-dom
        npm test
    }
}

function Build-Windows7 {
    Write-Host "`n🔧 Building for Windows 7+..." -ForegroundColor Red
    Write-Host "This will create installers compatible with Windows 7+" -ForegroundColor Yellow
    
    try {
        npm run make:win7
        Write-Host "✅ Windows 7+ build completed! Check the dist folder." -ForegroundColor Green
    } catch {
        Write-Host "❌ Windows 7+ build failed: $_" -ForegroundColor Red
    }
}

function Start-WebPreview {
    Write-Host "`n📱 Starting Web Preview..." -ForegroundColor DarkGreen
    Write-Host "This will start only the React app in browser (port 3000)" -ForegroundColor Yellow
    
    try {
        npm run dev:renderer
    } catch {
        Write-Host "❌ Web preview failed. Starting Vite directly..." -ForegroundColor Red
        npx vite
    }
}

# Handle command line parameters
switch ($Mode.ToLower()) {
    "dev" { Start-Development; return }
    "prod" { Start-Production; return }
    "electron" { Start-ElectronDirect; return }
    "install" { Install-Dependencies; return }
    "test" { Start-Tests; return }
    "build" { Build-Windows7; return }
    "web" { Start-WebPreview; return }
}

# Interactive menu
do {
    $choice = Show-Menu
    
    switch ($choice) {
        "1" { Start-Development }
        "2" { Start-Production }
        "3" { Start-ElectronDirect }
        "4" { Install-Dependencies }
        "5" { Start-Tests }
        "6" { Build-Windows7 }
        "7" { Start-WebPreview }
        "8" { 
            Write-Host "`n👋 Goodbye!" -ForegroundColor Green
            exit 0 
        }
        default { 
            Write-Host "`n❌ Invalid choice. Please enter 1-8." -ForegroundColor Red 
        }
    }
    
    if ($choice -ne "8") {
        Write-Host "`nPress any key to return to menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
} while ($choice -ne "8")
