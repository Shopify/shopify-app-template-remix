# 🚀 **Complete Shopify App Template - Cursor Prompts**

## **Phase 1: Foundation & Architecture**

### **Prompt 1: Enhanced Project Foundation**
- [x] **1.1** Create comprehensive project structure with admin/storefront separation
- [x] **1.2** Set up package.json with all necessary scripts and dependencies
- [x] **1.3** Configure Shopify CLI integration
- [x] **1.4** Implement foundation following Shopify best practices
- [x] **1.5** Set up TypeScript configuration
- [x] **1.6** Create basic routing structure for admin and storefront

```
Create a new Shopify app template with comprehensive structure and V0-to-Polaris workflow:

Project Structure:
```
shopify-app-template/
├── app/
│   ├── routes/
│   │   ├── admin/              # Shopify admin interface (Polaris)
│   │   ├── api/                # API endpoints
│   │   └── storefront/         # Customer-facing pages (if needed)
│   ├── components/
│   │   ├── admin/              # Polaris components
│   │   ├── storefront/         # Customer-facing components
│   │   └── shared/             # Shared utilities
│   ├── lib/
│   │   ├── api-client.ts       # Shopify API integration
│   │   ├── app-bridge.ts       # App Bridge utilities
│   │   └── utils.ts            # Common utilities
│   └── root.tsx
├── extensions/
│   ├── checkout/               # Checkout UI extensions
│   └── storefront/             # Theme app extensions
├── preview/
│   ├── admin/                  # Admin preview system
│   ├── storefront/             # Storefront preview
│   └── components/             # Preview utilities
├── scripts/
│   ├── v0-to-polaris.js        # V0 conversion pipeline
│   ├── shadcn-to-polaris.js    # Component conversion
│   └── setup-dev.js            # Development setup
├── tests/
│   ├── components/             # Component tests
│   ├── api/                    # API tests
│   └── e2e/                    # End-to-end tests
├── .storybook/                 # Storybook configuration
└── docs/                       # Documentation
```

Package.json scripts:
- "dev": "shopify app dev"
- "dev:admin": "vite dev --mode admin"
- "dev:storefront": "vite dev --mode storefront"
- "preview": "concurrently \"npm run dev\" \"npm run preview:server\""
- "preview:server": "npx serve preview -l 3002"
- "convert:v0": "node scripts/v0-to-polaris.js"
- "convert:shadcn": "node scripts/shadcn-to-polaris.js"
- "storybook": "storybook dev -p 6006"
- "test": "vitest"
- "test:ui": "vitest --ui"
- "test:coverage": "vitest run --coverage"
- "build": "shopify app build"
- "deploy": "shopify app deploy"

Dependencies:
- @shopify/polaris, @shopify/polaris-icons
- @shopify/app-bridge-react
- @shopify/cli
- @remix-run/node, @remix-run/react
- @monaco-editor/react
- @storybook/react-vite
- vitest, @vitest/ui, @vitest/coverage-v8
- msw (API mocking)
- husky, lint-staged
- concurrently, serve
- typescript, eslint, prettier

Create the foundation following Shopify best practices for admin/storefront separation.
```

### **Prompt 2: V0-to-Polaris Conversion Pipeline** ✅
- [x] **2.1** Create V0 code import system
- [x] **2.2** Build component mapping engine (shadcn → Polaris)
- [x] **2.3** Implement style conversion (Tailwind → Polaris tokens)
- [x] **2.4** Preserve logic and event handlers
- [x] **2.5** Add Shopify enhancement features
- [x] **2.6** Create CLI interface with interactive selection
- [x] **2.7** Implement output optimization and TypeScript generation

