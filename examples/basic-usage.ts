/**
 * Basic usage examples for the Multi-Agent Workflow System
 * 
 * This file demonstrates how to initialize and use the different agent types
 * in various workflow scenarios.
 */

import {
  LinearStateAgent,
  IntegrationDashboardAgent,
  ReviewManagerAgent,
  ContextOptimizerAgent,
  PatternBridgeAgent,
  AgentTask
} from '../src/agents';

// Environment configuration
const config = {
  LINEAR_API_KEY: process.env.LINEAR_API_KEY || 'your-linear-api-key',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'your-github-token',
  SLACK_TOKEN: process.env.SLACK_TOKEN || 'your-slack-token'
};

/**
 * Example 1: Setting up a complete multi-agent workflow system
 */
async function setupMultiAgentSystem() {
  console.log('🚀 Initializing Multi-Agent Workflow System...');

  // Initialize all agents
  const linearAgent = new LinearStateAgent(config.LINEAR_API_KEY);
  const dashboardAgent = new IntegrationDashboardAgent();
  const reviewAgent = new ReviewManagerAgent(config.GITHUB_TOKEN);
  const contextAgent = new ContextOptimizerAgent();
  const patternAgent = new PatternBridgeAgent();

  // Initialize all agents
  await Promise.all([
    linearAgent.initialize(),
    dashboardAgent.initialize(),
    reviewAgent.initialize(),
    contextAgent.initialize(),
    patternAgent.initialize()
  ]);

  console.log('✅ All agents initialized successfully');

  return {
    linearAgent,
    dashboardAgent,
    reviewAgent,
    contextAgent,
    patternAgent
  };
}

/**
 * Example 2: Code Review Workflow
 */
async function codeReviewWorkflow() {
  console.log('📝 Starting Code Review Workflow...');

  const { reviewAgent, linearAgent, patternAgent } = await setupMultiAgentSystem();

  // 1. Get pattern recommendations for code review
  const patternRecommendations = await patternAgent.executeTask({
    id: 'pattern-rec-1',
    type: 'recommend_patterns',
    priority: 1,
    payload: {
      workflowContext: {
        domain: 'code_review',
        urgency: 'high',
        teamSize: 5
      },
      requirements: {
        minEffectiveness: 0.8
      }
    },
    createdAt: new Date()
  });

  console.log('🎯 Pattern recommendations:', patternRecommendations.data);

  // 2. Assign reviewers to PR
  const reviewAssignment = await reviewAgent.executeTask({
    id: 'review-assign-1',
    type: 'assign_reviewers',
    priority: 1,
    payload: {
      prId: 123,
      requiredReviewers: 2,
      urgency: 'high'
    },
    createdAt: new Date()
  });

  console.log('👥 Reviewers assigned:', reviewAssignment.data);

  // 3. Update Linear issue status
  const linearUpdate = await linearAgent.executeTask({
    id: 'linear-update-1',
    type: 'sync_issue_status',
    priority: 1,
    payload: {
      issueId: 'ISSUE-123',
      newStatus: 'In Review'
    },
    createdAt: new Date()
  });

  console.log('📋 Linear status updated:', linearUpdate.data);

  return {
    patternRecommendations: patternRecommendations.data,
    reviewAssignment: reviewAssignment.data,
    linearUpdate: linearUpdate.data
  };
}

/**
 * Example 3: Productivity Optimization Workflow
 */
async function productivityOptimizationWorkflow() {
  console.log('⚡ Starting Productivity Optimization Workflow...');

  const { contextAgent, patternAgent, dashboardAgent } = await setupMultiAgentSystem();

  // 1. Analyze current productivity patterns
  const productivityAnalysis = await contextAgent.executeTask({
    id: 'productivity-1',
    type: 'analyze_productivity_patterns',
    priority: 1,
    payload: {
      userId: 'user-123',
      analysisDepth: 'week'
    },
    createdAt: new Date()
  });

  console.log('📊 Productivity analysis:', productivityAnalysis.data);

  // 2. Generate time-blocking recommendations
  const timeBlockingRecs = await contextAgent.executeTask({
    id: 'time-blocking-1',
    type: 'generate_time_blocking_recommendations',
    priority: 1,
    payload: {
      userId: 'user-123',
      preferences: {
        minBlockDuration: 45,
        maxBlockDuration: 120,
        preferredStartTime: 9
      }
    },
    createdAt: new Date()
  });

  console.log('⏰ Time-blocking recommendations:', timeBlockingRecs.data);

  // 3. Apply productivity patterns
  if (timeBlockingRecs.data.recommendations.length > 0) {
    const patternApplication = await patternAgent.executeTask({
      id: 'pattern-apply-1',
      type: 'apply_pattern',
      priority: 1,
      payload: {
        patternId: 'context-time-blocking',
        workflowId: 'productivity-wf-1',
        context: {
          userId: 'user-123',
          currentProductivity: productivityAnalysis.data
        },
        customizations: {
          minBlockDuration: 45
        }
      },
      createdAt: new Date()
    });

    console.log('🎯 Pattern applied:', patternApplication.data);
  }

  return {
    productivityAnalysis: productivityAnalysis.data,
    timeBlockingRecs: timeBlockingRecs.data
  };
}

