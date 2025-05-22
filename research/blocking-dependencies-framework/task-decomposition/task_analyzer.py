"""
Task Analyzer Module

This module provides functionality for analyzing task descriptions and identifying
components, requirements, and patterns that can guide automatic decomposition.
"""

import re
import spacy
from typing import List, Dict, Set, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json


class TaskType(Enum):
    """Enumeration of common task types in software development."""
    FEATURE_IMPLEMENTATION = "feature_implementation"
    BUG_FIX = "bug_fix"
    INFRASTRUCTURE = "infrastructure"
    DATABASE_MIGRATION = "database_migration"
    API_DEVELOPMENT = "api_development"
    FRONTEND_DEVELOPMENT = "frontend_development"
    TESTING = "testing"
    DEPLOYMENT = "deployment"
    REFACTORING = "refactoring"
    DOCUMENTATION = "documentation"
    SECURITY = "security"
    PERFORMANCE = "performance"


class ComponentType(Enum):
    """Enumeration of software component types."""
    DATABASE = "database"
    API = "api"
    FRONTEND = "frontend"
    BACKEND = "backend"
    INFRASTRUCTURE = "infrastructure"
    TESTING = "testing"
    DOCUMENTATION = "documentation"
    SECURITY = "security"
    MONITORING = "monitoring"
    DEPLOYMENT = "deployment"


@dataclass
class Requirement:
    """Represents a specific requirement extracted from a task description."""
    text: str
    component_type: ComponentType
    priority: int  # 1-5, where 5 is highest
    complexity: int  # 1-5, where 5 is most complex
    keywords: List[str]


@dataclass
class TaskComponent:
    """Represents a component identified within a task."""
    name: str
    description: str
    component_type: ComponentType
    requirements: List[Requirement]
    estimated_effort: Optional[int] = None  # In hours
    dependencies: List[str] = None  # Names of other components this depends on

    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []


@dataclass
class TaskAnalysisResult:
    """Result of analyzing a task description."""
    task_type: TaskType
    components: List[TaskComponent]
    overall_complexity: int  # 1-5
    estimated_total_effort: Optional[int] = None
    suggested_decomposition: List[str] = None  # Suggested subtask titles

    def __post_init__(self):
        if self.suggested_decomposition is None:
            self.suggested_decomposition = []


