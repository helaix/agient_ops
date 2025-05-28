"""
Basic Usage Example for NBA Playoff Betting System

This example demonstrates how to use the feature engineering and model
development components with sample data.
"""

import numpy as np
import pandas as pd
import sys
from pathlib import Path

# Add parent directory to path to import our modules
sys.path.append(str(Path(__file__).parent.parent))

from feature_engineering import FeaturePipeline, FeatureConfig
from models import ModelTrainer, ModelConfig, EnsembleModel
from training_pipeline import TrainingPipeline
from utils import DataValidator


def generate_sample_data() -> dict:
    """Generate sample NBA playoff data for demonstration."""
    np.random.seed(42)
    
    # Sample player data
    n_games = 100
    n_players_per_game = 10
    
    player_data = []
    for game_id in range(n_games):
        for player_id in range(n_players_per_game):
            player_data.append({
                'game_id': f'game_{game_id}',
                'player_id': f'player_{player_id}',
                'team_id': f'team_{game_id % 8}',  # 8 playoff teams
                'points': np.random.poisson(15),
                'rebounds': np.random.poisson(6),
                'assists': np.random.poisson(4),
                'steals': np.random.poisson(1),
                'blocks': np.random.poisson(1),
                'turnovers': np.random.poisson(2),
                'minutes': np.random.normal(25, 8),
                'field_goals_made': np.random.poisson(6),
                'field_goals_attempted': np.random.poisson(12),
                'three_pointers_made': np.random.poisson(2),
                'free_throws_made': np.random.poisson(3),
                'free_throws_attempted': np.random.poisson(4),
                'plus_minus': np.random.normal(0, 10),
                'is_starter': np.random.choice([True, False], p=[0.5, 0.5]),
                'playoff_games_played': np.random.randint(1, 20),
                'fourth_quarter_points': np.random.poisson(4)
            })
    
    player_df = pd.DataFrame(player_data)
    
    # Sample team data
    team_data = []
    for game_id in range(n_games):
        home_team = f'team_{game_id % 8}'
        away_team = f'team_{(game_id + 1) % 8}'
        
        # Generate correlated team stats
        home_points = np.random.normal(110, 15)
        away_points = np.random.normal(108, 15)
        
        team_data.append({
            'game_id': f'game_{game_id}',
            'team_id': home_team,
            'opponent_team_id': away_team,
            'team_points': home_points,
            'opponent_points': away_points,
            'team_possessions': np.random.normal(100, 10),
            'team_assists': np.random.poisson(25),
            'team_field_goals_made': np.random.poisson(42),
            'team_offensive_rebounds': np.random.poisson(10),
            'defensive_rebounds': np.random.poisson(35),
            'team_turnovers': np.random.poisson(14),
            'win': home_points > away_points,
            'is_home': True,
            'is_playoff': True,
            'playoff_round': np.random.choice([1, 2, 3, 4]),
            'days_rest': np.random.choice([1, 2, 3, 4], p=[0.4, 0.3, 0.2, 0.1])
        })
    
    team_df = pd.DataFrame(team_data)
    
    # Sample game data
    game_data = []
    for game_id in range(n_games):
        game_data.append({
            'game_id': f'game_{game_id}',
            'home_team_id': f'team_{game_id % 8}',
            'away_team_id': f'team_{(game_id + 1) % 8}',
            'game_date': pd.Timestamp('2024-04-01') + pd.Timedelta(days=game_id // 4),
            'is_playoff': True,
            'playoff_round': np.random.choice([1, 2, 3, 4]),
            'series_wins': np.random.randint(0, 4),
            'series_losses': np.random.randint(0, 4),
            'is_elimination': np.random.choice([True, False], p=[0.2, 0.8])
        })
    
    game_df = pd.DataFrame(game_data)
    
    # Sample historical data
    historical_data = []
    for team_id in range(8):
        historical_data.append({
            'team_id': f'team_{team_id}',
            'playoff_appearances': np.random.randint(5, 20),
            'championships': np.random.randint(0, 5),
            'recent_form': np.random.uniform(0.4, 0.8)
        })
    
    historical_df = pd.DataFrame(historical_data)
    
    # Sample situational data
    situational_data = []
    for game_id in range(n_games):
        situational_data.append({
            'game_id': f'game_{game_id}',
            'team_id': f'team_{game_id % 8}',
            'is_home': True,
            'days_rest': np.random.choice([1, 2, 3, 4]),
            'travel_distance': np.random.uniform(0, 3000),
            'is_back_to_back': np.random.choice([True, False], p=[0.1, 0.9]),
            'key_players_available': np.random.randint(3, 5),
            'injury_impact_score': np.random.uniform(0, 0.3),
            'is_elimination': np.random.choice([True, False], p=[0.2, 0.8])
        })
    
    situational_df = pd.DataFrame(situational_data)
    
    return {
        'player_data': player_df,
        'team_data': team_df,
        'game_data': game_df,
        'historical_data': historical_df,
        'situational_data': situational_df
    }


def example_feature_engineering():
    """Demonstrate feature engineering capabilities."""
    print("=== Feature Engineering Example ===")
    
    # Generate sample data
    data = generate_sample_data()
    
    # Initialize feature pipeline
    config = FeatureConfig(
        lookback_games=5,
        playoff_weight_factor=1.3,
        home_court_advantage=0.6
    )
    
    feature_pipeline = FeaturePipeline(config)
    
    # Extract features
    print("Extracting features...")
    features = feature_pipeline.fit_transform(data)
    
    print(f"Generated {features.shape[1]} features for {features.shape[0]} samples")
    print(f"Feature names: {features.columns.tolist()[:10]}...")  # Show first 10
    
    return features, data


def example_model_training():
    """Demonstrate model training capabilities."""
    print("\n=== Model Training Example ===")
    
    # Get features and data
    features, data = example_feature_engineering()
    
    # Get target variable
    target = data['team_data']['win'].astype(int)
    
    # Align features and target
    common_index = features.index.intersection(target.index)
    X = features.loc[common_index]
    y = target.loc[common_index]
    
    print(f"Training data shape: {X.shape}")
    print(f"Target distribution: {y.value_counts().to_dict()}")
    
    # Initialize model trainer
    config = ModelConfig(
        random_state=42,
        cv_folds=3,  # Reduced for demo
        hyperparameter_tuning=False  # Disabled for speed
    )
    
    trainer = ModelTrainer(config)
    
    # Train models
    print("Training models...")
    models = trainer.train_models(X, y, ['logistic', 'random_forest', 'ensemble'])
    
    print(f"Trained {len(models)} models")
    print("Training metrics:")
    for model_name, metrics in trainer.training_history.items():
        print(f"  {model_name}: Brier Score = {metrics['brier_score']:.4f}")
    
    return models, X, y


def example_full_pipeline():
    """Demonstrate the complete training pipeline."""
    print("\n=== Full Pipeline Example ===")
    
    # Generate sample data
    data = generate_sample_data()
    
    # Initialize training pipeline
    pipeline = TrainingPipeline()
    
    # Run full pipeline
    print("Running full training pipeline...")
    try:
        report = pipeline.run_full_pipeline(data, target_column='win')
        
        print("Pipeline completed successfully!")
        print(f"Best model: {report['training_summary']['best_model']}")
        print(f"Feature count: {report['training_summary']['feature_count']}")
        
        # Show top features
        if report['top_features']:
            print("Top 5 features:")
            for i, (feature, importance) in enumerate(report['top_features'][:5]):
                print(f"  {i+1}. {feature}: {importance:.4f}")
        
        return pipeline, report
        
    except Exception as e:
        print(f"Pipeline failed: {e}")
        return None, None


def example_prediction():
    """Demonstrate making predictions with trained models."""
    print("\n=== Prediction Example ===")
    
    # Train pipeline
    pipeline, report = example_full_pipeline()
    
    if pipeline is None:
        print("Cannot demonstrate predictions - pipeline training failed")
        return
    
    # Generate new sample data for prediction
    new_data = generate_sample_data()
    
    # Make predictions
    print("Making predictions on new data...")
    try:
        probabilities = pipeline.predict(new_data)
        
        print(f"Generated {len(probabilities)} predictions")
        print(f"Average win probability: {probabilities.mean():.3f}")
        print(f"Prediction range: {probabilities.min():.3f} - {probabilities.max():.3f}")
        
        # Show some example predictions
        print("Sample predictions:")
        for i in range(min(5, len(probabilities))):
            print(f"  Game {i}: {probabilities[i]:.3f}")
        
    except Exception as e:
        print(f"Prediction failed: {e}")


def example_data_validation():
    """Demonstrate data validation capabilities."""
    print("\n=== Data Validation Example ===")
    
    # Generate sample data
    data = generate_sample_data()
    
    # Initialize validator
    validator = DataValidator()
    
    # Validate data
    print("Validating data...")
    result = validator.validate_data(data)
    
    print(f"Validation result: {'PASSED' if result.is_valid else 'FAILED'}")
    
    if result.errors:
        print("Errors found:")
        for error in result.errors:
            print(f"  - {error}")
    
    if result.warnings:
        print("Warnings:")
        for warning in result.warnings[:5]:  # Show first 5
            print(f"  - {warning}")
    
    print("Data summary:")
    for data_type, summary in result.summary.items():
        print(f"  {data_type}: {summary['rows']} rows, {summary['columns']} columns")


def main():
    """Run all examples."""
    print("NBA Playoff Betting System - Feature Engineering and Models")
    print("=" * 60)
    
    try:
        # Run individual examples
        example_data_validation()
        example_feature_engineering()
        example_model_training()
        example_full_pipeline()
        example_prediction()
        
        print("\n" + "=" * 60)
        print("All examples completed successfully!")
        print("\nNext steps:")
        print("1. Replace sample data with real NBA data")
        print("2. Tune hyperparameters for your specific use case")
        print("3. Implement real-time data ingestion")
        print("4. Set up model monitoring and retraining")
        
    except Exception as e:
        print(f"\nExample execution failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

