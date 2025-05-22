# Examples of Common Agent Errors

This document provides specific examples of common errors encountered by agents, organized according to the error taxonomy. These examples illustrate how each error type manifests in real-world scenarios and provide context for understanding their impact and resolution approaches.

## 1. Knowledge Errors

### 1.1 Incomplete Information

#### Example 1: Missing Repository Context
**Scenario**: An agent is asked to modify a configuration file in a repository.

**Error**: The agent lacks information about the repository structure and environment configuration.

**Manifestation**:
```
User: Can you update the database connection string in our config file?
Agent: I'd be happy to help with that. Which config file would you like me to update?
User: The main one we use for production.
Agent: [Proceeds to search for files named "config" without understanding the repository structure or which file is used in production]
```

**Impact**: The agent cannot complete the task without additional information, requiring multiple clarification rounds and potentially making incorrect assumptions.

**Resolution**: Implement proactive information gathering to identify the repository structure and key configuration files before attempting the task.

#### Example 2: Incomplete Requirements
**Scenario**: An agent is asked to create a new API endpoint.

**Error**: The agent lacks critical information about authentication requirements, response format, and error handling expectations.

**Manifestation**:
```
User: Create a new endpoint for user profile updates.
Agent: [Creates an endpoint that allows profile updates but doesn't implement authentication checks, proper validation, or follow the project's established error handling patterns]
```

**Impact**: The implementation is incomplete and potentially insecure, requiring significant rework.

**Resolution**: Use a structured template to gather all necessary requirements for API endpoints, including authentication, validation, response format, and error handling.

### 1.2 Domain Knowledge Gaps

#### Example 1: Unfamiliarity with Framework Conventions
**Scenario**: An agent is asked to implement a feature in a framework it has limited knowledge of.

**Error**: The agent lacks understanding of the framework's conventions and best practices.

**Manifestation**:
```
User: Add form validation to our Angular component.
Agent: [Implements a custom validation solution instead of using Angular's built-in form validation features, creating unnecessary code and potential compatibility issues]
```

**Impact**: The implementation doesn't follow framework conventions, leading to maintenance issues and suboptimal performance.

**Resolution**: Consult framework documentation and identify established patterns before implementation, or acknowledge the knowledge gap and request guidance.

#### Example 2: Regulatory Compliance Oversight
**Scenario**: An agent is asked to implement a user data collection feature.

**Error**: The agent lacks knowledge about relevant data protection regulations (e.g., GDPR, CCPA).

**Manifestation**:
```
User: Add a feature to collect user location data for our analytics.
Agent: [Implements the feature without considering consent requirements, data minimization principles, or storage limitations required by privacy regulations]
```

**Impact**: The implementation may violate regulatory requirements, exposing the organization to legal risks.

**Resolution**: Develop domain-specific knowledge bases for common regulatory requirements and implement compliance checklists for sensitive features.

### 1.3 Contextual Misunderstanding

#### Example 1: Misinterpreting Project Goals
**Scenario**: An agent is asked to optimize a function.

**Error**: The agent misunderstands the optimization priority (speed vs. readability).

**Manifestation**:
```
User: Can you optimize this function? It's in our core library that many developers work with.
Agent: [Implements highly optimized but complex and difficult-to-maintain code, when the context actually required balancing performance with readability for a collaborative codebase]
```

**Impact**: The optimization creates maintenance challenges that outweigh the performance benefits in this context.

**Resolution**: Explicitly clarify optimization priorities and project context before implementation.

#### Example 2: Missing Business Context
**Scenario**: An agent is asked to implement a feature flag.

**Error**: The agent doesn't understand the business reason for the feature flag and its implications.

**Manifestation**:
```
User: Add a feature flag for the new checkout process.
Agent: [Implements a basic feature flag without considering gradual rollout capabilities, monitoring integration, or emergency override mechanisms needed for a critical business process]
```

**Impact**: The implementation doesn't meet the unstated but important business requirements for safely rolling out a critical feature.

**Resolution**: Gather information about the business context and implications of features before implementation.

## 2. Reasoning Errors

### 2.1 Logical Fallacies

#### Example 1: False Causality
**Scenario**: An agent is debugging a performance issue.

**Error**: The agent incorrectly attributes the cause based on coincidental timing.

**Manifestation**:
```
User: Our application started running slowly after we deployed the new logging feature.
Agent: [Concludes that the logging feature is causing the performance issue without proper investigation, when the actual cause is an unrelated database index problem]
```

