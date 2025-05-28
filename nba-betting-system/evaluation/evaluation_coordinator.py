"""
Evaluation Coordinator for AI-Driven NBA Playoff Betting System

This module coordinates all evaluation frameworks and provides a unified
interface for ethical, legal, and performance evaluation.
"""

import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict

from .ethical_framework import EthicalFramework
from .legal_compliance import LegalComplianceFramework, Jurisdiction
from .performance_monitoring import PerformanceMonitoringFramework, BettingResult
from .continuous_improvement import ContinuousImprovementFramework


@dataclass
class EvaluationResult:
    """Comprehensive evaluation result"""
    evaluation_id: str
    timestamp: datetime
    ethical_approval: bool
    legal_compliance: bool
    performance_status: str
    recommendations: List[str]
    violations: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    metadata: Dict[str, Any]


class EvaluationCoordinator:
    """
    Main coordinator for all evaluation frameworks
    
    This class provides a unified interface for ethical, legal, and performance
    evaluation of the AI-driven betting system.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the evaluation coordinator
        
        Args:
            config: Configuration dictionary containing settings for all frameworks
        """
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Initialize individual frameworks
        self.ethical_framework = EthicalFramework(config.get('ethical', {}))
        self.legal_framework = LegalComplianceFramework(config.get('legal', {}))
        self.performance_framework = PerformanceMonitoringFramework(config.get('performance', {}))
        self.improvement_framework = ContinuousImprovementFramework(
            config.get('improvement', {}), 
            self.performance_framework
        )
        
        # Evaluation history
        self.evaluation_history = []
        
        self.logger.info("Evaluation coordinator initialized")
    
    def evaluate_betting_prediction(self, 
                                  prediction: Dict[str, Any],
                                  user_context: Dict[str, Any],
                                  model_features: Dict[str, float],
                                  jurisdiction: Jurisdiction) -> EvaluationResult:
        """
        Perform comprehensive evaluation of a betting prediction
        
        Args:
            prediction: Model prediction details
            user_context: User context and session data
            model_features: Model feature importance
            jurisdiction: Applicable jurisdiction
            
        Returns:
            Comprehensive evaluation result
        """
        evaluation_id = f"eval_{datetime.now().timestamp()}"
        
        self.logger.info(f"Starting comprehensive evaluation: {evaluation_id}")
        
        # Ethical evaluation
        ethical_result = self.ethical_framework.evaluate_prediction(
            prediction, user_context, model_features
        )
        
        # Legal compliance check
        legal_user_result = self.legal_framework.validate_user_compliance(
            user_context, jurisdiction
        )
        
        bet_data = {
            'user_id': user_context.get('user_id'),
            'amount': prediction.get('recommended_stake', 0.0),
            'daily_loss': user_context.get('daily_loss', 0.0)
        }
        legal_bet_result = self.legal_framework.validate_betting_compliance(
            bet_data, jurisdiction
        )
        
        # Determine overall approval
        ethical_approval = ethical_result.get('ethical_approval', False)
        legal_compliance = (
            legal_user_result.get('eligible', False) and 
            legal_bet_result.get('compliant', False)
        )
        
        # Collect all violations
        violations = []
        violations.extend(ethical_result.get('violations', []))
        if not legal_user_result.get('eligible', True):
            violations.extend([{
                'type': 'legal_user_eligibility',
                'violations': legal_user_result.get('violations', [])
            }])
        if not legal_bet_result.get('compliant', True):
            violations.extend([{
                'type': 'legal_betting_limits',
                'violations': legal_bet_result.get('violations', [])
            }])
        
        # Generate recommendations
        recommendations = []
        recommendations.extend(ethical_result.get('recommendations', []))
        
        if not ethical_approval:
            recommendations.append("Prediction blocked due to ethical concerns")
        if not legal_compliance:
            recommendations.append("Prediction blocked due to legal compliance issues")
        
        # Create evaluation result
        evaluation_result = EvaluationResult(
            evaluation_id=evaluation_id,
            timestamp=datetime.now(),
            ethical_approval=ethical_approval,
            legal_compliance=legal_compliance,
            performance_status="pending",  # Will be updated after bet outcome
            recommendations=recommendations,
            violations=violations,
            metrics={
                'ethical_metrics': ethical_result,
                'legal_metrics': {
                    'user_eligibility': legal_user_result,
                    'betting_compliance': legal_bet_result
                }
            },
            metadata={
                'prediction_id': prediction.get('id'),
                'user_id': user_context.get('user_id'),
                'jurisdiction': jurisdiction.value,
                'model_id': prediction.get('model_id')
            }
        )
        
        # Store evaluation
        self.evaluation_history.append(evaluation_result)
        
        # Log audit trail
        self.legal_framework.audit_manager.log_action(
            user_id=user_context.get('user_id'),
            action='prediction_evaluation',
            resource='betting_prediction',
            details={
                'evaluation_id': evaluation_id,
                'ethical_approval': ethical_approval,
                'legal_compliance': legal_compliance,
                'prediction_id': prediction.get('id')
            },
            result='completed'
        )
        
        self.logger.info(f"Evaluation completed: {evaluation_id} - "
                        f"Ethical: {ethical_approval}, Legal: {legal_compliance}")
        
        return evaluation_result
    
    def record_betting_outcome(self, 
                             evaluation_id: str,
                             betting_result: BettingResult) -> None:
        """
        Record the outcome of a betting prediction for performance tracking
        
        Args:
            evaluation_id: ID of the original evaluation
            betting_result: Actual betting result
        """
        # Find the original evaluation
        evaluation = None
        for eval_result in self.evaluation_history:
            if eval_result.evaluation_id == evaluation_id:
                evaluation = eval_result
                break
        
        if not evaluation:
            self.logger.warning(f"Evaluation not found: {evaluation_id}")
            return
        
        # Record result in performance framework
        model_id = evaluation.metadata.get('model_id', 'unknown')
        self.performance_framework.record_betting_result(model_id, betting_result)
        
        # Update evaluation with performance status
        model_performance = self.performance_framework.get_model_performance(model_id)
        evaluation.performance_status = model_performance.get('performance_status', 'unknown')
        
        # Log audit trail
        self.legal_framework.audit_manager.log_action(
            user_id=evaluation.metadata.get('user_id'),
            action='betting_outcome_recorded',
            resource='betting_result',
            details={
                'evaluation_id': evaluation_id,
                'bet_id': betting_result.bet_id,
                'outcome': betting_result.actual_outcome,
                'profit_loss': betting_result.profit_loss
            },
            result='completed'
        )
        
        self.logger.info(f"Betting outcome recorded for evaluation: {evaluation_id}")
    
    def detect_model_bias(self, 
                         model_id: str,
                         predictions: List[Dict[str, Any]],
                         protected_attributes: Dict[str, List[Any]]) -> Dict[str, Any]:
        """
        Detect bias in model predictions
        
        Args:
            model_id: Model identifier
            predictions: List of model predictions
            protected_attributes: Protected attributes for bias testing
            
        Returns:
            Bias detection results
        """
        import numpy as np
        
        # Convert predictions to numpy array
        pred_values = np.array([p.get('probability', 0.0) for p in predictions])
        
        # Convert protected attributes to numpy arrays
        np_protected_attrs = {}
        for attr_name, attr_values in protected_attributes.items():
            np_protected_attrs[attr_name] = np.array(attr_values)
        
        # Detect bias
        bias_result = self.ethical_framework.detect_model_bias(
            pred_values, np_protected_attrs
        )
        
        # Log audit trail
        self.legal_framework.audit_manager.log_action(
            user_id=None,
            action='bias_detection',
            resource=f'model_{model_id}',
            details={
                'model_id': model_id,
                'predictions_count': len(predictions),
                'protected_attributes': list(protected_attributes.keys()),
                'bias_detected': len(bias_result.get('violations', [])) > 0
            },
            result='completed'
        )
        
        return bias_result
    
    def run_continuous_improvement(self) -> Dict[str, Any]:
        """
        Run continuous improvement cycle
        
        Returns:
            Improvement cycle results
        """
        improvement_result = self.improvement_framework.run_improvement_cycle()
        
        # Log audit trail
        self.legal_framework.audit_manager.log_action(
            user_id=None,
            action='improvement_cycle',
            resource='evaluation_framework',
            details=improvement_result,
            result='completed'
        )
        
        return improvement_result
    
    def generate_comprehensive_report(self, 
                                    period_days: int = 30,
                                    jurisdiction: Optional[Jurisdiction] = None) -> Dict[str, Any]:
        """
        Generate comprehensive evaluation report
        
        Args:
            period_days: Report period in days
            jurisdiction: Specific jurisdiction to report on
            
        Returns:
            Comprehensive evaluation report
        """
        report_start = datetime.now() - timedelta(days=period_days)
        
        # Filter evaluations by period
        recent_evaluations = [
            eval_result for eval_result in self.evaluation_history
            if eval_result.timestamp >= report_start
        ]
        
        # Ethical report
        ethical_report = self.ethical_framework.generate_ethical_report()
        
        # Legal compliance report
        legal_report = self.legal_framework.generate_compliance_report(jurisdiction)
        
        # Performance report
        performance_report = self.performance_framework.generate_performance_report(period_days)
        
        # Improvement report
        improvement_report = self.improvement_framework.generate_improvement_report()
        
        # Evaluation summary
        total_evaluations = len(recent_evaluations)
        approved_evaluations = len([e for e in recent_evaluations 
                                  if e.ethical_approval and e.legal_compliance])
        
        evaluation_summary = {
            'total_evaluations': total_evaluations,
            'approved_evaluations': approved_evaluations,
            'approval_rate': approved_evaluations / total_evaluations if total_evaluations > 0 else 0.0,
            'ethical_violations': len([e for e in recent_evaluations if not e.ethical_approval]),
            'legal_violations': len([e for e in recent_evaluations if not e.legal_compliance])
        }
        
        # Comprehensive report
        comprehensive_report = {
            'report_metadata': {
                'generated_at': datetime.now().isoformat(),
                'period_days': period_days,
                'jurisdiction': jurisdiction.value if jurisdiction else 'all',
                'report_version': '1.0'
            },
            'evaluation_summary': evaluation_summary,
            'ethical_compliance': ethical_report,
            'legal_compliance': legal_report,
            'performance_monitoring': performance_report,
            'continuous_improvement': improvement_report,
            'recommendations': self._generate_overall_recommendations(
                ethical_report, legal_report, performance_report, improvement_report
            ),
            'audit_integrity': self.legal_framework.audit_manager.verify_integrity()
        }
        
        # Log report generation
        self.legal_framework.audit_manager.log_action(
            user_id=None,
            action='comprehensive_report_generated',
            resource='evaluation_framework',
            details={
                'period_days': period_days,
                'jurisdiction': jurisdiction.value if jurisdiction else 'all',
                'total_evaluations': total_evaluations
            },
            result='completed'
        )
        
        return comprehensive_report
    
    def _generate_overall_recommendations(self, 
                                        ethical_report: Dict[str, Any],
                                        legal_report: Dict[str, Any],
                                        performance_report: Dict[str, Any],
                                        improvement_report: Dict[str, Any]) -> List[str]:
        """Generate overall recommendations based on all reports"""
        recommendations = []
        
        # Ethical recommendations
        if ethical_report.get('compliance_status') == 'non_compliant':
            recommendations.append("Address ethical compliance violations immediately")
        
        # Legal recommendations
        if legal_report.get('total_violations', 0) > 0:
            recommendations.append("Review and resolve legal compliance issues")
        
        # Performance recommendations
        portfolio_performance = performance_report.get('portfolio_performance', {})
        portfolio_roi = portfolio_performance.get('portfolio_metrics', {}).get('roi', {}).get('value', 0.0)
        if portfolio_roi < 0:
            recommendations.append("Portfolio showing negative ROI - urgent review required")
        
        # Improvement recommendations
        improvement_recs = improvement_report.get('recommendations', {}).get('recommended_actions', [])
        if improvement_recs:
            recommendations.append(f"Implement {len(improvement_recs)} identified improvement actions")
        
        # Audit integrity
        if not self.legal_framework.audit_manager.verify_integrity().get('valid', True):
            recommendations.append("CRITICAL: Audit trail integrity compromised - investigate immediately")
        
        return recommendations
    
    def get_evaluation_status(self) -> Dict[str, Any]:
        """Get current status of all evaluation frameworks"""
        return {
            'frameworks_active': {
                'ethical': True,
                'legal': True,
                'performance': True,
                'improvement': True
            },
            'total_evaluations': len(self.evaluation_history),
            'recent_evaluations_24h': len([
                e for e in self.evaluation_history
                if e.timestamp > datetime.now() - timedelta(hours=24)
            ]),
            'active_models': len(self.performance_framework.model_trackers),
            'active_experiments': len(self.improvement_framework.ab_test_manager.active_experiments),
            'audit_entries': len(self.legal_framework.audit_manager.audit_entries),
            'last_improvement_cycle': self.improvement_framework.last_improvement_cycle.isoformat(),
            'system_health': 'operational'
        }

