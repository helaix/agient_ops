#!/usr/bin/env python3
"""
Script to add cross-references between related documents.
"""

import os
import re
import sys
from pathlib import Path

# Define document relationships
DOCUMENT_RELATIONSHIPS = {
    # Decision Trees
    'docs/decision_trees/workflow_selection_tree.md': [
        'docs/decision_trees/task_analysis_decision_tree.md',
        'docs/decision_trees/delegation_decision_tree.md',
        'docs/decision_trees/implementation_decision_tree.md',
        'docs/decision_trees/communication_decision_tree.md',
        'docs/reference/linear_workflows_reference.md',
    ],
    'docs/decision_trees/task_analysis_decision_tree.md': [
        'docs/decision_trees/workflow_selection_tree.md',
        'docs/decision_trees/delegation_decision_tree.md',
        'docs/examples/linear_workflow_scenarios.md',
    ],
    'docs/decision_trees/delegation_decision_tree.md': [
        'docs/decision_trees/workflow_selection_tree.md',
        'docs/examples/linear_workflow_guide_delegation.md',
        'docs/reference/communication_delegation_sops.md',
    ],
    'docs/decision_trees/implementation_decision_tree.md': [
        'docs/decision_trees/workflow_selection_tree.md',
        'docs/examples/linear_workflow_guide_complex_tasks.md',
        'docs/src/content/docs/reference/agent_collaboration_implementation_guide.md',
    ],
    'docs/decision_trees/communication_decision_tree.md': [
        'docs/decision_trees/workflow_selection_tree.md',
        'docs/reference/communication_delegation_sops.md',
        'docs/troubleshooting/linear_communication_issues.md',
    ],
    
    # Examples
    'docs/examples/linear_workflow_scenarios.md': [
        'docs/examples/linear_workflow_guide_simple_tasks.md',
        'docs/examples/linear_workflow_guide_complex_tasks.md',
        'docs/examples/linear_workflow_guide_delegation.md',
        'docs/reference/linear_workflows_reference.md',
    ],
    'docs/examples/linear_workflow_guide_simple_tasks.md': [
        'docs/examples/linear_workflow_scenarios.md',
        'docs/decision_trees/workflow_selection_tree.md',
        'docs/reference/linear_workflows_reference.md',
    ],
    'docs/examples/linear_workflow_guide_complex_tasks.md': [
        'docs/examples/linear_workflow_scenarios.md',
        'docs/decision_trees/implementation_decision_tree.md',
        'docs/reference/linear_workflows_reference.md',
    ],
    'docs/examples/linear_workflow_guide_delegation.md': [
        'docs/examples/linear_workflow_scenarios.md',
        'docs/decision_trees/delegation_decision_tree.md',
        'docs/reference/communication_delegation_sops.md',
    ],
    
    # Reference
    'docs/reference/linear_workflows_reference.md': [
        'docs/examples/linear_workflow_scenarios.md',
        'docs/decision_trees/workflow_selection_tree.md',
        'docs/reference/linear_workflow_diagram.md',
    ],
    'docs/reference/linear_workflow_diagram.md': [
        'docs/reference/linear_workflows_reference.md',
        'docs/decision_trees/workflow_selection_tree.md',
    ],
    'docs/reference/communication_delegation_sops.md': [
        'docs/decision_trees/delegation_decision_tree.md',
        'docs/decision_trees/communication_decision_tree.md',
        'docs/examples/linear_workflow_guide_delegation.md',
    ],
    
    # Troubleshooting
    'docs/troubleshooting/common_linear_issues.md': [
        'docs/troubleshooting/linear_api_issues.md',
        'docs/troubleshooting/linear_delegation_issues.md',
        'docs/troubleshooting/linear_branch_management_issues.md',
        'docs/troubleshooting/linear_communication_issues.md',
        'docs/troubleshooting/linear_integration_issues.md',
        'docs/troubleshooting/research_summary.md',
    ],
    'docs/troubleshooting/linear_api_issues.md': [
        'docs/troubleshooting/common_linear_issues.md',
        'docs/reference/linear_workflows_reference.md',
    ],
    'docs/troubleshooting/linear_delegation_issues.md': [
        'docs/troubleshooting/common_linear_issues.md',
        'docs/decision_trees/delegation_decision_tree.md',
        'docs/reference/communication_delegation_sops.md',
    ],
    'docs/troubleshooting/linear_branch_management_issues.md': [
        'docs/troubleshooting/common_linear_issues.md',
        'docs/reference/linear_workflows_reference.md',
    ],
    'docs/troubleshooting/linear_communication_issues.md': [
        'docs/troubleshooting/common_linear_issues.md',
        'docs/decision_trees/communication_decision_tree.md',
        'docs/reference/communication_delegation_sops.md',
    ],
    'docs/troubleshooting/linear_integration_issues.md': [
        'docs/troubleshooting/common_linear_issues.md',
        'docs/reference/linear_workflows_reference.md',
    ],
    'docs/troubleshooting/research_summary.md': [
        'docs/troubleshooting/common_linear_issues.md',
    ],
    
    # Agent Collaboration
    'docs/src/content/docs/reference/agent_collaboration_workflow.md': [
        'docs/src/content/docs/reference/agent_collaboration_implementation_guide.md',
        'docs/src/content/docs/reference/agent_collaboration_quick_reference.md',
        'docs/reference/communication_delegation_sops.md',
    ],
    'docs/src/content/docs/reference/agent_collaboration_implementation_guide.md': [
        'docs/src/content/docs/reference/agent_collaboration_workflow.md',
        'docs/src/content/docs/reference/agent_collaboration_quick_reference.md',
        'docs/decision_trees/implementation_decision_tree.md',
    ],
    'docs/src/content/docs/reference/agent_collaboration_quick_reference.md': [
        'docs/src/content/docs/reference/agent_collaboration_workflow.md',
        'docs/src/content/docs/reference/agent_collaboration_implementation_guide.md',
    ],
}

