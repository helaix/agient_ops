"""
Feature Engineering Module for NBA Playoff Betting System

This module implements comprehensive feature extraction pipelines specifically
designed to capture playoff-specific dynamics and patterns in NBA basketball.
"""

import numpy as np
import pandas as pd
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.base import BaseEstimator, TransformerMixin


@dataclass
class FeatureConfig:
    """Configuration for feature engineering parameters."""
    lookback_games: int = 10
    playoff_weight_factor: float = 1.5
    home_court_advantage: float = 0.55
    rest_day_impact: float = 0.02
    injury_impact_threshold: float = 0.1
    chemistry_window: int = 20


class BaseFeatureExtractor(ABC):
    """Abstract base class for all feature extractors."""
    
    def __init__(self, config: FeatureConfig):
        self.config = config
        self.scaler = RobustScaler()
        self.feature_names = []
    
    @abstractmethod
    def extract_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Extract features from input data."""
        pass
    
    def fit_scaler(self, features: pd.DataFrame) -> None:
        """Fit the scaler on training features."""
        self.scaler.fit(features)
    
    def transform_features(self, features: pd.DataFrame) -> pd.DataFrame:
        """Apply scaling transformation to features."""
        scaled_features = self.scaler.transform(features)
        return pd.DataFrame(scaled_features, columns=features.columns, index=features.index)


class PlayerFeatureExtractor(BaseFeatureExtractor):
    """Extract player-level performance metrics and advanced analytics."""
    
    def extract_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Extract comprehensive player features including:
        - Basic stats (points, rebounds, assists, etc.)
        - Advanced metrics (PER, BPM, VORP, etc.)
        - Playoff-specific adjustments
        - Clutch performance indicators
        """
        features = {}
        
        # Basic performance metrics with playoff weighting
        features.update(self._extract_basic_stats(data))
        
        # Advanced analytics
        features.update(self._extract_advanced_metrics(data))
        
        # Playoff-specific features
        features.update(self._extract_playoff_features(data))
        
        # Clutch performance
        features.update(self._extract_clutch_metrics(data))
        
        # Player chemistry and role metrics
        features.update(self._extract_chemistry_metrics(data))
        
        return pd.DataFrame(features)
    
    def _extract_basic_stats(self, data: pd.DataFrame) -> Dict:
        """Extract basic player statistics with playoff adjustments."""
        stats = {}
        
        # Core stats with recency weighting
        weights = self._calculate_recency_weights(len(data))
        
        for stat in ['points', 'rebounds', 'assists', 'steals', 'blocks', 'turnovers']:
            if stat in data.columns:
                # Weighted average with playoff emphasis
                weighted_avg = np.average(data[stat], weights=weights)
                playoff_adjusted = weighted_avg * self.config.playoff_weight_factor
                
                stats[f'player_{stat}_avg'] = playoff_adjusted
                stats[f'player_{stat}_std'] = data[stat].std()
                stats[f'player_{stat}_trend'] = self._calculate_trend(data[stat])
        
        # Shooting efficiency
        if 'field_goals_made' in data.columns and 'field_goals_attempted' in data.columns:
            fg_pct = data['field_goals_made'] / data['field_goals_attempted'].replace(0, 1)
            stats['player_fg_pct'] = fg_pct.mean()
            stats['player_fg_pct_consistency'] = 1 / (fg_pct.std() + 0.01)
        
        return stats
    
    def _extract_advanced_metrics(self, data: pd.DataFrame) -> Dict:
        """Extract advanced analytics metrics."""
        metrics = {}
        
        # Player Efficiency Rating (PER) approximation
        if all(col in data.columns for col in ['points', 'rebounds', 'assists', 'minutes']):
            per_approx = (data['points'] + data['rebounds'] + data['assists']) / data['minutes'].replace(0, 1)
            metrics['player_per_approx'] = per_approx.mean()
        
        # Usage rate approximation
        if 'field_goals_attempted' in data.columns and 'minutes' in data.columns:
            usage_approx = data['field_goals_attempted'] / data['minutes'].replace(0, 1)
            metrics['player_usage_rate'] = usage_approx.mean()
        
        # Plus/minus impact
        if 'plus_minus' in data.columns:
            metrics['player_plus_minus_avg'] = data['plus_minus'].mean()
            metrics['player_plus_minus_consistency'] = 1 / (data['plus_minus'].std() + 0.01)
        
        return metrics
    
    def _extract_playoff_features(self, data: pd.DataFrame) -> Dict:
        """Extract playoff-specific performance indicators."""
        features = {}
        
        # Playoff experience factor
        if 'playoff_games_played' in data.columns:
            features['player_playoff_experience'] = data['playoff_games_played'].iloc[-1]
        
        # Performance under pressure (4th quarter/overtime stats)
        if 'fourth_quarter_points' in data.columns:
            features['player_clutch_scoring'] = data['fourth_quarter_points'].mean()
        
        # Playoff vs regular season performance differential
        if 'is_playoff' in data.columns:
            playoff_data = data[data['is_playoff'] == True]
            regular_data = data[data['is_playoff'] == False]
            
            if len(playoff_data) > 0 and len(regular_data) > 0:
                playoff_ppg = playoff_data['points'].mean()
                regular_ppg = regular_data['points'].mean()
                features['player_playoff_boost'] = (playoff_ppg - regular_ppg) / regular_ppg
        
        return features
    
    def _extract_clutch_metrics(self, data: pd.DataFrame) -> Dict:
        """Extract clutch performance indicators."""
        metrics = {}
        
        # Performance in close games (within 5 points in final 5 minutes)
        if 'game_margin' in data.columns and 'time_remaining' in data.columns:
            clutch_situations = data[
                (data['game_margin'].abs() <= 5) & 
                (data['time_remaining'] <= 300)
            ]
            
            if len(clutch_situations) > 0:
                metrics['player_clutch_fg_pct'] = (
                    clutch_situations['field_goals_made'].sum() / 
                    clutch_situations['field_goals_attempted'].sum()
                )
                metrics['player_clutch_points'] = clutch_situations['points'].mean()
        
        return metrics
    
    def _extract_chemistry_metrics(self, data: pd.DataFrame) -> Dict:
        """Extract team chemistry and role-based metrics."""
        metrics = {}
        
        # Assist-to-turnover ratio
        if 'assists' in data.columns and 'turnovers' in data.columns:
            ast_to_ratio = data['assists'] / data['turnovers'].replace(0, 1)
            metrics['player_ast_to_ratio'] = ast_to_ratio.mean()
        
        # Role consistency (starter vs bench performance)
        if 'is_starter' in data.columns:
            starter_games = data[data['is_starter'] == True]
            bench_games = data[data['is_starter'] == False]
            
            if len(starter_games) > 0 and len(bench_games) > 0:
                starter_efficiency = starter_games['points'].mean()
                bench_efficiency = bench_games['points'].mean()
                metrics['player_role_consistency'] = 1 - abs(starter_efficiency - bench_efficiency) / max(starter_efficiency, bench_efficiency)
        
        return metrics
    
    def _calculate_recency_weights(self, n_games: int) -> np.ndarray:
        """Calculate exponential decay weights for recent games."""
        weights = np.exp(-0.1 * np.arange(n_games)[::-1])
        return weights / weights.sum()
    
    def _calculate_trend(self, series: pd.Series) -> float:
        """Calculate trend direction using linear regression slope."""
        if len(series) < 2:
            return 0.0
        
        x = np.arange(len(series))
        slope = np.polyfit(x, series, 1)[0]
        return slope


