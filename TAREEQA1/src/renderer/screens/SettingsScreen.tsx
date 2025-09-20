import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Settings, 
  Building, 
  HardDisk, 
  Users, 
  Shield, 
  Database,
  Printer,
  Scan,
  Wifi,
  Save,
  RefreshCw,
  Globe,
  Palette,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useRTL } from '../components/common/RTLProvider';
import { useTheme, ThemeToggle } from '../components/common/ThemeProvider';
import GlassCard from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useRTL();
  const { actualTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('company');
  const [settings, setSettings] = useState({
    // Company Settings
    companyName: 'متجر طريقة للتجارة',
    companyAddress: 'شارع النيل، المعادي، القاهرة، مصر',
    companyPhone: '02-12345678',
    companyEmail: 'info@tareeqa-store.com',
    taxNumber: '123-456-789-012',
    currency: 'EGP',
    language: 'ar',
    timezone: 'Africa/Cairo',
    
    // Hardware Settings
    receiptPrinter: 'EPSON TM-T20III',
    barcodeScanner: 'Honeywell Voyager 1200g',
    cashDrawer: 'APG Vasario 1616',
    printerPort: 'USB001',
    scannerPort: 'COM3',
    
    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    lowStockAlert: true,
    autoPrintReceipt: true,
    soundEnabled: true,
    notifications: true,
    
    // Security Settings
    sessionTimeout: 30,
    requirePassword: true,
    auditLog: true,
    dataEncryption: true,
  });

  const tabs = [
    { id: 'company', label: 'معلومات الشركة', icon: Building },
    { id: 'hardware', label: 'الأجهزة', icon: HardDisk },
    { id: 'system', label: 'النظام', icon: Settings },
    { id: 'security', label: 'الأمان', icon: Shield },
    { id: 'users', label: 'المستخدمين', icon: Users },
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  const handleTestPrinter = () => {
    toast.success('اختبار الطابعة - تم طباعة صفحة تجريبية');
  };

  const handleTestScanner = () => {
    toast.success('اختبار الماسح - جاهز لقراءة الباركود');
  };

  const handleBackupNow = () => {
    toast.success('جاري إنشاء نسخة احتياطية...');
  };

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم الشركة
          </label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => handleSettingChange('companyName', e.target.value)}
            className="input-glass w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الرقم الضريبي
          </label>
          <input
            type="text"
            value={settings.taxNumber}
            onChange={(e) => handleSettingChange('taxNumber', e.target.value)}
            className="input-glass w-full"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عنوان الشركة
        </label>
        <textarea
          value={settings.companyAddress}
          onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
          className="input-glass w-full h-24 resize-none"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف
          </label>
          <input
            type="tel"
            value={settings.companyPhone}
            onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
            className="input-glass w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            value={settings.companyEmail}
            onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
            className="input-glass w-full"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            العملة
          </label>
          <select
            value={settings.currency}
            onChange={(e) => handleSettingChange('currency', e.target.value)}
            className="input-glass w-full"
          >
            <option value="EGP">جنيه مصري (EGP)</option>
            <option value="USD">دولار أمريكي (USD)</option>
            <option value="EUR">يورو (EUR)</option>
            <option value="SAR">ريال سعودي (SAR)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اللغة
          </label>
          <select
            value={settings.language}
            onChange={(e) => {
              handleSettingChange('language', e.target.value);
              i18n.changeLanguage(e.target.value);
            }}
            className="input-glass w-full"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المنطقة الزمنية
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
            className="input-glass w-full"
          >
            <option value="Africa/Cairo">القاهرة (GMT+2)</option>
            <option value="Asia/Riyadh">الرياض (GMT+3)</option>
            <option value="Asia/Dubai">دبي (GMT+4)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderHardwareSettings = () => (
    <div className="space-y-6">
      {/* Receipt Printer */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Printer className="w-6 h-6 text-primary-600 mr-3 rtl:mr-0 rtl:ml-3" />
            <div>
              <h3 className="font-medium text-gray-900">طابعة الفواتير</h3>
              <p className="text-sm text-gray-500">إعدادات طابعة الإيصالات</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600">متصل</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الطابعة
            </label>
            <input
              type="text"
              value={settings.receiptPrinter}
              onChange={(e) => handleSettingChange('receiptPrinter', e.target.value)}
              className="input-glass w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              منفذ الاتصال
            </label>
            <select
              value={settings.printerPort}
              onChange={(e) => handleSettingChange('printerPort', e.target.value)}
              className="input-glass w-full"
            >
              <option value="USB001">USB001</option>
              <option value="COM1">COM1</option>
              <option value="LPT1">LPT1</option>
              <option value="Network">شبكة</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <GlassButton
            variant="outline"
            size="sm"
            onClick={handleTestPrinter}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            اختبار الطابعة
          </GlassButton>
        </div>
      </GlassCard>

      {/* Barcode Scanner */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Scan className="w-6 h-6 text-primary-600 mr-3 rtl:mr-0 rtl:ml-3" />
            <div>
              <h3 className="font-medium text-gray-900">ماسح الباركود</h3>
              <p className="text-sm text-gray-500">إعدادات قارئ الباركود</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600">متصل</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الماسح
            </label>
            <input
              type="text"
              value={settings.barcodeScanner}
              onChange={(e) => handleSettingChange('barcodeScanner', e.target.value)}
              className="input-glass w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              منفذ الاتصال
            </label>
            <select
              value={settings.scannerPort}
              onChange={(e) => handleSettingChange('scannerPort', e.target.value)}
              className="input-glass w-full"
            >
              <option value="COM3">COM3</option>
              <option value="USB002">USB002</option>
              <option value="Bluetooth">بلوتوث</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <GlassButton
            variant="outline"
            size="sm"
            onClick={handleTestScanner}
            leftIcon={<Scan className="w-4 h-4" />}
          >
            اختبار الماسح
          </GlassButton>
        </div>
      </GlassCard>

      {/* Cash Drawer */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Database className="w-6 h-6 text-primary-600 mr-3 rtl:mr-0 rtl:ml-3" />
            <div>
              <h3 className="font-medium text-gray-900">درج النقود</h3>
              <p className="text-sm text-gray-500">إعدادات درج النقدية</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-yellow-600">غير متصل</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع الدرج
          </label>
          <input
            type="text"
            value={settings.cashDrawer}
            onChange={(e) => handleSettingChange('cashDrawer', e.target.value)}
            className="input-glass w-full"
          />
        </div>
      </GlassCard>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Settings */}
        <GlassCard className="p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
            النسخ الاحتياطي
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">تفعيل النسخ التلقائي</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تكرار النسخ
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                className="input-glass w-full"
                disabled={!settings.autoBackup}
              >
                <option value="hourly">كل ساعة</option>
                <option value="daily">يومياً</option>
                <option value="weekly">أسبوعياً</option>
                <option value="monthly">شهرياً</option>
              </select>
            </div>
            
            <GlassButton
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleBackupNow}
              leftIcon={<Database className="w-4 h-4" />}
            >
              إنشاء نسخة احتياطية الآن
            </GlassButton>
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard className="p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
            التنبيهات
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">تنبيه المخزون المنخفض</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.lowStockAlert}
                  onChange={(e) => handleSettingChange('lowStockAlert', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">طباعة تلقائية للفاتورة</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoPrintReceipt}
                  onChange={(e) => handleSettingChange('autoPrintReceipt', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">تفعيل الأصوات</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Theme Settings */}
      <GlassCard className="p-4">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
          المظهر
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">وضع المظهر</span>
            <p className="text-xs text-gray-500">
              المظهر الحالي: {actualTheme === 'dark' ? 'داكن' : 'فاتح'}
            </p>
          </div>
          <ThemeToggle size="lg" />
        </div>
      </GlassCard>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <GlassCard className="p-4">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
          إعدادات الأمان
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مهلة انتهاء الجلسة (بالدقائق)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="input-glass w-full"
              min="5"
              max="120"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">طلب كلمة مرور للوصول</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requirePassword}
                onChange={(e) => handleSettingChange('requirePassword', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تسجيل العمليات</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.auditLog}
                onChange={(e) => handleSettingChange('auditLog', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تشفير البيانات</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dataEncryption}
                onChange={(e) => handleSettingChange('dataEncryption', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return renderCompanySettings();
      case 'hardware':
        return renderHardwareSettings();
      case 'system':
        return renderSystemSettings();
      case 'security':
        return renderSecuritySettings();
      case 'users':
        return (
          <GlassCard className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">إدارة المستخدمين</h3>
            <p className="text-gray-600">ستتوفر هذه الميزة في الإصدار القادم</p>
          </GlassCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-white/70">
            إعدادات النظام والتخصيص
          </p>
        </div>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <GlassButton
            variant="secondary"
            size="lg"
            leftIcon={<RefreshCw className="w-5 h-5" />}
          >
            إعادة تعيين
          </GlassButton>
          
          <GlassButton
            variant="primary"
            size="lg"
            onClick={handleSaveSettings}
            leftIcon={<Save className="w-5 h-5" />}
          >
            حفظ الإعدادات
          </GlassButton>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-xl
                  transition-all duration-200 text-left rtl:text-right
                  ${activeTab === tab.id 
                    ? 'glass bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
