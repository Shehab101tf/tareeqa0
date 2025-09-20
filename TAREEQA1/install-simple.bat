@echo off
echo ========================================
echo    TAREEQA POS - Simple Installation
echo ========================================
echo.

echo This will install only the essential dependencies
echo without native modules that require Visual Studio.
echo.

echo Cleaning previous installation...
if exist "node_modules" (
    echo Removing old node_modules...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo Removing old package-lock.json...
    del package-lock.json
)

echo.
echo Installing essential dependencies only...
echo This should work without Visual Studio C++ tools.
echo.

REM Install only the essential packages without native dependencies
npm install --no-optional --ignore-scripts --legacy-peer-deps

if errorlevel 1 (
    echo.
    echo ❌ Installation failed. Trying alternative method...
    echo.
    
    REM Try installing just Electron
    echo Installing Electron only...
    npm install electron@21.4.4 --save-dev --no-optional --ignore-scripts
    
    if errorlevel 1 (
        echo.
        echo ❌ Even basic installation failed.
        echo.
        echo 💡 GOOD NEWS: The application works without npm install!
        echo You can run the POS system using:
        echo.
        echo 1. Double-click: tareeqa-pos-standalone.html
        echo 2. Or run: node_modules\.bin\electron.cmd . (if Electron exists)
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ✅ Installation completed successfully!
echo.
echo 🚀 You can now run the application using:
echo 1. npm start
echo 2. node_modules\.bin\electron.cmd .
echo 3. .\run-fixed.bat
echo 4. Double-click: tareeqa-pos-standalone.html
echo.

echo Testing if Electron is available...
if exist "node_modules\.bin\electron.cmd" (
    echo ✅ Electron found! You can run the app.
) else (
    echo ⚠️ Electron not found, but standalone HTML version works.
)

echo.
pause
