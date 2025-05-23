"""
Adaptation Engine for Autonomous System Updates.

This module provides the core adaptation capabilities that automatically
modify systems in response to detected AI innovations.
"""

__version__ = "1.0.0"

from .adaptation_engine import AdaptationEngine
from .strategy_manager import StrategyManager
from .execution_engine import ExecutionEngine
from .rollback_manager import RollbackManager

__all__ = [
    "AdaptationEngine",
    "StrategyManager",
    "ExecutionEngine", 
    "RollbackManager"
]

