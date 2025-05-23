# Linear Labeling Guidelines

## Overview

This document provides comprehensive guidelines for using the standardized label system in the Helaix Linear workspace. Following these guidelines ensures consistent issue organization and improves team workflow efficiency.

## Quick Reference

### Required Labels
Every issue **MUST** have:
- ✅ Exactly one `type:` label
- ✅ Exactly one `priority:` label

### Optional Labels
Issues **MAY** have:
- `effort:` labels for planning and estimation
- `component:` labels for technical categorization
- `status:` labels for workflow management
- `project:` labels for project-specific work
- Business labels (`Analytics`, `B2B Outreach`, etc.)

## Label Categories

### 1. Type Labels (Required)

**Purpose**: Categorize the fundamental nature of the work

| Label | When to Use | Examples |
|-------|-------------|----------|
| `type:feature` | New functionality or capabilities | "Add user authentication", "Implement search feature" |
| `type:bug` | Defects, errors, or incorrect behavior | "Login button not working", "Data not saving properly" |
| `type:improvement` | Enhancements to existing features | "Optimize database queries", "Improve UI responsiveness" |
| `type:documentation` | Writing, updating, or organizing docs | "Update API documentation", "Create user guide" |
| `type:epic` | Large initiatives spanning multiple issues | "Redesign user dashboard", "Implement payment system" |

**Rules**:
- Every issue must have exactly one type label
- Choose the primary purpose if an issue could fit multiple types
- Use `type:epic` for work that will be broken into sub-issues

### 2. Priority Labels (Required)

**Purpose**: Indicate business importance and urgency

| Label | When to Use | SLA | Examples |
|-------|-------------|-----|----------|
| `priority:urgent` | Blocking production, security issues | Same day | "Site down", "Security vulnerability", "Data loss" |
| `priority:high` | Important business value, clear ROI | 1-3 days | "Key feature for client demo", "Performance bottleneck" |
| `priority:medium` | Standard planned work | 1-2 weeks | "Planned feature development", "Routine maintenance" |
| `priority:low` | Nice-to-have, future consideration | No SLA | "UI polish", "Code cleanup", "Future enhancements" |

**Rules**:
- Every issue must have exactly one priority label
- Default to `priority:medium` if unsure
- `priority:urgent` should be rare and require justification
- Review priorities regularly as business needs change

### 3. Effort Labels (Optional)

**Purpose**: Estimate work complexity for planning

| Label | Time Estimate | When to Use | Examples |
|-------|---------------|-------------|----------|
| `effort:xs` | 1-2 hours | Quick fixes, small tweaks | "Fix typo", "Update config value" |
| `effort:s` | 1-2 days | Small features, minor bugs | "Add validation", "Fix styling issue" |
| `effort:m` | 3-5 days | Medium features, complex bugs | "Implement new API endpoint", "Refactor component" |
| `effort:l` | 1-2 weeks | Large features, significant changes | "Build new dashboard", "Integrate third-party service" |
| `effort:xl` | 2+ weeks | Major initiatives, architectural changes | "Redesign database schema", "Implement new framework" |

**Rules**:
- Use for planning and sprint sizing
- Estimate based on implementation time, not total calendar time
- Re-evaluate if actual effort differs significantly from estimate
- Consider breaking down `effort:xl` issues into smaller pieces

### 4. Component Labels (Optional)

**Purpose**: Categorize by technical area or system component

| Label | When to Use | Examples |
|-------|-------------|----------|
| `component:infrastructure` | DevOps, deployment, infrastructure | "Set up CI/CD", "Configure monitoring", "Update server" |
| `component:frontend` | UI, UX, client-side code | "Update React component", "Fix CSS styling", "Add form validation" |
| `component:backend` | Server-side, APIs, databases | "Create API endpoint", "Optimize database query", "Add authentication" |
| `component:ai` | Machine learning, AI features | "Train model", "Implement recommendation engine", "Add NLP processing" |
| `component:analytics` | Tracking, metrics, data analysis | "Add event tracking", "Create dashboard", "Implement A/B testing" |

**Rules**:
- Use when technical categorization is helpful
- Can combine multiple component labels if work spans areas
- Helps with team assignment and expertise matching

### 5. Status Labels (Optional)

**Purpose**: Track workflow state and blockers

| Label | When to Use | Next Action |
|-------|-------------|-------------|
| `status:blocked` | Cannot proceed due to dependencies | Identify and resolve blocker |
| `status:needs-review` | Ready for code review or approval | Assign reviewer |
| `status:ready-for-dev` | Fully specified and ready to start | Assign to developer |
| `status:good-first-issue` | Good for new team members | Assign to junior developer or newcomer |

