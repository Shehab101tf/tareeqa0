@echo off
echo ========================================
echo    TAREEQA POS - Fixed Blue Screen
echo ========================================
echo.

echo Starting Tareeqa POS with working HTML file...
echo This will load the standalone version that works properly.
echo.

REM Try direct electron execution
echo Method 1: Direct Electron...
if exist "node_modules\.bin\electron.cmd" (
    echo Found Electron, starting application...
    start "Tareeqa POS" node_modules\.bin\electron.cmd .
    echo.
    echo Application should be starting...
    echo If you see the POS interface, you're all set!
    echo If you still see a blue screen, try Method 2.
    echo.
    pause
) else (
    echo Electron not found in node_modules\.bin\
    echo Trying alternative method...
)

echo.
echo Method 2: NPM Start...
npm start

echo.
echo Method 3: Alternative Electron path...
if exist "node_modules\electron\dist\electron.exe" (
    start "Tareeqa POS" node_modules\electron\dist\electron.exe .
) else (
    echo Electron executable not found.
    echo Please run: npm install electron@21.4.4 --save-dev
)

echo.
echo If none of the methods work, you can:
echo 1. Double-click tareeqa-pos-standalone.html to run in browser
echo 2. Run: npm install --force
echo 3. Check if Node.js is properly installed
echo.
pause
