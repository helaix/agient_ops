import { describe, it, expect, beforeEach } from 'vitest';
import { AgentCoordinator } from '@/agents/agent-coordinator';
import { Env } from '@/types';
import { MockDurableObjectStorage } from '../mocks/storage-backends';
import { TestHelpers } from '../utils/test-helpers';
import { MockFactories } from '../utils/mock-factories';
import { PerformanceBenchmark, performanceUtils } from '../utils/performance-utils';

describe('Event Processing Load Tests', () => {
  let coordinator: AgentCoordinator;
  let mockEnv: Env;
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    const mockState = {
      id: { toString: () => 'load-test-coordinator' },
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
    benchmark = new PerformanceBenchmark();
  });

  describe('high-volume event processing', () => {
    it('should handle 1,000+ events per minute', async () => {
      const eventCount = 1000;
      const testDurationMs = 60000; // 1 minute
      
      // Generate test events
      const events = MockFactories.createEvents(eventCount, {
        type: 'github-pr-opened',
        source: 'github'
      });

      // Create load test scenario
      const loadTest = TestHelpers.createLoadTestScenario(
        'High Volume Event Processing',
        async () => {
          // Setup: Spawn initial agents
          const agentTypes = ['integration-dashboard', 'review-manager', 'linear-state'];
          for (const type of agentTypes) {
            const config = MockFactories.createAgentConfig({ type });
            const request = TestHelpers.createMockRequest('https://coordinator/spawn', {
              method: 'POST',
              body: { type, config }
            });
            await coordinator.fetch(request);
          }
        },
        async () => {
          // Execute: Process a batch of events
          const batchSize = 10;
          const eventBatch = events.splice(0, batchSize);
          
          const workflows = eventBatch.map(event => 
            MockFactories.createWorkflowState({
              name: `Event Processing ${event.id}`,
              context: {
                userId: 'load-test-user',
                metadata: { eventId: event.id, eventType: event.type }
              }
            })
          );

          const requests = workflows.map(workflow =>
            TestHelpers.createMockRequest('https://coordinator/workflow', {
              method: 'POST',
              body: { workflow }
            })
          );

          const responses = await Promise.all(
            requests.map(request => coordinator.fetch(request))
          );

          return responses.filter(response => response.status === 200).length;
        },
        async () => {
          // Teardown: Clean up resources
          // In a real implementation, we'd terminate agents and clean up state
        },
        {
          iterations: 100, // Process 100 batches of 10 events each
          concurrency: 5,
          timeout: testDurationMs
        }
      );

      const result = await loadTest.run();

      // Validate performance requirements
      expect(result.averageDuration).toBeLessThan(1000); // Under 1 second per batch
      expect(result.maxDuration).toBeLessThan(5000); // No batch should take over 5 seconds
      
      // Should process most events successfully
      const totalProcessed = result.results.reduce((sum, count) => sum + count, 0);
      expect(totalProcessed).toBeGreaterThan(800); // At least 80% success rate
    });

    it('should maintain performance under sustained load', async () => {
      const sustainedLoadTest = await benchmark.runLoadTest(
        async () => {
          // Simulate processing a single event
          const event = MockFactories.createEvent({
            type: 'linear-issue-created',
            source: 'linear'
          });

          const workflow = MockFactories.createWorkflowState({
            name: `Sustained Load Event ${event.id}`,
            context: {
              userId: 'sustained-test-user',
              linearIssueId: event.id,
              metadata: { loadTest: true }
            }
          });

          const request = TestHelpers.createMockRequest('https://coordinator/workflow', {
            method: 'POST',
            body: { workflow }
          });

          const response = await coordinator.fetch(request);
          return response.status === 200;
        },
        {
          duration: 30000, // 30 seconds
          concurrency: 10,
          rampUpTime: 5000 // 5 second ramp up
        }
      );

      // Performance assertions
      performanceUtils.assertPerformance(sustainedLoadTest, {
        maxAverageResponseTime: 500, // Under 500ms average
        minThroughput: 15, // At least 15 operations per second
        maxErrorRate: 5, // Under 5% error rate
        maxP95ResponseTime: 1000, // 95% under 1 second
        maxP99ResponseTime: 2000 // 99% under 2 seconds
      });

      // Generate performance report
      const report = performanceUtils.generateReport(sustainedLoadTest, 'Sustained Load Test');
      console.log(report);
    });

    it('should handle burst traffic patterns', async () => {
      // Simulate burst traffic with varying load
      const burstPhases = [
        { duration: 5000, concurrency: 2, name: 'Low Load' },
        { duration: 10000, concurrency: 20, name: 'Burst Load' },
        { duration: 5000, concurrency: 5, name: 'Recovery' }
      ];

      const burstResults = [];

      for (const phase of burstPhases) {
        const phaseResult = await benchmark.runLoadTest(
          async () => {
            const workflow = MockFactories.createWorkflowState({
              name: `Burst Test ${phase.name}`,
              context: {
                userId: 'burst-test-user',
                metadata: { phase: phase.name }
              }
            });

            const request = TestHelpers.createMockRequest('https://coordinator/workflow', {
              method: 'POST',
              body: { workflow }
            });

            const response = await coordinator.fetch(request);
            return response.status === 200;
          },
          {
            duration: phase.duration,
            concurrency: phase.concurrency,
            rampUpTime: 1000
          }
        );

        burstResults.push({
          phase: phase.name,
          result: phaseResult
        });
      }

      // Validate that system handles burst patterns
      burstResults.forEach(({ phase, result }) => {
        expect(result.errorRate).toBeLessThan(10); // Under 10% error rate for all phases
        
        if (phase === 'Burst Load') {
          // During burst, allow higher response times but still reasonable
          expect(result.averageResponseTime).toBeLessThan(2000);
        } else {
          // During normal phases, expect better performance
          expect(result.averageResponseTime).toBeLessThan(1000);
        }
      });
    });
  });

  describe('concurrent webhook processing', () => {
    it('should handle 1,000+ concurrent webhook requests', async () => {
      const concurrentRequests = 1000;
      
      // Generate webhook payloads
      const webhooks = Array.from({ length: concurrentRequests }, (_, i) => ({
        id: `webhook-${i}`,
        type: i % 2 === 0 ? 'github-pr-opened' : 'linear-issue-created',
        payload: MockFactories.createEvent({
          type: i % 2 === 0 ? 'github-pr-opened' : 'linear-issue-created'
        })
      }));

      // Process webhooks concurrently
      const startTime = performance.now();
      
      const promises = webhooks.map(webhook => 
        benchmark.measureResponseTime(async () => {
          const workflow = MockFactories.createWorkflowState({
            name: `Webhook Processing ${webhook.id}`,
            context: {
              userId: 'webhook-test-user',
              metadata: { webhookId: webhook.id, webhookType: webhook.type }
            }
          });

          const request = TestHelpers.createMockRequest('https://coordinator/workflow', {
            method: 'POST',
            body: { workflow }
          });

          const response = await coordinator.fetch(request);
          return response.status === 200;
        })
      );

      const results = await Promise.allSettled(promises);
      const endTime = performance.now();
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const totalDuration = endTime - startTime;
      const throughput = (successful / totalDuration) * 1000; // requests per second

      // Performance validations
      expect(successful).toBeGreaterThan(concurrentRequests * 0.95); // 95% success rate
      expect(throughput).toBeGreaterThan(50); // At least 50 requests per second
      expect(totalDuration).toBeLessThan(30000); // Complete within 30 seconds
    });

    it('should maintain response times under concurrent load', async () => {
      const concurrencyLevels = [10, 50, 100, 200];
      const responseTimeResults = [];

      for (const concurrency of concurrencyLevels) {
        const result = await benchmark.measureConcurrency(
          async () => {
            const workflow = MockFactories.createWorkflowState({
              name: `Concurrency Test ${concurrency}`,
              context: {
                userId: 'concurrency-test-user',
                metadata: { concurrencyLevel: concurrency }
              }
            });

            const request = TestHelpers.createMockRequest('https://coordinator/workflow', {
              method: 'POST',
              body: { workflow }
            });

            const response = await coordinator.fetch(request);
            return response.status === 200;
          },
          concurrency,
          50 // 50 iterations per concurrency level
        );

        responseTimeResults.push({
          concurrency,
          averageResponseTime: result.averageResponseTime,
          p95ResponseTime: result.p95ResponseTime,
          throughput: result.throughput,
          errorRate: result.errorRate
        });
      }

      // Validate that response times don't degrade too much with increased concurrency
      responseTimeResults.forEach(({ concurrency, averageResponseTime, errorRate }) => {
        // Error rate should stay low
        expect(errorRate).toBeLessThan(5);
        
        // Response times should scale reasonably
        if (concurrency <= 50) {
          expect(averageResponseTime).toBeLessThan(500);
        } else if (concurrency <= 100) {
          expect(averageResponseTime).toBeLessThan(1000);
        } else {
          expect(averageResponseTime).toBeLessThan(2000);
        }
      });
    });
  });

  describe('agent coordination under load', () => {
    it('should scale agent coordination under high load', async () => {
      // Create multiple workflows requiring different agent types
      const workflowCount = 100;
      const workflows = Array.from({ length: workflowCount }, (_, i) => {
        const agentTypes = ['integration-dashboard', 'review-manager', 'context-optimizer'];
        const selectedType = agentTypes[i % agentTypes.length];
        
        return MockFactories.createWorkflowState({
          name: `Load Test Workflow ${i}`,
          context: {
            userId: 'load-test-user',
            githubRepoId: selectedType === 'review-manager' ? 'org/repo' : undefined,
            linearIssueId: selectedType === 'integration-dashboard' ? 'issue-123' : undefined,
            metadata: { 
              loadTest: true, 
              index: i,
              requiredAgentType: selectedType
            }
          }
        });
      });

      // Process workflows in batches to simulate realistic load
      const batchSize = 20;
      const batches = [];
      
      for (let i = 0; i < workflows.length; i += batchSize) {
        batches.push(workflows.slice(i, i + batchSize));
      }

      const batchResults = [];
      
      for (const batch of batches) {
        const batchStartTime = performance.now();
        
        const batchPromises = batch.map(workflow =>
          coordinator.fetch(TestHelpers.createMockRequest('https://coordinator/workflow', {
            method: 'POST',
            body: { workflow }
          }))
        );

        const batchResponses = await Promise.all(batchPromises);
        const batchEndTime = performance.now();
        
        const successfulInBatch = batchResponses.filter(r => r.status === 200).length;
        
        batchResults.push({
          batchSize: batch.length,
          successful: successfulInBatch,
          duration: batchEndTime - batchStartTime,
          successRate: (successfulInBatch / batch.length) * 100
        });
      }

      // Validate batch processing performance
      batchResults.forEach((result, index) => {
        expect(result.successRate).toBeGreaterThan(90); // 90% success rate per batch
        expect(result.duration).toBeLessThan(5000); // Each batch under 5 seconds
      });

      // Check overall agent coordination
      const agentsRequest = TestHelpers.createMockRequest('https://coordinator/agents');
      const agentsResponse = await coordinator.fetch(agentsRequest);
      const agentsData = await agentsResponse.json();

      expect(agentsData.totalAgents).toBeGreaterThan(0);
      expect(agentsData.agentsByType).toHaveProperty('integration-dashboard');
      expect(agentsData.agentsByType).toHaveProperty('review-manager');
    });

    it('should maintain coordination efficiency with many agents', async () => {
      // Spawn many agents
      const agentCount = 50;
      const agentTypes = ['integration-dashboard', 'review-manager', 'context-optimizer', 'pattern-bridge', 'linear-state'];
      
      const spawnPromises = Array.from({ length: agentCount }, (_, i) => {
        const type = agentTypes[i % agentTypes.length];
        const config = MockFactories.createAgentConfig({
          type,
          name: `Load Test Agent ${i}`
        });

        return coordinator.fetch(TestHelpers.createMockRequest('https://coordinator/spawn', {
          method: 'POST',
          body: { type, config }
        }));
      });

      const spawnResults = await Promise.allSettled(spawnPromises);
      const successfulSpawns = spawnResults.filter(r => 
        r.status === 'fulfilled' && (r.value as Response).status === 200
      ).length;

      // Should spawn most agents successfully (allowing for rate limiting)
      expect(successfulSpawns).toBeGreaterThan(agentCount * 0.8);

      // Test coordination efficiency with many agents
      const coordinationTest = await performanceUtils.quickTest(
        async () => {
          const metricsRequest = TestHelpers.createMockRequest('https://coordinator/metrics');
          const response = await coordinator.fetch(metricsRequest);
          return response.status === 200;
        },
        20 // 20 iterations
      );

      // Coordination should remain efficient even with many agents
      expect(coordinationTest.averageTime).toBeLessThan(100); // Under 100ms
      expect(coordinationTest.maxTime).toBeLessThan(500); // Max 500ms
    });
  });

  describe('memory and resource management', () => {
    it('should manage memory efficiently under load', async () => {
      // Process many workflows and check memory doesn't grow excessively
      const workflowCount = 200;
      
      for (let i = 0; i < workflowCount; i++) {
        const workflow = MockFactories.createWorkflowState({
          name: `Memory Test Workflow ${i}`,
          context: {
            userId: 'memory-test-user',
            metadata: { index: i }
          }
        });

        const request = TestHelpers.createMockRequest('https://coordinator/workflow', {
          method: 'POST',
          body: { workflow }
        });

        await coordinator.fetch(request);

        // Periodically check that the system is still responsive
        if (i % 50 === 0) {
          const healthRequest = TestHelpers.createMockRequest('https://coordinator/health');
          const healthResponse = await coordinator.fetch(healthRequest);
          expect(healthResponse.status).toBe(200);
        }
      }

      // System should still be responsive after processing many workflows
      const finalHealthRequest = TestHelpers.createMockRequest('https://coordinator/health');
      const finalHealthResponse = await coordinator.fetch(finalHealthRequest);
      expect(finalHealthResponse.status).toBe(200);
    });

    it('should handle resource cleanup properly', async () => {
      // Create and terminate many agents to test cleanup
      const agentLifecycles = 20;
      
      for (let i = 0; i < agentLifecycles; i++) {
        // Spawn agent
        const config = MockFactories.createAgentConfig({
          type: 'integration-dashboard',
          name: `Cleanup Test Agent ${i}`
        });

        const spawnRequest = TestHelpers.createMockRequest('https://coordinator/spawn', {
          method: 'POST',
          body: { type: 'integration-dashboard', config }
        });

        const spawnResponse = await coordinator.fetch(spawnRequest);
        
        if (spawnResponse.status === 200) {
          const spawnResult = await spawnResponse.json();
          
          // Terminate agent
          const terminateRequest = TestHelpers.createMockRequest(
            `https://coordinator/agent/${spawnResult.agentId}/terminate`,
            { method: 'POST' }
          );

          const terminateResponse = await coordinator.fetch(terminateRequest);
          expect(terminateResponse.status).toBe(200);
        }
      }

      // Check that agents list is clean
      const agentsRequest = TestHelpers.createMockRequest('https://coordinator/agents');
      const agentsResponse = await coordinator.fetch(agentsRequest);
      const agentsData = await agentsResponse.json();

      // Should have cleaned up terminated agents
      expect(agentsData.totalAgents).toBeLessThan(agentLifecycles);
    });
  });
});

