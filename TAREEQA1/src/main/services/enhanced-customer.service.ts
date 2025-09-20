// Enhanced Customer Service - Advanced customer management for Phase 2
// Handles customer profiles, analytics, communication preferences, and loyalty programs

import { EnhancedDatabaseManager } from '../database/EnhancedDatabaseManager';
import { 
  EnhancedCustomer, 
  CustomerAnalytics,
  CustomerPurchaseHistory,
  ApiResponse,
  PaginationParams
} from '../../shared/types/enhanced';
import { 
  EnhancedCustomerSchema,
  EnhancedValidationHelper
} from '../../shared/validation/enhancedSchemas';

export class EnhancedCustomerService {
  private db: EnhancedDatabaseManager;

  constructor(db: EnhancedDatabaseManager) {
    this.db = db;
  }

  // ==================== CUSTOMER MANAGEMENT ====================

  /**
   * Create a new enhanced customer
   */
  async createCustomer(customer: Omit<EnhancedCustomer, 'id'>): Promise<ApiResponse<EnhancedCustomer>> {
    try {
      // Validate input
      const validatedCustomer = EnhancedCustomerSchema.parse(customer);
      
      // Check if phone already exists (if provided)
      if (validatedCustomer.phone) {
        const existingPhone = this.db.raw.prepare('SELECT id FROM customers_enhanced WHERE phone = ?').get(validatedCustomer.phone);
        if (existingPhone) {
          return {
            success: false,
            message: 'رقم الهاتف موجود بالفعل',
            messageEn: 'Phone number already exists'
          };
        }
      }

      // Check if email already exists (if provided)
      if (validatedCustomer.email) {
        const existingEmail = this.db.raw.prepare('SELECT id FROM customers_enhanced WHERE email = ?').get(validatedCustomer.email);
        if (existingEmail) {
          return {
            success: false,
            message: 'البريد الإلكتروني موجود بالفعل',
            messageEn: 'Email already exists'
          };
        }
      }

      // Validate credit limit based on customer type
      if (!EnhancedValidationHelper.validateCreditLimit(validatedCustomer.customerType, validatedCustomer.creditLimit || 0)) {
        return {
          success: false,
          message: 'حد الائتمان يتجاوز الحد المسموح لهذا النوع من العملاء',
          messageEn: 'Credit limit exceeds allowed limit for this customer type'
        };
      }

      // Insert customer
      const stmt = this.db.raw.prepare(`
        INSERT INTO customers_enhanced (
          customer_type, name, name_en, email, phone, alternate_phone, address,
          city, governorate, postal_code, tax_id, commercial_register,
          credit_limit, payment_terms, loyalty_points, preferred_language,
          communication_preferences, referred_by, profile_image, notes, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        validatedCustomer.customerType,
        validatedCustomer.name,
        validatedCustomer.nameEn,
        validatedCustomer.email,
        validatedCustomer.phone,
        validatedCustomer.alternatePhone,
        validatedCustomer.address,
        validatedCustomer.city,
        validatedCustomer.governorate,
        validatedCustomer.postalCode,
        validatedCustomer.taxId,
        validatedCustomer.commercialRegister,
        validatedCustomer.creditLimit,
        validatedCustomer.paymentTerms,
        validatedCustomer.loyaltyPoints,
        validatedCustomer.preferredLanguage,
        JSON.stringify(validatedCustomer.communicationPreferences),
        validatedCustomer.referredBy,
        validatedCustomer.profileImage,
        validatedCustomer.notes,
        validatedCustomer.isActive ? 1 : 0
      );

      const createdCustomer = { ...validatedCustomer, id: result.lastInsertRowid as number };

      return {
        success: true,
        data: createdCustomer,
        message: 'تم إنشاء العميل بنجاح',
        messageEn: 'Customer created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء العميل',
        messageEn: 'Failed to create customer',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Update customer information
   */
  async updateCustomer(id: number, updates: Partial<EnhancedCustomer>): Promise<ApiResponse<EnhancedCustomer>> {
    try {
      // Validate updates
      const validatedUpdates = EnhancedCustomerSchema.partial().parse(updates);

      // Check if customer exists
      const existingCustomer = await this.getCustomerById(id);
      if (!existingCustomer.success || !existingCustomer.data) {
        return {
          success: false,
          message: 'العميل غير موجود',
          messageEn: 'Customer not found'
        };
      }

      // Build update query
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
        if (field === 'communicationPreferences' && typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value;
      });

      const stmt = this.db.raw.prepare(`
        UPDATE customers_enhanced 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);

      const result = stmt.run(...values, id);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'فشل في تحديث العميل',
          messageEn: 'Failed to update customer'
        };
      }

