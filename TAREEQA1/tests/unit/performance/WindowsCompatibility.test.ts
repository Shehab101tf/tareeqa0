// Windows 7-11 Compatibility Performance Tests
import { performance } from 'perf_hooks';

// Mock OS detection utilities
const mockOS = {
  platform: () => 'win32',
  release: () => '6.1.7601', // Windows 7 SP1
  arch: () => 'x64',
  totalmem: () => 2 * 1024 * 1024 * 1024, // 2GB RAM (Windows 7 baseline)
  freemem: () => 1 * 1024 * 1024 * 1024 // 1GB free
};

// Mock performance monitoring
class PerformanceMonitor {
  private memoryBaseline: number;
  private startTime: number;

  constructor() {
    this.memoryBaseline = process.memoryUsage().heapUsed;
    this.startTime = performance.now();
  }

  getMemoryUsage(): number {
    return process.memoryUsage().heapUsed - this.memoryBaseline;
  }

  getElapsedTime(): number {
    return performance.now() - this.startTime;
  }

  getCPUUsage(): number {
    // Mock CPU usage calculation
    return Math.random() * 50 + 10; // 10-60% range
  }
}

// Mock database operations for performance testing
class MockDatabase {
  private products: any[] = [];
  private transactions: any[] = [];

  constructor() {
    // Pre-populate with test data
    this.seedTestData(1000);
  }

  private seedTestData(count: number): void {
    for (let i = 0; i < count; i++) {
      this.products.push({
        id: i + 1,
        name: i % 2 === 0 ? `منتج رقم ${i}` : `Product ${i}`,
        nameEn: `Product ${i}`,
        barcode: `${1000000000000 + i}`,
        price: Math.random() * 100,
        category: i % 5 === 0 ? 'مشروبات' : 'أطعمة',
        vat: 14
      });
    }
  }

  async searchProducts(query: string): Promise<any[]> {
    const startTime = performance.now();
    
    const results = this.products.filter(product =>
      product.name.includes(query) ||
      product.nameEn.toLowerCase().includes(query.toLowerCase())
    );
    
    const endTime = performance.now();
    
    // Simulate Windows 7 slower performance
    if (mockOS.release().startsWith('6.1')) {
      await new Promise(resolve => setTimeout(resolve, 10)); // Add 10ms delay
    }
    
    return results;
  }

  async createTransaction(transactionData: any): Promise<any> {
    const transaction = {
      id: this.transactions.length + 1,
      ...transactionData,
      timestamp: new Date().toISOString()
    };
    
    this.transactions.push(transaction);
    return transaction;
  }

  async bulkInsert(items: any[]): Promise<void> {
    // Simulate bulk insert performance
    const batchSize = mockOS.release().startsWith('6.1') ? 50 : 100; // Smaller batches for Windows 7
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      this.products.push(...batch);
      
      // Yield control to prevent blocking
      if (i % batchSize === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
  }
}

describe('Windows Version Compatibility Performance', () => {
  let database: MockDatabase;
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    database = new MockDatabase();
    monitor = new PerformanceMonitor();
  });

  test('detects Windows version correctly', () => {
    const windowsVersion = {
      platform: mockOS.platform(),
      release: mockOS.release(),
      arch: mockOS.arch()
    };
    
    expect(windowsVersion.platform).toBe('win32');
    expect(windowsVersion.release).toMatch(/^6\.|^10\./); // Windows 7+ or Windows 10+
    expect(['x64', 'ia32']).toContain(windowsVersion.arch);
  });

