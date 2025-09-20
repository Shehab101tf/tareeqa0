@echo off
echo 🚀 Tareeqa POS Quick Installation - Windows 7+ Compatible
echo ================================================================

echo 🧹 Cleaning previous installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 📦 Installing core dependencies...
call npm install --no-optional --legacy-peer-deps

echo ✅ Installation complete!
echo.
echo 🎯 Available commands:
echo   npm run dev          - Start development mode
echo   npm run build        - Build for production
echo   npm run test         - Run tests
echo   npm start            - Start built application
echo.
pause
