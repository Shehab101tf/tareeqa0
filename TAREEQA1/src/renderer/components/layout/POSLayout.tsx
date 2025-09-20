import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Package, Users, BarChart3, Settings, Menu, X } from 'lucide-react';

interface POSLayoutProps {
  children: React.ReactNode;
}

const POSLayout: React.FC<POSLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: ShoppingCart, label: 'نقطة البيع', labelEn: 'Point of Sale', path: '/pos', active: true },
    { icon: Package, label: 'المنتجات', labelEn: 'Products', path: '/products' },
    { icon: Users, label: 'الأجهزة', labelEn: 'Hardware', path: '/hardware' },
    { icon: BarChart3, label: 'التقارير', labelEn: 'Reports', path: '/reports' },
    { icon: Settings, label: 'الإعدادات', labelEn: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: sidebarOpen ? 0 : -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed right-0 top-0 h-full w-70 glass-white border-l border-white/30 z-50 shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">ط</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-900">طريقة</h1>
                <p className="text-sm text-primary-600">نظام نقاط البيع</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-primary-700" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`w-full flex items-center space-x-3 space-x-reverse p-4 rounded-xl transition-all duration-300 group ${
                item.active
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'hover:bg-white/30 text-primary-700 hover:text-primary-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-primary-600 group-hover:text-primary-800'}`} />
              <div className="flex-1 text-right">
                <div className={`font-semibold ${item.active ? 'text-white' : 'text-primary-900'}`}>
                  {item.label}
                </div>
                <div className={`text-sm ${item.active ? 'text-primary-100' : 'text-primary-600'}`}>
                  {item.labelEn}
                </div>
              </div>
            </motion.button>
          ))}
        </nav>

        {/* Status Indicator */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="glass-success rounded-lg p-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 font-medium">متصل</span>
              <span className="text-green-600 text-sm">Connected</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-70' : 'mr-0'}`}>
        {/* Top Bar */}
        <header className="h-16 glass-white border-b border-white/30 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Menu className="w-5 h-5 text-primary-700" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-primary-900">نقطة البيع الرئيسية</h2>
              <p className="text-sm text-primary-600">Main Point of Sale</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="text-right">
              <div className="text-sm font-medium text-primary-900">أحمد محمد</div>
              <div className="text-xs text-primary-600">كاشير</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">أ</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default POSLayout;
