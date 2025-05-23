import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'miniflare',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    testTimeout: 30000,
    hookTimeout: 10000,
    // Separate test patterns for different test types
    include: [
      'tests/**/*.test.ts'
    ],
    // Environment-specific configurations
    environmentOptions: {
      miniflare: {
        // Miniflare options for Cloudflare Workers testing
        compatibilityDate: '2023-12-01',
        compatibilityFlags: ['nodejs_compat'],
        modules: true,
        scriptPath: './src/index.ts',
        // Mock bindings for testing
        bindings: {
          ENVIRONMENT: 'test'
        },
        kvNamespaces: ['CONFIG_KV'],
        r2Buckets: ['LOGS_BUCKET'],
        durableObjects: {
          AGENT_COORDINATOR: 'AgentCoordinator',
          STATE_MANAGER: 'StateManager',
          INTEGRATION_DASHBOARD_AGENT: 'IntegrationDashboardAgent',
          REVIEW_MANAGER_AGENT: 'ReviewManagerAgent',
          CONTEXT_OPTIMIZER_AGENT: 'ContextOptimizerAgent',
          PATTERN_BRIDGE_AGENT: 'PatternBridgeAgent',
          LINEAR_STATE_AGENT: 'LinearStateAgent'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});

