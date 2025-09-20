// Electron Mock for Testing - Electron 21.x Compatible
export const app = {
  getPath: jest.fn((name: string) => {
    const paths = {
      userData: 'C:\\Users\\Test\\AppData\\Roaming\\TareeqaPOS',
      documents: 'C:\\Users\\Test\\Documents',
      temp: 'C:\\Users\\Test\\AppData\\Local\\Temp'
    };
    return paths[name as keyof typeof paths] || 'C:\\Test';
  }),
  getVersion: jest.fn(() => '1.0.0'),
  getName: jest.fn(() => 'Tareeqa POS'),
  quit: jest.fn(),
  on: jest.fn(),
  whenReady: jest.fn(() => Promise.resolve())
};

export const BrowserWindow = jest.fn().mockImplementation(() => ({
  loadFile: jest.fn(),
  loadURL: jest.fn(),
  on: jest.fn(),
  webContents: {
    on: jest.fn(),
    send: jest.fn(),
    openDevTools: jest.fn()
  },
  show: jest.fn(),
  hide: jest.fn(),
  close: jest.fn(),
  minimize: jest.fn(),
  maximize: jest.fn(),
  isMaximized: jest.fn(() => false),
  setMenuBarVisibility: jest.fn(),
  setAutoHideMenuBar: jest.fn()
}));

export const ipcMain = {
  handle: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn()
};

export const ipcRenderer = {
  invoke: jest.fn(),
  send: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn()
};

export const contextBridge = {
  exposeInMainWorld: jest.fn()
};

export const shell = {
  openExternal: jest.fn(),
  showItemInFolder: jest.fn()
};

export const dialog = {
  showMessageBox: jest.fn(() => Promise.resolve({ response: 0 })),
  showOpenDialog: jest.fn(() => Promise.resolve({ canceled: false, filePaths: [] })),
  showSaveDialog: jest.fn(() => Promise.resolve({ canceled: false, filePath: '' }))
};

export const Menu = {
  setApplicationMenu: jest.fn(),
  buildFromTemplate: jest.fn()
};

export const Tray = jest.fn().mockImplementation(() => ({
  setToolTip: jest.fn(),
  setContextMenu: jest.fn(),
  on: jest.fn()
}));

// Hardware integration mocks
export const serialport = {
  SerialPort: jest.fn().mockImplementation(() => ({
    open: jest.fn((callback) => callback && callback()),
    write: jest.fn(),
    on: jest.fn(),
    close: jest.fn()
  })),
  list: jest.fn(() => Promise.resolve([]))
};

// Database mocks
export const Database = jest.fn().mockImplementation(() => ({
  prepare: jest.fn(() => ({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn(() => [])
  })),
  exec: jest.fn(),
  close: jest.fn(),
  transaction: jest.fn((fn) => fn),
  pragma: jest.fn()
}));

// Security mocks
export const machineId = jest.fn(() => Promise.resolve('test-machine-id'));

// Windows 7 specific mocks
export const os = {
  platform: jest.fn(() => 'win32'),
  release: jest.fn(() => '6.1.7601'), // Windows 7 SP1
  arch: jest.fn(() => 'x64'),
  totalmem: jest.fn(() => 2147483648), // 2GB RAM
  freemem: jest.fn(() => 1073741824), // 1GB free
  cpus: jest.fn(() => [
    { model: 'Intel Core i3-2100', speed: 3100 }
  ])
};

// File system mocks
export const fs = {
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(() => 'mock file content'),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  statSync: jest.fn(() => ({
    isDirectory: () => false,
    isFile: () => true,
    size: 1024
  }))
};

// Path utilities mock
export const path = {
  join: jest.fn((...args) => args.join('\\')),
  dirname: jest.fn((p) => p.split('\\').slice(0, -1).join('\\')),
  basename: jest.fn((p) => p.split('\\').pop()),
  extname: jest.fn((p) => {
    const parts = p.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
  })
};

// Crypto mocks for security testing
export const crypto = {
  randomBytes: jest.fn((size) => Buffer.alloc(size, 'a')),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mock-hash')
  })),
  createCipher: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    final: jest.fn(() => 'encrypted')
  })),
  createDecipher: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    final: jest.fn(() => 'decrypted')
  })),
  scryptSync: jest.fn(() => Buffer.from('mock-key')),
  createCipheriv: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    final: jest.fn(() => 'encrypted')
  })),
  createDecipheriv: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    final: jest.fn(() => 'decrypted')
  }))
};

export default {
  app,
  BrowserWindow,
  ipcMain,
  ipcRenderer,
  contextBridge,
  shell,
  dialog,
  Menu,
  Tray
};
