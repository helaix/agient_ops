// Desktop Command Center View - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all views
    initMapView();
    initTimelineView();
    initKanbanView();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
});

// View Switching
function setupEventListeners() {
    // View switching buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const viewType = this.getAttribute('data-view');
            switchView(viewType);
        });
    });
    
    // Agent selection in the left sidebar
    const agents = document.querySelectorAll('.agent');
    agents.forEach(agent => {
        agent.addEventListener('click', function() {
            const agentId = this.getAttribute('data-agent-id');
            selectAgent(agentId);
        });
    });
    
    // Command input activation
    document.addEventListener('keydown', function(e) {
        if (e.key === '/' && !isInputFocused()) {
            e.preventDefault();
            showCommandInput();
        }
        
        if (e.key === 'Escape') {
            hideCommandInput();
            hideNotificationPanel();
        }
    });
    
    // Notification panel toggle
    const notificationBtn = document.querySelector('.notification-btn');
    notificationBtn.addEventListener('click', function() {
        toggleNotificationPanel();
    });
    
    // Close buttons
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const panel = this.closest('.notification-panel, .command-input');
            if (panel) {
                panel.style.display = 'none';
            }
        });
    });
    
    // Map control buttons
    const mapControlButtons = document.querySelectorAll('.map-control-btn');
    mapControlButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('title');
            handleMapControl(action);
        });
    });
    
    // Timeline control buttons
    const timelineControlButtons = document.querySelectorAll('.timeline-control-btn');
    timelineControlButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('title');
            handleTimelineControl(action);
        });
    });
    
    // Kanban control buttons
    const kanbanControlButtons = document.querySelectorAll('.kanban-control-btn');
    kanbanControlButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('title');
            handleKanbanControl(action);
        });
    });
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Alt + [Number] for agent selection
        if (e.altKey && !isNaN(parseInt(e.key)) && parseInt(e.key) > 0) {
            const agentIndex = parseInt(e.key) - 1;
            const agents = document.querySelectorAll('.agent');
            if (agentIndex < agents.length) {
                const agentId = agents[agentIndex].getAttribute('data-agent-id');
                selectAgent(agentId);
            }
        }
        
        // Ctrl + [Number] for view switching
        if (e.ctrlKey && !isNaN(parseInt(e.key)) && parseInt(e.key) > 0 && parseInt(e.key) <= 3) {
            const viewIndex = parseInt(e.key);
            let viewType;
            
            switch(viewIndex) {
                case 1:
                    viewType = 'map';
                    break;
                case 2:
                    viewType = 'timeline';
                    break;
                case 3:
                    viewType = 'kanban';
                    break;
            }
            
            if (viewType) {
                switchView(viewType);
            }
        }
    });
}

// Helper Functions
function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
}

function switchView(viewType) {
    // Update view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        if (button.getAttribute('data-view') === viewType) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Update view containers
    const viewContainers = document.querySelectorAll('.view-container');
    viewContainers.forEach(container => {
        if (container.id === `${viewType}-view`) {
            container.classList.add('active');
        } else {
            container.classList.remove('active');
        }
    });
}

function selectAgent(agentId) {
    // Update selected agent in the sidebar
    const agents = document.querySelectorAll('.agent');
    agents.forEach(agent => {
        if (agent.getAttribute('data-agent-id') === agentId) {
            agent.classList.add('selected');
        } else {
            agent.classList.remove('selected');
        }
    });
    
    // Update context panel with agent details
    updateContextPanel(agentId);
    
    // Highlight the agent in the map view
    highlightAgentInMap(agentId);
}

function updateContextPanel(agentId) {
    // This would typically fetch agent data from an API
    // For now, we'll just update the UI with mock data
    const agentData = getAgentData(agentId);
    
    if (!agentData) return;
    
    // Update agent details
    document.querySelector('.agent-details h4').textContent = agentData.name;
    document.querySelector('.agent-meta .meta-item:nth-child(1) span').textContent = `Status: ${agentData.status}`;
    document.querySelector('.agent-meta .meta-item:nth-child(1) i').className = `fas fa-circle ${agentData.statusClass}`;
    document.querySelector('.agent-meta .meta-item:nth-child(2) span').textContent = `Uptime: ${agentData.uptime}`;
    document.querySelector('.agent-meta .meta-item:nth-child(3) span').textContent = `CPU: ${agentData.cpu}`;
    document.querySelector('.agent-meta .meta-item:nth-child(4) span').textContent = `Memory: ${agentData.memory}`;
    document.querySelector('.agent-description p').textContent = agentData.description;
    
    // Update current task
    document.querySelector('.current-task .task-name').textContent = agentData.currentTask;
    document.querySelector('.current-task .progress').style.width = `${agentData.taskProgress}%`;
    document.querySelector('.current-task .task-progress span').textContent = `${agentData.taskProgress}%`;
    document.querySelector('.task-meta .meta-item:nth-child(1) span').textContent = `Est. completion: ${agentData.estimatedCompletion}`;
    document.querySelector('.task-meta .meta-item:nth-child(2) span').textContent = `Priority: ${agentData.priority}`;
}

