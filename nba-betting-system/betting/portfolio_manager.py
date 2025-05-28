"""
Portfolio Management System

Manages the betting portfolio, tracks positions, and optimizes
overall portfolio performance and diversification.
"""

import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field

from .models import (
    BetPosition, ValueBet, PortfolioState, PerformanceMetrics,
    BetOutcome, BetType
)


@dataclass
class PortfolioConfig:
    """Configuration for portfolio management"""
    initial_bankroll: float
    max_positions: int = 20
    rebalance_threshold: float = 0.1  # 10% change triggers rebalance
    performance_window_days: int = 30
    auto_compound: bool = True
    profit_withdrawal_threshold: float = 0.5  # Withdraw 50% of profits above threshold


class PortfolioManager:
    """
    Manages the betting portfolio including position tracking,
    performance monitoring, and portfolio optimization.
    """
    
    def __init__(self, config: PortfolioConfig):
        """
        Initialize the portfolio manager.
        
        Args:
            config: Portfolio configuration
        """
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Initialize portfolio state
        self._portfolio_state = PortfolioState(
            total_bankroll=config.initial_bankroll,
            available_balance=config.initial_bankroll,
            active_positions=[],
            total_exposure=0.0,
            daily_risk_used=0.0,
            max_daily_risk=config.initial_bankroll * 0.1
        )
        
        # Track historical data
        self._position_history: List[BetPosition] = []
        self._bankroll_history: List[Tuple[datetime, float]] = [
            (datetime.now(), config.initial_bankroll)
        ]
        self._daily_pnl: Dict[str, float] = {}
    
    @property
    def portfolio_state(self) -> PortfolioState:
        """Get current portfolio state"""
        return self._portfolio_state
    
    def add_position(self, value_bet: ValueBet, stake_amount: float) -> str:
        """
        Add a new betting position to the portfolio.
        
        Args:
            value_bet: The value bet
            stake_amount: Amount to stake
            
        Returns:
            Position ID
        """
        # Generate unique position ID
        position_id = f"bet_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(self._portfolio_state.active_positions)}"
        
        # Calculate potential payout
        potential_payout = stake_amount * value_bet.bookmaker_odds.decimal_odds
        
        # Create position
        position = BetPosition(
            bet_id=position_id,
            value_bet=value_bet,
            stake_amount=stake_amount,
            potential_payout=potential_payout,
            placed_at=datetime.now()
        )
        
        # Update portfolio state
        self._portfolio_state.active_positions.append(position)
        self._portfolio_state.available_balance -= stake_amount
        self._portfolio_state.total_exposure += stake_amount
        self._portfolio_state.daily_risk_used += stake_amount
        
        # Update daily risk tracking
        today = datetime.now().strftime('%Y-%m-%d')
        self._daily_pnl[today] = self._daily_pnl.get(today, 0) - stake_amount
        
        self.logger.info(
            f"Added position {position_id}: {value_bet.game_info.home_team} vs "
            f"{value_bet.game_info.away_team} - ${stake_amount:.2f}"
        )
        
        return position_id
    
    def settle_position(self, 
                       position_id: str, 
                       outcome: BetOutcome,
                       actual_payout: float = 0.0) -> None:
        """
        Settle a betting position.
        
        Args:
            position_id: ID of the position to settle
            outcome: Outcome of the bet
            actual_payout: Actual payout received (for wins)
        """
        # Find the position
        position = None
        for i, pos in enumerate(self._portfolio_state.active_positions):
            if pos.bet_id == position_id:
                position = self._portfolio_state.active_positions.pop(i)
                break
        
        if not position:
            self.logger.error(f"Position {position_id} not found")
            return
        
        # Update position with outcome
        position.outcome = outcome
        position.actual_payout = actual_payout
        position.settled_at = datetime.now()
        
        # Calculate P&L
        pnl = actual_payout - position.stake_amount
        
        # Update portfolio state
        self._portfolio_state.total_exposure -= position.stake_amount
        
        if outcome == BetOutcome.WIN:
            self._portfolio_state.available_balance += actual_payout
            self._portfolio_state.total_bankroll += pnl
        elif outcome == BetOutcome.PUSH:
            # Return stake
            self._portfolio_state.available_balance += position.stake_amount
        # For losses, money is already deducted from available balance
        
        # Update daily P&L tracking
        today = datetime.now().strftime('%Y-%m-%d')
        self._daily_pnl[today] = self._daily_pnl.get(today, 0) + pnl
        
        # Add to history
        self._position_history.append(position)
        self._bankroll_history.append((datetime.now(), self._portfolio_state.total_bankroll))
        
        self.logger.info(
            f"Settled position {position_id}: {outcome.value} - P&L: ${pnl:.2f}"
        )
        
        # Check if rebalancing is needed
        self._check_rebalancing()
    
    def calculate_performance_metrics(self, 
                                    days: Optional[int] = None) -> PerformanceMetrics:
        """
        Calculate comprehensive performance metrics.
        
        Args:
            days: Number of days to look back (None for all time)
            
        Returns:
            PerformanceMetrics object
        """
        # Filter positions by date if specified
        if days:
            cutoff_date = datetime.now() - timedelta(days=days)
            positions = [
                pos for pos in self._position_history
                if pos.settled_at and pos.settled_at >= cutoff_date
            ]
        else:
            positions = self._position_history
        
        if not positions:
            return PerformanceMetrics(
                total_bets=0, winning_bets=0, losing_bets=0,
                total_staked=0, total_returned=0, net_profit=0,
                roi=0, win_rate=0, average_odds=0
            )
        
        # Calculate basic metrics
        total_bets = len(positions)
        winning_bets = sum(1 for pos in positions if pos.outcome == BetOutcome.WIN)
        losing_bets = sum(1 for pos in positions if pos.outcome == BetOutcome.LOSS)
        
        total_staked = sum(pos.stake_amount for pos in positions)
        total_returned = sum(pos.actual_payout for pos in positions)
        net_profit = total_returned - total_staked
        
        roi = (net_profit / total_staked * 100) if total_staked > 0 else 0
        win_rate = (winning_bets / total_bets * 100) if total_bets > 0 else 0
        
        # Calculate average odds
        total_odds = sum(pos.value_bet.bookmaker_odds.decimal_odds for pos in positions)
        average_odds = total_odds / total_bets if total_bets > 0 else 0
        
        # Calculate Sharpe ratio
        sharpe_ratio = self._calculate_sharpe_ratio(positions)
        
        # Calculate maximum drawdown
        max_drawdown = self._calculate_max_drawdown()
        
        return PerformanceMetrics(
            total_bets=total_bets,
            winning_bets=winning_bets,
            losing_bets=losing_bets,
            total_staked=total_staked,
            total_returned=total_returned,
            net_profit=net_profit,
            roi=roi,
            win_rate=win_rate,
            average_odds=average_odds,
            sharpe_ratio=sharpe_ratio,
            max_drawdown=max_drawdown
        )
    
    def get_position_diversification(self) -> Dict[str, int]:
        """
        Analyze portfolio diversification across different dimensions.
        
        Returns:
            Dictionary with diversification metrics
        """
        if not self._portfolio_state.active_positions:
            return {}
        
        diversification = {
            'total_positions': len(self._portfolio_state.active_positions),
            'unique_games': len(set(
                pos.value_bet.game_info.game_id 
                for pos in self._portfolio_state.active_positions
            )),
            'unique_teams': len(set(
                team for pos in self._portfolio_state.active_positions
                for team in [pos.value_bet.game_info.home_team, pos.value_bet.game_info.away_team]
            )),
            'bet_types': {}
        }
        
        # Count bet types
        for pos in self._portfolio_state.active_positions:
            bet_type = pos.value_bet.bet_type.value
            diversification['bet_types'][bet_type] = diversification['bet_types'].get(bet_type, 0) + 1
        
        return diversification
    
    def optimize_portfolio(self, available_bets: List[ValueBet]) -> List[ValueBet]:
        """
        Optimize portfolio by selecting the best combination of bets
        considering correlation and diversification.
        
        Args:
            available_bets: List of available value bets
            
        Returns:
            Optimized list of bets to place
        """
        if not available_bets:
            return []
        
        # Sort bets by expected value
        sorted_bets = sorted(available_bets, key=lambda x: x.expected_value, reverse=True)
        
        # Apply portfolio optimization logic
        optimized_bets = []
        current_exposure = self._portfolio_state.total_exposure
        max_total_exposure = self._portfolio_state.total_bankroll * 0.3  # 30% max exposure
        
        # Track exposure by game and team
        game_exposure = {}
        team_exposure = {}
        
        # Initialize with existing positions
        for pos in self._portfolio_state.active_positions:
            game_id = pos.value_bet.game_info.game_id
            game_exposure[game_id] = game_exposure.get(game_id, 0) + pos.stake_amount
            
            for team in [pos.value_bet.game_info.home_team, pos.value_bet.game_info.away_team]:
                team_exposure[team] = team_exposure.get(team, 0) + pos.stake_amount
        
        for bet in sorted_bets:
            # Check if we can add this bet without violating limits
            if current_exposure + bet.recommended_stake > max_total_exposure:
                continue
            
            # Check game concentration
            game_id = bet.game_info.game_id
            if game_exposure.get(game_id, 0) + bet.recommended_stake > self._portfolio_state.total_bankroll * 0.15:
                continue
            
            # Check team concentration
            max_team_exposure = max(
                team_exposure.get(bet.game_info.home_team, 0),
                team_exposure.get(bet.game_info.away_team, 0)
            )
            if max_team_exposure + bet.recommended_stake > self._portfolio_state.total_bankroll * 0.2:
                continue
            
            # Add bet to optimized portfolio
            optimized_bets.append(bet)
            current_exposure += bet.recommended_stake
            
            # Update tracking
            game_exposure[game_id] = game_exposure.get(game_id, 0) + bet.recommended_stake
            for team in [bet.game_info.home_team, bet.game_info.away_team]:
                team_exposure[team] = team_exposure.get(team, 0) + bet.recommended_stake
            
            # Limit number of positions
            if len(optimized_bets) >= self.config.max_positions:
                break
        
        self.logger.info(f"Portfolio optimization: {len(optimized_bets)} bets selected from {len(available_bets)} available")
        
        return optimized_bets
    
    def _calculate_sharpe_ratio(self, positions: List[BetPosition]) -> Optional[float]:
        """Calculate Sharpe ratio for the betting strategy"""
        if len(positions) < 2:
            return None
        
        # Calculate daily returns
        daily_returns = []
        for date, pnl in self._daily_pnl.items():
            if pnl != 0:  # Only include days with activity
                daily_return = pnl / self.config.initial_bankroll
                daily_returns.append(daily_return)
        
        if len(daily_returns) < 2:
            return None
        
        # Calculate mean and standard deviation
        mean_return = sum(daily_returns) / len(daily_returns)
        variance = sum((r - mean_return) ** 2 for r in daily_returns) / (len(daily_returns) - 1)
        std_dev = variance ** 0.5
        
        if std_dev == 0:
            return None
        
        # Sharpe ratio (assuming risk-free rate of 0)
        return mean_return / std_dev
    
    def _calculate_max_drawdown(self) -> Optional[float]:
        """Calculate maximum drawdown from peak"""
        if len(self._bankroll_history) < 2:
            return None
        
        peak = self._bankroll_history[0][1]
        max_drawdown = 0.0
        
        for _, bankroll in self._bankroll_history:
            if bankroll > peak:
                peak = bankroll
            else:
                drawdown = (peak - bankroll) / peak
                max_drawdown = max(max_drawdown, drawdown)
        
        return max_drawdown
    
    def _check_rebalancing(self) -> None:
        """Check if portfolio rebalancing is needed"""
        current_bankroll = self._portfolio_state.total_bankroll
        initial_bankroll = self.config.initial_bankroll
        
        change_ratio = abs(current_bankroll - initial_bankroll) / initial_bankroll
        
        if change_ratio > self.config.rebalance_threshold:
            self.logger.info(f"Rebalancing triggered: {change_ratio:.2%} change in bankroll")
            self._rebalance_portfolio()
    
    def _rebalance_portfolio(self) -> None:
        """Rebalance portfolio based on current bankroll"""
        # Update daily risk limit based on current bankroll
        self._portfolio_state.max_daily_risk = self._portfolio_state.total_bankroll * 0.1
        
        # Handle profit withdrawal if configured
        if self.config.auto_compound:
            profit = self._portfolio_state.total_bankroll - self.config.initial_bankroll
            if profit > self.config.initial_bankroll * self.config.profit_withdrawal_threshold:
                withdrawal_amount = profit * 0.5  # Withdraw 50% of excess profit
                self._portfolio_state.total_bankroll -= withdrawal_amount
                self._portfolio_state.available_balance -= withdrawal_amount
                
                self.logger.info(f"Profit withdrawal: ${withdrawal_amount:.2f}")
        
        self.logger.info("Portfolio rebalanced")

