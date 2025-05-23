# Event Router Worker Implementation Guide

This guide provides detailed implementation instructions for the Event Router Worker system.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Implementation Phases](#implementation-phases)
3. [Core Components](#core-components)
4. [Integration Examples](#integration-examples)
5. [Deployment Strategy](#deployment-strategy)
6. [Testing Strategy](#testing-strategy)
7. [Performance Optimization](#performance-optimization)
8. [Security Implementation](#security-implementation)

## Architecture Overview

The Event Router Worker follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Event Router Worker                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Webhook    │  │   Event     │  │  Real-time  │         │
│  │ Processing  │  │ Filtering   │  │  Streaming  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Queue    │  │    Rate     │  │  Analytics  │         │
│  │ Management  │  │  Limiting   │  │ & Monitoring│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    Storage Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ KV Storage  │  │ R2 Storage  │  │   Durable   │         │
│  │             │  │             │  │   Objects   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

#### 1.1 Project Setup
- [x] Initialize TypeScript project with Cloudflare Workers
- [x] Configure build tools (Wrangler, ESLint, Vitest)
- [x] Set up type definitions and interfaces
- [x] Create basic project structure

#### 1.2 Basic Webhook Processing
- [x] Implement signature validation utilities
- [x] Create webhook request parsing
- [x] Add basic error handling
- [x] Set up routing infrastructure

#### 1.3 Storage Configuration
- [x] Configure KV namespaces
- [x] Set up R2 buckets
- [x] Define Durable Object classes
- [x] Create storage abstractions

### Phase 2: Event Processing (Week 2)

#### 2.1 Event Filtering System
```typescript
// Implementation example
class EventFilterEngine {
  async evaluateFilters(event: EventData, filters: EventFilter[]): Promise<boolean> {
    for (const filter of filters) {
      if (!filter.enabled) continue;
      
      const matches = await this.evaluateFilter(event, filter);
      if (matches) {
        switch (filter.action) {
          case 'exclude':
            return false;
          case 'include':
            return true;
          case 'transform':
            await this.transformEvent(event, filter);
            break;
        }
      }
    }
    return true;
  }
}
```

#### 2.2 Event Routing Engine
```typescript
// Implementation example
class EventRoutingEngine {
  async routeEvent(event: EventData): Promise<void> {
    const routes = await this.getApplicableRoutes(event);
    
    for (const route of routes) {
      for (const targetAgent of route.targetAgents) {
        const routedEvent = await this.prepareEventForAgent(event, route, targetAgent);
        await this.queueForDelivery(routedEvent, route.priority, route.retryPolicy);
      }
    }
  }
}
```

#### 2.3 Queue Management
```typescript
// Durable Object implementation
export class QueueManager {
  async processQueue(): Promise<void> {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      
      try {
        await this.deliverEvent(event);
      } catch (error) {
        await this.handleDeliveryFailure(event, error);
      }
    }
  }
}
```

### Phase 3: Advanced Features (Week 3)

#### 3.1 Real-time Streaming
```typescript
// WebSocket implementation
class EventStreamer {
  async handleWebSocketConnection(request: Request): Promise<Response> {
    const { agentId, filters } = this.parseConnectionParams(request);
    
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    
    server.accept();
    
    // Set up event handlers
    this.setupConnectionHandlers(server, agentId, filters);
    
    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
}
```

#### 3.2 Analytics System
```typescript
// Analytics implementation
class EventAnalytics {
  async recordEventMetric(event: EventData, status: EventStatus): Promise<void> {
    const metric: EventMetrics = {
      eventId: event.id,
      source: event.source,
      type: event.type,
      timestamp: Date.now(),
      status,
      processingTime: this.calculateProcessingTime(event)
    };
    
    await this.storeMetric(metric);
    await this.updateAggregates(metric);
  }
}
```

#### 3.3 Rate Limiting
```typescript
// Rate limiting implementation
class RateLimiter {
  async enforceRateLimit(source: string, identifier: string): Promise<void> {
    const config = await this.getRateLimitConfig(source, identifier);
    const state = await this.getRateLimitState(source, identifier);
    
    if (!this.isWithinLimit(state, config)) {
      throw new RateLimitError('Rate limit exceeded', {
        resetTime: state.resetTime,
        retryAfter: Math.ceil((state.resetTime - Date.now()) / 1000)
      });
    }
    
    await this.incrementCounter(source, identifier);
  }
}
```

### Phase 4: Production Readiness (Week 4)

#### 4.1 Security Hardening
- Implement comprehensive input validation
- Add security headers and CORS policies
- Set up audit logging
- Configure secret management

#### 4.2 Performance Optimization
- Implement caching strategies
- Optimize database queries
- Add connection pooling
- Configure auto-scaling

#### 4.3 Monitoring and Alerting
- Set up health checks
- Configure performance monitoring
- Implement alerting rules
- Create operational dashboards

## Core Components

### Signature Validator

The signature validator ensures webhook authenticity:

```typescript
class SignatureValidator {
  async validateGitHubSignature(payload: string, signature: string, secret: string): Promise<boolean> {
    const expectedSignature = signature.slice(7); // Remove 'sha256=' prefix
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(payload)
    );
    
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return this.constantTimeCompare(expectedSignature, computedSignature);
  }
}
```

### Event Filter Engine

Implements complex event filtering logic:

```typescript
class EventFilterEngine {
  private evaluateCondition(event: EventData, condition: FilterCondition): boolean {
    const value = this.getValueByPath(event, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'regex':
        const regex = new RegExp(condition.value, condition.caseSensitive ? '' : 'i');
        return regex.test(String(value));
      case 'exists':
        return value !== undefined && value !== null;
      case 'gt':
        return Number(value) > Number(condition.value);
      case 'lt':
        return Number(value) < Number(condition.value);
      default:
        return false;
    }
  }
}
```

### Queue Manager Durable Object

Handles persistent queue state:

```typescript
export class QueueManager {
  private async calculateNextRetryTime(retryableEvent: RetryableEvent): number {
    const { backoffStrategy, baseDelay, maxDelay, jitter } = retryableEvent.retryPolicy;
    let delay = baseDelay;
    
    switch (backoffStrategy) {
      case 'linear':
        delay = baseDelay * (retryableEvent.attemptCount + 1);
        break;
      case 'exponential':
        delay = baseDelay * Math.pow(2, retryableEvent.attemptCount);
        break;
      case 'fixed':
        delay = baseDelay;
        break;
    }
    
    delay = Math.min(delay, maxDelay);
    
    if (jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Date.now() + delay;
  }
}
```

## Integration Examples

### GitHub Webhook Integration

```typescript
// GitHub webhook configuration
const githubWebhookConfig = {
  url: 'https://your-worker.domain/webhook/github',
  content_type: 'json',
  secret: process.env.GITHUB_WEBHOOK_SECRET,
  events: [
    'pull_request',
    'issues',
    'push',
    'release'
  ]
};

// Event filter for GitHub PRs
const githubPRFilter: EventFilter = {
  id: 'github-pr-filter',
  name: 'GitHub PR Filter',
  description: 'Filter GitHub pull request events',
  source: 'github',
  eventType: 'pull_request',
  conditions: [
    {
      field: 'payload.action',
      operator: 'in',
      value: ['opened', 'synchronize', 'closed']
    },
    {
      field: 'payload.pull_request.draft',
      operator: 'equals',
      value: false
    }
  ],
  action: 'include',
  priority: 5,
  enabled: true
};
```

### Linear Webhook Integration

```typescript
// Linear webhook configuration
const linearWebhookConfig = {
  url: 'https://your-worker.domain/webhook/linear',
  secret: process.env.LINEAR_WEBHOOK_SECRET,
  events: [
    'Issue',
    'Comment',
    'Project',
    'Cycle'
  ]
};

// Event route for Linear issues
const linearIssueRoute: EventRoute = {
  id: 'linear-issue-route',
  name: 'Linear Issue Route',
  description: 'Route Linear issues to appropriate agents',
  sourceFilters: [
    {
      id: 'linear-issue-filter',
      source: 'linear',
      eventType: 'Issue',
      conditions: [
        {
          field: 'payload.data.priority',
          operator: 'gt',
          value: 2
        }
      ],
      action: 'include'
    }
  ],
  targetAgents: ['issue-triage-agent', 'priority-escalation-agent'],
  priority: 8,
  retryPolicy: {
    maxAttempts: 3,
    backoffStrategy: 'exponential',
    baseDelay: 1000,
    maxDelay: 30000,
    jitter: true
  },
  enabled: true
};
```

### Agent Subscription Example

```typescript
// Agent subscribing to events
class ReviewAgent {
  async subscribeToEvents() {
    const filters: EventFilter[] = [
      {
        id: 'pr-review-filter',
        source: 'github',
        eventType: 'pull_request',
        conditions: [
          {
            field: 'payload.action',
            operator: 'equals',
            value: 'opened'
          },
          {
            field: 'payload.pull_request.requested_reviewers',
            operator: 'exists',
            value: true
          }
        ],
        action: 'include',
        priority: 1,
        enabled: true
      }
    ];
    
    const ws = new WebSocket(
      `wss://your-worker.domain/stream/ws?agentId=review-agent&filters=${encodeURIComponent(JSON.stringify(filters))}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AGENT_API_KEY}`
        }
      }
    );
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'event') {
        this.handlePullRequestEvent(message.data);
      }
    };
  }
}
```

## Deployment Strategy

### Environment Configuration

```toml
# wrangler.toml
name = "event-router-worker"
main = "src/workers/event-router.ts"
compatibility_date = "2023-12-18"

