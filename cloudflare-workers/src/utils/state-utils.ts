import { WorkflowState, StateChange, StateVersion } from '@/types';

/**
 * State Management Utility Functions
 * 
 * Helper functions for state operations, validation, and manipulation
 */

/**
 * Deep clone a workflow state
 */
export function cloneWorkflowState(state: WorkflowState): WorkflowState {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Compare two workflow states and generate a list of changes
 */
export function compareStates(oldState: WorkflowState, newState: WorkflowState, agentId: string): StateChange[] {
  const changes: StateChange[] = [];
  const timestamp = Date.now();

  // Compare top-level properties
  const topLevelProps = ['status', 'priority', 'name', 'description'] as const;
  for (const prop of topLevelProps) {
    if (oldState[prop] !== newState[prop]) {
      changes.push({
        id: crypto.randomUUID(),
        workflowId: newState.id,
        type: 'workflow-status',
        path: `/${prop}`,
        oldValue: oldState[prop],
        newValue: newState[prop],
        timestamp,
        agentId
      });
    }
  }

  // Compare tasks
  const oldTasks = oldState.tasks || {};
  const newTasks = newState.tasks || {};
  
  // Find added/modified tasks
  for (const [taskId, newTask] of Object.entries(newTasks)) {
    const oldTask = oldTasks[taskId];
    if (!oldTask) {
      // Task added
      changes.push({
        id: crypto.randomUUID(),
        workflowId: newState.id,
        type: 'task-update',
        path: `/tasks/${taskId}`,
        oldValue: null,
        newValue: newTask,
        timestamp,
        agentId
      });
    } else if (JSON.stringify(oldTask) !== JSON.stringify(newTask)) {
      // Task modified
      changes.push({
        id: crypto.randomUUID(),
        workflowId: newState.id,
        type: 'task-update',
        path: `/tasks/${taskId}`,
        oldValue: oldTask,
        newValue: newTask,
        timestamp,
        agentId
      });
    }
  }

  // Find removed tasks
  for (const taskId of Object.keys(oldTasks)) {
    if (!newTasks[taskId]) {
      changes.push({
        id: crypto.randomUUID(),
        workflowId: newState.id,
        type: 'task-update',
        path: `/tasks/${taskId}`,
        oldValue: oldTasks[taskId],
        newValue: null,
        timestamp,
        agentId
      });
    }
  }

  // Compare agents
  const oldAgents = oldState.agents || {};
  const newAgents = newState.agents || {};
  
  for (const [agentKey, newAgentId] of Object.entries(newAgents)) {
    const oldAgentId = oldAgents[agentKey];
    if (oldAgentId !== newAgentId) {
      changes.push({
        id: crypto.randomUUID(),
        workflowId: newState.id,
        type: 'agent-status',
        path: `/agents/${agentKey}`,
        oldValue: oldAgentId || null,
        newValue: newAgentId,
        timestamp,
        agentId
      });
    }
  }

  // Compare metadata
  const oldMetadata = oldState.metadata || {};
  const newMetadata = newState.metadata || {};
  
  if (JSON.stringify(oldMetadata) !== JSON.stringify(newMetadata)) {
    changes.push({
      id: crypto.randomUUID(),
      workflowId: newState.id,
      type: 'metadata-update',
      path: '/metadata',
      oldValue: oldMetadata,
      newValue: newMetadata,
      timestamp,
      agentId
    });
  }

  return changes;
}

/**
 * Apply a state change to a workflow state
 */
export function applyStateChange(state: WorkflowState, change: StateChange): WorkflowState {
  const newState = cloneWorkflowState(state);
  const pathParts = change.path.split('/').filter(p => p);

  if (pathParts.length === 0) {
    // Root level change
    return change.newValue as WorkflowState;
  }

  // Navigate to the target property
  let current: any = newState;
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }

  const lastPart = pathParts[pathParts.length - 1];
  if (change.newValue === null) {
    // Remove property
    delete current[lastPart];
  } else {
    // Set property
    current[lastPart] = change.newValue;
  }

  return newState;
}

/**
 * Merge multiple workflow states using a simple strategy
 */
export function mergeWorkflowStates(baseState: WorkflowState, ...states: WorkflowState[]): WorkflowState {
  let merged = cloneWorkflowState(baseState);

  for (const state of states) {
    // Merge top-level properties (last write wins)
    merged = {
      ...merged,
      ...state,
      // Special handling for nested objects
      tasks: { ...merged.tasks, ...state.tasks },
      agents: { ...merged.agents, ...state.agents },
      metadata: { ...merged.metadata, ...state.metadata },
      progress: {
        ...merged.progress,
        ...state.progress,
        metrics: {
          ...merged.progress.metrics,
          ...state.progress.metrics,
          agentUtilization: {
            ...merged.progress.metrics.agentUtilization,
            ...state.progress.metrics.agentUtilization
          }
        }
      }
    };
  }

  return merged;
}

