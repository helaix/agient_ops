"""
System Orchestrator - Central coordination for the AI Innovation Monitoring System.

This module implements the main orchestration logic that coordinates between
the research, monitoring, and adaptation workflows according to the Agent
Operations Guidelines.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import json
from datetime import datetime, timedelta

from .decision_engine import DecisionEngine
from .state_manager import StateManager
from .event_bus import EventBus


class WorkflowType(Enum):
    """Types of workflows supported by the orchestrator."""
    RESEARCH_COORDINATION = "research_coordination"
    TASK_DECOMPOSITION = "task_decomposition"
    ADAPTIVE_COORDINATION = "adaptive_coordination"


@dataclass
class WorkflowContext:
    """Context information for workflow execution."""
    workflow_id: str
    workflow_type: WorkflowType
    priority: int
    created_at: datetime
    parameters: Dict[str, Any]
    status: str = "pending"
    progress: float = 0.0
    results: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class SystemOrchestrator:
    """
    Central orchestrator that coordinates all system workflows.
    
    Implements the meta-coordination pattern from the Agent Operations Guidelines,
    managing multiple workflow types and their interactions.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the system orchestrator."""
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Core components
        self.decision_engine = DecisionEngine(config.get("decision_engine", {}))
        self.state_manager = StateManager(config.get("state_manager", {}))
        self.event_bus = EventBus(config.get("event_bus", {}))
        
        # Workflow management
        self.active_workflows: Dict[str, WorkflowContext] = {}
        self.workflow_queue: asyncio.Queue = asyncio.Queue()
        self.max_concurrent_workflows = config.get("max_concurrent_workflows", 10)
        
        # System state
        self.is_running = False
        self.startup_time = None
        
        # Performance metrics
        self.metrics = {
            "workflows_completed": 0,
            "workflows_failed": 0,
            "average_workflow_duration": 0.0,
            "system_uptime": 0.0
        }
        
    async def start(self):
        """Start the orchestrator and all background tasks."""
        self.logger.info("Starting AI Innovation Monitoring System Orchestrator")
        
        self.startup_time = datetime.now()
        self.is_running = True
        
        # Start core components
        await self.decision_engine.start()
        await self.state_manager.start()
        await self.event_bus.start()
        
        # Start background tasks
        asyncio.create_task(self._workflow_processor())
        asyncio.create_task(self._health_monitor())
        asyncio.create_task(self._metrics_collector())
        
        # Subscribe to events
        await self._setup_event_handlers()
        
        self.logger.info("System orchestrator started successfully")
        
    async def stop(self):
        """Stop the orchestrator and cleanup resources."""
        self.logger.info("Stopping AI Innovation Monitoring System Orchestrator")
        
        self.is_running = False
        
        # Stop background tasks and components
        await self.decision_engine.stop()
        await self.state_manager.stop()
        await self.event_bus.stop()
        
        self.logger.info("System orchestrator stopped")
        
    async def submit_workflow(self, workflow_type: WorkflowType, 
                            parameters: Dict[str, Any], 
                            priority: int = 5) -> str:
        """
        Submit a new workflow for execution.
        
        Args:
            workflow_type: Type of workflow to execute
            parameters: Workflow-specific parameters
            priority: Priority level (1-10, higher is more urgent)
            
        Returns:
            Workflow ID for tracking
        """
        workflow_id = f"{workflow_type.value}_{datetime.now().isoformat()}_{id(parameters)}"
        
        context = WorkflowContext(
            workflow_id=workflow_id,
            workflow_type=workflow_type,
            priority=priority,
            created_at=datetime.now(),
            parameters=parameters
        )
        
        await self.workflow_queue.put(context)
        self.active_workflows[workflow_id] = context
        
        self.logger.info(f"Submitted workflow {workflow_id} of type {workflow_type.value}")
        
        # Emit workflow submitted event
        await self.event_bus.emit("workflow.submitted", {
            "workflow_id": workflow_id,
            "workflow_type": workflow_type.value,
            "priority": priority,
            "parameters": parameters
        })
        
        return workflow_id
        
    async def get_workflow_status(self, workflow_id: str) -> Optional[WorkflowContext]:
        """Get the current status of a workflow."""
        return self.active_workflows.get(workflow_id)
        
    async def cancel_workflow(self, workflow_id: str) -> bool:
        """Cancel a running workflow."""
        if workflow_id in self.active_workflows:
            context = self.active_workflows[workflow_id]
            context.status = "cancelled"
            
            await self.event_bus.emit("workflow.cancelled", {
                "workflow_id": workflow_id
            })
            
            self.logger.info(f"Cancelled workflow {workflow_id}")
            return True
            
        return False
        
    async def _workflow_processor(self):
        """Background task that processes workflows from the queue."""
        while self.is_running:
            try:
                # Get next workflow with timeout
                try:
                    context = await asyncio.wait_for(
                        self.workflow_queue.get(), 
                        timeout=1.0
                    )
                except asyncio.TimeoutError:
                    continue
                    
                # Check if we have capacity
                running_workflows = sum(
                    1 for w in self.active_workflows.values() 
                    if w.status == "running"
                )
                
                if running_workflows >= self.max_concurrent_workflows:
                    # Put back in queue and wait
                    await self.workflow_queue.put(context)
                    await asyncio.sleep(1)
                    continue
                    
                # Execute workflow
                asyncio.create_task(self._execute_workflow(context))
                
            except Exception as e:
                self.logger.error(f"Error in workflow processor: {e}")
                await asyncio.sleep(1)
                
    async def _execute_workflow(self, context: WorkflowContext):
        """Execute a specific workflow."""
        workflow_id = context.workflow_id
        start_time = datetime.now()
        
        try:
            self.logger.info(f"Starting execution of workflow {workflow_id}")
            context.status = "running"
            
            await self.event_bus.emit("workflow.started", {
                "workflow_id": workflow_id,
                "workflow_type": context.workflow_type.value
            })
            
            # Route to appropriate workflow handler
            if context.workflow_type == WorkflowType.RESEARCH_COORDINATION:
                results = await self._execute_research_workflow(context)
            elif context.workflow_type == WorkflowType.TASK_DECOMPOSITION:
                results = await self._execute_decomposition_workflow(context)
            elif context.workflow_type == WorkflowType.ADAPTIVE_COORDINATION:
                results = await self._execute_adaptive_workflow(context)
            else:
                raise ValueError(f"Unknown workflow type: {context.workflow_type}")
                
            # Update context with results
            context.results = results
            context.status = "completed"
            context.progress = 1.0
            
            # Update metrics
            duration = (datetime.now() - start_time).total_seconds()
            self.metrics["workflows_completed"] += 1
            self._update_average_duration(duration)
            
            self.logger.info(f"Completed workflow {workflow_id} in {duration:.2f}s")
            
            await self.event_bus.emit("workflow.completed", {
                "workflow_id": workflow_id,
                "duration": duration,
                "results": results
            })
            
        except Exception as e:
            context.status = "failed"
            context.error = str(e)
            self.metrics["workflows_failed"] += 1
            
            self.logger.error(f"Workflow {workflow_id} failed: {e}")
            
            await self.event_bus.emit("workflow.failed", {
                "workflow_id": workflow_id,
                "error": str(e)
            })
            
        finally:
            # Clean up completed/failed workflows after some time
            asyncio.create_task(self._cleanup_workflow(workflow_id, delay=3600))
            
    async def _execute_research_workflow(self, context: WorkflowContext) -> Dict[str, Any]:
        """Execute a research coordination workflow."""
        parameters = context.parameters
        
        # Research coordination workflow implementation
        research_areas = parameters.get("research_areas", [])
        evaluation_criteria = parameters.get("evaluation_criteria", {})
        
        results = {
            "research_findings": {},
            "synthesis": {},
            "recommendations": []
        }
        
        # Simulate research coordination steps
        for i, area in enumerate(research_areas):
            context.progress = (i + 1) / len(research_areas) * 0.8
            
            # Delegate research to specialized components
            findings = await self._conduct_research(area, evaluation_criteria)
            results["research_findings"][area] = findings
            
            await asyncio.sleep(0.1)  # Simulate processing time
            
        # Synthesize findings
        context.progress = 0.9
        results["synthesis"] = await self._synthesize_research(results["research_findings"])
        
        # Generate recommendations
        context.progress = 0.95
        results["recommendations"] = await self._generate_recommendations(results["synthesis"])
        
        return results
        
    async def _execute_decomposition_workflow(self, context: WorkflowContext) -> Dict[str, Any]:
        """Execute a task decomposition workflow."""
        parameters = context.parameters
        
        # Task decomposition workflow implementation
        main_task = parameters.get("main_task", {})
        decomposition_strategy = parameters.get("strategy", "component_based")
        
        results = {
            "task_analysis": {},
            "components": [],
            "integration_plan": {},
            "execution_timeline": {}
        }
        
        # Analyze task
        context.progress = 0.2
        results["task_analysis"] = await self._analyze_task(main_task)
        
        # Decompose into components
        context.progress = 0.5
        results["components"] = await self._decompose_task(
            main_task, decomposition_strategy
        )
        
        # Create integration plan
        context.progress = 0.8
        results["integration_plan"] = await self._create_integration_plan(
            results["components"]
        )
        
        # Generate timeline
        context.progress = 0.9
        results["execution_timeline"] = await self._generate_timeline(
            results["components"], results["integration_plan"]
        )
        
        return results
        
    async def _execute_adaptive_workflow(self, context: WorkflowContext) -> Dict[str, Any]:
        """Execute an adaptive coordination workflow."""
        parameters = context.parameters
        
        # Adaptive coordination workflow implementation
        coordination_strategies = parameters.get("strategies", [])
        monitoring_criteria = parameters.get("monitoring", {})
        
        results = {
            "strategy_evaluation": {},
            "selected_strategy": None,
            "adaptation_plan": {},
            "monitoring_setup": {}
        }
        
        # Evaluate strategies
        context.progress = 0.3
        for strategy in coordination_strategies:
            evaluation = await self._evaluate_strategy(strategy, monitoring_criteria)
            results["strategy_evaluation"][strategy] = evaluation
            
        # Select best strategy
        context.progress = 0.6
        results["selected_strategy"] = await self._select_strategy(
            results["strategy_evaluation"]
        )
        
        # Create adaptation plan
        context.progress = 0.8
        results["adaptation_plan"] = await self._create_adaptation_plan(
            results["selected_strategy"]
        )
        
        # Setup monitoring
        context.progress = 0.9
        results["monitoring_setup"] = await self._setup_adaptive_monitoring(
            results["selected_strategy"], monitoring_criteria
        )
        
        return results
        
    async def _health_monitor(self):
        """Background task that monitors system health."""
        while self.is_running:
            try:
                # Check component health
                health_status = {
                    "orchestrator": "healthy",
                    "decision_engine": await self.decision_engine.health_check(),
                    "state_manager": await self.state_manager.health_check(),
                    "event_bus": await self.event_bus.health_check(),
                    "active_workflows": len(self.active_workflows),
                    "queue_size": self.workflow_queue.qsize()
                }
                
                # Emit health status
                await self.event_bus.emit("system.health", health_status)
                
                # Check for stuck workflows
                await self._check_stuck_workflows()
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                self.logger.error(f"Error in health monitor: {e}")
                await asyncio.sleep(30)
                
    async def _metrics_collector(self):
        """Background task that collects and updates metrics."""
        while self.is_running:
            try:
                # Update uptime
                if self.startup_time:
                    self.metrics["system_uptime"] = (
                        datetime.now() - self.startup_time
                    ).total_seconds()
                
                # Emit metrics
                await self.event_bus.emit("system.metrics", self.metrics)
                
                await asyncio.sleep(60)  # Update every minute
                
            except Exception as e:
                self.logger.error(f"Error in metrics collector: {e}")
                await asyncio.sleep(60)
                
    async def _setup_event_handlers(self):
        """Setup event handlers for system events."""
        
        async def handle_innovation_detected(event_data):
            """Handle AI innovation detection events."""
            innovation = event_data.get("innovation", {})
            impact_score = innovation.get("impact_score", 0)
            
            # Determine appropriate workflow based on impact
            if impact_score > 8:
                # High impact - use adaptive coordination
                await self.submit_workflow(
                    WorkflowType.ADAPTIVE_COORDINATION,
                    {
                        "innovation": innovation,
                        "strategies": ["immediate_assessment", "rapid_adaptation"],
                        "monitoring": {"frequency": "real_time", "alerts": True}
                    },
                    priority=9
                )
            elif impact_score > 5:
                # Medium impact - use task decomposition
                await self.submit_workflow(
                    WorkflowType.TASK_DECOMPOSITION,
                    {
                        "main_task": {
                            "type": "impact_assessment",
                            "innovation": innovation
                        },
                        "strategy": "capability_based"
                    },
                    priority=6
                )
            else:
                # Low impact - use research coordination
                await self.submit_workflow(
                    WorkflowType.RESEARCH_COORDINATION,
                    {
                        "research_areas": [innovation.get("domain", "general")],
                        "evaluation_criteria": {"relevance": 0.7, "urgency": 0.3}
                    },
                    priority=3
                )
                
        await self.event_bus.subscribe("innovation.detected", handle_innovation_detected)
        
    # Helper methods for workflow execution
    async def _conduct_research(self, area: str, criteria: Dict[str, Any]) -> Dict[str, Any]:
        """Conduct research in a specific area."""
        # Placeholder implementation
        return {
            "area": area,
            "findings": f"Research findings for {area}",
            "confidence": 0.8,
            "sources": ["source1", "source2"]
        }
        
    async def _synthesize_research(self, findings: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesize research findings."""
        return {
            "summary": "Synthesized research summary",
            "key_insights": ["insight1", "insight2"],
            "confidence": 0.85
        }
        
    async def _generate_recommendations(self, synthesis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate recommendations based on synthesis."""
        return [
            {
                "recommendation": "Implement monitoring for trend X",
                "priority": "high",
                "timeline": "immediate"
            }
        ]
        
    async def _analyze_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a task for decomposition."""
        return {
            "complexity": "high",
            "estimated_effort": "large",
            "dependencies": [],
            "risks": []
        }
        
    async def _decompose_task(self, task: Dict[str, Any], strategy: str) -> List[Dict[str, Any]]:
        """Decompose a task into components."""
        return [
            {"component": "component1", "effort": "medium"},
            {"component": "component2", "effort": "small"}
        ]
        
    async def _create_integration_plan(self, components: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create integration plan for components."""
        return {
            "strategy": "sequential",
            "dependencies": {},
            "validation": "automated_testing"
        }
        
    async def _generate_timeline(self, components: List[Dict[str, Any]], 
                               integration_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Generate execution timeline."""
        return {
            "total_duration": "2 weeks",
            "milestones": [],
            "critical_path": []
        }
        
    async def _evaluate_strategy(self, strategy: str, criteria: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate a coordination strategy."""
        return {
            "strategy": strategy,
            "score": 0.8,
            "pros": ["pro1", "pro2"],
            "cons": ["con1"]
        }
        
    async def _select_strategy(self, evaluations: Dict[str, Any]) -> str:
        """Select the best strategy from evaluations."""
        best_strategy = max(
            evaluations.keys(),
            key=lambda k: evaluations[k].get("score", 0)
        )
        return best_strategy
        
    async def _create_adaptation_plan(self, strategy: str) -> Dict[str, Any]:
        """Create adaptation plan for selected strategy."""
        return {
            "strategy": strategy,
            "steps": [],
            "timeline": "1 week",
            "resources": []
        }
        
    async def _setup_adaptive_monitoring(self, strategy: str, 
                                       criteria: Dict[str, Any]) -> Dict[str, Any]:
        """Setup monitoring for adaptive strategy."""
        return {
            "strategy": strategy,
            "monitoring_points": [],
            "alert_thresholds": {},
            "reporting_frequency": "daily"
        }
        
    async def _check_stuck_workflows(self):
        """Check for workflows that may be stuck."""
        current_time = datetime.now()
        stuck_threshold = timedelta(hours=2)
        
        for workflow_id, context in self.active_workflows.items():
            if (context.status == "running" and 
                current_time - context.created_at > stuck_threshold):
                
                self.logger.warning(f"Workflow {workflow_id} may be stuck")
                await self.event_bus.emit("workflow.stuck", {
                    "workflow_id": workflow_id,
                    "duration": (current_time - context.created_at).total_seconds()
                })
                
    async def _cleanup_workflow(self, workflow_id: str, delay: int = 3600):
        """Clean up completed workflow after delay."""
        await asyncio.sleep(delay)
        if workflow_id in self.active_workflows:
            context = self.active_workflows[workflow_id]
            if context.status in ["completed", "failed", "cancelled"]:
                del self.active_workflows[workflow_id]
                self.logger.debug(f"Cleaned up workflow {workflow_id}")
                
    def _update_average_duration(self, duration: float):
        """Update average workflow duration metric."""
        total_workflows = self.metrics["workflows_completed"]
        if total_workflows == 1:
            self.metrics["average_workflow_duration"] = duration
        else:
            current_avg = self.metrics["average_workflow_duration"]
            self.metrics["average_workflow_duration"] = (
                (current_avg * (total_workflows - 1) + duration) / total_workflows
            )

