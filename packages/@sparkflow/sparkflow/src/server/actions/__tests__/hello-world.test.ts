// Tests for Hello World Server Action
import { describe, it, expect } from 'vitest'
import { Effect } from 'effect'
import { helloWorldActionEffect } from '../hello-world.js'
import { ValidationError } from '../../errors/index.js'
import { DatabaseServiceLive } from '../../services/database.js'

describe('Hello World Server Action', () => {
  describe('Input Validation', () => {
    it('should reject null input', async () => {
      const result = await Effect.runPromise(
        helloWorldActionEffect(null).pipe(
          Effect.provide(DatabaseServiceLive),
          Effect.flip
        )
      )
      
      expect(result).toBeInstanceOf(ValidationError)
      expect(result.message).toBe('Input must be an object')
    })

    it('should reject undefined input', async () => {
      const result = await Effect.runPromise(
        helloWorldActionEffect(undefined).pipe(
          Effect.provide(DatabaseServiceLive),
          Effect.flip
        )
      )
      
      expect(result).toBeInstanceOf(ValidationError)
      expect(result.message).toBe('Input must be an object')
    })

    it('should reject input without name field', async () => {
      const result = await Effect.runPromise(
        helloWorldActionEffect({}).pipe(
          Effect.provide(DatabaseServiceLive),
          Effect.flip
        )
      )
      
      expect(result).toBeInstanceOf(ValidationError)
      expect(result.message).toBe('Name is required and must be a string')
    })

    it('should reject empty name', async () => {
      const result = await Effect.runPromise(
        helloWorldActionEffect({ name: '' }).pipe(
          Effect.provide(DatabaseServiceLive),
          Effect.flip
        )
      )
      
      expect(result).toBeInstanceOf(ValidationError)
      expect(result.message).toBe('Name cannot be empty')
    })

    it('should reject non-string name', async () => {
      const result = await Effect.runPromise(
        helloWorldActionEffect({ name: 123 }).pipe(
          Effect.provide(DatabaseServiceLive),
          Effect.flip
        )
      )
      
      expect(result).toBeInstanceOf(ValidationError)
      expect(result.message).toBe('Name is required and must be a string')
    })
  })

  describe('Successful Execution', () => {
    it('should return greeting for valid input', async () => {
      const result = await Effect.runPromise(
        helloWorldActionEffect({ name: 'World' }).pipe(
          Effect.provide(DatabaseServiceLive)
        )
      )
      
      expect(result.success).toBe(true)
      expect(result.message).toBe('Hello, World! Welcome to Sparkflow with EffectTS.')
      expect(result.timestamp).toBeDefined()
      expect(typeof result.timestamp).toBe('string')
    })

    it('should trim whitespace from name', async () => {
      const result = await Effect.runPromise(
        helloWorldActionEffect({ name: '  Alice  ' }).pipe(
          Effect.provide(DatabaseServiceLive)
        )
      )
      
      expect(result.message).toBe('Hello, Alice! Welcome to Sparkflow with EffectTS.')
    })

    it('should handle special characters in name', async () => {
      const result = await Effect.runPromise(
        helloWorldActionEffect({ name: 'José María' }).pipe(
          Effect.provide(DatabaseServiceLive)
        )
      )
      
      expect(result.message).toBe('Hello, José María! Welcome to Sparkflow with EffectTS.')
    })
  })

  describe('Timestamp Validation', () => {
    it('should return valid ISO timestamp', async () => {
      const result = await Effect.runPromise(
        helloWorldActionEffect({ name: 'Test' }).pipe(
          Effect.provide(DatabaseServiceLive)
        )
      )
      
      const timestamp = new Date(result.timestamp)
      expect(timestamp.toISOString()).toBe(result.timestamp)
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 1000) // Within last second
    })
  })
})