/**
 * Example 4: Workflow Monitoring and Dashboard
 */
async function workflowMonitoringExample() {
  console.log('📈 Starting Workflow Monitoring...');

  const { dashboardAgent, linearAgent } = await setupMultiAgentSystem();

  // 1. Generate comprehensive dashboard
  const dashboard = await dashboardAgent.executeTask({
    id: 'dashboard-1',
    type: 'generate_dashboard',
    priority: 1,
    payload: {},
    createdAt: new Date()
  });

  console.log('📊 Dashboard data:', dashboard.data);

  // 2. Detect bottlenecks
  const bottleneckDetection = await dashboardAgent.executeTask({
    id: 'bottleneck-1',
    type: 'detect_bottlenecks',
    priority: 1,
    payload: {},
    createdAt: new Date()
  });

  console.log('🚨 Bottlenecks detected:', bottleneckDetection.data);

  // 3. Generate progress report
  const progressReport = await linearAgent.executeTask({
    id: 'progress-1',
    type: 'generate_progress_report',
    priority: 1,
    payload: {
      workflowIds: ['wf-1', 'wf-2', 'wf-3']
    },
    createdAt: new Date()
  });

  console.log('📋 Progress report:', progressReport.data);

  return {
    dashboard: dashboard.data,
    bottlenecks: bottleneckDetection.data,
    progress: progressReport.data
  };
}

/**
 * Example 5: Pattern Evolution and Learning
 */
async function patternEvolutionExample() {
  console.log('🧠 Starting Pattern Evolution Example...');

  const { patternAgent } = await setupMultiAgentSystem();

  // 1. Analyze pattern performance
  const performanceAnalysis = await patternAgent.executeTask({
    id: 'performance-1',
    type: 'analyze_pattern_performance',
    priority: 1,
    payload: {
      timeframe: '30d'
    },
    createdAt: new Date()
  });

  console.log('📈 Pattern performance:', performanceAnalysis.data);

  // 2. Create a new pattern based on successful workflows
  const newPattern = await patternAgent.executeTask({
    id: 'create-pattern-1',
    type: 'create_new_pattern',
    priority: 1,
    payload: {
      patternDefinition: {
        name: 'Rapid Response Review',
        description: 'Fast-track review process for urgent changes',
        applicability: ['urgent_review', 'hotfix'],
        components: [
          {
            type: 'reviewer_assignment',
            config: {
              maxReviewers: 1,
              urgencyBoost: true,
              timeLimit: 30
            }
          },
          {
            type: 'notification_escalation',
            config: {
              immediateNotification: true,
              escalationDelay: 15
            }
          }
        ]
      },
      sourceWorkflows: ['urgent-wf-1', 'urgent-wf-2']
    },
    createdAt: new Date()
  });

  console.log('🆕 New pattern created:', newPattern.data);

  return {
    performance: performanceAnalysis.data,
    newPattern: newPattern.data
  };
}

/**
 * Example 6: Inter-Agent Communication
 */
async function interAgentCommunicationExample() {
  console.log('🔄 Demonstrating Inter-Agent Communication...');

  const { dashboardAgent, linearAgent, reviewAgent } = await setupMultiAgentSystem();

  // Set up event listeners
  dashboardAgent.on('workflow_started', async (event) => {
    console.log('📢 Dashboard received workflow_started event:', event.data);
    
    // Automatically create Linear mapping when workflow starts
    if (event.data.issueId) {
      await linearAgent.mapWorkflowToIssue(event.data.workflowId, event.data.issueId);
      console.log('🔗 Workflow mapped to Linear issue');
    }
  });

  reviewAgent.on('review_completed', async (event) => {
    console.log('📢 Review completed event:', event.data);
    
    // Update dashboard metrics
    await dashboardAgent.emitEvent('status_update', {
      type: 'review_completion',
      workflowId: event.data.workflowId,
      duration: event.data.duration
    });
  });

  // Simulate workflow events
  await dashboardAgent.emitEvent('workflow_started', {
    workflowId: 'demo-workflow-1',
    issueId: 'DEMO-123',
    type: 'code_review'
  });

  await reviewAgent.emitEvent('review_completed', {
    workflowId: 'demo-workflow-1',
    reviewerId: 'reviewer-1',
    duration: 3600000 // 1 hour
  });

  console.log('✅ Inter-agent communication demonstrated');
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🎬 Starting Multi-Agent Workflow System Examples\n');

    // Run all examples
    await setupMultiAgentSystem();
    console.log('\n');

    await codeReviewWorkflow();
    console.log('\n');

    await productivityOptimizationWorkflow();
    console.log('\n');

    await workflowMonitoringExample();
    console.log('\n');

    await patternEvolutionExample();
    console.log('\n');

    await interAgentCommunicationExample();
    console.log('\n');

    console.log('🎉 All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error running examples:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

export {
  setupMultiAgentSystem,
  codeReviewWorkflow,
  productivityOptimizationWorkflow,
  workflowMonitoringExample,
  patternEvolutionExample,
  interAgentCommunicationExample
};

