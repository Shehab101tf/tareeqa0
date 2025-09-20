import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useRTL, CurrencyDisplay } from '../components/common/RTLProvider-fixed';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  supplier: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  isActive: boolean;
  image?: string;
}

const ProductsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, formatCurrency } = useRTL();
  
  // Mock products data
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'كوكاكولا 330مل',
      sku: 'COCA-330',
      barcode: '123456789012',
      category: 'مشروبات',
      supplier: 'شركة المشروبات المصرية',
      costPrice: 4.00,
      sellingPrice: 5.50,
      stock: 50,
      minStock: 10,
      unit: 'قطعة',
      isActive: true,
    },
    {
      id: 2,
      name: 'شيبسي 50جم',
      sku: 'CHIPS-50',
      barcode: '987654321098',
      category: 'وجبات خفيفة',
      supplier: 'شركة الوجبات الخفيفة',
      costPrice: 2.50,
      sellingPrice: 3.25,
      stock: 5,
      minStock: 15,
      unit: 'قطعة',
      isActive: true,
    },
    {
      id: 3,
      name: 'خبز أبيض',
      sku: 'BREAD-WHITE',
      barcode: '456789123456',
      category: 'مخبوزات',
      supplier: 'مخبز النور',
      costPrice: 1.50,
      sellingPrice: 2.00,
      stock: 25,
      minStock: 20,
      unit: 'رغيف',
      isActive: true,
    },
    {
      id: 4,
      name: 'لبن جهينة 1لتر',
      sku: 'MILK-1L',
      barcode: '789123456789',
      category: 'ألبان',
      supplier: 'شركة جهينة',
      costPrice: 10.00,
      sellingPrice: 12.75,
      stock: 0,
      minStock: 10,
      unit: 'عبوة',
      isActive: false,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [stockFilter, setStockFilter] = useState('الكل');

  const categories = ['الكل', 'مشروبات', 'وجبات خفيفة', 'مخبوزات', 'ألبان'];
  const stockFilters = ['الكل', 'متوفر', 'مخزون منخفض', 'غير متوفر'];

  // Filter products
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm);
    
    const matchesCategory = selectedCategory === 'الكل' || product.category === selectedCategory;
    
    let matchesStock = true;
    if (stockFilter === 'متوفر') matchesStock = product.stock > product.minStock;
    else if (stockFilter === 'مخزون منخفض') matchesStock = product.stock > 0 && product.stock <= product.minStock;
    else if (stockFilter === 'غير متوفر') matchesStock = product.stock === 0;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockStatus = (product: Product): { status: string; color: string; icon: any } => {
    if (product.stock === 0) return { status: 'outOfStock', color: 'text-red-500', icon: XCircle };
    if (product.stock <= product.minStock) return { status: 'lowStock', color: 'text-yellow-500', icon: AlertTriangle };
    return { status: 'inStock', color: 'text-green-500', icon: CheckCircle };
  };

  const handleAddProduct = () => {
    toast.success('فتح نموذج إضافة منتج جديد');
  };

  const handleEditProduct = (product: Product): void => {
    toast.success(`تعديل المنتج: ${product.name}`);
  };

  const handleDeleteProduct = (product: Product): void => {
    toast.error(`حذف المنتج: ${product.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('products.title')}
          </h1>
          <p className="text-white/70">
            إدارة المنتجات والمخزون
          </p>
        </div>
        
        <GlassButton
          variant="primary"
          size="lg"
          onClick={handleAddProduct}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          {t('products.addProduct')}
        </GlassButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي المنتجات</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </GlassCard>

        <GlassCard variant="success" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">متوفر</p>
              <p className="text-2xl font-bold text-green-800">
                {products.filter(p => p.stock > p.minStock).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </GlassCard>

        <GlassCard variant="warning" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 mb-1">مخزون منخفض</p>
              <p className="text-2xl font-bold text-yellow-800">
                {products.filter(p => p.stock > 0 && p.stock <= p.minStock).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </GlassCard>

        <GlassCard variant="error" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 mb-1">غير متوفر</p>
              <p className="text-2xl font-bold text-red-800">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </GlassCard>
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
              placeholder="البحث في المنتجات..."
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-glass"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="input-glass"
          >
            {stockFilters.map(filter => (
              <option key={filter} value={filter}>{filter}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Products Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المنتج
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الفئة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الأسعار
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المخزون
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
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
                          <Package className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.sku} • {product.barcode}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          بيع: <CurrencyDisplay amount={product.sellingPrice} />
                        </div>
                        <div className="text-gray-500">
                          تكلفة: <CurrencyDisplay amount={product.costPrice} />
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {product.stock} {product.unit}
                        </div>
                        <div className="text-gray-500">
                          الحد الأدنى: {product.minStock}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className={`w-5 h-5 ${stockStatus.color} mr-2 rtl:mr-0 rtl:ml-2`} />
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {stockStatus.status === 'inStock' && 'متوفر'}
                          {stockStatus.status === 'lowStock' && 'مخزون منخفض'}
                          {stockStatus.status === 'outOfStock' && 'غير متوفر'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          leftIcon={<Edit className="w-4 h-4" />}
                        >
                          تعديل
                        </GlassButton>
                        
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product)}
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

export default ProductsScreen;
