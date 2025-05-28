"""
Unit tests for the Ethical Framework

This module contains comprehensive tests for ethical compliance,
bias detection, and responsible gambling features.
"""

import unittest
import numpy as np
from datetime import datetime, timedelta
from unittest.mock import Mock, patch

from ..ethical_framework import (
    EthicalFramework,
    EthicalViolationSeverity,
    UserRiskLevel,
    DemographicParityDetector,
    ResponsibleGamblingMonitor,
    TransparencyEngine
)


class TestDemographicParityDetector(unittest.TestCase):
    """Test cases for demographic parity bias detection"""
    
    def setUp(self):
        self.detector = DemographicParityDetector(threshold=0.1)
    
    def test_no_bias_detection(self):
        """Test detection when no bias is present"""
        predictions = np.array([0.5, 0.6, 0.4, 0.7, 0.3, 0.8])
        protected_attrs = {
            'group': np.array(['A', 'B', 'A', 'B', 'A', 'B'])
        }
        
        bias_metrics = self.detector.detect_bias(predictions, protected_attrs)
        
        self.assertIn('group', bias_metrics)
        self.assertLess(bias_metrics['group'], self.detector.threshold)
    
    def test_bias_detection(self):
        """Test detection when bias is present"""
        # Create biased predictions
        predictions = np.array([0.8, 0.9, 0.7, 0.3, 0.2, 0.4])
        protected_attrs = {
            'group': np.array(['A', 'A', 'A', 'B', 'B', 'B'])
        }
        
        bias_metrics = self.detector.detect_bias(predictions, protected_attrs)
        
        self.assertIn('group', bias_metrics)
        self.assertGreater(bias_metrics['group'], self.detector.threshold)
    
    def test_empty_predictions(self):
        """Test handling of empty predictions"""
        predictions = np.array([])
        protected_attrs = {'group': np.array([])}
        
        bias_metrics = self.detector.detect_bias(predictions, protected_attrs)
        
        self.assertEqual(len(bias_metrics), 0)
    
    def test_single_group(self):
        """Test handling when only one group is present"""
        predictions = np.array([0.5, 0.6, 0.7])
        protected_attrs = {'group': np.array(['A', 'A', 'A'])}
        
        bias_metrics = self.detector.detect_bias(predictions, protected_attrs)
        
        self.assertEqual(len(bias_metrics), 0)


class TestResponsibleGamblingMonitor(unittest.TestCase):
    """Test cases for responsible gambling monitoring"""
    
    def setUp(self):
        config = {
            'risk_thresholds': {
                'max_session_duration': timedelta(hours=4),
                'max_daily_loss': 1000.0,
                'max_bet_frequency': 50,
                'min_win_rate_concern': 0.1
            }
        }
        self.monitor = ResponsibleGamblingMonitor(config)
    
    def test_low_risk_assessment(self):
        """Test assessment of low-risk user behavior"""
        session_data = {
            'duration': timedelta(hours=1),
            'daily_loss': 100.0,
            'bet_count': 10,
            'win_rate': 0.6
        }
        
        risk_level = self.monitor.assess_user_risk('user_123', session_data)
        
        self.assertEqual(risk_level, UserRiskLevel.LOW)
    
    def test_high_risk_assessment(self):
        """Test assessment of high-risk user behavior"""
        session_data = {
            'duration': timedelta(hours=6),  # Excessive
            'daily_loss': 1500.0,  # Excessive
            'bet_count': 60,  # Excessive
            'win_rate': 0.05  # Very low
        }
        
        risk_level = self.monitor.assess_user_risk('user_123', session_data)
        
        self.assertIn(risk_level, [UserRiskLevel.HIGH, UserRiskLevel.CRITICAL])
    
    def test_intervention_triggering(self):
        """Test intervention triggering for high-risk users"""
        intervention = self.monitor.trigger_intervention('user_123', UserRiskLevel.HIGH)
        
        self.assertEqual(intervention['action'], 'session_limit')
        self.assertEqual(intervention['user_id'], 'user_123')
        self.assertEqual(intervention['risk_level'], 'high')
        self.assertIn('cooldown', intervention)
    
    def test_critical_intervention(self):
        """Test critical intervention for critical risk users"""
        intervention = self.monitor.trigger_intervention('user_123', UserRiskLevel.CRITICAL)
        
        self.assertEqual(intervention['action'], 'account_suspension')
        self.assertTrue(intervention['require_counseling'])


class TestTransparencyEngine(unittest.TestCase):
    """Test cases for transparency and explainability"""
    
    def setUp(self):
        self.engine = TransparencyEngine()
    
    def test_explanation_generation(self):
        """Test generation of prediction explanations"""
        prediction = {
            'confidence': 0.8,
            'probability': 0.65
        }
        
        model_features = {
            'team_elo_rating': 0.35,
            'recent_performance': 0.25,
            'injury_impact': -0.15,
            'home_advantage': 0.12
        }
        
        explanation = self.engine.generate_explanation(prediction, model_features)
        
        self.assertIn('prediction_confidence', explanation)
        self.assertIn('key_factors', explanation)
        self.assertIn('risk_assessment', explanation)
        self.assertIn('recommendation_basis', explanation)
        
        # Check that key factors are sorted by importance
        key_factors = explanation['key_factors']
        self.assertEqual(len(key_factors), 4)
        self.assertEqual(key_factors[0]['factor'], 'Team Strength Rating')
    
    def test_risk_assessment(self):
        """Test risk assessment for predictions"""
        # High confidence prediction
        high_conf_prediction = {'confidence': 0.9}
        explanation = self.engine.generate_explanation(high_conf_prediction, {})
        self.assertEqual(explanation['risk_assessment'], 'low')
        
        # Low confidence prediction
        low_conf_prediction = {'confidence': 0.4}
        explanation = self.engine.generate_explanation(low_conf_prediction, {})
        self.assertEqual(explanation['risk_assessment'], 'high')
    
    def test_feature_humanization(self):
        """Test conversion of technical feature names to human-readable format"""
        technical_name = 'team_elo_rating'
        human_name = self.engine._humanize_feature_name(technical_name)
        self.assertEqual(human_name, 'Team Strength Rating')
        
        # Test unknown feature
        unknown_name = 'unknown_feature'
        human_name = self.engine._humanize_feature_name(unknown_name)
        self.assertEqual(human_name, 'Unknown Feature')


