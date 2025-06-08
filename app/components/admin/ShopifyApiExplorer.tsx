import React, { useState, useEffect } from 'react';
import {
  Card,
  Layout,
  Page,
  Text,
  Button,
  TextField,
  Select,
  Banner,
  Box,
  InlineStack,
  BlockStack,
  Divider,
  Badge,
  Collapsible,
  List,
  Link,
  Tabs,
  DataTable,
  Tooltip,
} from '@shopify/polaris';
import { ChevronDownIcon, ChevronUpIcon, ExternalIcon } from '@shopify/polaris-icons';

// Shopify API endpoints with documentation
const SHOPIFY_ENDPOINTS = {
  products: {
    name: 'Products',
    description: 'Manage products in your store',
    endpoints: [
      {
        method: 'GET',
        path: '/admin/api/2024-01/products.json',
        description: 'Retrieve a list of products',
        parameters: [
          { name: 'limit', type: 'integer', description: 'Amount of results (default: 50, maximum: 250)' },
          { name: 'since_id', type: 'string', description: 'Restrict results to after the specified ID' },
          { name: 'title', type: 'string', description: 'Show products with given title' },
          { name: 'vendor', type: 'string', description: 'Show products with given vendor' },
          { name: 'handle', type: 'string', description: 'Show products with given handle' },
          { name: 'product_type', type: 'string', description: 'Show products with given product type' },
          { name: 'status', type: 'string', description: 'Show products with given status (active, archived, draft)' },
          { name: 'published_status', type: 'string', description: 'Show products with given published status' },
        ],
        example: {
          request: 'GET /admin/api/2024-01/products.json?limit=10&status=active',
          response: {
            products: [
              {
                id: 632910392,
                title: 'IPod Nano - 8GB',
                body_html: '<p>It\'s the small iPod with one very big idea...</p>',
                vendor: 'Apple',
                product_type: 'Cult Products',
                created_at: '2024-01-01T12:00:00-05:00',
                handle: 'ipod-nano',
                updated_at: '2024-01-01T12:00:00-05:00',
                published_at: '2007-12-31T19:00:00-05:00',
                template_suffix: null,
                status: 'active',
                published_scope: 'web',
                tags: 'Emotive, Flash Memory, MP3, Music',
                admin_graphql_api_id: 'gid://shopify/Product/632910392',
                variants: [],
                options: [],
                images: [],
                image: null,
              },
            ],
          },
        },
      },
      {
        method: 'GET',
        path: '/admin/api/2024-01/products/{product_id}.json',
        description: 'Retrieve a single product',
        parameters: [
          { name: 'product_id', type: 'string', required: true, description: 'The ID of the product' },
          { name: 'fields', type: 'string', description: 'Show only certain fields, specified by a comma-separated list' },
        ],
        example: {
          request: 'GET /admin/api/2024-01/products/632910392.json',
          response: {
            product: {
              id: 632910392,
              title: 'IPod Nano - 8GB',
              body_html: '<p>It\'s the small iPod with one very big idea...</p>',
              vendor: 'Apple',
              product_type: 'Cult Products',
              created_at: '2024-01-01T12:00:00-05:00',
              handle: 'ipod-nano',
              updated_at: '2024-01-01T12:00:00-05:00',
              published_at: '2007-12-31T19:00:00-05:00',
              template_suffix: null,
              status: 'active',
              published_scope: 'web',
              tags: 'Emotive, Flash Memory, MP3, Music',
              admin_graphql_api_id: 'gid://shopify/Product/632910392',
              variants: [],
              options: [],
              images: [],
              image: null,
            },
          },
        },
      },
      {
        method: 'POST',
        path: '/admin/api/2024-01/products.json',
        description: 'Create a new product',
        parameters: [
          { name: 'product', type: 'object', required: true, description: 'The product object' },
        ],
        example: {
          request: {
            product: {
              title: 'Burton Custom Freestyle 151',
              body_html: '<strong>Good snowboard!</strong>',
              vendor: 'Burton',
              product_type: 'Snowboard',
              status: 'draft',
            },
          },
          response: {
            product: {
              id: 1071559748,
              title: 'Burton Custom Freestyle 151',
              body_html: '<strong>Good snowboard!</strong>',
              vendor: 'Burton',
              product_type: 'Snowboard',
              created_at: '2024-01-01T12:00:00-05:00',
              handle: 'burton-custom-freestyle-151',
              updated_at: '2024-01-01T12:00:00-05:00',
              published_at: null,
              template_suffix: null,
              status: 'draft',
              published_scope: 'web',
              tags: '',
              admin_graphql_api_id: 'gid://shopify/Product/1071559748',
              variants: [],
              options: [],
              images: [],
              image: null,
            },
          },
        },
      },
    ],
  },
  orders: {
    name: 'Orders',
    description: 'Manage orders and transactions',
    endpoints: [
      {
        method: 'GET',
        path: '/admin/api/2024-01/orders.json',
        description: 'Retrieve a list of orders',
        parameters: [
          { name: 'limit', type: 'integer', description: 'Amount of results (default: 50, maximum: 250)' },
          { name: 'since_id', type: 'string', description: 'Restrict results to after the specified ID' },
          { name: 'status', type: 'string', description: 'Filter orders by status (open, closed, cancelled, any)' },
          { name: 'financial_status', type: 'string', description: 'Filter orders by financial status' },
          { name: 'fulfillment_status', type: 'string', description: 'Filter orders by fulfillment status' },
        ],
        example: {
          request: 'GET /admin/api/2024-01/orders.json?status=open&limit=5',
          response: {
            orders: [
              {
                id: 450789469,
                admin_graphql_api_id: 'gid://shopify/Order/450789469',
                app_id: null,
                browser_ip: '0.0.0.0',
                buyer_accepts_marketing: false,
                cancel_reason: null,
                cancelled_at: null,
                cart_token: '68778783ad298f1c80c3bafcddeea02f',
                checkout_id: 901414060,
                checkout_token: '1ce5a3a7f9107846689106d72fbd55ad',
                closed_at: null,
                confirmed: true,
                contact_email: 'jon@doe.ca',
                created_at: '2008-01-10T11:00:00-05:00',
                currency: 'USD',
                current_subtotal_price: '195.67',
                current_subtotal_price_set: {
                  shop_money: {
                    amount: '195.67',
                    currency_code: 'USD',
                  },
                  presentment_money: {
                    amount: '195.67',
                    currency_code: 'USD',
                  },
                },
                current_total_discounts: '3.33',
                current_total_discounts_set: {
                  shop_money: {
                    amount: '3.33',
                    currency_code: 'USD',
                  },
                  presentment_money: {
                    amount: '3.33',
                    currency_code: 'USD',
                  },
                },
                current_total_duties_set: null,
                current_total_price: '199.65',
                current_total_price_set: {
                  shop_money: {
                    amount: '199.65',
                    currency_code: 'USD',
                  },
                  presentment_money: {
                    amount: '199.65',
                    currency_code: 'USD',
                  },
                },
                current_total_tax: '3.98',
                current_total_tax_set: {
                  shop_money: {
                    amount: '3.98',
                    currency_code: 'USD',
                  },
                  presentment_money: {
                    amount: '3.98',
                    currency_code: 'USD',
                  },
                },
                customer_locale: null,
                device_id: null,
                discount_codes: [],
                email: 'jon@doe.ca',
                estimated_taxes: false,
                financial_status: 'partially_refunded',
                fulfillment_status: null,
                gateway: 'authorize_net',
                landing_site: 'http://www.example.com?source=abc',
                landing_site_ref: 'abc',
                location_id: null,
                name: '#1001',
                note: null,
                note_attributes: [
                  {
                    name: 'custom engraving',
                    value: 'Happy Birthday',
                  },
                  {
                    name: 'colour',
                    value: 'green',
                  },
                ],
                number: 1,
                order_number: 1001,
                order_status_url: 'https://jsmith.myshopify.com/548380009/orders/b1946ac92492d2347c6235b4d2611184/authenticate?key=imasecretipod',
                original_total_duties_set: null,
                payment_gateway_names: [
                  'bogus',
                ],
                phone: '+557734881234',
                presentment_currency: 'USD',
                processed_at: '2008-01-10T11:00:00-05:00',
                processing_method: 'direct',
                reference: 'fhwdgads',
                referring_site: 'http://www.otherexample.com',
                source_identifier: 'fhwdgads',
                source_name: 'web',
                source_url: null,
                subtotal_price: '597.00',
                subtotal_price_set: {
                  shop_money: {
                    amount: '597.00',
                    currency_code: 'USD',
                  },
                  presentment_money: {
                    amount: '597.00',
                    currency_code: 'USD',
                  },
                },
                tags: '',
                tax_lines: [
                  {
                    price: '11.94',
                    rate: 0.06,
                    title: 'State Tax',
                    price_set: {
                      shop_money: {
                        amount: '11.94',
                        currency_code: 'USD',
                      },
                      presentment_money: {
                        amount: '11.94',
                        currency_code: 'USD',
                      },
                    },
                    channel_liable: null,
                  },
                ],
                taxes_included: false,
                test: false,
                token: 'b1946ac92492d2347c6235b4d2611184',
                total_discounts: '10.00',
                total_discounts_set: {
                  shop_money: {
                    amount: '10.00',
                    currency_code: 'USD',
                  },
                  presentment_money: {
                    amount: '10.00',
                    currency_code: 'USD',
                  },
                },
                total_line_items_price: '597.00',
                total_line_items_price_set: {
                  shop_money: {
                    amount: '597.00',
                    currency_code: 'USD',
                  },
                  presentment_money: {
                    amount: '597.00',
                    currency_code: 'USD',
                  },
                },
                total_outstanding: '0.00',
                total_price: '598.94',
                total_price_set: {
                  shop_money: {
                    amount: '598.94',
                    currency_code: 'USD',
                  },
                  presentment_money: {
                    amount: '598.94',
                    currency_code: 'USD',
                  },
                },
                total_price_usd: '598.94',
                total_shipping_price_set: {
                  shop_money: {
                    amount: '0.00',
                    currency_code: 'USD',
                  },
                  presentment_money: {
                    amount: '0.00',
                    currency_code: 'USD',
                  },
                },
                total_tax: '11.94',
                total_tax_set: {
                  shop_money: {
                    amount: '11.94',
                    currency_code: 'USD',
                  },
                  presentment_money: {
                    amount: '11.94',
                    currency_code: 'USD',
                  },
                },
                total_tip_received: '0.00',
                total_weight: 0,
                updated_at: '2008-01-10T11:00:00-05:00',
                user_id: null,
                billing_address: {
                  first_name: 'Bob',
                  address1: 'Chestnut Street 92',
                  phone: '+1(502)-459-2181',
                  city: 'Louisville',
                  zip: '40202',
                  province: 'Kentucky',
                  country: 'United States',
                  last_name: 'Norman',
                  address2: '',
                  company: null,
                  latitude: 45.41634,
                  longitude: -75.6868,
                  name: 'Bob Norman',
                  country_code: 'US',
                  province_code: 'KY',
                },
                customer: {
                  id: 207119551,
                  email: 'jon@doe.ca',
                  accepts_marketing: false,
                  created_at: '2024-01-01T12:00:00-05:00',
                  updated_at: '2024-01-01T12:00:00-05:00',
                  first_name: 'Jon',
                  last_name: 'Doe',
                  orders_count: 1,
                  state: 'disabled',
                  total_spent: '199.65',
                  last_order_id: 450789469,
                  note: null,
                  verified_email: true,
                  multipass_identifier: null,
                  tax_exempt: false,
                  phone: '+13125551212',
                  tags: 'loyal',
                  last_order_name: '#1001',
                  currency: 'USD',
                  accepts_marketing_updated_at: '2005-06-12T11:57:11-04:00',
                  marketing_opt_in_level: null,
                  tax_exemptions: [],
                  admin_graphql_api_id: 'gid://shopify/Customer/207119551',
                  default_address: {
                    id: 207119551,
                    customer_id: 207119551,
                    first_name: null,
                    last_name: null,
                    company: null,
                    address1: 'Chestnut Street 92',
                    address2: '',
                    city: 'Louisville',
                    province: 'Kentucky',
                    country: 'United States',
                    zip: '40202',
                    phone: '555-625-1199',
                    name: '',
                    province_code: 'KY',
                    country_code: 'US',
                    country_name: 'United States',
                    default: true,
                  },
                },
                discount_applications: [],
                fulfillments: [],
                line_items: [
                  {
                    id: 466157049,
                    admin_graphql_api_id: 'gid://shopify/LineItem/466157049',
                    fulfillable_quantity: 0,
                    fulfillment_service: 'manual',
                    fulfillment_status: null,
                    gift_card: false,
                    grams: 200,
                    name: 'IPod Nano - 8gb - green',
                    origin_location: {
                      id: 905684977,
                      country_code: 'US',
                      province_code: 'KY',
                      name: 'Apple Api Shipwire',
                      address1: 'Chestnut Street 92',
                      address2: '',
                      city: 'Louisville',
                      zip: '40202',
                    },
                    presentment_title: 'IPod Nano - 8gb',
                    presentment_variant_title: 'green',
                    product_id: 632910392,
                    product_exists: true,
                    quantity: 1,
                    requires_shipping: true,
                    sku: 'IPOD2008GREEN',
                    taxable: true,
                    title: 'IPod Nano - 8gb',
                    total_discount: '0.00',
                    total_discount_set: {
                      shop_money: {
                        amount: '0.00',
                        currency_code: 'USD',
                      },
                      presentment_money: {
                        amount: '0.00',
                        currency_code: 'USD',
                      },
                    },
                    variant_id: 39072856,
                    variant_inventory_management: 'shopify',
                    variant_title: 'green',
                    vendor: null,
                    tax_lines: [
                      {
                        channel_liable: null,
                        price: '3.98',
                        price_set: {
                          shop_money: {
                            amount: '3.98',
                            currency_code: 'USD',
                          },
                          presentment_money: {
                            amount: '3.98',
                            currency_code: 'USD',
                          },
                        },
                        rate: 0.06,
                        title: 'State Tax',
                      },
                    ],
                    duties: [],
                    discount_allocations: [
                      {
                        amount: '3.33',
                        amount_set: {
                          shop_money: {
                            amount: '3.33',
                            currency_code: 'USD',
                          },
                          presentment_money: {
                            amount: '3.33',
                            currency_code: 'USD',
                          },
                        },
                        discount_application_index: 0,
                      },
                    ],
                  },
                ],
                payment_terms: null,
                refunds: [
                  {
                    id: 509562969,
                    admin_graphql_api_id: 'gid://shopify/Refund/509562969',
                    created_at: '2024-01-01T12:00:00-05:00',
                    note: 'it broke during shipping',
                    order_id: 450789469,
                    processed_at: '2024-01-01T12:00:00-05:00',
                    restock: true,
                    total_duties_set: {
                      shop_money: {
                        amount: '0.00',
                        currency_code: 'USD',
                      },
                      presentment_money: {
                        amount: '0.00',
                        currency_code: 'USD',
                      },
                    },
                    user_id: 799407056,
                    order_adjustments: [],
                    transactions: [
                      {
                        id: 179259969,
                        admin_graphql_api_id: 'gid://shopify/OrderTransaction/179259969',
                        amount: '209.00',
                        authorization: '53433',
                        created_at: '2005-08-05T12:59:12-04:00',
                        currency: 'USD',
                        device_id: null,
                        error_code: null,
                        gateway: 'bogus',
                        kind: 'refund',
                        location_id: null,
                        message: null,
                        order_id: 450789469,
                        parent_id: 801038806,
                        processed_at: '2005-08-05T12:59:12-04:00',
                        receipt: {},
                        source_name: 'web',
                        status: 'success',
                        test: false,
                        user_id: null,
                      },
                    ],
                    refund_line_items: [
                      {
                        id: 104689539,
                        line_item_id: 703073504,
                        location_id: 487838322,
                        quantity: 1,
                        restock_type: 'legacy_restock',
                        subtotal: '195.66',
                        subtotal_set: {
                          shop_money: {
                            amount: '195.66',
                            currency_code: 'USD',
                          },
                          presentment_money: {
                            amount: '195.66',
                            currency_code: 'USD',
                          },
                        },
                        total_tax: '3.98',
                        total_tax_set: {
                          shop_money: {
                            amount: '3.98',
                            currency_code: 'USD',
                          },
                          presentment_money: {
                            amount: '3.98',
                            currency_code: 'USD',
                          },
                        },
                        line_item: {
                          id: 703073504,
                          admin_graphql_api_id: 'gid://shopify/LineItem/703073504',
                          fulfillable_quantity: 0,
                          fulfillment_service: 'manual',
                          fulfillment_status: null,
                          gift_card: false,
                          grams: 200,
                          name: 'IPod Nano - 8gb - green',
                          origin_location: {
                            id: 905684977,
                            country_code: 'US',
                            province_code: 'KY',
                            name: 'Apple Api Shipwire',
                            address1: 'Chestnut Street 92',
                            address2: '',
                            city: 'Louisville',
                            zip: '40202',
                          },
                          presentment_title: 'IPod Nano - 8gb',
                          presentment_variant_title: 'green',
                          product_id: 632910392,
                          product_exists: true,
                          quantity: 1,
                          requires_shipping: true,
                          sku: 'IPOD2008GREEN',
                          taxable: true,
                          title: 'IPod Nano - 8gb',
                          total_discount: '0.00',
                          total_discount_set: {
                            shop_money: {
                              amount: '0.00',
                              currency_code: 'USD',
                            },
                            presentment_money: {
                              amount: '0.00',
                              currency_code: 'USD',
                            },
                          },
                          variant_id: 39072856,
                          variant_inventory_management: 'shopify',
                          variant_title: 'green',
                          vendor: null,
                          tax_lines: [
                            {
                              channel_liable: null,
                              price: '3.98',
                              price_set: {
                                shop_money: {
                                  amount: '3.98',
                                  currency_code: 'USD',
                                },
                                presentment_money: {
                                  amount: '3.98',
                                  currency_code: 'USD',
                                },
                              },
                              rate: 0.06,
                              title: 'State Tax',
                            },
                          ],
                          duties: [],
                          discount_allocations: [
                            {
                              amount: '3.33',
                              amount_set: {
                                shop_money: {
                                  amount: '3.33',
                                  currency_code: 'USD',
                                },
                                presentment_money: {
                                  amount: '3.33',
                                  currency_code: 'USD',
                                },
                              },
                              discount_application_index: 0,
                            },
                          ],
                        },
                      },
                    ],
                    duties: [],
                  },
                ],
                shipping_address: {
                  first_name: 'Bob',
                  address1: 'Chestnut Street 92',
                  phone: '+1(502)-459-2181',
                  city: 'Louisville',
                  zip: '40202',
                  province: 'Kentucky',
                  country: 'United States',
                  last_name: 'Norman',
                  address2: '',
                  company: null,
                  latitude: 45.41634,
                  longitude: -75.6868,
                  name: 'Bob Norman',
                  country_code: 'US',
                  province_code: 'KY',
                },
                shipping_lines: [
                  {
                    id: 369256396,
                    carrier_identifier: null,
                    code: 'Free Shipping',
                    delivery_category: null,
                    discounted_price: '0.00',
                    discounted_price_set: {
                      shop_money: {
                        amount: '0.00',
                        currency_code: 'USD',
                      },
                      presentment_money: {
                        amount: '0.00',
                        currency_code: 'USD',
                      },
                    },
                    phone: null,
                    price: '0.00',
                    price_set: {
                      shop_money: {
                        amount: '0.00',
                        currency_code: 'USD',
                      },
                      presentment_money: {
                        amount: '0.00',
                        currency_code: 'USD',
                      },
                    },
                    requested_fulfillment_service_id: null,
                    source: 'shopify',
                    title: 'Free Shipping',
                    tax_lines: [],
                    discount_allocations: [],
                  },
                ],
              },
            ],
          },
        },
      },
    ],
  },
  customers: {
    name: 'Customers',
    description: 'Manage customer data and relationships',
    endpoints: [
      {
        method: 'GET',
        path: '/admin/api/2024-01/customers.json',
        description: 'Retrieve a list of customers',
        parameters: [
          { name: 'limit', type: 'integer', description: 'Amount of results (default: 50, maximum: 250)' },
          { name: 'since_id', type: 'string', description: 'Restrict results to after the specified ID' },
          { name: 'created_at_min', type: 'string', description: 'Show customers created after date (format: 2014-04-25T16:15:47-04:00)' },
          { name: 'created_at_max', type: 'string', description: 'Show customers created before date' },
          { name: 'updated_at_min', type: 'string', description: 'Show customers last updated after date' },
          { name: 'updated_at_max', type: 'string', description: 'Show customers last updated before date' },
        ],
        example: {
          request: 'GET /admin/api/2024-01/customers.json?limit=5',
          response: {
            customers: [
              {
                id: 207119551,
                email: 'bob.norman@mail.example',
                accepts_marketing: false,
                created_at: '2024-01-01T12:00:00-05:00',
                updated_at: '2024-01-01T12:00:00-05:00',
                first_name: 'Bob',
                last_name: 'Norman',
                orders_count: 1,
                state: 'disabled',
                total_spent: '199.65',
                last_order_id: 450789469,
                note: null,
                verified_email: true,
                multipass_identifier: null,
                tax_exempt: false,
                phone: '+16136120707',
                tags: '',
                last_order_name: '#1001',
                currency: 'USD',
                accepts_marketing_updated_at: '2005-06-12T11:57:11-04:00',
                marketing_opt_in_level: null,
                tax_exemptions: [],
                admin_graphql_api_id: 'gid://shopify/Customer/207119551',
                default_address: {
                  id: 207119551,
                  customer_id: 207119551,
                  first_name: null,
                  last_name: null,
                  company: null,
                  address1: 'Chestnut Street 92',
                  address2: '',
                  city: 'Louisville',
                  province: 'Kentucky',
                  country: 'United States',
                  zip: '40202',
                  phone: '555-625-1199',
                  name: '',
                  province_code: 'KY',
                  country_code: 'US',
                  country_name: 'United States',
                  default: true,
                },
              },
            ],
          },
        },
      },
    ],
  },
  inventory: {
    name: 'Inventory',
    description: 'Manage inventory levels and locations',
    endpoints: [
      {
        method: 'GET',
        path: '/admin/api/2024-01/inventory_levels.json',
        description: 'Retrieve inventory levels',
        parameters: [
          { name: 'inventory_item_ids', type: 'string', description: 'A comma-separated list of inventory item IDs' },
          { name: 'location_ids', type: 'string', description: 'A comma-separated list of location IDs' },
          { name: 'limit', type: 'integer', description: 'Amount of results (default: 50, maximum: 250)' },
        ],
        example: {
          request: 'GET /admin/api/2024-01/inventory_levels.json?inventory_item_ids=808950810',
          response: {
            inventory_levels: [
              {
                inventory_item_id: 808950810,
                location_id: 905684977,
                available: 25,
                updated_at: '2024-01-01T12:00:00-05:00',
                admin_graphql_api_id: 'gid://shopify/InventoryLevel/808950810?inventory_item_id=808950810',
              },
            ],
          },
        },
      },
    ],
  },
};

