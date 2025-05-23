import { Router } from 'itty-router';
import { 
  Env, 
  WebhookEvent, 
  EventData, 
  EventFilter, 
  EventRoute, 
  RetryableEvent,
  EventRouterError,
  ValidationError,
  RateLimitError,
  ProcessingError
} from '@/types';
import { SignatureValidator } from '@/utils/signature-validator';
import { RateLimiter } from '@/utils/rate-limiter';
import { EventAnalytics } from '@/analytics/event-analytics';
import { EventStreamer } from '@/streaming/event-streamer';

/**
 * Advanced Event Router Worker for multi-agent coordination
 * Handles webhook processing, event filtering, routing, and real-time streaming
 */
export class EventRouter {
  private eventFilters: Map<string, EventFilter[]> = new Map();
  private eventRoutes: Map<string, EventRoute[]> = new Map();
  private eventQueue: EventData[] = [];
  private retryQueue: Map<string, RetryableEvent> = new Map();
  private subscribers: Map<string, Set<string>> = new Map();
  
  private signatureValidator: SignatureValidator;
  private rateLimiter: RateLimiter;
  private analytics: EventAnalytics;
  private streamer: EventStreamer;
  private router: Router;

  constructor(private env: Env) {
    this.signatureValidator = new SignatureValidator(env);
    this.rateLimiter = new RateLimiter(env);
    this.analytics = new EventAnalytics(env);
    this.streamer = new EventStreamer(env);
    this.router = this.setupRouter();
    
    // Initialize filters and routes from storage
    this.initializeFromStorage();
  }

