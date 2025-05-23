import { 
  AgentTask, 
  TaskResult, 
  AgentMessage, 
  AgentInstance, 
  AgentConfig, 
  AgentStatus,
  Env 
} from '@/types';

/**
 * Base Agent Durable Object
 * 
 * Provides core functionality for all agent types including:
 * - State persistence and lifecycle management
 * - Inter-agent communication
 * - Task processing and result handling
 * - Health monitoring and recovery
 */
export abstract class BaseAgent {
  protected state: DurableObjectState;
  protected env: Env;
  protected instance: AgentInstance | null = null;
  protected messageQueue: AgentMessage[] = [];
  protected activeTask: AgentTask | null = null;
  protected lastHeartbeat: number = Date.now();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  /**
   * Main entry point for all agent communication
   */
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Initialize agent instance if not exists
      if (!this.instance) {
        await this.initializeInstance();
      }

      switch (path) {
        case '/task':
          return this.handleTaskRequest(request);
        case '/message':
          return this.handleMessageRequest(request);
        case '/status':
          return this.handleStatusRequest(request);
        case '/health':
          return this.handleHealthRequest(request);
        case '/terminate':
          return this.handleTerminateRequest(request);
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Agent fetch error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  /**
   * Initialize agent instance with default configuration
   */
  protected async initializeInstance(): Promise<void> {
    this.instance = await this.state.storage.get<AgentInstance>('instance');
    
    if (!this.instance) {
      const config = await this.getDefaultConfig();
      this.instance = {
        id: this.state.id.toString(),
        type: config.type,
        config,
        status: 'idle',
        currentTasks: [],
        lastHeartbeat: Date.now(),
        createdAt: Date.now(),
        metadata: {}
      };
      await this.state.storage.put('instance', this.instance);
    }

    // Update heartbeat
    this.lastHeartbeat = Date.now();
    this.instance.lastHeartbeat = this.lastHeartbeat;
    await this.state.storage.put('instance', this.instance);
  }

  /**
   * Abstract method to get agent-specific configuration
   */
  protected abstract getDefaultConfig(): Promise<AgentConfig>;

  /**
   * Handle incoming task requests
   */
  protected async handleTaskRequest(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const task: AgentTask = await request.json();
    
    try {
      const result = await this.processTask(task);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Task processing error:', error);
      return new Response(
        JSON.stringify({ 
          taskId: task.id,
          status: 'failure',
          error: error instanceof Error ? error.message : 'Unknown error'
        }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }

  /**
   * Handle inter-agent messages
   */
  protected async handleMessageRequest(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const message: AgentMessage = await request.json();
    
    try {
      await this.receiveMessage(message);
      return new Response(JSON.stringify({ status: 'received' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Message handling error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to process message' }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }

  /**
   * Handle status requests
   */
  protected async handleStatusRequest(request: Request): Promise<Response> {
    if (!this.instance) {
      await this.initializeInstance();
    }

    const status = {
      ...this.instance,
      activeTask: this.activeTask,
      messageQueueLength: this.messageQueue.length,
      uptime: Date.now() - this.instance!.createdAt
    };

    return new Response(JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Handle health check requests
   */
  protected async handleHealthRequest(request: Request): Promise<Response> {
    const health = {
      status: this.getHealthStatus(),
      timestamp: Date.now(),
      lastHeartbeat: this.lastHeartbeat,
      activeTask: this.activeTask?.id || null,
      messageQueueLength: this.messageQueue.length
    };

    return new Response(JSON.stringify(health), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Handle termination requests
   */
  protected async handleTerminateRequest(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    await this.terminate();
    return new Response(JSON.stringify({ status: 'terminated' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Core task processing method - to be implemented by specific agents
   */
  protected abstract processTask(task: AgentTask): Promise<TaskResult>;

  /**
   * Receive and queue messages from other agents
   */
  protected async receiveMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.push(message);
    await this.state.storage.put('messageQueue', this.messageQueue);
    
    // Process message immediately if agent is idle
    if (this.instance?.status === 'idle') {
      await this.processMessages();
    }
  }

  /**
   * Process queued messages
   */
  protected async processMessages(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      await this.handleMessage(message);
    }
    await this.state.storage.put('messageQueue', this.messageQueue);
  }

  /**
   * Handle individual messages - to be implemented by specific agents
   */
  protected abstract handleMessage(message: AgentMessage): Promise<void>;

  /**
   * Send message to another agent
   */
  protected async sendMessage(toAgentId: string, message: Omit<AgentMessage, 'id' | 'fromAgentId' | 'timestamp'>): Promise<void> {
    const fullMessage: AgentMessage = {
      id: crypto.randomUUID(),
      fromAgentId: this.instance!.id,
      timestamp: Date.now(),
      ...message,
      toAgentId
    };

    // Get the appropriate Durable Object namespace based on agent type
    const namespace = this.getAgentNamespace(toAgentId);
    if (!namespace) {
      throw new Error(`Unknown agent type for ID: ${toAgentId}`);
    }

    const agentStub = namespace.get(namespace.idFromString(toAgentId));
    
    try {
      await agentStub.fetch('https://agent/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullMessage)
      });
    } catch (error) {
      console.error(`Failed to send message to agent ${toAgentId}:`, error);
      throw error;
    }
  }

  /**
   * Get the appropriate Durable Object namespace for an agent
   */
  protected getAgentNamespace(agentId: string): DurableObjectNamespace | null {
    // This is a simplified mapping - in practice, you'd have a registry
    if (agentId.includes('coordinator')) return this.env.AGENT_COORDINATOR;
    if (agentId.includes('state-manager')) return this.env.STATE_MANAGER;
    if (agentId.includes('dashboard')) return this.env.INTEGRATION_DASHBOARD_AGENT;
    if (agentId.includes('review')) return this.env.REVIEW_MANAGER_AGENT;
    if (agentId.includes('context')) return this.env.CONTEXT_OPTIMIZER_AGENT;
    if (agentId.includes('pattern')) return this.env.PATTERN_BRIDGE_AGENT;
    if (agentId.includes('linear')) return this.env.LINEAR_STATE_AGENT;
    return null;
  }

  /**
   * Update agent status
   */
  protected async updateStatus(status: AgentStatus, metadata?: Record<string, any>): Promise<void> {
    if (!this.instance) return;

    this.instance.status = status;
    this.instance.lastHeartbeat = Date.now();
    
    if (metadata) {
      this.instance.metadata = { ...this.instance.metadata, ...metadata };
    }

    await this.state.storage.put('instance', this.instance);
  }

  /**
   * Get current health status
   */
  protected getHealthStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const now = Date.now();
    const timeSinceHeartbeat = now - this.lastHeartbeat;
    
    if (timeSinceHeartbeat > 300000) { // 5 minutes
      return 'unhealthy';
    } else if (timeSinceHeartbeat > 60000) { // 1 minute
      return 'degraded';
    }
    
    return 'healthy';
  }

  /**
   * Terminate agent and clean up resources
   */
  protected async terminate(): Promise<void> {
    await this.updateStatus('terminated');
    
    // Cancel active task if any
    if (this.activeTask) {
      // Notify coordinator about task cancellation
      // Implementation depends on coordination strategy
    }
    
    // Clear message queue
    this.messageQueue = [];
    await this.state.storage.put('messageQueue', this.messageQueue);
  }

  /**
   * Log metrics to Analytics Engine
   */
  protected async logMetrics(eventType: string, metrics: Record<string, number>, dimensions?: Record<string, string>): Promise<void> {
    try {
      this.env.METRICS.writeDataPoint({
        blobs: [
          this.instance?.id || 'unknown',
          this.instance?.type || 'unknown',
          eventType
        ],
        doubles: Object.values(metrics),
        indexes: [this.instance?.id || 'unknown']
      });
    } catch (error) {
      console.error('Failed to log metrics:', error);
    }
  }

  /**
   * Store logs in R2 bucket
   */
  protected async storeLogs(logData: any): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const key = `${this.instance?.type}/${this.instance?.id}/${timestamp}.json`;
      
      await this.env.LOGS_BUCKET.put(key, JSON.stringify(logData), {
        httpMetadata: {
          contentType: 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to store logs:', error);
    }
  }
}
