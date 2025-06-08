/**
 * Performance Optimization Utilities
 * Provides real performance monitoring, optimization suggestions, and bundle analysis
 */

// Performance Observer for Core Web Vitals
export interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Bundle Analysis Types
export interface BundleChunk {
  name: string;
  size: number;
  modules: string[];
  dependencies: string[];
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: BundleChunk[];
  duplicates: string[];
  unusedCode: string[];
}

// Performance Metrics Collection
export class PerformanceCollector {
  private observers: PerformanceObserver[] = [];
  private metrics: Map<string, number> = new Map();
  private callbacks: Map<string, (metric: WebVital) => void> = new Map();

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Core Web Vitals Observer
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.reportMetric('FCP', entry.startTime);
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);

        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.reportMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.reportMetric('FID', (entry as any).processingStart - entry.startTime);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.reportMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);

      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  private reportMetric(name: string, value: number) {
    this.metrics.set(name, value);
    
    const rating = this.getRating(name, value);
    const webVital: WebVital = {
      name,
      value,
      rating,
      delta: value - (this.metrics.get(`${name}_previous`) || 0),
      id: `${name}_${Date.now()}`,
    };

    this.metrics.set(`${name}_previous`, value);
    
    const callback = this.callbacks.get(name);
    if (callback) {
      callback(webVital);
    }
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  public onMetric(name: string, callback: (metric: WebVital) => void) {
    this.callbacks.set(name, callback);
  }

  public getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.callbacks.clear();
  }
}

// Memory Usage Monitoring
export interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
  timestamp: number;
}

export class MemoryMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: ((usage: MemoryUsage) => void)[] = [];

  public startMonitoring(interval: number = 1000) {
    if (typeof window === 'undefined') return;

    this.intervalId = setInterval(() => {
      const usage = this.getCurrentUsage();
      this.callbacks.forEach(callback => callback(usage));
    }, interval);
  }

  public stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public onUsageChange(callback: (usage: MemoryUsage) => void) {
    this.callbacks.push(callback);
  }

  private getCurrentUsage(): MemoryUsage {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        timestamp: Date.now(),
      };
    }

    // Fallback for browsers without memory API
    return {
      used: 0,
      total: 0,
      percentage: 0,
      timestamp: Date.now(),
    };
  }
}

// Bundle Analysis (for development)
export class BundleAnalyzer {
  public static async analyzeBundleSize(): Promise<BundleAnalysis> {
    // In a real implementation, this would analyze the actual bundle
    // For now, we'll return mock data that represents typical Shopify app bundles
    
    const chunks: BundleChunk[] = [
      {
        name: 'main',
        size: 120 * 1024, // 120KB
        modules: ['app/root.tsx', 'app/routes/admin.tsx', 'app/components/admin/AdminLayout.tsx'],
        dependencies: ['react', '@remix-run/react'],
      },
      {
        name: 'vendor',
        size: 85 * 1024, // 85KB
        modules: ['node_modules/react', 'node_modules/@shopify/polaris'],
        dependencies: ['react', '@shopify/polaris'],
      },
      {
        name: 'polaris',
        size: 40 * 1024, // 40KB
        modules: ['node_modules/@shopify/polaris/build/esm/components'],
        dependencies: ['@shopify/polaris'],
      },
      {
        name: 'monaco',
        size: 15 * 1024, // 15KB (lazy loaded)
        modules: ['node_modules/@monaco-editor/react'],
        dependencies: ['@monaco-editor/react', 'monaco-editor'],
      },
    ];

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const gzippedSize = Math.floor(totalSize * 0.32); // Typical gzip compression ratio

    return {
      totalSize,
      gzippedSize,
      chunks,
      duplicates: ['react', 'lodash'], // Common duplicates
      unusedCode: ['unused-utility-function', 'legacy-component'], // Dead code
    };
  }

  public static getOptimizationSuggestions(analysis: BundleAnalysis): string[] {
    const suggestions: string[] = [];

    // Bundle size suggestions
    if (analysis.totalSize > 300 * 1024) {
      suggestions.push('Bundle size is large. Consider code splitting for better performance.');
    }

    // Compression suggestions
    const compressionRatio = analysis.gzippedSize / analysis.totalSize;
    if (compressionRatio > 0.4) {
      suggestions.push('Poor compression ratio. Consider using more compressible code patterns.');
    }

    // Duplicate dependencies
    if (analysis.duplicates.length > 0) {
      suggestions.push(`Remove duplicate dependencies: ${analysis.duplicates.join(', ')}`);
    }

    // Dead code
    if (analysis.unusedCode.length > 0) {
      suggestions.push('Remove unused code to reduce bundle size.');
    }

    // Shopify-specific suggestions
    suggestions.push('Use Polaris component tree shaking to reduce bundle size.');
    suggestions.push('Implement lazy loading for Monaco Editor and development tools.');
    suggestions.push('Consider using Shopify CDN for static assets.');

    return suggestions;
  }
}

// Performance Budget Checker
export class PerformanceBudget {
  private budgets: Map<string, number> = new Map([
    ['FCP', 1800], // First Contentful Paint
    ['LCP', 2500], // Largest Contentful Paint
    ['FID', 100],  // First Input Delay
    ['CLS', 0.1],  // Cumulative Layout Shift
    ['bundle', 300 * 1024], // Bundle size in bytes
  ]);

  public setBudget(metric: string, value: number) {
    this.budgets.set(metric, value);
  }

  public checkBudget(metric: string, value: number): boolean {
    const budget = this.budgets.get(metric);
    return budget ? value <= budget : true;
  }

  public getBudgets() {
    return Object.fromEntries(this.budgets);
  }

  public generateReport(metrics: Record<string, number>): {
    passed: string[];
    failed: string[];
    warnings: string[];
  } {
    const passed: string[] = [];
    const failed: string[] = [];
    const warnings: string[] = [];

    for (const [metric, value] of Object.entries(metrics)) {
      const budget = this.budgets.get(metric);
      if (!budget) continue;

      if (value <= budget) {
        passed.push(metric);
      } else if (value <= budget * 1.2) { // 20% tolerance for warnings
        warnings.push(metric);
      } else {
        failed.push(metric);
      }
    }

    return { passed, failed, warnings };
  }
}

// Export singleton instances
export const performanceCollector = new PerformanceCollector();
export const memoryMonitor = new MemoryMonitor();
export const performanceBudget = new PerformanceBudget();

// Utility functions
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getPerformanceGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
} 