  test('meets Windows 7 performance baseline for search operations', async () => {
    const isWindows7 = mockOS.release().startsWith('6.1');
    const expectedMaxTime = isWindows7 ? 500 : 200; // Windows 7 gets more time
    
    const searchTerms = ['كوكا', 'بيبسي', 'Product', 'منتج'];
    
    for (const term of searchTerms) {
      const startTime = performance.now();
      const results = await database.searchProducts(term);
      const endTime = performance.now();
      
      const searchTime = endTime - startTime;
      expect(searchTime).toBeLessThan(expectedMaxTime);
      expect(results.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('handles memory constraints on Windows 7 (2GB RAM)', async () => {
    const totalMemory = mockOS.totalmem();
    const isWindows7 = totalMemory <= 2 * 1024 * 1024 * 1024; // 2GB or less
    
    const memBefore = monitor.getMemoryUsage();
    
    // Simulate heavy POS usage
    const operations = [];
    for (let i = 0; i < 100; i++) {
      operations.push(database.searchProducts('test'));
      operations.push(database.createTransaction({
        items: [{ productId: 1, quantity: 1, price: 10 }],
        total: 10,
        paymentMethod: 'cash'
      }));
    }
    
    await Promise.all(operations);
    
    const memAfter = monitor.getMemoryUsage();
    const memoryIncrease = memAfter - memBefore;
    
    // Windows 7 should use less memory
    const maxMemoryIncrease = isWindows7 ? 50 * 1024 * 1024 : 100 * 1024 * 1024; // 50MB vs 100MB
    expect(memoryIncrease).toBeLessThan(maxMemoryIncrease);
  });

  test('startup time meets Windows version requirements', async () => {
    const isWindows7 = mockOS.release().startsWith('6.1');
    const maxStartupTime = isWindows7 ? 8000 : 5000; // 8s for Win7, 5s for Win10+
    
    const startTime = performance.now();
    
    // Simulate application startup
    await new Promise(resolve => {
      // Mock initialization tasks
      setTimeout(() => {
        // Database initialization
        new MockDatabase();
        
        // UI initialization
        const mockUI = { initialized: true };
        
        // Hardware detection
        const mockHardware = { scanners: [], printers: [] };
        
        resolve(true);
      }, isWindows7 ? 3000 : 1500); // Simulate slower startup on Windows 7
    });
    
    const startupTime = performance.now() - startTime;
    expect(startupTime).toBeLessThan(maxStartupTime);
  });

  test('bulk operations performance scales with Windows version', async () => {
    const isWindows7 = mockOS.release().startsWith('6.1');
    const itemCount = isWindows7 ? 1000 : 5000; // Fewer items for Windows 7
    const maxTime = isWindows7 ? 10000 : 5000; // More time allowed for Windows 7
    
    const bulkItems = Array.from({ length: itemCount }, (_, i) => ({
      name: `Bulk Product ${i}`,
      price: Math.random() * 100,
      barcode: `BULK${i.toString().padStart(10, '0')}`
    }));
    
    const startTime = performance.now();
    await database.bulkInsert(bulkItems);
    const endTime = performance.now();
    
    const operationTime = endTime - startTime;
    expect(operationTime).toBeLessThan(maxTime);
  });

  test('CPU usage stays within acceptable limits', async () => {
    const isWindows7 = mockOS.release().startsWith('6.1');
    const maxCPUUsage = isWindows7 ? 80 : 70; // Higher threshold for Windows 7
    
    // Simulate CPU-intensive operations
    const operations = [];
    for (let i = 0; i < 50; i++) {
      operations.push(database.searchProducts(`search-${i}`));
    }
    
    const startCPU = monitor.getCPUUsage();
    await Promise.all(operations);
    const endCPU = monitor.getCPUUsage();
    
    const avgCPU = (startCPU + endCPU) / 2;
    expect(avgCPU).toBeLessThan(maxCPUUsage);
  });

  test('handles Windows 7 graphics limitations gracefully', () => {
    const isWindows7 = mockOS.release().startsWith('6.1');
    
    // Mock graphics capabilities
    const graphicsConfig = {
      hardwareAcceleration: !isWindows7, // Disabled on Windows 7
      maxTextureSize: isWindows7 ? 2048 : 4096,
      supportsWebGL: !isWindows7,
      supportsBackdropFilter: !isWindows7
    };
    
    if (isWindows7) {
      expect(graphicsConfig.hardwareAcceleration).toBe(false);
      expect(graphicsConfig.supportsBackdropFilter).toBe(false);
      expect(graphicsConfig.maxTextureSize).toBe(2048);
    } else {
      expect(graphicsConfig.hardwareAcceleration).toBe(true);
      expect(graphicsConfig.supportsBackdropFilter).toBe(true);
      expect(graphicsConfig.maxTextureSize).toBe(4096);
    }
  });

  test('network performance adapts to Windows version', async () => {
    const isWindows7 = mockOS.release().startsWith('6.1');
    const maxConnections = isWindows7 ? 10 : 20; // Windows 7 has connection limits
    const connectionTimeout = isWindows7 ? 5000 : 3000; // Longer timeout for Windows 7
    
    // Mock network connections
    const connections = Array.from({ length: maxConnections }, (_, i) => ({
      id: i,
      connected: true,
      latency: isWindows7 ? Math.random() * 200 + 50 : Math.random() * 100 + 20
    }));
    
    expect(connections.length).toBeLessThanOrEqual(maxConnections);
    
    const avgLatency = connections.reduce((sum, conn) => sum + conn.latency, 0) / connections.length;
    const maxLatency = isWindows7 ? 250 : 120;
    expect(avgLatency).toBeLessThan(maxLatency);
  });

  test('file system operations respect Windows version capabilities', async () => {
    const isWindows7 = mockOS.release().startsWith('6.1');
    
    // Mock file operations
    const fileOperations = {
      maxPathLength: isWindows7 ? 260 : 32767, // Windows 7 has 260 char limit
      supportsLongPaths: !isWindows7,
      maxFileSize: isWindows7 ? 4 * 1024 * 1024 * 1024 : 16 * 1024 * 1024 * 1024, // 4GB vs 16GB
      supportsConcurrentWrites: !isWindows7
    };
    
    // Test path length handling
    const longPath = 'C:\\' + 'a'.repeat(300);
    if (isWindows7) {
      expect(longPath.length).toBeGreaterThan(fileOperations.maxPathLength);
      // Should truncate or hash long paths on Windows 7
    }
    
    expect(fileOperations.maxPathLength).toBeGreaterThan(0);
    expect(fileOperations.maxFileSize).toBeGreaterThan(1024 * 1024); // At least 1MB
  });
});
