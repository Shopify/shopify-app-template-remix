import { LATEST_API_VERSION, LogSeverity } from '@shopify/shopify-api';
import { MemorySessionStorage } from '@shopify/shopify-app-session-storage-memory';
import { vi } from 'vitest';

const API_SECRET_KEY = 'testApiSecretKey';
const API_KEY = 'testApiKey';
const APP_URL = 'https://my-test-app.myshopify.io';

function testConfig(overrides = {}) {
  return {
    apiKey: API_KEY,
    apiSecretKey: API_SECRET_KEY,
    scopes: ['testScope'],
    apiVersion: LATEST_API_VERSION,
    appUrl: APP_URL,
    logger: {
      log: vi.fn(),
      level: LogSeverity.Debug,
    },
    isEmbeddedApp: true,
    sessionStorage: new MemorySessionStorage(),
    ...overrides,
  };
}

vi.mock('@shopify/shopify-app-remix', async () => {
  const shopify = await vi.importActual('@shopify/shopify-app-remix');

  return {
    ...shopify,
    shopifyApp: () => shopify.shopifyApp(testConfig()),
    boundary: {
      error: shopify.boundary.error,
      headers: shopify.boundary.headers,
    },
  };
});