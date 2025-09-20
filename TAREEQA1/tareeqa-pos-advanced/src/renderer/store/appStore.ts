import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Application Store for Tareeqa POS
 * Manages global application state and settings
 */

export interface AppSettings {
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'auto';
  currency: 'EGP';
  currencySymbol: 'ج.م';
  taxRate: number;
  storeName: string;
  storeNameEnglish: string;
  receiptHeader: string;
  receiptFooter: string;
  printLogo: boolean;
  autoLock: boolean;
  autoLockTimeout: number; // minutes
  soundEnabled: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
}

export interface HardwareStatus {
  barcodeScanner: {
    connected: boolean;
    port?: string;
    lastScan?: string;
  };
  receiptPrinter: {
    connected: boolean;
    type?: string;
    status?: string;
  };
  cashDrawer: {
    connected: boolean;
    port?: string;
  };
}

export interface LicenseInfo {
  status: 'valid' | 'invalid' | 'expired' | 'demo';
  type: string;
  issuedTo: string;
  companyName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  features: Record<string, any>;
}

interface AppState {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  settings: AppSettings;
  hardwareStatus: HardwareStatus;
  licenseInfo: LicenseInfo | null;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  
  // Actions
  initialize: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setLanguage: (language: 'ar' | 'en') => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  refreshHardwareStatus: () => Promise<void>;
  refreshLicenseInfo: () => Promise<void>;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  getUnreadNotificationsCount: () => number;
}

const defaultSettings: AppSettings = {
  language: 'ar',
  theme: 'light',
  currency: 'EGP',
  currencySymbol: 'ج.م',
  taxRate: 14.0, // Egyptian VAT
  storeName: 'متجر طريقة',
  storeNameEnglish: 'Tareeqa Store',
  receiptHeader: 'متجر طريقة - فاتورة ضريبية',
  receiptFooter: 'شكراً لزيارتكم',
  printLogo: true,
  autoLock: true,
  autoLockTimeout: 15, // 15 minutes
  soundEnabled: true,
  animationsEnabled: true,
  compactMode: false
};

