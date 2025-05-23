// Database service with EffectTS
import { Effect, Context, Layer } from 'effect'
import { DatabaseError } from '../errors/index.js'

export interface DatabaseService {
  readonly query: (sql: string, params?: unknown[]) => Effect.Effect<unknown[], DatabaseError>
}

export const DatabaseService = Context.GenericTag<DatabaseService>('DatabaseService')

export const DatabaseServiceLive = Layer.effect(
  DatabaseService,
  Effect.gen(function* () {
    return DatabaseService.of({
      query: (sql: string, params: unknown[] = []) =>
        Effect.tryPromise({
          try: async () => {
            // In a real implementation, this would use the Cloudflare D1 binding
            // For now, we'll simulate a database response
            console.log(`Executing SQL: ${sql} with params:`, params)
            
            // Simulate a greeting query response
            if (sql.includes('greetings')) {
              return [{ 
                id: 1, 
                name: params[0] || 'World', 
                timestamp: new Date().toISOString(),
                greeting: `Hello, ${params[0] || 'World'}!`
              }]
            }
            
            return []
          },
          catch: (error) => new DatabaseError({ cause: error })
        })
    })
  })
)

