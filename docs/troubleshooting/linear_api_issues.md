# Troubleshooting Linear API Issues

## Overview

This guide addresses common issues encountered when working with the Linear API in agent workflows. Linear API issues typically manifest as errors when attempting to create, update, or retrieve information from Linear issues, comments, or other resources.

## Common Issues and Solutions

### 1. Authentication Failures

**Symptoms:**
- Error messages containing "Unauthorized" or "Authentication failed"
- HTTP 401 status codes
- Unable to access Linear resources despite having the correct permissions

**Resolution Steps:**
1. Verify that the Linear API key is valid and has not expired:
   ```bash
   # Test the API key with a simple curl request
   curl -H "Authorization: <YOUR_LINEAR_API_KEY>" https://api.linear.app/graphql
   ```

2. Check that the API key has the necessary scopes:
   ```bash
   # API keys should have read/write access for the operations you're performing
   # You can verify this in the Linear dashboard under Settings > API > Personal API keys
   ```

3. Regenerate the API key if necessary:
   ```bash
   # In Linear: Settings > API > Personal API keys > Revoke (for old key) > Create new key
   ```

4. Update the API key in your environment variables:
   ```bash
   export LINEAR_API_KEY=lin_api_your_new_key_here
   ```

**Preventive Measures:**
- Store API keys securely in environment variables or secrets management systems
- Implement proper error handling for authentication failures
- Set up monitoring for API key expiration
- Use scoped API keys with the minimum necessary permissions

### 2. Rate Limiting Issues

**Symptoms:**
- Error messages containing "Too many requests" or "Rate limit exceeded"
- HTTP 429 status codes
- Operations failing after a large number of API calls

**Resolution Steps:**
1. Implement exponential backoff and retry logic:
   ```javascript
   async function fetchWithRetry(url, options, maxRetries = 5) {
     let retries = 0;
     while (retries < maxRetries) {
       try {
         const response = await fetch(url, options);
         if (response.status !== 429) return response;
         
         // If rate limited, wait and retry
         const retryAfter = response.headers.get('Retry-After') || Math.pow(2, retries);
         console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
         await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
         retries++;
       } catch (error) {
         if (retries === maxRetries - 1) throw error;
         retries++;
       }
     }
   }
   ```

2. Batch API requests where possible:
   ```javascript
   // Instead of multiple single-issue queries
   const issueIds = ['ISSUE-1', 'ISSUE-2', 'ISSUE-3'];
   const query = `
     query Issues($ids: [ID!]!) {
       issues(ids: $ids) {
         id
         title
         description
       }
     }
   `;
   const variables = { ids: issueIds };
   ```

3. Implement caching for frequently accessed data:
   ```javascript
   const cache = new Map();
   
   async function getIssueWithCache(issueId) {
     if (cache.has(issueId)) {
       return cache.get(issueId);
     }
     
     const issue = await fetchIssue(issueId);
     cache.set(issueId, issue);
     return issue;
   }
   ```

**Preventive Measures:**
- Implement rate limiting on the client side to stay within API limits
- Use batch operations where possible
- Cache responses to reduce the number of API calls
- Spread out non-urgent API calls over time

### 3. GraphQL Query Syntax Errors

**Symptoms:**
- Error messages containing "Syntax Error" or "Invalid query"
- Unexpected or missing data in API responses
- Operations failing with error messages about specific fields or types

**Resolution Steps:**
1. Validate your GraphQL queries using the Linear API Explorer:
   - Visit https://studio.apollographql.com/sandbox/explorer
   - Set the endpoint to https://api.linear.app/graphql
   - Add your API key as a header: `Authorization: <YOUR_LINEAR_API_KEY>`
   - Test your queries interactively

2. Check for common syntax errors:
   ```graphql
   # Incorrect: Missing closing brace
   query {
     issues {
       id
       title
     
   # Correct
   query {
     issues {
       id
       title
     }
   }
   
   # Incorrect: Typo in field name
   query {
     issues {
       id
       titl
     }
   }
   
   # Correct
   query {
     issues {
       id
       title
     }
   }
   ```

