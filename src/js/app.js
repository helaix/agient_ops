/**
 * Multi-Agent Management System
 * 
 * Main application script that initializes and coordinates all components.
 * This script handles the responsive layout and device-specific adaptations.
 */

const App = (function() {
    // DOM elements
    let appContainer = null;
    let headerElement = null;
    let mainContentElement = null;
    let leftSidebarElement = null;
    let viewportElement = null;
    let rightSidebarElement = null;
    let footerElement = null;
    
    // Component references
    let commandInputComponent = null;
    let agentListComponent = null;
    let contextPanelComponent = null;
    
    // Notification containers
    let notificationContainers = {
        desktop: null,
        tablet: null,
        mobile: null
    };
    
    /**
     * Initialize the application
     */
    function init() {
        // Get app container
        appContainer = document.getElementById('app');
        
        if (!appContainer) {
            console.error('App container not found');
            return;
        }
        
        // Create app structure
        createAppStructure();
        
        // Initialize components
        initializeComponents();
        
        // Set up event listeners
        setupEventListeners();
        
        // Hide loading screen
        hideLoading();
    }
    
    /**
     * Create the application structure based on device type
     */
    function createAppStructure() {
        // Clear app container
        appContainer.innerHTML = '';
        
        // Get device info
        const deviceInfo = DeviceDetection.getDeviceInfo();
        
        // Create header
        headerElement = document.createElement('header');
        headerElement.className = 'header';
        
        const logo = document.createElement('div');
        logo.className = 'logo';
        
        const logoImg = document.createElement('img');
        logoImg.src = 'img/logo.svg';
        logoImg.alt = 'Multi-Agent Management System';
        logo.appendChild(logoImg);
        
        const logoText = document.createElement('span');
        logoText.textContent = 'MAMS';
        logo.appendChild(logoText);
        
        headerElement.appendChild(logo);
        
        // Search bar
        const searchBar = document.createElement('div');
        searchBar.className = 'search-bar';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search agents, tasks, contexts...';
        searchBar.appendChild(searchInput);
        
        headerElement.appendChild(searchBar);
        
        // User profile
        const userProfile = document.createElement('div');
        userProfile.className = 'user-profile';
        
        const userImg = document.createElement('img');
        userImg.src = 'img/user.svg';
        userImg.alt = 'User';
        userProfile.appendChild(userImg);
        
        const userName = document.createElement('span');
        userName.textContent = 'User';
        userProfile.appendChild(userName);
        
        headerElement.appendChild(userProfile);
        
        appContainer.appendChild(headerElement);
        
        // Create main content
        mainContentElement = document.createElement('main');
        mainContentElement.className = 'main-content';
        
        // Create layout based on device type
        if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.DESKTOP || 
            deviceInfo.type === DeviceDetection.DEVICE_TYPES.TABLET) {
            // Desktop and tablet layout with sidebars
            
            // Left sidebar
            leftSidebarElement = document.createElement('div');
            leftSidebarElement.className = 'sidebar';
            mainContentElement.appendChild(leftSidebarElement);
            
            // Main viewport
            viewportElement = document.createElement('div');
            viewportElement.className = 'viewport';
            mainContentElement.appendChild(viewportElement);
            
            // Right sidebar
            rightSidebarElement = document.createElement('div');
            rightSidebarElement.className = 'context-panel';
            mainContentElement.appendChild(rightSidebarElement);
            
        } else {
            // Mobile layout with tabs
            
            // Main viewport
            viewportElement = document.createElement('div');
            viewportElement.className = 'viewport';
            mainContentElement.appendChild(viewportElement);
            
            // Mobile navigation will be added to footer
        }
        
        appContainer.appendChild(mainContentElement);
        
        // Create footer
        footerElement = document.createElement('footer');
        footerElement.className = 'footer';
        
        if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.DESKTOP) {
            // Desktop footer with metrics and notifications
            
            // Resource metrics
            const resourceMetrics = document.createElement('div');
            resourceMetrics.className = 'resource-metrics';
            
            // CPU metric
            const cpuMetric = document.createElement('div');
            cpuMetric.className = 'metric';
            
            const cpuIcon = document.createElement('span');
            cpuIcon.className = 'metric-icon';
            cpuIcon.textContent = '🖥️';
            cpuMetric.appendChild(cpuIcon);
            
            const cpuText = document.createElement('span');
            cpuText.textContent = 'CPU: 25%';
            cpuMetric.appendChild(cpuText);
            
            resourceMetrics.appendChild(cpuMetric);
            
            // Memory metric
            const memoryMetric = document.createElement('div');
            memoryMetric.className = 'metric';
            
            const memoryIcon = document.createElement('span');
            memoryIcon.className = 'metric-icon';
            memoryIcon.textContent = '🧠';
            memoryMetric.appendChild(memoryIcon);
            
            const memoryText = document.createElement('span');
            memoryText.textContent = 'Memory: 512MB';
            memoryMetric.appendChild(memoryText);
            
            resourceMetrics.appendChild(memoryMetric);
            
            // API metric
            const apiMetric = document.createElement('div');
            apiMetric.className = 'metric';
            
            const apiIcon = document.createElement('span');
            apiIcon.className = 'metric-icon';
            apiIcon.textContent = '🔌';
            apiMetric.appendChild(apiIcon);
            
            const apiText = document.createElement('span');
            apiText.textContent = 'API: 150 calls/min';
            apiMetric.appendChild(apiText);
            
            resourceMetrics.appendChild(apiMetric);
            
            footerElement.appendChild(resourceMetrics);
            
            // Sync status
            const syncStatusContainer = document.createElement('div');
            syncStatusContainer.className = 'sync-status-container';
            footerElement.appendChild(syncStatusContainer);
            
            // Notifications
            const notifications = document.createElement('div');
            notifications.className = 'notifications';
            
            // Create notification container for desktop
            notificationContainers.desktop = document.createElement('div');
            notificationContainers.desktop.className = 'desktop-notifications';
            notifications.appendChild(notificationContainers.desktop);
            
            footerElement.appendChild(notifications);
            
        } else if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.TABLET) {
            // Tablet footer with tabs
            
            const footerTabs = document.createElement('div');
            footerTabs.className = 'footer-tabs';
            
            // Agents tab
            const agentsTab = document.createElement('div');
            agentsTab.className = 'footer-tab active';
            
            const agentsIcon = document.createElement('div');
            agentsIcon.className = 'footer-tab-icon';
            agentsIcon.textContent = '👥';
            agentsTab.appendChild(agentsIcon);
            
            const agentsLabel = document.createElement('div');
            agentsLabel.className = 'footer-tab-label';
            agentsLabel.textContent = 'Agents';
            agentsTab.appendChild(agentsLabel);
            
            footerTabs.appendChild(agentsTab);
            
            // Tasks tab
            const tasksTab = document.createElement('div');
            tasksTab.className = 'footer-tab';
            
            const tasksIcon = document.createElement('div');
            tasksIcon.className = 'footer-tab-icon';
            tasksIcon.textContent = '📋';
            tasksTab.appendChild(tasksIcon);
            
            const tasksLabel = document.createElement('div');
            tasksLabel.className = 'footer-tab-label';
            tasksLabel.textContent = 'Tasks';
            tasksTab.appendChild(tasksLabel);
            
            footerTabs.appendChild(tasksTab);
            
            // Workflows tab
            const workflowsTab = document.createElement('div');
            workflowsTab.className = 'footer-tab';
            
            const workflowsIcon = document.createElement('div');
            workflowsIcon.className = 'footer-tab-icon';
            workflowsIcon.textContent = '🔄';
            workflowsTab.appendChild(workflowsIcon);
            
            const workflowsLabel = document.createElement('div');
            workflowsLabel.className = 'footer-tab-label';
            workflowsLabel.textContent = 'Workflows';
            workflowsTab.appendChild(workflowsLabel);
            
            footerTabs.appendChild(workflowsTab);
            
            // Notifications tab
            const notificationsTab = document.createElement('div');
            notificationsTab.className = 'footer-tab';
            
            const notificationsIcon = document.createElement('div');
            notificationsIcon.className = 'footer-tab-icon';
            notificationsIcon.textContent = '🔔';
            notificationsTab.appendChild(notificationsIcon);
            
            const notificationsLabel = document.createElement('div');
            notificationsLabel.className = 'footer-tab-label';
            notificationsLabel.textContent = 'Notifications';
            notificationsTab.appendChild(notificationsLabel);
            
            footerTabs.appendChild(notificationsTab);
            
            // Quick action button
            const quickActionButton = document.createElement('div');
            quickActionButton.className = 'footer-tab quick-action-button';
            
            const quickActionIcon = document.createElement('div');
            quickActionIcon.className = 'footer-tab-icon';
            quickActionIcon.textContent = '+';
            quickActionButton.appendChild(quickActionIcon);
            
            const quickActionLabel = document.createElement('div');
            quickActionLabel.className = 'footer-tab-label';
            quickActionLabel.textContent = 'Action';
            quickActionButton.appendChild(quickActionLabel);
            
            footerTabs.appendChild(quickActionButton);
            
            footerElement.appendChild(footerTabs);
            
            // Create notification container for tablet
            notificationContainers.tablet = document.createElement('div');
            notificationContainers.tablet.className = 'tablet-notifications';
            notificationContainers.tablet.style.display = 'none';
            appContainer.appendChild(notificationContainers.tablet);
            
        } else {
            // Mobile footer with navigation
            
            const mobileNav = document.createElement('nav');
            mobileNav.className = 'mobile-nav';
            
            // Agents nav item
            const agentsNavItem = document.createElement('div');
            agentsNavItem.className = 'mobile-nav-item active';
            
            const agentsNavIcon = document.createElement('div');
            agentsNavIcon.className = 'mobile-nav-icon';
            agentsNavIcon.textContent = '👥';
            agentsNavItem.appendChild(agentsNavIcon);
            
            const agentsNavLabel = document.createElement('div');
            agentsNavLabel.className = 'mobile-nav-label';
            agentsNavLabel.textContent = 'Agents';
            agentsNavItem.appendChild(agentsNavLabel);
            
            mobileNav.appendChild(agentsNavItem);
            
            // Tasks nav item
            const tasksNavItem = document.createElement('div');
            tasksNavItem.className = 'mobile-nav-item';
            
            const tasksNavIcon = document.createElement('div');
            tasksNavIcon.className = 'mobile-nav-icon';
            tasksNavIcon.textContent = '📋';
            tasksNavItem.appendChild(tasksNavIcon);
            
            const tasksNavLabel = document.createElement('div');
            tasksNavLabel.className = 'mobile-nav-label';
            tasksNavLabel.textContent = 'Tasks';
            tasksNavItem.appendChild(tasksNavLabel);
            
            mobileNav.appendChild(tasksNavItem);
            
            // Workflows nav item
            const workflowsNavItem = document.createElement('div');
            workflowsNavItem.className = 'mobile-nav-item';
            
            const workflowsNavIcon = document.createElement('div');
            workflowsNavIcon.className = 'mobile-nav-icon';
            workflowsNavIcon.textContent = '🔄';
            workflowsNavItem.appendChild(workflowsNavIcon);
            
            const workflowsNavLabel = document.createElement('div');
            workflowsNavLabel.className = 'mobile-nav-label';
            workflowsNavLabel.textContent = 'Workflows';
            workflowsNavItem.appendChild(workflowsNavLabel);
            
            mobileNav.appendChild(workflowsNavItem);
            
            // Notifications nav item
            const notificationsNavItem = document.createElement('div');
            notificationsNavItem.className = 'mobile-nav-item';
            
            const notificationsNavIcon = document.createElement('div');
            notificationsNavIcon.className = 'mobile-nav-icon';
            notificationsNavIcon.textContent = '🔔';
            notificationsNavItem.appendChild(notificationsNavIcon);
            
            const notificationsNavLabel = document.createElement('div');
            notificationsNavLabel.className = 'mobile-nav-label';
            notificationsNavLabel.textContent = 'Notifications';
            notificationsNavItem.appendChild(notificationsNavLabel);
            
            mobileNav.appendChild(notificationsNavItem);
            
            footerElement.appendChild(mobileNav);
            
            // Floating action button
            const floatingActionButton = document.createElement('button');
            floatingActionButton.className = 'floating-action-button';
            floatingActionButton.textContent = '+';
            floatingActionButton.setAttribute('aria-label', 'New command');
            appContainer.appendChild(floatingActionButton);
            
            // Create notification container for mobile
            notificationContainers.mobile = document.createElement('div');
            notificationContainers.mobile.className = 'mobile-notifications';
            notificationContainers.mobile.style.display = 'none';
            appContainer.appendChild(notificationContainers.mobile);
        }
        
        appContainer.appendChild(footerElement);
        
        // Create offline indicator
        const offlineIndicator = Synchronization.createOfflineIndicator();
        appContainer.appendChild(offlineIndicator);
    }
    
    /**
     * Initialize all components
     */
    function initializeComponents() {
        // Get device info
        const deviceInfo = DeviceDetection.getDeviceInfo();
        
        // Initialize viewport content
        initializeViewport();
        
        // Initialize components based on device type
        if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.DESKTOP || 
            deviceInfo.type === DeviceDetection.DEVICE_TYPES.TABLET) {
            // Initialize agent list in left sidebar
            agentListComponent = AgentListComponent;
            agentListComponent.init(leftSidebarElement);
            
            // Initialize context panel in right sidebar
            contextPanelComponent = ContextPanelComponent;
            contextPanelComponent.init(rightSidebarElement);
        }
        
        // Initialize command input
        const commandInputContainer = document.createElement('div');
        commandInputContainer.className = 'command-input-container';
        viewportElement.appendChild(commandInputContainer);
        
        commandInputComponent = CommandInputComponent;
        commandInputComponent.init(commandInputContainer);
        
        // Initialize notification system
        NotificationSystem.init(notificationContainers);
        
        // Initialize synchronization
        Synchronization.init();
        
        // Add sync status indicator to footer
        if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.DESKTOP) {
            const syncStatusIndicator = Synchronization.createSyncStatusIndicator();
            footerElement.querySelector('.sync-status-container').appendChild(syncStatusIndicator);
        }
    }
    
    /**
     * Initialize the viewport content
     */
    function initializeViewport() {
        // Create viewport header
        const viewportHeader = document.createElement('div');
        viewportHeader.className = 'viewport-header';
        
        const viewTitle = document.createElement('h2');
        viewTitle.className = 'view-title';
        viewTitle.textContent = 'Agent Map';
        viewportHeader.appendChild(viewTitle);
        
        // View toggle
        const viewToggle = document.createElement('div');
        viewToggle.className = 'view-toggle';
        
        const mapViewButton = document.createElement('button');
        mapViewButton.className = 'view-toggle-button active';
        mapViewButton.textContent = 'Map';
        mapViewButton.dataset.view = 'map';
        viewToggle.appendChild(mapViewButton);
        
        const timelineViewButton = document.createElement('button');
        timelineViewButton.className = 'view-toggle-button';
        timelineViewButton.textContent = 'Timeline';
        timelineViewButton.dataset.view = 'timeline';
        viewToggle.appendChild(timelineViewButton);
        
        const kanbanViewButton = document.createElement('button');
        kanbanViewButton.className = 'view-toggle-button';
        kanbanViewButton.textContent = 'Kanban';
        kanbanViewButton.dataset.view = 'kanban';
        viewToggle.appendChild(kanbanViewButton);
        
        viewportHeader.appendChild(viewToggle);
        viewportElement.appendChild(viewportHeader);
        
        // Create context visualization container
        const visualizationContainer = document.createElement('div');
        visualizationContainer.className = 'context-visualization-container';
        viewportElement.appendChild(visualizationContainer);
        
        // Initialize context visualization
        ContextVisualization.init(visualizationContainer);
        ContextVisualization.buildVisualization();
        
        // Add view toggle functionality
        mapViewButton.addEventListener('click', function() {
            setActiveView('map');
        });
        
        timelineViewButton.addEventListener('click', function() {
            setActiveView('timeline');
        });
        
        kanbanViewButton.addEventListener('click', function() {
            setActiveView('kanban');
        });
    }
    
    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Listen for device changes
        window.addEventListener('devicechange', function(event) {
            // Rebuild app structure when device changes
            createAppStructure();
            initializeComponents();
        });
        
        // Listen for online/offline events
        window.addEventListener('online', function() {
            NotificationSystem.showNotification({
                title: 'Connected',
                message: 'You are now online',
                type: NotificationSystem.NOTIFICATION_TYPES.SUCCESS,
                autoClose: true
            });
        });
        
        window.addEventListener('offline', function() {
            NotificationSystem.showNotification({
                title: 'Disconnected',
                message: 'You are now offline. Some features may be unavailable.',
                type: NotificationSystem.NOTIFICATION_TYPES.WARNING,
                autoClose: true
            });
        });
        
        // Listen for keyboard shortcuts
        document.addEventListener('keydown', function(event) {
            // Command mode
            if (event.key === '/' && !isInputFocused()) {
                event.preventDefault();
                commandInputComponent.focus();
            }
            
            // View switching
            if (event.ctrlKey && !isNaN(parseInt(event.key))) {
                const viewIndex = parseInt(event.key) - 1;
                const viewButtons = document.querySelectorAll('.view-toggle-button');
                
                if (viewIndex >= 0 && viewIndex < viewButtons.length) {
                    event.preventDefault();
                    viewButtons[viewIndex].click();
                }
            }
            
            // Agent selection
            if (event.altKey && !isNaN(parseInt(event.key))) {
                const agentIndex = parseInt(event.key) - 1;
                const agentItems = document.querySelectorAll('.agent-item');
                
                if (agentIndex >= 0 && agentIndex < agentItems.length) {
                    event.preventDefault();
                    agentItems[agentIndex].click();
                }
            }
        });
    }
    
    /**
     * Check if an input element is currently focused
     * @returns {boolean} True if an input element is focused
     */
    function isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement.tagName === 'INPUT' || 
               activeElement.tagName === 'TEXTAREA' || 
               activeElement.isContentEditable;
    }
    
    /**
     * Set the active view
     * @param {string} viewName - The name of the view to activate
     */
    function setActiveView(viewName) {
        // Update view toggle buttons
        const viewButtons = document.querySelectorAll('.view-toggle-button');
        
        viewButtons.forEach(button => {
            if (button.dataset.view === viewName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update view title
        const viewTitle = document.querySelector('.view-title');
        
        if (viewTitle) {
            viewTitle.textContent = `Agent ${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
        }
        
        // Update visualization
        // In a real implementation, this would switch between different visualization types
    }
    
    /**
     * Hide the loading screen
     */
    function hideLoading() {
        const loadingElement = document.getElementById('loading');
        
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            
            setTimeout(function() {
                loadingElement.style.display = 'none';
            }, 500);
        }
    }
    
    // Public API
    return {
        init: init
    };
})();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});