```
Create a comprehensive V0-to-Polaris conversion system in scripts/v0-to-polaris.js:

Features:
1. V0 Code Import:
   - Parse V0 exported React components
   - Extract component structure and logic
   - Identify shadcn/ui components and patterns
   - Preserve TypeScript types and interfaces

2. Component Mapping Engine:
   - shadcn Button → Polaris Button (with proper props)
   - shadcn Card → Polaris Card (structure conversion)
   - shadcn Input → Polaris TextField
   - shadcn Select → Polaris Select
   - shadcn Dialog → Polaris Modal
   - shadcn Badge → Polaris Badge
   - shadcn Alert → Polaris Banner
   - shadcn Separator → Polaris Divider
   - shadcn Table → Polaris DataTable

3. Style Conversion:
   - Tailwind classes → Polaris design tokens
   - CSS-in-JS → Polaris component props
   - Custom styles → Polaris-compatible alternatives
   - Responsive breakpoints → Polaris responsive patterns

4. Logic Preservation:
   - Event handlers (onClick, onChange, onSubmit)
   - State management (useState, useEffect)
   - Form validation patterns
   - API integration patterns

5. Shopify Enhancement:
   - Add App Bridge integration where needed
   - Convert to Shopify admin patterns
   - Add proper page layouts (Page, Layout)
   - Include navigation patterns (Navigation, TopBar)

6. CLI Interface:
   - Interactive component selection
   - Dry-run mode with preview
   - Batch conversion capabilities
   - Progress reporting and error handling
   - Before/after comparison

7. Output Optimization:
   - Generate TypeScript interfaces
   - Add proper imports for Polaris
   - Include accessibility attributes
   - Follow Shopify coding standards

Create it as a robust CLI tool with extensive logging and error handling.
```

### **Prompt 3: Admin/Storefront Architecture Implementation**
- [ ] **3.1** Implement admin layout system with Polaris
- [ ] **3.2** Create core admin pages (dashboard, settings, products, analytics)
- [ ] **3.3** Build admin components (layout, navigation, tables, forms, charts)
- [ ] **3.4** Create checkout extensions structure
- [ ] **3.5** Implement theme extensions for storefront
- [ ] **3.6** Set up shared infrastructure (API layer, components, business logic)
- [ ] **3.7** Ensure proper separation following Shopify guidelines

```
Implement proper Shopify app architecture with clear admin/storefront separation:

## Admin Interface (app/routes/admin/*)
Create admin-focused structure:

1. Layout System:
   - app/routes/admin.tsx - Main admin layout with Polaris
   - App Bridge integration for embedded experience
   - Navigation with proper Shopify admin patterns
   - Error boundaries and loading states

2. Core Admin Pages:
   - app/routes/admin._index.tsx - Dashboard/home page
   - app/routes/admin.settings.tsx - App settings
   - app/routes/admin.products.tsx - Product management
   - app/routes/admin.analytics.tsx - Analytics dashboard

3. Admin Components (app/components/admin/):
   - AdminLayout.tsx - Main layout wrapper
   - AdminNavigation.tsx - Navigation component
   - DataTables/ - Table components for data display
   - Forms/ - Form components with validation
   - Charts/ - Analytics and reporting components

## Storefront Interface (extensions/*)
Create customer-facing extensions:

1. Checkout Extensions (extensions/checkout/):
   - Product offers
   - Shipping options
   - Payment modifications
   - Order summaries

2. Theme Extensions (extensions/storefront/):
   - Product widgets
   - Collection enhancements
   - Cart modifications
   - Customer account features

## Shared Infrastructure
1. API Layer (app/routes/api/):
   - Shopify Admin API integration
   - Storefront API for customer data
   - Webhook handlers
   - Authentication middleware

2. Shared Components (app/components/shared/):
   - API client utilities
   - Error handling components
   - Loading states
   - Common types and interfaces

3. Business Logic (app/lib/):
   - Shopify API wrappers
   - Data transformation utilities
   - Validation schemas
   - Constants and configurations

Ensure proper separation following Shopify's architectural guidelines.
```

## **Phase 2: Development Tools & Preview System**

### **Prompt 4: Enhanced Preview System**
- [x] **4.1** Create admin preview system with harness, mock provider, and dev controls
- [x] **4.2** Build storefront preview system with checkout and theme simulation
- [x] **4.3** Implement unified preview dashboard with tabbed interface
- [x] **4.4** Add development tools (component browser, API testing, debugging)
- [x] **4.5** Create testing scenarios and export capabilities
- [x] **4.6** Integrate with hot reload and live editing
- [x] **4.7** Update all dependencies to latest 2025 versions
- [x] **4.8** Ensure compatibility with Polaris 13.9.5 and modern tooling