[env.development]
name = "event-router-worker-dev"
vars = { ENVIRONMENT = "development" }

[env.staging]
name = "event-router-worker-staging"
vars = { ENVIRONMENT = "staging" }

[env.production]
name = "event-router-worker-prod"
vars = { ENVIRONMENT = "production" }
```

### Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Event Router Worker

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx wrangler deploy --env staging
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx wrangler deploy --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Testing Strategy

### Unit Testing

```typescript
// Example unit test
describe('EventFilterEngine', () => {
  it('should filter events based on conditions', async () => {
    const engine = new EventFilterEngine();
    const event: EventData = {
      id: 'test-1',
      source: 'github',
      type: 'pull_request',
      payload: { action: 'opened', pull_request: { draft: false } }
    };
    
    const filter: EventFilter = {
      conditions: [
        { field: 'payload.action', operator: 'equals', value: 'opened' },
        { field: 'payload.pull_request.draft', operator: 'equals', value: false }
      ],
      action: 'include'
    };
    
    const result = await engine.evaluateFilter(event, filter);
    expect(result).toBe(true);
  });
});
```

### Integration Testing

```typescript
// Example integration test
describe('Event Router Integration', () => {
  it('should process webhook end-to-end', async () => {
    const request = new Request('http://localhost/webhook/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': validSignature
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const response = await eventRouter.processWebhook(request);
    expect(response.status).toBe(200);
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();
  });
});
```

### Load Testing

```typescript
// Example load test
describe('Load Testing', () => {
  it('should handle high volume of concurrent requests', async () => {
    const requests = Array.from({ length: 1000 }, () => 
      createWebhookRequest()
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(
      requests.map(req => eventRouter.processWebhook(req))
    );
    const endTime = Date.now();
    
    const successCount = responses.filter(r => r.status === 200).length;
    const throughput = successCount / ((endTime - startTime) / 1000);
    
    expect(successCount).toBeGreaterThan(950); // 95% success rate
    expect(throughput).toBeGreaterThan(100); // 100 requests/second
  });
});
```

## Performance Optimization

### Caching Strategy

```typescript
class CacheManager {
  private cache = new Map<string, { data: any; expiry: number }>();
  
  async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    return null;
  }
  
  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }
}
```

### Connection Pooling

```typescript
class ConnectionPool {
  private connections = new Map<string, Connection[]>();
  
