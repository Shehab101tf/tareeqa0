# 🚀 Tareeqa POS - Complete Launch Guide

## 🎯 Multiple Ways to Run the Application

### 🔥 Method 1: Interactive Launchers (Recommended)

#### Windows Batch File
```cmd
# Double-click or run in Command Prompt
run-app.bat
```

#### PowerShell Script
```powershell
# Right-click → Run with PowerShell, or:
.\start-tareeqa.ps1

# With parameters:
.\start-tareeqa.ps1 -Mode dev      # Development mode
.\start-tareeqa.ps1 -Mode prod     # Production mode
.\start-tareeqa.ps1 -Mode install  # Install dependencies
```

### 📦 Method 2: Quick Installation
```cmd
# Run the quick installer first
quick-install.bat

# Then use any launch method
```

### ⚡ Method 3: Direct NPM Commands

#### Development Mode (Hot Reload)
```bash
npm run dev
# Starts both Vite dev server (port 3000) and Electron
```

#### Production Build & Run
```bash
npm run build
npm start
```

#### Web Preview Only
```bash
npm run dev:renderer
# Opens in browser at http://localhost:3000
```

#### Electron Only
```bash
npm run dev:electron
# Or directly:
npx electron .
```

### 🔧 Method 4: Manual Step-by-Step

#### Step 1: Install Dependencies
```bash
# Clean install (recommended)
npm install --no-optional --legacy-peer-deps

# If that fails, try:
npm install --force
```

#### Step 2: Choose Launch Method
```bash
# Development (recommended for testing)
npm run dev

# Production (for final testing)
npm run build && npm start

# Direct Electron (if npm scripts fail)
electron .
```

### 🏗️ Method 5: Build Distributables

#### Windows 7+ Compatible Build
```bash
npm run make:win7
# Creates installers in dist/ folder
```

#### Standard Build
```bash
npm run build:electron
```

## 🧪 Testing the Application

### Run All Tests
```bash
npm run test:all
```

### Individual Test Suites
```bash
npm test                    # Unit tests (Jest)
npm run test:e2e           # E2E tests (Playwright)
npm run test:security      # Security tests
npm run test:arabic        # Arabic/RTL tests
npm run test:compatibility # Windows 7 compatibility
npm run test:performance   # Performance benchmarks
```

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. Dependencies Not Installing
```bash
# Solution 1: Clean install
rm -rf node_modules package-lock.json
npm install --no-optional --legacy-peer-deps

# Solution 2: Force install
npm install --force

# Solution 3: Use quick installer
quick-install.bat
```

#### 2. Electron Not Starting
```bash
# Solution 1: Direct Electron
npx electron .

# Solution 2: Check main file
electron main.js

# Solution 3: Rebuild native modules
npm run rebuild
```

#### 3. Vite Build Errors
```bash
# Solution 1: Clear cache
npm run clean
npm run build

# Solution 2: Skip type checking
npm run build -- --mode development

# Solution 3: Use legacy build
npx vite build --legacy
```

#### 4. Windows 7 Compatibility Issues
```bash
# Ensure correct Electron version
npm install --save-exact electron@21.4.4

# Check .NET Framework
# Install .NET Framework 4.6.1 or higher

# Test compatibility
npm run test:compatibility
```

#### 5. TypeScript Errors
```bash
# Install type definitions
npm install --save-dev @types/react @types/react-dom @types/node

# Skip type checking temporarily
npm run build -- --skipLibCheck
```

## 📊 Application Status Check

### Health Check Commands
```bash
# Check all systems
npm run health-check

# Check dependencies
npm ls

# Check Electron
npx electron --version

# Check Node.js compatibility
node --version  # Should be 16.x for Windows 7 compatibility
```

### Performance Monitoring
```bash
# Run performance tests
npm run test:performance

# Monitor memory usage
npm run monitor

# Check Windows 7 performance
npm run test:win7-performance
```

## 🎮 Development Workflow

### Recommended Development Setup
1. **Install**: `quick-install.bat`
2. **Develop**: `npm run dev`
3. **Test**: `npm run test:all`
4. **Build**: `npm run make:win7`

### Hot Reload Development
```bash
# Start development with hot reload
npm run dev

# In separate terminal, run tests
npm run test:watch
```

### Production Testing
```bash
# Build and test production version
npm run build
npm start

# Test on Windows 7 (if available)
npm run test:compatibility
```

## 🌐 Network & Port Information

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Vite Dev Server | 3000 | http://localhost:3000 | React development |
| Electron | N/A | Native App | Desktop application |
| Test Server | 3001 | http://localhost:3001 | E2E testing |

## 📱 Platform-Specific Instructions

### Windows 7
- Ensure .NET Framework 4.6.1+
- Use Electron 21.4.4 (already configured)
- Enable Windows 7 compatibility mode
- Reduced animations for better performance

### Windows 10/11
- Full feature support
- Hardware acceleration enabled
- All animations and effects active
- Modern Windows APIs available

## 🔐 Security Considerations

### Development Mode
- Security features are relaxed for development
- DevTools are enabled
- Hot reload is active
- Debug logging is enabled

### Production Mode
- Full security features active
- License validation required
- Hardware fingerprinting enabled
- Anti-tampering protection active

## 📞 Getting Help

### If Application Won't Start
1. Run `quick-install.bat`
2. Try `npm run dev`
3. Check Node.js version (should be 16.x)
4. Run `npm run test:compatibility`

### If Build Fails
1. Clear cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install --force`
4. Try `npm run build -- --skipLibCheck`

### If Tests Fail
1. Run `npm run test:compatibility`
2. Check Windows version compatibility
3. Ensure all dependencies are installed
4. Try `npm run test -- --verbose`

---

## 🎉 Success Indicators

✅ **Application Started Successfully** when you see:
- Electron window opens
- Arabic interface loads
- Glass morphism effects visible
- No console errors
- Database initializes
- Hardware detection works

✅ **Ready for Production** when:
- All tests pass (`npm run test:all`)
- Build completes (`npm run build`)
- Windows 7 compatibility confirmed
- Security features active
- Performance benchmarks met

---

**🏪 Tareeqa POS** - *Professional Egyptian Point of Sale System*  
*Choose any method above to launch your application!*
