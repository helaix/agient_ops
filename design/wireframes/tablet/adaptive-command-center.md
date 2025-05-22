# Tablet Adaptive Command Center Wireframe

## Expanded State (Full Interface)

```
+----------------------------------------------------------------------+
|                             TOP BAR                                  |
| [≡] [Logo] [Search]                      [Status] [User] [Collapse ⟩]|
+----------------------------------------------------------------------+
|        |                                                |            |
|        |                                                |            |
|        |                                                |            |
|        |                                                |            |
|        |                                                |            |
|  LEFT  |                                                |   RIGHT    |
|        |                                                |            |
| SIDEBAR|              MAIN VIEWPORT                     |  SIDEBAR   |
|        |                                                |            |
| Agent  |                                                | Context    |
| List   |                                                | Panel      |
|        |                                                |            |
|        |                                                |            |
|        |                                                |            |
|[Expand⟩]|                                               |[Expand ⟩]  |
+----------------------------------------------------------------------+
|                           BOTTOM TAB BAR                             |
| [Agents] [Tasks] [Workflows] [Notifications]        [+ Quick Action] |
+----------------------------------------------------------------------+
```

## Collapsed State (Maximized Workspace)

```
+----------------------------------------------------------------------+
|                             TOP BAR                                  |
| [≡] [Logo] [Search]                      [Status] [User] [Expand ⟨] |
+----------------------------------------------------------------------+
|                                                                      |
|                                                                      |
|                                                                      |
|                                                                      |
|                                                                      |
|                                                                      |
|                                                                      |
|                        MAIN VIEWPORT                                 |
|                                                                      |
|                                                                      |
|                                                                      |
|                                                                      |
|                                                                      |
|                                                                      |
|                                                                      |
|                                                                      |
+----------------------------------------------------------------------+
|                           BOTTOM TAB BAR                             |
| [Agents] [Tasks] [Workflows] [Notifications]        [+ Quick Action] |
+----------------------------------------------------------------------+
```

## Component Details

### Top Bar
- **Menu (≡)**: Access to app settings and global options
- **Logo**: System logo (smaller than desktop)
- **Search**: Expandable search field
- **Status**: Simplified system status indicator
- **User**: User profile icon
- **Collapse/Expand**: Toggle sidebars visibility

### Left Sidebar (Agent List)
- Collapsible/expandable with tap
- Simplified list of agents with status indicators
- Tap to select agent
- Long-press for quick actions menu

### Main Viewport
- Similar to desktop but with touch-optimized controls
- Pinch to zoom, two-finger pan
- Larger touch targets for selection
- View toggle buttons with labels

### Right Sidebar (Context Panel)
- Collapsible/expandable with tap
- Shows details for selected item
- Simplified controls with larger touch targets
- Swipe actions for common operations

### Bottom Tab Bar
- Primary navigation between main sections
- Active tab highlighted
- Quick Action button for contextual commands
- Swipe up from Quick Action for command palette

## Touch Interaction Notes

1. **Sidebar Management**:
   - Tap collapse/expand buttons to toggle sidebars
   - Swipe from edge to reveal collapsed sidebar temporarily
   - Double-tap main viewport to maximize (collapse both sidebars)

2. **Agent Interaction**:
   - Tap to select agent
   - Long-press for context menu
   - Swipe on agent item for quick actions (pause/resume)

3. **Command Input**:
   - Tap command bar to open keyboard
   - Tap microphone icon for voice input
   - Swipe up from bottom for quick action palette

4. **Gesture Controls**:
   - Two-finger pinch: Zoom in/out
   - Two-finger rotate: Rotate view (in map view)
   - Two-finger swipe: Pan across workspace
   - Four-finger swipe: Switch between views

5. **Split View Support**:
   - In iPad split view, interface adapts to available width
   - Below certain width threshold, automatically collapses sidebars
   - Maintains all functionality in compact layout

