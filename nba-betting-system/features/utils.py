"""
Utility classes and functions for NBA Playoff Betting System

This module provides supporting utilities for data validation,
feature storage, and model management.
"""

import numpy as np
import pandas as pd
import pickle
import json
import os
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import logging
from pathlib import Path
import sqlite3
from dataclasses import dataclass, asdict
import hashlib


@dataclass
class ValidationResult:
    """Result of data validation."""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    summary: Dict[str, Any]


class DataValidator:
    """Validates input data quality and consistency."""
    
    def __init__(self):
        self.required_columns = {
            'player_data': [
                'player_id', 'game_id', 'team_id', 'points', 'rebounds', 
                'assists', 'minutes', 'field_goals_made', 'field_goals_attempted'
            ],
            'team_data': [
                'team_id', 'game_id', 'team_points', 'opponent_points', 
                'team_possessions', 'win'
            ],
            'game_data': [
                'game_id', 'home_team_id', 'away_team_id', 'game_date',
                'is_playoff', 'playoff_round'
            ]
        }
        
        self.data_types = {
            'player_id': 'object',
            'team_id': 'object', 
            'game_id': 'object',
            'points': 'numeric',
            'rebounds': 'numeric',
            'assists': 'numeric',
            'minutes': 'numeric',
            'win': 'bool'
        }
    
    def validate_data(self, data: Dict[str, pd.DataFrame]) -> ValidationResult:
        """Validate all input data."""
        errors = []
        warnings = []
        summary = {}
        
        for data_type, df in data.items():
            result = self._validate_dataframe(df, data_type)
            errors.extend(result.errors)
            warnings.extend(result.warnings)
            summary[data_type] = result.summary
        
        # Cross-validation checks
        cross_validation_result = self._cross_validate_data(data)
        errors.extend(cross_validation_result.errors)
        warnings.extend(cross_validation_result.warnings)
        
        is_valid = len(errors) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            summary=summary
        )
    
    def _validate_dataframe(self, df: pd.DataFrame, data_type: str) -> ValidationResult:
        """Validate a single dataframe."""
        errors = []
        warnings = []
        summary = {
            'rows': len(df),
            'columns': len(df.columns),
            'missing_values': df.isnull().sum().sum(),
            'duplicate_rows': df.duplicated().sum()
        }
        
        # Check required columns
        if data_type in self.required_columns:
            required_cols = self.required_columns[data_type]
            missing_cols = set(required_cols) - set(df.columns)
            if missing_cols:
                errors.append(f"{data_type}: Missing required columns: {missing_cols}")
        
        # Check data types
        for col in df.columns:
            if col in self.data_types:
                expected_type = self.data_types[col]
                if expected_type == 'numeric' and not pd.api.types.is_numeric_dtype(df[col]):
                    errors.append(f"{data_type}: Column {col} should be numeric")
                elif expected_type == 'bool' and df[col].dtype != bool:
                    warnings.append(f"{data_type}: Column {col} should be boolean")
        
        # Check for outliers in numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
            if outliers > 0:
                outlier_pct = (outliers / len(df)) * 100
                if outlier_pct > 5:  # More than 5% outliers
                    warnings.append(f"{data_type}: Column {col} has {outlier_pct:.1f}% outliers")
        
        # Check for missing values
        missing_pct = (df.isnull().sum() / len(df)) * 100
        high_missing_cols = missing_pct[missing_pct > 10].index.tolist()
        if high_missing_cols:
            warnings.append(f"{data_type}: High missing values in columns: {high_missing_cols}")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            summary=summary
        )
    
    def _cross_validate_data(self, data: Dict[str, pd.DataFrame]) -> ValidationResult:
        """Perform cross-validation between different data sources."""
        errors = []
        warnings = []
        
        # Check if player data matches team data
        if 'player_data' in data and 'team_data' in data:
            player_games = set(data['player_data']['game_id'].unique())
            team_games = set(data['team_data']['game_id'].unique())
            
            missing_in_team = player_games - team_games
            missing_in_player = team_games - player_games
            
            if missing_in_team:
                warnings.append(f"Games in player data but not team data: {len(missing_in_team)}")
            if missing_in_player:
                warnings.append(f"Games in team data but not player data: {len(missing_in_player)}")
        
        # Check date consistency
        if 'game_data' in data:
            game_dates = pd.to_datetime(data['game_data']['game_date'])
            date_range = game_dates.max() - game_dates.min()
            
            if date_range.days > 365:  # More than a year
                warnings.append(f"Data spans {date_range.days} days - ensure this is intended")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            summary={}
        )


