#!/usr/bin/env node

/**
 * Development Setup Script
 * 
 * Sets up the development environment for the Shopify app template.
 * Installs dependencies, configures tools, and sets up development utilities.
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

async function setupDev() {
  try {
    log.header('🚀 Development Environment Setup\n');

    // Install dependencies
    log.step('Installing dependencies...');
    await execAsync('npm install');
    log.success('Dependencies installed');

    // Setup Git hooks
    log.step('Setting up Git hooks...');
    await execAsync('npx husky install');
    await execAsync('npx husky add .husky/pre-commit "npm run lint"');
    await execAsync('npx husky add .husky/pre-push "npm run test"');
    log.success('Git hooks configured');

    // Setup Storybook
    log.step('Setting up Storybook...');
    await execAsync('npx storybook init');
    log.success('Storybook configured');

    // Setup testing
    log.step('Setting up testing environment...');
    await execAsync('npm run test:setup');
    log.success('Testing environment configured');

    // Setup preview system
    log.step('Setting up preview system...');
    await execAsync('npm run preview:setup');
    log.success('Preview system configured');

    log.success('\n✨ Development environment setup complete!');
    log.info('\nNext steps:');
    log.info('1. Start the development server: npm run dev');
    log.info('2. Open Storybook: npm run storybook');
    log.info('3. Run tests: npm run test');

  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

setupDev(); 