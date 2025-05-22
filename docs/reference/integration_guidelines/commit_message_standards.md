# Commit Message Standards

This document outlines standardized commit message formats that reference Linear issues, providing guidelines for better integration between Linear and GitHub.

## Table of Contents

1. [Introduction](#introduction)
2. [Message Structure](#message-structure)
3. [Linear Issue References](#linear-issue-references)
4. [Semantic Conventions](#semantic-conventions)
5. [Examples](#examples)
6. [Enforcement Tools](#enforcement-tools)
7. [Integration Benefits](#integration-benefits)

## Introduction

Standardized commit messages play a crucial role in maintaining a clean, traceable, and automated development workflow. When properly formatted, commit messages can:

- Provide clear context about changes
- Automatically link to issue tracking systems like Linear
- Trigger workflow automations
- Generate accurate changelogs
- Facilitate semantic versioning

This document focuses specifically on commit message formats that integrate with Linear, allowing for automated issue tracking, status updates, and seamless workflow transitions between code changes and issue management.

## Message Structure

A well-structured commit message that references Linear issues should follow these guidelines:

### Basic Structure

```
<type>(<optional scope>): <description> [<Linear issue reference>]

<optional body>

<optional footer>
```

### Components

1. **Type**: Indicates the kind of change (e.g., `feat`, `fix`, `docs`)
2. **Scope** (optional): Specifies the section of the codebase affected
3. **Description**: A concise summary of the change
4. **Linear Issue Reference**: The Linear issue ID (e.g., `HLX-123`)
5. **Body** (optional): Detailed explanation of the change
6. **Footer** (optional): Information about breaking changes or issue references

### Character Limits

- **Subject Line** (first line): Maximum 72 characters
- **Body Lines**: Maximum 100 characters per line
- **Overall Message**: No strict limit, but conciseness is encouraged

## Linear Issue References

Linear provides several ways to reference issues in commit messages, which can trigger automated workflows.

### Magic Words

Linear recognizes specific "magic words" in commit messages that can link commits to issues and trigger status changes:

#### Closing Magic Words

These words will move the issue to "In Progress" when the branch is pushed and "Done" when the commit is merged to the default branch:

- `close`, `closes`, `closed`, `closing`
- `fix`, `fixes`, `fixed`, `fixing`
- `resolve`, `resolves`, `resolved`, `resolving`
- `complete`, `completes`, `completed`, `completing`

Example: `fix(auth): correct login validation error fixes HLX-123`

#### Non-Closing Magic Words

These words will link the commit to the issue but won't automatically close it when merged:

- `ref`, `references`
- `part of`
- `related to`
- `contributes to`
- `towards`

Example: `feat(dashboard): add new analytics chart ref HLX-456`

### Placement Options

Linear issue references can be placed in different parts of the commit message:

1. **In the subject line** (recommended for visibility):
   ```
   feat(user): add profile image upload HLX-789
   ```

2. **In the body with a magic word**:
   ```
   feat(user): add profile image upload
   
   Implements the user profile image upload feature with drag-and-drop support
   
   Closes HLX-789
   ```

3. **In the footer** (especially for multiple issues):
   ```
   feat(user): add profile image upload
   
   Implements the user profile image upload feature with drag-and-drop support
   
   Fixes: HLX-789
   Related to: HLX-790, HLX-791
   ```

### Format Variations

Linear supports several format variations for issue references:

1. **Issue ID only**: `HLX-123`
2. **With magic word**: `fixes HLX-123`
3. **Full URL**: `fixes https://linear.app/workspace/issue/HLX-123/title`

## Semantic Conventions

Adopting semantic conventions for commit messages provides additional structure and enables automated versioning and changelog generation. The most widely adopted standard is [Conventional Commits](https://www.conventionalcommits.org/).

### Types

Common commit types include:

| Type | Description | Example |
|------|-------------|---------|
| `feat` | A new feature | `feat(auth): add two-factor authentication` |
| `fix` | A bug fix | `fix(api): prevent race condition in requests` |
| `docs` | Documentation changes | `docs(readme): update installation instructions` |
| `style` | Code style changes (formatting, etc.) | `style(components): format according to style guide` |
| `refactor` | Code changes that neither fix bugs nor add features | `refactor(utils): simplify date formatting function` |
| `perf` | Performance improvements | `perf(queries): optimize database lookups` |
| `test` | Adding or correcting tests | `test(api): add tests for user endpoints` |
| `build` | Changes to build system or dependencies | `build(deps): update React to v18` |
| `ci` | Changes to CI configuration | `ci(github): add workflow for automated tests` |
| `chore` | Other changes that don't modify src or test files | `chore(release): bump version to 1.2.0` |

### Scopes

Scopes provide additional context about which part of the codebase is affected. Common approaches to defining scopes include:

1. **Component-based**: `(auth)`, `(dashboard)`, `(api)`
2. **Module-based**: `(users)`, `(orders)`, `(products)`
3. **Layer-based**: `(ui)`, `(backend)`, `(database)`

### Breaking Changes

Breaking changes should be clearly indicated:

1. **In the type with an exclamation mark**:
   ```
   feat!: change API response format
   ```

2. **In the footer with BREAKING CHANGE**:
   ```
   feat(api): change response format
   
   BREAKING CHANGE: The response format has changed from XML to JSON
   ```

## Examples

Here are examples of well-formatted commit messages that reference Linear issues:

### Feature Addition

```
feat(auth): implement password reset flow HLX-123

Add complete password reset flow with email verification
and security questions. Includes rate limiting to prevent abuse.

Closes HLX-123
Related to HLX-124, HLX-125
```

### Bug Fix

```
fix(checkout): resolve payment processing error fixes HLX-456

The payment processing error was caused by an incorrect API endpoint.
Updated the endpoint URL and added error handling.
```

### Documentation Update

```
docs(readme): update installation instructions ref HLX-789

Update the installation instructions to include the new
environment variables required for configuration.
```

### Breaking Change

```
feat!(api): change authentication mechanism HLX-234

Replace token-based authentication with OAuth2.

BREAKING CHANGE: All clients need to update their authentication flow
to use the new OAuth2 endpoints.

Closes HLX-234
```

### Multiple Issues

```
fix(search): improve search performance and fix sorting

- Optimize database queries for faster search results
- Fix incorrect sorting of results by relevance

Fixes: HLX-345
Fixes: HLX-346
Related to: HLX-347
```

### Refactoring

```
refactor(utils): simplify date formatting functions ref HLX-567

Consolidate multiple date formatting functions into a single utility
with configurable options. Reduces code duplication and improves maintainability.
```

## Enforcement Tools

Several tools can help enforce standardized commit message formats:

### Git Hooks

1. **Husky**: Set up Git hooks to validate commit messages
   - Installation: `npm install husky --save-dev`
   - Configuration: Create `.husky/commit-msg` hook

2. **commitlint**: Lint commit messages against defined rules
   - Installation: `npm install @commitlint/cli @commitlint/config-conventional --save-dev`
   - Configuration: Create `commitlint.config.js`
   - Example configuration:
     ```js
     module.exports = {
       extends: ['@commitlint/config-conventional'],
       rules: {
         'references-empty': [2, 'never'], // Require issue references
         'body-max-line-length': [2, 'always', 100],
       },
       parserPreset: {
         parserOpts: {
           issuePrefixes: ['HLX-']
         }
       }
     };
     ```

### Interactive Tools

1. **Commitizen**: Interactive CLI for formatting commit messages
   - Installation: `npm install commitizen --save-dev`
   - Configuration: `npx commitizen init cz-conventional-changelog --save-dev --save-exact`
   - Usage: `npx cz` instead of `git commit`
   - Can be customized to include Linear issue references

2. **git-cz**: Alternative to Commitizen with similar functionality
   - Installation: `npm install git-cz --save-dev`
   - Usage: `npx git-cz`

### Automated Validation

1. **git-commit-msg-linter**: Lightweight commit message linter
   - Installation: `npm install git-commit-msg-linter --save-dev`
   - No configuration required for basic usage

2. **GitHub Actions**: Validate commit messages in CI/CD pipelines
   - Example workflow:
     ```yaml
     name: Validate Commit Messages
     on: [push, pull_request]
     jobs:
       validate:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3
             with:
               fetch-depth: 0
           - uses: wagoid/commitlint-github-action@v5
     ```

### Custom Templates

1. **Git Commit Template**: Create a template for developers to follow
   - Create `.gitmessage` file with template
   - Configure Git: `git config --global commit.template .gitmessage`
   - Example template:
     ```
     # <type>(<scope>): <description> [<Linear issue reference>]
     # |<---- Using a maximum of 72 characters ---->|
     
     # Why:
     
     # How:
     
     # References:
     # Fixes/Closes/Refs HLX-
     ```

## Integration Benefits

Adopting standardized commit message formats that reference Linear issues provides numerous benefits:

### Workflow Automation

1. **Automatic Status Updates**: Linear can automatically update issue status based on commit and PR activity
   - Issues move to "In Progress" when commits are pushed
   - Issues move to "Done" when commits are merged to the default branch

2. **Branch-Specific Rules**: Configure different status transitions based on target branches
   - Example: Merging to `staging` moves issues to "In QA"
   - Example: Merging to `main` moves issues to "Deployed"

3. **Auto-Assignment**: Commits can automatically assign issues to developers

### Traceability

1. **Code-to-Issue Linking**: Direct links between code changes and issues
2. **Change History**: Clear record of why changes were made
3. **Release Notes**: Automatic generation of release notes from commit messages

### Developer Experience

1. **Reduced Manual Updates**: Less need to manually update issue status
2. **Clear Guidelines**: Developers know exactly how to format commit messages
3. **Consistency**: Uniform commit history across the project

### Project Management

1. **Progress Tracking**: Better visibility into development progress
2. **Release Planning**: Easier to determine what features and fixes are included in each release
3. **Accountability**: Clear record of who made which changes and why

### Communication

1. **Cross-Team Visibility**: Non-technical team members can understand changes
2. **Onboarding**: New team members can quickly understand project history
3. **Stakeholder Updates**: Easier to communicate changes to stakeholders

By implementing these standards, teams can create a more efficient, transparent, and automated development workflow that seamlessly integrates code changes with issue tracking in Linear.

