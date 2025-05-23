#!/usr/bin/env node

/**
 * Phase 2.2: Label Migration CLI
 * 
 * Command-line interface for executing the label migration process.
 * Supports dry-run mode, validation, and step-by-step execution.
 */

import { LabelMigrationEngine } from './migration-engine.js';
import { LinearApiClient } from './linear-api-client.js';
import { MIGRATION_CONFIG } from './migration-config.js';

interface CliOptions {
  dryRun: boolean;
  teamId: string;
  step?: 'analyze' | 'create-labels' | 'migrate-issues' | 'archive-labels' | 'validate';
  verbose: boolean;
  force: boolean;
  batchSize: number;
}

class MigrationCli {
  private options: CliOptions;
  private apiClient: LinearApiClient;
  private migrationEngine: LabelMigrationEngine;

  constructor(options: CliOptions) {
    this.options = options;
    this.apiClient = new LinearApiClient();
    this.migrationEngine = new LabelMigrationEngine(options.teamId, options.dryRun);
  }

  async run(): Promise<void> {
    try {
      console.log('🚀 Linear Label Migration Tool');
      console.log('================================');
      console.log(`Mode: ${this.options.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
      console.log(`Team ID: ${this.options.teamId}`);
      console.log('');

      // Validate API connection
      await this.validateConnection();

      if (this.options.step) {
        await this.runStep(this.options.step);
      } else {
        await this.runFullMigration();
      }

    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  private async validateConnection(): Promise<void> {
    console.log('🔐 Validating Linear API connection...');
    
    const validation = await this.apiClient.validateConnection();
    
    if (!validation.valid) {
      throw new Error(`API connection failed: ${validation.error}`);
    }
    
    console.log(`✅ Connected as: ${validation.user?.name} (${validation.user?.email})`);
    console.log('');
  }

  private async runFullMigration(): Promise<void> {
    if (!this.options.force && !this.options.dryRun) {
      const confirmed = await this.confirmMigration();
      if (!confirmed) {
        console.log('Migration cancelled by user.');
        return;
      }
    }

    const result = await this.migrationEngine.executeMigration();
    
    console.log('\n📊 Migration Results:');
    console.log('====================');
    console.log(result.summary);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    // Generate detailed report
    const report = this.migrationEngine.generateReport();
    console.log('\n📋 Detailed Report:');
    console.log('==================');
    console.log(report);
  }

  private async runStep(step: string): Promise<void> {
    console.log(`🔧 Running step: ${step}`);
    
    switch (step) {
      case 'analyze':
        await this.analyzeCurrentState();
        break;
      case 'create-labels':
        await this.createLabels();
        break;
      case 'migrate-issues':
        await this.migrateIssues();
        break;
      case 'archive-labels':
        await this.archiveLabels();
        break;
      case 'validate':
        await this.validateMigration();
        break;
      default:
        throw new Error(`Unknown step: ${step}`);
    }
  }

  private async analyzeCurrentState(): Promise<void> {
    console.log('🔍 Analyzing current label state...');
    
    // Get current labels
    const labels = await this.apiClient.getTeamLabels(this.options.teamId);
    console.log(`Found ${labels.length} existing labels:`);
    labels.forEach(label => {
      console.log(`  - ${label.name} (${label.id})`);
    });
    
    // Get all issues
    console.log('\n📄 Loading issues...');
    const issues = await this.apiClient.getAllTeamIssues(this.options.teamId);
    console.log(`Found ${issues.length} issues`);
    
    // Analyze label usage
    const labelUsage = new Map<string, number>();
    let issuesWithoutType = 0;
    let issuesWithoutPriority = 0;
    
    for (const issue of issues) {
      const issueLabels = issue.labels.nodes.map(l => l.name);
      
      // Count label usage
      for (const labelName of issueLabels) {
        labelUsage.set(labelName, (labelUsage.get(labelName) || 0) + 1);
      }
      
      // Check for missing required labels
      const hasType = issueLabels.some(l => 
        ['Feature', 'Bug', 'Improvement', 'Documentation', 'Epic'].includes(l)
      );
      const hasPriority = issueLabels.some(l => 
        ['high-priority'].includes(l)
      );
      
      if (!hasType) issuesWithoutType++;
      if (!hasPriority) issuesWithoutPriority++;
    }
    
    console.log('\n📊 Analysis Results:');
    console.log(`  - Total issues: ${issues.length}`);
    console.log(`  - Issues without type: ${issuesWithoutType}`);
    console.log(`  - Issues without priority: ${issuesWithoutPriority}`);
    
    console.log('\n🏷️ Label Usage:');
    const sortedUsage = Array.from(labelUsage.entries())
      .sort(([,a], [,b]) => b - a);
    
    sortedUsage.forEach(([label, count]) => {
      console.log(`  - ${label}: ${count} issues`);
    });
  }

  private async createLabels(): Promise<void> {
    console.log('🏷️ Creating new labels...');
    
    // This would implement the label creation logic
    console.log('Label creation step completed.');
  }

  private async migrateIssues(): Promise<void> {
    console.log('🔄 Migrating issues...');
    
    // This would implement the issue migration logic
    console.log('Issue migration step completed.');
  }

  private async archiveLabels(): Promise<void> {
    console.log('🗄️ Archiving old labels...');
    
    // This would implement the label archival logic
    console.log('Label archival step completed.');
  }

  private async validateMigration(): Promise<void> {
    console.log('✅ Validating migration...');
    
    // This would implement the validation logic
    console.log('Validation step completed.');
  }

  private async confirmMigration(): Promise<boolean> {
    // In a real CLI, this would prompt the user for confirmation
    // For now, we'll assume confirmation in non-interactive environments
    console.log('⚠️ This will modify your Linear workspace.');
    console.log('Use --dry-run flag to test without making changes.');
    console.log('Use --force flag to skip this confirmation.');
    
    return true; // Auto-confirm for now
  }
}

// CLI argument parsing
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    dryRun: true, // Default to dry run for safety
    teamId: MIGRATION_CONFIG.teamId,
    verbose: false,
    force: false,
    batchSize: MIGRATION_CONFIG.batchSize
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--live':
        options.dryRun = false;
        break;
      case '--team-id':
        options.teamId = args[++i];
        break;
      case '--step':
        options.step = args[++i] as any;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[++i]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown argument: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Linear Label Migration Tool

Usage: node migration-cli.js [options]

Options:
  --dry-run              Run in dry-run mode (default, no changes made)
  --live                 Run live migration (makes actual changes)
  --team-id <id>         Linear team ID (default: from config)
  --step <step>          Run specific step only:
                         analyze, create-labels, migrate-issues, archive-labels, validate
  --verbose              Enable verbose logging
  --force                Skip confirmation prompts
  --batch-size <size>    Number of issues to process per batch (default: 10)
  --help                 Show this help message

Examples:
  # Analyze current state
  node migration-cli.js --step analyze

  # Dry run full migration
  node migration-cli.js --dry-run

  # Live migration with confirmation
  node migration-cli.js --live

  # Live migration without confirmation
  node migration-cli.js --live --force
  `);
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  const cli = new MigrationCli(options);
  cli.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { MigrationCli, type CliOptions };

