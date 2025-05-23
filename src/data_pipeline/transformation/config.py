"""
Configuration for the data transformation layer.

This module provides configuration templates for different types of transformers.
"""

# Missing value handler configuration template
MISSING_VALUE_HANDLER_CONFIG_TEMPLATE = {
    "strategy": "fill",  # drop, fill, interpolate
    "columns": [],  # List of columns to handle, empty for all columns
    "fill_value": None,  # Value to fill with (for fill strategy)
    "method": None,  # Method for filling (ffill, bfill) or interpolation (linear, polynomial, etc.)
}

# Outlier handler configuration template
OUTLIER_HANDLER_CONFIG_TEMPLATE = {
    "strategy": "clip",  # clip, remove, winsorize, iqr
    "columns": [],  # List of columns to handle, empty for all numeric columns
    "lower_quantile": 0.01,  # Lower quantile for outlier detection
    "upper_quantile": 0.99,  # Upper quantile for outlier detection
    "remove": False,  # Whether to remove outliers (for iqr strategy)
}

# Data type converter configuration template
DATA_TYPE_CONVERTER_CONFIG_TEMPLATE = {
    "conversions": {
        # "column_name": "data_type"
    },
}

# Column renamer configuration template
COLUMN_RENAMER_CONFIG_TEMPLATE = {
    "rename_map": {
        # "old_name": "new_name"
    },
}

# Column selector configuration template
COLUMN_SELECTOR_CONFIG_TEMPLATE = {
    "columns": [],  # List of columns to select
}

# Custom transformer configuration template
CUSTOM_TRANSFORMER_CONFIG_TEMPLATE = {
    "transform_fn": None,  # Custom transformation function
}

# Example configurations for different transformers
EXAMPLE_CONFIGS = {
    "missing_value_handler": {
        "numeric_fill_mean": {
            "strategy": "fill",
            "columns": ["temperature", "humidity", "pressure"],
        },
        "categorical_fill_mode": {
            "strategy": "fill",
            "columns": ["category", "status", "region"],
        },
        "drop_incomplete_rows": {
            "strategy": "drop",
            "columns": ["id", "name", "value"],
        },
    },
    "outlier_handler": {
        "clip_extreme_values": {
            "strategy": "clip",
            "columns": ["price", "quantity", "rating"],
            "lower_quantile": 0.01,
            "upper_quantile": 0.99,
        },
        "remove_outliers": {
            "strategy": "remove",
            "columns": ["age", "income", "score"],
            "lower_quantile": 0.05,
            "upper_quantile": 0.95,
        },
        "iqr_method": {
            "strategy": "iqr",
            "columns": ["height", "weight", "bmi"],
            "remove": True,
        },
    },
    "data_type_converter": {
        "convert_to_numeric": {
            "conversions": {
                "price": "float",
                "quantity": "int",
                "is_active": "bool",
            },
        },
        "convert_to_datetime": {
            "conversions": {
                "created_at": "datetime64[ns]",
                "updated_at": "datetime64[ns]",
            },
        },
    },
    "column_renamer": {
        "standardize_column_names": {
            "rename_map": {
                "First Name": "first_name",
                "Last Name": "last_name",
                "Email Address": "email",
                "Phone Number": "phone",
            },
        },
        "shorten_column_names": {
            "rename_map": {
                "customer_identifier": "cust_id",
                "transaction_date": "tx_date",
                "product_category": "prod_cat",
            },
        },
    },
    "column_selector": {
        "select_demographic_columns": {
            "columns": ["age", "gender", "income", "education", "region"],
        },
        "select_transaction_columns": {
            "columns": ["tx_id", "tx_date", "amount", "currency", "status"],
        },
    },
}

# Example pipeline configurations
EXAMPLE_PIPELINE_CONFIGS = {
    "customer_data_pipeline": [
        {
            "type": "ColumnRenamer",
            "name": "standardize_column_names",
            "config": EXAMPLE_CONFIGS["column_renamer"]["standardize_column_names"],
        },
        {
            "type": "DataTypeConverter",
            "name": "convert_to_proper_types",
            "config": {
                "conversions": {
                    "age": "int",
                    "income": "float",
                    "signup_date": "datetime64[ns]",
                    "is_active": "bool",
                },
            },
        },
        {
            "type": "MissingValueHandler",
            "name": "handle_missing_values",
            "config": {
                "strategy": "fill",
                "columns": ["age", "income", "region"],
            },
        },
        {
            "type": "OutlierHandler",
            "name": "handle_outliers",
            "config": {
                "strategy": "clip",
                "columns": ["age", "income"],
                "lower_quantile": 0.01,
                "upper_quantile": 0.99,
            },
        },
    ],
    "sensor_data_pipeline": [
        {
            "type": "ColumnSelector",
            "name": "select_relevant_columns",
            "config": {
                "columns": ["timestamp", "device_id", "temperature", "humidity", "pressure"],
            },
        },
        {
            "type": "DataTypeConverter",
            "name": "convert_types",
            "config": {
                "conversions": {
                    "timestamp": "datetime64[ns]",
                    "temperature": "float",
                    "humidity": "float",
                    "pressure": "float",
                },
            },
        },
        {
            "type": "MissingValueHandler",
            "name": "interpolate_missing_values",
            "config": {
                "strategy": "interpolate",
                "columns": ["temperature", "humidity", "pressure"],
                "method": "linear",
            },
        },
        {
            "type": "OutlierHandler",
            "name": "handle_sensor_outliers",
            "config": {
                "strategy": "iqr",
                "columns": ["temperature", "humidity", "pressure"],
                "remove": False,
            },
        },
    ],
}

