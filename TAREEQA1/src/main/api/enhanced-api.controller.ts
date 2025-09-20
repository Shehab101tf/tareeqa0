// Enhanced API Controller - Main API interface for Phase 2 features
// Integrates all enhanced services and provides unified IPC endpoints

import { ipcMain } from 'electron';
import { EnhancedDatabaseManager } from '../database/EnhancedDatabaseManager';
import { Phase2Migration } from '../database/migrations/phase2-migration';
import { EnhancedInventoryService } from '../services/enhanced-inventory.service';
import { EnhancedCustomerService } from '../services/enhanced-customer.service';
import { EnhancedReportingService } from '../services/enhanced-reporting.service';
import { MultiLocationService } from '../services/multi-location.service';
import { EnhancedUserService } from '../services/enhanced-user.service';
import DocumentationService from '../services/documentation.service';
import SupportService from '../services/support.service';
import TrainingService from '../services/training.service';
import MonitoringService from '../services/monitoring.service';
import MaintenanceService from '../services/maintenance.service';
import MarketLaunchService from '../services/market-launch.service';
import { ApiResponse } from '../../shared/types/enhanced';

export class EnhancedApiController {
  private db: EnhancedDatabaseManager;
  private inventoryService: EnhancedInventoryService;
  private customerService: EnhancedCustomerService;
  private reportingService: EnhancedReportingService;
  private locationService: MultiLocationService;
  private userService: EnhancedUserService;
  private documentationService: DocumentationService;
  private supportService: SupportService;
  private trainingService: TrainingService;
  private monitoringService: MonitoringService;
  private maintenanceService: MaintenanceService;
  private marketLaunchService: MarketLaunchService;
  
  private isInitialized = false;

  constructor(dbPath?: string) {
    this.db = new EnhancedDatabaseManager(dbPath);
    this.inventoryService = new EnhancedInventoryService(this.db);
    this.customerService = new EnhancedCustomerService(this.db);
    this.reportingService = new EnhancedReportingService(this.db);
    this.locationService = new MultiLocationService(this.db);
    this.userService = new EnhancedUserService(this.db);
    this.documentationService = new DocumentationService(this.db);
    this.supportService = new SupportService(this.db);
    this.trainingService = new TrainingService(this.db);
    this.monitoringService = new MonitoringService(this.db);
    this.maintenanceService = new MaintenanceService(this.db);
    this.marketLaunchService = new MarketLaunchService(this.db);
  }

