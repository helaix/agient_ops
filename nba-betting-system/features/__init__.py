"""
NBA Playoff Betting System - Feature Engineering and Model Development

This module provides comprehensive feature engineering and machine learning
capabilities specifically designed for NBA playoff outcome prediction.
"""

__version__ = "1.0.0"
__author__ = "NBA Betting System Team"

from .feature_engineering import (
    PlayerFeatureExtractor,
    TeamFeatureExtractor,
    HistoricalFeatureExtractor,
    SituationalFeatureExtractor,
    AdvancedAnalyticsExtractor,
    FeaturePipeline
)

from .models import (
    BaseModel,
    EnsembleModel,
    CalibrationPipeline,
    ModelTrainer,
    ModelEvaluator
)

from .utils import (
    DataValidator,
    FeatureStore,
    ModelRegistry
)

__all__ = [
    # Feature Engineering
    'PlayerFeatureExtractor',
    'TeamFeatureExtractor', 
    'HistoricalFeatureExtractor',
    'SituationalFeatureExtractor',
    'AdvancedAnalyticsExtractor',
    'FeaturePipeline',
    
    # Models
    'BaseModel',
    'EnsembleModel',
    'CalibrationPipeline',
    'ModelTrainer',
    'ModelEvaluator',
    
    # Utils
    'DataValidator',
    'FeatureStore',
    'ModelRegistry'
]

