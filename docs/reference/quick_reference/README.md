# Quick References and Tools

## Overview

This directory provides rapid access to essential commands, templates, reference materials, and tool configurations for agent operations. Use these resources when you need quick answers or standardized formats.

## Command Cheat Sheets

### Linear Commands and Operations

#### Issue Management
```bash
# Create new issue (via Linear CLI if available)
linear issue create --title "Issue Title" --description "Description" --team TEAM-KEY

# Update issue status
linear issue update ISSUE-ID --state "In Progress"

# Add comment to issue
linear issue comment ISSUE-ID "Comment text"

# Link issue to PR
linear issue update ISSUE-ID --add-attachment "https://github.com/org/repo/pull/123"
```

#### Common Linear Workflows
```bash
# Standard issue workflow
1. Create issue in Linear
2. Create branch: git checkout -b feature/ISSUE-ID-description
3. Implement changes
4. Create PR with issue reference
5. Update Linear issue status
```

### GitHub Commands and Operations

#### Repository Management
```bash
# Clone repository
git clone https://github.com/org/repo.git

# Create and switch to new branch
git checkout -b feature/HLX-123-implement-feature

# Stage and commit changes
git add .
git commit -m "[HLX-123] feat: implement new feature"

# Push branch to remote
git push -u origin feature/HLX-123-implement-feature
```

#### Pull Request Operations
```bash
# Create PR (using GitHub CLI)
gh pr create --title "HLX-123: Implement new feature" --body "Fixes HLX-123"

# Check PR status
gh pr status

# Merge PR
gh pr merge --squash

# View PR details
gh pr view 123
```

#### Branch Management
```bash
# List all branches
git branch -a

# Switch to branch
git checkout branch-name

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name
```

### Integration Commands

#### Linear-GitHub Integration
```bash
# Proper branch naming for auto-linking
feature/HLX-123-short-description
bugfix/HLX-456-fix-issue
hotfix/HLX-789-urgent-fix

# Commit message format
[HLX-123] type: description

# PR description for linking
Fixes HLX-123
Relates to HLX-456
Part of HLX-789
```

## Templates and Formats

### Issue Templates

#### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: 
- Browser: 
- Version: 

## Additional Context
Any other relevant information
```

#### Feature Request Template
```markdown
## Feature Description
Brief description of the requested feature

## Use Case
Why is this feature needed?

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Notes
Technical considerations or suggestions

## Priority
High/Medium/Low and justification
```

### PR Templates

#### Standard PR Template
```markdown
## Description
Brief description of changes

## Related Issues
Fixes #123
Relates to #456

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Commit Message Templates

#### Standard Commit Format
```bash
[ISSUE-ID] type: subject

body (optional)

footer (optional)
```

#### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

### Communication Templates

#### Status Update Template
```markdown
## Progress Update - [Date]

### Completed
- Task 1
- Task 2

### In Progress
- Task 3 (50% complete)
- Task 4 (just started)

### Blockers
- Blocker 1: Description and impact
- Blocker 2: Description and impact

### Next Steps
- Next action 1
- Next action 2

### Timeline
- Milestone 1: Date
- Milestone 2: Date
```

#### Escalation Template
```markdown
## Issue Escalation

### Issue Summary
Brief description of the problem

### Impact
Who/what is affected and how

### Steps Taken
1. Action 1
2. Action 2
3. Action 3

### Current Status
Current state of the issue

### Requested Action
What help is needed

### Timeline
When resolution is needed
```

## Quick Reference Cards

### Linear Workflow Quick Reference

| Action | Steps |
|--------|-------|
| **Start New Task** | 1. Read issue<br>2. Create branch<br>3. Set status to "In Progress" |
| **Submit Work** | 1. Create PR<br>2. Link to issue<br>3. Set status to "In Review" |
| **Complete Task** | 1. Merge PR<br>2. Set status to "Done"<br>3. Update stakeholders |

### GitHub Workflow Quick Reference

| Action | Command |
|--------|---------|
| **Create Branch** | `git checkout -b feature/HLX-123-description` |
| **Commit Changes** | `git commit -m "[HLX-123] feat: description"` |
| **Push Branch** | `git push -u origin branch-name` |
| **Create PR** | `gh pr create --title "Title" --body "Body"` |

### Integration Quick Reference

| Task | Format/Command |
|------|----------------|
| **Branch Naming** | `type/HLX-123-description` |
| **Commit Message** | `[HLX-123] type: description` |
| **PR Linking** | `Fixes HLX-123` in PR description |
| **Issue Update** | Update status when PR created/merged |

## Tool Configurations

### Git Configuration

#### Basic Setup
```bash
# Set user information
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Enable auto-setup of remote tracking
git config --global push.autoSetupRemote true
```

#### Useful Aliases
```bash
# Add useful git aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

### GitHub CLI Configuration

#### Installation and Setup
```bash
# Install GitHub CLI (varies by OS)
# macOS: brew install gh
# Ubuntu: sudo apt install gh
# Windows: winget install GitHub.cli

# Authenticate
gh auth login

# Set default editor
gh config set editor vim
```

### Linear CLI Configuration

#### Setup (if available)
```bash
# Install Linear CLI
npm install -g @linear/cli

# Authenticate
linear auth

# Set default team
linear config set team TEAM-KEY
```

## Emergency Procedures

### System Outage Response
1. **Assess Impact**: Determine scope and severity
2. **Notify Stakeholders**: Alert relevant parties
3. **Implement Workaround**: Use backup procedures if available
4. **Document Issue**: Record details for post-mortem
5. **Monitor Resolution**: Track progress and communicate updates

### Data Recovery Procedures
1. **Stop All Operations**: Prevent further data loss
2. **Assess Damage**: Determine what was lost
3. **Check Backups**: Identify available recovery options
4. **Restore Data**: Use most recent clean backup
5. **Validate Recovery**: Ensure data integrity
6. **Resume Operations**: Return to normal workflow

### Security Incident Response
1. **Isolate Threat**: Contain potential security breach
2. **Assess Impact**: Determine scope of compromise
3. **Notify Security Team**: Escalate immediately
4. **Document Evidence**: Preserve logs and artifacts
5. **Follow Recovery Plan**: Execute security incident procedures

## Related Documentation

- [Decision Trees](../decision_trees/README.md)
- [Workflow Checklists](../workflow_checklists/README.md)
- [Troubleshooting Guide](../troubleshooting/README.md)
- [Integration Guidelines](../integration_guidelines/README.md)

