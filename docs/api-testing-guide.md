# API Testing Suite Documentation

## Overview

The API Testing Suite provides comprehensive tools for testing, debugging, and exploring Shopify APIs during development. It includes three main components:

1. **API Testing Suite** - Interactive testing interface for REST, GraphQL, and JavaScript
2. **Shopify API Explorer** - Browse and explore Shopify Admin API endpoints with documentation
3. **Webhook Tester** - Test and debug Shopify webhooks with payload simulation

## Features

### 🔧 API Testing Suite (`/admin/api-testing`)

#### REST API Testing
- **Multi-method support**: GET, POST, PUT, DELETE, PATCH
- **Header management**: JSON editor for custom headers
- **Request body editor**: Monaco editor with JSON syntax highlighting
- **Response viewer**: Formatted JSON response display
- **Template library**: Pre-built Shopify API request templates
- **Request history**: Track and replay previous requests

#### GraphQL Testing
- **Query editor**: Monaco editor with GraphQL syntax highlighting
- **Variables support**: JSON editor for GraphQL variables
- **Template queries**: Pre-built Shopify GraphQL queries
- **Response formatting**: Structured GraphQL response display
- **Error handling**: Clear error messages and debugging info

#### JavaScript Playground
- **Code execution**: Run JavaScript code in a safe environment
- **Console output**: Capture and display console.log output
- **API examples**: Pre-loaded Shopify API interaction examples
- **Syntax highlighting**: Monaco editor with JavaScript support

#### Webhook Testing
- **Payload simulation**: Send test webhook payloads
- **Event templates**: Pre-built webhook event payloads
- **Endpoint management**: Configure and manage webhook endpoints
- **Response tracking**: Monitor webhook delivery status

### 🔍 Shopify API Explorer (`/admin/api-explorer`)

#### Endpoint Documentation
- **Categorized endpoints**: Organized by resource type (Products, Orders, Customers, etc.)
- **Interactive documentation**: Expandable endpoint details
- **Parameter reference**: Complete parameter documentation with types
- **Example requests/responses**: Real Shopify API examples
- **Try it integration**: Direct integration with API Testing Suite

#### Search and Navigation
- **Endpoint search**: Find endpoints by path or description
- **Tabbed interface**: Easy navigation between resource categories
- **Quick actions**: One-click testing of any endpoint

### 🎯 Webhook Tester (`/admin/webhook-tester`)

#### Webhook Simulation
- **Event templates**: Pre-built payloads for all major Shopify webhook events
- **Custom payloads**: Edit and customize webhook payloads
- **Header configuration**: Set custom webhook headers
- **Delivery testing**: Send webhooks to your endpoints

#### Endpoint Management
- **Endpoint registration**: Add and manage webhook endpoints
- **Event subscription**: Configure which events each endpoint receives
- **Secret management**: Configure webhook secrets for verification
- **Status monitoring**: Track endpoint active/inactive status

#### Webhook Listener
- **Local listener**: Start a local webhook receiver for testing
- **Payload inspection**: View incoming webhook payloads
- **Real-time monitoring**: Live webhook delivery tracking

## Usage Examples

### Testing a Product Creation API

1. Navigate to `/admin/api-testing`
2. Select "REST API" tab
3. Choose "Create Product" template from Products category
4. Modify the payload as needed:
   ```json
   {
     "product": {
       "title": "Test Product",
       "body_html": "<p>Test description</p>",
       "vendor": "Test Vendor",
       "product_type": "Test Type",
       "status": "draft"
     }
   }
   ```
5. Set headers with your access token:
   ```json
   {
     "Content-Type": "application/json",
     "X-Shopify-Access-Token": "your-access-token"
   }
   ```
6. Click "Send Request" to test

### Exploring GraphQL Schema

1. Navigate to `/admin/api-explorer`
2. Browse the GraphQL section
3. Click "Try it" on any query to open in API Testing Suite
4. Modify variables and execute queries

### Testing Webhook Delivery

1. Navigate to `/admin/webhook-tester`
2. Go to "Test Webhooks" tab
3. Select webhook event (e.g., "orders/create")
4. Enter your webhook endpoint URL
5. Customize payload if needed
6. Click "Send Webhook" to test delivery

## Configuration

### Environment Setup

The API testing tools work with your existing Shopify app configuration. Ensure you have:

1. **Valid access tokens** for API requests
2. **Webhook endpoints** configured for testing
3. **CORS settings** if testing from different domains

### Security Considerations

- **Access tokens**: Never commit access tokens to version control
- **Webhook secrets**: Use environment variables for webhook secrets
- **Local testing**: Use ngrok or similar tools for local webhook testing

## Integration with Development Workflow

### During Development
1. Use API Explorer to understand available endpoints
2. Test API calls with the Testing Suite before implementing
3. Validate webhook payloads with the Webhook Tester
4. Debug API responses and error handling

### Before Deployment
1. Test all API integrations with production-like data
2. Verify webhook delivery and handling
3. Validate error scenarios and edge cases
4. Performance test with realistic payloads

## Troubleshooting

### Common Issues

#### API Requests Failing
- Check access token validity and permissions
- Verify request headers and content-type
- Ensure API version compatibility
- Check rate limiting and throttling

#### Webhook Delivery Issues
- Verify endpoint URL accessibility
- Check webhook secret configuration
- Validate payload format and headers
- Monitor webhook delivery logs

#### GraphQL Errors
- Validate query syntax and structure
- Check variable types and values
- Verify field availability in API version
- Review error messages for specific issues

### Debug Tips

1. **Use the request history** to replay and compare requests
2. **Check response headers** for rate limiting and error details
3. **Validate JSON payloads** before sending requests
4. **Test with minimal payloads** first, then add complexity
5. **Use webhook listener** to inspect actual webhook deliveries

## Advanced Features

### Custom Templates
Create your own request templates by:
1. Building a request in the Testing Suite
2. Saving the configuration
3. Reusing across different test scenarios

### Batch Testing
Use the JavaScript playground to:
1. Create loops for multiple API calls
2. Test data consistency across requests
3. Validate complex workflows

### Integration Testing
Combine tools for end-to-end testing:
1. Create data with API Testing Suite
2. Trigger webhooks with actions
3. Verify webhook delivery with Webhook Tester

## API Reference

### Supported Shopify APIs

#### REST Admin API
- Products and variants
- Orders and transactions
- Customers and addresses
- Inventory and locations
- Webhooks and events

#### GraphQL Admin API
- All REST API functionality
- Bulk operations
- Advanced querying
- Real-time subscriptions

#### Webhook Events
- Order lifecycle events
- Product management events
- Customer events
- App lifecycle events
- Custom webhook events

## Best Practices

### API Testing
1. **Start simple**: Test basic endpoints before complex workflows
2. **Use templates**: Leverage pre-built templates for common operations
3. **Validate responses**: Check both success and error scenarios
4. **Monitor rate limits**: Be aware of API rate limiting
5. **Test edge cases**: Include boundary conditions and error states

### Webhook Testing
1. **Test all events**: Verify handling of all subscribed webhook events
2. **Validate signatures**: Ensure webhook signature verification works
3. **Handle failures**: Test webhook retry and failure scenarios
4. **Monitor performance**: Check webhook processing time and reliability
5. **Secure endpoints**: Use HTTPS and proper authentication

### Development Workflow
1. **API-first design**: Test APIs before building UI
2. **Continuous testing**: Integrate testing into development workflow
3. **Documentation**: Keep API tests as living documentation
4. **Version compatibility**: Test across different API versions
5. **Error handling**: Thoroughly test error scenarios and recovery 