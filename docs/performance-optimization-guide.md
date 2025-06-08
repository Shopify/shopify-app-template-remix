# Performance Optimization Suite Guide

## Overview

The Performance Optimization Suite provides comprehensive performance monitoring, analysis, and optimization tools specifically designed for Shopify app development. It includes real-time monitoring, bundle analysis, performance budgets, and actionable optimization recommendations.

## Features

### 🔍 **Real-time Performance Monitoring**
- Core Web Vitals tracking (FCP, LCP, FID, CLS)
- Memory usage monitoring
- CPU usage tracking
- API performance metrics
- Runtime performance analysis

### 📊 **Bundle Analysis**
- Bundle size analysis and visualization
- Chunk breakdown and dependency mapping
- Duplicate dependency detection
- Dead code identification
- Compression ratio analysis

### 🎯 **Performance Budgets**
- Configurable performance thresholds
- Automated budget checking
- Performance regression detection
- CI/CD integration ready

### 💡 **Optimization Recommendations**
- Shopify-specific optimization suggestions
- Bundle optimization strategies
- Code splitting recommendations
- Caching strategies

## Getting Started

### Accessing the Performance Monitor

1. Navigate to your admin interface
2. Go to **Developer Tools** → **Performance Monitor**
3. Click **Start Monitoring** to begin real-time tracking

### Dashboard Overview

The Performance Monitor includes four main tabs:

#### 1. Overview Tab
- **Core Web Vitals**: Real-time FCP, LCP, FID, and CLS metrics
- **Performance Status**: Color-coded status indicators
- **Progress Bars**: Visual representation of metric thresholds
- **Monitoring Controls**: Start/stop real-time monitoring

#### 2. Runtime Metrics Tab
- **Memory Usage**: Real-time memory consumption tracking
- **CPU Usage**: Processor utilization monitoring
- **Performance Graphs**: Historical performance data
- **Resource Utilization**: System resource tracking

#### 3. Bundle Analysis Tab
- **Bundle Size Overview**: Total and gzipped bundle sizes
- **Chunk Analysis**: Breakdown of bundle chunks
- **Dependency Analysis**: Package size and version information
- **Compression Metrics**: Gzip compression effectiveness

#### 4. Recommendations Tab
- **General Optimizations**: Performance improvement suggestions
- **Shopify-Specific**: Platform-specific optimization tips
- **Bundle Optimizations**: Code splitting and lazy loading recommendations
- **Caching Strategies**: CDN and browser caching suggestions

## Performance Metrics Explained

### Core Web Vitals

#### First Contentful Paint (FCP)
- **What it measures**: Time until first text/image appears
- **Good**: ≤ 1.8 seconds
- **Needs Improvement**: 1.8 - 3.0 seconds
- **Poor**: > 3.0 seconds

#### Largest Contentful Paint (LCP)
- **What it measures**: Time until largest content element appears
- **Good**: ≤ 2.5 seconds
- **Needs Improvement**: 2.5 - 4.0 seconds
- **Poor**: > 4.0 seconds

#### First Input Delay (FID)
- **What it measures**: Time from first user interaction to browser response
- **Good**: ≤ 100 milliseconds
- **Needs Improvement**: 100 - 300 milliseconds
- **Poor**: > 300 milliseconds

#### Cumulative Layout Shift (CLS)
- **What it measures**: Visual stability of page elements
- **Good**: ≤ 0.1
- **Needs Improvement**: 0.1 - 0.25
- **Poor**: > 0.25

### Bundle Metrics

#### Total Bundle Size
- **Recommended**: < 300KB for initial load
- **Warning**: 300KB - 500KB
- **Critical**: > 500KB

#### Gzip Compression Ratio
- **Good**: < 30% of original size
- **Average**: 30% - 40% of original size
- **Poor**: > 40% of original size

## Using the Performance API

### Basic Usage

