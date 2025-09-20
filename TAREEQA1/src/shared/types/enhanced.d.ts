// Enhanced Types for Tareeqa POS Phase 2 - Advanced Features
// Comprehensive type definitions for advanced inventory, customer management, reporting, and multi-location support

// Re-export base types
export * from './global';

// Advanced Inventory Management Types
export interface ProductVariant {
  id?: number;
  productId: number;
  sku: string;
  name: string;
  nameEn?: string;
  attributes: Record<string, string>; // size, color, style, etc.
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingTier {
  id?: number;
  name: string;
  nameEn?: string;
  type: 'retail' | 'wholesale' | 'vip' | 'employee';
  discountPercentage: number;
  minimumQuantity?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface ProductPricing {
  id?: number;
  productId: number;
  variantId?: number;
  tierId: number;
  price: number;
  createdAt?: string;
}

export interface Supplier {
  id?: number;
  name: string;
  nameEn?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrder {
  id?: number;
  supplierId: number;
  orderNumber: string;
  status: 'draft' | 'sent' | 'received' | 'partial' | 'cancelled';
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  createdBy: number;
  createdAt?: string;
  updatedAt?: string;
  items?: PurchaseOrderItem[];
  supplier?: Supplier;
}

export interface PurchaseOrderItem {
  id?: number;
  purchaseOrderId: number;
  productId: number;
  variantId?: number;
  quantity: number;
  receivedQuantity?: number;
  unitCost: number;
  totalCost: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface StockMovement {
  id?: number;
  productId: number;
  variantId?: number;
  locationId?: number;
  movementType: 'in' | 'out' | 'transfer' | 'adjustment' | 'return';
  quantity: number;
  referenceType?: 'sale' | 'purchase' | 'transfer' | 'adjustment';
  referenceId?: number;
  notes?: string;
  userId: number;
  createdAt?: string;
  product?: Product;
  variant?: ProductVariant;
  location?: Location;
  user?: EnhancedUser;
}

// Enhanced Customer Management Types
export interface EnhancedCustomer {
  id?: number;
  customerType: 'individual' | 'corporate' | 'vip' | 'wholesale';
  name: string;
  nameEn?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  governorate?: string;
  postalCode?: string;
  taxId?: string;
  commercialRegister?: string;
  creditLimit?: number;
  paymentTerms?: number; // days
  loyaltyPoints?: number;
  totalSpent?: number;
  lastPurchaseDate?: string;
  preferredLanguage: 'ar' | 'en';
  communicationPreferences: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  referredBy?: number;
  profileImage?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  referrer?: EnhancedCustomer;
  purchaseHistory?: CustomerPurchaseHistory[];
  analytics?: CustomerAnalytics;
}

export interface CustomerPurchaseHistory {
  id?: number;
  customerId: number;
  transactionId: number;
  date: string;
  amount: number;
  itemCount: number;
  paymentMethod: string;
}

export interface CustomerAnalytics {
  customerId: number;
  totalTransactions: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate?: string;
  favoriteCategories: string[];
  purchaseFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lifetimeValue: number;
  riskScore: number; // 0-100, higher = more risk
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// Multi-Location Support Types
export interface Location {
  id?: number;
  name: string;
  nameEn?: string;
  type: 'main' | 'branch' | 'warehouse';
  address?: string;
  city?: string;
  governorate?: string;
  phone?: string;
  managerId?: number;
  isActive: boolean;
  settings: {
    allowNegativeStock: boolean;
    autoReorder: boolean;
    printReceipts: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
  manager?: EnhancedUser;
  stockLevels?: LocationStock[];
}

export interface LocationStock {
  id?: number;
  locationId: number;
  productId: number;
  variantId?: number;
  quantity: number;
  reservedQuantity: number;
  minStock: number;
  maxStock?: number;
  lastUpdated?: string;
}

export interface StockTransfer {
  id?: number;
  fromLocationId: number;
  toLocationId: number;
  transferNumber: string;
  status: 'pending' | 'in_transit' | 'received' | 'cancelled';
  requestedBy: number;
  approvedBy?: number;
  receivedBy?: number;
  requestDate: string;
  approvalDate?: string;
  receiveDate?: string;
  notes?: string;
  createdAt?: string;
  items?: StockTransferItem[];
  fromLocation?: Location;
  toLocation?: Location;
  requester?: EnhancedUser;
  approver?: EnhancedUser;
  receiver?: EnhancedUser;
}

export interface StockTransferItem {
  id?: number;
  transferId: number;
  productId: number;
  variantId?: number;
  requestedQuantity: number;
  approvedQuantity?: number;
  receivedQuantity?: number;
  product?: Product;
  variant?: ProductVariant;
}

// Enhanced User Management Types
export interface UserRole {
  id?: number;
  name: string;
  nameEn?: string;
  permissions: string[];
  isActive: boolean;
  createdAt?: string;
}

export interface EnhancedUser {
  id?: number;
  username: string;
  passwordHash: string;
  fullName: string;
  fullNameEn?: string;
  email?: string;
  phone?: string;
  roleId: number;
  locationId?: number;
  employeeId?: string;
  hireDate?: string;
  salary?: number;
  commissionRate?: number;
  profileImage?: string;
  preferences: {
    language: 'ar' | 'en';
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  workSchedule?: {
    startTime: string;
    endTime: string;
    workDays: number[]; // 0-6 (Sunday-Saturday)
  };
  lastLogin?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  role?: UserRole;
  location?: Location;
  performance?: UserPerformance;
}

export interface UserPerformance {
  userId: number;
  period: string; // YYYY-MM format
  salesCount: number;
  salesAmount: number;
  averageTransactionValue: number;
  customersServed: number;
  hoursWorked: number;
  commissionEarned: number;
  targets?: {
    salesAmount: number;
    salesCount: number;
    customerCount: number;
  };
  achievements?: string[];
}

// Product Tracking Types
export interface ProductExpiry {
  id?: number;
  productId: number;
  variantId?: number;
  batchNumber?: string;
  expiryDate: string;
  quantity: number;
  locationId?: number;
  createdAt?: string;
  product?: Product;
  variant?: ProductVariant;
  location?: Location;
}

export interface ProductSerial {
  id?: number;
  productId: number;
  variantId?: number;
  serialNumber: string;
  status: 'in_stock' | 'sold' | 'returned' | 'damaged';
  locationId?: number;
  purchaseOrderId?: number;
  transactionId?: number;
  createdAt?: string;
  product?: Product;
  variant?: ProductVariant;
  location?: Location;
}

// Reporting Types
export interface ReportDefinition {
  id: string;
  name: string;
  nameEn?: string;
  category: 'sales' | 'inventory' | 'customers' | 'financial' | 'staff' | 'operations';
  description?: string;
  parameters: ReportParameter[];
  permissions: string[];
  isActive: boolean;
}

export interface ReportParameter {
  name: string;
  type: 'date' | 'daterange' | 'select' | 'multiselect' | 'number' | 'text' | 'boolean';
  label: string;
  labelEn?: string;
  required: boolean;
  defaultValue?: any;
  options?: { value: any; label: string; labelEn?: string }[];
}

export interface ReportData {
  reportId: string;
  title: string;
  generatedAt: string;
  parameters: Record<string, any>;
  data: any[];
  summary?: Record<string, any>;
  charts?: ReportChart[];
}

export interface ReportChart {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title: string;
  data: any;
  options?: any;
}

// Dashboard Types
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  title: string;
  titleEn?: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number; w: number; h: number };
  config: any;
  permissions: string[];
  isActive: boolean;
}

export interface DashboardMetric {
  label: string;
  labelEn?: string;
  value: number | string;
  format: 'number' | 'currency' | 'percentage' | 'text';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

// Notification Types
export interface SystemNotification {
  id?: number;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'system' | 'inventory' | 'sales' | 'customer' | 'user';
  title: string;
  titleEn?: string;
  message: string;
  messageEn?: string;
  data?: any;
  userId?: number;
  isRead: boolean;
  createdAt?: string;
  expiresAt?: string;
}

// Audit Trail Types
export interface AuditLog {
  id?: number;
  userId: number;
  action: string;
  entityType: string;
  entityId?: number;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  user?: EnhancedUser;
}

// System Configuration Types
export interface SystemConfig {
  key: string;
  value: any;
  category: string;
  description?: string;
  isEditable: boolean;
  updatedAt?: string;
  updatedBy?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  messageEn?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Export utility types
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
export type EntityWithId<T> = T & { id: number };

// Permission constants
export const PERMISSIONS = {
  // Sales
  SALES_VIEW: 'sales.view',
  SALES_CREATE: 'sales.create',
  SALES_EDIT: 'sales.edit',
  SALES_DELETE: 'sales.delete',
  SALES_REFUND: 'sales.refund',
  
  // Inventory
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_EDIT: 'inventory.edit',
  INVENTORY_DELETE: 'inventory.delete',
  INVENTORY_ADJUST: 'inventory.adjust',
  INVENTORY_TRANSFER: 'inventory.transfer',
  
  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_EDIT: 'customers.edit',
  CUSTOMERS_DELETE: 'customers.delete',
  CUSTOMERS_ANALYTICS: 'customers.analytics',
  
  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_ROLES: 'users.roles',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_SCHEDULE: 'reports.schedule',
  
  // System
  SYSTEM_CONFIG: 'system.config',
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_AUDIT: 'system.audit',
  
  // All permissions
  ALL: '*'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