class TaskAnalyzer:
    """Analyzes task descriptions to identify components and patterns."""
    
    def __init__(self):
        """Initialize the task analyzer with NLP models and pattern databases."""
        # Load spaCy model for NLP processing
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Fallback if spaCy model not available
            self.nlp = None
        
        # Define keyword patterns for different component types
        self.component_keywords = {
            ComponentType.DATABASE: [
                'database', 'schema', 'table', 'migration', 'sql', 'query',
                'index', 'constraint', 'foreign key', 'primary key', 'orm',
                'postgres', 'mysql', 'mongodb', 'redis', 'data model'
            ],
            ComponentType.API: [
                'api', 'endpoint', 'rest', 'graphql', 'service', 'microservice',
                'route', 'controller', 'middleware', 'authentication', 'authorization',
                'jwt', 'oauth', 'webhook', 'integration', 'third-party'
            ],
            ComponentType.FRONTEND: [
                'frontend', 'ui', 'interface', 'component', 'react', 'vue', 'angular',
                'html', 'css', 'javascript', 'typescript', 'responsive', 'mobile',
                'web', 'browser', 'user experience', 'accessibility'
            ],
            ComponentType.BACKEND: [
                'backend', 'server', 'logic', 'business logic', 'processing',
                'algorithm', 'computation', 'service layer', 'domain model',
                'validation', 'transformation', 'workflow'
            ],
            ComponentType.INFRASTRUCTURE: [
                'infrastructure', 'deployment', 'docker', 'kubernetes', 'aws',
                'cloud', 'server', 'hosting', 'cdn', 'load balancer',
                'scaling', 'container', 'orchestration', 'devops'
            ],
            ComponentType.TESTING: [
                'test', 'testing', 'unit test', 'integration test', 'e2e',
                'automation', 'qa', 'quality assurance', 'validation',
                'verification', 'coverage', 'mock', 'stub'
            ],
            ComponentType.SECURITY: [
                'security', 'authentication', 'authorization', 'encryption',
                'ssl', 'tls', 'vulnerability', 'penetration test', 'audit',
                'compliance', 'gdpr', 'privacy', 'access control'
            ],
            ComponentType.MONITORING: [
                'monitoring', 'logging', 'metrics', 'analytics', 'tracking',
                'observability', 'alerting', 'dashboard', 'performance',
                'health check', 'uptime', 'error tracking'
            ],
            ComponentType.DEPLOYMENT: [
                'deployment', 'release', 'ci/cd', 'pipeline', 'build',
                'staging', 'production', 'rollback', 'blue-green',
                'canary', 'feature flag', 'environment'
            ],
            ComponentType.DOCUMENTATION: [
                'documentation', 'docs', 'readme', 'guide', 'tutorial',
                'api docs', 'specification', 'manual', 'wiki', 'knowledge base'
            ]
        }
        
        # Define task type patterns
        self.task_type_patterns = {
            TaskType.FEATURE_IMPLEMENTATION: [
                'implement', 'add', 'create', 'build', 'develop', 'feature',
                'functionality', 'capability', 'enhancement'
            ],
            TaskType.BUG_FIX: [
                'fix', 'bug', 'issue', 'problem', 'error', 'defect',
                'broken', 'not working', 'incorrect', 'resolve'
            ],
            TaskType.REFACTORING: [
                'refactor', 'refactoring', 'restructure', 'reorganize',
                'clean up', 'optimize', 'improve', 'modernize'
            ],
            TaskType.PERFORMANCE: [
                'performance', 'optimize', 'speed up', 'faster', 'efficiency',
                'latency', 'throughput', 'bottleneck', 'slow'
            ]
        }
        
        # Define common dependency patterns
        self.dependency_patterns = {
            'database_first': [
                ComponentType.DATABASE,
                ComponentType.API,
                ComponentType.FRONTEND
            ],
            'infrastructure_first': [
                ComponentType.INFRASTRUCTURE,
                ComponentType.BACKEND,
                ComponentType.API,
                ComponentType.FRONTEND
            ],
            'api_first': [
                ComponentType.API,
                ComponentType.FRONTEND,
                ComponentType.TESTING
            ],
            'security_early': [
                ComponentType.SECURITY,
                ComponentType.API,
                ComponentType.FRONTEND
            ]
        }
    
    def analyze_task_description(self, description: str, title: str = "") -> TaskAnalysisResult:
        """Analyze a task description and extract components and patterns.
        
        Args:
            description: The task description text
            title: Optional task title for additional context
            
        Returns:
            TaskAnalysisResult with identified components and patterns
        """
        # Combine title and description for analysis
        full_text = f"{title} {description}".strip()
        
        # Identify task type
        task_type = self.identify_task_type(full_text)
        
        # Extract requirements
        requirements = self.extract_requirements(full_text)
        
        # Identify components
        components = self.identify_components(requirements, full_text)
        
        # Calculate overall complexity
        complexity = self.calculate_complexity(components, requirements)
        
        # Estimate effort
        total_effort = self.estimate_total_effort(components)
        
        # Generate suggested decomposition
        suggested_decomposition = self.generate_decomposition_suggestions(components, task_type)
        
        return TaskAnalysisResult(
            task_type=task_type,
            components=components,
            overall_complexity=complexity,
            estimated_total_effort=total_effort,
            suggested_decomposition=suggested_decomposition
        )
    
    def identify_task_type(self, text: str) -> TaskType:
        """Identify the primary type of the task based on keywords and patterns.
        
        Args:
            text: Text to analyze
            
        Returns:
            Identified TaskType
        """
        text_lower = text.lower()
        scores = {}
        
        for task_type, keywords in self.task_type_patterns.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            scores[task_type] = score
        
        # Return the task type with the highest score
        if scores:
            return max(scores, key=scores.get)
        
        # Default to feature implementation if no clear pattern
        return TaskType.FEATURE_IMPLEMENTATION
    
    def extract_requirements(self, text: str) -> List[Requirement]:
        """Extract specific requirements from the task description.
        
        Args:
            text: Text to analyze
            
        Returns:
            List of identified requirements
        """
        requirements = []
        text_lower = text.lower()
        
        # Use spaCy for sentence segmentation if available
        if self.nlp:
            doc = self.nlp(text)
            sentences = [sent.text for sent in doc.sents]
        else:
            # Fallback to simple sentence splitting
            sentences = re.split(r'[.!?]+', text)
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            # Identify component type for this sentence
            component_type = self._identify_sentence_component_type(sentence)
            
            # Extract keywords
            keywords = self._extract_keywords(sentence)
            
            # Calculate priority and complexity
            priority = self._calculate_priority(sentence, keywords)
            complexity = self._calculate_complexity_score(sentence, keywords)
            
            if component_type and keywords:
                requirements.append(Requirement(
                    text=sentence,
                    component_type=component_type,
                    priority=priority,
                    complexity=complexity,
                    keywords=keywords
                ))
        
        return requirements
    
    def identify_components(self, requirements: List[Requirement], full_text: str) -> List[TaskComponent]:
        """Identify distinct components based on requirements analysis.
        
        Args:
            requirements: List of extracted requirements
            full_text: Original task description
            
        Returns:
            List of identified task components
        """
        # Group requirements by component type
        component_groups = {}
        for req in requirements:
            if req.component_type not in component_groups:
                component_groups[req.component_type] = []
            component_groups[req.component_type].append(req)
        
        components = []
        for component_type, reqs in component_groups.items():
            # Create component name and description
            name = self._generate_component_name(component_type, reqs)
            description = self._generate_component_description(component_type, reqs)
            
            # Estimate effort for this component
            effort = self._estimate_component_effort(reqs)
            
            # Identify dependencies
            dependencies = self._identify_component_dependencies(component_type, component_groups.keys())
            
            components.append(TaskComponent(
                name=name,
                description=description,
                component_type=component_type,
                requirements=reqs,
                estimated_effort=effort,
                dependencies=dependencies
            ))
        
        return components
    
    def _identify_sentence_component_type(self, sentence: str) -> Optional[ComponentType]:
        """Identify the component type for a specific sentence."""
        sentence_lower = sentence.lower()
        scores = {}
        
        for component_type, keywords in self.component_keywords.items():
            score = sum(1 for keyword in keywords if keyword in sentence_lower)
            if score > 0:
                scores[component_type] = score
        
        if scores:
            return max(scores, key=scores.get)
        
        return None
    
    def _extract_keywords(self, sentence: str) -> List[str]:
        """Extract relevant keywords from a sentence."""
        sentence_lower = sentence.lower()
        keywords = []
        
        # Extract keywords from all component types
        for component_keywords in self.component_keywords.values():
            for keyword in component_keywords:
                if keyword in sentence_lower:
                    keywords.append(keyword)
        
        return list(set(keywords))  # Remove duplicates
    
    def _calculate_priority(self, sentence: str, keywords: List[str]) -> int:
        """Calculate priority score for a requirement."""
        sentence_lower = sentence.lower()
        
        # High priority indicators
        high_priority_words = ['critical', 'urgent', 'important', 'must', 'required', 'essential']
        medium_priority_words = ['should', 'recommended', 'preferred', 'desired']
        low_priority_words = ['nice to have', 'optional', 'future', 'enhancement']
        
        if any(word in sentence_lower for word in high_priority_words):
            return 5
        elif any(word in sentence_lower for word in medium_priority_words):
            return 3
        elif any(word in sentence_lower for word in low_priority_words):
            return 1
        else:
            return 2  # Default medium-low priority
    
    def _calculate_complexity_score(self, sentence: str, keywords: List[str]) -> int:
        """Calculate complexity score for a requirement."""
        sentence_lower = sentence.lower()
        
        # Complexity indicators
        high_complexity_words = ['complex', 'advanced', 'sophisticated', 'integration', 'migration']
        medium_complexity_words = ['implement', 'develop', 'create', 'build']
        low_complexity_words = ['simple', 'basic', 'straightforward', 'update', 'modify']
        
        # Base complexity on keywords and indicators
        complexity = len(keywords)  # More keywords = more complexity
        
        if any(word in sentence_lower for word in high_complexity_words):
            complexity += 3
        elif any(word in sentence_lower for word in medium_complexity_words):
            complexity += 1
        elif any(word in sentence_lower for word in low_complexity_words):
            complexity -= 1
        
        # Normalize to 1-5 scale
        return max(1, min(5, complexity))
    
    def _generate_component_name(self, component_type: ComponentType, requirements: List[Requirement]) -> str:
        """Generate a descriptive name for a component."""
        type_names = {
            ComponentType.DATABASE: "Database Schema",
            ComponentType.API: "API Implementation",
            ComponentType.FRONTEND: "Frontend Components",
            ComponentType.BACKEND: "Backend Logic",
            ComponentType.INFRASTRUCTURE: "Infrastructure Setup",
            ComponentType.TESTING: "Testing Suite",
            ComponentType.SECURITY: "Security Implementation",
            ComponentType.MONITORING: "Monitoring Setup",
            ComponentType.DEPLOYMENT: "Deployment Configuration",
            ComponentType.DOCUMENTATION: "Documentation"
        }
        
        return type_names.get(component_type, component_type.value.title())
    
    def _generate_component_description(self, component_type: ComponentType, requirements: List[Requirement]) -> str:
        """Generate a description for a component based on its requirements."""
        # Combine requirement texts
        req_texts = [req.text for req in requirements]
        
        # Create a summary description
        if len(req_texts) == 1:
            return req_texts[0]
        else:
            return f"Implement {component_type.value} components including: " + "; ".join(req_texts[:3])
    
    def _estimate_component_effort(self, requirements: List[Requirement]) -> int:
        """Estimate effort in hours for a component."""
        base_effort = {
            ComponentType.DATABASE: 8,
            ComponentType.API: 16,
            ComponentType.FRONTEND: 20,
            ComponentType.BACKEND: 16,
            ComponentType.INFRASTRUCTURE: 12,
            ComponentType.TESTING: 8,
            ComponentType.SECURITY: 12,
            ComponentType.MONITORING: 6,
            ComponentType.DEPLOYMENT: 8,
            ComponentType.DOCUMENTATION: 4
        }
        
        # Get base effort for component type
        effort = base_effort.get(requirements[0].component_type, 8)
        
        # Adjust based on complexity and number of requirements
        complexity_multiplier = sum(req.complexity for req in requirements) / len(requirements)
        requirement_multiplier = min(len(requirements), 3)  # Cap at 3x
        
        return int(effort * complexity_multiplier * requirement_multiplier)
    
    def _identify_component_dependencies(self, component_type: ComponentType, all_component_types: Set[ComponentType]) -> List[str]:
        """Identify dependencies for a component based on common patterns."""
        dependencies = []
        
        # Define dependency rules
        dependency_rules = {
            ComponentType.API: [ComponentType.DATABASE],
            ComponentType.FRONTEND: [ComponentType.API],
            ComponentType.TESTING: [ComponentType.API, ComponentType.FRONTEND],
            ComponentType.DEPLOYMENT: [ComponentType.INFRASTRUCTURE, ComponentType.API, ComponentType.FRONTEND],
            ComponentType.MONITORING: [ComponentType.INFRASTRUCTURE]
        }
        
        if component_type in dependency_rules:
            for dep_type in dependency_rules[component_type]:
                if dep_type in all_component_types:
                    dependencies.append(self._generate_component_name(dep_type, []))
        
        return dependencies
    
    def calculate_complexity(self, components: List[TaskComponent], requirements: List[Requirement]) -> int:
        """Calculate overall task complexity."""
        if not components:
            return 1
        
        # Factor in number of components, their individual complexity, and interactions
        component_count = len(components)
        avg_complexity = sum(sum(req.complexity for req in comp.requirements) / len(comp.requirements) 
                           for comp in components) / len(components)
        
        # Interaction complexity (more components = more interactions)
        interaction_factor = min(component_count / 2, 2)  # Cap at 2x
        
        overall = int(avg_complexity * interaction_factor)
        return max(1, min(5, overall))
    
    def estimate_total_effort(self, components: List[TaskComponent]) -> int:
        """Estimate total effort for all components."""
        return sum(comp.estimated_effort or 0 for comp in components)
    
    def generate_decomposition_suggestions(self, components: List[TaskComponent], task_type: TaskType) -> List[str]:
        """Generate suggested subtask titles based on identified components."""
        suggestions = []
        
        # Sort components by dependency order
        ordered_components = self._order_components_by_dependencies(components)
        
        for component in ordered_components:
            # Generate subtask title
            title = f"Implement {component.name}"
            if component.estimated_effort:
                title += f" ({component.estimated_effort}h)"
            
            suggestions.append(title)
        
        return suggestions
    
    def _order_components_by_dependencies(self, components: List[TaskComponent]) -> List[TaskComponent]:
        """Order components based on their dependencies."""
        # Simple topological sort based on component types
        type_order = [
            ComponentType.INFRASTRUCTURE,
            ComponentType.DATABASE,
            ComponentType.SECURITY,
            ComponentType.BACKEND,
            ComponentType.API,
            ComponentType.FRONTEND,
            ComponentType.TESTING,
            ComponentType.MONITORING,
            ComponentType.DEPLOYMENT,
            ComponentType.DOCUMENTATION
        ]
        
        # Sort components by their type order
        def get_order_index(component):
            try:
                return type_order.index(component.component_type)
            except ValueError:
                return len(type_order)  # Put unknown types at the end
        
        return sorted(components, key=get_order_index)


