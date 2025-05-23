import { BaseAgent } from './base-agent';
import { 
  AgentTask, 
  TaskResult, 
  AgentMessage, 
  AgentConfig,
  WorkflowState,
  StateVersion,
  StateChange,
  StateConflict,
  StateSnapshot,
  StateSubscription,
  StateChangeType,
  StateValidationResult,
  StateArchivePolicy,
  StateMetrics,
  Env 
} from '@/types';

/**
 * State Manager Durable Object
 * 
 * Centralized state management for multi-agent workflows:
 * - Workflow state persistence with versioning
 * - Cross-agent state synchronization
 * - State recovery and backup mechanisms
 * - Performance optimization for large workflows
 * - Conflict resolution for concurrent updates
 */
export class StateManager extends BaseAgent {
  private stateVersions: Map<string, StateVersion[]> = new Map();
  private activeStates: Map<string, WorkflowState> = new Map();
  private stateSubscriptions: Map<string, Set<string>> = new Map();
  private conflictResolutionQueue: StateConflict[] = [];
  private archivePolicy: StateArchivePolicy;
  private metrics: StateMetrics;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    
    // Initialize default archive policy
    this.archivePolicy = {
      maxVersionsPerWorkflow: 100,
      archiveAfterDays: 30,
      compressionEnabled: true,
      r2ArchiveEnabled: true
    };

