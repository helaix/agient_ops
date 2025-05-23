# Linear Workflow Scenarios and Examples

## Overview

This document provides practical examples and detailed scenarios for implementing Linear workflows in real-world situations. These scenarios demonstrate best practices, common patterns, and solutions to typical challenges.

## Scenario Categories

1. **[Single Agent Workflows](#single-agent-workflows)**
2. **[Multi-Agent Collaboration](#multi-agent-collaboration)**
3. **[Research and Documentation](#research-and-documentation)**
4. **[Integration and Automation](#integration-and-automation)**
5. **[Crisis and Escalation](#crisis-and-escalation)**

## Single Agent Workflows

### Scenario 1: Simple Feature Implementation

**Context**: A developer needs to implement a new login form component.

**Linear Issue**: HLX-123 "Implement user login form with validation"

**Workflow Steps**:

1. **Issue Analysis**
   ```
   - Read issue description and acceptance criteria
   - Review linked design mockups
   - Check for dependencies or related issues
   - Estimate effort and timeline
   ```

2. **Branch Creation**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/HLX-123-implement-login-form
   ```

3. **Linear Status Update**
   ```
   - Move issue from "To Do" to "In Progress"
   - Add comment: "Starting implementation, created branch feature/HLX-123-implement-login-form"
   ```

4. **Implementation**
   ```
   - Create component files
   - Implement form validation
   - Add unit tests
   - Update documentation
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "[HLX-123] feat: implement login form with validation"
   git push -u origin feature/HLX-123-implement-login-form
   ```

6. **PR Creation**
   ```
   - Create PR with title "HLX-123: Implement user login form"
   - Add description: "Fixes HLX-123"
   - Request review from team members
   ```

7. **Linear Update**
   ```
   - Move issue to "In Review"
   - Add PR link to issue
   - Notify stakeholders
   ```

**Key Success Factors**:
- Clear branch naming convention
- Proper commit message format
- Automatic issue linking via PR description
- Regular status updates

### Scenario 2: Bug Fix with Investigation

**Context**: A critical bug is reported in the payment processing system.

**Linear Issue**: HLX-456 "Payment processing fails for international cards"

**Workflow Steps**:

1. **Immediate Response**
   ```
   - Acknowledge issue receipt
   - Set priority to "Urgent"
   - Move to "In Progress"
   - Notify stakeholders of investigation start
   ```

2. **Investigation Phase**
   ```
   - Reproduce the bug in development environment
   - Analyze logs and error messages
   - Identify root cause
   - Document findings in issue comments
   ```

3. **Solution Development**
   ```bash
   git checkout -b hotfix/HLX-456-fix-international-payment-processing
   # Implement fix
   git commit -m "[HLX-456] fix: handle international card validation correctly"
   ```

4. **Testing and Validation**
   ```
   - Test fix with various international card formats
   - Verify no regression in domestic payments
   - Document test results
   ```

5. **Expedited Review**
   ```
   - Create PR with "HOTFIX" label
   - Request immediate review
   - Provide detailed testing evidence
   ```

6. **Deployment and Monitoring**
   ```
   - Deploy to production after approval
   - Monitor payment success rates
   - Update Linear issue with deployment status
   ```

**Key Success Factors**:
- Rapid response and communication
- Thorough investigation and documentation
- Comprehensive testing
- Post-deployment monitoring

## Multi-Agent Collaboration

### Scenario 3: Large Feature Development

**Context**: Building a new dashboard with multiple components requiring coordination between frontend, backend, and design teams.

**Parent Issue**: HLX-789 "Implement analytics dashboard"

**Sub-Issues**:
- HLX-790 "Design dashboard layout and components"
- HLX-791 "Implement backend analytics API"
- HLX-792 "Create frontend dashboard components"
- HLX-793 "Integrate dashboard with existing auth system"

**Coordination Workflow**:

1. **Parent Agent Setup**
   ```
   - Create parent issue with overall requirements
   - Break down into logical sub-issues
   - Assign sub-issues to appropriate agents
   - Set up coordination timeline
   ```

2. **Child Agent Coordination**
   ```
   Agent A (Design): HLX-790
   - Create design mockups
   - Define component specifications
   - Share designs with frontend agent
   
   Agent B (Backend): HLX-791
   - Design API endpoints
   - Implement data aggregation
   - Create API documentation
   
   Agent C (Frontend): HLX-792
   - Wait for designs and API specs
   - Implement dashboard components
   - Integrate with backend API
   
   Agent D (Integration): HLX-793
   - Coordinate with auth team
   - Implement security integration
   - Test end-to-end functionality
   ```

3. **Progress Synchronization**
   ```
   Daily standups via Linear comments:
   - Each agent updates their sub-issue status
   - Parent agent consolidates progress
   - Dependencies and blockers are identified
   - Timeline adjustments made as needed
   ```

4. **Integration Phase**
   ```
   - Parent agent coordinates integration testing
   - All agents collaborate on bug fixes
   - Final testing and validation
   - Coordinated deployment
   ```

**Key Success Factors**:
- Clear task decomposition
- Regular communication and updates
- Dependency management
- Coordinated integration and testing

### Scenario 4: Cross-Team Collaboration

**Context**: Implementing a feature that requires changes to multiple systems owned by different teams.

**Linear Issue**: HLX-999 "Add single sign-on (SSO) support"

**Teams Involved**:
- Authentication Team
- Frontend Team
- Backend API Team
- DevOps Team

**Collaboration Workflow**:

1. **Cross-Team Planning**
   ```
   - Create main issue in shared project
   - Identify required changes per team
   - Create team-specific sub-issues
   - Establish communication channels
   ```

2. **Team Coordination**
   ```
   Auth Team (HLX-1001): "Implement SSO provider integration"
   Frontend Team (HLX-1002): "Add SSO login UI components"
   Backend Team (HLX-1003): "Update API authentication middleware"
   DevOps Team (HLX-1004): "Configure SSO in production environment"
   ```

3. **Dependency Management**
   ```
   - Auth team completes provider integration first
   - Backend team updates API based on auth changes
   - Frontend team implements UI after API updates
   - DevOps configures production after all code changes
   ```

4. **Integration Testing**
   ```
   - Staged testing environment setup
   - Cross-team integration testing
   - Security review and validation
   - Performance testing
   ```

**Key Success Factors**:
- Clear ownership and responsibilities
- Well-defined interfaces between teams
- Regular cross-team communication
- Comprehensive integration testing

## Research and Documentation

### Scenario 5: Technology Research Project

**Context**: Evaluating a new framework for potential adoption.

**Linear Issue**: HLX-555 "Research and evaluate React Server Components"

**Research Workflow**:

1. **Research Planning**
   ```
   - Define research objectives and scope
   - Identify evaluation criteria
   - Set timeline and milestones
   - Create research documentation structure
   ```

2. **Information Gathering**
   ```
   - Review official documentation
   - Analyze community adoption and feedback
   - Study performance benchmarks
   - Examine integration requirements
   ```

3. **Hands-on Evaluation**
   ```bash
   git checkout -b research/HLX-555-react-server-components
   # Create proof-of-concept implementation
   # Test integration with existing codebase
   # Measure performance impact
   ```

4. **Analysis and Documentation**
   ```
   - Compile findings into comprehensive report
   - Create pros/cons analysis
   - Provide implementation recommendations
   - Document migration strategy if applicable
   ```

5. **Stakeholder Presentation**
   ```
   - Present findings to technical team
   - Discuss implications and trade-offs
   - Get feedback and additional questions
   - Make final recommendation
   ```

**Key Success Factors**:
- Systematic research approach
- Objective evaluation criteria
- Practical proof-of-concept
- Clear documentation and recommendations

### Scenario 6: Documentation Creation

**Context**: Creating comprehensive API documentation for a new service.

**Linear Issue**: HLX-666 "Create API documentation for user service"

**Documentation Workflow**:

1. **Content Planning**
   ```
   - Analyze API endpoints and functionality
   - Identify target audiences
   - Plan documentation structure
   - Set up documentation tooling
   ```

2. **Content Creation**
   ```
   - Write endpoint descriptions
   - Create code examples
   - Add authentication guides
   - Include error handling documentation
   ```

3. **Review and Validation**
   ```
   - Technical review by API developers
   - Usability testing with potential users
   - Accuracy verification
   - Style and consistency review
   ```

4. **Publication and Maintenance**
   ```
   - Publish to documentation site
   - Set up automated updates
   - Create maintenance schedule
   - Establish feedback collection
   ```

**Key Success Factors**:
- User-focused content structure
- Comprehensive code examples
- Regular updates and maintenance
- Feedback incorporation process

## Integration and Automation

### Scenario 7: CI/CD Pipeline Setup

**Context**: Setting up automated testing and deployment for a new microservice.

**Linear Issue**: HLX-777 "Set up CI/CD pipeline for notification service"

**Automation Workflow**:

1. **Requirements Analysis**
   ```
   - Define testing requirements
   - Identify deployment environments
   - Plan security and compliance needs
   - Set performance criteria
   ```

2. **Pipeline Configuration**
   ```yaml
   # .github/workflows/ci-cd.yml
   name: CI/CD Pipeline
   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Run tests
           run: npm test
     
     deploy:
       needs: test
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       steps:
         - name: Deploy to production
           run: ./deploy.sh
   ```

3. **Testing and Validation**
   ```
   - Test pipeline with sample changes
   - Validate security scanning
   - Verify deployment process
   - Test rollback procedures
   ```

4. **Documentation and Training**
   ```
   - Document pipeline configuration
   - Create troubleshooting guide
   - Train team on new processes
   - Set up monitoring and alerts
   ```

**Key Success Factors**:
- Comprehensive testing strategy
- Secure deployment process
- Clear documentation
- Team training and adoption

### Scenario 8: Linear-GitHub Integration Setup

**Context**: Configuring automatic synchronization between Linear issues and GitHub PRs.

**Linear Issue**: HLX-888 "Configure Linear-GitHub integration for automated workflows"

**Integration Workflow**:

1. **Integration Planning**
   ```
   - Review current workflow inefficiencies
   - Define desired automation behaviors
   - Plan integration configuration
   - Set up testing environment
   ```

2. **Configuration Setup**
   ```
   Linear Settings:
   - Enable GitHub integration
   - Configure webhook endpoints
   - Set up branch naming rules
   - Define status mapping
   
   GitHub Settings:
   - Install Linear app
   - Configure repository access
   - Set up branch protection rules
   - Configure automated checks
   ```

3. **Workflow Testing**
   ```
   Test Scenarios:
   - Create issue and branch automatically
   - Link PR to issue via branch name
   - Update issue status on PR merge
   - Sync comments between systems
   ```

4. **Team Rollout**
   ```
   - Train team on new workflows
   - Create quick reference guides
   - Monitor adoption and issues
   - Gather feedback and iterate
   ```

**Key Success Factors**:
- Thorough testing before rollout
- Clear team communication
- Comprehensive documentation
- Ongoing support and iteration

## Crisis and Escalation

### Scenario 9: Production Incident Response

**Context**: Critical production issue affecting user authentication.

**Linear Issue**: HLX-911 "CRITICAL: Users cannot log in to application"

**Incident Response Workflow**:

1. **Immediate Response**
   ```
   - Create critical priority issue
   - Notify incident response team
   - Set up war room communication
   - Begin impact assessment
   ```

2. **Investigation and Diagnosis**
   ```
   - Analyze system logs and metrics
   - Identify root cause
   - Assess scope of impact
   - Document findings in real-time
   ```

3. **Mitigation and Resolution**
   ```bash
   git checkout -b hotfix/HLX-911-fix-auth-service
   # Implement emergency fix
   git commit -m "[HLX-911] hotfix: restore authentication service"
   # Deploy immediately after review
   ```

4. **Communication and Updates**
   ```
   - Regular status updates to stakeholders
   - Customer communication if needed
   - Internal team coordination
   - Post-incident communication
   ```

5. **Post-Incident Activities**
   ```
   - Conduct post-mortem analysis
   - Document lessons learned
   - Implement preventive measures
   - Update incident response procedures
   ```

**Key Success Factors**:
- Rapid response and escalation
- Clear communication channels
- Systematic investigation approach
- Thorough post-incident analysis

### Scenario 10: Escalation to Management

**Context**: Technical decision requires management approval due to significant resource implications.

**Linear Issue**: HLX-1010 "Evaluate migration to new cloud provider"

**Escalation Workflow**:

1. **Issue Documentation**
   ```
   - Clearly document the problem or opportunity
   - Provide technical analysis and options
   - Include cost-benefit analysis
   - Identify risks and mitigation strategies
   ```

2. **Stakeholder Identification**
   ```
   - Identify decision makers
   - Determine required approvals
   - Plan presentation approach
   - Schedule decision meetings
   ```

3. **Presentation and Discussion**
   ```
   - Present technical findings
   - Discuss business implications
   - Address questions and concerns
   - Provide recommendations
   ```

4. **Decision Implementation**
   ```
   - Document approved approach
   - Create implementation plan
   - Assign resources and timeline
   - Set up progress tracking
   ```

**Key Success Factors**:
- Clear problem articulation
- Comprehensive analysis
- Business impact focus
- Actionable recommendations

## Best Practices Summary

### Communication
- Use clear, concise language in all Linear communications
- Provide regular status updates
- Document decisions and rationale
- Escalate issues promptly when needed

### Workflow Management
- Follow consistent naming conventions
- Use proper issue linking and references
- Maintain accurate status updates
- Document lessons learned

### Collaboration
- Establish clear roles and responsibilities
- Set up regular check-ins and updates
- Manage dependencies proactively
- Foster open communication

### Quality Assurance
- Test thoroughly before marking complete
- Review work with appropriate stakeholders
- Document any known limitations
- Follow up on deployed changes

## Related Documentation

- [Linear Workflows Reference](../reference/linear_workflows_reference.md)
- [Decision Trees](../reference/decision_trees/README.md)
- [Workflow Checklists](../reference/workflow_checklists/README.md)
- [Integration Guidelines](../reference/integration_guidelines/README.md)

