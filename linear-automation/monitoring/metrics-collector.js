/**
 * Linear Metrics Collector
 * Collects and analyzes workflow metrics
 */

const { LinearClient } = require('@linear/sdk');
const config = require('../automation-config.json');

class MetricsCollector {
  constructor(apiKey) {
    this.linear = new LinearClient({ apiKey });
    this.config = config;
    this.teamId = config.team_id;
    this.thresholds = config.monitoring.thresholds;
  }

  /**
   * Collect all workflow metrics
   */
  async collectAllMetrics() {
    console.log('Collecting workflow metrics...');
    
    const metrics = {
      timestamp: new Date().toISOString(),
      team_id: this.teamId,
      workflow_metrics: await this.collectWorkflowMetrics(),
      quality_metrics: await this.collectQualityMetrics(),
      performance_metrics: await this.collectPerformanceMetrics(),
      health_score: 0
    };

    // Calculate overall health score
    metrics.health_score = this.calculateHealthScore(metrics);

    return metrics;
  }

  /**
   * Collect workflow metrics
   */
  async collectWorkflowMetrics() {
    const metrics = {};

    // Issue processing time
    metrics.issue_processing_time = await this.calculateProcessingTime();
    
    // Label usage consistency
    metrics.label_usage_consistency = await this.calculateLabelConsistency();
    
    // Project distribution balance
    metrics.project_distribution_balance = await this.calculateProjectDistribution();
    
    // Priority accuracy tracking
    metrics.priority_accuracy_tracking = await this.calculatePriorityAccuracy();

    return metrics;
  }

  /**
   * Collect quality metrics
   */
  async collectQualityMetrics() {
    const metrics = {};

    // Issues without required labels
    metrics.issues_without_required_labels = await this.findIssuesWithoutLabels();
    
    // Stale issues identification
    metrics.stale_issues_identification = await this.findStaleIssues();
    
    // Duplicate detection
    metrics.duplicate_detection = await this.detectDuplicates();
    
    // Completion rate tracking
    metrics.completion_rate_tracking = await this.calculateCompletionRate();

    return metrics;
  }

  /**
   * Collect performance metrics
   */
  async collectPerformanceMetrics() {
    const metrics = {};

    // State transition times
    metrics.state_transition_times = await this.calculateStateTransitionTimes();
    
    // Automation rule effectiveness
    metrics.automation_effectiveness = await this.calculateAutomationEffectiveness();
    
    // Team productivity
    metrics.team_productivity = await this.calculateTeamProductivity();

    return metrics;
  }

