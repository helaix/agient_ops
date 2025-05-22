# ---

title: Agent Collaboration Workflow
description: A comprehensive guide for agent collaboration, task delegation, and code management
---

# Agent Collaboration Workflow

## Overview

This document provides a standardized workflow for agent collaboration, designed to facilitate efficient task delegation, clear communication, and effective code management across multi-agent systems. The workflow is derived from analyzing successful collaboration patterns and can be applied to various types of tasks.

## Core Principles

1. **Hierarchical Delegation**: Tasks flow from parent agents to sub-agents in a structured manner
2. **Consistent Reporting**: Regular updates flow from sub-agents to parent agents
3. **Unified Code Management**: All code changes are consolidated into a single branch managed by the top-level agent
4. **Information Synthesis**: Each level of agents synthesizes information from their sub-agents before reporting upward
5. **Clear Responsibility Boundaries**: Each agent has well-defined responsibilities and deliverables

## Workflow Structure

### 1. Task Delegation Pattern


```

Top-Level Agent
├── Level 1 Agent A
│   ├── Level 2 Agent A1
│   └── Level 2 Agent A2
├── Level 1 Agent B
│   ├── Level 2 Agent B1
│   └── Level 2 Agent B2
└── Level 1 Agent C

```

### 2. Branch Management Pattern


```

main
└── top-level-feature-branch (managed by Top-Level Agent)
    ├── level1-feature-branch-A (managed by Level 1 Agent A)
    │   ├── level2-feature-branch-A1 (managed by Level 2 Agent A1)
    │   └── level2-feature-branch-A2 (managed by Level 2 Agent A2)
    ├── level1-feature-branch-B (managed by Level 1 Agent B)
    └── level1-feature-branch-C (managed by Level 1 Agent C)

```

## Detailed Workflow Steps

### Phase 1: Task Planning and Delegation

1. **Top-Level Agent**:

   - Analyzes the overall task and creates a comprehensive plan

   - Identifies distinct components that can be delegated

   - Creates a main feature branch for the entire task

   - Creates sub-issues for each major component

   - Provides clear context, requirements, and deliverables for each sub-issue

   - Assigns sub-issues to Level 1 Agents

2. **Level 1 Agents**:

   - Review assigned tasks and create detailed implementation plans

   - Identify components that can be further delegated

   - Create branches from the main feature branch

   - Create sub-issues for components that require deeper expertise

   - Assign sub-issues to Level 2 Agents with clear instructions

3. **Level 2 Agents**:

   - Review assigned tasks and create implementation plans

   - Create branches from their parent's branch

   - May further delegate specific research or implementation tasks if needed

### Phase 2: Implementation and Reporting

1. **Level 2 Agents**:

   - Implement assigned components

   - Provide regular progress updates to their parent agent

   - Push changes to their designated branches

   - Synthesize research findings or implementation details

   - Submit comprehensive reports to their parent agent when complete

2. **Level 1 Agents**:

   - Implement their directly assigned components

   - Monitor progress of sub-agents

   - Review and integrate work from Level 2 Agents

   - Merge Level 2 branches into their own branch

   - Synthesize all findings and implementations

   - Provide regular updates to the Top-Level Agent

   - Submit comprehensive reports when all components are complete

3. **Top-Level Agent**:

   - Implements directly assigned components

   - Monitors progress of all Level 1 Agents

   - Reviews and integrates work from Level 1 Agents

   - Merges all Level 1 branches into the main feature branch

   - Creates a single PR for the entire implementation

   - Ensures all requirements are met before finalizing

### Phase 3: Integration and Finalization

1. **Top-Level Agent**:

   - Ensures all components work together correctly

   - Resolves any integration issues

   - Updates documentation to reflect all changes

   - Creates a comprehensive PR with all changes

   - Reports back to the requester with a summary of all work completed

## Communication Protocols

### Upward Communication (Child to Parent)

1. **Regular Status Updates**:

   - Provide brief progress updates at regular intervals

   - Highlight any blockers or challenges immediately

   - Use the `send_agent_message` tool for direct communication

