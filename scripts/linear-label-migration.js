#!/usr/bin/env node

/**
 * Linear Label Migration Script
 * 
 * This script implements Phase 1.3: Label Standardization & Enhancement
 * by migrating from the current 18-label system to the new structured taxonomy.
 */

const { LinearClient } = require('@linear/sdk');

// Configuration
const TEAM_ID = 'b98d6ca1-f890-45f9-9ff1-d1b47c2f3645'; // Helaix team
const DRY_RUN = process.env.DRY_RUN === 'true';

// Initialize Linear client
const linear = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY
});

// New label definitions with colors
const NEW_LABELS = {
  // Type Labels
  'type:feature': { color: '#0052CC', description: 'New feature development' },
  'type:bug': { color: '#DE350B', description: 'Bug fixes and corrections' },
  'type:improvement': { color: '#00875A', description: 'Enhancements to existing features' },
  'type:documentation': { color: '#5E4DB2', description: 'Documentation work' },
  'type:epic': { color: '#FF8B00', description: 'Large initiatives spanning multiple issues' },
  
  // Priority Labels
  'priority:urgent': { color: '#DE350B', description: 'Critical issues requiring immediate attention' },
  'priority:high': { color: '#FF8B00', description: 'Important issues with clear business impact' },
  'priority:medium': { color: '#FFAB00', description: 'Standard priority items' },
  'priority:low': { color: '#36B37E', description: 'Nice-to-have items for future consideration' },
  
  // Effort Labels
  'effort:xs': { color: '#B3D4FF', description: '1-2 hours of work' },
  'effort:s': { color: '#79E2F2', description: '1-2 days of work' },
  'effort:m': { color: '#ABF5D1', description: '3-5 days of work' },
  'effort:l': { color: '#FFE380', description: '1-2 weeks of work' },
  'effort:xl': { color: '#FFBDAD', description: '2+ weeks of work' },
  
  // Component Labels
  'component:infrastructure': { color: '#6554C0', description: 'Infrastructure and DevOps work' },
  'component:frontend': { color: '#00B8D9', description: 'Frontend development' },
  'component:backend': { color: '#00875A', description: 'Backend development' },
  'component:ai': { color: '#FF5630', description: 'AI/ML related work' },
  'component:analytics': { color: '#403294', description: 'Analytics implementation' },
  
  // Status Labels
  'status:blocked': { color: '#97A0AF', description: 'Issues blocked by dependencies' },
  'status:needs-review': { color: '#FFAB00', description: 'Ready for review' },
  'status:ready-for-dev': { color: '#36B37E', description: 'Ready for development' },
  'status:good-first-issue': { color: '#B3D4FF', description: 'Beginner-friendly tasks' },
  
  // Project Labels
  'project:dstys': { color: '#0052CC', description: 'DSTyS project work' },
  'project:sparkflow': { color: '#00875A', description: 'Sparkflow project work' },
  'project:summit-asphalt': { color: '#FF8B00', description: 'Summit Asphalt project work' },
  'project:hello-operator': { color: '#5E4DB2', description: 'Hello Operator project work' }
};

// Label migration mapping
const LABEL_MIGRATIONS = {
  // Type mappings
  'Feature': 'type:feature',
  'Bug': 'type:bug',
  'Improvement': 'type:improvement',
  'Documentation': 'type:documentation',
  'Epic': 'type:epic',
  
  // Priority mappings
  'high-priority': 'priority:high',
  
  // Effort mappings
  'Complexity: 4': 'effort:xl',
  
  // Component mappings
  'iac': 'component:infrastructure',
  
  // Status mappings
  'good first issue': 'status:good-first-issue'
};

// Labels to archive (remove from all issues)
const LABELS_TO_ARCHIVE = [
  'Slice A',
  'Slice B', 
  'Slice C',
  'native'
];

// Labels to keep as-is
const LABELS_TO_KEEP = [
  'workplan',
  'Analytics',
  'B2B Outreach',
  'SEO Expansion',
  'Ad Campaign'
];

/**
 * Get all existing labels for the team
 */
async function getExistingLabels() {
  console.log('📋 Fetching existing labels...');
  
  const team = await linear.team(TEAM_ID);
  const labels = await team.labels();
  
  const labelMap = {};
  for (const label of labels.nodes) {
    labelMap[label.name] = label;
  }
  
  console.log(`Found ${Object.keys(labelMap).length} existing labels`);
  return labelMap;
}

/**
 * Create new labels
 */
async function createNewLabels(existingLabels) {
  console.log('🏷️ Creating new labels...');
  
  const createdLabels = {};
  
  for (const [name, config] of Object.entries(NEW_LABELS)) {
    if (existingLabels[name]) {
      console.log(`  ⏭️ Label "${name}" already exists, skipping`);
      createdLabels[name] = existingLabels[name];
      continue;
    }
    
    if (DRY_RUN) {
      console.log(`  🔍 [DRY RUN] Would create label: ${name}`);
      continue;
    }
    
    try {
      const result = await linear.createIssueLabel({
        name,
        color: config.color,
        description: config.description,
        teamId: TEAM_ID
      });
      
      if (result.success) {
        createdLabels[name] = result.issueLabel;
        console.log(`  ✅ Created label: ${name}`);
      } else {
        console.error(`  ❌ Failed to create label: ${name}`, result.error);
      }
    } catch (error) {
      console.error(`  ❌ Error creating label ${name}:`, error.message);
    }
  }
  
  return createdLabels;
}

