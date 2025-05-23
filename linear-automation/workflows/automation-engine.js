/**
 * Linear Automation Engine
 * Implements automated workflows for issue management
 */

const { LinearClient } = require('@linear/sdk');
const config = require('../automation-config.json');

class LinearAutomationEngine {
  constructor(apiKey) {
    this.linear = new LinearClient({ apiKey });
    this.config = config;
    this.teamId = config.team_id;
  }

  /**
   * Initialize automation engine
   */
  async initialize() {
    console.log('Initializing Linear Automation Engine...');
    
    // Verify team access
    const team = await this.linear.team(this.teamId);
    if (!team) {
      throw new Error(`Cannot access team with ID: ${this.teamId}`);
    }
    
    console.log(`Connected to team: ${team.name} (${team.key})`);
    
    // Load current states and labels
    await this.loadTeamMetadata();
    
    console.log('Automation engine initialized successfully');
  }

  /**
   * Load team metadata (states, labels, etc.)
   */
  async loadTeamMetadata() {
    const team = await this.linear.team(this.teamId);
    
    // Load states
    this.states = {};
    const states = await team.states();
    for (const state of states.nodes) {
      this.states[state.id] = state;
      this.states[state.name.toLowerCase()] = state;
    }
    
    // Load labels
    this.labels = {};
    const labels = await team.labels();
    for (const label of labels.nodes) {
      this.labels[label.id] = label;
      this.labels[label.name.toLowerCase()] = label;
    }
    
    // Load projects
    this.projects = {};
    const projects = await this.linear.projects();
    for (const project of projects.nodes) {
      this.projects[project.id] = project;
      this.projects[project.name.toLowerCase()] = project;
    }
  }

  /**
   * Process new issue creation
   */
  async processNewIssue(issueId) {
    const issue = await this.linear.issue(issueId);
    if (!issue) return;

    console.log(`Processing new issue: ${issue.identifier} - ${issue.title}`);

    const rules = this.config.automation_rules.issue_creation.rules;
    
    for (const rule of rules) {
      if (!rule.enabled && rule.enabled !== undefined) continue;
      
      try {
        await this.applyIssueCreationRule(issue, rule);
      } catch (error) {
        console.error(`Error applying rule ${rule.name}:`, error);
      }
    }
  }

  /**
   * Apply issue creation rule
   */
  async applyIssueCreationRule(issue, rule) {
    switch (rule.name) {
      case 'auto_assign_default_priority':
        if (issue.priority === 0) {
          await this.linear.updateIssue(issue.id, { priority: rule.value });
          console.log(`Set default priority ${rule.value} for ${issue.identifier}`);
        }
        break;
        
      case 'auto_assign_project_by_keywords':
        const projectId = this.findProjectByKeywords(issue.title + ' ' + issue.description, rule.keywords_mapping);
        if (projectId && !issue.project) {
          await this.linear.updateIssue(issue.id, { projectId });
          console.log(`Assigned to project for ${issue.identifier}`);
        }
        break;
        
      case 'auto_label_by_type':
        const typeLabel = this.findLabelByPattern(issue.title + ' ' + issue.description, rule.type_patterns);
        if (typeLabel) {
          const currentLabels = issue.labels?.nodes?.map(l => l.id) || [];
          if (!currentLabels.includes(typeLabel)) {
            await this.linear.updateIssue(issue.id, { 
              labelIds: [...currentLabels, typeLabel] 
            });
            console.log(`Added type label for ${issue.identifier}`);
          }
        }
        break;
    }
  }

  /**
   * Process issue assignment
   */
  async processIssueAssignment(issueId, assigneeId) {
    const issue = await this.linear.issue(issueId);
    if (!issue) return;

    console.log(`Processing assignment for: ${issue.identifier}`);

    const rules = this.config.automation_rules.state_transitions.rules;
    
    for (const rule of rules) {
      if (rule.name === 'auto_start_on_assignment' && rule.trigger === 'issue_assigned') {
        if (issue.state.id === rule.from_state) {
          await this.linear.updateIssue(issue.id, { stateId: rule.to_state });
          console.log(`Moved ${issue.identifier} to In Progress`);
        }
      }
    }
  }

  /**
   * Process PR link attachment
   */
  async processPRLink(issueId, linkUrl) {
    const issue = await this.linear.issue(issueId);
    if (!issue) return;

    console.log(`Processing PR link for: ${issue.identifier}`);

    const rules = this.config.automation_rules.state_transitions.rules;
    
    for (const rule of rules) {
      if (rule.name === 'auto_review_on_pr_link' && rule.trigger === 'link_attached') {
        if (linkUrl.includes('pull') || linkUrl.includes('merge')) {
          await this.linear.updateIssue(issue.id, { stateId: rule.to_state });
          console.log(`Moved ${issue.identifier} to In Review`);
        }
      }
    }
  }

