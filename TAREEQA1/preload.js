const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  database: {
    query: (sql, params) => ipcRenderer.invoke('database:query', sql, params),
    execute: (sql, params) => ipcRenderer.invoke('database:execute', sql, params),
    backup: () => ipcRenderer.invoke('database:backup'),
    restore: (filePath) => ipcRenderer.invoke('database:restore', filePath),
  },

  // Hardware operations
  hardware: {
    scanBarcode: () => ipcRenderer.invoke('hardware:scanBarcode'),
    printReceipt: (data) => ipcRenderer.invoke('hardware:printReceipt', data),
    openCashDrawer: () => ipcRenderer.invoke('hardware:openCashDrawer'),
    getStatus: () => ipcRenderer.invoke('hardware:getStatus'),
  },

  // Security operations
  security: {
    validateLicense: () => ipcRenderer.invoke('security:validateLicense'),
    getFingerprint: () => ipcRenderer.invoke('security:getFingerprint'),
    checkIntegrity: () => ipcRenderer.invoke('security:checkIntegrity'),
  },

  // System operations
  system: {
    getVersion: () => ipcRenderer.invoke('system:getVersion'),
    getPlatform: () => ipcRenderer.invoke('system:getPlatform'),
    getSystemInfo: () => ipcRenderer.invoke('system:getSystemInfo'),
    showMessageBox: (options) => ipcRenderer.invoke('system:showMessageBox', options),
    showSaveDialog: (options) => ipcRenderer.invoke('system:showSaveDialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('system:showOpenDialog', options),
  },

  // Window operations
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },

  // Event listeners
  on: (channel, callback) => {
    const validChannels = [
      'hardware:barcodeScanned',
      'hardware:printerStatus',
      'security:licenseExpired',
      'system:updateAvailable',
      'database:backupComplete'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  // Remove event listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Tareeqa POS specific API
contextBridge.exposeInMainWorld('tareeqaAPI', {
  // POS specific operations
  pos: {
    processSale: (saleData) => ipcRenderer.invoke('pos:processSale', saleData),
    printReceipt: (receiptData) => ipcRenderer.invoke('pos:printReceipt', receiptData),
    openCashDrawer: () => ipcRenderer.invoke('pos:openCashDrawer'),
    scanProduct: () => ipcRenderer.invoke('pos:scanProduct'),
  },

  // Product management
  products: {
    getAll: () => ipcRenderer.invoke('products:getAll'),
    getById: (id) => ipcRenderer.invoke('products:getById', id),
    create: (product) => ipcRenderer.invoke('products:create', product),
    update: (id, product) => ipcRenderer.invoke('products:update', id, product),
    delete: (id) => ipcRenderer.invoke('products:delete', id),
    search: (query) => ipcRenderer.invoke('products:search', query),
  },

  // Customer management
  customers: {
    getAll: () => ipcRenderer.invoke('customers:getAll'),
    getById: (id) => ipcRenderer.invoke('customers:getById', id),
    create: (customer) => ipcRenderer.invoke('customers:create', customer),
    update: (id, customer) => ipcRenderer.invoke('customers:update', id, customer),
    delete: (id) => ipcRenderer.invoke('customers:delete', id),
    search: (query) => ipcRenderer.invoke('customers:search', query),
  },

  // Sales management
  sales: {
    getAll: (filters) => ipcRenderer.invoke('sales:getAll', filters),
    getById: (id) => ipcRenderer.invoke('sales:getById', id),
    create: (sale) => ipcRenderer.invoke('sales:create', sale),
    refund: (id) => ipcRenderer.invoke('sales:refund', id),
    getReports: (period) => ipcRenderer.invoke('sales:getReports', period),
  },

  // Settings management
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    reset: () => ipcRenderer.invoke('settings:reset'),
  },

  // User management
  users: {
    authenticate: (credentials) => ipcRenderer.invoke('users:authenticate', credentials),
    getCurrentUser: () => ipcRenderer.invoke('users:getCurrentUser'),
    logout: () => ipcRenderer.invoke('users:logout'),
    changePassword: (oldPassword, newPassword) => ipcRenderer.invoke('users:changePassword', oldPassword, newPassword),
  }
});

console.log('Tareeqa POS Preload Script Loaded - Electron 22.3.27 Compatible');
