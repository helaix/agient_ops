# Data Pipeline Setup Guide

This document provides detailed instructions for setting up the data pipeline architecture, including installation, configuration, and initial usage.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Initial Setup](#initial-setup)
5. [Verification](#verification)
6. [Next Steps](#next-steps)

## Prerequisites

Before setting up the data pipeline, ensure that you have the following prerequisites:

### System Requirements

- **Operating System**: Linux, macOS, or Windows
- **CPU**: 2+ cores recommended
- **Memory**: 4+ GB RAM recommended
- **Disk Space**: 1+ GB free space recommended

### Software Requirements

- **Python**: Python 3.8 or higher
- **pip**: Python package manager
- **Git**: Version control system (optional, for cloning the repository)
- **Virtual Environment**: Python virtual environment tool (recommended)

### Access Requirements

- **Data Sources**: Access credentials for the data sources
- **Storage Systems**: Access credentials for the storage systems
- **Network Access**: Network access to the data sources and storage systems

## Installation

### Step 1: Clone the Repository (Optional)

If you have Git installed, you can clone the repository:

```bash
git clone https://github.com/your-organization/data-pipeline.git
cd data-pipeline
```

Alternatively, you can download the source code as a ZIP file and extract it.

### Step 2: Create a Virtual Environment (Recommended)

It is recommended to create a virtual environment to isolate the dependencies:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies

Install the required dependencies:

```bash
pip install -r requirements.txt
```

If you don't have a `requirements.txt` file, you can install the dependencies manually:

```bash
pip install pandas numpy requests sqlalchemy pymongo boto3 matplotlib seaborn plotly
```

### Step 4: Install the Package (Optional)

If you want to install the package in development mode:

```bash
pip install -e .
```

## Configuration

### Step 1: Create Configuration Files

Create configuration files for each component of the data pipeline. You can use the templates provided in the `config` directory of each component.

#### Ingestion Layer Configuration

Create a configuration file for the ingestion layer:

```python
# config/ingestion_config.py

# REST API data source configuration
rest_api_config = {
    "url": "https://api.example.com/data",
    "method": "GET",
    "headers": {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    "params": {
        "limit": 100,
        "offset": 0,
    },
    "timeout": 30,
}

# Database data source configuration
database_config = {
    "db_type": "postgresql",
    "host": "db.example.com",
    "port": 5432,
    "database": "source_db",
    "username": "user",
    "password": "pass",
    "query": "SELECT * FROM source_table",
    "timeout": 30,
}

# File system data source configuration
file_system_config = {
    "file_path": "/path/to/data.csv",
    "file_format": "csv",
    "delimiter": ",",
    "encoding": "utf-8",
}

# Streaming data source configuration
streaming_config = {
    "stream_type": "kafka",
    "bootstrap_servers": "kafka.example.com:9092",
    "topic": "data_topic",
    "group_id": "data_pipeline",
    "auto_offset_reset": "latest",
}
```

#### Transformation Layer Configuration

Create a configuration file for the transformation layer:

```python
# config/transformation_config.py

# Missing value handler configuration
missing_value_config = {
    "strategy": "fill",
    "columns": ["age", "income", "education"],
}

# Outlier handler configuration
outlier_config = {
    "strategy": "clip",
    "columns": ["age", "income"],
    "lower_quantile": 0.01,
    "upper_quantile": 0.99,
}

# Data type converter configuration
data_type_config = {
    "conversions": {
        "age": "int",
        "income": "float",
        "is_active": "bool",
    }
}

# Column renamer configuration
column_rename_config = {
    "renames": {
        "first_name": "first",
        "last_name": "last",
        "email_address": "email",
    }
}

# Column selector configuration
column_select_config = {
    "columns": ["first", "last", "email", "age", "income", "is_active"],
}
```

#### Storage Layer Configuration

Create a configuration file for the storage layer:

```python
# config/storage_config.py

# Relational database storage configuration
relational_db_config = {
    "db_type": "postgresql",
    "host": "db.example.com",
    "port": 5432,
    "database": "target_db",
    "username": "user",
    "password": "pass",
    "default_table": "target_table",
    "default_if_exists": "append",
}

# NoSQL database storage configuration
nosql_db_config = {
    "db_type": "mongodb",
    "host": "mongodb.example.com",
    "port": 27017,
    "database": "target_db",
    "username": "user",
    "password": "pass",
    "default_collection": "target_collection",
}

# Data warehouse storage configuration
data_warehouse_config = {
    "warehouse_type": "snowflake",
    "account": "account.snowflakecomputing.com",
    "username": "user",
    "password": "pass",
    "database": "target_db",
    "default_schema": "public",
    "default_table": "target_table",
    "default_if_exists": "append",
}

# File system storage configuration
file_system_config = {
    "base_path": "/path/to/target",
    "default_file_path": "/path/to/target/data.csv",
    "default_file_format": "csv",
    "encoding": "utf-8",
    "delimiter": ",",
}
```

#### Processing Layer Configuration

Create a configuration file for the processing layer:

```python
# config/processing_config.py

# Data aggregator configuration
data_aggregator_config = {
    "group_by": ["date", "product_id"],
    "aggregations": {
        "quantity": "sum",
        "price": "mean",
        "revenue": "sum",
    },
}

# Data filter configuration
data_filter_config = {
    "filter_expr": "status == 'completed'",
}

# Data joiner configuration
data_joiner_config = {
    "right": None,  # This would be a DataFrame in practice
    "how": "inner",
    "left_on": "product_id",
    "right_on": "id",
}

# Windowed aggregator configuration
windowed_aggregator_config = {
    "window_size": 300,  # 5 minutes
    "slide_interval": 60,  # 1 minute
    "group_by": ["event_type"],
    "aggregations": {
        "count": "count",
        "value": "sum",
    },
    "timestamp_field": "event_time",
}
```

#### Visualization Layer Configuration

Create a configuration file for the visualization layer:

```python
# config/visualization_config.py

# Line chart configuration
line_chart_config = {
    "x": "date",
    "y": "sales",
    "title": "Sales Over Time",
    "color": "blue",
}

# Bar chart configuration
bar_chart_config = {
    "x": "category",
    "y": "sales",
    "title": "Sales by Category",
    "color": "category",
}

# Scatter plot configuration
scatter_plot_config = {
    "x": "price",
    "y": "rating",
    "title": "Price vs. Rating",
    "color": "category",
    "size": "sales",
}

# Pie chart configuration
pie_chart_config = {
    "labels": "category",
    "values": "sales",
    "title": "Sales Distribution by Category",
}

# Heatmap configuration
heatmap_config = {
    "x": "hour",
    "y": "day",
    "z": "sales",
    "title": "Sales by Day and Hour",
}

# Table configuration
table_config = {
    "columns": ["product", "sales", "revenue", "profit"],
    "title": "Top Products",
}

# Dashboard configuration
dashboard_config = {
    "layout": "grid",
    "title": "Sales Dashboard",
    "description": "Overview of sales performance",
}
```

### Step 2: Configure Environment Variables (Optional)

For sensitive configuration such as credentials, it is recommended to use environment variables:

```bash
# On Windows:
set DB_USERNAME=your_username
set DB_PASSWORD=your_password

# On macOS/Linux:
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
```

You can also use a `.env` file with a package like `python-dotenv`:

```
# .env file
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

```python
# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Access environment variables
import os
db_username = os.environ.get('DB_USERNAME')
db_password = os.environ.get('DB_PASSWORD')
```

## Initial Setup

### Step 1: Create the Directory Structure

Create the directory structure for the data pipeline:

```bash
mkdir -p data/raw data/processed data/output logs config
```

### Step 2: Set Up Logging

Set up logging for the data pipeline:

```python
# setup_logging.py
import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logging(log_dir='logs', log_level=logging.INFO):
    """
    Set up logging for the data pipeline.
    
    Args:
        log_dir: Directory to store log files
        log_level: Logging level
    """
    # Create the log directory if it doesn't exist
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure the root logger
    logger = logging.getLogger()
    logger.setLevel(log_level)
    
    # Create a formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Create a file handler for all logs
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'data_pipeline.log'),
        maxBytes=10*1024*1024,  # 10 MB
        backupCount=5
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Create a file handler for errors
    error_handler = RotatingFileHandler(
        os.path.join(log_dir, 'error.log'),
        maxBytes=10*1024*1024,  # 10 MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)
    logger.addHandler(error_handler)
    
    # Create a console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger

# Set up logging
logger = setup_logging()
```

### Step 3: Initialize the Components

Initialize the components of the data pipeline:

```python
# initialize.py
from data_pipeline.ingestion import DataIngestionManager
from data_pipeline.transformation import TransformationManager
from data_pipeline.storage import StorageManager
from data_pipeline.processing import ProcessingManager
from data_pipeline.visualization import DashboardManager

def initialize_pipeline():
    """
    Initialize the data pipeline components.
    
    Returns:
        Dictionary containing the initialized components
    """
    # Initialize the managers
    ingestion_manager = DataIngestionManager()
    transformation_manager = TransformationManager()
    storage_manager = StorageManager()
    processing_manager = ProcessingManager()
    dashboard_manager = DashboardManager()
    
    # Return the initialized components
    return {
        "ingestion_manager": ingestion_manager,
        "transformation_manager": transformation_manager,
        "storage_manager": storage_manager,
        "processing_manager": processing_manager,
        "dashboard_manager": dashboard_manager,
    }

# Initialize the pipeline
pipeline_components = initialize_pipeline()
```

## Verification

### Step 1: Verify the Installation

Verify that the data pipeline is installed correctly:

```python
# verify_installation.py
import importlib

def verify_installation():
    """
    Verify that the data pipeline is installed correctly.
    
    Returns:
        True if the installation is verified, False otherwise
    """
    # List of modules to verify
    modules = [
        'data_pipeline.ingestion',
        'data_pipeline.transformation',
        'data_pipeline.storage',
        'data_pipeline.processing',
        'data_pipeline.visualization',
    ]
    
    # Verify each module
    for module_name in modules:
        try:
            module = importlib.import_module(module_name)
            print(f"Module {module_name} is installed correctly.")
        except ImportError as e:
            print(f"Error importing module {module_name}: {str(e)}")
            return False
    
    return True

# Verify the installation
is_verified = verify_installation()
print(f"Installation verification: {'Passed' if is_verified else 'Failed'}")
```

### Step 2: Run a Simple Pipeline

Run a simple pipeline to verify that the components work together:

```python
# run_simple_pipeline.py
import pandas as pd
from data_pipeline.ingestion import DataIngestionManager, FileSystemSource
from data_pipeline.transformation import TransformationManager, MissingValueHandler
from data_pipeline.storage import StorageManager, FileSystemStorage

def run_simple_pipeline():
    """
    Run a simple pipeline to verify that the components work together.
    """
    # Create sample data
    data = {
        'id': [1, 2, 3, 4, 5],
        'name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
        'age': [25, 30, None, 40, 35],
        'income': [50000, None, 70000, 80000, 65000],
    }
    df = pd.DataFrame(data)
    
    # Save the sample data to a CSV file
    df.to_csv('data/raw/sample.csv', index=False)
    
    # Initialize the managers
    ingestion_manager = DataIngestionManager()
    transformation_manager = TransformationManager()
    storage_manager = StorageManager()
    
    # Create a data source
    file_source = FileSystemSource(name="sample_source", config={
        "file_path": "data/raw/sample.csv",
        "file_format": "csv",
    })
    
    # Register the data source
    ingestion_manager.register_source(file_source)
    
    # Ingest data
    ingested_data = ingestion_manager.ingest("sample_source")
    print("Ingested data:")
    print(ingested_data.head())
    
    # Create a transformation pipeline
    pipeline = transformation_manager.create_pipeline("sample_pipeline")
    
    # Add transformers to the pipeline
    pipeline.add_transformer(MissingValueHandler(name="handle_missing_values", config={
        "strategy": "fill",
        "columns": ["age", "income"],
    }))
    
    # Transform the data
    transformed_data = transformation_manager.transform(ingested_data, "sample_pipeline")
    print("Transformed data:")
    print(transformed_data.head())
    
    # Create a storage system
    file_storage = FileSystemStorage(name="sample_storage", config={
        "base_path": "data/processed",
        "default_file_path": "data/processed/sample_processed.csv",
        "default_file_format": "csv",
    })
    
    # Register the storage system
    storage_manager.register_storage_system(file_storage)
    
    # Store the data
    result = storage_manager.store_data(transformed_data, "sample_storage")
    print("Storage result:")
    print(result)
    
    print("Simple pipeline completed successfully.")

# Run the simple pipeline
run_simple_pipeline()
```

## Next Steps

After setting up the data pipeline, you can:

1. **Configure Data Sources**: Configure the data sources for your specific use case
2. **Define Transformations**: Define the transformations needed for your data
3. **Set Up Storage**: Set up the storage systems for your processed data
4. **Implement Processing**: Implement the processing workflows for your data
5. **Create Visualizations**: Create visualizations and dashboards for your data
6. **Schedule Jobs**: Schedule jobs to run the pipeline automatically
7. **Monitor Performance**: Set up monitoring for the pipeline performance
8. **Implement Error Handling**: Implement error handling for the pipeline
9. **Document Usage**: Document how to use the pipeline for your team
10. **Train Users**: Train users on how to use the pipeline

