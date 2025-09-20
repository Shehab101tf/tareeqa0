/**
 * Tareeqa POS Permission Manager
 * Role-Based Access Control (RBAC) system for granular permissions
 * 
 * @author Tareeqa Development Team
 * @version 1.0.0
 */

class PermissionManager {
    constructor(securityManager) {
        this.security = securityManager;
        this.permissions = this.definePermissions();
        this.roles = this.defineRoles();
        
        this.init();
    }

    /**
     * Initialize permission manager
     */
    init() {
        console.log('🛡️ Initializing Permission Manager...');
        
        // Set up permission checking for UI elements
        this.setupUIPermissions();
        
        // Set up navigation guards
        this.setupNavigationGuards();
        
        console.log('✅ Permission Manager initialized');
    }

    /**
     * Define all available permissions in the system
     */
    definePermissions() {
        return {
            // POS Operations
            'pos.use': {
                name: 'استخدام نقطة البيع',
                description: 'القدرة على استخدام واجهة نقطة البيع',
                category: 'pos'
            },
            'pos.discount': {
                name: 'تطبيق خصومات',
                description: 'القدرة على تطبيق خصومات على المنتجات',
                category: 'pos'
            },
            'pos.refund': {
                name: 'استرداد المبالغ',
                description: 'القدرة على معالجة عمليات الاسترداد',
                category: 'pos'
            },
            'pos.void': {
                name: 'إلغاء المعاملات',
                description: 'القدرة على إلغاء المعاملات',
                category: 'pos'
            },

            // Product Management
            'products.view': {
                name: 'عرض المنتجات',
                description: 'القدرة على عرض قائمة المنتجات',
                category: 'products'
            },
            'products.create': {
                name: 'إضافة منتجات',
                description: 'القدرة على إضافة منتجات جديدة',
                category: 'products'
            },
            'products.edit': {
                name: 'تعديل المنتجات',
                description: 'القدرة على تعديل بيانات المنتجات',
                category: 'products'
            },
            'products.delete': {
                name: 'حذف المنتجات',
                description: 'القدرة على حذف المنتجات',
                category: 'products'
            },
            'products.import': {
                name: 'استيراد المنتجات',
                description: 'القدرة على استيراد المنتجات من ملفات خارجية',
                category: 'products'
            },
            'products.export': {
                name: 'تصدير المنتجات',
                description: 'القدرة على تصدير بيانات المنتجات',
                category: 'products'
            },

            // Inventory Management
            'inventory.view': {
                name: 'عرض المخزون',
                description: 'القدرة على عرض مستويات المخزون',
                category: 'inventory'
            },
            'inventory.adjust': {
                name: 'تعديل المخزون',
                description: 'القدرة على تعديل كميات المخزون',
                category: 'inventory'
            },
            'inventory.transfer': {
                name: 'نقل المخزون',
                description: 'القدرة على نقل المخزون بين المواقع',
                category: 'inventory'
            },

            // Reports and Analytics
            'reports.view': {
                name: 'عرض التقارير',
                description: 'القدرة على عرض التقارير الأساسية',
                category: 'reports'
            },
            'reports.advanced': {
                name: 'التقارير المتقدمة',
                description: 'القدرة على عرض التقارير المتقدمة والتحليلات',
                category: 'reports'
            },
            'reports.export': {
                name: 'تصدير التقارير',
                description: 'القدرة على تصدير التقارير',
                category: 'reports'
            },
            'reports.financial': {
                name: 'التقارير المالية',
                description: 'القدرة على عرض التقارير المالية الحساسة',
                category: 'reports'
            },

            // Hardware Management
            'hardware.view': {
                name: 'عرض الأجهزة',
                description: 'القدرة على عرض حالة الأجهزة',
                category: 'hardware'
            },
            'hardware.use': {
                name: 'استخدام الأجهزة',
                description: 'القدرة على استخدام الأجهزة (طابعة، ماسح)',
                category: 'hardware'
            },
            'hardware.manage': {
                name: 'إدارة الأجهزة',
                description: 'القدرة على إعداد وإدارة الأجهزة',
                category: 'hardware'
            },
            'hardware.test': {
                name: 'اختبار الأجهزة',
                description: 'القدرة على اختبار وظائف الأجهزة',
                category: 'hardware'
            },

            // User Management
            'users.view': {
                name: 'عرض المستخدمين',
                description: 'القدرة على عرض قائمة المستخدمين',
                category: 'users'
            },
            'users.create': {
                name: 'إضافة مستخدمين',
                description: 'القدرة على إضافة مستخدمين جدد',
                category: 'users'
            },
            'users.edit': {
                name: 'تعديل المستخدمين',
                description: 'القدرة على تعديل بيانات المستخدمين',
                category: 'users'
            },
            'users.delete': {
                name: 'حذف المستخدمين',
                description: 'القدرة على حذف المستخدمين',
                category: 'users'
            },
            'users.permissions': {
                name: 'إدارة الصلاحيات',
                description: 'القدرة على تعديل صلاحيات المستخدمين',
                category: 'users'
            },

            // System Settings
            'settings.view': {
                name: 'عرض الإعدادات',
                description: 'القدرة على عرض إعدادات النظام',
                category: 'settings'
            },
            'settings.edit': {
                name: 'تعديل الإعدادات',
                description: 'القدرة على تعديل إعدادات النظام',
                category: 'settings'
            },
            'settings.backup': {
                name: 'النسخ الاحتياطي',
                description: 'القدرة على إنشاء واستعادة النسخ الاحتياطية',
                category: 'settings'
            },
            'settings.security': {
                name: 'إعدادات الأمان',
                description: 'القدرة على تعديل إعدادات الأمان',
                category: 'settings'
            },

            // Customer Management
            'customers.view': {
                name: 'عرض العملاء',
                description: 'القدرة على عرض قائمة العملاء',
                category: 'customers'
            },
            'customers.create': {
                name: 'إضافة عملاء',
                description: 'القدرة على إضافة عملاء جدد',
                category: 'customers'
            },
            'customers.edit': {
                name: 'تعديل العملاء',
                description: 'القدرة على تعديل بيانات العملاء',
                category: 'customers'
            },
            'customers.delete': {
                name: 'حذف العملاء',
                description: 'القدرة على حذف العملاء',
                category: 'customers'
            },

            // Security and Audit
            'security.logs': {
                name: 'سجلات الأمان',
                description: 'القدرة على عرض سجلات الأمان والتدقيق',
                category: 'security'
            },
            'security.manage': {
                name: 'إدارة الأمان',
                description: 'القدرة على إدارة إعدادات الأمان المتقدمة',
                category: 'security'
            }
        };
    }

