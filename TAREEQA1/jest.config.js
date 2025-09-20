// Jest Configuration for Electron 21.x - Windows 7+ Compatible
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-setup.ts',
    '!src/main/main.ts' // Exclude Electron main process from coverage
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testTimeout: 10000, // Increased for Electron process tests
  // Electron 21.x specific test environment
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  // Test patterns for different test types
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/tests/unit/**/*.{test,spec}.{ts,tsx}'
  ],
  // Separate test patterns for different categories
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.{test,spec}.{ts,tsx}'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'security',
      testMatch: ['<rootDir>/tests/security/**/*.{test,spec}.{ts,tsx}'],
      testEnvironment: 'node'
    },
    {
      displayName: 'arabic',
      testMatch: ['<rootDir>/tests/arabic/**/*.{test,spec}.{ts,tsx}'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'compatibility',
      testMatch: ['<rootDir>/tests/compatibility/**/*.{test,spec}.{ts,tsx}'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'performance',
      testMatch: ['<rootDir>/tests/performance/**/*.{test,spec}.{ts,tsx}'],
      testEnvironment: 'node',
      testTimeout: 30000
    }
  ],
  // Transform configuration for Electron 21.x
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        target: 'es2020', // Compatible with Electron 21.x Chromium
        module: 'commonjs'
      }
    }]
  },
  // Mock Electron APIs
  moduleNameMapping: {
    '^electron$': '<rootDir>/src/__mocks__/electron.ts'
  },
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx)'
  ],
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ]
};
