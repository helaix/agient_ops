# Troubleshooting Linear Delegation Issues

## Overview

This guide addresses common issues encountered when delegating tasks through Linear in agent workflows. Delegation issues typically occur when creating sub-issues, assigning tasks to sub-agents, or coordinating work between multiple agents.

## Common Issues and Solutions

### 1. Sub-Issue Creation Failures

**Symptoms:**

- Error messages when attempting to create sub-issues

- Sub-issues created without proper parent-child relationships

- Missing information in created sub-issues

**Resolution Steps:**
1. Verify that you're using the correct parent issue ID:
   ```javascript
   // Check that the parent issue exists and you have the correct ID
   const parentIssue = await linear.issue(parentIssueId);
   console.log(`Parent issue: ${parentIssue.title} (${parentIssue.id})`);
   
   // Then create the sub-issue with the verified parent ID
   const subIssue = await linear.issueCreate({
     title: "Sub-task title",
     description: "Detailed description",
     teamId: teamId,
     parentId: parentIssue.id  // Use the verified parent ID
   });
   ```

2. Ensure you have permission to create sub-issues:
   ```javascript
   // Check your permissions on the parent issue
   const viewer = await linear.viewer;
   const canCreateSubIssue = await parentIssue.canCreateSubIssue(viewer);
   
   if (!canCreateSubIssue) {
     console.error("You don't have permission to create sub-issues for this parent issue");
   }
   ```

3. Use the Linear API directly if the SDK is causing issues:
   ```javascript
   const mutation = `
     mutation CreateSubIssue($input: IssueCreateInput!) {
       issueCreate(input: $input) {
         success
         issue {
           id
           title
         }
       }
     }
   `;
   
   const variables = {
     input: {
       title: "Sub-task title",
       description: "Detailed description",
       teamId: "TEAM_ID",
       parentId: "PARENT_ISSUE_ID"
     }
   };
   
   const response = await fetch("https://api.linear.app/graphql", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "Authorization": process.env.LINEAR_API_KEY
     },
     body: JSON.stringify({
       query: mutation,
       variables
     })
   });
   ```

**Preventive Measures:**

- Validate parent issue IDs before creating sub-issues

- Implement error handling specifically for sub-issue creation

- Document the team and permission requirements for sub-issue creation

- Create helper functions for common sub-issue creation patterns

### 2. sub-agent Assignment Issues

**Symptoms:**

- sub-agents not being triggered when assigned to sub-issues

- Incorrect agents being assigned to tasks

- Assignment notifications not being sent

**Resolution Steps:**
1. Verify the correct assignment process:
   ```javascript
   // First, create the sub-issue
   const subIssue = await linear.issueCreate({
     title: "Task for sub-agent",
     description: "Detailed description with clear instructions",
     teamId: teamId,
     parentId: parentIssueId
   });
   
   // Then, assign it to yourself to trigger the sub-agent
   await linear.issueUpdate(subIssue.id, {
     assigneeId: yourUserId  // This should be your user ID, not the sub-agent's
   });
   ```

2. Check that the issue state is appropriate for assignment:
   ```javascript
   // Ensure the issue is in a state that allows assignment
   const issue = await linear.issue(issueId);
   const availableStates = await issue.team.states;
   
   // Find an appropriate "to do" or "backlog" state
   const todoState = availableStates.nodes.find(state => 
     state.type === "unstarted" || state.type === "backlog"
   );
   
   // Update the issue state if needed
   if (issue.state.type !== "unstarted" && issue.state.type !== "backlog") {
     await linear.issueUpdate(issueId, {
       stateId: todoState.id
     });
   }
   
   // Now assign the issue
   await linear.issueUpdate(issueId, {
     assigneeId: yourUserId
   });
   ```

