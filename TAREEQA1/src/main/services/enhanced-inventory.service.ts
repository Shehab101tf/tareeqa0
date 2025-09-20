// Enhanced Inventory Service - Advanced inventory management for Phase 2
// Handles product variants, multi-tier pricing, suppliers, purchase orders, and stock movements

import { EnhancedDatabaseManager } from '../database/EnhancedDatabaseManager';
import { 
  ProductVariant, 
  PricingTier, 
  Supplier, 
  PurchaseOrder, 
  PurchaseOrderItem,
  StockMovement,
  ProductExpiry,
  ProductSerial,
  ApiResponse,
  PaginationParams
} from '../../shared/types/enhanced';
import { 
  ProductVariantSchema,
  PricingTierSchema,
  SupplierSchema,
  PurchaseOrderSchema,
  StockMovementSchema,
  EnhancedValidationHelper
} from '../../shared/validation/enhancedSchemas';

export class EnhancedInventoryService {
  private db: EnhancedDatabaseManager;

  constructor(db: EnhancedDatabaseManager) {
    this.db = db;
  }

  // ==================== PRODUCT VARIANTS ====================

  /**
   * Create a new product variant
   */
  async createProductVariant(variant: Omit<ProductVariant, 'id'>): Promise<ApiResponse<ProductVariant>> {
    try {
      // Validate input
      const validatedVariant = ProductVariantSchema.parse(variant);
      
      // Check if SKU already exists
      const existingSku = this.db.raw.prepare('SELECT id FROM product_variants WHERE sku = ?').get(validatedVariant.sku);
      if (existingSku) {
        return {
          success: false,
          message: 'كود المنتج موجود بالفعل',
          messageEn: 'SKU already exists'
        };
      }

      // Insert variant
      const stmt = this.db.raw.prepare(`
        INSERT INTO product_variants (
          product_id, sku, name, name_en, attributes, cost_price, 
          selling_price, stock, min_stock, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        validatedVariant.productId,
        validatedVariant.sku,
        validatedVariant.name,
        validatedVariant.nameEn,
        JSON.stringify(validatedVariant.attributes),
        validatedVariant.costPrice,
        validatedVariant.sellingPrice,
        validatedVariant.stock,
        validatedVariant.minStock,
        validatedVariant.isActive ? 1 : 0
      );

      const createdVariant = { ...validatedVariant, id: result.lastInsertRowid as number };

      // Log stock movement
      await this.logStockMovement({
        productId: validatedVariant.productId,
        variantId: createdVariant.id,
        movementType: 'in',
        quantity: validatedVariant.stock,
        referenceType: 'adjustment',
        notes: 'Initial stock for new variant',
        userId: 1 // TODO: Get from context
      });

      return {
        success: true,
        data: createdVariant,
        message: 'تم إنشاء نوع المنتج بنجاح',
        messageEn: 'Product variant created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء نوع المنتج',
        messageEn: 'Failed to create product variant',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get product variants by product ID
   */
  async getProductVariants(productId: number): Promise<ApiResponse<ProductVariant[]>> {
    try {
      const stmt = this.db.raw.prepare(`
        SELECT * FROM product_variants 
        WHERE product_id = ? AND is_active = 1
        ORDER BY name
      `);

      const rows = stmt.all(productId) as any[];
      const variants = rows.map(row => this.mapVariantRow(row));

      return {
        success: true,
        data: variants
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب أنواع المنتج',
        messageEn: 'Failed to fetch product variants',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== PRICING TIERS ====================

  /**
   * Create pricing tier
   */
  async createPricingTier(tier: Omit<PricingTier, 'id'>): Promise<ApiResponse<PricingTier>> {
    try {
      const validatedTier = PricingTierSchema.parse(tier);

      const stmt = this.db.raw.prepare(`
        INSERT INTO pricing_tiers (name, name_en, type, discount_percentage, minimum_quantity, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        validatedTier.name,
        validatedTier.nameEn,
        validatedTier.type,
        validatedTier.discountPercentage,
        validatedTier.minimumQuantity,
        validatedTier.isActive ? 1 : 0
      );

      return {
        success: true,
        data: { ...validatedTier, id: result.lastInsertRowid as number },
        message: 'تم إنشاء فئة التسعير بنجاح',
        messageEn: 'Pricing tier created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء فئة التسعير',
        messageEn: 'Failed to create pricing tier',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get all pricing tiers
   */
  async getPricingTiers(): Promise<ApiResponse<PricingTier[]>> {
    try {
      const stmt = this.db.raw.prepare('SELECT * FROM pricing_tiers WHERE is_active = 1 ORDER BY name');
      const rows = stmt.all() as any[];
      
      const tiers = rows.map(row => ({
        id: row.id,
        name: row.name,
        nameEn: row.name_en,
        type: row.type,
        discountPercentage: row.discount_percentage,
        minimumQuantity: row.minimum_quantity,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at
      }));

      return {
        success: true,
        data: tiers
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب فئات التسعير',
        messageEn: 'Failed to fetch pricing tiers',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Set product pricing for tier
   */
  async setProductPricing(productId: number, variantId: number | null, tierId: number, price: number): Promise<ApiResponse<void>> {
    try {
      const stmt = this.db.raw.prepare(`
        INSERT OR REPLACE INTO product_pricing (product_id, variant_id, tier_id, price)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(productId, variantId, tierId, price);

      return {
        success: true,
        message: 'تم تحديث سعر المنتج بنجاح',
        messageEn: 'Product pricing updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في تحديث سعر المنتج',
        messageEn: 'Failed to update product pricing',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== SUPPLIERS ====================

  /**
   * Create supplier
   */
  async createSupplier(supplier: Omit<Supplier, 'id'>): Promise<ApiResponse<Supplier>> {
    try {
      const validatedSupplier = SupplierSchema.parse(supplier);

      const stmt = this.db.raw.prepare(`
        INSERT INTO suppliers (
          name, name_en, contact_person, email, phone, address, 
          tax_id, payment_terms, credit_limit, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        validatedSupplier.name,
        validatedSupplier.nameEn,
        validatedSupplier.contactPerson,
        validatedSupplier.email,
        validatedSupplier.phone,
        validatedSupplier.address,
        validatedSupplier.taxId,
        validatedSupplier.paymentTerms,
        validatedSupplier.creditLimit,
        validatedSupplier.isActive ? 1 : 0
      );

      return {
        success: true,
        data: { ...validatedSupplier, id: result.lastInsertRowid as number },
        message: 'تم إنشاء المورد بنجاح',
        messageEn: 'Supplier created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء المورد',
        messageEn: 'Failed to create supplier',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get suppliers with pagination
   */
  async getSuppliers(params: PaginationParams = {}): Promise<ApiResponse<Supplier[]>> {
    try {
      const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = params;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE is_active = 1';
      const queryParams: any[] = [];

      if (search) {
        whereClause += ' AND (name LIKE ? OR name_en LIKE ? OR contact_person LIKE ?)';
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
      
      const stmt = this.db.raw.prepare(`
        SELECT * FROM suppliers 
        ${whereClause} 
        ${orderClause} 
        LIMIT ? OFFSET ?
      `);

      const countStmt = this.db.raw.prepare(`SELECT COUNT(*) as total FROM suppliers ${whereClause}`);

      const rows = stmt.all(...queryParams, limit, offset) as any[];
      const totalResult = countStmt.get(...queryParams) as { total: number };

      const suppliers = rows.map(row => this.mapSupplierRow(row));

      return {
        success: true,
        data: suppliers,
        pagination: {
          page,
          limit,
          total: totalResult.total,
          totalPages: Math.ceil(totalResult.total / limit)
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب الموردين',
        messageEn: 'Failed to fetch suppliers',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== PURCHASE ORDERS ====================

  /**
   * Create purchase order
   */
  async createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'orderNumber'>): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const validatedOrder = PurchaseOrderSchema.omit({ orderNumber: true }).parse(order);

      // Generate order number
      const orderNumber = await this.generatePurchaseOrderNumber();

      // Validate totals
      if (!EnhancedValidationHelper.validatePurchaseOrderTotals(
        validatedOrder.subtotal, 
        validatedOrder.vatAmount, 
        validatedOrder.total
      )) {
        return {
          success: false,
          message: 'إجماليات الطلب غير صحيحة',
          messageEn: 'Invalid order totals'
        };
      }

      const stmt = this.db.raw.prepare(`
        INSERT INTO purchase_orders (
          supplier_id, order_number, status, order_date, expected_date,
          subtotal, vat_amount, total, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        validatedOrder.supplierId,
        orderNumber,
        validatedOrder.status,
        validatedOrder.orderDate,
        validatedOrder.expectedDate,
        validatedOrder.subtotal,
        validatedOrder.vatAmount,
        validatedOrder.total,
        validatedOrder.notes,
        validatedOrder.createdBy
      );

      return {
        success: true,
        data: { ...validatedOrder, id: result.lastInsertRowid as number, orderNumber },
        message: 'تم إنشاء طلب الشراء بنجاح',
        messageEn: 'Purchase order created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء طلب الشراء',
        messageEn: 'Failed to create purchase order',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Add items to purchase order
   */
  async addPurchaseOrderItems(orderId: number, items: Omit<PurchaseOrderItem, 'id' | 'purchaseOrderId'>[]): Promise<ApiResponse<void>> {
    try {
      const addItems = this.db.raw.transaction((orderItems: any[]) => {
        const stmt = this.db.raw.prepare(`
          INSERT INTO purchase_order_items (
            purchase_order_id, product_id, variant_id, quantity, unit_cost, total_cost
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const item of orderItems) {
          stmt.run(
            orderId,
            item.productId,
            item.variantId,
            item.quantity,
            item.unitCost,
            item.totalCost
          );
        }
      });

      addItems(items);

      return {
        success: true,
        message: 'تم إضافة عناصر الطلب بنجاح',
        messageEn: 'Purchase order items added successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إضافة عناصر الطلب',
        messageEn: 'Failed to add purchase order items',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== STOCK MOVEMENTS ====================

  /**
   * Log stock movement
   */
  async logStockMovement(movement: Omit<StockMovement, 'id'>): Promise<ApiResponse<StockMovement>> {
    try {
      const validatedMovement = StockMovementSchema.parse(movement);

      const stmt = this.db.raw.prepare(`
        INSERT INTO stock_movements (
          product_id, variant_id, location_id, movement_type, quantity,
          reference_type, reference_id, notes, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        validatedMovement.productId,
        validatedMovement.variantId,
        validatedMovement.locationId,
        validatedMovement.movementType,
        validatedMovement.quantity,
        validatedMovement.referenceType,
        validatedMovement.referenceId,
        validatedMovement.notes,
        validatedMovement.userId
      );

      // Update product stock
      if (validatedMovement.variantId) {
        // Update variant stock
        const updateStmt = this.db.raw.prepare(`
          UPDATE product_variants 
          SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `);
        updateStmt.run(
          validatedMovement.movementType === 'in' ? validatedMovement.quantity : -validatedMovement.quantity,
          validatedMovement.variantId
        );
      } else {
        // Update main product stock
        const updateStmt = this.db.raw.prepare(`
          UPDATE products 
          SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `);
        updateStmt.run(
          validatedMovement.movementType === 'in' ? validatedMovement.quantity : -validatedMovement.quantity,
          validatedMovement.productId
        );
      }

      return {
        success: true,
        data: { ...validatedMovement, id: result.lastInsertRowid as number },
        message: 'تم تسجيل حركة المخزون بنجاح',
        messageEn: 'Stock movement logged successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في تسجيل حركة المخزون',
        messageEn: 'Failed to log stock movement',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get stock movements with filters
   */
  async getStockMovements(params: PaginationParams & {
    productId?: number;
    locationId?: number;
    movementType?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<ApiResponse<StockMovement[]>> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        productId, 
        locationId, 
        movementType, 
        dateFrom, 
        dateTo,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = params;
      
      const offset = (page - 1) * limit;
      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (productId) {
        whereConditions.push('sm.product_id = ?');
        queryParams.push(productId);
      }

      if (locationId) {
        whereConditions.push('sm.location_id = ?');
        queryParams.push(locationId);
      }

      if (movementType) {
        whereConditions.push('sm.movement_type = ?');
        queryParams.push(movementType);
      }

      if (dateFrom) {
        whereConditions.push('DATE(sm.created_at) >= DATE(?)');
        queryParams.push(dateFrom);
      }

      if (dateTo) {
        whereConditions.push('DATE(sm.created_at) <= DATE(?)');
        queryParams.push(dateTo);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      const orderClause = `ORDER BY sm.${sortBy} ${sortOrder.toUpperCase()}`;

      const stmt = this.db.raw.prepare(`
        SELECT 
          sm.*,
          p.name as product_name,
          pv.name as variant_name,
          l.name as location_name,
          u.full_name as user_name
        FROM stock_movements sm
        LEFT JOIN products p ON sm.product_id = p.id
        LEFT JOIN product_variants pv ON sm.variant_id = pv.id
        LEFT JOIN locations l ON sm.location_id = l.id
        LEFT JOIN users_enhanced u ON sm.user_id = u.id
        ${whereClause}
        ${orderClause}
        LIMIT ? OFFSET ?
      `);

      const countStmt = this.db.raw.prepare(`
        SELECT COUNT(*) as total FROM stock_movements sm ${whereClause}
      `);

      const rows = stmt.all(...queryParams, limit, offset) as any[];
      const totalResult = countStmt.get(...queryParams) as { total: number };

      const movements = rows.map(row => this.mapStockMovementRow(row));

      return {
        success: true,
        data: movements,
        pagination: {
          page,
          limit,
          total: totalResult.total,
          totalPages: Math.ceil(totalResult.total / limit)
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب حركات المخزون',
        messageEn: 'Failed to fetch stock movements',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get inventory analytics
   */
  async getInventoryAnalytics(): Promise<ApiResponse<any>> {
    try {
      const analytics = {
        totalProducts: this.db.raw.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get(),
        totalVariants: this.db.raw.prepare('SELECT COUNT(*) as count FROM product_variants WHERE is_active = 1').get(),
        lowStockProducts: this.db.raw.prepare(`
          SELECT COUNT(*) as count FROM products 
          WHERE is_active = 1 AND stock <= min_stock
        `).get(),
        lowStockVariants: this.db.raw.prepare(`
          SELECT COUNT(*) as count FROM product_variants 
          WHERE is_active = 1 AND stock <= min_stock
        `).get(),
        totalStockValue: this.db.raw.prepare(`
          SELECT COALESCE(SUM(stock * cost_price), 0) as value FROM products WHERE is_active = 1
        `).get(),
        recentMovements: this.db.raw.prepare(`
          SELECT COUNT(*) as count FROM stock_movements 
          WHERE DATE(created_at) = DATE('now')
        `).get()
      };

      return {
        success: true,
        data: analytics
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب تحليلات المخزون',
        messageEn: 'Failed to fetch inventory analytics',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generate unique purchase order number
   */
  private async generatePurchaseOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `PO-${year}${month}${day}`;
    
    // Get the count of orders created today
    const count = this.db.raw.prepare(`
      SELECT COUNT(*) as count FROM purchase_orders 
      WHERE order_number LIKE ?
    `).get(`${prefix}%`) as { count: number };
    
    const sequence = String(count.count + 1).padStart(3, '0');
    return `${prefix}-${sequence}`;
  }

  /**
   * Map database row to ProductVariant object
   */
  private mapVariantRow(row: any): ProductVariant {
    return {
      id: row.id,
      productId: row.product_id,
      sku: row.sku,
      name: row.name,
      nameEn: row.name_en,
      attributes: JSON.parse(row.attributes || '{}'),
      costPrice: row.cost_price,
      sellingPrice: row.selling_price,
      stock: row.stock,
      minStock: row.min_stock,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Map database row to Supplier object
   */
  private mapSupplierRow(row: any): Supplier {
    return {
      id: row.id,
      name: row.name,
      nameEn: row.name_en,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      address: row.address,
      taxId: row.tax_id,
      paymentTerms: row.payment_terms,
      creditLimit: row.credit_limit,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Map database row to StockMovement object
   */
  private mapStockMovementRow(row: any): StockMovement {
    return {
      id: row.id,
      productId: row.product_id,
      variantId: row.variant_id,
      locationId: row.location_id,
      movementType: row.movement_type,
      quantity: row.quantity,
      referenceType: row.reference_type,
      referenceId: row.reference_id,
      notes: row.notes,
      userId: row.user_id,
      createdAt: row.created_at,
      product: row.product_name ? { name: row.product_name } : undefined,
      variant: row.variant_name ? { name: row.variant_name } : undefined,
      location: row.location_name ? { name: row.location_name } : undefined,
      user: row.user_name ? { fullName: row.user_name } : undefined
    } as StockMovement;
  }
}

export default EnhancedInventoryService;
