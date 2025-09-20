import { app } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash, randomBytes } from 'crypto';

/**
 * License Service for Tareeqa POS
 * Handles license validation, hardware binding, and activation
 */
export class LicenseService {
  private readonly licensePath: string;
  private readonly licenseFile: string;
  private licenseData: any = null;
  private isLicenseValid = false;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.licensePath = join(userDataPath, 'license');
    this.licenseFile = join(this.licensePath, 'tareeqa.lic');
  }

  /**
   * Initialize license service
   */
  async initialize(): Promise<void> {
    console.log('📜 Initializing license service...');

    try {
      // Ensure license directory exists
      if (!existsSync(this.licensePath)) {
        require('fs').mkdirSync(this.licensePath, { recursive: true });
      }

      // Load and validate license
      await this.loadLicense();
      await this.validateLicense();

      console.log('✅ License service initialized');
    } catch (error) {
      console.error('❌ License initialization failed:', error);
      // Don't throw - allow app to run in demo mode
    }
  }

  /**
   * Load license from file
   */
  private async loadLicense(): Promise<void> {
    try {
      if (existsSync(this.licenseFile)) {
        const licenseContent = readFileSync(this.licenseFile, 'utf8');
        this.licenseData = JSON.parse(licenseContent);
        console.log('📜 License loaded from file');
      } else {
        // Create demo license
        await this.createDemoLicense();
      }
    } catch (error) {
      console.error('❌ Failed to load license:', error);
      await this.createDemoLicense();
    }
  }

  /**
   * Create demo license for development/trial
   */
  private async createDemoLicense(): Promise<void> {
    console.log('🆓 Creating demo license...');

    const demoLicense = {
      type: 'demo',
      version: '1.0.0',
      issuedTo: 'Demo User',
      companyName: 'Demo Company',
      email: 'demo@tareeqa.pos',
      issuedDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      features: {
        maxTransactions: 1000,
        maxProducts: 500,
        maxUsers: 3,
        hardwareIntegration: true,
        reporting: true,
        multiStore: false,
        cloudSync: false
      },
      hardwareFingerprint: this.generateHardwareFingerprint(),
      signature: 'demo-signature'
    };

    this.licenseData = demoLicense;
    this.saveLicense();
  }

  /**
   * Validate current license
   */
  async validateLicense(): Promise<boolean> {
    try {
      if (!this.licenseData) {
        console.warn('⚠️ No license data available');
        return false;
      }

      // Check expiry date
      const expiryDate = new Date(this.licenseData.expiryDate);
      const now = new Date();
      
      if (expiryDate < now) {
        console.warn('⚠️ License has expired');
        this.isLicenseValid = false;
        return false;
      }

      // Check hardware fingerprint (for non-demo licenses)
      if (this.licenseData.type !== 'demo') {
        const currentFingerprint = this.generateHardwareFingerprint();
        if (this.licenseData.hardwareFingerprint !== currentFingerprint) {
          console.warn('⚠️ Hardware fingerprint mismatch');
          this.isLicenseValid = false;
          return false;
        }
      }

      // Validate signature (simplified for demo)
      if (!this.validateSignature()) {
        console.warn('⚠️ Invalid license signature');
        this.isLicenseValid = false;
        return false;
      }

      console.log('✅ License is valid');
      this.isLicenseValid = true;
      return true;

    } catch (error) {
      console.error('❌ License validation failed:', error);
      this.isLicenseValid = false;
      return false;
    }
  }

  /**
   * Validate license signature
   */
  private validateSignature(): boolean {
    if (!this.licenseData) return false;

    // For demo licenses, always return true
    if (this.licenseData.type === 'demo') {
      return true;
    }

    // In a real implementation, this would use RSA signature verification
    // For now, we'll do a simple hash check
    const dataToSign = JSON.stringify({
      type: this.licenseData.type,
      issuedTo: this.licenseData.issuedTo,
      expiryDate: this.licenseData.expiryDate,
      features: this.licenseData.features,
      hardwareFingerprint: this.licenseData.hardwareFingerprint
    });

    const expectedSignature = createHash('sha256').update(dataToSign + 'tareeqa-secret').digest('hex');
    return this.licenseData.signature === expectedSignature;
  }

  /**
   * Generate hardware fingerprint
   */
  private generateHardwareFingerprint(): string {
    const os = require('os');
    
    const fingerprint = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().map(cpu => cpu.model).join('|'),
      totalmem: Math.floor(os.totalmem() / (1024 * 1024 * 1024)), // GB
      hostname: os.hostname(),
      networkInterfaces: Object.keys(os.networkInterfaces()).sort().join('|')
    };

    const fingerprintString = JSON.stringify(fingerprint);
    return createHash('sha256').update(fingerprintString).digest('hex');
  }

  /**
   * Activate license with key
   */
  async activateLicense(licenseKey: string, userInfo: any): Promise<boolean> {
    try {
      console.log('🔑 Activating license...');

      // In a real implementation, this would contact the license server
      // For now, we'll simulate activation
      
      if (licenseKey.length < 20) {
        throw new Error('Invalid license key format');
      }

      const activatedLicense = {
        type: 'professional',
        version: '1.0.0',
        licenseKey: licenseKey,
        issuedTo: userInfo.name,
        companyName: userInfo.company,
        email: userInfo.email,
        issuedDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        features: {
          maxTransactions: -1, // Unlimited
          maxProducts: -1,     // Unlimited
          maxUsers: 10,
          hardwareIntegration: true,
          reporting: true,
          multiStore: true,
          cloudSync: true
        },
        hardwareFingerprint: this.generateHardwareFingerprint(),
        signature: this.generateSignature(licenseKey, userInfo)
      };

      this.licenseData = activatedLicense;
      this.saveLicense();
      
      await this.validateLicense();
      
      console.log('✅ License activated successfully');
      return true;

    } catch (error) {
      console.error('❌ License activation failed:', error);
      return false;
    }
  }

  /**
   * Generate license signature
   */
  private generateSignature(licenseKey: string, userInfo: any): string {
    const dataToSign = JSON.stringify({
      licenseKey,
      name: userInfo.name,
      company: userInfo.company,
      email: userInfo.email,
      hardwareFingerprint: this.generateHardwareFingerprint()
    });

    return createHash('sha256').update(dataToSign + 'tareeqa-secret').digest('hex');
  }

  /**
   * Save license to file
   */
  private saveLicense(): void {
    try {
      writeFileSync(this.licenseFile, JSON.stringify(this.licenseData, null, 2));
      console.log('💾 License saved to file');
    } catch (error) {
      console.error('❌ Failed to save license:', error);
    }
  }

  /**
   * Get license information
   */
  getLicenseInfo(): any {
    if (!this.licenseData) {
      return {
        status: 'no_license',
        message: 'No license found'
      };
    }

    const expiryDate = new Date(this.licenseData.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      status: this.isLicenseValid ? 'valid' : 'invalid',
      type: this.licenseData.type,
      issuedTo: this.licenseData.issuedTo,
      companyName: this.licenseData.companyName,
      email: this.licenseData.email,
      issuedDate: this.licenseData.issuedDate,
      expiryDate: this.licenseData.expiryDate,
      daysUntilExpiry: daysUntilExpiry,
      features: this.licenseData.features,
      hardwareFingerprint: this.licenseData.hardwareFingerprint?.substring(0, 16) + '...'
    };
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: string): boolean {
    if (!this.licenseData || !this.isLicenseValid) {
      return false;
    }

    return this.licenseData.features[feature] === true;
  }

  /**
   * Get feature limit
   */
  getFeatureLimit(feature: string): number {
    if (!this.licenseData || !this.isLicenseValid) {
      return 0;
    }

    const limit = this.licenseData.features[feature];
    return typeof limit === 'number' ? limit : 0;
  }

  /**
   * Check if limit is exceeded
   */
  isLimitExceeded(feature: string, currentCount: number): boolean {
    const limit = this.getFeatureLimit(feature);
    return limit > 0 && currentCount >= limit;
  }

  /**
   * Deactivate license
   */
  async deactivateLicense(): Promise<boolean> {
    try {
      console.log('🔓 Deactivating license...');

      // In a real implementation, this would contact the license server
      
      if (existsSync(this.licenseFile)) {
        require('fs').unlinkSync(this.licenseFile);
      }

      this.licenseData = null;
      this.isLicenseValid = false;

      // Create new demo license
      await this.createDemoLicense();

      console.log('✅ License deactivated');
      return true;

    } catch (error) {
      console.error('❌ License deactivation failed:', error);
      return false;
    }
  }

  /**
   * Export license for backup
   */
  exportLicense(): string | null {
    if (!this.licenseData) {
      return null;
    }

    return JSON.stringify(this.licenseData, null, 2);
  }

  /**
   * Import license from backup
   */
  async importLicense(licenseContent: string): Promise<boolean> {
    try {
      const importedLicense = JSON.parse(licenseContent);
      
      // Basic validation
      if (!importedLicense.type || !importedLicense.expiryDate) {
        throw new Error('Invalid license format');
      }

      this.licenseData = importedLicense;
      this.saveLicense();
      
      const isValid = await this.validateLicense();
      
      if (isValid) {
        console.log('✅ License imported successfully');
        return true;
      } else {
        throw new Error('Imported license is not valid');
      }

    } catch (error) {
      console.error('❌ License import failed:', error);
      return false;
    }
  }

  /**
   * Get license status for UI
   */
  getLicenseStatus(): any {
    const info = this.getLicenseInfo();
    
    let statusColor = 'gray';
    let statusText = 'Unknown';
    
    if (info.status === 'valid') {
      if (info.daysUntilExpiry > 30) {
        statusColor = 'green';
        statusText = 'Active';
      } else if (info.daysUntilExpiry > 7) {
        statusColor = 'yellow';
        statusText = 'Expiring Soon';
      } else {
        statusColor = 'orange';
        statusText = 'Expires Very Soon';
      }
    } else if (info.status === 'invalid') {
      statusColor = 'red';
      statusText = 'Invalid';
    } else {
      statusColor = 'blue';
      statusText = 'Demo';
    }

    return {
      ...info,
      statusColor,
      statusText,
      isValid: this.isLicenseValid
    };
  }

  /**
   * Cleanup license service
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up license service...');
    // No specific cleanup needed for license service
    console.log('✅ License service cleanup completed');
  }
}
