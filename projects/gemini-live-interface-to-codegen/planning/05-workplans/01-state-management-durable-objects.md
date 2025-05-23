# State Management with In-Memory Sessions Workplan (REVISED)

## 🚨 CRITICAL REVISION NOTICE

**ORIGINAL**: Durable Objects (over-engineered for 24-hour timeline)  
**REVISED**: Simple in-memory session management with Node.js  
**TIMELINE**: Week 1 of 8-12 week implementation (not 24 hours)

## Pattern Overview
Implementation of **simplified state management** using in-memory sessions and basic persistence to maintain conversation state, project context, and user sessions for the Gemini Live Interface to CodeGen system MVP.

## Components

### 1. **In-Memory Session Management**
   * Simple Map-based session storage
   * Conversation history and context (limited retention)
   * User session lifecycle management
   * Basic session cleanup and timeout handling

### 2. **Simple Project Context Storage**
   * Active project references and metadata
   * Basic Linear issue tracking state
   * User preferences (minimal set)
   * Session-scoped project continuity

### 3. **Basic User Session Handling**
   * Session ID generation and validation
   * Simple authentication state tracking
   * Connection state management
   * Session timeout and cleanup

### 4. **Optional Redis Integration**
   * Optional Redis for session persistence
   * Simple key-value storage patterns
   * Basic session backup and recovery
   * Horizontal scaling preparation

### 5. **Simple Data Persistence**
   * JSON serialization for session data
   * Basic file-based backup (optional)
   * Simple data validation
   * Minimal data migration support

## Implementation Guidelines

### 1. **Preparation Phase**
   * Set up Node.js project with Express
   * Design simple session data structures
   * Plan basic session lifecycle patterns
   * Choose session storage approach (Map vs Redis)

### 2. **Core Implementation**
   * Create SessionManager class with Map storage
   * Implement basic conversation state tracking
   * Build simple project context storage
   * Develop session cleanup mechanisms

### 3. **Integration Phase**
   * Connect with Express middleware
   * Integrate with WebSocket connections
   * Add basic authentication integration
   * Implement simple monitoring

### 4. **Enhancement Phase**
   * Add optional Redis integration
   * Implement basic session persistence
   * Add session analytics and cleanup
   * Optimize memory usage patterns

## Prerequisites

### Technical Requirements
- [ ] Node.js 18+ development environment
- [ ] Express.js framework knowledge
- [ ] Basic TypeScript understanding
- [ ] Optional: Redis server for persistence
- [ ] Understanding of session management patterns

### Knowledge Requirements
- [ ] Session management best practices
- [ ] In-memory data structure patterns
- [ ] Basic authentication flows
- [ ] Simple state lifecycle management
- [ ] Node.js memory management basics

### Dependencies
- [ ] Basic Authentication workplan (for user identity)
- [ ] Simple Function Calling Framework workplan
- [ ] Node.js project structure setup

## Technical Specifications

### Simple Session Schema Design
```typescript
interface ConversationSession {
  id: string;
  userId: string;
  createdAt: Date;
  lastActivity: Date;
  messages: ConversationMessage[];
  context: SimpleProjectContext;
  isActive: boolean;
}

interface SimpleProjectContext {
  activeProject?: {
    id: string;
    name: string;
    type: 'codegen' | 'linear';
  };
  recentIssues: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  userPreferences: {
    language: string;
    responseFormat: 'brief' | 'detailed';
  };
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    apiCalls?: string[];
    processingTime?: number;
  };
}
```

