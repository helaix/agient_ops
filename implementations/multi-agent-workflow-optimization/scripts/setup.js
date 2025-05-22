#!/usr/bin/env node

/**
 * Setup Script for Multi-Agent Workflow Optimization
 * 
 * Initializes the system, creates necessary directories, and validates configuration
 */

const fs = require('fs');
const path = require('path');
const { LinearClient } = require('@linear/sdk');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

class SetupManager {
  constructor() {
    this.requiredDirs = [
      'logs',
      'public',
      'config',
      'data'
    ];
    
    this.requiredEnvVars = [
      'LINEAR_API_KEY',
      'GITHUB_TOKEN'
    ];
  }

  async run() {
    console.log('🚀 Setting up Multi-Agent Workflow Optimization System...\n');
    
    try {
      await this.createDirectories();
      await this.validateEnvironment();
      await this.testAPIConnections();
      await this.initializeConfiguration();
      await this.createLogFiles();
      
      console.log('\n✅ Setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Start the orchestrator: npm run start:orchestrator');
      console.log('2. Open monitoring dashboard: http://localhost:4000');
      console.log('3. View integration dashboard: http://localhost:3001/dashboard');
      
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async createDirectories() {
    console.log('📁 Creating required directories...');
    
    for (const dir of this.requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`   ✓ Created ${dir}/`);
      } else {
        console.log(`   ✓ ${dir}/ already exists`);
      }
    }
  }

  async validateEnvironment() {
    console.log('\n🔧 Validating environment configuration...');
    
    // Check if .env file exists
    const envPath = path.join(process.cwd(), 'config', '.env');
    if (!fs.existsSync(envPath)) {
      console.log('   ⚠️  .env file not found, copying from example...');
      const examplePath = path.join(process.cwd(), 'config', 'example.env');
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        console.log('   ✓ Created .env from example.env');
        console.log('   ⚠️  Please edit config/.env with your actual API keys');
      }
    }

    // Check required environment variables
    const missingVars = [];
    for (const envVar of this.requiredEnvVars) {
      if (!process.env[envVar] || process.env[envVar] === 'your_' + envVar.toLowerCase() + '_here') {
        missingVars.push(envVar);
      }
    }

    if (missingVars.length > 0) {
      console.log('   ❌ Missing required environment variables:');
      missingVars.forEach(varName => {
        console.log(`      - ${varName}`);
      });
      throw new Error('Please configure the missing environment variables in config/.env');
    }

    console.log('   ✓ Environment configuration validated');
  }

  async testAPIConnections() {
    console.log('\n🔌 Testing API connections...');
    
    // Test Linear API
    try {
      const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
      const viewer = await linear.viewer;
      console.log(`   ✓ Linear API connected (User: ${viewer.name})`);
    } catch (error) {
      throw new Error(`Linear API connection failed: ${error.message}`);
    }

    // Test GitHub API
    try {
      const github = new Octokit({ auth: process.env.GITHUB_TOKEN });
      const { data: user } = await github.rest.users.getAuthenticated();
      console.log(`   ✓ GitHub API connected (User: ${user.login})`);
    } catch (error) {
      throw new Error(`GitHub API connection failed: ${error.message}`);
    }
  }

  async initializeConfiguration() {
    console.log('\n⚙️  Initializing system configuration...');
    
    const config = {
      system: {
        version: '1.0.0',
        initialized: new Date().toISOString(),
        agents: {
          'workflow-orchestrator': {
            enabled: true,
            port: 3000,
            websocketPort: 8080
          },
          'integration-dashboard': {
            enabled: true,
            port: 3001
          },
          'linear-state-manager': {
            enabled: true
          },
          'review-bottleneck-manager': {
            enabled: false // Will be enabled in Phase 2
          },
          'context-switching-optimizer': {
            enabled: false // Will be enabled in Phase 3
          },
          'documentation-implementation-bridge': {
            enabled: false // Will be enabled in Phase 3
          }
        },
        monitoring: {
          enabled: true,
          port: 4000,
          websocketPort: 8081
        }
      },
      targets: {
        reviewCycleTime: parseFloat(process.env.TARGET_REVIEW_CYCLE_TIME || 48),
        contextSwitches: parseFloat(process.env.TARGET_CONTEXT_SWITCHES || 3),
        integrationConflicts: parseFloat(process.env.TARGET_INTEGRATION_CONFLICTS || 0),
        patternApplicationRate: parseFloat(process.env.TARGET_PATTERN_APPLICATION_RATE || 100),
        linearStateAccuracy: parseFloat(process.env.TARGET_LINEAR_STATE_ACCURACY || 95)
      }
    };

    const configPath = path.join(process.cwd(), 'config', 'system.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('   ✓ System configuration created');
  }

  async createLogFiles() {
    console.log('\n📝 Initializing log files...');
    
    const logFiles = [
      'logs/combined.log',
      'logs/error.log',
      'logs/workflow-orchestrator.log',
      'logs/integration-dashboard.log',
      'logs/linear-state-manager.log',
      'logs/monitoring.log'
    ];

    for (const logFile of logFiles) {
      const logPath = path.join(process.cwd(), logFile);
      if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '');
        console.log(`   ✓ Created ${logFile}`);
      }
    }
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  const setup = new SetupManager();
  setup.run();
}

module.exports = SetupManager;

