import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Lock, AlertTriangle, CheckCircle, XCircle, Fingerprint, Monitor, Calendar, Download } from 'lucide-react';

interface LicenseInfo {
  isValid: boolean;
  expiryDate: Date;
  licensedTo: string;
  licenseKey: string;
  features: string[];
  daysRemaining: number;
}

interface SecurityStatus {
  hardwareFingerprint: string;
  lastValidation: Date;
  encryptionStatus: boolean;
  tamperProtection: boolean;
  secureConnection: boolean;
}

const SecurityManager = () => {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>({
    isValid: true,
    expiryDate: new Date('2025-12-31'),
    licensedTo: 'متجر طريقة للتجارة',
    licenseKey: 'TRQA-2024-XXXX-XXXX-XXXX',
    features: ['نقطة البيع الأساسية', 'إدارة المخزون', 'التقارير المتقدمة', 'دعم الأجهزة'],
    daysRemaining: 315
  });

  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    hardwareFingerprint: 'HW-FP-7A8B9C2D1E3F4G5H',
    lastValidation: new Date(),
    encryptionStatus: true,
    tamperProtection: true,
    secureConnection: true
  });

  const [showLicenseKey, setShowLicenseKey] = useState(false);

  const getLicenseStatusColor = () => {
    if (!licenseInfo.isValid) return 'text-red-600';
    if (licenseInfo.daysRemaining <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getLicenseStatusIcon = () => {
    if (!licenseInfo.isValid) return XCircle;
    if (licenseInfo.daysRemaining <= 30) return AlertTriangle;
    return CheckCircle;
  };

  const SecurityStatusCard = ({ title, titleEn, status, icon: Icon, description }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-white rounded-xl p-4 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          status ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <Icon className={`w-5 h-5 ${status ? 'text-green-600' : 'text-red-600'}`} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-primary-900">{title}</h4>
          <p className="text-sm text-primary-600">{titleEn}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      <p className="text-sm text-primary-700">{description}</p>
    </motion.div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-primary-900">الأمان والترخيص</h2>
            <p className="text-primary-600">Security & License Management</p>
          </div>
        </div>
      </div>

      {/* License Information */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          معلومات الترخيص
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <span className="text-primary-700">حالة الترخيص:</span>
              <div className={`flex items-center gap-2 ${getLicenseStatusColor()}`}>
                {React.createElement(getLicenseStatusIcon(), { className: 'w-5 h-5' })}
                <span className="font-medium">
                  {licenseInfo.isValid ? 'صالح' : 'غير صالح'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <span className="text-primary-700">مرخص لـ:</span>
              <span className="font-medium text-primary-900">{licenseInfo.licensedTo}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <span className="text-primary-700">تاريخ الانتهاء:</span>
              <span className="font-medium text-primary-900">
                {licenseInfo.expiryDate.toLocaleDateString('ar-EG')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <span className="text-primary-700">الأيام المتبقية:</span>
              <span className={`font-bold ${getLicenseStatusColor()}`}>
                {licenseInfo.daysRemaining} يوم
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-white/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary-700">مفتاح الترخيص:</span>
                <button
                  onClick={() => setShowLicenseKey(!showLicenseKey)}
                  className="text-primary-500 hover:text-primary-700 text-sm"
                >
                  {showLicenseKey ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
              <div className="font-mono text-sm bg-primary-50 p-2 rounded border">
                {showLicenseKey ? licenseInfo.licenseKey : '••••-••••-••••-••••-••••'}
              </div>
            </div>

            <div className="p-3 bg-white/50 rounded-lg">
              <h4 className="text-primary-700 mb-2">الميزات المرخصة:</h4>
              <ul className="space-y-1">
                {licenseInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-primary-900">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {licenseInfo.daysRemaining <= 30 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">تحذير: الترخيص سينتهي قريباً!</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              يرجى تجديد الترخيص قبل انتهاء صلاحيته لتجنب انقطاع الخدمة.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors"
            >
              تجديد الترخيص
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Security Status */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          حالة الأمان
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SecurityStatusCard
            title="تشفير قاعدة البيانات"
            titleEn="Database Encryption"
            status={securityStatus.encryptionStatus}
            icon={Lock}
            description="جميع البيانات الحساسة مشفرة بتقنية AES-256"
          />

          <SecurityStatusCard
            title="حماية من التلاعب"
            titleEn="Tamper Protection"
            status={securityStatus.tamperProtection}
            icon={Shield}
            description="النظام محمي ضد محاولات التلاعب والتعديل"
          />

          <SecurityStatusCard
            title="الاتصال الآمن"
            titleEn="Secure Connection"
            status={securityStatus.secureConnection}
            icon={Key}
            description="جميع الاتصالات مشفرة ومؤمنة"
          />

          <SecurityStatusCard
            title="بصمة الجهاز"
            titleEn="Hardware Fingerprint"
            status={true}
            icon={Fingerprint}
            description="الترخيص مربوط بهذا الجهاز فقط"
          />
        </div>
      </div>

      {/* Hardware Fingerprint */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          بصمة الجهاز
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <span className="text-primary-700">معرف الجهاز:</span>
              <span className="font-mono text-sm text-primary-900">
                {securityStatus.hardwareFingerprint}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <span className="text-primary-700">آخر تحقق:</span>
              <span className="text-primary-900">
                {securityStatus.lastValidation.toLocaleString('ar-EG')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <span className="text-primary-700">حالة الربط:</span>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">مربوط بنجاح</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Fingerprint className="w-4 h-4" />
              معلومات مهمة
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• الترخيص مربوط بهذا الجهاز فقط</li>
              <li>• لا يمكن نقل الترخيص لجهاز آخر</li>
              <li>• يتم التحقق من البصمة عند كل تشغيل</li>
              <li>• اتصل بالدعم الفني لتغيير الجهاز</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Logs */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            سجل الأمان
          </h3>
          <button className="btn-secondary px-3 py-1 text-sm">
            <Download className="w-4 h-4 ml-1" />
            تصدير السجل
          </button>
        </div>

        <div className="space-y-2">
          {[
            { time: '14:30', event: 'تم تسجيل الدخول بنجاح', type: 'success' },
            { time: '14:25', event: 'تم التحقق من بصمة الجهاز', type: 'info' },
            { time: '14:20', event: 'تم بدء تشغيل النظام', type: 'info' },
            { time: '09:15', event: 'تم إنشاء نسخة احتياطية من البيانات', type: 'success' },
            { time: '09:00', event: 'تم تحديث قاعدة البيانات', type: 'info' },
          ].map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-white/30 rounded-lg"
            >
              <div className={`w-2 h-2 rounded-full ${
                log.type === 'success' ? 'bg-green-500' : 
                log.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <span className="text-sm text-primary-600 w-16">{log.time}</span>
              <span className="text-primary-900 flex-1">{log.event}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-primary-900 mb-4">إجراءات الأمان</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <Shield className="w-4 h-4" />
            فحص النظام
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <Download className="w-4 h-4" />
            نسخة احتياطية
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center justify-center gap-2 py-3"
          >
            <Key className="w-4 h-4" />
            تجديد الترخيص
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SecurityManager;