```
Create a comprehensive preview system supporting both admin and storefront contexts:

## Admin Preview System (preview/admin/)
1. AdminPreviewHarness.tsx:
   - Embedded Shopify admin simulation
   - App Bridge event mocking
   - Real-time component updates
   - Device responsive testing (desktop, tablet, mobile)

2. AdminMockProvider.tsx:
   - Mock Shopify admin data (shop, products, orders, customers)
   - Real-time data updates
   - State management for preview scenarios
   - API response simulation with delays

3. AdminDevControls.tsx:
   - Preview mode switching (embedded, standalone, development)
   - Mock data manipulation
   - Component state inspector
   - Performance monitoring

## Storefront Preview System (preview/storefront/)
1. StorefrontPreviewHarness.tsx:
   - Checkout extension preview
   - Theme extension simulation
   - Customer journey testing
   - Cross-device compatibility

2. CheckoutPreview.tsx:
   - Simulate checkout flow
   - Test extension integration
   - Payment method variations
   - Shipping option testing

## Unified Preview Dashboard (preview/index.html)
1. Preview Interface:
   - Tabbed interface for admin/storefront
   - Real-time code changes reflection
   - Component isolation testing
   - Integration testing scenarios

2. Development Tools:
   - Component library browser
   - API endpoint testing interface
   - State debugging tools
   - Performance profiler

3. Testing Scenarios:
   - User journey simulation
   - Error state testing
   - Edge case handling
   - Accessibility testing

4. Export Capabilities:
   - Generate test scenarios
   - Export component variations
   - Create documentation
   - Share preview links

Integrate with hot reload and live editing capabilities for maximum development efficiency.
```

### **Prompt 5: API Testing Suite with Shopify Integration** ✅
- [x] **5.1** Build core testing interface with multi-protocol support
- [x] **5.2** Implement Shopify-specific features (query templates, data explorer)
- [x] **5.3** Create JavaScript playground with API client integration
- [x] **5.4** Build GraphQL query builder with schema explorer
- [x] **5.5** Implement REST API tester with endpoint library
- [x] **5.6** Add results management with test history and integration features
- [x] **5.7** Include comprehensive error handling and debugging

```
Build a comprehensive API testing interface specifically for Shopify development:

## Core Testing Interface (app/components/admin/ApiTestingSuite.tsx)
1. Multi-Protocol Support:
   - JavaScript Playground with Shopify API client
   - GraphQL Admin API query builder
   - REST API endpoint tester
   - Webhook payload tester

2. Shopify-Specific Features:
   - Pre-built query templates for common operations
   - Shop data explorer (products, orders, customers)
   - Metafield testing and management
   - Webhook event simulation

## JavaScript Playground
1. API Client Integration:
   - Pre-loaded Shopify Admin API client
   - Auto-completion for Shopify resources
   - Real-time execution with error handling
   - Code snippet library for common operations

2. Example Templates:
   - Product CRUD operations
   - Order management workflows
   - Customer data handling
   - Inventory management

## GraphQL Query Builder
1. Schema Explorer:
   - Interactive Shopify Admin API schema
   - Query building with auto-completion
   - Variable management and validation
   - Mutation testing with proper formatting

2. Shopify Patterns:
   - Pagination helpers for large datasets
   - Bulk operation query builders
   - Metafield query patterns
   - File upload testing

## REST API Tester
1. Endpoint Library:
   - Pre-configured Shopify Admin API endpoints
   - Authentication header management
   - Rate limiting simulation
   - Response caching for development

## Results Management
1. Test History:
   - Persistent test result storage
   - Performance metrics tracking
   - Error analysis and debugging
   - Test case sharing and export

2. Integration Features:
   - Save successful queries as templates
   - Generate code snippets for app integration
   - Export test cases for documentation
   - Integration with preview system

Include comprehensive error handling and debugging capabilities.
```

