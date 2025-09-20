// Main Entry Point - Tareeqa POS Renderer Process
console.log('🚀 Starting Tareeqa POS Renderer...');

// Simple DOM-based approach without React complications
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  // Get or create root element
  let container = document.getElementById('root');
  if (!container) {
    console.log('Creating root element...');
    container = document.createElement('div');
    container.id = 'root';
    container.style.cssText = `
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    `;
    document.body.appendChild(container);
  }

  // Ensure root element has proper styling
  container.style.cssText = `
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    color: white;
    font-family: 'Cairo', 'Arial', sans-serif;
    direction: rtl;
  `;

  // Create the main POS interface
  container.innerHTML = `
    <div style="
      display: flex;
      height: 100vh;
      background: linear-gradient(135deg, #8b9cf7 0%, #b8c5f2 50%, #d1d9f7 100%);
      overflow: hidden;
      direction: rtl;
    ">
      <!-- Sidebar -->
      <aside style="
        position: fixed;
        right: 0;
        top: 0;
        height: 100%;
        width: 280px;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(8px);
        border-left: 1px solid rgba(255, 255, 255, 0.25);
        z-index: 50;
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
      ">
        <!-- Header -->
        <div style="padding: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #2563eb, #1e40af);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 18px;
            ">ط</div>
            <div>
              <h1 style="font-size: 20px; font-weight: bold; color: #1e3a8a; margin: 0;">طريقة</h1>
              <p style="font-size: 14px; color: #2563eb; margin: 0;">نظام نقاط البيع</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav style="padding: 16px;">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button onclick="showPOS()" style="
              width: 100%;
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px;
              border-radius: 12px;
              border: none;
              background: #2563eb;
              color: white;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            ">
              🛒 نقطة البيع
            </button>
            
            <button onclick="showProducts()" style="
              width: 100%;
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px;
              border-radius: 12px;
              border: none;
              background: rgba(255, 255, 255, 0.25);
              color: #1e40af;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">
              📦 المنتجات
            </button>
            
            <button onclick="showHardware()" style="
              width: 100%;
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px;
              border-radius: 12px;
              border: none;
              background: rgba(255, 255, 255, 0.25);
              color: #1e40af;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">
              🖥️ الأجهزة
            </button>
            
            <button onclick="showReports()" style="
              width: 100%;
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px;
              border-radius: 12px;
              border: none;
              background: rgba(255, 255, 255, 0.25);
              color: #1e40af;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">
              📊 التقارير
            </button>
            
            <button onclick="showSettings()" style="
              width: 100%;
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px;
              border-radius: 12px;
              border: none;
              background: rgba(255, 255, 255, 0.25);
              color: #1e40af;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">
              ⚙️ الإعدادات
            </button>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main style="
        margin-right: 280px;
        flex: 1;
        padding: 24px;
        overflow-y: auto;
      ">
        <div id="main-content">
          <!-- POS Interface will be loaded here -->
        </div>
      </main>
    </div>
  `;

  // Load the default POS interface
  showPOS();
  
  console.log('✅ Tareeqa POS initialized successfully');
});

// Navigation functions
function showPOS() {
  const content = document.getElementById('main-content');
  if (content) {
    content.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.90);
        backdrop-filter: blur(8px);
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.42);
        border: 1px solid rgba(255, 255, 255, 0.25);
      ">
        <h2 style="font-size: 28px; font-weight: bold; color: #1e3a8a; margin-bottom: 8px;">نقطة البيع</h2>
        <p style="color: #2563eb; margin-bottom: 32px;">Point of Sale System</p>
        
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Products Grid -->
          <div>
            <h3 style="font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 16px;">المنتجات</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
              ${generateProductCards()}
            </div>
          </div>
          
          <!-- Cart -->
          <div style="
            background: rgba(255, 255, 255, 0.75);
            border-radius: 16px;
            padding: 24px;
            border: 1px solid rgba(255, 255, 255, 0.35);
          ">
            <h3 style="font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 16px;">سلة التسوق</h3>
            <div id="cart-items" style="margin-bottom: 16px;">
              <p style="color: #6b7280; text-align: center; padding: 20px;">السلة فارغة</p>
            </div>
            
            <div style="border-top: 1px solid rgba(0,0,0,0.1); padding-top: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>المجموع الفرعي:</span>
                <span id="subtotal">0.00 ج.م</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>ضريبة القيمة المضافة (14%):</span>
                <span id="vat">0.00 ج.م</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #1e3a8a;">
                <span>الإجمالي:</span>
                <span id="total">0.00 ج.م</span>
              </div>
              
              <button onclick="checkout()" style="
                width: 100%;
                background: #10b981;
                color: white;
                border: none;
                padding: 16px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 16px;
              ">
                إتمام الشراء
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

