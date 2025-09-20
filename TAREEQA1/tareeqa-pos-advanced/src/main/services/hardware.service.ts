import { SerialPort } from 'serialport';
import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer';
import { EventEmitter } from 'events';

/**
 * Hardware Service for Tareeqa POS
 * Handles barcode scanners, receipt printers, and cash drawers
 */
export class HardwareService extends EventEmitter {
  private barcodeScanner: SerialPort | null = null;
  private receiptPrinter: ThermalPrinter | null = null;
  private cashDrawer: SerialPort | null = null;
  private isInitialized = false;

  constructor() {
    super();
  }

  /**
   * Initialize hardware devices
   */
  async initialize(): Promise<void> {
    console.log('🔌 Initializing hardware devices...');

    try {
      await this.initializeBarcodeScanner();
      await this.initializeReceiptPrinter();
      await this.initializeCashDrawer();
      
      this.isInitialized = true;
      console.log('✅ Hardware devices initialized');
    } catch (error) {
      console.error('❌ Hardware initialization failed:', error);
      // Don't throw - allow app to run without hardware
    }
  }

  /**
   * Initialize barcode scanner
   */
  private async initializeBarcodeScanner(): Promise<void> {
    console.log('📱 Initializing barcode scanner...');

    try {
      // List available ports
      const ports = await SerialPort.list();
      console.log('Available ports:', ports.map(p => p.path));

      // Find barcode scanner port (common patterns)
      const scannerPort = ports.find(port => 
        port.manufacturer?.toLowerCase().includes('scanner') ||
        port.manufacturer?.toLowerCase().includes('symbol') ||
        port.manufacturer?.toLowerCase().includes('honeywell') ||
        port.manufacturer?.toLowerCase().includes('datalogic') ||
        port.productId === '0001' // Common USB HID scanner
      );

      if (scannerPort) {
        this.barcodeScanner = new SerialPort({
          path: scannerPort.path,
          baudRate: 9600,
          dataBits: 8,
          parity: 'none',
          stopBits: 1,
          autoOpen: false
        });

        this.barcodeScanner.on('data', (data) => {
          const barcode = data.toString().trim();
          console.log('📱 Barcode scanned:', barcode);
          this.emit('barcode-scanned', barcode);
        });

        this.barcodeScanner.on('error', (error) => {
          console.error('❌ Barcode scanner error:', error);
          this.emit('scanner-error', error);
        });

        await new Promise<void>((resolve, reject) => {
          this.barcodeScanner!.open((error) => {
            if (error) {
              console.warn('⚠️ Could not open barcode scanner:', error.message);
              resolve(); // Don't fail initialization
            } else {
              console.log('✅ Barcode scanner connected');
              resolve();
            }
          });
        });
      } else {
        console.log('ℹ️ No barcode scanner detected');
      }
    } catch (error) {
      console.warn('⚠️ Barcode scanner initialization failed:', error);
    }
  }

  /**
   * Initialize receipt printer
   */
  private async initializeReceiptPrinter(): Promise<void> {
    console.log('🖨️ Initializing receipt printer...');

    try {
      // Try to find thermal printer
      const ports = await SerialPort.list();
      const printerPort = ports.find(port => 
        port.manufacturer?.toLowerCase().includes('printer') ||
        port.manufacturer?.toLowerCase().includes('epson') ||
        port.manufacturer?.toLowerCase().includes('star') ||
        port.manufacturer?.toLowerCase().includes('citizen')
      );

      if (printerPort) {
        this.receiptPrinter = new ThermalPrinter({
          type: PrinterTypes.EPSON,
          interface: printerPort.path,
          characterSet: CharacterSet.PC864_ARABIC,
          removeSpecialCharacters: false,
          lineCharacter: "=",
          breakLine: BreakLine.WORD,
          options: {
            timeout: 5000,
            baudRate: 9600
          }
        });

        // Test printer connection
        const isConnected = await this.receiptPrinter.isPrinterConnected();
        if (isConnected) {
          console.log('✅ Receipt printer connected');
        } else {
          console.log('⚠️ Receipt printer not responding');
          this.receiptPrinter = null;
        }
      } else {
        console.log('ℹ️ No receipt printer detected');
      }
    } catch (error) {
      console.warn('⚠️ Receipt printer initialization failed:', error);
    }
  }

