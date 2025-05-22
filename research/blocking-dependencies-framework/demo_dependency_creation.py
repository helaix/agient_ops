#!/usr/bin/env python3
"""
Demonstration of Linear Dependency Creation

This script demonstrates the practical use of Linear's blocking dependency features
for autonomous coding workflows. It creates real Linear issues with dependency
relationships to showcase the concepts explored in this research.
"""

import os
import sys
from typing import List, Dict

# Add the common module to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'common'))

from linear_api_client import LinearAPIClient, LinearIssue


def create_feature_implementation_scenario(client: LinearAPIClient, team_id: str, project_id: str) -> List[LinearIssue]:
    """Create a realistic feature implementation scenario with dependencies.
    
    Scenario: Implement a user notification system
    Dependencies: Database → API → Frontend → Testing
    """
    print("Creating Feature Implementation Scenario: User Notification System")
    
    # 1. Database Schema Changes
    db_issue = client.create_issue(
        title="[DEMO] Database Schema for Notification System",
        description="""Create database schema for the user notification system.

**Requirements:**
- Create notifications table with fields: id, user_id, type, title, message, read_status, created_at
- Create notification_preferences table for user settings
- Add indexes for efficient querying
- Create migration scripts

**Acceptance Criteria:**
- [ ] Notifications table created with proper constraints
- [ ] User preferences table created
- [ ] Indexes added for performance
- [ ] Migration scripts tested

**Estimated Effort:** 8 hours""",
        team_id=team_id,
        project_id=project_id,
        priority=4  # High priority as it blocks everything else
    )
    
    # 2. API Implementation
    api_issue = client.create_issue(
        title="[DEMO] Notification API Endpoints",
        description="""Implement REST API endpoints for notification management.

**Requirements:**
- GET /api/notifications - List user notifications
- POST /api/notifications - Create notification (admin only)
- PUT /api/notifications/{id}/read - Mark as read
- GET /api/notifications/preferences - Get user preferences
- PUT /api/notifications/preferences - Update preferences

**Acceptance Criteria:**
- [ ] All endpoints implemented with proper validation
- [ ] Authentication and authorization in place
- [ ] Error handling and status codes
- [ ] API documentation updated

**Dependencies:** Requires database schema to be completed first.

**Estimated Effort:** 16 hours""",
        team_id=team_id,
        project_id=project_id,
        priority=3
    )
    
    # 3. Frontend Components
    frontend_issue = client.create_issue(
        title="[DEMO] Notification UI Components",
        description="""Create frontend components for notification system.

**Requirements:**
- Notification bell icon with unread count
- Notification dropdown/panel
- Notification preferences page
- Toast notifications for real-time alerts
- Responsive design for mobile

**Acceptance Criteria:**
- [ ] Bell icon shows correct unread count
- [ ] Dropdown displays notifications with proper formatting
- [ ] Preferences page allows customization
- [ ] Real-time updates work correctly
- [ ] Mobile-responsive design

**Dependencies:** Requires API endpoints to be completed first.

**Estimated Effort:** 20 hours""",
        team_id=team_id,
        project_id=project_id,
        priority=2
    )
    
    # 4. Testing Suite
    testing_issue = client.create_issue(
        title="[DEMO] Notification System Testing",
        description="""Comprehensive testing for notification system.

**Requirements:**
- Unit tests for API endpoints
- Integration tests for database operations
- Frontend component tests
- End-to-end user workflow tests
- Performance testing for high notification volumes

**Acceptance Criteria:**
- [ ] >90% code coverage for backend
- [ ] All API endpoints tested
- [ ] Frontend components tested
- [ ] E2E tests for critical user flows
- [ ] Performance benchmarks established

**Dependencies:** Requires all components to be implemented first.

**Estimated Effort:** 12 hours""",
        team_id=team_id,
        project_id=project_id,
        priority=1
    )
    
    # Create blocking relationships
    print("Creating dependency relationships...")
    
    # Database blocks API
    client.create_issue_relation(db_issue.id, api_issue.id, "blocks")
    
    # API blocks Frontend
    client.create_issue_relation(api_issue.id, frontend_issue.id, "blocks")
    
    # Both API and Frontend block Testing
    client.create_issue_relation(api_issue.id, testing_issue.id, "blocks")
    client.create_issue_relation(frontend_issue.id, testing_issue.id, "blocks")
    
    return [db_issue, api_issue, frontend_issue, testing_issue]


