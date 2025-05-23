# Phase 1.3: Label Standardization & Enhancement

This repository contains the implementation of Phase 1.3 of the Helaix Linear workspace organization initiative. The goal is to standardize and enhance the label system for better issue organization and workflow efficiency.

## Overview

The current 18-label system is being transformed into a structured, consistent taxonomy that includes:

- **Type Labels**: `type:feature`, `type:bug`, `type:improvement`, `type:documentation`, `type:epic`
- **Priority Labels**: `priority:urgent`, `priority:high`, `priority:medium`, `priority:low`
- **Effort Labels**: `effort:xs`, `effort:s`, `effort:m`, `effort:l`, `effort:xl`
- **Component Labels**: `component:infrastructure`, `component:frontend`, `component:backend`, `component:ai`, `component:analytics`
- **Status Labels**: `status:blocked`, `status:needs-review`, `status:ready-for-dev`, `status:good-first-issue`
- **Project Labels**: `project:dstys`, `project:sparkflow`, `project:summit-asphalt`, `project:hello-operator`

## Documentation

- **[Main Documentation](docs/linear/label-standardization/README.md)** - Complete overview and implementation plan
- **[Migration Mapping](docs/linear/label-standardization/migration-mapping.md)** - Detailed mapping between old and new labels
- **[Labeling Guidelines](docs/linear/label-standardization/labeling-guidelines.md)** - Comprehensive usage guidelines for the team

## Implementation

### Prerequisites

1. Node.js 16+ installed
2. Linear API key with appropriate permissions
3. Access to the Helaix Linear workspace

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
export LINEAR_API_KEY="your_linear_api_key_here"
```

### Running the Migration

```bash
# Dry run (recommended first)
npm run label-migration:dry-run

# Execute the migration
npm run label-migration
```

### Migration Script Features

- **Dry Run Mode**: Test the migration without making changes
- **Comprehensive Mapping**: Handles all 18 existing labels
- **Default Priority Assignment**: Adds `priority:medium` to unlabeled issues
- **Safety Checks**: Preserves business labels and handles edge cases
- **Detailed Reporting**: Provides comprehensive migration summary

## Migration Process

### Phase 1: Label Creation ✅
- Create all new labels with appropriate colors
- Set up label descriptions and categorization

### Phase 2: Issue Migration
- Map existing labels to new taxonomy
- Update all issues with new labels
- Remove obsolete labels

### Phase 3: Cleanup & Training
- Archive old labels
- Train team on new system
- Update documentation

## Label Usage Rules

### Required Labels
- Every issue **MUST** have exactly one `type:` label
- Every issue **MUST** have exactly one `priority:` label

### Optional Labels
- `effort:` labels for planning and estimation
- `component:` labels for technical categorization
- `status:` labels for workflow management
- `project:` labels for project-specific work

### Example Combinations

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

## Success Metrics

- [ ] All 18 existing labels mapped to new taxonomy
- [ ] 100% of existing issues properly labeled with new system
- [ ] Team trained on new labeling guidelines
- [ ] Documentation complete and accessible
- [ ] Label usage consistent across all new issues

## Timeline

- **Day 1**: Label creation and documentation ✅
- **Day 2**: Issue migration and validation
- **Day 3**: Cleanup and team training

## Support

For questions or issues with the label migration:

1. Check the [Labeling Guidelines](docs/linear/label-standardization/labeling-guidelines.md)
2. Review the [Migration Mapping](docs/linear/label-standardization/migration-mapping.md)
3. Contact the team lead for clarification

## Contributing

When adding new labels or modifying the system:

1. Update the documentation
2. Test changes in dry-run mode
3. Get team approval for taxonomy changes
4. Update the migration script if needed

---

**Project**: Phase 1.3 - Label Standardization & Enhancement  
**Parent Issue**: [HLX-1837: Help me organize and tidy up all the issues in helaix](https://linear.app/helaix/issue/HLX-1837)  
**Implementation Issue**: [HLX-1840: Phase 1.3: Label Standardization & Enhancement](https://linear.app/helaix/issue/HLX-1840)

