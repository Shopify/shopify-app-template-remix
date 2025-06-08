# Comprehensive Testing Guide

## Overview

This Shopify app template includes a robust testing infrastructure built with Vitest, React Testing Library, and Shopify-specific testing utilities. The testing system provides comprehensive coverage for unit tests, integration tests, and end-to-end workflows.

## Testing Stack

### Core Testing Tools
- **Vitest**: Fast unit test runner with TypeScript support
- **React Testing Library**: Component testing with user-centric approach
- **@testing-library/jest-dom**: Custom matchers for DOM testing
- **@testing-library/user-event**: Realistic user interaction simulation
- **jsdom**: Browser environment simulation for Node.js

### Shopify-Specific Testing
- **Custom Test Helpers**: Mock Shopify API responses and App Bridge events
- **Polaris Testing Utilities**: Specialized helpers for Polaris components
- **Authentication Mocking**: Simulate Shopify OAuth and session management
- **Webhook Testing**: Mock webhook payloads and delivery simulation

## Getting Started

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage report
yarn test:coverage

# Run tests with UI interface
yarn test:ui

# Run specific test categories
yarn test:components  # Component tests only
yarn test:api        # API integration tests only
yarn test:e2e        # End-to-end tests only
```

### Test Structure

```
tests/
├── setup.ts                    # Global test configuration
├── utils/
│   ├── shopify-test-helpers.ts # Shopify-specific utilities
│   └── polaris-test-helpers.tsx # Polaris component utilities
├── components/                 # Component unit tests
│   └── AdminLayout.test.tsx
├── api/                       # API integration tests
│   └── shopify-api.test.ts
└── e2e/                       # End-to-end workflow tests
    └── admin-workflow.test.ts
```

## Writing Tests

### Component Testing

```typescript
import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithPolaris } from '../utils/polaris-test-helpers';
import { MyComponent } from '~/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithPolaris(<MyComponent title="Test" />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    renderWithPolaris(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### API Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { 
  createMockGraphQLResponse,
  createMockProduct,
  generateMockProducts 
} from '../utils/shopify-test-helpers';

describe('Shopify API', () => {
  it('fetches products successfully', async () => {
    const mockProducts = generateMockProducts(5);
    const mockResponse = createMockGraphQLResponse({
      products: {
        edges: mockProducts.map(product => ({ node: product }))
      }
    });

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    // Test your API call here
    const response = await fetch('/admin/api/2024-01/graphql.json');
    const data = await response.json();

    expect(data.data.products.edges).toHaveLength(5);
  });
});
```

### E2E Testing

```typescript
import { describe, it, expect } from 'vitest';
import { 
  createMockSession,
  waitFor,
  waitForElement 
} from '../utils/shopify-test-helpers';

describe('Admin Workflow', () => {
  it('completes product creation workflow', async () => {
    // Mock authentication
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ session: createMockSession() })
    });

    // Navigate to products page
    window.history.pushState({}, '', '/admin/products');

    // Wait for page to load
    await waitForElement('[data-testid="products-page"]');

    // Simulate user actions
    const addButton = document.querySelector('[data-testid="add-product"]');
    addButton?.click();

    // Verify workflow completion
    await waitFor(100);
    expect(window.location.pathname).toBe('/admin/products/new');
  });
});
```

## Test Utilities

### Shopify Test Helpers

#### Mock Data Creation

```typescript
import { 
  createMockProduct,
  createMockOrder,
  createMockCustomer,
  generateMockProducts 
} from '../utils/shopify-test-helpers';

// Create single mock objects
const product = createMockProduct({
  title: 'Custom Product',
  price: '29.99'
});

const order = createMockOrder({
  totalPrice: '99.99',
  financialStatus: 'PAID'
});

// Generate multiple mock objects
const products = generateMockProducts(10);
```

#### API Response Mocking

```typescript
import { 
  createMockGraphQLResponse,
  createMockRESTResponse,
  createMockGraphQLError 
} from '../utils/shopify-test-helpers';

// Mock successful GraphQL response
const successResponse = createMockGraphQLResponse({
  products: { edges: [] }
});

// Mock GraphQL error
const errorResponse = createMockGraphQLResponse(null, [
  createMockGraphQLError('Product not found', 'NOT_FOUND')
]);

// Mock REST API response
const restResponse = createMockRESTResponse({
  products: []
}, 200);
```

#### App Bridge Mocking

```typescript
import { 
  createMockAppBridge,
  createMockToast,
  createMockModal 
} from '../utils/shopify-test-helpers';

// Mock App Bridge instance
const mockApp = createMockAppBridge();

// Mock App Bridge actions
const mockToast = createMockToast();
const mockModal = createMockModal();
```

### Polaris Test Helpers

#### Component Rendering

```typescript
import { renderWithPolaris } from '../utils/polaris-test-helpers';

// Render component with Polaris providers
const { container } = renderWithPolaris(
  <MyPolarisComponent />
);

// Render with custom theme
const { container } = renderWithPolaris(
  <MyPolarisComponent />,
  {
    theme: { colorScheme: 'dark' }
  }
);
```

#### User Interactions

```typescript
import { userInteractions } from '../utils/polaris-test-helpers';

// Simulate user interactions
userInteractions.clickButton(buttonElement);
userInteractions.fillTextField(inputElement, 'test value');
userInteractions.selectOption(selectElement, 'option-value');
userInteractions.toggleCheckbox(checkboxElement);
```

#### Accessibility Testing

```typescript
import { testAccessibility } from '../utils/polaris-test-helpers';

