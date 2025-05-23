# Phase 2.2: Label Migration & Standardization Guide

## Overview

This guide documents the comprehensive migration from our current 18-label system to a new structured taxonomy with 6 categories and 29+ labels. This migration is part of the larger Linear workspace organization initiative (HLX-1837).

## Migration Goals

### Current Problems
- **Inconsistent naming**: Mix of formats (`Feature` vs `high-priority`)
- **Missing priority system**: Only one priority level (`high-priority`)
- **No effort estimation**: Only one complexity label (`Complexity: 4`)
- **Limited categorization**: No clear component or status labels
- **Organizational clutter**: Slice labels that are no longer relevant

### Target Benefits
- **Structured taxonomy**: 6 clear categories with consistent naming
- **Complete priority system**: 4 priority levels for better triage
- **Effort estimation**: 5 effort levels for planning
- **Component clarity**: Clear technical area identification
- **Status tracking**: Better workflow state management
- **Project association**: Clear project relationships

## New Label Taxonomy

### 1. Type Labels (Required)
Every issue must have exactly one type label.

| Label | Description | Use When |
|-------|-------------|----------|
| `type:feature` | New feature or functionality | Adding new capabilities |
| `type:bug` | Something isn't working | Fixing broken functionality |
| `type:improvement` | Enhancement to existing functionality | Optimizing or enhancing existing features |
| `type:documentation` | Improvements or additions to documentation | Writing or updating docs |
| `type:epic` | Large feature spanning multiple issues | Major initiatives requiring breakdown |

### 2. Priority Labels (Required)
Every issue must have exactly one priority label.

| Label | Description | SLA | Use When |
|-------|-------------|-----|----------|
| `priority:urgent` | Needs immediate attention | Same day | Production down, security issues |
| `priority:high` | Should be addressed soon | Within week | Important features, significant bugs |
| `priority:medium` | Standard priority (default) | Within sprint | Regular development work |
| `priority:low` | Can be addressed later | When capacity allows | Nice-to-have improvements |

### 3. Effort Labels (Optional)
Estimate time/complexity required. Use one per issue.

| Label | Description | Time Estimate | Use When |
|-------|-------------|---------------|----------|
| `effort:xs` | Extra small effort | 1-2 hours | Quick fixes, small tweaks |
| `effort:s` | Small effort | 1-2 days | Simple features, minor bugs |
| `effort:m` | Medium effort | 3-5 days | Standard features, moderate complexity |
| `effort:l` | Large effort | 1-2 weeks | Complex features, major refactoring |
| `effort:xl` | Extra large effort | 2+ weeks | Major initiatives, architectural changes |

### 4. Component Labels (Optional)
Identify technical area. Can use multiple per issue.

| Label | Description | Use When |
|-------|-------------|----------|
| `component:infrastructure` | Infrastructure, deployment, DevOps | CI/CD, hosting, monitoring |
| `component:frontend` | Frontend, UI, user-facing | React, styling, user experience |
| `component:backend` | Backend, API, server-side | APIs, databases, business logic |
| `component:ai` | AI/ML, LLM integration | AI features, model integration |
| `component:analytics` | Analytics, tracking, data | Metrics, tracking, data analysis |

### 5. Status Labels (Optional)
Indicate current state or blockers. Can use multiple per issue.

| Label | Description | Use When |
|-------|-------------|----------|
| `status:blocked` | Blocked by external dependency | Waiting on external factors |
| `status:needs-review` | Needs review or approval | Ready for code/design review |
| `status:ready-for-dev` | Ready for development | Fully specified and ready to start |
| `status:good-first-issue` | Good for newcomers | Simple issues for new team members |

### 6. Project Labels (Optional)
Associate with specific projects. Use one per issue.

| Label | Description | Use When |
|-------|-------------|----------|
| `project:dstys` | DSTyS project | Issues related to DSTyS |
| `project:sparkflow` | Sparkflow project | Issues related to Sparkflow |
| `project:summit-asphalt` | Summit Asphalt project | Issues related to Summit Asphalt |
| `project:hello-operator` | Hello Operator project | Issues related to Hello Operator |

## Migration Mapping

### Direct Label Replacements

| Old Label | New Label | Notes |
|-----------|-----------|-------|
| `Feature` | `type:feature` | Direct mapping |
| `Bug` | `type:bug` | Direct mapping |
| `Improvement` | `type:improvement` | Direct mapping |
| `Documentation` | `type:documentation` | Direct mapping |
| `Epic` | `type:epic` | Direct mapping |
| `high-priority` | `priority:high` | Direct mapping |
| `good first issue` | `status:good-first-issue` | Direct mapping |
| `Complexity: 4` | `effort:xl` | Direct mapping |
| `iac` | `component:infrastructure` | Direct mapping |

### Labels Being Preserved

These business and workflow labels will remain unchanged:
- `Analytics` (business label)
- `B2B Outreach` (business label)
- `SEO Expansion` (business label)
- `Ad Campaign` (business label)
- `workplan` (workflow label)

