import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Printer, Monitor, Database, Wifi, Bell, Save, RotateCcw, CheckCircle } from 'lucide-react';

interface ConfigSection {
  id: string;
  title: string;
  titleEn: string;
  icon: any;
}

const SystemConfiguration = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  
  const [config, setConfig] = useState({
    general: {
      storeName: 'متجر طريقة',
      storeNameEn: 'Tareeqa Store',
      address: 'شارع التحرير، القاهرة، مصر',
      phone: '+20 2 1234 5678',
      email: 'info@tareeqa.com',
      taxNumber: '123-456-789',
      currency: 'EGP',
      language: 'ar',
      timezone: 'Africa/Cairo'
    },
    display: {
      theme: 'light',
      fontSize: 'medium',
      animations: true,
      glassEffect: true,
      rtlSupport: true,
      touchMode: true,
      screenSaver: 10
    },
    printer: {
      defaultPrinter: 'Receipt Printer',
      paperSize: '80mm',
      printLogo: true,
      printFooter: true,
      copies: 1,
      autoOpen: true
    },
    database: {
      autoBackup: true,
      backupInterval: 'daily',
      backupLocation: 'C:\\Tareeqa\\Backups',
      encryption: true,
      compression: true
    },
    network: {
      autoConnect: true,
      serverUrl: 'https://api.tareeqa.com',
      syncInterval: 30,
      offlineMode: true
    },
    notifications: {
      lowStock: true,
      dailyReport: true,
      systemUpdates: true,
      soundEnabled: true,
      emailNotifications: false
    }
  });

  const sections: ConfigSection[] = [
    { id: 'general', title: 'عام', titleEn: 'General', icon: Settings },
    { id: 'display', title: 'العرض', titleEn: 'Display', icon: Monitor },
    { id: 'printer', title: 'الطابعة', titleEn: 'Printer', icon: Printer },
    { id: 'database', title: 'قاعدة البيانات', titleEn: 'Database', icon: Database },
    { id: 'network', title: 'الشبكة', titleEn: 'Network', icon: Wifi },
    { id: 'notifications', title: 'التنبيهات', titleEn: 'Notifications', icon: Bell }
  ];

  const updateConfig = (section: string, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveConfiguration = () => {
    // Simulate saving configuration
    console.log('Saving configuration:', config);
    setHasChanges(false);
    // Show success message
  };

  const resetToDefaults = () => {
    // Reset to default values
    setHasChanges(true);
  };

  const FormField = ({ label, labelEn, children }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-primary-900">
        {label}
        <span className="text-primary-600 text-xs ml-2">({labelEn})</span>
      </label>
      {children}
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="اسم المتجر" labelEn="Store Name">
          <input
            type="text"
            value={config.general.storeName}
            onChange={(e) => updateConfig('general', 'storeName', e.target.value)}
            className="input-glass"
          />
        </FormField>

        <FormField label="Store Name (English)" labelEn="English Name">
          <input
            type="text"
            value={config.general.storeNameEn}
            onChange={(e) => updateConfig('general', 'storeNameEn', e.target.value)}
            className="input-glass"
          />
        </FormField>

        <FormField label="العنوان" labelEn="Address">
          <textarea
            value={config.general.address}
            onChange={(e) => updateConfig('general', 'address', e.target.value)}
            className="input-glass h-20 resize-none"
          />
        </FormField>

        <FormField label="رقم الهاتف" labelEn="Phone Number">
          <input
            type="tel"
            value={config.general.phone}
            onChange={(e) => updateConfig('general', 'phone', e.target.value)}
            className="input-glass"
          />
        </FormField>

        <FormField label="البريد الإلكتروني" labelEn="Email">
          <input
            type="email"
            value={config.general.email}
            onChange={(e) => updateConfig('general', 'email', e.target.value)}
            className="input-glass"
          />
        </FormField>

        <FormField label="الرقم الضريبي" labelEn="Tax Number">
          <input
            type="text"
            value={config.general.taxNumber}
            onChange={(e) => updateConfig('general', 'taxNumber', e.target.value)}
            className="input-glass"
          />
        </FormField>
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="المظهر" labelEn="Theme">
          <select
            value={config.display.theme}
            onChange={(e) => updateConfig('display', 'theme', e.target.value)}
            className="input-glass"
          >
            <option value="light">فاتح (Light)</option>
            <option value="dark">داكن (Dark)</option>
            <option value="auto">تلقائي (Auto)</option>
          </select>
        </FormField>

        <FormField label="حجم الخط" labelEn="Font Size">
          <select
            value={config.display.fontSize}
            onChange={(e) => updateConfig('display', 'fontSize', e.target.value)}
            className="input-glass"
          >
            <option value="small">صغير (Small)</option>
            <option value="medium">متوسط (Medium)</option>
            <option value="large">كبير (Large)</option>
          </select>
        </FormField>

        <FormField label="الحركات المتحركة" labelEn="Animations">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.display.animations}
              onChange={(e) => updateConfig('display', 'animations', e.target.checked)}
              className="rounded border-primary-300"
            />
            <span>تفعيل الحركات المتحركة</span>
          </label>
        </FormField>

        <FormField label="تأثير الزجاج" labelEn="Glass Effect">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.display.glassEffect}
              onChange={(e) => updateConfig('display', 'glassEffect', e.target.checked)}
              className="rounded border-primary-300"
            />
            <span>تفعيل تأثير الزجاج</span>
          </label>
        </FormField>
      </div>
    </div>
  );

  const renderPrinterSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="الطابعة الافتراضية" labelEn="Default Printer">
          <select
            value={config.printer.defaultPrinter}
            onChange={(e) => updateConfig('printer', 'defaultPrinter', e.target.value)}
            className="input-glass"
          >
            <option value="Receipt Printer">طابعة الفواتير</option>
            <option value="Thermal Printer">الطابعة الحرارية</option>
            <option value="Laser Printer">طابعة ليزر</option>
          </select>
        </FormField>

        <FormField label="حجم الورق" labelEn="Paper Size">
          <select
            value={config.printer.paperSize}
            onChange={(e) => updateConfig('printer', 'paperSize', e.target.value)}
            className="input-glass"
          >
            <option value="80mm">80 مم</option>
            <option value="58mm">58 مم</option>
            <option value="A4">A4</option>
          </select>
        </FormField>

        <FormField label="طباعة الشعار" labelEn="Print Logo">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.printer.printLogo}
              onChange={(e) => updateConfig('printer', 'printLogo', e.target.checked)}
              className="rounded border-primary-300"
            />
            <span>طباعة شعار المتجر</span>
          </label>
        </FormField>

        <FormField label="عدد النسخ" labelEn="Number of Copies">
          <input
            type="number"
            min="1"
            max="5"
            value={config.printer.copies}
            onChange={(e) => updateConfig('printer', 'copies', parseInt(e.target.value))}
            className="input-glass"
          />
        </FormField>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'display': return renderDisplaySettings();
      case 'printer': return renderPrinterSettings();
      default: return <div className="text-center text-primary-600">قريباً...</div>;
    }
  };

  return (
    <div className="flex gap-6 h-full" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 glass-white rounded-2xl p-4 shadow-lg">
        <h3 className="text-lg font-bold text-primary-900 mb-4">الإعدادات</h3>
        
        <nav className="space-y-2">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                activeSection === section.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'hover:bg-white/30 text-primary-700'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <div className="text-right flex-1">
                <div className="font-medium">{section.title}</div>
                <div className="text-xs opacity-80">{section.titleEn}</div>
              </div>
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="glass-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary-900">
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              <p className="text-primary-600">
                {sections.find(s => s.id === activeSection)?.titleEn}
              </p>
            </div>
            
            {hasChanges && (
              <div className="flex items-center gap-2 text-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm">تغييرات غير محفوظة</span>
              </div>
            )}
          </div>
        </div>

        {/* Settings Content */}
        <div className="glass-white rounded-2xl p-6 shadow-lg">
          {renderCurrentSection()}
        </div>

        {/* Action Buttons */}
        <div className="glass-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveConfiguration}
                disabled={!hasChanges}
                className={`btn-primary flex items-center gap-2 ${
                  !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetToDefaults}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                استعادة الافتراضي
              </motion.button>
            </div>

            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">آخر حفظ: اليوم 14:30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;
