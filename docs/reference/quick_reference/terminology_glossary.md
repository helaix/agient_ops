# Terminology Glossary

This document provides a comprehensive glossary of terminology used across Linear, GitHub, and agent collaboration. The glossary is organized alphabetically within each section and includes cross-references between related terms across different systems.

## Linear Terminology

### Assignee
**Definition:** The user who is responsible for completing an issue.  
**Context:** Used in issue management to track who is working on what.  
**Related Terms:** GitHub Assignee  
**Example:** "The issue was assigned to Sarah, who is now the assignee responsible for implementing the feature."

### Backlog
**Definition:** A status category in Linear that contains issues that are not yet scheduled for work but are planned for the future.  
**Context:** Used for organizing and prioritizing future work.  
**Related Terms:** GitHub Issues, Project Board  
**Example:** "We've added the feature request to our backlog and will prioritize it for a future cycle."

### Cycle
**Definition:** A time-boxed period (similar to sprints) during which a team works on a specific set of issues.  
**Context:** Used for planning and tracking work over a defined period.  
**Related Terms:** Sprint, Iteration  
**Example:** "Our team works in two-week cycles to maintain a consistent development rhythm."

### Issue
**Definition:** The most basic unit of work in Linear, representing a task described in plain language.  
**Context:** Issues are the primary way to track work in Linear.  
**Related Terms:** GitHub Issue, Task  
**Example:** "Create an issue for the bug you found so we can track its resolution."

### Issue Identifier
**Definition:** A unique code assigned to each issue, consisting of the team key and a sequential number (e.g., "ENG-123").  
**Context:** Used to uniquely identify and reference issues.  
**Related Terms:** GitHub Issue Number  
**Example:** "Please reference DESIGN-42 in your commit message when you fix this bug."

### Label
**Definition:** Tags that can be applied to issues to categorize them.  
**Context:** Used for filtering and organizing issues.  
**Related Terms:** GitHub Labels, Tags  
**Example:** "Apply the 'bug' label to all issues related to software defects."

### Milestone
**Definition:** A concept used to organize issues inside individual projects, representing meaningful stages of completion.  
**Context:** Used for tracking progress within a project.  
**Related Terms:** GitHub Milestone  
**Example:** "We've reached the 'Beta Release' milestone in our mobile app project."

### Priority
**Definition:** A designation indicating the importance or urgency of an issue.  
**Context:** Used to determine which issues should be addressed first.  
**Related Terms:** GitHub Issue Priority  
**Example:** "This security vulnerability has been marked as high priority and needs immediate attention."

### Project
**Definition:** A unit of work with a clear outcome or planned completion date, comprised of issues and optional documents.  
**Context:** Projects group related issues toward a specific deliverable.  
**Related Terms:** GitHub Project Board  
**Example:** "We've created a new project for the website redesign that will track all related issues."

### Roadmap
**Definition:** A curated set of projects organized to show direction and planning over time.  
**Context:** Used for strategic planning and communicating future work.  
**Related Terms:** GitHub Project Board  
**Example:** "Our Q3 roadmap includes three major projects focused on improving user experience."

### Status
**Definition:** The current state of an issue in its workflow (e.g., Todo, In Progress, Done).  
**Context:** Used to track the progress of issues.  
**Related Terms:** GitHub Issue State  
**Example:** "Once you start working on the issue, change its status to 'In Progress'."

### Team
**Definition:** A group within a workspace that typically represents people who work together frequently.  
**Context:** Teams hold issues and can have their own projects and settings.  
**Related Terms:** GitHub Organization, GitHub Team  
**Example:** "The Engineering team has their own workflow configured for handling bug reports."

### Triage
**Definition:** An optional status in Linear that allows teams to review issues before accepting them.  
**Context:** Used for initial assessment and prioritization of new issues.  
**Related Terms:** GitHub Issue Review  
**Example:** "All new bug reports go through triage before being added to the backlog."

### View
**Definition:** A filtered set of issues based on specific criteria.  
**Context:** Views help organize and focus on specific subsets of issues.  
**Related Terms:** GitHub Saved Filters  
**Example:** "I created a custom view that shows all high-priority issues assigned to me."

### Workflow
**Definition:** A group of ordered issue statuses defined per team.  
**Context:** Workflows define how issues progress from creation to completion.  
**Related Terms:** GitHub Project Board Columns  
**Example:** "Our development workflow includes statuses for code review and QA testing."

