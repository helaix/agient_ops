# Task Delegation & Communication

## Breaking Down Complex Tasks

### When to Delegate
- Task requires multiple skill sets
- Work can be parallelized effectively
- Timeline benefits from concurrent work
- Learning opportunities for team members

### Sub-Issue Creation Strategy
1. **Analyze Dependencies**: Identify which tasks can run in parallel
2. **Define Clear Boundaries**: Each sub-issue should be self-contained
3. **Establish Interfaces**: Define how sub-tasks will integrate
4. **Set Communication Protocols**: Regular check-ins and updates

### Sub-Issue Structure
```markdown
# Sub-Issue Title: [Specific Component/Feature]

## Parent Issue
https://linear.app/helaix/issue/HLX-1234

## Objective
Clear, specific goal for this sub-task

## Context
Background information and how this fits into the larger task

## Deliverables
- Specific output 1
- Specific output 2
- Integration requirements

## Dependencies
- Depends on: https://linear.app/helaix/issue/HLX-1235
- Blocks: https://linear.app/helaix/issue/HLX-1237

## Success Criteria
How completion will be measured
```

## Child Agent Delegation

### Delegation Best Practices
1. **Clear Instructions**: Provide detailed, unambiguous requirements
2. **Context Sharing**: Explain the bigger picture and goals
3. **Resource Provision**: Ensure agents have necessary access and tools
4. **Communication Channels**: Establish how and when to communicate

### Effective Delegation Template
```markdown
@agent-name I'm delegating this sub-task to you:

**Task**: [Specific action required]
**Context**: [Why this is needed and how it fits]
**Resources**: [Links to relevant docs, code, etc.]
**Timeline**: [Expected completion timeframe]
**Questions**: [Encourage questions and clarification]

Please confirm receipt and estimated timeline.
```

### Monitoring Delegated Work
- **Regular Check-ins**: Schedule periodic status updates
- **Blocker Resolution**: Be available to unblock agents quickly
- **Quality Gates**: Review work at key milestones
- **Integration Planning**: Coordinate how pieces will come together

## Communication Best Practices

### Status Updates
**Daily Updates for Active Issues**:
```markdown
**Progress**: [What was accomplished today]
**Next Steps**: [What's planned for tomorrow]
**Blockers**: [Any issues preventing progress]
**Questions**: [Any clarification needed]
```

### Escalation Protocols
1. **Level 1**: Direct communication with assignee
2. **Level 2**: Comment on Linear issue with @mentions
3. **Level 3**: Create new issue for blocker resolution
4. **Level 4**: Escalate to project lead or manager

### Cross-Team Communication
- **Use Linear Comments**: Keep communication visible and searchable
- **Tag Relevant People**: Use @mentions for important updates
- **Link Related Issues**: Connect dependent or related work
- **Document Decisions**: Record important choices and rationale

## Handling Interrupts

### Types of Interrupts
1. **Scope Changes**: New requirements or modified goals
2. **Priority Shifts**: Urgent work that takes precedence
3. **Blocker Resolution**: Information that unblocks current work
4. **Clarification Requests**: Questions about requirements

### Interrupt Response Protocol
1. **Acknowledge Quickly**: Respond within 1-2 hours
2. **Assess Impact**: Determine effect on current timeline
3. **Communicate Changes**: Update all affected parties
4. **Adjust Plans**: Revise approach and timeline as needed

### Managing Multiple Interrupts
- **Prioritize by Impact**: Address highest-impact items first
- **Batch Similar Requests**: Group related questions or changes
- **Set Boundaries**: Communicate capacity limitations
- **Document Patterns**: Track frequent interrupts for process improvement

## Collaboration Patterns

### Pair Programming
- Schedule regular pairing sessions
- Rotate pairs to share knowledge
- Use screen sharing and collaborative tools
- Document decisions made during sessions

### Code Reviews
- Review all delegated work before integration
- Provide constructive, specific feedback
- Explain reasoning behind suggestions
- Recognize good work and improvements

### Knowledge Sharing
- Document lessons learned from delegated tasks
- Share successful patterns with the team
- Create reusable templates and examples
- Conduct retrospectives on complex delegations

## Success Metrics

### Delegation Effectiveness
- **Completion Rate**: Percentage of delegated tasks completed successfully
- **Timeline Accuracy**: How well estimated timelines match actual completion
- **Quality Metrics**: Defect rates and rework requirements
- **Communication Quality**: Frequency and clarity of updates

### Team Development
- **Skill Growth**: Evidence of learning and capability expansion
- **Autonomy Increase**: Reduced need for guidance over time
- **Collaboration Improvement**: Better cross-team working relationships
- **Process Refinement**: Continuous improvement in delegation practices

