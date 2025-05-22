# List → Detail Pattern

The List → Detail Pattern is a fundamental mobile navigation pattern that allows users to navigate from a list of items to a detailed view of a selected item.

## List View Wireframe

```
+----------------------------------+
| [←] Agents                  [⋮] |
+----------------------------------+
| [🔍 Search Agents...]           |
+----------------------------------+
| ACTIVE AGENTS                    |
|                                  |
| +------------------------------+ |
| | 🤖 Research Agent         🟢 | |
| | Web search on renewable...   | |
| | Priority: High               | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | 🤖 Assistant Agent        🟠 | |
| | Drafting email to marketing  | |
| | Priority: Urgent             | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | 🤖 Data Analysis Agent    ⚪ | |
| | Idle                         | |
| | Priority: None               | |
| +------------------------------+ |
|                                  |
| INACTIVE AGENTS                  |
|                                  |
| +------------------------------+ |
| | 🤖 Code Review Agent      ⚪ | |
| | Offline                      | |
| | Priority: Low                | |
| +------------------------------+ |
|                                  |
|           [+ Create]             |
+----------------------------------+
| [Agents] [Tasks] [Workflows] [⋯] |
+----------------------------------+
```

## Detail View Wireframe

```
+----------------------------------+
| [←] Research Agent           [⋮] |
+----------------------------------+
| +------------------------------+ |
| |            🤖                | |
| |      Research Agent          | |
| |            🟢                | |
| +------------------------------+ |
|                                  |
| Status: Active                   |
| Current Task: Web search on      |
|   renewable energy sources       |
| Priority: High                   |
| Progress: ████████░░ 80%         |
|                                  |
| CAPABILITIES                     |
| • Web Search                     |
| • Data Analysis                  |
| • Report Generation              |
|                                  |
| RESOURCE USAGE                   |
| CPU: ██████░░░░ 60%              |
| Memory: ████░░░░░░ 40%           |
| API Calls: ███████░░░ 70%        |
|                                  |
| RECENT ACTIVITY                  |
| • Completed search (2m ago)      |
| • Started analysis (3m ago)      |
| • Received task (10m ago)        |
|                                  |
| [Pause Agent]    [Modify Task]   |
+----------------------------------+
| [Agents] [Tasks] [Workflows] [⋯] |
+----------------------------------+
```

## Implementation Details

### Navigation Flow
1. User starts on the List View showing all agents
2. User taps on an agent card to navigate to the Detail View
3. User can tap the back button (←) to return to the List View
4. Transitions between views use smooth animations

### List View Components
- **Header**: Title with back button and menu options
- **Search Bar**: Filter agents by name, status, or task
- **Section Headers**: Group agents by status (Active/Inactive)
- **Agent Cards**: Compact preview of agent information
  - Icon and name
  - Status indicator (colored dot)
  - Current task summary (truncated)
  - Priority level
- **Create Button**: Add new agents
- **Bottom Navigation**: Access to other main sections

### Detail View Components
- **Header**: Agent name with back button and menu options
- **Agent Profile**: Large icon, name, and status
- **Status Information**: Current task, priority, and progress
- **Capabilities**: List of agent capabilities
- **Resource Usage**: Visual representation of resource consumption
- **Recent Activity**: Timeline of recent actions
- **Action Buttons**: Primary actions for the selected agent
- **Bottom Navigation**: Access to other main sections

### Interaction Patterns
- **Tap**: Select an item to view details
- **Swipe Left/Right**: Quick actions on list items
- **Pull to Refresh**: Update the list with latest information
- **Long Press**: Show additional options for an item
- **Scroll**: Navigate through the list

### Transitions
- **List to Detail**: Expand card animation
- **Detail to List**: Collapse animation
- **Shared Element Transitions**: Agent icon, name, and status indicator animate between views

### Responsive Behavior
- Adapts to different screen sizes while maintaining usability
- Adjusts font sizes and spacing based on device dimensions
- Maintains touch target sizes of at least 44×44 points

