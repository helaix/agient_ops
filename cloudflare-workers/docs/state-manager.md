# State Manager Durable Object

## Overview

The State Manager Durable Object is a centralized state management system for multi-agent workflows in the Enhanced Multi-Agent Workflow System. It provides workflow state persistence with versioning, cross-agent synchronization, state recovery mechanisms, and performance optimization for large workflows.

## Features

### Core Capabilities

- **Workflow State Persistence**: Version-controlled state storage with atomic updates
- **Cross-Agent Synchronization**: Real-time state broadcasting and eventual consistency
- **State Recovery**: Automatic backup, disaster recovery, and state validation
- **Performance Optimization**: Efficient querying, lazy loading, and memory optimization
- **Conflict Resolution**: Automatic detection and resolution of concurrent updates

### Key Components

1. **State Versioning**: Every state change creates a new version with full history tracking
2. **Subscription System**: Agents can subscribe to state changes for real-time updates
3. **Snapshot System**: Point-in-time state snapshots for backup and recovery
4. **Conflict Detection**: Automatic detection of conflicting concurrent updates
5. **Archive Management**: Automatic archiving of old versions to R2 storage

## Architecture

```typescript
export class StateManager extends BaseAgent {
  private stateVersions: Map<string, StateVersion[]>
  private activeStates: Map<string, WorkflowState>
  private stateSubscriptions: Map<string, Set<string>>
  private conflictResolutionQueue: StateConflict[]
}
```

### Data Structures

#### StateVersion
```typescript
interface StateVersion {
  id: string;
  workflowId: string;
  version: number;
  state: WorkflowState;
  timestamp: number;
  author: string;
  parentVersion?: string;
  changeDescription: string;
  checksum: string;
}
```

#### StateChange
```typescript
interface StateChange {
  id: string;
  workflowId: string;
  type: 'task-update' | 'agent-status' | 'workflow-status' | 'metadata-update';
  path: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
  agentId: string;
}
```

#### StateSnapshot
```typescript
interface StateSnapshot {
  id: string;
  workflowId: string;
  state: WorkflowState;
  createdAt: number;
  description: string;
  size: number;
  checksum: string;
}
```

## API Reference

### Core Methods

#### `persistWorkflowState(workflowId, state, author?, changeDescription?)`
Persists a workflow state with versioning.

**Parameters:**
- `workflowId` (string): Unique identifier for the workflow
- `state` (WorkflowState): The workflow state to persist
- `author` (string, optional): Agent ID that created this version (default: 'system')
- `changeDescription` (string, optional): Description of the change (default: 'State update')

**Returns:** `Promise<StateVersion>` - The created state version

**Example:**
```typescript
const version = await stateManager.persistWorkflowState(
  'workflow-123',
  workflowState,
  'agent-coordinator',
  'Initial workflow creation'
);
```

#### `getWorkflowState(workflowId, version?)`
Retrieves a workflow state by ID and optional version.

**Parameters:**
- `workflowId` (string): Unique identifier for the workflow
- `version` (string, optional): Version number or version ID (returns current if omitted)

**Returns:** `Promise<WorkflowState | null>` - The workflow state or null if not found

**Example:**
```typescript
// Get current state
const currentState = await stateManager.getWorkflowState('workflow-123');

// Get specific version
const specificState = await stateManager.getWorkflowState('workflow-123', '5');
```

#### `getWorkflowHistory(workflowId)`
Retrieves the complete version history for a workflow.

**Parameters:**
- `workflowId` (string): Unique identifier for the workflow

**Returns:** `Promise<StateVersion[]>` - Array of state versions in reverse chronological order

**Example:**
```typescript
const history = await stateManager.getWorkflowHistory('workflow-123');
console.log(`Workflow has ${history.length} versions`);
```

#### `subscribeToStateChanges(workflowId, agentId)`
Subscribes an agent to state change notifications.

**Parameters:**
- `workflowId` (string): Unique identifier for the workflow
- `agentId` (string): Agent ID to subscribe

**Returns:** `Promise<void>`

**Example:**
```typescript
await stateManager.subscribeToStateChanges('workflow-123', 'agent-review-manager');
```

