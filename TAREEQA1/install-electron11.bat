@echo off
echo 🚀 Installing Tareeqa POS with Electron 11.5.0 for Windows 7 Support
echo ================================================================

REM Clean previous installation
echo 🧹 Cleaning previous installation...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist dist rmdir /s /q dist

REM Set Node.js version compatibility
echo 🔧 Setting Node.js compatibility...
set npm_config_target_platform=win32
set npm_config_arch=x64
set npm_config_target_arch=x64
set npm_config_disturl=https://electronjs.org/headers
set npm_config_runtime=electron
set npm_config_target=11.5.0

REM Install dependencies with specific versions for Electron 11.5.0
echo 📦 Installing compatible dependencies...

REM Install Electron 11.5.0 first
npm install --save-dev electron@11.5.0

REM Install compatible electron-builder
npm install --save-dev electron-builder@22.14.13

REM Install compatible better-sqlite3
npm install --save better-sqlite3@7.6.2

REM Install compatible electron-forge
npm install --save-dev @electron-forge/cli@6.0.5
npm install --save-dev @electron-forge/maker-squirrel@6.0.5
npm install --save-dev @electron-forge/maker-zip@6.0.5

REM Install other dependencies
npm install --save-dev concurrently@7.6.0
npm install --save-dev typescript@4.9.5
npm install --save-dev @types/node@16.18.0

REM Install React and UI dependencies
npm install --save react@18.2.0 react-dom@18.2.0
npm install --save @types/react@18.0.0 @types/react-dom@18.0.0
npm install --save framer-motion@6.5.1
npm install --save clsx@1.2.1
npm install --save tailwind-merge@1.14.0

REM Install i18n dependencies
npm install --save i18next@21.10.0
npm install --save react-i18next@11.18.6
npm install --save i18next-browser-languagedetector@6.1.8

REM Install other core dependencies
npm install --save react-router-dom@6.3.0
npm install --save zustand@4.1.5
npm install --save kysely@0.22.0
npm install --save node-machine-id@1.1.12
npm install --save react-hot-toast@2.4.0
npm install --save lucide-react@0.263.1

echo ✅ Installation completed!
echo 🔧 Building application...

REM Build the application
npm run build

echo 🎉 Tareeqa POS is ready for Windows 7!
echo 📋 Next steps:
echo    1. Run: npm run dev (for development)
echo    2. Run: npm run make (to create installer)
echo    3. Use TareeqaPOS-Setup.nsi with NSIS to create Windows installer

pause