class FeatureStore:
    """Manages feature storage and retrieval for efficient model serving."""
    
    def __init__(self, storage_path: str = "feature_store.db"):
        self.storage_path = storage_path
        self.conn = None
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize SQLite database for feature storage."""
        self.conn = sqlite3.connect(self.storage_path)
        
        # Create tables
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS features (
                feature_id TEXT PRIMARY KEY,
                game_id TEXT,
                team_id TEXT,
                feature_type TEXT,
                feature_data TEXT,
                created_at TIMESTAMP,
                version TEXT
            )
        """)
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS feature_metadata (
                feature_type TEXT PRIMARY KEY,
                schema_version TEXT,
                last_updated TIMESTAMP,
                feature_names TEXT
            )
        """)
        
        self.conn.commit()
    
    def store_features(self, features: pd.DataFrame, feature_type: str, 
                      game_id: str, team_id: str, version: str = "1.0") -> None:
        """Store features in the feature store."""
        feature_id = self._generate_feature_id(game_id, team_id, feature_type)
        feature_data = features.to_json()
        
        self.conn.execute("""
            INSERT OR REPLACE INTO features 
            (feature_id, game_id, team_id, feature_type, feature_data, created_at, version)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (feature_id, game_id, team_id, feature_type, feature_data, 
              datetime.now(), version))
        
        # Update metadata
        feature_names = json.dumps(features.columns.tolist())
        self.conn.execute("""
            INSERT OR REPLACE INTO feature_metadata
            (feature_type, schema_version, last_updated, feature_names)
            VALUES (?, ?, ?, ?)
        """, (feature_type, version, datetime.now(), feature_names))
        
        self.conn.commit()
    
    def retrieve_features(self, game_id: str, team_id: str, 
                         feature_type: str) -> Optional[pd.DataFrame]:
        """Retrieve features from the feature store."""
        feature_id = self._generate_feature_id(game_id, team_id, feature_type)
        
        cursor = self.conn.execute("""
            SELECT feature_data FROM features 
            WHERE feature_id = ?
        """, (feature_id,))
        
        result = cursor.fetchone()
        if result:
            feature_data = json.loads(result[0])
            return pd.DataFrame(feature_data)
        
        return None
    
    def get_feature_metadata(self, feature_type: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a feature type."""
        cursor = self.conn.execute("""
            SELECT schema_version, last_updated, feature_names 
            FROM feature_metadata 
            WHERE feature_type = ?
        """, (feature_type,))
        
        result = cursor.fetchone()
        if result:
            return {
                'schema_version': result[0],
                'last_updated': result[1],
                'feature_names': json.loads(result[2])
            }
        
        return None
    
    def list_available_features(self, game_id: Optional[str] = None, 
                               team_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List available features with optional filtering."""
        query = "SELECT game_id, team_id, feature_type, created_at, version FROM features"
        params = []
        
        conditions = []
        if game_id:
            conditions.append("game_id = ?")
            params.append(game_id)
        if team_id:
            conditions.append("team_id = ?")
            params.append(team_id)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        cursor = self.conn.execute(query, params)
        results = cursor.fetchall()
        
        return [
            {
                'game_id': row[0],
                'team_id': row[1],
                'feature_type': row[2],
                'created_at': row[3],
                'version': row[4]
            }
            for row in results
        ]
    
    def _generate_feature_id(self, game_id: str, team_id: str, feature_type: str) -> str:
        """Generate unique feature ID."""
        combined = f"{game_id}_{team_id}_{feature_type}"
        return hashlib.md5(combined.encode()).hexdigest()
    
    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()


class ModelRegistry:
    """Manages model versioning, storage, and deployment."""
    
    def __init__(self, registry_path: str = "model_registry"):
        self.registry_path = Path(registry_path)
        self.registry_path.mkdir(exist_ok=True)
        self.metadata_file = self.registry_path / "registry.json"
        self.metadata = self._load_metadata()
    
    def _load_metadata(self) -> Dict[str, Any]:
        """Load registry metadata."""
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        return {'models': {}, 'deployments': {}}
    
    def _save_metadata(self):
        """Save registry metadata."""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2, default=str)
    
    def register_model(self, model: Any, model_name: str, version: str,
                      metadata: Optional[Dict[str, Any]] = None) -> str:
        """Register a new model version."""
        model_id = f"{model_name}_v{version}"
        model_path = self.registry_path / f"{model_id}.pkl"
        
        # Save model
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
        
        # Update metadata
        if model_name not in self.metadata['models']:
            self.metadata['models'][model_name] = {'versions': {}}
        
        self.metadata['models'][model_name]['versions'][version] = {
            'model_id': model_id,
            'file_path': str(model_path),
            'registered_at': datetime.now(),
            'metadata': metadata or {},
            'status': 'registered'
        }
        
        self._save_metadata()
        return model_id
    
    def load_model(self, model_name: str, version: Optional[str] = None) -> Any:
        """Load a model from the registry."""
        if model_name not in self.metadata['models']:
            raise ValueError(f"Model {model_name} not found in registry")
        
        versions = self.metadata['models'][model_name]['versions']
        
        if version is None:
            # Get latest version
            version = max(versions.keys(), key=lambda v: versions[v]['registered_at'])
        
        if version not in versions:
            raise ValueError(f"Version {version} not found for model {model_name}")
        
        model_info = versions[version]
        model_path = model_info['file_path']
        
        with open(model_path, 'rb') as f:
            return pickle.load(f)
    
    def deploy_model(self, model_name: str, version: str, 
                    deployment_name: str = "production") -> None:
        """Deploy a model version."""
        if model_name not in self.metadata['models']:
            raise ValueError(f"Model {model_name} not found")
        
        if version not in self.metadata['models'][model_name]['versions']:
            raise ValueError(f"Version {version} not found for model {model_name}")
        
        # Update deployment info
        self.metadata['deployments'][deployment_name] = {
            'model_name': model_name,
            'version': version,
            'deployed_at': datetime.now(),
            'status': 'active'
        }
        
        # Update model status
        self.metadata['models'][model_name]['versions'][version]['status'] = 'deployed'
        
        self._save_metadata()
    
    def get_deployed_model(self, deployment_name: str = "production") -> Any:
        """Get currently deployed model."""
        if deployment_name not in self.metadata['deployments']:
            raise ValueError(f"Deployment {deployment_name} not found")
        
        deployment_info = self.metadata['deployments'][deployment_name]
        return self.load_model(deployment_info['model_name'], deployment_info['version'])
    
    def list_models(self) -> List[Dict[str, Any]]:
        """List all registered models."""
        models = []
        for model_name, model_info in self.metadata['models'].items():
            for version, version_info in model_info['versions'].items():
                models.append({
                    'model_name': model_name,
                    'version': version,
                    'model_id': version_info['model_id'],
                    'registered_at': version_info['registered_at'],
                    'status': version_info['status'],
                    'metadata': version_info['metadata']
                })
        
        return sorted(models, key=lambda x: x['registered_at'], reverse=True)
    
    def get_model_info(self, model_name: str, version: Optional[str] = None) -> Dict[str, Any]:
        """Get detailed information about a model."""
        if model_name not in self.metadata['models']:
            raise ValueError(f"Model {model_name} not found")
        
        model_info = self.metadata['models'][model_name]
        
        if version is None:
            # Return info for all versions
            return model_info
        else:
            if version not in model_info['versions']:
                raise ValueError(f"Version {version} not found for model {model_name}")
            return model_info['versions'][version]


