# Server Functions in RedwoodSDK

## Pattern Overview

### Name
RedwoodSDK Server Functions

### Category
Server Functions

### Description
RedwoodSDK Server Functions provide a unified approach to handling API endpoints, form actions, and server-side logic. Built on Cloudflare Workers, they offer direct access to Cloudflare services (D1, R2, Queues, AI) with automatic scaling and edge distribution. Server Functions follow the request/response paradigm and can return both data and React components.

## Technical Implementation

### Core Concepts
- **Request/Response paradigm**: Built around standard web Request and Response objects
- **File-based routing**: Functions map to URLs based on file structure
- **Cloudflare Workers runtime**: Native integration with Cloudflare's edge infrastructure
- **Direct service access**: Built-in access to D1, R2, Queues, and AI services
- **Type safety**: Full TypeScript support with automatic type inference
- **Zero configuration**: No additional setup required for basic functionality

### Architecture
```
Client Request
    ↓
Cloudflare Edge Worker
    ↓
RedwoodSDK Router
    ↓
Server Function
    ├── Request Processing
    ├── Business Logic
    ├── Database Operations (D1)
    ├── File Operations (R2)
    ├── Queue Operations
    ├── AI Operations
    └── Response Generation
        ↓
JSON/HTML/Stream Response
    ↓
Client
```

### Code Example
```javascript
// Basic Server Function
// functions/api/users.js
export default async function handler(request, context) {
  const { method } = request;
  const { env } = context;
  
  switch (method) {
    case 'GET':
      return await getUsers(env.DB);
    case 'POST':
      return await createUser(request, env.DB);
    default:
      return new Response('Method not allowed', { status: 405 });
  }
}

async function getUsers(db) {
  const users = await db.prepare("SELECT id, name, email FROM users").all();
  
  return new Response(JSON.stringify(users.results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function createUser(request, db) {
  const userData = await request.json();
  
  const result = await db.prepare(
    "INSERT INTO users (name, email) VALUES (?, ?) RETURNING id"
  ).bind(userData.name, userData.email).first();
  
  return new Response(JSON.stringify({ id: result.id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Advanced Usage
```javascript
// Advanced Server Function with multiple Cloudflare services
// functions/api/process-upload.js
export default async function processUpload(request, context) {
  const { env } = context;
  
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    
    // Store file in R2
    const fileKey = `uploads/${userId}/${Date.now()}-${file.name}`;
    await env.STORAGE.put(fileKey, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      }
    });
    
    // Process with AI if it's an image
    let aiAnalysis = null;
    if (file.type.startsWith('image/')) {
      aiAnalysis = await env.AI.run('@cf/microsoft/resnet-50', {
        image: await file.arrayBuffer()
      });
    }
    
    // Save metadata to database
    const fileRecord = await env.DB.prepare(`
      INSERT INTO files (user_id, filename, file_key, content_type, ai_analysis)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id
    `).bind(
      userId,
      file.name,
      fileKey,
      file.type,
      JSON.stringify(aiAnalysis)
    ).first();
    
    // Queue background processing
    await env.QUEUE.send({
      type: 'file_uploaded',
      fileId: fileRecord.id,
      userId: userId
    });
    
    return new Response(JSON.stringify({
      success: true,
      fileId: fileRecord.id,
      analysis: aiAnalysis
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Upload processing failed:', error);
    return new Response(JSON.stringify({
      error: 'Upload processing failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Server Function returning React components
// functions/api/user-profile.js
export default async function userProfile(request, context) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return new Response('User ID required', { status: 400 });
  }
  
  // Fetch user data
  const user = await context.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(userId).first();
  
  if (!user) {
    return new Response('User not found', { status: 404 });
  }
  
  // Return JSX component
  return (
    <div className="user-profile">
      <img src={user.avatar_url} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
      <div className="stats">
        <span>Posts: {user.post_count}</span>
        <span>Followers: {user.follower_count}</span>
      </div>
    </div>
  );
}

// Streaming Server Function
// functions/api/live-data.js
export default function liveData(request, context) {
  return new Response(
    new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial data
        controller.enqueue(encoder.encode('data: {"type":"init","message":"Connected"}\n\n'));
        
        // Set up interval for live updates
        const interval = setInterval(async () => {
          try {
            const data = await context.env.DB.prepare(
              "SELECT COUNT(*) as active_users FROM sessions WHERE last_seen > datetime('now', '-5 minutes')"
            ).first();
            
            const message = JSON.stringify({
              type: 'update',
              timestamp: Date.now(),
              activeUsers: data.active_users
            });
            
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));
          } catch (error) {
            controller.enqueue(encoder.encode(`data: {"type":"error","message":"${error.message}"}\n\n`));
          }
        }, 1000);
        
        // Clean up on close
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      }
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    }
  );
}
```

## Performance Characteristics

### Benchmarks
- **Cold start time**: 10-50ms (V8 isolates advantage)
- **Execution time**: 1-50ms for typical operations
- **Throughput**: 1000+ requests per second per edge location
- **Database query time**: 5-20ms for D1 operations
- **File operations**: 10-100ms for R2 operations

### Scalability Considerations
- **Global distribution**: Functions run at 300+ edge locations
- **Automatic scaling**: Scale to zero and handle millions of requests
- **Concurrent execution**: Thousands of concurrent function executions
- **Resource limits**: 50ms CPU time, 128MB memory (extendable with paid plans)

### Resource Usage
- **Memory**: Efficient V8 isolate sharing
- **CPU**: Optimized for fast execution within Worker limits
- **Network**: Reduced latency due to edge execution
- **Storage**: Direct access to Cloudflare's distributed storage

## Benefits and Trade-offs

### Benefits
- ✅ **Edge performance**: Functions run close to users globally
- ✅ **Zero configuration**: No server setup or management required
- ✅ **Integrated services**: Direct access to D1, R2, Queues, AI
- ✅ **Automatic scaling**: Handle traffic spikes without configuration
- ✅ **Cost effective**: Pay only for actual usage
- ✅ **Type safety**: Full TypeScript support
- ✅ **Unified paradigm**: Same request/response model throughout

### Limitations
- ❌ **Platform lock-in**: Tied to Cloudflare ecosystem
- ❌ **Runtime limitations**: Limited Node.js API compatibility
- ❌ **CPU time limits**: 50ms execution limit (can be extended)
- ❌ **Memory constraints**: 128MB memory limit
- ❌ **Cold starts**: Though minimal, still present

### Trade-offs
- **Performance vs. Flexibility**: Excellent performance but platform constraints
- **Simplicity vs. Control**: Easy deployment but limited runtime customization
- **Cost vs. Features**: Cost-effective but feature set tied to Cloudflare services

## Comparison with Traditional Approaches

### Traditional Express.js API
```javascript
// Traditional Express.js server
const express = require('express');
const app = express();

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [req.body.name, req.body.email]
    );
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

