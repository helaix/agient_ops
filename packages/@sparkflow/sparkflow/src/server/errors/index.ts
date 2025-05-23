// Error definitions for EffectTS
import { Data } from 'effect'

export class DatabaseError extends Data.TaggedError('DatabaseError')<{
  cause: unknown
}> {}

export class ValidationError extends Data.TaggedError('ValidationError')<{
  message: string
  field?: string
}> {}

export class ServerActionError extends Data.TaggedError('ServerActionError')<{
  message: string
  cause?: unknown
}> {}

