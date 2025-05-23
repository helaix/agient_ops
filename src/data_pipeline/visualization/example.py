"""
Example usage of the data visualization layer.

This module demonstrates how to use the data visualization layer to create
visualizations and dashboards.
"""

import pandas as pd
import numpy as np
import os
from visualization_layer import (
    DashboardManager,
    LineChart,
    BarChart,
    ScatterPlot,
    PieChart,
    Heatmap,
    Table,
)
from config import EXAMPLE_CONFIGS

def create_sample_data():
    """Create sample data for demonstration."""
    # Create a sample DataFrame with sales data
    np.random.seed(42)
    
    # Create 100 rows of data
    n = 100
    
    # Create a DataFrame with sales data
    data = {
        "date": pd.date_range(start="2023-01-01", periods=n),
        "product_id": np.random.randint(1, 11, n),
        "product_name": [f"Product {i}" for i in np.random.randint(1, 11, n)],
        "category": np.random.choice(["Electronics", "Clothing", "Food", "Books", "Home"], n),
        "sales": np.random.randint(1, 101, n),
        "revenue": np.random.uniform(100, 10000, n).round(2),
        "profit": np.random.uniform(10, 1000, n).round(2),
    }
    
    # Create a DataFrame
    df = pd.DataFrame(data)
    
    return df

def create_customer_data():
    """Create sample customer data for demonstration."""
    # Create a sample DataFrame with customer data
    np.random.seed(42)
    
    # Create 100 customers
    n = 100
    
    # Create a DataFrame with customer data
    data = {
        "id": np.arange(1, n + 1),
        "name": [f"Customer {i}" for i in range(1, n + 1)],
        "age": np.random.randint(18, 80, n),
        "income": np.random.normal(50000, 15000, n).round(2),
        "education": np.random.choice(["High School", "Bachelor", "Master", "PhD"], n),
        "segment": np.random.choice(["Low", "Medium", "High"], n, p=[0.3, 0.5, 0.2]),
        "total_spend": np.random.uniform(100, 10000, n).round(2),
        "last_purchase_date": pd.date_range(start="2023-01-01", periods=n),
    }
    
    # Create a DataFrame
    df = pd.DataFrame(data)
    
    return df

def create_heatmap_data():
    """Create sample data for a heatmap."""
    # Create a sample DataFrame for a heatmap of sales by day and hour
    np.random.seed(42)
    
    # Create data for each day of the week and each hour of the day
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    hours = list(range(24))
    
    data = []
    for day in days:
        for hour in hours:
            # Generate random sales data
            sales = np.random.randint(0, 100)
            data.append({"day": day, "hour": hour, "sales": sales})
    
    # Create a DataFrame
    df = pd.DataFrame(data)
    
    return df

