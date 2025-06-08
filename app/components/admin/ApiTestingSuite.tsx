import React, { useState } from 'react';
import {
  Card,
  Layout,
  Page,
  Tabs,
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
  ButtonGroup,
} from '@shopify/polaris';

// Types for API testing
interface ApiRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: Date;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
  timestamp: Date;
}

interface TestResult {
  request: ApiRequest;
  response?: ApiResponse;
  error?: string;
  id: string;
}

// Shopify API templates
const SHOPIFY_TEMPLATES = {
  products: {
    'Get Products': {
      method: 'GET' as const,
      url: '/admin/api/2024-01/products.json',
      body: '',
    },
    'Create Product': {
      method: 'POST' as const,
      url: '/admin/api/2024-01/products.json',
      body: JSON.stringify({
        product: {
          title: 'New Product',
          body_html: '<p>Product description</p>',
          vendor: 'Your Store',
          product_type: 'Type',
          status: 'draft',
        },
      }, null, 2),
    },
  },
  orders: {
    'Get Orders': {
      method: 'GET' as const,
      url: '/admin/api/2024-01/orders.json',
      body: '',
    },
  },
  customers: {
    'Get Customers': {
      method: 'GET' as const,
      url: '/admin/api/2024-01/customers.json',
      body: '',
    },
  },
};

// GraphQL queries
const GRAPHQL_TEMPLATES = {
  'Get Products with Variants': `query getProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        title
        handle
        status
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              inventoryQuantity
            }
          }
        }
      }
    }
  }
}`,
  'Create Product': `mutation productCreate($input: ProductInput!) {
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
}`,
};

