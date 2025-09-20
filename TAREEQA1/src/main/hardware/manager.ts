import { EventEmitter } from 'events';
import { BarcodeScanner } from './scanner';
import { ReceiptPrinter } from './printer';
import { CashDrawer } from './cash-drawer';

export interface HardwareDevice {
  name: string;
  type: 'scanner' | 'printer' | 'cash_drawer' | 'display';
  status: 'connected' | 'disconnected' | 'error' | 'unknown';
  lastSeen: Date;
  configuration: Record<string, any>;
}

export interface HardwareEvent {
  type: 'scan' | 'print' | 'drawer_open' | 'drawer_close' | 'error';
  device: string;
  data?: any;
  timestamp: Date;
}

export class HardwareManager extends EventEmitter {
  private barcodeScanner: BarcodeScanner;
  private receiptPrinter: ReceiptPrinter;
  private cashDrawer: CashDrawer;
  private devices: Map<string, HardwareDevice> = new Map();
  private isInitialized = false;

  constructor() {
    super();
    this.barcodeScanner = new BarcodeScanner();
    this.receiptPrinter = new ReceiptPrinter();
    this.cashDrawer = new CashDrawer();
    
    this.setupEventHandlers();
  }

  /**
   * Initialize all hardware devices
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing hardware devices...');

      // Initialize barcode scanner
      await this.initializeBarcodeScanner();
      
      // Initialize receipt printer
      await this.initializeReceiptPrinter();
      
      // Initialize cash drawer
      await this.initializeCashDrawer();
      
      // Start device monitoring
      this.startDeviceMonitoring();
      
      this.isInitialized = true;
      console.log('Hardware devices initialized successfully');
      
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize hardware:', error);
      throw error;
    }
  }

  /**
   * Initialize barcode scanner
   */
  private async initializeBarcodeScanner(): Promise<void> {
    try {
      await this.barcodeScanner.initialize();
      
      this.devices.set('barcode_scanner', {
        name: 'Barcode Scanner',
        type: 'scanner',
        status: 'connected',
        lastSeen: new Date(),
        configuration: this.barcodeScanner.getConfiguration()
      });

      console.log('Barcode scanner initialized');
    } catch (error) {
      console.warn('Barcode scanner initialization failed:', error);
      
      this.devices.set('barcode_scanner', {
        name: 'Barcode Scanner',
        type: 'scanner',
        status: 'error',
        lastSeen: new Date(),
        configuration: {}
      });
    }
  }

  /**
   * Initialize receipt printer
   */
  private async initializeReceiptPrinter(): Promise<void> {
    try {
      await this.receiptPrinter.initialize();
      
      this.devices.set('receipt_printer', {
        name: 'Receipt Printer',
        type: 'printer',
        status: 'connected',
        lastSeen: new Date(),
        configuration: this.receiptPrinter.getConfiguration()
      });

      console.log('Receipt printer initialized');
    } catch (error) {
      console.warn('Receipt printer initialization failed:', error);
      
      this.devices.set('receipt_printer', {
        name: 'Receipt Printer',
        type: 'printer',
        status: 'error',
        lastSeen: new Date(),
        configuration: {}
      });
    }
  }

  /**
   * Initialize cash drawer
   */
  private async initializeCashDrawer(): Promise<void> {
    try {
      await this.cashDrawer.initialize();
      
      this.devices.set('cash_drawer', {
        name: 'Cash Drawer',
        type: 'cash_drawer',
        status: 'connected',
        lastSeen: new Date(),
        configuration: this.cashDrawer.getConfiguration()
      });

      console.log('Cash drawer initialized');
    } catch (error) {
      console.warn('Cash drawer initialization failed:', error);
      
      this.devices.set('cash_drawer', {
        name: 'Cash Drawer',
        type: 'cash_drawer',
        status: 'error',
        lastSeen: new Date(),
        configuration: {}
      });
    }
  }

  /**
   * Setup event handlers for hardware devices
   */
  private setupEventHandlers(): void {
    // Barcode scanner events
    this.barcodeScanner.on('scan', (data) => {
      this.handleHardwareEvent({
        type: 'scan',
        device: 'barcode_scanner',
        data,
        timestamp: new Date()
      });
    });

    this.barcodeScanner.on('error', (error) => {
      this.handleHardwareEvent({
        type: 'error',
        device: 'barcode_scanner',
        data: error,
        timestamp: new Date()
      });
    });

    // Receipt printer events
    this.receiptPrinter.on('printed', (data) => {
      this.handleHardwareEvent({
        type: 'print',
        device: 'receipt_printer',
        data,
        timestamp: new Date()
      });
    });

    this.receiptPrinter.on('error', (error) => {
      this.handleHardwareEvent({
        type: 'error',
        device: 'receipt_printer',
        data: error,
        timestamp: new Date()
      });
    });

    // Cash drawer events
    this.cashDrawer.on('opened', () => {
      this.handleHardwareEvent({
        type: 'drawer_open',
        device: 'cash_drawer',
        timestamp: new Date()
      });
    });

    this.cashDrawer.on('closed', () => {
      this.handleHardwareEvent({
        type: 'drawer_close',
        device: 'cash_drawer',
        timestamp: new Date()
      });
    });

    this.cashDrawer.on('error', (error) => {
      this.handleHardwareEvent({
        type: 'error',
        device: 'cash_drawer',
        data: error,
        timestamp: new Date()
      });
    });
  }

