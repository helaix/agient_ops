import { BaseAgent } from './base-agent';
import { 
  AgentTask, 
  TaskResult, 
  AgentMessage, 
  AgentConfig, 
  AgentType, 
  AgentInstance,
  WorkflowState,
  CoordinationStrategy,
  Env 
} from '@/types';

/**
 * Agent Coordinator Durable Object
 * 
 * Central coordination logic for multi-agent workflows:
 * - Dynamic agent spawning and task distribution
 * - Workflow state management and persistence
 * - Adaptive coordination strategy implementation
 * - Real-time workflow monitoring
 */
export class AgentCoordinator extends BaseAgent {
  private workflows: Map<string, WorkflowState> = new Map();
  private agents: Map<string, AgentInstance> = new Map();
  private coordinationStrategies: Map<string, CoordinationStrategy> = new Map();
  private taskQueue: AgentTask[] = [];

  protected async getDefaultConfig(): Promise<AgentConfig> {
    return {
      type: 'integration-dashboard', // This will be overridden
      name: 'Agent Coordinator',
      description: 'Central coordinator for multi-agent workflows',
      maxConcurrentTasks: 100,
      timeoutMs: 300000, // 5 minutes
      retryAttempts: 3,
      capabilities: [
        'workflow-orchestration',
        'agent-spawning',
        'task-distribution',
        'coordination-strategy-selection',
        'bottleneck-detection',
        'resource-allocation'
      ],
      dependencies: []
    };
  }

  /**
   * Initialize coordinator with default coordination strategies
   */
  protected async initializeInstance(): Promise<void> {
    await super.initializeInstance();
    
    // Load existing state
    const storedWorkflows = await this.state.storage.get<Record<string, WorkflowState>>('workflows') || {};
    const storedAgents = await this.state.storage.get<Record<string, AgentInstance>>('agents') || {};
    const storedStrategies = await this.state.storage.get<Record<string, CoordinationStrategy>>('strategies') || {};
    
    this.workflows = new Map(Object.entries(storedWorkflows));
    this.agents = new Map(Object.entries(storedAgents));
    this.coordinationStrategies = new Map(Object.entries(storedStrategies));
    
    // Initialize default coordination strategies if empty
    if (this.coordinationStrategies.size === 0) {
      await this.initializeDefaultStrategies();
    }
  }