def create_parallel_execution_scenario(client: LinearAPIClient, team_id: str, project_id: str) -> List[LinearIssue]:
    """Create a scenario demonstrating parallel execution opportunities.
    
    Scenario: Multi-platform mobile app deployment
    Dependencies: Setup → (iOS + Android + Backend) → Testing
    """
    print("Creating Parallel Execution Scenario: Multi-platform App Deployment")
    
    # 1. Infrastructure Setup (blocks everything)
    infra_issue = client.create_issue(
        title="[DEMO] Mobile App Infrastructure Setup",
        description="""Set up infrastructure for mobile app deployment.

**Requirements:**
- Configure CI/CD pipelines for iOS and Android
- Set up app store accounts and certificates
- Configure backend API infrastructure
- Set up monitoring and analytics

**Estimated Effort:** 12 hours""",
        team_id=team_id,
        project_id=project_id,
        priority=4
    )
    
    # 2. iOS Development (can run in parallel with Android)
    ios_issue = client.create_issue(
        title="[DEMO] iOS App Development",
        description="""Develop iOS version of the mobile app.

**Requirements:**
- Implement core app functionality
- iOS-specific UI/UX optimizations
- App Store submission preparation
- iOS testing and validation

**Dependencies:** Requires infrastructure setup.

**Estimated Effort:** 24 hours""",
        team_id=team_id,
        project_id=project_id,
        priority=3
    )
    
    # 3. Android Development (can run in parallel with iOS)
    android_issue = client.create_issue(
        title="[DEMO] Android App Development",
        description="""Develop Android version of the mobile app.

**Requirements:**
- Implement core app functionality
- Android-specific UI/UX optimizations
- Google Play Store submission preparation
- Android testing and validation

**Dependencies:** Requires infrastructure setup.

**Estimated Effort:** 24 hours""",
        team_id=team_id,
        project_id=project_id,
        priority=3
    )
    
    # 4. Backend API (can run in parallel with mobile apps)
    backend_issue = client.create_issue(
        title="[DEMO] Mobile Backend API",
        description="""Develop backend API for mobile applications.

**Requirements:**
- User authentication and management
- Core business logic APIs
- Push notification service
- Data synchronization endpoints

**Dependencies:** Requires infrastructure setup.

**Estimated Effort:** 20 hours""",
        team_id=team_id,
        project_id=project_id,
        priority=3
    )
    
    # 5. Integration Testing (blocked by all parallel work)
    integration_issue = client.create_issue(
        title="[DEMO] Mobile App Integration Testing",
        description="""End-to-end testing of complete mobile app system.

**Requirements:**
- Cross-platform functionality testing
- API integration testing
- Performance and load testing
- User acceptance testing

**Dependencies:** Requires all platform development to be completed.

**Estimated Effort:** 16 hours""",
        team_id=team_id,
        project_id=project_id,
        priority=2
    )
    
    # Create dependency relationships
    print("Creating parallel execution dependencies...")
    
    # Infrastructure blocks all parallel work
    client.create_issue_relation(infra_issue.id, ios_issue.id, "blocks")
    client.create_issue_relation(infra_issue.id, android_issue.id, "blocks")
    client.create_issue_relation(infra_issue.id, backend_issue.id, "blocks")
    
    # All parallel work blocks integration testing
    client.create_issue_relation(ios_issue.id, integration_issue.id, "blocks")
    client.create_issue_relation(android_issue.id, integration_issue.id, "blocks")
    client.create_issue_relation(backend_issue.id, integration_issue.id, "blocks")
    
    return [infra_issue, ios_issue, android_issue, backend_issue, integration_issue]


