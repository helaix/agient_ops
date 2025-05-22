# Branch Naming Conventions

This document provides comprehensive guidelines for effective branch naming conventions based on Linear issues, ensuring clear communication, improved workflow automation, and seamless integration between Linear and GitHub.

## Table of Contents

1. [Introduction](#introduction)
2. [General Principles](#general-principles)
3. [Recommended Patterns](#recommended-patterns)
4. [Special Cases](#special-cases)
5. [Integration with Linear](#integration-with-linear)
6. [Examples](#examples)
7. [Automation Tools](#automation-tools)

## Introduction

Consistent branch naming conventions are essential for maintaining an organized codebase, especially when working with issue tracking systems like Linear. Well-structured branch names provide immediate context about the purpose of the branch, its relationship to specific issues, and its place in the development workflow.

This guide outlines best practices for naming branches in a way that:
- Clearly communicates the purpose and content of the branch
- Integrates seamlessly with Linear issue tracking
- Enables automated workflows between Linear and GitHub
- Improves team collaboration and code organization
- Facilitates easier code reviews and merges

By following these conventions, teams can streamline their development process, reduce confusion, and leverage the full potential of Linear's GitHub integration features.

## General Principles

When naming branches, adhere to these fundamental principles:

1. **Descriptiveness**: Branch names should clearly indicate their purpose and content.
2. **Consistency**: Follow a uniform pattern across all branches.
3. **Brevity**: Keep names concise while maintaining clarity.
4. **Machine-readability**: Ensure names work well with automation tools.
5. **Human-readability**: Make names easy to understand at a glance.
6. **Issue Linkage**: Include references to related Linear issues.
7. **Hierarchy**: Use prefixes to categorize branches by type.
8. **Lowercase**: Use lowercase letters to avoid case-sensitivity issues.
9. **Separators**: Use hyphens (-) to separate words and slashes (/) to separate hierarchical elements.
10. **No Spaces**: Avoid spaces in branch names; use hyphens instead.

## Recommended Patterns

### Basic Structure

The recommended pattern for branch names is:

```
{type}/{linear-id}-{short-description}
```

For example:
```
feature/hlx-123-add-user-authentication
```

### Branch Types

Common branch type prefixes include:

| Type | Description | Example |
|------|-------------|---------|
| `feature/` | New features or enhancements | `feature/hlx-123-add-search-functionality` |
| `bugfix/` | Bug fixes | `bugfix/hlx-456-fix-login-error` |
| `hotfix/` | Urgent fixes for production | `hotfix/hlx-789-fix-critical-security-issue` |
| `refactor/` | Code refactoring without changing behavior | `refactor/hlx-234-improve-performance` |
| `docs/` | Documentation updates | `docs/hlx-567-update-api-documentation` |
| `test/` | Adding or updating tests | `test/hlx-890-add-unit-tests` |
| `chore/` | Routine tasks, maintenance, dependencies | `chore/hlx-321-update-dependencies` |
| `release/` | Release preparation | `release/v1.2.0` |

### Short Description Guidelines

The short description should:
- Use lowercase letters
- Use hyphens to separate words
- Be concise (3-5 words)
- Use imperative verbs (add, fix, update, etc.)
- Avoid unnecessary details
- Be specific enough to understand the purpose

## Special Cases

### Multiple Issues

When a branch addresses multiple Linear issues, include the primary issue ID in the branch name and reference other issues in commit messages or PR descriptions:

```
feature/hlx-123-user-profile-redesign
```

In the PR description:
```
Implements user profile redesign (HLX-123)
Also addresses:
- HLX-124: Profile image upload
- HLX-125: User settings panel
```

### Long-running Branches

For long-running branches that may span multiple releases or significant development periods:

```
epic/hlx-123-payment-system-overhaul
```

### Personal or Experimental Branches

For personal or experimental work not yet associated with a Linear issue:

```
exp/username-feature-prototype
```

### Release Branches

For release branches:

```
release/v1.2.0
```

Or with a specific Linear milestone:

```
release/hlx-milestone-q2-2023
```

## Integration with Linear

Linear offers powerful integration with GitHub that can automate workflows based on branch names and commit messages.

### Automatic Issue Linking

To automatically link a branch to a Linear issue:

1. **Include the issue ID in the branch name**:
   ```
   feature/hlx-123-add-user-authentication
   ```

2. **Copy branch name directly from Linear**:
   - Open the issue in Linear
   - Use the keyboard shortcut `Cmd/Ctrl` + `Shift` + `.`
   - Or use the command menu and search for "Copy git branch name"

### Status Automation

Linear can automatically update issue status based on branch and PR activities:

1. **When a branch is created** with an issue ID, Linear can:
   - Assign the issue to you (if configured)
   - Move the issue to "In Progress" (if configured)

2. **When a PR is opened** for a branch with an issue ID, Linear can:
   - Move the issue to a specified status (configurable in team workflow settings)

3. **When a PR is merged**, Linear can:
   - Move the issue to "Done" or another specified status

### Magic Words

In commit messages and PR descriptions, you can use "magic words" to control how Linear processes the relationship:

**Closing magic words** (will close the issue when merged):
- `close`, `closes`, `closed`, `closing`
- `fix`, `fixes`, `fixed`, `fixing`
- `resolve`, `resolves`, `resolved`, `resolving`
- `complete`, `completes`, `completed`, `completing`

**Non-closing magic words** (links without closing):
- `ref`, `references`
- `part of`, `related to`
- `contributes to`, `towards`

Example commit message:
```
Add user authentication form (fixes HLX-123)
```

## Examples

Here are comprehensive examples of effective branch naming in different scenarios:

### Feature Development

```
feature/hlx-123-add-user-authentication
feature/hlx-456-implement-payment-gateway
feature/hlx-789-create-dashboard-widgets
```

### Bug Fixes

```
bugfix/hlx-234-fix-login-redirect-loop
bugfix/hlx-567-resolve-data-loading-error
bugfix/hlx-890-address-mobile-layout-issues
```

### Hotfixes

```
hotfix/hlx-321-fix-security-vulnerability
hotfix/hlx-654-resolve-production-crash
hotfix/hlx-987-fix-critical-data-issue
```

### Documentation

```
docs/hlx-432-update-api-documentation
docs/hlx-765-improve-setup-instructions
docs/hlx-098-add-contributing-guidelines
```

### Refactoring

```
refactor/hlx-345-optimize-database-queries
refactor/hlx-678-restructure-component-hierarchy
refactor/hlx-901-convert-to-typescript
```

### Testing

```
test/hlx-234-add-unit-tests-for-auth
test/hlx-567-improve-test-coverage
test/hlx-890-setup-e2e-testing
```

## Automation Tools

Several tools can help enforce and streamline branch naming conventions:

### Linear CLI

The Linear CLI can be used to create branches with the correct naming convention:

```bash
# Install Linear CLI
npm install -g @linear/cli

# Create a branch for an issue
linear branch HLX-123
```

### Git Hooks

Use Git hooks to enforce branch naming conventions:

1. Create a `pre-push` hook in `.git/hooks/` to validate branch names:

```bash
#!/bin/bash

branch_name=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
valid_branch_regex="^(feature|bugfix|hotfix|release|docs|refactor|test|chore)/[a-z]+-[0-9]+-[a-z0-9-]+$"

if [[ ! $branch_name =~ $valid_branch_regex ]]; then
  echo "ERROR: Branch name '$branch_name' doesn't follow the naming convention"
  echo "Branch names should match: $valid_branch_regex"
  echo "Example: feature/hlx-123-add-user-authentication"
  exit 1
fi
```

### GitHub Actions

Create a GitHub Action to validate branch names:

```yaml
# .github/workflows/validate-branch-name.yml
name: Validate Branch Name

on:
  create:
    branches:
      - '**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Validate branch name
        run: |
          BRANCH_NAME=${GITHUB_REF#refs/heads/}
          PATTERN="^(feature|bugfix|hotfix|release|docs|refactor|test|chore)/[a-z]+-[0-9]+-[a-z0-9-]+$"
          
          if [[ ! $BRANCH_NAME =~ $PATTERN ]]; then
            echo "Branch name '$BRANCH_NAME' doesn't follow the naming convention"
            echo "Branch names should match: $PATTERN"
            echo "Example: feature/hlx-123-add-user-authentication"
            exit 1
          fi
```

### VS Code Extensions

The Linear VS Code extension can help with branch creation:

1. [Linear VS Code Extension](https://marketplace.visualstudio.com/items?itemName=linear.linear-open-issue): Opens the current Linear issue based on the Git branch name
2. [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens): Provides enhanced Git capabilities in VS Code

### Custom Scripts

Create custom scripts to generate branch names from Linear issues:

```javascript
// create-branch.js
const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter Linear issue ID (e.g., HLX-123): ', (issueId) => {
  rl.question('Enter branch type (feature, bugfix, hotfix, etc.): ', (type) => {
    rl.question('Enter short description: ', (description) => {
      // Format the description: lowercase, replace spaces with hyphens
      const formattedDescription = description.toLowerCase().replace(/\s+/g, '-');
      const branchName = `${type}/${issueId.toLowerCase()}-${formattedDescription}`;
      
      console.log(`Creating branch: ${branchName}`);
      
      exec(`git checkout -b ${branchName}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error creating branch: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Git stderr: ${stderr}`);
          return;
        }
        console.log(`Branch created successfully: ${branchName}`);
        rl.close();
      });
    });
  });
});
```

By implementing these conventions and tools, teams can maintain a clean, organized repository that integrates seamlessly with Linear's issue tracking and automation features.
