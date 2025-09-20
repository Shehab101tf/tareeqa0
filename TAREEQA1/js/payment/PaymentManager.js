/**
 * Tareeqa POS Payment Manager
 * Handles payment methods and calculations
 * 
 * @author Tareeqa Development Team
 * @version 1.0.0
 */

class PaymentManager {
    constructor() {
        this.paymentMethods = {
            cash: {
                name: 'نقداً',
                nameEn: 'Cash',
                icon: '💵',
                color: '#059669',
                enabled: true
            },
            visa: {
                name: 'فيزا',
                nameEn: 'Visa',
                icon: '💳',
                color: '#1e3a8a',
                enabled: true
            },
            instapay: {
                name: 'إنستا باي',
                nameEn: 'InstaPay',
                icon: '📱',
                color: '#7c3aed',
                enabled: true
            },
            vodafone: {
                name: 'فودافون كاش',
                nameEn: 'Vodafone Cash',
                icon: '📲',
                color: '#dc2626',
                enabled: true
            }
        };
        
        this.currentPayment = {
            method: null,
            amountPaid: 0,
            change: 0,
            total: 0
        };
    }

    /**
     * Show payment modal
     */
    showPaymentModal(cartItems, total, vat, grandTotal) {
        this.currentPayment.total = grandTotal;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 30px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                <button onclick="this.closest('.payment-modal').remove()" style="position: absolute; top: 15px; left: 15px; background: #dc2626; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; font-size: 18px; font-weight: bold;">×</button>
                
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 25px;">
                    <h2 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: bold;">💳 طريقة الدفع</h2>
                    <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">اختر طريقة الدفع المناسبة</p>
                </div>
                
                <!-- Order Summary -->
                <div style="background: rgba(30, 58, 138, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 25px; border-right: 4px solid #1e3a8a;">
                    <h3 style="color: #1e3a8a; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">📋 ملخص الطلب</h3>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                        <span>المجموع الفرعي:</span>
                        <span style="font-weight: 600;">${total.toFixed(2)} ج.م</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #dc2626;">
                        <span>ضريبة القيمة المضافة (14%):</span>
                        <span style="font-weight: 600;">${vat.toFixed(2)} ج.م</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #1e3a8a; border-top: 1px solid rgba(30, 58, 138, 0.2); padding-top: 10px; margin-top: 10px;">
                        <span>الإجمالي:</span>
                        <span>${grandTotal.toFixed(2)} ج.م</span>
                    </div>
                </div>
                
                <!-- Payment Methods -->
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #1e3a8a; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">💳 طريقة الدفع</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        ${this.generatePaymentMethodButtons()}
                    </div>
                </div>
                
                <!-- Cash Payment Details -->
                <div id="cash-details" style="display: none; background: rgba(5, 150, 105, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px; border-right: 4px solid #059669;">
                    <h4 style="color: #059669; margin: 0 0 15px 0; font-size: 14px; font-weight: 600;">💵 تفاصيل الدفع النقدي</h4>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #374151; font-size: 14px;">المبلغ المدفوع:</label>
                        <input type="number" id="amount-paid" step="0.01" min="${grandTotal}" 
                               placeholder="أدخل المبلغ المدفوع" 
                               oninput="paymentManager.calculateChange()"
                               style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px; text-align: right;">
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <span style="font-weight: 600; color: #374151;">المتبقي (الباقي):</span>
                        <span id="change-amount" style="font-size: 18px; font-weight: bold; color: #059669;">0.00 ج.م</span>
                    </div>
                </div>
                
                <!-- Card Payment Details -->
                <div id="card-details" style="display: none; background: rgba(30, 58, 138, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px; border-right: 4px solid #1e3a8a;">
                    <h4 style="color: #1e3a8a; margin: 0 0 15px 0; font-size: 14px; font-weight: 600;">💳 تفاصيل الدفع بالبطاقة</h4>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <span style="font-weight: 600; color: #374151;">المبلغ المطلوب:</span>
                        <span style="font-size: 18px; font-weight: bold; color: #1e3a8a;">${grandTotal.toFixed(2)} ج.م</span>
                    </div>
                    <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0; text-align: center;">سيتم خصم المبلغ كاملاً من البطاقة</p>
                </div>
                
                <!-- Digital Payment Details -->
                <div id="digital-details" style="display: none; background: rgba(124, 58, 237, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px; border-right: 4px solid #7c3aed;">
                    <h4 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 14px; font-weight: 600;">📱 تفاصيل الدفع الرقمي</h4>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 10px;">
                        <span style="font-weight: 600; color: #374151;">المبلغ المطلوب:</span>
                        <span style="font-size: 18px; font-weight: bold; color: #7c3aed;">${grandTotal.toFixed(2)} ج.م</span>
                    </div>
                    <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <div style="font-size: 48px; margin-bottom: 10px;">📱</div>
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">اطلب من العميل إتمام الدفع عبر التطبيق</p>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; gap: 12px; margin-top: 25px;">
                    <button onclick="this.closest('.payment-modal').remove()" 
                            style="flex: 1; background: #6b7280; color: white; padding: 14px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 16px;">
                        إلغاء
                    </button>
                    <button id="complete-payment-btn" onclick="paymentManager.completePayment()" disabled
                            style="flex: 2; background: #059669; color: white; padding: 14px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 16px; opacity: 0.5;">
                        إتمام الدفع
                    </button>
                </div>
            </div>
        `;
        
        modal.className = 'payment-modal';
        document.body.appendChild(modal);
        
        // Store cart data for completion
        this.currentCartItems = cartItems;
        this.currentTotal = total;
        this.currentVat = vat;
        this.currentGrandTotal = grandTotal;
    }

    /**
     * Generate payment method buttons
     */
    generatePaymentMethodButtons() {
        return Object.keys(this.paymentMethods).map(key => {
            const method = this.paymentMethods[key];
            if (!method.enabled) return '';
            
            return `
                <button onclick="paymentManager.selectPaymentMethod('${key}')" 
                        class="payment-method-btn" data-method="${key}"
                        style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 12px; background: white; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="font-size: 24px;">${method.icon}</div>
                    <div style="font-weight: 600; color: #374151; font-size: 14px;">${method.name}</div>
                    <div style="font-size: 11px; color: #9ca3af;">${method.nameEn}</div>
                </button>
            `;
        }).join('');
    }

    /**
     * Select payment method
     */
    selectPaymentMethod(method) {
        this.currentPayment.method = method;
        
        // Update button styles
        document.querySelectorAll('.payment-method-btn').forEach(btn => {
            btn.style.border = '2px solid #e5e7eb';
            btn.style.background = 'white';
        });
        
        const selectedBtn = document.querySelector(`[data-method="${method}"]`);
        if (selectedBtn) {
            const methodData = this.paymentMethods[method];
            selectedBtn.style.border = `2px solid ${methodData.color}`;
            selectedBtn.style.background = `${methodData.color}15`;
        }
        
        // Show/hide relevant details
        document.getElementById('cash-details').style.display = method === 'cash' ? 'block' : 'none';
        document.getElementById('card-details').style.display = method === 'visa' ? 'block' : 'none';
        document.getElementById('digital-details').style.display = (method === 'instapay' || method === 'vodafone') ? 'block' : 'none';
        
        // Enable/disable complete button
        this.updateCompleteButton();
    }

    /**
     * Calculate change for cash payments
     */
    calculateChange() {
        const amountPaid = parseFloat(document.getElementById('amount-paid').value) || 0;
        const change = amountPaid - this.currentPayment.total;
        
        this.currentPayment.amountPaid = amountPaid;
        this.currentPayment.change = Math.max(0, change);
        
        const changeElement = document.getElementById('change-amount');
        if (changeElement) {
            changeElement.textContent = this.currentPayment.change.toFixed(2) + ' ج.م';
            changeElement.style.color = change >= 0 ? '#059669' : '#dc2626';
        }
        
        this.updateCompleteButton();
    }

    /**
     * Update complete payment button state
     */
    updateCompleteButton() {
        const completeBtn = document.getElementById('complete-payment-btn');
        if (!completeBtn) return;
        
        let canComplete = false;
        
        if (this.currentPayment.method === 'cash') {
            const amountPaid = parseFloat(document.getElementById('amount-paid').value) || 0;
            canComplete = amountPaid >= this.currentPayment.total;
        } else if (this.currentPayment.method) {
            canComplete = true; // For card and digital payments
        }
        
        completeBtn.disabled = !canComplete;
        completeBtn.style.opacity = canComplete ? '1' : '0.5';
        completeBtn.style.cursor = canComplete ? 'pointer' : 'not-allowed';
    }

    /**
     * Complete payment
     */
    completePayment() {
        if (!this.currentPayment.method) {
            alert('يرجى اختيار طريقة الدفع!');
            return;
        }
        
        if (this.currentPayment.method === 'cash') {
            const amountPaid = parseFloat(document.getElementById('amount-paid').value) || 0;
            if (amountPaid < this.currentPayment.total) {
                alert('المبلغ المدفوع أقل من المطلوب!');
                return;
            }
            this.currentPayment.amountPaid = amountPaid;
            this.currentPayment.change = amountPaid - this.currentPayment.total;
        } else {
            this.currentPayment.amountPaid = this.currentPayment.total;
            this.currentPayment.change = 0;
        }
        
        // Generate receipt with payment info
        const receiptHTML = this.generateReceiptWithPayment();
        
        // Close payment modal
        document.querySelector('.payment-modal').remove();
        
        // Show receipt
        this.showReceiptModal(receiptHTML);
        
        // Clear cart
        if (window.cart) {
            window.cart = [];
            if (window.updateCart) window.updateCart();
        }
        
        // Save transaction
        this.saveTransaction();
    }

    /**
     * Generate receipt with payment information
     */
    generateReceiptWithPayment() {
        const user = window.userManager ? window.userManager.getCurrentUserForReceipt() : {
            fullName: 'مستخدم غير معروف',
            username: 'unknown',
            role: 'unknown'
        };
        
        const now = new Date();
        const receiptNumber = 'R' + now.getTime().toString().slice(-8);
        const paymentMethod = this.paymentMethods[this.currentPayment.method];
        
        const roleNames = {
            admin: 'مدير النظام',
            manager: 'مدير',
            accountant: 'محاسب',
            cashier: 'أمين صندوق',
            viewer: 'مشاهد'
        };
        
        let receiptHTML = `
            <div style="width: 320px; margin: 20px auto; padding: 25px; border: 2px solid #1e3a8a; border-radius: 16px; font-family: 'Cairo', Arial, sans-serif; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px;">
                    <h2 style="color: #1e3a8a; margin: 0; font-size: 28px; font-weight: bold;">🏪 طريقة</h2>
                    <p style="margin: 8px 0; color: #6b7280; font-size: 14px;">نظام نقطة البيع</p>
                    <p style="margin: 0; font-size: 13px; color: #9ca3af; background: rgba(30, 58, 138, 0.1); padding: 4px 12px; border-radius: 12px; display: inline-block;">فاتورة ضريبية</p>
                </div>
                
                <!-- Receipt Info -->
                <div style="margin-bottom: 20px; font-size: 14px; background: rgba(30, 58, 138, 0.05); padding: 15px; border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-weight: 600;">رقم الفاتورة:</span>
                        <span style="font-weight: bold; color: #1e3a8a;">${receiptNumber}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-weight: 600;">التاريخ:</span>
                        <span>${now.toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-weight: 600;">الوقت:</span>
                        <span>${now.toLocaleTimeString('ar-EG')}</span>
                    </div>
                </div>
                
                <!-- User Info -->
                <div style="margin-bottom: 20px; padding: 15px; background: rgba(30, 58, 138, 0.1); border-radius: 12px; border-right: 4px solid #1e3a8a;">
                    <div style="font-size: 15px; font-weight: 700; color: #1e3a8a; margin-bottom: 8px;">
                        👤 بيانات الكاشير
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px;">
                        <span style="font-weight: 600;">الاسم:</span>
                        <span style="font-weight: bold;">${user.fullName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px;">
                        <span style="font-weight: 600;">المستخدم:</span>
                        <span>${user.username}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span style="font-weight: 600;">الدور:</span>
                        <span style="color: #1e3a8a; font-weight: 600;">${roleNames[user.role] || user.role}</span>
                    </div>
                </div>
                
                <!-- Payment Method -->
                <div style="margin-bottom: 20px; padding: 15px; background: ${paymentMethod.color}15; border-radius: 12px; border-right: 4px solid ${paymentMethod.color};">
                    <div style="font-size: 15px; font-weight: 700; color: ${paymentMethod.color}; margin-bottom: 8px;">
                        ${paymentMethod.icon} طريقة الدفع
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px;">
                        <span style="font-weight: 600;">الطريقة:</span>
                        <span style="font-weight: bold; color: ${paymentMethod.color};">${paymentMethod.name}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px;">
                        <span style="font-weight: 600;">المبلغ المدفوع:</span>
                        <span style="font-weight: bold;">${this.currentPayment.amountPaid.toFixed(2)} ج.م</span>
                    </div>
                    ${this.currentPayment.change > 0 ? `
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span style="font-weight: 600;">الباقي:</span>
                        <span style="font-weight: bold; color: #059669;">${this.currentPayment.change.toFixed(2)} ج.م</span>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Items -->
                <div style="margin-bottom: 20px;">
                    <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">
                        <strong style="color: #1e3a8a; font-size: 16px;">📋 المنتجات:</strong>
                    </div>
        `;
        
        this.currentCartItems.forEach(item => {
            receiptHTML += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; padding: 8px; background: rgba(0,0,0,0.02); border-radius: 8px;">
                    <div>
                        <div style="font-weight: 600; color: #374151;">${item.name}</div>
                        <div style="color: #6b7280; font-size: 11px;">${item.quantity} × ${item.price.toFixed(2)} ج.م</div>
                    </div>
                    <div style="font-weight: bold; color: #1e3a8a;">
                        ${(item.quantity * item.price).toFixed(2)} ج.م
                    </div>
                </div>
            `;
        });
        
        receiptHTML += `
                </div>
                
                <!-- Totals -->
                <div style="border-top: 2px solid #1e3a8a; padding-top: 15px; margin-top: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                        <span style="font-weight: 600;">المجموع الفرعي:</span>
                        <span style="font-weight: bold;">${this.currentTotal.toFixed(2)} ج.م</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #dc2626;">
                        <span style="font-weight: 600;">ضريبة القيمة المضافة (14%):</span>
                        <span style="font-weight: bold;">${this.currentVat.toFixed(2)} ج.م</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #1e3a8a; border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px; background: rgba(30, 58, 138, 0.05); padding: 12px; border-radius: 8px;">
                        <span>الإجمالي:</span>
                        <span>${this.currentGrandTotal.toFixed(2)} ج.م</span>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                    <p style="margin: 8px 0; font-weight: 600;">شكراً لزيارتكم 🙏</p>
                    <p style="margin: 8px 0;">نتطلع لخدمتكم مرة أخرى</p>
                    <p style="margin: 8px 0; font-size: 10px; color: #9ca3af;">نظام طريقة لنقاط البيع - آمن ومشفر 🔒</p>
                </div>
            </div>
        `;
        
        return receiptHTML;
    }

    /**
     * Show receipt modal
     */
    showReceiptModal(receiptHTML) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 20px; max-width: 450px; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                <button onclick="this.closest('.receipt-modal').remove()" style="position: absolute; top: 15px; left: 15px; background: #dc2626; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; font-size: 18px; font-weight: bold; z-index: 1;">×</button>
                ${receiptHTML}
                <div style="text-align: center; margin-top: 25px; display: flex; gap: 12px; justify-content: center;">
                    <button onclick="window.print()" style="background: #059669; color: white; padding: 12px 24px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px;">
                        🖨️ طباعة
                    </button>
                    <button onclick="this.closest('.receipt-modal').remove()" style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px;">
                        إغلاق
                    </button>
                </div>
            </div>
        `;
        
        modal.className = 'receipt-modal';
        document.body.appendChild(modal);
    }

    /**
     * Save transaction
     */
    saveTransaction() {
        try {
            const transaction = {
                id: 'T' + Date.now(),
                date: new Date().toISOString(),
                items: this.currentCartItems,
                total: this.currentTotal,
                vat: this.currentVat,
                grandTotal: this.currentGrandTotal,
                payment: {
                    method: this.currentPayment.method,
                    methodName: this.paymentMethods[this.currentPayment.method].name,
                    amountPaid: this.currentPayment.amountPaid,
                    change: this.currentPayment.change
                },
                user: window.userManager ? window.userManager.getCurrentUserForReceipt() : null
            };
            
            if (window.secureStorage) {
                const transactions = window.secureStorage.getSecure('transactions', { defaultValue: [] });
                transactions.push(transaction);
                window.secureStorage.setSecure('transactions', transactions);
            }
            
            console.log('✅ Transaction saved:', transaction.id);
        } catch (error) {
            console.error('⚠️ Error saving transaction:', error);
        }
    }
}

// Export for global use
window.PaymentManager = PaymentManager;
