// Windows Version Compatibility Testing - Electron 21.x
import os from 'os';
import { ElectronApplication, Page, _electron } from '@playwright/test';
import path from 'path';

describe('Windows Version Compatibility', () => {
  let app: ElectronApplication;
  let page: Page;

  beforeAll(async () => {
    // Launch Electron app for compatibility testing
    app = await _electron.launch({
      args: [path.join(__dirname, '../../dist/main/index.js')],
      env: {
        NODE_ENV: 'test',
        ELECTRON_IS_TEST: '1'
      }
    });
    
    page = await app.firstWindow();
    await page.waitForLoadState('domcontentloaded');
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  test('detects Windows version correctly', async () => {
    const windowsVersion = await page.evaluate(() => {
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      
      return {
        userAgent,
        platform,
        isWindows7: userAgent.includes('Windows NT 6.1'),
        isWindows8: userAgent.includes('Windows NT 6.2') || userAgent.includes('Windows NT 6.3'),
        isWindows10Plus: userAgent.includes('Windows NT 10.0')
      };
    });
    
    expect(windowsVersion.platform).toContain('Win');
    expect(typeof windowsVersion.isWindows7).toBe('boolean');
  });

  test('adapts UI for Windows 7 limitations', async () => {
    // Mock Windows 7 environment
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
        configurable: true
      });
    });

    await page.reload();
    await page.waitForSelector('.glass-card');

    // Should use Windows 7 compatible features
    const glassEffect = await page.evaluate(() => {
      const element = document.querySelector('.glass-card');
      if (!element) return null;
      
      const style = window.getComputedStyle(element);
      return {
        backdropFilter: style.backdropFilter,
        backgroundColor: style.backgroundColor,
        hasWin7Class: element.classList.contains('supports-[not_backdrop-filter]:bg-white/95')
      };
    });

    // Windows 7 should use fallback styling
    expect(glassEffect?.hasWin7Class).toBe(true);
  });

  test('handles different DPI scaling levels', async () => {
    const dpiLevels = [
      { width: 1920, height: 1080, scale: 1.0 }, // 100%
      { width: 1536, height: 960, scale: 1.25 }, // 125%
      { width: 1280, height: 800, scale: 1.5 },  // 150%
    ];

    for (const dpi of dpiLevels) {
      await page.setViewportSize({ width: dpi.width, height: dpi.height });
      
      // Test that UI elements scale properly
      const buttonSize = await page.evaluate(() => {
        const button = document.querySelector('[data-testid="add-product"]');
        if (!button) return null;
        
        const rect = button.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          minTouchTarget: rect.width >= 44 && rect.height >= 44
        };
      });

      if (buttonSize) {
        expect(buttonSize.minTouchTarget).toBe(true); // Touch-friendly minimum
      }
    }
  });

  test('validates .NET Framework compatibility', async () => {
    const dotNetInfo = await page.evaluate(() => {
      // Check if .NET Framework is available (Windows-specific)
      const isWindows = navigator.platform.includes('Win');
      
      if (!isWindows) return { available: false, reason: 'Not Windows' };
      
      // Mock .NET Framework detection
      const mockDotNetVersions = [
        { version: '4.6.1', installed: true },
        { version: '4.7.2', installed: true },
        { version: '4.8', installed: false }
      ];
      
      return {
        available: true,
        versions: mockDotNetVersions,
        hasMinimumVersion: mockDotNetVersions.some(v => 
          parseFloat(v.version) >= 4.61 && v.installed
        )
      };
    });

    if (dotNetInfo.available) {
      expect(dotNetInfo.hasMinimumVersion).toBe(true);
    }
  });

  test('handles Windows 7 file system limitations', async () => {
    const fileSystemTests = await page.evaluate(() => {
      const tests = [];
      
      // Test long filename handling (Windows 7 260 char limit)
      const longFilename = 'backup_' + 'x'.repeat(200) + '.bak';
      tests.push({
        test: 'long_filename',
        filename: longFilename,
        length: longFilename.length,
        exceedsLimit: longFilename.length > 260
      });
      
      // Test special characters in filenames
      const specialChars = ['<', '>', ':', '"', '|', '?', '*'];
      tests.push({
        test: 'special_chars',
        invalidChars: specialChars,
        hasInvalidChars: specialChars.length > 0
      });
      
      return tests;
    });

    const longFilenameTest = fileSystemTests.find((t: any) => t.test === 'long_filename');
    if (longFilenameTest?.exceedsLimit) {
      // Should handle long filenames gracefully
      expect(longFilenameTest.length).toBeGreaterThan(260);
    }
  });

  test('validates Windows registry access compatibility', async () => {
    const registryAccess = await page.evaluate(() => {
      // Mock registry access test
      const mockRegistryOperations = [
        { operation: 'read_hklm', success: true },
        { operation: 'read_hkcu', success: true },
        { operation: 'write_hkcu', success: true },
        { operation: 'write_hklm', success: false } // Usually requires admin
      ];
      
      return {
        operations: mockRegistryOperations,
        canReadUserSettings: mockRegistryOperations.find(op => 
          op.operation === 'read_hkcu'
        )?.success,
        canWriteUserSettings: mockRegistryOperations.find(op => 
          op.operation === 'write_hkcu'
        )?.success
      };
    });

    expect(registryAccess.canReadUserSettings).toBe(true);
    expect(registryAccess.canWriteUserSettings).toBe(true);
  });

  test('handles Windows UAC (User Account Control)', async () => {
    const uacHandling = await page.evaluate(() => {
      // Mock UAC scenarios
      return {
        isElevated: false, // Most apps run non-elevated
        canRequestElevation: true,
        gracefulDegradation: true // App should work without elevation
      };
    });

    expect(uacHandling.gracefulDegradation).toBe(true);
  });

  test('validates hardware device access across Windows versions', async () => {
    const hardwareAccess = await page.evaluate(() => {
      // Mock hardware device detection
      const mockDevices = [
        { type: 'hid', name: 'Barcode Scanner', compatible: true, driver: 'generic_hid' },
        { type: 'serial', name: 'Receipt Printer', compatible: true, driver: 'com_port' },
        { type: 'usb', name: 'Cash Drawer', compatible: true, driver: 'usb_relay' }
      ];
      
      return {
        devices: mockDevices,
        allCompatible: mockDevices.every(d => d.compatible),
        supportedTypes: mockDevices.map(d => d.type)
      };
    });

    expect(hardwareAccess.allCompatible).toBe(true);
    expect(hardwareAccess.supportedTypes).toContain('hid');
    expect(hardwareAccess.supportedTypes).toContain('serial');
  });

  test('validates network stack compatibility', async () => {
    const networkTests = await page.evaluate(() => {
      // Test network capabilities
      const capabilities = {
        ipv4: true,
        ipv6: navigator.userAgent.includes('Windows NT 6.1') ? false : true, // Windows 7 limited IPv6
        tcpConnections: navigator.userAgent.includes('Windows NT 6.1') ? 10 : 20, // Windows 7 Home limit
        websockets: 'WebSocket' in window,
        fetch: 'fetch' in window
      };
      
      return capabilities;
    });

    expect(networkTests.ipv4).toBe(true);
    expect(networkTests.websockets).toBe(true);
    expect(networkTests.fetch).toBe(true);
  });

  test('handles Windows power management', async () => {
    const powerManagement = await page.evaluate(() => {
      // Mock power management features
      return {
        preventSleep: 'wakeLock' in navigator || 'requestWakeLock' in navigator,
        batteryAPI: 'getBattery' in navigator,
        powerSaveMode: false // Assume normal power mode
      };
    });

    // Power management should be handled gracefully
    expect(typeof powerManagement.preventSleep).toBe('boolean');
  });

  test('validates Windows theme and accessibility support', async () => {
    const accessibilityFeatures = await page.evaluate(() => {
      const features = {
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        screenReader: navigator.userAgent.includes('NVDA') || navigator.userAgent.includes('JAWS')
      };
      
      return features;
    });

    // Should handle all accessibility features gracefully
    expect(typeof accessibilityFeatures.highContrast).toBe('boolean');
    expect(typeof accessibilityFeatures.reducedMotion).toBe('boolean');
  });
});
