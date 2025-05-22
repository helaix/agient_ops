#!/usr/bin/env node

/**
 * Monitoring Dashboard
 * 
 * Real-time monitoring and visualization of the multi-agent workflow system
 * Provides metrics, alerts, and system health monitoring
 */

const express = require('express');
const WebSocket = require('ws');
const winston = require('winston');
const axios = require('axios');
require('dotenv').config();

class MonitoringDashboard {
  constructor() {
    this.app = express();
    this.metrics = {
      agents: {},
      system: {
        uptime: Date.now(),
        totalRequests: 0,
        errors: 0,
        lastUpdate: new Date()
      },
      performance: {
        reviewCycleTime: [],
        contextSwitchFrequency: [],
        integrationConflicts: 0,
        patternApplicationRate: 0,
        linearStateAccuracy: 0
      }
    };
    
    this.alerts = [];
    this.setupLogger();
    this.setupWebSocketServer();
    this.setupExpressServer();
  }

  setupLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({ label: 'MonitoringDashboard' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/monitoring.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }

  setupWebSocketServer() {
    this.wss = new WebSocket.Server({ port: 8081 });
    this.wss.on('connection', (ws) => {
      this.logger.info('Dashboard client connected');
      
      // Send current metrics to new client
      ws.send(JSON.stringify({
        type: 'initial_data',
        data: this.getFullMetrics()
      }));

      ws.on('close', () => {
        this.logger.info('Dashboard client disconnected');
      });
    });
  }

  setupExpressServer() {
    this.app.use(express.json());
    this.app.use(express.static('public'));

    // Main dashboard endpoint
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    // Metrics API endpoints
    this.app.get('/api/metrics', (req, res) => {
      res.json(this.getFullMetrics());
    });

    this.app.get('/api/agents', (req, res) => {
      res.json(this.metrics.agents);
    });

    this.app.get('/api/performance', (req, res) => {
      res.json(this.metrics.performance);
    });

    this.app.get('/api/alerts', (req, res) => {
      res.json(this.alerts);
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: Date.now() - this.metrics.system.uptime,
        timestamp: new Date().toISOString()
      });
    });

