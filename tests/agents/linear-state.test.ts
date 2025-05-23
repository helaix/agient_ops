import { LinearStateAgent } from '../../src/agents/linear-state';
import { AgentTask } from '../../src/types';

describe('LinearStateAgent', () => {
  let agent: LinearStateAgent;

  beforeEach(async () => {
    agent = new LinearStateAgent('mock-api-key');
    await agent.initialize();
  });

  describe('initialization', () => {
    it('should initialize with correct configuration', () => {
      const config = agent.getConfig();
      expect(config.type).toBe('linear-state');
      expect(config.name).toBe('Linear State Agent');
      expect(config.capabilities).toContain('linear_api_integration');
      expect(config.capabilities).toContain('issue_status_tracking');
    });
  });

  describe('task processing', () => {
    it('should handle sync_issue_status task', async () => {
      const task: AgentTask = {
        id: 'sync-task-1',
        type: 'sync_issue_status',
        priority: 1,
        payload: {
          issueId: 'test-issue-1',
          newStatus: 'In Progress'
        },
        createdAt: new Date()
      };

      const result = await agent.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.issueId).toBe('test-issue-1');
      expect(result.data.status).toBe('In Progress');
    });

    it('should handle create_issue_mapping task', async () => {
      const task: AgentTask = {
        id: 'mapping-task-1',
        type: 'create_issue_mapping',
        priority: 1,
        payload: {
          workflowId: 'workflow-123',
          issueId: 'issue-456'
        },
        createdAt: new Date()
      };

      const result = await agent.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.workflowId).toBe('workflow-123');
      expect(result.data.issueId).toBe('issue-456');
      expect(result.data.mapped).toBe(true);
    });

    it('should handle generate_progress_report task', async () => {
      const task: AgentTask = {
        id: 'report-task-1',
        type: 'generate_progress_report',
        priority: 1,
        payload: {
          workflowIds: ['workflow-1', 'workflow-2']
        },
        createdAt: new Date()
      };

      const result = await agent.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.data.totalWorkflows).toBe(2);
      expect(result.data.issues).toBeDefined();
    });
  });

  describe('workflow mapping', () => {
    it('should map workflow to issue', async () => {
      await agent.mapWorkflowToIssue('workflow-test', 'issue-test');
      const mapping = agent.getWorkflowMapping('workflow-test');
      expect(mapping).toBe('issue-test');
    });

    it('should return undefined for unmapped workflow', () => {
      const mapping = agent.getWorkflowMapping('non-existent-workflow');
      expect(mapping).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle unknown task types', async () => {
      const task: AgentTask = {
        id: 'unknown-task',
        type: 'unknown_task_type',
        priority: 1,
        payload: {},
        createdAt: new Date()
      };

      const result = await agent.executeTask(task);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown task type');
    });
  });
});

