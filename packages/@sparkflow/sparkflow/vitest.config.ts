import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'miniflare',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  }
})

