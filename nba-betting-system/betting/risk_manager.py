"""
Risk Management Framework

Comprehensive risk assessment and management system for betting operations.
Implements multiple risk controls and monitoring systems.
"""

import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

from .models import (
    ValueBet, BetPosition, PortfolioState, RiskMetrics,
    BetType, GameInfo
)


class RiskLevel(Enum):
    """Risk level classifications"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTREME = "extreme"


@dataclass
class RiskLimits:
    """Risk management limits and parameters"""
    max_daily_risk: float = 0.1          # 10% of bankroll per day
    max_single_bet: float = 0.05         # 5% of bankroll per bet
    max_game_exposure: float = 0.15      # 15% of bankroll per game
    max_team_exposure: float = 0.2       # 20% of bankroll per team
    max_correlation_exposure: float = 0.3 # 30% for correlated bets
    max_drawdown_threshold: float = 0.2   # 20% drawdown triggers review
    min_bankroll_threshold: float = 0.5   # 50% of starting bankroll
    max_consecutive_losses: int = 5       # Stop after 5 consecutive losses
    volatility_threshold: float = 0.3     # 30% volatility threshold


class RiskManager:
    """
    Comprehensive risk management system that monitors and controls
    betting exposure across multiple dimensions.
    """
    
    def __init__(self, risk_limits: Optional[RiskLimits] = None):
        """
        Initialize the risk manager.
        
        Args:
            risk_limits: Risk limits configuration
        """
        self.limits = risk_limits or RiskLimits()
        self.logger = logging.getLogger(__name__)
        self._risk_events = []  # Track risk events for analysis
    
    def assess_bet_risk(self,
                       value_bet: ValueBet,
                       portfolio: PortfolioState) -> RiskMetrics:
        """
        Comprehensive risk assessment for a potential bet.
        
        Args:
            value_bet: The bet to assess
            portfolio: Current portfolio state
            
        Returns:
            RiskMetrics with detailed risk analysis
        """
        # Calculate individual risk components
        kelly_risk = self._assess_kelly_risk(value_bet)
        correlation_risk = self._assess_correlation_risk(value_bet, portfolio)
        concentration_risk = self._assess_concentration_risk(value_bet, portfolio)
        liquidity_risk = self._assess_liquidity_risk(value_bet, portfolio)
        
        # Calculate overall risk score (weighted average)
        overall_risk = (
            kelly_risk * 0.3 +
            correlation_risk * 0.25 +
            concentration_risk * 0.25 +
            liquidity_risk * 0.2
        )
        
        # Determine recommended action
        recommended_action = self._determine_action(
            overall_risk, value_bet, portfolio
        )
        
        risk_metrics = RiskMetrics(
            kelly_fraction=value_bet.kelly_fraction,
            max_loss_probability=1 - value_bet.model_prediction.predicted_probability,
            correlation_risk=correlation_risk,
            concentration_risk=concentration_risk,
            overall_risk_score=overall_risk,
            recommended_action=recommended_action
        )
        
        self.logger.debug(
            f"Risk assessment for {value_bet.game_info.home_team} vs "
            f"{value_bet.game_info.away_team}: {overall_risk:.3f}"
        )
        
        return risk_metrics
    
    def check_portfolio_limits(self, portfolio: PortfolioState) -> List[str]:
        """
        Check if portfolio violates any risk limits.
        
        Args:
            portfolio: Current portfolio state
            
        Returns:
            List of limit violations
        """
        violations = []
        
        # Check daily risk limit
        daily_risk_ratio = portfolio.daily_risk_used / portfolio.total_bankroll
        if daily_risk_ratio > self.limits.max_daily_risk:
            violations.append(
                f"Daily risk limit exceeded: {daily_risk_ratio:.2%} > "
                f"{self.limits.max_daily_risk:.2%}"
            )
        
        # Check total exposure
        exposure_ratio = portfolio.total_exposure / portfolio.total_bankroll
        if exposure_ratio > self.limits.max_correlation_exposure:
            violations.append(
                f"Total exposure limit exceeded: {exposure_ratio:.2%} > "
                f"{self.limits.max_correlation_exposure:.2%}"
            )
        
        # Check concentration by game
        game_exposures = self._calculate_game_exposures(portfolio)
        for game_id, exposure in game_exposures.items():
            exposure_ratio = exposure / portfolio.total_bankroll
            if exposure_ratio > self.limits.max_game_exposure:
                violations.append(
                    f"Game exposure limit exceeded for {game_id}: "
                    f"{exposure_ratio:.2%} > {self.limits.max_game_exposure:.2%}"
                )
        
        # Check concentration by team
        team_exposures = self._calculate_team_exposures(portfolio)
        for team, exposure in team_exposures.items():
            exposure_ratio = exposure / portfolio.total_bankroll
            if exposure_ratio > self.limits.max_team_exposure:
                violations.append(
                    f"Team exposure limit exceeded for {team}: "
                    f"{exposure_ratio:.2%} > {self.limits.max_team_exposure:.2%}"
                )
        
        return violations
    
    def calculate_position_correlation(self,
                                     bet1: ValueBet,
                                     bet2: ValueBet) -> float:
        """
        Calculate correlation between two betting positions.
        
        Args:
            bet1: First bet
            bet2: Second bet
            
        Returns:
            Correlation coefficient (0-1, where 1 is perfectly correlated)
        """
        correlation = 0.0
        
        # Same game = high correlation
        if bet1.game_info.game_id == bet2.game_info.game_id:
            correlation += 0.8
        
        # Same teams = medium correlation
        elif (bet1.game_info.home_team in [bet2.game_info.home_team, bet2.game_info.away_team] or
              bet1.game_info.away_team in [bet2.game_info.home_team, bet2.game_info.away_team]):
            correlation += 0.4
        
        # Same bet type = low correlation
        if bet1.bet_type == bet2.bet_type:
            correlation += 0.2
        
        # Same playoff round = low correlation
        if (bet1.game_info.playoff_round and bet2.game_info.playoff_round and
            bet1.game_info.playoff_round == bet2.game_info.playoff_round):
            correlation += 0.1
        
        return min(correlation, 1.0)
    
    def monitor_drawdown(self,
                        portfolio: PortfolioState,
                        peak_bankroll: float) -> Tuple[float, RiskLevel]:
        """
        Monitor portfolio drawdown and assess risk level.
        
        Args:
            portfolio: Current portfolio state
            peak_bankroll: Historical peak bankroll
            
        Returns:
            Tuple of (drawdown_percentage, risk_level)
        """
        if peak_bankroll <= 0:
            return 0.0, RiskLevel.LOW
        
        drawdown = (peak_bankroll - portfolio.total_bankroll) / peak_bankroll
        
        # Classify risk level based on drawdown
        if drawdown < 0.05:
            risk_level = RiskLevel.LOW
        elif drawdown < 0.1:
            risk_level = RiskLevel.MEDIUM
        elif drawdown < self.limits.max_drawdown_threshold:
            risk_level = RiskLevel.HIGH
        else:
            risk_level = RiskLevel.EXTREME
        
        if drawdown > self.limits.max_drawdown_threshold:
            self.logger.warning(
                f"Drawdown threshold exceeded: {drawdown:.2%} > "
                f"{self.limits.max_drawdown_threshold:.2%}"
            )
        
        return drawdown, risk_level
    
    def _assess_kelly_risk(self, value_bet: ValueBet) -> float:
        """Assess risk based on Kelly fraction size"""
        kelly_fraction = value_bet.kelly_fraction
        
        if kelly_fraction <= 0.02:
            return 0.1  # Very low risk
        elif kelly_fraction <= 0.05:
            return 0.3  # Low risk
        elif kelly_fraction <= 0.1:
            return 0.6  # Medium risk
        else:
            return 0.9  # High risk
    
    def _assess_correlation_risk(self,
                               value_bet: ValueBet,
                               portfolio: PortfolioState) -> float:
        """Assess risk from correlated positions"""
        if not portfolio.active_positions:
            return 0.1  # Low risk with no existing positions
        
        max_correlation = 0.0
        total_correlated_exposure = 0.0
        
        for position in portfolio.active_positions:
            correlation = self.calculate_position_correlation(
                value_bet, position.value_bet
            )
            max_correlation = max(max_correlation, correlation)
            
            if correlation > 0.3:  # Significant correlation
                total_correlated_exposure += position.stake_amount
        
        # Risk increases with correlation and exposure
        correlation_risk = max_correlation * 0.7
        exposure_risk = min(
            total_correlated_exposure / portfolio.total_bankroll, 0.5
        ) * 0.3
        
        return correlation_risk + exposure_risk
    
    def _assess_concentration_risk(self,
                                 value_bet: ValueBet,
                                 portfolio: PortfolioState) -> float:
        """Assess concentration risk by game/team"""
        game_exposure = 0.0
        team_exposure = 0.0
        
        for position in portfolio.active_positions:
            # Same game exposure
            if position.value_bet.game_info.game_id == value_bet.game_info.game_id:
                game_exposure += position.stake_amount
            
            # Same team exposure
            if (position.value_bet.game_info.home_team in 
                [value_bet.game_info.home_team, value_bet.game_info.away_team] or
                position.value_bet.game_info.away_team in 
                [value_bet.game_info.home_team, value_bet.game_info.away_team]):
                team_exposure += position.stake_amount
        
        # Calculate risk ratios
        game_risk = min(game_exposure / portfolio.total_bankroll / self.limits.max_game_exposure, 1.0)
        team_risk = min(team_exposure / portfolio.total_bankroll / self.limits.max_team_exposure, 1.0)
        
        return max(game_risk, team_risk)
    
    def _assess_liquidity_risk(self,
                             value_bet: ValueBet,
                             portfolio: PortfolioState) -> float:
        """Assess liquidity and market risk"""
        # Higher odds = less liquid markets = higher risk
        odds_risk = min((value_bet.bookmaker_odds.decimal_odds - 1.5) / 3.0, 0.5)
        
        # Lower confidence = higher risk
        confidence_risk = 1.0 - value_bet.model_prediction.confidence
        
        # Available balance risk
        balance_risk = 0.0
        if portfolio.available_balance < portfolio.total_bankroll * 0.2:
            balance_risk = 0.3  # Low liquidity
        
        return (odds_risk + confidence_risk + balance_risk) / 3.0
    
    def _determine_action(self,
                        overall_risk: float,
                        value_bet: ValueBet,
                        portfolio: PortfolioState) -> str:
        """Determine recommended action based on risk assessment"""
        # Check hard limits first
        violations = self.check_portfolio_limits(portfolio)
        if violations:
            return "skip"
        
        # Risk-based recommendations
        if overall_risk < 0.3:
            return "bet"
        elif overall_risk < 0.6:
            return "reduce_stake"
        else:
            return "skip"
    
    def _calculate_game_exposures(self, portfolio: PortfolioState) -> Dict[str, float]:
        """Calculate total exposure by game"""
        exposures = {}
        for position in portfolio.active_positions:
            game_id = position.value_bet.game_info.game_id
            exposures[game_id] = exposures.get(game_id, 0) + position.stake_amount
        return exposures
    
    def _calculate_team_exposures(self, portfolio: PortfolioState) -> Dict[str, float]:
        """Calculate total exposure by team"""
        exposures = {}
        for position in portfolio.active_positions:
            home_team = position.value_bet.game_info.home_team
            away_team = position.value_bet.game_info.away_team
            
            exposures[home_team] = exposures.get(home_team, 0) + position.stake_amount
            exposures[away_team] = exposures.get(away_team, 0) + position.stake_amount
        
        return exposures

