# Development Rules for Gemini Live Interface to CodeGen

## Rule Activation Triggers

This rule set is activated when:
- User requests code generation, modification, or refactoring
- New feature implementation is required
- Code architecture decisions need to be made
- Development workflow guidance is needed
- Code quality improvements are requested

## Core Development Principles

### 1. Code Generation Standards

#### Voice-to-Code Translation
- **Clarity First**: Always request clarification for ambiguous voice commands
- **Context Awareness**: Consider current file, project structure, and recent changes
- **Incremental Development**: Break complex requests into smaller, manageable steps
- **Validation Required**: Always validate generated code before suggesting implementation

#### Code Quality Requirements
```typescript
// Example: Always include proper typing for TypeScript
interface VoiceCommand {
  intent: string;
  parameters: Record<string, any>;
  context: ProjectContext;
  timestamp: Date;
}

// Include error handling in all generated code
try {
  const result = await processVoiceCommand(command);
  return result;
} catch (error) {
  logger.error('Voice command processing failed', { error, command });
  throw new VoiceProcessingError('Failed to process command', error);
}
```

### 2. Architecture Guidelines

#### Modular Design
- **Separation of Concerns**: Keep voice processing, code generation, and integration logic separate
- **Plugin Architecture**: Design components to be easily extensible and replaceable
- **Interface Contracts**: Define clear interfaces between components
- **Dependency Injection**: Use DI patterns for testability and flexibility

#### Example Structure
```
src/
├── voice/
│   ├── processors/
│   ├── transcription/
│   └── intent-recognition/
├── codegen/
│   ├── generators/
│   ├── analyzers/
│   └── validators/
├── integrations/
│   ├── gemini/
│   ├── linear/
│   └── github/
└── state/
    ├── conversation/
    ├── project/
    └── user-preferences/
```

### 3. Implementation Guidelines

#### When Generating New Components
1. **Start with Interface Definition**
   ```typescript
   interface CodeGenerator {
     generate(prompt: string, context: GenerationContext): Promise<GeneratedCode>;
     validate(code: string): ValidationResult;
     optimize(code: string): OptimizedCode;
   }
   ```

2. **Implement with Error Handling**
   ```typescript
   class VoiceCodeGenerator implements CodeGenerator {
     async generate(prompt: string, context: GenerationContext): Promise<GeneratedCode> {
       try {
         const intent = await this.parseIntent(prompt);
         const code = await this.generateFromIntent(intent, context);
         const validation = this.validate(code.content);
         
         if (!validation.isValid) {
           throw new CodeGenerationError('Generated code failed validation', validation.errors);
         }
         
         return code;
       } catch (error) {
         this.logger.error('Code generation failed', { prompt, context, error });
         throw error;
       }
     }
   }
   ```

3. **Include Comprehensive Testing**
   ```typescript
   describe('VoiceCodeGenerator', () => {
     it('should generate valid TypeScript code from voice command', async () => {
       const generator = new VoiceCodeGenerator();
       const result = await generator.generate(
         'create a function that validates email addresses',
         { language: 'typescript', project: 'user-auth' }
       );
       
       expect(result.content).toContain('function validateEmail');
       expect(result.validation.isValid).toBe(true);
     });
   });
   ```

### 4. Integration Patterns

#### CodeGen Tool Integration
```typescript
class CodeGenIntegration {
  async executeCodeGenTool(toolName: string, parameters: any): Promise<any> {
    try {
      const tool = this.toolRegistry.get(toolName);
      if (!tool) {
        throw new ToolNotFoundError(`Tool ${toolName} not found`);
      }
      
      const result = await tool.execute(parameters);
      await this.auditLog.record({
        tool: toolName,
        parameters,
        result: result.summary,
        timestamp: new Date()
      });
      
      return result;
    } catch (error) {
      this.logger.error('CodeGen tool execution failed', { toolName, parameters, error });
      throw error;
    }
  }
}
```

#### Linear Workflow Integration
```typescript
class LinearWorkflowIntegration {
  async createIssueFromVoiceCommand(command: VoiceCommand): Promise<LinearIssue> {
    const issueData = await this.extractIssueData(command);
    
    const issue = await this.linearClient.createIssue({
      title: issueData.title,
      description: this.formatDescription(issueData),
      teamId: await this.resolveTeamId(issueData.team),
      assigneeId: await this.resolveAssigneeId(issueData.assignee),
      priority: this.mapPriority(issueData.priority)
    });
    
    await this.linkToConversation(issue.id, command.conversationId);
    return issue;
  }
}
```

## Code Review and Quality Assurance

### Automated Validation
- **Syntax Checking**: Always validate syntax before suggesting code
- **Type Checking**: Ensure type safety in TypeScript/JavaScript code
- **Linting**: Apply project-specific linting rules
- **Security Scanning**: Check for common security vulnerabilities

### Manual Review Triggers
- Complex algorithm implementations
- Security-sensitive code (authentication, authorization)
- Performance-critical sections
- Integration with external APIs
- Database schema changes

## Development Workflow Integration

### Git Workflow
```typescript
class GitWorkflowManager {
  async createFeatureBranch(featureName: string): Promise<string> {
    const branchName = `feature/voice-${featureName}-${Date.now()}`;
    await this.git.checkout('-b', branchName);
    return branchName;
  }
  
  async commitChanges(message: string, files: string[]): Promise<void> {
    await this.git.add(files);
    await this.git.commit('-m', `[Voice Generated] ${message}`);
  }
}
```

### Continuous Integration
- All voice-generated code must pass CI checks
- Automated testing required for new components
- Code coverage thresholds must be maintained
- Security scans must pass before merge

## Error Handling and Recovery

### Development Error Categories
1. **Syntax Errors**: Immediate feedback and correction suggestions
2. **Logic Errors**: Request clarification and provide alternatives
3. **Integration Errors**: Fallback to manual implementation guidance
4. **Performance Issues**: Suggest optimizations and alternatives

### Recovery Strategies
```typescript
class DevelopmentErrorHandler {
  async handleCodeGenerationError(error: CodeGenerationError, context: GenerationContext): Promise<RecoveryAction> {
    switch (error.type) {
      case 'SYNTAX_ERROR':
        return this.suggestSyntaxCorrection(error, context);
      case 'LOGIC_ERROR':
        return this.requestClarification(error, context);
      case 'INTEGRATION_ERROR':
        return this.provideFallbackImplementation(error, context);
      default:
        return this.escalateToHuman(error, context);
    }
  }
}
```

## Performance Considerations

### Code Generation Optimization
- Cache frequently used code patterns
- Optimize for common voice command patterns
- Minimize API calls during generation
- Use streaming for large code outputs

### Resource Management
- Limit concurrent code generation requests
- Implement request queuing for high load
- Monitor memory usage during generation
- Clean up temporary files and resources

## Documentation Requirements

### Generated Code Documentation
- All generated functions must include JSDoc comments
- Complex algorithms require explanation comments
- Integration points must be documented
- Error handling strategies must be explained

### Development Process Documentation
- Record voice command patterns and their code outputs
- Document successful integration patterns
- Maintain troubleshooting guides
- Update architecture decisions records (ADRs)

---

*These development rules should be continuously refined based on user feedback and system performance metrics.*

