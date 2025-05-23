"""
Configuration for the data storage layer.

This module provides configuration templates for different types of storage systems.
"""

# Relational database storage configuration template
RELATIONAL_DB_CONFIG_TEMPLATE = {
    "db_type": "",  # mysql, postgresql, sqlite, oracle, etc.
    "host": "",
    "port": 0,
    "database": "",
    "username": "",
    "password": "",
    "connection_pool_size": 5,
    "default_table": "",
    "default_if_exists": "append",  # append, replace, fail
    "default_query": "",
    "timeout": 30,
}

# NoSQL database storage configuration template
NOSQL_DB_CONFIG_TEMPLATE = {
    "db_type": "",  # mongodb, dynamodb, cassandra, etc.
    "host": "",
    "port": 0,
    "database": "",
    "username": "",
    "password": "",
    "default_collection": "",
    "timeout": 30,
}

# Data warehouse storage configuration template
DATA_WAREHOUSE_CONFIG_TEMPLATE = {
    "warehouse_type": "",  # snowflake, redshift, bigquery, etc.
    "host": "",
    "port": 0,
    "database": "",
    "username": "",
    "password": "",
    "default_schema": "",
    "default_table": "",
    "default_if_exists": "append",  # append, replace, fail
    "default_query": "",
    "timeout": 30,
}

# File system storage configuration template
FILE_SYSTEM_CONFIG_TEMPLATE = {
    "base_path": "",
    "default_file_path": "",
    "default_file_format": "csv",  # csv, json, parquet, excel, text
    "encoding": "utf-8",
    "delimiter": ",",
    "quotechar": "\"",
}

# Example configurations for different storage systems
EXAMPLE_CONFIGS = {
    "relational_db": {
        "customer_db": {
            "db_type": "postgresql",
            "host": "db.example.com",
            "port": 5432,
            "database": "customers",
            "username": "user",
            "password": "pass",
            "default_table": "customers",
            "default_if_exists": "append",
        },
        "product_db": {
            "db_type": "mysql",
            "host": "db.example.com",
            "port": 3306,
            "database": "products",
            "username": "user",
            "password": "pass",
            "default_table": "products",
            "default_if_exists": "append",
        },
    },
    "nosql_db": {
        "user_events_db": {
            "db_type": "mongodb",
            "host": "db.example.com",
            "port": 27017,
            "database": "events",
            "username": "user",
            "password": "pass",
            "default_collection": "user_events",
        },
        "sensor_data_db": {
            "db_type": "dynamodb",
            "region": "us-west-2",
            "access_key": "YOUR_ACCESS_KEY",
            "secret_key": "YOUR_SECRET_KEY",
            "default_table": "sensor_data",
        },
    },
    "data_warehouse": {
        "analytics_warehouse": {
            "warehouse_type": "snowflake",
            "account": "account.snowflakecomputing.com",
            "username": "user",
            "password": "pass",
            "database": "analytics",
            "default_schema": "public",
            "default_table": "events",
            "default_if_exists": "append",
        },
        "reporting_warehouse": {
            "warehouse_type": "redshift",
            "host": "redshift.example.com",
            "port": 5439,
            "database": "reporting",
            "username": "user",
            "password": "pass",
            "default_schema": "public",
            "default_table": "reports",
            "default_if_exists": "append",
        },
    },
    "file_system": {
        "local_storage": {
            "base_path": "/data/local",
            "default_file_path": "/data/local/data.csv",
            "default_file_format": "csv",
            "encoding": "utf-8",
            "delimiter": ",",
        },
        "s3_storage": {
            "base_path": "s3://bucket/path",
            "default_file_path": "s3://bucket/path/data.parquet",
            "default_file_format": "parquet",
            "access_key": "YOUR_ACCESS_KEY",
            "secret_key": "YOUR_SECRET_KEY",
            "region": "us-west-2",
        },
    },
}

# Schema definitions for different data types
SCHEMA_DEFINITIONS = {
    "customer": {
        "id": {"type": "integer", "primary_key": True},
        "first_name": {"type": "string", "nullable": False},
        "last_name": {"type": "string", "nullable": False},
        "email": {"type": "string", "nullable": False, "unique": True},
        "phone": {"type": "string", "nullable": True},
        "address": {"type": "string", "nullable": True},
        "city": {"type": "string", "nullable": True},
        "state": {"type": "string", "nullable": True},
        "zip_code": {"type": "string", "nullable": True},
        "country": {"type": "string", "nullable": True},
        "created_at": {"type": "datetime", "nullable": False},
        "updated_at": {"type": "datetime", "nullable": False},
    },
    "product": {
        "id": {"type": "integer", "primary_key": True},
        "name": {"type": "string", "nullable": False},
        "description": {"type": "string", "nullable": True},
        "price": {"type": "float", "nullable": False},
        "category": {"type": "string", "nullable": True},
        "inventory": {"type": "integer", "nullable": True},
        "created_at": {"type": "datetime", "nullable": False},
        "updated_at": {"type": "datetime", "nullable": False},
    },
    "order": {
        "id": {"type": "integer", "primary_key": True},
        "customer_id": {"type": "integer", "nullable": False, "foreign_key": "customer.id"},
        "order_date": {"type": "datetime", "nullable": False},
        "status": {"type": "string", "nullable": False},
        "total_amount": {"type": "float", "nullable": False},
        "shipping_address": {"type": "string", "nullable": True},
        "shipping_city": {"type": "string", "nullable": True},
        "shipping_state": {"type": "string", "nullable": True},
        "shipping_zip_code": {"type": "string", "nullable": True},
        "shipping_country": {"type": "string", "nullable": True},
        "created_at": {"type": "datetime", "nullable": False},
        "updated_at": {"type": "datetime", "nullable": False},
    },
    "order_item": {
        "id": {"type": "integer", "primary_key": True},
        "order_id": {"type": "integer", "nullable": False, "foreign_key": "order.id"},
        "product_id": {"type": "integer", "nullable": False, "foreign_key": "product.id"},
        "quantity": {"type": "integer", "nullable": False},
        "price": {"type": "float", "nullable": False},
        "created_at": {"type": "datetime", "nullable": False},
        "updated_at": {"type": "datetime", "nullable": False},
    },
    "user_event": {
        "id": {"type": "string", "primary_key": True},
        "user_id": {"type": "string", "nullable": False},
        "event_type": {"type": "string", "nullable": False},
        "event_data": {"type": "json", "nullable": True},
        "timestamp": {"type": "datetime", "nullable": False},
        "session_id": {"type": "string", "nullable": True},
        "ip_address": {"type": "string", "nullable": True},
        "user_agent": {"type": "string", "nullable": True},
    },
    "sensor_data": {
        "id": {"type": "string", "primary_key": True},
        "device_id": {"type": "string", "nullable": False},
        "timestamp": {"type": "datetime", "nullable": False},
        "temperature": {"type": "float", "nullable": True},
        "humidity": {"type": "float", "nullable": True},
        "pressure": {"type": "float", "nullable": True},
        "battery_level": {"type": "float", "nullable": True},
        "location": {"type": "json", "nullable": True},
    },
}

