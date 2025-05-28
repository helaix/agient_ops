"""
Machine Learning Models Module for NBA Playoff Betting System

This module implements ensemble ML models with calibration specifically
designed for accurate probability prediction in betting applications.
"""

import numpy as np
import pandas as pd
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple, Union, Any
from dataclasses import dataclass
import joblib
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.metrics import brier_score_loss, log_loss, roc_auc_score
from sklearn.isotonic import IsotonicRegression
import xgboost as xgb
import lightgbm as lgb


@dataclass
class ModelConfig:
    """Configuration for model training and evaluation."""
    random_state: int = 42
    cv_folds: int = 5
    calibration_method: str = 'isotonic'  # 'isotonic' or 'sigmoid'
    ensemble_method: str = 'weighted'  # 'simple', 'weighted', 'stacking'
    validation_split: float = 0.2
    early_stopping_rounds: int = 50
    hyperparameter_tuning: bool = True


class BaseModel(ABC, BaseEstimator, ClassifierMixin):
    """Abstract base class for all prediction models."""
    
    def __init__(self, config: ModelConfig):
        self.config = config
        self.model = None
        self.is_fitted = False
        self.feature_importance_ = None
        self.calibrator = None
    
    @abstractmethod
    def _create_model(self) -> Any:
        """Create the underlying model instance."""
        pass
    
    def fit(self, X: pd.DataFrame, y: pd.Series, sample_weight: Optional[np.ndarray] = None) -> 'BaseModel':
        """Fit the model to training data."""
        self.model = self._create_model()
        
        # Fit the base model
        if sample_weight is not None:
            self.model.fit(X, y, sample_weight=sample_weight)
        else:
            self.model.fit(X, y)
        
        # Store feature importance if available
        if hasattr(self.model, 'feature_importances_'):
            self.feature_importance_ = self.model.feature_importances_
        elif hasattr(self.model, 'coef_'):
            self.feature_importance_ = np.abs(self.model.coef_[0])
        
        self.is_fitted = True
        return self
    
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Predict class probabilities."""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        probas = self.model.predict_proba(X)
        
        # Apply calibration if available
        if self.calibrator is not None:
            probas[:, 1] = self.calibrator.predict(probas[:, 1])
            probas[:, 0] = 1 - probas[:, 1]
        
        return probas
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Predict class labels."""
        probas = self.predict_proba(X)
        return (probas[:, 1] > 0.5).astype(int)
    
    def calibrate(self, X: pd.DataFrame, y: pd.Series) -> None:
        """Calibrate model probabilities using validation data."""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before calibration")
        
        # Get uncalibrated probabilities
        uncalibrated_probas = self.model.predict_proba(X)[:, 1]
        
        # Fit calibrator
        if self.config.calibration_method == 'isotonic':
            self.calibrator = IsotonicRegression(out_of_bounds='clip')
        else:  # sigmoid/Platt scaling
            self.calibrator = LogisticRegression()
        
        self.calibrator.fit(uncalibrated_probas.reshape(-1, 1), y)


class LogisticRegressionModel(BaseModel):
    """Logistic Regression model with regularization."""
    
    def _create_model(self) -> LogisticRegression:
        return LogisticRegression(
            random_state=self.config.random_state,
            max_iter=1000,
            C=1.0,
            penalty='l2'
        )


class RandomForestModel(BaseModel):
    """Random Forest model optimized for probability prediction."""
    
    def _create_model(self) -> RandomForestClassifier:
        return RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=self.config.random_state,
            n_jobs=-1
        )


class GradientBoostingModel(BaseModel):
    """Gradient Boosting model with early stopping."""
    
    def _create_model(self) -> GradientBoostingClassifier:
        return GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=6,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=self.config.random_state
        )


class XGBoostModel(BaseModel):
    """XGBoost model with advanced features."""
    
    def _create_model(self) -> xgb.XGBClassifier:
        return xgb.XGBClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=6,
            min_child_weight=1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=self.config.random_state,
            eval_metric='logloss'
        )
    
    def fit(self, X: pd.DataFrame, y: pd.Series, sample_weight: Optional[np.ndarray] = None) -> 'XGBoostModel':
        """Fit XGBoost with early stopping."""
        self.model = self._create_model()
        
        # Split for early stopping
        split_idx = int(len(X) * (1 - self.config.validation_split))
        X_train, X_val = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_val = y.iloc[:split_idx], y.iloc[split_idx:]
        
        # Fit with early stopping
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            early_stopping_rounds=self.config.early_stopping_rounds,
            verbose=False
        )
        
        self.feature_importance_ = self.model.feature_importances_
        self.is_fitted = True
        return self


