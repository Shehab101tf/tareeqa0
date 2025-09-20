@echo off
echo 🚀 Tareeqa POS - Multiple Launch Options
echo ========================================

:menu
echo.
echo Choose how to run Tareeqa POS:
echo 1. Development Mode (Hot Reload)
echo 2. Production Build and Run
echo 3. Electron Only (Skip Vite)
echo 4. Install Dependencies First
echo 5. Run Tests
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto prod
if "%choice%"=="3" goto electron
if "%choice%"=="4" goto install
if "%choice%"=="5" goto test
if "%choice%"=="6" goto exit

:dev
echo 🔥 Starting Development Mode...
echo This will start both Vite dev server and Electron
call npm run dev
goto menu

:prod
echo 🏗️ Building for Production...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed! Check the errors above.
    pause
    goto menu
)
echo ✅ Build successful! Starting application...
call npm start
goto menu

:electron
echo ⚡ Starting Electron directly...
call npx electron .
goto menu

:install
echo 📦 Installing/Updating Dependencies...
call npm install --no-optional --legacy-peer-deps
if errorlevel 1 (
    echo ❌ Installation failed! Trying alternative method...
    call npm install --force
)
echo ✅ Dependencies installed!
goto menu

:test
echo 🧪 Running Tests...
call npm test
goto menu

:exit
echo 👋 Goodbye!
exit /b 0
