import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar, Download, Eye } from 'lucide-react';

interface SalesData {
  date: string;
  sales: number;
  transactions: number;
  customers: number;
}

interface TopProduct {
  id: string;
  name: string;
  nameEn: string;
  sales: number;
  revenue: number;
}

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  
  // Sample analytics data
  const salesData: SalesData[] = [
    { date: '2024-01-15', sales: 12500.50, transactions: 45, customers: 38 },
    { date: '2024-01-14', sales: 10200.25, transactions: 38, customers: 32 },
    { date: '2024-01-13', sales: 15800.75, transactions: 52, customers: 44 },
    { date: '2024-01-12', sales: 9500.00, transactions: 35, customers: 29 },
    { date: '2024-01-11', sales: 13200.30, transactions: 41, customers: 36 },
  ];

  const topProducts: TopProduct[] = [
    { id: '1', name: 'قهوة عربية', nameEn: 'Arabic Coffee', sales: 125, revenue: 3125.00 },
    { id: '2', name: 'شاي أحمر', nameEn: 'Black Tea', sales: 98, revenue: 1470.00 },
    { id: '3', name: 'خبز بلدي', nameEn: 'Local Bread', sales: 200, revenue: 700.00 },
    { id: '4', name: 'جبنة بيضاء', nameEn: 'White Cheese', sales: 45, revenue: 2025.00 },
  ];

  const todayStats = {
    totalSales: 12500.50,
    totalTransactions: 45,
    totalCustomers: 38,
    averageTransaction: 277.79,
    vatCollected: 1750.07,
    growth: {
      sales: 12.5,
      transactions: 8.3,
      customers: 15.2
    }
  };

  const periods = [
    { id: 'today', name: 'اليوم', nameEn: 'Today' },
    { id: 'week', name: 'هذا الأسبوع', nameEn: 'This Week' },
    { id: 'month', name: 'هذا الشهر', nameEn: 'This Month' },
    { id: 'year', name: 'هذا العام', nameEn: 'This Year' }
  ];

  const StatCard = ({ title, titleEn, value, change, icon: Icon, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-white rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-primary-900 mb-1">{value}</h3>
        <p className="font-medium text-primary-800">{title}</p>
        <p className="text-sm text-primary-600">{titleEn}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary-900 mb-2">لوحة التحليلات</h2>
            <p className="text-primary-600">Analytics Dashboard</p>
          </div>
          
          <div className="flex gap-2">
            {periods.map(period => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedPeriod === period.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white/30 text-primary-700 hover:bg-white/50'
                }`}
              >
                <div className="font-medium">{period.name}</div>
                <div className="text-xs opacity-80">{period.nameEn}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي المبيعات"
          titleEn="Total Sales"
          value={`${todayStats.totalSales.toFixed(2)} ج.م`}
          change={todayStats.growth.sales}
          icon={DollarSign}
          color="green"
        />
        
        <StatCard
          title="عدد المعاملات"
          titleEn="Transactions"
          value={todayStats.totalTransactions.toString()}
          change={todayStats.growth.transactions}
          icon={ShoppingCart}
          color="blue"
        />
        
        <StatCard
          title="عدد العملاء"
          titleEn="Customers"
          value={todayStats.totalCustomers.toString()}
          change={todayStats.growth.customers}
          icon={Users}
          color="purple"
        />
        
        <StatCard
          title="متوسط المعاملة"
          titleEn="Avg Transaction"
          value={`${todayStats.averageTransaction.toFixed(2)} ج.م`}
          icon={BarChart3}
          color="orange"
        />
      </div>

      {/* Sales Chart */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-primary-900">اتجاه المبيعات</h3>
          <div className="flex gap-2">
            <button className="btn-secondary px-3 py-1 text-sm">
              <Download className="w-4 h-4 ml-1" />
              تصدير
            </button>
            <button className="btn-secondary px-3 py-1 text-sm">
              <Eye className="w-4 h-4 ml-1" />
              عرض تفصيلي
            </button>
          </div>
        </div>
        
        {/* Simple Bar Chart */}
        <div className="space-y-4">
          {salesData.map((data, index) => (
            <motion.div
              key={data.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-20 text-sm text-primary-600">
                {new Date(data.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
              </div>
              
              <div className="flex-1 bg-primary-100 rounded-lg h-8 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.sales / 16000) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-primary-900">
                  {data.sales.toFixed(0)} ج.م
                </div>
              </div>
              
              <div className="w-16 text-sm text-primary-600 text-left">
                {data.transactions} معاملة
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="glass-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-primary-900 mb-4">أفضل المنتجات مبيعاً</h3>
          
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-primary-900">{product.name}</h4>
                    <p className="text-sm text-primary-600">{product.nameEn}</p>
                  </div>
                </div>
                
                <div className="text-left">
                  <p className="font-semibold text-primary-900">{product.revenue.toFixed(2)} ج.م</p>
                  <p className="text-sm text-primary-600">{product.sales} قطعة</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* VAT Summary */}
        <div className="glass-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-primary-900 mb-4">ملخص ضريبة القيمة المضافة</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="text-primary-700">المبيعات الخاضعة للضريبة:</span>
              <span className="font-semibold text-primary-900">{todayStats.totalSales.toFixed(2)} ج.م</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
              <span className="text-primary-700">معدل الضريبة:</span>
              <span className="font-semibold text-primary-900">14%</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
              <span className="text-green-700 font-medium">إجمالي الضريبة المحصلة:</span>
              <span className="font-bold text-green-800">{todayStats.vatCollected.toFixed(2)} ج.م</span>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">معلومات مهمة</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• يجب تحويل الضريبة شهرياً</li>
                <li>• احتفظ بجميع الفواتير للمراجعة</li>
                <li>• تأكد من صحة أرقام التسجيل الضريبي</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="glass-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-primary-900 mb-4">تصدير التقارير</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <Download className="w-4 h-4" />
            تقرير المبيعات اليومي
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <Download className="w-4 h-4" />
            تقرير ضريبة القيمة المضافة
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <Download className="w-4 h-4" />
            تقرير المخزون
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
