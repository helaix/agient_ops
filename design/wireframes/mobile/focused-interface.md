# Mobile Focused Interface Wireframe

## Overview
This wireframe outlines the structure and components of the Mobile Focused Interface for the Multi-Agent Management system.

## Components

### Agent Cards
- Card dimensions: Full width, 120px height
- Horizontal scrolling container
- Each card contains:
  - Agent avatar (left)
  - Agent name and type (top)
  - Status indicator (colored dot)
  - Priority level (1-4 bars)
  - Progress indicator (circular)
  - Quick action buttons (right)

### Status Dashboard
- Full width container
- Key metrics in grid layout (2x2)
- System health indicator (top)
- Resource usage graph (middle)
- Recent activity log (scrollable, bottom)

### Action Button
- Floating action button (FAB) in bottom right
- Primary color with icon
- Expandable menu on tap
- 4-6 contextual actions
- Voice command trigger

### Bottom Navigation
- Fixed at bottom
- 3 main sections: Agents, Tasks, Notifications
- Active state highlighted
- Badge indicators for updates
- Minimal text labels

## Layout
```
┌─────────────────────────────┐
│ [Header/App Bar]            │
├─────────────────────────────┤
│ [Agent Cards - Scrollable]  │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │
│ │   │ │   │ │   │ │   │    │
│ └───┘ └───┘ └───┘ └───┘    │
├─────────────────────────────┤
│ [Status Dashboard]          │
│ ┌─────┐ ┌─────┐            │
│ │     │ │     │            │
│ └─────┘ └─────┘            │
│ ┌─────┐ ┌─────┐            │
│ │     │ │     │            │
│ └─────┘ └─────┘            │
│                             │
│ [Recent Activity]           │
│ - Item 1                    │
│ - Item 2                    │
│                             │
│                  [FAB]      │
├─────────────────────────────┤
│ [Bottom Navigation]         │
│ [Agents] [Tasks] [Notifs]   │
└─────────────────────────────┘
```

## Interactions
- Agent cards: Tap to view details, swipe for more
- Status dashboard: Tap metrics for detailed view
- FAB: Tap to expand, long press for voice
- Bottom nav: Tap to navigate between sections