  /**
   * Process coordination tasks
   */
  protected async processTask(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    
    try {
      await this.updateStatus('active', { currentTask: task.id });
      
      let result: any;
      
      switch (task.type) {
        case 'create-workflow':
          result = await this.createWorkflow(task.payload);
          break;
        case 'spawn-agent':
          result = await this.spawnAgent(task.payload.type, task.payload.config);
          break;
        case 'distribute-tasks':
          result = await this.distributeTasks(task.payload.workflowId, task.payload.tasks);
          break;
        case 'monitor-workflow':
          result = await this.monitorWorkflow(task.payload.workflowId);
          break;
        case 'adjust-strategy':
          result = await this.adjustCoordinationStrategy(task.payload.workflowId, task.payload.strategy);
          break;
        case 'terminate-workflow':
          result = await this.terminateWorkflow(task.payload.workflowId);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      const executionTime = Date.now() - startTime;
      
      await this.logMetrics('task_completed', {
        execution_time: executionTime,
        task_type: task.type === 'create-workflow' ? 1 : 0
      });

      await this.updateStatus('idle');

      return {
        taskId: task.id,
        status: 'success',
        result,
        metrics: {
          executionTimeMs: executionTime,
          apiCallsCount: 0,
          errorCount: 0,
          retryCount: task.retryCount
        }
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await this.logMetrics('task_failed', {
        execution_time: executionTime,
        error_count: 1
      });

      await this.updateStatus('error', { lastError: error instanceof Error ? error.message : 'Unknown error' });

      return {
        taskId: task.id,
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          executionTimeMs: executionTime,
          apiCallsCount: 0,
          errorCount: 1,
          retryCount: task.retryCount
        }
      };
    }
  }

  /**
   * Handle messages from other agents
   */
  protected async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'status':
        await this.handleAgentStatusUpdate(message);
        break;
      case 'task':
        await this.handleTaskCompletion(message);
        break;
      case 'error':
        await this.handleAgentError(message);
        break;
      case 'coordination':
        await this.handleCoordinationRequest(message);
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Create a new workflow
   */
  private async createWorkflow(payload: any): Promise<WorkflowState> {
    const workflowId = crypto.randomUUID();
    
    const workflow: WorkflowState = {
      id: workflowId,
      name: payload.name || `Workflow ${workflowId}`,
      description: payload.description,
      status: 'pending',
      priority: payload.priority || 'medium',
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
      context: payload.context || {
        userId: 'unknown',
        tags: [],
        metadata: {}
      },
      tasks: {},
      agents: {},
      dependencies: payload.dependencies || [],
      metadata: payload.metadata || {}
    };

    this.workflows.set(workflowId, workflow);
    await this.persistWorkflows();

    // Select and apply coordination strategy
    const strategy = await this.selectCoordinationStrategy(workflow);
    await this.applyCoordinationStrategy(workflowId, strategy);

    return workflow;
  }

  /**
   * Spawn a new agent instance
   */
  private async spawnAgent(type: AgentType, config?: Partial<AgentConfig>): Promise<string> {
    const agentId = `${type}-${crypto.randomUUID()}`;
    
    const namespace = this.getAgentNamespaceByType(type);
    if (!namespace) {
      throw new Error(`Unknown agent type: ${type}`);
    }

    const agentStub = namespace.get(namespace.idFromString(agentId));
    
    // Initialize the agent
    const response = await agentStub.fetch('https://agent/status');
    if (!response.ok) {
      throw new Error(`Failed to spawn agent: ${response.statusText}`);
    }

    const agentInstance: AgentInstance = await response.json();
    this.agents.set(agentId, agentInstance);
    await this.persistAgents();

    return agentId;
  }

  /**
   * Distribute tasks to appropriate agents
   */
  private async distributeTasks(workflowId: string, tasks: AgentTask[]): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    for (const task of tasks) {
      // Find the best agent for this task
      const agentId = await this.selectAgentForTask(task);
      
      if (!agentId) {
        // No suitable agent available, queue the task
        this.taskQueue.push(task);
        continue;
      }

      // Assign task to agent
      const namespace = this.getAgentNamespaceByAgentId(agentId);
      if (namespace) {
        const agentStub = namespace.get(namespace.idFromString(agentId));
        
        try {
          await agentStub.fetch('https://agent/task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
          });

          // Update workflow state
          workflow.tasks[task.id] = task;
          workflow.agents[agentId] = agentId;
          workflow.progress.totalTasks++;
        } catch (error) {
          console.error(`Failed to assign task ${task.id} to agent ${agentId}:`, error);
          this.taskQueue.push(task);
        }
      }
    }

