"""
Ethical Framework for AI-Driven NBA Playoff Betting System

This module implements comprehensive ethical guidelines and monitoring
for responsible gambling practices, bias detection, and user protection.
"""

import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np
from abc import ABC, abstractmethod


class EthicalViolationSeverity(Enum):
    """Severity levels for ethical violations"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class UserRiskLevel(Enum):
    """User risk assessment levels"""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class EthicalViolation:
    """Represents an ethical violation detected in the system"""
    violation_id: str
    timestamp: datetime
    severity: EthicalViolationSeverity
    category: str
    description: str
    affected_users: List[str]
    model_component: Optional[str]
    remediation_required: bool
    metadata: Dict[str, Any]


@dataclass
class UserProtectionMetrics:
    """Metrics for user protection and responsible gambling"""
    user_id: str
    session_duration: timedelta
    bet_frequency: int
    loss_amount: float
    win_rate: float
    risk_indicators: List[str]
    intervention_triggered: bool
    last_assessment: datetime


class BiasDetector(ABC):
    """Abstract base class for bias detection algorithms"""
    
    @abstractmethod
    def detect_bias(self, predictions: np.ndarray, 
                   protected_attributes: Dict[str, np.ndarray]) -> Dict[str, float]:
        """Detect bias in model predictions"""
        pass
    
    @abstractmethod
    def get_bias_metrics(self) -> Dict[str, float]:
        """Get current bias metrics"""
        pass


class DemographicParityDetector(BiasDetector):
    """Detects bias using demographic parity metrics"""
    
    def __init__(self, threshold: float = 0.1):
        self.threshold = threshold
        self.bias_history = []
    
    def detect_bias(self, predictions: np.ndarray, 
                   protected_attributes: Dict[str, np.ndarray]) -> Dict[str, float]:
        """
        Detect demographic parity violations
        
        Args:
            predictions: Model predictions
            protected_attributes: Dictionary of protected attributes
            
        Returns:
            Dictionary of bias metrics for each protected attribute
        """
        bias_metrics = {}
        
        for attr_name, attr_values in protected_attributes.items():
            unique_values = np.unique(attr_values)
            if len(unique_values) < 2:
                continue
                
            group_rates = {}
            for value in unique_values:
                mask = attr_values == value
                if np.sum(mask) > 0:
                    group_rates[value] = np.mean(predictions[mask])
            
            if len(group_rates) >= 2:
                rates = list(group_rates.values())
                bias_score = max(rates) - min(rates)
                bias_metrics[attr_name] = bias_score
                
                # Store bias history
                self.bias_history.append({
                    'timestamp': datetime.now(),
                    'attribute': attr_name,
                    'bias_score': bias_score,
                    'group_rates': group_rates
                })
        
        return bias_metrics
    
    def get_bias_metrics(self) -> Dict[str, float]:
        """Get current bias metrics summary"""
        if not self.bias_history:
            return {}
        
        recent_metrics = {}
        for record in self.bias_history[-10:]:  # Last 10 measurements
            attr = record['attribute']
            if attr not in recent_metrics:
                recent_metrics[attr] = []
            recent_metrics[attr].append(record['bias_score'])
        
        return {attr: np.mean(scores) for attr, scores in recent_metrics.items()}


class ResponsibleGamblingMonitor:
    """Monitors user behavior for responsible gambling compliance"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.user_sessions = {}
        self.risk_thresholds = config.get('risk_thresholds', {
            'max_session_duration': timedelta(hours=4),
            'max_daily_loss': 1000.0,
            'max_bet_frequency': 50,
            'min_win_rate_concern': 0.1
        })
    
    def assess_user_risk(self, user_id: str, session_data: Dict[str, Any]) -> UserRiskLevel:
        """
        Assess user risk level based on gambling behavior
        
        Args:
            user_id: User identifier
            session_data: Current session data
            
        Returns:
            User risk level assessment
        """
        risk_score = 0
        risk_indicators = []
        
        # Session duration check
        session_duration = session_data.get('duration', timedelta(0))
        if session_duration > self.risk_thresholds['max_session_duration']:
            risk_score += 2
            risk_indicators.append('excessive_session_duration')
        
        # Loss amount check
        daily_loss = session_data.get('daily_loss', 0.0)
        if daily_loss > self.risk_thresholds['max_daily_loss']:
            risk_score += 3
            risk_indicators.append('excessive_daily_loss')
        
        # Bet frequency check
        bet_frequency = session_data.get('bet_count', 0)
        if bet_frequency > self.risk_thresholds['max_bet_frequency']:
            risk_score += 2
            risk_indicators.append('high_bet_frequency')
        
        # Win rate check
        win_rate = session_data.get('win_rate', 1.0)
        if win_rate < self.risk_thresholds['min_win_rate_concern']:
            risk_score += 2
            risk_indicators.append('low_win_rate')
        
        # Determine risk level
        if risk_score >= 6:
            return UserRiskLevel.CRITICAL
        elif risk_score >= 4:
            return UserRiskLevel.HIGH
        elif risk_score >= 2:
            return UserRiskLevel.MODERATE
        else:
            return UserRiskLevel.LOW
    
    def trigger_intervention(self, user_id: str, risk_level: UserRiskLevel) -> Dict[str, Any]:
        """
        Trigger appropriate intervention based on risk level
        
        Args:
            user_id: User identifier
            risk_level: Assessed risk level
            
        Returns:
            Intervention details
        """
        interventions = {
            UserRiskLevel.LOW: {'action': 'none'},
            UserRiskLevel.MODERATE: {
                'action': 'warning',
                'message': 'Consider taking a break from betting',
                'cooldown': timedelta(minutes=30)
            },
            UserRiskLevel.HIGH: {
                'action': 'session_limit',
                'message': 'Session limit reached for your protection',
                'cooldown': timedelta(hours=2)
            },
            UserRiskLevel.CRITICAL: {
                'action': 'account_suspension',
                'message': 'Account temporarily suspended for your protection',
                'cooldown': timedelta(hours=24),
                'require_counseling': True
            }
        }
        
        intervention = interventions[risk_level].copy()
        intervention['user_id'] = user_id
        intervention['timestamp'] = datetime.now()
        intervention['risk_level'] = risk_level.value
        
        return intervention