// Test component accessibility
await testAccessibility(<MyComponent />);
```

## Testing Patterns

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyCustomHook } from '~/hooks/useMyCustomHook';

describe('useMyCustomHook', () => {
  it('returns expected values', () => {
    const { result } = renderHook(() => useMyCustomHook());
    
    expect(result.current.value).toBe('initial');
  });

  it('updates state correctly', () => {
    const { result } = renderHook(() => useMyCustomHook());
    
    act(() => {
      result.current.setValue('updated');
    });
    
    expect(result.current.value).toBe('updated');
  });
});
```

### Testing Forms

```typescript
import { screen, fireEvent } from '@testing-library/react';
import { renderWithPolaris } from '../utils/polaris-test-helpers';

describe('ProductForm', () => {
  it('validates required fields', async () => {
    renderWithPolaris(<ProductForm />);
    
    // Submit form without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check for validation errors
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    renderWithPolaris(<ProductForm onSubmit={onSubmit} />);
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Product' }
    });
    
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '29.99' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify submission
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Test Product',
        price: '29.99'
      });
    });
  });
});
```

### Testing Async Operations

```typescript
import { waitFor, screen } from '@testing-library/react';

describe('AsyncComponent', () => {
  it('handles loading states', async () => {
    renderWithPolaris(<AsyncComponent />);
    
    // Check loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Data loaded')).toBeInTheDocument();
    });
  });

  it('handles error states', async () => {
    // Mock API error
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));
    
    renderWithPolaris(<AsyncComponent />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
    });
  });
});
```

### Testing Navigation

```typescript
import { MemoryRouter } from 'react-router-dom';

describe('Navigation', () => {
  it('navigates to correct routes', () => {
    renderWithPolaris(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminLayout>
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/products" element={<Products />} />
          </Routes>
        </AdminLayout>
      </MemoryRouter>
    );
    
    // Test navigation
    fireEvent.click(screen.getByText('Products'));
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
  });
});
```

## Mock Services

### MSW (Mock Service Worker) Setup

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';
import { generateMockProducts } from '../utils/shopify-test-helpers';

export const handlers = [
  rest.get('/admin/api/2024-01/products.json', (req, res, ctx) => {
    return res(
      ctx.json({
        products: generateMockProducts(10)
      })
    );
  }),

  rest.post('/admin/api/2024-01/products.json', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        product: createMockProduct()
      })
    );
  }),

  rest.post('/admin/api/2024-01/graphql.json', (req, res, ctx) => {
    return res(
      ctx.json({
        data: {
          products: {
            edges: generateMockProducts(5).map(p => ({ node: p }))
          }
        }
      })
    );
  })
];
```

```typescript
// tests/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Setup MSW server
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

## Performance Testing

### Component Performance

```typescript
import { measureRenderPerformance } from '../utils/polaris-test-helpers';

describe('Performance', () => {
  it('renders large lists efficiently', async () => {
    const largeDataSet = generateMockProducts(1000);
    
    const { renderTime } = await measureRenderPerformance(
      <ProductList products={largeDataSet} />
    );
    
    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });
});
```

### API Performance

```typescript
import { measurePerformance } from '../utils/shopify-test-helpers';

describe('API Performance', () => {
  it('fetches data within acceptable time', async () => {
    const { duration } = await measurePerformance(async () => {
      return fetch('/admin/api/2024-01/products.json');
    });
    
    // Should complete within 500ms
    expect(duration).toBeLessThan(500);
  });
});
```

## Coverage Configuration

### Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Per-file thresholds
        'app/components/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
});
```

### Coverage Reports

```bash
# Generate coverage report
yarn test:coverage

# View HTML coverage report
open coverage/index.html
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Run tests
        run: yarn test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

## Best Practices

### Test Organization

1. **Group Related Tests**: Use `describe` blocks to group related test cases
2. **Clear Test Names**: Use descriptive test names that explain what is being tested
3. **Single Responsibility**: Each test should verify one specific behavior
4. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification phases

### Mock Management

1. **Reset Mocks**: Always reset mocks between tests to avoid interference
2. **Specific Mocks**: Create specific mocks for each test scenario
3. **Mock Boundaries**: Mock external dependencies but not internal logic
4. **Realistic Data**: Use realistic mock data that matches production scenarios

### Performance Considerations

1. **Parallel Execution**: Run tests in parallel when possible
2. **Selective Testing**: Use test patterns to run specific test suites
3. **Mock Heavy Operations**: Mock expensive operations like API calls
4. **Clean Up**: Properly clean up resources after tests

### Accessibility Testing

1. **Screen Reader Testing**: Test with screen reader simulation
2. **Keyboard Navigation**: Verify keyboard accessibility
3. **Color Contrast**: Test color contrast ratios
4. **ARIA Attributes**: Verify proper ARIA labeling

## Troubleshooting

### Common Issues

**Tests failing with "Cannot resolve module":**
```bash
# Check tsconfig paths and vite configuration
# Ensure test setup includes proper module resolution
```

**Polaris components not rendering:**
```bash
# Verify AppProvider is included in test setup
# Check theme and i18n configuration
```

**App Bridge mocks not working:**
```bash
# Ensure App Bridge is properly mocked in setup.ts
# Verify mock implementations match actual API
```

**Async tests timing out:**
```bash
# Increase test timeout in vitest config
# Use proper async/await patterns
# Mock long-running operations
```

### Debug Mode

```bash
# Run tests in debug mode
yarn test --reporter=verbose

# Run specific test file
yarn test AdminLayout.test.tsx

# Run tests matching pattern
yarn test --grep "API"
```

This comprehensive testing system ensures high code quality, reliable functionality, and maintainable test suites for your Shopify app development. 