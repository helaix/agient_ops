"""
Configuration module for NBA Playoff Betting System

This module provides configuration management for feature engineering
and model development components.
"""

import os
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from pathlib import Path
import json


@dataclass
class FeatureEngineeringConfig:
    """Configuration for feature engineering pipeline."""
    
    # Data processing parameters
    lookback_games: int = 10
    playoff_weight_factor: float = 1.5
    home_court_advantage: float = 0.55
    rest_day_impact: float = 0.02
    injury_impact_threshold: float = 0.1
    chemistry_window: int = 20
    
    # Feature selection parameters
    max_features: Optional[int] = None
    feature_selection_method: str = 'mutual_info'  # 'mutual_info', 'chi2', 'f_classif'
    correlation_threshold: float = 0.95
    
    # Scaling and preprocessing
    scaling_method: str = 'robust'  # 'standard', 'robust', 'minmax'
    handle_missing: str = 'median'  # 'mean', 'median', 'mode', 'drop'
    outlier_method: str = 'iqr'  # 'iqr', 'zscore', 'isolation_forest'
    
    # Advanced feature engineering
    create_interaction_features: bool = True
    polynomial_features: bool = False
    polynomial_degree: int = 2
    
    # Playoff-specific adjustments
    playoff_intensity_multiplier: float = 1.2
    elimination_game_weight: float = 1.5
    series_momentum_weight: float = 0.3


@dataclass
class ModelConfig:
    """Configuration for machine learning models."""
    
    # General model parameters
    random_state: int = 42
    cv_folds: int = 5
    test_size: float = 0.2
    validation_size: float = 0.2
    
    # Model selection
    models_to_train: List[str] = field(default_factory=lambda: [
        'logistic', 'random_forest', 'gradient_boosting', 
        'xgboost', 'lightgbm', 'ensemble'
    ])
    
    # Ensemble configuration
    ensemble_method: str = 'weighted'  # 'simple', 'weighted', 'stacking'
    ensemble_weights: Optional[Dict[str, float]] = None
    
    # Calibration settings
    calibration_method: str = 'isotonic'  # 'isotonic', 'sigmoid'
    calibration_cv: int = 3
    
    # Training parameters
    early_stopping_rounds: int = 50
    hyperparameter_tuning: bool = True
    hyperparameter_method: str = 'grid_search'  # 'grid_search', 'random_search', 'bayesian'
    max_evals: int = 100
    
    # Model-specific parameters
    logistic_params: Dict[str, Any] = field(default_factory=lambda: {
        'C': 1.0,
        'penalty': 'l2',
        'max_iter': 1000,
        'solver': 'liblinear'
    })
    
    random_forest_params: Dict[str, Any] = field(default_factory=lambda: {
        'n_estimators': 200,
        'max_depth': 10,
        'min_samples_split': 5,
        'min_samples_leaf': 2,
        'max_features': 'sqrt'
    })
    
    gradient_boosting_params: Dict[str, Any] = field(default_factory=lambda: {
        'n_estimators': 200,
        'learning_rate': 0.1,
        'max_depth': 6,
        'min_samples_split': 5,
        'min_samples_leaf': 2
    })
    
    xgboost_params: Dict[str, Any] = field(default_factory=lambda: {
        'n_estimators': 200,
        'learning_rate': 0.1,
        'max_depth': 6,
        'min_child_weight': 1,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'reg_alpha': 0,
        'reg_lambda': 1
    })
    
    lightgbm_params: Dict[str, Any] = field(default_factory=lambda: {
        'n_estimators': 200,
        'learning_rate': 0.1,
        'max_depth': 6,
        'min_child_samples': 5,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'reg_alpha': 0,
        'reg_lambda': 1
    })
    
    neural_network_params: Dict[str, Any] = field(default_factory=lambda: {
        'hidden_layer_sizes': (100, 50),
        'activation': 'relu',
        'solver': 'adam',
        'alpha': 0.001,
        'learning_rate': 'adaptive',
        'max_iter': 500
    })


