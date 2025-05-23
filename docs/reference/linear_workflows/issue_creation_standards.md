# Linear Issue Creation & Standards

## Standard Issue Reference Format

### ✅ Correct Format (REQUIRED)

**Always use the full Linear URL format:**
```
https://linear.app/helaix/issue/HLX-1234
```

### ❌ Incorrect Formats (DO NOT USE)

- `HLX-1234` (identifier only)
- `#1234` (number only)
- `linear.app/helaix/issue/HLX-1234` (missing protocol)
- `https://linear.app/issue/HLX-1234` (missing organization)

## Why Use Full URLs?

1. **Direct Navigation**: Users can click directly to access the issue
2. **Context Preservation**: Full URLs work across all platforms and contexts
3. **Integration Compatibility**: Works with all tools and systems
4. **Future-Proofing**: Remains valid even if URL structures change

## Implementation Guidelines

### In Issue Descriptions
```markdown
**Related Issues**: 
- Parent: https://linear.app/helaix/issue/HLX-1750
- Dependency: https://linear.app/helaix/issue/HLX-1749
```

### In Comments
```markdown
This addresses the concern raised in https://linear.app/helaix/issue/HLX-1725
```

### In Documentation
```markdown
See the implementation guide: https://linear.app/helaix/issue/HLX-1730
```

## Issue Creation Best Practices

### Title Guidelines
- Be specific and actionable
- Include context when necessary
- Use consistent naming conventions

### Description Structure
1. **Objective**: Clear statement of what needs to be accomplished
2. **Context**: Background information and reasoning
3. **Scope**: What is and isn't included
4. **Deliverables**: Specific outputs expected
5. **Success Metrics**: How completion will be measured

### Labels and Metadata
- Use appropriate labels for categorization
- Set priority levels based on urgency and impact
- Assign to appropriate team members
- Link to relevant projects and cycles

## Migration from Legacy Formats

If you encounter old-style references:
1. Update them to full URL format immediately
2. Verify the links work correctly
3. Document the change in commit messages
4. Notify relevant team members of the update

## Enforcement

All new issues and comments must use the full URL format. Legacy formats will be flagged for update during reviews.

