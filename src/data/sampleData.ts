import { Agent, ConnectionType } from '../types/workflow';

// Sample agents for the palette
export const sampleAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Data Processor',
    description: 'Processes and transforms data from various sources',
    type: 'processing',
    capabilities: {
      inputs: ['JSON', 'CSV', 'Text'],
      outputs: ['JSON', 'Structured Data']
    },
    configOptions: [
      {
        key: 'processingMode',
        label: 'Processing Mode',
        type: 'select',
        defaultValue: 'standard',
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Batch', value: 'batch' },
          { label: 'Stream', value: 'stream' }
        ]
      },
      {
        key: 'maxBatchSize',
        label: 'Max Batch Size',
        type: 'number',
        defaultValue: 100
      }
    ]
  },
  {
    id: 'agent-2',
    name: 'Web Scraper',
    description: 'Extracts data from websites and web services',
    type: 'web',
    capabilities: {
      inputs: ['URL', 'API Endpoint'],
      outputs: ['HTML', 'JSON', 'Text']
    },
    configOptions: [
      {
        key: 'requestInterval',
        label: 'Request Interval (ms)',
        type: 'number',
        defaultValue: 1000
      },
      {
        key: 'useProxy',
        label: 'Use Proxy',
        type: 'boolean',
        defaultValue: false
      }
    ]
  },
  {
    id: 'agent-3',
    name: 'Text Analyzer',
    description: 'Analyzes text for sentiment, entities, and key phrases',
    type: 'processing',
    capabilities: {
      inputs: ['Text'],
      outputs: ['Analysis Results', 'Entities', 'Sentiment']
    },
    configOptions: [
      {
        key: 'language',
        label: 'Language',
        type: 'select',
        defaultValue: 'en',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' }
        ]
      },
      {
        key: 'analysisDepth',
        label: 'Analysis Depth',
        type: 'select',
        defaultValue: 'standard',
        options: [
          { label: 'Basic', value: 'basic' },
          { label: 'Standard', value: 'standard' },
          { label: 'Deep', value: 'deep' }
        ]
      }
    ]
  },
  {
    id: 'agent-4',
    name: 'Database Connector',
    description: 'Connects to various database systems for data retrieval and storage',
    type: 'data',
    capabilities: {
      inputs: ['Query', 'Data'],
      outputs: ['Query Results', 'Status']
    },
    configOptions: [
      {
        key: 'databaseType',
        label: 'Database Type',
        type: 'select',
        defaultValue: 'sql',
        options: [
          { label: 'SQL', value: 'sql' },
          { label: 'NoSQL', value: 'nosql' },
          { label: 'Graph', value: 'graph' }
        ]
      },
      {
        key: 'connectionString',
        label: 'Connection String',
        type: 'text',
        defaultValue: ''
      }
    ]
  },
  {
    id: 'agent-5',
    name: 'Email Sender',
    description: 'Sends emails based on templates and data inputs',
    type: 'communication',
    capabilities: {
      inputs: ['Template', 'Data'],
      outputs: ['Status']
    },
    configOptions: [
      {
        key: 'smtpServer',
        label: 'SMTP Server',
        type: 'text',
        defaultValue: 'smtp.example.com'
      },
      {
        key: 'fromAddress',
        label: 'From Address',
        type: 'text',
        defaultValue: 'noreply@example.com'
      }
    ]
  },
  {
    id: 'agent-6',
    name: 'Document Generator',
    description: 'Generates documents in various formats based on templates and data',
    type: 'document',
    capabilities: {
      inputs: ['Template', 'Data'],
      outputs: ['PDF', 'DOCX', 'HTML']
    },
    configOptions: [
      {
        key: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        defaultValue: 'pdf',
        options: [
          { label: 'PDF', value: 'pdf' },
          { label: 'DOCX', value: 'docx' },
          { label: 'HTML', value: 'html' }
        ]
      },
      {
        key: 'templateEngine',
        label: 'Template Engine',
        type: 'select',
        defaultValue: 'handlebars',
        options: [
          { label: 'Handlebars', value: 'handlebars' },
          { label: 'Mustache', value: 'mustache' },
          { label: 'EJS', value: 'ejs' }
        ]
      }
    ]
  },
  {
    id: 'agent-7',
    name: 'Decision Maker',
    description: 'Makes decisions based on rules and input data',
    type: 'processing',
    capabilities: {
      inputs: ['Data', 'Rules'],
      outputs: ['Decision', 'Action']
    },
    configOptions: [
      {
        key: 'decisionMode',
        label: 'Decision Mode',
        type: 'select',
        defaultValue: 'rules',
        options: [
          { label: 'Rules-based', value: 'rules' },
          { label: 'ML Model', value: 'ml' },
          { label: 'Hybrid', value: 'hybrid' }
        ]
      }
    ]
  },
  {
    id: 'agent-8',
    name: 'API Gateway',
    description: 'Provides a unified interface to multiple APIs and services',
    type: 'web',
    capabilities: {
      inputs: ['Request'],
      outputs: ['Response']
    },
    configOptions: [
      {
        key: 'authType',
        label: 'Authentication Type',
        type: 'select',
        defaultValue: 'none',
        options: [
          { label: 'None', value: 'none' },
          { label: 'API Key', value: 'apiKey' },
          { label: 'OAuth', value: 'oauth' },
          { label: 'JWT', value: 'jwt' }
        ]
      },
      {
        key: 'rateLimit',
        label: 'Rate Limit (req/min)',
        type: 'number',
        defaultValue: 60
      }
    ]
  }
];

