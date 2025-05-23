import { vi } from 'vitest';
import { AgentTask, AgentInstance, WorkflowState, AgentMessage } from '@/types';
import { mockData } from '../mocks';

/**
 * Test helper utilities for creating and managing test data
 */
export class TestHelpers {
  /**
   * Create a test agent instance with optional overrides
   */
  static createTestAgent(overrides: Partial<AgentInstance> = {}): AgentInstance {
    return mockData.agentInstance(overrides);
  }
  
  /**
   * Create a test task with optional overrides
   */
  static createTestTask(overrides: Partial<AgentTask> = {}): AgentTask {
    return mockData.agentTask(overrides);
  }
  
  /**
   * Create a test workflow with optional overrides
   */
  static createTestWorkflow(overrides: Partial<WorkflowState> = {}): WorkflowState {
    return mockData.workflowState(overrides);
  }
  
  /**
   * Create a test message with optional overrides
   */
  static createTestMessage(overrides: Partial<AgentMessage> = {}): AgentMessage {
    return mockData.agentMessage(overrides);
  }
  
  /**
   * Create multiple test tasks
   */
  static createTestTasks(count: number, baseOverrides: Partial<AgentTask> = {}): AgentTask[] {
    return Array.from({ length: count }, (_, i) => 
      this.createTestTask({
        ...baseOverrides,
        id: `test-task-${i}`,
        payload: { ...baseOverrides.payload, index: i }
      })
    );
  }
  
  /**
   * Create a test environment with mocked dependencies
   */
  static createTestEnvironment() {
    return {
      ENVIRONMENT: 'test',
      LINEAR_API_KEY: 'test-linear-key',
      GITHUB_TOKEN: 'test-github-token',
      SLACK_TOKEN: 'test-slack-token',
      // Mock Durable Object namespaces will be injected by Miniflare
    };
  }
  
  /**
   * Wait for a condition to be true with timeout
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout = 5000,
    interval = 10
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await this.delay(interval);
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  }
  
  /**
   * Create a delay
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Mock a fetch response
   */
  static mockFetchResponse(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  /**
   * Mock a fetch error
   */
  static mockFetchError(message: string): Promise<never> {
    return Promise.reject(new Error(message));
  }
  
  /**
   * Create a mock request
   */
  static createMockRequest(
    url: string,
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Request {
    const { method = 'GET', body, headers = {} } = options;
    
    return new Request(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }
  
  /**
   * Assert that a response has the expected structure
   */
  static async assertResponseStructure(
    response: Response,
    expectedStatus: number,
    expectedFields?: string[]
  ): Promise<any> {
    expect(response.status).toBe(expectedStatus);
    
    const data = await response.json();
    
    if (expectedFields) {
      for (const field of expectedFields) {
        expect(data).toHaveProperty(field);
      }
    }
    
    return data;
  }
  
  /**
   * Generate test events for load testing
   */
  static generateTestEvents(count: number, eventType = 'test-event'): any[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `event-${i}`,
      type: eventType,
      source: 'internal' as const,
      timestamp: Date.now() + i,
      payload: { index: i, data: `test-data-${i}` },
      metadata: { testRun: true }
    }));
  }
  
  /**
   * Measure execution time of a function
   */
  static async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }
  
  /**
   * Run a function multiple times and collect metrics
   */
  static async runPerformanceTest<T>(
    fn: () => Promise<T>,
    iterations: number
  ): Promise<{
    results: T[];
    durations: number[];
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    p95Duration: number;
    p99Duration: number;
  }> {
    const results: T[] = [];
    const durations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await this.measureExecutionTime(fn);
      results.push(result);
      durations.push(duration);
    }
    
    durations.sort((a, b) => a - b);
    
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = durations[0];
    const maxDuration = durations[durations.length - 1];
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);
    const p95Duration = durations[p95Index];
    const p99Duration = durations[p99Index];
    
    return {
      results,
      durations,
      averageDuration,
      minDuration,
      maxDuration,
      p95Duration,
      p99Duration
    };
  }
  
  /**
   * Create a test scenario for load testing
   */
  static createLoadTestScenario(
    name: string,
    setup: () => Promise<void>,
    execute: () => Promise<any>,
    teardown: () => Promise<void>,
    options: {
      iterations?: number;
      concurrency?: number;
      timeout?: number;
    } = {}
  ) {
    const { iterations = 100, concurrency = 10, timeout = 30000 } = options;
    
    return {
      name,
      async run() {
        await setup();
        
        try {
          const batches = Math.ceil(iterations / concurrency);
          const results: any[] = [];
          const durations: number[] = [];
          
          for (let batch = 0; batch < batches; batch++) {
            const batchSize = Math.min(concurrency, iterations - batch * concurrency);
            const promises: Promise<any>[] = [];
            
            for (let i = 0; i < batchSize; i++) {
              promises.push(
                TestHelpers.measureExecutionTime(execute).then(({ result, duration }) => {
                  results.push(result);
                  durations.push(duration);
                  return result;
                })
              );
            }
            
            await Promise.all(promises);
          }
          
          return {
            results,
            durations,
            averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
            maxDuration: Math.max(...durations),
            minDuration: Math.min(...durations)
          };
        } finally {
          await teardown();
        }
      }
    };
  }
  
  /**
   * Mock console methods to capture logs
   */
  static mockConsole() {
    const logs: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.log = vi.fn((...args) => {
      logs.push(args.join(' '));
    });
    
    console.warn = vi.fn((...args) => {
      warnings.push(args.join(' '));
    });
    
    console.error = vi.fn((...args) => {
      errors.push(args.join(' '));
    });
    
    return {
      logs,
      warnings,
      errors,
      restore() {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
      }
    };
  }
}

