import { vi } from 'vitest';
import { MockGitHubAPI, MockLinearAPI, MockSlackAPI } from './external-apis';
import { MockDurableObjectStorage, MockKVNamespace, MockR2Bucket } from './storage-backends';
import { MockDurableObjectStub } from './durable-objects';

// Global mock instances
export const mockGitHubAPI = new MockGitHubAPI();
export const mockLinearAPI = new MockLinearAPI();
export const mockSlackAPI = new MockSlackAPI();
export const mockDurableObjectStorage = new MockDurableObjectStorage();
export const mockKVNamespace = new MockKVNamespace();
export const mockR2Bucket = new MockR2Bucket();

// Mock factory functions
export const createMockDurableObjectStub = (id: string) => new MockDurableObjectStub(id);

export function initializeMocks(): void {
  console.log('🎭 Initializing mocks...');
  
  // Mock crypto.randomUUID for consistent test IDs
  global.crypto = {
    ...global.crypto,
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
  };
  
  // Mock Date.now for consistent timestamps
  const mockNow = vi.fn(() => 1640995200000); // 2022-01-01T00:00:00.000Z
  vi.stubGlobal('Date', {
    ...Date,
    now: mockNow
  });
  
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  
  console.log('✅ Mocks initialized');
}

export function resetMocks(): void {
  // Reset all mock instances
  mockGitHubAPI.reset();
  mockLinearAPI.reset();
  mockSlackAPI.reset();
  mockDurableObjectStorage.reset();
  mockKVNamespace.reset();
  mockR2Bucket.reset();
  
  // Clear all vi mocks
  vi.clearAllMocks();
}

// Mock data generators
export const mockData = {
  agentInstance: (overrides = {}) => ({
    id: 'test-agent-id',
    type: 'integration-dashboard' as const,
    config: {
      type: 'integration-dashboard' as const,
      name: 'Test Agent',
      description: 'Test agent for unit tests',
      maxConcurrentTasks: 5,
      timeoutMs: 30000,
      retryAttempts: 3,
      capabilities: ['test-capability'],
      dependencies: []
    },
    status: 'idle' as const,
    currentTasks: [],
    lastHeartbeat: Date.now(),
    createdAt: Date.now(),
    metadata: {},
    ...overrides
  }),
  
  agentTask: (overrides = {}) => ({
    id: 'test-task-id',
    type: 'test-task',
    priority: 'medium' as const,
    payload: { test: 'data' },
    context: {
      workflowId: 'test-workflow-id',
      metadata: {}
    },
    createdAt: Date.now(),
    retryCount: 0,
    maxRetries: 3,
    ...overrides
  }),
  
  workflowState: (overrides = {}) => ({
    id: 'test-workflow-id',
    name: 'Test Workflow',
    description: 'Test workflow for unit tests',
    status: 'pending' as const,
    priority: 'medium' as const,
    createdAt: Date.now(),
    progress: {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      activeAgents: 0,
      bottlenecks: [],
      metrics: {
        averageTaskDuration: 0,
        agentUtilization: {},
        errorRate: 0,
        throughput: 0
      }
    },
    context: {
      userId: 'test-user-id',
      tags: [],
      metadata: {}
    },
    tasks: {},
    agents: {},
    dependencies: [],
    metadata: {},
    ...overrides
  }),
  
  agentMessage: (overrides = {}) => ({
    id: 'test-message-id',
    fromAgentId: 'test-from-agent',
    toAgentId: 'test-to-agent',
    type: 'task' as const,
    payload: { test: 'message' },
    timestamp: Date.now(),
    ...overrides
  }),
  
  githubPullRequest: (overrides = {}) => ({
    id: 123,
    number: 456,
    title: 'Test PR',
    body: 'Test PR description',
    user: { login: 'test-user' },
    base: { ref: 'main' },
    head: { ref: 'feature-branch' },
    state: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),
  
  linearIssue: (overrides = {}) => ({
    id: 'test-issue-id',
    title: 'Test Issue',
    description: 'Test issue description',
    state: { name: 'Todo' },
    assignee: { name: 'Test User' },
    team: { name: 'Test Team' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  })
};

// Test utilities
export const testUtils = {
  // Wait for a condition to be true
  waitFor: async (condition: () => boolean | Promise<boolean>, timeout = 5000): Promise<void> => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  },
  
  // Create a delay
  delay: (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate test data
  generateTestEvents: (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `event-${i}`,
      type: 'test-event',
      source: 'internal' as const,
      timestamp: Date.now() + i,
      payload: { index: i },
      metadata: {}
    }));
  }
};