function showCommandInput() {
    const commandInput = document.getElementById('command-input');
    commandInput.style.display = 'block';
    commandInput.querySelector('input').focus();
}

function hideCommandInput() {
    const commandInput = document.getElementById('command-input');
    commandInput.style.display = 'none';
}

function toggleNotificationPanel() {
    const notificationPanel = document.getElementById('notification-panel');
    if (notificationPanel.style.display === 'flex') {
        notificationPanel.style.display = 'none';
    } else {
        notificationPanel.style.display = 'flex';
    }
}

function hideNotificationPanel() {
    const notificationPanel = document.getElementById('notification-panel');
    notificationPanel.style.display = 'none';
}

// Map View Functions
function initMapView() {
    const mapContainer = document.getElementById('agent-map');
    const width = mapContainer.clientWidth;
    const height = mapContainer.clientHeight;
    
    // Create SVG container
    const svg = d3.select('#agent-map')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create a group for all map elements
    const g = svg.append('g');
    
    // Sample agent data for the map
    const agents = [
        { id: 'agent1', name: 'Research Agent', status: 'active', x: width * 0.3, y: height * 0.3 },
        { id: 'agent2', name: 'Writer Agent', status: 'busy', x: width * 0.7, y: height * 0.2 },
        { id: 'agent3', name: 'Data Agent', status: 'error', x: width * 0.2, y: height * 0.7 },
        { id: 'agent4', name: 'Assistant Agent', status: 'idle', x: width * 0.6, y: height * 0.6 },
        { id: 'agent5', name: 'Code Agent', status: 'active', x: width * 0.5, y: height * 0.4 }
    ];
    
    // Sample links between agents
    const links = [
        { source: 'agent1', target: 'agent2', type: 'direct' },
        { source: 'agent1', target: 'agent3', type: 'direct' },
        { source: 'agent2', target: 'agent5', type: 'context' },
        { source: 'agent3', target: 'agent4', type: 'context' },
        { source: 'agent4', target: 'agent5', type: 'direct' }
    ];
    
    // Create links
    const linkElements = g.selectAll('.agent-link')
        .data(links)
        .enter()
        .append('line')
        .attr('class', d => `agent-link ${d.type}`)
        .attr('x1', d => agents.find(a => a.id === d.source).x)
        .attr('y1', d => agents.find(a => a.id === d.source).y)
        .attr('x2', d => agents.find(a => a.id === d.target).x)
        .attr('y2', d => agents.find(a => a.id === d.target).y);
    
    // Create agent nodes
    const agentNodes = g.selectAll('.agent-node')
        .data(agents)
        .enter()
        .append('g')
        .attr('class', d => `agent-node ${d.status}`)
        .attr('id', d => `map-${d.id}`)
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
        .on('click', function(event, d) {
            selectAgent(d.id);
        });
    
    // Add circles for agents
    agentNodes.append('circle')
        .attr('r', 25);
    
    // Add icons for agents
    agentNodes.append('text')
        .attr('y', 5)
        .html(d => {
            let icon;
            switch(d.id) {
                case 'agent1': icon = '&#xf002;'; break; // search
                case 'agent2': icon = '&#xf303;'; break; // pen
                case 'agent3': icon = '&#xf1c0;'; break; // database
                case 'agent4': icon = '&#xf075;'; break; // comment
                case 'agent5': icon = '&#xf121;'; break; // code
                default: icon = '&#xf544;'; // robot
            }
            return icon;
        })
        .attr('class', 'fas')
        .style('font-family', 'FontAwesome')
        .style('font-size', '16px')
        .style('fill', 'white');
    
    // Add labels for agents
    agentNodes.append('text')
        .attr('y', 45)
        .text(d => d.name)
        .style('font-size', '12px');
    
    // Add zoom and pan behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    
    svg.call(zoom);
}

function highlightAgentInMap(agentId) {
    // Remove highlight from all agents
    d3.selectAll('.agent-node').classed('highlighted', false);
    
    // Add highlight to selected agent
    d3.select(`#map-${agentId}`).classed('highlighted', true);
}

