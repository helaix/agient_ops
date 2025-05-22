// This file contains the documentation data for all screens in the showcase

export const documentationData = [
  // Desktop Screens
  {
    id: 'desktop-command-center',
    title: 'Desktop Command Center',
    deviceType: 'desktop',
    specifications: `
      <h3>Desktop Command Center Specifications</h3>
      <p>The desktop experience offers a comprehensive "God Mode" view inspired by RTS games:</p>
      <ul>
        <li><strong>Top Bar</strong>: Global commands, search, and system status</li>
        <li><strong>Left Sidebar</strong>: Agent roster with status indicators and quick-access controls</li>
        <li><strong>Main Viewport</strong>: Primary workspace with multiple possible views:
          <ul>
            <li><strong>Map View</strong>: Spatial representation of agents and their relationships</li>
            <li><strong>Timeline View</strong>: Gantt-style visualization of agent tasks and dependencies</li>
            <li><strong>Kanban View</strong>: Drag-and-drop task management across agent workstreams</li>
          </ul>
        </li>
        <li><strong>Right Sidebar</strong>: Context panel showing details for selected agent/task</li>
        <li><strong>Bottom Bar</strong>: Resource metrics, notifications, and system messages</li>
      </ul>
    `,
    implementationNotes: `
      <h3>Implementation Notes</h3>
      <p>The Desktop Command Center is implemented using a responsive grid layout with resizable panels:</p>
      <ul>
        <li>React Grid Layout is used for the main viewport to allow for customizable layouts</li>
        <li>SVG-based visualization for the Map View with D3.js integration</li>
        <li>Custom Kanban board implementation with drag-and-drop functionality</li>
        <li>Context-aware sidebars that adapt based on selected elements</li>
      </ul>
      <p>PR: <a href="https://github.com/helaix/agient_ops/pull/42" target="_blank">View on GitHub</a></p>
    `,
    knownIssues: `
      <h3>Known Issues</h3>
      <ul>
        <li>Performance degradation with large agent networks in Map View</li>
        <li>Timeline view does not yet support dependencies between tasks</li>
        <li>Limited keyboard shortcut support in the current implementation</li>
      </ul>
    `,
    futurePlans: `
      <h3>Future Plans</h3>
      <ul>
        <li>Add advanced filtering capabilities for agent roster</li>
        <li>Implement real-time collaboration features</li>
        <li>Enhance visualization options for different agent relationship types</li>
        <li>Add customizable dashboard layouts that can be saved and shared</li>
      </ul>
    `
  },
  {
    id: 'desktop-agent-detail',
    title: 'Desktop Agent Detail View',
    deviceType: 'desktop',
    specifications: `
      <h3>Desktop Agent Detail View Specifications</h3>
      <p>When focusing on a specific agent:</p>
      <ul>
        <li><strong>Agent Profile</strong>: Capabilities, current status, and resource usage</li>
        <li><strong>Task Queue</strong>: Current and upcoming tasks with priority indicators</li>
        <li><strong>Context Access</strong>: Visual representation of contexts the agent can access</li>
        <li><strong>Performance Metrics</strong>: Response time, completion rate, and resource efficiency</li>
        <li><strong>Command Terminal</strong>: Direct command interface for the selected agent</li>
      </ul>
    `,
    implementationNotes: `
      <h3>Implementation Notes</h3>
      <p>The Desktop Agent Detail View is implemented with a focus on detailed information display:</p>
      <ul>
        <li>Tabbed interface for organizing different aspects of agent information</li>
        <li>Real-time charts for performance metrics using Chart.js</li>
        <li>Interactive terminal component with command history and autocomplete</li>
        <li>Context visualization using a force-directed graph</li>
      </ul>
    `,
    knownIssues: `
      <h3>Known Issues</h3>
      <ul>
        <li>Terminal command validation is limited</li>
        <li>Performance metrics visualization needs optimization for historical data</li>
        <li>Context access visualization becomes cluttered with many connections</li>
      </ul>
    `,
    futurePlans: `
      <h3>Future Plans</h3>
      <ul>
        <li>Add ability to modify agent capabilities directly from the detail view</li>
        <li>Implement advanced terminal features like command scripting</li>
        <li>Add comparative performance metrics between similar agents</li>
        <li>Enhance context visualization with filtering and grouping options</li>
      </ul>
    `
  },
  {
    id: 'desktop-workflow-designer',
    title: 'Desktop Workflow Designer',
    deviceType: 'desktop',
    specifications: `
      <h3>Desktop Workflow Designer Specifications</h3>
      <p>For creating multi-agent workflows:</p>
      <ul>
        <li><strong>Canvas</strong>: Drag-and-drop interface for creating agent workflows</li>
        <li><strong>Agent Palette</strong>: Available agents that can be added to workflows</li>
        <li><strong>Connection Tools</strong>: Methods to define relationships and dependencies</li>
        <li><strong>Validation Tools</strong>: Real-time feedback on workflow viability</li>
        <li><strong>Testing Interface</strong>: Simulation capabilities for workflow testing</li>
      </ul>
    `,
    implementationNotes: `
      <h3>Implementation Notes</h3>
      <p>The Desktop Workflow Designer is implemented using a canvas-based approach:</p>
      <ul>
        <li>React Flow for the interactive workflow canvas</li>
        <li>Custom node types for different agent roles and capabilities</li>
        <li>Edge validation to ensure proper workflow connections</li>
        <li>Simulation engine for testing workflows without actual execution</li>
      </ul>
    `,
    knownIssues: `
      <h3>Known Issues</h3>
      <ul>
        <li>Complex workflows with many nodes can cause performance issues</li>
        <li>Limited support for conditional branching in workflows</li>
        <li>Simulation does not accurately represent all possible edge cases</li>
      </ul>
    `,
    futurePlans: `
      <h3>Future Plans</h3>
      <ul>
        <li>Add support for workflow templates and sharing</li>
        <li>Implement version control for workflows</li>
        <li>Enhance simulation capabilities with more realistic agent behavior</li>
        <li>Add performance prediction for workflows based on agent capabilities</li>
      </ul>
    `
  },
  
  // Tablet Screens
  {
    id: 'tablet-adaptive-command-center',
    title: 'Tablet Adaptive Command Center',
    deviceType: 'tablet',
    specifications: `
      <h3>Tablet Adaptive Command Center Specifications</h3>
      <p>The tablet interface maintains most desktop functionality with touch-optimized controls:</p>
      <ul>
        <li><strong>Collapsible Sidebars</strong>: Tap to expand/collapse for more workspace</li>
        <li><strong>Touch-Optimized Controls</strong>: Larger hit targets and gesture support</li>
        <li><strong>Split View Support</strong>: Run alongside other apps on supported tablets</li>
        <li><strong>Contextual Toolbars</strong>: Tools that appear based on current selection</li>
      </ul>
    `,
    implementationNotes: `
      <h3>Implementation Notes</h3>
      <p>The Tablet Adaptive Command Center is implemented with touch interactions as a priority:</p>
      <ul>
        <li>Responsive design that adapts to both portrait and landscape orientations</li>
        <li>Gesture library for swipe, pinch, and multi-touch interactions</li>
        <li>Context-sensitive UI elements that appear when needed</li>
        <li>Optimized rendering for tablet performance constraints</li>
      </ul>
      <p>PR: <a href="https://github.com/helaix/agient_ops/pull/40" target="_blank">View on GitHub</a></p>
    `,
    knownIssues: `
      <h3>Known Issues</h3>
      <ul>
        <li>Some gestures conflict with native tablet OS gestures</li>
        <li>Split view mode has limited functionality on some tablet models</li>
        <li>Performance issues with complex visualizations on older tablets</li>
      </ul>
    `,
    futurePlans: `
      <h3>Future Plans</h3>
      <ul>
        <li>Add support for stylus input for more precise interactions</li>
        <li>Implement offline mode with synchronization</li>
        <li>Enhance split view capabilities with drag-and-drop between apps</li>
        <li>Add tablet-specific shortcuts for common actions</li>
      </ul>
    `
  },
  {
    id: 'tablet-navigation-patterns',
    title: 'Tablet Navigation Patterns',
    deviceType: 'tablet',
    specifications: `
      <h3>Tablet Navigation Patterns Specifications</h3>
      <p>Specialized navigation for touch interfaces:</p>
      <ul>
        <li><strong>Bottom Tab Bar</strong>: Quick access to main views (Agents, Tasks, Workflows)</li>
        <li><strong>Long-Press Actions</strong>: Context menus for common operations</li>
        <li><strong>Two-Finger Gestures</strong>: Zoom and pan in spatial views</li>
        <li><strong>Swipe Navigation</strong>: Move between related items or views</li>
      </ul>
    `,
    implementationNotes: `
      <h3>Implementation Notes</h3>
      <p>The Tablet Navigation Patterns are implemented with a focus on intuitive touch interactions:</p>
      <ul>
        <li>Custom bottom navigation bar with animated transitions</li>
        <li>Context-aware long-press menus that adapt to the current content</li>
        <li>Multi-touch gesture recognition for map and timeline views</li>
        <li>Swipe detection with velocity-based animations</li>
      </ul>
    `,
    knownIssues: `
      <h3>Known Issues</h3>
      <ul>
        <li>Gesture conflicts in nested scrollable areas</li>
        <li>Inconsistent long-press behavior across different tablet browsers</li>
        <li>Limited accessibility support for gesture-based interactions</li>
      </ul>
    `,
    futurePlans: `
      <h3>Future Plans</h3>
      <ul>
        <li>Add customizable navigation bar with user-preferred shortcuts</li>
        <li>Implement advanced gesture combinations for power users</li>
        <li>Enhance accessibility with alternative navigation methods</li>
        <li>Add haptic feedback for gesture confirmation where supported</li>
      </ul>
    `
  },
  
  // Mobile Screens
  {
    id: 'mobile-hierarchical-navigation',
    title: 'Mobile Hierarchical Navigation',
    deviceType: 'mobile',
    specifications: `
      <h3>Mobile Hierarchical Navigation Specifications</h3>
      <p>Optimized for small screens:</p>
      <ul>
        <li><strong>List → Detail Pattern</strong>: Navigate from lists to detailed views</li>
        <li><strong>Breadcrumb Navigation</strong>: Track location in complex workflows</li>
        <li><strong>Modal Overlays</strong>: Focused interfaces for specific actions</li>
        <li><strong>Pull-to-Refresh</strong>: Update agent status and information</li>
      </ul>
    `,
    implementationNotes: `
      <h3>Implementation Notes</h3>
      <p>The Mobile Hierarchical Navigation is implemented with a focus on efficient use of limited screen space:</p>
      <ul>
        <li>Stack-based navigation with animated transitions</li>
        <li>Persistent breadcrumb component that collapses as needed</li>
        <li>Modal system with gesture-based dismissal</li>
        <li>Pull-to-refresh implementation with loading indicators</li>
      </ul>
      <p>PR: <a href="https://github.com/helaix/agient_ops/pull/41" target="_blank">View on GitHub</a></p>
    `,
    knownIssues: `
      <h3>Known Issues</h3>
      <ul>
        <li>Deep navigation hierarchies can become confusing</li>
        <li>Breadcrumb navigation becomes truncated on very small screens</li>
        <li>Some modals are not properly responsive on all device sizes</li>
      </ul>
    `,
    futurePlans: `
      <h3>Future Plans</h3>
      <ul>
        <li>Add search functionality to quickly jump to any screen</li>
        <li>Implement navigation history with back/forward capabilities</li>
        <li>Enhance modal system with more interactive elements</li>
        <li>Add voice navigation for hands-free operation</li>
      </ul>
    `
  },
  
  // Cross-Device Features
  {
    id: 'cross-device-unified-command-language',
    title: 'Unified Command Language',
    deviceType: 'cross-device',
    specifications: `
      <h3>Unified Command Language Specifications</h3>
      <p>A consistent command syntax works across all devices:</p>
      <pre>@[agent] [action] [parameters]</pre>
      <p>Examples:</p>
      <ul>
        <li><code>@research find information about renewable energy</code></li>
        <li><code>@all pause tasks</code></li>
        <li><code>@assistant schedule meeting with marketing team</code></li>
      </ul>
    `,
    implementationNotes: `
      <h3>Implementation Notes</h3>
      <p>The Unified Command Language is implemented as a core system that works across all devices:</p>
      <ul>
        <li>Parser and interpreter for the command syntax</li>
        <li>Autocomplete system with context-aware suggestions</li>
        <li>Command history with search capabilities</li>
        <li>Device-specific input methods (keyboard, touch, voice) that all use the same command structure</li>
      </ul>
    `,
    knownIssues: `
      <h3>Known Issues</h3>
      <ul>
        <li>Limited natural language understanding for complex commands</li>
        <li>Autocomplete can be slow with many agents and actions</li>
        <li>Command history synchronization issues between devices</li>
      </ul>
    `,
    futurePlans: `
      <h3>Future Plans</h3>
      <ul>
        <li>Enhance natural language processing for more flexible command syntax</li>
        <li>Add command macros for frequently used sequences</li>
        <li>Implement command sharing between users</li>
        <li>Add analytics to improve command suggestions based on usage patterns</li>
      </ul>
    `
  },
  {
    id: 'cross-device-priority-management',
    title: 'Priority Management',
    deviceType: 'cross-device',
    specifications: `
      <h3>Priority Management Specifications</h3>
      <p>Visual system for managing priorities:</p>
      <ul>
        <li><strong>Color Coding</strong>: Red (urgent), Orange (high), Yellow (medium), Green (low)</li>
        <li><strong>Size Variation</strong>: Higher priority items appear larger in spatial views</li>
        <li><strong>Position</strong>: Higher priority items appear at the top in list views</li>
      </ul>
    `,
    implementationNotes: `
      <h3>Implementation Notes</h3>
      <p>The Priority Management system is implemented as a cross-cutting concern:</p>
      <ul>
        <li>Consistent color scheme applied across all components</li>
        <li>Responsive sizing system that scales with priority level</li>
        <li>Sorting algorithms that consider priority in all list views</li>
        <li>Accessibility considerations for color-blind users (patterns in addition to colors)</li>
      </ul>
    `,
    knownIssues: `
      <h3>Known Issues</h3>
      <ul>
        <li>Color contrast issues in some high-brightness environments</li>
        <li>Size scaling can cause layout issues in dense views</li>
        <li>Priority-based sorting can be confusing when combined with other sorting criteria</li>
      </ul>
    `,
    futurePlans: `
      <h3>Future Plans</h3>
      <ul>
        <li>Add customizable priority levels beyond the standard four</li>
        <li>Implement priority trends and forecasting</li>
        <li>Enhance visualization with additional visual cues beyond color and size</li>
        <li>Add automated priority suggestions based on content and deadlines</li>
      </ul>
    `
  }
];

