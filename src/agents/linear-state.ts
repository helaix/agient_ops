import { BaseAgent } from './base-agent';
import { AgentTask, TaskResult, AgentMessage, AgentConfig, LinearIssue, WorkflowState } from '../types';

/**
 * Linear State Agent - Synchronizes workflow state with Linear project management
 * 
 * Purpose: Synchronize workflow state with Linear project management
 * Key Capabilities:
 * - Linear API integration and synchronization
 * - Issue status tracking and updates
 * - Progress reporting and metrics
 * - Workflow-to-Linear mapping
 */
export class LinearStateAgent extends BaseAgent {
  private linearApiKey: string;
  private issueCache: Map<string, LinearIssue> = new Map();
  private workflowMappings: Map<string, string> = new Map(); // workflow ID -> Linear issue ID

  constructor(linearApiKey: string) {
    super();
    this.linearApiKey = linearApiKey;
  }

  protected async getDefaultConfig(): Promise<AgentConfig> {
    return {
      type: 'linear-state',
      name: 'Linear State Agent',
      description: 'Synchronizes workflow state with Linear project management',
      maxConcurrentTasks: 10,
      timeoutMs: 30000,
      retryAttempts: 3,
      capabilities: [
        'linear_api_integration',
        'issue_status_tracking',
        'progress_reporting',
        'workflow_mapping',
        'state_synchronization'
      ],
      dependencies: [
        'LINEAR_API_KEY'
      ]
    };
  }

  protected async onInitialize(): Promise<void> {
    // Set up event listeners for workflow state changes
    this.on('workflow_started', this.handleWorkflowStarted.bind(this));
    this.on('workflow_completed', this.handleWorkflowCompleted.bind(this));
    this.on('task_completed', this.handleTaskCompleted.bind(this));
    this.on('linear_sync_required', this.handleSyncRequired.bind(this));
  }

