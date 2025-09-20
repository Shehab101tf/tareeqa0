import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface FileChecksum {
  path: string;
  checksum: string;
  size: number;
  lastModified: number;
}

export class AntiTampering {
  private static checksums = new Map<string, FileChecksum>();
  private static criticalFiles: string[] = [];
  private static isInitialized = false;

  /**
   * Initialize checksums for critical application files
   */
  static initializeChecksums(): void {
    if (this.isInitialized) {
      return;
    }

    try {
      const appPath = app.getAppPath();
      
      // Define critical files to monitor
      this.criticalFiles = [
        path.join(appPath, 'dist/main/index.js'),
        path.join(appPath, 'dist/main/security/license.js'),
        path.join(appPath, 'dist/main/security/anti-tampering.js'),
        path.join(appPath, 'dist/main/database/connection.js'),
        path.join(appPath, 'dist/preload/index.js'),
        path.join(appPath, 'package.json')
      ];

      // Calculate checksums for existing files
      this.criticalFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          const checksum = this.calculateFileChecksum(filePath);
          if (checksum) {
            this.checksums.set(filePath, checksum);
          }
        }
      });

      this.isInitialized = true;
      console.log(`Initialized checksums for ${this.checksums.size} critical files`);
    } catch (error) {
      console.error('Failed to initialize checksums:', error);
    }
  }

  /**
   * Verify integrity of all critical files
   */
  static verifyIntegrity(): boolean {
    if (!this.isInitialized) {
      console.warn('Anti-tampering not initialized');
      return true; // Allow if not initialized (development mode)
    }

    try {
      for (const [filePath, expectedChecksum] of this.checksums.entries()) {
        if (!fs.existsSync(filePath)) {
          console.error(`Critical file missing: ${filePath}`);
          return false;
        }

        const currentChecksum = this.calculateFileChecksum(filePath);
        if (!currentChecksum) {
          console.error(`Failed to calculate checksum for: ${filePath}`);
          return false;
        }

        // Check if file has been modified
        if (currentChecksum.checksum !== expectedChecksum.checksum) {
          console.error(`File integrity check failed: ${filePath}`);
          console.error(`Expected: ${expectedChecksum.checksum}`);
          console.error(`Current: ${currentChecksum.checksum}`);
          return false;
        }

        // Check file size
        if (currentChecksum.size !== expectedChecksum.size) {
          console.error(`File size mismatch: ${filePath}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Integrity verification failed:', error);
      return false;
    }
  }

  /**
   * Detect debugging environment
   */
  static detectDebugging(): boolean {
    const debugIndicators = [
      // Command line arguments
      process.argv.includes('--inspect'),
      process.argv.includes('--inspect-brk'),
      process.argv.includes('--debug'),
      process.argv.includes('--debug-brk'),
      
      // Environment variables
      process.env.NODE_ENV === 'development',
      process.env.DEBUG === 'true',
      !!process.env.ELECTRON_IS_DEV,
      
      // Electron specific
      !app.isPackaged,
      
      // V8 debugging
      typeof global.gc === 'function',
      
      // DevTools detection (basic)
      process.env.ELECTRON_ENABLE_LOGGING === 'true'
    ];

    const debugCount = debugIndicators.filter(Boolean).length;
    
    if (debugCount > 0) {
      console.warn(`Debug environment detected (${debugCount} indicators)`);
      return true;
    }

    return false;
  }

  /**
   * Monitor for runtime tampering attempts
   */
  static startRuntimeMonitoring(): void {
    // Monitor for suspicious global modifications
    this.monitorGlobalModifications();
    
    // Monitor for process manipulation
    this.monitorProcessManipulation();
    
    // Monitor for memory manipulation
    this.monitorMemoryManipulation();
    
    // Periodic integrity checks
    this.startPeriodicChecks();
  }

  /**
   * Calculate SHA-256 checksum for a file
   */
  private static calculateFileChecksum(filePath: string): FileChecksum | null {
    try {
      const content = fs.readFileSync(filePath);
      const stats = fs.statSync(filePath);
      
      const hash = crypto.createHash('sha256');
      hash.update(content);
      
      return {
        path: filePath,
        checksum: hash.digest('hex'),
        size: stats.size,
        lastModified: stats.mtime.getTime()
      };
    } catch (error) {
      console.error(`Failed to calculate checksum for ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Monitor for suspicious global object modifications
   */
  private static monitorGlobalModifications(): void {
    // Monitor critical global objects
    const criticalGlobals = ['process', 'require', 'module', '__dirname', '__filename'];
    
    criticalGlobals.forEach(globalName => {
      const originalValue = (global as any)[globalName];
      
      Object.defineProperty(global, globalName, {
        get: () => originalValue,
        set: (newValue) => {
          console.error(`Tampering detected: Attempt to modify global.${globalName}`);
          this.handleTamperingDetected('global_modification', globalName);
        },
        configurable: false
      });
    });
  }

  /**
   * Monitor for process manipulation
   */
  private static monitorProcessManipulation(): void {
    // Monitor process.exit
    const originalExit = process.exit;
    process.exit = function(code?: number) {
      console.warn('Process exit called:', code);
      return originalExit.call(process, code);
    };

    // Monitor uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception (potential tampering):', error);
      this.handleTamperingDetected('uncaught_exception', error.message);
    });

    // Monitor unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection (potential tampering):', reason);
      this.handleTamperingDetected('unhandled_rejection', String(reason));
    });
  }

  /**
   * Monitor for memory manipulation
   */
  private static monitorMemoryManipulation(): void {
    // Monitor memory usage patterns
    let lastMemoryUsage = process.memoryUsage();
    
    setInterval(() => {
      const currentMemoryUsage = process.memoryUsage();
      
      // Check for suspicious memory spikes
      const heapIncrease = currentMemoryUsage.heapUsed - lastMemoryUsage.heapUsed;
      const threshold = 50 * 1024 * 1024; // 50MB
      
      if (heapIncrease > threshold) {
        console.warn('Suspicious memory increase detected:', heapIncrease);
        this.handleTamperingDetected('memory_spike', `${heapIncrease} bytes`);
      }
      
      lastMemoryUsage = currentMemoryUsage;
    }, 30000); // Check every 30 seconds
  }

  /**
   * Start periodic integrity checks
   */
  private static startPeriodicChecks(): void {
    setInterval(() => {
      if (!this.verifyIntegrity()) {
        this.handleTamperingDetected('integrity_check_failed', 'Periodic check');
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  /**
   * Handle tampering detection
   */
  private static handleTamperingDetected(type: string, details: string): void {
    console.error(`TAMPERING DETECTED: ${type} - ${details}`);
    
    // Log the incident
    this.logTamperingIncident(type, details);
    
    // In production, you might want to:
    // 1. Notify the license server
    // 2. Disable certain features
    // 3. Exit the application
    // 4. Send telemetry data
    
    if (app.isPackaged) {
      // In production mode, exit immediately
      console.error('Application integrity compromised. Exiting...');
      app.quit();
    } else {
      // In development mode, just log
      console.warn('Development mode: Tampering detected but continuing...');
    }
  }

  /**
   * Log tampering incident to file
   */
  private static logTamperingIncident(type: string, details: string): void {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        type,
        details,
        processId: process.pid,
        platform: process.platform,
        arch: process.arch,
        version: app.getVersion()
      };

      const logPath = path.join(app.getPath('userData'), 'security.log');
      const logLine = JSON.stringify(logEntry) + '\n';
      
      fs.appendFileSync(logPath, logLine);
    } catch (error) {
      console.error('Failed to log tampering incident:', error);
    }
  }

  /**
   * Get tampering detection statistics
   */
  static getSecurityStats(): {
    isInitialized: boolean;
    monitoredFiles: number;
    lastIntegrityCheck: Date | null;
    debugModeDetected: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      monitoredFiles: this.checksums.size,
      lastIntegrityCheck: new Date(), // Would track actual last check
      debugModeDetected: this.detectDebugging()
    };
  }

  /**
   * Force integrity check and return detailed results
   */
  static performDetailedIntegrityCheck(): {
    passed: boolean;
    results: Array<{
      file: string;
      status: 'ok' | 'modified' | 'missing' | 'error';
      details?: string;
    }>;
  } {
    const results: Array<{
      file: string;
      status: 'ok' | 'modified' | 'missing' | 'error';
      details?: string;
    }> = [];

    let allPassed = true;

    for (const [filePath, expectedChecksum] of this.checksums.entries()) {
      try {
        if (!fs.existsSync(filePath)) {
          results.push({
            file: path.basename(filePath),
            status: 'missing',
            details: 'File not found'
          });
          allPassed = false;
          continue;
        }

        const currentChecksum = this.calculateFileChecksum(filePath);
        if (!currentChecksum) {
          results.push({
            file: path.basename(filePath),
            status: 'error',
            details: 'Failed to calculate checksum'
          });
          allPassed = false;
          continue;
        }

        if (currentChecksum.checksum !== expectedChecksum.checksum) {
          results.push({
            file: path.basename(filePath),
            status: 'modified',
            details: 'Checksum mismatch'
          });
          allPassed = false;
        } else {
          results.push({
            file: path.basename(filePath),
            status: 'ok'
          });
        }
      } catch (error) {
        results.push({
          file: path.basename(filePath),
          status: 'error',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
        allPassed = false;
      }
    }

    return {
      passed: allPassed,
      results
    };
  }
}
