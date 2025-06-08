/**
 * Test Setup - Global test configuration and mocks
 * Sets up React Testing Library, Polaris, and App Bridge mocks
 */

import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock App Bridge
vi.mock("@shopify/app-bridge", () => ({
  createApp: vi.fn(() => ({
    dispatch: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    error: vi.fn(),
    featuresAvailable: vi.fn(() => true),
    getState: vi.fn(() => ({})),
  })),
}));

// Mock App Bridge actions
vi.mock("@shopify/app-bridge/actions", () => ({
  Toast: {
    create: vi.fn(() => ({
      dispatch: vi.fn(),
    })),
    Action: {
      SHOW: "APP::TOAST::SHOW",
    },
  },
  Modal: {
    create: vi.fn(() => ({
      dispatch: vi.fn(),
    })),
  },
  Redirect: {
    create: vi.fn(() => ({
      dispatch: vi.fn(),
    })),
    Action: {
      APP: "APP::REDIRECT::APP",
      ADMIN_PATH: "APP::REDIRECT::ADMIN_PATH",
      REMOTE: "APP::REDIRECT::REMOTE",
    },
  },
  Loading: {
    create: vi.fn(() => ({
      dispatch: vi.fn(),
    })),
    Action: {
      START: "APP::LOADING::START",
      STOP: "APP::LOADING::STOP",
    },
  },
}));

// Mock Shopify authentication
vi.mock("~/shopify.server", () => ({
  authenticate: {
    admin: vi.fn(async () => ({
      session: {
        shop: "test-shop.myshopify.com",
        accessToken: "test-token",
      },
      admin: {
        graphql: vi.fn(async () => ({
          json: async () => ({
            data: {
              products: { edges: [] },
              orders: { edges: [] },
              customers: { edges: [] },
            },
          }),
        })),
      },
    })),
  },
}));

// Mock environment variables
process.env.SHOPIFY_API_KEY = "test-api-key";
process.env.SHOPIFY_API_SECRET = "test-api-secret";
process.env.SCOPES = "read_products,write_products";
process.env.HOST = "localhost:3000";

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock window.matchMedia for Polaris components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for Polaris components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Suppress specific warnings that are expected in test environment
  if (
    args[0]?.includes?.("Warning: ReactDOM.render") ||
    args[0]?.includes?.("Warning: componentWillReceiveProps")
  ) {
    return;
  }
  originalWarn(...args);
}; 