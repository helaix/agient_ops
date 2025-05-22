# Performance Rules for Gemini Live Interface to CodeGen

## Rule Activation Triggers

This rule set is activated when:
- Performance optimization is required
- Scalability concerns need to be addressed
- Resource management strategies are being implemented
- Latency requirements must be met
- System capacity planning is being conducted

## Core Performance Principles

### 1. Response Time Optimization

#### Voice Processing Latency
```typescript
interface PerformanceTargets {
  voiceTranscription: {
    target: 500; // milliseconds
    maximum: 1000; // milliseconds
  };
  intentRecognition: {
    target: 200; // milliseconds
    maximum: 500; // milliseconds
  };
  codeGeneration: {
    target: 1500; // milliseconds
    maximum: 3000; // milliseconds
  };
  endToEndResponse: {
    target: 2000; // milliseconds
    maximum: 4000; // milliseconds
  };
}

class PerformanceOptimizedVoiceProcessor {
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly cacheManager: CacheManager;
  private readonly connectionPool: ConnectionPool;
  
  constructor(config: PerformanceConfig) {
    this.performanceMonitor = new PerformanceMonitor(config.targets);
    this.cacheManager = new CacheManager(config.cacheConfig);
    this.connectionPool = new ConnectionPool(config.poolConfig);
  }
  
  async processVoiceCommand(audioData: ArrayBuffer, context: ProcessingContext): Promise<VoiceProcessingResult> {
    const startTime = performance.now();
    const operationId = crypto.randomUUID();
    
    try {
      // Start performance tracking
      this.performanceMonitor.startOperation(operationId, 'voice_processing');
      
      // Parallel processing where possible
      const [transcriptionResult, contextData] = await Promise.all([
        this.optimizedTranscription(audioData),
        this.loadContextData(context)
      ]);
      
      // Cache frequently used patterns
      const cacheKey = this.generateCacheKey(transcriptionResult.text, context);
      const cachedResult = await this.cacheManager.get(cacheKey);
      
      if (cachedResult) {
        this.performanceMonitor.recordCacheHit(operationId);
        return this.enhanceWithRealTimeData(cachedResult);
      }
      
      // Intent recognition with timeout
      const intentResult = await this.timeoutWrapper(
        this.recognizeIntent(transcriptionResult.text, contextData),
        500 // 500ms timeout
      );
      
      // Code generation with streaming
      const codeResult = await this.streamingCodeGeneration(intentResult, context);
      
      // Cache successful results
      await this.cacheManager.set(cacheKey, codeResult, 300000); // 5 minutes
      
      const endTime = performance.now();
      this.performanceMonitor.recordOperation(operationId, endTime - startTime);
      
      return codeResult;
    } catch (error) {
      this.performanceMonitor.recordError(operationId, error);
      throw error;
    }
  }
  
  private async optimizedTranscription(audioData: ArrayBuffer): Promise<TranscriptionResult> {
    // Use connection pooling for API calls
    const connection = await this.connectionPool.acquire();
    
    try {
      // Compress audio data if large
      const optimizedAudio = await this.optimizeAudioData(audioData);
      
      // Use streaming transcription for large audio files
      if (optimizedAudio.byteLength > 1024 * 1024) { // 1MB threshold
        return await this.streamingTranscription(optimizedAudio, connection);
      } else {
        return await this.batchTranscription(optimizedAudio, connection);
      }
    } finally {
      this.connectionPool.release(connection);
    }
  }
  
  private async timeoutWrapper<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }
}
```