### **Prompt 6: Development Logging System** ✅
- [x] **6.1** Implement real-time logging dashboard with live streaming
- [x] **6.2** Create log capture system for frontend and backend
- [x] **6.3** Add Shopify integration logging (App Bridge, API, webhooks)
- [x] **6.4** Build advanced features (analysis, development tools, export)
- [x] **6.5** Include proper log rotation and storage management

```
Implement a comprehensive logging system for Shopify app development:

## Real-time Logging Dashboard (app/components/admin/LoggingSystem.tsx)
1. Log Stream Interface:
   - Live log streaming with WebSocket connection
   - Filterable log levels (debug, info, warn, error)
   - Source-based filtering (admin, storefront, api, webhooks)
   - Search functionality with regex support
   - Time-based filtering and date ranges

2. Shopify-Specific Logging:
   - App Bridge event logging
   - Shopify API request/response logging
   - Webhook event capture and analysis
   - Authentication flow logging
   - Extension lifecycle events

## Log Capture System
1. Frontend Logging:
   - Error boundary integration
   - User interaction tracking
   - Performance metrics collection
   - Component render monitoring

2. Backend Logging:
   - API endpoint monitoring
   - Database query logging
   - External service integration logs
   - Background job monitoring

3. Shopify Integration Logging:
   - Admin API call logging with rate limit tracking
   - Storefront API usage monitoring
   - Webhook delivery confirmation
   - App installation/uninstallation events

## Advanced Features
1. Log Analysis:
   - Performance bottleneck identification
   - Error pattern recognition
   - User behavior analysis
   - API usage optimization suggestions

2. Development Tools:
   - Trace ID correlation across services
   - Request/response inspection
   - State change monitoring
   - Memory usage tracking

3. Export and Sharing:
   - Log export in multiple formats (JSON, CSV, TXT)
   - Shareable log sessions
   - Integration with external logging services
   - Automated error reporting

Include proper log rotation and storage management for development environments.
```

## **Phase 3: Testing & Quality Assurance**

### **Prompt 7: Comprehensive Testing Setup** ✅
- [x] **7.1** Configure Vitest with React Testing Library and Polaris utilities
- [x] **7.2** Create Shopify test helpers and component testing utilities
- [x] **7.3** Implement unit tests for components and utilities
- [x] **7.4** Build integration tests for API and authentication
- [x] **7.5** Create E2E tests for complete workflows
- [x] **7.6** Set up mock services for Shopify API and App Bridge
- [x] **7.7** Include automated testing in CI/CD pipeline

```
Setup advanced testing infrastructure with Shopify-specific patterns:

## Vitest Configuration (vitest.config.ts)
1. Test Environment Setup:
   - React Testing Library integration
   - Polaris component testing utilities
   - App Bridge mocking framework
   - Shopify API mocking with MSW

2. Coverage Configuration:
   - Component coverage targeting 90%+
   - API integration coverage
   - E2E workflow coverage
   - Performance benchmark testing

## Testing Utilities (tests/utils/)
1. Shopify Test Helpers:
   - Mock Shopify Admin API responses
   - App Bridge event simulation
   - Authentication flow mocking
   - Webhook payload generation

2. Component Testing:
   - Polaris component render helpers
   - Form validation testing utilities
   - Navigation testing helpers
   - Responsive design testing

## Test Categories
1. Unit Tests (tests/components/):
   - Admin component functionality
   - Storefront component behavior
   - Utility function validation
   - API client testing

2. Integration Tests (tests/api/):
   - Shopify Admin API integration
   - Webhook handler testing
   - Authentication flow validation
   - Data transformation testing

3. E2E Tests (tests/e2e/):
   - Complete user workflows
   - App installation process
   - Admin interface navigation
   - Extension functionality

## Mock Services (tests/mocks/)
1. Shopify API Mocking:
   - Realistic data generation
   - Error scenario simulation
   - Rate limiting simulation
   - Webhook event mocking

2. App Bridge Mocking:
   - Navigation event simulation
   - Modal and toast testing
   - Loading state management
   - Error handling verification

Include automated testing in CI/CD pipeline with detailed reporting.
```