  /**
   * Initialize the enhanced API controller
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Run Phase 2 migration if needed
      const migration = new Phase2Migration(this.db.raw.name);
      const migrationResult = await migration.migrate();
      
      if (!migrationResult.success) {
        console.error('Phase 2 migration failed:', migrationResult.message);
        throw new Error(migrationResult.message);
      }

      console.log('✅ Phase 2 migration completed successfully');

      // Register all IPC handlers
      this.registerInventoryHandlers();
      this.registerCustomerHandlers();
      this.registerReportingHandlers();
      this.registerLocationHandlers();
      this.registerUserHandlers();
      this.registerSystemHandlers();
      this.registerDocumentationHandlers();
      this.registerSupportHandlers();
      this.registerTrainingHandlers();
      this.registerMonitoringHandlers();
      this.registerMaintenanceHandlers();
      this.registerMarketLaunchHandlers();

      this.isInitialized = true;
      console.log('✅ Enhanced API Controller initialized');

    } catch (error) {
      console.error('❌ Failed to initialize Enhanced API Controller:', error);
      throw error;
    }
  }

  // ==================== INVENTORY HANDLERS ====================

  private registerInventoryHandlers(): void {
    // Product Variants
    ipcMain.handle('enhanced:create-product-variant', async (_, variant) => {
      return await this.inventoryService.createProductVariant(variant);
    });

    ipcMain.handle('enhanced:get-product-variants', async (_, productId) => {
      return await this.inventoryService.getProductVariants(productId);
    });

    // Pricing Tiers
    ipcMain.handle('enhanced:create-pricing-tier', async (_, tier) => {
      return await this.inventoryService.createPricingTier(tier);
    });

    ipcMain.handle('enhanced:get-pricing-tiers', async () => {
      return await this.inventoryService.getPricingTiers();
    });

    ipcMain.handle('enhanced:set-product-pricing', async (_, { productId, variantId, tierId, price }) => {
      return await this.inventoryService.setProductPricing(productId, variantId, tierId, price);
    });

    // Suppliers
    ipcMain.handle('enhanced:create-supplier', async (_, supplier) => {
      return await this.inventoryService.createSupplier(supplier);
    });

    ipcMain.handle('enhanced:get-suppliers', async (_, params) => {
      return await this.inventoryService.getSuppliers(params);
    });

    // Purchase Orders
    ipcMain.handle('enhanced:create-purchase-order', async (_, order) => {
      return await this.inventoryService.createPurchaseOrder(order);
    });

    ipcMain.handle('enhanced:add-purchase-order-items', async (_, { orderId, items }) => {
      return await this.inventoryService.addPurchaseOrderItems(orderId, items);
    });

    // Stock Movements
    ipcMain.handle('enhanced:log-stock-movement', async (_, movement) => {
      return await this.inventoryService.logStockMovement(movement);
    });

    ipcMain.handle('enhanced:get-stock-movements', async (_, params) => {
      return await this.inventoryService.getStockMovements(params);
    });

    // Analytics
    ipcMain.handle('enhanced:get-inventory-analytics', async () => {
      return await this.inventoryService.getInventoryAnalytics();
    });

    console.log('✅ Inventory handlers registered');
  }

  // ==================== CUSTOMER HANDLERS ====================

  private registerCustomerHandlers(): void {
    // Customer Management
    ipcMain.handle('enhanced:create-customer', async (_, customer) => {
      return await this.customerService.createCustomer(customer);
    });

    ipcMain.handle('enhanced:update-customer', async (_, { id, updates }) => {
      return await this.customerService.updateCustomer(id, updates);
    });

    ipcMain.handle('enhanced:get-customer-by-id', async (_, id) => {
      return await this.customerService.getCustomerById(id);
    });

    ipcMain.handle('enhanced:search-customers', async (_, params) => {
      return await this.customerService.searchCustomers(params);
    });

    // Customer Analytics
    ipcMain.handle('enhanced:get-customer-analytics', async (_, customerId) => {
      return await this.customerService.getCustomerAnalytics(customerId);
    });

    ipcMain.handle('enhanced:get-customer-purchase-history', async (_, { customerId, params }) => {
      return await this.customerService.getCustomerPurchaseHistory(customerId, params);
    });

    // Loyalty Program
    ipcMain.handle('enhanced:add-loyalty-points', async (_, { customerId, points, reason }) => {
      return await this.customerService.addLoyaltyPoints(customerId, points, reason);
    });

    ipcMain.handle('enhanced:redeem-loyalty-points', async (_, { customerId, points }) => {
      return await this.customerService.redeemLoyaltyPoints(customerId, points);
    });

    console.log('✅ Customer handlers registered');
  }

  // ==================== REPORTING HANDLERS ====================

  private registerReportingHandlers(): void {
    // Sales Reports
    ipcMain.handle('enhanced:get-daily-sales-report', async (_, filters) => {
      return await this.reportingService.getDailySalesReport(filters);
    });

    ipcMain.handle('enhanced:get-product-performance-report', async (_, filters) => {
      return await this.reportingService.getProductPerformanceReport(filters);
    });

    ipcMain.handle('enhanced:get-customer-analysis-report', async (_, filters) => {
      return await this.reportingService.getCustomerAnalysisReport(filters);
    });

    ipcMain.handle('enhanced:get-inventory-status-report', async () => {
      return await this.reportingService.getInventoryStatusReport();
    });

    ipcMain.handle('enhanced:get-financial-summary-report', async (_, filters) => {
      return await this.reportingService.getFinancialSummaryReport(filters);
    });

    // Dashboard
    ipcMain.handle('enhanced:get-dashboard-metrics', async () => {
      return await this.reportingService.getDashboardMetrics();
    });

    // Forecasting
    ipcMain.handle('enhanced:get-sales-forecast', async (_, days) => {
      return await this.reportingService.getSalesForecast(days);
    });

    // Report Definitions
    ipcMain.handle('enhanced:get-report-definitions', async () => {
      return {
        success: true,
        data: this.reportingService.getReportDefinitions()
      };
    });

    console.log('✅ Reporting handlers registered');
  }

  // ==================== LOCATION HANDLERS ====================

  private registerLocationHandlers(): void {
    // Location Management
    ipcMain.handle('enhanced:create-location', async (_, location) => {
      return await this.locationService.createLocation(location);
    });

    ipcMain.handle('enhanced:update-location', async (_, { id, updates }) => {
      return await this.locationService.updateLocation(id, updates);
    });

    ipcMain.handle('enhanced:get-locations', async (_, includeInactive) => {
      return await this.locationService.getLocations(includeInactive);
    });

    ipcMain.handle('enhanced:get-location-by-id', async (_, id) => {
      return await this.locationService.getLocationById(id);
    });

    // Stock Management
    ipcMain.handle('enhanced:get-location-stock', async (_, { locationId, params }) => {
      return await this.locationService.getLocationStock(locationId, params);
    });

    ipcMain.handle('enhanced:update-location-stock', async (_, { locationId, productId, variantId, quantity, userId }) => {
      return await this.locationService.updateLocationStock(locationId, productId, variantId, quantity, userId);
    });

    // Stock Transfers
    ipcMain.handle('enhanced:create-stock-transfer', async (_, transfer) => {
      return await this.locationService.createStockTransfer(transfer);
    });

    ipcMain.handle('enhanced:approve-stock-transfer', async (_, { transferId, approvedBy, approvedItems }) => {
      return await this.locationService.approveStockTransfer(transferId, approvedBy, approvedItems);
    });

    ipcMain.handle('enhanced:receive-stock-transfer', async (_, { transferId, receivedBy, receivedItems }) => {
      return await this.locationService.receiveStockTransfer(transferId, receivedBy, receivedItems);
    });

    ipcMain.handle('enhanced:get-stock-transfers', async (_, params) => {
      return await this.locationService.getStockTransfers(params);
    });

    console.log('✅ Location handlers registered');
  }

  // ==================== USER HANDLERS ====================

  private registerUserHandlers(): void {
    // User Management
    ipcMain.handle('enhanced:create-user', async (_, user) => {
      return await this.userService.createUser(user);
    });

    ipcMain.handle('enhanced:update-user', async (_, { id, updates }) => {
      return await this.userService.updateUser(id, updates);
    });

    ipcMain.handle('enhanced:get-user-by-id', async (_, id) => {
      return await this.userService.getUserById(id);
    });

    ipcMain.handle('enhanced:search-users', async (_, params) => {
      return await this.userService.searchUsers(params);
    });

    // User Roles
    ipcMain.handle('enhanced:create-user-role', async (_, role) => {
      return await this.userService.createUserRole(role);
    });

    ipcMain.handle('enhanced:get-user-roles', async (_, includeInactive) => {
      return await this.userService.getUserRoles(includeInactive);
    });

    ipcMain.handle('enhanced:check-user-permission', async (_, { userId, permission }) => {
      return await this.userService.checkUserPermission(userId, permission);
    });

    // User Performance
    ipcMain.handle('enhanced:get-user-performance', async (_, { userId, period }) => {
      return await this.userService.getUserPerformance(userId, period);
    });

    ipcMain.handle('enhanced:get-team-performance', async (_, { locationId, period }) => {
      return await this.userService.getTeamPerformance(locationId, period);
    });

    // Authentication
    ipcMain.handle('enhanced:authenticate-user', async (_, { username, password }) => {
      return await this.userService.authenticateUser(username, password);
    });

    console.log('✅ User handlers registered');
  }

  // ==================== SYSTEM HANDLERS ====================

  private registerSystemHandlers(): void {
    // System Information
    ipcMain.handle('enhanced:get-system-info', async () => {
      return {
        success: true,
        data: {
          version: '2.0.0',
          phase: 'Phase 2 - Advanced Features',
          databaseVersion: 2,
          features: [
            'Advanced Inventory Management',
            'Enhanced Customer Management',
            'Comprehensive Reporting System',
            'Multi-Location Support',
            'Advanced User Management',
            'Real-time Analytics',
            'Sales Forecasting'
          ],
          isInitialized: this.isInitialized
        }
      };
    });

    // Health Check
    ipcMain.handle('enhanced:health-check', async () => {
      try {
        // Test database connection
        const testQuery = this.db.raw.prepare('SELECT 1 as test').get();
        
        return {
          success: true,
          data: {
            database: testQuery ? 'connected' : 'disconnected',
            services: {
              inventory: 'active',
              customer: 'active',
              reporting: 'active',
              location: 'active',
              user: 'active'
            },
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        return {
          success: false,
          message: 'Health check failed',
          errors: [error instanceof Error ? error.message : String(error)]
        };
      }
    });

    // Database Statistics
    ipcMain.handle('enhanced:get-database-stats', async () => {
      try {
        const stats = {
          products: this.db.raw.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get(),
          productVariants: this.db.raw.prepare('SELECT COUNT(*) as count FROM product_variants WHERE is_active = 1').get(),
          customers: this.db.raw.prepare('SELECT COUNT(*) as count FROM customers_enhanced WHERE is_active = 1').get(),
          users: this.db.raw.prepare('SELECT COUNT(*) as count FROM users_enhanced WHERE is_active = 1').get(),
          locations: this.db.raw.prepare('SELECT COUNT(*) as count FROM locations WHERE is_active = 1').get(),
          suppliers: this.db.raw.prepare('SELECT COUNT(*) as count FROM suppliers WHERE is_active = 1').get(),
          transactions: this.db.raw.prepare('SELECT COUNT(*) as count FROM transactions').get(),
          stockMovements: this.db.raw.prepare('SELECT COUNT(*) as count FROM stock_movements').get()
        };

        return {
          success: true,
          data: stats
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to get database statistics',
          errors: [error instanceof Error ? error.message : String(error)]
        };
      }
    });

    console.log('✅ System handlers registered');
  }

  // ==================== DOCUMENTATION HANDLERS ====================
  private registerDocumentationHandlers(): void {
    ipcMain.handle('docs:create-item', async (_, item) => {
      return await this.documentationService.createDocumentationItem(item);
    });
    ipcMain.handle('docs:search', async (_, { query, category, language }) => {
      return await this.documentationService.searchDocumentation(query, category, language);
    });
    ipcMain.handle('docs:contextual-help', async (_, context) => {
      return await this.documentationService.getContextualHelp(context);
    });
    ipcMain.handle('docs:create-video', async (_, tutorial) => {
      return await this.documentationService.createVideoTutorial(tutorial);
    });
    ipcMain.handle('docs:list-videos', async (_, { category, difficulty }) => {
      return await this.documentationService.getVideoTutorials(category, difficulty);
    });
    ipcMain.handle('docs:track-video-view', async (_, { videoId, userId }) => {
      return await this.documentationService.trackVideoView(videoId, userId);
    });
    ipcMain.handle('docs:create-guide', async (_, guide) => {
      return await this.documentationService.createInteractiveGuide(guide);
    });
    ipcMain.handle('docs:list-guides', async (_, category) => {
      return await this.documentationService.getInteractiveGuides(category);
    });
    ipcMain.handle('docs:help-analytics', async (_, { dateFrom, dateTo }) => {
      return await this.documentationService.getHelpAnalytics(dateFrom, dateTo);
    });
    ipcMain.handle('docs:init-default', async () => {
      await this.documentationService.initializeDefaultContent();
      return { success: true } as ApiResponse<void>;
    });
    console.log('✅ Documentation handlers registered');
  }

  // ==================== SUPPORT HANDLERS ====================
  private registerSupportHandlers(): void {
    ipcMain.handle('support:create-ticket', async (_, ticket) => {
      return await this.supportService.createSupportTicket(ticket);
    });
    ipcMain.handle('support:update-ticket-status', async (_, { ticketId, status, assignedTo }) => {
      return await this.supportService.updateTicketStatus(ticketId, status, assignedTo);
    });
    ipcMain.handle('support:smart-assistance', async (_, { query, userId }) => {
      return await this.supportService.getSmartAssistance(query, userId);
    });
    ipcMain.handle('support:collect-system-info', async () => {
      return { success: true, data: await this.supportService.collectSystemInfo() } as ApiResponse<any>;
    });
    ipcMain.handle('support:run-diagnostics', async () => {
      return { success: true, data: await this.supportService.runDiagnostics() } as ApiResponse<any>;
    });
    ipcMain.handle('support:log-event', async (_, { level, message, context, stack }) => {
      await this.supportService.logEvent(level, message, context, stack);
      return { success: true } as ApiResponse<void>;
    });
    ipcMain.handle('support:record-metrics', async () => {
      await this.supportService.recordPerformanceMetrics();
      return { success: true } as ApiResponse<void>;
    });
    console.log('✅ Support handlers registered');
  }

  // ==================== TRAINING HANDLERS ====================
  private registerTrainingHandlers(): void {
    ipcMain.handle('training:create-module', async (_, module) => {
      return await this.trainingService.createTrainingModule(module);
    });
    ipcMain.handle('training:list-modules-for-role', async (_, role) => {
      return await this.trainingService.getTrainingModulesForRole(role);
    });
    ipcMain.handle('training:start-module', async (_, { userId, moduleId }) => {
      return await this.trainingService.startTrainingModule(userId, moduleId);
    });
    ipcMain.handle('training:complete-lesson', async (_, { userId, moduleId, lessonId, timeSpent }) => {
      return await this.trainingService.completeLesson(userId, moduleId, lessonId, timeSpent);
    });
    ipcMain.handle('training:submit-assessment', async (_, { userId, assessmentId, answers, timeSpent }) => {
      return await this.trainingService.submitAssessment(userId, assessmentId, answers, timeSpent);
    });
    ipcMain.handle('training:generate-certificate', async (_, { userId, moduleId, score }) => {
      return await this.trainingService.generateCertificate(userId, moduleId, score);
    });
    console.log('✅ Training handlers registered');
  }

  // ==================== MONITORING HANDLERS ====================
  private registerMonitoringHandlers(): void {
    ipcMain.handle('monitoring:start', async (_, intervalMinutes) => {
      this.monitoringService.startMonitoring(intervalMinutes);
      return { success: true } as ApiResponse<void>;
    });
    ipcMain.handle('monitoring:stop', async () => {
      this.monitoringService.stopMonitoring();
      return { success: true } as ApiResponse<void>;
    });
    ipcMain.handle('monitoring:get-system-health', async () => {
      return await this.monitoringService.getSystemHealth();
    });
    ipcMain.handle('monitoring:get-business-metrics', async (_, period) => {
      return await this.monitoringService.getBusinessMetrics(period);
    });
    ipcMain.handle('monitoring:generate-predictive-analytics', async () => {
      return await this.monitoringService.generatePredictiveAnalytics();
    });
    console.log('✅ Monitoring handlers registered');
  }

  // ==================== MAINTENANCE HANDLERS ====================
  private registerMaintenanceHandlers(): void {
    ipcMain.handle('maintenance:create-backup', async (_, { type, encrypt }) => {
      return await this.maintenanceService.createBackup(type, encrypt);
    });
    ipcMain.handle('maintenance:verify-backup', async (_, backupId) => {
      return await this.maintenanceService.verifyBackup(backupId);
    });
    ipcMain.handle('maintenance:restore-backup', async (_, backupId) => {
      return await this.maintenanceService.restoreFromBackup(backupId);
    });
    ipcMain.handle('maintenance:optimize-db', async () => {
      return await this.maintenanceService.optimizeDatabase();
    });
    ipcMain.handle('maintenance:analyze-storage', async () => {
      return await this.maintenanceService.analyzeStorage();
    });
    ipcMain.handle('maintenance:cleanup-storage', async (_, targets) => {
      return await this.maintenanceService.cleanupStorage(targets);
    });
    ipcMain.handle('maintenance:schedule-default', async () => {
      await this.maintenanceService.scheduleMaintenanceTasks();
      return { success: true } as ApiResponse<void>;
    });
    console.log('✅ Maintenance handlers registered');
  }

  // ==================== MARKET LAUNCH HANDLERS ====================
  private registerMarketLaunchHandlers(): void {
    ipcMain.handle('launch:invite-beta-customer', async (_, customer) => {
      return await this.marketLaunchService.inviteBetaCustomer(customer);
    });
    ipcMain.handle('launch:accept-invitation', async (_, { licenseKey }) => {
      return await this.marketLaunchService.acceptBetaInvitation(licenseKey);
    });
    ipcMain.handle('launch:submit-feedback', async (_, feedback) => {
      return await this.marketLaunchService.submitBetaFeedback(feedback);
    });
    ipcMain.handle('launch:create-deployment-plan', async (_, plan) => {
      return await this.marketLaunchService.createDeploymentPlan(plan);
    });
    ipcMain.handle('launch:execute-deployment', async (_, { planId }) => {
      return await this.marketLaunchService.executeDeployment(planId);
    });
    ipcMain.handle('launch:get-metrics', async () => {
      return await this.marketLaunchService.getLaunchMetrics();
    });
    ipcMain.handle('launch:readiness-report', async () => {
      return await this.marketLaunchService.generateLaunchReadinessReport();
    });
    console.log('✅ Market launch handlers registered');
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    try {
      // Remove all IPC handlers
      const handlers = [
        // Inventory
        'enhanced:create-product-variant', 'enhanced:get-product-variants',
        'enhanced:create-pricing-tier', 'enhanced:get-pricing-tiers', 'enhanced:set-product-pricing',
        'enhanced:create-supplier', 'enhanced:get-suppliers',
        'enhanced:create-purchase-order', 'enhanced:add-purchase-order-items',
        'enhanced:log-stock-movement', 'enhanced:get-stock-movements',
        'enhanced:get-inventory-analytics',
        
        // Customer
        'enhanced:create-customer', 'enhanced:update-customer', 'enhanced:get-customer-by-id', 'enhanced:search-customers',
        'enhanced:get-customer-analytics', 'enhanced:get-customer-purchase-history',
        'enhanced:add-loyalty-points', 'enhanced:redeem-loyalty-points',
        
        // Reporting
        'enhanced:get-daily-sales-report', 'enhanced:get-product-performance-report',
        'enhanced:get-customer-analysis-report', 'enhanced:get-inventory-status-report',
        'enhanced:get-financial-summary-report', 'enhanced:get-dashboard-metrics',
        'enhanced:get-sales-forecast', 'enhanced:get-report-definitions',
        
        // Location
        'enhanced:create-location', 'enhanced:update-location', 'enhanced:get-locations', 'enhanced:get-location-by-id',
        'enhanced:get-location-stock', 'enhanced:update-location-stock',
        'enhanced:create-stock-transfer', 'enhanced:approve-stock-transfer', 'enhanced:receive-stock-transfer', 'enhanced:get-stock-transfers',
        
        // User
        'enhanced:create-user', 'enhanced:update-user', 'enhanced:get-user-by-id', 'enhanced:search-users',
        'enhanced:create-user-role', 'enhanced:get-user-roles', 'enhanced:check-user-permission',
        'enhanced:get-user-performance', 'enhanced:get-team-performance', 'enhanced:authenticate-user',
        
        // System
        'enhanced:get-system-info', 'enhanced:health-check', 'enhanced:get-database-stats',

        // Documentation
        'docs:create-item', 'docs:search', 'docs:contextual-help', 'docs:create-video', 'docs:list-videos', 'docs:track-video-view', 'docs:create-guide', 'docs:list-guides', 'docs:help-analytics', 'docs:init-default',

        // Support
        'support:create-ticket', 'support:update-ticket-status', 'support:smart-assistance', 'support:collect-system-info', 'support:run-diagnostics', 'support:log-event', 'support:record-metrics',

        // Training
        'training:create-module', 'training:list-modules-for-role', 'training:start-module', 'training:complete-lesson', 'training:submit-assessment', 'training:generate-certificate',

        // Monitoring
        'monitoring:start', 'monitoring:stop', 'monitoring:get-system-health', 'monitoring:get-business-metrics', 'monitoring:generate-predictive-analytics',

        // Maintenance
        'maintenance:create-backup', 'maintenance:verify-backup', 'maintenance:restore-backup', 'maintenance:optimize-db', 'maintenance:analyze-storage', 'maintenance:cleanup-storage', 'maintenance:schedule-default',

        // Market Launch
        'launch:invite-beta-customer', 'launch:accept-invitation', 'launch:submit-feedback', 'launch:create-deployment-plan', 'launch:execute-deployment', 'launch:get-metrics', 'launch:readiness-report'
      ];

      handlers.forEach(handler => {
        ipcMain.removeAllListeners(handler);
      });

      // Close database connection
      if (this.db) {
        this.db.close();
      }

      console.log('✅ Enhanced API Controller cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  /**
   * Get database instance (for testing or direct access)
   */
  getDatabase(): EnhancedDatabaseManager {
    return this.db;
  }

  /**
   * Check if controller is initialized
   */
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

export default EnhancedApiController;
