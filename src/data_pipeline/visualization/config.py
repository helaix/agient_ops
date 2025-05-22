"""
Configuration for the data visualization layer.

This module provides configuration templates for different types of visualizations.
"""

# Line chart configuration template
LINE_CHART_CONFIG_TEMPLATE = {
    "x": "",
    "y": "",
    "title": "",
    "color": None,
}

# Bar chart configuration template
BAR_CHART_CONFIG_TEMPLATE = {
    "x": "",
    "y": "",
    "title": "",
    "color": None,
    "orientation": "v",  # v for vertical, h for horizontal
}

# Scatter plot configuration template
SCATTER_PLOT_CONFIG_TEMPLATE = {
    "x": "",
    "y": "",
    "title": "",
    "color": None,
    "size": None,
}

# Pie chart configuration template
PIE_CHART_CONFIG_TEMPLATE = {
    "labels": "",
    "values": "",
    "title": "",
}

# Heatmap configuration template
HEATMAP_CONFIG_TEMPLATE = {
    "x": "",
    "y": "",
    "z": "",
    "title": "",
}

# Table configuration template
TABLE_CONFIG_TEMPLATE = {
    "columns": None,
    "title": "",
}

# Dashboard configuration template
DASHBOARD_CONFIG_TEMPLATE = {
    "layout": "grid",  # grid, fixed, etc.
    "title": "",
    "description": "",
}

# Example configurations for different visualizations
EXAMPLE_CONFIGS = {
    "line_chart": {
        "sales_over_time": {
            "x": "date",
            "y": "sales",
            "title": "Sales Over Time",
            "color": "blue",
        },
        "temperature_trend": {
            "x": "timestamp",
            "y": "temperature",
            "title": "Temperature Trend",
            "color": "red",
        },
    },
    "bar_chart": {
        "sales_by_category": {
            "x": "category",
            "y": "sales",
            "title": "Sales by Category",
            "color": "category",
        },
        "revenue_by_product": {
            "x": "product",
            "y": "revenue",
            "title": "Revenue by Product",
            "orientation": "h",
        },
    },
    "scatter_plot": {
        "price_vs_rating": {
            "x": "price",
            "y": "rating",
            "title": "Price vs. Rating",
            "color": "category",
            "size": "sales",
        },
        "age_vs_income": {
            "x": "age",
            "y": "income",
            "title": "Age vs. Income",
            "color": "education",
        },
    },
    "pie_chart": {
        "sales_distribution": {
            "labels": "category",
            "values": "sales",
            "title": "Sales Distribution by Category",
        },
        "customer_segments": {
            "labels": "segment",
            "values": "count",
            "title": "Customer Segments",
        },
    },
    "heatmap": {
        "sales_by_day_and_hour": {
            "x": "hour",
            "y": "day",
            "z": "sales",
            "title": "Sales by Day and Hour",
        },
        "correlation_matrix": {
            "x": "variable1",
            "y": "variable2",
            "z": "correlation",
            "title": "Correlation Matrix",
        },
    },
    "table": {
        "top_products": {
            "columns": ["product", "sales", "revenue", "profit"],
            "title": "Top Products",
        },
        "customer_details": {
            "columns": ["id", "name", "email", "last_purchase_date", "total_spend"],
            "title": "Customer Details",
        },
    },
}

# Example dashboard configurations
EXAMPLE_DASHBOARD_CONFIGS = {
    "sales_dashboard": {
        "layout": "grid",
        "title": "Sales Dashboard",
        "description": "Overview of sales performance",
        "visualizations": [
            {
                "type": "line_chart",
                "name": "sales_over_time",
                "config": EXAMPLE_CONFIGS["line_chart"]["sales_over_time"],
                "position": (0, 0),
                "size": (1, 2),
            },
            {
                "type": "bar_chart",
                "name": "sales_by_category",
                "config": EXAMPLE_CONFIGS["bar_chart"]["sales_by_category"],
                "position": (1, 0),
                "size": (1, 1),
            },
            {
                "type": "pie_chart",
                "name": "sales_distribution",
                "config": EXAMPLE_CONFIGS["pie_chart"]["sales_distribution"],
                "position": (1, 1),
                "size": (1, 1),
            },
            {
                "type": "table",
                "name": "top_products",
                "config": EXAMPLE_CONFIGS["table"]["top_products"],
                "position": (2, 0),
                "size": (1, 2),
            },
        ],
    },
    "customer_dashboard": {
        "layout": "grid",
        "title": "Customer Dashboard",
        "description": "Overview of customer data",
        "visualizations": [
            {
                "type": "scatter_plot",
                "name": "age_vs_income",
                "config": EXAMPLE_CONFIGS["scatter_plot"]["age_vs_income"],
                "position": (0, 0),
                "size": (1, 1),
            },
            {
                "type": "pie_chart",
                "name": "customer_segments",
                "config": EXAMPLE_CONFIGS["pie_chart"]["customer_segments"],
                "position": (0, 1),
                "size": (1, 1),
            },
            {
                "type": "bar_chart",
                "name": "revenue_by_segment",
                "config": {
                    "x": "segment",
                    "y": "revenue",
                    "title": "Revenue by Customer Segment",
                },
                "position": (1, 0),
                "size": (1, 2),
            },
            {
                "type": "table",
                "name": "customer_details",
                "config": EXAMPLE_CONFIGS["table"]["customer_details"],
                "position": (2, 0),
                "size": (1, 2),
            },
        ],
    },
}

