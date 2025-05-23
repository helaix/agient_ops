# Breadcrumb Navigation

Breadcrumb Navigation helps users track their location within complex workflows and provides an easy way to navigate back to previous levels.

## Breadcrumb Navigation Wireframe

```
+----------------------------------+
| [←] Task Details             [⋮] |
+----------------------------------+
| Agents > Research Agent > Tasks  |
+----------------------------------+
| +------------------------------+ |
| |                              | |
| |  Research Renewable Energy   | |
| |                              | |
| +------------------------------+ |
|                                  |
| Status: In Progress              |
| Assigned: Research Agent         |
| Due: Today, 5:00 PM              |
| Priority: High                   |
|                                  |
| SUBTASKS                         |
| ☑ Gather initial sources         |
| ☐ Analyze recent developments    |
| ☐ Compile findings               |
| ☐ Generate report                |
|                                  |
| DEPENDENCIES                     |
| • None                           |
|                                  |
| NOTES                            |
| Focus on developments from the   |
| last 6 months. Include market    |
| trends and technology advances.  |
|                                  |
| [Modify Task]    [View Progress] |
+----------------------------------+
| [Agents] [Tasks] [Workflows] [⋯] |
+----------------------------------+
```

## Nested Workflow Wireframe

```
+----------------------------------+
| [←] Workflow Details         [⋮] |
+----------------------------------+
| Workflows > Market Research      |
+----------------------------------+
| +------------------------------+ |
| |                              | |
| |      Market Research         | |
| |                              | |
| +------------------------------+ |
|                                  |
| Status: Active (2/5 complete)    |
| Owner: Marketing Team            |
| Due: Friday, 3:00 PM             |
| Priority: High                   |
|                                  |
| WORKFLOW STEPS                   |
| ☑ Initial Data Collection        |
| ☑ Competitor Analysis            |
| ☐ Customer Surveys               |
| ☐ Market Trend Analysis          |
| ☐ Final Report                   |
|                                  |
| TAP ON A STEP TO VIEW DETAILS    |
|                                  |
| ASSIGNED AGENTS                  |
| • Research Agent                 |
| • Data Analysis Agent            |
| • Assistant Agent                |
|                                  |
| [Pause Workflow]  [Modify Steps] |
+----------------------------------+
| [Agents] [Tasks] [Workflows] [⋯] |
+----------------------------------+
```

## Implementation Details

### Breadcrumb Design
- **Compact Format**: Optimized for limited screen space
- **Truncation**: Long names are truncated with ellipsis
- **Visual Separators**: ">" symbol between levels
- **Tap Targets**: Each segment is individually tappable
- **Current Location**: Last segment is highlighted/emphasized

### Placement Options
- **Below Header**: Standard placement directly under the page title
- **Collapsible**: Can collapse to show only current and parent level
- **Expandable**: Tap to expand full path when collapsed
- **Sticky**: Can remain visible during page scroll

### Interaction Patterns
- **Tap**: Navigate directly to that level
- **Swipe Right**: Navigate to parent level (alternative to back button)
- **Long Press**: Show additional options or preview
- **Horizontal Scroll**: For very deep hierarchies that don't fit on screen

### Visual Feedback
- **Hover/Touch State**: Visual indication when touching a breadcrumb
- **Animation**: Smooth transition when navigating between levels
- **Context Hints**: Optional tooltips showing full names for truncated items

### Responsive Behavior
- **Adaptive Truncation**: Adjusts visible segments based on screen width
- **Priority Levels**: Always shows at minimum the current and parent level
- **Orientation Change**: Recalculates visible segments on rotation

### Integration with Other Navigation Patterns
- **Works with Back Button**: Complements standard back navigation
- **Complements List-Detail**: Provides context when deep in nested details
- **Modal Context**: Shows path even in modal overlays

### Accessibility Considerations
- **Screen Reader Support**: Properly labeled for assistive technology
- **Keyboard Navigation**: Accessible via keyboard on hybrid devices
- **Color Contrast**: Meets WCAG standards for visibility
- **Touch Target Size**: Minimum 44×44 points for each tappable segment

