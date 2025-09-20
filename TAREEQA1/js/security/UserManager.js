/**
 * Tareeqa POS User Management System
 * Handles user creation, editing, and management for admins
 * 
 * @author Tareeqa Development Team
 * @version 1.0.0
 */

class UserManager {
    constructor(securityManager) {
        this.security = securityManager;
        this.init();
    }

    /**
     * Initialize user manager
     */
    init() {
        console.log('👥 Initializing User Manager...');
        console.log('✅ User Manager initialized');
    }

    /**
     * Create user management interface
     */
    createUserManagementUI() {
        if (!this.security.hasPermission('users.create')) {
            throw new Error('ليس لديك صلاحية لإدارة المستخدمين');
        }

        const users = this.security.getStoredUsers();
        
        return `
            <div class="user-management">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <!-- Add New User Form -->
                    <div style="background: rgba(255, 255, 255, 0.75); border-radius: 16px; padding: 24px; border: 1px solid rgba(255, 255, 255, 0.35);">
                        <h3 style="font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 16px;">إضافة مستخدم جديد</h3>
                        <form id="add-user-form" onsubmit="userManager.handleAddUser(event)">
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <div>
                                    <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #374151;">الاسم الكامل:</label>
                                    <input type="text" id="new-user-fullname" required 
                                           placeholder="أدخل الاسم الكامل" 
                                           style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; text-align: right;">
                                </div>
                                
                                <div>
                                    <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #374151;">اسم المستخدم:</label>
                                    <input type="text" id="new-user-username" required 
                                           placeholder="أدخل اسم المستخدم" 
                                           style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                                </div>
                                
                                <div>
                                    <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #374151;">كلمة المرور:</label>
                                    <input type="password" id="new-user-password" required 
                                           placeholder="أدخل كلمة المرور" 
                                           style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                                </div>
                                
                                <div>
                                    <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #374151;">البريد الإلكتروني:</label>
                                    <input type="email" id="new-user-email" 
                                           placeholder="أدخل البريد الإلكتروني (اختياري)" 
                                           style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                                </div>
                                
                                <div>
                                    <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #374151;">الدور:</label>
                                    <select id="new-user-role" required style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; text-align: right;">
                                        <option value="">اختر الدور</option>
                                        <option value="manager">مدير</option>
                                        <option value="accountant">محاسب</option>
                                        <option value="cashier">أمين صندوق</option>
                                        <option value="viewer">مشاهد</option>
                                    </select>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                                    <input type="checkbox" id="new-user-active" checked>
                                    <label for="new-user-active" style="font-weight: 500; color: #374151;">المستخدم نشط</label>
                                </div>
                                
                                <button type="submit" style="background: #059669; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 8px;">
                                    إضافة المستخدم
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- User Statistics -->
                    <div style="background: rgba(255, 255, 255, 0.75); border-radius: 16px; padding: 24px; border: 1px solid rgba(255, 255, 255, 0.35);">
                        <h3 style="font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 16px;">إحصائيات المستخدمين</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                                <span>إجمالي المستخدمين:</span>
                                <span style="font-weight: bold; color: #059669;">${users.length}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                                <span>المستخدمين النشطين:</span>
                                <span style="font-weight: bold; color: #059669;">${users.filter(u => u.isActive).length}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                                <span>المديرين:</span>
                                <span style="font-weight: bold; color: #7c3aed;">${users.filter(u => u.role === 'admin' || u.role === 'manager').length}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                                <span>أمناء الصندوق:</span>
                                <span style="font-weight: bold; color: #2563eb;">${users.filter(u => u.role === 'cashier').length}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                <span>المحاسبين:</span>
                                <span style="font-weight: bold; color: #059669;">${users.filter(u => u.role === 'accountant').length}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Users List -->
                <div style="background: rgba(255, 255, 255, 0.75); border-radius: 16px; padding: 24px; border: 1px solid rgba(255, 255, 255, 0.35);">
                    <h3 style="font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 16px;">قائمة المستخدمين</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: rgba(30, 58, 138, 0.1);">
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1e3a8a;">الاسم الكامل</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1e3a8a;">اسم المستخدم</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1e3a8a;">الدور</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1e3a8a;">الحالة</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1e3a8a;">آخر دخول</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1e3a8a;">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="users-table-body">
                                ${this.generateUsersTable(users)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate users table HTML
     */
    generateUsersTable(users) {
        return users.map(user => {
            const roleNames = {
                admin: 'مدير النظام',
                manager: 'مدير',
                accountant: 'محاسب',
                cashier: 'أمين صندوق',
                viewer: 'مشاهد'
            };
            
            const roleColors = {
                admin: '#dc2626',
                manager: '#7c3aed',
                accountant: '#059669',
                cashier: '#2563eb',
                viewer: '#6b7280'
            };
            
            const statusColor = user.isActive ? '#059669' : '#dc2626';
            const statusText = user.isActive ? 'نشط' : 'غير نشط';
            const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل دخول';
            
            return `
                <tr>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        <strong>${user.fullName}</strong>
                    </td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${user.username}
                    </td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        <span style="background: ${roleColors[user.role]}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${roleNames[user.role] || user.role}
                        </span>
                    </td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        <span style="color: ${statusColor}; font-weight: 600;">
                            ${statusText}
                        </span>
                    </td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${lastLogin}
                    </td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${user.username !== 'admin' ? `
                            <button onclick="userManager.editUser('${user.id}')" style="background: #2563eb; color: white; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; margin-left: 4px;">
                                تعديل
                            </button>
                            <button onclick="userManager.toggleUserStatus('${user.id}')" style="background: ${user.isActive ? '#dc2626' : '#059669'}; color: white; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; margin-left: 4px;">
                                ${user.isActive ? 'إيقاف' : 'تفعيل'}
                            </button>
                        ` : '<span style="color: #6b7280; font-size: 12px;">مدير النظام</span>'}
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Handle add user form submission
     */
    async handleAddUser(event) {
        event.preventDefault();
        
        try {
            const fullName = document.getElementById('new-user-fullname').value.trim();
            const username = document.getElementById('new-user-username').value.trim();
            const password = document.getElementById('new-user-password').value;
            const email = document.getElementById('new-user-email').value.trim();
            const role = document.getElementById('new-user-role').value;
            const isActive = document.getElementById('new-user-active').checked;
            
            // Validation
            if (!fullName || !username || !password || !role) {
                alert('يرجى ملء جميع الحقول المطلوبة!');
                return;
            }
            
            if (username.length < 3) {
                alert('اسم المستخدم يجب أن يكون 3 أحرف على الأقل!');
                return;
            }
            
            if (password.length < 6) {
                alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل!');
                return;
            }
            
            // Create user
            await this.security.createUser({
                fullName: fullName,
                username: username,
                password: password,
                email: email || `${username}@tareeqa.pos`,
                role: role,
                isActive: isActive
            });
            
            // Clear form
            document.getElementById('add-user-form').reset();
            
            // Refresh users list
            this.refreshUsersList();
            
            // Show success message
            alert(`تم إضافة المستخدم "${fullName}" بنجاح!`);
            
            // Log security event
            this.security.logSecurityEvent('user_created', {
                newUsername: username,
                newUserRole: role,
                createdBy: this.security.currentUser.username
            });
            
        } catch (error) {
            alert(`خطأ في إضافة المستخدم: ${error.message}`);
            console.error('Error adding user:', error);
        }
    }

    /**
     * Edit user
     */
    editUser(userId) {
        const users = this.security.getStoredUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            alert('المستخدم غير موجود!');
            return;
        }
        
        const newFullName = prompt('الاسم الكامل الجديد:', user.fullName);
        if (newFullName && newFullName.trim() !== user.fullName) {
            user.fullName = newFullName.trim();
            this.security.storeUsers(users);
            this.refreshUsersList();
            
            this.security.logSecurityEvent('user_edited', {
                editedUsername: user.username,
                editedBy: this.security.currentUser.username
            });
            
            alert('تم تحديث بيانات المستخدم بنجاح!');
        }
    }

