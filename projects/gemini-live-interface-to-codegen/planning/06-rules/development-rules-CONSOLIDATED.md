# Development Rules & Standards - CONSOLIDATED

## Overview

This document consolidates all development rules, standards, and guidelines for the Gemini Live Interface to CodeGen project, incorporating feedback from critical reviews and establishing realistic, achievable standards.

## 🚨 CRITICAL REVISIONS APPLIED

Based on hard critic reviews, the following critical changes have been made:
- **Timeline**: Revised from 24-hour to 12-week phased approach
- **Technology Stack**: Simplified from Effect TS + Durable Objects to Node.js + PostgreSQL
- **Scope**: Reduced to MVP-focused approach with clear phase boundaries
- **Standards**: Realistic quality targets based on actual constraints

---

## 1. Project Management Rules

### 1.1 Timeline Management
- **RULE**: No phase shall exceed its allocated timeframe without explicit stakeholder approval
- **RULE**: Each phase must have clear, measurable success criteria before proceeding
- **RULE**: Weekly progress reviews are mandatory with documented outcomes
- **RULE**: Scope changes require formal approval and timeline impact assessment

### 1.2 Quality Gates
- **RULE**: Each phase must pass quality gates before proceeding to next phase
- **RULE**: User testing is required at the end of each phase
- **RULE**: Performance benchmarks must be met before production deployment
- **RULE**: Security review is mandatory before any production release

### 1.3 Documentation Standards
- **RULE**: All code must include inline documentation
- **RULE**: API changes require updated documentation before merge
- **RULE**: User-facing features require user guide updates
- **RULE**: Architecture decisions must be documented with rationale

---

## 2. Technical Standards

### 2.1 Code Quality Standards

#### TypeScript/JavaScript Standards
```typescript
// RULE: All functions must have explicit return types
function processVoiceInput(audio: ArrayBuffer): Promise<VoiceResult> {
  // Implementation
}

// RULE: All interfaces must be documented
interface VoiceResult {
  /** Transcribed text from voice input */
  transcript: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Processing time in milliseconds */
  processingTime: number;
}

// RULE: Error handling must be explicit
async function callAPI(): Promise<Result<Data, APIError>> {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      return { success: false, error: new APIError(response.status) };
    }
    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: new APIError('Network error') };
  }
}
```

#### Database Standards
```sql
-- RULE: All tables must have created_at and updated_at timestamps
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RULE: All foreign keys must have proper constraints
ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- RULE: All queries must use parameterized statements
-- Good: SELECT * FROM conversations WHERE user_id = $1
-- Bad: SELECT * FROM conversations WHERE user_id = '${userId}'
```

### 2.2 API Design Standards

#### REST API Standards
```typescript
// RULE: All API responses must follow consistent format
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// RULE: All endpoints must include proper HTTP status codes
app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conversation = await getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found' }
      });
    }
    res.status(200).json({
      success: true,
      data: conversation,
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Server error' }
    });
  }
});
```

#### Function Calling Standards
```typescript
// RULE: All function definitions must include comprehensive metadata
interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ParameterSchema>;
    required: string[];
  };
  examples: FunctionExample[];
  category: 'query' | 'action' | 'monitoring';
  rateLimit?: {
    requests: number;
    window: number; // seconds
  };
}

// RULE: All function implementations must handle errors gracefully
async function createLinearIssue(params: CreateIssueParams): Promise<FunctionResult> {
  try {
    validateParameters(params, createIssueSchema);
    const issue = await linearClient.createIssue(params);
    return {
      success: true,
      data: issue,
      message: `Created issue ${issue.identifier}: ${issue.title}`
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'CREATE_ISSUE_FAILED',
        message: error.message,
        retryable: error.code !== 'VALIDATION_ERROR'
      }
    };
  }
}
```

### 2.3 Voice Processing Standards