/**
 * Validate workflow state structure
 */
export function validateWorkflowStateStructure(state: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!state.id) errors.push('Missing required field: id');
  if (!state.name) errors.push('Missing required field: name');
  if (!state.status) errors.push('Missing required field: status');
  if (!state.createdAt) errors.push('Missing required field: createdAt');

  // Type validation
  if (state.id && typeof state.id !== 'string') errors.push('Field id must be a string');
  if (state.name && typeof state.name !== 'string') errors.push('Field name must be a string');
  if (state.createdAt && typeof state.createdAt !== 'number') errors.push('Field createdAt must be a number');

  // Status validation
  const validStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
  if (state.status && !validStatuses.includes(state.status)) {
    errors.push(`Invalid status: ${state.status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Priority validation
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (state.priority && !validPriorities.includes(state.priority)) {
    errors.push(`Invalid priority: ${state.priority}. Must be one of: ${validPriorities.join(', ')}`);
  }

  // Tasks validation
  if (state.tasks && typeof state.tasks !== 'object') {
    errors.push('Field tasks must be an object');
  } else if (state.tasks) {
    for (const [taskId, task] of Object.entries(state.tasks)) {
      if (typeof task !== 'object' || task === null) {
        errors.push(`Task ${taskId} must be an object`);
        continue;
      }
      
      const taskObj = task as any;
      if (!taskObj.id) errors.push(`Task ${taskId} missing required field: id`);
      if (!taskObj.type) errors.push(`Task ${taskId} missing required field: type`);
      if (taskObj.id !== taskId) errors.push(`Task ${taskId} has mismatched id: ${taskObj.id}`);
    }
  }

  // Progress validation
  if (state.progress) {
    if (typeof state.progress !== 'object') {
      errors.push('Field progress must be an object');
    } else {
      const progress = state.progress;
      if (progress.totalTasks !== undefined && typeof progress.totalTasks !== 'number') {
        errors.push('progress.totalTasks must be a number');
      }
      if (progress.completedTasks !== undefined && typeof progress.completedTasks !== 'number') {
        errors.push('progress.completedTasks must be a number');
      }
      if (progress.failedTasks !== undefined && typeof progress.failedTasks !== 'number') {
        errors.push('progress.failedTasks must be a number');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate state size in bytes
 */
export function calculateStateSize(state: WorkflowState): number {
  const stateJson = JSON.stringify(state);
  return new Blob([stateJson]).size;
}

/**
 * Compress state for storage
 */
export function compressState(state: WorkflowState): string {
  // Simple compression - remove unnecessary whitespace
  return JSON.stringify(state);
}

/**
 * Decompress state from storage
 */
export function decompressState(compressedState: string): WorkflowState {
  return JSON.parse(compressedState);
}

/**
 * Generate a summary of state changes
 */
export function summarizeStateChanges(changes: StateChange[]): string {
  if (changes.length === 0) return 'No changes';

  const changeTypes = changes.reduce((acc, change) => {
    acc[change.type] = (acc[change.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const summary = Object.entries(changeTypes)
    .map(([type, count]) => `${count} ${type} change${count > 1 ? 's' : ''}`)
    .join(', ');

  return summary;
}

/**
 * Filter state versions by criteria
 */
export function filterStateVersions(
  versions: StateVersion[], 
  criteria: {
    author?: string;
    fromDate?: number;
    toDate?: number;
    maxVersions?: number;
  }
): StateVersion[] {
  let filtered = [...versions];

  if (criteria.author) {
    filtered = filtered.filter(v => v.author === criteria.author);
  }

  if (criteria.fromDate) {
    filtered = filtered.filter(v => v.timestamp >= criteria.fromDate!);
  }

  if (criteria.toDate) {
    filtered = filtered.filter(v => v.timestamp <= criteria.toDate!);
  }

  // Sort by timestamp (newest first)
  filtered.sort((a, b) => b.timestamp - a.timestamp);

  if (criteria.maxVersions) {
    filtered = filtered.slice(0, criteria.maxVersions);
  }

  return filtered;
}

/**
 * Create a state diff between two versions
 */
export function createStateDiff(oldVersion: StateVersion, newVersion: StateVersion): {
  added: string[];
  modified: string[];
  removed: string[];
  summary: string;
} {
  const changes = compareStates(oldVersion.state, newVersion.state, newVersion.author);
  
  const added: string[] = [];
  const modified: string[] = [];
  const removed: string[] = [];

  for (const change of changes) {
    if (change.oldValue === null) {
      added.push(change.path);
    } else if (change.newValue === null) {
      removed.push(change.path);
    } else {
      modified.push(change.path);
    }
  }

  const summary = [
    added.length > 0 ? `${added.length} added` : '',
    modified.length > 0 ? `${modified.length} modified` : '',
    removed.length > 0 ? `${removed.length} removed` : ''
  ].filter(Boolean).join(', ') || 'No changes';

  return { added, modified, removed, summary };
}

