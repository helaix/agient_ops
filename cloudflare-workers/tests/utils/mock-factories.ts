import { vi } from 'vitest';
import { 
  AgentInstance, 
  AgentTask, 
  WorkflowState, 
  AgentMessage, 
  EventData,
  AgentConfig,
  TaskResult,
  WorkflowProgress
} from '@/types';

/**
 * Factory functions for creating test data with realistic variations
 */
export class MockFactories {
  private static idCounter = 0;
  
  /**
   * Generate a unique test ID
   */
  static generateId(prefix = 'test'): string {
    return `${prefix}-${++this.idCounter}-${Date.now()}`;
  }
  
  /**
   * Create an agent configuration
   */
  static createAgentConfig(overrides: Partial<AgentConfig> = {}): AgentConfig {
    return {
      type: 'integration-dashboard',
      name: 'Test Agent',
      description: 'Test agent configuration',
      maxConcurrentTasks: 5,
      timeoutMs: 30000,
      retryAttempts: 3,
      capabilities: ['test-capability', 'mock-capability'],
      dependencies: [],
      ...overrides
    };
  }
  
  /**
   * Create an agent instance
   */
  static createAgentInstance(overrides: Partial<AgentInstance> = {}): AgentInstance {
    const now = Date.now();
    return {
      id: this.generateId('agent'),
      type: 'integration-dashboard',
      config: this.createAgentConfig(),
      status: 'idle',
      currentTasks: [],
      lastHeartbeat: now,
      createdAt: now,
      metadata: {},
      ...overrides
    };
  }
  
  /**
   * Create multiple agent instances
   */
  static createAgentInstances(count: number, baseOverrides: Partial<AgentInstance> = {}): AgentInstance[] {
    return Array.from({ length: count }, (_, i) => 
      this.createAgentInstance({
        ...baseOverrides,
        id: this.generateId(`agent-${i}`),
        metadata: { ...baseOverrides.metadata, index: i }
      })
    );
  }
  
  /**
   * Create an agent task
   */
  static createAgentTask(overrides: Partial<AgentTask> = {}): AgentTask {
    const now = Date.now();
    return {
      id: this.generateId('task'),
      type: 'test-task',
      priority: 'medium',
      payload: { action: 'test', data: 'mock-data' },
      context: {
        workflowId: this.generateId('workflow'),
        metadata: {}
      },
      createdAt: now,
      retryCount: 0,
      maxRetries: 3,
      ...overrides
    };
  }
  
  /**
   * Create multiple agent tasks
   */
  static createAgentTasks(count: number, baseOverrides: Partial<AgentTask> = {}): AgentTask[] {
    return Array.from({ length: count }, (_, i) => 
      this.createAgentTask({
        ...baseOverrides,
        id: this.generateId(`task-${i}`),
        payload: { ...baseOverrides.payload, index: i }
      })
    );
  }
  
  /**
   * Create a task result
   */
  static createTaskResult(overrides: Partial<TaskResult> = {}): TaskResult {
    return {
      taskId: this.generateId('task'),
      status: 'success',
      result: { processed: true, timestamp: Date.now() },
      metrics: {
        executionTimeMs: 100 + Math.random() * 900, // 100-1000ms
        apiCallsCount: Math.floor(Math.random() * 5) + 1,
        errorCount: 0,
        retryCount: 0
      },
      ...overrides
    };
  }
  
  /**
   * Create workflow progress
   */
  static createWorkflowProgress(overrides: Partial<WorkflowProgress> = {}): WorkflowProgress {
    const totalTasks = 10;
    const completedTasks = Math.floor(Math.random() * totalTasks);
    const failedTasks = Math.floor(Math.random() * (totalTasks - completedTasks));
    
    return {
      totalTasks,
      completedTasks,
      failedTasks,
      activeAgents: Math.floor(Math.random() * 5) + 1,
      bottlenecks: [],
      metrics: {
        averageTaskDuration: 500 + Math.random() * 1000,
        agentUtilization: {
          'agent-1': Math.random(),
          'agent-2': Math.random()
        },
        errorRate: Math.random() * 0.1, // 0-10% error rate
        throughput: Math.random() * 100 + 10 // 10-110 tasks/min
      },
      ...overrides
    };
  }
  
  /**
   * Create a workflow state
   */
  static createWorkflowState(overrides: Partial<WorkflowState> = {}): WorkflowState {
    const now = Date.now();
    return {
      id: this.generateId('workflow'),
      name: 'Test Workflow',
      description: 'Test workflow for unit testing',
      status: 'pending',
      priority: 'medium',
      createdAt: now,
      progress: this.createWorkflowProgress(),
      context: {
        userId: this.generateId('user'),
        tags: ['test', 'mock'],
        metadata: {}
      },
      tasks: {},
      agents: {},
      dependencies: [],
      metadata: {},
      ...overrides
    };
  }
  
