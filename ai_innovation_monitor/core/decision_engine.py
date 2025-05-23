"""
Decision Engine - Autonomous decision making for AI innovation responses.

This module implements the core decision-making logic that determines how the
system should respond to detected AI innovations and changes.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import json
import numpy as np
from datetime import datetime, timedelta


class DecisionType(Enum):
    """Types of decisions the engine can make."""
    MONITOR_ONLY = "monitor_only"
    RESEARCH_REQUIRED = "research_required"
    IMMEDIATE_ADAPTATION = "immediate_adaptation"
    PLANNED_ADAPTATION = "planned_adaptation"
    ESCALATE_HUMAN = "escalate_human"
    NO_ACTION = "no_action"


class RiskLevel(Enum):
    """Risk levels for innovations."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    NEGLIGIBLE = "negligible"


@dataclass
class Innovation:
    """Represents an AI innovation detected by the system."""
    id: str
    title: str
    description: str
    source: str
    domain: str
    impact_score: float
    confidence: float
    detected_at: datetime
    metadata: Dict[str, Any]


@dataclass
class DecisionContext:
    """Context information for making decisions."""
    innovation: Innovation
    system_state: Dict[str, Any]
    historical_decisions: List[Dict[str, Any]]
    resource_availability: Dict[str, Any]
    risk_tolerance: Dict[str, float]


@dataclass
class Decision:
    """Represents a decision made by the engine."""
    decision_id: str
    decision_type: DecisionType
    innovation_id: str
    confidence: float
    reasoning: str
    actions: List[Dict[str, Any]]
    timeline: str
    resources_required: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    created_at: datetime


