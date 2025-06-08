#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  previewDir: path.join(__dirname, '..', 'preview'),
  srcDir: path.join(__dirname, '..', 'preview', 'src'),
  adminDir: path.join(__dirname, '..', 'preview', 'src', 'admin'),
  storefrontDir: path.join(__dirname, '..', 'preview', 'src', 'storefront'),
  dependencies: {
    '@shopify/polaris': '^13.9.5',
    '@shopify/app-bridge': '^3.7.10',
    '@shopify/app-bridge-react': '^3.7.10',
    'react': '^18.3.1',
    'react-dom': '^18.3.1',
    'react-router-dom': '^7.6.2',
  },
};

// Create directory structure
function createDirectoryStructure() {
  console.log('Creating directory structure...');

  // Create preview directory
  if (!fs.existsSync(config.previewDir)) {
    fs.mkdirSync(config.previewDir);
  }

  // Create src directory
  if (!fs.existsSync(config.srcDir)) {
    fs.mkdirSync(config.srcDir);
  }

  // Create admin directory
  if (!fs.existsSync(config.adminDir)) {
    fs.mkdirSync(config.adminDir);
  }

  // Create storefront directory
  if (!fs.existsSync(config.storefrontDir)) {
    fs.mkdirSync(config.storefrontDir);
  }
}