def get_document_title(file_path):
    """Extract the title from a markdown document."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the first level 1 header
    match = re.search(r'^# (.+)$', content, re.MULTILINE)
    if match:
        return match.group(1)
    
    # If no level 1 header, use the filename
    return os.path.basename(file_path).replace('.md', '').replace('_', ' ').title()

def get_relative_path(from_path, to_path):
    """Get the relative path from one file to another."""
    from_dir = os.path.dirname(from_path)
    to_dir = os.path.dirname(to_path)
    
    # If in the same directory, just use the filename
    if from_dir == to_dir:
        return os.path.basename(to_path)
    
    # If in different directories, calculate the relative path
    from_parts = from_dir.split('/')
    to_parts = to_dir.split('/')
    
    # Find common prefix
    common_prefix_len = 0
    for i in range(min(len(from_parts), len(to_parts))):
        if from_parts[i] == to_parts[i]:
            common_prefix_len += 1
        else:
            break
    
    # Build relative path
    rel_path = '../' * (len(from_parts) - common_prefix_len)
    rel_path += '/'.join(to_parts[common_prefix_len:])
    
    if rel_path:
        rel_path += '/'
    
    rel_path += os.path.basename(to_path)
    
    return rel_path

def add_related_resources_section(file_path, related_paths):
    """Add a 'Related Resources' section to a markdown document."""
    if not related_paths:
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if the document already has a 'Related Resources' section
    if '## Related Resources' in content:
        print(f"  'Related Resources' section already exists in {file_path}")
        return
    
    # Build the 'Related Resources' section
    related_resources = "\n\n## Related Resources\n\n"
    
    for related_path in related_paths:
        related_title = get_document_title(related_path)
        relative_path = get_relative_path(file_path, related_path)
        related_resources += f"- [{related_title}]({relative_path})\n"
    
    # Add the 'Related Resources' section to the end of the document
    content += related_resources
    
    # Write the updated content back to the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  Added 'Related Resources' section to {file_path}")

def main():
    """Main function to add cross-references to all markdown files."""
    print("Adding cross-references to documentation files...")
    
    # Add 'Related Resources' sections to all documents
    for file_path, related_paths in DOCUMENT_RELATIONSHIPS.items():
        print(f"Processing {file_path}...")
        add_related_resources_section(file_path, related_paths)
    
    print("Cross-references added successfully!")

if __name__ == "__main__":
    main()

