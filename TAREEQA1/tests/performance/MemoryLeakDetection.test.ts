// Memory Leak Detection Tests - Electron 21.x Performance
import { performance } from 'perf_hooks';

// Mock memory monitoring utilities
class MemoryMonitor {
  private initialMemory: NodeJS.MemoryUsage;
  private samples: NodeJS.MemoryUsage[] = [];
  private startTime: number;

  constructor() {
    this.initialMemory = process.memoryUsage();
    this.startTime = performance.now();
  }

  takeSample(): NodeJS.MemoryUsage {
    const sample = process.memoryUsage();
    this.samples.push(sample);
    return sample;
  }

  getMemoryGrowth(): number {
    const current = process.memoryUsage();
    return current.heapUsed - this.initialMemory.heapUsed;
  }

  getAverageGrowthRate(): number {
    if (this.samples.length < 2) return 0;
    
    const firstSample = this.samples[0];
    const lastSample = this.samples[this.samples.length - 1];
    const timeDiff = performance.now() - this.startTime;
    const memoryDiff = lastSample.heapUsed - firstSample.heapUsed;
    
    return memoryDiff / (timeDiff / 1000); // bytes per second
  }

  detectLeak(threshold: number = 1024 * 1024): { hasLeak: boolean; growth: number; rate: number } {
    const growth = this.getMemoryGrowth();
    const rate = this.getAverageGrowthRate();
    
    return {
      hasLeak: growth > threshold && rate > 0,
      growth,
      rate
    };
  }

  forceGarbageCollection(): void {
    if (global.gc) {
      global.gc();
    }
  }
}

// Mock POS operations for memory testing
class MockPOSOperations {
  private products: any[] = [];
  private transactions: any[] = [];
  private cache: Map<string, any> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    // Create test products
    for (let i = 0; i < 1000; i++) {
      this.products.push({
        id: i,
        name: `منتج ${i}`,
        nameEn: `Product ${i}`,
        price: Math.random() * 100,
        barcode: `${1000000000000 + i}`,
        category: i % 5 === 0 ? 'مشروبات' : 'أطعمة'
      });
    }
  }

  async simulateProductSearch(query: string): Promise<any[]> {
    // Simulate memory-intensive search
    const results = this.products.filter(p => 
      p.name.includes(query) || p.nameEn.toLowerCase().includes(query.toLowerCase())
    );
    
    // Cache results (potential memory leak source)
    this.cache.set(query, results);
    
    return results;
  }

  async simulateTransaction(items: any[]): Promise<any> {
    const transaction = {
      id: this.transactions.length + 1,
      items: [...items], // Create copies to test memory usage
      timestamp: new Date(),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    this.transactions.push(transaction);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return transaction;
  }

  async simulateReportGeneration(): Promise<any> {
    // Generate large report data
    const reportData = {
      transactions: [...this.transactions],
      products: [...this.products],
      summary: {
        totalSales: this.transactions.reduce((sum, t) => sum + t.total, 0),
        productCount: this.products.length,
        transactionCount: this.transactions.length
      },
      details: this.transactions.map(t => ({
        ...t,
        items: t.items.map((item: any) => ({ ...item })) // Deep copy
      }))
    };

    return reportData;
  }

  clearCache(): void {
    this.cache.clear();
  }

  cleanup(): void {
    this.products = [];
    this.transactions = [];
    this.cache.clear();
  }
}

