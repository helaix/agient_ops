// Enum for connection types
export enum ConnectionType {
  DataFlow = 'dataFlow',
  ControlFlow = 'controlFlow',
  ContextSharing = 'contextSharing'
}

// Validation status types
export type ValidationStatus = 'success' | 'warning' | 'error';

// Agent configuration option types
export interface ConfigOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'boolean';
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string }[];
  required?: boolean;
}

// Agent capabilities
export interface AgentCapabilities {
  inputs: string[];
  outputs: string[];
}

// Agent type
export interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'processing' | 'data' | 'web' | 'communication' | 'document';
  capabilities: AgentCapabilities;
  configOptions?: ConfigOption[];
  icon?: string;
}

// Workflow node type
export interface WorkflowNode {
  id: string;
  agentId: string;
  title: string;
  position: { x: number; y: number };
  inputs: string[];
  outputs: string[];
  config: Record<string, any>;
  validationStatus: ValidationStatus;
  validationMessage: string;
}

// Connection type
export interface Connection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: ConnectionType;
  label: string;
  validationStatus: ValidationStatus;
  validationMessage: string;
}

// Workflow type
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
}