interface EndpointDetailsProps {
  endpoint: any;
  onTryIt: (method: string, path: string, example?: any) => void;
}

function EndpointDetails({ endpoint, onTryIt }: EndpointDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'success';
      case 'POST': return 'info';
      case 'PUT': return 'warning';
      case 'DELETE': return 'critical';
      case 'PATCH': return 'attention';
      default: return 'subdued';
    }
  };

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="300">
          <InlineStack gap="200" align="space-between">
            <InlineStack gap="200" align="start">
              <Badge tone={getMethodColor(endpoint.method) as any}>
                {endpoint.method}
              </Badge>
              <Text as="span" variant="bodyMd" fontWeight="medium">
                {endpoint.path}
              </Text>
            </InlineStack>
            <InlineStack gap="200">
              <Button
                size="slim"
                onClick={() => onTryIt(endpoint.method, endpoint.path, endpoint.example)}
              >
                Try it
              </Button>
              <Button
                size="slim"
                icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Less' : 'More'}
              </Button>
            </InlineStack>
          </InlineStack>
          
          <Text as="p" variant="bodySm" tone="subdued">
            {endpoint.description}
          </Text>

          <Collapsible
            open={isExpanded}
            id={`endpoint-${endpoint.method}-${endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
            transition={{ duration: '200ms', timingFunction: 'ease-in-out' }}
          >
            <BlockStack gap="400">
              <Divider />
              
              {endpoint.parameters && endpoint.parameters.length > 0 && (
                <BlockStack gap="200">
                  <Text as="h4" variant="headingSm">Parameters</Text>
                  <DataTable
                    columnContentTypes={['text', 'text', 'text', 'text']}
                    headings={['Name', 'Type', 'Required', 'Description']}
                    rows={endpoint.parameters.map((param: any) => [
                      param.name,
                      param.type,
                      param.required ? 'Yes' : 'No',
                      param.description,
                    ])}
                  />
                </BlockStack>
              )}

              {endpoint.example && (
                <BlockStack gap="200">
                  <Text as="h4" variant="headingSm">Example</Text>
                  <Card background="bg-surface-secondary">
                    <Box padding="300">
                      <BlockStack gap="200">
                        <Text as="span" variant="bodySm" fontWeight="medium">Request:</Text>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                          {typeof endpoint.example.request === 'string' 
                            ? endpoint.example.request 
                            : JSON.stringify(endpoint.example.request, null, 2)}
                        </div>
                        
                        <Text as="span" variant="bodySm" fontWeight="medium">Response:</Text>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(endpoint.example.response, null, 2).substring(0, 500)}
                          {JSON.stringify(endpoint.example.response, null, 2).length > 500 && '...'}
                        </div>
                      </BlockStack>
                    </Box>
                  </Card>
                </BlockStack>
              )}
            </BlockStack>
          </Collapsible>
        </BlockStack>
      </Box>
    </Card>
  );
}

export function ShopifyApiExplorer() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = Object.entries(SHOPIFY_ENDPOINTS).map(([key, category]) => ({
    id: key,
    content: category.name,
    accessibilityLabel: `${category.name} API endpoints`,
    panelID: `${key}-panel`,
  }));

  const handleTryIt = (method: string, path: string, example?: any) => {
    // This would integrate with the API Testing Suite
    console.log('Try endpoint:', { method, path, example });
    // In a real implementation, this would open the API Testing Suite with pre-filled data
  };

  const filteredEndpoints = (endpoints: any[]) => {
    if (!searchQuery) return endpoints;
    return endpoints.filter(endpoint => 
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderCategoryPanel = (categoryKey: string) => {
    const category = SHOPIFY_ENDPOINTS[categoryKey as keyof typeof SHOPIFY_ENDPOINTS];
    const filtered = filteredEndpoints(category.endpoints);

    return (
      <BlockStack gap="400">
        <Card>
          <Box padding="400">
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">{category.name}</Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                {category.description}
              </Text>
              <TextField
                label="Search endpoints"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by path or description..."
                clearButton
                onClearButtonClick={() => setSearchQuery('')}
                autoComplete="off"
              />
            </BlockStack>
          </Box>
        </Card>

        {filtered.length === 0 ? (
          <Card>
            <Box padding="400">
              <Text as="p">No endpoints found matching your search.</Text>
            </Box>
          </Card>
        ) : (
          <BlockStack gap="300">
            {filtered.map((endpoint, index) => (
              <EndpointDetails
                key={`${endpoint.method}-${endpoint.path}-${index}`}
                endpoint={endpoint}
                onTryIt={handleTryIt}
              />
            ))}
          </BlockStack>
        )}
      </BlockStack>
    );
  };

  return (
    <Page
      title="Shopify API Explorer"
      subtitle="Browse and test Shopify Admin API endpoints"
      primaryAction={{
        content: 'View API Documentation',
        url: 'https://shopify.dev/docs/api/admin-rest',
        external: true,
        icon: ExternalIcon,
      }}
    >
      <Layout>
        <Layout.Section>
          <Banner>
            <p>
              Explore Shopify's Admin API endpoints with interactive documentation and examples. 
              Click "Try it" on any endpoint to test it in the API Testing Suite.
            </p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
              <Box padding="400">
                {tabs.map((tab, index) => (
                  selectedTab === index && (
                    <div key={tab.id}>
                      {renderCategoryPanel(tab.id)}
                    </div>
                  )
                ))}
              </Box>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 