# Branch Naming Conventions for Linear Integration

## Overview

This document outlines effective branch naming conventions when working with Linear issues and GitHub repositories. Following consistent branch naming patterns improves workflow efficiency, enhances collaboration, and leverages Linear's integration capabilities with GitHub.

## Table of Contents

- [General Principles](#general-principles)
- [Recommended Patterns](#recommended-patterns)
- [Special Cases and Edge Scenarios](#special-cases-and-edge-scenarios)
- [Linear Issue Integration](#linear-issue-integration)
- [Implementation Examples](#implementation-examples)
- [Automation Tools and Options](#automation-tools-and-options)

## General Principles

Effective branch naming conventions should follow these general principles:

1. **Consistency**: Use a consistent format across all branches to make them easily recognizable.
2. **Clarity**: Branch names should clearly communicate their purpose and relationship to issues.
3. **Brevity**: Keep branch names concise while still being descriptive.
4. **Machine-Readability**: Ensure branch names can be parsed by automation tools.
5. **Human-Readability**: Make branch names easy for team members to understand at a glance.
6. **Traceability**: Include issue identifiers to maintain a clear link between branches and Linear issues.
7. **Searchability**: Use formats that make branches easy to find and filter.

### Character Restrictions

Git branch names have some technical restrictions:

- Cannot contain spaces
- Cannot contain special characters: `~`, `^`, `:`, `\\`, `?`, `*`, `[`, `@{`, or `.`
- Cannot begin with a dash (`-`) or dot (`.`)
- Cannot contain consecutive dots (`..`)
- Cannot contain a sequence that looks like a git reference (`@{`)

## Recommended Patterns

Based on industry best practices and Linear's integration capabilities, we recommend the following branch naming patterns:

### 1. Linear Issue ID-Based Pattern

```
{type}/{issue-id}-{short-description}
```

Example: `feature/HLX-123-add-login-button`

**Advantages:**
- Directly links to Linear issue
- Automatically associates branches with issues in Linear-GitHub integration
- Makes it easy to find the related issue

**Disadvantages:**
- Can be slightly longer
- Requires discipline to include the issue ID consistently

### 2. Linear Issue ID with Kebab Case Description

```
{issue-id}/{type}/{short-description}
```

Example: `HLX-123/feature/add-login-button`

**Advantages:**
- Puts the issue ID first for better sorting and visibility
- Clearly separates the issue ID from the description
- Works well with Linear's GitHub integration

**Disadvantages:**
- May be less common in some development environments
- Slightly longer format

### 3. Type-Based Pattern with Linear ID

```
{type}-{short-description}-{issue-id}
```

Example: `feature-add-login-button-HLX-123`

**Advantages:**
- Emphasizes the type of work being done
- Still includes the issue ID for traceability
- Works with Linear's GitHub integration

**Disadvantages:**
- Issue ID is less prominent at the end
- May be harder to scan for specific issues

### Common Type Prefixes

- `feature/`: New features or enhancements
- `bugfix/`: Bug fixes
- `hotfix/`: Urgent fixes for production issues
- `chore/`: Maintenance tasks, refactoring, etc.
- `docs/`: Documentation updates
- `test/`: Test-related changes
- `refactor/`: Code refactoring without changing functionality
- `style/`: Code style/formatting changes
- `perf/`: Performance improvements

## Special Cases and Edge Scenarios

### Long Issue Titles

When a Linear issue has a long title, create a concise summary for the branch name:

**Linear Issue:** "Implement comprehensive authentication system with OAuth2 and multi-factor authentication"  
**Branch Name:** `feature/HLX-123-auth-system`

### Multiple Issues in One Branch

When a branch addresses multiple Linear issues, consider these approaches:

1. **Primary Issue Approach**: Use the main/primary issue ID in the branch name
   ```
   feature/HLX-123-auth-system
   ```
   Then reference other issues in commit messages or PR description.

2. **Multiple ID Approach**: Include multiple IDs for critical connections
   ```
   feature/HLX-123-HLX-124-auth-system
   ```
   Note: This can make branch names lengthy.

### Temporary or Experimental Branches

For experimental work not yet associated with a Linear issue:
```
exp/{username}/{short-description}
```
Example: `exp/alex/auth-prototype`

### Release Branches

For release branches that may encompass multiple issues:
```
release/v{version-number}
```
Example: `release/v1.2.0`

## Linear Issue Integration

Linear provides specific features for integrating with GitHub branches:

### Using Linear's "Copy Git Branch Name" Feature

Linear offers a built-in feature to generate branch names based on issues:

1. Open an issue in Linear
2. Use the keyboard shortcut `Cmd/Ctrl + Shift + .` or click the `...` menu and select "Copy Git Branch Name"
3. Linear will generate a branch name following its default format: `{username}/{issue-id}-{kebab-case-title}`
   Example: `alex/hlx-123-implement-login-functionality`

### Customizing Linear's Branch Name Format

Linear's default branch name format can be customized in your workspace settings:

1. Go to Settings > Workspace > Custom Branch Format
2. Use variables like `{id}`, `{title}`, and `{team}` to create your preferred format
3. Common custom formats include:
   - `feature/{id}-{title}`
   - `{id}/{title}`
   - `{team}/{id}-{title}`

### Automatic Issue Linking

When you include a Linear issue ID in your branch name, Linear's GitHub integration will automatically:

1. Link the branch to the issue
2. Update the issue status when PRs are created, reviewed, and merged
3. Display branch and PR information in the Linear issue interface

## Implementation Examples

Here are examples of effective branch naming patterns for different types of work:

### Feature Development

```
feature/HLX-123-user-authentication
feature/user-authentication/HLX-123
HLX-123-feature-user-authentication
```

### Bug Fixes

```
bugfix/HLX-456-fix-login-error
bugfix/login-error/HLX-456
HLX-456-bugfix-login-error
```

### Documentation Updates

```
docs/HLX-789-update-readme
docs/update-readme/HLX-789
HLX-789-docs-update-readme
```

### Refactoring

```
refactor/HLX-101-optimize-queries
refactor/optimize-queries/HLX-101
HLX-101-refactor-optimize-queries
```

### Hotfixes

```
hotfix/HLX-202-security-vulnerability
hotfix/security-vulnerability/HLX-202
HLX-202-hotfix-security-vulnerability
```

## Automation Tools and Options

Several tools can help automate and enforce branch naming conventions when working with Linear and GitHub:

### 1. Linear CLI Tools

- **[gh-linear](https://github.com/rawnly/gh-linear)**: A GitHub CLI extension that creates branches from Linear issues
  ```bash
  gh linear --issue HLX-123
  ```

- **[linear-branch](https://www.npmjs.com/package/linear-branch)**: An npm package for creating branches from Linear issues
  ```bash
  npx linear-branch
  ```

### 2. Git Hooks

Use Git hooks to enforce branch naming conventions:

```bash
# Example pre-push hook script to validate branch names
#!/bin/bash

branch_name=$(git symbolic-ref --short HEAD)
branch_pattern="^(feature|bugfix|hotfix|docs|refactor|test|chore)/[A-Z]+-[0-9]+-[a-z0-9-]+$"

if ! [[ $branch_name =~ $branch_pattern ]]; then
  echo "ERROR: Branch name does not follow the convention: {type}/{issue-id}-{description}"
  echo "Example: feature/HLX-123-add-login"
  exit 1
fi
```

### 3. GitHub Actions

Create GitHub Actions workflows to validate branch names:

```yaml
name: Validate Branch Names

on:
  create:
    branches:
      - '**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Check branch name
        run: |
          BRANCH=${GITHUB_REF#refs/heads/}
          if ! [[ $BRANCH =~ ^(feature|bugfix|hotfix|docs|refactor|test|chore)/[A-Z]+-[0-9]+-[a-z0-9-]+$ ]]; then
            echo "Branch name $BRANCH does not follow convention"
            exit 1
          fi
```

### 4. Linear Automation Features

Linear offers built-in automation features:

- **Auto-assign and status change**: When using "Copy Git Branch Name", Linear can automatically assign the issue to you and change its status to "In Progress"
- **Status updates based on PR events**: Configure Linear to update issue status when PRs are created, reviewed, or merged
- **Branch-specific rules**: Set up custom workflow automations based on target branches

### 5. Custom Scripts

Create custom scripts to generate branch names from Linear issues:

```javascript
// Example Node.js script to generate branch names from Linear API
const { LinearClient } = require('@linear/sdk');

async function createBranchName(issueId) {
  const linearClient = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
  const issue = await linearClient.issue(issueId);
  
  if (!issue) {
    console.error('Issue not found');
    return;
  }
  
  const type = getIssueType(issue);
  const title = issue.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  return `${type}/${issue.identifier}-${title}`;
}

function getIssueType(issue) {
  // Logic to determine issue type based on labels or other properties
  if (issue.labels.nodes.some(label => label.name === 'Bug')) {
    return 'bugfix';
  }
  return 'feature';
}

// Usage
createBranchName('HLX-123').then(branchName => {
  console.log(`git checkout -b ${branchName}`);
});
```

By implementing these branch naming conventions and automation tools, teams can streamline their workflow between Linear and GitHub, improving traceability, collaboration, and integration between the two platforms.