### RedwoodSDK Server Function
```javascript
// RedwoodSDK Server Function
export default async function users(request, context) {
  const { method } = request;
  
  if (method === 'GET') {
    const users = await context.env.DB.prepare('SELECT * FROM users').all();
    return Response.json(users.results);
  }
  
  if (method === 'POST') {
    const userData = await request.json();
    const user = await context.env.DB.prepare(
      'INSERT INTO users (name, email) VALUES (?, ?) RETURNING *'
    ).bind(userData.name, userData.email).first();
    
    return Response.json(user, { status: 201 });
  }
  
  return new Response('Method not allowed', { status: 405 });
}
```

### Key Differences
| Aspect | Traditional Express | RedwoodSDK Functions | Impact |
|--------|-------------------|---------------------|---------|
| **Deployment** | Server/container setup | Deploy to edge | Faster deployment |
| **Scaling** | Manual scaling config | Automatic scaling | Reduced ops overhead |
| **Global reach** | Single region | 300+ edge locations | Better global performance |
| **Cold starts** | Always warm | Minimal cold starts | Better resource efficiency |
| **Service integration** | External APIs/SDKs | Built-in bindings | Simpler architecture |

## Integration Patterns

### With React Server Components
- **Shared context**: Both use same request/response paradigm
- **Data fetching**: Server Functions can provide data for RSC
- **Form actions**: Handle form submissions and return updated components

### With Realtime Features
- **WebSocket upgrade**: Functions can upgrade to WebSocket connections
- **Server-Sent Events**: Stream real-time data to clients
- **Event handling**: Process real-time events and trigger updates

### With Cloudflare Services
- **D1 Database**: Direct SQL queries and transactions
- **R2 Storage**: File upload, download, and management
- **Workers AI**: Content generation and analysis
- **Queues**: Background job processing
- **Durable Objects**: Stateful coordination