#### Voice Input Processing
```typescript
// RULE: Voice processing must include confidence thresholds
interface VoiceProcessingConfig {
  confidenceThreshold: number; // Minimum 0.7 for production
  maxProcessingTime: number;    // Maximum 5 seconds
  fallbackToText: boolean;      // Always true
  noiseReduction: boolean;      // Always true
}

// RULE: All voice processing must have text fallbacks
async function processUserInput(input: AudioBuffer | string): Promise<ProcessedInput> {
  if (input instanceof AudioBuffer) {
    const voiceResult = await processVoiceInput(input);
    if (voiceResult.confidence < CONFIDENCE_THRESHOLD) {
      return {
        type: 'voice_low_confidence',
        transcript: voiceResult.transcript,
        confidence: voiceResult.confidence,
        fallbackRequested: true
      };
    }
    return {
      type: 'voice',
      transcript: voiceResult.transcript,
      confidence: voiceResult.confidence
    };
  }
  return {
    type: 'text',
    transcript: input,
    confidence: 1.0
  };
}
```

### 2.4 State Management Standards

#### Session Management
```typescript
// RULE: All sessions must have expiration and cleanup
interface SessionConfig {
  maxAge: number;        // 30 minutes default
  cleanupInterval: number; // 5 minutes default
  maxSessions: number;   // 1000 default
}

// RULE: Session data must be validated before use
class SessionManager {
  private sessions = new Map<string, ConversationSession>();
  
  getSession(sessionId: string): ConversationSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || this.isExpired(session)) {
      this.sessions.delete(sessionId);
      return null;
    }
    session.lastActivity = new Date();
    return session;
  }
  
  private isExpired(session: ConversationSession): boolean {
    const now = Date.now();
    const lastActivity = session.lastActivity.getTime();
    return (now - lastActivity) > this.config.maxAge;
  }
}
```

---

## 3. Security Standards

### 3.1 Authentication & Authorization
- **RULE**: All API endpoints must require authentication except health checks
- **RULE**: JWT tokens must expire within 1 hour with refresh capability
- **RULE**: API keys must be rotated every 30 days
- **RULE**: All authentication failures must be logged with rate limiting

### 3.2 Data Protection
- **RULE**: All voice data must be encrypted in transit and at rest
- **RULE**: Voice recordings must be automatically deleted after 30 days
- **RULE**: User consent must be obtained before processing voice data
- **RULE**: All PII must be encrypted using AES-256

### 3.3 Input Validation
```typescript
// RULE: All user inputs must be validated and sanitized
import Joi from 'joi';

const createIssueSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(5000).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  assigneeId: Joi.string().uuid().optional()
});

// RULE: Validation errors must provide helpful messages
function validateInput<T>(data: unknown, schema: Joi.Schema): T {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new ValidationError(
      'Invalid input',
      error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
    );
  }
  return value;
}
```

---

## 4. Performance Standards

### 4.1 Response Time Requirements
- **RULE**: Text queries must respond within 2 seconds (95th percentile)
- **RULE**: Voice processing must complete within 5 seconds (95th percentile)
- **RULE**: API calls must timeout after 10 seconds with retry logic
- **RULE**: Database queries must complete within 500ms (95th percentile)

### 4.2 Scalability Requirements
- **RULE**: System must support 100 concurrent users in Phase 1
- **RULE**: Memory usage must not exceed 512MB per instance
- **RULE**: Database connections must be pooled with max 20 connections
- **RULE**: API rate limits must be enforced (100 requests/minute per user)

### 4.3 Monitoring Standards
```typescript
// RULE: All critical operations must be instrumented
import { performance } from 'perf_hooks';

async function instrumentedAPICall<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    // Log successful operation
    logger.info('API operation completed', {
      operation,
      duration,
      success: true
    });
    
    // Alert if operation is slow
    if (duration > SLOW_OPERATION_THRESHOLD) {
      logger.warn('Slow operation detected', { operation, duration });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error('API operation failed', {
      operation,
      duration,
      error: error.message,
      success: false
    });
    throw error;
  }
}
```

