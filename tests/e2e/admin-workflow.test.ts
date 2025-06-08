/**
 * Admin Workflow E2E Tests
 * End-to-end tests for complete admin user journeys and workflows
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  createMockSession,
  createMockProduct,
  generateMockProducts,
  waitFor,
  waitForElement,
} from '../utils/shopify-test-helpers';

// Mock browser environment for E2E tests
const mockBrowser = {
  navigate: (url: string) => {
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  },
  
  click: (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.click();
    }
  },
  
  type: (selector: string, text: string) => {
    const element = document.querySelector(selector) as HTMLInputElement;
    if (element) {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  },
  
  waitForSelector: async (selector: string, timeout = 5000) => {
    return waitForElement(selector, timeout);
  },
};

describe('Admin Workflow E2E Tests', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Mock authentication
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        session: createMockSession(),
        authenticated: true,
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication Flow', () => {
    it('completes OAuth installation flow', async () => {
      // Simulate OAuth redirect
      const authUrl = '/auth?shop=test-shop.myshopify.com';
      mockBrowser.navigate(authUrl);

      // Wait for authentication to complete
      await waitFor(100);

      // Should redirect to admin dashboard
      expect(window.location.pathname).toBe('/admin');
    });

    it('handles authentication errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const authUrl = '/auth?shop=invalid-shop';
      mockBrowser.navigate(authUrl);

      await waitFor(100);

      // Should show error message
      const errorElement = await mockBrowser.waitForSelector('.error-message');
      expect(errorElement).toBeTruthy();
    });
  });

  describe('Navigation Workflow', () => {
    it('navigates through all main sections', async () => {
      // Start at dashboard
      mockBrowser.navigate('/admin');
      await mockBrowser.waitForSelector('[data-testid="admin-dashboard"]');

      // Navigate to Products
      mockBrowser.click('[data-navigation="products"]');
      await mockBrowser.waitForSelector('[data-testid="products-page"]');
      expect(window.location.pathname).toBe('/admin/products');

      // Navigate to Orders
      mockBrowser.click('[data-navigation="orders"]');
      await mockBrowser.waitForSelector('[data-testid="orders-page"]');
      expect(window.location.pathname).toBe('/admin/orders');

      // Navigate to Customers
      mockBrowser.click('[data-navigation="customers"]');
      await mockBrowser.waitForSelector('[data-testid="customers-page"]');
      expect(window.location.pathname).toBe('/admin/customers');

      // Navigate to Analytics
      mockBrowser.click('[data-navigation="analytics"]');
      await mockBrowser.waitForSelector('[data-testid="analytics-page"]');
      expect(window.location.pathname).toBe('/admin/analytics');
    });

    it('navigates through developer tools', async () => {
      mockBrowser.navigate('/admin');

      // Navigate to API Testing
      mockBrowser.click('[data-navigation="api-testing"]');
      await mockBrowser.waitForSelector('[data-testid="api-testing-page"]');
      expect(window.location.pathname).toBe('/admin/api-testing');

      // Navigate to API Explorer
      mockBrowser.click('[data-navigation="api-explorer"]');
      await mockBrowser.waitForSelector('[data-testid="api-explorer-page"]');
      expect(window.location.pathname).toBe('/admin/api-explorer');

      // Navigate to Webhook Tester
      mockBrowser.click('[data-navigation="webhook-tester"]');
      await mockBrowser.waitForSelector('[data-testid="webhook-tester-page"]');
      expect(window.location.pathname).toBe('/admin/webhook-tester');

      // Navigate to Logging System
      mockBrowser.click('[data-navigation="logging"]');
      await mockBrowser.waitForSelector('[data-testid="logging-page"]');
      expect(window.location.pathname).toBe('/admin/logging');
    });
  });

  describe('Product Management Workflow', () => {
    it('creates a new product end-to-end', async () => {
      // Mock successful product creation
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ products: generateMockProducts(5) }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({ 
            product: createMockProduct({ 
              title: 'New E2E Product',
              handle: 'new-e2e-product' 
            })
          }),
        });

      // Navigate to products page
      mockBrowser.navigate('/admin/products');
      await mockBrowser.waitForSelector('[data-testid="products-page"]');

      // Click "Add Product" button
      mockBrowser.click('[data-testid="add-product-button"]');
      await mockBrowser.waitForSelector('[data-testid="product-form"]');

      // Fill in product details
      mockBrowser.type('[name="title"]', 'New E2E Product');
      mockBrowser.type('[name="description"]', 'A product created via E2E test');
      mockBrowser.type('[name="vendor"]', 'E2E Vendor');
      mockBrowser.type('[name="productType"]', 'E2E Type');

      // Add variant details
      mockBrowser.type('[name="price"]', '29.99');
      mockBrowser.type('[name="sku"]', 'E2E-SKU-001');
      mockBrowser.type('[name="inventory"]', '100');

      // Submit form
      mockBrowser.click('[data-testid="save-product-button"]');

      // Wait for success message
      await mockBrowser.waitForSelector('[data-testid="success-toast"]');

      // Verify product was created
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/api/2024-01/products'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New E2E Product'),
        })
      );
    });

    it('edits an existing product', async () => {
      const existingProduct = createMockProduct({
        id: 'gid://shopify/Product/123456789',
        title: 'Existing Product',
      });

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ products: [existingProduct] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ product: existingProduct }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            product: { ...existingProduct, title: 'Updated Product' }
          }),
        });

      // Navigate to products page
      mockBrowser.navigate('/admin/products');
      await mockBrowser.waitForSelector('[data-testid="products-page"]');

      // Click edit button for first product
      mockBrowser.click('[data-testid="edit-product-123456789"]');
      await mockBrowser.waitForSelector('[data-testid="product-form"]');

      // Update product title
      mockBrowser.type('[name="title"]', 'Updated Product');

      // Save changes
      mockBrowser.click('[data-testid="save-product-button"]');

      // Wait for success message
      await mockBrowser.waitForSelector('[data-testid="success-toast"]');

      // Verify product was updated
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/api/2024-01/products/123456789'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('Updated Product'),
        })
      );
    });

    it('deletes a product with confirmation', async () => {
      const productToDelete = createMockProduct({
        id: 'gid://shopify/Product/123456789',
        title: 'Product to Delete',
      });

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ products: [productToDelete] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 204,
          json: async () => ({}),
        });

      // Navigate to products page
      mockBrowser.navigate('/admin/products');
      await mockBrowser.waitForSelector('[data-testid="products-page"]');

      // Click delete button
      mockBrowser.click('[data-testid="delete-product-123456789"]');

      // Confirm deletion in modal
      await mockBrowser.waitForSelector('[data-testid="delete-confirmation-modal"]');
      mockBrowser.click('[data-testid="confirm-delete-button"]');

      // Wait for success message
      await mockBrowser.waitForSelector('[data-testid="success-toast"]');

      // Verify product was deleted
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/api/2024-01/products/123456789'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('API Testing Workflow', () => {
    it('tests GraphQL query in API testing suite', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            products: {
              edges: generateMockProducts(3).map(p => ({ node: p })),
            },
          },
        }),
      });

      // Navigate to API testing page
      mockBrowser.navigate('/admin/api-testing');
      await mockBrowser.waitForSelector('[data-testid="api-testing-page"]');

      // Switch to GraphQL tab
      mockBrowser.click('[data-testid="graphql-tab"]');
      await mockBrowser.waitForSelector('[data-testid="graphql-editor"]');

      // Enter GraphQL query
      const query = `
        query GetProducts($first: Int!) {
          products(first: $first) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }
      `;

      mockBrowser.type('[data-testid="graphql-query-editor"]', query);
      mockBrowser.type('[data-testid="graphql-variables-editor"]', '{"first": 3}');

      // Execute query
      mockBrowser.click('[data-testid="execute-query-button"]');

      // Wait for results
      await mockBrowser.waitForSelector('[data-testid="query-results"]');

      // Verify query was executed
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/api/2024-01/graphql'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('GetProducts'),
        })
      );
    });

    it('tests REST API endpoint', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ products: generateMockProducts(5) }),
      });

      // Navigate to API testing page
      mockBrowser.navigate('/admin/api-testing');
      await mockBrowser.waitForSelector('[data-testid="api-testing-page"]');

      // Switch to REST tab
      mockBrowser.click('[data-testid="rest-tab"]');
      await mockBrowser.waitForSelector('[data-testid="rest-client"]');

      // Configure REST request
      mockBrowser.click('[data-testid="http-method-select"]');
      mockBrowser.click('[data-testid="method-get"]');
      
      mockBrowser.type('[data-testid="endpoint-input"]', '/admin/api/2024-01/products.json');

      // Execute request
      mockBrowser.click('[data-testid="send-request-button"]');

      // Wait for response
      await mockBrowser.waitForSelector('[data-testid="response-panel"]');

      // Verify request was sent
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/api/2024-01/products.json'),
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('Webhook Testing Workflow', () => {
    it('tests webhook payload simulation', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ received: true, processed: true }),
      });

      // Navigate to webhook tester
      mockBrowser.navigate('/admin/webhook-tester');
      await mockBrowser.waitForSelector('[data-testid="webhook-tester-page"]');

      // Select webhook topic
      mockBrowser.click('[data-testid="webhook-topic-select"]');
      mockBrowser.click('[data-testid="topic-products-create"]');

      // Configure endpoint
      mockBrowser.type('[data-testid="webhook-endpoint-input"]', 'https://example.com/webhooks/products/create');

      // Use template payload
      mockBrowser.click('[data-testid="use-template-button"]');
      await mockBrowser.waitForSelector('[data-testid="payload-editor"]');

      // Send webhook
      mockBrowser.click('[data-testid="send-webhook-button"]');

      // Wait for response
      await mockBrowser.waitForSelector('[data-testid="webhook-response"]');

      // Verify webhook was sent
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/webhooks/products/create',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Shopify-Topic': 'products/create',
          }),
        })
      );
    });
  });

  describe('Logging System Workflow', () => {
    it('streams and filters logs in real-time', async () => {
      // Navigate to logging system
      mockBrowser.navigate('/admin/logging');
      await mockBrowser.waitForSelector('[data-testid="logging-page"]');

      // Start log streaming
      mockBrowser.click('[data-testid="start-streaming-button"]');

      // Wait for streaming to start
      await mockBrowser.waitForSelector('[data-testid="streaming-indicator"]');

      // Apply filters
      mockBrowser.click('[data-testid="filter-level-error"]');
      mockBrowser.type('[data-testid="search-logs-input"]', 'payment');

      // Wait for filtered results
      await waitFor(500);

      // Verify streaming is active
      const streamingIndicator = document.querySelector('[data-testid="streaming-indicator"]');
      expect(streamingIndicator?.textContent).toContain('Streaming');

      // Stop streaming
      mockBrowser.click('[data-testid="stop-streaming-button"]');

      // Verify streaming stopped
      await waitFor(100);
      expect(streamingIndicator?.textContent).toContain('Stopped');
    });

    it('exports logs in different formats', async () => {
      // Mock download functionality
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      global.URL.createObjectURL = mockCreateObjectURL;

      // Navigate to logging system
      mockBrowser.navigate('/admin/logging');
      await mockBrowser.waitForSelector('[data-testid="logging-page"]');

      // Switch to export tab
      mockBrowser.click('[data-testid="export-tab"]');
      await mockBrowser.waitForSelector('[data-testid="export-panel"]');

      // Export as JSON
      mockBrowser.click('[data-testid="export-json-button"]');

      // Verify download was triggered
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  describe('Error Handling Workflows', () => {
    it('handles API errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      // Navigate to products page
      mockBrowser.navigate('/admin/products');

      // Wait for error message
      await mockBrowser.waitForSelector('[data-testid="error-banner"]');

      // Verify error is displayed
      const errorBanner = document.querySelector('[data-testid="error-banner"]');
      expect(errorBanner?.textContent).toContain('Internal server error');
    });

    it('handles network connectivity issues', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      // Navigate to products page
      mockBrowser.navigate('/admin/products');

      // Wait for network error message
      await mockBrowser.waitForSelector('[data-testid="network-error"]');

      // Verify network error is displayed
      const networkError = document.querySelector('[data-testid="network-error"]');
      expect(networkError?.textContent).toContain('Network error');
    });
  });

  describe('Performance Workflows', () => {
    it('loads pages within acceptable time limits', async () => {
      const pages = [
        '/admin',
        '/admin/products',
        '/admin/orders',
        '/admin/customers',
        '/admin/analytics',
        '/admin/api-testing',
        '/admin/api-explorer',
        '/admin/webhook-tester',
        '/admin/logging',
      ];

      for (const page of pages) {
        const start = performance.now();
        
        mockBrowser.navigate(page);
        await mockBrowser.waitForSelector('[data-testid*="page"]');
        
        const loadTime = performance.now() - start;
        
        // Pages should load within 2 seconds
        expect(loadTime).toBeLessThan(2000);
      }
    });

    it('handles large datasets efficiently', async () => {
      // Mock large dataset
      const largeProductSet = generateMockProducts(1000);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ products: largeProductSet }),
      });

      const start = performance.now();
      
      mockBrowser.navigate('/admin/products');
      await mockBrowser.waitForSelector('[data-testid="products-table"]');
      
      const renderTime = performance.now() - start;
      
      // Should handle large datasets within reasonable time
      expect(renderTime).toBeLessThan(5000);
    });
  });
}); 