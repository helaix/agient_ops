"""
Dependency Graph Analysis Module

This module provides utilities for analyzing and manipulating dependency graphs
created from Linear issues and their blocking relationships.
"""

import networkx as nx
from typing import Dict, List, Set, Tuple, Optional
from dataclasses import dataclass
from .linear_api_client import LinearIssue


@dataclass
class DependencyNode:
    """Represents a node in the dependency graph."""
    issue_id: str
    identifier: str
    title: str
    state: str
    priority: int
    assignee_id: Optional[str] = None
    estimated_effort: Optional[int] = None  # In hours or story points


@dataclass
class GraphMetrics:
    """Metrics calculated from the dependency graph."""
    total_nodes: int
    total_edges: int
    critical_path_length: int
    max_parallel_branches: int
    bottleneck_nodes: List[str]
    leaf_nodes: List[str]  # Nodes with no dependencies
    root_nodes: List[str]  # Nodes that don't block anything


class DependencyGraph:
    """Manages and analyzes dependency relationships between Linear issues."""
    
    def __init__(self):
        """Initialize an empty dependency graph."""
        self.graph = nx.DiGraph()  # Directed graph for dependencies
        self.nodes: Dict[str, DependencyNode] = {}
    
    def add_issue(self, issue: LinearIssue, estimated_effort: Optional[int] = None):
        """Add an issue to the dependency graph.
        
        Args:
            issue: LinearIssue object
            estimated_effort: Optional effort estimate in hours or story points
        """
        node = DependencyNode(
            issue_id=issue.id,
            identifier=issue.identifier,
            title=issue.title,
            state=issue.state,
            priority=issue.priority,
            assignee_id=issue.assignee_id,
            estimated_effort=estimated_effort
        )
        
        self.nodes[issue.id] = node
        self.graph.add_node(issue.id, **node.__dict__)
        
        # Add edges for blocking relationships
        for blocked_issue_id in issue.blocking_issues:
            self.graph.add_edge(issue.id, blocked_issue_id)
    
    def add_issues(self, issues: List[LinearIssue], effort_estimates: Optional[Dict[str, int]] = None):
        """Add multiple issues to the dependency graph.
        
        Args:
            issues: List of LinearIssue objects
            effort_estimates: Optional dictionary mapping issue IDs to effort estimates
        """
        effort_estimates = effort_estimates or {}
        
        for issue in issues:
            estimated_effort = effort_estimates.get(issue.id)
            self.add_issue(issue, estimated_effort)
    
    def get_critical_path(self) -> List[str]:
        """Calculate the critical path through the dependency graph.
        
        Returns:
            List of issue IDs representing the critical path
        """
        if not self.graph.nodes:
            return []
        
        # Find the longest path in the DAG
        try:
            # NetworkX's dag_longest_path finds the longest path in a DAG
            return nx.dag_longest_path(self.graph)
        except nx.NetworkXError:
            # Graph has cycles, need to handle this case
            return self._find_longest_path_with_cycles()
    
    def _find_longest_path_with_cycles(self) -> List[str]:
        """Find longest path when graph has cycles (shouldn't happen in well-formed dependencies)."""
        # For now, return empty list if cycles detected
        # In practice, this indicates a problem with the dependency setup
        return []
    
    def get_critical_path_with_effort(self) -> Tuple[List[str], int]:
        """Calculate the critical path considering effort estimates.
        
        Returns:
            Tuple of (critical path issue IDs, total effort)
        """
        if not self.graph.nodes:
            return [], 0
        
        # Create a copy of the graph with effort-based weights
        weighted_graph = self.graph.copy()
        
        for node_id in weighted_graph.nodes:
            node_data = self.nodes[node_id]
            effort = node_data.estimated_effort or 1  # Default to 1 if no estimate
            weighted_graph.nodes[node_id]['weight'] = effort
        
        try:
            # Find longest path by weight
            path = nx.dag_longest_path(weighted_graph, weight='weight')
            total_effort = sum(self.nodes[node_id].estimated_effort or 1 for node_id in path)
            return path, total_effort
        except nx.NetworkXError:
            return [], 0
    
    def get_parallel_branches(self) -> List[List[str]]:
        """Identify independent branches that can be executed in parallel.
        
        Returns:
            List of branches, where each branch is a list of issue IDs
        """
        if not self.graph.nodes:
            return []
        
        # Find all root nodes (no incoming edges)
        root_nodes = [node for node in self.graph.nodes if self.graph.in_degree(node) == 0]
        
        branches = []
        visited = set()
        
        for root in root_nodes:
            if root not in visited:
                branch = self._get_branch_from_node(root, visited)
                if branch:
                    branches.append(branch)
        
        return branches
    
    def _get_branch_from_node(self, start_node: str, visited: Set[str]) -> List[str]:
        """Get all nodes in a branch starting from a given node."""
        branch = []
        queue = [start_node]
        
        while queue:
            node = queue.pop(0)
            if node not in visited:
                visited.add(node)
                branch.append(node)
                
                # Add successors to queue
                for successor in self.graph.successors(node):
                    if successor not in visited:
                        queue.append(successor)
        
        return branch
    
    def get_bottleneck_nodes(self) -> List[str]:
        """Identify bottleneck nodes that block the most other issues.
        
        Returns:
            List of issue IDs sorted by number of blocked issues (descending)
        """
        bottlenecks = []
        
        for node_id in self.graph.nodes:
            # Count how many nodes this node blocks (directly and indirectly)
            blocked_count = len(list(nx.descendants(self.graph, node_id)))
            bottlenecks.append((node_id, blocked_count))
        
        # Sort by blocked count (descending)
        bottlenecks.sort(key=lambda x: x[1], reverse=True)
        
        return [node_id for node_id, _ in bottlenecks if _ > 0]
    
    def get_ready_issues(self, completed_issues: Set[str]) -> List[str]:
        """Get issues that are ready to be worked on (all dependencies completed).
        
        Args:
            completed_issues: Set of issue IDs that have been completed
            
        Returns:
            List of issue IDs that are ready to start
        """
        ready = []
        
        for node_id in self.graph.nodes:
            if node_id in completed_issues:
                continue
            
            # Check if all dependencies are completed
            dependencies = list(self.graph.predecessors(node_id))
            if all(dep_id in completed_issues for dep_id in dependencies):
                ready.append(node_id)
        
        return ready
    
    def get_blocked_issues(self, completed_issues: Set[str]) -> List[str]:
        """Get issues that are blocked by incomplete dependencies.
        
        Args:
            completed_issues: Set of issue IDs that have been completed
            
        Returns:
            List of issue IDs that are currently blocked
        """
        blocked = []
        
        for node_id in self.graph.nodes:
            if node_id in completed_issues:
                continue
            
            # Check if any dependencies are incomplete
            dependencies = list(self.graph.predecessors(node_id))
            if dependencies and not all(dep_id in completed_issues for dep_id in dependencies):
                blocked.append(node_id)
        
        return blocked
    
    def calculate_metrics(self) -> GraphMetrics:
        """Calculate comprehensive metrics for the dependency graph.
        
        Returns:
            GraphMetrics object with calculated metrics
        """
        critical_path = self.get_critical_path()
        bottlenecks = self.get_bottleneck_nodes()
        parallel_branches = self.get_parallel_branches()
        
        # Find leaf nodes (no outgoing edges)
        leaf_nodes = [node for node in self.graph.nodes if self.graph.out_degree(node) == 0]
        
        # Find root nodes (no incoming edges)
        root_nodes = [node for node in self.graph.nodes if self.graph.in_degree(node) == 0]
        
        return GraphMetrics(
            total_nodes=len(self.graph.nodes),
            total_edges=len(self.graph.edges),
            critical_path_length=len(critical_path),
            max_parallel_branches=len(parallel_branches),
            bottleneck_nodes=bottlenecks[:5],  # Top 5 bottlenecks
            leaf_nodes=leaf_nodes,
            root_nodes=root_nodes
        )
    
    def simulate_completion_impact(self, completed_issue_id: str) -> Dict[str, List[str]]:
        """Simulate the impact of completing a specific issue.
        
        Args:
            completed_issue_id: ID of the issue to simulate completion for
            
        Returns:
            Dictionary with 'newly_ready' and 'still_blocked' issue lists
        """
        # Get current state
        completed_issues = {completed_issue_id}
        
        # Find issues that would become ready
        newly_ready = []
        still_blocked = []
        
        for node_id in self.graph.nodes:
            if node_id == completed_issue_id:
                continue
            
            dependencies = list(self.graph.predecessors(node_id))
            if not dependencies:
                continue  # No dependencies, already ready
            
            if completed_issue_id in dependencies:
                # This issue depends on the completed one
                remaining_deps = [dep for dep in dependencies if dep != completed_issue_id]
                if not remaining_deps:
                    newly_ready.append(node_id)
                else:
                    still_blocked.append(node_id)
        
        return {
            'newly_ready': newly_ready,
            'still_blocked': still_blocked
        }
    
    def export_to_mermaid(self) -> str:
        """Export the dependency graph to Mermaid diagram format.
        
        Returns:
            Mermaid diagram string
        """
        lines = ["graph TD"]
        
        # Add nodes with labels
        for node_id, node_data in self.nodes.items():
            label = f"{node_data.identifier}: {node_data.title[:30]}..."
            lines.append(f'    {node_id}["{label}"]')
        
        # Add edges
        for source, target in self.graph.edges:
            lines.append(f"    {source} --> {target}")
        
        # Add styling for different states
        for node_id, node_data in self.nodes.items():
            if node_data.state.lower() in ['done', 'completed']:
                lines.append(f"    {node_id} --> {node_id}_done[Done]")
                lines.append(f"    style {node_id}_done fill:#90EE90")
            elif node_data.state.lower() in ['in progress', 'started']:
                lines.append(f"    style {node_id} fill:#FFE4B5")
        
        return "\n".join(lines)
    
    def get_dependency_levels(self) -> Dict[int, List[str]]:
        """Get issues organized by dependency level (topological ordering).
        
        Returns:
            Dictionary mapping level number to list of issue IDs at that level
        """
        if not self.graph.nodes:
            return {}
        
        try:
            # Get topological ordering
            topo_order = list(nx.topological_sort(self.graph))
            
            # Calculate levels
            levels = {}
            node_levels = {}
            
            for node in topo_order:
                # Level is max level of predecessors + 1
                predecessors = list(self.graph.predecessors(node))
                if not predecessors:
                    level = 0
                else:
                    level = max(node_levels[pred] for pred in predecessors) + 1
                
                node_levels[node] = level
                
                if level not in levels:
                    levels[level] = []
                levels[level].append(node)
            
            return levels
        except nx.NetworkXError:
            # Graph has cycles
            return {}


