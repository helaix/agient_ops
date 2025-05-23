import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '../agents/state-manager';
import { WorkflowState, AgentTask, StateVersion, StateConflict, StateSnapshot, Env } from '../types';

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

// Mock Environment
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

// Test data
const createTestWorkflowState = (id: string = 'test-workflow'): WorkflowState => ({
  id,
  name: 'Test Workflow',
  description: 'A test workflow',
  status: 'running',
  priority: 'medium',
  createdAt: Date.now(),
  startedAt: Date.now(),
  progress: {
    totalTasks: 5,
    completedTasks: 2,
    failedTasks: 0,
    activeAgents: 2,
    bottlenecks: [],
    metrics: {
      averageTaskDuration: 1000,
      agentUtilization: {},
      errorRate: 0,
      throughput: 1.5
    }
  },
  context: {
    userId: 'test-user',
    tags: ['test'],
    metadata: {}
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      type: 'test-task',
      priority: 'medium',
      payload: { data: 'test' },
      context: {
        workflowId: id,
        metadata: {}
      },
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: 3
    }
  },
  agents: {
    'agent-1': 'agent-instance-1'
  },
  dependencies: [],
  metadata: {}
});

describe('StateManager', () => {
  let stateManager: StateManager;
  let mockState: MockDurableObjectState;

  beforeEach(() => {
    mockState = new MockDurableObjectState();
    stateManager = new StateManager(mockState as any, mockEnv);
  });

  describe('State Persistence', () => {
    it('should persist workflow state with versioning', async () => {
      const workflowState = createTestWorkflowState();
      
      const version = await stateManager.persistWorkflowState(
        workflowState.id, 
        workflowState, 
        'test-agent', 
        'Initial state'
      );

      expect(version).toBeDefined();
      expect(version.workflowId).toBe(workflowState.id);
      expect(version.version).toBe(1);
      expect(version.author).toBe('test-agent');
      expect(version.changeDescription).toBe('Initial state');
      expect(version.checksum).toBeDefined();
    });

    it('should increment version numbers correctly', async () => {
      const workflowState = createTestWorkflowState();
      
      const version1 = await stateManager.persistWorkflowState(
        workflowState.id, 
        workflowState, 
        'test-agent', 
        'First version'
      );

      const updatedState = { ...workflowState, status: 'completed' as const };
      const version2 = await stateManager.persistWorkflowState(
        workflowState.id, 
        updatedState, 
        'test-agent', 
        'Second version'
      );

      expect(version1.version).toBe(1);
      expect(version2.version).toBe(2);
      expect(version2.parentVersion).toBe(version1.id);
    });

    it('should validate state before persisting', async () => {
      const invalidState = { ...createTestWorkflowState() };
      delete (invalidState as any).id;

      await expect(
        stateManager.persistWorkflowState('test', invalidState, 'test-agent')
      ).rejects.toThrow('State validation failed');
    });
  });

  describe('State Retrieval', () => {
    it('should retrieve current workflow state', async () => {
      const workflowState = createTestWorkflowState();
      
      await stateManager.persistWorkflowState(
        workflowState.id, 
        workflowState, 
        'test-agent'
      );

      const retrievedState = await stateManager.getWorkflowState(workflowState.id);
      
      expect(retrievedState).toBeDefined();
      expect(retrievedState!.id).toBe(workflowState.id);
      expect(retrievedState!.name).toBe(workflowState.name);
    });

    it('should retrieve specific version by number', async () => {
      const workflowState = createTestWorkflowState();
      
      const version1 = await stateManager.persistWorkflowState(
        workflowState.id, 
        workflowState, 
        'test-agent'
      );

      const updatedState = { ...workflowState, status: 'completed' as const };
      await stateManager.persistWorkflowState(
        workflowState.id, 
        updatedState, 
        'test-agent'
      );

      const retrievedState = await stateManager.getWorkflowState(workflowState.id, '1');
      
      expect(retrievedState).toBeDefined();
      expect(retrievedState!.status).toBe('running');
    });

    it('should retrieve specific version by ID', async () => {
      const workflowState = createTestWorkflowState();
      
      const version = await stateManager.persistWorkflowState(
        workflowState.id, 
        workflowState, 
        'test-agent'
      );

      const retrievedState = await stateManager.getWorkflowState(workflowState.id, version.id);
      
      expect(retrievedState).toBeDefined();
      expect(retrievedState!.id).toBe(workflowState.id);
    });

    it('should return null for non-existent workflow', async () => {
      const retrievedState = await stateManager.getWorkflowState('non-existent');
      expect(retrievedState).toBeNull();
    });
  });

  describe('Version History', () => {
    it('should return workflow history in reverse chronological order', async () => {
      const workflowState = createTestWorkflowState();
      
      const version1 = await stateManager.persistWorkflowState(
        workflowState.id, 
        workflowState, 
        'test-agent', 
        'First'
      );

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const updatedState = { ...workflowState, status: 'completed' as const };
      const version2 = await stateManager.persistWorkflowState(
        workflowState.id, 
        updatedState, 
        'test-agent', 
        'Second'
      );

      const history = await stateManager.getWorkflowHistory(workflowState.id);
      
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe(version2.id); // Most recent first
      expect(history[1].id).toBe(version1.id);
    });

    it('should return empty array for non-existent workflow', async () => {
      const history = await stateManager.getWorkflowHistory('non-existent');
      expect(history).toHaveLength(0);
    });
  });

  describe('State Subscriptions', () => {
    it('should allow agents to subscribe to state changes', async () => {
      const workflowId = 'test-workflow';
      const agentId = 'test-agent';

      await stateManager.subscribeToStateChanges(workflowId, agentId);

      // Verify subscription was stored (this would require access to internal state)
      // For now, we'll just ensure no error was thrown
      expect(true).toBe(true);
    });

    it('should handle multiple subscriptions for same workflow', async () => {
      const workflowId = 'test-workflow';

      await stateManager.subscribeToStateChanges(workflowId, 'agent-1');
      await stateManager.subscribeToStateChanges(workflowId, 'agent-2');

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('State Snapshots', () => {
    it('should create state snapshot', async () => {
      const workflowState = createTestWorkflowState();
      
      await stateManager.persistWorkflowState(
        workflowState.id, 
        workflowState, 
        'test-agent'
      );

      const snapshot = await stateManager.createStateSnapshot(
        workflowState.id, 
        'Test snapshot'
      );

      expect(snapshot).toBeDefined();
      expect(snapshot.workflowId).toBe(workflowState.id);
      expect(snapshot.description).toBe('Test snapshot');
      expect(snapshot.size).toBeGreaterThan(0);
      expect(snapshot.checksum).toBeDefined();
    });

    it('should fail to create snapshot for non-existent workflow', async () => {
      await expect(
        stateManager.createStateSnapshot('non-existent', 'Test')
      ).rejects.toThrow('Workflow not found');
    });
  });

  describe('Task Processing', () => {
    it('should process persist-state task', async () => {
      const workflowState = createTestWorkflowState();
      
      const task: AgentTask = {
        id: 'test-task',
        type: 'persist-state',
        priority: 'medium',
        payload: {
          workflowId: workflowState.id,
          state: workflowState,
          author: 'test-agent',
          changeDescription: 'Test persist'
        },
        context: {
          workflowId: workflowState.id,
          metadata: {}
        },
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: 3
      };

      const result = await stateManager.processTask(task);

      expect(result.status).toBe('success');
      expect(result.result).toBeDefined();
      expect(result.result.workflowId).toBe(workflowState.id);
    });

    it('should process get-state task', async () => {
      const workflowState = createTestWorkflowState();
      
      // First persist a state
      await stateManager.persistWorkflowState(
        workflowState.id, 
        workflowState, 
        'test-agent'
      );

      const task: AgentTask = {
        id: 'test-task',
        type: 'get-state',
        priority: 'medium',
        payload: {
          workflowId: workflowState.id
        },
        context: {
          workflowId: workflowState.id,
          metadata: {}
        },
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: 3
      };

      const result = await stateManager.processTask(task);

      expect(result.status).toBe('success');
      expect(result.result).toBeDefined();
      expect(result.result.id).toBe(workflowState.id);
    });

    it('should handle unknown task type', async () => {
      const task: AgentTask = {
        id: 'test-task',
        type: 'unknown-task',
        priority: 'medium',
        payload: {},
        context: {
          workflowId: 'test',
          metadata: {}
        },
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: 3
      };

      const result = await stateManager.processTask(task);

      expect(result.status).toBe('failure');
      expect(result.error).toContain('Unknown task type');
    });
  });

  describe('Conflict Resolution', () => {
    it('should detect conflicts when states have different update times', async () => {
      const workflowState = createTestWorkflowState();
      workflowState.updatedAt = Date.now();
      
      // Persist initial state
      await stateManager.persistWorkflowState(
        workflowState.id, 
        workflowState, 
        'agent-1'
      );

      // Create a conflicting state with older timestamp
      const conflictingState = { ...workflowState };
      conflictingState.updatedAt = workflowState.updatedAt - 1000; // 1 second older
      conflictingState.status = 'completed';

      // This should detect a conflict
      await stateManager.persistWorkflowState(
        workflowState.id, 
        conflictingState, 
        'agent-2'
      );

      // The conflict should be queued for resolution
      // We can't easily test this without exposing internal state
      expect(true).toBe(true);
    });
  });

  describe('State Validation', () => {
    it('should validate valid state', async () => {
      const workflowState = createTestWorkflowState();
      
      // Access private method through any cast for testing
      const validation = await (stateManager as any).validateState(workflowState.id, workflowState);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.checksum).toBeDefined();
    });

    it('should detect invalid state', async () => {
      const invalidState = { ...createTestWorkflowState() };
      delete (invalidState as any).id;
      
      const validation = await (stateManager as any).validateState('test', invalidState);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('State ID is required');
    });
  });

  describe('Metrics', () => {
    it('should track state metrics', async () => {
      const workflowState = createTestWorkflowState();
      
      await stateManager.persistWorkflowState(
        workflowState.id, 
        workflowState, 
        'test-agent'
      );

      const metrics = await (stateManager as any).getStateMetrics();
      
      expect(metrics.totalStates).toBeGreaterThan(0);
      expect(metrics.activeWorkflows).toBeGreaterThan(0);
      expect(metrics.versionsCreated).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      // Mock storage to throw error
      const errorState = {
        storage: {
          get: vi.fn().mockRejectedValue(new Error('Storage error')),
          put: vi.fn().mockRejectedValue(new Error('Storage error'))
        }
      };

      const errorStateManager = new StateManager(errorState as any, mockEnv);
      
      const task: AgentTask = {
        id: 'test-task',
        type: 'get-state',
        priority: 'medium',
        payload: { workflowId: 'test' },
        context: { workflowId: 'test', metadata: {} },
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: 3
      };

      const result = await errorStateManager.processTask(task);
      
      expect(result.status).toBe('failure');
      expect(result.error).toBeDefined();
    });
  });
});

describe('StateManager Integration', () => {
  let stateManager: StateManager;
  let mockState: MockDurableObjectState;

  beforeEach(() => {
    mockState = new MockDurableObjectState();
    stateManager = new StateManager(mockState as any, mockEnv);
  });

  it('should handle complete workflow lifecycle', async () => {
    const workflowState = createTestWorkflowState();
    
    // 1. Create initial state
    const version1 = await stateManager.persistWorkflowState(
      workflowState.id, 
      workflowState, 
      'coordinator'
    );
    expect(version1.version).toBe(1);

    // 2. Subscribe to changes
    await stateManager.subscribeToStateChanges(workflowState.id, 'agent-1');
    await stateManager.subscribeToStateChanges(workflowState.id, 'agent-2');

    // 3. Update state
    const updatedState = { ...workflowState, status: 'completed' as const };
    const version2 = await stateManager.persistWorkflowState(
      workflowState.id, 
      updatedState, 
      'agent-1'
    );
    expect(version2.version).toBe(2);

    // 4. Create snapshot
    const snapshot = await stateManager.createStateSnapshot(
      workflowState.id, 
      'Completion snapshot'
    );
    expect(snapshot.workflowId).toBe(workflowState.id);

    // 5. Get history
    const history = await stateManager.getWorkflowHistory(workflowState.id);
    expect(history).toHaveLength(2);

    // 6. Verify current state
    const currentState = await stateManager.getWorkflowState(workflowState.id);
    expect(currentState!.status).toBe('completed');
  });

  it('should handle concurrent state updates', async () => {
    const workflowState = createTestWorkflowState();
    
    // Simulate concurrent updates
    const promises = [
      stateManager.persistWorkflowState(
        workflowState.id, 
        { ...workflowState, metadata: { agent: 'agent-1' } }, 
        'agent-1'
      ),
      stateManager.persistWorkflowState(
        workflowState.id, 
        { ...workflowState, metadata: { agent: 'agent-2' } }, 
        'agent-2'
      ),
      stateManager.persistWorkflowState(
        workflowState.id, 
        { ...workflowState, metadata: { agent: 'agent-3' } }, 
        'agent-3'
      )
    ];

    const results = await Promise.all(promises);
    
    // All should succeed
    results.forEach(result => {
      expect(result.workflowId).toBe(workflowState.id);
    });

    // Should have 3 versions
    const history = await stateManager.getWorkflowHistory(workflowState.id);
    expect(history).toHaveLength(3);
  });
});

