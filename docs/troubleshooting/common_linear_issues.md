# Common Linear Workflow Issues and Solutions

## Table of Contents

1. [Introduction](#introduction)
2. [API and Authentication Issues](#api-and-authentication-issues)
3. [Task Delegation Issues](#task-delegation-issues)
4. [Branch Management Issues](#branch-management-issues)
5. [Communication Issues](#communication-issues)
6. [Issue State Management Issues](#issue-state-management-issues)
7. [Sub-Issue Relationship Issues](#sub-issue-relationship-issues)
8. [Linear Tool Usage Issues](#linear-tool-usage-issues)
9. [PR Integration Issues](#pr-integration-issues)
10. [Cycle Management Issues](#cycle-management-issues)
11. [Summary and Best Practices](#summary-and-best-practices)

## Introduction

This document provides a comprehensive guide to common issues encountered when working with Linear workflows in the Codegen ecosystem. Each section covers a specific category of issues, including detailed descriptions, symptoms, resolution steps, and preventive measures.

The troubleshooting information in this guide is based on analysis of error patterns in Linear issue comments, recurring challenges faced by agents, and successful resolution strategies. It is intended to serve as a practical reference for agents working with Linear to quickly identify and resolve common issues.

## API and Authentication Issues

### 1. Linear API Key Expiration or Invalid Permissions

**Description:**  
The Linear API key used by an agent has expired or does not have the necessary permissions to perform the requested operations.

**Symptoms:**

- Error messages containing "Unauthorized" or "Access denied"

- Failed API calls with 401 or 403 status codes

- Tools like `linear_create_issue` or `linear_update_issue` failing unexpectedly

**Resolution Steps:**
1. Verify the API key's validity:
   ```bash
   curl -H "Authorization: <LINEAR_API_KEY>" https://api.linear.app/graphql
   ```
2. Check if the API key has the necessary permissions:
   ```bash
   # Example GraphQL query to test permissions
   curl -X POST -H "Authorization: <LINEAR_API_KEY>" -H "Content-Type: application/json" \
     -d '{"query": "{ viewer { id name } }"}' \
     https://api.linear.app/graphql
   ```
3. If the key is invalid or has insufficient permissions, generate a new API key with appropriate scopes in the Linear settings.
4. Update the environment variable:
   ```bash
   export LINEAR_API_KEY=<new_key>
   ```

**Prevention:**

- Regularly rotate API keys according to security best practices

- Use scoped API keys with only the necessary permissions

- Implement monitoring for API key expiration

- Document the required permissions for different agent operations

### 2. Rate Limiting Issues

**Description:**  
The Linear API enforces rate limits to prevent abuse. Agents making too many requests in a short period may encounter rate limiting.

**Symptoms:**

- Error messages containing "Rate limit exceeded"

- Failed API calls with 429 status codes

- Increasing delays or timeouts in API responses

**Resolution Steps:**
1. Implement exponential backoff for retries:
   ```python
   import time
   import random

   def api_call_with_backoff(func, max_retries=5):
       retries = 0
       while retries < max_retries:
           try:
               return func()
           except RateLimitError:
               wait_time = (2 ** retries) + random.uniform(0, 1)
               time.sleep(wait_time)
               retries += 1
       raise Exception("Max retries exceeded")
   ```
2. Batch related API calls where possible to reduce the number of requests.
3. Implement request queuing to control the rate of API calls.

**Prevention:**

- Implement rate limiting awareness in agent code

- Cache frequently accessed data to reduce API calls

- Use bulk operations where available instead of multiple single operations

- Schedule non-urgent operations during periods of lower activity

## Task Delegation Issues

### 3. Unclear Task Boundaries in Sub-Issues

**Description:**  
Sub-issues created for task delegation lack clear boundaries, leading to confusion about responsibilities, duplicate work, or gaps in coverage.

**Symptoms:**

- Multiple agents working on overlapping aspects of a task

- Important components of a task not being addressed

- Confusion in comments about who is responsible for what

- Inconsistent approaches to related sub-tasks

**Resolution Steps:**
1. Review all sub-issues and identify areas of overlap or gaps.
2. Update sub-issue descriptions to clarify boundaries:
   ```markdown
   ## Task Boundaries
   
   This sub-issue is responsible for:

   - Component X implementation

   - Tests for Component X
   
   This sub-issue is NOT responsible for:

   - Component Y implementation (covered in #123)

   - Integration with Component Z (covered in #456)
   ```
3. Add explicit cross-references between related sub-issues.
4. Hold a synchronization meeting or thread with all involved agents to clarify responsibilities.

**Prevention:**

- Use a standardized template for sub-issues that includes a "Task Boundaries" section

- Create a visual diagram showing the relationship between sub-issues

- Implement a formal task decomposition process before creating sub-issues

- Review sub-issue definitions with all involved agents before starting work

### 4. Missing Context in Delegated Tasks

**Description:**  
Sub-issues lack sufficient context about the parent task, project goals, or relevant background information, making it difficult for agents to understand the purpose and requirements of their tasks.

**Symptoms:**

- Frequent clarification questions from sub-agents

- Implementations that don't align with the overall project goals

- Misinterpretation of requirements

- Delays due to back-and-forth communication

**Resolution Steps:**
1. Update sub-issue descriptions to include comprehensive context:
   ```markdown
   ## Context
   
   This task is part of the larger [Project Name] initiative, which aims to [project goal].
   
   The parent task (#123) involves [brief description of parent task].
   
   Your work will be integrated with [related components] and will be used by [stakeholders].
   
   Relevant background information:

   - [Link to documentation]

   - [Link to related issues]

   - [Key decisions or constraints]
   ```
2. Attach links to relevant documentation, design documents, or discussions.
3. Provide examples or references to similar work if available.

**Prevention:**

- Use a standardized template for sub-issues that includes a "Context" section

- Create and maintain centralized project documentation

- Include links to parent issues and related resources in all sub-issues

- Provide access to project planning documents and discussions

## Branch Management Issues

### 5. Branch Naming Conflicts

**Description:**  
Multiple agents create branches with the same or similar names, leading to confusion, merge conflicts, or overwritten work.

**Symptoms:**

- Git errors when pushing to branches

- Unexpected code changes appearing in branches

- Confusion about which branch contains which work

- Merge conflicts when integrating work

**Resolution Steps:**
1. Identify all conflicting branches:
   ```bash
   git branch -a | grep <branch-name-pattern>
   ```
2. Determine which branch is the correct one to use.
3. Rename conflicting branches to follow a consistent pattern:
   ```bash
   git branch -m <old-name> <new-name>
   git push origin <new-name>
   git push origin --delete <old-name>
   ```
4. Update references in issues and PRs to point to the correct branches.

**Prevention:**

- Implement a standardized branch naming convention:
   ```
   codegen-bot/<issue-id>-<brief-description>-<unique-identifier>
   ```

- Document the branch naming convention in project guidelines

- Include the expected branch name in sub-issue descriptions

- Use unique identifiers (like timestamps or agent IDs) in branch names

### 6. Branch Base Confusion

**Description:**  
Agents create branches from the wrong base branch, leading to missing context, outdated code, or merge conflicts.

**Symptoms:**

- Missing dependencies or context in the branch

- Unexpected merge conflicts

- Code that worked in the branch fails after merging

- Difficulty integrating with other branches

**Resolution Steps:**
1. Identify the correct base branch.
2. Create a new branch from the correct base:
   ```bash
   git checkout <correct-base-branch>
   git pull origin <correct-base-branch>
   git checkout -b <new-branch-name>
   ```
3. Cherry-pick or manually apply changes from the incorrect branch:
   ```bash
   git cherry-pick <commit-hash>
   # or for multiple commits
   git cherry-pick <start-commit>..<end-commit>
   ```
4. Update the issue with the correct branch information.

**Prevention:**

- Explicitly specify the base branch in all sub-issue descriptions

- Include git commands for creating the correct branch in the issue template

- Implement branch protection rules to prevent direct pushes to important branches

- Create a visual diagram of the branch structure for complex projects

## Communication Issues

### 7. Inconsistent Update Formats

**Description:**  
Agents provide progress updates in inconsistent formats, making it difficult to track progress, understand status, or synthesize information across multiple sub-tasks.

**Symptoms:**

- Varying levels of detail in update comments

- Different structures for similar types of updates

- Difficulty comparing progress across sub-tasks

- Extra work required to normalize information for reporting

**Resolution Steps:**
1. Establish a standardized update format:
   ```markdown
   ## Progress Update
   
   **Completed:**

   - [x] Task 1

   - [x] Task 2
   
   **In Progress:**

   - [ ] Task 3 (estimated completion: DATE)
   
   **Blockers:**

   - Need clarification on X (cc: @person)
   
   **Next Steps:**

   - Complete Task 3

   - Start Task 4
   ```
2. Share the template with all agents involved in the project.
3. Request updates to follow the standardized format.
4. Consolidate existing updates into the new format if necessary.

**Prevention:**

- Include the update template in project documentation

- Provide examples of well-formatted updates

- Review and provide feedback on update formats

- Create a bot or script to validate update formats

### 8. Missed Notifications or Mentions

**Description:**  
Important communications are missed because of improper tagging, notification settings, or communication channel issues.

**Symptoms:**

- Delayed responses to questions or requests

- Agents unaware of important updates or decisions

- Work proceeding based on outdated information

- Duplicate communications across different channels

**Resolution Steps:**
1. Identify the proper notification mechanism for each agent:
   ```markdown
   ## Communication Channels

   
   - Agent 1: @mention in Linear comments

   - Agent 2: Direct message via `send_agent_message`

   - Agent 3: Email notifications
   ```
2. Resend important communications using the appropriate channels.
3. Confirm receipt of critical information.
4. Update communication preferences in agent configurations.

**Prevention:**

- Document communication preferences for all agents

- Use explicit @mentions for important communications

- Implement confirmation mechanisms for critical information

- Use multiple channels for urgent communications

## Issue State Management Issues

### 9. Incorrect Issue State Transitions

**Description:**  
Issues are moved to incorrect states, skipping required steps in the workflow or failing to trigger necessary automations.

**Symptoms:**

- Issues appearing in unexpected views or reports

- Automation triggers not firing as expected

- Confusion about the actual status of work

- Inconsistent state progression across related issues

**Resolution Steps:**
1. Identify the correct state for the issue based on its actual status.
2. Update the issue state using the `linear_update_issue` tool:
   ```python
   # Example code
   linear_update_issue(
       issue_id="issue_id",
       state_id="correct_state_id"
   )
   ```
3. Document the state change and reason in a comment.
4. Verify that any expected automations are triggered.

**Prevention:**

- Document the expected state flow for different types of issues

- Implement validation checks before state transitions

- Provide clear guidelines on when to move issues between states

- Create visual workflow diagrams showing valid state transitions

### 10. Orphaned Issues in Intermediate States

**Description:**  
Issues get stuck in intermediate states (like "In Progress" or "In Review") and are not moved to their final states, leading to inaccurate project status reporting.

**Symptoms:**

- Issues remaining in "In Progress" despite completed work

- PRs merged but issues not marked as "Done"

- Inconsistency between actual work status and issue state

- Inaccurate metrics or reports based on issue states

**Resolution Steps:**
1. Regularly audit issues in intermediate states:
   ```bash
   # Example query to find stale issues
   linear_search_issues(
       state_id="in_progress_state_id",
       # Add additional filters as needed
   )
   ```
2. For each issue, verify the actual status of the work.
3. Update issues to the appropriate state based on the actual work status.
4. Add automation to detect and flag potentially orphaned issues.

**Prevention:**

- Implement "Definition of Done" checklists that include updating issue states

- Create automations to suggest state updates based on activity

- Regularly review and update issue states as part of project management

- Include state management in agent handoff procedures

## Sub-Issue Relationship Issues

### 11. Broken Parent-Child Relationships

**Description:**  
Sub-issues lose their connection to parent issues, or parent issues are completed without addressing all sub-issues, leading to incomplete work or tracking problems.

**Symptoms:**

- Sub-issues appearing as top-level issues

- Parent issues showing as complete while sub-issues are still open

- Difficulty tracking overall progress of complex tasks

- Inconsistent reporting of project status

**Resolution Steps:**
1. Identify orphaned sub-issues:
   ```python
   # Example query to find issues that should be sub-issues
   issues = linear_search_issues(
       title="Sub-task: ",  # Or other indicator of sub-issues
       # Add additional filters as needed
   )
   ```
2. Restore parent-child relationships:
   ```python
   # Example code to update parent-child relationship
   linear_update_issue(
       issue_id="sub_issue_id",
       parent_id="parent_issue_id"
   )
   ```
3. Verify that all sub-issues are properly linked to their parent issues.
4. Update parent issue status based on sub-issue completion.

**Prevention:**

- Use consistent naming conventions for sub-issues

- Include parent issue references in sub-issue titles or descriptions

- Implement validation checks for parent-child relationships

- Create dashboards or views that highlight potential relationship issues

### 12. Dependency Management Between Sub-Issues

**Description:**  
Dependencies between sub-issues are not properly documented or managed, leading to work being done out of sequence, blocking situations, or integration problems.

**Symptoms:**

- Work starting on issues that depend on uncompleted prerequisites

- Blocking situations where multiple issues are waiting on each other

- Integration problems when combining work from different sub-issues

- Inefficient resource allocation due to unclear dependencies

**Resolution Steps:**
1. Map out all dependencies between sub-issues:
   ```markdown
   ## Dependencies
   
   This issue depends on:

   - #123 (Status: In Progress, Expected completion: DATE)

   - #456 (Status: Done)
   
   Issues that depend on this one:

   - #789 (Status: Blocked)

   - #101 (Status: Not Started)
   ```
2. Update issue descriptions to document dependencies.
3. Resequence work based on the dependency map.
4. Implement workarounds for circular dependencies if necessary.

**Prevention:**

- Document dependencies in issue templates

- Create visual dependency graphs for complex projects

- Use blocking relationships in Linear where available

- Regularly review and update dependency information

## Linear Tool Usage Issues

### 13. Incorrect Tool Parameter Usage

**Description:**  
Agents use Linear tools with incorrect parameters, leading to failed operations, unexpected results, or error messages.

**Symptoms:**

- Error messages from Linear tools

- Operations that appear to succeed but produce incorrect results

- Inconsistent behavior of similar operations

- Failed API calls with error responses

**Resolution Steps:**
1. Review the tool documentation to understand the correct parameters.
2. Test the tool with minimal parameters to verify basic functionality:
   ```python
   # Example of testing basic functionality
   result = linear_get_issue(issue_id="known_valid_id")
   print(result)
   ```
3. Gradually add parameters to identify which one is causing the issue.
4. Update the tool usage with the correct parameters.

**Prevention:**

- Create reference documentation for common tool operations

- Provide examples of correct tool usage for different scenarios

- Implement parameter validation before making API calls

- Create wrapper functions with clear parameter requirements

### 14. Missing Required Fields in Issue Creation

**Description:**  
Issues are created without required fields, leading to incomplete information, workflow disruptions, or validation errors.

**Symptoms:**

- Error messages when creating issues

- Issues missing critical information

- Workflow automations not triggering as expected

- Manual intervention required to complete issue setup

**Resolution Steps:**
1. Identify the required fields for issue creation:
   ```python
   # Example code to get issue templates or required fields
   # This would depend on your specific Linear setup
   ```
2. Update existing issues to include the required fields:
   ```python
   # Example code to update an issue with missing fields
   linear_update_issue(
       issue_id="issue_id",
       title="Updated Title",
       description="Updated description with required information",
       # Add other required fields
   )
   ```
3. Create templates or validation checks for future issue creation.

**Prevention:**

- Use issue templates with all required fields

- Implement validation checks before issue creation

- Provide clear documentation on required fields for different issue types

- Create helper functions that ensure all required fields are included

## PR Integration Issues

### 15. Missing PR Links in Linear Issues

**Description:**  
Pull requests are not properly linked to their corresponding Linear issues, making it difficult to track the relationship between code changes and tasks.

**Symptoms:**

- Linear issues without links to related PRs

- Difficulty finding the code changes associated with a task

- Manual effort required to connect issues and PRs

- Incomplete audit trail for code changes

**Resolution Steps:**
1. Identify PRs that should be linked to issues:
   ```bash
   # Example command to find PRs with Linear issue references in the title or description
   git log --grep="LINEAR-[0-9]+" --pretty=format:"%h %s"
   ```
2. Add links to the appropriate issues:
   ```python
   # Example code to attach a PR link to an issue
   linear_attach_link(
       issue_id="issue_id",
       url="https://github.com/org/repo/pull/123",
       title="PR #123: Implement feature X"
   )
   ```
3. Update PR descriptions to include Linear issue references.

**Prevention:**

- Include PR linking in the "Definition of Done" checklist

- Automate PR linking using GitHub Actions or similar tools

- Use consistent formats for referencing Linear issues in PR titles or descriptions

- Implement validation checks for PR creation to ensure Linear references

### 16. Branch Cleanup After PR Merges

**Description:**  
Branches are not properly cleaned up after PRs are merged, leading to cluttered repositories, confusion about active work, or accidental use of outdated branches.

**Symptoms:**

- Large number of stale branches in the repository

- Confusion about which branches are still active

- Accidental work on outdated branches

- Difficulty finding relevant branches for current work

**Resolution Steps:**
1. Identify merged branches that can be deleted:
   ```bash
   # List branches that have been merged into main
   git branch --merged main
   ```
2. Delete local branches:
   ```bash
   git branch -d <branch-name>
   ```
3. Delete remote branches:
   ```bash
   git push origin --delete <branch-name>
   ```
4. Update any references to deleted branches in documentation or issues.

**Prevention:**

- Implement automated branch cleanup after PR merges

- Include branch cleanup in PR merge procedures

- Use branch naming conventions that include dates or issue IDs for easier identification

- Regularly audit and clean up branches as part of repository maintenance

## Cycle Management Issues

### 17. Issues Not Assigned to Appropriate Cycles

**Description:**  
Issues are not assigned to the appropriate Linear cycles, leading to inaccurate sprint planning, reporting discrepancies, or work prioritization issues.

**Symptoms:**

- Issues missing from cycle views or reports

- Inaccurate cycle completion metrics

- Difficulty tracking progress against sprint goals

- Inconsistent prioritization of work

**Resolution Steps:**
1. Identify issues that should be in the current cycle:
   ```python
   # Example code to find active issues not in any cycle
   issues = linear_search_issues(
       state_id="active_state_id",
       # Additional filters to exclude issues in cycles
   )
   ```
2. Assign issues to the appropriate cycle:
   ```python
   # Example code to assign an issue to a cycle
   linear_assign_issue_to_cycle(
       issue_id="issue_id",
       cycle_id="cycle_id"
   )
   ```
3. Verify cycle assignments and update cycle planning documents.

**Prevention:**

- Include cycle assignment in issue creation templates

- Implement regular cycle planning reviews

- Create automations to suggest cycle assignments based on issue properties

- Provide clear guidelines on cycle assignment criteria

### 18. Cycle Transition Issues

**Description:**  
Issues with the transition between cycles, such as incomplete work not being properly carried over or new cycles not being set up correctly.

**Symptoms:**

- Work from previous cycles disappearing from active views

- Incomplete tasks not being carried forward

- Confusion about which cycle is currently active

- Inconsistent reporting across cycle boundaries

**Resolution Steps:**
1. Identify issues from the previous cycle that need to be carried forward:
   ```python
   # Example code to find incomplete issues from the previous cycle
   previous_cycle_issues = linear_get_cycle_issues(cycle_id="previous_cycle_id")
   incomplete_issues = [i for i in previous_cycle_issues if i["state"]["type"] != "completed"]
   ```
2. Move incomplete issues to the new cycle:
   ```python
   # Example code to move issues to the new cycle
   for issue in incomplete_issues:
       linear_assign_issue_to_cycle(
           issue_id=issue["id"],
           cycle_id="new_cycle_id"
       )
   ```
3. Update cycle documentation and planning artifacts.

**Prevention:**

- Implement formal cycle transition procedures

- Create automation for carrying over incomplete work

- Provide clear guidelines on cycle transitions

- Include cycle transition tasks in project management workflows

## Summary and Best Practices

### Key Findings

Based on the common issues identified in this document, several key patterns emerge:

1. **Clear Communication is Critical**: Many issues stem from unclear or inconsistent communication, highlighting the need for standardized formats and explicit expectations.

2. **Structured Processes Prevent Problems**: Issues with branch management, state transitions, and cycle assignments can be mitigated through well-defined, documented processes.

3. **Automation Reduces Manual Errors**: Many recurring issues can be prevented through automation of routine tasks, validation checks, and monitoring.

4. **Documentation Improves Consistency**: Comprehensive documentation of workflows, expectations, and best practices helps maintain consistency across agents and tasks.

### Preventive Best Practices

To minimize the occurrence of the issues documented in this guide, consider implementing these best practices:

1. **Standardized Templates**:

   - Use templates for issue creation, updates, and reporting

   - Include checklists for common procedures

   - Provide examples of well-formatted communications

2. **Clear Workflow Documentation**:

   - Document expected state transitions

   - Create visual diagrams of workflows

   - Provide step-by-step guides for common procedures

3. **Automated Validation**:

   - Implement validation checks for critical operations

   - Create monitoring for potential issues

   - Use bots or scripts to enforce consistency

4. **Regular Audits**:

   - Periodically review issue states and relationships

   - Clean up stale branches and outdated references

   - Verify cycle assignments and dependencies

5. **Comprehensive Onboarding**:

   - Provide thorough training on Linear workflows

   - Create reference materials for common tasks

   - Establish mentoring for new agents

By implementing these preventive measures and referring to this troubleshooting guide when issues arise, agents can maintain efficient, effective Linear workflows with minimal disruption.

## References


- [Linear API Documentation](https://developers.linear.app/docs/)

- [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md)

- [Communication and Delegation SOPs](../reference/communication_delegation_sops.md)

- [Linear Workflow Decision Diagram](../reference/linear_workflow_diagram.md)



## Related Resources

- [Troubleshooting Linear API Issues](linear_api_issues.md)
- [Troubleshooting Linear Delegation Issues](linear_delegation_issues.md)
- [Troubleshooting Linear Branch Management Issues](linear_branch_management_issues.md)
- [Troubleshooting Linear Communication Issues](linear_communication_issues.md)
- [Troubleshooting Linear Integration Issues](linear_integration_issues.md)
- [Research Summary: Frequently Encountered Issues and Solutions in Linear Workflows](research_summary.md)
