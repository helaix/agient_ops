# Communication and Delegation SOPs for Codegen and Sub-Agents

## Table of Contents

1. [Introduction](#introduction)
2. [Identified Communication/Delegation Patterns](#identified-communicationdelegation-patterns)
3. [Root Causes of Communication/Delegation Failures](#root-causes-of-communicationdelegation-failures)
4. [Recommended Solutions and SOPs](#recommended-solutions-and-sops)
5. [Specific Guidelines for Codegen Delegating to Sub-Agents](#specific-guidelines-for-codegen-delegating-to-sub-agents)
6. [Examples of Successful and Unsuccessful Communication/Delegation](#examples-of-successful-and-unsuccessful-communicationdelegation)
7. [Summary of Key Findings and Recommendations](#summary-of-key-findings-and-recommendations)

## Introduction

This document analyzes communication and delegation patterns between Codegen and sub-agents, identifying common issues, root causes, and recommended solutions. The analysis is based on a review of comment logs from Linear issues, focusing particularly on instances where communication or delegation failed or succeeded.

The goal is to establish clear Standard Operating Procedures (SOPs) that optimize the collaboration between parent agents and sub-agents, ensuring efficient task completion, clear communication, and effective knowledge transfer.

## Identified Communication/Delegation Patterns

### Common Delegation Patterns

1. **Hierarchical Delegation Structure**
   - Parent agents create sub-issues and assign them to sub-agents
   - Sub-agents may further delegate by creating sub-sub-issues
   - Clear parent-child relationships are established through Linear's issue hierarchy

2. **Task Decomposition Approaches**
   - **Capability-based**: Tasks are divided based on specialized capabilities required
   - **Component-based**: Tasks are divided by system components or modules
   - **Sequential**: Tasks are divided into sequential steps in a process
   - **Parallel**: Independent tasks that can be worked on simultaneously

3. **Communication Patterns**
   - Initial acknowledgment messages when tasks are assigned
   - Progress updates during task execution
   - Final reports upon task completion
   - Requests for clarification or additional information
   - Notifications to parent agents when sub-tasks are completed

### Common Communication/Delegation Issues

1. **Unclear Task Boundaries**
   - Ambiguous scope definition leading to confusion about responsibilities
   - Overlapping tasks between multiple sub-agents
   - Insufficient context provided in sub-issue descriptions

2. **Reporting Inconsistencies**
   - Inconsistent formats for progress updates and final reports
   - Varying levels of detail in communication
   - Irregular timing of updates

3. **Coordination Challenges**
   - Difficulties in synthesizing outputs from multiple sub-agents
   - Challenges in maintaining consistent approaches across sub-agents
   - Lack of visibility into sub-agent progress

4. **Handoff Problems**
   - Incomplete information transfer when delegating tasks
   - Insufficient context when reporting back to parent agents
   - Unclear expectations for deliverables

5. **Branch and Code Management Issues**
   - Confusion about which branches to work on
   - Inconsistent approaches to code integration
   - Challenges in merging work from multiple sub-agents

## Root Causes of Communication/Delegation Failures

1. **Structural Issues**
   - **Incomplete Task Definition**: Sub-issues lacking clear objectives, acceptance criteria, or deliverable specifications
   - **Missing Context**: Insufficient background information provided to sub-agents
   - **Unclear Hierarchies**: Ambiguous reporting structures or responsibility chains
   - **Inadequate Templates**: Lack of standardized formats for task delegation and reporting

2. **Process Issues**
   - **Inconsistent Check-in Protocols**: No clear guidelines on when and how to provide updates
   - **Undefined Escalation Paths**: Unclear processes for handling blockers or issues
   - **Inadequate Synthesis Mechanisms**: Lack of structured approaches for integrating sub-agent outputs
   - **Missing Feedback Loops**: Insufficient mechanisms for improving delegation processes

3. **Technical Issues**
   - **Branch Management Confusion**: Unclear guidelines for creating, using, and merging branches
   - **Inconsistent Code Integration**: Varying approaches to integrating code changes
   - **Tool Usage Variations**: Inconsistent use of available tools and APIs
   - **Environment Discrepancies**: Differences in development environments between agents

4. **Communication Issues**
   - **Terminology Mismatches**: Different agents using different terms for the same concepts
   - **Varying Detail Levels**: Inconsistent depth of information in communications
   - **Format Inconsistencies**: Different structures for similar types of messages
   - **Timing Variations**: Irregular or unpredictable communication patterns

## Recommended Solutions and SOPs

### 1. Standardized Task Delegation Framework

#### SOP: Task Delegation Process

1. **Pre-Delegation Planning**
   - Clearly define the overall task objective and success criteria
   - Identify logical sub-components that can be delegated
   - Determine dependencies between sub-components
   - Create a high-level timeline with key milestones

2. **Sub-Issue Creation**
   - Use standardized templates for all sub-issues
   - Include clear objectives, acceptance criteria, and deliverables
   - Specify technical details including branch naming conventions
   - Define reporting expectations (frequency, format, content)
   - Establish clear boundaries between sub-issues

3. **Context Provision**
   - Include relevant background information
   - Link to related documentation and resources
   - Explain how the sub-issue fits into the larger task
   - Provide access to necessary code, tools, and environments

4. **Assignment and Kickoff**
   - Assign sub-issues to appropriate sub-agents
   - Conduct a brief kickoff message explaining key points
   - Confirm sub-agent understanding of the task
   - Address any initial questions or concerns

### 2. Standardized Communication Protocols

#### SOP: Communication Standards

1. **Regular Check-ins**
   - Establish a consistent schedule for progress updates
   - Use standardized format for update messages
   - Include progress on key milestones, blockers, and next steps
   - Tag relevant agents in all communications

2. **Blocker Reporting**
   - Immediately report any blockers that impede progress
   - Clearly describe the nature of the blocker
   - Suggest potential solutions or alternatives
   - Request specific assistance if needed

3. **Completion Reporting**
   - Use standardized format for completion reports
   - Include summary of work completed
   - Highlight any deviations from original requirements
   - Provide links to relevant PRs, branches, or artifacts
   - Summarize key decisions made and their rationale

4. **Cross-Agent Communication**
   - Use consistent terminology across all agents
   - Tag specific agents when addressing them directly
   - Maintain a shared glossary for key terms and concepts
   - Document important decisions in accessible locations

### 3. Code and Branch Management Framework

#### SOP: Code Management Process

1. **Branch Strategy**
   - Parent agent creates the main task branch
   - Sub-agents create branches from the parent branch using consistent naming
   - Follow the pattern: `codegen-bot/{parent-issue-id}-{sub-issue-description}`
   - Document branch relationships in issue descriptions

2. **Code Integration**
   - Sub-agents push changes to their respective branches
   - Parent agent reviews and merges sub-agent branches
   - Use consistent commit message formats
   - Include issue references in all commits

3. **PR Management**
   - Sub-agents do not create PRs unless specifically instructed
   - Parent agent creates the final PR that includes all sub-agent work
   - Use standardized PR templates
   - Link all related issues in PR descriptions

4. **Artifact Management**
   - Store shared artifacts in consistent locations
   - Use standardized naming conventions for artifacts
   - Document artifact locations and purposes
   - Ensure all agents have access to necessary artifacts

### 4. Knowledge Synthesis Framework

#### SOP: Knowledge Integration Process

1. **Information Collection**
   - Gather outputs from all sub-agents using standardized formats
   - Organize information by categories or themes
   - Identify gaps, overlaps, or inconsistencies
   - Request clarification on ambiguous points

2. **Analysis and Integration**
   - Identify key insights across sub-agent outputs
   - Resolve conflicting information or approaches
   - Create unified documentation that synthesizes all inputs
   - Ensure consistent terminology and formatting

3. **Validation and Refinement**
   - Review integrated knowledge with sub-agents
   - Address any misinterpretations or omissions
   - Refine the synthesis based on feedback
   - Create final documentation that accurately represents all contributions

4. **Knowledge Sharing**
   - Distribute synthesized knowledge to all relevant agents
   - Store documentation in accessible locations
   - Tag key information for easy retrieval
   - Update related resources to reflect new knowledge

## Specific Guidelines for Codegen Delegating to Sub-Agents

### 1. Task Preparation Guidelines

- **Conduct thorough analysis** before delegating tasks
- **Create scaffolding** (e.g., directory structures, base files) before delegation
- **Establish clear boundaries** between sub-agent responsibilities
- **Define integration points** where sub-agent work will be combined
- **Create a coordination plan** for managing dependencies between sub-agents

### 2. Sub-Agent Instruction Guidelines

- **Use standardized templates** for all sub-agent instructions
- **Include explicit reporting requirements** (what, when, how)
- **Specify branch naming and code management expectations**
- **Define escalation procedures** for handling blockers
- **Provide context about the parent task** and how the sub-task fits in
- **Include links to relevant documentation** and resources
- **Specify any constraints or limitations** that apply to the sub-task

### 3. Progress Monitoring Guidelines

- **Establish regular check-in points** for all sub-agents
- **Use standardized formats** for progress updates
- **Track completion of key milestones** across all sub-agents
- **Identify and address blockers** promptly
- **Adjust timelines and dependencies** as needed
- **Maintain a central dashboard** of sub-agent progress

### 4. Work Integration Guidelines

- **Review all sub-agent outputs** for quality and completeness
- **Ensure consistency** across sub-agent contributions
- **Merge code changes** in a logical sequence based on dependencies
- **Document integration decisions** and their rationale
- **Validate the integrated solution** against original requirements
- **Provide feedback to sub-agents** on their contributions

### 5. Communication Guidelines

- **Use clear, consistent terminology** across all communications
- **Maintain a record of key decisions** accessible to all agents
- **Ensure all agents have access** to necessary context and information
- **Establish clear channels** for different types of communication
- **Set expectations for response times** to questions or requests
- **Use structured formats** for different types of messages

## Examples of Successful and Unsuccessful Communication/Delegation

### Successful Communication/Delegation Examples

#### Example 1: Hierarchical Research Task with Clear Reporting Structure

In issue GRL-103 (Research Remotion Media Parser Capabilities), the parent agent:
- Created clear sub-issues for each capability to be researched
- Provided detailed research guidelines for each sub-agent
- Established a consistent reporting structure
- Specified a single branch for all findings
- Defined a clear synthesis process for the final report

This resulted in well-coordinated research efforts with consistent outputs that could be effectively synthesized.

#### Example 2: Effective Task Completion Reporting

In issue HNTSMN-308 (Analyze Point #3: Breaking Through Current Context to Level Up), the sub-agent:
- Provided a comprehensive analysis following the specified framework
- Used clear section headings matching the requested structure
- Included detailed, actionable recommendations
- Notified the parent agent upon completion with explicit next steps
- Maintained consistent terminology throughout the analysis

This enabled the parent agent to easily integrate the analysis into the larger project and proceed with the next steps.

#### Example 3: Clear Branch Management in Multi-Agent Project

In issue HLX-1465 (Epic Management Workflow), the parent agent:
- Created a main epic branch for the overall task
- Had sub-agents create branches from the main branch with consistent naming
- Documented the branch strategy in the issue description
- Established a clear process for merging sub-agent work
- Provided specific commands for branch management

This resulted in a clean, organized repository structure that made integration straightforward.

### Unsuccessful Communication/Delegation Examples

#### Example 1: Ambiguous Task Boundaries

In some multi-part research tasks, sub-issues lacked clear boundaries between areas of responsibility, leading to:
- Duplicate research efforts across sub-agents
- Gaps in coverage where each agent thought the other was responsible
- Inconsistent depth of analysis across related topics
- Challenges in synthesizing the fragmented outputs

#### Example 2: Inconsistent Reporting Formats

In some complex projects, the lack of standardized reporting formats resulted in:
- Varying levels of detail in sub-agent reports
- Different structures making comparison difficult
- Inconsistent terminology causing confusion
- Extra work required to normalize formats before synthesis

#### Example 3: Inadequate Context Provision

In some technical implementation tasks, insufficient context led to:
- Sub-agents making incorrect assumptions about requirements
- Implementation approaches that didn't align with the overall architecture
- Rework needed to align divergent implementations
- Delays due to back-and-forth clarification requests

## Summary of Key Findings and Recommendations

### Key Findings

1. **Structured Delegation is Critical**
   - Clear, detailed sub-issues with explicit boundaries and expectations lead to better outcomes
   - Standardized templates improve consistency and completeness of information

2. **Communication Consistency Matters**
   - Regular, structured updates facilitate coordination and early issue detection
   - Consistent formats make information easier to process and integrate

3. **Code Management Requires Clear Protocols**
   - Well-defined branch strategies prevent confusion and merge conflicts
   - Centralized PR creation by parent agents ensures proper integration

4. **Context is Essential**
   - Providing comprehensive background information reduces misunderstandings
   - Explaining how sub-tasks fit into the larger picture improves alignment

5. **Synthesis Needs Structure**
   - Planned approaches for integrating sub-agent outputs improve final results
   - Standardized formats facilitate easier comparison and combination of work

### Key Recommendations

1. **Implement Standardized Templates**
   - Create and use templates for sub-issue creation
   - Develop standard formats for progress updates and completion reports
   - Establish consistent PR and commit message formats

2. **Establish Clear Communication Protocols**
   - Define regular check-in schedules and formats
   - Create standardized escalation procedures for blockers
   - Implement consistent terminology across all agents

3. **Develop Robust Code Management Practices**
   - Document branch naming conventions and relationships
   - Centralize PR creation with the parent agent
   - Establish clear merge procedures

4. **Enhance Context Provision**
   - Include comprehensive background information in all sub-issues
   - Explain relationships between sub-tasks and the overall objective
   - Provide links to relevant documentation and resources

5. **Create Structured Synthesis Processes**
   - Define how sub-agent outputs will be integrated
   - Establish review procedures for ensuring consistency
   - Document integration decisions and rationales

By implementing these recommendations, Codegen can significantly improve the efficiency and effectiveness of delegation to sub-agents, resulting in higher quality outputs, faster completion times, and reduced coordination overhead.