#### `createStateSnapshot(workflowId, description?)`
Creates a point-in-time snapshot of the workflow state.

**Parameters:**
- `workflowId` (string): Unique identifier for the workflow
- `description` (string, optional): Description of the snapshot (default: 'Manual snapshot')

**Returns:** `Promise<StateSnapshot>` - The created snapshot

**Example:**
```typescript
const snapshot = await stateManager.createStateSnapshot(
  'workflow-123',
  'Pre-deployment snapshot'
);
```

#### `restoreFromSnapshot(workflowId, snapshotId)`
Restores a workflow state from a snapshot.

**Parameters:**
- `workflowId` (string): Unique identifier for the workflow
- `snapshotId` (string): Unique identifier for the snapshot

**Returns:** `Promise<void>`

**Example:**
```typescript
await stateManager.restoreFromSnapshot('workflow-123', snapshot.id);
```

### Task Processing

The State Manager processes various task types through the `processTask` method:

#### Supported Task Types

- `persist-state`: Persist a workflow state
- `get-state`: Retrieve a workflow state
- `get-history`: Get workflow version history
- `subscribe-changes`: Subscribe to state changes
- `create-snapshot`: Create a state snapshot
- `restore-snapshot`: Restore from a snapshot
- `resolve-conflict`: Resolve a state conflict
- `validate-state`: Validate state integrity
- `archive-old-versions`: Archive old state versions
- `get-metrics`: Get state management metrics

#### Task Example
```typescript
const task: AgentTask = {
  id: 'task-123',
  type: 'persist-state',
  priority: 'high',
  payload: {
    workflowId: 'workflow-123',
    state: workflowState,
    author: 'agent-coordinator',
    changeDescription: 'Task completion update'
  },
  context: {
    workflowId: 'workflow-123',
    metadata: {}
  },
  createdAt: Date.now(),
  retryCount: 0,
  maxRetries: 3
};

const result = await stateManager.processTask(task);
```

## Configuration

### Archive Policy
```typescript
interface StateArchivePolicy {
  maxVersionsPerWorkflow: number;    // Default: 100
  archiveAfterDays: number;          // Default: 30
  compressionEnabled: boolean;       // Default: true
  r2ArchiveEnabled: boolean;         // Default: true
}
```

### Performance Targets

- **State Retrieval**: <50ms for active states
- **State Persistence**: <100ms for normal updates
- **State Synchronization**: <200ms for cross-agent updates
- **Conflict Resolution**: <500ms for simple conflicts

### Scalability Targets

- Support 1000+ concurrent workflows
- Handle 10,000+ state updates per minute
- Maintain <1MB memory per workflow
- Archive states older than 30 days

## Usage Examples

### Basic Workflow State Management

```typescript
// Initialize State Manager
const stateManager = new StateManager(durableObjectState, env);

// Create initial workflow state
const workflowState: WorkflowState = {
  id: 'workflow-123',
  name: 'Data Processing Workflow',
  status: 'running',
  priority: 'high',
  createdAt: Date.now(),
  // ... other properties
};

// Persist initial state
const version1 = await stateManager.persistWorkflowState(
  workflowState.id,
  workflowState,
  'coordinator',
  'Initial workflow creation'
);

// Subscribe agents to changes
await stateManager.subscribeToStateChanges(workflowState.id, 'data-processor');
await stateManager.subscribeToStateChanges(workflowState.id, 'validator');

// Update state
const updatedState = {
  ...workflowState,
  status: 'completed',
  completedAt: Date.now()
};

const version2 = await stateManager.persistWorkflowState(
  workflowState.id,
  updatedState,
  'data-processor',
  'Workflow completed'
);
```

### Snapshot and Recovery

```typescript
// Create snapshot before risky operation
const snapshot = await stateManager.createStateSnapshot(
  'workflow-123',
  'Pre-deployment snapshot'
);

// Perform risky operation...
// If something goes wrong, restore from snapshot
await stateManager.restoreFromSnapshot('workflow-123', snapshot.id);
```

### Version History Analysis

