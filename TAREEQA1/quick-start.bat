@echo off
echo ========================================
echo    TAREEQA POS - Quick Start Launcher
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Starting Tareeqa POS without native dependencies...
echo This will use a simplified database setup.
echo.

REM Set environment variable to skip native compilation
set ELECTRON_SKIP_BINARY_DOWNLOAD=1
set npm_config_build_from_source=false

REM Start the application directly
echo Starting Electron application...
node_modules\.bin\electron . 2>nul

if errorlevel 1 (
    echo.
    echo Trying alternative startup method...
    npm run dev:electron 2>nul
)

if errorlevel 1 (
    echo.
    echo ERROR: Could not start the application
    echo Please run 'npm install --force' first
    pause
)
