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
  Modal,
  Scrollable,
  DataTable,
  ButtonGroup,
  Tabs,
  List,
  Collapsible,
} from '@shopify/polaris';
import { Editor } from '@monaco-editor/react';
import { PlayIcon, PauseIcon, DeleteIcon, ViewIcon } from '@shopify/polaris-icons';

// Webhook event types and their payloads
const WEBHOOK_EVENTS = {
  'orders/create': {
    name: 'Order Created',
    description: 'Triggered when a new order is created',
    payload: {
      id: 820982911946154508,
      admin_graphql_api_id: 'gid://shopify/Order/820982911946154508',
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
      current_total_discounts: '3.33',
      current_total_price: '199.65',
      current_total_tax: '3.98',
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
      tags: '',
      taxes_included: false,
      test: false,
      token: 'b1946ac92492d2347c6235b4d2611184',
      total_discounts: '10.00',
      total_line_items_price: '597.00',
      total_outstanding: '0.00',
      total_price: '598.94',
      total_price_usd: '598.94',
      total_tax: '11.94',
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
      },
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
          product_id: 632910392,
          product_exists: true,
          quantity: 1,
          requires_shipping: true,
          sku: 'IPOD2008GREEN',
          taxable: true,
          title: 'IPod Nano - 8gb',
          total_discount: '0.00',
          variant_id: 39072856,
          variant_inventory_management: 'shopify',
          variant_title: 'green',
          vendor: null,
        },
      ],
    },
  },
  'orders/updated': {
    name: 'Order Updated',
    description: 'Triggered when an order is updated',
    payload: {
      id: 820982911946154508,
      admin_graphql_api_id: 'gid://shopify/Order/820982911946154508',
      updated_at: '2024-01-01T12:00:00-05:00',
      financial_status: 'paid',
      fulfillment_status: 'fulfilled',
      // ... similar structure to orders/create
    },
  },
  'orders/paid': {
    name: 'Order Paid',
    description: 'Triggered when an order is paid',
    payload: {
      id: 820982911946154508,
      admin_graphql_api_id: 'gid://shopify/Order/820982911946154508',
      financial_status: 'paid',
      // ... similar structure to orders/create
    },
  },
  'orders/cancelled': {
    name: 'Order Cancelled',
    description: 'Triggered when an order is cancelled',
    payload: {
      id: 820982911946154508,
      admin_graphql_api_id: 'gid://shopify/Order/820982911946154508',
      cancelled_at: '2024-01-01T12:00:00-05:00',
      cancel_reason: 'customer',
      // ... similar structure to orders/create
    },
  },
  'products/create': {
    name: 'Product Created',
    description: 'Triggered when a new product is created',
    payload: {
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
      variants: [
        {
          id: 808950810,
          product_id: 632910392,
          title: 'Pink',
          price: '199.00',
          sku: 'IPOD2008PINK',
          position: 1,
          inventory_policy: 'continue',
          compare_at_price: null,
          fulfillment_service: 'manual',
          inventory_management: 'shopify',
          option1: 'Pink',
          option2: null,
          option3: null,
          created_at: '2024-01-01T12:00:00-05:00',
          updated_at: '2024-01-01T12:00:00-05:00',
          taxable: true,
          barcode: '1234_pink',
          grams: 567,
          image_id: null,
          weight: 1.25,
          weight_unit: 'lb',
          inventory_item_id: 808950810,
          inventory_quantity: 10,
          old_inventory_quantity: 10,
          presentment_prices: [
            {
              price: {
                amount: '199.00',
                currency_code: 'USD',
              },
              compare_at_price: null,
            },
          ],
          admin_graphql_api_id: 'gid://shopify/ProductVariant/808950810',
        },
      ],
      options: [
        {
          id: 594680422,
          product_id: 632910392,
          name: 'Color',
          position: 1,
          values: [
            'Pink',
            'Red',
            'Green',
            'Black',
          ],
        },
      ],
      images: [],
      image: null,
    },
  },
  'products/update': {
    name: 'Product Updated',
    description: 'Triggered when a product is updated',
    payload: {
      id: 632910392,
      title: 'IPod Nano - 8GB (Updated)',
      updated_at: '2024-01-01T12:00:00-05:00',
      // ... similar structure to products/create
    },
  },
  'customers/create': {
    name: 'Customer Created',
    description: 'Triggered when a new customer is created',
    payload: {
      id: 207119551,
      email: 'bob.norman@mail.example',
      accepts_marketing: false,
      created_at: '2024-01-01T12:00:00-05:00',
      updated_at: '2024-01-01T12:00:00-05:00',
      first_name: 'Bob',
      last_name: 'Norman',
      orders_count: 0,
      state: 'disabled',
      total_spent: '0.00',
      last_order_id: null,
      note: null,
      verified_email: true,
      multipass_identifier: null,
      tax_exempt: false,
      phone: '+16136120707',
      tags: '',
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
  },
  'app/uninstalled': {
    name: 'App Uninstalled',
    description: 'Triggered when the app is uninstalled',
    payload: {
      id: 901414060,
      name: 'Super Duper App',
      api_key: 'api_key',
      provider: {
        id: 755357713,
        name: 'Partner Name',
      },
      uninstalled_at: '2024-01-01T12:00:00-05:00',
    },
  },
};