    /**
     * Define roles and their associated permissions
     */
    defineRoles() {
        return {
            admin: {
                name: 'مدير النظام',
                description: 'صلاحيات كاملة على جميع وظائف النظام',
                permissions: ['*'], // All permissions
                color: '#dc2626',
                priority: 1
            },
            manager: {
                name: 'مدير',
                description: 'صلاحيات إدارية واسعة مع قيود على الأمان',
                permissions: [
                    'pos.use', 'pos.discount', 'pos.refund', 'pos.void',
                    'products.view', 'products.create', 'products.edit', 'products.delete', 'products.import', 'products.export',
                    'inventory.view', 'inventory.adjust', 'inventory.transfer',
                    'reports.view', 'reports.advanced', 'reports.export', 'reports.financial',
                    'hardware.view', 'hardware.use', 'hardware.manage', 'hardware.test',
                    'users.view', 'users.create', 'users.edit',
                    'settings.view', 'settings.edit', 'settings.backup',
                    'customers.view', 'customers.create', 'customers.edit', 'customers.delete'
                ],
                color: '#7c3aed',
                priority: 2
            },
            accountant: {
                name: 'محاسب',
                description: 'صلاحيات مالية ومحاسبية مع عرض التقارير',
                permissions: [
                    'pos.use',
                    'products.view',
                    'inventory.view',
                    'reports.view', 'reports.advanced', 'reports.export', 'reports.financial',
                    'hardware.view', 'hardware.use',
                    'settings.view',
                    'customers.view', 'customers.create', 'customers.edit'
                ],
                color: '#059669',
                priority: 3
            },
            cashier: {
                name: 'أمين صندوق',
                description: 'صلاحيات أساسية لتشغيل نقطة البيع',
                permissions: [
                    'pos.use', 'pos.discount',
                    'products.view',
                    'inventory.view',
                    'reports.view',
                    'hardware.view', 'hardware.use',
                    'customers.view', 'customers.create'
                ],
                color: '#2563eb',
                priority: 4
            },
            viewer: {
                name: 'مشاهد',
                description: 'صلاحيات عرض فقط بدون تعديل',
                permissions: [
                    'products.view',
                    'inventory.view',
                    'reports.view',
                    'hardware.view',
                    'customers.view'
                ],
                color: '#6b7280',
                priority: 5
            }
        };
    }

