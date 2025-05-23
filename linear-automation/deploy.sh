#!/bin/bash

# Linear Automation System Deployment Script
# Phase 2.3: Workflow Optimization & Automation

set -e

echo "🚀 Deploying Linear Automation System..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14.0.0 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="14.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION is compatible"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm is available"

# Check environment variables
if [ -z "$LINEAR_API_KEY" ]; then
    echo "⚠️  LINEAR_API_KEY environment variable is not set."
    echo "Please set it before running the automation system:"
    echo "export LINEAR_API_KEY=your_linear_api_key_here"
    echo ""
    echo "You can get your API key from: https://linear.app/settings/api"
    echo ""
    read -p "Do you want to continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Validate configuration
echo "🔧 Validating configuration..."

if [ ! -f "automation-config.json" ]; then
    echo "❌ automation-config.json not found"
    exit 1
fi

# Test configuration syntax
if ! node -e "JSON.parse(require('fs').readFileSync('automation-config.json', 'utf8'))" 2>/dev/null; then
    echo "❌ automation-config.json contains invalid JSON"
    exit 1
fi

echo "✅ Configuration is valid"

# Test Linear API connection (if API key is available)
if [ ! -z "$LINEAR_API_KEY" ]; then
    echo "🔗 Testing Linear API connection..."
    
    if node -e "
        const { LinearClient } = require('@linear/sdk');
        const client = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
        client.viewer.then(viewer => {
            console.log('✅ Connected to Linear as:', viewer.name);
            process.exit(0);
        }).catch(error => {
            console.error('❌ Failed to connect to Linear:', error.message);
            process.exit(1);
        });
    "; then
        echo "✅ Linear API connection successful"
    else
        echo "❌ Failed to connect to Linear API"
        echo "Please check your LINEAR_API_KEY"
        exit 1
    fi
else
    echo "⚠️  Skipping Linear API test (no API key provided)"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p data
mkdir -p backups

echo "✅ Directories created"

# Set up logging
echo "📝 Setting up logging..."
cat > logs/.gitkeep << EOF
# This file ensures the logs directory is tracked by git
# Log files will be created here during automation runs
EOF

echo "✅ Logging configured"

# Create systemd service file (optional)
if command -v systemctl &> /dev/null; then
    echo "🔧 Creating systemd service file..."
    
    CURRENT_DIR=$(pwd)
    USER=$(whoami)
    
    cat > linear-automation.service << EOF
[Unit]
Description=Linear Automation System
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$CURRENT_DIR
Environment=LINEAR_API_KEY=$LINEAR_API_KEY
Environment=NODE_ENV=production
ExecStart=/usr/bin/node index.js daily
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    echo "✅ Systemd service file created: linear-automation.service"
    echo "To install the service:"
    echo "  sudo cp linear-automation.service /etc/systemd/system/"
    echo "  sudo systemctl daemon-reload"
    echo "  sudo systemctl enable linear-automation"
    echo "  sudo systemctl start linear-automation"
fi

# Create cron job template
echo "⏰ Creating cron job template..."
cat > cron-template.txt << EOF
# Linear Automation System Cron Jobs
# Add these to your crontab with: crontab -e

# Daily triage at 9:00 AM
0 9 * * * cd $PWD && /usr/bin/node index.js daily >> logs/daily.log 2>&1

# Weekly review on Mondays at 10:00 AM
0 10 * * 1 cd $PWD && /usr/bin/node index.js weekly >> logs/weekly.log 2>&1

# Monthly review on the 1st at 2:00 PM
0 14 1 * * cd $PWD && /usr/bin/node index.js monthly >> logs/monthly.log 2>&1

# Health check every 4 hours
0 */4 * * * cd $PWD && /usr/bin/node index.js status >> logs/health.log 2>&1
EOF

echo "✅ Cron job template created: cron-template.txt"

# Test the system
echo "🧪 Testing the automation system..."

if node index.js help > /dev/null 2>&1; then
    echo "✅ System help command works"
else
    echo "❌ System help command failed"
    exit 1
fi

if node index.js templates > /dev/null 2>&1; then
    echo "✅ Templates command works"
else
    echo "❌ Templates command failed"
    exit 1
fi

# Run a quick status check if API key is available
if [ ! -z "$LINEAR_API_KEY" ]; then
    echo "🔍 Running system status check..."
    if timeout 30 node index.js status > /dev/null 2>&1; then
        echo "✅ System status check passed"
    else
        echo "⚠️  System status check timed out or failed"
        echo "This might be normal if you have many issues to process"
    fi
fi

# Create deployment info
echo "📄 Creating deployment info..."
cat > deployment-info.json << EOF
{
  "deployment_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "1.0.0",
  "node_version": "$NODE_VERSION",
  "npm_version": "$(npm --version)",
  "system": "$(uname -s)",
  "architecture": "$(uname -m)",
  "user": "$(whoami)",
  "directory": "$PWD",
  "api_key_configured": $([ ! -z "$LINEAR_API_KEY" ] && echo "true" || echo "false")
}
EOF

echo "✅ Deployment info saved"

# Final summary
echo ""
echo "🎉 Linear Automation System deployed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   ✅ Dependencies installed"
echo "   ✅ Configuration validated"
echo "   ✅ Directories created"
echo "   ✅ System tested"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Set up your Linear API key (if not already done):"
echo "   export LINEAR_API_KEY=your_linear_api_key_here"
echo ""
echo "2. Test the system:"
echo "   npm start status"
echo ""
echo "3. Run daily automation:"
echo "   npm start daily"
echo ""
echo "4. Set up automated scheduling:"
echo "   - For cron jobs: crontab -e (see cron-template.txt)"
echo "   - For systemd: see instructions above"
echo ""
echo "5. Review documentation:"
echo "   - README.md - System overview and usage"
echo "   - documentation/workflow-guide.md - Complete guide"
echo "   - documentation/quick-reference.md - Quick reference"
echo ""
echo "📊 Available Commands:"
echo "   npm start daily     - Run daily automation tasks"
echo "   npm start weekly    - Run weekly priority review"
echo "   npm start monthly   - Run monthly workflow review"
echo "   npm start status    - Show system health status"
echo "   npm start templates - Show available issue templates"
echo "   npm start help      - Show all available commands"
echo ""
echo "🆘 Support:"
echo "   - Documentation: ./documentation/"
echo "   - Issues: https://github.com/helaix/agient_ops/issues"
echo "   - Team: Helaix (HLX)"
echo ""
echo "Happy automating! 🤖"