export function ApiTestingSuite() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // REST API state
  const [restMethod, setRestMethod] = useState('GET');
  const [restUrl, setRestUrl] = useState('');
  const [restHeaders, setRestHeaders] = useState('{\n  "Content-Type": "application/json",\n  "X-Shopify-Access-Token": "your-access-token"\n}');
  const [restBody, setRestBody] = useState('');
  const [restResponse, setRestResponse] = useState<string>('');

  // GraphQL state
  const [graphqlQuery, setGraphqlQuery] = useState('');
  const [graphqlVariables, setGraphqlVariables] = useState('{}');
  const [graphqlResponse, setGraphqlResponse] = useState<string>('');

  // JavaScript playground state
  const [jsCode, setJsCode] = useState(`// Shopify Admin API Example
const shopifyApi = {
  async getProducts() {
    const response = await fetch('/admin/api/2024-01/products.json', {
      headers: {
        'X-Shopify-Access-Token': 'your-access-token',
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};

// Execute the function
shopifyApi.getProducts()
  .then(data => console.log('Products:', data))
  .catch(error => console.error('Error:', error));`);
  const [jsOutput, setJsOutput] = useState<string>('');

  const tabs = [
    {
      id: 'rest',
      content: 'REST API',
      accessibilityLabel: 'REST API testing',
      panelID: 'rest-panel',
    },
    {
      id: 'graphql',
      content: 'GraphQL',
      accessibilityLabel: 'GraphQL testing',
      panelID: 'graphql-panel',
    },
    {
      id: 'javascript',
      content: 'JavaScript',
      accessibilityLabel: 'JavaScript playground',
      panelID: 'javascript-panel',
    },
    {
      id: 'webhooks',
      content: 'Webhooks',
      accessibilityLabel: 'Webhook testing',
      panelID: 'webhooks-panel',
    },
  ];

  // Execute REST API request
  const executeRestRequest = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      let headers: Record<string, string> = {};
      try {
        headers = JSON.parse(restHeaders);
      } catch (e) {
        throw new Error('Invalid JSON in headers');
      }

      const requestOptions: RequestInit = {
        method: restMethod,
        headers,
      };

      if (restMethod !== 'GET' && restBody) {
        requestOptions.body = restBody;
      }

      const response = await fetch(restUrl, requestOptions);
      const data = await response.json();
      const duration = Date.now() - startTime;

      const result: TestResult = {
        id: Date.now().toString(),
        request: {
          id: Date.now().toString(),
          method: restMethod as any,
          url: restUrl,
          headers,
          body: restBody,
          timestamp: new Date(),
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data,
          duration,
          timestamp: new Date(),
        },
      };

      setTestHistory(prev => [result, ...prev]);
      setRestResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      const result: TestResult = {
        id: Date.now().toString(),
        request: {
          id: Date.now().toString(),
          method: restMethod as any,
          url: restUrl,
          headers: {},
          body: restBody,
          timestamp: new Date(),
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      setTestHistory(prev => [result, ...prev]);
      setRestResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute GraphQL query
  const executeGraphqlQuery = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      let variables = {};
      try {
        variables = JSON.parse(graphqlVariables);
      } catch (e) {
        throw new Error('Invalid JSON in variables');
      }

      const response = await fetch('/admin/api/2024-01/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': 'your-access-token',
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables,
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      const result: TestResult = {
        id: Date.now().toString(),
        request: {
          id: Date.now().toString(),
          method: 'POST',
          url: '/admin/api/2024-01/graphql.json',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': 'your-access-token',
          },
          body: JSON.stringify({ query: graphqlQuery, variables }, null, 2),
          timestamp: new Date(),
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data,
          duration,
          timestamp: new Date(),
        },
      };

      setTestHistory(prev => [result, ...prev]);
      setGraphqlResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      const result: TestResult = {
        id: Date.now().toString(),
        request: {
          id: Date.now().toString(),
          method: 'POST',
          url: '/admin/api/2024-01/graphql.json',
          headers: {},
          body: graphqlQuery,
          timestamp: new Date(),
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      setTestHistory(prev => [result, ...prev]);
      setGraphqlResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute JavaScript code
  const executeJavaScript = async () => {
    setIsLoading(true);
    try {
      // Create a safe execution environment
      const originalConsole = console.log;
      const logs: string[] = [];
      
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      // Execute the code
      const result = eval(jsCode);
      
      // Restore console
      console.log = originalConsole;
      
      setJsOutput(logs.join('\n') || (result !== undefined ? String(result) : 'Code executed successfully'));
    } catch (error) {
      setJsOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load template
  const loadTemplate = (category: string, template: string) => {
    const categoryTemplates = SHOPIFY_TEMPLATES[category as keyof typeof SHOPIFY_TEMPLATES];
    if (categoryTemplates && template in categoryTemplates) {
      const templateData = categoryTemplates[template as keyof typeof categoryTemplates];
      setRestMethod(templateData.method);
      setRestUrl(templateData.url);
      setRestBody(templateData.body);
    }
  };

  // Load GraphQL template
  const loadGraphqlTemplate = (template: string) => {
    const query = GRAPHQL_TEMPLATES[template as keyof typeof GRAPHQL_TEMPLATES];
    if (query) {
      setGraphqlQuery(query);
    }
  };

  // Render REST API panel
  const renderRestPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">Request Configuration</Text>
            <InlineStack gap="200">
              <div style={{ width: '120px' }}>
                <Select
                  label="Method"
                  options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' },
                    { label: 'PUT', value: 'PUT' },
                    { label: 'DELETE', value: 'DELETE' },
                    { label: 'PATCH', value: 'PATCH' },
                  ]}
                  value={restMethod}
                  onChange={setRestMethod}
                />
              </div>
              <div style={{ flex: 1 }}>
                <TextField
                  label="URL"
                  value={restUrl}
                  onChange={setRestUrl}
                  placeholder="/admin/api/2024-01/products.json"
                  autoComplete="off"
                />
              </div>
            </InlineStack>
          </BlockStack>
        </Box>
      </Card>

      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">Templates</Text>
            <InlineStack gap="200" wrap>
              {Object.entries(SHOPIFY_TEMPLATES).map(([category, templates]) => (
                <ButtonGroup key={category} variant="segmented">
                  {Object.keys(templates).map(template => (
                    <Button
                      key={template}
                      onClick={() => loadTemplate(category, template)}
                      size="slim"
                    >
                      {template}
                    </Button>
                  ))}
                </ButtonGroup>
              ))}
            </InlineStack>
          </BlockStack>
        </Box>
      </Card>

      <Layout>
        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Headers</Text>
                <TextField
                  label=""
                  value={restHeaders}
                  onChange={setRestHeaders}
                  multiline={6}
                  autoComplete="off"
                />
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Request Body</Text>
                <TextField
                  label=""
                  value={restBody}
                  onChange={setRestBody}
                  multiline={6}
                  autoComplete="off"
                />
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>

      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <InlineStack gap="200">
              <Button
                variant="primary"
                onClick={executeRestRequest}
                loading={isLoading}
              >
                Send Request
              </Button>
              <Button onClick={() => setShowHistory(true)}>
                View History ({testHistory.length})
              </Button>
            </InlineStack>
            
            <Divider />
            
            <Text as="h3" variant="headingMd">Response</Text>
            <TextField
              label=""
              value={restResponse}
              multiline={10}
              readOnly
              autoComplete="off"
            />
          </BlockStack>
        </Box>
      </Card>
    </BlockStack>
  );

  // Render GraphQL panel
  const renderGraphqlPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">GraphQL Templates</Text>
            <InlineStack gap="200" wrap>
              {Object.keys(GRAPHQL_TEMPLATES).map(template => (
                <Button
                  key={template}
                  onClick={() => loadGraphqlTemplate(template)}
                  size="slim"
                >
                  {template}
                </Button>
              ))}
            </InlineStack>
          </BlockStack>
        </Box>
      </Card>

      <Layout>
        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Query</Text>
                <TextField
                  label=""
                  value={graphqlQuery}
                  onChange={setGraphqlQuery}
                  multiline={10}
                  autoComplete="off"
                />
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Variables</Text>
                <TextField
                  label=""
                  value={graphqlVariables}
                  onChange={setGraphqlVariables}
                  multiline={10}
                  autoComplete="off"
                />
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>

      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Button
              variant="primary"
              onClick={executeGraphqlQuery}
              loading={isLoading}
            >
              Execute Query
            </Button>
            
            <Divider />
            
            <Text as="h3" variant="headingMd">Response</Text>
            <TextField
              label=""
              value={graphqlResponse}
              multiline={10}
              readOnly
              autoComplete="off"
            />
          </BlockStack>
        </Box>
      </Card>
    </BlockStack>
  );

  // Render JavaScript panel
  const renderJavaScriptPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">JavaScript Playground</Text>
            <Banner>
              <p>Write JavaScript code to interact with Shopify APIs. Use console.log() to output results.</p>
            </Banner>
          </BlockStack>
        </Box>
      </Card>

      <Layout>
        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Code</Text>
                <TextField
                  label=""
                  value={jsCode}
                  onChange={setJsCode}
                  multiline={15}
                  autoComplete="off"
                />
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Output</Text>
                <TextField
                  label=""
                  value={jsOutput}
                  multiline={15}
                  readOnly
                  autoComplete="off"
                />
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>

      <Card>
        <Box padding="400">
          <Button
            variant="primary"
            onClick={executeJavaScript}
            loading={isLoading}
          >
            Run Code
          </Button>
        </Box>
      </Card>
    </BlockStack>
  );

  // Render webhooks panel
  const renderWebhooksPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">Webhook Testing</Text>
            <Banner>
              <p>Test webhook payloads and simulate Shopify webhook events.</p>
            </Banner>
            <Text as="p">Coming soon: Webhook payload simulation and testing tools.</Text>
          </BlockStack>
        </Box>
      </Card>
    </BlockStack>
  );

  // Render test history modal
  const renderHistoryModal = () => (
    <Modal
      open={showHistory}
      onClose={() => setShowHistory(false)}
      title="Test History"
      large
    >
      <Modal.Section>
        <Scrollable style={{ height: '500px' }}>
          <BlockStack gap="300">
            {testHistory.map((result) => (
              <Card key={result.id}>
                <Box padding="300">
                  <BlockStack gap="200">
                    <InlineStack gap="200" align="space-between">
                      <Badge tone={result.error ? 'critical' : 'success'}>
                        {result.error ? 'Error' : `${result.response?.status}`}
                      </Badge>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {result.request.timestamp.toLocaleTimeString()}
                      </Text>
                    </InlineStack>
                    <Text as="p" variant="bodyMd">
                      {result.request.method} {result.request.url}
                    </Text>
                    {result.response && (
                      <Text as="p" variant="bodySm" tone="subdued">
                        Duration: {result.response.duration}ms
                      </Text>
                    )}
                    {result.error && (
                      <Text as="p" variant="bodySm" tone="critical">
                        {result.error}
                      </Text>
                    )}
                  </BlockStack>
                </Box>
              </Card>
            ))}
          </BlockStack>
        </Scrollable>
      </Modal.Section>
    </Modal>
  );

  return (
    <Page title="API Testing Suite">
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
              <Box padding="400">
                {selectedTab === 0 && renderRestPanel()}
                {selectedTab === 1 && renderGraphqlPanel()}
                {selectedTab === 2 && renderJavaScriptPanel()}
                {selectedTab === 3 && renderWebhooksPanel()}
              </Box>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
      {renderHistoryModal()}
    </Page>
  );
} 