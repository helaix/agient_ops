/**
 * Unified Command Language
 * 
 * This module implements the consistent command syntax across all devices:
 * @[agent] [action] [parameters]
 * 
 * It provides command parsing, validation, execution, history, autocomplete,
 * and suggestion functionality.
 */

const CommandLanguage = (function() {
    // Command syntax regex
    const COMMAND_REGEX = /^@([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)(?:\s+(.+))?$/;
    
    // Command templates
    const COMMAND_TEMPLATES = [
        {
            id: 'search',
            template: '@[agent] search [query]',
            description: 'Search for information',
            examples: [
                '@research search renewable energy',
                '@analysis search customer data trends'
            ]
        },
        {
            id: 'create',
            template: '@[agent] create [item]',
            description: 'Create a new item',
            examples: [
                '@assistant create meeting',
                '@creative create product description'
            ]
        },
        {
            id: 'analyze',
            template: '@[agent] analyze [data]',
            description: 'Analyze data or information',
            examples: [
                '@analysis analyze survey results',
                '@research analyze market trends'
            ]
        },
        {
            id: 'summarize',
            template: '@[agent] summarize [content]',
            description: 'Generate a summary',
            examples: [
                '@research summarize article',
                '@assistant summarize meeting notes'
            ]
        },
        {
            id: 'status',
            template: '@[agent] status',
            description: 'Check agent status',
            examples: [
                '@code status',
                '@all status'
            ]
        }
    ];
    
    // Available actions by agent type
    const AGENT_ACTIONS = {
        research: ['search', 'analyze', 'summarize', 'status', 'find', 'compare'],
        assistant: ['schedule', 'remind', 'create', 'draft', 'summarize', 'status'],
        analysis: ['analyze', 'visualize', 'predict', 'correlate', 'status', 'chart'],
        creative: ['generate', 'design', 'create', 'improve', 'status', 'ideate'],
        code: ['write', 'debug', 'review', 'optimize', 'status', 'test']
    };
    
    // Special agent identifiers
    const SPECIAL_AGENTS = {
        ALL: 'all',
        SYSTEM: 'system'
    };
    
    /**
     * Parse a command string
     * @param {string} commandString - The command string to parse
     * @returns {object|null} Parsed command object or null if invalid
     */
    function parseCommand(commandString) {
        const match = commandString.match(COMMAND_REGEX);
        
        if (!match) {
            return null;
        }
        
        return {
            agent: match[1].toLowerCase(),
            action: match[2].toLowerCase(),
            parameters: match[3] || '',
            original: commandString
        };
    }
    
    /**
     * Validate a parsed command
     * @param {object} command - The parsed command object
     * @returns {object} Validation result with isValid and message properties
     */
    function validateCommand(command) {
        // Check if command is null
        if (!command) {
            return {
                isValid: false,
                message: 'Invalid command format. Use @[agent] [action] [parameters]'
            };
        }
        
        // Get available agents
        const availableAgents = DataModel.getAgents().map(agent => agent.id);
        
        // Check if agent exists or is a special agent
        const isValidAgent = availableAgents.includes(command.agent) || 
                            command.agent === SPECIAL_AGENTS.ALL || 
                            command.agent === SPECIAL_AGENTS.SYSTEM;
        
        if (!isValidAgent) {
            return {
                isValid: false,
                message: `Unknown agent: ${command.agent}`
            };
        }
        
        // For special agents, only certain actions are valid
        if (command.agent === SPECIAL_AGENTS.ALL) {
            const validAllActions = ['status', 'pause', 'resume', 'help'];
            if (!validAllActions.includes(command.action)) {
                return {
                    isValid: false,
                    message: `Invalid action for @all: ${command.action}. Valid actions: ${validAllActions.join(', ')}`
                };
            }
        } else if (command.agent === SPECIAL_AGENTS.SYSTEM) {
            const validSystemActions = ['settings', 'help', 'clear', 'sync'];
            if (!validSystemActions.includes(command.action)) {
                return {
                    isValid: false,
                    message: `Invalid action for @system: ${command.action}. Valid actions: ${validSystemActions.join(', ')}`
                };
            }
        } else {
            // Get agent type
            const agent = DataModel.getAgentById(command.agent);
            const agentType = agent ? agent.type : null;
            
            // Check if action is valid for agent type
            if (agentType && AGENT_ACTIONS[agentType] && !AGENT_ACTIONS[agentType].includes(command.action)) {
                return {
                    isValid: false,
                    message: `Invalid action for ${agent.name}: ${command.action}. Valid actions: ${AGENT_ACTIONS[agentType].join(', ')}`
                };
            }
        }
        
        return {
            isValid: true,
            message: 'Valid command'
        };
    }
    
    /**
     * Execute a command
     * @param {object} command - The parsed command object
     * @returns {Promise} Promise that resolves with the command result
     */
    function executeCommand(command) {
        // Add command to history
        DataModel.addCommandToHistory({
            id: 'cmd_' + Date.now(),
            command: command.original,
            timestamp: new Date().toISOString()
        });
        
        // In a real implementation, this would dispatch the command to the appropriate agent
        // For this mockup, we'll simulate command execution
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate command execution
                if (command.agent === SPECIAL_AGENTS.ALL && command.action === 'status') {
                    // Get status of all agents
                    const agents = DataModel.getAgents();
                    const statuses = agents.map(agent => `${agent.name}: ${agent.status}`);
                    
                    resolve({
                        success: true,
                        result: statuses.join('\n')
                    });
                } else if (command.agent === SPECIAL_AGENTS.SYSTEM && command.action === 'help') {
                    // Show help
                    resolve({
                        success: true,
                        result: 'Available commands:\n' + COMMAND_TEMPLATES.map(template => 
                            `${template.template} - ${template.description}`
                        ).join('\n')
                    });
                } else {
                    // Simulate agent-specific command
                    const agent = DataModel.getAgentById(command.agent);
                    
                    if (agent) {
                        resolve({
                            success: true,
                            result: `${agent.name} executed ${command.action} with parameters: ${command.parameters || 'none'}`
                        });
                    } else {
                        resolve({
                            success: true,
                            result: `Executed ${command.action} for ${command.agent} with parameters: ${command.parameters || 'none'}`
                        });
                    }
                }
            }, 500);
        });
    }
    
    /**
     * Get command suggestions based on input
     * @param {string} input - The current input string
     * @returns {Array} Array of suggestion objects
     */
    function getSuggestions(input) {
        // If input is empty, return empty array
        if (!input) {
            return [];
        }
        
        // If input starts with @, suggest agents
        if (input === '@') {
            // Get all agents
            const agents = DataModel.getAgents().map(agent => agent.id);
            
            // Add special agents
            agents.push(SPECIAL_AGENTS.ALL);
            agents.push(SPECIAL_AGENTS.SYSTEM);
            
            // Return agent suggestions
            return agents.map(agent => ({
                type: 'agent',
                value: agent,
                display: `@${agent}`,
                complete: `@${agent} `
            }));
        }
        
        // If input is @agent, suggest actions
        if (input.match(/^@([a-zA-Z0-9_]+)$/)) {
            const agentId = input.substring(1);
            
            // Check if it's a special agent
            if (agentId === SPECIAL_AGENTS.ALL) {
                return ['status', 'pause', 'resume', 'help'].map(action => ({
                    type: 'action',
                    value: action,
                    display: action,
                    complete: `@${agentId} ${action} `
                }));
            } else if (agentId === SPECIAL_AGENTS.SYSTEM) {
                return ['settings', 'help', 'clear', 'sync'].map(action => ({
                    type: 'action',
                    value: action,
                    display: action,
                    complete: `@${agentId} ${action} `
                }));
            } else {
                // Get agent type
                const agent = DataModel.getAgentById(agentId);
                const agentType = agent ? agent.type : null;
                
                // Get actions for agent type
                const actions = agentType && AGENT_ACTIONS[agentType] ? 
                    AGENT_ACTIONS[agentType] : 
                    ['status'];
                
                // Return action suggestions
                return actions.map(action => ({
                    type: 'action',
                    value: action,
                    display: action,
                    complete: `@${agentId} ${action} `
                }));
            }
        }
        
        // If input is @agent action, suggest parameters or templates
        if (input.match(/^@([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)$/)) {
            const parts = input.split(/\s+/);
            const agentId = parts[0].substring(1);
            const action = parts[1];
            
            // Find matching templates
            const templates = COMMAND_TEMPLATES.filter(template => 
                template.id === action
            );
            
            if (templates.length > 0) {
                // Return template examples
                return templates[0].examples
                    .filter(example => example.startsWith(`@${agentId}`))
                    .map(example => ({
                        type: 'template',
                        value: example,
                        display: example,
                        complete: example
                    }));
            }
        }
        
        // If input is partial, suggest matching commands
        const commandHistory = DataModel.getCommandHistory();
        
        return commandHistory
            .filter(cmd => cmd.command.startsWith(input))
            .map(cmd => ({
                type: 'history',
                value: cmd.command,
                display: cmd.command,
                complete: cmd.command
            }));
    }
    
    /**
     * Get command templates
     * @returns {Array} Array of command template objects
     */
    function getCommandTemplates() {
        return [...COMMAND_TEMPLATES];
    }
    
    /**
     * Get command history
     * @param {number} limit - Maximum number of commands to return
     * @returns {Array} Array of command history objects
     */
    function getCommandHistory(limit = 10) {
        return DataModel.getCommandHistory(limit);
    }
    
    /**
     * Clear command history
     */
    function clearCommandHistory() {
        DataModel.clearCommandHistory();
    }
    
    // Public API
    return {
        parseCommand: parseCommand,
        validateCommand: validateCommand,
        executeCommand: executeCommand,
        getSuggestions: getSuggestions,
        getCommandTemplates: getCommandTemplates,
        getCommandHistory: getCommandHistory,
        clearCommandHistory: clearCommandHistory,
        SPECIAL_AGENTS: SPECIAL_AGENTS
    };
})();