    /**
     * Check if current user has specific permission
     */
    hasPermission(permission) {
        if (!this.security.currentUser || this.security.isLocked) {
            return false;
        }

        const userRole = this.security.currentUser.role;
        const rolePermissions = this.getRolePermissions(userRole);

        // Admin has all permissions
        if (rolePermissions.includes('*')) {
            return true;
        }

        return rolePermissions.includes(permission);
    }

    /**
     * Check if current user has any of the specified permissions
     */
    hasAnyPermission(permissions) {
        return permissions.some(permission => this.hasPermission(permission));
    }

    /**
     * Check if current user has all of the specified permissions
     */
    hasAllPermissions(permissions) {
        return permissions.every(permission => this.hasPermission(permission));
    }

    /**
     * Get permissions for a specific role
     */
    getRolePermissions(role) {
        const roleData = this.roles[role];
        return roleData ? roleData.permissions : [];
    }

    /**
     * Get role information
     */
    getRoleInfo(role) {
        return this.roles[role] || null;
    }

    /**
     * Get all available roles
     */
    getAllRoles() {
        return Object.keys(this.roles).map(key => ({
            key,
            ...this.roles[key]
        })).sort((a, b) => a.priority - b.priority);
    }

    /**
     * Get permissions by category
     */
    getPermissionsByCategory() {
        const categories = {};
        
        Object.keys(this.permissions).forEach(key => {
            const permission = this.permissions[key];
            const category = permission.category;
            
            if (!categories[category]) {
                categories[category] = [];
            }
            
            categories[category].push({
                key,
                ...permission
            });
        });
        
        return categories;
    }

