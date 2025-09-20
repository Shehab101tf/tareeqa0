import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script for Tareeqa POS
 * Provides secure API bridge between main and renderer processes
 */

// Define the API interface
interface TareeqaAPI {
  // Database operations
  database: {
    query: (sql: string, params?: any[]) => Promise<any[]>;
    run: (sql: string, params?: any[]) => Promise<any>;
  };

  // Hardware operations
  hardware: {
    scanBarcode: () => Promise<string | null>;
    printReceipt: (receiptData: any) => Promise<boolean>;
    openCashDrawer: () => Promise<boolean>;
    getStatus: () => Promise<any>;
    testHardware: () => Promise<any>;
  };

  // Security operations
  security: {
    authenticate: (credentials: any) => Promise<any>;
    getPermissions: (userId: string) => Promise<string[]>;
    getStatus: () => Promise<any>;
  };

  // License operations
  license: {
    getInfo: () => Promise<any>;
    activate: (licenseKey: string, userInfo: any) => Promise<boolean>;
    deactivate: () => Promise<boolean>;
    isFeatureEnabled: (feature: string) => Promise<boolean>;
  };

  // App operations
  app: {
    getVersion: () => Promise<string>;
    quit: () => Promise<void>;
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
  };

  // Dialog operations
  dialog: {
    showSave: (options: any) => Promise<any>;
    showOpen: (options: any) => Promise<any>;
  };

  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

// Create the API object
const tareeqaAPI: TareeqaAPI = {
  // Database operations
  database: {
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('db:query', sql, params),
    run: (sql: string, params?: any[]) => ipcRenderer.invoke('db:run', sql, params)
  },

  // Hardware operations
  hardware: {
    scanBarcode: () => ipcRenderer.invoke('hardware:scan-barcode'),
    printReceipt: (receiptData: any) => ipcRenderer.invoke('hardware:print-receipt', receiptData),
    openCashDrawer: () => ipcRenderer.invoke('hardware:open-cash-drawer'),
    getStatus: () => ipcRenderer.invoke('hardware:get-status'),
    testHardware: () => ipcRenderer.invoke('hardware:test-hardware')
  },

  // Security operations
  security: {
    authenticate: (credentials: any) => ipcRenderer.invoke('security:authenticate', credentials),
    getPermissions: (userId: string) => ipcRenderer.invoke('security:get-permissions', userId),
    getStatus: () => ipcRenderer.invoke('security:get-status')
  },

  // License operations
  license: {
    getInfo: () => ipcRenderer.invoke('license:get-info'),
    activate: (licenseKey: string, userInfo: any) => ipcRenderer.invoke('license:activate', licenseKey, userInfo),
    deactivate: () => ipcRenderer.invoke('license:deactivate'),
    isFeatureEnabled: (feature: string) => ipcRenderer.invoke('license:is-feature-enabled', feature)
  },

  // App operations
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    quit: () => ipcRenderer.invoke('app:quit'),
    minimize: () => ipcRenderer.invoke('app:minimize'),
    maximize: () => ipcRenderer.invoke('app:maximize')
  },

  // Dialog operations
  dialog: {
    showSave: (options: any) => ipcRenderer.invoke('dialog:show-save', options),
    showOpen: (options: any) => ipcRenderer.invoke('dialog:show-open', options)
  },

  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => {
    // Whitelist of allowed channels
    const allowedChannels = [
      'menu:new-transaction',
      'menu:print',
      'hardware:barcode-scanned',
      'hardware:scanner-error',
      'security:session-expired',
      'license:status-changed'
    ];

    if (allowedChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    } else {
      console.warn(`Channel '${channel}' is not allowed`);
    }
  },

  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.off(channel, callback);
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('tareeqa', tareeqaAPI);

// Also expose some useful utilities
contextBridge.exposeInMainWorld('platform', {
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
  arch: process.arch,
  versions: process.versions
});

// Console logging for development
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('devTools', {
    log: (...args: any[]) => console.log('[Renderer]', ...args),
    error: (...args: any[]) => console.error('[Renderer]', ...args),
    warn: (...args: any[]) => console.warn('[Renderer]', ...args)
  });
}

// Security: Remove node integration
delete (window as any).require;
delete (window as any).exports;
delete (window as any).module;

console.log('🔗 Preload script loaded successfully');
