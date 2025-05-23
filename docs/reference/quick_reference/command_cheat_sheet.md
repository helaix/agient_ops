# Command Cheat Sheet for Linear and GitHub Operations

## Table of Contents

1. [Introduction](#introduction)
2. [Linear Commands](#linear-commands)
   - [Issue Management](#issue-management)
   - [Comment Operations](#comment-operations)
   - [Team and Project Management](#team-and-project-management)
   - [User Management](#user-management)
   - [Cycle Management](#cycle-management)
3. [GitHub Commands](#github-commands)
   - [Repository Operations](#repository-operations)
   - [Branch Management](#branch-management)
   - [Commit Operations](#commit-operations)
   - [Pull Request Operations](#pull-request-operations)
   - [Issue Management](#github-issue-management)
   - [Code Review](#code-review)
4. [Integrated Workflows](#integrated-workflows)
   - [Linear-GitHub Integration](#linear-github-integration)
   - [Automation Workflows](#automation-workflows)
5. [Best Practices](#best-practices)
   - [Naming Conventions](#naming-conventions)
   - [Workflow Optimization](#workflow-optimization)
   - [Collaboration Tips](#collaboration-tips)

## Introduction

This cheat sheet provides a comprehensive reference for common Linear and GitHub operations used by agents. It includes command syntax, parameter descriptions, practical examples, and best practices to help streamline your workflow.

## Linear Commands

### Issue Management

#### Creating Issues

```
linear_create_issue(
    title="Issue title",
    description="Detailed description of the issue",
    team_id="team_id",  # Optional, uses default if not provided
    assignee_id="user_id",  # Optional
    self_assign=True,  # Optional, assigns to the bot
    parent_issue_id="parent_issue_id"  # Optional, for sub-issues
)
```

**Example:**
```
linear_create_issue(
    title="Implement user authentication",
    description="Add OAuth2 authentication to the login page",
    self_assign=True
)
```

**Use Cases:**
- Creating new tasks or features
- Reporting bugs
- Creating sub-tasks under a parent issue

**Tips:**
- Use clear, concise titles
- Include detailed descriptions with acceptance criteria
- Link to relevant resources or documentation

#### Updating Issues

```
linear_update_issue(
    issue_id="issue_id",
    title="New title",  # Optional
    description="New description",  # Optional
    state_id="state_id",  # Optional
    assignee_id="user_id",  # Optional
    priority=1,  # Optional (0-4)
    label_ids=["label_id1", "label_id2"],  # Optional
    team_id="team_id",  # Optional
    project_id="project_id"  # Optional
)
```

**Example:**
```
linear_update_issue(
    issue_id="issue_id",
    state_id="in_progress_state_id",
    priority=2
)
```

**Use Cases:**
- Changing issue status
- Reassigning issues
- Updating priority or details
- Adding labels

**Tips:**
- Only include parameters you want to change
- Use appropriate state IDs for workflow transitions

#### Getting Issue Details

```
linear_get_issue(issue_id="issue_id")
```

**Example:**
```
linear_get_issue(issue_id="issue_id")
```

**Use Cases:**
- Retrieving issue details before making updates
- Checking issue status
- Viewing assignee and other metadata

#### Searching Issues

```
linear_search_issues(
    title="search term",  # Optional
    description="search term",  # Optional
    assignee_id="user_id",  # Optional
    team_id="team_id",  # Optional
    state_id="state_id",  # Optional
    project_id="project_id",  # Optional
    limit=10  # Optional, default is 10
)
```

**Example:**
```
linear_search_issues(
    title="authentication",
    state_id="backlog_state_id",
    limit=5
)
```

**Use Cases:**
- Finding related issues
- Filtering issues by status
- Searching for specific topics

**Tips:**
- Combine multiple parameters for more specific searches
- Use partial text matching for broader results

### Comment Operations

#### Adding Comments

```
linear_comment_on_issue(
    issue_id="issue_id",
    body="Comment text with optional Markdown formatting"
)
```

**Example:**
```
linear_comment_on_issue(
    issue_id="issue_id",
    body="I've started working on this. Here's my approach: \n\n```javascript\nfunction authenticate() {\n  // code\n}\n```"
)
```

**Use Cases:**
- Providing updates on progress
- Asking questions about requirements
- Sharing code snippets or solutions

**Tips:**
- Use Markdown formatting for better readability
- Include code blocks with syntax highlighting
- @mention team members for visibility

#### Getting Comments

```
linear_get_issue_comments(issue_id="issue_id")
```

**Example:**
```
linear_get_issue_comments(issue_id="issue_id")
```

**Use Cases:**
- Reviewing discussion history
- Checking for updates or feedback
- Gathering context before responding

### Team and Project Management

#### Getting Teams

```
linear_get_teams()
```

**Example:**
```
linear_get_teams()
```

**Use Cases:**
- Identifying available teams
- Getting team IDs for issue creation

#### Searching Teams

```
linear_search_teams(
    search_string="team name",
    limit=10  # Optional, default is 10
)
```

**Example:**
```
linear_search_teams(search_string="Engineering")
```

**Use Cases:**
- Finding specific teams
- Getting team IDs for issue assignment

#### Searching Projects

```
linear_search_projects(
    search_string="project name",
    limit=10  # Optional, default is 10
)
```

**Example:**
```
linear_search_projects(search_string="Website Redesign")
```

**Use Cases:**
- Finding project IDs
- Identifying active projects

### User Management

#### Getting Assignees

```
linear_get_assignees(
    team_id="team_id",  # Optional
    limit=10  # Optional, default is 10
)
```

**Example:**
```
linear_get_assignees(team_id="engineering_team_id")
```

**Use Cases:**
- Finding available assignees for issues
- Getting user IDs for assignment

#### Searching Users

```
linear_search_users(
    name_search_string="user name",
    limit=10  # Optional, default is 10
)
```

**Example:**
```
linear_search_users(name_search_string="John")
```

**Use Cases:**
- Finding specific users
- Getting user IDs for mentions or assignments

### Cycle Management

#### Getting Active Cycle

```
linear_get_active_cycle(team_id="team_id")  # Optional
```

**Example:**
```
linear_get_active_cycle(team_id="engineering_team_id")
```

**Use Cases:**
- Identifying the current sprint or cycle
- Planning issue assignments

#### Getting All Cycles

```
linear_get_cycles(team_id="team_id")  # Optional
```

**Example:**
```
linear_get_cycles(team_id="engineering_team_id")
```

**Use Cases:**
- Planning future work
- Reviewing past cycles

#### Getting Cycle Issues

```
linear_get_cycle_issues(cycle_id="cycle_id")
```

**Example:**
```
linear_get_cycle_issues(cycle_id="current_sprint_id")
```

**Use Cases:**
- Reviewing all issues in a sprint
- Tracking cycle progress

#### Assigning Issues to Cycles

```
linear_assign_issue_to_cycle(
    issue_id="issue_id",
    cycle_id="cycle_id"
)
```

**Example:**
```
linear_assign_issue_to_cycle(
    issue_id="new_feature_id",
    cycle_id="current_sprint_id"
)
```

**Use Cases:**
- Adding issues to the current sprint
- Planning work for upcoming cycles

**Tips:**
- Ensure issues are properly scoped before adding to cycles
- Consider cycle capacity when assigning issues

## GitHub Commands

### Repository Operations

#### Setting Active Codebase

```
set_active_codebase(repo_name="repository_name")
```

**Example:**
```
set_active_codebase(repo_name="agient_ops")
```

**Use Cases:**
- Switching between repositories
- Setting the context for subsequent operations

**Tips:**
- Use the repository name without the organization prefix

#### Viewing All Repositories

```
view_all_repos(
    repos_per_page=10,  # Optional, default is 10
    page=1  # Optional, default is 1
)
```

**Example:**
```
view_all_repos(repos_per_page=20)
```

**Use Cases:**
- Discovering available repositories
- Finding repository names for active codebase selection

#### Viewing Repository History

```
view_repo_history(
    num_commits=10,  # Optional, default is 10
    since="2023-01-01T00:00:00Z"  # Optional, ISO format date
)
```

**Example:**
```
view_repo_history(num_commits=5)
```

**Use Cases:**
- Reviewing recent changes
- Understanding project history
- Identifying active contributors

### Branch Management

#### Creating and Switching Branches

```bash
# Create a new branch
git checkout -b branch_name

# Switch to an existing branch
git checkout branch_name

# Create a branch from a specific commit or tag
git checkout -b branch_name commit_sha_or_tag
```

**Example:**
```bash
git checkout -b feature/user-authentication
```

**Use Cases:**
- Starting work on a new feature
- Creating a branch for bug fixes
- Isolating experimental changes

**Tips:**
- Use descriptive branch names with prefixes (feature/, bugfix/, etc.)
- Keep branches focused on a single task or feature

#### Listing Branches

```bash
# List local branches
git branch

# List all branches (local and remote)
git branch -a

# List remote branches
git branch -r
```

**Example:**
```bash
git branch -a
```

**Use Cases:**
- Finding available branches
- Checking if a branch exists
- Identifying remote branches

#### Deleting Branches

```bash
# Delete a local branch
git branch -d branch_name

# Force delete a local branch
git branch -D branch_name

# Delete a remote branch
git push origin --delete branch_name
```

**Example:**
```bash
git branch -d feature/completed-feature
```

**Use Cases:**
- Cleaning up after merging
- Removing obsolete branches
- Organizing repository

**Tips:**
- Only delete branches after they've been merged or are no longer needed
- Use `-d` for safe deletion (prevents deleting unmerged branches)
- Use `-D` to force deletion (use with caution)

### Commit Operations

#### Creating Commits

```bash
# Stage all changes
git add .

# Stage specific files
git add file1.js file2.js

# Commit with message
git commit -m "Commit message"

# Stage and commit in one command
git commit -am "Commit message"
```

**Example:**
```bash
git add src/components/Login.js
git commit -m "Implement OAuth2 authentication in login component"
```

**Use Cases:**
- Saving changes to the repository
- Creating logical units of work
- Documenting changes

**Tips:**
- Write clear, descriptive commit messages
- Use present tense in commit messages
- Keep commits focused on a single logical change
- Reference issue numbers in commit messages when applicable

#### Viewing Commits

```
view_commit(commit_sha="commit_sha")
```

**Example:**
```
view_commit(commit_sha="a1b2c3d4e5f6g7h8i9j0")
```

**Use Cases:**
- Reviewing specific changes
- Understanding the context of a change
- Debugging issues

#### Pushing Commits

```bash
# Push to the current branch
git push

# Push to a specific branch
git push origin branch_name

# Force push (use with caution)
git push -f origin branch_name

# Set upstream and push
git push -u origin branch_name
```

**Example:**
```bash
git push -u origin feature/user-authentication
```

**Use Cases:**
- Sharing changes with the team
- Updating remote branches
- Preparing for pull requests

**Tips:**
- Always pull before pushing to avoid conflicts
- Use `-u` flag when pushing a new branch for the first time
- Avoid force pushing to shared branches

### Pull Request Operations

#### Creating Pull Requests

```
create_pr(
    title="PR title",
    body="PR description",
    head_branch="source_branch",
    base_branch="target_branch"  # Optional, defaults to main/master
)
```

**Example:**
```
create_pr(
    title="Add user authentication",
    body="This PR implements OAuth2 authentication for the login page.\n\n- Adds authentication service\n- Updates login component\n- Adds tests",
    head_branch="feature/user-authentication"
)
```

**Use Cases:**
- Submitting changes for review
- Proposing new features
- Fixing bugs

**Tips:**
- Include a clear title that summarizes the change
- Provide a detailed description of changes
- List the key components modified
- Reference related issues using keywords (Fixes #123, Closes #456)

#### Viewing Pull Requests

```
view_pr(
    pr_id=123,
    page=1,  # Optional, default is 1
    diff_hunks_per_page=10  # Optional, default is 10
)
```

**Example:**
```
view_pr(pr_id=123)
```

**Use Cases:**
- Reviewing proposed changes
- Understanding the scope of a PR
- Preparing for code review

#### Editing Pull Requests

```
edit_pr_meta(
    pr_number=123,
    title="New title",  # Optional
    body="New description",  # Optional
    state="open"  # Optional: "open", "closed", "draft", "ready_for_review"
)
```

**Example:**
```
edit_pr_meta(
    pr_number=123,
    title="Add user authentication with improved security",
    state="ready_for_review"
)
```

**Use Cases:**
- Updating PR details
- Converting draft PRs to ready for review
- Closing or reopening PRs

#### Adding PR Comments

```
create_pr_comment(
    pr_number=123,
    body="Comment text with optional Markdown"
)
```

**Example:**
```
create_pr_comment(
    pr_number=123,
    body="The authentication implementation looks good, but we should add rate limiting to prevent brute force attacks."
)
```

**Use Cases:**
- Providing general feedback
- Asking questions
- Suggesting improvements

#### Adding PR Review Comments

```
create_pr_review_comment(
    pr_number=123,
    body="Comment text",
    commit_sha="commit_sha",
    path="file_path",
    line=42,
    start_line=null  # Optional, for multi-line comments
)
```

**Example:**
```
create_pr_review_comment(
    pr_number=123,
    body="Consider using a more secure hashing algorithm here.",
    commit_sha="a1b2c3d4e5f6g7h8i9j0",
    path="src/services/auth.js",
    line=27
)
```

**Use Cases:**
- Providing feedback on specific lines of code
- Suggesting code improvements
- Pointing out potential issues

**Tips:**
- Be specific and constructive in review comments
- Provide examples or alternatives when suggesting changes

#### Checking PR Status

```
list_pr_checks(
    pr_number=123,
    page=1,  # Optional, default is 1
    page_size=10  # Optional, default is 10
)
```

**Example:**
```
list_pr_checks(pr_number=123)
```

**Use Cases:**
- Verifying CI/CD pipeline status
- Checking if tests are passing
- Ensuring all requirements are met before merging

### GitHub Issue Management {#github-issue-management}

#### Creating Issues

```
github_create_issue(
    title="Issue title",
    body="Issue description",
    assignees=["username1", "username2"],  # Optional
    labels=["bug", "priority-high"]  # Optional
)
```

**Example:**
```
github_create_issue(
    title="Authentication fails on Safari",
    body="Users are unable to log in using Safari browsers.\n\n## Steps to reproduce\n1. Open the login page in Safari\n2. Enter credentials\n3. Click login\n\n## Expected behavior\nUser should be logged in and redirected to dashboard.\n\n## Actual behavior\nPage refreshes but user remains on login screen.",
    labels=["bug", "authentication"]
)
```

**Use Cases:**
- Reporting bugs
- Requesting features
- Creating tasks

**Tips:**
- Use clear, descriptive titles
- Include detailed reproduction steps for bugs
- Add appropriate labels for categorization
- Assign to relevant team members

#### Viewing Issues

```
view_issue(
    issue_id=123,
    include_comments=True  # Optional, default is False
)
```

**Example:**
```
view_issue(issue_id=123, include_comments=True)
```

**Use Cases:**
- Reviewing issue details
- Checking issue status
- Reading discussion history

#### Commenting on Issues

```
create_issue_comment(
    issue_number=123,
    body="Comment text with optional Markdown"
)
```

**Example:**
```
create_issue_comment(
    issue_number=123,
    body="I've identified the root cause. The authentication token is not being properly stored in Safari due to its stricter privacy settings."
)
```

**Use Cases:**
- Providing updates
- Asking questions
- Adding information

**Tips:**
- Use Markdown for formatting
- Include code snippets when relevant
- Reference related issues or PRs

#### Searching Issues

```
search_issues(query="search query string")
```

**Example:**
```
search_issues(query="is:open is:issue label:bug authentication")
```

**Use Cases:**
- Finding related issues
- Discovering duplicate reports
- Tracking specific categories of issues

**Tips:**
- Use GitHub's search syntax for powerful queries
- Combine multiple criteria for precise results
- Common qualifiers: `is:issue`, `is:pr`, `is:open`, `label:name`, `author:username`

### Code Review

#### Searching Code

```
ripgrep_search(
    query="search pattern",
    file_extensions=[".js", ".ts"],  # Optional
    use_regex=True,  # Optional, default is True
    page=1,  # Optional, default is 1
    files_per_page=10  # Optional, default is 10
)
```

**Example:**
```
ripgrep_search(
    query="function authenticate",
    file_extensions=[".js", ".ts"]
)
```

**Use Cases:**
- Finding implementations
- Locating usage of functions or variables
- Identifying patterns across the codebase

**Tips:**
- Use regex for more powerful searches
- Limit file extensions to relevant file types
- Be specific with search terms to reduce noise

#### Searching Across Repositories

```
search_all_repos(
    query="search query",
    max_results=20  # Optional, default is 20
)
```

**Example:**
```
search_all_repos(
    query="class AuthService language:typescript"
)
```

**Use Cases:**
- Finding similar implementations across projects
- Identifying common patterns
- Locating reusable code

**Tips:**
- Use language qualifiers to narrow results
- Include file path patterns for more specific searches
- Use quotes for exact phrase matching

## Integrated Workflows

### Linear-GitHub Integration

#### Attaching GitHub Links to Linear Issues

```
linear_attach_link(
    title="Link title",
    url="https://github.com/org/repo/pull/123"
)
```

**Example:**
```
linear_attach_link(
    title="PR: Add user authentication",
    url="https://github.com/helaix/agient_ops/pull/123"
)
```

**Use Cases:**
- Linking PRs to related issues
- Attaching documentation or resources
- Connecting discussions across platforms

**Tips:**
- Use descriptive titles for links
- Include the PR or issue number in the title for easy reference

#### Self-Assigning Linear Issues

```
linear_self_assign(
    override_assignee=False  # Optional, default is False
)
```

**Example:**
```
linear_self_assign()
```

**Use Cases:**
- Taking ownership of issues
- Indicating work in progress
- Tracking assigned tasks

**Tips:**
- Only assign issues you're actively working on
- Set `override_assignee=True` only when necessary to reassign

### Automation Workflows

#### Common Linear-GitHub Workflow

1. **Start work on a Linear issue:**
   ```
   linear_self_assign()
   linear_update_issue(
       issue_id="issue_id",
       state_id="in_progress_state_id"
   )
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/issue-description
   ```

3. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "Implement feature X for issue LINEAR-123"
   git push -u origin feature/issue-description
   ```

4. **Create a PR:**
   ```
   create_pr(
       title="Add feature X",
       body="Implements the solution for LINEAR-123\n\nThis PR adds...",
       head_branch="feature/issue-description"
   )
   ```

5. **Link PR to Linear issue:**
   ```
   linear_attach_link(
       title="PR: Add feature X",
       url="https://github.com/org/repo/pull/123"
   )
   ```

6. **Update Linear issue status:**
   ```
   linear_update_issue(
       issue_id="issue_id",
       state_id="review_state_id"
   )
   ```

**Use Cases:**
- Standard development workflow
- Ensuring traceability between issues and code
- Maintaining consistent status updates

**Tips:**
- Follow this workflow consistently for all tasks
- Update Linear issue states as work progresses
- Include issue references in commit messages and PR descriptions

## Best Practices

### Naming Conventions

#### Branch Naming

- **Format:** `type/description-issue-number`
- **Types:** `feature`, `bugfix`, `hotfix`, `refactor`, `docs`, `test`
- **Examples:**
  - `feature/user-authentication-123`
  - `bugfix/login-error-456`
  - `refactor/auth-service-789`

**Tips:**
- Keep branch names concise but descriptive
- Include issue numbers for traceability
- Use hyphens to separate words

#### Commit Messages

- **Format:** `type: short description [issue reference]`
- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Examples:**
  - `feat: implement OAuth2 authentication [LINEAR-123]`
  - `fix: resolve token expiration bug [LINEAR-456]`
  - `docs: update API documentation`

**Tips:**
- Use present tense
- Keep first line under 50 characters
- Add detailed description in the commit body if needed
- Reference issues using square brackets

#### Pull Request Titles

- **Format:** `type: description [issue reference]`
- **Examples:**
  - `Feature: Add user authentication [LINEAR-123]`
  - `Bugfix: Resolve login issues on Safari [LINEAR-456]`

**Tips:**
- Be clear and specific
- Include the issue reference
- Use sentence case

### Workflow Optimization

#### Efficient Issue Management

1. **Prioritize issues properly:**
   - Use priority fields in Linear
   - Label urgent issues appropriately
   - Assign due dates for time-sensitive tasks

2. **Break down large issues:**
   - Create parent issues for epics
   - Use sub-issues for manageable chunks of work
   - Link related issues

3. **Track progress accurately:**
   - Update issue states promptly
   - Add comments with progress updates
   - Attach relevant links and resources

#### Streamlined PR Process

1. **Keep PRs focused:**
   - Limit scope to a single feature or fix
   - Break large changes into multiple PRs
   - Ensure each PR addresses a specific issue

2. **Facilitate efficient reviews:**
   - Add clear descriptions
   - Include screenshots for UI changes
   - Highlight areas that need special attention

3. **Address feedback promptly:**
   - Respond to all review comments
   - Make requested changes quickly
   - Request re-review when updates are complete

### Collaboration Tips

#### Effective Communication

1. **Use clear, concise language:**
   - Be specific about requirements and changes
   - Avoid ambiguous terms
   - Use technical terminology appropriately

2. **Provide context:**
   - Reference related issues and PRs
   - Explain the reasoning behind changes
   - Share relevant documentation

3. **Use formatting for clarity:**
   - Structure comments with headings and lists
   - Use code blocks for code snippets
   - Include links to relevant resources

#### Cross-Platform Integration

1. **Maintain consistency across tools:**
   - Use the same terminology in Linear and GitHub
   - Include cross-references between platforms
   - Keep status in sync across systems

2. **Leverage automation:**
   - Use webhooks and integrations
   - Automate status updates when possible
   - Set up notifications for important events

3. **Document workflows:**
   - Create and share process documentation
   - Establish team conventions
   - Onboard new team members with clear guidelines

