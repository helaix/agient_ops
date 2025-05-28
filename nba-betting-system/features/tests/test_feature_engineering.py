"""
Unit tests for feature engineering module.
"""

import pytest
import numpy as np
import pandas as pd
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from feature_engineering import (
    FeatureConfig, PlayerFeatureExtractor, TeamFeatureExtractor,
    HistoricalFeatureExtractor, SituationalFeatureExtractor,
    AdvancedAnalyticsExtractor, FeaturePipeline
)


@pytest.fixture
def sample_player_data():
    """Create sample player data for testing."""
    return pd.DataFrame({
        'player_id': ['p1', 'p2', 'p3'] * 10,
        'game_id': [f'g{i//3}' for i in range(30)],
        'team_id': ['team1', 'team2', 'team1'] * 10,
        'points': np.random.poisson(15, 30),
        'rebounds': np.random.poisson(6, 30),
        'assists': np.random.poisson(4, 30),
        'steals': np.random.poisson(1, 30),
        'blocks': np.random.poisson(1, 30),
        'turnovers': np.random.poisson(2, 30),
        'minutes': np.random.normal(25, 5, 30),
        'field_goals_made': np.random.poisson(6, 30),
        'field_goals_attempted': np.random.poisson(12, 30),
        'three_pointers_made': np.random.poisson(2, 30),
        'free_throws_made': np.random.poisson(3, 30),
        'free_throws_attempted': np.random.poisson(4, 30),
        'plus_minus': np.random.normal(0, 10, 30),
        'is_starter': np.random.choice([True, False], 30),
        'playoff_games_played': np.random.randint(1, 20, 30)
    })


@pytest.fixture
def sample_team_data():
    """Create sample team data for testing."""
    return pd.DataFrame({
        'game_id': [f'g{i}' for i in range(10)],
        'team_id': ['team1', 'team2'] * 5,
        'opponent_team_id': ['team2', 'team1'] * 5,
        'team_points': np.random.normal(110, 15, 10),
        'opponent_points': np.random.normal(108, 15, 10),
        'team_possessions': np.random.normal(100, 10, 10),
        'team_assists': np.random.poisson(25, 10),
        'team_field_goals_made': np.random.poisson(42, 10),
        'win': np.random.choice([True, False], 10),
        'is_home': np.random.choice([True, False], 10)
    })


@pytest.fixture
def feature_config():
    """Create test feature configuration."""
    return FeatureConfig(
        lookback_games=5,
        playoff_weight_factor=1.2,
        home_court_advantage=0.55
    )


class TestFeatureConfig:
    """Test FeatureConfig class."""
    
    def test_default_values(self):
        """Test default configuration values."""
        config = FeatureConfig()
        assert config.lookback_games == 10
        assert config.playoff_weight_factor == 1.5
        assert config.home_court_advantage == 0.55
        assert config.rest_day_impact == 0.02
        assert config.injury_impact_threshold == 0.1
        assert config.chemistry_window == 20