class TestEthicalFramework(unittest.TestCase):
    """Test cases for the main ethical framework"""
    
    def setUp(self):
        config = {
            'risk_thresholds': {
                'max_session_duration': timedelta(hours=4),
                'max_daily_loss': 1000.0,
                'max_bet_frequency': 50,
                'min_win_rate_concern': 0.1
            }
        }
        self.framework = EthicalFramework(config)
    
    def test_prediction_evaluation_approval(self):
        """Test evaluation that should be approved"""
        prediction = {
            'id': 'pred_001',
            'confidence': 0.8,
            'probability': 0.65
        }
        
        user_context = {
            'user_id': 'user_123',
            'duration': timedelta(hours=1),
            'daily_loss': 100.0,
            'bet_count': 10,
            'win_rate': 0.6
        }
        
        model_features = {
            'team_elo_rating': 0.35,
            'recent_performance': 0.25
        }
        
        result = self.framework.evaluate_prediction(prediction, user_context, model_features)
        
        self.assertTrue(result['ethical_approval'])
        self.assertIn('user_protection', result)
        self.assertIn('transparency', result)
    
    def test_prediction_evaluation_rejection(self):
        """Test evaluation that should be rejected"""
        prediction = {
            'id': 'pred_002',
            'confidence': 0.8,
            'probability': 0.65
        }
        
        # High-risk user context
        user_context = {
            'user_id': 'user_456',
            'duration': timedelta(hours=6),
            'daily_loss': 1500.0,
            'bet_count': 60,
            'win_rate': 0.05
        }
        
        model_features = {
            'team_elo_rating': 0.35,
            'recent_performance': 0.25
        }
        
        result = self.framework.evaluate_prediction(prediction, user_context, model_features)
        
        self.assertFalse(result['ethical_approval'])
        self.assertTrue(result['user_protection']['intervention_required'])
        self.assertIn('intervention', result['user_protection'])
    
    def test_bias_detection_integration(self):
        """Test integration of bias detection"""
        predictions = np.array([0.8, 0.9, 0.3, 0.2])
        protected_attrs = {
            'group': np.array(['A', 'A', 'B', 'B'])
        }
        
        result = self.framework.detect_model_bias(predictions, protected_attrs)
        
        self.assertIn('bias_metrics', result)
        self.assertIn('violations', result)
        self.assertIn('overall_bias_score', result)
        
        # Should detect bias in this case
        self.assertGreater(result['overall_bias_score'], 0.1)
        self.assertGreater(len(result['violations']), 0)
    
    def test_ethical_report_generation(self):
        """Test generation of ethical compliance report"""
        # Add some violations first
        predictions = np.array([0.8, 0.9, 0.3, 0.2])
        protected_attrs = {'group': np.array(['A', 'A', 'B', 'B'])}
        self.framework.detect_model_bias(predictions, protected_attrs)
        
        report = self.framework.generate_ethical_report()
        
        self.assertIn('report_timestamp', report)
        self.assertIn('total_violations', report)
        self.assertIn('compliance_status', report)
        self.assertIn('recommendations', report)
        self.assertIn('bias_metrics', report)
    
    @patch('logging.getLogger')
    def test_logging_integration(self, mock_logger):
        """Test that logging is properly integrated"""
        # This test ensures that the framework properly logs events
        framework = EthicalFramework({})
        
        # Verify logger was called during initialization
        mock_logger.assert_called()


class TestEthicalViolationSeverity(unittest.TestCase):
    """Test cases for ethical violation severity enum"""
    
    def test_severity_levels(self):
        """Test that all severity levels are defined"""
        self.assertEqual(EthicalViolationSeverity.LOW.value, "low")
        self.assertEqual(EthicalViolationSeverity.MEDIUM.value, "medium")
        self.assertEqual(EthicalViolationSeverity.HIGH.value, "high")
        self.assertEqual(EthicalViolationSeverity.CRITICAL.value, "critical")


class TestUserRiskLevel(unittest.TestCase):
    """Test cases for user risk level enum"""
    
    def test_risk_levels(self):
        """Test that all risk levels are defined"""
        self.assertEqual(UserRiskLevel.LOW.value, "low")
        self.assertEqual(UserRiskLevel.MODERATE.value, "moderate")
        self.assertEqual(UserRiskLevel.HIGH.value, "high")
        self.assertEqual(UserRiskLevel.CRITICAL.value, "critical")


if __name__ == '__main__':
    unittest.main()

