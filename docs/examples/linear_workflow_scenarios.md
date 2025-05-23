# Common Linear Workflow Scenarios and Examples

## Table of Contents

1. [Introduction](#introduction)
2. [Simple Task Workflow](#simple-task-workflow)
3. [Research and Analysis Workflow](#research-and-analysis-workflow)
4. [Complex Implementation Workflow](#complex-implementation-workflow)
5. [Multi-Agent Delegation Workflow](#multi-agent-delegation-workflow)
6. [Bug Investigation and Resolution Workflow](#bug-investigation-and-resolution-workflow)
7. [Best Practices for Linear Workflows](#best-practices-for-linear-workflows)
8. [References](#references)

## Introduction

This document provides detailed examples of common Linear workflow scenarios that agents encounter when working on tasks. Each scenario includes a clear description, step-by-step workflow, key tools and commands used, example code or commands where applicable, and best practices and tips.

These examples are designed to complement the [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md) and provide practical guidance for implementing effective Linear workflows in various contexts.

## Simple Task Workflow

### Scenario: Feature Implementation

**Description:** A straightforward task to implement a new feature with clear requirements and minimal dependencies.

#### Step-by-Step Workflow

1. **Initial Assessment and Planning**
   - Review issue description and requirements
   - Identify necessary code changes
   - Plan implementation approach

2. **Environment Setup**
   - Self-assign the issue
   - Update issue state to "In Progress"
   - Create a feature branch

3. **Implementation**
   - Make code changes
   - Add tests
   - Ensure code quality

4. **Review and Submission**
   - Create a pull request
   - Link PR to Linear issue
   - Update issue state

#### Key Tools and Commands

```bash
# Self-assign the issue
linear_self_assign()

# Update issue state to "In Progress"
linear_update_issue(
  issue_id="ISSUE_ID",
  state_id="IN_PROGRESS_STATE_ID"
)

# Create feature branch
git checkout -b codegen-bot/feature-name-{unique-id}

# Create PR and link to issue
create_pr(
  title="Implement Feature X",
  body="This PR implements Feature X as described in [ISSUE-ID].",
  head_branch="codegen-bot/feature-name-{unique-id}"
)

# Attach PR link to issue
linear_attach_link(
  title="GitHub PR: Implement Feature X",
  url="https://github.com/org/repo/pull/123"
)
```

#### Example: Adding a User Profile Component

```javascript
// Example code for implementing a user profile component
import React from 'react';
import { Avatar, Card, Typography } from './components';

export const UserProfile = ({ user }) => {
  return (
    <Card className="user-profile">
      <Avatar src={user.avatarUrl} alt={user.name} size="large" />
      <Typography variant="h2">{user.name}</Typography>
      <Typography variant="body">{user.bio}</Typography>
      <div className="user-stats">
        <div className="stat">
          <Typography variant="label">Followers</Typography>
          <Typography variant="number">{user.followers}</Typography>
        </div>
        <div className="stat">
          <Typography variant="label">Following</Typography>
          <Typography variant="number">{user.following}</Typography>
        </div>
      </div>
    </Card>
  );
};
```

#### Best Practices and Tips

- **Clear Commits**: Make focused, atomic commits with descriptive messages
- **Comprehensive Testing**: Include unit tests for new functionality
- **Documentation**: Update relevant documentation for the new feature
- **Regular Updates**: Provide brief progress updates on the Linear issue
- **Acceptance Criteria**: Verify implementation against all acceptance criteria before submission

## Research and Analysis Workflow

### Scenario: Technology Evaluation

**Description:** Researching and evaluating a new technology or approach to determine its suitability for a project.

#### Step-by-Step Workflow

1. **Scope Definition**
   - Clarify research objectives
   - Define evaluation criteria
   - Identify key questions to answer

2. **Research Setup**
   - Self-assign the issue
   - Update issue state
   - Create a document structure for findings

3. **Information Gathering**
   - Collect relevant information from multiple sources
   - Organize findings by category
   - Document key insights

4. **Analysis and Recommendations**
   - Analyze findings against evaluation criteria
   - Develop recommendations
   - Create a comprehensive report

5. **Presentation and Submission**
   - Format research for readability
   - Submit findings via Linear
   - Update issue state

#### Key Tools and Commands

```bash
# Self-assign the research issue
linear_self_assign()

# Update issue state
linear_update_issue(
  issue_id="ISSUE_ID",
  state_id="IN_PROGRESS_STATE_ID"
)

# Web search for information
exa_web_search(
  query="technology X performance benchmarks",
  max_results=5
)

# View specific resources
exa_web_view_page(
  url="https://example.com/technology-documentation"
)

# Comment with progress update
linear_comment_on_issue(
  issue_id="ISSUE_ID",
  body="Completed initial research phase. Key findings so far:\n- Finding 1\n- Finding 2\n\nMoving to analysis phase next."
)
```

#### Example: Technology Evaluation Report Structure

```markdown
# Evaluation of GraphQL for API Development

## Executive Summary
Brief overview of findings and recommendations

## Evaluation Criteria
- Performance
- Developer Experience
- Client Integration
- Scalability
- Security

## Analysis
### Performance
Detailed findings on performance characteristics...

### Developer Experience
Findings on developer experience and tooling...

### Client Integration
Analysis of integration options with current client applications...

### Scalability
Evaluation of scalability characteristics and limitations...

### Security
Assessment of security considerations and best practices...

## Recommendations
Clear recommendations based on the analysis...

## Implementation Considerations
Key considerations for potential implementation...

## References
List of sources and references...
```

#### Best Practices and Tips

- **Structured Approach**: Use a consistent structure for research and reporting
- **Multiple Sources**: Gather information from diverse, credible sources
- **Objective Analysis**: Evaluate options against clear, objective criteria
- **Practical Examples**: Include concrete examples to illustrate key points
- **Clear Recommendations**: Provide actionable recommendations with rationale
- **Regular Updates**: Share interim findings and progress updates

## Complex Implementation Workflow

### Scenario: System Architecture Redesign

**Description:** Implementing significant architectural changes that affect multiple components and require careful planning and coordination.

#### Step-by-Step Workflow

1. **Comprehensive Planning**
   - Analyze requirements and constraints
   - Create a detailed implementation plan
   - Identify potential risks and mitigation strategies

2. **Task Breakdown**
   - Break down the implementation into manageable sub-tasks
   - Identify dependencies between sub-tasks
   - Create a logical sequence for implementation

3. **Environment Setup**
   - Self-assign the issue
   - Update issue state
   - Create a base branch for the implementation

4. **Incremental Implementation**
   - Implement changes in logical, incremental steps
   - Maintain working state at each step
   - Document architectural decisions

5. **Integration and Testing**
   - Integrate components
   - Perform comprehensive testing
   - Address any integration issues

6. **Review and Submission**
   - Create a pull request with detailed documentation
   - Link PR to Linear issue
   - Update issue state

#### Key Tools and Commands

```bash
# Self-assign the issue
linear_self_assign()

# Update issue state
linear_update_issue(
  issue_id="ISSUE_ID",
  state_id="IN_PROGRESS_STATE_ID"
)

# Create implementation branch
git checkout -b codegen-bot/architecture-redesign-{unique-id}

# Create sub-issues for complex tasks
linear_create_issue(
  title="Implement Data Access Layer",
  description="Create a new data access layer as part of the architecture redesign...",
  parent_issue_id="PARENT_ISSUE_ID"
)

# Attach architecture diagram
linear_attach_link(
  title="Architecture Diagram",
  url="https://link-to-diagram"
)

# Create PR with detailed description
create_pr(
  title="Implement Architecture Redesign",
  body="This PR implements the architecture redesign as described in [ISSUE-ID].\n\n## Changes\n- Component A refactored to use new pattern\n- Component B migrated to new data access layer\n- Added integration tests\n\n## Architecture Decisions\n- Decision 1: Rationale...\n- Decision 2: Rationale...",
  head_branch="codegen-bot/architecture-redesign-{unique-id}"
)
```

#### Example: Architecture Decision Record

```markdown
# Architecture Decision Record: Data Access Layer Pattern

## Context
The current system mixes data access logic with business logic, making it difficult to maintain and test. We need to establish a clear separation of concerns.

## Decision
We will implement a Repository pattern for data access with the following components:
- Entity models representing domain objects
- Repository interfaces defining data access operations
- Repository implementations handling data storage and retrieval
- Service layer consuming repositories for business operations

## Consequences
### Positive
- Clear separation of concerns
- Improved testability through dependency injection
- Consistent data access patterns across the application
- Ability to change data sources with minimal impact

### Negative
- Additional abstraction layer increases initial development time
- Potential for over-engineering simple data access scenarios

## Implementation
```

#### Best Practices and Tips

- **Incremental Changes**: Implement and test changes in small, manageable increments
- **Comprehensive Documentation**: Document architectural decisions and their rationale
- **Consistent Patterns**: Apply consistent patterns across all affected components
- **Thorough Testing**: Test both individual components and their integration
- **Clear Communication**: Provide detailed updates on progress and challenges
- **Rollback Plan**: Maintain the ability to roll back changes if issues arise

## Multi-Agent Delegation Workflow

### Scenario: Large Feature Development with Multiple Components

**Description:** Developing a complex feature that requires work across multiple components, delegated to multiple agents with specialized expertise.

#### Step-by-Step Workflow

1. **Task Analysis and Planning**
   - Analyze the overall feature requirements
   - Identify logical components for delegation
   - Create a coordination plan

2. **Sub-Task Creation**
   - Create detailed sub-issues for each component
   - Define clear boundaries between sub-tasks
   - Establish dependencies and integration points

3. **Delegation Setup**
   - Self-assign parent issue
   - Create a base branch for the feature
   - Provide scaffolding and integration points

4. **Coordination and Monitoring**
   - Monitor progress of sub-tasks
   - Address blockers and dependencies
   - Ensure consistent approaches across components

5. **Integration**
   - Integrate work from sub-agents
   - Resolve any integration issues
   - Ensure end-to-end functionality

6. **Review and Submission**
   - Create a unified pull request
   - Link PR to parent issue
   - Update issue state

#### Key Tools and Commands

```bash
# Self-assign parent issue
linear_self_assign()

# Update parent issue state
linear_update_issue(
  issue_id="PARENT_ISSUE_ID",
  state_id="IN_PROGRESS_STATE_ID"
)

# Create base branch
git checkout -b codegen-bot/feature-parent-{unique-id}

# Create sub-issues with detailed context
linear_create_issue(
  title="Implement Frontend Component for Feature X",
  description="Create the frontend component for Feature X with the following requirements:\n\n- Requirement 1\n- Requirement 2\n\n## Integration Points\n- API endpoint: `/api/feature-x`\n- Data format: `{...}`\n\n## Branch Information\nBase your work on the branch `codegen-bot/feature-parent-{unique-id}`",
  parent_issue_id="PARENT_ISSUE_ID"
)

# Monitor sub-issue progress
linear_get_issue(
  issue_id="SUB_ISSUE_ID"
)

# Integrate sub-agent work
git checkout codegen-bot/feature-parent-{unique-id}
git merge codegen-bot/feature-child-1-{unique-id}
git merge codegen-bot/feature-child-2-{unique-id}

# Create unified PR
create_pr(
  title="Implement Feature X",
  body="This PR implements Feature X as described in [PARENT-ISSUE-ID].\n\nIt includes work from the following sub-issues:\n- [SUB-ISSUE-1]: Frontend component\n- [SUB-ISSUE-2]: Backend API\n- [SUB-ISSUE-3]: Database schema",
  head_branch="codegen-bot/feature-parent-{unique-id}"
)
```

#### Example: Sub-Issue Template

```markdown
# Implement Backend API for Feature X

## Context
This sub-issue is part of the larger Feature X implementation. The backend API will provide data to the frontend component and interact with the database.

## Requirements
- Create RESTful API endpoints for Feature X
- Implement authentication and authorization
- Ensure proper error handling and validation
- Follow existing API patterns and conventions

## Integration Points
- Frontend expects API at `/api/feature-x`
- Database schema defined in sub-issue [SUB-ISSUE-3]
- Authentication using existing JWT mechanism

## Acceptance Criteria
- All endpoints implemented according to specification
- Unit tests with >90% coverage
- Integration tests for key workflows
- Documentation updated with new endpoints

## Branch Information
Base your work on the branch `codegen-bot/feature-parent-{unique-id}`
Create a new branch named `codegen-bot/feature-child-2-{unique-id}`
```

#### Best Practices and Tips

- **Clear Boundaries**: Define clear boundaries between sub-tasks to minimize conflicts
- **Detailed Context**: Provide comprehensive context in each sub-issue
- **Integration Planning**: Identify integration points and dependencies upfront
- **Consistent Patterns**: Establish consistent patterns and conventions across components
- **Regular Synchronization**: Regularly integrate work to identify issues early
- **Centralized Decision-Making**: Maintain centralized decision-making for cross-cutting concerns
- **Documentation**: Document integration points and interfaces between components

## Bug Investigation and Resolution Workflow

### Scenario: Critical Production Bug

**Description:** Investigating and resolving a critical bug affecting production systems, requiring urgent attention and careful resolution.

#### Step-by-Step Workflow

1. **Initial Assessment**
   - Understand the bug report and impact
   - Identify affected components
   - Determine priority and urgency

2. **Investigation Setup**
   - Self-assign the issue
   - Update issue state
   - Create a bugfix branch

3. **Root Cause Analysis**
   - Reproduce the issue
   - Analyze logs and error reports
   - Identify the root cause

4. **Solution Development**
   - Develop a fix for the issue
   - Create tests to verify the fix
   - Ensure no regression

5. **Review and Submission**
   - Create a pull request with detailed explanation
   - Link PR to Linear issue
   - Update issue state

6. **Documentation and Follow-up**
   - Document the issue and resolution
   - Identify preventive measures
   - Update relevant documentation

#### Key Tools and Commands

```bash
# Self-assign the bug issue
linear_self_assign()

# Update issue state to "In Progress"
linear_update_issue(
  issue_id="ISSUE_ID",
  state_id="IN_PROGRESS_STATE_ID"
)

# Create bugfix branch
git checkout -b codegen-bot/bugfix-{issue-id}-{unique-id}

# Search for relevant code
ripgrep_search(
  query="affected function or pattern",
  file_extensions=[".js", ".ts"]
)

# Run tests to verify issue
run_command(
  command="npm test -- --grep='affected functionality'"
)

# Create PR with detailed explanation
create_pr(
  title="Fix: Description of the bug fix",
  body="This PR fixes the issue described in [ISSUE-ID].\n\n## Root Cause\nDetailed explanation of the root cause...\n\n## Fix\nExplanation of the fix and why it resolves the issue...\n\n## Testing\nSteps taken to verify the fix...",
  head_branch="codegen-bot/bugfix-{issue-id}-{unique-id}"
)

# Attach PR link to issue
linear_attach_link(
  title="GitHub PR: Fix for Issue",
  url="https://github.com/org/repo/pull/123"
)
```

#### Example: Bug Investigation Report

```markdown
# Bug Investigation: Authentication Timeout Issues

## Issue Description
Users are being logged out unexpectedly after approximately 30 minutes of activity, despite having the "Remember Me" option selected.

## Investigation Steps

### 1. Reproduction
- Confirmed the issue occurs consistently after 30 minutes
- Verified it happens across different browsers and devices
- Confirmed "Remember Me" checkbox is properly sending data to backend

### 2. Log Analysis
- Examined authentication service logs
- Found JWT tokens are being issued with 30-minute expiration regardless of "Remember Me" setting
- Identified the configuration setting controlling token expiration

### 3. Code Review
- Reviewed authentication service code
- Found that the "Remember Me" flag is captured but not used when setting token expiration
- Identified the specific function where the issue occurs

## Root Cause
The issue is in the `generateToken` function in `auth-service.js`. The function captures the "Remember Me" parameter but always uses the default expiration time from configuration:

```javascript
function generateToken(user, rememberMe) {
  // rememberMe parameter is captured but not used
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: config.auth.tokenExpiration } // Always uses default (30m)
  );
}
```

## Fix Implementation
Modified the function to use different expiration times based on the "Remember Me" setting:

```javascript
function generateToken(user, rememberMe) {
  const expirationTime = rememberMe 
    ? config.auth.extendedTokenExpiration // 30d for "Remember Me"
    : config.auth.standardTokenExpiration; // 30m for standard session
    
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: expirationTime }
  );
}
```

## Testing
- Added unit tests for both scenarios
- Manually verified token expiration with and without "Remember Me"
- Confirmed fix resolves the issue without side effects
```

#### Best Practices and Tips

- **Systematic Investigation**: Follow a structured approach to bug investigation
- **Detailed Documentation**: Document the issue, investigation steps, and resolution
- **Root Cause Focus**: Identify and fix the root cause, not just the symptoms
- **Comprehensive Testing**: Test the fix thoroughly to ensure it resolves the issue
- **Regression Prevention**: Add tests to prevent regression in the future
- **Knowledge Sharing**: Document the issue and resolution for future reference
- **Follow-up Actions**: Identify and implement preventive measures

## Best Practices for Linear Workflows

### General Best Practices

1. **Clear Communication**
   - Provide regular, concise updates on progress
   - Use consistent formatting in comments and descriptions
   - Tag relevant stakeholders in important updates
   - Document key decisions and their rationale

2. **Effective Task Management**
   - Break down complex tasks into manageable sub-issues
   - Establish clear dependencies between related tasks
   - Use labels consistently to categorize issues
   - Maintain up-to-date issue states

3. **Code Management**
   - Follow consistent branch naming conventions
   - Make focused, atomic commits with descriptive messages
   - Link PRs to Linear issues for traceability
   - Document code changes thoroughly

4. **Documentation**
   - Document implementation details and decisions
   - Update relevant documentation as part of task completion
   - Provide clear, concise summaries of completed work
   - Include examples and context for future reference

5. **Quality Assurance**
   - Include comprehensive tests for all changes
   - Verify implementation against acceptance criteria
   - Conduct thorough code reviews
   - Address feedback promptly and thoroughly

### Workflow-Specific Best Practices

#### For Simple Tasks
- Focus on clean, efficient implementation
- Verify against all acceptance criteria
- Include appropriate tests
- Document any non-obvious implementation details

#### For Research Tasks
- Use a structured approach to research and reporting
- Provide objective analysis based on clear criteria
- Include practical examples and applications
- Offer clear, actionable recommendations

#### For Complex Implementations
- Plan thoroughly before implementation
- Break down into manageable increments
- Document architectural decisions
- Maintain working state throughout implementation
- Conduct regular integration testing

#### For Multi-Agent Delegation
- Define clear boundaries between sub-tasks
- Establish consistent patterns and conventions
- Identify integration points upfront
- Maintain centralized decision-making for cross-cutting concerns
- Regularly integrate work to identify issues early

#### For Bug Resolution
- Focus on root cause identification
- Document investigation process and findings
- Ensure comprehensive testing of the fix
- Identify and implement preventive measures

## References

- [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md)
- [Linear Workflow Decision Diagram](../reference/linear_workflow_diagram.md)
- [Communication and Delegation SOPs](../reference/communication_delegation_sops.md)
- [Agent Collaboration Workflow](../src/content/docs/reference/agent_collaboration_workflow.md)

