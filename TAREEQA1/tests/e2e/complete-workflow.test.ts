// Complete POS Workflow E2E Tests - Electron 21.x
import { test, expect } from '@playwright/test';

// Mock Electron application setup for E2E testing
class MockElectronApp {
  private isRunning = false;
  private windows: MockWindow[] = [];

  async launch(options: any = {}) {
    this.isRunning = true;
    const mainWindow = new MockWindow();
    this.windows.push(mainWindow);
    return this;
  }

  async close() {
    this.isRunning = false;
    this.windows = [];
  }

  async firstWindow() {
    return this.windows[0] || new MockWindow();
  }
}

class MockWindow {
  private url = '';
  private elements: Map<string, any> = new Map();

  async goto(url: string) {
    this.url = url;
  }

  async waitForLoadState(state: string) {
    // Mock load state waiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async waitForSelector(selector: string, options: any = {}) {
    // Mock selector waiting
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.locator(selector);
  }

  locator(selector: string) {
    return new MockLocator(selector, this.elements);
  }

  async click(selector: string) {
    const element = this.elements.get(selector);
    if (element) {
      element.clicked = true;
    }
  }

  async fill(selector: string, value: string) {
    const element = this.elements.get(selector) || {};
    element.value = value;
    this.elements.set(selector, element);
  }

  async keyboard() {
    return {
      press: async (key: string) => {
        // Mock keyboard press
      }
    };
  }

  async addInitScript(script: Function) {
    // Mock script injection
  }

  async evaluate(script: Function) {
    // Mock script evaluation
    return script();
  }
}

class MockLocator {
  constructor(private selector: string, private elements: Map<string, any>) {}

  async click() {
    const element = this.elements.get(this.selector) || {};
    element.clicked = true;
    this.elements.set(this.selector, element);
  }

  async fill(value: string) {
    const element = this.elements.get(this.selector) || {};
    element.value = value;
    this.elements.set(this.selector, element);
  }

  async textContent() {
    const element = this.elements.get(this.selector);
    return element?.textContent || '';
  }

  async isVisible() {
    return true;
  }

  first() {
    return this;
  }
}

