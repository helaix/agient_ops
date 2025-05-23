/**
 * Linear Triage Manager
 * Implements automated and manual triage processes
 */

const { LinearClient } = require('@linear/sdk');
const config = require('../automation-config.json');
const TemplateManager = require('../templates/template-manager');

class TriageManager {
  constructor(apiKey) {
    this.linear = new LinearClient({ apiKey });
    this.config = config;
    this.teamId = config.team_id;
    this.templateManager = new TemplateManager();
    this.triageConfig = config.triage_process;
  }

  /**
   * Initialize triage manager
   */
  async initialize() {
    console.log('Initializing Triage Manager...');
    
    // Load team metadata
    await this.loadTeamMetadata();
    
    console.log('Triage Manager initialized successfully');
  }

  /**
   * Load team metadata
   */
  async loadTeamMetadata() {
    const team = await this.linear.team(this.teamId);
    
    // Load states
    this.states = {};
    const states = await team.states();
    for (const state of states.nodes) {
      this.states[state.id] = state;
      this.states[state.name.toLowerCase().replace(/\s+/g, '_')] = state;
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

    // Load assignees
    this.assignees = {};
    const users = await this.linear.users();
    for (const user of users.nodes) {
      this.assignees[user.id] = user;
      this.assignees[user.email?.toLowerCase()] = user;
    }
  }

  /**
   * Run daily triage
   */
  async runDailyTriage() {
    console.log('Starting daily triage process...');
    
    const triageResults = {
      timestamp: new Date().toISOString(),
      processed_issues: [],
      actions_taken: [],
      errors: []
    };

    try {
      // Get issues in "To Process" state
      const toProcessState = this.states['to_process'];
      if (!toProcessState) {
        throw new Error('To Process state not found');
      }

      const issues = await this.linear.issues({
        filter: {
          team: { id: { eq: this.teamId } },
          state: { id: { eq: toProcessState.id } }
        }
      });

      console.log(`Found ${issues.nodes.length} issues to process`);

      for (const issue of issues.nodes) {
        try {
          const actions = await this.triageIssue(issue);
          triageResults.processed_issues.push(issue.identifier);
          triageResults.actions_taken.push(...actions);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error triaging issue ${issue.identifier}:`, error);
          triageResults.errors.push({
            issue: issue.identifier,
            error: error.message
          });
        }
      }

      console.log(`Daily triage completed. Processed ${triageResults.processed_issues.length} issues`);
      
    } catch (error) {
      console.error('Error in daily triage:', error);
      triageResults.errors.push({
        general: error.message
      });
    }

    return triageResults;
  }

  /**
   * Triage a single issue
   */
  async triageIssue(issue) {
    const actions = [];
    
    console.log(`Triaging issue: ${issue.identifier} - ${issue.title}`);

    // 1. Assign priority if missing
    if (issue.priority === 0) {
      const priority = this.determinePriority(issue);
      if (priority > 0) {
        await this.linear.updateIssue(issue.id, { priority });
        actions.push(`Set priority to ${this.getPriorityLabel(priority)} for ${issue.identifier}`);
      }
    }

    // 2. Add type labels if missing
    const typeLabel = this.determineTypeLabel(issue);
    if (typeLabel) {
      const currentLabels = issue.labels?.nodes?.map(l => l.id) || [];
      const hasTypeLabel = currentLabels.some(labelId => {
        const label = this.labels[labelId];
        return label && ['bug', 'feature', 'improvement', 'documentation', 'epic'].includes(label.name.toLowerCase());
      });

      if (!hasTypeLabel) {
        await this.linear.updateIssue(issue.id, { 
          labelIds: [...currentLabels, typeLabel] 
        });
        actions.push(`Added type label for ${issue.identifier}`);
      }
    }

    // 3. Assign to project if missing
    if (!issue.project) {
      const projectId = this.determineProject(issue);
      if (projectId) {
        await this.linear.updateIssue(issue.id, { projectId });
        actions.push(`Assigned to project for ${issue.identifier}`);
      }
    }

    // 4. Add component labels
    const componentLabels = this.determineComponentLabels(issue);
    if (componentLabels.length > 0) {
      const currentLabels = issue.labels?.nodes?.map(l => l.id) || [];
      const newLabels = [...new Set([...currentLabels, ...componentLabels])];
      
      if (newLabels.length > currentLabels.length) {
        await this.linear.updateIssue(issue.id, { labelIds: newLabels });
        actions.push(`Added component labels for ${issue.identifier}`);
      }
    }

    // 5. Validate issue quality
    const qualityIssues = this.validateIssueQuality(issue);
    if (qualityIssues.length > 0) {
      const comment = this.generateQualityComment(qualityIssues);
      await this.linear.createComment({
        issueId: issue.id,
        body: comment
      });
      actions.push(`Added quality improvement comment for ${issue.identifier}`);
    }

    // 6. Move to appropriate state
    const targetState = this.determineTargetState(issue);
    if (targetState && targetState.id !== issue.state.id) {
      await this.linear.updateIssue(issue.id, { stateId: targetState.id });
      actions.push(`Moved ${issue.identifier} to ${targetState.name}`);
    }

    return actions;
  }

  /**
   * Determine priority based on content
   */
  determinePriority(issue) {
    const content = (issue.title + ' ' + (issue.description || '')).toLowerCase();
    
    // Urgent keywords
    const urgentKeywords = ['urgent', 'critical', 'blocking', 'emergency', 'asap', 'production down'];
    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      return 1; // Urgent
    }
    
    // High priority keywords
    const highKeywords = ['important', 'high-impact', 'priority', 'needed soon', 'customer facing'];
    if (highKeywords.some(keyword => content.includes(keyword))) {
      return 2; // High
    }
    
    // Default to medium
    return 3; // Medium
  }

  /**
   * Determine type label
   */
  determineTypeLabel(issue) {
    const content = (issue.title + ' ' + (issue.description || '')).toLowerCase();
    
    // Bug patterns
    if (content.match(/\b(bug|error|fix|broken|crash|fail|issue|problem)\b/)) {
      return this.labels['bug']?.id;
    }
    
    // Feature patterns
    if (content.match(/\b(feature|implement|add|create|new|build)\b/)) {
      return this.labels['feature']?.id;
    }
    
    // Improvement patterns
    if (content.match(/\b(improve|optimize|enhance|refactor|update|upgrade)\b/)) {
      return this.labels['improvement']?.id;
    }
    
    // Documentation patterns
    if (content.match(/\b(document|docs|readme|guide|manual|wiki)\b/)) {
      return this.labels['documentation']?.id;
    }
    
    // Epic patterns
    if (content.match(/\b(epic|large|complex|phase|initiative|project)\b/)) {
      return this.labels['epic']?.id;
    }
    
    // Default to feature
    return this.labels['feature']?.id;
  }

  /**
   * Determine project assignment
   */
  determineProject(issue) {
    const content = (issue.title + ' ' + (issue.description || '')).toLowerCase();
    
    // Project keyword mapping from config
    const keywordsMapping = this.config.automation_rules.issue_creation.rules
      .find(rule => rule.name === 'auto_assign_project_by_keywords')?.keywords_mapping || {};
    
    for (const [keywords, projectId] of Object.entries(keywordsMapping)) {
      const keywordList = keywords.split('|');
      if (keywordList.some(keyword => content.includes(keyword))) {
        return projectId;
      }
    }
    
    return null;
  }

  /**
   * Determine component labels
   */
  determineComponentLabels(issue) {
    const content = (issue.title + ' ' + (issue.description || '')).toLowerCase();
    const componentLabels = [];
    
    // Component patterns
    const componentPatterns = {
      'frontend': /\b(frontend|ui|react|vue|angular|css|html|javascript|typescript)\b/,
      'backend': /\b(backend|api|server|database|sql|nosql|node|python|java)\b/,
      'infrastructure': /\b(infrastructure|deploy|ci\/cd|docker|kubernetes|aws|cloud)\b/,
      'mobile': /\b(mobile|ios|android|react-native|flutter|app)\b/,
      'design': /\b(design|ux|ui\/ux|figma|sketch|wireframe)\b/
    };
    
    for (const [component, pattern] of Object.entries(componentPatterns)) {
      if (pattern.test(content)) {
        const labelId = this.findLabelByName(component);
        if (labelId) {
          componentLabels.push(labelId);
        }
      }
    }
    
    return componentLabels;
  }

  /**
   * Find label by name
   */
  findLabelByName(name) {
    const label = Object.values(this.labels).find(l => 
      l.name && l.name.toLowerCase().includes(name.toLowerCase())
    );
    return label?.id;
  }

  /**
   * Validate issue quality
   */
  validateIssueQuality(issue) {
    const issues = [];
    
    // Check for empty or very short description
    if (!issue.description || issue.description.trim().length < 20) {
      issues.push('Description is too short or missing');
    }
    
    // Check for acceptance criteria in features
    if (issue.title.toLowerCase().includes('feature') || 
        issue.title.toLowerCase().includes('implement')) {
      if (!issue.description?.includes('acceptance criteria') && 
          !issue.description?.includes('- [ ]')) {
        issues.push('Feature requests should include acceptance criteria');
      }
    }
    
    // Check for reproduction steps in bugs
    if (issue.title.toLowerCase().includes('bug') || 
        issue.title.toLowerCase().includes('error') ||
        issue.title.toLowerCase().includes('fix')) {
      if (!issue.description?.includes('steps to reproduce') &&
          !issue.description?.includes('reproduction steps')) {
        issues.push('Bug reports should include reproduction steps');
      }
    }
    
    return issues;
  }

  /**
   * Generate quality improvement comment
   */
  generateQualityComment(qualityIssues) {
    let comment = '## Issue Quality Improvement Needed\n\n';
    comment += 'This issue could be improved by addressing the following:\n\n';
    
    for (const issue of qualityIssues) {
      comment += `- ${issue}\n`;
    }
    
    comment += '\n### Templates Available\n\n';
    comment += 'Consider using one of our issue templates:\n';
    
    const templates = this.templateManager.getAvailableTemplates();
    for (const template of templates) {
      comment += `- **${template.title}**: ${template.description}\n`;
    }
    
    comment += '\nPlease update this issue with the missing information to help with prioritization and implementation.';
    
    return comment;
  }

  /**
   * Determine target state
   */
  determineTargetState(issue) {
    // If issue has assignee, move to Todo or In Progress
    if (issue.assignee) {
      return this.states['todo'] || this.states['in_progress'];
    }
    
    // If issue has all required information, move to Backlog
    const qualityIssues = this.validateIssueQuality(issue);
    if (qualityIssues.length === 0 && issue.priority > 0) {
      return this.states['backlog'];
    }
    
    // Otherwise, keep in To Process
    return null;
  }

  /**
   * Run weekly priority review
   */
  async runWeeklyPriorityReview() {
    console.log('Starting weekly priority review...');
    
    const reviewResults = {
      timestamp: new Date().toISOString(),
      reviewed_issues: [],
      priority_changes: [],
      blocked_issues: [],
      recommendations: []
    };

    // Get all active issues
    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } },
        state: { type: { neq: 'completed' } }
      }
    });

    for (const issue of issues.nodes) {
      // Check if priority needs adjustment
      const suggestedPriority = this.determinePriority(issue);
      if (suggestedPriority !== issue.priority && suggestedPriority > 0) {
        reviewResults.priority_changes.push({
          issue: issue.identifier,
          current_priority: this.getPriorityLabel(issue.priority),
          suggested_priority: this.getPriorityLabel(suggestedPriority),
          reason: 'Content analysis suggests different priority'
        });
      }

      // Check for blocked issues
      if (this.isIssueBlocked(issue)) {
        reviewResults.blocked_issues.push({
          issue: issue.identifier,
          title: issue.title,
          state: issue.state.name,
          last_updated: issue.updatedAt
        });
      }

      reviewResults.reviewed_issues.push(issue.identifier);
    }

    // Generate recommendations
    if (reviewResults.priority_changes.length > 0) {
      reviewResults.recommendations.push('Review and update issue priorities based on content analysis');
    }
    
    if (reviewResults.blocked_issues.length > 0) {
      reviewResults.recommendations.push('Address blocked issues to improve workflow');
    }

    console.log(`Weekly review completed. Reviewed ${reviewResults.reviewed_issues.length} issues`);
    
    return reviewResults;
  }

  /**
   * Check if issue is blocked
   */
  isIssueBlocked(issue) {
    const content = (issue.title + ' ' + (issue.description || '')).toLowerCase();
    const blockingKeywords = ['blocked', 'waiting', 'dependency', 'depends on', 'blocked by'];
    
    return blockingKeywords.some(keyword => content.includes(keyword)) ||
           (issue.labels?.nodes?.some(label => 
             label.name.toLowerCase().includes('blocked')
           ));
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
   * Run monthly workflow review
   */
  async runMonthlyWorkflowReview() {
    console.log('Starting monthly workflow review...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } },
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const review = {
      timestamp: new Date().toISOString(),
      period: '30 days',
      total_issues: issues.nodes.length,
      project_analysis: this.analyzeProjectDistribution(issues.nodes),
      label_analysis: this.analyzeLabelUsage(issues.nodes),
      workflow_recommendations: []
    };

    // Generate recommendations
    if (review.project_analysis.unassigned_percentage > 20) {
      review.workflow_recommendations.push('High percentage of unassigned issues - improve project assignment automation');
    }

    if (review.label_analysis.unlabeled_percentage > 10) {
      review.workflow_recommendations.push('Improve automatic labeling rules');
    }

    console.log('Monthly workflow review completed');
    
    return review;
  }

  /**
   * Analyze project distribution
   */
  analyzeProjectDistribution(issues) {
    const projectCounts = {};
    let unassigned = 0;

    for (const issue of issues) {
      if (issue.project) {
        const projectName = issue.project.name;
        projectCounts[projectName] = (projectCounts[projectName] || 0) + 1;
      } else {
        unassigned++;
      }
    }

    return {
      total_issues: issues.length,
      project_distribution: projectCounts,
      unassigned_issues: unassigned,
      unassigned_percentage: issues.length > 0 ? (unassigned / issues.length * 100).toFixed(2) : 0
    };
  }

  /**
   * Analyze label usage
   */
  analyzeLabelUsage(issues) {
    const labelCounts = {};
    let unlabeled = 0;

    for (const issue of issues) {
      if (issue.labels && issue.labels.nodes.length > 0) {
        for (const label of issue.labels.nodes) {
          labelCounts[label.name] = (labelCounts[label.name] || 0) + 1;
        }
      } else {
        unlabeled++;
      }
    }

    return {
      total_issues: issues.length,
      label_distribution: labelCounts,
      unlabeled_issues: unlabeled,
      unlabeled_percentage: issues.length > 0 ? (unlabeled / issues.length * 100).toFixed(2) : 0
    };
  }
}

module.exports = TriageManager;

// Example usage
if (require.main === module) {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    console.error('LINEAR_API_KEY environment variable is required');
    process.exit(1);
  }

  const manager = new TriageManager(apiKey);
  
  manager.initialize()
    .then(() => {
      console.log('Running daily triage...');
      return manager.runDailyTriage();
    })
    .then(results => {
      console.log('Triage Results:', JSON.stringify(results, null, 2));
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

