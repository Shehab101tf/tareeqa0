@echo off
title Tareeqa POS - Windows 7 Installer Builder
color 0A

echo.
echo ========================================================
echo 🚀 TAREEQA POS - WINDOWS 7 INSTALLER BUILDER
echo ========================================================
echo.

REM Check if NSIS is installed
echo 🔍 Checking for NSIS installation...
if exist "C:\Program Files (x86)\NSIS\makensis.exe" (
    set NSIS_PATH="C:\Program Files (x86)\NSIS\makensis.exe"
    echo ✅ NSIS found at: C:\Program Files (x86)\NSIS\
) else if exist "C:\Program Files\NSIS\makensis.exe" (
    set NSIS_PATH="C:\Program Files\NSIS\makensis.exe"
    echo ✅ NSIS found at: C:\Program Files\NSIS\
) else (
    echo ❌ NSIS not found!
    echo.
    echo 📥 Please download and install NSIS from:
    echo    https://nsis.sourceforge.io/Download
    echo.
    echo 🔧 After installation, run this script again.
    pause
    exit /b 1
)

echo.
echo 🏗️ Building Tareeqa POS Application...
echo ========================================

REM Clean previous builds
if exist dist rmdir /s /q dist
if exist packages rmdir /s /q packages

REM Install dependencies if needed
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Build the application
echo 🔨 Building application...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Application built successfully!
echo.

REM Create installer directory structure
echo 📁 Preparing installer files...
mkdir installer 2>nul
mkdir installer\dist 2>nul
mkdir installer\resources 2>nul

REM Copy built files
echo 📋 Copying application files...
xcopy /E /I /Y dist installer\dist
if exist resources xcopy /E /I /Y resources installer\resources

REM Create a simple icon if it doesn't exist
if not exist installer\resources\icon.ico (
    echo 🎨 Creating default icon...
    echo. > installer\resources\icon.ico
)

REM Create the NSIS installer script
echo 📝 Creating installer script...
(
echo ; Tareeqa POS Installer - Auto-generated
echo !include "MUI2.nsh"
echo !include "x64.nsh"
echo !include "WinVer.nsh"
echo.
echo Name "Tareeqa POS"
echo OutFile "TareeqaPOS-Setup.exe"
echo InstallDir "$PROGRAMFILES\Tareeqa POS"
echo RequestExecutionLevel admin
echo.
echo ; Modern UI Configuration
echo !define MUI_ABORTWARNING
echo !define MUI_ICON "resources\icon.ico"
echo.
echo ; Pages
echo !insertmacro MUI_PAGE_WELCOME
echo !insertmacro MUI_PAGE_DIRECTORY
echo !insertmacro MUI_PAGE_INSTFILES
echo !insertmacro MUI_PAGE_FINISH
echo.
echo !insertmacro MUI_UNPAGE_WELCOME
echo !insertmacro MUI_UNPAGE_CONFIRM
echo !insertmacro MUI_UNPAGE_INSTFILES
echo.
echo ; Languages
echo !insertmacro MUI_LANGUAGE "English"
echo !insertmacro MUI_LANGUAGE "Arabic"
echo.
echo ; Check Windows Version
echo Function .onInit
echo   ${IfNot} ${AtLeastWin7}
echo     MessageBox MB_ICONSTOP "This software requires Windows 7 or later."
echo     Abort
echo   ${EndIf}
echo FunctionEnd
echo.
echo ; Installation Section
echo Section "Install"
echo   SetOutPath "$INSTDIR"
echo   File /r "dist\*.*"
echo   
echo   ; Create shortcuts
echo   CreateDirectory "$SMPROGRAMS\Tareeqa POS"
echo   CreateShortCut "$SMPROGRAMS\Tareeqa POS\Tareeqa POS.lnk" "$INSTDIR\TareeqaPOS.exe"
echo   CreateShortCut "$DESKTOP\Tareeqa POS.lnk" "$INSTDIR\TareeqaPOS.exe"
echo   
echo   ; Registry entries
echo   WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TareeqaPOS" "DisplayName" "Tareeqa POS"
echo   WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TareeqaPOS" "UninstallString" "$INSTDIR\Uninstall.exe"
echo   
echo   ; Windows 7 compatibility
echo   WriteRegStr HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" "$INSTDIR\TareeqaPOS.exe" "WIN7RTM HIGHDPIAWARE"
echo   
echo   WriteUninstaller "$INSTDIR\Uninstall.exe"
echo SectionEnd
echo.
echo ; Uninstaller
echo Section "Uninstall"
echo   Delete "$INSTDIR\*.*"
echo   RMDir /r "$INSTDIR"
echo   Delete "$SMPROGRAMS\Tareeqa POS\*.*"
echo   RMDir "$SMPROGRAMS\Tareeqa POS"
echo   Delete "$DESKTOP\Tareeqa POS.lnk"
echo   DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TareeqaPOS"
echo   DeleteRegValue HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" "$INSTDIR\TareeqaPOS.exe"
echo SectionEnd
) > installer\TareeqaPOS.nsi

echo ✅ Installer script created!
echo.

REM Compile the installer
echo 🔧 Compiling installer with NSIS...
cd installer
%NSIS_PATH% TareeqaPOS.nsi
if errorlevel 1 (
    echo ❌ NSIS compilation failed
    cd ..
    pause
    exit /b 1
)
cd ..

REM Move the installer to the root directory
if exist installer\TareeqaPOS-Setup.exe (
    move installer\TareeqaPOS-Setup.exe .
    echo ✅ Installer created successfully!
) else (
    echo ❌ Installer creation failed
    pause
    exit /b 1
)

echo.
echo ========================================================
echo 🎉 SUCCESS! Tareeqa POS Installer Ready
echo ========================================================
echo.
echo 📦 Output file: TareeqaPOS-Setup.exe
echo 📁 Size: 
for %%A in (TareeqaPOS-Setup.exe) do echo    %%~zA bytes
echo.
echo 🎯 Egyptian Business Ready Features:
echo    ✅ Windows 7 Support
echo    ✅ Arabic RTL Interface  
echo    ✅ Egyptian Pound Currency
echo    ✅ Offline POS Functionality
echo    ✅ SQLCipher Database Encryption
echo    ✅ Hardware Fingerprinting
echo    ✅ Professional Glass Morphism UI
echo.
echo 📋 Installation Instructions:
echo    1. Copy TareeqaPOS-Setup.exe to target computer
echo    2. Run as Administrator
echo    3. Follow installation wizard
echo    4. Launch from Desktop or Start Menu
echo.
echo 🔧 System Requirements:
echo    - Windows 7 SP1 or higher
echo    - 2GB RAM minimum
echo    - 500MB free disk space
echo    - Administrator privileges for installation
echo.

REM Clean up temporary files
echo 🧹 Cleaning up temporary files...
rmdir /s /q installer 2>nul

echo ✅ Build process completed successfully!
echo.
pause
