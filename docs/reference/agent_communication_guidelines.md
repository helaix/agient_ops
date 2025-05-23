# Agent Communication Guidelines - Status Language Standards

## Overview

This document establishes clear communication standards for agents to prevent misleading status language about deployment and merge states. These guidelines address the root cause of confusion where agents incorrectly communicate deployment status.

## The Problem

**Issue Identified**: Agents using misleading language like "successfully merged into main branch" when work was only merged between feature branches in sandbox environment, creating confusion about actual deployment status.

## Status Terminology Standards

### ✅ **Approved Status Language**

#### Sandbox/Feature Branch Work
- "✅ Work completed in feature branch `[branch-name]`"
- "🔧 Implementation finished in sandbox environment"
- "📁 Changes ready in feature branch `[branch-name]`"
- "⚡ Development work completed on branch `[branch-name]`"

#### Child Agent Integration
- "🔄 Child agent work integrated into parent branch `[branch-name]`"
- "🔗 Sub-agent changes merged into coordination branch"
- "📦 Component work consolidated in `[parent-branch]`"

#### PR Readiness
- "📝 Implementation complete - ready to create PR to main"
- "🚀 Code ready for pull request creation"
- "✨ Work prepared for main branch integration"
- "🎯 Ready to submit PR for review"

#### Actual Main Branch Merge
- "🎉 PR #[number] successfully merged to main branch"
- "✅ Changes officially merged to main via PR #[number]"
- "🏆 Work deployed to main branch through PR #[number]"

#### User-Accessible Deployment
- "🌐 Changes deployed and accessible to users"
- "📱 Feature live in production environment"
- "🚀 Deployment complete - users can access new functionality"

### ❌ **Prohibited Status Language**

#### Never Use Unless Actually True
- "Merged to main" (only when PR is actually merged to main)
- "Deployed" (only when changes are user-accessible)
- "Live in production" (only when actually deployed)
- "Available to users" (only when truly accessible)

#### Misleading Phrases to Avoid
- "Successfully merged into main branch" (when only merged to feature branch)
- "Work is deployed" (when only completed in sandbox)
- "Changes are live" (when only in development environment)
- "Merged and ready" (ambiguous about merge destination)

## Status Verification Protocol

### Before Claiming Any Deployment Status

Agents **MUST** verify the following before making status claims:

#### 1. Branch Status Verification
```bash
# Check actual branch status
git branch -r
git status
git log --oneline -5
```

#### 2. PR Status Verification
- Check if PR exists: Search GitHub for related PRs
- Verify PR merge status: Confirm if PR is actually merged
- Validate merge destination: Ensure PR targets correct branch

#### 3. Deployment Status Verification
- Confirm changes are user-accessible
- Verify production deployment status
- Check if feature is actually live

### Verification Checklist

Before claiming status, agents must confirm:

- [ ] **Branch Location**: Where exactly are the changes?
- [ ] **PR Status**: Does a PR exist? Is it merged?
- [ ] **Merge Destination**: What branch was actually merged to?
- [ ] **User Access**: Can users actually access the changes?
- [ ] **Environment**: Development, staging, or production?

## Communication Templates

### Template 1: Sandbox Work Completion
```
✅ Work completed in feature branch `[branch-name]` - ready for PR creation

**Status**: Development complete in sandbox environment
**Next Step**: Create PR to merge into main branch
**User Impact**: No user-visible changes yet
```

### Template 2: Child Agent Integration
```
🔄 Child agent work integrated into parent branch `[branch-name]`

**Status**: Sub-agent changes consolidated
**Environment**: Development/coordination branch
**Next Step**: Parent agent will create final PR
```

### Template 3: PR Creation Ready
```
📝 Implementation complete - ready to create PR to main

**Status**: Code ready for review and merge
**Branch**: `[feature-branch-name]`
**Next Step**: Submit PR for review and approval
```

### Template 4: Actual Main Branch Merge
```
🎉 PR #[number] successfully merged to main branch

**Status**: Changes officially integrated into main
**PR**: [Link to merged PR]
**Next Step**: Monitor deployment pipeline
```

### Template 5: Production Deployment
```
🌐 Changes deployed and accessible to users

**Status**: Feature live in production
**Access**: Users can now access new functionality
**Monitoring**: Deployment successful and stable
```

## Implementation Requirements

### For All Agents

1. **Use Verification Protocol**: Always verify status before claiming
2. **Use Approved Templates**: Follow standardized communication formats
3. **Be Specific**: Include branch names, PR numbers, and environment details
4. **Avoid Ambiguity**: Never use prohibited language
5. **Verify Before Claiming**: Double-check actual status

### For Parent Agents

1. **Monitor Child Agent Language**: Ensure sub-agents follow guidelines
2. **Correct Misleading Language**: Address incorrect status claims immediately
3. **Provide Clear Instructions**: Include communication expectations in delegation
4. **Model Good Behavior**: Use proper status language consistently

### For Child Agents

1. **Report Accurate Status**: Only claim what has actually been accomplished
2. **Use Sandbox Language**: Clearly indicate when work is in development environment
3. **Avoid Deployment Claims**: Don't claim deployment unless verified
4. **Ask When Uncertain**: Request clarification about status language

## Error Prevention Measures

### Mandatory Verification Steps

Before any status communication, agents must:

1. **Check Git Status**: Verify actual branch and commit status
2. **Confirm Environment**: Identify development vs. production environment
3. **Validate Claims**: Ensure status claims match reality
4. **Use Templates**: Follow approved communication formats

### Red Flags to Avoid

- Claiming "merged to main" without PR verification
- Using "deployed" for sandbox work
- Saying "live" for development changes
- Ambiguous merge language without specifics

### Quality Assurance

- **Self-Check**: Review message before sending
- **Verification**: Confirm technical claims are accurate
- **Clarity**: Ensure message clearly indicates environment and status
- **Consistency**: Use approved terminology and templates

## Training and Enforcement

### Agent Training Requirements

1. **Understand Environments**: Know difference between sandbox, staging, production
2. **Learn Verification Steps**: Master status verification protocol
3. **Practice Templates**: Use approved communication formats
4. **Recognize Red Flags**: Identify and avoid misleading language

### Monitoring and Feedback

1. **Regular Review**: Monitor agent communications for compliance
2. **Immediate Correction**: Address misleading language promptly
3. **Pattern Analysis**: Identify recurring communication issues
4. **Continuous Improvement**: Update guidelines based on feedback

## Examples

### ✅ Good Communication Examples

**Sandbox Work Completion**:
> "✅ Work completed in feature branch `feature/user-authentication` - ready for PR creation. Implementation includes login form validation and JWT token handling. Next step: Create PR to merge into main branch."

**Child Agent Integration**:
> "🔄 Child agent work integrated into parent branch `feature/hlx-1234-user-management`. Database schema changes and API endpoints have been consolidated. Parent agent can now create final PR."

**PR Ready**:
> "📝 Implementation complete - ready to create PR to main. All tests passing, code reviewed, and documentation updated. Branch: `feature/payment-integration`"

### ❌ Bad Communication Examples

**Misleading Deployment Claim**:
> "🎉 Successfully merged into main branch and deployed!" 
> *(When only merged between feature branches)*

**Ambiguous Status**:
> "Work is merged and ready!"
> *(Unclear what was merged where)*

**False Deployment Claim**:
> "Feature is now live for users!"
> *(When only completed in development)*

## Conclusion

These guidelines ensure accurate, clear communication about work status and prevent user confusion about deployment states. All agents must follow these standards to maintain trust and clarity in project communications.

**Remember**: When in doubt, be specific about environment and verify before claiming any deployment status.