/**
 * Get all issues that need migration
 */
async function getIssuesForMigration() {
  console.log('📊 Fetching issues for migration...');
  
  const team = await linear.team(TEAM_ID);
  const issues = await team.issues({
    first: 250 // Adjust if you have more issues
  });
  
  console.log(`Found ${issues.nodes.length} issues to process`);
  return issues.nodes;
}

/**
 * Migrate labels for a single issue
 */
async function migrateIssueLabels(issue, existingLabels, newLabels) {
  const currentLabels = await issue.labels();
  const currentLabelNames = currentLabels.nodes.map(label => label.name);
  
  let newLabelIds = [];
  let changes = [];
  
  // Process each current label
  for (const labelName of currentLabelNames) {
    if (LABEL_MIGRATIONS[labelName]) {
      // Replace with new label
      const newLabelName = LABEL_MIGRATIONS[labelName];
      if (newLabels[newLabelName]) {
        newLabelIds.push(newLabels[newLabelName].id);
        changes.push(`${labelName} → ${newLabelName}`);
      }
    } else if (LABELS_TO_KEEP.includes(labelName)) {
      // Keep existing label
      if (existingLabels[labelName]) {
        newLabelIds.push(existingLabels[labelName].id);
      }
    } else if (LABELS_TO_ARCHIVE.includes(labelName)) {
      // Remove label (don't add to new list)
      changes.push(`${labelName} → [REMOVED]`);
    } else {
      // Unknown label - keep it for safety
      if (existingLabels[labelName]) {
        newLabelIds.push(existingLabels[labelName].id);
      }
    }
  }
  
  // Add default priority if none exists
  const hasPriority = newLabelIds.some(id => {
    const label = Object.values(newLabels).find(l => l.id === id);
    return label && label.name.startsWith('priority:');
  });
  
  if (!hasPriority && newLabels['priority:medium']) {
    newLabelIds.push(newLabels['priority:medium'].id);
    changes.push('+ priority:medium (default)');
  }
  
  return { newLabelIds, changes };
}

/**
 * Update issues with new labels
 */
async function updateIssueLabels(issues, existingLabels, newLabels) {
  console.log('🔄 Updating issue labels...');
  
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const issue of issues) {
    try {
      const { newLabelIds, changes } = await migrateIssueLabels(issue, existingLabels, newLabels);
      
      if (changes.length === 0) {
        console.log(`  ⏭️ ${issue.identifier}: No changes needed`);
        continue;
      }
      
      if (DRY_RUN) {
        console.log(`  🔍 [DRY RUN] ${issue.identifier}: ${changes.join(', ')}`);
        continue;
      }
      
      const result = await linear.updateIssue(issue.id, {
        labelIds: newLabelIds
      });
      
      if (result.success) {
        console.log(`  ✅ ${issue.identifier}: ${changes.join(', ')}`);
        updatedCount++;
      } else {
        console.error(`  ❌ ${issue.identifier}: Update failed`, result.error);
        errorCount++;
      }
    } catch (error) {
      console.error(`  ❌ ${issue.identifier}: Error updating`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📈 Migration Summary:`);
  console.log(`  ✅ Updated: ${updatedCount} issues`);
  console.log(`  ❌ Errors: ${errorCount} issues`);
}

/**
 * Generate migration report
 */
async function generateReport(existingLabels, newLabels, issues) {
  console.log('\n📊 Migration Report');
  console.log('==================');
  
  console.log('\n🏷️ Label Changes:');
  console.log('Old Label → New Label');
  console.log('--------------------');
  
  for (const [oldLabel, newLabel] of Object.entries(LABEL_MIGRATIONS)) {
    console.log(`${oldLabel} → ${newLabel}`);
  }
  
  console.log('\n🗑️ Labels to Archive:');
  for (const label of LABELS_TO_ARCHIVE) {
    console.log(`- ${label}`);
  }
  
  console.log('\n✅ Labels to Keep:');
  for (const label of LABELS_TO_KEEP) {
    console.log(`- ${label}`);
  }
  
  console.log('\n🆕 New Labels Created:');
  for (const labelName of Object.keys(NEW_LABELS)) {
    const exists = existingLabels[labelName] ? '(existed)' : '(new)';
    console.log(`- ${labelName} ${exists}`);
  }
}

/**
 * Main migration function
 */
async function main() {
  try {
    console.log('🚀 Starting Linear Label Migration');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
    console.log('=====================================\n');
    
    // Step 1: Get existing labels
    const existingLabels = await getExistingLabels();
    
    // Step 2: Create new labels
    const newLabels = await createNewLabels(existingLabels);
    
    // Step 3: Get issues to migrate
    const issues = await getIssuesForMigration();
    
    // Step 4: Update issue labels
    await updateIssueLabels(issues, existingLabels, { ...existingLabels, ...newLabels });
    
    // Step 5: Generate report
    await generateReport(existingLabels, newLabels, issues);
    
    console.log('\n🎉 Migration completed successfully!');
    
    if (DRY_RUN) {
      console.log('\n💡 This was a dry run. To execute the migration, run:');
      console.log('   DRY_RUN=false node scripts/linear-label-migration.js');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = {
  NEW_LABELS,
  LABEL_MIGRATIONS,
  LABELS_TO_ARCHIVE,
  LABELS_TO_KEEP
};

