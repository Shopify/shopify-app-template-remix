/**
 * Shopify Test Helpers - Utilities for testing Shopify app components
 * Provides mock data, API responses, and App Bridge event simulation
 */

import { vi } from 'vitest';
import { Session } from '@shopify/shopify-api';

// Mock Shopify session
export const createMockSession = (overrides: Partial<Session> = {}): Session => {
  const session = new Session({
    id: 'test-session-id',
    shop: 'test-shop.myshopify.com',
    state: 'test-state',
    isOnline: true,
    scope: 'read_products,write_products,read_orders,write_orders',
    expires: new Date(Date.now() + 3600000), // 1 hour from now
    accessToken: 'test-access-token',
  });
  
  // Apply overrides
  Object.assign(session, overrides);
  
  return session;
};

// Mock product data
export const createMockProduct = (overrides: any = {}) => ({
  id: 'gid://shopify/Product/123456789',
  title: 'Test Product',
  handle: 'test-product',
  description: 'A test product for unit testing',
  vendor: 'Test Vendor',
  productType: 'Test Type',
  status: 'ACTIVE',
  tags: ['test', 'mock'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  publishedAt: '2024-01-01T00:00:00Z',
  variants: {
    edges: [
      {
        node: {
          id: 'gid://shopify/ProductVariant/987654321',
          title: 'Default Title',
          price: '19.99',
          compareAtPrice: '24.99',
          sku: 'TEST-SKU-001',
          inventoryQuantity: 100,
          weight: 1.5,
          weightUnit: 'POUNDS',
        },
      },
    ],
  },
  images: {
    edges: [
      {
        node: {
          id: 'gid://shopify/ProductImage/111111111',
          url: 'https://cdn.shopify.com/test-image.jpg',
          altText: 'Test product image',
        },
      },
    ],
  },
  ...overrides,
});

// Mock order data
export const createMockOrder = (overrides: any = {}) => ({
  id: 'gid://shopify/Order/123456789',
  name: '#1001',
  email: 'customer@example.com',
  phone: '+1234567890',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  processedAt: '2024-01-01T00:00:00Z',
  fulfillmentStatus: 'UNFULFILLED',
  financialStatus: 'PAID',
  totalPrice: '29.99',
  subtotalPrice: '24.99',
  totalTax: '5.00',
  totalShipping: '0.00',
  currency: 'USD',
  customer: {
    id: 'gid://shopify/Customer/987654321',
    firstName: 'John',
    lastName: 'Doe',
    email: 'customer@example.com',
    phone: '+1234567890',
  },
  lineItems: {
    edges: [
      {
        node: {
          id: 'gid://shopify/LineItem/111111111',
          title: 'Test Product',
          quantity: 1,
          price: '24.99',
          variant: {
            id: 'gid://shopify/ProductVariant/987654321',
            title: 'Default Title',
            sku: 'TEST-SKU-001',
          },
        },
      },
    ],
  },
  shippingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    address1: '123 Test Street',
    city: 'Test City',
    province: 'Test Province',
    country: 'Test Country',
    zip: '12345',
  },
  ...overrides,
});

// Mock customer data
export const createMockCustomer = (overrides: any = {}) => ({
  id: 'gid://shopify/Customer/123456789',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+1987654321',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  acceptsMarketing: true,
  state: 'ENABLED',
  tags: ['vip', 'test'],
  ordersCount: 5,
  totalSpent: '149.95',
  addresses: {
    edges: [
      {
        node: {
          id: 'gid://shopify/MailingAddress/111111111',
          firstName: 'Jane',
          lastName: 'Smith',
          address1: '456 Customer Lane',
          city: 'Customer City',
          province: 'Customer Province',
          country: 'Customer Country',
          zip: '67890',
        },
      },
    ],
  },
  ...overrides,
});

// Mock GraphQL responses
export const createMockGraphQLResponse = (data: any, errors?: any[]) => ({
  json: async () => ({
    data,
    errors,
    extensions: {
      cost: {
        requestedQueryCost: 1,
        actualQueryCost: 1,
        throttleStatus: {
          maximumAvailable: 1000,
          currentlyAvailable: 999,
          restoreRate: 50,
        },
      },
    },
  }),
  ok: true,
  status: 200,
  statusText: 'OK',
});

