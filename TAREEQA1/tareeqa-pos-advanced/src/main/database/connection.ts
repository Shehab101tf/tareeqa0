import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';

/**
 * Database Service for Tareeqa POS
 * Handles SQLite database operations with encryption and migrations
 */
export class DatabaseService {
  private db: Database.Database | null = null;
  private readonly dbPath: string;
  private readonly backupPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    const dbDir = join(userDataPath, 'database');
    
    // Ensure database directory exists
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }
    
    this.dbPath = join(dbDir, 'tareeqa.db');
    this.backupPath = join(dbDir, 'backups');
    
    // Ensure backup directory exists
    if (!existsSync(this.backupPath)) {
      mkdirSync(this.backupPath, { recursive: true });
    }
  }

  /**
   * Initialize database connection and run migrations
   */
  async initialize(): Promise<void> {
    console.log('📊 Initializing database connection...');
    
    try {
      // Open database with optimized settings
      this.db = new Database(this.dbPath, {
        verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
        fileMustExist: false
      });

      // Configure database settings
      this.configurePragmas();
      
      // Run migrations
      await this.runMigrations();
      
      // Create indexes for performance
      this.createIndexes();
      
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Configure SQLite pragmas for optimal performance
   */
  private configurePragmas(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Performance optimizations
    this.db.pragma('journal_mode = WAL'); // Write-Ahead Logging
    this.db.pragma('synchronous = NORMAL'); // Balanced safety/performance
    this.db.pragma('cache_size = 1000'); // Cache size in pages
    this.db.pragma('temp_store = memory'); // Store temp tables in memory
    this.db.pragma('mmap_size = 268435456'); // 256MB memory map
    
    // Foreign key constraints
    this.db.pragma('foreign_keys = ON');
    
    // Auto vacuum for space management
    this.db.pragma('auto_vacuum = INCREMENTAL');
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    console.log('🔄 Running database migrations...');
    
    if (!this.db) throw new Error('Database not initialized');

    // Create migrations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrations = [
      { version: 1, name: 'initial_schema', sql: this.getInitialSchemaSql() },
      { version: 2, name: 'add_indexes', sql: this.getIndexesSql() },
      { version: 3, name: 'add_audit_tables', sql: this.getAuditTablesSql() }
    ];

    for (const migration of migrations) {
      const existing = this.db.prepare('SELECT version FROM migrations WHERE version = ?').get(migration.version);
      
      if (!existing) {
        console.log(`📝 Running migration ${migration.version}: ${migration.name}`);
        
        const transaction = this.db.transaction(() => {
          this.db!.exec(migration.sql);
          this.db!.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)').run(migration.version, migration.name);
        });
        
        transaction();
      }
    }
  }

  /**
   * Get initial database schema
   */
  private getInitialSchemaSql(): string {
    return `
      -- Categories table
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_arabic TEXT NOT NULL,
        description TEXT,
        parent_id INTEGER,
        is_active BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id)
      );

      -- Products table with Arabic support
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL,
        barcode TEXT UNIQUE,
        qr_code TEXT,
        name TEXT NOT NULL,
        name_arabic TEXT NOT NULL,
        description TEXT,
        description_arabic TEXT,
        price DECIMAL(10,2) NOT NULL,
        cost DECIMAL(10,2) DEFAULT 0,
        stock_quantity INTEGER DEFAULT 0,
        min_stock_level INTEGER DEFAULT 0,
        max_stock_level INTEGER DEFAULT 1000,
        category_id INTEGER,
        tax_rate DECIMAL(5,2) DEFAULT 14.00,
        is_active BOOLEAN DEFAULT 1,
        is_service BOOLEAN DEFAULT 0,
        weight DECIMAL(8,3) DEFAULT 0,
        dimensions TEXT, -- JSON: {length, width, height}
        image_path TEXT,
        gallery_paths TEXT, -- JSON array of image paths
        tags TEXT, -- JSON array of tags
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );

      -- Product variants (size, color, style)
      CREATE TABLE product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        variant_type TEXT NOT NULL, -- 'size', 'color', 'style'
        variant_value TEXT NOT NULL,
        variant_value_arabic TEXT,
        price_adjustment DECIMAL(10,2) DEFAULT 0,
        stock_quantity INTEGER DEFAULT 0,
        sku_suffix TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );

      -- Customers table
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_code TEXT UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        address TEXT,
        city TEXT,
        governorate TEXT,
        postal_code TEXT,
        tax_id TEXT,
        customer_type TEXT DEFAULT 'individual', -- 'individual', 'business'
        credit_limit DECIMAL(12,2) DEFAULT 0,
        current_balance DECIMAL(12,2) DEFAULT 0,
        loyalty_points INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Users and authentication
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier', 'stock_clerk', 'accountant')),
        permissions TEXT, -- JSON array of permissions
        is_active BOOLEAN DEFAULT 1,
        last_login DATETIME,
        login_attempts INTEGER DEFAULT 0,
        locked_until DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Transactions table
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER,
        cashier_id INTEGER NOT NULL,
        transaction_date DATETIME NOT NULL,
        transaction_type TEXT DEFAULT 'sale', -- 'sale', 'return', 'exchange'
        subtotal DECIMAL(12,2) NOT NULL,
        tax_amount DECIMAL(12,2) DEFAULT 0,
        discount_amount DECIMAL(12,2) DEFAULT 0,
        discount_type TEXT, -- 'percentage', 'fixed'
        total_amount DECIMAL(12,2) NOT NULL,
        amount_paid DECIMAL(12,2) NOT NULL,
        change_amount DECIMAL(12,2) DEFAULT 0,
        payment_method TEXT NOT NULL,
        payment_reference TEXT,
        status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'cancelled', 'refunded'
        notes TEXT,
        receipt_printed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (cashier_id) REFERENCES users(id)
      );

      -- Transaction items
      CREATE TABLE transaction_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        product_name TEXT NOT NULL,
        product_name_arabic TEXT,
        sku TEXT NOT NULL,
        quantity DECIMAL(10,3) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        tax_rate DECIMAL(5,2) DEFAULT 14.00,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        line_total DECIMAL(12,2) NOT NULL,
        cost_price DECIMAL(10,2) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (variant_id) REFERENCES product_variants(id)
      );

      -- Payment methods
      CREATE TABLE payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_arabic TEXT NOT NULL,
        type TEXT NOT NULL, -- 'cash', 'card', 'digital', 'bank_transfer'
        is_active BOOLEAN DEFAULT 1,
        requires_reference BOOLEAN DEFAULT 0,
        icon_path TEXT,
        sort_order INTEGER DEFAULT 0
      );

      -- Stock movements
      CREATE TABLE stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
        quantity DECIMAL(10,3) NOT NULL,
        reference_type TEXT, -- 'sale', 'purchase', 'adjustment', 'return'
        reference_id INTEGER,
        unit_cost DECIMAL(10,2),
        notes TEXT,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (variant_id) REFERENCES product_variants(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      -- System settings
      CREATE TABLE settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        data_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
        description TEXT,
        is_encrypted BOOLEAN DEFAULT 0,
        updated_by INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, key),
        FOREIGN KEY (updated_by) REFERENCES users(id)
      );

      -- Insert default payment methods
      INSERT INTO payment_methods (name, name_arabic, type, is_active, requires_reference) VALUES
      ('Cash', 'نقداً', 'cash', 1, 0),
      ('Visa/Mastercard', 'فيزا/ماستركارد', 'card', 1, 1),
      ('Fawry', 'فوري', 'digital', 1, 1),
      ('Vodafone Cash', 'فودافون كاش', 'digital', 1, 1),
      ('Orange Money', 'أورانج موني', 'digital', 1, 1),
      ('Etisalat Cash', 'اتصالات كاش', 'digital', 1, 1);

      -- Insert default categories
      INSERT INTO categories (name, name_arabic, description) VALUES
      ('Food & Beverages', 'أطعمة ومشروبات', 'Food and drink products'),
      ('Electronics', 'إلكترونيات', 'Electronic devices and accessories'),
      ('Clothing', 'ملابس', 'Clothing and fashion items'),
      ('Home & Garden', 'منزل وحديقة', 'Home and garden products'),
      ('Health & Beauty', 'صحة وجمال', 'Health and beauty products');

      -- Insert default admin user (password: admin123)
      INSERT INTO users (username, password_hash, first_name, last_name, email, role, permissions) VALUES
      ('admin', '$2b$10$rOmAhWvgMgvBqJo6.6uMEOvKvQgF8yF8yF8yF8yF8yF8yF8yF8yF8y', 'مدير', 'النظام', 'admin@tareeqa.pos', 'admin', '["*"]');

      -- Insert system settings
      INSERT INTO settings (category, key, value, description) VALUES
      ('general', 'store_name', 'متجر طريقة', 'Store name'),
      ('general', 'store_name_english', 'Tareeqa Store', 'Store name in English'),
      ('general', 'currency', 'EGP', 'Default currency'),
      ('general', 'currency_symbol', 'ج.م', 'Currency symbol'),
      ('general', 'tax_rate', '14.00', 'Default tax rate (%)'),
      ('general', 'language', 'ar', 'Default language'),
      ('general', 'rtl_mode', 'true', 'RTL mode enabled'),
      ('receipt', 'header_text', 'متجر طريقة - فاتورة ضريبية', 'Receipt header text'),
      ('receipt', 'footer_text', 'شكراً لزيارتكم', 'Receipt footer text'),
      ('receipt', 'print_logo', 'true', 'Print logo on receipt'),
      ('hardware', 'barcode_scanner_enabled', 'true', 'Enable barcode scanner'),
      ('hardware', 'receipt_printer_enabled', 'true', 'Enable receipt printer'),
      ('hardware', 'cash_drawer_enabled', 'true', 'Enable cash drawer');
    `;
  }

  /**
   * Get indexes SQL
   */
  private getIndexesSql(): string {
    return `
      -- Performance indexes
      CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
      CREATE INDEX IF NOT EXISTS idx_transactions_cashier ON transactions(cashier_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
      CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(product_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
      
      -- Full-text search indexes
      CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
        name, name_arabic, description, description_arabic, sku, barcode,
        content='products', content_rowid='id'
      );
      
      -- Triggers to maintain FTS index
      CREATE TRIGGER IF NOT EXISTS products_fts_insert AFTER INSERT ON products BEGIN
        INSERT INTO products_fts(rowid, name, name_arabic, description, description_arabic, sku, barcode)
        VALUES (new.id, new.name, new.name_arabic, new.description, new.description_arabic, new.sku, new.barcode);
      END;
      
      CREATE TRIGGER IF NOT EXISTS products_fts_delete AFTER DELETE ON products BEGIN
        DELETE FROM products_fts WHERE rowid = old.id;
      END;
      
      CREATE TRIGGER IF NOT EXISTS products_fts_update AFTER UPDATE ON products BEGIN
        DELETE FROM products_fts WHERE rowid = old.id;
        INSERT INTO products_fts(rowid, name, name_arabic, description, description_arabic, sku, barcode)
        VALUES (new.id, new.name, new.name_arabic, new.description, new.description_arabic, new.sku, new.barcode);
      END;
    `;
  }

  /**
   * Get audit tables SQL
   */
  private getAuditTablesSql(): string {
    return `
      -- Audit log table
      CREATE TABLE audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
        old_values TEXT, -- JSON
        new_values TEXT, -- JSON
        user_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      
      -- System events log
      CREATE TABLE system_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        event_data TEXT, -- JSON
        severity TEXT DEFAULT 'info', -- 'debug', 'info', 'warning', 'error', 'critical'
        user_id INTEGER,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
      CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log(record_id);
      CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_system_events_type ON system_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_system_events_user ON system_events(user_id);
    `;
  }

  /**
   * Create additional performance indexes
   */
  private createIndexes(): void {
    if (!this.db) return;

    console.log('📈 Creating performance indexes...');
    
    // Additional composite indexes for common queries
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_transactions_date_cashier ON transactions(transaction_date, cashier_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active)',
      'CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_product ON transaction_items(transaction_id, product_id)'
    ];

    for (const indexSql of indexes) {
      try {
        this.db.exec(indexSql);
      } catch (error) {
        console.warn('⚠️ Index creation warning:', error);
      }
    }
  }

  /**
   * Execute a query and return results
   */
  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const stmt = this.db.prepare(sql);
      return params ? stmt.all(...params) : stmt.all();
    } catch (error) {
      console.error('❌ Query error:', error, { sql, params });
      throw error;
    }
  }

  /**
   * Execute a statement and return info
   */
  async run(sql: string, params?: any[]): Promise<Database.RunResult> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const stmt = this.db.prepare(sql);
      return params ? stmt.run(...params) : stmt.run();
    } catch (error) {
      console.error('❌ Run error:', error, { sql, params });
      throw error;
    }
  }

  /**
   * Execute multiple statements in a transaction
   */
  async transaction(operations: (() => void)[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const txn = this.db.transaction(() => {
      for (const operation of operations) {
        operation();
      }
    });
    
    txn();
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      console.log('🔒 Closing database connection...');
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Create database backup
   */
  async backup(): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = join(this.backupPath, `tareeqa-backup-${timestamp}.db`);
    
    await this.db.backup(backupFile);
    console.log(`💾 Database backed up to: ${backupFile}`);
    
    return backupFile;
  }

  /**
   * Get database statistics
   */
  getStats(): any {
    if (!this.db) throw new Error('Database not initialized');
    
    const stats = {
      products: this.db.prepare('SELECT COUNT(*) as count FROM products').get(),
      transactions: this.db.prepare('SELECT COUNT(*) as count FROM transactions').get(),
      customers: this.db.prepare('SELECT COUNT(*) as count FROM customers').get(),
      users: this.db.prepare('SELECT COUNT(*) as count FROM users').get(),
      dbSize: this.db.prepare('PRAGMA page_count').get(),
      pageSize: this.db.prepare('PRAGMA page_size').get()
    };
    
    return stats;
  }
}
