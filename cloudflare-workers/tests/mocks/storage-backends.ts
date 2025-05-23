import { vi } from 'vitest';

/**
 * Mock Durable Object Storage for testing
 */
export class MockDurableObjectStorage {
  private data = new Map<string, any>();
  private transactions = new Map<string, any>();
  
  // Mock DurableObjectStorage methods
  get = vi.fn(async <T>(key: string): Promise<T | undefined> => {
    return this.data.get(key);
  });
  
  get_multiple = vi.fn(async <T>(keys: string[]): Promise<Map<string, T>> => {
    const result = new Map<string, T>();
    for (const key of keys) {
      const value = this.data.get(key);
      if (value !== undefined) {
        result.set(key, value);
      }
    }
    return result;
  });
  
  put = vi.fn(async (key: string, value: any): Promise<void> => {
    this.data.set(key, value);
  });
  
  put_multiple = vi.fn(async (entries: Record<string, any>): Promise<void> => {
    for (const [key, value] of Object.entries(entries)) {
      this.data.set(key, value);
    }
  });
  
  delete = vi.fn(async (key: string): Promise<boolean> => {
    return this.data.delete(key);
  });
  
  delete_multiple = vi.fn(async (keys: string[]): Promise<number> => {
    let deleted = 0;
    for (const key of keys) {
      if (this.data.delete(key)) {
        deleted++;
      }
    }
    return deleted;
  });
  
  list = vi.fn(async (options?: any): Promise<Map<string, any>> => {
    const result = new Map();
    const entries = Array.from(this.data.entries());
    
    // Apply prefix filter
    let filtered = entries;
    if (options?.prefix) {
      filtered = entries.filter(([key]) => key.startsWith(options.prefix));
    }
    
    // Apply limit
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    for (const [key, value] of filtered) {
      result.set(key, value);
    }
    
    return result;
  });
  
  transaction = vi.fn(async (closure: (txn: any) => Promise<any>): Promise<any> => {
    // Simple transaction mock - in real implementation this would be atomic
    const txnId = Math.random().toString(36);
    this.transactions.set(txnId, new Map(this.data));
    
    try {
      const result = await closure({
        get: this.get,
        put: this.put,
        delete: this.delete,
        rollback: () => {
          this.data = this.transactions.get(txnId) || new Map();
        }
      });
      this.transactions.delete(txnId);
      return result;
    } catch (error) {
      // Rollback on error
      this.data = this.transactions.get(txnId) || new Map();
      this.transactions.delete(txnId);
      throw error;
    }
  });
  
  // Test utilities
  setData(key: string, value: any): void {
    this.data.set(key, value);
  }
  
  getData(key: string): any {
    return this.data.get(key);
  }
  
  getAllData(): Map<string, any> {
    return new Map(this.data);
  }
  
  clear(): void {
    this.data.clear();
    this.transactions.clear();
  }
  
  reset(): void {
    this.clear();
    vi.clearAllMocks();
  }
}

/**
 * Mock KV Namespace for testing
 */
export class MockKVNamespace {
  private data = new Map<string, { value: string; metadata?: any; expiration?: number }>();
  
  // Mock KVNamespace methods
  get = vi.fn(async (key: string, options?: any): Promise<string | null> => {
    const entry = this.data.get(key);
    if (!entry) return null;
    
    // Check expiration
    if (entry.expiration && Date.now() > entry.expiration) {
      this.data.delete(key);
      return null;
    }
    
    if (options?.type === 'json') {
      return JSON.parse(entry.value);
    }
    
    return entry.value;
  });
  
  getWithMetadata = vi.fn(async (key: string, options?: any): Promise<{ value: string | null; metadata: any | null }> => {
    const entry = this.data.get(key);
    if (!entry) return { value: null, metadata: null };
    
    // Check expiration
    if (entry.expiration && Date.now() > entry.expiration) {
      this.data.delete(key);
      return { value: null, metadata: null };
    }
    
    let value = entry.value;
    if (options?.type === 'json') {
      value = JSON.parse(value);
    }
    
    return { value, metadata: entry.metadata || null };
  });
  
  put = vi.fn(async (key: string, value: string, options?: any): Promise<void> => {
    let expiration: number | undefined;
    
    if (options?.expirationTtl) {
      expiration = Date.now() + (options.expirationTtl * 1000);
    } else if (options?.expiration) {
      expiration = options.expiration * 1000;
    }
    
    this.data.set(key, {
      value: typeof value === 'string' ? value : JSON.stringify(value),
      metadata: options?.metadata,
      expiration
    });
  });
  