const defaultHardwareStatus: HardwareStatus = {
  barcodeScanner: { connected: false },
  receiptPrinter: { connected: false },
  cashDrawer: { connected: false }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isInitialized: false,
      isLoading: false,
      settings: defaultSettings,
      hardwareStatus: defaultHardwareStatus,
      licenseInfo: null,
      notifications: [],

      // Initialize application
      initialize: async () => {
        set({ isLoading: true });

        try {
          console.log('🚀 Initializing application store...');

          // Load settings from database if available
          await get().loadSettingsFromDatabase();

          // Refresh hardware status
          await get().refreshHardwareStatus();

          // Refresh license info
          await get().refreshLicenseInfo();

          // Apply settings
          get().applySettings();

          set({ isInitialized: true, isLoading: false });
          console.log('✅ Application store initialized');

          // Add welcome notification
          get().addNotification({
            type: 'success',
            title: 'مرحباً بك',
            message: 'تم تحميل نظام طريقة بنجاح'
          });

        } catch (error) {
          console.error('❌ App store initialization failed:', error);
          set({ isLoading: false });
          
          get().addNotification({
            type: 'error',
            title: 'خطأ في التهيئة',
            message: 'فشل في تحميل إعدادات التطبيق'
          });
        }
      },

      // Load settings from database
      loadSettingsFromDatabase: async () => {
        try {
          if (window.tareeqa?.database?.query) {
            const settings = await window.tareeqa.database.query(
              'SELECT key, value FROM settings WHERE category = ?',
              ['general']
            );

            const loadedSettings: Partial<AppSettings> = {};
            settings.forEach((setting: any) => {
              const key = setting.key as keyof AppSettings;
              let value = setting.value;

              // Parse values based on type
              if (key === 'taxRate' || key === 'autoLockTimeout') {
                value = parseFloat(value);
              } else if (key === 'printLogo' || key === 'autoLock' || key === 'soundEnabled' || key === 'animationsEnabled' || key === 'compactMode') {
                value = value === 'true';
              }

              loadedSettings[key] = value;
            });

            set(state => ({
              settings: { ...state.settings, ...loadedSettings }
            }));

            console.log('📄 Settings loaded from database');
          }
        } catch (error) {
          console.warn('⚠️ Could not load settings from database:', error);
        }
      },

      // Update settings
      updateSettings: async (newSettings: Partial<AppSettings>) => {
        try {
          const currentSettings = get().settings;
          const updatedSettings = { ...currentSettings, ...newSettings };

          // Save to database if available
          if (window.tareeqa?.database?.run) {
            for (const [key, value] of Object.entries(newSettings)) {
              await window.tareeqa.database.run(
                'INSERT OR REPLACE INTO settings (category, key, value) VALUES (?, ?, ?)',
                ['general', key, String(value)]
              );
            }
          }

          set({ settings: updatedSettings });
          get().applySettings();

          console.log('⚙️ Settings updated:', newSettings);

          get().addNotification({
            type: 'success',
            title: 'تم الحفظ',
            message: 'تم حفظ الإعدادات بنجاح'
          });

        } catch (error) {
          console.error('❌ Failed to update settings:', error);
          
          get().addNotification({
            type: 'error',
            title: 'خطأ في الحفظ',
            message: 'فشل في حفظ الإعدادات'
          });
        }
      },

      // Apply settings to the application
      applySettings: () => {
        const { settings } = get();

        // Apply language
        document.documentElement.lang = settings.language;
        document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';

        // Apply theme
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // Apply animations
        if (!settings.animationsEnabled) {
          document.documentElement.style.setProperty('--animation-duration', '0ms');
        } else {
          document.documentElement.style.removeProperty('--animation-duration');
        }

        console.log('🎨 Settings applied to DOM');
      },

      // Set language
      setLanguage: (language: 'ar' | 'en') => {
        get().updateSettings({ language });
      },

      // Set theme
      setTheme: (theme: 'light' | 'dark' | 'auto') => {
        get().updateSettings({ theme });
      },

      // Refresh hardware status
      refreshHardwareStatus: async () => {
        try {
          if (window.tareeqa?.hardware?.getStatus) {
            const status = await window.tareeqa.hardware.getStatus();
            set({ hardwareStatus: status });
            console.log('🔌 Hardware status refreshed');
          }
        } catch (error) {
          console.warn('⚠️ Could not refresh hardware status:', error);
        }
      },

      // Refresh license info
      refreshLicenseInfo: async () => {
        try {
          if (window.tareeqa?.license?.getInfo) {
            const licenseInfo = await window.tareeqa.license.getInfo();
            set({ licenseInfo });
            console.log('📜 License info refreshed');

            // Add notification for license status
            if (licenseInfo.status === 'expired') {
              get().addNotification({
                type: 'error',
                title: 'انتهت صلاحية الترخيص',
                message: 'يرجى تجديد الترخيص لمواصلة الاستخدام'
              });
            } else if (licenseInfo.status === 'demo') {
              get().addNotification({
                type: 'info',
                title: 'نسخة تجريبية',
                message: `متبقي ${licenseInfo.daysUntilExpiry} يوم من النسخة التجريبية`
              });
            } else if (licenseInfo.daysUntilExpiry <= 7) {
              get().addNotification({
                type: 'warning',
                title: 'ينتهي الترخيص قريباً',
                message: `متبقي ${licenseInfo.daysUntilExpiry} أيام على انتهاء الترخيص`
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ Could not refresh license info:', error);
        }
      },

      // Add notification
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          read: false
        };

        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50) // Keep only last 50
        }));

        console.log('🔔 Notification added:', notification.title);
      },

      // Mark notification as read
      markNotificationRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        }));
      },

      // Clear all notifications
      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Get unread notifications count
      getUnreadNotificationsCount: () => {
        return get().notifications.filter(n => !n.read).length;
      }
    }),
    {
      name: 'tareeqa-app-storage',
      partialize: (state) => ({
        settings: state.settings,
        notifications: state.notifications
      })
    }
  )
);
