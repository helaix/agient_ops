# Error Categorization Guide

## Overview

This guide provides a comprehensive framework for identifying and categorizing errors encountered by agents during their operations. Proper categorization of errors is essential for effective tracking, analysis, and resolution.

## Error Taxonomy

Errors are categorized along multiple dimensions to facilitate analysis and resolution:

### 1. Error Type

| Type | Description | Examples |
|------|-------------|----------|
| **Technical** | Errors related to technical systems, tools, or infrastructure | API failures, system crashes, network issues |
| **Knowledge** | Errors due to lack of knowledge or misunderstanding | Incorrect use of tools, misunderstanding requirements |
| **Process** | Errors in following established processes or workflows | Skipping steps, following outdated procedures |
| **Communication** | Errors in communication between agents or with users | Misunderstandings, unclear instructions, missing context |
| **Decision** | Errors in decision-making or judgment | Incorrect prioritization, poor strategic choices |
| **Resource** | Errors due to insufficient resources | Time constraints, limited access to tools or information |

### 2. Severity Level

| Level | Description | Impact | Response Time |
|-------|-------------|--------|---------------|
| **Critical** | Prevents core functionality; affects multiple agents or users | Major system failure, data loss, security breach | Immediate (minutes to hours) |
| **High** | Significantly impairs functionality; affects a single agent or user | Task failure, significant delays, incorrect outputs | Urgent (within 24 hours) |
| **Medium** | Partially impairs functionality; workarounds exist | Minor delays, reduced efficiency, partial task completion | Standard (within 2-3 days) |
| **Low** | Minor issues with minimal impact on functionality | Cosmetic issues, minor inconveniences, edge cases | Low priority (within 1-2 weeks) |

### 3. Frequency

| Frequency | Description |
|-----------|-------------|
| **Isolated** | Occurred once, not expected to recur |
| **Intermittent** | Occurs occasionally under specific conditions |
| **Recurring** | Occurs regularly in similar situations |
| **Persistent** | Occurs consistently whenever certain actions are performed |

### 4. Root Cause Category

| Category | Description | Examples |
|----------|-------------|----------|
| **System Design** | Flaws in the design of systems or tools | Poor API design, inadequate error handling |
| **Implementation** | Errors in the implementation of systems or processes | Bugs, logic errors, edge cases not handled |
| **Configuration** | Errors in system or tool configuration | Incorrect settings, incompatible configurations |
| **Training** | Insufficient or incorrect training | Lack of knowledge, misunderstanding of procedures |
| **Documentation** | Issues with documentation | Incomplete, outdated, or unclear documentation |
| **External Dependency** | Issues with external systems or services | Third-party API failures, dependency changes |
| **Environmental** | Issues related to the operating environment | Resource constraints, infrastructure limitations |

## Identification Process

Follow these steps to identify and categorize errors:

1. **Observe the Error**
   - Document the exact behavior or output that indicates an error
   - Note the context in which the error occurred
   - Capture any error messages or logs

2. **Determine the Impact**
   - Assess the effect on task completion
   - Identify affected agents, users, or systems
   - Evaluate the scope of the impact (isolated vs. widespread)

3. **Categorize the Error**
   - Assign the appropriate error type
   - Determine the severity level
   - Assess the frequency
   - Identify the root cause category

4. **Document the Error**
   - Use the [Error Report Template](../templates/error_report_template.md) to document the error
   - Include all relevant details and categorizations
   - Link to related errors or issues if applicable

## Common Error Patterns

### Technical Errors

- **API Integration Issues**
  - Rate limiting errors
  - Authentication failures
  - Endpoint changes or deprecations
  - Response format changes

- **System Resource Limitations**
  - Memory constraints
  - Processing time limits
  - Token or quota exhaustion
  - Storage limitations

### Knowledge Errors

- **Tool Usage Errors**
  - Incorrect parameter usage
  - Misunderstanding of tool capabilities
  - Inappropriate tool selection for task

- **Domain Knowledge Gaps**
  - Misunderstanding of domain-specific concepts
  - Incorrect assumptions about business rules
  - Lack of awareness of best practices

### Process Errors

- **Workflow Deviations**
  - Skipping validation steps
  - Bypassing review processes
  - Incorrect sequencing of actions

- **Handoff Issues**
  - Incomplete task transfers
  - Missing context in handoffs
  - Unclear responsibility assignments

### Communication Errors

- **Instruction Misinterpretation**
  - Ambiguous requirements
  - Implicit assumptions
  - Cultural or linguistic misunderstandings

- **Feedback Gaps**
  - Delayed or missing feedback
  - Unclear feedback
  - Contradictory feedback from multiple sources

## Using This Guide

This guide should be used in conjunction with the [Error Report Template](../templates/error_report_template.md) and the [Error Analysis Template](../templates/error_analysis_template.md) to ensure consistent categorization and documentation of errors.

When categorizing errors:

1. Be as specific as possible while fitting within the taxonomy
2. Use multiple categories when appropriate
3. Document any uncertainty in categorization
4. Update categorizations as more information becomes available

Regular review of error categorizations should be conducted to ensure consistency and to identify any needed updates to the taxonomy itself.

## Extending the Taxonomy

As new types of errors are encountered, the taxonomy may need to be extended. To propose additions to the taxonomy:

1. Document the new error type, severity level, frequency, or root cause category
2. Provide examples and justification for the addition
3. Submit the proposal for review
4. Upon approval, update this guide and related templates

## Related Resources

- [Error Resolution Workflow](./error_resolution_workflow.md)
- [Error Prevention Guidelines](./error_prevention_guidelines.md)
- [Error Impact Assessment](./error_impact_assessment.md)
- [Error Report Template](../templates/error_report_template.md)
- [Error Analysis Template](../templates/error_analysis_template.md)

