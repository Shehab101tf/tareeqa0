@echo off
title Tareeqa POS - Quick Setup for Windows 7
color 0B

echo.
echo ========================================================
echo 🚀 TAREEQA POS - QUICK SETUP FOR WINDOWS 7
echo ========================================================
echo.
echo This script will:
echo  1. Install Electron 11.5.0 (Windows 7 compatible)
echo  2. Install all required dependencies
echo  3. Build the application
echo  4. Create Windows installer
echo.

set /p continue="Continue? (Y/N): "
if /i not "%continue%"=="Y" (
    echo Setup cancelled.
    pause
    exit /b 0
)

echo.
echo 🧹 Step 1: Cleaning previous installation...
if exist node_modules (
    echo    Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo    Removing package-lock.json...
    del package-lock.json
)
if exist dist (
    echo    Removing dist folder...
    rmdir /s /q dist
)

echo ✅ Cleanup completed!
echo.

echo 📦 Step 2: Installing Electron 11.5.0 and dependencies...
echo    This may take several minutes...

REM Set npm configuration for Electron 11.5.0
npm config set target_platform win32
npm config set target_arch x64
npm config set runtime electron
npm config set target 11.5.0
npm config set disturl https://electronjs.org/headers

REM Install core dependencies
echo    Installing Electron 11.5.0...
call npm install --save-dev electron@11.5.0
if errorlevel 1 goto :error

echo    Installing Electron Builder...
call npm install --save-dev electron-builder@22.14.13
if errorlevel 1 goto :error

echo    Installing compatible SQLite...
call npm install --save better-sqlite3@7.6.2
if errorlevel 1 goto :error

echo    Installing development tools...
call npm install --save-dev concurrently@7.6.0 typescript@4.9.5
if errorlevel 1 goto :error

echo    Installing React and UI libraries...
call npm install --save react@18.2.0 react-dom@18.2.0
call npm install --save-dev @types/react@18.0.0 @types/react-dom@18.0.0
call npm install --save framer-motion@6.5.1 clsx@1.2.1
if errorlevel 1 goto :error

echo    Installing internationalization...
call npm install --save i18next@21.10.0 react-i18next@11.18.6
if errorlevel 1 goto :error

echo    Installing other dependencies...
call npm install --save react-router-dom@6.3.0 zustand@4.1.5
call npm install --save kysely@0.22.0 node-machine-id@1.1.12
call npm install --save react-hot-toast@2.4.0 lucide-react@0.263.1
if errorlevel 1 goto :error

echo ✅ Dependencies installed successfully!
echo.

echo 🔨 Step 3: Building application...
call npm run build
if errorlevel 1 goto :error

echo ✅ Application built successfully!
echo.

echo 📦 Step 4: Creating Windows installer...
call build-installer.bat
if errorlevel 1 goto :error

echo.
echo ========================================================
echo 🎉 SETUP COMPLETED SUCCESSFULLY!
echo ========================================================
echo.
echo 📁 Files created:
echo    ✅ TareeqaPOS-Setup.exe (Windows Installer)
echo    ✅ dist/ (Application files)
echo    ✅ node_modules/ (Dependencies)
echo.
echo 🎯 Ready for Egyptian Business:
echo    ✅ Windows 7 Compatible
echo    ✅ Arabic RTL Interface
echo    ✅ Egyptian Pound Support
echo    ✅ Offline POS Operations
echo    ✅ Professional Security
echo.
echo 🚀 Next Steps:
echo    1. Test: Run TareeqaPOS-Setup.exe
echo    2. Deploy: Copy installer to target computers
echo    3. Develop: Use 'npm run dev' for development
echo.
goto :end

:error
echo.
echo ❌ ERROR: Setup failed!
echo.
echo 🔧 Troubleshooting:
echo    1. Check internet connection
echo    2. Run as Administrator
echo    3. Install Visual Studio Build Tools
echo    4. Try running: npm cache clean --force
echo.
pause
exit /b 1

:end
echo Press any key to exit...
pause >nul
