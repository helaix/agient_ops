"""
Configuration for the data ingestion layer.

This module provides configuration templates for different types of data sources.
"""

# REST API source configuration template
REST_API_CONFIG_TEMPLATE = {
    "base_url": "",
    "auth_type": "none",  # none, basic, token, oauth
    "username": "",
    "password": "",
    "token": "",
    "headers": {},
    "default_endpoint": "",
    "timeout": 30,
    "retry_attempts": 3,
    "retry_backoff": 2,
}

# Database source configuration template
DATABASE_CONFIG_TEMPLATE = {
    "db_type": "",  # mysql, postgresql, sqlite, oracle, etc.
    "host": "",
    "port": 0,
    "database": "",
    "username": "",
    "password": "",
    "connection_pool_size": 5,
    "default_query": "",
    "timeout": 30,
}

# File system source configuration template
FILE_SYSTEM_CONFIG_TEMPLATE = {
    "base_path": "",
    "default_file_path": "",
    "default_file_format": "csv",
    "encoding": "utf-8",
    "delimiter": ",",
    "quotechar": "\"",
    "file_pattern": "*.csv",
}

# Streaming source configuration template
STREAMING_CONFIG_TEMPLATE = {
    "platform": "",  # kafka, kinesis, pubsub, etc.
    "bootstrap_servers": [],
    "default_topic": "",
    "group_id": "",
    "auto_offset_reset": "latest",
    "default_batch_size": 100,
    "consumer_timeout_ms": 5000,
}

# Example configurations for different data sources
EXAMPLE_CONFIGS = {
    "rest_api": {
        "weather_api": {
            "base_url": "https://api.weather.com",
            "auth_type": "token",
            "token": "YOUR_API_KEY",
            "default_endpoint": "/forecast",
            "timeout": 10,
        },
        "stock_api": {
            "base_url": "https://api.stock.com",
            "auth_type": "basic",
            "username": "user",
            "password": "pass",
            "default_endpoint": "/quotes",
            "timeout": 5,
        },
    },
    "database": {
        "customer_db": {
            "db_type": "postgresql",
            "host": "db.example.com",
            "port": 5432,
            "database": "customers",
            "username": "user",
            "password": "pass",
            "default_query": "SELECT * FROM customers LIMIT 100",
        },
        "product_db": {
            "db_type": "mysql",
            "host": "db.example.com",
            "port": 3306,
            "database": "products",
            "username": "user",
            "password": "pass",
            "default_query": "SELECT * FROM products LIMIT 100",
        },
    },
    "file_system": {
        "sales_data": {
            "base_path": "/data/sales",
            "default_file_path": "/data/sales/daily.csv",
            "default_file_format": "csv",
            "delimiter": ",",
            "file_pattern": "*.csv",
        },
        "log_data": {
            "base_path": "/data/logs",
            "default_file_path": "/data/logs/app.log",
            "default_file_format": "text",
            "encoding": "utf-8",
            "file_pattern": "*.log",
        },
    },
    "streaming": {
        "user_events": {
            "platform": "kafka",
            "bootstrap_servers": ["kafka1:9092", "kafka2:9092"],
            "default_topic": "user-events",
            "group_id": "data-pipeline",
            "default_batch_size": 1000,
        },
        "sensor_data": {
            "platform": "kinesis",
            "region": "us-west-2",
            "stream_name": "sensor-data",
            "default_batch_size": 500,
        },
    },
}

