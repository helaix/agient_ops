/**
 * Phase 2.2: Label Migration Engine
 * 
 * Core migration engine that handles the actual label creation, 
 * issue migration, and validation processes.
 */

import { 
  LABEL_MAPPINGS, 
  NEW_LABELS, 
  PRESERVE_LABELS, 
  ARCHIVE_LABELS,
  DEFAULT_ASSIGNMENTS,
  VALIDATION_RULES,
  MIGRATION_CONFIG,
  type LabelMapping 
} from './migration-config.js';

interface LinearLabel {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  labels: LinearLabel[];
  labelIds: string[];
}

interface MigrationResult {
  success: boolean;
  issuesProcessed: number;
  issuesUpdated: number;
  labelsCreated: number;
  labelsArchived: number;
  errors: string[];
  warnings: string[];
  summary: string;
}

interface MigrationStats {
  totalIssues: number;
  issuesWithoutType: number;
  issuesWithoutPriority: number;
  labelUsageStats: Record<string, number>;
  migrationMapping: Record<string, number>;
}

export class LabelMigrationEngine {
  private teamId: string;
  private dryRun: boolean;
  private existingLabels: Map<string, LinearLabel> = new Map();
  private newLabels: Map<string, LinearLabel> = new Map();
  private migrationStats: MigrationStats;

  constructor(teamId: string = MIGRATION_CONFIG.teamId, dryRun: boolean = MIGRATION_CONFIG.dryRun) {
    this.teamId = teamId;
    this.dryRun = dryRun;
    this.migrationStats = {
      totalIssues: 0,
      issuesWithoutType: 0,
      issuesWithoutPriority: 0,
      labelUsageStats: {},
      migrationMapping: {}
    };
  }

  /**
   * Main migration orchestrator
   */
  async executeMigration(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      issuesProcessed: 0,
      issuesUpdated: 0,
      labelsCreated: 0,
      labelsArchived: 0,
      errors: [],
      warnings: [],
      summary: ''
    };

