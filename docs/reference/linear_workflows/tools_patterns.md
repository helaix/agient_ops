# Linear Tools & Patterns

## Essential Linear Tools

### Core Linear Functions
- **Issue Creation**: `linear_create_issue`
- **Issue Updates**: `linear_update_issue`
- **Comments**: `linear_comment_on_issue`
- **Search**: `linear_search_issues`
- **Team Management**: `linear_get_teams`, `linear_get_assignees`

### Issue Management Tools
```python
# Create new issue
linear_create_issue(
    title="Implement user authentication",
    description="Add OAuth2 authentication system",
    team_id="team-123",
    assignee_id="user-456"
)

# Update issue status
linear_update_issue(
    issue_id="issue-789",
    state_id="in-progress-state-id"
)

# Add comment
linear_comment_on_issue(
    issue_id="issue-789",
    body="Progress update: Authentication flow implemented"
)
```

### Search and Discovery
```python
# Find issues by title
linear_search_issues(
    title="authentication",
    limit=10
)

# Find issues by assignee
linear_search_issues(
    assignee_id="user-456",
    limit=20
)

# Find issues in specific state
linear_search_issues(
    state_id="in-progress-state-id",
    limit=15
)
```

## Common Patterns

### Issue Creation Pattern
```python
def create_feature_issue(feature_name, description, assignee):
    """Standard pattern for creating feature issues"""
    return linear_create_issue(
        title=f"Implement {feature_name}",
        description=f"""
## Objective
{description}

## Acceptance Criteria
- [ ] Feature implemented
- [ ] Tests written
- [ ] Documentation updated

## Definition of Done
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Deployed to staging
        """,
        assignee_id=assignee,
        self_assign=False
    )
```

### Progress Tracking Pattern
```python
def update_progress(issue_id, progress_message):
    """Standard pattern for progress updates"""
    linear_comment_on_issue(
        issue_id=issue_id,
        body=f"""
**Progress Update**

{progress_message}

**Next Steps**: [What's planned next]
**Blockers**: [Any current blockers]
**ETA**: [Estimated completion]
        """
    )
```

### Sub-Issue Creation Pattern
```python
def create_sub_issues(parent_issue_id, sub_tasks):
    """Create multiple sub-issues for complex tasks"""
    sub_issue_ids = []
    
    for task in sub_tasks:
        sub_issue = linear_create_issue(
            title=f"Sub-task: {task['title']}",
            description=f"""
## Parent Issue
{parent_issue_id}

## Objective
{task['description']}

## Dependencies
{task.get('dependencies', 'None')}
            """,
            parent_issue_id=parent_issue_id,
            self_assign=True
        )
        sub_issue_ids.append(sub_issue['id'])
    
    return sub_issue_ids
```

### Completion Pattern
```python
def complete_issue(issue_id, completion_summary):
    """Standard pattern for issue completion"""
    # Add completion comment
    linear_comment_on_issue(
        issue_id=issue_id,
        body=f"""
**Issue Complete** ✅

{completion_summary}

**Deliverables**:
- [List of completed items]

**Testing**: [Testing performed]
**Documentation**: [Documentation updated]
        """
    )
    
    # Update to done state
    done_state = linear_get_issue_states()['done']
    linear_update_issue(
        issue_id=issue_id,
        state_id=done_state['id']
    )
```

## Workflow Automation

### Automated State Transitions
```python
def auto_transition_on_pr(issue_id, pr_url):
    """Automatically transition issue when PR is created"""
    # Move to review state
    review_state = get_review_state_id()
    linear_update_issue(
        issue_id=issue_id,
        state_id=review_state
    )
    
    # Add PR link
    linear_comment_on_issue(
        issue_id=issue_id,
        body=f"Pull Request created: {pr_url}"
    )
```

### Batch Operations
```python
def bulk_update_issues(issue_ids, updates):
    """Update multiple issues with same changes"""
    for issue_id in issue_ids:
        linear_update_issue(
            issue_id=issue_id,
            **updates
        )
```

### Dependency Management
```python
def check_dependencies(issue_id):
    """Check if all dependencies are complete"""
    issue = linear_get_issue(issue_id)
    dependencies = extract_dependencies(issue['description'])
    
    for dep_id in dependencies:
        dep_issue = linear_get_issue(dep_id)
        if not is_complete(dep_issue):
            return False, f"Waiting on {dep_id}"
    
    return True, "All dependencies complete"
```

## Integration Patterns

### Git Integration
```python
def create_branch_from_issue(issue_id):
    """Create git branch based on Linear issue"""
    issue = linear_get_issue(issue_id)
    branch_name = f"feature/{issue['identifier'].lower()}-{slugify(issue['title'])}"
    
    # Create and checkout branch
    run_command(f"git checkout -b {branch_name}")
    
    # Update issue with branch info
    linear_comment_on_issue(
        issue_id=issue_id,
        body=f"Working branch created: `{branch_name}`"
    )
    
    return branch_name
```

### CI/CD Integration
```python
def update_issue_on_deployment(issue_id, environment, status):
    """Update issue when deployment completes"""
    linear_comment_on_issue(
        issue_id=issue_id,
        body=f"""
**Deployment Update**

Environment: {environment}
Status: {status}
Timestamp: {datetime.now().isoformat()}
        """
    )
```

## Error Handling Patterns

### Graceful Degradation
```python
def safe_linear_operation(operation, *args, **kwargs):
    """Safely execute Linear operations with fallback"""
    try:
        return operation(*args, **kwargs)
    except LinearAPIError as e:
        log_error(f"Linear API error: {e}")
        # Fallback to manual process
        return None
    except Exception as e:
        log_error(f"Unexpected error: {e}")
        raise
```

### Retry Logic
```python
def retry_linear_operation(operation, max_retries=3):
    """Retry Linear operations with exponential backoff"""
    for attempt in range(max_retries):
        try:
            return operation()
        except LinearAPIError as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)
```

## Performance Optimization

### Batch API Calls
```python
def batch_issue_updates(updates):
    """Batch multiple issue updates for efficiency"""
    # Group updates by type
    state_updates = []
    comment_updates = []
    
    for update in updates:
        if 'state_id' in update:
            state_updates.append(update)
        if 'comment' in update:
            comment_updates.append(update)
    
    # Execute batches
    execute_batch_state_updates(state_updates)
    execute_batch_comments(comment_updates)
```

### Caching Strategies
```python
def get_cached_team_info(team_id):
    """Cache team information to reduce API calls"""
    cache_key = f"team_{team_id}"
    
    if cache_key in cache:
        return cache[cache_key]
    
    team_info = linear_get_team(team_id)
    cache[cache_key] = team_info
    return team_info
```

