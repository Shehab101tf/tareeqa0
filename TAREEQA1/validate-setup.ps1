# Tareeqa POS - Setup Validation Script
# This script validates that everything is properly configured and ready to run

Write-Host "🔍 Validating Tareeqa POS Setup..." -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan

$validationResults = @()
$criticalIssues = 0

# Function to add validation result
function Add-ValidationResult {
    param($Test, $Status, $Message, $Critical = $false)
    
    $result = @{
        Test = $Test
        Status = $Status
        Message = $Message
        Critical = $Critical
    }
    
    $script:validationResults += $result
    
    if ($Status -eq "FAIL" -and $Critical) {
        $script:criticalIssues++
    }
    
    $color = switch ($Status) {
        "PASS" { "Green" }
        "WARN" { "Yellow" }
        "FAIL" { "Red" }
        default { "White" }
    }
    
    $icon = switch ($Status) {
        "PASS" { "✅" }
        "WARN" { "⚠️" }
        "FAIL" { "❌" }
        default { "ℹ️" }
    }
    
    Write-Host "$icon $Test`: $Message" -ForegroundColor $color
}

# 1. Node.js Version Check
Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeMajor -ge 16) {
        Add-ValidationResult "Node.js Version" "PASS" "Node.js $nodeVersion (Compatible)" $true
    } else {
        Add-ValidationResult "Node.js Version" "FAIL" "Node.js $nodeVersion (Requires 16.x+)" $true
    }
} catch {
    Add-ValidationResult "Node.js Installation" "FAIL" "Node.js not found or not accessible" $true
}

# 2. NPM Check
try {
    $npmVersion = npm --version
    Add-ValidationResult "NPM Installation" "PASS" "NPM $npmVersion available"
} catch {
    Add-ValidationResult "NPM Installation" "FAIL" "NPM not found" $true
}

# 3. Project Structure Check
Write-Host "`n📁 Validating Project Structure..." -ForegroundColor Yellow

$requiredFiles = @(
    "package.json",
    "tsconfig.json",
    "jest.config.js",
    "playwright.config.ts",
    "tailwind.config.js",
    "index.html",
    "src/types/global.d.ts",
    "src/renderer/App.tsx",
    "src/renderer/index.tsx"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Add-ValidationResult "File: $file" "PASS" "Present"
    } else {
        Add-ValidationResult "File: $file" "FAIL" "Missing" $true
    }
}

# 4. Dependencies Check
Write-Host "`n📦 Checking Dependencies..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Add-ValidationResult "Node Modules" "PASS" "Dependencies installed"
    
    # Check critical packages
    $criticalPackages = @("electron", "react", "react-dom", "typescript", "vite")
    
    foreach ($package in $criticalPackages) {
        $packagePath = "node_modules/$package"
        if (Test-Path $packagePath) {
            Add-ValidationResult "Package: $package" "PASS" "Installed"
        } else {
            Add-ValidationResult "Package: $package" "FAIL" "Missing" $true
        }
    }
} else {
    Add-ValidationResult "Node Modules" "FAIL" "Dependencies not installed - Run npm install" $true
}

# 5. TypeScript Configuration
Write-Host "`n🔧 Validating TypeScript Configuration..." -ForegroundColor Yellow

if (Test-Path "tsconfig.json") {
    try {
        $tsconfig = Get-Content "tsconfig.json" | ConvertFrom-Json
        
        if ($tsconfig.compilerOptions.target -eq "ES2020") {
            Add-ValidationResult "TypeScript Target" "PASS" "ES2020 (Electron 21.x compatible)"
        } else {
            Add-ValidationResult "TypeScript Target" "WARN" "Target: $($tsconfig.compilerOptions.target)"
        }
        
        if ($tsconfig.compilerOptions.jsx -eq "react-jsx") {
            Add-ValidationResult "JSX Configuration" "PASS" "React JSX transform enabled"
        } else {
            Add-ValidationResult "JSX Configuration" "WARN" "JSX: $($tsconfig.compilerOptions.jsx)"
        }
    } catch {
        Add-ValidationResult "TypeScript Config" "FAIL" "Invalid tsconfig.json format"
    }
}

# 6. Testing Framework
Write-Host "`n🧪 Validating Testing Framework..." -ForegroundColor Yellow

$testDirectories = @("tests/unit", "tests/security", "tests/arabic", "tests/performance", "tests/compatibility")

foreach ($dir in $testDirectories) {
    if (Test-Path $dir) {
        $testFiles = Get-ChildItem $dir -Filter "*.test.*" -Recurse
        Add-ValidationResult "Test Directory: $dir" "PASS" "$($testFiles.Count) test files found"
    } else {
        Add-ValidationResult "Test Directory: $dir" "WARN" "Directory not found"
    }
}

