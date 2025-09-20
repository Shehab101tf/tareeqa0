import { createHash, randomBytes, pbkdf2Sync } from 'crypto';
import { app } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

/**
 * Security Service for Tareeqa POS
 * Handles authentication, encryption, and security logging
 */
export class SecurityService {
  private readonly securityPath: string;
  private readonly keyPath: string;
  private encryptionKey: Buffer | null = null;
  private sessionTokens: Map<string, any> = new Map();

  constructor() {
    const userDataPath = app.getPath('userData');
    this.securityPath = join(userDataPath, 'security');
    this.keyPath = join(this.securityPath, 'master.key');
  }

  /**
   * Initialize security service
   */
  async initialize(): Promise<void> {
    console.log('🔐 Initializing security service...');

    try {
      // Ensure security directory exists
      if (!existsSync(this.securityPath)) {
        require('fs').mkdirSync(this.securityPath, { recursive: true });
      }

      // Initialize encryption key
      await this.initializeEncryptionKey();

      // Setup security logging
      this.setupSecurityLogging();

      console.log('✅ Security service initialized');
    } catch (error) {
      console.error('❌ Security initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize or load encryption key
   */
  private async initializeEncryptionKey(): Promise<void> {
    try {
      if (existsSync(this.keyPath)) {
        // Load existing key
        const keyData = readFileSync(this.keyPath);
        this.encryptionKey = Buffer.from(keyData.toString(), 'hex');
        console.log('🔑 Encryption key loaded');
      } else {
        // Generate new key
        this.encryptionKey = randomBytes(32); // 256-bit key
        writeFileSync(this.keyPath, this.encryptionKey.toString('hex'));
        console.log('🔑 New encryption key generated');
      }
    } catch (error) {
      console.error('❌ Encryption key initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup security event logging
   */
  private setupSecurityLogging(): void {
    // Log security events to database and file
    process.on('uncaughtException', (error) => {
      this.logSecurityEvent('system_error', {
        error: error.message,
        stack: error.stack,
        severity: 'critical'
      });
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logSecurityEvent('unhandled_rejection', {
        reason: String(reason),
        promise: String(promise),
        severity: 'error'
      });
    });
  }

  /**
   * Authenticate user credentials
   */
  async authenticate(credentials: { username: string; password: string }): Promise<any> {
    try {
      console.log('🔍 Authenticating user:', credentials.username);

      // Hash the provided password
      const hashedPassword = this.hashPassword(credentials.password);

      // This would typically query the database
      // For now, we'll simulate with a basic check
      const isValid = await this.validateCredentials(credentials.username, hashedPassword);

      if (isValid) {
        // Generate session token
        const sessionToken = this.generateSessionToken(credentials.username);
        
        // Log successful authentication
        this.logSecurityEvent('authentication_success', {
          username: credentials.username,
          sessionToken: sessionToken.substring(0, 8) + '...'
        });

        return {
          success: true,
          sessionToken,
          user: {
            username: credentials.username,
            role: 'admin', // This would come from database
            permissions: ['*']
          }
        };
      } else {
        // Log failed authentication
        this.logSecurityEvent('authentication_failed', {
          username: credentials.username,
          reason: 'invalid_credentials'
        });

        return {
          success: false,
          error: 'Invalid credentials'
        };
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      this.logSecurityEvent('authentication_error', {
        username: credentials.username,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate user credentials (placeholder - would use database)
   */
  private async validateCredentials(username: string, hashedPassword: string): Promise<boolean> {
    // This is a placeholder - in real implementation, this would query the database
    const defaultAdminHash = this.hashPassword('admin123');
    return username === 'admin' && hashedPassword === defaultAdminHash;
  }

  /**
   * Hash password using PBKDF2
   */
  hashPassword(password: string, salt?: string): string {
    const actualSalt = salt || randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512');
    return `${actualSalt}:${hash.toString('hex')}`;
  }

  /**
   * Verify password against hash
   */
  verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512');
    return hash === verifyHash.toString('hex');
  }

  /**
   * Generate session token
   */
  generateSessionToken(username: string): string {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    this.sessionTokens.set(token, {
      username,
      createdAt: new Date(),
      expiresAt,
      isActive: true
    });

    return token;
  }

  /**
   * Validate session token
   */
  validateSessionToken(token: string): any {
    const session = this.sessionTokens.get(token);
    
    if (!session) {
      return null;
    }

    if (session.expiresAt < new Date() || !session.isActive) {
      this.sessionTokens.delete(token);
      return null;
    }

    return session;
  }

  /**
   * Revoke session token
   */
  revokeSessionToken(token: string): void {
    const session = this.sessionTokens.get(token);
    if (session) {
      session.isActive = false;
      this.logSecurityEvent('session_revoked', {
        username: session.username,
        token: token.substring(0, 8) + '...'
      });
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    // This would typically query the database
    // For now, return admin permissions
    return ['*']; // All permissions
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const crypto = require('crypto');
    const iv = randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const crypto = require('crypto');
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate secure hash
   */
  generateHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Log security event
   */
  logSecurityEvent(eventType: string, eventData: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      eventData,
      processId: process.pid,
      appVersion: app.getVersion()
    };

    console.log('🔒 Security Event:', logEntry);

    // In a real implementation, this would also write to database
    // and potentially send alerts for critical events
  }

  /**
   * Check file integrity
   */
  checkFileIntegrity(filePath: string, expectedHash?: string): boolean {
    try {
      if (!existsSync(filePath)) {
        return false;
      }

      const fileContent = readFileSync(filePath);
      const fileHash = createHash('sha256').update(fileContent).digest('hex');

      if (expectedHash) {
        return fileHash === expectedHash;
      }

      // Store hash for future verification
      this.logSecurityEvent('file_integrity_check', {
        filePath,
        hash: fileHash
      });

      return true;
    } catch (error) {
      console.error('❌ File integrity check failed:', error);
      return false;
    }
  }

  /**
   * Generate hardware fingerprint
   */
  generateHardwareFingerprint(): string {
    const os = require('os');
    const crypto = require('crypto');

    const fingerprint = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalmem: os.totalmem(),
      hostname: os.hostname(),
      networkInterfaces: Object.keys(os.networkInterfaces())
    };

    const fingerprintString = JSON.stringify(fingerprint);
    return crypto.createHash('sha256').update(fingerprintString).digest('hex');
  }

  /**
   * Validate hardware fingerprint
   */
  validateHardwareFingerprint(storedFingerprint: string): boolean {
    const currentFingerprint = this.generateHardwareFingerprint();
    return currentFingerprint === storedFingerprint;
  }

  /**
   * Get security status
   */
  getSecurityStatus(): any {
    return {
      encryptionEnabled: this.encryptionKey !== null,
      activeSessions: this.sessionTokens.size,
      hardwareFingerprint: this.generateHardwareFingerprint(),
      securityLevel: 'high'
    };
  }

  /**
   * Cleanup security resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up security resources...');

    // Clear session tokens
    this.sessionTokens.clear();

    // Clear encryption key from memory
    if (this.encryptionKey) {
      this.encryptionKey.fill(0);
      this.encryptionKey = null;
    }

    console.log('✅ Security cleanup completed');
  }

  /**
   * Export security audit log
   */
  exportAuditLog(): any[] {
    // This would typically query the database for audit logs
    // For now, return empty array
    return [];
  }

  /**
   * Backup security configuration
   */
  async backupSecurityConfig(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(this.securityPath, `security-backup-${timestamp}.json`);

    const config = {
      timestamp,
      version: app.getVersion(),
      hardwareFingerprint: this.generateHardwareFingerprint(),
      securityLevel: 'high'
    };

    writeFileSync(backupPath, JSON.stringify(config, null, 2));
    console.log(`🔐 Security config backed up to: ${backupPath}`);

    return backupPath;
  }
}
