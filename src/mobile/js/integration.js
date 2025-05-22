/**
 * Integration script for Mobile Focused Interface
 * This file provides functions to integrate with other components of the Multi-Agent Management system
 */

// Integration with Mobile Hierarchical Navigation
const mobileIntegration = {
    // Connect to Mobile Hierarchical Navigation
    connectToHierarchicalNav: function() {
        // Get navigation items
        const navItems = document.querySelectorAll('.nav-item');
        
        // Add event listeners for navigation
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const view = this.getAttribute('data-view');
                
                // If this is a view that should transition to hierarchical navigation
                if (view === 'tasks' || view === 'notifications') {
                    mobileIntegration.transitionToHierarchicalNav(view);
                }
            });
        });
        
        // Add event listeners for agent cards
        document.querySelector('.agent-cards').addEventListener('click', function(e) {
            // If clicking on an agent card (not an action button)
            if (e.target.closest('.agent-card') && !e.target.closest('.action-button')) {
                const agentCard = e.target.closest('.agent-card');
                const agentId = agentCard.getAttribute('data-agent-id') || '1';
                mobileIntegration.transitionToHierarchicalNav('agent-detail', { agentId });
            }
        });
    },
    
    // Transition to hierarchical navigation
    transitionToHierarchicalNav: function(view, params = {}) {
        // In a real implementation, this would navigate to the hierarchical navigation component
        // For now, we'll just log the action
        console.log(`Transitioning to hierarchical navigation: ${view}`, params);
        
        // Example of how this would work with actual navigation
        /*
        window.parent.postMessage({
            type: 'navigation',
            target: 'hierarchical',
            view: view,
            params: params
        }, '*');
        */
        
        // For demo purposes, show a toast notification
        showToast(`Navigating to ${view} view`);
    },
    
    // Connect to Tablet Adaptive Command Center
    connectToTabletView: function() {
        // This would handle communication with the tablet view when in split screen mode
        // For now, just a placeholder
        console.log('Connected to Tablet Adaptive Command Center');
    },
    
    // Connect to Desktop Command Center
    connectToDesktopView: function() {
        // This would handle communication with the desktop view
        // For now, just a placeholder
        console.log('Connected to Desktop Command Center');
    },
    
    // Initialize integration
    init: function() {
        // Connect to other components
        this.connectToHierarchicalNav();
        
        // Listen for messages from parent/other components
        window.addEventListener('message', function(event) {
            // Handle messages from other components
            if (event.data && event.data.type) {
                switch (event.data.type) {
                    case 'update-agents':
                        // Update agent data
                        if (event.data.agents) {
                            // In a real implementation, this would update the agent data
                            console.log('Received updated agent data', event.data.agents);
                        }
                        break;
                    case 'update-status':
                        // Update status dashboard
                        if (event.data.status) {
                            // In a real implementation, this would update the status dashboard
                            console.log('Received updated status data', event.data.status);
                        }
                        break;
                    case 'notification':
                        // Show notification
                        if (event.data.message) {
                            showToast(event.data.message);
                        }
                        break;
                }
            }
        });
    }
};

// Helper function to show toast notifications
function showToast(message, duration = 3000) {
    // Create toast element if it doesn't exist
    let toast = document.querySelector('.toast-notification');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
        
        // Add styles if not already in CSS
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast-notification {
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 24px;
                    font-size: 14px;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                    max-width: 80%;
                    text-align: center;
                }
                .toast-notification.visible {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Set message and show toast
    toast.textContent = message;
    toast.classList.add('visible');
    
    // Hide after duration
    setTimeout(() => {
        toast.classList.remove('visible');
    }, duration);
}

// Initialize integration when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    mobileIntegration.init();
});

