/**
 * Unified Data Model
 * 
 * This module provides a consistent data structure that works across all devices.
 * It handles data synchronization, storage, and retrieval.
 */

const DataModel = (function() {
    // Storage keys
    const STORAGE_KEYS = {
        AGENTS: 'mams_agents',
        TASKS: 'mams_tasks',
        CONTEXTS: 'mams_contexts',
        COMMANDS: 'mams_commands',
        NOTIFICATIONS: 'mams_notifications',
        SETTINGS: 'mams_settings',
        LAST_SYNC: 'mams_last_sync'
    };
    
    // Priority levels
    const PRIORITY_LEVELS = {
        URGENT: 3,
        HIGH: 2,
        MEDIUM: 1,
        LOW: 0,
        NONE: -1
    };
    
    // Status types
    const STATUS_TYPES = {
        ACTIVE: 'active',
        BUSY: 'busy',
        ERROR: 'error',
        IDLE: 'idle'
    };
    
    // In-memory data store
    let dataStore = {
        agents: [],
        tasks: [],
        contexts: [],
        commands: [],
        notifications: [],
        settings: {},
        lastSync: null
    };
    
    // Event listeners
    const eventListeners = {
        dataChange: [],
        syncStart: [],
        syncComplete: [],
        syncError: []
    };
    
    /**
     * Initialize the data model
     */
    function init() {
        // Load data from local storage
        loadFromLocalStorage();
        
        // Set up synchronization
        setupSync();
        
        // Listen for online/offline events
        window.addEventListener('online', function() {
            synchronize();
        });
    }
    
    /**
     * Load data from local storage
     */
    function loadFromLocalStorage() {
        try {
            // Load each data type from local storage
            for (const key in STORAGE_KEYS) {
                const storageKey = STORAGE_KEYS[key];
                const storedData = localStorage.getItem(storageKey);
                
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    const dataKey = key.toLowerCase();
                    
                    dataStore[dataKey] = parsedData;
                }
            }
            
            console.log('Data loaded from local storage');
        } catch (error) {
            console.error('Error loading data from local storage:', error);
        }
    }
    
    /**
     * Save data to local storage
     * @param {string} key - The data key to save
     */
    function saveToLocalStorage(key) {
        try {
            const storageKey = STORAGE_KEYS[key.toUpperCase()];
            const dataToStore = JSON.stringify(dataStore[key]);
            
            localStorage.setItem(storageKey, dataToStore);
        } catch (error) {
            console.error(`Error saving ${key} to local storage:`, error);
        }
    }
    
    /**
     * Set up data synchronization
     */
    function setupSync() {
        // Check for unsynchronized data on startup
        if (navigator.onLine) {
            synchronize();
        }
        
        // Set up periodic sync (every 5 minutes)
        setInterval(function() {
            if (navigator.onLine) {
                synchronize();
            }
        }, 5 * 60 * 1000);
    }
    
    /**
     * Synchronize data with the server
     */
    function synchronize() {
        // Trigger syncStart event
        triggerEvent('syncStart');
        
        // In a real implementation, this would make API calls to sync data
        // For this mockup, we'll simulate a successful sync
        
        setTimeout(function() {
            // Update last sync time
            dataStore.lastSync = new Date().toISOString();
            saveToLocalStorage('lastSync');
            
            // Trigger syncComplete event
            triggerEvent('syncComplete', { timestamp: dataStore.lastSync });
            
            console.log('Data synchronized with server');
        }, 1000);
    }
    
    /**
     * Add an event listener
     * @param {string} eventName - The name of the event
     * @param {function} callback - The callback function
     */
    function addEventListener(eventName, callback) {
        if (eventListeners[eventName]) {
            eventListeners[eventName].push(callback);
        }
    }
    
    /**
     * Remove an event listener
     * @param {string} eventName - The name of the event
     * @param {function} callback - The callback function to remove
     */
    function removeEventListener(eventName, callback) {
        if (eventListeners[eventName]) {
            const index = eventListeners[eventName].indexOf(callback);
            if (index !== -1) {
                eventListeners[eventName].splice(index, 1);
            }
        }
    }
    
    /**
     * Trigger an event
     * @param {string} eventName - The name of the event
     * @param {object} data - The event data
     */
    function triggerEvent(eventName, data = {}) {
        if (eventListeners[eventName]) {
            eventListeners[eventName].forEach(callback => {
                callback(data);
            });
        }
    }
    
    /**
     * Get all agents
     * @returns {Array} Array of agent objects
     */
    function getAgents() {
        return [...dataStore.agents];
    }
    
    /**
     * Get an agent by ID
     * @param {string} id - The agent ID
     * @returns {object|null} The agent object or null if not found
     */
    function getAgentById(id) {
        return dataStore.agents.find(agent => agent.id === id) || null;
    }
    
    /**
     * Add or update an agent
     * @param {object} agent - The agent object
     */
    function saveAgent(agent) {
        const index = dataStore.agents.findIndex(a => a.id === agent.id);
        
        if (index !== -1) {
            // Update existing agent
            dataStore.agents[index] = {...dataStore.agents[index], ...agent};
        } else {
            // Add new agent
            dataStore.agents.push(agent);
        }
        
        // Save to local storage
        saveToLocalStorage('agents');
        
        // Trigger dataChange event
        triggerEvent('dataChange', { type: 'agents', action: index !== -1 ? 'update' : 'add', data: agent });
    }
    
    /**
     * Delete an agent
     * @param {string} id - The agent ID
     * @returns {boolean} True if the agent was deleted
     */
    function deleteAgent(id) {
        const index = dataStore.agents.findIndex(agent => agent.id === id);
        
        if (index !== -1) {
            const deletedAgent = dataStore.agents[index];
            dataStore.agents.splice(index, 1);
            
            // Save to local storage
            saveToLocalStorage('agents');
            
            // Trigger dataChange event
            triggerEvent('dataChange', { type: 'agents', action: 'delete', data: deletedAgent });
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Get all tasks
     * @returns {Array} Array of task objects
     */
    function getTasks() {
        return [...dataStore.tasks];
    }
    
    /**
     * Get tasks for an agent
     * @param {string} agentId - The agent ID
     * @returns {Array} Array of task objects
     */
    function getTasksByAgentId(agentId) {
        return dataStore.tasks.filter(task => task.agentId === agentId);
    }
    
    /**
     * Add or update a task
     * @param {object} task - The task object
     */
    function saveTask(task) {
        const index = dataStore.tasks.findIndex(t => t.id === task.id);
        
        if (index !== -1) {
            // Update existing task
            dataStore.tasks[index] = {...dataStore.tasks[index], ...task};
        } else {
            // Add new task
            dataStore.tasks.push(task);
        }
        
        // Save to local storage
        saveToLocalStorage('tasks');
        
        // Trigger dataChange event
        triggerEvent('dataChange', { type: 'tasks', action: index !== -1 ? 'update' : 'add', data: task });
    }
    
    /**
     * Delete a task
     * @param {string} id - The task ID
     * @returns {boolean} True if the task was deleted
     */
    function deleteTask(id) {
        const index = dataStore.tasks.findIndex(task => task.id === id);
        
        if (index !== -1) {
            const deletedTask = dataStore.tasks[index];
            dataStore.tasks.splice(index, 1);
            
            // Save to local storage
            saveToLocalStorage('tasks');
            
            // Trigger dataChange event
            triggerEvent('dataChange', { type: 'tasks', action: 'delete', data: deletedTask });
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Get all contexts
     * @returns {Array} Array of context objects
     */
    function getContexts() {
        return [...dataStore.contexts];
    }
    
    /**
     * Get contexts shared between agents
     * @param {string} agentId1 - The first agent ID
     * @param {string} agentId2 - The second agent ID
     * @returns {Array} Array of shared context objects
     */
    function getSharedContexts(agentId1, agentId2) {
        return dataStore.contexts.filter(context => 
            context.agentIds.includes(agentId1) && context.agentIds.includes(agentId2)
        );
    }
    
    /**
     * Add or update a context
     * @param {object} context - The context object
     */
    function saveContext(context) {
        const index = dataStore.contexts.findIndex(c => c.id === context.id);
        
        if (index !== -1) {
            // Update existing context
            dataStore.contexts[index] = {...dataStore.contexts[index], ...context};
        } else {
            // Add new context
            dataStore.contexts.push(context);
        }
        
        // Save to local storage
        saveToLocalStorage('contexts');
        
        // Trigger dataChange event
        triggerEvent('dataChange', { type: 'contexts', action: index !== -1 ? 'update' : 'add', data: context });
    }
    
    /**
     * Delete a context
     * @param {string} id - The context ID
     * @returns {boolean} True if the context was deleted
     */
    function deleteContext(id) {
        const index = dataStore.contexts.findIndex(context => context.id === id);
        
        if (index !== -1) {
            const deletedContext = dataStore.contexts[index];
            dataStore.contexts.splice(index, 1);
            
            // Save to local storage
            saveToLocalStorage('contexts');
            
            // Trigger dataChange event
            triggerEvent('dataChange', { type: 'contexts', action: 'delete', data: deletedContext });
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Get command history
     * @param {number} limit - Maximum number of commands to return
     * @returns {Array} Array of command objects
     */
    function getCommandHistory(limit = 10) {
        // Sort by timestamp descending and limit
        return [...dataStore.commands]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }
    
    /**
     * Add a command to history
     * @param {object} command - The command object
     */
    function addCommandToHistory(command) {
        // Add timestamp if not present
        if (!command.timestamp) {
            command.timestamp = new Date().toISOString();
        }
        
        // Add to beginning of array
        dataStore.commands.unshift(command);
        
        // Limit history to 100 commands
        if (dataStore.commands.length > 100) {
            dataStore.commands = dataStore.commands.slice(0, 100);
        }
        
        // Save to local storage
        saveToLocalStorage('commands');
        
        // Trigger dataChange event
        triggerEvent('dataChange', { type: 'commands', action: 'add', data: command });
    }
    
    /**
     * Clear command history
     */
    function clearCommandHistory() {
        dataStore.commands = [];
        
        // Save to local storage
        saveToLocalStorage('commands');
        
        // Trigger dataChange event
        triggerEvent('dataChange', { type: 'commands', action: 'clear' });
    }
    
    /**
     * Get notifications
     * @param {number} limit - Maximum number of notifications to return
     * @returns {Array} Array of notification objects
     */
    function getNotifications(limit = 10) {
        // Sort by timestamp descending and limit
        return [...dataStore.notifications]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }
    
    /**
     * Add a notification
     * @param {object} notification - The notification object
     */
    function addNotification(notification) {
        // Add timestamp if not present
        if (!notification.timestamp) {
            notification.timestamp = new Date().toISOString();
        }
        
        // Add to beginning of array
        dataStore.notifications.unshift(notification);
        
        // Limit to 100 notifications
        if (dataStore.notifications.length > 100) {
            dataStore.notifications = dataStore.notifications.slice(0, 100);
        }
        
        // Save to local storage
        saveToLocalStorage('notifications');
        
        // Trigger dataChange event
        triggerEvent('dataChange', { type: 'notifications', action: 'add', data: notification });
    }
    
    /**
     * Mark a notification as read
     * @param {string} id - The notification ID
     */
    function markNotificationAsRead(id) {
        const index = dataStore.notifications.findIndex(notification => notification.id === id);
        
        if (index !== -1) {
            dataStore.notifications[index].read = true;
            
            // Save to local storage
            saveToLocalStorage('notifications');
            
            // Trigger dataChange event
            triggerEvent('dataChange', { 
                type: 'notifications', 
                action: 'update', 
                data: dataStore.notifications[index] 
            });
        }
    }
    
    /**
     * Clear all notifications
     */
    function clearNotifications() {
        dataStore.notifications = [];
        
        // Save to local storage
        saveToLocalStorage('notifications');
        
        // Trigger dataChange event
        triggerEvent('dataChange', { type: 'notifications', action: 'clear' });
    }
    
    /**
     * Get user settings
     * @returns {object} User settings object
     */
    function getSettings() {
        return {...dataStore.settings};
    }
    
    /**
     * Update user settings
     * @param {object} settings - The settings to update
     */
    function updateSettings(settings) {
        dataStore.settings = {...dataStore.settings, ...settings};
        
        // Save to local storage
        saveToLocalStorage('settings');
        
        // Trigger dataChange event
        triggerEvent('dataChange', { type: 'settings', action: 'update', data: dataStore.settings });
    }
    
    /**
     * Get the last sync timestamp
     * @returns {string|null} ISO timestamp string or null if never synced
     */
    function getLastSyncTime() {
        return dataStore.lastSync;
    }
    
    /**
     * Generate a sample data set for demonstration
     */
    function generateSampleData() {
        // Sample agents
        const agents = [
            {
                id: 'agent1',
                name: 'Research Agent',
                type: 'research',
                status: STATUS_TYPES.ACTIVE,
                capabilities: ['web_search', 'data_analysis', 'summarization'],
                icon: '🔍'
            },
            {
                id: 'agent2',
                name: 'Assistant Agent',
                type: 'assistant',
                status: STATUS_TYPES.BUSY,
                capabilities: ['email_drafting', 'scheduling', 'reminders'],
                icon: '📝'
            },
            {
                id: 'agent3',
                name: 'Data Analysis Agent',
                type: 'analysis',
                status: STATUS_TYPES.IDLE,
                capabilities: ['data_processing', 'visualization', 'statistics'],
                icon: '📊'
            },
            {
                id: 'agent4',
                name: 'Creative Agent',
                type: 'creative',
                status: STATUS_TYPES.ACTIVE,
                capabilities: ['content_generation', 'image_description', 'brainstorming'],
                icon: '🎨'
            },
            {
                id: 'agent5',
                name: 'Code Agent',
                type: 'code',
                status: STATUS_TYPES.ERROR,
                capabilities: ['code_generation', 'debugging', 'code_review'],
                icon: '💻'
            }
        ];
        
        // Sample tasks
        const tasks = [
            {
                id: 'task1',
                agentId: 'agent1',
                title: 'Research renewable energy trends',
                description: 'Find the latest information about renewable energy adoption worldwide',
                status: 'in_progress',
                priority: PRIORITY_LEVELS.HIGH,
                progress: 70,
                created: '2023-06-01T10:00:00Z',
                updated: '2023-06-01T14:30:00Z'
            },
            {
                id: 'task2',
                agentId: 'agent2',
                title: 'Draft quarterly report email',
                description: 'Create an email summarizing Q2 performance for stakeholders',
                status: 'completed',
                priority: PRIORITY_LEVELS.URGENT,
                progress: 100,
                created: '2023-06-02T09:15:00Z',
                updated: '2023-06-02T11:45:00Z'
            },
            {
                id: 'task3',
                agentId: 'agent3',
                title: 'Analyze customer survey data',
                description: 'Process and visualize results from the recent customer satisfaction survey',
                status: 'not_started',
                priority: PRIORITY_LEVELS.MEDIUM,
                progress: 0,
                created: '2023-06-03T13:20:00Z',
                updated: '2023-06-03T13:20:00Z'
            },
            {
                id: 'task4',
                agentId: 'agent4',
                title: 'Generate product descriptions',
                description: 'Create compelling descriptions for the new product line',
                status: 'in_progress',
                priority: PRIORITY_LEVELS.LOW,
                progress: 30,
                created: '2023-06-02T15:10:00Z',
                updated: '2023-06-03T09:45:00Z'
            },
            {
                id: 'task5',
                agentId: 'agent5',
                title: 'Debug authentication service',
                description: 'Identify and fix issues with the user authentication system',
                status: 'blocked',
                priority: PRIORITY_LEVELS.URGENT,
                progress: 50,
                created: '2023-06-01T08:30:00Z',
                updated: '2023-06-03T16:20:00Z'
            }
        ];
        
        // Sample contexts
        const contexts = [
            {
                id: 'context1',
                name: 'Project Alpha',
                description: 'Shared context for Project Alpha development',
                agentIds: ['agent1', 'agent4', 'agent5'],
                data: {
                    key_information: 'Project Alpha is a renewable energy monitoring system',
                    deadlines: '2023-07-15',
                    resources: ['API documentation', 'Design specifications']
                }
            },
            {
                id: 'context2',
                name: 'Marketing Campaign',
                description: 'Shared context for Q3 marketing campaign',
                agentIds: ['agent2', 'agent4'],
                data: {
                    key_information: 'Q3 campaign focuses on sustainability features',
                    deadlines: '2023-06-30',
                    resources: ['Brand guidelines', 'Previous campaign metrics']
                }
            },
            {
                id: 'context3',
                name: 'Data Analysis Project',
                description: 'Shared context for customer data analysis',
                agentIds: ['agent1', 'agent3'],
                data: {
                    key_information: 'Analyzing customer behavior patterns across regions',
                    deadlines: '2023-06-20',
                    resources: ['Customer database', 'Regional sales data']
                }
            }
        ];
        
        // Sample command history
        const commands = [
            {
                id: 'cmd1',
                command: '@research find information about renewable energy',
                timestamp: '2023-06-03T15:30:00Z'
            },
            {
                id: 'cmd2',
                command: '@assistant schedule meeting with marketing team',
                timestamp: '2023-06-03T14:45:00Z'
            },
            {
                id: 'cmd3',
                command: '@analysis create chart from survey data',
                timestamp: '2023-06-03T13:20:00Z'
            },
            {
                id: 'cmd4',
                command: '@creative generate product description for eco-friendly packaging',
                timestamp: '2023-06-03T11:10:00Z'
            },
            {
                id: 'cmd5',
                command: '@code review authentication service',
                timestamp: '2023-06-03T10:05:00Z'
            },
            {
                id: 'cmd6',
                command: '@all status update',
                timestamp: '2023-06-03T09:30:00Z'
            }
        ];
        
        // Sample notifications
        const notifications = [
            {
                id: 'notif1',
                title: 'Research complete',
                message: 'Research on renewable energy trends is complete',
                type: 'success',
                agentId: 'agent1',
                read: false,
                timestamp: '2023-06-03T16:30:00Z'
            },
            {
                id: 'notif2',
                title: 'Error in Data Agent',
                message: 'Data Analysis Agent encountered an error processing survey data',
                type: 'error',
                agentId: 'agent3',
                read: false,
                timestamp: '2023-06-03T15:45:00Z'
            },
            {
                id: 'notif3',
                title: 'New task assigned',
                message: 'You have assigned a new task to Assistant Agent',
                type: 'info',
                agentId: 'agent2',
                read: true,
                timestamp: '2023-06-03T14:15:00Z'
            },
            {
                id: 'notif4',
                title: 'Task completed',
                message: 'Assistant Agent has completed drafting the quarterly report email',
                type: 'success',
                agentId: 'agent2',
                read: true,
                timestamp: '2023-06-03T11:45:00Z'
            }
        ];
        
        // Sample settings
        const settings = {
            theme: 'light',
            notifications: {
                desktop: true,
                email: false,
                sound: true
            },
            accessibility: {
                highContrast: false,
                largeText: false,
                screenReader: false
            },
            privacy: {
                shareUsageData: true,
                storeHistory: true
            }
        };
        
        // Update data store with sample data
        dataStore.agents = agents;
        dataStore.tasks = tasks;
        dataStore.contexts = contexts;
        dataStore.commands = commands;
        dataStore.notifications = notifications;
        dataStore.settings = settings;
        dataStore.lastSync = new Date().toISOString();
        
        // Save all to local storage
        Object.keys(STORAGE_KEYS).forEach(key => {
            saveToLocalStorage(key.toLowerCase());
        });
        
        // Trigger dataChange event for each data type
        triggerEvent('dataChange', { type: 'all', action: 'reset' });
        
        console.log('Sample data generated');
    }
    
    // Public API
    return {
        init: init,
        synchronize: synchronize,
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        
        // Agents
        getAgents: getAgents,
        getAgentById: getAgentById,
        saveAgent: saveAgent,
        deleteAgent: deleteAgent,
        
        // Tasks
        getTasks: getTasks,
        getTasksByAgentId: getTasksByAgentId,
        saveTask: saveTask,
        deleteTask: deleteTask,
        
        // Contexts
        getContexts: getContexts,
        getSharedContexts: getSharedContexts,
        saveContext: saveContext,
        deleteContext: deleteContext,
        
        // Commands
        getCommandHistory: getCommandHistory,
        addCommandToHistory: addCommandToHistory,
        clearCommandHistory: clearCommandHistory,
        
        // Notifications
        getNotifications: getNotifications,
        addNotification: addNotification,
        markNotificationAsRead: markNotificationAsRead,
        clearNotifications: clearNotifications,
        
        // Settings
        getSettings: getSettings,
        updateSettings: updateSettings,
        
        // Sync
        getLastSyncTime: getLastSyncTime,
        
        // Sample data
        generateSampleData: generateSampleData,
        
        // Constants
        PRIORITY_LEVELS: PRIORITY_LEVELS,
        STATUS_TYPES: STATUS_TYPES
    };
})();

// Initialize data model when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    DataModel.init();
    
    // Generate sample data if none exists
    if (DataModel.getAgents().length === 0) {
        DataModel.generateSampleData();
    }
});

