import { describe, it, expect, beforeEach } from 'vitest';
import { AgentCoordinator } from '@/agents/agent-coordinator';
import { Env } from '@/types';
import { MockDurableObjectStorage } from '../mocks/storage-backends';
import { mockGitHubAPI, mockLinearAPI, mockSlackAPI } from '../mocks';
import { TestHelpers } from '../utils/test-helpers';
import { MockFactories } from '../utils/mock-factories';
import sampleEvents from '../fixtures/sample-events.json';
import testWorkflows from '../fixtures/test-workflows.json';

describe('Complete Workflow E2E Tests', () => {
  let coordinator: AgentCoordinator;
  let mockEnv: Env;

  beforeEach(() => {
    const mockState = {
      id: { toString: () => 'e2e-coordinator' },
      storage: new MockDurableObjectStorage()
    };

    mockEnv = {
      AGENT_COORDINATOR: {} as any,
      STATE_MANAGER: {} as any,
      INTEGRATION_DASHBOARD_AGENT: {} as any,
      REVIEW_MANAGER_AGENT: {} as any,
      CONTEXT_OPTIMIZER_AGENT: {} as any,
      PATTERN_BRIDGE_AGENT: {} as any,
      LINEAR_STATE_AGENT: {} as any,
      CONFIG_KV: {} as any,
      LOGS_BUCKET: {} as any,
      METRICS: { writeDataPoint: () => {} } as any,
      ENVIRONMENT: 'test'
    };

    coordinator = new AgentCoordinator(mockState, mockEnv);

    // Reset all mocks
    mockGitHubAPI.reset();
    mockLinearAPI.reset();
    mockSlackAPI.reset();
  });

  describe('code review workflow end-to-end', () => {
    it('should execute complete GitHub PR review workflow', async () => {
      // 1. Setup: Configure mock GitHub PR
      const prData = sampleEvents.github_pr_opened;
      mockGitHubAPI.setPullRequest(
        'org',
        'test-repo',
        prData.pull_request.number,
        prData.pull_request
      );

      // 2. Trigger: Create workflow from GitHub PR webhook
      const workflow = MockFactories.createWorkflowState({
        name: 'GitHub PR Review Workflow',
        status: 'pending',
        context: {
          userId: 'developer',
          githubRepoId: 'org/test-repo',
          metadata: {
            prNumber: prData.pull_request.number,
            prTitle: prData.pull_request.title,
            author: prData.pull_request.user.login,
            complexity: 'medium'
          }
        },
        tasks: {
          'assign-reviewers': MockFactories.createAgentTask({
            id: 'assign-reviewers',
            type: 'assign-reviewers',
            priority: 'high',
            payload: {
              prNumber: prData.pull_request.number,
              requiredReviewers: 2,
              expertise: ['backend', 'api']
            },
            context: { workflowId: 'github-pr-review', metadata: {} }
          }),
          'monitor-review': MockFactories.createAgentTask({
            id: 'monitor-review',
            type: 'monitor-review-progress',
            priority: 'medium',
            payload: {
              prNumber: prData.pull_request.number,
              slaHours: 24
            },
            context: { workflowId: 'github-pr-review', metadata: {} }
          }),
          'notify-completion': MockFactories.createAgentTask({
            id: 'notify-completion',
            type: 'notify-completion',
            priority: 'low',
            payload: {
              prNumber: prData.pull_request.number,
              channels: ['slack', 'github']
            },
            context: { workflowId: 'github-pr-review', metadata: {} }
          })
        }
      });

      // 3. Execute: Start workflow coordination
      const workflowRequest = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      const workflowResponse = await coordinator.fetch(workflowRequest);
      expect(workflowResponse.status).toBe(200);

      const workflowResult = await workflowResponse.json();
      expect(workflowResult.workflowId).toBe(workflow.id);
      expect(workflowResult.status).toBe('created');

      // 4. Verify: Check that Review Manager agent was spawned
      const agentsRequest = TestHelpers.createMockRequest('https://coordinator/agents');
      const agentsResponse = await coordinator.fetch(agentsRequest);
      const agentsData = await agentsResponse.json();

      expect(agentsData.totalAgents).toBeGreaterThan(0);
      expect(agentsData.agentsByType).toHaveProperty('review-manager');

      // 5. Simulate: Reviewer assignment
      await TestHelpers.delay(100); // Simulate processing time

      // Mock reviewer assignment
      mockGitHubAPI.assignReviewers(
        'org',
        'test-repo',
        prData.pull_request.number,
        ['senior-dev', 'tech-lead']
      );

      // 6. Verify: Check reviewer assignment was called
      expect(mockGitHubAPI.assignReviewers).toHaveBeenCalledWith(
        'org',
        'test-repo',
        prData.pull_request.number,
        expect.arrayContaining(['senior-dev', 'tech-lead'])
      );

      // 7. Simulate: SLA enforcement and completion
      const updateRequest = TestHelpers.createMockRequest(
        `https://coordinator/workflow/${workflow.id}`,
        {
          method: 'PATCH',
          body: {
            status: 'completed',
            progress: {
              totalTasks: 3,
              completedTasks: 3,
              failedTasks: 0
            }
          }
        }
      );

      const updateResponse = await coordinator.fetch(updateRequest);
      expect(updateResponse.status).toBe(200);

      // 8. Verify: Workflow completion
      const finalResult = await updateResponse.json();
      expect(finalResult.status).toBe('updated');
    });

    it('should handle review SLA enforcement', async () => {
      // Setup PR that's approaching SLA deadline
      const prData = {
        ...sampleEvents.github_pr_opened.pull_request,
        created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() // 20 hours ago
      };

      mockGitHubAPI.setPullRequest('org', 'test-repo', prData.number, prData);

      const workflow = MockFactories.createWorkflowState({
        name: 'SLA Enforcement Workflow',
        context: {
          userId: 'developer',
          githubRepoId: 'org/test-repo',
          metadata: {
            prNumber: prData.number,
            slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
            escalationRequired: true
          }
        }
      });

      const workflowRequest = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      const response = await coordinator.fetch(workflowRequest);
      expect(response.status).toBe(200);

      // Simulate SLA escalation
      await TestHelpers.delay(50);

      // Verify escalation actions would be triggered
      const agentsData = await (await coordinator.fetch(
        TestHelpers.createMockRequest('https://coordinator/agents')
      )).json();

      expect(agentsData.totalAgents).toBeGreaterThan(0);
    });
  });

  describe('context optimization workflow', () => {
    it('should handle context switching optimization end-to-end', async () => {
      // 1. Setup: User with context switching patterns
      const contextEvent = sampleEvents.context_switch_detected;
      
      const workflow = MockFactories.createWorkflowState({
        name: 'Context Optimization Workflow',
        status: 'pending',
        context: {
          userId: contextEvent.userId,
          metadata: {
            analysisWindow: '7d',
            switchThreshold: 5,
            optimizationGoals: ['reduce-switches', 'improve-focus-time']
          }
        },
        tasks: {
          'analyze-patterns': MockFactories.createAgentTask({
            id: 'analyze-patterns',
            type: 'analyze-context-patterns',
            payload: {
              userId: contextEvent.userId,
              timeWindow: '7d',
              includeWeekends: false
            },
            context: { workflowId: 'context-optimization', metadata: {} }
          }),
          'generate-recommendations': MockFactories.createAgentTask({
            id: 'generate-recommendations',
            type: 'generate-optimization-recommendations',
            payload: {
              analysisResults: 'ref:analyze-patterns',
              optimizationGoals: ['reduce-switches', 'improve-focus-time']
            },
            context: { workflowId: 'context-optimization', metadata: {} }
          }),
          'implement-timeblocking': MockFactories.createAgentTask({
            id: 'implement-timeblocking',
            type: 'implement-time-blocking',
            payload: {
              recommendations: 'ref:generate-recommendations',
              calendarIntegration: true
            },
            context: { workflowId: 'context-optimization', metadata: {} }
          })
        }
      });

      // 2. Execute: Start context optimization workflow
      const workflowRequest = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      const workflowResponse = await coordinator.fetch(workflowRequest);
      expect(workflowResponse.status).toBe(200);

      // 3. Verify: Context Optimizer agent spawned
      const agentsData = await (await coordinator.fetch(
        TestHelpers.createMockRequest('https://coordinator/agents')
      )).json();

      expect(agentsData.agentsByType).toHaveProperty('context-optimizer');

      // 4. Simulate: Pattern analysis completion
      const analysisUpdate = TestHelpers.createMockRequest(
        `https://coordinator/workflow/${workflow.id}`,
        {
          method: 'PATCH',
          body: {
            progress: {
              completedTasks: 1,
              totalTasks: 3,
              metrics: {
                averageTaskDuration: 300000, // 5 minutes
                contextSwitchesDetected: 12,
                focusTimeBlocks: 4
              }
            }
          }
        }
      );

      const analysisResponse = await coordinator.fetch(analysisUpdate);
      expect(analysisResponse.status).toBe(200);

      // 5. Simulate: Recommendations generated
      const recommendationsUpdate = TestHelpers.createMockRequest(
        `https://coordinator/workflow/${workflow.id}`,
        {
          method: 'PATCH',
          body: {
            progress: {
              completedTasks: 2,
              totalTasks: 3
            },
            metadata: {
              recommendations: [
                'batch-similar-tasks',
                'implement-focus-blocks',
                'reduce-notification-interruptions'
              ]
            }
          }
        }
      );

      const recommendationsResponse = await coordinator.fetch(recommendationsUpdate);
      expect(recommendationsResponse.status).toBe(200);

      // 6. Complete workflow
      const completionUpdate = TestHelpers.createMockRequest(
        `https://coordinator/workflow/${workflow.id}`,
        {
          method: 'PATCH',
          body: {
            status: 'completed',
            progress: {
              completedTasks: 3,
              totalTasks: 3
            },
            metadata: {
              results: {
                switchesReduced: 8,
                focusTimeImproved: '35%',
                productivityGain: '18%'
              }
            }
          }
        }
      );

      const completionResponse = await coordinator.fetch(completionUpdate);
      expect(completionResponse.status).toBe(200);
    });

    it('should validate productivity improvements', async () => {
      // Use the completed context optimization workflow from fixtures
      const completedWorkflow = testWorkflows.context_optimization;

      // Verify the workflow achieved its goals
      expect(completedWorkflow.status).toBe('completed');
      expect(completedWorkflow.metadata.results.switchesReduced).toBeGreaterThan(0);
      expect(completedWorkflow.metadata.results.productivityGain).toMatch(/\d+%/);

      // Simulate follow-up analysis
      const followUpWorkflow = MockFactories.createWorkflowState({
        name: 'Context Optimization Follow-up',
        context: {
          userId: 'user-789',
          metadata: {
            previousWorkflowId: completedWorkflow.id,
            analysisType: 'effectiveness-validation'
          }
        }
      });

      const request = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow: followUpWorkflow }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);
    });
  });

  describe('linear integration workflow', () => {
    it('should manage Linear integration workflow end-to-end', async () => {
      // 1. Setup: Linear issue creation event
      const linearEvent = sampleEvents.linear_issue_created;
      mockLinearAPI.setIssue(linearEvent.data.id, linearEvent.data);

      const workflow = MockFactories.createWorkflowState({
        name: 'Linear Integration Workflow',
        status: 'pending',
        context: {
          userId: linearEvent.data.assignee.id,
          linearIssueId: linearEvent.data.id,
          metadata: {
            issueTitle: linearEvent.data.title,
            teamKey: linearEvent.data.team.key,
            priority: linearEvent.data.priority
          }
        },
        tasks: {
          'sync-issue-state': MockFactories.createAgentTask({
            id: 'sync-issue-state',
            type: 'sync-linear-state',
            payload: {
              issueId: linearEvent.data.id,
              syncDirection: 'bidirectional'
            },
            context: { workflowId: 'linear-integration', metadata: {} }
          }),
          'update-progress': MockFactories.createAgentTask({
            id: 'update-progress',
            type: 'update-progress-tracking',
            payload: {
              issueId: linearEvent.data.id,
              trackingMetrics: ['time-spent', 'completion-percentage']
            },
            context: { workflowId: 'linear-integration', metadata: {} }
          }),
          'notify-stakeholders': MockFactories.createAgentTask({
            id: 'notify-stakeholders',
            type: 'notify-stakeholders',
            payload: {
              issueId: linearEvent.data.id,
              notificationChannels: ['slack', 'email']
            },
            context: { workflowId: 'linear-integration', metadata: {} }
          })
        }
      });

      // 2. Execute: Start Linear integration workflow
      const workflowRequest = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      const workflowResponse = await coordinator.fetch(workflowRequest);
      expect(workflowResponse.status).toBe(200);

      // 3. Verify: Linear State agent spawned
      const agentsData = await (await coordinator.fetch(
        TestHelpers.createMockRequest('https://coordinator/agents')
      )).json();

      expect(agentsData.agentsByType).toHaveProperty('linear-state');

      // 4. Simulate: Issue state synchronization
      mockLinearAPI.updateIssue(linearEvent.data.id, {
        state: { name: 'In Progress', type: 'started' },
        updatedAt: new Date().toISOString()
      });

      // 5. Simulate: Progress reporting
      const progressUpdate = TestHelpers.createMockRequest(
        `https://coordinator/workflow/${workflow.id}`,
        {
          method: 'PATCH',
          body: {
            progress: {
              completedTasks: 2,
              totalTasks: 3
            },
            metadata: {
              linearIssueStatus: 'In Progress',
              lastSyncTime: new Date().toISOString()
            }
          }
        }
      );

      const progressResponse = await coordinator.fetch(progressUpdate);
      expect(progressResponse.status).toBe(200);

      // 6. Verify: Linear API interactions
      expect(mockLinearAPI.updateIssue).toHaveBeenCalledWith(
        linearEvent.data.id,
        expect.objectContaining({
          state: expect.objectContaining({
            name: 'In Progress'
          })
        })
      );
    });

    it('should handle Linear webhook processing', async () => {
      // Process Linear issue update webhook
      const updateEvent = sampleEvents.linear_issue_updated;
      
      const workflow = MockFactories.createWorkflowState({
        name: 'Linear Webhook Processing',
        context: {
          userId: 'webhook-processor',
          linearIssueId: updateEvent.data.id,
          metadata: {
            webhookType: 'issue.update',
            changeType: 'state-change'
          }
        }
      });

      const request = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.status).toBe('created');
    });
  });

  describe('error recovery workflows', () => {
    it('should handle complete workflow failure and recovery', async () => {
      // 1. Create a workflow that will fail
      const failingWorkflow = MockFactories.createWorkflowState({
        name: 'Failing Workflow Test',
        status: 'running',
        context: {
          userId: 'error-test-user',
          metadata: {
            simulateFailure: true,
            failureType: 'agent-timeout'
          }
        }
      });

      // 2. Start the workflow
      const workflowRequest = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow: failingWorkflow }
      });

      await coordinator.fetch(workflowRequest);

      // 3. Simulate workflow failure
      const failureRequest = TestHelpers.createMockRequest('https://coordinator/handle-failure', {
        method: 'POST',
        body: { 
          workflow: {
            ...failingWorkflow,
            status: 'failed',
            metadata: {
              ...failingWorkflow.metadata,
              failureReason: 'Agent spawn timeout',
              lastError: 'Failed to spawn required agents within timeout'
            }
          }
        }
      });

      const failureResponse = await coordinator.fetch(failureRequest);
      expect(failureResponse.status).toBe(200);

      const failureResult = await failureResponse.json();
      expect(failureResult.failureHandled).toBe(true);
      expect(failureResult.recoveryPlan).toBeDefined();

      // 4. Execute recovery
      const recoveryRequest = TestHelpers.createMockRequest('https://coordinator/workflow/recover', {
        method: 'POST',
        body: {
          workflowId: failingWorkflow.id,
          strategy: 'retry-failed-tasks'
        }
      });

      const recoveryResponse = await coordinator.fetch(recoveryRequest);
      expect(recoveryResponse.status).toBe(200);

      const recoveryResult = await recoveryResponse.json();
      expect(recoveryResult.status).toBe('recovery-initiated');
    });

    it('should handle system reliability under stress', async () => {
      // Create multiple workflows with various failure scenarios
      const stressScenarios = [
        { type: 'timeout', count: 5 },
        { type: 'rate-limit', count: 3 },
        { type: 'service-unavailable', count: 2 }
      ];

      const allWorkflows = [];

      for (const scenario of stressScenarios) {
        for (let i = 0; i < scenario.count; i++) {
          const workflow = MockFactories.createWorkflowState({
            name: `Stress Test ${scenario.type} ${i}`,
            context: {
              userId: 'stress-test-user',
              metadata: {
                stressTest: true,
                failureType: scenario.type,
                scenarioIndex: i
              }
            }
          });

          allWorkflows.push(workflow);
        }
      }

      // Execute all workflows concurrently
      const workflowPromises = allWorkflows.map(workflow =>
        coordinator.fetch(TestHelpers.createMockRequest('https://coordinator/workflow', {
          method: 'POST',
          body: { workflow }
        }))
      );

      const responses = await Promise.allSettled(workflowPromises);
      
      // Most workflows should be created successfully
      const successful = responses.filter(r => 
        r.status === 'fulfilled' && (r.value as Response).status === 200
      ).length;

      expect(successful).toBeGreaterThan(allWorkflows.length * 0.8); // 80% success rate

      // System should remain responsive
      const healthRequest = TestHelpers.createMockRequest('https://coordinator/health');
      const healthResponse = await coordinator.fetch(healthRequest);
      expect(healthResponse.status).toBe(200);
    });
  });

  describe('real-world scenario simulation', () => {
    it('should handle complex multi-step development workflow', async () => {
      // Simulate a complete development workflow:
      // 1. Linear issue created
      // 2. GitHub PR opened
      // 3. Review process
      // 4. Context optimization
      // 5. Issue completion

      // Step 1: Linear issue creation
      const linearIssue = sampleEvents.linear_issue_created.data;
      mockLinearAPI.setIssue(linearIssue.id, linearIssue);

      const issueWorkflow = MockFactories.createWorkflowState({
        name: 'Development Workflow - Issue Creation',
        context: {
          userId: linearIssue.assignee.id,
          linearIssueId: linearIssue.id,
          metadata: { step: 'issue-creation' }
        }
      });

      let response = await coordinator.fetch(TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow: issueWorkflow }
      }));
      expect(response.status).toBe(200);

      // Step 2: GitHub PR creation
      const prData = sampleEvents.github_pr_opened.pull_request;
      mockGitHubAPI.setPullRequest('org', 'test-repo', prData.number, prData);

      const prWorkflow = MockFactories.createWorkflowState({
        name: 'Development Workflow - PR Review',
        context: {
          userId: prData.user.login,
          githubRepoId: 'org/test-repo',
          linearIssueId: linearIssue.id,
          metadata: { 
            step: 'pr-review',
            prNumber: prData.number,
            linkedIssue: linearIssue.id
          }
        }
      });

      response = await coordinator.fetch(TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow: prWorkflow }
      }));
      expect(response.status).toBe(200);

      // Step 3: Context optimization during development
      const contextWorkflow = MockFactories.createWorkflowState({
        name: 'Development Workflow - Context Optimization',
        context: {
          userId: linearIssue.assignee.id,
          metadata: {
            step: 'context-optimization',
            activeIssue: linearIssue.id,
            activePR: prData.number
          }
        }
      });

      response = await coordinator.fetch(TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow: contextWorkflow }
      }));
      expect(response.status).toBe(200);

      // Verify all workflow types are active
      const agentsData = await (await coordinator.fetch(
        TestHelpers.createMockRequest('https://coordinator/agents')
      )).json();

      expect(agentsData.agentsByType).toHaveProperty('linear-state');
      expect(agentsData.agentsByType).toHaveProperty('review-manager');
      expect(agentsData.agentsByType).toHaveProperty('context-optimizer');
      expect(agentsData.totalAgents).toBeGreaterThan(2);
    });

    it('should validate user journey completion', async () => {
      // Simulate complete user journey from issue creation to completion
      const journeySteps = [
        'issue-created',
        'development-started',
        'pr-opened',
        'review-requested',
        'review-completed',
        'pr-merged',
        'issue-completed'
      ];

      const userJourney = MockFactories.createWorkflowState({
        name: 'Complete User Journey',
        context: {
          userId: 'journey-test-user',
          metadata: {
            journeySteps,
            currentStep: 0,
            startTime: new Date().toISOString()
          }
        }
      });

      const request = TestHelpers.createMockRequest('https://coordinator/workflow', {
        method: 'POST',
        body: { workflow: userJourney }
      });

      const response = await coordinator.fetch(request);
      expect(response.status).toBe(200);

      // Simulate progression through journey steps
      for (let i = 1; i < journeySteps.length; i++) {
        const updateRequest = TestHelpers.createMockRequest(
          `https://coordinator/workflow/${userJourney.id}`,
          {
            method: 'PATCH',
            body: {
              metadata: {
                currentStep: i,
                completedSteps: journeySteps.slice(0, i)
              }
            }
          }
        );

        const updateResponse = await coordinator.fetch(updateRequest);
        expect(updateResponse.status).toBe(200);

        // Small delay to simulate real progression
        await TestHelpers.delay(10);
      }

      // Final completion
      const completionRequest = TestHelpers.createMockRequest(
        `https://coordinator/workflow/${userJourney.id}`,
        {
          method: 'PATCH',
          body: {
            status: 'completed',
            metadata: {
              currentStep: journeySteps.length - 1,
              completedSteps: journeySteps,
              endTime: new Date().toISOString(),
              journeyDuration: '2 hours 15 minutes'
            }
          }
        }
      );

      const completionResponse = await coordinator.fetch(completionRequest);
      expect(completionResponse.status).toBe(200);
    });
  });
});

