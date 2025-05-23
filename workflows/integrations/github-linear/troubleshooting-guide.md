# GitHub-Linear Sync Troubleshooting Guide

This guide provides solutions for common issues encountered when implementing and using the GitHub-Linear synchronization system.

## Authentication Issues

### Problem: "Failed to get team ID" Error

**Symptoms:**
- Script exits with "Failed to get team ID" error
- No issues are created in Linear

**Possible Causes:**
- Invalid Linear API key
- API key lacks necessary permissions
- Network connectivity issues

**Solutions:**
1. Verify the LINEAR_API_KEY environment variable is correctly set
2. Check that the API key is valid and has not expired
3. Ensure the API key has appropriate permissions for issue creation
4. Test API connectivity with a simple query:
   ```
   curl -s -X POST -H "Content-Type: application/json" -H "Authorization: $LINEAR_API_KEY" \
     --data '{"query": "query { teams { nodes { id name key } } }"}'
   ```

## Parsing Issues

### Problem: "Failed to parse epic data" Error

**Symptoms:**
- Script reports "Failed to parse epic data" for specific workplans
- Some workplans sync correctly while others fail

**Possible Causes:**
- Inconsistent metadata format in workplans
- Missing required sections in workplan
- Malformed markdown structure

**Solutions:**
1. Verify the workplan follows the standardized format
2. Check for required sections:
   - Workplan ID
   - Chunk Title
   - Description
   - Key Tasks / Sub-Chunks
3. Ensure metadata is properly formatted:
   ```markdown
   ### Workplan ID
   `P0-CORE-001`
   
   ### Chunk Title
   Environment Setup, Monorepo & IaC Configuration
   ```
4. Validate task references follow the correct format:
   ```markdown
   * [C0.1.1](tasks/C0.1.1.md) - (Initialize Monorepo)
   ```

## Dependency Issues

### Problem: Dependencies Not Created

**Symptoms:**
- Script reports successful task creation but dependencies are not established
- Verification step shows "NO" for dependency checks

**Possible Causes:**
- GraphQL mutation format issues
- API permission limitations
- Linear API changes

**Solutions:**
1. Verify the GraphQL mutation uses the correct relation type (`blocks` lowercase)
2. Check API key has permissions for creating relationships
3. Test dependency creation with a simple mutation:
   ```
   curl -s -X POST -H "Content-Type: application/json" -H "Authorization: $LINEAR_API_KEY" \
     --data '{"query": "mutation($blockingId: String!, $blockedId: String!) { issueRelationCreate(input: { issueId: $blockedId, relatedIssueId: $blockingId, type: blocks }) { success } }", "variables": {"blockingId": "BLOCKING_ISSUE_ID", "blockedId": "BLOCKED_ISSUE_ID"}}'
   ```
4. Verify the issue IDs being used are correct

### Problem: Circular Dependencies

**Symptoms:**
- Script reports errors when creating certain dependencies
- Error messages mention circular dependencies

**Possible Causes:**
- Workplan task order creates circular references
- Previous synchronization created conflicting dependencies

**Solutions:**
1. Review workplan task order to ensure no circular references
2. Check existing dependencies in Linear before creating new ones
3. Implement validation to detect potential circular dependencies
4. Clear existing dependencies before re-synchronizing if necessary

## Project Association Issues

### Problem: Issues Not Associated with Project

**Symptoms:**
- Issues are created but not associated with the expected project
- Project field is null in Linear issues

**Possible Causes:**
- Project name mismatch
- Project does not exist in Linear
- Parsing error for project metadata

**Solutions:**
1. Verify project exists in Linear with the expected name
2. Check project name extraction from PRD Phase Alignment
3. Test project lookup with a simple query:
   ```
   curl -s -X POST -H "Content-Type: application/json" -H "Authorization: $LINEAR_API_KEY" \
     --data '{"query": "query { projects { nodes { id name } } }"}'
   ```
4. Ensure project ID is correctly passed to issue creation mutations

## GitHub Action Issues

### Problem: Workflow Fails to Run

**Symptoms:**
- GitHub Action workflow does not trigger on workplan changes
- Manual workflow runs fail

**Possible Causes:**
- Incorrect path configuration in workflow triggers
- Missing secrets in GitHub repository
- Script errors not visible in workflow logs

