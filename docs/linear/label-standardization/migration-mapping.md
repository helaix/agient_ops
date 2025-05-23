# Label Migration Mapping

## Overview

This document provides the complete mapping between existing labels and the new standardized taxonomy, including the specific Linear API operations needed for migration.

## Current Label Inventory

Based on the Linear API response, here are all existing labels with their IDs:

| Current Label | Label ID | Category | Status |
|---------------|----------|----------|---------|
| `iac` | `aceb8c11-ad59-409d-acdb-99bc487071ee` | Technical | Replace |
| `high-priority` | `7092d88d-2293-4619-a932-04a877cf0fc4` | Priority | Replace |
| `workplan` | `0724aeff-9647-4033-9b77-8f70467f1ce2` | Workflow | Keep |
| `Epic` | `ab365cc8-bebe-4b2c-9507-4aa2aa2020b1` | Type | Replace |
| `good first issue` | `b36ca67d-9479-416d-9d9c-d1572c1f5384` | Status | Replace |
| `Documentation` | `d859980a-84bd-4505-8953-8065acc923b7` | Type | Replace |
| `Complexity: 4` | `27037d6f-8b3f-44cc-ae89-9e65148cad60` | Effort | Replace |
| `Slice C` | `2a9fa12e-3959-494b-9ad3-5c4da74e632b` | Organizational | Archive |
| `Slice B` | `1eaafa8f-f659-4672-82c5-7d7e360b099f` | Organizational | Archive |
| `Slice A` | `3792bff0-8db7-4a23-a9f9-519c76ccc9c4` | Organizational | Archive |
| `Analytics` | `9ff07dd3-eafc-4bae-bc11-c6560b112394` | Business | Keep |
| `B2B Outreach` | `0c3c1298-b54a-444d-9367-def98ae895ee` | Business | Keep |
| `SEO Expansion` | `2eba520c-6db6-4a89-b608-e4f4249719e0` | Business | Keep |
| `Ad Campaign` | `8273b756-34a7-4cc1-a132-4387a205b918` | Business | Keep |
| `native` | `5a1d4267-7e7b-44d9-94a0-d6c6c40a1f52` | Technical | Archive |
| `Feature` | `f1359a74-0ff5-4225-9419-1b71bd9caede` | Type | Replace |
| `Bug` | `7718a2c0-5e26-43fd-8fd1-0138518895b5` | Type | Replace |
| `Improvement` | `017f4ad6-b1f6-4838-8d6c-f0aa611156b4` | Type | Replace |

## Migration Strategy

### Labels to Replace

#### Type Labels
| Old Label | New Label | Migration Action |
|-----------|-----------|------------------|
| `Feature` | `type:feature` | Replace on all issues |
| `Bug` | `type:bug` | Replace on all issues |
| `Improvement` | `type:improvement` | Replace on all issues |
| `Documentation` | `type:documentation` | Replace on all issues |
| `Epic` | `type:epic` | Replace on all issues |

#### Priority Labels
| Old Label | New Label | Migration Action |
|-----------|-----------|------------------|
| `high-priority` | `priority:high` | Replace on all issues |
| (none) | `priority:medium` | Add to unlabeled issues |
| (none) | `priority:low` | Add to unlabeled issues |
| (none) | `priority:urgent` | Add as needed |

#### Effort Labels
| Old Label | New Label | Migration Action |
|-----------|-----------|------------------|
| `Complexity: 4` | `effort:xl` | Replace on all issues |
| (none) | `effort:xs` | Add as needed |
| (none) | `effort:s` | Add as needed |
| (none) | `effort:m` | Add as needed |
| (none) | `effort:l` | Add as needed |

#### Component Labels
| Old Label | New Label | Migration Action |
|-----------|-----------|------------------|
| `iac` | `component:infrastructure` | Replace on all issues |
| (none) | `component:frontend` | Add as needed |
| (none) | `component:backend` | Add as needed |
| (none) | `component:ai` | Add as needed |
| (none) | `component:analytics` | Add as needed |

#### Status Labels
| Old Label | New Label | Migration Action |
|-----------|-----------|------------------|
| `good first issue` | `status:good-first-issue` | Replace on all issues |
| (none) | `status:blocked` | Add as needed |
| (none) | `status:needs-review` | Add as needed |
| (none) | `status:ready-for-dev` | Add as needed |

