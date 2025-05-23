# GitHub-Linear Sync Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the GitHub-Linear synchronization strategy. It covers the technical setup, configuration, and ongoing maintenance of the synchronization system.

## Prerequisites

- GitHub repository with workplan documents
- Linear workspace with appropriate access
- Node.js environment for running scripts
- GitHub Actions access for automation

## Setup Process

### 1. Environment Configuration

1. **Create Linear API Key**
   - Go to Linear Settings > API > Personal API Keys
   - Create a new API key with appropriate permissions
   - Store the key securely for use in scripts and GitHub Actions

2. **Configure GitHub Repository**
   - Set up LINEAR_API_KEY as a repository secret
   - Ensure workplans follow the standardized format
   - Create directory structure for workplans if not already present

### 2. Script Implementation

Create a synchronization script (`github-linear-sync.js`) with the following components:

```javascript
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Linear API client setup
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
if (!LINEAR_API_KEY) {
  console.error('ERROR: LINEAR_API_KEY environment variable is required');
  process.exit(1);
}

// Configuration
const TEAM_KEY = 'HLX'; // Team key
const WORKPLANS_DIR = path.join(path.dirname(__dirname), 'workplans');
const EPIC_TO_SYNC = process.argv[2]; // Optional specific epic to sync

// Utility functions
function executeLinearGraphQL(query, variables = {}) {
  const curlCommand = `curl -s -X POST -H "Content-Type: application/json" -H "Authorization: ${LINEAR_API_KEY}" --data '{"query": "${query.replace(/"/g, '\\"').replace(/\n/g, ' ')}", "variables": ${JSON.stringify(variables)}}' https://api.linear.app/graphql`;
  
  try {
    const response = JSON.parse(execSync(curlCommand).toString());
    if (response.errors) {
      console.error('GraphQL Error:', response.errors);
      return null;
    }
    return response.data;
  } catch (error) {
    console.error('Error executing GraphQL query:', error.message);
    return null;
  }
}

// Get team ID from key
function getTeamId(teamKey) {
  const query = `
    query GetTeamId($teamKey: String!) {
      teams(filter: { key: { eq: $teamKey } }) {
        nodes {
          id
          key
          name
        }
      }
    }
  `;
  
  const result = executeLinearGraphQL(query, { teamKey });
  if (!result || !result.teams || !result.teams.nodes.length) {
    console.error(`Team with key ${teamKey} not found`);
    return null;
  }
  
  return result.teams.nodes[0].id;
}

// Get project ID by name
function getProjectId(projectName) {
  const query = `
    query GetProjectId($projectName: String!) {
      projects(filter: { name: { eq: $projectName } }) {
        nodes {
          id
          name
        }
      }
    }
  `;
  
  const result = executeLinearGraphQL(query, { projectName });
  if (!result || !result.projects || !result.projects.nodes.length) {
    console.log(`Project with name "${projectName}" not found`);
    return null;
  }
  
  return result.projects.nodes[0].id;
}

// Create an epic in Linear
function createEpic(teamId, title, description, projectId = null) {
  const query = `
    mutation CreateIssue($teamId: String!, $title: String!, $description: String, $labelIds: [String!], $projectId: String) {
      issueCreate(
        input: {
          teamId: $teamId,
          title: $title,
          description: $description,
          labelIds: $labelIds,
          projectId: $projectId
        }
      ) {
        success
        issue {
          id
          identifier
          title
        }
      }
    }
  `;
  
  // Add Epic label
  const labelQuery = `
    query GetEpicLabel($teamId: String!) {
      issueLabels(filter: { team: { id: { eq: $teamId } }, name: { eq: "Epic" } }) {
        nodes {
          id
          name
        }
      }
    }
  `;
  
  const labelResult = executeLinearGraphQL(labelQuery, { teamId });
  let epicLabelId = null;
  
  if (labelResult && labelResult.issueLabels && labelResult.issueLabels.nodes.length > 0) {
    epicLabelId = labelResult.issueLabels.nodes[0].id;
  } else {
    // Create Epic label if it doesn't exist
    const createLabelQuery = `
      mutation CreateEpicLabel($teamId: String!) {
        issueLabelCreate(input: { name: "Epic", teamId: $teamId, color: "#0052CC" }) {
          success
          issueLabel {
            id
          }
        }
      }
    `;
    
    const createResult = executeLinearGraphQL(createLabelQuery, { teamId });
    if (createResult && createResult.issueLabelCreate && createResult.issueLabelCreate.success) {
      epicLabelId = createResult.issueLabelCreate.issueLabel.id;
    }
  }
  
  const labelIds = epicLabelId ? [epicLabelId] : [];
  const result = executeLinearGraphQL(query, { 
    teamId, 
    title, 
    description,
    labelIds,
    projectId
  });
  
  if (!result || !result.issueCreate || !result.issueCreate.success) {
    console.error('Failed to create epic');
    return null;
  }
  
  return result.issueCreate.issue;
}

