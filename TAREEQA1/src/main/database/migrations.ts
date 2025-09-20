import { Kysely, sql } from 'kysely';
import { DatabaseSchema } from './schema';

export interface Migration {
  id: string;
  name: string;
  up: (db: Kysely<DatabaseSchema>) => Promise<void>;
  down: (db: Kysely<DatabaseSchema>) => Promise<void>;
}

// Migration tracking table
const createMigrationsTable = async (db: Kysely<any>) => {
  await db.schema
    .createTable('migrations')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('executed_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
    .execute();
};

// All migrations
const migrations: Migration[] = [
  {
    id: '001',
    name: 'create_users_table',
    up: async (db) => {
      await db.schema
        .createTable('users')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('username', 'text', (col) => col.notNull().unique())
        .addColumn('email', 'text', (col) => col.notNull().unique())
        .addColumn('password_hash', 'text', (col) => col.notNull())
        .addColumn('full_name', 'text', (col) => col.notNull())
        .addColumn('role', 'text', (col) => col.notNull().check(sql`role IN ('admin', 'manager', 'cashier', 'viewer')`))
        .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('last_login', 'text')
        .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .addColumn('updated_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .execute();

      // Create indexes
      await db.schema.createIndex('idx_users_username').on('users').column('username').execute();
      await db.schema.createIndex('idx_users_email').on('users').column('email').execute();
      await db.schema.createIndex('idx_users_role').on('users').column('role').execute();
    },
    down: async (db) => {
      await db.schema.dropTable('users').execute();
    }
  },

  {
    id: '002',
    name: 'create_categories_table',
    up: async (db) => {
      await db.schema
        .createTable('categories')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('description', 'text')
        .addColumn('parent_id', 'integer', (col) => col.references('categories.id'))
        .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .addColumn('updated_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .execute();

      await db.schema.createIndex('idx_categories_parent_id').on('categories').column('parent_id').execute();
      await db.schema.createIndex('idx_categories_name').on('categories').column('name').execute();
    },
    down: async (db) => {
      await db.schema.dropTable('categories').execute();
    }
  },

  {
    id: '003',
    name: 'create_suppliers_table',
    up: async (db) => {
      await db.schema
        .createTable('suppliers')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('contact_person', 'text')
        .addColumn('email', 'text')
        .addColumn('phone', 'text')
        .addColumn('address', 'text')
        .addColumn('tax_number', 'text')
        .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .addColumn('updated_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .execute();

      await db.schema.createIndex('idx_suppliers_name').on('suppliers').column('name').execute();
      await db.schema.createIndex('idx_suppliers_email').on('suppliers').column('email').execute();
    },
    down: async (db) => {
      await db.schema.dropTable('suppliers').execute();
    }
  },

  {
    id: '004',
    name: 'create_products_table',
    up: async (db) => {
      await db.schema
        .createTable('products')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('description', 'text')
        .addColumn('sku', 'text', (col) => col.notNull().unique())
        .addColumn('barcode', 'text', (col) => col.unique())
        .addColumn('category_id', 'integer', (col) => col.references('categories.id'))
        .addColumn('supplier_id', 'integer', (col) => col.references('suppliers.id'))
        .addColumn('cost_price', 'real', (col) => col.notNull().defaultTo(0))
        .addColumn('selling_price', 'real', (col) => col.notNull().defaultTo(0))
        .addColumn('stock_quantity', 'integer', (col) => col.notNull().defaultTo(0))
        .addColumn('min_stock_level', 'integer', (col) => col.notNull().defaultTo(0))
        .addColumn('max_stock_level', 'integer')
        .addColumn('unit', 'text', (col) => col.notNull().defaultTo('pcs'))
        .addColumn('tax_rate', 'real', (col) => col.notNull().defaultTo(0))
        .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('image_path', 'text')
        .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .addColumn('updated_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .execute();

      // Create indexes
      await db.schema.createIndex('idx_products_sku').on('products').column('sku').execute();
      await db.schema.createIndex('idx_products_barcode').on('products').column('barcode').execute();
      await db.schema.createIndex('idx_products_category_id').on('products').column('category_id').execute();
      await db.schema.createIndex('idx_products_supplier_id').on('products').column('supplier_id').execute();
      await db.schema.createIndex('idx_products_name').on('products').column('name').execute();
    },
    down: async (db) => {
      await db.schema.dropTable('products').execute();
    }
  },

  {
    id: '005',
    name: 'create_customers_table',
    up: async (db) => {
      await db.schema
        .createTable('customers')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('email', 'text')
        .addColumn('phone', 'text')
        .addColumn('address', 'text')
        .addColumn('tax_number', 'text')
        .addColumn('credit_limit', 'real', (col) => col.notNull().defaultTo(0))
        .addColumn('current_balance', 'real', (col) => col.notNull().defaultTo(0))
        .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .addColumn('updated_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .execute();

      await db.schema.createIndex('idx_customers_name').on('customers').column('name').execute();
      await db.schema.createIndex('idx_customers_email').on('customers').column('email').execute();
      await db.schema.createIndex('idx_customers_phone').on('customers').column('phone').execute();
    },
    down: async (db) => {
      await db.schema.dropTable('customers').execute();
    }
  },

  {
    id: '006',
    name: 'create_sales_table',
    up: async (db) => {
      await db.schema
        .createTable('sales')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('sale_number', 'text', (col) => col.notNull().unique())
        .addColumn('customer_id', 'integer', (col) => col.references('customers.id'))
        .addColumn('user_id', 'integer', (col) => col.notNull().references('users.id'))
        .addColumn('subtotal', 'real', (col) => col.notNull().defaultTo(0))
        .addColumn('tax_amount', 'real', (col) => col.notNull().defaultTo(0))
        .addColumn('discount_amount', 'real', (col) => col.notNull().defaultTo(0))
        .addColumn('total_amount', 'real', (col) => col.notNull().defaultTo(0))
        .addColumn('payment_method', 'text', (col) => col.notNull().check(sql`payment_method IN ('cash', 'card', 'mobile', 'credit', 'mixed')`))
        .addColumn('payment_status', 'text', (col) => col.notNull().defaultTo('pending').check(sql`payment_status IN ('pending', 'paid', 'partial', 'refunded')`))
        .addColumn('notes', 'text')
        .addColumn('sale_date', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .addColumn('updated_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .execute();

      // Create indexes
      await db.schema.createIndex('idx_sales_sale_number').on('sales').column('sale_number').execute();
      await db.schema.createIndex('idx_sales_customer_id').on('sales').column('customer_id').execute();
      await db.schema.createIndex('idx_sales_user_id').on('sales').column('user_id').execute();
      await db.schema.createIndex('idx_sales_sale_date').on('sales').column('sale_date').execute();
      await db.schema.createIndex('idx_sales_payment_status').on('sales').column('payment_status').execute();
    },
    down: async (db) => {
      await db.schema.dropTable('sales').execute();
    }
  },

  {
    id: '007',
    name: 'create_sale_items_table',
    up: async (db) => {
      await db.schema
        .createTable('sale_items')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('sale_id', 'integer', (col) => col.notNull().references('sales.id').onDelete('cascade'))
        .addColumn('product_id', 'integer', (col) => col.notNull().references('products.id'))
        .addColumn('quantity', 'real', (col) => col.notNull())
        .addColumn('unit_price', 'real', (col) => col.notNull())
        .addColumn('discount_amount', 'real', (col) => col.notNull().defaultTo(0))
        .addColumn('tax_amount', 'real', (col) => col.notNull().defaultTo(0))
        .addColumn('total_amount', 'real', (col) => col.notNull())
        .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .execute();

      await db.schema.createIndex('idx_sale_items_sale_id').on('sale_items').column('sale_id').execute();
      await db.schema.createIndex('idx_sale_items_product_id').on('sale_items').column('product_id').execute();
    },
    down: async (db) => {
      await db.schema.dropTable('sale_items').execute();
    }
  },

  {
    id: '008',
    name: 'create_inventory_movements_table',
    up: async (db) => {
      await db.schema
        .createTable('inventory_movements')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('product_id', 'integer', (col) => col.notNull().references('products.id'))
        .addColumn('movement_type', 'text', (col) => col.notNull().check(sql`movement_type IN ('in', 'out', 'adjustment', 'transfer')`))
        .addColumn('quantity', 'real', (col) => col.notNull())
        .addColumn('unit_cost', 'real')
        .addColumn('reference_type', 'text', (col) => col.notNull().check(sql`reference_type IN ('sale', 'purchase', 'adjustment', 'return', 'transfer')`))
        .addColumn('reference_id', 'integer')
        .addColumn('notes', 'text')
        .addColumn('user_id', 'integer', (col) => col.notNull().references('users.id'))
        .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .execute();

      await db.schema.createIndex('idx_inventory_movements_product_id').on('inventory_movements').column('product_id').execute();
      await db.schema.createIndex('idx_inventory_movements_created_at').on('inventory_movements').column('created_at').execute();
      await db.schema.createIndex('idx_inventory_movements_reference').on('inventory_movements').columns(['reference_type', 'reference_id']).execute();
    },
    down: async (db) => {
      await db.schema.dropTable('inventory_movements').execute();
    }
  },

  {
    id: '009',
    name: 'create_settings_table',
    up: async (db) => {
      await db.schema
        .createTable('settings')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('key', 'text', (col) => col.notNull().unique())
        .addColumn('value', 'text', (col) => col.notNull())
        .addColumn('description', 'text')
        .addColumn('category', 'text', (col) => col.notNull())
        .addColumn('is_encrypted', 'boolean', (col) => col.notNull().defaultTo(false))
        .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .addColumn('updated_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .execute();

      await db.schema.createIndex('idx_settings_key').on('settings').column('key').execute();
      await db.schema.createIndex('idx_settings_category').on('settings').column('category').execute();
    },
    down: async (db) => {
      await db.schema.dropTable('settings').execute();
    }
  },

  {
    id: '010',
    name: 'create_audit_log_table',
    up: async (db) => {
      await db.schema
        .createTable('audit_log')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('user_id', 'integer', (col) => col.references('users.id'))
        .addColumn('action', 'text', (col) => col.notNull())
        .addColumn('table_name', 'text', (col) => col.notNull())
        .addColumn('record_id', 'integer')
        .addColumn('old_values', 'text')
        .addColumn('new_values', 'text')
        .addColumn('ip_address', 'text')
        .addColumn('user_agent', 'text')
        .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`datetime('now')`))
        .execute();

      await db.schema.createIndex('idx_audit_log_user_id').on('audit_log').column('user_id').execute();
      await db.schema.createIndex('idx_audit_log_created_at').on('audit_log').column('created_at').execute();
      await db.schema.createIndex('idx_audit_log_table_record').on('audit_log').columns(['table_name', 'record_id']).execute();
    },
    down: async (db) => {
      await db.schema.dropTable('audit_log').execute();
    }
  }
];

// Insert default data
const insertDefaultData = async (db: Kysely<DatabaseSchema>) => {
  // Insert default admin user
  const adminExists = await db
    .selectFrom('users')
    .select('id')
    .where('username', '=', 'admin')
    .executeTakeFirst();

  if (!adminExists) {
    await db
      .insertInto('users')
      .values({
        username: 'admin',
        email: 'admin@tareeqa.com',
        password_hash: '$2b$10$8K1p/a0dclxKoNqIiVHb.eUXrce9kdXiTlMGpv/Wvb7.7.7.7.7.7', // 'admin123'
        full_name: 'System Administrator',
        role: 'admin',
        is_active: true
      })
      .execute();
  }

  // Insert default settings
  const defaultSettings = [
    { key: 'company_name', value: 'Tareeqa POS', description: 'Company name', category: 'general', is_encrypted: false },
    { key: 'company_address', value: '', description: 'Company address', category: 'general', is_encrypted: false },
    { key: 'company_phone', value: '', description: 'Company phone', category: 'general', is_encrypted: false },
    { key: 'company_email', value: '', description: 'Company email', category: 'general', is_encrypted: false },
    { key: 'tax_number', value: '', description: 'Tax registration number', category: 'general', is_encrypted: false },
    { key: 'currency', value: 'EGP', description: 'Default currency', category: 'general', is_encrypted: false },
    { key: 'language', value: 'ar', description: 'Default language', category: 'general', is_encrypted: false },
    { key: 'timezone', value: 'Africa/Cairo', description: 'Default timezone', category: 'general', is_encrypted: false },
    { key: 'receipt_printer', value: '', description: 'Receipt printer name', category: 'hardware', is_encrypted: false },
    { key: 'barcode_scanner', value: '', description: 'Barcode scanner configuration', category: 'hardware', is_encrypted: false },
    { key: 'cash_drawer', value: '', description: 'Cash drawer configuration', category: 'hardware', is_encrypted: false },
    { key: 'backup_enabled', value: 'true', description: 'Enable automatic backups', category: 'system', is_encrypted: false },
    { key: 'backup_frequency', value: 'daily', description: 'Backup frequency', category: 'system', is_encrypted: false },
    { key: 'low_stock_alert', value: 'true', description: 'Enable low stock alerts', category: 'inventory', is_encrypted: false },
    { key: 'auto_print_receipt', value: 'true', description: 'Auto print receipt after sale', category: 'pos', is_encrypted: false }
  ];

  for (const setting of defaultSettings) {
    const exists = await db
      .selectFrom('settings')
      .select('id')
      .where('key', '=', setting.key)
      .executeTakeFirst();

    if (!exists) {
      await db
        .insertInto('settings')
        .values(setting)
        .execute();
    }
  }

  // Insert default category
  const categoryExists = await db
    .selectFrom('categories')
    .select('id')
    .where('name', '=', 'General')
    .executeTakeFirst();

  if (!categoryExists) {
    await db
      .insertInto('categories')
      .values({
        name: 'General',
        description: 'General products category',
        is_active: true
      })
      .execute();
  }
};

// Main migration runner
export const runMigrations = async (db: Kysely<DatabaseSchema>): Promise<void> => {
  console.log('Starting database migrations...');

  try {
    // Create migrations tracking table
    await createMigrationsTable(db);

    // Get executed migrations
    const executedMigrations = await db
      .selectFrom('migrations' as any)
      .select(['id'])
      .execute();

    const executedIds = new Set(executedMigrations.map(m => m.id));

    // Run pending migrations
    for (const migration of migrations) {
      if (!executedIds.has(migration.id)) {
        console.log(`Running migration: ${migration.name}`);
        
        await db.transaction().execute(async (trx) => {
          await migration.up(trx);
          
          await trx
            .insertInto('migrations' as any)
            .values({
              id: migration.id,
              name: migration.name
            })
            .execute();
        });

        console.log(`Migration completed: ${migration.name}`);
      }
    }

    // Insert default data
    await insertDefaultData(db);

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Rollback last migration
export const rollbackLastMigration = async (db: Kysely<DatabaseSchema>): Promise<void> => {
  const lastMigration = await db
    .selectFrom('migrations' as any)
    .selectAll()
    .orderBy('executed_at', 'desc')
    .executeTakeFirst();

  if (!lastMigration) {
    console.log('No migrations to rollback');
    return;
  }

  const migration = migrations.find(m => m.id === lastMigration.id);
  if (!migration) {
    throw new Error(`Migration ${lastMigration.id} not found`);
  }

  console.log(`Rolling back migration: ${migration.name}`);

  await db.transaction().execute(async (trx) => {
    await migration.down(trx);
    
    await trx
      .deleteFrom('migrations' as any)
      .where('id', '=', migration.id)
      .execute();
  });

  console.log(`Migration rolled back: ${migration.name}`);
};
