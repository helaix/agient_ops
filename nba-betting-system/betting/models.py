"""
Data models for the Value Bet Identification System
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Union
from datetime import datetime
from enum import Enum


class BetType(Enum):
    """Types of bets supported by the system"""
    MONEYLINE = "moneyline"
    SPREAD = "spread"
    TOTAL = "total"
    PROP = "prop"


class BetOutcome(Enum):
    """Possible outcomes for a bet"""
    WIN = "win"
    LOSS = "loss"
    PUSH = "push"
    PENDING = "pending"


@dataclass
class GameInfo:
    """Information about an NBA game"""
    game_id: str
    home_team: str
    away_team: str
    game_time: datetime
    season: str
    playoff_round: Optional[str] = None


@dataclass
class BookmakerOdds:
    """Odds from a bookmaker for a specific bet"""
    bookmaker: str
    bet_type: BetType
    line: Optional[float]  # For spread/total bets
    odds: float  # American odds format
    timestamp: datetime
    
    @property
    def decimal_odds(self) -> float:
        """Convert American odds to decimal format"""
        if self.odds > 0:
            return (self.odds / 100) + 1
        else:
            return (100 / abs(self.odds)) + 1
    
    @property
    def implied_probability(self) -> float:
        """Calculate implied probability from odds"""
        return 1 / self.decimal_odds


@dataclass
class ModelPrediction:
    """Prediction from the ML model"""
    game_id: str
    bet_type: BetType
    line: Optional[float]
    predicted_probability: float
    confidence: float
    model_version: str
    timestamp: datetime


@dataclass
class ValueBet:
    """A value betting opportunity"""
    game_info: GameInfo
    bet_type: BetType
    line: Optional[float]
    bookmaker_odds: BookmakerOdds
    model_prediction: ModelPrediction
    expected_value: float
    kelly_fraction: float
    recommended_stake: float
    confidence_score: float
    timestamp: datetime


@dataclass
class BetPosition:
    """An active betting position"""
    bet_id: str
    value_bet: ValueBet
    stake_amount: float
    potential_payout: float
    placed_at: datetime
    outcome: BetOutcome = BetOutcome.PENDING
    actual_payout: float = 0.0
    settled_at: Optional[datetime] = None


@dataclass
class PortfolioState:
    """Current state of the betting portfolio"""
    total_bankroll: float
    available_balance: float
    active_positions: List[BetPosition]
    total_exposure: float
    daily_risk_used: float
    max_daily_risk: float
    
    @property
    def position_count(self) -> int:
        return len(self.active_positions)
    
    @property
    def utilization_rate(self) -> float:
        """Percentage of bankroll currently at risk"""
        return self.total_exposure / self.total_bankroll if self.total_bankroll > 0 else 0


@dataclass
class RiskMetrics:
    """Risk assessment metrics for a potential bet"""
    kelly_fraction: float
    max_loss_probability: float
    correlation_risk: float
    concentration_risk: float
    overall_risk_score: float
    recommended_action: str  # "bet", "reduce_stake", "skip"


@dataclass
class PerformanceMetrics:
    """Performance tracking metrics"""
    total_bets: int
    winning_bets: int
    losing_bets: int
    total_staked: float
    total_returned: float
    net_profit: float
    roi: float
    win_rate: float
    average_odds: float
    sharpe_ratio: Optional[float] = None
    max_drawdown: Optional[float] = None