    /**
     * Setup UI permission checking
     */
    setupUIPermissions() {
        // Create a MutationObserver to watch for new elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.checkElementPermissions(node);
                    }
                });
            });
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Check existing elements
        this.checkElementPermissions(document.body);
    }

    /**
     * Check permissions for DOM elements
     */
    checkElementPermissions(element) {
        // Find all elements with permission attributes
        const elementsWithPermissions = element.querySelectorAll('[data-permission]');
        
        elementsWithPermissions.forEach(el => {
            const requiredPermission = el.getAttribute('data-permission');
            const hasAccess = this.hasPermission(requiredPermission);
            
            if (!hasAccess) {
                // Hide or disable element based on data-permission-action
                const action = el.getAttribute('data-permission-action') || 'hide';
                
                switch (action) {
                    case 'hide':
                        el.style.display = 'none';
                        break;
                    case 'disable':
                        el.disabled = true;
                        el.classList.add('permission-disabled');
                        break;
                    case 'readonly':
                        el.readOnly = true;
                        el.classList.add('permission-readonly');
                        break;
                }
            } else {
                // Restore element if permission is granted
                const action = el.getAttribute('data-permission-action') || 'hide';
                
                switch (action) {
                    case 'hide':
                        el.style.display = '';
                        break;
                    case 'disable':
                        el.disabled = false;
                        el.classList.remove('permission-disabled');
                        break;
                    case 'readonly':
                        el.readOnly = false;
                        el.classList.remove('permission-readonly');
                        break;
                }
            }
        });

        // Check role-based elements
        const elementsWithRoles = element.querySelectorAll('[data-role]');
        
        elementsWithRoles.forEach(el => {
            const allowedRoles = el.getAttribute('data-role').split(',').map(r => r.trim());
            const userRole = this.security.currentUser?.role;
            const hasAccess = allowedRoles.includes(userRole) || allowedRoles.includes('*');
            
            if (!hasAccess) {
                el.style.display = 'none';
            } else {
                el.style.display = '';
            }
        });
    }

    /**
     * Setup navigation guards
     */
    setupNavigationGuards() {
        // Override navigation functions to check permissions
        const originalShowProducts = window.showProducts;
        const originalShowHardware = window.showHardware;
        const originalShowReports = window.showReports;
        const originalShowSettings = window.showSettings;

        window.showProducts = () => {
            if (this.hasPermission('products.view')) {
                originalShowProducts?.();
            } else {
                this.showAccessDenied('products.view');
            }
        };

        window.showHardware = () => {
            if (this.hasPermission('hardware.view')) {
                originalShowHardware?.();
            } else {
                this.showAccessDenied('hardware.view');
            }
        };

        window.showReports = () => {
            if (this.hasPermission('reports.view')) {
                originalShowReports?.();
            } else {
                this.showAccessDenied('reports.view');
            }
        };

        window.showSettings = () => {
            if (this.hasPermission('settings.view')) {
                originalShowSettings?.();
            } else {
                this.showAccessDenied('settings.view');
            }
        };
    }

    /**
     * Show access denied message
     */
    showAccessDenied(permission) {
        const permissionInfo = this.permissions[permission];
        const message = `ليس لديك صلاحية للوصول إلى: ${permissionInfo?.name || permission}`;
        
        // Show notification
        if (window.authUI) {
            window.authUI.showNotification(message, 'error');
        } else {
            alert(message);
        }

        // Log security event
        this.security.logSecurityEvent('access_denied', {
            permission: permission,
            userRole: this.security.currentUser?.role
        });
    }

    /**
     * Create permission management UI
     */
    createPermissionManagementUI() {
        if (!this.hasPermission('users.permissions')) {
            this.showAccessDenied('users.permissions');
            return;
        }

        const categories = this.getPermissionsByCategory();
        const roles = this.getAllRoles();

        let html = `
            <div class="permission-management">
                <h2>إدارة الصلاحيات</h2>
                
                <div class="roles-overview">
                    <h3>الأدوار المتاحة</h3>
                    <div class="roles-grid">
        `;

        roles.forEach(role => {
            html += `
                <div class="role-card" style="border-left: 4px solid ${role.color}">
                    <h4>${role.name}</h4>
                    <p>${role.description}</p>
                    <div class="role-permissions-count">
                        ${role.permissions.includes('*') ? 'جميع الصلاحيات' : `${role.permissions.length} صلاحية`}
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
                
                <div class="permissions-matrix">
                    <h3>مصفوفة الصلاحيات</h3>
                    <div class="permissions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>الصلاحية</th>
        `;

        roles.forEach(role => {
            html += `<th style="color: ${role.color}">${role.name}</th>`;
        });

        html += `
                                </tr>
                            </thead>
                            <tbody>
        `;

        Object.keys(categories).forEach(categoryKey => {
            const categoryPermissions = categories[categoryKey];
            
            html += `
                <tr class="category-header">
                    <td colspan="${roles.length + 1}"><strong>${this.getCategoryDisplayName(categoryKey)}</strong></td>
                </tr>
            `;

            categoryPermissions.forEach(permission => {
                html += `<tr><td>${permission.name}</td>`;
                
                roles.forEach(role => {
                    const hasPermission = role.permissions.includes('*') || role.permissions.includes(permission.key);
                    html += `<td class="permission-cell ${hasPermission ? 'has-permission' : 'no-permission'}">
                        ${hasPermission ? '✅' : '❌'}
                    </td>`;
                });
                
                html += `</tr>`;
            });
        });

        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Get display name for permission category
     */
    getCategoryDisplayName(category) {
        const categoryNames = {
            pos: 'نقطة البيع',
            products: 'إدارة المنتجات',
            inventory: 'إدارة المخزون',
            reports: 'التقارير والتحليلات',
            hardware: 'إدارة الأجهزة',
            users: 'إدارة المستخدمين',
            settings: 'إعدادات النظام',
            customers: 'إدارة العملاء',
            security: 'الأمان والتدقيق'
        };
        
        return categoryNames[category] || category;
    }

    /**
     * Validate action with permission check
     */
    validateAction(permission, action) {
        if (!this.hasPermission(permission)) {
            this.showAccessDenied(permission);
            return false;
        }

        // Log the action
        this.security.logSecurityEvent('action_performed', {
            permission: permission,
            action: action,
            userRole: this.security.currentUser?.role
        });

        return true;
    }

    /**
     * Get current user's permissions
     */
    getCurrentUserPermissions() {
        if (!this.security.currentUser) {
            return [];
        }

        const rolePermissions = this.getRolePermissions(this.security.currentUser.role);
        
        if (rolePermissions.includes('*')) {
            return Object.keys(this.permissions);
        }

        return rolePermissions;
    }

    /**
     * Check if user can perform bulk operations
     */
    canPerformBulkOperation(operation) {
        const bulkPermissions = {
            'bulk_delete_products': ['products.delete'],
            'bulk_edit_products': ['products.edit'],
            'bulk_import_products': ['products.import'],
            'bulk_export_data': ['reports.export'],
            'bulk_user_management': ['users.edit', 'users.delete']
        };

        const requiredPermissions = bulkPermissions[operation] || [];
        return this.hasAllPermissions(requiredPermissions);
    }
}

// Export for global use
window.PermissionManager = PermissionManager;
