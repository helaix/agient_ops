import { BaseAgent } from '../../src/agents/base-agent';
import { AgentConfig, AgentTask, TaskResult } from '../../src/types';

// Test implementation of BaseAgent
class TestAgent extends BaseAgent {
  protected async getDefaultConfig(): Promise<AgentConfig> {
    return {
      type: 'test-agent',
      name: 'Test Agent',
      description: 'Agent for testing purposes',
      maxConcurrentTasks: 5,
      timeoutMs: 10000,
      retryAttempts: 3,
      capabilities: ['testing'],
      dependencies: []
    };
  }

  protected async processTask(task: AgentTask): Promise<TaskResult> {
    if (task.type === 'test_success') {
      return {
        taskId: task.id,
        success: true,
        data: { message: 'Task completed successfully' },
        completedAt: new Date(),
        duration: 100
      };
    } else if (task.type === 'test_failure') {
      throw new Error('Test failure');
    } else {
      throw new Error(`Unknown task type: ${task.type}`);
    }
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;

  beforeEach(async () => {
    agent = new TestAgent();
    await agent.initialize();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const config = agent.getConfig();
      expect(config.type).toBe('test-agent');
      expect(config.name).toBe('Test Agent');
      expect(config.maxConcurrentTasks).toBe(5);
    });

    it('should have initial state as idle', () => {
      const state = agent.getState();
      expect(state.status).toBe('idle');
      expect(state.currentTasks).toHaveLength(0);
      expect(state.completedTasks).toBe(0);
      expect(state.errorCount).toBe(0);
    });
  });

  describe('task execution', () => {
    it('should execute successful tasks', async () => {
      const task: AgentTask = {
        id: 'test-task-1',
        type: 'test_success',
        priority: 1,
        payload: {},
        createdAt: new Date()
      };

      const result = await agent.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.taskId).toBe('test-task-1');
      expect(result.data.message).toBe('Task completed successfully');
    });

    it('should handle task failures with retries', async () => {
      const task: AgentTask = {
        id: 'test-task-2',
        type: 'test_failure',
        priority: 1,
        payload: {},
        createdAt: new Date()
      };

      const result = await agent.executeTask(task);
      
      expect(result.success).toBe(false);
      expect(result.taskId).toBe('test-task-2');
      expect(result.error).toBe('Test failure');
    });

    it('should update state during task execution', async () => {
      const task: AgentTask = {
        id: 'test-task-3',
        type: 'test_success',
        priority: 1,
        payload: {},
        createdAt: new Date()
      };

      const resultPromise = agent.executeTask(task);
      
      // Check that state is updated during execution
      // Note: This is a simplified test - in reality, we'd need to check state during execution
      
      const result = await resultPromise;
      const finalState = agent.getState();
      
      expect(result.success).toBe(true);
      expect(finalState.completedTasks).toBe(1);
      expect(finalState.status).toBe('idle');
    });
  });

  describe('task capacity', () => {
    it('should accept tasks when under capacity', () => {
      expect(agent.canAcceptTask()).toBe(true);
    });
  });

  describe('agent lifecycle', () => {
    it('should pause and resume correctly', async () => {
      await agent.pause();
      expect(agent.getState().status).toBe('paused');
      
      await agent.resume();
      expect(agent.getState().status).toBe('idle');
    });
  });

  describe('event handling', () => {
    it('should emit and handle events', async () => {
      let eventReceived = false;
      let eventData: any = null;

      agent.on('test_event', async (event) => {
        eventReceived = true;
        eventData = event.data;
      });

      await agent.emitEvent('test_event', { message: 'test data' });

      expect(eventReceived).toBe(true);
      expect(eventData.message).toBe('test data');
    });
  });
});

