// Worker resource definition for Sparkflow application
import { Worker } from '@alchemy/cloudflare'
import { sparkflowDatabase } from '../databases/sparkflow-db.js'
import { sparkflowStorage } from '../storage/sparkflow-storage.js'

export const sparkflowWorker = new Worker('sparkflow-app', {
  name: 'sparkflow-app',
  scriptPath: '../@sparkflow/sparkflow/dist/worker.js',
  bindings: {
    DB: sparkflowDatabase,
    R2: sparkflowStorage
  },
  routes: [
    { pattern: 'app.sparkflow.dev/*', zone: 'sparkflow.dev' }
  ],
  environment: {
    NODE_ENV: 'production'
  },
  secrets: {
    AUTH_SECRET_KEY: process.env.AUTH_SECRET_KEY || 'default-secret-key-change-in-production'
  }
})