// Create a task in Linear
function createTask(teamId, title, description, parentId = null, projectId = null) {
  const query = `
    mutation CreateTask($teamId: String!, $title: String!, $description: String, $parentId: String, $projectId: String) {
      issueCreate(
        input: {
          teamId: $teamId,
          title: $title,
          description: $description,
          parentId: $parentId,
          projectId: $projectId
        }
      ) {
        success
        issue {
          id
          identifier
          title
        }
      }
    }
  `;
  
  const result = executeLinearGraphQL(query, { teamId, title, description, parentId, projectId });
  if (!result || !result.issueCreate || !result.issueCreate.success) {
    console.error('Failed to create task');
    return null;
  }
  
  return result.issueCreate.issue;
}

// Create dependency between issues (blocking relationship)
function createDependency(blockingIssueId, blockedIssueId) {
  // The correct relation type is "blocks" (lowercase)
  const query = `
    mutation CreateIssueDependency($blockingIssueId: String!, $blockedIssueId: String!) {
      issueRelationCreate(
        input: {
          issueId: $blockedIssueId,
          relatedIssueId: $blockingIssueId,
          type: blocks
        }
      ) {
        success
        issueRelation {
          id
          type
        }
      }
    }
  `;
  
  const result = executeLinearGraphQL(query, { blockingIssueId, blockedIssueId });
  if (!result || !result.issueRelationCreate || !result.issueRelationCreate.success) {
    console.error('Failed to create dependency relationship:', JSON.stringify(result));
    return false;
  }
  
  return true;
}

// Parse a workplan file and extract metadata
function parseWorkplan(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract key information using regex
    const idMatch = content.match(/### Workplan ID\s*`([^`]+)`/);
    const titleMatch = content.match(/### Chunk Title\s*([^\n]+)/);
    const descriptionMatch = content.match(/### Description\s*([^#]+)/);
    const tasksMatch = content.match(/### Key Tasks \/ Sub-Chunks[^#]+/);
    const projectMatch = content.match(/### PRD Phase Alignment\s*([^\n]+)/);
    
    // Extract tasks/sub-chunks
    const tasks = [];
    if (tasksMatch && tasksMatch[0]) {
      const taskLines = tasksMatch[0].match(/\*\s+\[([^\]]+)\]\(([^)]+)\)\s*-\s*\(([^)]+)\)/g);
      if (taskLines) {
        taskLines.forEach(line => {
          const taskMatch = line.match(/\*\s+\[([^\]]+)\]\(([^)]+)\)\s*-\s*\(([^)]+)\)/);
          if (taskMatch) {
            tasks.push({
              id: taskMatch[1],
              path: taskMatch[2],
              title: taskMatch[3]
            });
          }
        });
      }
    }
    
    return {
      id: idMatch ? idMatch[1] : null,
      title: titleMatch ? titleMatch[1].trim() : null,
      description: descriptionMatch ? descriptionMatch[1].trim() : null,
      project: projectMatch ? projectMatch[1].trim() : null,
      tasks
    };
  } catch (error) {
    console.error(`Error parsing workplan ${filePath}:`, error.message);
    return null;
  }
}