class TeamFeatureExtractor(BaseFeatureExtractor):
    """Extract team-level dynamics and chemistry indicators."""
    
    def extract_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Extract comprehensive team features including:
        - Team performance metrics
        - Chemistry indicators
        - Coaching adjustments
        - Matchup-specific factors
        """
        features = {}
        
        # Team performance metrics
        features.update(self._extract_team_performance(data))
        
        # Chemistry and cohesion metrics
        features.update(self._extract_team_chemistry(data))
        
        # Coaching and strategy metrics
        features.update(self._extract_coaching_metrics(data))
        
        # Defensive metrics
        features.update(self._extract_defensive_metrics(data))
        
        return pd.DataFrame(features)
    
    def _extract_team_performance(self, data: pd.DataFrame) -> Dict:
        """Extract team-level performance indicators."""
        metrics = {}
        
        # Offensive efficiency
        if 'team_points' in data.columns and 'team_possessions' in data.columns:
            off_efficiency = data['team_points'] / data['team_possessions'].replace(0, 1)
            metrics['team_offensive_efficiency'] = off_efficiency.mean()
            metrics['team_offensive_consistency'] = 1 / (off_efficiency.std() + 0.01)
        
        # Pace of play
        if 'team_possessions' in data.columns and 'minutes_played' in data.columns:
            pace = data['team_possessions'] / (data['minutes_played'] / 48)
            metrics['team_pace'] = pace.mean()
        
        # Ball movement
        if 'team_assists' in data.columns and 'team_field_goals_made' in data.columns:
            ball_movement = data['team_assists'] / data['team_field_goals_made'].replace(0, 1)
            metrics['team_ball_movement'] = ball_movement.mean()
        
        return metrics
    
    def _extract_team_chemistry(self, data: pd.DataFrame) -> Dict:
        """Extract team chemistry and cohesion indicators."""
        metrics = {}
        
        # Assist distribution (how evenly assists are distributed)
        if 'player_assists' in data.columns:
            assist_distribution = data.groupby('game_id')['player_assists'].std().mean()
            metrics['team_assist_distribution'] = 1 / (assist_distribution + 0.01)
        
        # Bench contribution consistency
        if 'is_starter' in data.columns and 'points' in data.columns:
            bench_contribution = data[data['is_starter'] == False].groupby('game_id')['points'].sum()
            metrics['team_bench_contribution'] = bench_contribution.mean()
            metrics['team_bench_consistency'] = 1 / (bench_contribution.std() + 0.01)
        
        return metrics
    
    def _extract_coaching_metrics(self, data: pd.DataFrame) -> Dict:
        """Extract coaching and strategic adjustment metrics."""
        metrics = {}
        
        # Timeout usage effectiveness
        if 'timeouts_used' in data.columns and 'points_after_timeout' in data.columns:
            timeout_effectiveness = data['points_after_timeout'] / data['timeouts_used'].replace(0, 1)
            metrics['team_timeout_effectiveness'] = timeout_effectiveness.mean()
        
        # Rotation depth
        if 'minutes_played' in data.columns:
            rotation_depth = (data['minutes_played'] > 10).sum() / len(data.groupby('game_id'))
            metrics['team_rotation_depth'] = rotation_depth
        
        return metrics
    
    def _extract_defensive_metrics(self, data: pd.DataFrame) -> Dict:
        """Extract defensive performance indicators."""
        metrics = {}
        
        # Defensive efficiency
        if 'opponent_points' in data.columns and 'opponent_possessions' in data.columns:
            def_efficiency = data['opponent_points'] / data['opponent_possessions'].replace(0, 1)
            metrics['team_defensive_efficiency'] = def_efficiency.mean()
        
        # Defensive rebounding
        if 'defensive_rebounds' in data.columns and 'opponent_missed_shots' in data.columns:
            def_reb_pct = data['defensive_rebounds'] / data['opponent_missed_shots'].replace(0, 1)
            metrics['team_defensive_rebounding'] = def_reb_pct.mean()
        
        return metrics


class HistoricalFeatureExtractor(BaseFeatureExtractor):
    """Extract historical playoff performance patterns."""
    
    def extract_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Extract historical features including:
        - Head-to-head records
        - Playoff history
        - Performance trends
        - Momentum indicators
        """
        features = {}
        
        # Head-to-head history
        features.update(self._extract_h2h_features(data))
        
        # Playoff pedigree
        features.update(self._extract_playoff_pedigree(data))
        
        # Recent form and momentum
        features.update(self._extract_momentum_features(data))
        
        # Seasonal trends
        features.update(self._extract_seasonal_trends(data))
        
        return pd.DataFrame(features)
    
    def _extract_h2h_features(self, data: pd.DataFrame) -> Dict:
        """Extract head-to-head historical features."""
        features = {}
        
        # Recent head-to-head record
        if 'opponent_team_id' in data.columns and 'win' in data.columns:
            h2h_data = data[data['opponent_team_id'] == data['opponent_team_id'].iloc[-1]]
            if len(h2h_data) > 0:
                features['h2h_win_rate'] = h2h_data['win'].mean()
                features['h2h_games_played'] = len(h2h_data)
        
        return features
    
    def _extract_playoff_pedigree(self, data: pd.DataFrame) -> Dict:
        """Extract playoff experience and success metrics."""
        features = {}
        
        # Playoff appearances
        if 'playoff_appearances' in data.columns:
            features['team_playoff_appearances'] = data['playoff_appearances'].iloc[-1]
        
        # Championship experience
        if 'championships' in data.columns:
            features['team_championships'] = data['championships'].iloc[-1]
        
        return features
    
    def _extract_momentum_features(self, data: pd.DataFrame) -> Dict:
        """Extract momentum and recent form indicators."""
        features = {}
        
        # Recent win streak
        if 'win' in data.columns:
            recent_games = data.tail(self.config.lookback_games)
            win_streak = self._calculate_current_streak(recent_games['win'])
            features['team_current_streak'] = win_streak
            features['team_recent_form'] = recent_games['win'].mean()
        
        return features
    
    def _extract_seasonal_trends(self, data: pd.DataFrame) -> Dict:
        """Extract seasonal performance trends."""
        features = {}
        
        # Performance by month/period
        if 'game_date' in data.columns and 'win' in data.columns:
            data['month'] = pd.to_datetime(data['game_date']).dt.month
            monthly_performance = data.groupby('month')['win'].mean()
            
            # Playoff months (April-June typically)
            playoff_months = [4, 5, 6]
            playoff_performance = monthly_performance[monthly_performance.index.isin(playoff_months)]
            if len(playoff_performance) > 0:
                features['team_playoff_month_performance'] = playoff_performance.mean()
        
        return features
    
    def _calculate_current_streak(self, wins: pd.Series) -> int:
        """Calculate current win/loss streak."""
        if len(wins) == 0:
            return 0
        
        current_result = wins.iloc[-1]
        streak = 1
        
        for i in range(len(wins) - 2, -1, -1):
            if wins.iloc[i] == current_result:
                streak += 1
            else:
                break
        
        return streak if current_result else -streak