### Workspace
**Definition:** The container for all issues, teams, and other concepts relating to an individual company.  
**Context:** A workspace is the highest-level organizational unit in Linear.  
**Related Terms:** GitHub Organization  
**Example:** "Our company has a single Linear workspace that contains all our teams and projects."

## GitHub Terminology

### @mention
**Definition:** A way to notify a person on GitHub by using `@` before their username.  
**Context:** Used in issues, pull requests, and comments to get someone's attention.  
**Related Terms:** Linear @mention  
**Example:** "@sarah please review this pull request when you have time."

### Assignee
**Definition:** The user that is assigned to an issue or pull request.  
**Context:** Used to indicate who is responsible for addressing an issue or reviewing a pull request.  
**Related Terms:** Linear Assignee  
**Example:** "I've assigned this bug to you so you can fix it in the next sprint."

### Base Branch
**Definition:** The branch into which changes are combined when you merge a pull request.  
**Context:** Used in pull requests to specify where changes should be applied.  
**Related Terms:** Target Branch, Main Branch  
**Example:** "This feature should be merged into the develop branch, which is our base branch for all features."

### Branch
**Definition:** A parallel version of a repository that allows you to work freely without disrupting the "live" version.  
**Context:** Branches are used to develop features, fix bugs, or experiment safely.  
**Related Terms:** Linear Branch  
**Example:** "Create a new branch called 'feature/user-authentication' for this work."

### Clone
**Definition:** A copy of a repository that lives on your computer instead of on a website's server.  
**Context:** Cloning allows you to work on your code locally.  
**Related Terms:** Fork  
**Example:** "Clone the repository to your local machine to start working on the bug fix."

### Code Owner
**Definition:** A person designated as an owner of a portion of a repository's code.  
**Context:** Code owners are automatically requested for review when changes are made to code they own.  
**Related Terms:** Linear Team Lead  
**Example:** "Sarah is the code owner for the authentication module, so she'll need to approve any changes."

### Collaborator
**Definition:** A person with read and write access to a repository who has been invited to contribute.  
**Context:** Collaborators can make direct contributions to a repository.  
**Related Terms:** Linear Team Member  
**Example:** "We've added you as a collaborator to the project repository so you can push your changes directly."

### Commit
**Definition:** An individual change to a file or set of files, creating a unique ID that records specific changes.  
**Context:** Commits are the basic units of work in Git.  
**Related Terms:** Change, Revision  
**Example:** "Make sure your commit message clearly describes the changes you made."

### Fork
**Definition:** A personal copy of another user's repository that lives in your account.  
**Context:** Forking allows you to freely experiment with changes without affecting the original project.  
**Related Terms:** Clone  
**Example:** "Fork the repository to your own GitHub account before making any changes."

### Git
**Definition:** A distributed version control system that tracks changes in source code during software development.  
**Context:** Git is the underlying technology that powers GitHub.  
**Related Terms:** Version Control  
**Example:** "Use Git commands to commit your changes and push them to the remote repository."

### Head Branch
**Definition:** The branch that contains changes you want to merge when you create a pull request.  
**Context:** Used in pull requests to specify which changes should be applied.  
**Related Terms:** Feature Branch, Source Branch  
**Example:** "The head branch 'feature/login-redesign' contains all the UI changes we want to merge."

### Issue
**Definition:** A unit of work in GitHub used to track ideas, enhancements, tasks, or bugs.  
**Context:** Issues are used for tracking work that needs to be done.  
**Related Terms:** Linear Issue, Task  
**Example:** "Create an issue to track the bug you found in the login form."

### Markdown
**Definition:** A lightweight markup language used for formatting text on GitHub.  
**Context:** Used in issue descriptions, pull request descriptions, and comments.  
**Related Terms:** Formatting  
**Example:** "Use Markdown to format your issue description with headings, lists, and code blocks."

### Merge
**Definition:** The process of combining changes from one branch into another.  
**Context:** Merging is typically done through pull requests.  
**Related Terms:** Pull Request  
**Example:** "After the code review is complete, we'll merge your changes into the main branch."