    // Alert management
    this.app.post('/api/alerts/:id/acknowledge', (req, res) => {
      const alertId = req.params.id;
      const alert = this.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedAt = new Date();
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Alert not found' });
      }
    });

    this.app.listen(4000, () => {
      this.logger.info('Monitoring Dashboard listening on port 4000');
    });
  }

  async start() {
    this.logger.info('Starting Monitoring Dashboard');
    
    // Start collecting metrics from agents
    this.startMetricsCollection();
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    // Start alert processing
    this.startAlertProcessing();
    
    this.logger.info('Monitoring Dashboard started successfully');
    console.log('🔍 Monitoring Dashboard available at: http://localhost:4000');
  }

  startMetricsCollection() {
    // Collect metrics from orchestrator
    setInterval(async () => {
      try {
        const response = await axios.get('http://localhost:3000/metrics');
        this.updateMetrics('orchestrator', response.data);
      } catch (error) {
        this.logger.warn('Failed to collect orchestrator metrics:', error.message);
      }
    }, 30000); // Every 30 seconds

    // Collect metrics from integration dashboard
    setInterval(async () => {
      try {
        const response = await axios.get('http://localhost:3001/dashboard');
        this.updateMetrics('integration-dashboard', response.data);
      } catch (error) {
        this.logger.warn('Failed to collect integration dashboard metrics:', error.message);
      }
    }, 30000); // Every 30 seconds
  }

  startHealthMonitoring() {
    setInterval(async () => {
      await this.checkSystemHealth();
    }, 60000); // Every minute
  }

  startAlertProcessing() {
    setInterval(() => {
      this.processAlerts();
    }, 10000); // Every 10 seconds
  }

  updateMetrics(source, data) {
    this.metrics.agents[source] = {
      ...data,
      lastUpdate: new Date(),
      status: 'healthy'
    };

    // Update performance metrics
    if (data.avgReviewCycleTime) {
      this.metrics.performance.reviewCycleTime.push({
        value: data.avgReviewCycleTime,
        timestamp: new Date()
      });
      
      // Keep only last 100 data points
      if (this.metrics.performance.reviewCycleTime.length > 100) {
        this.metrics.performance.reviewCycleTime.shift();
      }
    }

    if (data.avgContextSwitches) {
      this.metrics.performance.contextSwitchFrequency.push({
        value: data.avgContextSwitches,
        timestamp: new Date()
      });
      
      if (this.metrics.performance.contextSwitchFrequency.length > 100) {
        this.metrics.performance.contextSwitchFrequency.shift();
      }
    }

    if (data.integrationConflicts !== undefined) {
      this.metrics.performance.integrationConflicts = data.integrationConflicts;
    }

    if (data.patternApplicationRate !== undefined) {
      this.metrics.performance.patternApplicationRate = data.patternApplicationRate;
    }

    if (data.linearStateAccuracy !== undefined) {
      this.metrics.performance.linearStateAccuracy = data.linearStateAccuracy;
    }

    // Broadcast updated metrics to connected clients
    this.broadcastMetrics();

    // Check for alert conditions
    this.checkAlertConditions(source, data);
  }

  async checkSystemHealth() {
    const services = [
      { name: 'orchestrator', url: 'http://localhost:3000/health' },
      { name: 'integration-dashboard', url: 'http://localhost:3001/dashboard' }
    ];

    for (const service of services) {
      try {
        const response = await axios.get(service.url, { timeout: 5000 });
        this.updateServiceHealth(service.name, 'healthy');
      } catch (error) {
        this.updateServiceHealth(service.name, 'unhealthy');
        this.createAlert('service_down', `Service ${service.name} is not responding`, 'critical');
      }
    }
  }

  updateServiceHealth(serviceName, status) {
    if (!this.metrics.agents[serviceName]) {
      this.metrics.agents[serviceName] = {};
    }
    
    this.metrics.agents[serviceName].health = status;
    this.metrics.agents[serviceName].lastHealthCheck = new Date();
  }

  checkAlertConditions(source, data) {
    // Check review cycle time
    if (data.avgReviewCycleTime > parseFloat(process.env.TARGET_REVIEW_CYCLE_TIME || 48)) {
      this.createAlert(
        'review_cycle_slow',
        `Review cycle time (${data.avgReviewCycleTime}h) exceeds target (${process.env.TARGET_REVIEW_CYCLE_TIME}h)`,
        'warning'
      );
    }

    // Check context switching frequency
    if (data.avgContextSwitches > parseFloat(process.env.TARGET_CONTEXT_SWITCHES || 3)) {
      this.createAlert(
        'context_switching_high',
        `Context switching frequency (${data.avgContextSwitches}/day) exceeds target (${process.env.TARGET_CONTEXT_SWITCHES}/day)`,
        'warning'
      );
    }

    // Check integration conflicts
    if (data.integrationConflicts > parseFloat(process.env.TARGET_INTEGRATION_CONFLICTS || 0)) {
      this.createAlert(
        'integration_conflicts',
        `Integration conflicts detected: ${data.integrationConflicts}`,
        'critical'
      );
    }

    // Check Linear state accuracy
    if (data.linearStateAccuracy < parseFloat(process.env.TARGET_LINEAR_STATE_ACCURACY || 95)) {
      this.createAlert(
        'linear_accuracy_low',
        `Linear state accuracy (${data.linearStateAccuracy}%) below target (${process.env.TARGET_LINEAR_STATE_ACCURACY}%)`,
        'warning'
      );
    }
  }

  createAlert(type, message, severity) {
    // Check if similar alert already exists and is not acknowledged
    const existingAlert = this.alerts.find(a => 
      a.type === type && 
      !a.acknowledged && 
      Date.now() - a.timestamp.getTime() < 3600000 // Within last hour
    );

    if (existingAlert) {
      existingAlert.count = (existingAlert.count || 1) + 1;
      existingAlert.lastOccurrence = new Date();
      return;
    }

    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      severity,
      timestamp: new Date(),
      acknowledged: false,
      count: 1
    };

    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    this.logger.warn(`Alert created: ${severity} - ${message}`);
    
    // Broadcast alert to connected clients
    this.broadcastAlert(alert);
  }

  processAlerts() {
    // Auto-acknowledge old alerts
    const oneHourAgo = Date.now() - 3600000;
    this.alerts.forEach(alert => {
      if (!alert.acknowledged && alert.timestamp.getTime() < oneHourAgo) {
        alert.acknowledged = true;
        alert.acknowledgedAt = new Date();
        alert.autoAcknowledged = true;
      }
    });
  }

  broadcastMetrics() {
    const data = {
      type: 'metrics_update',
      data: this.getFullMetrics()
    };

    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  broadcastAlert(alert) {
    const data = {
      type: 'new_alert',
      data: alert
    };

    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  getFullMetrics() {
    return {
      agents: this.metrics.agents,
      system: {
        ...this.metrics.system,
        uptime: Date.now() - this.metrics.system.uptime
      },
      performance: this.metrics.performance,
      alerts: this.alerts.filter(a => !a.acknowledged),
      summary: this.generateSummary()
    };
  }

  generateSummary() {
    const activeAgents = Object.keys(this.metrics.agents).filter(
      name => this.metrics.agents[name].health === 'healthy'
    ).length;

    const totalAgents = Object.keys(this.metrics.agents).length;
    
    const activeAlerts = this.alerts.filter(a => !a.acknowledged).length;
    
    const criticalAlerts = this.alerts.filter(a => 
      !a.acknowledged && a.severity === 'critical'
    ).length;

    return {
      systemHealth: totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 100,
      activeAgents,
      totalAgents,
      activeAlerts,
      criticalAlerts,
      lastUpdate: new Date()
    };
  }

  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multi-Agent Workflow Optimization - Monitoring Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .metric-label {
            color: #666;
            margin-top: 5px;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-healthy { background-color: #4CAF50; }
        .status-warning { background-color: #FF9800; }
        .status-critical { background-color: #F44336; }
        .alerts-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .alert {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            border-left: 4px solid;
        }
        .alert-warning {
            background-color: #fff3cd;
            border-color: #ffc107;
        }
        .alert-critical {
            background-color: #f8d7da;
            border-color: #dc3545;
        }
        .refresh-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px;
            border-radius: 4px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 Multi-Agent Workflow Optimization</h1>
        <p>Real-time monitoring and system health dashboard</p>
    </div>

    <div class="refresh-indicator" id="refreshIndicator">
        📊 Data Updated
    </div>

    <div class="metrics-grid" id="metricsGrid">
        <!-- Metrics will be populated by JavaScript -->
    </div>

    <div class="alerts-section">
        <h2>🚨 Active Alerts</h2>
        <div id="alertsContainer">
            <!-- Alerts will be populated by JavaScript -->
        </div>
    </div>

    <script>
        let ws;
        let metrics = {};

        function connectWebSocket() {
            ws = new WebSocket('ws://localhost:8081');
            
            ws.onopen = function() {
                console.log('Connected to monitoring dashboard');
            };
            
            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                
                if (data.type === 'initial_data' || data.type === 'metrics_update') {
                    metrics = data.data;
                    updateDashboard();
                    showRefreshIndicator();
                } else if (data.type === 'new_alert') {
                    addAlert(data.data);
                }
            };
            
            ws.onclose = function() {
                console.log('Disconnected from monitoring dashboard, reconnecting...');
                setTimeout(connectWebSocket, 5000);
            };
        }

        function updateDashboard() {
            updateMetricsGrid();
            updateAlerts();
        }

        function updateMetricsGrid() {
            const grid = document.getElementById('metricsGrid');
            
            const summary = metrics.summary || {};
            const performance = metrics.performance || {};
            
            grid.innerHTML = \`
                <div class="metric-card">
                    <div class="metric-value">
                        <span class="status-indicator status-\${summary.systemHealth > 80 ? 'healthy' : summary.systemHealth > 50 ? 'warning' : 'critical'}"></span>
                        \${summary.systemHealth ? summary.systemHealth.toFixed(1) : 0}%
                    </div>
                    <div class="metric-label">System Health</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">\${summary.activeAgents || 0}/\${summary.totalAgents || 0}</div>
                    <div class="metric-label">Active Agents</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">
                        <span class="status-indicator status-\${performance.reviewCycleTime && performance.reviewCycleTime.length > 0 && performance.reviewCycleTime[performance.reviewCycleTime.length - 1].value > 48 ? 'warning' : 'healthy'}"></span>
                        \${performance.reviewCycleTime && performance.reviewCycleTime.length > 0 ? performance.reviewCycleTime[performance.reviewCycleTime.length - 1].value.toFixed(1) : 0}h
                    </div>
                    <div class="metric-label">Avg Review Cycle Time</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">
                        <span class="status-indicator status-\${performance.contextSwitchFrequency && performance.contextSwitchFrequency.length > 0 && performance.contextSwitchFrequency[performance.contextSwitchFrequency.length - 1].value > 3 ? 'warning' : 'healthy'}"></span>
                        \${performance.contextSwitchFrequency && performance.contextSwitchFrequency.length > 0 ? performance.contextSwitchFrequency[performance.contextSwitchFrequency.length - 1].value.toFixed(1) : 0}
                    </div>
                    <div class="metric-label">Context Switches/Day</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">
                        <span class="status-indicator status-\${performance.integrationConflicts > 0 ? 'critical' : 'healthy'}"></span>
                        \${performance.integrationConflicts || 0}
                    </div>
                    <div class="metric-label">Integration Conflicts</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">
                        <span class="status-indicator status-\${performance.linearStateAccuracy < 95 ? 'warning' : 'healthy'}"></span>
                        \${performance.linearStateAccuracy ? performance.linearStateAccuracy.toFixed(1) : 0}%
                    </div>
                    <div class="metric-label">Linear State Accuracy</div>
                </div>
            \`;
        }

        function updateAlerts() {
            const container = document.getElementById('alertsContainer');
            const alerts = metrics.alerts || [];
            
            if (alerts.length === 0) {
                container.innerHTML = '<p style="color: #666;">No active alerts 🎉</p>';
                return;
            }
            
            container.innerHTML = alerts.map(alert => \`
                <div class="alert alert-\${alert.severity}">
                    <strong>\${alert.severity.toUpperCase()}</strong>: \${alert.message}
                    <br><small>First occurred: \${new Date(alert.timestamp).toLocaleString()}</small>
                    \${alert.count > 1 ? \`<br><small>Occurred \${alert.count} times</small>\` : ''}
                </div>
            \`).join('');
        }

        function addAlert(alert) {
            // Add new alert to the list and update display
            if (!metrics.alerts) metrics.alerts = [];
            metrics.alerts.push(alert);
            updateAlerts();
        }

        function showRefreshIndicator() {
            const indicator = document.getElementById('refreshIndicator');
            indicator.style.display = 'block';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 2000);
        }

        // Initialize dashboard
        connectWebSocket();
        
        // Fallback: refresh data every 30 seconds if WebSocket fails
        setInterval(() => {
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                fetch('/api/metrics')
                    .then(response => response.json())
                    .then(data => {
                        metrics = data;
                        updateDashboard();
                    })
                    .catch(console.error);
            }
        }, 30000);
    </script>
</body>
</html>
    `;
  }
}

// Start the monitoring dashboard if this file is run directly
if (require.main === module) {
  const dashboard = new MonitoringDashboard();
  dashboard.start().catch(error => {
    console.error('Failed to start Monitoring Dashboard:', error);
    process.exit(1);
  });
}

module.exports = MonitoringDashboard;

