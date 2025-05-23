/**
 * Phase 2.2: Label Migration & Standardization Configuration
 * 
 * This file defines the complete migration from the current 18-label system
 * to the new structured taxonomy with 6 categories and 29+ labels.
 */

export interface LabelMapping {
  oldLabel: string;
  newLabel: string;
  oldLabelId?: string;
  newLabelId?: string;
  description?: string;
  color?: string;
  category: 'type' | 'priority' | 'effort' | 'component' | 'status' | 'project' | 'business' | 'workflow';
  required?: boolean;
  issuesAffected?: number;
}

export interface LabelCategory {
  name: string;
  description: string;
  required: boolean;
  labels: string[];
}

// New Label Taxonomy Structure
export const NEW_LABEL_CATEGORIES: Record<string, LabelCategory> = {
  type: {
    name: 'Type Labels',
    description: 'Categorizes the nature of the issue (Required)',
    required: true,
    labels: ['type:feature', 'type:bug', 'type:improvement', 'type:documentation', 'type:epic']
  },
  priority: {
    name: 'Priority Labels', 
    description: 'Indicates urgency and importance (Required)',
    required: true,
    labels: ['priority:urgent', 'priority:high', 'priority:medium', 'priority:low']
  },
  effort: {
    name: 'Effort Labels',
    description: 'Estimates time/complexity required (Optional)',
    required: false,
    labels: ['effort:xs', 'effort:s', 'effort:m', 'effort:l', 'effort:xl']
  },
  component: {
    name: 'Component Labels',
    description: 'Identifies technical area/component (Optional)',
    required: false,
    labels: ['component:infrastructure', 'component:frontend', 'component:backend', 'component:ai', 'component:analytics']
  },
  status: {
    name: 'Status Labels',
    description: 'Indicates current state/blockers (Optional)',
    required: false,
    labels: ['status:blocked', 'status:needs-review', 'status:ready-for-dev', 'status:good-first-issue']
  },
  project: {
    name: 'Project Labels',
    description: 'Associates with specific projects (Optional)',
    required: false,
    labels: ['project:dstys', 'project:sparkflow', 'project:summit-asphalt', 'project:hello-operator']
  }
};

// Direct Label Mappings
export const LABEL_MAPPINGS: LabelMapping[] = [
  // Type Labels (Required)
  {
    oldLabel: 'Feature',
    newLabel: 'type:feature',
    category: 'type',
    required: true,
    description: 'New feature or functionality',
    color: '#0E8A16'
  },
  {
    oldLabel: 'Bug',
    newLabel: 'type:bug',
    category: 'type',
    required: true,
    description: 'Something isn\'t working',
    color: '#D73A49'
  },
  {
    oldLabel: 'Improvement',
    newLabel: 'type:improvement',
    category: 'type',
    required: true,
    description: 'Enhancement to existing functionality',
    color: '#A2EEEF'
  },
  {
    oldLabel: 'Documentation',
    newLabel: 'type:documentation',
    category: 'type',
    required: true,
    description: 'Improvements or additions to documentation',
    color: '#0075CA'
  },
  {
    oldLabel: 'Epic',
    newLabel: 'type:epic',
    category: 'type',
    required: true,
    description: 'Large feature or initiative spanning multiple issues',
    color: '#7057FF'
  },

  // Priority Labels (Required)
  {
    oldLabel: 'high-priority',
    newLabel: 'priority:high',
    category: 'priority',
    required: true,
    description: 'High priority - should be addressed soon',
    color: '#FF6B6B'
  },

  // Effort Labels (Optional)
  {
    oldLabel: 'Complexity: 4',
    newLabel: 'effort:xl',
    category: 'effort',
    description: 'Extra large effort (2+ weeks)',
    color: '#8B5CF6'
  },

  // Component Labels (Optional)
  {
    oldLabel: 'iac',
    newLabel: 'component:infrastructure',
    category: 'component',
    description: 'Infrastructure as Code, deployment, DevOps',
    color: '#F59E0B'
  },

  // Status Labels (Optional)
  {
    oldLabel: 'good first issue',
    newLabel: 'status:good-first-issue',
    category: 'status',
    description: 'Good for newcomers',
    color: '#7C3AED'
  }
];

