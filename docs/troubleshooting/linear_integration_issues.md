# Troubleshooting Linear Integration Issues

## Overview

This guide addresses common issues encountered when integrating Linear with other tools and services in agent workflows. Integration issues typically occur when connecting Linear to version control systems, CI/CD pipelines, notification services, or other project management tools.

## Common Issues and Solutions

### 1. GitHub Integration Failures

**Symptoms:**

- Pull requests not being linked to Linear issues

- Branch names not appearing in Linear issues

- Status updates not syncing between GitHub and Linear

- Automated state transitions not working

**Resolution Steps:**
1. Verify the GitHub integration configuration:
   ```bash
   # Check if the GitHub integration is properly configured in Linear
   # Navigate to Settings > Integrations > GitHub in the Linear web interface
   ```

2. Ensure proper issue references in commit messages and PR titles:
   ```bash
   # Commit with Linear issue reference
   git commit -m "[ISSUE-123] Implement feature X"
   
   # Create PR with Linear issue reference in the title
   # "ISSUE-123: Implement feature X"
   ```

3. Manually link PRs to issues if automatic linking fails:
   ```javascript
   // Use the Linear API to attach a GitHub PR link
   await linear.attachmentCreate({
     issueId: "ISSUE_ID",
     title: "GitHub PR #123",
     url: "https://github.com/org/repo/pull/123"
   });
   ```

4. Check webhook configurations:
   ```bash
   # Verify webhook settings in GitHub
   # Navigate to repository settings > Webhooks
   # Ensure the Linear webhook is properly configured and receiving events
   
   # Test the webhook manually
   curl -X POST https://api.linear.app/github/webhook \
     -H "Content-Type: application/json" \
     -d '{"action": "test"}'
   ```

**Preventive Measures:**

- Document the correct format for commit messages and PR titles

- Implement pre-commit hooks to enforce Linear issue references

- Regularly verify integration status

- Create backup procedures for manual linking when needed

### 2. Slack Notification Issues

**Symptoms:**

- Missing notifications for Linear events

- Duplicate notifications

- Notifications appearing in the wrong channels

- Formatting issues in Slack notifications

**Resolution Steps:**
1. Verify Slack integration settings:
   ```bash
   # Check Linear settings
   # Navigate to Settings > Integrations > Slack in the Linear web interface
   
   # Ensure the correct channels are configured for notifications
   # Verify notification preferences for different event types
   ```

2. Test the Slack integration:
   ```javascript
   // Create a test issue to trigger notifications
   await linear.issueCreate({
     title: "[TEST] Slack notification test",
     description: "This is a test issue to verify Slack notifications.",
     teamId: "TEAM_ID"
   });
   ```

3. Configure custom notification rules if needed:
   ```bash
   # In Linear, navigate to Settings > Integrations > Slack
   # Click on "Configure" for the workspace
   # Set up custom notification rules for specific teams or projects
   ```

