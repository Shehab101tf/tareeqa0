// Hardware Integration Manager - Windows 7+ Compatible
import { EventEmitter } from 'events';
import * as os from 'os';

export interface HardwareDevice {
  id: string;
  type: 'scanner' | 'printer' | 'cash-drawer' | 'display';
  name: string;
  manufacturer?: string;
  model?: string;
  connected: boolean;
  port?: string;
  vendorId?: number;
  productId?: number;
}

export interface ScanResult {
  barcode: string;
  format: 'EAN-13' | 'UPC-A' | 'Code-128' | 'QR' | 'Unknown';
  isValid: boolean;
  timestamp: Date;
  product?: any;
}

export interface PrintJob {
  id: string;
  type: 'receipt' | 'report' | 'label';
  content: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  timestamp: Date;
}

export class HardwareManager extends EventEmitter {
  private devices: Map<string, HardwareDevice> = new Map();
  private scannerPort: any = null;
  private printerPort: any = null;
  private isWindows7: boolean;

  constructor() {
    super();
    this.isWindows7 = os.release().startsWith('6.1');
    this.initialize();
  }

  private async initialize(): Promise<void> {
    console.log(`🔧 Hardware Manager initializing (Windows 7: ${this.isWindows7})`);
    
    try {
      await this.detectDevices();
      this.setupEventHandlers();
      console.log('✅ Hardware Manager initialized successfully');
    } catch (error) {
      console.error('❌ Hardware Manager initialization failed:', error);
    }
  }

  /**
   * Detect available hardware devices
   */
  async detectDevices(): Promise<HardwareDevice[]> {
    const devices: HardwareDevice[] = [];

    try {
      // Detect USB HID devices (barcode scanners)
      const hidDevices = await this.detectHIDDevices();
      devices.push(...hidDevices);

      // Detect serial port devices (printers, cash drawers)
      const serialDevices = await this.detectSerialDevices();
      devices.push(...serialDevices);

      // Update internal device registry
      devices.forEach(device => {
        this.devices.set(device.id, device);
      });

      this.emit('devices-detected', devices);
      return devices;
    } catch (error) {
      console.error('Device detection failed:', error);
      return [];
    }
  }

  /**
   * Detect USB HID devices (Windows 7+ compatible)
   */
  private async detectHIDDevices(): Promise<HardwareDevice[]> {
    const devices: HardwareDevice[] = [];

    try {
      // Use dynamic import for optional dependency
      const HID = await this.loadHIDModule();
      if (!HID) return devices;

      const hidDevices = HID.devices();
      
      // Known barcode scanner vendor/product IDs
      const scannerIds = [
        { vendorId: 0x05e0, productId: 0x1200, name: 'Symbol Barcode Scanner' },
        { vendorId: 0x0c2e, productId: 0x0b61, name: 'Honeywell Scanner' },
        { vendorId: 0x1a86, productId: 0x7523, name: 'Generic USB Scanner' },
        { vendorId: 0x0536, productId: 0x02b1, name: 'Zebex Scanner' }
      ];

      hidDevices.forEach((device: any) => {
        const scanner = scannerIds.find(s => 
          s.vendorId === device.vendorId && s.productId === device.productId
        );

        if (scanner) {
          devices.push({
            id: `hid-${device.vendorId}-${device.productId}`,
            type: 'scanner',
            name: scanner.name,
            manufacturer: device.manufacturer || 'Unknown',
            connected: false,
            vendorId: device.vendorId,
            productId: device.productId
          });
        }
      });

    } catch (error) {
      console.warn('HID device detection failed (may not be available):', error);
    }

    return devices;
  }

  /**
   * Detect serial port devices
   */
  private async detectSerialDevices(): Promise<HardwareDevice[]> {
    const devices: HardwareDevice[] = [];

    try {
      const SerialPort = await this.loadSerialPortModule();
      if (!SerialPort) return devices;

      const ports = await SerialPort.list();
      
      ports.forEach((port: any) => {
        // Identify device type by manufacturer or product info
        let deviceType: 'printer' | 'cash-drawer' | 'display' = 'printer';
        let deviceName = 'Unknown Serial Device';

        if (port.manufacturer?.toLowerCase().includes('epson')) {
          deviceType = 'printer';
          deviceName = 'Epson Thermal Printer';
        } else if (port.manufacturer?.toLowerCase().includes('star')) {
          deviceType = 'printer';
          deviceName = 'Star Thermal Printer';
        } else if (port.productId === '6001') {
          deviceType = 'cash-drawer';
          deviceName = 'Cash Drawer';
        }

        devices.push({
          id: `serial-${port.path}`,
          type: deviceType,
          name: deviceName,
          manufacturer: port.manufacturer || 'Unknown',
          connected: false,
          port: port.path
        });
      });

    } catch (error) {
      console.warn('Serial device detection failed:', error);
    }

    return devices;
  }

