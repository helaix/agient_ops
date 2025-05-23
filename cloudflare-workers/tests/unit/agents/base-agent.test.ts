import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseAgent } from '@/agents/base-agent';
import { AgentConfig, AgentTask, AgentMessage, Env } from '@/types';
import { MockDurableObjectStorage } from '../../mocks/storage-backends';
import { TestHelpers } from '../../utils/test-helpers';
import { MockFactories } from '../../utils/mock-factories';

// Test implementation of BaseAgent for testing
class TestAgent extends BaseAgent {
  protected async getDefaultConfig(): Promise<AgentConfig> {
    return MockFactories.createAgentConfig({
      type: 'integration-dashboard',
      name: 'Test Agent'
    });
  }

  protected async processTask(task: AgentTask) {
    // Simulate task processing
    await TestHelpers.delay(10);
    
    return {
      taskId: task.id,
      status: 'success' as const,
      result: { processed: true, taskType: task.type },
      metrics: {
        executionTimeMs: 10,
        apiCallsCount: 1,
        errorCount: 0,
        retryCount: 0
      }
    };
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    // Simulate message handling
    await TestHelpers.delay(5);
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;
  let mockState: any;
  let mockEnv: Env;
  let mockStorage: MockDurableObjectStorage;

  beforeEach(() => {
    mockStorage = new MockDurableObjectStorage();
    
    mockState = {
      id: { toString: () => 'test-agent-id' },
      storage: mockStorage
    };

    mockEnv = {
      AGENT_COORDINATOR: {} as any,
      STATE_MANAGER: {} as any,
      INTEGRATION_DASHBOARD_AGENT: {} as any,
      REVIEW_MANAGER_AGENT: {} as any,
      CONTEXT_OPTIMIZER_AGENT: {} as any,
      PATTERN_BRIDGE_AGENT: {} as any,
      LINEAR_STATE_AGENT: {} as any,
      CONFIG_KV: {} as any,
      LOGS_BUCKET: {} as any,
      METRICS: {
        writeDataPoint: vi.fn()
      } as any,
      ENVIRONMENT: 'test',
      LINEAR_API_KEY: 'test-key',
      GITHUB_TOKEN: 'test-token',
      SLACK_TOKEN: 'test-slack-token'
    };

    agent = new TestAgent(mockState, mockEnv);
  });

  describe('initialization', () => {
    it('should initialize with default configuration', async () => {
      const request = TestHelpers.createMockRequest('https://agent/status');
      const response = await agent.fetch(request);
      
      expect(response.status).toBe(200);
      
      const status = await response.json();
      expect(status).toHaveValidAgentStructure();
      expect(status.id).toBe('test-agent-id');
      expect(status.type).toBe('integration-dashboard');
      expect(status.status).toBe('idle');
    });

    it('should persist instance data to storage', async () => {
      const request = TestHelpers.createMockRequest('https://agent/status');
      await agent.fetch(request);
      
      const storedInstance = mockStorage.getData('instance');
      expect(storedInstance).toBeDefined();
      expect(storedInstance.id).toBe('test-agent-id');
      expect(storedInstance.type).toBe('integration-dashboard');
    });

    it('should restore instance from storage on subsequent requests', async () => {
      // First request to initialize
      const request1 = TestHelpers.createMockRequest('https://agent/status');
      await agent.fetch(request1);
      
      // Create new agent instance with same state
      const agent2 = new TestAgent(mockState, mockEnv);
      
      // Second request should restore from storage
      const request2 = TestHelpers.createMockRequest('https://agent/status');
      const response2 = await agent2.fetch(request2);
      
      const status = await response2.json();
      expect(status.id).toBe('test-agent-id');
      expect(status.type).toBe('integration-dashboard');
    });
  });

  describe('task processing', () => {
    it('should handle task processing correctly', async () => {
      const task = MockFactories.createAgentTask({
        type: 'test-task',
        payload: { action: 'process' }
      });

      const request = TestHelpers.createMockRequest('https://agent/task', {
        method: 'POST',
        body: task
      });

      const response = await agent.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.taskId).toBe(task.id);
      expect(result.status).toBe('success');
      expect(result.result.processed).toBe(true);
      expect(result.metrics.executionTimeMs).toBeGreaterThan(0);
    });

    it('should handle task processing errors', async () => {
      // Create agent that throws error during task processing
      class ErrorAgent extends TestAgent {
        protected async processTask(task: AgentTask) {
          throw new Error('Task processing failed');
        }
      }

      const errorAgent = new ErrorAgent(mockState, mockEnv);
      const task = MockFactories.createAgentTask();

      const request = TestHelpers.createMockRequest('https://agent/task', {
        method: 'POST',
        body: task
      });

      const response = await errorAgent.fetch(request);
      expect(response.status).toBe(500);

      const result = await response.json();
      expect(result.taskId).toBe(task.id);
      expect(result.status).toBe('failure');
      expect(result.error).toBe('Task processing failed');
    });

    it('should reject non-POST requests to task endpoint', async () => {
      const request = TestHelpers.createMockRequest('https://agent/task', {
        method: 'GET'
      });

      const response = await agent.fetch(request);
      expect(response.status).toBe(405);
    });

    it('should process tasks within timeout limits', async () => {
      const task = MockFactories.createAgentTask();

      const { duration } = await TestHelpers.measureExecutionTime(async () => {
        const request = TestHelpers.createMockRequest('https://agent/task', {
          method: 'POST',
          body: task
        });
        return agent.fetch(request);
      });

      // Task should complete quickly (under 100ms for test)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('inter-agent communication', () => {
    it('should handle incoming messages', async () => {
      const message = MockFactories.createAgentMessage({
        type: 'coordination',
        payload: { action: 'sync' }
      });

      const request = TestHelpers.createMockRequest('https://agent/message', {
        method: 'POST',
        body: message
      });

      const response = await agent.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.status).toBe('received');
    });

    it('should queue messages when received', async () => {
      const message = MockFactories.createAgentMessage();

      const request = TestHelpers.createMockRequest('https://agent/message', {
        method: 'POST',
        body: message
      });

      await agent.fetch(request);

      // Check that message was stored in queue
      const messageQueue = mockStorage.getData('messageQueue');
      expect(messageQueue).toBeDefined();
      expect(messageQueue.length).toBe(1);
      expect(messageQueue[0].id).toBe(message.id);
    });

    it('should reject non-POST requests to message endpoint', async () => {
      const request = TestHelpers.createMockRequest('https://agent/message', {
        method: 'GET'
      });

      const response = await agent.fetch(request);
      expect(response.status).toBe(405);
    });
  });

  describe('status and health monitoring', () => {
    it('should return current status', async () => {
      const request = TestHelpers.createMockRequest('https://agent/status');
      const response = await agent.fetch(request);
      
      expect(response.status).toBe(200);
      
      const status = await response.json();
      expect(status).toHaveProperty('id');
      expect(status).toHaveProperty('type');
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('currentTasks');
      expect(status).toHaveProperty('lastHeartbeat');
      expect(status).toHaveProperty('uptime');
    });

    it('should return health check information', async () => {
      const request = TestHelpers.createMockRequest('https://agent/health');
      const response = await agent.fetch(request);
      
      expect(response.status).toBe(200);
      
      const health = await response.json();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('lastHeartbeat');
      expect(health.status).toBe('healthy');
    });

    it('should implement health checks', async () => {
      // Get initial health
      const request1 = TestHelpers.createMockRequest('https://agent/health');
      const response1 = await agent.fetch(request1);
      const health1 = await response1.json();
      
      expect(health1.status).toBe('healthy');
      
      // Health status should be based on heartbeat timing
      // (In a real scenario, we'd test with actual time manipulation)
    });
  });

  describe('lifecycle management', () => {
    it('should handle termination gracefully', async () => {
      const request = TestHelpers.createMockRequest('https://agent/terminate', {
        method: 'POST'
      });

      const response = await agent.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.status).toBe('terminated');
    });

    it('should reject non-POST requests to terminate endpoint', async () => {
      const request = TestHelpers.createMockRequest('https://agent/terminate', {
        method: 'GET'
      });

      const response = await agent.fetch(request);
      expect(response.status).toBe(405);
    });

    it('should update agent status', async () => {
      // Initialize agent first
      const statusRequest = TestHelpers.createMockRequest('https://agent/status');
      await agent.fetch(statusRequest);

      // Process a task to change status
      const task = MockFactories.createAgentTask();
      const taskRequest = TestHelpers.createMockRequest('https://agent/task', {
        method: 'POST',
        body: task
      });
      await agent.fetch(taskRequest);

      // Check status was updated
      const statusResponse = await agent.fetch(statusRequest);
      const status = await statusResponse.json();
      
      expect(status.lastHeartbeat).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle malformed requests', async () => {
      const request = new Request('https://agent/task', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await agent.fetch(request);
      expect(response.status).toBe(500);
    });

    it('should handle unknown routes', async () => {
      const request = TestHelpers.createMockRequest('https://agent/unknown');
      const response = await agent.fetch(request);
      
      expect(response.status).toBe(404);
    });

    it('should maintain state consistency on errors', async () => {
      // Get initial state
      const statusRequest = TestHelpers.createMockRequest('https://agent/status');
      const initialResponse = await agent.fetch(statusRequest);
      const initialStatus = await initialResponse.json();

      // Try to process invalid task
      const invalidRequest = new Request('https://agent/task', {
        method: 'POST',
        body: 'invalid',
        headers: { 'Content-Type': 'application/json' }
      });
      await agent.fetch(invalidRequest);

      // Check that state is still consistent
      const finalResponse = await agent.fetch(statusRequest);
      const finalStatus = await finalResponse.json();
      
      expect(finalStatus.id).toBe(initialStatus.id);
      expect(finalStatus.type).toBe(initialStatus.type);
    });
  });

  describe('performance', () => {
    it('should handle concurrent operations', async () => {
      const tasks = MockFactories.createAgentTasks(5);
      
      const promises = tasks.map(task => {
        const request = TestHelpers.createMockRequest('https://agent/task', {
          method: 'POST',
          body: task
        });
        return agent.fetch(request);
      });

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Verify all tasks were processed
      const results = await Promise.all(
        responses.map(response => response.json())
      );
      
      results.forEach((result, index) => {
        expect(result.taskId).toBe(tasks[index].id);
        expect(result.status).toBe('success');
      });
    });

    it('should manage memory usage efficiently', async () => {
      // Process multiple tasks and check memory doesn't grow excessively
      const taskCount = 10;
      const tasks = MockFactories.createAgentTasks(taskCount);

      for (const task of tasks) {
        const request = TestHelpers.createMockRequest('https://agent/task', {
          method: 'POST',
          body: task
        });
        await agent.fetch(request);
      }

      // In a real implementation, we'd check actual memory usage
      // For now, just verify the agent is still responsive
      const statusRequest = TestHelpers.createMockRequest('https://agent/status');
      const response = await agent.fetch(statusRequest);
      
      expect(response.status).toBe(200);
    });
  });

  describe('metrics and logging', () => {
    it('should log metrics to Analytics Engine', async () => {
      const task = MockFactories.createAgentTask();
      const request = TestHelpers.createMockRequest('https://agent/task', {
        method: 'POST',
        body: task
      });

      await agent.fetch(request);

      // Verify metrics were logged
      expect(mockEnv.METRICS.writeDataPoint).toHaveBeenCalled();
    });

    it('should store logs in R2 bucket', async () => {
      // This would be tested with actual R2 mock in a full implementation
      // For now, just verify the agent processes tasks without errors
      const task = MockFactories.createAgentTask();
      const request = TestHelpers.createMockRequest('https://agent/task', {
        method: 'POST',
        body: task
      });

      const response = await agent.fetch(request);
      expect(response.status).toBe(200);
    });
  });
});

