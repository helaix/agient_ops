# Integration Rules for Gemini Live Interface to CodeGen

## Rule Activation Triggers

This rule set is activated when:
- API integrations are being implemented or modified
- External service connections need to be established
- Data exchange protocols are being defined
- Authentication and authorization flows are being set up
- Cross-system communication patterns are being implemented

## Core Integration Principles

### 1. API Integration Standards

#### Gemini API Integration
```typescript
interface GeminiAPIClient {
  // Voice processing capabilities
  transcribeAudio(audioData: ArrayBuffer): Promise<TranscriptionResult>;
  generateResponse(prompt: string, context: ConversationContext): Promise<GeneratedResponse>;
  processFunction(functionCall: FunctionCall): Promise<FunctionResult>;
  
  // Configuration and management
  configure(config: GeminiConfig): void;
  validateConnection(): Promise<boolean>;
  getUsageMetrics(): Promise<UsageMetrics>;
}

class GeminiAPIClient implements GeminiAPIClient {
  private apiKey: string;
  private baseUrl: string;
  private rateLimiter: RateLimiter;
  private retryPolicy: RetryPolicy;
  
  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com';
    this.rateLimiter = new RateLimiter(config.rateLimit);
    this.retryPolicy = new RetryPolicy(config.retryConfig);
  }
  
  async transcribeAudio(audioData: ArrayBuffer): Promise<TranscriptionResult> {
    await this.rateLimiter.waitForToken();
    
    try {
      const response = await this.retryPolicy.execute(async () => {
        return await fetch(`${this.baseUrl}/v1/audio:transcribe`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'audio/wav'
          },
          body: audioData
        });
      });
      
      if (!response.ok) {
        throw new GeminiAPIError(`Transcription failed: ${response.statusText}`, response.status);
      }
      
      const result = await response.json();
      return this.validateTranscriptionResult(result);
    } catch (error) {
      this.handleAPIError(error, 'transcribeAudio');
      throw error;
    }
  }
}
```

#### CodeGen Platform Integration
```typescript
interface CodeGenIntegration {
  // Tool execution
  executeRipgrepSearch(query: string, options?: SearchOptions): Promise<SearchResult>;
  executeFileEdit(filepath: string, editSnippet: string): Promise<EditResult>;
  executeFileWrite(filepath: string, content: string): Promise<WriteResult>;
  executeRunCommand(command: string, timeout?: number): Promise<CommandResult>;
  
  // Repository operations
  createPR(title: string, body: string, headBranch: string, baseBranch?: string): Promise<PRResult>;
  viewPR(prId: number): Promise<PRDetails>;
  createIssueComment(issueNumber: number, body: string): Promise<CommentResult>;
  
  // Linear operations
  createLinearIssue(title: string, description?: string): Promise<LinearIssue>;
  updateLinearIssue(issueId: string, updates: IssueUpdates): Promise<LinearIssue>;
  commentOnLinearIssue(issueId: string, body: string): Promise<CommentResult>;
}

class CodeGenIntegration implements CodeGenIntegration {
  private toolRegistry: Map<string, CodeGenTool>;
  private auditLogger: AuditLogger;
  
  constructor(config: CodeGenConfig) {
    this.toolRegistry = this.initializeTools(config);
    this.auditLogger = new AuditLogger(config.auditConfig);
  }
  
  async executeRipgrepSearch(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const tool = this.toolRegistry.get('ripgrep_search');
    if (!tool) {
      throw new ToolNotFoundError('ripgrep_search tool not available');
    }
    
    const startTime = Date.now();
    try {
      const result = await tool.execute({
        query,
        file_extensions: options.fileExtensions,
        files_per_page: options.filesPerPage || 10,
        page: options.page || 1,
        use_regex: options.useRegex !== false
      });
      
      await this.auditLogger.logToolUsage({
        tool: 'ripgrep_search',
        parameters: { query, options },
        duration: Date.now() - startTime,
        success: true
      });
      
      return result;
    } catch (error) {
      await this.auditLogger.logToolUsage({
        tool: 'ripgrep_search',
        parameters: { query, options },
        duration: Date.now() - startTime,
        success: false,
        error: error.message
      });
      throw error;
    }
  }
}
```

### 2. Authentication and Authorization