```typescript
import { 
  performanceCollector, 
  memoryMonitor, 
  BundleAnalyzer 
} from '~/lib/performance';

// Start performance monitoring
performanceCollector.onMetric('FCP', (metric) => {
  console.log(`FCP: ${metric.value}ms (${metric.rating})`);
});

// Monitor memory usage
memoryMonitor.startMonitoring();
memoryMonitor.onUsageChange((usage) => {
  console.log(`Memory: ${usage.percentage.toFixed(1)}%`);
});

// Analyze bundle
const analysis = await BundleAnalyzer.analyzeBundleSize();
const suggestions = BundleAnalyzer.getOptimizationSuggestions(analysis);
```

### Advanced Configuration

```typescript
import { performanceBudget } from '~/lib/performance';

// Set custom performance budgets
performanceBudget.setBudget('FCP', 1500); // Stricter FCP budget
performanceBudget.setBudget('bundle', 250 * 1024); // 250KB bundle limit

// Check if metrics meet budget
const metrics = performanceCollector.getMetrics();
const report = performanceBudget.generateReport(metrics);

console.log('Passed:', report.passed);
console.log('Failed:', report.failed);
console.log('Warnings:', report.warnings);
```

## Optimization Strategies

### 1. Bundle Optimization

#### Code Splitting
```typescript
// Lazy load heavy components
const MonacoEditor = lazy(() => import('@monaco-editor/react'));
const ApiTestingSuite = lazy(() => import('~/components/admin/ApiTestingSuite'));

// Use React.Suspense for loading states
<Suspense fallback={<Spinner />}>
  <MonacoEditor />
</Suspense>
```

#### Tree Shaking
```typescript
// Import only what you need from Polaris
import { Button, Card } from '@shopify/polaris';
// Instead of: import * as Polaris from '@shopify/polaris';

// Use specific icon imports
import { HomeIcon } from '@shopify/polaris-icons';
// Instead of: import * as Icons from '@shopify/polaris-icons';
```

### 2. Shopify-Specific Optimizations

#### GraphQL Query Optimization
```typescript
// Batch multiple queries
const BATCH_QUERY = gql`
  query BatchData {
    products(first: 10) { ... }
    orders(first: 5) { ... }
    customers(first: 5) { ... }
  }
`;

// Use query fragments for reusability
const PRODUCT_FRAGMENT = gql`
  fragment ProductInfo on Product {
    id
    title
    handle
    status
  }
`;
```

#### App Bridge Optimization
```typescript
// Use App Bridge for navigation to avoid full page loads
import { useNavigate } from '@shopify/app-bridge-react';

const navigate = useNavigate();
navigate('/admin/products'); // Faster than window.location
```

### 3. Caching Strategies

#### Service Worker Implementation
```typescript
// Register service worker for API caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Cache Shopify API responses
const cache = await caches.open('shopify-api-v1');
await cache.put(request, response.clone());
```

#### Browser Caching
```typescript
// Cache Polaris theme tokens
const theme = localStorage.getItem('polaris-theme');
if (!theme) {
  const themeData = await fetchTheme();
  localStorage.setItem('polaris-theme', JSON.stringify(themeData));
}
```

### 4. Image Optimization

#### WebP Format
```typescript
// Use WebP with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Product" />
</picture>
```

#### Lazy Loading
```typescript
// Native lazy loading
<img src="product.jpg" loading="lazy" alt="Product" />

// Progressive loading for product galleries
const [imageLoaded, setImageLoaded] = useState(false);
```

## Performance Budget Configuration

### Setting Up Budgets

Create a `performance.config.js` file:

```javascript
export const performanceBudgets = {
  // Core Web Vitals
  FCP: 1800,    // First Contentful Paint (ms)
  LCP: 2500,    // Largest Contentful Paint (ms)
  FID: 100,     // First Input Delay (ms)
  CLS: 0.1,     // Cumulative Layout Shift

  // Bundle sizes
  bundle: 300 * 1024,        // Total bundle size (bytes)
  vendor: 150 * 1024,        // Vendor chunk size
  main: 100 * 1024,          // Main chunk size

  // Resource counts
  requests: 50,              // Total HTTP requests
  images: 20,                // Image requests
  fonts: 4,                  // Font requests
};
```

