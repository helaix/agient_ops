/**
 * Linear Issue Template Manager
 * Manages issue templates and validation
 */

const config = require('../automation-config.json');

class TemplateManager {
  constructor() {
    this.templates = config.issue_templates;
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return Object.keys(this.templates).map(key => ({
      id: key,
      title: this.templates[key].title,
      description: this.templates[key].description
    }));
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId) {
    return this.templates[templateId] || null;
  }

  /**
   * Apply template to issue
   */
  applyTemplate(templateId, customData = {}) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let content = template.template;

    // Replace placeholders with custom data
    for (const [key, value] of Object.entries(customData)) {
      const placeholder = `[${key}]`;
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }

    return {
      title: customData.title || `New ${template.title}`,
      description: content,
      requiredFields: template.required_fields
    };
  }

  /**
   * Validate issue against template requirements
   */
  validateIssue(issueData, templateId) {
    const template = this.getTemplate(templateId);
    if (!template) {
      return { valid: true, errors: [] };
    }

    const errors = [];
    const requiredFields = template.required_fields || [];

    for (const field of requiredFields) {
      if (!issueData[field] || issueData[field].trim() === '') {
        errors.push(`Required field missing: ${field}`);
      }
    }

    // Validate specific template requirements
    switch (templateId) {
      case 'feature_request':
        if (!this.hasAcceptanceCriteria(issueData.description)) {
          errors.push('Feature request must include acceptance criteria');
        }
        break;
        
      case 'bug_report':
        if (!this.hasReproductionSteps(issueData.description)) {
          errors.push('Bug report must include reproduction steps');
        }
        break;
        
      case 'epic':
        if (!this.hasSubIssues(issueData.description)) {
          errors.push('Epic must include breakdown into sub-issues');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if description has acceptance criteria
   */
  hasAcceptanceCriteria(description) {
    return description.includes('Acceptance Criteria') || 
           description.includes('acceptance criteria') ||
           description.includes('- [ ]');
  }

  /**
   * Check if description has reproduction steps
   */
  hasReproductionSteps(description) {
    return description.includes('Steps to Reproduce') ||
           description.includes('reproduction steps') ||
           description.includes('1.') ||
           description.includes('2.');
  }

  /**
   * Check if description has sub-issues
   */
  hasSubIssues(description) {
    return description.includes('Sub-Issues') ||
           description.includes('sub-issues') ||
           description.includes('breakdown');
  }

  /**
   * Generate template suggestions based on content
   */
  suggestTemplate(title, description) {
    const content = (title + ' ' + description).toLowerCase();
    
    // Bug indicators
    if (content.includes('bug') || content.includes('error') || 
        content.includes('broken') || content.includes('fix')) {
      return 'bug_report';
    }
    
    // Feature indicators
    if (content.includes('feature') || content.includes('implement') ||
        content.includes('add') || content.includes('create')) {
      return 'feature_request';
    }
    
    // Epic indicators
    if (content.includes('epic') || content.includes('large') ||
        content.includes('complex') || content.includes('phase')) {
      return 'epic';
    }
    
    // Documentation indicators
    if (content.includes('document') || content.includes('docs') ||
        content.includes('readme') || content.includes('guide')) {
      return 'documentation';
    }
    
    return 'feature_request'; // Default
  }

  /**
   * Create issue with template
   */
  async createIssueWithTemplate(linear, templateId, issueData) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate issue data
    const validation = this.validateIssue(issueData, templateId);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Apply template
    const templateData = this.applyTemplate(templateId, issueData);

    // Create issue
    const issue = await linear.createIssue({
      title: templateData.title,
      description: templateData.description,
      teamId: issueData.teamId,
      priority: issueData.priority || 3, // Default to medium
      labelIds: issueData.labelIds || [],
      assigneeId: issueData.assigneeId,
      projectId: issueData.projectId
    });

    return issue;
  }

  /**
   * Get template usage statistics
   */
  getTemplateStats(issues) {
    const stats = {
      total_issues: issues.length,
      template_usage: {},
      validation_scores: {}
    };

    for (const issue of issues) {
      const suggestedTemplate = this.suggestTemplate(issue.title, issue.description);
      
      if (!stats.template_usage[suggestedTemplate]) {
        stats.template_usage[suggestedTemplate] = 0;
      }
      stats.template_usage[suggestedTemplate]++;

      // Check validation score
      const validation = this.validateIssue({
        title: issue.title,
        description: issue.description
      }, suggestedTemplate);

      if (!stats.validation_scores[suggestedTemplate]) {
        stats.validation_scores[suggestedTemplate] = { valid: 0, invalid: 0 };
      }

      if (validation.valid) {
        stats.validation_scores[suggestedTemplate].valid++;
      } else {
        stats.validation_scores[suggestedTemplate].invalid++;
      }
    }

    return stats;
  }
}

module.exports = TemplateManager;

// Example usage
if (require.main === module) {
  const manager = new TemplateManager();
  
  console.log('Available templates:');
  console.log(manager.getAvailableTemplates());
  
  console.log('\nFeature request template:');
  const featureTemplate = manager.applyTemplate('feature_request', {
    title: 'Add user authentication',
    description: 'Implement OAuth login system'
  });
  console.log(featureTemplate);
  
  console.log('\nValidation example:');
  const validation = manager.validateIssue({
    title: 'Test issue',
    description: 'Test description with acceptance criteria:\n- [ ] Criterion 1',
    acceptance_criteria: 'Yes'
  }, 'feature_request');
  console.log(validation);
}

