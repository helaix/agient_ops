/**
 * Performance benchmarking utilities for testing
 */

export interface BenchmarkResult {
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  minResponseTime: number;
  maxResponseTime: number;
}

export interface LoadTestOptions {
  duration?: number; // Test duration in milliseconds
  concurrency?: number; // Number of concurrent operations
  rampUpTime?: number; // Time to ramp up to full concurrency
  iterations?: number; // Number of iterations (alternative to duration)
  timeout?: number; // Timeout for individual operations
}

export class PerformanceBenchmark {
  private results: number[] = [];
  private errors: Error[] = [];
  private startTime: number = 0;
  private endTime: number = 0;
  
  /**
   * Measure response time of a single operation
   */
  async measureResponseTime(operation: () => Promise<any>): Promise<number> {
    const start = performance.now();
    try {
      await operation();
      const duration = performance.now() - start;
      this.results.push(duration);
      return duration;
    } catch (error) {
      const duration = performance.now() - start;
      this.errors.push(error as Error);
      this.results.push(duration);
      return duration;
    }
  }
  
  /**
   * Measure throughput of multiple operations
   */
  async measureThroughput(operations: (() => Promise<any>)[]): Promise<number> {
    const start = performance.now();
    
    const results = await Promise.allSettled(
      operations.map(op => this.measureResponseTime(op))
    );
    
    const duration = performance.now() - start;
    const successfulOps = results.filter(r => r.status === 'fulfilled').length;
    
    return (successfulOps / duration) * 1000; // Operations per second
  }
  
  /**
   * Measure memory usage during operation
   */
  async measureMemoryUsage(operation: () => Promise<any>): Promise<number> {
    // Note: Memory measurement in Workers is limited
    // This is a simplified implementation
    const beforeMemory = this.getMemoryUsage();
    await operation();
    const afterMemory = this.getMemoryUsage();
    
    return Math.max(0, afterMemory - beforeMemory);
  }
  
  /**
   * Run concurrent operations and measure performance
   */
  async measureConcurrency(
    operation: () => Promise<any>,
    concurrency: number,
    iterations: number = 100
  ): Promise<BenchmarkResult> {
    this.reset();
    this.startTime = performance.now();
    
    const batches = Math.ceil(iterations / concurrency);
    const promises: Promise<any>[] = [];
    
    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrency, iterations - batch * concurrency);
      
      for (let i = 0; i < batchSize; i++) {
        promises.push(this.measureResponseTime(operation));
      }
      
      // Wait for current batch to complete before starting next
      if (promises.length >= concurrency) {
        await Promise.allSettled(promises.splice(0, concurrency));
      }
    }
    
    // Wait for remaining operations
    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
    
    this.endTime = performance.now();
    
    return this.calculateResults();
  }
  
  /**
   * Run load test with specified options
   */
  async runLoadTest(
    operation: () => Promise<any>,
    options: LoadTestOptions = {}
  ): Promise<BenchmarkResult> {
    const {
      duration = 10000, // 10 seconds default
      concurrency = 10,
      rampUpTime = 1000, // 1 second ramp up
      iterations,
      timeout = 5000
    } = options;
    
    this.reset();
    this.startTime = performance.now();
    
    if (iterations) {
      return this.measureConcurrency(operation, concurrency, iterations);
    }
    
    const promises: Promise<any>[] = [];
    const endTime = this.startTime + duration;
    let currentConcurrency = 1;
    const maxConcurrency = concurrency;
    const rampUpStep = Math.max(1, Math.floor(maxConcurrency / (rampUpTime / 100)));
    
    while (performance.now() < endTime) {
      // Ramp up concurrency gradually
      if (performance.now() < this.startTime + rampUpTime) {
        currentConcurrency = Math.min(
          maxConcurrency,
          currentConcurrency + rampUpStep
        );
      } else {
        currentConcurrency = maxConcurrency;
      }
      
      // Start new operations up to current concurrency level
      while (promises.length < currentConcurrency && performance.now() < endTime) {
        const promise = this.measureResponseTime(async () => {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Operation timeout')), timeout)
          );
          
          return Promise.race([operation(), timeoutPromise]);
        });
        
        promises.push(promise);
        
        // Remove completed promises
        promise.finally(() => {
          const index = promises.indexOf(promise);
          if (index > -1) {
            promises.splice(index, 1);
          }
        });
      }
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Wait for remaining operations to complete
    await Promise.allSettled(promises);
    
    this.endTime = performance.now();
    
    return this.calculateResults();
  }
  
  /**
   * Calculate benchmark results
   */
  private calculateResults(): BenchmarkResult {
    if (this.results.length === 0) {
      return {
        averageResponseTime: 0,
        throughput: 0,
        errorRate: 0,
        memoryUsage: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        minResponseTime: 0,
        maxResponseTime: 0
      };
    }
    
    const sortedResults = [...this.results].sort((a, b) => a - b);
    const totalDuration = this.endTime - this.startTime;
    const totalOperations = this.results.length;
    const failedOperations = this.errors.length;
    const successfulOperations = totalOperations - failedOperations;
    
    const averageResponseTime = this.results.reduce((sum, time) => sum + time, 0) / totalOperations;
    const throughput = (successfulOperations / totalDuration) * 1000; // Operations per second
    const errorRate = (failedOperations / totalOperations) * 100;
    
    const p95Index = Math.floor(sortedResults.length * 0.95);
    const p99Index = Math.floor(sortedResults.length * 0.99);
    
    return {
      averageResponseTime,
      throughput,
      errorRate,
      memoryUsage: this.getMemoryUsage(),
      p95ResponseTime: sortedResults[p95Index] || 0,
      p99ResponseTime: sortedResults[p99Index] || 0,
      totalOperations,
      successfulOperations,
      failedOperations,
      minResponseTime: sortedResults[0] || 0,
      maxResponseTime: sortedResults[sortedResults.length - 1] || 0
    };
  }
  
  /**
   * Reset benchmark state
   */
  private reset(): void {
    this.results = [];
    this.errors = [];
    this.startTime = 0;
    this.endTime = 0;
  }
  
  /**
   * Get current memory usage (simplified for Workers environment)
   */
  private getMemoryUsage(): number {
    // In a real Workers environment, memory measurement is limited
    // This is a placeholder implementation
    return 0;
  }
  
  /**
   * Get detailed error information
   */
  getErrors(): Error[] {
    return [...this.errors];
  }
  
  /**
   * Get raw timing results
   */
  getRawResults(): number[] {
    return [...this.results];
  }
}

