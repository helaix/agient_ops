# Error Impact Assessment Framework

## Overview

This framework provides a structured approach for assessing the impact of errors encountered in agent operations. Understanding the full impact of errors is essential for prioritizing resolution efforts, allocating resources effectively, and implementing appropriate preventive measures.

## Impact Dimensions

The impact of an error should be assessed across multiple dimensions:

### 1. Operational Impact

**Definition**: The effect on the agent's ability to complete tasks and deliver expected outputs.

**Assessment Levels**:

| Level | Description | Indicators |
|-------|-------------|------------|
| **Critical** | Prevents core functionality | - Agent cannot complete primary tasks<br>- System is unusable<br>- No viable workarounds exist |
| **High** | Significantly impairs functionality | - Major features unavailable<br>- Substantial workarounds required<br>- Significant reduction in efficiency |
| **Medium** | Partially impairs functionality | - Some features affected<br>- Workarounds available<br>- Moderate reduction in efficiency |
| **Low** | Minor impact on functionality | - Edge case functionality affected<br>- Simple workarounds available<br>- Minimal reduction in efficiency |
| **Negligible** | No meaningful impact on functionality | - Cosmetic issues only<br>- No effect on task completion<br>- No reduction in efficiency |

### 2. User Impact

**Definition**: The effect on users who interact with the agent or depend on its outputs.

**Assessment Levels**:

| Level | Description | Indicators |
|-------|-------------|------------|
| **Critical** | Prevents users from achieving core objectives | - Users cannot complete essential tasks<br>- Critical user needs unmet<br>- No alternatives available to users |
| **High** | Significantly degrades user experience | - Major user frustration<br>- Important user needs partially unmet<br>- Limited alternatives available |
| **Medium** | Noticeable degradation of user experience | - Some user inconvenience<br>- Non-critical user needs unmet<br>- Reasonable alternatives available |
| **Low** | Minor user inconvenience | - Slight user annoyance<br>- Minimal effect on user goals<br>- Easy alternatives available |
| **Negligible** | No perceptible impact on users | - Users unlikely to notice<br>- No effect on user goals<br>- No alternatives needed |

### 3. Scope of Impact

**Definition**: The breadth of systems, agents, or users affected by the error.

**Assessment Levels**:

| Level | Description | Indicators |
|-------|-------------|------------|
| **Global** | Affects all agents and users | - System-wide impact<br>- All user types affected<br>- All operational areas impacted |
| **Widespread** | Affects multiple agent types or user groups | - Multiple subsystems affected<br>- Several user types impacted<br>- Multiple operational areas affected |
| **Moderate** | Affects a specific agent type or user group | - Single subsystem affected<br>- Specific user type impacted<br>- Specific operational area affected |
| **Limited** | Affects a small subset of agents or users | - Isolated component affected<br>- Small user segment impacted<br>- Narrow operational area affected |
| **Isolated** | Affects a single agent or user | - Individual instance affected<br>- Single user impacted<br>- Specific task affected |

### 4. Duration of Impact

**Definition**: The length of time the error affects operations or users.

**Assessment Levels**:

| Level | Description | Timeframe |
|-------|-------------|-----------|
| **Permanent** | Impact persists until explicitly fixed | Indefinite |
| **Extended** | Impact lasts for an extended period | Weeks to months |
| **Moderate** | Impact lasts for a moderate period | Days to weeks |
| **Brief** | Impact lasts for a short period | Hours to days |
| **Transient** | Impact is temporary and self-resolving | Minutes to hours |

### 5. Data Impact

**Definition**: The effect on data integrity, availability, or confidentiality.

**Assessment Levels**:

| Level | Description | Indicators |
|-------|-------------|------------|
| **Critical** | Severe data corruption or exposure | - Irreversible data loss<br>- Exposure of sensitive information<br>- Widespread data integrity issues |
| **High** | Significant data issues | - Recoverable data loss<br>- Potential exposure of sensitive information<br>- Significant data integrity issues |
| **Medium** | Moderate data issues | - Temporary data unavailability<br>- Limited exposure of non-sensitive information<br>- Isolated data integrity issues |
| **Low** | Minor data issues | - Delayed data access<br>- No information exposure<br>- Minor data formatting issues |
| **Negligible** | No meaningful data impact | - No data loss or corruption<br>- No information exposure<br>- No data integrity issues |

