// Jest type definitions for Electron 21.x testing
declare global {
  var jest: typeof import('jest');
  var expect: typeof import('@jest/globals').expect;
  var describe: typeof import('@jest/globals').describe;
  var it: typeof import('@jest/globals').it;
  var test: typeof import('@jest/globals').test;
  var beforeAll: typeof import('@jest/globals').beforeAll;
  var beforeEach: typeof import('@jest/globals').beforeEach;
  var afterAll: typeof import('@jest/globals').afterAll;
  var afterEach: typeof import('@jest/globals').afterEach;

  // Custom global test utilities
  function setupPOS(options?: any): Promise<any>;
  function addProductToCart(page: any, product: any): Promise<void>;
  function validateBarcode(barcode: string): Promise<{
    isValid: boolean;
    country: string;
    format: string;
  }>;
  function processPayment(paymentData: any): Promise<{
    success: boolean;
    transactionId: string;
  }>;
  function generateReceipt(receiptData: any): Promise<{
    content: string;
    textDirection: string;
  }>;
  function calculateSale(items: any[]): {
    subtotal: number;
    vatAmount: number;
    total: number;
  };
  function getAvailablePaymentMethods(): Promise<string[]>;
  function getWindowsVersion(): Promise<{
    major: number;
    minor: number;
    version: string;
  }>;
  function getDotNetVersions(): Promise<Array<{
    version: string;
    installed: boolean;
  }>>;

  // Window extensions for testing
  interface Window {
    electronAPI: {
      platform: string;
      version: string;
      database: {
        findByBarcode: jest.Mock;
        searchProducts: jest.Mock;
        createTransaction: jest.Mock;
      };
      hardware: {
        simulateBarcodeScan: jest.Mock;
        scanner: {
          connect: jest.Mock;
          scan: jest.Mock;
        };
        printer: {
          connect: jest.Mock;
          print: jest.Mock;
        };
      };
    };
  }
}

export {};
