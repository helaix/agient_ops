"""
Example usage of the data storage layer.

This module demonstrates how to use the data storage layer to store and retrieve
data from various storage systems.
"""

import pandas as pd
import numpy as np
import os
from storage_layer import (
    StorageManager,
    RelationalDBStorage,
    NoSQLDBStorage,
    DataWarehouseStorage,
    FileSystemStorage,
)
from config import EXAMPLE_CONFIGS

def create_sample_data():
    """Create sample data for demonstration."""
    # Create a sample DataFrame with customer data
    np.random.seed(42)
    
    # Create 100 rows of data
    n = 100
    
    # Create a DataFrame with customer data
    data = {
        "id": np.arange(1, n + 1),
        "first_name": np.random.choice(["John", "Jane", "Bob", "Alice", "David"], n),
        "last_name": np.random.choice(["Smith", "Doe", "Johnson", "Brown", "Wilson"], n),
        "email": [f"customer{i}@example.com" for i in range(1, n + 1)],
        "age": np.random.randint(18, 80, n),
        "income": np.random.normal(50000, 15000, n),
        "created_at": pd.date_range(start="2020-01-01", periods=n, freq="D"),
    }
    
    # Create a DataFrame
    df = pd.DataFrame(data)
    
    return df

def main():
    """Example usage of the data storage layer."""
    
    # Create sample data
    df = create_sample_data()
    print("Sample data:")
    print(df.head())
    
    # Initialize the storage manager
    manager = StorageManager()
    
    # Create a temporary directory for file storage
    temp_dir = os.path.join(os.getcwd(), "temp_data")
    os.makedirs(temp_dir, exist_ok=True)
    
    # Register a file system storage system
    file_config = {
        "base_path": temp_dir,
        "default_file_path": os.path.join(temp_dir, "customers.csv"),
        "default_file_format": "csv",
    }
    file_storage = FileSystemStorage(name="local_file_storage", config=file_config)
    manager.register_storage_system(file_storage)
    
    # Store data in the file system
    result = manager.store_data(df, "local_file_storage")
    print("\nStored data in file system:")
    print(result)
    
    # Retrieve data from the file system
    result = manager.retrieve_data("local_file_storage")
    print("\nRetrieved data from file system:")
    print(result["data"].head())
    
    # Store data in different formats
    formats = ["csv", "json", "parquet"]
    for fmt in formats:
        file_path = os.path.join(temp_dir, f"customers.{fmt}")
        result = manager.store_data(
            df, "local_file_storage", file_path=file_path, file_format=fmt
        )
        print(f"\nStored data in {fmt} format:")
        print(result)
    
    # Register a relational database storage system (simulated)
    db_config = EXAMPLE_CONFIGS["relational_db"]["customer_db"]
    db_storage = RelationalDBStorage(name="customer_db", config=db_config)
    manager.register_storage_system(db_storage)
    
    # Register a NoSQL database storage system (simulated)
    nosql_config = EXAMPLE_CONFIGS["nosql_db"]["user_events_db"]
    nosql_storage = NoSQLDBStorage(name="user_events_db", config=nosql_config)
    manager.register_storage_system(nosql_storage)
    
    # Register a data warehouse storage system (simulated)
    warehouse_config = EXAMPLE_CONFIGS["data_warehouse"]["analytics_warehouse"]
    warehouse_storage = DataWarehouseStorage(name="analytics_warehouse", config=warehouse_config)
    manager.register_storage_system(warehouse_storage)
    
    # List all registered storage systems
    print("\nRegistered storage systems:")
    print(manager.list_storage_systems())
    
    # Clean up
    print("\nCleaning up...")
    for fmt in formats:
        file_path = os.path.join(temp_dir, f"customers.{fmt}")
        manager.delete_data("local_file_storage", file_path=file_path)
    
    # Remove the temporary directory
    import shutil
    shutil.rmtree(temp_dir)
    print("Cleanup complete.")

if __name__ == "__main__":
    main()

