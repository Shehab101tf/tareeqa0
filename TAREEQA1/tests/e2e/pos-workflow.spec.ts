// Complete POS Workflow E2E Test - Electron 21.x Compatible
import { test, expect, ElectronApplication, Page, _electron } from '@playwright/test';
import path from 'path';

let electronApp: ElectronApplication;
let page: Page;

test.describe('Complete POS Workflow - Egyptian Market', () => {
  test.beforeAll(async () => {
    // Launch Electron app with Electron 21.x
    electronApp = await _electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        NODE_ENV: 'test',
        ELECTRON_IS_TEST: '1',
        TEST_DATABASE_PATH: path.join(__dirname, '../../test-results/test.db')
      }
    });
    
    // Get the first BrowserWindow
    page = await electronApp.firstWindow();
    
    // Wait for app to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('should complete full sale transaction with Arabic products', async () => {
    // Navigate to POS screen
    await page.click('[data-testid="pos-menu"]');
    await page.waitForSelector('[data-testid="pos-interface"]');

    // Switch to Arabic interface
    await page.click('[data-testid="language-toggle"]');
    await page.waitForSelector('[dir="rtl"]');
    
    // Verify Arabic interface
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('[data-testid="main-title"]')).toContainText('نقطة البيع');

    // Search for Arabic product
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('كوكا كولا');
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForSelector('[data-testid="product-grid"] .product-card');
    
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
    
    // Verify cart update with Egyptian currency
    const cartTotal = page.locator('[data-testid="cart-total"]');
    await expect(cartTotal).toContainText('ج.م'); // Egyptian Pound symbol
    
    // Adjust quantity
    const quantityInput = page.locator('[data-testid="quantity-input"]');
    await quantityInput.fill('2');
    await page.keyboard.press('Tab');
    
    // Apply discount (Egyptian business practice)
    await page.click('[data-testid="apply-discount"]');
    await page.fill('[data-testid="discount-amount"]', '10');
    await page.click('[data-testid="percentage-discount"]');
    await page.click('[data-testid="confirm-discount"]');
    
    // Verify VAT calculation (14% Egyptian rate)
    const vatAmount = page.locator('[data-testid="vat-amount"]');
    await expect(vatAmount).toContainText('14%');
    
    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    
    // Select cash payment (most common in Egypt)
    await page.click('[data-testid="cash-payment"]');
    
    // Enter cash amount
    await page.fill('[data-testid="cash-amount"]', '25');
    
    // Complete sale
    await page.click('[data-testid="complete-sale"]');
    
    // Wait for sale completion
    await page.waitForSelector('[data-testid="sale-complete"]', { timeout: 5000 });
    
    // Verify receipt preview with Arabic text
    const receiptPreview = page.locator('[data-testid="receipt-preview"]');
    await expect(receiptPreview).toBeVisible();
    await expect(receiptPreview).toContainText('كوكا كولا');
    await expect(receiptPreview).toContainText('ضريبة القيمة المضافة'); // VAT in Arabic
    await expect(receiptPreview).toContainText('شكراً لزيارتكم'); // Thank you message
    
    // Test print functionality
    await page.click('[data-testid="print-receipt"]');
    
    // Verify print status
    const printStatus = page.locator('[data-testid="print-status"]');
    await expect(printStatus).toContainText('تم الطباعة'); // Printed successfully
  });

  test('should handle barcode scanning workflow', async () => {
    // Navigate to POS screen
    await page.click('[data-testid="pos-menu"]');
    
    // Focus on barcode input
    await page.click('[data-testid="barcode-input"]');
    
    // Simulate barcode scan (Egyptian EAN-13 format)
    const egyptianBarcode = '6224000123456';
    await page.fill('[data-testid="barcode-input"]', egyptianBarcode);
    await page.keyboard.press('Enter');
    
    // Verify product lookup
    await page.waitForSelector('[data-testid="product-found"]');
    const productName = page.locator('[data-testid="product-name"]');
    await expect(productName).toBeVisible();
    
    // Verify Egyptian barcode validation
    const barcodeStatus = page.locator('[data-testid="barcode-status"]');
    await expect(barcodeStatus).toContainText('صالح'); // Valid in Arabic
  });

  test('should support multiple payment methods (Egyptian market)', async () => {
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
    await page.click('[data-testid="checkout-button"]');
    
    // Test cash payment
    await page.click('[data-testid="cash-payment"]');
    await expect(page.locator('[data-testid="payment-method"]')).toContainText('نقدي');
    
    // Test Visa payment
    await page.click('[data-testid="visa-payment"]');
    await expect(page.locator('[data-testid="payment-method"]')).toContainText('فيزا');
    
    // Test Meeza payment (Egyptian national network)
    await page.click('[data-testid="meeza-payment"]');
    await expect(page.locator('[data-testid="payment-method"]')).toContainText('ميزة');
    
    // Test bank transfer
    await page.click('[data-testid="bank-transfer-payment"]');
    await expect(page.locator('[data-testid="payment-method"]')).toContainText('تحويل بنكي');
  });

  test('should handle returns and exchanges workflow', async () => {
    // Navigate to returns screen
    await page.click('[data-testid="returns-menu"]');
    await page.waitForSelector('[data-testid="returns-interface"]');
    
    // Enter receipt number
    await page.fill('[data-testid="receipt-number"]', 'RCP-123456789');
    await page.click('[data-testid="lookup-receipt"]');
    
    // Wait for receipt lookup
    await page.waitForSelector('[data-testid="receipt-items"]');
    
    // Select item for return
    await page.click('[data-testid="return-item"]:first-child');
    
    // Select return reason
    await page.selectOption('[data-testid="return-reason"]', 'defective');
    
    // Process return
    await page.click('[data-testid="process-return"]');
    
    // Verify return completion
    await page.waitForSelector('[data-testid="return-complete"]');
    await expect(page.locator('[data-testid="return-status"]')).toContainText('تم الإرجاع بنجاح');
  });

  test('should display inventory alerts in Arabic', async () => {
    // Navigate to inventory screen
    await page.click('[data-testid="inventory-menu"]');
    await page.waitForSelector('[data-testid="inventory-interface"]');
    
    // Check for low stock alerts
    const lowStockAlert = page.locator('[data-testid="low-stock-alert"]');
    if (await lowStockAlert.isVisible()) {
      await expect(lowStockAlert).toContainText('مخزون منخفض');
    }
    
    // Check for out of stock alerts
    const outOfStockAlert = page.locator('[data-testid="out-of-stock-alert"]');
    if (await outOfStockAlert.isVisible()) {
      await expect(outOfStockAlert).toContainText('غير متوفر');
    }
  });

  test('should generate daily sales report in Arabic', async () => {
    // Navigate to reports screen
    await page.click('[data-testid="reports-menu"]');
    await page.waitForSelector('[data-testid="reports-interface"]');
    
    // Select daily sales report
    await page.click('[data-testid="daily-sales-report"]');
    
    // Set date range
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="start-date"]', today);
    await page.fill('[data-testid="end-date"]', today);
    
    // Generate report
    await page.click('[data-testid="generate-report"]');
    
    // Wait for report generation
    await page.waitForSelector('[data-testid="report-content"]');
    
    // Verify Arabic report content
    const reportContent = page.locator('[data-testid="report-content"]');
    await expect(reportContent).toContainText('تقرير المبيعات اليومية');
    await expect(reportContent).toContainText('إجمالي المبيعات');
    await expect(reportContent).toContainText('عدد المعاملات');
  });

  test('should handle Windows 7 compatibility mode', async () => {
    // Simulate Windows 7 environment
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko'
      });
      
      // Mock Windows 7 environment variables
      (window as any).electronAPI = {
        ...((window as any).electronAPI || {}),
        platform: 'win32',
        windowsVersion: '6.1'
      };
    });

    // Reload page to apply changes
    await page.reload();
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Test glass effects fallback
    const glassCards = page.locator('.glass-card');
    const firstCard = glassCards.first();
    
    // Should use fallback styling for Windows 7
    const backgroundColor = await firstCard.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).toContain('rgba'); // Should have fallback background
    
    // Test animation performance (should be reduced for Windows 7)
    await firstCard.hover();
    const transform = await firstCard.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    expect(transform).not.toBe('none'); // Hover animation should still work
  });

  test('should support Arabic keyboard input', async () => {
    // Navigate to customer management
    await page.click('[data-testid="customers-menu"]');
    await page.waitForSelector('[data-testid="add-customer"]');
    await page.click('[data-testid="add-customer"]');
    
    // Test Arabic name input
    const nameInput = page.locator('[data-testid="customer-name"]');
    await nameInput.fill('أحمد محمد علي');
    await expect(nameInput).toHaveValue('أحمد محمد علي');
    
    // Test mixed Arabic/English input
    const addressInput = page.locator('[data-testid="customer-address"]');
    await addressInput.fill('شارع التحرير، القاهرة، مصر');
    await expect(addressInput).toHaveValue('شارع التحرير، القاهرة، مصر');
    
    // Verify RTL text alignment
    const textAlign = await nameInput.evaluate(el => 
      window.getComputedStyle(el).textAlign
    );
    expect(textAlign).toBe('right');
  });

  test('should validate Egyptian business rules', async () => {
    // Test VAT calculation accuracy
    await page.click('[data-testid="pos-menu"]');
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
    
    // Get product price
    const productPrice = await page.locator('[data-testid="product-price"]').textContent();
    const price = parseFloat(productPrice?.replace(/[^\d.]/g, '') || '0');
    
    // Verify VAT calculation (14%)
    const vatAmount = await page.locator('[data-testid="vat-amount"]').textContent();
    const vat = parseFloat(vatAmount?.replace(/[^\d.]/g, '') || '0');
    const expectedVat = Math.round(price * 0.14 * 100) / 100;
    
    expect(Math.abs(vat - expectedVat)).toBeLessThan(0.01); // Allow for rounding
    
    // Test Egyptian Pound formatting
    const totalAmount = page.locator('[data-testid="total-amount"]');
    await expect(totalAmount).toContainText('ج.م');
  });
});