#### Caching Strategy
```typescript
interface CacheStrategy {
  // Multi-level caching
  l1Cache: MemoryCache; // In-memory, fastest access
  l2Cache: RedisCache;  // Distributed, shared across instances
  l3Cache: DatabaseCache; // Persistent, slowest but most reliable
}

class HierarchicalCacheManager implements CacheStrategy {
  l1Cache: MemoryCache;
  l2Cache: RedisCache;
  l3Cache: DatabaseCache;
  
  private readonly cacheMetrics: CacheMetrics;
  
  constructor(config: CacheConfig) {
    this.l1Cache = new MemoryCache({
      maxSize: config.l1MaxSize || 100 * 1024 * 1024, // 100MB
      ttl: config.l1TTL || 60000 // 1 minute
    });
    
    this.l2Cache = new RedisCache({
      host: config.redisHost,
      maxMemory: config.l2MaxSize || 1024 * 1024 * 1024, // 1GB
      ttl: config.l2TTL || 300000 // 5 minutes
    });
    
    this.l3Cache = new DatabaseCache({
      connectionString: config.dbConnectionString,
      ttl: config.l3TTL || 3600000 // 1 hour
    });
    
    this.cacheMetrics = new CacheMetrics();
  }
  
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      // Try L1 cache first (fastest)
      let result = await this.l1Cache.get<T>(key);
      if (result !== null) {
        this.cacheMetrics.recordHit('l1', performance.now() - startTime);
        return result;
      }
      
      // Try L2 cache (Redis)
      result = await this.l2Cache.get<T>(key);
      if (result !== null) {
        // Populate L1 cache for future requests
        await this.l1Cache.set(key, result);
        this.cacheMetrics.recordHit('l2', performance.now() - startTime);
        return result;
      }
      
      // Try L3 cache (Database)
      result = await this.l3Cache.get<T>(key);
      if (result !== null) {
        // Populate both L1 and L2 caches
        await Promise.all([
          this.l1Cache.set(key, result),
          this.l2Cache.set(key, result)
        ]);
        this.cacheMetrics.recordHit('l3', performance.now() - startTime);
        return result;
      }
      
      this.cacheMetrics.recordMiss(performance.now() - startTime);
      return null;
    } catch (error) {
      this.cacheMetrics.recordError(error);
      return null; // Graceful degradation
    }
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Write to all cache levels
    await Promise.all([
      this.l1Cache.set(key, value, ttl),
      this.l2Cache.set(key, value, ttl),
      this.l3Cache.set(key, value, ttl)
    ]);
  }
  
  async invalidate(pattern: string): Promise<void> {
    // Invalidate across all cache levels
    await Promise.all([
      this.l1Cache.invalidate(pattern),
      this.l2Cache.invalidate(pattern),
      this.l3Cache.invalidate(pattern)
    ]);
  }
  
  getCacheMetrics(): CacheMetricsReport {
    return this.cacheMetrics.generateReport();
  }
}
```

### 2. Resource Management

#### Memory Management
```typescript
class MemoryOptimizedProcessor {
  private readonly memoryMonitor: MemoryMonitor;
  private readonly objectPool: ObjectPool;
  private readonly gcScheduler: GarbageCollectionScheduler;
  
  constructor(config: MemoryConfig) {
    this.memoryMonitor = new MemoryMonitor({
      warningThreshold: config.warningThreshold || 0.8, // 80% memory usage
      criticalThreshold: config.criticalThreshold || 0.9, // 90% memory usage
      checkInterval: config.checkInterval || 30000 // 30 seconds
    });
    
    this.objectPool = new ObjectPool();
    this.gcScheduler = new GarbageCollectionScheduler();
    
    this.setupMemoryMonitoring();
  }
  
  private setupMemoryMonitoring(): void {
    this.memoryMonitor.on('warning', (usage) => {
      console.warn(`Memory usage warning: ${(usage * 100).toFixed(1)}%`);
      this.triggerMemoryCleanup();
    });
    
    this.memoryMonitor.on('critical', (usage) => {
      console.error(`Critical memory usage: ${(usage * 100).toFixed(1)}%`);
      this.emergencyMemoryCleanup();
    });
  }
  
  async processLargeDataset(data: LargeDataset): Promise<ProcessingResult> {
    // Use streaming processing for large datasets
    const stream = this.createDataStream(data);
    const results: ProcessingResult[] = [];
    
    try {
      for await (const chunk of stream) {
        // Process in chunks to manage memory usage
        const chunkResult = await this.processChunk(chunk);
        results.push(chunkResult);
        
        // Periodic memory cleanup
        if (results.length % 100 === 0) {
          await this.performMemoryCleanup();
        }
      }
      
      return this.aggregateResults(results);
    } finally {
      // Ensure cleanup even if processing fails
      await this.performMemoryCleanup();
    }
  }
  
  private async triggerMemoryCleanup(): Promise<void> {
    // Clear caches
    await this.clearNonEssentialCaches();
    
    // Return objects to pool
    this.objectPool.returnUnusedObjects();
    
    // Suggest garbage collection
    if (global.gc) {
      global.gc();
    }
  }
  
  private async emergencyMemoryCleanup(): Promise<void> {
    // Aggressive cleanup measures
    await this.clearAllCaches();
    await this.terminateNonEssentialProcesses();
    this.objectPool.clear();
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    // If still critical, reject new requests temporarily
    this.temporarilyRejectNewRequests();
  }
}
```

