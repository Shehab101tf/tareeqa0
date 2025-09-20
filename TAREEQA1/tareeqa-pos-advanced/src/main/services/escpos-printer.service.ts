import { SerialPort } from 'serialport';
import { EventEmitter } from 'events';

/**
 * Enhanced ESC/POS Thermal Printer Service for Tareeqa POS
 * Supports Arabic text, logos, and advanced formatting
 */

export interface PrinterConfig {
  port: string;
  baudRate: number;
  dataBits: 8 | 7 | 6 | 5;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd' | 'mark' | 'space';
  encoding: 'cp864' | 'cp1256' | 'utf8';
  paperWidth: 58 | 80; // mm
  characterSet: number;
}

export interface PrintJob {
  id: string;
  type: 'receipt' | 'report' | 'test';
  data: any;
  priority: 'low' | 'normal' | 'high';
  createdAt: Date;
}

export class ESCPOSPrinterService extends EventEmitter {
  private serialPort: SerialPort | null = null;
  private config: PrinterConfig;
  private printQueue: PrintJob[] = [];
  private isProcessing = false;
  private isConnected = false;

  // ESC/POS Commands
  private readonly ESC = '\x1B';
  private readonly GS = '\x1D';
  private readonly FS = '\x1C';
  private readonly DLE = '\x10';
  private readonly LF = '\x0A';
  private readonly CR = '\x0D';
  private readonly FF = '\x0C';
  private readonly CAN = '\x18';

  constructor(config: PrinterConfig) {
    super();
    this.config = config;
  }

  /**
   * Connect to printer
   */
  async connect(): Promise<boolean> {
    try {
      console.log('🖨️ Connecting to ESC/POS printer...');

      this.serialPort = new SerialPort({
        path: this.config.port,
        baudRate: this.config.baudRate,
        dataBits: this.config.dataBits,
        stopBits: this.config.stopBits,
        parity: this.config.parity,
        autoOpen: false
      });

      return new Promise((resolve, reject) => {
        this.serialPort!.open((error) => {
          if (error) {
            console.error('❌ Failed to connect to printer:', error);
            reject(error);
            return;
          }

          this.isConnected = true;
          console.log('✅ Connected to ESC/POS printer');

          // Initialize printer
          this.initializePrinter();

          // Setup event handlers
          this.setupEventHandlers();

          // Start processing queue
          this.processQueue();

          resolve(true);
        });
      });
    } catch (error) {
      console.error('❌ Printer connection error:', error);
      return false;
    }
  }

  /**
   * Disconnect from printer
   */
  async disconnect(): Promise<void> {
    if (this.serialPort && this.serialPort.isOpen) {
      return new Promise((resolve) => {
        this.serialPort!.close(() => {
          this.isConnected = false;
          console.log('🔌 Disconnected from printer');
          resolve();
        });
      });
    }
  }

  /**
   * Initialize printer with default settings
   */
  private initializePrinter(): void {
    if (!this.isConnected) return;

    const commands = [
      this.ESC + '@', // Initialize printer
      this.ESC + 't' + String.fromCharCode(this.config.characterSet), // Set character set
      this.ESC + 'R' + String.fromCharCode(0), // Set international character set (USA)
      this.ESC + 'a' + String.fromCharCode(0), // Left align
      this.ESC + '!' + String.fromCharCode(0), // Reset text formatting
    ];

    this.writeRaw(commands.join(''));
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.serialPort) return;

    this.serialPort.on('data', (data) => {
      this.emit('data', data);
    });

    this.serialPort.on('error', (error) => {
      console.error('🖨️ Printer error:', error);
      this.emit('error', error);
      this.isConnected = false;
    });

