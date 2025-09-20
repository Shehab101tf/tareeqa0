import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface LicenseInfo {
  licenseKey: string;
  customerName: string;
  companyName: string;
  email: string;
  hardwareFingerprint: string;
  features: string[];
  maxUsers: number;
  expirationDate: string;
  issueDate: string;
  version: string;
  type: 'trial' | 'standard' | 'professional' | 'enterprise';
}

export interface LicenseValidationResult {
  isValid: boolean;
  license?: LicenseInfo;
  error?: string;
  daysRemaining?: number;
}

export class LicenseManager {
  private readonly encryptionKey: string;
  private readonly licensePath: string;
  private currentLicense: LicenseInfo | null = null;

  constructor() {
    // Generate a consistent encryption key based on app data
    this.encryptionKey = crypto.scryptSync('tareeqa-pos-license-key', 'salt', 32).toString('hex');
    this.licensePath = path.join(app.getPath('userData'), 'license.dat');
  }

  /**
   * Initialize the license manager
   */
  async initialize(): Promise<void> {
    try {
      await this.loadLicense();
      console.log('✅ License Manager initialized');
    } catch (error) {
      console.warn('⚠️ License Manager initialized without valid license:', error);
    }
  }

  /**
   * Validate the current license
   */
  async validateLicense(): Promise<LicenseValidationResult> {
    try {
      if (!this.currentLicense) {
        await this.loadLicense();
      }

      if (!this.currentLicense) {
        return {
          isValid: false,
          error: 'No license found'
        };
      }

      // Check expiration
      const expirationDate = new Date(this.currentLicense.expirationDate);
      const now = new Date();
      
      if (expirationDate < now) {
        return {
          isValid: false,
          error: 'License expired',
          license: this.currentLicense
        };
      }

      // Calculate days remaining
      const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        isValid: true,
        license: this.currentLicense,
        daysRemaining
      };
    } catch (error) {
      return {
        isValid: false,
        error: `License validation failed: ${error}`
      };
    }
  }

  /**
   * Install a new license
   */
  async installLicense(licenseKey: string): Promise<boolean> {
    try {
      const license = this.parseLicenseKey(licenseKey);
      
      // Validate license format and signature
      if (!this.validateLicenseSignature(license)) {
        throw new Error('Invalid license signature');
      }

      // Save encrypted license
      await this.saveLicense(license);
      this.currentLicense = license;
      
      console.log('✅ License installed successfully');
      return true;
    } catch (error) {
      console.error('❌ License installation failed:', error);
      return false;
    }
  }

  /**
   * Get current license information
   */
  getCurrentLicense(): LicenseInfo | null {
    return this.currentLicense;
  }

  /**
   * Check if a specific feature is enabled
   */
  isFeatureEnabled(feature: string): boolean {
    if (!this.currentLicense) {
      return false;
    }

    return this.currentLicense.features.includes(feature) || 
           this.currentLicense.features.includes('all');
  }

  /**
   * Get license status summary
   */
  getLicenseStatus(): any {
    if (!this.currentLicense) {
      return {
        status: 'unlicensed',
        type: null,
        daysRemaining: 0,
        features: []
      };
    }

    const expirationDate = new Date(this.currentLicense.expirationDate);
    const now = new Date();
    const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      status: daysRemaining > 0 ? 'active' : 'expired',
      type: this.currentLicense.type,
      daysRemaining: Math.max(0, daysRemaining),
      features: this.currentLicense.features,
      customerName: this.currentLicense.customerName,
      companyName: this.currentLicense.companyName
    };
  }

  /**
   * Generate a trial license
   */
  async generateTrialLicense(customerInfo: any): Promise<string> {
    const trialDays = 30;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + trialDays);

    const license: LicenseInfo = {
      licenseKey: this.generateLicenseKey(),
      customerName: customerInfo.name || 'Trial User',
      companyName: customerInfo.company || 'Trial Company',
      email: customerInfo.email || 'trial@example.com',
      hardwareFingerprint: customerInfo.fingerprint,
      features: ['pos', 'inventory', 'reports'],
      maxUsers: 1,
      expirationDate: expirationDate.toISOString(),
      issueDate: new Date().toISOString(),
      version: '1.0.0',
      type: 'trial'
    };

    await this.saveLicense(license);
    this.currentLicense = license;

    return license.licenseKey;
  }

  /**
   * Load license from disk
   */
  private async loadLicense(): Promise<void> {
    try {
      if (!fs.existsSync(this.licensePath)) {
        throw new Error('License file not found');
      }

      const encryptedData = fs.readFileSync(this.licensePath, 'utf8');
      this.currentLicense = this.decryptLicense(encryptedData);
    } catch (error) {
      throw new Error(`Failed to load license: ${error}`);
    }
  }

  /**
   * Save license to disk
   */
  private async saveLicense(license: LicenseInfo): Promise<void> {
    try {
      const encryptedData = this.encryptLicense(license);
      
      // Ensure directory exists
      const dir = path.dirname(this.licensePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.licensePath, encryptedData, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save license: ${error}`);
    }
  }

  /**
   * Encrypt license data
   */
  private encryptLicense(license: LicenseInfo): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(JSON.stringify(license), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt license data
   */
  private decryptLicense(encryptedLicense: string): LicenseInfo {
    try {
      const parts = encryptedLicense.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid license format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedData = parts[1];
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Invalid license format');
    }
  }

  /**
   * Parse license key into license info
   */
  private parseLicenseKey(licenseKey: string): LicenseInfo {
    try {
      // For demo purposes, create a basic license structure
      // In production, this would decode a properly signed license
      const parts = licenseKey.split('-');
      if (parts.length < 4) {
        throw new Error('Invalid license key format');
      }

      return {
        licenseKey,
        customerName: 'Licensed User',
        companyName: 'Licensed Company',
        email: 'user@company.com',
        hardwareFingerprint: '',
        features: ['pos', 'inventory', 'reports', 'analytics'],
        maxUsers: 5,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        issueDate: new Date().toISOString(),
        version: '1.0.0',
        type: 'standard'
      };
    } catch (error) {
      throw new Error(`Invalid license key: ${error}`);
    }
  }

  /**
   * Validate license signature
   */
  private validateLicenseSignature(license: LicenseInfo): boolean {
    // In production, implement proper digital signature validation
    // For now, just check basic format
    return license.licenseKey && 
           license.customerName && 
           license.expirationDate &&
           license.features.length > 0;
  }

  /**
   * Generate a random license key
   */
  private generateLicenseKey(): string {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return segments.join('-');
  }

  /**
   * Remove current license
   */
  async removeLicense(): Promise<void> {
    try {
      if (fs.existsSync(this.licensePath)) {
        fs.unlinkSync(this.licensePath);
      }
      this.currentLicense = null;
      console.log('✅ License removed');
    } catch (error) {
      console.error('❌ Failed to remove license:', error);
      throw error;
    }
  }
}
