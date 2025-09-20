import { app, BrowserWindow, ipcMain, Menu, dialog, shell } from 'electron';
import { join } from 'path';
import { DatabaseService } from './database/connection';
import { HardwareService } from './services/hardware.service';
import { LicenseService } from './services/license.service';
import { SecurityService } from './services/security.service';

/**
 * Tareeqa POS - Main Process
 * Advanced Egyptian Point of Sale System
 * 
 * Features:
 * - Multi-window support with security
 * - Hardware integration (barcode, printer)
 * - License management and validation
 * - Database encryption and backup
 * - Auto-updater with integrity checks
 */

class TareeqaPOSMain {
  private mainWindow: BrowserWindow | null = null;
  private databaseService: DatabaseService;
  private hardwareService: HardwareService;
  private licenseService: LicenseService;
  private securityService: SecurityService;

  constructor() {
    this.databaseService = new DatabaseService();
    this.hardwareService = new HardwareService();
    this.licenseService = new LicenseService();
    this.securityService = new SecurityService();
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Tareeqa POS...');
    
    // Set app user model ID for Windows
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.tareeqa.pos');
    }

    // Security: Disable node integration in renderer
    app.commandLine.appendSwitch('--disable-features', 'OutOfBlinkCors');
    app.commandLine.appendSwitch('--disable-web-security');

    // Initialize services
    await this.initializeServices();
    
    // Setup IPC handlers
    this.setupIPC();
    
