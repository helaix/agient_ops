# Linear Workflow Guide: Complex Tasks

## Table of Contents

1. [Introduction](#introduction)
2. [What is a Complex Task?](#what-is-a-complex-task)
3. [Step-by-Step Workflow](#step-by-step-workflow)
4. [Example: New Feature Implementation](#example-new-feature-implementation)
5. [Example: System Refactoring](#example-system-refactoring)
6. [Example: Performance Optimization](#example-performance-optimization)
7. [Best Practices](#best-practices)
8. [Common Pitfalls](#common-pitfalls)
9. [Related Resources](#related-resources)

## Introduction

This guide provides a comprehensive workflow for handling complex tasks in Linear. Complex tasks typically involve multiple steps, require careful planning, and may take longer to complete than simple tasks. However, they can still be completed by a single agent without delegation. This guide includes step-by-step instructions, real-world examples, and best practices to help you efficiently complete complex tasks.

## What is a Complex Task?

A complex task is characterized by:


- **Scope**: Broader scope with multiple components or aspects

- **Complexity**: Moderate to high complexity

- **Dependencies**: May have dependencies on other systems or components

- **Time**: Typically requires multiple sessions to complete

- **Planning**: Requires significant planning and organization

- **Risk**: Higher risk of complications or unexpected challenges

Examples of complex tasks include:

- Implementing new features with multiple components

- Significant refactoring of existing systems

- Performance optimization across multiple components

- Integration of new third-party services

- Implementation of complex algorithms or business logic

## Step-by-Step Workflow

### 1. Task Analysis and Planning


```

When assigned a complex task:

- Read the issue description thoroughly

- Break down the task into logical components or steps

- Identify dependencies between components

- Create a detailed implementation plan

- Estimate time requirements for each component

- Share your plan for feedback


```

**Example**:

```

linear_self_assign()
linear_update_issue(issue_id="ISSUE_ID", state_id="IN_PROGRESS_STATE_ID")
linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="I've analyzed this task and will implement the user profile feature. Here's my implementation plan:\n\n1. Database schema updates (estimated: 2 hours)\n2. Backend API endpoints (estimated: 4 hours)\n3. Authentication integration (estimated: 3 hours)\n4. Frontend components (estimated: 5 hours)\n5. Testing and documentation (estimated: 3 hours)\n\nTotal estimated time: 17 hours\n\nI'll start with the database schema updates and provide regular progress updates."
)

```

### 2. Setup and Scaffolding


```

- Create a branch with an appropriate naming convention

- Set up the necessary development environment

- Create any required scaffolding or boilerplate

- Establish testing frameworks or utilities


```

**Example**:

```

git checkout -b codegen-bot/feature-ABC-123-user-profile

# Set up scaffolding

mkdir -p src/components/UserProfile
mkdir -p src/api/userProfile
mkdir -p src/tests/userProfile
touch src/components/UserProfile/index.js
touch src/components/UserProfile/UserProfile.js
touch src/components/UserProfile/UserProfile.css
touch src/api/userProfile/index.js
touch src/tests/userProfile/UserProfile.test.js

git add .
git commit -m "Add scaffolding for user profile feature (ABC-123)"

```

### 3. Incremental Implementation


```

- Implement each component or step from your plan

- Complete one logical unit before moving to the next

- Make regular, focused commits with clear messages

- Provide progress updates after significant milestones


```

**Example**:

```

# Implement database schema

# ... code changes ...
git add .
git commit -m "Add user profile database schema (ABC-123)"

# Implement API endpoints

# ... code changes ...
git add .
git commit -m "Add user profile API endpoints (ABC-123)"

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Progress update: Completed database schema and API endpoints (items 1-2 in the plan). Moving on to authentication integration."
)

# Implement authentication integration

# ... code changes ...
git add .
git commit -m "Integrate authentication with user profile (ABC-123)"

# Implement frontend components

# ... code changes ...
git add .
git commit -m "Add user profile frontend components (ABC-123)"

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Progress update: Completed authentication integration and frontend components (items 3-4 in the plan). Moving on to testing and documentation."
)

```

### 4. Integration and Testing


```

- Ensure all components work together correctly

- Write comprehensive tests for all components

- Test edge cases and error scenarios

- Verify the implementation meets all requirements

- Address any integration issues


```

**Example**:

```

# Write tests

# ... code changes ...
git add .
git commit -m "Add tests for user profile feature (ABC-123)"

# Fix integration issues

# ... code changes ...
git add .
git commit -m "Fix user profile integration issues (ABC-123)"

# Run tests

npm test

```

### 5. Documentation and Finalization


```

- Update or create documentation

- Add inline code comments where necessary

- Create usage examples or guides if applicable

- Ensure the code is clean and follows best practices

- Perform a final review of all changes


```

**Example**:

```

# Add documentation

# ... code changes ...
git add .
git commit -m "Add documentation for user profile feature (ABC-123)"

# Final cleanup

# ... code changes ...
git add .
git commit -m "Clean up user profile code (ABC-123)"

```

### 6. Submission


```

- Push changes to the remote branch

- Create a detailed PR with implementation notes

- Link the PR to the Linear issue

- Update the issue state to "Ready for Review"


```

**Example**:

```

git push -u origin codegen-bot/feature-ABC-123-user-profile

create_pr(
    title="Implement User Profile Feature",
    body="This PR implements the user profile feature as described in ABC-123.\n\n## Implementation Details\n\n### Database Changes\n- Added user_profiles table\n- Added foreign key relationship to users table\n\n### API Endpoints\n- GET /api/users/:id/profile\n- PUT /api/users/:id/profile\n- PATCH /api/users/:id/profile/avatar\n\n### Frontend Components\n- UserProfile container\n- ProfileForm component\n- AvatarUploader component\n\n### Testing\n- Added unit tests for all components\n- Added API integration tests\n\n## Screenshots\n[Include screenshots here]\n\nCloses ABC-123",
    head_branch="codegen-bot/feature-ABC-123-user-profile"
)

linear_attach_link(
    title="PR: Implement User Profile Feature",
    url="https://github.com/org/repo/pull/123"
)
linear_update_issue(issue_id="ISSUE_ID", state_id="READY_FOR_REVIEW_STATE_ID")

```

## Example: New Feature Implementation

### Scenario: Implement Multi-Factor Authentication

**Issue Description**:

```

Title: Implement Multi-Factor Authentication
Description: We need to add multi-factor authentication (MFA) to our application. This should include:
1. Support for authenticator apps (TOTP)
2. SMS verification as a fallback
3. Recovery codes for account access
4. User interface for enabling/disabling MFA
5. Admin controls for requiring MFA for certain user roles

```

### Workflow Implementation:

1. **Task Analysis and Planning**

```

linear_self_assign()
linear_update_issue(issue_id="ISSUE_ID", state_id="IN_PROGRESS_STATE_ID")
linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="I'll implement the MFA feature. Here's my implementation plan:\n\n1. Research and select MFA libraries (estimated: 4 hours)\n2. Database schema updates for MFA data (estimated: 2 hours)\n3. Backend implementation:\n   - TOTP implementation (estimated: 6 hours)\n   - SMS verification (estimated: 4 hours)\n   - Recovery codes (estimated: 3 hours)\n4. Frontend implementation:\n   - MFA setup wizard (estimated: 8 hours)\n   - MFA verification flow (estimated: 6 hours)\n   - Recovery code management (estimated: 4 hours)\n5. Admin controls (estimated: 5 hours)\n6. Testing and documentation (estimated: 8 hours)\n\nTotal estimated time: 50 hours\n\nI'll start with research and database schema updates."
)

```

2. **Setup and Scaffolding**

```

git checkout -b codegen-bot/feature-DEF-456-multi-factor-auth

# Set up project structure

mkdir -p src/components/MFA
mkdir -p src/api/mfa
mkdir -p src/utils/mfa
mkdir -p src/tests/mfa
touch src/components/MFA/index.js
touch src/components/MFA/SetupWizard.js
touch src/components/MFA/VerificationFlow.js
touch src/components/MFA/RecoveryCodes.js
touch src/api/mfa/index.js
touch src/utils/mfa/totp.js
touch src/utils/mfa/sms.js
touch src/utils/mfa/recovery.js
touch src/tests/mfa/mfa.test.js

git add .
git commit -m "Add scaffolding for MFA feature (DEF-456)"

```

3. **Incremental Implementation**

```

# Research and select libraries

# ... research documentation ...
linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Research complete. I've decided to use the following libraries:\n- otplib for TOTP implementation\n- twilio for SMS verification\n- crypto for recovery code generation"
)

# Database schema updates

# ... code changes ...
git add .
git commit -m "Add database schema for MFA (DEF-456)"

# TOTP implementation

# ... code changes ...
git add .
git commit -m "Implement TOTP authentication (DEF-456)"

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Progress update: Completed research, database schema, and TOTP implementation. Moving on to SMS verification."
)

# SMS verification

# ... code changes ...
git add .
git commit -m "Implement SMS verification (DEF-456)"

# Recovery codes

# ... code changes ...
git add .
git commit -m "Implement recovery codes (DEF-456)"

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Progress update: Completed backend implementation (TOTP, SMS, recovery codes). Moving on to frontend implementation."
)

# Frontend implementation

# ... code changes ...
git add .
git commit -m "Implement MFA setup wizard (DEF-456)"
git add .
git commit -m "Implement MFA verification flow (DEF-456)"
git add .
git commit -m "Implement recovery code management (DEF-456)"

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Progress update: Completed frontend implementation. Moving on to admin controls."
)

# Admin controls

# ... code changes ...
git add .
git commit -m "Implement admin controls for MFA (DEF-456)"

```

4. **Integration and Testing**

```

# Write tests

# ... code changes ...
git add .
git commit -m "Add tests for MFA feature (DEF-456)"

# Fix integration issues

# ... code changes ...
git add .
git commit -m "Fix MFA integration issues (DEF-456)"

# Run tests

npm test

```

5. **Documentation and Finalization**

```

# Add documentation

# ... code changes ...
git add .
git commit -m "Add documentation for MFA feature (DEF-456)"

# Final cleanup

# ... code changes ...
git add .
git commit -m "Clean up MFA code (DEF-456)"

```

6. **Submission**

```

git push -u origin codegen-bot/feature-DEF-456-multi-factor-auth

create_pr(
    title="Implement Multi-Factor Authentication",
    body="This PR implements multi-factor authentication as described in DEF-456.\n\n## Implementation Details\n\n### Libraries Used\n- otplib for TOTP implementation\n- twilio for SMS verification\n- crypto for recovery code generation\n\n### Database Changes\n- Added user_mfa_methods table\n- Added user_recovery_codes table\n- Added mfa_required field to user_roles table\n\n### Backend Implementation\n- TOTP generation and verification\n- SMS sending and verification\n- Recovery code generation and management\n\n### Frontend Implementation\n- MFA setup wizard with QR code for TOTP\n- MFA verification flow during login\n- Recovery code management UI\n- Admin controls for requiring MFA\n\n### Testing\n- Unit tests for all components\n- Integration tests for the full MFA flow\n\n## Screenshots\n[Include screenshots here]\n\nCloses DEF-456",
    head_branch="codegen-bot/feature-DEF-456-multi-factor-auth"
)

linear_attach_link(
    title="PR: Implement Multi-Factor Authentication",
    url="https://github.com/org/repo/pull/456"
)
linear_update_issue(issue_id="ISSUE_ID", state_id="READY_FOR_REVIEW_STATE_ID")

```

## Example: System Refactoring

### Scenario: Refactor Authentication System

**Issue Description**:

```

Title: Refactor Authentication System
Description: Our current authentication system is tightly coupled with the rest of the application and uses outdated patterns. We need to refactor it to:
1. Use a modern authentication library
2. Implement proper separation of concerns
3. Support multiple authentication providers
4. Improve testability
5. Maintain backward compatibility with existing sessions

```

### Workflow Implementation:

1. **Task Analysis and Planning**

```

linear_self_assign()
linear_update_issue(issue_id="ISSUE_ID", state_id="IN_PROGRESS_STATE_ID")
linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="I'll refactor the authentication system. Here's my implementation plan:\n\n1. Analysis of current system (estimated: 6 hours)\n2. Design new architecture (estimated: 8 hours)\n3. Implementation:\n   - Core authentication service (estimated: 10 hours)\n   - Provider interfaces (estimated: 6 hours)\n   - Session management (estimated: 8 hours)\n   - Migration utilities (estimated: 6 hours)\n4. Integration with existing code (estimated: 12 hours)\n5. Testing and validation (estimated: 10 hours)\n6. Documentation (estimated: 4 hours)\n\nTotal estimated time: 70 hours\n\nI'll start with analysis of the current system."
)

```

2. **Setup and Scaffolding**

```

git checkout -b codegen-bot/refactor-GHI-789-auth-system

# Create new directory structure

mkdir -p src/auth/core
mkdir -p src/auth/providers
mkdir -p src/auth/session
mkdir -p src/auth/migration
mkdir -p src/tests/auth

git add .
git commit -m "Add scaffolding for auth system refactoring (GHI-789)"

```

3. **Incremental Implementation**

```

# Analysis documentation

# ... code changes ...
git add .
git commit -m "Add analysis of current auth system (GHI-789)"

# Architecture design

# ... code changes ...
git add .
git commit -m "Add architecture design for new auth system (GHI-789)"

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Completed analysis and architecture design. Key findings:\n- Current system is tightly coupled with UI components\n- Authentication logic is scattered across multiple modules\n- No clear separation between auth providers\n\nNew architecture will:\n- Use a centralized AuthService\n- Implement provider interfaces for different auth methods\n- Use a session manager for consistent session handling\n- Include migration utilities for backward compatibility"
)

# Core authentication service

# ... code changes ...
git add .
git commit -m "Implement core authentication service (GHI-789)"

# Provider interfaces

# ... code changes ...
git add .
git commit -m "Implement provider interfaces (GHI-789)"

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Progress update: Completed core authentication service and provider interfaces. Moving on to session management."
)

# Session management

# ... code changes ...
git add .
git commit -m "Implement session management (GHI-789)"

# Migration utilities

# ... code changes ...
git add .
git commit -m "Implement migration utilities (GHI-789)"

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Progress update: Completed session management and migration utilities. Moving on to integration with existing code."
)

# Integration with existing code

# ... code changes ...
git add .
git commit -m "Integrate new auth system with existing code (GHI-789)"

```

4. **Integration and Testing**

```

# Write tests

# ... code changes ...
git add .
git commit -m "Add tests for new auth system (GHI-789)"

# Fix integration issues

# ... code changes ...
git add .
git commit -m "Fix auth system integration issues (GHI-789)"

# Run tests

npm test

```

5. **Documentation and Finalization**

```

# Add documentation

# ... code changes ...
git add .
git commit -m "Add documentation for new auth system (GHI-789)"

# Final cleanup

# ... code changes ...
git add .
git commit -m "Clean up auth system code (GHI-789)"

```

6. **Submission**

```

git push -u origin codegen-bot/refactor-GHI-789-auth-system

create_pr(
    title="Refactor Authentication System",
    body="This PR refactors the authentication system as described in GHI-789.\n\n## Implementation Details\n\n### Architecture Changes\n- Implemented a centralized AuthService\n- Created provider interfaces for different auth methods\n- Implemented a SessionManager for consistent session handling\n- Added migration utilities for backward compatibility\n\n### Key Improvements\n- Proper separation of concerns\n- Support for multiple authentication providers\n- Improved testability with dependency injection\n- Maintained backward compatibility with existing sessions\n\n### Migration Strategy\n- New sessions use the new system automatically\n- Existing sessions are migrated on first use\n- Fallback mechanism for legacy sessions\n\n### Testing\n- Unit tests for all components\n- Integration tests for auth flows\n- Migration tests for backward compatibility\n\n## Diagrams\n[Include architecture diagrams here]\n\nCloses GHI-789",
    head_branch="codegen-bot/refactor-GHI-789-auth-system"
)

linear_attach_link(
    title="PR: Refactor Authentication System",
    url="https://github.com/org/repo/pull/789"
)
linear_update_issue(issue_id="ISSUE_ID", state_id="READY_FOR_REVIEW_STATE_ID")

```

## Example: Performance Optimization

### Scenario: Optimize Data Loading Performance

**Issue Description**:

```

Title: Optimize Data Loading Performance
Description: Our dashboard is loading too slowly, especially for users with large datasets. We need to optimize the data loading performance to:
1. Reduce initial load time by at least 50%
2. Implement progressive loading for large datasets
3. Add caching for frequently accessed data
4. Optimize API queries to reduce payload size
5. Add loading indicators for better user experience

```

### Workflow Implementation:

1. **Task Analysis and Planning**

```

linear_self_assign()
linear_update_issue(issue_id="ISSUE_ID", state_id="IN_PROGRESS_STATE_ID")
linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="I'll optimize the dashboard data loading performance. Here's my implementation plan:\n\n1. Performance profiling and analysis (estimated: 8 hours)\n2. API optimization:\n   - Query optimization (estimated: 6 hours)\n   - Payload reduction (estimated: 4 hours)\n3. Frontend optimization:\n   - Progressive loading implementation (estimated: 10 hours)\n   - Caching implementation (estimated: 8 hours)\n   - Loading indicators (estimated: 4 hours)\n4. Testing and validation (estimated: 8 hours)\n5. Documentation (estimated: 2 hours)\n\nTotal estimated time: 50 hours\n\nI'll start with performance profiling to identify the bottlenecks."
)

```

2. **Setup and Scaffolding**

```

git checkout -b codegen-bot/optimize-JKL-101-data-loading

# Set up performance testing tools

npm install --save-dev lighthouse puppeteer
touch performance-tests/dashboard-loading.js

git add .
git commit -m "Add performance testing setup (JKL-101)"

```

3. **Incremental Implementation**

```

# Performance profiling

# ... code changes ...
git add .
git commit -m "Add performance profiling results (JKL-101)"

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Performance profiling complete. Key findings:\n- API queries are returning excessive data (full objects instead of needed fields)\n- Frontend is loading all data at once instead of progressively\n- No caching is implemented for repeated queries\n- Multiple redundant API calls for the same data\n- Rendering is blocked during data loading\n\nI'll address these issues in the optimization."
)

# API query optimization

# ... code changes ...
git add .
git commit -m "Optimize API queries (JKL-101)"

# Payload reduction

# ... code changes ...
git add .
git commit -m "Reduce API payload size (JKL-101)"

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Progress update: Completed API optimizations. Reduced payload size by 68% by implementing field selection and pagination. Moving on to frontend optimizations."
)

# Progressive loading

# ... code changes ...
git add .
git commit -m "Implement progressive loading (JKL-101)"

# Caching implementation

# ... code changes ...
git add .
git commit -m "Implement data caching (JKL-101)"

# Loading indicators

# ... code changes ...
git add .
git commit -m "Add loading indicators (JKL-101)"

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Progress update: Completed frontend optimizations. Implemented progressive loading with virtualization, added caching with a TTL of 5 minutes, and improved loading indicators. Moving on to testing and validation."
)

```

4. **Integration and Testing**

```

# Performance testing

# ... code changes ...
git add .
git commit -m "Add performance tests (JKL-101)"

# Fix integration issues

# ... code changes ...
git add .
git commit -m "Fix optimization integration issues (JKL-101)"

# Run performance tests

node performance-tests/dashboard-loading.js

```

5. **Documentation and Finalization**

```

# Add documentation

# ... code changes ...
git add .
git commit -m "Add documentation for performance optimizations (JKL-101)"

# Final cleanup

# ... code changes ...
git add .
git commit -m "Clean up optimization code (JKL-101)"

```

6. **Submission**

```

git push -u origin codegen-bot/optimize-JKL-101-data-loading

create_pr(
    title="Optimize Dashboard Data Loading Performance",
    body="This PR optimizes the dashboard data loading performance as described in JKL-101.\n\n## Implementation Details\n\n### API Optimizations\n- Implemented field selection to reduce payload size\n- Added pagination for large datasets\n- Optimized database queries with proper indexing\n- Compressed API responses\n\n### Frontend Optimizations\n- Implemented progressive loading with virtualization\n- Added caching for frequently accessed data (TTL: 5 minutes)\n- Implemented skeleton loading indicators\n- Deferred non-critical data loading\n\n### Performance Improvements\n- Initial load time reduced by 72% (from 8.2s to 2.3s)\n- Time to interactive reduced by 65% (from 10.5s to 3.7s)\n- Memory usage reduced by 40%\n- Network payload reduced by 68%\n\n### Testing\n- Added automated performance tests\n- Tested with various dataset sizes\n- Verified improvements across different browsers\n\n## Performance Comparison\n[Include before/after performance metrics and charts]\n\nCloses JKL-101",
    head_branch="codegen-bot/optimize-JKL-101-data-loading"
)

linear_attach_link(
    title="PR: Optimize Dashboard Data Loading Performance",
    url="https://github.com/org/repo/pull/101"
)
linear_update_issue(issue_id="ISSUE_ID", state_id="READY_FOR_REVIEW_STATE_ID")

```

## Best Practices

1. **Thorough Planning**

   - Break down complex tasks into manageable components

   - Identify dependencies between components

   - Create a detailed implementation plan

   - Estimate time requirements realistically

2. **Regular Progress Updates**

   - Provide updates after completing significant milestones

   - Share challenges and how you're addressing them

   - Adjust timelines if necessary

   - Document key decisions and their rationale

3. **Incremental Implementation**

   - Complete one logical component before moving to the next

   - Make regular, focused commits

   - Ensure each component works correctly before integration

   - Test components individually before integration

4. **Comprehensive Testing**

   - Test each component thoroughly

   - Test integration between components

   - Test edge cases and error scenarios

   - Verify against all requirements

5. **Clear Documentation**

   - Document architecture and design decisions

   - Add inline code comments for complex logic

   - Create usage examples or guides

   - Document any limitations or future improvements

6. **Effective Communication**

   - Provide clear, detailed updates

   - Document challenges and solutions

   - Ask for feedback at key milestones

   - Respond promptly to questions or feedback

## Common Pitfalls

1. **Inadequate Planning**

   - Not breaking down the task sufficiently

   - Underestimating complexity or time requirements

   - Not identifying dependencies correctly

   - Rushing into implementation without a clear plan

2. **Scope Creep**

   - Adding unplanned features or improvements

   - Not adhering to the defined scope

   - Trying to solve too many problems at once

   - Not getting clarification on ambiguous requirements

3. **Integration Issues**

   - Not considering how components will work together

   - Implementing components in isolation without integration testing

   - Not addressing compatibility issues

   - Assuming components will integrate seamlessly

4. **Insufficient Testing**

   - Not testing edge cases

   - Not testing with realistic data

   - Not testing performance implications

   - Not testing error handling

5. **Poor Communication**

   - Not providing regular progress updates

   - Not documenting key decisions

   - Not asking for clarification when needed

   - Not reporting challenges promptly

## Related Resources


- [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md)

- [Linear Workflow Decision Diagram](../reference/linear_workflow_diagram.md)

- [Communication and Delegation SOPs](../reference/communication_delegation_sops.md)

- [Linear Workflow Guide: Simple Tasks](./linear_workflow_guide_simple_tasks.md)

- [Linear Workflow Guide: Delegation](./linear_workflow_guide_delegation.md)

- [Task Analysis Decision Tree](../decision_trees/task_analysis_decision_tree.md)