3. Ensure the issue has sufficient context for the sub-agent:
   ```javascript
   // Update the issue with comprehensive context
   await linear.issueUpdate(issueId, {
     description: `
       ## Context
       This task is part of the larger project to implement feature X.
       
       ## Requirements

       - Implement functionality A

       - Ensure tests cover edge cases

       - Follow the coding standards in our documentation
       
       ## Resources

       - Related documentation: [link]

       - Parent issue: ${parentIssueUrl}

       - Branch to work from: \`feature/parent-branch\`
       
       ## Deliverables

       - Implementation of functionality A

       - Unit tests

       - Documentation updates
     `
   });
   ```

**Preventive Measures:**

- Create templates for sub-issue descriptions with all necessary context

- Document the correct assignment process for triggering sub-agents

- Implement validation to ensure issues have sufficient information before assignment

- Use consistent state management for issues in the delegation workflow

### 3. Coordination and Dependency Management

**Symptoms:**

- sub-agents working on tasks in the wrong order

- Blocked tasks due to unresolved dependencies

- Duplicate or conflicting work across sub-issues

**Resolution Steps:**
1. Clearly document dependencies in issue descriptions:
   ```markdown
   ## Dependencies

   - This task depends on the completion of [ISSUE-123](https://linear.app/org/issue/ISSUE-123)

   - This task must be completed before [ISSUE-456](https://linear.app/org/issue/ISSUE-456)
   ```

2. Use Linear relationships to formalize dependencies:
   ```javascript
   // Create a "blocks" relationship
   await linear.issueRelationCreate({
     issueId: "BLOCKER_ISSUE_ID",
     relatedIssueId: "BLOCKED_ISSUE_ID",
     type: "blocks"
   });
   ```

3. Implement a dependency check before starting work:
   ```javascript
   async function canStartWork(issueId) {
     const issue = await linear.issue(issueId);
     
     // Get all relationships where this issue is blocked by others
     const blockedByRelations = await issue.relations({
       filter: {
         type: { eq: "blocks" },
         relatedIssueId: { eq: issue.id }
       }
     });
     
     // Check if any blocking issues are not completed
     const blockingIssues = blockedByRelations.nodes.map(rel => rel.issue);
     const incompleteBlockers = blockingIssues.filter(issue => 
       issue.state.type !== "completed" && issue.state.type !== "canceled"
     );
     
     if (incompleteBlockers.length > 0) {
       console.log("Cannot start work due to incomplete blockers:", 
         incompleteBlockers.map(i => `${i.identifier}: ${i.title}`).join(", ")
       );
       return false;
     }
     
     return true;
   }
   ```

**Preventive Measures:**

- Create a visual dependency map for complex task hierarchies

- Implement automated dependency checking in your workflow

- Use consistent terminology for describing dependencies

- Schedule tasks in a logical sequence based on dependencies

### 4. Incomplete Context in Sub-Issues

**Symptoms:**

- sub-agents requesting additional information

- Sub-tasks completed incorrectly due to misunderstandings

- Inconsistent implementation across related sub-tasks

**Resolution Steps:**
1. Use a comprehensive template for sub-issue creation:
   ```javascript
   const subIssueTemplate = `
   ## Context
   ${parentIssueContext}
   
   ## Specific Task
   ${specificTaskDescription}
   
   ## Requirements
   ${requirements}
   
   ## Acceptance Criteria
   ${acceptanceCriteria}
   
   ## Resources

   - Parent Issue: ${parentIssueUrl}

   - Documentation: ${relevantDocumentation}

   - Branch: \`${branchName}\`
   
   ## Communication

   - Report blockers immediately

   - Provide progress updates daily

   - Notify when complete
   `;
   
   await linear.issueCreate({
     title: subIssueTitle,
     description: subIssueTemplate,
     teamId: teamId,
     parentId: parentIssueId
   });
   ```

2. Attach relevant links and resources:
   ```javascript
   // After creating the sub-issue, attach relevant links
   await linear.attachmentCreate({
     issueId: subIssueId,
     title: "API Documentation",
     url: "https://example.com/api-docs"
   });
   
   await linear.attachmentCreate({
     issueId: subIssueId,
     title: "Design Mockups",
     url: "https://figma.com/file/design-mockups"
   });
   ```

3. Add comments with additional context:
   ```javascript
   await linear.commentCreate({
     issueId: subIssueId,
     body: `
       Additional context for this task:
       
       1. We've attempted a similar implementation before at [Previous PR](https://github.com/org/repo/pull/123)
       2. There's a known edge case with handling of special characters
       3. The performance requirements are: response time < 200ms
     `
   });
   ```

**Preventive Measures:**

- Create and use standardized templates for different types of sub-issues

- Implement a checklist for context verification before assigning tasks

- Document common context requirements for different task types

- Review sub-issues for completeness before assignment

### 5. Inconsistent Branch Management

**Symptoms:**

- Confusion about which branches to use for sub-tasks

- Merge conflicts when integrating work from multiple sub-issues

- Lost work due to incorrect branch usage

**Resolution Steps:**
1. Document the branch strategy clearly in the parent issue:
   ```markdown
   ## Branch Strategy

   - Parent branch: `feature/parent-feature`

   - Naming convention for sub-task branches: `feature/parent-feature-subtask-{issue-number}`

   - All sub-task branches should be created from the parent branch

   - Sub-task branches will be merged back into the parent branch
   ```

2. Provide specific git commands in sub-issue descriptions:
   ```markdown
   ## Branch Setup
   ```bash
   git checkout main
   git pull
   git checkout -b feature/parent-feature-subtask-123
   ```
   ```

3. Implement a branch verification step:
   ```javascript
   async function verifyBranchSetup(issueId) {
     const issue = await linear.issue(issueId);
     const parentIssue = issue.parent;
     
     // Extract branch information from descriptions
     const parentBranchMatch = parentIssue.description.match(/Parent branch: `([^`]+)`/);
     const parentBranch = parentBranchMatch ? parentBranchMatch[1] : null;
     
     const expectedBranch = `${parentBranch}-subtask-${issue.number}`;
     
     console.log(`
       Issue: ${issue.identifier}
       Expected branch: ${expectedBranch}
       Parent branch: ${parentBranch}
       
       Setup commands:
       git checkout ${parentBranch}
       git pull
       git checkout -b ${expectedBranch}
     `);
     
     return {
       parentBranch,
       expectedBranch
     };
   }
   ```

**Preventive Measures:**

- Document branch naming conventions in a central location

- Include specific git commands in sub-issue templates

- Implement branch name validation in your workflow

- Create helper scripts for branch management

### 6. Ineffective Progress Tracking

**Symptoms:**

- Unclear status of delegated tasks

- Difficulty identifying blocked or delayed sub-tasks

- Challenges in reporting overall progress to stakeholders

**Resolution Steps:**
1. Implement a standardized progress reporting format:
   ```javascript
   async function reportProgress(issueId, percentComplete, statusUpdate) {
     await linear.commentCreate({
       issueId,
       body: `
         ## Progress Update
         
         **Completion**: ${percentComplete}%
         
         **Status**: ${statusUpdate}
         
         **Next Steps**:

         - ${nextSteps.join('\n- ')}
         
         **Blockers**:
         ${blockers.length > 0 ? blockers.join('\n- ') : 'None currently'}
       `
     });
   }
   ```

2. Use Linear custom fields for progress tracking:
   ```javascript
   // First, create a custom field for progress tracking (one-time setup)
   const progressField = await linear.customFieldCreate({
     name: "Progress",
     description: "Percentage of task completed",
     type: "number",
     teamId
   });
   
   // Update progress on issues
   await linear.issueUpdate(issueId, {
     customFields: {
       [progressField.id]: 75  // 75% complete
     }
   });
   ```

3. Create a dashboard for visualizing progress:
   ```javascript
   async function generateProgressDashboard(parentIssueId) {
     const parentIssue = await linear.issue(parentIssueId);
     const subIssues = await parentIssue.children();
     
     let dashboard = `# Progress Dashboard for ${parentIssue.identifier}: ${parentIssue.title}\n\n`;
     dashboard += `| Issue | Title | Assignee | State | Progress |\n`;
     dashboard += `|-------|-------|----------|-------|----------|\n`;
     
     for (const issue of subIssues.nodes) {
       const progress = issue.customFields[progressFieldId] || 0;
       dashboard += `| ${issue.identifier} | ${issue.title} | ${issue.assignee?.name || 'Unassigned'} | ${issue.state.name} | ${progress}% |\n`;
     }
     
     // Calculate overall progress
     const totalIssues = subIssues.nodes.length;
     const completedIssues = subIssues.nodes.filter(i => i.state.type === "completed").length;
     const overallProgress = Math.round((completedIssues / totalIssues) * 100);
     
     dashboard += `\n## Overall Progress: ${overallProgress}%\n`;
     
     return dashboard;
   }
   ```

**Preventive Measures:**

- Establish regular check-in schedules for progress updates

- Use consistent formats for progress reporting

- Implement automated progress tracking where possible

- Create visualization tools for complex task hierarchies

## References


- [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md)

- [Communication and Delegation SOPs](../reference/communication_delegation_sops.md)

- [Agent Collaboration Workflow](../src/content/docs/reference/agent_collaboration_workflow.md)

- [Linear API Documentation](https://developers.linear.app/docs/)



## Related Resources

- [Common Linear Workflow Issues and Solutions](common_linear_issues.md)
- [Delegation Decision Tree](../decision_trees/delegation_decision_tree.md)
- [Communication and Delegation SOPs for Codegen and Sub-Agents](../reference/communication_delegation_sops.md)
