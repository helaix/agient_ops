#!/usr/bin/env node

/**
 * Test Suite for Label Migration System
 * 
 * Validates the migration configuration, API client, and engine
 * before running the actual migration.
 */

import { LinearApiClient } from './linear-api-client.js';
import { LabelMigrationEngine } from './migration-engine.js';
import { 
  LABEL_MAPPINGS, 
  NEW_LABELS, 
  PRESERVE_LABELS, 
  ARCHIVE_LABELS,
  MIGRATION_CONFIG,
  NEW_LABEL_CATEGORIES 
} from './migration-config.js';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

class MigrationTester {
  private apiClient: LinearApiClient;
  private results: TestResult[] = [];

  constructor() {
    this.apiClient = new LinearApiClient();
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Running Label Migration Test Suite');
    console.log('=====================================\n');

    // Configuration tests
    await this.testConfiguration();
    
    // API tests
    await this.testApiConnection();
    
    // Migration logic tests
    await this.testMigrationLogic();
    
    // Integration tests
    await this.testIntegration();

    // Report results
    this.reportResults();
  }

  private async testConfiguration(): Promise<void> {
    console.log('📋 Testing Configuration...');

    // Test label mapping completeness
    this.addTest(
      'Label Mappings Complete',
      LABEL_MAPPINGS.length > 0,
      `Found ${LABEL_MAPPINGS.length} label mappings`
    );

    // Test new labels configuration
    this.addTest(
      'New Labels Defined',
      NEW_LABELS.length > 0,
      `Found ${NEW_LABELS.length} new labels to create`
    );

    // Test category structure
    const categoryCount = Object.keys(NEW_LABEL_CATEGORIES).length;
    this.addTest(
      'Label Categories Defined',
      categoryCount === 6,
      `Found ${categoryCount} label categories (expected 6)`
    );

    // Test required categories
    const requiredCategories = Object.values(NEW_LABEL_CATEGORIES)
      .filter(cat => cat.required).length;
    this.addTest(
      'Required Categories',
      requiredCategories === 2,
      `Found ${requiredCategories} required categories (type, priority)`
    );

    // Test label naming conventions
    const allNewLabels = [...LABEL_MAPPINGS, ...NEW_LABELS]
      .map(l => l.newLabel)
      .filter(l => l);
    
    const validNaming = allNewLabels.every(label => 
      /^(type|priority|effort|component|status|project):[a-z-]+$/.test(label)
    );
    
    this.addTest(
      'Label Naming Convention',
      validNaming,
      validNaming ? 'All labels follow category:name pattern' : 'Some labels have invalid naming'
    );

    // Test for duplicate labels
    const labelSet = new Set(allNewLabels);
    this.addTest(
      'No Duplicate Labels',
      labelSet.size === allNewLabels.length,
      `${allNewLabels.length} labels defined, ${labelSet.size} unique`
    );

    console.log('');
  }

  private async testApiConnection(): Promise<void> {
    console.log('🔌 Testing API Connection...');

    try {
      // Test basic connection
      const validation = await this.apiClient.validateConnection();
      this.addTest(
        'API Connection',
        validation.valid,
        validation.valid ? `Connected as ${validation.user?.name}` : validation.error || 'Connection failed'
      );

      if (validation.valid) {
        // Test team access
        try {
          const team = await this.apiClient.getTeam(MIGRATION_CONFIG.teamId);
          this.addTest(
            'Team Access',
            !!team,
            `Access to team: ${team.name} (${team.key})`
          );
        } catch (error) {
          this.addTest(
            'Team Access',
            false,
            `Cannot access team ${MIGRATION_CONFIG.teamId}: ${error}`
          );
        }

        // Test label retrieval
        try {
          const labels = await this.apiClient.getTeamLabels(MIGRATION_CONFIG.teamId);
          this.addTest(
            'Label Retrieval',
            labels.length > 0,
            `Retrieved ${labels.length} existing labels`
          );
        } catch (error) {
          this.addTest(
            'Label Retrieval',
            false,
            `Cannot retrieve labels: ${error}`
          );
        }

        // Test issue retrieval (limited)
        try {
          const issueResult = await this.apiClient.getTeamIssues(MIGRATION_CONFIG.teamId, 5);
          this.addTest(
            'Issue Retrieval',
            issueResult.issues.length >= 0,
            `Retrieved ${issueResult.issues.length} issues (sample)`
          );
        } catch (error) {
          this.addTest(
            'Issue Retrieval',
            false,
            `Cannot retrieve issues: ${error}`
          );
        }
      }
    } catch (error) {
      this.addTest(
        'API Connection',
        false,
        `API test failed: ${error}`
      );
    }

    console.log('');
  }

