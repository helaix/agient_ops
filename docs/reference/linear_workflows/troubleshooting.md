# Linear Troubleshooting Guide

## Common Issues and Solutions

### Issue Creation Problems

#### Problem: "Permission denied" when creating issues
**Solution:**
1. Verify you have the correct team permissions
2. Check if you're using the right team ID
3. Ensure your Linear API key has proper scope

#### Problem: Issue creation fails with validation errors
**Solution:**
1. Check required fields are provided
2. Verify team_id exists and is accessible
3. Ensure assignee_id is valid for the team
4. Validate title length (must be under 255 characters)

### API Connection Issues

#### Problem: Linear API timeouts or connection errors
**Solution:**
```python
# Implement retry logic
import time
from functools import wraps

def retry_on_failure(max_retries=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(delay * (2 ** attempt))
            return None
        return wrapper
    return decorator

@retry_on_failure()
def safe_linear_call():
    return linear_create_issue(...)
```

#### Problem: Rate limiting errors
**Solution:**
1. Implement exponential backoff
2. Batch API calls when possible
3. Cache frequently accessed data
4. Monitor API usage patterns

### Search and Discovery Issues

#### Problem: Search returns no results for known issues
**Solution:**
1. Check search parameters are correct
2. Verify issue exists in the specified team
3. Try broader search terms
4. Check if issue is archived or deleted

#### Problem: Search results are incomplete
**Solution:**
1. Increase the limit parameter
2. Use pagination for large result sets
3. Refine search criteria
4. Check team access permissions

### State Management Problems

#### Problem: Cannot update issue state
**Solution:**
1. Verify state_id exists for the team
2. Check if state transition is allowed
3. Ensure you have permission to update the issue
4. Validate the issue is not locked or archived

#### Problem: State changes not reflecting immediately
**Solution:**
1. Add small delay after state updates
2. Refresh issue data before checking state
3. Use webhooks for real-time updates
4. Implement polling for critical state changes

### Comment and Communication Issues

#### Problem: Comments not appearing on issues
**Solution:**
1. Verify issue_id is correct
2. Check comment body is not empty
3. Ensure proper formatting (Markdown supported)
4. Validate API permissions for commenting

#### Problem: Mentions not working in comments
**Solution:**
1. Use correct user ID format
2. Verify mentioned user has access to the issue
3. Check team membership for mentioned users
4. Use @[user_id] format for mentions

## Debugging Strategies

### API Response Debugging
```python
def debug_linear_call(func, *args, **kwargs):
    """Debug Linear API calls with detailed logging"""
    try:
        print(f"Calling {func.__name__} with args: {args}, kwargs: {kwargs}")
        result = func(*args, **kwargs)
        print(f"Success: {result}")
        return result
    except Exception as e:
        print(f"Error in {func.__name__}: {e}")
        print(f"Error type: {type(e)}")
        raise
```

### Issue Data Validation
```python
def validate_issue_data(issue_data):
    """Validate issue data before API calls"""
    required_fields = ['title']
    optional_fields = ['description', 'assignee_id', 'team_id']
    
    # Check required fields
    for field in required_fields:
        if field not in issue_data or not issue_data[field]:
            raise ValueError(f"Required field missing: {field}")
    
    # Validate field lengths
    if len(issue_data['title']) > 255:
        raise ValueError("Title too long (max 255 characters)")
    
    # Validate IDs format
    if 'team_id' in issue_data:
        if not issue_data['team_id'].startswith('team_'):
            raise ValueError("Invalid team_id format")
    
    return True
```

### Network Connectivity Testing
```python
def test_linear_connectivity():
    """Test basic Linear API connectivity"""
    try:
        teams = linear_get_teams()
        print(f"✅ Connected successfully. Found {len(teams)} teams.")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False
```

## Performance Troubleshooting

### Slow API Responses
1. **Check Network Latency**: Test connection speed to Linear API
2. **Optimize Queries**: Use specific filters to reduce data transfer
3. **Implement Caching**: Cache frequently accessed data locally
4. **Batch Operations**: Group multiple API calls together

### Memory Usage Issues
1. **Limit Result Sets**: Use pagination for large queries
2. **Clear Caches**: Regularly clear cached data
3. **Stream Large Responses**: Process large datasets incrementally
4. **Monitor Memory Usage**: Track memory consumption patterns

## Escalation Path

### Level 1: Self-Service Resolution
1. Check this troubleshooting guide
2. Review Linear API documentation
3. Test with minimal examples
4. Check system status pages

### Level 2: Team Support
1. Post in team chat with specific error details
2. Include relevant code snippets and error messages
3. Provide steps to reproduce the issue
4. Tag relevant team members

### Level 3: Linear Support
1. Contact Linear support with detailed issue description
2. Provide API logs and error traces
3. Include account and team information
4. Describe business impact and urgency

### Level 4: Critical Escalation
1. For production-impacting issues
2. Contact on-call engineer
3. Create incident ticket
4. Implement temporary workarounds

## Prevention Strategies

### Proactive Monitoring
```python
def monitor_linear_health():
    """Monitor Linear API health and performance"""
    metrics = {
        'api_response_time': measure_api_response_time(),
        'error_rate': calculate_error_rate(),
        'rate_limit_usage': check_rate_limit_status()
    }
    
    # Alert if thresholds exceeded
    if metrics['api_response_time'] > 5000:  # 5 seconds
        alert_slow_api()
    
    if metrics['error_rate'] > 0.05:  # 5% error rate
        alert_high_errors()
    
    return metrics
```

### Error Logging
```python
import logging

def setup_linear_logging():
    """Configure comprehensive logging for Linear operations"""
    logger = logging.getLogger('linear_operations')
    logger.setLevel(logging.INFO)
    
    # File handler for persistent logs
    file_handler = logging.FileHandler('linear_operations.log')
    file_handler.setLevel(logging.INFO)
    
    # Console handler for immediate feedback
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.WARNING)
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger
```

### Best Practices for Reliability
1. **Always Validate Input**: Check data before API calls
2. **Implement Retries**: Handle transient failures gracefully
3. **Use Timeouts**: Prevent hanging operations
4. **Log Everything**: Maintain detailed operation logs
5. **Test Regularly**: Verify API functionality periodically
6. **Monitor Metrics**: Track performance and error rates
7. **Have Fallbacks**: Plan for API unavailability
8. **Document Issues**: Keep record of problems and solutions