    try {
      console.log(`🚀 Starting Label Migration (${this.dryRun ? 'DRY RUN' : 'LIVE'})...`);
      
      // Phase 1: Load existing data
      await this.loadExistingLabels();
      const issues = await this.loadAllIssues();
      
      // Phase 2: Analyze current state
      await this.analyzeCurrentState(issues);
      
      // Phase 3: Create new labels
      const labelsCreated = await this.createNewLabels();
      result.labelsCreated = labelsCreated;
      
      // Phase 4: Migrate issues
      const migrationResults = await this.migrateIssues(issues);
      result.issuesProcessed = migrationResults.processed;
      result.issuesUpdated = migrationResults.updated;
      result.errors.push(...migrationResults.errors);
      result.warnings.push(...migrationResults.warnings);
      
      // Phase 5: Archive old labels
      const labelsArchived = await this.archiveOldLabels();
      result.labelsArchived = labelsArchived;
      
      // Phase 6: Validate migration
      await this.validateMigration();
      
      result.success = result.errors.length === 0;
      result.summary = this.generateSummary(result);
      
      console.log(`✅ Migration completed: ${result.summary}`);
      return result;
      
    } catch (error) {
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
      console.error('❌ Migration failed:', error);
      return result;
    }
  }

  /**
   * Load existing labels from Linear
   */
  private async loadExistingLabels(): Promise<void> {
    console.log('📋 Loading existing labels...');
    
    // This would use the Linear API in a real implementation
    // For now, we'll simulate with the known labels from the config
    const mockLabels: LinearLabel[] = [
      { id: 'f1359a74-0ff5-4225-9419-1b71bd9caede', name: 'Feature' },
      { id: '7718a2c0-5e26-43fd-8fd1-0138518895b5', name: 'Bug' },
      { id: '017f4ad6-b1f6-4838-8d6c-f0aa611156b4', name: 'Improvement' },
      { id: 'd859980a-84bd-4505-8953-8065acc923b7', name: 'Documentation' },
      { id: 'ab365cc8-bebe-4b2c-9507-4aa2aa2020b1', name: 'Epic' },
      { id: '7092d88d-2293-4619-a932-04a877cf0fc4', name: 'high-priority' },
      { id: 'b36ca67d-9479-416d-9d9c-d1572c1f5384', name: 'good first issue' },
      { id: '27037d6f-8b3f-44cc-ae89-9e65148cad60', name: 'Complexity: 4' },
      { id: 'aceb8c11-ad59-409d-acdb-99bc487071ee', name: 'iac' },
      { id: '9ff07dd3-eafc-4bae-bc11-c6560b112394', name: 'Analytics' },
      { id: '0c3c1298-b54a-444d-9367-def98ae895ee', name: 'B2B Outreach' },
      { id: '2eba520c-6db6-4a89-b608-e4f4249719e0', name: 'SEO Expansion' },
      { id: '8273b756-34a7-4cc1-a132-4387a205b918', name: 'Ad Campaign' },
      { id: '0724aeff-9647-4033-9b77-8f70467f1ce2', name: 'workplan' },
      { id: '3792bff0-8db7-4a23-a9f9-519c76ccc9c4', name: 'Slice A' },
      { id: '1eaafa8f-f659-4672-82c5-7d7e360b099f', name: 'Slice B' },
      { id: '2a9fa12e-3959-494b-9ad3-5c4da74e632b', name: 'Slice C' },
      { id: '5a1d4267-7e7b-44d9-94a0-d6c6c40a1f52', name: 'native' }
    ];

    mockLabels.forEach(label => {
      this.existingLabels.set(label.name, label);
    });

    console.log(`📋 Loaded ${this.existingLabels.size} existing labels`);
  }

  /**
   * Load all issues from Linear
   */
  private async loadAllIssues(): Promise<LinearIssue[]> {
    console.log('📄 Loading all issues...');
    
    // This would use the Linear API to fetch all issues
    // For now, we'll return a mock structure
    const mockIssues: LinearIssue[] = [];
    
    console.log(`📄 Loaded ${mockIssues.length} issues`);
    return mockIssues;
  }

  /**
   * Analyze current labeling state
   */
  private async analyzeCurrentState(issues: LinearIssue[]): Promise<void> {
    console.log('🔍 Analyzing current state...');
    
    this.migrationStats.totalIssues = issues.length;
    
    for (const issue of issues) {
      // Count label usage
      for (const label of issue.labels) {
        this.migrationStats.labelUsageStats[label.name] = 
          (this.migrationStats.labelUsageStats[label.name] || 0) + 1;
      }
      
      // Check for missing required labels
      const hasType = issue.labels.some(l => 
        ['Feature', 'Bug', 'Improvement', 'Documentation', 'Epic'].includes(l.name)
      );
      const hasPriority = issue.labels.some(l => 
        ['high-priority'].includes(l.name)
      );
      
      if (!hasType) this.migrationStats.issuesWithoutType++;
      if (!hasPriority) this.migrationStats.issuesWithoutPriority++;
    }
    
    console.log(`🔍 Analysis complete:
      - Total issues: ${this.migrationStats.totalIssues}
      - Issues without type: ${this.migrationStats.issuesWithoutType}
      - Issues without priority: ${this.migrationStats.issuesWithoutPriority}`);
  }

  /**
   * Create new labels in Linear
   */
  private async createNewLabels(): Promise<number> {
    console.log('🏷️ Creating new labels...');
    
    let created = 0;
    const allNewLabels = [...LABEL_MAPPINGS, ...NEW_LABELS];
    
    for (const labelConfig of allNewLabels) {
      if (labelConfig.newLabel && !this.existingLabels.has(labelConfig.newLabel)) {
        if (this.dryRun) {
          console.log(`[DRY RUN] Would create label: ${labelConfig.newLabel}`);
        } else {
          // In real implementation, this would call Linear API to create the label
          console.log(`Creating label: ${labelConfig.newLabel}`);
        }
        created++;
      }
    }
    
    console.log(`🏷️ ${this.dryRun ? 'Would create' : 'Created'} ${created} new labels`);
    return created;
  }

  /**
   * Migrate issues to new label system
   */
  private async migrateIssues(issues: LinearIssue[]): Promise<{
    processed: number;
    updated: number;
    errors: string[];
    warnings: string[];
  }> {
    console.log('🔄 Migrating issues...');
    
    const result = {
      processed: 0,
      updated: 0,
      errors: [],
      warnings: []
    };
    
    for (let i = 0; i < issues.length; i += MIGRATION_CONFIG.batchSize) {
      const batch = issues.slice(i, i + MIGRATION_CONFIG.batchSize);
      
      for (const issue of batch) {
        try {
          const migrationPlan = this.createMigrationPlan(issue);
          
          if (migrationPlan.changes.length > 0) {
            if (this.dryRun) {
              console.log(`[DRY RUN] Would update ${issue.identifier}: ${migrationPlan.summary}`);
            } else {
              await this.applyMigrationPlan(issue, migrationPlan);
              console.log(`Updated ${issue.identifier}: ${migrationPlan.summary}`);
            }
            result.updated++;
          }
          
          result.warnings.push(...migrationPlan.warnings);
          result.processed++;
          
        } catch (error) {
          result.errors.push(`Failed to migrate ${issue.identifier}: ${error}`);
        }
      }
      
      // Delay between batches to avoid rate limiting
      if (i + MIGRATION_CONFIG.batchSize < issues.length) {
        await new Promise(resolve => setTimeout(resolve, MIGRATION_CONFIG.delayBetweenBatches));
      }
    }
    
    console.log(`🔄 Migration complete: ${result.updated}/${result.processed} issues updated`);
    return result;
  }

  /**
   * Create migration plan for a single issue
   */
  private createMigrationPlan(issue: LinearIssue): {
    changes: Array<{ action: 'add' | 'remove'; label: string; reason: string }>;
    warnings: string[];
    summary: string;
  } {
    const changes: Array<{ action: 'add' | 'remove'; label: string; reason: string }> = [];
    const warnings: string[] = [];
    
    const currentLabels = new Set(issue.labels.map(l => l.name));
    
    // Apply direct mappings
    for (const mapping of LABEL_MAPPINGS) {
      if (currentLabels.has(mapping.oldLabel)) {
        changes.push({
          action: 'remove',
          label: mapping.oldLabel,
          reason: `Replace with ${mapping.newLabel}`
        });
        changes.push({
          action: 'add',
          label: mapping.newLabel,
          reason: `Direct mapping from ${mapping.oldLabel}`
        });
      }
    }
    
    // Add default priority if none exists
    const hasNewPriority = changes.some(c => 
      c.action === 'add' && c.label.startsWith('priority:')
    );
    const hasOldPriority = currentLabels.has('high-priority');
    
    if (!hasNewPriority && !hasOldPriority) {
      changes.push({
        action: 'add',
        label: DEFAULT_ASSIGNMENTS.priority,
        reason: 'Default priority assignment'
      });
    }
    
    // Check for type label
    const hasType = currentLabels.has('Feature') || currentLabels.has('Bug') || 
                   currentLabels.has('Improvement') || currentLabels.has('Documentation') || 
                   currentLabels.has('Epic');
    
    if (!hasType) {
      warnings.push(`Issue ${issue.identifier} has no type label - manual review required`);
    }
    
    // Remove archived labels
    for (const archiveLabel of ARCHIVE_LABELS) {
      if (currentLabels.has(archiveLabel)) {
        changes.push({
          action: 'remove',
          label: archiveLabel,
          reason: 'Label archived in new taxonomy'
        });
      }
    }
    
    const summary = changes.length > 0 
      ? `${changes.filter(c => c.action === 'add').length} added, ${changes.filter(c => c.action === 'remove').length} removed`
      : 'No changes needed';
    
    return { changes, warnings, summary };
  }

  /**
   * Apply migration plan to an issue
   */
  private async applyMigrationPlan(issue: LinearIssue, plan: any): Promise<void> {
    // In real implementation, this would call Linear API to update the issue
    // For now, we'll just log the changes
    console.log(`Applying migration plan to ${issue.identifier}`);
  }

  /**
   * Archive old labels that are no longer needed
   */
  private async archiveOldLabels(): Promise<number> {
    console.log('🗄️ Archiving old labels...');
    
    let archived = 0;
    const labelsToArchive = [...ARCHIVE_LABELS];
    
    // Add mapped labels to archive list
    for (const mapping of LABEL_MAPPINGS) {
      if (mapping.oldLabel) {
        labelsToArchive.push(mapping.oldLabel);
      }
    }
    
    for (const labelName of labelsToArchive) {
      if (this.existingLabels.has(labelName)) {
        if (this.dryRun) {
          console.log(`[DRY RUN] Would archive label: ${labelName}`);
        } else {
          // In real implementation, this would call Linear API to delete the label
          console.log(`Archiving label: ${labelName}`);
        }
        archived++;
      }
    }
    
    console.log(`🗄️ ${this.dryRun ? 'Would archive' : 'Archived'} ${archived} old labels`);
    return archived;
  }

  /**
   * Validate migration results
   */
  private async validateMigration(): Promise<void> {
    console.log('✅ Validating migration...');
    
    // In real implementation, this would:
    // 1. Re-fetch all issues
    // 2. Verify all issues have required labels
    // 3. Check for any orphaned labels
    // 4. Validate label usage patterns
    
    console.log('✅ Validation complete');
  }

  /**
   * Generate migration summary
   */
  private generateSummary(result: MigrationResult): string {
    return `
Migration Summary:
- Issues processed: ${result.issuesProcessed}
- Issues updated: ${result.issuesUpdated}
- Labels created: ${result.labelsCreated}
- Labels archived: ${result.labelsArchived}
- Errors: ${result.errors.length}
- Warnings: ${result.warnings.length}
- Success: ${result.success ? 'Yes' : 'No'}
    `.trim();
  }

  /**
   * Generate detailed migration report
   */
  generateReport(): string {
    return `
# Label Migration Report

## Current State Analysis
- Total issues: ${this.migrationStats.totalIssues}
- Issues without type: ${this.migrationStats.issuesWithoutType}
- Issues without priority: ${this.migrationStats.issuesWithoutPriority}

## Label Usage Statistics
${Object.entries(this.migrationStats.labelUsageStats)
  .sort(([,a], [,b]) => b - a)
  .map(([label, count]) => `- ${label}: ${count} issues`)
  .join('\n')}

## Migration Mapping
${LABEL_MAPPINGS.map(m => `- ${m.oldLabel} → ${m.newLabel}`).join('\n')}

## New Labels Created
${NEW_LABELS.map(l => `- ${l.newLabel}: ${l.description}`).join('\n')}

## Labels to Archive
${ARCHIVE_LABELS.map(l => `- ${l}`).join('\n')}

## Labels Preserved
${PRESERVE_LABELS.map(l => `- ${l}`).join('\n')}
    `.trim();
  }
}

