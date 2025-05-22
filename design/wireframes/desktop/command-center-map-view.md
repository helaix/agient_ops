# Desktop Command Center - Map View Wireframe

```
+----------------------------------------------------------------------+
|                             TOP BAR                                  |
| [Logo] [Global Search]                 [System Status] [User Profile]|
+----------------------------------------------------------------------+
|        |                                                |            |
|        |                                                |            |
|        |                                                |            |
|        |                                                |            |
|        |                                                |            |
|        |                                                |            |
|  LEFT  |                                                |   RIGHT    |
|        |                                                |            |
| SIDEBAR|              MAIN VIEWPORT                     |  SIDEBAR   |
|        |                                                |            |
| Agent  |              MAP VIEW                          | Context    |
| Roster |                                                | Panel      |
|        |                                                |            |
|        |                                                |            |
|        |                                                |            |
|        |                                                |            |
|        |                                                |            |
+----------------------------------------------------------------------+
|                           BOTTOM BAR                                 |
| [Resource Metrics]                     [Notifications] [System Msgs] |
+----------------------------------------------------------------------+
```

## Component Details

### Top Bar
- **Logo**: System logo and name
- **Global Search**: Search across all agents, tasks, and contexts
- **System Status**: Overall system health indicators
- **User Profile**: Access to user settings and profile

### Left Sidebar (Agent Roster)
- List of all agents with status indicators:
  - 🟢 Active
  - 🟠 Busy
  - 🔴 Error
  - ⚪ Idle
- Quick-access controls for each agent:
  - Pause/Resume
  - View Details
  - Quick Command

### Main Viewport (Map View)
- Spatial representation of agents and their relationships
- Agents represented as nodes with:
  - Icon representing agent type
  - Status indicator
  - Current task label
- Relationships represented as lines between nodes:
  - Solid lines: Direct communication
  - Dashed lines: Context sharing
  - Thickness: Volume of interaction
- Zoom and pan controls
- Grouping controls
- View toggle (Map/Timeline/Kanban)

### Right Sidebar (Context Panel)
- Details for selected agent or task:
  - Name and description
  - Status and priority
  - Resource usage
  - Current context
  - Recent activity
- Action buttons:
  - Assign Task
  - Modify Context
  - View Details
  - Send Command

### Bottom Bar
- **Resource Metrics**: CPU, memory, API usage
- **Notifications**: Recent system notifications
- **System Messages**: Status updates and alerts

## Interaction Notes

1. **Agent Selection**:
   - Click on agent in left sidebar or map view
   - Use Alt+[Number] keyboard shortcut
   - Right sidebar updates with agent details

2. **View Switching**:
   - Toggle buttons in main viewport header
   - Ctrl+[Number] keyboard shortcuts
   - View-specific controls appear based on selection

3. **Command Input**:
   - Press "/" to focus global command input
   - Type "@[agent]" to target specific agent
   - Autocomplete suggestions appear as you type

4. **Context Management**:
   - Drag between agents to create context sharing
   - Right-click on connection to modify sharing settings
   - Context panel shows all shared contexts for selected agent

