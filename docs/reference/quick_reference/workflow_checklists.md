# Agent Workflow Checklists

This document provides comprehensive step-by-step workflows for common tasks performed by agents. Each workflow includes detailed instructions, decision points, common pitfalls, and best practices.

## Table of Contents

- [Issue Handling Workflows](#issue-handling-workflows)
  - [New Issue Triage](#new-issue-triage)
  - [Issue Implementation](#issue-implementation)
  - [Issue Review and Closure](#issue-review-and-closure)
- [Code Development Workflows](#code-development-workflows)
  - [Feature Development](#feature-development)
  - [Bug Fix Implementation](#bug-fix-implementation)
  - [Refactoring](#refactoring)
- [Collaboration Workflows](#collaboration-workflows)
  - [Multi-Agent Task Delegation](#multi-agent-task-delegation)
  - [Parent-Child Agent Collaboration](#parent-child-agent-collaboration)
  - [Cross-Team Collaboration](#cross-team-collaboration)
- [Review and Feedback Workflows](#review-and-feedback-workflows)
  - [Code Review](#code-review)
  - [PR Review](#pr-review)
  - [Feedback Implementation](#feedback-implementation)

---

## Issue Handling Workflows

### New Issue Triage

#### Step-by-Step Process

1. **Initial Assessment**
   - Read the issue description thoroughly
   - Identify the type of issue (bug, feature, enhancement, etc.)
   - Determine the priority based on impact and urgency

2. **Clarification and Information Gathering**
   - If the issue description is unclear, ask clarifying questions
   - Request additional information if needed (screenshots, logs, steps to reproduce)
   - Use the `send_message` tool to communicate with the issue creator

3. **Issue Classification**
   - Assign appropriate labels using `linear_update_issue` with the `label_ids` parameter
   - Set the correct priority using `linear_update_issue` with the `priority` parameter
   - Assign to the appropriate team using `linear_update_issue` with the `team_id` parameter

4. **Assignment and Planning**
   - Self-assign the issue if you'll be working on it using `linear_self_assign`
   - Assign to another agent if more appropriate using `linear_update_issue` with the `assignee_id` parameter
   - Add the issue to the appropriate cycle if applicable using `linear_assign_issue_to_cycle`

5. **Status Update**
   - Move the issue to the appropriate state using `linear_update_issue` with the `state_id` parameter
   - Add a comment with your assessment and next steps using `linear_comment_on_issue`

#### Decision Points and Branching Paths

- **Issue Clarity Decision**
  - If issue is clear → Proceed to classification
  - If issue is unclear → Request clarification and wait for response

- **Issue Complexity Decision**
  - If issue is simple → Self-assign and implement
  - If issue is complex → Break down into sub-issues using `linear_create_issue` with the `parent_issue_id` parameter

- **Issue Priority Decision**
  - If issue is urgent → Assign high priority and move to "In Progress"
  - If issue is standard → Assign normal priority and plan accordingly
  - If issue is low priority → Add to backlog for future consideration

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Misunderstanding the issue due to incomplete information
  - **Solution**: Always ask clarifying questions before proceeding

- **Pitfall**: Incorrect prioritization leading to inefficient resource allocation
  - **Solution**: Use consistent prioritization criteria and consult with team when uncertain

- **Pitfall**: Forgetting to update issue status as you progress
  - **Solution**: Make status updates part of your workflow at each major step

- **Pitfall**: Not linking related issues or PRs
  - **Solution**: Always use `linear_attach_link` to connect related resources

#### Best Practices and Efficiency Tips

- Always acknowledge new issues promptly, even if you can't address them immediately
- Use consistent labeling to make issues easily searchable and filterable
- Link to relevant documentation or similar past issues when available
- Set realistic expectations for resolution timeframes
- Document your triage process in the issue comments for transparency

---

### Issue Implementation

#### Step-by-Step Process

1. **Preparation**
   - Move the issue to "In Progress" state using `linear_update_issue` with the `state_id` parameter
   - Create a new branch for implementation:
     ```bash
     git checkout -b feature/issue-description
     ```

2. **Implementation**
   - Make the necessary code changes
   - Commit changes with descriptive messages:
     ```bash
     git add .
     git commit -m "Implement feature X as described in LINEAR-123"
     ```
   - Push changes to remote:
     ```bash
     git push -u origin feature/issue-description
     ```

3. **Pull Request Creation**
   - Create a PR using the `create_pr` tool
   - Link the PR to the Linear issue using `linear_attach_link`
   - Add appropriate reviewers using `github_assign_pr_reviewers`

4. **Status Update**
   - Update the issue status to "In Review" using `linear_update_issue`
   - Add a comment with implementation details using `linear_comment_on_issue`

#### Decision Points and Branching Paths

- **Implementation Approach Decision**
  - If feature is well-defined → Direct implementation
  - If feature requires design decisions → Create design document first and seek approval

- **Testing Approach Decision**
  - If change affects critical path → Add comprehensive tests
  - If change is isolated → Add focused tests for the specific functionality

- **PR Size Decision**
  - If changes are large → Consider breaking into multiple PRs
  - If changes are focused → Proceed with single PR

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Implementing without fully understanding requirements
  - **Solution**: Clarify all requirements before starting implementation

- **Pitfall**: Making unrelated changes in the same PR
  - **Solution**: Keep PRs focused on a single concern

- **Pitfall**: Forgetting to update tests
  - **Solution**: Always update or add tests for new functionality

- **Pitfall**: Not linking PR to Linear issue
  - **Solution**: Always use `linear_attach_link` after creating a PR

#### Best Practices and Efficiency Tips

- Start with writing tests to clarify your understanding of the requirements
- Make small, focused commits with clear messages
- Keep PRs small and focused on a single concern
- Update the Linear issue with progress updates
- Address feedback promptly and thoroughly

---

### Issue Review and Closure

#### Step-by-Step Process

1. **Review Preparation**
   - Check that all implementation tasks are complete
   - Verify that all CI checks are passing using `list_pr_checks`
   - Review the PR yourself before requesting reviews

2. **Review Process**
   - Address reviewer feedback
   - Make necessary changes and push updates
   - Request re-review if significant changes were made

3. **Merge and Deployment**
   - Merge the PR once approved
   - Update the Linear issue status to "Done" using `linear_update_issue`
   - Add a comment with merge details using `linear_comment_on_issue`

4. **Verification**
   - Verify the changes in the deployed environment if applicable
   - Document any post-deployment steps or considerations

5. **Closure**
   - Close the issue using `linear_update_issue` with the appropriate `state_id`
   - Notify stakeholders of completion using `send_message`

#### Decision Points and Branching Paths

- **Review Feedback Decision**
  - If minor feedback → Address directly and request approval
  - If major feedback → Discuss approach, possibly create follow-up issues

- **Deployment Decision**
  - If change requires immediate deployment → Coordinate with operations team
  - If change can be included in regular release → Add to release notes

- **Verification Decision**
  - If feature is user-facing → Perform user acceptance testing
  - If feature is internal → Perform technical verification

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Closing issues before proper verification
  - **Solution**: Always verify changes in the appropriate environment

- **Pitfall**: Not addressing all review comments
  - **Solution**: Use GitHub's review system to track and resolve all comments

- **Pitfall**: Forgetting to update documentation
  - **Solution**: Include documentation updates in your definition of "done"

- **Pitfall**: Not communicating completion to stakeholders
  - **Solution**: Always notify relevant parties when significant issues are resolved

#### Best Practices and Efficiency Tips

- Use the PR description to document testing performed
- Link to before/after screenshots for visual changes
- Include performance impact considerations for significant changes
- Document any deployment notes or special considerations
- Update related issues or documentation

---

## Code Development Workflows

### Feature Development

#### Step-by-Step Process

1. **Requirement Analysis**
   - Review the feature requirements thoroughly
   - Break down complex features into smaller, manageable tasks
   - Create sub-issues for complex features using `linear_create_issue`

2. **Branch Creation**
   - Create a feature branch from the main branch:
     ```bash
     git checkout main
     git pull
     git checkout -b feature/feature-name
     ```

3. **Implementation**
   - Implement the feature in small, logical commits
   - Write tests for the new functionality
   - Document the code as you go

4. **Local Testing**
   - Run tests locally to verify functionality
   - Perform manual testing as needed
   - Address any issues found during testing

5. **Pull Request**
   - Push your changes to the remote repository
   - Create a PR using the `create_pr` tool
   - Link the PR to the Linear issue using `linear_attach_link`

6. **Review and Refinement**
   - Address reviewer feedback
   - Make necessary changes and push updates
   - Ensure all CI checks pass

7. **Merge and Deployment**
   - Merge the PR once approved
   - Update the Linear issue status
   - Verify the feature in the deployed environment

#### Decision Points and Branching Paths

- **Feature Scope Decision**
  - If feature is large → Break into smaller sub-features
  - If feature is focused → Implement directly

- **Technical Approach Decision**
  - If multiple approaches exist → Document options and rationale for chosen approach
  - If approach is straightforward → Proceed with implementation

- **Testing Strategy Decision**
  - If feature affects critical paths → Add integration and end-to-end tests
  - If feature is isolated → Unit tests may be sufficient

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Feature creep during implementation
  - **Solution**: Strictly adhere to the defined scope, create separate issues for enhancements

- **Pitfall**: Insufficient testing
  - **Solution**: Write tests before or alongside implementation (TDD approach)

- **Pitfall**: Poor documentation
  - **Solution**: Document code, APIs, and usage examples as you develop

- **Pitfall**: Large, monolithic PRs
  - **Solution**: Break implementation into smaller, focused PRs when possible

#### Best Practices and Efficiency Tips

- Start with a clear understanding of acceptance criteria
- Create a technical design document for complex features
- Use feature flags for large features to enable incremental deployment
- Write tests before implementation when possible (TDD)
- Keep PRs focused and reasonably sized
- Document API changes and update relevant documentation

---

### Bug Fix Implementation

#### Step-by-Step Process

1. **Reproduction**
   - Verify that you can reproduce the bug
   - Document the steps to reproduce
   - Identify the root cause through debugging

2. **Branch Creation**
   - Create a bug fix branch from the main branch:
     ```bash
     git checkout main
     git pull
     git checkout -b fix/bug-description
     ```

3. **Implementation**
   - Fix the bug with minimal changes
   - Add tests that verify the fix
   - Ensure existing tests still pass

4. **Verification**
   - Verify that the bug is fixed using the reproduction steps
   - Check for any regressions
   - Document the fix and any side effects

5. **Pull Request**
   - Push your changes to the remote repository
   - Create a PR using the `create_pr` tool
   - Link the PR to the Linear issue using `linear_attach_link`

6. **Review and Merge**
   - Address reviewer feedback
   - Ensure all CI checks pass
   - Merge the PR once approved

7. **Backporting (if needed)**
   - Determine if the fix needs to be backported to stable releases
   - Create backport PRs if necessary

#### Decision Points and Branching Paths

- **Fix Approach Decision**
  - If bug has a clear cause → Direct fix
  - If bug is symptom of larger issue → Consider refactoring

- **Test Addition Decision**
  - If bug was due to missing test → Add comprehensive tests
  - If bug was in tested code → Improve existing tests

- **Release Urgency Decision**
  - If bug is critical → Consider hotfix release
  - If bug is minor → Include in next regular release

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Fixing symptoms instead of root causes
  - **Solution**: Take time to properly diagnose the underlying issue

- **Pitfall**: Introducing regressions
  - **Solution**: Add regression tests and perform thorough testing

- **Pitfall**: Overly complex fixes
  - **Solution**: Aim for the simplest solution that correctly fixes the issue

- **Pitfall**: Not documenting the fix
  - **Solution**: Always document what caused the bug and how it was fixed

#### Best Practices and Efficiency Tips

- Always start by reproducing the bug
- Add a test that fails due to the bug before fixing it
- Keep fixes focused and minimal
- Document the root cause in the PR description
- Consider whether similar bugs could exist elsewhere
- Update documentation if the bug was related to unclear documentation

---

### Refactoring

#### Step-by-Step Process

1. **Scope Definition**
   - Clearly define what will be refactored and why
   - Set clear boundaries for the refactoring
   - Create a Linear issue to track the refactoring

2. **Branch Creation**
   - Create a refactoring branch from the main branch:
     ```bash
     git checkout main
     git pull
     git checkout -b refactor/description
     ```

3. **Implementation**
   - Make refactoring changes in small, logical commits
   - Ensure tests pass after each commit
   - Avoid changing functionality during refactoring

4. **Testing**
   - Run all tests to ensure no functionality has changed
   - Add new tests if the refactoring enables better testing
   - Perform manual verification if necessary

5. **Pull Request**
   - Push your changes to the remote repository
   - Create a PR using the `create_pr` tool
   - Link the PR to the Linear issue using `linear_attach_link`

6. **Review and Merge**
   - Address reviewer feedback
   - Ensure all CI checks pass
   - Merge the PR once approved

#### Decision Points and Branching Paths

- **Refactoring Scope Decision**
  - If refactoring is large → Break into smaller, focused refactorings
  - If refactoring is focused → Proceed with implementation

- **Testing Approach Decision**
  - If refactoring changes public APIs → Add integration tests
  - If refactoring is internal → Unit tests may be sufficient

- **Deployment Strategy Decision**
  - If refactoring is high-risk → Consider feature flags or phased rollout
  - If refactoring is low-risk → Standard deployment process

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Changing functionality during refactoring
  - **Solution**: Strictly separate refactoring from functional changes

- **Pitfall**: Overly large refactoring PRs
  - **Solution**: Break refactoring into smaller, focused changes

- **Pitfall**: Insufficient testing after refactoring
  - **Solution**: Ensure comprehensive test coverage before and after

- **Pitfall**: Unclear motivation for refactoring
  - **Solution**: Clearly document the benefits and goals of the refactoring

#### Best Practices and Efficiency Tips

- Follow the "boy scout rule": leave the code better than you found it
- Use automated refactoring tools when available
- Make one type of change at a time (e.g., rename variables in one commit, extract methods in another)
- Run tests frequently during refactoring
- Document architectural decisions and patterns introduced
- Consider performance implications of refactoring

---

## Collaboration Workflows

### Multi-Agent Task Delegation

#### Step-by-Step Process

1. **Task Analysis**
   - Review the overall task and identify components that can be delegated
   - Determine dependencies between components
   - Estimate complexity and effort for each component

2. **Sub-Task Creation**
   - Create sub-issues for each component using `linear_create_issue` with the `parent_issue_id` parameter
   - Clearly define the scope and requirements for each sub-task
   - Set appropriate priorities for sub-tasks

3. **Agent Assignment**
   - Identify suitable agents for each sub-task based on expertise and availability
   - Assign sub-tasks to agents using `linear_update_issue` with the `assignee_id` parameter
   - Notify assigned agents using `send_agent_message`

4. **Coordination Setup**
   - Establish communication channels for collaboration
   - Define synchronization points and dependencies
   - Set up regular check-ins if the task is complex

5. **Progress Monitoring**
   - Track progress of sub-tasks
   - Address blockers and dependencies
   - Provide guidance and support as needed

6. **Integration**
   - Coordinate the integration of completed sub-tasks
   - Verify that all components work together correctly
   - Address any integration issues

7. **Review and Completion**
   - Review the completed work holistically
   - Ensure all requirements are met
   - Close the parent issue once all sub-tasks are complete

#### Decision Points and Branching Paths

- **Delegation Strategy Decision**
  - If task has clear, independent components → Parallel delegation
  - If task has sequential dependencies → Staged delegation

- **Agent Selection Decision**
  - If task requires specific expertise → Assign to specialist agents
  - If task is general → Assign based on availability

- **Coordination Approach Decision**
  - If task is complex → Set up formal coordination structure
  - If task is straightforward → Lightweight coordination

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Unclear sub-task definitions leading to misalignment
  - **Solution**: Create detailed, specific sub-task descriptions with clear deliverables

- **Pitfall**: Insufficient coordination leading to integration problems
  - **Solution**: Establish clear interfaces between components and regular sync points

- **Pitfall**: Overlooking dependencies between sub-tasks
  - **Solution**: Map out dependencies explicitly and plan accordingly

- **Pitfall**: Lack of overall ownership
  - **Solution**: Maintain clear ownership of the parent task and overall integration

#### Best Practices and Efficiency Tips

- Create a visual task breakdown (e.g., mind map or task tree)
- Define clear interfaces between components
- Establish regular check-ins for complex tasks
- Document decisions and rationale in the parent issue
- Use consistent labeling for related sub-tasks
- Balance workload across agents appropriately
- Maintain a central source of truth for shared information

---

### Parent-Child Agent Collaboration

#### Step-by-Step Process

1. **Task Delegation**
   - Parent agent creates a sub-issue using `linear_create_issue` with the `parent_issue_id` parameter
   - Parent agent assigns the sub-issue to a child agent using `linear_update_issue`
   - Parent agent notifies the child agent using `send_agent_message`

2. **Requirement Clarification**
   - Child agent reviews the sub-issue
   - Child agent asks clarifying questions if needed using `linear_comment_on_issue`
   - Parent agent provides additional context and clarification

3. **Implementation Planning**
   - Child agent develops an implementation plan
   - Child agent shares the plan with the parent agent for approval
   - Parent agent provides feedback and guidance

4. **Execution**
   - Child agent implements the solution
   - Child agent provides regular progress updates
   - Parent agent monitors progress and provides support

5. **Review and Feedback**
   - Child agent submits completed work for review
   - Parent agent reviews the work and provides feedback
   - Child agent addresses feedback and makes necessary adjustments

6. **Integration**
   - Parent agent integrates the child agent's work into the overall solution
   - Parent agent verifies that the integration is successful
   - Both agents collaborate to address any integration issues

7. **Completion**
   - Child agent marks the sub-issue as complete
   - Parent agent verifies completion and closes the sub-issue
   - Parent agent incorporates the completed work into the parent issue

#### Decision Points and Branching Paths

- **Autonomy Level Decision**
  - If child agent is experienced → Grant higher autonomy
  - If child agent is less experienced → Provide more guidance and checkpoints

- **Communication Frequency Decision**
  - If task is complex or critical → Establish frequent check-ins
  - If task is straightforward → Allow more independent work

- **Review Approach Decision**
  - If work is critical → Conduct thorough, formal review
  - If work is lower risk → Lighter review process

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Insufficient initial context leading to misaligned work
  - **Solution**: Provide comprehensive context and requirements upfront

- **Pitfall**: Micromanagement reducing efficiency
  - **Solution**: Set clear expectations and milestones, then trust the child agent

- **Pitfall**: Lack of timely feedback creating delays
  - **Solution**: Establish clear feedback timelines and stick to them

- **Pitfall**: Siloed work leading to integration challenges
  - **Solution**: Maintain ongoing communication about interfaces and integration points

#### Best Practices and Efficiency Tips

- Establish clear communication channels and expectations upfront
- Document decisions and rationale in the issue comments
- Use consistent templates for sub-issues to ensure all necessary information is included
- Set clear milestones and check-in points
- Provide constructive, actionable feedback
- Recognize and leverage the child agent's strengths
- Document lessons learned for future collaborations

---

### Cross-Team Collaboration

#### Step-by-Step Process

1. **Collaboration Initiation**
   - Identify the need for cross-team collaboration
   - Create a Linear issue to track the collaboration
   - Tag relevant teams using appropriate labels

2. **Stakeholder Identification**
   - Identify key stakeholders from each team
   - Assign representatives using `linear_update_issue` with the `assignee_id` parameter
   - Notify all stakeholders using `send_message` or `linear_comment_on_issue`

3. **Scope and Requirements Alignment**
   - Conduct a kickoff meeting or discussion
   - Define the scope of collaboration
   - Document agreed-upon requirements and responsibilities

4. **Coordination Structure**
   - Establish communication channels
   - Define decision-making processes
   - Set up regular sync meetings if needed

5. **Implementation**
   - Execute the collaborative work
   - Maintain regular communication
   - Address cross-team dependencies and blockers

6. **Integration and Testing**
   - Integrate work from different teams
   - Test the integrated solution
   - Address any integration issues collaboratively

7. **Review and Completion**
   - Conduct a joint review of the completed work
   - Document lessons learned
   - Close the collaboration issue once complete

#### Decision Points and Branching Paths

- **Collaboration Model Decision**
  - If teams have equal involvement → Shared ownership model
  - If one team leads with support from others → Lead-support model

- **Communication Structure Decision**
  - If collaboration is complex → Formal communication structure with regular meetings
  - If collaboration is straightforward → Ad-hoc communication as needed

- **Integration Approach Decision**
  - If components are tightly coupled → Continuous integration approach
  - If components are loosely coupled → Defined integration points

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Unclear ownership and responsibilities
  - **Solution**: Explicitly document which team owns what and who makes decisions

- **Pitfall**: Misaligned priorities between teams
  - **Solution**: Establish shared priorities and escalation paths

- **Pitfall**: Communication silos
  - **Solution**: Use shared communication channels and documentation

- **Pitfall**: Integration challenges due to different team practices
  - **Solution**: Agree on interfaces and standards upfront

#### Best Practices and Efficiency Tips

- Document all cross-team decisions and make them accessible to all stakeholders
- Use shared terminology and define terms that might have different meanings across teams
- Establish clear escalation paths for blockers and conflicts
- Recognize and respect different team cultures and practices
- Celebrate joint successes and share credit appropriately
- Conduct retrospectives to improve future collaborations
- Maintain a single source of truth for shared information

---

## Review and Feedback Workflows

### Code Review

#### Step-by-Step Process

1. **Review Preparation**
   - Understand the context and purpose of the changes
   - Review the issue or requirements that prompted the changes
   - Check out the branch locally if needed for deeper review

2. **Code Examination**
   - Review the code changes using `view_pr`
   - Examine the implementation approach and logic
   - Check for adherence to coding standards and best practices

3. **Testing Verification**
   - Verify that appropriate tests have been added or updated
   - Check that all tests are passing using `list_pr_checks`
   - Consider edge cases that might not be covered by tests

4. **Feedback Provision**
   - Provide specific, actionable feedback using `create_pr_review_comment`
   - Distinguish between required changes and suggestions
   - Offer alternative approaches when appropriate

5. **Follow-up**
   - Review the changes made in response to feedback
   - Approve the PR once all issues are addressed
   - Provide encouragement and recognition for good work

#### Decision Points and Branching Paths

- **Review Depth Decision**
  - If change is critical or complex → Conduct deep, thorough review
  - If change is straightforward → Focus on high-level correctness

- **Feedback Approach Decision**
  - If issues are minor → Approve with comments
  - If issues are significant → Request changes

- **Testing Requirement Decision**
  - If change affects critical functionality → Require comprehensive tests
  - If change is low-risk → Basic test coverage may be sufficient

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Focusing on style over substance
  - **Solution**: Prioritize correctness, performance, and security over stylistic preferences

- **Pitfall**: Vague or unhelpful feedback
  - **Solution**: Provide specific, actionable feedback with examples

- **Pitfall**: Delayed reviews creating bottlenecks
  - **Solution**: Set expectations for review turnaround time and prioritize reviews

- **Pitfall**: Overlooking the big picture
  - **Solution**: Consider the overall architecture and design, not just line-by-line changes

#### Best Practices and Efficiency Tips

- Start with a high-level review before diving into details
- Use a consistent review checklist
- Be constructive and respectful in feedback
- Ask questions rather than making assumptions
- Look for opportunities to share knowledge
- Consider performance, security, and maintainability
- Recognize and compliment good code and practices
- Focus on the most important issues rather than nitpicking

---

### PR Review

#### Step-by-Step Process

1. **Context Understanding**
   - Review the PR description and linked issues
   - Understand the purpose and scope of the changes
   - Check if the PR addresses the requirements

2. **Change Assessment**
   - Review the code changes using `view_pr`
   - Assess the implementation approach
   - Check for potential issues or improvements

3. **Verification**
   - Check that all CI checks are passing using `list_pr_checks`
   - Verify that appropriate tests have been added
   - Consider testing the changes locally if necessary

4. **Feedback Provision**
   - Provide line-specific feedback using `create_pr_review_comment`
   - Provide general feedback using `create_pr_comment`
   - Be clear about which changes are required vs. suggested

5. **Review Submission**
   - Submit the review with an appropriate status (approve, request changes, comment)
   - Follow up on any discussion threads
   - Re-review once changes have been made

#### Decision Points and Branching Paths

- **Review Outcome Decision**
  - If changes meet requirements and standards → Approve
  - If minor issues exist → Approve with comments
  - If significant issues exist → Request changes

- **Follow-up Decision**
  - If requested changes are substantial → Full re-review
  - If changes are minor → Focused re-review

- **Merge Decision**
  - If all requirements are met → Approve for merge
  - If requirements are partially met → Consider partial implementation or follow-up issues

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Rubber-stamp approvals without thorough review
  - **Solution**: Always take the time to understand and evaluate the changes

- **Pitfall**: Blocking PRs for minor issues
  - **Solution**: Distinguish between must-fix issues and nice-to-have improvements

- **Pitfall**: Inconsistent review standards
  - **Solution**: Use consistent review criteria and checklists

- **Pitfall**: Not considering the user/customer perspective
  - **Solution**: Always consider how changes affect the end user

#### Best Practices and Efficiency Tips

- Review the PR description first to understand context
- Check that the PR title and description are clear and informative
- Look for test coverage and documentation updates
- Consider backwards compatibility and migration paths
- Verify that the PR follows the project's branching strategy
- Check for security implications
- Consider performance impact
- Provide feedback on positive aspects, not just issues
- Use a consistent review template or checklist

---

### Feedback Implementation

#### Step-by-Step Process

1. **Feedback Assessment**
   - Review all feedback received
   - Categorize feedback (must-fix, should-fix, could-fix, won't-fix)
   - Ask clarifying questions if needed

2. **Implementation Planning**
   - Prioritize feedback items
   - Create a plan for addressing the feedback
   - Communicate your plan to reviewers if appropriate

3. **Changes Implementation**
   - Make the necessary changes to address feedback
   - Commit changes with clear messages referencing the feedback
   - Push updates to the PR branch

4. **Verification**
   - Verify that all feedback has been addressed
   - Run tests to ensure no regressions
   - Review the changes yourself before requesting re-review

5. **Re-review Request**
   - Request re-review from the original reviewers
   - Highlight the changes made in response to feedback
   - Address any follow-up feedback

#### Decision Points and Branching Paths

- **Feedback Agreement Decision**
  - If you agree with feedback → Implement as suggested
  - If you disagree → Discuss alternatives with reviewer

- **Implementation Approach Decision**
  - If feedback requires significant changes → Consider new approach or breaking into multiple PRs
  - If feedback requires minor changes → Address directly in the current PR

- **Follow-up Decision**
  - If some feedback is out of scope → Create follow-up issues
  - If all feedback can be addressed now → Complete in current PR

#### Common Pitfalls and How to Avoid Them

- **Pitfall**: Defensive response to feedback
  - **Solution**: Approach feedback as an opportunity to improve, not criticism

- **Pitfall**: Addressing only explicit feedback while missing implied issues
  - **Solution**: Consider the underlying concerns behind the feedback

- **Pitfall**: Implementing feedback without understanding the rationale
  - **Solution**: Seek clarification on the reasoning behind feedback

- **Pitfall**: Making unrelated changes while implementing feedback
  - **Solution**: Stay focused on addressing the specific feedback

#### Best Practices and Efficiency Tips

- Respond to all feedback, even if just to acknowledge
- Group related feedback items for more efficient implementation
- Test changes thoroughly after implementing feedback
- Use the opportunity to learn and improve your skills
- Thank reviewers for helpful feedback
- Document why certain feedback was not implemented if applicable
- Use feedback patterns to improve your initial submissions over time

