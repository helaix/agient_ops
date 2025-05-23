import { Env, EventData, RetryableEvent, QueueStats, RetryPolicy } from '@/types';

/**
 * Queue Manager Durable Object
 * Handles persistent queue state, retry logic, and queue coordination
 */
export class QueueManager {
  private state: DurableObjectState;
  private env: Env;
  private eventQueue: EventData[] = [];
  private retryQueue: Map<string, RetryableEvent> = new Map();
  private processing: boolean = false;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    
    // Initialize from persistent storage
    this.initializeFromStorage();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      switch (path) {
        case '/queue/add':
          return await this.handleAddEvent(request);
        case '/queue/process':
          return await this.handleProcessQueue(request);
        case '/queue/retry':
          return await this.handleRetryEvent(request);
        case '/queue/stats':
          return await this.handleGetStats(request);
        case '/queue/clear':
          return await this.handleClearQueue(request);
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('QueueManager error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  /**
   * Add event to queue
   */
  private async handleAddEvent(request: Request): Promise<Response> {
    try {
      const { event, priority, targetAgent, retryPolicy } = await request.json();
      
      const eventData: EventData = {
        ...event,
        priority: priority || 5,
        metadata: {
          ...event.metadata,
          queuedAt: Date.now(),
          targetAgent
        }
      };

      await this.addToQueue(eventData);
      
      // Trigger processing
      this.scheduleProcessing();

      return new Response(JSON.stringify({
        success: true,
        eventId: eventData.id,
        queuePosition: this.eventQueue.length
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * Process queue manually
   */
  private async handleProcessQueue(request: Request): Promise<Response> {
    try {
      const processed = await this.processQueue();
      
      return new Response(JSON.stringify({
        success: true,
        processedCount: processed,
        remainingCount: this.eventQueue.length
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * Retry specific event
   */
  private async handleRetryEvent(request: Request): Promise<Response> {
    try {
      const { eventId } = await request.json();
      
      const success = await this.retryEvent(eventId);
      
      return new Response(JSON.stringify({
        success,
        eventId
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * Get queue statistics
   */
  private async handleGetStats(request: Request): Promise<Response> {
    const stats = await this.getQueueStats();
    
    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Clear queue (admin operation)
   */
  private async handleClearQueue(request: Request): Promise<Response> {
    try {
      const { type } = await request.json(); // 'main', 'retry', or 'all'
      
      if (type === 'main' || type === 'all') {
        this.eventQueue = [];
        await this.persistQueue();
      }
      
      if (type === 'retry' || type === 'all') {
        this.retryQueue.clear();
        await this.persistRetryQueue();
      }
      
      return new Response(JSON.stringify({
        success: true,
        cleared: type
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * Add event to queue with priority ordering
   */
  private async addToQueue(event: EventData): Promise<void> {
    this.eventQueue.push(event);
    
    // Sort by priority (higher priority first)
    this.eventQueue.sort((a, b) => b.priority - a.priority);
    
    // Persist to storage
    await this.persistQueue();
  }

  /**
   * Process events in the queue
   */
  private async processQueue(): Promise<number> {
    if (this.processing) {
      return 0; // Already processing
    }

    this.processing = true;
    let processedCount = 0;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;
        
        try {
          await this.deliverEvent(event);
          processedCount++;
        } catch (error) {
          // Handle delivery failure
          await this.handleDeliveryFailure(event, error);
        }
      }

      // Persist updated queue
      await this.persistQueue();
      
      // Process retry queue
      await this.processRetryQueue();
      
    } finally {
      this.processing = false;
    }

    return processedCount;
  }

  /**
   * Process retry queue
   */
  private async processRetryQueue(): Promise<void> {
    const now = Date.now();
    const readyForRetry: string[] = [];

    // Find events ready for retry
    for (const [eventId, retryableEvent] of this.retryQueue) {
      if (now >= retryableEvent.nextRetryAt) {
        readyForRetry.push(eventId);
      }
    }

    // Process ready events
    for (const eventId of readyForRetry) {
      await this.retryEvent(eventId);
    }
  }

  /**
   * Retry a specific event
   */
  private async retryEvent(eventId: string): Promise<boolean> {
    const retryableEvent = this.retryQueue.get(eventId);
    
    if (!retryableEvent) {
      throw new Error(`Retryable event not found: ${eventId}`);
    }

    const now = Date.now();
    
    if (now < retryableEvent.nextRetryAt) {
      throw new Error(`Event not ready for retry: ${eventId}`);
    }

    if (retryableEvent.attemptCount >= retryableEvent.maxAttempts) {
      // Move to dead letter queue
      await this.moveToDeadLetterQueue(retryableEvent);
      this.retryQueue.delete(eventId);
      await this.persistRetryQueue();
      return false;
    }

    try {
      // Attempt delivery
      await this.deliverEvent(retryableEvent.originalEvent);
      
      // Remove from retry queue on success
      this.retryQueue.delete(eventId);
      await this.persistRetryQueue();
      
      return true;
    } catch (error) {
      // Update retry information
      retryableEvent.attemptCount++;
      retryableEvent.lastError = error.message;
      retryableEvent.nextRetryAt = this.calculateNextRetryTime(retryableEvent);
      retryableEvent.updatedAt = now;
      
      await this.persistRetryQueue();
      return false;
    }
  }

  /**
   * Deliver event to target agent
   */
  private async deliverEvent(event: EventData): Promise<void> {
    const targetAgent = event.metadata.targetAgent;
    
    if (!targetAgent) {
      throw new Error('No target agent specified');
    }

    // In a real implementation, this would make HTTP requests to agent endpoints
    // For now, we'll simulate delivery
    console.log(`Delivering event ${event.id} to agent ${targetAgent}`);
    
    // Simulate potential failure
    if (Math.random() < 0.1) { // 10% failure rate for testing
      throw new Error('Simulated delivery failure');
    }
  }

  /**
   * Handle delivery failure by adding to retry queue
   */
  private async handleDeliveryFailure(event: EventData, error: Error): Promise<void> {
    const retryPolicy: RetryPolicy = {
      maxAttempts: event.maxRetries,
      backoffStrategy: 'exponential',
      baseDelay: parseInt(this.env.DEFAULT_RETRY_DELAY, 10),
      maxDelay: 300000, // 5 minutes
      jitter: true
    };

    const retryableEvent: RetryableEvent = {
      id: event.id,
      originalEvent: event,
      targetAgent: event.metadata.targetAgent,
      attemptCount: 1,
      maxAttempts: retryPolicy.maxAttempts,
      nextRetryAt: this.calculateNextRetryTime({ retryPolicy, attemptCount: 0 } as RetryableEvent),
      lastError: error.message,
      retryPolicy,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.retryQueue.set(event.id, retryableEvent);
    await this.persistRetryQueue();
  }

  /**
   * Calculate next retry time based on backoff strategy
   */
  private calculateNextRetryTime(retryableEvent: RetryableEvent): number {
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

    // Apply max delay limit
    delay = Math.min(delay, maxDelay);

    // Apply jitter if enabled
    if (jitter) {
      delay = delay * (0.5 + Math.random() * 0.5); // 50-100% of calculated delay
    }

    return Date.now() + delay;
  }

  /**
   * Move failed event to dead letter queue
   */
  private async moveToDeadLetterQueue(retryableEvent: RetryableEvent): Promise<void> {
    try {
      const dlqKey = `dlq/${Date.now()}-${retryableEvent.id}.json`;
      
      await this.env.DEAD_LETTER_QUEUE.put(dlqKey, JSON.stringify({
        ...retryableEvent,
        movedToDLQAt: Date.now(),
        reason: 'Max retry attempts exceeded'
      }), {
        httpMetadata: {
          contentType: 'application/json'
        }
      });
      
      console.log(`Moved event ${retryableEvent.id} to dead letter queue`);
    } catch (error) {
      console.error('Failed to move event to DLQ:', error);
    }
  }

  /**
   * Get queue statistics
   */
  private async getQueueStats(): Promise<QueueStats> {
    const now = Date.now();
    let totalProcessingTime = 0;
    let processedEvents = 0;
    let lastProcessedAt: number | undefined;

    // Calculate stats from processed events (simplified)
    for (const event of this.eventQueue) {
      if (event.metadata.processedAt) {
        const processingTime = event.metadata.processedAt - event.metadata.queuedAt;
        totalProcessingTime += processingTime;
        processedEvents++;
        
        if (!lastProcessedAt || event.metadata.processedAt > lastProcessedAt) {
          lastProcessedAt = event.metadata.processedAt;
        }
      }
    }

    return {
      totalEvents: this.eventQueue.length + this.retryQueue.size,
      pendingEvents: this.eventQueue.length,
      processingEvents: this.processing ? 1 : 0,
      failedEvents: this.retryQueue.size,
      completedEvents: processedEvents,
      averageProcessingTime: processedEvents > 0 ? totalProcessingTime / processedEvents : 0,
      lastProcessedAt
    };
  }

  /**
   * Schedule queue processing
   */
  private scheduleProcessing(): void {
    // Use setTimeout to process queue asynchronously
    setTimeout(() => {
      this.processQueue().catch(error => {
        console.error('Scheduled queue processing error:', error);
      });
    }, 100); // Process after 100ms
  }

  /**
   * Initialize from persistent storage
   */
  private async initializeFromStorage(): Promise<void> {
    try {
      // Load main queue
      const queueData = await this.state.storage.get('eventQueue');
      if (queueData) {
        this.eventQueue = queueData as EventData[];
      }

      // Load retry queue
      const retryData = await this.state.storage.get('retryQueue');
      if (retryData) {
        const retryArray = retryData as RetryableEvent[];
        this.retryQueue = new Map(retryArray.map(event => [event.id, event]));
      }
    } catch (error) {
      console.error('Failed to initialize from storage:', error);
    }
  }

  /**
   * Persist main queue to storage
   */
  private async persistQueue(): Promise<void> {
    try {
      await this.state.storage.put('eventQueue', this.eventQueue);
    } catch (error) {
      console.error('Failed to persist queue:', error);
    }
  }

  /**
   * Persist retry queue to storage
   */
  private async persistRetryQueue(): Promise<void> {
    try {
      const retryArray = Array.from(this.retryQueue.values());
      await this.state.storage.put('retryQueue', retryArray);
    } catch (error) {
      console.error('Failed to persist retry queue:', error);
    }
  }
}

