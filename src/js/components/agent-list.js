/**
 * Agent List Component
 * 
 * This component displays a list of agents with their status and provides
 * interaction for selecting and managing agents. It adapts to different
 * device form factors.
 */

const AgentListComponent = (function() {
    // DOM elements
    let containerElement = null;
    
    // Component state
    let isInitialized = false;
    let selectedAgentId = null;
    
    /**
     * Initialize the agent list component
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
        
        // Listen for data changes
        DataModel.addEventListener('dataChange', function(event) {
            // Update agent list when agents change
            if (event.type === 'agents') {
                createComponentStructure();
            }
        });
    }
    
    /**
     * Create the component structure based on device type
     */
    function createComponentStructure() {
        // Clear container
        containerElement.innerHTML = '';
        
        // Get device info
        const deviceInfo = DeviceDetection.getDeviceInfo();
        
        // Create header
        const header = document.createElement('div');
        header.className = 'sidebar-header';
        
        const title = document.createElement('div');
        title.className = 'sidebar-title';
        title.textContent = 'Agents';
        header.appendChild(title);
        
        // Add collapse button for tablet and desktop
        if (deviceInfo.type !== DeviceDetection.DEVICE_TYPES.MOBILE) {
            const collapseButton = document.createElement('button');
            collapseButton.className = 'collapse-button';
            collapseButton.textContent = '◀';
            collapseButton.setAttribute('aria-label', 'Collapse sidebar');
            
            collapseButton.addEventListener('click', function() {
                const sidebar = containerElement.closest('.sidebar');
                
                if (sidebar) {
                    sidebar.classList.toggle('sidebar-collapsed');
                    
                    // Update button text
                    this.textContent = sidebar.classList.contains('sidebar-collapsed') ? '▶' : '◀';
                    this.setAttribute('aria-label', 
                        sidebar.classList.contains('sidebar-collapsed') ? 'Expand sidebar' : 'Collapse sidebar');
                }
            });
            
            header.appendChild(collapseButton);
        }
        
        containerElement.appendChild(header);
        
        // Create agent list
        const agentList = document.createElement('ul');
        agentList.className = 'agent-list';
        
        // Get agents
        const agents = DataModel.getAgents();
        
        // Sort agents by status (active first, then busy, then idle, then error)
        const sortedAgents = [...agents].sort((a, b) => {
            const statusOrder = {
                [DataModel.STATUS_TYPES.ACTIVE]: 0,
                [DataModel.STATUS_TYPES.BUSY]: 1,
                [DataModel.STATUS_TYPES.IDLE]: 2,
                [DataModel.STATUS_TYPES.ERROR]: 3
            };
            
            return statusOrder[a.status] - statusOrder[b.status];
        });
        
        // Create agent items
        sortedAgents.forEach(agent => {
            const agentItem = document.createElement('li');
            agentItem.className = 'agent-item';
            agentItem.dataset.agentId = agent.id;
            
            // Add selected class if this is the selected agent
            if (agent.id === selectedAgentId) {
                agentItem.classList.add('selected');
            }
            
            // Status indicator
            const statusIndicator = document.createElement('span');
            statusIndicator.className = `agent-status status-${agent.status}`;
            agentItem.appendChild(statusIndicator);
            
            // Agent name
            const agentName = document.createElement('span');
            agentName.className = 'agent-name';
            agentName.textContent = agent.name;
            agentItem.appendChild(agentName);
            
            // Agent actions
            const agentActions = document.createElement('div');
            agentActions.className = 'agent-actions';
            
            // Pause/resume button
            const pauseResumeButton = document.createElement('button');
            pauseResumeButton.className = 'agent-action-button';
            pauseResumeButton.textContent = agent.status === DataModel.STATUS_TYPES.ACTIVE ? '⏸' : '▶';
            pauseResumeButton.setAttribute('aria-label', 
                agent.status === DataModel.STATUS_TYPES.ACTIVE ? 'Pause agent' : 'Resume agent');
            
            pauseResumeButton.addEventListener('click', function(event) {
                event.stopPropagation();
                toggleAgentStatus(agent.id);
            });
            
            agentActions.appendChild(pauseResumeButton);
            
            // Add actions to item
            agentItem.appendChild(agentActions);
            
            // Add click handler for selection
            agentItem.addEventListener('click', function() {
                selectAgent(agent.id);
            });
            
            agentList.appendChild(agentItem);
        });
        
        containerElement.appendChild(agentList);
        
        // Add "All Agents" option
        const allAgentsItem = document.createElement('li');
        allAgentsItem.className = 'agent-item all-agents-item';
        allAgentsItem.dataset.agentId = 'all';
        
        // Add selected class if "all" is selected
        if (selectedAgentId === 'all') {
            allAgentsItem.classList.add('selected');
        }
        
        // Icon
        const allAgentsIcon = document.createElement('span');
        allAgentsIcon.className = 'agent-status all-agents-icon';
        allAgentsIcon.textContent = '👥';
        allAgentsItem.appendChild(allAgentsIcon);
        
        // Name
        const allAgentsName = document.createElement('span');
        allAgentsName.className = 'agent-name';
        allAgentsName.textContent = 'All Agents';
        allAgentsItem.appendChild(allAgentsName);
        
        // Add click handler
        allAgentsItem.addEventListener('click', function() {
            selectAgent('all');
        });
        
        agentList.appendChild(allAgentsItem);
        
        // Add filter for tablet and desktop
        if (deviceInfo.type !== DeviceDetection.DEVICE_TYPES.MOBILE) {
            const filterContainer = document.createElement('div');
            filterContainer.className = 'agent-filter-container';
            
            const filterInput = document.createElement('input');
            filterInput.type = 'text';
            filterInput.className = 'agent-filter-input';
            filterInput.placeholder = 'Filter agents...';
            
            filterInput.addEventListener('input', function() {
                filterAgents(this.value);
            });
            
            filterContainer.appendChild(filterInput);
            containerElement.insertBefore(filterContainer, agentList);
        }
        
        // Add agent stats for desktop
        if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.DESKTOP) {
            const statsContainer = document.createElement('div');
            statsContainer.className = 'agent-stats-container';
            
            // Count agents by status
            const statusCounts = {
                [DataModel.STATUS_TYPES.ACTIVE]: 0,
                [DataModel.STATUS_TYPES.BUSY]: 0,
                [DataModel.STATUS_TYPES.IDLE]: 0,
                [DataModel.STATUS_TYPES.ERROR]: 0
            };
            
            agents.forEach(agent => {
                statusCounts[agent.status]++;
            });
            
            // Create stats
            const statsList = document.createElement('ul');
            statsList.className = 'agent-stats-list';
            
            for (const status in statusCounts) {
                const statsItem = document.createElement('li');
                statsItem.className = `agent-stats-item status-${status}`;
                
                const statusDot = document.createElement('span');
                statusDot.className = `agent-status status-${status}`;
                statsItem.appendChild(statusDot);
                
                const statusText = document.createElement('span');
                statusText.textContent = `${status.charAt(0).toUpperCase() + status.slice(1)}: ${statusCounts[status]}`;
                statsItem.appendChild(statusText);
                
                statsList.appendChild(statsItem);
            }
            
            statsContainer.appendChild(statsList);
            containerElement.appendChild(statsContainer);
        }
    }
    
    /**
     * Select an agent
     * @param {string} agentId - The agent ID to select
     */
    function selectAgent(agentId) {
        selectedAgentId = agentId;
        
        // Update UI
        const agentItems = containerElement.querySelectorAll('.agent-item');
        
        agentItems.forEach(item => {
            if (item.dataset.agentId === agentId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // Dispatch event
        const event = new CustomEvent('agentselect', { 
            detail: { 
                agentId,
                agent: agentId === 'all' ? null : DataModel.getAgentById(agentId)
            } 
        });
        containerElement.dispatchEvent(event);
    }
    
    /**
     * Toggle agent status between active and paused
     * @param {string} agentId - The agent ID to toggle
     */
    function toggleAgentStatus(agentId) {
        const agent = DataModel.getAgentById(agentId);
        
        if (!agent) {
            return;
        }
        
        // Toggle status
        const newStatus = agent.status === DataModel.STATUS_TYPES.ACTIVE ? 
            DataModel.STATUS_TYPES.IDLE : 
            DataModel.STATUS_TYPES.ACTIVE;
        
        // Update agent
        const updatedAgent = {
            ...agent,
            status: newStatus
        };
        
        DataModel.saveAgent(updatedAgent);
        
        // Show notification
        NotificationSystem.showNotification({
            title: `Agent ${newStatus === DataModel.STATUS_TYPES.ACTIVE ? 'Resumed' : 'Paused'}`,
            message: `${agent.name} has been ${newStatus === DataModel.STATUS_TYPES.ACTIVE ? 'resumed' : 'paused'}.`,
            type: NotificationSystem.NOTIFICATION_TYPES.INFO,
            autoClose: true
        });
    }
    
    /**
     * Filter agents by name
     * @param {string} query - The filter query
     */
    function filterAgents(query) {
        const agentItems = containerElement.querySelectorAll('.agent-item:not(.all-agents-item)');
        
        if (!query) {
            // Show all agents
            agentItems.forEach(item => {
                item.style.display = '';
            });
            return;
        }
        
        // Convert query to lowercase for case-insensitive matching
        const lowerQuery = query.toLowerCase();
        
        // Filter agents
        agentItems.forEach(item => {
            const agentName = item.querySelector('.agent-name').textContent.toLowerCase();
            
            if (agentName.includes(lowerQuery)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    /**
     * Get the selected agent ID
     * @returns {string} The selected agent ID
     */
    function getSelectedAgentId() {
        return selectedAgentId;
    }
    
    /**
     * Get the selected agent
     * @returns {object|null} The selected agent object or null if "all" is selected
     */
    function getSelectedAgent() {
        if (selectedAgentId === 'all') {
            return null;
        }
        
        return DataModel.getAgentById(selectedAgentId);
    }
    
    // Public API
    return {
        init: init,
        selectAgent: selectAgent,
        getSelectedAgentId: getSelectedAgentId,
        getSelectedAgent: getSelectedAgent
    };
})();

