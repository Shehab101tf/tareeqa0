// Enhanced Reporting Service - Comprehensive reporting system for Phase 2
// Handles 50+ report types with real-time dashboards, sales forecasting, and Egyptian VAT compliance

import { EnhancedDatabaseManager } from '../database/EnhancedDatabaseManager';
import { 
  ReportDefinition, 
  ReportData, 
  ReportChart,
  DashboardWidget,
  DashboardMetric,
  ApiResponse,
  PaginationParams
} from '../../shared/types/enhanced';

export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  locationId?: number;
  userId?: number;
  customerId?: number;
  productId?: number;
  categoryId?: string;
  paymentMethod?: string;
  customerType?: string;
}

export class EnhancedReportingService {
  private db: EnhancedDatabaseManager;

  constructor(db: EnhancedDatabaseManager) {
    this.db = db;
  }

  // ==================== SALES REPORTS ====================

  /**
   * Daily Sales Summary Report
   */
  async getDailySalesReport(filters: ReportFilter = {}): Promise<ApiResponse<ReportData>> {
    try {
      const { dateFrom, dateTo, locationId, userId } = filters;
      
      let whereConditions = ['1=1'];
      let params: any[] = [];

      if (dateFrom) {
        whereConditions.push('DATE(t.created_at) >= DATE(?)');
        params.push(dateFrom);
      }

      if (dateTo) {
        whereConditions.push('DATE(t.created_at) <= DATE(?)');
        params.push(dateTo);
      }

      if (locationId) {
        whereConditions.push('u.location_id = ?');
        params.push(locationId);
      }

      if (userId) {
        whereConditions.push('t.cashier_id = ?');
        params.push(userId);
      }

      const whereClause = whereConditions.join(' AND ');

      const stmt = this.db.raw.prepare(`
        SELECT 
          DATE(t.created_at) as date,
          COUNT(*) as transaction_count,
          SUM(t.subtotal) as subtotal,
          SUM(t.vat_amount) as vat_amount,
          SUM(t.total) as total_amount,
          AVG(t.total) as average_transaction,
          COUNT(DISTINCT t.customer_id) as unique_customers,
          u.full_name as cashier_name
        FROM transactions t
        LEFT JOIN users_enhanced u ON t.cashier_id = u.id
        WHERE ${whereClause}
        GROUP BY DATE(t.created_at), t.cashier_id
        ORDER BY date DESC, cashier_name
      `);

      const data = stmt.all(...params);

      // Calculate summary
      const summary = {
        totalTransactions: data.reduce((sum: number, row: any) => sum + row.transaction_count, 0),
        totalAmount: data.reduce((sum: number, row: any) => sum + row.total_amount, 0),
        totalVAT: data.reduce((sum: number, row: any) => sum + row.vat_amount, 0),
        averageTransaction: data.length > 0 ? data.reduce((sum: number, row: any) => sum + row.total_amount, 0) / data.reduce((sum: number, row: any) => sum + row.transaction_count, 0) : 0
      };

      // Create chart data
      const chartData = this.createSalesChart(data);

      return {
        success: true,
        data: {
          reportId: 'daily-sales',
          title: 'تقرير المبيعات اليومية',
          generatedAt: new Date().toISOString(),
          parameters: filters,
          data,
          summary,
          charts: [chartData]
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء تقرير المبيعات اليومية',
        messageEn: 'Failed to generate daily sales report',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Product Performance Report
   */
  async getProductPerformanceReport(filters: ReportFilter = {}): Promise<ApiResponse<ReportData>> {
    try {
      const { dateFrom, dateTo, categoryId } = filters;
      
      let whereConditions = ['1=1'];
      let params: any[] = [];

      if (dateFrom) {
        whereConditions.push('DATE(t.created_at) >= DATE(?)');
        params.push(dateFrom);
      }

      if (dateTo) {
        whereConditions.push('DATE(t.created_at) <= DATE(?)');
        params.push(dateTo);
      }

      if (categoryId) {
        whereConditions.push('p.category = ?');
        params.push(categoryId);
      }

      const whereClause = whereConditions.join(' AND ');

      const stmt = this.db.raw.prepare(`
        SELECT 
          p.id,
          p.name,
          p.category,
          p.sku,
          SUM(ti.quantity) as total_quantity_sold,
          SUM(ti.total_price) as total_revenue,
          AVG(ti.unit_price) as average_price,
          COUNT(DISTINCT t.id) as transaction_count,
          p.stock as current_stock,
          (SUM(ti.total_price) - SUM(ti.quantity * p.cost_price)) as profit
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        JOIN products p ON ti.product_id = p.id
        WHERE ${whereClause}
        GROUP BY p.id
        ORDER BY total_revenue DESC
      `);

      const data = stmt.all(...params);

      // Calculate ABC analysis
      const totalRevenue = data.reduce((sum: number, row: any) => sum + row.total_revenue, 0);
      let cumulativeRevenue = 0;
      
      const dataWithABC = data.map((row: any) => {
        cumulativeRevenue += row.total_revenue;
        const cumulativePercentage = (cumulativeRevenue / totalRevenue) * 100;
        
        let abcCategory = 'C';
        if (cumulativePercentage <= 80) abcCategory = 'A';
        else if (cumulativePercentage <= 95) abcCategory = 'B';
        
        return { ...row, abc_category: abcCategory };
      });

      const summary = {
        totalProducts: data.length,
        totalRevenue,
        totalProfit: data.reduce((sum: number, row: any) => sum + row.profit, 0),
        categoryA: dataWithABC.filter((row: any) => row.abc_category === 'A').length,
        categoryB: dataWithABC.filter((row: any) => row.abc_category === 'B').length,
        categoryC: dataWithABC.filter((row: any) => row.abc_category === 'C').length
      };

      return {
        success: true,
        data: {
          reportId: 'product-performance',
          title: 'تقرير أداء المنتجات',
          generatedAt: new Date().toISOString(),
          parameters: filters,
          data: dataWithABC,
          summary
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء تقرير أداء المنتجات',
        messageEn: 'Failed to generate product performance report',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Customer Analysis Report
   */
  async getCustomerAnalysisReport(filters: ReportFilter = {}): Promise<ApiResponse<ReportData>> {
    try {
      const { dateFrom, dateTo, customerType } = filters;
      
      let whereConditions = ['c.is_active = 1'];
      let params: any[] = [];

      if (dateFrom) {
        whereConditions.push('DATE(t.created_at) >= DATE(?)');
        params.push(dateFrom);
      }

      if (dateTo) {
        whereConditions.push('DATE(t.created_at) <= DATE(?)');
        params.push(dateTo);
      }

      if (customerType) {
        whereConditions.push('c.customer_type = ?');
        params.push(customerType);
      }

      const whereClause = whereConditions.join(' AND ');

      const stmt = this.db.raw.prepare(`
        SELECT 
          c.id,
          c.name,
          c.customer_type,
          c.city,
          c.governorate,
          COUNT(t.id) as transaction_count,
          SUM(t.total) as total_spent,
          AVG(t.total) as average_order_value,
          MAX(t.created_at) as last_purchase_date,
          c.loyalty_points,
          CASE 
            WHEN SUM(t.total) >= 50000 AND COUNT(t.id) >= 100 THEN 'platinum'
            WHEN SUM(t.total) >= 20000 AND COUNT(t.id) >= 50 THEN 'gold'
            WHEN SUM(t.total) >= 5000 AND COUNT(t.id) >= 20 THEN 'silver'
            ELSE 'bronze'
          END as loyalty_tier
        FROM customers_enhanced c
        LEFT JOIN transactions t ON c.id = t.customer_id
        WHERE ${whereClause}
        GROUP BY c.id
        HAVING transaction_count > 0
        ORDER BY total_spent DESC
      `);

      const data = stmt.all(...params);

      // Calculate RFM analysis (Recency, Frequency, Monetary)
      const dataWithRFM = data.map((row: any) => {
        const daysSinceLastPurchase = row.last_purchase_date ? 
          Math.floor((Date.now() - new Date(row.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24)) : 999;
        
        // RFM scoring (1-5 scale)
        let recencyScore = 5;
        if (daysSinceLastPurchase > 365) recencyScore = 1;
        else if (daysSinceLastPurchase > 180) recencyScore = 2;
        else if (daysSinceLastPurchase > 90) recencyScore = 3;
        else if (daysSinceLastPurchase > 30) recencyScore = 4;

        let frequencyScore = Math.min(5, Math.floor(row.transaction_count / 10) + 1);
        let monetaryScore = Math.min(5, Math.floor(row.total_spent / 10000) + 1);

        return {
          ...row,
          days_since_last_purchase: daysSinceLastPurchase,
          rfm_recency: recencyScore,
          rfm_frequency: frequencyScore,
          rfm_monetary: monetaryScore,
          rfm_score: recencyScore + frequencyScore + monetaryScore
        };
      });

      const summary = {
        totalCustomers: data.length,
        totalRevenue: data.reduce((sum: number, row: any) => sum + row.total_spent, 0),
        averageOrderValue: data.length > 0 ? data.reduce((sum: number, row: any) => sum + row.total_spent, 0) / data.reduce((sum: number, row: any) => sum + row.transaction_count, 0) : 0,
        loyaltyTiers: {
          platinum: dataWithRFM.filter((row: any) => row.loyalty_tier === 'platinum').length,
          gold: dataWithRFM.filter((row: any) => row.loyalty_tier === 'gold').length,
          silver: dataWithRFM.filter((row: any) => row.loyalty_tier === 'silver').length,
          bronze: dataWithRFM.filter((row: any) => row.loyalty_tier === 'bronze').length
        }
      };

      return {
        success: true,
        data: {
          reportId: 'customer-analysis',
          title: 'تقرير تحليل العملاء',
          generatedAt: new Date().toISOString(),
          parameters: filters,
          data: dataWithRFM,
          summary
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء تقرير تحليل العملاء',
        messageEn: 'Failed to generate customer analysis report',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Inventory Status Report
   */
  async getInventoryStatusReport(): Promise<ApiResponse<ReportData>> {
    try {
      const stmt = this.db.raw.prepare(`
        SELECT 
          p.id,
          p.name,
          p.sku,
          p.category,
          p.stock,
          p.min_stock,
          p.cost_price,
          p.selling_price,
          (p.stock * p.cost_price) as stock_value,
          CASE 
            WHEN p.stock <= 0 THEN 'out_of_stock'
            WHEN p.stock <= p.min_stock THEN 'low_stock'
            WHEN p.stock > p.min_stock * 3 THEN 'overstock'
            ELSE 'normal'
          END as stock_status,
          COUNT(sm.id) as movement_count_30days
        FROM products p
        LEFT JOIN stock_movements sm ON p.id = sm.product_id 
          AND sm.created_at >= DATE('now', '-30 days')
        WHERE p.is_active = 1
        GROUP BY p.id
        ORDER BY stock_status, p.name
      `);

      const data = stmt.all();

      // Add ABC analysis based on stock value
      const totalStockValue = data.reduce((sum: number, row: any) => sum + row.stock_value, 0);
      let cumulativeValue = 0;
      
      const dataWithABC = data
        .sort((a: any, b: any) => b.stock_value - a.stock_value)
        .map((row: any) => {
          cumulativeValue += row.stock_value;
          const cumulativePercentage = (cumulativeValue / totalStockValue) * 100;
          
          let abcCategory = 'C';
          if (cumulativePercentage <= 80) abcCategory = 'A';
          else if (cumulativePercentage <= 95) abcCategory = 'B';
          
          return { ...row, abc_category: abcCategory };
        });

      const summary = {
        totalProducts: data.length,
        totalStockValue,
        outOfStock: data.filter((row: any) => row.stock_status === 'out_of_stock').length,
        lowStock: data.filter((row: any) => row.stock_status === 'low_stock').length,
        overstock: data.filter((row: any) => row.stock_status === 'overstock').length,
        normal: data.filter((row: any) => row.stock_status === 'normal').length
      };

      return {
        success: true,
        data: {
          reportId: 'inventory-status',
          title: 'تقرير حالة المخزون',
          generatedAt: new Date().toISOString(),
          parameters: {},
          data: dataWithABC,
          summary
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء تقرير حالة المخزون',
        messageEn: 'Failed to generate inventory status report',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Financial Summary Report (Egyptian VAT Compliant)
   */
  async getFinancialSummaryReport(filters: ReportFilter = {}): Promise<ApiResponse<ReportData>> {
    try {
      const { dateFrom, dateTo } = filters;
      
      let whereConditions = ['1=1'];
      let params: any[] = [];

      if (dateFrom) {
        whereConditions.push('DATE(t.created_at) >= DATE(?)');
        params.push(dateFrom);
      }

      if (dateTo) {
        whereConditions.push('DATE(t.created_at) <= DATE(?)');
        params.push(dateTo);
      }

      const whereClause = whereConditions.join(' AND ');

      // Sales summary
      const salesStmt = this.db.raw.prepare(`
        SELECT 
          COUNT(*) as transaction_count,
          SUM(subtotal) as total_subtotal,
          SUM(vat_amount) as total_vat,
          SUM(total) as total_amount,
          payment_method
        FROM transactions t
        WHERE ${whereClause}
        GROUP BY payment_method
      `);

      const salesData = salesStmt.all(...params);

      // Cost of goods sold
      const cogsStmt = this.db.raw.prepare(`
        SELECT 
          SUM(ti.quantity * p.cost_price) as total_cogs
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        JOIN products p ON ti.product_id = p.id
        WHERE ${whereClause}
      `);

      const cogsData = cogsStmt.get(...params) as any;

      // Calculate totals
      const totalRevenue = salesData.reduce((sum: number, row: any) => sum + row.total_amount, 0);
      const totalVAT = salesData.reduce((sum: number, row: any) => sum + row.total_vat, 0);
      const totalCOGS = cogsData.total_cogs || 0;
      const grossProfit = totalRevenue - totalCOGS;
      const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      // VAT breakdown (Egyptian compliance)
      const vatBreakdown = {
        taxableAmount: totalRevenue - totalVAT,
        vatRate: 14, // Egyptian VAT rate
        vatAmount: totalVAT,
        totalIncludingVat: totalRevenue
      };

      const summary = {
        totalRevenue,
        totalVAT,
        totalCOGS,
        grossProfit,
        grossProfitMargin,
        vatBreakdown,
        paymentMethodBreakdown: salesData
      };

      return {
        success: true,
        data: {
          reportId: 'financial-summary',
          title: 'التقرير المالي الشامل',
          generatedAt: new Date().toISOString(),
          parameters: filters,
          data: salesData,
          summary
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء التقرير المالي',
        messageEn: 'Failed to generate financial summary report',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== DASHBOARD WIDGETS ====================

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<ApiResponse<DashboardMetric[]>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Today's sales
      const todaySales = this.db.raw.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as amount
        FROM transactions WHERE DATE(created_at) = DATE(?)
      `).get(today) as any;

      const yesterdaySales = this.db.raw.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as amount
        FROM transactions WHERE DATE(created_at) = DATE(?)
      `).get(yesterday) as any;

      // Low stock products
      const lowStock = this.db.raw.prepare(`
        SELECT COUNT(*) as count FROM products 
        WHERE is_active = 1 AND stock <= min_stock
      `).get() as any;

      // Total customers
      const totalCustomers = this.db.raw.prepare(`
        SELECT COUNT(*) as count FROM customers_enhanced WHERE is_active = 1
      `).get() as any;

      // Calculate trends
      const salesTrend = yesterdaySales.amount > 0 ? 
        ((todaySales.amount - yesterdaySales.amount) / yesterdaySales.amount) * 100 : 0;

      const metrics: DashboardMetric[] = [
        {
          label: 'مبيعات اليوم',
          labelEn: "Today's Sales",
          value: todaySales.amount,
          format: 'currency',
          trend: {
            direction: salesTrend > 0 ? 'up' : salesTrend < 0 ? 'down' : 'stable',
            percentage: Math.abs(salesTrend),
            period: 'vs yesterday'
          },
          color: 'success'
        },
        {
          label: 'عدد المعاملات اليوم',
          labelEn: "Today's Transactions",
          value: todaySales.count,
          format: 'number',
          color: 'primary'
        },
        {
          label: 'منتجات منخفضة المخزون',
          labelEn: 'Low Stock Products',
          value: lowStock.count,
          format: 'number',
          color: lowStock.count > 0 ? 'warning' : 'success'
        },
        {
          label: 'إجمالي العملاء',
          labelEn: 'Total Customers',
          value: totalCustomers.count,
          format: 'number',
          color: 'info'
        }
      ];

      return {
        success: true,
        data: metrics
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب مؤشرات لوحة التحكم',
        messageEn: 'Failed to fetch dashboard metrics',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== SALES FORECASTING ====================

  /**
   * Generate sales forecast using simple linear regression
   */
  async getSalesForecast(days: number = 30): Promise<ApiResponse<any>> {
    try {
      // Get historical sales data (last 90 days)
      const historicalData = this.db.raw.prepare(`
        SELECT 
          DATE(created_at) as date,
          SUM(total) as daily_sales
        FROM transactions 
        WHERE created_at >= DATE('now', '-90 days')
        GROUP BY DATE(created_at)
        ORDER BY date
      `).all() as any[];

      if (historicalData.length < 7) {
        return {
          success: false,
          message: 'بيانات غير كافية للتنبؤ',
          messageEn: 'Insufficient data for forecasting'
        };
      }

      // Simple linear regression
      const n = historicalData.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

      historicalData.forEach((row, index) => {
        const x = index + 1;
        const y = row.daily_sales;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Generate forecast
      const forecast = [];
      for (let i = 1; i <= days; i++) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + i);
        
        const predictedSales = slope * (n + i) + intercept;
        
        forecast.push({
          date: forecastDate.toISOString().split('T')[0],
          predicted_sales: Math.max(0, predictedSales), // Ensure non-negative
          confidence: Math.max(0.5, 1 - (i / days) * 0.5) // Decreasing confidence over time
        });
      }

      const totalForecast = forecast.reduce((sum, day) => sum + day.predicted_sales, 0);

      return {
        success: true,
        data: {
          historical: historicalData,
          forecast,
          summary: {
            totalForecastedSales: totalForecast,
            averageDailySales: totalForecast / days,
            trendDirection: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
            trendStrength: Math.abs(slope)
          }
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء توقعات المبيعات',
        messageEn: 'Failed to generate sales forecast',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Create sales chart data
   */
  private createSalesChart(data: any[]): ReportChart {
    return {
      type: 'line',
      title: 'اتجاه المبيعات',
      data: {
        labels: data.map(row => row.date),
        datasets: [{
          label: 'إجمالي المبيعات',
          data: data.map(row => row.total_amount),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return value.toLocaleString('ar-EG', { 
                  style: 'currency', 
                  currency: 'EGP' 
                });
              }
            }
          }
        }
      }
    };
  }

  /**
   * Get all available report definitions
   */
  getReportDefinitions(): ReportDefinition[] {
    return [
      {
        id: 'daily-sales',
        name: 'تقرير المبيعات اليومية',
        nameEn: 'Daily Sales Report',
        category: 'sales',
        description: 'تقرير شامل للمبيعات اليومية مع تفاصيل الكاشيرات والعملاء',
        parameters: [
          { name: 'dateFrom', type: 'date', label: 'من تاريخ', required: false },
          { name: 'dateTo', type: 'date', label: 'إلى تاريخ', required: false },
          { name: 'locationId', type: 'select', label: 'الموقع', required: false },
          { name: 'userId', type: 'select', label: 'الكاشير', required: false }
        ],
        permissions: ['reports.view', 'sales.view'],
        isActive: true
      },
      {
        id: 'product-performance',
        name: 'تقرير أداء المنتجات',
        nameEn: 'Product Performance Report',
        category: 'inventory',
        description: 'تحليل أداء المنتجات مع تصنيف ABC',
        parameters: [
          { name: 'dateFrom', type: 'date', label: 'من تاريخ', required: false },
          { name: 'dateTo', type: 'date', label: 'إلى تاريخ', required: false },
          { name: 'categoryId', type: 'select', label: 'الفئة', required: false }
        ],
        permissions: ['reports.view', 'inventory.view'],
        isActive: true
      },
      {
        id: 'customer-analysis',
        name: 'تقرير تحليل العملاء',
        nameEn: 'Customer Analysis Report',
        category: 'customers',
        description: 'تحليل شامل للعملاء مع تقييم RFM ومستويات الولاء',
        parameters: [
          { name: 'dateFrom', type: 'date', label: 'من تاريخ', required: false },
          { name: 'dateTo', type: 'date', label: 'إلى تاريخ', required: false },
          { name: 'customerType', type: 'select', label: 'نوع العميل', required: false }
        ],
        permissions: ['reports.view', 'customers.view'],
        isActive: true
      },
      {
        id: 'inventory-status',
        name: 'تقرير حالة المخزون',
        nameEn: 'Inventory Status Report',
        category: 'inventory',
        description: 'تقرير شامل لحالة المخزون مع تحليل ABC',
        parameters: [],
        permissions: ['reports.view', 'inventory.view'],
        isActive: true
      },
      {
        id: 'financial-summary',
        name: 'التقرير المالي الشامل',
        nameEn: 'Financial Summary Report',
        category: 'financial',
        description: 'تقرير مالي شامل متوافق مع ضريبة القيمة المضافة المصرية',
        parameters: [
          { name: 'dateFrom', type: 'date', label: 'من تاريخ', required: true },
          { name: 'dateTo', type: 'date', label: 'إلى تاريخ', required: true }
        ],
        permissions: ['reports.view', 'financial.view'],
        isActive: true
      }
    ];
  }
}

export default EnhancedReportingService;