3. Use a GraphQL client library with validation:
   ```javascript
   import { gql } from 'graphql-tag';
   
   // This will validate the query at compile time
   const ISSUES_QUERY = gql`
     query {
       issues {
         id
         title
         description
       }
     }
   `;
   ```

**Preventive Measures:**
- Use GraphQL code generation tools to create type-safe queries
- Implement query validation in your development workflow
- Keep a library of tested and validated queries
- Use the Linear API documentation as a reference for field names and types

### 4. Missing Required Fields

**Symptoms:**
- Error messages containing "Required field missing" or similar
- Operations failing when creating or updating Linear resources
- HTTP 400 status codes

**Resolution Steps:**
1. Check the Linear API documentation for required fields:
   - Visit https://developers.linear.app/docs/graphql/working-with-the-graphql-api
   - Review the schema for the resource you're working with

2. Ensure all required fields are included in your mutations:
   ```graphql
   # Incorrect: Missing required teamId field
   mutation {
     issueCreate(input: {
       title: "New Issue"
     }) {
       success
     }
   }
   
   # Correct
   mutation {
     issueCreate(input: {
       title: "New Issue",
       teamId: "TEAM_ID_HERE"
     }) {
       success
     }
   }
   ```

3. Implement validation before sending requests:
   ```javascript
   function validateIssueInput(input) {
     const requiredFields = ['title', 'teamId'];
     const missingFields = requiredFields.filter(field => !input[field]);
     
     if (missingFields.length > 0) {
       throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
     }
     
     return input;
   }
   ```

**Preventive Measures:**
- Create helper functions with built-in validation for common operations
- Use TypeScript or similar type systems to catch missing fields at compile time
- Maintain up-to-date documentation on required fields for your specific use cases
- Implement pre-request validation

### 5. Permission Issues

**Symptoms:**
- Error messages containing "Permission denied" or "Not authorized"
- Unable to perform operations on specific resources
- Operations working for some teams/projects but not others

**Resolution Steps:**
1. Verify that the API key has the necessary permissions:
   ```bash
   # Test with a simple query to check permissions
   curl -H "Authorization: <YOUR_LINEAR_API_KEY>" -X POST -d '{"query": "query { viewer { id name } }"}' https://api.linear.app/graphql
   ```

2. Check team and organization access:
   ```graphql
   # Query to check which teams you have access to
   query {
     teams {
       nodes {
         id
         name
         key
       }
     }
   }
   ```

3. Request additional permissions if necessary:
   - For organization-wide API keys, contact an organization admin
   - For personal API keys, ensure you have the necessary role in the team/organization

**Preventive Measures:**
- Document the required permissions for different operations
- Implement permission checking before attempting operations
- Use scoped API keys with appropriate permissions
- Maintain a clear understanding of your organization's permission structure

### 6. API Version Compatibility

**Symptoms:**
- Previously working queries suddenly failing
- Unexpected field values or missing fields
- Deprecation warnings in API responses

**Resolution Steps:**
1. Check for API changes in the Linear changelog:
   - Visit https://developers.linear.app/changelog

2. Update queries to use current field names and types:
   ```graphql
   # If a field has been renamed from 'state' to 'status'
   # Old query
   query {
     issues {
       id
       state {
         name
       }
     }
   }
   
   # Updated query
   query {
     issues {
       id
       status {
         name
       }
     }
   }
   ```

3. Handle deprecated fields gracefully:
   ```javascript
   function processIssue(issue) {
     // Handle both old and new field names
     const statusName = issue.status?.name || issue.state?.name;
     return {
       id: issue.id,
       title: issue.title,
       statusName
     };
   }
   ```

**Preventive Measures:**
- Subscribe to Linear API changelog and updates
- Regularly review and update API usage
- Implement feature detection rather than assuming field existence
- Use API versioning when available

## References

- [Linear API Documentation](https://developers.linear.app/docs/)
- [GraphQL API Reference](https://developers.linear.app/docs/graphql/working-with-the-graphql-api)
- [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md)
- [Communication and Delegation SOPs](../reference/communication_delegation_sops.md)

