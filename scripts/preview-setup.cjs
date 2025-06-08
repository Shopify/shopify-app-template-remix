#!/usr/bin/env node

/**
 * Preview System Setup Script
 * 
 * Sets up the preview system for the Shopify app template.
 * Creates preview directories and initializes preview pages.
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

async function setupPreview() {
  try {
    log.header('🎨 Preview System Setup\n');

    // Create preview directories
    log.step('Creating preview directories...');
    const previewDirs = [
      'preview',
      'preview/admin',
      'preview/storefront',
      'preview/components'
    ];

    for (const dir of previewDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log.success(`Created ${dir}/`);
      }
    }

    // Create preview HTML template
    log.step('Creating preview HTML template...');
    const previewHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopify App Preview</title>
  <link rel="stylesheet" href="https://unpkg.com/@shopify/polaris@latest/build/esm/styles.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f6f6f7;
    }
    .preview-container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 20px;
    }
    .preview-header {
      border-bottom: 1px solid #e1e3e5;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .preview-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .preview-tab {
      padding: 8px 16px;
      border: 1px solid #c9cccf;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      text-decoration: none;
      color: #202223;
    }
    .preview-tab.active {
      background: #008060;
      color: white;
      border-color: #008060;
    }
  </style>
</head>
<body>
  <div class="preview-container">
    <div class="preview-header">
      <h1>Shopify App Component Preview</h1>
      <p>Preview your components in admin and storefront contexts</p>
    </div>
    
    <div class="preview-tabs">
      <a href="/admin" class="preview-tab">Admin Components</a>
      <a href="/storefront" class="preview-tab">Storefront Components</a>
      <a href="/storybook" class="preview-tab">Storybook</a>
    </div>
    
    <div id="preview-content">
      <h2>Component Preview System</h2>
      <p>Use the conversion tools to generate components and preview them here.</p>
      
      <h3>Available Tools:</h3>
      <ul>
        <li><code>yarn convert:v0</code> - Convert V0 components to Polaris</li>
        <li><code>yarn convert:shadcn</code> - Convert shadcn/ui components to Polaris</li>
        <li><code>yarn storybook</code> - Open Storybook for component development</li>
        <li><code>yarn preview</code> - Start preview server</li>
      </ul>
    </div>
  </div>
</body>
</html>
    `.trim();

    fs.writeFileSync('preview/index.html', previewHTML);
    log.success('Created preview HTML template');

    // Create admin preview page
    log.step('Creating admin preview page...');
    const adminPreviewHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Component Preview</title>
  <link rel="stylesheet" href="https://unpkg.com/@shopify/polaris@latest/build/esm/styles.css">
</head>
<body>
  <div id="admin-preview">
    <h1>Admin Component Preview</h1>
    <p>Preview admin components with Polaris styling</p>
    <!-- Admin components will be loaded here -->
  </div>
  
  <script type="module">
    // Admin component preview logic
    console.log('Admin preview system loaded');
  </script>
</body>
</html>
    `.trim();

    fs.writeFileSync('preview/admin/index.html', adminPreviewHTML);
    log.success('Created admin preview page');

    // Create storefront preview page
    log.step('Creating storefront preview page...');
    const storefrontPreviewHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Storefront Component Preview</title>
</head>
<body>
  <div id="storefront-preview">
    <h1>Storefront Component Preview</h1>
    <p>Preview customer-facing components</p>
    <!-- Storefront components will be loaded here -->
  </div>
  
  <script type="module">
    // Storefront component preview logic
    console.log('Storefront preview system loaded');
  </script>
</body>
</html>
    `.trim();

    fs.writeFileSync('preview/storefront/index.html', storefrontPreviewHTML);
    log.success('Created storefront preview page');

    log.success('\n✨ Preview system setup complete!');
    log.info('\nNext steps:');
    log.info('1. Start the preview server: yarn preview');
    log.info('2. Convert components: yarn convert:v0 or yarn convert:shadcn');
    log.info('3. View components in the preview system');

  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

setupPreview(); 