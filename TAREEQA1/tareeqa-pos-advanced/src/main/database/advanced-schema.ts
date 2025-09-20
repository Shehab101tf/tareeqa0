/**
 * Advanced Database Schema for Tareeqa POS Phase 2
 * Enhanced inventory, customer management, reporting, and multi-location support
 */

export const getAdvancedSchemaSql = (): string => {
  return `
    -- Enhanced Product Pricing System
    CREATE TABLE IF NOT EXISTS product_pricing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      pricing_tier TEXT NOT NULL CHECK (pricing_tier IN ('retail', 'wholesale', 'vip', 'employee')),
      price DECIMAL(10,2) NOT NULL,
      min_quantity INTEGER DEFAULT 1,
      max_quantity INTEGER,
      start_date DATE,
      end_date DATE,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Product Variants (Size, Color, Style)
    CREATE TABLE IF NOT EXISTS product_variants_enhanced (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      variant_name TEXT NOT NULL,
      variant_name_arabic TEXT,
      variant_type TEXT NOT NULL CHECK (variant_type IN ('size', 'color', 'style', 'material', 'brand')),
      variant_value TEXT NOT NULL,
      variant_value_arabic TEXT,
      sku_suffix TEXT,
      price_adjustment DECIMAL(10,2) DEFAULT 0,
      cost_adjustment DECIMAL(10,2) DEFAULT 0,
      stock_quantity INTEGER DEFAULT 0,
      min_stock_level INTEGER DEFAULT 0,
      max_stock_level INTEGER DEFAULT 1000,
      weight DECIMAL(8,3) DEFAULT 0,
      dimensions TEXT, -- JSON: {length, width, height}
      barcode TEXT UNIQUE,
      image_path TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Suppliers Management
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_code TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      company_name_arabic TEXT,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      governorate TEXT,
      postal_code TEXT,
      tax_id TEXT,
      payment_terms INTEGER DEFAULT 30, -- Days
      credit_limit DECIMAL(12,2) DEFAULT 0,
      current_balance DECIMAL(12,2) DEFAULT 0,
      supplier_type TEXT DEFAULT 'local' CHECK (supplier_type IN ('local', 'international', 'manufacturer', 'distributor')),
      rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
      notes TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Purchase Orders
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_number TEXT UNIQUE NOT NULL,
      supplier_id INTEGER NOT NULL,
      order_date DATE NOT NULL,
      expected_delivery_date DATE,
      actual_delivery_date DATE,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'partial_received', 'received', 'cancelled')),
      subtotal DECIMAL(12,2) NOT NULL,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      shipping_cost DECIMAL(10,2) DEFAULT 0,
      total_amount DECIMAL(12,2) NOT NULL,
      notes TEXT,
      created_by INTEGER NOT NULL,
      approved_by INTEGER,
      received_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (approved_by) REFERENCES users(id),
      FOREIGN KEY (received_by) REFERENCES users(id)
    );

    -- Purchase Order Items
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      quantity_ordered DECIMAL(10,3) NOT NULL,
      quantity_received DECIMAL(10,3) DEFAULT 0,
      unit_cost DECIMAL(10,2) NOT NULL,
      line_total DECIMAL(12,2) NOT NULL,
      expiration_date DATE,
      lot_number TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (variant_id) REFERENCES product_variants_enhanced(id)
    );

    -- Enhanced Stock Movements
    CREATE TABLE IF NOT EXISTS stock_movements_enhanced (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      location_id INTEGER,
      movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer', 'adjustment', 'return', 'damage', 'expired')),
      quantity DECIMAL(10,3) NOT NULL,
      unit_cost DECIMAL(10,2),
      reference_type TEXT CHECK (reference_type IN ('sale', 'purchase', 'transfer', 'adjustment', 'return', 'damage', 'expired')),
      reference_id INTEGER,
      batch_number TEXT,
      expiration_date DATE,
      serial_numbers TEXT, -- JSON array for electronics
      notes TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (variant_id) REFERENCES product_variants_enhanced(id),
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Enhanced Customer Management
    CREATE TABLE IF NOT EXISTS customers_enhanced (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_code TEXT UNIQUE,
      customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'corporate', 'vip', 'wholesale')),
      title TEXT CHECK (title IN ('Mr', 'Mrs', 'Ms', 'Dr', 'Eng', 'Prof')),
      first_name TEXT NOT NULL,
      middle_name TEXT,
      last_name TEXT NOT NULL,
      company_name TEXT,
      company_name_arabic TEXT,
      date_of_birth DATE,
      gender TEXT CHECK (gender IN ('male', 'female')),
      nationality TEXT DEFAULT 'Egyptian',
      id_type TEXT CHECK (id_type IN ('national_id', 'passport', 'driving_license')),
      id_number TEXT,
      phone_primary TEXT,
      phone_secondary TEXT,
      email_primary TEXT,
      email_secondary TEXT,
      whatsapp_number TEXT,
      address_line1 TEXT,
      address_line2 TEXT,
      city TEXT,
      governorate TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'Egypt',
      tax_id TEXT,
      credit_limit DECIMAL(12,2) DEFAULT 0,
      current_balance DECIMAL(12,2) DEFAULT 0,
      payment_terms INTEGER DEFAULT 0, -- Days
      discount_percentage DECIMAL(5,2) DEFAULT 0,
      loyalty_points INTEGER DEFAULT 0,
      total_purchases DECIMAL(12,2) DEFAULT 0,
      last_purchase_date DATE,
      preferred_payment_method TEXT,
      communication_preference TEXT DEFAULT 'sms' CHECK (communication_preference IN ('sms', 'email', 'whatsapp', 'phone', 'none')),
      marketing_consent BOOLEAN DEFAULT 0,
      referral_source TEXT,
      referred_by INTEGER,
      notes TEXT,
      photo_path TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (referred_by) REFERENCES customers_enhanced(id)
    );

    -- Customer Preferences
    CREATE TABLE IF NOT EXISTS customer_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      preference_type TEXT NOT NULL CHECK (preference_type IN ('product_category', 'brand', 'size', 'color', 'payment_method')),
      preference_value TEXT NOT NULL,
      preference_score INTEGER DEFAULT 1 CHECK (preference_score >= 1 AND preference_score <= 10),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers_enhanced(id) ON DELETE CASCADE
    );

    -- Store Locations
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_code TEXT UNIQUE NOT NULL,
      location_name TEXT NOT NULL,
      location_name_arabic TEXT,
      location_type TEXT DEFAULT 'store' CHECK (location_type IN ('store', 'warehouse', 'office', 'kiosk')),
      address TEXT,
      city TEXT,
      governorate TEXT,
      postal_code TEXT,
      phone TEXT,
      email TEXT,
      manager_id INTEGER,
      opening_hours TEXT, -- JSON: {monday: {open: '09:00', close: '21:00'}, ...}
      timezone TEXT DEFAULT 'Africa/Cairo',
      currency TEXT DEFAULT 'EGP',
      tax_rate DECIMAL(5,2) DEFAULT 14.00,
      is_main_location BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id)
    );

    -- Stock Transfers Between Locations
    CREATE TABLE IF NOT EXISTS stock_transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transfer_number TEXT UNIQUE NOT NULL,
      from_location_id INTEGER NOT NULL,
      to_location_id INTEGER NOT NULL,
      transfer_date DATE NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'received', 'cancelled')),
      total_items INTEGER DEFAULT 0,
      total_cost DECIMAL(12,2) DEFAULT 0,
      notes TEXT,
      created_by INTEGER NOT NULL,
      approved_by INTEGER,
      received_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_location_id) REFERENCES locations(id),
      FOREIGN KEY (to_location_id) REFERENCES locations(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (approved_by) REFERENCES users(id),
      FOREIGN KEY (received_by) REFERENCES users(id)
    );

    -- Stock Transfer Items
    CREATE TABLE IF NOT EXISTS stock_transfer_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transfer_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      quantity_sent DECIMAL(10,3) NOT NULL,
      quantity_received DECIMAL(10,3) DEFAULT 0,
      unit_cost DECIMAL(10,2) NOT NULL,
      batch_number TEXT,
      expiration_date DATE,
      serial_numbers TEXT, -- JSON array
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transfer_id) REFERENCES stock_transfers(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (variant_id) REFERENCES product_variants_enhanced(id)
    );

    -- Enhanced User Roles and Permissions
    CREATE TABLE IF NOT EXISTS user_roles_enhanced (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_name TEXT UNIQUE NOT NULL,
      role_name_arabic TEXT,
      role_description TEXT,
      role_level INTEGER DEFAULT 1 CHECK (role_level >= 1 AND role_level <= 10),
      permissions TEXT, -- JSON array of permissions
      location_restrictions TEXT, -- JSON array of location IDs
      time_restrictions TEXT, -- JSON: {start_time: '09:00', end_time: '21:00', days: ['monday', 'tuesday', ...]}
      is_system_role BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- User Schedules
    CREATE TABLE IF NOT EXISTS user_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      location_id INTEGER NOT NULL,
      schedule_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      break_duration INTEGER DEFAULT 0, -- Minutes
      schedule_type TEXT DEFAULT 'regular' CHECK (schedule_type IN ('regular', 'overtime', 'holiday', 'training')),
      status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'checked_in', 'checked_out', 'absent', 'cancelled')),
      actual_start_time DATETIME,
      actual_end_time DATETIME,
      notes TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Performance Metrics
    CREATE TABLE IF NOT EXISTS user_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      location_id INTEGER,
      metric_date DATE NOT NULL,
      sales_count INTEGER DEFAULT 0,
      sales_amount DECIMAL(12,2) DEFAULT 0,
      returns_count INTEGER DEFAULT 0,
      returns_amount DECIMAL(12,2) DEFAULT 0,
      customers_served INTEGER DEFAULT 0,
      average_transaction_time INTEGER DEFAULT 0, -- Seconds
      customer_satisfaction_score DECIMAL(3,2) DEFAULT 0,
      attendance_hours DECIMAL(5,2) DEFAULT 0,
      overtime_hours DECIMAL(5,2) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    -- Reports Configuration
    CREATE TABLE IF NOT EXISTS report_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_code TEXT UNIQUE NOT NULL,
      report_name TEXT NOT NULL,
      report_name_arabic TEXT,
      report_category TEXT NOT NULL CHECK (report_category IN ('sales', 'inventory', 'financial', 'customer', 'staff', 'system')),
      report_description TEXT,
      sql_query TEXT,
      parameters TEXT, -- JSON array of parameter definitions
      output_format TEXT DEFAULT 'pdf' CHECK (output_format IN ('pdf', 'excel', 'csv', 'json', 'xml')),
      schedule_enabled BOOLEAN DEFAULT 0,
      schedule_frequency TEXT CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
      email_recipients TEXT, -- JSON array of email addresses
      is_system_report BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Report Generation History
    CREATE TABLE IF NOT EXISTS report_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_template_id INTEGER NOT NULL,
      generated_by INTEGER NOT NULL,
      generation_date DATETIME NOT NULL,
      parameters_used TEXT, -- JSON
      file_path TEXT,
      file_size INTEGER,
      generation_time INTEGER, -- Milliseconds
      status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_template_id) REFERENCES report_templates(id),
      FOREIGN KEY (generated_by) REFERENCES users(id)
    );

    -- ABC Analysis Results
    CREATE TABLE IF NOT EXISTS abc_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      location_id INTEGER,
      analysis_period_start DATE NOT NULL,
      analysis_period_end DATE NOT NULL,
      total_sales_quantity DECIMAL(10,3) DEFAULT 0,
      total_sales_amount DECIMAL(12,2) DEFAULT 0,
      sales_frequency INTEGER DEFAULT 0,
      abc_category TEXT CHECK (abc_category IN ('A', 'B', 'C')),
      xyz_category TEXT CHECK (xyz_category IN ('X', 'Y', 'Z')),
      turnover_ratio DECIMAL(8,4) DEFAULT 0,
      days_since_last_sale INTEGER DEFAULT 0,
      is_dead_stock BOOLEAN DEFAULT 0,
      reorder_point INTEGER DEFAULT 0,
      optimal_order_quantity INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_product_pricing_product_tier ON product_pricing(product_id, pricing_tier);
    CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants_enhanced(product_id);
    CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(supplier_code);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_stock_movements_product_date ON stock_movements_enhanced(product_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_customers_type_active ON customers_enhanced(customer_type, is_active);
    CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);
    CREATE INDEX IF NOT EXISTS idx_user_schedules_user_date ON user_schedules(user_id, schedule_date);
    CREATE INDEX IF NOT EXISTS idx_user_performance_user_date ON user_performance(user_id, metric_date);
    CREATE INDEX IF NOT EXISTS idx_abc_analysis_product_period ON abc_analysis(product_id, analysis_period_end);
  `;
};