// Main function to sync workplans
async function syncWorkplans() {
  console.log(`Starting GitHub-Linear sync`);
  
  // 1. Get team ID
  const teamId = getTeamId(TEAM_KEY);
  if (!teamId) {
    console.error('Failed to get team ID. Exiting.');
    return;
  }
  console.log(`Found team ID: ${teamId}`);
  
  // 2. Get list of workplans to process
  let workplansToProcess = [];
  
  if (EPIC_TO_SYNC) {
    // Process a specific epic
    const epicFilePath = path.join(WORKPLANS_DIR, `${EPIC_TO_SYNC}.md`);
    if (fs.existsSync(epicFilePath)) {
      workplansToProcess.push(epicFilePath);
    } else {
      console.error(`Epic file not found: ${epicFilePath}`);
      return;
    }
  } else {
    // Process all epics
    const files = fs.readdirSync(WORKPLANS_DIR);
    workplansToProcess = files
      .filter(file => file.match(/^P\d+-[A-Z]+-\d+\.md$/))
      .map(file => path.join(WORKPLANS_DIR, file));
  }
  
  console.log(`Found ${workplansToProcess.length} workplans to process`);
  
  // 3. Process each workplan
  for (const workplanPath of workplansToProcess) {
    const epicData = parseWorkplan(workplanPath);
    if (!epicData) {
      console.error(`Failed to parse epic data from ${workplanPath}. Skipping.`);
      continue;
    }
    
    console.log(`Processing epic: ${epicData.id} - ${epicData.title}`);
    
    // 4. Get project ID if available
    let projectId = null;
    if (epicData.project) {
      const projectName = epicData.project.split(':')[0].trim();
      projectId = getProjectId(projectName);
      if (projectId) {
        console.log(`Found project ID for ${projectName}: ${projectId}`);
      }
    }
    
    // 5. Create the epic in Linear
    const epicDescription = `${epicData.description}\n\n**GitHub Source:** ${epicData.id}.md\n\n**Tasks:**\n${epicData.tasks.map(t => `- ${t.title}`).join('\n')}`;
    const epic = createEpic(teamId, epicData.title, epicDescription, projectId);
    if (!epic) {
      console.error(`Failed to create epic in Linear for ${epicData.id}. Skipping.`);
      continue;
    }
    
    console.log(`Created epic in Linear: ${epic.identifier} - ${epic.title}`);
    
    // 6. Create tasks and establish dependencies
    const createdTasks = [];
    let previousTask = null;
    
    for (const task of epicData.tasks) {
      const taskDescription = `**GitHub Source:** ${task.id}\n\n**Part of Epic:** ${epicData.id} - ${epicData.title}`;
      const createdTask = createTask(teamId, task.title, taskDescription, epic.id, projectId);
      
      if (createdTask) {
        console.log(`Created task: ${createdTask.identifier} - ${createdTask.title}`);
        createdTasks.push(createdTask);
        
        // Create dependency with previous task if it exists (sequential dependency)
        if (previousTask) {
          // The previous task blocks the current task
          const success = createDependency(previousTask.id, createdTask.id);
          if (success) {
            console.log(`Created dependency: ${previousTask.identifier} blocks ${createdTask.identifier}`);
          } else {
            console.error(`Failed to create dependency between ${previousTask.identifier} and ${createdTask.identifier}`);
          }
        }
        
        previousTask = createdTask;
      }
    }
    
    // 7. Verify dependencies were created
    console.log("\nVerifying dependencies...");
    for (let i = 1; i < createdTasks.length; i++) {
      const blockedTask = createdTasks[i];
      const blockingTask = createdTasks[i-1];
      
      const query = `
        query CheckDependency($issueId: String!) {
          issue(id: $issueId) {
            relations {
              nodes {
                type
                relatedIssue {
                  id
                  identifier
                }
              }
            }
          }
        }
      `;
      
      const result = executeLinearGraphQL(query, { issueId: blockedTask.id });
      if (result && result.issue && result.issue.relations) {
        const relations = result.issue.relations.nodes;
        const hasBlockingRelation = relations.some(rel => 
          rel.type === "blocks" && rel.relatedIssue.id === blockingTask.id
        );
        
        console.log(`Dependency check: ${blockingTask.identifier} blocks ${blockedTask.identifier} - ${hasBlockingRelation ? 'YES' : 'NO'}`);
      }
    }
    
    console.log(`\nSummary for ${epicData.id}:`);
    console.log(`- Created epic: ${epic.identifier}`);
    console.log(`- Created ${createdTasks.length} tasks`);
    console.log(`- Established ${createdTasks.length - 1} dependencies`);
  }
  
  console.log("\nSync completed successfully!");
}