  delete = vi.fn(async (key: string): Promise<void> => {
    this.data.delete(key);
  });
  
  list = vi.fn(async (options?: any): Promise<any> => {
    const keys = Array.from(this.data.keys());
    let filtered = keys;
    
    // Apply prefix filter
    if (options?.prefix) {
      filtered = keys.filter(key => key.startsWith(options.prefix));
    }
    
    // Apply limit
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    return {
      keys: filtered.map(name => ({ name })),
      list_complete: true,
      cursor: null
    };
  });
  
  // Test utilities
  setData(key: string, value: string, metadata?: any, ttl?: number): void {
    let expiration: number | undefined;
    if (ttl) {
      expiration = Date.now() + (ttl * 1000);
    }
    
    this.data.set(key, {
      value: typeof value === 'string' ? value : JSON.stringify(value),
      metadata,
      expiration
    });
  }
  
  getData(key: string): any {
    const entry = this.data.get(key);
    return entry ? entry.value : undefined;
  }
  
  getAllData(): Map<string, any> {
    return new Map(this.data);
  }
  
  clear(): void {
    this.data.clear();
  }
  
  reset(): void {
    this.clear();
    vi.clearAllMocks();
  }
}

/**
 * Mock R2 Bucket for testing
 */
export class MockR2Bucket {
  private objects = new Map<string, { body: any; metadata?: any; httpMetadata?: any; customMetadata?: any }>();
  
  // Mock R2Bucket methods
  get = vi.fn(async (key: string): Promise<any> => {
    const obj = this.objects.get(key);
    if (!obj) return null;
    
    return {
      key,
      body: obj.body,
      bodyUsed: false,
      arrayBuffer: async () => {
        if (typeof obj.body === 'string') {
          return new TextEncoder().encode(obj.body);
        }
        return obj.body;
      },
      text: async () => {
        if (typeof obj.body === 'string') {
          return obj.body;
        }
        return new TextDecoder().decode(obj.body);
      },
      json: async () => {
        const text = typeof obj.body === 'string' ? obj.body : new TextDecoder().decode(obj.body);
        return JSON.parse(text);
      },
      blob: async () => new Blob([obj.body]),
      httpMetadata: obj.httpMetadata,
      customMetadata: obj.customMetadata
    };
  });
  
  put = vi.fn(async (key: string, value: any, options?: any): Promise<any> => {
    this.objects.set(key, {
      body: value,
      metadata: options?.metadata,
      httpMetadata: options?.httpMetadata,
      customMetadata: options?.customMetadata
    });
    
    return {
      key,
      etag: `"${Math.random().toString(36)}"`,
      size: typeof value === 'string' ? value.length : value.byteLength || 0,
      version: '1',
      httpMetadata: options?.httpMetadata,
      customMetadata: options?.customMetadata
    };
  });
  
  delete = vi.fn(async (key: string): Promise<void> => {
    this.objects.delete(key);
  });
  
  list = vi.fn(async (options?: any): Promise<any> => {
    const keys = Array.from(this.objects.keys());
    let filtered = keys;
    
    // Apply prefix filter
    if (options?.prefix) {
      filtered = keys.filter(key => key.startsWith(options.prefix));
    }
    
    // Apply limit
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    return {
      objects: filtered.map(key => {
        const obj = this.objects.get(key)!;
        return {
          key,
          size: typeof obj.body === 'string' ? obj.body.length : obj.body.byteLength || 0,
          etag: `"${Math.random().toString(36)}"`,
          httpMetadata: obj.httpMetadata,
          customMetadata: obj.customMetadata,
          uploaded: new Date()
        };
      }),
      truncated: false,
      cursor: null
    };
  });
  
  head = vi.fn(async (key: string): Promise<any> => {
    const obj = this.objects.get(key);
    if (!obj) return null;
    
    return {
      key,
      size: typeof obj.body === 'string' ? obj.body.length : obj.body.byteLength || 0,
      etag: `"${Math.random().toString(36)}"`,
      httpMetadata: obj.httpMetadata,
      customMetadata: obj.customMetadata,
      uploaded: new Date()
    };
  });
  
  // Test utilities
  setObject(key: string, body: any, metadata?: any): void {
    this.objects.set(key, { body, metadata });
  }
  
  getObject(key: string): any {
    const obj = this.objects.get(key);
    return obj ? obj.body : undefined;
  }
  
  getAllObjects(): Map<string, any> {
    return new Map(this.objects);
  }
  
  clear(): void {
    this.objects.clear();
  }
  
  reset(): void {
    this.clear();
    vi.clearAllMocks();
  }
}

