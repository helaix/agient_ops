# Mobile Focused Interface Wireframe

## Overview
This wireframe outlines the structure and components of the Mobile Focused Interface for the Multi-Agent Management system.

## Agent Cards View (Home Screen)

```
+----------------------------------+
| [≡] Multi-Agent Management [👤] |
+----------------------------------+
| [🔍 Search Agents and Tasks...] |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | 🤖 Research Agent         🟢 | |
| | Currently: Web search on...  | |
| | Priority: High               | |
| | Progress: ████████░░ 70%     | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | 🤖 Assistant Agent        🟠 | |
| | Currently: Drafting email... | |
| | Priority: Urgent             | |
| | Progress: ██████████ 100%    | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | 🤖 Data Analysis Agent    ⚪ | |
| | Currently: Idle              | |
| | Priority: None               | |
| | Progress: ░░░░░░░░░░ 0%      | |
| +------------------------------+ |
|                                  |
|                                  |
|                                  |
|           [+ Create]             |
+----------------------------------+
| [Agents] [Tasks] [Workflows] [⋯] |
+----------------------------------+
```

## Status Dashboard View

```
+----------------------------------+
| [≡] System Status           [👤] |
+----------------------------------+
|                                  |
| ACTIVE AGENTS                    |
| ███████░░░ 7/10                  |
|                                  |
| TASKS IN PROGRESS                |
| ████████░░ 8/10                  |
|                                  |
| RESOURCE USAGE                   |
| CPU: ██████░░░░ 60%              |
| Memory: ████████░░ 80%           |
| API Calls: ███░░░░░░░ 30%        |
|                                  |
| RECENT NOTIFICATIONS             |
| ● Research complete (2m ago)     |
| ● Error in Data Agent (5m ago)   |
| ● New task assigned (15m ago)    |
|                                  |
|                                  |
|                                  |
|                                  |
+----------------------------------+
| [Agents] [Tasks] [Workflows] [⋯] |
+----------------------------------+
```

## Layout Structure

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

## Component Details

### Header
- **Menu (≡)**: Access to app settings and global options
- **Title**: Current view title
- **User Profile (👤)**: User settings and profile

### Search Bar
- Tap to expand with keyboard
- Voice search option
- Recent searches shown on focus

### Agent Cards
- Card dimensions: Full width, 120px height
- Horizontal scrolling container
- Compact representation of each agent with:
  - Icon and name
  - Status indicator (colored dot)
  - Current task summary (truncated)
  - Priority level
  - Progress bar
- Tap card to view agent details
- Swipe left/right for quick actions

### Status Dashboard
- Full width container
- Key metrics in grid layout (2x2)
- Glanceable metrics and system status
- Progress bars for key metrics
- Recent notifications with timestamps
- Tap any section to expand details

### Floating Action Button (FAB)
- Floating action button in bottom right
- Context-aware primary action
- Expands to show related actions on tap
- Changes based on current view
- Voice command trigger

### Bottom Navigation
- Fixed at bottom
- Primary navigation between main sections
- Active tab highlighted
- More (⋯) button for additional options
- Badge indicators for updates

## Mobile Interaction Notes

1. **Navigation**:
   - Bottom tabs for primary navigation
   - Swipe between related screens
   - Pull down to refresh data
   - Pull up on cards for additional details

2. **Command Input**:
   - Tap floating action button for primary commands
   - Long-press floating action button for voice commands
   - Shake device for quick command palette

3. **Agent Interaction**:
   - Tap agent card to view details
   - Swipe left on card to pause/resume agent
   - Swipe right on card to view task queue
   - Long-press for additional options

4. **Notifications**:
   - System notifications with action buttons
   - In-app notification center (swipe down)
   - Actionable notifications (reply, approve, etc.)
   - Priority-based notification filtering

## Interactions
- Agent cards: Tap to view details, swipe for more
- Status dashboard: Tap metrics for detailed view
- FAB: Tap to expand, long press for voice
- Bottom nav: Tap to navigate between sections

