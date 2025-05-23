# Phase 2.2: Label Migration & Standardization

This directory contains the complete toolset for migrating from the current 18-label system to the new structured taxonomy with 6 categories and 29+ labels.

## Overview

The migration transforms the Linear workspace from an ad-hoc labeling system to a structured taxonomy that improves issue organization, searchability, and workflow automation.

### Current State (18 labels)
- Inconsistent naming conventions
- Missing priority system
- No effort estimation
- Limited component categorization
- Organizational labels that need cleanup

### Target State (29+ labels in 6 categories)
1. **Type Labels** (Required): `type:feature`, `type:bug`, `type:improvement`, `type:documentation`, `type:epic`
2. **Priority Labels** (Required): `priority:urgent`, `priority:high`, `priority:medium`, `priority:low`
3. **Effort Labels** (Optional): `effort:xs`, `effort:s`, `effort:m`, `effort:l`, `effort:xl`
4. **Component Labels** (Optional): `component:infrastructure`, `component:frontend`, `component:backend`, `component:ai`, `component:analytics`
5. **Status Labels** (Optional): `status:blocked`, `status:needs-review`, `status:ready-for-dev`, `status:good-first-issue`
6. **Project Labels** (Optional): `project:dstys`, `project:sparkflow`, `project:summit-asphalt`, `project:hello-operator`

## Files

### Core Migration System
- **`migration-config.ts`** - Complete configuration including label mappings, new labels, and validation rules
- **`migration-engine.ts`** - Core migration engine that orchestrates the entire process
- **`linear-api-client.ts`** - Linear API client for all GraphQL operations
- **`migration-cli.ts`** - Command-line interface for executing migrations

### Supporting Files
- **`package.json`** - Node.js package configuration with scripts
- **`tsconfig.json`** - TypeScript configuration
- **`README.md`** - This documentation file

## Quick Start

### 1. Setup
```bash
cd scripts/linear-label-migration
npm install
npm run build
```

### 2. Environment Setup
Ensure the `LINEAR_API_KEY` environment variable is set:
```bash
export LINEAR_API_KEY=lin_api_jcN403gwXXGlJNEp88aC7A1o11Ap6CN6QJ2hQir4
```

### 3. Analyze Current State
```bash
npm run analyze
```

### 4. Dry Run Migration
```bash
npm run dry-run
```

### 5. Execute Live Migration
```bash
npm run migrate
```

## Migration Process

### Phase 1: Analysis
- Load all existing labels and issues
- Analyze current labeling patterns
- Identify issues without required labels
- Generate usage statistics

### Phase 2: Label Creation
- Create all new labels with proper colors and descriptions
- Validate label taxonomy structure
- Ensure no naming conflicts

### Phase 3: Issue Migration
- Apply direct label mappings (e.g., `Feature` → `type:feature`)
- Add default priority labels where missing
- Remove archived labels
- Batch process with rate limiting

### Phase 4: Cleanup
- Archive obsolete labels
- Validate all issues have required labels
- Generate migration report

## Command Line Usage

### Basic Commands
```bash
# Analyze current state
node migration-cli.js --step analyze

# Dry run (safe, no changes)
node migration-cli.js --dry-run

# Live migration
node migration-cli.js --live

# Validate migration results
node migration-cli.js --step validate
```

### Advanced Options
```bash
# Custom team ID
node migration-cli.js --team-id "your-team-id" --dry-run

# Specific step only
node migration-cli.js --step create-labels --dry-run

# Force execution without confirmation
node migration-cli.js --live --force

# Custom batch size
node migration-cli.js --live --batch-size 5
```

## Label Mapping Reference

### Direct Replacements
| Old Label | New Label | Category | Issues Affected |
|-----------|-----------|----------|-----------------|
| `Feature` | `type:feature` | Type | TBD |
| `Bug` | `type:bug` | Type | TBD |
| `Improvement` | `type:improvement` | Type | TBD |
| `Documentation` | `type:documentation` | Type | TBD |
| `Epic` | `type:epic` | Type | TBD |
| `high-priority` | `priority:high` | Priority | TBD |
| `good first issue` | `status:good-first-issue` | Status | TBD |
| `Complexity: 4` | `effort:xl` | Effort | TBD |
| `iac` | `component:infrastructure` | Component | TBD |

### Labels to Preserve
- `Analytics` (business label)
- `B2B Outreach` (business label)
- `SEO Expansion` (business label)
- `Ad Campaign` (business label)
- `workplan` (workflow label)

### Labels to Archive
- `Slice A`, `Slice B`, `Slice C` (organizational)
- `native` (technical - no longer needed)

### Default Assignments
- All issues without priority → `priority:medium`
- All issues without type → Manual review required

## Safety Features

### Dry Run Mode
- Default mode for all operations
- Shows exactly what would be changed
- No actual modifications made
- Safe for testing and validation

### Batch Processing
- Issues processed in configurable batches
- Rate limiting to avoid API throttling
- Progress tracking and error handling
- Ability to resume from failures

### Validation
- Pre-migration validation of API access
- Post-migration validation of results
- Comprehensive error reporting
- Rollback capability planning

### Backup Strategy
- Export current state before migration
- Detailed logging of all changes
- Ability to recreate old labels if needed
- Issue-by-issue change tracking

## Success Criteria

- ✅ All 18 existing labels mapped to new taxonomy
- ✅ 100% of issues properly labeled with new system
- ✅ Zero issues without required labels (type + priority)
- ✅ Team trained on new labeling guidelines
- ✅ Documentation complete and accessible

## Troubleshooting

### Common Issues

**API Authentication Errors**
```bash
# Verify API key is set
echo $LINEAR_API_KEY

# Test connection
node migration-cli.js --step analyze
```

**Rate Limiting**
```bash
# Reduce batch size
node migration-cli.js --live --batch-size 5

# Add delays between operations
```

**Label Creation Conflicts**
```bash
# Check existing labels first
node migration-cli.js --step analyze

# Use dry-run to identify conflicts
node migration-cli.js --dry-run
```

### Recovery Procedures

**If Migration Fails Mid-Process**
1. Check error logs for specific issues
2. Use `--step` flag to resume from specific phase
3. Validate current state with analyze command
4. Re-run failed operations individually

**If Labels Need to be Rolled Back**
1. Use backup data to recreate old labels
2. Re-apply old label assignments to issues
3. Remove new labels that were created
4. Document lessons learned for next attempt

## Next Steps

After successful migration:
1. **Team Training** - Educate team on new labeling guidelines
2. **Workflow Automation** - Set up automated label assignment rules
3. **Documentation Updates** - Update all team documentation
4. **Phase 2.3** - Proceed to Workflow Optimization & Automation

## Support

For issues or questions:
1. Check the error logs and troubleshooting section
2. Review the migration configuration for customization options
3. Test changes in dry-run mode before live execution
4. Document any issues for future improvements

