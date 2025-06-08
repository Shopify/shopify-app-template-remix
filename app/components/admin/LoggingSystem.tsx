import React, { useState, useEffect, useRef } from 'react';
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
  ButtonGroup,
  Tabs,
  Filters,
  EmptyState,
  Tooltip,
} from '@shopify/polaris';
import { 
  DeleteIcon, 
  ExportIcon, 
  SearchIcon, 
  FilterIcon,
  PlayIcon,
  PauseIcon,
  RefreshIcon,
} from '@shopify/polaris-icons';

// Log entry types
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: 'admin' | 'storefront' | 'api' | 'webhooks' | 'app-bridge' | 'system';
  message: string;
  data?: any;
  traceId?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  stack?: string;
}

// Log filter options
interface LogFilters {
  levels: string[];
  sources: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  search: string;
  traceId?: string;
}

// Performance metrics
interface PerformanceMetrics {
  totalLogs: number;
  errorRate: number;
  avgResponseTime: number;
  requestsPerMinute: number;
  topErrors: Array<{ message: string; count: number; }>;
  slowestEndpoints: Array<{ url: string; avgDuration: number; }>;
}

// Mock log data generator
const generateMockLog = (): LogEntry => {
  const levels: LogEntry['level'][] = ['debug', 'info', 'warn', 'error'];
  const sources: LogEntry['source'][] = ['admin', 'storefront', 'api', 'webhooks', 'app-bridge', 'system'];
  const messages = [
    'User authenticated successfully',
    'Product created with ID: 12345',
    'API rate limit warning: 80% of quota used',
    'Webhook delivery failed: timeout after 30s',
    'App Bridge navigation event triggered',
    'Database query executed',
    'Cache miss for key: products_list',
    'Order processing completed',
    'Customer data synchronized',
    'Payment webhook received',
    'Inventory level updated',
    'Theme extension loaded',
    'Checkout extension rendered',
    'Session expired for user',
    'Background job queued',
  ];

  const level = levels[Math.floor(Math.random() * levels.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const message = messages[Math.floor(Math.random() * messages.length)];

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    level,
    source,
    message,
    traceId: `trace_${Math.random().toString(36).substr(2, 9)}`,
    userId: Math.random() > 0.7 ? `user_${Math.floor(Math.random() * 1000)}` : undefined,
    sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
    url: source === 'api' ? `/admin/api/2024-01/${['products', 'orders', 'customers'][Math.floor(Math.random() * 3)]}.json` : undefined,
    method: source === 'api' ? ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)] : undefined,
    statusCode: source === 'api' ? [200, 201, 400, 404, 500][Math.floor(Math.random() * 5)] : undefined,
    duration: source === 'api' ? Math.floor(Math.random() * 2000) + 50 : undefined,
    data: level === 'error' ? { error: 'Sample error data', code: 'ERR_001' } : undefined,
    stack: level === 'error' ? 'Error: Sample error\n    at function1 (file1.js:10:5)\n    at function2 (file2.js:20:10)' : undefined,
  };
};