class DecisionEngine:
    """
    Autonomous decision engine for AI innovation responses.
    
    Uses a combination of rule-based logic and machine learning models
    to make decisions about how to respond to detected innovations.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the decision engine."""
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Decision rules and thresholds
        self.impact_thresholds = config.get("impact_thresholds", {
            "critical": 9.0,
            "high": 7.0,
            "medium": 5.0,
            "low": 3.0
        })
        
        self.confidence_thresholds = config.get("confidence_thresholds", {
            "high": 0.8,
            "medium": 0.6,
            "low": 0.4
        })
        
        self.risk_tolerance = config.get("risk_tolerance", {
            "security": 0.2,
            "performance": 0.5,
            "cost": 0.7,
            "compliance": 0.1
        })
        
        # Decision history for learning
        self.decision_history: List[Decision] = []
        self.max_history_size = config.get("max_history_size", 10000)
        
        # ML models (placeholder for now)
        self.impact_model = None
        self.risk_model = None
        
        # System state
        self.is_running = False
        
    async def start(self):
        """Start the decision engine."""
        self.logger.info("Starting Decision Engine")
        self.is_running = True
        
        # Load ML models if available
        await self._load_models()
        
        # Load historical decisions
        await self._load_decision_history()
        
        self.logger.info("Decision Engine started")
        
    async def stop(self):
        """Stop the decision engine."""
        self.logger.info("Stopping Decision Engine")
        self.is_running = False
        
        # Save decision history
        await self._save_decision_history()
        
        self.logger.info("Decision Engine stopped")
        
    async def make_decision(self, innovation: Innovation, 
                          context: DecisionContext) -> Decision:
        """
        Make a decision about how to respond to an innovation.
        
        Args:
            innovation: The detected innovation
            context: Additional context for decision making
            
        Returns:
            Decision object with recommended actions
        """
        decision_id = f"decision_{innovation.id}_{datetime.now().isoformat()}"
        
        self.logger.info(f"Making decision for innovation {innovation.id}")
        
        try:
            # Step 1: Assess risk level
            risk_level = await self._assess_risk(innovation, context)
            
            # Step 2: Determine decision type based on multiple factors
            decision_type = await self._determine_decision_type(
                innovation, context, risk_level
            )
            
            # Step 3: Calculate confidence in the decision
            confidence = await self._calculate_decision_confidence(
                innovation, context, decision_type
            )
            
            # Step 4: Generate reasoning
            reasoning = await self._generate_reasoning(
                innovation, context, decision_type, risk_level
            )
            
            # Step 5: Define specific actions
            actions = await self._define_actions(
                innovation, context, decision_type
            )
            
            # Step 6: Estimate timeline and resources
            timeline = await self._estimate_timeline(actions, decision_type)
            resources_required = await self._estimate_resources(actions)
            
            # Step 7: Create risk assessment
            risk_assessment = await self._create_risk_assessment(
                innovation, actions, risk_level
            )
            
            # Create decision object
            decision = Decision(
                decision_id=decision_id,
                decision_type=decision_type,
                innovation_id=innovation.id,
                confidence=confidence,
                reasoning=reasoning,
                actions=actions,
                timeline=timeline,
                resources_required=resources_required,
                risk_assessment=risk_assessment,
                created_at=datetime.now()
            )
            
            # Store decision in history
            self.decision_history.append(decision)
            if len(self.decision_history) > self.max_history_size:
                self.decision_history.pop(0)
                
            self.logger.info(
                f"Decision made: {decision_type.value} for innovation {innovation.id} "
                f"with confidence {confidence:.2f}"
            )
            
            return decision
            
        except Exception as e:
            self.logger.error(f"Error making decision for innovation {innovation.id}: {e}")
            
            # Return safe fallback decision
            return Decision(
                decision_id=decision_id,
                decision_type=DecisionType.ESCALATE_HUMAN,
                innovation_id=innovation.id,
                confidence=0.0,
                reasoning=f"Error in decision making: {str(e)}",
                actions=[{"type": "escalate", "reason": "decision_error"}],
                timeline="immediate",
                resources_required={"human_review": True},
                risk_assessment={"level": "unknown", "requires_review": True},
                created_at=datetime.now()
            )
            
    async def _assess_risk(self, innovation: Innovation, 
                          context: DecisionContext) -> RiskLevel:
        """Assess the risk level of an innovation."""
        
        # Factor 1: Impact score
        impact_risk = 0.0
        if innovation.impact_score >= self.impact_thresholds["critical"]:
            impact_risk = 1.0
        elif innovation.impact_score >= self.impact_thresholds["high"]:
            impact_risk = 0.8
        elif innovation.impact_score >= self.impact_thresholds["medium"]:
            impact_risk = 0.6
        elif innovation.impact_score >= self.impact_thresholds["low"]:
            impact_risk = 0.4
        else:
            impact_risk = 0.2
            
        # Factor 2: Confidence level (lower confidence = higher risk)
        confidence_risk = 1.0 - innovation.confidence
        
        # Factor 3: Domain-specific risk
        domain_risk = await self._assess_domain_risk(innovation.domain)
        
        # Factor 4: System vulnerability
        vulnerability_risk = await self._assess_system_vulnerability(
            innovation, context.system_state
        )
        
        # Factor 5: Historical patterns
        historical_risk = await self._assess_historical_risk(
            innovation, context.historical_decisions
        )
        
        # Combine risk factors with weights
        weights = {
            "impact": 0.3,
            "confidence": 0.2,
            "domain": 0.2,
            "vulnerability": 0.2,
            "historical": 0.1
        }
        
        total_risk = (
            weights["impact"] * impact_risk +
            weights["confidence"] * confidence_risk +
            weights["domain"] * domain_risk +
            weights["vulnerability"] * vulnerability_risk +
            weights["historical"] * historical_risk
        )
        
        # Map to risk level
        if total_risk >= 0.8:
            return RiskLevel.CRITICAL
        elif total_risk >= 0.6:
            return RiskLevel.HIGH
        elif total_risk >= 0.4:
            return RiskLevel.MEDIUM
        elif total_risk >= 0.2:
            return RiskLevel.LOW
        else:
            return RiskLevel.NEGLIGIBLE
            
    async def _determine_decision_type(self, innovation: Innovation,
                                     context: DecisionContext,
                                     risk_level: RiskLevel) -> DecisionType:
        """Determine the type of decision to make."""
        
        # Critical risk always requires immediate action or escalation
        if risk_level == RiskLevel.CRITICAL:
            if innovation.confidence >= self.confidence_thresholds["high"]:
                return DecisionType.IMMEDIATE_ADAPTATION
            else:
                return DecisionType.ESCALATE_HUMAN
                
        # High risk requires adaptation or research
        elif risk_level == RiskLevel.HIGH:
            if innovation.confidence >= self.confidence_thresholds["medium"]:
                return DecisionType.PLANNED_ADAPTATION
            else:
                return DecisionType.RESEARCH_REQUIRED
                
        # Medium risk requires monitoring or research
        elif risk_level == RiskLevel.MEDIUM:
            if innovation.confidence >= self.confidence_thresholds["high"]:
                return DecisionType.PLANNED_ADAPTATION
            elif innovation.confidence >= self.confidence_thresholds["low"]:
                return DecisionType.RESEARCH_REQUIRED
            else:
                return DecisionType.MONITOR_ONLY
                
        # Low risk typically just needs monitoring
        elif risk_level == RiskLevel.LOW:
            if innovation.impact_score >= self.impact_thresholds["medium"]:
                return DecisionType.MONITOR_ONLY
            else:
                return DecisionType.NO_ACTION
                
        # Negligible risk
        else:
            return DecisionType.NO_ACTION
            
    async def _calculate_decision_confidence(self, innovation: Innovation,
                                           context: DecisionContext,
                                           decision_type: DecisionType) -> float:
        """Calculate confidence in the decision."""
        
        # Base confidence from innovation confidence
        base_confidence = innovation.confidence
        
        # Adjust based on decision type complexity
        complexity_adjustment = {
            DecisionType.NO_ACTION: 0.1,
            DecisionType.MONITOR_ONLY: 0.05,
            DecisionType.RESEARCH_REQUIRED: -0.1,
            DecisionType.PLANNED_ADAPTATION: -0.2,
            DecisionType.IMMEDIATE_ADAPTATION: -0.3,
            DecisionType.ESCALATE_HUMAN: 0.0  # Neutral for escalation
        }
        
        adjusted_confidence = base_confidence + complexity_adjustment.get(decision_type, 0)
        
        # Factor in historical success rate for similar decisions
        historical_success = await self._get_historical_success_rate(
            innovation.domain, decision_type
        )
        
        # Combine with weights
        final_confidence = (
            0.6 * adjusted_confidence +
            0.4 * historical_success
        )
        
        return max(0.0, min(1.0, final_confidence))
        
    async def _generate_reasoning(self, innovation: Innovation,
                                context: DecisionContext,
                                decision_type: DecisionType,
                                risk_level: RiskLevel) -> str:
        """Generate human-readable reasoning for the decision."""
        
        reasoning_parts = []
        
        # Innovation description
        reasoning_parts.append(
            f"Innovation '{innovation.title}' detected in {innovation.domain} domain "
            f"with impact score {innovation.impact_score:.1f} and confidence {innovation.confidence:.2f}."
        )
        
        # Risk assessment
        reasoning_parts.append(
            f"Risk level assessed as {risk_level.value} based on impact, confidence, "
            f"domain characteristics, and system vulnerability."
        )
        
        # Decision rationale
        decision_rationales = {
            DecisionType.NO_ACTION: "Impact and risk levels are below action thresholds.",
            DecisionType.MONITOR_ONLY: "Requires ongoing monitoring but no immediate action.",
            DecisionType.RESEARCH_REQUIRED: "Insufficient information to make adaptation decision.",
            DecisionType.PLANNED_ADAPTATION: "Significant impact requires planned system adaptation.",
            DecisionType.IMMEDIATE_ADAPTATION: "Critical impact requires immediate system response.",
            DecisionType.ESCALATE_HUMAN: "Complexity or risk level requires human oversight."
        }
        
        reasoning_parts.append(decision_rationales.get(decision_type, "Unknown decision type."))
        
        # Resource considerations
        if context.resource_availability:
            available_resources = sum(1 for v in context.resource_availability.values() if v)
            total_resources = len(context.resource_availability)
            reasoning_parts.append(
                f"Resource availability: {available_resources}/{total_resources} systems available."
            )
            
        return " ".join(reasoning_parts)
        
    async def _define_actions(self, innovation: Innovation,
                            context: DecisionContext,
                            decision_type: DecisionType) -> List[Dict[str, Any]]:
        """Define specific actions to take based on the decision."""
        
        actions = []
        
        if decision_type == DecisionType.NO_ACTION:
            actions.append({
                "type": "log",
                "description": "Log innovation for future reference",
                "priority": "low"
            })
            
        elif decision_type == DecisionType.MONITOR_ONLY:
            actions.extend([
                {
                    "type": "setup_monitoring",
                    "description": f"Monitor {innovation.domain} for related developments",
                    "frequency": "daily",
                    "duration": "30 days",
                    "priority": "medium"
                },
                {
                    "type": "alert_threshold",
                    "description": "Set alert if impact score increases",
                    "threshold": innovation.impact_score + 1.0,
                    "priority": "medium"
                }
            ])
            
        elif decision_type == DecisionType.RESEARCH_REQUIRED:
            actions.extend([
                {
                    "type": "research_coordination",
                    "description": f"Research implications of {innovation.title}",
                    "areas": [innovation.domain, "system_impact", "implementation"],
                    "timeline": "1 week",
                    "priority": "high"
                },
                {
                    "type": "expert_consultation",
                    "description": "Consult domain experts",
                    "domain": innovation.domain,
                    "priority": "medium"
                }
            ])
            
        elif decision_type == DecisionType.PLANNED_ADAPTATION:
            actions.extend([
                {
                    "type": "impact_analysis",
                    "description": "Analyze impact on existing systems",
                    "systems": list(context.system_state.keys()),
                    "timeline": "3 days",
                    "priority": "high"
                },
                {
                    "type": "adaptation_planning",
                    "description": "Create detailed adaptation plan",
                    "innovation_id": innovation.id,
                    "timeline": "1 week",
                    "priority": "high"
                },
                {
                    "type": "testing_preparation",
                    "description": "Prepare testing environment",
                    "timeline": "2 days",
                    "priority": "medium"
                }
            ])
            
        elif decision_type == DecisionType.IMMEDIATE_ADAPTATION:
            actions.extend([
                {
                    "type": "emergency_assessment",
                    "description": "Immediate impact assessment",
                    "timeline": "2 hours",
                    "priority": "critical"
                },
                {
                    "type": "rapid_adaptation",
                    "description": "Implement immediate protective measures",
                    "timeline": "4 hours",
                    "priority": "critical"
                },
                {
                    "type": "stakeholder_notification",
                    "description": "Notify key stakeholders",
                    "timeline": "immediate",
                    "priority": "critical"
                }
            ])
            
        elif decision_type == DecisionType.ESCALATE_HUMAN:
            actions.extend([
                {
                    "type": "human_escalation",
                    "description": "Escalate to human decision maker",
                    "urgency": "high" if innovation.impact_score > 7 else "medium",
                    "timeline": "immediate",
                    "priority": "critical"
                },
                {
                    "type": "context_preparation",
                    "description": "Prepare decision context for human review",
                    "timeline": "30 minutes",
                    "priority": "high"
                }
            ])
            
        return actions
        
    async def _estimate_timeline(self, actions: List[Dict[str, Any]], 
                               decision_type: DecisionType) -> str:
        """Estimate timeline for completing all actions."""
        
        if not actions:
            return "immediate"
            
        # Extract timeline information from actions
        timelines = []
        for action in actions:
            timeline = action.get("timeline", "unknown")
            if timeline == "immediate":
                timelines.append(0)
            elif "hour" in timeline:
                hours = int(timeline.split()[0]) if timeline.split()[0].isdigit() else 1
                timelines.append(hours / 24)  # Convert to days
            elif "day" in timeline:
                days = int(timeline.split()[0]) if timeline.split()[0].isdigit() else 1
                timelines.append(days)
            elif "week" in timeline:
                weeks = int(timeline.split()[0]) if timeline.split()[0].isdigit() else 1
                timelines.append(weeks * 7)
            else:
                timelines.append(1)  # Default to 1 day
                
        if not timelines:
            return "1 day"
            
        max_timeline = max(timelines)
        
        if max_timeline == 0:
            return "immediate"
        elif max_timeline < 1:
            return f"{int(max_timeline * 24)} hours"
        elif max_timeline < 7:
            return f"{int(max_timeline)} days"
        else:
            return f"{int(max_timeline / 7)} weeks"
            
    async def _estimate_resources(self, actions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Estimate resources required for actions."""
        
        resources = {
            "compute_hours": 0,
            "human_hours": 0,
            "external_apis": [],
            "storage_gb": 0,
            "network_bandwidth": "low"
        }
        
        for action in actions:
            action_type = action.get("type", "")
            
            if action_type in ["research_coordination", "impact_analysis"]:
                resources["compute_hours"] += 10
                resources["human_hours"] += 2
                resources["storage_gb"] += 5
                
            elif action_type in ["adaptation_planning", "testing_preparation"]:
                resources["compute_hours"] += 20
                resources["human_hours"] += 8
                resources["storage_gb"] += 10
                
            elif action_type in ["rapid_adaptation", "emergency_assessment"]:
                resources["compute_hours"] += 50
                resources["human_hours"] += 4
                resources["network_bandwidth"] = "high"
                
            elif action_type in ["human_escalation", "expert_consultation"]:
                resources["human_hours"] += 1
                
            elif action_type == "setup_monitoring":
                resources["compute_hours"] += 5
                resources["storage_gb"] += 2
                
        return resources
        
    async def _create_risk_assessment(self, innovation: Innovation,
                                    actions: List[Dict[str, Any]],
                                    risk_level: RiskLevel) -> Dict[str, Any]:
        """Create detailed risk assessment."""
        
        return {
            "innovation_risk": risk_level.value,
            "action_risk": "low" if len(actions) <= 2 else "medium",
            "mitigation_strategies": [
                "Gradual rollout of changes",
                "Comprehensive testing",
                "Rollback procedures",
                "Monitoring and alerting"
            ],
            "potential_impacts": {
                "positive": [
                    "Improved system resilience",
                    "Competitive advantage",
                    "Enhanced capabilities"
                ],
                "negative": [
                    "Temporary system instability",
                    "Resource consumption",
                    "Implementation complexity"
                ]
            },
            "confidence_level": innovation.confidence,
            "review_required": risk_level in [RiskLevel.CRITICAL, RiskLevel.HIGH]
        }
        
    # Helper methods
    async def _assess_domain_risk(self, domain: str) -> float:
        """Assess risk level for a specific domain."""
        domain_risks = {
            "security": 0.9,
            "privacy": 0.8,
            "safety": 0.9,
            "performance": 0.6,
            "scalability": 0.5,
            "cost": 0.4,
            "user_experience": 0.3,
            "general": 0.5
        }
        return domain_risks.get(domain.lower(), 0.5)
        
    async def _assess_system_vulnerability(self, innovation: Innovation,
                                         system_state: Dict[str, Any]) -> float:
        """Assess how vulnerable current systems are to the innovation."""
        # Placeholder implementation
        # In reality, this would analyze system architecture, dependencies, etc.
        
        vulnerability_factors = []
        
        # Check system age
        system_age = system_state.get("average_age_months", 12)
        age_vulnerability = min(1.0, system_age / 60)  # Older systems more vulnerable
        vulnerability_factors.append(age_vulnerability)
        
        # Check update frequency
        update_frequency = system_state.get("updates_per_month", 2)
        update_vulnerability = max(0.0, 1.0 - update_frequency / 4)  # Less updates = more vulnerable
        vulnerability_factors.append(update_vulnerability)
        
        # Check technology stack overlap
        innovation_tech = innovation.metadata.get("technologies", [])
        system_tech = system_state.get("technologies", [])
        tech_overlap = len(set(innovation_tech) & set(system_tech)) / max(len(innovation_tech), 1)
        vulnerability_factors.append(tech_overlap)
        
        return sum(vulnerability_factors) / len(vulnerability_factors) if vulnerability_factors else 0.5
        
    async def _assess_historical_risk(self, innovation: Innovation,
                                    historical_decisions: List[Dict[str, Any]]) -> float:
        """Assess risk based on historical patterns."""
        if not historical_decisions:
            return 0.5
            
        # Look for similar innovations in history
        similar_decisions = [
            d for d in historical_decisions
            if d.get("domain") == innovation.domain
        ]
        
        if not similar_decisions:
            return 0.5
            
        # Calculate average risk from similar decisions
        risk_scores = [d.get("risk_score", 0.5) for d in similar_decisions]
        return sum(risk_scores) / len(risk_scores)
        
    async def _get_historical_success_rate(self, domain: str, 
                                         decision_type: DecisionType) -> float:
        """Get historical success rate for similar decisions."""
        relevant_decisions = [
            d for d in self.decision_history
            if (hasattr(d, 'innovation_id') and 
                d.decision_type == decision_type)
        ]
        
        if not relevant_decisions:
            return 0.7  # Default confidence
            
        # For now, return a placeholder success rate
        # In reality, this would track actual outcomes
        return 0.8
        
    async def _load_models(self):
        """Load machine learning models."""
        # Placeholder for ML model loading
        self.logger.info("ML models loaded (placeholder)")
        
    async def _load_decision_history(self):
        """Load historical decisions."""
        # Placeholder for loading decision history from storage
        self.logger.info("Decision history loaded (placeholder)")
        
    async def _save_decision_history(self):
        """Save decision history."""
        # Placeholder for saving decision history to storage
        self.logger.info("Decision history saved (placeholder)")
        
    async def health_check(self) -> str:
        """Check health of the decision engine."""
        if not self.is_running:
            return "stopped"
            
        # Check if we can make decisions
        try:
            # Simple health check
            test_innovation = Innovation(
                id="health_check",
                title="Test",
                description="Health check",
                source="internal",
                domain="test",
                impact_score=1.0,
                confidence=1.0,
                detected_at=datetime.now(),
                metadata={}
            )
            
            test_context = DecisionContext(
                innovation=test_innovation,
                system_state={},
                historical_decisions=[],
                resource_availability={},
                risk_tolerance=self.risk_tolerance
            )
            
            # This should complete without error
            await self._assess_risk(test_innovation, test_context)
            return "healthy"
            
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            return "unhealthy"

