# Commit Message Standards

A comprehensive guide for standardized commit message formats that reference Linear issues.

## Table of Contents

1. [Introduction](#introduction)
2. [Message Structure](#message-structure)
3. [Linear Issue References](#linear-issue-references)
4. [Semantic Conventions](#semantic-conventions)
5. [Examples](#examples)
6. [Enforcement Tools](#enforcement-tools)
7. [Integration Benefits](#integration-benefits)

## Introduction

Standardized commit messages are essential for maintaining a clean, understandable, and traceable project history. When working with Linear for issue tracking, incorporating issue references into commit messages creates a seamless integration between your code changes and project management workflow.

This guide provides a comprehensive set of standards for formatting commit messages that reference Linear issues, combining best practices from conventional commit standards with Linear-specific integration features.

### Purpose

- Create a consistent and readable commit history
- Automate issue tracking and status updates
- Enable efficient code review and change tracking
- Facilitate automatic changelog generation
- Improve collaboration between development and project management

## Message Structure

A well-structured commit message that references Linear issues should follow this format:

```
<type>(<optional scope>): <description> [<issue-reference>]

<optional body>

<optional footer>
```

### Components

1. **Type**: Indicates the kind of change (see [Semantic Conventions](#semantic-conventions))
2. **Scope** (optional): Specifies the section of the codebase affected
3. **Description**: A concise summary of the change (imperative, present tense)
4. **Issue Reference**: Linear issue ID (e.g., `[HLX-123]`)
5. **Body** (optional): Detailed explanation of the change
6. **Footer** (optional): Information about breaking changes or issue references with magic words

### Guidelines

- Keep the first line (type, scope, description, issue reference) under 72 characters
- Use imperative, present tense in the description (e.g., "add" not "added" or "adds")
- Capitalize the first letter of the description
- Do not end the description with a period
- Separate the body from the first line with a blank line
- Use the body to explain the what and why of the change, not the how
- Reference issues in the footer using magic words (see [Linear Issue References](#linear-issue-references))

## Linear Issue References

Linear provides several ways to reference issues in commit messages, which can trigger automated workflow updates.

### Issue ID Format

The standard format for referencing a Linear issue is the team key followed by the issue number:

```
[TEAM-123]
```

For example: `[HLX-123]`, `[ENG-456]`, `[DESIGN-789]`

### Placement Options

1. **Branch Name**: Include the issue ID in the branch name (e.g., `feature/HLX-123-add-login-form`)
2. **Commit Message Subject**: Add the issue ID at the end of the first line (e.g., `feat: Add login form [HLX-123]`)
3. **Commit Message Body/Footer**: Use magic words with the issue ID or URL

### Magic Words

Linear recognizes specific "magic words" that can be used to link commits to issues and trigger status updates:

#### Closing Magic Words

These words will move the issue to "In Progress" when the commit is pushed and "Done" when merged to the default branch:

- `close`, `closes`, `closed`, `closing`
- `fix`, `fixes`, `fixed`, `fixing`
- `resolve`, `resolves`, `resolved`, `resolving`
- `complete`, `completes`, `completed`, `completing`

Example: `Fixes HLX-123` or `Closes https://linear.app/workspace/issue/HLX-123/title`

#### Non-Closing Magic Words

These words will link the commit to the issue but won't automatically close it when merged:

- `ref`, `references`
- `part of`, `related to`
- `contributes to`, `towards`

Example: `Related to HLX-123` or `Part of https://linear.app/workspace/issue/HLX-123/title`

## Semantic Conventions

Following the [Conventional Commits](https://www.conventionalcommits.org/) specification, use these standardized types to indicate the nature of the change:

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Changes that don't affect code functionality (formatting, etc.) |
| `refactor` | Code changes that neither fix bugs nor add features |
| `perf` | Performance improvements |
| `test` | Adding or correcting tests |
| `build` | Changes to build system or dependencies |
| `ci` | Changes to CI configuration |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

### Scope

The scope provides additional contextual information about the area of the change:

- Component names: `feat(auth): Add login form [HLX-123]`
- Module names: `fix(api): Fix data parsing issue [HLX-456]`
- Feature areas: `docs(onboarding): Update user guide [HLX-789]`

### Breaking Changes

For changes that break backward compatibility, add `BREAKING CHANGE:` in the footer or append a `!` after the type/scope:

```
feat(api)!: Change authentication endpoints [HLX-123]

BREAKING CHANGE: The authentication API has been completely redesigned.
```

## Examples

Here are examples of well-formatted commit messages that reference Linear issues:

### Simple Feature Addition

```
feat: Add password reset functionality [HLX-123]
```

### Bug Fix with Scope

```
fix(auth): Resolve login timeout issue [HLX-456]
```

### Documentation Update with Body

```
docs: Update API documentation [HLX-789]

Update the authentication API documentation with new endpoints
and improved examples for better developer experience.
```

### Breaking Change with Magic Word

```
feat(api)!: Redesign user endpoints [HLX-101]

BREAKING CHANGE: User API endpoints have been redesigned for better
performance and security.

Closes HLX-101
```

### Refactoring with Non-Closing Reference

```
refactor(core): Improve error handling [HLX-202]

Refactored the error handling system to provide more detailed
error messages and better logging.

Related to HLX-202
```

### Multiple Issue References

```
fix: Address security vulnerabilities [HLX-303]

- Update dependencies to latest versions
- Implement input validation
- Add rate limiting

Fixes HLX-303
Related to HLX-304, HLX-305
```

## Enforcement Tools

To ensure consistent commit message formatting across your team, consider implementing these enforcement tools:

### Git Hooks

Use pre-commit hooks to validate commit messages before they're accepted:

#### Using Husky and Commitlint

1. Install the required packages:

```bash
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional
```

2. Create a commitlint configuration file (`.commitlintrc.js`):

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'references-empty': [2, 'never'],
    'body-max-line-length': [0, 'always'],
    'footer-max-line-length': [0, 'always'],
  },
  parserPreset: {
    parserOpts: {
      issuePrefixes: ['HLX-', 'ENG-', 'DESIGN-']
    }
  }
};
```

3. Set up Husky:

```bash
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

### Commit Templates

Create a commit template to guide developers:

1. Create a `.gitmessage` file:

```
<type>(<optional scope>): <description> [<issue-reference>]

<body>

<footer>
```

2. Configure Git to use the template:

```bash
git config --local commit.template .gitmessage
```

### GitHub Branch Protection

Set up branch protection rules to enforce commit message standards:

1. Go to your repository settings
2. Navigate to "Branches" > "Branch protection rules"
3. Add a rule for your main branches
4. Enable "Require status checks to pass before merging"
5. Add your commit linting check as a required status check

### IDE Extensions

Recommend these IDE extensions to your team:

- VS Code: [Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits)
- JetBrains IDEs: [Conventional Commit](https://plugins.jetbrains.com/plugin/13389-conventional-commit)

## Integration Benefits

Adopting standardized commit messages with Linear issue references provides numerous benefits:

### Automated Workflow Updates

- Commits automatically move issues to "In Progress" when pushed
- PRs automatically move issues to "Done" when merged
- Custom workflow rules can be configured based on branch names

### Enhanced Traceability

- Direct links between code changes and issues
- Clear visibility of which commits address which issues
- Ability to track the full lifecycle of a feature or bug fix

### Improved Collaboration

- Team members can quickly understand the purpose of changes
- Project managers can track development progress without technical knowledge
- New team members can more easily understand project history

### Automated Documentation

- Generate changelogs automatically from commit messages
- Create release notes with meaningful categorization
- Document breaking changes clearly

### Quality Assurance

- Enforce code review processes through commit standards
- Ensure all changes are associated with tracked issues
- Maintain a clean and meaningful commit history

By following these commit message standards, your team will benefit from improved collaboration, automation, and traceability between your code and Linear issues.

