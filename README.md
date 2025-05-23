# Event Router Worker

Advanced event processing and routing system for multi-agent coordination using Cloudflare Workers and Durable Objects.

## Overview

The Event Router Worker is a sophisticated webhook processing system designed to handle high-volume event streams from multiple sources (GitHub, Linear, Slack) and route them to appropriate agents with advanced filtering, queuing, and real-time streaming capabilities.

## Features

### Core Capabilities

- **Advanced Webhook Processing**: Multi-platform signature validation and secure request handling
- **Event Filtering & Transformation**: Rule-based filtering with complex condition evaluation
- **Priority-based Queuing**: Intelligent event queuing with retry logic and dead letter queues
- **Real-time Streaming**: WebSocket and Server-Sent Events for live event distribution
- **Comprehensive Analytics**: Event metrics, performance tracking, and monitoring
- **Rate Limiting**: Sophisticated rate limiting with multiple strategies
- **Fault Tolerance**: Automatic retry with exponential backoff and failure recovery

### Performance Targets

- **Throughput**: 10,000+ events per minute
- **Concurrency**: 1,000+ concurrent webhook requests
- **Latency**: <100ms event processing time
- **Reliability**: 99.9% event delivery success rate
- **Scalability**: Auto-scaling with global distribution

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Webhook       │    │   Event Router   │    │   Agent         │
│   Sources       │───▶│   Worker         │───▶│   Endpoints     │
│                 │    │                  │    │                 │
│ • GitHub        │    │ • Validation     │    │ • Review Agent  │
│ • Linear        │    │ • Filtering      │    │ • Context Agent │
│ • Slack         │    │ • Routing        │    │ • Pattern Agent │
│ • Internal      │    │ • Queuing        │    │ • Custom Agents │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Storage &      │
                       │   Analytics      │
                       │                  │
                       │ • KV Storage     │
                       │ • R2 Archive     │
                       │ • Durable Objects│
                       │ • Real-time      │
                       │   Streaming      │
                       └──────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account with Workers enabled
- Wrangler CLI installed

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd event-router-worker

# Install dependencies
npm install

# Configure environment
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:load

# Lint code
npm run lint

# Type check
npm run type-check
```

### Deployment

```bash
# Deploy to staging
wrangler deploy --env staging

# Deploy to production
wrangler deploy --env production
```

## Configuration

### Environment Variables

```toml
# wrangler.toml
[vars]
ENVIRONMENT = "production"
MAX_EVENT_SIZE = "1048576"  # 1MB
DEFAULT_RETRY_ATTEMPTS = "3"
DEFAULT_RETRY_DELAY = "1000"  # 1 second
MAX_QUEUE_SIZE = "10000"
RATE_LIMIT_WINDOW = "60000"  # 1 minute
DEFAULT_RATE_LIMIT = "1000"  # requests per window
```

### Secrets

Set up webhook secrets and API keys:

```bash
# Webhook secrets
wrangler secret put GITHUB_WEBHOOK_SECRET
wrangler secret put LINEAR_WEBHOOK_SECRET
wrangler secret put SLACK_WEBHOOK_SECRET

# Agent API key
wrangler secret put AGENT_API_KEY
```

### Storage Bindings

The worker requires several storage bindings:

- **KV Namespaces**: Event filters, routes, rate limits, subscriptions, analytics cache
- **R2 Buckets**: Event archive, dead letter queue
- **Durable Objects**: Queue management, subscription management, event processing

## API Reference

### Webhook Endpoints

#### Process Webhook
```
POST /webhook/{source}
```

Processes incoming webhooks from various sources.

**Parameters:**
- `source`: Source platform (github, linear, slack)

**Headers:**
- `Content-Type`: application/json
- `X-Hub-Signature-256`: GitHub signature (for GitHub webhooks)
- `Linear-Signature`: Linear signature (for Linear webhooks)
- `X-Slack-Signature`: Slack signature (for Slack webhooks)
- `X-Slack-Request-Timestamp`: Slack timestamp (for Slack webhooks)

**Response:**
```json
{
  "success": true,
  "eventId": "uuid",
  "processed": true,
  "routed": true,
  "timestamp": 1234567890
}
```

### Streaming Endpoints

#### WebSocket Connection
```
GET /stream/ws?agentId={agentId}&filters={filters}
```

Establishes WebSocket connection for real-time event streaming.

#### Server-Sent Events
```
GET /stream/sse?agentId={agentId}&filters={filters}
```

Establishes SSE connection for real-time event streaming.

### Analytics Endpoints

#### Get Metrics
```
GET /analytics/metrics?hours={hours}
```

Retrieves analytics data for specified time range.

#### Queue Statistics
```
GET /queue/stats
```

Returns current queue statistics.

### Health Check
```
GET /health
```

Returns service health status.

## Event Processing Pipeline

### 1. Webhook Validation

```typescript
// Signature validation
const isValid = await signatureValidator.validateWebhookSignature(
  source,
  payload,
  signature,
  timestamp
);
```

### 2. Rate Limiting

```typescript
// Check and enforce rate limits
await rateLimiter.enforceRateLimit(source, identifier);
```

### 3. Event Filtering

```typescript
// Apply configured filters
const shouldProcess = await eventRouter.filterEvent(event);
```

### 4. Event Routing

```typescript
// Route to target agents
await eventRouter.routeEvent(event);
```

### 5. Queue Processing

```typescript
// Queue for delivery with retry logic
await eventRouter.queueEvent(event, priority, targetAgent, retryPolicy);
```

## Event Filters

Event filters allow fine-grained control over which events are processed and how they're transformed.

### Filter Configuration

```typescript
interface EventFilter {
  id: string;
  name: string;
  description: string;
  source?: string; // github, linear, slack, internal
  eventType?: string;
  conditions: FilterCondition[];
  action: 'include' | 'exclude' | 'transform';
  priority: number;
  enabled: boolean;
}
```

### Filter Conditions

```typescript
interface FilterCondition {
  field: string; // JSON path in event payload
  operator: 'equals' | 'contains' | 'regex' | 'exists' | 'gt' | 'lt';
  value: any;
  caseSensitive?: boolean;
}
```

### Example Filters

```javascript
// Exclude draft pull requests
{
  "id": "exclude-drafts",
  "name": "Exclude Draft PRs",
  "source": "github",
  "eventType": "pull_request",
  "conditions": [
    {
      "field": "payload.pull_request.draft",
      "operator": "equals",
      "value": true
    }
  ],
  "action": "exclude",
  "priority": 1,
  "enabled": true
}