**Rules**:
- Use to communicate current state
- Update as status changes
- `status:blocked` should include blocker details in description
- Remove status labels when no longer applicable

### 6. Project Labels (Optional)

**Purpose**: Associate work with specific projects

| Label | When to Use |
|-------|-------------|
| `project:dstys` | Work specific to the DSTyS project |
| `project:sparkflow` | Work specific to the Sparkflow project |
| `project:summit-asphalt` | Work specific to the Summit Asphalt project |
| `project:hello-operator` | Work specific to the Hello Operator project |

**Rules**:
- Use when work is project-specific
- Helps with project planning and resource allocation
- Can be combined with other labels

### 7. Business Labels (Special)

**Purpose**: Business-specific categorization

These labels are maintained for business purposes:
- `Analytics` - Analytics-related work
- `B2B Outreach` - Business development activities
- `SEO Expansion` - SEO and content marketing
- `Ad Campaign` - Advertising and marketing campaigns
- `workplan` - Planning and strategy work

**Rules**:
- Use as appropriate for business categorization
- Can be combined with technical labels
- Maintained for historical continuity

## Label Combination Examples

### Good Combinations

**Feature Development**:
```
type:feature + priority:high + effort:m + component:frontend + project:dstys
```

**Critical Bug Fix**:
```
type:bug + priority:urgent + effort:s + component:backend + status:ready-for-dev
```

**Documentation Task**:
```
type:documentation + priority:medium + effort:xs + status:good-first-issue
```

**Large Initiative**:
```
type:epic + priority:high + effort:xl + project:sparkflow + Analytics
```

**Blocked Work**:
```
type:improvement + priority:medium + effort:l + component:infrastructure + status:blocked
```

### Common Mistakes

❌ **Multiple Type Labels**:
```
type:feature + type:improvement  // Wrong - choose one
```

❌ **Multiple Priority Labels**:
```
priority:high + priority:urgent  // Wrong - choose one
```

❌ **Inconsistent Effort/Priority**:
```
priority:urgent + effort:xl  // Questionable - urgent work should be smaller
```

## Workflow Integration

### Issue Creation
1. **Start with required labels**: Add `type:` and `priority:`
2. **Add effort estimate**: Include `effort:` for planning
3. **Specify component**: Add `component:` if technical work
4. **Set initial status**: Add `status:ready-for-dev` if fully specified

### During Development
1. **Update status**: Add `status:needs-review` when ready
2. **Handle blockers**: Add `status:blocked` and document blocker
3. **Adjust estimates**: Update `effort:` if significantly different

### Issue Completion
1. **Remove status labels**: Clean up workflow labels
2. **Update effort**: Note actual vs. estimated effort
3. **Document learnings**: Add comments for future reference

## Quality Assurance

### Label Auditing
- Review label usage monthly
- Identify inconsistent patterns
- Update guidelines based on learnings

### Common Issues
- **Missing required labels**: Automated checks should catch these
- **Inconsistent effort estimates**: Review and calibrate regularly
- **Stale status labels**: Clean up during sprint reviews

### Metrics to Track
- Label usage distribution
- Effort estimate accuracy
- Priority distribution
- Component workload balance

## Team Training

### New Team Members
1. Review this guide
2. Practice labeling on sample issues
3. Shadow experienced team member
4. Start with `status:good-first-issue` items

### Regular Training
- Monthly label review sessions
- Share labeling best practices
- Discuss edge cases and decisions
- Update guidelines based on feedback

## Troubleshooting

### When Labels Don't Fit
- **Multiple types**: Choose the primary purpose
- **Unclear priority**: Default to `priority:medium` and discuss
- **Complex effort**: Break into smaller issues
- **Missing component**: Create new component label if needed

### Label Conflicts
- **Business vs. Technical**: Use both when appropriate
- **Project overlap**: Choose primary project or use multiple
- **Status confusion**: Document current state clearly

### Getting Help
- Ask in team chat for labeling questions
- Escalate to team lead for new label requests
- Document decisions for future reference

## Maintenance

### Regular Reviews
- Monthly label usage analysis
- Quarterly guideline updates
- Annual taxonomy review

### Continuous Improvement
- Collect team feedback
- Monitor labeling consistency
- Adjust guidelines as needed
- Share learnings across teams

---

*Last updated: [Current Date]*
*Next review: [Monthly]*

