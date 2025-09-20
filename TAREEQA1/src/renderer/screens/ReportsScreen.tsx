import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  FileText,
  PieChart,
  DollarSign,
  Package,
  Users,
  Receipt
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line
} from 'recharts';
import toast from 'react-hot-toast';

import { useRTL, CurrencyDisplay } from '../components/common/RTLProvider';
import GlassCard, { MetricCard } from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';

const ReportsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, formatCurrency } = useRTL();
  
  const [selectedPeriod, setSelectedPeriod] = useState('هذا الشهر');
  const [selectedReport, setSelectedReport] = useState('المبيعات');

  const periods = ['اليوم', 'أمس', 'هذا الأسبوع', 'الأسبوع الماضي', 'هذا الشهر', 'الشهر الماضي'];
  const reportTypes = ['المبيعات', 'المخزون', 'العملاء', 'الأرباح'];

  // Mock data for charts
  const salesData = [
    { name: 'السبت', sales: 4000, profit: 2400 },
    { name: 'الأحد', sales: 3000, profit: 1398 },
    { name: 'الاثنين', sales: 2000, profit: 9800 },
    { name: 'الثلاثاء', sales: 2780, profit: 3908 },
    { name: 'الأربعاء', sales: 1890, profit: 4800 },
    { name: 'الخميس', sales: 2390, profit: 3800 },
    { name: 'الجمعة', sales: 3490, profit: 4300 },
  ];

  const categoryData = [
    { name: 'مشروبات', value: 35, color: '#3b82f6' },
    { name: 'وجبات خفيفة', value: 25, color: '#10b981' },
    { name: 'مخبوزات', value: 20, color: '#f59e0b' },
    { name: 'ألبان', value: 15, color: '#ef4444' },
    { name: 'أخرى', value: 5, color: '#8b5cf6' },
  ];

  const topProducts = [
    { name: 'كوكاكولا 330مل', sales: 150, revenue: 825 },
    { name: 'شيبسي 50جم', sales: 120, revenue: 390 },
    { name: 'خبز أبيض', sales: 200, revenue: 400 },
    { name: 'لبن جهينة 1لتر', sales: 80, revenue: 1020 },
    { name: 'أرز أبيض 1كج', sales: 45, revenue: 832.50 },
  ];

  const handleExportReport = (format: string) => {
    toast.success(`تصدير التقرير بصيغة ${format}`);
  };

  const handlePrintReport = () => {
    toast.success('طباعة التقرير');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('reports.title')}
          </h1>
          <p className="text-white/70">
            تقارير وتحليلات الأعمال
          </p>
        </div>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <GlassButton
            variant="secondary"
            size="lg"
            onClick={handlePrintReport}
            leftIcon={<FileText className="w-5 h-5" />}
          >
            طباعة
          </GlassButton>
          
          <GlassButton
            variant="primary"
            size="lg"
            onClick={() => handleExportReport('PDF')}
            leftIcon={<Download className="w-5 h-5" />}
          >
            تصدير PDF
          </GlassButton>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع التقرير
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="input-glass w-full"
            >
              {reportTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفترة الزمنية
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-glass w-full"
            >
              {periods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <GlassButton
              variant="outline"
              size="lg"
              fullWidth
              leftIcon={<Filter className="w-5 h-5" />}
            >
              تطبيق المرشحات
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="إجمالي المبيعات"
          value={formatCurrency(45750.25)}
          change={{ value: 12.5, type: 'increase' }}
          icon={<DollarSign className="w-6 h-6" />}
        />
        
        <MetricCard
          title="عدد المعاملات"
          value="1,234"
          change={{ value: 8.2, type: 'increase' }}
          icon={<Receipt className="w-6 h-6" />}
        />
        
        <MetricCard
          title="متوسط المعاملة"
          value={formatCurrency(37.08)}
          change={{ value: 3.1, type: 'increase' }}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        
        <MetricCard
          title="المنتجات المباعة"
          value="2,856"
          change={{ value: 15.7, type: 'increase' }}
          icon={<Package className="w-6 h-6" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              المبيعات اليومية
            </h3>
            <BarChart3 className="w-5 h-5 text-primary-600" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Category Distribution */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              توزيع المبيعات حسب الفئة
            </h3>
            <PieChart className="w-5 h-5 text-primary-600" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <RechartsPieChart
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </RechartsPieChart>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'النسبة']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2 rtl:mr-0 rtl:ml-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Top Products Table */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            أفضل المنتجات مبيعاً
          </h3>
          <TrendingUp className="w-5 h-5 text-primary-600" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  المنتج
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  الكمية المباعة
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  الإيرادات
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  النسبة
                </th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
                        <span className="text-primary-600 font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {product.sales} قطعة
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <CurrencyDisplay amount={product.revenue} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2 rtl:mr-0 rtl:ml-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(product.sales / 200) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round((product.sales / 200) * 100)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Export Options */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          خيارات التصدير
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassButton
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => handleExportReport('PDF')}
            leftIcon={<FileText className="w-5 h-5" />}
          >
            تصدير PDF
          </GlassButton>
          
          <GlassButton
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => handleExportReport('Excel')}
            leftIcon={<Download className="w-5 h-5" />}
          >
            تصدير Excel
          </GlassButton>
          
          <GlassButton
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => handleExportReport('CSV')}
            leftIcon={<Download className="w-5 h-5" />}
          >
            تصدير CSV
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};

export default ReportsScreen;
