# Summary of Key Recommendations

This document provides a quick reference guide summarizing the key recommendations from all sections of our Linear-GitHub Integration Guidelines.

## Linear-GitHub Linking

| Recommendation | Description |
|----------------|-------------|
| **Always Link PRs to Issues** | Every PR should be linked to at least one Linear issue |
| **Use Automatic Linking** | Follow branch naming conventions to enable automatic linking |
| **Include Issue IDs in PR Descriptions** | Use formats like `Resolves HLX-123` in PR descriptions |
| **Link Early** | Create connections as soon as the PR is created |
| **Update Linear Status** | Move Linear issues to appropriate status when creating/merging PRs |

### Quick Reference for Linking

```
# Branch naming for automatic linking
feature/HLX-123-implement-feature

# PR description for manual linking
Implements feature X

Resolves HLX-123

# Commit message with issue reference
[HLX-123] feat: implement feature X
```

## Branch Naming Conventions

| Recommendation | Description |
|----------------|-------------|
| **Follow Structure** | Use `<type>/<issue-id>-<short-description>` |
| **Include Issue ID** | Always include the Linear issue ID (e.g., HLX-123) |
| **Use Appropriate Type** | Select the correct branch type (feature, bugfix, etc.) |
| **Use Lowercase** | Keep all parts of the branch name lowercase |
| **Use Hyphens** | Separate words with hyphens, not underscores or spaces |

### Common Branch Types

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

## Commit Message Standards

| Recommendation | Description |
|----------------|-------------|
| **Follow Structure** | Use `[<issue-id>] <type>: <subject>` |
| **Use Present Tense** | Write in present tense ("add" not "added") |
| **Be Concise** | Keep subject lines under 50 characters |
| **Explain Why** | Focus on why the change was made, not how |
| **Reference Issues** | Always include the Linear issue ID |
| **Make Atomic Commits** | Each commit should represent a single logical change |

### Common Commit Types

- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Formatting changes
- `refactor` - Code refactoring
- `test` - Test additions or modifications
- `chore` - Maintenance tasks
- `perf` - Performance improvements

## Implementation Checklist

Use this checklist to ensure you're following all guidelines:

- [ ] Linear issue created for the task
- [ ] Branch created following naming conventions
- [ ] Commits follow the standard format with issue IDs
- [ ] PR linked to Linear issue (automatically or manually)
- [ ] Linear issue status updated appropriately
- [ ] PR description includes context from Linear issue

## Automation Recommendations

| Tool | Purpose | Benefit |
|------|---------|---------|
| **Git Hooks** | Enforce commit message and branch naming standards | Consistency |
| **GitHub Actions** | Automate Linear-GitHub integration | Efficiency |
| **Linear Webhooks** | Update GitHub PRs when issue statuses change | Synchronization |
| **Commit Templates** | Provide structure for commit messages | Standardization |

## Quick Command Reference

```bash
# Create a properly named branch
git checkout -b feature/HLX-123-implement-feature main

# Create a properly formatted commit
git commit -m "[HLX-123] feat: implement user authentication"

# Push branch and set upstream
git push -u origin feature/HLX-123-implement-feature
```

## Benefits of Following These Guidelines

- **Traceability**: Clear connections between issues, branches, commits, and PRs
- **Automation**: Enables automated workflows and integrations
- **Clarity**: Provides context for changes and development history
- **Efficiency**: Streamlines development processes and collaboration
- **Consistency**: Creates a standardized approach across teams and projects

By following these guidelines, you contribute to a more organized, efficient, and collaborative development process.