  async getConnection(target: string): Promise<Connection> {
    const pool = this.connections.get(target) || [];
    
    if (pool.length > 0) {
      return pool.pop()!;
    }
    
    return this.createConnection(target);
  }
  
  async releaseConnection(target: string, connection: Connection): Promise<void> {
    const pool = this.connections.get(target) || [];
    
    if (pool.length < this.maxPoolSize) {
      pool.push(connection);
      this.connections.set(target, pool);
    } else {
      await connection.close();
    }
  }
}
```

## Security Implementation

### Input Validation

```typescript
class InputValidator {
  validateWebhookPayload(payload: any, source: string): void {
    // Size validation
    const payloadSize = JSON.stringify(payload).length;
    if (payloadSize > this.maxPayloadSize) {
      throw new ValidationError('Payload too large');
    }
    
    // Structure validation
    if (!this.isValidStructure(payload, source)) {
      throw new ValidationError('Invalid payload structure');
    }
    
    // Content validation
    this.sanitizePayload(payload);
  }
  
  private sanitizePayload(payload: any): void {
    // Remove potentially dangerous content
    this.removeScriptTags(payload);
    this.validateUrls(payload);
    this.checkForSqlInjection(payload);
  }
}
```

### Access Control

```typescript
class AccessController {
  async validateAgentAccess(agentId: string, apiKey: string): Promise<boolean> {
    const hashedKey = await this.hashApiKey(apiKey);
    const storedHash = await this.getStoredApiKeyHash(agentId);
    
    return this.constantTimeCompare(hashedKey, storedHash);
  }
  
  async checkRateLimit(agentId: string): Promise<void> {
    const limit = await this.getAgentRateLimit(agentId);
    const current = await this.getCurrentUsage(agentId);
    
    if (current >= limit) {
      throw new RateLimitError('Agent rate limit exceeded');
    }
  }
}
```

This implementation guide provides a comprehensive roadmap for building the Event Router Worker system. Each phase builds upon the previous one, ensuring a solid foundation while adding increasingly sophisticated features.

