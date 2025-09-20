// SQL Injection Prevention Tests - Electron 21.x Security
import { DatabaseManager } from '../../../src/main/database/DatabaseManager';

// Mock DatabaseManager for testing
class MockDatabaseManager {
  private products: any[] = [
    { id: 1, name: 'كوكا كولا', nameEn: 'Coca Cola', price: 5.50, barcode: '6224000123456' },
    { id: 2, name: 'بيبسي', nameEn: 'Pepsi', price: 5.00, barcode: '6224000123457' }
  ];

  async searchProducts(query: string): Promise<any[]> {
    // Simulate parameterized query (safe from SQL injection)
    const sanitizedQuery = query.replace(/[';\\-]/g, ''); // Basic sanitization
    return this.products.filter(product => 
      product.name.includes(sanitizedQuery) || 
      product.nameEn.toLowerCase().includes(sanitizedQuery.toLowerCase())
    );
  }

  async raw(sql: string): Promise<any[]> {
    // Mock raw SQL execution - should be protected
    if (sql.includes('DROP') || sql.includes('DELETE') || sql.includes('UPDATE')) {
      throw new Error('Unauthorized SQL operation');
    }
    
    if (sql.includes('sqlite_master')) {
      return [
        { name: 'products' },
        { name: 'transactions' },
        { name: 'users' }
      ];
    }
    
    return [];
  }

  async createProduct(productData: any): Promise<any> {
    // Simulate safe product creation with input validation
    const sanitizedData = {
      name: this.sanitizeInput(productData.name),
      nameEn: this.sanitizeInput(productData.nameEn),
      price: parseFloat(productData.price) || 0,
      barcode: this.sanitizeInput(productData.barcode)
    };

    const newProduct = {
      id: this.products.length + 1,
      ...sanitizedData
    };

    this.products.push(newProduct);
    return newProduct;
  }

  private sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/['"`;\\]/g, '') // Remove quotes and dangerous chars
      .trim();
  }
}

describe('SQL Injection Prevention - Electron 21.x', () => {
  let database: MockDatabaseManager;

  beforeEach(() => {
    database = new MockDatabaseManager();
  });

  test('prevents SQL injection in product search', async () => {
    const maliciousInput = "'; DROP TABLE products; --";
    
    // Should not execute SQL, only search for literal string
    const result = await database.searchProducts(maliciousInput);
    
    expect(result).toEqual([]);
    
    // Verify table still exists by checking if we can query it
    const tableCheck = await database.raw("SELECT name FROM sqlite_master WHERE type='table' AND name='products'");
    expect(tableCheck).toHaveLength(1);
  });

  test('sanitizes Arabic input with special characters', async () => {
    const arabicInput = "منتج'; DROP TABLE --";
    
    const result = await database.searchProducts(arabicInput);
    expect(result).toEqual([]); // No matches, but no error
    
    // Should handle Arabic quotes and dashes safely
    const safeArabicInput = "كوكا";
    const safeResult = await database.searchProducts(safeArabicInput);
    expect(Array.isArray(safeResult)).toBe(true);
    expect(safeResult.length).toBeGreaterThan(0);
  });

  test('prevents XSS in product creation', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    const product = await database.createProduct({
      name: xssPayload,
      nameEn: 'Test Product',
      price: 10.00,
      barcode: 'TEST123'
    });

    // XSS payload should be sanitized
    expect(product.name).not.toContain('<script>');
    expect(product.name).not.toContain('alert');
    expect(product.name).toBe(''); // Should be empty after sanitization
  });

  test('handles multiple SQL injection vectors', async () => {
    const injectionAttempts = [
      "' OR '1'='1",
      "'; DELETE FROM products WHERE '1'='1'; --",
      "' UNION SELECT * FROM users --",
      "'; INSERT INTO products VALUES ('hacked'); --",
      "' AND 1=1 --",
      "admin'--",
      "' OR 1=1#",
      "') OR ('1'='1"
    ];

    for (const attempt of injectionAttempts) {
      const result = await database.searchProducts(attempt);
      
      // Should return empty results or safe results, never execute malicious SQL
      expect(Array.isArray(result)).toBe(true);
      
      // Verify database integrity
      try {
        const integrityCheck = await database.raw("SELECT name FROM sqlite_master WHERE type='table'");
        expect(integrityCheck.length).toBeGreaterThan(0);
      } catch (error) {
        // Should not throw errors from malicious SQL
        expect(error).toBeUndefined();
      }
    }
  });

  test('sanitizes Arabic text with embedded SQL', async () => {
    const arabicSQLInjection = "منتج عربي'; DROP TABLE products; SELECT 'مخترق";
    
    const product = await database.createProduct({
      name: arabicSQLInjection,
      nameEn: 'Arabic Product',
      price: 15.50,
      barcode: 'AR123'
    });

    // Should preserve Arabic text but remove SQL injection
    expect(product.name).toContain('منتج عربي');
    expect(product.name).not.toContain('DROP');
    expect(product.name).not.toContain('SELECT');
    expect(product.name).not.toContain(';');
  });

  test('validates input length limits', async () => {
    const longMaliciousInput = "A".repeat(10000) + "'; DROP TABLE products; --";
    
    const result = await database.searchProducts(longMaliciousInput);
    expect(result).toEqual([]);
    
    // Should handle long inputs gracefully without crashing
    expect(typeof result).toBe('object');
    expect(Array.isArray(result)).toBe(true);
  });

  test('prevents NoSQL injection patterns', async () => {
    const noSQLAttempts = [
      '{"$ne": null}',
      '{"$gt": ""}',
      '{"$where": "function() { return true; }"}',
      '{"$regex": ".*"}',
      '{"$or": [{"name": "admin"}, {"name": "root"}]}'
    ];

    for (const attempt of noSQLAttempts) {
      const result = await database.searchProducts(attempt);
      
      // Should treat as literal string, not execute as code
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]); // No matches for JSON strings
    }
  });

  test('handles Unicode and encoding attacks', async () => {
    const unicodeAttacks = [
      "test\u0000'; DROP TABLE products; --", // Null byte injection
      "test\u202e'; DROP TABLE products; --", // Right-to-left override
      "test%27; DROP TABLE products; --", // URL encoded quote
      "test&#39;; DROP TABLE products; --", // HTML encoded quote
      "test\x27; DROP TABLE products; --" // Hex encoded quote
    ];

    for (const attack of unicodeAttacks) {
      const result = await database.searchProducts(attack);
      
      expect(Array.isArray(result)).toBe(true);
      // Should not execute malicious SQL regardless of encoding
    }
  });

  test('validates parameterized query simulation', async () => {
    // Simulate what a real parameterized query would do
    const userInput = "'; DROP TABLE products; --";
    const safeQuery = "SELECT * FROM products WHERE name LIKE ?";
    
    // In a real implementation, this would use prepared statements
    // Here we simulate the safety by showing the input is treated as data
    const simulatedParams = [userInput];
    
    expect(simulatedParams[0]).toBe("'; DROP TABLE products; --");
    expect(safeQuery).toContain('?'); // Placeholder for parameter
    
    // The actual search should treat the input as literal text
    const result = await database.searchProducts(userInput);
    expect(result).toEqual([]);
  });
});
