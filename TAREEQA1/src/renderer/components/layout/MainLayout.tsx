import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  FileText, 
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';

import { useRTL } from '../common/RTLProvider';
import { useTheme, ThemeToggle } from '../common/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import GlassCard from '../common/GlassCard';
import GlassButton from '../common/GlassButton';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const { actualTheme } = useTheme();
  const { user, logout } = useAuth();
  const { isOnline } = useOnlineStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigationItems = [
    {
      path: '/pos',
      icon: ShoppingCart,
      label: t('navigation.pos'),
      color: 'text-green-500',
    },
    {
      path: '/products',
      icon: Package,
      label: t('navigation.products'),
      color: 'text-blue-500',
    },
    {
      path: '/sales',
      icon: BarChart3,
      label: t('navigation.sales'),
      color: 'text-purple-500',
    },
    {
      path: '/customers',
      icon: Users,
      label: t('navigation.customers'),
      color: 'text-orange-500',
    },
    {
      path: '/reports',
      icon: FileText,
      label: t('navigation.reports'),
      color: 'text-indigo-500',
    },
    {
      path: '/settings',
      icon: Settings,
      label: t('navigation.settings'),
      color: 'text-gray-500',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: isRTL ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRTL ? 300 : -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`w-72 glass border-r border-white/20 flex flex-col ${
              isRTL ? 'border-l border-r-0' : ''
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">
                      {isRTL ? 'طريقة POS' : 'Tareeqa POS'}
                    </h1>
                    <p className="text-xs text-white/60">
                      {isRTL ? 'نظام نقاط البيع' : 'Point of Sale'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* User Info */}
              <GlassCard variant="flat" size="sm" className="p-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.full_name || 'المستخدم'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.role || 'كاشير'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <motion.button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-xl
                      transition-all duration-200 text-left rtl:text-right
                      ${isActive 
                        ? 'glass bg-white/20 text-white shadow-lg' 
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-current'}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className={`w-2 h-2 rounded-full bg-primary-400 ${isRTL ? 'mr-auto' : 'ml-auto'}`}
                        layoutId="activeIndicator"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <ThemeToggle size="sm" />
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Bell className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>
              
              <GlassButton
                variant="ghost"
                size="sm"
                fullWidth
                leftIcon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
                className="text-white/70 hover:text-white"
              >
                {t('common.logout')}
              </GlassButton>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="glass border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {!isSidebarOpen && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  leftIcon={<Menu className="w-4 h-4" />}
                >
                  {t('common.menu')}
                </GlassButton>
              )}
              
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {navigationItems.find(item => item.path === location.pathname)?.label || t('navigation.pos')}
                </h2>
                <p className="text-sm text-white/60">
                  {new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Online Status */}
              <div className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full text-xs font-medium ${
                isOnline 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span>{t('app.online')}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span>{t('app.offline')}</span>
                  </>
                )}
              </div>

              {/* Current Time */}
              <div className="text-white/60 text-sm font-mono">
                {new Date().toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
