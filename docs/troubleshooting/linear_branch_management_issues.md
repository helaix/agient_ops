# Troubleshooting Linear Branch Management Issues

## Overview

This guide addresses common issues encountered when managing Git branches in conjunction with Linear workflows. Branch management issues typically occur when creating, naming, merging, or coordinating branches across multiple agents and issues.

## Common Issues and Solutions

### 1. Branch Naming Conflicts

**Symptoms:**

- Error messages when creating branches with existing names

- Confusion about which branch corresponds to which issue

- Accidental work on the wrong branch

**Resolution Steps:**
1. Verify if a branch already exists before creating it:
   ```bash
   # Check if the branch exists locally
   git branch | grep "branch-name"
   
   # Check if the branch exists remotely
   git ls-remote --heads origin | grep "branch-name"
   ```

2. Use a more specific naming convention with unique identifiers:
   ```bash
   # Instead of:
   git checkout -b feature/user-authentication
   
   # Use:
   git checkout -b feature/user-authentication-ISSUE-123
   
   # Or even more specific:
   git checkout -b feature/user-authentication-ISSUE-123-$(date +%Y%m%d%H%M%S)
   ```

3. If a branch name conflict occurs, create a new branch with a unique suffix:
   ```bash
   # If feature/user-authentication-ISSUE-123 already exists
   git checkout -b feature/user-authentication-ISSUE-123-v2
   
   # Or use a timestamp
   git checkout -b feature/user-authentication-ISSUE-123-$(date +%Y%m%d%H%M%S)
   ```

**Preventive Measures:**

- Establish and document clear branch naming conventions

- Include the Linear issue identifier in all branch names

- Add unique suffixes (timestamps, agent identifiers) when necessary

- Verify branch existence before creation

### 2. Working from Incorrect Base Branches

**Symptoms:**

- Merge conflicts when integrating changes

- Missing expected code or features in your branch

- Unexpected code appearing in your branch

**Resolution Steps:**
1. Identify the correct base branch:
   ```bash
   # For a sub-issue, the base branch is typically specified in the parent issue
   # or should be the branch associated with the parent issue
   
   # Check the current branch's tracking information
   git branch -vv
   ```

2. If you've started work on the wrong base branch, save your changes and switch:
   ```bash
   # Stash your current changes
   git stash
   
   # Checkout the correct base branch
   git checkout correct-base-branch
   git pull
   
   # Create a new branch from the correct base
   git checkout -b feature/your-feature-ISSUE-123
   
   # Apply your stashed changes
   git stash apply
   
   # Resolve any conflicts
   # Then commit your changes
   git add .
   git commit -m "Implement feature for ISSUE-123"
   ```

3. If you've already committed to the wrong branch, use cherry-picking:
   ```bash
   # Identify the commits you need to move
   git log --oneline
   
   # Checkout the correct base branch
   git checkout correct-base-branch
   git pull
   
   # Create a new branch from the correct base
   git checkout -b feature/your-feature-ISSUE-123-corrected
   
   # Cherry-pick your commits
   git cherry-pick commit-hash-1 commit-hash-2
   
   # Push the new branch
   git push -u origin feature/your-feature-ISSUE-123-corrected
   ```

**Preventive Measures:**

- Document the base branch clearly in Linear issue descriptions

- Verify the base branch before starting work

- Include explicit git commands in issue templates

- Implement branch validation in your workflow

### 3. Merge Conflicts During Integration

**Symptoms:**

- Error messages about merge conflicts when integrating branches

- Failed automated merges in CI/CD pipelines

- Difficulty combining work from multiple sub-issues

**Resolution Steps:**
1. Identify the conflicting files:
   ```bash
   # Attempt the merge to see conflicts
   git checkout parent-branch
   git pull
   git merge feature/sub-task-branch
   
   # Git will show which files have conflicts
   ```

2. Resolve conflicts with a visual merge tool:
   ```bash
   # Use a visual merge tool if available
   git mergetool
   
   # Or manually edit the conflicting files
   # Look for the conflict markers: <<<<<<< HEAD, =======, >>>>>>> branch-name
   ```

3. For complex conflicts, consider a different merge strategy:
   ```bash
   # Abort the current merge
   git merge --abort
   
   # Try a different merge strategy
   git merge feature/sub-task-branch -X theirs  # Prefer incoming changes
   # OR
   git merge feature/sub-task-branch -X ours    # Prefer current branch changes
   ```

4. If conflicts are too complex, use a rebase workflow:
   ```bash
   # Switch to the feature branch
   git checkout feature/sub-task-branch
   
   # Rebase onto the parent branch
   git rebase parent-branch
   
   # Resolve conflicts for each commit
   # After resolving, continue the rebase
   git rebase --continue
   
   # Once complete, merge the rebased branch (should be conflict-free)
   git checkout parent-branch
   git merge feature/sub-task-branch
   ```

**Preventive Measures:**

- Regularly sync sub-task branches with the parent branch

