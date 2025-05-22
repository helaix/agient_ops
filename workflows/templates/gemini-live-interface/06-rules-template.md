# Rules Template
## Gemini Live Interface Development

### Development Standards & Guidelines
**Project**: [Project Name]
**Last Updated**: [Date]
**Version**: [Version Number]

## Code Quality Standards

### TypeScript Standards
```typescript
// Use strict TypeScript configuration
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### Naming Conventions
- **Variables & Functions**: camelCase (`getUserData`, `isVoiceActive`)
- **Classes & Interfaces**: PascalCase (`VoiceProcessor`, `ApiResponse`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- **Files**: kebab-case (`voice-processor.ts`, `api-client.ts`)
- **Directories**: kebab-case (`voice-interface`, `api-integration`)

#### Code Structure
```typescript
// File structure template
import { /* external dependencies */ } from 'external-lib';
import { /* internal dependencies */ } from '../internal-module';
import type { /* type imports */ } from './types';

// Constants
const DEFAULT_TIMEOUT = 5000;

// Types and interfaces
interface VoiceCommand {
  intent: string;
  parameters: Record<string, unknown>;
  confidence: number;
}

// Main implementation
export class VoiceProcessor {
  // Public methods first
  public processCommand(input: string): Promise<VoiceCommand> {
    // Implementation
  }

  // Private methods last
  private validateInput(input: string): boolean {
    // Implementation
  }
}
```

### Effect TS Standards

#### Effect Usage Patterns
```typescript
import { Effect, pipe } from 'effect';

// Preferred: Use pipe for chaining operations
const processVoiceInput = (input: string) =>
  pipe(
    Effect.succeed(input),
    Effect.flatMap(validateInput),
    Effect.flatMap(parseIntent),
    Effect.flatMap(executeCommand),
    Effect.catchAll(handleError)
  );

// Error handling with Effect
const handleApiCall = (request: ApiRequest) =>
  pipe(
    Effect.tryPromise(() => fetch(request.url)),
    Effect.flatMap(response => 
      response.ok 
        ? Effect.succeed(response)
        : Effect.fail(new ApiError('Request failed'))
    ),
    Effect.timeout('5 seconds'),
    Effect.retry({ times: 3, delay: '1 second' })
  );
```

#### Service Layer Pattern
```typescript
// Define service interface
interface VoiceService {
  readonly processVoice: (input: AudioData) => Effect.Effect<VoiceCommand, VoiceError>;
  readonly synthesizeSpeech: (text: string) => Effect.Effect<AudioData, SynthesisError>;
}

// Implement service
const VoiceServiceLive = Layer.succeed(
  VoiceService,
  VoiceService.of({
    processVoice: (input) => /* implementation */,
    synthesizeSpeech: (text) => /* implementation */
  })
);
```

## API Integration Standards

### Authentication & Security
```typescript
// API key management
const API_KEYS = {
  GEMINI: process.env.GEMINI_API_KEY!,
  CODEGEN: process.env.CODEGEN_API_KEY!,
  LINEAR: process.env.LINEAR_API_KEY!
} as const;

// Secure header construction
const createAuthHeaders = (apiKey: string) => ({
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'User-Agent': 'GeminiLiveInterface/1.0'
});
```

### Error Handling Standards
```typescript
// Standardized error types
class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly service: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error handling pattern
const handleApiError = (error: unknown): Effect.Effect<never, ApiError> => {
  if (error instanceof ApiError) {
    return Effect.fail(error);
  }
  return Effect.fail(new ApiError('Unknown error', 500, 'unknown'));
};
```

### Rate Limiting & Retry Logic
```typescript
// Rate limiting configuration
const RATE_LIMITS = {
  GEMINI: { requests: 100, window: '1 minute' },
  CODEGEN: { requests: 1000, window: '1 hour' },
  LINEAR: { requests: 500, window: '1 hour' }
} as const;

// Retry configuration
const RETRY_CONFIG = {
  times: 3,
  delay: (attempt: number) => `${Math.pow(2, attempt)} seconds`,
  schedule: Schedule.exponential('1 second')
};
```

## Voice Interface Standards

### Voice Processing Guidelines
```typescript
// Voice command structure
interface VoiceCommand {
  readonly intent: string;
  readonly entities: Record<string, string>;
  readonly confidence: number;
  readonly timestamp: Date;
}

// Voice response structure
interface VoiceResponse {
  readonly text: string;
  readonly audioUrl?: string;
  readonly actions?: Array<{
    type: string;
    data: unknown;
  }>;
}
```

### Conversation State Management
```typescript
// Conversation context
interface ConversationContext {
  readonly sessionId: string;
  readonly userId: string;
  readonly history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  readonly state: Record<string, unknown>;
}

// State persistence rules
const persistConversationState = (context: ConversationContext) =>
  pipe(
    Effect.succeed(context),
    Effect.flatMap(validateContext),
    Effect.flatMap(saveToStorage),
    Effect.timeout('2 seconds')
  );
