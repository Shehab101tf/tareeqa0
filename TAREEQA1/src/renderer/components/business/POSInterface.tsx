import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart, CreditCard, Banknote, Receipt, Search, Filter } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  category: string;
  image?: string;
  barcode: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const POSInterface: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample products data
  const products: Product[] = [
    {
      id: '1',
      name: 'قهوة عربية',
      nameEn: 'Arabic Coffee',
      price: 25.00,
      category: 'beverages',
      barcode: '1234567890123',
      stock: 50
    },
    {
      id: '2',
      name: 'شاي أحمر',
      nameEn: 'Black Tea',
      price: 15.00,
      category: 'beverages',
      barcode: '1234567890124',
      stock: 30
    },
    {
      id: '3',
      name: 'خبز بلدي',
      nameEn: 'Local Bread',
      price: 3.50,
      category: 'bakery',
      barcode: '1234567890125',
      stock: 100
    },
    {
      id: '4',
      name: 'جبنة بيضاء',
      nameEn: 'White Cheese',
      price: 45.00,
      category: 'dairy',
      barcode: '1234567890126',
      stock: 25
    }
  ];

  const categories = [
    { id: 'all', name: 'الكل', nameEn: 'All' },
    { id: 'beverages', name: 'مشروبات', nameEn: 'Beverages' },
    { id: 'bakery', name: 'مخبوزات', nameEn: 'Bakery' },
    { id: 'dairy', name: 'ألبان', nameEn: 'Dairy' }
  ];

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getVATAmount = () => {
    return getTotalAmount() * 0.14; // 14% Egyptian VAT
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex gap-6 h-full" dir="rtl">
      {/* Products Section */}
      <div className="flex-1 space-y-6">
        {/* Search and Filter */}
        <div className="glass-white rounded-2xl p-6 shadow-lg">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث عن المنتجات... Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-glass pr-10 text-primary-dark"
              />
            </div>
            <button className="btn-glass px-4 py-2 text-primary-700 hover:bg-white/30">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white/30 text-primary-700 hover:bg-white/50'
                }`}
              >
                <div className="font-medium">{category.name}</div>
                <div className="text-xs opacity-80">{category.nameEn}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-white rounded-xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => addToCart(product)}
            >
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-3 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-primary-900 group-hover:text-primary-700 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-primary-600">{product.nameEn}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary-800">
                    {product.price.toFixed(2)} ج.م
                  </span>
                  <span className="text-xs text-primary-500">
                    المخزون: {product.stock}
                  </span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-3 bg-primary-500 text-white rounded-lg py-2 px-3 text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                إضافة للسلة
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 space-y-6">
        {/* Cart Header */}
        <div className="glass-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              سلة التسوق
            </h2>
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {cart.length}
            </span>
          </div>

          {/* Cart Items */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-primary-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>السلة فارغة</p>
                <p className="text-sm">Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-primary-900">{item.name}</h4>
                    <p className="text-sm text-primary-600">{item.price.toFixed(2)} ج.م</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="w-8 text-center font-semibold text-primary-900">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Order Summary */}
        {cart.length > 0 && (
          <div className="glass-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-primary-900 mb-4">ملخص الطلب</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-primary-700">
                <span>المجموع الفرعي:</span>
                <span>{getTotalAmount().toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between text-primary-700">
                <span>ضريبة القيمة المضافة (14%):</span>
                <span>{getVATAmount().toFixed(2)} ج.م</span>
              </div>
              <div className="border-t border-primary-200 pt-2">
                <div className="flex justify-between text-lg font-bold text-primary-900">
                  <span>الإجمالي:</span>
                  <span>{(getTotalAmount() + getVATAmount()).toFixed(2)} ج.م</span>
                </div>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                <Banknote className="w-5 h-5" />
                دفع نقدي
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-secondary flex items-center justify-center gap-2 py-3"
              >
                <CreditCard className="w-5 h-5" />
                دفع بالبطاقة
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-green-500 text-white rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              >
                <Receipt className="w-5 h-5" />
                طباعة الفاتورة
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSInterface;
