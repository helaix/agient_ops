# Linear-GitHub Linking Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Linking Methods](#linking-methods)
3. [Best Practices](#best-practices)
4. [Automation Options](#automation-options)
5. [Examples](#examples)
6. [Troubleshooting](#troubleshooting)

## Introduction

Effective integration between Linear and GitHub is essential for maintaining a streamlined development workflow. This guide provides comprehensive information on best practices for linking Linear issues to GitHub pull requests, enabling teams to track work progress across both platforms seamlessly.

By establishing a robust linking system between Linear issues and GitHub PRs, teams can:

- Maintain a single source of truth for task status
- Automate status updates based on code progress
- Ensure clear traceability between requirements and implementations
- Improve collaboration between product, design, and engineering teams
- Reduce manual overhead in keeping systems synchronized

This guide covers various methods for linking, best practices, automation options, and troubleshooting common issues to help your team establish an efficient workflow.

## Linking Methods

There are several methods to link Linear issues to GitHub PRs, each with its own advantages and use cases:

### 1. Branch Name Method

Including the Linear issue ID in the branch name is one of the most straightforward methods for linking.

**How it works:**
- Create a branch with the Linear issue ID in the name (e.g., `feature/ABC-123-add-login-button`)
- When you create a PR from this branch, Linear will automatically detect the issue ID and link the PR to the issue

**Advantages:**
- Automatic linking without additional configuration
- Clear visual indication of which issue the branch addresses
- Works with Linear's "Copy git branch name" feature (Cmd/Ctrl + Shift + .)

### 2. PR Title Method

Including the Linear issue ID in the PR title is another common method.

**How it works:**
- Add the issue ID to your PR title (e.g., "ABC-123: Add login button")
- Linear will detect the issue ID and link the PR automatically

**Advantages:**
- Simple to implement
- Can be added to existing PRs
- Doesn't require specific branch naming conventions

### 3. PR Description with Magic Words

Using "magic words" in the PR description provides more control over how the linking affects issue status.

**How it works:**
- Add a magic word followed by the issue ID in the PR description (e.g., "Fixes ABC-123")
- Linear will detect this pattern and link the PR to the issue

**Magic Words:**
- **Closing magic words** (will close the issue when PR is merged): `close, closes, closed, closing, fix, fixes, fixed, fixing, resolve, resolves, resolved, resolving, complete, completes, completed, completing`
- **Non-closing magic words** (will link but not close): `ref, references, part of, related to, contributes to, towards`

**Advantages:**
- More control over how the linking affects issue status
- Can link multiple issues to a single PR
- Can specify different relationships between the PR and different issues

### 4. Linear URL Method

Including the full Linear issue URL in the PR description.

**How it works:**
- Add the full Linear issue URL to your PR description (e.g., "Fixes https://linear.app/workspace/issue/ABC-123/title")
- Linear will detect the URL and link the PR to the issue

**Advantages:**
- Provides a clickable link to the issue
- Works well when referencing issues from different teams or projects

### 5. Commit Messages with Magic Words

Linking through commit messages allows for more granular tracking.

**How it works:**
- Include a magic word and the issue ID in your commit message (e.g., "Fix login bug [ABC-123]")
- Linear will detect the pattern and link the commit to the issue

**Advantages:**
- Links individual commits to issues
- Useful for tracking progress at a more granular level
- Can automate status changes based on commit activity

## Best Practices

To maximize the benefits of linking Linear issues to GitHub PRs, consider the following best practices:

### 1. Standardize Linking Methods

**Recommendation:** Choose one primary method for linking and document it in your team's workflow guidelines.

**Implementation:**
- Select the method that best fits your team's workflow (branch name or PR title are most common)
- Document the chosen method in your team's onboarding materials
- Consider creating PR templates that include placeholders for issue IDs

**Benefits:**
- Consistency across the team
- Reduced confusion about how to link issues
- Easier automation and reporting

### 2. Use Descriptive Branch Names

**Recommendation:** Combine issue IDs with descriptive names for branches.

**Implementation:**
- Format: `type/ABC-123-short-description`
- Types can include: `feature`, `bugfix`, `hotfix`, `refactor`, etc.
- Example: `feature/ABC-123-add-user-authentication`

**Benefits:**
- Clear indication of the issue being addressed
- Additional context about the type of change
- Easier branch management and cleanup

### 3. Leverage Linear's Workflow Automation

**Recommendation:** Configure Linear's workflow automation to update issue status based on PR events.

**Implementation:**
- Configure in Linear: Settings → Team → Workflow → Pull request and commit automation
- Set up status transitions for PR events (draft, open, review requested, ready for merge, merged)
- Consider branch-specific rules for different environments (staging, production)

**Benefits:**
- Automatic status updates reduce manual work
- Consistent status tracking across the team
- More accurate reporting on project progress

### 4. Implement Branch Protection Rules

**Recommendation:** Use GitHub branch protection rules to enforce linking practices.

**Implementation:**
- Require PR titles or descriptions to include Linear issue IDs
- Use GitHub Actions to validate proper linking (see Automation Options section)
- Block merges that don't comply with linking requirements

**Benefits:**
- Enforces linking practices
- Prevents untracked work
- Maintains clean relationship between code and issues

### 5. Link Multiple Issues When Appropriate

**Recommendation:** When a PR addresses multiple issues, link all relevant issues.

**Implementation:**
- Include all relevant issue IDs in the PR description using magic words
- Use different magic words to indicate different relationships (e.g., "Fixes ABC-123, Relates to ABC-124")

**Benefits:**
- Complete traceability between code and issues
- Proper status updates for all affected issues
- Better reporting and visibility

### 6. Maintain Bidirectional Communication

**Recommendation:** Ensure comments and updates flow between both systems.

**Implementation:**
- Configure Linear's GitHub integration to sync comments
- Use Linear's GitHub Issues Sync for bidirectional updates
- Train team members to use the appropriate platform for different types of communication

**Benefits:**
- Reduced context switching
- Complete history in both systems
- Improved collaboration between team members with different preferences

### 7. Regular Auditing and Cleanup

**Recommendation:** Periodically audit and clean up links between systems.

**Implementation:**
- Create a recurring task to review unlinked PRs and issues
- Develop scripts or use tools to identify and fix broken links
- Include link verification in your regular sprint retrospectives

**Benefits:**
- Maintains data integrity between systems
- Identifies process breakdowns
- Ensures accurate reporting and metrics

## Automation Options

Automating the linking process and related workflows can significantly improve efficiency and consistency. Here are several automation options:

### 1. GitHub Actions for Validation

**Description:** Use GitHub Actions to validate that PRs are properly linked to Linear issues.

**Implementation:**
- Create a GitHub Action workflow that checks PR titles, descriptions, or branch names for Linear issue IDs
- Block PRs that don't include valid Linear issue references
- Example: [verify-linked-linear-issue-action](https://github.com/ZetaMinusOne/verify-linked-linear-issue-action)

**Sample workflow:**
```yaml
name: Verify Linear Issue Link
on:
  pull_request:
    types: [opened, edited, synchronize, reopened]
jobs:
  verify-linear-link:
    runs-on: ubuntu-latest
    steps:
      - uses: ZetaMinusOne/verify-linked-linear-issue-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          linear-api-key: ${{ secrets.LINEAR_API_KEY }}
          require-linear-issue: true
```

### 2. Linear Autolinks in GitHub

**Description:** Set up GitHub autolinks to make Linear issue IDs clickable in GitHub.

**Implementation:**
- Configure GitHub repository settings to recognize Linear issue patterns
- Use tools like [linear-autolink](https://github.com/MercuryTechnologies/linear-autolink) to automate setup
- Makes Linear issue IDs clickable and navigable directly from GitHub

**Example setup:**
```bash
export LINEAR_APIKEY=your_linear_api_key
export GH_ACCESS_TOKEN=your_github_token
linear_autolink.py owner/repo
```

### 3. Browser Extensions

**Description:** Use browser extensions to enhance the integration between Linear and GitHub.

**Implementation:**
- Install extensions like [GitHub to Linear](https://github.com/delucis/github-to-linear)
- Adds "Add to Linear" buttons directly on GitHub issues and PRs
- Simplifies creating Linear issues from GitHub content

### 4. Custom Webhooks and Integrations

**Description:** Develop custom webhooks to handle specific workflow requirements.

**Implementation:**
- Use Linear and GitHub APIs to build custom integration logic
- Create serverless functions to process webhook events
- Implement team-specific logic for status transitions, assignments, etc.

**Use cases:**
- Complex multi-system workflows
- Custom notifications or alerts
- Specialized reporting or metrics

### 5. Zapier or n8n Workflows

**Description:** Use no-code/low-code automation platforms to connect Linear and GitHub.

**Implementation:**
- Create workflows in Zapier, n8n, or similar platforms
- Trigger actions based on events in either system
- Customize without extensive development resources

**Example automations:**
- Create Linear issues from GitHub issues or vice versa
- Update issue fields based on PR status changes
- Send notifications to Slack when linked PRs are merged

### 6. Linear GitHub Integration Settings

**Description:** Customize Linear's built-in GitHub integration settings for your workflow.

**Implementation:**
- Configure in Linear: Settings → Workspace → Integrations → GitHub
- Set up team-specific workflow automations
- Configure branch-specific rules for different environments

**Key settings:**
- PR status change triggers
- Branch protection rule handling
- Comment synchronization options

## Examples

Here are practical examples of effective Linear-GitHub linking implementations:

### Example 1: Feature Development Workflow

**Scenario:** A developer is implementing a new feature tracked in Linear.

**Workflow:**
1. Developer assigns themselves to the Linear issue ABC-123
2. They use Linear's "Copy git branch name" feature (Cmd/Ctrl + Shift + .)
3. Linear automatically moves the issue to "In Progress"
4. Developer creates branch `feature/ABC-123-add-login-form`
5. After completing work, they create a PR with title "ABC-123: Add login form"
6. Linear automatically links the PR to the issue
7. When the PR is opened, Linear moves the issue to "In Review"
8. After approval and merge, Linear moves the issue to "Done"

**Key benefits:**
- Automatic status transitions
- Clear traceability
- Minimal manual updates

### Example 2: Multi-Issue PR Workflow

**Scenario:** A developer is refactoring code that affects multiple issues.

**Workflow:**
1. Developer creates branch `refactor/ABC-234-api-restructure`
2. They make changes that address multiple issues
3. When creating the PR, they add to the description:
   ```
   Fixes ABC-234
   Relates to ABC-235, ABC-236
   Part of ABC-200
   ```
4. Linear links all four issues to the PR
5. When merged, ABC-234 moves to "Done" while the others remain in their current states but show the PR link

**Key benefits:**
- Proper relationship mapping
- Appropriate status changes
- Complete traceability

### Example 3: Hotfix Workflow

**Scenario:** An urgent bug needs to be fixed in production.

**Workflow:**
1. Support creates Linear issue ABC-500 with priority "Urgent"
2. Developer creates branch `hotfix/ABC-500-fix-payment-processing`
3. After implementing the fix, they create a PR with:
   - Title: "HOTFIX: ABC-500 Fix payment processing bug"
   - Description: "Fixes ABC-500"
4. Linear's branch-specific rules detect the "hotfix" prefix
5. When merged to main, Linear automatically:
   - Moves the issue to "Deployed"
   - Adds a label "Hotfix"
   - Notifies the team in Slack

**Key benefits:**
- Special handling for urgent issues
- Automatic notifications
- Custom status flow for hotfixes

### Example 4: Automated Compliance Workflow

**Scenario:** A team needs to ensure all code changes are linked to approved issues for compliance reasons.

**Workflow:**
1. GitHub Action verifies all PRs have valid Linear issue links
2. Action also checks that linked issues are in an "Approved" state
3. PRs without valid links or with unapproved issues are blocked
4. When a PR is merged, a custom webhook:
   - Updates the Linear issue with deployment details
   - Generates a compliance report
   - Archives relevant conversations for audit purposes

**Key benefits:**
- Enforced compliance
- Automatic documentation
- Audit trail maintenance

## Troubleshooting

Here are solutions to common issues encountered when linking Linear issues to GitHub PRs:

### Issue: PR Not Linking to Linear Issue

**Possible causes:**
1. Issue ID format is incorrect
2. GitHub integration is not properly configured
3. Branch name or PR title doesn't follow the expected format

**Solutions:**
1. Verify the correct issue ID format (e.g., ABC-123)
2. Check Linear's GitHub integration settings
3. Ensure the issue ID is included in the branch name, PR title, or description
4. Try using a magic word explicitly in the PR description (e.g., "Fixes ABC-123")

### Issue: Status Not Updating Automatically

**Possible causes:**
1. Workflow automation not configured
2. Branch protection rules affecting automation
3. Issue is in an unexpected state

**Solutions:**
1. Check team workflow settings in Linear
2. Verify branch protection rules in GitHub
3. Check if the issue has any blockers or dependencies
4. Try manually triggering the status change to see if there are permission issues

### Issue: Multiple Issues Linking Incorrectly

**Possible causes:**
1. Incorrect use of magic words
2. Formatting issues in PR description
3. Conflicts between different linking methods

**Solutions:**
1. Use proper formatting for magic words (e.g., "Fixes ABC-123, Relates to DEF-456")
2. Ensure each issue ID is properly separated
3. Check for conflicting references in branch name, title, and description
4. Use the PR description method for multiple issues rather than trying to include all in the title

### Issue: Comments Not Syncing Between Systems

**Possible causes:**
1. Comment sync not enabled in integration settings
2. API rate limits being hit
3. Permission issues

**Solutions:**
1. Check Linear's GitHub integration settings for comment sync options
2. Verify API access and rate limits
3. Ensure both systems have proper permissions
4. Check for webhook delivery failures in GitHub settings

### Issue: Broken Links After Issue/PR Changes

**Possible causes:**
1. Issue was moved to a different team
2. PR was retargeted to a different branch
3. Issue ID was changed

**Solutions:**
1. Manually update the link in the affected system
2. Re-establish the link by editing the PR description
3. Create a new link and remove the old one
4. Use Linear's attachment management to fix broken links

### Issue: GitHub Actions Validation Failing

**Possible causes:**
1. Action configuration issues
2. API key problems
3. Formatting issues in PR

**Solutions:**
1. Check GitHub Actions logs for specific error messages
2. Verify API keys are valid and have necessary permissions
3. Ensure PR follows the required format
4. Test the action with a known good PR format

### Issue: Permissions Problems

**Possible causes:**
1. Insufficient permissions in Linear or GitHub
2. API tokens with limited scope
3. Organization settings restricting integrations

**Solutions:**
1. Verify user permissions in both systems
2. Check API token scopes and permissions
3. Review organization settings for integration restrictions
4. Ensure the GitHub app has the necessary repository access

