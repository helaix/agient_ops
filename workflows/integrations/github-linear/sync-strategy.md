# GitHub-Linear Sync Strategy

## Overview

This document outlines a comprehensive strategy for synchronizing workplans and tasks between GitHub repositories and Linear project management. The strategy focuses on preserving hierarchical relationships, maintaining dependency chains, and ensuring consistent tracking across both platforms.

## Goals

1. **Bidirectional Synchronization**: Maintain consistency between GitHub workplans and Linear issues
2. **Hierarchical Preservation**: Maintain parent-child relationships between epics and tasks
3. **Dependency Mapping**: Accurately represent task dependencies as blocking relationships in Linear
4. **Automated Updates**: Minimize manual intervention through automation
5. **Status Tracking**: Monitor completion status across both platforms

## Workplan Structure in GitHub

### Directory Organization
```
workplans/
  ├── P0-CORE-001.md  # Epic-level workplan
  ├── P0-CORE-002.md  # Epic-level workplan
  ├── tasks/
      ├── C0.1.1.md   # Task-level workplan
      ├── C0.1.2.md   # Task-level workplan
      └── ...
```

### Workplan Metadata Format
Each workplan should include standardized metadata sections:

```markdown
### Workplan ID
`P0-CORE-001`

### Chunk Title
Environment Setup, Monorepo & IaC Configuration

### Description
Initialize the pnpm monorepo, configure TypeScript, ESLint, Prettier/Biome, Vitest, basic CI/CD workflows, and set up the initial Infrastructure as Code (IaC) project for managing core Cloudflare resources.

### PRD Phase Alignment
Sparkflow Phase 1: Core Infrastructure

### Key Tasks / Sub-Chunks
* [C0.1.1](tasks/C0.1.1.md) - (Initialize Monorepo)
* [C0.1.2](tasks/C0.1.2.md) - (Configure TypeScript & Lint/Format)
* [C0.1.3](tasks/C0.1.3.md) - (Set up Vitest & Basic CI)
* [C0.1.4](tasks/C0.1.4.md) - (IaC Tool Initialization)
* [C0.1.5](tasks/C0.1.5.md) - (Verification & Merge)
```

## Linear Data Model Mapping

| GitHub Workplan Element | Linear Element | Notes |
|-------------------------|----------------|-------|
| Epic-level workplan (P0-CORE-XXX) | Epic issue | Applied "Epic" label |
| Task-level workplan (C0.X.X) | Child issue | Linked to parent epic |
| Task sequence in Key Tasks | Blocking relationships | Each task blocks the next in sequence |
| PRD Phase Alignment | Project association | Maps to Linear project |
| Workplan description | Issue description | Includes source reference |

## Synchronization Process

### Initial Synchronization
1. Parse all epic-level workplans in the GitHub repository
2. For each epic:
   - Create a Linear epic with appropriate metadata
   - Parse all referenced tasks
   - Create Linear issues for each task
   - Establish parent-child relationships
   - Create blocking relationships based on task sequence

### Incremental Updates
1. Monitor changes to workplan files in GitHub
2. For modified workplans:
   - Update corresponding Linear issues
   - Adjust relationships as needed
3. For new workplans:
   - Create new Linear issues
   - Establish appropriate relationships

### Status Synchronization
1. Monitor status changes in Linear
2. Update GitHub workplans with completion status
3. Generate progress reports across both platforms

## Implementation Components

### 1. Metadata Extraction
- Parse markdown files to extract structured metadata
- Identify relationships between workplans
- Map GitHub attributes to Linear fields

### 2. Linear API Integration
- Use GraphQL API for creating and updating issues
- Implement mutations for establishing relationships
- Query for verification and validation

### 3. GitHub Integration
- Monitor repository for workplan changes
- Implement GitHub Actions for automated synchronization
- Update workplan status based on Linear changes

### 4. Validation and Verification
- Verify successful creation of issues and relationships
- Implement health checks for dependency chains
- Generate validation reports

## Technical Implementation

### Linear GraphQL API Usage

#### Creating an Epic
```graphql
mutation CreateEpic($teamId: String!, $title: String!, $description: String, $labelIds: [String!]) {
  issueCreate(
    input: {
      teamId: $teamId,
      title: $title,
      description: $description,
      labelIds: $labelIds
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
```

#### Creating a Task with Parent
```graphql
mutation CreateTask($teamId: String!, $title: String!, $description: String, $parentId: String) {
  issueCreate(
    input: {
      teamId: $teamId,
      title: $title,
      description: $description,
      parentId: $parentId
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
```

#### Creating a Blocking Relationship
```graphql
mutation CreateDependency($blockingIssueId: String!, $blockedIssueId: String!) {
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
```

### GitHub Action Workflow
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

## Challenges and Solutions

### Challenge: Circular Dependencies
- **Problem**: Circular dependencies can cause issues in Linear
- **Solution**: Implement validation to detect and prevent circular dependencies

### Challenge: Inconsistent Metadata
- **Problem**: Inconsistent metadata format makes parsing difficult
- **Solution**: Enforce standardized templates and validate workplan format

### Challenge: API Rate Limits
- **Problem**: Linear API has rate limits that can affect bulk synchronization
- **Solution**: Implement throttling and batch processing for large workplan sets

### Challenge: Bidirectional Updates
- **Problem**: Changes in either system can cause conflicts
- **Solution**: Implement conflict resolution strategies and clear ownership rules

## Monitoring and Maintenance

### Health Checks
- Regular validation of synchronization status
- Verification of dependency chains
- Consistency checks between platforms

### Performance Metrics
- Synchronization success rate
- Time to synchronize changes
- Error frequency and types

### Continuous Improvement
- Regular review of synchronization process
- Incorporation of user feedback
- Refinement of metadata formats and templates

## Conclusion

This GitHub-Linear sync strategy provides a comprehensive approach to maintaining consistency between planning documents in GitHub and execution tracking in Linear. By preserving hierarchical relationships and dependencies, it enables effective project management across both platforms while minimizing manual overhead.

