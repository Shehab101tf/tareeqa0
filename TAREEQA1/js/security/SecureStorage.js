/**
 * Tareeqa POS Secure Storage Manager
 * Handles encrypted local storage for sensitive data
 * 
 * @author Tareeqa Development Team
 * @version 1.0.0
 */

class SecureStorage {
    constructor(securityManager) {
        this.security = securityManager;
        this.encryptionKey = this.security.encryptionKey;
        this.storagePrefix = 'tareeqa_secure_';
        this.compressionEnabled = true;
        
        this.init();
    }

    /**
     * Initialize secure storage
     */
    init() {
        console.log('🔐 Initializing Secure Storage Manager...');
        
        // Migrate existing unencrypted data
        this.migrateExistingData();
        
        // Set up storage event listeners
        this.setupStorageListeners();
        
        console.log('✅ Secure Storage Manager initialized');
    }

    /**
     * Encrypt data using AES-like algorithm (simplified for demo)
     */
    encrypt(data, customKey = null) {
        try {
            const key = customKey || this.encryptionKey;
            const jsonString = JSON.stringify(data);
            
            // Add timestamp and checksum for integrity
            const payload = {
                data: jsonString,
                timestamp: Date.now(),
                checksum: this.calculateChecksum(jsonString),
                version: '1.0'
            };
            
            const payloadString = JSON.stringify(payload);
            
            // Compress if enabled
            const dataToEncrypt = this.compressionEnabled ? 
                this.compress(payloadString) : payloadString;
            
            // Simple XOR encryption with key rotation
            let encrypted = '';
            const keyLength = key.length;
            
            for (let i = 0; i < dataToEncrypt.length; i++) {
                const keyChar = key[i % keyLength];
                const dataChar = dataToEncrypt[i];
                const rotatedKey = key[(i + Math.floor(i / keyLength)) % keyLength];
                
                encrypted += String.fromCharCode(
                    dataChar.charCodeAt(0) ^ keyChar.charCodeAt(0) ^ rotatedKey.charCodeAt(0)
                );
            }
            
            // Base64 encode and add header
            const base64Encrypted = btoa(encrypted);
            return `TAREEQA_ENCRYPTED_V1:${base64Encrypted}`;
            
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('فشل في تشفير البيانات');
        }
    }

    /**
     * Decrypt data
     */
    decrypt(encryptedData, customKey = null) {
        try {
            const key = customKey || this.encryptionKey;
            
            // Check if data is encrypted
            if (!encryptedData.startsWith('TAREEQA_ENCRYPTED_V1:')) {
                // Try to parse as unencrypted data (for migration)
                return JSON.parse(encryptedData);
            }
            
            // Remove header and decode
            const base64Data = encryptedData.replace('TAREEQA_ENCRYPTED_V1:', '');
            const encrypted = atob(base64Data);
            
            // Decrypt using same XOR algorithm
            let decrypted = '';
            const keyLength = key.length;
            
            for (let i = 0; i < encrypted.length; i++) {
                const keyChar = key[i % keyLength];
                const encryptedChar = encrypted[i];
                const rotatedKey = key[(i + Math.floor(i / keyLength)) % keyLength];
                
                decrypted += String.fromCharCode(
                    encryptedChar.charCodeAt(0) ^ keyChar.charCodeAt(0) ^ rotatedKey.charCodeAt(0)
                );
            }
            
            // Decompress if needed
            const payloadString = this.compressionEnabled ? 
                this.decompress(decrypted) : decrypted;
            
            const payload = JSON.parse(payloadString);
            
            // Verify integrity
            if (!this.verifyChecksum(payload.data, payload.checksum)) {
                throw new Error('Data integrity check failed');
            }
            
            return JSON.parse(payload.data);
            
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('فشل في فك تشفير البيانات');
        }
    }

