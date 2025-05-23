# Linear Automation System

**Phase 2.3: Workflow Optimization & Automation**

A comprehensive automation and workflow optimization system for Linear workspaces, designed to streamline issue management, improve triage processes, and maintain organized project workflows.

## 🚀 Features

### Automated Workflows
- **Issue Creation Automation**: Auto-assign priorities, projects, and labels based on content
- **State Transition Automation**: Automatic state changes based on assignments and PR links
- **Label Management**: Smart labeling based on content analysis and keywords
- **Priority Escalation**: Automatic priority adjustment for urgent issues

### Issue Templates & Standards
- **Predefined Templates**: Feature requests, bug reports, epics, and documentation
- **Quality Validation**: Automated checks for completeness and standards compliance
- **Template Suggestions**: AI-powered template recommendations based on content

### Triage Processes
- **Daily Triage**: Automated processing of new issues in "To Process" queue
- **Weekly Reviews**: Priority validation and workload analysis
- **Monthly Assessments**: Workflow effectiveness and process improvements
- **Quarterly Planning**: Strategic workflow optimization

### Monitoring & Metrics
- **Workflow Metrics**: Processing time, label consistency, project distribution
- **Quality Metrics**: Completion rates, stale issue detection, duplicate identification
- **Health Scoring**: Overall workflow health assessment (0-100 scale)
- **Automated Reporting**: Regular health reports with actionable recommendations

## 📦 Installation

### Prerequisites
- Node.js 14.0.0 or higher
- Linear API access
- Team admin permissions (for automation setup)

### Setup
```bash
# Clone the repository
git clone https://github.com/helaix/agient_ops.git
cd agient_ops/linear-automation

# Install dependencies
npm install

# Set up environment variables
export LINEAR_API_KEY=your_linear_api_key_here

# Test the installation
npm start help
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
LINEAR_API_KEY=your_linear_api_key_here

# Optional
NODE_ENV=production
LOG_LEVEL=info
```

### Automation Configuration
Edit `automation-config.json` to customize:
- Team settings and metadata
- Automation rules and triggers
- Issue templates and validation
- Triage schedules and processes
- Monitoring thresholds

## 🎯 Usage

### Command Line Interface
```bash
# Run daily automation tasks
npm run daily

# Run specific components
npm run triage      # Daily triage only
npm run metrics     # Metrics collection only
npm run automation  # Automation engine only

# Get system status
npm start status

# Show available templates
npm start templates

# Process specific issue
npm start process HLX-1234

# Show help
npm start help
```

### Programmatic Usage
```javascript
const LinearAutomationSystem = require('./index');

const system = new LinearAutomationSystem();
await system.initialize();

// Run daily tasks
const results = await system.runDailyTasks();

// Get system status
const status = await system.getSystemStatus();

// Process specific issue
await system.processIssue('issue-id');
```

## 📊 Automation Rules

### Issue Creation Rules

#### Priority Assignment
- **Urgent**: Contains keywords like "urgent", "critical", "blocking"
- **High**: Contains keywords like "important", "high-impact", "priority"
- **Medium**: Default for new issues without priority

#### Project Assignment
- **Voice Assistant**: Keywords like "voice", "assistant", "hello-operator"
- **Analytics**: Keywords like "analytics", "tracking", "metrics"
- **Outreach**: Keywords like "outreach", "b2b", "sales"
- **SEO**: Keywords like "seo", "content", "marketing"
- **Automation**: Keywords like "agent", "workflow", "automation"
- **Meta/DX**: Keywords like "meta", "dx", "developer"

#### Type Labeling
- **Bug**: Keywords like "bug", "error", "fix", "broken"
- **Feature**: Keywords like "feature", "implement", "add", "create"
- **Improvement**: Keywords like "improve", "optimize", "enhance"
- **Documentation**: Keywords like "document", "docs", "readme"
- **Epic**: Keywords like "epic", "large", "complex", "phase"

### State Transition Rules

#### Automatic Transitions
- **To Process → In Progress**: When issue is assigned
- **Any State → In Review**: When PR is linked
- **In Review → Done**: When linked PR is merged

#### Component Labeling
- **Frontend**: UI, React, CSS, HTML, JavaScript
- **Backend**: API, server, database, Node.js, Python
- **Infrastructure**: Deploy, CI/CD, Docker, Kubernetes
- **Mobile**: iOS, Android, React Native, Flutter
- **Design**: UX, Figma, wireframes, mockups

## 📋 Issue Templates

### Feature Request Template
```markdown
## Feature Description
[Describe the feature in detail]

## User Story
As a [user type], I want [functionality] so that [benefit].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Requirements
[Any technical specifications or constraints]

## Definition of Done
- [ ] Feature implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved
```

### Bug Report Template
```markdown
## Bug Description
[Brief description of the bug]

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., Windows 10, macOS 12.0]
- Browser: [e.g., Chrome 95, Safari 15]
- Version: [e.g., v1.2.3]
```

## 📈 Metrics & Monitoring