# Utility functions for common dependency patterns
def create_sequential_dependencies(issues: List[LinearIssue]) -> DependencyGraph:
    """Create a sequential dependency chain from a list of issues.
    
    Args:
        issues: List of LinearIssue objects in dependency order
        
    Returns:
        DependencyGraph with sequential dependencies
    """
    graph = DependencyGraph()
    
    for i, issue in enumerate(issues):
        # Modify the issue to have blocking relationship with next issue
        if i < len(issues) - 1:
            issue.blocking_issues = [issues[i + 1].id]
        
        graph.add_issue(issue)
    
    return graph


def create_parallel_dependencies(main_issue: LinearIssue, parallel_issues: List[LinearIssue], 
                                final_issue: LinearIssue) -> DependencyGraph:
    """Create a dependency pattern where multiple issues can run in parallel.
    
    Args:
        main_issue: The initial issue that blocks all parallel issues
        parallel_issues: List of issues that can run in parallel
        final_issue: The final issue that is blocked by all parallel issues
        
    Returns:
        DependencyGraph with parallel dependency pattern
    """
    graph = DependencyGraph()
    
    # Main issue blocks all parallel issues
    main_issue.blocking_issues = [issue.id for issue in parallel_issues]
    graph.add_issue(main_issue)
    
    # All parallel issues block the final issue
    for issue in parallel_issues:
        issue.blocking_issues = [final_issue.id]
        graph.add_issue(issue)
    
    # Final issue is blocked by all parallel issues
    final_issue.blocked_by_issues = [issue.id for issue in parallel_issues]
    graph.add_issue(final_issue)
    
    return graph