// Run the sync
syncWorkplans();
```

### 3. GitHub Action Setup

Create a GitHub Action workflow file (`.github/workflows/github-linear-sync.yml`):

```yaml
name: GitHub-Linear Sync

on:
  push:
    paths:
      - 'workplans/**/*.md'
  workflow_dispatch:
    inputs:
      epic_id:
        description: 'Specific epic ID to sync (e.g., P0-CORE-001)'
        required: false

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run sync script
        env:
          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
        run: node scripts/github-linear-sync.js ${{ github.event.inputs.epic_id }}
```

## Usage Instructions

### Manual Synchronization

To manually synchronize a specific epic:

1. Go to the GitHub repository Actions tab
2. Select the "GitHub-Linear Sync" workflow
3. Click "Run workflow"
4. Enter the epic ID (e.g., P0-CORE-001) in the input field
5. Click "Run workflow"

### Automated Synchronization

The synchronization will automatically trigger when:

1. Any workplan file is modified in the repository
2. The changes are pushed to the repository

## Monitoring and Troubleshooting

### Common Issues and Solutions

1. **API Authentication Errors**
   - **Symptom**: "Failed to get team ID" error
   - **Solution**: Verify LINEAR_API_KEY is correctly set in GitHub secrets

2. **Parsing Errors**
   - **Symptom**: "Failed to parse epic data" error
   - **Solution**: Ensure workplan follows the standardized format

3. **Dependency Creation Failures**
   - **Symptom**: "Failed to create dependency relationship" error
   - **Solution**: Check Linear API response for specific error details

### Validation Checks

Run these checks to verify synchronization:

1. **Epic Creation Check**
   ```
   curl -s -X POST -H "Content-Type: application/json" -H "Authorization: $LINEAR_API_KEY" \
     --data '{"query": "query { issues(filter: {team: {key: {eq: \"HLX\"}}, labels: {name: {eq: \"Epic\"}}}) { nodes { identifier title } } }"}'
   ```

2. **Dependency Check**
   ```
   curl -s -X POST -H "Content-Type: application/json" -H "Authorization: $LINEAR_API_KEY" \
     --data '{"query": "query($id: String!) { issue(id: $id) { relations { nodes { type relatedIssue { identifier } } } } }", "variables": {"id": "ISSUE_ID"}}'
   ```

## Maintenance and Updates

### Regular Maintenance Tasks

1. **Dependency Verification**
   - Periodically verify all dependencies are correctly established
   - Run validation queries to check relationship integrity

2. **Metadata Format Updates**
   - Update parsing logic if workplan format changes
   - Test with sample workplans before deploying changes

3. **API Changes Monitoring**
   - Stay informed about Linear API changes
   - Update GraphQL queries as needed

### Extending the System

1. **Adding New Workplan Types**
   - Update parsing logic to handle new formats
   - Add appropriate mapping to Linear elements

2. **Bidirectional Updates**
   - Implement status synchronization from Linear to GitHub
   - Add webhooks for real-time updates

3. **Reporting and Visualization**
   - Add reporting capabilities for synchronization status
   - Create visualizations of dependency chains

## Conclusion

This implementation guide provides a comprehensive approach to setting up and maintaining the GitHub-Linear synchronization system. By following these instructions, you can establish an effective integration between your planning documents in GitHub and your task tracking in Linear.

