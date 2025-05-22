# Data Pipeline

A comprehensive framework for ingesting, transforming, storing, processing, and visualizing data from various sources.

## Overview

The data pipeline is designed to be modular, extensible, and configurable to meet a wide range of data processing needs. It consists of five main components:

1. **Ingestion Layer**: Responsible for ingesting data from various sources
2. **Transformation Layer**: Responsible for transforming and cleaning data
3. **Storage Layer**: Responsible for storing data in various storage systems
4. **Processing Layer**: Responsible for processing data in batch and streaming modes
5. **Visualization Layer**: Responsible for creating visualizations and dashboards

## Features

- **Data Ingestion**:
  - Support for multiple data sources (REST APIs, databases, file systems, streaming platforms)
  - Configurable ingestion parameters
  - Error handling and retry mechanisms

- **Data Transformation**:
  - Missing value handling
  - Outlier detection and treatment
  - Data type conversion
  - Column renaming and selection
  - Custom transformations
  - Pipeline architecture for chaining transformations

- **Data Storage**:
  - Support for multiple storage systems (relational databases, NoSQL databases, data warehouses, file systems)
  - Schema definition and validation
  - Schema registry for managing schemas
  - Configuration templates for different storage systems

- **Data Processing**:
  - Support for both batch and streaming data processing
  - Data aggregation
  - Data filtering
  - Data joining
  - Data enrichment
  - Windowed aggregation for streaming data
  - Pipeline architecture for chaining processors

- **Data Visualization**:
  - Support for various chart types (line charts, bar charts, scatter plots, pie charts, heatmaps, tables)
  - Dashboard system for combining multiple visualizations
  - Configuration templates for different visualization types
  - HTML export functionality for dashboards

## Installation

```bash
# Clone the repository
git clone https://github.com/your-organization/data-pipeline.git
cd data-pipeline

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install the required packages
pip install -r requirements.txt
```

## Quick Start

```python
from data_pipeline.ingestion import DataIngestionManager, RESTAPISource
from data_pipeline.transformation import TransformationManager, MissingValueHandler
from data_pipeline.storage import StorageManager, RelationalDBStorage
from data_pipeline.processing import ProcessingManager, DataAggregator
from data_pipeline.visualization import DashboardManager, LineChart

# Create managers for each component
ingestion_manager = DataIngestionManager()
transformation_manager = TransformationManager()
storage_manager = StorageManager()
processing_manager = ProcessingManager()
dashboard_manager = DashboardManager()

# Create a data source
rest_api_source = RESTAPISource(name="api_source", config={
    "url": "https://api.example.com/data",
    "method": "GET",
    "headers": {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
})

# Register the data source
ingestion_manager.register_source(rest_api_source)

# Ingest data
data = ingestion_manager.ingest("api_source")

# Create a transformation pipeline
pipeline = transformation_manager.create_pipeline("transform_pipeline")

# Add transformers to the pipeline
pipeline.add_transformer(MissingValueHandler(name="handle_missing_values", config={
    "strategy": "fill",
    "columns": ["age", "income", "education"],
}))

# Transform the data
transformed_data = transformation_manager.transform(data, "transform_pipeline")

# Create a storage system
db_storage = RelationalDBStorage(name="customer_db", config={
    "db_type": "postgresql",
    "host": "db.example.com",
    "port": 5432,
    "database": "customers",
    "username": "user",
    "password": "pass",
    "default_table": "customers",
})

# Register the storage system
storage_manager.register_storage_system(db_storage)

# Store the data
storage_manager.store_data(transformed_data, "customer_db")

# Create a processing pipeline
process_pipeline = processing_manager.create_pipeline("process_pipeline")

# Add processors to the pipeline
process_pipeline.add_processor(DataAggregator(name="aggregate_data", config={
    "group_by": ["date", "product_id"],
    "aggregations": {
        "quantity": "sum",
        "price": "mean",
        "revenue": "sum",
    },
}))

# Process the data
processed_data = processing_manager.process(transformed_data, "process_pipeline")

# Create a dashboard
dashboard = dashboard_manager.create_dashboard("sales_dashboard")

# Add visualizations to the dashboard
dashboard.add_visualization(LineChart(name="sales_chart", config={
    "x": "date",
    "y": "sales",
    "title": "Sales Over Time",
}))

# Render the dashboard
dashboard_spec = dashboard_manager.render_dashboard("sales_dashboard", {"sales_chart": processed_data})

# Save the dashboard as HTML
dashboard.save_html("sales_dashboard.html", {"sales_chart": processed_data})
```

## Documentation

For detailed documentation, see the following:

- [Setup Guide](docs/SETUP.md): Instructions for setting up the data pipeline
- [User Guide](docs/README.md): Comprehensive documentation for using the data pipeline
- [Maintenance Guide](docs/MAINTENANCE.md): Instructions for maintaining the data pipeline

## Examples

The data pipeline includes example scripts for each component in the `example.py` files. These scripts demonstrate how to use the components with sample data.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