```typescript
// Get complete history
const history = await stateManager.getWorkflowHistory('workflow-123');

// Analyze changes over time
for (const version of history) {
  console.log(`Version ${version.version} by ${version.author}: ${version.changeDescription}`);
}

// Get specific version
const specificVersion = await stateManager.getWorkflowState('workflow-123', '5');
```

## Integration with Other Components

### Agent Coordinator Integration

The State Manager works closely with the Agent Coordinator:

```typescript
// Coordinator creates workflow
const workflow = await coordinator.createWorkflow(workflowConfig);

// State Manager persists initial state
await stateManager.persistWorkflowState(
  workflow.id,
  workflow,
  'coordinator',
  'Workflow initialization'
);

// Agents subscribe to state changes
await stateManager.subscribeToStateChanges(workflow.id, agentId);
```

### Cross-Agent Communication

Agents receive state change notifications:

```typescript
// In agent's handleMessage method
protected async handleMessage(message: AgentMessage): Promise<void> {
  if (message.type === 'data' && message.payload.type === 'state-change') {
    const stateChange: StateChange = message.payload.change;
    
    // React to state change
    await this.handleStateChange(stateChange);
  }
}
```

## Error Handling

### State Validation Errors
```typescript
try {
  await stateManager.persistWorkflowState(workflowId, invalidState, 'agent');
} catch (error) {
  if (error.message.includes('State validation failed')) {
    // Handle validation error
    console.error('Invalid state:', error.message);
  }
}
```

### Storage Errors
```typescript
try {
  const state = await stateManager.getWorkflowState(workflowId);
} catch (error) {
  // Handle storage errors gracefully
  console.error('Storage error:', error.message);
  // Implement fallback logic
}
```

### Conflict Resolution
```typescript
// Conflicts are automatically detected and queued
// Manual resolution can be triggered:
try {
  const resolvedState = await stateManager.resolveStateConflict(conflictId);
} catch (error) {
  console.error('Conflict resolution failed:', error.message);
}
```

## Monitoring and Metrics

### Built-in Metrics
```typescript
const metrics = await stateManager.getStateMetrics();
console.log({
  totalStates: metrics.totalStates,
  activeWorkflows: metrics.activeWorkflows,
  versionsCreated: metrics.versionsCreated,
  conflictsResolved: metrics.conflictsResolved,
  averageRetrievalTime: metrics.averageRetrievalTime
});
```

### Performance Monitoring
```typescript
// Metrics are automatically logged to Analytics Engine
// Custom metrics can be added:
await stateManager.logMetrics('custom_operation', {
  duration: operationTime,
  success: 1
});
```

## Best Practices

### State Design
- Keep states immutable - always create new versions
- Use descriptive change descriptions for better history tracking
- Validate state structure before persistence
- Use appropriate priority levels for different operations

### Performance Optimization
- Subscribe only necessary agents to state changes
- Use snapshots for long-running workflows
- Archive old versions regularly
- Batch multiple small updates when possible

### Error Recovery
- Always handle validation errors gracefully
- Implement retry logic for transient failures
- Use snapshots for rollback capabilities
- Monitor conflict resolution effectiveness

### Security Considerations
- Validate all input states
- Use checksums to detect data corruption
- Implement proper access controls for sensitive workflows
- Audit state changes for compliance

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check for memory leaks in state objects
   - Ensure old versions are being archived
   - Monitor workflow state sizes

2. **Slow Performance**
   - Review state validation logic
   - Check for excessive subscriptions
   - Monitor storage backend performance

3. **Conflict Resolution Failures**
   - Review conflict resolution strategies
   - Check for concurrent update patterns
   - Implement manual resolution for complex conflicts

4. **State Corruption**
   - Verify checksum validation
   - Check storage backend integrity
   - Review state validation rules

### Debug Mode

Enable debug logging for detailed state operations:

```typescript
// Set environment variable
process.env.STATE_MANAGER_DEBUG = 'true';

// Or configure in code
stateManager.setDebugMode(true);
```

## Future Enhancements

### Planned Features
- Advanced conflict resolution strategies
- State compression for large workflows
- Distributed state sharding
- Real-time state streaming
- Machine learning-based optimization

### Extension Points
- Custom validation rules
- Pluggable conflict resolution strategies
- Custom archiving policies
- External storage backends

