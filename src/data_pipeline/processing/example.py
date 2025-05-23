"""
Example usage of the data processing layer.

This module demonstrates how to use the data processing layer to process data
in batch and streaming modes.
"""

import pandas as pd
import numpy as np
import time
import threading
from processing_layer import (
    ProcessingManager,
    BatchProcessor,
    StreamProcessor,
    DataAggregator,
    DataFilter,
    DataJoiner,
    DataEnricher,
    WindowedAggregator,
)
from config import EXAMPLE_CONFIGS

def create_sample_data():
    """Create sample data for demonstration."""
    # Create a sample DataFrame with order data
    np.random.seed(42)
    
    # Create 1000 rows of data
    n = 1000
    
    # Create a DataFrame with order data
    data = {
        "order_id": np.arange(1, n + 1),
        "customer_id": np.random.randint(1, 101, n),
        "product_id": np.random.randint(1, 51, n),
        "quantity": np.random.randint(1, 11, n),
        "price": np.random.uniform(10, 1000, n).round(2),
        "date": pd.date_range(start="2023-01-01", periods=n, freq="H"),
        "status": np.random.choice(["completed", "pending", "cancelled"], n, p=[0.8, 0.1, 0.1]),
    }
    
    # Create a DataFrame
    df = pd.DataFrame(data)
    
    # Calculate revenue
    df["revenue"] = df["quantity"] * df["price"]
    
    return df

def create_product_data():
    """Create sample product data for demonstration."""
    # Create a sample DataFrame with product data
    np.random.seed(42)
    
    # Create 50 products
    n = 50
    
    # Create a DataFrame with product data
    data = {
        "id": np.arange(1, n + 1),
        "name": [f"Product {i}" for i in range(1, n + 1)],
        "category_id": np.random.randint(1, 11, n),
        "price": np.random.uniform(10, 1000, n).round(2),
    }
    
    # Create a DataFrame
    df = pd.DataFrame(data)
    
    return df

def generate_stream_data():
    """Generate streaming data for demonstration."""
    # Generate a stream of user events
    np.random.seed(42)
    
    while True:
        # Generate a random event
        event = {
            "event_id": np.random.randint(1, 1000000),
            "user_id": np.random.randint(1, 101),
            "event_type": np.random.choice(["page_view", "click", "purchase"], p=[0.7, 0.2, 0.1]),
            "event_time": time.time(),
            "value": np.random.uniform(0, 100).round(2),
        }
        
        yield event
        
        # Sleep for a random time
        time.sleep(np.random.uniform(0.1, 0.5))

def custom_enrichment_function(df):
    """Custom enrichment function for demonstration."""
    # Add a new column with the revenue per item
    df["revenue_per_item"] = df["revenue"] / df["quantity"]
    
    # Add a new column with the day of week
    df["day_of_week"] = df["date"].dt.day_name()
    
    return df

def main():
    """Example usage of the data processing layer."""
    
    # Create sample data
    orders_df = create_sample_data()
    products_df = create_product_data()
    
    print("Sample order data:")
    print(orders_df.head())
    
    print("\nSample product data:")
    print(products_df.head())
    
    # Initialize the processing manager
    manager = ProcessingManager()
    
    # Create a batch processing pipeline
    batch_pipeline = manager.create_pipeline("sales_processing", mode="batch")
    
    # Add processors to the pipeline
    
    # 1. Filter valid orders
    filter_config = {
        "filter_expr": "status == 'completed'",
    }
    batch_pipeline.add_processor(DataFilter(name="filter_valid_orders", config=filter_config))
    
    # 2. Join with products
    joiner_config = {
        "right": products_df,
        "how": "inner",
        "left_on": "product_id",
        "right_on": "id",
    }
    batch_pipeline.add_processor(DataJoiner(name="join_with_products", config=joiner_config))
    
    # 3. Enrich with additional data
    enricher_config = {
        "enrichment_fn": custom_enrichment_function,
    }
    batch_pipeline.add_processor(DataEnricher(name="enrich_data", config=enricher_config))
    
    # 4. Aggregate by date and product
    aggregator_config = {
        "group_by": ["date", "product_id", "name"],
        "aggregations": {
            "quantity": "sum",
            "revenue": "sum",
            "revenue_per_item": "mean",
        },
    }
    batch_pipeline.add_processor(DataAggregator(name="aggregate_sales", config=aggregator_config))
    
    # Process the data
    result = manager.process(orders_df, "sales_processing")
    
    print("\nProcessed data:")
    print(result.head())
    
    # Create a streaming pipeline
    stream_pipeline = manager.create_pipeline("user_event_stream", mode="stream")
    
    # Add processors to the pipeline
    
    # 1. Filter relevant events
    filter_config = {
        "filter_expr": "event_type in ['page_view', 'click', 'purchase']",
    }
    stream_pipeline.add_processor(DataFilter(name="filter_relevant_events", config=filter_config))
    
    # 2. Windowed aggregation
    window_config = EXAMPLE_CONFIGS["windowed_aggregator"]["real_time_metrics"]
    stream_pipeline.add_processor(WindowedAggregator(name="aggregate_events", config=window_config))
    
    # Start the streaming pipeline
    manager.start_pipeline("user_event_stream")
    
    # Simulate sending events to the pipeline
    def send_events():
        stream = generate_stream_data()
        for i, event in enumerate(stream):
            if i >= 100:  # Send 100 events
                break
            
            # Process the event
            manager.process(event, "user_event_stream")
    
    # Start sending events in a separate thread
    event_thread = threading.Thread(target=send_events)
    event_thread.daemon = True
    event_thread.start()
    
    # Wait for the events to be processed
    print("\nProcessing streaming events...")
    time.sleep(10)
    
    # Stop the streaming pipeline
    manager.stop_pipeline("user_event_stream")
    
    print("\nStreaming pipeline stopped.")
    
    # List all pipelines
    print("\nAvailable pipelines:")
    print(manager.list_pipelines())
    
    # List processors in the batch pipeline
    print("\nProcessors in sales_processing pipeline:")
    print(batch_pipeline.list_processors())
    
    # List processors in the streaming pipeline
    print("\nProcessors in user_event_stream pipeline:")
    print(stream_pipeline.list_processors())

if __name__ == "__main__":
    main()