@dataclass
class EvaluationConfig:
    """Configuration for model evaluation."""
    
    # Evaluation metrics
    primary_metric: str = 'brier_score'  # Primary metric for model selection
    metrics_to_calculate: List[str] = field(default_factory=lambda: [
        'brier_score', 'log_loss', 'auc', 'accuracy', 'precision', 'recall', 'f1'
    ])
    
    # Calibration evaluation
    calibration_bins: int = 10
    reliability_diagram: bool = True
    
    # Betting evaluation
    betting_threshold: float = 0.05  # Minimum edge required to place bet
    kelly_criterion: bool = True
    bankroll_management: bool = True
    
    # Cross-validation settings
    cv_method: str = 'stratified'  # 'stratified', 'time_series', 'group'
    cv_folds: int = 5
    cv_shuffle: bool = True
    
    # Performance monitoring
    drift_detection: bool = True
    drift_threshold: float = 0.1
    performance_window: int = 30  # Days


@dataclass
class DataConfig:
    """Configuration for data handling."""
    
    # Data sources
    data_sources: List[str] = field(default_factory=lambda: [
        'nba_api', 'basketball_reference', 'sports_radar'
    ])
    
    # Data storage
    storage_backend: str = 'sqlite'  # 'sqlite', 'postgresql', 'mongodb'
    storage_path: str = 'data/nba_betting.db'
    
    # Data quality
    min_games_required: int = 5
    max_missing_percentage: float = 0.1
    outlier_detection: bool = True
    
    # Feature store
    feature_store_enabled: bool = True
    feature_store_path: str = 'data/feature_store.db'
    feature_versioning: bool = True
    
    # Data refresh
    auto_refresh: bool = True
    refresh_interval_hours: int = 6
    
    # Playoff-specific data
    playoff_seasons: List[str] = field(default_factory=lambda: [
        '2018-19', '2019-20', '2020-21', '2021-22', '2022-23', '2023-24'
    ])
    
    include_regular_season: bool = True
    regular_season_weight: float = 0.7


@dataclass
class SystemConfig:
    """Overall system configuration."""
    
    # Environment
    environment: str = 'development'  # 'development', 'staging', 'production'
    debug: bool = True
    log_level: str = 'INFO'
    
    # Paths
    project_root: str = str(Path(__file__).parent.parent)
    data_dir: str = 'data'
    models_dir: str = 'models'
    logs_dir: str = 'logs'
    
    # Model registry
    model_registry_enabled: bool = True
    model_registry_path: str = 'models/registry'
    model_versioning: bool = True
    
    # Performance monitoring
    monitoring_enabled: bool = True
    monitoring_interval_minutes: int = 60
    alert_thresholds: Dict[str, float] = field(default_factory=lambda: {
        'brier_score': 0.3,
        'calibration_error': 0.1,
        'drift_score': 0.2
    })
    
    # API settings
    api_enabled: bool = False
    api_host: str = '0.0.0.0'
    api_port: int = 8000
    
    # Security
    api_key_required: bool = True
    rate_limiting: bool = True
    max_requests_per_minute: int = 100


