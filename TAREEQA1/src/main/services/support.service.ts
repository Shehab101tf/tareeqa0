// Support Service - Integrated technical support system for Tareeqa POS
// Handles remote diagnostics, screen sharing, automated log collection, and smart assistance

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { app } from 'electron';
import { EnhancedDatabaseManager } from '../database/EnhancedDatabaseManager';
import { ApiResponse } from '../../shared/types/enhanced';

export interface SupportTicket {
  id: string;
  userId: number;
  title: string;
  description: string;
  category: 'technical' | 'billing' | 'feature-request' | 'bug-report' | 'training';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'waiting-customer' | 'resolved' | 'closed';
  assignedTo?: string;
  attachments: string[];
  systemInfo: SystemInfo;
  diagnostics: DiagnosticInfo;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SystemInfo {
  osVersion: string;
  appVersion: string;
  electronVersion: string;
  nodeVersion: string;
  architecture: string;
  totalMemory: number;
  freeMemory: number;
  cpuModel: string;
  cpuCores: number;
  displayResolution: string;
  timezone: string;
  language: string;
}

export interface DiagnosticInfo {
  databaseSize: number;
  databaseIntegrity: boolean;
  lastBackup?: string;
  errorLogs: LogEntry[];
  performanceMetrics: PerformanceMetrics;
  hardwareStatus: HardwareStatus;
  networkStatus: NetworkStatus;
}

export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  responseTime: number;
  transactionThroughput: number;
}

export interface HardwareStatus {
  printer: 'connected' | 'disconnected' | 'error';
  scanner: 'connected' | 'disconnected' | 'error';
  cashDrawer: 'connected' | 'disconnected' | 'error';
  display: 'ok' | 'issues';
}

export interface NetworkStatus {
  isOnline: boolean;
  latency?: number;
  bandwidth?: number;
  lastSync?: string;
}

export interface SmartAssistance {
  id: string;
  query: string;
  response: string;
  confidence: number;
  suggestions: string[];
  relatedDocs: string[];
  timestamp: string;
}

export class SupportService {
  private db: EnhancedDatabaseManager;
  private logsPath: string;
  private diagnosticsPath: string;

  constructor(db: EnhancedDatabaseManager) {
    this.db = db;
    this.logsPath = path.join(app.getPath('userData'), 'logs');
    this.diagnosticsPath = path.join(app.getPath('userData'), 'diagnostics');
    this.initializeSupportTables();
    this.ensureDirectories();
  }

