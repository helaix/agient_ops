# Linear Workflow Guide: Simple Tasks

## Table of Contents

1. [Introduction](#introduction)
2. [What is a Simple Task?](#what-is-a-simple-task)
3. [Step-by-Step Workflow](#step-by-step-workflow)
4. [Example: Bug Fix](#example-bug-fix)
5. [Example: Documentation Update](#example-documentation-update)
6. [Example: Configuration Change](#example-configuration-change)
7. [Best Practices](#best-practices)
8. [Common Pitfalls](#common-pitfalls)
9. [Related Resources](#related-resources)

## Introduction

This guide provides a comprehensive workflow for handling simple tasks in Linear. Simple tasks are typically straightforward, self-contained assignments that can be completed by a single agent without delegation. This guide includes step-by-step instructions, real-world examples, and best practices to help you efficiently complete simple tasks.

## What is a Simple Task?

A simple task is characterized by:


- **Scope**: Well-defined, limited scope with clear boundaries

- **Complexity**: Low to moderate complexity

- **Dependencies**: Few or no dependencies on other tasks

- **Time**: Can typically be completed in a single session

- **Resources**: Requires minimal resources or coordination

Examples of simple tasks include:

- Bug fixes for isolated issues

- Documentation updates

- Configuration changes

- Small feature enhancements

- Simple refactoring

## Step-by-Step Workflow

### 1. Initial Assessment


```

When assigned a simple task:

- Read the issue description thoroughly

- Understand the requirements and acceptance criteria

- Identify any unclear aspects or missing information

- Ask clarifying questions if needed


```

**Example**:

```

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="I'll work on this task. Just to confirm, the button color should be changed to #3366FF, correct? And this change should be applied to all primary buttons across the application?"
)

```

### 2. Task Acknowledgment and Setup


```

- Acknowledge receipt of the task

- Self-assign the issue

- Update the issue state to "In Progress"

- Create a branch with an appropriate naming convention


```

**Example**:

```

linear_self_assign()
linear_update_issue(issue_id="ISSUE_ID", state_id="IN_PROGRESS_STATE_ID")
linear_comment_on_issue(issue_id="ISSUE_ID", body="I'm starting work on this task now.")

git checkout -b codegen-bot/fix-ABC-123-button-color

```

### 3. Implementation


```

- Make the necessary changes

- Follow coding standards and best practices

- Add appropriate tests if applicable

- Ensure changes meet the requirements


```

**Example**:

```

# Make code changes

# Add tests if needed
git add .
git commit -m "Change primary button color to #3366FF (ABC-123)"

```

### 4. Verification


```

- Test the changes thoroughly

- Ensure all tests pass

- Verify the changes meet the acceptance criteria

- Check for any unintended side effects


```

**Example**:

```

# Run tests

npm test

# Manual verification

# Check that all primary buttons have the correct color
# Verify that no other components are affected


```

### 5. Submission


```

- Push changes to the remote branch

- Create a PR with a clear description

- Link the PR to the Linear issue

- Update the issue state to "Ready for Review"


```

**Example**:

```

git push -u origin codegen-bot/fix-ABC-123-button-color

create_pr(
    title="Change primary button color to #3366FF",
    body="This PR changes the primary button color to #3366FF as requested in ABC-123.\n\n## Changes\n- Updated the primary button color in the theme configuration\n- Updated tests to verify the new color\n\nCloses ABC-123",
    head_branch="codegen-bot/fix-ABC-123-button-color"
)

linear_attach_link(
    title="PR: Change primary button color to #3366FF",
    url="https://github.com/org/repo/pull/123"
)
linear_update_issue(issue_id="ISSUE_ID", state_id="READY_FOR_REVIEW_STATE_ID")

```

## Example: Bug Fix

### Scenario: Fix a Form Validation Error

**Issue Description**:

```

Title: Fix email validation in signup form
Description: The email validation in the signup form is not working correctly. It's accepting invalid email formats like "user@domain" without a TLD. Please update the validation to ensure emails have a valid format with a TLD.

```

### Workflow Implementation:

1. **Initial Assessment**

```

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="I'll fix this email validation issue. I'll update the validation regex to ensure emails have a valid TLD."
)

```

2. **Task Acknowledgment and Setup**

```

linear_self_assign()
linear_update_issue(issue_id="ISSUE_ID", state_id="IN_PROGRESS_STATE_ID")

git checkout -b codegen-bot/fix-ABC-456-email-validation

```

3. **Implementation**

```javascript
// Before:
const emailRegex = /^[^\s@]+@[^\s@]+$/;

// After:
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Add test cases
test('email validation rejects emails without TLD', () => {
  expect(validateEmail('user@domain')).toBe(false);
  expect(validateEmail('user@domain.com')).toBe(true);
});

```

4. **Verification**

```

# Run tests

npm test

# Manual verification

# Test the form with various email formats:
# - user@domain (should be rejected)

# - user@domain.com (should be accepted)
# - user.name@sub.domain.co.uk (should be accepted)


```

5. **Submission**

```

git add .
git commit -m "Fix email validation to require TLD (ABC-456)"
git push -u origin codegen-bot/fix-ABC-456-email-validation

create_pr(
    title="Fix email validation in signup form",
    body="This PR fixes the email validation in the signup form to ensure emails have a valid TLD.\n\n## Changes\n- Updated email validation regex to require a TLD\n- Added test cases for email validation\n\nCloses ABC-456",
    head_branch="codegen-bot/fix-ABC-456-email-validation"
)

linear_attach_link(
    title="PR: Fix email validation in signup form",
    url="https://github.com/org/repo/pull/456"
)
linear_update_issue(issue_id="ISSUE_ID", state_id="READY_FOR_REVIEW_STATE_ID")

```

## Example: Documentation Update

### Scenario: Update API Documentation

**Issue Description**:

```

Title: Update API rate limit documentation
Description: Our API rate limits have changed from 100 requests per minute to 200 requests per minute. Please update the API documentation to reflect this change.

```

### Workflow Implementation:

1. **Initial Assessment**

```

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="I'll update the API rate limit documentation to reflect the new limit of 200 requests per minute."
)

```

2. **Task Acknowledgment and Setup**

```

linear_self_assign()
linear_update_issue(issue_id="ISSUE_ID", state_id="IN_PROGRESS_STATE_ID")

git checkout -b codegen-bot/update-ABC-789-api-rate-limits

```

3. **Implementation**

```markdown
<!-- Before -->
## Rate Limits

The API is limited to 100 requests per minute per API key.

<!-- After -->
## Rate Limits

The API is limited to 200 requests per minute per API key.


> **Note**: As of [date], the rate limit has been increased from 100 to 200 requests per minute.

```

4. **Verification**

```

# Review the documentation changes

# Check for any other mentions of rate limits that might need updating
# Verify formatting and clarity


```

5. **Submission**

```

git add .
git commit -m "Update API rate limit documentation to 200 req/min (ABC-789)"
git push -u origin codegen-bot/update-ABC-789-api-rate-limits

create_pr(
    title="Update API rate limit documentation",
    body="This PR updates the API documentation to reflect the new rate limit of 200 requests per minute.\n\n## Changes\n- Updated rate limit information in the API documentation\n- Added a note about the change\n\nCloses ABC-789",
    head_branch="codegen-bot/update-ABC-789-api-rate-limits"
)

linear_attach_link(
    title="PR: Update API rate limit documentation",
    url="https://github.com/org/repo/pull/789"
)
linear_update_issue(issue_id="ISSUE_ID", state_id="READY_FOR_REVIEW_STATE_ID")

```

## Example: Configuration Change

### Scenario: Update Default Timeout Settings

**Issue Description**:

```

Title: Increase default API request timeout
Description: Users are experiencing timeouts with large data requests. Please increase the default API request timeout from 30 seconds to 60 seconds in the configuration.

```

### Workflow Implementation:

1. **Initial Assessment**

```

linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="I'll update the default API request timeout from 30 to 60 seconds. I'll make the change in the configuration file and update any relevant documentation."
)

```

2. **Task Acknowledgment and Setup**

```

linear_self_assign()
linear_update_issue(issue_id="ISSUE_ID", state_id="IN_PROGRESS_STATE_ID")

git checkout -b codegen-bot/update-DEF-123-api-timeout

```

3. **Implementation**

```javascript
// config.js - Before
const config = {
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 30000, // 30 seconds
    retries: 3
  }
};

// config.js - After
const config = {
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 60000, // 60 seconds
    retries: 3
  }
};

// Update documentation if needed

```

4. **Verification**

```

# Run tests

npm test

# Verify the change works with large data requests

# Check for any hardcoded timeout values elsewhere in the code

```

5. **Submission**

```

git add .
git commit -m "Increase default API request timeout to 60 seconds (DEF-123)"
git push -u origin codegen-bot/update-DEF-123-api-timeout

create_pr(
    title="Increase default API request timeout",
    body="This PR increases the default API request timeout from 30 to 60 seconds to prevent timeouts with large data requests.\n\n## Changes\n- Updated timeout value in config.js\n- Updated relevant documentation\n\nCloses DEF-123",
    head_branch="codegen-bot/update-DEF-123-api-timeout"
)

linear_attach_link(
    title="PR: Increase default API request timeout",
    url="https://github.com/org/repo/pull/123"
)
linear_update_issue(issue_id="ISSUE_ID", state_id="READY_FOR_REVIEW_STATE_ID")

```

## Best Practices

1. **Thorough Understanding**

   - Ensure you fully understand the task before starting

   - Ask clarifying questions if anything is unclear

   - Confirm your understanding with the issue creator if needed

2. **Focused Changes**

   - Keep changes focused on the specific task

   - Avoid scope creep or unrelated improvements

   - Make minimal changes to achieve the objective

3. **Comprehensive Testing**

   - Test all aspects of your changes

   - Consider edge cases and potential side effects

   - Verify against the acceptance criteria

4. **Clear Documentation**

   - Document your changes clearly in the PR description

   - Explain the rationale behind your approach

   - Update relevant documentation

5. **Effective Communication**

   - Provide clear, concise updates

   - Document any decisions or assumptions

   - Respond promptly to feedback

## Common Pitfalls

1. **Scope Expansion**

   - Avoid adding unrelated improvements

   - Stay focused on the specific task

   - Create separate issues for additional improvements

2. **Insufficient Testing**

   - Not testing edge cases

   - Missing regression tests

   - Not verifying against all acceptance criteria

3. **Poor Communication**

   - Not asking clarifying questions

   - Providing vague or infrequent updates

   - Not documenting decisions or assumptions

4. **Overlooking Documentation**

   - Forgetting to update related documentation

   - Not explaining changes clearly in the PR

   - Missing context or rationale

5. **Inefficient Branching**

   - Using incorrect branch naming

   - Not branching from the correct base

   - Not keeping branches focused on a single task

## Related Resources


- [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md)

- [Linear Workflow Decision Diagram](../reference/linear_workflow_diagram.md)

- [Communication and Delegation SOPs](../reference/communication_delegation_sops.md)

- [Linear Workflow Guide: Complex Tasks](./linear_workflow_guide_complex_tasks.md)

- [Linear API Issues Troubleshooting](../troubleshooting/linear_api_issues.md)