    await this.persistWorkflows();
  }

  /**
   * Monitor workflow progress and detect bottlenecks
   */
  private async monitorWorkflow(workflowId: string): Promise<any> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Collect status from all agents
    const agentStatuses = await this.collectAgentStatuses(workflow);
    
    // Detect bottlenecks
    const bottlenecks = await this.detectBottlenecks(workflow, agentStatuses);
    
    // Update workflow progress
    workflow.progress.bottlenecks = bottlenecks;
    workflow.progress.activeAgents = Object.keys(workflow.agents).length;
    
    // Calculate metrics
    await this.updateWorkflowMetrics(workflow, agentStatuses);
    
    await this.persistWorkflows();

    return {
      status: workflow.status,
      progress: workflow.progress,
      bottlenecks,
      recommendations: await this.generateRecommendations(workflow)
    };
  }

  /**
   * Adjust coordination strategy based on workflow performance
   */
  private async adjustCoordinationStrategy(workflowId: string, newStrategy: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const strategy = this.coordinationStrategies.get(newStrategy);
    if (!strategy) {
      throw new Error(`Strategy not found: ${newStrategy}`);
    }

    await this.applyCoordinationStrategy(workflowId, strategy);
  }

  /**
   * Terminate a workflow and clean up resources
   */
  private async terminateWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Terminate all associated agents
    for (const agentId of Object.keys(workflow.agents)) {
      try {
        const namespace = this.getAgentNamespaceByAgentId(agentId);
        if (namespace) {
          const agentStub = namespace.get(namespace.idFromString(agentId));
          await agentStub.fetch('https://agent/terminate', { method: 'POST' });
        }
      } catch (error) {
        console.error(`Failed to terminate agent ${agentId}:`, error);
      }
    }

    workflow.status = 'cancelled';
    workflow.completedAt = Date.now();
    
    await this.persistWorkflows();
  }

  /**
   * Initialize default coordination strategies
   */
  private async initializeDefaultStrategies(): Promise<void> {
    const strategies: CoordinationStrategy[] = [
      {
        id: 'round-robin',
        name: 'Round Robin',
        description: 'Distribute tasks evenly across available agents',
        applicability: ['balanced-workload', 'homogeneous-tasks'],
        implementation: 'round-robin',
        parameters: {},
        effectiveness: 0.7,
        usageCount: 0,
        lastUsed: 0
      },
      {
        id: 'priority-based',
        name: 'Priority Based',
        description: 'Assign tasks based on priority and agent capabilities',
        applicability: ['mixed-priority', 'specialized-agents'],
        implementation: 'priority-queue',
        parameters: { priorityWeights: { critical: 4, high: 3, medium: 2, low: 1 } },
        effectiveness: 0.8,
        usageCount: 0,
        lastUsed: 0
      },
      {
        id: 'load-balanced',
        name: 'Load Balanced',
        description: 'Distribute tasks based on current agent load',
        applicability: ['variable-task-duration', 'resource-optimization'],
        implementation: 'load-balancer',
        parameters: { loadThreshold: 0.8 },
        effectiveness: 0.85,
        usageCount: 0,
        lastUsed: 0
      }
    ];

    for (const strategy of strategies) {
      this.coordinationStrategies.set(strategy.id, strategy);
    }

    await this.persistStrategies();
  }

  /**
   * Select the best coordination strategy for a workflow
   */
  private async selectCoordinationStrategy(workflow: WorkflowState): Promise<CoordinationStrategy> {
    // Simple strategy selection based on workflow characteristics
    // In practice, this would use ML or more sophisticated heuristics
    
    if (workflow.priority === 'critical') {
      return this.coordinationStrategies.get('priority-based')!;
    }
    
    if (workflow.context.tags.includes('load-sensitive')) {
      return this.coordinationStrategies.get('load-balanced')!;
    }
    
    return this.coordinationStrategies.get('round-robin')!;
  }

  /**
   * Apply a coordination strategy to a workflow
   */
  private async applyCoordinationStrategy(workflowId: string, strategy: CoordinationStrategy): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    workflow.metadata.coordinationStrategy = strategy.id;
    strategy.usageCount++;
    strategy.lastUsed = Date.now();

    await this.persistWorkflows();
    await this.persistStrategies();
  }

  /**
   * Select the best agent for a task
   */
  private async selectAgentForTask(task: AgentTask): Promise<string | null> {
    // Find agents with matching capabilities
    const suitableAgents = Array.from(this.agents.values()).filter(agent => 
      agent.status === 'idle' && 
      agent.currentTasks.length < agent.config.maxConcurrentTasks
    );

    if (suitableAgents.length === 0) {
      return null;
    }

    // Simple selection - in practice, this would consider load, capabilities, etc.
    return suitableAgents[0].id;
  }

  /**
   * Get agent namespace by type
   */
  private getAgentNamespaceByType(type: AgentType): DurableObjectNamespace | null {
    switch (type) {
      case 'integration-dashboard': return this.env.INTEGRATION_DASHBOARD_AGENT;
      case 'review-manager': return this.env.REVIEW_MANAGER_AGENT;
      case 'context-optimizer': return this.env.CONTEXT_OPTIMIZER_AGENT;
      case 'pattern-bridge': return this.env.PATTERN_BRIDGE_AGENT;
      case 'linear-state': return this.env.LINEAR_STATE_AGENT;
      case 'state-manager': return this.env.STATE_MANAGER;
      default: return null;
    }
  }

  /**
   * Get agent namespace by agent ID
   */
  private getAgentNamespaceByAgentId(agentId: string): DurableObjectNamespace | null {
    const agent = this.agents.get(agentId);
    if (!agent) return null;
    return this.getAgentNamespaceByType(agent.type);
  }

  /**
   * Collect status from all agents in a workflow
   */
  private async collectAgentStatuses(workflow: WorkflowState): Promise<Record<string, any>> {
    const statuses: Record<string, any> = {};
    
    for (const agentId of Object.keys(workflow.agents)) {
      try {
        const namespace = this.getAgentNamespaceByAgentId(agentId);
        if (namespace) {
          const agentStub = namespace.get(namespace.idFromString(agentId));
          const response = await agentStub.fetch('https://agent/status');
          if (response.ok) {
            statuses[agentId] = await response.json();
          }
        }
      } catch (error) {
        console.error(`Failed to get status for agent ${agentId}:`, error);
      }
    }
    
    return statuses;
  }

  /**
   * Detect bottlenecks in workflow execution
   */
  private async detectBottlenecks(workflow: WorkflowState, agentStatuses: Record<string, any>): Promise<string[]> {
    const bottlenecks: string[] = [];
    
    // Check for overloaded agents
    for (const [agentId, status] of Object.entries(agentStatuses)) {
      if (status.messageQueueLength > 10) {
        bottlenecks.push(`Agent ${agentId} has high message queue`);
      }
    }
    
    // Check for stalled tasks
    const now = Date.now();
    for (const task of Object.values(workflow.tasks)) {
      if (task.startedAt && now - task.startedAt > 300000) { // 5 minutes
        bottlenecks.push(`Task ${task.id} has been running for too long`);
      }
    }
    
    return bottlenecks;
  }

  /**
   * Update workflow metrics
   */
  private async updateWorkflowMetrics(workflow: WorkflowState, agentStatuses: Record<string, any>): Promise<void> {
    // Calculate average task duration
    const completedTasks = Object.values(workflow.tasks).filter(task => task.completedAt);
    if (completedTasks.length > 0) {
      const totalDuration = completedTasks.reduce((sum, task) => 
        sum + (task.completedAt! - task.startedAt!), 0);
      workflow.progress.metrics.averageTaskDuration = totalDuration / completedTasks.length;
    }
    
    // Calculate agent utilization
    for (const [agentId, status] of Object.entries(agentStatuses)) {
      const utilization = status.currentTasks?.length || 0;
      workflow.progress.metrics.agentUtilization[agentId] = utilization;
    }
    
    // Calculate error rate
    const failedTasks = Object.values(workflow.tasks).filter(task => 
      task.completedAt && task.retryCount >= task.maxRetries);
    workflow.progress.metrics.errorRate = failedTasks.length / Object.keys(workflow.tasks).length;
  }

  /**
   * Generate recommendations for workflow optimization
   */
  private async generateRecommendations(workflow: WorkflowState): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (workflow.progress.metrics.errorRate > 0.1) {
      recommendations.push('Consider increasing retry attempts or investigating task failures');
    }
    
    if (workflow.progress.bottlenecks.length > 0) {
      recommendations.push('Consider spawning additional agents to resolve bottlenecks');
    }
    
    return recommendations;
  }

  /**
   * Handle agent status updates
   */
  private async handleAgentStatusUpdate(message: AgentMessage): Promise<void> {
    const agent = this.agents.get(message.fromAgentId);
    if (agent) {
      agent.status = message.payload.status;
      agent.lastHeartbeat = message.timestamp;
      await this.persistAgents();
    }
  }

  /**
   * Handle task completion notifications
   */
  private async handleTaskCompletion(message: AgentMessage): Promise<void> {
    const taskResult: TaskResult = message.payload;
    
    // Update workflow progress
    for (const workflow of this.workflows.values()) {
      if (workflow.tasks[taskResult.taskId]) {
        if (taskResult.status === 'success') {
          workflow.progress.completedTasks++;
        } else {
          workflow.progress.failedTasks++;
        }
        
        // Check if workflow is complete
        if (workflow.progress.completedTasks + workflow.progress.failedTasks >= workflow.progress.totalTasks) {
          workflow.status = 'completed';
          workflow.completedAt = Date.now();
        }
        
        break;
      }
    }
    
    await this.persistWorkflows();
  }

  /**
   * Handle agent error notifications
   */
  private async handleAgentError(message: AgentMessage): Promise<void> {
    console.error(`Agent ${message.fromAgentId} reported error:`, message.payload);
    
    // Implement error recovery logic
    // This could include restarting agents, redistributing tasks, etc.
  }

  /**
   * Handle coordination requests from agents
   */
  private async handleCoordinationRequest(message: AgentMessage): Promise<void> {
    // Handle requests for coordination assistance
    // This could include resource allocation, conflict resolution, etc.
  }

  /**
   * Persist workflows to storage
   */
  private async persistWorkflows(): Promise<void> {
    const workflowsObj = Object.fromEntries(this.workflows);
    await this.state.storage.put('workflows', workflowsObj);
  }

  /**
   * Persist agents to storage
   */
  private async persistAgents(): Promise<void> {
    const agentsObj = Object.fromEntries(this.agents);
    await this.state.storage.put('agents', agentsObj);
  }

  /**
   * Persist strategies to storage
   */
  private async persistStrategies(): Promise<void> {
    const strategiesObj = Object.fromEntries(this.coordinationStrategies);
    await this.state.storage.put('strategies', strategiesObj);
  }
}
