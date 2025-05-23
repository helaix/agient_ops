/**
 * SharedDataModel
 * 
 * Defines the shared data models used across all components.
 * This ensures consistent data representation throughout the application.
 */

/**
 * Agent model
 * Represents an agent in the system
 */
export class Agent {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.type = data.type || '';
    this.status = data.status || 'idle';
    this.capabilities = data.capabilities || [];
    this.resources = data.resources || {};
    this.contexts = data.contexts || [];
    this.tasks = data.tasks || [];
    this.metrics = data.metrics || {};
    this.metadata = data.metadata || {};
  }

  static fromJSON(json) {
    return new Agent(json);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      capabilities: [...this.capabilities],
      resources: { ...this.resources },
      contexts: [...this.contexts],
      tasks: [...this.tasks],
      metrics: { ...this.metrics },
      metadata: { ...this.metadata }
    };
  }
}

/**
 * Task model
 * Represents a task assigned to an agent
 */
export class Task {
  constructor(data = {}) {
    this.id = data.id || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.status = data.status || 'pending';
    this.priority = data.priority || 'medium';
    this.assignedTo = data.assignedTo || null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    this.dependencies = data.dependencies || [];
    this.progress = data.progress || 0;
    this.metadata = data.metadata || {};
  }

  static fromJSON(json) {
    return new Task(json);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      assignedTo: this.assignedTo,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      dueDate: this.dueDate ? this.dueDate.toISOString() : null,
      dependencies: [...this.dependencies],
      progress: this.progress,
      metadata: { ...this.metadata }
    };
  }
}

/**
 * Workflow model
 * Represents a workflow of connected agents and tasks
 */
export class Workflow {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.status = data.status || 'draft';
    this.nodes = data.nodes || [];
    this.edges = data.edges || [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.metadata = data.metadata || {};
  }

  static fromJSON(json) {
    return new Workflow(json);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      nodes: this.nodes.map(node => ({ ...node })),
      edges: this.edges.map(edge => ({ ...edge })),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      metadata: { ...this.metadata }
    };
  }
}

/**
 * Context model
 * Represents a context that can be shared between agents
 */
export class Context {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.type = data.type || '';
    this.data = data.data || {};
    this.accessibleBy = data.accessibleBy || [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.metadata = data.metadata || {};
  }

  static fromJSON(json) {
    return new Context(json);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      data: { ...this.data },
      accessibleBy: [...this.accessibleBy],
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      metadata: { ...this.metadata }
    };
  }
}

/**
 * Create sample data for testing
 * @returns {Object} - Sample data
 */
export function createSampleData() {
  // Create sample agents
  const agents = [
    new Agent({
      id: 'agent-1',
      name: 'Research Agent',
      type: 'research',
      status: 'active',
      capabilities: ['web-search', 'data-analysis', 'report-generation'],
      resources: { cpu: 2, memory: 4, storage: 10 },
      contexts: ['context-1', 'context-3'],
      tasks: ['task-1', 'task-3'],
      metrics: { responseTime: 1.2, completionRate: 0.95, accuracy: 0.92 }
    }),
    new Agent({
      id: 'agent-2',
      name: 'Assistant Agent',
      type: 'assistant',
      status: 'idle',
      capabilities: ['scheduling', 'email', 'reminders', 'note-taking'],
      resources: { cpu: 1, memory: 2, storage: 5 },
      contexts: ['context-2'],
      tasks: ['task-2'],
      metrics: { responseTime: 0.8, completionRate: 0.98, accuracy: 0.96 }
    }),
    new Agent({
      id: 'agent-3',
      name: 'Code Agent',
      type: 'developer',
      status: 'busy',
      capabilities: ['code-generation', 'code-review', 'debugging', 'testing'],
      resources: { cpu: 4, memory: 8, storage: 20 },
      contexts: ['context-1', 'context-2'],
      tasks: ['task-4'],
      metrics: { responseTime: 2.1, completionRate: 0.89, accuracy: 0.94 }
    })
  ];

  // Create sample tasks
  const tasks = [
    new Task({
      id: 'task-1',
      title: 'Research renewable energy',
      description: 'Find information about renewable energy sources and their efficiency',
      status: 'in-progress',
      priority: 'high',
      assignedTo: 'agent-1',
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      progress: 0.6
    }),
    new Task({
      id: 'task-2',
      title: 'Schedule team meeting',
      description: 'Schedule a team meeting for next week',
      status: 'pending',
      priority: 'medium',
      assignedTo: 'agent-2',
      dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
      progress: 0
    }),
    new Task({
      id: 'task-3',
      title: 'Generate research report',
      description: 'Generate a report based on the renewable energy research',
      status: 'pending',
      priority: 'medium',
      assignedTo: 'agent-1',
      dependencies: ['task-1'],
      dueDate: new Date(Date.now() + 259200000), // 3 days from now
      progress: 0
    }),
    new Task({
      id: 'task-4',
      title: 'Develop data visualization',
      description: 'Create visualizations for the research data',
      status: 'in-progress',
      priority: 'high',
      assignedTo: 'agent-3',
      dependencies: ['task-1'],
      dueDate: new Date(Date.now() + 345600000), // 4 days from now
      progress: 0.3
    })
  ];

  // Create sample workflows
  const workflows = [
    new Workflow({
      id: 'workflow-1',
      name: 'Research and Report',
      description: 'Workflow for researching a topic and generating a report',
      status: 'active',
      nodes: [
        { id: 'node-1', type: 'agent', agentId: 'agent-1', position: { x: 100, y: 100 } },
        { id: 'node-2', type: 'task', taskId: 'task-1', position: { x: 300, y: 100 } },
        { id: 'node-3', type: 'task', taskId: 'task-3', position: { x: 500, y: 100 } },
        { id: 'node-4', type: 'agent', agentId: 'agent-3', position: { x: 300, y: 300 } },
        { id: 'node-5', type: 'task', taskId: 'task-4', position: { x: 500, y: 300 } }
      ],
      edges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'assignment' },
        { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'dependency' },
        { id: 'edge-3', source: 'node-1', target: 'node-3', type: 'assignment' },
        { id: 'edge-4', source: 'node-2', target: 'node-5', type: 'dependency' },
        { id: 'edge-5', source: 'node-4', target: 'node-5', type: 'assignment' }
      ]
    })
  ];

  // Create sample contexts
  const contexts = [
    new Context({
      id: 'context-1',
      name: 'Research Context',
      type: 'knowledge-base',
      data: {
        topics: ['renewable energy', 'sustainability', 'climate change'],
        sources: ['academic papers', 'news articles', 'government reports']
      },
      accessibleBy: ['agent-1', 'agent-3']
    }),
    new Context({
      id: 'context-2',
      name: 'Team Context',
      type: 'organizational',
      data: {
        team: 'Research Team',
        members: ['John', 'Jane', 'Bob', 'Alice'],
        schedule: { meetings: ['Monday 10:00', 'Thursday 14:00'] }
      },
      accessibleBy: ['agent-2', 'agent-3']
    }),
    new Context({
      id: 'context-3',
      name: 'Project Context',
      type: 'project',
      data: {
        project: 'Renewable Energy Research',
        deadline: new Date(Date.now() + 604800000).toISOString(), // 1 week from now
        deliverables: ['Research Report', 'Data Visualizations', 'Presentation']
      },
      accessibleBy: ['agent-1']
    })
  ];

  return {
    agents,
    tasks,
    workflows,
    contexts
  };
}

export default {
  Agent,
  Task,
  Workflow,
  Context,
  createSampleData
};

