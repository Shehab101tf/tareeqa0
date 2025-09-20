# 🏪 Tareeqa POS - نظام نقطة البيع المصري المتقدم

**Professional Egyptian Point of Sale System** built with modern technologies and optimized for the Egyptian retail market.

## 🎯 Overview

Tareeqa POS is a comprehensive, offline-first point of sale system designed specifically for Egyptian businesses. It combines modern glass morphism UI with robust functionality, complete Arabic RTL support, and compliance with Egyptian business regulations.

## ✨ Key Features

### 🎨 **Modern UI/UX**
- **Glass Morphism Design** - Professional translucent interface optimized for sunlight visibility
- **Complete Arabic RTL** - Full right-to-left interface with Cairo and Amiri fonts
- **Responsive Design** - Supports 1024x768 to 4K displays with touch optimization
- **Island-based Layout** - Floating cards with smooth 60fps animations (Windows 7 optimized)

### 🇪🇬 **Egyptian Business Compliance**
- **14% Egyptian VAT** - Automatic tax calculation with exemption support
- **Egyptian Pound (ج.م)** - Proper currency formatting and localization
- **Arabic Business Terms** - Professional terminology throughout the interface
- **Tax-compliant Receipts** - Government-approved receipt formats

### 💳 **Advanced Payment System**
- **Multiple Payment Methods**:
  - 💵 Cash (نقداً) - with automatic change calculation
  - 💳 Visa/Mastercard (فيزا/ماستركارد)
  - 📱 InstaPay (إنستا باي) - Egyptian digital payment
  - 📲 Vodafone Cash (فودافون كاش) - Mobile wallet integration

### 🔐 **Enterprise Security**
- **Hardware Fingerprinting** - Machine binding for license protection
- **Role-Based Access Control** - Admin, Manager, Accountant, Cashier roles
- **Data Encryption** - SQLite database with field-level encryption
- **Session Management** - Auto-lock after 15 minutes of inactivity
- **Audit Logging** - Complete security event tracking

### 🖨️ **Hardware Integration**
- **Barcode Scanners** - USB HID and serial port support
- **Receipt Printers** - ESC/POS thermal printers with Arabic support
- **Cash Drawers** - Automatic opening integration
- **Multi-format Support** - EAN-13, UPC-A, Code 128 barcodes

### 📊 **Business Management**
- **Product Management** - Complete inventory with variants and categories
- **Customer Management** - Individual and business customer profiles
- **User Management** - Admin-controlled user creation and permissions
- **Analytics Dashboard** - Sales reports and business insights
- **Transaction History** - Complete audit trail with search capabilities

## 🛠️ Technical Architecture

### **Core Technologies**
- **Electron 28.x** - Cross-platform desktop application (Windows 7+ compatible)
- **React 18** - Modern UI framework with hooks and concurrent features
- **TypeScript 5** - Type-safe development with strict mode
- **Tailwind CSS 3.4** - Utility-first CSS with custom Egyptian theme
- **Framer Motion 10** - Smooth animations optimized for performance

### **Database & Storage**
- **SQLite + Better-SQLite3** - Fast, reliable local database
- **Database Encryption** - Secure data storage with integrity checks
- **Automatic Backups** - Scheduled data protection
- **Migration System** - Seamless database updates

### **Security Features**
- **Input Validation** - Zod schemas for all user inputs
- **SQL Injection Prevention** - Parameterized queries and sanitization
- **XSS Protection** - Content Security Policy and input filtering
- **Result Types** - Functional error handling without exceptions
- **Hardware Binding** - License tied to specific machine

## 🚀 Quick Start

### **Prerequisites**
- Windows 7 SP1 or later (Windows 10/11 recommended)
- Node.js 18.0 or later
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space

### **Installation**

1. **Clone or Download** the project to your desired location
2. **Run the Application**:
   ```bash
   # Double-click the batch file
   run-app.bat
   
   # Or use npm commands
   npm install
   npm run dev
   ```

### **First Time Setup**

1. **Login** with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

2. **Configure Store Settings**:
   - Go to Settings → Store Information
   - Set your store name, address, and tax details
   - Configure receipt header and footer

3. **Add Products**:
   - Navigate to Products → Add New Product
   - Enter product details with Arabic names
   - Set prices and inventory levels

4. **Setup Hardware** (Optional):
   - Go to Hardware → Scanner/Printer Setup
   - Configure your barcode scanner and receipt printer
   - Test hardware connections

## 📱 Usage Guide