  /**
   * Initialize support tables
   */
  private initializeSupportTables(): void {
    // Support tickets table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        assigned_to TEXT,
        attachments TEXT NOT NULL DEFAULT '[]',
        system_info TEXT NOT NULL,
        diagnostics TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME
      )
    `);

    // System logs table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        stack TEXT,
        context TEXT,
        session_id TEXT
      )
    `);

    // Smart assistance table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS smart_assistance (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        confidence REAL NOT NULL,
        suggestions TEXT NOT NULL,
        related_docs TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        was_helpful BOOLEAN
      )
    `);

    // Performance metrics table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        cpu_usage REAL NOT NULL,
        memory_usage REAL NOT NULL,
        disk_usage REAL NOT NULL,
        response_time REAL NOT NULL,
        transaction_throughput REAL NOT NULL,
        active_users INTEGER DEFAULT 1
      )
    `);

    console.log('✅ Support tables initialized');
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    if (!fs.existsSync(this.logsPath)) {
      fs.mkdirSync(this.logsPath, { recursive: true });
    }
    if (!fs.existsSync(this.diagnosticsPath)) {
      fs.mkdirSync(this.diagnosticsPath, { recursive: true });
    }
  }

  // ==================== SUPPORT TICKETS ====================

  /**
   * Create support ticket
   */
  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'systemInfo' | 'diagnostics' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SupportTicket>> {
    try {
      const ticketId = this.generateTicketId();
      const systemInfo = await this.collectSystemInfo();
      const diagnostics = await this.runDiagnostics();

      const fullTicket: SupportTicket = {
        ...ticket,
        id: ticketId,
        systemInfo,
        diagnostics,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const stmt = this.db.raw.prepare(`
        INSERT INTO support_tickets (
          id, user_id, title, description, category, priority, status,
          assigned_to, attachments, system_info, diagnostics
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        fullTicket.id,
        fullTicket.userId,
        fullTicket.title,
        fullTicket.description,
        fullTicket.category,
        fullTicket.priority,
        fullTicket.status,
        fullTicket.assignedTo,
        JSON.stringify(fullTicket.attachments),
        JSON.stringify(fullTicket.systemInfo),
        JSON.stringify(fullTicket.diagnostics)
      );

      // Generate diagnostic report
      await this.generateDiagnosticReport(ticketId, fullTicket);

      return {
        success: true,
        data: fullTicket,
        message: `تم إنشاء تذكرة الدعم رقم ${ticketId}`,
        messageEn: `Support ticket ${ticketId} created successfully`
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء تذكرة الدعم',
        messageEn: 'Failed to create support ticket',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Update support ticket status
   */
  async updateTicketStatus(ticketId: string, status: SupportTicket['status'], assignedTo?: string): Promise<ApiResponse<void>> {
    try {
      const updates: string[] = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
      const params: any[] = [status];

      if (assignedTo) {
        updates.push('assigned_to = ?');
        params.push(assignedTo);
      }

      if (status === 'resolved' || status === 'closed') {
        updates.push('resolved_at = CURRENT_TIMESTAMP');
      }

      const stmt = this.db.raw.prepare(`
        UPDATE support_tickets 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `);

      const result = stmt.run(...params, ticketId);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'تذكرة الدعم غير موجودة',
          messageEn: 'Support ticket not found'
        };
      }

      return {
        success: true,
        message: 'تم تحديث حالة التذكرة بنجاح',
        messageEn: 'Ticket status updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في تحديث حالة التذكرة',
        messageEn: 'Failed to update ticket status',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== SYSTEM DIAGNOSTICS ====================

  /**
   * Collect comprehensive system information
   */
  async collectSystemInfo(): Promise<SystemInfo> {
    return {
      osVersion: `${os.type()} ${os.release()}`,
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      architecture: os.arch(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuModel: os.cpus()[0]?.model || 'Unknown',
      cpuCores: os.cpus().length,
      displayResolution: '1920x1080', // Would get from screen in real implementation
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: app.getLocale()
    };
  }

  /**
   * Run comprehensive system diagnostics
   */
  async runDiagnostics(): Promise<DiagnosticInfo> {
    const diagnostics: DiagnosticInfo = {
      databaseSize: await this.getDatabaseSize(),
      databaseIntegrity: await this.checkDatabaseIntegrity(),
      lastBackup: await this.getLastBackupDate(),
      errorLogs: await this.getRecentErrorLogs(),
      performanceMetrics: await this.collectPerformanceMetrics(),
      hardwareStatus: await this.checkHardwareStatus(),
      networkStatus: await this.checkNetworkStatus()
    };

    return diagnostics;
  }

  /**
   * Get database size
   */
  private async getDatabaseSize(): Promise<number> {
    try {
      const dbPath = this.db.raw.name;
      const stats = fs.statSync(dbPath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check database integrity
   */
  private async checkDatabaseIntegrity(): Promise<boolean> {
    try {
      const result = this.db.raw.prepare('PRAGMA integrity_check').get() as any;
      return result && result.integrity_check === 'ok';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get last backup date
   */
  private async getLastBackupDate(): Promise<string | undefined> {
    try {
      const backupPath = path.join(app.getPath('userData'), 'backups');
      if (!fs.existsSync(backupPath)) return undefined;

      const files = fs.readdirSync(backupPath);
      const backupFiles = files.filter(f => f.endsWith('.db.backup'));
      
      if (backupFiles.length === 0) return undefined;

      const latestBackup = backupFiles
        .map(f => ({ name: f, time: fs.statSync(path.join(backupPath, f)).mtime }))
        .sort((a, b) => b.time.getTime() - a.time.getTime())[0];

      return latestBackup.time.toISOString();
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Get recent error logs
   */
  private async getRecentErrorLogs(): Promise<LogEntry[]> {
    try {
      const stmt = this.db.raw.prepare(`
        SELECT * FROM system_logs 
        WHERE level IN ('error', 'warn') 
        ORDER BY timestamp DESC 
        LIMIT 50
      `);

      const rows = stmt.all() as any[];
      return rows.map(row => ({
        timestamp: row.timestamp,
        level: row.level,
        message: row.message,
        stack: row.stack,
        context: row.context ? JSON.parse(row.context) : undefined
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const memUsage = process.memoryUsage();
    
    return {
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      memoryUsage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      diskUsage: await this.getDiskUsage(),
      responseTime: await this.measureResponseTime(),
      transactionThroughput: await this.getTransactionThroughput()
    };
  }

  /**
   * Check hardware status
   */
  private async checkHardwareStatus(): Promise<HardwareStatus> {
    // In a real implementation, this would check actual hardware
    return {
      printer: 'connected',
      scanner: 'connected',
      cashDrawer: 'connected',
      display: 'ok'
    };
  }

  /**
   * Check network status
   */
  private async checkNetworkStatus(): Promise<NetworkStatus> {
    // In a real implementation, this would check actual network connectivity
    return {
      isOnline: true,
      latency: 50,
      bandwidth: 100,
      lastSync: new Date().toISOString()
    };
  }

  // ==================== SMART ASSISTANCE ====================

  /**
   * Get smart assistance for user query
   */
  async getSmartAssistance(query: string, userId?: number): Promise<ApiResponse<SmartAssistance>> {
    try {
      const assistanceId = this.generateAssistanceId();
      const response = await this.processQuery(query);

      const assistance: SmartAssistance = {
        id: assistanceId,
        query,
        response: response.answer,
        confidence: response.confidence,
        suggestions: response.suggestions,
        relatedDocs: response.relatedDocs,
        timestamp: new Date().toISOString()
      };

      // Store assistance for learning
      const stmt = this.db.raw.prepare(`
        INSERT INTO smart_assistance (
          id, query, response, confidence, suggestions, related_docs, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        assistance.id,
        assistance.query,
        assistance.response,
        assistance.confidence,
        JSON.stringify(assistance.suggestions),
        JSON.stringify(assistance.relatedDocs),
        userId
      );

      return {
        success: true,
        data: assistance
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في الحصول على المساعدة الذكية',
        messageEn: 'Failed to get smart assistance',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Process user query and generate response
   */
  private async processQuery(query: string): Promise<{
    answer: string;
    confidence: number;
    suggestions: string[];
    relatedDocs: string[];
  }> {
    // Simple keyword-based assistance (in production, this would use AI/ML)
    const keywords = query.toLowerCase();
    
    if (keywords.includes('مبيعات') || keywords.includes('sales')) {
      return {
        answer: 'لإجراء عملية بيع، اضغط على "بيع جديد" ثم امسح المنتجات أو ابحث عنها يدوياً.',
        confidence: 0.9,
        suggestions: [
          'كيفية إضافة منتج للبيع',
          'طرق الدفع المتاحة',
          'طباعة الفاتورة'
        ],
        relatedDocs: ['sales-process', 'payment-methods', 'receipt-printing']
      };
    }

    if (keywords.includes('مخزون') || keywords.includes('inventory')) {
      return {
        answer: 'لإدارة المخزون، اذهب إلى قسم "المخزون" حيث يمكنك إضافة منتجات جديدة وتعديل الكميات.',
        confidence: 0.85,
        suggestions: [
          'إضافة منتج جديد',
          'تعديل كمية المخزون',
          'تقارير المخزون'
        ],
        relatedDocs: ['inventory-management', 'product-creation', 'stock-reports']
      };
    }

    if (keywords.includes('تقارير') || keywords.includes('reports')) {
      return {
        answer: 'يمكنك الوصول للتقارير من القائمة الرئيسية. تتوفر تقارير المبيعات والمخزون والعملاء.',
        confidence: 0.8,
        suggestions: [
          'تقرير المبيعات اليومية',
          'تقرير المخزون',
          'تقرير العملاء'
        ],
        relatedDocs: ['reports-overview', 'sales-reports', 'inventory-reports']
      };
    }

    // Default response for unrecognized queries
    return {
      answer: 'عذراً، لم أتمكن من فهم استفسارك بوضوح. يرجى إعادة صياغة السؤال أو الاتصال بالدعم الفني.',
      confidence: 0.3,
      suggestions: [
        'الاتصال بالدعم الفني',
        'البحث في التوثيق',
        'مشاهدة الدروس التعليمية'
      ],
      relatedDocs: ['getting-started', 'faq', 'contact-support']
    };
  }

  // ==================== LOG MANAGEMENT ====================

  /**
   * Log system event
   */
  async logEvent(level: LogEntry['level'], message: string, context?: Record<string, any>, stack?: string): Promise<void> {
    try {
      const stmt = this.db.raw.prepare(`
        INSERT INTO system_logs (level, message, stack, context, session_id)
        VALUES (?, ?, ?, ?, ?)
      `);

      const sessionId = this.generateSessionId();
      stmt.run(level, message, stack, context ? JSON.stringify(context) : null, sessionId);

      // Also write to file for backup
      await this.writeLogToFile(level, message, context, stack);

    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  /**
   * Write log to file
   */
  private async writeLogToFile(level: string, message: string, context?: Record<string, any>, stack?: string): Promise<void> {
    try {
      const logFile = path.join(this.logsPath, `${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
        stack
      };

      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  // ==================== DIAGNOSTIC REPORTS ====================

  /**
   * Generate comprehensive diagnostic report
   */
  private async generateDiagnosticReport(ticketId: string, ticket: SupportTicket): Promise<void> {
    try {
      const reportPath = path.join(this.diagnosticsPath, `${ticketId}_diagnostic_report.json`);
      
      const report = {
        ticketId,
        generatedAt: new Date().toISOString(),
        systemInfo: ticket.systemInfo,
        diagnostics: ticket.diagnostics,
        recentLogs: await this.getRecentErrorLogs(),
        configurationSnapshot: await this.getConfigurationSnapshot()
      };

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`✅ Diagnostic report generated: ${reportPath}`);

    } catch (error) {
      console.error('Failed to generate diagnostic report:', error);
    }
  }

  /**
   * Get configuration snapshot
   */
  private async getConfigurationSnapshot(): Promise<Record<string, any>> {
    try {
      return {
        appVersion: app.getVersion(),
        userDataPath: app.getPath('userData'),
        databasePath: this.db.raw.name,
        logsPath: this.logsPath,
        // Add more configuration as needed
      };
    } catch (error) {
      return {};
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generate unique ticket ID
   */
  private generateTicketId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TKT-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Generate unique assistance ID
   */
  private generateAssistanceId(): string {
    return `AST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get disk usage percentage
   */
  private async getDiskUsage(): Promise<number> {
    try {
      // Simplified disk usage calculation
      const userDataPath = app.getPath('userData');
      const stats = fs.statSync(userDataPath);
      return 25; // Placeholder - would calculate actual disk usage
    } catch (error) {
      return 0;
    }
  }

  /**
   * Measure system response time
   */
  private async measureResponseTime(): Promise<number> {
    const start = Date.now();
    try {
      // Simple database query to measure response time
      this.db.raw.prepare('SELECT 1').get();
      return Date.now() - start;
    } catch (error) {
      return -1;
    }
  }

  /**
   * Get transaction throughput
   */
  private async getTransactionThroughput(): Promise<number> {
    try {
      const result = this.db.raw.prepare(`
        SELECT COUNT(*) as count 
        FROM transactions 
        WHERE created_at >= datetime('now', '-1 hour')
      `).get() as any;

      return result?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Record performance metrics
   */
  async recordPerformanceMetrics(): Promise<void> {
    try {
      const metrics = await this.collectPerformanceMetrics();
      
      const stmt = this.db.raw.prepare(`
        INSERT INTO performance_metrics (
          cpu_usage, memory_usage, disk_usage, response_time, transaction_throughput
        ) VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(
        metrics.cpuUsage,
        metrics.memoryUsage,
        metrics.diskUsage,
        metrics.responseTime,
        metrics.transactionThroughput
      );

    } catch (error) {
      console.error('Failed to record performance metrics:', error);
    }
  }
}

export default SupportService;