    /**
     * Toggle user active status
     */
    toggleUserStatus(userId) {
        const users = this.security.getStoredUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            alert('المستخدم غير موجود!');
            return;
        }
        
        const action = user.isActive ? 'إيقاف' : 'تفعيل';
        if (confirm(`هل أنت متأكد من ${action} المستخدم "${user.fullName}"؟`)) {
            user.isActive = !user.isActive;
            this.security.storeUsers(users);
            this.refreshUsersList();
            
            this.security.logSecurityEvent('user_status_changed', {
                username: user.username,
                newStatus: user.isActive ? 'active' : 'inactive',
                changedBy: this.security.currentUser.username
            });
            
            alert(`تم ${action} المستخدم بنجاح!`);
        }
    }

    /**
     * Refresh users list
     */
    refreshUsersList() {
        const users = this.security.getStoredUsers();
        const tableBody = document.getElementById('users-table-body');
        if (tableBody) {
            tableBody.innerHTML = this.generateUsersTable(users);
        }
    }

    /**
     * Get current user info for receipts
     */
    getCurrentUserForReceipt() {
        if (this.security.currentUser) {
            return {
                fullName: this.security.currentUser.fullName,
                username: this.security.currentUser.username,
                role: this.security.currentUser.role
            };
        }
        return {
            fullName: 'مستخدم غير معروف',
            username: 'unknown',
            role: 'unknown'
        };
    }

    /**
     * Generate receipt with user info
     */
    generateReceiptWithUser(cartItems, total, vat, grandTotal) {
        const user = this.getCurrentUserForReceipt();
        const now = new Date();
        const receiptNumber = 'R' + now.getTime().toString().slice(-8);
        
        const roleNames = {
            admin: 'مدير النظام',
            manager: 'مدير',
            accountant: 'محاسب',
            cashier: 'أمين صندوق',
            viewer: 'مشاهد'
        };
        
        let receiptHTML = `
            <div style="width: 300px; margin: 20px auto; padding: 20px; border: 2px solid #1e3a8a; border-radius: 12px; font-family: 'Cairo', Arial, sans-serif; background: white;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px;">
                    <h2 style="color: #1e3a8a; margin: 0; font-size: 24px;">🏪 طريقة</h2>
                    <p style="margin: 5px 0; color: #6b7280;">نظام نقطة البيع</p>
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">فاتورة ضريبية</p>
                </div>
                
                <!-- Receipt Info -->
                <div style="margin-bottom: 15px; font-size: 14px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>رقم الفاتورة:</span>
                        <span style="font-weight: bold;">${receiptNumber}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>التاريخ:</span>
                        <span>${now.toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>الوقت:</span>
                        <span>${now.toLocaleTimeString('ar-EG')}</span>
                    </div>
                </div>
                
                <!-- User Info -->
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(30, 58, 138, 0.1); border-radius: 8px; border-right: 4px solid #1e3a8a;">
                    <div style="font-size: 14px; font-weight: 600; color: #1e3a8a; margin-bottom: 5px;">
                        👤 بيانات الكاشير
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 13px;">
                        <span>الاسم:</span>
                        <span style="font-weight: bold;">${user.fullName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 13px;">
                        <span>المستخدم:</span>
                        <span>${user.username}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span>الدور:</span>
                        <span style="color: #1e3a8a; font-weight: 600;">${roleNames[user.role] || user.role}</span>
                    </div>
                </div>
                
                <!-- Items -->
                <div style="margin-bottom: 15px;">
                    <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 10px;">
                        <strong style="color: #1e3a8a;">المنتجات:</strong>
                    </div>
        `;
        
        cartItems.forEach(item => {
            receiptHTML += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                    <div>
                        <div style="font-weight: 600;">${item.name}</div>
                        <div style="color: #6b7280; font-size: 11px;">${item.quantity} × ${item.price.toFixed(2)} ج.م</div>
                    </div>
                    <div style="font-weight: bold;">
                        ${(item.quantity * item.price).toFixed(2)} ج.م
                    </div>
                </div>
            `;
        });
        
        receiptHTML += `
                </div>
                
                <!-- Totals -->
                <div style="border-top: 2px solid #1e3a8a; padding-top: 10px; margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>المجموع الفرعي:</span>
                        <span>${total.toFixed(2)} ج.م</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #dc2626;">
                        <span>ضريبة القيمة المضافة (14%):</span>
                        <span>${vat.toFixed(2)} ج.م</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #1e3a8a; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
                        <span>الإجمالي:</span>
                        <span>${grandTotal.toFixed(2)} ج.م</span>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                    <p style="margin: 5px 0;">شكراً لزيارتكم</p>
                    <p style="margin: 5px 0;">نتطلع لخدمتكم مرة أخرى</p>
                    <p style="margin: 5px 0; font-size: 10px;">نظام طريقة لنقاط البيع</p>
                </div>
            </div>
        `;
        
        return receiptHTML;
    }
}

// Export for global use
window.UserManager = UserManager;