#### Connection Pooling
```typescript
class OptimizedConnectionPool {
  private readonly pool: Connection[];
  private readonly activeConnections: Set<Connection>;
  private readonly waitingQueue: Array<{
    resolve: (connection: Connection) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>;
  
  private readonly config: PoolConfig;
  private readonly metrics: PoolMetrics;
  
  constructor(config: PoolConfig) {
    this.config = {
      minConnections: config.minConnections || 5,
      maxConnections: config.maxConnections || 50,
      acquireTimeout: config.acquireTimeout || 30000,
      idleTimeout: config.idleTimeout || 300000,
      maxLifetime: config.maxLifetime || 3600000,
      ...config
    };
    
    this.pool = [];
    this.activeConnections = new Set();
    this.waitingQueue = [];
    this.metrics = new PoolMetrics();
    
    this.initializePool();
    this.startMaintenanceTasks();
  }
  
  async acquire(): Promise<Connection> {
    const startTime = performance.now();
    
    try {
      // Try to get an available connection
      const connection = this.getAvailableConnection();
      if (connection) {
        this.activeConnections.add(connection);
        this.metrics.recordAcquisition(performance.now() - startTime);
        return connection;
      }
      
      // Create new connection if under limit
      if (this.getTotalConnections() < this.config.maxConnections) {
        const newConnection = await this.createConnection();
        this.activeConnections.add(newConnection);
        this.metrics.recordAcquisition(performance.now() - startTime);
        return newConnection;
      }
      
      // Wait for available connection
      return await this.waitForConnection();
    } catch (error) {
      this.metrics.recordAcquisitionError();
      throw error;
    }
  }
  
  release(connection: Connection): void {
    this.activeConnections.delete(connection);
    
    // Serve waiting requests first
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift()!;
      clearTimeout(waiter.timeout);
      this.activeConnections.add(connection);
      waiter.resolve(connection);
      return;
    }
    
    // Return to pool if healthy
    if (this.isConnectionHealthy(connection)) {
      connection.lastUsed = new Date();
      this.pool.push(connection);
    } else {
      this.destroyConnection(connection);
    }
  }
  
  private async waitForConnection(): Promise<Connection> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(w => w.resolve === resolve);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error('Connection acquisition timeout'));
      }, this.config.acquireTimeout);
      
      this.waitingQueue.push({ resolve, reject, timeout });
    });
  }
  
  private startMaintenanceTasks(): void {
    // Cleanup idle connections
    setInterval(() => {
      this.cleanupIdleConnections();
    }, 60000); // Every minute
    
    // Health check active connections
    setInterval(() => {
      this.healthCheckConnections();
    }, 300000); // Every 5 minutes
    
    // Rotate old connections
    setInterval(() => {
      this.rotateOldConnections();
    }, 600000); // Every 10 minutes
  }
  
  private cleanupIdleConnections(): void {
    const now = Date.now();
    const idleThreshold = now - this.config.idleTimeout;
    
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const connection = this.pool[i];
      if (connection.lastUsed.getTime() < idleThreshold) {
        this.pool.splice(i, 1);
        this.destroyConnection(connection);
      }
    }
    
    // Ensure minimum connections
    this.ensureMinimumConnections();
  }
}
```

### 3. Scalability Optimization

