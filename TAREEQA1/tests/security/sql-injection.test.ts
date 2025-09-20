// SQL Injection Prevention Tests - Electron 21.x
import { DatabaseManager } from '@/main/database/DatabaseManager';
import path from 'path';
import os from 'os';

describe('SQL Injection Prevention - Electron 21.x', () => {
  let db: DatabaseManager;
  let testDbPath: string;

  beforeEach(async () => {
    // Create test database in temp directory (Windows 7+ compatible)
    testDbPath = path.join(os.tmpdir(), `test-security-${Date.now()}.db`);
    db = new DatabaseManager(testDbPath);
    await db.initialize();
  });

  afterEach(async () => {
    await db.close();
    // Cleanup test database file
    try {
      require('fs').unlinkSync(testDbPath);
    } catch (e) {
      // File may already be deleted
    }
  });

  test('prevents SQL injection in product search', async () => {
    const maliciousInput = "'; DROP TABLE products; --";
    
    // Should not execute SQL, only search for literal string
    const result = await db.searchProducts(maliciousInput);
    
    expect(result).toEqual([]);
    // Verify table still exists
    const tableCheck = await db.raw("SELECT name FROM sqlite_master WHERE type='table' AND name='products'");
    expect(tableCheck).toHaveLength(1);
  });

  test('sanitizes Arabic input with special characters', async () => {
    const arabicInput = "منتج'; DROP TABLE --";
    
    const result = await db.searchProducts(arabicInput);
    expect(result).toEqual([]); // No matches, but no error
    
    // Should handle Arabic quotes and dashes safely
    const safeArabicInput = "منتج «عادي»";
    const safeResult = await db.searchProducts(safeArabicInput);
    expect(Array.isArray(safeResult)).toBe(true);
  });

  test('prevents injection in customer data fields', async () => {
    const maliciousCustomer = {
      name: "Ahmed'; DELETE FROM customers; --",
      email: "test@example.com",
      phone: "01012345678"
    };

    const result = await db.customers.create(maliciousCustomer);
    
    // Customer should be created with escaped name
    expect(result.id).toBeDefined();
    expect(result.name).toBe("Ahmed'; DELETE FROM customers; --"); // Literal string stored
    
    // Verify customers table still exists and has data
    const customers = await db.customers.findAll();
    expect(customers.length).toBeGreaterThan(0);
  });

  test('handles parameterized queries correctly', async () => {
    // Insert test product
    const product = await db.products.create({
      name: 'Test Product',
      price: 10.99,
      barcode: '123456789012'
    });

    // Test parameterized search
    const searchResult = await db.products.findByBarcode('123456789012');
    expect(searchResult?.id).toBe(product.id);

    // Test with potential injection in barcode
    const maliciousBarcode = "123456789012'; DROP TABLE products; --";
    const injectionResult = await db.products.findByBarcode(maliciousBarcode);
    expect(injectionResult).toBeNull(); // No match, but no error
  });

  test('validates input types and lengths', async () => {
    const invalidInputs = [
      { name: 'A'.repeat(1000), price: 10.99 }, // Too long name
      { name: 'Valid Product', price: 'invalid' }, // Invalid price type
      { name: null, price: 10.99 }, // Null name
      { name: '', price: -10.99 }, // Negative price
    ];

    for (const input of invalidInputs) {
      await expect(db.products.create(input as any)).rejects.toThrow();
    }
  });

  test('escapes special characters in report parameters', async () => {
    const maliciousDateRange = {
      startDate: "2023-01-01'; DROP TABLE transactions; --",
      endDate: "2023-12-31"
    };

    // Should handle malicious date input safely
    const report = await db.reports.getSalesReport(maliciousDateRange);
    expect(Array.isArray(report)).toBe(true);
    
    // Verify transactions table still exists
    const tableCheck = await db.raw("SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'");
    expect(tableCheck).toHaveLength(1);
  });
});
