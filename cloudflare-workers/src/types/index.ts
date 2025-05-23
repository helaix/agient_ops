// Core Types for Enhanced Multi-Agent Workflow System

export interface Env {
  // Durable Object bindings
  AGENT_COORDINATOR: DurableObjectNamespace;
  STATE_MANAGER: DurableObjectNamespace;
  INTEGRATION_DASHBOARD_AGENT: DurableObjectNamespace;
  REVIEW_MANAGER_AGENT: DurableObjectNamespace;
  CONTEXT_OPTIMIZER_AGENT: DurableObjectNamespace;
  PATTERN_BRIDGE_AGENT: DurableObjectNamespace;
  LINEAR_STATE_AGENT: DurableObjectNamespace;
  
  // Storage bindings
  CONFIG_KV: KVNamespace;
  LOGS_BUCKET: R2Bucket;
  METRICS: AnalyticsEngineDataset;
  
  // Environment variables
  ENVIRONMENT: string;
  LINEAR_API_KEY?: string;
  GITHUB_TOKEN?: string;
  SLACK_TOKEN?: string;
}

export type AgentType = 
  | 'integration-dashboard'
  | 'review-manager'
  | 'context-optimizer'
  | 'pattern-bridge'
  | 'linear-state'
  | 'state-manager';

export type AgentStatus = 'idle' | 'active' | 'paused' | 'error' | 'terminated';

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AgentConfig {
  type: AgentType;
  name: string;
  description?: string;
  maxConcurrentTasks: number;
  timeoutMs: number;
  retryAttempts: number;
  capabilities: string[];
  dependencies: string[];
}

export interface AgentInstance {
  id: string;
  type: AgentType;
  config: AgentConfig;
  status: AgentStatus;
  currentTasks: string[];
  lastHeartbeat: number;
  createdAt: number;
  metadata: Record<string, any>;
}

export interface AgentTask {
  id: string;
  type: string;
  priority: TaskPriority;
  payload: Record<string, any>;
  context: TaskContext;
  createdAt: number;
  scheduledAt?: number;
  startedAt?: number;
  completedAt?: number;
  timeoutAt?: number;
  retryCount: number;
  maxRetries: number;
}

export interface TaskContext {
  workflowId: string;
  parentTaskId?: string;
  userId?: string;
  linearIssueId?: string;
  githubPrId?: string;
  metadata: Record<string, any>;
}

export interface TaskResult {
  taskId: string;
  status: 'success' | 'failure' | 'retry';
  result?: any;
  error?: string;
  metrics?: TaskMetrics;
  nextTasks?: AgentTask[];
}

export interface TaskMetrics {
  executionTimeMs: number;
  memoryUsageMB?: number;
  apiCallsCount: number;
  errorCount: number;
  retryCount: number;
}

export interface WorkflowState {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  priority: TaskPriority;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  estimatedDurationMs?: number;
  actualDurationMs?: number;
  progress: WorkflowProgress;
  context: WorkflowContext;
  tasks: Record<string, AgentTask>;
  agents: Record<string, string>; // agentId -> instanceId
  dependencies: WorkflowDependency[];
  metadata: Record<string, any>;
}

export interface WorkflowProgress {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  activeAgents: number;
  estimatedCompletion?: number;
  bottlenecks: string[];
  metrics: WorkflowMetrics;
}

export interface WorkflowMetrics {
  averageTaskDuration: number;
  agentUtilization: Record<string, number>;
  errorRate: number;
  throughput: number;
  costEstimate?: number;
}

export interface WorkflowContext {
  userId: string;
  linearIssueId?: string;
  githubRepoId?: string;
  slackChannelId?: string;
  parentWorkflowId?: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface WorkflowDependency {
  id: string;
  type: 'task' | 'workflow' | 'external';
  dependsOn: string;
  condition?: string;
  timeout?: number;
}

export interface AgentMessage {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  type: 'task' | 'status' | 'error' | 'coordination' | 'data';
  payload: any;
  timestamp: number;
  correlationId?: string;
  replyTo?: string;
}

export interface CoordinationStrategy {
  id: string;
  name: string;
  description: string;
  applicability: string[];
  implementation: string;
  parameters: Record<string, any>;
  effectiveness: number;
  usageCount: number;
  lastUsed: number;
}

export interface WorkflowPattern {
  id: string;
  name: string;
  description: string;
  category: 'coordination' | 'optimization' | 'recovery' | 'scaling';
  triggers: string[];
  actions: PatternAction[];
  conditions: string[];
  effectiveness: number;
  confidence: number;
}

export interface PatternAction {
  type: 'spawn-agent' | 'adjust-priority' | 'redistribute-tasks' | 'scale-resources';
  parameters: Record<string, any>;
  condition?: string;
  delay?: number;
}

export interface EventData {
  id: string;
  type: string;
  source: 'github' | 'linear' | 'slack' | 'internal';
  timestamp: number;
  payload: any;
  metadata: Record<string, any>;
}

export interface WebhookEvent extends EventData {
  signature?: string;
  headers: Record<string, string>;
  rawBody: string;
}

export interface AnalyticsEvent {
  timestamp: number;
  workflowId?: string;
  agentId?: string;
  taskId?: string;
  eventType: string;
  metrics: Record<string, number>;
  dimensions: Record<string, string>;
}

export interface HealthCheck {
  timestamp: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, ComponentHealth>;
  metrics: SystemMetrics;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: number;
  errorCount: number;
  responseTime: number;
  details?: string;
}

export interface SystemMetrics {
  activeWorkflows: number;
  activeAgents: number;
  queuedTasks: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  resourceUtilization: number;
}

// State Management Types for State Manager Durable Object

export interface StateVersion {
  id: string;
  workflowId: string;
  version: number;
  state: WorkflowState;
  timestamp: number;
  author: string; // Agent ID that created this version
  parentVersion?: string;
  changeDescription: string;
  checksum: string;
}

export interface StateChange {
  id: string;
  workflowId: string;
  type: 'task-update' | 'agent-status' | 'workflow-status' | 'metadata-update';
  path: string; // JSON path to changed property
  oldValue: any;
  newValue: any;
  timestamp: number;
  agentId: string;
}

export interface StateConflict {
  id: string;
  workflowId: string;
  conflictingChanges: StateChange[];
  detectedAt: number;
  resolutionStrategy: 'last-write-wins' | 'merge' | 'manual';
  status: 'pending' | 'resolved' | 'failed';
}

export interface StateSnapshot {
  id: string;
  workflowId: string;
  state: WorkflowState;
  createdAt: number;
  description: string;
  size: number;
  checksum: string;
}

export interface StateSubscription {
  id: string;
  workflowId: string;
  agentId: string;
  eventTypes: StateChangeType[];
  createdAt: number;
  lastNotified?: number;
}

export type StateChangeType = 'task-update' | 'agent-status' | 'workflow-status' | 'metadata-update' | 'all';

export interface StateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checksum: string;
}

export interface StateArchivePolicy {
  maxVersionsPerWorkflow: number;
  archiveAfterDays: number;
  compressionEnabled: boolean;
  r2ArchiveEnabled: boolean;
}

export interface StateMetrics {
  totalStates: number;
  activeWorkflows: number;
  versionsCreated: number;
  conflictsResolved: number;
  snapshotsCreated: number;
  averageStateSize: number;
  averageRetrievalTime: number;
  averagePersistenceTime: number;
}