function handleMapControl(action) {
    const svg = d3.select('#agent-map svg');
    const g = svg.select('g');
    
    switch(action) {
        case 'Zoom In':
            svg.transition().call(d3.zoom().scaleBy, 1.2);
            break;
        case 'Zoom Out':
            svg.transition().call(d3.zoom().scaleBy, 0.8);
            break;
        case 'Reset View':
            svg.transition().call(d3.zoom().transform, d3.zoomIdentity);
            break;
        case 'Group Agents':
            // This would implement agent grouping functionality
            console.log('Group agents functionality would be implemented here');
            break;
    }
}

// Timeline View Functions
function initTimelineView() {
    const timelineContainer = document.getElementById('agent-timeline');
    
    // Create timeline header with days
    const timelineHeader = document.createElement('div');
    timelineHeader.className = 'timeline-header';
    
    const headerLabel = document.createElement('div');
    headerLabel.className = 'timeline-header-label';
    headerLabel.textContent = 'Agent';
    timelineHeader.appendChild(headerLabel);
    
    const headerDays = document.createElement('div');
    headerDays.className = 'timeline-header-days';
    
    // Add days to the header
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'timeline-day';
        dayElement.textContent = day;
        headerDays.appendChild(dayElement);
    });
    
    timelineHeader.appendChild(headerDays);
    timelineContainer.appendChild(timelineHeader);
    
    // Sample agent data for the timeline
    const agents = [
        { id: 'agent1', name: 'Research Agent', tasks: [
            { id: 'task1', name: 'Data Collection', start: 0, duration: 1.5, status: 'active' },
            { id: 'task2', name: 'Analysis', start: 2, duration: 2, status: 'busy' }
        ]},
        { id: 'agent2', name: 'Writer Agent', tasks: [
            { id: 'task3', name: 'Draft Content', start: 1, duration: 2, status: 'busy' },
            { id: 'task4', name: 'Review', start: 3.5, duration: 1, status: 'idle' }
        ]},
        { id: 'agent3', name: 'Data Agent', tasks: [
            { id: 'task5', name: 'API Integration', start: 0, duration: 1, status: 'error' },
            { id: 'task6', name: 'Data Processing', start: 2.5, duration: 1.5, status: 'idle' }
        ]},
        { id: 'agent4', name: 'Assistant Agent', tasks: [
            { id: 'task7', name: 'User Support', start: 0.5, duration: 4, status: 'idle' }
        ]},
        { id: 'agent5', name: 'Code Agent', tasks: [
            { id: 'task8', name: 'Refactoring', start: 0, duration: 2, status: 'active' },
            { id: 'task9', name: 'Testing', start: 2.5, duration: 1.5, status: 'busy' }
        ]}
    ];
    
    // Create timeline rows for each agent
    agents.forEach(agent => {
        const timelineRow = document.createElement('div');
        timelineRow.className = 'timeline-row';
        timelineRow.setAttribute('data-agent-id', agent.id);
        
        const timelineLabel = document.createElement('div');
        timelineLabel.className = 'timeline-label';
        timelineLabel.textContent = agent.name;
        timelineRow.appendChild(timelineLabel);
        
        const timelineTasks = document.createElement('div');
        timelineTasks.className = 'timeline-tasks';
        
        // Add grid lines
        const timelineGrid = document.createElement('div');
        timelineGrid.className = 'timeline-grid';
        
        for (let i = 1; i < 5; i++) {
            const gridLine = document.createElement('div');
            gridLine.className = 'timeline-grid-line';
            gridLine.style.left = `${i * 20}%`;
            timelineGrid.appendChild(gridLine);
        }
        
        timelineTasks.appendChild(timelineGrid);
        
        // Add tasks for this agent
        agent.tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `timeline-task ${task.status}`;
            taskElement.textContent = task.name;
            taskElement.style.left = `${task.start * 20}%`;
            taskElement.style.width = `${task.duration * 20}%`;
            taskElement.setAttribute('data-task-id', task.id);
            
            taskElement.addEventListener('click', function() {
                selectAgent(agent.id);
                // Additional logic to show task details could be added here
            });
            
            timelineTasks.appendChild(taskElement);
        });
        
        timelineRow.appendChild(timelineTasks);
        timelineContainer.appendChild(timelineRow);
    });
}

function handleTimelineControl(action) {
    const timelineContainer = document.getElementById('agent-timeline');
    
    switch(action) {
        case 'Zoom In':
            // Implement zoom in functionality
            console.log('Timeline zoom in would be implemented here');
            break;
        case 'Zoom Out':
            // Implement zoom out functionality
            console.log('Timeline zoom out would be implemented here');
            break;
        case 'Today':
            // Implement scroll to today functionality
            console.log('Timeline scroll to today would be implemented here');
            break;
    }
}