#### Secure API Key Management
```typescript
class SecureCredentialManager {
  private encryptionKey: string;
  private credentialStore: Map<string, EncryptedCredential>;
  
  constructor(encryptionKey: string) {
    this.encryptionKey = encryptionKey;
    this.credentialStore = new Map();
  }
  
  async storeCredential(service: string, credential: string): Promise<void> {
    const encrypted = await this.encrypt(credential);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    this.credentialStore.set(service, {
      encrypted,
      expiresAt,
      createdAt: new Date()
    });
  }
  
  async getCredential(service: string): Promise<string | null> {
    const stored = this.credentialStore.get(service);
    if (!stored || stored.expiresAt < new Date()) {
      return null;
    }
    
    return await this.decrypt(stored.encrypted);
  }
  
  private async encrypt(data: string): Promise<string> {
    // Implementation using crypto module
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  private async decrypt(encryptedData: string): Promise<string> {
    // Implementation using crypto module
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

#### OAuth Flow Implementation
```typescript
class OAuthManager {
  async initiateOAuthFlow(service: string, scopes: string[]): Promise<OAuthInitiation> {
    const state = this.generateSecureState();
    const authUrl = this.buildAuthUrl(service, scopes, state);
    
    // Store state for validation
    await this.storeOAuthState(state, {
      service,
      scopes,
      initiatedAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    
    return {
      authUrl,
      state,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
  }
  
  async handleOAuthCallback(code: string, state: string): Promise<AccessToken> {
    // Validate state
    const storedState = await this.getOAuthState(state);
    if (!storedState || storedState.expiresAt < new Date()) {
      throw new OAuthError('Invalid or expired OAuth state');
    }
    
    // Exchange code for token
    const tokenResponse = await this.exchangeCodeForToken(code, storedState.service);
    
    // Store token securely
    await this.storeAccessToken(storedState.service, tokenResponse);
    
    return tokenResponse;
  }
}
```

### 3. Data Exchange Protocols

#### Message Format Standardization
```typescript
interface StandardMessage {
  id: string;
  timestamp: Date;
  type: MessageType;
  source: string;
  destination: string;
  payload: any;
  metadata?: MessageMetadata;
}

interface VoiceCommandMessage extends StandardMessage {
  type: 'VOICE_COMMAND';
  payload: {
    audioData?: ArrayBuffer;
    transcription?: string;
    intent?: string;
    parameters?: Record<string, any>;
    context?: ConversationContext;
  };
}

interface CodeGenerationMessage extends StandardMessage {
  type: 'CODE_GENERATION';
  payload: {
    prompt: string;
    language: string;
    context: GenerationContext;
    generatedCode?: string;
    validation?: ValidationResult;
  };
}

class MessageBus {
  private subscribers: Map<MessageType, MessageHandler[]>;
  private messageQueue: StandardMessage[];
  private processingQueue: boolean = false;
  
  subscribe(messageType: MessageType, handler: MessageHandler): void {
    if (!this.subscribers.has(messageType)) {
      this.subscribers.set(messageType, []);
    }
    this.subscribers.get(messageType)!.push(handler);
  }
  
  async publish(message: StandardMessage): Promise<void> {
    // Add to queue
    this.messageQueue.push(message);
    
    // Process queue if not already processing
    if (!this.processingQueue) {
      await this.processMessageQueue();
    }
  }
  
  private async processMessageQueue(): Promise<void> {
    this.processingQueue = true;
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      const handlers = this.subscribers.get(message.type) || [];
      
      // Process handlers in parallel
      await Promise.all(handlers.map(handler => 
        this.safeHandleMessage(handler, message)
      ));
    }
    
    this.processingQueue = false;
  }
  
  private async safeHandleMessage(handler: MessageHandler, message: StandardMessage): Promise<void> {
    try {
      await handler(message);
    } catch (error) {
      console.error('Message handler error:', error);
      // Could implement dead letter queue here
    }
  }
}
```

### 4. Error Handling and Resilience

#### Circuit Breaker Pattern
```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: Date | null = null;
  private successCount: number = 0;
  
  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private successThreshold: number = 3
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new CircuitBreakerOpenError('Circuit breaker is open');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
      }
    }
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
  
  private shouldAttemptReset(): boolean {
    return this.lastFailureTime !== null &&
           Date.now() - this.lastFailureTime.getTime() >= this.recoveryTimeout;
  }
}
```

#### Retry Policies
```typescript
class RetryPolicy {
  constructor(
    private maxRetries: number = 3,
    private baseDelay: number = 1000,
    private maxDelay: number = 10000,
    private backoffMultiplier: number = 2
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxRetries) {
          break;
        }
        
