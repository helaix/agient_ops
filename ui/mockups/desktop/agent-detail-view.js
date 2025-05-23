// Agent Detail View JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Context Graph
    initContextGraph();
    
    // Initialize Performance Charts
    initPerformanceCharts();
    
    // Setup Event Listeners
    setupEventListeners();
});

// Initialize the Context Access Graph
function initContextGraph() {
    const ctx = document.getElementById('contextGraph').getContext('2d');
    
    // Sample data for the context graph
    const nodes = [
        { id: 'agent', label: 'Research Agent', x: 250, y: 100, radius: 30, color: '#4a6cf7' },
        { id: 'db', label: 'Market Research DB', x: 150, y: 180, radius: 25, color: '#28a745' },
        { id: 'reports', label: 'Company Reports', x: 250, y: 180, radius: 25, color: '#fd7e14' },
        { id: 'web', label: 'Web Search History', x: 350, y: 180, radius: 25, color: '#17a2b8' },
        { id: 'analyst', label: 'Data Analyst', x: 100, y: 100, radius: 20, color: '#6c757d' },
        { id: 'writer', label: 'Content Writer', x: 400, y: 100, radius: 20, color: '#6c757d' }
    ];
    
    const edges = [
        { from: 'agent', to: 'db', width: 3, color: '#28a745' },
        { from: 'agent', to: 'reports', width: 2, color: '#fd7e14' },
        { from: 'agent', to: 'web', width: 3, color: '#17a2b8' },
        { from: 'agent', to: 'analyst', width: 2, color: '#6c757d' },
        { from: 'agent', to: 'writer', width: 1, color: '#6c757d' },
        { from: 'analyst', to: 'db', width: 2, color: '#28a745' },
        { from: 'writer', to: 'reports', width: 1, color: '#fd7e14' }
    ];
    
    // Custom rendering for the context graph
    const graph = {
        nodes: nodes,
        edges: edges,
        draw: function() {
            // Clear canvas
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Draw edges
            this.edges.forEach(edge => {
                const fromNode = this.nodes.find(n => n.id === edge.from);
                const toNode = this.nodes.find(n => n.id === edge.to);
                
                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(toNode.x, toNode.y);
                ctx.strokeStyle = edge.color;
                ctx.lineWidth = edge.width;
                ctx.stroke();
            });
            
            // Draw nodes
            this.nodes.forEach(node => {
                // Draw circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.fill();
                
                // Draw label
                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.label, node.x, node.y);
            });
        }
    };
    
    // Set canvas size
    ctx.canvas.width = ctx.canvas.offsetWidth;
    ctx.canvas.height = ctx.canvas.offsetHeight;
    
    // Initial draw
    graph.draw();
    
    // Redraw on window resize
    window.addEventListener('resize', function() {
        ctx.canvas.width = ctx.canvas.offsetWidth;
        ctx.canvas.height = ctx.canvas.offsetHeight;
        graph.draw();
    });
}