**Impact**: Time is wasted optimizing the wrong component, while the actual issue remains unresolved.

**Resolution**: Implement structured debugging approaches that test causal relationships rather than assuming them.

#### Example 2: Overgeneralization
**Scenario**: An agent encounters an error with a specific library version.

**Error**: The agent overgeneralizes from a single case to recommend a sweeping change.

**Manifestation**:
```
User: We're getting this error with library X version 2.3.
Agent: [Recommends completely replacing the library with an alternative based on a single error, without investigating version-specific issues or simpler fixes]
```

**Impact**: The recommendation is disproportionate to the problem, potentially creating unnecessary work and introducing new risks.

**Resolution**: Develop more nuanced reasoning that considers multiple hypotheses and proportional responses.

### 2.2 Planning and Sequencing Errors

#### Example 1: Dependency Oversight
**Scenario**: An agent is implementing a multi-step system change.

**Error**: The agent fails to identify critical dependencies between steps.

**Manifestation**:
```
User: Update our authentication system to use the new identity provider.
Agent: [Creates a plan that updates the client-side code before updating the backend services, causing authentication failures during the transition]
```

**Impact**: The implementation plan creates service disruptions that could have been avoided with proper sequencing.

**Resolution**: Implement dependency mapping as part of the planning process and validate plans before execution.

#### Example 2: Inadequate Task Decomposition
**Scenario**: An agent is asked to implement a complex feature.

**Error**: The agent fails to break down the task into manageable components.

**Manifestation**:
```
User: Implement a shopping cart feature for our e-commerce site.
Agent: [Attempts to implement the entire feature at once without breaking it down into components like cart storage, item management, pricing calculation, and checkout integration]
```

**Impact**: The implementation becomes unwieldy, difficult to test, and more prone to errors.

**Resolution**: Develop structured task decomposition approaches that identify logical components and their interfaces.

### 2.3 Evaluation Errors

#### Example 1: Incomplete Criteria
**Scenario**: An agent is evaluating database options.

**Error**: The agent uses incomplete criteria for evaluation.

**Manifestation**:
```
User: What database should we use for our new logging system?
Agent: [Recommends a database based solely on performance benchmarks, without considering operational complexity, cost, ecosystem compatibility, or team familiarity]
```

**Impact**: The recommendation doesn't account for important factors that may outweigh raw performance in this context.

**Resolution**: Develop comprehensive evaluation frameworks that consider multiple dimensions relevant to the decision.

#### Example 2: Bias Toward Familiar Solutions
**Scenario**: An agent is recommending an approach for a new feature.

**Error**: The agent shows bias toward familiar technologies rather than the best fit.

**Manifestation**:
```
User: What's the best way to implement real-time notifications in our app?
Agent: [Recommends a traditional polling approach the agent is familiar with, despite WebSockets or Server-Sent Events being more appropriate for the real-time requirements]
```

**Impact**: The recommendation leads to a suboptimal solution that doesn't meet the real-time requirements efficiently.

**Resolution**: Implement explicit evaluation of multiple alternatives with clear criteria before making recommendations.

## 3. Execution Errors

### 3.1 Tool Usage Failures

#### Example 1: API Parameter Misuse
**Scenario**: An agent is using a REST API to fetch data.

**Error**: The agent uses incorrect parameters or formatting.

**Manifestation**:
```
User: Get the list of active users from our API.
Agent: [Constructs an API call with incorrect parameter names or formats, resulting in an error or empty response]
```

**Impact**: The task fails due to technical errors rather than conceptual misunderstanding.

**Resolution**: Implement parameter validation and consult API documentation before making calls.

#### Example 2: Permission Issues
**Scenario**: An agent attempts to modify a protected resource.

**Error**: The agent doesn't check for or handle permission requirements.

**Manifestation**:
```
User: Update the production configuration file.
Agent: [Attempts to modify a file without checking if it has the necessary permissions, resulting in an access denied error]
```

**Impact**: The task fails due to permission constraints that weren't anticipated.

**Resolution**: Implement permission checking before attempting operations and provide clear guidance when permission issues arise.

### 3.2 Resource Management Issues

#### Example 1: Rate Limit Exhaustion
**Scenario**: An agent is processing a large dataset using an external API.

**Error**: The agent doesn't manage API rate limits.

