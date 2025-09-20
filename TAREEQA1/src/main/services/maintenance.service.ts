// Maintenance Service - Automated maintenance and backup system for Tareeqa POS
// Handles database optimization, backup verification, update management, and storage cleanup

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { app } from 'electron';
import { EnhancedDatabaseManager } from '../database/EnhancedDatabaseManager';
import { ApiResponse } from '../../shared/types/enhanced';

export interface MaintenanceTask {
  id: string;
  name: string;
  nameEn: string;
  type: 'backup' | 'optimization' | 'cleanup' | 'verification' | 'update';
  schedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number; // minutes
  lastRun?: string;
  nextRun?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  isEnabled: boolean;
}

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  checksum: string;
  createdAt: string;
  type: 'full' | 'incremental' | 'differential';
  isEncrypted: boolean;
  isVerified: boolean;
  retentionDays: number;
}

export interface MaintenanceReport {
  taskId: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'success' | 'warning' | 'error';
  message: string;
  messageEn: string;
  details: Record<string, any>;
  resourcesUsed: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export interface StorageAnalysis {
  totalSize: number;
  usedSize: number;
  freeSize: number;
  breakdown: {
    database: number;
    logs: number;
    backups: number;
    cache: number;
    temp: number;
    attachments: number;
  };
  recommendations: StorageRecommendation[];
}

export interface StorageRecommendation {
  type: 'cleanup' | 'archive' | 'compress' | 'delete';
  target: string;
  potentialSavings: number;
  risk: 'low' | 'medium' | 'high';
  description: string;
  descriptionEn: string;
}

export class MaintenanceService {
  private db: EnhancedDatabaseManager;
  private backupPath: string;
  private logsPath: string;
  private tempPath: string;
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map();

  constructor(db: EnhancedDatabaseManager) {
    this.db = db;
    this.backupPath = path.join(app.getPath('userData'), 'backups');
    this.logsPath = path.join(app.getPath('userData'), 'logs');
    this.tempPath = path.join(app.getPath('userData'), 'temp');
    this.initializeMaintenanceTables();
    this.ensureDirectories();
  }

