"""
Basic Usage Examples for the Evaluation Framework

This module demonstrates how to use the evaluation framework
for ethical, legal, and performance evaluation.
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any

from ..evaluation_coordinator import EvaluationCoordinator
from ..legal_compliance import Jurisdiction
from ..performance_monitoring import BettingResult
from ..config import DEFAULT_CONFIG


def example_basic_evaluation():
    """Example of basic prediction evaluation"""
    
    # Initialize the evaluation coordinator
    coordinator = EvaluationCoordinator(DEFAULT_CONFIG)
    
    # Example prediction from ML model
    prediction = {
        'id': 'pred_001',
        'model_id': 'ensemble_v1',
        'game_id': 'LAL_vs_BOS_2024_playoffs_game1',
        'bet_type': 'moneyline',
        'recommended_team': 'LAL',
        'probability': 0.65,
        'confidence': 0.8,
        'recommended_stake': 100.0,
        'expected_return': 150.0
    }
    
    # Example user context
    user_context = {
        'user_id': 'user_12345',
        'age': 25,
        'location': {'state': 'Nevada', 'country': 'US'},
        'session_duration': timedelta(hours=2),
        'daily_loss': 200.0,
        'bet_count': 15,
        'win_rate': 0.6,
        'self_excluded': False,
        'account_tier': 'premium'
    }
    
    # Example model features (for explainability)
    model_features = {
        'team_elo_rating': 0.35,
        'recent_performance': 0.25,
        'injury_impact': 0.15,
        'home_advantage': 0.12,
        'head_to_head': 0.08,
        'playoff_experience': 0.05
    }
    
    # Perform comprehensive evaluation
    evaluation_result = coordinator.evaluate_betting_prediction(
        prediction=prediction,
        user_context=user_context,
        model_features=model_features,
        jurisdiction=Jurisdiction.US_NEVADA
    )
    
    print("=== Evaluation Result ===")
    print(f"Evaluation ID: {evaluation_result.evaluation_id}")
    print(f"Ethical Approval: {evaluation_result.ethical_approval}")
    print(f"Legal Compliance: {evaluation_result.legal_compliance}")
    print(f"Recommendations: {evaluation_result.recommendations}")
    print(f"Violations: {len(evaluation_result.violations)}")
    
    return evaluation_result


def example_bias_detection():
    """Example of bias detection in model predictions"""
    
    coordinator = EvaluationCoordinator(DEFAULT_CONFIG)
    
    # Example predictions for bias testing
    predictions = []
    protected_attributes = {
        'age_group': [],
        'geographic_region': [],
        'account_tier': []
    }
    
    # Generate sample data
    for i in range(1000):
        # Simulate predictions with potential bias
        age_group = 'young' if i % 3 == 0 else 'middle' if i % 3 == 1 else 'senior'
        region = 'urban' if i % 2 == 0 else 'rural'
        tier = 'premium' if i % 4 == 0 else 'standard'
        
        # Introduce bias: higher probabilities for certain groups
        base_prob = 0.5
        if age_group == 'young':
            base_prob += 0.1
        if tier == 'premium':
            base_prob += 0.05
        
        predictions.append({
            'id': f'pred_{i}',
            'probability': min(0.95, base_prob + np.random.normal(0, 0.1))
        })
        
        protected_attributes['age_group'].append(age_group)
        protected_attributes['geographic_region'].append(region)
        protected_attributes['account_tier'].append(tier)
    
    # Detect bias
    bias_result = coordinator.detect_model_bias(
        model_id='ensemble_v1',
        predictions=predictions,
        protected_attributes=protected_attributes
    )
    
    print("=== Bias Detection Result ===")
    print(f"Overall Bias Score: {bias_result.get('overall_bias_score', 0.0):.3f}")
    print(f"Violations Detected: {len(bias_result.get('violations', []))}")
    
    for attr, score in bias_result.get('bias_metrics', {}).items():
        print(f"  {attr}: {score:.3f}")
    
    return bias_result


def example_performance_tracking():
    """Example of performance tracking and monitoring"""
    
    coordinator = EvaluationCoordinator(DEFAULT_CONFIG)
    
    # Register a model for tracking
    model_id = 'ensemble_v1'
    coordinator.performance_framework.register_model(model_id)
    
    # Simulate betting results over time
    results = []
    for i in range(100):
        # Simulate varying performance
        win_probability = 0.55 + np.random.normal(0, 0.1)
        actual_outcome = np.random.random() < win_probability
        
        stake = 100.0
        odds = 1.8 + np.random.normal(0, 0.2)
        payout = stake * odds if actual_outcome else 0.0
        profit_loss = payout - stake
        
        result = BettingResult(
            bet_id=f'bet_{i}',
            timestamp=datetime.now() - timedelta(hours=100-i),
            game_id=f'game_{i}',
            bet_type='moneyline',
            stake=stake,
            odds=odds,
            predicted_probability=win_probability,
            actual_outcome=actual_outcome,
            payout=payout,
            profit_loss=profit_loss,
            model_confidence=0.8,
            features_used={'feature_1': 0.5, 'feature_2': 0.3}
        )
        
        results.append(result)
        coordinator.performance_framework.record_betting_result(model_id, result)
    
    # Get performance report
    performance_report = coordinator.performance_framework.get_model_performance(model_id)
    
    print("=== Performance Report ===")
    print(f"Model ID: {model_id}")
    print(f"Performance Status: {performance_report.get('performance_status')}")
    print(f"Total Bets: {performance_report.get('total_bets')}")
    
    metrics = performance_report.get('metrics', {})
    for metric_name, metric_data in metrics.items():
        print(f"  {metric_name}: {metric_data.get('value', 0.0):.3f}")
    
    return performance_report


def example_continuous_improvement():
    """Example of continuous improvement cycle"""
    
    coordinator = EvaluationCoordinator(DEFAULT_CONFIG)
    
    # First, set up some performance data
    model_id = 'ensemble_v1'
    coordinator.performance_framework.register_model(model_id)
    
    # Simulate poor performance to trigger improvements
    for i in range(50):
        result = BettingResult(
            bet_id=f'bet_{i}',
            timestamp=datetime.now() - timedelta(hours=50-i),
            game_id=f'game_{i}',
            bet_type='moneyline',
            stake=100.0,
            odds=1.8,
            predicted_probability=0.6,
            actual_outcome=np.random.random() < 0.4,  # Poor win rate
            payout=180.0 if np.random.random() < 0.4 else 0.0,
            profit_loss=80.0 if np.random.random() < 0.4 else -100.0,
            model_confidence=0.8,
            features_used={'feature_1': 0.5}
        )
        coordinator.performance_framework.record_betting_result(model_id, result)
    
    # Run improvement cycle
    improvement_result = coordinator.run_continuous_improvement()
    
    print("=== Continuous Improvement Result ===")
    print(f"Actions Identified: {improvement_result.get('actions_identified', 0)}")
    print(f"Actions Executed: {improvement_result.get('actions_executed', 0)}")
    
    # Get improvement recommendations
    recommendations = coordinator.improvement_framework.get_improvement_recommendations()
    
    print("=== Improvement Recommendations ===")
    for i, action in enumerate(recommendations.get('recommended_actions', [])[:3]):
        print(f"{i+1}. {action.get('description', 'No description')}")
        print(f"   Priority: {action.get('priority', 0)}")
        print(f"   Estimated Impact: {action.get('estimated_impact', 0.0):.2f}")
    
    return improvement_result


def example_comprehensive_report():
    """Example of generating a comprehensive evaluation report"""
    
    coordinator = EvaluationCoordinator(DEFAULT_CONFIG)
    
    # Set up some sample data first
    example_basic_evaluation()
    example_performance_tracking()
    
    # Generate comprehensive report
    report = coordinator.generate_comprehensive_report(
        period_days=30,
        jurisdiction=Jurisdiction.US_NEVADA
    )
    
    print("=== Comprehensive Report ===")
    print(f"Report Period: {report['report_metadata']['period_days']} days")
    print(f"Generated At: {report['report_metadata']['generated_at']}")
    
    # Evaluation summary
    eval_summary = report.get('evaluation_summary', {})
    print(f"\nEvaluation Summary:")
    print(f"  Total Evaluations: {eval_summary.get('total_evaluations', 0)}")
    print(f"  Approval Rate: {eval_summary.get('approval_rate', 0.0):.2%}")
    
    # Recommendations
    recommendations = report.get('recommendations', [])
    print(f"\nTop Recommendations:")
    for i, rec in enumerate(recommendations[:3], 1):
        print(f"  {i}. {rec}")
    
    return report


def example_ab_testing():
    """Example of A/B testing for model improvements"""
    
    coordinator = EvaluationCoordinator(DEFAULT_CONFIG)
    
    # Create an A/B test experiment
    control_config = {
        'model_type': 'ensemble',
        'features': ['basic_stats', 'elo_rating'],
        'hyperparameters': {'learning_rate': 0.01}
    }
    
    treatment_config = {
        'model_type': 'ensemble',
        'features': ['basic_stats', 'elo_rating', 'advanced_metrics'],
        'hyperparameters': {'learning_rate': 0.02}
    }
    
    experiment_id = coordinator.improvement_framework.ab_test_manager.create_experiment(
        name="Feature Enhancement Test",
        description="Testing impact of additional advanced metrics",
        control_config=control_config,
        treatment_config=treatment_config,
        duration_days=14,
        traffic_split=0.3
    )
    
    print("=== A/B Test Created ===")
    print(f"Experiment ID: {experiment_id}")
    
    # Simulate user assignments and results
    for user_id in [f'user_{i}' for i in range(100)]:
        group = coordinator.improvement_framework.ab_test_manager.assign_user_to_group(
            user_id, experiment_id
        )
        
        # Simulate different performance for treatment group
        if group == 'treatment':
            roi = np.random.normal(8.0, 2.0)  # Better performance
            win_rate = np.random.normal(58.0, 5.0)
        else:
            roi = np.random.normal(5.0, 2.0)  # Control performance
            win_rate = np.random.normal(55.0, 5.0)
        
        coordinator.improvement_framework.ab_test_manager.record_experiment_result(
            user_id, experiment_id, {'roi': roi, 'win_rate': win_rate}
        )
    
    # Analyze experiment
    analysis = coordinator.improvement_framework.ab_test_manager.analyze_experiment(experiment_id)
    
    print("=== A/B Test Analysis ===")
    for metric, result in analysis.get('results', {}).items():
        print(f"{metric}:")
        print(f"  Control: {result.get('control_mean', 0.0):.2f}")
        print(f"  Treatment: {result.get('treatment_mean', 0.0):.2f}")
        print(f"  Effect Size: {result.get('effect_size', 0.0):.3f}")
        print(f"  Significant: {result.get('significant', False)}")
    
    print(f"\nRecommendation: {analysis.get('recommendation', 'No recommendation')}")
    
    return analysis


if __name__ == "__main__":
    print("Running Evaluation Framework Examples...\n")
    
    # Run all examples
    example_basic_evaluation()
    print("\n" + "="*50 + "\n")
    
    example_bias_detection()
    print("\n" + "="*50 + "\n")
    
    example_performance_tracking()
    print("\n" + "="*50 + "\n")
    
    example_continuous_improvement()
    print("\n" + "="*50 + "\n")
    
    example_ab_testing()
    print("\n" + "="*50 + "\n")
    
    example_comprehensive_report()
    
    print("\nAll examples completed successfully!")

