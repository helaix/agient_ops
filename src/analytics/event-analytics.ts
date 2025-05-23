import { Env, EventData, EventMetrics, AnalyticsData } from '@/types';

/**
 * Comprehensive event analytics and monitoring system
 * Tracks event metrics, performance, and provides insights
 */
export class EventAnalytics {
  constructor(private env: Env) {}

  /**
   * Record when an event is received
   */
  async recordEventReceived(event: EventData): Promise<void> {
    const metric: EventMetrics = {
      eventId: event.id,
      source: event.source,
      type: event.type,
      timestamp: event.timestamp,
      status: 'received',
      metadata: {
        priority: event.priority,
        correlationId: event.correlationId,
        tags: event.tags
      }
    };

    await this.storeMetric(metric);
    await this.updateCounters('received', event.source, event.type);
  }

  /**
   * Record when an event is processed
   */
  async recordEventProcessed(event: EventData, processingTime: number): Promise<void> {
    const metric: EventMetrics = {
      eventId: event.id,
      source: event.source,
      type: event.type,
      timestamp: Date.now(),
      processingTime,
      status: 'processed',
      metadata: {
        priority: event.priority,
        correlationId: event.correlationId,
        retryCount: event.retryCount
      }
    };

    await this.storeMetric(metric);
    await this.updateCounters('processed', event.source, event.type);
    await this.updateProcessingTimeMetrics(processingTime, event.source, event.type);
  }

  /**
   * Record when an event is filtered out
   */
  async recordEventFiltered(event: EventData, reason: string): Promise<void> {
    const metric: EventMetrics = {
      eventId: event.id,
      source: event.source,
      type: event.type,
      timestamp: Date.now(),
      status: 'filtered',
      metadata: {
        filterReason: reason,
        priority: event.priority,
        correlationId: event.correlationId
      }
    };

    await this.storeMetric(metric);
    await this.updateCounters('filtered', event.source, event.type);
  }

  /**
   * Record when an event is delivered to an agent
   */
  async recordEventDelivered(event: EventData, targetAgent: string): Promise<void> {
    const metric: EventMetrics = {
      eventId: event.id,
      source: event.source,
      type: event.type,
      timestamp: Date.now(),
      status: 'delivered',
      targetAgent,
      metadata: {
        priority: event.priority,
        correlationId: event.correlationId,
        retryCount: event.retryCount
      }
    };

    await this.storeMetric(metric);
    await this.updateCounters('delivered', event.source, event.type);
    await this.updateAgentMetrics(targetAgent, 'delivered');
  }

  /**
   * Record when an event processing fails
   */
  async recordEventFailed(event: EventData, error: string): Promise<void> {
    const metric: EventMetrics = {
      eventId: event.id,
      source: event.source,
      type: event.type,
      timestamp: Date.now(),
      status: 'failed',
      error,
      metadata: {
        priority: event.priority,
        correlationId: event.correlationId,
        retryCount: event.retryCount
      }
    };

    await this.storeMetric(metric);
    await this.updateCounters('failed', event.source, event.type);
    await this.updateErrorMetrics(error, event.source, event.type);
  }

