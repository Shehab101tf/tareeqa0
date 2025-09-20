import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Banknote,
  Smartphone,
  Calculator,
  User,
  Barcode
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useRTL, CurrencyDisplay } from '../components/common/RTLProvider';
import GlassCard, { MetricCard } from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';

interface Product {
  id: number;
  name: string;
  price: number;
  barcode?: string;
  category: string;
  stock: number;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
  total: number;
}

const POSScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, formatCurrency } = useRTL();
  
  // Mock products data
  const [products] = useState<Product[]>([
    { id: 1, name: 'كوكاكولا 330مل', price: 5.50, barcode: '123456789', category: 'مشروبات', stock: 50 },
    { id: 2, name: 'شيبسي 50جم', price: 3.25, barcode: '987654321', category: 'وجبات خفيفة', stock: 30 },
    { id: 3, name: 'خبز أبيض', price: 2.00, barcode: '456789123', category: 'مخبوزات', stock: 25 },
    { id: 4, name: 'لبن جهينة 1لتر', price: 12.75, barcode: '789123456', category: 'ألبان', stock: 20 },
    { id: 5, name: 'أرز أبيض 1كج', price: 18.50, barcode: '321654987', category: 'حبوب', stock: 15 },
    { id: 6, name: 'زيت عباد الشمس 1لتر', price: 25.00, barcode: '654987321', category: 'زيوت', stock: 12 },
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [customer, setCustomer] = useState<string | null>(null);

  const categories = ['الكل', 'مشروبات', 'وجبات خفيفة', 'مخبوزات', 'ألبان', 'حبوب', 'زيوت'];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm);
    const matchesCategory = selectedCategory === 'الكل' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.14; // 14% VAT in Egypt
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1, total: product.price }];
      }
    });
    
    toast.success(`تم إضافة ${product.name} إلى السلة`);
  };

  // Update cart item quantity
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
    toast.success('تم حذف المنتج من السلة');
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    toast.success('تم مسح السلة');
  };

  // Process sale
  const processSale = (paymentMethod: string) => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    // Mock sale processing
    toast.success(`تم إتمام البيع بنجاح - ${paymentMethod}`);
    setCart([]);
    setCustomer(null);
  };

  // Handle barcode scan
  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm) {
      const product = products.find(p => p.barcode === searchTerm);
      if (product) {
        addToCart(product);
        setSearchTerm('');
      } else {
        toast.error('المنتج غير موجود');
      }
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left Side - Products */}
      <div className="flex-1 space-y-6">
        {/* Search and Categories */}
        <GlassCard className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleBarcodeInput}
                className={`input-glass w-full ${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                placeholder={t('pos.searchProduct')}
              />
              <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}>
                <Barcode className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <GlassButton
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </GlassButton>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <GlassCard 
                className="p-4 cursor-pointer h-full"
                onClick={() => addToCart(product)}
              >
                <div className="text-center space-y-3">
                  {/* Product Image Placeholder */}
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  
                  {/* Product Info */}
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {product.category}
                    </p>
                    <div className="text-lg font-bold text-primary-600">
                      <CurrencyDisplay amount={product.price} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      المخزون: {product.stock}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Side - Cart and Checkout */}
      <div className="w-96 space-y-6">
        {/* Customer Selection */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">{t('pos.customer')}</h3>
            <GlassButton variant="ghost" size="sm" leftIcon={<User className="w-4 h-4" />}>
              اختيار
            </GlassButton>
          </div>
          <p className="text-sm text-gray-600">
            {customer || t('pos.noCustomer')}
          </p>
        </GlassCard>

        {/* Shopping Cart */}
        <GlassCard className="p-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
              {t('pos.cart')} ({cart.length})
            </h3>
            {cart.length > 0 && (
              <GlassButton 
                variant="ghost" 
                size="sm" 
                onClick={clearCart}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                مسح
              </GlassButton>
            )}
          </div>

          {/* Cart Items */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>السلة فارغة</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      <CurrencyDisplay amount={item.price} /> × {item.quantity}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </GlassButton>
                    
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </GlassButton>
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 ml-3 rtl:ml-0 rtl:mr-3">
                    <CurrencyDisplay amount={item.total} />
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Totals */}
        <GlassCard className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('pos.subtotal')}</span>
              <CurrencyDisplay amount={subtotal} className="font-medium" />
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('pos.tax')} (14%)</span>
              <CurrencyDisplay amount={taxAmount} className="font-medium" />
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>{t('pos.total')}</span>
                <CurrencyDisplay amount={total} className="text-primary-600" />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Payment Methods */}
        <GlassCard className="p-4">
          <h3 className="font-medium text-gray-900 mb-4">{t('pos.paymentMethod')}</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <GlassButton
              variant="success"
              size="lg"
              onClick={() => processSale('نقداً')}
              leftIcon={<Banknote className="w-5 h-5" />}
              disabled={cart.length === 0}
            >
              {t('pos.cash')}
            </GlassButton>
            
            <GlassButton
              variant="primary"
              size="lg"
              onClick={() => processSale('بطاقة')}
              leftIcon={<CreditCard className="w-5 h-5" />}
              disabled={cart.length === 0}
            >
              {t('pos.card')}
            </GlassButton>
            
            <GlassButton
              variant="secondary"
              size="lg"
              onClick={() => processSale('محفظة إلكترونية')}
              leftIcon={<Smartphone className="w-5 h-5" />}
              disabled={cart.length === 0}
            >
              {t('pos.mobile')}
            </GlassButton>
            
            <GlassButton
              variant="outline"
              size="lg"
              onClick={() => processSale('آجل')}
              leftIcon={<Calculator className="w-5 h-5" />}
              disabled={cart.length === 0}
            >
              {t('pos.credit')}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default POSScreen;
