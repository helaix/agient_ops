# RedwoodSDK Basic Implementation Guide

## Quick Start Example

This guide provides practical examples for implementing RedwoodSDK patterns in real applications.

### 1. Basic Project Setup

```bash
# Create new RedwoodSDK project
npx degit redwoodjs/sdk/starters/standard my-redwood-app
cd my-redwood-app
npm install

# Start development server
npm run dev
```

### 2. Basic SSR Route

```javascript
// routes/index.js - Homepage with SSR
export default function HomePage() {
  return (
    <html>
      <head>
        <title>My RedwoodSDK App</title>
        <meta name="description" content="Built with RedwoodSDK" />
      </head>
      <body>
        <div className="container">
          <h1>Welcome to RedwoodSDK</h1>
          <p>This page is server-rendered at the edge!</p>
          <nav>
            <a href="/dashboard">Dashboard</a>
            <a href="/api/users">API</a>
          </nav>
        </div>
      </body>
    </html>
  );
}
```

### 3. React Server Component with Data

```javascript
// routes/dashboard.js - Dashboard with server-side data fetching
export default async function Dashboard(request, context) {
  // Direct database access in server component
  const stats = await context.env.DB.prepare(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN last_login > datetime('now', '-7 days') THEN 1 END) as active_users,
      AVG(session_duration) as avg_session
    FROM users
  `).first();
  
  const recentUsers = await context.env.DB.prepare(`
    SELECT name, email, last_login 
    FROM users 
    ORDER BY last_login DESC 
    LIMIT 10
  `).all();

  return (
    <html>
      <head>
        <title>Dashboard - My App</title>
      </head>
      <body>
        <div className="dashboard">
          <h1>Dashboard</h1>
          
          {/* Server-rendered stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.total_users}</p>
            </div>
            <div className="stat-card">
              <h3>Active Users</h3>
              <p className="stat-number">{stats.active_users}</p>
            </div>
            <div className="stat-card">
              <h3>Avg Session</h3>
              <p className="stat-number">{Math.round(stats.avg_session)}min</p>
            </div>
          </div>
          
          {/* Server-rendered user list */}
          <div className="recent-users">
            <h2>Recent Users</h2>
            <ul>
              {recentUsers.results.map(user => (
                <li key={user.email}>
                  <strong>{user.name}</strong> - {user.last_login}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Client component for interactivity */}
          <UserActions />
        </div>
      </body>
    </html>
  );
}

// Client component for interactive features
// components/UserActions.js
'use client';

import { useState } from 'react';

export default function UserActions() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/refresh-stats', { method: 'POST' });
      const result = await response.json();
      setMessage('Data refreshed successfully!');
      // Trigger page refresh to show updated data
      window.location.reload();
    } catch (error) {
      setMessage('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-actions">
      <button 
        onClick={refreshData} 
        disabled={loading}
        className="refresh-btn"
      >
        {loading ? 'Refreshing...' : 'Refresh Data'}
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
```

### 4. Server Function API

```javascript
// functions/api/users.js - RESTful API with Cloudflare services
export default async function usersAPI(request, context) {
  const { method } = request;
  const { env } = context;
  const url = new URL(request.url);

  try {
    switch (method) {
      case 'GET':
        return await getUsers(url, env);
      case 'POST':
        return await createUser(request, env);
      case 'PUT':
        return await updateUser(request, env);
      case 'DELETE':
        return await deleteUser(url, env);
      default:
        return new Response('Method not allowed', { status: 405 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function getUsers(url, env) {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const users = await env.DB.prepare(`
    SELECT id, name, email, created_at, last_login
    FROM users
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all();

  const total = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();

  return Response.json({
    users: users.results,
    pagination: {
      page,
      limit,
      total: total.count,
      pages: Math.ceil(total.count / limit)
    }
  });
}

async function createUser(request, env) {
  const userData = await request.json();
  
  // Validate input
  if (!userData.name || !userData.email) {
    return Response.json({ error: 'Name and email are required' }, { status: 400 });
  }

  // Check if user exists
  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(userData.email).first();

  if (existing) {
    return Response.json({ error: 'User already exists' }, { status: 409 });
  }

  // Create user
  const result = await env.DB.prepare(`
    INSERT INTO users (name, email, created_at)
    VALUES (?, ?, datetime('now'))
    RETURNING id, name, email, created_at
  `).bind(userData.name, userData.email).first();

  // Cache user data
  await env.CACHE.put(`user:${result.id}`, JSON.stringify(result), {
    expirationTtl: 3600
  });

  return Response.json(result, { status: 201 });
}
```

### 5. Real-time Chat Example

```javascript
// functions/api/chat.js - WebSocket chat implementation
export default async function chatHandler(request, context) {
  const upgradeHeader = request.headers.get('Upgrade');
  
  if (upgradeHeader === 'websocket') {
    return handleWebSocketUpgrade(request, context);
  }
  
  // Handle HTTP requests for chat history
  if (request.method === 'GET') {
    return getChatHistory(request, context);
  }
  
  return new Response('Expected WebSocket', { status: 400 });
}

async function handleWebSocketUpgrade(request, context) {
  const { env } = context;
  const url = new URL(request.url);
  const roomId = url.searchParams.get('room') || 'general';
  
  // Create WebSocket pair
  const [client, server] = Object.values(new WebSocketPair());
  
  // Get Durable Object for this chat room
  const durableObjectId = env.CHAT_ROOM.idFromName(roomId);
  const chatRoom = env.CHAT_ROOM.get(durableObjectId);
  
  // Forward WebSocket to Durable Object
  await chatRoom.fetch('http://localhost/websocket', {
    headers: { 'Upgrade': 'websocket' },
    body: server
  });
  
  return new Response(null, {
    status: 101,
    webSocket: client
  });
}

async function getChatHistory(request, context) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get('room') || 'general';
  const limit = parseInt(url.searchParams.get('limit') || '50');
  
  const messages = await context.env.DB.prepare(`
    SELECT m.*, u.name as user_name
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ?
    ORDER BY m.created_at DESC
    LIMIT ?
  `).bind(roomId, limit).all();
  
  return Response.json({
    room: roomId,
    messages: messages.results.reverse()
  });
}
```

### 6. File Upload with AI Processing

```javascript
// functions/api/upload.js - File upload with AI analysis
export default async function uploadHandler(request, context) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { env } = context;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    
    if (!file || !userId) {
      return Response.json({ error: 'File and userId required' }, { status: 400 });
    }

    // Generate unique file key
    const fileKey = `uploads/${userId}/${Date.now()}-${file.name}`;
    
    // Upload to R2
    await env.STORAGE.put(fileKey, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        originalName: file.name,
        uploadedBy: userId,
      }
    });

    // Analyze with AI if it's an image
    let analysis = null;
    if (file.type.startsWith('image/')) {
      analysis = await env.AI.run('@cf/microsoft/resnet-50', {
        image: await file.arrayBuffer()
      });
    }

    // Save metadata to database
    const fileRecord = await env.DB.prepare(`
      INSERT INTO files (user_id, filename, file_key, content_type, file_size, ai_analysis, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      RETURNING id, created_at
    `).bind(
      userId,
      file.name,
      fileKey,
      file.type,
      file.size,
      JSON.stringify(analysis)
    ).first();

    // Queue background processing
    await env.QUEUE.send({
      type: 'file_uploaded',
      fileId: fileRecord.id,
      fileKey: fileKey,
      userId: userId
    });

    return Response.json({
      success: true,
      fileId: fileRecord.id,
      fileUrl: `https://storage.example.com/${fileKey}`,
      analysis: analysis
    });

  } catch (error) {
    console.error('Upload failed:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

### 7. Configuration Files

```toml
# wrangler.toml - Cloudflare configuration
name = "my-redwood-app"
main = "dist/index.js"
compatibility_date = "2024-01-01"

[env.development]
vars = { ENVIRONMENT = "development" }

[env.production]
vars = { ENVIRONMENT = "production" }

# D1 Database
[[env.production.d1_databases]]
binding = "DB"
database_name = "my-app-production"
database_id = "your-database-id"

# R2 Storage
[[env.production.r2_buckets]]
binding = "STORAGE"
bucket_name = "my-app-storage"

# KV Cache
[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

# Queues
[[env.production.queues]]
binding = "QUEUE"
queue = "my-app-queue"

# Workers AI
[env.production.ai]
binding = "AI"

# Durable Objects
[[durable_objects.bindings]]
name = "CHAT_ROOM"
class_name = "ChatRoom"
```

```javascript
// vite.config.js - Vite configuration
import { defineConfig } from 'vite';
import { redwoodSDK } from '@redwoodjs/sdk/vite';

export default defineConfig({
  plugins: [
    redwoodSDK({
      ssr: true,
      rsc: {
        enabled: true,
        streaming: true
      }
    })
  ],
  build: {
    target: 'esnext'
  }
});
```

### 8. Database Schema

```sql
-- schema.sql - Database schema for examples
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  session_duration INTEGER DEFAULT 0
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  file_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  ai_analysis TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at);
CREATE INDEX idx_files_user_created ON files(user_id, created_at);
```

### 9. Deployment Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy

# Database migrations
npx wrangler d1 migrations apply my-app-production

# Create D1 database
npx wrangler d1 create my-app-production

# Create R2 bucket
npx wrangler r2 bucket create my-app-storage

# Create Queue
npx wrangler queues create my-app-queue
```

This implementation guide provides practical, working examples that demonstrate the key RedwoodSDK patterns analyzed in our research. Each example builds upon the previous ones, showing how the different patterns work together to create a complete application.

---
*Implementation Guide Version: 1.0*
*Created: 2025-05-23*

