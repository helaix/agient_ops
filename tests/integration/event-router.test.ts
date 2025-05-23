import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventRouter } from '../../src/workers/event-router';
import { Env, EventData } from '../../src/types';

// Mock environment with all required bindings
const createMockEnv = (): Env => {
  const mockKV = {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    list: vi.fn().mockResolvedValue({ keys: [] })
  };

  const mockR2 = {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    list: vi.fn()
  };

  const mockDO = {
    get: vi.fn(),
    newUniqueId: vi.fn()
  };

  return {
    EVENT_FILTERS: mockKV,
    EVENT_ROUTES: mockKV,
    RATE_LIMITS: mockKV,
    SUBSCRIPTIONS: mockKV,
    ANALYTICS_CACHE: mockKV,
    EVENT_ARCHIVE: mockR2,
    DEAD_LETTER_QUEUE: mockR2,
    QUEUE_MANAGER: mockDO,
    SUBSCRIPTION_MANAGER: mockDO,
    EVENT_PROCESSOR: mockDO,
    ENVIRONMENT: 'test',
    MAX_EVENT_SIZE: '1048576',
    DEFAULT_RETRY_ATTEMPTS: '3',
    DEFAULT_RETRY_DELAY: '1000',
    MAX_QUEUE_SIZE: '10000',
    RATE_LIMIT_WINDOW: '60000',
    DEFAULT_RATE_LIMIT: '1000',
    GITHUB_WEBHOOK_SECRET: 'github-secret',
    LINEAR_WEBHOOK_SECRET: 'linear-secret',
    SLACK_WEBHOOK_SECRET: 'slack-secret',
    AGENT_API_KEY: 'agent-api-key'
  } as any;
};

