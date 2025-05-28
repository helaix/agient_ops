"""
Main Data Pipeline Orchestrator

Coordinates data collection, validation, processing, and storage for the NBA betting system.
Provides high-level interface for running the complete data pipeline.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import signal
import sys

from .architecture import DataPipeline, PipelineConfig, DataSourceType
from .collectors import NBACollector, BettingOddsCollector, InjuryCollector
from .validators.schema_validator import SchemaValidator
from .processors.data_cleaner import DataCleaner
from .storage.time_series_storage import TimeSeriesStorage
from .config import DataPipelineConfig, load_config_from_env


class NBADataPipelineOrchestrator:
    """Main orchestrator for the NBA data collection and preprocessing pipeline."""
    
    def __init__(self, config: Optional[DataPipelineConfig] = None):
        self.config = config or load_config_from_env()
        self.logger = logging.getLogger("pipeline.orchestrator")
        
        # Initialize pipeline components
        self.pipeline = None
        self.storage = None
        self.running = False
        self.shutdown_event = asyncio.Event()
        
        # Performance metrics
        self.metrics = {
            'runs_completed': 0,
            'total_records_processed': 0,
            'last_run_time': None,
            'average_run_duration': 0,
            'error_count': 0
        }
        
        # Setup signal handlers for graceful shutdown
        self._setup_signal_handlers()
    
    def _setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown."""
        def signal_handler(signum, frame):
            self.logger.info(f"Received signal {signum}, initiating graceful shutdown...")
            self.shutdown_event.set()
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    async def initialize(self):
        """Initialize all pipeline components."""
        try:
            self.logger.info("Initializing NBA data pipeline...")
            
            # Initialize storage
            self.storage = TimeSeriesStorage(self.config.storage.to_dict())
            
            # Create pipeline configuration
            pipeline_config = PipelineConfig(
                name=self.config.pipeline_name,
                collectors=[],  # Will be populated below
                validators=[],
                processors=[],
                storage_config=self.config.storage.to_dict(),
                monitoring_config=self.config.monitoring.to_dict()
            )
            
            # Initialize pipeline
            self.pipeline = DataPipeline(pipeline_config)
            
            # Register collectors
            await self._register_collectors()
            
            # Register validators
            self._register_validators()
            
            # Register processors
            self._register_processors()
            
            self.logger.info("Pipeline initialization completed successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize pipeline: {e}")
            raise
    
    async def _register_collectors(self):
        """Register and configure data collectors."""
        # NBA API Collector
        if self.config.nba_collector.enabled:
            nba_collector = NBACollector(self.config.nba_collector.to_dict())
            if nba_collector.validate_config():
                self.pipeline.register_collector(nba_collector)
                self.logger.info("Registered NBA API collector")
            else:
                self.logger.warning("NBA collector configuration invalid, skipping")
        
        # Betting Odds Collector
        if self.config.betting_odds_collector.enabled:
            betting_collector = BettingOddsCollector(self.config.betting_odds_collector.to_dict())
            if betting_collector.validate_config():
                self.pipeline.register_collector(betting_collector)
                self.logger.info("Registered betting odds collector")
            else:
                self.logger.warning("Betting odds collector configuration invalid, skipping")
        
        # Injury Reports Collector
        if self.config.injury_collector.enabled:
            injury_collector = InjuryCollector(self.config.injury_collector.to_dict())
            if injury_collector.validate_config():
                self.pipeline.register_collector(injury_collector)
                self.logger.info("Registered injury reports collector")
            else:
                self.logger.warning("Injury collector configuration invalid, skipping")
    
    def _register_validators(self):
        """Register data validators."""
        if self.config.validation.enabled:
            if self.config.validation.schema_validation:
                schema_validator = SchemaValidator(self.config.validation.to_dict())
                self.pipeline.register_validator(schema_validator)
                self.logger.info("Registered schema validator")
    
    def _register_processors(self):
        """Register data processors."""
        if self.config.processing.enabled:
            if self.config.processing.data_cleaning:
                data_cleaner = DataCleaner(self.config.processing.to_dict())
                self.pipeline.register_processor(data_cleaner)
                self.logger.info("Registered data cleaner")
    
    async def run_single_collection(self, source_types: Optional[List[DataSourceType]] = None) -> Dict[str, Any]:
        """Run a single data collection cycle."""
        start_time = datetime.utcnow()
        run_stats = {
            'start_time': start_time.isoformat(),
            'records_collected': 0,
            'records_stored': 0,
            'errors': [],
            'duration_seconds': 0
        }
        
        try:
            self.logger.info("Starting data collection cycle...")
            
            # Run the pipeline
            processed_records = await self.pipeline.run_pipeline(source_types)
            run_stats['records_collected'] = len(processed_records)
            
            # Store processed records
            if processed_records and self.storage:
                success = await self.storage.store_records(processed_records)
                if success:
                    run_stats['records_stored'] = len(processed_records)
                    self.logger.info(f"Stored {len(processed_records)} records")
                else:
                    run_stats['errors'].append("Failed to store records")
            
            # Update metrics
            self.metrics['runs_completed'] += 1
            self.metrics['total_records_processed'] += len(processed_records)
            self.metrics['last_run_time'] = start_time.isoformat()
            
            # Calculate average run duration
            duration = (datetime.utcnow() - start_time).total_seconds()
            run_stats['duration_seconds'] = duration
            
            if self.metrics['runs_completed'] == 1:
                self.metrics['average_run_duration'] = duration
            else:
                # Running average
                self.metrics['average_run_duration'] = (
                    (self.metrics['average_run_duration'] * (self.metrics['runs_completed'] - 1) + duration) /
                    self.metrics['runs_completed']
                )
            
            self.logger.info(f"Collection cycle completed in {duration:.2f} seconds")
            
        except Exception as e:
            self.logger.error(f"Collection cycle failed: {e}")
            run_stats['errors'].append(str(e))
            self.metrics['error_count'] += 1
        
        return run_stats
    
    async def run_scheduled_pipeline(self):
        """Run the pipeline on a scheduled basis."""
        self.running = True
        self.logger.info(f"Starting scheduled pipeline with {self.config.schedule_interval_minutes} minute intervals")
        
        while self.running and not self.shutdown_event.is_set():
            try:
                # Run collection cycle
                await self.run_single_collection()
                
                # Wait for next scheduled run or shutdown signal
                try:
                    await asyncio.wait_for(
                        self.shutdown_event.wait(),
                        timeout=self.config.schedule_interval_minutes * 60
                    )
                    # If we get here, shutdown was requested
                    break
                except asyncio.TimeoutError:
                    # Timeout is expected - continue to next cycle
                    continue
                    
            except Exception as e:
                self.logger.error(f"Scheduled pipeline run failed: {e}")
                self.metrics['error_count'] += 1
                
                # Wait before retrying
                await asyncio.sleep(60)  # Wait 1 minute before retry
        
        self.logger.info("Scheduled pipeline stopped")
    
    async def run_playoff_focused_collection(self):
        """Run collection specifically focused on playoff data."""
        self.logger.info("Running playoff-focused data collection...")
        
        # Collect NBA playoff data
        nba_records = await self.pipeline.run_collection([DataSourceType.NBA_API])
        
        # Collect current betting odds
        betting_records = await self.pipeline.run_collection([DataSourceType.BETTING_ODDS])
        
        # Collect injury reports (critical for playoffs)
        injury_records = await self.pipeline.run_collection([DataSourceType.INJURY_REPORTS])
        
        all_records = nba_records + betting_records + injury_records
        
        # Process and store
        if all_records:
            processed_records = self.pipeline.run_processing(all_records)
            if self.storage:
                await self.storage.store_records(processed_records)
        
        return {
            'nba_records': len(nba_records),
            'betting_records': len(betting_records),
            'injury_records': len(injury_records),
            'total_processed': len(all_records)
        }
    
    async def get_pipeline_health(self) -> Dict[str, Any]:
        """Get comprehensive health status of the pipeline."""
        health_status = {
            'pipeline_status': 'running' if self.running else 'stopped',
            'last_updated': datetime.utcnow().isoformat(),
            'metrics': self.metrics.copy(),
            'config': {
                'environment': self.config.environment,
                'schedule_interval_minutes': self.config.schedule_interval_minutes
            }
        }
        
        # Get pipeline component health
        if self.pipeline:
            health_status['components'] = self.pipeline.get_pipeline_health()
        
        # Get storage health
        if self.storage:
            health_status['storage'] = await self.storage.get_storage_stats()
        
        return health_status
    
    async def cleanup_old_data(self):
        """Clean up old data based on retention policy."""
        if self.storage:
            await self.storage.cleanup_old_data()
            self.logger.info("Completed data cleanup")
    
    async def shutdown(self):
        """Gracefully shutdown the pipeline."""
        self.logger.info("Shutting down pipeline...")
        self.running = False
        self.shutdown_event.set()
        
        # Force flush any pending data
        if self.storage:
            await self.storage.force_flush()
        
        self.logger.info("Pipeline shutdown completed")


async def main():
    """Main entry point for running the data pipeline."""
    # Load configuration
    config = load_config_from_env()
    
    # Create and initialize orchestrator
    orchestrator = NBADataPipelineOrchestrator(config)
    await orchestrator.initialize()
    
    # Check command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "single":
            # Run single collection
            result = await orchestrator.run_single_collection()
            print(f"Collection completed: {result}")
            
        elif command == "playoff":
            # Run playoff-focused collection
            result = await orchestrator.run_playoff_focused_collection()
            print(f"Playoff collection completed: {result}")
            
        elif command == "health":
            # Get health status
            health = await orchestrator.get_pipeline_health()
            print(f"Pipeline health: {health}")
            
        elif command == "cleanup":
            # Clean up old data
            await orchestrator.cleanup_old_data()
            print("Data cleanup completed")
            
        else:
            print(f"Unknown command: {command}")
            print("Available commands: single, playoff, health, cleanup, scheduled")
    
    else:
        # Run scheduled pipeline
        try:
            await orchestrator.run_scheduled_pipeline()
        finally:
            await orchestrator.shutdown()


if __name__ == "__main__":
    asyncio.run(main())