### **Prompt 8: Performance Optimization Suite** ✅
- [x] **8.1** Implement real-time performance monitoring with Core Web Vitals tracking
- [x] **8.2** Create comprehensive bundle analysis and optimization tools
- [x] **8.3** Build performance budgets and automated checking system
- [x] **8.4** Add Shopify-specific optimization recommendations and strategies
- [x] **8.5** Include performance API, documentation, and CI/CD integration
- [x] **8.6** Create performance monitoring dashboard with export capabilities

```
Setup Storybook as a comprehensive design system and V0.com alternative:

## Storybook Configuration (.storybook/)
1. Polaris Integration:
   - Polaris design tokens integration
   - App Bridge simulation for stories
   - Responsive viewport configurations
   - Accessibility testing addon

2. Story Organization:
   - Admin components showcase
   - Storefront components library
   - Pattern library with examples
   - Integration testing scenarios

## Component Stories
1. Admin Component Stories:
   - Polaris component variations
   - Form patterns with validation
   - Data table configurations
   - Navigation and layout patterns

2. Story Templates:
   - Interactive component playground
   - Props documentation generation
   - Usage examples and code snippets
   - Design pattern demonstrations

## Advanced Features
1. Design System Documentation:
   - Component specifications
   - Design token usage
   - Accessibility guidelines
   - Shopify admin patterns

2. Development Tools:
   - Visual regression testing
   - Component performance monitoring
   - Design review workflow
   - Handoff documentation generation

3. AI Enhancement:
   - Component variation generator
   - Pattern suggestion engine
   - Automatic story generation
   - Design consistency checker

## Integration Points
1. Preview System Integration:
   - Stories available in preview dashboard
   - Real-time component updates
   - Cross-reference with API testing
   - Performance monitoring integration

2. Documentation Generation:
   - Automatic component documentation
   - Usage pattern extraction
   - Code example generation
   - Best practices documentation

Make it the primary tool for component development and design review.
```

## **Phase 4: Git Integration & Development Workflow**

### **Prompt 9: Git Integration & Development Workflow**
- [ ] **9.1** Set up Git hooks with Husky (pre-commit, pre-push, commit validation)
- [ ] **9.2** Create development scripts for workflow and quality assurance
- [ ] **9.3** Configure GitHub Actions workflow (CI pipeline, preview deployments, production)
- [ ] **9.4** Set up code quality tools (ESLint, Prettier with Shopify standards)
- [ ] **9.5** Include comprehensive .gitignore and security considerations

```
Setup comprehensive Git integration and automated development workflow:

## Git Hooks with Husky
1. Pre-commit Hooks:
   - ESLint with Shopify configuration
   - Prettier formatting with Polaris standards
   - TypeScript type checking
   - Import organization and optimization
   - Component testing execution

2. Pre-push Hooks:
   - Full test suite execution
   - Build verification
   - Performance benchmark validation
   - API integration testing

3. Commit Message Validation:
   - Conventional commits enforcement
   - Semantic versioning integration
   - Automated changelog generation
   - Release note preparation

## Development Scripts
1. Workflow Commands:
   - `npm run commit`: Guided conventional commits with prompts
   - `npm run release`: Automated versioning and changelog
   - `npm run deploy:preview`: Preview environment deployment
   - `npm run deploy:production`: Production deployment with checks

2. Quality Assurance:
   - `npm run lint:fix`: Comprehensive linting and fixing
   - `npm run format`: Code formatting with Polaris standards
   - `npm run typecheck`: TypeScript validation
   - `npm run test:changed`: Test only changed files

## GitHub Actions Workflow
1. CI Pipeline (.github/workflows/ci.yml):
   - Multi-node version testing
   - Comprehensive test execution
   - Build verification
   - Security vulnerability scanning

2. Preview Deployments:
   - Automatic preview environment creation
   - Shopify app preview deployment
   - Storybook deployment for design review
   - Performance testing and reporting

3. Production Deployment:
   - Automated Shopify app deployment
   - Environment variable management
   - Rollback capabilities
   - Post-deployment verification

## Code Quality Tools
1. ESLint Configuration:
   - Shopify React configuration
   - Polaris component linting rules
   - Accessibility enforcement
   - Performance optimization hints

2. Prettier Setup:
   - Polaris design system formatting
   - Import statement organization
   - Consistent code style enforcement
   - Integration with VS Code/Cursor

Include comprehensive .gitignore for Shopify development and security considerations.
```

