@echo off
title Tareeqa POS - Windows 7 Builder
color 0A

echo.
echo ========================================================
echo 🚀 TAREEQA POS - WINDOWS 7 BUILDER
echo ========================================================
echo.
echo Building with Electron 22.3.27 for Windows 7 support
echo.

REM Navigate to project directory
cd /d "C:\Users\ASUS\Desktop\TAREEQA1"

echo 📦 Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!
echo.

echo 🔨 Step 2: Building application...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Application built successfully!
echo.

echo 📦 Step 3: Creating Windows 7 installers...
call npm run make:win7
if errorlevel 1 (
    echo ❌ Installer creation failed
    pause
    exit /b 1
)

echo ✅ Installers created successfully!
echo.

echo ========================================================
echo 🎉 BUILD COMPLETED SUCCESSFULLY!
echo ========================================================
echo.
echo 📁 Output files created:
echo.
if exist "dist\TareeqaPOS-1.0.0-ia32.exe" (
    echo    ✅ TareeqaPOS-1.0.0-ia32.exe          (32-bit installer for Win7)
    for %%A in ("dist\TareeqaPOS-1.0.0-ia32.exe") do echo       Size: %%~zA bytes
)
if exist "dist\TareeqaPOS-1.0.0-x64.exe" (
    echo    ✅ TareeqaPOS-1.0.0-x64.exe           (64-bit installer for Win7+)
    for %%A in ("dist\TareeqaPOS-1.0.0-x64.exe") do echo       Size: %%~zA bytes
)
if exist "dist\TareeqaPOS-1.0.0-Portable-ia32.exe" (
    echo    ✅ TareeqaPOS-1.0.0-Portable-ia32.exe (32-bit portable)
    for %%A in ("dist\TareeqaPOS-1.0.0-Portable-ia32.exe") do echo       Size: %%~zA bytes
)
if exist "dist\TareeqaPOS-1.0.0-Portable-x64.exe" (
    echo    ✅ TareeqaPOS-1.0.0-Portable-x64.exe  (64-bit portable)
    for %%A in ("dist\TareeqaPOS-1.0.0-Portable-x64.exe") do echo       Size: %%~zA bytes
)

echo.
echo 🎯 Egyptian Business Ready Features:
echo    ✅ Windows 7 Support (Electron 22.3.27)
echo    ✅ Arabic RTL Interface
echo    ✅ Egyptian Pound Currency
echo    ✅ Offline POS Functionality
echo    ✅ Professional Glass Morphism UI
echo    ✅ Hardware Integration Ready
echo    ✅ SQLCipher Database Encryption
echo    ✅ License Management System
echo.
echo 📋 Deployment Instructions:
echo    1. Copy installer files to target computers
echo    2. Run as Administrator on Windows 7+ systems
echo    3. Choose 32-bit for older systems, 64-bit for modern ones
echo    4. Portable versions need no installation
echo.
echo 🔧 System Requirements:
echo    - Windows 7 SP1 or higher
echo    - 2GB RAM minimum (4GB recommended)
echo    - 500MB free disk space
echo    - Administrator privileges for installation
echo.

pause