4. Use direct Slack API as a fallback:
   ```javascript
   // If Linear's Slack integration isn't working, use Slack API directly
   async function sendSlackNotification(channel, message) {
     await fetch('https://slack.com/api/chat.postMessage', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${process.env.SLACK_TOKEN}`
       },
       body: JSON.stringify({
         channel: channel,
         text: message,
         unfurl_links: false
       })
     });
   }
   
   // Example usage
   await sendSlackNotification("#project-channel", 
     "New issue created: ISSUE-123 - Implement feature X\n" +
     "https://linear.app/org/issue/ISSUE-123"
   );
   ```

**Preventive Measures:**

- Document expected notification behaviors

- Test notification flows after configuration changes

- Implement redundant notification mechanisms for critical updates

- Regularly audit notification settings

### 3. Webhook Integration Failures

**Symptoms:**

- Custom integrations not receiving Linear events

- Webhook endpoints returning errors

- Missing or delayed event processing

- Duplicate event processing

**Resolution Steps:**
1. Verify webhook configuration:
   ```bash
   # In Linear, navigate to Settings > API > Webhooks
   # Check that the webhook URL is correct
   # Verify that the appropriate event types are selected
   ```

2. Test webhook endpoint accessibility:
   ```bash
   # Test if the webhook endpoint is accessible
   curl -X POST https://your-webhook-endpoint.com \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   
   # Check the response status and body
   ```

3. Implement proper webhook verification:
   ```javascript
   // Express.js example for webhook verification
   app.post('/linear-webhook', (req, res) => {
     const signature = req.headers['linear-signature'];
     const payload = req.body;
     
     // Verify the webhook signature
     const isValid = verifyLinearWebhook(payload, signature, process.env.LINEAR_WEBHOOK_SECRET);
     
     if (!isValid) {
       console.error('Invalid webhook signature');
       return res.status(401).send('Invalid signature');
     }
     
     // Process the webhook payload
     console.log('Received valid webhook:', payload.type);
     
     // Respond quickly to Linear
     res.status(200).send('Webhook received');
     
     // Process the webhook asynchronously
     processWebhookAsync(payload).catch(console.error);
   });
   
   function verifyLinearWebhook(payload, signature, secret) {
     const hmac = crypto.createHmac('sha256', secret);
     const digest = hmac.update(JSON.stringify(payload)).digest('hex');
     return signature === digest;
   }
   ```

4. Implement idempotent webhook processing:
   ```javascript
   // Function to process webhooks idempotently
   async function processWebhookIdempotently(payload) {
     // Generate a deterministic ID for this event
     const eventId = payload.id || `${payload.type}-${payload.data.id}-${payload.updatedAt}`;
     
     // Check if we've already processed this event
     const alreadyProcessed = await checkEventProcessed(eventId);
     if (alreadyProcessed) {
       console.log(`Event ${eventId} already processed, skipping`);
       return;
     }
     
     try {
       // Process the event
       await processWebhookEvent(payload);
       
       // Mark as processed
       await markEventProcessed(eventId);
     } catch (error) {
       console.error(`Error processing event ${eventId}:`, error);
       // Depending on the error, you might want to retry or mark as failed
     }
   }
   ```

**Preventive Measures:**

- Implement proper webhook signature verification

- Process webhooks idempotently to handle duplicates

- Log all webhook events for debugging

- Set up monitoring for webhook processing

- Implement retry mechanisms for failed webhook processing

### 4. API Rate Limiting Issues

**Symptoms:**

- Integration failures during high-volume operations

- Error messages about rate limits

- Inconsistent behavior during peak usage times

- Timeouts or slow responses from integrations

**Resolution Steps:**
1. Implement rate limiting in your integration:
   ```javascript
   // Simple rate limiting with a queue
   class RateLimiter {
     constructor(maxRequestsPerSecond) {
       this.maxRequestsPerSecond = maxRequestsPerSecond;
       this.queue = [];
       this.processing = false;
     }
     
     async execute(fn) {
       return new Promise((resolve, reject) => {
         this.queue.push({ fn, resolve, reject });
         this.processQueue();
       });
     }
     
     async processQueue() {
       if (this.processing || this.queue.length === 0) return;
       
       this.processing = true;
       const item = this.queue.shift();
       
       try {
         const result = await item.fn();
         item.resolve(result);
       } catch (error) {
         item.reject(error);
       }
       
       this.processing = false;
       setTimeout(() => this.processQueue(), 1000 / this.maxRequestsPerSecond);
     }
   }
   
   // Usage
   const limiter = new RateLimiter(5); // 5 requests per second
   
   async function makeApiCall() {
     return limiter.execute(async () => {
       // Make the actual API call
       return fetch('https://api.linear.app/graphql', {...});
     });
   }
   ```

2. Implement exponential backoff for retries:
   ```javascript
   async function fetchWithBackoff(url, options, maxRetries = 5) {
     let retries = 0;
     
     while (true) {
       try {
         const response = await fetch(url, options);
         
         if (response.status !== 429) {
           return response;
         }
         
         // Rate limited, need to retry
         retries++;
         
         if (retries > maxRetries) {
           throw new Error(`Max retries (${maxRetries}) exceeded`);
         }
         
         // Get retry-after header or use exponential backoff
         const retryAfter = response.headers.get('Retry-After') || Math.pow(2, retries);
         console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
         
         // Wait before retrying
         await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
       } catch (error) {
         if (error.message.includes('Max retries')) throw error;
         
         retries++;
         if (retries > maxRetries) {
           throw error;
         }
         
         // Exponential backoff for network errors
         const backoff = Math.pow(2, retries);
         console.log(`Network error. Retrying after ${backoff} seconds...`);
         await new Promise(resolve => setTimeout(resolve, backoff * 1000));
       }
     }
   }
   ```

3. Batch API requests where possible:
   ```javascript
   // Instead of updating issues one by one
   async function batchUpdateIssues(issueIds, updateData) {
     // Prepare the mutations
     const mutations = issueIds.map((id, index) => `
       update${index}: issueUpdate(id: "${id}", input: {
         ${Object.entries(updateData).map(([key, value]) => 
           `${key}: ${JSON.stringify(value)}`
         ).join(', ')}
       }) {
         success
         issue {
           id
         }
       }
     `);
     
     // Execute as a single GraphQL request
     const query = `
       mutation BatchUpdate {
         ${mutations.join('\n')}
       }
     `;
     
     return fetch('https://api.linear.app/graphql', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': process.env.LINEAR_API_KEY
       },
       body: JSON.stringify({ query })
     });
   }
   ```

**Preventive Measures:**

- Implement rate limiting in all integrations

- Use batching for bulk operations

- Implement caching to reduce API calls

- Monitor API usage and adjust rate limits as needed

- Schedule non-urgent operations during off-peak times

### 5. Authentication Token Issues

**Symptoms:**

- Integration suddenly stops working

- Authentication errors in integration logs

- Expired or revoked tokens

- Permission errors for previously working operations

**Resolution Steps:**
1. Verify token validity:
   ```javascript
   // Test the API token with a simple request
   async function verifyToken(token) {
     try {
       const response = await fetch('https://api.linear.app/graphql', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': token
         },
         body: JSON.stringify({
           query: `
             query {
               viewer {
                 id
                 name
               }
             }
           `
         })
       });
       
       const data = await response.json();
       
       if (data.errors) {
         console.error('Token verification failed:', data.errors);
         return false;
       }
       
       console.log('Token valid for user:', data.data.viewer.name);
       return true;
     } catch (error) {
       console.error('Token verification error:', error);
       return false;
     }
   }
   ```

2. Implement token rotation:
   ```javascript
   // Function to rotate API tokens
   async function rotateApiToken() {
     // This would typically involve:
     // 1. Creating a new API token through the Linear UI or API
     // 2. Updating the token in your secure storage
     // 3. Updating all services that use the token
     
     console.log('Token rotation process:');
     console.log('1. Navigate to Linear > Settings > API > Personal API keys');
     console.log('2. Create a new API key with the necessary scopes');
     console.log('3. Update the API key in your environment variables or secrets manager');
     console.log('4. Revoke the old API key once the new one is confirmed working');
     
     // In a production system, you might automate this with admin APIs
   }
   ```

3. Use OAuth for more robust authentication:
   ```javascript
   // Express.js example for OAuth flow
   app.get('/auth/linear', (req, res) => {
     const redirectUri = `${process.env.APP_URL}/auth/linear/callback`;
     const scope = 'read,write,issues:create';
     
     const authUrl = `https://linear.app/oauth/authorize?client_id=${
       process.env.LINEAR_CLIENT_ID
     }&redirect_uri=${
       encodeURIComponent(redirectUri)
     }&scope=${
       encodeURIComponent(scope)
     }&response_type=code&state=${
       generateRandomState()  // Generate a random state for CSRF protection
     }`;
     
     res.redirect(authUrl);
   });
   
   app.get('/auth/linear/callback', async (req, res) => {
     const { code, state } = req.query;
     
     // Verify state to prevent CSRF attacks
     if (!verifyState(state)) {
       return res.status(400).send('Invalid state parameter');
     }
     
     try {
       // Exchange code for access token
       const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           client_id: process.env.LINEAR_CLIENT_ID,
           client_secret: process.env.LINEAR_CLIENT_SECRET,
           redirect_uri: `${process.env.APP_URL}/auth/linear/callback`,
           code,
           grant_type: 'authorization_code'
         })
       });
       
       const tokenData = await tokenResponse.json();
       
       // Store the access token securely
       await storeAccessToken(tokenData.access_token);
       
       res.redirect('/integration-success');
     } catch (error) {
       console.error('OAuth error:', error);
       res.status(500).send('Authentication failed');
     }
   });
   ```

**Preventive Measures:**

- Implement token validation checks in your integration

- Set up monitoring for authentication failures

- Document token rotation procedures

- Use OAuth where possible for more robust authentication

- Implement secure token storage

### 6. Data Synchronization Issues

**Symptoms:**

- Inconsistent data between Linear and integrated systems

- Missing updates in either system

- Duplicate entries or updates

- Conflicting information across systems

**Resolution Steps:**
1. Implement bidirectional sync verification:
   ```javascript
   // Function to verify data consistency between systems
   async function verifyDataConsistency(linearIssueId, externalSystemId) {
     // Fetch data from both systems
     const linearIssue = await fetchLinearIssue(linearIssueId);
     const externalItem = await fetchExternalItem(externalSystemId);
     
     // Compare key fields
     const inconsistencies = [];
     
     if (linearIssue.title !== externalItem.title) {
       inconsistencies.push({
         field: 'title',
         linear: linearIssue.title,
         external: externalItem.title
       });
     }
     
     if (linearIssue.description !== externalItem.description) {
       inconsistencies.push({
         field: 'description',
         linear: linearIssue.description,
         external: externalItem.description
       });
     }
     
     // Check status mapping
     const mappedStatus = mapLinearStateToExternal(linearIssue.state.name);
     if (mappedStatus !== externalItem.status) {
       inconsistencies.push({
         field: 'status',
         linear: linearIssue.state.name,
         linearMapped: mappedStatus,
         external: externalItem.status
       });
     }
     
     return {
       consistent: inconsistencies.length === 0,
       inconsistencies
     };
   }
   ```

2. Implement a reconciliation process:
   ```javascript
   // Function to reconcile inconsistencies
   async function reconcileData(linearIssueId, externalSystemId, reconciliationStrategy = 'linear-wins') {
     const { consistent, inconsistencies } = await verifyDataConsistency(linearIssueId, externalSystemId);
     
     if (consistent) {
       console.log('Data is already consistent');
       return { success: true, changes: [] };
     }
     
     const changes = [];
     
     for (const inconsistency of inconsistencies) {
       let resolution;
       
       if (reconciliationStrategy === 'linear-wins') {
         // Update external system with Linear data
         resolution = await updateExternalField(
           externalSystemId, 
           inconsistency.field, 
           inconsistency.linear
         );
       } else if (reconciliationStrategy === 'external-wins') {
         // Update Linear with external system data
         resolution = await updateLinearField(
           linearIssueId, 
           inconsistency.field, 
           inconsistency.external
         );
       } else if (reconciliationStrategy === 'newest-wins') {
         // Compare timestamps and update the older system
         // This would require additional timestamp data
       }
       
       changes.push({
         field: inconsistency.field,
         resolution
       });
     }
     
     return { success: true, changes };
   }
   ```

3. Implement change tracking for debugging:
   ```javascript
   // Function to log sync events for debugging
   async function logSyncEvent(linearIssueId, externalSystemId, event) {
     await db.syncEvents.insert({
       timestamp: new Date(),
       linearIssueId,
       externalSystemId,
       event,
       details: JSON.stringify(event.details || {})
     });
   }
   
   // Usage
   await logSyncEvent(
     'LINEAR-123', 
     'JIRA-456', 
     {
       type: 'sync-conflict',
       field: 'status',
       linearValue: 'In Progress',
       externalValue: 'In Review',
       resolution: 'linear-value-applied'
     }
   );
   ```

**Preventive Measures:**

- Implement consistent field mapping between systems

- Use webhooks for real-time updates

- Implement periodic reconciliation checks

- Maintain detailed sync logs for debugging

- Document conflict resolution strategies

## References


- [Linear API Documentation](https://developers.linear.app/docs/)

- [Linear Webhooks Guide](https://developers.linear.app/docs/graphql/webhooks)

- [Linear OAuth Documentation](https://developers.linear.app/docs/oauth/oauth)

- [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md)

- [Communication and Delegation SOPs](../reference/communication_delegation_sops.md)



## Related Resources

- [Common Linear Workflow Issues and Solutions](common_linear_issues.md)
- [Linear Workflows Reference Guide](../reference/linear_workflows_reference.md)