def analyze_dependency_scenarios(client: LinearAPIClient, scenarios: Dict[str, List[LinearIssue]]):
    """Analyze the created dependency scenarios and demonstrate insights."""
    print("\n" + "="*60)
    print("DEPENDENCY ANALYSIS RESULTS")
    print("="*60)
    
    for scenario_name, issues in scenarios.items():
        print(f"\n{scenario_name.upper()}:")
        print("-" * len(scenario_name))
        
        # Retrieve issues with their current dependency relationships
        issues_with_relations = []
        for issue in issues:
            issue_with_relations = client.get_issue_with_relations(issue.id)
            issues_with_relations.append(issue_with_relations)
        
        # Analyze dependency patterns
        print(f"Total Issues: {len(issues_with_relations)}")
        
        # Find root issues (no dependencies)
        root_issues = [issue for issue in issues_with_relations if not issue.blocked_by_issues]
        print(f"Root Issues (can start immediately): {len(root_issues)}")
        for issue in root_issues:
            print(f"  - {issue.identifier}: {issue.title}")
        
        # Find leaf issues (don't block anything)
        leaf_issues = [issue for issue in issues_with_relations if not issue.blocking_issues]
        print(f"Leaf Issues (final deliverables): {len(leaf_issues)}")
        for issue in leaf_issues:
            print(f"  - {issue.identifier}: {issue.title}")
        
        # Find bottleneck issues (block multiple others)
        bottlenecks = [(issue, len(issue.blocking_issues)) for issue in issues_with_relations if len(issue.blocking_issues) > 1]
        bottlenecks.sort(key=lambda x: x[1], reverse=True)
        if bottlenecks:
            print(f"Bottleneck Issues (block multiple others):")
            for issue, count in bottlenecks:
                print(f"  - {issue.identifier}: {issue.title} (blocks {count} issues)")
        
        # Calculate potential parallel work
        parallel_opportunities = len([issue for issue in issues_with_relations 
                                    if len(issue.blocked_by_issues) <= 1 and len(issue.blocking_issues) == 0])
        print(f"Potential Parallel Work Opportunities: {parallel_opportunities}")


def main():
    """Main demonstration function."""
    print("Linear Dependency Management Demonstration")
    print("=" * 50)
    
    # Initialize Linear API client
    try:
        client = LinearAPIClient()
        print("✓ Linear API client initialized successfully")
    except Exception as e:
        print(f"✗ Failed to initialize Linear API client: {e}")
        return
    
    # Configuration
    team_id = "b98d6ca1-f890-45f9-9ff1-d1b47c2f3645"  # Helaix team
    project_id = "9826e06b-1c61-4f0a-841a-74e100b6a30a"  # Meta/DX project
    
    scenarios = {}
    
    try:
        # Create demonstration scenarios
        print("\n1. Creating Feature Implementation Scenario...")
        feature_issues = create_feature_implementation_scenario(client, team_id, project_id)
        scenarios["Feature Implementation"] = feature_issues
        
        print("\n2. Creating Parallel Execution Scenario...")
        parallel_issues = create_parallel_execution_scenario(client, team_id, project_id)
        scenarios["Parallel Execution"] = parallel_issues
        
        # Analyze the created scenarios
        analyze_dependency_scenarios(client, scenarios)
        
        print("\n" + "="*60)
        print("DEMONSTRATION COMPLETE")
        print("="*60)
        print("\nKey Insights Demonstrated:")
        print("1. Sequential Dependencies: Database → API → Frontend → Testing")
        print("2. Parallel Opportunities: iOS + Android + Backend can run simultaneously")
        print("3. Bottleneck Identification: Infrastructure setup blocks multiple streams")
        print("4. Critical Path Analysis: Longest dependency chain determines timeline")
        print("5. Resource Optimization: Parallel work maximizes team efficiency")
        
        print(f"\nCreated {sum(len(issues) for issues in scenarios.values())} demonstration issues")
        print("These issues showcase practical applications of blocking dependencies")
        print("in autonomous coding workflows.")
        
    except Exception as e:
        print(f"✗ Error during demonstration: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

