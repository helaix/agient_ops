"""
Configuration Management for NBA Data Collection and Preprocessing

Centralized configuration for all data collection, validation, and processing components.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from pathlib import Path
import os
import json
import logging


@dataclass
class CollectorConfig:
    """Configuration for data collectors."""
    enabled: bool = True
    rate_limit: int = 60  # requests per minute
    timeout: int = 30  # seconds
    retry_attempts: int = 3
    retry_backoff: float = 2.0
    custom_params: Dict[str, Any] = field(default_factory=dict)


@dataclass
class NBACollectorConfig(CollectorConfig):
    """Configuration specific to NBA API collector."""
    rate_limit: int = 60  # NBA API limit
    timeout: int = 45
    seasons: List[str] = field(default_factory=lambda: ["2023-24"])
    season_types: List[str] = field(default_factory=lambda: ["Playoffs", "Regular Season"])
    include_historical: bool = True
    historical_days: int = 30


@dataclass
class BettingOddsConfig(CollectorConfig):
    """Configuration for betting odds collector."""
    api_key: Optional[str] = None
    base_url: str = "https://api.the-odds-api.com/v4"
    rate_limit: int = 120
    bookmakers: List[str] = field(default_factory=lambda: [
        "draftkings", "fanduel", "betmgm", "caesars", "pointsbet"
    ])
    markets: List[str] = field(default_factory=lambda: ["h2h", "spreads", "totals"])
    include_historical: bool = False
    track_line_movements: bool = True


@dataclass
class InjuryCollectorConfig(CollectorConfig):
    """Configuration for injury reports collector."""
    sources: Dict[str, str] = field(default_factory=lambda: {
        "nba_official": "https://www.nba.com/stats/players/injury",
        "espn": "https://www.espn.com/nba/injuries",
        "rotoworld": "https://www.rotoworld.com/basketball/nba/injury-report"
    })
    rate_limit: int = 30
    include_roster_changes: bool = True
    impact_scoring: bool = True


@dataclass
class ValidationConfig:
    """Configuration for data validation."""
    enabled: bool = True
    strict_mode: bool = False
    quality_thresholds: Dict[str, float] = field(default_factory=lambda: {
        "high": 0.9,
        "medium": 0.7,
        "low": 0.5
    })
    schema_validation: bool = True
    statistical_validation: bool = True
    business_rules_validation: bool = True


@dataclass
class ProcessingConfig:
    """Configuration for data processing."""
    enabled: bool = True
    batch_size: int = 1000
    parallel_processing: bool = True
    max_workers: int = 4
    data_cleaning: bool = True
    feature_extraction: bool = True
    data_enrichment: bool = True
    outlier_detection: bool = True
    duplicate_removal: bool = True


@dataclass
class StorageConfig:
    """Configuration for data storage."""
    storage_type: str = "file_based"  # Options: file_based, influxdb, timescaledb
    storage_path: str = "./data/storage"
    retention_days: int = 90
    batch_size: int = 1000
    compression: bool = True
    backup_enabled: bool = True
    backup_interval_hours: int = 24


@dataclass
class MonitoringConfig:
    """Configuration for monitoring and alerting."""
    enabled: bool = True
    log_level: str = "INFO"
    metrics_collection: bool = True
    health_check_interval: int = 300  # seconds
    alert_thresholds: Dict[str, Any] = field(default_factory=lambda: {
        "error_rate": 0.05,  # 5% error rate threshold
        "latency_ms": 5000,  # 5 second latency threshold
        "data_freshness_minutes": 30  # 30 minute data freshness threshold
    })


@dataclass
class DataPipelineConfig:
    """Main configuration for the data pipeline."""
    pipeline_name: str = "nba_betting_data_pipeline"
    environment: str = "development"  # development, staging, production
    
    # Component configurations
    nba_collector: NBACollectorConfig = field(default_factory=NBACollectorConfig)
    betting_odds_collector: BettingOddsConfig = field(default_factory=BettingOddsConfig)
    injury_collector: InjuryCollectorConfig = field(default_factory=InjuryCollectorConfig)
    
    validation: ValidationConfig = field(default_factory=ValidationConfig)
    processing: ProcessingConfig = field(default_factory=ProcessingConfig)
    storage: StorageConfig = field(default_factory=StorageConfig)
    monitoring: MonitoringConfig = field(default_factory=MonitoringConfig)
    
    # Pipeline-level settings
    schedule_interval_minutes: int = 15  # Run every 15 minutes
    max_concurrent_collectors: int = 3
    error_handling_strategy: str = "continue"  # continue, stop, retry
    
    def __post_init__(self):
        """Post-initialization validation and setup."""
        # Load environment variables
        self._load_environment_variables()
        
        # Validate configuration
        self._validate_config()
        
        # Setup logging
        self._setup_logging()
    
    def _load_environment_variables(self):
        """Load configuration from environment variables."""
        # Betting odds API key
        if not self.betting_odds_collector.api_key:
            self.betting_odds_collector.api_key = os.getenv('ODDS_API_KEY')
        
        # Storage path
        storage_path = os.getenv('DATA_STORAGE_PATH')
        if storage_path:
            self.storage.storage_path = storage_path
        
        # Environment
        env = os.getenv('ENVIRONMENT')
        if env:
            self.environment = env
        
        # Log level
        log_level = os.getenv('LOG_LEVEL')
        if log_level:
            self.monitoring.log_level = log_level
    
    def _validate_config(self):
        """Validate configuration settings."""
        errors = []
        
        # Validate betting odds configuration
        if self.betting_odds_collector.enabled and not self.betting_odds_collector.api_key:
            errors.append("Betting odds collector is enabled but no API key provided")
        
        # Validate storage path
        try:
            Path(self.storage.storage_path).mkdir(parents=True, exist_ok=True)
        except Exception as e:
            errors.append(f"Cannot create storage path {self.storage.storage_path}: {e}")
        
        # Validate rate limits
        if self.nba_collector.rate_limit > 60:
            errors.append("NBA API rate limit should not exceed 60 requests per minute")
        
        # Validate schedule interval
        if self.schedule_interval_minutes < 1:
            errors.append("Schedule interval must be at least 1 minute")
        
        if errors:
            raise ValueError(f"Configuration validation failed: {'; '.join(errors)}")
    
    def _setup_logging(self):
        """Setup logging configuration."""
        log_level = getattr(logging, self.monitoring.log_level.upper())
        
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler(
                    Path(self.storage.storage_path) / 'pipeline.log'
                )
            ]
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        def _dataclass_to_dict(obj):
            if hasattr(obj, '__dataclass_fields__'):
                return {
                    field_name: _dataclass_to_dict(getattr(obj, field_name))
                    for field_name in obj.__dataclass_fields__
                }
            elif isinstance(obj, list):
                return [_dataclass_to_dict(item) for item in obj]
            elif isinstance(obj, dict):
                return {key: _dataclass_to_dict(value) for key, value in obj.items()}
            else:
                return obj
        
        return _dataclass_to_dict(self)
    
    @classmethod
    def from_dict(cls, config_dict: Dict[str, Any]) -> 'DataPipelineConfig':
        """Create configuration from dictionary."""
        # This is a simplified implementation
        # In practice, you'd want more sophisticated deserialization
        config = cls()
        
        # Update fields from dictionary
        for key, value in config_dict.items():
            if hasattr(config, key):
                setattr(config, key, value)
        
        return config
    
    @classmethod
    def from_file(cls, config_path: str) -> 'DataPipelineConfig':
        """Load configuration from JSON file."""
        with open(config_path, 'r') as f:
            config_dict = json.load(f)
        
        return cls.from_dict(config_dict)
    
    def save_to_file(self, config_path: str):
        """Save configuration to JSON file."""
        with open(config_path, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
    
    def get_collector_config(self, collector_type: str) -> CollectorConfig:
        """Get configuration for a specific collector type."""
        collector_configs = {
            'nba': self.nba_collector,
            'betting_odds': self.betting_odds_collector,
            'injury': self.injury_collector
        }
        
        return collector_configs.get(collector_type)
    
    def update_from_environment(self):
        """Update configuration from environment variables."""
        self._load_environment_variables()
        self._validate_config()


# Default configuration instances
DEFAULT_CONFIG = DataPipelineConfig()

DEVELOPMENT_CONFIG = DataPipelineConfig(
    environment="development",
    storage=StorageConfig(
        storage_path="./data/dev_storage",
        retention_days=30
    ),
    monitoring=MonitoringConfig(
        log_level="DEBUG"
    )
)

PRODUCTION_CONFIG = DataPipelineConfig(
    environment="production",
    validation=ValidationConfig(
        strict_mode=True
    ),
    processing=ProcessingConfig(
        parallel_processing=True,
        max_workers=8
    ),
    storage=StorageConfig(
        storage_path="/var/data/nba_betting",
        retention_days=365,
        backup_enabled=True
    ),
    monitoring=MonitoringConfig(
        log_level="INFO",
        metrics_collection=True
    )
)


def get_config(environment: str = "development") -> DataPipelineConfig:
    """Get configuration for specified environment."""
    configs = {
        "development": DEVELOPMENT_CONFIG,
        "production": PRODUCTION_CONFIG,
        "default": DEFAULT_CONFIG
    }
    
    return configs.get(environment, DEFAULT_CONFIG)


def load_config_from_env() -> DataPipelineConfig:
    """Load configuration based on environment variables."""
    environment = os.getenv('ENVIRONMENT', 'development')
    config = get_config(environment)
    config.update_from_environment()
    return config

