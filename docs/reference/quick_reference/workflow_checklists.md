# Workflow Checklists for Common Processes

## Table of Contents
- [Introduction](#introduction)
- [How to Use These Checklists](#how-to-use-these-checklists)
- [Issue Handling Workflows](#issue-handling-workflows)
  - [Issue Creation](#issue-creation)
  - [Issue Assignment](#issue-assignment)
  - [Issue Updates](#issue-updates)
  - [Issue Completion](#issue-completion)
- [Code Development Workflows](#code-development-workflows)
  - [Branch Creation](#branch-creation)
  - [Commit Best Practices](#commit-best-practices)
  - [Pull Request Creation](#pull-request-creation)
  - [Pull Request Updates](#pull-request-updates)
- [Collaboration Workflows](#collaboration-workflows)
  - [Task Delegation](#task-delegation)
  - [Communication Best Practices](#communication-best-practices)
  - [Integration of Work](#integration-of-work)
  - [Conflict Resolution](#conflict-resolution)
- [Review and Feedback Workflows](#review-and-feedback-workflows)
  - [Code Review Process](#code-review-process)
  - [Issue Review Process](#issue-review-process)
  - [Providing Constructive Feedback](#providing-constructive-feedback)
- [Appendix: Decision Trees](#appendix-decision-trees)

## Introduction

This document provides comprehensive workflow checklists for common processes performed by agents. These checklists are designed to ensure consistency, quality, and efficiency in agent operations. Each checklist includes step-by-step instructions, decision points, common pitfalls, and best practices.

## How to Use These Checklists

- **Step-by-Step Instructions**: Follow the numbered steps in sequence.
- **Decision Points**: Look for 🔄 symbols that indicate a decision point with multiple paths.
- **Common Pitfalls**: Watch for ⚠️ symbols that highlight common mistakes and how to avoid them.
- **Best Practices**: Look for 💡 symbols that provide efficiency tips and best practices.
- **Actionable Items**: Use the checkboxes ([ ]) to track your progress through each workflow.

## Issue Handling Workflows

### Issue Creation

**Purpose**: Create clear, actionable issues that provide all necessary context for successful completion.

#### Prerequisites
- [ ] Understanding of the problem or feature request
- [ ] Access to the relevant Linear team/project

#### Workflow Steps

1. **Determine Issue Type**
   - [ ] Decide if this is a bug, feature, enhancement, or documentation issue
   - [ ] Select the appropriate issue template if available

2. **Create the Issue**
   - [ ] Navigate to the appropriate Linear team/project
   - [ ] Click "New Issue" button
   - [ ] Select the appropriate issue type

3. **Write a Clear Title**
   - [ ] Make it concise (under 10 words)
   - [ ] Include the action and subject (e.g., "Add user authentication to login page")
   - [ ] Ensure it's understandable without additional context
   
   ⚠️ **Common Pitfall**: Vague titles like "Fix bug" or "Update feature" make it difficult to understand the issue at a glance.

4. **Write a Comprehensive Description**
   - [ ] Include a clear task overview
   - [ ] Provide relevant context
   - [ ] List specific requirements
   - [ ] Define acceptance criteria
   - [ ] Add any dependencies or related issues
   
   💡 **Best Practice**: Use markdown formatting to structure your description with headings, lists, and code blocks for better readability.

5. **Add Appropriate Metadata**
   - [ ] Assign to the appropriate team member or leave unassigned
   - [ ] Set priority level
   - [ ] Add relevant labels
   - [ ] Set due date if applicable
   - [ ] Add to project if applicable
   
   🔄 **Decision Point**: Should this issue be assigned immediately?
   - If yes: Assign to the appropriate team member
   - If no: Leave unassigned but add to the appropriate team's backlog

6. **Review and Submit**
   - [ ] Double-check all information for accuracy
   - [ ] Ensure the issue provides enough context for someone unfamiliar with the task
   - [ ] Submit the issue

7. **Post-Creation Actions**
   - [ ] Link related issues or PRs
   - [ ] Notify relevant stakeholders if urgent
   - [ ] Add to appropriate cycle if using Linear cycles

### Issue Assignment

**Purpose**: Ensure issues are assigned to the appropriate agents with clear expectations.

#### Prerequisites
- [ ] Existing issue that needs assignment
- [ ] Understanding of team members' skills and availability

#### Workflow Steps

1. **Review the Issue**
   - [ ] Read the issue description thoroughly
   - [ ] Understand the requirements and acceptance criteria
   - [ ] Assess complexity and priority

2. **Identify the Right Assignee**
   - [ ] Consider required skills and expertise
   - [ ] Check current workload and availability
   - [ ] Consider development priorities
   
   💡 **Best Practice**: For complex issues, consider pair assignments where two agents collaborate.

3. **Make the Assignment**
   - [ ] Assign the issue in Linear
   - [ ] Update the status to "In Progress" if work will begin immediately
   
   🔄 **Decision Point**: Is additional context needed?
   - If yes: Add comments with additional information
   - If no: Proceed with standard assignment

4. **Communicate the Assignment**
   - [ ] Notify the assignee through appropriate channels
   - [ ] Provide any additional context not included in the issue
   - [ ] Clarify expectations and deadlines
   
   ⚠️ **Common Pitfall**: Assuming the assignee will see the assignment without direct notification can lead to missed or delayed work.

5. **Set Up Check-ins**
   - [ ] Establish when progress updates are expected
   - [ ] Schedule any necessary sync meetings
   - [ ] Define how blockers should be communicated

### Issue Updates

**Purpose**: Keep stakeholders informed of progress and changes to issues.

#### Prerequisites
- [ ] Assigned issue that you're actively working on
- [ ] Progress to report or changes to communicate

#### Workflow Steps

1. **Determine Update Type**
   - [ ] Progress update
   - [ ] Blocker notification
   - [ ] Scope change
   - [ ] Timeline adjustment

2. **Update the Issue Status**
   - [ ] Change the Linear status to reflect current state
   - [ ] Update priority if needed
   
   💡 **Best Practice**: Keep the status current at all times - this helps everyone understand the true state of work.

3. **Add a Comment**
   - [ ] Write a clear, concise update
   - [ ] Include specific progress made
   - [ ] Highlight any blockers or challenges
   - [ ] Request help or clarification if needed
   
   ⚠️ **Common Pitfall**: Vague updates like "making progress" don't provide actionable information.

4. **Update Metadata if Needed**
   - [ ] Adjust labels
   - [ ] Update due dates
   - [ ] Modify description if scope has changed
   
   🔄 **Decision Point**: Has the scope changed significantly?
   - If yes: Consider creating a new issue and linking it to the original
   - If no: Update the existing issue with new details

5. **Notify Stakeholders**
   - [ ] @mention relevant people in comments
   - [ ] Send additional communication for critical updates

### Issue Completion

**Purpose**: Properly close issues with all necessary information and follow-up actions.

#### Prerequisites
- [ ] Issue with all requirements fulfilled
- [ ] Any associated PRs merged

#### Workflow Steps

1. **Verify Completion**
   - [ ] Review the original requirements
   - [ ] Ensure all acceptance criteria are met
   - [ ] Test the implemented solution if applicable
   
   ⚠️ **Common Pitfall**: Marking issues as complete without verifying all requirements leads to reopened issues and rework.

2. **Document the Solution**
   - [ ] Add a final comment summarizing what was done
   - [ ] Link to relevant PRs or commits
   - [ ] Note any follow-up tasks or future improvements
   
   💡 **Best Practice**: Include before/after screenshots for UI changes or performance metrics for optimization work.

3. **Update Related Issues**
   - [ ] Link to any new issues created for follow-up work
   - [ ] Update parent issues if this was a sub-task

4. **Close the Issue**
   - [ ] Change status to "Done" or equivalent
   - [ ] Verify all metadata is up-to-date
   
   🔄 **Decision Point**: Is a review needed before closing?
   - If yes: Move to "Ready for Review" status and request review
   - If no: Proceed to close the issue

5. **Communicate Completion**
   - [ ] Notify stakeholders that the issue is complete
   - [ ] Provide any necessary handoff information

## Code Development Workflows

### Branch Creation

**Purpose**: Create well-named, properly structured branches for feature development or bug fixes.

#### Prerequisites
- [ ] Linear issue to work on
- [ ] Local clone of the repository

#### Workflow Steps

1. **Ensure Your Main Branch is Updated**
   - [ ] Switch to the main branch: `git checkout main`
   - [ ] Pull the latest changes: `git pull origin main`
   
   ⚠️ **Common Pitfall**: Creating a branch from outdated main code leads to merge conflicts later.

2. **Determine Branch Naming Convention**
   - [ ] Follow the project's established convention
   - [ ] If no convention exists, use: `[type]/[issue-id]-[short-description]`
     - Types: feature, bugfix, hotfix, refactor, docs
     - Example: `feature/HLX-123-add-user-authentication`
   
   💡 **Best Practice**: Include the issue ID in the branch name to automatically link the branch to the issue in many systems.

3. **Create the Branch**
   - [ ] Run: `git checkout -b [branch-name]`
   - [ ] Verify you're on the new branch: `git branch`

4. **Set Up Tracking**
   - [ ] Push the empty branch to establish tracking: `git push -u origin [branch-name]`
   
   🔄 **Decision Point**: Is this a long-running feature branch?
   - If yes: Consider creating feature flags to hide incomplete work in production
   - If no: Proceed with standard development

5. **Update Linear Issue**
   - [ ] Add the branch name to the Linear issue
   - [ ] Update the issue status to "In Progress"

### Commit Best Practices

**Purpose**: Create clear, atomic commits that make the development history understandable and facilitate code review.

#### Prerequisites
- [ ] Changes ready to commit
- [ ] Working on the correct branch

#### Workflow Steps

1. **Review Your Changes**
   - [ ] Run: `git status` to see modified files
   - [ ] Run: `git diff` to review specific changes
   
   💡 **Best Practice**: Review your changes before committing to catch unintended modifications or debug code.

2. **Group Related Changes**
   - [ ] Stage related changes together: `git add [file1] [file2]`
   - [ ] Consider multiple smaller commits instead of one large commit
   
   ⚠️ **Common Pitfall**: Combining unrelated changes in a single commit makes code review and potential reverts more difficult.

3. **Write a Clear Commit Message**
   - [ ] Follow the format: `[type]: [concise description]`
     - Types: feat, fix, docs, style, refactor, test, chore
   - [ ] First line should be under 50 characters
   - [ ] Add detailed description after a blank line if needed
   - [ ] Reference the issue ID: `Refs: HLX-123` or `Fixes: HLX-123`
   
   Example:
   ```
   feat: add user authentication to login page
   
   - Implement OAuth login with Google and GitHub
   - Add remember me functionality
   - Create secure session management
   
   Fixes: HLX-123
   ```

4. **Commit the Changes**
   - [ ] Run: `git commit`
   - [ ] If you've staged all changes: `git commit -m "[message]"`

5. **Verify the Commit**
   - [ ] Run: `git show` to review the commit
   - [ ] Ensure all intended changes are included

6. **Push Regularly**
   - [ ] Push commits to remote: `git push`
   
   🔄 **Decision Point**: Is this commit ready to be shared?
   - If yes: Push to remote
   - If no: Continue working and commit more changes before pushing

### Pull Request Creation

**Purpose**: Create informative pull requests that facilitate effective code review and document changes.

#### Prerequisites
- [ ] Feature or bug fix completed on a branch
- [ ] All tests passing locally
- [ ] Changes pushed to remote repository

#### Workflow Steps

1. **Prepare Your Branch**
   - [ ] Ensure all changes are committed: `git status`
   - [ ] Push final changes to remote: `git push`
   - [ ] Rebase on main if needed: `git rebase main`
   
   ⚠️ **Common Pitfall**: Creating a PR with an outdated branch leads to merge conflicts that must be resolved before merging.

2. **Create the Pull Request**
   - [ ] Navigate to the repository on GitHub
   - [ ] Click "New pull request"
   - [ ] Select your branch as the compare branch
   - [ ] Select the main branch (or appropriate target) as the base branch

3. **Write a Descriptive Title**
   - [ ] Include the issue ID
   - [ ] Briefly describe the changes
   - [ ] Example: `[HLX-123] Add user authentication to login page`

4. **Write a Comprehensive Description**
   - [ ] Summarize the changes
   - [ ] Explain the approach taken
   - [ ] List any notable decisions or trade-offs
   - [ ] Include testing instructions
   - [ ] Add screenshots or videos for UI changes
   
   💡 **Best Practice**: Use a template if available to ensure all necessary information is included.

5. **Link Related Issues**
   - [ ] Use GitHub keywords to link issues: `Fixes #123` or `Relates to #123`
   - [ ] Add Linear issue links

6. **Add Appropriate Labels**
   - [ ] Add type labels (bug, feature, etc.)
   - [ ] Add status labels if applicable

7. **Request Reviewers**
   - [ ] Add appropriate team members as reviewers
   - [ ] Consider adding subject matter experts for specific areas
   
   🔄 **Decision Point**: Is this PR ready for review?
   - If yes: Submit as ready for review
   - If no: Mark as draft PR until it's ready

8. **Update Linear Issue**
   - [ ] Add PR link to the Linear issue
   - [ ] Update issue status to "In Review" or equivalent

### Pull Request Updates

**Purpose**: Respond to feedback and update pull requests effectively.

#### Prerequisites
- [ ] Existing PR with feedback or requested changes
- [ ] Local branch checked out

#### Workflow Steps

1. **Review Feedback**
   - [ ] Read all comments thoroughly
   - [ ] Ask for clarification if needed
   - [ ] Plan your approach to address feedback
   
   💡 **Best Practice**: Respond to each comment in GitHub, even if just to acknowledge it.

2. **Make Requested Changes**
   - [ ] Implement changes locally
   - [ ] Address each point of feedback
   - [ ] Run tests to ensure nothing broke
   
   ⚠️ **Common Pitfall**: Making changes without running tests can introduce new issues.

3. **Commit and Push Changes**
   - [ ] Create focused commits for each set of related changes
   - [ ] Use clear commit messages referencing the feedback
   - [ ] Push changes to the same branch: `git push`

4. **Respond to Review Comments**
   - [ ] Mark comments as resolved when addressed
   - [ ] Explain your changes or why you took a different approach
   - [ ] Ask for re-review if needed
   
   🔄 **Decision Point**: Do the requested changes require significant rework?
   - If yes: Consider discussing alternative approaches with reviewers
   - If no: Implement the changes as requested

5. **Request Re-review**
   - [ ] Notify reviewers that changes are complete
   - [ ] Summarize the changes made in a comment

6. **Update Linear Issue**
   - [ ] Add a comment with the update summary
   - [ ] Link to specific commits if helpful

## Collaboration Workflows

### Task Delegation

**Purpose**: Effectively delegate tasks to appropriate agents with clear expectations and context.

#### Prerequisites
- [ ] Clear understanding of the task to be delegated
- [ ] Knowledge of available agents and their skills

#### Workflow Steps

1. **Define the Task Clearly**
   - [ ] Write a clear task description
   - [ ] Define specific deliverables
   - [ ] Set clear acceptance criteria
   - [ ] Establish timeline and deadlines
   
   ⚠️ **Common Pitfall**: Vague task descriptions lead to misunderstandings and incorrect implementations.

2. **Select the Right Agent**
   - [ ] Consider required skills and expertise
   - [ ] Check current workload and availability
   - [ ] Assess interest and growth opportunities
   
   💡 **Best Practice**: Match tasks to agents' strengths while occasionally providing stretch assignments for growth.

3. **Create a Sub-Issue**
   - [ ] Create a new Linear issue with the task details
   - [ ] Link it as a sub-issue to the parent task
   - [ ] Assign to the selected agent
   
   🔄 **Decision Point**: Is this a standalone task or part of a larger initiative?
   - If part of larger initiative: Create as sub-issue
   - If standalone: Create as regular issue

4. **Provide Context and Resources**
   - [ ] Add background information
   - [ ] Link to relevant documentation
   - [ ] Provide access to necessary resources
   - [ ] Mention related work or examples

5. **Set Clear Expectations**
   - [ ] Define communication frequency
   - [ ] Establish check-in points
   - [ ] Clarify decision-making authority
   - [ ] Set quality standards

6. **Follow Up**
   - [ ] Check in at agreed-upon intervals
   - [ ] Provide feedback on progress
   - [ ] Be available for questions
   - [ ] Adjust expectations if needed

### Communication Best Practices

**Purpose**: Ensure clear, efficient communication among agents and stakeholders.

#### Prerequisites
- [ ] Understanding of available communication channels
- [ ] Knowledge of team communication norms

#### Workflow Steps

1. **Choose the Right Channel**
   - [ ] Linear comments for issue-specific discussions
   - [ ] PR comments for code-specific feedback
   - [ ] Chat for quick questions
   - [ ] Meetings for complex discussions
   
   💡 **Best Practice**: Keep discussions in the most relevant platform to maintain context and searchability.

2. **Structure Your Communication**
   - [ ] Start with the main point or question
   - [ ] Provide necessary context
   - [ ] Be specific about what you need
   - [ ] Include relevant links or references
   
   ⚠️ **Common Pitfall**: Burying the main point in lengthy messages makes it easy to miss the key information.

3. **Use Clear Formatting**
   - [ ] Use headings, lists, and emphasis
   - [ ] Include code blocks for code snippets
   - [ ] Add screenshots or diagrams for visual clarity
   
   🔄 **Decision Point**: Is this a simple or complex topic?
   - If simple: Keep it brief and direct
   - If complex: Structure with headings and sections

4. **Set Expectations**
   - [ ] Indicate urgency
   - [ ] Specify when you need a response
   - [ ] Be clear about next steps
   - [ ] Tag specific people for required actions

5. **Follow Up Appropriately**
   - [ ] Acknowledge responses
   - [ ] Summarize decisions or outcomes
   - [ ] Document important points in relevant issues

### Integration of Work

**Purpose**: Effectively integrate work from multiple agents into a cohesive whole.

#### Prerequisites
- [ ] Completed sub-tasks from multiple agents
- [ ] Understanding of the overall project structure

#### Workflow Steps

1. **Review All Components**
   - [ ] Examine each completed sub-task
   - [ ] Verify all requirements are met
   - [ ] Check for consistency across components
   
   ⚠️ **Common Pitfall**: Assuming all components will work together without explicit integration testing.

2. **Identify Integration Points**
   - [ ] Map dependencies between components
   - [ ] Note API contracts or interfaces
   - [ ] Document data flow between components
   
   💡 **Best Practice**: Create a visual diagram of how components interact to identify potential issues.

3. **Create Integration Plan**
   - [ ] Determine integration sequence
   - [ ] Identify potential conflicts
   - [ ] Plan for testing at each step
   
   🔄 **Decision Point**: Should integration be done all at once or incrementally?
   - If simple integration: Combine all at once
   - If complex: Integrate incrementally with testing at each step

4. **Execute Integration**
   - [ ] Merge code from each component
   - [ ] Resolve any conflicts
   - [ ] Adjust interfaces as needed
   - [ ] Run integration tests

5. **Verify Integrated Solution**
   - [ ] Test end-to-end functionality
   - [ ] Check for performance issues
   - [ ] Verify all requirements are still met

6. **Document Integration**
   - [ ] Update documentation with integration details
   - [ ] Note any changes made during integration
   - [ ] Record lessons learned for future integrations

### Conflict Resolution

**Purpose**: Effectively resolve conflicts in code, approach, or priorities.

#### Prerequisites
- [ ] Identified conflict between agents or components
- [ ] Understanding of the different perspectives

#### Workflow Steps

1. **Identify the Conflict**
   - [ ] Define the specific area of disagreement
   - [ ] Gather facts from all perspectives
   - [ ] Separate facts from opinions
   
   ⚠️ **Common Pitfall**: Rushing to resolve without fully understanding the conflict leads to suboptimal solutions.

2. **Analyze the Options**
   - [ ] List all proposed approaches
   - [ ] Evaluate pros and cons of each
   - [ ] Consider short and long-term implications
   
   💡 **Best Practice**: Create a decision matrix with weighted criteria to objectively compare options.

3. **Facilitate Discussion**
   - [ ] Bring affected parties together
   - [ ] Ensure all perspectives are heard
   - [ ] Focus on project goals rather than personal preferences
   
   🔄 **Decision Point**: Is this a technical disagreement or a priority conflict?
   - If technical: Focus on data and testing to validate approaches
   - If priority: Refer to project goals and stakeholder needs

4. **Reach a Decision**
   - [ ] Build consensus where possible
   - [ ] Make a clear decision when consensus isn't possible
   - [ ] Document the rationale for the decision

5. **Implement and Monitor**
   - [ ] Communicate the decision to all stakeholders
   - [ ] Implement the chosen approach
   - [ ] Monitor for any issues
   - [ ] Be willing to revisit if new information emerges

## Review and Feedback Workflows

### Code Review Process

**Purpose**: Ensure code quality, knowledge sharing, and consistent standards through effective reviews.

#### Prerequisites
- [ ] Pull request ready for review
- [ ] Understanding of project coding standards

#### Workflow Steps

1. **Prepare for Review**
   - [ ] Read the PR description and linked issues
   - [ ] Understand the purpose and context of the changes
   - [ ] Check if CI tests are passing
   
   💡 **Best Practice**: Start with a high-level understanding before diving into code details.

2. **Review the Code**
   - [ ] Check code style and formatting
   - [ ] Verify logic and functionality
   - [ ] Look for potential bugs or edge cases
   - [ ] Consider performance implications
   - [ ] Assess test coverage
   
   ⚠️ **Common Pitfall**: Focusing only on style issues while missing logical problems or edge cases.

3. **Provide Constructive Feedback**
   - [ ] Be specific about issues
   - [ ] Suggest improvements rather than just pointing out problems
   - [ ] Explain the reasoning behind suggestions
   - [ ] Prioritize feedback (must-fix vs. nice-to-have)
   
   🔄 **Decision Point**: How significant are the issues found?
   - If minor: Approve with comments
   - If major: Request changes with clear explanations

4. **Follow Up on Changes**
   - [ ] Review updates to addressed feedback
   - [ ] Be responsive to questions
   - [ ] Approve when satisfied with changes

5. **Approve and Merge**
   - [ ] Give final approval when ready
   - [ ] Verify all required approvals are in place
   - [ ] Merge or let the author merge as appropriate

### Issue Review Process

**Purpose**: Ensure completed issues meet requirements and maintain quality standards.

#### Prerequisites
- [ ] Issue marked as ready for review
- [ ] Understanding of the issue requirements

#### Workflow Steps

1. **Review Requirements**
   - [ ] Read the original issue description
   - [ ] Understand acceptance criteria
   - [ ] Note any changes or updates to requirements
   
   💡 **Best Practice**: Compare the current state against the original requirements to ensure nothing was missed.

2. **Verify Implementation**
   - [ ] Test the implemented solution
   - [ ] Check all acceptance criteria
   - [ ] Look for edge cases or potential issues
   
   ⚠️ **Common Pitfall**: Superficial testing that misses edge cases or real-world usage patterns.

3. **Review Documentation**
   - [ ] Check that changes are properly documented
   - [ ] Verify README updates if applicable
   - [ ] Ensure code comments are clear and helpful
   
   🔄 **Decision Point**: Is the implementation complete and correct?
   - If yes: Approve and close
   - If no: Provide feedback and request updates

4. **Provide Feedback**
   - [ ] Be specific about any issues
   - [ ] Acknowledge what was done well
   - [ ] Suggest improvements if needed

5. **Close or Return**
   - [ ] Mark as complete if satisfactory
   - [ ] Return to assignee with feedback if changes needed
   - [ ] Update status in Linear accordingly

### Providing Constructive Feedback

**Purpose**: Deliver feedback that improves work quality and supports agent growth.

#### Prerequisites
- [ ] Work to review (code, documentation, etc.)
- [ ] Clear understanding of quality standards

#### Workflow Steps

1. **Prepare Your Feedback**
   - [ ] Review the work thoroughly
   - [ ] Identify specific strengths and areas for improvement
   - [ ] Consider the agent's experience level
   
   💡 **Best Practice**: Balance positive feedback with constructive criticism - aim for at least one positive comment for every suggestion.

2. **Structure Your Feedback**
   - [ ] Start with positive aspects
   - [ ] Present issues as opportunities for improvement
   - [ ] Be specific with examples
   - [ ] Offer actionable suggestions
   
   ⚠️ **Common Pitfall**: Vague feedback like "this could be better" without specific suggestions isn't helpful.

3. **Deliver Feedback Effectively**
   - [ ] Use a respectful, constructive tone
   - [ ] Focus on the work, not the person
   - [ ] Explain the reasoning behind suggestions
   - [ ] Prioritize feedback items by importance
   
   🔄 **Decision Point**: Should feedback be given in writing or conversation?
   - If straightforward: Written feedback may be sufficient
   - If complex or potentially sensitive: Consider a conversation followed by written summary

4. **Encourage Dialogue**
   - [ ] Ask questions about decisions
   - [ ] Be open to explanations
   - [ ] Collaborate on solutions
   - [ ] Be available for follow-up questions

5. **Follow Up**
   - [ ] Check in on progress
   - [ ] Acknowledge improvements
   - [ ] Offer additional help if needed
   - [ ] Recognize growth over time

## Appendix: Decision Trees

### Issue Triage Decision Tree

```
Is this a new issue?
├── Yes
│   ├── Is it urgent/critical?
│   │   ├── Yes → Assign immediately to available agent
│   │   └── No → Continue triage
│   │
│   ├── Is it well-defined?
│   │   ├── Yes → Add to appropriate backlog
│   │   └── No → Request clarification from reporter
│   │
│   └── Does it depend on other work?
│       ├── Yes → Link dependencies and sequence appropriately
│       └── No → Ready for assignment
│
└── No (existing issue)
    ├── Has it been blocked?
    │   ├── Yes → Address blocker or reassign
    │   └── No → Continue
    │
    ├── Is it still relevant?
    │   ├── Yes → Update priority if needed
    │   └── No → Close with explanation
    │
    └── Has scope changed?
        ├── Yes → Update description and reassess
        └── No → Continue with current plan
```

### Code Review Decision Tree

```
Are CI tests passing?
├── No → Request fixes before continuing review
└── Yes → Continue review
    │
    ├── Are there style/formatting issues?
    │   ├── Yes → Request fixes, but don't block on minor issues
    │   └── No → Continue
    │
    ├── Are there logical/functional issues?
    │   ├── Yes → Request changes with clear explanation
    │   └── No → Continue
    │
    ├── Is test coverage adequate?
    │   ├── Yes → Continue
    │   └── No → Request additional tests
    │
    └── Overall assessment
        ├── Major issues → Request changes
        ├── Minor issues → Approve with comments
        └── No issues → Approve and merge
```

### Collaboration Approach Decision Tree

```
What type of task is this?
├── Simple, well-defined → Single agent assignment
└── Complex or multi-faceted
    │
    ├── Can it be broken down?
    │   ├── Yes → Create sub-tasks and delegate
    │   └── No → Continue
    │
    ├── Requires diverse skills?
    │   ├── Yes → Multi-agent collaboration
    │   └── No → Single agent with consultation
    │
    └── High visibility/impact?
        ├── Yes → Add review checkpoints
        └── No → Standard process
```

