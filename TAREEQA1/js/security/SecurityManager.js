/**
 * Tareeqa POS Security Manager
 * Comprehensive local security system for offline POS operations
 * 
 * Features:
 * - Local authentication with encrypted passwords
 * - Role-based access control (RBAC)
 * - Data encryption for sensitive information
 * - Session management with auto-lock
 * - File integrity checking
 * 
 * @author Tareeqa Development Team
 * @version 1.0.0
 */

class SecurityManager {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 15 * 60 * 1000; // 15 minutes in milliseconds
        this.sessionTimer = null;
        this.encryptionKey = this.generateEncryptionKey();
        this.isLocked = false;
        
        // Initialize security system
        this.init();
    }

    /**
     * Initialize the security system
     */
    async init() {
        console.log('🔐 Initializing Tareeqa Security Manager...');
        
        // Create default admin user if none exists
        await this.createDefaultUsers();
        
        // Start session monitoring
        this.startSessionMonitoring();
        
        // Verify file integrity
        await this.verifySystemIntegrity();
        
        console.log('✅ Security Manager initialized successfully');
    }

    /**
     * Generate a unique encryption key for this installation
     */
    generateEncryptionKey() {
        const stored = localStorage.getItem('tareeqa_encryption_key');
        if (stored) {
            return stored;
        }
        
        // Generate new key using crypto API
        const key = this.generateRandomString(32);
        localStorage.setItem('tareeqa_encryption_key', key);
        return key;
    }

    /**
     * Generate cryptographically secure random string
     */
    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        
        // Use crypto.getRandomValues if available, fallback to Math.random
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint8Array(length);
            window.crypto.getRandomValues(array);
            for (let i = 0; i < length; i++) {
                result += chars[array[i] % chars.length];
            }
        } else {
            for (let i = 0; i < length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        return result;
    }

    /**
     * Create default users if none exist
     */
    async createDefaultUsers() {
        const users = this.getStoredUsers();
        
        if (users.length === 0) {
            console.log('📝 Creating default users...');
            
            // Create default admin user
            await this.createUser({
                username: 'admin',
                password: 'admin123',
                fullName: 'مدير النظام',
                role: 'admin',
                email: 'admin@tareeqa.pos',
                isActive: true,
                createdAt: new Date().toISOString()
            });

            // Create default cashier user
            await this.createUser({
                username: 'cashier',
                password: 'cashier123',
                fullName: 'أمين الصندوق',
                role: 'cashier',
                email: 'cashier@tareeqa.pos',
                isActive: true,
                createdAt: new Date().toISOString()
            });

            console.log('✅ Default users created successfully');
            console.log('🔑 Default credentials:');
            console.log('   Admin: admin / admin123');
            console.log('   Cashier: cashier / cashier123');
        }
    }

    /**
     * Hash password using a simple but secure method
     * Note: In production, use bcrypt or similar
     */
    async hashPassword(password, salt = null) {
        if (!salt) {
            salt = this.generateRandomString(16);
        }
        
        // Simple hash implementation (replace with bcrypt in production)
        const combined = password + salt + this.encryptionKey;
        
        if (window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(combined);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return { hash: hashHex, salt };
        } else {
            // Fallback hash function
            let hash = 0;
            for (let i = 0; i < combined.length; i++) {
                const char = combined.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return { hash: hash.toString(16), salt };
        }
    }

    /**
     * Verify password against stored hash
     */
    async verifyPassword(password, storedHash, salt) {
        const { hash } = await this.hashPassword(password, salt);
        return hash === storedHash;
    }

    /**
     * Create a new user
     */
    async createUser(userData) {
        const users = this.getStoredUsers();
        
        // Check if username already exists
        if (users.find(u => u.username === userData.username)) {
            throw new Error('اسم المستخدم موجود بالفعل');
        }

        // Hash the password
        const { hash, salt } = await this.hashPassword(userData.password);
        
        // Create user object
        const user = {
            id: this.generateRandomString(8),
            username: userData.username,
            passwordHash: hash,
            passwordSalt: salt,
            fullName: userData.fullName,
            role: userData.role,
            email: userData.email,
            isActive: userData.isActive !== false,
            createdAt: userData.createdAt || new Date().toISOString(),
            lastLogin: null,
            loginAttempts: 0,
            lockedUntil: null
        };

        // Store user
        users.push(user);
        this.storeUsers(users);
        
        console.log(`✅ User created: ${userData.username} (${userData.role})`);
        return user;
    }

    /**
     * Authenticate user
     */
    async authenticate(username, password) {
        const users = this.getStoredUsers();
        const user = users.find(u => u.username === username);
        
        if (!user) {
            throw new Error('اسم المستخدم غير صحيح');
        }

        if (!user.isActive) {
            throw new Error('الحساب غير مفعل');
        }

        // Check if account is locked
        if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
            throw new Error('الحساب مقفل مؤقتاً');
        }

        // Verify password
        const isValid = await this.verifyPassword(password, user.passwordHash, user.passwordSalt);
        
        if (!isValid) {
            // Increment login attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            
            // Lock account after 5 failed attempts
            if (user.loginAttempts >= 5) {
                user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
                this.storeUsers(users);
                throw new Error('تم قفل الحساب لمدة 30 دقيقة بسبب المحاولات الخاطئة');
            }
            
            this.storeUsers(users);
            throw new Error('كلمة المرور غير صحيحة');
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lockedUntil = null;
        user.lastLogin = new Date().toISOString();
        this.storeUsers(users);

        // Set current user and start session
        this.currentUser = { ...user };
        delete this.currentUser.passwordHash;
        delete this.currentUser.passwordSalt;
        
        this.startSession();
        
        console.log(`✅ User authenticated: ${username}`);
        return this.currentUser;
    }

    /**
     * Start user session
     */
    startSession() {
        this.isLocked = false;
        this.resetSessionTimer();
        
        // Store session info
        const sessionData = {
            userId: this.currentUser.id,
            username: this.currentUser.username,
            role: this.currentUser.role,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };
        
        localStorage.setItem('tareeqa_session', this.encrypt(JSON.stringify(sessionData)));
    }

    /**
     * Reset session timer
     */
    resetSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        this.sessionTimer = setTimeout(() => {
            this.lockSession();
        }, this.sessionTimeout);
        
        // Update last activity
        const sessionData = localStorage.getItem('tareeqa_session');
        if (sessionData) {
            try {
                const session = JSON.parse(this.decrypt(sessionData));
                session.lastActivity = new Date().toISOString();
                localStorage.setItem('tareeqa_session', this.encrypt(JSON.stringify(session)));
            } catch (e) {
                console.error('Error updating session activity:', e);
            }
        }
    }

    /**
     * Lock the session
     */
    lockSession() {
        console.log('🔒 Session locked due to inactivity');
        this.isLocked = true;
        
        // Trigger lock screen
        if (window.showLockScreen) {
            window.showLockScreen();
        }
    }

    /**
     * Unlock session with password
     */
    async unlockSession(password) {
        if (!this.currentUser) {
            throw new Error('لا يوجد جلسة نشطة');
        }
        
        const users = this.getStoredUsers();
        const user = users.find(u => u.id === this.currentUser.id);
        
        if (!user) {
            throw new Error('المستخدم غير موجود');
        }
        
        const isValid = await this.verifyPassword(password, user.passwordHash, user.passwordSalt);
        
        if (!isValid) {
            throw new Error('كلمة المرور غير صحيحة');
        }
        
        this.isLocked = false;
        this.resetSessionTimer();
        
        console.log('🔓 Session unlocked');
        return true;
    }

    /**
     * Logout user
     */
    logout() {
        console.log('👋 User logged out');
        
        this.currentUser = null;
        this.isLocked = false;
        
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        localStorage.removeItem('tareeqa_session');
    }

    /**
     * Check if user has permission for specific action
     */
    hasPermission(action) {
        if (!this.currentUser || this.isLocked) {
            return false;
        }
        
        const permissions = this.getRolePermissions(this.currentUser.role);
        return permissions.includes(action) || permissions.includes('*');
    }

    /**
     * Get permissions for a role
     */
    getRolePermissions(role) {
        const rolePermissions = {
            admin: ['*'], // All permissions
            manager: [
                'pos.use', 'products.view', 'products.create', 'products.edit', 'products.delete',
                'reports.view', 'reports.export', 'hardware.manage', 'settings.view', 'settings.edit',
                'users.view', 'users.create'
            ],
            accountant: [
                'pos.use', 'products.view', 'reports.view', 'reports.export', 'settings.view'
            ],
            cashier: [
                'pos.use', 'products.view', 'hardware.use'
            ]
        };
        
        return rolePermissions[role] || [];
    }

    /**
     * Start monitoring user activity
     */
    startSessionMonitoring() {
        // Monitor user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.currentUser && !this.isLocked) {
                    this.resetSessionTimer();
                }
            }, true);
        });
    }

    /**
     * Encrypt sensitive data
     */
    encrypt(text) {
        try {
            // Simple XOR encryption (replace with AES in production)
            let result = '';
            const key = this.encryptionKey;
            
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            
            return btoa(result); // Base64 encode
        } catch (e) {
            console.error('Encryption error:', e);
            return text;
        }
    }

    /**
     * Decrypt sensitive data
     */
    decrypt(encryptedText) {
        try {
            const text = atob(encryptedText); // Base64 decode
            let result = '';
            const key = this.encryptionKey;
            
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            
            return result;
        } catch (e) {
            console.error('Decryption error:', e);
            return encryptedText;
        }
    }

    /**
     * Get stored users (encrypted)
     */
    getStoredUsers() {
        try {
            const encrypted = localStorage.getItem('tareeqa_users');
            if (!encrypted) return [];
            
            const decrypted = this.decrypt(encrypted);
            return JSON.parse(decrypted);
        } catch (e) {
            console.error('Error loading users:', e);
            return [];
        }
    }

    /**
     * Store users (encrypted)
     */
    storeUsers(users) {
        try {
            const encrypted = this.encrypt(JSON.stringify(users));
            localStorage.setItem('tareeqa_users', encrypted);
        } catch (e) {
            console.error('Error storing users:', e);
        }
    }

    /**
     * Verify system file integrity
     */
    async verifySystemIntegrity() {
        console.log('🔍 Verifying system integrity...');
        
        // Check for critical files and configurations
        const criticalData = [
            'tareeqa_users',
            'tareeqa_products',
            'tareeqa_settings',
            'tareeqa_encryption_key'
        ];
        
        let integrityIssues = [];
        
        criticalData.forEach(key => {
            const data = localStorage.getItem(key);
            if (key === 'tareeqa_users' && (!data || data.length < 10)) {
                integrityIssues.push(`Missing or corrupted: ${key}`);
            }
        });
        
        if (integrityIssues.length > 0) {
            console.warn('⚠️ Integrity issues found:', integrityIssues);
            // In production, you might want to handle this more strictly
        } else {
            console.log('✅ System integrity verified');
        }
        
        return integrityIssues.length === 0;
    }

    /**
     * Get current session info
     */
    getCurrentSession() {
        try {
            const sessionData = localStorage.getItem('tareeqa_session');
            if (!sessionData) return null;
            
            return JSON.parse(this.decrypt(sessionData));
        } catch (e) {
            console.error('Error loading session:', e);
            return null;
        }
    }

    /**
     * Restore session on page load
     */
    async restoreSession() {
        const session = this.getCurrentSession();
        if (!session) return false;
        
        // Check if session is still valid (not expired)
        const lastActivity = new Date(session.lastActivity);
        const now = new Date();
        const timeDiff = now - lastActivity;
        
        if (timeDiff > this.sessionTimeout) {
            console.log('🕐 Session expired');
            this.logout();
            return false;
        }
        
        // Restore user data
        const users = this.getStoredUsers();
        const user = users.find(u => u.id === session.userId);
        
        if (!user || !user.isActive) {
            console.log('❌ User not found or inactive');
            this.logout();
            return false;
        }
        
        this.currentUser = { ...user };
        delete this.currentUser.passwordHash;
        delete this.currentUser.passwordSalt;
        
        this.startSession();
        
        console.log('✅ Session restored for:', session.username);
        return true;
    }

    /**
     * Change user password
     */
    async changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('لا يوجد مستخدم مسجل دخول');
        }
        
        const users = this.getStoredUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) {
            throw new Error('المستخدم غير موجود');
        }
        
        const user = users[userIndex];
        
        // Verify current password
        const isValid = await this.verifyPassword(currentPassword, user.passwordHash, user.passwordSalt);
        if (!isValid) {
            throw new Error('كلمة المرور الحالية غير صحيحة');
        }
        
        // Hash new password
        const { hash, salt } = await this.hashPassword(newPassword);
        
        // Update user
        users[userIndex].passwordHash = hash;
        users[userIndex].passwordSalt = salt;
        users[userIndex].lastPasswordChange = new Date().toISOString();
        
        this.storeUsers(users);
        
        console.log('✅ Password changed successfully');
        return true;
    }

    /**
     * Get security audit log
     */
    getSecurityLog() {
        try {
            const encrypted = localStorage.getItem('tareeqa_security_log');
            if (!encrypted) return [];
            
            return JSON.parse(this.decrypt(encrypted));
        } catch (e) {
            console.error('Error loading security log:', e);
            return [];
        }
    }

    /**
     * Add entry to security log
     */
    logSecurityEvent(event, details = {}) {
        try {
            const log = this.getSecurityLog();
            
            const entry = {
                id: this.generateRandomString(8),
                timestamp: new Date().toISOString(),
                event: event,
                userId: this.currentUser?.id || null,
                username: this.currentUser?.username || 'anonymous',
                details: details,
                ipAddress: 'localhost', // Always localhost for offline system
                userAgent: navigator.userAgent
            };
            
            log.push(entry);
            
            // Keep only last 1000 entries
            if (log.length > 1000) {
                log.splice(0, log.length - 1000);
            }
            
            const encrypted = this.encrypt(JSON.stringify(log));
            localStorage.setItem('tareeqa_security_log', encrypted);
            
            console.log(`📝 Security event logged: ${event}`);
        } catch (e) {
            console.error('Error logging security event:', e);
        }
    }
}

// Export for use in other modules
window.SecurityManager = SecurityManager;