### **Prompt 10: Template Finalization & Documentation**
- [ ] **10.1** Optimize template structure and remove business logic
- [ ] **10.2** Create comprehensive documentation suite
- [ ] **10.3** Set up repository configuration (GitHub templates, automation)
- [ ] **10.4** Implement template customization with setup wizard
- [ ] **10.5** Define success metrics and create production-ready template

```
Finalize the Shopify app template for repository publication and team usage:

## Template Structure Optimization
1. Remove Business Logic:
   - Extract specific business rules
   - Replace with configurable examples
   - Add placeholder components
   - Include comprehensive comments

2. Configuration Management:
   - Environment variable templates
   - Configuration file examples
   - Setup script automation
   - Documentation generation

## Documentation Suite (docs/)
1. Quick Start Guide:
   - One-command setup instructions
   - Development environment configuration
   - First app creation walkthrough
   - Common troubleshooting scenarios

2. Development Guides:
   - Admin interface development patterns
   - Storefront extension creation
   - API integration best practices
   - Testing strategy implementation

3. Feature Documentation:
   - Preview system usage guide
   - V0-to-Polaris conversion workflow
   - API testing suite tutorial
   - Logging system configuration

4. Architecture Documentation:
   - System architecture overview
   - Component organization patterns
   - State management strategies
   - Performance optimization guidelines

## Repository Setup
1. GitHub Configuration:
   - Issue templates for bugs and features
   - Pull request templates
   - Contributing guidelines
   - Code of conduct
   - Security policy

2. Automation:
   - Dependabot configuration
   - Security scanning setup
   - Performance monitoring
   - Community health files

## Template Customization
1. Setup Wizard:
   - Interactive project configuration
   - Feature selection (admin-only, storefront, full-stack)
   - Development tool preferences
   - Deployment target selection

2. Example Implementations:
   - Basic CRUD operations
   - Shopify integration patterns
   - Extension development examples
   - Testing scenario templates

## Success Metrics
1. Development Speed:
   - Time to first working prototype
   - Component development velocity
   - Testing implementation speed
   - Deployment preparation time

2. Code Quality:
   - Automated quality metrics
   - Performance benchmarks
   - Accessibility compliance
   - Security vulnerability prevention

Create a production-ready template that accelerates Shopify app development while maintaining high code quality standards.
```

## 🎯 **Implementation Order**

```bash
# 1. Start with Shopify CLI
shopify app create my-enhanced-template

# 2. Use prompts in exact order (1-10)
# Each prompt builds on the previous ones

# 3. Test each phase before moving forward
yarn test
yarn preview
yarn storybook

# 4. Customize for your specific needs
# 5. Publish as template repository
```

## 🚀 **Key Features**

### **V0-to-Polaris Workflow**
- Natural language → V0 prototyping
- Automatic conversion to Polaris components
- Shopify admin pattern integration
- Production-ready code output

### **Comprehensive Preview System**
- [x] Better than Gadget.dev preview capabilities
- [x] Admin and storefront separation
- [x] Real-time development tools
- [x] Performance monitoring
- [x] Latest 2025 dependencies (React 18.3.1, Vite 6.3.5, TypeScript 5.7.3)

### **Advanced Testing Infrastructure**
- Vitest with comprehensive coverage
- Shopify-specific testing utilities
- E2E workflow validation
- Performance benchmarking

### **Professional Development Tools**
- API testing suite with Monaco editor
- Real-time logging system
- Storybook design system
- Git workflow automation

This complete template provides a **superior alternative to Gadget.dev** with all the benefits of standard Shopify development plus enhanced productivity tools! 