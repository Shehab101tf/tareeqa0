import { Generated, Insertable, Selectable, Updateable } from 'kysely';

// User Management
export interface UsersTable {
  id: Generated<number>;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'manager' | 'cashier' | 'viewer';
  is_active: boolean;
  last_login: string | null;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

// Product Management
export interface ProductsTable {
  id: Generated<number>;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  category_id: number | null;
  supplier_id: number | null;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number | null;
  unit: string;
  tax_rate: number;
  is_active: boolean;
  image_path: string | null;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

// Product Categories
export interface CategoriesTable {
  id: Generated<number>;
  name: string;
  description: string | null;
  parent_id: number | null;
  is_active: boolean;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

// Suppliers
export interface SuppliersTable {
  id: Generated<number>;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  is_active: boolean;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

// Sales Transactions
export interface SalesTable {
  id: Generated<number>;
  sale_number: string;
  customer_id: number | null;
  user_id: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'mobile' | 'credit' | 'mixed';
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  notes: string | null;
  sale_date: Generated<string>;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

// Sale Items
export interface SaleItemsTable {
  id: Generated<number>;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  created_at: Generated<string>;
}

// Customers
export interface CustomersTable {
  id: Generated<number>;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

// Inventory Movements
export interface InventoryMovementsTable {
  id: Generated<number>;
  product_id: number;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost: number | null;
  reference_type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'transfer';
  reference_id: number | null;
  notes: string | null;
  user_id: number;
  created_at: Generated<string>;
}

// Purchase Orders
export interface PurchaseOrdersTable {
  id: Generated<number>;
  po_number: string;
  supplier_id: number;
  user_id: number;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  order_date: string;
  expected_date: string | null;
  received_date: string | null;
  notes: string | null;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

// Purchase Order Items
export interface PurchaseOrderItemsTable {
  id: Generated<number>;
  purchase_order_id: number;
  product_id: number;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  created_at: Generated<string>;
}

// Payments
export interface PaymentsTable {
  id: Generated<number>;
  sale_id: number | null;
  customer_id: number | null;
  amount: number;
  payment_method: 'cash' | 'card' | 'mobile' | 'bank_transfer' | 'check';
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_id: string | null;
  reference_number: string | null;
  notes: string | null;
  payment_date: Generated<string>;
  created_at: Generated<string>;
}

// Tax Settings
export interface TaxRatesTable {
  id: Generated<number>;
  name: string;
  rate: number;
  is_active: boolean;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

// System Settings
export interface SettingsTable {
  id: Generated<number>;
  key: string;
  value: string;
  description: string | null;
  category: string;
  is_encrypted: boolean;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

// Audit Log
export interface AuditLogTable {
  id: Generated<number>;
  user_id: number | null;
  action: string;
  table_name: string;
  record_id: number | null;
  old_values: string | null;
  new_values: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Generated<string>;
}

// Reports
export interface ReportsTable {
  id: Generated<number>;
  name: string;
  type: 'sales' | 'inventory' | 'financial' | 'customer' | 'custom';
  parameters: string;
  generated_by: number;
  file_path: string | null;
  status: 'generating' | 'completed' | 'failed';
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

// Discounts and Promotions
export interface DiscountsTable {
  id: Generated<number>;
  name: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value: number;
  min_quantity: number | null;
  min_amount: number | null;
  max_discount: number | null;
  applicable_products: string | null; // JSON array of product IDs
  applicable_categories: string | null; // JSON array of category IDs
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

// Database Schema Interface
export interface DatabaseSchema {
  users: UsersTable;
  products: ProductsTable;
  categories: CategoriesTable;
  suppliers: SuppliersTable;
  sales: SalesTable;
  sale_items: SaleItemsTable;
  customers: CustomersTable;
  inventory_movements: InventoryMovementsTable;
  purchase_orders: PurchaseOrdersTable;
  purchase_order_items: PurchaseOrderItemsTable;
  payments: PaymentsTable;
  tax_rates: TaxRatesTable;
  settings: SettingsTable;
  audit_log: AuditLogTable;
  reports: ReportsTable;
  discounts: DiscountsTable;
}

// Type helpers for each table
export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

export type Product = Selectable<ProductsTable>;
export type NewProduct = Insertable<ProductsTable>;
export type ProductUpdate = Updateable<ProductsTable>;

export type Category = Selectable<CategoriesTable>;
export type NewCategory = Insertable<CategoriesTable>;
export type CategoryUpdate = Updateable<CategoriesTable>;

export type Supplier = Selectable<SuppliersTable>;
export type NewSupplier = Insertable<SuppliersTable>;
export type SupplierUpdate = Updateable<SuppliersTable>;

export type Sale = Selectable<SalesTable>;
export type NewSale = Insertable<SalesTable>;
export type SaleUpdate = Updateable<SalesTable>;

export type SaleItem = Selectable<SaleItemsTable>;
export type NewSaleItem = Insertable<SaleItemsTable>;

export type Customer = Selectable<CustomersTable>;
export type NewCustomer = Insertable<CustomersTable>;
export type CustomerUpdate = Updateable<CustomersTable>;

export type InventoryMovement = Selectable<InventoryMovementsTable>;
export type NewInventoryMovement = Insertable<InventoryMovementsTable>;

export type PurchaseOrder = Selectable<PurchaseOrdersTable>;
export type NewPurchaseOrder = Insertable<PurchaseOrdersTable>;
export type PurchaseOrderUpdate = Updateable<PurchaseOrdersTable>;

export type PurchaseOrderItem = Selectable<PurchaseOrderItemsTable>;
export type NewPurchaseOrderItem = Insertable<PurchaseOrderItemsTable>;

export type Payment = Selectable<PaymentsTable>;
export type NewPayment = Insertable<PaymentsTable>;

export type TaxRate = Selectable<TaxRatesTable>;
export type NewTaxRate = Insertable<TaxRatesTable>;
export type TaxRateUpdate = Updateable<TaxRatesTable>;

export type Setting = Selectable<SettingsTable>;
export type NewSetting = Insertable<SettingsTable>;
export type SettingUpdate = Updateable<SettingsTable>;

export type AuditLogEntry = Selectable<AuditLogTable>;
export type NewAuditLogEntry = Insertable<AuditLogTable>;

export type Report = Selectable<ReportsTable>;
export type NewReport = Insertable<ReportsTable>;
export type ReportUpdate = Updateable<ReportsTable>;

export type Discount = Selectable<DiscountsTable>;
export type NewDiscount = Insertable<DiscountsTable>;
export type DiscountUpdate = Updateable<DiscountsTable>;
