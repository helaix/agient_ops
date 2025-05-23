// Core type definitions for the multi-agent workflow system

export interface AgentConfig {
  type: string;
  name: string;
  description: string;
  maxConcurrentTasks: number;
  timeoutMs: number;
  retryAttempts: number;
  capabilities: string[];
  dependencies: string[];
}

export interface AgentTask {
  id: string;
  type: string;
  priority: number;
  payload: any;
  metadata?: Record<string, any>;
  createdAt: Date;
  deadline?: Date;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
  completedAt: Date;
  duration: number;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: string;
  payload: any;
  timestamp: Date;
}

export interface AgentState {
  id: string;
  status: 'idle' | 'busy' | 'error' | 'paused';
  currentTasks: AgentTask[];
  completedTasks: number;
  errorCount: number;
  lastActivity: Date;
}

export interface WorkflowState {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}

export interface ReviewMetrics {
  averageReviewTime: number;
  reviewQualityScore: number;
  escalationRate: number;
  reviewerWorkload: Record<string, number>;
}

export interface ContextSwitchEvent {
  timestamp: Date;
  fromContext: string;
  toContext: string;
  duration: number;
  reason: string;
}

export interface ProductivityMetrics {
  focusTime: number;
  contextSwitches: number;
  taskCompletionRate: number;
  timeBlocks: Array<{
    start: Date;
    end: Date;
    context: string;
    productivity: number;
  }>;
}

export interface WorkflowPattern {
  id: string;
  name: string;
  description: string;
  applicability: string[];
  effectiveness: number;
  usageCount: number;
  lastUsed: Date;
  components: Array<{
    type: string;
    config: any;
  }>;
}

export interface LinearIssue {
  id: string;
  title: string;
  description: string;
  status: string;
  assignee?: string;
  priority: number;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubPR {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'merged';
  author: string;
  reviewers: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Event types for inter-agent communication
export type AgentEventType = 
  | 'task_assigned'
  | 'task_completed'
  | 'task_failed'
  | 'status_update'
  | 'workflow_started'
  | 'workflow_completed'
  | 'bottleneck_detected'
  | 'pattern_applied'
  | 'context_switch_detected'
  | 'review_assigned'
  | 'review_completed'
  | 'linear_sync_required';

export interface AgentEvent {
  type: AgentEventType;
  source: string;
  target?: string;
  data: any;
  timestamp: Date;
}

