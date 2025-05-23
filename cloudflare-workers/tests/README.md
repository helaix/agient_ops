# Testing Framework for Enhanced Multi-Agent Workflow System

This comprehensive testing framework provides complete test coverage for the Enhanced Multi-Agent Workflow System built on Cloudflare Workers and Durable Objects.

## Overview

The testing framework includes:

- **Unit Tests**: Individual component testing with mocks
- **Integration Tests**: Multi-agent workflow coordination testing
- **Load Tests**: Performance and scalability validation
- **End-to-End Tests**: Complete workflow scenario testing
- **Performance Benchmarking**: Detailed performance analysis tools

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:load
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── agents/             # Agent-specific tests
│   ├── workers/            # Worker script tests
│   ├── utils/              # Utility function tests
│   └── types/              # Type definition tests
├── integration/            # Integration tests
│   ├── multi-agent-workflows.test.ts
│   ├── storage-integration.test.ts
│   └── external-api-integration.test.ts
├── load/                   # Load and performance tests
│   ├── event-processing.test.ts
│   ├── agent-coordination.test.ts
│   └── scalability.test.ts
├── e2e/                    # End-to-end workflow tests
│   ├── complete-workflows.test.ts
│   ├── error-recovery.test.ts
│   └── real-world-scenarios.test.ts
├── fixtures/               # Test data and sample events
├── mocks/                  # Mock implementations
└── utils/                  # Test utilities and helpers
```

## Test Categories

### Unit Tests

Test individual components in isolation with comprehensive mocking:

```typescript
// Example: Testing BaseAgent
describe('BaseAgent', () => {
  it('should process tasks correctly', async () => {
    const agent = new TestAgent(mockState, mockEnv);
    const task = MockFactories.createAgentTask();
    
    const result = await agent.processTask(task);
    
    expect(result.status).toBe('success');
    expect(result.metrics.executionTimeMs).toBeGreaterThan(0);
  });
});
```

### Integration Tests

Test multi-agent coordination and workflow management:

```typescript
// Example: Testing workflow coordination
describe('Multi-Agent Workflows', () => {
  it('should coordinate complex workflows', async () => {
    const workflow = MockFactories.createWorkflowState({
      context: { githubRepoId: 'org/repo', linearIssueId: 'issue-123' }
    });
    
    const result = await coordinator.coordinateWorkflow(workflow);
    
    expect(result.agentsAssigned).toBeGreaterThan(0);
    expect(result.status).toBe('created');
  });
});
```

### Load Tests

Validate performance under high load conditions:

```typescript
// Example: Load testing event processing
describe('Event Processing Load Tests', () => {
  it('should handle 1,000+ events per minute', async () => {
    const loadTest = await benchmark.runLoadTest(
      async () => processEvent(),
      { duration: 60000, concurrency: 20 }
    );
    
    performanceUtils.assertPerformance(loadTest, {
      maxAverageResponseTime: 500,
      minThroughput: 16,
      maxErrorRate: 5
    });
  });
});
```

### End-to-End Tests

Test complete workflows from trigger to completion:

```typescript
// Example: Complete GitHub PR review workflow
describe('Complete Workflow E2E Tests', () => {
  it('should execute GitHub PR review workflow', async () => {
    // 1. Setup GitHub PR
    mockGitHubAPI.setPullRequest('org', 'repo', 456, prData);
    
    // 2. Trigger workflow
    const workflow = createPRReviewWorkflow(prData);
    await coordinator.startWorkflow(workflow);
    
    // 3. Verify reviewer assignment
    expect(mockGitHubAPI.assignReviewers).toHaveBeenCalled();
    
    // 4. Validate completion
    expect(workflow.status).toBe('completed');
  });
});
```

## Mock System

The testing framework includes comprehensive mocks for:

### External APIs
- **GitHub API**: PR management, reviews, comments
- **Linear API**: Issue management, state updates
- **Slack API**: Messaging, channel management

### Storage Backends
- **Durable Object Storage**: State persistence
- **KV Namespace**: Configuration and caching
- **R2 Bucket**: Log and file storage

### Durable Objects
- **Agent Stubs**: Inter-agent communication
- **Namespaces**: Agent spawning and management

## Test Utilities

### MockFactories
Generate realistic test data:

```typescript
// Create test agents
const agent = MockFactories.createAgentInstance({
  type: 'review-manager',
  status: 'active'
});

// Create test workflows
const workflow = MockFactories.createWorkflowState({
  name: 'Test Workflow',
  context: { userId: 'test-user' }
});

