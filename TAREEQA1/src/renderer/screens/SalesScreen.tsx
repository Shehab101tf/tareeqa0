import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Receipt, 
  Search, 
  Filter, 
  Eye, 
  Printer,
  RefreshCw,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useRTL, CurrencyDisplay } from '../components/common/RTLProvider';
import GlassCard, { MetricCard } from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';

interface Sale {
  id: number;
  saleNumber: string;
  customerName?: string;
  items: number;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'credit';
  paymentStatus: 'paid' | 'pending' | 'partial' | 'refunded';
  cashier: string;
  date: string;
  time: string;
}

const SalesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, formatCurrency } = useRTL();
  
  // Mock sales data
  const [sales] = useState<Sale[]>([
    {
      id: 1,
      saleNumber: 'POS-2024-001',
      customerName: 'أحمد محمد',
      items: 3,
      subtotal: 45.50,
      tax: 6.37,
      total: 51.87,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      cashier: 'مريم أحمد',
      date: '2024-01-20',
      time: '14:30'
    },
    {
      id: 2,
      saleNumber: 'POS-2024-002',
      items: 5,
      subtotal: 78.25,
      tax: 10.96,
      total: 89.21,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      cashier: 'مريم أحمد',
      date: '2024-01-20',
      time: '15:15'
    },
    {
      id: 3,
      saleNumber: 'POS-2024-003',
      customerName: 'فاطمة علي',
      items: 2,
      subtotal: 32.00,
      tax: 4.48,
      total: 36.48,
      paymentMethod: 'mobile',
      paymentStatus: 'paid',
      cashier: 'مريم أحمد',
      date: '2024-01-20',
      time: '16:45'
    },
    {
      id: 4,
      saleNumber: 'POS-2024-004',
      items: 1,
      subtotal: 12.75,
      tax: 1.79,
      total: 14.54,
      paymentMethod: 'credit',
      paymentStatus: 'pending',
      cashier: 'مريم أحمد',
      date: '2024-01-20',
      time: '17:20'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [paymentFilter, setPaymentFilter] = useState('الكل');
  const [dateFilter, setDateFilter] = useState('اليوم');

  const statusFilters = ['الكل', 'مدفوع', 'معلق', 'جزئي', 'مسترد'];
  const paymentFilters = ['الكل', 'نقداً', 'بطاقة', 'محفظة إلكترونية', 'آجل'];
  const dateFilters = ['اليوم', 'أمس', 'هذا الأسبوع', 'هذا الشهر'];

  // Filter sales
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'مدفوع') matchesStatus = sale.paymentStatus === 'paid';
    else if (statusFilter === 'معلق') matchesStatus = sale.paymentStatus === 'pending';
    else if (statusFilter === 'جزئي') matchesStatus = sale.paymentStatus === 'partial';
    else if (statusFilter === 'مسترد') matchesStatus = sale.paymentStatus === 'refunded';
    
    let matchesPayment = true;
    if (paymentFilter === 'نقداً') matchesPayment = sale.paymentMethod === 'cash';
    else if (paymentFilter === 'بطاقة') matchesPayment = sale.paymentMethod === 'card';
    else if (paymentFilter === 'محفظة إلكترونية') matchesPayment = sale.paymentMethod === 'mobile';
    else if (paymentFilter === 'آجل') matchesPayment = sale.paymentMethod === 'credit';
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate totals
  const todaysSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const averageTransaction = totalTransactions > 0 ? todaysSales / totalTransactions : 0;
  const paidSales = filteredSales.filter(sale => sale.paymentStatus === 'paid').length;

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      cash: 'نقداً',
      card: 'بطاقة',
      mobile: 'محفظة إلكترونية',
      credit: 'آجل'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      refunded: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      paid: 'مدفوع',
      pending: 'معلق',
      partial: 'جزئي',
      refunded: 'مسترد'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleViewSale = (sale: Sale) => {
    toast.success(`عرض تفاصيل البيع: ${sale.saleNumber}`);
  };

  const handlePrintReceipt = (sale: Sale) => {
    toast.success(`طباعة فاتورة: ${sale.saleNumber}`);
  };

  const handleRefundSale = (sale: Sale) => {
    toast.error(`استرداد البيع: ${sale.saleNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('sales.title')}
          </h1>
          <p className="text-white/70">
            تتبع المبيعات والمعاملات
          </p>
        </div>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <GlassButton
            variant="secondary"
            size="lg"
            leftIcon={<RefreshCw className="w-5 h-5" />}
          >
            تحديث
          </GlassButton>
          
          <GlassButton
            variant="primary"
            size="lg"
            leftIcon={<Calendar className="w-5 h-5" />}
          >
            تقرير المبيعات
          </GlassButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="مبيعات اليوم"
          value={formatCurrency(todaysSales)}
          change={{ value: 12.5, type: 'increase' }}
          icon={<DollarSign className="w-6 h-6" />}
        />
        
        <MetricCard
          title="عدد المعاملات"
          value={totalTransactions.toString()}
          change={{ value: 8.2, type: 'increase' }}
          icon={<Receipt className="w-6 h-6" />}
        />
        
        <MetricCard
          title="متوسط المعاملة"
          value={formatCurrency(averageTransaction)}
          change={{ value: 3.1, type: 'increase' }}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        
        <MetricCard
          title="المعاملات المدفوعة"
          value={`${paidSales}/${totalTransactions}`}
          icon={<ShoppingBag className="w-6 h-6" />}
        />
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`input-glass w-full ${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
              placeholder="البحث في المبيعات..."
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-glass"
          >
            {statusFilters.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="input-glass"
          >
            {paymentFilters.map(payment => (
              <option key={payment} value={payment}>{payment}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-glass"
          >
            {dateFilters.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Sales Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم البيع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  طريقة الدفع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ والوقت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
                        <Receipt className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sale.saleNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sale.items} منتج
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {sale.customerName || 'عميل عادي'}
                    </div>
                    <div className="text-sm text-gray-500">
                      الكاشير: {sale.cashier}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium text-lg">
                        <CurrencyDisplay amount={sale.total} />
                      </div>
                      <div className="text-gray-500">
                        ضريبة: <CurrencyDisplay amount={sale.tax} />
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getPaymentMethodLabel(sale.paymentMethod)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.paymentStatus)}`}>
                      {getStatusLabel(sale.paymentStatus)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{sale.date}</div>
                      <div className="text-gray-500">{sale.time}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSale(sale)}
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        عرض
                      </GlassButton>
                      
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintReceipt(sale)}
                        leftIcon={<Printer className="w-4 h-4" />}
                      >
                        طباعة
                      </GlassButton>
                      
                      {sale.paymentStatus === 'paid' && (
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefundSale(sale)}
                          leftIcon={<RefreshCw className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-700"
                        >
                          استرداد
                        </GlassButton>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default SalesScreen;
