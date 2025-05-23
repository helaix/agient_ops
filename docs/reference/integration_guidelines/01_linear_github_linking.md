# Linear-GitHub Linking Guide

## Overview

Effective linking between Linear issues and GitHub Pull Requests (PRs) is essential for maintaining traceability and context throughout the development process. This guide outlines best practices for establishing and maintaining these connections.

## Why Link Linear Issues to GitHub PRs?

Linking Linear issues to GitHub PRs provides several benefits:

- **Traceability**: Creates a clear connection between requirements and implementation
- **Context**: Provides developers with necessary background information
- **Status Tracking**: Enables automatic status updates when PRs are merged
- **Documentation**: Maintains a record of how issues were resolved
- **Collaboration**: Facilitates discussion in the appropriate context

## Linking Methods

### 1. Automatic Linking via Branch Names

When you create a branch following our [Branch Naming Conventions](02_branch_naming_conventions.md), Linear can automatically link PRs created from that branch to the corresponding issue.

**Example:**
```
feature/HLX-123-implement-user-authentication
```

When a PR is created from this branch, Linear will automatically link it to issue HLX-123.

### 2. Manual Linking in PR Description

Include the Linear issue identifier in the PR description using one of these formats:

- `Linear #HLX-123`
- `Fixes HLX-123`
- `Resolves HLX-123`
- `Closes HLX-123`

**Example PR Description:**
```
Implements user authentication flow

Resolves HLX-123
```

### 3. Linking via Linear's GitHub Integration

If you're working in Linear:

1. Navigate to the issue
2. Click on "Link GitHub PR" in the right sidebar
3. Enter the PR number or URL
4. Click "Link"

### 4. Using Linear References in Commit Messages

Include the Linear issue ID in your commit messages following our [Commit Message Standards](03_commit_message_standards.md).

**Example:**
```
[HLX-123] Add user authentication controller
```

## Best Practices

1. **Always Link PRs to Issues**: Every PR should be linked to at least one Linear issue
2. **Link Early**: Create the connection as soon as the PR is created
3. **Use Consistent Formatting**: Follow the conventions in this guide for all links
4. **Include Context**: Add relevant details from the Linear issue in the PR description
5. **Update Linear Status**: When a PR is created, move the Linear issue to the appropriate status
6. **Cross-Reference**: If a PR addresses multiple issues, link to all relevant issues

## Automation Tips

### GitHub Actions for Linear Integration

Consider implementing GitHub Actions to automate the linking process:

```yaml
name: Linear Integration

on:
  pull_request:
    types: [opened, edited]

jobs:
  linear-integration:
    runs-on: ubuntu-latest
    steps:
      - name: Link PR to Linear Issue
        uses: linear/github-action@v1
        with:
          linear-api-key: ${{ secrets.LINEAR_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Linear Webhooks

Configure Linear webhooks to update GitHub PRs when issue statuses change:

1. Go to Linear Workspace Settings > API > Webhooks
2. Create a new webhook pointing to your GitHub integration endpoint
3. Select relevant issue update events

## Troubleshooting

### Common Issues

1. **Missing Links**: If automatic linking isn't working, check that your branch name follows the correct format
2. **Multiple Issues**: When linking to multiple issues, ensure each issue ID is properly formatted
3. **Integration Errors**: Verify that the Linear-GitHub integration is properly configured in your workspace

### Resolution Steps

1. Manually add the link if automatic linking fails
2. Verify that the issue ID is correct and exists
3. Check workspace integration settings if systematic issues occur

## Conclusion

Consistent linking between Linear issues and GitHub PRs is a fundamental practice for maintaining an efficient and transparent development workflow. By following these guidelines, you'll help ensure that our development process remains organized and traceable.