### Key Metrics

#### Workflow Metrics
- **Issue Processing Time**: Average time in "To Process" state (Target: <24 hours)
- **Label Usage Consistency**: Percentage of properly labeled issues (Target: >90%)
- **Project Distribution Balance**: Even distribution across projects
- **Priority Accuracy**: Alignment between assigned and suggested priorities

#### Quality Metrics
- **Issues Without Labels**: Count and percentage of unlabeled issues (Target: <5%)
- **Stale Issues**: Issues without updates for >30 days (Target: <10 issues)
- **Duplicate Detection**: Potential duplicate issues based on similarity
- **Completion Rate**: Percentage of issues completed within 30 days (Target: >80%)

### Health Score Calculation
The system calculates an overall health score (0-100) based on:
- Issue processing time (20 points)
- Label consistency (15 points)
- Project balance (10 points)
- Priority distribution (10 points)
- Completion rate (15 points)
- Stale issues (20 points)
- Unlabeled issues (10 points)

**Health Status Levels:**
- 90-100: Excellent ✅
- 70-89: Good 🟡
- 50-69: Fair 🟠
- 0-49: Poor ❌

## 🗓️ Triage Schedule

### Daily Triage (9:00 AM, 15-30 minutes)
- Review "To Process" queue
- Assign priorities and labels
- Move issues to appropriate states
- Add quality improvement comments

### Weekly Priority Review (Monday 10:00 AM, 30-45 minutes)
- Validate priority assignments
- Review effort estimates
- Identify blocked issues
- Plan upcoming work

### Monthly Workflow Review (First Monday 2:00 PM, 1-2 hours)
- Analyze project distribution
- Review label usage patterns
- Update automation rules
- Clean up stale issues

### Quarterly Assessment (First week, half day)
- Comprehensive metrics analysis
- Team feedback collection
- Strategic process improvements
- Documentation updates

## 🔧 Customization

### Adding New Automation Rules
1. Update `automation-config.json` with new rule definition
2. Implement rule logic in appropriate component
3. Test with sample data
4. Monitor effectiveness and adjust

### Creating Custom Templates
1. Define template structure in configuration
2. Add validation logic for required fields
3. Implement quality checks
4. Test with real issues

### Extending Metrics
1. Add new metric definitions to collector
2. Set appropriate thresholds
3. Include in health score calculation
4. Create visualizations and alerts

## 🚨 Troubleshooting

### Common Issues

#### Automation Not Working
- Verify LINEAR_API_KEY is set correctly
- Check team ID in configuration
- Review rule conditions and test data
- Monitor API rate limits

#### Template Validation Failing
- Check required fields in issue data
- Verify template format and placeholders
- Debug validation logic with test cases

#### Metrics Collection Errors
- Implement proper rate limiting
- Verify data access permissions
- Test calculations with known data

### Performance Optimization
- Use batch processing for large datasets
- Implement caching for frequently accessed data
- Add delays between API calls to respect rate limits
- Monitor and optimize query efficiency

## 📚 Documentation

### Complete Documentation
- [Workflow Guide](./documentation/workflow-guide.md) - Comprehensive system documentation
- [Quick Reference](./documentation/quick-reference.md) - Quick start and reference guide

### API Documentation
- [Linear SDK Documentation](https://developers.linear.app/docs/)
- [Automation Engine API](./workflows/automation-engine.js)
- [Triage Manager API](./workflows/triage-manager.js)
- [Metrics Collector API](./monitoring/metrics-collector.js)

## 🤝 Contributing

### Development Setup
```bash
# Install development dependencies
npm install --dev

# Run linting
npm run lint

# Run tests
npm test
```

### Code Style
- Use ESLint for code linting
- Follow Prettier formatting rules
- Write comprehensive JSDoc comments
- Include error handling and logging

### Submitting Changes
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit pull request with description

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🆘 Support

### Getting Help
- Review [troubleshooting section](#troubleshooting)
- Check [documentation](./documentation/)
- Create issue in repository
- Contact team administrators

### Escalation Path
1. Check documentation and troubleshooting guide
2. Review automation logs for errors
3. Create support issue with details
4. Mention team leads for urgent issues

## 🎯 Success Criteria

### Phase 2.3 Objectives
- ✅ Automated workflows operational and tested
- ✅ Issue templates implemented and adopted
- ✅ Triage processes documented and followed
- ✅ Monitoring dashboards active and useful
- ✅ Team trained and comfortable with new processes
- ✅ 90%+ issues properly labeled automatically
- ✅ <24 hour average time in "To Process" state

### Long-term Goals
- Maintain high workflow health score (>85)
- Reduce manual triage effort by 70%
- Improve issue quality and consistency
- Enable data-driven workflow optimization
- Support team scaling and productivity

---

**Version**: 1.0.0  
**Last Updated**: Phase 2.3 Implementation  
**Team**: Helaix (HLX)  
**Repository**: [helaix/agient_ops](https://github.com/helaix/agient_ops)

