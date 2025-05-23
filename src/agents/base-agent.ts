import { 
  AgentConfig, 
  AgentTask, 
  TaskResult, 
  AgentMessage, 
  AgentState, 
  AgentEvent,
  AgentEventType 
} from '../types';

/**
 * BaseAgent class that provides the foundational framework for all specialized agents
 * in the multi-agent workflow system.
 */
export abstract class BaseAgent {
  protected config: AgentConfig;
  protected state: AgentState;
  protected eventHandlers: Map<AgentEventType, Function[]> = new Map();

  constructor(config?: Partial<AgentConfig>) {
    this.state = {
      id: this.generateId(),
      status: 'idle',
      currentTasks: [],
      completedTasks: 0,
      errorCount: 0,
      lastActivity: new Date()
    };
  }

  /**
   * Initialize the agent with configuration
   */
  async initialize(): Promise<void> {
    this.config = await this.getDefaultConfig();
    await this.onInitialize();
  }

  /**
   * Get the default configuration for this agent type
   * Must be implemented by each specific agent
   */
  protected abstract getDefaultConfig(): Promise<AgentConfig>;

  /**
   * Process a specific task assigned to this agent
   * Must be implemented by each specific agent
   */
  protected abstract processTask(task: AgentTask): Promise<TaskResult>;

  /**
   * Handle incoming messages from other agents
   * Can be overridden by specific agents for custom message handling
   */
  protected async handleMessage(message: AgentMessage): Promise<void> {
    // Default implementation - can be overridden
    console.log(`Agent ${this.config.name} received message:`, message);
  }

  /**
   * Hook called during agent initialization
   * Can be overridden by specific agents for custom initialization
   */
  protected async onInitialize(): Promise<void> {
    // Default implementation - can be overridden
  }

  /**
   * Execute a task with error handling and retry logic
   */
  async executeTask(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    
    try {
      this.updateState('busy');
      this.state.currentTasks.push(task);
      
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
        try {
          const result = await Promise.race([
            this.processTask(task),
            this.createTimeoutPromise(task.id)
          ]);
          
          // Task completed successfully
          this.state.completedTasks++;
          this.removeCurrentTask(task.id);
          this.updateState('idle');
          
          return {
            taskId: task.id,
            success: true,
            data: result.data,
            metadata: result.metadata,
            completedAt: new Date(),
            duration: Date.now() - startTime
          };
          
        } catch (error) {
          lastError = error as Error;
          console.warn(`Agent ${this.config.name} task ${task.id} attempt ${attempt} failed:`, error);
          
          if (attempt < this.config.retryAttempts) {
            await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
          }
        }
      }
      
      // All attempts failed
      this.state.errorCount++;
      this.removeCurrentTask(task.id);
      this.updateState('error');
      
      return {
        taskId: task.id,
        success: false,
        error: lastError?.message || 'Unknown error',
        completedAt: new Date(),
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      this.state.errorCount++;
      this.removeCurrentTask(task.id);
      this.updateState('error');
      
      return {
        taskId: task.id,
        success: false,
        error: (error as Error).message,
        completedAt: new Date(),
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Send a message to another agent
   */
  async sendMessage(to: string, type: string, payload: any): Promise<void> {
    const message: AgentMessage = {
      id: this.generateId(),
      from: this.state.id,
      to,
      type,
      payload,
      timestamp: new Date()
    };
    
    // In a real implementation, this would use the message bus
    await this.handleMessage(message);
  }

  /**
   * Emit an event to the system
   */
  async emitEvent(type: AgentEventType, data: any, target?: string): Promise<void> {
    const event: AgentEvent = {
      type,
      source: this.state.id,
      target,
      data,
      timestamp: new Date()
    };
    
    // Trigger local event handlers
    const handlers = this.eventHandlers.get(type) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${type}:`, error);
      }
    }
  }

  /**
   * Subscribe to specific event types
   */
  on(eventType: AgentEventType, handler: (event: AgentEvent) => Promise<void>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Get current agent state
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Check if agent can accept new tasks
   */
  canAcceptTask(): boolean {
    return this.state.status === 'idle' && 
           this.state.currentTasks.length < this.config.maxConcurrentTasks;
  }

  /**
   * Pause the agent
   */
  async pause(): Promise<void> {
    this.updateState('paused');
  }

  /**
   * Resume the agent
   */
  async resume(): Promise<void> {
    this.updateState('idle');
  }

  // Private helper methods

  private updateState(status: AgentState['status']): void {
    this.state.status = status;
    this.state.lastActivity = new Date();
  }

  private removeCurrentTask(taskId: string): void {
    this.state.currentTasks = this.state.currentTasks.filter(t => t.id !== taskId);
  }

  private createTimeoutPromise(taskId: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Task ${taskId} timed out after ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