  /**
   * Initialize cash drawer
   */
  private async initializeCashDrawer(): Promise<void> {
    console.log('💰 Initializing cash drawer...');

    try {
      // Cash drawer is usually connected through the printer
      // or as a separate serial device
      const ports = await SerialPort.list();
      const drawerPort = ports.find(port => 
        port.manufacturer?.toLowerCase().includes('drawer') ||
        port.manufacturer?.toLowerCase().includes('cash')
      );

      if (drawerPort) {
        this.cashDrawer = new SerialPort({
          path: drawerPort.path,
          baudRate: 9600,
          autoOpen: false
        });

        await new Promise<void>((resolve, reject) => {
          this.cashDrawer!.open((error) => {
            if (error) {
              console.warn('⚠️ Could not open cash drawer:', error.message);
              resolve();
            } else {
              console.log('✅ Cash drawer connected');
              resolve();
            }
          });
        });
      } else {
        console.log('ℹ️ No cash drawer detected');
      }
    } catch (error) {
      console.warn('⚠️ Cash drawer initialization failed:', error);
    }
  }

  /**
   * Scan barcode (manual trigger or return last scanned)
   */
  async scanBarcode(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.barcodeScanner || !this.barcodeScanner.isOpen) {
        resolve(null);
        return;
      }

      // Set timeout for barcode scan
      const timeout = setTimeout(() => {
        this.removeListener('barcode-scanned', onBarcode);
        resolve(null);
      }, 10000); // 10 second timeout

      const onBarcode = (barcode: string) => {
        clearTimeout(timeout);
        resolve(barcode);
      };

