# Gemini Live Interface to CodeGen - Master Prompt

## Application Overview

The Gemini Live Interface to CodeGen is a sophisticated AI-powered system that bridges natural language voice and text interactions with the CodeGen development platform. This system enables developers and users to interact with CodeGen's powerful code generation, analysis, and project management capabilities through intuitive conversational interfaces powered by Google's Gemini AI.

## Core Functionality

### Primary Capabilities
- **Voice-to-Code Translation**: Convert natural language voice commands into executable code operations
- **Real-time Code Generation**: Generate, modify, and refactor code through conversational interactions
- **Project Management Integration**: Seamlessly interact with Linear issues, GitHub repositories, and development workflows
- **Context-Aware Assistance**: Maintain conversation state and project context across interactions
- **Multi-modal Communication**: Support both voice and text inputs with intelligent response routing

### Key Features
- Natural language processing for development tasks
- Voice command recognition and processing
- Real-time code generation and modification
- Integration with CodeGen's existing tool ecosystem
- Conversation state management and persistence
- Intelligent function calling to CodeGen and Linear APIs
- Adaptive response formatting based on interaction mode

## Integration Requirements

### Core Integrations
1. **Gemini API Integration**
   - Voice processing and transcription
   - Natural language understanding
   - Function calling capabilities
   - Response generation and formatting

2. **CodeGen Platform Integration**
   - Access to all CodeGen tools and functions
   - Repository management and code operations
   - File editing and creation capabilities
   - Search and analysis functions

3. **Linear Workflow Integration**
   - Issue creation and management
   - Project tracking and updates
   - Team collaboration features
   - Workflow automation

4. **Development Environment Integration**
   - Git operations and branch management
   - CI/CD pipeline interactions
   - Testing and validation workflows
   - Deployment and monitoring

## Conditional Routing to Specialized Rules

This master prompt serves as the central coordination point for routing to specialized rule sets based on the nature of the task or interaction. The system should evaluate incoming requests and route to the appropriate specialized rules:

### Routing Logic

```
IF task involves code development OR code modification OR new feature implementation
  → ROUTE TO: development-rules.md

IF task involves testing OR quality assurance OR validation
  → ROUTE TO: testing-rules.md

IF task involves API integration OR external service connection OR data exchange
  → ROUTE TO: integration-rules.md

IF task involves documentation OR knowledge management OR user guides
  → ROUTE TO: documentation-rules.md

IF task involves security considerations OR authentication OR data protection
  → ROUTE TO: security-rules.md

IF task involves performance optimization OR scalability OR resource management
  → ROUTE TO: performance-rules.md

IF task involves voice processing OR audio handling OR speech recognition
  → ROUTE TO: voice-processing-rules.md

IF task involves state management OR data persistence OR session handling
  → ROUTE TO: state-management-rules.md

IF task involves error handling OR debugging OR troubleshooting
  → ROUTE TO: error-handling-rules.md

IF task involves deployment OR infrastructure OR environment setup
  → ROUTE TO: deployment-rules.md
```

### Multi-Rule Scenarios
When a task spans multiple categories, apply rules in this priority order:
1. Security rules (always highest priority)
2. Performance rules (for optimization concerns)
3. Integration rules (for external dependencies)
4. Development rules (for core implementation)
5. Testing rules (for validation)
6. Documentation rules (for knowledge capture)

## Context Preservation Guidelines

### Conversation State Management
- Maintain context across multiple interactions
- Track project state and current working directory
- Remember user preferences and interaction patterns
- Preserve conversation history for reference

### Project Context Awareness
- Understand current repository and branch state
- Track active Linear issues and project goals
- Maintain awareness of team members and assignments
- Remember recent changes and modifications

## Quality Assurance Framework

### Response Quality Criteria
- Accuracy of code generation and suggestions
- Relevance to user intent and project context
- Completeness of implementation or guidance
- Clarity and usefulness of explanations
- Adherence to project standards and conventions

### Validation Requirements
- Verify code syntax and logic before suggesting
- Validate integration points and dependencies
- Confirm security and performance implications
- Ensure compatibility with existing codebase
- Test voice processing accuracy and responsiveness

## Success Metrics

### Effectiveness Measures
- Task completion rate and accuracy
- User satisfaction with generated code
- Reduction in development time
- Quality of voice-to-code translation
- Integration success rate with external systems

### Performance Indicators
- Response time for voice processing
- Accuracy of natural language understanding
- Code generation quality and relevance
- System reliability and uptime
- User adoption and engagement rates

## Emergency Protocols

### Fallback Procedures
- When voice processing fails, gracefully fall back to text input
- When code generation is uncertain, request clarification
- When integration fails, provide manual alternatives
- When context is lost, request necessary information
- When errors occur, provide clear diagnostic information

### Escalation Triggers
- Security vulnerabilities detected in generated code
- System performance degradation beyond thresholds
- Integration failures affecting core functionality
- User safety concerns with voice processing
- Data integrity issues with state management

---

*This master prompt should be reviewed and updated regularly to reflect evolving requirements and lessons learned from system usage.*