  /**
   * Handle hardware events
   */
  private handleHardwareEvent(event: HardwareEvent): void {
    // Update device status
    const device = this.devices.get(event.device);
    if (device) {
      device.lastSeen = event.timestamp;
      if (event.type === 'error') {
        device.status = 'error';
      } else {
        device.status = 'connected';
      }
    }

    // Emit event to application
    this.emit('hardware_event', event);
    
    // Log event
    console.log(`Hardware event: ${event.type} from ${event.device}`, event.data);
  }

  /**
   * Start monitoring device status
   */
  private startDeviceMonitoring(): void {
    setInterval(() => {
      this.checkDeviceStatus();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check status of all devices
   */
  private async checkDeviceStatus(): Promise<void> {
    for (const [deviceId, device] of this.devices.entries()) {
      try {
        let isConnected = false;

        switch (deviceId) {
          case 'barcode_scanner':
            isConnected = await this.barcodeScanner.isConnected();
            break;
          case 'receipt_printer':
            isConnected = await this.receiptPrinter.isConnected();
            break;
          case 'cash_drawer':
            isConnected = await this.cashDrawer.isConnected();
            break;
        }

        const newStatus = isConnected ? 'connected' : 'disconnected';
        
        if (device.status !== newStatus) {
          device.status = newStatus;
          device.lastSeen = new Date();
          
          this.emit('device_status_changed', {
            deviceId,
            device,
            previousStatus: device.status,
            newStatus
          });
        }
      } catch (error) {
        console.error(`Failed to check status for ${deviceId}:`, error);
        device.status = 'error';
      }
    }
  }

  /**
   * Get all connected devices
   */
  getDevices(): HardwareDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get specific device
   */
  getDevice(deviceId: string): HardwareDevice | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Scan barcode
   */
  async scanBarcode(timeout: number = 10000): Promise<string> {
    if (!this.isDeviceReady('barcode_scanner')) {
      throw new Error('Barcode scanner not ready');
    }

    return await this.barcodeScanner.scan(timeout);
  }

  /**
   * Print receipt
   */
  async printReceipt(receiptData: any): Promise<void> {
    if (!this.isDeviceReady('receipt_printer')) {
      throw new Error('Receipt printer not ready');
    }

    await this.receiptPrinter.print(receiptData);
  }

  /**
   * Open cash drawer
   */
  async openCashDrawer(): Promise<void> {
    if (!this.isDeviceReady('cash_drawer')) {
      throw new Error('Cash drawer not ready');
    }

    await this.cashDrawer.open();
  }

  /**
   * Check if device is ready
   */
  private isDeviceReady(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    return device?.status === 'connected';
  }

  /**
   * Configure device
   */
  async configureDevice(deviceId: string, configuration: Record<string, any>): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    try {
      switch (deviceId) {
        case 'barcode_scanner':
          await this.barcodeScanner.configure(configuration);
          break;
        case 'receipt_printer':
          await this.receiptPrinter.configure(configuration);
          break;
        case 'cash_drawer':
          await this.cashDrawer.configure(configuration);
          break;
        default:
          throw new Error(`Unknown device: ${deviceId}`);
      }

      device.configuration = { ...device.configuration, ...configuration };
      device.lastSeen = new Date();

      this.emit('device_configured', { deviceId, configuration });
    } catch (error) {
      console.error(`Failed to configure ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Test device functionality
   */
  async testDevice(deviceId: string): Promise<boolean> {
    try {
      switch (deviceId) {
        case 'barcode_scanner':
          return await this.barcodeScanner.test();
        case 'receipt_printer':
          return await this.receiptPrinter.test();
        case 'cash_drawer':
          return await this.cashDrawer.test();
        default:
          throw new Error(`Unknown device: ${deviceId}`);
      }
    } catch (error) {
      console.error(`Device test failed for ${deviceId}:`, error);
      return false;
    }
  }

  /**
   * Get hardware statistics
   */
  getStatistics(): {
    totalDevices: number;
    connectedDevices: number;
    disconnectedDevices: number;
    errorDevices: number;
    uptime: number;
  } {
    const devices = Array.from(this.devices.values());
    
    return {
      totalDevices: devices.length,
      connectedDevices: devices.filter(d => d.status === 'connected').length,
      disconnectedDevices: devices.filter(d => d.status === 'disconnected').length,
      errorDevices: devices.filter(d => d.status === 'error').length,
      uptime: this.isInitialized ? Date.now() - this.getInitializationTime() : 0
    };
  }

  /**
   * Get initialization time (placeholder)
   */
  private getInitializationTime(): number {
    // This would track actual initialization time
    return Date.now() - 60000; // Placeholder: 1 minute ago
  }

  /**
   * Cleanup hardware resources
   */
  async cleanup(): Promise<void> {
    try {
      console.log('Cleaning up hardware resources...');

      await Promise.all([
        this.barcodeScanner.cleanup(),
        this.receiptPrinter.cleanup(),
        this.cashDrawer.cleanup()
      ]);

      this.devices.clear();
      this.removeAllListeners();
      this.isInitialized = false;

      console.log('Hardware cleanup completed');
    } catch (error) {
      console.error('Hardware cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Check if hardware manager is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get device capabilities
   */
  getDeviceCapabilities(deviceId: string): string[] {
    switch (deviceId) {
      case 'barcode_scanner':
        return ['scan', 'configure', 'test'];
      case 'receipt_printer':
        return ['print', 'configure', 'test', 'status'];
      case 'cash_drawer':
        return ['open', 'configure', 'test', 'status'];
      default:
        return [];
    }
  }
}
