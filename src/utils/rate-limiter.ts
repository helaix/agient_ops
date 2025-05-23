import { Env, RateLimitConfig, RateLimitState, RateLimitError } from '@/types';

/**
 * Sophisticated rate limiting implementation with multiple strategies
 * Supports per-source, per-identifier, and burst limiting
 */
export class RateLimiter {
  constructor(private env: Env) {}

  /**
   * Check if a request should be rate limited
   */
  async checkRateLimit(source: string, identifier: string): Promise<boolean> {
    const key = this.getRateLimitKey(source, identifier);
    const config = await this.getRateLimitConfig(source, identifier);
    const state = await this.getRateLimitState(key);

    const now = Date.now();
    const windowStart = now - config.window;

    // Reset counter if window has passed
    if (state.resetTime <= now) {
      state.count = 0;
      state.resetTime = now + config.window;
      state.blocked = false;
    }

    // Check if limit exceeded
    if (state.count >= config.limit) {
      state.blocked = true;
      await this.setRateLimitState(key, state);
      return false;
    }

    return true;
  }

  /**
   * Increment the rate limit counter
   */
  async incrementCounter(source: string, identifier: string): Promise<void> {
    const key = this.getRateLimitKey(source, identifier);
    const config = await this.getRateLimitConfig(source, identifier);
    const state = await this.getRateLimitState(key);

    const now = Date.now();

    // Reset counter if window has passed
    if (state.resetTime <= now) {
      state.count = 1;
      state.resetTime = now + config.window;
      state.blocked = false;
    } else {
      state.count++;
    }

    await this.setRateLimitState(key, state);
  }

  /**
   * Get remaining quota for a source/identifier
   */
  async getRemainingQuota(source: string, identifier: string): Promise<number> {
    const key = this.getRateLimitKey(source, identifier);
    const config = await this.getRateLimitConfig(source, identifier);
    const state = await this.getRateLimitState(key);

    const now = Date.now();

    // Reset counter if window has passed
    if (state.resetTime <= now) {
      return config.limit;
    }

    return Math.max(0, config.limit - state.count);
  }

  /**
   * Get time until rate limit resets
   */
  async getResetTime(source: string, identifier: string): Promise<number> {
    const key = this.getRateLimitKey(source, identifier);
    const state = await this.getRateLimitState(key);

    return Math.max(0, state.resetTime - Date.now());
  }

  /**
   * Check and enforce rate limit, throwing error if exceeded
   */
  async enforceRateLimit(source: string, identifier: string): Promise<void> {
    const allowed = await this.checkRateLimit(source, identifier);
    
    if (!allowed) {
      const resetTime = await this.getResetTime(source, identifier);
      throw new RateLimitError(
        `Rate limit exceeded for ${source}:${identifier}`,
        {
          source,
          identifier,
          resetTime,
          retryAfter: Math.ceil(resetTime / 1000)
        }
      );
    }

    await this.incrementCounter(source, identifier);
  }

  /**
   * Get rate limit configuration for source/identifier
   */
  private async getRateLimitConfig(source: string, identifier: string): Promise<RateLimitConfig> {
    // Try to get custom config from KV
    const customConfigKey = `config:${source}:${identifier}`;
    const customConfig = await this.env.RATE_LIMITS.get(customConfigKey, 'json');
    
    if (customConfig) {
      return customConfig as RateLimitConfig;
    }

    // Try to get source-specific config
    const sourceConfigKey = `config:${source}`;
    const sourceConfig = await this.env.RATE_LIMITS.get(sourceConfigKey, 'json');
    
    if (sourceConfig) {
      return sourceConfig as RateLimitConfig;
    }

    // Return default config
    return {
      source,
      identifier,
      limit: parseInt(this.env.DEFAULT_RATE_LIMIT, 10),
      window: parseInt(this.env.RATE_LIMIT_WINDOW, 10),
      burst: parseInt(this.env.DEFAULT_RATE_LIMIT, 10) * 2 // Allow 2x burst
    };
  }

  /**
   * Get current rate limit state
   */
  private async getRateLimitState(key: string): Promise<RateLimitState> {
    const state = await this.env.RATE_LIMITS.get(key, 'json');
    
    if (state) {
      return state as RateLimitState;
    }

    // Return initial state
    return {
      count: 0,
      resetTime: Date.now() + parseInt(this.env.RATE_LIMIT_WINDOW, 10),
      blocked: false
    };
  }