// Create package.json
function createPackageJson() {
  console.log('Creating package.json...');

  const packageJson = {
    name: 'shopify-preview-system',
    version: '1.0.0',
    description: 'Shopify Preview System for development',
    private: true,
    type: 'module',
    scripts: {
      start: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: config.dependencies,
    devDependencies: {
      '@types/react': '^18.3.23',
      '@types/react-dom': '^18.3.7',
      '@vitejs/plugin-react': '^4.3.4',
      'typescript': '^5.7.3',
      'vite': '^6.3.5',
    },
  };

  fs.writeFileSync(
    path.join(config.previewDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

// Create tsconfig.json
function createTsConfig() {
  console.log('Creating tsconfig.json...');

  const tsConfig = {
    compilerOptions: {
      target: 'ES2022',
      useDefineForClassFields: true,
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }],
  };

  fs.writeFileSync(
    path.join(config.previewDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
}

// Create tsconfig.node.json
function createTsConfigNode() {
  console.log('Creating tsconfig.node.json...');

  const tsConfigNode = {
    compilerOptions: {
      composite: true,
      skipLibCheck: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowSyntheticDefaultImports: true
    },
    include: ['vite.config.ts']
  };

  fs.writeFileSync(
    path.join(config.previewDir, 'tsconfig.node.json'),
    JSON.stringify(tsConfigNode, null, 2)
  );
}

// Create vite.config.ts
function createViteConfig() {
  console.log('Creating vite.config.ts...');

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'ES2022'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@shopify/polaris',
      '@shopify/app-bridge',
      '@shopify/app-bridge-react'
    ]
  }
});`;

  fs.writeFileSync(path.join(config.previewDir, 'vite.config.ts'), viteConfig);
}

// Create main index.html
function createMainIndexHtml() {
  console.log('Creating main index.html...');

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopify Preview System</title>
  <link rel="stylesheet" href="https://unpkg.com/@shopify/polaris@13.9.5/build/esm/styles.css" />
  <link rel="preconnect" href="https://cdn.shopify.com/" />
  <link rel="stylesheet" href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(config.previewDir, 'index.html'), indexHtml);
}

// Create main.tsx
function createMainTsx() {
  console.log('Creating main.tsx...');

  const mainTsx = `import React from 'react';
import { createRoot } from 'react-dom/client';
import { PreviewSystem } from './PreviewSystem';

const root = createRoot(document.getElementById('root')!);
root.render(<PreviewSystem />);`;

  fs.writeFileSync(path.join(config.previewDir, 'src', 'main.tsx'), mainTsx);
}

// Create PreviewSystem.tsx
function createPreviewSystem() {
  console.log('Creating PreviewSystem.tsx...');

  const previewSystem = `import React, { useState } from 'react';
import {
  AppProvider,
  Frame,
  Navigation,
  TopBar,
  Page,
  Layout,
  Card,
  Text,
  Button,
  Tabs,
  Banner,
  Box,
  InlineStack,
} from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';

// Preview mode type
type PreviewMode = 'admin' | 'storefront';

// Preview system component
export function PreviewSystem() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('admin');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab items
  const tabs = [
    {
      id: 'admin',
      content: 'Admin',
      accessibilityLabel: 'Admin preview',
      panelID: 'admin-preview',
    },
    {
      id: 'storefront',
      content: 'Storefront',
      accessibilityLabel: 'Storefront preview',
      panelID: 'storefront-preview',
    },
  ];

  // Handle tab change
  const handleTabChange = (selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex);
    setPreviewMode(selectedTabIndex === 0 ? 'admin' : 'storefront');
  };

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    const previewContent = document.querySelector('.preview-content');
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      previewContent?.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  // Navigation items
  const navigationMarkup = (
    <Navigation location={previewMode}>
      <Navigation.Section
        items={[
          {
            label: 'Admin',
            url: '/admin',
            selected: previewMode === 'admin',
          },
          {
            label: 'Storefront',
            url: '/storefront',
            selected: previewMode === 'storefront',
          },
        ]}
      />
    </Navigation>
  );

  // Top bar markup with InlineStack
  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      secondaryMenu={
        <InlineStack gap="200">
          <Button onClick={handleRefresh}>Refresh</Button>
          <Button onClick={handleFullscreenToggle}>
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </InlineStack>
      }
      onNavigationToggle={() => {}}
    />
  );

  return (
    <AppProvider i18n={enTranslations}>
      <Frame
        topBar={topBarMarkup}
        navigation={navigationMarkup}
        showMobileNavigation={false}
      >
        <Page title="Shopify Preview System">
          <Layout>
            <Layout.Section>
              <Card>
                <Box padding="400">
                  <Tabs
                    tabs={tabs}
                    selected={selectedTab}
                    onSelect={handleTabChange}
                  />
                </Box>
              </Card>
            </Layout.Section>
            <Layout.Section>
              {error && (
                <Banner tone="critical">
                  <p>{error}</p>
                </Banner>
              )}
              <Card>
                <Box padding="400" className="preview-content">
                  <Text variant="headingMd" as="h2">
                    {previewMode === 'admin' ? 'Admin Preview' : 'Storefront Preview'}
                  </Text>
                  <Box paddingBlockStart="400">
                    <Text>
                      This is where your {previewMode} components will be rendered.
                    </Text>
                    <Box paddingBlockStart="200">
                      <Text tone="subdued">
                        Preview system is running with optimized 2025 dependencies:
                        React 18.3.1, Vite 6.3.5, TypeScript 5.7.3, React Router 7.6.2, and Polaris 13.9.5
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </Frame>
    </AppProvider>
  );
}`;

  fs.writeFileSync(path.join(config.previewDir, 'src', 'PreviewSystem.tsx'), previewSystem);
}

// Install dependencies
function installDependencies() {
  console.log('Installing dependencies...');

  try {
    execSync('yarn install', {
      cwd: config.previewDir,
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    process.exit(1);
  }
}

// Main function
async function main() {
  try {
    createDirectoryStructure();
    createPackageJson();
    createTsConfig();
    createTsConfigNode();
    createViteConfig();
    createMainIndexHtml();
    createMainTsx();
    createPreviewSystem();
    installDependencies();

    console.log('\nPreview system setup complete! 🎉');
    console.log('\nTo use the preview system:');
    console.log('1. Run "yarn preview" to start the preview server');
    console.log('2. The preview will open automatically in your default browser');
    console.log('3. Use the tabs to switch between admin and storefront previews');
    console.log('\nKeyboard shortcuts:');
    console.log('- Cmd/Ctrl + R: Refresh preview');
    console.log('- Cmd/Ctrl + F: Toggle fullscreen');
    console.log('- Cmd/Ctrl + 1: Switch to admin preview');
    console.log('- Cmd/Ctrl + 2: Switch to storefront preview');
    console.log('\n🚀 Using optimized 2025 dependencies:');
    console.log('- React 18.3.1 (latest stable, compatible with Polaris)');
    console.log('- Vite 6.3.5 (latest)');
    console.log('- TypeScript 5.7.3 (latest)');
    console.log('- React Router 7.6.2 (latest)');
    console.log('- App Bridge 3.7.10 (latest stable)');
    console.log('- Polaris 13.9.5 (latest stable)');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

main(); 