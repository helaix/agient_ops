# Linear-GitHub Integration Guidelines

## Overview

This directory contains comprehensive guidelines for improving the integration between Linear and GitHub in our development workflow. These guidelines establish standardized practices for linking Linear issues to GitHub PRs, branch naming conventions, and commit message standards.

## Quick Start

If you're new to these guidelines, start here:

1. **[Introduction](00_introduction.md)** - Understand the purpose and benefits
2. **[Summary](04_summary.md)** - Quick reference for key recommendations
3. Choose the specific guide you need:
   - [Linear-GitHub Linking](01_linear_github_linking.md)
   - [Branch Naming Conventions](02_branch_naming_conventions.md)
   - [Commit Message Standards](03_commit_message_standards.md)

## When to Use These Guidelines

Use these guidelines when:
- Setting up Linear-GitHub workflows
- Creating branches for new features or fixes
- Writing commit messages
- Creating pull requests
- Configuring automation between Linear and GitHub
- Training team members on development workflows

## Document Structure

### Core Guidelines
- **[00_introduction.md](00_introduction.md)** - Purpose, benefits, and how to use these guidelines
- **[01_linear_github_linking.md](01_linear_github_linking.md)** - Best practices for connecting Linear issues with GitHub PRs
- **[02_branch_naming_conventions.md](02_branch_naming_conventions.md)** - Standards for naming branches based on Linear issues
- **[03_commit_message_standards.md](03_commit_message_standards.md)** - Guidelines for writing effective commit messages
- **[04_summary.md](04_summary.md)** - Quick reference guide with key recommendations

### Detailed Guides
Each guide includes:
- Clear explanations of concepts and benefits
- Step-by-step implementation instructions
- Practical examples and code snippets
- Best practices and common pitfalls
- Automation options and tools
- Troubleshooting guidance

## Implementation Checklist

Use this checklist to ensure you're following all guidelines:

- [ ] Linear issue created for the task
- [ ] Branch created following naming conventions (`<type>/<issue-id>-<description>`)
- [ ] Commits follow the standard format (`[<issue-id>] <type>: <subject>`)
- [ ] PR linked to Linear issue (automatically or manually)
- [ ] Linear issue status updated appropriately
- [ ] PR description includes context from Linear issue

## Quick Reference

### Branch Naming
```
feature/HLX-123-implement-feature
bugfix/HLX-456-fix-login-error
hotfix/HLX-789-critical-security-patch
```

### Commit Messages
```
[HLX-123] feat: implement user authentication
[HLX-456] fix: resolve login validation error
[HLX-789] docs: update API documentation
```

### PR Linking
```markdown
Implements user authentication flow

Resolves HLX-123
```

## Benefits

Following these guidelines provides:

- **Improved Traceability**: Clear connections between issues, branches, commits, and PRs
- **Enhanced Collaboration**: Easier for team members to understand context and purpose
- **Streamlined Workflows**: Reduced friction in development processes
- **Better Automation**: Enables automated workflows and integrations
- **Clearer Communication**: Standardized formats improve understanding across teams

## Getting Started

1. Review the [Introduction](00_introduction.md) to understand the overall approach
2. Read the [Summary](04_summary.md) for quick reference
3. Implement the guidelines in your daily workflow
4. Use the automation tools and tips provided in each guide
5. Provide feedback on any challenges or suggestions for improvement

## Support

If you have questions or need help implementing these guidelines:
1. Check the troubleshooting sections in each guide
2. Review the examples and implementation tips
3. Consult the automation recommendations
4. Reach out to the team for additional support

---

**Last Updated**: 2025-05-22
**Version**: 1.0