interface WebhookTest {
  id: string;
  event: string;
  url: string;
  payload: any;
  timestamp: Date;
  status?: 'pending' | 'success' | 'error';
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    duration: number;
  };
  error?: string;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  created: Date;
}

export function WebhookTester() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [webhookTests, setWebhookTests] = useState<WebhookTest[]>([]);
  const [webhookEndpoints, setWebhookEndpoints] = useState<WebhookEndpoint[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showEndpointModal, setShowEndpointModal] = useState(false);

  // Test webhook form state
  const [testEvent, setTestEvent] = useState('orders/create');
  const [testUrl, setTestUrl] = useState('https://your-app.com/webhooks');
  const [testPayload, setTestPayload] = useState('');
  const [customHeaders, setCustomHeaders] = useState('{\n  "X-Shopify-Topic": "orders/create",\n  "X-Shopify-Shop-Domain": "your-shop.myshopify.com",\n  "X-Shopify-Webhook-Id": "webhook-id"\n}');

  // Endpoint form state
  const [endpointUrl, setEndpointUrl] = useState('');
  const [endpointEvents, setEndpointEvents] = useState<string[]>([]);
  const [endpointSecret, setEndpointSecret] = useState('');

  const tabs = [
    {
      id: 'test',
      content: 'Test Webhooks',
      accessibilityLabel: 'Test webhook endpoints',
      panelID: 'test-panel',
    },
    {
      id: 'endpoints',
      content: 'Manage Endpoints',
      accessibilityLabel: 'Manage webhook endpoints',
      panelID: 'endpoints-panel',
    },
    {
      id: 'history',
      content: 'Test History',
      accessibilityLabel: 'Webhook test history',
      panelID: 'history-panel',
    },
    {
      id: 'listener',
      content: 'Webhook Listener',
      accessibilityLabel: 'Listen for incoming webhooks',
      panelID: 'listener-panel',
    },
  ];

  useEffect(() => {
    // Load default payload when event changes
    const eventData = WEBHOOK_EVENTS[testEvent as keyof typeof WEBHOOK_EVENTS];
    if (eventData) {
      setTestPayload(JSON.stringify(eventData.payload, null, 2));
    }
  }, [testEvent]);

  // Send test webhook
  const sendTestWebhook = async () => {
    const testId = Date.now().toString();
    let payload;
    
    try {
      payload = JSON.parse(testPayload);
    } catch (e) {
      alert('Invalid JSON payload');
      return;
    }

    let headers;
    try {
      headers = JSON.parse(customHeaders);
    } catch (e) {
      alert('Invalid JSON headers');
      return;
    }

    const test: WebhookTest = {
      id: testId,
      event: testEvent,
      url: testUrl,
      payload,
      timestamp: new Date(),
      status: 'pending',
    };

    setWebhookTests(prev => [test, ...prev]);

    try {
      const startTime = Date.now();
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: testPayload,
      });

      const responseBody = await response.text();
      const duration = Date.now() - startTime;

      setWebhookTests(prev => prev.map(t => 
        t.id === testId 
          ? {
              ...t,
              status: response.ok ? 'success' : 'error',
              response: {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                body: responseBody,
                duration,
              },
            }
          : t
      ));
    } catch (error) {
      setWebhookTests(prev => prev.map(t => 
        t.id === testId 
          ? {
              ...t,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
            }
          : t
      ));
    }
  };

  // Add webhook endpoint
  const addWebhookEndpoint = () => {
    if (!endpointUrl || endpointEvents.length === 0) {
      alert('Please provide URL and select at least one event');
      return;
    }

    const endpoint: WebhookEndpoint = {
      id: Date.now().toString(),
      url: endpointUrl,
      events: endpointEvents,
      isActive: true,
      secret: endpointSecret || undefined,
      created: new Date(),
    };

    setWebhookEndpoints(prev => [...prev, endpoint]);
    setEndpointUrl('');
    setEndpointEvents([]);
    setEndpointSecret('');
    setShowEndpointModal(false);
  };

  // Toggle endpoint active status
  const toggleEndpoint = (id: string) => {
    setWebhookEndpoints(prev => prev.map(endpoint => 
      endpoint.id === id 
        ? { ...endpoint, isActive: !endpoint.isActive }
        : endpoint
    ));
  };

  // Delete endpoint
  const deleteEndpoint = (id: string) => {
    setWebhookEndpoints(prev => prev.filter(endpoint => endpoint.id !== id));
  };

  // Render test webhooks panel
  const renderTestPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">Send Test Webhook</Text>
            <Banner>
              <p>Send webhook payloads to your endpoints for testing and debugging.</p>
            </Banner>
          </BlockStack>
        </Box>
      </Card>

      <Layout>
        <Layout.Section oneThird>
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h4" variant="headingMd">Configuration</Text>
                
                <Select
                  label="Webhook Event"
                  options={Object.entries(WEBHOOK_EVENTS).map(([key, event]) => ({
                    label: event.name,
                    value: key,
                  }))}
                  value={testEvent}
                  onChange={setTestEvent}
                />

                <TextField
                  label="Webhook URL"
                  value={testUrl}
                  onChange={setTestUrl}
                  placeholder="https://your-app.com/webhooks"
                  autoComplete="off"
                />

                <Text as="p" variant="bodySm" tone="subdued">
                  {WEBHOOK_EVENTS[testEvent as keyof typeof WEBHOOK_EVENTS]?.description}
                </Text>

                <Button
                  primary
                  onClick={sendTestWebhook}
                  disabled={!testUrl || !testPayload}
                >
                  Send Webhook
                </Button>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section twoThirds>
          <BlockStack gap="300">
            <Card>
              <Box padding="400">
                <BlockStack gap="300">
                  <Text as="h4" variant="headingMd">Headers</Text>
                  <div style={{ height: '150px' }}>
                    <Editor
                      height="150px"
                      defaultLanguage="json"
                      value={customHeaders}
                      onChange={(value) => setCustomHeaders(value || '')}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>
                </BlockStack>
              </Box>
            </Card>

            <Card>
              <Box padding="400">
                <BlockStack gap="300">
                  <Text as="h4" variant="headingMd">Payload</Text>
                  <div style={{ height: '300px' }}>
                    <Editor
                      height="300px"
                      defaultLanguage="json"
                      value={testPayload}
                      onChange={(value) => setTestPayload(value || '')}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>
                </BlockStack>
              </Box>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </BlockStack>
  );

  // Render endpoints panel
  const renderEndpointsPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <InlineStack gap="200" align="space-between">
              <Text as="h3" variant="headingMd">Webhook Endpoints</Text>
              <Button
                primary
                onClick={() => setShowEndpointModal(true)}
              >
                Add Endpoint
              </Button>
            </InlineStack>
            <Banner>
              <p>Manage your webhook endpoints and the events they subscribe to.</p>
            </Banner>
          </BlockStack>
        </Box>
      </Card>

      {webhookEndpoints.length === 0 ? (
        <Card>
          <Box padding="400">
            <Text>No webhook endpoints configured. Add one to get started.</Text>
          </Box>
        </Card>
      ) : (
        <BlockStack gap="300">
          {webhookEndpoints.map((endpoint) => (
            <Card key={endpoint.id}>
              <Box padding="400">
                <BlockStack gap="300">
                  <InlineStack gap="200" align="space-between">
                    <InlineStack gap="200" align="start">
                      <Badge tone={endpoint.isActive ? 'success' : 'subdued'}>
                        {endpoint.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Text variant="bodyMd" fontWeight="medium">
                        {endpoint.url}
                      </Text>
                    </InlineStack>
                    <ButtonGroup>
                      <Button
                        size="slim"
                        onClick={() => toggleEndpoint(endpoint.id)}
                        icon={endpoint.isActive ? PauseIcon : PlayIcon}
                      >
                        {endpoint.isActive ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        size="slim"
                        tone="critical"
                        onClick={() => deleteEndpoint(endpoint.id)}
                        icon={DeleteIcon}
                      >
                        Delete
                      </Button>
                    </ButtonGroup>
                  </InlineStack>

                  <Text variant="bodySm" tone="subdued">
                    Events: {endpoint.events.join(', ')}
                  </Text>

                  <Text variant="bodySm" tone="subdued">
                    Created: {endpoint.created.toLocaleString()}
                  </Text>

                  {endpoint.secret && (
                    <Text variant="bodySm" tone="subdued">
                      Secret configured
                    </Text>
                  )}
                </BlockStack>
              </Box>
            </Card>
          ))}
        </BlockStack>
      )}
    </BlockStack>
  );

  // Render history panel
  const renderHistoryPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <InlineStack gap="200" align="space-between">
              <Text variant="headingMd">Test History</Text>
              <Button
                onClick={() => setWebhookTests([])}
                disabled={webhookTests.length === 0}
              >
                Clear History
              </Button>
            </InlineStack>
            <Text variant="bodySm" tone="subdued">
              {webhookTests.length} test{webhookTests.length !== 1 ? 's' : ''} performed
            </Text>
          </BlockStack>
        </Box>
      </Card>

      {webhookTests.length === 0 ? (
        <Card>
          <Box padding="400">
            <Text>No webhook tests performed yet.</Text>
          </Box>
        </Card>
      ) : (
        <BlockStack gap="300">
          {webhookTests.map((test) => (
            <Card key={test.id}>
              <Box padding="400">
                <BlockStack gap="300">
                  <InlineStack gap="200" align="space-between">
                    <InlineStack gap="200" align="start">
                      <Badge 
                        tone={
                          test.status === 'success' ? 'success' : 
                          test.status === 'error' ? 'critical' : 
                          'attention'
                        }
                      >
                        {test.status === 'success' && test.response ? 
                          `${test.response.status}` : 
                          test.status || 'pending'}
                      </Badge>
                      <Text variant="bodyMd" fontWeight="medium">
                        {test.event}
                      </Text>
                    </InlineStack>
                    <Text variant="bodySm" tone="subdued">
                      {test.timestamp.toLocaleTimeString()}
                    </Text>
                  </InlineStack>

                  <Text variant="bodySm">
                    {test.url}
                  </Text>

                  {test.response && (
                    <Text variant="bodySm" tone="subdued">
                      Duration: {test.response.duration}ms
                    </Text>
                  )}

                  {test.error && (
                    <Text variant="bodySm" tone="critical">
                      Error: {test.error}
                    </Text>
                  )}

                  <Collapsible
                    open={false}
                    id={`test-details-${test.id}`}
                    transition={{ duration: '200ms', timingFunction: 'ease-in-out' }}
                  >
                    <BlockStack gap="200">
                      <Divider />
                      <Text variant="bodySm" fontWeight="medium">Request Payload:</Text>
                      <Text variant="bodySm" fontFamily="mono">
                        {JSON.stringify(test.payload, null, 2).substring(0, 200)}...
                      </Text>
                      
                      {test.response && (
                        <>
                          <Text variant="bodySm" fontWeight="medium">Response:</Text>
                          <Text variant="bodySm" fontFamily="mono">
                            {test.response.body.substring(0, 200)}
                            {test.response.body.length > 200 && '...'}
                          </Text>
                        </>
                      )}
                    </BlockStack>
                  </Collapsible>
                </BlockStack>
              </Box>
            </Card>
          ))}
        </BlockStack>
      )}
    </BlockStack>
  );

  // Render listener panel
  const renderListenerPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text variant="headingMd">Webhook Listener</Text>
            <Banner>
              <p>
                Start a local webhook listener to capture and inspect incoming webhooks. 
                This is useful for debugging webhook payloads during development.
              </p>
            </Banner>
            
            <InlineStack gap="200">
              <Button
                primary={!isListening}
                tone={isListening ? 'critical' : undefined}
                onClick={() => setIsListening(!isListening)}
                icon={isListening ? PauseIcon : PlayIcon}
              >
                {isListening ? 'Stop Listener' : 'Start Listener'}
              </Button>
              
              {isListening && (
                <Badge tone="success">
                  Listening on http://localhost:3001/webhooks
                </Badge>
              )}
            </InlineStack>

            {isListening && (
              <Card background="bg-surface-secondary">
                <Box padding="300">
                  <BlockStack gap="200">
                    <Text variant="bodySm" fontWeight="medium">
                      Listener Configuration:
                    </Text>
                    <List>
                      <List.Item>URL: http://localhost:3001/webhooks</List.Item>
                      <List.Item>Method: POST</List.Item>
                      <List.Item>Content-Type: application/json</List.Item>
                    </List>
                    <Text variant="bodySm" tone="subdued">
                      Configure your Shopify app to send webhooks to this URL for testing.
                    </Text>
                  </BlockStack>
                </Box>
              </Card>
            )}
          </BlockStack>
        </Box>
      </Card>

      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text variant="headingMd">Captured Webhooks</Text>
            <Text variant="bodySm" tone="subdued">
              Incoming webhooks will appear here when the listener is active.
            </Text>
            
            {/* This would show captured webhooks in a real implementation */}
            <Text variant="bodySm">
              No webhooks captured yet. Start the listener and send a test webhook.
            </Text>
          </BlockStack>
        </Box>
      </Card>
    </BlockStack>
  );

  // Render add endpoint modal
  const renderEndpointModal = () => (
    <Modal
      open={showEndpointModal}
      onClose={() => setShowEndpointModal(false)}
      title="Add Webhook Endpoint"
      primaryAction={{
        content: 'Add Endpoint',
        onAction: addWebhookEndpoint,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: () => setShowEndpointModal(false),
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <TextField
            label="Endpoint URL"
            value={endpointUrl}
            onChange={setEndpointUrl}
            placeholder="https://your-app.com/webhooks"
            autoComplete="off"
          />

          <Text variant="bodyMd" fontWeight="medium">
            Select Events:
          </Text>
          
          <BlockStack gap="200">
            {Object.entries(WEBHOOK_EVENTS).map(([key, event]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={endpointEvents.includes(key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEndpointEvents(prev => [...prev, key]);
                    } else {
                      setEndpointEvents(prev => prev.filter(event => event !== key));
                    }
                  }}
                />
                <Text variant="bodySm">
                  {event.name} ({key})
                </Text>
              </label>
            ))}
          </BlockStack>

          <TextField
            label="Webhook Secret (Optional)"
            value={endpointSecret}
            onChange={setEndpointSecret}
            placeholder="your-webhook-secret"
            type="password"
            autoComplete="off"
            helpText="Used to verify webhook authenticity"
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );

  return (
    <Page title="Webhook Tester">
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
              <Box padding="400">
                {selectedTab === 0 && renderTestPanel()}
                {selectedTab === 1 && renderEndpointsPanel()}
                {selectedTab === 2 && renderHistoryPanel()}
                {selectedTab === 3 && renderListenerPanel()}
              </Box>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
      {renderEndpointModal()}
    </Page>
  );
} 