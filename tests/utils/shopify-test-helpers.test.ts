/**
 * Tests for Shopify Test Helpers
 * Verifies that the test utilities are working correctly
 */

import { describe, it, expect } from 'vitest';
import {
  createMockSession,
  createMockProduct,
  createMockOrder,
  createMockCustomer,
  createMockGraphQLResponse,
  createMockRESTResponse,
  generateMockProducts,
  createMockWebhookPayload,
  createMockRateLimitHeaders,
} from './shopify-test-helpers';

describe('Shopify Test Helpers', () => {
  describe('Mock Data Creation', () => {
    it('creates a mock session with default values', () => {
      const session = createMockSession();
      
      expect(session.id).toBe('test-session-id');
      expect(session.shop).toBe('test-shop.myshopify.com');
      expect(session.accessToken).toBe('test-access-token');
      expect(session.isOnline).toBe(true);
    });

    it('creates a mock session with overrides', () => {
      const session = createMockSession({
        shop: 'custom-shop.myshopify.com',
        accessToken: 'custom-token',
      });
      
      expect(session.shop).toBe('custom-shop.myshopify.com');
      expect(session.accessToken).toBe('custom-token');
      expect(session.id).toBe('test-session-id'); // Default value preserved
    });

    it('creates a mock product with default values', () => {
      const product = createMockProduct();
      
      expect(product.id).toBe('gid://shopify/Product/123456789');
      expect(product.title).toBe('Test Product');
      expect(product.handle).toBe('test-product');
      expect(product.status).toBe('ACTIVE');
      expect(product.variants.edges).toHaveLength(1);
    });

    it('creates a mock product with overrides', () => {
      const product = createMockProduct({
        title: 'Custom Product',
        handle: 'custom-product',
        status: 'DRAFT',
      });
      
      expect(product.title).toBe('Custom Product');
      expect(product.handle).toBe('custom-product');
      expect(product.status).toBe('DRAFT');
    });

    it('creates a mock order with default values', () => {
      const order = createMockOrder();
      
      expect(order.id).toBe('gid://shopify/Order/123456789');
      expect(order.name).toBe('#1001');
      expect(order.financialStatus).toBe('PAID');
      expect(order.totalPrice).toBe('29.99');
      expect(order.lineItems.edges).toHaveLength(1);
    });

    it('creates a mock customer with default values', () => {
      const customer = createMockCustomer();
      
      expect(customer.id).toBe('gid://shopify/Customer/123456789');
      expect(customer.firstName).toBe('Jane');
      expect(customer.lastName).toBe('Smith');
      expect(customer.email).toBe('jane.smith@example.com');
      expect(customer.state).toBe('ENABLED');
    });
  });

  describe('Mock Response Creation', () => {
    it('creates a GraphQL response with data', async () => {
      const mockData = { products: { edges: [] } };
      const response = createMockGraphQLResponse(mockData);
      
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data).toEqual(mockData);
      expect(data.extensions.cost).toBeDefined();
    });

    it('creates a GraphQL response with errors', async () => {
      const mockErrors = [{ message: 'Test error', extensions: { code: 'TEST_ERROR' } }];
      const response = createMockGraphQLResponse(null, mockErrors);
      
      const data = await response.json();
      expect(data.data).toBeNull();
      expect(data.errors).toEqual(mockErrors);
    });

    it('creates a REST response with data', async () => {
      const mockData = { products: [] };
      const response = createMockRESTResponse(mockData);
      
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual(mockData);
    });

    it('creates a REST response with error status', async () => {
      const mockData = { error: 'Not found' };
      const response = createMockRESTResponse(mockData, 404);
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data).toEqual(mockData);
    });
  });

  describe('Data Generators', () => {
    it('generates multiple mock products', () => {
      const products = generateMockProducts(5);
      
      expect(products).toHaveLength(5);
      expect(products[0].title).toBe('Test Product 1');
      expect(products[1].title).toBe('Test Product 2');
      expect(products[4].title).toBe('Test Product 5');
      
      // Each product should have unique ID
      const ids = products.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('generates products with default count', () => {
      const products = generateMockProducts();
      expect(products).toHaveLength(5); // Default count
    });
  });

  describe('Webhook Payload Creation', () => {
    it('creates product creation webhook payload', () => {
      const payload = createMockWebhookPayload('products/create');
      
      expect(payload.id).toBeDefined();
      expect(payload.title).toBe('Test Product');
      expect(payload.handle).toBe('test-product');
      expect(payload.status).toBe('active');
      expect(payload.variants).toHaveLength(1);
      expect(payload.created_at).toBeDefined();
    });

    it('creates order creation webhook payload', () => {
      const payload = createMockWebhookPayload('orders/create');
      
      expect(payload.id).toBeDefined();
      expect(payload.name).toBe('#1001');
      expect(payload.financial_status).toBe('paid');
      expect(payload.total_price).toBe('29.99');
      expect(payload.line_items).toHaveLength(1);
    });

    it('creates customer creation webhook payload', () => {
      const payload = createMockWebhookPayload('customers/create');
      
      expect(payload.id).toBeDefined();
      expect(payload.first_name).toBe('Jane');
      expect(payload.last_name).toBe('Smith');
      expect(payload.email).toBe('jane.smith@example.com');
      expect(payload.state).toBe('enabled');
    });

    it('creates generic webhook payload for unknown topic', () => {
      const payload = createMockWebhookPayload('unknown/topic', { custom: 'data' });
      
      expect(payload.id).toBeDefined();
      expect(payload.created_at).toBeDefined();
      expect(payload.custom).toBe('data');
    });

    it('allows custom data overrides', () => {
      const payload = createMockWebhookPayload('products/create', {
        title: 'Custom Product Title',
        price: '99.99',
      });
      
      expect(payload.title).toBe('Custom Product Title');
      expect(payload.price).toBe('99.99');
      expect(payload.handle).toBe('test-product'); // Default preserved
    });
  });

  describe('Utility Functions', () => {
    it('creates mock rate limit headers', () => {
      const headers = createMockRateLimitHeaders(30, 40);
      expect(headers['X-Shopify-Shop-Api-Call-Limit']).toBe('10/40');
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('creates mock rate limit headers when limit reached', () => {
      const headers = createMockRateLimitHeaders(0, 40);
      expect(headers['X-Shopify-Shop-Api-Call-Limit']).toBe('40/40');
      expect(headers['Retry-After']).toBe('2.0');
    });
  });
}); 