class TestPlayerFeatureExtractor:
    """Test PlayerFeatureExtractor class."""
    
    def test_initialization(self, feature_config):
        """Test extractor initialization."""
        extractor = PlayerFeatureExtractor(feature_config)
        assert extractor.config == feature_config
        assert extractor.scaler is not None
        assert extractor.feature_names == []
    
    def test_extract_basic_stats(self, feature_config, sample_player_data):
        """Test basic stats extraction."""
        extractor = PlayerFeatureExtractor(feature_config)
        stats = extractor._extract_basic_stats(sample_player_data)
        
        # Check that basic stats are extracted
        assert 'player_points_avg' in stats
        assert 'player_rebounds_avg' in stats
        assert 'player_assists_avg' in stats
        
        # Check that values are reasonable
        assert stats['player_points_avg'] > 0
        assert stats['player_rebounds_avg'] > 0
        assert stats['player_assists_avg'] > 0
    
    def test_extract_features(self, feature_config, sample_player_data):
        """Test complete feature extraction."""
        extractor = PlayerFeatureExtractor(feature_config)
        features = extractor.extract_features(sample_player_data)
        
        assert isinstance(features, pd.DataFrame)
        assert len(features) > 0
        assert len(features.columns) > 0
    
    def test_recency_weights(self, feature_config):
        """Test recency weight calculation."""
        extractor = PlayerFeatureExtractor(feature_config)
        weights = extractor._calculate_recency_weights(5)
        
        assert len(weights) == 5
        assert np.isclose(weights.sum(), 1.0)
        assert weights[-1] > weights[0]  # More recent games have higher weight
    
    def test_trend_calculation(self, feature_config):
        """Test trend calculation."""
        extractor = PlayerFeatureExtractor(feature_config)
        
        # Increasing trend
        increasing_series = pd.Series([1, 2, 3, 4, 5])
        trend = extractor._calculate_trend(increasing_series)
        assert trend > 0
        
        # Decreasing trend
        decreasing_series = pd.Series([5, 4, 3, 2, 1])
        trend = extractor._calculate_trend(decreasing_series)
        assert trend < 0
        
        # Flat trend
        flat_series = pd.Series([3, 3, 3, 3, 3])
        trend = extractor._calculate_trend(flat_series)
        assert abs(trend) < 0.1


class TestTeamFeatureExtractor:
    """Test TeamFeatureExtractor class."""
    
    def test_initialization(self, feature_config):
        """Test extractor initialization."""
        extractor = TeamFeatureExtractor(feature_config)
        assert extractor.config == feature_config
    
    def test_extract_team_performance(self, feature_config, sample_team_data):
        """Test team performance extraction."""
        extractor = TeamFeatureExtractor(feature_config)
        metrics = extractor._extract_team_performance(sample_team_data)
        
        # Should extract some metrics even with limited data
        assert isinstance(metrics, dict)
    
    def test_extract_features(self, feature_config, sample_team_data):
        """Test complete team feature extraction."""
        extractor = TeamFeatureExtractor(feature_config)
        features = extractor.extract_features(sample_team_data)
        
        assert isinstance(features, pd.DataFrame)


class TestHistoricalFeatureExtractor:
    """Test HistoricalFeatureExtractor class."""
    
    def test_initialization(self, feature_config):
        """Test extractor initialization."""
        extractor = HistoricalFeatureExtractor(feature_config)
        assert extractor.config == feature_config
    
    def test_current_streak_calculation(self, feature_config):
        """Test current streak calculation."""
        extractor = HistoricalFeatureExtractor(feature_config)
        
        # Win streak
        wins = pd.Series([True, True, True, False, True, True])
        streak = extractor._calculate_current_streak(wins)
        assert streak == 2
        
        # Loss streak
        losses = pd.Series([True, True, False, False, False])
        streak = extractor._calculate_current_streak(losses)
        assert streak == -3


class TestSituationalFeatureExtractor:
    """Test SituationalFeatureExtractor class."""
    
    def test_initialization(self, feature_config):
        """Test extractor initialization."""
        extractor = SituationalFeatureExtractor(feature_config)
        assert extractor.config == feature_config
    
    def test_home_court_features(self, feature_config):
        """Test home court feature extraction."""
        extractor = SituationalFeatureExtractor(feature_config)
        
        data = pd.DataFrame({
            'is_home': [True, False, True, False, True],
            'win': [True, False, True, True, False]
        })
        
        features = extractor._extract_home_court_features(data)
        assert 'is_home_game' in features
        assert features['is_home_game'] == True  # Last game is home


class TestAdvancedAnalyticsExtractor:
    """Test AdvancedAnalyticsExtractor class."""
    
    def test_initialization(self, feature_config):
        """Test extractor initialization."""
        extractor = AdvancedAnalyticsExtractor(feature_config)
        assert extractor.config == feature_config
    
    def test_efficiency_metrics(self, feature_config):
        """Test efficiency metrics calculation."""
        extractor = AdvancedAnalyticsExtractor(feature_config)
        
        data = pd.DataFrame({
            'points': [20, 15, 25],
            'field_goals_attempted': [15, 12, 18],
            'free_throws_attempted': [4, 2, 6],
            'field_goals_made': [8, 6, 10],
            'three_pointers_made': [2, 1, 3]
        })
        
        metrics = extractor._extract_efficiency_metrics(data)
        
        if 'true_shooting_pct' in metrics:
            assert 0 <= metrics['true_shooting_pct'] <= 1
        if 'effective_fg_pct' in metrics:
            assert 0 <= metrics['effective_fg_pct'] <= 1