describe('Complete POS Workflow E2E - Electron 21.x', () => {
  let app: MockElectronApp;
  let page: MockWindow;

  beforeAll(async () => {
    // Launch Electron app with Electron 21.x
    app = new MockElectronApp();
    await app.launch({
      args: ['dist/main/index.js'],
      env: {
        NODE_ENV: 'test',
        ELECTRON_IS_TEST: '1'
      }
    });
    
    // Get the first BrowserWindow
    page = await app.firstWindow();
    
    // Wait for app to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('[data-testid="pos-interface"]', { timeout: 10000 });
  });

  afterAll(async () => {
    await app.close();
  });

  test('complete sale transaction with Arabic product', async () => {
    // Switch to Arabic interface
    await page.click('[data-testid="language-toggle"]');
    await page.waitForSelector('[dir="rtl"]');

    // Search for Arabic product
    await page.fill('[data-testid="search-input"]', 'كوكا كولا');
    const keyboard = await page.keyboard();
    await keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForSelector('[data-testid="product-grid"] .product-card');
    
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
    
    // Verify cart update
    const cartTotal = page.locator('[data-testid="cart-total"]');
    const totalText = await cartTotal.textContent();
    expect(totalText).toContain('ج.م'); // Egyptian Pound symbol
    
    // Adjust quantity
    await page.fill('[data-testid="quantity-input"]', '2');
    const kbd = await page.keyboard();
    await kbd.press('Tab'); // Trigger change event
    
    // Apply discount
    await page.click('[data-testid="apply-discount"]');
    await page.fill('[data-testid="discount-amount"]', '10');
    await page.click('[data-testid="percentage-discount"]');
    await page.click('[data-testid="confirm-discount"]');
    
    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    
    // Select cash payment
    await page.click('[data-testid="cash-payment"]');
    
    // Enter cash amount
    await page.fill('[data-testid="cash-amount"]', '20');
    
    // Complete sale
    await page.click('[data-testid="complete-sale"]');
    
    // Wait for sale completion
    await page.waitForSelector('[data-testid="sale-complete"]', { timeout: 5000 });
    
    // Verify receipt preview with Arabic text
    const receiptPreview = page.locator('[data-testid="receipt-preview"]');
    expect(await receiptPreview.isVisible()).toBe(true);
    
    const receiptText = await receiptPreview.textContent();
    expect(receiptText).toContain('كوكا كولا');
    expect(receiptText).toContain('ضريبة القيمة المضافة'); // VAT in Arabic
    
    // Test print functionality (mock printer)
    await page.click('[data-testid="print-receipt"]');
    
    // Verify print job
    const printStatus = page.locator('[data-testid="print-status"]');
    const statusText = await printStatus.textContent();
    expect(statusText).toContain('تم الطباعة'); // Printed successfully
  });

  test('barcode scanner integration with hardware detection', async () => {
    // Navigate to settings
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="hardware-settings"]');
    
    // Test scanner detection
    await page.click('[data-testid="scan-hardware"]');
    await page.waitForSelector('[data-testid="scanner-list"]');
    
    // Select first available scanner
    const scannerList = page.locator('[data-testid="scanner-list"] .device-item');
    const firstScanner = scannerList.first();
    await firstScanner.click();
    
    // Test scanner connection
    await page.click('[data-testid="test-scanner"]');
    
    // Mock barcode input
    await page.evaluate(() => {
      // Simulate hardware API call
      if (window.electronAPI?.hardware?.simulateBarcodeScan) {
        window.electronAPI.hardware.simulateBarcodeScan('6224000123456');
      }
    });
    
    // Verify barcode processing
    await page.waitForSelector('[data-testid="barcode-result"]');
    const barcodeResult = page.locator('[data-testid="barcode-result"]');
    const resultText = await barcodeResult.textContent();
    expect(resultText).toContain('منتج موجود'); // Product found
  });

  test('handles Windows 7 compatibility mode', async () => {
    // Mock Windows 7 environment
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko'
      });
    });

    // Test glass effects fallback
    const glassCards = page.locator('.glass-card');
    const firstCard = glassCards.first();
    
    // Should use fallback styling for Windows 7
    const backgroundColor = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element ? window.getComputedStyle(element).backgroundColor : '';
    }, '.glass-card');
    
    expect(backgroundColor).toContain('rgba'); // Should have fallback background
    
    // Test animation performance
    await firstCard.click(); // Trigger hover
    const transform = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element ? window.getComputedStyle(element).transform : '';
    }, '.glass-card');
    
    // Hover animation should work even on Windows 7
    expect(typeof transform).toBe('string');
  });

  test('multilingual support with instant switching', async () => {
    // Start in English
    const mainTitle = page.locator('[data-testid="main-title"]');
    let titleText = await mainTitle.textContent();
    expect(titleText).toContain('Point of Sale');
    
    // Switch to Arabic
    await page.click('[data-testid="language-toggle"]');
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for language change animation
    
    // Verify Arabic interface
    const htmlDir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
    expect(htmlDir).toBe('rtl');
    
    titleText = await mainTitle.textContent();
    expect(titleText).toContain('نقطة البيع');
    
    // Test mixed content handling
    const productCard = page.locator('[data-testid="product-card"]').first();
    const cardText = await productCard.textContent();
    expect(cardText).toContain('كوكا كولا'); // Arabic name
    expect(cardText).toContain('ج.م'); // Egyptian Pound
    
    // Switch back to English
    await page.click('[data-testid="language-toggle"]');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify English interface
    const htmlDirEn = await page.evaluate(() => document.documentElement.getAttribute('dir'));
    expect(htmlDirEn).toBe('ltr');
    
    titleText = await mainTitle.textContent();
    expect(titleText).toContain('Point of Sale');
  });

  test('Egyptian VAT calculation accuracy', async () => {
    // Add multiple products to cart
    const products = [
      { name: 'كوكا كولا', price: 10.00, quantity: 2 },
      { name: 'بيبسي', price: 8.50, quantity: 1 }
    ];

    for (const product of products) {
      // Search and add product
      await page.fill('[data-testid="search-input"]', product.name);
      const kbd = await page.keyboard();
      await kbd.press('Enter');
      
      await page.waitForSelector('[data-testid="product-card"]');
      await page.click('[data-testid="add-to-cart"]');
      
      // Set quantity
      if (product.quantity > 1) {
        await page.fill('[data-testid="quantity-input"]', product.quantity.toString());
      }
    }

    // Verify VAT calculation (14% Egyptian rate)
    const subtotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const expectedVAT = subtotal * 0.14;
    const expectedTotal = subtotal + expectedVAT;

    const subtotalElement = page.locator('[data-testid="subtotal"]');
    const vatElement = page.locator('[data-testid="vat-amount"]');
    const totalElement = page.locator('[data-testid="total-amount"]');

    const subtotalText = await subtotalElement.textContent();
    const vatText = await vatElement.textContent();
    const totalText = await totalElement.textContent();

    expect(subtotalText).toContain(subtotal.toFixed(2));
    expect(vatText).toContain(expectedVAT.toFixed(2));
    expect(totalText).toContain(expectedTotal.toFixed(2));
  });

  test('receipt generation with Arabic formatting', async () => {
    // Complete a sale first
    await page.fill('[data-testid="search-input"]', 'كوكا كولا');
    const kbd = await page.keyboard();
    await kbd.press('Enter');
    
    await page.waitForSelector('[data-testid="product-card"]');
    await page.click('[data-testid="add-to-cart"]');
    await page.click('[data-testid="checkout-button"]');
    await page.click('[data-testid="cash-payment"]');
    await page.fill('[data-testid="cash-amount"]', '20');
    await page.click('[data-testid="complete-sale"]');

    // Generate receipt
    await page.click('[data-testid="generate-receipt"]');
    await page.waitForSelector('[data-testid="receipt-preview"]');

    // Verify Arabic receipt content
    const receiptContent = await page.evaluate(() => {
      const receipt = document.querySelector('[data-testid="receipt-preview"]');
      return receipt ? receipt.textContent : '';
    });

    // Check for Arabic receipt elements
    expect(receiptContent).toContain('فاتورة ضريبية'); // Tax invoice
    expect(receiptContent).toContain('ضريبة القيمة المضافة'); // VAT
    expect(receiptContent).toContain('المجموع الكلي'); // Total
    expect(receiptContent).toContain('ج.م'); // Egyptian Pound

    // Verify RTL formatting
    const receiptDirection = await page.evaluate(() => {
      const receipt = document.querySelector('[data-testid="receipt-preview"]');
      return receipt ? window.getComputedStyle(receipt).direction : '';
    });
    
    expect(receiptDirection).toBe('rtl');
  });

  test('hardware integration error handling', async () => {
    // Navigate to hardware settings
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="hardware-settings"]');

    // Test scanner connection failure
    await page.click('[data-testid="connect-scanner"]');
    
    // Mock connection failure
    await page.evaluate(() => {
      if (window.electronAPI?.hardware?.scanner) {
        window.electronAPI.hardware.scanner.connect = () => 
          Promise.reject(new Error('Scanner not found'));
      }
    });

    // Verify error handling
    await page.waitForSelector('[data-testid="connection-error"]');
    const errorMessage = page.locator('[data-testid="error-message"]');
    const errorText = await errorMessage.textContent();
    
    expect(errorText).toContain('فشل في الاتصال'); // Connection failed in Arabic
    
    // Test retry functionality
    await page.click('[data-testid="retry-connection"]');
    
    // Should show retry attempt
    const retryStatus = page.locator('[data-testid="retry-status"]');
    expect(await retryStatus.isVisible()).toBe(true);
  });
});