class SituationalFeatureExtractor(BaseFeatureExtractor):
    """Extract situational factors like home/away, rest days, injuries."""
    
    def extract_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Extract situational features including:
        - Home court advantage
        - Rest and travel factors
        - Injury impacts
        - Game context (elimination, etc.)
        """
        features = {}
        
        # Home court factors
        features.update(self._extract_home_court_features(data))
        
        # Rest and travel
        features.update(self._extract_rest_travel_features(data))
        
        # Injury and availability
        features.update(self._extract_injury_features(data))
        
        # Game context
        features.update(self._extract_game_context_features(data))
        
        return pd.DataFrame(features)
    
    def _extract_home_court_features(self, data: pd.DataFrame) -> Dict:
        """Extract home court advantage factors."""
        features = {}
        
        # Basic home/away indicator
        if 'is_home' in data.columns:
            features['is_home_game'] = data['is_home'].iloc[-1]
            
            # Home performance history
            home_games = data[data['is_home'] == True]
            away_games = data[data['is_home'] == False]
            
            if len(home_games) > 0 and len(away_games) > 0:
                home_win_rate = home_games['win'].mean() if 'win' in home_games.columns else 0
                away_win_rate = away_games['win'].mean() if 'win' in away_games.columns else 0
                features['home_court_advantage'] = home_win_rate - away_win_rate
        
        return features
    
    def _extract_rest_travel_features(self, data: pd.DataFrame) -> Dict:
        """Extract rest days and travel impact features."""
        features = {}
        
        # Days of rest
        if 'days_rest' in data.columns:
            current_rest = data['days_rest'].iloc[-1]
            features['days_rest'] = current_rest
            features['rest_advantage'] = min(current_rest * self.config.rest_day_impact, 0.1)
        
        # Travel distance
        if 'travel_distance' in data.columns:
            features['travel_distance'] = data['travel_distance'].iloc[-1]
            features['travel_fatigue'] = min(data['travel_distance'].iloc[-1] / 1000 * 0.01, 0.05)
        
        # Back-to-back games
        if 'is_back_to_back' in data.columns:
            features['is_back_to_back'] = data['is_back_to_back'].iloc[-1]
        
        return features
    
    def _extract_injury_features(self, data: pd.DataFrame) -> Dict:
        """Extract injury and player availability impacts."""
        features = {}
        
        # Key player availability
        if 'key_players_available' in data.columns:
            features['key_players_available'] = data['key_players_available'].iloc[-1]
        
        # Injury impact score
        if 'injury_impact_score' in data.columns:
            current_impact = data['injury_impact_score'].iloc[-1]
            features['injury_impact'] = current_impact
            features['injury_severity'] = 1 if current_impact > self.config.injury_impact_threshold else 0
        
        return features
    
    def _extract_game_context_features(self, data: pd.DataFrame) -> Dict:
        """Extract game context and pressure factors."""
        features = {}
        
        # Playoff round
        if 'playoff_round' in data.columns:
            features['playoff_round'] = data['playoff_round'].iloc[-1]
        
        # Elimination game
        if 'is_elimination' in data.columns:
            features['is_elimination_game'] = data['is_elimination'].iloc[-1]
        
        # Series status
        if 'series_wins' in data.columns and 'series_losses' in data.columns:
            series_wins = data['series_wins'].iloc[-1]
            series_losses = data['series_losses'].iloc[-1]
            features['series_lead'] = series_wins - series_losses
            features['series_pressure'] = 1 if abs(series_wins - series_losses) >= 2 else 0
        
        return features


class AdvancedAnalyticsExtractor(BaseFeatureExtractor):
    """Extract advanced statistical features (PER, BPM, VORP, etc.)."""
    
    def extract_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Extract advanced analytics including:
        - Efficiency metrics
        - Impact measurements
        - Advanced team stats
        - Synergy statistics
        """
        features = {}
        
        # Player efficiency metrics
        features.update(self._extract_efficiency_metrics(data))
        
        # Impact measurements
        features.update(self._extract_impact_metrics(data))
        
        # Advanced team statistics
        features.update(self._extract_advanced_team_stats(data))
        
        # Synergy and play-type analytics
        features.update(self._extract_synergy_stats(data))
        
        return pd.DataFrame(features)
    
    def _extract_efficiency_metrics(self, data: pd.DataFrame) -> Dict:
        """Extract player and team efficiency metrics."""
        metrics = {}
        
        # True Shooting Percentage
        if all(col in data.columns for col in ['points', 'field_goals_attempted', 'free_throws_attempted']):
            ts_attempts = data['field_goals_attempted'] + 0.44 * data['free_throws_attempted']
            ts_pct = data['points'] / (2 * ts_attempts.replace(0, 1))
            metrics['true_shooting_pct'] = ts_pct.mean()
        
        # Effective Field Goal Percentage
        if all(col in data.columns for col in ['field_goals_made', 'three_pointers_made', 'field_goals_attempted']):
            efg_pct = (data['field_goals_made'] + 0.5 * data['three_pointers_made']) / data['field_goals_attempted'].replace(0, 1)
            metrics['effective_fg_pct'] = efg_pct.mean()
        
        return metrics
    
    def _extract_impact_metrics(self, data: pd.DataFrame) -> Dict:
        """Extract player impact and value metrics."""
        metrics = {}
        
        # Box Plus/Minus approximation
        if 'plus_minus' in data.columns and 'minutes' in data.columns:
            bpm_approx = data['plus_minus'] / (data['minutes'] / 48).replace(0, 1)
            metrics['box_plus_minus_approx'] = bpm_approx.mean()
        
        # Win Shares approximation
        if all(col in data.columns for col in ['points', 'rebounds', 'assists', 'team_wins']):
            contribution = data['points'] + data['rebounds'] + data['assists']
            team_total = contribution.sum()
            win_share_approx = (contribution / team_total) * data['team_wins'].iloc[-1]
            metrics['win_shares_approx'] = win_share_approx.mean()
        
        return metrics
    
    def _extract_advanced_team_stats(self, data: pd.DataFrame) -> Dict:
        """Extract advanced team-level statistics."""
        metrics = {}
        
        # Four Factors
        # Effective FG%
        if 'team_efg_pct' in data.columns:
            metrics['team_four_factors_efg'] = data['team_efg_pct'].mean()
        
        # Turnover Rate
        if 'team_turnovers' in data.columns and 'team_possessions' in data.columns:
            to_rate = data['team_turnovers'] / data['team_possessions'].replace(0, 1)
            metrics['team_four_factors_to_rate'] = to_rate.mean()
        
        # Offensive Rebounding Rate
        if 'team_offensive_rebounds' in data.columns and 'team_missed_shots' in data.columns:
            oreb_rate = data['team_offensive_rebounds'] / data['team_missed_shots'].replace(0, 1)
            metrics['team_four_factors_oreb_rate'] = oreb_rate.mean()
        
        # Free Throw Rate
        if 'team_free_throws_attempted' in data.columns and 'team_field_goals_attempted' in data.columns:
            ft_rate = data['team_free_throws_attempted'] / data['team_field_goals_attempted'].replace(0, 1)
            metrics['team_four_factors_ft_rate'] = ft_rate.mean()
        
        return metrics
    
    def _extract_synergy_stats(self, data: pd.DataFrame) -> Dict:
        """Extract synergy and play-type analytics."""
        metrics = {}
        
        # Play type efficiency
        play_types = ['isolation', 'pick_and_roll', 'post_up', 'spot_up', 'transition']
        
        for play_type in play_types:
            ppp_col = f'{play_type}_ppp'  # Points per possession
            freq_col = f'{play_type}_frequency'
            
            if ppp_col in data.columns:
                metrics[f'{play_type}_efficiency'] = data[ppp_col].mean()
            
            if freq_col in data.columns:
                metrics[f'{play_type}_usage'] = data[freq_col].mean()
        
        return metrics