// Kanban View Functions
function initKanbanView() {
    const kanbanBoard = document.getElementById('agent-kanban');
    
    // Sample kanban data
    const columns = [
        { id: 'backlog', name: 'Backlog', count: 3 },
        { id: 'inProgress', name: 'In Progress', count: 4 },
        { id: 'review', name: 'Review', count: 2 },
        { id: 'completed', name: 'Completed', count: 3 }
    ];
    
    // Sample tasks for each column
    const tasks = {
        'backlog': [
            { id: 'task1', title: 'Research Market Trends', agent: { id: 'agent1', name: 'Research Agent', status: 'active' }, priority: 'high' },
            { id: 'task2', title: 'Prepare Data Schema', agent: { id: 'agent3', name: 'Data Agent', status: 'error' }, priority: 'medium' },
            { id: 'task3', title: 'Draft User Guide', agent: { id: 'agent2', name: 'Writer Agent', status: 'busy' }, priority: 'low' }
        ],
        'inProgress': [
            { id: 'task4', title: 'Analyze Competitor Data', agent: { id: 'agent1', name: 'Research Agent', status: 'active' }, priority: 'high' },
            { id: 'task5', title: 'Refactor Authentication Module', agent: { id: 'agent5', name: 'Code Agent', status: 'active' }, priority: 'high' },
            { id: 'task6', title: 'Write API Documentation', agent: { id: 'agent2', name: 'Writer Agent', status: 'busy' }, priority: 'medium' },
            { id: 'task7', title: 'User Support Tickets', agent: { id: 'agent4', name: 'Assistant Agent', status: 'idle' }, priority: 'low' }
        ],
        'review': [
            { id: 'task8', title: 'Code Review: Payment Module', agent: { id: 'agent5', name: 'Code Agent', status: 'active' }, priority: 'medium' },
            { id: 'task9', title: 'Review Market Analysis Report', agent: { id: 'agent1', name: 'Research Agent', status: 'active' }, priority: 'high' }
        ],
        'completed': [
            { id: 'task10', title: 'Database Schema Migration', agent: { id: 'agent3', name: 'Data Agent', status: 'error' }, priority: 'high' },
            { id: 'task11', title: 'User Onboarding Flow', agent: { id: 'agent4', name: 'Assistant Agent', status: 'idle' }, priority: 'medium' },
            { id: 'task12', title: 'Security Audit', agent: { id: 'agent5', name: 'Code Agent', status: 'active' }, priority: 'high' }
        ]
    };
    
    // Create columns
    columns.forEach(column => {
        const columnElement = document.createElement('div');
        columnElement.className = 'kanban-column';
        columnElement.setAttribute('data-column-id', column.id);
        
        const columnHeader = document.createElement('div');
        columnHeader.className = 'kanban-column-header';
        
        const columnTitle = document.createElement('span');
        columnTitle.textContent = column.name;
        
        const columnCount = document.createElement('span');
        columnCount.className = 'kanban-column-count';
        columnCount.textContent = column.count;
        
        columnHeader.appendChild(columnTitle);
        columnHeader.appendChild(columnCount);
        columnElement.appendChild(columnHeader);
        
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'kanban-cards';
        
        // Add "Add Card" button at the top
        const addCardButton = document.createElement('div');
        addCardButton.className = 'kanban-add-card';
        addCardButton.innerHTML = '<i class="fas fa-plus"></i> Add Task';
        cardsContainer.appendChild(addCardButton);
        
        // Add tasks for this column
        if (tasks[column.id]) {
            tasks[column.id].forEach(task => {
                const cardElement = document.createElement('div');
                cardElement.className = 'kanban-card';
                cardElement.setAttribute('data-task-id', task.id);
                cardElement.setAttribute('draggable', 'true');
                
                const cardTitle = document.createElement('div');
                cardTitle.className = 'kanban-card-title';
                cardTitle.textContent = task.title;
                
                const cardAgent = document.createElement('div');
                cardAgent.className = 'kanban-card-agent';
                
                const agentStatus = document.createElement('div');
                agentStatus.className = `kanban-card-agent-status ${task.agent.status}`;
                
                const agentName = document.createElement('span');
                agentName.textContent = task.agent.name;
                
                cardAgent.appendChild(agentStatus);
                cardAgent.appendChild(agentName);
                
                const cardFooter = document.createElement('div');
                cardFooter.className = 'kanban-card-footer';
                
                const cardPriority = document.createElement('div');
                cardPriority.className = `kanban-card-priority ${task.priority}`;
                cardPriority.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
                
                const cardActions = document.createElement('div');
                cardActions.className = 'kanban-card-actions';
                cardActions.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
                
                cardFooter.appendChild(cardPriority);
                cardFooter.appendChild(cardActions);
                
                cardElement.appendChild(cardTitle);
                cardElement.appendChild(cardAgent);
                cardElement.appendChild(cardFooter);
                
                // Add event listener to select the agent when clicking on a card
                cardElement.addEventListener('click', function() {
                    selectAgent(task.agent.id);
                });
                
                // Add drag and drop functionality
                cardElement.addEventListener('dragstart', function(e) {
                    e.dataTransfer.setData('text/plain', task.id);
                    this.classList.add('dragging');
                });
                
                cardElement.addEventListener('dragend', function() {
                    this.classList.remove('dragging');
                });
                
                cardsContainer.appendChild(cardElement);
            });
        }
        
        columnElement.appendChild(cardsContainer);
        kanbanBoard.appendChild(columnElement);
    });
    
    // Add drag and drop functionality to columns
    const kanbanColumns = document.querySelectorAll('.kanban-column');
    kanbanColumns.forEach(column => {
        column.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        column.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        column.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const task = document.querySelector(`[data-task-id="${taskId}"]`);
            
            if (task) {
                const cardsContainer = this.querySelector('.kanban-cards');
                cardsContainer.appendChild(task);
                
                // Update column counts
                updateKanbanColumnCounts();
            }
        });
    });
}