export function LoggingSystem() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [filters, setFilters] = useState<LogFilters>({
    levels: [],
    sources: [],
    dateRange: {},
    search: '',
  });
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalLogs: 0,
    errorRate: 0,
    avgResponseTime: 0,
    requestsPerMinute: 0,
    topErrors: [],
    slowestEndpoints: [],
  });

  const streamingInterval = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const tabs = [
    {
      id: 'live',
      content: 'Live Logs',
      accessibilityLabel: 'Live log streaming',
      panelID: 'live-panel',
    },
    {
      id: 'analysis',
      content: 'Log Analysis',
      accessibilityLabel: 'Log analysis and metrics',
      panelID: 'analysis-panel',
    },
    {
      id: 'search',
      content: 'Search & Filter',
      accessibilityLabel: 'Search and filter logs',
      panelID: 'search-panel',
    },
    {
      id: 'export',
      content: 'Export & Share',
      accessibilityLabel: 'Export and share logs',
      panelID: 'export-panel',
    },
  ];

  // Start/stop log streaming
  const toggleStreaming = () => {
    if (isStreaming) {
      if (streamingInterval.current) {
        clearInterval(streamingInterval.current);
        streamingInterval.current = null;
      }
      setIsStreaming(false);
    } else {
      streamingInterval.current = setInterval(() => {
        const newLog = generateMockLog();
        setLogs(prev => [newLog, ...prev.slice(0, 999)]); // Keep last 1000 logs
      }, 1000 + Math.random() * 2000); // Random interval between 1-3 seconds
      setIsStreaming(true);
    }
  };

  // Filter logs based on current filters
  const filteredLogs = logs.filter(log => {
    if (filters.levels.length > 0 && !filters.levels.includes(log.level)) return false;
    if (filters.sources.length > 0 && !filters.sources.includes(log.source)) return false;
    if (filters.search && !log.message.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.traceId && log.traceId !== filters.traceId) return false;
    if (filters.dateRange.start && log.timestamp < filters.dateRange.start) return false;
    if (filters.dateRange.end && log.timestamp > filters.dateRange.end) return false;
    return true;
  });

  // Calculate metrics
  useEffect(() => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const recentLogs = logs.filter(log => log.timestamp >= oneMinuteAgo);
    
    const errorLogs = logs.filter(log => log.level === 'error');
    const apiLogs = logs.filter(log => log.source === 'api' && log.duration);
    
    const errorCounts: Record<string, number> = {};
    errorLogs.forEach(log => {
      errorCounts[log.message] = (errorCounts[log.message] || 0) + 1;
    });

    const endpointDurations: Record<string, number[]> = {};
    apiLogs.forEach(log => {
      if (log.url && log.duration) {
        if (!endpointDurations[log.url]) endpointDurations[log.url] = [];
        endpointDurations[log.url].push(log.duration);
      }
    });

    setMetrics({
      totalLogs: logs.length,
      errorRate: logs.length > 0 ? (errorLogs.length / logs.length) * 100 : 0,
      avgResponseTime: apiLogs.length > 0 ? apiLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / apiLogs.length : 0,
      requestsPerMinute: recentLogs.length,
      topErrors: Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([message, count]) => ({ message, count })),
      slowestEndpoints: Object.entries(endpointDurations)
        .map(([url, durations]) => ({
          url,
          avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length
        }))
        .sort((a, b) => b.avgDuration - a.avgDuration)
        .slice(0, 5),
    });
  }, [logs]);

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamingInterval.current) {
        clearInterval(streamingInterval.current);
      }
    };
  }, []);

  // Get badge tone for log level
  const getLevelBadgeTone = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'critical';
      case 'warn': return 'warning';
      case 'info': return 'info';
      case 'debug': return 'subdued';
      default: return 'subdued';
    }
  };

  // Get badge tone for source
  const getSourceBadgeTone = (source: LogEntry['source']) => {
    switch (source) {
      case 'admin': return 'success';
      case 'storefront': return 'info';
      case 'api': return 'attention';
      case 'webhooks': return 'warning';
      case 'app-bridge': return 'magic';
      case 'system': return 'subdued';
      default: return 'subdued';
    }
  };

  // Clear all logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Export logs
  const exportLogs = (format: 'json' | 'csv' | 'txt') => {
    const dataToExport = filteredLogs;
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(dataToExport, null, 2);
        filename = `logs_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        const headers = ['timestamp', 'level', 'source', 'message', 'traceId', 'url', 'method', 'statusCode', 'duration'];
        const csvRows = [
          headers.join(','),
          ...dataToExport.map(log => 
            headers.map(header => {
              const value = log[header as keyof LogEntry];
              return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value || '';
            }).join(',')
          )
        ];
        content = csvRows.join('\n');
        filename = `logs_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
      case 'txt':
        content = dataToExport.map(log => 
          `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()} [${log.source}] ${log.message}${log.traceId ? ` (trace: ${log.traceId})` : ''}`
        ).join('\n');
        filename = `logs_${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render live logs panel
  const renderLiveLogsPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <InlineStack gap="200" align="space-between">
              <Text as="h3" variant="headingMd">Live Log Stream</Text>
              <InlineStack gap="200">
                <Badge tone={isStreaming ? 'success' : 'subdued'}>
                  {isStreaming ? 'Streaming' : 'Stopped'}
                </Badge>
                <Button
                  variant={isStreaming ? 'primary' : 'secondary'}
                  onClick={toggleStreaming}
                  icon={isStreaming ? PauseIcon : PlayIcon}
                >
                  {isStreaming ? 'Stop' : 'Start'} Stream
                </Button>
                <Button
                  onClick={clearLogs}
                  icon={DeleteIcon}
                  tone="critical"
                >
                  Clear Logs
                </Button>
              </InlineStack>
            </InlineStack>
            
            <Banner>
              <p>
                Real-time log streaming from your Shopify app. 
                {isStreaming ? ' Logs are being captured live.' : ' Click "Start Stream" to begin capturing logs.'}
              </p>
            </Banner>
          </BlockStack>
        </Box>
      </Card>

      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <InlineStack gap="200" align="space-between">
              <Text as="h4" variant="headingSm">Recent Logs ({filteredLogs.length})</Text>
              <InlineStack gap="200">
                <TextField
                  label=""
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                  prefix={<SearchIcon />}
                  autoComplete="off"
                />
                <Button icon={FilterIcon}>
                  Filters
                </Button>
              </InlineStack>
            </InlineStack>

            <Divider />

            {filteredLogs.length === 0 ? (
              <EmptyState
                heading="No logs available"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>{isStreaming ? 'Waiting for logs...' : 'Start streaming to see logs appear here.'}</p>
              </EmptyState>
            ) : (
              <Scrollable style={{ height: '500px' }}>
                <BlockStack gap="200">
                  {filteredLogs.map((log) => (
                    <Card key={log.id} background="bg-surface-secondary">
                      <Box padding="300">
                        <BlockStack gap="200">
                          <InlineStack gap="200" align="space-between">
                            <InlineStack gap="200">
                              <Badge tone={getLevelBadgeTone(log.level) as any}>
                                {log.level.toUpperCase()}
                              </Badge>
                              <Badge tone={getSourceBadgeTone(log.source) as any}>
                                {log.source}
                              </Badge>
                              {log.statusCode && (
                                <Badge tone={log.statusCode >= 400 ? 'critical' : 'success'}>
                                  {log.statusCode}
                                </Badge>
                              )}
                            </InlineStack>
                            <Text as="span" variant="bodySm" tone="subdued">
                              {log.timestamp.toLocaleTimeString()}
                            </Text>
                          </InlineStack>
                          
                          <Text as="p" variant="bodyMd">
                            {log.message}
                          </Text>
                          
                          {(log.url || log.traceId || log.duration) && (
                            <InlineStack gap="200">
                              {log.url && (
                                <Text as="span" variant="bodySm" tone="subdued">
                                  {log.method} {log.url}
                                </Text>
                              )}
                              {log.duration && (
                                <Text as="span" variant="bodySm" tone="subdued">
                                  {log.duration}ms
                                </Text>
                              )}
                              {log.traceId && (
                                <Tooltip content="Click to filter by trace ID">
                                  <Button
                                    size="slim"
                                    variant="plain"
                                    onClick={() => setFilters(prev => ({ ...prev, traceId: log.traceId }))}
                                  >
                                    {log.traceId}
                                  </Button>
                                </Tooltip>
                              )}
                            </InlineStack>
                          )}
                          
                          {(log.data || log.stack) && (
                            <Button
                              size="slim"
                              onClick={() => {
                                setSelectedLog(log);
                                setShowLogDetail(true);
                              }}
                            >
                              View Details
                            </Button>
                          )}
                        </BlockStack>
                      </Box>
                    </Card>
                  ))}
                  <div ref={logsEndRef} />
                </BlockStack>
              </Scrollable>
            )}
          </BlockStack>
        </Box>
      </Card>
    </BlockStack>
  );

  // Render analysis panel
  const renderAnalysisPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">Performance Metrics</Text>
            <Banner>
              <p>Real-time analysis of your application's performance and error patterns.</p>
            </Banner>
          </BlockStack>
        </Box>
      </Card>

      <Layout>
        <Layout.Section variant="oneThird">
          <Card>
            <Box padding="400">
              <BlockStack gap="200">
                <Text as="h4" variant="headingSm">Total Logs</Text>
                <Text as="p" variant="headingLg">{metrics.totalLogs.toLocaleString()}</Text>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <Box padding="400">
              <BlockStack gap="200">
                <Text as="h4" variant="headingSm">Error Rate</Text>
                <Text as="p" variant="headingLg">{metrics.errorRate.toFixed(1)}%</Text>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <Box padding="400">
              <BlockStack gap="200">
                <Text as="h4" variant="headingSm">Avg Response Time</Text>
                <Text as="p" variant="headingLg">{metrics.avgResponseTime.toFixed(0)}ms</Text>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>

      <Layout>
        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h4" variant="headingSm">Top Errors</Text>
                {metrics.topErrors.length === 0 ? (
                  <Text as="p" tone="subdued">No errors recorded</Text>
                ) : (
                  <BlockStack gap="200">
                    {metrics.topErrors.map((error, index) => (
                      <InlineStack key={index} gap="200" align="space-between">
                        <Text as="span" variant="bodySm">{error.message}</Text>
                        <Badge tone="critical">{error.count}</Badge>
                      </InlineStack>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h4" variant="headingSm">Slowest Endpoints</Text>
                {metrics.slowestEndpoints.length === 0 ? (
                  <Text as="p" tone="subdued">No API calls recorded</Text>
                ) : (
                  <BlockStack gap="200">
                    {metrics.slowestEndpoints.map((endpoint, index) => (
                      <InlineStack key={index} gap="200" align="space-between">
                        <Text as="span" variant="bodySm">{endpoint.url}</Text>
                        <Badge tone="warning">{endpoint.avgDuration.toFixed(0)}ms</Badge>
                      </InlineStack>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </BlockStack>
  );

  // Render search panel
  const renderSearchPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">Advanced Search & Filtering</Text>
            <Banner>
              <p>Use advanced filters to find specific logs and trace issues across your application.</p>
            </Banner>
          </BlockStack>
        </Box>
      </Card>

      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="h4" variant="headingSm">Filter Options</Text>
            
            <TextField
              label="Search Message"
              value={filters.search}
              onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
              placeholder="Search in log messages..."
              autoComplete="off"
            />

            <TextField
              label="Trace ID"
              value={filters.traceId || ''}
              onChange={(value) => setFilters(prev => ({ ...prev, traceId: value || undefined }))}
              placeholder="Filter by trace ID..."
              autoComplete="off"
            />

            <Text as="p" variant="bodySm">
              Found {filteredLogs.length} logs matching current filters
            </Text>

            <Button onClick={() => setFilters({ levels: [], sources: [], dateRange: {}, search: '', traceId: undefined })}>
              Clear All Filters
            </Button>
          </BlockStack>
        </Box>
      </Card>
    </BlockStack>
  );

  // Render export panel
  const renderExportPanel = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">Export & Share Logs</Text>
            <Banner>
              <p>Export logs for external analysis or share with your team for debugging.</p>
            </Banner>
          </BlockStack>
        </Box>
      </Card>

      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="h4" variant="headingSm">Export Options</Text>
            
            <Text as="p" variant="bodySm">
              Export {filteredLogs.length} filtered logs in your preferred format:
            </Text>

            <ButtonGroup>
              <Button onClick={() => exportLogs('json')} icon={ExportIcon}>
                Export as JSON
              </Button>
              <Button onClick={() => exportLogs('csv')} icon={ExportIcon}>
                Export as CSV
              </Button>
              <Button onClick={() => exportLogs('txt')} icon={ExportIcon}>
                Export as Text
              </Button>
            </ButtonGroup>
          </BlockStack>
        </Box>
      </Card>
    </BlockStack>
  );

  // Render log detail modal
  const renderLogDetailModal = () => (
    <Modal
      open={showLogDetail}
      onClose={() => setShowLogDetail(false)}
      title="Log Details"
      large
    >
      <Modal.Section>
        {selectedLog && (
          <BlockStack gap="300">
            <InlineStack gap="200">
              <Badge tone={getLevelBadgeTone(selectedLog.level) as any}>
                {selectedLog.level.toUpperCase()}
              </Badge>
              <Badge tone={getSourceBadgeTone(selectedLog.source) as any}>
                {selectedLog.source}
              </Badge>
              <Text as="span" variant="bodySm" tone="subdued">
                {selectedLog.timestamp.toISOString()}
              </Text>
            </InlineStack>

            <Text as="p" variant="bodyMd" fontWeight="medium">
              {selectedLog.message}
            </Text>

            {selectedLog.data && (
              <BlockStack gap="200">
                <Text as="h4" variant="headingSm">Additional Data</Text>
                <TextField
                  label=""
                  value={JSON.stringify(selectedLog.data, null, 2)}
                  multiline={8}
                  readOnly
                  autoComplete="off"
                />
              </BlockStack>
            )}

            {selectedLog.stack && (
              <BlockStack gap="200">
                <Text as="h4" variant="headingSm">Stack Trace</Text>
                <TextField
                  label=""
                  value={selectedLog.stack}
                  multiline={10}
                  readOnly
                  autoComplete="off"
                />
              </BlockStack>
            )}
          </BlockStack>
        )}
      </Modal.Section>
    </Modal>
  );

  return (
    <Page title="Development Logging System">
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
              <Box padding="400">
                {selectedTab === 0 && renderLiveLogsPanel()}
                {selectedTab === 1 && renderAnalysisPanel()}
                {selectedTab === 2 && renderSearchPanel()}
                {selectedTab === 3 && renderExportPanel()}
              </Box>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
      {renderLogDetailModal()}
    </Page>
  );
} 