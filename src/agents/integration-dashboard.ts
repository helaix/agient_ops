import { BaseAgent } from './base-agent';
import { AgentTask, TaskResult, AgentMessage, AgentConfig, WorkflowState, AgentState } from '../types';

/**
 * Integration Dashboard Agent - Centralized workflow monitoring and coordination hub
 * 
 * Purpose: Centralized workflow monitoring and coordination hub
 * Key Capabilities:
 * - Status aggregation across multiple workflows
 * - Progress tracking and visualization
 * - Bottleneck detection and reporting
 * - Cross-workflow coordination
 */
export class IntegrationDashboardAgent extends BaseAgent {
  private workflows: Map<string, WorkflowState> = new Map();
  private agents: Map<string, AgentState> = new Map();
  private bottlenecks: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: Date;
    resolved: boolean;
  }> = [];
  private metrics: {
    totalWorkflows: number;
    activeWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
    averageCompletionTime: number;
    bottleneckCount: number;
  } = {
    totalWorkflows: 0,
    activeWorkflows: 0,
    completedWorkflows: 0,
    failedWorkflows: 0,
    averageCompletionTime: 0,
    bottleneckCount: 0
  };

  protected async getDefaultConfig(): Promise<AgentConfig> {
    return {
      type: 'integration-dashboard',
      name: 'Integration Dashboard Agent',
      description: 'Centralized workflow monitoring and coordination hub',
      maxConcurrentTasks: 20,
      timeoutMs: 15000,
      retryAttempts: 3,
      capabilities: [
        'status_aggregation',
        'progress_tracking',
        'bottleneck_detection',
        'cross_workflow_coordination',
        'real_time_monitoring',
        'performance_analytics'
      ],
      dependencies: []
    };
  }

  protected async onInitialize(): Promise<void> {
    // Set up event listeners for workflow and agent events
    this.on('workflow_started', this.handleWorkflowStarted.bind(this));
    this.on('workflow_completed', this.handleWorkflowCompleted.bind(this));
    this.on('task_completed', this.handleTaskCompleted.bind(this));
    this.on('task_failed', this.handleTaskFailed.bind(this));
    this.on('status_update', this.handleStatusUpdate.bind(this));
    this.on('bottleneck_detected', this.handleBottleneckDetected.bind(this));

    // Start periodic monitoring
    this.startPeriodicMonitoring();
  }

  protected async processTask(task: AgentTask): Promise<TaskResult> {
    switch (task.type) {
      case 'aggregate_status':
        return await this.aggregateStatus(task);
      case 'generate_dashboard':
        return await this.generateDashboard(task);
      case 'detect_bottlenecks':
        return await this.detectBottlenecks(task);
      case 'coordinate_workflows':
        return await this.coordinateWorkflows(task);
      case 'get_metrics':
        return await this.getMetrics(task);
      case 'resolve_bottleneck':
        return await this.resolveBottleneck(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'register_workflow':
        await this.registerWorkflow(message.payload);
        break;
      case 'register_agent':
        await this.registerAgent(message.payload);
        break;
      case 'workflow_status_query':
        await this.handleWorkflowStatusQuery(message);
        break;
      case 'dashboard_data_request':
        await this.handleDashboardDataRequest(message);
        break;
      default:
        await super.handleMessage(message);
    }
  }

  // Task processing methods

  private async aggregateStatus(task: AgentTask): Promise<TaskResult> {
    const { workflowIds } = task.payload;
    
    const aggregatedStatus = {
      timestamp: new Date(),
      workflows: [] as any[],
      summary: {
        total: 0,
        running: 0,
        completed: 0,
        failed: 0,
        paused: 0
      }
    };

    for (const workflowId of workflowIds || Array.from(this.workflows.keys())) {
      const workflow = this.workflows.get(workflowId);
      if (workflow) {
        aggregatedStatus.workflows.push({
          id: workflowId,
          status: workflow.status,
          progress: workflow.progress,
          startedAt: workflow.startedAt,
          completedAt: workflow.completedAt,
          metadata: workflow.metadata
        });

        aggregatedStatus.summary.total++;
        switch (workflow.status) {
          case 'running':
            aggregatedStatus.summary.running++;
            break;
          case 'completed':
            aggregatedStatus.summary.completed++;
            break;
          case 'failed':
            aggregatedStatus.summary.failed++;
            break;
          case 'paused':
            aggregatedStatus.summary.paused++;
            break;
        }
      }
    }

    return {
      taskId: task.id,
      success: true,
      data: aggregatedStatus,
      completedAt: new Date(),
      duration: 0
    };
  }

  private async generateDashboard(task: AgentTask): Promise<TaskResult> {
    const dashboard = {
      timestamp: new Date(),
      metrics: { ...this.metrics },
      workflows: Array.from(this.workflows.values()),
      agents: Array.from(this.agents.values()),
      bottlenecks: this.bottlenecks.filter(b => !b.resolved),
      recentActivity: await this.getRecentActivity(),
      performance: await this.calculatePerformanceMetrics()
    };

    return {
      taskId: task.id,
      success: true,
      data: dashboard,
      completedAt: new Date(),
      duration: 0
    };
  }

  private async detectBottlenecks(task: AgentTask): Promise<TaskResult> {
    const detectedBottlenecks = [];

    // Detect workflow bottlenecks
    for (const [workflowId, workflow] of this.workflows) {
      if (workflow.status === 'running' && workflow.startedAt) {
        const runningTime = Date.now() - workflow.startedAt.getTime();
        const expectedTime = workflow.metadata.expectedDuration || 3600000; // 1 hour default

        if (runningTime > expectedTime * 1.5) {
          detectedBottlenecks.push({
            id: `workflow-${workflowId}-timeout`,
            type: 'workflow_timeout',
            severity: 'high' as const,
            description: `Workflow ${workflowId} is taking longer than expected`,
            detectedAt: new Date(),
            resolved: false,
            workflowId
          });
        }
      }
    }

    // Detect agent bottlenecks
    for (const [agentId, agent] of this.agents) {
      if (agent.status === 'busy' && agent.currentTasks.length > 5) {
        detectedBottlenecks.push({
          id: `agent-${agentId}-overload`,
          type: 'agent_overload',
          severity: 'medium' as const,
          description: `Agent ${agentId} has too many concurrent tasks`,
          detectedAt: new Date(),
          resolved: false,
          agentId
        });
      }

      if (agent.errorCount > 3) {
        detectedBottlenecks.push({
          id: `agent-${agentId}-errors`,
          type: 'agent_errors',
          severity: 'high' as const,
          description: `Agent ${agentId} has high error rate`,
          detectedAt: new Date(),
          resolved: false,
          agentId
        });
      }
    }

    // Add to bottlenecks list
    for (const bottleneck of detectedBottlenecks) {
      if (!this.bottlenecks.find(b => b.id === bottleneck.id)) {
        this.bottlenecks.push(bottleneck);
        this.metrics.bottleneckCount++;

        // Emit bottleneck detected event
        await this.emitEvent('bottleneck_detected', bottleneck);
      }
    }

    return {
      taskId: task.id,
      success: true,
      data: { detectedBottlenecks, totalBottlenecks: this.bottlenecks.length },
      completedAt: new Date(),
      duration: 0
    };
  }

  private async coordinateWorkflows(task: AgentTask): Promise<TaskResult> {
    const { action, workflowIds } = task.payload;
    const results = [];

    for (const workflowId of workflowIds) {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) continue;

      switch (action) {
        case 'pause':
          workflow.status = 'paused';
          break;
        case 'resume':
          if (workflow.status === 'paused') {
            workflow.status = 'running';
          }
          break;
        case 'prioritize':
          workflow.metadata.priority = 'high';
          break;
        case 'deprioritize':
          workflow.metadata.priority = 'low';
          break;
      }

      results.push({ workflowId, action, success: true });
      
      // Emit coordination event
      await this.emitEvent('workflow_coordinated', {
        workflowId,
        action,
        timestamp: new Date()
      });
    }

    return {
      taskId: task.id,
      success: true,
      data: { results },
      completedAt: new Date(),
      duration: 0
    };
  }

  private async getMetrics(task: AgentTask): Promise<TaskResult> {
    const enhancedMetrics = {
      ...this.metrics,
      timestamp: new Date(),
      agentMetrics: {
        totalAgents: this.agents.size,
        activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'busy').length,
        idleAgents: Array.from(this.agents.values()).filter(a => a.status === 'idle').length,
        errorAgents: Array.from(this.agents.values()).filter(a => a.status === 'error').length
      },
      workflowMetrics: {
        totalWorkflows: this.workflows.size,
        runningWorkflows: Array.from(this.workflows.values()).filter(w => w.status === 'running').length,
        completedWorkflows: Array.from(this.workflows.values()).filter(w => w.status === 'completed').length,
        failedWorkflows: Array.from(this.workflows.values()).filter(w => w.status === 'failed').length
      }
    };

    return {
      taskId: task.id,
      success: true,
      data: enhancedMetrics,
      completedAt: new Date(),
      duration: 0
    };
  }

  private async resolveBottleneck(task: AgentTask): Promise<TaskResult> {
    const { bottleneckId, resolution } = task.payload;
    
    const bottleneck = this.bottlenecks.find(b => b.id === bottleneckId);
    if (!bottleneck) {
      throw new Error(`Bottleneck ${bottleneckId} not found`);
    }

    bottleneck.resolved = true;
    (bottleneck as any).resolvedAt = new Date();
    (bottleneck as any).resolution = resolution;

    return {
      taskId: task.id,
      success: true,
      data: { bottleneckId, resolved: true, resolution },
      completedAt: new Date(),
      duration: 0
    };
  }

  // Event handlers

  private async handleWorkflowStarted(event: any): Promise<void> {
    const { workflowId, metadata } = event.data;
    
    this.workflows.set(workflowId, {
      id: workflowId,
      status: 'running',
      progress: 0,
      startedAt: new Date(),
      metadata: metadata || {}
    });

    this.metrics.totalWorkflows++;
    this.metrics.activeWorkflows++;
  }

  private async handleWorkflowCompleted(event: any): Promise<void> {
    const { workflowId, duration } = event.data;
    
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'completed';
      workflow.progress = 1;
      workflow.completedAt = new Date();
      
      this.metrics.activeWorkflows--;
      this.metrics.completedWorkflows++;
      
      // Update average completion time
      this.updateAverageCompletionTime(duration);
    }
  }

  private async handleTaskCompleted(event: any): Promise<void> {
    const { workflowId, progress } = event.data;
    
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === 'running') {
      workflow.progress = progress || workflow.progress;
    }
  }

  private async handleTaskFailed(event: any): Promise<void> {
    const { workflowId } = event.data;
    
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'failed';
      workflow.completedAt = new Date();
      
      this.metrics.activeWorkflows--;
      this.metrics.failedWorkflows++;
    }
  }

  private async handleStatusUpdate(event: any): Promise<void> {
    const { agentId, status, state } = event.data;
    
    if (state) {
      this.agents.set(agentId, state);
    }
  }

  private async handleBottleneckDetected(event: any): Promise<void> {
    // Bottleneck already added in detectBottlenecks method
    // This handler can be used for additional processing or notifications
    console.log('Bottleneck detected:', event.data);
  }

  // Message handlers

  private async registerWorkflow(payload: any): Promise<void> {
    const { workflowId, metadata } = payload;
    
    if (!this.workflows.has(workflowId)) {
      this.workflows.set(workflowId, {
        id: workflowId,
        status: 'pending',
        progress: 0,
        metadata: metadata || {}
      });
    }
  }

  private async registerAgent(payload: any): Promise<void> {
    const { agentId, state } = payload;
    this.agents.set(agentId, state);
  }

  private async handleWorkflowStatusQuery(message: AgentMessage): Promise<void> {
    const { workflowId } = message.payload;
    const workflow = this.workflows.get(workflowId);
    
    await this.sendMessage(message.from, 'workflow_status_response', {
      workflowId,
      workflow,
      found: !!workflow
    });
  }

  private async handleDashboardDataRequest(message: AgentMessage): Promise<void> {
    const dashboardData = await this.generateDashboard({
      id: 'dashboard-request',
      type: 'generate_dashboard',
      priority: 1,
      payload: {},
      createdAt: new Date()
    });
    
    await this.sendMessage(message.from, 'dashboard_data_response', dashboardData.data);
  }

  // Helper methods

  private startPeriodicMonitoring(): void {
    // Run bottleneck detection every 5 minutes
    setInterval(async () => {
      try {
        await this.detectBottlenecks({
          id: 'periodic-bottleneck-detection',
          type: 'detect_bottlenecks',
          priority: 1,
          payload: {},
          createdAt: new Date()
        });
      } catch (error) {
        console.error('Error in periodic bottleneck detection:', error);
      }
    }, 5 * 60 * 1000);
  }

  private async getRecentActivity(): Promise<any[]> {
    // In a real implementation, this would fetch recent activity from a log or event store
    return [
      {
        timestamp: new Date(),
        type: 'workflow_started',
        description: 'New workflow initiated'
      }
    ];
  }

  private async calculatePerformanceMetrics(): Promise<any> {
    const completedWorkflows = Array.from(this.workflows.values())
      .filter(w => w.status === 'completed' && w.startedAt && w.completedAt);

    const totalDuration = completedWorkflows.reduce((sum, w) => {
      return sum + (w.completedAt!.getTime() - w.startedAt!.getTime());
    }, 0);

    return {
      averageCompletionTime: completedWorkflows.length > 0 ? totalDuration / completedWorkflows.length : 0,
      throughput: completedWorkflows.length,
      successRate: this.metrics.totalWorkflows > 0 ? 
        this.metrics.completedWorkflows / this.metrics.totalWorkflows : 0
    };
  }

  private updateAverageCompletionTime(duration: number): void {
    const currentAvg = this.metrics.averageCompletionTime;
    const completedCount = this.metrics.completedWorkflows;
    
    this.metrics.averageCompletionTime = 
      (currentAvg * (completedCount - 1) + duration) / completedCount;
  }

  // Public methods for other agents

  public getWorkflowStatus(workflowId: string): WorkflowState | undefined {
    return this.workflows.get(workflowId);
  }

  public getAllWorkflows(): WorkflowState[] {
    return Array.from(this.workflows.values());
  }

  public getActiveBottlenecks(): any[] {
    return this.bottlenecks.filter(b => !b.resolved);
  }

  public getCurrentMetrics(): any {
    return { ...this.metrics };
  }
}

