import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import { DatabaseManager } from './database/connection';
import { LicenseManager } from './security/license';
import { AntiTampering } from './security/anti-tampering';
import { RuntimeProtection } from './security/runtime-protection';
import { HardwareManager } from './hardware/manager';
import { APIManager } from './api/manager';

class TareeqaPOSApp {
  private mainWindow: BrowserWindow | null = null;
  private databaseManager: DatabaseManager;
  private licenseManager: LicenseManager;
  private hardwareManager: HardwareManager;
  private apiManager: APIManager;

  constructor() {
    this.databaseManager = new DatabaseManager();
    this.licenseManager = new LicenseManager();
    this.hardwareManager = new HardwareManager();
    this.apiManager = new APIManager();
  }

  async initialize(): Promise<void> {
    // Initialize security measures
    await this.initializeSecurity();
    
    // Initialize database
    await this.databaseManager.initialize();
    
    // Initialize hardware
    await this.hardwareManager.initialize();
    
    // Set up IPC handlers
    this.apiManager.setupHandlers();
    
    // Create main window
    await this.createMainWindow();
    
    // Initialize auto-updater
    this.initializeAutoUpdater();
  }

  private async initializeSecurity(): Promise<void> {
    // Enable runtime protections
    RuntimeProtection.enableProtections();
    
    // Initialize anti-tampering
    AntiTampering.initializeChecksums();
    
    // Verify integrity
    if (!AntiTampering.verifyIntegrity()) {
      console.error('Application integrity check failed');
      app.quit();
      return;
    }
    
    // Check for debugging
    if (AntiTampering.detectDebugging() && !app.isPackaged) {
      console.warn('Development mode detected');
    }
    
    // Validate license
    try {
      await this.licenseManager.validateCurrentLicense();
    } catch (error) {
      console.error('License validation failed:', error);
      // Show license dialog
      await this.showLicenseDialog();
    }
  }

  private async createMainWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      show: false,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#1e3a8a',
        symbolColor: '#ffffff',
        height: 32
      },
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, '../preload/index.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false
      },
      icon: path.join(__dirname, '../../resources/icon.png')
    });

    // Load the app
    if (app.isPackaged) {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    } else {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Security: Prevent new window creation
    this.mainWindow.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' };
    });

    // Security: Handle navigation attempts
    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      if (url !== this.mainWindow?.webContents.getURL()) {
        event.preventDefault();
      }
    });

    // Security: Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  private async showLicenseDialog(): Promise<void> {
    // Create license dialog window
    const licenseWindow = new BrowserWindow({
      width: 500,
      height: 400,
      modal: true,
      parent: this.mainWindow || undefined,
      show: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/license.js')
      }
    });

    licenseWindow.loadFile(path.join(__dirname, '../renderer/license.html'));
    licenseWindow.once('ready-to-show', () => {
      licenseWindow.show();
    });
  }

  private initializeAutoUpdater(): void {
    if (!app.isPackaged) return;

    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-available', () => {
      console.log('Update available');
    });

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded');
      // Notify user and restart
      autoUpdater.quitAndInstall();
    });

    autoUpdater.on('error', (error) => {
      console.error('Auto-updater error:', error);
    });
  }

  private setupApplicationMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Sale',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('menu-action', 'new-sale');
            }
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About Tareeqa POS',
            click: () => {
              this.mainWindow?.webContents.send('menu-action', 'about');
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  async cleanup(): Promise<void> {
    await this.databaseManager.close();
    await this.hardwareManager.cleanup();
  }
}

// App event handlers
const tareeqaApp = new TareeqaPOSApp();

app.whenReady().then(async () => {
  try {
    await tareeqaApp.initialize();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  await tareeqaApp.cleanup();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await tareeqaApp.initialize();
  }
});

app.on('before-quit', async () => {
  await tareeqaApp.cleanup();
});

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (event) => {
    event.preventDefault();
  });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(false); // Reject invalid certificates
});

export default tareeqaApp;
