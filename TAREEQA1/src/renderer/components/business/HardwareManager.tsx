import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Printer, Scan, Wifi, WifiOff, CheckCircle, XCircle, AlertTriangle, Settings } from 'lucide-react';

interface HardwareDevice {
  id: string;
  name: string;
  nameEn: string;
  type: 'scanner' | 'printer' | 'drawer';
  status: 'connected' | 'disconnected' | 'error';
  lastSeen?: Date;
}

const HardwareManager = () => {
  const [devices, setDevices] = useState<HardwareDevice[]>([
    {
      id: 'scanner-1',
      name: 'ماسح الباركود',
      nameEn: 'Barcode Scanner',
      type: 'scanner',
      status: 'connected',
      lastSeen: new Date()
    },
    {
      id: 'printer-1',
      name: 'طابعة الفواتير',
      nameEn: 'Receipt Printer',
      type: 'printer',
      status: 'connected',
      lastSeen: new Date()
    },
    {
      id: 'drawer-1',
      name: 'درج النقود',
      nameEn: 'Cash Drawer',
      type: 'drawer',
      status: 'disconnected'
    }
  ]);

  const [scannerInput, setScannerInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'scanner': return Scan;
      case 'printer': return Printer;
      case 'drawer': return Settings;
      default: return Settings;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'disconnected': return XCircle;
      case 'error': return AlertTriangle;
      default: return XCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'error': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const simulateBarcodeScan = () => {
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      const mockBarcodes = [
        '1234567890123',
        '9876543210987',
        '5555666677778',
        '1111222233334'
      ];
      
      const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
      setScannerInput(randomBarcode);
      setIsScanning(false);
      
      // Trigger barcode scan event
      if (window.electronAPI?.hardware?.simulateBarcodeScan) {
        window.electronAPI.hardware.simulateBarcodeScan(randomBarcode);
      }
    }, 2000);
  };

  const testPrinter = async () => {
    try {
      const testReceipt = {
        storeName: 'متجر طريقة',
        storeNameEn: 'Tareeqa Store',
        items: [
          { name: 'قهوة عربية', nameEn: 'Arabic Coffee', price: 25.00, quantity: 1 },
          { name: 'شاي أحمر', nameEn: 'Black Tea', price: 15.00, quantity: 2 }
        ],
        total: 55.00,
        vat: 7.70,
        grandTotal: 62.70,
        date: new Date().toLocaleDateString('ar-EG'),
        time: new Date().toLocaleTimeString('ar-EG')
      };

      if (window.electronAPI?.hardware?.printer?.print) {
        const success = await window.electronAPI.hardware.printer.print(testReceipt);
        if (success) {
          // Show success toast
          console.log('Test receipt printed successfully');
        }
      } else {
        // Simulate printing
        console.log('Simulating printer test:', testReceipt);
      }
    } catch (error) {
      console.error('Printer test failed:', error);
    }
  };

  const connectDevice = async (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, status: 'connected', lastSeen: new Date() }
        : device
    ));
  };

  const disconnectDevice = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, status: 'disconnected' }
        : device
    ));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-primary-900 mb-2">إدارة الأجهزة</h2>
        <p className="text-primary-600">Hardware Management</p>
      </div>

      {/* Scanner Test */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
          <Scan className="w-5 h-5" />
          اختبار الماسح الضوئي
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={scannerInput}
              onChange={(e) => setScannerInput(e.target.value)}
              placeholder="نتيجة المسح ستظهر هنا... Scan result will appear here..."
              className="input-glass flex-1"
              readOnly={isScanning}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={simulateBarcodeScan}
              disabled={isScanning}
              className={`btn-primary px-6 py-3 flex items-center gap-2 ${
                isScanning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري المسح...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  محاكاة المسح
                </>
              )}
            </motion.button>
          </div>
          
          {scannerInput && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-success rounded-lg p-4"
            >
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">تم المسح بنجاح: {scannerInput}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Printer Test */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
          <Printer className="w-5 h-5" />
          اختبار الطابعة
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={testPrinter}
          className="btn-secondary flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          طباعة فاتورة تجريبية
        </motion.button>
      </div>

      {/* Device Status */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-primary-900 mb-4">حالة الأجهزة</h3>
        
        <div className="space-y-4">
          {devices.map((device, index) => {
            const DeviceIcon = getDeviceIcon(device.type);
            const StatusIcon = getStatusIcon(device.status);
            const statusColor = getStatusColor(device.status);
            
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <DeviceIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-primary-900">{device.name}</h4>
                    <p className="text-sm text-primary-600">{device.nameEn}</p>
                    {device.lastSeen && (
                      <p className="text-xs text-primary-500">
                        آخر اتصال: {device.lastSeen.toLocaleTimeString('ar-EG')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 ${statusColor}`}>
                    <StatusIcon className="w-5 h-5" />
                    <span className="font-medium">
                      {device.status === 'connected' ? 'متصل' : 
                       device.status === 'disconnected' ? 'غير متصل' : 'خطأ'}
                    </span>
                  </div>
                  
                  {device.status === 'disconnected' ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => connectDevice(device.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                    >
                      اتصال
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => disconnectDevice(device.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                    >
                      قطع
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Connection Status */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-primary-900 mb-4">حالة الشبكة</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wifi className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-primary-900">متصل بالشبكة</p>
              <p className="text-sm text-primary-600">Connected to Network</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-primary-600">عنوان IP</p>
            <p className="font-mono text-primary-900">192.168.1.100</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareManager;
