/**
 * Main JavaScript for Mobile Focused Interface
 * This file initializes the interface and sets up event listeners
 */

// Initialize the interface when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeInterface();
});

/**
 * Initializes the mobile interface
 */
function initializeInterface() {
    // Render agent cards
    renderAgentCards(agentData);
    
    // Render activity list
    renderActivityList(activityData);
    
    // Initialize resource chart
    // We're checking if Chart.js is loaded to prevent errors
    if (typeof Chart !== 'undefined') {
        initResourceChart(resourceData);
    } else {
        // Create a placeholder for the chart if Chart.js is not available
        const chartCanvas = document.getElementById('resource-chart');
        if (chartCanvas) {
            const ctx = chartCanvas.getContext('2d');
            ctx.font = '12px Arial';
            ctx.fillStyle = '#6c757d';
            ctx.textAlign = 'center';
            ctx.fillText('Chart data visualization', chartCanvas.width / 2, chartCanvas.height / 2);
        }
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Simulate loading state
    simulateLoading();
}

/**
 * Sets up event listeners for interactive elements
 */
function setupEventListeners() {
    // FAB button click
    const fabButton = document.getElementById('main-fab');
    if (fabButton) {
        fabButton.addEventListener('click', toggleFabMenu);
    }
    
    // FAB action buttons
    const fabActionButtons = document.querySelectorAll('.fab-action-button');
    fabActionButtons.forEach(button => {
        button.addEventListener('click', () => handleFabActionClick(button));
    });
    
    // Bottom navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => handleNavItemClick(item));
    });
    
    // Agent cards container for delegation
    const agentCardsContainer = document.querySelector('.agent-cards');
    if (agentCardsContainer) {
        agentCardsContainer.addEventListener('click', handleAgentActionClick);
    }
    
    // Close FAB menu when clicking outside
    document.addEventListener('click', (event) => {
        const fabContainer = document.querySelector('.fab-container');
        if (fabContainer && fabContainer.classList.contains('active')) {
            // Check if click is outside the FAB container
            if (!fabContainer.contains(event.target)) {
                fabContainer.classList.remove('active');
            }
        }
    });
    
    // Prevent clicks inside FAB container from closing it
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer) {
        fabContainer.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
}

/**
 * Simulates loading states for demonstration
 */
function simulateLoading() {
    // Show loading state
    document.body.classList.add('loading');
    
    // Simulate network delay
    setTimeout(() => {
        // Remove loading state
        document.body.classList.remove('loading');
        
        // Update UI with data
        updateUIWithData();
    }, 1000);
}

/**
 * Updates UI with data (simulated real-time updates)
 */
function updateUIWithData() {
    // Simulate real-time updates
    setInterval(() => {
        // Update a random agent's progress
        if (agentData.length > 0) {
            const randomIndex = Math.floor(Math.random() * agentData.length);
            const agent = agentData[randomIndex];
            
            // Randomly increase or decrease progress
            const progressChange = Math.floor(Math.random() * 10) - 3; // -3 to +6
            agent.progress = Math.max(0, Math.min(100, agent.progress + progressChange));
            
            // Re-render agent cards
            renderAgentCards(agentData);
        }
        
        // Simulate new activity every ~30 seconds
        if (Math.random() < 0.03) { // ~3% chance each update
            // Create a new activity
            const newActivity = {
                id: `activity-${Date.now()}`,
                title: 'New system notification received',
                time: 'Just now',
                type: 'info',
                icon: 'fa-bell'
            };
            
            // Add to the beginning of the array
            activityData.unshift(newActivity);
            
            // Keep only the most recent activities
            if (activityData.length > 10) {
                activityData.pop();
            }
            
            // Re-render activity list
            renderActivityList(activityData);
        }
    }, 10000); // Update every 10 seconds
}

/**
 * Handles voice commands (placeholder implementation)
 * @param {string} command - Voice command string
 */
function handleVoiceCommand(command) {
    // Find matching command
    const matchedCommand = voiceCommands.find(cmd => 
        command.toLowerCase().includes(cmd.command.toLowerCase())
    );
    
    if (matchedCommand) {
        console.log(`Executing command: ${matchedCommand.action}`);
        // Here you would call the appropriate function based on the action
    } else {
        console.log(`Unknown command: ${command}`);
    }
}

/**
 * Responsive adjustments based on screen size
 */
function handleResponsiveAdjustments() {
    const width = window.innerWidth;
    
    // Adjust for very small screens
    if (width < 360) {
        document.documentElement.classList.add('very-small-screen');
    } else {
        document.documentElement.classList.remove('very-small-screen');
    }
}

// Set up responsive adjustments
window.addEventListener('resize', handleResponsiveAdjustments);
handleResponsiveAdjustments(); // Initial check