### Labels to Keep
These labels will remain unchanged:
- `workplan` - Workflow planning label
- `Analytics` - Business-specific label
- `B2B Outreach` - Business-specific label
- `SEO Expansion` - Business-specific label
- `Ad Campaign` - Business-specific label

### Labels to Archive
These labels will be removed from all issues and archived:
- `Slice A` - Organizational label no longer needed
- `Slice B` - Organizational label no longer needed
- `Slice C` - Organizational label no longer needed
- `native` - Technical label no longer needed

## New Labels to Create

### Type Labels
- `type:feature` (Color: #0052CC - Blue)
- `type:bug` (Color: #DE350B - Red)
- `type:improvement` (Color: #00875A - Green)
- `type:documentation` (Color: #5E4DB2 - Purple)
- `type:epic` (Color: #FF8B00 - Orange)

### Priority Labels
- `priority:urgent` (Color: #DE350B - Red)
- `priority:high` (Color: #FF8B00 - Orange)
- `priority:medium` (Color: #FFAB00 - Yellow)
- `priority:low` (Color: #36B37E - Light Green)

### Effort Labels
- `effort:xs` (Color: #B3D4FF - Light Blue)
- `effort:s` (Color: #79E2F2 - Cyan)
- `effort:m` (Color: #ABF5D1 - Light Green)
- `effort:l` (Color: #FFE380 - Light Yellow)
- `effort:xl` (Color: #FFBDAD - Light Red)

### Component Labels
- `component:infrastructure` (Color: #6554C0 - Purple)
- `component:frontend` (Color: #00B8D9 - Teal)
- `component:backend` (Color: #00875A - Green)
- `component:ai` (Color: #FF5630 - Red-Orange)
- `component:analytics` (Color: #403294 - Dark Purple)

### Status Labels
- `status:blocked` (Color: #97A0AF - Gray)
- `status:needs-review` (Color: #FFAB00 - Yellow)
- `status:ready-for-dev` (Color: #36B37E - Green)
- `status:good-first-issue` (Color: #B3D4FF - Light Blue)

### Project Labels
- `project:dstys` (Color: #0052CC - Blue)
- `project:sparkflow` (Color: #00875A - Green)
- `project:summit-asphalt` (Color: #FF8B00 - Orange)
- `project:hello-operator` (Color: #5E4DB2 - Purple)

## Implementation Script

The migration will be implemented using the Linear API with the following steps:

1. **Create New Labels**: Use Linear API to create all new labels with specified colors
2. **Update Issues**: For each issue, replace old labels with new ones
3. **Archive Old Labels**: Remove old labels from the system

### API Operations Required

```javascript
// Example API calls for migration
// 1. Create new labels
await linear.createLabel({
  name: "type:feature",
  color: "#0052CC",
  teamId: "b98d6ca1-f890-45f9-9ff1-d1b47c2f3645"
});

// 2. Update issues
await linear.updateIssue(issueId, {
  labelIds: [newLabelIds]
});

// 3. Archive old labels (if supported)
await linear.archiveLabel(oldLabelId);
```

## Validation Checklist

After migration, validate:
- [ ] All new labels created with correct names and colors
- [ ] All issues have appropriate new labels
- [ ] No issues have old labels that should be replaced
- [ ] Business labels (`Analytics`, `B2B Outreach`, etc.) preserved
- [ ] Organizational labels (`Slice A/B/C`) removed
- [ ] Team can filter and search using new label system

## Rollback Plan

If issues arise during migration:
1. **Stop Migration**: Halt any in-progress label updates
2. **Assess Impact**: Identify which issues were affected
3. **Restore Labels**: Re-apply original labels to affected issues
4. **Fix Issues**: Address root cause of migration problems
5. **Resume**: Continue migration with fixes applied

## Post-Migration Tasks

1. **Update Documentation**: Ensure all team documentation reflects new labels
2. **Train Team**: Conduct training session on new labeling system
3. **Create Templates**: Set up issue templates with appropriate label suggestions
4. **Monitor Usage**: Track label usage patterns for optimization
5. **Gather Feedback**: Collect team feedback on new system effectiveness

