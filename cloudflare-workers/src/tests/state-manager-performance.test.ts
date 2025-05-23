import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '../agents/state-manager';
import { WorkflowState, Env } from '../types';

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

const mockEnv: Env = {
  AGENT_COORDINATOR: {} as any,
  STATE_MANAGER: {} as any,
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
};

// Performance test utilities
const createLargeWorkflowState = (id: string, taskCount: number = 1000): WorkflowState => {
  const state: WorkflowState = {
    id,
    name: `Large Workflow ${id}`,
    description: `Performance test workflow with ${taskCount} tasks`,
    status: 'running',
    priority: 'medium',
    createdAt: Date.now(),
    startedAt: Date.now(),
    progress: {
      totalTasks: taskCount,
      completedTasks: Math.floor(taskCount * 0.6),
      failedTasks: Math.floor(taskCount * 0.1),
      activeAgents: Math.min(50, Math.floor(taskCount / 20)),
      bottlenecks: [],
      metrics: {
        averageTaskDuration: 2000,
        agentUtilization: {},
        errorRate: 0.1,
        throughput: 5.0
      }
    },
    context: {
      userId: 'perf-test-user',
      tags: ['performance', 'test'],
      metadata: {}
    },
    tasks: {},
    agents: {},
    dependencies: [],
    metadata: {
      testType: 'performance',
      taskCount
    }
  };

  // Generate tasks
  for (let i = 0; i < taskCount; i++) {
    const taskId = `task-${i}`;
    state.tasks[taskId] = {
      id: taskId,
      type: `task-type-${i % 10}`,
      priority: ['low', 'medium', 'high'][i % 3] as any,
      payload: {
        data: `Task data for ${taskId}`,
        index: i,
        batch: Math.floor(i / 100),
        metadata: {
          created: Date.now() - (taskCount - i) * 1000,
          category: `category-${i % 5}`
        }
      },
      context: {
        workflowId: id,
        parentTaskId: i > 0 ? `task-${i - 1}` : undefined,
        metadata: {
          position: i,
          dependencies: i > 0 ? [`task-${i - 1}`] : []
        }
      },
      createdAt: Date.now() - (taskCount - i) * 1000,
      startedAt: i < state.progress.completedTasks + state.progress.failedTasks ? Date.now() - (taskCount - i) * 800 : undefined,
      completedAt: i < state.progress.completedTasks ? Date.now() - (taskCount - i) * 200 : undefined,
      retryCount: i < state.progress.failedTasks ? Math.floor(Math.random() * 3) : 0,
      maxRetries: 3
    };
  }

  // Generate agents
  const agentCount = Math.min(50, Math.floor(taskCount / 20));
  for (let i = 0; i < agentCount; i++) {
    const agentKey = `agent-${i}`;
    state.agents[agentKey] = `agent-instance-${i}`;
    state.progress.metrics.agentUtilization[agentKey] = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
  }

  return state;
};

const measurePerformance = async <T>(operation: () => Promise<T>): Promise<{ result: T; duration: number; memoryUsed?: number }> => {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize;
  
  const result = await operation();
  
  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize;
  
  return {
    result,
    duration: endTime - startTime,
    memoryUsed: startMemory && endMemory ? endMemory - startMemory : undefined
  };
};