  /**
   * Main webhook processing pipeline
   */
  async processWebhook(request: Request): Promise<Response> {
    const startTime = Date.now();
    let eventData: EventData | null = null;

    try {
      // 1. Extract webhook metadata
      const metadata = await this.extractWebhookMetadata(request);
      
      // 2. Validate signature and headers
      await this.validateWebhookSecurity(metadata, request);
      
      // 3. Parse and validate payload
      const payload = await this.parseAndValidatePayload(request);
      
      // 4. Apply rate limiting
      await this.applyRateLimiting(metadata.source, metadata.identifier);
      
      // 5. Create EventData object
      eventData = await this.createEventData(metadata, payload);
      
      // 6. Process through pipeline
      const result = await this.processEventPipeline(eventData);
      
      // 7. Record analytics
      await this.analytics.recordEventProcessed(eventData, Date.now() - startTime);
      
      // 8. Return appropriate response
      return new Response(JSON.stringify({
        success: true,
        eventId: eventData.id,
        processed: result.processed,
        routed: result.routed,
        timestamp: Date.now()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      // Record failure analytics
      if (eventData) {
        await this.analytics.recordEventFailed(eventData, error.message);
      }

      // Handle different error types
      if (error instanceof ValidationError) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          code: error.code
        }), {
          status: error.statusCode,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (error instanceof RateLimitError) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          code: error.code,
          retryAfter: error.details?.retryAfter
        }), {
          status: error.statusCode,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': String(error.details?.retryAfter || 60)
          }
        });
      }

      console.error('Webhook processing error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * Validate webhook signature
   */
  async validateWebhookSignature(event: WebhookEvent): Promise<boolean> {
    const { signature, timestamp } = this.signatureValidator.extractSignature(
      event.source, 
      event.headers
    );

    if (!signature) {
      throw new ValidationError('Missing webhook signature');
    }

    const payloadString = JSON.stringify(event.payload);
    return await this.signatureValidator.validateWebhookSignature(
      event.source,
      payloadString,
      signature,
      timestamp
    );
  }

  /**
   * Filter event based on configured filters
   */
  async filterEvent(event: EventData): Promise<boolean> {
    try {
      // Get applicable filters for event type
      const filters = await this.getApplicableFilters(event);
      
      // Evaluate filter conditions
      for (const filter of filters) {
        if (!filter.enabled) continue;
        
        const matches = await this.evaluateFilter(event, filter);
        
        if (matches) {
          // Log filtering decision
          if (filter.action === 'exclude') {
            await this.analytics.recordEventFiltered(event, `Excluded by filter: ${filter.name}`);
            return false;
          } else if (filter.action === 'transform') {
            // Apply transformation
            await this.transformEvent(event, filter);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Event filtering error:', error);
      return true; // Default to allowing events on filter errors
    }
  }

  /**
   * Transform event data
   */
  async transformEvent(event: EventData, filter?: EventFilter): Promise<EventData> {
    // Implementation would depend on transformation rules
    // For now, return the event unchanged
    return event;
  }

  /**
   * Route event to target agents
   */
  async routeEvent(event: EventData): Promise<void> {
    try {
      // 1. Determine target agents based on event type
      const routes = await this.getApplicableRoutes(event);
      
      // 2. Apply routing rules and priorities
      const sortedRoutes = routes
        .filter(route => route.enabled)
        .sort((a, b) => b.priority - a.priority);
      
      // 3. Transform event for each target and queue for delivery
      for (const route of sortedRoutes) {
        for (const targetAgent of route.targetAgents) {
          let routedEvent = { ...event };
          
          // 4. Apply transformation if specified
          if (route.transformation) {
            routedEvent = await this.applyTransformation(routedEvent, route.transformation);
          }
          
          // 5. Queue event for delivery
          await this.queueEvent(routedEvent, route.priority, targetAgent, route.retryPolicy);
        }
      }
    } catch (error) {
      console.error('Event routing error:', error);
      throw new ProcessingError('Failed to route event', { eventId: event.id, error: error.message });
    }
  }

  /**
   * Queue event for processing
   */
  async queueEvent(
    event: EventData, 
    priority: number = 5, 
    targetAgent?: string,
    retryPolicy?: any
  ): Promise<void> {
    try {
      // Set priority and queue metadata
      event.priority = priority;
      event.metadata.queuedAt = Date.now();
      event.metadata.targetAgent = targetAgent;
      
      // Add to in-memory queue (in production, use Durable Objects)
      this.eventQueue.push(event);
      
      // Sort queue by priority
      this.eventQueue.sort((a, b) => b.priority - a.priority);
      
      // Trigger queue processing
      await this.processEventQueue();
      
    } catch (error) {
      console.error('Event queuing error:', error);
      throw new ProcessingError('Failed to queue event', { eventId: event.id });
    }
  }

  /**
   * Process event queue
   */
  async processEventQueue(): Promise<void> {
    try {
      // 1. Process events by priority
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;
        
        try {
          // 2. Deliver to target agents
          await this.deliverEvent(event);
          
          // Record successful delivery
          if (event.metadata.targetAgent) {
            await this.analytics.recordEventDelivered(event, event.metadata.targetAgent);
          }
          
        } catch (error) {
          // 3. Handle delivery failures
          await this.handleDeliveryFailure(event, error);
        }
      }
    } catch (error) {
      console.error('Queue processing error:', error);
    }
  }

  /**
   * Retry failed event
   */
  async retryFailedEvent(eventId: string): Promise<void> {
    const retryableEvent = this.retryQueue.get(eventId);
    
    if (!retryableEvent) {
      throw new ValidationError(`Retryable event not found: ${eventId}`);
    }
    
    const now = Date.now();
    
    if (now < retryableEvent.nextRetryAt) {
      throw new ValidationError(`Event not ready for retry: ${eventId}`);
    }
    
    if (retryableEvent.attemptCount >= retryableEvent.maxAttempts) {
      // Move to dead letter queue
      await this.moveToDeadLetterQueue(retryableEvent);
      this.retryQueue.delete(eventId);
      return;
    }
    
    try {
      // Attempt delivery
      await this.deliverEvent(retryableEvent.originalEvent);
      
      // Remove from retry queue on success
      this.retryQueue.delete(eventId);
      
      // Record successful delivery
      await this.analytics.recordEventDelivered(
        retryableEvent.originalEvent, 
        retryableEvent.targetAgent
      );
      
    } catch (error) {
      // Update retry information
      retryableEvent.attemptCount++;
      retryableEvent.lastError = error.message;
      retryableEvent.nextRetryAt = this.calculateNextRetryTime(retryableEvent);
      retryableEvent.updatedAt = now;
      
      // Record failure
      await this.analytics.recordEventFailed(retryableEvent.originalEvent, error.message);
    }
  }

  /**
   * Subscribe to events
   */
  async subscribeToEvents(agentId: string, filters: EventFilter[]): Promise<void> {
    // Store subscription filters
    await this.env.SUBSCRIPTIONS.put(
      `agent:${agentId}:filters`,
      JSON.stringify(filters)
    );
    
    // Add to in-memory subscribers
    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, new Set());
    }
    
    // Notify streamer of subscription
    await this.streamer.manageSubscriptions(agentId, 'subscribe', filters);
  }

  /**
   * Stream event to subscribers
   */
  async streamEventToSubscribers(event: EventData): Promise<void> {
    try {
      // Get matching subscribers
      const matchingSubscribers: string[] = [];
      
      for (const [agentId, _] of this.subscribers) {
        const filtersJson = await this.env.SUBSCRIPTIONS.get(`agent:${agentId}:filters`);
        if (filtersJson) {
          const filters = JSON.parse(filtersJson) as EventFilter[];
          if (this.eventMatchesFilters(event, filters)) {
            matchingSubscribers.push(agentId);
          }
        }
      }
      
      // Broadcast to matching subscribers
      await this.streamer.broadcastEvent(event, matchingSubscribers);
      
    } catch (error) {
      console.error('Event streaming error:', error);
    }
  }

  /**
   * Setup API router
   */
  private setupRouter(): Router {
    const router = Router();

    // Webhook endpoints
    router.post('/webhook/:source', async (request, env) => {
      return await this.processWebhook(request);
    });

    // WebSocket endpoint
    router.get('/stream/ws', async (request, env) => {
      return await this.streamer.handleWebSocketConnection(request);
    });

    // Server-Sent Events endpoint
    router.get('/stream/sse', async (request, env) => {
      return await this.streamer.handleSSEConnection(request);
    });

    // Analytics endpoints
    router.get('/analytics/metrics', async (request, env) => {
      const url = new URL(request.url);
      const hours = parseInt(url.searchParams.get('hours') || '24', 10);
      const data = await this.analytics.getRealTimeMetrics(hours * 60);
      
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    // Queue management endpoints
    router.get('/queue/stats', async (request, env) => {
      const stats = {
        queueSize: this.eventQueue.length,
        retryQueueSize: this.retryQueue.size,
        subscriberCount: this.subscribers.size
      };
      
      return new Response(JSON.stringify(stats), {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    // Health check
    router.get('/health', async (request, env) => {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: Date.now(),
        version: '1.0.0'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    return router;
  }

  /**
   * Initialize filters and routes from storage
   */
  private async initializeFromStorage(): Promise<void> {
    try {
      // Load event filters
      const filtersList = await this.env.EVENT_FILTERS.list();
      for (const key of filtersList.keys) {
        const filter = await this.env.EVENT_FILTERS.get(key.name, 'json') as EventFilter;
        if (filter) {
          const source = filter.source || 'default';
          if (!this.eventFilters.has(source)) {
            this.eventFilters.set(source, []);
          }
          this.eventFilters.get(source)!.push(filter);
        }
      }

      // Load event routes
      const routesList = await this.env.EVENT_ROUTES.list();
      for (const key of routesList.keys) {
        const route = await this.env.EVENT_ROUTES.get(key.name, 'json') as EventRoute;
        if (route) {
          const source = route.sourceFilters[0]?.source || 'default';
          if (!this.eventRoutes.has(source)) {
            this.eventRoutes.set(source, []);
          }
          this.eventRoutes.get(source)!.push(route);
        }
      }
    } catch (error) {
      console.error('Failed to initialize from storage:', error);
    }
  }

  // Helper methods would continue here...
  // Due to length constraints, I'll include the key helper methods

  private async extractWebhookMetadata(request: Request): Promise<any> {
    const url = new URL(request.url);
    const source = url.pathname.split('/').pop() || 'unknown';
    
    return {
      source,
      identifier: request.headers.get('x-forwarded-for') || 'unknown',
      timestamp: Date.now(),
      headers: Object.fromEntries(request.headers.entries())
    };
  }

  private async validateWebhookSecurity(metadata: any, request: Request): Promise<void> {
    // Validate signature headers exist
    if (!this.signatureValidator.validateSignatureHeaders(metadata.source, metadata.headers)) {
      throw new ValidationError('Invalid or missing signature headers');
    }
  }

  private async parseAndValidatePayload(request: Request): Promise<any> {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      return Object.fromEntries(formData.entries());
    } else {
      return await request.text();
    }
  }

  private async applyRateLimiting(source: string, identifier: string): Promise<void> {
    await this.rateLimiter.enforceRateLimit(source, identifier);
  }

  private async createEventData(metadata: any, payload: any): Promise<EventData> {
    const eventData: EventData = {
      id: crypto.randomUUID(),
      source: metadata.source,
      type: payload.action || payload.type || 'unknown',
      timestamp: metadata.timestamp,
      payload,
      metadata: {
        headers: metadata.headers,
        identifier: metadata.identifier
      },
      priority: 5,
      retryCount: 0,
      maxRetries: parseInt(this.env.DEFAULT_RETRY_ATTEMPTS, 10),
      tags: []
    };

    await this.analytics.recordEventReceived(eventData);
    return eventData;
  }

  private async processEventPipeline(event: EventData): Promise<{ processed: boolean; routed: boolean }> {
    // Filter event
    const shouldProcess = await this.filterEvent(event);
    if (!shouldProcess) {
      return { processed: false, routed: false };
    }

    // Route event
    await this.routeEvent(event);

    // Stream to subscribers
    await this.streamEventToSubscribers(event);

    return { processed: true, routed: true };
  }

  // Additional helper methods would be implemented here...
}

// Worker entry point
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const eventRouter = new EventRouter(env);
      return await eventRouter.router.handle(request, env, ctx);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

