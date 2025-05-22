# Linear-GitHub Linking Guide

## Introduction and Purpose

Effective integration between Linear and GitHub is essential for maintaining a streamlined development workflow. This guide provides comprehensive instructions for linking Linear issues to GitHub Pull Requests (PRs), enabling teams to track work progress across both platforms seamlessly.

By establishing a robust linking system between Linear issues and GitHub PRs, teams can:

- Maintain a single source of truth for task status
- Automate status updates based on code progress
- Ensure clear traceability between requirements and implementations
- Improve collaboration between product, design, and engineering teams
- Reduce manual overhead in keeping systems synchronized

This guide covers various methods for linking, best practices, automation options, and troubleshooting common issues to help your team establish an efficient workflow.

## Table of Contents

1. [Introduction and Purpose](#introduction-and-purpose)
2. [Linking Methods](#linking-methods)
   - [Branch Name Method](#1-branch-name-method)
   - [PR Title Method](#2-pr-title-method)
   - [PR Description with Magic Words](#3-pr-description-with-magic-words)
   - [Linear URL Method](#4-linear-url-method)
   - [Commit Messages with Magic Words](#5-commit-messages-with-magic-words)
3. [Best Practices](#best-practices)
   - [Standardize Linking Methods](#1-standardize-linking-methods)
   - [Use Descriptive Branch Names](#2-use-descriptive-branch-names)
   - [Leverage Linear's Workflow Automation](#3-leverage-linears-workflow-automation)
   - [Implement Branch Protection Rules](#4-implement-branch-protection-rules)
   - [Link Multiple Issues When Appropriate](#5-link-multiple-issues-when-appropriate)
   - [Maintain Bidirectional Communication](#6-maintain-bidirectional-communication)
   - [Regular Auditing and Cleanup](#7-regular-auditing-and-cleanup)
4. [Automation Options](#automation-options)
   - [GitHub Actions for Validation](#1-github-actions-for-validation)
   - [Linear Autolinks in GitHub](#2-linear-autolinks-in-github)
   - [Browser Extensions](#3-browser-extensions)
   - [Custom Webhooks and Integrations](#4-custom-webhooks-and-integrations)
   - [Zapier or n8n Workflows](#5-zapier-or-n8n-workflows)
   - [Linear GitHub Integration Settings](#6-linear-github-integration-settings)
5. [Examples of Effective Linking](#examples-of-effective-linking)
   - [Feature Development Workflow](#example-1-feature-development-workflow)
   - [Multi-Issue PR Workflow](#example-2-multi-issue-pr-workflow)
   - [Hotfix Workflow](#example-3-hotfix-workflow)
   - [Automated Compliance Workflow](#example-4-automated-compliance-workflow)
6. [Troubleshooting Common Issues](#troubleshooting-common-issues)
   - [PR Not Linking to Linear Issue](#issue-pr-not-linking-to-linear-issue)
   - [Status Not Updating Automatically](#issue-status-not-updating-automatically)
   - [Multiple Issues Linking Incorrectly](#issue-multiple-issues-linking-incorrectly)
   - [Comments Not Syncing Between Systems](#issue-comments-not-syncing-between-systems)
   - [Broken Links After Issue/PR Changes](#issue-broken-links-after-issuepr-changes)
   - [GitHub Actions Validation Failing](#issue-github-actions-validation-failing)
   - [Permissions Problems](#issue-permissions-problems)

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

**Example:**
```bash
# Using Linear's "Copy git branch name" feature
git checkout -b feature/ABC-123-add-login-button

# Or manually creating a branch with the issue ID
git checkout -b bugfix/ABC-124-fix-login-validation
```

### 2. PR Title Method

Including the Linear issue ID in the PR title is another common method.

**How it works:**
- Add the issue ID to your PR title (e.g., "ABC-123: Add login button")
- Linear will detect the issue ID and link the PR automatically

**Advantages:**
- Simple to implement
- Can be added to existing PRs
- Doesn't require specific branch naming conventions

**Example:**
```
# Good PR title examples
"ABC-123: Add user authentication feature"
"Fix login validation issues (ABC-124)"
"[ABC-125] Refactor payment processing module"
```

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

**Example:**
```markdown
# PR Description Example

This PR adds the login button component to the authentication page.

Fixes ABC-123
Related to ABC-124
Part of ABC-125
```

### 4. Linear URL Method

Including the full Linear issue URL in the PR description.

**How it works:**
- Add the full Linear issue URL to your PR description (e.g., "Fixes https://linear.app/workspace/issue/ABC-123/title")
- Linear will detect the URL and link the PR to the issue

**Advantages:**
- Provides a clickable link to the issue
- Works well when referencing issues from different teams or projects

**Example:**
```markdown
# PR Description Example

This PR implements the login functionality.

Fixes https://linear.app/workspace/issue/ABC-123/add-login-button
Related to https://linear.app/workspace/issue/ABC-124/login-validation
```

### 5. Commit Messages with Magic Words

Linking through commit messages allows for more granular tracking.

**How it works:**
- Include a magic word and the issue ID in your commit message (e.g., "Fix login bug [ABC-123]")
- Linear will detect the pattern and link the commit to the issue

**Advantages:**
- Links individual commits to issues
- Useful for tracking progress at a more granular level
- Can automate status changes based on commit activity

**Example:**
```bash
# Commit message examples
git commit -m "Add login button component [ABC-123]"
git commit -m "Fix validation issues, closes ABC-124"
git commit -m "Refactor authentication module (part of ABC-125)"
```

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

**Example PR Template:**
```markdown
## Description
<!-- Provide a brief description of the changes in this PR -->

## Linear Issue
<!-- Add the Linear issue ID or URL here (e.g., ABC-123 or https://linear.app/workspace/issue/ABC-123/title) -->

## Changes Made
<!-- List the key changes made in this PR -->

## Testing
<!-- Describe how these changes were tested -->

## Screenshots
<!-- If applicable, add screenshots to help explain your changes -->
```

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

**Example Branch Naming Convention:**
```
feature/ABC-123-add-login-button
bugfix/ABC-124-fix-validation-errors
refactor/ABC-125-improve-authentication-flow
hotfix/ABC-126-fix-critical-security-issue
```

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

**Example Configuration:**
```
When a PR is opened → Move issue to "In Review"
When a PR is merged → Move issue to "Done"
When a PR with "hotfix/" in branch name is merged → Move issue to "Deployed" and add "Hotfix" label
```

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

**Example GitHub Action Check:**
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

### 5. Link Multiple Issues When Appropriate

**Recommendation:** When a PR addresses multiple issues, link all relevant issues.

**Implementation:**
- Include all relevant issue IDs in the PR description using magic words
- Use different magic words to indicate different relationships (e.g., "Fixes ABC-123, Relates to ABC-124")

**Benefits:**
- Complete traceability between code and issues
- Proper status updates for all affected issues
- Better reporting and visibility

**Example PR Description:**
```markdown
# Multi-Issue PR

This PR refactors the authentication system and fixes several related issues.

Fixes ABC-123 # Will close this issue when merged
Fixes ABC-124 # Will close this issue when merged
Related to ABC-125 # Will link but not close
Part of ABC-126 # Will link but not close
```

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

**Configuration Steps:**
1. In Linear, go to Settings → Workspace → Integrations → GitHub
2. Enable "Sync comments between Linear and GitHub"
3. Configure which types of comments should be synced

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

**Example Audit Script:**
```javascript
// Example script to find Linear issues without linked PRs
const { LinearClient } = require('@linear/sdk');
const linearClient = new LinearClient({ apiKey: 'YOUR_API_KEY' });

async function findUnlinkedIssues() {
  const issues = await linearClient.issues({
    filter: {
      state: { name: { in: ["In Progress", "In Review"] } },
      attachments: { url: { notContains: "github.com" } }
    }
  });
  
  console.log("Issues in progress without GitHub links:");
  issues.nodes.forEach(issue => {
    console.log(`- ${issue.identifier}: ${issue.title}`);
  });
}

findUnlinkedIssues();
```

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

**Manual Configuration:**
1. Go to your GitHub repository
2. Navigate to Settings → Code and automation → Repository → Autolink references
3. Add a new autolink reference:
   - Reference prefix: `ABC-`
   - Target URL: `https://linear.app/workspace/issue/ABC-$1`
   - Enabled: Yes

### 3. Browser Extensions

**Description:** Use browser extensions to enhance the integration between Linear and GitHub.

**Implementation:**
- Install extensions like [GitHub to Linear](https://github.com/delucis/github-to-linear)
- Adds "Add to Linear" buttons directly on GitHub issues and PRs
- Simplifies creating Linear issues from GitHub content

**Popular Extensions:**
- [GitHub to Linear](https://github.com/delucis/github-to-linear): Adds Linear integration to GitHub UI
- [Linear for GitHub](https://chrome.google.com/webstore/detail/linear-for-github/kcpjfpopbcnkgplgmomjnhkjdanbfcfp): Chrome extension for creating Linear issues from GitHub
- [Linear Tools](https://chrome.google.com/webstore/detail/linear-tools/kfmjmhppmljhnknnhpnfhfngjnpnkiog): Enhanced Linear experience with additional features

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

**Example Webhook Handler (Node.js):**
```javascript
// Example webhook handler for GitHub PR events
const express = require('express');
const { LinearClient } = require('@linear/sdk');
const app = express();

app.use(express.json());

app.post('/webhook/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;
  
  if (event === 'pull_request' && payload.action === 'closed' && payload.pull_request.merged) {
    // Extract Linear issue ID from PR title or description
    const issueMatch = payload.pull_request.title.match(/([A-Z]+-\d+)/);
    if (issueMatch) {
      const issueId = issueMatch[1];
      const linearClient = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
      
      // Find the issue
      const issues = await linearClient.issues({
        filter: { identifier: { eq: issueId } }
      });
      
      if (issues.nodes.length > 0) {
        const issue = issues.nodes[0];
        
        // Update the issue
        await linearClient.issueUpdate(issue.id, { 
          stateId: process.env.LINEAR_DONE_STATE_ID,
          description: `${issue.description}\n\nMerged in PR: ${payload.pull_request.html_url}`
        });
        
        console.log(`Updated Linear issue ${issueId}`);
      }
    }
  }
  
  res.status(200).send('Webhook processed');
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

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

**Sample Zapier Workflow:**
1. Trigger: New PR created in GitHub
2. Action: Find Linear issue by searching for issue ID in PR title
3. Action: Update Linear issue status to "In Review"
4. Action: Add PR link to Linear issue description
5. Action: Send notification to Slack channel

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

**Configuration Steps:**
1. In Linear, go to Settings → Workspace → Integrations → GitHub
2. Connect your GitHub account if not already connected
3. Configure the integration settings:
   - Enable/disable automatic issue linking
   - Configure comment synchronization
   - Set up status change automation
4. For team-specific settings, go to Settings → Team → Workflow → Pull request and commit automation

## Examples of Effective Linking

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

**Implementation Code:**
```bash
# 1. Assign issue in Linear UI

# 2. Copy branch name from Linear (Cmd/Ctrl + Shift + .)

# 3. Create and checkout branch
git checkout -b feature/ABC-123-add-login-form

# 4. Make changes and commit
git add .
git commit -m "Add login form component [ABC-123]"
git push -u origin feature/ABC-123-add-login-form

# 5. Create PR in GitHub with title "ABC-123: Add login form"
```

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

**Implementation Code:**
```bash
# 1. Create and checkout branch
git checkout -b refactor/ABC-234-api-restructure

# 2. Make changes and commit
git add .
git commit -m "Restructure API endpoints [ABC-234]"
git commit -m "Update authentication flow [ABC-235]"
git commit -m "Improve error handling [ABC-236]"
git push -u origin refactor/ABC-234-api-restructure

# 3. Create PR in GitHub with appropriate description
```

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

**Implementation Code:**
```bash
# 1. Create issue in Linear UI with priority "Urgent"

# 2. Create and checkout branch
git checkout -b hotfix/ABC-500-fix-payment-processing

# 3. Make changes and commit
git add .
git commit -m "Fix payment processing bug [ABC-500]"
git push -u origin hotfix/ABC-500-fix-payment-processing

# 4. Create PR in GitHub with appropriate title and description
```

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

**GitHub Action Example:**
```yaml
name: Compliance Check
on:
  pull_request:
    types: [opened, edited, synchronize, reopened]
jobs:
  verify-compliance:
    runs-on: ubuntu-latest
    steps:
      - name: Check Linear Issue Link
        uses: ZetaMinusOne/verify-linked-linear-issue-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          linear-api-key: ${{ secrets.LINEAR_API_KEY }}
          require-linear-issue: true
          
      - name: Verify Issue Approval Status
        uses: actions/github-script@v6
        with:
          script: |
            const { title, body } = context.payload.pull_request;
            const issueMatch = (title + ' ' + body).match(/([A-Z]+-\d+)/);
            if (!issueMatch) {
              core.setFailed('No Linear issue ID found in PR title or description');
              return;
            }
            
            const issueId = issueMatch[1];
            // Call Linear API to check issue status
            // Block PR if issue is not in "Approved" state
```

## Troubleshooting Common Issues

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

**Verification Steps:**
```bash
# Check if the issue ID is in the correct format
# Should be TEAM-NUMBER (e.g., ABC-123)

# Verify GitHub integration in Linear
# Settings → Workspace → Integrations → GitHub

# Try adding explicit reference in PR description
# Edit PR and add: "Fixes ABC-123"
```

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

**Verification Steps:**
```bash
# Check Linear workflow automation settings
# Settings → Team → Workflow → Pull request and commit automation

# Verify GitHub branch protection rules
# GitHub repository → Settings → Branches → Branch protection rules

# Check for blockers in Linear issue
# Look for dependencies or blockers in the issue details
```

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

**Correct Format Example:**
```markdown
# PR Description

This PR implements multiple features and fixes.

Fixes ABC-123
Fixes ABC-124
Related to ABC-125
Part of ABC-126
```

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

**Verification Steps:**
```bash
# Check Linear comment sync settings
# Settings → Workspace → Integrations → GitHub → Sync comments

# Verify webhook deliveries in GitHub
# GitHub repository → Settings → Webhooks → Recent Deliveries

# Check API rate limits
# GitHub: https://api.github.com/rate_limit
# Linear: Check API usage in Linear settings
```

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

**Fix Steps:**
```bash
# For moved issues, update the PR description with the new issue ID
# Edit PR description and update the issue reference

# For retargeted PRs, check if the link still exists in Linear
# If not, manually add the PR link in Linear issue attachments

# For changed issue IDs, update all references in GitHub
# Search for the old ID and replace with the new one
```

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

**Debugging Steps:**
```bash
# Check GitHub Actions logs
# GitHub repository → Actions → Failed workflow → Job logs

# Verify API key permissions
# Linear: Settings → Account → API → API Keys
# GitHub: Settings → Developer settings → Personal access tokens

# Test with known good format
# Create a test PR with a clear issue ID reference
```

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

**Permission Check:**
```bash
# Check Linear permissions
# Settings → Members → [Your User] → Verify admin access

# Check GitHub permissions
# Settings → Organizations → [Your Org] → People → [Your User]

# Verify API token scopes
# Linear: Settings → Account → API → API Keys
# GitHub: Settings → Developer settings → Personal access tokens
```

---

By following the guidelines and best practices outlined in this document, your team can establish an effective system for linking Linear issues to GitHub PRs, improving traceability, automation, and collaboration across your development workflow.