  /**
   * Process priority escalation
   */
  async processPriorityEscalation(issueId) {
    const issue = await this.linear.issue(issueId);
    if (!issue) return;

    const content = (issue.title + ' ' + issue.description).toLowerCase();
    const rules = this.config.automation_rules.label_management.rules;
    
    for (const rule of rules) {
      if (rule.name === 'priority_escalation') {
        const urgentKeywords = rule.urgent_keywords;
        const highKeywords = rule.high_keywords;
        
        const hasUrgentKeywords = urgentKeywords.some(keyword => content.includes(keyword));
        const hasHighKeywords = highKeywords.some(keyword => content.includes(keyword));
        
        if (hasUrgentKeywords && issue.priority !== 1) {
          await this.linear.updateIssue(issue.id, { priority: 1 });
          console.log(`Escalated ${issue.identifier} to URGENT priority`);
        } else if (hasHighKeywords && issue.priority > 2) {
          await this.linear.updateIssue(issue.id, { priority: 2 });
          console.log(`Escalated ${issue.identifier} to HIGH priority`);
        }
      }
    }
  }

  /**
   * Find project by keywords
   */
  findProjectByKeywords(content, keywordsMapping) {
    const lowerContent = content.toLowerCase();
    
    for (const [keywords, projectId] of Object.entries(keywordsMapping)) {
      const keywordList = keywords.split('|');
      if (keywordList.some(keyword => lowerContent.includes(keyword))) {
        return projectId;
      }
    }
    
    return null;
  }

  /**
   * Find label by pattern
   */
  findLabelByPattern(content, patterns) {
    const lowerContent = content.toLowerCase();
    
    for (const [pattern, labelId] of Object.entries(patterns)) {
      const keywords = pattern.split('|');
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return labelId;
      }
    }
    
    return null;
  }

  /**
   * Run daily triage
   */
  async runDailyTriage() {
    console.log('Running daily triage...');
    
    // Get issues in "To Process" state
    const toProcessStateId = '01ef8bdd-474c-4d85-86e5-7cbedcc3b815';
    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } },
        state: { id: { eq: toProcessStateId } }
      }
    });

    console.log(`Found ${issues.nodes.length} issues to process`);

    for (const issue of issues.nodes) {
      await this.processNewIssue(issue.id);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Daily triage completed');
  }

  /**
   * Generate workflow metrics
   */
  async generateMetrics() {
    console.log('Generating workflow metrics...');
    
    const metrics = {
      timestamp: new Date().toISOString(),
      team_id: this.teamId,
      metrics: {}
    };

    // Issue processing time
    const toProcessIssues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } },
        state: { id: { eq: '01ef8bdd-474c-4d85-86e5-7cbedcc3b815' } }
      }
    });

    metrics.metrics.issues_to_process = toProcessIssues.nodes.length;

    // Label usage consistency
    const allIssues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } }
      }
    });

    const issuesWithoutLabels = allIssues.nodes.filter(issue => 
      !issue.labels || issue.labels.nodes.length === 0
    );

    metrics.metrics.labeling_accuracy = {
      total_issues: allIssues.nodes.length,
      issues_without_labels: issuesWithoutLabels.length,
      accuracy_percentage: ((allIssues.nodes.length - issuesWithoutLabels.length) / allIssues.nodes.length * 100).toFixed(2)
    };

    // Project distribution
    const projectDistribution = {};
    for (const issue of allIssues.nodes) {
      const projectName = issue.project?.name || 'No Project';
      projectDistribution[projectName] = (projectDistribution[projectName] || 0) + 1;
    }

    metrics.metrics.project_distribution = projectDistribution;

    // Priority distribution
    const priorityDistribution = {};
    for (const issue of allIssues.nodes) {
      const priority = this.getPriorityLabel(issue.priority);
      priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
    }

    metrics.metrics.priority_distribution = priorityDistribution;

    return metrics;
  }

  /**
   * Get priority label
   */
  getPriorityLabel(priority) {
    const priorityMap = {
      0: 'No priority',
      1: 'Urgent',
      2: 'High',
      3: 'Medium',
      4: 'Low'
    };
    return priorityMap[priority] || 'Unknown';
  }

  /**
   * Setup webhook handlers
   */
  setupWebhooks() {
    // This would be implemented with a webhook server
    // For now, we'll document the webhook endpoints needed
    
    const webhookEndpoints = {
      '/webhook/issue-created': 'Handle new issue creation',
      '/webhook/issue-updated': 'Handle issue updates',
      '/webhook/issue-assigned': 'Handle issue assignments',
      '/webhook/link-attached': 'Handle link attachments',
      '/webhook/pr-merged': 'Handle PR merge events'
    };

    console.log('Webhook endpoints needed:', webhookEndpoints);
    return webhookEndpoints;
  }
}

module.exports = LinearAutomationEngine;

// Example usage
if (require.main === module) {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    console.error('LINEAR_API_KEY environment variable is required');
    process.exit(1);
  }

  const engine = new LinearAutomationEngine(apiKey);
  
  engine.initialize()
    .then(() => {
      console.log('Automation engine ready');
      
      // Run daily triage
      return engine.runDailyTriage();
    })
    .then(() => {
      // Generate metrics
      return engine.generateMetrics();
    })
    .then(metrics => {
      console.log('Metrics:', JSON.stringify(metrics, null, 2));
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

