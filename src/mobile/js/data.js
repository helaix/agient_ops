/**
 * Sample data for the Mobile Focused Interface
 * This file contains mock data for demonstration purposes
 */

// Agent data
const agentData = [
    {
        id: 'agent-1',
        name: 'Research Assistant',
        type: 'Information Retrieval',
        status: 'online',
        priority: 2,
        progress: 75,
        avatar: 'assets/placeholder.svg'
    },
    {
        id: 'agent-2',
        name: 'Code Generator',
        type: 'Development',
        status: 'busy',
        priority: 4,
        progress: 32,
        avatar: 'assets/placeholder.svg'
    },
    {
        id: 'agent-3',
        name: 'Data Analyzer',
        type: 'Analytics',
        status: 'online',
        priority: 3,
        progress: 89,
        avatar: 'assets/placeholder.svg'
    },
    {
        id: 'agent-4',
        name: 'Content Writer',
        type: 'Creative',
        status: 'idle',
        priority: 1,
        progress: 45,
        avatar: 'assets/placeholder.svg'
    },
    {
        id: 'agent-5',
        name: 'Customer Support',
        type: 'Communication',
        status: 'offline',
        priority: 2,
        progress: 0,
        avatar: 'assets/placeholder.svg'
    }
];

// Activity data
const activityData = [
    {
        id: 'activity-1',
        title: 'Research Agent completed task #1234',
        time: '2 minutes ago',
        type: 'success',
        icon: 'fa-check'
    },
    {
        id: 'activity-2',
        title: 'Code Generator needs attention',
        time: '15 minutes ago',
        type: 'alert',
        icon: 'fa-exclamation'
    },
    {
        id: 'activity-3',
        title: 'New task assigned to Data Analyzer',
        time: '32 minutes ago',
        type: 'task',
        icon: 'fa-tasks'
    },
    {
        id: 'activity-4',
        title: 'System update completed',
        time: '1 hour ago',
        type: 'info',
        icon: 'fa-info'
    },
    {
        id: 'activity-5',
        title: 'Content Writer started new project',
        time: '2 hours ago',
        type: 'task',
        icon: 'fa-play'
    }
];

// Resource usage data for chart
const resourceData = {
    labels: ['CPU', 'Memory', 'Network', 'Storage'],
    datasets: [
        {
            label: 'Current Usage',
            data: [65, 78, 42, 30],
            backgroundColor: 'rgba(74, 108, 247, 0.2)',
            borderColor: 'rgba(74, 108, 247, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(74, 108, 247, 1)',
            pointRadius: 3
        }
    ]
};

// Voice commands
const voiceCommands = [
    {
        command: 'create task',
        action: 'createNewTask'
    },
    {
        command: 'add agent',
        action: 'addNewAgent'
    },
    {
        command: 'show status',
        action: 'showSystemStatus'
    },
    {
        command: 'pause all',
        action: 'pauseAllAgents'
    },
    {
        command: 'resume all',
        action: 'resumeAllAgents'
    }
];

// Quick actions
const quickActions = [
    {
        id: 'action-1',
        name: 'Add Task',
        icon: 'fa-plus-circle',
        action: 'createNewTask'
    },
    {
        id: 'action-2',
        name: 'Pause All',
        icon: 'fa-pause-circle',
        action: 'pauseAllAgents'
    },
    {
        id: 'action-3',
        name: 'System Status',
        icon: 'fa-chart-line',
        action: 'showSystemStatus'
    },
    {
        id: 'action-4',
        name: 'Voice Command',
        icon: 'fa-microphone',
        action: 'activateVoiceCommand'
    }
];