    /**
     * Calculate checksum for data integrity
     */
    calculateChecksum(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    /**
     * Verify data integrity using checksum
     */
    verifyChecksum(data, expectedChecksum) {
        const actualChecksum = this.calculateChecksum(data);
        return actualChecksum === expectedChecksum;
    }

    /**
     * Simple compression using run-length encoding
     */
    compress(data) {
        if (data.length < 100) return data; // Don't compress small data
        
        let compressed = '';
        let count = 1;
        let current = data[0];
        
        for (let i = 1; i < data.length; i++) {
            if (data[i] === current && count < 255) {
                count++;
            } else {
                if (count > 3) {
                    compressed += `~${count}${current}`;
                } else {
                    compressed += current.repeat(count);
                }
                current = data[i];
                count = 1;
            }
        }
        
        // Handle last sequence
        if (count > 3) {
            compressed += `~${count}${current}`;
        } else {
            compressed += current.repeat(count);
        }
        
        return compressed.length < data.length ? compressed : data;
    }

    /**
     * Decompress run-length encoded data
     */
    decompress(data) {
        if (!data.includes('~')) return data; // Not compressed
        
        let decompressed = '';
        let i = 0;
        
        while (i < data.length) {
            if (data[i] === '~') {
                // Extract count and character
                let countStr = '';
                i++; // Skip ~
                
                while (i < data.length && /\d/.test(data[i])) {
                    countStr += data[i];
                    i++;
                }
                
                const count = parseInt(countStr);
                const char = data[i];
                decompressed += char.repeat(count);
                i++;
            } else {
                decompressed += data[i];
                i++;
            }
        }
        
        return decompressed;
    }

    /**
     * Store encrypted data
     */
    setSecure(key, data, options = {}) {
        try {
            const fullKey = this.storagePrefix + key;
            const encryptedData = this.encrypt(data, options.customKey);
            
            localStorage.setItem(fullKey, encryptedData);
            
            // Log storage event
            this.security.logSecurityEvent('secure_data_stored', {
                key: key,
                dataSize: JSON.stringify(data).length,
                encrypted: true
            });
            
            return true;
        } catch (error) {
            console.error('Secure storage error:', error);
            this.security.logSecurityEvent('secure_storage_error', {
                key: key,
                error: error.message
            });
            return false;
        }
    }

    /**
     * Retrieve and decrypt data
     */
    getSecure(key, options = {}) {
        try {
            const fullKey = this.storagePrefix + key;
            const encryptedData = localStorage.getItem(fullKey);
            
            if (!encryptedData) {
                return options.defaultValue || null;
            }
            
            const decryptedData = this.decrypt(encryptedData, options.customKey);
            
            // Log access event
            this.security.logSecurityEvent('secure_data_accessed', {
                key: key,
                success: true
            });
            
            return decryptedData;
        } catch (error) {
            console.error('Secure retrieval error:', error);
            this.security.logSecurityEvent('secure_data_access_failed', {
                key: key,
                error: error.message
            });
            return options.defaultValue || null;
        }
    }

    /**
     * Remove encrypted data
     */
    removeSecure(key) {
        try {
            const fullKey = this.storagePrefix + key;
            localStorage.removeItem(fullKey);
            
            this.security.logSecurityEvent('secure_data_removed', {
                key: key
            });
            
            return true;
        } catch (error) {
            console.error('Secure removal error:', error);
            return false;
        }
    }

    /**
     * Check if secure key exists
     */
    hasSecure(key) {
        const fullKey = this.storagePrefix + key;
        return localStorage.getItem(fullKey) !== null;
    }

    /**
     * Get all secure storage keys
     */
    getSecureKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.storagePrefix)) {
                keys.push(key.replace(this.storagePrefix, ''));
            }
        }
        return keys;
    }

    /**
     * Migrate existing unencrypted data to encrypted storage
     */
    migrateExistingData() {
        console.log('🔄 Migrating existing data to encrypted storage...');
        
        const keysToMigrate = [
            'tareeqa_products',
            'tareeqa_settings',
            'tareeqa_customers',
            'tareeqa_transactions',
            'tareeqa_inventory'
        ];
        
        let migratedCount = 0;
        
        keysToMigrate.forEach(oldKey => {
            const data = localStorage.getItem(oldKey);
            if (data && !data.startsWith('TAREEQA_ENCRYPTED_V1:')) {
                try {
                    const parsedData = JSON.parse(data);
                    const newKey = oldKey.replace('tareeqa_', '');
                    
                    if (this.setSecure(newKey, parsedData)) {
                        localStorage.removeItem(oldKey); // Remove old unencrypted data
                        migratedCount++;
                        console.log(`✅ Migrated: ${oldKey} -> ${newKey}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to migrate ${oldKey}:`, error);
                }
            }
        });
        
        if (migratedCount > 0) {
            console.log(`✅ Migrated ${migratedCount} data items to encrypted storage`);
            this.security.logSecurityEvent('data_migration_completed', {
                migratedItems: migratedCount
            });
        }
    }

    /**
     * Setup storage event listeners
     */
    setupStorageListeners() {
        // Listen for storage events (from other tabs/windows)
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith(this.storagePrefix)) {
                const key = e.key.replace(this.storagePrefix, '');
                
                this.security.logSecurityEvent('external_storage_change', {
                    key: key,
                    oldValue: e.oldValue ? 'exists' : 'null',
                    newValue: e.newValue ? 'exists' : 'null'
                });
                
                // Trigger custom event for application to handle
                window.dispatchEvent(new CustomEvent('secureStorageChange', {
                    detail: { key, oldValue: e.oldValue, newValue: e.newValue }
                }));
            }
        });
    }

    /**
     * Backup all secure data
     */
    createBackup(password = null) {
        try {
            const backupData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: {}
            };
            
            const keys = this.getSecureKeys();
            
            keys.forEach(key => {
                const data = this.getSecure(key);
                if (data !== null) {
                    backupData.data[key] = data;
                }
            });
            
            // Encrypt backup with password if provided
            const backupString = JSON.stringify(backupData);
            const finalBackup = password ? 
                this.encrypt(backupString, password) : backupString;
            
            this.security.logSecurityEvent('backup_created', {
                itemCount: keys.length,
                encrypted: !!password
            });
            
            return finalBackup;
        } catch (error) {
            console.error('Backup creation error:', error);
            this.security.logSecurityEvent('backup_creation_failed', {
                error: error.message
            });
            throw new Error('فشل في إنشاء النسخة الاحتياطية');
        }
    }

    /**
     * Restore data from backup
     */
    restoreBackup(backupData, password = null, options = {}) {
        try {
            let parsedBackup;
            
            // Decrypt if password provided
            if (password) {
                const decryptedString = this.decrypt(backupData, password);
                parsedBackup = typeof decryptedString === 'string' ? 
                    JSON.parse(decryptedString) : decryptedString;
            } else {
                parsedBackup = JSON.parse(backupData);
            }
            
            if (!parsedBackup.data) {
                throw new Error('Invalid backup format');
            }
            
            let restoredCount = 0;
            const errors = [];
            
            Object.keys(parsedBackup.data).forEach(key => {
                try {
                    if (options.overwrite || !this.hasSecure(key)) {
                        this.setSecure(key, parsedBackup.data[key]);
                        restoredCount++;
                    }
                } catch (error) {
                    errors.push({ key, error: error.message });
                }
            });
            
            this.security.logSecurityEvent('backup_restored', {
                itemCount: restoredCount,
                errors: errors.length,
                backupTimestamp: parsedBackup.timestamp
            });
            
            return {
                success: true,
                restoredCount,
                errors,
                backupInfo: {
                    version: parsedBackup.version,
                    timestamp: parsedBackup.timestamp
                }
            };
            
        } catch (error) {
            console.error('Backup restoration error:', error);
            this.security.logSecurityEvent('backup_restoration_failed', {
                error: error.message
            });
            throw new Error('فشل في استعادة النسخة الاحتياطية');
        }
    }

    /**
     * Clear all secure storage
     */
    clearAllSecure(confirm = false) {
        if (!confirm) {
            throw new Error('Confirmation required to clear all secure storage');
        }
        
        const keys = this.getSecureKeys();
        let clearedCount = 0;
        
        keys.forEach(key => {
            if (this.removeSecure(key)) {
                clearedCount++;
            }
        });
        
        this.security.logSecurityEvent('secure_storage_cleared', {
            itemCount: clearedCount
        });
        
        return clearedCount;
    }

    /**
     * Get storage statistics
     */
    getStorageStats() {
        const keys = this.getSecureKeys();
        let totalSize = 0;
        const stats = {
            itemCount: keys.length,
            totalSize: 0,
            averageSize: 0,
            largestItem: { key: null, size: 0 },
            categories: {}
        };
        
        keys.forEach(key => {
            const fullKey = this.storagePrefix + key;
            const data = localStorage.getItem(fullKey);
            const size = data ? data.length : 0;
            
            totalSize += size;
            
            if (size > stats.largestItem.size) {
                stats.largestItem = { key, size };
            }
            
            // Categorize by key prefix
            const category = key.split('_')[0] || 'other';
            if (!stats.categories[category]) {
                stats.categories[category] = { count: 0, size: 0 };
            }
            stats.categories[category].count++;
            stats.categories[category].size += size;
        });
        
        stats.totalSize = totalSize;
        stats.averageSize = keys.length > 0 ? Math.round(totalSize / keys.length) : 0;
        
        return stats;
    }

    /**
     * Verify storage integrity
     */
    verifyStorageIntegrity() {
        const keys = this.getSecureKeys();
        const results = {
            total: keys.length,
            valid: 0,
            corrupted: 0,
            errors: []
        };
        
        keys.forEach(key => {
            try {
                const data = this.getSecure(key);
                if (data !== null) {
                    results.valid++;
                } else {
                    results.corrupted++;
                    results.errors.push({ key, error: 'Failed to decrypt' });
                }
            } catch (error) {
                results.corrupted++;
                results.errors.push({ key, error: error.message });
            }
        });
        
        this.security.logSecurityEvent('storage_integrity_check', {
            total: results.total,
            valid: results.valid,
            corrupted: results.corrupted
        });
        
        return results;
    }

    /**
     * Secure data export for specific keys
     */
    exportSecureData(keys, password = null) {
        const exportData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            keys: keys,
            data: {}
        };
        
        keys.forEach(key => {
            const data = this.getSecure(key);
            if (data !== null) {
                exportData.data[key] = data;
            }
        });
        
        const exportString = JSON.stringify(exportData);
        return password ? this.encrypt(exportString, password) : exportString;
    }

    /**
     * Get secure storage usage by category
     */
    getUsageByCategory() {
        const stats = this.getStorageStats();
        const usage = {};
        
        Object.keys(stats.categories).forEach(category => {
            const categoryData = stats.categories[category];
            usage[category] = {
                count: categoryData.count,
                size: categoryData.size,
                percentage: Math.round((categoryData.size / stats.totalSize) * 100)
            };
        });
        
        return usage;
    }
}

// Export for global use
window.SecureStorage = SecureStorage;