### **Making a Sale**
1. **Scan or Search** for products using the barcode scanner or search bar
2. **Add to Cart** by clicking products or scanning barcodes
3. **Review Cart** - adjust quantities, apply discounts
4. **Process Payment** - select payment method and complete transaction
5. **Print Receipt** - automatic receipt generation with customer copy

### **User Management** (Admin Only)
1. **Add Users** - Create cashier, manager, or accountant accounts
2. **Set Permissions** - Control access to different system features
3. **Monitor Activity** - View login history and user actions

### **Reports & Analytics**
1. **Daily Sales** - View today's transactions and totals
2. **Product Performance** - Best-selling items and inventory levels
3. **Payment Methods** - Breakdown by cash, card, and digital payments
4. **Export Data** - Generate reports for accounting software

## 🔧 Development

### **Project Structure**
```
tareeqa-pos/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── database/         # SQLite database management
│   │   ├── services/         # Hardware and security services
│   │   └── security/         # DLL protection modules
│   ├── renderer/             # React frontend
│   │   ├── components/       # UI components
│   │   ├── pages/           # Application screens
│   │   ├── store/           # State management
│   │   └── hooks/           # Custom React hooks
│   └── shared/              # Shared utilities and types
│       ├── types/           # TypeScript definitions
│       ├── validation/      # Zod schemas
│       └── utils/           # Helper functions
├── tests/                   # Test suites
├── assets/                  # Images and resources
└── dist/                    # Built application
```

### **Available Scripts**
```bash
# Development
npm run dev              # Start development server
npm run dev:main         # Build main process in watch mode
npm run dev:renderer     # Start renderer development server

# Building
npm run build            # Build for production
npm run build:main       # Build main process
npm run build:renderer   # Build renderer process

# Testing
npm run test            # Run unit tests
npm run test:e2e        # Run end-to-end tests
npm run test:security   # Run security tests
npm run test:all        # Run all test suites

# Distribution
npm run dist            # Create distribution packages
npm run dist:win7       # Build for Windows 7 (32-bit)
npm run dist:win10      # Build for Windows 10+ (64-bit)
```

### **Building for Production**
```bash
# Install dependencies
npm install

# Build application
npm run build

# Create installer
npm run dist

# The installer will be in the 'release' folder
```

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests** - Component and utility function testing
- **Integration Tests** - Database and API testing
- **E2E Tests** - Complete workflow testing with Playwright
- **Security Tests** - SQL injection and XSS prevention
- **Performance Tests** - Windows 7-11 compatibility benchmarks

Run tests with:
```bash
npm run test:all
```

## 🔒 Security

### **Data Protection**
- All sensitive data is encrypted at rest
- Database connections use parameterized queries
- User passwords are hashed with bcrypt
- Session tokens expire automatically

### **License Protection**
- Hardware fingerprinting prevents unauthorized copying
- License validation with RSA encryption
- Anti-tampering protection for critical files
- Regular integrity checks

### **Access Control**
- Role-based permissions system
- Session management with auto-lock
- Audit logging for all actions
- Failed login attempt protection

## 🌍 Localization

### **Arabic Support**
- Complete RTL interface layout
- Arabic fonts (Cairo, Amiri) with fallbacks
- Egyptian business terminology
- Arabic number formatting
- Bi-directional text handling

### **Egyptian Compliance**
- 14% VAT calculation (configurable)
- Egyptian Pound currency formatting
- Local business hour settings
- Government-approved receipt formats
- Egyptian barcode format support (EAN-13 starting with 622)

## 📞 Support

### **System Requirements**
- **Minimum**: Windows 7 SP1, 4GB RAM, 2GB storage
- **Recommended**: Windows 10/11, 8GB RAM, SSD storage
- **Hardware**: USB ports for scanner/printer (optional)

### **Troubleshooting**

**Application won't start**:
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Check Windows version compatibility

**Hardware not detected**:
- Verify USB connections
- Install device drivers
- Check Hardware → Device Status

**Performance issues**:
- Close unnecessary applications
- Enable hardware acceleration
- Reduce animation settings for older systems

**Database errors**:
- Check disk space availability
- Verify file permissions
- Run database integrity check

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## 🏆 Credits

Developed by the Tareeqa Development Team for the Egyptian retail market.

**Technologies Used**:
- Electron, React, TypeScript
- Tailwind CSS, Framer Motion
- SQLite, Better-SQLite3
- Node Thermal Printer, SerialPort
- Zod, Zustand, React Router

---

**🇪🇬 Made in Egypt for Egyptian Businesses 🇪🇬**

*Tareeqa POS - Your Path to Modern Retail Management*
