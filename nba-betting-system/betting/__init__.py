"""
Value Bet Identification System

Core betting logic that identifies value bets by comparing model predictions 
with bookmaker odds to maximize ROI while minimizing risk.
"""

from .value_detector import ValueBetDetector
from .kelly_criterion import KellyCriterion
from .risk_manager import RiskManager
from .portfolio_manager import PortfolioManager
from .betting_engine import BettingEngine

__all__ = [
    'ValueBetDetector',
    'KellyCriterion', 
    'RiskManager',
    'PortfolioManager',
    'BettingEngine'
]