#### Horizontal Scaling
```typescript
class LoadBalancedProcessor {
  private readonly instances: ProcessorInstance[];
  private readonly loadBalancer: LoadBalancer;
  private readonly healthChecker: HealthChecker;
  
  constructor(config: ScalingConfig) {
    this.instances = this.initializeInstances(config.initialInstances);
    this.loadBalancer = new LoadBalancer(config.loadBalancingStrategy);
    this.healthChecker = new HealthChecker(config.healthCheckConfig);
    
    this.setupAutoScaling(config.autoScalingConfig);
  }
  
  async processRequest(request: ProcessingRequest): Promise<ProcessingResult> {
    // Select optimal instance based on load balancing strategy
    const instance = await this.loadBalancer.selectInstance(this.instances, request);
    
    if (!instance) {
      throw new Error('No healthy instances available');
    }
    
    try {
      const result = await instance.process(request);
      this.loadBalancer.recordSuccess(instance);
      return result;
    } catch (error) {
      this.loadBalancer.recordFailure(instance);
      
      // Retry on different instance if available
      const retryInstance = await this.loadBalancer.selectInstance(
        this.instances.filter(i => i !== instance),
        request
      );
      
      if (retryInstance) {
        return await retryInstance.process(request);
      }
      
      throw error;
    }
  }
  
  private setupAutoScaling(config: AutoScalingConfig): void {
    setInterval(async () => {
      const metrics = await this.collectMetrics();
      const scalingDecision = this.evaluateScalingNeed(metrics, config);
      
      if (scalingDecision.action === 'scale_up') {
        await this.scaleUp(scalingDecision.targetInstances);
      } else if (scalingDecision.action === 'scale_down') {
        await this.scaleDown(scalingDecision.targetInstances);
      }
    }, config.evaluationInterval || 60000); // Every minute
  }
  
  private async scaleUp(targetInstances: number): Promise<void> {
    const currentInstances = this.instances.length;
    const instancesToAdd = targetInstances - currentInstances;
    
    console.log(`Scaling up: adding ${instancesToAdd} instances`);
    
    const newInstances = await Promise.all(
      Array(instancesToAdd).fill(null).map(() => this.createInstance())
    );
    
    this.instances.push(...newInstances);
    
    // Wait for instances to be ready
    await Promise.all(newInstances.map(instance => instance.waitForReady()));
  }
  
  private async scaleDown(targetInstances: number): Promise<void> {
    const currentInstances = this.instances.length;
    const instancesToRemove = currentInstances - targetInstances;
    
    console.log(`Scaling down: removing ${instancesToRemove} instances`);
    
    // Select least loaded instances for removal
    const instancesToTerminate = this.selectInstancesForTermination(instancesToRemove);
    
    // Gracefully drain connections
    await Promise.all(instancesToTerminate.map(instance => instance.drain()));
    
    // Remove from pool
    for (const instance of instancesToTerminate) {
      const index = this.instances.indexOf(instance);
      if (index !== -1) {
        this.instances.splice(index, 1);
      }
      await instance.terminate();
    }
  }
}
```

#### Database Optimization
```typescript
class OptimizedDatabaseAccess {
  private readonly readReplicas: DatabaseConnection[];
  private readonly writeConnection: DatabaseConnection;
  private readonly queryCache: QueryCache;
  private readonly connectionPool: ConnectionPool;
  
  constructor(config: DatabaseConfig) {
    this.writeConnection = new DatabaseConnection(config.writeDatabase);
    this.readReplicas = config.readReplicas.map(replica => 
      new DatabaseConnection(replica)
    );
    this.queryCache = new QueryCache(config.cacheConfig);
    this.connectionPool = new ConnectionPool(config.poolConfig);
  }
  
  async executeQuery<T>(query: Query): Promise<T[]> {
    // Use cache for read queries
    if (query.type === 'SELECT') {
      const cacheKey = this.generateCacheKey(query);
      const cachedResult = await this.queryCache.get<T[]>(cacheKey);
      
      if (cachedResult) {
        return cachedResult;
      }
    }
    
    // Route to appropriate database
    const connection = query.type === 'SELECT' 
      ? this.selectReadReplica()
      : this.writeConnection;
    
    const result = await this.executeWithRetry(query, connection);
    
    // Cache read results
    if (query.type === 'SELECT' && result.length > 0) {
      const cacheKey = this.generateCacheKey(query);
      await this.queryCache.set(cacheKey, result, query.cacheTTL || 300000);
    }
    
    return result;
  }
  
  async executeBatch<T>(queries: Query[]): Promise<T[][]> {
    // Group queries by type
    const readQueries = queries.filter(q => q.type === 'SELECT');
    const writeQueries = queries.filter(q => q.type !== 'SELECT');
    
    // Execute read queries in parallel across replicas
    const readPromises = this.distributeReadQueries(readQueries);
    
    // Execute write queries sequentially on write connection
    const writePromises = this.executeWriteQueries(writeQueries);
    
    const [readResults, writeResults] = await Promise.all([
      Promise.all(readPromises),
      writePromises
    ]);
    
    // Merge results in original order
    return this.mergeResults(queries, readResults, writeResults);
  }
  
  private selectReadReplica(): DatabaseConnection {
    // Select replica with lowest load
    let selectedReplica = this.readReplicas[0];
    let lowestLoad = selectedReplica.getCurrentLoad();
    
    for (const replica of this.readReplicas.slice(1)) {
      const load = replica.getCurrentLoad();
      if (load < lowestLoad) {
        lowestLoad = load;
        selectedReplica = replica;
      }
    }
    
    return selectedReplica;
  }
  
  private async executeWithRetry<T>(
    query: Query,
    connection: DatabaseConnection,
    maxRetries: number = 3
  ): Promise<T[]> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await connection.execute<T>(query);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on syntax errors
        if (this.isSyntaxError(error)) {
          throw error;
        }
        
        // Exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError!;
  }
}
```