---

## 5. Testing Standards

### 5.1 Unit Testing Requirements
- **RULE**: All functions must have unit tests with >80% coverage
- **RULE**: All error paths must be tested
- **RULE**: All API integrations must be mocked in unit tests
- **RULE**: Tests must run in under 30 seconds total

### 5.2 Integration Testing Requirements
- **RULE**: All API endpoints must have integration tests
- **RULE**: Database operations must be tested with real database
- **RULE**: Voice processing pipeline must be tested end-to-end
- **RULE**: Error scenarios must be tested (network failures, API errors)

### 5.3 User Acceptance Testing
- **RULE**: Each phase must include user testing with 5+ users
- **RULE**: Voice recognition must be tested with diverse accents/speech patterns
- **RULE**: Accessibility testing must be performed for all interfaces
- **RULE**: Performance testing must validate response time requirements

---

## 6. Deployment Standards

### 6.1 Environment Management
- **RULE**: All environments must use identical configuration patterns
- **RULE**: Environment variables must be documented and validated
- **RULE**: Database migrations must be reversible
- **RULE**: Deployment must be zero-downtime

### 6.2 Release Management
```typescript
// RULE: All releases must include version information
interface ReleaseInfo {
  version: string;
  buildTime: string;
  gitCommit: string;
  environment: 'development' | 'staging' | 'production';
  features: string[];
  bugFixes: string[];
}

// RULE: Health checks must validate all dependencies
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkGeminiAPI(),
    checkLinearAPI(),
    checkCodeGenAPI()
  ]);
  
  const healthy = checks.every(check => check.status === 'fulfilled');
  const status = healthy ? 200 : 503;
  
  res.status(status).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: checks.map((check, index) => ({
      service: ['database', 'gemini', 'linear', 'codegen'][index],
      status: check.status,
      error: check.status === 'rejected' ? check.reason.message : undefined
    }))
  });
});
```

### 6.3 Monitoring & Alerting
- **RULE**: All production services must have health checks
- **RULE**: Critical errors must trigger immediate alerts
- **RULE**: Performance metrics must be collected and monitored
- **RULE**: Logs must be structured and searchable

---

## 7. Documentation Standards

### 7.1 Code Documentation
```typescript
/**
 * Processes voice input and returns transcribed text with confidence score
 * 
 * @param audioBuffer - Raw audio data in supported format (WebM, OGG)
 * @param options - Processing options including language and quality settings
 * @returns Promise resolving to transcription result with confidence score
 * 
 * @throws {VoiceProcessingError} When audio format is unsupported
 * @throws {APIError} When Gemini API is unavailable
 * 
 * @example
 * ```typescript
 * const result = await processVoiceInput(audioBuffer, { language: 'en' });
 * if (result.confidence > 0.8) {
 *   console.log('High confidence transcription:', result.transcript);
 * }
 * ```
 */
async function processVoiceInput(
  audioBuffer: ArrayBuffer,
  options: VoiceProcessingOptions = {}
): Promise<VoiceProcessingResult> {
  // Implementation
}
```

### 7.2 API Documentation
- **RULE**: All API endpoints must be documented with OpenAPI/Swagger
- **RULE**: All request/response examples must be provided
- **RULE**: All error codes must be documented with resolution steps
- **RULE**: Rate limits and authentication requirements must be clearly stated

### 7.3 User Documentation
- **RULE**: All user-facing features must have usage examples
- **RULE**: Voice commands must be documented with pronunciation guides
- **RULE**: Troubleshooting guides must be provided for common issues
- **RULE**: Getting started guide must enable users to complete first task in <5 minutes

---

## 8. Quality Assurance Rules

### 8.1 Code Review Requirements
- **RULE**: All code must be reviewed by at least one other developer
- **RULE**: Security-sensitive code must be reviewed by security expert
- **RULE**: Performance-critical code must include performance analysis
- **RULE**: All review comments must be addressed before merge