### Milestone
**Definition:** A way to track progress on groups of issues or pull requests in a repository.  
**Context:** Used for organizing and tracking work toward specific goals.  
**Related Terms:** Linear Milestone, Linear Project  
**Example:** "We've added this issue to the 'Q2 Release' milestone to track our progress toward the release."

### Organization
**Definition:** A shared account where businesses and open-source projects can collaborate across many projects at once.  
**Context:** Organizations have members with different roles and levels of access.  
**Related Terms:** Linear Workspace  
**Example:** "Our company has a GitHub organization where all our project repositories are hosted."

### Pull Request (PR)
**Definition:** A method of submitting contributions to a project by proposing changes from a branch.  
**Context:** Pull requests are the primary way to review and discuss code changes before merging.  
**Related Terms:** Merge Request  
**Example:** "Submit a pull request when you're ready for others to review your changes."

### Repository (Repo)
**Definition:** A project's folder that contains all of the project files and stores each file's revision history.  
**Context:** Repositories are the fundamental unit of organization in GitHub.  
**Related Terms:** Project  
**Example:** "Create a new repository for the mobile app project to keep its code separate from the web app."

### Review
**Definition:** The process of examining code changes in a pull request before they are merged.  
**Context:** Reviews help maintain code quality and catch issues early.  
**Related Terms:** Code Review  
**Example:** "Please review my pull request and provide feedback on the implementation."

### Status Check
**Definition:** External processes, such as continuous integration builds, that run for each commit you make in a repository.  
**Context:** Status checks help verify that your changes meet certain criteria before they can be merged.  
**Related Terms:** CI/CD, Build  
**Example:** "All status checks must pass before this pull request can be merged."

### Tag
**Definition:** A label applied to a specific point in a repository's history, typically used for release versions.  
**Context:** Tags are used to mark specific points in a repository's history as important.  
**Related Terms:** Release  
**Example:** "We've tagged version 1.0.0 of the application for the initial release."

### Workflow (GitHub Actions)
**Definition:** A configurable automated process that runs one or more jobs.  
**Context:** Workflows are defined in YAML files in the .github/workflows directory of a repository.  
**Related Terms:** CI/CD Pipeline, Automation  
**Example:** "Our GitHub Actions workflow automatically runs tests whenever a pull request is created."

## Agent Collaboration Terminology

### Agent
**Definition:** An autonomous or semi-autonomous software entity that performs tasks on behalf of users or other agents.  
**Context:** Agents are the primary actors in agent collaboration systems.  
**Related Terms:** Bot, Assistant  
**Example:** "The research agent gathered information while the writing agent composed the report."

### Agent Communication Protocol
**Definition:** A standardized method for agents to exchange information and coordinate activities.  
**Context:** Protocols enable effective communication between different agents.  
**Related Terms:** API, Interface  
**Example:** "The agents use a standardized communication protocol to exchange task updates and results."

### Agent Identifier (AI)
**Definition:** A globally unique identifier assigned to each agent in a network.  
**Context:** Used to uniquely identify agents during communication.  
**Related Terms:** UUID, User ID  
**Example:** "Each message includes the agent identifier to track which agent sent it."

### Agent Network
**Definition:** A collection of interconnected agents that can communicate and collaborate.  
**Context:** Agent networks enable complex tasks to be distributed across specialized agents.  
**Related Terms:** Team, Swarm  
**Example:** "Our agent network includes specialized agents for research, writing, and code generation."

### Capability
**Definition:** A specific function or skill that an agent can perform.  
**Context:** Capabilities define what tasks an agent can handle.  
**Related Terms:** Skill, Function  
**Example:** "The data analysis agent has capabilities for statistical analysis and visualization."

### Child Agent
**Definition:** An agent that works under the direction of a parent agent.  
**Context:** Used in hierarchical agent structures.  
**Related Terms:** Sub-agent, Worker Agent  
**Example:** "The parent agent delegated research tasks to three child agents."

### Collaboration
**Definition:** The process of multiple agents working together to achieve a common goal.  
**Context:** Collaboration enables complex tasks to be broken down and distributed.  
**Related Terms:** Coordination, Teamwork  
**Example:** "Through collaboration, the agents were able to complete the project faster than a single agent could."

### Delegation
**Definition:** The act of assigning a task from one agent to another.  
**Context:** Delegation allows for specialization and parallel processing.  
**Related Terms:** Task Assignment, Handoff  
**Example:** "The manager agent uses delegation to distribute work to specialized worker agents."

