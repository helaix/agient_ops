# Terminology and Glossary

## Overview

This document provides standardized definitions and terminology used across Linear, GitHub, and agent collaboration workflows. Consistent terminology is essential for clear communication and effective collaboration.

## Linear Terminology

### Core Concepts

**Issue**: A work item in Linear representing a task, bug, feature request, or other unit of work.

**Team**: A group of users in Linear that owns and manages a set of issues and workflows.

**Project**: A collection of issues that represent a larger initiative or goal.

**Cycle**: A time-boxed period (usually 1-2 weeks) during which a team commits to completing specific issues.

**Milestone**: A significant point in a project timeline, often representing a major deliverable or deadline.

**Label**: A tag that can be applied to issues for categorization and filtering.

**State**: The current status of an issue (e.g., "To Do", "In Progress", "Done").

**Priority**: The relative importance of an issue (e.g., "Low", "Medium", "High", "Urgent").

### Workflow Terms

**Triage**: The process of reviewing and categorizing new issues.

**Backlog**: A collection of issues that are planned but not yet started.

**Sprint**: Similar to a cycle, a time-boxed period for completing work.

**Epic**: A large issue that can be broken down into smaller sub-issues.

**Sub-issue**: A smaller issue that is part of a larger parent issue.

**Dependency**: A relationship where one issue must be completed before another can start.

**Blocker**: An issue or external factor that prevents progress on another issue.

## GitHub Terminology

### Repository Management

**Repository (Repo)**: A container for a project's code, documentation, and history.

**Branch**: A parallel version of the repository that diverges from the main line of development.

**Main/Master Branch**: The primary branch of a repository, typically containing production-ready code.

**Feature Branch**: A branch created to develop a specific feature or fix.

**Fork**: A copy of a repository that allows you to make changes without affecting the original.

**Clone**: A local copy of a repository on your machine.

### Collaboration

**Pull Request (PR)**: A request to merge changes from one branch into another.

**Merge**: The process of integrating changes from one branch into another.

**Commit**: A snapshot of changes to the repository at a specific point in time.

**Push**: Uploading local commits to a remote repository.

**Pull**: Downloading changes from a remote repository to your local copy.

**Review**: The process of examining code changes before they are merged.

**Approval**: Formal acceptance of a pull request by a reviewer.

### Workflow States

**Draft PR**: A pull request that is not yet ready for review.

**Open PR**: A pull request that is ready for review and merging.

**Merged PR**: A pull request that has been successfully integrated into the target branch.

**Closed PR**: A pull request that has been closed without merging.

**Conflict**: A situation where changes in different branches cannot be automatically merged.

## Agent Collaboration Terms

### Agent Types

**Parent Agent**: An agent that delegates tasks to other agents and coordinates their work.

**Child Agent**: An agent that receives tasks from a parent agent and reports back on progress.

**Peer Agent**: An agent working at the same level as another agent, often on related tasks.

**Coordinator Agent**: An agent responsible for managing communication and coordination between multiple agents.

### Task Management

**Task Delegation**: The process of assigning specific tasks to appropriate agents.

**Task Decomposition**: Breaking down a large task into smaller, manageable sub-tasks.

**Task Coordination**: Managing dependencies and communication between related tasks.

**Task Escalation**: Moving a task or issue up the hierarchy when it cannot be resolved at the current level.

**Task Handoff**: Transferring responsibility for a task from one agent to another.

### Communication Patterns

**Status Update**: Regular communication about progress, blockers, and next steps.

**Escalation**: Communication to a higher level when issues cannot be resolved locally.

**Coordination Message**: Communication between agents working on related tasks.

**Completion Report**: Final communication when a task is completed, including results and lessons learned.

**Feedback Loop**: Ongoing communication to improve processes and outcomes.

## Integration Terms

### Linear-GitHub Integration

**Issue Linking**: Connecting Linear issues to GitHub pull requests for traceability.

**Branch Naming Convention**: Standardized format for naming git branches based on Linear issues.

**Commit Message Standard**: Standardized format for commit messages that reference Linear issues.

**Automation Rule**: Configured behavior that automatically updates one system based on changes in another.

**Webhook**: A mechanism for one system to notify another when specific events occur.

### Workflow Integration

**Entry Point**: The primary starting location for agents to understand workflows and guidelines.

**Workflow Pattern**: A reusable approach for handling specific types of tasks or situations.

**Decision Tree**: A visual guide for selecting appropriate workflow patterns based on task characteristics.

**Checklist**: A step-by-step guide for executing specific workflow patterns.

**Template**: A pre-formatted structure for common documents or processes.

## Cross-Platform Terms

### Status Mapping

**Linear State → GitHub Status**: How Linear issue states correspond to GitHub PR states.

**Workflow Trigger**: Events that cause automated actions across platforms.

**Sync Status**: The current state of synchronization between Linear and GitHub.

**Integration Health**: Overall status of the integration between systems.

### Quality Assurance

**Validation**: Checking that work meets specified requirements and standards.

**Review Process**: Systematic examination of work before it is considered complete.

**Approval Workflow**: The sequence of approvals required before work can be merged or deployed.

**Quality Gate**: A checkpoint that must be passed before proceeding to the next stage.

## Usage Guidelines

### Consistent Usage

- Always use the standardized terms defined in this glossary
- When introducing new terms, add them to this document
- Ensure all team members understand these definitions
- Use these terms consistently across all documentation and communication

### Context Clarity

- When using terms that might be ambiguous, provide context
- Specify which system you're referring to when terms overlap
- Use full terms initially, then abbreviations if needed
- Link to this glossary when using specialized terms in documentation

## Related Documentation

- [Linear Workflows Reference](../linear_workflows_reference.md)
- [Integration Guidelines](../integration_guidelines/README.md)
- [Decision Trees](../decision_trees/README.md)
- [Communication Standards](../tactical_communication_standards.md)