### CI/CD Integration

Add performance checks to your GitHub Actions:

```yaml
# .github/workflows/performance.yml
name: Performance Budget Check

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: yarn install
      
      - name: Build application
        run: yarn build
      
      - name: Run performance tests
        run: yarn test:performance
      
      - name: Check performance budget
        run: yarn performance:budget
```

## Monitoring in Production

### Real User Monitoring (RUM)

```typescript
// Send performance metrics to analytics
performanceCollector.onMetric('LCP', (metric) => {
  // Send to your analytics service
  analytics.track('Performance Metric', {
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
    page: window.location.pathname,
  });
});
```

### Error Tracking

```typescript
// Monitor performance-related errors
window.addEventListener('error', (event) => {
  if (event.error?.name === 'ChunkLoadError') {
    // Handle bundle loading errors
    console.error('Bundle loading failed:', event.error);
  }
});
```

## Troubleshooting

### Common Issues

#### High Bundle Size
- **Cause**: Large dependencies or duplicate code
- **Solution**: Implement code splitting and tree shaking
- **Check**: Bundle analysis tab for largest chunks

#### Poor LCP Scores
- **Cause**: Large images or slow server responses
- **Solution**: Optimize images and implement CDN
- **Check**: Network tab for slow resources

#### High Memory Usage
- **Cause**: Memory leaks or large data structures
- **Solution**: Implement proper cleanup and pagination
- **Check**: Runtime metrics tab for memory trends

#### Layout Shifts
- **Cause**: Images without dimensions or dynamic content
- **Solution**: Set explicit dimensions and reserve space
- **Check**: CLS metric in overview tab

### Performance Debugging

```typescript
// Enable detailed performance logging
if (process.env.NODE_ENV === 'development') {
  performanceCollector.onMetric('*', (metric) => {
    console.log(`[Performance] ${metric.name}: ${metric.value}ms`);
  });
}

// Memory leak detection
let memoryBaseline = 0;
memoryMonitor.onUsageChange((usage) => {
  if (memoryBaseline === 0) {
    memoryBaseline = usage.used;
  } else if (usage.used > memoryBaseline * 2) {
    console.warn('Potential memory leak detected');
  }
});
```

## Best Practices

### 1. Development Workflow
- Monitor performance during development
- Set up performance budgets early
- Use the performance dashboard regularly
- Profile before and after optimizations

### 2. Code Organization
- Lazy load non-critical components
- Use React.memo for expensive components
- Implement proper error boundaries
- Optimize re-renders with useMemo/useCallback

### 3. Shopify Integration
- Use GraphQL efficiently with proper fragments
- Implement proper loading states
- Cache API responses appropriately
- Use App Bridge for navigation

### 4. Monitoring Strategy
- Set realistic performance budgets
- Monitor real user metrics
- Track performance over time
- Alert on performance regressions

## Export and Reporting

### Exporting Performance Data

The Performance Monitor allows you to export comprehensive performance reports:

1. Click **Export Report** in the Performance Monitor
2. Choose from JSON, CSV, or detailed HTML reports
3. Share reports with your team or stakeholders
4. Use exported data for trend analysis

### Report Contents

Exported reports include:
- Core Web Vitals measurements
- Bundle analysis data
- Runtime performance metrics
- Optimization recommendations
- Historical performance trends
- Performance budget compliance

## Integration with Other Tools

### Shopify CLI Integration
```bash
# Add performance checks to Shopify CLI workflow
shopify app dev --performance-monitor

# Generate performance report
shopify app performance:report
```

### Storybook Integration
```typescript
// Add performance addon to Storybook
// .storybook/main.js
module.exports = {
  addons: [
    '@storybook/addon-performance',
    './performance-addon',
  ],
};
```

This comprehensive Performance Optimization Suite ensures your Shopify app maintains excellent performance while providing the tools and insights needed for continuous optimization. 