class TestFeaturePipeline:
    """Test FeaturePipeline class."""
    
    def test_initialization(self, feature_config):
        """Test pipeline initialization."""
        pipeline = FeaturePipeline(feature_config)
        assert pipeline.config == feature_config
        assert len(pipeline.extractors) == 5
        assert not pipeline.is_fitted
    
    def test_fit_transform(self, feature_config, sample_player_data, sample_team_data):
        """Test pipeline fit and transform."""
        pipeline = FeaturePipeline(feature_config)
        
        data = {
            'player': sample_player_data,
            'team': sample_team_data
        }
        
        features = pipeline.fit_transform(data)
        
        assert isinstance(features, pd.DataFrame)
        assert pipeline.is_fitted
        assert len(pipeline.feature_names) > 0
    
    def test_transform_without_fit(self, feature_config, sample_player_data):
        """Test that transform fails without fit."""
        pipeline = FeaturePipeline(feature_config)
        
        data = {'player': sample_player_data}
        
        with pytest.raises(ValueError, match="Pipeline must be fitted"):
            pipeline.transform(data)
    
    def test_empty_data_handling(self, feature_config):
        """Test handling of empty data."""
        pipeline = FeaturePipeline(feature_config)
        
        # Empty data should return empty DataFrame
        features = pipeline._extract_all_features({})
        assert isinstance(features, pd.DataFrame)
        assert len(features) == 0


class TestIntegration:
    """Integration tests for feature engineering."""
    
    def test_end_to_end_feature_extraction(self, feature_config):
        """Test complete feature extraction workflow."""
        # Create comprehensive sample data
        player_data = pd.DataFrame({
            'player_id': ['p1', 'p2'] * 5,
            'game_id': [f'g{i//2}' for i in range(10)],
            'team_id': ['team1', 'team2'] * 5,
            'points': np.random.poisson(15, 10),
            'rebounds': np.random.poisson(6, 10),
            'assists': np.random.poisson(4, 10),
            'minutes': np.random.normal(25, 5, 10),
            'field_goals_made': np.random.poisson(6, 10),
            'field_goals_attempted': np.random.poisson(12, 10),
            'plus_minus': np.random.normal(0, 10, 10),
            'is_starter': [True] * 10,
            'playoff_games_played': [10] * 10
        })
        
        team_data = pd.DataFrame({
            'game_id': [f'g{i}' for i in range(5)],
            'team_id': ['team1'] * 5,
            'team_points': [110, 105, 115, 108, 112],
            'team_possessions': [100] * 5,
            'win': [True, False, True, True, False]
        })
        
        historical_data = pd.DataFrame({
            'team_id': ['team1'],
            'playoff_appearances': [10],
            'championships': [2]
        })
        
        situational_data = pd.DataFrame({
            'game_id': [f'g{i}' for i in range(5)],
            'team_id': ['team1'] * 5,
            'is_home': [True, False, True, False, True],
            'days_rest': [2, 1, 3, 2, 1]
        })
        
        data = {
            'player': player_data,
            'team': team_data,
            'historical': historical_data,
            'situational': situational_data
        }
        
        # Extract features
        pipeline = FeaturePipeline(feature_config)
        features = pipeline.fit_transform(data)
        
        # Verify results
        assert isinstance(features, pd.DataFrame)
        assert len(features) > 0
        assert len(features.columns) > 0
        
        # Test transform on new data
        new_features = pipeline.transform(data)
        assert new_features.shape[1] == features.shape[1]  # Same number of features


if __name__ == "__main__":
    pytest.main([__file__])