class LightGBMModel(BaseModel):
    """LightGBM model for fast training."""
    
    def _create_model(self) -> lgb.LGBMClassifier:
        return lgb.LGBMClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=6,
            min_child_samples=5,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=self.config.random_state,
            verbose=-1
        )
    
    def fit(self, X: pd.DataFrame, y: pd.Series, sample_weight: Optional[np.ndarray] = None) -> 'LightGBMModel':
        """Fit LightGBM with early stopping."""
        self.model = self._create_model()
        
        # Split for early stopping
        split_idx = int(len(X) * (1 - self.config.validation_split))
        X_train, X_val = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_val = y.iloc[:split_idx], y.iloc[split_idx:]
        
        # Fit with early stopping
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            callbacks=[lgb.early_stopping(self.config.early_stopping_rounds)],
            eval_metric='binary_logloss'
        )
        
        self.feature_importance_ = self.model.feature_importances_
        self.is_fitted = True
        return self


class NeuralNetworkModel(BaseModel):
    """Neural Network model for complex pattern recognition."""
    
    def _create_model(self) -> MLPClassifier:
        return MLPClassifier(
            hidden_layer_sizes=(100, 50),
            activation='relu',
            solver='adam',
            alpha=0.001,
            learning_rate='adaptive',
            max_iter=500,
            random_state=self.config.random_state,
            early_stopping=True,
            validation_fraction=self.config.validation_split
        )


