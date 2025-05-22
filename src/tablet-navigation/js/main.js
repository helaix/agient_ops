/**
 * Main JavaScript file for the tablet navigation implementation
 * Initializes all components and populates the UI with sample data
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    window.tabNavigation = new TabNavigation();
    
    // Initialize gesture handler for spatial view
    const gestureHandler = new GestureHandler('spatial-canvas');
    
    // Initialize long-press handler
    const longPressHandler = new LongPressHandler();
    
    // Initialize swipe handler
    const swipeHandler = new SwipeHandler();
    
    // Populate UI with sample data
    populateAgentCards();
    populateTaskList();
    populateWorkflowCards();
    initializeSpatialView();
    
    // Set up event listeners for action buttons
    setupActionButtons();
    
    // Prevent default touch actions that might interfere with our custom handling
    preventDefaultTouchActions();
    
    // Add orientation change listener
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Initial orientation setup
    handleOrientationChange();
});

// Handle orientation changes
function handleOrientationChange() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const container = document.querySelector('.app-container');
    
    if (container) {
        container.classList.remove('landscape', 'portrait');
        container.classList.add(isPortrait ? 'portrait' : 'landscape');
    }
    
    // Adjust UI elements based on orientation
    adjustUIForOrientation(isPortrait);
}

// Adjust UI elements based on orientation
function adjustUIForOrientation(isPortrait) {
    const bottomTabBar = document.querySelector('.bottom-tab-bar');
    const mainContent = document.getElementById('main-content');
    
    if (isPortrait) {
        // Portrait adjustments
        if (bottomTabBar) {
            bottomTabBar.style.height = 'var(--bottom-bar-height)';
        }
        
        if (mainContent) {
            mainContent.style.height = 'calc(100vh - var(--bottom-bar-height))';
            mainContent.style.paddingBottom = '90px';
        }
    } else {
        // Landscape adjustments
        if (bottomTabBar) {
            bottomTabBar.style.height = 'calc(var(--bottom-bar-height) * 0.8)';
        }
        
        if (mainContent) {
            mainContent.style.height = 'calc(100vh - (var(--bottom-bar-height) * 0.8))';
            mainContent.style.paddingBottom = '70px';
        }
    }
}

// Populate agent cards with sample data
function populateAgentCards() {
    const agentCardsContainer = document.querySelector('.agent-cards');
    if (!agentCardsContainer) return;
    
    // Clear container
    agentCardsContainer.innerHTML = '';
    
    // Add agent cards
    agentsData.forEach(agent => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = agent.id;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">${agent.name}</div>
                <div class="card-status ${agent.status}">${agent.status}</div>
            </div>
            <div class="card-content">
                ${agent.description}
            </div>
            <div class="card-footer">
                <div class="card-tasks">${agent.tasks} active tasks</div>
                <div class="card-last-active">Last active: ${agent.lastActive}</div>
            </div>
        `;
        
        agentCardsContainer.appendChild(card);
    });
}

// Populate task list with sample data
function populateTaskList() {
    const taskListContainer = document.querySelector('.task-list');
    if (!taskListContainer) return;
    
    // Clear container
    taskListContainer.innerHTML = '';
    
    // Add task items
    tasksData.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.dataset.id = task.id;
        
        taskItem.innerHTML = `
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-description">${task.description}</div>
            </div>
            <div class="task-meta">
                <div class="task-priority priority-${task.priority}">${task.priority}</div>
                <div class="task-due">${task.dueDate}</div>
            </div>
        `;
        
        taskListContainer.appendChild(taskItem);
    });
}

// Populate workflow cards with sample data
function populateWorkflowCards() {
    const workflowCardsContainer = document.querySelector('.workflow-cards');
    if (!workflowCardsContainer) return;
    
    // Clear container
    workflowCardsContainer.innerHTML = '';
    
    // Add workflow cards
    workflowsData.forEach(workflow => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = workflow.id;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">${workflow.name}</div>
                <div class="card-status ${workflow.status}">${workflow.status}</div>
            </div>
            <div class="card-content">
                ${workflow.description}
            </div>
            <div class="card-footer">
                <div class="card-progress">${workflow.progress}% complete</div>
                <div class="card-last-run">Last run: ${workflow.lastRun}</div>
            </div>
        `;
        
        workflowCardsContainer.appendChild(card);
    });
}

// Initialize spatial view with sample data
function initializeSpatialView() {
    const gestureHandler = new GestureHandler('spatial-canvas');
    gestureHandler.initSpatialView(spatialData.nodes, spatialData.edges);
    
    // Add reset view button functionality
    const resetViewButton = document.getElementById('reset-view');
    if (resetViewButton) {
        resetViewButton.addEventListener('click', () => {
            gestureHandler.resetView();
        });
    }
}

// Set up event listeners for action buttons
function setupActionButtons() {
    // Filter buttons
    document.getElementById('filter-agents')?.addEventListener('click', () => {
        simulateAction('Filtering agents...');
    });
    
    document.getElementById('filter-tasks')?.addEventListener('click', () => {
        simulateAction('Filtering tasks...');
    });
    
    document.getElementById('filter-workflows')?.addEventListener('click', () => {
        simulateAction('Filtering workflows...');
    });
    
    // Add buttons
    document.getElementById('add-agent')?.addEventListener('click', () => {
        simulateAction('Adding new agent...');
    });
    
    document.getElementById('add-task')?.addEventListener('click', () => {
        simulateAction('Adding new task...');
    });
    
    document.getElementById('add-workflow')?.addEventListener('click', () => {
        simulateAction('Adding new workflow...');
    });
}

// Prevent default touch actions that might interfere with our custom handling
function preventDefaultTouchActions() {
    // Prevent pull-to-refresh
    document.body.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent double-tap zoom
    let lastTap = 0;
    document.body.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
        }
        lastTap = currentTime;
    }, { passive: false });
}

// Utility function to simulate actions
function simulateAction(message) {
    // Create a toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '100px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '20px';
    toast.style.zIndex = '1000';
    
    // Add to the document
    document.body.appendChild(toast);
    
    // Remove after a delay
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 2000);
    
    // Trigger haptic feedback
    triggerHapticFeedback('light');
}

// Haptic feedback simulation
function triggerHapticFeedback(intensity = 'medium') {
    // Since we can't actually trigger haptic feedback in a web demo,
    // we'll simulate it with a visual indicator
    const hapticElement = document.createElement('div');
    hapticElement.className = 'haptic-feedback';
    document.body.appendChild(hapticElement);
    
    // Remove the element after animation completes
    setTimeout(() => {
        hapticElement.remove();
    }, 150);
    
    // If the device supports vibration, use it
    if ('vibrate' in navigator) {
        switch (intensity) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'heavy':
                navigator.vibrate([20, 30, 20]);
                break;
            default:
                navigator.vibrate(20);
        }
    }
}