2. **Deliverable Submission**:

   - Submit comprehensive reports upon completion

   - Include all research findings, code changes, and recommendations

   - Provide links to relevant resources and code branches

### Downward Communication (Parent to Child)

1. **Task Assignment**:

   - Provide clear context about the overall project

   - Define specific requirements and acceptance criteria

   - Set clear deadlines and reporting expectations

   - Include relevant background information and resources

2. **Feedback and Guidance**:

   - Provide timely feedback on submitted work

   - Clarify requirements when questions arise

   - Offer guidance when sub-agents encounter challenges

## Code Management Guidelines

1. **Branch Naming Convention**:
   ```
   {agent-level}/{feature-description}-{unique-id}
   ```
   Example: `level1/user-authentication-a7f9c3`

2. **Branch Hierarchy**:

   - Top-Level Agent creates the main feature branch

   - Level 1 Agents branch from the main feature branch

   - Level 2 Agents branch from their parent's branch

3. **Code Integration Flow**:

   - Changes flow upward through the hierarchy

   - sub-agents push to their branches

   - Parent agents merge child branches into their own

   - Only the Top-Level Agent creates the final PR

4. **PR Creation Rules**:

   - Only the Top-Level Agent creates PRs to the main branch

   - sub-agents should never create PRs directly to main

   - sub-agents should push to their assigned branches

## Templates for Agent Instructions

### Template for Top-Level Agent to Level 1 Agent


```

# Task Assignment: [Brief Task Title]

## Context

[Provide overall project context and how this task fits in]

## Objective

[Clear statement of what needs to be accomplished]

## Requirements


- [Specific requirement 1]

- [Specific requirement 2]

- [Specific requirement 3]

## Technical Details


- Branch to work from: `[parent-branch-name]`

- Create your branch with format: `level1/[feature-description]-[unique-id]`

- Key files/directories to focus on: [list relevant paths]

## Deliverables

1. [Specific deliverable 1]
2. [Specific deliverable 2]
3. [Specific deliverable 3]

## Reporting


- Provide status updates every [timeframe]

- Report any blockers immediately

- Submit a comprehensive report upon completion

## Additional Notes


- [Any other relevant information]

- [Potential challenges to be aware of]

- [Resources that might be helpful]

Please push your changes to your branch and report back with your findings and completed work.

```

### Template for Level 1 Agent to Level 2 Agent


```

# Sub-Task Assignment: [Brief Sub-Task Title]

## Context

[Provide task context and how this sub-task fits in]

## Objective

[Clear statement of what needs to be accomplished]

## Requirements


- [Specific requirement 1]

- [Specific requirement 2]

- [Specific requirement 3]

## Technical Details


- Branch to work from: `[parent-branch-name]`

- Create your branch with format: `level2/[feature-description]-[unique-id]`

- Key files/directories to focus on: [list relevant paths]

## Deliverables

1. [Specific deliverable 1]
2. [Specific deliverable 2]
3. [Specific deliverable 3]

## Reporting


- Provide status updates every [timeframe]

- Report any blockers immediately

- Submit a comprehensive report upon completion

## Additional Notes


- [Any other relevant information]

- [Potential challenges to be aware of]

- [Resources that might be helpful]

Please push your changes to your branch and report back with your findings and completed work.

```

## Example Scenarios

### Scenario 1: Feature Development with Research Component

**Top-Level Task**: Implement a new authentication system with OAuth integration

**Delegation Structure**:

- **Top-Level Agent**: Overall architecture and integration

  - **Level 1 Agent A**: Frontend authentication components

    - **Level 2 Agent A1**: Login UI implementation

    - **Level 2 Agent A2**: Registration UI implementation

  - **Level 1 Agent B**: Backend authentication services

    - **Level 2 Agent B1**: OAuth provider integration

    - **Level 2 Agent B2**: User session management

  - **Level 1 Agent C**: Security research and implementation

    - **Level 2 Agent C1**: Token security research

    - **Level 2 Agent C2**: Implementation of security measures

**Code Management**:
1. Top-Level Agent creates branch: `feature/auth-system-main`
2. Level 1 Agents create branches:

   - `level1/auth-frontend-components`

   - `level1/auth-backend-services`

   - `level1/auth-security-measures`