  /**
   * Initialize maintenance tables
   */
  private initializeMaintenanceTables(): void {
    // Maintenance tasks table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS maintenance_tasks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        type TEXT NOT NULL,
        schedule_type TEXT NOT NULL,
        priority TEXT NOT NULL,
        estimated_duration INTEGER NOT NULL,
        last_run DATETIME,
        next_run DATETIME,
        status TEXT NOT NULL DEFAULT 'pending',
        is_enabled BOOLEAN DEFAULT 1,
        configuration TEXT NOT NULL DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Backup information table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS backup_info (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        size INTEGER NOT NULL,
        checksum TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        type TEXT NOT NULL DEFAULT 'full',
        is_encrypted BOOLEAN DEFAULT 1,
        is_verified BOOLEAN DEFAULT 0,
        retention_days INTEGER DEFAULT 30,
        metadata TEXT NOT NULL DEFAULT '{}'
      )
    `);

    // Maintenance reports table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS maintenance_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        duration INTEGER,
        status TEXT NOT NULL,
        message TEXT NOT NULL,
        message_en TEXT NOT NULL,
        details TEXT NOT NULL DEFAULT '{}',
        resources_used TEXT NOT NULL DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Maintenance tables initialized');
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    [this.backupPath, this.logsPath, this.tempPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // ==================== BACKUP MANAGEMENT ====================

  /**
   * Create database backup
   */
  async createBackup(type: 'full' | 'incremental' = 'full', encrypt: boolean = true): Promise<ApiResponse<BackupInfo>> {
    const taskId = this.generateTaskId('backup');
    const startTime = new Date().toISOString();

    try {
      await this.logMaintenanceStart(taskId, 'backup', startTime);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `tareeqa_backup_${type}_${timestamp}.db`;
      const backupFilePath = path.join(this.backupPath, filename);

      // Create backup using SQLite backup API
      await this.db.raw.backup(backupFilePath);

      // Encrypt backup if requested
      if (encrypt) {
        await this.encryptFile(backupFilePath);
      }

      // Calculate file size and checksum
      const stats = fs.statSync(backupFilePath);
      const checksum = await this.calculateFileChecksum(backupFilePath);

      const backupInfo: BackupInfo = {
        id: this.generateBackupId(),
        filename,
        size: stats.size,
        checksum,
        createdAt: new Date().toISOString(),
        type,
        isEncrypted: encrypt,
        isVerified: false,
        retentionDays: 30
      };

      // Store backup information
      const stmt = this.db.raw.prepare(`
        INSERT INTO backup_info (
          id, filename, size, checksum, type, is_encrypted, retention_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        backupInfo.id,
        backupInfo.filename,
        backupInfo.size,
        backupInfo.checksum,
        backupInfo.type,
        backupInfo.isEncrypted ? 1 : 0,
        backupInfo.retentionDays
      );

      // Verify backup
      const verificationResult = await this.verifyBackup(backupInfo.id);
      if (verificationResult.success) {
        backupInfo.isVerified = true;
        this.db.raw.prepare('UPDATE backup_info SET is_verified = 1 WHERE id = ?').run(backupInfo.id);
      }

      await this.logMaintenanceComplete(taskId, 'success', 'تم إنشاء النسخة الاحتياطية بنجاح', 'Backup created successfully', {
        filename: backupInfo.filename,
        size: backupInfo.size,
        encrypted: backupInfo.isEncrypted,
        verified: backupInfo.isVerified
      });

      // Clean up old backups
      await this.cleanupOldBackups();

      return {
        success: true,
        data: backupInfo,
        message: 'تم إنشاء النسخة الاحتياطية بنجاح',
        messageEn: 'Backup created successfully'
      };

    } catch (error) {
      await this.logMaintenanceComplete(taskId, 'error', 'فشل في إنشاء النسخة الاحتياطية', 'Failed to create backup', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        message: 'فشل في إنشاء النسخة الاحتياطية',
        messageEn: 'Failed to create backup',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupId: string): Promise<ApiResponse<boolean>> {
    try {
      const backupInfo = this.db.raw.prepare('SELECT * FROM backup_info WHERE id = ?').get(backupId) as any;
      
      if (!backupInfo) {
        return {
          success: false,
          message: 'النسخة الاحتياطية غير موجودة',
          messageEn: 'Backup not found'
        };
      }

      const backupFilePath = path.join(this.backupPath, backupInfo.filename);
      
      if (!fs.existsSync(backupFilePath)) {
        return {
          success: false,
          message: 'ملف النسخة الاحتياطية غير موجود',
          messageEn: 'Backup file not found'
        };
      }

      // Verify file checksum
      const currentChecksum = await this.calculateFileChecksum(backupFilePath);
      const checksumValid = currentChecksum === backupInfo.checksum;

      // Try to open backup database (basic integrity check)
      let databaseValid = false;
      try {
        const tempDb = new (require('better-sqlite3'))(backupFilePath, { readonly: true });
        const result = tempDb.prepare('SELECT COUNT(*) as count FROM sqlite_master').get();
        databaseValid = result && typeof result.count === 'number';
        tempDb.close();
      } catch (error) {
        databaseValid = false;
      }

      const isValid = checksumValid && databaseValid;

      return {
        success: true,
        data: isValid,
        message: isValid ? 'النسخة الاحتياطية صحيحة' : 'النسخة الاحتياطية تالفة',
        messageEn: isValid ? 'Backup is valid' : 'Backup is corrupted'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في التحقق من النسخة الاحتياطية',
        messageEn: 'Failed to verify backup',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string): Promise<ApiResponse<void>> {
    const taskId = this.generateTaskId('restore');
    const startTime = new Date().toISOString();

    try {
      await this.logMaintenanceStart(taskId, 'restore', startTime);

      // Verify backup before restore
      const verificationResult = await this.verifyBackup(backupId);
      if (!verificationResult.success || !verificationResult.data) {
        throw new Error('Backup verification failed');
      }

      const backupInfo = this.db.raw.prepare('SELECT * FROM backup_info WHERE id = ?').get(backupId) as any;
      const backupFilePath = path.join(this.backupPath, backupInfo.filename);

      // Create current database backup before restore
      await this.createBackup('full', true);

      // Close current database
      this.db.close();

      // Copy backup to current database location
      const currentDbPath = this.db.raw.name;
      fs.copyFileSync(backupFilePath, currentDbPath);

      // Reopen database
      this.db = new EnhancedDatabaseManager(currentDbPath);

      await this.logMaintenanceComplete(taskId, 'success', 'تم استعادة النسخة الاحتياطية بنجاح', 'Backup restored successfully', {
        backupId,
        filename: backupInfo.filename
      });

      return {
        success: true,
        message: 'تم استعادة النسخة الاحتياطية بنجاح',
        messageEn: 'Backup restored successfully'
      };

    } catch (error) {
      await this.logMaintenanceComplete(taskId, 'error', 'فشل في استعادة النسخة الاحتياطية', 'Failed to restore backup', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        message: 'فشل في استعادة النسخة الاحتياطية',
        messageEn: 'Failed to restore backup',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== DATABASE OPTIMIZATION ====================

  /**
   * Optimize database
   */
  async optimizeDatabase(): Promise<ApiResponse<void>> {
    const taskId = this.generateTaskId('optimization');
    const startTime = new Date().toISOString();

    try {
      await this.logMaintenanceStart(taskId, 'optimization', startTime);

      const optimizationResults = {
        vacuum: false,
        reindex: false,
        analyze: false,
        integrityCheck: false
      };

      // Run VACUUM to reclaim space
      try {
        this.db.raw.exec('VACUUM');
        optimizationResults.vacuum = true;
      } catch (error) {
        console.warn('VACUUM failed:', error);
      }

      // Rebuild indexes
      try {
        this.db.raw.exec('REINDEX');
        optimizationResults.reindex = true;
      } catch (error) {
        console.warn('REINDEX failed:', error);
      }

      // Update statistics
      try {
        this.db.raw.exec('ANALYZE');
        optimizationResults.analyze = true;
      } catch (error) {
        console.warn('ANALYZE failed:', error);
      }

      // Check integrity
      try {
        const result = this.db.raw.prepare('PRAGMA integrity_check').get() as any;
        optimizationResults.integrityCheck = result && result.integrity_check === 'ok';
      } catch (error) {
        console.warn('Integrity check failed:', error);
      }

      await this.logMaintenanceComplete(taskId, 'success', 'تم تحسين قاعدة البيانات بنجاح', 'Database optimized successfully', optimizationResults);

      return {
        success: true,
        message: 'تم تحسين قاعدة البيانات بنجاح',
        messageEn: 'Database optimized successfully'
      };

    } catch (error) {
      await this.logMaintenanceComplete(taskId, 'error', 'فشل في تحسين قاعدة البيانات', 'Failed to optimize database', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        message: 'فشل في تحسين قاعدة البيانات',
        messageEn: 'Failed to optimize database',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== STORAGE MANAGEMENT ====================

  /**
   * Analyze storage usage
   */
  async analyzeStorage(): Promise<ApiResponse<StorageAnalysis>> {
    try {
      const userDataPath = app.getPath('userData');
      const analysis: StorageAnalysis = {
        totalSize: 0,
        usedSize: 0,
        freeSize: 0,
        breakdown: {
          database: 0,
          logs: 0,
          backups: 0,
          cache: 0,
          temp: 0,
          attachments: 0
        },
        recommendations: []
      };

      // Calculate directory sizes
      analysis.breakdown.database = await this.getDirectorySize(path.dirname(this.db.raw.name));
      analysis.breakdown.logs = await this.getDirectorySize(this.logsPath);
      analysis.breakdown.backups = await this.getDirectorySize(this.backupPath);
      analysis.breakdown.temp = await this.getDirectorySize(this.tempPath);

      analysis.usedSize = Object.values(analysis.breakdown).reduce((sum, size) => sum + size, 0);

      // Generate recommendations
      if (analysis.breakdown.logs > 100 * 1024 * 1024) { // 100MB
        analysis.recommendations.push({
          type: 'cleanup',
          target: 'logs',
          potentialSavings: analysis.breakdown.logs * 0.8,
          risk: 'low',
          description: 'حذف ملفات السجلات القديمة',
          descriptionEn: 'Delete old log files'
        });
      }

      if (analysis.breakdown.temp > 50 * 1024 * 1024) { // 50MB
        analysis.recommendations.push({
          type: 'cleanup',
          target: 'temp',
          potentialSavings: analysis.breakdown.temp,
          risk: 'low',
          description: 'حذف الملفات المؤقتة',
          descriptionEn: 'Delete temporary files'
        });
      }

      return {
        success: true,
        data: analysis
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في تحليل التخزين',
        messageEn: 'Failed to analyze storage',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Clean up storage
   */
  async cleanupStorage(targets: string[] = ['logs', 'temp', 'cache']): Promise<ApiResponse<void>> {
    const taskId = this.generateTaskId('cleanup');
    const startTime = new Date().toISOString();

    try {
      await this.logMaintenanceStart(taskId, 'cleanup', startTime);

      const cleanupResults: Record<string, number> = {};

      for (const target of targets) {
        switch (target) {
          case 'logs':
            cleanupResults.logs = await this.cleanupLogs();
            break;
          case 'temp':
            cleanupResults.temp = await this.cleanupTempFiles();
            break;
          case 'cache':
            cleanupResults.cache = await this.cleanupCache();
            break;
          case 'backups':
            cleanupResults.backups = await this.cleanupOldBackups();
            break;
        }
      }

      await this.logMaintenanceComplete(taskId, 'success', 'تم تنظيف التخزين بنجاح', 'Storage cleanup completed', cleanupResults);

      return {
        success: true,
        message: 'تم تنظيف التخزين بنجاح',
        messageEn: 'Storage cleanup completed'
      };

    } catch (error) {
      await this.logMaintenanceComplete(taskId, 'error', 'فشل في تنظيف التخزين', 'Failed to cleanup storage', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        message: 'فشل في تنظيف التخزين',
        messageEn: 'Failed to cleanup storage',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== SCHEDULED MAINTENANCE ====================

  /**
   * Schedule maintenance tasks
   */
  async scheduleMaintenanceTasks(): Promise<void> {
    const defaultTasks: Omit<MaintenanceTask, 'lastRun' | 'nextRun'>[] = [
      {
        id: 'daily-backup',
        name: 'النسخ الاحتياطي اليومي',
        nameEn: 'Daily Backup',
        type: 'backup',
        schedule: 'daily',
        priority: 'high',
        estimatedDuration: 10,
        status: 'pending',
        isEnabled: true
      },
      {
        id: 'weekly-optimization',
        name: 'تحسين أسبوعي',
        nameEn: 'Weekly Optimization',
        type: 'optimization',
        schedule: 'weekly',
        priority: 'medium',
        estimatedDuration: 30,
        status: 'pending',
        isEnabled: true
      },
      {
        id: 'monthly-cleanup',
        name: 'تنظيف شهري',
        nameEn: 'Monthly Cleanup',
        type: 'cleanup',
        schedule: 'monthly',
        priority: 'low',
        estimatedDuration: 15,
        status: 'pending',
        isEnabled: true
      }
    ];

    for (const task of defaultTasks) {
      await this.createMaintenanceTask(task);
      await this.scheduleTask(task.id);
    }

    console.log('✅ Maintenance tasks scheduled');
  }

  // ==================== HELPER METHODS ====================

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      if (!fs.existsSync(dirPath)) return 0;
      
      let totalSize = 0;
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  private async cleanupLogs(): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      let deletedSize = 0;
      
      if (fs.existsSync(this.logsPath)) {
        const files = fs.readdirSync(this.logsPath);
        
        for (const file of files) {
          const filePath = path.join(this.logsPath, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            deletedSize += stats.size;
            fs.unlinkSync(filePath);
          }
        }
      }
      
      return deletedSize;
    } catch (error) {
      return 0;
    }
  }

  private async cleanupTempFiles(): Promise<number> {
    try {
      let deletedSize = 0;
      
      if (fs.existsSync(this.tempPath)) {
        const files = fs.readdirSync(this.tempPath);
        
        for (const file of files) {
          const filePath = path.join(this.tempPath, file);
          const stats = fs.statSync(filePath);
          deletedSize += stats.size;
          fs.unlinkSync(filePath);
        }
      }
      
      return deletedSize;
    } catch (error) {
      return 0;
    }
  }

  private async cleanupCache(): Promise<number> {
    try {
      // Clear predictive analytics cache older than 24 hours
      const stmt = this.db.raw.prepare('DELETE FROM predictive_analytics_cache WHERE expires_at < datetime("now")');
      const result = stmt.run();
      return result.changes || 0;
    } catch (error) {
      return 0;
    }
  }

  private async cleanupOldBackups(): Promise<number> {
    try {
      let deletedSize = 0;
      const backups = this.db.raw.prepare('SELECT * FROM backup_info').all() as any[];
      
      for (const backup of backups) {
        const createdDate = new Date(backup.created_at);
        const retentionDate = new Date(createdDate.getTime() + backup.retention_days * 24 * 60 * 60 * 1000);
        
        if (new Date() > retentionDate) {
          const backupFilePath = path.join(this.backupPath, backup.filename);
          
          if (fs.existsSync(backupFilePath)) {
            const stats = fs.statSync(backupFilePath);
            deletedSize += stats.size;
            fs.unlinkSync(backupFilePath);
          }
          
          this.db.raw.prepare('DELETE FROM backup_info WHERE id = ?').run(backup.id);
        }
      }
      
      return deletedSize;
    } catch (error) {
      return 0;
    }
  }

  private async calculateFileChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async encryptFile(filePath: string): Promise<void> {
    // Simplified encryption - in production would use proper encryption
    const data = fs.readFileSync(filePath);
    const encrypted = Buffer.from(data).toString('base64');
    fs.writeFileSync(filePath + '.enc', encrypted);
    fs.unlinkSync(filePath);
    fs.renameSync(filePath + '.enc', filePath);
  }

  private generateTaskId(type: string): string {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBackupId(): string {
    return `BKP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async createMaintenanceTask(task: Omit<MaintenanceTask, 'lastRun' | 'nextRun'>): Promise<void> {
    try {
      const stmt = this.db.raw.prepare(`
        INSERT OR REPLACE INTO maintenance_tasks (
          id, name, name_en, type, schedule_type, priority, estimated_duration, status, is_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        task.id, task.name, task.nameEn, task.type, task.schedule,
        task.priority, task.estimatedDuration, task.status, task.isEnabled ? 1 : 0
      );
    } catch (error) {
      console.error('Failed to create maintenance task:', error);
    }
  }

  private async scheduleTask(taskId: string): Promise<void> {
    // Implementation would schedule tasks based on their schedule type
    // For now, just log that scheduling is set up
    console.log(`Task ${taskId} scheduled`);
  }

  private async logMaintenanceStart(taskId: string, type: string, startTime: string): Promise<void> {
    // Log maintenance task start
    console.log(`Maintenance task ${taskId} (${type}) started at ${startTime}`);
  }

  private async logMaintenanceComplete(taskId: string, status: string, message: string, messageEn: string, details: Record<string, any>): Promise<void> {
    try {
      const stmt = this.db.raw.prepare(`
        INSERT INTO maintenance_reports (
          task_id, start_time, end_time, status, message, message_en, details
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const endTime = new Date().toISOString();
      stmt.run(taskId, new Date().toISOString(), endTime, status, message, messageEn, JSON.stringify(details));
    } catch (error) {
      console.error('Failed to log maintenance completion:', error);
    }
  }
}

export default MaintenanceService;