// New Labels to Create (no direct mapping)
export const NEW_LABELS: LabelMapping[] = [
  // Priority Labels
  {
    oldLabel: '',
    newLabel: 'priority:urgent',
    category: 'priority',
    required: true,
    description: 'Urgent - needs immediate attention',
    color: '#DC2626'
  },
  {
    oldLabel: '',
    newLabel: 'priority:medium',
    category: 'priority',
    required: true,
    description: 'Medium priority - default level',
    color: '#F59E0B'
  },
  {
    oldLabel: '',
    newLabel: 'priority:low',
    category: 'priority',
    required: true,
    description: 'Low priority - can be addressed later',
    color: '#10B981'
  },

  // Effort Labels
  {
    oldLabel: '',
    newLabel: 'effort:xs',
    category: 'effort',
    description: 'Extra small effort (1-2 hours)',
    color: '#E5E7EB'
  },
  {
    oldLabel: '',
    newLabel: 'effort:s',
    category: 'effort',
    description: 'Small effort (1-2 days)',
    color: '#D1D5DB'
  },
  {
    oldLabel: '',
    newLabel: 'effort:m',
    category: 'effort',
    description: 'Medium effort (3-5 days)',
    color: '#9CA3AF'
  },
  {
    oldLabel: '',
    newLabel: 'effort:l',
    category: 'effort',
    description: 'Large effort (1-2 weeks)',
    color: '#6B7280'
  },

  // Component Labels
  {
    oldLabel: '',
    newLabel: 'component:frontend',
    category: 'component',
    description: 'Frontend, UI, user-facing components',
    color: '#3B82F6'
  },
  {
    oldLabel: '',
    newLabel: 'component:backend',
    category: 'component',
    description: 'Backend, API, server-side logic',
    color: '#8B5CF6'
  },
  {
    oldLabel: '',
    newLabel: 'component:ai',
    category: 'component',
    description: 'AI/ML, LLM integration, intelligent features',
    color: '#EC4899'
  },
  {
    oldLabel: '',
    newLabel: 'component:analytics',
    category: 'component',
    description: 'Analytics, tracking, data collection',
    color: '#06B6D4'
  },

  // Status Labels
  {
    oldLabel: '',
    newLabel: 'status:blocked',
    category: 'status',
    description: 'Blocked by external dependency',
    color: '#EF4444'
  },
  {
    oldLabel: '',
    newLabel: 'status:needs-review',
    category: 'status',
    description: 'Needs review or approval',
    color: '#F59E0B'
  },
  {
    oldLabel: '',
    newLabel: 'status:ready-for-dev',
    category: 'status',
    description: 'Ready for development',
    color: '#10B981'
  },

  // Project Labels
  {
    oldLabel: '',
    newLabel: 'project:dstys',
    category: 'project',
    description: 'DSTyS project',
    color: '#8B5CF6'
  },
  {
    oldLabel: '',
    newLabel: 'project:sparkflow',
    category: 'project',
    description: 'Sparkflow project',
    color: '#F59E0B'
  },
  {
    oldLabel: '',
    newLabel: 'project:summit-asphalt',
    category: 'project',
    description: 'Summit Asphalt project',
    color: '#6B7280'
  },
  {
    oldLabel: '',
    newLabel: 'project:hello-operator',
    category: 'project',
    description: 'Hello Operator project',
    color: '#10B981'
  }
];

// Labels to Preserve (no changes)
export const PRESERVE_LABELS = [
  'Analytics',
  'B2B Outreach', 
  'SEO Expansion',
  'Ad Campaign',
  'workplan'
];

// Labels to Archive (remove)
export const ARCHIVE_LABELS = [
  'Slice A',
  'Slice B', 
  'Slice C',
  'native'
];

// Default assignments for issues without required labels
export const DEFAULT_ASSIGNMENTS = {
  priority: 'priority:medium', // All issues without priority get medium
  // type: Manual review required - no default assignment
};

// Migration validation rules
export const VALIDATION_RULES = {
  requiredLabels: ['type', 'priority'], // Every issue must have these categories
  maxLabelsPerCategory: {
    type: 1,
    priority: 1,
    effort: 1,
    component: 3, // Can have multiple components
    status: 2,    // Can have multiple status labels
    project: 1    // Should only be in one project
  }
};

export const MIGRATION_CONFIG = {
  teamId: 'b98d6ca1-f890-45f9-9ff1-d1b47c2f3645',
  dryRun: true, // Start with dry run
  batchSize: 10, // Process issues in batches
  delayBetweenBatches: 1000, // 1 second delay
  backupBeforeMigration: true,
  validateAfterMigration: true
};