3. Level 2 Agents create branches from their parent branches
4. Changes flow upward through merges
5. Top-Level Agent creates a single PR with all changes

### Scenario 2: Documentation and Research Project

**Top-Level Task**: Create comprehensive documentation for a new API

**Delegation Structure**:

- **Top-Level Agent**: Overall documentation structure and integration

  - **Level 1 Agent A**: Endpoint documentation

    - **Level 2 Agent A1**: Authentication endpoints

    - **Level 2 Agent A2**: Resource endpoints

  - **Level 1 Agent B**: Usage examples

    - **Level 2 Agent B1**: Basic usage examples

    - **Level 2 Agent B2**: Advanced usage examples

  - **Level 1 Agent C**: Best practices and optimization

    - **Level 2 Agent C1**: Research on best practices

    - **Level 2 Agent C2**: Performance optimization guidelines

**Code Management**:
1. Top-Level Agent creates branch: `docs/api-documentation-main`
2. Level 1 Agents create branches from the main branch
3. Level 2 Agents create branches from their parent branches
4. Changes flow upward through merges
5. Top-Level Agent creates a single PR with all documentation changes

## Handling Edge Cases

### 1. Blocked sub-agent

**Scenario**: A Level 2 Agent is blocked and cannot proceed with their task.

**Resolution Process**:
1. sub-agent immediately reports the blocker to their parent agent
2. Parent Agent evaluates the blocker:

   - If it can be resolved with guidance, provide necessary information

   - If it requires a change in approach, provide new instructions

   - If it requires reassignment, create a new sub-issue

3. Parent Agent updates their own parent about the situation if it impacts timelines
4. Once resolved, sub-agent continues with implementation

### 2. Integration Conflicts

**Scenario**: Changes from different branches conflict during integration.

**Resolution Process**:
1. Parent Agent identifies conflicts during merge
2. Parent Agent determines the best resolution approach:

   - Resolve simple conflicts directly

   - For complex conflicts, consult with relevant sub-agents

   - For architectural conflicts, escalate to higher-level agent

3. Parent Agent implements the resolution
4. Parent Agent documents the conflict and resolution for future reference

### 3. Scope Changes

**Scenario**: Requirements change during implementation.

**Resolution Process**:
1. Top-Level Agent receives updated requirements
2. Top-Level Agent assesses impact on all components
3. Top-Level Agent communicates changes to affected Level 1 Agents
4. Level 1 Agents update their plans and communicate changes to Level 2 Agents
5. All agents adjust their implementations accordingly
6. Regular reporting continues with acknowledgment of scope changes

## Best Practices

1. **Clear Communication**:

   - Be explicit about requirements and expectations

   - Provide context for why tasks are important

   - Use structured formats for reporting

2. **Effective Delegation**:

   - Delegate based on task complexity and specialization needs

   - Provide sufficient context for delegated tasks

   - Set clear boundaries and interfaces between components

3. **Code Management**:

   - Follow consistent branch naming conventions

   - Regularly push changes to remote branches

   - Document code thoroughly for other agents

4. **Progress Tracking**:

   - Provide regular status updates

   - Flag potential issues early

   - Document key decisions and their rationale

5. **Knowledge Synthesis**:

   - Summarize findings before reporting upward

   - Highlight key insights and recommendations

   - Ensure information is not lost across agent levels

## Conclusion

This workflow provides a structured approach to multi-agent collaboration, ensuring efficient task delegation, clear communication, and effective code management. By following these guidelines, agents can work together seamlessly to complete complex tasks while maintaining high quality standards.

The workflow is designed to be adaptable to various types of projects and can be scaled up or down depending on the complexity of the task at hand. The key is maintaining the hierarchical structure for task delegation and code management, while ensuring consistent communication throughout the process.



## Related Resources

- [---](agent_collaboration_implementation_guide.md)
- [---](agent_collaboration_quick_reference.md)
- [Communication and Delegation SOPs for Codegen and Sub-Agents](../../../../reference/communication_delegation_sops.md)