    // Initialize metrics
    this.metrics = {
      totalStates: 0,
      activeWorkflows: 0,
      versionsCreated: 0,
      conflictsResolved: 0,
      snapshotsCreated: 0,
      averageStateSize: 0,
      averageRetrievalTime: 0,
      averagePersistenceTime: 0
    };
  }

  protected async getDefaultConfig(): Promise<AgentConfig> {
    return {
      type: 'state-manager',
      name: 'State Manager',
      description: 'Centralized workflow state management',
      maxConcurrentTasks: 1000,
      timeoutMs: 30000,
      retryAttempts: 5,
      capabilities: [
        'state-persistence',
        'version-control',
        'conflict-resolution',
        'state-synchronization',
        'backup-recovery'
      ],
      dependencies: []
    };
  }

  /**
   * Initialize state manager with existing data
   */
  protected async initializeInstance(): Promise<void> {
    await super.initializeInstance();
    
    // Load existing state data
    const storedVersions = await this.state.storage.get<Record<string, StateVersion[]>>('stateVersions') || {};
    const storedActiveStates = await this.state.storage.get<Record<string, WorkflowState>>('activeStates') || {};
    const storedSubscriptions = await this.state.storage.get<Record<string, string[]>>('stateSubscriptions') || {};
    const storedConflicts = await this.state.storage.get<StateConflict[]>('conflictQueue') || [];
    const storedPolicy = await this.state.storage.get<StateArchivePolicy>('archivePolicy');
    const storedMetrics = await this.state.storage.get<StateMetrics>('metrics');
    
    this.stateVersions = new Map(Object.entries(storedVersions));
    this.activeStates = new Map(Object.entries(storedActiveStates));
    this.conflictResolutionQueue = storedConflicts;
    
    // Convert subscriptions format
    this.stateSubscriptions = new Map();
    for (const [workflowId, agentIds] of Object.entries(storedSubscriptions)) {
      this.stateSubscriptions.set(workflowId, new Set(agentIds));
    }
    
    if (storedPolicy) {
      this.archivePolicy = storedPolicy;
    }
    
    if (storedMetrics) {
      this.metrics = storedMetrics;
    }

    // Update metrics
    this.metrics.activeWorkflows = this.activeStates.size;
    this.metrics.totalStates = Array.from(this.stateVersions.values()).reduce((sum, versions) => sum + versions.length, 0);
  }

  /**
   * Process state management tasks
   */
  protected async processTask(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    
    try {
      await this.updateStatus('active', { currentTask: task.id });
      
      let result: any;
      
      switch (task.type) {
        case 'persist-state':
          result = await this.persistWorkflowState(task.payload.workflowId, task.payload.state, task.payload.author, task.payload.changeDescription);
          break;
        case 'get-state':
          result = await this.getWorkflowState(task.payload.workflowId, task.payload.version);
          break;
        case 'get-history':
          result = await this.getWorkflowHistory(task.payload.workflowId);
          break;
        case 'subscribe-changes':
          result = await this.subscribeToStateChanges(task.payload.workflowId, task.payload.agentId);
          break;
        case 'create-snapshot':
          result = await this.createStateSnapshot(task.payload.workflowId, task.payload.description);
          break;
        case 'restore-snapshot':
          result = await this.restoreFromSnapshot(task.payload.workflowId, task.payload.snapshotId);
          break;
        case 'resolve-conflict':
          result = await this.resolveStateConflict(task.payload.conflictId);
          break;
        case 'validate-state':
          result = await this.validateState(task.payload.workflowId, task.payload.state);
          break;
        case 'archive-old-versions':
          result = await this.archiveOldVersions();
          break;
        case 'get-metrics':
          result = await this.getStateMetrics();
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      const executionTime = Date.now() - startTime;
      
      await this.logMetrics('task_completed', {
        execution_time: executionTime,
        task_type: task.type === 'persist-state' ? 1 : 0
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
      case 'data':
        await this.handleStateChangeNotification(message);
        break;
      case 'coordination':
        await this.handleCoordinationRequest(message);
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  // Core State Management Methods

  /**
   * Persist workflow state with versioning
   */
  async persistWorkflowState(workflowId: string, state: WorkflowState, author: string = 'system', changeDescription: string = 'State update'): Promise<StateVersion> {
    const startTime = Date.now();
    
    try {
      // Validate state integrity
      const validation = await this.validateState(workflowId, state);
      if (!validation.isValid) {
        throw new Error(`State validation failed: ${validation.errors.join(', ')}`);
      }

      // Get current versions for this workflow
      const versions = this.stateVersions.get(workflowId) || [];
      const currentVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version)) : 0;
      
      // Check for conflicts
      const currentState = this.activeStates.get(workflowId);
      if (currentState && currentState.updatedAt && state.updatedAt && currentState.updatedAt > state.updatedAt) {
        await this.detectAndQueueConflict(workflowId, currentState, state, author);
      }

      // Create new version
      const newVersion: StateVersion = {
        id: crypto.randomUUID(),
        workflowId,
        version: currentVersion + 1,
        state: { ...state, updatedAt: Date.now() },
        timestamp: Date.now(),
        author,
        parentVersion: versions.length > 0 ? versions[versions.length - 1].id : undefined,
        changeDescription,
        checksum: validation.checksum
      };

      // Store version
      versions.push(newVersion);
      this.stateVersions.set(workflowId, versions);
      
      // Update active state
      this.activeStates.set(workflowId, newVersion.state);
      
      // Persist to storage with atomic operation
      await this.atomicStateUpdate(workflowId, newVersion);
      
      // Notify subscribers
      await this.broadcastStateChange(workflowId, {
        id: crypto.randomUUID(),
        workflowId,
        type: 'workflow-status',
        path: '/',
        oldValue: currentState,
        newValue: newVersion.state,
        timestamp: Date.now(),
        agentId: author
      });

      // Update metrics
      this.metrics.versionsCreated++;
      this.metrics.averagePersistenceTime = (this.metrics.averagePersistenceTime + (Date.now() - startTime)) / 2;
      await this.persistMetrics();

      // Check if archiving is needed
      if (versions.length > this.archivePolicy.maxVersionsPerWorkflow) {
        await this.scheduleArchiving(workflowId);
      }

      return newVersion;
    } catch (error) {
      console.error('Failed to persist workflow state:', error);
      throw error;
    }
  }

  /**
   * Get workflow state by ID and optional version
   */
  async getWorkflowState(workflowId: string, version?: string): Promise<WorkflowState | null> {
    const startTime = Date.now();
    
    try {
      if (!version) {
        // Return current active state
        const state = this.activeStates.get(workflowId);
        this.metrics.averageRetrievalTime = (this.metrics.averageRetrievalTime + (Date.now() - startTime)) / 2;
        return state || null;
      }

      // Find specific version
      const versions = this.stateVersions.get(workflowId) || [];
      const versionNum = parseInt(version);
      
      if (isNaN(versionNum)) {
        // Version is an ID
        const stateVersion = versions.find(v => v.id === version);
        return stateVersion ? stateVersion.state : null;
      } else {
        // Version is a number
        const stateVersion = versions.find(v => v.version === versionNum);
        return stateVersion ? stateVersion.state : null;
      }
    } catch (error) {
      console.error('Failed to get workflow state:', error);
      return null;
    } finally {
      this.metrics.averageRetrievalTime = (this.metrics.averageRetrievalTime + (Date.now() - startTime)) / 2;
    }
  }

  /**
   * Get workflow version history
   */
  async getWorkflowHistory(workflowId: string): Promise<StateVersion[]> {
    const versions = this.stateVersions.get(workflowId) || [];
    return [...versions].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Subscribe to state changes for a workflow
   */
  async subscribeToStateChanges(workflowId: string, agentId: string): Promise<void> {
    if (!this.stateSubscriptions.has(workflowId)) {
      this.stateSubscriptions.set(workflowId, new Set());
    }
    
    this.stateSubscriptions.get(workflowId)!.add(agentId);
    await this.persistSubscriptions();
  }

  /**
   * Broadcast state change to subscribers
   */
  async broadcastStateChange(workflowId: string, change: StateChange): Promise<void> {
    const subscribers = this.stateSubscriptions.get(workflowId);
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    const message: AgentMessage = {
      id: crypto.randomUUID(),
      fromAgentId: this.instance!.id,
      toAgentId: '', // Will be set per subscriber
      type: 'data',
      payload: {
        type: 'state-change',
        change
      },
      timestamp: Date.now()
    };

    // Send to all subscribers
    for (const agentId of subscribers) {
      try {
        message.toAgentId = agentId;
        await this.sendMessage(agentId, message);
      } catch (error) {
        console.error(`Failed to notify subscriber ${agentId}:`, error);
        // Remove failed subscriber
        subscribers.delete(agentId);
      }
    }

    await this.persistSubscriptions();
  }

  /**
   * Resolve state conflict
   */
  async resolveStateConflict(conflictId: string): Promise<WorkflowState> {
    const conflict = this.conflictResolutionQueue.find(c => c.id === conflictId);
    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    let resolvedState: WorkflowState;

    switch (conflict.resolutionStrategy) {
      case 'last-write-wins':
        resolvedState = await this.resolveLastWriteWins(conflict);
        break;
      case 'merge':
        resolvedState = await this.resolveMerge(conflict);
        break;
      case 'manual':
        throw new Error('Manual conflict resolution not yet implemented');
      default:
        throw new Error(`Unknown resolution strategy: ${conflict.resolutionStrategy}`);
    }

    // Mark conflict as resolved
    conflict.status = 'resolved';
    
    // Remove from queue
    this.conflictResolutionQueue = this.conflictResolutionQueue.filter(c => c.id !== conflictId);
    
    // Persist resolved state
    await this.persistWorkflowState(conflict.workflowId, resolvedState, 'state-manager', `Conflict resolution: ${conflict.resolutionStrategy}`);
    
    // Update metrics
    this.metrics.conflictsResolved++;
    await this.persistMetrics();

    return resolvedState;
  }

  /**
   * Create state snapshot
   */
  async createStateSnapshot(workflowId: string, description: string = 'Manual snapshot'): Promise<StateSnapshot> {
    const state = this.activeStates.get(workflowId);
    if (!state) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const stateJson = JSON.stringify(state);
    const snapshot: StateSnapshot = {
      id: crypto.randomUUID(),
      workflowId,
      state: { ...state },
      createdAt: Date.now(),
      description,
      size: new Blob([stateJson]).size,
      checksum: await this.calculateChecksum(stateJson)
    };

    // Store snapshot in R2 if enabled
    if (this.archivePolicy.r2ArchiveEnabled) {
      await this.storeSnapshotInR2(snapshot);
    }

    // Store snapshot reference locally
    const snapshots = await this.state.storage.get<StateSnapshot[]>(`snapshots:${workflowId}`) || [];
    snapshots.push(snapshot);
    await this.state.storage.put(`snapshots:${workflowId}`, snapshots);

    this.metrics.snapshotsCreated++;
    await this.persistMetrics();

    return snapshot;
  }

  /**
   * Restore from snapshot
   */
  async restoreFromSnapshot(workflowId: string, snapshotId: string): Promise<void> {
    // Get snapshot
    const snapshots = await this.state.storage.get<StateSnapshot[]>(`snapshots:${workflowId}`) || [];
    let snapshot = snapshots.find(s => s.id === snapshotId);

    if (!snapshot) {
      // Try to load from R2
      snapshot = await this.loadSnapshotFromR2(workflowId, snapshotId);
      if (!snapshot) {
        throw new Error(`Snapshot not found: ${snapshotId}`);
      }
    }

    // Validate snapshot integrity
    const stateJson = JSON.stringify(snapshot.state);
    const checksum = await this.calculateChecksum(stateJson);
    if (checksum !== snapshot.checksum) {
      throw new Error('Snapshot integrity check failed');
    }

    // Restore state
    await this.persistWorkflowState(workflowId, snapshot.state, 'state-manager', `Restored from snapshot: ${snapshotId}`);

    // Notify affected agents
    await this.broadcastStateChange(workflowId, {
      id: crypto.randomUUID(),
      workflowId,
      type: 'workflow-status',
      path: '/',
      oldValue: this.activeStates.get(workflowId),
      newValue: snapshot.state,
      timestamp: Date.now(),
      agentId: 'state-manager'
    });
  }

  // Helper Methods

  /**
   * Validate state integrity
   */
  private async validateState(workflowId: string, state: WorkflowState): Promise<StateValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!state.id) errors.push('State ID is required');
    if (!state.name) errors.push('State name is required');
    if (!state.status) errors.push('State status is required');
    if (!state.createdAt) errors.push('State createdAt is required');

    // Validate tasks
    for (const [taskId, task] of Object.entries(state.tasks || {})) {
      if (task.id !== taskId) {
        errors.push(`Task ID mismatch: ${taskId} vs ${task.id}`);
      }
      if (!task.type) {
        errors.push(`Task ${taskId} missing type`);
      }
    }

    // Calculate checksum
    const stateJson = JSON.stringify(state);
    const checksum = await this.calculateChecksum(stateJson);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      checksum
    };
  }

  /**
   * Detect and queue conflict
   */
  private async detectAndQueueConflict(workflowId: string, currentState: WorkflowState, newState: WorkflowState, author: string): Promise<void> {
    const conflict: StateConflict = {
      id: crypto.randomUUID(),
      workflowId,
      conflictingChanges: [
        {
          id: crypto.randomUUID(),
          workflowId,
          type: 'workflow-status',
          path: '/',
          oldValue: currentState,
          newValue: newState,
          timestamp: Date.now(),
          agentId: author
        }
      ],
      detectedAt: Date.now(),
      resolutionStrategy: 'last-write-wins', // Default strategy
      status: 'pending'
    };

    this.conflictResolutionQueue.push(conflict);
    await this.persistConflicts();
  }

  /**
   * Resolve conflict using last-write-wins strategy
   */
  private async resolveLastWriteWins(conflict: StateConflict): Promise<WorkflowState> {
    // Find the most recent change
    const latestChange = conflict.conflictingChanges.reduce((latest, change) => 
      change.timestamp > latest.timestamp ? change : latest
    );

    return latestChange.newValue as WorkflowState;
  }

  /**
   * Resolve conflict using merge strategy
   */
  private async resolveMerge(conflict: StateConflict): Promise<WorkflowState> {
    // Simple merge strategy - in practice, this would be more sophisticated
    const baseState = conflict.conflictingChanges[0].oldValue as WorkflowState;
    const changes = conflict.conflictingChanges.map(c => c.newValue as WorkflowState);

    let mergedState = { ...baseState };

    for (const change of changes) {
      // Merge non-conflicting fields
      mergedState = {
        ...mergedState,
        ...change,
        tasks: { ...mergedState.tasks, ...change.tasks },
        agents: { ...mergedState.agents, ...change.agents },
        metadata: { ...mergedState.metadata, ...change.metadata }
      };
    }

    return mergedState;
  }

  /**
   * Atomic state update
   */
  private async atomicStateUpdate(workflowId: string, version: StateVersion): Promise<void> {
    // Use Durable Objects storage transaction-like behavior
    const batch = [
      this.state.storage.put(`versions:${workflowId}`, this.stateVersions.get(workflowId)),
      this.state.storage.put(`active:${workflowId}`, this.activeStates.get(workflowId)),
      this.state.storage.put('stateVersions', Object.fromEntries(this.stateVersions)),
      this.state.storage.put('activeStates', Object.fromEntries(this.activeStates))
    ];

    await Promise.all(batch);
  }

  /**
   * Calculate checksum for state
   */
  private async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store snapshot in R2
   */
  private async storeSnapshotInR2(snapshot: StateSnapshot): Promise<void> {
    try {
      const key = `snapshots/${snapshot.workflowId}/${snapshot.id}.json`;
      const data = JSON.stringify(snapshot);
      
      await this.env.LOGS_BUCKET.put(key, data, {
        httpMetadata: {
          contentType: 'application/json'
        },
        customMetadata: {
          workflowId: snapshot.workflowId,
          snapshotId: snapshot.id,
          createdAt: snapshot.createdAt.toString()
        }
      });
    } catch (error) {
      console.error('Failed to store snapshot in R2:', error);
    }
  }

  /**
   * Load snapshot from R2
   */
  private async loadSnapshotFromR2(workflowId: string, snapshotId: string): Promise<StateSnapshot | null> {
    try {
      const key = `snapshots/${workflowId}/${snapshotId}.json`;
      const object = await this.env.LOGS_BUCKET.get(key);
      
      if (!object) {
        return null;
      }

      const data = await object.text();
      return JSON.parse(data) as StateSnapshot;
    } catch (error) {
      console.error('Failed to load snapshot from R2:', error);
      return null;
    }
  }

  /**
   * Schedule archiving for old versions
   */
  private async scheduleArchiving(workflowId: string): Promise<void> {
    // This would typically queue a background task
    // For now, we'll just log it
    console.log(`Archiving scheduled for workflow: ${workflowId}`);
  }

  /**
   * Archive old versions
   */
  private async archiveOldVersions(): Promise<number> {
    let archivedCount = 0;
    const cutoffDate = Date.now() - (this.archivePolicy.archiveAfterDays * 24 * 60 * 60 * 1000);

    for (const [workflowId, versions] of this.stateVersions.entries()) {
      const oldVersions = versions.filter(v => v.timestamp < cutoffDate);
      
      if (oldVersions.length > 0) {
        // Archive to R2 if enabled
        if (this.archivePolicy.r2ArchiveEnabled) {
          for (const version of oldVersions) {
            await this.archiveVersionToR2(version);
          }
        }

        // Remove from active storage
        const remainingVersions = versions.filter(v => v.timestamp >= cutoffDate);
        this.stateVersions.set(workflowId, remainingVersions);
        
        archivedCount += oldVersions.length;
      }
    }

    if (archivedCount > 0) {
      await this.state.storage.put('stateVersions', Object.fromEntries(this.stateVersions));
    }

    return archivedCount;
  }

  /**
   * Archive version to R2
   */
  private async archiveVersionToR2(version: StateVersion): Promise<void> {
    try {
      const key = `archive/${version.workflowId}/${version.id}.json`;
      const data = JSON.stringify(version);
      
      await this.env.LOGS_BUCKET.put(key, data, {
        httpMetadata: {
          contentType: 'application/json'
        },
        customMetadata: {
          workflowId: version.workflowId,
          version: version.version.toString(),
          timestamp: version.timestamp.toString()
        }
      });
    } catch (error) {
      console.error('Failed to archive version to R2:', error);
    }
  }

  /**
   * Get state metrics
   */
  private async getStateMetrics(): Promise<StateMetrics> {
    // Update real-time metrics
    this.metrics.totalStates = Array.from(this.stateVersions.values()).reduce((sum, versions) => sum + versions.length, 0);
    this.metrics.activeWorkflows = this.activeStates.size;
    
    // Calculate average state size
    let totalSize = 0;
    let stateCount = 0;
    
    for (const state of this.activeStates.values()) {
      totalSize += new Blob([JSON.stringify(state)]).size;
      stateCount++;
    }
    
    this.metrics.averageStateSize = stateCount > 0 ? totalSize / stateCount : 0;

    return { ...this.metrics };
  }

  /**
   * Handle state change notification
   */
  private async handleStateChangeNotification(message: AgentMessage): Promise<void> {
    // Process incoming state change notifications from other agents
    const { change } = message.payload;
    
    // Update local state if needed
    // This could trigger conflict detection or other coordination logic
  }

  /**
   * Handle coordination request
   */
  private async handleCoordinationRequest(message: AgentMessage): Promise<void> {
    // Handle requests for state coordination assistance
    // This could include conflict resolution requests, state queries, etc.
  }

  /**
   * Persist subscriptions to storage
   */
  private async persistSubscriptions(): Promise<void> {
    const subscriptionsObj: Record<string, string[]> = {};
    for (const [workflowId, agentIds] of this.stateSubscriptions.entries()) {
      subscriptionsObj[workflowId] = Array.from(agentIds);
    }
    await this.state.storage.put('stateSubscriptions', subscriptionsObj);
  }

  /**
   * Persist conflicts to storage
   */
  private async persistConflicts(): Promise<void> {
    await this.state.storage.put('conflictQueue', this.conflictResolutionQueue);
  }

  /**
   * Persist metrics to storage
   */
  private async persistMetrics(): Promise<void> {
    await this.state.storage.put('metrics', this.metrics);
  }
}