# Example usage and testing
if __name__ == "__main__":
    analyzer = TaskAnalyzer()
    
    # Test with example task descriptions
    test_cases = [
        {
            "title": "Implement User Authentication System",
            "description": "Create a complete user authentication system with social login support. This should include database schema for user accounts, REST API endpoints for login/logout, OAuth integration with Google and Facebook, frontend login components with responsive design, session management with JWT tokens, and comprehensive testing."
        },
        {
            "title": "Fix Performance Issues in Dashboard",
            "description": "The dashboard is loading slowly due to inefficient database queries and large payload sizes. Need to optimize the API endpoints, implement caching, reduce frontend bundle size, and add performance monitoring."
        },
        {
            "title": "Deploy Microservice to Production",
            "description": "Set up production infrastructure for the new user service. This includes Docker containerization, Kubernetes deployment configuration, CI/CD pipeline setup, monitoring and logging, security hardening, and health checks."
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n=== Test Case {i}: {test_case['title']} ===")
        
        result = analyzer.analyze_task_description(
            test_case['description'], 
            test_case['title']
        )
        
        print(f"Task Type: {result.task_type.value}")
        print(f"Overall Complexity: {result.overall_complexity}/5")
        print(f"Estimated Total Effort: {result.estimated_total_effort} hours")
        
        print(f"\nIdentified Components ({len(result.components)}):")
        for comp in result.components:
            print(f"- {comp.name} ({comp.component_type.value})")
            print(f"  Effort: {comp.estimated_effort}h")
            print(f"  Dependencies: {', '.join(comp.dependencies) if comp.dependencies else 'None'}")
            print(f"  Requirements: {len(comp.requirements)}")
        
        print(f"\nSuggested Decomposition:")
        for j, suggestion in enumerate(result.suggested_decomposition, 1):
            print(f"{j}. {suggestion}")

