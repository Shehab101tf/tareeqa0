/**
 * Tareeqa POS Authentication UI Components
 * Handles login, logout, lock screen, and user management interfaces
 * 
 * @author Tareeqa Development Team
 * @version 1.0.0
 */

class AuthUI {
    constructor(securityManager) {
        this.security = securityManager;
        this.isLoginScreenVisible = false;
        this.isLockScreenVisible = false;
        
        this.init();
    }

    /**
     * Initialize authentication UI
     */
    init() {
        this.createLoginScreen();
        this.createLockScreen();
        this.createUserMenu();
        
        // Set up global functions
        window.showLoginScreen = () => this.showLoginScreen();
        window.showLockScreen = () => this.showLockScreen();
        window.hideLoginScreen = () => this.hideLoginScreen();
        window.hideLockScreen = () => this.hideLockScreen();
    }

    /**
     * Create login screen HTML
     */
    createLoginScreen() {
        const loginHTML = `
            <div id="login-screen" class="auth-overlay" style="display: none;">
                <div class="auth-container">
                    <div class="auth-card">
                        <!-- Logo and Title -->
                        <div class="auth-header">
                            <div class="auth-logo">
                                <div style="font-size: 48px; color: #1e3a8a; margin-bottom: 16px;">🏪</div>
                                <h1 style="font-size: 32px; font-weight: bold; color: #1e3a8a; margin: 0;">طريقة</h1>
                                <p style="color: #6b7280; margin: 8px 0 0 0;">نظام نقطة البيع</p>
                            </div>
                        </div>

                        <!-- Login Form -->
                        <form id="login-form" class="auth-form">
                            <div class="form-group">
                                <label for="login-username">اسم المستخدم</label>
                                <input type="text" id="login-username" required 
                                       placeholder="أدخل اسم المستخدم" 
                                       style="text-align: right;">
                            </div>

                            <div class="form-group">
                                <label for="login-password">كلمة المرور</label>
                                <div class="password-input">
                                    <input type="password" id="login-password" required 
                                           placeholder="أدخل كلمة المرور"
                                           style="text-align: right;">
                                    <button type="button" class="password-toggle" onclick="authUI.togglePassword('login-password')">
                                        👁️
                                    </button>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="login-role">الدور</label>
                                <select id="login-role" style="text-align: right;">
                                    <option value="">اختر الدور</option>
                                    <option value="admin">مدير النظام</option>
                                    <option value="manager">مدير</option>
                                    <option value="accountant">محاسب</option>
                                    <option value="cashier">أمين صندوق</option>
                                </select>
                            </div>

                            <div id="login-error" class="error-message" style="display: none;"></div>

                            <button type="submit" class="auth-button primary">
                                <span class="button-text">تسجيل الدخول</span>
                                <span class="button-loading" style="display: none;">جاري التحقق...</span>
                            </button>
                        </form>

                        <!-- Default Credentials Info -->
                        <div class="auth-info">
                            <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">بيانات الدخول الافتراضية:</p>
                            <div style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
                                <div>👤 <strong>مدير:</strong> admin / admin123</div>
                                <div>💰 <strong>كاشير:</strong> cashier / cashier123</div>
                            </div>
                        </div>

                        <!-- Security Info -->
                        <div class="security-info">
                            <div style="display: flex; align-items: center; gap: 8px; color: #059669; font-size: 12px;">
                                <span>🔒</span>
                                <span>نظام آمن - تشفير محلي</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', loginHTML);
        this.setupLoginForm();
    }

    /**
     * Create lock screen HTML
     */
    createLockScreen() {
        const lockHTML = `
            <div id="lock-screen" class="auth-overlay" style="display: none;">
                <div class="auth-container">
                    <div class="auth-card">
                        <!-- Lock Icon and Info -->
                        <div class="auth-header">
                            <div class="auth-logo">
                                <div style="font-size: 64px; color: #f59e0b; margin-bottom: 16px;">🔒</div>
                                <h1 style="font-size: 24px; font-weight: bold; color: #1e3a8a; margin: 0;">الجلسة مقفلة</h1>
                                <p style="color: #6b7280; margin: 8px 0 0 0;">أدخل كلمة المرور لإلغاء القفل</p>
                            </div>
                        </div>

                        <!-- User Info -->
                        <div id="lock-user-info" class="user-info">
                            <!-- Will be populated dynamically -->
                        </div>

                        <!-- Unlock Form -->
                        <form id="unlock-form" class="auth-form">
                            <div class="form-group">
                                <label for="unlock-password">كلمة المرور</label>
                                <div class="password-input">
                                    <input type="password" id="unlock-password" required 
                                           placeholder="أدخل كلمة المرور"
                                           style="text-align: right;">
                                    <button type="button" class="password-toggle" onclick="authUI.togglePassword('unlock-password')">
                                        👁️
                                    </button>
                                </div>
                            </div>

                            <div id="unlock-error" class="error-message" style="display: none;"></div>

                            <button type="submit" class="auth-button primary">
                                <span class="button-text">إلغاء القفل</span>
                                <span class="button-loading" style="display: none;">جاري التحقق...</span>
                            </button>
                        </form>

                        <!-- Logout Option -->
                        <div class="auth-actions">
                            <button type="button" class="auth-button secondary" onclick="authUI.logoutFromLock()">
                                تسجيل خروج
                            </button>
                        </div>

                        <!-- Lock Time Info -->
                        <div class="lock-info">
                            <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 12px;">
                                <span>🕐</span>
                                <span id="lock-time">تم القفل بسبب عدم النشاط</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', lockHTML);
        this.setupLockForm();
    }