### Simple Session Manager Implementation
```typescript
class SimpleSessionManager {
  private sessions = new Map<string, ConversationSession>();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_SESSIONS = 1000; // Memory limit
  
  createSession(userId: string): ConversationSession {
    const session: ConversationSession = {
      id: this.generateSessionId(),
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      messages: [],
      context: {
        recentIssues: [],
        userPreferences: {
          language: 'en',
          responseFormat: 'brief'
        }
      },
      isActive: true
    };
    
    this.sessions.set(session.id, session);
    this.cleanupOldSessions();
    return session;
  }
  
  getSession(sessionId: string): ConversationSession | null {
    const session = this.sessions.get(sessionId);
    if (session && this.isSessionValid(session)) {
      session.lastActivity = new Date();
      return session;
    }
    return null;
  }
  
  updateSession(sessionId: string, updates: Partial<ConversationSession>): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      session.lastActivity = new Date();
      return true;
    }
    return false;
  }
  
  private isSessionValid(session: ConversationSession): boolean {
    const now = Date.now();
    const lastActivity = session.lastActivity.getTime();
    return (now - lastActivity) < this.SESSION_TIMEOUT;
  }
  
  private cleanupOldSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (!this.isSessionValid(session)) {
        this.sessions.delete(sessionId);
      }
    }
    
    // Enforce memory limits
    if (this.sessions.size > this.MAX_SESSIONS) {
      const oldestSessions = Array.from(this.sessions.entries())
        .sort(([,a], [,b]) => a.lastActivity.getTime() - b.lastActivity.getTime())
        .slice(0, this.sessions.size - this.MAX_SESSIONS);
      
      oldestSessions.forEach(([sessionId]) => {
        this.sessions.delete(sessionId);
      });
    }
  }
}
```

### Performance Requirements (REVISED - REALISTIC)
- Session read operations: < 10ms latency
- Session write operations: < 20ms latency
- Concurrent session support: 100+ active sessions
- Session retention: 30 minutes of inactivity
- Memory usage: < 100MB for session storage

## Testing Strategy

### Unit Testing
- [ ] Session creation and retrieval
- [ ] Session timeout and cleanup
- [ ] Message history management
- [ ] Context updates and persistence
- [ ] Memory usage validation

### Integration Testing
- [ ] Express middleware integration
- [ ] WebSocket session coordination
- [ ] Authentication integration
- [ ] Basic load testing (100 concurrent sessions)
- [ ] Session persistence across server restarts (if Redis)

### Performance Testing
- [ ] Session operation latency benchmarks
- [ ] Memory usage profiling
- [ ] Session cleanup efficiency
- [ ] Concurrent session handling
- [ ] Basic stress testing

### Manual Testing
- [ ] Session lifecycle through web interface
- [ ] Conversation continuity testing
- [ ] Project context preservation
- [ ] Session timeout behavior
- [ ] Error handling and recovery

## Review Checklist

### Code Quality
- [ ] TypeScript interfaces are simple and clear
- [ ] Session management follows Node.js best practices
- [ ] Error handling covers basic failure scenarios
- [ ] Code is readable and maintainable
- [ ] Basic documentation is complete

### Architecture
- [ ] Session design supports required use cases
- [ ] In-memory storage is appropriate for MVP
- [ ] Performance requirements are realistic
- [ ] Memory management prevents leaks
- [ ] Simple scaling patterns are considered

### Integration
- [ ] Express middleware integration works
- [ ] WebSocket coordination is functional
- [ ] Authentication integration is secure
- [ ] Basic monitoring provides visibility
- [ ] Error handling is appropriate

### Testing
- [ ] Unit tests cover core functionality
- [ ] Integration tests verify component interaction
- [ ] Performance tests validate requirements
- [ ] Manual testing covers user scenarios
- [ ] Documentation includes testing guidelines

### Deployment
- [ ] Node.js deployment is straightforward
- [ ] Environment configuration is documented
- [ ] Basic monitoring is set up
- [ ] Session cleanup procedures are defined
- [ ] Simple backup procedures are documented

## Success Criteria

- [ ] Session management operations complete within latency requirements
- [ ] Conversation state persists correctly during user sessions
- [ ] Project context is maintained appropriately
- [ ] Session isolation works for multiple users
- [ ] Basic performance benchmarks are met
- [ ] Integration with other components is functional
- [ ] Memory usage stays within reasonable bounds
- [ ] Documentation enables team understanding and maintenance

**EFFORT ESTIMATE**: 1 week (revised from 1-2 days)  
**COMPLEXITY**: Medium (revised from High)  
**DEPENDENCIES**: Basic Node.js setup, Express framework