# 7. Launch Scripts
Write-Host "`n🚀 Checking Launch Scripts..." -ForegroundColor Yellow

$launchScripts = @(
    "run-app.bat",
    "start-tareeqa.ps1", 
    "quick-install.bat",
    "setup-tareeqa-fixed.ps1"
)

foreach ($script in $launchScripts) {
    if (Test-Path $script) {
        Add-ValidationResult "Launch Script: $script" "PASS" "Available"
    } else {
        Add-ValidationResult "Launch Script: $script" "WARN" "Missing"
    }
}

# 8. Documentation
Write-Host "`n📚 Checking Documentation..." -ForegroundColor Yellow

$docFiles = @("README.md", "LAUNCH-GUIDE.md", "TESTING-COMPLETE.md")

foreach ($doc in $docFiles) {
    if (Test-Path $doc) {
        Add-ValidationResult "Documentation: $doc" "PASS" "Available"
    } else {
        Add-ValidationResult "Documentation: $doc" "WARN" "Missing"
    }
}

# 9. Windows Compatibility
Write-Host "`n🖥️ Checking Windows Compatibility..." -ForegroundColor Yellow

$windowsVersion = [System.Environment]::OSVersion.Version
$isWindows7 = $windowsVersion.Major -eq 6 -and $windowsVersion.Minor -eq 1

if ($isWindows7) {
    Add-ValidationResult "Windows Version" "PASS" "Windows 7 detected - Optimizations will be applied"
    
    # Check for Windows 7 specific requirements
    if (Test-Path "win7.config.js") {
        Add-ValidationResult "Windows 7 Config" "PASS" "Optimization config present"
    } else {
        Add-ValidationResult "Windows 7 Config" "WARN" "Will be created during setup"
    }
} elseif ($windowsVersion.Major -ge 10) {
    Add-ValidationResult "Windows Version" "PASS" "Modern Windows - Full features available"
} else {
    Add-ValidationResult "Windows Version" "PASS" "Windows 8/8.1 - Compatible"
}

# 10. Electron Version Compatibility
Write-Host "`n⚡ Validating Electron Configuration..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        $electronVersion = $packageJson.devDependencies.electron
        
        if ($electronVersion -like "*21.4.4*") {
            Add-ValidationResult "Electron Version" "PASS" "21.4.4 (Windows 7+ compatible)"
        } else {
            Add-ValidationResult "Electron Version" "WARN" "Version: $electronVersion"
        }
    } catch {
        Add-ValidationResult "Package.json" "FAIL" "Cannot read package.json"
    }
}

# Summary Report
Write-Host "`n📊 Validation Summary" -ForegroundColor White
Write-Host "===================" -ForegroundColor White

$passCount = ($validationResults | Where-Object { $_.Status -eq "PASS" }).Count
$warnCount = ($validationResults | Where-Object { $_.Status -eq "WARN" }).Count
$failCount = ($validationResults | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $validationResults.Count

Write-Host "✅ Passed: $passCount/$totalCount" -ForegroundColor Green
Write-Host "⚠️ Warnings: $warnCount/$totalCount" -ForegroundColor Yellow
Write-Host "❌ Failed: $failCount/$totalCount" -ForegroundColor Red

if ($criticalIssues -eq 0) {
    Write-Host "`n🎉 VALIDATION SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Tareeqa POS is ready to launch!" -ForegroundColor White
    
    Write-Host "`n🚀 Recommended Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Run setup-tareeqa-fixed.ps1 (if dependencies not installed)" -ForegroundColor White
    Write-Host "2. Execute: npm run dev (for development)" -ForegroundColor White
    Write-Host "3. Execute: npm run test:all (to run tests)" -ForegroundColor White
    Write-Host "4. Execute: npm run make:win7 (for production build)" -ForegroundColor White
    
} else {
    Write-Host "`n⚠️ CRITICAL ISSUES FOUND: $criticalIssues" -ForegroundColor Red
    Write-Host "Please resolve critical issues before launching." -ForegroundColor White
    
    Write-Host "`n🔧 Suggested Fixes:" -ForegroundColor Yellow
    $criticalFailures = $validationResults | Where-Object { $_.Status -eq "FAIL" -and $_.Critical }
    foreach ($failure in $criticalFailures) {
        Write-Host "- $($failure.Test): $($failure.Message)" -ForegroundColor Red
    }
}

Write-Host "`n📞 Need Help?" -ForegroundColor Cyan
Write-Host "- Check README.md for detailed instructions" -ForegroundColor White
Write-Host "- Review LAUNCH-GUIDE.md for all launch options" -ForegroundColor White
Write-Host "- Run setup-tareeqa-fixed.ps1 for automated setup" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