**Manifestation**:
```
User: Analyze all our customer data using the NLP API.
Agent: [Sends requests as fast as possible without throttling, quickly hitting rate limits and causing the task to fail]
```

**Impact**: The task fails partway through, potentially leaving data in an inconsistent state.

**Resolution**: Implement rate limiting, batching, and retry mechanisms when working with external APIs.

#### Example 2: Memory Exhaustion
**Scenario**: An agent is processing a large file.

**Error**: The agent loads the entire file into memory at once.

**Manifestation**:
```
User: Parse this 2GB log file and extract error patterns.
Agent: [Attempts to load the entire file into memory, causing out-of-memory errors instead of using streaming or chunked processing]
```

**Impact**: The task fails due to resource constraints that could have been avoided with better resource management.

**Resolution**: Implement resource-aware processing patterns that consider constraints and use efficient approaches.

### 3.3 Implementation Errors

#### Example 1: Syntax Errors
**Scenario**: An agent is generating code in a language it's less familiar with.

**Error**: The agent produces code with syntax errors.

**Manifestation**:
```
User: Write a Python script to process our data files.
Agent: [Generates code with syntax errors, such as missing colons after if statements or incorrect indentation]
```

**Impact**: The code doesn't run, requiring debugging and correction.

**Resolution**: Implement syntax validation before delivering code and test code snippets when possible.

#### Example 2: Logic Errors
**Scenario**: An agent is implementing a business rule.

**Error**: The agent's implementation contains logical errors.

**Manifestation**:
```
User: Implement the discount calculation: 10% off orders over $100, 20% off orders over $200.
Agent: [Implements logic that applies both discounts to orders over $200, or incorrectly handles edge cases like exactly $100]
```

**Impact**: The implementation produces incorrect results that may not be immediately obvious.

**Resolution**: Implement test cases that verify logic, especially for boundary conditions and complex rules.

## 4. Communication Errors

### 4.1 Request Misinterpretation

#### Example 1: Ambiguity Misresolution
**Scenario**: A user makes an ambiguous request.

**Error**: The agent resolves the ambiguity incorrectly without clarification.

**Manifestation**:
```
User: Update the header on the page.
Agent: [Updates the HTML <header> element when the user actually meant the page title or logo]
```

**Impact**: The agent performs the wrong task, requiring rework and creating frustration.

**Resolution**: Implement explicit clarification for ambiguous requests rather than making assumptions.

#### Example 2: Scope Misunderstanding
**Scenario**: A user requests a feature addition.

**Error**: The agent misunderstands the scope of the request.

**Manifestation**:
```
User: Add validation to the email field.
Agent: [Implements comprehensive validation for the entire form, including unrelated fields, or conversely, implements only minimal email format checking when security validation was also needed]
```

**Impact**: The implementation either does too much or too little based on the misunderstood scope.

**Resolution**: Explicitly confirm the scope of changes before implementation.

### 4.2 Response Quality Issues

#### Example 1: Excessive Jargon
**Scenario**: An agent explains a technical concept to a non-technical user.

**Error**: The agent uses excessive technical jargon.

**Manifestation**:
```
User: Why is our website slow?
Agent: [Responds with a highly technical explanation about TCP handshakes, DOM rendering, and JavaScript execution threads without translating to concepts the user can understand]
```

**Impact**: The user cannot understand the explanation, defeating the purpose of the response.

**Resolution**: Adapt explanations to the user's technical level and provide analogies or simplified explanations for complex concepts.

#### Example 2: Incomplete Response
**Scenario**: A user asks a multi-part question.

**Error**: The agent only addresses part of the question.

**Manifestation**:
```
User: How do we implement this feature and what are the security implications?
Agent: [Provides a detailed implementation plan but completely ignores the question about security implications]
```

**Impact**: The user needs to ask follow-up questions to get complete information, creating inefficiency.

**Resolution**: Implement structured response frameworks that ensure all parts of a question are addressed.

### 4.3 Update and Progress Communication

#### Example 1: Silent Failure
**Scenario**: An agent encounters an error during a long-running task.

**Error**: The agent doesn't communicate the failure or its status.

**Manifestation**:
```
User: Generate a report of all our user activity.
Agent: [Begins the task but encounters an error halfway through and doesn't inform the user, who is left waiting indefinitely]
```

**Impact**: The user wastes time waiting for a completion that won't happen and lacks information to address the issue.

**Resolution**: Implement regular status updates and immediate notification of blocking issues.

