// Enhanced Multi-Agent Workflow System
// Main entry point for Cloudflare Workers

import { AgentCoordinator } from './agents/agent-coordinator';
import { StateManager } from './agents/state-manager';
import { Env } from './types';

// Export Durable Object classes
export { AgentCoordinator } from './agents/agent-coordinator';
export { StateManager } from './agents/state-manager';

// Main worker handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Route to appropriate handler based on path
      if (path.startsWith('/api/')) {
        return handleApiRequest(request, env, ctx);
      }

      if (path.startsWith('/webhook/')) {
        return handleWebhookRequest(request, env, ctx);
      }

      if (path === '/health') {
        return handleHealthCheck(request, env, ctx);
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

async function handleApiRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // API routes for workflow management
  if (path === '/api/workflows' && request.method === 'POST') {
    return createWorkflow(request, env);
  }

  if (path.startsWith('/api/workflows/') && request.method === 'GET') {
    const workflowId = path.split('/')[3];
    return getWorkflow(workflowId, env);
  }

  if (path.startsWith('/api/workflows/') && path.endsWith('/state') && request.method === 'GET') {
    const workflowId = path.split('/')[3];
    return getWorkflowState(workflowId, env);
  }

  if (path.startsWith('/api/workflows/') && path.endsWith('/history') && request.method === 'GET') {
    const workflowId = path.split('/')[3];
    return getWorkflowHistory(workflowId, env);
  }

  return new Response('API endpoint not found', { status: 404 });
}

async function handleWebhookRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Webhook handlers for external integrations
  if (path === '/webhook/github' && request.method === 'POST') {
    return handleGitHubWebhook(request, env);
  }

  if (path === '/webhook/linear' && request.method === 'POST') {
    return handleLinearWebhook(request, env);
  }

  return new Response('Webhook endpoint not found', { status: 404 });
}

async function handleHealthCheck(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    components: {
      coordinator: 'healthy',
      stateManager: 'healthy'
    }
  };

  return new Response(JSON.stringify(health), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Workflow management functions
async function createWorkflow(request: Request, env: Env): Promise<Response> {
  try {
    const workflowData = await request.json();
    
    // Get coordinator instance
    const coordinatorId = env.AGENT_COORDINATOR.idFromName('main-coordinator');
    const coordinator = env.AGENT_COORDINATOR.get(coordinatorId);
    
    // Create workflow
    const response = await coordinator.fetch('https://coordinator/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        type: 'create-workflow',
        priority: 'medium',
        payload: workflowData,
        context: {
          workflowId: workflowData.id || crypto.randomUUID(),
          metadata: {}
        },
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: 3
      })
    });

    if (!response.ok) {
      throw new Error(`Coordinator error: ${response.statusText}`);
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create workflow' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function getWorkflow(workflowId: string, env: Env): Promise<Response> {
  try {
    // Get coordinator instance
    const coordinatorId = env.AGENT_COORDINATOR.idFromName('main-coordinator');
    const coordinator = env.AGENT_COORDINATOR.get(coordinatorId);
    
    const response = await coordinator.fetch('https://coordinator/status');
    
    if (!response.ok) {
      throw new Error(`Coordinator error: ${response.statusText}`);
    }

    const status = await response.json();
    return new Response(JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get workflow' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function getWorkflowState(workflowId: string, env: Env): Promise<Response> {
  try {
    // Get state manager instance
    const stateManagerId = env.STATE_MANAGER.idFromName('main-state-manager');
    const stateManager = env.STATE_MANAGER.get(stateManagerId);
    
    const response = await stateManager.fetch('https://state-manager/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        type: 'get-state',
        priority: 'medium',
        payload: { workflowId },
        context: { workflowId, metadata: {} },
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: 3
      })
    });

    if (!response.ok) {
      throw new Error(`State Manager error: ${response.statusText}`);
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get workflow state error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get workflow state' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function getWorkflowHistory(workflowId: string, env: Env): Promise<Response> {
  try {
    // Get state manager instance
    const stateManagerId = env.STATE_MANAGER.idFromName('main-state-manager');
    const stateManager = env.STATE_MANAGER.get(stateManagerId);
    
    const response = await stateManager.fetch('https://state-manager/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        type: 'get-history',
        priority: 'medium',
        payload: { workflowId },
        context: { workflowId, metadata: {} },
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: 3
      })
    });

    if (!response.ok) {
      throw new Error(`State Manager error: ${response.statusText}`);
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get workflow history error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get workflow history' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Webhook handlers
async function handleGitHubWebhook(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await request.json();
    
    // Process GitHub webhook
    // This would trigger appropriate workflow actions
    
    return new Response(JSON.stringify({ status: 'processed' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process GitHub webhook' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleLinearWebhook(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await request.json();
    
    // Process Linear webhook
    // This would trigger appropriate workflow actions
    
    return new Response(JSON.stringify({ status: 'processed' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Linear webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process Linear webhook' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
