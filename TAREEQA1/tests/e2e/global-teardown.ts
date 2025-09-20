// Playwright Global Teardown - Electron 21.x
import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up E2E test environment...');

  try {
    // Clean up test database
    const testDbPath = path.join(process.cwd(), 'test-results', 'test.db');
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Clean up temporary files
    const tempFiles = [
      'test-results/temp-*',
      'test-results/*.log'
    ];

    // Archive test results if in CI
    if (process.env.CI) {
      console.log('📦 Archiving test results for CI...');
      // Add archiving logic here if needed
    }

    console.log('✅ E2E test cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

export default globalTeardown;
