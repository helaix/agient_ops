"""
Adaptation Engine - Core component for autonomous system adaptation.

This module implements the main adaptation logic that executes system
changes in response to AI innovations with minimal human intervention.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta
import json
import uuid

from ..core.decision_engine import Decision, Innovation


class AdaptationStatus(Enum):
    """Status of an adaptation."""
    PENDING = "pending"
    PLANNING = "planning"
    TESTING = "testing"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"
    CANCELLED = "cancelled"


class AdaptationType(Enum):
    """Types of adaptations."""
    INFRASTRUCTURE = "infrastructure"
    SECURITY = "security"
    PERFORMANCE = "performance"
    COMPLIANCE = "compliance"
    FEATURE = "feature"
    DEPENDENCY = "dependency"
    CONFIGURATION = "configuration"


@dataclass
class AdaptationPlan:
    """Plan for executing an adaptation."""
    plan_id: str
    innovation_id: str
    decision_id: str
    adaptation_type: AdaptationType
    description: str
    steps: List[Dict[str, Any]]
    estimated_duration: timedelta
    risk_level: str
    rollback_plan: Dict[str, Any]
    validation_criteria: Dict[str, Any]
    created_at: datetime
    created_by: str = "system"


@dataclass
class AdaptationExecution:
    """Execution state of an adaptation."""
    execution_id: str
    plan_id: str
    status: AdaptationStatus
    current_step: int
    total_steps: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error_message: Optional[str]
    results: Dict[str, Any]
    metrics: Dict[str, Any]


class AdaptationEngine:
    """
    Core adaptation engine for autonomous system updates.
    
    Coordinates the planning, testing, and execution of system adaptations
    in response to AI innovations while maintaining system stability.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the adaptation engine."""
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Core components
        from .strategy_manager import StrategyManager
        from .execution_engine import ExecutionEngine
        from .rollback_manager import RollbackManager
        
        self.strategy_manager = StrategyManager(config.get("strategy_manager", {}))
        self.execution_engine = ExecutionEngine(config.get("execution_engine", {}))
        self.rollback_manager = RollbackManager(config.get("rollback_manager", {}))
        
        # Adaptation state
        self.active_adaptations: Dict[str, AdaptationExecution] = {}
        self.adaptation_history: List[AdaptationExecution] = []
        self.adaptation_queue: asyncio.Queue = asyncio.Queue()
        
        # Configuration
        self.max_concurrent_adaptations = config.get("max_concurrent_adaptations", 3)
        self.auto_execute_threshold = config.get("auto_execute_threshold", 0.8)
        self.require_approval_above_risk = config.get("require_approval_above_risk", "high")
        
        # Metrics
        self.metrics = {
            "adaptations_planned": 0,
            "adaptations_executed": 0,
            "adaptations_successful": 0,
            "adaptations_failed": 0,
            "adaptations_rolled_back": 0,
            "average_execution_time": 0.0
        }
        
        # System state
        self.is_running = False
        
    async def start(self):
        """Start the adaptation engine."""
        self.logger.info("Starting Adaptation Engine")
        self.is_running = True
        
        # Start components
        await self.strategy_manager.start()
        await self.execution_engine.start()
        await self.rollback_manager.start()
        
        # Start background tasks
        asyncio.create_task(self._adaptation_processor())
        asyncio.create_task(self._health_monitor())
        
        self.logger.info("Adaptation Engine started")
        
    async def stop(self):
        """Stop the adaptation engine."""
        self.logger.info("Stopping Adaptation Engine")
        self.is_running = False
        
        # Stop components
        await self.strategy_manager.stop()
        await self.execution_engine.stop()
        await self.rollback_manager.stop()
        
        self.logger.info("Adaptation Engine stopped")
        
    async def process_decision(self, decision: Decision, 
                             innovation: Innovation) -> Optional[str]:
        """
        Process a decision and create adaptation plan if needed.
        
        Args:
            decision: Decision from the decision engine
            innovation: The innovation that triggered the decision
            
        Returns:
            Adaptation execution ID if adaptation was started, None otherwise
        """
        self.logger.info(f"Processing decision {decision.decision_id} for innovation {innovation.id}")
        
        # Check if adaptation is required
        if not self._requires_adaptation(decision):
            self.logger.info(f"Decision {decision.decision_id} does not require adaptation")
            return None
            
        try:
            # Create adaptation plan
            plan = await self._create_adaptation_plan(decision, innovation)
            if not plan:
                self.logger.warning(f"Failed to create adaptation plan for decision {decision.decision_id}")
                return None
                
            # Create execution context
            execution = AdaptationExecution(
                execution_id=str(uuid.uuid4()),
                plan_id=plan.plan_id,
                status=AdaptationStatus.PENDING,
                current_step=0,
                total_steps=len(plan.steps),
                started_at=None,
                completed_at=None,
                error_message=None,
                results={},
                metrics={}
            )
            
            # Queue for execution
            await self.adaptation_queue.put((plan, execution))
            self.active_adaptations[execution.execution_id] = execution
            
            self.metrics["adaptations_planned"] += 1
            
            self.logger.info(f"Queued adaptation {execution.execution_id} for execution")
            
            return execution.execution_id
            
        except Exception as e:
            self.logger.error(f"Error processing decision {decision.decision_id}: {e}")
            return None
            
    async def get_adaptation_status(self, execution_id: str) -> Optional[AdaptationExecution]:
        """Get the status of an adaptation."""
        return self.active_adaptations.get(execution_id)
        
    async def cancel_adaptation(self, execution_id: str) -> bool:
        """Cancel a pending or running adaptation."""
        if execution_id not in self.active_adaptations:
            return False
            
        execution = self.active_adaptations[execution_id]
        
        if execution.status in [AdaptationStatus.PENDING, AdaptationStatus.PLANNING]:
            execution.status = AdaptationStatus.CANCELLED
            self.logger.info(f"Cancelled adaptation {execution_id}")
            return True
        elif execution.status in [AdaptationStatus.TESTING, AdaptationStatus.EXECUTING]:
            # Request cancellation from execution engine
            cancelled = await self.execution_engine.cancel_execution(execution_id)
            if cancelled:
                execution.status = AdaptationStatus.CANCELLED
                self.logger.info(f"Cancelled running adaptation {execution_id}")
            return cancelled
        else:
            self.logger.warning(f"Cannot cancel adaptation {execution_id} in status {execution.status}")
            return False
            
    async def rollback_adaptation(self, execution_id: str) -> bool:
        """Rollback a completed adaptation."""
        if execution_id not in self.active_adaptations:
            return False
            
        execution = self.active_adaptations[execution_id]
        
        if execution.status != AdaptationStatus.COMPLETED:
            self.logger.warning(f"Cannot rollback adaptation {execution_id} in status {execution.status}")
            return False
            
        try:
            # Get the adaptation plan
            plan = await self._get_adaptation_plan(execution.plan_id)
            if not plan:
                self.logger.error(f"Cannot find plan {execution.plan_id} for rollback")
                return False
                
            # Execute rollback
            rollback_success = await self.rollback_manager.execute_rollback(
                execution_id, plan.rollback_plan
            )
            
            if rollback_success:
                execution.status = AdaptationStatus.ROLLED_BACK
                self.metrics["adaptations_rolled_back"] += 1
                self.logger.info(f"Successfully rolled back adaptation {execution_id}")
            else:
                self.logger.error(f"Failed to rollback adaptation {execution_id}")
                
            return rollback_success
            
        except Exception as e:
            self.logger.error(f"Error rolling back adaptation {execution_id}: {e}")
            return False
            
    async def _adaptation_processor(self):
        """Background task that processes adaptations from the queue."""
        while self.is_running:
            try:
                # Check if we have capacity
                running_adaptations = sum(
                    1 for execution in self.active_adaptations.values()
                    if execution.status in [AdaptationStatus.EXECUTING, AdaptationStatus.TESTING]
                )
                
                if running_adaptations >= self.max_concurrent_adaptations:
                    await asyncio.sleep(5)
                    continue
                    
                # Get next adaptation
                try:
                    plan, execution = await asyncio.wait_for(
                        self.adaptation_queue.get(),
                        timeout=1.0
                    )
                except asyncio.TimeoutError:
                    continue
                    
                # Execute adaptation
                asyncio.create_task(self._execute_adaptation(plan, execution))
                
            except Exception as e:
                self.logger.error(f"Error in adaptation processor: {e}")
                await asyncio.sleep(5)
                
    async def _execute_adaptation(self, plan: AdaptationPlan, 
                                execution: AdaptationExecution):
        """Execute an adaptation plan."""
        execution_id = execution.execution_id
        start_time = datetime.now()
        
        try:
            self.logger.info(f"Starting execution of adaptation {execution_id}")
            
            execution.status = AdaptationStatus.PLANNING
            execution.started_at = start_time
            
            # Validate plan
            validation_result = await self._validate_adaptation_plan(plan)
            if not validation_result["valid"]:
                raise Exception(f"Plan validation failed: {validation_result['reason']}")
                
            # Check if human approval is required
            if self._requires_human_approval(plan):
                execution.status = AdaptationStatus.PENDING
                await self._request_human_approval(plan, execution)
                return
                
            # Execute testing phase
            execution.status = AdaptationStatus.TESTING
            test_results = await self._execute_testing_phase(plan, execution)
            
            if not test_results["success"]:
                raise Exception(f"Testing phase failed: {test_results['reason']}")
                
            # Execute adaptation
            execution.status = AdaptationStatus.EXECUTING
            self.metrics["adaptations_executed"] += 1
            
            execution_results = await self.execution_engine.execute_plan(plan, execution)
            
            if execution_results["success"]:
                execution.status = AdaptationStatus.COMPLETED
                execution.results = execution_results
                execution.completed_at = datetime.now()
                
                # Update metrics
                duration = (execution.completed_at - execution.started_at).total_seconds()
                self._update_execution_metrics(duration, True)
                self.metrics["adaptations_successful"] += 1
                
                self.logger.info(f"Successfully completed adaptation {execution_id}")
                
                # Validate post-execution
                await self._validate_post_execution(plan, execution)
                
            else:
                raise Exception(f"Execution failed: {execution_results['reason']}")
                
        except Exception as e:
            execution.status = AdaptationStatus.FAILED
            execution.error_message = str(e)
            execution.completed_at = datetime.now()
            
            # Update metrics
            if execution.started_at:
                duration = (execution.completed_at - execution.started_at).total_seconds()
                self._update_execution_metrics(duration, False)
                
            self.metrics["adaptations_failed"] += 1
            
            self.logger.error(f"Adaptation {execution_id} failed: {e}")
            
            # Attempt automatic rollback if execution started
            if execution.status in [AdaptationStatus.EXECUTING, AdaptationStatus.COMPLETED]:
                self.logger.info(f"Attempting automatic rollback for failed adaptation {execution_id}")
                await self.rollback_adaptation(execution_id)
                
        finally:
            # Move to history after some time
            asyncio.create_task(self._archive_adaptation(execution_id, delay=3600))
            
    def _requires_adaptation(self, decision: Decision) -> bool:
        """Check if a decision requires system adaptation."""
        adaptation_decision_types = [
            "planned_adaptation",
            "immediate_adaptation"
        ]
        
        return any(
            action.get("type", "").endswith("adaptation") or
            action.get("type", "") in adaptation_decision_types
            for action in decision.actions
        )
        
    async def _create_adaptation_plan(self, decision: Decision, 
                                    innovation: Innovation) -> Optional[AdaptationPlan]:
        """Create an adaptation plan based on a decision."""
        
        # Determine adaptation type
        adaptation_type = await self._determine_adaptation_type(decision, innovation)
        
        # Generate adaptation steps
        steps = await self.strategy_manager.generate_adaptation_steps(
            decision, innovation, adaptation_type
        )
        
        if not steps:
            return None
            
        # Create rollback plan
        rollback_plan = await self.strategy_manager.create_rollback_plan(steps)
        
        # Define validation criteria
        validation_criteria = await self._define_validation_criteria(
            adaptation_type, innovation
        )
        
        # Estimate duration
        estimated_duration = await self._estimate_adaptation_duration(steps)
        
        # Assess risk level
        risk_level = await self._assess_adaptation_risk(steps, innovation)
        
        plan = AdaptationPlan(
            plan_id=str(uuid.uuid4()),
            innovation_id=innovation.id,
            decision_id=decision.decision_id,
            adaptation_type=adaptation_type,
            description=f"Adaptation for {innovation.title}",
            steps=steps,
            estimated_duration=estimated_duration,
            risk_level=risk_level,
            rollback_plan=rollback_plan,
            validation_criteria=validation_criteria,
            created_at=datetime.now()
        )
        
        return plan
        
    async def _determine_adaptation_type(self, decision: Decision, 
                                       innovation: Innovation) -> AdaptationType:
        """Determine the type of adaptation needed."""
        
        # Check decision actions for hints
        for action in decision.actions:
            action_type = action.get("type", "").lower()
            
            if "security" in action_type:
                return AdaptationType.SECURITY
            elif "performance" in action_type:
                return AdaptationType.PERFORMANCE
            elif "infrastructure" in action_type:
                return AdaptationType.INFRASTRUCTURE
            elif "compliance" in action_type:
                return AdaptationType.COMPLIANCE
            elif "feature" in action_type:
                return AdaptationType.FEATURE
            elif "dependency" in action_type:
                return AdaptationType.DEPENDENCY
            elif "config" in action_type:
                return AdaptationType.CONFIGURATION
                
        # Check innovation domain
        domain = innovation.domain.lower()
        if domain in ["security", "privacy"]:
            return AdaptationType.SECURITY
        elif domain in ["performance", "optimization"]:
            return AdaptationType.PERFORMANCE
        elif domain in ["infrastructure", "scaling"]:
            return AdaptationType.INFRASTRUCTURE
        else:
            return AdaptationType.CONFIGURATION  # Default
            
    async def _validate_adaptation_plan(self, plan: AdaptationPlan) -> Dict[str, Any]:
        """Validate an adaptation plan before execution."""
        
        validation_result = {
            "valid": True,
            "reason": "",
            "warnings": []
        }
        
        # Check if steps are valid
        if not plan.steps:
            validation_result["valid"] = False
            validation_result["reason"] = "No adaptation steps defined"
            return validation_result
            
        # Check resource requirements
        total_resources = await self._calculate_total_resources(plan.steps)
        available_resources = await self._get_available_resources()
        
        if not self._check_resource_availability(total_resources, available_resources):
            validation_result["valid"] = False
            validation_result["reason"] = "Insufficient resources available"
            return validation_result
            
        # Check for conflicts with other adaptations
        conflicts = await self._check_adaptation_conflicts(plan)
        if conflicts:
            validation_result["valid"] = False
            validation_result["reason"] = f"Conflicts with adaptations: {', '.join(conflicts)}"
            return validation_result
            
        # Check rollback plan
        if not plan.rollback_plan:
            validation_result["warnings"].append("No rollback plan defined")
            
        return validation_result
        
    def _requires_human_approval(self, plan: AdaptationPlan) -> bool:
        """Check if human approval is required for the adaptation."""
        
        # Check risk level
        if plan.risk_level == "critical":
            return True
        elif plan.risk_level == "high" and self.require_approval_above_risk == "high":
            return True
        elif plan.risk_level == "medium" and self.require_approval_above_risk == "medium":
            return True
            
        # Check adaptation type
        high_risk_types = [AdaptationType.SECURITY, AdaptationType.INFRASTRUCTURE]
        if plan.adaptation_type in high_risk_types:
            return True
            
        # Check estimated duration
        if plan.estimated_duration > timedelta(hours=4):
            return True
            
        return False
        
    async def _execute_testing_phase(self, plan: AdaptationPlan, 
                                   execution: AdaptationExecution) -> Dict[str, Any]:
        """Execute testing phase for an adaptation."""
        
        test_results = {
            "success": True,
            "reason": "",
            "test_outputs": []
        }
        
        try:
            # Run validation tests
            for i, step in enumerate(plan.steps):
                if step.get("test_required", False):
                    execution.current_step = i
                    
                    test_result = await self.execution_engine.test_step(step)
                    test_results["test_outputs"].append(test_result)
                    
                    if not test_result.get("success", False):
                        test_results["success"] = False
                        test_results["reason"] = f"Step {i} test failed: {test_result.get('error', 'Unknown error')}"
                        break
                        
            return test_results
            
        except Exception as e:
            test_results["success"] = False
            test_results["reason"] = f"Testing phase error: {str(e)}"
            return test_results
            
    async def _validate_post_execution(self, plan: AdaptationPlan, 
                                     execution: AdaptationExecution):
        """Validate system state after adaptation execution."""
        
        try:
            # Run validation criteria checks
            for criterion_name, criterion in plan.validation_criteria.items():
                result = await self._check_validation_criterion(criterion)
                
                if not result["passed"]:
                    self.logger.warning(
                        f"Post-execution validation failed for {criterion_name}: {result['reason']}"
                    )
                    
                    # Consider automatic rollback for critical failures
                    if criterion.get("critical", False):
                        self.logger.error(f"Critical validation failure, initiating rollback")
                        await self.rollback_adaptation(execution.execution_id)
                        break
                        
        except Exception as e:
            self.logger.error(f"Error in post-execution validation: {e}")
            
    async def _health_monitor(self):
        """Background task that monitors adaptation engine health."""
        while self.is_running:
            try:
                # Check for stuck adaptations
                current_time = datetime.now()
                stuck_threshold = timedelta(hours=2)
                
                for execution_id, execution in self.active_adaptations.items():
                    if (execution.started_at and 
                        current_time - execution.started_at > stuck_threshold and
                        execution.status in [AdaptationStatus.EXECUTING, AdaptationStatus.TESTING]):
                        
                        self.logger.warning(f"Adaptation {execution_id} may be stuck")
                        
                        # Attempt to cancel stuck adaptation
                        await self.cancel_adaptation(execution_id)
                        
                # Check system resources
                available_resources = await self._get_available_resources()
                if available_resources.get("cpu_usage", 0) > 90:
                    self.logger.warning("High CPU usage detected, may affect adaptations")
                    
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                self.logger.error(f"Error in health monitor: {e}")
                await asyncio.sleep(60)
                
    # Helper methods
    async def _get_adaptation_plan(self, plan_id: str) -> Optional[AdaptationPlan]:
        """Get adaptation plan by ID."""
        # Placeholder - in reality would load from storage
        return None
        
    async def _request_human_approval(self, plan: AdaptationPlan, 
                                    execution: AdaptationExecution):
        """Request human approval for high-risk adaptation."""
        # Placeholder for human approval workflow
        self.logger.info(f"Human approval requested for adaptation {execution.execution_id}")
        
    async def _define_validation_criteria(self, adaptation_type: AdaptationType,
                                        innovation: Innovation) -> Dict[str, Any]:
        """Define validation criteria for an adaptation."""
        criteria = {}
        
        if adaptation_type == AdaptationType.SECURITY:
            criteria["security_scan"] = {
                "type": "security_check",
                "critical": True,
                "timeout": 300
            }
            
        elif adaptation_type == AdaptationType.PERFORMANCE:
            criteria["performance_test"] = {
                "type": "load_test",
                "critical": False,
                "timeout": 600
            }
            
        return criteria
        
    async def _estimate_adaptation_duration(self, steps: List[Dict[str, Any]]) -> timedelta:
        """Estimate duration for adaptation steps."""
        total_minutes = 0
        
        for step in steps:
            step_type = step.get("type", "")
            
            # Estimate based on step type
            if step_type == "config_update":
                total_minutes += 5
            elif step_type == "service_restart":
                total_minutes += 10
            elif step_type == "deployment":
                total_minutes += 30
            elif step_type == "database_migration":
                total_minutes += 60
            else:
                total_minutes += 15  # Default
                
        return timedelta(minutes=total_minutes)
        
    async def _assess_adaptation_risk(self, steps: List[Dict[str, Any]], 
                                    innovation: Innovation) -> str:
        """Assess risk level of an adaptation."""
        risk_score = 0
        
        # Risk from innovation impact
        risk_score += innovation.impact_score * 0.1
        
        # Risk from step types
        for step in steps:
            step_type = step.get("type", "")
            
            if step_type in ["database_migration", "infrastructure_change"]:
                risk_score += 3
            elif step_type in ["service_restart", "deployment"]:
                risk_score += 2
            elif step_type in ["config_update"]:
                risk_score += 1
                
        # Map to risk level
        if risk_score >= 8:
            return "critical"
        elif risk_score >= 5:
            return "high"
        elif risk_score >= 3:
            return "medium"
        else:
            return "low"
            
    async def _calculate_total_resources(self, steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate total resources required for steps."""
        return {
            "cpu_cores": 2,
            "memory_gb": 4,
            "disk_gb": 10,
            "network_mbps": 100
        }
        
    async def _get_available_resources(self) -> Dict[str, Any]:
        """Get currently available system resources."""
        return {
            "cpu_cores": 8,
            "memory_gb": 32,
            "disk_gb": 500,
            "network_mbps": 1000,
            "cpu_usage": 45  # percentage
        }
        
    def _check_resource_availability(self, required: Dict[str, Any], 
                                   available: Dict[str, Any]) -> bool:
        """Check if required resources are available."""
        for resource, amount in required.items():
            if resource in available and available[resource] < amount:
                return False
        return True
        
    async def _check_adaptation_conflicts(self, plan: AdaptationPlan) -> List[str]:
        """Check for conflicts with other running adaptations."""
        conflicts = []
        
        for execution_id, execution in self.active_adaptations.items():
            if execution.status in [AdaptationStatus.EXECUTING, AdaptationStatus.TESTING]:
                # Check for resource conflicts, system conflicts, etc.
                # Simplified check for now
                conflicts.append(execution_id)
                
        return conflicts
        
    async def _check_validation_criterion(self, criterion: Dict[str, Any]) -> Dict[str, Any]:
        """Check a validation criterion."""
        # Placeholder implementation
        return {
            "passed": True,
            "reason": "",
            "details": {}
        }
        
    def _update_execution_metrics(self, duration: float, success: bool):
        """Update execution metrics."""
        # Update average execution time
        total_executed = self.metrics["adaptations_executed"]
        if total_executed == 1:
            self.metrics["average_execution_time"] = duration
        else:
            current_avg = self.metrics["average_execution_time"]
            self.metrics["average_execution_time"] = (
                (current_avg * (total_executed - 1) + duration) / total_executed
            )
            
    async def _archive_adaptation(self, execution_id: str, delay: int = 3600):
        """Archive completed adaptation after delay."""
        await asyncio.sleep(delay)
        
        if execution_id in self.active_adaptations:
            execution = self.active_adaptations[execution_id]
            if execution.status in [
                AdaptationStatus.COMPLETED, 
                AdaptationStatus.FAILED, 
                AdaptationStatus.CANCELLED,
                AdaptationStatus.ROLLED_BACK
            ]:
                self.adaptation_history.append(execution)
                del self.active_adaptations[execution_id]
                self.logger.debug(f"Archived adaptation {execution_id}")
                
    async def get_metrics(self) -> Dict[str, Any]:
        """Get adaptation engine metrics."""
        return self.metrics.copy()
        
    async def health_check(self) -> str:
        """Check health of the adaptation engine."""
        if not self.is_running:
            return "stopped"
            
        # Check component health
        strategy_health = await self.strategy_manager.health_check()
        execution_health = await self.execution_engine.health_check()
        rollback_health = await self.rollback_manager.health_check()
        
        if all(h == "healthy" for h in [strategy_health, execution_health, rollback_health]):
            return "healthy"
        else:
            return "degraded"

