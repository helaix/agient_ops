#!/usr/bin/env node

/**
 * Linear Automation System - Main Entry Point
 * Phase 2.3: Workflow Optimization & Automation
 */

const LinearAutomationEngine = require('./workflows/automation-engine');
const TriageManager = require('./workflows/triage-manager');
const MetricsCollector = require('./monitoring/metrics-collector');
const TemplateManager = require('./templates/template-manager');

class LinearAutomationSystem {
  constructor() {
    this.apiKey = process.env.LINEAR_API_KEY;
    
    if (!this.apiKey) {
      console.error('❌ LINEAR_API_KEY environment variable is required');
      process.exit(1);
    }

    this.automationEngine = new LinearAutomationEngine(this.apiKey);
    this.triageManager = new TriageManager(this.apiKey);
    this.metricsCollector = new MetricsCollector(this.apiKey);
    this.templateManager = new TemplateManager();
  }

  /**
   * Initialize the automation system
   */
  async initialize() {
    console.log('🚀 Initializing Linear Automation System...');
    
    try {
      await this.automationEngine.initialize();
      await this.triageManager.initialize();
      
      console.log('✅ Linear Automation System initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize automation system:', error.message);
      return false;
    }
  }

  /**
   * Run daily automation tasks
   */
  async runDailyTasks() {
    console.log('📅 Running daily automation tasks...');
    
    const results = {
      timestamp: new Date().toISOString(),
      triage: null,
      metrics: null,
      errors: []
    };

    try {
      // Run daily triage
      console.log('🔍 Running daily triage...');
      results.triage = await this.triageManager.runDailyTriage();
      console.log(`✅ Triage completed: ${results.triage.processed_issues.length} issues processed`);
      
      // Collect metrics
      console.log('📊 Collecting workflow metrics...');
      results.metrics = await this.metricsCollector.collectAllMetrics();
      console.log(`✅ Metrics collected: Health score ${results.metrics.health_score}/100`);
      
      // Generate health report
      const healthReport = this.metricsCollector.generateHealthReport(results.metrics);
      console.log('📋 Health Report:');
      console.log(`   Status: ${healthReport.status} (${results.metrics.health_score}/100)`);
      
      if (healthReport.critical_issues.length > 0) {
        console.log('⚠️  Critical Issues:');
        healthReport.critical_issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (healthReport.recommendations.length > 0) {
        console.log('💡 Recommendations:');
        healthReport.recommendations.forEach(rec => console.log(`   - ${rec}`));
      }
      
    } catch (error) {
      console.error('❌ Error in daily tasks:', error.message);
      results.errors.push(error.message);
    }

    return results;
  }

  /**
   * Run weekly tasks
   */
  async runWeeklyTasks() {
    console.log('📅 Running weekly automation tasks...');
    
    try {
      const priorityReview = await this.triageManager.runWeeklyPriorityReview();
      console.log(`✅ Weekly review completed: ${priorityReview.reviewed_issues.length} issues reviewed`);
      
      if (priorityReview.priority_changes.length > 0) {
        console.log('🔄 Priority Changes Suggested:');
        priorityReview.priority_changes.forEach(change => {
          console.log(`   ${change.issue}: ${change.current_priority} → ${change.suggested_priority}`);
        });
      }
      
      if (priorityReview.blocked_issues.length > 0) {
        console.log('🚫 Blocked Issues Found:');
        priorityReview.blocked_issues.forEach(issue => {
          console.log(`   ${issue.issue}: ${issue.title}`);
        });
      }
      
      return priorityReview;
    } catch (error) {
      console.error('❌ Error in weekly tasks:', error.message);
      throw error;
    }
  }

  /**
   * Run monthly tasks
   */
  async runMonthlyTasks() {
    console.log('📅 Running monthly automation tasks...');
    
    try {
      const workflowReview = await this.triageManager.runMonthlyWorkflowReview();
      console.log(`✅ Monthly review completed: ${workflowReview.total_issues} issues analyzed`);
      
      console.log('📊 Project Distribution:');
      Object.entries(workflowReview.project_analysis.project_distribution).forEach(([project, count]) => {
        console.log(`   ${project}: ${count} issues`);
      });
      
      if (workflowReview.workflow_recommendations.length > 0) {
        console.log('💡 Workflow Recommendations:');
        workflowReview.workflow_recommendations.forEach(rec => console.log(`   - ${rec}`));
      }
      
      return workflowReview;
    } catch (error) {
      console.error('❌ Error in monthly tasks:', error.message);
      throw error;
    }
  }

  /**
   * Process a single issue
   */
  async processIssue(issueId) {
    console.log(`🔄 Processing issue: ${issueId}`);
    
    try {
      await this.automationEngine.processNewIssue(issueId);
      console.log(`✅ Issue ${issueId} processed successfully`);
    } catch (error) {
      console.error(`❌ Error processing issue ${issueId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    console.log('📊 Getting system status...');
    
    try {
      const metrics = await this.metricsCollector.collectAllMetrics();
      const healthReport = this.metricsCollector.generateHealthReport(metrics);
      
      return {
        timestamp: new Date().toISOString(),
        health_score: metrics.health_score,
        status: healthReport.status,
        workflow_metrics: metrics.workflow_metrics,
        quality_metrics: metrics.quality_metrics,
        critical_issues: healthReport.critical_issues,
        recommendations: healthReport.recommendations
      };
    } catch (error) {
      console.error('❌ Error getting system status:', error.message);
      throw error;
    }
  }

  /**
   * Show available templates
   */
  showTemplates() {
    console.log('📝 Available Issue Templates:');
    
    const templates = this.templateManager.getAvailableTemplates();
    templates.forEach(template => {
      console.log(`   ${template.id}: ${template.title}`);
      console.log(`      ${template.description}`);
    });
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🤖 Linear Automation System - Help

USAGE:
  node index.js [command] [options]

COMMANDS:
  daily           Run daily automation tasks (triage + metrics)
  weekly          Run weekly priority review
  monthly         Run monthly workflow review
  status          Show current system status
  templates       Show available issue templates
  process <id>    Process a specific issue by ID
  help            Show this help message

EXAMPLES:
  node index.js daily
  node index.js status
  node index.js process HLX-1234
  node index.js templates

ENVIRONMENT VARIABLES:
  LINEAR_API_KEY  Required: Your Linear API key

For more information, see the documentation in ./documentation/
    `);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const system = new LinearAutomationSystem();
  
  // Commands that don't require initialization
  if (command === 'help') {
    system.showHelp();
    return;
  }
  
  if (command === 'templates') {
    system.showTemplates();
    return;
  }
  
  // Initialize system for other commands
  const initialized = await system.initialize();
  if (!initialized) {
    process.exit(1);
  }
  
  try {
    switch (command) {
      case 'daily':
        await system.runDailyTasks();
        break;
        
      case 'weekly':
        await system.runWeeklyTasks();
        break;
        
      case 'monthly':
        await system.runMonthlyTasks();
        break;
        
      case 'status':
        const status = await system.getSystemStatus();
        console.log('📊 System Status:');
        console.log(`   Health Score: ${status.health_score}/100 (${status.status})`);
        console.log(`   Issues to Process: ${status.workflow_metrics.issue_processing_time.total_issues_to_process}`);
        console.log(`   Label Consistency: ${status.workflow_metrics.label_usage_consistency.labeling_percentage}%`);
        console.log(`   Completion Rate: ${status.quality_metrics.completion_rate_tracking.completion_rate_percentage}%`);
        break;
        
      case 'process':
        const issueId = args[1];
        if (!issueId) {
          console.error('❌ Issue ID required. Usage: node index.js process <issue-id>');
          process.exit(1);
        }
        await system.processIssue(issueId);
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        system.showHelp();
        process.exit(1);
    }
    
    console.log('✅ Command completed successfully');
    
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = LinearAutomationSystem;

// Run CLI if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

