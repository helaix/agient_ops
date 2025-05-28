"""
Training Pipeline for NBA Playoff Betting System

This module orchestrates the complete training workflow from data loading
to model deployment, with emphasis on calibration for betting applications.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
import logging
from pathlib import Path
import joblib
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

from .feature_engineering import FeaturePipeline, FeatureConfig
from .models import (
    ModelTrainer, ModelEvaluator, CalibrationPipeline, 
    EnsembleModel, ModelConfig
)
from .utils import DataValidator, FeatureStore, ModelRegistry, PerformanceMonitor
from .config import config_manager


class TrainingPipeline:
    """Complete training pipeline for NBA playoff prediction models."""
    
    def __init__(self, config_path: Optional[str] = None):
        # Load configuration
        if config_path:
            self.config = config_manager
            self.config.config_file = config_path
            self.config._load_config()
        else:
            self.config = config_manager
        
        # Initialize components
        self.feature_pipeline = FeaturePipeline(
            FeatureConfig(
                lookback_games=self.config.feature_config.lookback_games,
                playoff_weight_factor=self.config.feature_config.playoff_weight_factor,
                home_court_advantage=self.config.feature_config.home_court_advantage,
                rest_day_impact=self.config.feature_config.rest_day_impact,
                injury_impact_threshold=self.config.feature_config.injury_impact_threshold,
                chemistry_window=self.config.feature_config.chemistry_window
            )
        )
        
        self.model_trainer = ModelTrainer(
            ModelConfig(
                random_state=self.config.model_config.random_state,
                cv_folds=self.config.model_config.cv_folds,
                calibration_method=self.config.model_config.calibration_method,
                ensemble_method=self.config.model_config.ensemble_method,
                validation_split=self.config.model_config.validation_size,
                early_stopping_rounds=self.config.model_config.early_stopping_rounds,
                hyperparameter_tuning=self.config.model_config.hyperparameter_tuning
            )
        )
        
        self.model_evaluator = ModelEvaluator()
        self.data_validator = DataValidator()
        
        # Initialize storage components
        if self.config.data_config.feature_store_enabled:
            self.feature_store = FeatureStore(self.config.data_config.feature_store_path)
        else:
            self.feature_store = None
        
        if self.config.system_config.model_registry_enabled:
            self.model_registry = ModelRegistry(self.config.system_config.model_registry_path)
        else:
            self.model_registry = None
        
        if self.config.system_config.monitoring_enabled:
            self.performance_monitor = PerformanceMonitor()
        else:
            self.performance_monitor = None
        
        # Setup logging
        self._setup_logging()
        
        # Training state
        self.trained_models = {}
        self.best_model = None
        self.training_metrics = {}
        self.feature_importance = {}
    
    def _setup_logging(self):
        """Setup logging for the training pipeline."""
        log_dir = Path(self.config.system_config.logs_dir)
        log_dir.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=getattr(logging, self.config.system_config.log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_dir / 'training.log'),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger(__name__)
    
    def run_full_pipeline(self, data: Dict[str, pd.DataFrame], 
                         target_column: str = 'win') -> Dict[str, Any]:
        """Run the complete training pipeline."""
        self.logger.info("Starting NBA playoff betting model training pipeline")
        
        try:
            # Step 1: Data validation
            self.logger.info("Step 1: Validating input data")
            validation_result = self._validate_data(data)
            if not validation_result.is_valid:
                raise ValueError(f"Data validation failed: {validation_result.errors}")
            
            # Step 2: Feature engineering
            self.logger.info("Step 2: Engineering features")
            X, y = self._engineer_features(data, target_column)
            
            # Step 3: Data splitting
            self.logger.info("Step 3: Splitting data")
            X_train, X_val, X_test, y_train, y_val, y_test = self._split_data(X, y)
            
            # Step 4: Model training
            self.logger.info("Step 4: Training models")
            self.trained_models = self._train_models(X_train, y_train)
            
            # Step 5: Model calibration
            self.logger.info("Step 5: Calibrating models")
            self._calibrate_models(X_val, y_val)
            
            # Step 6: Model evaluation
            self.logger.info("Step 6: Evaluating models")
            evaluation_results = self._evaluate_models(X_test, y_test)
            
            # Step 7: Model selection
            self.logger.info("Step 7: Selecting best model")
            self.best_model = self._select_best_model(evaluation_results)
            
            # Step 8: Feature importance analysis
            self.logger.info("Step 8: Analyzing feature importance")
            self.feature_importance = self._analyze_feature_importance()
            
            # Step 9: Model registration
            if self.model_registry:
                self.logger.info("Step 9: Registering models")
                self._register_models()
            
            # Step 10: Generate training report
            self.logger.info("Step 10: Generating training report")
            training_report = self._generate_training_report(evaluation_results)
            
            self.logger.info("Training pipeline completed successfully")
            return training_report
            
        except Exception as e:
            self.logger.error(f"Training pipeline failed: {str(e)}")
            raise
    
    def _validate_data(self, data: Dict[str, pd.DataFrame]) -> Any:
        """Validate input data quality and consistency."""
        validation_result = self.data_validator.validate_data(data)
        
        if validation_result.warnings:
            for warning in validation_result.warnings:
                self.logger.warning(f"Data validation warning: {warning}")
        
        return validation_result
    
    def _engineer_features(self, data: Dict[str, pd.DataFrame], 
                          target_column: str) -> Tuple[pd.DataFrame, pd.Series]:
        """Engineer features using the feature pipeline."""
        # Extract features
        X = self.feature_pipeline.fit_transform(data)
        
        # Extract target variable (assuming it's in team data)
        if 'team_data' in data and target_column in data['team_data'].columns:
            y = data['team_data'][target_column]
        else:
            raise ValueError(f"Target column '{target_column}' not found in team_data")
        
        # Align features and target
        common_index = X.index.intersection(y.index)
        X = X.loc[common_index]
        y = y.loc[common_index]
        
        self.logger.info(f"Engineered {X.shape[1]} features for {X.shape[0]} samples")
        
        # Store features if feature store is enabled
        if self.feature_store:
            for idx in X.index:
                game_id = str(idx)  # Assuming index contains game identifiers
                team_id = "unknown"  # Would need to extract from data structure
                self.feature_store.store_features(
                    X.loc[[idx]], 'engineered_features', game_id, team_id
                )
        
        return X, y
    
    def _split_data(self, X: pd.DataFrame, y: pd.Series) -> Tuple[pd.DataFrame, ...]:
        """Split data into train, validation, and test sets."""
        from sklearn.model_selection import train_test_split
        
        # First split: separate test set
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, 
            test_size=self.config.model_config.test_size,
            random_state=self.config.model_config.random_state,
            stratify=y
        )
        
        # Second split: separate train and validation
        val_size = self.config.model_config.validation_size / (1 - self.config.model_config.test_size)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=val_size,
            random_state=self.config.model_config.random_state,
            stratify=y_temp
        )
        
        self.logger.info(f"Data split - Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def _train_models(self, X_train: pd.DataFrame, y_train: pd.Series) -> Dict[str, Any]:
        """Train multiple models."""
        models_to_train = self.config.model_config.models_to_train
        trained_models = self.model_trainer.train_models(X_train, y_train, models_to_train)
        
        self.training_metrics = self.model_trainer.training_history
        
        return trained_models
    
    def _calibrate_models(self, X_val: pd.DataFrame, y_val: pd.Series):
        """Calibrate model probabilities."""
        calibration_pipeline = CalibrationPipeline(
            ModelConfig(calibration_method=self.config.model_config.calibration_method)
        )
        
        calibration_pipeline.fit(self.trained_models, X_val, y_val)
        
        self.logger.info("Model calibration completed")
    
    def _evaluate_models(self, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
        """Evaluate all trained models."""
        evaluation_results = self.model_evaluator.generate_evaluation_report(
            self.trained_models, X_test, y_test
        )
        
        # Log evaluation results
        for model_name, results in evaluation_results.items():
            metrics = results['basic_metrics']
            self.logger.info(
                f"{model_name} - Brier: {metrics['brier_score']:.4f}, "
                f"LogLoss: {metrics['log_loss']:.4f}, AUC: {metrics['auc']:.4f}"
            )
        
        return evaluation_results
    
    def _select_best_model(self, evaluation_results: Dict[str, Any]) -> Any:
        """Select the best model based on primary metric."""
        primary_metric = self.config.evaluation_config.primary_metric
        
        best_score = float('inf') if primary_metric in ['brier_score', 'log_loss'] else float('-inf')
        best_model_name = None
        
        for model_name, results in evaluation_results.items():
            score = results['basic_metrics'][primary_metric]
            
            if primary_metric in ['brier_score', 'log_loss']:
                if score < best_score:
                    best_score = score
                    best_model_name = model_name
            else:
                if score > best_score:
                    best_score = score
                    best_model_name = model_name
        
        best_model = self.trained_models[best_model_name]
        self.logger.info(f"Best model selected: {best_model_name} ({primary_metric}: {best_score:.4f})")
        
        return best_model
    
    def _analyze_feature_importance(self) -> Dict[str, Dict[str, float]]:
        """Analyze feature importance across all models."""
        feature_importance = {}
        
        for model_name, model in self.trained_models.items():
            importance = self.feature_pipeline.get_feature_importance(model)
            feature_importance[model_name] = importance
        
        # Calculate average importance across models
        if feature_importance:
            all_features = set()
            for importance_dict in feature_importance.values():
                all_features.update(importance_dict.keys())
            
            avg_importance = {}
            for feature in all_features:
                importances = [
                    importance_dict.get(feature, 0) 
                    for importance_dict in feature_importance.values()
                ]
                avg_importance[feature] = np.mean(importances)
            
            feature_importance['average'] = dict(
                sorted(avg_importance.items(), key=lambda x: x[1], reverse=True)
            )
        
        return feature_importance
    
    def _register_models(self):
        """Register trained models in the model registry."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        for model_name, model in self.trained_models.items():
            version = f"{timestamp}_{model_name}"
            
            metadata = {
                'training_date': datetime.now(),
                'model_type': model_name,
                'training_metrics': self.training_metrics.get(model_name, {}),
                'feature_count': len(self.feature_pipeline.feature_names),
                'config': self.config.get_config_summary()
            }
            
            model_id = self.model_registry.register_model(
                model, model_name, version, metadata
            )
            
            self.logger.info(f"Registered model {model_name} with ID: {model_id}")
        
        # Deploy best model
        if self.best_model:
            best_model_name = None
            for name, model in self.trained_models.items():
                if model is self.best_model:
                    best_model_name = name
                    break
            
            if best_model_name:
                version = f"{timestamp}_{best_model_name}"
                self.model_registry.deploy_model(best_model_name, version, "production")
                self.logger.info(f"Deployed {best_model_name} to production")
    
    def _generate_training_report(self, evaluation_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive training report."""
        report = {
            'training_summary': {
                'timestamp': datetime.now(),
                'models_trained': list(self.trained_models.keys()),
                'best_model': self._get_best_model_name(),
                'feature_count': len(self.feature_pipeline.feature_names),
                'config_summary': self.config.get_config_summary()
            },
            'model_performance': evaluation_results,
            'training_metrics': self.training_metrics,
            'feature_importance': self.feature_importance,
            'top_features': self._get_top_features(10),
            'recommendations': self._generate_recommendations(evaluation_results)
        }
        
        # Save report
        report_path = Path(self.config.system_config.logs_dir) / f"training_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w') as f:
            import json
            json.dump(report, f, indent=2, default=str)
        
        return report
    
    def _get_best_model_name(self) -> Optional[str]:
        """Get the name of the best model."""
        if self.best_model:
            for name, model in self.trained_models.items():
                if model is self.best_model:
                    return name
        return None
    
    def _get_top_features(self, n: int = 10) -> List[Tuple[str, float]]:
        """Get top N most important features."""
        if 'average' in self.feature_importance:
            avg_importance = self.feature_importance['average']
            return list(avg_importance.items())[:n]
        return []
    
    def _generate_recommendations(self, evaluation_results: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on training results."""
        recommendations = []
        
        # Check calibration quality
        for model_name, results in evaluation_results.items():
            if 'calibration_metrics' in results:
                ece = results['calibration_metrics'].get('expected_calibration_error', 0)
                if ece > 0.1:
                    recommendations.append(
                        f"Consider improving calibration for {model_name} (ECE: {ece:.3f})"
                    )
        
        # Check feature importance
        if self.feature_importance and 'average' in self.feature_importance:
            top_features = list(self.feature_importance['average'].keys())[:5]
            recommendations.append(
                f"Top contributing features: {', '.join(top_features[:3])}"
            )
        
        # Check model performance spread
        brier_scores = [
            results['basic_metrics']['brier_score'] 
            for results in evaluation_results.values()
        ]
        if max(brier_scores) - min(brier_scores) < 0.01:
            recommendations.append(
                "Model performances are very similar - consider ensemble methods"
            )
        
        return recommendations
    
    def predict(self, data: Dict[str, pd.DataFrame], 
                model_name: Optional[str] = None) -> np.ndarray:
        """Make predictions using trained models."""
        if not self.trained_models:
            raise ValueError("No models have been trained yet")
        
        # Engineer features
        X = self.feature_pipeline.transform(data)
        
        # Select model
        if model_name:
            if model_name not in self.trained_models:
                raise ValueError(f"Model {model_name} not found")
            model = self.trained_models[model_name]
        else:
            model = self.best_model or list(self.trained_models.values())[0]
        
        # Make predictions
        probabilities = model.predict_proba(X)[:, 1]
        
        # Log predictions if monitoring is enabled
        if self.performance_monitor:
            for i, prob in enumerate(probabilities):
                self.performance_monitor.log_prediction(
                    model_name or 'best_model',
                    X.iloc[i].to_dict(),
                    prob
                )
        
        return probabilities
    
    def save_pipeline(self, path: str):
        """Save the complete trained pipeline."""
        pipeline_data = {
            'feature_pipeline': self.feature_pipeline,
            'trained_models': self.trained_models,
            'best_model': self.best_model,
            'config': self.config,
            'feature_importance': self.feature_importance
        }
        
        joblib.dump(pipeline_data, path)
        self.logger.info(f"Pipeline saved to {path}")
    
    @classmethod
    def load_pipeline(cls, path: str) -> 'TrainingPipeline':
        """Load a previously trained pipeline."""
        pipeline_data = joblib.load(path)
        
        # Create new instance
        pipeline = cls()
        
        # Restore state
        pipeline.feature_pipeline = pipeline_data['feature_pipeline']
        pipeline.trained_models = pipeline_data['trained_models']
        pipeline.best_model = pipeline_data['best_model']
        pipeline.config = pipeline_data['config']
        pipeline.feature_importance = pipeline_data['feature_importance']
        
        return pipeline


def main():
    """Example usage of the training pipeline."""
    # This would typically be called with real data
    print("NBA Playoff Betting System - Training Pipeline")
    print("This is a template for the training pipeline.")
    print("To use this pipeline, provide your data in the required format:")
    print("- player_data: DataFrame with player statistics")
    print("- team_data: DataFrame with team statistics and win/loss outcomes")
    print("- game_data: DataFrame with game metadata")
    print("- historical_data: DataFrame with historical performance")
    print("- situational_data: DataFrame with situational factors")


if __name__ == "__main__":
    main()

