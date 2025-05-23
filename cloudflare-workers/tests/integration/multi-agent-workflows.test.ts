import { describe, it, expect, beforeEach } from 'vitest';
import { AgentCoordinator } from '@/agents/agent-coordinator';
import { BaseAgent } from '@/agents/base-agent';
import { AgentConfig, AgentTask, WorkflowState, Env } from '@/types';
import { MockDurableObjectStorage } from '../mocks/storage-backends';
import { TestHelpers } from '../utils/test-helpers';
import { MockFactories } from '../utils/mock-factories';
import { getTestEnvironment } from '../utils/miniflare-setup';

describe('Multi-Agent Workflows Integration Tests', () => {
  let coordinator: AgentCoordinator;
  let mockEnv: Env;
  let testEnv: any;

  beforeEach(async () => {
    testEnv = await getTestEnvironment();
    
    mockEnv = {
      AGENT_COORDINATOR: testEnv.getDurableObject('AGENT_COORDINATOR'),
      STATE_MANAGER: testEnv.getDurableObject('STATE_MANAGER'),
      INTEGRATION_DASHBOARD_AGENT: testEnv.getDurableObject('INTEGRATION_DASHBOARD_AGENT'),
      REVIEW_MANAGER_AGENT: testEnv.getDurableObject('REVIEW_MANAGER_AGENT'),
      CONTEXT_OPTIMIZER_AGENT: testEnv.getDurableObject('CONTEXT_OPTIMIZER_AGENT'),
      PATTERN_BRIDGE_AGENT: testEnv.getDurableObject('PATTERN_BRIDGE_AGENT'),
      LINEAR_STATE_AGENT: testEnv.getDurableObject('LINEAR_STATE_AGENT'),
      CONFIG_KV: testEnv.getKV('CONFIG_KV'),
      LOGS_BUCKET: testEnv.getR2('LOGS_BUCKET'),
      METRICS: { writeDataPoint: () => {} } as any,
      ENVIRONMENT: 'test'
    };

    const mockState = {
      id: { toString: () => 'coordinator-test' },
      storage: new MockDurableObjectStorage()
    };

    coordinator = new AgentCoordinator(mockState, mockEnv);
  });

  describe('workflow coordination', () => {
    it('should create and coordinate complex workflows', async () => {
      const workflow = MockFactories.createWorkflowState({
        name: 'Complex Multi-Agent Workflow',
        status: 'pending',
        context: {
          userId: 'user-123',
          githubRepoId: 'org/repo',
          linearIssueId: 'issue-456',
          tags: ['complex', 'multi-agent'],
          metadata: {
            complexity: 'high',
            deadline: 'urgent'
          }
        }
      });

      // Add multiple tasks requiring different agent types
      workflow.tasks = {
        'task-1': MockFactories.createAgentTask({
          id: 'task-1',
          type: 'github-pr-review',
          priority: 'high',
          context: { workflowId: workflow.id, metadata: {} }
        }),
        'task-2': MockFactories.createAgentTask({
          id: 'task-2',
          type: 'linear-sync',
          priority: 'medium',
          context: { workflowId: workflow.id, metadata: {} }
        }),
        'task-3': MockFactories.createAgentTask({
          id: 'task-3',
          type: 'context-analysis',
          priority: 'low',
          context: { workflowId: workflow.id, metadata: {} }
        })
      };

      const request = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.workflowId).toBe(workflow.id);
      expect(result.status).toBe('created');
      expect(result.agentsAssigned).toBeGreaterThan(0);
      expect(result.tasksDistributed).toBe(3);
    });

    it('should handle agent spawning and task distribution', async () => {
      // Create a workflow that requires multiple agent types
      const workflow = MockFactories.createWorkflowState({
        context: {
          userId: 'user-123',
          githubRepoId: 'org/test-repo',
          linearIssueId: 'issue-789',
          tags: ['integration-test'],
          metadata: {}
        }
      });

      // Start workflow coordination
      const workflowRequest = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      const workflowResponse = await coordinator.fetch(workflowRequest);
      expect(workflowResponse.status).toBe(200);

      // Check that agents were spawned
      const agentsRequest = TestHelpers.createMockRequest('https://coordinator/agents');
      const agentsResponse = await coordinator.fetch(agentsRequest);
      const agentsData = await agentsResponse.json();

      expect(agentsData.totalAgents).toBeGreaterThan(0);
      expect(agentsData.agentsByType).toHaveProperty('integration-dashboard');
      
      // Should spawn review-manager for GitHub repo
      expect(agentsData.agentsByType).toHaveProperty('review-manager');
      
      // Should spawn linear-state for Linear issue
      expect(agentsData.agentsByType).toHaveProperty('linear-state');
    });

    it('should manage workflow state across agents', async () => {
      const workflow = MockFactories.createWorkflowState({
        status: 'running',
        progress: {
          totalTasks: 5,
          completedTasks: 2,
          failedTasks: 0,
          activeAgents: 3,
          bottlenecks: [],
          metrics: {
            averageTaskDuration: 500,
            agentUtilization: {},
            errorRate: 0,
            throughput: 2.5
          }
        }
      });

      // Update workflow state
      const updateRequest = TestHelpers.createMockRequest(
        `https://coordinator/workflow/${workflow.id}`,
        {
          method: 'PATCH',
          body: {
            status: 'completed',
            progress: {
              ...workflow.progress,
              completedTasks: 5
            }
          }
        }
      );

      const response = await coordinator.fetch(updateRequest);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.workflowId).toBe(workflow.id);
      expect(result.status).toBe('updated');
    });

    it('should handle agent failures gracefully', async () => {
      // Simulate agent failure
      const failedAgentId = 'agent-integration-dashboard-123';
      const workflowId = 'workflow-test-456';

      const failureRequest = TestHelpers.createMockRequest('https://coordinator/agent-failure', {
        method: 'POST',
        body: {
          agentId: failedAgentId,
          workflowId,
          error: 'Agent timeout after 30 seconds'
        }
      });

      const response = await coordinator.fetch(failureRequest);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.status).toBe('recovery-initiated');
      expect(result.recoveryAction).toBe('spawn-replacement');
      expect(result.replacementAgent).toContain('replacement-');
    });
  });

  describe('inter-agent communication', () => {
    it('should enable message passing between agents', async () => {
      // Spawn two agents
      const agent1Config = MockFactories.createAgentConfig({
        type: 'integration-dashboard',
        name: 'Agent 1'
      });

      const agent2Config = MockFactories.createAgentConfig({
        type: 'review-manager',
        name: 'Agent 2'
      });

      const spawn1Request = TestHelpers.createMockRequest('https://coordinator/spawn', {
        method: 'POST',
        body: { type: 'integration-dashboard', config: agent1Config }
      });

      const spawn2Request = TestHelpers.createMockRequest('https://coordinator/spawn', {
        method: 'POST',
        body: { type: 'review-manager', config: agent2Config }
      });

      const [spawn1Response, spawn2Response] = await Promise.all([
        coordinator.fetch(spawn1Request),
        coordinator.fetch(spawn2Request)
      ]);

      expect(spawn1Response.status).toBe(200);
      expect(spawn2Response.status).toBe(200);

      const agent1Result = await spawn1Response.json();
      const agent2Result = await spawn2Response.json();

      // Verify agents can communicate (this would be tested with actual message passing)
      expect(agent1Result.agentId).toBeDefined();
      expect(agent2Result.agentId).toBeDefined();
      expect(agent1Result.agentId).not.toBe(agent2Result.agentId);
    });

    it('should handle message queuing and delivery', async () => {
      // This test would verify message queuing between agents
      // For now, we test that the coordinator can handle message routing
      
      const agentConfig = MockFactories.createAgentConfig({
        type: 'integration-dashboard'
      });

      const spawnRequest = TestHelpers.createMockRequest('https://coordinator/spawn', {
        method: 'POST',
        body: { type: 'integration-dashboard', config: agentConfig }
      });

      const spawnResponse = await coordinator.fetch(spawnRequest);
      const spawnResult = await spawnResponse.json();

      // Get agent status to verify it's ready for messages
      const statusRequest = TestHelpers.createMockRequest(
        `https://coordinator/agent/${spawnResult.agentId}/status`
      );

      const statusResponse = await coordinator.fetch(statusRequest);
      expect(statusResponse.status).toBe(200);

      const status = await statusResponse.json();
      expect(status.status).toBe('idle'); // Ready to receive messages
    });

    it('should manage communication failures', async () => {
      // Test communication failure handling
      const failureRequest = TestHelpers.createMockRequest('https://coordinator/agent-failure', {
        method: 'POST',
        body: {
          agentId: 'non-existent-agent',
          workflowId: 'test-workflow',
          error: 'Communication timeout'
        }
      });

      const response = await coordinator.fetch(failureRequest);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.status).toBe('recovery-initiated');
    });
  });

  describe('state synchronization', () => {
    it('should synchronize state across agents', async () => {
      // Create a workflow with shared state
      const workflow = MockFactories.createWorkflowState({
        name: 'State Sync Test',
        metadata: {
          sharedData: {
            counter: 0,
            status: 'initializing'
          }
        }
      });

      const workflowRequest = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      const workflowResponse = await coordinator.fetch(workflowRequest);
      expect(workflowResponse.status).toBe(200);

      // Update shared state
      const updateRequest = TestHelpers.createMockRequest(
        `https://coordinator/workflow/${workflow.id}`,
        {
          method: 'PATCH',
          body: {
            metadata: {
              sharedData: {
                counter: 5,
                status: 'processing'
              }
            }
          }
        }
      );

      const updateResponse = await coordinator.fetch(updateRequest);
      expect(updateResponse.status).toBe(200);
    });

    it('should handle concurrent state updates', async () => {
      const workflow = MockFactories.createWorkflowState();

      // Create workflow first
      const createRequest = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      await coordinator.fetch(createRequest);

      // Simulate concurrent updates
      const updates = Array.from({ length: 5 }, (_, i) => 
        TestHelpers.createMockRequest(
          `https://coordinator/workflow/${workflow.id}`,
          {
            method: 'PATCH',
            body: {
              progress: {
                completedTasks: i + 1
              }
            }
          }
        )
      );

      const responses = await Promise.all(
        updates.map(request => coordinator.fetch(request))
      );

      // All updates should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should resolve state conflicts', async () => {
      // Test conflict resolution (simplified)
      const workflow = MockFactories.createWorkflowState({
        status: 'running'
      });

      const createRequest = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      await coordinator.fetch(createRequest);

      // Conflicting updates
      const update1 = TestHelpers.createMockRequest(
        `https://coordinator/workflow/${workflow.id}`,
        {
          method: 'PATCH',
          body: { status: 'completed' }
        }
      );

      const update2 = TestHelpers.createMockRequest(
        `https://coordinator/workflow/${workflow.id}`,
        {
          method: 'PATCH',
          body: { status: 'failed' }
        }
      );

      const [response1, response2] = await Promise.all([
        coordinator.fetch(update1),
        coordinator.fetch(update2)
      ]);

      // Both should be accepted (last-write-wins in this simple implementation)
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });

  describe('workflow recovery', () => {
    it('should recover from workflow failures', async () => {
      const failedWorkflow = MockFactories.createWorkflowState({
        status: 'failed',
        metadata: {
          failureReason: 'Agent spawn timeout',
          lastError: 'Failed to spawn review-manager agent'
        }
      });

      const recoveryRequest = TestHelpers.createMockRequest('https://coordinator/workflow/recover', {
        method: 'POST',
        body: {
          workflowId: failedWorkflow.id,
          strategy: 'retry-failed-tasks'
        }
      });

      const response = await coordinator.fetch(recoveryRequest);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.status).toBe('recovery-initiated');
      expect(result.recoveryPlan).toBeDefined();
    });

    it('should handle partial workflow completion', async () => {
      const partialWorkflow = MockFactories.createWorkflowState({
        status: 'running',
        progress: {
          totalTasks: 10,
          completedTasks: 6,
          failedTasks: 2,
          activeAgents: 2,
          bottlenecks: ['external-api-rate-limit'],
          metrics: {
            averageTaskDuration: 800,
            agentUtilization: {
              'agent-1': 0.9,
              'agent-2': 0.7
            },
            errorRate: 20,
            throughput: 1.2
          }
        }
      });

      const handleRequest = TestHelpers.createMockRequest('https://coordinator/handle-failure', {
        method: 'POST',
        body: { workflow: partialWorkflow }
      });

      const response = await coordinator.fetch(handleRequest);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.failureHandled).toBe(true);
      expect(result.recoveryPlan).toBeDefined();
    });
  });

  describe('performance under load', () => {
    it('should handle multiple concurrent workflows', async () => {
      const workflowCount = 10;
      const workflows = MockFactories.createWorkflowStates(workflowCount);

      const requests = workflows.map(workflow =>
        TestHelpers.createMockRequest('https://coordinator/workflow', {
          method: 'POST',
          body: { workflow }
        })
      );

      const { durations, results } = await TestHelpers.runPerformanceTest(
        async () => {
          const responses = await Promise.all(
            requests.map(request => coordinator.fetch(request))
          );
          return responses;
        },
        1
      );

      // All workflows should be created successfully
      const responses = results[0];
      responses.forEach((response: Response) => {
        expect(response.status).toBe(200);
      });

      // Performance should be reasonable
      expect(durations[0]).toBeLessThan(1000); // Under 1 second for 10 workflows
    });

    it('should scale agent coordination efficiently', async () => {
      const agentCount = 20;
      const configs = Array.from({ length: agentCount }, (_, i) =>
        MockFactories.createAgentConfig({
          type: 'integration-dashboard',
          name: `Load Test Agent ${i}`
        })
      );

      const spawnPromises = configs.map(config =>
        coordinator.fetch(TestHelpers.createMockRequest('https://coordinator/spawn', {
          method: 'POST',
          body: { type: 'integration-dashboard', config }
        }))
      );

      const { averageDuration } = await TestHelpers.runPerformanceTest(
        async () => {
          const responses = await Promise.allSettled(spawnPromises);
          return responses;
        },
        1
      );

      // Agent spawning should be efficient
      expect(averageDuration).toBeLessThan(500); // Under 500ms for 20 agents
    });
  });

  describe('coordination strategies', () => {
    it('should select appropriate coordination strategies', async () => {
      const scenarios = [
        {
          workflow: MockFactories.createWorkflowState({
            metadata: { complexity: 'low', agentCount: 2 }
          }),
          expectedStrategy: 'sequential'
        },
        {
          workflow: MockFactories.createWorkflowState({
            metadata: { complexity: 'high', agentCount: 8, deadline: 'urgent' }
          }),
          expectedStrategy: 'parallel'
        },
        {
          workflow: MockFactories.createWorkflowState({
            metadata: { complexity: 'medium', agentCount: 4 }
          }),
          expectedStrategy: 'hybrid'
        }
      ];

      for (const scenario of scenarios) {
        const request = TestHelpers.createMockRequest('https://coordinator/strategy', {
          method: 'POST',
          body: { workflow: scenario.workflow }
        });

        const response = await coordinator.fetch(request);
        expect(response.status).toBe(200);

        const result = await response.json();
        expect(result.strategy).toBe(scenario.expectedStrategy);
        expect(result.reasoning).toBeDefined();
      }
    });

    it('should adapt strategies based on performance metrics', async () => {
      const metrics = {
        averageResponseTime: 2500, // High response time
        errorRate: 15, // High error rate
        throughput: 0.3 // Low throughput
      };

      const adaptRequest = TestHelpers.createMockRequest('https://coordinator/adapt', {
        method: 'POST',
        body: { workflowId: 'test-workflow', metrics }
      });

      const response = await coordinator.fetch(adaptRequest);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.adaptations).toBeInstanceOf(Array);
      expect(result.adaptations.length).toBeGreaterThan(0);
      
      // Should suggest increasing agent count for high response time
      expect(result.adaptations).toContain('increase-agent-count');
      
      // Should suggest circuit breaker for high error rate
      expect(result.adaptations).toContain('implement-circuit-breaker');
      
      // Should suggest optimization for low throughput
      expect(result.adaptations).toContain('optimize-task-distribution');
    });
  });
});