function generateProductCards() {
  const products = [
    { id: 1, name: 'قهوة عربية', nameEn: 'Arabic Coffee', price: 25.00 },
    { id: 2, name: 'شاي أحمر', nameEn: 'Black Tea', price: 15.00 },
    { id: 3, name: 'خبز بلدي', nameEn: 'Local Bread', price: 3.50 },
    { id: 4, name: 'جبنة بيضاء', nameEn: 'White Cheese', price: 45.00 },
    { id: 5, name: 'زيت زيتون', nameEn: 'Olive Oil', price: 85.00 },
    { id: 6, name: 'أرز مصري', nameEn: 'Egyptian Rice', price: 12.00 }
  ];

  return products.map(product => `
    <div onclick="addToCart(${product.id}, '${product.name}', ${product.price})" style="
      background: rgba(255, 255, 255, 0.75);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.35);
      transition: all 0.3s ease;
      text-align: center;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.18)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
      <h4 style="font-weight: 700; color: #1e3a8a; margin-bottom: 8px; font-size: 20px;">${product.name}</h4>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">${product.nameEn}</p>
      <p style="font-size: 22px; font-weight: bold; color: #059669;">${product.price.toFixed(2)} ج.م</p>
    </div>
  `).join('');
}

// Cart functionality with proper types
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

let cart: CartItem[] = [];

function addToCart(id: number, name: string, price: number): void {
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  updateCart();
}

function updateCart(): void {
  const cartItems = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('subtotal');
  const vatEl = document.getElementById('vat');
  const totalEl = document.getElementById('total');

  if (!cartItems || !subtotalEl || !vatEl || !totalEl) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">السلة فارغة</p>';
    subtotalEl.textContent = '0.00 ج.م';
    vatEl.textContent = '0.00 ج.م';
    totalEl.textContent = '0.00 ج.م';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
      <div>
        <div style="font-weight: 500; color: #1e3a8a;">${item.name}</div>
        <div style="font-size: 12px; color: #6b7280;">${item.price.toFixed(2)} ج.م × ${item.quantity}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button onclick="removeFromCart(${item.id})" style="
          background: #ef4444;
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">-</button>
        <span>${item.quantity}</span>
        <button onclick="addToCart(${item.id}, '${item.name}', ${item.price})" style="
          background: #10b981;
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">+</button>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vat = subtotal * 0.14; // Egyptian VAT 14%
  const total = subtotal + vat;

  subtotalEl.textContent = subtotal.toFixed(2) + ' ج.م';
  vatEl.textContent = vat.toFixed(2) + ' ج.م';
  totalEl.textContent = total.toFixed(2) + ' ج.م';
}

function removeFromCart(id: number): void {
  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
    } else {
      cart.splice(itemIndex, 1);
    }
    updateCart();
  }
}

function checkout() {
  if (cart.length === 0) {
    alert('السلة فارغة!');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vat = total * 0.14;
  const grandTotal = total + vat;
  
  alert(`تم إتمام الشراء بنجاح!\\nالإجمالي: ${grandTotal.toFixed(2)} ج.م\\nشكراً لك!`);
  cart = [];
  updateCart();
}

// Other navigation functions
function showProducts() {
  const content = document.getElementById('main-content');
  if (content) {
    content.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); border-radius: 24px; padding: 32px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);">
        <h2 style="font-size: 28px; font-weight: bold; color: #1e3a8a; margin-bottom: 8px;">إدارة المنتجات</h2>
        <p style="color: #2563eb; margin-bottom: 32px;">Product Management</p>
        <p style="color: #6b7280; text-align: center; padding: 40px;">قريباً - إدارة المنتجات</p>
      </div>
    `;
  }
}

function showHardware() {
  const content = document.getElementById('main-content');
  if (content) {
    content.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); border-radius: 24px; padding: 32px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);">
        <h2 style="font-size: 28px; font-weight: bold; color: #1e3a8a; margin-bottom: 8px;">إدارة الأجهزة</h2>
        <p style="color: #2563eb; margin-bottom: 32px;">Hardware Management</p>
        <p style="color: #6b7280; text-align: center; padding: 40px;">قريباً - إدارة الأجهزة</p>
      </div>
    `;
  }
}

function showReports() {
  const content = document.getElementById('main-content');
  if (content) {
    content.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); border-radius: 24px; padding: 32px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);">
        <h2 style="font-size: 28px; font-weight: bold; color: #1e3a8a; margin-bottom: 8px;">التقارير والتحليلات</h2>
        <p style="color: #2563eb; margin-bottom: 32px;">Reports & Analytics</p>
        <p style="color: #6b7280; text-align: center; padding: 40px;">قريباً - التقارير والتحليلات</p>
      </div>
    `;
  }
}

function showSettings() {
  const content = document.getElementById('main-content');
  if (content) {
    content.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); border-radius: 24px; padding: 32px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);">
        <h2 style="font-size: 28px; font-weight: bold; color: #1e3a8a; margin-bottom: 8px;">الإعدادات</h2>
        <p style="color: #2563eb; margin-bottom: 32px;">System Settings</p>
        <p style="color: #6b7280; text-align: center; padding: 40px;">قريباً - إعدادات النظام</p>
      </div>
    `;
  }
}
