# Development Logging System Guide

## Overview

The Development Logging System provides comprehensive real-time logging, monitoring, and debugging capabilities for your Shopify app. It captures logs from all parts of your application including admin interface, API calls, webhooks, App Bridge events, and system operations.

## Features

### 🔴 Live Log Streaming
- Real-time log capture with WebSocket connection
- Automatic log generation and streaming
- Configurable streaming intervals
- Auto-scroll to latest logs

### 🔍 Advanced Filtering & Search
- Filter by log level (debug, info, warn, error)
- Filter by source (admin, storefront, api, webhooks, app-bridge, system)
- Full-text search in log messages
- Trace ID correlation
- Date range filtering

### 📊 Performance Analytics
- Real-time performance metrics
- Error rate monitoring
- Average response time tracking
- Requests per minute analysis
- Top errors identification
- Slowest endpoints detection

### 📤 Export & Sharing
- Export logs in multiple formats (JSON, CSV, TXT)
- Filtered export capabilities
- Shareable log sessions
- Integration with external logging services

## Getting Started

### Accessing the Logging System

1. Navigate to your admin interface
2. Go to **Developer Tools** → **Logging System**
3. Click **Start Stream** to begin capturing logs

### Basic Usage

```typescript
// The logging system automatically captures logs from:
// - Console.log/warn/error statements
// - API requests and responses
// - Webhook events
// - App Bridge interactions
// - System events
```

## Log Entry Structure

Each log entry contains the following information:

```typescript
interface LogEntry {
  id: string;              // Unique log identifier
  timestamp: Date;         // When the log was created
  level: 'debug' | 'info' | 'warn' | 'error';
  source: 'admin' | 'storefront' | 'api' | 'webhooks' | 'app-bridge' | 'system';
  message: string;         // Log message
  data?: any;             // Additional structured data
  traceId?: string;       // Correlation ID for request tracing
  userId?: string;        // User who triggered the event
  sessionId?: string;     // Session identifier
  url?: string;           // API endpoint (for API logs)
  method?: string;        // HTTP method (for API logs)
  statusCode?: number;    // HTTP status code (for API logs)
  duration?: number;      // Request duration in ms (for API logs)
  stack?: string;         // Stack trace (for error logs)
}
```

## Configuration

### Environment Variables

```bash
# Enable/disable logging in different environments
LOGGING_ENABLED=true
LOGGING_LEVEL=debug  # debug, info, warn, error
LOGGING_MAX_ENTRIES=1000
LOGGING_RETENTION_DAYS=7

# WebSocket configuration for real-time streaming
WEBSOCKET_PORT=3001
WEBSOCKET_PATH=/logs

# External logging service integration
EXTERNAL_LOGGING_ENDPOINT=https://your-logging-service.com/api/logs
EXTERNAL_LOGGING_API_KEY=your-api-key
```

### Custom Log Sources

You can add custom log sources to capture application-specific events:

```typescript
// In your application code
import { logger } from '~/lib/logger';

// Custom business logic logging
logger.info('Product sync started', {
  source: 'product-sync',
  productCount: 150,
  traceId: 'sync_12345'
});

// Error logging with context
logger.error('Payment processing failed', {
  source: 'payment',
  orderId: 'order_123',
  error: error.message,
  stack: error.stack
});
```

## Advanced Features

### Trace ID Correlation

Use trace IDs to follow requests across different parts of your application:

```typescript
// Generate a trace ID for a user action
const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Log the start of an operation
logger.info('Order processing started', { traceId, orderId: 'order_123' });

// Log related events with the same trace ID
logger.info('Inventory check completed', { traceId, available: true });
logger.info('Payment processed', { traceId, amount: 99.99 });
logger.info('Order processing completed', { traceId, status: 'success' });
```

### Performance Monitoring

The system automatically tracks performance metrics:

- **Total Logs**: Count of all captured logs
- **Error Rate**: Percentage of error logs vs total logs
- **Average Response Time**: Mean duration of API requests
- **Requests Per Minute**: Current request rate
- **Top Errors**: Most frequent error messages
- **Slowest Endpoints**: API endpoints with highest average response time

### Real-time Alerts

Set up alerts for critical events:

```typescript
// Configure alert thresholds
const alertConfig = {
  errorRateThreshold: 5,      // Alert if error rate > 5%
  responseTimeThreshold: 2000, // Alert if avg response time > 2s
  criticalErrors: [
    'Payment processing failed',
    'Database connection lost',
    'Webhook delivery failed'
  ]
};
```

## Integration Examples

### Shopify Admin API Logging

```typescript
// Automatic logging for Admin API calls
const products = await shopify.rest.Product.all({
  session,
  limit: 50
});
// Logs: [INFO] [api] GET /admin/api/2024-01/products.json - 200 - 245ms
```

### Webhook Event Logging

```typescript
// Webhook handler with automatic logging
export async function handleWebhook(request: Request) {
  const webhook = await request.json();
  
  // Automatically logged with webhook source
  logger.info(`Webhook received: ${webhook.topic}`, {
    source: 'webhooks',
    topic: webhook.topic,
    shopDomain: webhook.shop_domain
  });
}
```

### App Bridge Event Logging

```typescript
// App Bridge events are automatically captured
import { useAppBridge } from '@shopify/app-bridge-react';

const app = useAppBridge();

// Navigation events are logged automatically
app.dispatch(Redirect.create(app, { url: '/admin/products' }));
// Logs: [INFO] [app-bridge] Navigation event: /admin/products
```

