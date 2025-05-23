import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from '../../src/utils/rate-limiter';
import { RateLimitError } from '../../src/types';

// Mock KV namespace
const mockKV = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  list: vi.fn()
};

// Mock environment
const mockEnv = {
  RATE_LIMITS: mockKV,
  DEFAULT_RATE_LIMIT: '100',
  RATE_LIMIT_WINDOW: '60000',
  ENVIRONMENT: 'test'
} as any;

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    vi.clearAllMocks();
    rateLimiter = new RateLimiter(mockEnv);
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', async () => {
      // Mock empty state (first request)
      mockKV.get.mockResolvedValue(null);

      const allowed = await rateLimiter.checkRateLimit('github', 'user123');
      expect(allowed).toBe(true);
    });

    it('should allow requests when window has expired', async () => {
      const expiredState = {
        count: 50,
        resetTime: Date.now() - 1000, // Expired 1 second ago
        blocked: false
      };
      
      mockKV.get.mockResolvedValue(JSON.stringify(expiredState));

      const allowed = await rateLimiter.checkRateLimit('github', 'user123');
      expect(allowed).toBe(true);
    });

    it('should block requests when limit exceeded', async () => {
      const blockedState = {
        count: 100,
        resetTime: Date.now() + 30000, // 30 seconds in future
        blocked: true
      };
      
      mockKV.get.mockResolvedValue(JSON.stringify(blockedState));

      const allowed = await rateLimiter.checkRateLimit('github', 'user123');
      expect(allowed).toBe(false);
    });
  });

  describe('incrementCounter', () => {
    it('should increment counter for new identifier', async () => {
      mockKV.get.mockResolvedValue(null);

      await rateLimiter.incrementCounter('github', 'user123');

      expect(mockKV.put).toHaveBeenCalledWith(
        'rate_limit:github:user123',
        expect.stringContaining('"count":1'),
        expect.objectContaining({ expirationTtl: expect.any(Number) })
      );
    });

    it('should increment existing counter', async () => {
      const existingState = {
        count: 5,
        resetTime: Date.now() + 30000,
        blocked: false
      };
      
      mockKV.get.mockResolvedValue(JSON.stringify(existingState));

      await rateLimiter.incrementCounter('github', 'user123');

      expect(mockKV.put).toHaveBeenCalledWith(
        'rate_limit:github:user123',
        expect.stringContaining('"count":6'),
        expect.objectContaining({ expirationTtl: expect.any(Number) })
      );
    });

    it('should reset counter when window expired', async () => {
      const expiredState = {
        count: 50,
        resetTime: Date.now() - 1000, // Expired
        blocked: false
      };
      
      mockKV.get.mockResolvedValue(JSON.stringify(expiredState));

      await rateLimiter.incrementCounter('github', 'user123');

      expect(mockKV.put).toHaveBeenCalledWith(
        'rate_limit:github:user123',
        expect.stringContaining('"count":1'),
        expect.objectContaining({ expirationTtl: expect.any(Number) })
      );
    });
  });

  describe('getRemainingQuota', () => {
    it('should return full quota for new identifier', async () => {
      mockKV.get.mockResolvedValueOnce(null); // No custom config
      mockKV.get.mockResolvedValueOnce(null); // No source config
      mockKV.get.mockResolvedValueOnce(null); // No state

      const remaining = await rateLimiter.getRemainingQuota('github', 'user123');
      expect(remaining).toBe(100); // Default limit
    });

    it('should return remaining quota', async () => {
      const state = {
        count: 30,
        resetTime: Date.now() + 30000,
        blocked: false
      };
      
      mockKV.get.mockResolvedValueOnce(null); // No custom config
      mockKV.get.mockResolvedValueOnce(null); // No source config
      mockKV.get.mockResolvedValueOnce(JSON.stringify(state));

      const remaining = await rateLimiter.getRemainingQuota('github', 'user123');
      expect(remaining).toBe(70); // 100 - 30
    });

    it('should return 0 when limit exceeded', async () => {
      const state = {
        count: 150,
        resetTime: Date.now() + 30000,
        blocked: true
      };
      
      mockKV.get.mockResolvedValueOnce(null);
      mockKV.get.mockResolvedValueOnce(null);
      mockKV.get.mockResolvedValueOnce(JSON.stringify(state));

      const remaining = await rateLimiter.getRemainingQuota('github', 'user123');
      expect(remaining).toBe(0);
    });
  });

  describe('enforceRateLimit', () => {
    it('should allow and increment for valid request', async () => {
      mockKV.get.mockResolvedValue(null);

      await expect(rateLimiter.enforceRateLimit('github', 'user123')).resolves.toBeUndefined();
      expect(mockKV.put).toHaveBeenCalled();
    });

    it('should throw RateLimitError when limit exceeded', async () => {
      const blockedState = {
        count: 100,
        resetTime: Date.now() + 30000,
        blocked: true
      };
      
      mockKV.get.mockResolvedValue(JSON.stringify(blockedState));

      await expect(rateLimiter.enforceRateLimit('github', 'user123'))
        .rejects.toThrow(RateLimitError);
    });
  });

  describe('setRateLimitConfig', () => {
    it('should store custom rate limit config', async () => {
      const config = {
        source: 'github',
        identifier: 'user123',
        limit: 200,
        window: 120000
      };

      await rateLimiter.setRateLimitConfig(config);

      expect(mockKV.put).toHaveBeenCalledWith(
        'config:github:user123',
        JSON.stringify(config)
      );
    });

    it('should store source-level config', async () => {
      const config = {
        source: 'github',
        identifier: '',
        limit: 500,
        window: 60000
      };

      await rateLimiter.setRateLimitConfig(config);

      expect(mockKV.put).toHaveBeenCalledWith(
        'config:github',
        JSON.stringify(config)
      );
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit state', async () => {
      await rateLimiter.clearRateLimit('github', 'user123');

      expect(mockKV.delete).toHaveBeenCalledWith('rate_limit:github:user123');
    });
  });

  describe('checkSlidingWindowRateLimit', () => {
    it('should allow request within sliding window', async () => {
      const now = Date.now();
      const timestamps = [now - 30000, now - 20000]; // 2 requests in last minute
      
      mockKV.get.mockResolvedValue(JSON.stringify(timestamps));

      const allowed = await rateLimiter.checkSlidingWindowRateLimit(
        'github', 
        'user123', 
        60000, // 1 minute window
        100    // 100 requests limit
      );

      expect(allowed).toBe(true);
      expect(mockKV.put).toHaveBeenCalled();
    });

    it('should block request when sliding window limit exceeded', async () => {
      const now = Date.now();
      const timestamps = Array.from({ length: 100 }, (_, i) => now - (i * 100)); // 100 recent requests
      
      mockKV.get.mockResolvedValue(JSON.stringify(timestamps));

      const allowed = await rateLimiter.checkSlidingWindowRateLimit(
        'github', 
        'user123', 
        60000, // 1 minute window
        100    // 100 requests limit
      );

      expect(allowed).toBe(false);
    });

    it('should filter out old timestamps', async () => {
      const now = Date.now();
      const timestamps = [
        now - 70000, // Outside window
        now - 30000, // Inside window
        now - 20000  // Inside window
      ];
      
      mockKV.get.mockResolvedValue(JSON.stringify(timestamps));

      const allowed = await rateLimiter.checkSlidingWindowRateLimit(
        'github', 
        'user123', 
        60000, // 1 minute window
        100    // 100 requests limit
      );

      expect(allowed).toBe(true);
      
      // Should store only timestamps within window plus new one
      const putCall = mockKV.put.mock.calls[0];
      const storedTimestamps = JSON.parse(putCall[1]);
      expect(storedTimestamps).toHaveLength(3); // 2 old + 1 new
    });
  });

  describe('checkTokenBucketRateLimit', () => {
    it('should allow request when bucket has tokens', async () => {
      const bucket = {
        tokens: 50,
        lastRefill: Date.now() - 1000 // 1 second ago
      };
      
      mockKV.get.mockResolvedValue(JSON.stringify(bucket));

      const allowed = await rateLimiter.checkTokenBucketRateLimit(
        'github',
        'user123',
        100, // bucket size
        10,  // refill rate (tokens per second)
        5    // tokens requested
      );

      expect(allowed).toBe(true);
      expect(mockKV.put).toHaveBeenCalled();
    });

    it('should block request when insufficient tokens', async () => {
      const bucket = {
        tokens: 2,
        lastRefill: Date.now()
      };
      
      mockKV.get.mockResolvedValue(JSON.stringify(bucket));

      const allowed = await rateLimiter.checkTokenBucketRateLimit(
        'github',
        'user123',
        100, // bucket size
        10,  // refill rate
        5    // tokens requested (more than available)
      );

      expect(allowed).toBe(false);
    });

    it('should refill tokens based on time elapsed', async () => {
      const bucket = {
        tokens: 10,
        lastRefill: Date.now() - 5000 // 5 seconds ago
      };
      
      mockKV.get.mockResolvedValue(JSON.stringify(bucket));

      const allowed = await rateLimiter.checkTokenBucketRateLimit(
        'github',
        'user123',
        100, // bucket size
        10,  // refill rate (10 tokens per second)
        30   // tokens requested
      );

      expect(allowed).toBe(true); // 10 + (5 * 10) = 60 tokens available
    });

    it('should cap tokens at bucket size', async () => {
      const bucket = {
        tokens: 90,
        lastRefill: Date.now() - 10000 // 10 seconds ago
      };
      
      mockKV.get.mockResolvedValue(JSON.stringify(bucket));

      await rateLimiter.checkTokenBucketRateLimit(
        'github',
        'user123',
        100, // bucket size
        20,  // refill rate (would add 200 tokens)
        1    // tokens requested
      );

      // Check that tokens were capped at bucket size
      const putCall = mockKV.put.mock.calls[0];
      const updatedBucket = JSON.parse(putCall[1]);
      expect(updatedBucket.tokens).toBe(99); // 100 - 1 requested
    });
  });
});

