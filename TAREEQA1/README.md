# 🏪 Tareeqa POS - Professional Egyptian Point of Sale System

[![Electron](https://img.shields.io/badge/Electron-21.4.4-blue.svg)](https://electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Windows 7+](https://img.shields.io/badge/Windows-7%2B-green.svg)](https://www.microsoft.com/windows)

A comprehensive, professional Point of Sale system designed specifically for Egyptian retail businesses. Features modern glass morphism UI, complete Arabic RTL support, hardware integration, and advanced security.

## 🌟 Key Features

### 🏗️ Core Architecture
- **Electron 21.4.4** - Windows 7+ compatible
- **React 18+** with TypeScript 5+
- **SQLite + Better-SQLite3** with encryption
- **Glass Morphism UI** with professional blue palette
- **Arabic RTL Interface** with Cairo/Amiri fonts

### 🇪🇬 Egyptian Market Features
- **14% VAT Calculator** (Egyptian standard rate)
- **Tax-compliant receipts** with Arabic formatting
- **Egyptian Pound (ج.م)** currency formatting
- **Professional Arabic terminology**
- **Cultural business workflow optimization**

### 🛡️ Security & Hardware
- **Hardware fingerprinting** with machine binding
- **License validation** with RSA encryption
- **Database encryption** with SQLCipher
- **Anti-tampering protection**
- **Barcode scanner integration**
- **Thermal printer support**

### 🎨 UI/UX Excellence
- **Glass morphism design system**
- **Island-based widget layout**
- **60fps animations** (optimized for Windows 7)
- **Touch-friendly design** (44px minimum targets)
- **Responsive design** (1024x768 to 4K support)
- **Complete RTL/LTR bi-directional text**

## 🚀 Quick Start

### Method 1: Interactive Launcher (Recommended)
```bash
# Windows Command Prompt
run-app.bat

# PowerShell
.\start-tareeqa.ps1
```

### Method 2: Direct Commands
```bash
# Install dependencies
npm install --no-optional --legacy-peer-deps

# Development mode
npm run dev

# Production build
npm run build && npm start

# Windows 7+ build
npm run make:win7
```

### Method 3: Quick Install
```bash
# Run the quick installer
quick-install.bat
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development mode (Vite + Electron) |
| `npm run build` | Build for production |
| `npm start` | Start built application |
| `npm run make:win7` | Build Windows 7+ compatible installer |
| `npm test` | Run Jest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:all` | Run all tests |
| `npm run lint` | Run ESLint |

## 🏗️ Project Structure

```
TAREEQA1/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── database/         # SQLite + encryption
│   │   ├── hardware/         # Hardware integration
│   │   ├── security/         # License & anti-tampering
│   │   └── index.ts          # Main entry point
│   ├── renderer/             # React frontend
│   │   ├── components/       # UI components
│   │   │   ├── business/     # Egyptian business components
│   │   │   ├── common/       # Common components
│   │   │   └── ui/           # Glass morphism UI
│   │   ├── screens/          # Main application screens
│   │   ├── i18n/             # Internationalization
│   │   └── styles/           # Global styles
│   └── types/                # TypeScript declarations
├── tests/                    # Test suites
│   ├── e2e/                  # Playwright E2E tests
│   └── unit/                 # Jest unit tests
├── index.html                # Main HTML entry
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS + Windows 7 fallbacks
├── jest.config.js            # Jest testing configuration
└── playwright.config.ts      # Playwright E2E configuration
```

## 🧪 Testing Framework

### Unit Testing (Jest)
```bash
npm test                    # Run all unit tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### E2E Testing (Playwright)
```bash
npm run test:e2e           # Run E2E tests
npm run test:e2e:headed    # Run with browser UI
```

### Specialized Tests
```bash
npm run test:security      # Security tests
npm run test:arabic        # Arabic/RTL tests
npm run test:compatibility # Windows 7 compatibility
npm run test:performance   # Performance benchmarks
```

## 🔧 Development Setup

### Prerequisites
- **Node.js 16.x LTS** (Windows 7+ compatible)
- **npm 8+**
- **Windows 7 SP1** or higher
- **.NET Framework 4.6.1+** (for native modules)

### Development Environment
1. Clone the repository
2. Run `quick-install.bat` or `npm install`
3. Start development: `npm run dev`
4. Access at `http://localhost:3000` (renderer) + Electron window

### Windows 7 Compatibility
The application is specifically optimized for Windows 7+:
- **Electron 21.4.4** (last version supporting Windows 7)
- **Glass effect fallbacks** for older systems
- **Reduced animations** for better performance
- **Compatible native modules**

## 🏪 Business Features

### Egyptian VAT System
- **14% standard VAT rate**
- **VAT-exempt categories** (medicines, books, etc.)
- **Tax-compliant receipts**
- **Egyptian tax registration integration**

### Hardware Integration
- **Barcode scanners** (USB HID compatible)
- **Thermal printers** (ESC/POS commands)
- **Cash drawers** (serial/USB)
- **Customer displays**

### Multi-language Support
- **Arabic (primary)** - Complete RTL interface
- **English (secondary)** - Full LTR support
- **Dynamic language switching**
- **Cultural number formatting**

## 🛡️ Security Features

### License Management
- **Hardware fingerprinting**
- **RSA encryption**
- **Machine binding**
- **Trial/Full license support**

### Data Protection
- **SQLite database encryption**
- **Field-level encryption**
- **Secure IPC communication**
- **Anti-tampering protection**

### Input Validation
- **SQL injection prevention**
- **XSS protection**
- **Input sanitization**
- **Secure file handling**

## 📱 Supported Platforms

| Platform | Version | Status |
|----------|---------|--------|
| Windows 7 SP1 | x64/x86 | ✅ Fully Supported |
| Windows 8/8.1 | x64/x86 | ✅ Fully Supported |
| Windows 10 | x64/x86 | ✅ Fully Supported |
| Windows 11 | x64/ARM64 | ✅ Fully Supported |

## 🎯 Target Market

**Egyptian Retail Businesses** requiring:
- Modern, professional POS interface
- Arabic language support
- Egyptian tax compliance
- Hardware integration
- Windows 7+ compatibility
- Secure, encrypted data storage

## 📞 Support & Documentation

### Getting Help
1. Check the **README.md** (this file)
2. Review **error logs** in the application
3. Run **diagnostic tests**: `npm run test:all`
4. Check **Windows compatibility**: `npm run test:compatibility`

### Common Issues
- **Dependencies not installing**: Run `quick-install.bat`
- **Electron not starting**: Try `npx electron .`
- **Build failures**: Check Node.js version (16.x required)
- **Windows 7 issues**: Ensure .NET Framework 4.6.1+

## 🔄 Version History

- **v1.0.0** - Initial release
  - Complete Egyptian POS system
  - Windows 7+ compatibility
  - Glass morphism UI
  - Arabic RTL interface
  - Hardware integration
  - Advanced security

## 📄 License

Copyright © 2024 Tareeqa Technologies. All rights reserved.

---

**🏪 Tareeqa POS** - *Professional Egyptian Point of Sale System*  
*Built with ❤️ for Egyptian businesses*