function updateKanbanColumnCounts() {
    const columns = document.querySelectorAll('.kanban-column');
    
    columns.forEach(column => {
        const cards = column.querySelectorAll('.kanban-card');
        const countElement = column.querySelector('.kanban-column-count');
        
        if (countElement) {
            countElement.textContent = cards.length;
        }
    });
}

function handleKanbanControl(action) {
    switch(action) {
        case 'Add Column':
            // Implement add column functionality
            console.log('Add column functionality would be implemented here');
            break;
        case 'Collapse All':
            // Implement collapse all functionality
            console.log('Collapse all functionality would be implemented here');
            break;
        case 'Expand All':
            // Implement expand all functionality
            console.log('Expand all functionality would be implemented here');
            break;
    }
}

// Mock Data Functions
function getAgentData(agentId) {
    // This would typically come from an API
    const agentData = {
        'agent1': {
            name: 'Research Agent',
            status: 'Active',
            statusClass: 'active',
            uptime: '3h 45m',
            cpu: '42%',
            memory: '512MB',
            description: 'Specialized in gathering and analyzing information from various data sources. Currently working on market research for Project Alpha.',
            currentTask: 'Analyzing data sources',
            taskProgress: 65,
            estimatedCompletion: '45m',
            priority: 'High'
        },
        'agent2': {
            name: 'Writer Agent',
            status: 'Busy',
            statusClass: 'busy',
            uptime: '5h 20m',
            cpu: '78%',
            memory: '768MB',
            description: 'Creates and edits written content based on research data and user requirements. Currently drafting documentation for the new API.',
            currentTask: 'Drafting content',
            taskProgress: 40,
            estimatedCompletion: '1h 30m',
            priority: 'Medium'
        },
        'agent3': {
            name: 'Data Agent',
            status: 'Error',
            statusClass: 'error',
            uptime: '1h 15m',
            cpu: '12%',
            memory: '256MB',
            description: 'Manages data connections and transformations between systems. Currently experiencing issues with the external API connection.',
            currentTask: 'API connection failed',
            taskProgress: 20,
            estimatedCompletion: 'Unknown',
            priority: 'High'
        },
        'agent4': {
            name: 'Assistant Agent',
            status: 'Idle',
            statusClass: 'idle',
            uptime: '8h 10m',
            cpu: '5%',
            memory: '128MB',
            description: 'Provides user support and handles routine inquiries. Currently waiting for new support tickets or user interactions.',
            currentTask: 'Waiting for tasks',
            taskProgress: 0,
            estimatedCompletion: 'N/A',
            priority: 'Low'
        },
        'agent5': {
            name: 'Code Agent',
            status: 'Active',
            statusClass: 'active',
            uptime: '4h 30m',
            cpu: '65%',
            memory: '1024MB',
            description: 'Specializes in code generation, refactoring, and optimization. Currently working on improving the authentication module.',
            currentTask: 'Refactoring module',
            taskProgress: 80,
            estimatedCompletion: '20m',
            priority: 'High'
        }
    };
    
    return agentData[agentId];
}

