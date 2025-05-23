import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'miniflare',
    environmentOptions: {
      // Miniflare options for Cloudflare Workers environment
      modules: true,
      scriptPath: './src/workers/event-router.ts',
      wranglerConfigPath: './wrangler.toml',
      wranglerConfigEnv: 'development',
      // Mock bindings for testing
      bindings: {
        ENVIRONMENT: 'test',
        MAX_EVENT_SIZE: '1048576',
        DEFAULT_RETRY_ATTEMPTS: '3',
        DEFAULT_RETRY_DELAY: '1000',
        MAX_QUEUE_SIZE: '10000',
        RATE_LIMIT_WINDOW: '60000',
        DEFAULT_RATE_LIMIT: '1000',
        GITHUB_WEBHOOK_SECRET: 'test-github-secret',
        LINEAR_WEBHOOK_SECRET: 'test-linear-secret',
        SLACK_WEBHOOK_SECRET: 'test-slack-secret',
        AGENT_API_KEY: 'test-agent-api-key'
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/workers': path.resolve(__dirname, './src/workers'),
      '@/storage': path.resolve(__dirname, './src/storage'),
      '@/analytics': path.resolve(__dirname, './src/analytics'),
      '@/streaming': path.resolve(__dirname, './src/streaming')
    }
  },
  esbuild: {
    target: 'es2022'
  }
});

