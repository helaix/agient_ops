"""
Example usage of the data ingestion layer.

This module demonstrates how to use the data ingestion layer to ingest data from
different sources.
"""

from ingestion_layer import (
    DataIngestionManager,
    RESTAPISource,
    DatabaseSource,
    FileSystemSource,
    StreamingSource,
)
from config import EXAMPLE_CONFIGS

def main():
    """Example usage of the data ingestion layer."""
    
    # Initialize the data ingestion manager
    manager = DataIngestionManager()
    
    # Register a REST API source
    rest_api_config = EXAMPLE_CONFIGS["rest_api"]["weather_api"]
    rest_api_source = RESTAPISource(name="weather_api", config=rest_api_config)
    manager.register_source(rest_api_source)
    
    # Register a database source
    db_config = EXAMPLE_CONFIGS["database"]["customer_db"]
    db_source = DatabaseSource(name="customer_db", config=db_config)
    manager.register_source(db_source)
    
    # Register a file system source
    fs_config = EXAMPLE_CONFIGS["file_system"]["sales_data"]
    fs_source = FileSystemSource(name="sales_data", config=fs_config)
    manager.register_source(fs_source)
    
    # Register a streaming source
    streaming_config = EXAMPLE_CONFIGS["streaming"]["user_events"]
    streaming_source = StreamingSource(name="user_events", config=streaming_config)
    manager.register_source(streaming_source)
    
    # List all registered sources
    print("Registered sources:", manager.list_sources())
    
    # Ingest data from a specific source
    weather_data = manager.ingest_data(
        source_name="weather_api",
        endpoint="/forecast",
        params={"city": "New York", "days": 5}
    )
    print("Weather data:", weather_data)
    
    # Ingest data from all sources
    all_data = manager.ingest_from_all()
    for source_name, data in all_data.items():
        print(f"Data from {source_name}:", data)

if __name__ == "__main__":
    main()

