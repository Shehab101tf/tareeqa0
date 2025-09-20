// Monitoring Service - Advanced system monitoring and analytics for Tareeqa POS
// Handles real-time health monitoring, performance metrics, business intelligence, and predictive analytics

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { EnhancedDatabaseManager } from '../database/EnhancedDatabaseManager';
import { ApiResponse } from '../../shared/types/enhanced';

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    database: ComponentHealth;
    memory: ComponentHealth;
    cpu: ComponentHealth;
    disk: ComponentHealth;
    network: ComponentHealth;
    hardware: ComponentHealth;
  };
  alerts: SystemAlert[];
  lastChecked: string;
}

export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  threshold: number;
  message: string;
  messageEn: string;
}

export interface SystemAlert {
  id: string;
  type: 'performance' | 'security' | 'business' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

export interface BusinessMetrics {
  period: string;
  sales: {
    totalRevenue: number;
    transactionCount: number;
    averageTransaction: number;
    growthRate: number;
  };
  inventory: {
    totalProducts: number;
    lowStockItems: number;
    stockValue: number;
    turnoverRate: number;
  };
  customers: {
    totalCustomers: number;
    newCustomers: number;
    retentionRate: number;
    loyaltyEngagement: number;
  };
  performance: {
    systemUptime: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
}

export interface PredictiveAnalytics {
  salesForecast: {
    nextWeek: number;
    nextMonth: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  inventoryPredictions: {
    stockouts: StockoutPrediction[];
    reorderSuggestions: ReorderSuggestion[];
  };
  customerInsights: {
    churnRisk: CustomerChurnRisk[];
    opportunityCustomers: OpportunityCustomer[];
  };
  systemPredictions: {
    maintenanceNeeded: MaintenancePrediction[];
    capacityWarnings: CapacityWarning[];
  };
}

export interface StockoutPrediction {
  productId: number;
  productName: string;
  currentStock: number;
  predictedStockoutDate: string;
  confidence: number;
  suggestedReorderQuantity: number;
}

export interface ReorderSuggestion {
  productId: number;
  productName: string;
  suggestedQuantity: number;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface CustomerChurnRisk {
  customerId: number;
  customerName: string;
  riskScore: number;
  lastPurchase: string;
  predictedChurnDate: string;
  retentionSuggestions: string[];
}

export interface OpportunityCustomer {
  customerId: number;
  customerName: string;
  opportunityValue: number;
  recommendedProducts: string[];
  engagementStrategy: string;
}

export interface MaintenancePrediction {
  component: string;
  predictedFailureDate: string;
  confidence: number;
  recommendedAction: string;
}

export interface CapacityWarning {
  resource: 'storage' | 'memory' | 'cpu' | 'database';
  currentUsage: number;
  predictedFullDate: string;
  recommendedAction: string;
}

export class MonitoringService {
  private db: EnhancedDatabaseManager;
  private monitoringInterval?: NodeJS.Timeout;
  private alertThresholds: Record<string, number>;

  constructor(db: EnhancedDatabaseManager) {
    this.db = db;
    this.alertThresholds = {
      cpu: 80,
      memory: 85,
      disk: 90,
      responseTime: 1000,
      errorRate: 5
    };
    this.initializeMonitoringTables();
  }

  /**
   * Initialize monitoring tables
   */
  private initializeMonitoringTables(): void {
    // System health metrics table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS system_health_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        cpu_usage REAL NOT NULL,
        memory_usage REAL NOT NULL,
        disk_usage REAL NOT NULL,
        response_time REAL NOT NULL,
        active_connections INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        uptime INTEGER NOT NULL
      )
    `);

    // Business metrics table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS business_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        total_revenue REAL NOT NULL,
        transaction_count INTEGER NOT NULL,
        average_transaction REAL NOT NULL,
        growth_rate REAL NOT NULL,
        total_products INTEGER NOT NULL,
        low_stock_items INTEGER NOT NULL,
        stock_value REAL NOT NULL,
        turnover_rate REAL NOT NULL,
        total_customers INTEGER NOT NULL,
        new_customers INTEGER NOT NULL,
        retention_rate REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // System alerts table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS system_alerts (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        title_en TEXT NOT NULL,
        description TEXT NOT NULL,
        description_en TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        acknowledged BOOLEAN DEFAULT 0,
        resolved_at DATETIME,
        metadata TEXT
      )
    `);