      // Return updated customer
      const updatedCustomer = await this.getCustomerById(id);
      return updatedCustomer;

    } catch (error) {
      return {
        success: false,
        message: 'فشل في تحديث العميل',
        messageEn: 'Failed to update customer',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get customer by ID with full details
   */
  async getCustomerById(id: number): Promise<ApiResponse<EnhancedCustomer>> {
    try {
      const stmt = this.db.raw.prepare(`
        SELECT 
          c.*,
          r.name as referrer_name
        FROM customers_enhanced c
        LEFT JOIN customers_enhanced r ON c.referred_by = r.id
        WHERE c.id = ?
      `);

      const row = stmt.get(id) as any;
      
      if (!row) {
        return {
          success: false,
          message: 'العميل غير موجود',
          messageEn: 'Customer not found'
        };
      }

      const customer = this.mapCustomerRow(row);

      // Get customer analytics
      const analytics = await this.getCustomerAnalytics(id);
      if (analytics.success) {
        customer.analytics = analytics.data;
      }

      return {
        success: true,
        data: customer
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب بيانات العميل',
        messageEn: 'Failed to fetch customer',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Search customers with advanced filters
   */
  async searchCustomers(params: PaginationParams & {
    customerType?: string;
    city?: string;
    governorate?: string;
    loyaltyTier?: string;
  } = {}): Promise<ApiResponse<EnhancedCustomer[]>> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        customerType, 
        city, 
        governorate,
        sortBy = 'name',
        sortOrder = 'asc'
      } = params;
      
      const offset = (page - 1) * limit;
      const whereConditions: string[] = ['c.is_active = 1'];
      const queryParams: any[] = [];

      if (search) {
        whereConditions.push('(c.name LIKE ? OR c.name_en LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)');
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (customerType) {
        whereConditions.push('c.customer_type = ?');
        queryParams.push(customerType);
      }

      if (city) {
        whereConditions.push('c.city = ?');
        queryParams.push(city);
      }

      if (governorate) {
        whereConditions.push('c.governorate = ?');
        queryParams.push(governorate);
      }

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
      const orderClause = `ORDER BY c.${this.camelToSnake(sortBy)} ${sortOrder.toUpperCase()}`;

      const stmt = this.db.raw.prepare(`
        SELECT 
          c.*,
          r.name as referrer_name,
          COUNT(t.id) as transaction_count,
          COALESCE(SUM(t.total), 0) as total_spent
        FROM customers_enhanced c
        LEFT JOIN customers_enhanced r ON c.referred_by = r.id
        LEFT JOIN transactions t ON c.id = t.customer_id
        ${whereClause}
        GROUP BY c.id
        ${orderClause}
        LIMIT ? OFFSET ?
      `);

      const countStmt = this.db.raw.prepare(`
        SELECT COUNT(DISTINCT c.id) as total FROM customers_enhanced c ${whereClause}
      `);

      const rows = stmt.all(...queryParams, limit, offset) as any[];
      const totalResult = countStmt.get(...queryParams) as { total: number };

      const customers = rows.map(row => this.mapCustomerRow(row));

      return {
        success: true,
        data: customers,
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
        message: 'فشل في البحث عن العملاء',
        messageEn: 'Failed to search customers',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== CUSTOMER ANALYTICS ====================

  /**
   * Get comprehensive customer analytics
   */
  async getCustomerAnalytics(customerId: number): Promise<ApiResponse<CustomerAnalytics>> {
    try {
      // Basic transaction stats
      const basicStats = this.db.raw.prepare(`
        SELECT 
          COUNT(*) as total_transactions,
          COALESCE(SUM(total), 0) as total_spent,
          COALESCE(AVG(total), 0) as average_order_value,
          MAX(created_at) as last_purchase_date
        FROM transactions 
        WHERE customer_id = ?
      `).get(customerId) as any;

      // Purchase frequency analysis
      const frequencyAnalysis = this.calculatePurchaseFrequency(customerId);

      // Favorite categories
      const favoriteCategories = this.db.raw.prepare(`
        SELECT 
          p.category,
          COUNT(*) as purchase_count
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        JOIN products p ON ti.product_id = p.id
        WHERE t.customer_id = ?
        GROUP BY p.category
        ORDER BY purchase_count DESC
        LIMIT 5
      `).all(customerId) as any[];

      // Calculate loyalty tier
      const loyaltyTier = this.calculateLoyaltyTier(basicStats.total_spent, basicStats.total_transactions);

      // Calculate risk score (0-100, higher = more risk)
      const riskScore = this.calculateRiskScore(customerId, basicStats);

      const analytics: CustomerAnalytics = {
        customerId,
        totalTransactions: basicStats.total_transactions || 0,
        totalSpent: basicStats.total_spent || 0,
        averageOrderValue: basicStats.average_order_value || 0,
        lastPurchaseDate: basicStats.last_purchase_date,
        favoriteCategories: favoriteCategories.map(cat => cat.category),
        purchaseFrequency: frequencyAnalysis,
        lifetimeValue: this.calculateLifetimeValue(basicStats.total_spent, basicStats.total_transactions),
        riskScore,
        loyaltyTier
      };

      return {
        success: true,
        data: analytics
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب تحليلات العميل',
        messageEn: 'Failed to fetch customer analytics',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get customer purchase history
   */
  async getCustomerPurchaseHistory(customerId: number, params: PaginationParams = {}): Promise<ApiResponse<CustomerPurchaseHistory[]>> {
    try {
      const { page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc' } = params;
      const offset = (page - 1) * limit;

      const stmt = this.db.raw.prepare(`
        SELECT 
          t.id,
          t.customer_id,
          t.id as transaction_id,
          DATE(t.created_at) as date,
          t.total as amount,
          COUNT(ti.id) as item_count,
          t.payment_method
        FROM transactions t
        LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
        WHERE t.customer_id = ?
        GROUP BY t.id
        ORDER BY ${sortBy === 'date' ? 't.created_at' : `t.${sortBy}`} ${sortOrder.toUpperCase()}
        LIMIT ? OFFSET ?
      `);

      const countStmt = this.db.raw.prepare(`
        SELECT COUNT(*) as total FROM transactions WHERE customer_id = ?
      `);

      const rows = stmt.all(customerId, limit, offset) as any[];
      const totalResult = countStmt.get(customerId) as { total: number };

      const history = rows.map(row => ({
        id: row.id,
        customerId: row.customer_id,
        transactionId: row.transaction_id,
        date: row.date,
        amount: row.amount,
        itemCount: row.item_count,
        paymentMethod: row.payment_method
      }));

      return {
        success: true,
        data: history,
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
        message: 'فشل في جلب تاريخ مشتريات العميل',
        messageEn: 'Failed to fetch customer purchase history',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== LOYALTY PROGRAM ====================

  /**
   * Add loyalty points to customer
   */
  async addLoyaltyPoints(customerId: number, points: number, reason: string): Promise<ApiResponse<void>> {
    try {
      const stmt = this.db.raw.prepare(`
        UPDATE customers_enhanced 
        SET loyalty_points = loyalty_points + ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);

      const result = stmt.run(points, customerId);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'العميل غير موجود',
          messageEn: 'Customer not found'
        };
      }

      // Log loyalty transaction (you might want to create a loyalty_transactions table)
      // For now, we'll just return success

      return {
        success: true,
        message: `تم إضافة ${points} نقطة ولاء بنجاح`,
        messageEn: `Successfully added ${points} loyalty points`
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إضافة نقاط الولاء',
        messageEn: 'Failed to add loyalty points',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Redeem loyalty points
   */
  async redeemLoyaltyPoints(customerId: number, points: number): Promise<ApiResponse<number>> {
    try {
      // Check if customer has enough points
      const customer = this.db.raw.prepare('SELECT loyalty_points FROM customers_enhanced WHERE id = ?').get(customerId) as any;
      
      if (!customer) {
        return {
          success: false,
          message: 'العميل غير موجود',
          messageEn: 'Customer not found'
        };
      }

      if (customer.loyalty_points < points) {
        return {
          success: false,
          message: 'نقاط الولاء غير كافية',
          messageEn: 'Insufficient loyalty points'
        };
      }

      // Deduct points
      const stmt = this.db.raw.prepare(`
        UPDATE customers_enhanced 
        SET loyalty_points = loyalty_points - ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);

      stmt.run(points, customerId);

      // Calculate redemption value (1 point = 0.1 EGP)
      const redemptionValue = points * 0.1;

      return {
        success: true,
        data: redemptionValue,
        message: `تم استبدال ${points} نقطة بقيمة ${redemptionValue} ج.م`,
        messageEn: `Redeemed ${points} points for ${redemptionValue} EGP`
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في استبدال نقاط الولاء',
        messageEn: 'Failed to redeem loyalty points',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== ANALYTICS HELPERS ====================

  /**
   * Calculate purchase frequency
   */
  private calculatePurchaseFrequency(customerId: number): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' {
    const transactions = this.db.raw.prepare(`
      SELECT created_at FROM transactions 
      WHERE customer_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all(customerId) as any[];

    if (transactions.length < 2) return 'yearly';

    const dates = transactions.map(t => new Date(t.created_at));
    const intervals = [];

    for (let i = 0; i < dates.length - 1; i++) {
      const diff = dates[i].getTime() - dates[i + 1].getTime();
      intervals.push(diff / (1000 * 60 * 60 * 24)); // days
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    if (avgInterval <= 7) return 'daily';
    if (avgInterval <= 30) return 'weekly';
    if (avgInterval <= 90) return 'monthly';
    if (avgInterval <= 365) return 'quarterly';
    return 'yearly';
  }

  /**
   * Calculate loyalty tier
   */
  private calculateLoyaltyTier(totalSpent: number, totalTransactions: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (totalSpent >= 50000 && totalTransactions >= 100) return 'platinum';
    if (totalSpent >= 20000 && totalTransactions >= 50) return 'gold';
    if (totalSpent >= 5000 && totalTransactions >= 20) return 'silver';
    return 'bronze';
  }

  /**
   * Calculate lifetime value
   */
  private calculateLifetimeValue(totalSpent: number, totalTransactions: number): number {
    if (totalTransactions === 0) return 0;
    
    const avgOrderValue = totalSpent / totalTransactions;
    const estimatedLifetimeTransactions = Math.max(totalTransactions * 2, 50); // Conservative estimate
    
    return avgOrderValue * estimatedLifetimeTransactions;
  }

  /**
   * Calculate risk score (0-100, higher = more risk)
   */
  private calculateRiskScore(customerId: number, basicStats: any): number {
    let riskScore = 0;

    // No recent purchases (30% weight)
    if (basicStats.last_purchase_date) {
      const daysSinceLastPurchase = Math.floor((Date.now() - new Date(basicStats.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastPurchase > 365) riskScore += 30;
      else if (daysSinceLastPurchase > 180) riskScore += 20;
      else if (daysSinceLastPurchase > 90) riskScore += 10;
    } else {
      riskScore += 30; // No purchases at all
    }

    // Low transaction count (25% weight)
    if (basicStats.total_transactions < 5) riskScore += 25;
    else if (basicStats.total_transactions < 10) riskScore += 15;
    else if (basicStats.total_transactions < 20) riskScore += 5;

    // Low spending (25% weight)
    if (basicStats.total_spent < 1000) riskScore += 25;
    else if (basicStats.total_spent < 5000) riskScore += 15;
    else if (basicStats.total_spent < 10000) riskScore += 5;

    // Incomplete profile (20% weight)
    const customer = this.db.raw.prepare('SELECT email, phone, address FROM customers_enhanced WHERE id = ?').get(customerId) as any;
    if (!customer?.email) riskScore += 7;
    if (!customer?.phone) riskScore += 7;
    if (!customer?.address) riskScore += 6;

    return Math.min(riskScore, 100);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Map database row to EnhancedCustomer object
   */
  private mapCustomerRow(row: any): EnhancedCustomer {
    return {
      id: row.id,
      customerType: row.customer_type,
      name: row.name,
      nameEn: row.name_en,
      email: row.email,
      phone: row.phone,
      alternatePhone: row.alternate_phone,
      address: row.address,
      city: row.city,
      governorate: row.governorate,
      postalCode: row.postal_code,
      taxId: row.tax_id,
      commercialRegister: row.commercial_register,
      creditLimit: row.credit_limit,
      paymentTerms: row.payment_terms,
      loyaltyPoints: row.loyalty_points,
      totalSpent: row.total_spent || 0,
      lastPurchaseDate: row.last_purchase_date,
      preferredLanguage: row.preferred_language,
      communicationPreferences: JSON.parse(row.communication_preferences || '{"sms":true,"email":false,"whatsapp":false}'),
      referredBy: row.referred_by,
      profileImage: row.profile_image,
      notes: row.notes,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      referrer: row.referrer_name ? { name: row.referrer_name } : undefined
    } as EnhancedCustomer;
  }
}

export default EnhancedCustomerService;
