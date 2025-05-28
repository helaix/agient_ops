"""
Configuration management for the Value Bet Identification System
"""

import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class SystemConfig:
    """Main system configuration"""
    
    # Environment
    environment: str = "development"  # development, staging, production
    debug: bool = True
    log_level: str = "INFO"
    
    # Database/Storage
    database_url: Optional[str] = None
    redis_url: Optional[str] = None
    
    # External APIs
    odds_api_key: Optional[str] = None
    odds_api_base_url: str = "https://api.the-odds-api.com/v4"
    
    # Model endpoints
    model_api_url: Optional[str] = None
    model_api_key: Optional[str] = None
    
    # Betting parameters
    min_edge: float = 0.05
    min_confidence: float = 0.7
    max_odds: float = 3.0
    min_odds: float = 1.5
    
    # Kelly Criterion
    max_kelly_fraction: float = 0.25
    fractional_kelly: float = 0.5
    min_kelly_fraction: float = 0.01
    
    # Risk Management
    max_daily_risk: float = 0.1
    max_single_bet: float = 0.05
    max_game_exposure: float = 0.15
    max_team_exposure: float = 0.2
    max_drawdown_threshold: float = 0.2
    
    # Portfolio
    initial_bankroll: float = 10000.0
    max_positions: int = 20
    auto_compound: bool = True
    
    # Real-time processing
    odds_staleness_minutes: int = 5
    min_time_to_game_hours: int = 2
    processing_interval_seconds: int = 60
    
    # Monitoring
    enable_monitoring: bool = True
    alert_email: Optional[str] = None
    slack_webhook: Optional[str] = None
    
    @classmethod
    def from_env(cls) -> 'SystemConfig':
        """Create configuration from environment variables"""
        return cls(
            environment=os.getenv('ENVIRONMENT', 'development'),
            debug=os.getenv('DEBUG', 'true').lower() == 'true',
            log_level=os.getenv('LOG_LEVEL', 'INFO'),
            
            database_url=os.getenv('DATABASE_URL'),
            redis_url=os.getenv('REDIS_URL'),
            
            odds_api_key=os.getenv('ODDS_API_KEY'),
            odds_api_base_url=os.getenv('ODDS_API_BASE_URL', 'https://api.the-odds-api.com/v4'),
            
            model_api_url=os.getenv('MODEL_API_URL'),
            model_api_key=os.getenv('MODEL_API_KEY'),
            
            min_edge=float(os.getenv('MIN_EDGE', '0.05')),
            min_confidence=float(os.getenv('MIN_CONFIDENCE', '0.7')),
            max_odds=float(os.getenv('MAX_ODDS', '3.0')),
            min_odds=float(os.getenv('MIN_ODDS', '1.5')),
            
            max_kelly_fraction=float(os.getenv('MAX_KELLY_FRACTION', '0.25')),
            fractional_kelly=float(os.getenv('FRACTIONAL_KELLY', '0.5')),
            min_kelly_fraction=float(os.getenv('MIN_KELLY_FRACTION', '0.01')),
            
            max_daily_risk=float(os.getenv('MAX_DAILY_RISK', '0.1')),
            max_single_bet=float(os.getenv('MAX_SINGLE_BET', '0.05')),
            max_game_exposure=float(os.getenv('MAX_GAME_EXPOSURE', '0.15')),
            max_team_exposure=float(os.getenv('MAX_TEAM_EXPOSURE', '0.2')),
            max_drawdown_threshold=float(os.getenv('MAX_DRAWDOWN_THRESHOLD', '0.2')),
            
            initial_bankroll=float(os.getenv('INITIAL_BANKROLL', '10000.0')),
            max_positions=int(os.getenv('MAX_POSITIONS', '20')),
            auto_compound=os.getenv('AUTO_COMPOUND', 'true').lower() == 'true',
            
            odds_staleness_minutes=int(os.getenv('ODDS_STALENESS_MINUTES', '5')),
            min_time_to_game_hours=int(os.getenv('MIN_TIME_TO_GAME_HOURS', '2')),
            processing_interval_seconds=int(os.getenv('PROCESSING_INTERVAL_SECONDS', '60')),
            
            enable_monitoring=os.getenv('ENABLE_MONITORING', 'true').lower() == 'true',
            alert_email=os.getenv('ALERT_EMAIL'),
            slack_webhook=os.getenv('SLACK_WEBHOOK')
        )
    
    def to_betting_engine_config(self):
        """Convert to BettingEngineConfig"""
        from .betting_engine import BettingEngineConfig
        
        return BettingEngineConfig(
            min_edge=self.min_edge,
            min_confidence=self.min_confidence,
            max_odds=self.max_odds,
            min_odds=self.min_odds,
            max_kelly_fraction=self.max_kelly_fraction,
            fractional_kelly=self.fractional_kelly,
            max_daily_risk=self.max_daily_risk,
            max_single_bet=self.max_single_bet,
            initial_bankroll=self.initial_bankroll,
            max_positions=self.max_positions,
            odds_staleness_minutes=self.odds_staleness_minutes,
            min_time_to_game_hours=self.min_time_to_game_hours
        )