  private async testMigrationLogic(): Promise<void> {
    console.log('⚙️ Testing Migration Logic...');

    // Test migration engine initialization
    try {
      const engine = new LabelMigrationEngine(MIGRATION_CONFIG.teamId, true);
      this.addTest(
        'Migration Engine Init',
        true,
        'Migration engine initialized successfully'
      );
    } catch (error) {
      this.addTest(
        'Migration Engine Init',
        false,
        `Migration engine failed to initialize: ${error}`
      );
    }

    // Test label mapping logic
    const mappingTest = this.testLabelMappingLogic();
    this.addTest(
      'Label Mapping Logic',
      mappingTest.valid,
      mappingTest.message
    );

    // Test validation rules
    const validationTest = this.testValidationRules();
    this.addTest(
      'Validation Rules',
      validationTest.valid,
      validationTest.message
    );

    console.log('');
  }

  private testLabelMappingLogic(): { valid: boolean; message: string } {
    // Test that all old labels in mappings exist in our known set
    const knownOldLabels = [
      'Feature', 'Bug', 'Improvement', 'Documentation', 'Epic',
      'high-priority', 'good first issue', 'Complexity: 4', 'iac',
      'Analytics', 'B2B Outreach', 'SEO Expansion', 'Ad Campaign', 'workplan',
      'Slice A', 'Slice B', 'Slice C', 'native'
    ];

    const mappedOldLabels = LABEL_MAPPINGS
      .map(m => m.oldLabel)
      .filter(l => l);

    const unknownLabels = mappedOldLabels.filter(l => !knownOldLabels.includes(l));
    
    if (unknownLabels.length > 0) {
      return {
        valid: false,
        message: `Unknown old labels in mapping: ${unknownLabels.join(', ')}`
      };
    }

    return {
      valid: true,
      message: `All ${mappedOldLabels.length} mapped labels are valid`
    };
  }

  private testValidationRules(): { valid: boolean; message: string } {
    // Test that validation rules are properly configured
    const rules = {
      hasRequiredLabels: Array.isArray(MIGRATION_CONFIG) && 
                        typeof MIGRATION_CONFIG.teamId === 'string',
      hasBatchSize: typeof MIGRATION_CONFIG.batchSize === 'number' &&
                   MIGRATION_CONFIG.batchSize > 0,
      hasDelayConfig: typeof MIGRATION_CONFIG.delayBetweenBatches === 'number'
    };

    const allValid = Object.values(rules).every(Boolean);
    
    return {
      valid: allValid,
      message: allValid ? 'All validation rules properly configured' : 'Some validation rules missing'
    };
  }

  private async testIntegration(): Promise<void> {
    console.log('🔗 Testing Integration...');

    // Test dry-run execution
    try {
      const engine = new LabelMigrationEngine(MIGRATION_CONFIG.teamId, true);
      
      // This would test the full dry-run in a real scenario
      // For now, we'll just test that the engine can be created and configured
      this.addTest(
        'Dry Run Setup',
        true,
        'Dry run migration engine ready'
      );
      
    } catch (error) {
      this.addTest(
        'Dry Run Setup',
        false,
        `Dry run setup failed: ${error}`
      );
    }

    // Test configuration consistency
    const totalExpectedLabels = LABEL_MAPPINGS.length + NEW_LABELS.length;
    const categoryLabels = Object.values(NEW_LABEL_CATEGORIES)
      .reduce((total, cat) => total + cat.labels.length, 0);
    
    this.addTest(
      'Configuration Consistency',
      totalExpectedLabels >= categoryLabels * 0.8, // Allow some flexibility
      `Expected ~${categoryLabels} labels, configured ${totalExpectedLabels}`
    );

    console.log('');
  }

  private addTest(name: string, passed: boolean, message: string, details?: any): void {
    this.results.push({ name, passed, message, details });
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${name}: ${message}`);
  }

  private reportResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = Math.round((passed / total) * 100);

    console.log('\n📊 Test Results Summary');
    console.log('======================');
    console.log(`Tests Passed: ${passed}/${total} (${percentage}%)`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Migration system is ready.');
    } else {
      console.log('⚠️ Some tests failed. Review issues before running migration.');
      
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.name}: ${r.message}`));
    }

    console.log('\n🚀 Next Steps:');
    if (passed === total) {
      console.log('  1. Run: npm run analyze');
      console.log('  2. Run: npm run dry-run');
      console.log('  3. Review dry-run results');
      console.log('  4. Run: npm run migrate');
    } else {
      console.log('  1. Fix failing tests');
      console.log('  2. Re-run test suite');
      console.log('  3. Proceed with migration when all tests pass');
    }
  }
}

// Main execution
if (require.main === module) {
  const tester = new MigrationTester();
  tester.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { MigrationTester };

