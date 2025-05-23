/**
 * Context Panel Component
 * 
 * This component displays details and controls for the selected agent or context.
 * It adapts to different device form factors.
 */

const ContextPanelComponent = (function() {
    // DOM elements
    let containerElement = null;
    
    // Component state
    let isInitialized = false;
    let selectedAgentId = null;
    let selectedContextId = null;
    
    /**
     * Initialize the context panel component
     * @param {HTMLElement} container - The container element
     */
    function init(container) {
        if (isInitialized) {
            return;
        }
        
        containerElement = container;
        
        // Create component structure
        createComponentStructure();
        
        isInitialized = true;
        
        // Listen for device changes
        window.addEventListener('devicechange', function(event) {
            // Rebuild component when device changes
            createComponentStructure();
        });
        
        // Listen for agent selection
        window.addEventListener('agentselect', function(event) {
            selectAgent(event.detail.agentId);
        });
        
        // Listen for context selection
        window.addEventListener('contextselect', function(event) {
            selectContext(event.detail.contextId);
        });
        
        // Listen for data changes
        DataModel.addEventListener('dataChange', function(event) {
            // Update panel when relevant data changes
            if ((event.type === 'agents' && selectedAgentId) || 
                (event.type === 'contexts' && selectedContextId) ||
                (event.type === 'tasks' && selectedAgentId)) {
                createComponentStructure();
            }
        });
    }
    
    /**
     * Create the component structure based on device type and selection
     */
    function createComponentStructure() {
        // Clear container
        containerElement.innerHTML = '';
        
        // Get device info
        const deviceInfo = DeviceDetection.getDeviceInfo();
        
        // Create header
        const header = document.createElement('div');
        header.className = 'context-header';
        
        const title = document.createElement('div');
        title.className = 'context-title';
        title.textContent = 'Details';
        header.appendChild(title);
        
        // Add collapse button for tablet and desktop
        if (deviceInfo.type !== DeviceDetection.DEVICE_TYPES.MOBILE) {
            const collapseButton = document.createElement('button');
            collapseButton.className = 'collapse-button';
            collapseButton.textContent = '▶';
            collapseButton.setAttribute('aria-label', 'Collapse context panel');
            
            collapseButton.addEventListener('click', function() {
                const panel = containerElement.closest('.context-panel');
                
                if (panel) {
                    panel.classList.toggle('context-panel-collapsed');
                    
                    // Update button text
                    this.textContent = panel.classList.contains('context-panel-collapsed') ? '◀' : '▶';
                    this.setAttribute('aria-label', 
                        panel.classList.contains('context-panel-collapsed') ? 'Expand context panel' : 'Collapse context panel');
                }
            });
            
            header.appendChild(collapseButton);
        }
        
        containerElement.appendChild(header);
        
        // Create content based on selection
        if (selectedAgentId && selectedAgentId !== 'all') {
            createAgentDetails(selectedAgentId);
        } else if (selectedContextId) {
            createContextDetails(selectedContextId);
        } else {
            createEmptyState();
        }
    }
    
    /**
     * Create agent details view
     * @param {string} agentId - The agent ID
     */
    function createAgentDetails(agentId) {
        const agent = DataModel.getAgentById(agentId);
        
        if (!agent) {
            createEmptyState();
            return;
        }
        
        // Create agent details container
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'agent-details';
        
        // Agent header
        const agentHeader = document.createElement('div');
        agentHeader.className = 'agent-details-header';
        
        const agentIcon = document.createElement('div');
        agentIcon.className = 'agent-icon';
        agentIcon.textContent = agent.icon || '🤖';
        agentHeader.appendChild(agentIcon);
        
        const agentInfo = document.createElement('div');
        agentInfo.className = 'agent-info';
        
        const agentName = document.createElement('h3');
        agentName.className = 'agent-name';
        agentName.textContent = agent.name;
        agentInfo.appendChild(agentName);
        
        const agentType = document.createElement('div');
        agentType.className = 'agent-type';
        agentType.textContent = `Type: ${agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}`;
        agentInfo.appendChild(agentType);
        
        const agentStatus = document.createElement('div');
        agentStatus.className = 'agent-status-text';
        
        const statusDot = document.createElement('span');
        statusDot.className = `agent-status status-${agent.status}`;
        agentStatus.appendChild(statusDot);
        
        const statusText = document.createElement('span');
        statusText.textContent = `Status: ${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}`;
        agentStatus.appendChild(statusText);
        
        agentInfo.appendChild(agentStatus);
        
        agentHeader.appendChild(agentInfo);
        detailsContainer.appendChild(agentHeader);
        
        // Agent capabilities
        if (agent.capabilities && agent.capabilities.length > 0) {
            const capabilitiesSection = document.createElement('div');
            capabilitiesSection.className = 'agent-capabilities-section';
            
            const capabilitiesTitle = document.createElement('h4');
            capabilitiesTitle.textContent = 'Capabilities';
            capabilitiesSection.appendChild(capabilitiesTitle);
            
            const capabilitiesList = document.createElement('ul');
            capabilitiesList.className = 'agent-capabilities-list';
            
            agent.capabilities.forEach(capability => {
                const capabilityItem = document.createElement('li');
                capabilityItem.className = 'agent-capability-item';
                capabilityItem.textContent = capability.charAt(0).toUpperCase() + capability.slice(1).replace(/_/g, ' ');
                capabilitiesList.appendChild(capabilityItem);
            });
            
            capabilitiesSection.appendChild(capabilitiesList);
            detailsContainer.appendChild(capabilitiesSection);
        }
        
        // Agent tasks
        const tasksSection = document.createElement('div');
        tasksSection.className = 'agent-tasks-section';
        
        const tasksTitle = document.createElement('h4');
        tasksTitle.textContent = 'Tasks';
        tasksSection.appendChild(tasksTitle);
        
        // Get tasks for this agent
        const tasks = DataModel.getTasksByAgentId(agentId);
        
        // Sort tasks by priority
        const sortedTasks = PriorityManagement.sortByPriority(tasks);
        
        if (sortedTasks.length > 0) {
            const tasksList = document.createElement('ul');
            tasksList.className = 'agent-tasks-list';
            
            sortedTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = 'agent-task-item';
                
                // Priority indicator
                const priorityIndicator = PriorityManagement.createPriorityIndicator(task.priority);
                taskItem.appendChild(priorityIndicator);
                
                // Task content
                const taskContent = document.createElement('div');
                taskContent.className = 'task-content';
                
                const taskTitle = document.createElement('div');
                taskTitle.className = 'task-title';
                taskTitle.textContent = task.title;
                taskContent.appendChild(taskTitle);
                
                const taskStatus = document.createElement('div');
                taskStatus.className = 'task-status';
                taskStatus.textContent = task.status.replace(/_/g, ' ');
                taskContent.appendChild(taskStatus);
                
                // Progress bar
                if (typeof task.progress === 'number') {
                    const progressContainer = document.createElement('div');
                    progressContainer.className = 'task-progress-container';
                    
                    const progressBar = document.createElement('div');
                    progressBar.className = 'task-progress-bar';
                    progressBar.style.width = `${task.progress}%`;
                    
                    // Add color based on status
                    if (task.status === 'completed') {
                        progressBar.classList.add('progress-complete');
                    } else if (task.status === 'blocked') {
                        progressBar.classList.add('progress-blocked');
                    } else {
                        progressBar.classList.add('progress-active');
                    }
                    
                    progressContainer.appendChild(progressBar);
                    
                    const progressText = document.createElement('div');
                    progressText.className = 'task-progress-text';
                    progressText.textContent = `${task.progress}%`;
                    
                    taskContent.appendChild(progressContainer);
                    taskContent.appendChild(progressText);
                }
                
                taskItem.appendChild(taskContent);
                tasksList.appendChild(taskItem);
            });
            
            tasksSection.appendChild(tasksList);
        } else {
            const noTasks = document.createElement('div');
            noTasks.className = 'no-tasks-message';
            noTasks.textContent = 'No tasks assigned to this agent.';
            tasksSection.appendChild(noTasks);
        }
        
        detailsContainer.appendChild(tasksSection);
        
        // Shared contexts
        const contextsSection = document.createElement('div');
        contextsSection.className = 'agent-contexts-section';
        
        const contextsTitle = document.createElement('h4');
        contextsTitle.textContent = 'Shared Contexts';
        contextsSection.appendChild(contextsTitle);
        
        // Get contexts for this agent
        const allContexts = DataModel.getContexts();
        const agentContexts = allContexts.filter(context => 
            context.agentIds.includes(agentId)
        );
        
        if (agentContexts.length > 0) {
            const contextsList = document.createElement('ul');
            contextsList.className = 'agent-contexts-list';
            
            agentContexts.forEach(context => {
                const contextItem = document.createElement('li');
                contextItem.className = 'agent-context-item';
                contextItem.textContent = context.name;
                
                // Add click handler to select context
                contextItem.addEventListener('click', function() {
                    selectContext(context.id);
                });
                
                contextsList.appendChild(contextItem);
            });
            
            contextsSection.appendChild(contextsList);
        } else {
            const noContexts = document.createElement('div');
            noContexts.className = 'no-contexts-message';
            noContexts.textContent = 'No shared contexts for this agent.';
            contextsSection.appendChild(noContexts);
        }
        
        detailsContainer.appendChild(contextsSection);
        
        // Quick command section
        const commandSection = document.createElement('div');
        commandSection.className = 'quick-command-section';
        
        const commandTitle = document.createElement('h4');
        commandTitle.textContent = 'Quick Command';
        commandSection.appendChild(commandTitle);
        
        const commandInput = document.createElement('div');
        commandInput.className = 'quick-command-input';
        
        const commandPrefix = document.createElement('span');
        commandPrefix.className = 'command-prefix';
        commandPrefix.textContent = `@${agent.id} `;
        commandInput.appendChild(commandPrefix);
        
        const actionInput = document.createElement('input');
        actionInput.type = 'text';
        actionInput.className = 'command-action-input';
        actionInput.placeholder = 'action parameters';
        commandInput.appendChild(actionInput);
        
        const sendButton = document.createElement('button');
        sendButton.className = 'send-command-button';
        sendButton.textContent = 'Send';
        
        sendButton.addEventListener('click', function() {
            const action = actionInput.value.trim();
            
            if (action) {
                const commandString = `@${agent.id} ${action}`;
                
                // Parse and validate command
                const command = CommandLanguage.parseCommand(commandString);
                const validation = CommandLanguage.validateCommand(command);
                
                if (validation.isValid) {
                    // Execute command
                    CommandLanguage.executeCommand(command)
                        .then(result => {
                            // Show success
                            NotificationSystem.showNotification({
                                title: 'Command Executed',
                                message: result.result,
                                type: NotificationSystem.NOTIFICATION_TYPES.SUCCESS,
                                autoClose: true
                            });
                            
                            // Clear input
                            actionInput.value = '';
                        })
                        .catch(error => {
                            // Show error
                            NotificationSystem.showNotification({
                                title: 'Command Error',
                                message: error.message,
                                type: NotificationSystem.NOTIFICATION_TYPES.ERROR,
                                autoClose: true
                            });
                        });
                } else {
                    // Show validation error
                    NotificationSystem.showNotification({
                        title: 'Invalid Command',
                        message: validation.message,
                        type: NotificationSystem.NOTIFICATION_TYPES.ERROR,
                        autoClose: true
                    });
                }
            }
        });
        
        commandInput.appendChild(sendButton);
        commandSection.appendChild(commandInput);
        
        detailsContainer.appendChild(commandSection);
        
        containerElement.appendChild(detailsContainer);
    }
    
    /**
     * Create context details view
     * @param {string} contextId - The context ID
     */
    function createContextDetails(contextId) {
        const context = DataModel.getContexts().find(c => c.id === contextId);
        
        if (!context) {
            createEmptyState();
            return;
        }
        
        // Create context details container
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'context-details';
        
        // Context header
        const contextHeader = document.createElement('div');
        contextHeader.className = 'context-details-header';
        
        const contextName = document.createElement('h3');
        contextName.className = 'context-name';
        contextName.textContent = context.name;
        contextHeader.appendChild(contextName);
        
        detailsContainer.appendChild(contextHeader);
        
        // Context description
        if (context.description) {
            const description = document.createElement('div');
            description.className = 'context-description';
            description.textContent = context.description;
            detailsContainer.appendChild(description);
        }
        
        // Agents in this context
        const agentsSection = document.createElement('div');
        agentsSection.className = 'context-agents-section';
        
        const agentsTitle = document.createElement('h4');
        agentsTitle.textContent = 'Agents';
        agentsSection.appendChild(agentsTitle);
        
        const agentsList = document.createElement('ul');
        agentsList.className = 'context-agents-list';
        
        // Get agents in this context
        const allAgents = DataModel.getAgents();
        const contextAgents = allAgents.filter(agent => 
            context.agentIds.includes(agent.id)
        );
        
        if (contextAgents.length > 0) {
            contextAgents.forEach(agent => {
                const agentItem = document.createElement('li');
                agentItem.className = 'context-agent-item';
                
                const statusDot = document.createElement('span');
                statusDot.className = `agent-status status-${agent.status}`;
                agentItem.appendChild(statusDot);
                
                const agentName = document.createElement('span');
                agentName.className = 'agent-name';
                agentName.textContent = agent.name;
                agentItem.appendChild(agentName);
                
                // Add click handler to select agent
                agentItem.addEventListener('click', function() {
                    selectAgent(agent.id);
                });
                
                agentsList.appendChild(agentItem);
            });
        } else {
            const noAgents = document.createElement('li');
            noAgents.className = 'no-agents-message';
            noAgents.textContent = 'No agents in this context.';
            agentsList.appendChild(noAgents);
        }
        
        agentsSection.appendChild(agentsList);
        detailsContainer.appendChild(agentsSection);
        
        // Context data
        if (context.data) {
            const dataSection = document.createElement('div');
            dataSection.className = 'context-data-section';
            
            const dataTitle = document.createElement('h4');
            dataTitle.textContent = 'Context Data';
            dataSection.appendChild(dataTitle);
            
            const dataList = document.createElement('dl');
            dataList.className = 'context-data-list';
            
            for (const key in context.data) {
                const dt = document.createElement('dt');
                dt.textContent = key.replace(/_/g, ' ');
                dataList.appendChild(dt);
                
                const dd = document.createElement('dd');
                dd.textContent = context.data[key];
                dataList.appendChild(dd);
            }
            
            dataSection.appendChild(dataList);
            detailsContainer.appendChild(dataSection);
        }
        
        containerElement.appendChild(detailsContainer);
    }
    
    /**
     * Create empty state view
     */
    function createEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        const icon = document.createElement('div');
        icon.className = 'empty-state-icon';
        icon.textContent = '👈';
        emptyState.appendChild(icon);
        
        const message = document.createElement('div');
        message.className = 'empty-state-message';
        message.textContent = 'Select an agent or context to view details';
        emptyState.appendChild(message);
        
        containerElement.appendChild(emptyState);
    }
    
    /**
     * Select an agent to display
     * @param {string} agentId - The agent ID to select
     */
    function selectAgent(agentId) {
        selectedAgentId = agentId;
        selectedContextId = null;
        
        // Rebuild component
        createComponentStructure();
    }
    
    /**
     * Select a context to display
     * @param {string} contextId - The context ID to select
     */
    function selectContext(contextId) {
        selectedContextId = contextId;
        selectedAgentId = null;
        
        // Rebuild component
        createComponentStructure();
    }
    
    /**
     * Get the selected agent ID
     * @returns {string|null} The selected agent ID or null if none selected
     */
    function getSelectedAgentId() {
        return selectedAgentId;
    }
    
    /**
     * Get the selected context ID
     * @returns {string|null} The selected context ID or null if none selected
     */
    function getSelectedContextId() {
        return selectedContextId;
    }
    
    // Public API
    return {
        init: init,
        selectAgent: selectAgent,
        selectContext: selectContext,
        getSelectedAgentId: getSelectedAgentId,
        getSelectedContextId: getSelectedContextId
    };
})();

