"""
Data Collection and Preprocessing Architecture for NBA Playoff Betting System

This module defines the core architecture for data collection, validation,
and preprocessing with a focus on reliability, scalability, and real-time processing.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union
import logging
from pathlib import Path


class DataSourceType(Enum):
    """Enumeration of supported data source types."""
    NBA_API = "nba_api"
    BETTING_ODDS = "betting_odds"
    INJURY_REPORTS = "injury_reports"
    ROSTER_CHANGES = "roster_changes"
    WEATHER = "weather"
    NEWS_SENTIMENT = "news_sentiment"


class DataQuality(Enum):
    """Data quality levels for validation and processing."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INVALID = "invalid"


@dataclass
class DataRecord:
    """Standardized data record structure for all data sources."""
    source_type: DataSourceType
    timestamp: datetime
    game_id: Optional[str] = None
    team_id: Optional[str] = None
    player_id: Optional[str] = None
    data: Dict[str, Any] = field(default_factory=dict)
    quality: DataQuality = DataQuality.MEDIUM
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Validate and enrich data record after initialization."""
        if not self.timestamp:
            self.timestamp = datetime.utcnow()
        
        # Add source metadata
        self.metadata.update({
            'ingestion_time': datetime.utcnow(),
            'record_id': f"{self.source_type.value}_{self.timestamp.isoformat()}",
            'version': '1.0'
        })


class DataCollector(ABC):
    """Abstract base class for all data collectors."""
    
    def __init__(self, source_type: DataSourceType, config: Dict[str, Any]):
        self.source_type = source_type
        self.config = config
        self.logger = logging.getLogger(f"collector.{source_type.value}")
        
    @abstractmethod
    async def collect(self, **kwargs) -> List[DataRecord]:
        """Collect data from the source and return standardized records."""
        pass
    
    @abstractmethod
    def validate_config(self) -> bool:
        """Validate collector configuration."""
        pass
    
    @abstractmethod
    def get_health_status(self) -> Dict[str, Any]:
        """Return health status of the data source."""
        pass


class DataValidator(ABC):
    """Abstract base class for data validation."""
    
    @abstractmethod
    def validate(self, record: DataRecord) -> DataQuality:
        """Validate a data record and return quality assessment."""
        pass
    
    @abstractmethod
    def get_validation_rules(self) -> Dict[str, Any]:
        """Return validation rules for this validator."""
        pass


class DataProcessor(ABC):
    """Abstract base class for data preprocessing."""
    
    @abstractmethod
    def process(self, records: List[DataRecord]) -> List[DataRecord]:
        """Process and transform data records."""
        pass
    
    @abstractmethod
    def get_processing_stats(self) -> Dict[str, Any]:
        """Return processing statistics."""
        pass


@dataclass
class PipelineConfig:
    """Configuration for data processing pipeline."""
    name: str
    collectors: List[Dict[str, Any]]
    validators: List[Dict[str, Any]]
    processors: List[Dict[str, Any]]
    storage_config: Dict[str, Any]
    monitoring_config: Dict[str, Any] = field(default_factory=dict)
    retry_config: Dict[str, Any] = field(default_factory=lambda: {
        'max_retries': 3,
        'backoff_factor': 2,
        'timeout': 30
    })


class DataPipeline:
    """Main data processing pipeline orchestrator."""
    
    def __init__(self, config: PipelineConfig):
        self.config = config
        self.collectors: Dict[DataSourceType, DataCollector] = {}
        self.validators: List[DataValidator] = []
        self.processors: List[DataProcessor] = []
        self.logger = logging.getLogger(f"pipeline.{config.name}")
        
    def register_collector(self, collector: DataCollector):
        """Register a data collector."""
        self.collectors[collector.source_type] = collector
        self.logger.info(f"Registered collector for {collector.source_type.value}")
        
    def register_validator(self, validator: DataValidator):
        """Register a data validator."""
        self.validators.append(validator)
        self.logger.info(f"Registered validator: {validator.__class__.__name__}")
        
    def register_processor(self, processor: DataProcessor):
        """Register a data processor."""
        self.processors.append(processor)
        self.logger.info(f"Registered processor: {processor.__class__.__name__}")
    
    async def run_collection(self, source_types: Optional[List[DataSourceType]] = None) -> List[DataRecord]:
        """Run data collection for specified sources."""
        if source_types is None:
            source_types = list(self.collectors.keys())
            
        all_records = []
        for source_type in source_types:
            if source_type in self.collectors:
                try:
                    records = await self.collectors[source_type].collect()
                    all_records.extend(records)
                    self.logger.info(f"Collected {len(records)} records from {source_type.value}")
                except Exception as e:
                    self.logger.error(f"Failed to collect from {source_type.value}: {e}")
                    
        return all_records
    
    def run_validation(self, records: List[DataRecord]) -> List[DataRecord]:
        """Run validation on data records."""
        validated_records = []
        for record in records:
            quality_scores = []
            for validator in self.validators:
                try:
                    quality = validator.validate(record)
                    quality_scores.append(quality)
                except Exception as e:
                    self.logger.error(f"Validation failed for record {record.metadata.get('record_id')}: {e}")
                    quality_scores.append(DataQuality.INVALID)
            
            # Determine overall quality (take the minimum)
            if quality_scores:
                record.quality = min(quality_scores, key=lambda x: x.value)
            
            validated_records.append(record)
            
        return validated_records
    
    def run_processing(self, records: List[DataRecord]) -> List[DataRecord]:
        """Run preprocessing on data records."""
        processed_records = records
        for processor in self.processors:
            try:
                processed_records = processor.process(processed_records)
                self.logger.info(f"Processed {len(processed_records)} records with {processor.__class__.__name__}")
            except Exception as e:
                self.logger.error(f"Processing failed with {processor.__class__.__name__}: {e}")
                
        return processed_records
    
    async def run_pipeline(self, source_types: Optional[List[DataSourceType]] = None) -> List[DataRecord]:
        """Run the complete data pipeline."""
        self.logger.info("Starting data pipeline execution")
        
        # Collection phase
        records = await self.run_collection(source_types)
        self.logger.info(f"Collection phase completed: {len(records)} records")
        
        # Validation phase
        records = self.run_validation(records)
        valid_records = [r for r in records if r.quality != DataQuality.INVALID]
        self.logger.info(f"Validation phase completed: {len(valid_records)}/{len(records)} valid records")
        
        # Processing phase
        processed_records = self.run_processing(valid_records)
        self.logger.info(f"Processing phase completed: {len(processed_records)} records")
        
        return processed_records
    
    def get_pipeline_health(self) -> Dict[str, Any]:
        """Get health status of the entire pipeline."""
        health_status = {
            'pipeline_name': self.config.name,
            'timestamp': datetime.utcnow().isoformat(),
            'collectors': {},
            'validators': len(self.validators),
            'processors': len(self.processors)
        }
        
        for source_type, collector in self.collectors.items():
            try:
                health_status['collectors'][source_type.value] = collector.get_health_status()
            except Exception as e:
                health_status['collectors'][source_type.value] = {'status': 'error', 'error': str(e)}
                
        return health_status


# Configuration constants
DEFAULT_CONFIG = {
    'rate_limits': {
        'nba_api': {'requests_per_minute': 60, 'burst_limit': 10},
        'betting_odds': {'requests_per_minute': 120, 'burst_limit': 20},
        'injury_reports': {'requests_per_minute': 30, 'burst_limit': 5}
    },
    'timeouts': {
        'default': 30,
        'nba_api': 45,
        'betting_odds': 20
    },
    'retry_policies': {
        'max_retries': 3,
        'backoff_factor': 2,
        'retry_on_status': [429, 500, 502, 503, 504]
    }
}

