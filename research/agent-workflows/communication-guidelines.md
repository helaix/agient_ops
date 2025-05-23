# Agent Communication Guidelines: Preventing Misleading Status Language

## Overview

This document provides comprehensive guidelines for agent communication to prevent misleading language about merge and deployment status. These guidelines address the specific issue where agents use inappropriate language suggesting work is "merged to main" or "deployed" when it's only completed in sandbox environments.

## Core Principles

1. **Precision Over Convenience**: Use precise terminology even if it requires more words
2. **Verification Before Claims**: Always verify actual status before making claims
3. **User-Centric Perspective**: Consider what the user can actually access
4. **Stage-Aware Communication**: Clearly distinguish between different work stages

## Clear Status Terminology

### Approved Status Language

#### ✅ Sandbox/Development Work
- "Work completed in sandbox environment"
- "Development work finished in feature branch"
- "Research completed in development environment"
- "Implementation finished in sandbox"
- "Code changes ready in feature branch"

#### ✅ Integration Work
- "Child agent work integrated into parent branch"
- "Sub-task changes merged into feature branch"
- "Component work consolidated in development branch"
- "Research findings integrated into main analysis"

#### ✅ PR Readiness
- "Ready for PR creation"
- "Prepared for code review"
- "Development complete, awaiting PR"
- "Feature branch ready for merge request"

#### ✅ Actual Deployment
- "Successfully merged to main branch" (only when actually merged to main)
- "Deployed to production" (only when user-accessible)
- "Live for users" (only when actually accessible)
- "Available in production environment"

### Prohibited Status Language

#### ❌ Misleading Merge Language
- "Successfully merged into main branch" (when only merged between feature branches)
- "Merged to main" (when only integrated into feature branch)
- "Code merged" (without specifying which branches)

#### ❌ False Deployment Claims
- "Deployed" (when only completed in sandbox)
- "Live" (when only in development)
- "Available to users" (when only in feature branch)
- "In production" (when only in development environment)

### Status Verification Protocols

#### Pre-Communication Checklist

Before making any status claim, agents must verify:

1. **Actual Git Status**
   ```bash
   # Verify current branch
   git branch --show-current
   
   # Check if changes are in main
   git log main --oneline | head -5
   
   # Verify merge status
   git log --oneline --graph
   ```

2. **Deployment Status**
   - Is the code actually in the main branch?
   - Has a PR been created and merged?
   - Is the feature accessible to end users?
   - Can users actually use the functionality?

3. **Environment Verification**
   - Sandbox/Development: Work completed but not user-accessible
   - Staging: Code integrated but not in production
   - Production: Actually accessible to end users

#### Verification Questions

Before claiming deployment status, ask:
- Can an end user access this feature right now?
- Is this code running in the production environment?
- Would a user see these changes if they used the application?

If the answer to any question is "no," do not use deployment language.

## Workflow State Definitions

### Stage 1: Sandbox Work Completion
**Definition**: Work completed in development environment, not accessible to users

**Appropriate Language**:
- "Development work completed in sandbox"
- "Feature implemented in development environment"
- "Research finished in feature branch"

**Verification**: Code exists in feature branch, not in main

### Stage 2: Feature Branch Integration
**Definition**: Child agent work merged into parent feature branch

**Appropriate Language**:
- "Child agent work integrated into feature branch"
- "Sub-component merged into development branch"
- "Research consolidated in parent branch"

**Verification**: Changes exist in parent feature branch, not in main

### Stage 3: PR Creation Readiness
**Definition**: All development work complete, ready for code review

**Appropriate Language**:
- "Ready for PR creation"
- "Development complete, prepared for review"
- "Feature branch ready for merge request"

**Verification**: All work complete in feature branch, PR not yet created

### Stage 4: PR Created
**Definition**: Pull request created but not yet merged to main

**Appropriate Language**:
- "PR created for review"
- "Code review requested"
- "Merge request submitted"

**Verification**: PR exists but is not merged

### Stage 5: Actual Merge to Main
**Definition**: Code actually merged into main branch

**Appropriate Language**:
- "Successfully merged to main branch"
- "Code integrated into main"
- "Changes now in main branch"

**Verification**: Code exists in main branch history

### Stage 6: User-Accessible Deployment
**Definition**: Feature actually accessible to end users

**Appropriate Language**:
- "Deployed to production"
- "Live for users"
- "Available in production environment"

**Verification**: Users can actually access and use the feature

## Prevention Protocols

### Mandatory Verification Steps