describe('EventRouter Integration Tests', () => {
  let eventRouter: EventRouter;
  let mockEnv: Env;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv = createMockEnv();
    eventRouter = new EventRouter(mockEnv);
  });

  describe('Webhook Processing Pipeline', () => {
    it('should process valid GitHub webhook', async () => {
      // Mock rate limit check
      (mockEnv.RATE_LIMITS as any).get.mockResolvedValue(null);

      // Create test webhook request
      const payload = { action: 'opened', pull_request: { id: 123 } };
      const payloadString = JSON.stringify(payload);
      
      // Create valid signature
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(mockEnv.GITHUB_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payloadString)
      );
      
      const signature = 'sha256=' + Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const request = new Request('http://localhost/webhook/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': signature,
          'X-Forwarded-For': '192.168.1.1'
        },
        body: payloadString
      });

      const response = await eventRouter.processWebhook(request);
      
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.eventId).toBeDefined();
      expect(result.processed).toBe(true);
    });

    it('should reject webhook with invalid signature', async () => {
      const payload = { action: 'opened', pull_request: { id: 123 } };
      const payloadString = JSON.stringify(payload);

      const request = new Request('http://localhost/webhook/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': 'sha256=invalid-signature',
          'X-Forwarded-For': '192.168.1.1'
        },
        body: payloadString
      });

      const response = await eventRouter.processWebhook(request);
      
      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toContain('signature');
    });

    it('should handle rate limiting', async () => {
      // Mock rate limit exceeded
      const rateLimitState = {
        count: 1000,
        resetTime: Date.now() + 30000,
        blocked: true
      };
      
      (mockEnv.RATE_LIMITS as any).get.mockResolvedValue(JSON.stringify(rateLimitState));

      const payload = { action: 'opened', pull_request: { id: 123 } };
      const request = new Request('http://localhost/webhook/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': 'sha256=valid-signature',
          'X-Forwarded-For': '192.168.1.1'
        },
        body: JSON.stringify(payload)
      });

      const response = await eventRouter.processWebhook(request);
      
      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBeDefined();
      
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.code).toBe('RATE_LIMIT_ERROR');
    });
  });

  describe('Event Filtering', () => {
    it('should filter events based on configured filters', async () => {
      const event: EventData = {
        id: 'test-event-1',
        source: 'github',
        type: 'pull_request',
        timestamp: Date.now(),
        payload: { action: 'opened', pull_request: { draft: true } },
        metadata: {},
        priority: 5,
        retryCount: 0,
        maxRetries: 3,
        tags: []
      };

      // Mock filter that excludes draft PRs
      const filter = {
        id: 'exclude-drafts',
        name: 'Exclude Draft PRs',
        description: 'Filter out draft pull requests',
        source: 'github',
        eventType: 'pull_request',
        conditions: [
          {
            field: 'payload.pull_request.draft',
            operator: 'equals',
            value: true
          }
        ],
        action: 'exclude',
        priority: 1,
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'system'
      };

      // Mock the filter retrieval
      (mockEnv.EVENT_FILTERS as any).list.mockResolvedValue({
        keys: [{ name: 'filter-1' }]
      });
      (mockEnv.EVENT_FILTERS as any).get.mockResolvedValue(filter);

      // Reinitialize to load filters
      eventRouter = new EventRouter(mockEnv);
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for initialization

      const shouldProcess = await eventRouter.filterEvent(event);
      expect(shouldProcess).toBe(false);
    });

    it('should allow events that pass filters', async () => {
      const event: EventData = {
        id: 'test-event-2',
        source: 'github',
        type: 'pull_request',
        timestamp: Date.now(),
        payload: { action: 'opened', pull_request: { draft: false } },
        metadata: {},
        priority: 5,
        retryCount: 0,
        maxRetries: 3,
        tags: []
      };

      // Mock filter that includes non-draft PRs
      const filter = {
        id: 'include-ready',
        name: 'Include Ready PRs',
        description: 'Include non-draft pull requests',
        source: 'github',
        eventType: 'pull_request',
        conditions: [
          {
            field: 'payload.pull_request.draft',
            operator: 'equals',
            value: false
          }
        ],
        action: 'include',
        priority: 1,
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'system'
      };

      (mockEnv.EVENT_FILTERS as any).list.mockResolvedValue({
        keys: [{ name: 'filter-1' }]
      });
      (mockEnv.EVENT_FILTERS as any).get.mockResolvedValue(filter);

      eventRouter = new EventRouter(mockEnv);
      await new Promise(resolve => setTimeout(resolve, 100));

      const shouldProcess = await eventRouter.filterEvent(event);
      expect(shouldProcess).toBe(true);
    });
  });

  describe('Event Routing', () => {
    it('should route events to configured agents', async () => {
      const event: EventData = {
        id: 'test-event-3',
        source: 'github',
        type: 'pull_request',
        timestamp: Date.now(),
        payload: { action: 'opened' },
        metadata: {},
        priority: 5,
        retryCount: 0,
        maxRetries: 3,
        tags: []
      };

      // Mock route configuration
      const route = {
        id: 'pr-route',
        name: 'PR Review Route',
        description: 'Route PR events to review agents',
        sourceFilters: [{
          id: 'pr-filter',
          name: 'PR Filter',
          description: 'Match PR events',
          source: 'github',
          eventType: 'pull_request',
          conditions: [],
          action: 'include',
          priority: 1,
          enabled: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: 'system'
        }],
        targetAgents: ['review-agent-1', 'review-agent-2'],
        priority: 5,
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          baseDelay: 1000,
          maxDelay: 30000,
          jitter: true
        },
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'system'
      };

      (mockEnv.EVENT_ROUTES as any).list.mockResolvedValue({
        keys: [{ name: 'route-1' }]
      });
      (mockEnv.EVENT_ROUTES as any).get.mockResolvedValue(route);

      eventRouter = new EventRouter(mockEnv);
      await new Promise(resolve => setTimeout(resolve, 100));

      // This should not throw
      await expect(eventRouter.routeEvent(event)).resolves.toBeUndefined();
    });
  });

  describe('Event Subscription', () => {
    it('should manage event subscriptions', async () => {
      const agentId = 'test-agent-1';
      const filters = [{
        id: 'subscription-filter',
        name: 'Subscription Filter',
        description: 'Filter for subscriptions',
        source: 'github',
        eventType: 'pull_request',
        conditions: [],
        action: 'include',
        priority: 1,
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'system'
      }];

      await eventRouter.subscribeToEvents(agentId, filters);

      // Verify subscription was stored
      expect(mockEnv.SUBSCRIPTIONS.put).toHaveBeenCalledWith(
        `agent:${agentId}:filters`,
        JSON.stringify(filters)
      );
    });
  });

  describe('Analytics Integration', () => {
    it('should record event metrics during processing', async () => {
      // Mock successful webhook processing
      (mockEnv.RATE_LIMITS as any).get.mockResolvedValue(null);
      (mockEnv.ANALYTICS_CACHE as any).get.mockResolvedValue(null);

      const payload = { action: 'opened', pull_request: { id: 123 } };
      const payloadString = JSON.stringify(payload);
      
      // Create valid signature
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(mockEnv.GITHUB_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payloadString)
      );
      
      const signature = 'sha256=' + Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const request = new Request('http://localhost/webhook/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': signature,
          'X-Forwarded-For': '192.168.1.1'
        },
        body: payloadString
      });

      await eventRouter.processWebhook(request);

      // Verify analytics were recorded
      expect(mockEnv.ANALYTICS_CACHE.put).toHaveBeenCalled();
      expect(mockEnv.EVENT_ARCHIVE.put).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON payload', async () => {
      const request = new Request('http://localhost/webhook/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': 'sha256=valid-signature',
          'X-Forwarded-For': '192.168.1.1'
        },
        body: 'invalid-json'
      });

      const response = await eventRouter.processWebhook(request);
      
      expect(response.status).toBe(500);
      
      const result = await response.json();
      expect(result.success).toBe(false);
    });

    it('should handle missing required headers', async () => {
      const request = new Request('http://localhost/webhook/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Missing signature header
        },
        body: JSON.stringify({ action: 'opened' })
      });

      const response = await eventRouter.processWebhook(request);
      
      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toContain('signature');
    });
  });

  describe('Health Check', () => {
    it('should respond to health check', async () => {
      const request = new Request('http://localhost/health', {
        method: 'GET'
      });

      const response = await eventRouter.router.handle(request, mockEnv, {} as any);
      
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(result.version).toBeDefined();
    });
  });
});

