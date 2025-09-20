// Playwright E2E Testing Configuration - Electron 21.x Compatible
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'electron-windows',
      use: { 
        ...devices['Desktop Windows'],
        // Electron 21.x specific configuration
        launchOptions: {
          executablePath: process.env.ELECTRON_PATH || 'node_modules/.bin/electron',
          args: ['dist/main/index.js'],
          env: {
            NODE_ENV: 'test',
            ELECTRON_IS_TEST: '1',
            ELECTRON_DISABLE_SECURITY_WARNINGS: '1'
          }
        }
      },
    },
    {
      name: 'electron-windows-7',
      use: { 
        ...devices['Desktop Windows'],
        // Windows 7 simulation
        userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
        viewport: { width: 1024, height: 768 }, // Minimum resolution
        launchOptions: {
          executablePath: process.env.ELECTRON_PATH || 'node_modules/.bin/electron',
          args: ['dist/main/index.js', '--disable-gpu', '--disable-software-rasterizer'],
          env: {
            NODE_ENV: 'test',
            ELECTRON_IS_TEST: '1',
            WINDOWS_VERSION: '6.1',
            SIMULATE_WINDOWS_7: '1'
          }
        }
      },
    }
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),

  // Test timeout configuration
  timeout: 30000,
  expect: {
    timeout: 5000
  },

  // Output directories
  outputDir: 'test-results/',
  
  // Web server configuration (if needed for hybrid testing)
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev:renderer',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
