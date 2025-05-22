---
title: Agent Collaboration Quick Reference
description: A concise reference guide for the agent collaboration workflow
---

# Agent Collaboration Quick Reference

This quick reference provides essential guidelines and templates for implementing the agent collaboration workflow. Use this as a handy reference when participating in multi-agent tasks.

## Role-Based Responsibilities

### Top-Level Agent

- **Planning**: Break down the overall task into manageable components
- **Delegation**: Create sub-issues and assign to Level 1 Agents
- **Branch Management**: Create and maintain the main feature branch
- **Integration**: Merge all Level 1 branches and resolve conflicts
- **Delivery**: Create the final PR and ensure all requirements are met
- **Communication**: Provide clear instructions and respond to escalations

### Level 1 Agent

- **Sub-Planning**: Break down assigned components into smaller tasks
- **Delegation**: Create sub-issues and assign to Level 2 Agents
- **Branch Management**: Create branch from main feature branch
- **Integration**: Merge Level 2 branches and resolve conflicts
- **Reporting**: Provide regular updates to Top-Level Agent
- **Implementation**: Implement directly assigned components

### Level 2 Agent

- **Branch Management**: Create branch from parent's branch
- **Implementation**: Implement assigned components
- **Reporting**: Provide regular updates to Level 1 Agent
- **Research**: Conduct research and provide findings as needed

## Branch Management Cheat Sheet

### Branch Creation

```bash
# For Top-Level Agent
git checkout main
git pull origin main
git checkout -b feature/main-task-description

# For Level 1 Agent
git checkout feature/main-task-description
git checkout -b level1/component-description

# For Level 2 Agent
git checkout level1/component-description
git checkout -b level2/subcomponent-description
```

### Pushing Changes

```bash
git add .
git commit -m "Descriptive commit message"
git push -u origin your-branch-name
```

### Merging Child Branches

```bash
# Checkout your branch
git checkout your-branch-name

# Merge child branch
git merge child-branch-name

# Resolve conflicts if needed

# Push changes
git push origin your-branch-name
```

## Communication Templates

### Status Update Template

```
@parent-agent Status Update: [Component Name]

Progress: [Percentage]% complete
Current Status: [Brief description of current work]

Completed:
- [Task 1]
- [Task 2]
- [Task 3]

In Progress:
- [Task 4]
- [Task 5]

Blockers:
- [Blocker 1, if any]
- [Blocker 2, if any]

ETA: [Expected completion date/time]
```

### Task Completion Template

```
@parent-agent Task Completion: [Component Name]

I've completed [component name] as requested. All requirements have been implemented and tested.

Key accomplishments:
1. [Accomplishment 1]
2. [Accomplishment 2]
3. [Accomplishment 3]

Branch: `[branch-name]`
Latest commit: [commit-hash]

All changes have been pushed to my branch. Please review and let me know if any adjustments are needed.
```

### Blocker Report Template

```
@parent-agent Blocker Alert: [Component Name]

I'm blocked on [specific task] due to [reason for blocker].

Impact: [Describe impact on your work and timeline]
Workaround: [Describe any temporary workarounds, if applicable]
Assistance needed: [Describe what you need to proceed]

Current status of other tasks: [Brief status update on non-blocked work]
```

## Task Delegation Templates

### Level 1 Task Template

```
# Task Assignment: [Component Name]

## Context
[Overall project context and how this component fits in]

## Objective
[Clear statement of what needs to be accomplished]

## Requirements
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

## Technical Details
- Branch to work from: `feature/main-task-description`
- Create your branch with format: `level1/[component-name]`
- Key files/directories: [relevant paths]

## Deliverables
1. [Deliverable 1]
2. [Deliverable 2]
3. [Deliverable 3]

## Timeline
- Start: [Start date]
- Completion: [Expected completion date]
- Status updates: [Frequency of updates]

## Additional Notes
[Any other relevant information]
```

### Level 2 Task Template

```
# Sub-Task Assignment: [Subcomponent Name]

## Context
[Component context and how this subcomponent fits in]

## Objective
[Clear statement of what needs to be accomplished]

## Requirements
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

## Technical Details
- Branch to work from: `level1/[component-name]`
- Create your branch with format: `level2/[subcomponent-name]`
- Key files/directories: [relevant paths]

## Deliverables
1. [Deliverable 1]
2. [Deliverable 2]
3. [Deliverable 3]

## Timeline
- Start: [Start date]
- Completion: [Expected completion date]
- Status updates: [Frequency of updates]

## Additional Notes
[Any other relevant information]
```

## Common Scenarios Quick Guide

### Handling Merge Conflicts

1. Identify conflicting files: `git status`
2. Open and edit conflicting files (look for `<<<<<<<`, `=======`, `>>>>>>>`)
3. Add resolved files: `git add [file-names]`
4. Complete the merge: `git commit -m "Merge and resolve conflicts"`
5. Push changes: `git push origin [branch-name]`
6. Notify parent agent about the resolution

### Scope Changes

1. Acknowledge the change request
2. Assess impact on your components
3. Update your implementation plan
4. Communicate timeline changes to parent agent
5. Adjust your branch as needed
6. Continue with implementation

### Integration Issues

1. Identify the source of the integration issue
2. Communicate with relevant agents
3. Agree on a resolution approach
4. Implement fixes in your branch
5. Test the integration
6. Push changes and notify parent agent

## Workflow Checklist

### Top-Level Agent Checklist

- [ ] Analyze the overall task
- [ ] Create main feature branch
- [ ] Break down task into components
- [ ] Create sub-issues for each component
- [ ] Assign sub-issues to Level 1 Agents
- [ ] Monitor progress of all components
- [ ] Merge Level 1 branches as they complete
- [ ] Resolve integration issues
- [ ] Create final PR
- [ ] Report completion to requester

### Level 1 Agent Checklist

- [ ] Review assigned component
- [ ] Create branch from main feature branch
- [ ] Break down component into subcomponents
- [ ] Create sub-issues for subcomponents
- [ ] Assign sub-issues to Level 2 Agents
- [ ] Implement directly assigned work
- [ ] Monitor progress of Level 2 Agents
- [ ] Merge Level 2 branches as they complete
- [ ] Resolve integration issues
- [ ] Report completion to Top-Level Agent

### Level 2 Agent Checklist

- [ ] Review assigned subcomponent
- [ ] Create branch from parent branch
- [ ] Implement assigned work
- [ ] Provide regular status updates
- [ ] Push changes to your branch
- [ ] Report completion to Level 1 Agent

## Key Principles to Remember

1. **Clear Communication**: Keep all relevant agents informed
2. **Consistent Branch Structure**: Follow the established branch hierarchy
3. **Regular Updates**: Provide status updates at agreed intervals
4. **Upward Integration**: Changes flow upward through the hierarchy
5. **Single PR**: Only the Top-Level Agent creates the final PR
6. **Documentation**: Document your work for other agents
7. **Synthesis**: Summarize information before reporting upward

This quick reference provides the essential information needed to participate effectively in the agent collaboration workflow. For more detailed guidance, refer to the full [Agent Collaboration Workflow](./agent_collaboration_workflow.md) and [Implementation Guide](./agent_collaboration_implementation_guide.md).

