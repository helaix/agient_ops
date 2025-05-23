/**
 * Integration functionality for the tablet navigation component
 * Handles integration with the unified showcase and other components
 */

class IntegrationManager {
    constructor() {
        this.isInUnifiedShowcase = this.detectUnifiedShowcase();
        this.componentBoundary = document.querySelector('.component-boundary');
        this.integrationPoints = document.querySelectorAll('.integration-point');
        this.integrationControls = document.querySelector('.integration-controls');
        
        // Initialize integration features
        this.init();
    }
    
    init() {
        // Setup development controls if not in unified showcase
        if (!this.isInUnifiedShowcase) {
            this.setupDevControls();
        } else {
            // Hide development controls in unified showcase
            if (this.integrationControls) {
                this.integrationControls.style.display = 'none';
            }
            
            // Setup communication with other components
            this.setupComponentCommunication();
        }
        
        // Register this component with the unified showcase if available
        this.registerWithUnifiedShowcase();
        
        // Setup message listeners for cross-component communication
        this.setupMessageListeners();
    }
    
    // Detect if running in unified showcase
    detectUnifiedShowcase() {
        // Check if this is loaded in an iframe
        const isInIframe = window !== window.parent;
        
        // Check for unified showcase URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const isShowcaseParam = urlParams.get('showcase') === 'true';
        
        return isInIframe || isShowcaseParam;
    }
    
    // Setup development controls
    setupDevControls() {
        // Show integration controls
        if (this.integrationControls) {
            this.integrationControls.style.display = 'flex';
            this.integrationControls.style.position = 'fixed';
            this.integrationControls.style.bottom = '80px';
            this.integrationControls.style.right = '10px';
            this.integrationControls.style.zIndex = '9999';
            this.integrationControls.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            this.integrationControls.style.padding = '10px';
            this.integrationControls.style.borderRadius = '8px';
            this.integrationControls.style.display = 'flex';
            this.integrationControls.style.flexDirection = 'column';
            this.integrationControls.style.gap = '8px';
        }
        
        // Toggle boundaries button
        const toggleBoundariesBtn = document.getElementById('toggle-boundaries');
        if (toggleBoundariesBtn) {
            toggleBoundariesBtn.addEventListener('click', () => {
                this.toggleComponentBoundaries();
            });
            
            // Style the button
            toggleBoundariesBtn.style.backgroundColor = 'var(--primary-color)';
            toggleBoundariesBtn.style.color = 'white';
            toggleBoundariesBtn.style.border = 'none';
            toggleBoundariesBtn.style.padding = '8px 12px';
            toggleBoundariesBtn.style.borderRadius = '4px';
            toggleBoundariesBtn.style.cursor = 'pointer';
        }
        
        // Toggle orientation button
        const toggleOrientationBtn = document.getElementById('toggle-orientation');
        if (toggleOrientationBtn) {
            toggleOrientationBtn.addEventListener('click', () => {
                this.toggleOrientation();
            });
            
            // Style the button
            toggleOrientationBtn.style.backgroundColor = 'var(--primary-color)';
            toggleOrientationBtn.style.color = 'white';
            toggleOrientationBtn.style.border = 'none';
            toggleOrientationBtn.style.padding = '8px 12px';
            toggleOrientationBtn.style.borderRadius = '4px';
            toggleOrientationBtn.style.cursor = 'pointer';
        }
        
        // Device selector
        const deviceSelector = document.getElementById('device-selector');
        if (deviceSelector) {
            deviceSelector.addEventListener('change', (e) => {
                this.changeDeviceSize(e.target.value);
            });
            
            // Style the select
            deviceSelector.style.backgroundColor = 'var(--light-color)';
            deviceSelector.style.border = '1px solid var(--border-color)';
            deviceSelector.style.padding = '8px 12px';
            deviceSelector.style.borderRadius = '4px';
            deviceSelector.style.cursor = 'pointer';
        }
    }
    
    // Toggle component boundaries for development
    toggleComponentBoundaries() {
        if (this.componentBoundary) {
            const isVisible = this.componentBoundary.style.display === 'block';
            this.componentBoundary.style.display = isVisible ? 'none' : 'block';
        }
        
        // Toggle integration points
        this.integrationPoints.forEach(point => {
            const isVisible = point.style.display === 'block';
            point.style.display = isVisible ? 'none' : 'block';
        });
    }
    
    // Toggle between portrait and landscape orientation
    toggleOrientation() {
        const container = document.querySelector('.app-container');
        if (!container) return;
        
        // Check current orientation
        const isPortrait = container.clientHeight > container.clientWidth;
        
        // Toggle orientation
        if (isPortrait) {
            // Switch to landscape
            container.style.width = '90vw';
            container.style.height = '70vh';
        } else {
            // Switch to portrait
            container.style.width = '70vw';
            container.style.height = '90vh';
        }
        
        // Center the container
        container.style.position = 'absolute';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        
        // Trigger resize event to update layout
        window.dispatchEvent(new Event('resize'));
    }
    
