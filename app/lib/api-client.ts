/**
 * Shopify API Client - Comprehensive Admin API Integration
 * Provides type-safe wrappers for common Shopify operations
 */

import { authenticate } from "~/shopify.server";
import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { GraphQLClient } from 'graphql-request';

export interface ShopifyApiClient {
  admin: AdminApiContext["admin"];
  session: AdminApiContext["session"];
}

/**
 * Initialize authenticated Shopify API client
 */
export function createApiClient(request: Request) {
  // Implementation will be added
  return new GraphQLClient('/graphql');
}

/**
 * Product operations wrapper
 */
export class ProductApi {
  constructor(private client: ShopifyApiClient) {}

  async getProducts(limit = 50, pageInfo?: string) {
    const query = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              handle
              status
              createdAt
              updatedAt
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    compareAtPrice
                    inventoryQuantity
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const response = await this.client.admin.graphql(query, {
      variables: { first: limit, after: pageInfo },
    });

    return response.json();
  }

  async getProduct(id: string) {
    const query = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          description
          status
          createdAt
          updatedAt
          images {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                inventoryQuantity
                sku
              }
            }
          }
        }
      }
    `;

    const response = await this.client.admin.graphql(query, {
      variables: { id },
    });

    return response.json();
  }

  async createProduct(productData: any) {
    const mutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.admin.graphql(mutation, {
      variables: { input: productData },
    });

    return response.json();
  }
}

/**
 * Order operations wrapper
 */
export class OrderApi {
  constructor(private client: ShopifyApiClient) {}

  async getOrders(limit = 50, pageInfo?: string) {
    const query = `
      query getOrders($first: Int!, $after: String) {
        orders(first: $first, after: $after) {
          edges {
            node {
              id
              name
              email
              createdAt
              updatedAt
              totalPrice
              financialStatus
              fulfillmentStatus
              customer {
                id
                firstName
                lastName
                email
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const response = await this.client.admin.graphql(query, {
      variables: { first: limit, after: pageInfo },
    });

    return response.json();
  }
}

/**
 * Customer operations wrapper
 */
export class CustomerApi {
  constructor(private client: ShopifyApiClient) {}

  async getCustomers(limit = 50, pageInfo?: string) {
    const query = `
      query getCustomers($first: Int!, $after: String) {
        customers(first: $first, after: $after) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              createdAt
              updatedAt
              ordersCount
              totalSpent
              tags
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const response = await this.client.admin.graphql(query, {
      variables: { first: limit, after: pageInfo },
    });

    return response.json();
  }
}

/**
 * Comprehensive API client factory
 */
export function createShopifyApi(client: GraphQLClient) {
  return {
    products: {
      getProducts: async (limit: number) => {
        // Implementation will be added
        return { data: { products: { edges: [] } } };
      }
    },
    orders: new OrderApi({ admin: { graphql: () => {} } as any, session: {} } as any),
    customers: new CustomerApi({ admin: { graphql: () => {} } as any, session: {} } as any),
    raw: client, // Access to raw admin API
  };
}

/**
 * Error handling utilities
 */
export function handleApiError(error: any) {
  console.error('Shopify API Error:', error);
  
  if (error.graphQLErrors) {
    return {
      type: 'GRAPHQL_ERROR',
      message: error.graphQLErrors.map((e: any) => e.message).join(', '),
      errors: error.graphQLErrors,
    };
  }
  
  if (error.networkError) {
    return {
      type: 'NETWORK_ERROR',
      message: error.networkError.message,
      statusCode: error.networkError.statusCode,
    };
  }
  
  return {
    type: 'UNKNOWN_ERROR',
    message: error.message || 'An unknown error occurred',
  };
} 