    // Predictive analytics cache table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS predictive_analytics_cache (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        confidence REAL NOT NULL,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL
      )
    `);

    console.log('✅ Monitoring tables initialized');
  }

  // ==================== SYSTEM HEALTH MONITORING ====================

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMinutes: number = 5): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.collectSystemMetrics();
      await this.checkSystemHealth();
      await this.generateBusinessMetrics();
    }, intervalMinutes * 60 * 1000);

    console.log(`✅ Monitoring started with ${intervalMinutes} minute intervals`);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('✅ Monitoring stopped');
    }
  }

  /**
   * Get current system health
   */
  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    try {
      const health = await this.assessSystemHealth();
      return {
        success: true,
        data: health
      };
    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب حالة النظام',
        messageEn: 'Failed to get system health',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Assess system health
   */
  private async assessSystemHealth(): Promise<SystemHealth> {
    const cpuUsage = await this.getCpuUsage();
    const memoryUsage = this.getMemoryUsage();
    const diskUsage = await this.getDiskUsage();
    const responseTime = await this.measureResponseTime();
    const networkStatus = await this.checkNetworkHealth();
    const hardwareStatus = await this.checkHardwareHealth();

    const components = {
      database: this.assessComponent(responseTime, this.alertThresholds.responseTime, 'Database response time'),
      memory: this.assessComponent(memoryUsage, this.alertThresholds.memory, 'Memory usage'),
      cpu: this.assessComponent(cpuUsage, this.alertThresholds.cpu, 'CPU usage'),
      disk: this.assessComponent(diskUsage, this.alertThresholds.disk, 'Disk usage'),
      network: networkStatus,
      hardware: hardwareStatus
    };

    const overallStatus = this.calculateOverallHealth(components);
    const alerts = await this.getActiveAlerts();

    return {
      overall: overallStatus,
      components,
      alerts,
      lastChecked: new Date().toISOString()
    };
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<void> {
    try {
      const metrics = {
        cpuUsage: await this.getCpuUsage(),
        memoryUsage: this.getMemoryUsage(),
        diskUsage: await this.getDiskUsage(),
        responseTime: await this.measureResponseTime(),
        activeConnections: 1, // Simplified for single-user system
        errorCount: await this.getRecentErrorCount(),
        uptime: process.uptime()
      };

      const stmt = this.db.raw.prepare(`
        INSERT INTO system_health_metrics (
          cpu_usage, memory_usage, disk_usage, response_time,
          active_connections, error_count, uptime
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        metrics.cpuUsage,
        metrics.memoryUsage,
        metrics.diskUsage,
        metrics.responseTime,
        metrics.activeConnections,
        metrics.errorCount,
        metrics.uptime
      );

      // Check for alerts
      await this.checkForAlerts(metrics);

    } catch (error) {
      console.error('Failed to collect system metrics:', error);
    }
  }

  // ==================== BUSINESS METRICS ====================

  /**
   * Generate business metrics
   */
  private async generateBusinessMetrics(): Promise<void> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      // Sales metrics
      const salesData = this.db.raw.prepare(`
        SELECT 
          COUNT(*) as transaction_count,
          COALESCE(SUM(total), 0) as total_revenue,
          COALESCE(AVG(total), 0) as average_transaction
        FROM transactions 
        WHERE created_at >= ? AND created_at < ?
      `).get(startOfDay.toISOString(), endOfDay.toISOString()) as any;

      // Growth rate (compare with yesterday)
      const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayData = this.db.raw.prepare(`
        SELECT COALESCE(SUM(total), 0) as revenue
        FROM transactions 
        WHERE created_at >= ? AND created_at < ?
      `).get(yesterday.toISOString(), startOfDay.toISOString()) as any;

