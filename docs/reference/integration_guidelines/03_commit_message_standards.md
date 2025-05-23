# Commit Message Standards

## Overview

Well-structured commit messages are essential for maintaining a clear and useful Git history. They provide context for changes, facilitate code reviews, and enable effective tracking of work related to Linear issues. This guide outlines our standards for writing commit messages.

## Commit Message Structure

Our commit messages follow this structure:

```
[<issue-id>] <type>: <subject>

<body>

<footer>
```

### Components

1. **Issue ID**: The Linear issue identifier in square brackets (e.g., [HLX-123])
2. **Type**: Indicates the kind of change (see types below)
3. **Subject**: A concise description of the change
4. **Body** (optional): Detailed explanation of the change
5. **Footer** (optional): References to related issues or breaking changes

## Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | A new feature | `[HLX-123] feat: add user authentication` |
| `fix` | A bug fix | `[HLX-456] fix: resolve login validation error` |
| `docs` | Documentation changes | `[HLX-789] docs: update API documentation` |
| `style` | Formatting changes (not affecting code) | `[HLX-234] style: format according to style guide` |
| `refactor` | Code refactoring | `[HLX-567] refactor: simplify authentication logic` |
| `test` | Adding or modifying tests | `[HLX-890] test: add unit tests for auth service` |
| `chore` | Maintenance tasks | `[HLX-321] chore: update dependencies` |
| `perf` | Performance improvements | `[HLX-654] perf: optimize database queries` |

## Guidelines

### Subject Line

- Start with the Linear issue ID in square brackets
- Use the present tense ("add" not "added" or "adds")
- Begin with a lowercase letter
- Do not end with a period
- Keep it under 50 characters
- Be specific and concise

### Body

- Separate from subject with a blank line
- Explain *what* and *why* (not *how*)
- Use bullet points for multiple points (each starting with a hyphen)
- Wrap text at 72 characters
- Include relevant background information

### Footer

- Reference related issues: `Related to: HLX-789`
- Note breaking changes: `BREAKING CHANGE: API response format changed`

## Examples

### Simple Commit

```
[HLX-123] feat: add user authentication
```

### Detailed Commit

```
[HLX-456] fix: resolve login validation error

- Fix issue where email validation was not properly checking format
- Add additional validation for password complexity
- Improve error messages for better user feedback

This addresses the security concerns raised in the security audit.

Related to: HLX-789
```

### Breaking Change

```
[HLX-567] refactor: simplify authentication flow

Completely restructure the authentication process to use the new
identity service instead of the legacy auth system.

BREAKING CHANGE: Authentication endpoints have changed. Clients
need to update their integration.
```

## Best Practices

1. **Be Consistent**: Follow these standards for all commits
2. **Be Descriptive**: Provide enough context to understand the change without looking at the code
3. **Reference Issues**: Always include the Linear issue ID
4. **Atomic Commits**: Each commit should represent a single logical change
5. **Separate Concerns**: Don't mix unrelated changes in a single commit

## Integration with Linear

Including the Linear issue ID in your commit messages enables:

1. **Automatic Tracking**: Linear can track which commits are associated with which issues
2. **Status Updates**: Trigger status changes in Linear based on commits
3. **Activity Logs**: Maintain a record of development activity in Linear

## Implementation Tips

### Git Hooks for Validation

Consider implementing a Git hook to validate commit messages:

```bash
#!/bin/bash
# .git/hooks/commit-msg

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# Regex pattern for valid commit messages
valid_pattern="^\[HLX-[0-9]+\] (feat|fix|docs|style|refactor|test|chore|perf): .{1,50}$"

if ! [[ "$(head -1 "$commit_msg_file")" =~ $valid_pattern ]]; then
  echo "ERROR: Commit message format is invalid."
  echo "Please use the format: [HLX-123] type: subject"
  echo "Example: [HLX-123] feat: add user authentication"
  exit 1
fi
```

### Using Git Commit Templates

Create a commit template:

```
# .gitmessage
[HLX-] : 

# Why is this change needed?

# How does it address the issue?

# Related issues
```

Configure Git to use the template:

```bash
git config --global commit.template ~/.gitmessage
```

## Conclusion

Following these commit message standards ensures a clean and useful Git history, improves collaboration among team members, and maintains clear connections between code changes and Linear issues. Consistent commit messages are a key component of our integrated workflow between Linear and GitHub.