  /**
   * Connect to a barcode scanner
   */
  async connectScanner(deviceId: string): Promise<boolean> {
    try {
      const device = this.devices.get(deviceId);
      if (!device || device.type !== 'scanner') {
        throw new Error('Invalid scanner device');
      }

      if (device.vendorId && device.productId) {
        const HID = await this.loadHIDModule();
        if (!HID) throw new Error('HID module not available');

        this.scannerPort = new HID.HID(device.vendorId, device.productId);
        
        this.scannerPort.on('data', (data: Buffer) => {
          this.processScanData(data);
        });

        this.scannerPort.on('error', (error: Error) => {
          console.error('Scanner error:', error);
          this.emit('scanner-error', error);
        });

        device.connected = true;
        this.emit('scanner-connected', device);
        console.log(`✅ Scanner connected: ${device.name}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Scanner connection failed:', error);
      return false;
    }
  }

  /**
   * Connect to a thermal printer
   */
  async connectPrinter(deviceId: string): Promise<boolean> {
    try {
      const device = this.devices.get(deviceId);
      if (!device || device.type !== 'printer') {
        throw new Error('Invalid printer device');
      }

      if (device.port) {
        const SerialPort = await this.loadSerialPortModule();
        if (!SerialPort) throw new Error('SerialPort module not available');

        this.printerPort = new SerialPort({
          path: device.port,
          baudRate: 9600,
          dataBits: 8,
          parity: 'none',
          stopBits: 1
        });

        this.printerPort.on('open', () => {
          device.connected = true;
          this.emit('printer-connected', device);
          console.log(`✅ Printer connected: ${device.name}`);
        });

        this.printerPort.on('error', (error: Error) => {
          console.error('Printer error:', error);
          this.emit('printer-error', error);
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Printer connection failed:', error);
      return false;
    }
  }

  /**
   * Process barcode scan data
   */
  private processScanData(data: Buffer): void {
    try {
      // Convert buffer to string and clean up
      let barcode = data.toString('ascii').trim();
      
      // Remove control characters
      barcode = barcode.replace(/[\x00-\x1F\x7F]/g, '');
      
      if (barcode.length >= 8) {
        const scanResult: ScanResult = {
          barcode,
          format: this.detectBarcodeFormat(barcode),
          isValid: this.validateBarcode(barcode),
          timestamp: new Date()
        };

        this.emit('barcode-scanned', scanResult);
        console.log(`📱 Barcode scanned: ${barcode}`);
      }
    } catch (error) {
      console.error('Scan data processing failed:', error);
    }
  }

  /**
   * Detect barcode format
   */
  private detectBarcodeFormat(barcode: string): ScanResult['format'] {
    if (barcode.length === 13 && /^\d+$/.test(barcode)) {
      return 'EAN-13';
    } else if (barcode.length === 12 && /^\d+$/.test(barcode)) {
      return 'UPC-A';
    } else if (/^[A-Z0-9\-\.\$\/\+\%\s]+$/i.test(barcode)) {
      return 'Code-128';
    }
    return 'Unknown';
  }

  /**
   * Validate barcode checksum
   */
  private validateBarcode(barcode: string): boolean {
    if (barcode.length === 13) {
      // EAN-13 checksum validation
      const digits = barcode.split('').map(Number);
      const checksum = digits.pop()!;
      
      let sum = 0;
      for (let i = 0; i < digits.length; i++) {
        sum += digits[i] * (i % 2 === 0 ? 1 : 3);
      }
      
      const calculatedChecksum = (10 - (sum % 10)) % 10;
      return calculatedChecksum === checksum;
    }
    
    return barcode.length >= 8; // Basic length validation
  }

  /**
   * Print receipt with Arabic text support
   */
  async printReceipt(receiptData: any): Promise<PrintJob> {
    const printJob: PrintJob = {
      id: `print-${Date.now()}`,
      type: 'receipt',
      content: '',
      status: 'pending',
      timestamp: new Date()
    };

    try {
      if (!this.printerPort) {
        throw new Error('Printer not connected');
      }

      // Generate ESC/POS commands for receipt
      const commands = this.generateReceiptCommands(receiptData);
      printJob.content = commands;
      printJob.status = 'printing';

      // Send to printer
      await this.sendToPrinter(commands);
      
      printJob.status = 'completed';
      this.emit('print-completed', printJob);
      
      return printJob;
    } catch (error) {
      printJob.status = 'failed';
      console.error('Print job failed:', error);
      this.emit('print-failed', { printJob, error });
      return printJob;
    }
  }

  /**
   * Generate ESC/POS commands for receipt printing
   */
  private generateReceiptCommands(receiptData: any): string {
    let commands = '';
    
    // Initialize printer
    commands += '\x1B\x40'; // ESC @
    
    // Set character encoding for Arabic (UTF-8)
    commands += '\x1B\x74\x20'; // ESC t 32 (UTF-8)
    
    // Center alignment
    commands += '\x1B\x61\x01'; // ESC a 1
    
    // Store header
    commands += '\x1B\x21\x30'; // ESC ! 48 (double height/width)
    commands += receiptData.storeName || 'متجر تريقة\n';
    commands += '\x1B\x21\x00'; // ESC ! 0 (normal)
    
    // Store address
    commands += receiptData.storeAddress || 'القاهرة، مصر\n';
    commands += '================================\n';
    
    // Left alignment for items
    commands += '\x1B\x61\x00'; // ESC a 0
    
    // Items
    receiptData.items?.forEach((item: any) => {
      commands += `${item.name}\n`;
      commands += `${item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)} ج.م\n`;
    });
    
    commands += '================================\n';
    
    // Totals
    commands += `المجموع الفرعي: ${receiptData.subtotal?.toFixed(2)} ج.م\n`;
    commands += `ضريبة القيمة المضافة (14%): ${receiptData.vat?.toFixed(2)} ج.م\n`;
    commands += '\x1B\x21\x20'; // ESC ! 32 (double width)
    commands += `الإجمالي: ${receiptData.total?.toFixed(2)} ج.م\n`;
    commands += '\x1B\x21\x00'; // ESC ! 0 (normal)
    
    // Footer
    commands += '================================\n';
    commands += 'شكراً لزيارتكم\n';
    commands += `التاريخ: ${new Date().toLocaleDateString('ar-EG')}\n`;
    
    // Cut paper
    commands += '\x1D\x56\x42\x00'; // GS V B 0
    
    return commands;
  }

  /**
   * Send commands to printer
   */
  private async sendToPrinter(commands: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.printerPort) {
        reject(new Error('Printer not connected'));
        return;
      }

      this.printerPort.write(Buffer.from(commands, 'utf8'), (error: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get connected devices
   */
  getConnectedDevices(): HardwareDevice[] {
    return Array.from(this.devices.values()).filter(device => device.connected);
  }

  /**
   * Disconnect all devices
   */
  async disconnectAll(): Promise<void> {
    try {
      if (this.scannerPort) {
        this.scannerPort.close();
        this.scannerPort = null;
      }

      if (this.printerPort) {
        this.printerPort.close();
        this.printerPort = null;
      }

      this.devices.forEach(device => {
        device.connected = false;
      });

      console.log('✅ All hardware devices disconnected');
    } catch (error) {
      console.error('Error disconnecting devices:', error);
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Handle process exit
    process.on('exit', () => {
      this.disconnectAll();
    });

    process.on('SIGINT', () => {
      this.disconnectAll();
      process.exit(0);
    });
  }

  /**
   * Load HID module (optional dependency)
   */
  private async loadHIDModule(): Promise<any> {
    try {
      const { HID } = await import('node-hid');
      return { HID };
    } catch (error) {
      console.warn('node-hid module not available:', error);
      return null;
    }
  }

  /**
   * Load SerialPort module (optional dependency)
   */
  private async loadSerialPortModule(): Promise<any> {
    try {
      const { SerialPort } = await import('serialport');
      return SerialPort;
    } catch (error) {
      console.warn('serialport module not available:', error);
      return null;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.disconnectAll();
    this.removeAllListeners();
  }
}

export default HardwareManager;