    /**
     * Create user menu in header
     */
    createUserMenu() {
        // Find the header or create one
        let header = document.querySelector('.app-header');
        if (!header) {
            header = document.createElement('div');
            header.className = 'app-header';
            document.body.insertBefore(header, document.body.firstChild);
        }

        const userMenuHTML = `
            <div id="user-menu-toggle" class="user-menu-toggle" onclick="authUI.toggleUserMenu()" style="display: none;">
                <span>👤</span>
                <span id="current-user-name">المستخدم</span>
                <span>▼</span>
            </div>
            
            <div id="user-menu-overlay" class="user-menu-overlay" onclick="authUI.hideUserMenu()"></div>
            
            <div id="user-menu" class="user-menu hidden">
                <button class="user-menu-close" onclick="authUI.hideUserMenu()">×</button>
                
                <div class="user-info-display">
                    <div class="user-avatar">👤</div>
                    <div class="user-details">
                        <div id="user-name" class="user-name"></div>
                        <div id="user-role" class="user-role"></div>
                    </div>
                </div>
                
                <div class="user-actions">
                    <button class="user-action-btn" onclick="authUI.showChangePassword()">
                        🔑 تغيير كلمة المرور
                    </button>
                    <button class="user-action-btn" onclick="authUI.showUserProfile()">
                        👤 الملف الشخصي
                    </button>
                    <button class="user-action-btn" onclick="authUI.showUserManagement()" data-permission="users.create" data-permission-action="hide">
                        👥 إدارة المستخدمين
                    </button>
                    <button class="user-action-btn" onclick="authUI.lockSession()">
                        🔒 قفل الجلسة
                    </button>
                    <button class="user-action-btn logout" onclick="authUI.logout()">
                        🚪 تسجيل خروج
                    </button>
                </div>
                
                <div class="session-info">
                    <div style="font-size: 12px; color: #6b7280;">
                        <div>آخر نشاط: <span id="last-activity"></span></div>
                        <div>مدة الجلسة: <span id="session-duration"></span></div>
                    </div>
                </div>
            </div>
        `;

        header.insertAdjacentHTML('beforeend', userMenuHTML);
    }