  /**
   * Set rate limit state
   */
  private async setRateLimitState(key: string, state: RateLimitState): Promise<void> {
    const ttl = Math.max(60, Math.ceil((state.resetTime - Date.now()) / 1000));
    await this.env.RATE_LIMITS.put(key, JSON.stringify(state), { expirationTtl: ttl });
  }

  /**
   * Generate rate limit key
   */
  private getRateLimitKey(source: string, identifier: string): string {
    return `rate_limit:${source}:${identifier}`;
  }

  /**
   * Set custom rate limit configuration
   */
  async setRateLimitConfig(config: RateLimitConfig): Promise<void> {
    const key = config.identifier 
      ? `config:${config.source}:${config.identifier}`
      : `config:${config.source}`;
    
    await this.env.RATE_LIMITS.put(key, JSON.stringify(config));
  }

  /**
   * Remove rate limit configuration
   */
  async removeRateLimitConfig(source: string, identifier?: string): Promise<void> {
    const key = identifier 
      ? `config:${source}:${identifier}`
      : `config:${source}`;
    
    await this.env.RATE_LIMITS.delete(key);
  }

  /**
   * Clear rate limit state (reset counter)
   */
  async clearRateLimit(source: string, identifier: string): Promise<void> {
    const key = this.getRateLimitKey(source, identifier);
    await this.env.RATE_LIMITS.delete(key);
  }

  /**
   * Get rate limit statistics
   */
  async getRateLimitStats(source: string, identifier?: string): Promise<{
    config: RateLimitConfig;
    state: RateLimitState;
    remaining: number;
    resetTime: number;
  }> {
    const config = await this.getRateLimitConfig(source, identifier || 'default');
    const key = this.getRateLimitKey(source, identifier || 'default');
    const state = await this.getRateLimitState(key);
    const remaining = await this.getRemainingQuota(source, identifier || 'default');
    const resetTime = await this.getResetTime(source, identifier || 'default');

    return {
      config,
      state,
      remaining,
      resetTime
    };
  }

  /**
   * Implement sliding window rate limiting
   */
  async checkSlidingWindowRateLimit(
    source: string, 
    identifier: string, 
    windowSize: number = 60000, // 1 minute
    maxRequests: number = 100
  ): Promise<boolean> {
    const key = `sliding:${source}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSize;

    // Get existing timestamps
    const existingData = await this.env.RATE_LIMITS.get(key, 'json');
    let timestamps: number[] = existingData ? (existingData as number[]) : [];

    // Remove timestamps outside the window
    timestamps = timestamps.filter(ts => ts > windowStart);

    // Check if we're within the limit
    if (timestamps.length >= maxRequests) {
      return false;
    }

    // Add current timestamp
    timestamps.push(now);

    // Store updated timestamps with TTL
    const ttl = Math.ceil(windowSize / 1000) + 60; // Add buffer
    await this.env.RATE_LIMITS.put(key, JSON.stringify(timestamps), { expirationTtl: ttl });

    return true;
  }

  /**
   * Implement token bucket rate limiting
   */
  async checkTokenBucketRateLimit(
    source: string,
    identifier: string,
    bucketSize: number = 100,
    refillRate: number = 10, // tokens per second
    tokensRequested: number = 1
  ): Promise<boolean> {
    const key = `bucket:${source}:${identifier}`;
    const now = Date.now();

    // Get existing bucket state
    const existingData = await this.env.RATE_LIMITS.get(key, 'json');
    let bucket = existingData ? existingData as { tokens: number; lastRefill: number } : {
      tokens: bucketSize,
      lastRefill: now
    };

    // Calculate tokens to add based on time elapsed
    const timeDiff = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = Math.floor(timeDiff * refillRate);
    
    // Refill bucket (up to max capacity)
    bucket.tokens = Math.min(bucketSize, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if we have enough tokens
    if (bucket.tokens < tokensRequested) {
      // Update bucket state
      await this.env.RATE_LIMITS.put(key, JSON.stringify(bucket), { expirationTtl: 3600 });
      return false;
    }

    // Consume tokens
    bucket.tokens -= tokensRequested;

    // Update bucket state
    await this.env.RATE_LIMITS.put(key, JSON.stringify(bucket), { expirationTtl: 3600 });
    return true;
  }
}