// Insert default data for Phase 2
export const getAdvancedDefaultDataSql = (): string => {
  return `
    -- Insert default pricing tiers
    INSERT OR IGNORE INTO product_pricing (product_id, pricing_tier, price)
    SELECT id, 'retail', price FROM products WHERE id IN (SELECT id FROM products LIMIT 5);

    -- Insert default user roles
    INSERT OR IGNORE INTO user_roles_enhanced (role_name, role_name_arabic, role_description, role_level, permissions) VALUES
    ('Super Admin', 'مدير عام', 'Full system access with all permissions', 10, '["*"]'),
    ('Store Manager', 'مدير المتجر', 'Store operations and staff management', 8, '["sales.*", "inventory.*", "customers.*", "reports.view", "users.view"]'),
    ('Assistant Manager', 'مساعد مدير', 'Limited management functions', 6, '["sales.*", "inventory.view", "customers.*", "reports.view"]'),
    ('Senior Cashier', 'كاشير أول', 'Advanced POS operations and training', 5, '["sales.*", "customers.view", "customers.edit"]'),
    ('Cashier', 'كاشير', 'Basic POS operations', 3, '["sales.create", "sales.view", "customers.view"]'),
    ('Stock Clerk', 'موظف مخزون', 'Inventory management and stock operations', 4, '["inventory.*", "products.view"]'),
    ('Accountant', 'محاسب', 'Financial reports and transaction review', 7, '["reports.*", "transactions.view", "financial.*"]'),
    ('Sales Associate', 'مندوب مبيعات', 'Customer service and basic sales', 3, '["sales.create", "customers.view", "products.view"]'),
    ('Inventory Manager', 'مدير المخزون', 'Full inventory control and purchasing', 7, '["inventory.*", "purchasing.*", "suppliers.*", "reports.inventory"]'),
    ('Viewer', 'مشاهد', 'Read-only access to reports and data', 1, '["*.view", "reports.view"]');

    -- Insert main location
    INSERT OR IGNORE INTO locations (location_code, location_name, location_name_arabic, location_type, is_main_location, is_active) VALUES
    ('MAIN001', 'Main Store', 'المتجر الرئيسي', 'store', 1, 1);

    -- Insert default report templates
    INSERT OR IGNORE INTO report_templates (report_code, report_name, report_name_arabic, report_category, report_description, is_system_report, created_by) VALUES
    ('DAILY_SALES', 'Daily Sales Report', 'تقرير المبيعات اليومية', 'sales', 'Daily sales summary with totals and trends', 1, 1),
    ('INVENTORY_STATUS', 'Inventory Status Report', 'تقرير حالة المخزون', 'inventory', 'Current stock levels and reorder alerts', 1, 1),
    ('CUSTOMER_ANALYSIS', 'Customer Analysis Report', 'تقرير تحليل العملاء', 'customer', 'Customer purchasing patterns and preferences', 1, 1),
    ('STAFF_PERFORMANCE', 'Staff Performance Report', 'تقرير أداء الموظفين', 'staff', 'Employee performance metrics and KPIs', 1, 1),
    ('FINANCIAL_SUMMARY', 'Financial Summary Report', 'التقرير المالي الموجز', 'financial', 'Financial overview with VAT compliance', 1, 1);
  `;
};