### 8.2 Automated Quality Checks
```typescript
// RULE: All commits must pass automated quality gates
{
  "scripts": {
    "lint": "eslint src/ --ext .ts,.js",
    "type-check": "tsc --noEmit",
    "test": "jest --coverage",
    "security-check": "npm audit --audit-level moderate",
    "pre-commit": "npm run lint && npm run type-check && npm run test"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run pre-commit",
      "pre-push": "npm run security-check"
    }
  }
}
```

### 8.3 Performance Monitoring
- **RULE**: All production deployments must include performance monitoring
- **RULE**: Performance regressions must be detected within 1 hour
- **RULE**: Critical performance issues must be resolved within 4 hours
- **RULE**: Performance reports must be generated weekly

---

## 9. Error Handling Standards

### 9.1 Error Classification
```typescript
// RULE: All errors must be properly classified
enum ErrorCategory {
  USER_ERROR = 'user_error',           // User input issues
  SYSTEM_ERROR = 'system_error',       // Internal system issues
  EXTERNAL_ERROR = 'external_error',   // Third-party API issues
  NETWORK_ERROR = 'network_error',     // Connectivity issues
  SECURITY_ERROR = 'security_error'    // Authentication/authorization issues
}

interface StandardError {
  code: string;
  message: string;
  category: ErrorCategory;
  retryable: boolean;
  userMessage: string;
  details?: any;
  timestamp: string;
}
```

### 9.2 Error Recovery
- **RULE**: All retryable errors must implement exponential backoff
- **RULE**: Circuit breakers must be implemented for external API calls
- **RULE**: Graceful degradation must be provided when possible
- **RULE**: User-friendly error messages must be provided for all error types

### 9.3 Error Logging
```typescript
// RULE: All errors must be logged with sufficient context
logger.error('Voice processing failed', {
  userId: session.userId,
  sessionId: session.id,
  audioSize: audioBuffer.byteLength,
  processingTime: Date.now() - startTime,
  error: {
    code: error.code,
    message: error.message,
    stack: error.stack
  },
  context: {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    timestamp: new Date().toISOString()
  }
});
```

---

## 10. Compliance & Legal Standards

### 10.1 Data Privacy (GDPR)
- **RULE**: User consent must be obtained before processing voice data
- **RULE**: Users must be able to request data deletion within 30 days
- **RULE**: Data processing purposes must be clearly documented
- **RULE**: Data retention policies must be enforced automatically

### 10.2 Accessibility (WCAG 2.1 AA)
- **RULE**: All web interfaces must be keyboard navigable
- **RULE**: All images must have alt text
- **RULE**: Color contrast must meet WCAG AA standards
- **RULE**: Screen reader compatibility must be tested

### 10.3 Security Compliance
- **RULE**: All data transmission must use TLS 1.3 or higher
- **RULE**: API keys must be stored in secure key management system
- **RULE**: Security vulnerabilities must be patched within 48 hours
- **RULE**: Security audits must be performed quarterly

---

## 11. Maintenance Standards

### 11.1 Dependency Management
- **RULE**: Dependencies must be updated monthly
- **RULE**: Security vulnerabilities in dependencies must be patched within 24 hours
- **RULE**: Major version updates must be tested in staging environment
- **RULE**: Dependency licenses must be compatible with project license

### 11.2 Database Maintenance
- **RULE**: Database backups must be performed daily
- **RULE**: Backup restoration must be tested monthly
- **RULE**: Database performance must be monitored continuously
- **RULE**: Query optimization must be performed quarterly

### 11.3 Infrastructure Maintenance
- **RULE**: Server patches must be applied within 7 days of release
- **RULE**: Capacity planning must be reviewed monthly
- **RULE**: Disaster recovery procedures must be tested quarterly
- **RULE**: Infrastructure costs must be optimized monthly

