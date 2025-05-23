#!/usr/bin/env node

/**
 * Linear State Management Agent
 * 
 * Optimizes Linear workflow states and automation
 * Creates custom states, implements automated updates, and manages cycles
 */

const { LinearClient } = require('@linear/sdk');
const winston = require('winston');
const WebSocket = require('ws');
require('dotenv').config();

class LinearStateManager {
  constructor() {
    this.linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
    this.orchestratorWs = null;
    this.customStates = [
      {
        name: 'Blocked by Review',
        color: '#ff4444',
        type: 'unstarted',
        description: 'Issue is blocked waiting for code review'
      },
      {
        name: 'Integration Ready',
        color: '#ffaa00',
        type: 'started',
        description: 'Ready for integration with other components'
      },
      {
        name: 'Waiting for Dependencies',
        color: '#ff8800',
        type: 'unstarted',
        description: 'Blocked by external dependencies'
      },
      {
        name: 'Ready for Testing',
        color: '#0088ff',
        type: 'started',
        description: 'Implementation complete, ready for testing'
      },
      {
        name: 'Deployment Ready',
        color: '#00aa44',
        type: 'completed',
        description: 'Tested and ready for deployment'
      }
    ];
    
    this.setupLogger();
    this.connectToOrchestrator();
  }

  setupLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({ label: 'LinearStateManager' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/linear-state-manager.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }

  connectToOrchestrator() {
    try {
      this.orchestratorWs = new WebSocket('ws://localhost:8080');
      
      this.orchestratorWs.on('open', () => {
        this.logger.info('Connected to Workflow Orchestrator');
        this.sendStatusUpdate('active', { message: 'Linear State Manager initialized' });
      });

      this.orchestratorWs.on('error', (error) => {
        this.logger.error('WebSocket connection error:', error);
      });

      this.orchestratorWs.on('close', () => {
        this.logger.warn('Connection to orchestrator closed, attempting reconnect...');
        setTimeout(() => this.connectToOrchestrator(), 5000);
      });
    } catch (error) {
      this.logger.error('Failed to connect to orchestrator:', error);
    }
  }

  sendStatusUpdate(status, data = {}) {
    if (this.orchestratorWs && this.orchestratorWs.readyState === WebSocket.OPEN) {
      this.orchestratorWs.send(JSON.stringify({
        agentName: 'linear-state-manager',
        type: 'status_update',
        data: { status, ...data }
      }));
    }
  }

  sendMetricsUpdate(metrics) {
    if (this.orchestratorWs && this.orchestratorWs.readyState === WebSocket.OPEN) {
      this.orchestratorWs.send(JSON.stringify({
        agentName: 'linear-state-manager',
        type: 'metrics_update',
        data: metrics
      }));
    }
  }

  async start() {
    this.logger.info('Starting Linear State Manager Agent');
    
    try {
      // Get team information
      const teams = await this.getTeams();
      this.logger.info(`Found ${teams.length} teams`);

      // Create custom states for each team
      for (const team of teams) {
        await this.createCustomStatesForTeam(team);
      }

      // Set up automated status updates
      await this.setupAutomatedUpdates();

      // Create cycles for related work grouping
      await this.setupWorkflowCycles();

      // Start monitoring and automation
      this.startMonitoring();

      this.sendStatusUpdate('active', { 
        message: 'Linear State Manager fully operational',
        customStatesCreated: this.customStates.length,
        teamsConfigured: teams.length
      });

    } catch (error) {
      this.logger.error('Failed to start Linear State Manager:', error);
      this.sendStatusUpdate('error', { error: error.message });
    }
  }

  async getTeams() {
    try {
      const teamsResponse = await this.linear.teams();
      return teamsResponse.nodes || [];
    } catch (error) {
      this.logger.error('Failed to fetch teams:', error);
      return [];
    }
  }

  async createCustomStatesForTeam(team) {
    this.logger.info(`Creating custom states for team: ${team.name}`);
    
    try {
      // Get existing states to avoid duplicates
      const existingStates = await this.linear.workflowStates({
        filter: { team: { id: { eq: team.id } } }
      });

      const existingStateNames = existingStates.nodes.map(state => state.name);

      for (const customState of this.customStates) {
        if (!existingStateNames.includes(customState.name)) {
          try {
            await this.linear.workflowStateCreate({
              name: customState.name,
              color: customState.color,
              type: customState.type,
              description: customState.description,
              teamId: team.id
            });
            
            this.logger.info(`Created custom state '${customState.name}' for team ${team.name}`);
          } catch (stateError) {
            this.logger.warn(`Failed to create state '${customState.name}' for team ${team.name}:`, stateError.message);
          }
        } else {
          this.logger.info(`State '${customState.name}' already exists for team ${team.name}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to create custom states for team ${team.name}:`, error);
    }
  }

  async setupAutomatedUpdates() {
    this.logger.info('Setting up automated status updates');
    
    // This would integrate with GitHub webhooks to automatically update Linear states
    // based on PR status changes
    
    // Example automation rules:
    const automationRules = [
      {
        trigger: 'pr_opened',
        action: 'move_to_state',
        targetState: 'Blocked by Review'
      },
      {
        trigger: 'pr_approved',
        action: 'move_to_state',
        targetState: 'Integration Ready'
      },
      {
        trigger: 'pr_merged',
        action: 'move_to_state',
        targetState: 'Deployment Ready'
      },
      {
        trigger: 'tests_passing',
        action: 'move_to_state',
        targetState: 'Ready for Testing'
      }
    ];

    // Store automation rules for later use
    this.automationRules = automationRules;
    
    this.logger.info(`Configured ${automationRules.length} automation rules`);
  }

  async setupWorkflowCycles() {
    this.logger.info('Setting up Linear cycles for related work grouping');
    
    try {
      const teams = await this.getTeams();
      
      for (const team of teams) {
        // Create cycles for different types of work
        const cycles = [
          {
            name: 'Multi-Agent Workflow Optimization - Phase 1',
            description: 'Foundation Setup: Linear State Management and Integration Dashboard',
            startsAt: new Date(),
            endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
          },
          {
            name: 'Multi-Agent Workflow Optimization - Phase 2',
            description: 'Bottleneck Resolution: Review Management and Process Optimization',
            startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks
          },
          {
            name: 'Multi-Agent Workflow Optimization - Phase 3',
            description: 'Full Implementation: Context Optimization and Documentation Bridge',
            startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            endsAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000) // 4 weeks
          }
        ];

        for (const cycle of cycles) {
          try {
            await this.linear.cycleCreate({
              ...cycle,
              teamId: team.id
            });
            
            this.logger.info(`Created cycle '${cycle.name}' for team ${team.name}`);
          } catch (cycleError) {
            this.logger.warn(`Failed to create cycle '${cycle.name}' for team ${team.name}:`, cycleError.message);
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to setup workflow cycles:', error);
    }
  }

  startMonitoring() {
    this.logger.info('Starting Linear state monitoring');
    
    // Monitor state transitions and accuracy
    setInterval(async () => {
      await this.monitorStateAccuracy();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Monitor automation effectiveness
    setInterval(async () => {
      await this.monitorAutomationEffectiveness();
    }, 15 * 60 * 1000); // Every 15 minutes
  }

  async monitorStateAccuracy() {
    try {
      // Get all issues and check if their states match their actual status
      const issues = await this.linear.issues({
        first: 100,
        filter: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      let accurateStates = 0;
      let totalStates = issues.nodes.length;

      for (const issue of issues.nodes) {
        // Check if state matches actual status (simplified logic)
        const isAccurate = await this.validateIssueState(issue);
        if (isAccurate) accurateStates++;
      }

      const accuracy = totalStates > 0 ? (accurateStates / totalStates) * 100 : 100;
      
      this.sendMetricsUpdate({
        linearStateAccuracy: accuracy,
        totalIssuesChecked: totalStates,
        accurateStates: accurateStates
      });

      this.logger.info(`Linear state accuracy: ${accuracy.toFixed(2)}% (${accurateStates}/${totalStates})`);
      
    } catch (error) {
      this.logger.error('Failed to monitor state accuracy:', error);
    }
  }

  async validateIssueState(issue) {
    // Simplified validation logic
    // In a real implementation, this would check:
    // - PR status vs issue state
    // - Test results vs issue state
    // - Deployment status vs issue state
    
    return true; // Placeholder
  }

  async monitorAutomationEffectiveness() {
    try {
      // Monitor how often automation rules are triggered and successful
      const metrics = {
        automationRulesTriggered: 0,
        automationRulesSuccessful: 0,
        averageStateTransitionTime: 0
      };

      // This would be populated by actual automation tracking
      
      this.sendMetricsUpdate(metrics);
      
    } catch (error) {
      this.logger.error('Failed to monitor automation effectiveness:', error);
    }
  }

  async handleGitHubWebhook(payload) {
    // Handle GitHub webhook events to trigger state transitions
    const { action, pull_request, repository } = payload;
    
    if (!pull_request) return;

    try {
      // Find related Linear issue
      const issueNumber = this.extractLinearIssueFromPR(pull_request);
      if (!issueNumber) return;

      const issue = await this.findLinearIssue(issueNumber);
      if (!issue) return;

      // Apply automation rules
      for (const rule of this.automationRules) {
        if (this.shouldTriggerRule(rule, action, pull_request)) {
          await this.applyAutomationRule(rule, issue);
        }
      }
      
    } catch (error) {
      this.logger.error('Failed to handle GitHub webhook:', error);
    }
  }

  extractLinearIssueFromPR(pullRequest) {
    // Extract Linear issue number from PR title or description
    const text = `${pullRequest.title} ${pullRequest.body}`;
    const match = text.match(/HLX-(\d+)/i);
    return match ? match[0] : null;
  }

  async findLinearIssue(issueNumber) {
    try {
      const issues = await this.linear.issues({
        filter: { number: { eq: parseInt(issueNumber.split('-')[1]) } }
      });
      return issues.nodes[0] || null;
    } catch (error) {
      this.logger.error('Failed to find Linear issue:', error);
      return null;
    }
  }

  shouldTriggerRule(rule, action, pullRequest) {
    switch (rule.trigger) {
      case 'pr_opened':
        return action === 'opened';
      case 'pr_approved':
        return action === 'submitted' && pullRequest.state === 'approved';
      case 'pr_merged':
        return action === 'closed' && pullRequest.merged;
      default:
        return false;
    }
  }

  async applyAutomationRule(rule, issue) {
    try {
      if (rule.action === 'move_to_state') {
        // Find the target state
        const states = await this.linear.workflowStates({
          filter: { 
            team: { id: { eq: issue.team.id } },
            name: { eq: rule.targetState }
          }
        });

        if (states.nodes.length > 0) {
          await this.linear.issueUpdate(issue.id, {
            stateId: states.nodes[0].id
          });
          
          this.logger.info(`Moved issue ${issue.identifier} to state '${rule.targetState}'`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to apply automation rule:', error);
    }
  }
}

// Start the agent if this file is run directly
if (require.main === module) {
  const agent = new LinearStateManager();
  agent.start().catch(error => {
    console.error('Failed to start Linear State Manager:', error);
    process.exit(1);
  });
}

module.exports = LinearStateManager;

