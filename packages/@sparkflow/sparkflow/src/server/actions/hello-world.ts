// Hello World Server Action with EffectTS
import { Effect } from 'effect'
import { DatabaseService } from '../services/database.js'
import { ValidationError, ServerActionError, DatabaseError } from '../errors/index.js'
import { AppLayer } from '../runtime/index.js'

// Input validation schema
interface HelloWorldInput {
  name: string
}

// Output type
interface HelloWorldOutput {
  message: string
  timestamp: string
  success: boolean
}

// Validate input
const validateInput = (input: unknown): Effect.Effect<HelloWorldInput, ValidationError> =>
  Effect.gen(function* () {
    if (!input || typeof input !== 'object') {
      yield* Effect.fail(new ValidationError({ 
        message: 'Input must be an object',
        field: 'input'
      }))
    }
    
    const typedInput = input as Record<string, unknown>
    
    if (!typedInput.name || typeof typedInput.name !== 'string') {
      yield* Effect.fail(new ValidationError({ 
        message: 'Name is required and must be a string',
        field: 'name'
      }))
    }
    
    const name = typedInput.name as string
    
    if (name.trim().length === 0) {
      yield* Effect.fail(new ValidationError({ 
        message: 'Name cannot be empty',
        field: 'name'
      }))
    }
    
    return { name: name.trim() }
  })

// Main server action logic
const helloWorldLogic = (input: HelloWorldInput): Effect.Effect<HelloWorldOutput, DatabaseError | ServerActionError, DatabaseService> =>
  Effect.gen(function* () {
    const db = yield* DatabaseService
    const timestamp = new Date().toISOString()
    
    // Simulate storing the greeting in the database
    yield* db.query(
      'INSERT INTO greetings (name, timestamp) VALUES (?, ?)',
      [input.name, timestamp]
    )
    
    return {
      message: `Hello, ${input.name}! Welcome to Sparkflow with EffectTS.`,
      timestamp,
      success: true
    }
  })

// Server Action implementation
export const helloWorldAction = (input: unknown) =>
  Effect.gen(function* () {
    const validatedInput = yield* validateInput(input)
    const result = yield* helloWorldLogic(validatedInput)
    return result
  }).pipe(
    Effect.provide(AppLayer),
    Effect.runPromise
  )

// Export for testing
export const helloWorldActionEffect = (input: unknown) =>
  Effect.gen(function* () {
    const validatedInput = yield* validateInput(input)
    const result = yield* helloWorldLogic(validatedInput)
    return result
  })