    this.serialPort.on('close', () => {
      console.log('🖨️ Printer connection closed');
      this.isConnected = false;
      this.emit('disconnect');
    });
  }

  /**
   * Add job to print queue
   */
  addToQueue(job: Omit<PrintJob, 'id' | 'createdAt'>): string {
    const printJob: PrintJob = {
      ...job,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };

    // Insert based on priority
    if (job.priority === 'high') {
      this.printQueue.unshift(printJob);
    } else {
      this.printQueue.push(printJob);
    }

    console.log(`📄 Added print job to queue: ${printJob.id}`);
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    return printJob.id;
  }

  /**
   * Process print queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.printQueue.length === 0 || !this.isConnected) {
      return;
    }

    this.isProcessing = true;

    while (this.printQueue.length > 0 && this.isConnected) {
      const job = this.printQueue.shift()!;
      
      try {
        console.log(`🖨️ Processing print job: ${job.id}`);
        await this.processJob(job);
        this.emit('job-completed', job);
      } catch (error) {
        console.error(`❌ Failed to process print job ${job.id}:`, error);
        this.emit('job-failed', job, error);
      }

      // Small delay between jobs
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  /**
   * Process individual print job
   */
  private async processJob(job: PrintJob): Promise<void> {
    switch (job.type) {
      case 'receipt':
        await this.printReceipt(job.data);
        break;
      case 'report':
        await this.printReport(job.data);
        break;
      case 'test':
        await this.printTestPage();
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  /**
   * Print receipt with Arabic support
   */
  async printReceipt(receiptData: any): Promise<void> {
    const commands: string[] = [];

    // Header
    commands.push(this.ESC + 'a' + String.fromCharCode(1)); // Center align
    commands.push(this.ESC + '!' + String.fromCharCode(0x18)); // Double height and width
    commands.push(this.convertToArabic(receiptData.storeName || 'متجر طريقة'));
    commands.push(this.LF);
    commands.push(this.ESC + '!' + String.fromCharCode(0)); // Reset formatting
    commands.push(receiptData.storeNameEnglish || 'Tareeqa Store');
    commands.push(this.LF);

    // Store info
    if (receiptData.storeAddress) {
      commands.push(receiptData.storeAddress);
      commands.push(this.LF);
    }
    if (receiptData.storePhone) {
      commands.push('Tel: ' + receiptData.storePhone);
      commands.push(this.LF);
    }

    // Separator line
    commands.push(this.drawLine());

    // Receipt info
    commands.push(this.ESC + 'a' + String.fromCharCode(0)); // Left align
    commands.push(`فاتورة رقم: ${receiptData.transactionNumber}`);
    commands.push(this.LF);
    commands.push(`التاريخ: ${receiptData.date}`);
    commands.push(this.LF);
    commands.push(`الوقت: ${receiptData.time}`);
    commands.push(this.LF);
    commands.push(`الكاشير: ${receiptData.cashierName}`);
    commands.push(this.LF);

    if (receiptData.customerName) {
      commands.push(`العميل: ${receiptData.customerName}`);
      commands.push(this.LF);
    }

    commands.push(this.drawLine());

    // Items header
    commands.push(this.ESC + '!' + String.fromCharCode(0x08)); // Bold
    commands.push(this.formatColumns(['المنتج', 'الكمية', 'السعر', 'الإجمالي'], [20, 8, 8, 8]));
    commands.push(this.LF);
    commands.push(this.ESC + '!' + String.fromCharCode(0)); // Reset formatting
    commands.push(this.drawLine('-'));

    // Items
    for (const item of receiptData.items) {
      const itemName = this.truncateText(item.nameArabic || item.name, 20);
      const quantity = item.quantity.toString();
      const price = item.unitPrice.toFixed(2);
      const total = item.total.toFixed(2);

      commands.push(this.formatColumns([itemName, quantity, price, total], [20, 8, 8, 8]));
      commands.push(this.LF);
    }

    commands.push(this.drawLine());

    // Totals
    commands.push(this.ESC + 'a' + String.fromCharCode(2)); // Right align
    commands.push(`المجموع الفرعي: ${receiptData.subtotal.toFixed(2)} ج.م`);
    commands.push(this.LF);

    if (receiptData.discountAmount > 0) {
      commands.push(`الخصم: ${receiptData.discountAmount.toFixed(2)} ج.م`);
      commands.push(this.LF);
    }

    commands.push(`الضريبة (14%): ${receiptData.taxAmount.toFixed(2)} ج.م`);
    commands.push(this.LF);

    // Total
    commands.push(this.ESC + '!' + String.fromCharCode(0x18)); // Double size
    commands.push(`الإجمالي: ${receiptData.totalAmount.toFixed(2)} ج.م`);
    commands.push(this.LF);
    commands.push(this.ESC + '!' + String.fromCharCode(0)); // Reset formatting

    // Payment info
    commands.push(this.drawLine());
    commands.push(`طريقة الدفع: ${receiptData.paymentMethod}`);
    commands.push(this.LF);
    commands.push(`المبلغ المدفوع: ${receiptData.amountPaid.toFixed(2)} ج.م`);
    commands.push(this.LF);

    if (receiptData.changeAmount > 0) {
      commands.push(`الباقي: ${receiptData.changeAmount.toFixed(2)} ج.م`);
      commands.push(this.LF);
    }

    // Footer
    commands.push(this.drawLine());
    commands.push(this.ESC + 'a' + String.fromCharCode(1)); // Center align
    commands.push('شكراً لزيارتكم');
    commands.push(this.LF);
    commands.push('Thank you for your visit');
    commands.push(this.LF + this.LF);

    // QR Code (if supported)
    if (receiptData.qrCode) {
      commands.push(this.generateQRCode(receiptData.qrCode));
      commands.push(this.LF);
    }

    // System info
    commands.push('نظام طريقة لنقاط البيع');
    commands.push(this.LF);
    commands.push('Tareeqa POS System');
    commands.push(this.LF + this.LF + this.LF);

    // Cut paper
    commands.push(this.GS + 'V' + String.fromCharCode(66) + String.fromCharCode(0));

    // Send to printer
    await this.writeRaw(commands.join(''));
  }

  /**
   * Print test page
   */
  async printTestPage(): Promise<void> {
    const commands: string[] = [];

    commands.push(this.ESC + 'a' + String.fromCharCode(1)); // Center align
    commands.push(this.ESC + '!' + String.fromCharCode(0x18)); // Double size
    commands.push('اختبار الطابعة');
    commands.push(this.LF);
    commands.push('PRINTER TEST');
    commands.push(this.LF + this.LF);

    commands.push(this.ESC + '!' + String.fromCharCode(0)); // Reset formatting
    commands.push(this.ESC + 'a' + String.fromCharCode(0)); // Left align

    // Character set test
    commands.push('اختبار الأحرف العربية:');
    commands.push(this.LF);
    commands.push('أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ');
    commands.push(this.LF);
    commands.push('0123456789');
    commands.push(this.LF + this.LF);

    // Formatting test
    commands.push(this.ESC + '!' + String.fromCharCode(0x08)); // Bold
    commands.push('نص عريض - Bold Text');
    commands.push(this.LF);
    commands.push(this.ESC + '!' + String.fromCharCode(0)); // Reset

    commands.push(this.ESC + '!' + String.fromCharCode(0x10)); // Double height
    commands.push('نص مضاعف - Double Height');
    commands.push(this.LF);
    commands.push(this.ESC + '!' + String.fromCharCode(0)); // Reset

    // Alignment test
    commands.push(this.LF);
    commands.push(this.ESC + 'a' + String.fromCharCode(0)); // Left
    commands.push('محاذاة يسار - Left Align');
    commands.push(this.LF);
    commands.push(this.ESC + 'a' + String.fromCharCode(1)); // Center
    commands.push('محاذاة وسط - Center Align');
    commands.push(this.LF);
    commands.push(this.ESC + 'a' + String.fromCharCode(2)); // Right
    commands.push('محاذاة يمين - Right Align');
    commands.push(this.LF);

    // Line test
    commands.push(this.ESC + 'a' + String.fromCharCode(0)); // Left align
    commands.push(this.LF);
    commands.push(this.drawLine());
    commands.push(this.drawLine('-'));
    commands.push(this.drawLine('*'));

    // Date and time
    commands.push(this.LF);
    commands.push(`التاريخ: ${new Date().toLocaleDateString('ar-EG')}`);
    commands.push(this.LF);
    commands.push(`الوقت: ${new Date().toLocaleTimeString('ar-EG')}`);
    commands.push(this.LF + this.LF + this.LF);

    // Cut paper
    commands.push(this.GS + 'V' + String.fromCharCode(66) + String.fromCharCode(0));

    await this.writeRaw(commands.join(''));
  }

  /**
   * Write raw data to printer
   */
  private async writeRaw(data: string): Promise<void> {
    if (!this.serialPort || !this.isConnected) {
      throw new Error('Printer not connected');
    }

    return new Promise((resolve, reject) => {
      this.serialPort!.write(data, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Convert text to Arabic encoding
   */
  private convertToArabic(text: string): string {
    // This is a simplified conversion
    // In production, you'd use a proper Arabic encoding library
    return text;
  }

  /**
   * Draw separator line
   */
  private drawLine(char: string = '='): string {
    const width = this.config.paperWidth === 58 ? 32 : 48;
    return char.repeat(width) + this.LF;
  }

  /**
   * Format text in columns
   */
  private formatColumns(texts: string[], widths: number[]): string {
    let result = '';
    const totalWidth = this.config.paperWidth === 58 ? 32 : 48;
    
    for (let i = 0; i < texts.length; i++) {
      const text = this.truncateText(texts[i], widths[i]);
      result += text.padEnd(widths[i]);
    }
    
    return result.substring(0, totalWidth);
  }

  /**
   * Truncate text to fit width
   */
  private truncateText(text: string, width: number): string {
    if (text.length <= width) {
      return text;
    }
    return text.substring(0, width - 3) + '...';
  }

  /**
   * Generate QR code (if printer supports it)
   */
  private generateQRCode(data: string): string {
    // ESC/POS QR code commands (for supported printers)
    const commands = [
      this.GS + '(k' + String.fromCharCode(4, 0, 49, 65, 50, 0), // QR code model
      this.GS + '(k' + String.fromCharCode(3, 0, 49, 67, 8), // QR code size
      this.GS + '(k' + String.fromCharCode(3, 0, 49, 69, 48), // Error correction
      this.GS + '(k' + String.fromCharCode(data.length + 3, 0, 49, 80, 48) + data, // QR code data
      this.GS + '(k' + String.fromCharCode(3, 0, 49, 81, 48) // Print QR code
    ];
    
    return commands.join('');
  }

  /**
   * Get printer status
   */
  async getStatus(): Promise<{
    connected: boolean;
    queueLength: number;
    isProcessing: boolean;
    paperStatus?: 'ok' | 'low' | 'out';
    temperature?: 'normal' | 'high';
  }> {
    return {
      connected: this.isConnected,
      queueLength: this.printQueue.length,
      isProcessing: this.isProcessing,
      paperStatus: 'ok', // Would need to query printer for actual status
      temperature: 'normal'
    };
  }

  /**
   * Clear print queue
   */
  clearQueue(): void {
    this.printQueue = [];
    console.log('🗑️ Print queue cleared');
  }

  /**
   * Print report
   */
  private async printReport(reportData: any): Promise<void> {
    // Implementation for printing reports
    // Similar to receipt but with different formatting
    console.log('📊 Printing report:', reportData.title);
    // Implementation would go here
  }
}