describe('StateManager Performance Tests', () => {
  let stateManager: StateManager;
  let mockState: MockDurableObjectState;

  beforeEach(() => {
    mockState = new MockDurableObjectState();
    stateManager = new StateManager(mockState as any, mockEnv);
  });

  describe('State Persistence Performance', () => {
    it('should persist small states within 50ms', async () => {
      const smallState = createLargeWorkflowState('small-workflow', 10);
      
      const { duration } = await measurePerformance(async () => {
        return stateManager.persistWorkflowState(
          smallState.id,
          smallState,
          'perf-test-agent',
          'Small state test'
        );
      });

      expect(duration).toBeLessThan(50);
    });

    it('should persist medium states within 100ms', async () => {
      const mediumState = createLargeWorkflowState('medium-workflow', 100);
      
      const { duration } = await measurePerformance(async () => {
        return stateManager.persistWorkflowState(
          mediumState.id,
          mediumState,
          'perf-test-agent',
          'Medium state test'
        );
      });

      expect(duration).toBeLessThan(100);
    });

    it('should persist large states within 200ms', async () => {
      const largeState = createLargeWorkflowState('large-workflow', 1000);
      
      const { duration } = await measurePerformance(async () => {
        return stateManager.persistWorkflowState(
          largeState.id,
          largeState,
          'perf-test-agent',
          'Large state test'
        );
      });

      expect(duration).toBeLessThan(200);
    });

    it('should handle very large states within 500ms', async () => {
      const veryLargeState = createLargeWorkflowState('very-large-workflow', 5000);
      
      const { duration } = await measurePerformance(async () => {
        return stateManager.persistWorkflowState(
          veryLargeState.id,
          veryLargeState,
          'perf-test-agent',
          'Very large state test'
        );
      });

      expect(duration).toBeLessThan(500);
    });
  });

  describe('State Retrieval Performance', () => {
    it('should retrieve current state within 50ms', async () => {
      const state = createLargeWorkflowState('retrieval-test', 1000);
      
      // First persist the state
      await stateManager.persistWorkflowState(state.id, state, 'test-agent');
      
      const { duration, result } = await measurePerformance(async () => {
        return stateManager.getWorkflowState(state.id);
      });

      expect(duration).toBeLessThan(50);
      expect(result).toBeDefined();
      expect(result!.id).toBe(state.id);
    });

    it('should retrieve specific version within 75ms', async () => {
      const state = createLargeWorkflowState('version-retrieval-test', 500);
      
      // Create multiple versions
      const version1 = await stateManager.persistWorkflowState(state.id, state, 'test-agent', 'Version 1');
      const updatedState = { ...state, status: 'completed' as const };
      await stateManager.persistWorkflowState(state.id, updatedState, 'test-agent', 'Version 2');
      
      const { duration, result } = await measurePerformance(async () => {
        return stateManager.getWorkflowState(state.id, version1.id);
      });

      expect(duration).toBeLessThan(75);
      expect(result).toBeDefined();
      expect(result!.status).toBe('running');
    });

    it('should retrieve workflow history within 100ms', async () => {
      const state = createLargeWorkflowState('history-test', 200);
      
      // Create multiple versions
      for (let i = 0; i < 10; i++) {
        const versionState = { ...state, metadata: { ...state.metadata, version: i } };
        await stateManager.persistWorkflowState(state.id, versionState, 'test-agent', `Version ${i}`);
      }
      
      const { duration, result } = await measurePerformance(async () => {
        return stateManager.getWorkflowHistory(state.id);
      });

      expect(duration).toBeLessThan(100);
      expect(result).toHaveLength(10);
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('should handle 10 concurrent state updates within 200ms', async () => {
      const baseState = createLargeWorkflowState('concurrent-test', 100);
      
      const { duration } = await measurePerformance(async () => {
        const promises = Array.from({ length: 10 }, (_, i) => {
          const state = { ...baseState, metadata: { ...baseState.metadata, update: i } };
          return stateManager.persistWorkflowState(
            `concurrent-${i}`,
            state,
            `agent-${i}`,
            `Concurrent update ${i}`
          );
        });
        
        return Promise.all(promises);
      });

      expect(duration).toBeLessThan(200);
    });

    it('should handle 50 concurrent state retrievals within 100ms', async () => {
      const state = createLargeWorkflowState('concurrent-retrieval-test', 200);
      await stateManager.persistWorkflowState(state.id, state, 'test-agent');
      
      const { duration } = await measurePerformance(async () => {
        const promises = Array.from({ length: 50 }, () => {
          return stateManager.getWorkflowState(state.id);
        });
        
        return Promise.all(promises);
      });

      expect(duration).toBeLessThan(100);
    });

    it('should handle mixed read/write operations efficiently', async () => {
      const state = createLargeWorkflowState('mixed-ops-test', 300);
      await stateManager.persistWorkflowState(state.id, state, 'test-agent');
      
      const { duration } = await measurePerformance(async () => {
        const operations = [];
        
        // 20 reads
        for (let i = 0; i < 20; i++) {
          operations.push(stateManager.getWorkflowState(state.id));
        }
        
        // 10 writes
        for (let i = 0; i < 10; i++) {
          const updatedState = { ...state, metadata: { ...state.metadata, mixedOp: i } };
          operations.push(stateManager.persistWorkflowState(
            `mixed-${i}`,
            updatedState,
            `agent-${i}`,
            `Mixed operation ${i}`
          ));
        }
        
        // 5 history requests
        for (let i = 0; i < 5; i++) {
          operations.push(stateManager.getWorkflowHistory(state.id));
        }
        
        return Promise.all(operations);
      });

      expect(duration).toBeLessThan(300);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should maintain reasonable memory usage for large states', async () => {
      const largeState = createLargeWorkflowState('memory-test', 2000);
      
      const { memoryUsed } = await measurePerformance(async () => {
        return stateManager.persistWorkflowState(
          largeState.id,
          largeState,
          'memory-test-agent',
          'Memory usage test'
        );
      });

      // Memory usage should be reasonable (less than 10MB for this test)
      if (memoryUsed !== undefined) {
        expect(memoryUsed).toBeLessThan(10 * 1024 * 1024); // 10MB
      }
    });

    it('should not leak memory during repeated operations', async () => {
      const state = createLargeWorkflowState('memory-leak-test', 100);
      
      const initialMemory = (performance as any).memory?.usedJSHeapSize;
      
      // Perform many operations
      for (let i = 0; i < 100; i++) {
        const testState = { ...state, metadata: { ...state.metadata, iteration: i } };
        await stateManager.persistWorkflowState(
          `leak-test-${i}`,
          testState,
          'leak-test-agent',
          `Iteration ${i}`
        );
        
        await stateManager.getWorkflowState(`leak-test-${i}`);
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize;
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });

  describe('Snapshot Performance', () => {
    it('should create snapshots within 200ms', async () => {
      const state = createLargeWorkflowState('snapshot-perf-test', 1000);
      await stateManager.persistWorkflowState(state.id, state, 'test-agent');
      
      const { duration } = await measurePerformance(async () => {
        return stateManager.createStateSnapshot(state.id, 'Performance test snapshot');
      });

      expect(duration).toBeLessThan(200);
    });

    it('should restore from snapshots within 300ms', async () => {
      const state = createLargeWorkflowState('restore-perf-test', 1000);
      await stateManager.persistWorkflowState(state.id, state, 'test-agent');
      
      const snapshot = await stateManager.createStateSnapshot(state.id, 'Restore test');
      
      // Modify state
      const modifiedState = { ...state, status: 'failed' as const };
      await stateManager.persistWorkflowState(state.id, modifiedState, 'test-agent', 'Modified for restore test');
      
      const { duration } = await measurePerformance(async () => {
        return stateManager.restoreFromSnapshot(state.id, snapshot.id);
      });

      expect(duration).toBeLessThan(300);
    });
  });

  describe('Scalability Tests', () => {
    it('should handle 1000+ workflows efficiently', async () => {
      const workflowCount = 1000;
      
      const { duration } = await measurePerformance(async () => {
        const promises = Array.from({ length: workflowCount }, (_, i) => {
          const state = createLargeWorkflowState(`scalability-test-${i}`, 10);
          return stateManager.persistWorkflowState(
            state.id,
            state,
            'scalability-agent',
            `Workflow ${i}`
          );
        });
        
        return Promise.all(promises);
      });

      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });

    it('should maintain performance with high version counts', async () => {
      const state = createLargeWorkflowState('version-scalability-test', 100);
      const versionCount = 100;
      
      // Create many versions
      for (let i = 0; i < versionCount; i++) {
        const versionState = { ...state, metadata: { ...state.metadata, version: i } };
        await stateManager.persistWorkflowState(state.id, versionState, 'test-agent', `Version ${i}`);
      }
      
      // Test retrieval performance with many versions
      const { duration } = await measurePerformance(async () => {
        return stateManager.getWorkflowState(state.id);
      });

      expect(duration).toBeLessThan(100);
      
      // Test history retrieval performance
      const { duration: historyDuration } = await measurePerformance(async () => {
        return stateManager.getWorkflowHistory(state.id);
      });

      expect(historyDuration).toBeLessThan(200);
    });
  });

  describe('Performance Metrics Validation', () => {
    it('should meet all performance targets', async () => {
      const testCases = [
        {
          name: 'Small state persistence',
          operation: async () => {
            const state = createLargeWorkflowState('small-perf', 10);
            return stateManager.persistWorkflowState(state.id, state, 'test-agent');
          },
          target: 50
        },
        {
          name: 'Medium state persistence',
          operation: async () => {
            const state = createLargeWorkflowState('medium-perf', 100);
            return stateManager.persistWorkflowState(state.id, state, 'test-agent');
          },
          target: 100
        },
        {
          name: 'State retrieval',
          operation: async () => {
            const state = createLargeWorkflowState('retrieval-perf', 500);
            await stateManager.persistWorkflowState(state.id, state, 'test-agent');
            return stateManager.getWorkflowState(state.id);
          },
          target: 50
        },
        {
          name: 'Snapshot creation',
          operation: async () => {
            const state = createLargeWorkflowState('snapshot-perf', 200);
            await stateManager.persistWorkflowState(state.id, state, 'test-agent');
            return stateManager.createStateSnapshot(state.id, 'Performance test');
          },
          target: 200
        }
      ];

      for (const testCase of testCases) {
        const { duration } = await measurePerformance(testCase.operation);
        expect(duration).toBeLessThan(testCase.target);
        console.log(`${testCase.name}: ${duration.toFixed(2)}ms (target: ${testCase.target}ms)`);
      }
    });
  });
});