  /**
   * Create multiple workflow states
   */
  static createWorkflowStates(count: number, baseOverrides: Partial<WorkflowState> = {}): WorkflowState[] {
    return Array.from({ length: count }, (_, i) => 
      this.createWorkflowState({
        ...baseOverrides,
        id: this.generateId(`workflow-${i}`),
        name: `Test Workflow ${i}`,
        metadata: { ...baseOverrides.metadata, index: i }
      })
    );
  }
  
  /**
   * Create an agent message
   */
  static createAgentMessage(overrides: Partial<AgentMessage> = {}): AgentMessage {
    return {
      id: this.generateId('message'),
      fromAgentId: this.generateId('from-agent'),
      toAgentId: this.generateId('to-agent'),
      type: 'task',
      payload: { action: 'test', data: 'mock-message-data' },
      timestamp: Date.now(),
      ...overrides
    };
  }
  
  /**
   * Create multiple agent messages
   */
  static createAgentMessages(count: number, baseOverrides: Partial<AgentMessage> = {}): AgentMessage[] {
    return Array.from({ length: count }, (_, i) => 
      this.createAgentMessage({
        ...baseOverrides,
        id: this.generateId(`message-${i}`),
        payload: { ...baseOverrides.payload, index: i }
      })
    );
  }
  
  /**
   * Create an event
   */
  static createEvent(overrides: Partial<EventData> = {}): EventData {
    return {
      id: this.generateId('event'),
      type: 'test-event',
      source: 'internal',
      timestamp: Date.now(),
      payload: { action: 'test', data: 'mock-event-data' },
      metadata: {},
      ...overrides
    };
  }
  
  /**
   * Create multiple events
   */
  static createEvents(count: number, baseOverrides: Partial<EventData> = {}): EventData[] {
    return Array.from({ length: count }, (_, i) => 
      this.createEvent({
        ...baseOverrides,
        id: this.generateId(`event-${i}`),
        timestamp: Date.now() + i * 1000, // Spread events over time
        payload: { ...baseOverrides.payload, index: i }
      })
    );
  }
  
  /**
   * Create a GitHub pull request
   */
  static createGitHubPullRequest(overrides: any = {}): any {
    return {
      id: Math.floor(Math.random() * 10000),
      number: Math.floor(Math.random() * 1000) + 1,
      title: 'Test Pull Request',
      body: 'This is a test pull request for unit testing',
      user: { login: 'test-user' },
      base: { ref: 'main' },
      head: { ref: 'feature-branch' },
      state: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      mergeable: true,
      mergeable_state: 'clean',
      ...overrides
    };
  }
  
  /**
   * Create a Linear issue
   */
  static createLinearIssue(overrides: any = {}): any {
    return {
      id: this.generateId('issue'),
      title: 'Test Linear Issue',
      description: 'This is a test Linear issue for unit testing',
      state: { name: 'Todo', type: 'unstarted' },
      assignee: { name: 'Test User', email: 'test@example.com' },
      team: { name: 'Test Team', key: 'TEST' },
      priority: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  }
  
  /**
   * Create a Slack message
   */
  static createSlackMessage(overrides: any = {}): any {
    return {
      ts: Date.now().toString(),
      text: 'Test Slack message',
      user: 'test-user',
      channel: 'test-channel',
      type: 'message',
      ...overrides
    };
  }
  
  /**
   * Create test data for load testing
   */
  static createLoadTestData(eventCount: number, agentCount: number, taskCount: number) {
    return {
      events: this.createEvents(eventCount),
      agents: this.createAgentInstances(agentCount),
      tasks: this.createAgentTasks(taskCount),
      workflows: this.createWorkflowStates(Math.ceil(taskCount / 10))
    };
  }
  
  /**
   * Create realistic test scenarios
   */
  static createTestScenarios() {
    return {
      // Simple single-agent scenario
      singleAgent: {
        agents: [this.createAgentInstance({ type: 'integration-dashboard' })],
        tasks: this.createAgentTasks(5),
        workflows: [this.createWorkflowState({ status: 'running' })]
      },
      
      // Multi-agent coordination scenario
      multiAgent: {
        agents: [
          this.createAgentInstance({ type: 'integration-dashboard' }),
          this.createAgentInstance({ type: 'review-manager' }),
          this.createAgentInstance({ type: 'context-optimizer' })
        ],
        tasks: this.createAgentTasks(15),
        workflows: this.createWorkflowStates(3)
      },
      
      // High-load scenario
      highLoad: {
        agents: this.createAgentInstances(10),
        tasks: this.createAgentTasks(100),
        workflows: this.createWorkflowStates(20),
        events: this.createEvents(500)
      },
      
      // Error scenario
      errorScenario: {
        agents: [
          this.createAgentInstance({ status: 'error' }),
          this.createAgentInstance({ status: 'idle' })
        ],
        tasks: this.createAgentTasks(10, { retryCount: 2 }),
        workflows: [this.createWorkflowState({ status: 'failed' })]
      }
    };
  }
  
  /**
   * Reset the ID counter (useful for deterministic tests)
   */
  static resetIdCounter(): void {
    this.idCounter = 0;
  }
}