  /**
   * Calculate issue processing time
   */
  async calculateProcessingTime() {
    const toProcessStateId = '01ef8bdd-474c-4d85-86e5-7cbedcc3b815';
    
    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } },
        state: { id: { eq: toProcessStateId } }
      }
    });

    const now = new Date();
    const processingTimes = [];

    for (const issue of issues.nodes) {
      const createdAt = new Date(issue.createdAt);
      const hoursInQueue = (now - createdAt) / (1000 * 60 * 60);
      processingTimes.push(hoursInQueue);
    }

    return {
      total_issues_to_process: issues.nodes.length,
      average_time_in_queue_hours: processingTimes.length > 0 
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
        : 0,
      max_time_in_queue_hours: processingTimes.length > 0 ? Math.max(...processingTimes) : 0,
      issues_over_24h: processingTimes.filter(time => time > 24).length,
      meets_threshold: processingTimes.filter(time => time > 24).length === 0
    };
  }

  /**
   * Calculate label consistency
   */
  async calculateLabelConsistency() {
    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } }
      }
    });

    const totalIssues = issues.nodes.length;
    const issuesWithLabels = issues.nodes.filter(issue => 
      issue.labels && issue.labels.nodes.length > 0
    ).length;

    const issuesWithTypeLabels = issues.nodes.filter(issue => {
      if (!issue.labels) return false;
      const labelNames = issue.labels.nodes.map(l => l.name.toLowerCase());
      return labelNames.some(name => 
        ['bug', 'feature', 'improvement', 'documentation', 'epic'].includes(name)
      );
    }).length;

    const issuesWithPriorityLabels = issues.nodes.filter(issue => 
      issue.priority > 0
    ).length;

    return {
      total_issues: totalIssues,
      issues_with_labels: issuesWithLabels,
      issues_with_type_labels: issuesWithTypeLabels,
      issues_with_priority: issuesWithPriorityLabels,
      labeling_percentage: totalIssues > 0 ? (issuesWithLabels / totalIssues * 100).toFixed(2) : 0,
      type_labeling_percentage: totalIssues > 0 ? (issuesWithTypeLabels / totalIssues * 100).toFixed(2) : 0,
      priority_assignment_percentage: totalIssues > 0 ? (issuesWithPriorityLabels / totalIssues * 100).toFixed(2) : 0,
      meets_threshold: (issuesWithLabels / totalIssues) >= 0.9
    };
  }

  /**
   * Calculate project distribution
   */
  async calculateProjectDistribution() {
    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } }
      }
    });

    const projectDistribution = {};
    const totalIssues = issues.nodes.length;

    for (const issue of issues.nodes) {
      const projectName = issue.project?.name || 'No Project';
      projectDistribution[projectName] = (projectDistribution[projectName] || 0) + 1;
    }

    // Calculate balance score (lower is better, 0 = perfectly balanced)
    const projectCounts = Object.values(projectDistribution);
    const averageCount = totalIssues / Object.keys(projectDistribution).length;
    const variance = projectCounts.reduce((sum, count) => 
      sum + Math.pow(count - averageCount, 2), 0) / projectCounts.length;
    const balanceScore = Math.sqrt(variance) / averageCount;

    return {
      total_issues: totalIssues,
      project_distribution: projectDistribution,
      number_of_projects: Object.keys(projectDistribution).length,
      issues_without_project: projectDistribution['No Project'] || 0,
      balance_score: balanceScore.toFixed(2),
      is_balanced: balanceScore < 0.5 // Threshold for "balanced"
    };
  }

  /**
   * Calculate priority accuracy
   */
  async calculatePriorityAccuracy() {
    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } }
      }
    });

    const priorityDistribution = {
      0: 0, // No priority
      1: 0, // Urgent
      2: 0, // High
      3: 0, // Medium
      4: 0  // Low
    };

    for (const issue of issues.nodes) {
      priorityDistribution[issue.priority]++;
    }

    const totalIssues = issues.nodes.length;
    const issuesWithPriority = totalIssues - priorityDistribution[0];

    // Check for priority distribution health
    const urgentPercentage = (priorityDistribution[1] / totalIssues) * 100;
    const highPercentage = (priorityDistribution[2] / totalIssues) * 100;
    
    return {
      total_issues: totalIssues,
      priority_distribution: priorityDistribution,
      issues_with_priority: issuesWithPriority,
      priority_assignment_rate: totalIssues > 0 ? (issuesWithPriority / totalIssues * 100).toFixed(2) : 0,
      urgent_percentage: urgentPercentage.toFixed(2),
      high_percentage: highPercentage.toFixed(2),
      healthy_distribution: urgentPercentage < 10 && highPercentage < 30 // Healthy thresholds
    };
  }

  /**
   * Find issues without required labels
   */
  async findIssuesWithoutLabels() {
    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } }
      }
    });

    const issuesWithoutLabels = issues.nodes.filter(issue => 
      !issue.labels || issue.labels.nodes.length === 0
    );

    const issuesWithoutTypeLabels = issues.nodes.filter(issue => {
      if (!issue.labels) return true;
      const labelNames = issue.labels.nodes.map(l => l.name.toLowerCase());
      return !labelNames.some(name => 
        ['bug', 'feature', 'improvement', 'documentation', 'epic'].includes(name)
      );
    });

    return {
      total_issues: issues.nodes.length,
      issues_without_any_labels: issuesWithoutLabels.length,
      issues_without_type_labels: issuesWithoutTypeLabels.length,
      unlabeled_issues: issuesWithoutLabels.map(issue => ({
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        created_at: issue.createdAt
      }))
    };
  }

  /**
   * Find stale issues
   */
  async findStaleIssues() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } },
        updatedAt: { lt: thirtyDaysAgo }
      }
    });

    const staleIssues = issues.nodes.filter(issue => 
      issue.state.type !== 'completed' && issue.state.type !== 'canceled'
    );

    return {
      total_stale_issues: staleIssues.length,
      threshold_days: 30,
      stale_issues: staleIssues.map(issue => ({
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        state: issue.state.name,
        last_updated: issue.updatedAt,
        days_stale: Math.floor((new Date() - new Date(issue.updatedAt)) / (1000 * 60 * 60 * 24))
      }))
    };
  }

  /**
   * Detect potential duplicates
   */
  async detectDuplicates() {
    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } }
      }
    });

    const potentialDuplicates = [];
    const titleMap = new Map();

    for (const issue of issues.nodes) {
      const normalizedTitle = issue.title.toLowerCase().trim();
      
      if (titleMap.has(normalizedTitle)) {
        potentialDuplicates.push({
          title: normalizedTitle,
          issues: [titleMap.get(normalizedTitle), {
            id: issue.id,
            identifier: issue.identifier,
            title: issue.title,
            state: issue.state.name
          }]
        });
      } else {
        titleMap.set(normalizedTitle, {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          state: issue.state.name
        });
      }
    }

    return {
      total_potential_duplicates: potentialDuplicates.length,
      duplicate_groups: potentialDuplicates
    };
  }

  /**
   * Calculate completion rate
   */
  async calculateCompletionRate() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } },
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const totalIssues = issues.nodes.length;
    const completedIssues = issues.nodes.filter(issue => 
      issue.state.type === 'completed'
    ).length;

    const completionRate = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0;

    return {
      period_days: 30,
      total_issues_created: totalIssues,
      completed_issues: completedIssues,
      completion_rate_percentage: completionRate.toFixed(2),
      meets_threshold: completionRate >= 80
    };
  }

  /**
   * Calculate state transition times
   */
  async calculateStateTransitionTimes() {
    // This would require issue history/activity data
    // For now, return placeholder data
    return {
      average_time_to_start_hours: 0,
      average_time_in_progress_hours: 0,
      average_time_in_review_hours: 0,
      average_total_cycle_time_hours: 0
    };
  }

  /**
   * Calculate automation effectiveness
   */
  async calculateAutomationEffectiveness() {
    const issues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } }
      }
    });

    // Estimate automation effectiveness based on labeling and priority assignment
    const totalIssues = issues.nodes.length;
    const autoLabeledIssues = issues.nodes.filter(issue => 
      issue.labels && issue.labels.nodes.length > 0
    ).length;
    
    const autoPriorityIssues = issues.nodes.filter(issue => 
      issue.priority > 0
    ).length;

    return {
      total_issues: totalIssues,
      estimated_auto_labeled: autoLabeledIssues,
      estimated_auto_prioritized: autoPriorityIssues,
      labeling_automation_rate: totalIssues > 0 ? (autoLabeledIssues / totalIssues * 100).toFixed(2) : 0,
      priority_automation_rate: totalIssues > 0 ? (autoPriorityIssues / totalIssues * 100).toFixed(2) : 0
    };
  }

  /**
   * Calculate team productivity
   */
  async calculateTeamProductivity() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentIssues = await this.linear.issues({
      filter: {
        team: { id: { eq: this.teamId } },
        updatedAt: { gte: sevenDaysAgo }
      }
    });

    const completedThisWeek = recentIssues.nodes.filter(issue => 
      issue.state.type === 'completed'
    ).length;

    const createdThisWeek = recentIssues.nodes.filter(issue => 
      new Date(issue.createdAt) >= sevenDaysAgo
    ).length;

    return {
      period_days: 7,
      issues_completed: completedThisWeek,
      issues_created: createdThisWeek,
      net_progress: completedThisWeek - createdThisWeek,
      completion_velocity: (completedThisWeek / 7).toFixed(2) // issues per day
    };
  }

  /**
   * Calculate overall health score
   */
  calculateHealthScore(metrics) {
    let score = 100;
    
    // Deduct points for issues
    if (!metrics.workflow_metrics.issue_processing_time.meets_threshold) {
      score -= 20;
    }
    
    if (!metrics.workflow_metrics.label_usage_consistency.meets_threshold) {
      score -= 15;
    }
    
    if (!metrics.workflow_metrics.project_distribution_balance.is_balanced) {
      score -= 10;
    }
    
    if (!metrics.workflow_metrics.priority_accuracy_tracking.healthy_distribution) {
      score -= 10;
    }
    
    if (!metrics.quality_metrics.completion_rate_tracking.meets_threshold) {
      score -= 15;
    }
    
    // Deduct for stale issues
    const staleIssues = metrics.quality_metrics.stale_issues_identification.total_stale_issues;
    if (staleIssues > 10) {
      score -= Math.min(20, staleIssues * 2);
    }
    
    // Deduct for unlabeled issues
    const unlabeledPercentage = (metrics.quality_metrics.issues_without_required_labels.issues_without_any_labels / 
                                metrics.quality_metrics.issues_without_required_labels.total_issues) * 100;
    if (unlabeledPercentage > 10) {
      score -= Math.min(10, unlabeledPercentage);
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Generate health report
   */
  generateHealthReport(metrics) {
    const report = {
      overall_health_score: metrics.health_score,
      status: this.getHealthStatus(metrics.health_score),
      recommendations: [],
      critical_issues: [],
      improvements: []
    };

    // Add recommendations based on metrics
    if (!metrics.workflow_metrics.issue_processing_time.meets_threshold) {
      report.critical_issues.push('Issues staying in "To Process" queue longer than 24 hours');
      report.recommendations.push('Implement daily triage automation');
    }

    if (!metrics.workflow_metrics.label_usage_consistency.meets_threshold) {
      report.critical_issues.push('Low label usage consistency');
      report.recommendations.push('Enable automatic label assignment rules');
    }

    const staleCount = metrics.quality_metrics.stale_issues_identification.total_stale_issues;
    if (staleCount > 5) {
      report.critical_issues.push(`${staleCount} stale issues (>30 days without updates)`);
      report.recommendations.push('Review and close or update stale issues');
    }

    if (metrics.health_score >= 90) {
      report.improvements.push('Excellent workflow health - maintain current practices');
    } else if (metrics.health_score >= 70) {
      report.improvements.push('Good workflow health - address minor issues');
    } else {
      report.improvements.push('Workflow needs attention - implement recommended fixes');
    }

    return report;
  }

  /**
   * Get health status
   */
  getHealthStatus(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  }
}

module.exports = MetricsCollector;

// Example usage
if (require.main === module) {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    console.error('LINEAR_API_KEY environment variable is required');
    process.exit(1);
  }

  const collector = new MetricsCollector(apiKey);
  
  collector.collectAllMetrics()
    .then(metrics => {
      console.log('Workflow Metrics:', JSON.stringify(metrics, null, 2));
      
      const report = collector.generateHealthReport(metrics);
      console.log('\nHealth Report:', JSON.stringify(report, null, 2));
    })
    .catch(error => {
      console.error('Error collecting metrics:', error);
      process.exit(1);
    });
}

