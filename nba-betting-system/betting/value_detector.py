"""
Value Bet Detection Algorithm

Identifies value betting opportunities by comparing model predictions 
with bookmaker odds to find positive expected value bets.
"""

import logging
from typing import List, Optional, Dict, Tuple
from datetime import datetime, timedelta

from .models import (
    ValueBet, BookmakerOdds, ModelPrediction, GameInfo, 
    BetType, RiskMetrics
)


class ValueBetDetector:
    """
    Detects value betting opportunities using expected value calculations
    and sophisticated probability analysis.
    """
    
    def __init__(self, 
                 min_edge: float = 0.05,
                 min_confidence: float = 0.7,
                 max_odds: float = 3.0,
                 min_odds: float = 1.5):
        """
        Initialize the value bet detector.
        
        Args:
            min_edge: Minimum edge required for a value bet (5% default)
            min_confidence: Minimum model confidence required
            max_odds: Maximum odds to consider (avoid long shots)
            min_odds: Minimum odds to consider (avoid heavy favorites)
        """
        self.min_edge = min_edge
        self.min_confidence = min_confidence
        self.max_odds = max_odds
        self.min_odds = min_odds
        self.logger = logging.getLogger(__name__)
    
    def calculate_expected_value(self, 
                               predicted_probability: float,
                               decimal_odds: float) -> float:
        """
        Calculate the expected value of a bet.
        
        EV = (probability * (odds - 1)) - (1 - probability)
        
        Args:
            predicted_probability: Model's predicted probability of winning
            decimal_odds: Bookmaker's decimal odds
            
        Returns:
            Expected value as a decimal (0.05 = 5% edge)
        """
        if predicted_probability <= 0 or predicted_probability >= 1:
            raise ValueError("Probability must be between 0 and 1")
        
        if decimal_odds <= 1:
            raise ValueError("Decimal odds must be greater than 1")
        
        # EV = (win_probability * profit) - (loss_probability * stake)
        # Normalized to stake of 1
        win_probability = predicted_probability
        loss_probability = 1 - predicted_probability
        profit_on_win = decimal_odds - 1
        
        expected_value = (win_probability * profit_on_win) - loss_probability
        
        return expected_value
    
    def calculate_edge(self, 
                      predicted_probability: float,
                      implied_probability: float) -> float:
        """
        Calculate the edge (difference between true and implied probability).
        
        Args:
            predicted_probability: Model's predicted probability
            implied_probability: Bookmaker's implied probability
            
        Returns:
            Edge as a decimal (0.05 = 5% edge)
        """
        return predicted_probability - implied_probability
    
    def assess_bet_quality(self, 
                          prediction: ModelPrediction,
                          odds: BookmakerOdds) -> Tuple[float, float, bool]:
        """
        Assess the quality of a potential bet.
        
        Args:
            prediction: Model prediction
            odds: Bookmaker odds
            
        Returns:
            Tuple of (expected_value, edge, is_value_bet)
        """
        expected_value = self.calculate_expected_value(
            prediction.predicted_probability,
            odds.decimal_odds
        )
        
        edge = self.calculate_edge(
            prediction.predicted_probability,
            odds.implied_probability
        )
        
        # Check if this qualifies as a value bet
        is_value_bet = (
            expected_value > self.min_edge and
            prediction.confidence >= self.min_confidence and
            self.min_odds <= odds.decimal_odds <= self.max_odds and
            edge > 0
        )
        
        return expected_value, edge, is_value_bet
    
    def find_value_bets(self,
                       predictions: List[ModelPrediction],
                       odds_data: List[BookmakerOdds],
                       game_info: Dict[str, GameInfo]) -> List[ValueBet]:
        """
        Find all value betting opportunities from predictions and odds.
        
        Args:
            predictions: List of model predictions
            odds_data: List of bookmaker odds
            game_info: Dictionary mapping game_id to GameInfo
            
        Returns:
            List of identified value bets, sorted by expected value
        """
        value_bets = []
        
        # Group odds by game_id and bet_type for efficient lookup
        odds_lookup = {}
        for odds in odds_data:
            # We need to match odds to predictions somehow
            # This assumes odds have game_id - may need adjustment based on actual data structure
            key = (getattr(odds, 'game_id', None), odds.bet_type, odds.line)
            if key[0] is not None:  # Only process if game_id exists
                if key not in odds_lookup:
                    odds_lookup[key] = []
                odds_lookup[key].append(odds)
        
        for prediction in predictions:
            # Find matching odds for this prediction
            key = (prediction.game_id, prediction.bet_type, prediction.line)
            
            if key not in odds_lookup:
                self.logger.debug(f"No odds found for prediction: {key}")
                continue
            
            game = game_info.get(prediction.game_id)
            if not game:
                self.logger.warning(f"No game info found for {prediction.game_id}")
                continue
            
            # Check each bookmaker's odds for this prediction
            for odds in odds_lookup[key]:
                try:
                    expected_value, edge, is_value_bet = self.assess_bet_quality(
                        prediction, odds
                    )
                    
                    if is_value_bet:
                        # Calculate confidence score based on multiple factors
                        confidence_score = self._calculate_confidence_score(
                            prediction, odds, expected_value, edge
                        )
                        
                        value_bet = ValueBet(
                            game_info=game,
                            bet_type=prediction.bet_type,
                            line=prediction.line,
                            bookmaker_odds=odds,
                            model_prediction=prediction,
                            expected_value=expected_value,
                            kelly_fraction=0.0,  # Will be calculated by Kelly Criterion
                            recommended_stake=0.0,  # Will be calculated by Kelly Criterion
                            confidence_score=confidence_score,
                            timestamp=datetime.now()
                        )
                        
                        value_bets.append(value_bet)
                        
                        self.logger.info(
                            f"Value bet found: {game.home_team} vs {game.away_team} "
                            f"{prediction.bet_type.value} - EV: {expected_value:.3f}, "
                            f"Edge: {edge:.3f}, Confidence: {confidence_score:.3f}"
                        )
                
                except Exception as e:
                    self.logger.error(f"Error assessing bet quality: {e}")
                    continue
        
        # Sort by expected value (highest first)
        value_bets.sort(key=lambda x: x.expected_value, reverse=True)
        
        self.logger.info(f"Found {len(value_bets)} value betting opportunities")
        return value_bets
    
    def _calculate_confidence_score(self,
                                  prediction: ModelPrediction,
                                  odds: BookmakerOdds,
                                  expected_value: float,
                                  edge: float) -> float:
        """
        Calculate a confidence score for the value bet.
        
        Combines multiple factors:
        - Model confidence
        - Expected value magnitude
        - Edge size
        - Odds reasonableness
        
        Returns:
            Confidence score between 0 and 1
        """
        # Base confidence from model
        model_confidence = prediction.confidence
        
        # Bonus for higher expected value (capped at 20% bonus)
        ev_bonus = min(expected_value * 2, 0.2)
        
        # Bonus for larger edge (capped at 15% bonus)
        edge_bonus = min(edge * 3, 0.15)
        
        # Penalty for extreme odds (prefer odds in reasonable range)
        odds_penalty = 0
        if odds.decimal_odds > 2.5 or odds.decimal_odds < 1.6:
            odds_penalty = 0.1
        
        # Combine factors
        confidence_score = model_confidence + ev_bonus + edge_bonus - odds_penalty
        
        # Ensure score is between 0 and 1
        return max(0, min(1, confidence_score))
    
    def filter_stale_opportunities(self,
                                 value_bets: List[ValueBet],
                                 max_age_minutes: int = 5) -> List[ValueBet]:
        """
        Filter out stale betting opportunities.
        
        Args:
            value_bets: List of value bets to filter
            max_age_minutes: Maximum age in minutes for odds data
            
        Returns:
            Filtered list of fresh value bets
        """
        cutoff_time = datetime.now() - timedelta(minutes=max_age_minutes)
        
        fresh_bets = [
            bet for bet in value_bets
            if bet.bookmaker_odds.timestamp > cutoff_time
        ]
        
        if len(fresh_bets) < len(value_bets):
            self.logger.info(
                f"Filtered out {len(value_bets) - len(fresh_bets)} stale opportunities"
            )
        
        return fresh_bets

