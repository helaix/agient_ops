# Branch Naming Conventions

## Overview

Consistent branch naming is essential for organizing work, automating processes, and maintaining clear connections between code changes and Linear issues. This guide outlines our standard branch naming conventions.

## Branch Name Structure

Our branch names follow this structure:

```
<type>/<issue-id>-<short-description>
```

### Components

1. **Type**: Indicates the purpose of the branch
2. **Issue ID**: The Linear issue identifier (e.g., HLX-123)
3. **Short Description**: Brief, hyphenated description of the change

## Branch Types

| Type | Description | Example |
|------|-------------|---------|
| `feature` | New features or significant enhancements | `feature/HLX-123-user-authentication` |
| `bugfix` | Bug fixes | `bugfix/HLX-456-fix-login-error` |
| `hotfix` | Urgent fixes for production issues | `hotfix/HLX-789-critical-security-patch` |
| `refactor` | Code refactoring without functional changes | `refactor/HLX-234-improve-performance` |
| `docs` | Documentation updates | `docs/HLX-567-update-api-docs` |
| `test` | Adding or modifying tests | `test/HLX-890-add-unit-tests` |
| `chore` | Maintenance tasks, dependencies, etc. | `chore/HLX-321-update-dependencies` |

## Guidelines

### Do's

- ✅ Always include the Linear issue ID
- ✅ Use lowercase for all parts of the branch name
- ✅ Use hyphens to separate words in the description
- ✅ Keep descriptions concise but descriptive
- ✅ Use the appropriate branch type

### Don'ts

- ❌ Don't use underscores or spaces in branch names
- ❌ Don't create branches without a corresponding Linear issue
- ❌ Don't use overly long descriptions
- ❌ Don't include special characters (except hyphens)
- ❌ Don't omit the branch type

## Examples

### Good Examples

```
feature/HLX-123-implement-user-authentication
bugfix/HLX-456-fix-login-validation
refactor/HLX-789-optimize-database-queries
docs/HLX-234-update-readme
test/HLX-567-add-integration-tests
```

### Bad Examples

```
HLX-123                           # Missing type and description
feature/implement-login           # Missing issue ID
feature/HLX-123_user_auth         # Using underscores instead of hyphens
feature/HLX-123-this-is-a-very-long-description-that-is-too-detailed-and-verbose  # Too long
Feature/HLX-123-Auth              # Inconsistent capitalization
```

## Automation Benefits

Consistent branch naming enables:

1. **Automatic Issue Linking**: Linear can automatically link PRs to issues based on branch names
2. **CI/CD Workflows**: Trigger specific pipelines based on branch types
3. **Branch Organization**: Easier filtering and searching in Git tools
4. **Automated Reporting**: Generate reports on development activities by branch type

## Implementation Tips

### Creating a Branch from Linear

When creating a branch directly from Linear:

1. Navigate to the issue
2. Click "Create Branch" in the right sidebar
3. Linear will generate a properly formatted branch name
4. Copy and use this name when creating your branch locally

### Creating a Branch Locally

```bash
# Fetch the latest changes
git fetch origin

# Create a new branch from the main branch
git checkout -b feature/HLX-123-implement-user-authentication main

# Push the branch to remote
git push -u origin feature/HLX-123-implement-user-authentication
```

### Branch Name Validation

Consider implementing a Git hook to validate branch names:

```bash
#!/bin/bash
# .git/hooks/pre-push

branch_name=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

# Regex pattern for valid branch names
valid_pattern="^(feature|bugfix|hotfix|refactor|docs|test|chore)/HLX-[0-9]+-[a-z0-9-]+$"

if ! [[ $branch_name =~ $valid_pattern ]]; then
  echo "ERROR: Branch name '$branch_name' doesn't follow the naming convention."
  echo "Please rename your branch to match: <type>/HLX-<number>-<description>"
  echo "Example: feature/HLX-123-implement-user-authentication"
  exit 1
fi
```

## Conclusion

Following these branch naming conventions ensures consistency across our projects, improves traceability between code and issues, and enables more efficient automation. Consistent branch names are a key component of our integrated workflow between Linear and GitHub.

