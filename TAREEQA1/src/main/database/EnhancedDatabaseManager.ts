// Enhanced Database Manager for Tareeqa POS Phase 2 - Advanced Features
// Extends the base DatabaseManager with advanced inventory, customer management, reporting, and multi-location support

import DatabaseManager from './DatabaseManager';
import * as crypto from 'crypto';

// Enhanced interfaces for Phase 2 features
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
}

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
}

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
}

export interface StockTransferItem {
  id?: number;
  transferId: number;
  productId: number;
  variantId?: number;
  requestedQuantity: number;
  approvedQuantity?: number;
  receivedQuantity?: number;
}

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
}

export class EnhancedDatabaseManager extends DatabaseManager {
  
  constructor(dbPath?: string) {
    super(dbPath);
    this.createEnhancedTables();
  }

  /**
   * Create enhanced tables for Phase 2 features
   */
  private createEnhancedTables(): void {
    // Product variants table
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        name_en TEXT,
        attributes TEXT NOT NULL, -- JSON string
        cost_price REAL NOT NULL DEFAULT 0,
        selling_price REAL NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);

    // Pricing tiers table
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS pricing_tiers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_en TEXT,
        type TEXT NOT NULL CHECK (type IN ('retail', 'wholesale', 'vip', 'employee')),
        discount_percentage REAL NOT NULL DEFAULT 0,
        minimum_quantity INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Product pricing by tier
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS product_pricing (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        tier_id INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE,
        FOREIGN KEY (tier_id) REFERENCES pricing_tiers (id) ON DELETE CASCADE,
        UNIQUE(product_id, variant_id, tier_id)
      )
    `);

    // Suppliers table
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_en TEXT,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        tax_id TEXT,
        payment_terms TEXT,
        credit_limit REAL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Purchase orders table
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_id INTEGER NOT NULL,
        order_number TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'partial', 'cancelled')),
        order_date DATE NOT NULL,
        expected_date DATE,
        received_date DATE,
        subtotal REAL NOT NULL DEFAULT 0,
        vat_amount REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL DEFAULT 0,
        notes TEXT,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Purchase order items table
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        quantity INTEGER NOT NULL,
        received_quantity INTEGER DEFAULT 0,
        unit_cost REAL NOT NULL,
        total_cost REAL NOT NULL,
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (variant_id) REFERENCES product_variants (id)
      )
    `);

    // Locations table
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_en TEXT,
        type TEXT NOT NULL DEFAULT 'branch' CHECK (type IN ('main', 'branch', 'warehouse')),
        address TEXT,
        city TEXT,
        governorate TEXT,
        phone TEXT,
        manager_id INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        settings TEXT NOT NULL DEFAULT '{"allowNegativeStock":false,"autoReorder":true,"printReceipts":true}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES users (id)
      )
    `);

    // Stock movements table (audit trail)
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        location_id INTEGER,
        movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer', 'adjustment', 'return')),
        quantity INTEGER NOT NULL,
        reference_type TEXT CHECK (reference_type IN ('sale', 'purchase', 'transfer', 'adjustment')),
        reference_id INTEGER,
        notes TEXT,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (variant_id) REFERENCES product_variants (id),
        FOREIGN KEY (location_id) REFERENCES locations (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Stock transfers table
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS stock_transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_location_id INTEGER NOT NULL,
        to_location_id INTEGER NOT NULL,
        transfer_number TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'received', 'cancelled')),
        requested_by INTEGER NOT NULL,
        approved_by INTEGER,
        received_by INTEGER,
        request_date DATE NOT NULL,
        approval_date DATE,
        receive_date DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_location_id) REFERENCES locations (id),
        FOREIGN KEY (to_location_id) REFERENCES locations (id),
        FOREIGN KEY (requested_by) REFERENCES users (id),
        FOREIGN KEY (approved_by) REFERENCES users (id),
        FOREIGN KEY (received_by) REFERENCES users (id)
      )
    `);

    // Stock transfer items table
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS stock_transfer_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transfer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        requested_quantity INTEGER NOT NULL,
        approved_quantity INTEGER,
        received_quantity INTEGER,
        FOREIGN KEY (transfer_id) REFERENCES stock_transfers (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (variant_id) REFERENCES product_variants (id)
      )
    `);

    // Enhanced customers table (replace existing)
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS customers_enhanced (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_type TEXT NOT NULL DEFAULT 'individual' CHECK (customer_type IN ('individual', 'corporate', 'vip', 'wholesale')),
        name TEXT NOT NULL,
        name_en TEXT,
        email TEXT,
        phone TEXT,
        alternate_phone TEXT,
        address TEXT,
        city TEXT,
        governorate TEXT,
        postal_code TEXT,
        tax_id TEXT,
        commercial_register TEXT,
        credit_limit REAL DEFAULT 0,
        payment_terms INTEGER DEFAULT 0,
        loyalty_points INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0,
        last_purchase_date DATE,
        preferred_language TEXT DEFAULT 'ar' CHECK (preferred_language IN ('ar', 'en')),
        communication_preferences TEXT DEFAULT '{"sms":true,"email":false,"whatsapp":false}',
        referred_by INTEGER,
        profile_image TEXT,
        notes TEXT,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (referred_by) REFERENCES customers_enhanced (id)
      )
    `);

    // User roles table
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_en TEXT,
        permissions TEXT NOT NULL, -- JSON array of permissions
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Enhanced users table (replace existing)
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS users_enhanced (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        full_name_en TEXT,
        email TEXT,
        phone TEXT,
        role_id INTEGER NOT NULL,
        location_id INTEGER,
        employee_id TEXT,
        hire_date DATE,
        salary REAL,
        commission_rate REAL DEFAULT 0,
        profile_image TEXT,
        preferences TEXT DEFAULT '{"language":"ar","theme":"light","notifications":true}',
        work_schedule TEXT, -- JSON object
        last_login DATETIME,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES user_roles (id),
        FOREIGN KEY (location_id) REFERENCES locations (id)
      )
    `);

    // Product expiry tracking
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS product_expiry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        batch_number TEXT,
        expiry_date DATE NOT NULL,
        quantity INTEGER NOT NULL,
        location_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (variant_id) REFERENCES product_variants (id),
        FOREIGN KEY (location_id) REFERENCES locations (id)
      )
    `);

    // Serial number tracking
    this.raw.exec(`
      CREATE TABLE IF NOT EXISTS product_serials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        serial_number TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold', 'returned', 'damaged')),
        location_id INTEGER,
        purchase_order_id INTEGER,
        transaction_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (variant_id) REFERENCES product_variants (id),
        FOREIGN KEY (location_id) REFERENCES locations (id),
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id),
        FOREIGN KEY (transaction_id) REFERENCES transactions (id)
      )
    `);

    // Create enhanced indexes
    this.createEnhancedIndexes();
    
    // Seed enhanced initial data
    this.seedEnhancedData();

    console.log('✅ Enhanced database tables created successfully');
  }

  /**
   * Create indexes for enhanced tables
   */
  private createEnhancedIndexes(): void {
    this.raw.exec(`
      CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants (product_id);
      CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants (sku);
      CREATE INDEX IF NOT EXISTS idx_product_pricing_product ON product_pricing (product_id);
      CREATE INDEX IF NOT EXISTS idx_product_pricing_tier ON product_pricing (tier_id);
      CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders (supplier_id);
      CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders (status);
      CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders (order_date);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements (product_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_location ON stock_movements (location_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements (created_at);
      CREATE INDEX IF NOT EXISTS idx_stock_transfers_from ON stock_transfers (from_location_id);
      CREATE INDEX IF NOT EXISTS idx_stock_transfers_to ON stock_transfers (to_location_id);
      CREATE INDEX IF NOT EXISTS idx_customers_enhanced_type ON customers_enhanced (customer_type);
      CREATE INDEX IF NOT EXISTS idx_customers_enhanced_phone ON customers_enhanced (phone);
      CREATE INDEX IF NOT EXISTS idx_users_enhanced_role ON users_enhanced (role_id);
      CREATE INDEX IF NOT EXISTS idx_users_enhanced_location ON users_enhanced (location_id);
      CREATE INDEX IF NOT EXISTS idx_product_expiry_date ON product_expiry (expiry_date);
      CREATE INDEX IF NOT EXISTS idx_product_serials_status ON product_serials (status);
    `);
  }

  /**
   * Seed enhanced initial data
   */
  private seedEnhancedData(): void {
    try {
      // Create default pricing tiers
      const tierCount = this.raw.prepare('SELECT COUNT(*) as count FROM pricing_tiers').get() as { count: number };
      
      if (tierCount.count === 0) {
        const insertTier = this.raw.prepare(`
          INSERT INTO pricing_tiers (name, name_en, type, discount_percentage)
          VALUES (?, ?, ?, ?)
        `);

        const defaultTiers = [
          ['تجزئة', 'Retail', 'retail', 0],
          ['جملة', 'Wholesale', 'wholesale', 15],
          ['عميل مميز', 'VIP', 'vip', 10],
          ['موظف', 'Employee', 'employee', 20]
        ];

        const insertManyTiers = this.raw.transaction((tiers: any[]) => {
          for (const tier of tiers) {
            insertTier.run(...tier);
          }
        });

        insertManyTiers(defaultTiers);
        console.log('✅ Default pricing tiers created');
      }

      // Create default user roles
      const roleCount = this.raw.prepare('SELECT COUNT(*) as count FROM user_roles').get() as { count: number };
      
      if (roleCount.count === 0) {
        const insertRole = this.raw.prepare(`
          INSERT INTO user_roles (name, name_en, permissions)
          VALUES (?, ?, ?)
        `);

        const defaultRoles = [
          ['مدير عام', 'Super Admin', JSON.stringify(['*'])],
          ['مدير متجر', 'Store Manager', JSON.stringify(['sales', 'inventory', 'customers', 'reports', 'users_view'])],
          ['محاسب', 'Accountant', JSON.stringify(['sales', 'reports', 'customers_view', 'inventory_view'])],
          ['كاشير', 'Cashier', JSON.stringify(['sales', 'customers_basic'])],
          ['أمين مخزن', 'Stock Clerk', JSON.stringify(['inventory', 'stock_movements', 'purchase_orders'])]
        ];

        const insertManyRoles = this.raw.transaction((roles: any[]) => {
          for (const role of roles) {
            insertRole.run(...role);
          }
        });

        insertManyRoles(defaultRoles);
        console.log('✅ Default user roles created');
      }

      // Create main location if none exists
      const locationCount = this.raw.prepare('SELECT COUNT(*) as count FROM locations').get() as { count: number };
      
      if (locationCount.count === 0) {
        this.raw.prepare(`
          INSERT INTO locations (name, name_en, type, address, city, governorate)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run('المتجر الرئيسي', 'Main Store', 'main', 'العنوان الرئيسي', 'القاهرة', 'القاهرة');
        
        console.log('✅ Main location created');
      }

    } catch (error) {
      console.error('Error seeding enhanced data:', error);
    }
  }
}

export default EnhancedDatabaseManager;
