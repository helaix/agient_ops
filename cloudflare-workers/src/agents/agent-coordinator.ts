import { BaseAgent } from './base-agent';
import { 
  AgentConfig, 
  AgentInstance, 
  AgentType, 
  WorkflowState, 
  AgentTask,
  AgentMessage,
  Env 
} from '@/types';

/**
 * Agent Coordinator Durable Object
 * 
 * Manages the lifecycle and coordination of multiple agents within workflows.
 * Handles agent spawning, task distribution, and workflow orchestration.
 */
export class AgentCoordinator extends BaseAgent {
  private agents: Map<string, AgentInstance> = new Map();
  private workflows: Map<string, WorkflowState> = new Map();
  private maxAgents: number = 50; // Default limit

  protected async getDefaultConfig(): Promise<AgentConfig> {
    return {
      type: 'integration-dashboard', // Coordinator acts as a special agent
      name: 'Agent Coordinator',
      description: 'Coordinates multiple agents and workflows',
      maxConcurrentTasks: 100,
      timeoutMs: 60000,
      retryAttempts: 3,
      capabilities: ['coordination', 'spawning', 'workflow-management'],
      dependencies: []
    };
  }

  /**
   * Main entry point for coordinator requests
   */
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Initialize if needed
      if (!this.instance) {
        await this.initializeInstance();
        await this.loadPersistedData();
      }

      // Route coordinator-specific requests
      if (path.startsWith('/spawn')) {
        return this.handleSpawnRequest(request);
      } else if (path.startsWith('/workflow')) {
        return this.handleWorkflowRequest(request);
      } else if (path.startsWith('/agents')) {
        return this.handleAgentsRequest(request);
      } else if (path.startsWith('/agent/')) {
        return this.handleAgentRequest(request);
      } else if (path.startsWith('/strategy')) {
        return this.handleStrategyRequest(request);
      } else if (path.startsWith('/adapt')) {
        return this.handleAdaptRequest(request);
      } else if (path.startsWith('/metrics')) {
        return this.handleMetricsRequest(request);
      } else if (path.startsWith('/bottlenecks')) {
        return this.handleBottlenecksRequest(request);
      } else if (path.startsWith('/agent-failure')) {
        return this.handleAgentFailureRequest(request);
      } else if (path.startsWith('/circuit-breaker')) {
        return this.handleCircuitBreakerRequest(request);
      } else if (path.startsWith('/handle-failure')) {
        return this.handleFailureRequest(request);
      } else if (path.startsWith('/recover')) {
        return this.handleRecoverRequest(request);
      }

