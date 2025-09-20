@echo off
echo ========================================
echo    TAREEQA POS - Diagnostic Launcher
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
echo Checking main.js file...
if not exist "main.js" (
    echo ERROR: main.js not found
    echo Are you in the correct directory?
    pause
    exit /b 1
)
echo main.js found

echo.
echo Checking node_modules...
if not exist "node_modules" (
    echo WARNING: node_modules not found
    echo Installing dependencies...
    npm install --no-optional --legacy-peer-deps
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)
echo node_modules found

echo.
echo Checking Electron...
if not exist "node_modules\.bin\electron.cmd" (
    echo WARNING: Electron not found
    echo Installing Electron...
    npm install electron@21.4.4 --save-dev
    if errorlevel 1 (
        echo ERROR: Failed to install Electron
        pause
        exit /b 1
    )
)
echo Electron found

echo.
echo ========================================
echo    STARTING TAREEQA POS
echo ========================================
echo.

echo Method 1: Direct Electron execution...
echo Starting: node_modules\.bin\electron.cmd .
start "Tareeqa POS" node_modules\.bin\electron.cmd .

echo.
echo Waiting 5 seconds to check if application started...
timeout /t 5 /nobreak >nul

echo.
echo If the application window appeared, you're all set!
echo If not, trying alternative method...

echo.
echo Method 2: NPM Start...
echo Starting: npm start
npm start

echo.
echo Method 3: Node + Electron CLI...
echo Starting: node node_modules\electron\cli.js .
node node_modules\electron\cli.js .

echo.
echo ========================================
echo    TROUBLESHOOTING INFO
echo ========================================
echo Current Directory: %CD%
echo Node Version: 
node --version
echo.
echo If none of the methods worked, try:
echo 1. npm run dev
echo 2. npm install --force
echo 3. Check Windows Task Manager for electron.exe
echo.
pause
