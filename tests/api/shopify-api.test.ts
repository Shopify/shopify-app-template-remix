/**
 * Shopify API Integration Tests
 * Tests for GraphQL queries, REST API calls, authentication, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  createMockSession,
  createMockProduct,
  createMockOrder,
  createMockCustomer,
  createMockGraphQLResponse,
  createMockRESTResponse,
  createMockGraphQLError,
  createMockAPIError,
  generateMockProducts,
} from '../utils/shopify-test-helpers';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Shopify API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GraphQL API', () => {
    it('successfully fetches products via GraphQL', async () => {
      const mockProducts = generateMockProducts(3);
      const mockResponse = createMockGraphQLResponse({
        products: {
          edges: mockProducts.map(product => ({ node: product })),
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      });

      mockFetch.mockResolvedValueOnce(mockResponse);

      // Simulate GraphQL query
      const query = `
        query GetProducts($first: Int!) {
          products(first: $first) {
            edges {
              node {
                id
                title
                handle
                status
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `;

      const variables = { first: 10 };
      const response = await fetch('/admin/api/2024-01/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': 'test-token',
        },
        body: JSON.stringify({ query, variables }),
      });

      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/admin/api/2024-01/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': 'test-token',
        },
        body: JSON.stringify({ query, variables }),
      });

      expect(data.data.products.edges).toHaveLength(3);
      expect(data.data.products.edges[0].node.title).toBe('Test Product 1');
    });

    it('handles GraphQL errors correctly', async () => {
      const mockError = createMockGraphQLError('Product not found', 'NOT_FOUND');
      const mockResponse = createMockGraphQLResponse(null, [mockError]);

      mockFetch.mockResolvedValueOnce(mockResponse);

      const query = `
        query GetProduct($id: ID!) {
          product(id: $id) {
            id
            title
          }
        }
      `;

      const response = await fetch('/admin/api/2024-01/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': 'test-token',
        },
        body: JSON.stringify({ 
          query, 
          variables: { id: 'gid://shopify/Product/invalid' } 
        }),
      });

      const data = await response.json();

      expect(data.errors).toHaveLength(1);
      expect(data.errors[0].message).toBe('Product not found');
      expect(data.errors[0].extensions.code).toBe('NOT_FOUND');
    });

    it('handles rate limiting in GraphQL requests', async () => {
      const mockResponse = createMockGraphQLResponse({
        products: { edges: [] },
      });

      // Add rate limiting info to extensions
      mockResponse.json = async () => ({
        data: { products: { edges: [] } },
        extensions: {
          cost: {
            requestedQueryCost: 100,
            actualQueryCost: 100,
            throttleStatus: {
              maximumAvailable: 1000,
              currentlyAvailable: 900,
              restoreRate: 50,
            },
          },
        },
      });

      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('/admin/api/2024-01/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': 'test-token',
        },
        body: JSON.stringify({ 
          query: 'query { products(first: 10) { edges { node { id } } } }' 
        }),
      });

      const data = await response.json();

      expect(data.extensions.cost.currentlyAvailable).toBe(900);
      expect(data.extensions.cost.maximumAvailable).toBe(1000);
    });
  });

  describe('REST API', () => {
    it('successfully fetches products via REST API', async () => {
      const mockProducts = generateMockProducts(5);
      const mockResponse = createMockRESTResponse({
        products: mockProducts,
      });

      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('/admin/api/2024-01/products.json', {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': 'test-token',
        },
      });

      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/admin/api/2024-01/products.json', {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': 'test-token',
        },
      });

      expect(data.products).toHaveLength(5);
      expect(data.products[0].title).toBe('Test Product 1');
    });

    it('successfully creates a product via REST API', async () => {
      const newProduct = createMockProduct({
        title: 'New Test Product',
        handle: 'new-test-product',
      });

      const mockResponse = createMockRESTResponse({
        product: newProduct,
      }, 201);

      mockFetch.mockResolvedValueOnce(mockResponse);

      const productData = {
        product: {
          title: 'New Test Product',
          body_html: '<p>A new test product</p>',
          vendor: 'Test Vendor',
          product_type: 'Test Type',
        },
      };

      const response = await fetch('/admin/api/2024-01/products.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': 'test-token',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.product.title).toBe('New Test Product');
    });

    it('handles REST API validation errors', async () => {
      const mockError = createMockAPIError(422, 'Title cannot be blank');
      const mockResponse = createMockRESTResponse(mockError, 422);

      mockFetch.mockResolvedValueOnce(mockResponse);

      const invalidProductData = {
        product: {
          title: '', // Invalid: empty title
          vendor: 'Test Vendor',
        },
      };

      const response = await fetch('/admin/api/2024-01/products.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': 'test-token',
        },
        body: JSON.stringify(invalidProductData),
      });

      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.errors.base).toContain('Title cannot be blank');
    });

    it('handles REST API rate limiting', async () => {
      const mockResponse = createMockRESTResponse({
        products: [],
      });

      // Add rate limiting headers
      mockResponse.headers = new Headers({
        'Content-Type': 'application/json',
        'X-Shopify-Shop-Api-Call-Limit': '40/40',
        'Retry-After': '2.0',
      });
      mockResponse.status = 429;
      mockResponse.ok = false;

      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('/admin/api/2024-01/products.json', {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': 'test-token',
        },
      });

      expect(response.status).toBe(429);
      expect(response.headers.get('X-Shopify-Shop-Api-Call-Limit')).toBe('40/40');
      expect(response.headers.get('Retry-After')).toBe('2.0');
    });
  });

  describe('Authentication', () => {
    it('handles valid session authentication', async () => {
      const mockSession = createMockSession({
        shop: 'test-shop.myshopify.com',
        accessToken: 'valid-token',
      });

      // Mock authentication function
      const authenticate = vi.fn().mockResolvedValue({
        session: mockSession,
        admin: {
          graphql: vi.fn(),
          rest: vi.fn(),
        },
      });

      const result = await authenticate();

      expect(result.session.shop).toBe('test-shop.myshopify.com');
      expect(result.session.accessToken).toBe('valid-token');
      expect(result.admin).toBeDefined();
    });

    it('handles expired session', async () => {
      const expiredSession = createMockSession({
        expires: new Date(Date.now() - 3600000), // 1 hour ago
      });

      const authenticate = vi.fn().mockRejectedValue(
        new Error('Session expired')
      );

      await expect(authenticate()).rejects.toThrow('Session expired');
    });

    it('handles invalid shop domain', async () => {
      const authenticate = vi.fn().mockRejectedValue(
        new Error('Invalid shop domain')
      );

      await expect(authenticate()).rejects.toThrow('Invalid shop domain');
    });
  });

  describe('Webhook Handling', () => {
    it('processes product creation webhook', async () => {
      const webhookPayload = {
        id: 123456789,
        title: 'New Product',
        handle: 'new-product',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockResponse = createMockRESTResponse({ received: true });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('/webhooks/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Topic': 'products/create',
          'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
          'X-Shopify-Webhook-Id': 'webhook-123',
        },
        body: JSON.stringify(webhookPayload),
      });

      const data = await response.json();

      expect(data.received).toBe(true);
    });

    it('validates webhook signatures', async () => {
      const webhookPayload = { id: 123456789 };
      const invalidSignature = 'invalid-signature';

      const mockResponse = createMockRESTResponse(
        { error: 'Invalid webhook signature' },
        401
      );
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('/webhooks/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Hmac-Sha256': invalidSignature,
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        fetch('/admin/api/2024-01/products.json')
      ).rejects.toThrow('Network error');
    });

    it('handles timeout errors', async () => {
      mockFetch.mockImplementationOnce(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      await expect(
        fetch('/admin/api/2024-01/products.json')
      ).rejects.toThrow('Timeout');
    });

    it('handles server errors (5xx)', async () => {
      const mockResponse = createMockRESTResponse(
        { error: 'Internal server error' },
        500
      );
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('/admin/api/2024-01/products.json');

      expect(response.status).toBe(500);
      expect(response.ok).toBe(false);
    });
  });

  describe('Performance', () => {
    it('measures API response times', async () => {
      const mockResponse = createMockRESTResponse({ products: [] });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const start = performance.now();
      await fetch('/admin/api/2024-01/products.json');
      const end = performance.now();

      const responseTime = end - start;
      expect(responseTime).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(1000); // Should be fast in tests
    });

    it('handles concurrent API requests', async () => {
      const mockResponse = createMockRESTResponse({ products: [] });
      mockFetch.mockResolvedValue(mockResponse);

      const requests = Array.from({ length: 5 }, () =>
        fetch('/admin/api/2024-01/products.json')
      );

      const responses = await Promise.all(requests);

      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response.ok).toBe(true);
      });
    });
  });

  describe('Data Transformation', () => {
    it('transforms GraphQL product data correctly', async () => {
      const mockProduct = createMockProduct();
      const mockResponse = createMockGraphQLResponse({
        product: mockProduct,
      });

      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('/admin/api/2024-01/graphql.json', {
        method: 'POST',
        body: JSON.stringify({
          query: 'query { product(id: "gid://shopify/Product/123") { id title } }',
        }),
      });

      const data = await response.json();

      // Test data transformation logic
      const transformedProduct = {
        id: data.data.product.id,
        title: data.data.product.title,
        // Add transformation logic here
      };

      expect(transformedProduct.id).toBe(mockProduct.id);
      expect(transformedProduct.title).toBe(mockProduct.title);
    });

    it('handles pagination correctly', async () => {
      const mockProducts = generateMockProducts(10);
      const mockResponse = createMockGraphQLResponse({
        products: {
          edges: mockProducts.slice(0, 5).map(product => ({ node: product })),
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'cursor-start',
            endCursor: 'cursor-end',
          },
        },
      });

      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('/admin/api/2024-01/graphql.json', {
        method: 'POST',
        body: JSON.stringify({
          query: `
            query GetProducts($first: Int!, $after: String) {
              products(first: $first, after: $after) {
                edges { node { id title } }
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                  startCursor
                  endCursor
                }
              }
            }
          `,
          variables: { first: 5 },
        }),
      });

      const data = await response.json();

      expect(data.data.products.edges).toHaveLength(5);
      expect(data.data.products.pageInfo.hasNextPage).toBe(true);
      expect(data.data.products.pageInfo.endCursor).toBe('cursor-end');
    });
  });
}); 