#### Before Any Status Claim
1. **Identify Current Stage**: Determine exact stage of work completion
2. **Verify Environment**: Confirm which environment contains the work
3. **Check User Access**: Verify if users can actually access the feature
4. **Use Appropriate Language**: Select terminology matching the actual stage

#### Status Language Checklist
- [ ] Have I verified the actual git branch status?
- [ ] Have I confirmed whether users can access this feature?
- [ ] Am I using precise language that matches the actual state?
- [ ] Would my status claim mislead users about availability?

### Communication Templates

#### Template: Sandbox Work Completion
```
✅ **Development Work Completed**

**Status**: Work completed in sandbox environment
**Branch**: [feature-branch-name]
**Next Steps**: Ready for integration/PR creation
**User Impact**: None (development only)

**Details**: [Brief description of completed work]
```

#### Template: Feature Branch Integration
```
✅ **Child Agent Work Integrated**

**Status**: Sub-task work merged into parent feature branch
**Branch**: [parent-feature-branch]
**Integration**: [child-branch] → [parent-branch]
**User Impact**: None (development only)

**Details**: [Brief description of integrated work]
```

#### Template: PR Readiness
```
✅ **Ready for PR Creation**

**Status**: Development complete, prepared for code review
**Branch**: [feature-branch-name]
**Next Steps**: Create PR for review and merge
**User Impact**: None (awaiting review and merge)

**Details**: [Brief description of completed work]
```

#### Template: Actual Deployment
```
🚀 **Deployed to Production**

**Status**: Feature live and accessible to users
**Verification**: ✅ Merged to main ✅ Deployed to production
**User Impact**: Full (users can access feature)

**Details**: [Brief description of deployed feature]
```

## Examples of Correct vs. Incorrect Communication

### Scenario 1: Research Completed in Sandbox

#### ❌ Incorrect
"Research successfully merged into main branch and deployed. Users can now access the new insights."

#### ✅ Correct
"Research completed in sandbox environment. Findings documented in feature branch `research/api-analysis`. Ready for integration into main analysis. No user impact (development only)."

### Scenario 2: Child Agent Work Integrated

#### ❌ Incorrect
"Child agent work merged to main and deployed. The authentication feature is now live."

#### ✅ Correct
"Child agent authentication work integrated into parent feature branch `feature/user-system`. Development complete in sandbox. Ready for PR creation. No user impact (development only)."

### Scenario 3: PR Created

#### ❌ Incorrect
"Code merged and deployed. Users can now use the new dashboard."

#### ✅ Correct
"PR created for dashboard feature (#123). Code review requested. Awaiting merge to main branch. No user impact (pending review and merge)."

### Scenario 4: Actual Deployment

#### ❌ Incorrect (if not actually deployed)
"Work completed and deployed to production."

#### ✅ Correct (only if actually deployed)
"🚀 Dashboard feature deployed to production. Verified: ✅ Merged to main ✅ Live in production. Users can now access the new dashboard at /dashboard."

## Implementation Guidelines

### For Individual Agents

1. **Always Use Templates**: Use provided templates for status communications
2. **Verify Before Claiming**: Complete verification checklist before status claims
3. **Be Specific**: Use precise language that matches actual status
4. **Consider User Perspective**: Think about what users can actually access

### For Parent Agents

1. **Model Correct Language**: Demonstrate proper status terminology
2. **Correct Misleading Language**: Address incorrect status claims immediately
3. **Provide Context**: Help child agents understand deployment pipeline
4. **Verify Child Reports**: Confirm child agent status claims before propagating

### For System Integration

1. **Template Enforcement**: Require use of standard templates
2. **Automated Verification**: Implement checks for status accuracy
3. **Real-time Feedback**: Provide immediate correction for misleading language
4. **Training Integration**: Include guidelines in agent training materials

## Monitoring and Improvement

### Success Metrics

1. **Accuracy Rate**: Percentage of status communications using correct terminology
2. **User Confusion**: Reduction in user questions about deployment status
3. **Verification Compliance**: Percentage of agents following verification protocols
4. **Template Usage**: Adoption rate of standard communication templates

### Continuous Improvement

1. **Regular Review**: Periodic assessment of communication patterns
2. **Feedback Integration**: Incorporate user feedback on status clarity
3. **Guideline Updates**: Evolve guidelines based on new scenarios
4. **Training Refinement**: Improve training based on common mistakes

## Conclusion

These guidelines provide a comprehensive framework for preventing misleading status language in agent communications. By following these protocols, agents will provide accurate, user-centric status information that clearly distinguishes between development work completion and actual user-accessible deployment.

The key to success is consistent application of verification protocols and precise use of stage-appropriate terminology. This ensures users receive accurate information about feature availability and deployment status.

