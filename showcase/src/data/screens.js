// This file contains the data for all screens in the showcase
// In a real implementation, this would be dynamically loaded from the actual components

export const screens = [
  // Desktop Screens
  {
    id: 'desktop-command-center',
    title: 'Desktop Command Center',
    description: 'Comprehensive "God Mode" view inspired by RTS games with multiple viewports',
    deviceType: 'desktop',
    category: 'command-center',
    imageUrl: '/images/desktop-command-center.png',
    implementationStatus: 'completed',
    prLink: 'https://github.com/helaix/agient_ops/pull/42'
  },
  {
    id: 'desktop-agent-detail',
    title: 'Desktop Agent Detail View',
    description: 'Detailed view when focusing on a specific agent with capabilities and metrics',
    deviceType: 'desktop',
    category: 'agent-detail',
    imageUrl: '/images/desktop-agent-detail.png',
    implementationStatus: 'completed',
    prLink: 'https://github.com/helaix/agient_ops/pull/38'
  },
  {
    id: 'desktop-workflow-designer',
    title: 'Desktop Workflow Designer',
    description: 'Drag-and-drop interface for creating agent workflows with validation tools',
    deviceType: 'desktop',
    category: 'workflow',
    imageUrl: '/images/desktop-workflow-designer.png',
    implementationStatus: 'in-progress',
    prLink: null
  },
  
  // Tablet Screens
  {
    id: 'tablet-adaptive-command-center',
    title: 'Tablet Adaptive Command Center',
    description: 'Touch-optimized command center with collapsible sidebars and contextual toolbars',
    deviceType: 'tablet',
    category: 'command-center',
    imageUrl: '/images/tablet-adaptive-command-center.png',
    implementationStatus: 'completed',
    prLink: 'https://github.com/helaix/agient_ops/pull/40'
  },
  {
    id: 'tablet-navigation-patterns',
    title: 'Tablet Navigation Patterns',
    description: 'Specialized navigation for touch interfaces with gesture support',
    deviceType: 'tablet',
    category: 'navigation',
    imageUrl: '/images/tablet-navigation-patterns.png',
    implementationStatus: 'completed',
    prLink: 'https://github.com/helaix/agient_ops/pull/44'
  },
  {
    id: 'tablet-command-input',
    title: 'Tablet Command Input',
    description: 'Command input adapted for tablet use with touch keyboard and voice input',
    deviceType: 'tablet',
    category: 'input',
    imageUrl: '/images/tablet-command-input.png',
    implementationStatus: 'in-progress',
    prLink: null
  },
  
  // Mobile Screens
  {
    id: 'mobile-focused-interface',
    title: 'Mobile Focused Interface',
    description: 'Streamlined interface prioritizing essential information and actions',
    deviceType: 'mobile',
    category: 'interface',
    imageUrl: '/images/mobile-focused-interface.png',
    implementationStatus: 'in-progress',
    prLink: null
  },
  {
    id: 'mobile-hierarchical-navigation',
    title: 'Mobile Hierarchical Navigation',
    description: 'Optimized navigation for small screens with list-to-detail pattern',
    deviceType: 'mobile',
    category: 'navigation',
    imageUrl: '/images/mobile-hierarchical-navigation.png',
    implementationStatus: 'completed',
    prLink: 'https://github.com/helaix/agient_ops/pull/41'
  },
  {
    id: 'mobile-simplified-command-input',
    title: 'Mobile Simplified Command Input',
    description: 'Streamlined command input for mobile with predefined commands and voice input',
    deviceType: 'mobile',
    category: 'input',
    imageUrl: '/images/mobile-simplified-command-input.png',
    implementationStatus: 'in-progress',
    prLink: null
  },
  
  // Cross-Device Features
  {
    id: 'cross-device-unified-command-language',
    title: 'Unified Command Language',
    description: 'Consistent command syntax that works across all devices',
    deviceType: 'cross-device',
    category: 'command',
    imageUrl: '/images/cross-device-unified-command-language.png',
    implementationStatus: 'in-progress',
    prLink: null
  },
  {
    id: 'cross-device-context-visualization',
    title: 'Context Visualization',
    description: 'Visual representation of context sharing between agents across devices',
    deviceType: 'cross-device',
    category: 'visualization',
    imageUrl: '/images/cross-device-context-visualization.png',
    implementationStatus: 'in-progress',
    prLink: null
  },
  {
    id: 'cross-device-priority-management',
    title: 'Priority Management',
    description: 'Visual system for managing priorities with color coding and size variation',
    deviceType: 'cross-device',
    category: 'management',
    imageUrl: '/images/cross-device-priority-management.png',
    implementationStatus: 'in-progress',
    prLink: null
  }
];
