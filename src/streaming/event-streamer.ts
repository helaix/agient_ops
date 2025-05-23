import { Env, EventData, EventFilter, StreamConnection, StreamMessage } from '@/types';

/**
 * Real-time event streaming implementation
 * Supports WebSocket and Server-Sent Events for real-time updates
 */
export class EventStreamer {
  private connections: Map<string, StreamConnection> = new Map();
  
  constructor(private env: Env) {}

  /**
   * Handle WebSocket connection requests
   */
  async handleWebSocketConnection(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const agentId = url.searchParams.get('agentId');
      const filters = url.searchParams.get('filters');
      
      if (!agentId) {
        return new Response('Missing agentId parameter', { status: 400 });
      }

      // Validate agent authentication
      const authHeader = request.headers.get('Authorization');
      if (!await this.validateAgentAuth(agentId, authHeader)) {
        return new Response('Unauthorized', { status: 401 });
      }

      // Parse filters
      let eventFilters: EventFilter[] = [];
      if (filters) {
        try {
          eventFilters = JSON.parse(decodeURIComponent(filters));
        } catch (error) {
          return new Response('Invalid filters format', { status: 400 });
        }
      }

      // Upgrade to WebSocket
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
      }

      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      // Accept the WebSocket connection
      server.accept();

      // Create connection record
      const connectionId = crypto.randomUUID();
      const connection: StreamConnection = {
        id: connectionId,
        agentId,
        connectionType: 'websocket',
        filters: eventFilters,
        connectedAt: Date.now(),
        lastActivity: Date.now()
      };

      // Store connection
      this.connections.set(connectionId, connection);
      await this.storeConnection(connection);

      // Set up event handlers
      server.addEventListener('message', async (event) => {
        await this.handleWebSocketMessage(connectionId, event.data);
      });

      server.addEventListener('close', async () => {
        await this.handleConnectionClose(connectionId);
      });

      server.addEventListener('error', async (error) => {
        console.error(`WebSocket error for connection ${connectionId}:`, error);
        await this.handleConnectionClose(connectionId);
      });

      // Send welcome message
      const welcomeMessage: StreamMessage = {
        type: 'subscription_update',
        timestamp: Date.now(),
        data: {
          status: 'connected',
          connectionId,
          filters: eventFilters
        }
      };
      
      server.send(JSON.stringify(welcomeMessage));