    /**
     * Setup login form event handlers
     */
    setupLoginForm() {
        const form = document.getElementById('login-form');
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const roleSelect = document.getElementById('login-role');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Auto-select role based on username
        usernameInput.addEventListener('input', (e) => {
            const username = e.target.value.toLowerCase();
            if (username === 'admin') {
                roleSelect.value = 'admin';
            } else if (username === 'cashier') {
                roleSelect.value = 'cashier';
            } else if (username === 'manager') {
                roleSelect.value = 'manager';
            } else if (username === 'accountant') {
                roleSelect.value = 'accountant';
            }
        });

        // Enter key handling
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                form.dispatchEvent(new Event('submit'));
            }
        });
    }

    /**
     * Setup lock form event handlers
     */
    setupLockForm() {
        const form = document.getElementById('unlock-form');
        const passwordInput = document.getElementById('unlock-password');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleUnlock();
        });

        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                form.dispatchEvent(new Event('submit'));
            }
        });
    }

    /**
     * Handle login form submission
     */
    async handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        const submitBtn = document.querySelector('#login-form button[type="submit"]');
        const buttonText = submitBtn.querySelector('.button-text');
        const buttonLoading = submitBtn.querySelector('.button-loading');

        // Clear previous errors
        this.hideError('login-error');

        // Validate inputs
        if (!username || !password) {
            this.showError('login-error', 'يرجى إدخال اسم المستخدم وكلمة المرور');
            return;
        }

        // Show loading state
        buttonText.style.display = 'none';
        buttonLoading.style.display = 'inline';
        submitBtn.disabled = true;

        try {
            // Attempt authentication
            const user = await this.security.authenticate(username, password);
            
            // Log security event
            this.security.logSecurityEvent('login_success', {
                username: username,
                role: user.role
            });

            // Hide login screen and show main app
            this.hideLoginScreen();
            this.updateUserMenu(user);
            
            // Show success message
            this.showNotification('تم تسجيل الدخول بنجاح', 'success');
            
            // Clear form
            document.getElementById('login-form').reset();

        } catch (error) {
            // Log security event
            this.security.logSecurityEvent('login_failed', {
                username: username,
                error: error.message
            });

            this.showError('login-error', error.message);
        } finally {
            // Reset button state
            buttonText.style.display = 'inline';
            buttonLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    /**
     * Handle unlock form submission
     */
    async handleUnlock() {
        const password = document.getElementById('unlock-password').value;
        const submitBtn = document.querySelector('#unlock-form button[type="submit"]');
        const buttonText = submitBtn.querySelector('.button-text');
        const buttonLoading = submitBtn.querySelector('.button-loading');

        // Clear previous errors
        this.hideError('unlock-error');

        if (!password) {
            this.showError('unlock-error', 'يرجى إدخال كلمة المرور');
            return;
        }

        // Show loading state
        buttonText.style.display = 'none';
        buttonLoading.style.display = 'inline';
        submitBtn.disabled = true;

        try {
            await this.security.unlockSession(password);
            
            // Log security event
            this.security.logSecurityEvent('session_unlocked');

            this.hideLockScreen();
            this.showNotification('تم إلغاء قفل الجلسة', 'success');
            
            // Clear form
            document.getElementById('unlock-form').reset();

        } catch (error) {
            // Log security event
            this.security.logSecurityEvent('unlock_failed', {
                error: error.message
            });

            this.showError('unlock-error', error.message);
        } finally {
            // Reset button state
            buttonText.style.display = 'inline';
            buttonLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    /**
     * Show login screen
     */
    showLoginScreen() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('login-username').focus();
        this.isLoginScreenVisible = true;
        
        // Hide main app
        const mainApp = document.querySelector('.app-container') || document.querySelector('main');
        if (mainApp) {
            mainApp.style.display = 'none';
        }
    }

    /**
     * Hide login screen
     */
    hideLoginScreen() {
        document.getElementById('login-screen').style.display = 'none';
        this.isLoginScreenVisible = false;
        
        // Show main app
        const mainApp = document.querySelector('.app-container') || document.querySelector('main');
        if (mainApp) {
            mainApp.style.display = 'block';
        }
    }

    /**
     * Show lock screen
     */
    showLockScreen() {
        const lockScreen = document.getElementById('lock-screen');
        const userInfo = document.getElementById('lock-user-info');
        const lockTime = document.getElementById('lock-time');
        
        // Update user info
        if (this.security.currentUser) {
            userInfo.innerHTML = `
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 48px; margin-bottom: 8px;">👤</div>
                    <div style="font-weight: 600; color: #1e3a8a;">${this.security.currentUser.fullName}</div>
                    <div style="color: #6b7280; font-size: 14px;">${this.getRoleDisplayName(this.security.currentUser.role)}</div>
                </div>
            `;
        }
        
        // Update lock time
        lockTime.textContent = `تم القفل في ${new Date().toLocaleTimeString('ar-EG')}`;
        
        lockScreen.style.display = 'flex';
        document.getElementById('unlock-password').focus();
        this.isLockScreenVisible = true;
        
        // Hide main app
        const mainApp = document.querySelector('.app-container') || document.querySelector('main');
        if (mainApp) {
            mainApp.style.display = 'none';
        }
    }

    /**
     * Hide lock screen
     */
    hideLockScreen() {
        document.getElementById('lock-screen').style.display = 'none';
        this.isLockScreenVisible = false;
        
        // Show main app
        const mainApp = document.querySelector('.app-container') || document.querySelector('main');
        if (mainApp) {
            mainApp.style.display = 'block';
        }
    }

    /**
     * Update user menu with current user info
     */
    updateUserMenu(user) {
        const userMenu = document.getElementById('user-menu');
        const userMenuToggle = document.getElementById('user-menu-toggle');
        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');
        const currentUserName = document.getElementById('current-user-name');
        const lastActivity = document.getElementById('last-activity');
        
        if (user) {
            userName.textContent = user.fullName;
            userRole.textContent = this.getRoleDisplayName(user.role);
            currentUserName.textContent = user.fullName;
            if (lastActivity) lastActivity.textContent = new Date().toLocaleTimeString('ar-EG');
            
            userMenuToggle.style.display = 'flex';
            
            // Update session duration periodically
            this.updateSessionDuration();
            setInterval(() => this.updateSessionDuration(), 60000); // Update every minute
        } else {
            userMenuToggle.style.display = 'none';
            userMenu.classList.add('hidden');
        }
    }

    /**
     * Toggle user menu visibility
     */
    toggleUserMenu() {
        const userMenu = document.getElementById('user-menu');
        if (userMenu.classList.contains('hidden')) {
            this.showUserMenu();
        } else {
            this.hideUserMenu();
        }
    }

    /**
     * Show user menu
     */
    showUserMenu() {
        const userMenu = document.getElementById('user-menu');
        const overlay = document.getElementById('user-menu-overlay');
        
        userMenu.classList.remove('hidden');
        if (overlay) overlay.classList.add('show');
        
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick.bind(this), { once: true });
        }, 100);
    }

    /**
     * Hide user menu
     */
    hideUserMenu() {
        const userMenu = document.getElementById('user-menu');
        const overlay = document.getElementById('user-menu-overlay');
        
        userMenu.classList.add('hidden');
        if (overlay) overlay.classList.remove('show');
    }

    /**
     * Handle clicks outside the user menu
     */
    handleOutsideClick(event) {
        const userMenu = document.getElementById('user-menu');
        const userMenuToggle = document.getElementById('user-menu-toggle');
        
        if (!userMenu.contains(event.target) && !userMenuToggle.contains(event.target)) {
            this.hideUserMenu();
        }
    }

    /**
     * Update session duration display
     */
    updateSessionDuration() {
        const sessionDuration = document.getElementById('session-duration');
        const session = this.security.getCurrentSession();
        
        if (session && sessionDuration) {
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const duration = Math.floor((now - loginTime) / 1000 / 60); // minutes
            
            if (duration < 60) {
                sessionDuration.textContent = `${duration} دقيقة`;
            } else {
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                sessionDuration.textContent = `${hours} ساعة ${minutes} دقيقة`;
            }
        }
    }

    /**
     * Get display name for role
     */
    getRoleDisplayName(role) {
        const roleNames = {
            admin: 'مدير النظام',
            manager: 'مدير',
            accountant: 'محاسب',
            cashier: 'أمين صندوق'
        };
        return roleNames[role] || role;
    }

    /**
     * Toggle password visibility
     */
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const button = input.nextElementSibling;
        
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
        } else {
            input.type = 'password';
            button.textContent = '👁️';
        }
    }

    /**
     * Lock current session
     */
    lockSession() {
        this.security.lockSession();
        this.showLockScreen();
    }

    /**
     * Logout current user
     */
    logout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            // Log security event
            this.security.logSecurityEvent('logout');
            
            this.security.logout();
            this.updateUserMenu(null);
            this.showLoginScreen();
            this.showNotification('تم تسجيل الخروج بنجاح', 'info');
        }
    }

    /**
     * Logout from lock screen
     */
    logoutFromLock() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            // Log security event
            this.security.logSecurityEvent('logout_from_lock');
            
            this.security.logout();
            this.hideLockScreen();
            this.updateUserMenu(null);
            this.showLoginScreen();
        }
    }

    /**
     * Show change password dialog
     */
    showChangePassword() {
        // Implementation for change password dialog
        alert('ميزة تغيير كلمة المرور ستكون متاحة قريباً');
    }

    /**
     * Show user profile dialog
     */
    showUserProfile() {
        // Implementation for user profile dialog
        alert('ميزة الملف الشخصي ستكون متاحة قريباً');
    }

    /**
     * Show user management interface
     */
    showUserManagement() {
        if (!this.security.hasPermission('users.create')) {
            this.showNotification('ليس لديك صلاحية لإدارة المستخدمين', 'error');
            return;
        }
        
        this.hideUserMenu();
        
        try {
            const userManagementHTML = window.userManager.createUserManagementUI();
            document.getElementById('main-content').innerHTML = `
                <div class="content-card">
                    <h2 style="font-size: 28px; font-weight: bold; color: #1e3a8a; margin-bottom: 8px;">إدارة المستخدمين</h2>
                    <p style="color: #2563eb; margin-bottom: 32px;">User Management</p>
                    ${userManagementHTML}
                </div>
            `;
            
            // Update navigation
            setActiveButton(-1); // No specific button for user management
            
        } catch (error) {
            this.showNotification(`خطأ في تحميل إدارة المستخدمين: ${error.message}`, 'error');
        }
    }

    /**
     * Show error message
     */
    showError(elementId, message) {
        const errorDiv = document.getElementById(elementId);
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.animation = 'shake 0.5s ease-in-out';
    }

    /**
     * Hide error message
     */
    hideError(elementId) {
        const errorDiv = document.getElementById(elementId);
        errorDiv.style.display = 'none';
        errorDiv.style.animation = '';
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }

        // Set notification content and type
        notification.textContent = message;
        notification.className = `notification ${type} show`;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.security.currentUser && !this.security.isLocked;
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(action) {
        return this.security.hasPermission(action);
    }
}

// Export for global use
window.AuthUI = AuthUI;
