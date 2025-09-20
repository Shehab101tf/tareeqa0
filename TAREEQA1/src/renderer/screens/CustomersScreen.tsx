import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Users, 
  Edit, 
  Trash2, 
  Phone,
  Mail,
  MapPin,
  CreditCard,
  TrendingUp,
  UserCheck,
  UserX
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useRTL, CurrencyDisplay } from '../components/common/RTLProvider';
import GlassCard, { MetricCard } from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  creditLimit: number;
  currentBalance: number;
  totalPurchases: number;
  lastPurchase?: string;
  isActive: boolean;
  joinDate: string;
}

const CustomersScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, formatCurrency } = useRTL();
  
  // Mock customers data
  const [customers] = useState<Customer[]>([
    {
      id: 1,
      name: 'أحمد محمد علي',
      email: 'ahmed.mohamed@email.com',
      phone: '01012345678',
      address: 'شارع النيل، المعادي، القاهرة',
      taxNumber: '123-456-789',
      creditLimit: 5000,
      currentBalance: 1250.50,
      totalPurchases: 15420.75,
      lastPurchase: '2024-01-20',
      isActive: true,
      joinDate: '2023-06-15'
    },
    {
      id: 2,
      name: 'فاطمة أحمد حسن',
      email: 'fatma.ahmed@email.com',
      phone: '01098765432',
      address: 'شارع الجمهورية، وسط البلد، القاهرة',
      creditLimit: 3000,
      currentBalance: 0,
      totalPurchases: 8750.25,
      lastPurchase: '2024-01-18',
      isActive: true,
      joinDate: '2023-08-22'
    },
    {
      id: 3,
      name: 'محمد عبد الرحمن',
      phone: '01156789012',
      address: 'شارع الهرم، الجيزة',
      creditLimit: 2000,
      currentBalance: 500.00,
      totalPurchases: 4320.00,
      lastPurchase: '2024-01-15',
      isActive: true,
      joinDate: '2023-11-10'
    },
    {
      id: 4,
      name: 'سارة محمود',
      email: 'sara.mahmoud@email.com',
      phone: '01234567890',
      creditLimit: 1000,
      currentBalance: 1200.00,
      totalPurchases: 2150.50,
      lastPurchase: '2023-12-28',
      isActive: false,
      joinDate: '2023-04-05'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [balanceFilter, setBalanceFilter] = useState('الكل');

  const statusFilters = ['الكل', 'نشط', 'غير نشط'];
  const balanceFilters = ['الكل', 'لديه رصيد', 'بدون رصيد', 'متجاوز الحد'];

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm);
    
    let matchesStatus = true;
    if (statusFilter === 'نشط') matchesStatus = customer.isActive;
    else if (statusFilter === 'غير نشط') matchesStatus = !customer.isActive;
    
    let matchesBalance = true;
    if (balanceFilter === 'لديه رصيد') matchesBalance = customer.currentBalance > 0;
    else if (balanceFilter === 'بدون رصيد') matchesBalance = customer.currentBalance === 0;
    else if (balanceFilter === 'متجاوز الحد') matchesBalance = customer.currentBalance > customer.creditLimit;
    
    return matchesSearch && matchesStatus && matchesBalance;
  });

  // Calculate stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const totalBalance = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const totalSales = customers.reduce((sum, c) => sum + c.totalPurchases, 0);

  const handleAddCustomer = () => {
    toast.success('فتح نموذج إضافة عميل جديد');
  };

  const handleEditCustomer = (customer: Customer) => {
    toast.success(`تعديل العميل: ${customer.name}`);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    toast.error(`حذف العميل: ${customer.name}`);
  };

  const handleViewHistory = (customer: Customer) => {
    toast.success(`عرض تاريخ العميل: ${customer.name}`);
  };

  const getBalanceStatus = (customer: Customer) => {
    if (customer.currentBalance > customer.creditLimit) {
      return { color: 'text-red-600', label: 'متجاوز الحد' };
    } else if (customer.currentBalance > 0) {
      return { color: 'text-yellow-600', label: 'لديه رصيد' };
    } else {
      return { color: 'text-green-600', label: 'بدون رصيد' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('customers.title')}
          </h1>
          <p className="text-white/70">
            إدارة العملاء والحسابات
          </p>
        </div>
        
        <GlassButton
          variant="primary"
          size="lg"
          onClick={handleAddCustomer}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          {t('customers.addCustomer')}
        </GlassButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="إجمالي العملاء"
          value={totalCustomers.toString()}
          change={{ value: 5.2, type: 'increase' }}
          icon={<Users className="w-6 h-6" />}
        />
        
        <MetricCard
          title="العملاء النشطون"
          value={`${activeCustomers}/${totalCustomers}`}
          icon={<UserCheck className="w-6 h-6" />}
        />
        
        <MetricCard
          title="إجمالي الأرصدة"
          value={formatCurrency(totalBalance)}
          change={{ value: 8.1, type: 'increase' }}
          icon={<CreditCard className="w-6 h-6" />}
        />
        
        <MetricCard
          title="إجمالي المبيعات"
          value={formatCurrency(totalSales)}
          change={{ value: 12.3, type: 'increase' }}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              placeholder="البحث في العملاء..."
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

          {/* Balance Filter */}
          <select
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value)}
            className="input-glass"
          >
            {balanceFilters.map(balance => (
              <option key={balance} value={balance}>{balance}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Customers Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معلومات الاتصال
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الرصيد الحالي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجمالي المشتريات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر شراء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const balanceStatus = getBalanceStatus(customer);
                
                return (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            انضم في: {new Date(customer.joinDate).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2 rtl:mr-0 rtl:ml-2" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2 rtl:mr-0 rtl:ml-2" />
                            {customer.email}
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2 rtl:mr-0 rtl:ml-2" />
                            <span className="truncate max-w-xs">{customer.address}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className={`font-medium ${balanceStatus.color}`}>
                          <CurrencyDisplay amount={customer.currentBalance} />
                        </div>
                        <div className="text-gray-500">
                          الحد: <CurrencyDisplay amount={customer.creditLimit} />
                        </div>
                        <div className={`text-xs ${balanceStatus.color}`}>
                          {balanceStatus.label}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">
                        <CurrencyDisplay amount={customer.totalPurchases} />
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.lastPurchase ? (
                        <div>
                          {new Date(customer.lastPurchase).toLocaleDateString('ar-EG')}
                        </div>
                      ) : (
                        <span className="text-gray-400">لا يوجد</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {customer.isActive ? (
                          <>
                            <UserCheck className="w-5 h-5 text-green-500 mr-2 rtl:mr-0 rtl:ml-2" />
                            <span className="text-sm font-medium text-green-600">نشط</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-5 h-5 text-red-500 mr-2 rtl:mr-0 rtl:ml-2" />
                            <span className="text-sm font-medium text-red-600">غير نشط</span>
                          </>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewHistory(customer)}
                          leftIcon={<TrendingUp className="w-4 h-4" />}
                        >
                          التاريخ
                        </GlassButton>
                        
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                          leftIcon={<Edit className="w-4 h-4" />}
                        >
                          تعديل
                        </GlassButton>
                        
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer)}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-700"
                        >
                          حذف
                        </GlassButton>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default CustomersScreen;
