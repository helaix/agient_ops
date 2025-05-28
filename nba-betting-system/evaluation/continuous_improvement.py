"""
Continuous Improvement Framework for AI-Driven NBA Playoff Betting System

This module implements feedback loops, model retraining pipelines,
A/B testing frameworks, and automated improvement processes.
"""

import logging
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Callable
from dataclasses import dataclass, asdict
from enum import Enum
from collections import defaultdict, deque
import statistics
from abc import ABC, abstractmethod
import hashlib
import random


class ImprovementStrategy(Enum):
    """Types of improvement strategies"""
    MODEL_RETRAINING = "model_retraining"
    FEATURE_ENGINEERING = "feature_engineering"
    HYPERPARAMETER_TUNING = "hyperparameter_tuning"
    ENSEMBLE_OPTIMIZATION = "ensemble_optimization"
    DATA_AUGMENTATION = "data_augmentation"
    ARCHITECTURE_CHANGE = "architecture_change"


class ExperimentStatus(Enum):
    """A/B test experiment status"""
    PLANNING = "planning"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class FeedbackType(Enum):
    """Types of feedback"""
    PERFORMANCE_METRIC = "performance_metric"
    USER_BEHAVIOR = "user_behavior"
    MARKET_CONDITION = "market_condition"
    EXTERNAL_EVENT = "external_event"
    MODEL_DRIFT = "model_drift"


@dataclass
class FeedbackSignal:
    """Represents a feedback signal for improvement"""
    signal_id: str
    timestamp: datetime
    feedback_type: FeedbackType
    source: str
    value: float
    metadata: Dict[str, Any]
    confidence: float
    impact_score: float


@dataclass
class ImprovementAction:
    """Represents an improvement action to be taken"""
    action_id: str
    timestamp: datetime
    strategy: ImprovementStrategy
    description: str
    priority: int
    estimated_impact: float
    estimated_effort: int
    prerequisites: List[str]
    success_criteria: Dict[str, float]
    metadata: Dict[str, Any]


@dataclass
class ABTestExperiment:
    """A/B test experiment configuration"""
    experiment_id: str
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    status: ExperimentStatus
    control_group_size: float
    treatment_group_size: float
    success_metrics: List[str]
    minimum_effect_size: float
    statistical_power: float
    control_config: Dict[str, Any]
    treatment_config: Dict[str, Any]
    results: Optional[Dict[str, Any]]


class FeedbackCollector(ABC):
    """Abstract base class for feedback collection"""
    
    @abstractmethod
    def collect_feedback(self) -> List[FeedbackSignal]:
        """Collect feedback signals"""
        pass
    
    @abstractmethod
    def get_feedback_quality(self) -> float:
        """Get quality score of collected feedback"""
        pass


