const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  console.log('Creating Electron window...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the simple test HTML
  mainWindow.loadFile('test-simple.html');
  
  // Open DevTools
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  console.log('Window created and HTML loaded');
}

app.whenReady().then(() => {
  console.log('Electron app ready, creating window...');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log('Simple Electron main process started');
console.log('Electron version:', process.versions.electron);
console.log('Node version:', process.versions.node);
