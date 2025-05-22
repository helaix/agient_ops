# Troubleshooting Linear Communication Issues

## Overview

This guide addresses common issues encountered when communicating through Linear in agent workflows. Communication issues typically manifest as misunderstandings, missed updates, formatting problems, or challenges in conveying complex information effectively.

## Common Issues and Solutions

### 1. Message Formatting Problems

**Symptoms:**

- Text appearing as plain text instead of formatted markdown

- Code blocks not rendering correctly

- Links not being clickable

- Tables or lists displaying incorrectly

**Resolution Steps:**
1. Use proper markdown syntax in Linear comments:
   ```javascript
   await linear.commentCreate({
     issueId: "ISSUE_ID",
     body: `
       # Heading 1
       ## Heading 2
       
       Regular paragraph with **bold** and *italic* text.

       
       - Bullet point 1

       - Bullet point 2

         - Nested bullet point
       
       1. Numbered item 1
       2. Numbered item 2
       
       \`\`\`javascript
       // Code block with syntax highlighting
       function example() {
         return "This is properly formatted code";
       }
       \`\`\`
       
       [Clickable link](https://example.com)
       
       | Column 1 | Column 2 |
       |----------|----------|
       | Cell 1   | Cell 2   |
       | Cell 3   | Cell 4   |
     `
   });
   ```

2. Verify markdown rendering before sending:
   ```javascript
   // Function to preview markdown before sending
   function previewMarkdown(markdown) {
     // Log the markdown to console for inspection
     console.log("Markdown Preview:");
     console.log(markdown);
     
     // Check for common formatting issues
     const issues = [];
     
     // Check for unclosed code blocks
     if ((markdown.match(/```/g) || []).length % 2 !== 0) {
       issues.push("Unclosed code block (```)");
     }
     
     // Check for unclosed bold/italic markers
     if ((markdown.match(/\*\*/g) || []).length % 2 !== 0) {
       issues.push("Unclosed bold marker (**)");
     }
     
     if ((markdown.match(/\*/g) || []).length % 2 !== 0) {
       issues.push("Unclosed italic marker (*)");
     }
     
     // Check for table formatting
     const tableRows = markdown.match(/\|.*\|/g) || [];
     if (tableRows.length > 0) {
       // Check if there's a header separator row
       const hasHeaderSeparator = tableRows.some(row => /\|[-|]+\|/.test(row));
       if (!hasHeaderSeparator && tableRows.length > 1) {
         issues.push("Table missing header separator row (e.g., |---|---|)");
       }
     }
     
     return {
       preview: markdown,
       issues
     };
   }
   ```

3. Fix common formatting issues:
   ```javascript
   // Function to fix common markdown issues
   function fixMarkdownFormatting(markdown) {
     let fixed = markdown;
     
     // Ensure code blocks are properly closed
     const codeBlockCount = (fixed.match(/```/g) || []).length;
     if (codeBlockCount % 2 !== 0) {
       fixed += "\n```";
     }
     
     // Ensure tables have header separators
     const tableRegex = /\|([^|]*\|)+\n\|(?![-|]+\|)/g;
     fixed = fixed.replace(tableRegex, (match) => {
       const columnCount = (match.match(/\|/g) || []).length - 1;
       const separator = "\n|" + "---|".repeat(columnCount);
       return match + separator;
     });
     
     return fixed;
   }
   ```

**Preventive Measures:**

- Create templates for common communication formats

- Use a markdown preview tool before sending messages

- Document Linear's markdown syntax in your team guidelines

- Create helper functions for generating properly formatted messages

### 2. Missed Updates and Notifications

**Symptoms:**

- Team members unaware of important updates

- Agents not responding to mentions or comments

- Critical information being overlooked

- Delayed responses to questions or requests

**Resolution Steps:**
1. Use explicit mentions to ensure visibility:
   ```javascript
   await linear.commentCreate({
     issueId: "ISSUE_ID",
     body: `
       @username Please review this update and provide feedback.
       
       @team-name This affects the entire team and requires attention.
     `
   });
   ```

2. Follow up on important communications:
   ```javascript
   // Function to check if a comment has been read
   async function checkCommentReadStatus(commentId) {
     const comment = await linear.comment(commentId);
     const viewers = await comment.viewers();
     
     return {
       comment: comment.body,
       readBy: viewers.nodes.map(user => user.name),
       notReadBy: [] // You would need to compare with expected readers
     };
   }
   
   // If no response after a certain time, send a follow-up
   async function sendFollowUpIfNeeded(commentId, issueId, timeThresholdHours = 24) {
     const comment = await linear.comment(commentId);
     const createdAt = new Date(comment.createdAt);
     const now = new Date();
     const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
     
     if (hoursSinceCreation > timeThresholdHours) {
       await linear.commentCreate({
         issueId,
         body: `
           **Follow-up:** This is a reminder about my previous comment from ${createdAt.toDateString()}.
           
           > ${comment.body.substring(0, 100)}${comment.body.length > 100 ? '...' : ''}
           
           Please provide your feedback or acknowledge receipt.
         `
       });
     }
   }
   ```

3. Use multiple communication channels for critical updates:
   ```javascript
   // For critical updates, use both Linear and another channel
   async function sendCriticalUpdate(issueId, message, slackChannel) {
     // Post to Linear
     const comment = await linear.commentCreate({
       issueId,
       body: `
         # 🚨 CRITICAL UPDATE 🚨
         
         ${message}
         
         Please acknowledge receipt of this message.
       `
     });
     
     // Also post to Slack (implementation depends on your Slack integration)
     await slackClient.chat.postMessage({
       channel: slackChannel,
       text: `🚨 *CRITICAL UPDATE* 🚨\n\n${message}\n\nPlease see Linear issue: ${linear.issueUrl(issueId)}`
     });
     
     return comment;
   }
   ```

**Preventive Measures:**

- Establish communication protocols for different priority levels

- Use consistent notification patterns (e.g., emoji prefixes for importance)

- Implement acknowledgment requirements for critical updates

- Schedule regular synchronization points for team communication

### 3. Context Loss in Long Threads

**Symptoms:**

- Difficulty following the conversation in long comment threads

- Important information buried in lengthy discussions

- Repeated questions or clarifications

- Confusion about current status or decisions

**Resolution Steps:**
1. Periodically summarize long discussions:
   ```javascript
   await linear.commentCreate({
     issueId: "ISSUE_ID",
     body: `
       ## Discussion Summary (as of ${new Date().toISOString().split('T')[0]})
       
       ### Key Points

       - Point 1 raised by @user1 on [date]

       - Point 2 raised by @user2 on [date]

       - Counterpoint by @user3 on [date]
       
       ### Decisions Made

       - Decision 1: [description] (decided on [date])

       - Decision 2: [description] (decided on [date])
       
       ### Open Questions

       - Question 1: [description]

       - Question 2: [description]
       
       ### Next Steps

       - Action 1: @assignee1 to [action] by [date]

       - Action 2: @assignee2 to [action] by [date]
     `
   });
   ```

2. Use issue descriptions to maintain current status:
   ```javascript
   // Update the issue description with the latest status
   await linear.issueUpdate(issueId, {
     description: `
       ${originalDescription}
       
       ---
       
       ## Current Status (Updated: ${new Date().toISOString().split('T')[0]})
       
       ### Progress

       - Component A: Complete

       - Component B: In progress (80%)

       - Component C: Not started
       
       ### Recent Decisions

       - Decided to use approach X for component B

       - Postponed component D to next sprint
       
       ### Blockers

       - Waiting for API access from team Y

       - Performance issue in component A needs resolution
     `
   });
   ```

3. Create separate issues for divergent discussions:
   ```javascript
   // If a discussion thread diverges significantly
   async function createIssueFromDiscussion(originalIssueId, title, relevantComments) {
     const originalIssue = await linear.issue(originalIssueId);
     
     // Create a new issue
     const newIssue = await linear.issueCreate({
       title: title,
       description: `
         ## Context
         This issue was created from a discussion in ${originalIssue.identifier}: ${originalIssue.title}
         
         ## Relevant Comments
         ${relevantComments.map(c => `
         ### ${c.user.name} on ${new Date(c.createdAt).toISOString().split('T')[0]}
         ${c.body}
         `).join('\n\n')}
       `,
       teamId: originalIssue.teamId,
       labelIds: originalIssue.labelIds
     });
     
     // Link the issues
     await linear.issueRelationCreate({
       issueId: originalIssueId,
       relatedIssueId: newIssue.id,
       type: "relates to"
     });
     
     // Comment on the original issue
     await linear.commentCreate({
       issueId: originalIssueId,
       body: `
         I've created a new issue to continue the discussion about ${title}:
         ${newIssue.identifier}: ${newIssue.title}
         
         Please continue that specific conversation there to keep this thread focused.
       `
     });
     
     return newIssue;
   }
   ```

**Preventive Measures:**

- Establish a regular cadence for discussion summaries

- Use structured formats for updates and discussions

- Create separate issues for distinct topics

- Maintain an updated "current status" section in issue descriptions

### 4. Unclear Action Items and Ownership

**Symptoms:**

- Confusion about who is responsible for specific tasks

- Action items not being completed

- Duplicate work being done

- Important tasks falling through the cracks

**Resolution Steps:**
1. Use a consistent format for action items:
   ```javascript
   await linear.commentCreate({
     issueId: "ISSUE_ID",
     body: `
       ## Action Items

       
       - [ ] @username1: Investigate the performance issue by 2023-06-15

       - [ ] @username2: Update the documentation with new API endpoints by 2023-06-16

       - [ ] @username3: Review and approve the design changes by 2023-06-17
     `
   });
   ```

2. Create sub-issues for significant action items:
   ```javascript
   // For significant action items, create sub-issues
   async function createActionItemSubIssue(parentIssueId, title, assigneeId, dueDate, description) {
     const subIssue = await linear.issueCreate({
       title: title,
       description: description,
       teamId: (await linear.issue(parentIssueId)).teamId,
       parentId: parentIssueId,
       assigneeId: assigneeId,
       dueDate: dueDate
     });
     
     await linear.commentCreate({
       issueId: parentIssueId,
       body: `
         Created action item sub-issue: ${subIssue.identifier} (${subIssue.title})
         Assigned to: @${(await linear.user(assigneeId)).name}
         Due date: ${new Date(dueDate).toISOString().split('T')[0]}
       `
     });
     
     return subIssue;
   }
   ```

3. Track and follow up on action items:
   ```javascript
   // Function to track action items from comments
   async function trackActionItems(issueId) {
     const issue = await linear.issue(issueId);
     const comments = await issue.comments();
     
     const actionItems = [];
     
     // Parse comments for action items (this is a simplified example)
     for (const comment of comments.nodes) {
       const actionItemRegex = /-\s*\[\s*\]\s*@(\w+):(.*?)(?=\n|$)/g;
       let match;
       
       while ((match = actionItemRegex.exec(comment.body)) !== null) {
         const username = match[1];
         const task = match[2].trim();
         
         actionItems.push({
           username,
           task,
           commentId: comment.id,
           createdAt: comment.createdAt
         });
       }
     }
     
     // Generate a follow-up for incomplete action items
     let followUpBody = `## Action Item Follow-up\n\n`;
     
     if (actionItems.length === 0) {
       followUpBody += "No action items found in the comments.";
     } else {
       followUpBody += "The following action items were identified but may not be completed:\n\n";
       
       for (const item of actionItems) {
         followUpBody += `- @${item.username}: ${item.task} (from ${new Date(item.createdAt).toISOString().split('T')[0]})\n`;
       }
       
       followUpBody += "\nPlease update the status of these items by marking them as [x] when complete.";
     }
     
     await linear.commentCreate({
       issueId,
       body: followUpBody
     });
     
     return actionItems;
   }
   ```

**Preventive Measures:**

- Use a consistent format for action items in all communications

- Create sub-issues for significant action items

- Implement regular action item reviews

- Document ownership and responsibilities clearly

### 5. Ineffective Status Updates

**Symptoms:**

- Updates that lack critical information

- Inconsistent reporting formats

- Difficulty understanding the current state of work

- Challenges in identifying blockers or risks

**Resolution Steps:**
1. Implement a standardized status update template:
   ```javascript
   await linear.commentCreate({
     issueId: "ISSUE_ID",
     body: `
       ## Status Update: ${new Date().toISOString().split('T')[0]}
       
       ### Progress

       - Completed: [list of completed items]

       - In Progress: [list of in-progress items with % complete]

       - Not Started: [list of not-started items]
       
       ### Metrics

       - Time spent: XX hours

       - Test coverage: XX%

       - Performance: [key metrics]
       
       ### Blockers

       - [blocker 1]: [impact and mitigation plan]

       - [blocker 2]: [impact and mitigation plan]
       
       ### Risks

       - [risk 1]: [likelihood, impact, and mitigation plan]

       - [risk 2]: [likelihood, impact, and mitigation plan]
       
       ### Next Steps

       - [next step 1] by [date]

       - [next step 2] by [date]
     `
   });
   ```

2. Create visual progress indicators:
   ```javascript
   // Function to generate a visual progress bar
   function generateProgressBar(percentComplete, width = 20) {
     const filledChars = Math.round(percentComplete * width / 100);
     const emptyChars = width - filledChars;
     
     const filled = '█'.repeat(filledChars);
     const empty = '░'.repeat(emptyChars);
     
     return `[${filled}${empty}] ${percentComplete}%`;
   }
   
   // Use in status updates
   await linear.commentCreate({
     issueId: "ISSUE_ID",
     body: `
       ## Component Progress

       
       - Component A: ${generateProgressBar(100)} (Complete)

       - Component B: ${generateProgressBar(75)} (In Progress)

       - Component C: ${generateProgressBar(30)} (In Progress)

       - Component D: ${generateProgressBar(0)} (Not Started)
       
       ## Overall Progress
       
       ${generateProgressBar(60)}
     `
   });
   ```

3. Use custom fields for structured status tracking:
   ```javascript
   // Update custom fields with status information
   await linear.issueUpdate(issueId, {
     customFields: {
       "progress": 65,  // Assuming a "progress" custom field exists
       "status_summary": "On track",
       "risk_level": "Medium",
       "estimated_completion": "2023-06-30"
     }
   });
   ```

**Preventive Measures:**

- Create and use standardized templates for status updates

- Establish a regular cadence for status reporting

- Define clear metrics for measuring progress

- Implement visual indicators for status communication

### 6. Cross-Team Communication Gaps

**Symptoms:**

- Information silos between teams

- Duplicate or conflicting work

- Missed dependencies between teams

- Inconsistent understanding of requirements or priorities

**Resolution Steps:**
1. Create cross-team coordination issues:
   ```javascript
   // Create a coordination issue that links to issues from multiple teams
   async function createCoordinationIssue(title, description, relatedIssueIds, teamId) {
     const coordinationIssue = await linear.issueCreate({
       title: `[Coordination] ${title}`,
       description: `
         ## Cross-Team Coordination
         
         ${description}
         
         ## Related Issues
         ${(await Promise.all(relatedIssueIds.map(async id => {
           const issue = await linear.issue(id);
           return `- ${issue.identifier}: ${issue.title} (${issue.team.name})`;
         }))).join('\n')}
         
         ## Communication Guidelines

         - All teams should provide updates on this issue

         - Tag relevant team members when posting updates

         - Document all cross-team decisions here
       `,
       teamId: teamId,
       labelIds: ["coordination-label-id"]  // Assuming you have a coordination label
     });
     
     // Create relationships with all related issues
     for (const relatedId of relatedIssueIds) {
       await linear.issueRelationCreate({
         issueId: coordinationIssue.id,
         relatedIssueId: relatedId,
         type: "relates to"
       });
     }
     
     return coordinationIssue;
   }
   ```

2. Implement cross-team status synchronization:
   ```javascript
   // Function to collect and synchronize status across teams
   async function syncCrossTeamStatus(coordinationIssueId, teamIssueIds) {
     let statusUpdate = `## Cross-Team Status Update: ${new Date().toISOString().split('T')[0]}\n\n`;
     
     for (const issueId of teamIssueIds) {
       const issue = await linear.issue(issueId);
       const team = await issue.team;
       
       statusUpdate += `### ${team.name}: ${issue.identifier} (${issue.title})\n`;
       statusUpdate += `**Status:** ${issue.state.name}\n`;
       statusUpdate += `**Assignee:** ${issue.assignee ? issue.assignee.name : "Unassigned"}\n`;
       
       // Get the latest comment as a status indicator
       const comments = await issue.comments({ first: 1, orderBy: { createdAt: "DESC" } });
       if (comments.nodes.length > 0) {
         statusUpdate += `**Latest Update:** ${comments.nodes[0].body.substring(0, 200)}${comments.nodes[0].body.length > 200 ? '...' : ''}\n`;
       }
       
       statusUpdate += `**Link:** ${issue.url}\n\n`;
     }
     
     await linear.commentCreate({
       issueId: coordinationIssueId,
       body: statusUpdate
     });
   }
   ```

3. Create shared documentation for cross-team concerns:
   ```javascript
   // Function to create a shared document for cross-team reference
   async function createSharedDocument(title, content, relatedIssueIds) {
     // This would typically involve creating a document in a shared system
     // For this example, we'll create a Linear issue with the document content
     
     const documentIssue = await linear.issueCreate({
       title: `[Shared Doc] ${title}`,
       description: content,
       teamId: "central-team-id",  // A central team for shared documentation
       labelIds: ["documentation-label-id"]
     });
     
     // Link to all related issues
     for (const issueId of relatedIssueIds) {
       await linear.issueRelationCreate({
         issueId: documentIssue.id,
         relatedIssueId: issueId,
         type: "relates to"
       });
       
       // Add a comment to each related issue
       await linear.commentCreate({
         issueId: issueId,
         body: `
           I've created a shared document for cross-team reference:
           
           [${title}](${documentIssue.url})
           
           Please refer to this document for the latest information on this topic.
         `
       });
     }
     
     return documentIssue;
   }
   ```

**Preventive Measures:**

- Establish clear cross-team communication channels

- Create coordination issues for work that spans multiple teams

- Implement regular cross-team synchronization meetings or updates

- Document cross-team dependencies and interfaces

## References


- [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md)

- [Communication and Delegation SOPs](../reference/communication_delegation_sops.md)

- [Agent Collaboration Workflow](../src/content/docs/reference/agent_collaboration_workflow.md)

- [Linear API Documentation](https://developers.linear.app/docs/)



## Related Resources

- [Common Linear Workflow Issues and Solutions](common_linear_issues.md)
- [Communication Decision Tree](../decision_trees/communication_decision_tree.md)
- [Communication and Delegation SOPs for Codegen and Sub-Agents](../reference/communication_delegation_sops.md)
