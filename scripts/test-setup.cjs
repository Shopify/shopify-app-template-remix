#!/usr/bin/env node

/**
 * Test Setup Script
 * 
 * Sets up the testing environment for the Shopify app template.
 * Configures Vitest, testing utilities, and creates example tests.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}→ ${msg}${colors.reset}`),
};

async function setupTests() {
  try {
    log.header('🧪 Test Environment Setup\n');

    // Create test directories
    log.step('Creating test directories...');
    const testDirs = [
      'tests',
      'tests/components',
      'tests/api',
      'tests/e2e',
      'tests/__mocks__'
    ];

    for (const dir of testDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log.success(`Created ${dir}/`);
      }
    }

    // Create example test file
    log.step('Creating example test file...');
    const exampleTest = `
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '@shopify/polaris';

// Example test for a Polaris component
describe('Button Component', () => {
  it('renders with correct text', () => {
    render(
      <AppProvider>
        <button>Test Button</button>
      </AppProvider>
    );
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
});
    `.trim();

    fs.writeFileSync('tests/components/Button.test.tsx', exampleTest);
    log.success('Created example test file');

    // Create mock files
    log.step('Creating test mocks...');
    const appBridgeMock = `
// App Bridge mock for testing
export const useAppBridge = () => ({
  toast: {
    show: vi.fn(),
  },
  modal: {
    show: vi.fn(),
    hide: vi.fn(),
  },
  loading: vi.fn(),
});

export const createApp = vi.fn(() => ({
  // Mock app instance
}));
    `.trim();

    fs.writeFileSync('tests/__mocks__/@shopify/app-bridge-react.ts', appBridgeMock);
    log.success('Created App Bridge test mocks');

    // Create Vitest config
    log.step('Creating Vitest configuration...');
    const vitestConfig = `
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
});
    `.trim();

    fs.writeFileSync('vitest.config.ts', vitestConfig);
    log.success('Created Vitest configuration');

    // Create test setup file
    log.step('Creating test setup file...');
    const testSetup = `
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
    `.trim();

    fs.writeFileSync('tests/setup.ts', testSetup);
    log.success('Created test setup file');

    log.success('\n✨ Test environment setup complete!');
    log.info('\nNext steps:');
    log.info('1. Run tests: yarn test');
    log.info('2. Run tests with coverage: yarn test:coverage');
    log.info('3. Add more tests in the tests/ directory');

  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

setupTests(); 