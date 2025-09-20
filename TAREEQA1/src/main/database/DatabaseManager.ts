// Database Manager - SQLite + SQLCipher Encryption - Windows 7+ Compatible
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { app } from 'electron';

export interface Product {
  id?: number;
  name: string;
  nameEn?: string;
  sku: string;
  barcode?: string;
  category: string;
  supplier?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  isActive: boolean;
  vat?: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id?: number;
  items: TransactionItem[];
  subtotal: number;
  vatAmount: number;
  discountAmount?: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'meeza' | 'bank-transfer';
  customerId?: number;
  cashierId?: number;
  receiptNumber?: string;
  createdAt?: string;
}

export interface TransactionItem {
  id?: number;
  transactionId?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
}

export interface Customer {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints?: number;
  createdAt?: string;
}

export class DatabaseManager {
  private db: Database.Database;
  private readonly dbPath: string;
  private readonly encryptionKey: string;
  private isInitialized = false;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(app.getPath('userData'), 'tareeqa_pos.db');
    this.encryptionKey = this.generateOrRetrieveKey();
    this.initializeDatabase();
  }

  /**
   * Initialize database with encryption
   */
  private initializeDatabase(): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Initialize Better-SQLite3 database
      this.db = new Database(this.dbPath);

      // Enable SQLCipher encryption (if available)
      try {
        this.db.pragma(`key = '${this.encryptionKey}'`);
        this.db.pragma('cipher_compatibility = 4');
      } catch (error) {
        console.warn('SQLCipher not available, using unencrypted database:', error);
      }

      // Configure database settings for performance and reliability
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 1000');
      this.db.pragma('temp_store = memory');
      this.db.pragma('mmap_size = 268435456'); // 256MB

      // Create tables
      this.createTables();
      this.seedInitialData();

      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Generate or retrieve encryption key
   */
  private generateOrRetrieveKey(): string {
    const keyPath = path.join(app.getPath('userData'), '.db_key');
    
    try {
      if (fs.existsSync(keyPath)) {
        return fs.readFileSync(keyPath, 'utf8');
      }
    } catch (error) {
      console.warn('Could not read existing key:', error);
    }

    // Generate new key
    const key = crypto.randomBytes(32).toString('hex');
    
    try {
      fs.writeFileSync(keyPath, key, { mode: 0o600 });
    } catch (error) {
      console.warn('Could not save encryption key:', error);
    }

    return key;
  }

  /**
   * Create database tables
   */
  private createTables(): void {
    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_en TEXT,
        sku TEXT UNIQUE NOT NULL,
        barcode TEXT UNIQUE,
        category TEXT NOT NULL,
        supplier TEXT,
        cost_price REAL NOT NULL DEFAULT 0,
        selling_price REAL NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'قطعة',
        is_active BOOLEAN NOT NULL DEFAULT 1,
        vat REAL DEFAULT 14,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        address TEXT,
        loyalty_points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subtotal REAL NOT NULL,
        vat_amount REAL NOT NULL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL,
        customer_id INTEGER,
        cashier_id INTEGER,
        receipt_number TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      )
    `);

    // Transaction items table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    // Users table (for multi-user support)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'cashier',
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (created_at);
      CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items (transaction_id);
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);
    `);

    console.log('✅ Database tables created successfully');
  }

  /**
   * Seed initial data
   */
  private seedInitialData(): void {
    try {
      // Check if data already exists
      const productCount = this.db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
      
      if (productCount.count === 0) {
        // Insert sample products
        const insertProduct = this.db.prepare(`
          INSERT INTO products (name, name_en, sku, barcode, category, cost_price, selling_price, stock, min_stock, unit, vat)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const sampleProducts = [
          ['كوكاكولا 330مل', 'Coca Cola 330ml', 'COCA-330', '6224000123456', 'مشروبات', 4.00, 5.50, 50, 10, 'قطعة', 14],
          ['شيبسي 50جم', 'Chips 50g', 'CHIPS-50', '6224000123457', 'وجبات خفيفة', 2.50, 3.25, 30, 15, 'قطعة', 14],
          ['خبز أبيض', 'White Bread', 'BREAD-WHITE', '6224000123458', 'مخبوزات', 1.50, 2.00, 25, 20, 'رغيف', 14],
          ['لبن جهينة 1لتر', 'Juhayna Milk 1L', 'MILK-1L', '6224000123459', 'ألبان', 10.00, 12.75, 15, 10, 'عبوة', 14]
        ];

        const insertMany = this.db.transaction((products: any[]) => {
          for (const product of products) {
            insertProduct.run(...product);
          }
        });

        insertMany(sampleProducts);
        console.log('✅ Sample products inserted');
      }

      // Create default admin user if none exists
      const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      
      if (userCount.count === 0) {
        const passwordHash = crypto.createHash('sha256').update('admin123').digest('hex');
        this.db.prepare(`
          INSERT INTO users (username, password_hash, full_name, role)
          VALUES (?, ?, ?, ?)
        `).run('admin', passwordHash, 'مدير النظام', 'admin');
        
        console.log('✅ Default admin user created');
      }

    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  }

  /**
   * Product operations
   */
  public products = {
    create: (product: Omit<Product, 'id'>): Product => {
      const stmt = this.db.prepare(`
        INSERT INTO products (name, name_en, sku, barcode, category, supplier, cost_price, selling_price, stock, min_stock, unit, is_active, vat, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        product.name, product.nameEn, product.sku, product.barcode,
        product.category, product.supplier, product.costPrice, product.sellingPrice,
        product.stock, product.minStock, product.unit, product.isActive ? 1 : 0,
        product.vat || 14, product.image
      );
      
      return { ...product, id: result.lastInsertRowid as number };
    },

    findById: (id: number): Product | null => {
      const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
      const row = stmt.get(id) as any;
      return row ? this.mapProductRow(row) : null;
    },

    findByBarcode: (barcode: string): Product | null => {
      const stmt = this.db.prepare('SELECT * FROM products WHERE barcode = ?');
      const row = stmt.get(barcode) as any;
      return row ? this.mapProductRow(row) : null;
    },

    search: (term: string): Product[] => {
      const stmt = this.db.prepare(`
        SELECT * FROM products 
        WHERE name LIKE ? OR name_en LIKE ? OR sku LIKE ? OR barcode LIKE ?
        ORDER BY name
      `);
      const searchTerm = `%${term}%`;
      const rows = stmt.all(searchTerm, searchTerm, searchTerm, searchTerm) as any[];
      return rows.map(row => this.mapProductRow(row));
    },

    getAll: (): Product[] => {
      const stmt = this.db.prepare('SELECT * FROM products ORDER BY name');
      const rows = stmt.all() as any[];
      return rows.map(row => this.mapProductRow(row));
    },

    update: (id: number, updates: Partial<Product>): boolean => {
      const fields = Object.keys(updates).filter(key => key !== 'id');
      if (fields.length === 0) return false;

      const setClause = fields.map(field => `${this.camelToSnake(field)} = ?`).join(', ');
      const values = fields.map(field => (updates as any)[field]);
      
      const stmt = this.db.prepare(`UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
      const result = stmt.run(...values, id);
      return result.changes > 0;
    },

    delete: (id: number): boolean => {
      const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    },

    updateStock: (productId: number, quantity: number): boolean => {
      const stmt = this.db.prepare('UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      const result = stmt.run(quantity, productId);
      return result.changes > 0;
    }
  };

  /**
   * Transaction operations
   */
  public transactions = {
    create: (transaction: Omit<Transaction, 'id'>): Transaction => {
      const createTransaction = this.db.transaction((txn: Omit<Transaction, 'id'>) => {
        // Generate receipt number
        const receiptNumber = `RCP-${Date.now()}`;
        
        // Insert transaction
        const txnStmt = this.db.prepare(`
          INSERT INTO transactions (subtotal, vat_amount, discount_amount, total, payment_method, customer_id, cashier_id, receipt_number)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const txnResult = txnStmt.run(
          txn.subtotal, txn.vatAmount, txn.discountAmount || 0, txn.total,
          txn.paymentMethod, txn.customerId, txn.cashierId, receiptNumber
        );
        
        const transactionId = txnResult.lastInsertRowid as number;
        
        // Insert transaction items
        const itemStmt = this.db.prepare(`
          INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price, discount)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        for (const item of txn.items) {
          itemStmt.run(transactionId, item.productId, item.quantity, item.unitPrice, item.totalPrice, item.discount || 0);
          
          // Update product stock
          this.products.updateStock(item.productId, -item.quantity);
        }
        
        return { ...txn, id: transactionId, receiptNumber };
      });
      
      return createTransaction(transaction);
    },

    findById: (id: number): Transaction | null => {
      const txnStmt = this.db.prepare('SELECT * FROM transactions WHERE id = ?');
      const txnRow = txnStmt.get(id) as any;
      
      if (!txnRow) return null;
      
      const itemsStmt = this.db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?');
      const itemRows = itemsStmt.all(id) as any[];
      
      return {
        ...this.mapTransactionRow(txnRow),
        items: itemRows.map(row => this.mapTransactionItemRow(row))
      };
    },

    getByDateRange: (startDate: string, endDate: string): Transaction[] => {
      const stmt = this.db.prepare(`
        SELECT * FROM transactions 
        WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
        ORDER BY created_at DESC
      `);
      const rows = stmt.all(startDate, endDate) as any[];
      return rows.map(row => this.mapTransactionRow(row));
    },

    getDailySales: (date: string): { count: number; total: number } => {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
        FROM transactions 
        WHERE DATE(created_at) = DATE(?)
      `);
      return stmt.get(date) as { count: number; total: number };
    }
  };

  /**
   * Customer operations
   */
  public customers = {
    create: (customer: Omit<Customer, 'id'>): Customer => {
      const stmt = this.db.prepare(`
        INSERT INTO customers (name, email, phone, address, loyalty_points)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        customer.name, customer.email, customer.phone, 
        customer.address, customer.loyaltyPoints || 0
      );
      
      return { ...customer, id: result.lastInsertRowid as number };
    },

    findById: (id: number): Customer | null => {
      const stmt = this.db.prepare('SELECT * FROM customers WHERE id = ?');
      const row = stmt.get(id) as any;
      return row ? this.mapCustomerRow(row) : null;
    },

    findByPhone: (phone: string): Customer | null => {
      const stmt = this.db.prepare('SELECT * FROM customers WHERE phone = ?');
      const row = stmt.get(phone) as any;
      return row ? this.mapCustomerRow(row) : null;
    },

    search: (term: string): Customer[] => {
      const stmt = this.db.prepare(`
        SELECT * FROM customers 
        WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
        ORDER BY name
      `);
      const searchTerm = `%${term}%`;
      const rows = stmt.all(searchTerm, searchTerm, searchTerm) as any[];
      return rows.map(row => this.mapCustomerRow(row));
    }
  };

  /**
   * Utility methods for mapping database rows to objects
   */
  private mapProductRow(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      nameEn: row.name_en,
      sku: row.sku,
      barcode: row.barcode,
      category: row.category,
      supplier: row.supplier,
      costPrice: row.cost_price,
      sellingPrice: row.selling_price,
      stock: row.stock,
      minStock: row.min_stock,
      unit: row.unit,
      isActive: Boolean(row.is_active),
      vat: row.vat,
      image: row.image,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapTransactionRow(row: any): Transaction {
    return {
      id: row.id,
      items: [], // Will be populated separately
      subtotal: row.subtotal,
      vatAmount: row.vat_amount,
      discountAmount: row.discount_amount,
      total: row.total,
      paymentMethod: row.payment_method,
      customerId: row.customer_id,
      cashierId: row.cashier_id,
      receiptNumber: row.receipt_number,
      createdAt: row.created_at
    };
  }

  private mapTransactionItemRow(row: any): TransactionItem {
    return {
      id: row.id,
      transactionId: row.transaction_id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalPrice: row.total_price,
      discount: row.discount
    };
  }

  private mapCustomerRow(row: any): Customer {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      loyaltyPoints: row.loyalty_points,
      createdAt: row.created_at
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Database maintenance operations
   */
  public maintenance = {
    backup: async (backupPath: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          this.db.backup(backupPath)
            .then(() => {
              console.log(`✅ Database backed up to: ${backupPath}`);
              resolve();
            })
            .catch(reject);
        } catch (error) {
          reject(error);
        }
      });
    },

    vacuum: (): void => {
      this.db.exec('VACUUM');
      console.log('✅ Database vacuumed');
    },

    analyze: (): void => {
      this.db.exec('ANALYZE');
      console.log('✅ Database analyzed');
    },

    getStats: (): any => {
      const stats = {
        products: this.db.prepare('SELECT COUNT(*) as count FROM products').get(),
        transactions: this.db.prepare('SELECT COUNT(*) as count FROM transactions').get(),
        customers: this.db.prepare('SELECT COUNT(*) as count FROM customers').get(),
        dbSize: fs.statSync(this.dbPath).size
      };
      return stats;
    }
  };

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      console.log('✅ Database connection closed');
    }
  }

  /**
   * Get raw database instance (for advanced operations)
   */
  get raw(): Database.Database {
    return this.db;
  }

  /**
   * Check if database is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

export default DatabaseManager;