class ConfigManager:
    """Manages configuration loading and validation."""
    
    def __init__(self, config_file: Optional[str] = None):
        self.config_file = config_file or os.getenv('NBA_BETTING_CONFIG', 'config.json')
        self.feature_config = FeatureEngineeringConfig()
        self.model_config = ModelConfig()
        self.evaluation_config = EvaluationConfig()
        self.data_config = DataConfig()
        self.system_config = SystemConfig()
        
        self._load_config()
        self._validate_config()
    
    def _load_config(self):
        """Load configuration from file if it exists."""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    config_data = json.load(f)
                
                # Update configurations with loaded data
                if 'feature_engineering' in config_data:
                    self._update_dataclass(self.feature_config, config_data['feature_engineering'])
                
                if 'model' in config_data:
                    self._update_dataclass(self.model_config, config_data['model'])
                
                if 'evaluation' in config_data:
                    self._update_dataclass(self.evaluation_config, config_data['evaluation'])
                
                if 'data' in config_data:
                    self._update_dataclass(self.data_config, config_data['data'])
                
                if 'system' in config_data:
                    self._update_dataclass(self.system_config, config_data['system'])
                
            except Exception as e:
                print(f"Warning: Failed to load config file {self.config_file}: {e}")
        
        # Override with environment variables
        self._load_from_environment()
    
    def _update_dataclass(self, dataclass_instance, update_dict):
        """Update dataclass instance with dictionary values."""
        for key, value in update_dict.items():
            if hasattr(dataclass_instance, key):
                setattr(dataclass_instance, key, value)
    
    def _load_from_environment(self):
        """Load configuration from environment variables."""
        env_mappings = {
            'NBA_RANDOM_STATE': ('model_config', 'random_state', int),
            'NBA_CV_FOLDS': ('model_config', 'cv_folds', int),
            'NBA_LOOKBACK_GAMES': ('feature_config', 'lookback_games', int),
            'NBA_PLAYOFF_WEIGHT': ('feature_config', 'playoff_weight_factor', float),
            'NBA_DEBUG': ('system_config', 'debug', lambda x: x.lower() == 'true'),
            'NBA_LOG_LEVEL': ('system_config', 'log_level', str),
            'NBA_ENVIRONMENT': ('system_config', 'environment', str),
        }
        
        for env_var, (config_name, attr_name, type_func) in env_mappings.items():
            if env_var in os.environ:
                config_obj = getattr(self, config_name)
                value = type_func(os.environ[env_var])
                setattr(config_obj, attr_name, value)
    
    def _validate_config(self):
        """Validate configuration values."""
        # Validate feature engineering config
        assert 0 < self.feature_config.lookback_games <= 82, "lookback_games must be between 1 and 82"
        assert 0 < self.feature_config.playoff_weight_factor <= 3.0, "playoff_weight_factor must be between 0 and 3"
        assert 0 <= self.feature_config.home_court_advantage <= 1.0, "home_court_advantage must be between 0 and 1"
        
        # Validate model config
        assert self.model_config.cv_folds >= 2, "cv_folds must be at least 2"
        assert 0 < self.model_config.test_size < 1.0, "test_size must be between 0 and 1"
        assert 0 < self.model_config.validation_size < 1.0, "validation_size must be between 0 and 1"
        
        # Validate evaluation config
        assert self.evaluation_config.calibration_bins >= 5, "calibration_bins must be at least 5"
        assert 0 <= self.evaluation_config.betting_threshold <= 0.5, "betting_threshold must be between 0 and 0.5"
        
        # Validate data config
        assert self.data_config.min_games_required >= 1, "min_games_required must be at least 1"
        assert 0 <= self.data_config.max_missing_percentage <= 1.0, "max_missing_percentage must be between 0 and 1"
    
    def save_config(self, file_path: Optional[str] = None):
        """Save current configuration to file."""
        file_path = file_path or self.config_file
        
        config_dict = {
            'feature_engineering': self._dataclass_to_dict(self.feature_config),
            'model': self._dataclass_to_dict(self.model_config),
            'evaluation': self._dataclass_to_dict(self.evaluation_config),
            'data': self._dataclass_to_dict(self.data_config),
            'system': self._dataclass_to_dict(self.system_config)
        }
        
        with open(file_path, 'w') as f:
            json.dump(config_dict, f, indent=2, default=str)
    
    def _dataclass_to_dict(self, dataclass_instance):
        """Convert dataclass to dictionary."""
        result = {}
        for field_name, field_value in dataclass_instance.__dict__.items():
            if isinstance(field_value, (dict, list, str, int, float, bool)) or field_value is None:
                result[field_name] = field_value
            else:
                result[field_name] = str(field_value)
        return result
    
    def get_config_summary(self) -> Dict[str, Any]:
        """Get a summary of current configuration."""
        return {
            'feature_engineering': {
                'lookback_games': self.feature_config.lookback_games,
                'playoff_weight_factor': self.feature_config.playoff_weight_factor,
                'scaling_method': self.feature_config.scaling_method
            },
            'model': {
                'models_to_train': self.model_config.models_to_train,
                'ensemble_method': self.model_config.ensemble_method,
                'calibration_method': self.model_config.calibration_method
            },
            'evaluation': {
                'primary_metric': self.evaluation_config.primary_metric,
                'betting_threshold': self.evaluation_config.betting_threshold
            },
            'system': {
                'environment': self.system_config.environment,
                'debug': self.system_config.debug
            }
        }


# Global configuration instance
config_manager = ConfigManager()

# Export individual configs for easy access
feature_config = config_manager.feature_config
model_config = config_manager.model_config
evaluation_config = config_manager.evaluation_config
data_config = config_manager.data_config
system_config = config_manager.system_config

