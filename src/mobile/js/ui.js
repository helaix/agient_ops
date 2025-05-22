/**
 * UI Components for Mobile Focused Interface
 * This file contains functions for rendering and managing UI components
 */

// DOM Elements
const agentCardsContainer = document.querySelector('.agent-cards');
const activityListContainer = document.querySelector('.activity-list');
const fabButton = document.getElementById('main-fab');
const fabActions = document.querySelector('.fab-actions');
const bottomNavItems = document.querySelectorAll('.nav-item');

/**
 * Renders agent cards based on provided data
 * @param {Array} agents - Array of agent objects
 */
function renderAgentCards(agents) {
    // Clear existing cards
    agentCardsContainer.innerHTML = '';
    
    // Get template
    const template = document.getElementById('agent-card-template');
    
    // Create and append agent cards
    agents.forEach(agent => {
        // Clone template
        const card = template.content.cloneNode(true);
        
        // Set agent data
        card.querySelector('.agent-name').textContent = agent.name;
        card.querySelector('.agent-type').textContent = agent.type;
        
        // Set avatar
        const avatarImg = card.querySelector('.agent-avatar img');
        avatarImg.src = agent.avatar;
        avatarImg.alt = `${agent.name} Avatar`;
        
        // Set status indicator
        const statusIndicator = card.querySelector('.status-indicator');
        statusIndicator.classList.add(`status-${agent.status}`);
        
        // Set priority level
        const priorityIndicator = card.querySelector('.priority-indicator');
        priorityIndicator.classList.add(`priority-level-${agent.priority}`);
        
        // Set progress
        const progressCircle = card.querySelector('.progress-circle-fill');
        progressCircle.setAttribute('stroke-dasharray', `${agent.progress}, 100`);
        
        const progressText = card.querySelector('.progress-text');
        progressText.textContent = `${agent.progress}%`;
        
        // Set color based on progress
        let progressColor;
        if (agent.progress < 30) {
            progressColor = 'var(--danger-color)';
        } else if (agent.progress < 70) {
            progressColor = 'var(--warning-color)';
        } else {
            progressColor = 'var(--success-color)';
        }
        progressCircle.style.stroke = progressColor;
        progressText.style.color = progressColor;
        
        // Append card to container
        agentCardsContainer.appendChild(card);
    });
}

/**
 * Renders activity list based on provided data
 * @param {Array} activities - Array of activity objects
 */
function renderActivityList(activities) {
    // Clear existing items
    activityListContainer.innerHTML = '';
    
    // Get template
    const template = document.getElementById('activity-item-template');
    
    // Create and append activity items
    activities.forEach(activity => {
        // Clone template
        const item = template.content.cloneNode(true);
        
        // Set activity data
        item.querySelector('.activity-title').textContent = activity.title;
        item.querySelector('.activity-time').textContent = activity.time;
        
        // Set icon
        const iconElement = item.querySelector('.activity-icon i');
        iconElement.classList.add(activity.icon);
        
        // Set type class
        const iconContainer = item.querySelector('.activity-icon');
        iconContainer.classList.add(`type-${activity.type}`);
        
        // Append item to container
        activityListContainer.appendChild(item);
    });
}

/**
 * Initializes the resource usage chart
 * @param {Object} data - Chart data object
 */
function initResourceChart(data) {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }
    
    const ctx = document.getElementById('resource-chart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    display: false
                },
                x: {
                    display: false
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true
                }
            },
            elements: {
                line: {
                    tension: 0.4
                }
            }
        }
    });
}

/**
 * Toggles the FAB menu
 */
function toggleFabMenu() {
    const fabContainer = document.querySelector('.fab-container');
    fabContainer.classList.toggle('active');
}

/**
 * Handles bottom navigation item clicks
 * @param {HTMLElement} item - Clicked navigation item
 */
function handleNavItemClick(item) {
    // Remove active class from all items
    bottomNavItems.forEach(navItem => {
        navItem.classList.remove('active');
    });
    
    // Add active class to clicked item
    item.classList.add('active');
    
    // Get view name
    const viewName = item.getAttribute('data-view');
    
    // Handle view change (placeholder for actual implementation)
    console.log(`Switching to ${viewName} view`);
    
    // Here you would implement actual view switching logic
    // For demo purposes, we're just logging the action
}

/**
 * Shows voice command interface
 */
function showVoiceInterface() {
    // Create voice indicator if it doesn't exist
    let voiceIndicator = document.querySelector('.voice-indicator');
    
    if (!voiceIndicator) {
        voiceIndicator = document.createElement('div');
        voiceIndicator.className = 'voice-indicator';
        
        const wavesContainer = document.createElement('div');
        wavesContainer.className = 'voice-waves';
        
        // Create wave elements
        for (let i = 0; i < 5; i++) {
            const wave = document.createElement('div');
            wave.className = 'voice-wave';
            wavesContainer.appendChild(wave);
        }
        
        const textElement = document.createElement('div');
        textElement.className = 'voice-text';
        textElement.textContent = 'Listening...';
        
        voiceIndicator.appendChild(wavesContainer);
        voiceIndicator.appendChild(textElement);
        
        document.body.appendChild(voiceIndicator);
    }
    
    // Show the indicator
    voiceIndicator.classList.add('active');
    
    // Hide after 5 seconds (simulating voice command completion)
    setTimeout(() => {
        voiceIndicator.classList.remove('active');
    }, 5000);
}

/**
 * Handles FAB action button clicks
 * @param {HTMLElement} button - Clicked action button
 */
function handleFabActionClick(button) {
    // Get action name
    const actionName = button.getAttribute('data-action');
    
    // Handle specific actions
    switch (actionName) {
        case 'voice-command':
            showVoiceInterface();
            break;
        case 'new-task':
            console.log('Creating new task');
            break;
        case 'new-agent':
            console.log('Adding new agent');
            break;
        case 'quick-action':
            console.log('Performing quick action');
            break;
        default:
            console.log(`Unknown action: ${actionName}`);
    }
    
    // Close the FAB menu
    toggleFabMenu();
}

/**
 * Handles agent action button clicks
 * @param {Event} event - Click event
 */
function handleAgentActionClick(event) {
    // Check if clicked element is an action button
    if (event.target.closest('.action-button')) {
        const button = event.target.closest('.action-button');
        const action = button.getAttribute('data-action');
        const agentCard = button.closest('.agent-card');
        
        // Get agent ID (would be set in a real implementation)
        const agentId = agentCard.getAttribute('data-agent-id') || 'unknown';
        
        // Handle specific actions
        switch (action) {
            case 'pause':
                console.log(`Pausing agent ${agentId}`);
                break;
            case 'info':
                console.log(`Showing info for agent ${agentId}`);
                break;
            default:
                console.log(`Unknown action ${action} for agent ${agentId}`);
        }
    }
}