class PerformanceFeedbackCollector(FeedbackCollector):
    """Collects feedback from performance metrics"""
    
    def __init__(self, performance_monitor):
        self.performance_monitor = performance_monitor
        self.feedback_history = deque(maxlen=1000)
    
    def collect_feedback(self) -> List[FeedbackSignal]:
        """Collect performance-based feedback signals"""
        signals = []
        
        # Get recent performance data
        for model_id, tracker in self.performance_monitor.model_trackers.items():
            recent_metrics = tracker.calculate_metrics(period_days=7)
            
            for metric_type, metric in recent_metrics.items():
                # Create feedback signal for each metric
                signal = FeedbackSignal(
                    signal_id=f"perf_{model_id}_{metric_type.value}_{datetime.now().timestamp()}",
                    timestamp=datetime.now(),
                    feedback_type=FeedbackType.PERFORMANCE_METRIC,
                    source=f"model_{model_id}",
                    value=metric.value,
                    metadata={
                        'metric_type': metric_type.value,
                        'model_id': model_id,
                        'benchmark_comparison': metric.benchmark_comparison,
                        'confidence_interval': metric.confidence_interval
                    },
                    confidence=0.9,  # High confidence in performance metrics
                    impact_score=self._calculate_impact_score(metric_type, metric.value)
                )
                signals.append(signal)
                self.feedback_history.append(signal)
        
        return signals
    
    def get_feedback_quality(self) -> float:
        """Get quality score of performance feedback"""
        if not self.feedback_history:
            return 0.0
        
        # Quality based on recency and consistency
        recent_signals = [s for s in self.feedback_history 
                         if s.timestamp > datetime.now() - timedelta(hours=24)]
        
        if not recent_signals:
            return 0.5  # Moderate quality if no recent signals
        
        # Higher quality if we have consistent signals across models
        unique_sources = len(set(s.source for s in recent_signals))
        quality_score = min(1.0, unique_sources / 5.0)  # Normalize to max 5 models
        
        return quality_score
    
    def _calculate_impact_score(self, metric_type, value: float) -> float:
        """Calculate impact score based on metric type and value"""
        impact_thresholds = {
            'roi': {'excellent': 10.0, 'good': 5.0, 'poor': -5.0},
            'win_rate': {'excellent': 60.0, 'good': 55.0, 'poor': 45.0},
            'sharpe_ratio': {'excellent': 2.0, 'good': 1.0, 'poor': 0.0}
        }
        
        metric_name = metric_type.value if hasattr(metric_type, 'value') else str(metric_type)
        thresholds = impact_thresholds.get(metric_name, {'excellent': 1.0, 'good': 0.5, 'poor': 0.0})
        
        if value >= thresholds['excellent']:
            return 0.9  # High positive impact
        elif value >= thresholds['good']:
            return 0.6  # Moderate positive impact
        elif value >= thresholds['poor']:
            return 0.3  # Low impact
        else:
            return 0.1  # Negative impact


class MarketFeedbackCollector(FeedbackCollector):
    """Collects feedback from market conditions and external events"""
    
    def __init__(self):
        self.market_indicators = {}
        self.external_events = []
    
    def collect_feedback(self) -> List[FeedbackSignal]:
        """Collect market-based feedback signals"""
        signals = []
        
        # Simulate market condition feedback
        # In a real implementation, this would connect to market data APIs
        market_volatility = self._get_market_volatility()
        betting_volume = self._get_betting_volume()
        
        signals.extend([
            FeedbackSignal(
                signal_id=f"market_volatility_{datetime.now().timestamp()}",
                timestamp=datetime.now(),
                feedback_type=FeedbackType.MARKET_CONDITION,
                source="market_data",
                value=market_volatility,
                metadata={'indicator': 'volatility'},
                confidence=0.7,
                impact_score=0.5 if market_volatility < 0.3 else 0.8
            ),
            FeedbackSignal(
                signal_id=f"betting_volume_{datetime.now().timestamp()}",
                timestamp=datetime.now(),
                feedback_type=FeedbackType.MARKET_CONDITION,
                source="betting_platform",
                value=betting_volume,
                metadata={'indicator': 'volume'},
                confidence=0.8,
                impact_score=0.6
            )
        ])
        
        return signals
    
    def get_feedback_quality(self) -> float:
        """Get quality score of market feedback"""
        # Quality based on data freshness and completeness
        return 0.7  # Moderate quality for simulated data
    
    def _get_market_volatility(self) -> float:
        """Get current market volatility (simulated)"""
        return random.uniform(0.1, 0.8)
    
    def _get_betting_volume(self) -> float:
        """Get current betting volume (simulated)"""
        return random.uniform(0.3, 1.0)