  protected async processTask(task: AgentTask): Promise<TaskResult> {
    switch (task.type) {
      case 'sync_issue_status':
        return await this.syncIssueStatus(task);
      case 'create_issue_mapping':
        return await this.createIssueMapping(task);
      case 'update_progress':
        return await this.updateProgress(task);
      case 'sync_all_issues':
        return await this.syncAllIssues(task);
      case 'generate_progress_report':
        return await this.generateProgressReport(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'workflow_state_update':
        await this.handleWorkflowStateUpdate(message.payload);
        break;
      case 'issue_status_query':
        await this.handleIssueStatusQuery(message);
        break;
      default:
        await super.handleMessage(message);
    }
  }

  // Task processing methods

  private async syncIssueStatus(task: AgentTask): Promise<TaskResult> {
    const { issueId, newStatus } = task.payload;
    
    try {
      const issue = await this.getLinearIssue(issueId);
      if (!issue) {
        throw new Error(`Issue ${issueId} not found`);
      }

      await this.updateLinearIssueStatus(issueId, newStatus);
      
      // Update cache
      this.issueCache.set(issueId, { ...issue, status: newStatus, updatedAt: new Date() });
      
      // Emit event for other agents
      await this.emitEvent('linear_sync_required', {
        issueId,
        oldStatus: issue.status,
        newStatus,
        timestamp: new Date()
      });

      return {
        taskId: task.id,
        success: true,
        data: { issueId, status: newStatus },
        completedAt: new Date(),
        duration: 0
      };
    } catch (error) {
      throw new Error(`Failed to sync issue status: ${(error as Error).message}`);
    }
  }

  private async createIssueMapping(task: AgentTask): Promise<TaskResult> {
    const { workflowId, issueId } = task.payload;
    
    this.workflowMappings.set(workflowId, issueId);
    
    return {
      taskId: task.id,
      success: true,
      data: { workflowId, issueId, mapped: true },
      completedAt: new Date(),
      duration: 0
    };
  }

  private async updateProgress(task: AgentTask): Promise<TaskResult> {
    const { workflowId, progress, metadata } = task.payload;
    
    const issueId = this.workflowMappings.get(workflowId);
    if (!issueId) {
      throw new Error(`No Linear issue mapped to workflow ${workflowId}`);
    }

    try {
      await this.updateLinearIssueProgress(issueId, progress, metadata);
      
      return {
        taskId: task.id,
        success: true,
        data: { workflowId, issueId, progress },
        completedAt: new Date(),
        duration: 0
      };
    } catch (error) {
      throw new Error(`Failed to update progress: ${(error as Error).message}`);
    }
  }

  private async syncAllIssues(task: AgentTask): Promise<TaskResult> {
    const { teamId } = task.payload;
    
    try {
      const issues = await this.getAllLinearIssues(teamId);
      
      // Update cache
      for (const issue of issues) {
        this.issueCache.set(issue.id, issue);
      }
      
      return {
        taskId: task.id,
        success: true,
        data: { syncedCount: issues.length, teamId },
        completedAt: new Date(),
        duration: 0
      };
    } catch (error) {
      throw new Error(`Failed to sync all issues: ${(error as Error).message}`);
    }
  }

  private async generateProgressReport(task: AgentTask): Promise<TaskResult> {
    const { workflowIds } = task.payload;
    
    const report = {
      totalWorkflows: workflowIds.length,
      mappedWorkflows: 0,
      completedWorkflows: 0,
      inProgressWorkflows: 0,
      blockedWorkflows: 0,
      issues: [] as any[]
    };

    for (const workflowId of workflowIds) {
      const issueId = this.workflowMappings.get(workflowId);
      if (issueId) {
        report.mappedWorkflows++;
        const issue = this.issueCache.get(issueId) || await this.getLinearIssue(issueId);
        
        if (issue) {
          report.issues.push({
            workflowId,
            issueId,
            title: issue.title,
            status: issue.status,
            assignee: issue.assignee,
            priority: issue.priority
          });

          switch (issue.status.toLowerCase()) {
            case 'completed':
            case 'done':
              report.completedWorkflows++;
              break;
            case 'in progress':
            case 'started':
              report.inProgressWorkflows++;
              break;
            case 'blocked':
              report.blockedWorkflows++;
              break;
          }
        }
      }
    }

    return {
      taskId: task.id,
      success: true,
      data: report,
      completedAt: new Date(),
      duration: 0
    };
  }

  // Event handlers

  private async handleWorkflowStarted(event: any): Promise<void> {
    const { workflowId, issueId } = event.data;
    if (issueId) {
      this.workflowMappings.set(workflowId, issueId);
      await this.updateLinearIssueStatus(issueId, 'In Progress');
    }
  }

  private async handleWorkflowCompleted(event: any): Promise<void> {
    const { workflowId } = event.data;
    const issueId = this.workflowMappings.get(workflowId);
    if (issueId) {
      await this.updateLinearIssueStatus(issueId, 'Completed');
    }
  }

  private async handleTaskCompleted(event: any): Promise<void> {
    const { workflowId, progress } = event.data;
    const issueId = this.workflowMappings.get(workflowId);
    if (issueId) {
      await this.updateLinearIssueProgress(issueId, progress);
    }
  }

  private async handleSyncRequired(event: any): Promise<void> {
    const { issueId } = event.data;
    // Refresh issue from Linear API
    const issue = await this.getLinearIssue(issueId);
    if (issue) {
      this.issueCache.set(issueId, issue);
    }
  }

  private async handleWorkflowStateUpdate(payload: any): Promise<void> {
    const { workflowId, state } = payload;
    const issueId = this.workflowMappings.get(workflowId);
    
    if (issueId) {
      await this.updateLinearIssueProgress(issueId, state.progress, state.metadata);
    }
  }

  private async handleIssueStatusQuery(message: AgentMessage): Promise<void> {
    const { issueId } = message.payload;
    const issue = this.issueCache.get(issueId) || await this.getLinearIssue(issueId);
    
    await this.sendMessage(message.from, 'issue_status_response', {
      issueId,
      issue,
      found: !!issue
    });
  }

  // Linear API integration methods

  private async getLinearIssue(issueId: string): Promise<LinearIssue | null> {
    try {
      // In a real implementation, this would make an actual API call to Linear
      // For now, we'll simulate the API response
      const response = await this.makeLinearApiCall('GET', `/issues/${issueId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get Linear issue ${issueId}:`, error);
      return null;
    }
  }

  private async getAllLinearIssues(teamId?: string): Promise<LinearIssue[]> {
    try {
      const endpoint = teamId ? `/teams/${teamId}/issues` : '/issues';
      const response = await this.makeLinearApiCall('GET', endpoint);
      return response.data.nodes || [];
    } catch (error) {
      console.error('Failed to get Linear issues:', error);
      return [];
    }
  }

  private async updateLinearIssueStatus(issueId: string, status: string): Promise<void> {
    try {
      await this.makeLinearApiCall('POST', '/issueUpdate', {
        id: issueId,
        stateId: await this.getStateIdForStatus(status)
      });
    } catch (error) {
      console.error(`Failed to update Linear issue ${issueId} status:`, error);
      throw error;
    }
  }

  private async updateLinearIssueProgress(issueId: string, progress: number, metadata?: any): Promise<void> {
    try {
      const description = metadata?.description || `Progress: ${Math.round(progress * 100)}%`;
      
      await this.makeLinearApiCall('POST', '/commentCreate', {
        issueId,
        body: description
      });
    } catch (error) {
      console.error(`Failed to update Linear issue ${issueId} progress:`, error);
      throw error;
    }
  }

  private async getStateIdForStatus(status: string): Promise<string> {
    // In a real implementation, this would map status names to Linear state IDs
    // For now, we'll return a mock state ID
    const statusMap: Record<string, string> = {
      'Todo': 'todo-state-id',
      'In Progress': 'in-progress-state-id',
      'Completed': 'completed-state-id',
      'Blocked': 'blocked-state-id'
    };
    
    return statusMap[status] || statusMap['Todo'];
  }

  private async makeLinearApiCall(method: string, endpoint: string, data?: any): Promise<any> {
    // Mock implementation - in a real system, this would make actual HTTP requests to Linear API
    console.log(`Linear API ${method} ${endpoint}`, data);
    
    // Simulate API response
    return {
      data: {
        id: 'mock-id',
        title: 'Mock Issue',
        description: 'Mock Description',
        status: 'In Progress',
        assignee: 'mock-user',
        priority: 1,
        labels: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  }

  // Public methods for other agents to use

  public async getIssueStatus(issueId: string): Promise<string | null> {
    const issue = this.issueCache.get(issueId) || await this.getLinearIssue(issueId);
    return issue?.status || null;
  }

  public async mapWorkflowToIssue(workflowId: string, issueId: string): Promise<void> {
    this.workflowMappings.set(workflowId, issueId);
  }

  public getWorkflowMapping(workflowId: string): string | undefined {
    return this.workflowMappings.get(workflowId);
  }
}

