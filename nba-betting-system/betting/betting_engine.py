"""
Betting Engine - Main Orchestrator

Coordinates all components of the value betting system to identify,
assess, and execute betting opportunities in real-time.
"""

import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass

from .models import (
    ValueBet, ModelPrediction, BookmakerOdds, GameInfo,
    BetPosition, PortfolioState, PerformanceMetrics
)
from .value_detector import ValueBetDetector
from .kelly_criterion import KellyCriterion, KellyParameters
from .risk_manager import RiskManager, RiskLimits
from .portfolio_manager import PortfolioManager, PortfolioConfig


@dataclass
class BettingEngineConfig:
    """Configuration for the betting engine"""
    # Value detection parameters
    min_edge: float = 0.05
    min_confidence: float = 0.7
    max_odds: float = 3.0
    min_odds: float = 1.5
    
    # Kelly parameters
    max_kelly_fraction: float = 0.25
    fractional_kelly: float = 0.5
    
    # Risk management
    max_daily_risk: float = 0.1
    max_single_bet: float = 0.05
    
    # Portfolio management
    initial_bankroll: float = 10000.0
    max_positions: int = 20
    
    # Real-time parameters
    odds_staleness_minutes: int = 5
    min_time_to_game_hours: int = 2


class BettingEngine:
    """
    Main betting engine that orchestrates the entire value betting process.
    
    This class integrates all components:
    - Value bet detection
    - Kelly Criterion bet sizing
    - Risk management
    - Portfolio management
    """
    
    def __init__(self, config: BettingEngineConfig):
        """
        Initialize the betting engine with all components.
        
        Args:
            config: Betting engine configuration
        """
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Initialize components
        self.value_detector = ValueBetDetector(
            min_edge=config.min_edge,
            min_confidence=config.min_confidence,
            max_odds=config.max_odds,
            min_odds=config.min_odds
        )
        
        self.kelly_criterion = KellyCriterion(
            KellyParameters(
                max_kelly_fraction=config.max_kelly_fraction,
                fractional_kelly=config.fractional_kelly
            )
        )
        
        self.risk_manager = RiskManager(
            RiskLimits(
                max_daily_risk=config.max_daily_risk,
                max_single_bet=config.max_single_bet
            )
        )
        
        self.portfolio_manager = PortfolioManager(
            PortfolioConfig(
                initial_bankroll=config.initial_bankroll,
                max_positions=config.max_positions
            )
        )
        
        self.logger.info("Betting engine initialized successfully")
    
    def process_betting_opportunity(self,
                                  predictions: List[ModelPrediction],
                                  odds_data: List[BookmakerOdds],
                                  game_info: Dict[str, GameInfo]) -> List[BetPosition]:
        """
        Main method to process betting opportunities end-to-end.
        
        Args:
            predictions: Model predictions from feature engineering
            odds_data: Real-time odds from data collection
            game_info: Game information
            
        Returns:
            List of executed bet positions
        """
        self.logger.info(
            f"Processing {len(predictions)} predictions with {len(odds_data)} odds"
        )
        
        try:
            # Step 1: Detect value bets
            value_bets = self.value_detector.find_value_bets(
                predictions, odds_data, game_info
            )
            
            if not value_bets:
                self.logger.info("No value bets detected")
                return []
            
            # Step 2: Filter stale opportunities
            fresh_bets = self.value_detector.filter_stale_opportunities(
                value_bets, self.config.odds_staleness_minutes
            )
            
            # Step 3: Calculate Kelly fractions and stake amounts
            sized_bets = []
            portfolio_state = self.portfolio_manager.portfolio_state
            
            for bet in fresh_bets:
                kelly_fraction, stake_amount = self.kelly_criterion.optimize_bet_sizing(
                    bet, portfolio_state
                )
                
                # Update bet with sizing information
                bet.kelly_fraction = kelly_fraction
                bet.recommended_stake = stake_amount
                
                if stake_amount > 0:
                    sized_bets.append(bet)
            
            if not sized_bets:
                self.logger.info("No bets passed sizing criteria")
                return []
            
            # Step 4: Risk assessment
            approved_bets = []
            for bet in sized_bets:
                risk_metrics = self.risk_manager.assess_bet_risk(bet, portfolio_state)
                
                if risk_metrics.recommended_action == "bet":
                    approved_bets.append(bet)
                elif risk_metrics.recommended_action == "reduce_stake":
                    # Reduce stake by 50%
                    bet.recommended_stake *= 0.5
                    bet.kelly_fraction *= 0.5
                    approved_bets.append(bet)
                # Skip bets with "skip" recommendation
            
            if not approved_bets:
                self.logger.info("No bets passed risk assessment")
                return []
            
            # Step 5: Portfolio optimization
            optimized_bets = self.portfolio_manager.optimize_portfolio(approved_bets)
            
            # Step 6: Execute bets
            executed_positions = []
            for bet in optimized_bets:
                position_id = self.portfolio_manager.add_position(
                    bet, bet.recommended_stake
                )
                
                # Create position object for return
                position = BetPosition(
                    bet_id=position_id,
                    value_bet=bet,
                    stake_amount=bet.recommended_stake,
                    potential_payout=bet.recommended_stake * bet.bookmaker_odds.decimal_odds,
                    placed_at=datetime.now()
                )
                
                executed_positions.append(position)
                
                self.logger.info(
                    f"Executed bet: {bet.game_info.home_team} vs {bet.game_info.away_team} "
                    f"- ${bet.recommended_stake:.2f} @ {bet.bookmaker_odds.decimal_odds:.2f}"
                )
            
            self.logger.info(f"Executed {len(executed_positions)} bets")
            return executed_positions
            
        except Exception as e:
            self.logger.error(f"Error processing betting opportunities: {e}")
            return []
    
    def settle_bet(self, 
                   position_id: str, 
                   won: bool, 
                   actual_payout: float = 0.0) -> None:
        """
        Settle a completed bet.
        
        Args:
            position_id: ID of the position to settle
            won: Whether the bet won
            actual_payout: Actual payout received
        """
        from .models import BetOutcome
        
        outcome = BetOutcome.WIN if won else BetOutcome.LOSS
        self.portfolio_manager.settle_position(position_id, outcome, actual_payout)
        
        self.logger.info(f"Settled bet {position_id}: {'WON' if won else 'LOST'}")
    
    def get_portfolio_status(self) -> Dict:
        """
        Get comprehensive portfolio status.
        
        Returns:
            Dictionary with portfolio information
        """
        portfolio_state = self.portfolio_manager.portfolio_state
        performance = self.portfolio_manager.calculate_performance_metrics()
        diversification = self.portfolio_manager.get_position_diversification()
        
        # Check for risk limit violations
        violations = self.risk_manager.check_portfolio_limits(portfolio_state)
        
        return {
            'portfolio_state': {
                'total_bankroll': portfolio_state.total_bankroll,
                'available_balance': portfolio_state.available_balance,
                'total_exposure': portfolio_state.total_exposure,
                'active_positions': portfolio_state.position_count,
                'utilization_rate': portfolio_state.utilization_rate
            },
            'performance': {
                'total_bets': performance.total_bets,
                'win_rate': performance.win_rate,
                'roi': performance.roi,
                'net_profit': performance.net_profit,
                'sharpe_ratio': performance.sharpe_ratio,
                'max_drawdown': performance.max_drawdown
            },
            'diversification': diversification,
            'risk_violations': violations,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_real_time_opportunities(self,
                                  predictions: List[ModelPrediction],
                                  odds_data: List[BookmakerOdds],
                                  game_info: Dict[str, GameInfo]) -> List[Dict]:
        """
        Get real-time betting opportunities without executing them.
        
        Args:
            predictions: Model predictions
            odds_data: Current odds data
            game_info: Game information
            
        Returns:
            List of opportunity dictionaries
        """
        # Find value bets
        value_bets = self.value_detector.find_value_bets(
            predictions, odds_data, game_info
        )
        
        # Filter and assess each opportunity
        opportunities = []
        portfolio_state = self.portfolio_manager.portfolio_state
        
        for bet in value_bets:
            # Calculate sizing
            kelly_fraction, stake_amount = self.kelly_criterion.optimize_bet_sizing(
                bet, portfolio_state
            )
            
            # Assess risk
            risk_metrics = self.risk_manager.assess_bet_risk(bet, portfolio_state)
            
            opportunity = {
                'game': f"{bet.game_info.home_team} vs {bet.game_info.away_team}",
                'bet_type': bet.bet_type.value,
                'line': bet.line,
                'bookmaker': bet.bookmaker_odds.bookmaker,
                'odds': bet.bookmaker_odds.decimal_odds,
                'predicted_probability': bet.model_prediction.predicted_probability,
                'expected_value': bet.expected_value,
                'kelly_fraction': kelly_fraction,
                'recommended_stake': stake_amount,
                'confidence_score': bet.confidence_score,
                'risk_score': risk_metrics.overall_risk_score,
                'recommended_action': risk_metrics.recommended_action,
                'game_time': bet.game_info.game_time.isoformat(),
                'timestamp': bet.timestamp.isoformat()
            }
            
            opportunities.append(opportunity)
        
        # Sort by expected value
        opportunities.sort(key=lambda x: x['expected_value'], reverse=True)
        
        return opportunities
    
    def simulate_strategy(self,
                         historical_data: List[Tuple[List[ModelPrediction], 
                                                   List[BookmakerOdds], 
                                                   Dict[str, GameInfo]]],
                         num_simulations: int = 1000) -> Dict:
        """
        Simulate the betting strategy on historical data.
        
        Args:
            historical_data: List of (predictions, odds, game_info) tuples
            num_simulations: Number of Monte Carlo simulations
            
        Returns:
            Simulation results
        """
        self.logger.info(f"Running strategy simulation with {len(historical_data)} data points")
        
        # Reset portfolio for simulation
        original_config = self.config
        sim_portfolio = PortfolioManager(
            PortfolioConfig(initial_bankroll=original_config.initial_bankroll)
        )
        
        total_bets = 0
        total_profit = 0
        
        for predictions, odds_data, game_info in historical_data:
            # Process opportunities
            value_bets = self.value_detector.find_value_bets(
                predictions, odds_data, game_info
            )
            
            for bet in value_bets:
                kelly_fraction, stake_amount = self.kelly_criterion.optimize_bet_sizing(
                    bet, sim_portfolio.portfolio_state
                )
                
                if stake_amount > 0:
                    # Simulate bet outcome
                    import random
                    won = random.random() < bet.model_prediction.predicted_probability
                    
                    position_id = sim_portfolio.add_position(bet, stake_amount)
                    
                    if won:
                        payout = stake_amount * bet.bookmaker_odds.decimal_odds
                        sim_portfolio.settle_position(position_id, BetOutcome.WIN, payout)
                        total_profit += (payout - stake_amount)
                    else:
                        sim_portfolio.settle_position(position_id, BetOutcome.LOSS, 0)
                        total_profit -= stake_amount
                    
                    total_bets += 1
        
        # Calculate simulation metrics
        final_bankroll = sim_portfolio.portfolio_state.total_bankroll
        roi = (final_bankroll - original_config.initial_bankroll) / original_config.initial_bankroll * 100
        
        performance = sim_portfolio.calculate_performance_metrics()
        
        return {
            'total_bets': total_bets,
            'final_bankroll': final_bankroll,
            'total_profit': total_profit,
            'roi': roi,
            'win_rate': performance.win_rate,
            'sharpe_ratio': performance.sharpe_ratio,
            'max_drawdown': performance.max_drawdown
        }