---

## 12. Communication Standards

### 12.1 Team Communication
- **RULE**: Daily standups must include progress, blockers, and next steps
- **RULE**: Weekly retrospectives must identify improvement opportunities
- **RULE**: All decisions must be documented with rationale
- **RULE**: Stakeholder updates must be provided weekly

### 12.2 User Communication
- **RULE**: System maintenance must be announced 24 hours in advance
- **RULE**: Service disruptions must be communicated within 15 minutes
- **RULE**: Feature releases must include user-facing changelog
- **RULE**: User feedback must be acknowledged within 24 hours

### 12.3 Documentation Communication
- **RULE**: All breaking changes must be documented before release
- **RULE**: Migration guides must be provided for major updates
- **RULE**: API changes must be communicated 30 days in advance
- **RULE**: Deprecation notices must be provided 90 days in advance

---

## 13. Success Metrics & KPIs

### 13.1 Technical Metrics
- **Response Time**: <2s for text, <5s for voice (95th percentile)
- **Uptime**: >99.5% availability
- **Error Rate**: <1% of all requests
- **API Success Rate**: >95% for all external API calls

### 13.2 User Experience Metrics
- **Voice Recognition Accuracy**: >85% for common commands
- **User Satisfaction**: >7/10 NPS score
- **Task Completion Rate**: >90% for primary use cases
- **User Retention**: >75% monthly active users

### 13.3 Business Metrics
- **User Adoption**: 50% of CodeGen users try interface within 60 days
- **Feature Usage**: >3 interactions per user per week
- **Support Tickets**: <5% of users require support
- **Time Savings**: 40% reduction in manual project management time

---

## 14. Enforcement & Compliance

### 14.1 Automated Enforcement
- **RULE**: CI/CD pipeline must enforce all code quality standards
- **RULE**: Deployment must be blocked if quality gates fail
- **RULE**: Security scans must be performed on every commit
- **RULE**: Performance tests must pass before production deployment

### 14.2 Manual Review Process
- **RULE**: Architecture decisions must be reviewed by technical lead
- **RULE**: Security changes must be reviewed by security expert
- **RULE**: User experience changes must be reviewed by UX expert
- **RULE**: Performance changes must be reviewed by performance expert

### 14.3 Compliance Monitoring
- **RULE**: Compliance metrics must be tracked and reported monthly
- **RULE**: Non-compliance issues must be addressed within 48 hours
- **RULE**: Compliance training must be provided to all team members
- **RULE**: Compliance audits must be performed quarterly

---

## 15. Continuous Improvement

### 15.1 Learning & Adaptation
- **RULE**: Post-incident reviews must identify improvement opportunities
- **RULE**: User feedback must be incorporated into development planning
- **RULE**: Performance data must inform optimization priorities
- **RULE**: Industry best practices must be evaluated quarterly

### 15.2 Innovation & Experimentation
- **RULE**: 20% of development time may be allocated to experimental features
- **RULE**: A/B testing must be used for user experience improvements
- **RULE**: New technologies must be evaluated in sandbox environment
- **RULE**: Innovation proposals must include risk assessment

### 15.3 Knowledge Sharing
- **RULE**: Technical learnings must be documented and shared
- **RULE**: Best practices must be updated based on project experience
- **RULE**: Team knowledge sessions must be held monthly
- **RULE**: External conference learnings must be shared with team

---

## Conclusion

These consolidated rules and standards provide a comprehensive framework for developing the Gemini Live Interface to CodeGen project. They incorporate lessons learned from critical reviews and establish realistic, achievable standards that support project success while maintaining high quality.

All team members are expected to follow these standards, and compliance will be monitored through automated tools and manual reviews. Regular updates to these standards will ensure they remain relevant and effective as the project evolves.

**Document Version**: 1.0 (Consolidated)  
**Last Updated**: 2025-05-22  
**Next Review**: 2025-06-22