#### Example 2: Unclear Progress Indicators
**Scenario**: An agent is performing a multi-step process.

**Error**: The agent provides vague or misleading progress updates.

**Manifestation**:
```
User: Migrate our data to the new schema.
Agent: [Reports "Making good progress" without specific details about completed steps, remaining steps, or estimated completion time]
```

**Impact**: The user cannot gauge actual progress or make informed decisions about the process.

**Resolution**: Provide specific, quantifiable progress updates that reference the overall plan and timeline.

## 5. Coordination Errors

### 5.1 Handoff Failures

#### Example 1: Context Loss During Handoff
**Scenario**: A task is transferred from one agent to another.

**Error**: Critical context is lost during the handoff.

**Manifestation**:
```
Agent 1: [Works on a complex task with specific user requirements]
[Handoff occurs]
Agent 2: [Continues the work without understanding key constraints or decisions made earlier, creating inconsistent results]
```

**Impact**: The second agent makes decisions that contradict earlier work or user requirements, creating inconsistency.

**Resolution**: Implement structured context transfer during handoffs, including key decisions, constraints, and rationales.

#### Example 2: Responsibility Confusion
**Scenario**: Multiple agents are involved in a complex task.

**Error**: Unclear handoff creates confusion about who is responsible for what.

**Manifestation**:
```
Agent 1: [Completes part of a task and assumes Agent 2 will handle the rest]
Agent 2: [Assumes Agent 1 is handling the entire task]
[Critical components remain unaddressed as each agent thinks the other is responsible]
```

**Impact**: Parts of the task fall through the cracks, resulting in incomplete implementation.

**Resolution**: Implement explicit responsibility assignment during handoffs with clear acceptance criteria.

### 5.2 Conflicting Actions

#### Example 1: Simultaneous Modifications
**Scenario**: Multiple agents modify the same resource.

**Error**: The agents make conflicting changes without coordination.

**Manifestation**:
```
Agent 1: [Modifies a configuration file to optimize for security]
Agent 2: [Simultaneously modifies the same file to optimize for performance, overwriting or conflicting with Agent 1's changes]
```

**Impact**: Changes conflict or overwrite each other, potentially creating inconsistent or broken configurations.

**Resolution**: Implement resource locking or coordination mechanisms for shared resources.

#### Example 2: Contradictory Recommendations
**Scenario**: Different agents provide advice on the same issue.

**Error**: The agents give contradictory recommendations without awareness of each other.

**Manifestation**:
```
User: [Asks about the best database for their use case]
Agent 1: [Recommends PostgreSQL based on data consistency requirements]
Agent 2: [Recommends MongoDB based on scalability requirements, without awareness of Agent 1's recommendation]
```

**Impact**: The user receives conflicting advice without a clear resolution path, creating confusion.

**Resolution**: Implement recommendation awareness and collaborative resolution for conflicting advice.

### 5.3 Responsibility Gaps

#### Example 1: Monitoring Oversight
**Scenario**: A system requires ongoing monitoring after implementation.

**Error**: No agent is explicitly assigned monitoring responsibility.

**Manifestation**:
```
Agent 1: [Implements a new system]
Agent 2: [Handles user requests related to the system]
[No agent is responsible for monitoring system health, leading to undetected issues]
```

**Impact**: Issues go undetected until they cause significant problems that affect users.

**Resolution**: Implement explicit assignment of ongoing responsibilities like monitoring and maintenance.

#### Example 2: Edge Case Handling
**Scenario**: A complex process has unusual edge cases.

**Error**: Responsibility for edge cases is not clearly assigned.

**Manifestation**:
```
Agent 1: [Handles the main process flow]
Agent 2: [Handles error recovery]
[Unusual edge cases that don't fit clearly into either category are not handled by either agent]
```

**Impact**: Edge cases fall through the cracks, creating unhandled scenarios in the system.

**Resolution**: Implement comprehensive responsibility mapping that includes edge cases and exceptions.

## Conclusion

These examples illustrate how different types of errors manifest in real-world scenarios. By understanding these concrete manifestations, agents can better recognize potential error patterns and implement appropriate prevention and resolution strategies. The examples also provide context for the impact analysis and solution approaches outlined in other documents in this research.

Each example represents a learning opportunity that can contribute to the continuous improvement of agent operations. By systematically analyzing and addressing these common error patterns, agents can enhance their effectiveness, reliability, and user satisfaction.