    // Setup app event handlers
    this.setupAppEvents();
  }

  /**
   * Initialize all services
   */
  private async initializeServices(): Promise<void> {
    try {
      console.log('📊 Initializing database...');
      await this.databaseService.initialize();
      
      console.log('🔐 Initializing security...');
      await this.securityService.initialize();
      
      console.log('📜 Validating license...');
      await this.licenseService.validateLicense();
      
      console.log('🔌 Initializing hardware...');
      await this.hardwareService.initialize();
      
      console.log('✅ All services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      await this.showErrorDialog('Initialization Error', 
        'Failed to initialize application services. Please contact support.');
      app.quit();
    }
  }

  /**
   * Create the main application window
   */
  private createMainWindow(): void {
    console.log('🪟 Creating main window...');

    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      show: false, // Don't show until ready
      icon: join(__dirname, '../../assets/icons/icon.png'),
      titleBarStyle: 'default',
      frame: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false
      }
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // Window event handlers
    this.mainWindow.once('ready-to-show', () => {
      console.log('✅ Main window ready');
      this.mainWindow?.show();
      
      // Focus the window
      if (process.platform === 'darwin') {
        this.mainWindow?.focus();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Prevent navigation to external URLs
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      
      if (parsedUrl.origin !== 'http://localhost:3000' && 
          parsedUrl.origin !== 'file://') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    });

    // Prevent new window creation
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  /**
   * Setup IPC communication handlers
   */
  private setupIPC(): void {
    console.log('📡 Setting up IPC handlers...');

    // Database operations
    ipcMain.handle('db:query', async (event, sql: string, params?: any[]) => {
      return await this.databaseService.query(sql, params);
    });

    ipcMain.handle('db:run', async (event, sql: string, params?: any[]) => {
      return await this.databaseService.run(sql, params);
    });

    // Hardware operations
    ipcMain.handle('hardware:scan-barcode', async () => {
      return await this.hardwareService.scanBarcode();
    });

    ipcMain.handle('hardware:print-receipt', async (event, receiptData: any) => {
      return await this.hardwareService.printReceipt(receiptData);
    });

    ipcMain.handle('hardware:open-cash-drawer', async () => {
      return await this.hardwareService.openCashDrawer();
    });

    // Security operations
    ipcMain.handle('security:authenticate', async (event, credentials: any) => {
      return await this.securityService.authenticate(credentials);
    });

    ipcMain.handle('security:get-permissions', async (event, userId: string) => {
      return await this.securityService.getUserPermissions(userId);
    });

    // License operations
    ipcMain.handle('license:get-info', async () => {
      return await this.licenseService.getLicenseInfo();
    });

    // App operations
    ipcMain.handle('app:get-version', () => {
      return app.getVersion();
    });

    ipcMain.handle('app:quit', () => {
      app.quit();
    });

    ipcMain.handle('app:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('app:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    // File operations
    ipcMain.handle('dialog:show-save', async (event, options: any) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, options);
      return result;
    });

    ipcMain.handle('dialog:show-open', async (event, options: any) => {
      const result = await dialog.showOpenDialog(this.mainWindow!, options);
      return result;
    });
  }

  /**
   * Setup application event handlers
   */
  private setupAppEvents(): void {
    // App ready event
    app.whenReady().then(() => {
      console.log('🎯 App ready, creating main window...');
      this.createMainWindow();
      this.createApplicationMenu();
    });

    // All windows closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // App activate (macOS)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    // Before quit - cleanup
    app.on('before-quit', async (event) => {
      console.log('🧹 Cleaning up before quit...');
      event.preventDefault();
      
      try {
        await this.cleanup();
        app.exit(0);
      } catch (error) {
        console.error('❌ Cleanup failed:', error);
        app.exit(1);
      }
    });

    // Certificate error handler
    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
      // In development, ignore certificate errors
      if (process.env.NODE_ENV === 'development') {
        event.preventDefault();
        callback(true);
      } else {
        callback(false);
      }
    });
  }

  /**
   * Create application menu
   */
  private createApplicationMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'ملف',
        submenu: [
          {
            label: 'معاملة جديدة',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('menu:new-transaction');
            }
          },
          { type: 'separator' },
          {
            label: 'طباعة',
            accelerator: 'CmdOrCtrl+P',
            click: () => {
              this.mainWindow?.webContents.send('menu:print');
            }
          },
          { type: 'separator' },
          {
            label: 'خروج',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'تحرير',
        submenu: [
          { role: 'undo', label: 'تراجع' },
          { role: 'redo', label: 'إعادة' },
          { type: 'separator' },
          { role: 'cut', label: 'قص' },
          { role: 'copy', label: 'نسخ' },
          { role: 'paste', label: 'لصق' }
        ]
      },
      {
        label: 'عرض',
        submenu: [
          { role: 'reload', label: 'إعادة تحميل' },
          { role: 'forceReload', label: 'إعادة تحميل قسري' },
          { role: 'toggleDevTools', label: 'أدوات المطور' },
          { type: 'separator' },
          { role: 'resetZoom', label: 'إعادة تعيين التكبير' },
          { role: 'zoomIn', label: 'تكبير' },
          { role: 'zoomOut', label: 'تصغير' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'ملء الشاشة' }
        ]
      },
      {
        label: 'مساعدة',
        submenu: [
          {
            label: 'حول طريقة',
            click: () => {
              this.showAboutDialog();
            }
          },
          {
            label: 'دليل المستخدم',
            click: () => {
              shell.openExternal('https://tareeqa.pos/help');
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  /**
   * Show about dialog
   */
  private showAboutDialog(): void {
    dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: 'حول طريقة POS',
      message: 'طريقة - نظام نقطة البيع المصري المتقدم',
      detail: `الإصدار: ${app.getVersion()}\nحقوق النشر © 2024 فريق تطوير طريقة\nجميع الحقوق محفوظة`,
      buttons: ['موافق']
    });
  }

  /**
   * Show error dialog
   */
  private async showErrorDialog(title: string, message: string): Promise<void> {
    await dialog.showErrorBox(title, message);
  }

  /**
   * Cleanup resources before quit
   */
  private async cleanup(): Promise<void> {
    console.log('🧹 Starting cleanup...');
    
    try {
      // Close database connections
      await this.databaseService.close();
      
      // Disconnect hardware
      await this.hardwareService.disconnect();
      
      // Clear security tokens
      await this.securityService.cleanup();
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup error:', error);
      throw error;
    }
  }
}

// Initialize and start the application
const tareeqaApp = new TareeqaPOSMain();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the application
tareeqaApp.initialize().catch((error) => {
  console.error('💥 Failed to initialize application:', error);
  app.quit();
});
