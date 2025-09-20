// Multi-Location Service - Store management and stock transfers for Phase 2
// Handles multiple store locations, stock transfers, and consolidated reporting

import { EnhancedDatabaseManager } from '../database/EnhancedDatabaseManager';
import { 
  Location, 
  LocationStock,
  StockTransfer, 
  StockTransferItem,
  ApiResponse,
  PaginationParams
} from '../../shared/types/enhanced';
import { 
  LocationSchema,
  StockTransferSchema,
  StockTransferItemSchema,
  EnhancedValidationHelper
} from '../../shared/validation/enhancedSchemas';

export class MultiLocationService {
  private db: EnhancedDatabaseManager;

  constructor(db: EnhancedDatabaseManager) {
    this.db = db;
  }

  // ==================== LOCATION MANAGEMENT ====================

  /**
   * Create a new location
   */
  async createLocation(location: Omit<Location, 'id'>): Promise<ApiResponse<Location>> {
    try {
      const validatedLocation = LocationSchema.parse(location);

      // Check if location name already exists
      const existingName = this.db.raw.prepare('SELECT id FROM locations WHERE name = ?').get(validatedLocation.name);
      if (existingName) {
        return {
          success: false,
          message: 'اسم الموقع موجود بالفعل',
          messageEn: 'Location name already exists'
        };
      }

      const stmt = this.db.raw.prepare(`
        INSERT INTO locations (
          name, name_en, type, address, city, governorate, 
          phone, manager_id, is_active, settings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        validatedLocation.name,
        validatedLocation.nameEn,
        validatedLocation.type,
        validatedLocation.address,
        validatedLocation.city,
        validatedLocation.governorate,
        validatedLocation.phone,
        validatedLocation.managerId,
        validatedLocation.isActive ? 1 : 0,
        JSON.stringify(validatedLocation.settings)
      );

      const createdLocation = { ...validatedLocation, id: result.lastInsertRowid as number };

      // Initialize stock levels for all active products at this location
      await this.initializeLocationStock(createdLocation.id!);

      return {
        success: true,
        data: createdLocation,
        message: 'تم إنشاء الموقع بنجاح',
        messageEn: 'Location created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء الموقع',
        messageEn: 'Failed to create location',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get all locations
   */
  async getLocations(includeInactive: boolean = false): Promise<ApiResponse<Location[]>> {
    try {
      const whereClause = includeInactive ? '' : 'WHERE l.is_active = 1';
      
      const stmt = this.db.raw.prepare(`
        SELECT 
          l.*,
          u.full_name as manager_name,
          COUNT(DISTINCT ls.product_id) as product_count,
          SUM(ls.quantity * p.cost_price) as total_stock_value
        FROM locations l
        LEFT JOIN users_enhanced u ON l.manager_id = u.id
        LEFT JOIN location_stock ls ON l.id = ls.location_id
        LEFT JOIN products p ON ls.product_id = p.id AND p.is_active = 1
        ${whereClause}
        GROUP BY l.id
        ORDER BY l.name
      `);

      const rows = stmt.all() as any[];
      const locations = rows.map(row => this.mapLocationRow(row));

      return {
        success: true,
        data: locations
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب المواقع',
        messageEn: 'Failed to fetch locations',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Update location
   */
  async updateLocation(id: number, updates: Partial<Location>): Promise<ApiResponse<Location>> {
    try {
      const validatedUpdates = LocationSchema.partial().parse(updates);

      const fields = Object.keys(validatedUpdates).filter(key => key !== 'id');
      if (fields.length === 0) {
        return {
          success: false,
          message: 'لا توجد بيانات للتحديث',
          messageEn: 'No data to update'
        };
      }

      const setClause = fields.map(field => `${this.camelToSnake(field)} = ?`).join(', ');
      const values = fields.map(field => {
        const value = (validatedUpdates as any)[field];
        if (field === 'settings' && typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value;
      });

      const stmt = this.db.raw.prepare(`
        UPDATE locations 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);

      const result = stmt.run(...values, id);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'الموقع غير موجود',
          messageEn: 'Location not found'
        };
      }

