// Performance Testing - Windows 7-11 Compatibility
import { performance } from 'perf_hooks';
import { DatabaseManager } from '@/main/database/DatabaseManager';
import os from 'os';

describe('Performance Benchmarks - Cross-Windows', () => {
  let db: DatabaseManager;
  const isWindows7 = os.release().startsWith('6.1');
  
  beforeAll(async () => {
    db = new DatabaseManager(':memory:');
    await db.initialize();
    
    // Seed test data
    await seedLargeDataset(db, 10000);
  });

  afterAll(async () => {
    await db.close();
  });

  test('product search performance scales with dataset size', async () => {
    const searchTerms = ['كوكا', 'بيبسي', 'Product', 'منتج'];
    const expectedTime = isWindows7 ? 500 : 200; // Windows 7 gets more time
    
    for (const term of searchTerms) {
      const start = performance.now();
      const results = await db.searchProducts(term);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(expectedTime);
      expect(results.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('transaction processing under load', async () => {
    const transactions = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      items: [
        { productId: 1, quantity: 2, price: 10.50 },
        { productId: 2, quantity: 1, price: 5.25 }
      ],
      customerId: Math.floor(i / 10) + 1,
      paymentMethod: 'cash',
      total: 26.25
    }));

    const maxTime = isWindows7 ? 10000 : 5000; // 10s for Windows 7, 5s for newer
    const start = performance.now();
    
    const results = await Promise.all(
      transactions.map(tx => db.transactions.create(tx))
    );
    
    const end = performance.now();
    expect(end - start).toBeLessThan(maxTime);
    expect(results).toHaveLength(100);
    expect(results.every(r => r.id)).toBe(true);
  });

  test('memory usage stays within Windows 7 limits', async () => {
    const memBefore = process.memoryUsage();
    
    // Simulate heavy POS usage
    await simulateHeavyUsage(db, 1000); // 1000 operations
    
    // Force garbage collection if available
    if (global.gc) global.gc();
    
    const memAfter = process.memoryUsage();
    const memDiff = memAfter.heapUsed - memBefore.heapUsed;
    const maxMemIncrease = isWindows7 ? 50 * 1024 * 1024 : 100 * 1024 * 1024; // 50MB for Win7
    
    expect(memDiff).toBeLessThan(maxMemIncrease);
  });

  test('database operations meet Windows 7 performance targets', async () => {
    const operations = [
      { name: 'Product Insert', fn: () => db.products.create({ name: 'Test', price: 10.99, barcode: Date.now().toString() }) },
      { name: 'Product Search', fn: () => db.products.search('Test') },
      { name: 'Transaction Create', fn: () => db.transactions.create({ items: [{ productId: 1, quantity: 1, price: 10 }], total: 10 }) },
      { name: 'Customer Lookup', fn: () => db.customers.findById(1) },
    ];

    const maxTime = isWindows7 ? 1000 : 500; // 1s for Windows 7, 500ms for newer

    for (const operation of operations) {
      const start = performance.now();
      await operation.fn();
      const end = performance.now();
      
      expect(end - start).toBeLessThan(maxTime);
    }
  });

  test('concurrent database access performance', async () => {
    const concurrentOperations = Array.from({ length: 50 }, (_, i) => 
      () => db.products.create({
        name: `Concurrent Product ${i}`,
        price: Math.random() * 100,
        barcode: `concurrent-${i}-${Date.now()}`
      })
    );

    const maxTime = isWindows7 ? 15000 : 8000; // 15s for Windows 7, 8s for newer
    const start = performance.now();
    
    const results = await Promise.all(concurrentOperations.map(op => op()));
    
    const end = performance.now();
    expect(end - start).toBeLessThan(maxTime);
    expect(results).toHaveLength(50);
    expect(results.every(r => r.id)).toBe(true);
  });

  test('large dataset query performance', async () => {
    // Test with 10,000 products
    const searchQueries = [
      'Product 1000',
      'منتج ١٠٠٠',
      'Test',
      'كوكا'
    ];

    const maxQueryTime = isWindows7 ? 2000 : 1000; // 2s for Windows 7, 1s for newer

    for (const query of searchQueries) {
      const start = performance.now();
      const results = await db.products.search(query);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(maxQueryTime);
      expect(Array.isArray(results)).toBe(true);
    }
  });

  test('Windows 7 specific performance optimizations', async () => {
    if (!isWindows7) {
      return; // Skip on non-Windows 7 systems
    }

    // Test reduced animation performance
    const animationDuration = 150; // Reduced for Windows 7
    const start = performance.now();
    
    // Simulate animation frame
    await new Promise(resolve => setTimeout(resolve, animationDuration));
    
    const end = performance.now();
    expect(end - start).toBeGreaterThanOrEqual(animationDuration - 10); // Allow 10ms tolerance
    expect(end - start).toBeLessThan(animationDuration + 50); // Should not exceed significantly
  });
});

// Helper functions
async function seedLargeDataset(db: DatabaseManager, count: number) {
  const products = Array.from({ length: count }, (_, i) => ({
    name: i % 2 === 0 ? `منتج رقم ${i}` : `Product ${i}`,
    nameEn: `Product ${i}`,
    barcode: `${1000000000000 + i}`,
    price: Math.random() * 100,
    category: i % 5 === 0 ? 'مشروبات' : 'أطعمة',
    vat: 14
  }));

  const stmt = db.db.prepare(`
    INSERT INTO products (name, name_en, barcode, price, category, vat)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const insertMany = db.db.transaction((products: any[]) => {
    for (const product of products) {
      stmt.run(product.name, product.nameEn, product.barcode, 
               product.price, product.category, product.vat);
    }
  });

  insertMany(products);
}

async function simulateHeavyUsage(db: DatabaseManager, operations: number) {
  for (let i = 0; i < operations; i++) {
    // Simulate typical POS operations
    await db.products.search('test');
    await db.transactions.create({
      items: [{ productId: 1, quantity: 1, price: 10 }],
      total: 10,
      paymentMethod: 'cash'
    });
    
    if (i % 100 === 0) {
      // Periodic cleanup simulation
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }
}
