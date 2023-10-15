import { LATEST_API_VERSION as apiVersion } from '@shopify/shopify-api';
import {
  MemorySessionStorage,
} from '@shopify/shopify-app-session-storage-memory';
import { vi } from 'vitest';

import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(__dirname, "../test-utilities/test.env"),
});

if (
  process.env.SHOPIFY_API_KEY === undefined ||
  process.env.SHOPIFY_API_SECRET === undefined ||
  process.env.SHOPIFY_APP_URL === undefined||
  process.env.SCOPES === undefined
) {
  throw new Error("Test environment variables not set");
}

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecretKey = process.env.SHOPIFY_API_SECRET;
const appUrl = process.env.SHOPIFY_APP_URL;
const scopes = process.env.SCOPES;

const testConfig = function testConfig(overrides = {}) { // assignment to avoid hoisting
  return {
    apiKey,
    apiSecretKey,
    scopes: scopes.split(","),
    apiVersion,
    appUrl,
    sessionStorage: new MemorySessionStorage(),
    ...overrides,
  };
};

vi.mock('@shopify/shopify-app-remix', async () => {
  /** @type {import("@shopify/shopify-app-remix")} */
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