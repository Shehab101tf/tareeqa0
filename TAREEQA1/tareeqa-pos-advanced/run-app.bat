@echo off
echo.
echo ========================================
echo    🏪 TAREEQA POS - نظام نقطة البيع المصري
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not available
    echo Please ensure npm is installed with Node.js
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    echo This may take a few minutes on first run...
    echo.
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
    echo.
)

:: Check if dist folder exists, if not build the app
if not exist "dist" (
    echo 🔨 Building application...
    echo.
    call npm run build
    if errorlevel 1 (
        echo ❌ Failed to build application
        pause
        exit /b 1
    )
    echo ✅ Application built successfully
    echo.
)

:: Start the application
echo 🚀 Starting Tareeqa POS...
echo.
echo Features:
echo   • Professional Glass Morphism UI
echo   • Complete Arabic RTL Support
echo   • Egyptian Business Compliance (14%% VAT)
echo   • Hardware Integration (Scanners, Printers)
echo   • Advanced Security & User Management
echo   • Multi-Payment Methods Support
echo.
echo Press Ctrl+C to stop the application
echo.

:: Run in development mode
call npm run dev

echo.
echo 👋 Tareeqa POS has been closed
pause
