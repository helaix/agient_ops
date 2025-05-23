# Linear Implementation Workflow

## Step-by-Step Implementation Process

### 1. Initial Response
When assigned a Linear issue:

1. **Acknowledge Assignment**
   - Comment on the issue to confirm receipt
   - Estimate timeline if possible
   - Ask clarifying questions immediately

2. **Analyze Requirements**
   - Read the full issue description
   - Review linked issues and dependencies
   - Understand success criteria

3. **Plan Approach**
   - Break down complex tasks into steps
   - Identify potential blockers
   - Determine if delegation is needed

### 2. Working on Issues

#### Development Workflow
1. **Create Branch**: Use issue identifier in branch name
   ```bash
   git checkout -b feature/hlx-1234-implement-feature
   ```

2. **Make Changes**: Follow coding standards and best practices

3. **Commit Regularly**: Use descriptive commit messages
   ```bash
   git commit -m "HLX-1234: Implement user authentication"
   ```

4. **Update Issue**: Comment on progress regularly

#### Communication During Work
- **Progress Updates**: Comment every 24-48 hours on active issues
- **Blockers**: Report immediately with specific details
- **Questions**: Ask for clarification rather than making assumptions
- **Changes**: Document any scope or approach changes

### 3. Code Review Integration

#### Pull Request Creation
1. **Link to Issue**: Include Linear URL in PR description
2. **Describe Changes**: Explain what was implemented
3. **Test Coverage**: Document testing approach
4. **Review Requests**: Tag appropriate reviewers

#### PR Description Template
```markdown
## Related Issue
https://linear.app/helaix/issue/HLX-1234

## Changes Made
- Implemented feature X
- Added tests for Y
- Updated documentation for Z

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Review Notes
- Pay attention to performance implications in file.js
- New dependency added: package-name
```

### 4. Handling Interrupts

When receiving new information or requests:

1. **Acknowledge Immediately**: Respond within 1 hour if possible
2. **Assess Impact**: Determine if changes affect current work
3. **Update Plan**: Revise approach if necessary
4. **Communicate Changes**: Explain any timeline or scope impacts

### 5. Quality Assurance

Before marking work complete:

- [ ] All requirements met
- [ ] Code follows standards
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] PR created and linked
- [ ] Stakeholders notified

## Common Patterns

### Feature Implementation
1. Analyze requirements
2. Design solution
3. Implement incrementally
4. Test thoroughly
5. Document changes
6. Request review

### Bug Fixes
1. Reproduce issue
2. Identify root cause
3. Implement minimal fix
4. Add regression tests
5. Verify fix works
6. Update issue with resolution

### Research Tasks
1. Define research questions
2. Gather information systematically
3. Document findings
4. Present recommendations
5. Get stakeholder feedback
6. Plan next steps

## Integration with Development Tools

### Git Integration
- Use issue identifiers in branch names
- Reference issues in commit messages
- Link PRs to Linear issues

### CI/CD Integration
- Ensure builds pass before marking complete
- Monitor deployment status
- Update issue with deployment information

### Documentation Integration
- Update relevant documentation
- Link to Linear issues from docs
- Maintain change logs

