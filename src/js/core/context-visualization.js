/**
 * Context Visualization
 * 
 * This module provides visual representation of context sharing between agents,
 * with adaptive visualization based on device capabilities:
 * - Desktop: Interactive network graph with detailed relationships
 * - Tablet: Simplified network with expandable details
 * - Mobile: List view with relationship indicators
 */

const ContextVisualization = (function() {
    // DOM elements
    let containerElement = null;
    
    // Visualization state
    let currentVisualization = null;
    let selectedAgentId = null;
    let selectedContextId = null;
    
    // Visualization types
    const VISUALIZATION_TYPES = {
        NETWORK: 'network',
        SIMPLIFIED: 'simplified',
        LIST: 'list'
    };
    
    /**
     * Initialize the context visualization
     * @param {HTMLElement} container - The container element
     */
    function init(container) {
        containerElement = container;
        
        // Listen for device changes
        window.addEventListener('devicechange', function(event) {
            // Rebuild visualization when device changes
            if (containerElement) {
                buildVisualization();
            }
        });
        
        // Listen for data changes
        DataModel.addEventListener('dataChange', function(event) {
            // Rebuild visualization when agents or contexts change
            if (event.type === 'agents' || event.type === 'contexts') {
                if (containerElement) {
                    buildVisualization();
                }
            }
        });
    }
    
    /**
     * Build the appropriate visualization based on device type
     */
    function buildVisualization() {
        // Clear container
        containerElement.innerHTML = '';
        
        // Get device info
        const deviceInfo = DeviceDetection.getDeviceInfo();
        
        // Choose visualization type based on device
        let visualizationType;
        
        if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.DESKTOP) {
            visualizationType = VISUALIZATION_TYPES.NETWORK;
        } else if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.TABLET) {
            visualizationType = VISUALIZATION_TYPES.SIMPLIFIED;
        } else {
            visualizationType = VISUALIZATION_TYPES.LIST;
        }
        
        // Build the visualization
        switch (visualizationType) {
            case VISUALIZATION_TYPES.NETWORK:
                buildNetworkVisualization();
                break;
            case VISUALIZATION_TYPES.SIMPLIFIED:
                buildSimplifiedVisualization();
                break;
            case VISUALIZATION_TYPES.LIST:
                buildListVisualization();
                break;
        }
    }
    
    /**
     * Build interactive network graph for desktop
     */
    function buildNetworkVisualization() {
        // Create container for network visualization
        const networkContainer = document.createElement('div');
        networkContainer.className = 'network-graph-container context-visualization-desktop';
        containerElement.appendChild(networkContainer);
        
        // Create canvas for network visualization
        const canvas = document.createElement('canvas');
        canvas.width = networkContainer.clientWidth || 800;
        canvas.height = networkContainer.clientHeight || 500;
        networkContainer.appendChild(canvas);
        
        // Get data for visualization
        const agents = DataModel.getAgents();
        const contexts = DataModel.getContexts();
        
        // In a real implementation, this would use a library like D3.js or Sigma.js
        // For this mockup, we'll create a simple canvas-based visualization
        
        // Create a simple force-directed graph
        const ctx = canvas.getContext('2d');
        
        // Define node positions (in a real implementation, this would be calculated by the force-directed algorithm)
        const nodePositions = {};
        const nodeRadius = 30;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 3;
        
        // Position agents in a circle
        agents.forEach((agent, index) => {
            const angle = (index / agents.length) * Math.PI * 2;
            nodePositions[agent.id] = {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                type: 'agent',
                data: agent
            };
        });
        
        // Draw connections between agents based on shared contexts
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections
        contexts.forEach(context => {
            const agentIds = context.agentIds;
            
            // Draw lines between all agents in this context
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 2;
            
            for (let i = 0; i < agentIds.length; i++) {
                for (let j = i + 1; j < agentIds.length; j++) {
                    const agent1 = nodePositions[agentIds[i]];
                    const agent2 = nodePositions[agentIds[j]];
                    
                    if (agent1 && agent2) {
                        ctx.beginPath();
                        ctx.moveTo(agent1.x, agent1.y);
                        ctx.lineTo(agent2.x, agent2.y);
                        ctx.stroke();
                    }
                }
            }
        });
        
        // Draw agent nodes
        agents.forEach(agent => {
            const position = nodePositions[agent.id];
            
            if (position) {
                // Draw circle
                ctx.beginPath();
                ctx.arc(position.x, position.y, nodeRadius, 0, Math.PI * 2);
                
                // Fill based on agent status
                switch (agent.status) {
                    case DataModel.STATUS_TYPES.ACTIVE:
                        ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
                        break;
                    case DataModel.STATUS_TYPES.BUSY:
                        ctx.fillStyle = 'rgba(243, 156, 18, 0.8)';
                        break;
                    case DataModel.STATUS_TYPES.ERROR:
                        ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
                        break;
                    case DataModel.STATUS_TYPES.IDLE:
                        ctx.fillStyle = 'rgba(189, 195, 199, 0.8)';
                        break;
                    default:
                        ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
                }
                
                ctx.fill();
                
                // Draw border
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw agent name
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(agent.name, position.x, position.y);
            }
        });
        
        // Add controls for the network visualization
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'network-controls';
        
        // Zoom controls
        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        
        const zoomInButton = document.createElement('button');
        zoomInButton.textContent = '+';
        zoomInButton.className = 'zoom-button';
        zoomInButton.setAttribute('aria-label', 'Zoom in');
        
        const zoomOutButton = document.createElement('button');
        zoomOutButton.textContent = '-';
        zoomOutButton.className = 'zoom-button';
        zoomOutButton.setAttribute('aria-label', 'Zoom out');
        
        zoomControls.appendChild(zoomInButton);
        zoomControls.appendChild(zoomOutButton);
        controlsContainer.appendChild(zoomControls);
        
        // Filter controls
        const filterControls = document.createElement('div');
        filterControls.className = 'filter-controls';
        
        const filterLabel = document.createElement('span');
        filterLabel.textContent = 'Filter by context:';
        
        const filterSelect = document.createElement('select');
        filterSelect.className = 'context-filter';
        
        // Add "All" option
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All contexts';
        filterSelect.appendChild(allOption);
        
        // Add context options
        contexts.forEach(context => {
            const option = document.createElement('option');
            option.value = context.id;
            option.textContent = context.name;
            filterSelect.appendChild(option);
        });
        
        filterControls.appendChild(filterLabel);
        filterControls.appendChild(filterSelect);
        controlsContainer.appendChild(filterControls);
        
        networkContainer.appendChild(controlsContainer);
        
        // Add legend
        const legend = document.createElement('div');
        legend.className = 'network-legend';
        
        const legendTitle = document.createElement('h4');
        legendTitle.textContent = 'Agent Status';
        legend.appendChild(legendTitle);
        
        const statusTypes = [
            { status: DataModel.STATUS_TYPES.ACTIVE, label: 'Active' },
            { status: DataModel.STATUS_TYPES.BUSY, label: 'Busy' },
            { status: DataModel.STATUS_TYPES.ERROR, label: 'Error' },
            { status: DataModel.STATUS_TYPES.IDLE, label: 'Idle' }
        ];
        
        statusTypes.forEach(statusType => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            const legendColor = document.createElement('span');
            legendColor.className = `legend-color status-${statusType.status}`;
            
            const legendLabel = document.createElement('span');
            legendLabel.textContent = statusType.label;
            
            legendItem.appendChild(legendColor);
            legendItem.appendChild(legendLabel);
            legend.appendChild(legendItem);
        });
        
        networkContainer.appendChild(legend);
    }
    
    /**
     * Build simplified network with expandable details for tablet
     */
    function buildSimplifiedVisualization() {
        // Create container for simplified visualization
        const simplifiedContainer = document.createElement('div');
        simplifiedContainer.className = 'simplified-network context-visualization-tablet';
        containerElement.appendChild(simplifiedContainer);
        
        // Get data for visualization
        const agents = DataModel.getAgents();
        const contexts = DataModel.getContexts();
        
        // Create agent nodes
        agents.forEach(agent => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'network-node';
            nodeElement.setAttribute('data-agent-id', agent.id);
            
            // Agent header
            const nodeHeader = document.createElement('div');
            nodeHeader.className = 'network-node-header';
            
            const statusIndicator = document.createElement('span');
            statusIndicator.className = `agent-status status-${agent.status}`;
            
            const agentName = document.createElement('h3');
            agentName.textContent = agent.name;
            
            const expandButton = document.createElement('button');
            expandButton.className = 'expand-button';
            expandButton.textContent = '+';
            expandButton.setAttribute('aria-label', 'Expand agent details');
            
            nodeHeader.appendChild(statusIndicator);
            nodeHeader.appendChild(agentName);
            nodeHeader.appendChild(expandButton);
            nodeElement.appendChild(nodeHeader);
            
            // Agent details (initially hidden)
            const nodeDetails = document.createElement('div');
            nodeDetails.className = 'network-node-details';
            nodeDetails.style.display = 'none';
            
            // Shared contexts
            const sharedContextsTitle = document.createElement('h4');
            sharedContextsTitle.textContent = 'Shared Contexts';
            nodeDetails.appendChild(sharedContextsTitle);
            
            const sharedContextsList = document.createElement('ul');
            sharedContextsList.className = 'shared-contexts-list';
            
            // Find contexts that include this agent
            const agentContexts = contexts.filter(context => 
                context.agentIds.includes(agent.id)
            );
            
            if (agentContexts.length > 0) {
                agentContexts.forEach(context => {
                    const contextItem = document.createElement('li');
                    
                    const contextName = document.createElement('span');
                    contextName.textContent = context.name;
                    
                    // Create badges for other agents in this context
                    const otherAgents = context.agentIds.filter(id => id !== agent.id);
                    
                    contextItem.appendChild(contextName);
                    
                    if (otherAgents.length > 0) {
                        const agentBadges = document.createElement('div');
                        agentBadges.className = 'agent-badges';
                        
                        otherAgents.forEach(agentId => {
                            const otherAgent = agents.find(a => a.id === agentId);
                            
                            if (otherAgent) {
                                const badge = document.createElement('span');
                                badge.className = 'agent-badge';
                                badge.textContent = otherAgent.name.substring(0, 2).toUpperCase();
                                badge.setAttribute('title', otherAgent.name);
                                
                                agentBadges.appendChild(badge);
                            }
                        });
                        
                        contextItem.appendChild(agentBadges);
                    }
                    
                    sharedContextsList.appendChild(contextItem);
                });
            } else {
                const noContexts = document.createElement('li');
                noContexts.textContent = 'No shared contexts';
                sharedContextsList.appendChild(noContexts);
            }
            
            nodeDetails.appendChild(sharedContextsList);
            nodeElement.appendChild(nodeDetails);
            
            // Add click handler for expand button
            expandButton.addEventListener('click', function() {
                const isExpanded = nodeDetails.style.display !== 'none';
                
                if (isExpanded) {
                    nodeDetails.style.display = 'none';
                    expandButton.textContent = '+';
                } else {
                    nodeDetails.style.display = 'block';
                    expandButton.textContent = '-';
                }
            });
            
            simplifiedContainer.appendChild(nodeElement);
        });
        
        // Add filter controls
        const filterControls = document.createElement('div');
        filterControls.className = 'filter-controls';
        
        const filterLabel = document.createElement('span');
        filterLabel.textContent = 'Filter by context:';
        
        const filterSelect = document.createElement('select');
        filterSelect.className = 'context-filter';
        
        // Add "All" option
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All contexts';
        filterSelect.appendChild(allOption);
        
        // Add context options
        contexts.forEach(context => {
            const option = document.createElement('option');
            option.value = context.id;
            option.textContent = context.name;
            filterSelect.appendChild(option);
        });
        
        filterControls.appendChild(filterLabel);
        filterControls.appendChild(filterSelect);
        
        // Insert filter controls at the top
        simplifiedContainer.insertBefore(filterControls, simplifiedContainer.firstChild);
        
        // Add filter functionality
        filterSelect.addEventListener('change', function() {
            const selectedContextId = this.value;
            
            // Show all nodes if no context selected
            if (!selectedContextId) {
                const allNodes = simplifiedContainer.querySelectorAll('.network-node');
                allNodes.forEach(node => {
                    node.style.display = 'block';
                });
                return;
            }
            
            // Get the selected context
            const selectedContext = contexts.find(context => context.id === selectedContextId);
            
            if (selectedContext) {
                // Show only nodes for agents in this context
                const allNodes = simplifiedContainer.querySelectorAll('.network-node');
                
                allNodes.forEach(node => {
                    const agentId = node.getAttribute('data-agent-id');
                    
                    if (selectedContext.agentIds.includes(agentId)) {
                        node.style.display = 'block';
                    } else {
                        node.style.display = 'none';
                    }
                });
            }
        });
    }
    
    /**
     * Build list view with relationship indicators for mobile
     */
    function buildListVisualization() {
        // Create container for list visualization
        const listContainer = document.createElement('div');
        listContainer.className = 'relationship-list-container context-visualization-mobile';
        containerElement.appendChild(listContainer);
        
        // Get data for visualization
        const agents = DataModel.getAgents();
        const contexts = DataModel.getContexts();
        
        // Create filter controls
        const filterControls = document.createElement('div');
        filterControls.className = 'filter-controls';
        
        const filterLabel = document.createElement('div');
        filterLabel.textContent = 'View by:';
        filterLabel.className = 'filter-label';
        
        const viewToggle = document.createElement('div');
        viewToggle.className = 'view-toggle';
        
        const agentsButton = document.createElement('button');
        agentsButton.className = 'view-toggle-button active';
        agentsButton.textContent = 'Agents';
        
        const contextsButton = document.createElement('button');
        contextsButton.className = 'view-toggle-button';
        contextsButton.textContent = 'Contexts';
        
        viewToggle.appendChild(agentsButton);
        viewToggle.appendChild(contextsButton);
        
        filterControls.appendChild(filterLabel);
        filterControls.appendChild(viewToggle);
        listContainer.appendChild(filterControls);
        
        // Create list container
        const listElement = document.createElement('ul');
        listElement.className = 'relationship-list';
        listContainer.appendChild(listElement);
        
        // Initial view: Agents
        buildAgentListView(listElement, agents, contexts);
        
        // Add toggle functionality
        agentsButton.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                agentsButton.classList.add('active');
                contextsButton.classList.remove('active');
                buildAgentListView(listElement, agents, contexts);
            }
        });
        
        contextsButton.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                contextsButton.classList.add('active');
                agentsButton.classList.remove('active');
                buildContextListView(listElement, agents, contexts);
            }
        });
    }
    
    /**
     * Build agent-focused list view for mobile
     * @param {HTMLElement} listElement - The list container element
     * @param {Array} agents - Array of agent objects
     * @param {Array} contexts - Array of context objects
     */
    function buildAgentListView(listElement, agents, contexts) {
        // Clear list
        listElement.innerHTML = '';
        
        // Create list items for each agent
        agents.forEach(agent => {
            const listItem = document.createElement('li');
            listItem.className = 'relationship-item';
            
            // Agent header
            const itemHeader = document.createElement('div');
            itemHeader.className = 'relationship-item-header';
            
            const statusIndicator = document.createElement('span');
            statusIndicator.className = `agent-status status-${agent.status}`;
            
            const agentName = document.createElement('h3');
            agentName.textContent = agent.name;
            
            const expandButton = document.createElement('button');
            expandButton.className = 'expand-button';
            expandButton.textContent = '+';
            expandButton.setAttribute('aria-label', 'Expand agent details');
            
            itemHeader.appendChild(statusIndicator);
            itemHeader.appendChild(agentName);
            itemHeader.appendChild(expandButton);
            listItem.appendChild(itemHeader);
            
            // Agent details (initially hidden)
            const itemDetails = document.createElement('div');
            itemDetails.className = 'relationship-item-details';
            itemDetails.style.display = 'none';
            
            // Find contexts that include this agent
            const agentContexts = contexts.filter(context => 
                context.agentIds.includes(agent.id)
            );
            
            if (agentContexts.length > 0) {
                const contextsList = document.createElement('ul');
                contextsList.className = 'contexts-list';
                
                agentContexts.forEach(context => {
                    const contextItem = document.createElement('li');
                    contextItem.className = 'context-item';
                    
                    const contextIndicator = document.createElement('span');
                    contextIndicator.className = 'relationship-indicator';
                    
                    const contextName = document.createElement('span');
                    contextName.textContent = context.name;
                    
                    // Show number of other agents in this context
                    const otherAgentsCount = context.agentIds.filter(id => id !== agent.id).length;
                    const otherAgentsLabel = document.createElement('span');
                    otherAgentsLabel.className = 'other-agents-count';
                    otherAgentsLabel.textContent = `${otherAgentsCount} other agent${otherAgentsCount !== 1 ? 's' : ''}`;
                    
                    contextItem.appendChild(contextIndicator);
                    contextItem.appendChild(contextName);
                    contextItem.appendChild(otherAgentsLabel);
                    contextsList.appendChild(contextItem);
                });
                
                itemDetails.appendChild(contextsList);
            } else {
                const noContexts = document.createElement('p');
                noContexts.textContent = 'No shared contexts';
                itemDetails.appendChild(noContexts);
            }
            
            listItem.appendChild(itemDetails);
            
            // Add click handler for expand button
            expandButton.addEventListener('click', function() {
                const isExpanded = itemDetails.style.display !== 'none';
                
                if (isExpanded) {
                    itemDetails.style.display = 'none';
                    expandButton.textContent = '+';
                } else {
                    itemDetails.style.display = 'block';
                    expandButton.textContent = '-';
                }
            });
            
            listElement.appendChild(listItem);
        });
    }
    
    /**
     * Build context-focused list view for mobile
     * @param {HTMLElement} listElement - The list container element
     * @param {Array} agents - Array of agent objects
     * @param {Array} contexts - Array of context objects
     */
    function buildContextListView(listElement, agents, contexts) {
        // Clear list
        listElement.innerHTML = '';
        
        // Create list items for each context
        contexts.forEach(context => {
            const listItem = document.createElement('li');
            listItem.className = 'relationship-item';
            
            // Context header
            const itemHeader = document.createElement('div');
            itemHeader.className = 'relationship-item-header';
            
            const contextName = document.createElement('h3');
            contextName.textContent = context.name;
            
            const expandButton = document.createElement('button');
            expandButton.className = 'expand-button';
            expandButton.textContent = '+';
            expandButton.setAttribute('aria-label', 'Expand context details');
            
            itemHeader.appendChild(contextName);
            itemHeader.appendChild(expandButton);
            listItem.appendChild(itemHeader);
            
            // Context details (initially hidden)
            const itemDetails = document.createElement('div');
            itemDetails.className = 'relationship-item-details';
            itemDetails.style.display = 'none';
            
            // Description
            const description = document.createElement('p');
            description.textContent = context.description;
            itemDetails.appendChild(description);
            
            // Agents in this context
            const agentsTitle = document.createElement('h4');
            agentsTitle.textContent = 'Agents in this context:';
            itemDetails.appendChild(agentsTitle);
            
            const agentsList = document.createElement('ul');
            agentsList.className = 'agents-list';
            
            context.agentIds.forEach(agentId => {
                const agent = agents.find(a => a.id === agentId);
                
                if (agent) {
                    const agentItem = document.createElement('li');
                    agentItem.className = 'agent-item';
                    
                    const statusIndicator = document.createElement('span');
                    statusIndicator.className = `agent-status status-${agent.status}`;
                    
                    const agentName = document.createElement('span');
                    agentName.textContent = agent.name;
                    
                    agentItem.appendChild(statusIndicator);
                    agentItem.appendChild(agentName);
                    agentsList.appendChild(agentItem);
                }
            });
            
            itemDetails.appendChild(agentsList);
            listItem.appendChild(itemDetails);
            
            // Add click handler for expand button
            expandButton.addEventListener('click', function() {
                const isExpanded = itemDetails.style.display !== 'none';
                
                if (isExpanded) {
                    itemDetails.style.display = 'none';
                    expandButton.textContent = '+';
                } else {
                    itemDetails.style.display = 'block';
                    expandButton.textContent = '-';
                }
            });
            
            listElement.appendChild(listItem);
        });
    }
    
    /**
     * Select an agent in the visualization
     * @param {string} agentId - The agent ID to select
     */
    function selectAgent(agentId) {
        selectedAgentId = agentId;
        
        // Update visualization to highlight the selected agent
        // Implementation depends on the current visualization type
        
        // Trigger custom event
        const event = new CustomEvent('agentselect', { detail: { agentId } });
        containerElement.dispatchEvent(event);
    }
    
    /**
     * Select a context in the visualization
     * @param {string} contextId - The context ID to select
     */
    function selectContext(contextId) {
        selectedContextId = contextId;
        
        // Update visualization to highlight the selected context
        // Implementation depends on the current visualization type
        
        // Trigger custom event
        const event = new CustomEvent('contextselect', { detail: { contextId } });
        containerElement.dispatchEvent(event);
    }
    
    // Public API
    return {
        init: init,
        buildVisualization: buildVisualization,
        selectAgent: selectAgent,
        selectContext: selectContext,
        VISUALIZATION_TYPES: VISUALIZATION_TYPES
    };
})();