// Initialize Performance Metric Charts
function initPerformanceCharts() {
    // Response Time Chart
    const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
    const responseTimeChart = new Chart(responseTimeCtx, {
        type: 'line',
        data: {
            labels: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'],
            datasets: [{
                label: 'Response Time (s)',
                data: [2.1, 2.3, 1.9, 2.0, 1.7, 1.8, 1.6],
                borderColor: '#4a6cf7',
                backgroundColor: 'rgba(74, 108, 247, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Completion Rate Chart
    const completionRateCtx = document.getElementById('completionRateChart').getContext('2d');
    const completionRateChart = new Chart(completionRateCtx, {
        type: 'line',
        data: {
            labels: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'],
            datasets: [{
                label: 'Completion Rate (%)',
                data: [92, 89, 93, 95, 91, 94, 96],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 80,
                    max: 100,
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Resource Efficiency Chart
    const resourceEfficiencyCtx = document.getElementById('resourceEfficiencyChart').getContext('2d');
    const resourceEfficiencyChart = new Chart(resourceEfficiencyCtx, {
        type: 'line',
        data: {
            labels: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'],
            datasets: [{
                label: 'Resource Efficiency (%)',
                data: [82, 79, 83, 85, 86, 84, 87],
                borderColor: '#fd7e14',
                backgroundColor: 'rgba(253, 126, 20, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 70,
                    max: 100,
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Tasks Completed Chart
    const tasksCompletedCtx = document.getElementById('tasksCompletedChart').getContext('2d');
    const tasksCompletedChart = new Chart(tasksCompletedCtx, {
        type: 'bar',
        data: {
            labels: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'],
            datasets: [{
                label: 'Tasks Completed',
                data: [5, 7, 6, 8, 4, 6, 6],
                backgroundColor: '#17a2b8'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Setup Event Listeners for Interactive Elements
function setupEventListeners() {
    // Agent List Selection
    const agentItems = document.querySelectorAll('.agent-item');
    agentItems.forEach(item => {
        item.addEventListener('click', function() {
            agentItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            // In a real implementation, this would load the selected agent's data
        });
    });
    
    // Task Management
    const taskButtons = document.querySelectorAll('.task-btn');
    taskButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            // In a real implementation, this would perform the task action
            const action = this.querySelector('i').classList.contains('fa-pause') ? 'pause' : 
                          this.querySelector('i').classList.contains('fa-times') ? 'cancel' :
                          this.querySelector('i').classList.contains('fa-arrow-up') ? 'prioritize' : 'edit';
            console.log(`Task action: ${action}`);
        });
    });
    
    // Context Item Selection
    const contextItems = document.querySelectorAll('.context-item');
    contextItems.forEach(item => {
        item.addEventListener('click', function() {
            contextItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            // In a real implementation, this would show details for the selected context
        });
    });
    
    // Time Filter for Performance Metrics
    const timeFilters = document.querySelectorAll('.time-filter span');
    timeFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            timeFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            // In a real implementation, this would update the charts with new time range data
        });
    });
    
    // Command Input Handling
    const commandInput = document.querySelector('.command-input');
    const sendBtn = document.querySelector('.send-btn');
    const terminalOutput = document.querySelector('.terminal-output');
    
    function sendCommand() {
        if (commandInput.value.trim() === '') return;
        
        const command = commandInput.value;
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // Add user command to terminal
        const userLine = document.createElement('div');
        userLine.className = 'terminal-line user';
        userLine.innerHTML = `<span class="timestamp">${timestamp}</span><span class="content">User: @research ${command}</span>`;
        terminalOutput.appendChild(userLine);
        
        // Simulate agent response
        setTimeout(() => {
            const agentLine = document.createElement('div');
            agentLine.className = 'terminal-line agent';
            agentLine.innerHTML = `<span class="timestamp">${timestamp}</span><span class="content">Agent: Processing your request: "${command}"...</span>`;
            terminalOutput.appendChild(agentLine);
            
            // Scroll to bottom
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }, 500);
        
        // Clear input
        commandInput.value = '';
        
        // Scroll to bottom
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    
    sendBtn.addEventListener('click', sendCommand);
    commandInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendCommand();
        }
    });
    
    // Command Suggestions
    const suggestions = document.querySelectorAll('.suggestion-item');
    suggestions.forEach(suggestion => {
        suggestion.addEventListener('click', function() {
            commandInput.value = this.textContent;
            commandInput.focus();
        });
    });
    
    // Agent Action Buttons
    const agentActionBtns = document.querySelectorAll('.agent-actions .action-btn');
    agentActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('i').classList.contains('fa-pause') ? 'pause' : 
                          this.querySelector('i').classList.contains('fa-sync') ? 'restart' : 'stop';
            console.log(`Agent action: ${action}`);
            // In a real implementation, this would perform the agent action
        });
    });
    
    // Configuration Panel Toggle
    const configBtn = document.querySelector('.section-action');
    const rightSidebar = document.querySelector('.right-sidebar');
    const closeBtn = document.querySelector('.close-btn');
    
    configBtn.addEventListener('click', function() {
        rightSidebar.style.display = rightSidebar.style.display === 'none' ? 'flex' : 'none';
    });
    
    closeBtn.addEventListener('click', function() {
        rightSidebar.style.display = 'none';
    });
    
    // Initially hide the right sidebar
    rightSidebar.style.display = 'none';
}

// Function to handle navigation between views
function navigateToView(viewName) {
    // In a real implementation, this would navigate to different views
    console.log(`Navigating to: ${viewName}`);
    
    // For demonstration, we'll just show a message
    if (viewName === 'command-center') {
        alert('Navigating to Command Center View');
    } else if (viewName === 'workflow') {
        alert('Navigating to Workflow Designer View');
    }
}

// Add navigation event listeners
document.addEventListener('DOMContentLoaded', function() {
    const commandCenterBtn = document.querySelector('.view-btn:nth-child(1)');
    const workflowBtn = document.querySelector('.view-btn:nth-child(2)');
    
    commandCenterBtn.addEventListener('click', function() {
        navigateToView('command-center');
    });
    
    workflowBtn.addEventListener('click', function() {
        navigateToView('workflow');
    });
});