class FeaturePipeline:
    """Main pipeline for orchestrating all feature extraction."""
    
    def __init__(self, config: FeatureConfig = None):
        self.config = config or FeatureConfig()
        self.extractors = {
            'player': PlayerFeatureExtractor(self.config),
            'team': TeamFeatureExtractor(self.config),
            'historical': HistoricalFeatureExtractor(self.config),
            'situational': SituationalFeatureExtractor(self.config),
            'advanced': AdvancedAnalyticsExtractor(self.config)
        }
        self.feature_names = []
        self.is_fitted = False
    
    def fit_transform(self, data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Fit the pipeline and transform training data."""
        features = self._extract_all_features(data)
        
        # Fit scalers
        for extractor in self.extractors.values():
            if len(features) > 0:
                extractor.fit_scaler(features)
        
        self.feature_names = features.columns.tolist()
        self.is_fitted = True
        
        return features
    
    def transform(self, data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Transform new data using fitted pipeline."""
        if not self.is_fitted:
            raise ValueError("Pipeline must be fitted before transform")
        
        features = self._extract_all_features(data)
        
        # Apply scaling
        for extractor in self.extractors.values():
            if len(features) > 0:
                features = extractor.transform_features(features)
        
        return features
    
    def _extract_all_features(self, data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Extract features from all extractors."""
        all_features = []
        
        for extractor_name, extractor in self.extractors.items():
            if extractor_name in data:
                try:
                    features = extractor.extract_features(data[extractor_name])
                    if len(features) > 0:
                        all_features.append(features)
                except Exception as e:
                    print(f"Warning: Failed to extract {extractor_name} features: {e}")
        
        if all_features:
            combined_features = pd.concat(all_features, axis=1)
            # Handle any duplicate columns
            combined_features = combined_features.loc[:, ~combined_features.columns.duplicated()]
            return combined_features
        else:
            return pd.DataFrame()
    
    def get_feature_importance(self, model) -> Dict[str, float]:
        """Get feature importance from a trained model."""
        if hasattr(model, 'feature_importances_'):
            importance_dict = dict(zip(self.feature_names, model.feature_importances_))
            return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
        elif hasattr(model, 'coef_'):
            importance_dict = dict(zip(self.feature_names, abs(model.coef_[0])))
            return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
        else:
            return {}

