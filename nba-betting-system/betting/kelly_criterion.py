"""
Kelly Criterion Implementation

Optimal bet sizing algorithm that maximizes long-term growth while
managing risk through mathematical optimization.
"""

import logging
import math
from typing import Optional, Tuple, List
from dataclasses import dataclass

from .models import ValueBet, PortfolioState


@dataclass
class KellyParameters:
    """Parameters for Kelly Criterion calculation"""
    max_kelly_fraction: float = 0.25  # Cap Kelly at 25% of bankroll
    min_kelly_fraction: float = 0.01  # Minimum bet size
    fractional_kelly: float = 0.5     # Use half-Kelly for safety
    correlation_adjustment: float = 1.0  # Adjustment for correlated bets


class KellyCriterion:
    """
    Implements the Kelly Criterion for optimal bet sizing.
    
    The Kelly Criterion determines the optimal fraction of bankroll to wager
    to maximize long-term growth while minimizing risk of ruin.
    
    Formula: f* = (bp - q) / b
    Where:
    - f* = fraction of bankroll to wager
    - b = odds received (decimal odds - 1)
    - p = probability of winning
    - q = probability of losing (1 - p)
    """
    
    def __init__(self, parameters: Optional[KellyParameters] = None):
        """
        Initialize Kelly Criterion calculator.
        
        Args:
            parameters: Kelly calculation parameters
        """
        self.params = parameters or KellyParameters()
        self.logger = logging.getLogger(__name__)
    
    def calculate_kelly_fraction(self,
                                win_probability: float,
                                decimal_odds: float) -> float:
        """
        Calculate the optimal Kelly fraction for a bet.
        
        Args:
            win_probability: Probability of winning the bet
            decimal_odds: Decimal odds for the bet
            
        Returns:
            Optimal fraction of bankroll to wager (0-1)
        """
        if win_probability <= 0 or win_probability >= 1:
            raise ValueError("Win probability must be between 0 and 1")
        
        if decimal_odds <= 1:
            raise ValueError("Decimal odds must be greater than 1")
        
        # Kelly formula: f* = (bp - q) / b
        b = decimal_odds - 1  # Net odds (profit per unit wagered)
        p = win_probability
        q = 1 - win_probability  # Probability of losing
        
        kelly_fraction = (b * p - q) / b
        
        # Apply safety constraints
        kelly_fraction = max(0, kelly_fraction)  # Never negative
        kelly_fraction = min(kelly_fraction, self.params.max_kelly_fraction)
        
        # Apply fractional Kelly for additional safety
        kelly_fraction *= self.params.fractional_kelly
        
        # Ensure minimum bet size if positive
        if kelly_fraction > 0:
            kelly_fraction = max(kelly_fraction, self.params.min_kelly_fraction)
        
        return kelly_fraction
    
    def calculate_stake_amount(self,
                             kelly_fraction: float,
                             bankroll: float,
                             correlation_adjustment: float = 1.0) -> float:
        """
        Calculate the actual stake amount based on Kelly fraction.
        
        Args:
            kelly_fraction: Kelly fraction (0-1)
            bankroll: Current bankroll
            correlation_adjustment: Adjustment for portfolio correlation
            
        Returns:
            Stake amount in currency units
        """
        if kelly_fraction <= 0:
            return 0.0
        
        # Apply correlation adjustment to reduce bet size for correlated positions
        adjusted_fraction = kelly_fraction * correlation_adjustment
        
        stake = bankroll * adjusted_fraction
        
        self.logger.debug(
            f"Kelly calculation: fraction={kelly_fraction:.4f}, "
            f"adjusted={adjusted_fraction:.4f}, stake=${stake:.2f}"
        )
        
        return stake
    
    def optimize_bet_sizing(self,
                          value_bet: ValueBet,
                          portfolio: PortfolioState) -> Tuple[float, float]:
        """
        Optimize bet sizing for a value bet considering portfolio state.
        
        Args:
            value_bet: The value bet to size
            portfolio: Current portfolio state
            
        Returns:
            Tuple of (kelly_fraction, recommended_stake)
        """
        # Calculate base Kelly fraction
        kelly_fraction = self.calculate_kelly_fraction(
            value_bet.model_prediction.predicted_probability,
            value_bet.bookmaker_odds.decimal_odds
        )
        
        # Calculate correlation adjustment based on existing positions
        correlation_adjustment = self._calculate_correlation_adjustment(
            value_bet, portfolio
        )
        
        # Calculate stake amount
        stake_amount = self.calculate_stake_amount(
            kelly_fraction,
            portfolio.available_balance,
            correlation_adjustment
        )
        
        # Apply portfolio-level constraints
        stake_amount = self._apply_portfolio_constraints(
            stake_amount, value_bet, portfolio
        )
        
        # Recalculate actual Kelly fraction based on final stake
        final_kelly_fraction = (
            stake_amount / portfolio.total_bankroll 
            if portfolio.total_bankroll > 0 else 0
        )
        
        return final_kelly_fraction, stake_amount
    
    def _calculate_correlation_adjustment(self,
                                        value_bet: ValueBet,
                                        portfolio: PortfolioState) -> float:
        """
        Calculate adjustment factor for correlated positions.
        
        Reduces bet size when similar bets are already in the portfolio
        to avoid over-concentration.
        """
        if not portfolio.active_positions:
            return 1.0
        
        correlation_penalty = 0.0
        
        for position in portfolio.active_positions:
            # Check for same game
            if (position.value_bet.game_info.game_id == 
                value_bet.game_info.game_id):
                correlation_penalty += 0.3  # 30% penalty for same game
            
            # Check for same teams
            elif (position.value_bet.game_info.home_team in 
                  [value_bet.game_info.home_team, value_bet.game_info.away_team] or
                  position.value_bet.game_info.away_team in 
                  [value_bet.game_info.home_team, value_bet.game_info.away_team]):
                correlation_penalty += 0.15  # 15% penalty for same teams
            
            # Check for same bet type
            if position.value_bet.bet_type == value_bet.bet_type:
                correlation_penalty += 0.1  # 10% penalty for same bet type
        
        # Cap total penalty at 80%
        correlation_penalty = min(correlation_penalty, 0.8)
        
        adjustment = 1.0 - correlation_penalty
        
        self.logger.debug(
            f"Correlation adjustment: {adjustment:.3f} "
            f"(penalty: {correlation_penalty:.3f})"
        )
        
        return adjustment
    
    def _apply_portfolio_constraints(self,
                                   stake_amount: float,
                                   value_bet: ValueBet,
                                   portfolio: PortfolioState) -> float:
        """
        Apply portfolio-level constraints to the stake amount.
        """
        # Don't exceed available balance
        stake_amount = min(stake_amount, portfolio.available_balance)
        
        # Don't exceed daily risk limit
        remaining_daily_risk = portfolio.max_daily_risk - portfolio.daily_risk_used
        if remaining_daily_risk <= 0:
            self.logger.warning("Daily risk limit reached")
            return 0.0
        
        stake_amount = min(stake_amount, remaining_daily_risk)
        
        # Don't exceed maximum single bet size (5% of total bankroll)
        max_single_bet = portfolio.total_bankroll * 0.05
        stake_amount = min(stake_amount, max_single_bet)
        
        # Minimum bet size check
        min_bet_amount = 10.0  # $10 minimum bet
        if stake_amount < min_bet_amount:
            if portfolio.available_balance >= min_bet_amount:
                stake_amount = min_bet_amount
            else:
                stake_amount = 0.0
        
        return stake_amount
    
    def calculate_growth_rate(self,
                            win_probability: float,
                            decimal_odds: float,
                            kelly_fraction: float) -> float:
        """
        Calculate expected growth rate using the Kelly fraction.
        
        Args:
            win_probability: Probability of winning
            decimal_odds: Decimal odds
            kelly_fraction: Kelly fraction being used
            
        Returns:
            Expected growth rate per bet
        """
        p = win_probability
        q = 1 - win_probability
        b = decimal_odds - 1
        f = kelly_fraction
        
        # Expected log growth rate
        if f <= 0:
            return 0.0
        
        # G = p * log(1 + bf) + q * log(1 - f)
        try:
            growth_rate = (
                p * math.log(1 + b * f) + 
                q * math.log(1 - f)
            )
            return growth_rate
        except ValueError:
            # Handle edge cases where log arguments become invalid
            return -float('inf')
    
    def simulate_outcomes(self,
                         value_bets: List[ValueBet],
                         portfolio: PortfolioState,
                         num_simulations: int = 1000) -> dict:
        """
        Simulate portfolio outcomes using Monte Carlo method.
        
        Args:
            value_bets: List of value bets to simulate
            portfolio: Current portfolio state
            num_simulations: Number of simulation runs
            
        Returns:
            Dictionary with simulation results
        """
        import random
        
        results = {
            'final_bankrolls': [],
            'max_drawdowns': [],
            'win_rates': []
        }
        
        for _ in range(num_simulations):
            bankroll = portfolio.total_bankroll
            max_bankroll = bankroll
            wins = 0
            total_bets = len(value_bets)
            
            for value_bet in value_bets:
                kelly_fraction, stake = self.optimize_bet_sizing(
                    value_bet, 
                    PortfolioState(
                        total_bankroll=bankroll,
                        available_balance=bankroll,
                        active_positions=[],
                        total_exposure=0,
                        daily_risk_used=0,
                        max_daily_risk=bankroll * 0.1
                    )
                )
                
                if stake <= 0:
                    continue
                
                # Simulate bet outcome
                if random.random() < value_bet.model_prediction.predicted_probability:
                    # Win
                    payout = stake * value_bet.bookmaker_odds.decimal_odds
                    bankroll += (payout - stake)
                    wins += 1
                else:
                    # Loss
                    bankroll -= stake
                
                max_bankroll = max(max_bankroll, bankroll)
                
                if bankroll <= 0:
                    break
            
            results['final_bankrolls'].append(bankroll)
            results['max_drawdowns'].append(
                (max_bankroll - min(bankroll, max_bankroll)) / max_bankroll
                if max_bankroll > 0 else 0
            )
            results['win_rates'].append(wins / total_bets if total_bets > 0 else 0)
        
        return {
            'mean_final_bankroll': sum(results['final_bankrolls']) / num_simulations,
            'median_final_bankroll': sorted(results['final_bankrolls'])[num_simulations // 2],
            'mean_max_drawdown': sum(results['max_drawdowns']) / num_simulations,
            'mean_win_rate': sum(results['win_rates']) / num_simulations,
            'ruin_probability': sum(1 for b in results['final_bankrolls'] if b <= 0) / num_simulations
        }