- Coordinate work to minimize overlapping changes

- Use feature flags for parallel development

- Implement clear code ownership boundaries

### 4. Lost Work Due to Branch Mismanagement

**Symptoms:**

- Code changes disappearing after branch operations

- Inability to find previously committed work

- Overwritten changes during merges or rebases

**Resolution Steps:**
1. Use git reflog to find lost commits:
   ```bash
   # View the git reference log
   git reflog
   
   # Identify the lost commit hash
   
   # Create a new branch pointing to the lost commit
   git checkout -b recovery-branch lost-commit-hash
   ```

2. Recover uncommitted changes with git stash:
   ```bash
   # List all stashes
   git stash list
   
   # View the content of a specific stash
   git stash show -p stash@{0}
   
   # Apply a specific stash
   git stash apply stash@{0}
   ```

3. Recover overwritten changes during a merge:
   ```bash
   # If you just did a merge that overwrote changes
   git reset --hard ORIG_HEAD
   
   # Then try a different merge approach
   git merge feature/branch --no-ff
   ```

4. Use git fsck to find dangling commits:
   ```bash
   # Find dangling commits
   git fsck --lost-found
   
   # Examine a dangling commit
   git show dangling-commit-hash
   
   # Recover the commit
   git checkout -b recovery-branch dangling-commit-hash
   ```

**Preventive Measures:**

- Always create backup branches before complex operations

- Push branches to remote regularly

- Use descriptive commit messages

- Document branch relationships in Linear issues

### 5. Inconsistent Branch States Across Agents

**Symptoms:**

- Different agents seeing different code in the same branch

- Confusion about the latest state of a branch

- Unexpected behavior when multiple agents work on related branches

**Resolution Steps:**
1. Ensure all agents are working with the latest code:
   ```bash
   # Fetch the latest changes from remote
   git fetch origin
   
   # Check if your local branch is behind remote
   git status
   
   # Update your local branch
   git pull origin your-branch-name
   ```

2. Verify branch tracking relationships:
   ```bash
   # Check which remote branch your local branch is tracking
   git branch -vv
   
   # Set the correct tracking relationship if needed
   git branch --set-upstream-to=origin/branch-name branch-name
   ```

3. Resolve divergent branches:
   ```bash
   # If your branch has diverged from remote
   git pull --rebase origin your-branch-name
   
   # Resolve any conflicts
   # Then push the updated branch
   git push origin your-branch-name
   ```

4. Use branch protection to prevent inconsistent states:
   ```bash
   # This is typically configured in GitHub/GitLab settings
   # Require pull request reviews before merging
   # Require status checks to pass before merging
   # Require branches to be up to date before merging
   ```

**Preventive Measures:**

- Establish clear communication about branch updates

- Implement a "pull before you work" policy

- Use branch protection rules for important branches

- Document the expected workflow for branch synchronization

### 6. Difficulty Tracking Branch-Issue Relationships

**Symptoms:**

- Confusion about which branches correspond to which Linear issues

- Challenges in finding the relevant code for a specific issue

- Difficulty managing multiple related branches

**Resolution Steps:**
1. Use Linear's branch field to document branch names:
   ```javascript
   // Update the issue with the branch name
   await linear.issueUpdate(issueId, {
     branchName: "feature/issue-123-feature-name"
   });
   ```

2. Include branch information in commit messages:
   ```bash
   git commit -m "[ISSUE-123] Implement feature X
   
   This commit implements feature X as described in Linear issue ISSUE-123.
   Branch: feature/issue-123-feature-name"
   ```

3. Create a branch mapping document:
   ```markdown
   # Branch Mapping
   
   | Issue ID | Branch Name | Description | Base Branch | Status |
   |----------|-------------|-------------|------------|--------|
   | ISSUE-123 | feature/issue-123-auth | Authentication system | main | In Progress |
   | ISSUE-124 | feature/issue-124-profile | User profile page | main | Completed |
   | ISSUE-125 | feature/issue-125-settings | User settings page | feature/issue-123-auth | Blocked |
   ```

4. Use git notes to attach issue information to commits:
   ```bash
   # Add a note to the latest commit
   git notes add -m "Linear Issue: ISSUE-123
   Title: Implement authentication system
   URL: https://linear.app/org/issue/ISSUE-123"
   
   # Push notes to remote
   git push origin refs/notes/*
   
   # View notes
   git log --show-notes
   ```

**Preventive Measures:**

- Follow consistent branch naming conventions that include issue IDs

- Document branch relationships in Linear issues

- Use automated tools to update Linear with branch information

- Implement branch cleanup procedures after issue completion

## References


- [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md)

- [Communication and Delegation SOPs](../reference/communication_delegation_sops.md)

- [Agent Collaboration Workflow](../src/content/docs/reference/agent_collaboration_workflow.md)

- [Git Documentation](https://git-scm.com/doc)



## Related Resources

- [Common Linear Workflow Issues and Solutions](common_linear_issues.md)
- [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md)
