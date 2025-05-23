# Agient Ops

A repository of operational patterns, workflows, and best practices for agent-based systems.

## Repository Structure

- **workflows/** - Collection of workflow patterns and documentation
  - **postmortems/** - Detailed postmortems from completed projects
  - **patterns/** - Base-level workflow patterns
  - **meta-patterns/** - Higher-order workflow patterns that coordinate multiple base patterns
  - **meta-meta-patterns/** - High-level coordination frameworks that adapt and evolve

## Multi-Agent Management UI/UX Mockups

This repository also contains UI/UX mockups for a multi-agent management system across desktop, tablet, and mobile form factors.

### Overview

The Multi-Agent Management system provides a comprehensive interface for monitoring, controlling, and orchestrating multiple AI agents. The UI/UX mockups demonstrate how this system would work across different device form factors.

### Components

#### Desktop Experience
- **Command Center View**: Comprehensive "God Mode" view inspired by RTS games
- **Agent Detail View**: Detailed view when focusing on a specific agent
- **Workflow Designer**: Interface for creating multi-agent workflows

#### Tablet Experience
- **Adaptive Command Center**: Touch-optimized interface with collapsible sidebars
- **Navigation Patterns**: Specialized navigation for touch interfaces

#### Mobile Experience
- **Focused Interface**: Prioritizes essential information and actions
- **Hierarchical Navigation**: Optimized navigation for small screens

#### Cross-Device Features
- **Unified Command Language**: Consistent command syntax across all devices
- **Context Visualization**: Visual representation of context sharing between agents
- **Priority Management**: Visual system for managing priorities
- **Notification System**: Adaptive notifications across devices
- **Synchronization**: Seamless transition between devices

### Directory Structure

```
src/
├── desktop/           # Desktop experience components
├── tablet/            # Tablet experience components
├── mobile/            # Mobile experience components
│   ├── assets/        # Images and other assets
│   ├── js/            # JavaScript files
│   ├── styles/        # CSS files
│   ├── index.html     # Mobile Focused Interface
│   └── hierarchical-nav.html  # Mobile Hierarchical Navigation
├── cross-device/      # Cross-device features
└── unified-showcase.html  # Unified showcase page for all components
```

## Remotion Media Parser Research Coordination

This repository includes documentation from the Remotion Media Parser research coordination project for Sparkflow, including:

1. **Postmortem**: Detailed analysis of the research coordination process, challenges, and solutions
2. **Workflow Patterns**: Documentation of reusable workflow patterns identified during the project
3. **Meta-Workflow Patterns**: Higher-order patterns for coordinating complex tasks
4. **Meta-Meta-Workflow Patterns**: Adaptive coordination frameworks for evolving projects

## Workflow Patterns

### Base Patterns
- **Research Coordination Workflow**: Coordinating distributed research tasks
- **Postmortem and Self-Analysis Workflow**: Reflecting on completed work and extracting learnings
- **Structured Feedback and Recognition Workflow**: Providing specific, constructive feedback
- **Hierarchical Communication and Reporting Workflow**: Managing communication across task hierarchy levels

### Meta-Patterns
- **Task Decomposition and Recomposition**: Breaking complex tasks into components and reassembling results

### Meta-Meta-Patterns
- **Adaptive Coordination System**: Self-adjusting coordination framework for complex projects

## Getting Started

### For UI/UX Mockups
To view the mockups:

1. Clone this repository
2. Open `src/unified-showcase.html` in a web browser
3. Navigate through the different components to see how they work across different form factors

### For Workflow Patterns
Explore the `workflows/` directory for documented patterns and examples.

