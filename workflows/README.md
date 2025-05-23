# Reusable Workflows

This directory contains reusable workflows and prompts that can be used across different projects and tasks.

## Available Workflows

### UI Design Prompt

A comprehensive prompt for Claude Sonnet 3.7 to create professional React UI mockups.

**Location:** [prompts/ui-design-prompt.md](./prompts/ui-design-prompt.md)

**Usage:**
1. Copy the content of the prompt file
2. Paste it into your Claude Sonnet 3.7 conversation
3. Add your specific UI requirements after the prompt
4. Example request: "Using the design system described above, create a UI mockup for a user profile page with the following sections: profile header with avatar, user stats, recent activity, and settings."

**Features:**
- Detailed design system guidelines (typography, colors, spacing)
- React implementation best practices
- Accessibility considerations
- Responsive design principles
- Dark mode support

**Output Format:**
When used correctly, Claude will provide:
1. A detailed visual description of the UI design
2. Complete, functional React component code using TypeScript and Tailwind CSS
3. Explanations of key design decisions and component interactions
4. Responsive considerations for different screen sizes
5. Dark mode implementation details

## Adding New Workflows

To add a new reusable workflow:
1. Create a new file in the appropriate subdirectory
2. Document the workflow in this README
3. Include usage instructions and examples