class TransparencyEngine:
    """Provides explainability and transparency for AI decisions"""
    
    def __init__(self):
        self.explanation_cache = {}
    
    def generate_explanation(self, prediction: Dict[str, Any], 
                           model_features: Dict[str, float]) -> Dict[str, Any]:
        """
        Generate human-readable explanation for a betting recommendation
        
        Args:
            prediction: Model prediction details
            model_features: Feature importance scores
            
        Returns:
            Explanation dictionary
        """
        # Sort features by importance
        sorted_features = sorted(model_features.items(), 
                               key=lambda x: abs(x[1]), reverse=True)
        
        top_features = sorted_features[:5]  # Top 5 most important features
        
        explanation = {
            'prediction_confidence': prediction.get('confidence', 0.0),
            'key_factors': [],
            'risk_assessment': self._assess_prediction_risk(prediction),
            'recommendation_basis': self._generate_recommendation_text(top_features),
            'timestamp': datetime.now().isoformat()
        }
        
        for feature, importance in top_features:
            explanation['key_factors'].append({
                'factor': self._humanize_feature_name(feature),
                'importance': importance,
                'impact': 'positive' if importance > 0 else 'negative'
            })
        
        return explanation
    
    def _assess_prediction_risk(self, prediction: Dict[str, Any]) -> str:
        """Assess the risk level of a prediction"""
        confidence = prediction.get('confidence', 0.0)
        
        if confidence >= 0.8:
            return 'low'
        elif confidence >= 0.6:
            return 'medium'
        else:
            return 'high'
    
    def _generate_recommendation_text(self, top_features: List[Tuple[str, float]]) -> str:
        """Generate human-readable recommendation text"""
        if not top_features:
            return "Recommendation based on general market analysis"
        
        primary_factor = self._humanize_feature_name(top_features[0][0])
        return f"Recommendation primarily based on {primary_factor} and related performance metrics"
    
    def _humanize_feature_name(self, feature_name: str) -> str:
        """Convert technical feature names to human-readable format"""
        feature_map = {
            'team_elo_rating': 'Team Strength Rating',
            'recent_performance': 'Recent Game Performance',
            'injury_impact': 'Player Injury Impact',
            'home_advantage': 'Home Court Advantage',
            'head_to_head': 'Historical Matchup Performance',
            'playoff_experience': 'Playoff Experience',
            'rest_days': 'Team Rest and Recovery',
            'betting_market_movement': 'Market Sentiment'
        }
        
        return feature_map.get(feature_name, feature_name.replace('_', ' ').title())