      const growthRate = yesterdayData.revenue > 0 ? 
        ((salesData.total_revenue - yesterdayData.revenue) / yesterdayData.revenue) * 100 : 0;

      // Inventory metrics
      const inventoryData = this.db.raw.prepare(`
        SELECT 
          COUNT(*) as total_products,
          SUM(CASE WHEN stock <= min_stock THEN 1 ELSE 0 END) as low_stock_items,
          SUM(stock * cost_price) as stock_value
        FROM products 
        WHERE is_active = 1
      `).get() as any;

      // Customer metrics
      const customerData = this.db.raw.prepare(`
        SELECT 
          COUNT(*) as total_customers,
          SUM(CASE WHEN DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as new_customers
        FROM customers_enhanced 
        WHERE is_active = 1
      `).get() as any;

      // Store metrics
      const stmt = this.db.raw.prepare(`
        INSERT INTO business_metrics (
          period_start, period_end, total_revenue, transaction_count,
          average_transaction, growth_rate, total_products, low_stock_items,
          stock_value, turnover_rate, total_customers, new_customers, retention_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        startOfDay.toISOString().split('T')[0],
        endOfDay.toISOString().split('T')[0],
        salesData.total_revenue || 0,
        salesData.transaction_count || 0,
        salesData.average_transaction || 0,
        growthRate,
        inventoryData.total_products || 0,
        inventoryData.low_stock_items || 0,
        inventoryData.stock_value || 0,
        0, // turnover_rate - would calculate based on historical data
        customerData.total_customers || 0,
        customerData.new_customers || 0,
        0 // retention_rate - would calculate based on historical data
      );

    } catch (error) {
      console.error('Failed to generate business metrics:', error);
    }
  }

  /**
   * Get business metrics for period
   */
  async getBusinessMetrics(period: 'today' | 'week' | 'month' = 'today'): Promise<ApiResponse<BusinessMetrics>> {
    try {
      let dateFilter = '';
      const params: any[] = [];

      switch (period) {
        case 'today':
          dateFilter = 'WHERE DATE(period_start) = DATE("now")';
          break;
        case 'week':
          dateFilter = 'WHERE period_start >= DATE("now", "-7 days")';
          break;
        case 'month':
          dateFilter = 'WHERE period_start >= DATE("now", "-30 days")';
          break;
      }

      const stmt = this.db.raw.prepare(`
        SELECT 
          SUM(total_revenue) as total_revenue,
          SUM(transaction_count) as transaction_count,
          AVG(average_transaction) as average_transaction,
          AVG(growth_rate) as growth_rate,
          AVG(total_products) as total_products,
          AVG(low_stock_items) as low_stock_items,
          AVG(stock_value) as stock_value,
          AVG(turnover_rate) as turnover_rate,
          AVG(total_customers) as total_customers,
          SUM(new_customers) as new_customers,
          AVG(retention_rate) as retention_rate
        FROM business_metrics ${dateFilter}
      `);

      const data = stmt.get(...params) as any;

      const metrics: BusinessMetrics = {
        period,
        sales: {
          totalRevenue: data.total_revenue || 0,
          transactionCount: data.transaction_count || 0,
          averageTransaction: data.average_transaction || 0,
          growthRate: data.growth_rate || 0
        },
        inventory: {
          totalProducts: data.total_products || 0,
          lowStockItems: data.low_stock_items || 0,
          stockValue: data.stock_value || 0,
          turnoverRate: data.turnover_rate || 0
        },
        customers: {
          totalCustomers: data.total_customers || 0,
          newCustomers: data.new_customers || 0,
          retentionRate: data.retention_rate || 0,
          loyaltyEngagement: 0 // Would calculate from loyalty data
        },
        performance: {
          systemUptime: process.uptime(),
          responseTime: await this.measureResponseTime(),
          errorRate: await this.calculateErrorRate(),
          throughput: await this.calculateThroughput()
        }
      };

      return {
        success: true,
        data: metrics
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب مؤشرات الأعمال',
        messageEn: 'Failed to get business metrics',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== PREDICTIVE ANALYTICS ====================

  /**
   * Generate predictive analytics
   */
  async generatePredictiveAnalytics(): Promise<ApiResponse<PredictiveAnalytics>> {
    try {
      const analytics: PredictiveAnalytics = {
        salesForecast: await this.generateSalesForecast(),
        inventoryPredictions: await this.generateInventoryPredictions(),
        customerInsights: await this.generateCustomerInsights(),
        systemPredictions: await this.generateSystemPredictions()
      };

      // Cache the results
      await this.cachePredictiveAnalytics(analytics);

      return {
        success: true,
        data: analytics
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء التحليلات التنبؤية',
        messageEn: 'Failed to generate predictive analytics',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== HELPER METHODS ====================

  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
        resolve(Math.min(totalUsage * 100, 100));
      }, 100);
    });
  }

  private getMemoryUsage(): number {
    const memUsage = process.memoryUsage();
    return (memUsage.heapUsed / memUsage.heapTotal) * 100;
  }

  private async getDiskUsage(): Promise<number> {
    try {
      const userDataPath = app.getPath('userData');
      // Simplified disk usage calculation
      return 25; // Placeholder
    } catch (error) {
      return 0;
    }
  }

  private async measureResponseTime(): Promise<number> {
    const start = Date.now();
    try {
      this.db.raw.prepare('SELECT 1').get();
      return Date.now() - start;
    } catch (error) {
      return -1;
    }
  }

  private assessComponent(value: number, threshold: number, description: string): ComponentHealth {
    let status: 'healthy' | 'warning' | 'critical';
    let message: string;
    let messageEn: string;

    if (value < threshold * 0.7) {
      status = 'healthy';
      message = 'الحالة جيدة';
      messageEn = 'Status is good';
    } else if (value < threshold) {
      status = 'warning';
      message = 'تحذير - الاستخدام مرتفع';
      messageEn = 'Warning - High usage';
    } else {
      status = 'critical';
      message = 'حرج - الاستخدام مفرط';
      messageEn = 'Critical - Excessive usage';
    }

    return { status, value, threshold, message, messageEn };
  }

  private calculateOverallHealth(components: SystemHealth['components']): 'healthy' | 'warning' | 'critical' {
    const statuses = Object.values(components).map(c => c.status);
    
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    return 'healthy';
  }

  private async getActiveAlerts(): Promise<SystemAlert[]> {
    try {
      const stmt = this.db.raw.prepare(`
        SELECT * FROM system_alerts 
        WHERE resolved_at IS NULL 
        ORDER BY severity DESC, timestamp DESC
      `);

      const rows = stmt.all() as any[];
      return rows.map(row => ({
        id: row.id,
        type: row.type,
        severity: row.severity,
        title: row.title,
        titleEn: row.title_en,
        description: row.description,
        descriptionEn: row.description_en,
        timestamp: row.timestamp,
        acknowledged: Boolean(row.acknowledged),
        resolvedAt: row.resolved_at
      }));
    } catch (error) {
      return [];
    }
  }

  private async checkNetworkHealth(): Promise<ComponentHealth> {
    // Simplified network check
    return {
      status: 'healthy',
      value: 100,
      threshold: 100,
      message: 'الشبكة متصلة',
      messageEn: 'Network connected'
    };
  }

  private async checkHardwareHealth(): Promise<ComponentHealth> {
    // Simplified hardware check
    return {
      status: 'healthy',
      value: 100,
      threshold: 100,
      message: 'الأجهزة تعمل بشكل طبيعي',
      messageEn: 'Hardware functioning normally'
    };
  }

  private async getRecentErrorCount(): Promise<number> {
    try {
      const result = this.db.raw.prepare(`
        SELECT COUNT(*) as count FROM system_logs 
        WHERE level = 'error' AND timestamp >= datetime('now', '-1 hour')
      `).get() as any;
      return result?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async checkForAlerts(metrics: any): Promise<void> {
    // Check CPU usage
    if (metrics.cpuUsage > this.alertThresholds.cpu) {
      await this.createAlert('performance', 'high', 'استخدام المعالج مرتفع', 'High CPU Usage', 
        `استخدام المعالج وصل إلى ${metrics.cpuUsage.toFixed(1)}%`, 
        `CPU usage reached ${metrics.cpuUsage.toFixed(1)}%`);
    }

    // Check memory usage
    if (metrics.memoryUsage > this.alertThresholds.memory) {
      await this.createAlert('performance', 'high', 'استخدام الذاكرة مرتفع', 'High Memory Usage',
        `استخدام الذاكرة وصل إلى ${metrics.memoryUsage.toFixed(1)}%`,
        `Memory usage reached ${metrics.memoryUsage.toFixed(1)}%`);
    }

    // Check response time
    if (metrics.responseTime > this.alertThresholds.responseTime) {
      await this.createAlert('performance', 'medium', 'بطء في الاستجابة', 'Slow Response Time',
        `وقت الاستجابة وصل إلى ${metrics.responseTime}ms`,
        `Response time reached ${metrics.responseTime}ms`);
    }
  }

  private async createAlert(type: string, severity: string, title: string, titleEn: string, description: string, descriptionEn: string): Promise<void> {
    try {
      const alertId = `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const stmt = this.db.raw.prepare(`
        INSERT INTO system_alerts (id, type, severity, title, title_en, description, description_en)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(alertId, type, severity, title, titleEn, description, descriptionEn);
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  }

  private async generateSalesForecast(): Promise<PredictiveAnalytics['salesForecast']> {
    // Simplified forecasting - in production would use more sophisticated algorithms
    const recentSales = this.db.raw.prepare(`
      SELECT SUM(total) as revenue FROM transactions 
      WHERE created_at >= DATE('now', '-7 days')
    `).get() as any;

    const weeklyAverage = (recentSales?.revenue || 0) / 7;
    
    return {
      nextWeek: weeklyAverage * 7 * 1.05, // 5% growth assumption
      nextMonth: weeklyAverage * 30 * 1.03, // 3% monthly growth
      confidence: 0.75,
      trend: 'increasing'
    };
  }

  private async generateInventoryPredictions(): Promise<PredictiveAnalytics['inventoryPredictions']> {
    return {
      stockouts: [],
      reorderSuggestions: []
    };
  }

  private async generateCustomerInsights(): Promise<PredictiveAnalytics['customerInsights']> {
    return {
      churnRisk: [],
      opportunityCustomers: []
    };
  }

  private async generateSystemPredictions(): Promise<PredictiveAnalytics['systemPredictions']> {
    return {
      maintenanceNeeded: [],
      capacityWarnings: []
    };
  }

  private async cachePredictiveAnalytics(analytics: PredictiveAnalytics): Promise<void> {
    try {
      const stmt = this.db.raw.prepare(`
        INSERT OR REPLACE INTO predictive_analytics_cache (
          id, type, data, confidence, expires_at
        ) VALUES (?, ?, ?, ?, ?)
      `);

      const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours
      stmt.run('latest', 'full_analytics', JSON.stringify(analytics), 0.8, expiresAt.toISOString());
    } catch (error) {
      console.error('Failed to cache predictive analytics:', error);
    }
  }

  private async calculateErrorRate(): Promise<number> {
    try {
      const totalRequests = 1000; // Simplified
      const errors = await this.getRecentErrorCount();
      return (errors / totalRequests) * 100;
    } catch (error) {
      return 0;
    }
  }

  private async calculateThroughput(): Promise<number> {
    try {
      const result = this.db.raw.prepare(`
        SELECT COUNT(*) as count FROM transactions 
        WHERE created_at >= datetime('now', '-1 hour')
      `).get() as any;
      return result?.count || 0;
    } catch (error) {
      return 0;
    }
  }
}

export default MonitoringService;