// Sample workflow for demonstration
export const sampleWorkflow = {
  id: 'workflow-1',
  name: 'Data Processing Pipeline',
  description: 'A sample workflow that scrapes data, processes it, and generates a report',
  nodes: [
    {
      id: 'node-1',
      agentId: 'agent-2', // Web Scraper
      title: 'Web Data Collector',
      position: { x: 100, y: 200 },
      inputs: ['URL', 'API Endpoint'],
      outputs: ['HTML', 'JSON', 'Text'],
      config: {
        requestInterval: 2000,
        useProxy: true
      },
      validationStatus: 'success',
      validationMessage: ''
    },
    {
      id: 'node-2',
      agentId: 'agent-1', // Data Processor
      title: 'Data Transformer',
      position: { x: 400, y: 200 },
      inputs: ['JSON', 'CSV', 'Text'],
      outputs: ['JSON', 'Structured Data'],
      config: {
        processingMode: 'batch',
        maxBatchSize: 50
      },
      validationStatus: 'success',
      validationMessage: ''
    },
    {
      id: 'node-3',
      agentId: 'agent-3', // Text Analyzer
      title: 'Content Analyzer',
      position: { x: 700, y: 100 },
      inputs: ['Text'],
      outputs: ['Analysis Results', 'Entities', 'Sentiment'],
      config: {
        language: 'en',
        analysisDepth: 'deep'
      },
      validationStatus: 'warning',
      validationMessage: 'High resource usage with deep analysis'
    },
    {
      id: 'node-4',
      agentId: 'agent-6', // Document Generator
      title: 'Report Generator',
      position: { x: 700, y: 300 },
      inputs: ['Template', 'Data'],
      outputs: ['PDF', 'DOCX', 'HTML'],
      config: {
        outputFormat: 'pdf',
        templateEngine: 'handlebars'
      },
      validationStatus: 'success',
      validationMessage: ''
    }
  ],
  connections: [
    {
      id: 'conn-1',
      sourceNodeId: 'node-1',
      targetNodeId: 'node-2',
      type: ConnectionType.DataFlow,
      label: 'Raw Data',
      validationStatus: 'success',
      validationMessage: ''
    },
    {
      id: 'conn-2',
      sourceNodeId: 'node-2',
      targetNodeId: 'node-3',
      type: ConnectionType.DataFlow,
      label: 'Processed Text',
      validationStatus: 'success',
      validationMessage: ''
    },
    {
      id: 'conn-3',
      sourceNodeId: 'node-2',
      targetNodeId: 'node-4',
      type: ConnectionType.DataFlow,
      label: 'Report Data',
      validationStatus: 'success',
      validationMessage: ''
    },
    {
      id: 'conn-4',
      sourceNodeId: 'node-3',
      targetNodeId: 'node-4',
      type: ConnectionType.ContextSharing,
      label: 'Analysis Context',
      validationStatus: 'warning',
      validationMessage: 'Optional connection'
    }
  ],
  createdAt: '2025-05-20T10:00:00Z',
  updatedAt: '2025-05-22T15:30:00Z'
};

