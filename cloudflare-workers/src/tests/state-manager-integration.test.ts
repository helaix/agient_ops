import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '../agents/state-manager';
import { AgentCoordinator } from '../agents/agent-coordinator';
import { WorkflowState, AgentTask, Env } from '../types';

// Mock Durable Object State
class MockDurableObjectState {
  private storage = new Map<string, any>();

  get(key: string) {
    return Promise.resolve(this.storage.get(key));
  }

  put(key: string, value: any) {
    this.storage.set(key, value);
    return Promise.resolve();
  }

  delete(key: string) {
    this.storage.delete(key);
    return Promise.resolve();
  }

  list() {
    return Promise.resolve(new Map(this.storage));
  }
}

// Mock Environment with inter-agent communication
const createMockEnv = (stateManager: StateManager, coordinator: AgentCoordinator): Env => ({
  AGENT_COORDINATOR: {
    get: () => ({
      fetch: (url: string, init?: RequestInit) => coordinator.fetch(new Request(url, init))
    })
  } as any,
  STATE_MANAGER: {
    get: () => ({
      fetch: (url: string, init?: RequestInit) => stateManager.fetch(new Request(url, init))
    })
  } as any,
  INTEGRATION_DASHBOARD_AGENT: {} as any,
  REVIEW_MANAGER_AGENT: {} as any,
  CONTEXT_OPTIMIZER_AGENT: {} as any,
  PATTERN_BRIDGE_AGENT: {} as any,
  LINEAR_STATE_AGENT: {} as any,
  CONFIG_KV: {} as any,
  LOGS_BUCKET: {
    put: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue(null)
  } as any,
  METRICS: {
    writeDataPoint: vi.fn()
  } as any,
  ENVIRONMENT: 'test'
});

const createTestWorkflowState = (id: string = 'integration-test-workflow'): WorkflowState => ({
  id,
  name: 'Integration Test Workflow',
  description: 'A workflow for integration testing',
  status: 'running',
  priority: 'high',
  createdAt: Date.now(),
  startedAt: Date.now(),
  progress: {
    totalTasks: 10,
    completedTasks: 3,
    failedTasks: 1,
    activeAgents: 3,
    bottlenecks: [],
    metrics: {
      averageTaskDuration: 2000,
      agentUtilization: {
        'agent-1': 0.8,
        'agent-2': 0.6,
        'agent-3': 0.9
      },
      errorRate: 0.1,
      throughput: 2.5
    }
  },
  context: {
    userId: 'integration-test-user',
    linearIssueId: 'TEST-123',
    githubRepoId: 'test/repo',
    tags: ['integration', 'test'],
    metadata: {
      priority: 'high',
      department: 'engineering'
    }
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      type: 'data-processing',
      priority: 'high',
      payload: { 
        inputData: 'test-data',
        processingType: 'transform'
      },
      context: {
        workflowId: id,
        parentTaskId: undefined,
        metadata: { stage: 'preprocessing' }
      },
      createdAt: Date.now() - 10000,
      startedAt: Date.now() - 8000,
      completedAt: Date.now() - 2000,
      retryCount: 0,
      maxRetries: 3
    },
    'task-2': {
      id: 'task-2',
      type: 'validation',
      priority: 'medium',
      payload: { 
        validationRules: ['required', 'format'],
        data: 'processed-data'
      },
      context: {
        workflowId: id,
        parentTaskId: 'task-1',
        metadata: { stage: 'validation' }
      },
      createdAt: Date.now() - 8000,
      startedAt: Date.now() - 6000,
      retryCount: 1,
      maxRetries: 3
    },
    'task-3': {
      id: 'task-3',
      type: 'notification',
      priority: 'low',
      payload: { 
        recipients: ['user@example.com'],
        message: 'Processing complete'
      },
      context: {
        workflowId: id,
        metadata: { stage: 'notification' }
      },
      createdAt: Date.now() - 5000,
      retryCount: 0,
      maxRetries: 3
    }
  },
  agents: {
    'data-processor': 'agent-instance-1',
    'validator': 'agent-instance-2',
    'notifier': 'agent-instance-3'
  },
  dependencies: [
    {
      id: 'dep-1',
      type: 'task',
      dependsOn: 'task-1',
      condition: 'completed'
    },
    {
      id: 'dep-2',
      type: 'task',
      dependsOn: 'task-2',
      condition: 'completed'
    }
  ],
  metadata: {
    source: 'integration-test',
    version: '1.0.0',
    environment: 'test'
  }
});

