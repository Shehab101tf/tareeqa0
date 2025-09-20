@echo off
echo ========================================
echo    TAREEQA POS - COMPREHENSIVE TESTING
echo ========================================
echo.

echo 🧪 Running Tareeqa POS Test Suite
echo Electron 21.x Compatible | Windows 7-11 | Arabic RTL
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check if dependencies are installed
if not exist "node_modules" (
    echo ⚠️ Dependencies not found. Installing...
    npm install --no-optional --legacy-peer-deps
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo 📋 Test Categories Available:
echo 1. Unit Tests (Components, Security, Performance)
echo 2. Arabic RTL Tests
echo 3. Windows Compatibility Tests
echo 4. Integration Tests (Egyptian Market)
echo 5. E2E Tests (Complete Workflows)
echo 6. All Tests (Comprehensive Suite)
echo.

set /p choice="Select test category (1-6): "

if "%choice%"=="1" (
    echo.
    echo 🔧 Running Unit Tests...
    npm run test
) else if "%choice%"=="2" (
    echo.
    echo 🌍 Running Arabic RTL Tests...
    npm run test:arabic
) else if "%choice%"=="3" (
    echo.
    echo 💻 Running Windows Compatibility Tests...
    npm run test:compatibility
) else if "%choice%"=="4" (
    echo.
    echo 🇪🇬 Running Egyptian Market Integration Tests...
    npm run test:integration
) else if "%choice%"=="5" (
    echo.
    echo 🎭 Running E2E Tests...
    npm run test:e2e
) else if "%choice%"=="6" (
    echo.
    echo 🚀 Running ALL Tests (This may take several minutes)...
    echo.
    echo Phase 1: Unit Tests...
    npm run test
    if errorlevel 1 (
        echo ❌ Unit tests failed
        goto :test_summary
    )
    
    echo.
    echo Phase 2: Security Tests...
    npm run test:security
    if errorlevel 1 (
        echo ❌ Security tests failed
        goto :test_summary
    )
    
    echo.
    echo Phase 3: Arabic RTL Tests...
    npm run test:arabic
    if errorlevel 1 (
        echo ❌ Arabic tests failed
        goto :test_summary
    )
    
    echo.
    echo Phase 4: Windows Compatibility Tests...
    npm run test:compatibility
    if errorlevel 1 (
        echo ❌ Compatibility tests failed
        goto :test_summary
    )
    
    echo.
    echo Phase 5: Integration Tests...
    npm run test:integration
    if errorlevel 1 (
        echo ❌ Integration tests failed
        goto :test_summary
    )
    
    echo.
    echo Phase 6: Performance Tests...
    npm run test:performance
    if errorlevel 1 (
        echo ❌ Performance tests failed
        goto :test_summary
    )
    
    echo.
    echo ✅ ALL TESTS PASSED!
    echo 🎉 Tareeqa POS is ready for production!
    
) else (
    echo ❌ Invalid choice. Please select 1-6.
    pause
    exit /b 1
)

:test_summary
echo.
echo ========================================
echo           TEST SUMMARY
echo ========================================
echo.
echo 📊 Test Coverage Information:
echo - Unit Tests: Components, Security, Performance
echo - Arabic RTL: Egyptian localization, RTL layout
echo - Windows: 7, 8, 10, 11 compatibility
echo - Integration: Egyptian business logic, VAT, currency
echo - E2E: Complete POS workflows, hardware integration
echo.
echo 🎯 Quality Standards:
echo - Code Coverage: 70%+ target
echo - Security: SQL injection, XSS prevention
echo - Performance: Windows 7 baseline (8s startup, 200MB RAM)
echo - Arabic: 100% RTL support, Egyptian terminology
echo - Egyptian Market: 14% VAT, ج.م currency, business compliance
echo.

if errorlevel 1 (
    echo ❌ Some tests failed. Please review the output above.
    echo 💡 Common issues:
    echo   - Missing dependencies: Run npm install
    echo   - TypeScript errors: Check src/types/global.d.ts
    echo   - Windows compatibility: Test on target OS version
    echo   - Arabic fonts: Ensure Cairo/Amiri fonts available
) else (
    echo ✅ All selected tests passed successfully!
    echo 🚀 Tareeqa POS meets quality standards for Egyptian retail market
)

echo.
echo 📚 Additional Commands:
echo - npm run test:watch     : Watch mode for development
echo - npm run test:coverage : Generate coverage report
echo - npm run lint          : Check code quality
echo - npm run build:test    : Build and test production version
echo.
pause