## Filtering and Search

### Basic Filtering

- **By Level**: Show only errors, warnings, etc.
- **By Source**: Filter by admin, API, webhooks, etc.
- **By Time**: Show logs from specific time ranges

### Advanced Search

```typescript
// Search examples:
"payment failed"           // Text search in messages
"trace_abc123"            // Find logs by trace ID
"status:500"              // Find logs with specific status codes
"duration:>1000"          // Find slow requests (>1000ms)
"user:user_123"           // Find logs for specific user
```

### Trace ID Filtering

Click on any trace ID in the log view to automatically filter and show all related logs for that trace.

## Export Options

### JSON Export
```json
[
  {
    "id": "log_123",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "level": "info",
    "source": "api",
    "message": "Product created successfully",
    "data": { "productId": "prod_123" },
    "traceId": "trace_abc123"
  }
]
```

### CSV Export
```csv
timestamp,level,source,message,traceId,url,method,statusCode,duration
2024-01-15T10:30:00.000Z,info,api,Product created successfully,trace_abc123,/admin/api/2024-01/products.json,POST,201,156
```

### Text Export
```
[2024-01-15T10:30:00.000Z] INFO [api] Product created successfully (trace: trace_abc123)
[2024-01-15T10:30:15.000Z] WARN [webhooks] Webhook delivery retry attempt 2
[2024-01-15T10:30:30.000Z] ERROR [payment] Payment processing failed
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// DEBUG: Detailed information for debugging
logger.debug('Cache lookup', { key: 'products_list', hit: false });

// INFO: General information about application flow
logger.info('User logged in', { userId: 'user_123' });

// WARN: Something unexpected but not critical
logger.warn('API rate limit approaching', { remaining: 10 });

// ERROR: Error conditions that need attention
logger.error('Database connection failed', { error: error.message });
```

### 2. Include Relevant Context

```typescript
// Good: Includes context for debugging
logger.info('Order processed', {
  orderId: 'order_123',
  customerId: 'customer_456',
  amount: 99.99,
  paymentMethod: 'credit_card'
});

// Bad: Lacks context
logger.info('Order processed');
```

### 3. Use Trace IDs for Complex Operations

```typescript
const traceId = generateTraceId();

// Start of operation
logger.info('Bulk product import started', { traceId, count: 500 });

// Progress updates
logger.info('Products validated', { traceId, validated: 450, errors: 50 });
logger.info('Products imported', { traceId, imported: 450 });

// Completion
logger.info('Bulk product import completed', { traceId, success: 450, failed: 50 });
```

### 4. Monitor Performance Metrics

- Keep error rate below 1% in production
- Monitor average response times
- Set up alerts for critical thresholds
- Review slowest endpoints regularly

### 5. Regular Log Maintenance

- Export important logs before they expire
- Review error patterns weekly
- Clean up old logs to maintain performance
- Archive logs for compliance if needed

## Troubleshooting

### Common Issues

**Logs not appearing:**
- Check if streaming is enabled
- Verify WebSocket connection
- Check browser console for errors

**High memory usage:**
- Reduce log retention period
- Increase cleanup frequency
- Filter logs to reduce volume

**Missing log data:**
- Verify log level configuration
- Check source filtering
- Ensure proper logger initialization

### Performance Optimization

```typescript
// Batch log processing for high-volume applications
const logBatch = [];
const BATCH_SIZE = 100;

function addLog(logEntry: LogEntry) {
  logBatch.push(logEntry);
  
  if (logBatch.length >= BATCH_SIZE) {
    processBatch(logBatch.splice(0, BATCH_SIZE));
  }
}
```

## Security Considerations

### Sensitive Data Handling

```typescript
// Never log sensitive information
logger.info('User authenticated', {
  userId: user.id,
  // DON'T: password: user.password,
  // DON'T: creditCard: user.creditCard,
  loginTime: new Date()
});

// Sanitize data before logging
const sanitizedData = sanitizeForLogging(userData);
logger.info('User data updated', sanitizedData);
```

### Access Control

- Restrict logging system access to developers only
- Use proper authentication for log viewing
- Implement role-based access for different log levels
- Audit log access and exports

## Integration with External Services

### Datadog Integration

```typescript
// Send logs to Datadog
import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.logger.info('Custom log message', {
  service: 'shopify-app',
  source: 'admin',
  tags: ['environment:development']
});
```

### Sentry Integration

```typescript
// Send errors to Sentry
import * as Sentry from '@sentry/node';

logger.error('Critical error occurred', {
  error: error.message,
  extra: { orderId: 'order_123' }
});

// Also send to Sentry
Sentry.captureException(error, {
  tags: { component: 'order-processing' },
  extra: { orderId: 'order_123' }
});
```

## API Reference

### Logger Methods

```typescript
interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
  
  // Advanced methods
  startTrace(operation: string): string;
  endTrace(traceId: string, result?: any): void;
  addContext(key: string, value: any): void;
  clearContext(): void;
}
```

### Configuration Options

```typescript
interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  maxEntries: number;
  retentionDays: number;
  sources: string[];
  websocket: {
    port: number;
    path: string;
  };
  external?: {
    endpoint: string;
    apiKey: string;
  };
}
```

This comprehensive logging system provides everything you need to monitor, debug, and optimize your Shopify app during development and production. 