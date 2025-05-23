import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentCoordinator } from '@/agents/agent-coordinator';
import { AgentType, WorkflowState, AgentConfig, Env } from '@/types';
import { MockDurableObjectStorage, MockDurableObjectNamespace } from '../../mocks/storage-backends';
import { MockDurableObjectStub } from '../../mocks/durable-objects';
import { TestHelpers } from '../../utils/test-helpers';
import { MockFactories } from '../../utils/mock-factories';

describe('AgentCoordinator', () => {
  let coordinator: AgentCoordinator;
  let mockState: any;
  let mockEnv: Env;
  let mockStorage: MockDurableObjectStorage;
  let mockNamespaces: Record<string, MockDurableObjectNamespace>;

  beforeEach(() => {
    mockStorage = new MockDurableObjectStorage();
    
    // Create mock namespaces for each agent type
    mockNamespaces = {
      INTEGRATION_DASHBOARD_AGENT: new MockDurableObjectNamespace(),
      REVIEW_MANAGER_AGENT: new MockDurableObjectNamespace(),
      CONTEXT_OPTIMIZER_AGENT: new MockDurableObjectNamespace(),
      PATTERN_BRIDGE_AGENT: new MockDurableObjectNamespace(),
      LINEAR_STATE_AGENT: new MockDurableObjectNamespace()
    };
    
    mockState = {
      id: { toString: () => 'coordinator-id' },
      storage: mockStorage
    };

    mockEnv = {
      AGENT_COORDINATOR: {} as any,
      STATE_MANAGER: {} as any,
      INTEGRATION_DASHBOARD_AGENT: mockNamespaces.INTEGRATION_DASHBOARD_AGENT as any,
      REVIEW_MANAGER_AGENT: mockNamespaces.REVIEW_MANAGER_AGENT as any,
      CONTEXT_OPTIMIZER_AGENT: mockNamespaces.CONTEXT_OPTIMIZER_AGENT as any,
      PATTERN_BRIDGE_AGENT: mockNamespaces.PATTERN_BRIDGE_AGENT as any,
      LINEAR_STATE_AGENT: mockNamespaces.LINEAR_STATE_AGENT as any,
      CONFIG_KV: {} as any,
      LOGS_BUCKET: {} as any,
      METRICS: {
        writeDataPoint: vi.fn()
      } as any,
      ENVIRONMENT: 'test'
    };

    coordinator = new AgentCoordinator(mockState, mockEnv);
  });

  describe('agent spawning', () => {
    it('should spawn a new agent instance', async () => {
      const config = MockFactories.createAgentConfig({
        type: 'integration-dashboard',
        name: 'Test Dashboard Agent'
      });

      const request = TestHelpers.createMockRequest('https://coordinator/spawn', {
        method: 'POST',
        body: { type: 'integration-dashboard', config }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('agentId');
      expect(result).toHaveProperty('status', 'spawned');
      expect(result.agentType).toBe('integration-dashboard');
    });

    it('should track spawned agents', async () => {
      const config = MockFactories.createAgentConfig({
        type: 'review-manager'
      });

      // Spawn an agent
      const spawnRequest = TestHelpers.createMockRequest('https://coordinator/spawn', {
        method: 'POST',
        body: { type: 'review-manager', config }
      });
      
      const spawnResponse = await coordinator.fetch(spawnRequest);
      const spawnResult = await spawnResponse.json();

      // Check agents list
      const listRequest = TestHelpers.createMockRequest('https://coordinator/agents');
      const listResponse = await coordinator.fetch(listRequest);
      const agents = await listResponse.json();

      expect(agents.agents).toHaveLength(1);
      expect(agents.agents[0].id).toBe(spawnResult.agentId);
      expect(agents.agents[0].type).toBe('review-manager');
    });

    it('should handle invalid agent types', async () => {
      const request = TestHelpers.createMockRequest('https://coordinator/spawn', {
        method: 'POST',
        body: { type: 'invalid-agent-type', config: {} }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.error).toContain('Invalid agent type');
    });

    it('should enforce maximum concurrent agents', async () => {
      // Set a low limit for testing
      const maxAgents = 3;
      
      // Spawn agents up to the limit
      for (let i = 0; i < maxAgents; i++) {
        const config = MockFactories.createAgentConfig({
          type: 'integration-dashboard',
          name: `Agent ${i}`
        });

        const request = TestHelpers.createMockRequest('https://coordinator/spawn', {
          method: 'POST',
          body: { type: 'integration-dashboard', config }
        });

        const response = await coordinator.fetch(request);
        expect(response.status).toBe(200);
      }

      // Try to spawn one more agent (should fail)
      const config = MockFactories.createAgentConfig({
        type: 'integration-dashboard',
        name: 'Excess Agent'
      });

      const request = TestHelpers.createMockRequest('https://coordinator/spawn', {
        method: 'POST',
        body: { type: 'integration-dashboard', config }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(429); // Too Many Requests
    });
  });

  describe('workflow coordination', () => {
    it('should create and coordinate a workflow', async () => {
      const workflow = MockFactories.createWorkflowState({
        name: 'Test Workflow',
        status: 'pending'
      });

      const request = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('workflowId');
      expect(result).toHaveProperty('status', 'created');
      expect(result.agentsAssigned).toBeGreaterThan(0);
    });

    it('should distribute tasks to appropriate agents', async () => {
      const workflow = MockFactories.createWorkflowState({
        name: 'Multi-Task Workflow'
      });

      const tasks = MockFactories.createAgentTasks(5, {
        context: { workflowId: workflow.id, metadata: {} }
      });

      workflow.tasks = tasks.reduce((acc, task) => {
        acc[task.id] = task;
        return acc;
      }, {} as any);

      const request = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.tasksDistributed).toBe(5);
      expect(result.agentsAssigned).toBeGreaterThan(0);
    });

    it('should handle workflow state updates', async () => {
      const workflowId = 'test-workflow-123';
      const update = {
        status: 'running',
        progress: {
          completedTasks: 3,
          totalTasks: 10
        }
      };

      const request = TestHelpers.createMockRequest(`https://coordinator/workflow/${workflowId}`, {
        method: 'PATCH',
        body: update
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.workflowId).toBe(workflowId);
      expect(result.status).toBe('updated');
    });

    it('should handle workflow failures gracefully', async () => {
      const workflow = MockFactories.createWorkflowState({
        status: 'failed'
      });

      const request = TestHelpers.createMockRequest('https://coordinator/workflow/recover', {
        method: 'POST',
        body: { workflowId: workflow.id, strategy: 'retry-failed-tasks' }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('recoveryPlan');
      expect(result.status).toBe('recovery-initiated');
    });
  });

  describe('agent management', () => {
    it('should list all active agents', async () => {
      // Spawn a few agents first
      const agentTypes: AgentType[] = ['integration-dashboard', 'review-manager'];
      
      for (const type of agentTypes) {
        const config = MockFactories.createAgentConfig({ type });
        const request = TestHelpers.createMockRequest('https://coordinator/spawn', {
          method: 'POST',
          body: { type, config }
        });
        await coordinator.fetch(request);
      }

      // List agents
      const listRequest = TestHelpers.createMockRequest('https://coordinator/agents');
      const response = await coordinator.fetch(listRequest);
      
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.agents).toHaveLength(2);
      expect(result.totalAgents).toBe(2);
      expect(result.agentsByType).toHaveProperty('integration-dashboard');
      expect(result.agentsByType).toHaveProperty('review-manager');
    });

    it('should get agent status', async () => {
      // Spawn an agent
      const config = MockFactories.createAgentConfig({
        type: 'context-optimizer'
      });
      
      const spawnRequest = TestHelpers.createMockRequest('https://coordinator/spawn', {
        method: 'POST',
        body: { type: 'context-optimizer', config }
      });
      
      const spawnResponse = await coordinator.fetch(spawnRequest);
      const spawnResult = await spawnResponse.json();

      // Get agent status
      const statusRequest = TestHelpers.createMockRequest(
        `https://coordinator/agent/${spawnResult.agentId}/status`
      );
      
      const response = await coordinator.fetch(statusRequest);
      expect(response.status).toBe(200);

      const status = await response.json();
      expect(status).toHaveProperty('id', spawnResult.agentId);
      expect(status).toHaveProperty('type', 'context-optimizer');
      expect(status).toHaveProperty('status');
    });

    it('should terminate agents', async () => {
      // Spawn an agent
      const config = MockFactories.createAgentConfig({
        type: 'pattern-bridge'
      });
      
      const spawnRequest = TestHelpers.createMockRequest('https://coordinator/spawn', {
        method: 'POST',
        body: { type: 'pattern-bridge', config }
      });
      
      const spawnResponse = await coordinator.fetch(spawnRequest);
      const spawnResult = await spawnResponse.json();

      // Terminate the agent
      const terminateRequest = TestHelpers.createMockRequest(
        `https://coordinator/agent/${spawnResult.agentId}/terminate`,
        { method: 'POST' }
      );
      
      const response = await coordinator.fetch(terminateRequest);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.status).toBe('terminated');
      expect(result.agentId).toBe(spawnResult.agentId);
    });
  });

  describe('coordination strategies', () => {
    it('should select appropriate coordination strategy', async () => {
      const workflow = MockFactories.createWorkflowState({
        name: 'Strategy Test Workflow',
        metadata: {
          complexity: 'high',
          agentCount: 5,
          deadline: 'urgent'
        }
      });

      const request = TestHelpers.createMockRequest('https://coordinator/strategy', {
        method: 'POST',
        body: { workflow }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('strategy');
      expect(result).toHaveProperty('reasoning');
      expect(result.strategy).toMatch(/parallel|sequential|hybrid/);
    });

    it('should adapt coordination strategy based on performance', async () => {
      const workflowId = 'adaptive-workflow-123';
      const metrics = {
        averageResponseTime: 2000, // High response time
        errorRate: 15, // High error rate
        throughput: 0.5 // Low throughput
      };

      const request = TestHelpers.createMockRequest('https://coordinator/adapt', {
        method: 'POST',
        body: { workflowId, metrics }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('adaptations');
      expect(result.adaptations).toBeInstanceOf(Array);
      expect(result.adaptations.length).toBeGreaterThan(0);
    });
  });

  describe('performance monitoring', () => {
    it('should track coordination metrics', async () => {
      const request = TestHelpers.createMockRequest('https://coordinator/metrics');
      const response = await coordinator.fetch(request);
      
      expect(response.status).toBe(200);
      
      const metrics = await response.json();
      expect(metrics).toHaveProperty('activeWorkflows');
      expect(metrics).toHaveProperty('activeAgents');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(metrics).toHaveProperty('throughput');
      expect(metrics).toHaveProperty('errorRate');
    });

    it('should detect and report bottlenecks', async () => {
      const request = TestHelpers.createMockRequest('https://coordinator/bottlenecks');
      const response = await coordinator.fetch(request);
      
      expect(response.status).toBe(200);
      
      const bottlenecks = await response.json();
      expect(bottlenecks).toHaveProperty('detected');
      expect(bottlenecks).toHaveProperty('recommendations');
    });
  });

  describe('error handling and recovery', () => {
    it('should handle agent failures', async () => {
      const failedAgentId = 'failed-agent-123';
      const workflowId = 'affected-workflow-456';

      const request = TestHelpers.createMockRequest('https://coordinator/agent-failure', {
        method: 'POST',
        body: { agentId: failedAgentId, workflowId, error: 'Agent timeout' }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('recoveryAction');
      expect(result).toHaveProperty('replacementAgent');
      expect(result.status).toBe('recovery-initiated');
    });

    it('should implement circuit breaker pattern', async () => {
      // Simulate multiple failures
      const failures = Array.from({ length: 5 }, (_, i) => ({
        agentId: `agent-${i}`,
        error: 'Service unavailable'
      }));

      for (const failure of failures) {
        const request = TestHelpers.createMockRequest('https://coordinator/agent-failure', {
          method: 'POST',
          body: failure
        });
        await coordinator.fetch(request);
      }

      // Check if circuit breaker is triggered
      const statusRequest = TestHelpers.createMockRequest('https://coordinator/circuit-breaker');
      const response = await statusRequest;
      
      // Circuit breaker should be open after multiple failures
      expect(response.status).toBe(200);
    });

    it('should handle coordination failures gracefully', async () => {
      const workflow = MockFactories.createWorkflowState({
        status: 'failed',
        metadata: { failureReason: 'Agent spawn timeout' }
      });

      const request = TestHelpers.createMockRequest('https://coordinator/handle-failure', {
        method: 'POST',
        body: { workflow }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('failureHandled', true);
      expect(result).toHaveProperty('recoveryPlan');
    });
  });

  describe('scalability', () => {
    it('should handle high-volume agent coordination', async () => {
      const agentCount = 20;
      const spawnPromises: Promise<Response>[] = [];

      // Spawn many agents concurrently
      for (let i = 0; i < agentCount; i++) {
        const config = MockFactories.createAgentConfig({
          type: 'integration-dashboard',
          name: `Load Test Agent ${i}`
        });

        const request = TestHelpers.createMockRequest('https://coordinator/spawn', {
          method: 'POST',
          body: { type: 'integration-dashboard', config }
        });

        spawnPromises.push(coordinator.fetch(request));
      }

      const responses = await Promise.allSettled(spawnPromises);
      
      // Most requests should succeed (allowing for some rate limiting)
      const successful = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;
      
      expect(successful).toBeGreaterThan(agentCount * 0.8); // At least 80% success
    });

    it('should maintain performance under load', async () => {
      const { averageDuration } = await TestHelpers.runPerformanceTest(
        async () => {
          const request = TestHelpers.createMockRequest('https://coordinator/metrics');
          return coordinator.fetch(request);
        },
        10
      );

      // Coordination operations should be fast
      expect(averageDuration).toBeLessThan(100); // Under 100ms average
    });
  });
});

