# Gemini Live Interface to CodeGen

## Project Overview

This project implements a comprehensive Gemini Live Interface to CodeGen that enables voice and text interaction with CodeGen through Gemini, following the 8-step workflow pattern documented in the agient_ops repository.

## Project Structure

```
projects/gemini-live-interface-to-codegen/
├── README.md                    # This file
├── planning/                    # Planning phase documents
│   ├── 01-prd.md               # Product Requirements Document
│   ├── 02-architecture.md      # Architecture Document
│   ├── 03-ux-ui-plan.md        # UX/UI Plan
│   ├── 04-project-overview.md  # Project Overview
│   ├── 05-workplans/           # Detailed workplans
│   ├── 06-rules/               # AI assistant rules and prompts
│   ├── 07-spikes/              # Investigation and evaluation
│   └── 08-reviews/             # Review processes and checklists
├── docs/                       # Additional documentation
└── implementation/             # Implementation artifacts
```

## Workflow Steps

This project follows the 8-step workflow pattern:

1. **Product Requirements Document (PRD)** - Define what we're building and why
2. **Architecture Document** - Define how we'll build it
3. **UX/UI Plan** - Define the user experience and interface
4. **Project Overview** - Break down into implementable chunks
5. **Workplans** - Create detailed implementation instructions
6. **Rules** - Set up AI assistant rules and prompts
7. **Spikes** - Investigate and evaluate workplans
8. **Reviews** - Ensure code quality and identify issues

## Agent Collaboration

This project uses the agent collaboration patterns documented in agient_ops:
- Manager agent coordinates the overall workflow
- Child agents handle specific planning steps
- Proper scaffolding and communication protocols
- Linear issue hierarchy for tracking progress

## Repository

All work is conducted in the `agient_ops` repository following established patterns and guidelines.

## Branch

Work is conducted on the `feature/hlx-1688-manager-agent-gemini-live-interface-to-codegen` branch.