class ImprovementEngine:
    """Main engine for generating improvement recommendations"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.feedback_collectors = []
        self.improvement_history = []
        self.action_queue = []
        self.strategy_effectiveness = defaultdict(list)
        self.logger = logging.getLogger(__name__)
    
    def add_feedback_collector(self, collector: FeedbackCollector) -> None:
        """Add a feedback collector"""
        self.feedback_collectors.append(collector)
    
    def analyze_feedback(self) -> List[ImprovementAction]:
        """Analyze feedback and generate improvement actions"""
        all_feedback = []
        
        # Collect feedback from all sources
        for collector in self.feedback_collectors:
            try:
                feedback = collector.collect_feedback()
                all_feedback.extend(feedback)
            except Exception as e:
                self.logger.error(f"Error collecting feedback: {e}")
        
        if not all_feedback:
            return []
        
        # Analyze feedback patterns
        improvement_actions = []
        
        # Group feedback by type and source
        feedback_groups = defaultdict(list)
        for signal in all_feedback:
            key = f"{signal.feedback_type.value}_{signal.source}"
            feedback_groups[key].append(signal)
        
        # Generate actions based on feedback patterns
        for group_key, signals in feedback_groups.items():
            actions = self._generate_actions_for_feedback_group(signals)
            improvement_actions.extend(actions)
        
        # Prioritize actions
        prioritized_actions = self._prioritize_actions(improvement_actions)
        
        return prioritized_actions
    
    def _generate_actions_for_feedback_group(self, signals: List[FeedbackSignal]) -> List[ImprovementAction]:
        """Generate improvement actions for a group of related feedback signals"""
        actions = []
        
        if not signals:
            return actions
        
        avg_impact = statistics.mean(s.impact_score for s in signals)
        avg_value = statistics.mean(s.value for s in signals)
        
        # Determine if action is needed based on impact and value
        if avg_impact < 0.4:  # Low performance
            if signals[0].feedback_type == FeedbackType.PERFORMANCE_METRIC:
                actions.append(self._create_model_improvement_action(signals, avg_impact))
            elif signals[0].feedback_type == FeedbackType.MARKET_CONDITION:
                actions.append(self._create_market_adaptation_action(signals, avg_impact))
        
        return actions
    
    def _create_model_improvement_action(self, signals: List[FeedbackSignal], 
                                       impact_score: float) -> ImprovementAction:
        """Create model improvement action"""
        model_id = signals[0].metadata.get('model_id', 'unknown')
        metric_type = signals[0].metadata.get('metric_type', 'unknown')
        
        # Determine strategy based on the type of performance issue
        if metric_type in ['roi', 'win_rate']:
            strategy = ImprovementStrategy.MODEL_RETRAINING
            description = f"Retrain model {model_id} due to poor {metric_type} performance"
        else:
            strategy = ImprovementStrategy.HYPERPARAMETER_TUNING
            description = f"Tune hyperparameters for model {model_id} to improve {metric_type}"
        
        return ImprovementAction(
            action_id=f"improve_{model_id}_{datetime.now().timestamp()}",
            timestamp=datetime.now(),
            strategy=strategy,
            description=description,
            priority=int((1.0 - impact_score) * 10),  # Higher priority for lower performance
            estimated_impact=0.8,
            estimated_effort=5,
            prerequisites=[f"model_{model_id}_data_available"],
            success_criteria={metric_type: signals[0].value * 1.2},  # 20% improvement target
            metadata={'model_id': model_id, 'metric_type': metric_type}
        )
    
    def _create_market_adaptation_action(self, signals: List[FeedbackSignal], 
                                       impact_score: float) -> ImprovementAction:
        """Create market adaptation action"""
        return ImprovementAction(
            action_id=f"market_adapt_{datetime.now().timestamp()}",
            timestamp=datetime.now(),
            strategy=ImprovementStrategy.FEATURE_ENGINEERING,
            description="Adapt models to current market conditions",
            priority=6,
            estimated_impact=0.6,
            estimated_effort=3,
            prerequisites=["market_data_available"],
            success_criteria={'market_adaptation_score': 0.8},
            metadata={'market_signals': len(signals)}
        )
    
    def _prioritize_actions(self, actions: List[ImprovementAction]) -> List[ImprovementAction]:
        """Prioritize improvement actions"""
        # Sort by priority (higher number = higher priority) and estimated impact
        return sorted(actions, key=lambda a: (a.priority, a.estimated_impact), reverse=True)
    
    def execute_action(self, action: ImprovementAction) -> Dict[str, Any]:
        """Execute an improvement action"""
        self.logger.info(f"Executing improvement action: {action.action_id}")
        
        # In a real implementation, this would trigger actual model retraining,
        # hyperparameter tuning, etc. For now, we simulate the execution.
        
        execution_result = {
            'action_id': action.action_id,
            'status': 'completed',
            'start_time': datetime.now(),
            'end_time': datetime.now() + timedelta(hours=1),  # Simulated duration
            'success': True,
            'metrics_before': {},
            'metrics_after': {},
            'improvement_achieved': random.uniform(0.1, 0.3)  # Simulated improvement
        }
        
        # Track strategy effectiveness
        self.strategy_effectiveness[action.strategy].append(execution_result['improvement_achieved'])
        
        # Add to history
        self.improvement_history.append({
            'action': asdict(action),
            'result': execution_result
        })
        
        return execution_result


class ABTestManager:
    """Manages A/B testing for model improvements"""
    
    def __init__(self):
        self.active_experiments = {}
        self.completed_experiments = []
        self.user_assignments = {}
        self.logger = logging.getLogger(__name__)
    
    def create_experiment(self, name: str, description: str,
                         control_config: Dict[str, Any],
                         treatment_config: Dict[str, Any],
                         duration_days: int = 14,
                         traffic_split: float = 0.5) -> str:
        """Create a new A/B test experiment"""
        experiment_id = f"exp_{hashlib.md5(f'{name}{datetime.now()}'.encode()).hexdigest()[:8]}"
        
        experiment = ABTestExperiment(
            experiment_id=experiment_id,
            name=name,
            description=description,
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=duration_days),
            status=ExperimentStatus.PLANNING,
            control_group_size=1.0 - traffic_split,
            treatment_group_size=traffic_split,
            success_metrics=['roi', 'win_rate', 'sharpe_ratio'],
            minimum_effect_size=0.05,  # 5% minimum effect size
            statistical_power=0.8,
            control_config=control_config,
            treatment_config=treatment_config,
            results=None
        )
        
        self.active_experiments[experiment_id] = experiment
        self.logger.info(f"Created A/B test experiment: {experiment_id}")
        
        return experiment_id
    
    def assign_user_to_group(self, user_id: str, experiment_id: str) -> str:
        """Assign user to control or treatment group"""
        if experiment_id not in self.active_experiments:
            return "control"  # Default to control if experiment not found
        
        experiment = self.active_experiments[experiment_id]
        
        # Use consistent hashing for assignment
        hash_input = f"{user_id}_{experiment_id}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        assignment_ratio = (hash_value % 1000) / 1000.0
        
        group = "treatment" if assignment_ratio < experiment.treatment_group_size else "control"
        
        # Store assignment
        self.user_assignments[f"{user_id}_{experiment_id}"] = {
            'group': group,
            'assigned_at': datetime.now(),
            'experiment_id': experiment_id
        }
        
        return group
    
    def get_user_config(self, user_id: str, experiment_id: str) -> Dict[str, Any]:
        """Get configuration for user based on their group assignment"""
        group = self.assign_user_to_group(user_id, experiment_id)
        experiment = self.active_experiments.get(experiment_id)
        
        if not experiment:
            return {}
        
        return experiment.treatment_config if group == "treatment" else experiment.control_config
    
    def record_experiment_result(self, user_id: str, experiment_id: str,
                               metrics: Dict[str, float]) -> None:
        """Record result for a user in an experiment"""
        assignment_key = f"{user_id}_{experiment_id}"
        if assignment_key in self.user_assignments:
            self.user_assignments[assignment_key]['metrics'] = metrics
            self.user_assignments[assignment_key]['recorded_at'] = datetime.now()
    
    def analyze_experiment(self, experiment_id: str) -> Dict[str, Any]:
        """Analyze A/B test results"""
        if experiment_id not in self.active_experiments:
            return {'error': 'Experiment not found'}
        
        experiment = self.active_experiments[experiment_id]
        
        # Collect results for both groups
        control_results = []
        treatment_results = []
        
        for assignment_key, assignment in self.user_assignments.items():
            if assignment['experiment_id'] == experiment_id and 'metrics' in assignment:
                metrics = assignment['metrics']
                if assignment['group'] == 'control':
                    control_results.append(metrics)
                else:
                    treatment_results.append(metrics)
        
        if not control_results or not treatment_results:
            return {'error': 'Insufficient data for analysis'}
        
        # Calculate statistical significance for each metric
        analysis_results = {}
        
        for metric in experiment.success_metrics:
            control_values = [r.get(metric, 0) for r in control_results]
            treatment_values = [r.get(metric, 0) for r in treatment_results]
            
            if control_values and treatment_values:
                control_mean = statistics.mean(control_values)
                treatment_mean = statistics.mean(treatment_values)
                
                # Simple statistical test (in practice, use proper statistical tests)
                effect_size = (treatment_mean - control_mean) / control_mean if control_mean != 0 else 0
                
                analysis_results[metric] = {
                    'control_mean': control_mean,
                    'treatment_mean': treatment_mean,
                    'effect_size': effect_size,
                    'significant': abs(effect_size) >= experiment.minimum_effect_size,
                    'control_sample_size': len(control_values),
                    'treatment_sample_size': len(treatment_values)
                }
        
        return {
            'experiment_id': experiment_id,
            'status': experiment.status.value,
            'duration_days': (datetime.now() - experiment.start_date).days,
            'results': analysis_results,
            'recommendation': self._generate_experiment_recommendation(analysis_results)
        }
    
    def _generate_experiment_recommendation(self, results: Dict[str, Any]) -> str:
        """Generate recommendation based on experiment results"""
        significant_improvements = 0
        significant_degradations = 0
        
        for metric, result in results.items():
            if result['significant']:
                if result['effect_size'] > 0:
                    significant_improvements += 1
                else:
                    significant_degradations += 1
        
        if significant_improvements > significant_degradations:
            return "Recommend implementing treatment configuration"
        elif significant_degradations > significant_improvements:
            return "Recommend keeping control configuration"
        else:
            return "No clear winner - consider extending experiment or trying different approach"
    
    def complete_experiment(self, experiment_id: str) -> Dict[str, Any]:
        """Complete an A/B test experiment"""
        if experiment_id not in self.active_experiments:
            return {'error': 'Experiment not found'}
        
        experiment = self.active_experiments[experiment_id]
        analysis = self.analyze_experiment(experiment_id)
        
        experiment.status = ExperimentStatus.COMPLETED
        experiment.results = analysis
        
        # Move to completed experiments
        self.completed_experiments.append(experiment)
        del self.active_experiments[experiment_id]
        
        self.logger.info(f"Completed A/B test experiment: {experiment_id}")
        
        return analysis


class ContinuousImprovementFramework:
    """Main continuous improvement framework coordinator"""
    
    def __init__(self, config: Dict[str, Any], performance_monitor):
        self.config = config
        self.improvement_engine = ImprovementEngine(config)
        self.ab_test_manager = ABTestManager()
        self.performance_monitor = performance_monitor
        self.improvement_cycle_interval = config.get('improvement_cycle_hours', 24)
        self.last_improvement_cycle = datetime.now()
        self.logger = logging.getLogger(__name__)
        
        # Initialize feedback collectors
        self._initialize_feedback_collectors()
    
    def _initialize_feedback_collectors(self) -> None:
        """Initialize feedback collectors"""
        # Performance feedback
        perf_collector = PerformanceFeedbackCollector(self.performance_monitor)
        self.improvement_engine.add_feedback_collector(perf_collector)
        
        # Market feedback
        market_collector = MarketFeedbackCollector()
        self.improvement_engine.add_feedback_collector(market_collector)
    
    def run_improvement_cycle(self) -> Dict[str, Any]:
        """Run a complete improvement cycle"""
        cycle_start = datetime.now()
        
        # Check if it's time for improvement cycle
        if (cycle_start - self.last_improvement_cycle).total_seconds() < self.improvement_cycle_interval * 3600:
            return {'status': 'skipped', 'reason': 'Too soon for next cycle'}
        
        self.logger.info("Starting improvement cycle")
        
        # Analyze feedback and generate actions
        improvement_actions = self.improvement_engine.analyze_feedback()
        
        # Execute high-priority actions
        executed_actions = []
        for action in improvement_actions[:3]:  # Execute top 3 actions
            if action.priority >= 7:  # Only execute high-priority actions
                result = self.improvement_engine.execute_action(action)
                executed_actions.append(result)
        
        # Update last cycle time
        self.last_improvement_cycle = cycle_start
        
        cycle_result = {
            'cycle_start': cycle_start.isoformat(),
            'actions_identified': len(improvement_actions),
            'actions_executed': len(executed_actions),
            'executed_actions': executed_actions,
            'next_cycle_scheduled': (cycle_start + timedelta(hours=self.improvement_cycle_interval)).isoformat()
        }
        
        self.logger.info(f"Improvement cycle completed: {len(executed_actions)} actions executed")
        
        return cycle_result
    
    def create_improvement_experiment(self, improvement_action: ImprovementAction) -> str:
        """Create A/B test experiment for an improvement action"""
        # Create control and treatment configurations
        control_config = {'strategy': 'current', 'parameters': {}}
        treatment_config = {
            'strategy': improvement_action.strategy.value,
            'parameters': improvement_action.metadata
        }
        
        experiment_id = self.ab_test_manager.create_experiment(
            name=f"Improvement Test: {improvement_action.strategy.value}",
            description=improvement_action.description,
            control_config=control_config,
            treatment_config=treatment_config,
            duration_days=14,
            traffic_split=0.3  # 30% treatment, 70% control
        )
        
        return experiment_id
    
    def get_improvement_recommendations(self) -> Dict[str, Any]:
        """Get current improvement recommendations"""
        # Analyze recent feedback
        improvement_actions = self.improvement_engine.analyze_feedback()
        
        # Get strategy effectiveness
        strategy_effectiveness = {}
        for strategy, improvements in self.improvement_engine.strategy_effectiveness.items():
            if improvements:
                strategy_effectiveness[strategy.value] = {
                    'average_improvement': statistics.mean(improvements),
                    'success_rate': len([i for i in improvements if i > 0]) / len(improvements),
                    'total_attempts': len(improvements)
                }
        
        return {
            'recommended_actions': [asdict(action) for action in improvement_actions[:5]],
            'strategy_effectiveness': strategy_effectiveness,
            'active_experiments': len(self.ab_test_manager.active_experiments),
            'improvement_history_count': len(self.improvement_engine.improvement_history),
            'last_improvement_cycle': self.last_improvement_cycle.isoformat(),
            'next_cycle_due': (self.last_improvement_cycle + timedelta(hours=self.improvement_cycle_interval)).isoformat()
        }
    
    def generate_improvement_report(self) -> Dict[str, Any]:
        """Generate comprehensive improvement report"""
        # Get recent improvement history
        recent_improvements = [
            imp for imp in self.improvement_engine.improvement_history
            if imp['result']['start_time'] > datetime.now() - timedelta(days=30)
        ]
        
        # Calculate improvement metrics
        total_improvements = len(recent_improvements)
        successful_improvements = len([imp for imp in recent_improvements if imp['result']['success']])
        average_improvement = statistics.mean([
            imp['result']['improvement_achieved'] for imp in recent_improvements
        ]) if recent_improvements else 0.0
        
        # Get A/B test summary
        ab_test_summary = {
            'active_experiments': len(self.ab_test_manager.active_experiments),
            'completed_experiments': len(self.ab_test_manager.completed_experiments),
            'total_user_assignments': len(self.ab_test_manager.user_assignments)
        }
        
        return {
            'report_period_days': 30,
            'improvement_summary': {
                'total_improvements': total_improvements,
                'successful_improvements': successful_improvements,
                'success_rate': successful_improvements / total_improvements if total_improvements > 0 else 0.0,
                'average_improvement': average_improvement
            },
            'ab_test_summary': ab_test_summary,
            'strategy_effectiveness': dict(self.improvement_engine.strategy_effectiveness),
            'recent_improvements': recent_improvements,
            'recommendations': self.get_improvement_recommendations(),
            'generated_at': datetime.now().isoformat()
        }

