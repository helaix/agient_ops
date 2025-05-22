# Linear Workflows Reference Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Overview of Linear Workflows](#overview-of-linear-workflows)
3. [Guidelines for Agents Working with Linear](#guidelines-for-agents-working-with-linear)
4. [Task Delegation and Communication](#task-delegation-and-communication)
5. [Common Tools and Patterns](#common-tools-and-patterns)
6. [Examples of Successful Workflows](#examples-of-successful-workflows)
7. [Troubleshooting](#troubleshooting)
8. [References](#references)

## Introduction

This document serves as the comprehensive reference guide for Linear workflows within the Codegen ecosystem. It provides the essential information, guidelines, and best practices for agents working with Linear issues, ensuring consistent and effective task management and collaboration.

Linear is a project management tool that helps teams track issues, manage projects, and coordinate work. When integrated with Codegen, it enables a powerful workflow for task delegation, progress tracking, and collaborative development.

This guide will be linked in every new task assigned to Codegen, providing a consistent entry point and reference for Linear-based workflows.

## Overview of Linear Workflows

### What is a Linear Workflow?

A Linear workflow represents the structured process of managing tasks from creation to completion using Linear's issue tracking system. In the context of Codegen, these workflows involve:

1. **Issue Creation**: Tasks are created as Linear issues with detailed descriptions, requirements, and deliverables.
2. **Assignment**: Issues are assigned to Codegen or human team members.
3. **Implementation**: The assigned agent or team member works on the task, making necessary code changes.
4. **Review and Feedback**: Changes are reviewed, and feedback is provided through comments on the issue.
5. **Completion**: Once the task is completed and approved, the issue is marked as done.

### Key Components of Linear Workflows


- **Issues**: The fundamental unit of work in Linear, containing descriptions, requirements, and metadata.

- **States**: Issues progress through different states (e.g., Backlog, In Progress, Done) reflecting their current status.

- **Comments**: Communication threads attached to issues for discussions and updates.

- **Labels**: Tags that categorize issues by type, priority, or other attributes.

- **Sub-issues**: Child issues that break down complex tasks into smaller, manageable pieces.

- **Cycles**: Time-boxed periods (similar to sprints) for organizing and prioritizing work.

### Linear Integration with Development Workflow

Linear workflows integrate with the development process through:


- **Branch Creation**: Creating Git branches based on issue identifiers.

- **Pull Requests**: Linking PRs to Linear issues for traceability.

- **Automated State Changes**: Updating issue states based on PR events.

- **Notifications**: Alerting team members about issue updates and mentions.

## Guidelines for Agents Working with Linear

### Initial Response

When assigned a Linear issue, an agent should:

1. **Acknowledge Receipt**: Immediately acknowledge the assignment with a comment.
2. **Understand Requirements**: Thoroughly read and understand the issue description, requirements, and any attached context.
3. **Ask Clarifying Questions**: If any aspects of the task are unclear, ask specific questions in the issue comments.
4. **Self-Assign**: Ensure the issue is properly assigned to you using the `linear_self_assign` tool.
5. **Update State**: Move the issue to the appropriate state (typically "In Progress") using the `linear_update_issue` tool.

### Working on Issues

While working on an issue, agents should:

1. **Follow Branch Naming Conventions**: Create branches following the format specified in the issue or using `codegen-bot/{feature}-{unique-id}`.
2. **Make Incremental Progress**: Break down complex tasks into smaller, manageable steps.
3. **Provide Regular Updates**: Comment on the issue with progress updates, especially for longer tasks.
4. **Document Decisions**: Record important decisions or approach changes in the issue comments.
5. **Link Related Resources**: Attach relevant links (documentation, related PRs, etc.) using the `linear_attach_link` tool.

### Completing Issues

When completing an issue, agents should:

1. **Create Pull Requests**: Create PRs with clear descriptions linking back to the Linear issue.
2. **Attach PR Links**: Use the `linear_attach_link` tool to attach the PR to the Linear issue.
3. **Summarize Changes**: Provide a concise summary of the changes made and how they fulfill the requirements.
4. **Request Review**: If appropriate, request review from specific team members.
5. **Update Issue State**: Move the issue to the appropriate state (e.g., "Ready for Review" or "Done").

## Task Delegation and Communication

### Breaking Down Complex Tasks

For complex issues, agents should:

1. **Create Sub-Issues**: Break down large tasks into smaller, focused sub-issues using the `linear_create_issue` tool with the `parent_issue_id` parameter.
2. **Establish Dependencies**: Clearly document dependencies between sub-issues in their descriptions.
3. **Prioritize Sub-Issues**: Order sub-issues based on dependencies and logical workflow.
4. **Assign Appropriately**: Assign sub-issues to the appropriate agents or team members.

### sub-agent Delegation

When delegating tasks to sub-agents:

1. **Create Detailed Sub-Issues**: Include comprehensive context, requirements, and acceptance criteria.
2. **Provide Scaffolding**: For code-related tasks, create a base branch with necessary scaffolding before creating sub-issues.
3. **Include Branch Information**: Specify the base branch in the sub-issue description.
4. **Set Clear Expectations**: Define deliverables and acceptance criteria explicitly.
5. **Assign to Self**: Assign the sub-issue to yourself, which will trigger a sub-agent to work on it.

### Communication Best Practices

Effective communication in Linear workflows includes:

1. **Clear and Concise Comments**: Write comments that are easy to understand and focused on the issue at hand.
2. **Structured Updates**: Format progress updates with clear sections (e.g., "Progress", "Blockers", "Questions").
3. **Code References**: When discussing code, use backticks for inline code and triple backticks for code blocks.
4. **Mention Relevant Parties**: Use @ mentions to notify specific team members when their input is needed.
5. **Respond Promptly**: Acknowledge and respond to comments and questions in a timely manner.

### Handling Interrupts

When receiving interrupt messages (additional comments while working on an issue):

1. **Acknowledge Promptly**: Immediately acknowledge the new information.
2. **Incorporate Feedback**: Adjust your approach based on the new information.
3. **Provide Status Update**: Let the commenter know how their input affects the current work.
4. **Continue Progress**: Resume work with the updated context.

## Common Tools and Patterns

### Essential Linear Tools

Codegen provides several tools for interacting with Linear:

1. **Issue Management**:

   - `linear_get_issue`: Retrieve issue details

   - `linear_create_issue`: Create new issues

   - `linear_update_issue`: Update issue properties

   - `linear_self_assign`: Assign an issue to yourself

   - `linear_search_issues`: Search for issues with filters

2. **Communication**:

   - `linear_comment_on_issue`: Add comments to issues

   - `linear_get_issue_comments`: Retrieve comments on an issue

   - `send_message`: Send a message in the Linear thread

3. **Linking and References**:

   - `linear_attach_link`: Attach external links to issues

4. **Team and Project Management**:

   - `linear_get_teams`: List available teams

   - `linear_search_teams`: Search for specific teams

   - `linear_search_projects`: Find projects by name

   - `linear_get_assignees`: List available assignees

5. **State and Label Management**:

   - `linear_get_issue_states`: List available issue states

   - `linear_get_issue_labels`: List available labels

   - `linear_get_issue_priority_values`: List priority values

6. **Cycle Management**:

   - `linear_get_active_cycle`: Get the current active cycle

   - `linear_get_cycles`: List all cycles

   - `linear_get_cycle_issues`: List issues in a cycle

   - `linear_assign_issue_to_cycle`: Add an issue to a cycle

### Common Patterns

1. **Issue Creation and Assignment**:
   ```javascript
   // Create a new issue
   const issueResult = await linear_create_issue({
     title: "Implement feature X",
     description: "Detailed description of the feature...",
     self_assign: true
   });
   
   // Or assign an existing issue to yourself
   await linear_self_assign({ override_assignee: false });
   ```

2. **Updating Issue State**:
   ```javascript
   // Move issue to In Progress
   await linear_update_issue({
     issue_id: "issue-id",
     state_id: "in-progress-state-id"
   });
   ```

3. **Adding Comments with Progress Updates**:
   ```javascript
   await linear_comment_on_issue({
     issue_id: "issue-id",
     body: "## Progress Update\n\nCompleted implementation of X component.\n\n## Next Steps\n\n- Implement Y functionality\n- Write tests"
   });
   ```

4. **Creating Sub-Issues**:
   ```javascript
   // Create a sub-issue
   await linear_create_issue({
     title: "Implement sub-feature Y",
     description: "Detailed description...",
     parent_issue_id: "parent-issue-id",
     self_assign: true
   });
   ```

5. **Attaching PR Links**:
   ```javascript
   await linear_attach_link({
     issue_id: "issue-id",
     title: "Pull Request #123",
     url: "https://github.com/org/repo/pull/123"
   });
   ```

## Examples of Successful Workflows

### Simple Feature Implementation

1. **Issue Creation**: A new issue is created for implementing a feature.
2. **Agent Assignment**: The issue is assigned to Codegen.
3. **Initial Response**: Codegen acknowledges the assignment and updates the issue state to "In Progress".
4. **Implementation**: Codegen creates a branch, implements the feature, and pushes the changes.
5. **PR Creation**: Codegen creates a PR and links it to the Linear issue.
6. **Review and Feedback**: The team reviews the PR and provides feedback in Linear comments.
7. **Iteration**: Codegen makes requested changes and updates the PR.
8. **Completion**: Once approved, the PR is merged, and the issue is marked as "Done".

### Complex Task with Sub-Issues

1. **Parent Issue Creation**: A complex task is created as a parent issue.
2. **Initial Planning**: Codegen analyzes the task and creates a plan to break it down.
3. **Branch Scaffolding**: Codegen creates a base branch with initial scaffolding.
4. **Sub-Issue Creation**: Codegen creates multiple sub-issues, each assigned to itself.
5. **sub-agent Work**: sub-agents work on individual sub-issues, creating their own branches from the base branch.
6. **Progress Tracking**: The parent agent monitors progress and coordinates between sub-agents.
7. **Integration**: As sub-issues are completed, the parent agent merges changes into the main branch.
8. **Final PR**: Once all sub-issues are complete, a final PR is created for the entire feature.
9. **Completion**: After review and approval, the PR is merged, and all issues are marked as "Done".

### Collaborative Development

1. **Issue Assignment**: An issue is assigned to Codegen for initial implementation.
2. **Partial Implementation**: Codegen implements part of the solution and creates a PR.
3. **Handoff**: Codegen comments on the issue with details about the implementation and remaining work.
4. **Human Collaboration**: A human developer takes over, making additional changes based on Codegen's work.
5. **Completion**: The human developer completes the implementation and marks the issue as "Done".

## Troubleshooting

### Common Issues and Solutions

1. **Issue Assignment Failures**:

   - **Problem**: Unable to assign an issue to yourself.

   - **Solution**: Check if the issue is already assigned to someone else. Use `override_assignee: true` if appropriate.

2. **State Transition Errors**:

   - **Problem**: Cannot update the issue state.

   - **Solution**: Verify that the state ID is valid for the team. Use `linear_get_issue_states` to list available states.

3. **Sub-Issue Creation Problems**:

   - **Problem**: Unable to create sub-issues.

   - **Solution**: Ensure the parent issue ID is correct and that you have permission to create sub-issues.

4. **Branch Naming Conflicts**:

   - **Problem**: Branch creation fails due to naming conflicts.

   - **Solution**: Add a unique identifier to the branch name, such as a timestamp or random string.

5. **PR Creation Failures**:

   - **Problem**: Unable to create a PR.

   - **Solution**: Ensure that changes are pushed to the remote branch before creating the PR. Verify that the branch exists in the remote repository.

### Escalation Path

If you encounter persistent issues with Linear workflows:

1. **Document the Issue**: Clearly document the problem, including error messages and steps to reproduce.
2. **Comment on the Issue**: Add a comment explaining the problem and requesting assistance.
3. **Mention Relevant Team Members**: Use @ mentions to notify specific team members who can help.
4. **Provide Workarounds**: If possible, suggest alternative approaches or workarounds.

## References


- [Linear API Documentation](https://developers.linear.app/docs/)

- [GitHub Integration Guide](https://linear.app/docs/github)

- [Linear Workflow Best Practices](https://linear.app/docs/workflow)

- [Codegen Documentation](https://codegen.sh/docs)

---

This document will be continuously updated to reflect the latest best practices and workflows for Linear integration with Codegen. If you have suggestions for improvements, please create an issue or PR with your proposed changes.



## Related Resources

- [Common Linear Workflow Scenarios and Examples](../examples/linear_workflow_scenarios.md)
- [Workflow Selection Decision Tree](../decision_trees/workflow_selection_tree.md)
- [Linear Workflow Decision Diagram](linear_workflow_diagram.md)