class PerformanceMonitor:
    """Monitors model performance in production."""
    
    def __init__(self, log_file: str = "performance.log"):
        self.log_file = log_file
        self.logger = self._setup_logger()
        self.metrics_history = []
    
    def _setup_logger(self) -> logging.Logger:
        """Setup performance logger."""
        logger = logging.getLogger('performance_monitor')
        logger.setLevel(logging.INFO)
        
        handler = logging.FileHandler(self.log_file)
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        
        logger.addHandler(handler)
        return logger
    
    def log_prediction(self, model_name: str, features: Dict[str, Any], 
                      prediction: float, actual: Optional[bool] = None,
                      metadata: Optional[Dict[str, Any]] = None) -> None:
        """Log a prediction for monitoring."""
        log_entry = {
            'timestamp': datetime.now(),
            'model_name': model_name,
            'prediction': prediction,
            'actual': actual,
            'features_hash': self._hash_features(features),
            'metadata': metadata or {}
        }
        
        self.metrics_history.append(log_entry)
        
        # Log to file
        self.logger.info(f"Prediction: {json.dumps(log_entry, default=str)}")
    
    def calculate_drift(self, recent_features: List[Dict[str, Any]], 
                       baseline_features: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate feature drift between recent and baseline data."""
        # Simple implementation - can be enhanced with statistical tests
        drift_scores = {}
        
        # Convert to DataFrames for easier analysis
        recent_df = pd.DataFrame(recent_features)
        baseline_df = pd.DataFrame(baseline_features)
        
        for column in recent_df.columns:
            if column in baseline_df.columns:
                if pd.api.types.is_numeric_dtype(recent_df[column]):
                    # Calculate statistical distance for numeric features
                    recent_mean = recent_df[column].mean()
                    baseline_mean = baseline_df[column].mean()
                    recent_std = recent_df[column].std()
                    baseline_std = baseline_df[column].std()
                    
                    # Normalized difference
                    mean_diff = abs(recent_mean - baseline_mean) / (baseline_std + 1e-8)
                    std_diff = abs(recent_std - baseline_std) / (baseline_std + 1e-8)
                    
                    drift_scores[column] = (mean_diff + std_diff) / 2
                else:
                    # For categorical features, use distribution comparison
                    recent_dist = recent_df[column].value_counts(normalize=True)
                    baseline_dist = baseline_df[column].value_counts(normalize=True)
                    
                    # Calculate Jensen-Shannon divergence approximation
                    all_categories = set(recent_dist.index) | set(baseline_dist.index)
                    js_div = 0
                    
                    for cat in all_categories:
                        p = recent_dist.get(cat, 0)
                        q = baseline_dist.get(cat, 0)
                        m = (p + q) / 2
                        
                        if p > 0 and m > 0:
                            js_div += p * np.log2(p / m)
                        if q > 0 and m > 0:
                            js_div += q * np.log2(q / m)
                    
                    drift_scores[column] = js_div / 2
        
        return drift_scores
    
    def get_performance_summary(self, days: int = 7) -> Dict[str, Any]:
        """Get performance summary for the last N days."""
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_metrics = [m for m in self.metrics_history if m['timestamp'] > cutoff_date]
        
        if not recent_metrics:
            return {'message': 'No recent data available'}
        
        # Calculate metrics for predictions with actual outcomes
        predictions_with_outcomes = [m for m in recent_metrics if m['actual'] is not None]
        
        if predictions_with_outcomes:
            predictions = [m['prediction'] for m in predictions_with_outcomes]
            actuals = [m['actual'] for m in predictions_with_outcomes]
            
            # Calculate Brier score
            brier_score = np.mean([(p - a)**2 for p, a in zip(predictions, actuals)])
            
            # Calculate calibration
            calibration_error = abs(np.mean(predictions) - np.mean(actuals))
            
            return {
                'total_predictions': len(recent_metrics),
                'predictions_with_outcomes': len(predictions_with_outcomes),
                'brier_score': brier_score,
                'calibration_error': calibration_error,
                'avg_prediction': np.mean(predictions),
                'actual_rate': np.mean(actuals)
            }
        else:
            return {
                'total_predictions': len(recent_metrics),
                'predictions_with_outcomes': 0,
                'message': 'No outcomes available for performance calculation'
            }
    
    def _hash_features(self, features: Dict[str, Any]) -> str:
        """Create hash of features for tracking."""
        feature_str = json.dumps(features, sort_keys=True, default=str)
        return hashlib.md5(feature_str.encode()).hexdigest()[:8]

