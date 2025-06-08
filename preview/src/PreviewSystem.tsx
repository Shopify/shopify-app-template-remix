import React, { useState } from 'react';
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
}