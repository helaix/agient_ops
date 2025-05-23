# Status Verification Checklist for Agents

## Purpose

This checklist ensures agents verify their status claims before communicating to prevent misleading language about deployment and merge states.

## Pre-Communication Verification

### Before Making ANY Status Claim

**STOP** and verify the following:

#### 1. ✅ Branch Status Check
```bash
# Run these commands to verify actual status
git branch -r                    # Check remote branches
git status                       # Check current branch status
git log --oneline -5            # Check recent commits
```

**Questions to Answer**:
- [ ] What branch am I actually on?
- [ ] Where are my changes located?
- [ ] Have I pushed to remote?

#### 2. ✅ PR Status Check

**Questions to Answer**:
- [ ] Does a PR exist for my changes?
- [ ] What branch does the PR target?
- [ ] Is the PR actually merged?
- [ ] What is the PR number?

**Verification Steps**:
- Search GitHub for related PRs
- Check PR merge status
- Confirm merge destination branch

#### 3. ✅ Environment Check

**Questions to Answer**:
- [ ] Are my changes in development/sandbox?
- [ ] Are my changes in staging?
- [ ] Are my changes in production?
- [ ] Can users actually access my changes?

#### 4. ✅ Deployment Status Check

**Questions to Answer**:
- [ ] Are changes user-accessible?
- [ ] Is the feature live in production?
- [ ] Can I verify user access?

## Status Language Decision Tree

### If changes are in feature/sandbox branch:
✅ **Use**: "Work completed in feature branch `[branch-name]` - ready for PR creation"
❌ **Don't use**: "Merged to main" or "Deployed"

### If child agent work is integrated into parent branch:
✅ **Use**: "Child agent work integrated into parent branch `[branch-name]`"
❌ **Don't use**: "Merged to main" or "Deployed"

### If work is ready for PR creation:
✅ **Use**: "Implementation complete - ready to create PR to main"
❌ **Don't use**: "Merged" or "Deployed"

### If PR is actually merged to main:
✅ **Use**: "PR #[number] successfully merged to main branch"
❌ **Don't use**: Vague "merged" without specifics

### If changes are user-accessible:
✅ **Use**: "Changes deployed and accessible to users"
❌ **Don't use**: "Deployed" for non-user-accessible changes

## Quick Reference Commands

### Git Status Commands
```bash
# Check current branch and status
git branch -a
git status
git remote -v

# Check recent commits
git log --oneline -10

# Check if branch exists on remote
git ls-remote --heads origin [branch-name]

# Check what's been pushed
git log origin/[branch-name]..HEAD
```

### GitHub PR Verification
```bash
# Using GitHub CLI (if available)
gh pr list --repo [owner/repo]
gh pr status
gh pr view [pr-number]
```

## Red Flags - STOP and Verify

If you're about to use any of these phrases, **STOP** and verify:

❌ "Merged to main"
❌ "Successfully merged into main branch"
❌ "Deployed"
❌ "Live in production"
❌ "Available to users"
❌ "Changes are merged"
❌ "Work is deployed"

## Communication Templates

### ✅ Sandbox Work Completion
```
✅ Work completed in feature branch `[branch-name]` - ready for PR creation

**Status**: Development complete in sandbox environment
**Branch**: `[specific-branch-name]`
**Next Step**: Create PR to merge into main branch
**User Impact**: No user-visible changes yet
```

### ✅ Child Agent Integration
```
🔄 Child agent work integrated into parent branch `[branch-name]`

**Status**: Sub-agent changes consolidated
**Environment**: Development/coordination branch
**Next Step**: Parent agent will create final PR
**User Impact**: No user-visible changes yet
```

### ✅ PR Creation Ready
```
📝 Implementation complete - ready to create PR to main

**Status**: Code ready for review and merge
**Branch**: `[feature-branch-name]`
**Tests**: All passing
**Next Step**: Submit PR for review and approval
```

### ✅ Actual Main Branch Merge
```
🎉 PR #[number] successfully merged to main branch

**Status**: Changes officially integrated into main
**PR**: [Link to merged PR]
**Verification**: Confirmed via GitHub PR status
**Next Step**: Monitor deployment pipeline
```

### ✅ Production Deployment
```
🌐 Changes deployed and accessible to users

**Status**: Feature live in production
**Verification**: Tested user access
**Access**: Users can now access new functionality
**Monitoring**: Deployment successful and stable
```

## Self-Check Questions

Before sending any status update, ask yourself:

1. **Have I verified my claims?** Did I run the verification commands?
2. **Am I being specific?** Do I include branch names, PR numbers, environment details?
3. **Am I being accurate?** Do my claims match the actual technical state?
4. **Would this mislead users?** Could someone misunderstand the deployment status?
5. **Can I prove this?** Could I demonstrate the status I'm claiming?

## When in Doubt

**If you're uncertain about status**:
- Use more conservative language
- Be explicit about environment (sandbox, development, etc.)
- Ask for clarification
- Verify with git commands
- Check GitHub directly

**Better to under-promise than over-promise on deployment status.**

## Escalation

If you're unsure about proper status language:
1. Review this checklist
2. Check the [Agent Communication Guidelines](./agent_communication_guidelines.md)
3. Ask parent agent for clarification
4. Use conservative language until verified

## Remember

**The goal is accurate, clear communication that doesn't mislead users about deployment status.**

When in doubt, be specific about environment and verify before claiming any deployment status.

