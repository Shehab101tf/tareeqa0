/**
 * Global Type Declarations for Tareeqa POS
 * Defines types for Electron APIs and global interfaces
 */

// Tareeqa API Interface
interface TareeqaAPI {
  database: {
    query: (sql: string, params?: any[]) => Promise<any[]>;
    run: (sql: string, params?: any[]) => Promise<any>;
  };
  
  hardware: {
    scanBarcode: () => Promise<string | null>;
    printReceipt: (receiptData: any) => Promise<boolean>;
    openCashDrawer: () => Promise<boolean>;
    getStatus: () => Promise<any>;
    testHardware: () => Promise<any>;
  };
  
  security: {
    authenticate: (credentials: any) => Promise<any>;
    getPermissions: (userId: string) => Promise<string[]>;
    getStatus: () => Promise<any>;
  };
  
  license: {
    getInfo: () => Promise<any>;
    activate: (licenseKey: string, userInfo: any) => Promise<boolean>;
    deactivate: () => Promise<boolean>;
    isFeatureEnabled: (feature: string) => Promise<boolean>;
  };
  
  app: {
    getVersion: () => Promise<string>;
    quit: () => Promise<void>;
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
  };
  
  dialog: {
    showSave: (options: any) => Promise<any>;
    showOpen: (options: any) => Promise<any>;
  };
  
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

// Platform Information Interface
interface PlatformInfo {
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;
  arch: string;
  versions: NodeJS.ProcessVersions;
}

// Development Tools Interface (only in development)
interface DevTools {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
}

// Utility Functions Interface
interface TareeqaUtils {
  hideLoadingScreen: () => void;
  showErrorScreen: (message: string) => void;
  checkTareeqaAPI: () => boolean;
}

// Extend Window interface
declare global {
  interface Window {
    tareeqa: TareeqaAPI;
    platform: PlatformInfo;
    devTools?: DevTools;
    TareeqaUtils: TareeqaUtils;
  }

  // Hot Module Replacement for development
  interface NodeModule {
    hot?: {
      accept: (path?: string, callback?: () => void) => void;
    };
  }

  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      ELECTRON_IS_DEV?: string;
    }
  }
}

// Product related types
export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  qrCode?: string;
  name: string;
  nameArabic: string;
  description?: string;
  descriptionArabic?: string;
  price: number;
  cost: number;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  categoryId?: string;
  taxRate: number;
  isActive: boolean;
  isService: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  imagePath?: string;
  galleryPaths?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  variantType: 'size' | 'color' | 'style';
  variantValue: string;
  variantValueArabic?: string;
  priceAdjustment: number;
  stockQuantity: number;
  skuSuffix?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameArabic: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Customer related types
export interface Customer {
  id: string;
  customerCode?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  governorate?: string;
  postalCode?: string;
  taxId?: string;
  customerType: 'individual' | 'business';
  creditLimit: number;
  currentBalance: number;
  loyaltyPoints: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction related types
export interface Transaction {
  id: string;
  transactionNumber: string;
  customerId?: string;
  cashierId: string;
  transactionDate: string;
  transactionType: 'sale' | 'return' | 'exchange';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  discountType?: 'percentage' | 'fixed';
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  paymentMethod: string;
  paymentReference?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  receiptPrinted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  variantId?: string;
  productName: string;
  productNameArabic?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  costPrice: number;
  createdAt: string;
}

// Payment related types
export interface PaymentMethod {
  id: string;
  name: string;
  nameArabic: string;
  type: 'cash' | 'card' | 'digital' | 'bank_transfer';
  isActive: boolean;
  requiresReference: boolean;
  iconPath?: string;
  sortOrder: number;
}

// User related types
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier' | 'stock_clerk' | 'accountant';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  loginAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

// Settings related types
export interface Setting {
  id: string;
  category: string;
  key: string;
  value: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isEncrypted: boolean;
  updatedBy?: string;
  updatedAt: string;
}

// Hardware related types
export interface HardwareDevice {
  type: 'barcode_scanner' | 'receipt_printer' | 'cash_drawer' | 'display' | 'scale';
  name: string;
  port?: string;
  manufacturer?: string;
  model?: string;
  connected: boolean;
  status: 'online' | 'offline' | 'error' | 'busy';
  lastActivity?: string;
  settings?: Record<string, any>;
}

// Receipt related types
export interface ReceiptData {
  transactionId: string;
  transactionNumber: string;
  storeName: string;
  storeNameEnglish: string;
  storeAddress?: string;
  storePhone?: string;
  storeTaxId?: string;
  date: string;
  time: string;
  cashierName: string;
  customerName?: string;
  items: Array<{
    name: string;
    nameArabic?: string;
    quantity: number;
    unitPrice: number;
    total: number;
    taxRate?: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  amountPaid: number;
  changeAmount: number;
  qrCode?: string;
  footerText?: string;
}

// Analytics related types
export interface SalesAnalytics {
  period: 'today' | 'week' | 'month' | 'year';
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  salesByHour: Array<{
    hour: number;
    sales: number;
    transactions: number;
  }>;
  salesByPaymentMethod: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  messageArabic?: string;
  details?: any;
  timestamp: string;
  userId?: string;
  context?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  message?: string;
}

// Cart related types (for POS interface)
export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  nameArabic?: string;
  sku: string;
  price: number;
  quantity: number;
  taxRate: number;
  discount: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  customerId?: string;
  notes?: string;
}

// Export empty object to make this a module
export {};