describe('StateManager Integration Tests', () => {
  let stateManager: StateManager;
  let coordinator: AgentCoordinator;
  let mockStateManagerState: MockDurableObjectState;
  let mockCoordinatorState: MockDurableObjectState;

  beforeEach(async () => {
    mockStateManagerState = new MockDurableObjectState();
    mockCoordinatorState = new MockDurableObjectState();
    
    // Create instances with temporary env
    stateManager = new StateManager(mockStateManagerState as any, {} as Env);
    coordinator = new AgentCoordinator(mockCoordinatorState as any, {} as Env);
    
    // Update with proper env that includes cross-references
    const env = createMockEnv(stateManager, coordinator);
    (stateManager as any).env = env;
    (coordinator as any).env = env;
  });

  describe('Multi-Agent State Synchronization', () => {
    it('should synchronize state changes across multiple agents', async () => {
      const workflowState = createTestWorkflowState();
      
      // Agent 1 subscribes to state changes
      await stateManager.subscribeToStateChanges(workflowState.id, 'agent-1');
      
      // Agent 2 subscribes to state changes
      await stateManager.subscribeToStateChanges(workflowState.id, 'agent-2');
      
      // Coordinator creates initial workflow state
      const initialVersion = await stateManager.persistWorkflowState(
        workflowState.id,
        workflowState,
        'coordinator',
        'Initial workflow creation'
      );
      
      expect(initialVersion.version).toBe(1);
      expect(initialVersion.author).toBe('coordinator');
      
      // Agent 1 updates task status
      const updatedState1 = { 
        ...workflowState,
        tasks: {
          ...workflowState.tasks,
          'task-2': {
            ...workflowState.tasks['task-2'],
            completedAt: Date.now()
          }
        },
        progress: {
          ...workflowState.progress,
          completedTasks: 4
        }
      };
      
      const version2 = await stateManager.persistWorkflowState(
        workflowState.id,
        updatedState1,
        'agent-1',
        'Task-2 completed'
      );
      
      expect(version2.version).toBe(2);
      expect(version2.parentVersion).toBe(initialVersion.id);
      
      // Agent 2 adds a new task
      const updatedState2 = {
        ...updatedState1,
        tasks: {
          ...updatedState1.tasks,
          'task-4': {
            id: 'task-4',
            type: 'cleanup',
            priority: 'low' as const,
            payload: { cleanupType: 'temporary-files' },
            context: {
              workflowId: workflowState.id,
              metadata: { stage: 'cleanup' }
            },
            createdAt: Date.now(),
            retryCount: 0,
            maxRetries: 3
          }
        },
        progress: {
          ...updatedState1.progress,
          totalTasks: 11
        }
      };
      
      const version3 = await stateManager.persistWorkflowState(
        workflowState.id,
        updatedState2,
        'agent-2',
        'Added cleanup task'
      );
      
      expect(version3.version).toBe(3);
      
      // Verify state history
      const history = await stateManager.getWorkflowHistory(workflowState.id);
      expect(history).toHaveLength(3);
      expect(history[0].changeDescription).toBe('Added cleanup task');
      expect(history[1].changeDescription).toBe('Task-2 completed');
      expect(history[2].changeDescription).toBe('Initial workflow creation');
      
      // Verify current state
      const currentState = await stateManager.getWorkflowState(workflowState.id);
      expect(currentState).toBeDefined();
      expect(currentState!.progress.totalTasks).toBe(11);
      expect(currentState!.progress.completedTasks).toBe(4);
      expect(currentState!.tasks['task-4']).toBeDefined();
    });

    it('should handle concurrent updates from multiple agents', async () => {
      const workflowState = createTestWorkflowState();
      
      // Initialize state
      await stateManager.persistWorkflowState(
        workflowState.id,
        workflowState,
        'coordinator'
      );
      
      // Simulate concurrent updates from different agents
      const agent1Update = {
        ...workflowState,
        metadata: { ...workflowState.metadata, updatedBy: 'agent-1', timestamp: Date.now() }
      };
      
      const agent2Update = {
        ...workflowState,
        metadata: { ...workflowState.metadata, updatedBy: 'agent-2', timestamp: Date.now() + 1 }
      };
      
      const agent3Update = {
        ...workflowState,
        metadata: { ...workflowState.metadata, updatedBy: 'agent-3', timestamp: Date.now() + 2 }
      };
      
      // Execute concurrent updates
      const updatePromises = [
        stateManager.persistWorkflowState(workflowState.id, agent1Update, 'agent-1', 'Agent 1 update'),
        stateManager.persistWorkflowState(workflowState.id, agent2Update, 'agent-2', 'Agent 2 update'),
        stateManager.persistWorkflowState(workflowState.id, agent3Update, 'agent-3', 'Agent 3 update')
      ];
      
      const results = await Promise.all(updatePromises);
      
      // All updates should succeed
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.workflowId).toBe(workflowState.id);
        expect(result.version).toBeGreaterThan(1);
      });
      
      // Verify final state
      const finalState = await stateManager.getWorkflowState(workflowState.id);
      expect(finalState).toBeDefined();
      
      // Verify history contains all updates
      const history = await stateManager.getWorkflowHistory(workflowState.id);
      expect(history.length).toBeGreaterThanOrEqual(4); // Initial + 3 updates
    });
  });

  describe('State Recovery and Backup', () => {
    it('should create and restore from snapshots', async () => {
      const workflowState = createTestWorkflowState();
      
      // Create initial state
      await stateManager.persistWorkflowState(
        workflowState.id,
        workflowState,
        'coordinator'
      );
      
      // Create snapshot
      const snapshot = await stateManager.createStateSnapshot(
        workflowState.id,
        'Pre-modification snapshot'
      );
      
      expect(snapshot.workflowId).toBe(workflowState.id);
      expect(snapshot.description).toBe('Pre-modification snapshot');
      expect(snapshot.size).toBeGreaterThan(0);
      
      // Modify state significantly
      const modifiedState = {
        ...workflowState,
        status: 'failed' as const,
        progress: {
          ...workflowState.progress,
          failedTasks: 5,
          completedTasks: 0
        },
        metadata: {
          ...workflowState.metadata,
          error: 'Critical failure occurred'
        }
      };
      
      await stateManager.persistWorkflowState(
        workflowState.id,
        modifiedState,
        'error-handler',
        'Marked as failed due to critical error'
      );
      
      // Verify modified state
      const failedState = await stateManager.getWorkflowState(workflowState.id);
      expect(failedState!.status).toBe('failed');
      expect(failedState!.progress.failedTasks).toBe(5);
      
      // Restore from snapshot
      await stateManager.restoreFromSnapshot(workflowState.id, snapshot.id);
      
      // Verify restored state
      const restoredState = await stateManager.getWorkflowState(workflowState.id);
      expect(restoredState!.status).toBe('running');
      expect(restoredState!.progress.failedTasks).toBe(1); // Original value
      expect(restoredState!.progress.completedTasks).toBe(3); // Original value
    });

    it('should handle snapshot integrity validation', async () => {
      const workflowState = createTestWorkflowState();
      
      await stateManager.persistWorkflowState(
        workflowState.id,
        workflowState,
        'coordinator'
      );
      
      const snapshot = await stateManager.createStateSnapshot(
        workflowState.id,
        'Integrity test snapshot'
      );
      
      // Verify snapshot has valid checksum
      expect(snapshot.checksum).toBeDefined();
      expect(snapshot.checksum).toHaveLength(64); // SHA-256 hex string
      
      // Restoration should succeed with valid snapshot
      await expect(
        stateManager.restoreFromSnapshot(workflowState.id, snapshot.id)
      ).resolves.not.toThrow();
    });
  });

  describe('Performance Under Load', () => {
    it('should handle high-frequency state updates', async () => {
      const workflowState = createTestWorkflowState();
      const updateCount = 50;
      
      // Initialize state
      await stateManager.persistWorkflowState(
        workflowState.id,
        workflowState,
        'coordinator'
      );
      
      const startTime = Date.now();
      
      // Perform rapid updates
      const updatePromises = Array.from({ length: updateCount }, async (_, index) => {
        const updatedState = {
          ...workflowState,
          metadata: {
            ...workflowState.metadata,
            updateIndex: index,
            timestamp: Date.now()
          }
        };
        
        return stateManager.persistWorkflowState(
          workflowState.id,
          updatedState,
          `agent-${index % 5}`, // Rotate between 5 agents
          `Update ${index}`
        );
      });
      
      const results = await Promise.all(updatePromises);
      const endTime = Date.now();
      
      // Verify all updates succeeded
      expect(results).toHaveLength(updateCount);
      results.forEach((result, index) => {
        expect(result.workflowId).toBe(workflowState.id);
        expect(result.version).toBe(index + 2); // +1 for initial, +1 for 0-based index
      });
      
      // Verify performance (should complete within reasonable time)
      const totalTime = endTime - startTime;
      const averageTimePerUpdate = totalTime / updateCount;
      expect(averageTimePerUpdate).toBeLessThan(100); // Less than 100ms per update
      
      // Verify final state
      const finalState = await stateManager.getWorkflowState(workflowState.id);
      expect(finalState).toBeDefined();
      
      // Verify history
      const history = await stateManager.getWorkflowHistory(workflowState.id);
      expect(history).toHaveLength(updateCount + 1); // +1 for initial state
    });

    it('should handle large workflow states efficiently', async () => {
      // Create a large workflow state
      const largeWorkflowState = createTestWorkflowState();
      
      // Add many tasks
      for (let i = 0; i < 1000; i++) {
        largeWorkflowState.tasks[`task-${i}`] = {
          id: `task-${i}`,
          type: 'batch-processing',
          priority: 'medium',
          payload: {
            data: `Large data payload for task ${i}`.repeat(10),
            index: i
          },
          context: {
            workflowId: largeWorkflowState.id,
            metadata: {
              batch: Math.floor(i / 100),
              position: i % 100
            }
          },
          createdAt: Date.now() - (1000 - i) * 1000,
          retryCount: 0,
          maxRetries: 3
        };
      }
      
      // Add many agents
      for (let i = 0; i < 50; i++) {
        largeWorkflowState.agents[`processor-${i}`] = `agent-instance-${i}`;
      }
      
      largeWorkflowState.progress.totalTasks = 1000;
      largeWorkflowState.progress.completedTasks = 750;
      largeWorkflowState.progress.failedTasks = 50;
      
      const startTime = Date.now();
      
      // Persist large state
      const version = await stateManager.persistWorkflowState(
        largeWorkflowState.id,
        largeWorkflowState,
        'coordinator',
        'Large workflow state'
      );
      
      const persistTime = Date.now() - startTime;
      
      // Verify persistence performance
      expect(persistTime).toBeLessThan(1000); // Less than 1 second
      expect(version.workflowId).toBe(largeWorkflowState.id);
      
      // Test retrieval performance
      const retrievalStartTime = Date.now();
      const retrievedState = await stateManager.getWorkflowState(largeWorkflowState.id);
      const retrievalTime = Date.now() - retrievalStartTime;
      
      expect(retrievalTime).toBeLessThan(500); // Less than 500ms
      expect(retrievedState).toBeDefined();
      expect(Object.keys(retrievedState!.tasks)).toHaveLength(1000);
      expect(Object.keys(retrievedState!.agents)).toHaveLength(50);
    });
  });

  describe('Storage Backend Integration', () => {
    it('should integrate with R2 for snapshot storage', async () => {
      const workflowState = createTestWorkflowState();
      
      await stateManager.persistWorkflowState(
        workflowState.id,
        workflowState,
        'coordinator'
      );
      
      // Create snapshot (should store in R2 if enabled)
      const snapshot = await stateManager.createStateSnapshot(
        workflowState.id,
        'R2 integration test'
      );
      
      expect(snapshot).toBeDefined();
      
      // Verify R2 put was called
      expect(mockStateManagerState.storage.get('LOGS_BUCKET')).toBeDefined();
    });

    it('should handle storage failures gracefully', async () => {
      // Mock storage failure
      const failingState = {
        storage: {
          get: vi.fn().mockResolvedValue(null),
          put: vi.fn().mockRejectedValue(new Error('Storage unavailable')),
          delete: vi.fn().mockResolvedValue(undefined),
          list: vi.fn().mockResolvedValue(new Map())
        }
      };
      
      const failingStateManager = new StateManager(failingState as any, createMockEnv(stateManager, coordinator));
      
      const workflowState = createTestWorkflowState();
      
      // Should handle storage failure gracefully
      await expect(
        failingStateManager.persistWorkflowState(
          workflowState.id,
          workflowState,
          'coordinator'
        )
      ).rejects.toThrow();
    });
  });

  describe('Cross-Agent Message State Consistency', () => {
    it('should maintain state consistency during agent communication', async () => {
      const workflowState = createTestWorkflowState();
      
      // Initialize workflow
      await stateManager.persistWorkflowState(
        workflowState.id,
        workflowState,
        'coordinator'
      );
      
      // Subscribe multiple agents
      await stateManager.subscribeToStateChanges(workflowState.id, 'agent-1');
      await stateManager.subscribeToStateChanges(workflowState.id, 'agent-2');
      await stateManager.subscribeToStateChanges(workflowState.id, 'agent-3');
      
      // Simulate state changes from different agents
      const updates = [
        {
          state: { ...workflowState, metadata: { ...workflowState.metadata, step: 1 } },
          agent: 'agent-1',
          description: 'Step 1 complete'
        },
        {
          state: { ...workflowState, metadata: { ...workflowState.metadata, step: 2 } },
          agent: 'agent-2',
          description: 'Step 2 complete'
        },
        {
          state: { ...workflowState, metadata: { ...workflowState.metadata, step: 3 } },
          agent: 'agent-3',
          description: 'Step 3 complete'
        }
      ];
      
      // Apply updates sequentially to ensure consistency
      for (const update of updates) {
        await stateManager.persistWorkflowState(
          workflowState.id,
          update.state,
          update.agent,
          update.description
        );
        
        // Small delay to ensure ordering
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Verify final state consistency
      const finalState = await stateManager.getWorkflowState(workflowState.id);
      expect(finalState).toBeDefined();
      
      const history = await stateManager.getWorkflowHistory(workflowState.id);
      expect(history).toHaveLength(4); // Initial + 3 updates
      
      // Verify chronological order
      expect(history[0].changeDescription).toBe('Step 3 complete');
      expect(history[1].changeDescription).toBe('Step 2 complete');
      expect(history[2].changeDescription).toBe('Step 1 complete');
    });
  });
});