        if (!this.shouldRetry(error)) {
          throw error;
        }
        
        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
      }
    }
    
    throw new RetryExhaustedError(`Operation failed after ${this.maxRetries + 1} attempts`, lastError);
  }
  
  private shouldRetry(error: any): boolean {
    // Don't retry on authentication errors
    if (error.status === 401 || error.status === 403) {
      return false;
    }
    
    // Don't retry on client errors (4xx except 429)
    if (error.status >= 400 && error.status < 500 && error.status !== 429) {
      return false;
    }
    
    // Retry on server errors (5xx) and rate limiting (429)
    return error.status >= 500 || error.status === 429 || !error.status;
  }
  
  private calculateDelay(attempt: number): number {
    const delay = this.baseDelay * Math.pow(this.backoffMultiplier, attempt);
    return Math.min(delay, this.maxDelay);
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 5. Integration Testing and Monitoring

#### Health Check Implementation
```typescript
class IntegrationHealthChecker {
  private healthChecks: Map<string, HealthCheck>;
  
  constructor() {
    this.healthChecks = new Map();
    this.registerHealthChecks();
  }
  
  private registerHealthChecks(): void {
    this.healthChecks.set('gemini-api', {
      name: 'Gemini API',
      check: () => this.checkGeminiAPI(),
      timeout: 5000,
      critical: true
    });
    
    this.healthChecks.set('codegen-platform', {
      name: 'CodeGen Platform',
      check: () => this.checkCodeGenPlatform(),
      timeout: 3000,
      critical: true
    });
    
    this.healthChecks.set('linear-api', {
      name: 'Linear API',
      check: () => this.checkLinearAPI(),
      timeout: 3000,
      critical: false
    });
  }
  
  async checkAllServices(): Promise<HealthReport> {
    const results = new Map<string, HealthCheckResult>();
    
    for (const [service, healthCheck] of this.healthChecks) {
      try {
        const startTime = Date.now();
        await Promise.race([
          healthCheck.check(),
          this.timeout(healthCheck.timeout)
        ]);
        
        results.set(service, {
          service,
          status: 'healthy',
          responseTime: Date.now() - startTime,
          timestamp: new Date()
        });
      } catch (error) {
        results.set(service, {
          service,
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date()
        });
      }
    }
    
    return this.generateHealthReport(results);
  }
  
  private async checkGeminiAPI(): Promise<void> {
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models', {
      headers: { 'Authorization': `Bearer ${await this.getGeminiAPIKey()}` }
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API health check failed: ${response.statusText}`);
    }
  }
}
```

### 6. Performance Optimization

#### Connection Pooling
```typescript
class ConnectionPool {
  private pool: Connection[];
  private activeConnections: Set<Connection>;
  private waitingQueue: Array<(connection: Connection) => void>;
  
  constructor(
    private maxConnections: number = 10,
    private connectionFactory: () => Promise<Connection>
  ) {
    this.pool = [];
    this.activeConnections = new Set();
    this.waitingQueue = [];
  }
  
  async getConnection(): Promise<Connection> {
    // Try to get from pool
    if (this.pool.length > 0) {
      const connection = this.pool.pop()!;
      this.activeConnections.add(connection);
      return connection;
    }
    
    // Create new connection if under limit
    if (this.activeConnections.size < this.maxConnections) {
      const connection = await this.connectionFactory();
      this.activeConnections.add(connection);
      return connection;
    }
    
    // Wait for available connection
    return new Promise((resolve) => {
      this.waitingQueue.push(resolve);
    });
  }
  
  releaseConnection(connection: Connection): void {
    this.activeConnections.delete(connection);
    
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift()!;
      this.activeConnections.add(connection);
      waiter(connection);
    } else {
      this.pool.push(connection);
    }
  }
}
```

#### Caching Strategy
```typescript
class IntegrationCache {
  private cache: Map<string, CacheEntry>;
  private ttlMap: Map<string, number>;
  
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
    this.startCleanupTimer();
  }
  
  async get<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300000): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }
    
    // Fetch fresh data
    const value = await fetcher();
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
    
    return value;
  }
  
  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt <= now) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }
}
```

---

*These integration rules should be regularly reviewed and updated based on API changes, performance requirements, and security best practices.*