class EnsembleModel(BaseModel):
    """Ensemble model combining multiple base models."""
    
    def __init__(self, config: ModelConfig, base_models: Optional[List[BaseModel]] = None):
        super().__init__(config)
        self.base_models = base_models or self._create_default_models()
        self.weights = None
        self.meta_model = None
    
    def _create_default_models(self) -> List[BaseModel]:
        """Create default set of base models."""
        return [
            LogisticRegressionModel(self.config),
            RandomForestModel(self.config),
            GradientBoostingModel(self.config),
            XGBoostModel(self.config),
            LightGBMModel(self.config)
        ]
    
    def _create_model(self) -> None:
        """Not used for ensemble model."""
        pass
    
    def fit(self, X: pd.DataFrame, y: pd.Series, sample_weight: Optional[np.ndarray] = None) -> 'EnsembleModel':
        """Fit all base models and determine ensemble weights."""
        # Fit base models
        for model in self.base_models:
            model.fit(X, y, sample_weight)
        
        # Determine ensemble weights
        if self.config.ensemble_method == 'weighted':
            self._calculate_weights(X, y)
        elif self.config.ensemble_method == 'stacking':
            self._fit_meta_model(X, y)
        
        self.is_fitted = True
        return self
    
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Predict using ensemble of models."""
        if not self.is_fitted:
            raise ValueError("Ensemble must be fitted before prediction")
        
        # Get predictions from all base models
        predictions = np.array([model.predict_proba(X)[:, 1] for model in self.base_models]).T
        
        if self.config.ensemble_method == 'simple':
            # Simple average
            ensemble_proba = predictions.mean(axis=1)
        elif self.config.ensemble_method == 'weighted':
            # Weighted average
            ensemble_proba = np.average(predictions, weights=self.weights, axis=1)
        elif self.config.ensemble_method == 'stacking':
            # Meta-model prediction
            ensemble_proba = self.meta_model.predict_proba(predictions)[:, 1]
        else:
            ensemble_proba = predictions.mean(axis=1)
        
        # Convert to proper probability format
        result = np.column_stack([1 - ensemble_proba, ensemble_proba])
        return result
    
    def _calculate_weights(self, X: pd.DataFrame, y: pd.Series) -> None:
        """Calculate weights based on cross-validation performance."""
        weights = []
        
        for model in self.base_models:
            # Use cross-validation to estimate performance
            cv_scores = cross_val_score(
                model.model, X, y, 
                cv=StratifiedKFold(n_splits=self.config.cv_folds, shuffle=True, random_state=self.config.random_state),
                scoring='neg_brier_score'
            )
            # Convert to positive score (lower brier score is better)
            weight = -cv_scores.mean()
            weights.append(weight)
        
        # Normalize weights
        weights = np.array(weights)
        self.weights = weights / weights.sum()
    
    def _fit_meta_model(self, X: pd.DataFrame, y: pd.Series) -> None:
        """Fit meta-model for stacking ensemble."""
        # Generate out-of-fold predictions
        cv = StratifiedKFold(n_splits=self.config.cv_folds, shuffle=True, random_state=self.config.random_state)
        meta_features = np.zeros((len(X), len(self.base_models)))
        
        for fold, (train_idx, val_idx) in enumerate(cv.split(X, y)):
            X_fold_train, X_fold_val = X.iloc[train_idx], X.iloc[val_idx]
            y_fold_train = y.iloc[train_idx]
            
            for i, model in enumerate(self.base_models):
                # Create fresh model for this fold
                fold_model = model.__class__(self.config)
                fold_model.fit(X_fold_train, y_fold_train)
                meta_features[val_idx, i] = fold_model.predict_proba(X_fold_val)[:, 1]
        
        # Fit meta-model
        self.meta_model = LogisticRegression(random_state=self.config.random_state)
        self.meta_model.fit(meta_features, y)


class CalibrationPipeline:
    """Pipeline for model calibration and probability adjustment."""
    
    def __init__(self, config: ModelConfig):
        self.config = config
        self.calibrators = {}
        self.is_fitted = False
    
    def fit(self, models: Dict[str, BaseModel], X: pd.DataFrame, y: pd.Series) -> None:
        """Fit calibration for multiple models."""
        for name, model in models.items():
            if model.is_fitted:
                model.calibrate(X, y)
                self.calibrators[name] = model.calibrator
        
        self.is_fitted = True
    
    def transform(self, models: Dict[str, BaseModel], X: pd.DataFrame) -> Dict[str, np.ndarray]:
        """Apply calibration to model predictions."""
        if not self.is_fitted:
            raise ValueError("Calibration pipeline must be fitted first")
        
        calibrated_predictions = {}
        for name, model in models.items():
            if name in self.calibrators:
                probas = model.predict_proba(X)
                calibrated_predictions[name] = probas
            else:
                calibrated_predictions[name] = model.predict_proba(X)
        
        return calibrated_predictions


class ModelTrainer:
    """Orchestrates model training with hyperparameter optimization."""
    
    def __init__(self, config: ModelConfig):
        self.config = config
        self.trained_models = {}
        self.best_model = None
        self.training_history = {}
    
    def train_models(self, X: pd.DataFrame, y: pd.Series, 
                    model_types: Optional[List[str]] = None) -> Dict[str, BaseModel]:
        """Train multiple model types and return the best performers."""
        if model_types is None:
            model_types = ['logistic', 'random_forest', 'gradient_boosting', 'xgboost', 'lightgbm', 'ensemble']
        
        model_classes = {
            'logistic': LogisticRegressionModel,
            'random_forest': RandomForestModel,
            'gradient_boosting': GradientBoostingModel,
            'xgboost': XGBoostModel,
            'lightgbm': LightGBMModel,
            'neural_network': NeuralNetworkModel,
            'ensemble': EnsembleModel
        }
        
        for model_type in model_types:
            if model_type in model_classes:
                print(f"Training {model_type} model...")
                
                # Create and train model
                model = model_classes[model_type](self.config)
                model.fit(X, y)
                
                # Evaluate model
                scores = self._evaluate_model(model, X, y)
                
                self.trained_models[model_type] = model
                self.training_history[model_type] = scores
                
                print(f"{model_type} - Brier Score: {scores['brier_score']:.4f}, "
                      f"Log Loss: {scores['log_loss']:.4f}, AUC: {scores['auc']:.4f}")
        
        # Select best model based on Brier score (most important for betting)
        best_model_name = min(self.training_history.keys(), 
                             key=lambda x: self.training_history[x]['brier_score'])
        self.best_model = self.trained_models[best_model_name]
        
        print(f"Best model: {best_model_name}")
        return self.trained_models
    
    def _evaluate_model(self, model: BaseModel, X: pd.DataFrame, y: pd.Series) -> Dict[str, float]:
        """Evaluate model using cross-validation."""
        cv = StratifiedKFold(n_splits=self.config.cv_folds, shuffle=True, random_state=self.config.random_state)
        
        brier_scores = []
        log_losses = []
        auc_scores = []
        
        for train_idx, val_idx in cv.split(X, y):
            X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
            
            # Create fresh model for this fold
            fold_model = model.__class__(self.config)
            fold_model.fit(X_train, y_train)
            
            # Get predictions
            probas = fold_model.predict_proba(X_val)[:, 1]
            
            # Calculate metrics
            brier_scores.append(brier_score_loss(y_val, probas))
            log_losses.append(log_loss(y_val, probas))
            auc_scores.append(roc_auc_score(y_val, probas))
        
        return {
            'brier_score': np.mean(brier_scores),
            'log_loss': np.mean(log_losses),
            'auc': np.mean(auc_scores),
            'brier_std': np.std(brier_scores),
            'log_loss_std': np.std(log_losses),
            'auc_std': np.std(auc_scores)
        }


class ModelEvaluator:
    """Comprehensive model evaluation for betting applications."""
    
    def __init__(self):
        self.evaluation_results = {}
    
    def evaluate_calibration(self, y_true: np.ndarray, y_prob: np.ndarray, 
                           n_bins: int = 10) -> Dict[str, float]:
        """Evaluate model calibration using reliability diagrams."""
        bin_boundaries = np.linspace(0, 1, n_bins + 1)
        bin_lowers = bin_boundaries[:-1]
        bin_uppers = bin_boundaries[1:]
        
        calibration_error = 0
        reliability_data = []
        
        for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
            # Find predictions in this bin
            in_bin = (y_prob > bin_lower) & (y_prob <= bin_upper)
            prop_in_bin = in_bin.mean()
            
            if prop_in_bin > 0:
                accuracy_in_bin = y_true[in_bin].mean()
                avg_confidence_in_bin = y_prob[in_bin].mean()
                
                calibration_error += np.abs(avg_confidence_in_bin - accuracy_in_bin) * prop_in_bin
                
                reliability_data.append({
                    'bin_lower': bin_lower,
                    'bin_upper': bin_upper,
                    'accuracy': accuracy_in_bin,
                    'confidence': avg_confidence_in_bin,
                    'count': in_bin.sum()
                })
        
        return {
            'expected_calibration_error': calibration_error,
            'reliability_data': reliability_data,
            'brier_score': brier_score_loss(y_true, y_prob)
        }
    
    def evaluate_betting_performance(self, y_true: np.ndarray, y_prob: np.ndarray, 
                                   odds: np.ndarray, threshold: float = 0.05) -> Dict[str, float]:
        """Evaluate performance from a betting perspective."""
        # Calculate expected value for each bet
        implied_prob = 1 / odds
        edge = y_prob - implied_prob
        
        # Only bet when we have sufficient edge
        bet_mask = edge > threshold
        
        if bet_mask.sum() == 0:
            return {'total_bets': 0, 'roi': 0, 'profit': 0, 'win_rate': 0}
        
        # Calculate betting results
        bet_outcomes = y_true[bet_mask]
        bet_odds = odds[bet_mask]
        
        # Calculate profit/loss
        profits = np.where(bet_outcomes, bet_odds - 1, -1)
        total_profit = profits.sum()
        total_bets = len(profits)
        roi = (total_profit / total_bets) * 100
        
        return {
            'total_bets': total_bets,
            'win_rate': bet_outcomes.mean(),
            'roi': roi,
            'profit': total_profit,
            'avg_edge': edge[bet_mask].mean(),
            'kelly_fraction': self._calculate_kelly_fraction(y_prob[bet_mask], bet_odds)
        }
    
    def _calculate_kelly_fraction(self, probabilities: np.ndarray, odds: np.ndarray) -> float:
        """Calculate optimal Kelly betting fraction."""
        # Kelly formula: f = (bp - q) / b
        # where b = odds - 1, p = probability, q = 1 - p
        b = odds - 1
        p = probabilities
        q = 1 - p
        
        kelly_fractions = (b * p - q) / b
        # Only positive Kelly fractions (favorable bets)
        positive_kelly = kelly_fractions[kelly_fractions > 0]
        
        return positive_kelly.mean() if len(positive_kelly) > 0 else 0
    
    def generate_evaluation_report(self, models: Dict[str, BaseModel], 
                                 X_test: pd.DataFrame, y_test: pd.Series,
                                 odds_test: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """Generate comprehensive evaluation report."""
        report = {}
        
        for name, model in models.items():
            probas = model.predict_proba(X_test)[:, 1]
            
            # Basic metrics
            basic_metrics = {
                'brier_score': brier_score_loss(y_test, probas),
                'log_loss': log_loss(y_test, probas),
                'auc': roc_auc_score(y_test, probas)
            }
            
            # Calibration metrics
            calibration_metrics = self.evaluate_calibration(y_test.values, probas)
            
            # Betting metrics (if odds available)
            betting_metrics = {}
            if odds_test is not None:
                betting_metrics = self.evaluate_betting_performance(y_test.values, probas, odds_test)
            
            report[name] = {
                'basic_metrics': basic_metrics,
                'calibration_metrics': calibration_metrics,
                'betting_metrics': betting_metrics
            }
        
        return report