**Solutions:**
1. Verify workflow trigger paths match workplan location:
   ```yaml
   on:
     push:
       paths:
         - 'workplans/**/*.md'
   ```
2. Check LINEAR_API_KEY is set as a repository secret
3. Add debug logging to script and workflow
4. Test workflow with workflow_dispatch trigger and specific epic ID

### Problem: Partial Synchronization

**Symptoms:**
- Some workplans sync successfully while others fail
- Workflow completes but with errors

**Possible Causes:**
- Inconsistent workplan formats
- API rate limiting
- Transient network issues

**Solutions:**
1. Implement better error handling to continue after individual failures
2. Add retry logic for API calls
3. Implement batching to handle rate limits
4. Add detailed logging for failed workplans
5. Consider implementing transaction-like behavior with rollback capability

## Verification Issues

### Problem: Unable to Verify Synchronization

**Symptoms:**
- Uncertainty about whether synchronization was successful
- Difficulty identifying specific issues or relationships

**Possible Causes:**
- Lack of verification mechanisms
- Incomplete logging
- Complex relationship structure

**Solutions:**
1. Implement comprehensive verification queries
2. Create a verification report after synchronization
3. Add visual representation of created issues and relationships
4. Implement a dashboard for monitoring synchronization status
5. Use Linear's GraphQL API to verify specific aspects:
   ```
   # Verify epic creation
   curl -s -X POST -H "Content-Type: application/json" -H "Authorization: $LINEAR_API_KEY" \
     --data '{"query": "query { issues(filter: {team: {key: {eq: \"HLX\"}}, labels: {name: {eq: \"Epic\"}}}) { nodes { identifier title } } }"}'
   
   # Verify dependencies
   curl -s -X POST -H "Content-Type: application/json" -H "Authorization: $LINEAR_API_KEY" \
     --data '{"query": "query($id: String!) { issue(id: $id) { relations { nodes { type relatedIssue { identifier } } } } }", "variables": {"id": "ISSUE_ID"}}'
   ```

## Maintenance Issues

### Problem: Synchronization Breaks After Updates

**Symptoms:**
- Previously working synchronization starts failing
- New workplans don't sync correctly

**Possible Causes:**
- Linear API changes
- Workplan format changes
- Script dependencies outdated

**Solutions:**
1. Monitor Linear API announcements for changes
2. Implement version checking for workplan formats
3. Regularly test synchronization with sample workplans
4. Create a test suite for verification
5. Document and enforce workplan format standards
6. Implement graceful degradation for non-critical features

## Recovery Procedures

### Full Resynchronization

If synchronization becomes severely out of sync or corrupted:

1. **Backup Current State**
   - Export current Linear issues for reference
   - Document existing relationships

2. **Clean Up Linear (Optional)**
   - Archive or delete issues to be resynchronized
   - Note: Only do this if starting fresh is necessary

3. **Verify Workplans**
   - Ensure all workplans follow the standardized format
   - Fix any inconsistencies or errors

4. **Run Full Synchronization**
   - Trigger manual synchronization for all workplans
   - Monitor progress and address any errors

5. **Verify Results**
   - Check that all expected issues are created
   - Verify hierarchical relationships
   - Confirm dependencies are correctly established

### Selective Resynchronization

For issues with specific workplans:

1. **Identify Affected Workplans**
   - Determine which workplans need resynchronization

2. **Clean Up Related Issues (Optional)**
   - Archive or delete specific issues to be resynchronized
   - Note: Only do this if starting fresh is necessary for these issues

3. **Run Selective Synchronization**
   - Trigger manual synchronization for specific epic IDs
   - Monitor progress and address any errors

4. **Verify Results**
   - Check that affected issues are correctly created
   - Verify relationships with existing issues

## Preventative Measures

To minimize synchronization issues:

1. **Standardize Workplan Format**
   - Create and enforce templates for workplans
   - Implement validation for workplan format

2. **Regular Verification**
   - Schedule periodic verification of synchronization integrity
   - Create automated health checks

3. **Monitoring and Alerting**
   - Implement monitoring for synchronization failures
   - Set up alerts for critical issues

4. **Documentation and Training**
   - Ensure team members understand workplan requirements
   - Document common issues and solutions

5. **Continuous Improvement**
   - Regularly review and enhance synchronization process
   - Incorporate feedback from users

