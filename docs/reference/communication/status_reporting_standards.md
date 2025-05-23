# Status Reporting Standards

## Mission Directive

**CRITICAL**: Accurate status communication is essential for mission success. Never claim deployment, merge, or completion status without proper verification.

## Core Status Verification Requirements

### Mandatory Verification Protocol
Before claiming ANY status, agents MUST verify:

```bash
# 1. Check current branch and status
git status
git branch -a

# 2. Verify remote branch status
git log --oneline -5
git remote -v

# 3. Check PR status (if applicable)
gh pr status

# 4. Verify deployment status (if applicable)
# Check actual deployment endpoints/systems
```

### Status Terminology Standards

#### ✅ **Approved Status Language**

**Sandbox/Feature Branch Work**:
- "Working in feature branch [branch-name]"
- "Changes committed to sandbox branch"
- "Development in progress on feature branch"
- "Code changes ready for PR creation"

**Child Agent Integration**:
- "Child agent work completed in branch [branch-name]"
- "Sub-task changes ready for integration"
- "Child agent deliverables available for review"

**PR Readiness**:
- "Changes ready for pull request creation"
- "Feature branch prepared for PR submission"
- "Code review ready - awaiting PR creation"

**Actual Main Branch Merge**:
- "Pull request merged to main branch"
- "Changes successfully integrated into main"
- "Feature merged and available in main branch"

**User-Accessible Deployment**:
- "Changes deployed to [specific environment]"
- "Feature live in production environment"
- "User-accessible deployment confirmed"

#### ❌ **Prohibited Status Language**

**Never Use Unless Actually True**:
- "Deployed" (when only in sandbox/feature branch)
- "Live" (when only in PR or local branch)
- "Complete" (when only committed locally)
- "Merged" (when only in feature branch)
- "Available to users" (when not actually deployed)

**Misleading Phrases to Avoid**:
- "Ready for users" (when not deployed)
- "In production" (when only in staging)
- "Finished" (when only locally committed)
- "Done" (without specifying completion level)

## Status Verification Checklist

### Before Claiming Any Deployment Status

#### 1. Branch Status Verification
```bash
# Check actual branch status
git branch -a
git status
git log --oneline -3
```

#### 2. PR Status Verification
```bash
# Check PR status
gh pr list
gh pr status
# Verify PR is actually merged, not just created
```

#### 3. Deployment Status Verification
```bash
# Check actual deployment
curl -I [deployment-url]
# Verify application is running
# Check deployment logs/status
```

### Verification Checklist
- [ ] Current branch confirmed
- [ ] Remote branch status verified
- [ ] PR status checked (if applicable)
- [ ] Deployment status confirmed (if claiming deployment)
- [ ] User accessibility verified (if claiming user access)

## Communication Templates

### Template 1: Sandbox Work Completion
```markdown
**Status**: Feature development completed in sandbox branch `[branch-name]`
**Progress**: [Specific accomplishments]
**Next Steps**: Ready for PR creation and code review
**Verification**: Changes committed and pushed to feature branch
```

### Template 2: Child Agent Integration
```markdown
**Status**: Child agent work completed and ready for integration
**Branch**: `[child-agent-branch-name]`
**Deliverables**: [Specific outputs completed]
**Integration Status**: Ready for parent agent review and merge
```

### Template 3: PR Creation Ready
```markdown
**Status**: Changes ready for pull request submission
**Branch**: `[feature-branch-name]`
**Scope**: [What changes are included]
**Next Steps**: Creating PR for code review
```

### Template 4: Actual Main Branch Merge
```markdown
**Status**: Pull request #[number] successfully merged to main branch
**Verification**: Changes confirmed in main branch via git log
**Impact**: [What functionality is now available in main]
**Next Steps**: [Deployment planning or next phase]
```

### Template 5: Production Deployment
```markdown
**Status**: Changes successfully deployed to production
**Environment**: [Specific deployment environment]
**Verification**: [How deployment was confirmed]
**User Impact**: [What users can now access]
**Monitoring**: [How deployment is being monitored]
```

## Error Prevention Measures

### Mandatory Verification Steps
1. **Always Check Git Status**: Before any status claim
2. **Verify Remote State**: Ensure remote branches reflect claims
3. **Confirm PR Status**: Check actual merge status, not just creation
4. **Test Deployment**: Verify actual user accessibility
5. **Document Verification**: Include verification steps in status reports

### Red Flags to Avoid
- Claiming deployment without testing access
- Saying "merged" when only PR was created
- Using "complete" without specifying completion level
- Claiming user access without verification
- Mixing sandbox work with production claims

### Quality Assurance
- **Double-Check**: Verify status claims before communication
- **Be Specific**: Use precise language about actual state
- **Include Evidence**: Provide verification details when possible
- **Ask for Clarification**: If unsure about status, ask before claiming

## Status Escalation Procedures

### When Status is Unclear
1. **Stop and Verify**: Do not proceed with uncertain status claims
2. **Gather Evidence**: Use git commands and system checks
3. **Ask for Help**: Request clarification from team members
4. **Document Uncertainty**: Clearly state what is unknown

### When Status Claims are Challenged
1. **Provide Evidence**: Share verification commands and outputs
2. **Acknowledge Errors**: If wrong, correct immediately
3. **Update Procedures**: Learn from mistakes to prevent recurrence
4. **Communicate Corrections**: Inform all affected parties

## Monitoring and Compliance

### Self-Monitoring
- Review status communications for accuracy
- Verify claims before sending
- Track patterns in status reporting
- Identify areas for improvement

### Team Monitoring
- Peer review of status communications
- Regular audits of status accuracy
- Feedback on communication effectiveness
- Shared learning from status errors

### Continuous Improvement
- Regular review of status reporting procedures
- Updates based on lessons learned
- Training on new verification techniques
- Process refinement based on feedback

