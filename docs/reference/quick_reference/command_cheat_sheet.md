# Command Cheat Sheet: Linear and GitHub

This cheat sheet provides a comprehensive reference for common Linear and GitHub commands used by agents in their daily workflows. It includes command syntax, parameters, common use cases, examples, and potential limitations or gotchas.

## Table of Contents

1. [Linear Commands](#linear-commands)
   - [Issue Management](#issue-management)
   - [Comment and Communication](#comment-and-communication)
   - [State and Workflow Management](#state-and-workflow-management)
   - [Integration with Other Tools](#linear-integration-with-other-tools)

2. [GitHub Commands](#github-commands)
   - [Repository Management](#repository-management)
   - [Branch and Commit Operations](#branch-and-commit-operations)
   - [PR Creation and Management](#pr-creation-and-management)
   - [Code Review](#code-review)
   - [GitHub Actions and CI/CD](#github-actions-and-cicd)

3. [Command Combinations for Common Workflows](#command-combinations-for-common-workflows)

---

## Linear Commands

### Issue Management

#### `linear_create_issue`
**Description:** Creates a new Linear issue.

**Syntax:**
```
linear_create_issue(
    title="Issue title",
    description="Optional description of the issue",
    team_id="Optional team ID",
    assignee_id="Optional assignee ID",
    parent_issue_id="Optional parent issue ID",
    self_assign=False
)
```

**Parameters:**
- `title` (required): Title of the issue
- `description` (optional): Description of the issue
- `team_id` (optional): Team ID to assign the issue to
- `assignee_id` (optional): User ID to assign the issue to
- `parent_issue_id` (optional): Parent issue ID if creating a sub-issue
- `self_assign` (optional): Boolean to assign the issue to the bot (default: False)

**Common Use Cases:**
- Creating new tasks or issues
- Creating sub-issues for larger tasks
- Assigning issues to team members

**Example:**
```
linear_create_issue(
    title="Implement user authentication",
    description="Add user authentication functionality to the login page",
    self_assign=True
)
```

**Limitations/Gotchas:**
- If both `assignee_id` and `self_assign` are provided, `assignee_id` takes precedence
- Team ID is optional but recommended for proper organization
- Descriptions support Markdown formatting

#### `linear_get_issue`
**Description:** Retrieves details of a Linear issue by its ID.

**Syntax:**
```
linear_get_issue(issue_id="ISSUE_ID")
```

**Parameters:**
- `issue_id` (required): ID of the Linear issue to retrieve

**Common Use Cases:**
- Retrieving issue details for reference
- Checking issue status
- Accessing issue metadata

**Example:**
```
linear_get_issue(issue_id="LIN-123")
```

**Limitations/Gotchas:**
- Requires the exact issue ID
- Returns only the issue details, not comments (use `linear_get_issue_comments` for that)

#### `linear_update_issue`
**Description:** Updates an existing Linear issue.

**Syntax:**
```
linear_update_issue(
    issue_id="ISSUE_ID",
    title="New title",
    description="New description",
    state_id="New state ID",
    assignee_id="New assignee ID",
    priority=1,
    label_ids=["LABEL_ID1", "LABEL_ID2"],
    team_id="New team ID",
    project_id="New project ID"
)
```

**Parameters:**
- `issue_id` (required): ID of the issue to update
- `title` (optional): New title for the issue
- `description` (optional): New description for the issue
- `state_id` (optional): New state ID for the issue
- `assignee_id` (optional): New assignee ID for the issue
- `priority` (optional): New priority for the issue (0-4)
- `label_ids` (optional): New label IDs for the issue
- `team_id` (optional): New team ID for the issue
- `project_id` (optional): New project ID for the issue

**Common Use Cases:**
- Changing issue status
- Reassigning issues
- Updating issue details
- Adding labels or changing priority

**Example:**
```
linear_update_issue(
    issue_id="LIN-123",
    state_id="STATE_ID_IN_PROGRESS",
    priority=2
)
```

**Limitations/Gotchas:**
- Only specified parameters will be updated
- Omitted parameters will remain unchanged
- Priority values range from 0 (no priority) to 4 (urgent)

#### `linear_self_assign`
**Description:** Self-assigns a Linear issue to the bot.

**Syntax:**
```
linear_self_assign(override_assignee=False)
```

**Parameters:**
- `override_assignee` (optional): Whether to override the assignee if the issue is already assigned (default: False)

**Common Use Cases:**
- Taking ownership of an issue
- Indicating that work has begun on an issue

**Example:**
```
linear_self_assign(override_assignee=True)
```

**Limitations/Gotchas:**
- By default, won't override existing assignees unless `override_assignee=True`
- Only works in the context of an existing issue

#### `linear_search_issues`
**Description:** Searches for Linear issues with flexible filtering options.

**Syntax:**
```
linear_search_issues(
    title="Search string",
    description="Search string",
    assignee_id="ASSIGNEE_ID",
    team_id="TEAM_ID",
    state_id="STATE_ID",
    project_id="PROJECT_ID",
    limit=10
)
```

**Parameters:**
- `title` (optional): String to search in issue titles
- `description` (optional): String to search in issue descriptions
- `assignee_id` (optional): Assignee user ID to filter by
- `team_id` (optional): Team ID to filter by
- `state_id` (optional): State ID to filter by
- `project_id` (optional): Project ID to filter by
- `limit` (optional): Maximum number of issues to return (default: 10)

**Common Use Cases:**
- Finding issues by keyword
- Filtering issues by assignee, team, or state
- Gathering issues for a specific project

**Example:**
```
linear_search_issues(
    title="authentication",
    state_id="STATE_ID_TODO",
    limit=20
)
```

**Limitations/Gotchas:**
- Search is case-insensitive but not fuzzy
- Returns at most the number of issues specified by `limit`
- At least one search parameter should be provided for effective filtering

### Comment and Communication

#### `linear_comment_on_issue`
**Description:** Adds a comment to a Linear issue.

**Syntax:**
```
linear_comment_on_issue(
    issue_id="ISSUE_ID",
    body="Comment text"
)
```

**Parameters:**
- `issue_id` (required): ID of the Linear issue to comment on
- `body` (required): The comment text

**Common Use Cases:**
- Providing updates on issue progress
- Asking questions about an issue
- Documenting decisions or context

**Example:**
```
linear_comment_on_issue(
    issue_id="LIN-123",
    body="I've started working on this issue. Will update with progress soon."
)
```

**Limitations/Gotchas:**
- Comments support Markdown formatting
- Long comments are allowed but may be difficult to read in the Linear UI

#### `linear_get_issue_comments`
**Description:** Gets all comments on a Linear issue.

**Syntax:**
```
linear_get_issue_comments(issue_id="ISSUE_ID")
```

**Parameters:**
- `issue_id` (required): ID of the Linear issue to get comments for

**Common Use Cases:**
- Reviewing discussion history
- Gathering context from previous comments
- Checking if a question has already been answered

**Example:**
```
linear_get_issue_comments(issue_id="LIN-123")
```

**Limitations/Gotchas:**
- Returns all comments in chronological order
- May return a large amount of data for issues with extensive discussion

#### `send_message`
**Description:** Sends a message via Linear comment.

**Syntax:**
```
send_message(
    content="Message to send",
    request_feedback=True
)
```

**Parameters:**
- `content` (required): Message to send to user
- `request_feedback` (required): Request feedback from the user (renders thumbs up/down buttons)

**Common Use Cases:**
- Responding to user queries
- Providing updates on task progress
- Requesting feedback on completed work

**Example:**
```
send_message(
    content="I've completed the requested changes. You can review them in the PR linked above.",
    request_feedback=True
)
```

**Limitations/Gotchas:**
- Messages support Markdown formatting
- Should be used for final responses or significant updates
- Set `request_feedback=True` when you want explicit user feedback

### State and Workflow Management

#### `linear_get_issue_states`
**Description:** Gets all states for issues in a team.

**Syntax:**
```
linear_get_issue_states(team_id="TEAM_ID")
```

**Parameters:**
- `team_id` (optional): Team ID to get issue states for

**Common Use Cases:**
- Understanding available workflow states
- Getting state IDs for updating issues
- Mapping state names to IDs

**Example:**
```
linear_get_issue_states(team_id="TEAM_ID")
```

**Limitations/Gotchas:**
- If `team_id` is not provided, uses the default team ID
- Different teams may have different workflow states

#### `linear_get_active_cycle`
**Description:** Gets the active cycle for a Linear team.

**Syntax:**
```
linear_get_active_cycle(team_id="TEAM_ID")
```

**Parameters:**
- `team_id` (optional): ID of the team to get active cycle for

**Common Use Cases:**
- Finding the current sprint or cycle
- Getting cycle information for planning
- Checking cycle dates and status

**Example:**
```
linear_get_active_cycle(team_id="TEAM_ID")
```

**Limitations/Gotchas:**
- Returns `null` if there is no active cycle
- If `team_id` is not provided, uses the default team ID

#### `linear_get_cycles`
**Description:** Gets all cycles for a Linear team.

**Syntax:**
```
linear_get_cycles(team_id="TEAM_ID")
```

**Parameters:**
- `team_id` (optional): ID of the team to get cycles for

**Common Use Cases:**
- Planning future work
- Reviewing past cycles
- Getting cycle IDs for issue assignment

**Example:**
```
linear_get_cycles(team_id="TEAM_ID")
```

**Limitations/Gotchas:**
- If `team_id` is not provided, uses the default team ID
- May return a large amount of data for teams with many cycles

#### `linear_get_cycle_issues`
**Description:** Gets all issues in a Linear cycle.

**Syntax:**
```
linear_get_cycle_issues(cycle_id="CYCLE_ID")
```

**Parameters:**
- `cycle_id` (required): ID of the cycle to get issues for

**Common Use Cases:**
- Reviewing cycle content
- Tracking cycle progress
- Generating cycle reports

**Example:**
```
linear_get_cycle_issues(cycle_id="CYCLE_ID")
```

**Limitations/Gotchas:**
- Returns all issues regardless of state
- May return a large amount of data for cycles with many issues

#### `linear_assign_issue_to_cycle`
**Description:** Assigns a Linear issue to a cycle.

**Syntax:**
```
linear_assign_issue_to_cycle(
    issue_id="ISSUE_ID",
    cycle_id="CYCLE_ID"
)
```

**Parameters:**
- `issue_id` (required): ID of the issue to assign
- `cycle_id` (required): ID of the cycle to assign to

**Common Use Cases:**
- Planning sprint content
- Adding issues to the current cycle
- Moving issues between cycles

**Example:**
```
linear_assign_issue_to_cycle(
    issue_id="LIN-123",
    cycle_id="CYCLE_ID"
)
```

**Limitations/Gotchas:**
- Issues can only be assigned to one cycle at a time
- Assigning to a new cycle will remove from any previous cycle

### Linear Integration with Other Tools

#### `linear_attach_link`
**Description:** Attaches a link to a Linear issue.

**Syntax:**
```
linear_attach_link(
    url="URL",
    title="Link title"
)
```

**Parameters:**
- `url` (required): URL of the link to attach to the Linear issue
- `title` (required): Title of the link to attach to the Linear issue

**Common Use Cases:**
- Linking PRs to issues
- Attaching design documents
- Connecting external resources

**Example:**
```
linear_attach_link(
    url="https://github.com/org/repo/pull/123",
    title="PR: Implement user authentication"
)
```

**Limitations/Gotchas:**
- Works in the context of an existing issue
- Links are displayed in the issue sidebar
- Duplicate links are allowed but may cause confusion

#### `send_agent_message`
**Description:** Sends a message to another agent, interrupting its execution flow.

**Syntax:**
```
send_agent_message(
    agent_id="AGENT_ID",
    message="Message text"
)
```

**Parameters:**
- `agent_id` (required): The ID of the agent to send a message to
- `message` (required): The message to send to the agent

**Common Use Cases:**
- Coordinating between parent and child agents
- Providing updates to parent agents
- Requesting information from other agents

**Example:**
```
send_agent_message(
    agent_id="21732",
    message="I've completed the research on Linear commands. Moving on to GitHub commands now."
)
```

**Limitations/Gotchas:**
- Requires knowing the target agent's ID
- Should be used judiciously to avoid disrupting agent workflows
- Best used for significant updates or coordination points

---

## GitHub Commands

### Repository Management

#### `set_active_codebase`
**Description:** Selects a codebase to be "active" for subsequent operations.

**Syntax:**
```
set_active_codebase(repo_name="REPO_NAME")
```

**Parameters:**
- `repo_name` (required): Codebase or repository name (without organization)

**Common Use Cases:**
- Switching between repositories
- Setting the context for code operations
- Preparing for file operations

**Example:**
```
set_active_codebase(repo_name="agient_ops")
```

**Limitations/Gotchas:**
- Requires only the repo name, not the full org/repo path
- All subsequent operations will be on this codebase until changed
- Repository must be accessible to the agent

#### `view_all_repos`
**Description:** Views all repositories in the organization with detailed information.

**Syntax:**
```
view_all_repos(
    page=1,
    repos_per_page=10
)
```

**Parameters:**
- `page` (optional): Page number to return (default: 1)
- `repos_per_page` (optional): Number of repositories per page (default: 10)

**Common Use Cases:**
- Discovering available repositories
- Finding repository details
- Checking repository access

**Example:**
```
view_all_repos(repos_per_page=20)
```

**Limitations/Gotchas:**
- Paginated results may require multiple calls for large organizations
- Only shows repositories the agent has access to

#### `view_repo_history`
**Description:** Views the recent commit history for the codebase.

**Syntax:**
```
view_repo_history(
    num_commits=10,
    since="2023-01-01T00:00:00Z"
)
```

**Parameters:**
- `num_commits` (optional): Number of commits to show when `since` is not provided (default: 10)
- `since` (optional): The date to view commits from (ISO format)

**Common Use Cases:**
- Reviewing recent changes
- Understanding project history
- Identifying active contributors

**Example:**
```
view_repo_history(num_commits=20)
```

**Limitations/Gotchas:**
- If `since` is provided, `num_commits` is ignored
- Limited to the active codebase
- May be slow for repositories with extensive history

#### `search_all_repos`
**Description:** Searches for code across all repositories in the organization.

**Syntax:**
```
search_all_repos(
    query="SEARCH_QUERY",
    max_results=20
)
```

**Parameters:**
- `query` (required): Search query string
- `max_results` (optional): Maximum number of results to return (default: 20)

**Common Use Cases:**
- Finding code patterns across repositories
- Locating specific implementations
- Identifying usage of functions or classes

**Example:**
```
search_all_repos(
    query="class UserService language:python",
    max_results=30
)
```

**Limitations/Gotchas:**
- Complex queries may be slow
- Results are limited by `max_results`
- Query syntax follows GitHub's search syntax

### Branch and Commit Operations

#### `run_command` (Git operations)
**Description:** Runs Git commands in a sandboxed environment.

**Syntax:**
```
run_command(
    command="GIT_COMMAND",
    timeout=60
)
```

**Parameters:**
- `command` (required): The Git command to run
- `timeout` (optional): Timeout for the command in seconds (default: 60)

**Common Use Cases:**
- Creating and switching branches
- Committing changes
- Pushing to remote
- Checking status

**Examples:**

Creating a new branch:
```
run_command(command="git checkout -b feature/new-feature")
```

Committing changes:
```
run_command(command="git add . && git commit -m 'Add new feature'")
```

Pushing to remote:
```
run_command(command="git push origin feature/new-feature")
```

Checking status:
```
run_command(command="git status")
```

**Limitations/Gotchas:**
- Commands run in a sandboxed environment
- Complex commands may hit timeout limits
- Error handling is manual
- Special characters in commands need proper escaping

#### `view_commit`
**Description:** Views the details of a commit.

**Syntax:**
```
view_commit(commit_sha="COMMIT_SHA")
```

**Parameters:**
- `commit_sha` (required): The SHA of the commit to view

**Common Use Cases:**
- Reviewing specific changes
- Understanding commit context
- Checking commit metadata

**Example:**
```
view_commit(commit_sha="a1b2c3d4e5f6g7h8i9j0")
```

**Limitations/Gotchas:**
- Requires the exact commit SHA
- Limited to the active codebase
- May be slow for large commits

### PR Creation and Management

#### `create_pr`
**Description:** Creates a PR for the current branch.

**Syntax:**
```
create_pr(
    title="PR title",
    body="PR description",
    head_branch="source-branch",
    base_branch="target-branch"
)
```

**Parameters:**
- `title` (required): The title of the PR
- `body` (required): The body of the PR
- `head_branch` (required): The branch that the changes have been pushed to
- `base_branch` (optional): The branch that the changes will be merged into

**Common Use Cases:**
- Submitting changes for review
- Proposing new features
- Fixing bugs

**Example:**
```
create_pr(
    title="Add user authentication",
    body="This PR implements user authentication using JWT tokens.",
    head_branch="feature/user-auth"
)
```

**Limitations/Gotchas:**
- The `head_branch` must exist in the remote repository
- Changes must be pushed to the remote branch before creating the PR
- If `base_branch` is not provided, uses the repository's default branch

#### `view_pr`
**Description:** Views the diff and associated context for a pull request.

**Syntax:**
```
view_pr(
    pr_id=123,
    page=1,
    diff_hunks_per_page=10
)
```

**Parameters:**
- `pr_id` (required): Number of the PR to get the contents for
- `page` (optional): Page number for diff hunks (default: 1)
- `diff_hunks_per_page` (optional): Number of diff hunks per page (default: 10)

**Common Use Cases:**
- Reviewing PR changes
- Understanding PR context
- Checking PR status

**Example:**
```
view_pr(pr_id=123)
```

**Limitations/Gotchas:**
- Paginated results may require multiple calls for large PRs
- Does not check out the PR locally
- Limited to viewing, not modifying

#### `edit_pr_meta`
**Description:** Edits a PR's title, body, and/or state.

**Syntax:**
```
edit_pr_meta(
    pr_number=123,
    title="New title",
    body="New description",
    state="open|closed|draft|ready_for_review"
)
```

**Parameters:**
- `pr_number` (required): The PR number to edit
- `title` (optional): The new title for the PR
- `body` (optional): The new body/description for the PR
- `state` (optional): The new state for the PR

**Common Use Cases:**
- Updating PR descriptions
- Marking PRs as draft or ready for review
- Closing or reopening PRs

**Example:**
```
edit_pr_meta(
    pr_number=123,
    title="Updated: Add user authentication",
    state="ready_for_review"
)
```

**Limitations/Gotchas:**
- Only specified parameters will be updated
- State must be one of: 'open', 'closed', 'draft', or 'ready_for_review'
- Cannot change the target branch

#### `github_assign_pr_reviewers`
**Description:** Assigns reviewers to a GitHub PR.

**Syntax:**
```
github_assign_pr_reviewers(
    pr_number=123,
    assignees=["username1", "username2"]
)
```

**Parameters:**
- `pr_number` (required): The number of the PR
- `assignees` (optional): List of GitHub usernames to assign to the PR

**Common Use Cases:**
- Requesting code reviews
- Assigning PRs to team members
- Managing review workflow

**Example:**
```
github_assign_pr_reviewers(
    pr_number=123,
    assignees=["developer1", "developer2"]
)
```

**Limitations/Gotchas:**
- Assignees must have access to the repository
- Only use if Linear tools are unavailable or specifically requested
- Does not remove existing assignees

#### `list_pr_checks`
**Description:** Lists the check suites for a PR.

**Syntax:**
```
list_pr_checks(
    pr_number=123,
    page=1,
    page_size=10
)
```

**Parameters:**
- `pr_number` (required): The PR number to view checks for
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Number of check suites per page (default: 10)

**Common Use Cases:**
- Monitoring CI/CD status
- Checking if tests are passing
- Verifying PR readiness

**Example:**
```
list_pr_checks(pr_number=123)
```

**Limitations/Gotchas:**
- Paginated results may require multiple calls for PRs with many checks
- Only shows check status, not detailed logs

### Code Review

#### `create_pr_comment`
**Description:** Creates a general comment on a pull request.

**Syntax:**
```
create_pr_comment(
    pr_number=123,
    body="Comment text"
)
```

**Parameters:**
- `pr_number` (required): The PR number to comment on
- `body` (required): The comment text

**Common Use Cases:**
- Providing general feedback
- Asking questions about the PR
- Suggesting improvements

**Example:**
```
create_pr_comment(
    pr_number=123,
    body="Overall this looks good, but please add more tests for the edge cases."
)
```

**Limitations/Gotchas:**
- Comments are at the PR level, not on specific lines
- Supports Markdown formatting

#### `create_pr_review_comment`
**Description:** Creates an inline review comment on a specific line in a pull request.

**Syntax:**
```
create_pr_review_comment(
    pr_number=123,
    body="Comment text",
    commit_sha="COMMIT_SHA",
    path="file/path.ext",
    line=42,
    start_line=null,
    diff_hunk=null
)
```

**Parameters:**
- `pr_number` (required): The PR number to comment on
- `body` (required): The comment text
- `commit_sha` (required): The commit SHA to attach the comment to
- `path` (required): The file path to comment on
- `line` (required): The line number to comment on
- `start_line` (optional): For multi-line comments, the starting line
- `diff_hunk` (optional): The diff hunk for the comment location

**Common Use Cases:**
- Providing line-specific feedback
- Suggesting code improvements
- Pointing out issues in specific locations

**Example:**
```
create_pr_review_comment(
    pr_number=123,
    body="Consider adding a null check here.",
    commit_sha="a1b2c3d4e5f6g7h8i9j0",
    path="src/components/Auth.js",
    line=42
)
```

**Limitations/Gotchas:**
- Requires specific commit SHA and line numbers
- Line numbers must match the diff, not the file
- Complex to use for multi-line comments

### GitHub Actions and CI/CD

#### `view_workflow_run`
**Description:** Views a workflow run.

**Syntax:**
```
view_workflow_run(
    workflow_run_id=12345678,
    conclusions=["failure"],
    logs_start=0,
    logs_size=1000
)
```

**Parameters:**
- `workflow_run_id` (required): The ID of the workflow run to view
- `conclusions` (optional): Filter workflow run logs by conclusion (default: ["failure"])
- `logs_start` (optional): Start index of the logs to retrieve (default: 0)
- `logs_size` (optional): Number of logs to retrieve (default: 1000)

**Common Use Cases:**
- Debugging failed workflows
- Checking build status
- Reviewing test results

**Example:**
```
view_workflow_run(workflow_run_id=12345678)
```

**Limitations/Gotchas:**
- Default filter shows only failed runs
- Log size may be limited for large workflows
- Requires workflow run ID, which may not be readily available

---

## Command Combinations for Common Workflows

### Issue Creation and Management Workflow

1. **Creating and Assigning a New Issue:**
   ```
   linear_create_issue(
       title="Implement user authentication",
       description="Add JWT-based authentication to the API",
       self_assign=True
   )
   ```

2. **Adding a PR Link to the Issue:**
   ```
   linear_attach_link(
       url="https://github.com/org/repo/pull/123",
       title="PR: Implement user authentication"
   )
   ```

3. **Updating Issue Status:**
   ```
   linear_update_issue(
       issue_id="LIN-123",
       state_id="STATE_ID_IN_PROGRESS"
   )
   ```

4. **Adding a Comment with Progress Update:**
   ```
   linear_comment_on_issue(
       issue_id="LIN-123",
       body="Implementation is 50% complete. Basic authentication flow is working, but still need to add token refresh."
   )
   ```

### Code Change and PR Workflow

1. **Setting Active Codebase:**
   ```
   set_active_codebase(repo_name="auth-service")
   ```

2. **Creating a Feature Branch:**
   ```
   run_command(command="git checkout -b feature/user-auth")
   ```

3. **Making Code Changes:**
   ```
   file_write(
       filepath="src/auth/jwt.js",
       content="// JWT implementation code"
   )
   ```

4. **Committing and Pushing Changes:**
   ```
   run_command(command="git add . && git commit -m 'Add JWT authentication'")
   run_command(command="git push origin feature/user-auth")
   ```

5. **Creating a PR:**
   ```
   create_pr(
       title="Add JWT authentication",
       body="This PR implements JWT-based authentication for the API.",
       head_branch="feature/user-auth"
   )
   ```

6. **Linking PR to Linear Issue:**
   ```
   linear_attach_link(
       url="https://github.com/org/repo/pull/123",
       title="PR: Add JWT authentication"
   )
   ```

### Code Review Workflow

1. **Viewing a PR:**
   ```
   view_pr(pr_id=123)
   ```

2. **Checking CI Status:**
   ```
   list_pr_checks(pr_number=123)
   ```

3. **Adding Line-Specific Comments:**
   ```
   create_pr_review_comment(
       pr_number=123,
       body="This could be a security issue. Consider using a more secure hashing algorithm.",
       commit_sha="a1b2c3d4e5f6g7h8i9j0",
       path="src/auth/password.js",
       line=42
   )
   ```

4. **Adding General PR Feedback:**
   ```
   create_pr_comment(
       pr_number=123,
       body="Overall this looks good, but please address the security concerns in the inline comments."
   )
   ```

### Sprint Planning Workflow

1. **Getting Active Cycle:**
   ```
   linear_get_active_cycle()
   ```

2. **Finding Issues for Planning:**
   ```
   linear_search_issues(
       state_id="STATE_ID_BACKLOG",
       limit=20
   )
   ```

3. **Assigning Issues to Cycle:**
   ```
   linear_assign_issue_to_cycle(
       issue_id="LIN-123",
       cycle_id="CYCLE_ID"
   )
   ```

4. **Updating Issue Priority:**
   ```
   linear_update_issue(
       issue_id="LIN-123",
       priority=2
   )
   ```

### Agent Collaboration Workflow

1. **Parent Agent Creating Sub-Issue:**
   ```
   linear_create_issue(
       title="Research authentication libraries",
       description="Evaluate and compare JWT libraries for Node.js",
       parent_issue_id="PARENT_ISSUE_ID"
   )
   ```

2. **Parent Agent Messaging Child Agent:**
   ```
   send_agent_message(
       agent_id="CHILD_AGENT_ID",
       message="Please start working on the research task I've assigned to you."
   )
   ```

3. **Child Agent Updating Parent:**
   ```
   send_agent_message(
       agent_id="PARENT_AGENT_ID",
       message="I've completed the research. jsonwebtoken and jose are the best options."
   )
   ```

4. **Child Agent Commenting on Issue:**
   ```
   linear_comment_on_issue(
       issue_id="LIN-123",
       body="Research complete. Findings attached in the PR."
   )
   ```

---

This cheat sheet provides a comprehensive reference for common Linear and GitHub commands used by agents in their daily workflows. It includes command syntax, parameters, common use cases, examples, and potential limitations or gotchas to help agents navigate and utilize these tools effectively.

