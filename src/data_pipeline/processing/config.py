"""
Configuration for the data processing layer.

This module provides configuration templates for different types of processors.
"""

# Batch processor configuration template
BATCH_PROCESSOR_CONFIG_TEMPLATE = {
    "batch_size": 1000,
}

# Stream processor configuration template
STREAM_PROCESSOR_CONFIG_TEMPLATE = {
    "timeout": 10,
    "wait_for_result": False,
}

# Data aggregator configuration template
DATA_AGGREGATOR_CONFIG_TEMPLATE = {
    "group_by": [],
    "aggregations": {},
}

# Data filter configuration template
DATA_FILTER_CONFIG_TEMPLATE = {
    "filter_expr": "",
}

# Data joiner configuration template
DATA_JOINER_CONFIG_TEMPLATE = {
    "right": None,
    "how": "inner",
    "on": None,
    "left_on": None,
    "right_on": None,
}

# Data enricher configuration template
DATA_ENRICHER_CONFIG_TEMPLATE = {
    "enrichment_fn": None,
}

# Windowed aggregator configuration template
WINDOWED_AGGREGATOR_CONFIG_TEMPLATE = {
    "window_size": 60,  # Window size in seconds
    "slide_interval": 10,  # Slide interval in seconds
    "group_by": [],
    "aggregations": {},
    "timestamp_field": "timestamp",
    "max_window_items": 1000,
}

# Example configurations for different processors
EXAMPLE_CONFIGS = {
    "batch_processor": {
        "large_batch": {
            "batch_size": 10000,
        },
        "small_batch": {
            "batch_size": 100,
        },
    },
    "data_aggregator": {
        "daily_sales": {
            "group_by": ["date", "product_id"],
            "aggregations": {
                "quantity": "sum",
                "price": "mean",
                "revenue": "sum",
            },
        },
        "customer_metrics": {
            "group_by": ["customer_id"],
            "aggregations": {
                "order_count": "count",
                "total_spend": "sum",
                "average_order_value": "mean",
            },
        },
    },
    "data_filter": {
        "active_customers": {
            "filter_expr": "is_active == True",
        },
        "high_value_orders": {
            "filter_expr": "total_amount > 1000",
        },
    },
    "data_joiner": {
        "orders_with_customers": {
            "right": None,  # This would be a DataFrame in practice
            "how": "inner",
            "left_on": "customer_id",
            "right_on": "id",
        },
        "products_with_categories": {
            "right": None,  # This would be a DataFrame in practice
            "how": "left",
            "left_on": "category_id",
            "right_on": "id",
        },
    },
    "windowed_aggregator": {
        "real_time_metrics": {
            "window_size": 300,  # 5 minutes
            "slide_interval": 60,  # 1 minute
            "group_by": ["event_type"],
            "aggregations": {
                "count": "count",
                "value": "sum",
            },
            "timestamp_field": "event_time",
        },
        "sensor_readings": {
            "window_size": 3600,  # 1 hour
            "slide_interval": 300,  # 5 minutes
            "group_by": ["sensor_id"],
            "aggregations": {
                "temperature": "mean",
                "humidity": "mean",
                "pressure": "mean",
            },
            "timestamp_field": "reading_time",
        },
    },
}

# Example pipeline configurations
EXAMPLE_PIPELINE_CONFIGS = {
    "sales_processing": [
        {
            "type": "DataFilter",
            "name": "filter_valid_orders",
            "config": {
                "filter_expr": "status == 'completed'",
            },
        },
        {
            "type": "DataJoiner",
            "name": "join_with_products",
            "config": {
                "right": None,  # This would be a DataFrame in practice
                "how": "inner",
                "left_on": "product_id",
                "right_on": "id",
            },
        },
        {
            "type": "DataEnricher",
            "name": "calculate_revenue",
            "config": {
                "enrichment_fn": lambda df: df.assign(revenue=df["quantity"] * df["price"]),
            },
        },
        {
            "type": "DataAggregator",
            "name": "aggregate_by_date_and_product",
            "config": {
                "group_by": ["date", "product_id", "product_name"],
                "aggregations": {
                    "quantity": "sum",
                    "revenue": "sum",
                },
            },
        },
    ],
    "user_event_stream": [
        {
            "type": "DataFilter",
            "name": "filter_relevant_events",
            "config": {
                "filter_expr": "event_type in ['page_view', 'click', 'purchase']",
            },
        },
        {
            "type": "DataEnricher",
            "name": "enrich_with_user_data",
            "config": {
                "enrichment_fn": None,  # This would be a function in practice
            },
        },
        {
            "type": "WindowedAggregator",
            "name": "aggregate_events",
            "config": {
                "window_size": 300,  # 5 minutes
                "slide_interval": 60,  # 1 minute
                "group_by": ["user_id", "event_type"],
                "aggregations": {
                    "count": "count",
                },
                "timestamp_field": "event_time",
            },
        },
    ],
}

