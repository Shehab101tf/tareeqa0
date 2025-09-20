import { ipcMain, BrowserWindow } from 'electron';
import { DatabaseManager } from '../database/connection';
import { HardwareManager } from '../hardware/manager';
import { SecurityManager } from '../security/fingerprint';
import { LicenseManager } from '../security/license';

export class APIManager {
  private databaseManager: DatabaseManager;
  private hardwareManager: HardwareManager;
  private securityManager: SecurityManager;
  private licenseManager: LicenseManager;

  constructor() {
    this.databaseManager = new DatabaseManager();
    this.hardwareManager = new HardwareManager();
    this.securityManager = new SecurityManager();
    this.licenseManager = new LicenseManager();
    this.setupIpcHandlers();
  }

  private setupIpcHandlers(): void {
    // Database operations
    ipcMain.handle('database:query', async (event, sql: string, params?: any[]) => {
      try {
        return await this.databaseManager.query(sql, params);
      } catch (error) {
        console.error('Database query error:', error);
        throw error;
      }
    });

    ipcMain.handle('database:execute', async (event, sql: string, params?: any[]) => {
      try {
        return await this.databaseManager.execute(sql, params);
      } catch (error) {
        console.error('Database execute error:', error);
        throw error;
      }
    });

    ipcMain.handle('database:backup', async () => {
      try {
        return await this.databaseManager.backup();
      } catch (error) {
        console.error('Database backup error:', error);
        throw error;
      }
    });

    // Hardware operations
    ipcMain.handle('hardware:scanBarcode', async () => {
      try {
        return await this.hardwareManager.scanBarcode();
      } catch (error) {
        console.error('Barcode scan error:', error);
        throw error;
      }
    });

    ipcMain.handle('hardware:printReceipt', async (event, data: any) => {
      try {
        return await this.hardwareManager.printReceipt(data);
      } catch (error) {
        console.error('Print receipt error:', error);
        throw error;
      }
    });

    ipcMain.handle('hardware:openCashDrawer', async () => {
      try {
        return await this.hardwareManager.openCashDrawer();
      } catch (error) {
        console.error('Cash drawer error:', error);
        throw error;
      }
    });

    // Security operations
    ipcMain.handle('security:validateLicense', async () => {
      try {
        return await this.licenseManager.validateLicense();
      } catch (error) {
        console.error('License validation error:', error);
        throw error;
      }
    });

    ipcMain.handle('security:getFingerprint', async () => {
      try {
        return await this.securityManager.getHardwareFingerprint();
      } catch (error) {
        console.error('Fingerprint error:', error);
        throw error;
      }
    });

    // System operations
    ipcMain.handle('system:getVersion', () => {
      return process.env.npm_package_version || '1.0.0';
    });

    ipcMain.handle('system:getPlatform', () => {
      return process.platform;
    });

    ipcMain.handle('system:getSystemInfo', () => {
      return {
        platform: process.platform,
        arch: process.arch,
        version: process.version,
        electronVersion: process.versions.electron,
      };
    });

    // Window operations
    ipcMain.handle('window:minimize', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      window?.minimize();
    });

    ipcMain.handle('window:maximize', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window?.isMaximized()) {
        window.restore();
      } else {
        window?.maximize();
      }
    });

    ipcMain.handle('window:close', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      window?.close();
    });

    ipcMain.handle('window:isMaximized', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      return window?.isMaximized() || false;
    });

    // POS specific operations
    ipcMain.handle('pos:processSale', async (event, saleData: any) => {
      try {
        // Process sale logic here
        return { success: true, saleId: Date.now() };
      } catch (error) {
        console.error('Process sale error:', error);
        throw error;
      }
    });

    ipcMain.handle('pos:printReceipt', async (event, receiptData: any) => {
      try {
        return await this.hardwareManager.printReceipt(receiptData);
      } catch (error) {
        console.error('Print receipt error:', error);
        throw error;
      }
    });

    // Product operations
    ipcMain.handle('products:getAll', async () => {
      try {
        return await this.databaseManager.query('SELECT * FROM products WHERE is_active = 1');
      } catch (error) {
        console.error('Get products error:', error);
        throw error;
      }
    });

    ipcMain.handle('products:getById', async (event, id: number) => {
      try {
        return await this.databaseManager.query('SELECT * FROM products WHERE id = ?', [id]);
      } catch (error) {
        console.error('Get product error:', error);
        throw error;
      }
    });

    // Customer operations
    ipcMain.handle('customers:getAll', async () => {
      try {
        return await this.databaseManager.query('SELECT * FROM customers WHERE is_active = 1');
      } catch (error) {
        console.error('Get customers error:', error);
        throw error;
      }
    });

    // Sales operations
    ipcMain.handle('sales:getAll', async (event, filters?: any) => {
      try {
        let query = 'SELECT * FROM sales';
        const params: any[] = [];
        
        if (filters?.startDate) {
          query += ' WHERE created_at >= ?';
          params.push(filters.startDate);
        }
        
        return await this.databaseManager.query(query, params);
      } catch (error) {
        console.error('Get sales error:', error);
        throw error;
      }
    });

    // Settings operations
    ipcMain.handle('settings:get', async (event, key: string) => {
      try {
        const result = await this.databaseManager.query('SELECT value FROM settings WHERE key = ?', [key]);
        return result[0]?.value || null;
      } catch (error) {
        console.error('Get setting error:', error);
        throw error;
      }
    });

    ipcMain.handle('settings:set', async (event, key: string, value: any) => {
      try {
        await this.databaseManager.execute(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          [key, JSON.stringify(value)]
        );
        return true;
      } catch (error) {
        console.error('Set setting error:', error);
        throw error;
      }
    });

    // User operations
    ipcMain.handle('users:authenticate', async (event, credentials: any) => {
      try {
        const { username, password } = credentials;
        const result = await this.databaseManager.query(
          'SELECT * FROM users WHERE username = ? AND password_hash = ?',
          [username, password] // In production, use proper password hashing
        );
        return result[0] || null;
      } catch (error) {
        console.error('Authentication error:', error);
        throw error;
      }
    });

    console.log('✅ API Manager initialized with all IPC handlers');
  }

  async initialize(): Promise<void> {
    try {
      await this.databaseManager.initialize();
      await this.hardwareManager.initialize();
      await this.licenseManager.initialize();
      console.log('✅ API Manager fully initialized');
    } catch (error) {
      console.error('❌ API Manager initialization failed:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.databaseManager.close();
      await this.hardwareManager.cleanup();
      console.log('✅ API Manager cleaned up');
    } catch (error) {
      console.error('❌ API Manager cleanup failed:', error);
    }
  }
}
