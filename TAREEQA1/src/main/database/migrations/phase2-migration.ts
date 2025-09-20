// Phase 2 Database Migration Script
// Safely migrates from Phase 1 to Phase 2 schema with data preservation

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface MigrationResult {
  success: boolean;
  message: string;
  backupPath?: string;
  errors?: string[];
}

export class Phase2Migration {
  private db: Database.Database;
  private backupPath: string;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.backupPath = `${dbPath}.backup.${Date.now()}`;
  }

  /**
   * Execute the complete Phase 2 migration
   */
  async migrate(): Promise<MigrationResult> {
    try {
      console.log('🚀 Starting Phase 2 migration...');

      // Step 1: Create backup
      await this.createBackup();
      console.log('✅ Database backup created');

      // Step 2: Check current schema version
      const currentVersion = this.getCurrentVersion();
      console.log(`📋 Current schema version: ${currentVersion}`);

      if (currentVersion >= 2) {
        return {
          success: true,
          message: 'Database is already at Phase 2 or higher',
          backupPath: this.backupPath
        };
      }

      // Step 3: Begin transaction
      const migration = this.db.transaction(() => {
        // Create new tables
        this.createEnhancedTables();
        
        // Migrate existing data
        this.migrateExistingData();
        
        // Create indexes
        this.createEnhancedIndexes();
        
        // Seed new data
        this.seedEnhancedData();
        
        // Update schema version
        this.updateSchemaVersion(2);
      });

      migration();

      console.log('✅ Phase 2 migration completed successfully');
      return {
        success: true,
        message: 'Migration completed successfully',
        backupPath: this.backupPath
      };

    } catch (error) {
      console.error('❌ Migration failed:', error);
      
      // Restore from backup if migration fails
      await this.restoreFromBackup();
      
      return {
        success: false,
        message: 'Migration failed and database was restored from backup',
        backupPath: this.backupPath,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Create database backup
   */
  private async createBackup(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.backup(this.backupPath)
        .then(() => resolve())
        .catch(reject);
    });
  }

  /**
   * Restore database from backup
   */
  private async restoreFromBackup(): Promise<void> {
    try {
      this.db.close();
      
      // Copy backup over current database
      const currentPath = this.db.name;
      fs.copyFileSync(this.backupPath, currentPath);
      
      // Reopen database
      this.db = new Database(currentPath);
      
      console.log('✅ Database restored from backup');
    } catch (error) {
      console.error('❌ Failed to restore from backup:', error);
    }
  }

  /**
   * Get current schema version
   */
  private getCurrentVersion(): number {
    try {
      // Check if schema_version table exists
      const tableExists = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='schema_version'
      `).get();

      if (!tableExists) {
        // Create schema_version table
        this.db.exec(`
          CREATE TABLE schema_version (
            version INTEGER PRIMARY KEY,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Insert initial version
        this.db.prepare('INSERT INTO schema_version (version) VALUES (1)').run();
        return 1;
      }

      const result = this.db.prepare('SELECT MAX(version) as version FROM schema_version').get() as { version: number };
      return result.version || 1;
    } catch (error) {
      console.warn('Could not determine schema version, assuming version 1');
      return 1;
    }
  }

  /**
   * Update schema version
   */
  private updateSchemaVersion(version: number): void {
    this.db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(version);
  }

  /**
   * Create enhanced tables for Phase 2
   */
  private createEnhancedTables(): void {
    // Product variants table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        name_en TEXT,
        attributes TEXT NOT NULL DEFAULT '{}',
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
    this.db.exec(`
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
    this.db.exec(`
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
    this.db.exec(`
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
    this.db.exec(`
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
    this.db.exec(`
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
    this.db.exec(`
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

    // Stock movements table
    this.db.exec(`
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
    this.db.exec(`
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
    this.db.exec(`
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

    // Enhanced customers table
    this.db.exec(`
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
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_en TEXT,
        permissions TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Enhanced users table
    this.db.exec(`
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
        work_schedule TEXT,
        last_login DATETIME,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES user_roles (id),
        FOREIGN KEY (location_id) REFERENCES locations (id)
      )
    `);

    // Product expiry tracking
    this.db.exec(`
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
    this.db.exec(`
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

    console.log('✅ Enhanced tables created');
  }

  /**
   * Migrate existing data from Phase 1 to Phase 2
   */
  private migrateExistingData(): void {
    // Migrate customers to enhanced customers
    const existingCustomers = this.db.prepare('SELECT * FROM customers').all();
    
    if (existingCustomers.length > 0) {
      const insertEnhancedCustomer = this.db.prepare(`
        INSERT INTO customers_enhanced (
          id, name, email, phone, address, loyalty_points, 
          customer_type, preferred_language, communication_preferences,
          is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const customer of existingCustomers) {
        insertEnhancedCustomer.run(
          customer.id,
          customer.name,
          customer.email,
          customer.phone,
          customer.address,
          customer.loyalty_points || 0,
          'individual', // default type
          'ar', // default language
          '{"sms":true,"email":false,"whatsapp":false}', // default preferences
          1, // active
          customer.created_at
        );
      }
      
      console.log(`✅ Migrated ${existingCustomers.length} customers`);
    }

    // Migrate users to enhanced users (create default role first)
    const existingUsers = this.db.prepare('SELECT * FROM users').all();
    
    if (existingUsers.length > 0) {
      // Create default roles first
      this.seedUserRoles();
      
      const insertEnhancedUser = this.db.prepare(`
        INSERT INTO users_enhanced (
          id, username, password_hash, full_name, role_id,
          preferences, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const user of existingUsers) {
        // Map old role to new role_id
        let roleId = 4; // Default to cashier
        if (user.role === 'admin') roleId = 1;
        else if (user.role === 'manager') roleId = 2;
        else if (user.role === 'accountant') roleId = 3;

        insertEnhancedUser.run(
          user.id,
          user.username,
          user.password_hash,
          user.full_name,
          roleId,
          '{"language":"ar","theme":"light","notifications":true}',
          user.is_active,
          user.created_at
        );
      }
      
      console.log(`✅ Migrated ${existingUsers.length} users`);
    }

    // Add supplier column to existing products if not exists
    try {
      this.db.exec('ALTER TABLE products ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id)');
    } catch (error) {
      // Column might already exist
    }

    // Create stock movements for existing products (initial stock)
    const existingProducts = this.db.prepare('SELECT * FROM products WHERE stock > 0').all();
    
    if (existingProducts.length > 0) {
      const insertStockMovement = this.db.prepare(`
        INSERT INTO stock_movements (
          product_id, movement_type, quantity, reference_type, 
          notes, user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const adminUserId = this.db.prepare('SELECT id FROM users_enhanced WHERE role_id = 1 LIMIT 1').get()?.id || 1;

      for (const product of existingProducts) {
        insertStockMovement.run(
          product.id,
          'in',
          product.stock,
          'adjustment',
          'Initial stock from Phase 1 migration',
          adminUserId,
          product.created_at
        );
      }
      
      console.log(`✅ Created stock movements for ${existingProducts.length} products`);
    }
  }

  /**
   * Create enhanced indexes
   */
  private createEnhancedIndexes(): void {
    this.db.exec(`
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
    
    console.log('✅ Enhanced indexes created');
  }

  /**
   * Seed enhanced initial data
   */
  private seedEnhancedData(): void {
    // Create default pricing tiers
    this.seedPricingTiers();
    
    // Create default user roles
    this.seedUserRoles();
    
    // Create main location
    this.seedMainLocation();
    
    console.log('✅ Enhanced data seeded');
  }

  /**
   * Seed default pricing tiers
   */
  private seedPricingTiers(): void {
    const tierCount = this.db.prepare('SELECT COUNT(*) as count FROM pricing_tiers').get() as { count: number };
    
    if (tierCount.count === 0) {
      const insertTier = this.db.prepare(`
        INSERT INTO pricing_tiers (name, name_en, type, discount_percentage)
        VALUES (?, ?, ?, ?)
      `);

      const defaultTiers = [
        ['تجزئة', 'Retail', 'retail', 0],
        ['جملة', 'Wholesale', 'wholesale', 15],
        ['عميل مميز', 'VIP', 'vip', 10],
        ['موظف', 'Employee', 'employee', 20]
      ];

      for (const tier of defaultTiers) {
        insertTier.run(...tier);
      }
    }
  }

  /**
   * Seed default user roles
   */
  private seedUserRoles(): void {
    const roleCount = this.db.prepare('SELECT COUNT(*) as count FROM user_roles').get() as { count: number };
    
    if (roleCount.count === 0) {
      const insertRole = this.db.prepare(`
        INSERT INTO user_roles (name, name_en, permissions)
        VALUES (?, ?, ?)
      `);

      const defaultRoles = [
        ['مدير عام', 'Super Admin', JSON.stringify(['*'])],
        ['مدير متجر', 'Store Manager', JSON.stringify(['sales.*', 'inventory.*', 'customers.*', 'reports.*', 'users.view'])],
        ['محاسب', 'Accountant', JSON.stringify(['sales.*', 'reports.*', 'customers.view', 'inventory.view'])],
        ['كاشير', 'Cashier', JSON.stringify(['sales.*', 'customers.basic'])],
        ['أمين مخزن', 'Stock Clerk', JSON.stringify(['inventory.*', 'stock_movements.*', 'purchase_orders.*'])]
      ];

      for (const role of defaultRoles) {
        insertRole.run(...role);
      }
    }
  }

  /**
   * Seed main location
   */
  private seedMainLocation(): void {
    const locationCount = this.db.prepare('SELECT COUNT(*) as count FROM locations').get() as { count: number };
    
    if (locationCount.count === 0) {
      this.db.prepare(`
        INSERT INTO locations (name, name_en, type, address, city, governorate)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('المتجر الرئيسي', 'Main Store', 'main', 'العنوان الرئيسي', 'القاهرة', 'القاهرة');
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}

export default Phase2Migration;