// Include high-priority Linear issues
{
  "id": "high-priority-issues",
  "name": "High Priority Issues",
  "source": "linear",
  "eventType": "issue",
  "conditions": [
    {
      "field": "payload.data.priority",
      "operator": "gt",
      "value": 3
    }
  ],
  "action": "include",
  "priority": 5,
  "enabled": true
}
```

## Event Routes

Event routes define how filtered events are distributed to target agents.

### Route Configuration

```typescript
interface EventRoute {
  id: string;
  name: string;
  description: string;
  sourceFilters: EventFilter[];
  targetAgents: string[];
  transformation?: EventTransformation;
  priority: number;
  retryPolicy: RetryPolicy;
  enabled: boolean;
}
```

### Retry Policies

```typescript
interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
}
```

## Real-time Streaming

### WebSocket Usage

```javascript
const ws = new WebSocket('wss://your-worker.domain/stream/ws?agentId=agent-1');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'event':
      handleEvent(message.data);
      break;
    case 'heartbeat':
      console.log('Heartbeat received');
      break;
    case 'subscription_update':
      console.log('Subscription updated:', message.data);
      break;
  }
};
```

### Server-Sent Events Usage

```javascript
const eventSource = new EventSource('/stream/sse?agentId=agent-1');

eventSource.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleEvent(message);
};
```

## Rate Limiting

The system supports multiple rate limiting strategies:

### Fixed Window
Standard rate limiting with fixed time windows.

### Sliding Window
More accurate rate limiting that considers request distribution over time.

### Token Bucket
Allows burst traffic while maintaining average rate limits.

### Configuration

```typescript
// Set custom rate limit
await rateLimiter.setRateLimitConfig({
  source: 'github',
  identifier: 'user123',
  limit: 200,
  window: 60000, // 1 minute
  burst: 300
});
```

## Analytics and Monitoring

### Metrics Collected

- **Event Metrics**: Received, processed, filtered, delivered, failed
- **Performance Metrics**: Processing time, throughput, latency
- **Error Metrics**: Error rates, failure patterns, retry statistics
- **Agent Metrics**: Delivery success rates, response times

### Accessing Analytics

```javascript
// Get real-time metrics
const metrics = await fetch('/analytics/metrics?hours=24');
const data = await metrics.json();

console.log('Total events:', data.metrics.totalEvents);
console.log('Success rate:', data.metrics.successfulEvents / data.metrics.totalEvents);
console.log('Average processing time:', data.metrics.averageProcessingTime);
```

## Testing

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npx vitest tests/unit/signature-validator.test.ts
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration
```

### Load Tests

```bash
# Run load tests
npm run test:load
```

### Test Coverage

```bash
# Generate coverage report
npm test -- --coverage
```

## Security

### Webhook Security

- **Signature Validation**: All webhooks must include valid signatures
- **Timestamp Validation**: Slack webhooks include timestamp validation to prevent replay attacks
- **Rate Limiting**: Protects against DDoS and abuse
- **Input Validation**: Strict payload validation and sanitization

### Access Control

- **Agent Authentication**: API key validation for agent connections
- **Subscription Management**: Secure subscription filtering and access control
- **Audit Logging**: Comprehensive security event logging

### Data Protection

- **Encryption**: Sensitive data encrypted in transit and at rest
- **Data Retention**: Configurable retention policies for event data
- **Privacy Compliance**: GDPR and privacy-compliant data handling

## Performance Optimization

### Caching Strategy

- **KV Storage**: Fast access to filters, routes, and rate limit data
- **R2 Storage**: Long-term archival of event data
- **In-Memory Caching**: Hot data cached in worker memory

### Queue Optimization

- **Priority Queuing**: High-priority events processed first
- **Batch Processing**: Efficient batch processing of queued events
- **Parallel Processing**: Concurrent event delivery to multiple agents

### Monitoring

- **Real-time Metrics**: Live performance monitoring
- **Alerting**: Automated alerts for performance degradation
- **Scaling**: Auto-scaling based on load patterns

## Troubleshooting

### Common Issues

#### Webhook Signature Validation Failures
```
Error: Invalid webhook signature
```
**Solution**: Verify webhook secrets are correctly configured and match the source platform settings.

#### Rate Limit Exceeded
```
Error: Rate limit exceeded for github:user123
```
**Solution**: Check rate limit configuration and consider increasing limits for legitimate traffic.

#### Event Processing Failures
```
Error: Failed to process event
```
**Solution**: Check event filters and routing configuration. Review error logs for specific failure reasons.

### Debugging

Enable debug logging:
```toml
[vars]
LOG_LEVEL = "debug"
```

Check queue statistics:
```bash
curl https://your-worker.domain/queue/stats
```

Monitor analytics:
```bash
curl https://your-worker.domain/analytics/metrics
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage above 90%
- Use conventional commit messages
- Update documentation for new features

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting guide
- Review the API documentation
- Contact the development team

---

**Event Router Worker** - Advanced event processing for multi-agent systems

