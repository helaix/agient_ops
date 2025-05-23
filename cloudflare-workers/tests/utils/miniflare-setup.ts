import { Miniflare } from 'miniflare';
import path from 'path';

let miniflare: Miniflare | null = null;

export async function setupMiniflare(): Promise<void> {
  if (miniflare) {
    await teardownMiniflare();
  }

  miniflare = new Miniflare({
    // Worker script configuration
    scriptPath: path.resolve(__dirname, '../../src/index.ts'),
    modules: true,
    compatibilityDate: '2023-12-01',
    compatibilityFlags: ['nodejs_compat'],
    
    // Environment bindings
    bindings: {
      ENVIRONMENT: 'test',
      LINEAR_API_KEY: 'test-linear-key',
      GITHUB_TOKEN: 'test-github-token',
      SLACK_TOKEN: 'test-slack-token'
    },
    
    // KV Namespaces
    kvNamespaces: ['CONFIG_KV'],
    
    // R2 Buckets
    r2Buckets: ['LOGS_BUCKET'],
    
    // Durable Objects
    durableObjects: {
      AGENT_COORDINATOR: 'AgentCoordinator',
      STATE_MANAGER: 'StateManager',
      INTEGRATION_DASHBOARD_AGENT: 'IntegrationDashboardAgent',
      REVIEW_MANAGER_AGENT: 'ReviewManagerAgent',
      CONTEXT_OPTIMIZER_AGENT: 'ContextOptimizerAgent',
      PATTERN_BRIDGE_AGENT: 'PatternBridgeAgent',
      LINEAR_STATE_AGENT: 'LinearStateAgent'
    },
    
    // Analytics Engine (mock)
    analyticsEngineDatasets: ['METRICS'],
    
    // Logging
    log: new console.Console(process.stdout, process.stderr),
    
    // Development options
    liveReload: false,
    upstream: undefined
  });

  // Wait for Miniflare to be ready
  await miniflare.ready;
  
  console.log('🚀 Miniflare setup complete');
}

export async function teardownMiniflare(): Promise<void> {
  if (miniflare) {
    await miniflare.dispose();
    miniflare = null;
    console.log('🛑 Miniflare torn down');
  }
}

export function getMiniflare(): Miniflare {
  if (!miniflare) {
    throw new Error('Miniflare not initialized. Call setupMiniflare() first.');
  }
  return miniflare;
}

export async function getTestEnvironment() {
  const mf = getMiniflare();
  
  return {
    // Get KV namespace for testing
    getKV: (name: string) => mf.getKVNamespace(name),
    
    // Get R2 bucket for testing
    getR2: (name: string) => mf.getR2Bucket(name),
    
    // Get Durable Object for testing
    getDurableObject: (name: string, id?: string) => {
      const namespace = mf.getDurableObjectNamespace(name);
      const objectId = id ? namespace.idFromString(id) : namespace.newUniqueId();
      return namespace.get(objectId);
    },
    
    // Make requests to the worker
    fetch: (input: RequestInfo, init?: RequestInit) => mf.dispatchFetch(input, init),
    
    // Get environment bindings
    getBindings: () => ({
      ENVIRONMENT: 'test',
      LINEAR_API_KEY: 'test-linear-key',
      GITHUB_TOKEN: 'test-github-token',
      SLACK_TOKEN: 'test-slack-token'
    })
  };
}

