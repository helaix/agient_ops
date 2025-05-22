/**
 * Synchronization
 * 
 * This module implements seamless transition between devices:
 * - State preservation across devices
 * - Responsive layouts that adapt to screen size changes
 * - Offline support with synchronization when reconnected
 */

const Synchronization = (function() {
    // Sync status
    const SYNC_STATUS = {
        IDLE: 'idle',
        SYNCING: 'syncing',
        SUCCESS: 'success',
        ERROR: 'error',
        OFFLINE: 'offline'
    };
    
    // Current sync state
    let syncState = {
        status: SYNC_STATUS.IDLE,
        lastSync: null,
        pendingChanges: 0,
        error: null
    };
    
    // Sync settings
    let settings = {
        autoSync: true,
        syncInterval: 60000, // 1 minute
        retryInterval: 30000, // 30 seconds
        maxRetries: 5
    };
    
    // Sync timer
    let syncTimer = null;
    let retryCount = 0;
    
    // Offline changes queue
    let offlineChangesQueue = [];
    
    /**
     * Initialize synchronization
     * @param {object} userSettings - User sync settings
     */
    function init(userSettings = {}) {
        // Merge user settings
        settings = {
            ...settings,
            ...userSettings
        };
        
        // Load offline changes from local storage
        loadOfflineChanges();
        
        // Set up auto sync
        if (settings.autoSync) {
            startAutoSync();
        }
        
        // Listen for online/offline events
        window.addEventListener('online', function() {
            // Update sync status
            updateSyncStatus(SYNC_STATUS.IDLE);
            
            // Sync when coming back online
            synchronize();
        });
        
        window.addEventListener('offline', function() {
            // Update sync status
            updateSyncStatus(SYNC_STATUS.OFFLINE);
            
            // Stop auto sync
            stopAutoSync();
        });
        
        // Listen for beforeunload to save state
        window.addEventListener('beforeunload', function() {
            saveCurrentState();
        });
        
        // Listen for visibility change to sync when tab becomes visible
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible' && settings.autoSync && navigator.onLine) {
                synchronize();
            }
        });
        
        // Listen for storage events (for cross-tab synchronization)
        window.addEventListener('storage', function(event) {
            if (event.key === 'mams_state_updated') {
                // Another tab has updated the state, reload it
                loadCurrentState();
            }
        });
    }
    
    /**
     * Start automatic synchronization
     */
    function startAutoSync() {
        // Clear existing timer
        stopAutoSync();
        
        // Start new timer
        syncTimer = setInterval(function() {
            if (navigator.onLine) {
                synchronize();
            }
        }, settings.syncInterval);
    }
    
    /**
     * Stop automatic synchronization
     */
    function stopAutoSync() {
        if (syncTimer) {
            clearInterval(syncTimer);
            syncTimer = null;
        }
    }
    
    /**
     * Synchronize data with the server
     * @returns {Promise} Promise that resolves when sync is complete
     */
    function synchronize() {
        // If already syncing or offline, return
        if (syncState.status === SYNC_STATUS.SYNCING || !navigator.onLine) {
            return Promise.reject(new Error('Cannot sync: ' + 
                (syncState.status === SYNC_STATUS.SYNCING ? 'Already syncing' : 'Offline')));
        }
        
        // Update sync status
        updateSyncStatus(SYNC_STATUS.SYNCING);
        
        // In a real implementation, this would make API calls to sync data
        // For this mockup, we'll simulate a sync process
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 90% chance of success
                const success = Math.random() < 0.9;
                
                if (success) {
                    // Process offline changes
                    if (offlineChangesQueue.length > 0) {
                        processOfflineChanges();
                    }
                    
                    // Update sync status
                    updateSyncStatus(SYNC_STATUS.SUCCESS);
                    
                    // Reset retry count
                    retryCount = 0;
                    
                    // Update last sync time
                    syncState.lastSync = new Date().toISOString();
                    
                    // Save to data model
                    DataModel.synchronize();
                    
                    resolve({
                        status: SYNC_STATUS.SUCCESS,
                        timestamp: syncState.lastSync
                    });
                } else {
                    // Simulate error
                    const error = new Error('Sync failed: Network error');
                    
                    // Update sync status
                    updateSyncStatus(SYNC_STATUS.ERROR, error);
                    
                    // Increment retry count
                    retryCount++;
                    
                    // Schedule retry if under max retries
                    if (retryCount < settings.maxRetries) {
                        setTimeout(() => {
                            synchronize();
                        }, settings.retryInterval);
                    }
                    
                    reject(error);
                }
            }, 1500); // Simulate network delay
        });
    }
    
    /**
     * Update sync status
     * @param {string} status - The new sync status
     * @param {Error} error - Error object (if status is ERROR)
     */
    function updateSyncStatus(status, error = null) {
        syncState.status = status;
        syncState.error = error;
        
        // Dispatch event
        const event = new CustomEvent('syncstatuschange', { 
            detail: { 
                status, 
                error,
                lastSync: syncState.lastSync,
                pendingChanges: syncState.pendingChanges
            } 
        });
        window.dispatchEvent(event);
        
        // Show notification for errors
        if (status === SYNC_STATUS.ERROR && NotificationSystem) {
            NotificationSystem.showNotification({
                title: 'Sync Error',
                message: error ? error.message : 'Failed to synchronize data',
                type: NotificationSystem.NOTIFICATION_TYPES.ERROR,
                autoClose: true,
                actions: [
                    {
                        label: 'Retry',
                        handler: synchronize
                    }
                ]
            });
        }
    }
    
    /**
     * Save the current application state
     */
    function saveCurrentState() {
        try {
            // Get current state from various components
            const state = {
                timestamp: new Date().toISOString(),
                view: {
                    currentView: document.querySelector('.view-toggle-button.active')?.dataset.view || 'map',
                    scrollPosition: {
                        x: window.scrollX,
                        y: window.scrollY
                    }
                },
                selection: {
                    selectedAgentId: document.querySelector('.agent-item.selected')?.dataset.agentId || null,
                    selectedTaskId: document.querySelector('.task-item.selected')?.dataset.taskId || null,
                    selectedContextId: document.querySelector('.context-item.selected')?.dataset.contextId || null
                },
                ui: {
                    sidebarCollapsed: document.querySelector('.sidebar')?.classList.contains('sidebar-collapsed') || false,
                    contextPanelCollapsed: document.querySelector('.context-panel')?.classList.contains('context-panel-collapsed') || false
                }
            };
            
            // Save to local storage
            localStorage.setItem('mams_app_state', JSON.stringify(state));
            
            // Notify other tabs
            localStorage.setItem('mams_state_updated', new Date().toISOString());
            
            return true;
        } catch (error) {
            console.error('Error saving application state:', error);
            return false;
        }
    }
    
    /**
     * Load the current application state
     * @returns {object|null} The loaded state or null if not found
     */
    function loadCurrentState() {
        try {
            // Get from local storage
            const stateJson = localStorage.getItem('mams_app_state');
            
            if (!stateJson) {
                return null;
            }
            
            const state = JSON.parse(stateJson);
            
            // Apply state to UI
            applyState(state);
            
            return state;
        } catch (error) {
            console.error('Error loading application state:', error);
            return null;
        }
    }
    
    /**
     * Apply saved state to the UI
     * @param {object} state - The state to apply
     */
    function applyState(state) {
        // Apply view
        if (state.view) {
            // Set current view
            if (state.view.currentView) {
                const viewButtons = document.querySelectorAll('.view-toggle-button');
                viewButtons.forEach(button => {
                    if (button.dataset.view === state.view.currentView) {
                        button.click();
                    }
                });
            }
            
            // Restore scroll position
            if (state.view.scrollPosition) {
                window.scrollTo(state.view.scrollPosition.x, state.view.scrollPosition.y);
            }
        }
        
        // Apply selection
        if (state.selection) {
            // Select agent
            if (state.selection.selectedAgentId) {
                const agentItems = document.querySelectorAll('.agent-item');
                agentItems.forEach(item => {
                    if (item.dataset.agentId === state.selection.selectedAgentId) {
                        item.click();
                    }
                });
            }
            
            // Select task
            if (state.selection.selectedTaskId) {
                const taskItems = document.querySelectorAll('.task-item');
                taskItems.forEach(item => {
                    if (item.dataset.taskId === state.selection.selectedTaskId) {
                        item.click();
                    }
                });
            }
            
            // Select context
            if (state.selection.selectedContextId) {
                const contextItems = document.querySelectorAll('.context-item');
                contextItems.forEach(item => {
                    if (item.dataset.contextId === state.selection.selectedContextId) {
                        item.click();
                    }
                });
            }
        }
        
        // Apply UI state
        if (state.ui) {
            // Set sidebar collapsed state
            if (state.ui.sidebarCollapsed) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && !sidebar.classList.contains('sidebar-collapsed')) {
                    document.querySelector('.collapse-sidebar-button')?.click();
                }
            }
            
            // Set context panel collapsed state
            if (state.ui.contextPanelCollapsed) {
                const contextPanel = document.querySelector('.context-panel');
                if (contextPanel && !contextPanel.classList.contains('context-panel-collapsed')) {
                    document.querySelector('.collapse-context-panel-button')?.click();
                }
            }
        }
    }
    
    /**
     * Queue a change for offline synchronization
     * @param {object} change - The change object
     */
    function queueOfflineChange(change) {
        // Add timestamp if not present
        if (!change.timestamp) {
            change.timestamp = new Date().toISOString();
        }
        
        // Add to queue
        offlineChangesQueue.push(change);
        
        // Update pending changes count
        syncState.pendingChanges = offlineChangesQueue.length;
        
        // Save queue to local storage
        saveOfflineChanges();
        
        // Dispatch event
        const event = new CustomEvent('offlinechangequeued', { 
            detail: { 
                change,
                queueLength: offlineChangesQueue.length
            } 
        });
        window.dispatchEvent(event);
        
        // Show notification
        if (NotificationSystem) {
            NotificationSystem.showNotification({
                title: 'Offline Change Queued',
                message: `Changes will be synchronized when you're back online.`,
                type: NotificationSystem.NOTIFICATION_TYPES.INFO,
                autoClose: true
            });
        }
    }
    
    /**
     * Save offline changes to local storage
     */
    function saveOfflineChanges() {
        try {
            localStorage.setItem('mams_offline_changes', JSON.stringify(offlineChangesQueue));
        } catch (error) {
            console.error('Error saving offline changes:', error);
        }
    }
    
    /**
     * Load offline changes from local storage
     */
    function loadOfflineChanges() {
        try {
            const changesJson = localStorage.getItem('mams_offline_changes');
            
            if (changesJson) {
                offlineChangesQueue = JSON.parse(changesJson);
                syncState.pendingChanges = offlineChangesQueue.length;
            }
        } catch (error) {
            console.error('Error loading offline changes:', error);
            offlineChangesQueue = [];
            syncState.pendingChanges = 0;
        }
    }
    
    /**
     * Process offline changes
     */
    function processOfflineChanges() {
        // In a real implementation, this would send the changes to the server
        // For this mockup, we'll just clear the queue
        
        // Dispatch event
        const event = new CustomEvent('offlinechangesprocessed', { 
            detail: { 
                changes: [...offlineChangesQueue],
                count: offlineChangesQueue.length
            } 
        });
        window.dispatchEvent(event);
        
        // Clear queue
        offlineChangesQueue = [];
        syncState.pendingChanges = 0;
        
        // Save empty queue to local storage
        saveOfflineChanges();
        
        // Show notification
        if (NotificationSystem) {
            NotificationSystem.showNotification({
                title: 'Offline Changes Synchronized',
                message: 'Your offline changes have been successfully synchronized.',
                type: NotificationSystem.NOTIFICATION_TYPES.SUCCESS,
                autoClose: true
            });
        }
    }
    
    /**
     * Clear offline changes queue
     */
    function clearOfflineChanges() {
        offlineChangesQueue = [];
        syncState.pendingChanges = 0;
        
        // Save empty queue to local storage
        saveOfflineChanges();
        
        // Dispatch event
        const event = new CustomEvent('offlinechangescleared');
        window.dispatchEvent(event);
    }
    
    /**
     * Get the current sync state
     * @returns {object} The current sync state
     */
    function getSyncState() {
        return {...syncState};
    }
    
    /**
     * Update sync settings
     * @param {object} newSettings - The new settings
     */
    function updateSettings(newSettings) {
        const previousAutoSync = settings.autoSync;
        
        settings = {
            ...settings,
            ...newSettings
        };
        
        // Handle auto sync changes
        if (previousAutoSync !== settings.autoSync) {
            if (settings.autoSync) {
                startAutoSync();
            } else {
                stopAutoSync();
            }
        }
        
        // Save settings to data model
        DataModel.updateSettings({
            sync: settings
        });
    }
    
    /**
     * Get sync settings
     * @returns {object} The current sync settings
     */
    function getSettings() {
        return {...settings};
    }
    
    /**
     * Create a sync status indicator element
     * @returns {HTMLElement} The sync status indicator element
     */
    function createSyncStatusIndicator() {
        const container = document.createElement('div');
        container.className = 'sync-status-indicator';
        
        // Status icon
        const icon = document.createElement('span');
        icon.className = 'sync-icon';
        container.appendChild(icon);
        
        // Status text
        const text = document.createElement('span');
        text.className = 'sync-text';
        container.appendChild(text);
        
        // Update status display
        updateSyncIndicator(container);
        
        // Listen for sync status changes
        window.addEventListener('syncstatuschange', function() {
            updateSyncIndicator(container);
        });
        
        // Listen for online/offline events
        window.addEventListener('online', function() {
            updateSyncIndicator(container);
        });
        
        window.addEventListener('offline', function() {
            updateSyncIndicator(container);
        });
        
        // Add click handler to manually sync
        container.addEventListener('click', function() {
            if (navigator.onLine && syncState.status !== SYNC_STATUS.SYNCING) {
                synchronize();
            }
        });
        
        return container;
    }
    
    /**
     * Update the sync status indicator
     * @param {HTMLElement} container - The indicator container element
     */
    function updateSyncIndicator(container) {
        const icon = container.querySelector('.sync-icon');
        const text = container.querySelector('.sync-text');
        
        // Clear existing classes
        container.className = 'sync-status-indicator';
        
        // Set status-specific classes and content
        if (!navigator.onLine) {
            container.classList.add('sync-offline');
            icon.textContent = '⚠️';
            text.textContent = 'Offline';
        } else {
            switch (syncState.status) {
                case SYNC_STATUS.SYNCING:
                    container.classList.add('sync-syncing');
                    icon.textContent = '🔄';
                    text.textContent = 'Syncing...';
                    break;
                case SYNC_STATUS.SUCCESS:
                    container.classList.add('sync-success');
                    icon.textContent = '✅';
                    
                    // Show last sync time if available
                    if (syncState.lastSync) {
                        const lastSyncDate = new Date(syncState.lastSync);
                        const now = new Date();
                        const diffMinutes = Math.floor((now - lastSyncDate) / (1000 * 60));
                        
                        if (diffMinutes < 1) {
                            text.textContent = 'Just now';
                        } else if (diffMinutes < 60) {
                            text.textContent = `${diffMinutes}m ago`;
                        } else {
                            const diffHours = Math.floor(diffMinutes / 60);
                            text.textContent = `${diffHours}h ago`;
                        }
                    } else {
                        text.textContent = 'Synced';
                    }
                    break;
                case SYNC_STATUS.ERROR:
                    container.classList.add('sync-error');
                    icon.textContent = '❌';
                    text.textContent = 'Sync failed';
                    break;
                default:
                    container.classList.add('sync-idle');
                    icon.textContent = '🔄';
                    text.textContent = 'Sync';
                    break;
            }
            
            // Show pending changes if any
            if (syncState.pendingChanges > 0) {
                const pendingBadge = document.createElement('span');
                pendingBadge.className = 'pending-changes-badge';
                pendingBadge.textContent = syncState.pendingChanges;
                container.appendChild(pendingBadge);
            }
        }
    }
    
    /**
     * Create offline indicator element
     * @returns {HTMLElement} The offline indicator element
     */
    function createOfflineIndicator() {
        const container = document.createElement('div');
        container.className = 'offline-indicator';
        container.style.display = navigator.onLine ? 'none' : 'block';
        
        const icon = document.createElement('span');
        icon.className = 'offline-icon';
        icon.textContent = '📶';
        container.appendChild(icon);
        
        const text = document.createElement('span');
        text.className = 'offline-text';
        text.textContent = 'You are offline. Some features may be unavailable.';
        container.appendChild(text);
        
        // Listen for online/offline events
        window.addEventListener('online', function() {
            container.style.display = 'none';
        });
        
        window.addEventListener('offline', function() {
            container.style.display = 'block';
        });
        
        return container;
    }
    
    // Public API
    return {
        init: init,
        synchronize: synchronize,
        saveCurrentState: saveCurrentState,
        loadCurrentState: loadCurrentState,
        queueOfflineChange: queueOfflineChange,
        clearOfflineChanges: clearOfflineChanges,
        getSyncState: getSyncState,
        updateSettings: updateSettings,
        getSettings: getSettings,
        createSyncStatusIndicator: createSyncStatusIndicator,
        createOfflineIndicator: createOfflineIndicator,
        SYNC_STATUS: SYNC_STATUS
    };
})();