  /**
   * Get analytics data for a time range
   */
  async getAnalyticsData(
    startTime: number,
    endTime: number,
    granularity: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<AnalyticsData> {
    const metrics = await this.getMetricsInRange(startTime, endTime);
    
    const totalEvents = metrics.length;
    const successfulEvents = metrics.filter(m => m.status === 'delivered').length;
    const failedEvents = metrics.filter(m => m.status === 'failed').length;
    const filteredEvents = metrics.filter(m => m.status === 'filtered').length;
    
    const processingTimes = metrics
      .filter(m => m.processingTime !== undefined)
      .map(m => m.processingTime!);
    
    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    const timeRangeMinutes = (endTime - startTime) / (1000 * 60);
    const throughputPerMinute = totalEvents / timeRangeMinutes;

    // Create breakdowns
    const bySource = this.createBreakdown(metrics, 'source');
    const byType = this.createBreakdown(metrics, 'type');
    const byAgent = this.createBreakdown(metrics, 'targetAgent');
    const byStatus = this.createBreakdown(metrics, 'status');

    return {
      timeRange: { start: startTime, end: endTime },
      metrics: {
        totalEvents,
        successfulEvents,
        failedEvents,
        filteredEvents,
        averageProcessingTime,
        throughputPerMinute
      },
      breakdown: {
        bySource,
        byType,
        byAgent,
        byStatus
      }
    };
  }

  /**
   * Get real-time metrics for the last N minutes
   */
  async getRealTimeMetrics(minutes: number = 5): Promise<AnalyticsData> {
    const endTime = Date.now();
    const startTime = endTime - (minutes * 60 * 1000);
    return this.getAnalyticsData(startTime, endTime, 'minute');
  }

  /**
   * Get top error patterns
   */
  async getTopErrors(limit: number = 10, timeRange?: { start: number; end: number }): Promise<Array<{
    error: string;
    count: number;
    sources: string[];
    types: string[];
    lastOccurrence: number;
  }>> {
    const key = 'analytics:errors';
    const errorData = await this.env.ANALYTICS_CACHE.get(key, 'json');
    
    if (!errorData) {
      return [];
    }

    const errors = errorData as Record<string, {
      count: number;
      sources: Set<string>;
      types: Set<string>;
      lastOccurrence: number;
    }>;

    return Object.entries(errors)
      .map(([error, data]) => ({
        error,
        count: data.count,
        sources: Array.from(data.sources),
        types: Array.from(data.types),
        lastOccurrence: data.lastOccurrence
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get performance trends
   */
  async getPerformanceTrends(
    hours: number = 24,
    granularity: 'hour' | 'minute' = 'hour'
  ): Promise<Array<{
    timestamp: number;
    throughput: number;
    averageProcessingTime: number;
    errorRate: number;
  }>> {
    const endTime = Date.now();
    const startTime = endTime - (hours * 60 * 60 * 1000);
    const intervalMs = granularity === 'hour' ? 60 * 60 * 1000 : 60 * 1000;
    
    const trends: Array<{
      timestamp: number;
      throughput: number;
      averageProcessingTime: number;
      errorRate: number;
    }> = [];

    for (let time = startTime; time < endTime; time += intervalMs) {
      const intervalEnd = Math.min(time + intervalMs, endTime);
      const intervalMetrics = await this.getAnalyticsData(time, intervalEnd, granularity);
      
      const errorRate = intervalMetrics.metrics.totalEvents > 0
        ? intervalMetrics.metrics.failedEvents / intervalMetrics.metrics.totalEvents
        : 0;

      trends.push({
        timestamp: time,
        throughput: intervalMetrics.metrics.throughputPerMinute,
        averageProcessingTime: intervalMetrics.metrics.averageProcessingTime,
        errorRate
      });
    }

    return trends;
  }

  /**
   * Store a metric in R2 for long-term storage
   */
  private async storeMetric(metric: EventMetrics): Promise<void> {
    try {
      // Store in R2 for long-term analytics
      const date = new Date(metric.timestamp);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hour = String(date.getUTCHours()).padStart(2, '0');
      
      const key = `metrics/${year}/${month}/${day}/${hour}/${metric.eventId}.json`;
      
      await this.env.EVENT_ARCHIVE.put(key, JSON.stringify(metric), {
        httpMetadata: {
          contentType: 'application/json'
        }
      });

      // Also cache recent metrics in KV for fast access
      await this.cacheRecentMetric(metric);
    } catch (error) {
      console.error('Failed to store metric:', error);
    }
  }

  /**
   * Cache recent metrics in KV for fast access
   */
  private async cacheRecentMetric(metric: EventMetrics): Promise<void> {
    const key = `recent_metrics:${metric.eventId}`;
    await this.env.ANALYTICS_CACHE.put(key, JSON.stringify(metric), {
      expirationTtl: 24 * 60 * 60 // 24 hours
    });
  }

  /**
   * Update counter metrics
   */
  private async updateCounters(
    status: string,
    source: string,
    type: string
  ): Promise<void> {
    const now = Date.now();
    const hour = Math.floor(now / (60 * 60 * 1000));
    
    // Update hourly counters
    const counterKeys = [
      `counter:${hour}:total`,
      `counter:${hour}:${status}`,
      `counter:${hour}:source:${source}`,
      `counter:${hour}:type:${type}`,
      `counter:${hour}:${source}:${status}`,
      `counter:${hour}:${type}:${status}`
    ];

    for (const key of counterKeys) {
      await this.incrementCounter(key);
    }
  }

  /**
   * Update processing time metrics
   */
  private async updateProcessingTimeMetrics(
    processingTime: number,
    source: string,
    type: string
  ): Promise<void> {
    const now = Date.now();
    const hour = Math.floor(now / (60 * 60 * 1000));
    
    const keys = [
      `processing_time:${hour}:total`,
      `processing_time:${hour}:source:${source}`,
      `processing_time:${hour}:type:${type}`
    ];

    for (const key of keys) {
      await this.updateAverageMetric(key, processingTime);
    }
  }

  /**
   * Update agent delivery metrics
   */
  private async updateAgentMetrics(agent: string, status: string): Promise<void> {
    const now = Date.now();
    const hour = Math.floor(now / (60 * 60 * 1000));
    
    const key = `agent:${hour}:${agent}:${status}`;
    await this.incrementCounter(key);
  }

  /**
   * Update error metrics
   */
  private async updateErrorMetrics(
    error: string,
    source: string,
    type: string
  ): Promise<void> {
    const key = 'analytics:errors';
    const errorData = await this.env.ANALYTICS_CACHE.get(key, 'json') || {};
    
    if (!errorData[error]) {
      errorData[error] = {
        count: 0,
        sources: new Set(),
        types: new Set(),
        lastOccurrence: 0
      };
    }

    errorData[error].count++;
    errorData[error].sources.add(source);
    errorData[error].types.add(type);
    errorData[error].lastOccurrence = Date.now();

    await this.env.ANALYTICS_CACHE.put(key, JSON.stringify(errorData), {
      expirationTtl: 7 * 24 * 60 * 60 // 7 days
    });
  }

  /**
   * Increment a counter in KV
   */
  private async incrementCounter(key: string): Promise<void> {
    const current = await this.env.ANALYTICS_CACHE.get(key);
    const count = current ? parseInt(current, 10) + 1 : 1;
    
    await this.env.ANALYTICS_CACHE.put(key, count.toString(), {
      expirationTtl: 7 * 24 * 60 * 60 // 7 days
    });
  }

  /**
   * Update running average metric
   */
  private async updateAverageMetric(key: string, value: number): Promise<void> {
    const existing = await this.env.ANALYTICS_CACHE.get(key, 'json');
    
    let average = value;
    let count = 1;
    
    if (existing) {
      const data = existing as { average: number; count: number };
      count = data.count + 1;
      average = ((data.average * data.count) + value) / count;
    }

    await this.env.ANALYTICS_CACHE.put(key, JSON.stringify({ average, count }), {
      expirationTtl: 7 * 24 * 60 * 60 // 7 days
    });
  }

  /**
   * Get metrics in a time range from R2
   */
  private async getMetricsInRange(startTime: number, endTime: number): Promise<EventMetrics[]> {
    const metrics: EventMetrics[] = [];
    
    // For now, get from KV cache (recent metrics)
    // In production, this would query R2 for historical data
    const recentMetricsPrefix = 'recent_metrics:';
    const list = await this.env.ANALYTICS_CACHE.list({ prefix: recentMetricsPrefix });
    
    for (const key of list.keys) {
      const metric = await this.env.ANALYTICS_CACHE.get(key.name, 'json') as EventMetrics;
      if (metric && metric.timestamp >= startTime && metric.timestamp <= endTime) {
        metrics.push(metric);
      }
    }

    return metrics;
  }

  /**
   * Create breakdown by field
   */
  private createBreakdown(metrics: EventMetrics[], field: keyof EventMetrics): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    for (const metric of metrics) {
      const value = metric[field];
      if (value !== undefined && value !== null) {
        const key = String(value);
        breakdown[key] = (breakdown[key] || 0) + 1;
      }
    }

    return breakdown;
  }
}