### 4. Performance Monitoring

#### Real-time Metrics Collection
```typescript
class PerformanceMonitor {
  private readonly metrics: Map<string, MetricCollector>;
  private readonly alertManager: AlertManager;
  private readonly dashboardUpdater: DashboardUpdater;
  
  constructor(config: MonitoringConfig) {
    this.metrics = new Map();
    this.alertManager = new AlertManager(config.alertConfig);
    this.dashboardUpdater = new DashboardUpdater(config.dashboardConfig);
    
    this.initializeMetrics();
    this.startMetricsCollection();
  }
  
  private initializeMetrics(): void {
    // Response time metrics
    this.metrics.set('response_time', new HistogramMetric({
      name: 'response_time',
      description: 'Request response time in milliseconds',
      buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000]
    }));
    
    // Throughput metrics
    this.metrics.set('throughput', new CounterMetric({
      name: 'requests_total',
      description: 'Total number of requests processed'
    }));
    
    // Error rate metrics
    this.metrics.set('error_rate', new CounterMetric({
      name: 'errors_total',
      description: 'Total number of errors'
    }));
    
    // Resource utilization metrics
    this.metrics.set('cpu_usage', new GaugeMetric({
      name: 'cpu_usage_percent',
      description: 'CPU usage percentage'
    }));
    
    this.metrics.set('memory_usage', new GaugeMetric({
      name: 'memory_usage_bytes',
      description: 'Memory usage in bytes'
    }));
    
    // Cache metrics
    this.metrics.set('cache_hit_rate', new GaugeMetric({
      name: 'cache_hit_rate',
      description: 'Cache hit rate percentage'
    }));
  }
  
  recordRequestMetrics(request: ProcessingRequest, response: ProcessingResponse): void {
    const responseTime = response.endTime - request.startTime;
    
    // Record response time
    this.metrics.get('response_time')!.observe(responseTime);
    
    // Record throughput
    this.metrics.get('throughput')!.increment();
    
    // Record errors
    if (response.error) {
      this.metrics.get('error_rate')!.increment();
    }
    
    // Check for performance alerts
    this.checkPerformanceAlerts(responseTime, response.error);
  }
  
  private startMetricsCollection(): void {
    // Collect system metrics every 10 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 10000);
    
    // Update dashboard every 30 seconds
    setInterval(() => {
      this.updateDashboard();
    }, 30000);
    
    // Generate performance reports every hour
    setInterval(() => {
      this.generatePerformanceReport();
    }, 3600000);
  }
  
  private async collectSystemMetrics(): Promise<void> {
    // CPU usage
    const cpuUsage = await this.getCPUUsage();
    this.metrics.get('cpu_usage')!.set(cpuUsage);
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    this.metrics.get('memory_usage')!.set(memoryUsage.heapUsed);
    
    // Cache hit rate
    const cacheStats = await this.getCacheStatistics();
    const hitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100;
    this.metrics.get('cache_hit_rate')!.set(hitRate);
  }
  
  private checkPerformanceAlerts(responseTime: number, error: Error | null): void {
    // Response time alert
    if (responseTime > 2000) { // 2 seconds
      this.alertManager.triggerAlert({
        type: 'HIGH_RESPONSE_TIME',
        severity: 'WARNING',
        message: `Response time ${responseTime}ms exceeds threshold`,
        metadata: { responseTime }
      });
    }
    
    // Error rate alert
    const errorRate = this.calculateErrorRate();
    if (errorRate > 0.05) { // 5% error rate
      this.alertManager.triggerAlert({
        type: 'HIGH_ERROR_RATE',
        severity: 'CRITICAL',
        message: `Error rate ${(errorRate * 100).toFixed(2)}% exceeds threshold`,
        metadata: { errorRate }
      });
    }
  }
  
  generatePerformanceReport(): PerformanceReport {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    return {
      period: { start: oneHourAgo, end: now },
      metrics: {
        averageResponseTime: this.calculateAverageResponseTime(),
        throughput: this.calculateThroughput(),
        errorRate: this.calculateErrorRate(),
        cacheHitRate: this.calculateCacheHitRate(),
        resourceUtilization: this.getResourceUtilization()
      },
      alerts: this.alertManager.getRecentAlerts(oneHourAgo),
      recommendations: this.generateOptimizationRecommendations()
    };
  }
}
```

---

*These performance rules should be continuously monitored and adjusted based on system behavior, user load patterns, and evolving performance requirements.*