### 6. Reputational Impact

**Definition**: The effect on trust, credibility, and perception of the agent system.

**Assessment Levels**:

| Level | Description | Indicators |
|-------|-------------|------------|
| **Critical** | Severe damage to reputation | - Loss of trust from key stakeholders<br>- Public visibility of failure<br>- Long-term credibility damage |
| **High** | Significant reputation damage | - Reduced trust from multiple stakeholders<br>- Internal visibility across organization<br>- Medium-term credibility impact |
| **Medium** | Moderate reputation impact | - Concern from some stakeholders<br>- Visibility within department or team<br>- Short-term credibility impact |
| **Low** | Minor reputation impact | - Limited stakeholder concern<br>- Visibility limited to immediate team<br>- Minimal credibility impact |
| **Negligible** | No meaningful reputation impact | - No stakeholder concern<br>- No visibility beyond individual<br>- No credibility impact |

## Composite Impact Score

To calculate a composite impact score, assign numerical values to each impact level:

| Level | Value |
|-------|-------|
| Critical / Global / Permanent | 5 |
| High / Widespread / Extended | 4 |
| Medium / Moderate / Moderate | 3 |
| Low / Limited / Brief | 2 |
| Negligible / Isolated / Transient | 1 |

Calculate the composite score using this formula:

```
Composite Impact = (2 × Operational Impact) + (2 × User Impact) + Scope + Duration + Data Impact + Reputational Impact
```

Interpret the composite score:

| Score Range | Overall Impact | Priority |
|-------------|----------------|----------|
| 30-40 | Severe | P0 - Immediate action required |
| 20-29 | Major | P1 - Urgent action required |
| 10-19 | Moderate | P2 - Standard priority |
| 0-9 | Minor | P3 - Low priority |

## Assessment Process

Follow these steps to conduct an error impact assessment:

### 1. Initial Assessment

- Document the error using the [Error Report Template](../templates/error_report_template.md)
- Conduct a preliminary impact assessment based on available information
- Assign an initial priority based on the preliminary assessment

### 2. Comprehensive Assessment

- Gather additional information about the error and its effects
- Assess impact across all dimensions
- Calculate the composite impact score
- Adjust priority if necessary based on the comprehensive assessment

### 3. Ongoing Monitoring

- Regularly reassess impact as new information becomes available
- Update the impact assessment if the error's effects change
- Adjust priority based on updated assessments

### 4. Post-Resolution Review

- Conduct a final impact assessment after resolution
- Document actual impact for future reference
- Compare actual impact with initial assessment to improve future assessments

## Documentation Requirements

When documenting impact assessments, include:

1. **Assessment Date**: When the assessment was conducted
2. **Assessor**: Who conducted the assessment
3. **Error Reference**: Link to the error report
4. **Impact Ratings**: Ratings for each impact dimension
5. **Composite Score**: Calculated overall impact score
6. **Priority Assignment**: Assigned priority based on impact
7. **Justification**: Rationale for each impact rating
8. **Evidence**: Supporting data or observations
9. **Confidence Level**: Degree of certainty in the assessment
10. **Revision History**: Record of assessment updates

## Special Considerations

### Cascading Impacts

Some errors may have cascading effects that amplify their impact over time. When assessing such errors:

1. Document the initial direct impact
2. Identify potential cascading effects
3. Estimate the timeline for cascading impacts
4. Assess the worst-case scenario if not addressed
5. Adjust priority based on potential future impact

### Intermittent Errors

For errors that occur intermittently:

1. Assess impact based on worst observed occurrence
2. Document frequency and pattern of occurrences
3. Consider cumulative impact over time
4. Evaluate predictability and preventability
5. Adjust priority based on frequency and severity

### Multiple Stakeholder Perspectives

Different stakeholders may perceive impact differently. To address this:

1. Identify key stakeholder groups
2. Assess impact from each stakeholder perspective
3. Document differing impact perceptions
4. Consider weighted impact based on stakeholder priority
5. Use the highest impact rating when stakeholder perspectives differ

## Related Resources

- [Error Categorization Guide](./error_categorization_guide.md)
- [Error Resolution Workflow](./error_resolution_workflow.md)
- [Error Prevention Guidelines](./error_prevention_guidelines.md)
- [Error Report Template](../templates/error_report_template.md)
- [Error Analysis Template](../templates/error_analysis_template.md)