      // Start heartbeat
      this.startHeartbeat(connectionId, server);

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  /**
   * Handle Server-Sent Events connection requests
   */
  async handleSSEConnection(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const agentId = url.searchParams.get('agentId');
      const filters = url.searchParams.get('filters');
      
      if (!agentId) {
        return new Response('Missing agentId parameter', { status: 400 });
      }

      // Validate agent authentication
      const authHeader = request.headers.get('Authorization');
      if (!await this.validateAgentAuth(agentId, authHeader)) {
        return new Response('Unauthorized', { status: 401 });
      }

      // Parse filters
      let eventFilters: EventFilter[] = [];
      if (filters) {
        try {
          eventFilters = JSON.parse(decodeURIComponent(filters));
        } catch (error) {
          return new Response('Invalid filters format', { status: 400 });
        }
      }

      // Create connection record
      const connectionId = crypto.randomUUID();
      const connection: StreamConnection = {
        id: connectionId,
        agentId,
        connectionType: 'sse',
        filters: eventFilters,
        connectedAt: Date.now(),
        lastActivity: Date.now()
      };

      // Store connection
      this.connections.set(connectionId, connection);
      await this.storeConnection(connection);

      // Create SSE stream
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      // Send initial connection message
      const welcomeMessage = `data: ${JSON.stringify({
        type: 'subscription_update',
        timestamp: Date.now(),
        data: {
          status: 'connected',
          connectionId,
          filters: eventFilters
        }
      })}\n\n`;
      
      await writer.write(new TextEncoder().encode(welcomeMessage));

      // Set up periodic heartbeat
      const heartbeatInterval = setInterval(async () => {
        try {
          const heartbeat = `data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: Date.now(),
            data: { connectionId }
          })}\n\n`;
          
          await writer.write(new TextEncoder().encode(heartbeat));
        } catch (error) {
          console.error('SSE heartbeat error:', error);
          clearInterval(heartbeatInterval);
          await this.handleConnectionClose(connectionId);
        }
      }, 30000); // 30 seconds

      // Store writer for sending events
      (connection as any).writer = writer;
      (connection as any).heartbeatInterval = heartbeatInterval;

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        }
      });
    } catch (error) {
      console.error('SSE connection error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  /**
   * Broadcast event to matching subscribers
   */
  async broadcastEvent(event: EventData, subscribers?: string[]): Promise<void> {
    try {
      const connections = subscribers 
        ? Array.from(this.connections.values()).filter(conn => subscribers.includes(conn.agentId))
        : Array.from(this.connections.values());

      const message: StreamMessage = {
        type: 'event',
        timestamp: Date.now(),
        data: event
      };

      const promises = connections
        .filter(conn => this.shouldSendEvent(event, conn.filters))
        .map(conn => this.sendMessageToConnection(conn, message));

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Event broadcast error:', error);
    }
  }

  /**
   * Manage subscriptions (subscribe/unsubscribe)
   */
  async manageSubscriptions(
    agentId: string, 
    action: 'subscribe' | 'unsubscribe',
    filters?: EventFilter[]
  ): Promise<void> {
    const agentConnections = Array.from(this.connections.values())
      .filter(conn => conn.agentId === agentId);

    if (action === 'subscribe' && filters) {
      // Update filters for existing connections
      for (const connection of agentConnections) {
        connection.filters = filters;
        await this.storeConnection(connection);
        
        const updateMessage: StreamMessage = {
          type: 'subscription_update',
          timestamp: Date.now(),
          data: {
            status: 'filters_updated',
            filters
          }
        };
        
        await this.sendMessageToConnection(connection, updateMessage);
      }
    } else if (action === 'unsubscribe') {
      // Close all connections for the agent
      for (const connection of agentConnections) {
        await this.handleConnectionClose(connection.id);
      }
    }
  }

  /**
   * Get active connections for monitoring
   */
  async getActiveConnections(): Promise<StreamConnection[]> {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats(): Promise<{
    totalConnections: number;
    connectionsByType: Record<string, number>;
    connectionsByAgent: Record<string, number>;
    averageConnectionDuration: number;
  }> {
    const connections = Array.from(this.connections.values());
    const now = Date.now();
    
    const connectionsByType: Record<string, number> = {};
    const connectionsByAgent: Record<string, number> = {};
    let totalDuration = 0;

    for (const conn of connections) {
      connectionsByType[conn.connectionType] = (connectionsByType[conn.connectionType] || 0) + 1;
      connectionsByAgent[conn.agentId] = (connectionsByAgent[conn.agentId] || 0) + 1;
      totalDuration += now - conn.connectedAt;
    }

    const averageConnectionDuration = connections.length > 0 
      ? totalDuration / connections.length 
      : 0;

    return {
      totalConnections: connections.length,
      connectionsByType,
      connectionsByAgent,
      averageConnectionDuration
    };
  }

  /**
   * Handle WebSocket message from client
   */
  private async handleWebSocketMessage(connectionId: string, data: any): Promise<void> {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) return;

      connection.lastActivity = Date.now();
      
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'ping':
          // Respond with pong
          const pongMessage: StreamMessage = {
            type: 'heartbeat',
            timestamp: Date.now(),
            data: { pong: true }
          };
          await this.sendMessageToConnection(connection, pongMessage);
          break;
          
        case 'update_filters':
          // Update subscription filters
          if (message.filters) {
            connection.filters = message.filters;
            await this.storeConnection(connection);
          }
          break;
          
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('WebSocket message handling error:', error);
    }
  }

  /**
   * Handle connection close
   */
  private async handleConnectionClose(connectionId: string): Promise<void> {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) return;

      // Clean up intervals
      if ((connection as any).heartbeatInterval) {
        clearInterval((connection as any).heartbeatInterval);
      }

      // Close writer for SSE
      if ((connection as any).writer) {
        try {
          await (connection as any).writer.close();
        } catch (error) {
          // Writer might already be closed
        }
      }

      // Remove from memory
      this.connections.delete(connectionId);
      
      // Remove from storage
      await this.removeConnection(connectionId);
      
      console.log(`Connection ${connectionId} closed`);
    } catch (error) {
      console.error('Connection close error:', error);
    }
  }

  /**
   * Start heartbeat for WebSocket connection
   */
  private startHeartbeat(connectionId: string, webSocket: WebSocket): void {
    const interval = setInterval(() => {
      try {
        const connection = this.connections.get(connectionId);
        if (!connection || webSocket.readyState !== WebSocket.OPEN) {
          clearInterval(interval);
          return;
        }

        const heartbeat: StreamMessage = {
          type: 'heartbeat',
          timestamp: Date.now(),
          data: { connectionId }
        };

        webSocket.send(JSON.stringify(heartbeat));
      } catch (error) {
        console.error('Heartbeat error:', error);
        clearInterval(interval);
      }
    }, 30000); // 30 seconds
  }

  /**
   * Send message to a specific connection
   */
  private async sendMessageToConnection(
    connection: StreamConnection, 
    message: StreamMessage
  ): Promise<void> {
    try {
      const messageStr = JSON.stringify(message);
      
      if (connection.connectionType === 'websocket') {
        // WebSocket connections are handled by the WebSocket object
        // This would need to be implemented with a connection registry
        console.log(`Would send WebSocket message to ${connection.id}`);
      } else if (connection.connectionType === 'sse') {
        const writer = (connection as any).writer;
        if (writer) {
          const sseMessage = `data: ${messageStr}\n\n`;
          await writer.write(new TextEncoder().encode(sseMessage));
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      await this.handleConnectionClose(connection.id);
    }
  }

  /**
   * Check if event should be sent to connection based on filters
   */
  private shouldSendEvent(event: EventData, filters: EventFilter[]): boolean {
    if (filters.length === 0) {
      return true; // No filters means accept all events
    }

    for (const filter of filters) {
      if (this.eventMatchesFilter(event, filter)) {
        return filter.action === 'include';
      }
    }

    return false;
  }

  /**
   * Check if event matches a filter
   */
  private eventMatchesFilter(event: EventData, filter: EventFilter): boolean {
    // Check source filter
    if (filter.source && filter.source !== event.source) {
      return false;
    }

    // Check event type filter
    if (filter.eventType && filter.eventType !== event.type) {
      return false;
    }

    // Check conditions
    for (const condition of filter.conditions) {
      if (!this.evaluateCondition(event, condition)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate a filter condition against an event
   */
  private evaluateCondition(event: EventData, condition: any): boolean {
    const value = this.getValueByPath(event, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'regex':
        const regex = new RegExp(condition.value, condition.caseSensitive ? '' : 'i');
        return regex.test(String(value));
      case 'exists':
        return value !== undefined && value !== null;
      case 'gt':
        return Number(value) > Number(condition.value);
      case 'lt':
        return Number(value) < Number(condition.value);
      default:
        return false;
    }
  }

  /**
   * Get value from object by JSON path
   */
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Validate agent authentication
   */
  private async validateAgentAuth(agentId: string, authHeader: string | null): Promise<boolean> {
    if (!authHeader) return false;
    
    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '');
    
    // Validate against agent API key
    return token === this.env.AGENT_API_KEY;
  }

  /**
   * Store connection in KV for persistence
   */
  private async storeConnection(connection: StreamConnection): Promise<void> {
    const key = `connection:${connection.id}`;
    await this.env.SUBSCRIPTIONS.put(key, JSON.stringify(connection), {
      expirationTtl: 24 * 60 * 60 // 24 hours
    });
  }

  /**
   * Remove connection from KV
   */
  private async removeConnection(connectionId: string): Promise<void> {
    const key = `connection:${connectionId}`;
    await this.env.SUBSCRIPTIONS.delete(key);
  }
}

