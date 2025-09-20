// Playwright Global Setup - Electron 21.x
import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up E2E test environment...');

  // Ensure test directories exist
  const testDirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces'
  ];

  testDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Create test database
  const testDbPath = path.join(process.cwd(), 'test-results', 'test.db');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  // Set environment variables for testing
  process.env.TEST_DATABASE_PATH = testDbPath;
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
  process.env.NODE_ENV = 'test';

  // Build the application if not already built
  const mainPath = path.join(process.cwd(), 'dist', 'main', 'index.js');
  if (!fs.existsSync(mainPath)) {
    console.log('📦 Building application for E2E tests...');
    const { execSync } = require('child_process');
    try {
      execSync('npm run build', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Build failed:', error);
      throw error;
    }
  }

  console.log('✅ E2E test environment ready');
}

export default globalSetup;