class EthicalFramework:
    """Main ethical framework coordinator"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.bias_detector = DemographicParityDetector()
        self.gambling_monitor = ResponsibleGamblingMonitor(config)
        self.transparency_engine = TransparencyEngine()
        self.violations = []
        self.logger = logging.getLogger(__name__)
    
    def evaluate_prediction(self, prediction: Dict[str, Any], 
                          user_context: Dict[str, Any],
                          model_features: Dict[str, float]) -> Dict[str, Any]:
        """
        Comprehensive ethical evaluation of a betting prediction
        
        Args:
            prediction: Model prediction
            user_context: User context and session data
            model_features: Model feature importance
            
        Returns:
            Ethical evaluation results
        """
        evaluation_results = {
            'timestamp': datetime.now(),
            'prediction_id': prediction.get('id'),
            'ethical_approval': True,
            'violations': [],
            'user_protection': {},
            'transparency': {},
            'recommendations': []
        }
        
        # User protection assessment
        user_id = user_context.get('user_id')
        if user_id:
            risk_level = self.gambling_monitor.assess_user_risk(user_id, user_context)
            evaluation_results['user_protection'] = {
                'risk_level': risk_level.value,
                'intervention_required': risk_level in [UserRiskLevel.HIGH, UserRiskLevel.CRITICAL]
            }
            
            if evaluation_results['user_protection']['intervention_required']:
                intervention = self.gambling_monitor.trigger_intervention(user_id, risk_level)
                evaluation_results['user_protection']['intervention'] = intervention
                evaluation_results['ethical_approval'] = False
        
        # Transparency and explainability
        explanation = self.transparency_engine.generate_explanation(prediction, model_features)
        evaluation_results['transparency'] = explanation
        
        # Generate recommendations
        if not evaluation_results['ethical_approval']:
            evaluation_results['recommendations'].append(
                "Prediction blocked due to user protection concerns"
            )
        
        if explanation['risk_assessment'] == 'high':
            evaluation_results['recommendations'].append(
                "High uncertainty prediction - consider additional verification"
            )
        
        return evaluation_results
    
    def detect_model_bias(self, predictions: np.ndarray, 
                         protected_attributes: Dict[str, np.ndarray]) -> Dict[str, Any]:
        """
        Detect bias in model predictions
        
        Args:
            predictions: Model predictions
            protected_attributes: Protected attributes for bias testing
            
        Returns:
            Bias detection results
        """
        bias_metrics = self.bias_detector.detect_bias(predictions, protected_attributes)
        
        violations = []
        for attribute, bias_score in bias_metrics.items():
            if bias_score > self.bias_detector.threshold:
                violation = EthicalViolation(
                    violation_id=f"bias_{attribute}_{datetime.now().timestamp()}",
                    timestamp=datetime.now(),
                    severity=EthicalViolationSeverity.HIGH,
                    category="bias_detection",
                    description=f"Demographic parity violation detected for {attribute}",
                    affected_users=[],
                    model_component="prediction_model",
                    remediation_required=True,
                    metadata={'bias_score': bias_score, 'threshold': self.bias_detector.threshold}
                )
                violations.append(violation)
                self.violations.append(violation)
        
        return {
            'bias_metrics': bias_metrics,
            'violations': [asdict(v) for v in violations],
            'overall_bias_score': max(bias_metrics.values()) if bias_metrics else 0.0,
            'bias_threshold': self.bias_detector.threshold
        }
    
    def generate_ethical_report(self) -> Dict[str, Any]:
        """Generate comprehensive ethical compliance report"""
        recent_violations = [v for v in self.violations 
                           if v.timestamp > datetime.now() - timedelta(days=30)]
        
        return {
            'report_timestamp': datetime.now(),
            'total_violations': len(self.violations),
            'recent_violations': len(recent_violations),
            'violation_breakdown': self._get_violation_breakdown(recent_violations),
            'bias_metrics': self.bias_detector.get_bias_metrics(),
            'compliance_status': 'compliant' if len(recent_violations) == 0 else 'non_compliant',
            'recommendations': self._generate_compliance_recommendations(recent_violations)
        }
    
    def _get_violation_breakdown(self, violations: List[EthicalViolation]) -> Dict[str, int]:
        """Get breakdown of violations by category and severity"""
        breakdown = {
            'by_category': {},
            'by_severity': {}
        }
        
        for violation in violations:
            # By category
            category = violation.category
            breakdown['by_category'][category] = breakdown['by_category'].get(category, 0) + 1
            
            # By severity
            severity = violation.severity.value
            breakdown['by_severity'][severity] = breakdown['by_severity'].get(severity, 0) + 1
        
        return breakdown
    
    def _generate_compliance_recommendations(self, violations: List[EthicalViolation]) -> List[str]:
        """Generate recommendations based on recent violations"""
        recommendations = []
        
        if any(v.category == 'bias_detection' for v in violations):
            recommendations.append("Review and retrain models to address bias concerns")
        
        if any(v.severity == EthicalViolationSeverity.CRITICAL for v in violations):
            recommendations.append("Immediate review of critical violations required")
        
        if len(violations) > 10:
            recommendations.append("Consider implementing additional monitoring and controls")
        
        return recommendations