    // Change device size for testing
    changeDeviceSize(deviceType) {
        const container = document.querySelector('.app-container');
        if (!container) return;
        
        // Set container size based on device type
        switch (deviceType) {
            case 'ipad-pro':
                container.style.width = '1024px';
                container.style.height = '1366px';
                break;
            case 'ipad':
                container.style.width = '768px';
                container.style.height = '1024px';
                break;
            case 'ipad-mini':
                container.style.width = '744px';
                container.style.height = '1133px';
                break;
            case 'android-tablet':
                container.style.width = '800px';
                container.style.height = '1280px';
                break;
            default:
                container.style.width = '768px';
                container.style.height = '1024px';
        }
        
        // Scale down to fit viewport
        const scale = Math.min(
            window.innerWidth / container.clientWidth * 0.9,
            window.innerHeight / container.clientHeight * 0.9
        );
        
        // Apply scale
        container.style.position = 'absolute';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = `translate(-50%, -50%) scale(${scale})`;
        container.style.transformOrigin = 'center center';
        
        // Trigger resize event to update layout
        window.dispatchEvent(new Event('resize'));
    }
    
    // Register this component with the unified showcase
    registerWithUnifiedShowcase() {
        if (this.isInUnifiedShowcase) {
            // Send registration message to parent window
            window.parent.postMessage({
                type: 'COMPONENT_REGISTER',
                componentId: 'tablet-navigation',
                componentName: 'Tablet Navigation Patterns',
                integrationPoints: Array.from(this.integrationPoints).map(point => ({
                    id: point.className.split(' ')[1], // Get position class (top, right, etc.)
                    connectsTo: point.dataset.connectsTo
                }))
            }, '*');
        }
    }
    
    // Setup communication with other components
    setupComponentCommunication() {
        // Setup message listeners for cross-component communication
        window.addEventListener('message', (event) => {
            const message = event.data;
            
            // Handle different message types
            switch (message.type) {
                case 'NAVIGATION_REQUEST':
                    this.handleNavigationRequest(message);
                    break;
                case 'TAB_UPDATE':
                    this.handleTabUpdate(message);
                    break;
                case 'NOTIFICATION_UPDATE':
                    this.handleNotificationUpdate(message);
                    break;
            }
        });
    }
    
    // Setup message listeners for cross-component communication
    setupMessageListeners() {
        // Listen for custom events from other components
        document.addEventListener('tabNavigationEvent', (e) => {
            this.handleTabNavigationEvent(e.detail);
        });
        
        // Listen for tab click events to broadcast to other components
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const viewId = tab.dataset.view;
                
                // Broadcast tab change to other components
                this.broadcastTabChange(viewId);
            });
        });
    }
    
    // Handle navigation requests from other components
    handleNavigationRequest(message) {
        const { viewId } = message;
        
        // Get tab navigation instance
        const tabNavigation = window.tabNavigation;
        if (tabNavigation && viewId) {
            // Switch to the requested view
            tabNavigation.switchView(viewId);
        }
    }
    
    // Handle tab updates from other components
    handleTabUpdate(message) {
        const { tabId, badgeCount } = message;
        
        // Get tab navigation instance
        const tabNavigation = window.tabNavigation;
        if (tabNavigation && tabId) {
            // Update badge count
            tabNavigation.updateBadge(tabId, badgeCount);
        }
    }
    
    // Handle notification updates from other components
    handleNotificationUpdate(message) {
        const { count } = message;
        
        // Update notification badge
        const tabNavigation = window.tabNavigation;
        if (tabNavigation) {
            tabNavigation.updateBadge('notifications-view', count);
        }
    }
    
    // Handle tab navigation events from other components
    handleTabNavigationEvent(detail) {
        const { action, viewId } = detail;
        
        // Get tab navigation instance
        const tabNavigation = window.tabNavigation;
        if (!tabNavigation) return;
        
        // Handle different actions
        switch (action) {
            case 'switchView':
                tabNavigation.switchView(viewId);
                break;
            case 'updateBadge':
                tabNavigation.updateBadge(viewId, detail.count);
                break;
            case 'reorderTabs':
                tabNavigation.reorderTabs(detail.newOrder);
                break;
        }
    }
    
    // Broadcast tab change to other components
    broadcastTabChange(viewId) {
        // Send message to parent window if in unified showcase
        if (this.isInUnifiedShowcase) {
            window.parent.postMessage({
                type: 'TAB_CHANGED',
                componentId: 'tablet-navigation',
                viewId: viewId
            }, '*');
        }
        
        // Dispatch custom event for other components in the same window
        const event = new CustomEvent('tabChanged', {
            detail: {
                viewId: viewId,
                source: 'tablet-navigation'
            }
        });
        document.dispatchEvent(event);
    }
    
    // Expose API for other components to use
    getPublicAPI() {
        return {
            switchView: (viewId) => {
                const tabNavigation = window.tabNavigation;
                if (tabNavigation) {
                    tabNavigation.switchView(viewId);
                }
            },
            updateBadge: (viewId, count) => {
                const tabNavigation = window.tabNavigation;
                if (tabNavigation) {
                    tabNavigation.updateBadge(viewId, count);
                }
            },
            reorderTabs: (newOrder) => {
                const tabNavigation = window.tabNavigation;
                if (tabNavigation) {
                    tabNavigation.reorderTabs(newOrder);
                }
            }
        };
    }
}

// Initialize integration manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.integrationManager = new IntegrationManager();
    
    // Expose public API
    window.tabletNavigation = window.integrationManager.getPublicAPI();
});