### Handoff
**Definition:** The process of transferring responsibility for a task from one agent to another.  
**Context:** Handoffs occur when tasks move between different stages or specialties.  
**Related Terms:** Delegation, Transfer  
**Example:** "After completing the research, the agent performed a handoff to the writing agent."

### Interrupt
**Definition:** A message or signal that temporarily pauses an agent's current task to address a more urgent matter.  
**Context:** Interrupts allow for handling high-priority tasks or updates.  
**Related Terms:** Notification, Alert  
**Example:** "The agent received an interrupt when new critical information became available."

### Master Agent
**Definition:** An agent that coordinates and manages the activities of other agents.  
**Context:** Master agents often handle task delegation and result aggregation.  
**Related Terms:** Parent Agent, Coordinator  
**Example:** "The master agent broke down the complex task and assigned subtasks to specialized agents."

### Message
**Definition:** A unit of communication sent between agents.  
**Context:** Messages are the primary means of information exchange between agents.  
**Related Terms:** Communication, Signal  
**Example:** "The agent sent a message requesting additional information to complete its task."

### Parent Agent
**Definition:** An agent that oversees and coordinates the work of child agents.  
**Context:** Parent agents often handle task delegation and result aggregation.  
**Related Terms:** Master Agent, Coordinator  
**Example:** "The parent agent reviewed the outputs from all child agents before finalizing the report."

### Payload
**Definition:** The main content or data being transmitted in a message between agents.  
**Context:** Payloads contain the actual information being exchanged.  
**Related Terms:** Data, Content  
**Example:** "The message payload contained the research results and supporting evidence."

### Session
**Definition:** A period of interaction between agents working on a specific task or conversation.  
**Context:** Sessions provide context and continuity for agent interactions.  
**Related Terms:** Conversation, Interaction  
**Example:** "The agents maintained the same session throughout the entire project to preserve context."

### Specialization
**Definition:** The focus of an agent on a specific type of task or domain.  
**Context:** Specialization allows agents to develop expertise in particular areas.  
**Related Terms:** Capability, Expertise  
**Example:** "We have agents with specializations in data analysis, content creation, and code generation."

### Task
**Definition:** A specific piece of work assigned to an agent.  
**Context:** Tasks are the fundamental units of work in agent collaboration.  
**Related Terms:** Issue, Assignment  
**Example:** "The research task was assigned to the agent with expertise in that domain."

### Worker Agent
**Definition:** An agent that performs specific tasks assigned by a master or parent agent.  
**Context:** Worker agents often have specialized capabilities.  
**Related Terms:** Child Agent, Executor  
**Example:** "The worker agents each processed a portion of the data and reported their findings."

## Cross-References

### Issue Management
- **Linear Issue** ↔ **GitHub Issue**: Both represent units of work to be completed, though they have different properties and workflows.
- **Linear Assignee** ↔ **GitHub Assignee**: Both indicate who is responsible for completing a task.
- **Linear Label** ↔ **GitHub Label**: Both are used to categorize and filter work items.
- **Linear Status** ↔ **GitHub Status Check**: Both indicate the current state of work, though they function differently.

### Project Organization
- **Linear Workspace** ↔ **GitHub Organization**: Both are top-level containers for projects and teams.
- **Linear Team** ↔ **GitHub Team**: Both represent groups of users who work together.
- **Linear Project** ↔ **GitHub Repository/Project Board**: Both organize related work items.
- **Linear Roadmap** ↔ **GitHub Project Board**: Both provide visual organization of work over time.

### Agent and Task Management
- **Agent Task** ↔ **Linear Issue/GitHub Issue**: All represent units of work to be completed.
- **Agent Delegation** ↔ **Linear/GitHub Assignment**: Both involve assigning work to specific individuals or entities.
- **Agent Specialization** ↔ **Linear Team/GitHub Team**: Both involve organizing by area of expertise.
- **Agent Session** ↔ **Linear Project/GitHub Repository**: Both provide context for related work.

### Communication
- **Agent Message** ↔ **Linear Comment/GitHub Comment**: All are forms of communication about work items.
- **Agent Interrupt** ↔ **Linear/GitHub Notification**: Both alert users or agents about important updates.
- **Agent Communication Protocol** ↔ **Linear API/GitHub API**: Both provide standardized ways to interact with the system.