def main():
    """Example usage of the data visualization layer."""
    
    # Create sample data
    sales_df = create_sample_data()
    customer_df = create_customer_data()
    heatmap_df = create_heatmap_data()
    
    print("Sample sales data:")
    print(sales_df.head())
    
    print("\nSample customer data:")
    print(customer_df.head())
    
    # Initialize the dashboard manager
    manager = DashboardManager()
    
    # Create a sales dashboard
    sales_dashboard = manager.create_dashboard("sales_dashboard", {
        "layout": "grid",
        "title": "Sales Dashboard",
        "description": "Overview of sales performance",
    })
    
    # Create visualizations for the sales dashboard
    
    # 1. Line chart of sales over time
    line_config = EXAMPLE_CONFIGS["line_chart"]["sales_over_time"]
    line_chart = LineChart(name="sales_over_time", config=line_config)
    
    # 2. Bar chart of sales by category
    bar_config = EXAMPLE_CONFIGS["bar_chart"]["sales_by_category"]
    bar_chart = BarChart(name="sales_by_category", config=bar_config)
    
    # 3. Pie chart of sales distribution
    pie_config = EXAMPLE_CONFIGS["pie_chart"]["sales_distribution"]
    pie_chart = PieChart(name="sales_distribution", config=pie_config)
    
    # 4. Table of top products
    table_config = EXAMPLE_CONFIGS["table"]["top_products"]
    table = Table(name="top_products", config=table_config)
    
    # 5. Heatmap of sales by day and hour
    heatmap_config = EXAMPLE_CONFIGS["heatmap"]["sales_by_day_and_hour"]
    heatmap = Heatmap(name="sales_by_day_and_hour", config=heatmap_config)
    
    # Add visualizations to the dashboard
    sales_dashboard.add_visualization(line_chart, position=(0, 0), size=(1, 2))
    sales_dashboard.add_visualization(bar_chart, position=(1, 0), size=(1, 1))
    sales_dashboard.add_visualization(pie_chart, position=(1, 1), size=(1, 1))
    sales_dashboard.add_visualization(table, position=(2, 0), size=(1, 2))
    sales_dashboard.add_visualization(heatmap, position=(3, 0), size=(1, 2))
    
    # Create a customer dashboard
    customer_dashboard = manager.create_dashboard("customer_dashboard", {
        "layout": "grid",
        "title": "Customer Dashboard",
        "description": "Overview of customer data",
    })
    
    # Create visualizations for the customer dashboard
    
    # 1. Scatter plot of age vs income
    scatter_config = EXAMPLE_CONFIGS["scatter_plot"]["age_vs_income"]
    scatter_plot = ScatterPlot(name="age_vs_income", config=scatter_config)
    
    # 2. Pie chart of customer segments
    segment_pie_config = EXAMPLE_CONFIGS["pie_chart"]["customer_segments"]
    segment_pie_chart = PieChart(name="customer_segments", config=segment_pie_config)
    
    # 3. Bar chart of total spend by segment
    segment_bar_config = {
        "x": "segment",
        "y": "total_spend",
        "title": "Total Spend by Customer Segment",
    }
    segment_bar_chart = BarChart(name="spend_by_segment", config=segment_bar_config)
    
    # 4. Table of customer details
    customer_table_config = EXAMPLE_CONFIGS["table"]["customer_details"]
    customer_table = Table(name="customer_details", config=customer_table_config)
    
    # Add visualizations to the dashboard
    customer_dashboard.add_visualization(scatter_plot, position=(0, 0), size=(1, 1))
    customer_dashboard.add_visualization(segment_pie_chart, position=(0, 1), size=(1, 1))
    customer_dashboard.add_visualization(segment_bar_chart, position=(1, 0), size=(1, 2))
    customer_dashboard.add_visualization(customer_table, position=(2, 0), size=(1, 2))
    
    # Prepare data for the dashboards
    
    # For the sales dashboard
    sales_data = {}
    
    # Aggregate sales by date for the line chart
    sales_by_date = sales_df.groupby("date").agg({"sales": "sum"}).reset_index()
    sales_data["sales_over_time"] = sales_by_date
    
    # Aggregate sales by category for the bar chart
    sales_by_category = sales_df.groupby("category").agg({"sales": "sum"}).reset_index()
    sales_data["sales_by_category"] = sales_by_category
    
    # Use the same data for the pie chart
    sales_data["sales_distribution"] = sales_by_category
    
    # Aggregate sales by product for the table
    sales_by_product = sales_df.groupby(["product_id", "product_name"]).agg({
        "sales": "sum",
        "revenue": "sum",
        "profit": "sum",
    }).reset_index().sort_values("revenue", ascending=False).head(10)
    sales_data["top_products"] = sales_by_product
    
    # Use the heatmap data
    sales_data["sales_by_day_and_hour"] = heatmap_df
    
    # For the customer dashboard
    customer_data = {}
    
    # Use the customer data for the scatter plot
    customer_data["age_vs_income"] = customer_df
    
    # Aggregate customers by segment for the pie chart
    customers_by_segment = customer_df.groupby("segment").size().reset_index(name="count")
    customer_data["customer_segments"] = customers_by_segment
    
    # Aggregate total spend by segment for the bar chart
    spend_by_segment = customer_df.groupby("segment").agg({"total_spend": "sum"}).reset_index()
    customer_data["spend_by_segment"] = spend_by_segment
    
    # Use the customer data for the table
    customer_data["customer_details"] = customer_df
    
    # Render the dashboards
    sales_dashboard_spec = manager.render_dashboard("sales_dashboard", sales_data)
    customer_dashboard_spec = manager.render_dashboard("customer_dashboard", customer_data)
    
    print("\nSales dashboard specification:")
    print(f"Number of visualizations: {len(sales_dashboard_spec['visualizations'])}")
    
    print("\nCustomer dashboard specification:")
    print(f"Number of visualizations: {len(customer_dashboard_spec['visualizations'])}")
    
    # Create a directory for the dashboards
    output_dir = "dashboards"
    os.makedirs(output_dir, exist_ok=True)
    
    # Save the dashboards as HTML files
    sales_dashboard.save_html(os.path.join(output_dir, "sales_dashboard.html"), sales_data)
    customer_dashboard.save_html(os.path.join(output_dir, "customer_dashboard.html"), customer_data)
    
    print(f"\nDashboards saved to {output_dir} directory")
    
    # List all dashboards
    print("\nAvailable dashboards:")
    print(manager.list_dashboards())

if __name__ == "__main__":
    main()