// Mock REST API responses
export const createMockRESTResponse = (data: any, status = 200) => ({
  json: async () => data,
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: new Headers({
    'Content-Type': 'application/json',
    'X-Shopify-API-Version': '2024-01',
  }),
});

// Mock App Bridge app instance
export const createMockAppBridge = () => {
  const mockApp = {
    dispatch: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    error: vi.fn(),
    featuresAvailable: vi.fn(() => true),
    getState: vi.fn(() => ({})),
  };

  return mockApp;
};

// Mock App Bridge actions
export const createMockToast = () => ({
  dispatch: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
});

export const createMockModal = () => ({
  dispatch: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
});

export const createMockRedirect = () => ({
  dispatch: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
});

// Mock webhook payloads
export const createMockWebhookPayload = (topic: string, data: any = {}) => {
  const basePayload = {
    id: Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  switch (topic) {
    case 'products/create':
    case 'products/update':
      return {
        ...basePayload,
        title: 'Test Product',
        handle: 'test-product',
        vendor: 'Test Vendor',
        product_type: 'Test Type',
        status: 'active',
        variants: [
          {
            id: 987654321,
            title: 'Default Title',
            price: '19.99',
            sku: 'TEST-SKU-001',
            inventory_quantity: 100,
          },
        ],
        ...data,
      };

    case 'orders/create':
    case 'orders/updated':
    case 'orders/paid':
      return {
        ...basePayload,
        name: '#1001',
        email: 'customer@example.com',
        financial_status: 'paid',
        fulfillment_status: null,
        total_price: '29.99',
        currency: 'USD',
        customer: {
          id: 123456789,
          first_name: 'John',
          last_name: 'Doe',
          email: 'customer@example.com',
        },
        line_items: [
          {
            id: 111111111,
            title: 'Test Product',
            quantity: 1,
            price: '24.99',
            variant_id: 987654321,
          },
        ],
        ...data,
      };

    case 'customers/create':
    case 'customers/update':
      return {
        ...basePayload,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1987654321',
        accepts_marketing: true,
        state: 'enabled',
        tags: 'vip,test',
        orders_count: 5,
        total_spent: '149.95',
        ...data,
      };

    default:
      return {
        ...basePayload,
        ...data,
      };
  }
};

// Mock API rate limit headers
export const createMockRateLimitHeaders = (remaining = 39, limit = 40) => ({
  'X-Shopify-Shop-Api-Call-Limit': `${limit - remaining}/${limit}`,
  'Retry-After': remaining === 0 ? '2.0' : undefined,
});

// Test data generators
export const generateMockProducts = (count = 5) => {
  return Array.from({ length: count }, (_, index) =>
    createMockProduct({
      id: `gid://shopify/Product/${123456789 + index}`,
      title: `Test Product ${index + 1}`,
      handle: `test-product-${index + 1}`,
    })
  );
};

export const generateMockOrders = (count = 5) => {
  return Array.from({ length: count }, (_, index) =>
    createMockOrder({
      id: `gid://shopify/Order/${123456789 + index}`,
      name: `#${1001 + index}`,
    })
  );
};

export const generateMockCustomers = (count = 5) => {
  return Array.from({ length: count }, (_, index) =>
    createMockCustomer({
      id: `gid://shopify/Customer/${123456789 + index}`,
      firstName: `Customer${index + 1}`,
      email: `customer${index + 1}@example.com`,
    })
  );
};

// Error simulation helpers
export const createMockGraphQLError = (message: string, code?: string) => ({
  message,
  extensions: {
    code: code || 'INTERNAL_ERROR',
    exception: {
      stacktrace: ['Error: ' + message, '    at test (test.js:1:1)'],
    },
  },
});

export const createMockAPIError = (status: number, message: string) => ({
  errors: {
    base: [message],
  },
  status,
  message,
});

// Performance testing helpers
export const measurePerformance = async (fn: () => Promise<any>) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    duration: end - start,
  };
};

// Async testing utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const waitForElement = async (selector: string, timeout = 5000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await waitFor(100);
  }
  throw new Error(`Element ${selector} not found within ${timeout}ms`);
};

// Form testing helpers
export const fillForm = (form: HTMLFormElement, data: Record<string, string>) => {
  Object.entries(data).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
};

export const submitForm = (form: HTMLFormElement) => {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
};

// Local storage testing helpers
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() {
      return { ...store };
    },
  };
}; 