      this.once('barcode-scanned', onBarcode);
    });
  }

  /**
   * Print receipt
   */
  async printReceipt(receiptData: any): Promise<boolean> {
    if (!this.receiptPrinter) {
      console.warn('⚠️ No receipt printer available');
      return false;
    }

    try {
      console.log('🖨️ Printing receipt...');

      // Clear any previous content
      this.receiptPrinter.clear();

      // Header
      this.receiptPrinter.alignCenter();
      this.receiptPrinter.setTextSize(1, 1);
      this.receiptPrinter.bold(true);
      this.receiptPrinter.println(receiptData.storeName || 'متجر طريقة');
      this.receiptPrinter.bold(false);
      this.receiptPrinter.println(receiptData.storeNameEnglish || 'Tareeqa Store');
      this.receiptPrinter.drawLine();

      // Receipt info
      this.receiptPrinter.alignLeft();
      this.receiptPrinter.setTextSize(0, 0);
      this.receiptPrinter.println(`فاتورة رقم: ${receiptData.receiptNumber}`);
      this.receiptPrinter.println(`التاريخ: ${receiptData.date}`);
      this.receiptPrinter.println(`الوقت: ${receiptData.time}`);
      this.receiptPrinter.println(`الكاشير: ${receiptData.cashierName}`);
      this.receiptPrinter.drawLine();

      // Items
      this.receiptPrinter.bold(true);
      this.receiptPrinter.println('المنتجات:');
      this.receiptPrinter.bold(false);

      for (const item of receiptData.items) {
        this.receiptPrinter.println(`${item.name}`);
        this.receiptPrinter.println(`${item.quantity} × ${item.price.toFixed(2)} = ${item.total.toFixed(2)} ج.م`);
        this.receiptPrinter.newLine();
      }

      this.receiptPrinter.drawLine();

      // Totals
      this.receiptPrinter.println(`المجموع الفرعي: ${receiptData.subtotal.toFixed(2)} ج.م`);
      this.receiptPrinter.println(`الضريبة (14%): ${receiptData.tax.toFixed(2)} ج.م`);
      if (receiptData.discount > 0) {
        this.receiptPrinter.println(`الخصم: ${receiptData.discount.toFixed(2)} ج.م`);
      }
      
      this.receiptPrinter.bold(true);
      this.receiptPrinter.setTextSize(1, 1);
      this.receiptPrinter.println(`الإجمالي: ${receiptData.total.toFixed(2)} ج.م`);
      this.receiptPrinter.setTextSize(0, 0);
      this.receiptPrinter.bold(false);

      // Payment info
      this.receiptPrinter.drawLine();
      this.receiptPrinter.println(`طريقة الدفع: ${receiptData.paymentMethod}`);
      this.receiptPrinter.println(`المبلغ المدفوع: ${receiptData.amountPaid.toFixed(2)} ج.م`);
      if (receiptData.change > 0) {
        this.receiptPrinter.println(`الباقي: ${receiptData.change.toFixed(2)} ج.م`);
      }

      // Footer
      this.receiptPrinter.drawLine();
      this.receiptPrinter.alignCenter();
      this.receiptPrinter.println('شكراً لزيارتكم');
      this.receiptPrinter.println('Thank you for your visit');
      this.receiptPrinter.newLine();
      this.receiptPrinter.println('نظام طريقة لنقاط البيع');
      this.receiptPrinter.println('Tareeqa POS System');

      // Cut paper
      this.receiptPrinter.cut();

      // Execute print
      await this.receiptPrinter.execute();
      
      console.log('✅ Receipt printed successfully');
      return true;
    } catch (error) {
      console.error('❌ Print receipt error:', error);
      return false;
    }
  }

  /**
   * Open cash drawer
   */
  async openCashDrawer(): Promise<boolean> {
    try {
      if (this.cashDrawer && this.cashDrawer.isOpen) {
        // Standard cash drawer open command (ESC/POS)
        const openCommand = Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]);
        await new Promise<void>((resolve, reject) => {
          this.cashDrawer!.write(openCommand, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
        
        console.log('💰 Cash drawer opened');
        return true;
      } else if (this.receiptPrinter) {
        // Try to open through printer
        this.receiptPrinter.openCashDrawer();
        await this.receiptPrinter.execute();
        
        console.log('💰 Cash drawer opened via printer');
        return true;
      } else {
        console.warn('⚠️ No cash drawer available');
        return false;
      }
    } catch (error) {
      console.error('❌ Open cash drawer error:', error);
      return false;
    }
  }

  /**
   * Test all hardware devices
   */
  async testHardware(): Promise<{ [key: string]: boolean }> {
    const results = {
      barcodeScanner: false,
      receiptPrinter: false,
      cashDrawer: false
    };

    // Test barcode scanner
    if (this.barcodeScanner && this.barcodeScanner.isOpen) {
      results.barcodeScanner = true;
    }

    // Test receipt printer
    if (this.receiptPrinter) {
      try {
        results.receiptPrinter = await this.receiptPrinter.isPrinterConnected();
      } catch (error) {
        results.receiptPrinter = false;
      }
    }

    // Test cash drawer
    if (this.cashDrawer && this.cashDrawer.isOpen) {
      results.cashDrawer = true;
    }

    console.log('🧪 Hardware test results:', results);
    return results;
  }

  /**
   * Print test receipt
   */
  async printTestReceipt(): Promise<boolean> {
    const testData = {
      storeName: 'متجر طريقة - اختبار',
      storeNameEnglish: 'Tareeqa Store - Test',
      receiptNumber: 'TEST-001',
      date: new Date().toLocaleDateString('ar-EG'),
      time: new Date().toLocaleTimeString('ar-EG'),
      cashierName: 'مستخدم الاختبار',
      items: [
        {
          name: 'منتج تجريبي',
          quantity: 1,
          price: 10.00,
          total: 10.00
        }
      ],
      subtotal: 10.00,
      tax: 1.40,
      discount: 0,
      total: 11.40,
      paymentMethod: 'نقداً',
      amountPaid: 15.00,
      change: 3.60
    };

    return await this.printReceipt(testData);
  }

  /**
   * Get hardware status
   */
  getHardwareStatus(): any {
    return {
      initialized: this.isInitialized,
      barcodeScanner: {
        connected: this.barcodeScanner?.isOpen || false,
        port: this.barcodeScanner?.path || null
      },
      receiptPrinter: {
        connected: this.receiptPrinter !== null,
        type: this.receiptPrinter ? 'Thermal' : null
      },
      cashDrawer: {
        connected: this.cashDrawer?.isOpen || false,
        port: this.cashDrawer?.path || null
      }
    };
  }

  /**
   * Disconnect all hardware
   */
  async disconnect(): Promise<void> {
    console.log('🔌 Disconnecting hardware devices...');

    try {
      if (this.barcodeScanner && this.barcodeScanner.isOpen) {
        this.barcodeScanner.close();
      }

      if (this.cashDrawer && this.cashDrawer.isOpen) {
        this.cashDrawer.close();
      }

      // Thermal printer doesn't need explicit disconnect
      this.receiptPrinter = null;

      console.log('✅ Hardware devices disconnected');
    } catch (error) {
      console.error('❌ Hardware disconnect error:', error);
    }
  }

  /**
   * Refresh hardware connections
   */
  async refresh(): Promise<void> {
    await this.disconnect();
    await this.initialize();
  }
}
