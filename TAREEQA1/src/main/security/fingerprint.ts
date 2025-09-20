import { machineId } from 'node-machine-id';
import * as os from 'os';
import { execSync } from 'child_process';
import * as crypto from 'crypto';

export interface HardwareInfo {
  machineId: string;
  cpuModel: string;
  motherboardSerial: string;
  diskSerial: string;
  totalMemory: string;
  macAddress: string;
  biosSerial: string;
}

export class HardwareFingerprint {
  private static cachedFingerprint: string | null = null;
  private static cachedHardwareInfo: HardwareInfo | null = null;

  /**
   * Generate a unique hardware fingerprint for this machine
   */
  static async generateFingerprint(): Promise<string> {
    if (this.cachedFingerprint) {
      return this.cachedFingerprint;
    }

    try {
      const hardwareInfo = await this.getHardwareInfo();
      const components = [
        hardwareInfo.machineId,
        hardwareInfo.cpuModel,
        hardwareInfo.motherboardSerial,
        hardwareInfo.diskSerial,
        hardwareInfo.totalMemory,
        hardwareInfo.macAddress,
        hardwareInfo.biosSerial
      ];

      const combined = components.join('|');
      const hash = crypto.createHash('sha256');
      this.cachedFingerprint = hash.update(combined).digest('hex');
      
      return this.cachedFingerprint;
    } catch (error) {
      console.error('Failed to generate hardware fingerprint:', error);
      throw new Error('Hardware fingerprinting failed');
    }
  }

  /**
   * Get detailed hardware information
   */
  static async getHardwareInfo(): Promise<HardwareInfo> {
    if (this.cachedHardwareInfo) {
      return this.cachedHardwareInfo;
    }

    try {
      const hardwareInfo: HardwareInfo = {
        machineId: await machineId(true),
        cpuModel: this.getCpuModel(),
        motherboardSerial: this.getMotherboardSerial(),
        diskSerial: this.getDiskSerial(),
        totalMemory: os.totalmem().toString(),
        macAddress: this.getMacAddress(),
        biosSerial: this.getBiosSerial()
      };

      this.cachedHardwareInfo = hardwareInfo;
      return hardwareInfo;
    } catch (error) {
      console.error('Failed to get hardware info:', error);
      throw error;
    }
  }

  /**
   * Get CPU model information
   */
  private static getCpuModel(): string {
    try {
      const cpus = os.cpus();
      return cpus.length > 0 ? cpus[0].model : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get motherboard serial number (Windows only)
   */
  private static getMotherboardSerial(): string {
    try {
      if (process.platform === 'win32') {
        const output = execSync('wmic baseboard get serialnumber /format:value', { 
          encoding: 'utf8',
          timeout: 5000 
        });
        
        const match = output.match(/SerialNumber=(.+)/);
        return match ? match[1].trim() : 'unknown';
      }
      return 'unknown';
    } catch (error) {
      console.warn('Failed to get motherboard serial:', error);
      return 'unknown';
    }
  }

  /**
   * Get primary disk serial number (Windows only)
   */
  private static getDiskSerial(): string {
    try {
      if (process.platform === 'win32') {
        const output = execSync('wmic diskdrive where "DeviceID=\'\\\\\\\\.\\\\PHYSICALDRIVE0\'" get serialnumber /format:value', { 
          encoding: 'utf8',
          timeout: 5000 
        });
        
        const match = output.match(/SerialNumber=(.+)/);
        return match ? match[1].trim() : 'unknown';
      }
      return 'unknown';
    } catch (error) {
      console.warn('Failed to get disk serial:', error);
      return 'unknown';
    }
  }

  /**
   * Get primary MAC address
   */
  private static getMacAddress(): string {
    try {
      const networkInterfaces = os.networkInterfaces();
      
      for (const [name, interfaces] of Object.entries(networkInterfaces)) {
        if (interfaces) {
          for (const iface of interfaces) {
            if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
              return iface.mac;
            }
          }
        }
      }
      
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get BIOS serial number (Windows only)
   */
  private static getBiosSerial(): string {
    try {
      if (process.platform === 'win32') {
        const output = execSync('wmic bios get serialnumber /format:value', { 
          encoding: 'utf8',
          timeout: 5000 
        });
        
        const match = output.match(/SerialNumber=(.+)/);
        return match ? match[1].trim() : 'unknown';
      }
      return 'unknown';
    } catch (error) {
      console.warn('Failed to get BIOS serial:', error);
      return 'unknown';
    }
  }

  /**
   * Validate if current hardware matches expected fingerprint
   */
  static async validateHardware(expectedFingerprint: string): Promise<boolean> {
    try {
      const currentFingerprint = await this.generateFingerprint();
      return currentFingerprint === expectedFingerprint;
    } catch (error) {
      console.error('Hardware validation failed:', error);
      return false;
    }
  }

  /**
   * Clear cached values (useful for testing)
   */
  static clearCache(): void {
    this.cachedFingerprint = null;
    this.cachedHardwareInfo = null;
  }

  /**
   * Generate a partial fingerprint for license binding
   * Uses fewer components to allow for some hardware changes
   */
  static async generatePartialFingerprint(): Promise<string> {
    try {
      const hardwareInfo = await this.getHardwareInfo();
      const components = [
        hardwareInfo.machineId,
        hardwareInfo.cpuModel,
        hardwareInfo.motherboardSerial
      ];

      const combined = components.join('|');
      const hash = crypto.createHash('sha256');
      return hash.update(combined).digest('hex').substring(0, 32);
    } catch (error) {
      console.error('Failed to generate partial fingerprint:', error);
      throw error;
    }
  }
}