// Create test events
const events = MockFactories.createEvents(100, {
  type: 'github-pr-opened'
});
```

### TestHelpers
Common testing operations:

```typescript
// Wait for conditions
await TestHelpers.waitFor(() => agent.status === 'idle');

// Measure performance
const { duration } = await TestHelpers.measureExecutionTime(operation);

// Create mock requests
const request = TestHelpers.createMockRequest('https://agent/task', {
  method: 'POST',
  body: taskData
});
```

### PerformanceBenchmark
Detailed performance analysis:

```typescript
const benchmark = new PerformanceBenchmark();

// Run load test
const result = await benchmark.runLoadTest(operation, {
  duration: 30000,
  concurrency: 10
});

// Generate report
const report = performanceUtils.generateReport(result, 'Load Test');
console.log(report);
```

## Performance Targets

### Response Time Targets
- Unit tests: <10ms per test
- Integration tests: <1s per test
- Load tests: <5s per scenario
- E2E tests: <30s per workflow

### Coverage Targets
- Unit test coverage: >90%
- Integration test coverage: >80%
- E2E scenario coverage: >95%
- Critical path coverage: 100%

### Load Testing Targets
- 10,000+ events per minute processing
- 1,000+ concurrent webhook requests
- 100+ concurrent agent operations
- <100ms average response time under load

## Configuration

### Vitest Configuration
The framework uses Vitest with Miniflare for Cloudflare Workers compatibility:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'miniflare',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  }
});
```

### Environment Setup
Tests run in a controlled Miniflare environment with:

- Mock Durable Objects
- Mock KV and R2 storage
- Mock external API responses
- Isolated test state

## CI/CD Integration

The testing framework integrates with GitHub Actions:

```yaml
# Run all test suites
- name: Run tests
  run: |
    npm run test:unit
    npm run test:integration
    npm run test:load
    npm run test:e2e

# Generate coverage
- name: Coverage
  run: npm run test:coverage

# Performance benchmarking
- name: Performance tests
  run: npm run test:load
```

## Writing Tests

### Best Practices

1. **Use descriptive test names** that explain what is being tested
2. **Follow the AAA pattern**: Arrange, Act, Assert
3. **Mock external dependencies** to ensure test isolation
4. **Test both success and failure scenarios**
5. **Include performance assertions** for critical paths
6. **Use realistic test data** from fixtures when possible

### Example Test Structure

```typescript
describe('ComponentName', () => {
  let component: ComponentType;
  let mockDependency: MockType;

  beforeEach(() => {
    // Arrange: Set up test environment
    mockDependency = new MockType();
    component = new ComponentType(mockDependency);
  });

  describe('feature group', () => {
    it('should handle normal operation', async () => {
      // Arrange
      const input = MockFactories.createInput();
      
      // Act
      const result = await component.process(input);
      
      // Assert
      expect(result.status).toBe('success');
      expect(mockDependency.method).toHaveBeenCalledWith(input);
    });

    it('should handle error conditions', async () => {
      // Arrange
      mockDependency.method.mockRejectedValue(new Error('Test error'));
      
      // Act & Assert
      await expect(component.process(input)).rejects.toThrow('Test error');
    });
  });
});
```

## Debugging Tests

### Running Individual Tests
```bash
# Run specific test file
npm test -- tests/unit/agents/base-agent.test.ts

# Run tests matching pattern
npm test -- --grep "workflow coordination"

# Run tests in debug mode
npm test -- --inspect-brk
```

### Test Output
- Use `console.log` for debugging (mocked by default)
- Check test coverage reports in `coverage/` directory
- Review performance reports for load tests

## Contributing

When adding new features:

1. **Write tests first** (TDD approach recommended)
2. **Add unit tests** for all new components
3. **Update integration tests** if workflow changes
4. **Add load tests** for performance-critical features
5. **Include E2E tests** for new user-facing workflows
6. **Update documentation** and examples

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase timeout in test configuration
- Check for infinite loops or blocking operations
- Verify mock responses are properly configured

**Mock not working**
- Ensure mocks are reset between tests
- Check mock setup in `beforeEach` hooks
- Verify mock imports and initialization

**Performance tests failing**
- Check system resources during test execution
- Adjust performance thresholds if needed
- Review test environment consistency

**Coverage not meeting targets**
- Identify uncovered code paths
- Add tests for edge cases and error conditions
- Review exclusion patterns in coverage configuration

For more help, check the test output logs and error messages, or refer to the Vitest documentation.

