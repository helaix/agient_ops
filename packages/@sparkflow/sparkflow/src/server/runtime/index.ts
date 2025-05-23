// Effect runtime configuration
import { Effect, Layer, Runtime } from 'effect'
import { DatabaseServiceLive } from '../services/database.js'

// Create the main application layer
export const AppLayer = Layer.mergeAll(
  DatabaseServiceLive
  // Additional service layers can be added here
)

// Create the runtime with all services
export const AppRuntime = Runtime.defaultRuntime
