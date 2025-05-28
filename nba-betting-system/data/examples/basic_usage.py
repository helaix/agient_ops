"""
Basic Usage Examples for NBA Data Collection and Preprocessing

This module demonstrates how to use the data collection and preprocessing
components for various scenarios.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from pathlib import Path

# Import our data pipeline components
from ..pipeline import NBADataPipelineOrchestrator
from ..config import DataPipelineConfig, get_config
from ..architecture import DataSourceType


async def example_single_collection():
    """Example: Run a single data collection cycle."""
    print("=== Single Data Collection Example ===")
    
    # Create configuration
    config = get_config("development")
    
    # Initialize orchestrator
    orchestrator = NBADataPipelineOrchestrator(config)
    await orchestrator.initialize()
    
    # Run single collection
    result = await orchestrator.run_single_collection()
    
    print(f"Collection Results:")
    print(f"  Records collected: {result['records_collected']}")
    print(f"  Records stored: {result['records_stored']}")
    print(f"  Duration: {result['duration_seconds']:.2f} seconds")
    print(f"  Errors: {len(result['errors'])}")
    
    # Get health status
    health = await orchestrator.get_pipeline_health()
    print(f"\\nPipeline Health:")
    print(f"  Status: {health['pipeline_status']}")
    print(f"  Total runs: {health['metrics']['runs_completed']}")
    print(f"  Total records processed: {health['metrics']['total_records_processed']}")


async def example_playoff_collection():
    """Example: Run playoff-specific data collection."""
    print("\\n=== Playoff Data Collection Example ===")
    
    # Create configuration optimized for playoffs
    config = get_config("development")
    config.nba_collector.season_types = ["Playoffs"]
    config.nba_collector.include_historical = True
    config.betting_odds_collector.track_line_movements = True
    config.injury_collector.impact_scoring = True
    
    # Initialize orchestrator
    orchestrator = NBADataPipelineOrchestrator(config)
    await orchestrator.initialize()
    
    # Run playoff-focused collection
    result = await orchestrator.run_playoff_focused_collection()
    
    print(f"Playoff Collection Results:")
    print(f"  NBA records: {result['nba_records']}")
    print(f"  Betting records: {result['betting_records']}")
    print(f"  Injury records: {result['injury_records']}")
    print(f"  Total processed: {result['total_processed']}")


async def example_specific_source_collection():
    """Example: Collect data from specific sources only."""
    print("\\n=== Specific Source Collection Example ===")
    
    config = get_config("development")
    orchestrator = NBADataPipelineOrchestrator(config)
    await orchestrator.initialize()
    
    # Collect only NBA API data
    print("Collecting NBA API data only...")
    result = await orchestrator.run_single_collection([DataSourceType.NBA_API])
    print(f"NBA API collection: {result['records_collected']} records")
    
    # Collect only betting odds
    print("Collecting betting odds only...")
    result = await orchestrator.run_single_collection([DataSourceType.BETTING_ODDS])
    print(f"Betting odds collection: {result['records_collected']} records")
    
    # Collect only injury reports
    print("Collecting injury reports only...")
    result = await orchestrator.run_single_collection([DataSourceType.INJURY_REPORTS])
    print(f"Injury reports collection: {result['records_collected']} records")


async def example_data_querying():
    """Example: Query stored data."""
    print("\\n=== Data Querying Example ===")
    
    config = get_config("development")
    orchestrator = NBADataPipelineOrchestrator(config)
    await orchestrator.initialize()
    
    # First, collect some data
    await orchestrator.run_single_collection()
    
    # Query recent NBA data
    if orchestrator.storage:
        recent_nba_records = await orchestrator.storage.get_latest_records(
            DataSourceType.NBA_API, 
            limit=10
        )
        print(f"Recent NBA records: {len(recent_nba_records)}")
        
        # Query data from last 24 hours
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=24)
        
        recent_records = await orchestrator.storage.query_records(
            start_time=start_time,
            end_time=end_time
        )
        print(f"Records from last 24 hours: {len(recent_records)}")
        
        # Query specific game data
        game_records = await orchestrator.storage.query_records(
            source_type=DataSourceType.NBA_API,
            filters={'data_type': 'game_data'}
        )
        print(f"Game data records: {len(game_records)}")


async def example_custom_configuration():
    """Example: Use custom configuration."""
    print("\\n=== Custom Configuration Example ===")
    
    # Create custom configuration
    config = DataPipelineConfig(
        pipeline_name="custom_nba_pipeline",
        environment="development"
    )
    
    # Customize NBA collector
    config.nba_collector.rate_limit = 30  # Slower rate
    config.nba_collector.seasons = ["2023-24", "2022-23"]  # Multiple seasons
    config.nba_collector.include_historical = True
    
    # Customize validation
    config.validation.strict_mode = True
    config.validation.quality_thresholds = {
        "high": 0.95,
        "medium": 0.8,
        "low": 0.6
    }
    
    # Customize storage
    config.storage.retention_days = 180  # 6 months retention
    config.storage.batch_size = 500  # Smaller batches
    
    print(f"Custom configuration created:")
    print(f"  Pipeline name: {config.pipeline_name}")
    print(f"  NBA rate limit: {config.nba_collector.rate_limit}")
    print(f"  Seasons: {config.nba_collector.seasons}")
    print(f"  Retention days: {config.storage.retention_days}")
    
    # Use custom configuration
    orchestrator = NBADataPipelineOrchestrator(config)
    await orchestrator.initialize()
    
    result = await orchestrator.run_single_collection()
    print(f"Custom pipeline result: {result['records_collected']} records")


async def example_error_handling():
    """Example: Demonstrate error handling."""
    print("\\n=== Error Handling Example ===")
    
    # Create configuration with invalid settings to trigger errors
    config = get_config("development")
    
    # Disable API key for betting odds to trigger validation error
    config.betting_odds_collector.api_key = None
    config.betting_odds_collector.enabled = True
    
    orchestrator = NBADataPipelineOrchestrator(config)
    
    try:
        await orchestrator.initialize()
        result = await orchestrator.run_single_collection()
        
        print(f"Collection completed with errors:")
        print(f"  Records collected: {result['records_collected']}")
        print(f"  Errors: {result['errors']}")
        
        # Check health status
        health = await orchestrator.get_pipeline_health()
        print(f"  Error count: {health['metrics']['error_count']}")
        
    except Exception as e:
        print(f"Pipeline initialization failed (expected): {e}")


async def example_monitoring_and_health():
    """Example: Monitor pipeline health and performance."""
    print("\\n=== Monitoring and Health Example ===")
    
    config = get_config("development")
    config.monitoring.metrics_collection = True
    
    orchestrator = NBADataPipelineOrchestrator(config)
    await orchestrator.initialize()
    
    # Run multiple collections to generate metrics
    for i in range(3):
        print(f"Running collection {i+1}/3...")
        await orchestrator.run_single_collection()
        await asyncio.sleep(1)  # Small delay between runs
    
    # Get comprehensive health status
    health = await orchestrator.get_pipeline_health()
    
    print(f"\\nPipeline Health Report:")
    print(f"  Status: {health['pipeline_status']}")
    print(f"  Runs completed: {health['metrics']['runs_completed']}")
    print(f"  Total records processed: {health['metrics']['total_records_processed']}")
    print(f"  Average run duration: {health['metrics']['average_run_duration']:.2f}s")
    print(f"  Error count: {health['metrics']['error_count']}")
    print(f"  Last run: {health['metrics']['last_run_time']}")
    
    # Storage statistics
    if 'storage' in health:
        storage_stats = health['storage']
        print(f"\\nStorage Statistics:")
        print(f"  Total files: {storage_stats['total_files']}")
        print(f"  Total size: {storage_stats['total_size_bytes']} bytes")
        print(f"  Records in buffer: {storage_stats['records_in_buffer']}")


async def main():
    """Run all examples."""
    print("NBA Data Collection and Preprocessing Examples")
    print("=" * 50)
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    try:
        # Run examples
        await example_single_collection()
        await example_playoff_collection()
        await example_specific_source_collection()
        await example_data_querying()
        await example_custom_configuration()
        await example_error_handling()
        await example_monitoring_and_health()
        
        print("\\n" + "=" * 50)
        print("All examples completed successfully!")
        
    except Exception as e:
        print(f"\\nExample execution failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())