describe('Memory Leak Detection - Electron 21.x', () => {
  let memoryMonitor: MemoryMonitor;
  let posOperations: MockPOSOperations;

  beforeEach(() => {
    memoryMonitor = new MemoryMonitor();
    posOperations = new MockPOSOperations();
    
    // Force garbage collection before test
    memoryMonitor.forceGarbageCollection();
  });

  afterEach(() => {
    posOperations.cleanup();
    memoryMonitor.forceGarbageCollection();
  });

  test('detects memory leaks in product search operations', async () => {
    const searchQueries = [
      'كوكا', 'بيبسي', 'شاي', 'قهوة', 'خبز', 'جبنة', 'لبن', 'ماء',
      'Product', 'Test', 'Item', 'Food', 'Drink', 'Bread', 'Milk'
    ];

    // Perform multiple search operations
    for (let iteration = 0; iteration < 10; iteration++) {
      for (const query of searchQueries) {
        await posOperations.simulateProductSearch(query);
        
        // Take memory sample every few operations
        if (iteration % 2 === 0) {
          memoryMonitor.takeSample();
        }
      }
    }

    const leakDetection = memoryMonitor.detectLeak(5 * 1024 * 1024); // 5MB threshold
    
    expect(leakDetection.growth).toBeLessThan(10 * 1024 * 1024); // Should not grow more than 10MB
    expect(leakDetection.hasLeak).toBe(false);

    // Clean up cache and verify memory is released
    posOperations.clearCache();
    memoryMonitor.forceGarbageCollection();
    
    const finalMemory = memoryMonitor.getMemoryGrowth();
    expect(finalMemory).toBeLessThan(5 * 1024 * 1024); // Should be under 5MB after cleanup
  });

  test('monitors memory usage during continuous transactions', async () => {
    const transactionItems = [
      { id: 1, name: 'كوكا كولا', price: 5.50, quantity: 2 },
      { id: 2, name: 'بيبسي', price: 5.00, quantity: 1 },
      { id: 3, name: 'شاي', price: 3.00, quantity: 3 }
    ];

    // Simulate continuous transaction processing
    for (let i = 0; i < 100; i++) {
      await posOperations.simulateTransaction(transactionItems);
      
      // Monitor memory every 10 transactions
      if (i % 10 === 0) {
        memoryMonitor.takeSample();
        
        const currentGrowth = memoryMonitor.getMemoryGrowth();
        const maxAllowedGrowth = (i + 1) * 50 * 1024; // 50KB per transaction max
        
        expect(currentGrowth).toBeLessThan(maxAllowedGrowth);
      }
    }

    const finalLeak = memoryMonitor.detectLeak(2 * 1024 * 1024); // 2MB threshold
    expect(finalLeak.hasLeak).toBe(false);
  });

  test('validates memory cleanup after report generation', async () => {
    const initialMemory = memoryMonitor.takeSample();

    // Generate multiple large reports
    const reports = [];
    for (let i = 0; i < 5; i++) {
      const report = await posOperations.simulateReportGeneration();
      reports.push(report);
      memoryMonitor.takeSample();
    }

    const peakMemory = memoryMonitor.getMemoryGrowth();
    
    // Clear references to reports
    reports.length = 0;
    
    // Force garbage collection
    memoryMonitor.forceGarbageCollection();
    await new Promise(resolve => setTimeout(resolve, 100)); // Allow GC to complete
    
    const finalMemory = memoryMonitor.takeSample();
    const memoryAfterCleanup = finalMemory.heapUsed - initialMemory.heapUsed;
    
    // Memory should be significantly reduced after cleanup
    expect(memoryAfterCleanup).toBeLessThan(peakMemory * 0.5); // At least 50% reduction
  });

  test('handles Windows 7 memory constraints', async () => {
    // Simulate Windows 7 environment with limited memory
    const isWindows7 = process.env.SIMULATE_WINDOWS_7 === '1';
    const memoryLimit = isWindows7 ? 100 * 1024 * 1024 : 200 * 1024 * 1024; // 100MB vs 200MB

    let operationCount = 0;
    const maxOperations = isWindows7 ? 50 : 100;

    while (operationCount < maxOperations) {
      // Mix of operations
      await posOperations.simulateProductSearch(`test-${operationCount}`);
      
      if (operationCount % 5 === 0) {
        await posOperations.simulateTransaction([
          { id: 1, name: 'Test Product', price: 10, quantity: 1 }
        ]);
      }

      if (operationCount % 10 === 0) {
        await posOperations.simulateReportGeneration();
      }

      const currentMemory = memoryMonitor.getMemoryGrowth();
      
      // Check if we're approaching memory limit
      if (currentMemory > memoryLimit * 0.8) { // 80% of limit
        // Force cleanup
        posOperations.clearCache();
        memoryMonitor.forceGarbageCollection();
        
        const afterCleanup = memoryMonitor.getMemoryGrowth();
        expect(afterCleanup).toBeLessThan(memoryLimit * 0.6); // Should drop below 60%
      }

      operationCount++;
      
      // Take sample every few operations
      if (operationCount % 5 === 0) {
        memoryMonitor.takeSample();
      }
    }

    const finalLeak = memoryMonitor.detectLeak(memoryLimit * 0.1); // 10% of limit
    expect(finalLeak.hasLeak).toBe(false);
  });

  test('monitors long-running application simulation', async () => {
    const testDuration = 30000; // 30 seconds
    const startTime = performance.now();
    let operationCount = 0;

    while (performance.now() - startTime < testDuration) {
      // Simulate various POS operations
      const operation = operationCount % 4;
      
      switch (operation) {
        case 0:
          await posOperations.simulateProductSearch(`query-${operationCount}`);
          break;
        case 1:
          await posOperations.simulateTransaction([
            { id: operationCount % 10, name: `Product ${operationCount}`, price: 5, quantity: 1 }
          ]);
          break;
        case 2:
          if (operationCount % 20 === 0) {
            await posOperations.simulateReportGeneration();
          }
          break;
        case 3:
          if (operationCount % 50 === 0) {
            posOperations.clearCache();
            memoryMonitor.forceGarbageCollection();
          }
          break;
      }

      operationCount++;

      // Monitor memory every 100 operations
      if (operationCount % 100 === 0) {
        memoryMonitor.takeSample();
        
        const growthRate = memoryMonitor.getAverageGrowthRate();
        const maxGrowthRate = 1024 * 1024; // 1MB per second max
        
        expect(growthRate).toBeLessThan(maxGrowthRate);
      }

      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 1));
    }

    const finalStats = memoryMonitor.detectLeak(10 * 1024 * 1024); // 10MB threshold
    
    expect(finalStats.hasLeak).toBe(false);
    expect(finalStats.growth).toBeLessThan(20 * 1024 * 1024); // Should not grow more than 20MB
    
    console.log(`Long-running test completed:
      Operations: ${operationCount}
      Memory Growth: ${(finalStats.growth / 1024 / 1024).toFixed(2)} MB
      Growth Rate: ${(finalStats.rate / 1024).toFixed(2)} KB/s
    `);
  });

  test('validates garbage collection effectiveness', async () => {
    const samples: number[] = [];

    // Create memory pressure
    for (let i = 0; i < 50; i++) {
      await posOperations.simulateReportGeneration();
      
      if (i % 10 === 0) {
        const beforeGC = process.memoryUsage().heapUsed;
        samples.push(beforeGC);
        
        memoryMonitor.forceGarbageCollection();
        await new Promise(resolve => setTimeout(resolve, 50)); // Allow GC to complete
        
        const afterGC = process.memoryUsage().heapUsed;
        const reduction = beforeGC - afterGC;
        
        // GC should free some memory
        expect(reduction).toBeGreaterThan(0);
        
        // Reduction should be significant (at least 10% of heap)
        expect(reduction).toBeGreaterThan(beforeGC * 0.1);
      }
    }

    // Final cleanup and verification
    posOperations.cleanup();
    memoryMonitor.forceGarbageCollection();
    
    const finalMemory = memoryMonitor.getMemoryGrowth();
    expect(finalMemory).toBeLessThan(5 * 1024 * 1024); // Should be minimal after full cleanup
  });
});
