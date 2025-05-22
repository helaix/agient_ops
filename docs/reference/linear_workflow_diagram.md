# Linear Workflow Decision Diagram

## When to Utilize the Linear Workflows Reference


```mermaid
graph TD
    A[Agent Assigned to Linear Issue] --> B{Is this your first time<br>working with Linear?}
    B -->|Yes| C[Review Linear Workflows Reference]
    B -->|No| D{Is this a complex task<br>requiring delegation?}
    
    C --> D
    
    D -->|Yes| E[Review Task Delegation Section<br>in Linear Workflows Reference]
    D -->|No| F{Are you unsure about<br>specific Linear tools?}
    
    E --> G[Create Sub-Issues Following<br>Delegation Guidelines]
    
    F -->|Yes| H[Consult Common Tools Section<br>in Linear Workflows Reference]
    F -->|No| I[Proceed with Task Implementation]
    
    G --> J[Assign Sub-Issues to Self<br>to Trigger sub-agents]
    
    H --> I
    
    J --> K[Monitor sub-agent Progress<br>Using Communication Guidelines]
    
    K --> L[Integrate sub-agent Work<br>Following Integration Guidelines]
    
    L --> M[Create Final PR and<br>Update Issue Status]
    
    I --> M
    
    style A fill:#d0e0ff,stroke:#3080ff
    style C fill:#ffe0d0,stroke:#ff8030
    style E fill:#ffe0d0,stroke:#ff8030
    style H fill:#ffe0d0,stroke:#ff8030
    style G fill:#d0ffe0,stroke:#30c080
    style J fill:#d0ffe0,stroke:#30c080
    style K fill:#d0ffe0,stroke:#30c080
    style L fill:#d0ffe0,stroke:#30c080
    style M fill:#d0e0ff,stroke:#3080ff

```

## Key Reference Points

| Scenario | Reference Section | Key Information |
|----------|-------------------|----------------|
| First-time Linear user | [Overview of Linear Workflows](./linear_workflows_reference.md#overview-of-linear-workflows) | Basic concepts and components |
| Task delegation | [Task Delegation and Communication](./linear_workflows_reference.md#task-delegation-and-communication) | Creating sub-issues, sub-agent delegation |
| Linear tool usage | [Common Tools and Patterns](./linear_workflows_reference.md#common-tools-and-patterns) | API examples, common patterns |
| Communication protocols | [Communication Best Practices](./linear_workflows_reference.md#communication-best-practices) | Formatting, updates, interrupts |
| Troubleshooting | [Troubleshooting](./linear_workflows_reference.md#troubleshooting) | Common issues and solutions |

## Integration with Agent Collaboration Workflow

When working on complex tasks that require multi-agent collaboration, combine the Linear Workflows Reference with the [Agent Collaboration Workflow](../src/content/docs/reference/agent_collaboration_workflow.md) for optimal results:

1. Use Linear Workflows Reference for Linear-specific tools and processes
2. Use Agent Collaboration Workflow for hierarchical delegation and code management
3. Follow Communication SOPs from both documents for consistent messaging



## Related Resources

- [Linear Workflows Reference Guide](linear_workflows_reference.md)
- [Workflow Selection Decision Tree](../decision_trees/workflow_selection_tree.md)
