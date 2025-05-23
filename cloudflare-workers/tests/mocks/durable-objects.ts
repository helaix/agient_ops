import { vi } from 'vitest';
import { MockDurableObjectStorage } from './storage-backends';

/**
 * Mock Durable Object Stub for testing
 */
export class MockDurableObjectStub {
  private id: string;
  private storage: MockDurableObjectStorage;
  private responses = new Map<string, any>();
  
  constructor(id: string) {
    this.id = id;
    this.storage = new MockDurableObjectStorage();
  }
  
  // Mock DurableObjectStub methods
  fetch = vi.fn(async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.url;
    const method = init?.method || 'GET';
    const body = init?.body;
    
    // Parse URL to get path
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const key = `${method}:${path}`;
    
    // Check if we have a pre-configured response
    if (this.responses.has(key)) {
      const response = this.responses.get(key);
      if (typeof response === 'function') {
        return response(input, init);
      }
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Default responses based on path
    switch (path) {
      case '/task':
        if (method === 'POST') {
          const task = body ? JSON.parse(body.toString()) : {};
          return new Response(JSON.stringify({
            taskId: task.id || 'test-task-id',
            status: 'success',
            result: { processed: true },
            metrics: {
              executionTimeMs: 100,
              apiCallsCount: 1,
              errorCount: 0,
              retryCount: 0
            }
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        break;
        
      case '/message':
        if (method === 'POST') {
          return new Response(JSON.stringify({ status: 'received' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        break;
        
      case '/status':
        return new Response(JSON.stringify({
          id: this.id,
          type: 'test-agent',
          status: 'idle',
          currentTasks: [],
          lastHeartbeat: Date.now(),
          createdAt: Date.now(),
          activeTask: null,
          messageQueueLength: 0,
          uptime: 1000
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      case '/health':
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: Date.now(),
          lastHeartbeat: Date.now(),
          activeTask: null,
          messageQueueLength: 0
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      case '/terminate':
        if (method === 'POST') {
          return new Response(JSON.stringify({ status: 'terminated' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        break;
        
      default:
        return new Response('Not Found', { status: 404 });
    }
    
    return new Response('Method Not Allowed', { status: 405 });
  });
  
  // Test utilities
  setResponse(method: string, path: string, response: any): void {
    const key = `${method}:${path}`;
    this.responses.set(key, response);
  }
  
  setResponseFunction(method: string, path: string, fn: (input: RequestInfo, init?: RequestInit) => Response): void {
    const key = `${method}:${path}`;
    this.responses.set(key, fn);
  }
  
  getStorage(): MockDurableObjectStorage {
    return this.storage;
  }
  
  getId(): string {
    return this.id;
  }
  
  reset(): void {
    this.responses.clear();
    this.storage.reset();
    vi.clearAllMocks();
  }
}

/**
 * Mock Durable Object Namespace for testing
 */
export class MockDurableObjectNamespace {
  private objects = new Map<string, MockDurableObjectStub>();
  private idCounter = 0;
  
  // Mock DurableObjectNamespace methods
  newUniqueId = vi.fn((): DurableObjectId => {
    const id = `test-id-${++this.idCounter}`;
    return {
      toString: () => id,
      equals: (other: DurableObjectId) => other.toString() === id
    } as DurableObjectId;
  });
  
  idFromString = vi.fn((id: string): DurableObjectId => {
    return {
      toString: () => id,
      equals: (other: DurableObjectId) => other.toString() === id
    } as DurableObjectId;
  });
  
  idFromName = vi.fn((name: string): DurableObjectId => {
    const id = `named-${name}`;
    return {
      toString: () => id,
      equals: (other: DurableObjectId) => other.toString() === id
    } as DurableObjectId;
  });
  
  get = vi.fn((id: DurableObjectId): MockDurableObjectStub => {
    const idString = id.toString();
    if (!this.objects.has(idString)) {
      this.objects.set(idString, new MockDurableObjectStub(idString));
    }
    return this.objects.get(idString)!;
  });
  
  // Test utilities
  getObject(id: string): MockDurableObjectStub | undefined {
    return this.objects.get(id);
  }
  
  getAllObjects(): Map<string, MockDurableObjectStub> {
    return new Map(this.objects);
  }
  
  clear(): void {
    for (const obj of this.objects.values()) {
      obj.reset();
    }
    this.objects.clear();
    this.idCounter = 0;
  }
  
  reset(): void {
    this.clear();
    vi.clearAllMocks();
  }
}

/**
 * Mock Analytics Engine Dataset for testing
 */
export class MockAnalyticsEngineDataset {
  private dataPoints: any[] = [];
  
  writeDataPoint = vi.fn((data: any): void => {
    this.dataPoints.push({
      ...data,
      timestamp: Date.now()
    });
  });
  
  // Test utilities
  getDataPoints(): any[] {
    return [...this.dataPoints];
  }
  
  getDataPointsCount(): number {
    return this.dataPoints.length;
  }
  
  clear(): void {
    this.dataPoints = [];
  }
  
  reset(): void {
    this.clear();
    vi.clearAllMocks();
  }
}

