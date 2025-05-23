/**
 * Sample data for the Multi-Agent Management tablet navigation demo
 */

// Sample Agents Data
const agentsData = [
    {
        id: 'agent-1',
        name: 'Research Assistant',
        status: 'active',
        description: 'Specialized in gathering and analyzing information from various sources.',
        tasks: 3,
        lastActive: '2 mins ago',
        icon: 'fa-search'
    },
    {
        id: 'agent-2',
        name: 'Content Writer',
        status: 'active',
        description: 'Creates high-quality content based on provided topics and guidelines.',
        tasks: 1,
        lastActive: '15 mins ago',
        icon: 'fa-pen-fancy'
    },
    {
        id: 'agent-3',
        name: 'Data Analyzer',
        status: 'idle',
        description: 'Processes and analyzes large datasets to extract meaningful insights.',
        tasks: 0,
        lastActive: '1 hour ago',
        icon: 'fa-chart-line'
    },
    {
        id: 'agent-4',
        name: 'Customer Support',
        status: 'active',
        description: 'Handles customer inquiries and provides assistance with common issues.',
        tasks: 5,
        lastActive: '5 mins ago',
        icon: 'fa-headset'
    },
    {
        id: 'agent-5',
        name: 'Code Assistant',
        status: 'idle',
        description: 'Helps with coding tasks, debugging, and code optimization.',
        tasks: 0,
        lastActive: '3 hours ago',
        icon: 'fa-code'
    },
    {
        id: 'agent-6',
        name: 'Meeting Scheduler',
        status: 'active',
        description: 'Coordinates and schedules meetings based on availability and preferences.',
        tasks: 2,
        lastActive: '30 mins ago',
        icon: 'fa-calendar-check'
    }
];

// Sample Tasks Data
const tasksData = [
    {
        id: 'task-1',
        title: 'Research Renewable Energy',
        description: 'Gather information about recent advancements in renewable energy technologies.',
        assignedTo: 'agent-1',
        priority: 'high',
        dueDate: 'Today, 5:00 PM'
    },
    {
        id: 'task-2',
        title: 'Write Blog Post',
        description: 'Create a 1500-word blog post about artificial intelligence in healthcare.',
        assignedTo: 'agent-2',
        priority: 'medium',
        dueDate: 'Tomorrow, 12:00 PM'
    },
    {
        id: 'task-3',
        title: 'Analyze Q2 Sales Data',
        description: 'Process and analyze the sales data for Q2 and generate insights report.',
        assignedTo: 'agent-3',
        priority: 'high',
        dueDate: 'Jul 15, 3:00 PM'
    },
    {
        id: 'task-4',
        title: 'Respond to Support Tickets',
        description: 'Address all pending customer support tickets in the queue.',
        assignedTo: 'agent-4',
        priority: 'high',
        dueDate: 'Today, 2:00 PM'
    },
    {
        id: 'task-5',
        title: 'Optimize Database Queries',
        description: 'Review and optimize slow-performing database queries in the application.',
        assignedTo: 'agent-5',
        priority: 'medium',
        dueDate: 'Jul 18, 10:00 AM'
    },
    {
        id: 'task-6',
        title: 'Schedule Team Meeting',
        description: 'Coordinate and schedule the monthly team meeting based on availability.',
        assignedTo: 'agent-6',
        priority: 'low',
        dueDate: 'Jul 14, 9:00 AM'
    },
    {
        id: 'task-7',
        title: 'Compile Market Research',
        description: 'Compile and summarize market research data for the product team.',
        assignedTo: 'agent-1',
        priority: 'medium',
        dueDate: 'Jul 20, 4:00 PM'
    }
];

// Sample Workflows Data
const workflowsData = [
    {
        id: 'workflow-1',
        name: 'Content Creation Pipeline',
        description: 'End-to-end workflow for researching, writing, and publishing content.',
        agents: ['agent-1', 'agent-2'],
        status: 'active',
        progress: 65,
        lastRun: '1 hour ago'
    },
    {
        id: 'workflow-2',
        name: 'Customer Support Automation',
        description: 'Automated workflow for handling common customer support requests.',
        agents: ['agent-4'],
        status: 'active',
        progress: 80,
        lastRun: '30 mins ago'
    },
    {
        id: 'workflow-3',
        name: 'Data Analysis Pipeline',
        description: 'Workflow for collecting, processing, and analyzing data sets.',
        agents: ['agent-3', 'agent-5'],
        status: 'idle',
        progress: 0,
        lastRun: '2 days ago'
    },
    {
        id: 'workflow-4',
        name: 'Meeting Coordination',
        description: 'Automated workflow for scheduling and coordinating team meetings.',
        agents: ['agent-6'],
        status: 'active',
        progress: 40,
        lastRun: '45 mins ago'
    }
];

// Spatial View Data (for nodes and connections)
const spatialData = {
    nodes: [
        { id: 'node-1', type: 'agent', label: 'RA', x: 100, y: 150, refId: 'agent-1' },
        { id: 'node-2', type: 'agent', label: 'CW', x: 250, y: 100, refId: 'agent-2' },
        { id: 'node-3', type: 'agent', label: 'DA', x: 400, y: 200, refId: 'agent-3' },
        { id: 'node-4', type: 'agent', label: 'CS', x: 150, y: 300, refId: 'agent-4' },
        { id: 'node-5', type: 'task', label: 'T1', x: 180, y: 80, refId: 'task-1' },
        { id: 'node-6', type: 'task', label: 'T2', x: 320, y: 150, refId: 'task-2' },
        { id: 'node-7', type: 'task', label: 'T4', x: 80, y: 250, refId: 'task-4' },
        { id: 'node-8', type: 'workflow', label: 'W1', x: 200, y: 200, refId: 'workflow-1' },
        { id: 'node-9', type: 'workflow', label: 'W2', x: 100, y: 350, refId: 'workflow-2' }
    ],
    edges: [
        { from: 'node-1', to: 'node-5' },
        { from: 'node-1', to: 'node-8' },
        { from: 'node-2', to: 'node-6' },
        { from: 'node-2', to: 'node-8' },
        { from: 'node-4', to: 'node-7' },
        { from: 'node-4', to: 'node-9' },
        { from: 'node-8', to: 'node-6' }
    ]
};

