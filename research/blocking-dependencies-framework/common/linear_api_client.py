"""
Linear API Client for Dependency Management Research

This module provides a standardized interface for interacting with Linear's API
to create, manage, and analyze blocking dependencies for research purposes.
"""

import os
import requests
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class LinearIssue:
    """Represents a Linear issue with dependency information."""
    id: str
    identifier: str
    title: str
    description: str
    state: str
    priority: int
    assignee_id: Optional[str] = None
    team_id: Optional[str] = None
    project_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    blocking_issues: List[str] = None
    blocked_by_issues: List[str] = None

    def __post_init__(self):
        if self.blocking_issues is None:
            self.blocking_issues = []
        if self.blocked_by_issues is None:
            self.blocked_by_issues = []


class LinearAPIClient:
    """Client for interacting with Linear's GraphQL API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the Linear API client.
        
        Args:
            api_key: Linear API key. If not provided, will try to get from environment.
        """
        self.api_key = api_key or os.getenv('LINEAR_API_KEY')
        if not self.api_key:
            raise ValueError("Linear API key is required. Set LINEAR_API_KEY environment variable or pass api_key parameter.")
        
        self.base_url = "https://api.linear.app/graphql"
        self.headers = {
            "Authorization": self.api_key,  # Remove Bearer prefix
            "Content-Type": "application/json"
        }
    
    def _execute_query(self, query: str, variables: Optional[Dict] = None) -> Dict[str, Any]:
        """Execute a GraphQL query against Linear's API.
        
        Args:
            query: GraphQL query string
            variables: Optional variables for the query
            
        Returns:
            Response data from the API
            
        Raises:
            Exception: If the API request fails
        """
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        
        response = requests.post(
            self.base_url,
            headers=self.headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"API request failed with status {response.status_code}: {response.text}")
        
        data = response.json()
        if "errors" in data:
            raise Exception(f"GraphQL errors: {data['errors']}")
        
        return data["data"]
    
    def create_issue(self, title: str, description: str, team_id: str, 
                    assignee_id: Optional[str] = None, priority: int = 0,
                    project_id: Optional[str] = None) -> LinearIssue:
        """Create a new Linear issue.
        
        Args:
            title: Issue title
            description: Issue description
            team_id: Team ID to create the issue in
            assignee_id: Optional assignee ID
            priority: Issue priority (0-4)
            project_id: Optional project ID
            
        Returns:
            Created LinearIssue object
        """
        query = """
        mutation IssueCreate($input: IssueCreateInput!) {
            issueCreate(input: $input) {
                success
                issue {
                    id
                    identifier
                    title
                    description
                    state {
                        name
                    }
                    priority
                    assignee {
                        id
                    }
                    team {
                        id
                    }
                    project {
                        id
                    }
                    createdAt
                    updatedAt
                }
            }
        }
        """
        
        variables = {
            "input": {
                "title": title,
                "description": description,
                "teamId": team_id,
                "priority": priority
            }
        }
        
        if assignee_id:
            variables["input"]["assigneeId"] = assignee_id
        if project_id:
            variables["input"]["projectId"] = project_id
        
        result = self._execute_query(query, variables)
        issue_data = result["issueCreate"]["issue"]
        
        return LinearIssue(
            id=issue_data["id"],
            identifier=issue_data["identifier"],
            title=issue_data["title"],
            description=issue_data["description"],
            state=issue_data["state"]["name"],
            priority=issue_data["priority"],
            assignee_id=issue_data["assignee"]["id"] if issue_data["assignee"] else None,
            team_id=issue_data["team"]["id"],
            project_id=issue_data["project"]["id"] if issue_data["project"] else None,
            created_at=datetime.fromisoformat(issue_data["createdAt"].replace('Z', '+00:00')),
            updated_at=datetime.fromisoformat(issue_data["updatedAt"].replace('Z', '+00:00'))
        )
    
    def create_issue_relation(self, issue_id: str, related_issue_id: str, 
                            relation_type: str = "blocks") -> bool:
        """Create a relationship between two issues.
        
        Args:
            issue_id: ID of the source issue
            related_issue_id: ID of the target issue
            relation_type: Type of relation ("blocks", "blocked_by", "related", etc.)
            
        Returns:
            True if successful
        """
        query = """
        mutation IssueRelationCreate($input: IssueRelationCreateInput!) {
            issueRelationCreate(input: $input) {
                success
                issueRelation {
                    id
                    type
                }
            }
        }
        """
        
        variables = {
            "input": {
                "issueId": issue_id,
                "relatedIssueId": related_issue_id,
                "type": relation_type
            }
        }
        
        result = self._execute_query(query, variables)
        return result["issueRelationCreate"]["success"]
    
    def get_issue_with_relations(self, issue_id: str) -> LinearIssue:
        """Get an issue with its dependency relationships.
        
        Args:
            issue_id: ID of the issue to retrieve
            
        Returns:
            LinearIssue object with dependency information
        """
        query = """
        query Issue($id: String!) {
            issue(id: $id) {
                id
                identifier
                title
                description
                state {
                    name
                }
                priority
                assignee {
                    id
                }
                team {
                    id
                }
                project {
                    id
                }
                createdAt
                updatedAt
                relations {
                    nodes {
                        type
                        relatedIssue {
                            id
                            identifier
                            title
                        }
                    }
                }
            }
        }
        """
        
        variables = {"id": issue_id}
        result = self._execute_query(query, variables)
        issue_data = result["issue"]
        
        # Parse relations
        blocking_issues = []
        blocked_by_issues = []
        
        for relation in issue_data["relations"]["nodes"]:
            if relation["type"] == "blocks":
                blocking_issues.append(relation["relatedIssue"]["id"])
            elif relation["type"] == "blocked_by":
                blocked_by_issues.append(relation["relatedIssue"]["id"])
        
        return LinearIssue(
            id=issue_data["id"],
            identifier=issue_data["identifier"],
            title=issue_data["title"],
            description=issue_data["description"],
            state=issue_data["state"]["name"],
            priority=issue_data["priority"],
            assignee_id=issue_data["assignee"]["id"] if issue_data["assignee"] else None,
            team_id=issue_data["team"]["id"],
            project_id=issue_data["project"]["id"] if issue_data["project"] else None,
            created_at=datetime.fromisoformat(issue_data["createdAt"].replace('Z', '+00:00')),
            updated_at=datetime.fromisoformat(issue_data["updatedAt"].replace('Z', '+00:00')),
            blocking_issues=blocking_issues,
            blocked_by_issues=blocked_by_issues
        )
    
    def get_team_issues_with_relations(self, team_id: str) -> List[LinearIssue]:
        """Get all issues for a team with their dependency relationships.
        
        Args:
            team_id: ID of the team
            
        Returns:
            List of LinearIssue objects with dependency information
        """
        query = """
        query TeamIssues($teamId: String!) {
            team(id: $teamId) {
                issues {
                    nodes {
                        id
                        identifier
                        title
                        description
                        state {
                            name
                        }
                        priority
                        assignee {
                            id
                        }
                        team {
                            id
                        }
                        project {
                            id
                        }
                        createdAt
                        updatedAt
                        relations {
                            nodes {
                                type
                                relatedIssue {
                                    id
                                    identifier
                                    title
                                }
                            }
                        }
                    }
                }
            }
        }
        """
        
        variables = {"teamId": team_id}
        result = self._execute_query(query, variables)
        
        issues = []
        for issue_data in result["team"]["issues"]["nodes"]:
            # Parse relations
            blocking_issues = []
            blocked_by_issues = []
            
            for relation in issue_data["relations"]["nodes"]:
                if relation["type"] == "blocks":
                    blocking_issues.append(relation["relatedIssue"]["id"])
                elif relation["type"] == "blocked_by":
                    blocked_by_issues.append(relation["relatedIssue"]["id"])
            
            issues.append(LinearIssue(
                id=issue_data["id"],
                identifier=issue_data["identifier"],
                title=issue_data["title"],
                description=issue_data["description"],
                state=issue_data["state"]["name"],
                priority=issue_data["priority"],
                assignee_id=issue_data["assignee"]["id"] if issue_data["assignee"] else None,
                team_id=issue_data["team"]["id"],
                project_id=issue_data["project"]["id"] if issue_data["project"] else None,
                created_at=datetime.fromisoformat(issue_data["createdAt"].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(issue_data["updatedAt"].replace('Z', '+00:00')),
                blocking_issues=blocking_issues,
                blocked_by_issues=blocked_by_issues
            ))
        
        return issues


# Example usage and testing functions
def create_example_dependency_chain(client: LinearAPIClient, team_id: str) -> List[LinearIssue]:
    """Create an example dependency chain for testing purposes.
    
    This creates a realistic scenario:
    Database Schema → API Implementation → Frontend Integration
    
    Args:
        client: LinearAPIClient instance
        team_id: Team ID to create issues in
        
    Returns:
        List of created issues in dependency order
    """
    # Create database schema issue
    db_issue = client.create_issue(
        title="Update Database Schema for User Profiles",
        description="Add new fields to user table to support enhanced profile features",
        team_id=team_id,
        priority=3
    )
    
    # Create API implementation issue
    api_issue = client.create_issue(
        title="Implement User Profile API Endpoints",
        description="Create REST endpoints for enhanced user profile management",
        team_id=team_id,
        priority=2
    )
    
    # Create frontend integration issue
    frontend_issue = client.create_issue(
        title="Integrate Enhanced User Profiles in Frontend",
        description="Update UI components to use new user profile features",
        team_id=team_id,
        priority=1
    )
    
    # Create blocking relationships
    client.create_issue_relation(db_issue.id, api_issue.id, "blocks")
    client.create_issue_relation(api_issue.id, frontend_issue.id, "blocks")
    
    return [db_issue, api_issue, frontend_issue]


if __name__ == "__main__":
    # Example usage
    client = LinearAPIClient()
    
    # Replace with actual team ID
    team_id = "b98d6ca1-f890-45f9-9ff1-d1b47c2f3645"  # Helaix team
    
    # Create example dependency chain
    issues = create_example_dependency_chain(client, team_id)
    
    print("Created dependency chain:")
    for issue in issues:
        print(f"- {issue.identifier}: {issue.title}")
    
    # Retrieve and display with relations
    print("\nDependency relationships:")
    for issue in issues:
        issue_with_relations = client.get_issue_with_relations(issue.id)
        print(f"{issue_with_relations.identifier}: blocks {len(issue_with_relations.blocking_issues)} issues, blocked by {len(issue_with_relations.blocked_by_issues)} issues")