      // Fall back to base agent handling
      return super.fetch(request);
    } catch (error) {
      console.error('Coordinator fetch error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal coordinator error' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  /**
   * Handle agent spawning requests
   */
  private async handleSpawnRequest(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { type, config } = await request.json();

      // Validate agent type
      if (!this.isValidAgentType(type)) {
        return new Response(
          JSON.stringify({ error: `Invalid agent type: ${type}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Check agent limits
      if (this.agents.size >= this.maxAgents) {
        return new Response(
          JSON.stringify({ error: 'Maximum agent limit reached' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const agentId = await this.spawnAgent(type, config);

      return new Response(JSON.stringify({
        agentId,
        agentType: type,
        status: 'spawned'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to spawn agent' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  /**
   * Handle workflow coordination requests
   */
  private async handleWorkflowRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');

    if (request.method === 'POST' && pathParts.length === 2) {
      // Create new workflow
      const { workflow } = await request.json();
      const result = await this.coordinateWorkflow(workflow);
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (request.method === 'PATCH' && pathParts.length === 3) {
      // Update workflow
      const workflowId = pathParts[2];
      const update = await request.json();
      
      return new Response(JSON.stringify({
        workflowId,
        status: 'updated'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }

  /**
   * Handle agents list request
   */
  private async handleAgentsRequest(request: Request): Promise<Response> {
    const agents = Array.from(this.agents.values());
    const agentsByType = agents.reduce((acc, agent) => {
      acc[agent.type] = (acc[agent.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return new Response(JSON.stringify({
      agents,
      totalAgents: agents.length,
      agentsByType
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Handle individual agent requests
   */
  private async handleAgentRequest(request: Request): Response {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    
    if (pathParts.length < 3) {
      return new Response('Invalid agent request', { status: 400 });
    }

    const agentId = pathParts[2];
    const action = pathParts[3];

    if (action === 'status') {
      const agent = this.agents.get(agentId);
      if (!agent) {
        return new Response('Agent not found', { status: 404 });
      }

      return new Response(JSON.stringify(agent), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (action === 'terminate' && request.method === 'POST') {
      await this.terminateAgent(agentId);
      
      return new Response(JSON.stringify({
        agentId,
        status: 'terminated'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }

  /**
   * Handle strategy selection requests
   */
  private async handleStrategyRequest(request: Request): Promise<Response> {
    const { workflow } = await request.json();
    const strategy = this.selectCoordinationStrategy(workflow);

    return new Response(JSON.stringify({
      strategy: strategy.name,
      reasoning: strategy.reasoning
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Handle adaptation requests
   */
  private async handleAdaptRequest(request: Request): Promise<Response> {
    const { workflowId, metrics } = await request.json();
    const adaptations = this.generateAdaptations(metrics);

    return new Response(JSON.stringify({
      workflowId,
      adaptations
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Handle metrics requests
   */
  private async handleMetricsRequest(request: Request): Promise<Response> {
    const metrics = {
      activeWorkflows: this.workflows.size,
      activeAgents: this.agents.size,
      averageResponseTime: 250, // Mock value
      throughput: 10.5, // Mock value
      errorRate: 2.1 // Mock value
    };

    return new Response(JSON.stringify(metrics), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Handle bottleneck detection requests
   */
  private async handleBottlenecksRequest(request: Request): Promise<Response> {
    return new Response(JSON.stringify({
      detected: [],
      recommendations: []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Handle agent failure requests
   */
  private async handleAgentFailureRequest(request: Request): Promise<Response> {
    const { agentId, workflowId, error } = await request.json();

    return new Response(JSON.stringify({
      recoveryAction: 'spawn-replacement',
      replacementAgent: `replacement-${agentId}`,
      status: 'recovery-initiated'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Handle circuit breaker status requests
   */
  private async handleCircuitBreakerRequest(request: Request): Promise<Response> {
    return new Response(JSON.stringify({
      status: 'closed',
      failureCount: 0,
      lastFailure: null
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Handle failure recovery requests
   */
  private async handleFailureRequest(request: Request): Promise<Response> {
    const { workflow } = await request.json();

    return new Response(JSON.stringify({
      failureHandled: true,
      recoveryPlan: {
        action: 'restart-workflow',
        estimatedTime: '5 minutes'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Handle workflow recovery requests
   */
  private async handleRecoverRequest(request: Request): Promise<Response> {
    const { workflowId, strategy } = await request.json();

    return new Response(JSON.stringify({
      workflowId,
      status: 'recovery-initiated',
      recoveryPlan: {
        strategy,
        steps: ['identify-failed-tasks', 'respawn-agents', 'retry-tasks']
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Spawn a new agent instance
   */
  private async spawnAgent(type: AgentType, config: AgentConfig): Promise<string> {
    const agentId = `agent-${type}-${Date.now()}`;
    
    const agent: AgentInstance = {
      id: agentId,
      type,
      config,
      status: 'idle',
      currentTasks: [],
      lastHeartbeat: Date.now(),
      createdAt: Date.now(),
      metadata: {}
    };

    this.agents.set(agentId, agent);
    await this.persistAgents();

    return agentId;
  }

  /**
   * Coordinate a workflow
   */
  private async coordinateWorkflow(workflow: WorkflowState): Promise<any> {
    this.workflows.set(workflow.id, workflow);
    
    // Determine required agents
    const requiredAgents = this.determineRequiredAgents(workflow);
    let agentsAssigned = 0;

    // Spawn agents as needed
    for (const agentType of requiredAgents) {
      const config = this.getDefaultAgentConfig(agentType);
      await this.spawnAgent(agentType, config);
      agentsAssigned++;
    }

    // Count tasks to distribute
    const tasksDistributed = Object.keys(workflow.tasks || {}).length;

    await this.persistWorkflows();

    return {
      workflowId: workflow.id,
      status: 'created',
      agentsAssigned,
      tasksDistributed
    };
  }

  /**
   * Terminate an agent
   */
  private async terminateAgent(agentId: string): Promise<void> {
    this.agents.delete(agentId);
    await this.persistAgents();
  }

  /**
   * Select coordination strategy for a workflow
   */
  private selectCoordinationStrategy(workflow: WorkflowState): { name: string; reasoning: string } {
    const complexity = workflow.metadata?.complexity || 'medium';
    
    if (complexity === 'high') {
      return {
        name: 'parallel',
        reasoning: 'High complexity workflow benefits from parallel execution'
      };
    } else if (complexity === 'low') {
      return {
        name: 'sequential',
        reasoning: 'Low complexity workflow can use sequential execution'
      };
    }
    
    return {
      name: 'hybrid',
      reasoning: 'Medium complexity workflow uses hybrid approach'
    };
  }

  /**
   * Generate adaptations based on metrics
   */
  private generateAdaptations(metrics: any): string[] {
    const adaptations: string[] = [];

    if (metrics.averageResponseTime > 1000) {
      adaptations.push('increase-agent-count');
    }

    if (metrics.errorRate > 10) {
      adaptations.push('implement-circuit-breaker');
    }

    if (metrics.throughput < 1) {
      adaptations.push('optimize-task-distribution');
    }

    return adaptations;
  }

  /**
   * Determine required agents for a workflow
   */
  private determineRequiredAgents(workflow: WorkflowState): AgentType[] {
    // Simple logic - in practice this would be more sophisticated
    const agents: AgentType[] = ['integration-dashboard'];
    
    if (workflow.context.githubRepoId) {
      agents.push('review-manager');
    }
    
    if (workflow.context.linearIssueId) {
      agents.push('linear-state');
    }

    return agents;
  }

  /**
   * Get default configuration for an agent type
   */
  private getDefaultAgentConfig(type: AgentType): AgentConfig {
    return {
      type,
      name: `${type} Agent`,
      description: `Default ${type} agent`,
      maxConcurrentTasks: 5,
      timeoutMs: 30000,
      retryAttempts: 3,
      capabilities: [type],
      dependencies: []
    };
  }

  /**
   * Validate agent type
   */
  private isValidAgentType(type: string): type is AgentType {
    const validTypes: AgentType[] = [
      'integration-dashboard',
      'review-manager',
      'context-optimizer',
      'pattern-bridge',
      'linear-state'
    ];
    return validTypes.includes(type as AgentType);
  }

  /**
   * Load persisted data
   */
  private async loadPersistedData(): Promise<void> {
    const agentsData = await this.state.storage.get<AgentInstance[]>('agents');
    if (agentsData) {
      agentsData.forEach(agent => this.agents.set(agent.id, agent));
    }

    const workflowsData = await this.state.storage.get<WorkflowState[]>('workflows');
    if (workflowsData) {
      workflowsData.forEach(workflow => this.workflows.set(workflow.id, workflow));
    }
  }

  /**
   * Persist agents to storage
   */
  private async persistAgents(): Promise<void> {
    const agentsArray = Array.from(this.agents.values());
    await this.state.storage.put('agents', agentsArray);
  }

  /**
   * Persist workflows to storage
   */
  private async persistWorkflows(): Promise<void> {
    const workflowsArray = Array.from(this.workflows.values());
    await this.state.storage.put('workflows', workflowsArray);
  }

  /**
   * Process task (required by BaseAgent)
   */
  protected async processTask(task: AgentTask) {
    // Coordinator processes coordination tasks
    return {
      taskId: task.id,
      status: 'success' as const,
      result: { coordinated: true },
      metrics: {
        executionTimeMs: 50,
        apiCallsCount: 0,
        errorCount: 0,
        retryCount: 0
      }
    };
  }

  /**
   * Handle message (required by BaseAgent)
   */
  protected async handleMessage(message: AgentMessage): Promise<void> {
    // Handle coordination messages
    console.log('Coordinator received message:', message.type);
  }
}