```

## Testing Standards

### Unit Testing Requirements
```typescript
// Test structure template
describe('VoiceProcessor', () => {
  describe('processCommand', () => {
    it('should parse valid voice commands', async () => {
      // Arrange
      const processor = new VoiceProcessor();
      const input = 'create a new issue';
      
      // Act
      const result = await processor.processCommand(input);
      
      // Assert
      expect(result.intent).toBe('create_issue');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should handle invalid input gracefully', async () => {
      // Test error cases
    });
  });
});
```

### Integration Testing Standards
```typescript
// API integration tests
describe('CodeGen API Integration', () => {
  beforeEach(() => {
    // Setup test environment
  });

  it('should create issues successfully', async () => {
    // Test real API integration
  });

  afterEach(() => {
    // Cleanup test data
  });
});
```

### Test Coverage Requirements
- **Minimum Coverage**: 80% overall
- **Critical Paths**: 95% coverage required
- **Error Handling**: 100% coverage required
- **API Integration**: 90% coverage required

## Security Standards

### Data Protection
```typescript
// Sensitive data handling
const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
};

// API key protection
const redactApiKey = (key: string): string => {
  return key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : '[REDACTED]';
};
```

### Input Validation
```typescript
// Voice input validation
const validateVoiceInput = (input: string): Effect.Effect<string, ValidationError> => {
  if (!input || input.trim().length === 0) {
    return Effect.fail(new ValidationError('Empty input'));
  }
  if (input.length > 1000) {
    return Effect.fail(new ValidationError('Input too long'));
  }
  return Effect.succeed(input.trim());
};
```

### Authentication Rules
- **API Keys**: Store in environment variables only
- **Session Management**: Use secure, httpOnly cookies
- **Token Expiration**: Implement automatic token refresh
- **Rate Limiting**: Implement per-user rate limiting

## Performance Standards

### Response Time Requirements
- **Voice Processing**: < 2 seconds end-to-end
- **Text Processing**: < 500ms
- **API Calls**: < 3 seconds with retries
- **State Persistence**: < 1 second

### Memory Management
```typescript
// Memory-efficient patterns
const processLargeDataset = (data: Array<unknown>) =>
  pipe(
    Effect.succeed(data),
    Effect.flatMap(chunk => 
      Effect.forEach(chunk, processItem, { 
        concurrency: 5,
        batching: true 
      })
    )
  );
```

### Caching Strategy
```typescript
// Cache configuration
const CACHE_CONFIG = {
  voice_responses: { ttl: '5 minutes', maxSize: 100 },
  api_responses: { ttl: '1 hour', maxSize: 1000 },
  user_preferences: { ttl: '24 hours', maxSize: 10000 }
} as const;
```

## Deployment Standards

### Environment Configuration
```typescript
// Environment-specific settings
const CONFIG = {
  development: {
    logLevel: 'debug',
    apiTimeout: 10000,
    retryAttempts: 1
  },
  staging: {
    logLevel: 'info',
    apiTimeout: 5000,
    retryAttempts: 2
  },
  production: {
    logLevel: 'warn',
    apiTimeout: 3000,
    retryAttempts: 3
  }
} as const;
```

### Monitoring & Logging
```typescript
// Structured logging
const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }));
  },
  error: (error: Error, context?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: 'error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    }));
  }
};
```

## Documentation Standards

### Code Documentation
```typescript
/**
 * Processes voice input and extracts intent and entities
 * 
 * @param input - Raw voice input string
 * @param context - Current conversation context
 * @returns Promise resolving to parsed voice command
 * 
 * @example
 * ```typescript
 * const command = await processVoiceInput(
 *   "create a new issue for the login bug",
 *   conversationContext
 * );
 * console.log(command.intent); // "create_issue"
 * ```
 */
export const processVoiceInput = async (
  input: string,
  context: ConversationContext
): Promise<VoiceCommand> => {
  // Implementation
};
```

### API Documentation
- **OpenAPI Specs**: All APIs must have OpenAPI 3.0 specifications
- **Examples**: Include request/response examples
- **Error Codes**: Document all possible error responses
- **Rate Limits**: Document rate limiting policies

## Git & Version Control Standards

### Branch Naming
- **Feature**: `feature/voice-processing-enhancement`
- **Bug Fix**: `bugfix/voice-recognition-accuracy`
- **Hotfix**: `hotfix/critical-api-timeout`
- **Release**: `release/v1.2.0`

### Commit Messages
```
feat(voice): add multi-language support for voice commands

- Implement language detection for voice input
- Add support for Spanish and French
- Update voice processing pipeline
- Add language-specific error messages

Closes #123
```

### Pull Request Requirements
- [ ] **Code Review**: Minimum 2 approvals required
- [ ] **Tests**: All tests passing
- [ ] **Documentation**: Updated documentation
- [ ] **Performance**: No performance regressions
- [ ] **Security**: Security review completed

## Quality Assurance Rules

### Definition of Done
- [ ] **Functionality**: All acceptance criteria met
- [ ] **Testing**: Unit and integration tests passing
- [ ] **Performance**: Performance requirements met
- [ ] **Security**: Security review completed
- [ ] **Documentation**: Code and API documentation updated
- [ ] **Accessibility**: Accessibility requirements met
- [ ] **Code Review**: Peer review completed and approved

### Release Criteria
- [ ] **Test Coverage**: Minimum 80% coverage achieved
- [ ] **Performance**: All performance benchmarks met
- [ ] **Security**: Security scan passed
- [ ] **Documentation**: User and technical documentation complete
- [ ] **Deployment**: Deployment procedures validated
- [ ] **Rollback**: Rollback procedures tested

---
**Document Version**: 1.0
**Standards Owner**: [Technical Lead Name]
**Last Review**: [Date]
**Next Review**: [Review Date]