## Best Practices

### Recommended Approaches
1. **Keep functions focused**: Single responsibility per function
2. **Use proper HTTP methods**: Follow REST conventions
3. **Handle errors gracefully**: Implement comprehensive error handling
4. **Optimize database queries**: Use prepared statements and indexing
5. **Leverage edge caching**: Cache responses when appropriate
6. **Monitor performance**: Track execution time and resource usage

### Common Pitfalls
1. **Exceeding CPU limits**: Avoid heavy computation in functions
2. **Memory leaks**: Be careful with closures and event listeners
3. **Blocking operations**: Don't block the main thread
4. **Poor error handling**: Always handle and log errors properly
5. **Inefficient queries**: Avoid N+1 query problems

### Configuration Guidelines
```javascript
// wrangler.toml - Cloudflare configuration
name = "my-redwood-app"
main = "dist/index.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.production.d1_databases]]
binding = "DB"
database_name = "my-production-db"
database_id = "your-database-id"

[[env.production.r2_buckets]]
binding = "STORAGE"
bucket_name = "my-production-bucket"

[[env.production.queues]]
binding = "QUEUE"
queue = "my-production-queue"

[env.production.ai]
binding = "AI"
```

## Use Cases

### Ideal Scenarios
- **API endpoints**: RESTful APIs and GraphQL resolvers
- **Form processing**: Handle form submissions and validation
- **File uploads**: Process and store user uploads
- **Background jobs**: Queue and process background tasks
- **Real-time features**: WebSocket connections and streaming
- **AI integration**: Content generation and analysis

### Not Recommended For
- **Long-running processes**: Tasks exceeding CPU time limits
- **Heavy computation**: CPU-intensive operations
- **Large file processing**: Operations requiring significant memory
- **Legacy integrations**: Systems requiring specific Node.js modules

## Implementation Checklist

### Prerequisites
- [ ] Cloudflare account with Workers enabled
- [ ] Understanding of HTTP methods and status codes
- [ ] Basic knowledge of async/await patterns
- [ ] Familiarity with database operations

### Setup Steps
1. [ ] Create function files in `functions/` directory
2. [ ] Configure Cloudflare bindings in `wrangler.toml`
3. [ ] Implement request handling logic
4. [ ] Add error handling and validation
5. [ ] Test functions locally with Miniflare
6. [ ] Deploy and test in production environment

### Validation
- [ ] Test all HTTP methods and status codes
- [ ] Verify error handling works correctly
- [ ] Check performance metrics and resource usage
- [ ] Validate integration with Cloudflare services
- [ ] Confirm proper request/response handling

## Applicability Assessment

### For Our Application Portfolio
- **Fit Score**: 9/10
- **Implementation Effort**: Medium
- **Potential Impact**: Very High

### Specific Applications
- **API backends**: Perfect for microservices and API gateways
- **Form handlers**: Excellent for contact forms and user input
- **File processing**: Great for upload and media processing
- **Real-time apps**: Ideal for chat and collaboration features
- **AI-powered features**: Perfect for content generation and analysis

## References and Resources

### Official Documentation
- [Cloudflare Workers](https://developers.cloudflare.com/workers/): Platform documentation
- [RedwoodSDK Functions](https://docs.rwsdk.com/): Framework-specific implementation

### Community Resources
- [Syntax FM Episode #902](https://syntax.fm/show/902/fullstack-cloudflare-with-react-and-vite-redwood-sdk): Server Functions discussion
- [Cloudflare Blog Examples](https://blog.cloudflare.com/): Real-world use cases

### Related Patterns
- **React Server Components**: Complement functions for data fetching
- **Realtime Features**: Enable streaming and WebSocket connections
- **Cloudflare Integration**: Leverage full platform capabilities

## Notes and Observations

### Research Notes
- Server Functions in RedwoodSDK provide a clean abstraction over Cloudflare Workers
- The request/response paradigm creates consistency across the framework
- Direct service integration eliminates the need for external SDKs
- Performance characteristics are excellent for edge computing

### Questions for Further Investigation
- How to handle complex business logic within CPU time limits?
- What are the best patterns for error handling and logging?
- How to optimize database connections and query performance?
- What monitoring and debugging tools are available for production?

---
*Analysis completed on: 2025-05-23*
*Analyst: Codegen Agent*
*Version: 1.0*

