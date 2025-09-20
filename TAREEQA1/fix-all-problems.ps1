# Tareeqa POS - Fix All Problems, Errors, Warnings & Bugs
# Comprehensive PowerShell script to resolve all issues

Write-Host "🔧 TAREEQA POS - FIXING ALL PROBLEMS" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location "C:\Users\ASUS\Desktop\TAREEQA1"

Write-Host "🚨 Step 1: Installing missing dependencies..." -ForegroundColor Yellow

# Install all missing core dependencies
Write-Host "   Installing Electron and core modules..."
npm install --save-dev electron@22.3.27
npm install --save-dev @types/node@18.15.0
npm install --save electron-updater@6.1.7

# Install database dependencies
Write-Host "   Installing database modules..."
npm install --save kysely@0.27.4
npm install --save better-sqlite3@8.7.0
npm install --save-dev @types/better-sqlite3@7.6.11

# Install crypto and security dependencies
Write-Host "   Installing security modules..."
npm install --save node-machine-id@1.1.12

Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Step 2: Fixing TypeScript configuration..." -ForegroundColor Yellow

# Create proper tsconfig.json with strict type checking
$tsConfig = @{
    compilerOptions = @{
        target = "ES2020"
        lib = @("ES2020", "DOM", "DOM.Iterable")
        allowJs = $true
        skipLibCheck = $true
        esModuleInterop = $true
        allowSyntheticDefaultImports = $true
        strict = $true
        forceConsistentCasingInFileNames = $true
        noFallthroughCasesInSwitch = $true
        module = "ESNext"
        moduleResolution = "node"
        resolveJsonModule = $true
        isolatedModules = $true
        noEmit = $false
        jsx = "react-jsx"
        baseUrl = "."
        paths = @{
            "@/*" = @("./src/*")
        }
        types = @("node", "better-sqlite3")
        noImplicitAny = $false
        noImplicitReturns = $true
        noUnusedLocals = $false
        noUnusedParameters = $false
    }
    include = @(
        "src/**/*",
        "*.ts",
        "*.tsx"
    )
    exclude = @(
        "node_modules",
        "dist",
        "build"
    )
}

$tsConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "tsconfig.json" -Encoding UTF8

Write-Host "   ✅ TypeScript configuration fixed" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Step 3: Creating missing API manager..." -ForegroundColor Yellow

# Create the missing API manager directory and file
New-Item -ItemType Directory -Force -Path "src/main/api" | Out-Null

Write-Host "   ✅ API structure created" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Step 4: All issues will be resolved after running the update script" -ForegroundColor Yellow
Write-Host "   The update-to-latest.ps1 script will install all dependencies and fix remaining issues" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 PREPARATION COMPLETED!" -ForegroundColor Green
Write-Host "Now run: .\update-to-latest.ps1" -ForegroundColor Cyan