/**
 * Utility functions for performance testing
 */
export const performanceUtils = {
  /**
   * Create a performance benchmark instance
   */
  createBenchmark(): PerformanceBenchmark {
    return new PerformanceBenchmark();
  },
  
  /**
   * Quick performance test for a single operation
   */
  async quickTest(
    operation: () => Promise<any>,
    iterations: number = 10
  ): Promise<{ averageTime: number; minTime: number; maxTime: number }> {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await operation();
      const duration = performance.now() - start;
      times.push(duration);
    }
    
    return {
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times)
    };
  },
  
  /**
   * Assert performance requirements
   */
  assertPerformance(
    result: BenchmarkResult,
    requirements: {
      maxAverageResponseTime?: number;
      minThroughput?: number;
      maxErrorRate?: number;
      maxP95ResponseTime?: number;
      maxP99ResponseTime?: number;
    }
  ): void {
    if (requirements.maxAverageResponseTime !== undefined) {
      expect(result.averageResponseTime).toBeLessThanOrEqual(requirements.maxAverageResponseTime);
    }
    
    if (requirements.minThroughput !== undefined) {
      expect(result.throughput).toBeGreaterThanOrEqual(requirements.minThroughput);
    }
    
    if (requirements.maxErrorRate !== undefined) {
      expect(result.errorRate).toBeLessThanOrEqual(requirements.maxErrorRate);
    }
    
    if (requirements.maxP95ResponseTime !== undefined) {
      expect(result.p95ResponseTime).toBeLessThanOrEqual(requirements.maxP95ResponseTime);
    }
    
    if (requirements.maxP99ResponseTime !== undefined) {
      expect(result.p99ResponseTime).toBeLessThanOrEqual(requirements.maxP99ResponseTime);
    }
  },
  
  /**
   * Generate load test report
   */
  generateReport(result: BenchmarkResult, testName: string): string {
    return `
Performance Test Report: ${testName}
=====================================

Total Operations: ${result.totalOperations}
Successful Operations: ${result.successfulOperations}
Failed Operations: ${result.failedOperations}
Error Rate: ${result.errorRate.toFixed(2)}%

Response Times:
- Average: ${result.averageResponseTime.toFixed(2)}ms
- Minimum: ${result.minResponseTime.toFixed(2)}ms
- Maximum: ${result.maxResponseTime.toFixed(2)}ms
- 95th Percentile: ${result.p95ResponseTime.toFixed(2)}ms
- 99th Percentile: ${result.p99ResponseTime.toFixed(2)}ms

Throughput: ${result.throughput.toFixed(2)} operations/second
Memory Usage: ${result.memoryUsage.toFixed(2)}MB
    `.trim();
  }
};

