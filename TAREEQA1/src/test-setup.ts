// Test Setup for Electron 21.x - Windows 7+ Compatible
import '@testing-library/jest-dom';

// Mock Electron API for testing
const mockElectronAPI = {
  platform: 'win32',
  version: '21.4.4',
  database: {
    findByBarcode: jest.fn(),
    searchProducts: jest.fn(),
    createTransaction: jest.fn()
  },
  hardware: {
    simulateBarcodeScan: jest.fn(),
    scanner: {
      connect: jest.fn(),
      scan: jest.fn()
    },
    printer: {
      connect: jest.fn(),
      print: jest.fn()
    }
  }
};

// Define window.electronAPI for tests
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true
});

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver for component tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver for animation tests
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Setup performance mock for Windows 7 compatibility
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
  },
  writable: true
});

// Mock crypto for security tests
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      digest: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn()
    }
  }
});

// Console error suppression for known issues
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test utilities
global.setupPOS = async (options = {}) => {
  // Mock POS setup for E2E tests
  return {
    page: {
      goto: jest.fn(),
      click: jest.fn(),
      fill: jest.fn(),
      waitForSelector: jest.fn(),
      locator: jest.fn(() => ({
        click: jest.fn(),
        fill: jest.fn(),
        textContent: jest.fn(),
        isVisible: jest.fn(() => true)
      }))
    }
  };
};

global.addProductToCart = async (page: any, product: any) => {
  // Mock add product to cart functionality
  return Promise.resolve();
};

global.validateBarcode = async (barcode: string) => {
  // Mock barcode validation
  return {
    isValid: barcode.length >= 8,
    country: barcode.startsWith('622') ? 'EG' : 'OTHER',
    format: barcode.length === 13 ? 'EAN-13' : 'OTHER'
  };
};

global.processPayment = async (paymentData: any) => {
  // Mock payment processing
  return {
    success: true,
    transactionId: `TXN-${Date.now()}`
  };
};

global.generateReceipt = async (receiptData: any) => {
  // Mock receipt generation
  return {
    content: 'فاتورة ضريبية\nضريبة القيمة المضافة\nالمجموع الكلي',
    textDirection: 'rtl'
  };
};

// Egyptian market specific test utilities
global.calculateSale = (items: any[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vatAmount = subtotal * 0.14; // Egyptian VAT rate
  return {
    subtotal,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: subtotal + vatAmount
  };
};

global.getAvailablePaymentMethods = async () => {
  return ['cash', 'visa', 'meeza', 'bank-transfer'];
};

global.getWindowsVersion = async () => {
  return {
    major: 6,
    minor: 1,
    version: '6.1' // Windows 7
  };
};

global.getDotNetVersions = async () => {
  return [
    { version: '4.61', installed: true },
    { version: '4.72', installed: true }
  ];
};
