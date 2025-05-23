import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { setupMiniflare, teardownMiniflare } from './utils/miniflare-setup';
import { initializeMocks, resetMocks } from './mocks';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  
  // Initialize Miniflare for Cloudflare Workers testing
  await setupMiniflare();
  
  // Initialize all mock implementations
  initializeMocks();
  
  console.log('✅ Test environment ready');
});

afterAll(async () => {
  console.log('🧹 Tearing down test environment...');
  
  // Clean up Miniflare
  await teardownMiniflare();
  
  console.log('✅ Test environment cleaned up');
});

beforeEach(() => {
  // Reset mocks and state before each test
  resetMocks();
  
  // Reset any global state
  global.testStartTime = Date.now();
});

afterEach(() => {
  // Clean up after each test
  const testDuration = Date.now() - (global.testStartTime || 0);
  
  // Log slow tests (>1000ms)
  if (testDuration > 1000) {
    console.warn(`⚠️ Slow test detected: ${testDuration}ms`);
  }
});

// Global test utilities
declare global {
  var testStartTime: number;
}

// Extend expect with custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  
  toHaveValidAgentStructure(received: any) {
    const requiredFields = ['id', 'type', 'config', 'status', 'currentTasks', 'lastHeartbeat', 'createdAt'];
    const hasAllFields = requiredFields.every(field => field in received);
    
    if (hasAllFields) {
      return {
        message: () => `expected agent to not have valid structure`,
        pass: true,
      };
    } else {
      const missingFields = requiredFields.filter(field => !(field in received));
      return {
        message: () => `expected agent to have valid structure, missing: ${missingFields.join(', ')}`,
        pass: false,
      };
    }
  }
});

// Type declarations for custom matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeWithinRange(floor: number, ceiling: number): T;
    toHaveValidAgentStructure(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeWithinRange(floor: number, ceiling: number): any;
    toHaveValidAgentStructure(): any;
  }
}

