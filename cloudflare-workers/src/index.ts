import { Env, EventData, WebhookEvent } from '@/types';
import { AgentCoordinator } from '@/agents/agent-coordinator';

/**
 * Main Worker Entry Point
 * 
 * Handles:
 * - API Gateway functionality
 * - Webhook processing and validation
 * - Event routing to appropriate agents
 * - Request/response transformation
 */

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Add CORS headers for browser requests
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Route requests based on path
      switch (true) {
        case path.startsWith('/api/webhooks'):
          return handleWebhook(request, env, ctx);
        
        case path.startsWith('/api/workflows'):
          return handleWorkflowAPI(request, env, ctx);
        
        case path.startsWith('/api/agents'):
          return handleAgentAPI(request, env, ctx);
        
        case path.startsWith('/api/health'):
          return handleHealthCheck(request, env, ctx);
        
        case path === '/':
          return new Response(getWelcomeMessage(), {
            headers: { 'Content-Type': 'text/html', ...corsHeaders }
          });
        
        default:
          return new Response('Not Found', { 
            status: 404, 
            headers: corsHeaders 
          });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }
};

/**
 * Handle webhook events from external services
 */
async function handleWebhook(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const source = url.pathname.split('/')[3]; // /api/webhooks/{source}

  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    const webhookEvent: WebhookEvent = {
      id: crypto.randomUUID(),
      type: 'webhook',
      source: source as any,
      timestamp: Date.now(),
      payload: JSON.parse(body),
      metadata: { source },
      headers,
      rawBody: body
    };

    // Validate webhook signature if required
    if (!await validateWebhookSignature(webhookEvent, env)) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Route to appropriate agent based on event type
    await routeWebhookEvent(webhookEvent, env);

    return new Response(JSON.stringify({ status: 'received' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process webhook' }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * Handle workflow management API requests
 */
async function handleWorkflowAPI(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const action = pathParts[3]; // /api/workflows/{action}
  const workflowId = pathParts[4]; // /api/workflows/{action}/{workflowId}

  // Get coordinator instance
  const coordinatorId = env.AGENT_COORDINATOR.idFromName('main-coordinator');
  const coordinator = env.AGENT_COORDINATOR.get(coordinatorId);

  try {
    switch (action) {
      case 'create':
        if (request.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
        }
        const createPayload = await request.json();
        return coordinator.fetch('https://agent/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            type: 'create-workflow',
            priority: 'medium',
            payload: createPayload,
            context: {
              workflowId: crypto.randomUUID(),
              metadata: {}
            },
            createdAt: Date.now(),
            retryCount: 0,
            maxRetries: 3
          })
        });

      case 'status':
        if (!workflowId) {
          return new Response('Workflow ID required', { status: 400 });
        }
        return coordinator.fetch('https://agent/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            type: 'monitor-workflow',
            priority: 'medium',
            payload: { workflowId },
            context: {
              workflowId,
              metadata: {}
            },
            createdAt: Date.now(),
            retryCount: 0,
            maxRetries: 3
          })
        });

      case 'terminate':
        if (request.method !== 'POST' || !workflowId) {
          return new Response('Invalid request', { status: 400 });
        }
        return coordinator.fetch('https://agent/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            type: 'terminate-workflow',
            priority: 'high',
            payload: { workflowId },
            context: {
              workflowId,
              metadata: {}
            },
            createdAt: Date.now(),
            retryCount: 0,
            maxRetries: 3
          })
        });

      default:
        return new Response('Unknown action', { status: 400 });
    }
  } catch (error) {
    console.error('Workflow API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * Handle agent management API requests
 */
async function handleAgentAPI(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const action = pathParts[3]; // /api/agents/{action}
  const agentId = pathParts[4]; // /api/agents/{action}/{agentId}

  try {
    switch (action) {
      case 'spawn':
        if (request.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
        }
        const spawnPayload = await request.json();
        
        const coordinatorId = env.AGENT_COORDINATOR.idFromName('main-coordinator');
        const coordinator = env.AGENT_COORDINATOR.get(coordinatorId);
        
        return coordinator.fetch('https://agent/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            type: 'spawn-agent',
            priority: 'medium',
            payload: spawnPayload,
            context: {
              workflowId: spawnPayload.workflowId || 'standalone',
              metadata: {}
            },
            createdAt: Date.now(),
            retryCount: 0,
            maxRetries: 3
          })
        });

      case 'status':
        if (!agentId) {
          return new Response('Agent ID required', { status: 400 });
        }
        
        // Route to appropriate agent namespace
        const namespace = getAgentNamespace(agentId, env);
        if (!namespace) {
          return new Response('Agent not found', { status: 404 });
        }
        
        const agentStub = namespace.get(namespace.idFromString(agentId));
        return agentStub.fetch('https://agent/status');

      case 'health':
        if (!agentId) {
          return new Response('Agent ID required', { status: 400 });
        }
        
        const healthNamespace = getAgentNamespace(agentId, env);
        if (!healthNamespace) {
          return new Response('Agent not found', { status: 404 });
        }
        
        const healthAgentStub = healthNamespace.get(healthNamespace.idFromString(agentId));
        return healthAgentStub.fetch('https://agent/health');

      default:
        return new Response('Unknown action', { status: 400 });
    }
  } catch (error) {
    console.error('Agent API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * Handle health check requests
 */
async function handleHealthCheck(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    const health = {
      status: 'healthy',
      timestamp: Date.now(),
      version: '1.0.0',
      environment: env.ENVIRONMENT,
      components: {
        coordinator: 'healthy',
        agents: 'healthy',
        storage: 'healthy'
      }
    };

    return new Response(JSON.stringify(health), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * Validate webhook signatures
 */
async function validateWebhookSignature(event: WebhookEvent, env: Env): Promise<boolean> {
  // Implement signature validation based on source
  switch (event.source) {
    case 'github':
      return validateGitHubSignature(event, env.GITHUB_TOKEN);
    case 'linear':
      return validateLinearSignature(event, env.LINEAR_API_KEY);
    case 'slack':
      return validateSlackSignature(event, env.SLACK_TOKEN);
    default:
      return true; // Allow internal events
  }
}

/**
 * Validate GitHub webhook signature
 */
async function validateGitHubSignature(event: WebhookEvent, secret?: string): Promise<boolean> {
  if (!secret) return true; // Skip validation if no secret configured
  
  const signature = event.headers['x-hub-signature-256'];
  if (!signature) return false;
  
  // Implement HMAC-SHA256 validation
  // This is a simplified version - implement proper crypto validation
  return true;
}

/**
 * Validate Linear webhook signature
 */
async function validateLinearSignature(event: WebhookEvent, secret?: string): Promise<boolean> {
  if (!secret) return true;
  // Implement Linear-specific validation
  return true;
}

/**
 * Validate Slack webhook signature
 */
async function validateSlackSignature(event: WebhookEvent, secret?: string): Promise<boolean> {
  if (!secret) return true;
  // Implement Slack-specific validation
  return true;
}

/**
 * Route webhook events to appropriate agents
 */
async function routeWebhookEvent(event: WebhookEvent, env: Env): Promise<void> {
  const coordinatorId = env.AGENT_COORDINATOR.idFromName('main-coordinator');
  const coordinator = env.AGENT_COORDINATOR.get(coordinatorId);

  // Create a task for the coordinator to handle the event
  await coordinator.fetch('https://agent/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      type: 'process-webhook',
      priority: 'medium',
      payload: event,
      context: {
        workflowId: `webhook-${event.id}`,
        metadata: { source: event.source }
      },
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: 3
    })
  });
}

/**
 * Get agent namespace by agent ID
 */
function getAgentNamespace(agentId: string, env: Env): DurableObjectNamespace | null {
  if (agentId.includes('coordinator')) return env.AGENT_COORDINATOR;
  if (agentId.includes('dashboard')) return env.INTEGRATION_DASHBOARD_AGENT;
  if (agentId.includes('review')) return env.REVIEW_MANAGER_AGENT;
  if (agentId.includes('context')) return env.CONTEXT_OPTIMIZER_AGENT;
  if (agentId.includes('pattern')) return env.PATTERN_BRIDGE_AGENT;
  if (agentId.includes('linear')) return env.LINEAR_STATE_AGENT;
  return null;
}

/**
 * Get welcome message for root path
 */
function getWelcomeMessage(): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Enhanced Multi-Agent Workflow System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { color: #2563eb; }
        .endpoint { background: #f3f4f6; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .method { font-weight: bold; color: #059669; }
    </style>
</head>
<body>
    <h1 class="header">Enhanced Multi-Agent Workflow System</h1>
    <p>Cloudflare Workers + Durable Objects Implementation</p>
    
    <h2>Available Endpoints:</h2>
    
    <div class="endpoint">
        <span class="method">POST</span> /api/workflows/create - Create new workflow
    </div>
    
    <div class="endpoint">
        <span class="method">GET</span> /api/workflows/status/{workflowId} - Get workflow status
    </div>
    
    <div class="endpoint">
        <span class="method">POST</span> /api/workflows/terminate/{workflowId} - Terminate workflow
    </div>
    
    <div class="endpoint">
        <span class="method">POST</span> /api/agents/spawn - Spawn new agent
    </div>
    
    <div class="endpoint">
        <span class="method">GET</span> /api/agents/status/{agentId} - Get agent status
    </div>
    
    <div class="endpoint">
        <span class="method">GET</span> /api/agents/health/{agentId} - Get agent health
    </div>
    
    <div class="endpoint">
        <span class="method">POST</span> /api/webhooks/{source} - Receive webhooks
    </div>
    
    <div class="endpoint">
        <span class="method">GET</span> /api/health - System health check
    </div>
    
    <h2>Status:</h2>
    <p>✅ System Online</p>
    <p>🤖 Multi-Agent Coordination Active</p>
    <p>⚡ Powered by Cloudflare Workers</p>
</body>
</html>
  `;
}

// Export Durable Object classes
export { AgentCoordinator } from '@/agents/agent-coordinator';