      // Return updated location
      const updatedLocation = await this.getLocationById(id);
      return updatedLocation;

    } catch (error) {
      return {
        success: false,
        message: 'فشل في تحديث الموقع',
        messageEn: 'Failed to update location',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get location by ID
   */
  async getLocationById(id: number): Promise<ApiResponse<Location>> {
    try {
      const stmt = this.db.raw.prepare(`
        SELECT 
          l.*,
          u.full_name as manager_name
        FROM locations l
        LEFT JOIN users_enhanced u ON l.manager_id = u.id
        WHERE l.id = ?
      `);

      const row = stmt.get(id) as any;
      
      if (!row) {
        return {
          success: false,
          message: 'الموقع غير موجود',
          messageEn: 'Location not found'
        };
      }

      const location = this.mapLocationRow(row);

      return {
        success: true,
        data: location
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب بيانات الموقع',
        messageEn: 'Failed to fetch location',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== STOCK MANAGEMENT ====================

  /**
   * Get stock levels for a location
   */
  async getLocationStock(locationId: number, params: PaginationParams = {}): Promise<ApiResponse<LocationStock[]>> {
    try {
      const { page = 1, limit = 50, search, sortBy = 'product_name', sortOrder = 'asc' } = params;
      const offset = (page - 1) * limit;

      let whereConditions = ['ls.location_id = ?'];
      let queryParams: any[] = [locationId];

      if (search) {
        whereConditions.push('(p.name LIKE ? OR p.sku LIKE ? OR pv.name LIKE ?)');
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
      const orderClause = `ORDER BY ${sortBy === 'product_name' ? 'p.name' : `ls.${this.camelToSnake(sortBy)}`} ${sortOrder.toUpperCase()}`;

      const stmt = this.db.raw.prepare(`
        SELECT 
          ls.*,
          p.name as product_name,
          p.sku as product_sku,
          p.category,
          pv.name as variant_name,
          pv.sku as variant_sku
        FROM location_stock ls
        JOIN products p ON ls.product_id = p.id
        LEFT JOIN product_variants pv ON ls.variant_id = pv.id
        ${whereClause}
        ${orderClause}
        LIMIT ? OFFSET ?
      `);

      const countStmt = this.db.raw.prepare(`
        SELECT COUNT(*) as total FROM location_stock ls
        JOIN products p ON ls.product_id = p.id
        LEFT JOIN product_variants pv ON ls.variant_id = pv.id
        ${whereClause}
      `);

      const rows = stmt.all(...queryParams, limit, offset) as any[];
      const totalResult = countStmt.get(...queryParams) as { total: number };

      const stockLevels = rows.map(row => ({
        id: row.id,
        locationId: row.location_id,
        productId: row.product_id,
        variantId: row.variant_id,
        quantity: row.quantity,
        reservedQuantity: row.reserved_quantity,
        minStock: row.min_stock,
        maxStock: row.max_stock,
        lastUpdated: row.last_updated,
        productName: row.product_name,
        productSku: row.product_sku,
        category: row.category,
        variantName: row.variant_name,
        variantSku: row.variant_sku
      }));

      return {
        success: true,
        data: stockLevels,
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
        message: 'فشل في جلب مخزون الموقع',
        messageEn: 'Failed to fetch location stock',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Update stock level at location
   */
  async updateLocationStock(
    locationId: number, 
    productId: number, 
    variantId: number | null, 
    quantity: number,
    userId: number
  ): Promise<ApiResponse<void>> {
    try {
      // Check if stock record exists
      const existingStock = this.db.raw.prepare(`
        SELECT * FROM location_stock 
        WHERE location_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
      `).get(locationId, productId, variantId, variantId);

      if (existingStock) {
        // Update existing stock
        const stmt = this.db.raw.prepare(`
          UPDATE location_stock 
          SET quantity = ?, last_updated = CURRENT_TIMESTAMP 
          WHERE id = ?
        `);
        stmt.run(quantity, existingStock.id);
      } else {
        // Create new stock record
        const stmt = this.db.raw.prepare(`
          INSERT INTO location_stock (location_id, product_id, variant_id, quantity, min_stock)
          VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(locationId, productId, variantId, quantity, 0);
      }

      // Log stock movement
      const movementStmt = this.db.raw.prepare(`
        INSERT INTO stock_movements (
          product_id, variant_id, location_id, movement_type, quantity,
          reference_type, notes, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      movementStmt.run(
        productId,
        variantId,
        locationId,
        'adjustment',
        quantity - (existingStock?.quantity || 0),
        'adjustment',
        'Stock level adjustment',
        userId
      );

      return {
        success: true,
        message: 'تم تحديث مخزون الموقع بنجاح',
        messageEn: 'Location stock updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في تحديث مخزون الموقع',
        messageEn: 'Failed to update location stock',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== STOCK TRANSFERS ====================

  /**
   * Create stock transfer request
   */
  async createStockTransfer(transfer: Omit<StockTransfer, 'id' | 'transferNumber'>): Promise<ApiResponse<StockTransfer>> {
    try {
      const validatedTransfer = StockTransferSchema.omit({ transferNumber: true }).parse(transfer);

      // Validate transfer
      const validationErrors = EnhancedValidationHelper.validateStockTransfer(
        validatedTransfer.fromLocationId,
        validatedTransfer.toLocationId,
        transfer.items || []
      );

      if (validationErrors.length > 0) {
        return {
          success: false,
          message: validationErrors.join(', '),
          messageEn: 'Validation failed',
          errors: validationErrors
        };
      }

      // Generate transfer number
      const transferNumber = await this.generateTransferNumber();

      const createTransfer = this.db.raw.transaction((transferData: any) => {
        // Insert transfer
        const transferStmt = this.db.raw.prepare(`
          INSERT INTO stock_transfers (
            from_location_id, to_location_id, transfer_number, status,
            requested_by, request_date, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const transferResult = transferStmt.run(
          transferData.fromLocationId,
          transferData.toLocationId,
          transferNumber,
          transferData.status,
          transferData.requestedBy,
          transferData.requestDate,
          transferData.notes
        );

        const transferId = transferResult.lastInsertRowid as number;

        // Insert transfer items
        if (transferData.items && transferData.items.length > 0) {
          const itemStmt = this.db.raw.prepare(`
            INSERT INTO stock_transfer_items (
              transfer_id, product_id, variant_id, requested_quantity
            ) VALUES (?, ?, ?, ?)
          `);

          for (const item of transferData.items) {
            itemStmt.run(transferId, item.productId, item.variantId, item.requestedQuantity);
          }
        }

        return { ...transferData, id: transferId, transferNumber };
      });

      const result = createTransfer(validatedTransfer);

      return {
        success: true,
        data: result,
        message: 'تم إنشاء طلب التحويل بنجاح',
        messageEn: 'Stock transfer request created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء طلب التحويل',
        messageEn: 'Failed to create stock transfer request',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Approve stock transfer
   */
  async approveStockTransfer(transferId: number, approvedBy: number, approvedItems?: { productId: number; variantId?: number; approvedQuantity: number }[]): Promise<ApiResponse<void>> {
    try {
      const approveTransfer = this.db.raw.transaction(() => {
        // Update transfer status
        const transferStmt = this.db.raw.prepare(`
          UPDATE stock_transfers 
          SET status = 'in_transit', approved_by = ?, approval_date = DATE('now')
          WHERE id = ? AND status = 'pending'
        `);

        const result = transferStmt.run(approvedBy, transferId);

        if (result.changes === 0) {
          throw new Error('Transfer not found or already processed');
        }

        // Update approved quantities if provided
        if (approvedItems) {
          const updateItemStmt = this.db.raw.prepare(`
            UPDATE stock_transfer_items 
            SET approved_quantity = ?
            WHERE transfer_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
          `);

          for (const item of approvedItems) {
            updateItemStmt.run(
              item.approvedQuantity,
              transferId,
              item.productId,
              item.variantId,
              item.variantId
            );
          }
        } else {
          // Approve all requested quantities
          this.db.raw.prepare(`
            UPDATE stock_transfer_items 
            SET approved_quantity = requested_quantity
            WHERE transfer_id = ?
          `).run(transferId);
        }
      });

      approveTransfer();

      return {
        success: true,
        message: 'تم اعتماد طلب التحويل بنجاح',
        messageEn: 'Stock transfer approved successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في اعتماد طلب التحويل',
        messageEn: 'Failed to approve stock transfer',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Receive stock transfer
   */
  async receiveStockTransfer(transferId: number, receivedBy: number, receivedItems?: { productId: number; variantId?: number; receivedQuantity: number }[]): Promise<ApiResponse<void>> {
    try {
      const receiveTransfer = this.db.raw.transaction(() => {
        // Get transfer details
        const transfer = this.db.raw.prepare('SELECT * FROM stock_transfers WHERE id = ?').get(transferId) as any;
        
        if (!transfer || transfer.status !== 'in_transit') {
          throw new Error('Transfer not found or not ready for receiving');
        }

        // Get transfer items
        const items = this.db.raw.prepare('SELECT * FROM stock_transfer_items WHERE transfer_id = ?').all(transferId) as any[];

        // Update transfer status
        const transferStmt = this.db.raw.prepare(`
          UPDATE stock_transfers 
          SET status = 'received', received_by = ?, receive_date = DATE('now')
          WHERE id = ?
        `);
        transferStmt.run(receivedBy, transferId);

        // Process each item
        for (const item of items) {
          const receivedQty = receivedItems?.find(ri => 
            ri.productId === item.product_id && ri.variantId === item.variant_id
          )?.receivedQuantity || item.approved_quantity || item.requested_quantity;

          // Update received quantity
          this.db.raw.prepare(`
            UPDATE stock_transfer_items 
            SET received_quantity = ?
            WHERE id = ?
          `).run(receivedQty, item.id);

          // Update stock levels
          // Decrease from source location
          this.db.raw.prepare(`
            UPDATE location_stock 
            SET quantity = quantity - ?, last_updated = CURRENT_TIMESTAMP
            WHERE location_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
          `).run(receivedQty, transfer.from_location_id, item.product_id, item.variant_id, item.variant_id);

          // Increase at destination location
          const existingStock = this.db.raw.prepare(`
            SELECT id FROM location_stock 
            WHERE location_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
          `).get(transfer.to_location_id, item.product_id, item.variant_id, item.variant_id);

          if (existingStock) {
            this.db.raw.prepare(`
              UPDATE location_stock 
              SET quantity = quantity + ?, last_updated = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(receivedQty, existingStock.id);
          } else {
            this.db.raw.prepare(`
              INSERT INTO location_stock (location_id, product_id, variant_id, quantity, min_stock)
              VALUES (?, ?, ?, ?, ?)
            `).run(transfer.to_location_id, item.product_id, item.variant_id, receivedQty, 0);
          }

          // Log stock movements
          // Outgoing movement
          this.db.raw.prepare(`
            INSERT INTO stock_movements (
              product_id, variant_id, location_id, movement_type, quantity,
              reference_type, reference_id, notes, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            item.product_id,
            item.variant_id,
            transfer.from_location_id,
            'out',
            -receivedQty,
            'transfer',
            transferId,
            `Transfer to ${transfer.to_location_id}`,
            receivedBy
          );

          // Incoming movement
          this.db.raw.prepare(`
            INSERT INTO stock_movements (
              product_id, variant_id, location_id, movement_type, quantity,
              reference_type, reference_id, notes, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            item.product_id,
            item.variant_id,
            transfer.to_location_id,
            'in',
            receivedQty,
            'transfer',
            transferId,
            `Transfer from ${transfer.from_location_id}`,
            receivedBy
          );
        }
      });

      receiveTransfer();

      return {
        success: true,
        message: 'تم استلام التحويل بنجاح',
        messageEn: 'Stock transfer received successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في استلام التحويل',
        messageEn: 'Failed to receive stock transfer',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get stock transfers with filters
   */
  async getStockTransfers(params: PaginationParams & {
    fromLocationId?: number;
    toLocationId?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<ApiResponse<StockTransfer[]>> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        fromLocationId, 
        toLocationId, 
        status, 
        dateFrom, 
        dateTo,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = params;
      
      const offset = (page - 1) * limit;
      const whereConditions: string[] = ['1=1'];
      const queryParams: any[] = [];

      if (fromLocationId) {
        whereConditions.push('st.from_location_id = ?');
        queryParams.push(fromLocationId);
      }

      if (toLocationId) {
        whereConditions.push('st.to_location_id = ?');
        queryParams.push(toLocationId);
      }

      if (status) {
        whereConditions.push('st.status = ?');
        queryParams.push(status);
      }

      if (dateFrom) {
        whereConditions.push('DATE(st.created_at) >= DATE(?)');
        queryParams.push(dateFrom);
      }

      if (dateTo) {
        whereConditions.push('DATE(st.created_at) <= DATE(?)');
        queryParams.push(dateTo);
      }

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
      const orderClause = `ORDER BY st.${sortBy} ${sortOrder.toUpperCase()}`;

      const stmt = this.db.raw.prepare(`
        SELECT 
          st.*,
          fl.name as from_location_name,
          tl.name as to_location_name,
          ru.full_name as requester_name,
          au.full_name as approver_name,
          reu.full_name as receiver_name,
          COUNT(sti.id) as item_count
        FROM stock_transfers st
        LEFT JOIN locations fl ON st.from_location_id = fl.id
        LEFT JOIN locations tl ON st.to_location_id = tl.id
        LEFT JOIN users_enhanced ru ON st.requested_by = ru.id
        LEFT JOIN users_enhanced au ON st.approved_by = au.id
        LEFT JOIN users_enhanced reu ON st.received_by = reu.id
        LEFT JOIN stock_transfer_items sti ON st.id = sti.transfer_id
        ${whereClause}
        GROUP BY st.id
        ${orderClause}
        LIMIT ? OFFSET ?
      `);

      const countStmt = this.db.raw.prepare(`
        SELECT COUNT(*) as total FROM stock_transfers st ${whereClause}
      `);

      const rows = stmt.all(...queryParams, limit, offset) as any[];
      const totalResult = countStmt.get(...queryParams) as { total: number };

      const transfers = rows.map(row => this.mapStockTransferRow(row));

      return {
        success: true,
        data: transfers,
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
        message: 'فشل في جلب تحويلات المخزون',
        messageEn: 'Failed to fetch stock transfers',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Initialize stock levels for all products at a new location
   */
  private async initializeLocationStock(locationId: number): Promise<void> {
    const products = this.db.raw.prepare('SELECT id FROM products WHERE is_active = 1').all() as any[];
    
    const insertStmt = this.db.raw.prepare(`
      INSERT INTO location_stock (location_id, product_id, quantity, min_stock)
      VALUES (?, ?, ?, ?)
    `);

    for (const product of products) {
      insertStmt.run(locationId, product.id, 0, 0);
    }

    // Also initialize for product variants
    const variants = this.db.raw.prepare('SELECT id, product_id FROM product_variants WHERE is_active = 1').all() as any[];
    
    for (const variant of variants) {
      insertStmt.run(locationId, variant.product_id, 0, 0);
    }
  }

  /**
   * Generate unique transfer number
   */
  private async generateTransferNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `ST-${year}${month}${day}`;
    
    const count = this.db.raw.prepare(`
      SELECT COUNT(*) as count FROM stock_transfers 
      WHERE transfer_number LIKE ?
    `).get(`${prefix}%`) as { count: number };
    
    const sequence = String(count.count + 1).padStart(3, '0');
    return `${prefix}-${sequence}`;
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Map database row to Location object
   */
  private mapLocationRow(row: any): Location {
    return {
      id: row.id,
      name: row.name,
      nameEn: row.name_en,
      type: row.type,
      address: row.address,
      city: row.city,
      governorate: row.governorate,
      phone: row.phone,
      managerId: row.manager_id,
      isActive: Boolean(row.is_active),
      settings: JSON.parse(row.settings || '{"allowNegativeStock":false,"autoReorder":true,"printReceipts":true}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      manager: row.manager_name ? { fullName: row.manager_name } : undefined
    } as Location;
  }

  /**
   * Map database row to StockTransfer object
   */
  private mapStockTransferRow(row: any): StockTransfer {
    return {
      id: row.id,
      fromLocationId: row.from_location_id,
      toLocationId: row.to_location_id,
      transferNumber: row.transfer_number,
      status: row.status,
      requestedBy: row.requested_by,
      approvedBy: row.approved_by,
      receivedBy: row.received_by,
      requestDate: row.request_date,
      approvalDate: row.approval_date,
      receiveDate: row.receive_date,
      notes: row.notes,
      createdAt: row.created_at,
      fromLocation: row.from_location_name ? { name: row.from_location_name } : undefined,
      toLocation: row.to_location_name ? { name: row.to_location_name } : undefined,
      requester: row.requester_name ? { fullName: row.requester_name } : undefined,
      approver: row.approver_name ? { fullName: row.approver_name } : undefined,
      receiver: row.receiver_name ? { fullName: row.receiver_name } : undefined
    } as StockTransfer;
  }
}

export default MultiLocationService;