### Labels Being Archived

These labels will be removed as they're no longer needed:
- `Slice A`, `Slice B`, `Slice C` (organizational - no longer relevant)
- `native` (technical - no longer needed)

### Default Assignments

Issues without required labels will receive defaults:
- **No priority label** → `priority:medium`
- **No type label** → Manual review required (no automatic assignment)

## Migration Process

### Phase 1: Preparation ✅
- [x] Analyze current label usage
- [x] Design new taxonomy structure
- [x] Create migration tools and scripts
- [x] Test migration system

### Phase 2: Label Creation
- [ ] Create all new labels with proper colors and descriptions
- [ ] Validate label taxonomy structure
- [ ] Test label creation process

### Phase 3: Issue Migration
- [ ] Run dry-run migration on all issues
- [ ] Execute live migration with monitoring
- [ ] Validate all issues have required labels
- [ ] Handle edge cases and conflicts

### Phase 4: Cleanup
- [ ] Archive obsolete labels
- [ ] Update team documentation
- [ ] Train team on new system
- [ ] Create labeling guidelines

## Team Guidelines

### For Issue Creation

**Required Steps:**
1. **Always add a type label** (`type:feature`, `type:bug`, etc.)
2. **Always add a priority label** (`priority:medium` is default)

**Recommended Steps:**
3. Add effort estimate if known (`effort:s`, `effort:m`, etc.)
4. Add component labels for technical area
5. Add project label if applicable
6. Add status labels if relevant

### For Issue Triage

**Daily Triage:**
- Review issues in "To Process" state
- Ensure all issues have required labels (type + priority)
- Add missing effort estimates
- Update priority based on business needs

**Weekly Review:**
- Validate effort estimates against actual time
- Review priority distribution
- Update component and status labels as needed

### Label Usage Examples

**Feature Request:**
```
Labels: type:feature, priority:medium, effort:m, component:frontend, project:sparkflow
```

**Critical Bug:**
```
Labels: type:bug, priority:urgent, effort:s, component:backend, status:needs-review
```

**Documentation Task:**
```
Labels: type:documentation, priority:low, effort:xs, status:ready-for-dev
```

**Large Initiative:**
```
Labels: type:epic, priority:high, effort:xl, component:infrastructure, project:dstys
```

## Migration Timeline

### Week 1: Preparation & Testing
- **Day 1-2**: Finalize migration configuration
- **Day 3**: Run comprehensive tests
- **Day 4**: Execute dry-run migration
- **Day 5**: Review dry-run results and adjust

### Week 2: Execution & Validation
- **Day 1**: Execute live migration
- **Day 2**: Validate migration results
- **Day 3**: Handle edge cases and corrections
- **Day 4**: Archive old labels
- **Day 5**: Team training and documentation

## Success Metrics

### Quantitative Goals
- ✅ 100% of issues have required labels (type + priority)
- ✅ 90%+ of issues have effort estimates
- ✅ 80%+ of issues have component labels
- ✅ Zero orphaned or incorrectly labeled issues

### Qualitative Goals
- ✅ Team comfortable with new labeling system
- ✅ Improved issue searchability and filtering
- ✅ Better sprint planning with effort estimates
- ✅ Clearer project organization

## Troubleshooting

### Common Issues

**"I can't find the right label"**
- Check the taxonomy guide above
- Use multiple component labels if needed
- Ask in team chat if unsure

**"Issue has wrong priority"**
- Priority can be updated anytime
- Use business impact to determine priority
- When in doubt, use `priority:medium`

**"Effort estimate was wrong"**
- Update effort label based on actual time
- Use learnings for future estimates
- Document patterns for team reference

### Migration Issues

**"Old label still exists"**
- Some labels may take time to fully archive
- Use new labels for all new issues
- Report persistent old labels to admin

**"Issue missing required labels"**
- Add type and priority labels immediately
- Use `priority:medium` as default
- Review issue description to determine type

## Next Steps

After successful migration:

### Immediate (Week 3)
- [ ] Team training sessions
- [ ] Update all documentation
- [ ] Create quick reference guides
- [ ] Set up automated workflows

### Short-term (Month 1)
- [ ] Monitor label usage patterns
- [ ] Collect team feedback
- [ ] Adjust guidelines based on usage
- [ ] Implement automation rules

### Long-term (Ongoing)
- [ ] Regular label usage reviews
- [ ] Continuous improvement of taxonomy
- [ ] Integration with other tools
- [ ] Advanced workflow automation

## Support

### Resources
- **Migration Tools**: `scripts/linear-label-migration/`
- **Documentation**: This guide and README files
- **Team Chat**: #linear-migration channel
- **Admin Support**: Contact project lead for issues

### Quick Reference
- **All labels must follow**: `category:name` format
- **Required labels**: type + priority
- **Default priority**: `priority:medium`
- **When unsure**: Ask team or use defaults

---

*This guide will be updated as the migration progresses and based on team feedback.*

