// Core Environment Interface
export interface Env {
  // KV Namespaces
  EVENT_FILTERS: KVNamespace;
  EVENT_ROUTES: KVNamespace;
  RATE_LIMITS: KVNamespace;
  SUBSCRIPTIONS: KVNamespace;
  ANALYTICS_CACHE: KVNamespace;

  // R2 Buckets
  EVENT_ARCHIVE: R2Bucket;
  DEAD_LETTER_QUEUE: R2Bucket;

  // Durable Objects
  QUEUE_MANAGER: DurableObjectNamespace;
  SUBSCRIPTION_MANAGER: DurableObjectNamespace;
  EVENT_PROCESSOR: DurableObjectNamespace;

  // Environment Variables
  ENVIRONMENT: string;
  MAX_EVENT_SIZE: string;
  DEFAULT_RETRY_ATTEMPTS: string;
  DEFAULT_RETRY_DELAY: string;
  MAX_QUEUE_SIZE: string;
  RATE_LIMIT_WINDOW: string;
  DEFAULT_RATE_LIMIT: string;

  // Secrets
  GITHUB_WEBHOOK_SECRET: string;
  LINEAR_WEBHOOK_SECRET: string;
  SLACK_WEBHOOK_SECRET: string;
  AGENT_API_KEY: string;
}

// Event Data Structures
export interface WebhookEvent {
  id: string;
  source: 'github' | 'linear' | 'slack' | 'internal';
  type: string;
  timestamp: number;
  signature?: string;
  headers: Record<string, string>;
  payload: any;
  metadata?: Record<string, any>;
}

export interface EventData {
  id: string;
  source: 'github' | 'linear' | 'slack' | 'internal';
  type: string;
  timestamp: number;
  payload: any;
  metadata: Record<string, any>;
  priority: number;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: number;
  tags: string[];
  correlationId?: string;
  parentEventId?: string;
}

// Event Filtering
export interface EventFilter {
  id: string;
  name: string;
  description: string;
  source?: string;
  eventType?: string;
  conditions: FilterCondition[];
  action: 'include' | 'exclude' | 'transform';
  priority: number;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface FilterCondition {
  field: string; // JSON path in event payload
  operator: 'equals' | 'contains' | 'regex' | 'exists' | 'gt' | 'lt' | 'in' | 'not_in';
  value: any;
  caseSensitive?: boolean;
}

// Event Routing
export interface EventRoute {
  id: string;
  name: string;
  description: string;
  sourceFilters: EventFilter[];
  targetAgents: string[];
  transformation?: EventTransformation;
  priority: number;
  retryPolicy: RetryPolicy;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface EventTransformation {
  type: 'map' | 'filter' | 'enrich' | 'split';
  config: Record<string, any>;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
}

// Queue Management
export interface RetryableEvent {
  id: string;
  originalEvent: EventData;
  targetAgent: string;
  attemptCount: number;
  maxAttempts: number;
  nextRetryAt: number;
  lastError?: string;
  retryPolicy: RetryPolicy;
  createdAt: number;
  updatedAt: number;
}

export interface QueueStats {
  totalEvents: number;
  pendingEvents: number;
  processingEvents: number;
  failedEvents: number;
  completedEvents: number;
  averageProcessingTime: number;
  lastProcessedAt?: number;
}

// Event Subscriptions
export interface EventSubscription {
  id: string;
  agentId: string;
  filters: EventFilter[];
  deliveryMethod: 'webhook' | 'message' | 'stream';
  endpoint?: string;
  createdAt: number;
  lastDelivery?: number;
  deliveryCount: number;
  errorCount: number;
  enabled: boolean;
  metadata?: Record<string, any>;
}

// Rate Limiting
export interface RateLimitConfig {
  source: string;
  identifier: string;
  limit: number;
  window: number; // in milliseconds
  burst?: number;
}

export interface RateLimitState {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// Analytics
export interface EventMetrics {
  eventId: string;
  source: string;
  type: string;
  timestamp: number;
  processingTime?: number;
  status: 'received' | 'filtered' | 'processed' | 'delivered' | 'failed';
  targetAgent?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsData {
  timeRange: {
    start: number;
    end: number;
  };
  metrics: {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    filteredEvents: number;
    averageProcessingTime: number;
    throughputPerMinute: number;
  };
  breakdown: {
    bySource: Record<string, number>;
    byType: Record<string, number>;
    byAgent: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

// Streaming
export interface StreamConnection {
  id: string;
  agentId: string;
  connectionType: 'websocket' | 'sse';
  filters: EventFilter[];
  connectedAt: number;
  lastActivity: number;
  metadata?: Record<string, any>;
}

export interface StreamMessage {
  type: 'event' | 'heartbeat' | 'error' | 'subscription_update';
  timestamp: number;
  data: any;
  metadata?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Configuration Types
export interface EventRouterConfig {
  maxEventSize: number;
  defaultRetryAttempts: number;
  defaultRetryDelay: number;
  maxQueueSize: number;
  rateLimitWindow: number;
  defaultRateLimit: number;
  enableAnalytics: boolean;
  enableStreaming: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Error Types
export class EventRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'EventRouterError';
  }
}

export class ValidationError extends EventRouterError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends EventRouterError {
  constructor(message: string, details?: any) {
    super(message, 'RATE_LIMIT_ERROR', 429, details);
    this.name = 'RateLimitError';
  }
}

export class ProcessingError extends EventRouterError {
  constructor(message: string, details?: any) {
    super(message, 'PROCESSING_ERROR', 500, details);
    this.name = 'ProcessingError';
  }
}

// Utility Types
export type EventSource = 'github' | 'linear' | 'slack' | 'internal';
export type EventStatus = 'received' | 'filtered' | 'processed' | 'delivered' | 'failed';
export type DeliveryMethod = 'webhook' | 'message' | 'stream';
export type BackoffStrategy = 'linear' | 'exponential' | 'fixed';
export type FilterAction = 'include' | 'exclude' | 'transform';
export type TransformationType = 'map' | 'filter' | 'enrich' | 'split';
export type ConnectionType = 'websocket' | 'sse';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

